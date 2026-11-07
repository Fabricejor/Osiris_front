"use client";

/**
 * Catalogue d'un registre : consultation, et modification champ par champ
 * (libellé, alias = variantes d'intitulé rencontrées sur les registres
 * terrain, modalités).
 *
 * Lecture compacte par défaut ; « Modifier » ouvre un panneau d'édition pour
 * UN champ à la fois (Annuler / Enregistrer bien visibles). Recherche et
 * sections repliables pour les gros catalogues (CPN : 60+ champs).
 *
 * Les alias sont donnés à l'OCR pour reconnaître une colonne dont l'en-tête
 * diffère du registre de référence (« H U », « Prestataire »…). La structure
 * (ajout/suppression de champ, type, PII) n'est pas modifiable ici.
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { CataloguesService, type ChampCatalogueUpdate } from '@/services/catalogues.service';
import type { components } from '@/types/api.generated';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/translations';

type ChampCatalogue = components['schemas']['ChampCatalogue'];

const TYPES_A_MODALITES = new Set(['CATEGORIELLE', 'CATEGORIELLE_MULTI', 'BINAIRE']);
/** Au-delà, les modalités sont résumées en lecture (« +N »). */
const MODALITES_VISIBLES = 6;

const LIBELLE_TYPE: Record<string, TranslationKey> = {
  TEXTE: 'type_texte',
  NOMBRE: 'type_nombre',
  DATE: 'type_date',
  HEURE: 'type_heure',
  BINAIRE: 'type_binaire',
  CATEGORIELLE: 'type_categorielle',
  CATEGORIELLE_MULTI: 'type_categorielle_multi',
  TENSION_ARTERIELLE: 'type_tension',
};

function aliasDe(champ: ChampCatalogue): string[] {
  const alias = (champ.contraintes as { alias?: unknown } | undefined)?.alias;
  return Array.isArray(alias) ? alias.filter((a): a is string => typeof a === 'string') : [];
}

function estDeduit(champ: ChampCatalogue): boolean {
  return Boolean((champ.contraintes as { deduit_du_rang?: boolean } | undefined)?.deduit_du_rang);
}

function memesListes(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function sansAccents(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function correspond(champ: ChampCatalogue, recherche: string): boolean {
  if (!recherche) return true;
  const q = sansAccents(recherche);
  return [champ.libelle, champ.nom, ...aliasDe(champ)].some((t) => sansAccents(t).includes(q));
}

// ─── Petits éléments d'affichage ────────────────────────────────────────────

function Etiquette({ children, couleur = 'bg-gray-100 text-gray-700' }: Readonly<{ children: React.ReactNode; couleur?: string }>) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${couleur}`}>{children}</span>;
}

function MetaChamp({ champ }: Readonly<{ champ: ChampCatalogue }>) {
  const { t } = useTranslation();
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
      <code className="rounded bg-gray-50 px-1 text-gray-500">{champ.nom}</code>
      <span>{LIBELLE_TYPE[champ.type_champ] ? t(LIBELLE_TYPE[champ.type_champ]) : champ.type_champ}</span>
      {champ.unite && <span>· {champ.unite}</span>}
      {champ.is_pii && (
        <span className="inline-flex items-center gap-0.5 rounded bg-purple-50 px-1 text-purple-700">
          <ShieldAlert className="w-3 h-3" /> {t("personal_data")}
        </span>
      )}
      {champ.niveau_patiente && <span className="rounded bg-blue-50 px-1 text-blue-700">{t("once_per_patient")}</span>}
      {estDeduit(champ) && <span className="rounded bg-slate-100 px-1 text-slate-600">{t("deduced_from_row")}</span>}
    </div>
  );
}

/** Saisie d'une liste de valeurs sous forme d'étiquettes (alias, modalités). */
function EditeurEtiquettes({
  valeurs,
  onChange,
  placeholder,
  id,
}: Readonly<{ valeurs: string[]; onChange: (v: string[]) => void; placeholder: string; id: string }>) {
  const { t } = useTranslation();
  const [saisie, setSaisie] = useState('');
  const ajouter = () => {
    const v = saisie.trim();
    if (v && !valeurs.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...valeurs, v]);
    setSaisie('');
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 focus-within:border-[#65b741] focus-within:ring-1 focus-within:ring-[#65b741]/30">
      {valeurs.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          {v}
          <button
            type="button"
            aria-label={t('remove_value', { value: v })}
            onClick={() => onChange(valeurs.filter((x) => x !== v))}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            ajouter();
          } else if (e.key === 'Backspace' && !saisie && valeurs.length) {
            onChange(valeurs.slice(0, -1));
          }
        }}
        onBlur={ajouter}
        placeholder={placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
      />
      <button
        type="button"
        onClick={ajouter}
        disabled={!saisie.trim()}
        aria-label={t("add")}
        className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold text-[#08704F] hover:bg-emerald-50 disabled:opacity-30"
      >
        <Plus className="w-3.5 h-3.5" /> {t("add")}
      </button>
    </div>
  );
}

// ─── Un champ : lecture compacte ou panneau d'édition ──────────────────────

function LigneChamp({
  champ,
  enEdition,
  ouvrir,
  fermer,
  enregistrer,
  enCours,
  lectureSeule,
}: Readonly<{
  champ: ChampCatalogue;
  enEdition: boolean;
  ouvrir: () => void;
  fermer: () => void;
  enregistrer: (nom: string, modification: ChampCatalogueUpdate) => void;
  enCours: boolean;
  /** Admin de structure : consultation seulement (édition réservée au superadmin). */
  lectureSeule: boolean;
}>) {
  const { t } = useTranslation();
  const aliasInitiaux = aliasDe(champ);
  const modalitesInitiales = champ.modalites ?? [];
  const [libelle, setLibelle] = useState(champ.libelle);
  const [alias, setAlias] = useState(aliasInitiaux);
  const [modalites, setModalites] = useState<string[]>(modalitesInitiales);
  const [toutesModalites, setToutesModalites] = useState(false);

  const deduit = estDeduit(champ);
  const aModalites = TYPES_A_MODALITES.has(champ.type_champ);

  const modification: ChampCatalogueUpdate = {};
  if (libelle.trim() !== champ.libelle) modification.libelle = libelle.trim();
  if (!memesListes(alias, aliasInitiaux)) modification.alias = alias;
  if (aModalites && !deduit && !memesListes(modalites, modalitesInitiales)) modification.modalites = modalites;
  const modifie = Object.keys(modification).length > 0;

  const annuler = () => {
    setLibelle(champ.libelle);
    setAlias(aliasInitiaux);
    setModalites(modalitesInitiales);
    fermer();
  };

  // ── Lecture ──
  if (!enEdition) {
    const modalitesAffichees = toutesModalites ? modalitesInitiales : modalitesInitiales.slice(0, MODALITES_VISIBLES);
    return (
      <li className="grid grid-cols-1 gap-2 px-4 py-3 hover:bg-gray-50/60 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)_auto] md:items-start md:gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900">{champ.libelle}</div>
          <MetaChamp champ={champ} />
        </div>

        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:hidden">{t("alias")}</div>
          {aliasInitiaux.length ? (
            <div className="flex flex-wrap gap-1">
              {aliasInitiaux.map((a) => <Etiquette key={a}>{a}</Etiquette>)}
            </div>
          ) : (
            <span className="text-xs text-gray-300">{t("no_alias")}</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:hidden">{t("modalities")}</div>
          {aModalites && modalitesInitiales.length ? (
            <div className="flex flex-wrap items-center gap-1">
              {modalitesAffichees.map((m) => (
                <Etiquette key={m} couleur="bg-emerald-50 text-emerald-800">{m}</Etiquette>
              ))}
              {modalitesInitiales.length > MODALITES_VISIBLES && (
                <button
                  type="button"
                  onClick={() => setToutesModalites((v) => !v)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  {toutesModalites ? t('collapse') : `+${modalitesInitiales.length - MODALITES_VISIBLES}`}
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>

        <div className="flex md:justify-end">
          {!lectureSeule && (
            <button
              type="button"
              onClick={ouvrir}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-[#65b741] hover:text-[#08704F]"
            >
              <Pencil className="w-3.5 h-3.5" /> {t("edit")}
            </button>
          )}
        </div>
      </li>
    );
  }

  // ── Édition (un seul champ à la fois) ──
  const idBase = `champ-${champ.nom}`;
  return (
    <li className="border-l-4 border-l-[#65b741] bg-emerald-50/30 px-4 py-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#08704F]">{t("field_editing")}</div>
          <MetaChamp champ={champ} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label htmlFor={`${idBase}-libelle`} className="mb-1 block text-sm font-semibold text-gray-700">
            {t("label")}
          </label>
          <input
            id={`${idBase}-libelle`}
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#65b741] focus:ring-1 focus:ring-[#65b741]/30"
          />
          <p className="mt-1 text-xs text-gray-500">{t("label_help")}</p>
        </div>

        <div>
          <label htmlFor={`${idBase}-alias`} className="mb-1 block text-sm font-semibold text-gray-700">
            {t("alias_field_label")}
          </label>
          <EditeurEtiquettes id={`${idBase}-alias`} valeurs={alias} onChange={setAlias} placeholder={t("alias_placeholder")} />
          <p className="mt-1 text-xs text-gray-500">
            {t("alias_help")}
          </p>
        </div>

        {aModalites && (
          <div>
            <label htmlFor={`${idBase}-modalites`} className="mb-1 block text-sm font-semibold text-gray-700">
              {t("modalities_field_label")}
            </label>
            {deduit ? (
              <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600">
                <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t('modalities_deduced', { values: modalitesInitiales.join(', ') })}
                </span>
              </div>
            ) : (
              <>
                <EditeurEtiquettes id={`${idBase}-modalites`} valeurs={modalites} onChange={setModalites} placeholder={t("add_value")} />
                <p className="mt-1 text-xs text-gray-500">{t("modalities_help")}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-emerald-100 pt-3">
        {modifie && <span className="mr-auto text-xs text-amber-700">{t("unsaved_changes")}</span>}
        <button
          type="button"
          onClick={annuler}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          disabled={!modifie || enCours || !libelle.trim()}
          onClick={() => enregistrer(champ.nom, modification)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#65b741] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#5aa43a] disabled:opacity-50"
        >
          {enCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("save")}
        </button>
      </div>
    </li>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function CatalogueDetailPage({
  params,
}: Readonly<{ params: Promise<{ type: string; annee: string }> }>) {
  const { type, annee } = React.use(params);
  const typeRegistre = decodeURIComponent(type);
  const anneeVersion = Number(annee);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  // Catalogue commun à toutes les structures : modifiable par le superadmin seul
  // (le backend refuse aussi : 403 pour un admin de structure).
  const lectureSeule = useAuthStore((state) => state.user?.role) !== 'SUPERADMIN';
  const [recherche, setRecherche] = useState('');
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [replies, setReplies] = useState<Set<string>>(new Set());

  const { data: catalogue, isLoading, isError } = useQuery({
    queryKey: ['catalogue', typeRegistre, anneeVersion],
    queryFn: () => CataloguesService.getByTypeAnnee(typeRegistre, anneeVersion),
  });

  const mutation = useMutation({
    mutationFn: ({ nom, modification }: { nom: string; modification: ChampCatalogueUpdate }) =>
      CataloguesService.modifierChamp(typeRegistre, anneeVersion, nom, modification),
    onSuccess: (catalogueAJour, { nom }) => {
      // Même clé que le popup de validation : il voit le nouveau libellé sans rechargement.
      queryClient.setQueryData(['catalogue', typeRegistre, anneeVersion], catalogueAJour);
      setEnEdition(null);
      toast.success(t('field_saved', { name: nom }));
    },
    onError: (err: Error) => toast.error(err.message || t('save_failed')),
  });

  const sections = [...(catalogue?.sections ?? [])]
    .sort((a, b) => a.ordre - b.ordre)
    .map((section) => ({
      ...section,
      champs: [...section.champs].sort((a, b) => a.ordre - b.ordre).filter((c) => correspond(c, recherche.trim())),
    }));
  const total = (catalogue?.sections ?? []).reduce((n, s) => n + s.champs.length, 0);
  const trouves = sections.reduce((n, s) => n + s.champs.length, 0);

  const basculer = (nom: string) =>
    setReplies((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(nom)) suivant.delete(nom);
      else suivant.add(nom);
      return suivant;
    });

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-5">
        <PageHeader title={catalogue?.libelle ?? `${typeRegistre} ${anneeVersion}`} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/admin/catalogues" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4" /> {t("catalogues")}
          </Link>
          {catalogue && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Etiquette>{catalogue.type_registre} {catalogue.annee_version}</Etiquette>
              {catalogue.rangs_par_patient > 1 && <Etiquette>{t('rows_per_patient', { count: catalogue.rangs_par_patient })}</Etiquette>}
              <Etiquette>{t('fields_count', { count: total })}</Etiquette>
            </div>
          )}
        </div>

        {lectureSeule ? (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
            <Lock className="w-4 h-4 shrink-0 text-gray-400" />
            {t("catalogue_read_only")}
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {t("catalogue_hint_before")} <strong>{t("edit")}</strong> {t("catalogue_hint_middle")}{' '}
              <strong>{t("catalogue_hint_alias")}</strong>{t("catalogue_hint_after")}
            </span>
          </div>
        )}

        {/* Recherche */}
        <div className="sticky top-0 z-10 -mx-1 bg-gray-50/90 px-1 py-1 backdrop-blur">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={t("search_field_placeholder")}
              aria-label={t("search_field")}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-24 text-sm outline-none focus:border-[#65b741] focus:ring-1 focus:ring-[#65b741]/30"
            />
            {recherche && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {trouves} / {total}
              </span>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#65b741]" /></div>
        )}
        {isError && <div className="p-4 text-red-600">{t("catalogue_not_found")}</div>}
        {catalogue && trouves === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
            {t('no_field_matches', { query: recherche })}
          </div>
        )}

        {sections
          .filter((s) => s.champs.length > 0)
          .map((section) => {
            // Une recherche déplie tout : on doit voir ce qu'on a trouvé.
            const replie = !recherche && replies.has(section.nom);
            return (
              <section key={section.nom} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => basculer(section.nom)}
                  aria-expanded={!replie}
                  className="flex w-full items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-left hover:bg-gray-100"
                >
                  {replie ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">{section.libelle}</span>
                  <span className="text-xs text-gray-400">{t('fields_count_short', { count: section.champs.length })}</span>
                </button>
                {!replie && (
                  <>
                    <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)_auto] gap-4 px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 md:grid">
                      <span>{t("col_field")}</span>
                      <span>{t("col_alias_field")}</span>
                      <span>{t("modalities")}</span>
                      <span className="w-[5.5rem]" />
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {section.champs.map((champ) => (
                        <LigneChamp
                          // La clé change avec la version enregistrée → l'état local repart des valeurs serveur.
                          key={`${champ.nom}:${champ.libelle}:${aliasDe(champ).join('|')}:${(champ.modalites ?? []).join('|')}`}
                          champ={champ}
                          enEdition={enEdition === champ.nom}
                          ouvrir={() => setEnEdition(champ.nom)}
                          fermer={() => setEnEdition(null)}
                          enCours={mutation.isPending && mutation.variables?.nom === champ.nom}
                          enregistrer={(nom, modification) => mutation.mutate({ nom, modification })}
                          lectureSeule={lectureSeule}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
}
