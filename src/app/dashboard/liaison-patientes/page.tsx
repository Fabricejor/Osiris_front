"use client";

/**
 * Liaison d'une même femme entre registres (CPN → accouchement → CPON).
 *
 * Le serveur propose des paires (nom, adresse, âge, parité, dates, même
 * structure) ; le valideur décide. « Même femme » donne aux deux dossiers le
 * même ID pseudonyme dans les exports ; « Femmes différentes » écarte la paire
 * pour toujours. Réservé aux valideurs : les noms et adresses s'affichent.
 */
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Info, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import {
  LiensPatientesService,
  type CriteresLien,
  type DossierResume,
  type LienPatiente,
  type StatutLienPatiente,
} from '@/services/liens-patientes.service';
import type { TranslationKey } from '@/utils/translations';

const REGISTRE: Record<string, { cle: TranslationKey; style: string }> = {
  CPN: { cle: 'indicateurs_registre_CPN', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ACCOUCHEMENTS: { cle: 'indicateurs_registre_ACCOUCHEMENTS', style: 'bg-sky-50 text-sky-800 border-sky-200' },
  CPON: { cle: 'indicateurs_registre_CPON', style: 'bg-violet-50 text-violet-800 border-violet-200' },
  SAA: { cle: 'indicateurs_registre_SAA', style: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const ONGLETS: { statut: StatutLienPatiente; cle: TranslationKey }[] = [
  { statut: 'SUGGERE', cle: 'liens_a_examiner' },
  { statut: 'CONFIRME', cle: 'liens_confirmes' },
  { statut: 'REJETE', cle: 'liens_rejetes' },
];

function dateFr(iso: string | null): string {
  if (!iso) return '—';
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
}

function nombre(v: number | null | undefined): string {
  return v == null ? '—' : String(Math.round(v * 10) / 10);
}

function signe(v: number | undefined): string {
  if (v == null) return '—';
  return v > 0 ? `+${v}` : String(v);
}

function Dossier({ d }: Readonly<{ d?: DossierResume }>) {
  const { t } = useTranslation();
  if (!d) return <div className="flex-1" />;
  const reg = REGISTRE[d.type_registre] ?? REGISTRE.SAA;
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-white p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${reg.style}`}>{t(reg.cle)}</span>
        <span className="text-[11px] font-semibold text-gray-400">N° {d.numero_ordre}</span>
      </div>
      <p className="truncate text-sm font-bold text-gray-900">{d.nom ?? '—'}</p>
      <p className="truncate text-[12px] text-gray-500">{d.adresse ?? '—'}</p>
      <dl className="mt-2 grid grid-cols-3 gap-1 text-[11px]">
        <div><dt className="text-gray-400">{t('liens_age')}</dt><dd className="font-semibold text-gray-800">{nombre(d.age)}</dd></div>
        <div><dt className="text-gray-400">{t('liens_parite')}</dt><dd className="font-semibold text-gray-800">{nombre(d.parite)}</dd></div>
        <div>
          <dt className="text-gray-400">{t('liens_date')}</dt>
          <dd className="font-semibold text-gray-800">{dateFr(d.date_reference)}</dd>
        </div>
      </dl>
      {d.nombre_visites ? (
        <p className="mt-1 text-[10px] text-gray-400">{d.nombre_visites} {t('liens_visites')}</p>
      ) : null}
    </div>
  );
}

function Pastille({ libelle, valeur, faible }: Readonly<{ libelle: string; valeur: string; faible?: boolean }>) {
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${faible ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
      {libelle} <span className="font-bold">{valeur}</span>
    </span>
  );
}

function CarteLien({
  lien, onDecider, enCours,
}: Readonly<{ lien: LienPatiente; onDecider?: (confirmer: boolean) => void; enCours: boolean }>) {
  const { t } = useTranslation();
  const c = lien.criteres as CriteresLien;
  const pct = (v?: number) => (v == null ? '—' : `${Math.round(v * 100)} %`);
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        <Dossier d={c.avant} />
        <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-gray-400 md:rotate-0" />
        <Dossier d={c.apres} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Pastille libelle={t('liens_score')} valeur={pct(lien.score)} faible={lien.score < 0.85} />
        <Pastille libelle={t('liens_nom')} valeur={pct(c.similarite_nom)} faible={(c.similarite_nom ?? 1) < 0.9} />
        {c.similarite_adresse != null && (
          <Pastille libelle={t('liens_adresse')} valeur={pct(c.similarite_adresse)} faible={c.similarite_adresse < 0.7} />
        )}
        {c.ecart_jours != null && (
          <Pastille libelle={t('liens_ecart')} valeur={t('liens_jours', { count: c.ecart_jours })} />
        )}
        {c.ecart_age != null && <Pastille libelle={t('liens_age')} valeur={signe(c.ecart_age)} />}
        {c.ecart_parite != null && <Pastille libelle={t('liens_parite')} valeur={signe(c.ecart_parite)} />}
        {onDecider && (
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled={enCours}
              onClick={() => onDecider(false)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> {t('liens_rejeter')}
            </button>
            <button
              type="button"
              disabled={enCours}
              onClick={() => onDecider(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> {t('liens_confirmer')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiaisonPatientesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const estValideur = useAuthStore((s) => s.user?.role === 'VALIDEUR_MEDICAL');
  const [statut, setStatut] = useState<StatutLienPatiente>('SUGGERE');

  const { data, isLoading } = useQuery({
    queryKey: ['liens-patientes', statut],
    queryFn: () => LiensPatientesService.lister(statut),
    enabled: estValideur,
  });

  const rafraichir = () => queryClient.invalidateQueries({ queryKey: ['liens-patientes'] });

  const calculer = useMutation({
    mutationFn: LiensPatientesService.calculer,
    onSuccess: (b) => {
      toast.success(t('liens_bilan', { dossiers: b.dossiers, nouvelles: b.nouvelles_suggestions }));
      rafraichir();
    },
    onError: (e: Error) => toast.error(e.message || t('action_failed')),
  });

  const decider = useMutation({
    mutationFn: ({ id, confirmer }: { id: string; confirmer: boolean }) =>
      confirmer ? LiensPatientesService.confirmer(id) : LiensPatientesService.rejeter(id),
    onSuccess: (d) => {
      if (d.lien.statut === 'CONFIRME') toast.success(t('liens_retirees', { count: d.suggestions_retirees }));
      rafraichir();
    },
    onError: (e: Error) => {
      toast.error(e.message || t('action_failed'));
      rafraichir();
    },
  });

  if (!estValideur) {
    return (
      <div className="p-6">
        <PageHeader title={t('liens_titre')} />
        <p className="text-sm text-gray-500">{t('error_forbidden')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title={t('liens_titre')} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-3xl text-sm text-gray-500">{t('liens_sous_titre')}</p>
        <button
          type="button"
          onClick={() => calculer.mutate()}
          disabled={calculer.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          {calculer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {t('liens_calculer')}
        </button>
      </div>

      <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t('liens_aide')}
      </p>

      <div className="flex gap-1 border-b border-gray-200">
        {ONGLETS.map((o) => (
          <button
            key={o.statut}
            type="button"
            onClick={() => setStatut(o.statut)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${statut === o.statut ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t(o.cle)}
            {statut === o.statut && data ? ` (${data.total})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#65b741]" /></div>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-gray-500">{t('liens_vide')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((lien) => (
            <CarteLien
              key={lien.id_lien_patiente}
              lien={lien}
              enCours={decider.isPending}
              onDecider={
                statut === 'SUGGERE'
                  ? (confirmer) => decider.mutate({ id: lien.id_lien_patiente, confirmer })
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
