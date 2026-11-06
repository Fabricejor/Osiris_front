"use client";

/**
 * Édition des champs d'un catalogue : libellé, alias (variantes d'intitulé
 * rencontrées sur les registres terrain) et modalités.
 *
 * Les alias sont donnés à l'OCR pour reconnaître une colonne dont l'en-tête
 * diffère du registre de référence (« H U », « Prestataire »…). La structure
 * (ajout/suppression de champ, type, PII) n'est pas modifiable ici.
 */
import { useAuthStore } from '@/store/authStore';
import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Loader2, Lock, Plus, Save, ShieldAlert, X } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { CataloguesService, type ChampCatalogueUpdate } from '@/services/catalogues.service';
import type { components } from '@/types/api.generated';

type ChampCatalogue = components['schemas']['ChampCatalogue'];

const TYPES_A_MODALITES = new Set(['CATEGORIELLE', 'CATEGORIELLE_MULTI', 'BINAIRE']);

const LIBELLE_TYPE: Record<string, string> = {
  TEXTE: 'Texte',
  NOMBRE: 'Nombre',
  DATE: 'Date',
  HEURE: 'Heure',
  BINAIRE: 'Oui / non',
  CATEGORIELLE: 'Choix',
  CATEGORIELLE_MULTI: 'Choix multiple',
  TENSION_ARTERIELLE: 'Tension',
};

function aliasDe(champ: ChampCatalogue): string[] {
  const alias = (champ.contraintes as { alias?: unknown } | undefined)?.alias;
  return Array.isArray(alias) ? alias.filter((a): a is string => typeof a === 'string') : [];
}

function memesListes(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Saisie d'une liste de valeurs sous forme d'étiquettes (alias, modalités). */
function EditeurEtiquettes({
  valeurs,
  onChange,
  placeholder,
  disabled,
}: Readonly<{ valeurs: string[]; onChange: (v: string[]) => void; placeholder: string; disabled?: boolean }>) {
  const [saisie, setSaisie] = useState('');
  const ajouter = () => {
    const v = saisie.trim();
    if (v && !valeurs.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...valeurs, v]);
    setSaisie('');
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {valeurs.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          {v}
          {!disabled && (
            <button
              type="button"
              aria-label={`Retirer ${v}`}
              onClick={() => onChange(valeurs.filter((x) => x !== v))}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <span className="inline-flex items-center gap-1">
          <input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                ajouter();
              }
            }}
            placeholder={placeholder}
            className="w-36 rounded-md border border-gray-200 px-2 py-0.5 text-xs outline-none focus:border-[#65b741] focus:ring-1 focus:ring-[#65b741]/30"
          />
          <button type="button" onClick={ajouter} aria-label="Ajouter" className="text-[#08704F] hover:text-[#065c41]">
            <Plus className="w-4 h-4" />
          </button>
        </span>
      )}
    </div>
  );
}

function LigneChamp({
  champ,
  enregistrer,
  enCours,
  lectureSeule,
}: Readonly<{
  champ: ChampCatalogue;
  enregistrer: (nom: string, modification: ChampCatalogueUpdate) => void;
  enCours: boolean;
  /** Admin de structure : consultation seulement (édition réservée au superadmin). */
  lectureSeule: boolean;
}>) {
  const aliasInitiaux = aliasDe(champ);
  const modalitesInitiales = champ.modalites ?? [];
  const [libelle, setLibelle] = useState(champ.libelle);
  const [alias, setAlias] = useState(aliasInitiaux);
  const [modalites, setModalites] = useState<string[]>(modalitesInitiales);

  const deduit = Boolean((champ.contraintes as { deduit_du_rang?: boolean } | undefined)?.deduit_du_rang);
  const aModalites = TYPES_A_MODALITES.has(champ.type_champ);

  const modification: ChampCatalogueUpdate = {};
  if (libelle.trim() !== champ.libelle) modification.libelle = libelle.trim();
  if (!memesListes(alias, aliasInitiaux)) modification.alias = alias;
  if (aModalites && !deduit && !memesListes(modalites, modalitesInitiales)) modification.modalites = modalites;
  const modifie = Object.keys(modification).length > 0;

  return (
    <tr className={`align-top ${modifie ? 'bg-amber-50/40' : ''}`}>
      <td className="p-3">
        <input
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          disabled={lectureSeule}
          aria-label={`Libellé de ${champ.nom}`}
          className="w-full rounded-md border disabled:bg-gray-50 disabled:text-gray-600 border-gray-200 px-2 py-1 text-sm outline-none focus:border-[#65b741] focus:ring-1 focus:ring-[#65b741]/30"
        />
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
          <code>{champ.nom}</code>
          <span>· {LIBELLE_TYPE[champ.type_champ] ?? champ.type_champ}</span>
          {champ.is_pii && (
            <span className="inline-flex items-center gap-0.5 rounded bg-purple-50 px-1 text-purple-700">
              <ShieldAlert className="w-3 h-3" /> PII
            </span>
          )}
          {champ.niveau_patiente && <span className="rounded bg-blue-50 px-1 text-blue-700">1 fois / patiente</span>}
          {deduit && <span className="rounded bg-slate-100 px-1 text-slate-600">déduit de la ligne</span>}
        </div>
      </td>
      <td className="p-3">
        <EditeurEtiquettes valeurs={alias} onChange={setAlias} placeholder="ex. Prestataire" disabled={lectureSeule} />
      </td>
      <td className="p-3">
        {aModalites ? (
          <div className="flex items-start gap-1">
            {deduit && <Lock className="w-3.5 h-3.5 mt-1 text-gray-400 shrink-0" aria-label="Verrouillé" />}
            <EditeurEtiquettes valeurs={modalites} onChange={setModalites} placeholder="Ajouter" disabled={deduit || lectureSeule} />
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>
      <td className="p-3 text-right whitespace-nowrap">
        {modifie && !lectureSeule && (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setLibelle(champ.libelle);
                setAlias(aliasInitiaux);
                setModalites(modalitesInitiales);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={enCours}
              onClick={() => enregistrer(champ.nom, modification)}
              className="inline-flex items-center gap-1 rounded-md bg-[#65b741] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#5aa43a] disabled:opacity-50"
            >
              {enCours ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function CatalogueDetailPage({
  params,
}: Readonly<{ params: Promise<{ type: string; annee: string }> }>) {
  const { type, annee } = React.use(params);
  const typeRegistre = decodeURIComponent(type);
  const anneeVersion = Number(annee);
  const queryClient = useQueryClient();
  // Catalogue commun à toutes les structures : modifiable par le superadmin seul
  // (le backend refuse aussi : 403 pour un admin de structure).
  const lectureSeule = useAuthStore((state) => state.user?.role) !== 'SUPERADMIN';

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
      toast.success(`Champ « ${nom} » enregistré. Pris en compte par l'OCR sous une minute.`);
    },
    onError: (err: Error) => toast.error(err.message || "Échec de l'enregistrement"),
  });

  const sections = [...(catalogue?.sections ?? [])].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title={catalogue?.libelle ?? `${typeRegistre} ${anneeVersion}`} />
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/admin/catalogues" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" /> Catalogues
        </Link>
        {catalogue && (
          <span className="text-xs text-gray-500">
            {catalogue.rangs_par_patient > 1 ? `${catalogue.rangs_par_patient} lignes par patiente · ` : ''}
            {sections.reduce((n, s) => n + s.champs.length, 0)} champs
          </span>
        )}
      </div>

      {lectureSeule && (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          <Lock className="w-4 h-4 shrink-0 text-gray-400" />
          Consultation seule : le catalogue est commun à toutes les structures, seul un superadmin peut le modifier.
        </div>
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        <strong>Alias</strong> : ajoutez les intitulés que vous voyez sur les registres terrain quand ils diffèrent du
        libellé (abréviations, autre formulation). L&apos;OCR s&apos;en sert pour reconnaître la colonne, même si elle
        n&apos;est pas à la même place. Un même intitulé ne peut pas désigner deux champs.
      </div>

      {isLoading && (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#65b741]" /></div>
      )}
      {isError && <div className="p-4 text-red-600">Catalogue introuvable.</div>}

      {sections.map((section) => (
        <section key={section.nom} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <h2 className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600">
            {section.libelle}
          </h2>
          <table className="w-full text-left">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-3 pt-2 w-[30%]">Libellé</th>
                <th className="px-3 pt-2 w-[35%]">Alias (intitulés terrain)</th>
                <th className="px-3 pt-2">Modalités</th>
                <th className="px-3 pt-2 w-40" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...section.champs]
                .sort((a, b) => a.ordre - b.ordre)
                .map((champ) => (
                  <LigneChamp
                    // La clé change avec la version enregistrée → l'état local repart des valeurs serveur.
                    key={`${champ.nom}:${champ.libelle}:${aliasDe(champ).join('|')}:${(champ.modalites ?? []).join('|')}`}
                    champ={champ}
                    enCours={mutation.isPending && mutation.variables?.nom === champ.nom}
                    enregistrer={(nom, modification) => mutation.mutate({ nom, modification })}
                    lectureSeule={lectureSeule}
                  />
                ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
