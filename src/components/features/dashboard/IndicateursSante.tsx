"use client";

/**
 * Indicateurs de santé (CPN, accouchements, CPON, SAA) calculés sur les lignes
 * validées, mois par mois (date écrite sur le registre). Tableau plutôt que
 * graphique : 14 indicateurs d'unités différentes, à lire et comparer aux
 * rapports mensuels (DHIS2). Chaque définition est au survol ; elles restent
 * provisoires tant que l'équipe médicale ne les a pas validées.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Info, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardService, type Indicateur } from '@/services/dashboard.service';
import type { TranslationKey } from '@/utils/translations';

const ORDRE_REGISTRES = ['CPN', 'ACCOUCHEMENTS', 'CPON', 'SAA'] as const;
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

type Valeur = Indicateur['total'];

function formater(v: Valeur | undefined, unite: string): string {
  if (!v || (unite === 'pourcentage' ? v.denominateur === 0 : v.numerateur === 0)) return '—';
  if (unite === 'pourcentage') return v.valeur == null ? '—' : `${Math.round(v.valeur * 100)} %`;
  return v.numerateur.toLocaleString('fr-FR');
}

function detail(v: Valeur | undefined, unite: string): string | undefined {
  return v && unite === 'pourcentage' && v.denominateur > 0 ? `${v.numerateur} / ${v.denominateur}` : undefined;
}

function telechargerCsv(indicateurs: Indicateur[], annee: number, entetesMois: string[]) {
  const echapper = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lignes = [
    ['Registre', 'Code', 'Indicateur', 'Unité', ...entetesMois, 'Total', 'Sans date', 'Définition'].map(echapper).join(';'),
    ...indicateurs.map((ind) => {
      const parMois = new Map(ind.par_mois.map((m) => [m.mois, m]));
      const valeur = (v: Valeur | undefined) =>
        !v ? '' : ind.unite === 'pourcentage'
          ? (v.denominateur ? `${v.numerateur}/${v.denominateur}` : '')
          : String(v.numerateur);
      return [
        ind.registre, ind.code, ind.libelle, ind.unite,
        ...entetesMois.map((_, i) => valeur(parMois.get(`${annee}-${String(i + 1).padStart(2, '0')}`))),
        valeur(ind.total), valeur(ind.sans_date), ind.definition,
      ].map((c) => echapper(String(c))).join(';');
    }),
  ];
  const blob = new Blob(['﻿' + lignes.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `indicateurs_osiris_${annee}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function IndicateursSante() {
  const { t } = useTranslation();
  const anneeCourante = new Date().getFullYear();
  const [annee, setAnnee] = useState(anneeCourante);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-indicateurs', annee],
    queryFn: () => DashboardService.getIndicateurs(annee),
  });
  const annees = Array.from({ length: anneeCourante - 2018 + 1 }, (_, i) => anneeCourante - i);
  const mois = Array.from({ length: 12 }, (_, i) => `${annee}-${String(i + 1).padStart(2, '0')}`);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{t('indicateurs_titre')}</h3>
          <p className="text-[12px] text-gray-500">{t('indicateurs_sous_titre')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[12px] text-gray-600">
            {t('indicateurs_annee')}
            <select
              value={annee}
              onChange={(e) => setAnnee(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800"
            >
              {annees.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <button
            type="button"
            disabled={!data}
            onClick={() => data && telechargerCsv(data.indicateurs, annee, MOIS_COURTS)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {t('indicateurs_csv')}
          </button>
        </div>
      </div>

      {data?.statut_definitions === 'PROVISOIRE' && (
        <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t('indicateurs_provisoire')}
        </p>
      )}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#65b741]" /></div>
      ) : isError || !data ? (
        <p className="text-sm text-gray-500">{t('no_data_available')}</p>
      ) : (
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          <table className="w-full min-w-[960px] border-collapse text-[12px]">
            <thead>
              <tr className="text-[11px] text-gray-500">
                <th className="sticky left-0 bg-white py-1.5 pr-3 text-left font-semibold">{t('indicateurs_indicateur')}</th>
                {MOIS_COURTS.map((m) => <th key={m} className="px-1.5 py-1.5 text-right font-semibold">{m}</th>)}
                <th className="px-2 py-1.5 text-right font-bold text-gray-700">{t('indicateurs_total')}</th>
                <th className="px-2 py-1.5 text-right font-semibold" title={t('indicateurs_sans_date_aide')}>
                  {t('indicateurs_sans_date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ORDRE_REGISTRES.map((registre) => {
                const lignes = data.indicateurs.filter((i) => i.registre === registre);
                if (lignes.length === 0) return null;
                return (
                  <React.Fragment key={registre}>
                    <tr>
                      <td colSpan={15} className="border-t border-gray-200 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        {t(`indicateurs_registre_${registre}` as TranslationKey)}
                      </td>
                    </tr>
                    {lignes.map((ind) => {
                      const parMois = new Map(ind.par_mois.map((m) => [m.mois, m]));
                      return (
                        <tr key={ind.code} className="border-t border-gray-100 hover:bg-gray-50/70">
                          <td className="sticky left-0 bg-white py-1.5 pr-3 text-gray-800" title={ind.definition}>
                            <span className="border-b border-dotted border-gray-300">{ind.libelle}</span>
                          </td>
                          {mois.map((m) => {
                            const v = parMois.get(m);
                            return (
                              <td key={m} className="px-1.5 py-1.5 text-right tabular-nums text-gray-700" title={detail(v, ind.unite)}>
                                {formater(v, ind.unite)}
                              </td>
                            );
                          })}
                          <td className="px-2 py-1.5 text-right font-bold tabular-nums text-gray-900" title={detail(ind.total, ind.unite)}>
                            {formater(ind.total, ind.unite)}
                          </td>
                          <td
                            className={`px-2 py-1.5 text-right tabular-nums ${ind.sans_date.denominateur > 0 ? 'text-amber-700' : 'text-gray-400'}`}
                            title={t('indicateurs_sans_date_aide')}
                          >
                            {formater(ind.sans_date, ind.unite)}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
