"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flag,
  EyeOff,
  ShieldAlert,
  Loader2,
  Crosshair
} from 'lucide-react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SessionsService, type PageView } from '@/services/sessions.service';
import { DonneesExtraitesService } from '@/services/donnees-extraites.service';
import { PiiCellulesService } from '@/services/pii-cellules.service';
import { CataloguesService } from '@/services/catalogues.service';
import {
  champsAffiches,
  confianceLigne,
  construireCorrections,
  libelleChamp,
  niveauConfiance,
  type ChampAffiche,
} from '@/services/validation-mapping';
import { useAuthStore } from '@/store/authStore';
import { construireGrille, elementsAVerifier, type DemandeZone, type ZoneImage } from '@/services/validation-mapping';
import RegistreGrid from './RegistreGrid';
import FichePatiente from './FichePatiente';
import RevueAVerifier from './RevueAVerifier';
import EcartsRegistre from './EcartsRegistre';
import { valeursNonRattachees } from '@/services/validation-mapping';

interface ValidationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pages: readonly PageView[];
  initialPageIndex: number;
  sessionId: string;
}

const BADGE_CONFIANCE = {
  basse: 'bg-red-100 text-red-700 border-red-200',
  moyenne: 'bg-amber-100 text-amber-700 border-amber-200',
  haute: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inconnue: 'bg-gray-100 text-gray-500 border-gray-200',
} as const;

const BARRE_CONFIANCE = {
  basse: 'bg-red-500',
  moyenne: 'bg-amber-400',
  haute: 'bg-[#65b741]',
  inconnue: 'bg-gray-300',
} as const;

/** Badge « xx % » (score de confiance de l'OCR) affiché à côté de chaque champ lu. */
function BadgeConfiance({ champ }: Readonly<{ champ: ChampAffiche }>) {
  const { t } = useTranslation();
  const alertes = champ.alertes.filter((a) => a.bloquante);
  if (alertes.length > 0 && !champ.corrigeParHumain) {
    return (
      <span
        title={alertes.map((a) => a.message).join('\n')}
        className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-red-100 text-red-700 border-red-200"
      >
        {t("badge_inconsistent")}
      </span>
    );
  }
  if (champ.corrigeParHumain) {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
        {t("badge_corrected")}
      </span>
    );
  }
  if (champ.deduit) {
    return (
      <span
        title={t("badge_deduced_title")}
        className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200"
      >
        {t("badge_deduced")}
      </span>
    );
  }
  const niveau = niveauConfiance(champ.confiance);
  let texte = `${champ.confiance}%`;
  let titre = t('confidence_cell_title');
  if (champ.confiance === null && champ.lu) {
    texte = t('score_unknown');
    titre = t('score_unknown_title');
  } else if (champ.confiance === null) {
    texte = champ.manquant ? t('empty_cell') : t('not_read');
    titre = t('not_read_title');
  }
  return (
    <span
      title={titre}
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${BADGE_CONFIANCE[niveau]}`}
    >
      {texte}
    </span>
  );
}

export default function ValidationPopup({ isOpen, onClose, pages, initialPageIndex, sessionId }: Readonly<ValidationPopupProps>) {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  // /donnees-extraites et /pii-cellules sont réservés aux valideurs médicaux
  // (403 pour un admin) : on ne les charge que pour ce rôle.
  const canValidate = useAuthStore((state) => state.user?.role === 'VALIDEUR_MEDICAL');
  const [currentIndex, setCurrentIndex] = useState(initialPageIndex);
  const [activeTab, setActiveTab] = useState<'clinical' | 'pii'>('clinical');
  // « fiche » : une patiente à la fois, visites en colonnes (image à gauche) ;
  // « registre » : tableau calqué sur le registre papier (image au-dessus) ;
  // « liste » : ancienne vue par ligne (image à gauche, onglets clinique/PII).
  // « verifier » : les cases douteuses une par une (Entrée = confirmer).
  // null = vue par défaut selon le registre (fiche pour CPN/CPON, registre sinon).
  const [vue, setVue] = useState<'verifier' | 'fiche' | 'registre' | 'liste' | null>(null);
  // Saisies du valideur : {id_donnee_extraite: {nom_champ: texte}} et {id_pii_cellule: texte}.
  const [saisiesCliniques, setSaisiesCliniques] = useState<Record<string, Record<string, string>>>({});
  const [saisiesPii, setSaisiesPii] = useState<Record<string, string>>({});
  // Cases confirmées telles quelles en mode « À vérifier » (clés `cleCellule`).
  const [revues, setRevues] = useState<Set<string>>(new Set());
  // Mode « Corriger » : déverrouille les valeurs déjà validées / saisies.
  const [modeCorrection, setModeCorrection] = useState(false);


  const currentPage = pages[currentIndex];
  const pageId = currentPage?.id;

  // ── Lien photo ↔ données ──
  // Zone survolée (surlignage) et zone « active » (focus : l'image est cadrée dessus),
  // en clés texte « ymin,xmin,ymax,xmax » pour ne re-rendre qu'en cas de vrai changement.
  const [zoneSurvol, setZoneSurvol] = useState<string | null>(null);
  const [zoneFocus, setZoneFocus] = useState<string | null>(null);
  const [suivreZones, setSuivreZones] = useState(true);
  const [imageNaturelle, setImageNaturelle] = useState<{ src: string; w: number; h: number } | null>(null);
  const [cadre, setCadre] = useState({ w: 0, h: 0 });
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const zoneFocusRef = useRef<HTMLDivElement>(null);
  const observateurCadre = useRef<ResizeObserver | null>(null);
  // Ref « callback » : le cadre de l'image est recréé quand la disposition change.
  const cadreRef = useCallback((el: HTMLDivElement | null) => {
    observateurCadre.current?.disconnect();
    if (!el) return;
    const mesurer = () => setCadre({ w: el.clientWidth, h: el.clientHeight });
    mesurer();
    observateurCadre.current = new ResizeObserver(mesurer);
    observateurCadre.current.observe(el);
  }, []);
  const onZone = useCallback((demande: DemandeZone | null) => {
    const cle = demande?.zone ? `${pageId}#${demande.zone.join(',')}` : null;
    if (demande?.zoom) {
      if (cle) setZoneFocus(cle);
    } else {
      setZoneSurvol(cle);
    }
  }, [pageId]);

  // Données de la page affichée (et non de toute la session).
  const { data: clinicalData = [], isLoading: isLoadingClinical } = useQuery({
    queryKey: ['clinical-data', pageId],
    // Toutes les lignes de la page (y compris validées / rejetées) : la page
    // s'affiche entière, et une valeur validée peut être corrigée.
    queryFn: () => DonneesExtraitesService.getToutesDeLaPage(pageId!),
    enabled: isOpen && canValidate && !!pageId,
  });

  const { data: piiData = [], isLoading: isLoadingPii } = useQuery({
    queryKey: ['pii-data', pageId],
    queryFn: () => PiiCellulesService.getToutesDeLaPage(pageId!),
    enabled: isOpen && canValidate && !!pageId,
  });

  // Catalogue (libellés, ordre, unités des champs) du type de registre de la page.
  const { data: catalogue, isLoading: isLoadingCatalogue, isError: catalogueEnErreur } = useQuery({
    queryKey: ['catalogue', currentPage?.type_registre, currentPage?.annee_version],
    queryFn: () => CataloguesService.getByTypeAnnee(currentPage!.type_registre, currentPage!.annee_version),
    enabled: isOpen && canValidate && !!currentPage,
    staleTime: 10 * 60 * 1000,
  });

  const grille = construireGrille(catalogue, clinicalData, piiData);
  const modifierClinique = (idDonnee: string, nomChamp: string, valeur: string) =>
    setSaisiesCliniques((prev) => ({ ...prev, [idDonnee]: { ...prev[idDonnee], [nomChamp]: valeur } }));
  const modifierPii = (idPii: string, valeur: string) =>
    setSaisiesPii((prev) => ({ ...prev, [idPii]: valeur }));
  const saisies = { cliniques: saisiesCliniques, pii: saisiesPii, revues, correction: modeCorrection };
  const confirmerCase = useCallback((cle: string) => setRevues((prev) => new Set(prev).add(cle)), []);
  // Cases encore douteuses (après corrections et confirmations du valideur).
  const nbAVerifier = elementsAVerifier(grille, saisies).length;
  const vueEffective = vue ?? (grille.rangsParPatient > 1 ? 'fiche' : 'registre');
  // Vues tableau (fiche, registre) : clinique + PII ensemble, sans onglets.
  const vueTableau = canValidate && vueEffective !== 'liste';
  // Registre : tableau large → image au-dessus plutôt qu'à côté.
  const vueRegistre = canValidate && vueEffective === 'registre';
  const lignesNonRattachees = clinicalData
    .map((donnee) => ({
      numeroOrdre: donnee.numero_ordre_ligne,
      rang: donnee.rang ?? 1,
      valeurs: valeursNonRattachees(donnee),
    }))
    .filter((l) => Object.keys(l.valeurs).length > 0)
    .sort((a, b) => a.numeroOrdre - b.numeroOrdre || a.rang - b.rang);

  const lignes = [...clinicalData]
    .sort((a, b) => a.numero_ordre_ligne - b.numero_ordre_ligne || (a.rang ?? 1) - (b.rang ?? 1))
    .map((donnee) => ({ donnee, champs: champsAffiches(donnee, catalogue) }));

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPageIndex);
    }
  }, [isOpen, initialPageIndex]);

  // Zones mémorisées avec leur page (« page#ymin,xmin,ymax,xmax ») : une zone
  // d'une autre page est ignorée, sans effet de remise à zéro.
  const zoneDeLaPage = (z: string | null) => (z?.startsWith(`${pageId}#`) ? z.slice(`${pageId}#`.length) : null);
  const zoneFocusPage = zoneDeLaPage(zoneFocus);
  const zoneSurvolPage = zoneDeLaPage(zoneSurvol);

  // Rectangle occupé par la photo dans son cadre (object-contain + p-4 de l'<Image>).
  const rectImage = (() => {
    if (!imageNaturelle || imageNaturelle.src !== currentPage?.image || !cadre.w || !cadre.h) return null;
    const marge = 16;
    const w = cadre.w - 2 * marge;
    const h = cadre.h - 2 * marge;
    if (w <= 0 || h <= 0) return null;
    const k = Math.min(w / imageNaturelle.w, h / imageNaturelle.h);
    const largeur = imageNaturelle.w * k;
    const hauteur = imageNaturelle.h * k;
    return { left: marge + (w - largeur) / 2, top: marge + (h - hauteur) / 2, width: largeur, height: hauteur };
  })();
  const styleZone = (cle: string | null): React.CSSProperties | null => {
    if (!cle || !rectImage) return null;
    const [ymin, xmin, ymax, xmax] = cle.split(',').map(Number) as ZoneImage;
    return {
      left: rectImage.left + (xmin / 1000) * rectImage.width,
      top: rectImage.top + (ymin / 1000) * rectImage.height,
      width: ((xmax - xmin) / 1000) * rectImage.width,
      height: ((ymax - ymin) / 1000) * rectImage.height,
    };
  };
  const imagePrete = rectImage !== null;

  // Zone active : on cadre la photo dessus (désactivable par le bouton « Suivre »).
  useEffect(() => {
    if (!zoneFocusPage || !suivreZones || !imagePrete || !zoneFocusRef.current) return;
    transformRef.current?.zoomToElement(zoneFocusRef.current, 2, 300);
  }, [zoneFocusPage, suivreZones, imagePrete]);

  // Hook déclaré AVANT tout return conditionnel (règle des hooks React) :
  // sinon l'ouverture du popup change le nombre de hooks et React plante.
  //
  // « Valider » enregistre, dans l'ordre : chaque ligne clinique (avec les
  // seules corrections saisies), chaque cellule PII renseignée, puis la page
  // si elle est encore « À valider ».
  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!currentPage) return;
      if (canValidate) {
        // La page n'est validée qu'avec TOUTES ses données personnelles : on
        // refuse avant d'envoyer quoi que ce soit (pas de validation partielle).
        // Exception : patiente dont toutes les lignes ont été rejetées.
        const numerosRejetes = new Set(
          [...new Set(lignes.map(({ donnee }) => donnee.numero_ordre_ligne))].filter((n) =>
            lignes.filter(({ donnee }) => donnee.numero_ordre_ligne === n).every(({ donnee }) => !!donnee.categorie_rejet),
          ),
        );
        const piiVides = piiData.filter(
          (pii) =>
            !pii.saisie &&
            !numerosRejetes.has(pii.patient_index + 1) &&
            !(saisiesPii[pii.id_pii_cellule] ?? pii.valeur_lue ?? '').trim(),
        );
        if (piiVides.length > 0) {
          const qui = [...new Set(piiVides.map((p) => `N° ${p.patient_index + 1}`))].join(', ');
          throw new Error(
            language === 'fr'
              ? `${piiVides.length} donnée(s) personnelle(s) vide(s) à saisir avant de valider (${qui}).`
              : `${piiVides.length} empty personal field(s) to fill in before validating (${qui}).`,
          );
        }
        // Lignes à valider : UN seul appel pour toute la page (tout ou rien), au
        // lieu d'un POST par ligne. Seules les lignes corrigées sont nommées ;
        // `inclure_restantes` accepte les autres telles que lues par l'OCR.
        const aValiderCorrigees: { id_donnee_extraite: string; corrections: Record<string, unknown> }[] = [];
        let resteAValider = false;
        for (const { donnee, champs } of lignes) {
          const corrections = construireCorrections(champs, saisiesCliniques[donnee.id_donnee_extraite]);
          if (!donnee.valide) {
            if (Object.keys(corrections).length > 0) {
              aValiderCorrigees.push({ id_donnee_extraite: donnee.id_donnee_extraite, corrections });
            } else {
              resteAValider = true;
            }
          } else if (!donnee.categorie_rejet && Object.keys(corrections).length > 0) {
            // Mode « Corriger » : ligne déjà validée, seuls les champs modifiés.
            await DonneesExtraitesService.corrigerDonnee(donnee.id_donnee_extraite, corrections);
          }
        }
        if (aValiderCorrigees.length > 0 || resteAValider) {
          await DonneesExtraitesService.validerLot(currentPage.id, aValiderCorrigees, resteAValider);
        }
        for (const pii of piiData) {
          const valeur = (saisiesPii[pii.id_pii_cellule] ?? pii.valeur_saisie ?? pii.valeur_lue ?? '').trim();
          if (!valeur || valeur === (pii.valeur_saisie ?? '')) continue;
          if (pii.saisie) await PiiCellulesService.corrigerCellule(pii.id_pii_cellule, valeur);
          else await PiiCellulesService.saisirCellule(pii.id_pii_cellule, valeur);
        }
      }
      // Quand tout est traité (lignes ET données personnelles), le backend passe
      // lui-même la page en VALIDE (puis la session). Rappeler /pages/{id}/validate
      // renverrait un 409 : on ne le fait que pour une page sans rien d'extrait.
      if (lignes.length === 0 && piiData.length === 0 && currentPage.status === 'A_VALIDER') {
        await SessionsService.validatePage(currentPage.id);
      }
    },
    onSuccess: () => {
      toast.success(
        modeCorrection
          ? (language === 'fr' ? 'Corrections enregistrées' : 'Corrections saved')
          : (language === 'fr' ? 'Page validée avec succès' : 'Page validated successfully'),
      );
      setSaisiesCliniques({});
      setSaisiesPii({});
      setRevues(new Set());
      setModeCorrection(false);
      queryClient.invalidateQueries({ queryKey: ['clinical-data', pageId] });
      queryClient.invalidateQueries({ queryKey: ['pii-data', pageId] });
      queryClient.invalidateQueries({ queryKey: ['sessions-table'] });
      queryClient.invalidateQueries({ queryKey: ['session-pages', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['pages-queue'] });

      if (currentIndex < pages.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    },
    onError: (err: any) => {
      toast.error(err.message || (language === 'fr' ? 'Erreur lors de la validation' : 'Error during validation'));
      // Une partie a pu être enregistrée avant l'erreur : on recharge l'état réel.
      queryClient.invalidateQueries({ queryKey: ['clinical-data', pageId] });
      queryClient.invalidateQueries({ queryKey: ['pii-data', pageId] });
    }
  });

  const aRevoir =
    lignes.filter(({ donnee }) => !donnee.valide).length + piiData.filter((p) => !p.saisie).length;
  // Lignes validées (non rejetées) et PII saisies : corrigeables en mode « Corriger ».
  const dejaTraitees =
    lignes.filter(({ donnee }) => donnee.valide && !donnee.categorie_rejet).length + piiData.filter((p) => p.saisie).length;
  // Champs à vérifier en priorité (lignes pas encore validées uniquement) :
  // score Gemini faible, ou valeur lue sans aucun score (« Score inconnu »).
  // Cases douteuses restantes (score < 80 %, inconnu, ou alerte) : baisse au fil
  // des corrections et confirmations.
  const detailsAVerifier = nbAVerifier
    ? (language === 'fr' ? `${nbAVerifier} case(s) à vérifier` : `${nbAVerifier} cell(s) to check`)
    : '';

  if (!isOpen || !currentPage) return null;

  // Page déjà validée / rejetée : plus de bouton « Valider » (seulement
  // « Enregistrer les corrections » en mode Corriger).
  const pageTerminee = currentPage.status === 'VALIDE' || currentPage.status === 'REJETEE';

  const confidenceColor = currentPage.confidence < 80 ? 'text-red-500' : 'text-emerald-600';
  const confidenceBg = currentPage.confidence < 80 ? 'bg-red-500' : 'bg-emerald-500';
  const confidenceRing = currentPage.confidence < 80 ? 'border-red-200' : 'border-emerald-200';

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <PanelGroup
              key={vueRegistre ? 'registre' : 'liste'}
              orientation={vueRegistre ? 'vertical' : 'horizontal'}
              className="flex-1 w-full h-full"
            >

              {/* ── IMAGE VIEWER (gauche en vue liste, haut en vue registre) ── */}
              <Panel defaultSize={vueRegistre ? 42 : 40} minSize={vueRegistre ? 20 : 30} className="bg-[#1a1a2e] flex flex-col relative">

                <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                  <TransformWrapper
                    ref={transformRef}
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                  >
                    {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                      <>
                        {/* Zoom controls */}
                        <div className="absolute top-4 left-4 z-10 flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 text-gray-300 gap-0.5">
                          {[
                            { action: () => zoomIn(), icon: ZoomIn, label: t('zoom_in') },
                            { action: () => zoomOut(), icon: ZoomOut, label: t('zoom_out') },
                            { action: () => centerView(), icon: Maximize, label: t('zoom_fit') },
                            { action: () => resetTransform(), icon: RotateCcw, label: t('zoom_reset') },
                          ].map(({ action, icon: Icon, label }) => (
                            <button
                              key={label}
                              onClick={action}
                              className="p-2 hover:bg-white/15 rounded-lg transition-colors group/btn"
                              title={label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                          <button
                            onClick={() => setSuivreZones((v) => !v)}
                            aria-pressed={suivreZones}
                            className={`p-2 rounded-lg transition-colors ${suivreZones ? 'bg-emerald-500/30 text-emerald-200' : 'hover:bg-white/15'}`}
                            title={language === 'fr'
                              ? 'Cadrer la photo sur la ligne en cours de saisie (si l’OCR a fourni sa position)'
                              : 'Frame the photo on the row being edited (when OCR provided its position)'}
                          >
                            <Crosshair className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Confidence badge */}
                        <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border ${confidenceRing}`}>
                          <div className={`w-2 h-2 rounded-full ${confidenceBg}`} />
                          <span className={`text-xs font-bold ${confidenceColor}`}>
                            {currentPage.confidence}%
                          </span>
                        </div>

                        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div ref={cadreRef} className="relative w-full h-full pointer-events-none p-4">
                            {currentPage.image && (
                              <Image
                                src={currentPage.image}
                                alt={currentPage.name}
                                fill
                                unoptimized
                                className="object-contain p-4"
                                priority
                                onLoad={(e) => {
                                  const img = e.currentTarget;
                                  setImageNaturelle({ src: currentPage.image, w: img.naturalWidth, h: img.naturalHeight });
                                }}
                              />
                            )}
                            {/* Ligne en cours (cadrée) et ligne survolée, d'après la position renvoyée par l'OCR. */}
                            {styleZone(zoneFocusPage) && (
                              <div
                                ref={zoneFocusRef}
                                className="absolute rounded-sm border-2 border-emerald-400 bg-emerald-300/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]"
                                style={styleZone(zoneFocusPage)!}
                              />
                            )}
                            {zoneSurvolPage !== zoneFocusPage && styleZone(zoneSurvolPage) && (
                              <div
                                className="absolute rounded-sm border-2 border-amber-400 bg-amber-300/20"
                                style={styleZone(zoneSurvolPage)!}
                              />
                            )}
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>

                {/* Bottom Navigation */}
                <div className="h-14 bg-[#141425] border-t border-white/10 flex items-center justify-center gap-3 text-white px-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {pages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-emerald-400 w-4' : 'bg-white/30 hover:bg-white/50'
                          }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === pages.length - 1}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="ml-auto text-[11px] font-semibold text-gray-400">
                    {currentPage.name} · {currentIndex + 1}/{pages.length}
                  </div>
                </div>
              </Panel>

              {/* ── RESIZE HANDLE ──────────────────────────── */}
              <PanelResizeHandle
                className={`bg-gray-100 hover:bg-emerald-100 transition-colors flex justify-center items-center z-10 ${vueRegistre ? 'h-2 flex-row cursor-row-resize' : 'w-2 flex-col cursor-col-resize'}`}
              >
                <div className={`bg-gray-300 rounded-full ${vueRegistre ? 'h-1 w-8' : 'w-1 h-8'}`} />
              </PanelResizeHandle>

              {/* ── FORM (droite en vue liste, bas en vue registre) ── */}
              <Panel defaultSize={vueRegistre ? 58 : 60} minSize={30} className="bg-white flex flex-col min-h-0">

                {/* Header */}
                <div className={`${vueRegistre ? 'px-6 py-3' : 'p-6'} border-b border-gray-100 flex items-start justify-between shrink-0`}>
                  <div>
                    <h2 className={`${vueRegistre ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 mb-1`}>{t("record_validation")}</h2>
                    <p className="text-sm text-gray-500">{currentPage.name} • {currentPage.id_session_scan}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Confidence indicator */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("confidence")}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${confidenceColor}`}>
                          {currentPage.confidence}%
                        </span>
                        <div className={`w-7 h-7 rounded-full border-2 ${confidenceRing} flex items-center justify-center`}>
                          <div className={`w-3.5 h-3.5 rounded-full ${confidenceBg}`} />
                        </div>
                      </div>
                    </div>
                    {canValidate && dejaTraitees > 0 && (
                      <button
                        onClick={() => setModeCorrection((v) => !v)}
                        aria-pressed={modeCorrection}
                        title={language === 'fr'
                          ? 'Rendre modifiables les valeurs déjà validées (chaque correction est tracée)'
                          : 'Make already validated values editable (each correction is logged)'}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${modeCorrection ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {modeCorrection
                          ? (language === 'fr' ? 'Correction en cours' : 'Correcting')
                          : (language === 'fr' ? 'Corriger' : 'Correct')}
                      </button>
                    )}
                    {canValidate && (
                      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-bold" role="group" aria-label={t("layout")}>
                        {([
                          ['verifier', `${language === 'fr' ? 'À vérifier' : 'To check'}${nbAVerifier ? ` (${nbAVerifier})` : ''}`],
                          ['fiche', language === 'fr' ? 'Fiche patiente' : 'Patient sheet'],
                          ['registre', language === 'fr' ? 'Registre' : 'Register'],
                          ['liste', language === 'fr' ? 'Liste' : 'List'],
                        ] as const).map(([cle, libelle]) => (
                          <button
                            key={cle}
                            onClick={() => setVue(cle)}
                            aria-pressed={vueEffective === cle}
                            className={`px-3 py-1.5 rounded-md transition-colors ${vueEffective === cle ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {libelle}
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs (vue liste uniquement : fiche et registre montrent clinique + PII ensemble) */}
                <div className={`${vueTableau ? 'hidden' : 'flex'} px-6 border-b border-gray-100 bg-gray-50/50`}>
                  <button
                    onClick={() => setActiveTab('clinical')}
                    className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'clinical' ? 'border-[#65b741] text-[#65b741]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <Activity className="w-4 h-4" />
                    Clinical Data
                  </button>
                  <button
                    onClick={() => setActiveTab('pii')}
                    className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pii' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    PII Data
                    {piiData.filter((p) => !p.saisie).length > 0 && (
                      <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">
                        {piiData.filter((p) => !p.saisie).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Form Scrollable Content */}
                <div className={`flex-1 min-h-0 overflow-y-auto ${vueTableau ? 'p-4 space-y-4' : 'p-8 space-y-8'}`} style={{ scrollbarWidth: 'thin' }}>

                  {modeCorrection && (
                    <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-[13px] text-blue-800">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      {language === 'fr'
                        ? 'Mode correction : les valeurs déjà validées sont modifiables. Chaque correction est tracée (avant / après) ; les exports déjà générés ne changent pas, les suivants prendront la correction.'
                        : 'Correction mode: validated values are editable. Each correction is logged (before / after); existing exports do not change, later ones will include it.'}
                    </div>
                  )}

                  <EcartsRegistre
                    controle={currentPage.controleEntetes}
                    lignesNonRattachees={canValidate ? lignesNonRattachees : []}
                    libelleChamp={(nom) => libelleChamp(catalogue, nom)}
                    multiVisites={grille.rangsParPatient > 1}
                    language={language}
                  />

                  {vueTableau && (
                    <>
                      {(isLoadingClinical || isLoadingPii || isLoadingCatalogue) && (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#65b741]" /></div>
                      )}
                      {catalogueEnErreur && (
                        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                          {language === 'fr'
                            ? 'Catalogue du registre introuvable : impossible de reconstituer les colonnes du registre.'
                            : 'Register catalogue not found: register columns cannot be rebuilt.'}
                        </div>
                      )}
                      {!isLoadingClinical && !isLoadingPii && !isLoadingCatalogue && !catalogueEnErreur && (
                        <>
                          {vueEffective === 'verifier' && (
                            <RevueAVerifier
                              key={pageId}
                              grille={grille}
                              saisies={saisies}
                              onChangeClinique={modifierClinique}
                              onChangePii={modifierPii}
                              onConfirmer={confirmerCase}
                              language={language}
                              onZone={onZone}
                            />
                          )}
                          {vueEffective === 'fiche' && (
                            <FichePatiente
                              key={pageId}
                              grille={grille}
                              saisies={saisies}
                              onChangeClinique={modifierClinique}
                              onChangePii={modifierPii}
                              language={language}
                              onZone={onZone}
                            />
                          )}
                          {vueEffective === 'registre' && (
                            <RegistreGrid
                              key={pageId}
                              grille={grille}
                              saisies={saisies}
                              onChangeClinique={modifierClinique}
                              onChangePii={modifierPii}
                              language={language}
                              onZone={onZone}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}

                  {!canValidate && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>
                        {language === 'fr'
                          ? "La saisie des données cliniques et PII est réservée aux valideurs médicaux. Vous pouvez consulter l'image et valider ou rejeter la page."
                          : 'Clinical and PII data entry is restricted to medical validators. You can view the image and validate or reject the page.'}
                      </p>
                    </div>
                  )}

                  {canValidate && !vueTableau && activeTab === 'pii' && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        <User className="w-4 h-4" /> Patient Information (PII)
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        {language === 'fr'
                          ? "Valeurs pré-remplies automatiquement (avec leur score de confiance) : vérifiez-les sur l'image de la page, corrigez si besoin, puis validez."
                          : 'Automatically pre-filled values (with their confidence score): check them against the page image, correct if needed, then validate.'}
                      </p>

                      <div className="space-y-5">
                        {isLoadingPii && (
                          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                        )}
                        {!isLoadingPii && piiData.length === 0 && (
                          <div className="text-gray-500 text-center py-8">{t("no_pii_for_page")}</div>
                        )}
                        {!isLoadingPii && [...piiData]
                          .sort((a, b) => a.patient_index - b.patient_index || a.rang - b.rang)
                          .map((pii) => (
                            <div key={pii.id_pii_cellule} className="relative">
                              <div className="flex items-center justify-between mb-1 ml-4">
                                <label htmlFor={`pii-${pii.id_pii_cellule}`} className="text-xs font-bold text-gray-500">
                                  {pii.nom_champ ? libelleChamp(catalogue, pii.nom_champ) : pii.cell_id} · {language === 'fr' ? 'ligne' : 'row'} {pii.patient_index + 1}
                                </label>
                                {pii.saisie ? (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">{t("entered")}</span>
                                ) : (
                                  <BadgeConfiance
                                    champ={{
                                      nom: pii.nom_champ ?? pii.cell_id,
                                      libelle: '',
                                      type_champ: 'TEXTE',
                                      unite: null,
                                      valeur: pii.valeur_lue ?? '',
                                      lu: !!pii.valeur_lue,
                                      confiance:
                                        typeof pii.score_confiance === 'number' ? Math.round(pii.score_confiance * 100) : null,
                                      corrigeParHumain: false,
                                      deduit: false,
                                      manquant: !pii.valeur_lue,
                                      alertes: [],
                                      raisons: null,
                                    }}
                                  />
                                )}
                              </div>
                              {pii.crop_url && (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element -- URL présignée MinIO éphémère */}
                                  <img
                                    src={pii.crop_url}
                                    alt={pii.nom_champ ?? pii.cell_id}
                                    className="ml-4 mb-2 max-h-16 rounded border border-gray-200 bg-white object-contain"
                                  />
                                </>
                              )}
                              <div className="flex items-center">
                                <div className={`w-1.5 h-10 ${pii.saisie ? 'bg-[#65b741]' : BARRE_CONFIANCE[niveauConfiance(typeof pii.score_confiance === 'number' ? Math.round(pii.score_confiance * 100) : null)]} rounded-r-md absolute left-0 bottom-0`} />
                                <input
                                  id={`pii-${pii.id_pii_cellule}`}
                                  type="text"
                                  value={saisiesPii[pii.id_pii_cellule] ?? pii.valeur_saisie ?? pii.valeur_lue ?? ''}
                                  onChange={(e) => setSaisiesPii((prev) => ({ ...prev, [pii.id_pii_cellule]: e.target.value }))}
                                  className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}

                  {canValidate && !vueTableau && activeTab === 'clinical' && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        <Activity className="w-4 h-4" /> Clinical Data
                      </h3>

                      <div className="space-y-6">
                        {(isLoadingClinical || isLoadingCatalogue) && (
                          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#65b741]" /></div>
                        )}
                        {catalogueEnErreur && (
                          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                            {language === 'fr'
                              ? 'Catalogue du registre introuvable : impossible de distinguer les champs cliniques des PII.'
                              : 'Register catalogue not found: clinical and PII fields cannot be told apart.'}
                          </div>
                        )}
                        {!isLoadingClinical && !isLoadingCatalogue && !catalogueEnErreur && lignes.length === 0 && (
                          <div className="text-gray-500 text-center py-8">{t("no_clinical_for_page")}</div>
                        )}
                        {!isLoadingClinical && !isLoadingCatalogue && lignes.map(({ donnee, champs }) => {
                          const confiance = confianceLigne(champs);
                          const niveau = niveauConfiance(confiance);
                          const saisies = saisiesCliniques[donnee.id_donnee_extraite] ?? {};
                          return (
                            <div key={donnee.id_donnee_extraite} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-800">
                                  {language === 'fr' ? 'Ligne' : 'Row'} {donnee.numero_ordre_ligne}
                                  {grille.rangsParPatient > 1 && ` · ${language === 'fr' ? 'visite' : 'visit'} ${donnee.rang ?? 1}`}
                                  {donnee.valide && (
                                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                                      {donnee.categorie_rejet ? t('row_rejected') : t('row_validated')}
                                    </span>
                                  )}
                                </h4>
                                <span
                                  title={t("avg_confidence_title")}
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${BADGE_CONFIANCE[niveau]}`}
                                >
                                  {confiance === null ? t('confidence_none') : t('confidence_value', { value: confiance })}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {champs.map((champ) => {
                                  const n = niveauConfiance(champ.confiance);
                                  const saisi = saisies[champ.nom];
                                  const modifie = saisi !== undefined && saisi.trim() !== champ.valeur.trim();
                                  const inputId = `${donnee.id_donnee_extraite}-${champ.nom}`;
                                  return (
                                    <div key={champ.nom} className="relative">
                                      <div className="flex items-center justify-between gap-2 mb-1 ml-3">
                                        <label htmlFor={inputId} className="text-xs font-bold text-gray-500 truncate" title={champ.nom}>
                                          {champ.libelle}{champ.unite ? ` (${champ.unite})` : ''}
                                        </label>
                                        {modifie ? (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">{t("edited")}</span>
                                        ) : (
                                          <BadgeConfiance champ={champ} />
                                        )}
                                      </div>
                                      <div className="flex items-center">
                                        <div className={`w-1 h-9 ${BARRE_CONFIANCE[n]} rounded-r-md absolute left-0 bottom-0`} />
                                        <input
                                          id={inputId}
                                          type="text"
                                          value={saisi ?? champ.valeur}
                                          disabled={donnee.valide}
                                          placeholder={champ.manquant ? (language === 'fr' ? 'Case vide' : 'Empty cell') : ''}
                                          onChange={(e) =>
                                            setSaisiesCliniques((prev) => ({
                                              ...prev,
                                              [donnee.id_donnee_extraite]: {
                                                ...prev[donnee.id_donnee_extraite],
                                                [champ.nom]: e.target.value,
                                              },
                                            }))
                                          }
                                          className={`w-full ml-3 pl-3 pr-3 py-1.5 border rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 ${n === 'basse' && !modifie ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Padding for sticky footer */}
                  <div className="h-10" />
                </div>

                {/* Sticky Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                  {pageTerminee && !modeCorrection ? (
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${currentPage.status === 'VALIDE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {currentPage.status === 'VALIDE'
                          ? (language === 'fr' ? 'Page déjà validée' : 'Page already validated')
                          : (language === 'fr' ? 'Page rejetée' : 'Page rejected')}
                      </span>
                      {canValidate && dejaTraitees > 0 && (
                        <span className="text-xs text-gray-500">
                          {language === 'fr'
                            ? 'Une erreur ? Utilisez « Corriger » en haut à droite.'
                            : 'Spotted an error? Use "Correct" at the top right.'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Flag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">
                        {modeCorrection && pageTerminee
                          ? (language === 'fr' ? 'Correction de données validées' : 'Correcting validated data')
                          : canValidate
                            ? `${aRevoir} élément(s) à valider${detailsAVerifier ? ` · ${detailsAVerifier}` : ''}`
                            : (language === 'fr' ? 'Validation de la page' : 'Page validation')}
                      </span>
                    </div>
                  )}

                  {(!pageTerminee || modeCorrection) && (
                    <div className="flex items-center gap-3">
                      {!modeCorrection && (
                        <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                          {t("save_draft")}
                        </button>
                      )}
                      <button
                        onClick={() => validateMutation.mutate()}
                        disabled={validateMutation.isPending}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {modeCorrection && (pageTerminee || aRevoir === 0)
                          ? (language === 'fr' ? 'Enregistrer les corrections' : 'Save corrections')
                          : t("validate_record")}
                      </button>
                    </div>
                  )}
                </div>

              </Panel>
            </PanelGroup>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
