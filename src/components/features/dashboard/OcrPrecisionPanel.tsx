"use client";

/**
 * Précision RÉELLE de l'OCR : ce que l'OCR a lu comparé à ce que les
 * valideurs ont retenu (et non le score que l'OCR s'attribue).
 *
 * - Tuiles : précision réelle, score annoncé, cases oubliées, lignes rejetées.
 * - « Le score de l'OCR est-il tenu ? » : par tranche de score, score annoncé
 *   vs précision mesurée (même unité, un seul axe 0–100 %).
 * - Champs les plus souvent faux (taux d'erreur = corrigées + oubliées).
 * - Évolution mensuelle, et tableau par agent terrain (qualité des photos).
 *
 * Couleurs : précision réelle = vert de la marque, score annoncé = orange
 * (paire validée : CVD ΔE 9,9, contraste ≥ 3:1 sur fond blanc).
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardService, type GroupeOcr } from '@/services/dashboard.service';

const COULEUR_REEL = '#08704F';
const COULEUR_ANNONCE = '#eb6834';
const ENCRE_SECONDAIRE = '#52514e';
const GRILLE = '#f0f0f0';

const STYLE_INFOBULLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

function pct(v: number | null | undefined, decimales = 1): string {
  return v == null ? '—' : `${(v * 100).toFixed(decimales).replace('.', ',')} %`;
}

function Tuile({ titre, valeur, detail }: Readonly<{ titre: string; valeur: string; detail?: string }>) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{titre}</p>
      <p className="mt-1 text-2xl font-black text-gray-900 tabular-nums">{valeur}</p>
      {detail && <p className="mt-0.5 text-[11px] text-gray-500">{detail}</p>}
    </div>
  );
}

function Carte({ titre, children }: Readonly<{ titre: string; children: React.ReactNode }>) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-gray-100 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-800">{titre}</h4>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

export default function OcrPrecisionPanel() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-precision-ocr'],
    queryFn: DashboardService.getPrecisionOcr,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-gray-100 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#65b741]" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-gray-100 bg-white">
        <p className="text-sm text-gray-500">{t('no_data_available')}</p>
      </div>
    );
  }

  const g = data.global;
  const enTete = (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-gray-800">{t('precision_title')}</h3>
      <p className="text-[12px] text-gray-500">
        {t('precision_subtitle', { lignes: g.lignes_revues.toLocaleString('fr-FR') })}
        {data.tronque && ` · ${t('precision_tronque')}`}
      </p>
    </div>
  );

  if (g.cases_lues === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        {enTete}
        <p className="text-sm text-gray-500">{t('precision_vide')}</p>
      </div>
    );
  }

  const fiabilite = data.par_tranche_score.map((tr) => ({
    tranche: `${tr.cle} %`,
    annonce: tr.score_gemini_moyen != null ? tr.score_gemini_moyen * 100 : null,
    reel: tr.precision != null ? tr.precision * 100 : null,
    cases: tr.cases_lues,
  }));
  const champs = data.par_champ.slice(0, 8).map((c: GroupeOcr) => ({
    libelle: c.libelle,
    erreur: (c.taux_erreur ?? 0) * 100,
    corrigees: c.cases_corrigees,
    oubliees: c.cases_oubliees,
    total: c.cases_lues + c.cases_oubliees,
  }));
  const mois = data.par_mois.map((m) => ({
    mois: m.cle,
    reel: m.precision != null ? m.precision * 100 : null,
    cases: m.cases_lues,
  }));
  const axePct = (v: number) => `${v} %`;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      {enTete}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tuile
          titre={t('precision_reelle')}
          valeur={pct(g.precision)}
          detail={t('precision_cases', { count: g.cases_lues.toLocaleString('fr-FR') })}
        />
        <Tuile titre={t('precision_score_annonce')} valeur={pct(g.score_gemini_moyen)} />
        <Tuile
          titre={t('precision_taux_oubli')}
          valeur={pct(g.taux_oubli)}
          detail={t('precision_oubliees', { count: g.cases_oubliees.toLocaleString('fr-FR') })}
        />
        <Tuile titre={t('precision_lignes_rejetees')} valeur={g.lignes_rejetees.toLocaleString('fr-FR')} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-[280px]">
          <Carte titre={t('precision_fiabilite_titre')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fiabilite} barGap={2} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={GRILLE} vertical={false} />
                <XAxis dataKey="tranche" tick={{ fontSize: 11, fill: ENCRE_SECONDAIRE }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tickFormatter={axePct} tick={{ fontSize: 11, fill: ENCRE_SECONDAIRE }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={STYLE_INFOBULLE}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  formatter={(v: unknown, nom: unknown) => [typeof v === 'number' ? `${v.toFixed(1)} %` : '—', String(nom)]}
                  labelFormatter={(l, items) => {
                    const cases = (items?.[0]?.payload as { cases?: number } | undefined)?.cases;
                    return `${t('precision_fiabilite_axe')} ${l}${cases != null ? ` · ${t('precision_cases', { count: cases })}` : ''}`;
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: ENCRE_SECONDAIRE }} />
                <Bar dataKey="annonce" name={t('precision_score_annonce')} fill={COULEUR_ANNONCE} radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="reel" name={t('precision_reelle')} fill={COULEUR_REEL} radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </Carte>
        </div>

        <div className="h-[280px]">
          <Carte titre={t('precision_champs_titre')}>
            {champs.length === 0 ? (
              <p className="text-sm text-gray-500">{t('precision_champs_vide', { min: data.min_cases })}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={champs} layout="vertical" margin={{ top: 0, right: 44, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={GRILLE} horizontal={false} />
                  <XAxis type="number" domain={[0, 'auto']} tickFormatter={axePct} tick={{ fontSize: 11, fill: ENCRE_SECONDAIRE }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="libelle" width={150} tick={{ fontSize: 11, fill: ENCRE_SECONDAIRE }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={STYLE_INFOBULLE}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    formatter={(v: unknown, _n: unknown, item: { payload?: { corrigees: number; oubliees: number; total: number } }) => {
                      const p = item.payload;
                      const detail = p
                        ? ` (${t('precision_corrigees', { count: p.corrigees })}, ${t('precision_oubliees', { count: p.oubliees })} / ${p.total})`
                        : '';
                      return [`${typeof v === 'number' ? v.toFixed(1) : '—'} %${detail}`, t('precision_taux_erreur')];
                    }}
                  />
                  <Bar dataKey="erreur" fill={COULEUR_REEL} radius={[0, 4, 4, 0]} maxBarSize={14}>
                    <LabelList
                      dataKey="erreur"
                      position="right"
                      formatter={(v: unknown) => (typeof v === 'number' ? `${v.toFixed(1)} %` : '')}
                      style={{ fontSize: 11, fill: ENCRE_SECONDAIRE }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Carte>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {mois.length >= 2 && (
          <div className="h-[240px]">
            <Carte titre={t('precision_mois_titre')}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mois} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={GRILLE} vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: ENCRE_SECONDAIRE }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={axePct} tick={{ fontSize: 11, fill: ENCRE_SECONDAIRE }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={STYLE_INFOBULLE}
                    formatter={(v: unknown) => [typeof v === 'number' ? `${v.toFixed(1)} %` : '—', t('precision_reelle')]}
                  />
                  <Line type="monotone" dataKey="reel" stroke={COULEUR_REEL} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Carte>
          </div>
        )}

        <div className={mois.length >= 2 ? '' : 'lg:col-span-2'}>
          <Carte titre={t('precision_agents_titre')}>
            {data.par_agent.length === 0 ? (
              <p className="text-sm text-gray-500">{t('precision_champs_vide', { min: data.min_cases })}</p>
            ) : (
              <div className="max-h-[190px] overflow-auto" style={{ scrollbarWidth: 'thin' }}>
                <table className="w-full text-left text-[12px]">
                  <thead className="sticky top-0 bg-white text-[11px] text-gray-500">
                    <tr>
                      <th className="py-1 pr-2 font-semibold">{t('precision_agent')}</th>
                      <th className="py-1 pr-2 text-right font-semibold">{t('precision_reelle')}</th>
                      <th className="py-1 pr-2 text-right font-semibold">{t('precision_taux_oubli')}</th>
                      <th className="py-1 text-right font-semibold">{t('precision_taux_erreur')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.par_agent.map((a) => (
                      <tr key={a.cle} className="border-t border-gray-100">
                        <td className="py-1 pr-2 text-gray-800">
                          {a.libelle}
                          <span className="ml-1 text-[10px] text-gray-400">
                            {t('precision_cases', { count: a.cases_lues })}
                          </span>
                        </td>
                        <td className="py-1 pr-2 text-right tabular-nums text-gray-800">{pct(a.precision)}</td>
                        <td className="py-1 pr-2 text-right tabular-nums text-gray-800">{pct(a.taux_oubli)}</td>
                        <td className="py-1 text-right font-semibold tabular-nums text-gray-900">{pct(a.taux_erreur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Carte>
        </div>
      </div>
    </div>
  );
}
