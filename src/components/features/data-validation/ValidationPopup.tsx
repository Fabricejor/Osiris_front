"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
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
  Loader2
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
  niveauConfiance,
  type ChampAffiche,
} from '@/services/validation-mapping';
import { useAuthStore } from '@/store/authStore';

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

/** Badge « Gemini xx% » affiché à côté de chaque champ lu par l'OCR. */
function BadgeConfiance({ champ }: Readonly<{ champ: ChampAffiche }>) {
  if (champ.corrigeParHumain) {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
        Corrigé
      </span>
    );
  }
  const niveau = niveauConfiance(champ.confiance);
  let texte = `Gemini ${champ.confiance}%`;
  let titre = 'Score de confiance renvoyé par Gemini pour cette cellule';
  if (champ.confiance === null && champ.lu) {
    texte = 'Score inconnu';
    titre = "Gemini a lu une valeur mais n'a renvoyé aucun score de confiance : à vérifier";
  } else if (champ.confiance === null) {
    texte = champ.manquant ? 'Case vide' : 'Non lu';
    titre = "Aucune valeur lue par l'OCR pour ce champ";
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
  // Saisies du valideur : {id_donnee_extraite: {nom_champ: texte}} et {id_pii_cellule: texte}.
  const [saisiesCliniques, setSaisiesCliniques] = useState<Record<string, Record<string, string>>>({});
  const [saisiesPii, setSaisiesPii] = useState<Record<string, string>>({});

  const currentPage = pages[currentIndex];
  const pageId = currentPage?.id;

  // Données de la page affichée (et non de toute la session).
  const { data: clinicalData = [], isLoading: isLoadingClinical } = useQuery({
    queryKey: ['clinical-data', pageId],
    queryFn: async () => (await DonneesExtraitesService.getDonnees({ id_registre_scanne: pageId })).items,
    enabled: isOpen && canValidate && !!pageId,
  });

  const { data: piiData = [], isLoading: isLoadingPii } = useQuery({
    queryKey: ['pii-data', pageId],
    queryFn: async () => (await PiiCellulesService.getCellules({ id_registre_scanne: pageId })).items,
    enabled: isOpen && canValidate && !!pageId,
  });

  // Catalogue (libellés, ordre, unités des champs) du type de registre de la page.
  const { data: catalogue } = useQuery({
    queryKey: ['catalogue', currentPage?.type_registre, currentPage?.annee_version],
    queryFn: () => CataloguesService.getByTypeAnnee(currentPage!.type_registre, currentPage!.annee_version),
    enabled: isOpen && canValidate && !!currentPage,
    staleTime: 10 * 60 * 1000,
  });

  const lignes = [...clinicalData]
    .sort((a, b) => a.numero_ordre_ligne - b.numero_ordre_ligne)
    .map((donnee) => ({ donnee, champs: champsAffiches(donnee, catalogue) }));

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPageIndex);
    }
  }, [isOpen, initialPageIndex]);

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
        for (const { donnee, champs } of lignes) {
          if (donnee.valide) continue;
          const corrections = construireCorrections(champs, saisiesCliniques[donnee.id_donnee_extraite]);
          await DonneesExtraitesService.validerDonnee(donnee.id_donnee_extraite, corrections);
        }
        for (const pii of piiData) {
          const valeur = (saisiesPii[pii.id_pii_cellule] ?? pii.valeur_saisie ?? pii.valeur_lue ?? '').trim();
          if (valeur && valeur !== (pii.valeur_saisie ?? '')) {
            await PiiCellulesService.saisirCellule(pii.id_pii_cellule, valeur);
          }
        }
      }
      if (currentPage.status === 'A_VALIDER') {
        await SessionsService.validatePage(currentPage.id);
      }
    },
    onSuccess: () => {
      toast.success(language === 'fr' ? 'Page validée avec succès' : 'Page validated successfully');
      setSaisiesCliniques({});
      setSaisiesPii({});
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
  // Champs à vérifier en priorité (lignes pas encore validées uniquement) :
  // score Gemini faible, ou valeur lue sans aucun score (« Score inconnu »).
  const lignesAValider = lignes.filter(({ donnee }) => !donnee.valide);
  const champsFaibles = lignesAValider.reduce(
    (n, { champs }) => n + champs.filter((c) => niveauConfiance(c.confiance) === 'basse').length,
    0,
  );
  const champsScoreInconnu = lignesAValider.reduce(
    (n, { champs }) => n + champs.filter((c) => c.lu && c.confiance === null).length,
    0,
  );
  const detailsAVerifier = [
    champsFaibles ? `${champsFaibles} champ(s) à faible confiance` : null,
    champsScoreInconnu ? `${champsScoreInconnu} champ(s) à score inconnu` : null,
  ].filter(Boolean).join(' · ');

  if (!isOpen || !currentPage) return null;

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
            <PanelGroup orientation="horizontal" className="flex-1 w-full h-full">

              {/* ── LEFT PANEL — IMAGE VIEWER ──────────────── */}
              <Panel defaultSize={40} minSize={30} className="bg-[#1a1a2e] flex flex-col relative">

                <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                  <TransformWrapper
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
                            { action: () => zoomIn(), icon: ZoomIn, label: 'Zoom In' },
                            { action: () => zoomOut(), icon: ZoomOut, label: 'Zoom Out' },
                            { action: () => centerView(), icon: Maximize, label: 'Fit' },
                            { action: () => resetTransform(), icon: RotateCcw, label: 'Reset' },
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
                        </div>

                        {/* Confidence badge */}
                        <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border ${confidenceRing}`}>
                          <div className={`w-2 h-2 rounded-full ${confidenceBg}`} />
                          <span className={`text-xs font-bold ${confidenceColor}`}>
                            {currentPage.confidence}%
                          </span>
                        </div>

                        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="relative w-full h-full pointer-events-none p-4">
                            {currentPage.image && (
                              <Image
                                src={currentPage.image}
                                alt={currentPage.name}
                                fill
                                unoptimized
                                className="object-contain p-4"
                                priority
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
              <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-emerald-100 transition-colors flex flex-col justify-center items-center cursor-col-resize z-10">
                <div className="w-1 h-8 bg-gray-300 rounded-full" />
              </PanelResizeHandle>

              {/* ── RIGHT PANEL — FORM ─────────────────────── */}
              <Panel defaultSize={60} minSize={30} className="bg-white flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Record Validation</h2>
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
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-gray-100 bg-gray-50/50">
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
                <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'thin' }}>

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

                  {canValidate && activeTab === 'pii' && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        <User className="w-4 h-4" /> Patient Information (PII)
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        {language === 'fr'
                          ? "Recopiez chaque case d'après l'extrait d'image. La valeur pré-remplie est une lecture automatique à vérifier."
                          : 'Transcribe each cell from the image crop. Pre-filled values are automatic readings to check.'}
                      </p>

                      <div className="space-y-5">
                        {isLoadingPii && (
                          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                        )}
                        {!isLoadingPii && piiData.length === 0 && (
                          <div className="text-gray-500 text-center py-8">Aucune donnée PII pour cette page.</div>
                        )}
                        {!isLoadingPii && [...piiData]
                          .sort((a, b) => a.patient_index - b.patient_index || a.rang - b.rang)
                          .map((pii) => (
                            <div key={pii.id_pii_cellule} className="relative">
                              <div className="flex items-center justify-between mb-1 ml-4">
                                <label htmlFor={`pii-${pii.id_pii_cellule}`} className="text-xs font-bold text-gray-500">
                                  {pii.nom_champ ? pii.nom_champ.replace(/_/g, ' ') : pii.cell_id} · patient {pii.patient_index + 1}
                                </label>
                                {pii.saisie && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">Saisie</span>
                                )}
                                {!pii.saisie && pii.valeur_lue && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200">Pré-lu OCR</span>
                                )}
                              </div>
                              {/* eslint-disable-next-line @next/next/no-img-element -- URL présignée MinIO éphémère */}
                              <img
                                src={pii.crop_url}
                                alt={pii.nom_champ ?? pii.cell_id}
                                className="ml-4 mb-2 max-h-16 rounded border border-gray-200 bg-white object-contain"
                              />
                              <div className="flex items-center">
                                <div className={`w-1.5 h-10 ${pii.saisie ? 'bg-[#65b741]' : 'bg-yellow-400'} rounded-r-md absolute left-0 bottom-0`} />
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

                  {canValidate && activeTab === 'clinical' && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        <Activity className="w-4 h-4" /> Clinical Data
                      </h3>

                      <div className="space-y-6">
                        {isLoadingClinical && (
                          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#65b741]" /></div>
                        )}
                        {!isLoadingClinical && lignes.length === 0 && (
                          <div className="text-gray-500 text-center py-8">Aucune donnée clinique pour cette page.</div>
                        )}
                        {!isLoadingClinical && lignes.map(({ donnee, champs }) => {
                          const confiance = confianceLigne(champs);
                          const niveau = niveauConfiance(confiance);
                          const saisies = saisiesCliniques[donnee.id_donnee_extraite] ?? {};
                          return (
                            <div key={donnee.id_donnee_extraite} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-800">
                                  {language === 'fr' ? 'Ligne' : 'Row'} {donnee.numero_ordre_ligne}
                                  {donnee.valide && (
                                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                                      {donnee.categorie_rejet ? 'Rejetée' : 'Validée'}
                                    </span>
                                  )}
                                </h4>
                                <span
                                  title="Moyenne des scores de confiance Gemini des champs lus"
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${BADGE_CONFIANCE[niveau]}`}
                                >
                                  {confiance === null ? 'Confiance —' : `Confiance ${confiance}%`}
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
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">Modifié</span>
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
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {canValidate
                        ? `${aRevoir} élément(s) à valider${detailsAVerifier ? ` · ${detailsAVerifier}` : ''}`
                        : (language === 'fr' ? 'Validation de la page' : 'Page validation')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                      {t("save_draft")}
                    </button>
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
                      {t("validate_record")}
                    </button>
                  </div>
                </div>

              </Panel>
            </PanelGroup>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
