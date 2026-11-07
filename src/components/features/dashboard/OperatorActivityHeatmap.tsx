"use client";

/**
 * Activité des opérateurs : actions (lignes revues + pages envoyées) par jour de
 * la semaine × tranche de 2 h, sur les 4 dernières semaines. Filtrable par
 * opérateur. Une case sans activité reste grise ; intensité relative à la case
 * la plus active. Libellés (jours, tranches) produits ici dans la langue choisie.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardService } from '@/services/dashboard.service';

const COULEURS = ['bg-gray-100', 'bg-amber-100', 'bg-amber-300', 'bg-orange-400', 'bg-red-500'];

function niveau(nombre: number, maximum: number): number {
  if (nombre <= 0 || maximum <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((nombre / maximum) * 4)));
}

const deuxChiffres = (h: number) => String(h).padStart(2, '0');

export default function OperatorActivityHeatmap() {
  const { t, language } = useTranslation();
  const locale = language === 'fr' ? 'fr-FR' : 'en-GB';
  const [operateur, setOperateur] = useState('');
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['dashboard-operator-activity-heatmap', operateur],
    queryFn: () => DashboardService.getOperatorActivityHeatmap(operateur || undefined),
    placeholderData: (precedent) => precedent,
  });
  const [survol, setSurvol] = useState<{ jour: number; tranche: number; x: number; y: number } | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">{t("no_data_available")}</p>
      </div>
    );
  }

  const fmtJour = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  // 2024-01-01 est un lundi → jours 0 (lundi) à 6 (dimanche).
  const jours = Array.from({ length: 7 }, (_, i) => fmtJour.format(Date.UTC(2024, 0, 1 + i)));
  const tranches = [
    ...data.tranches.map((h) => `${deuxChiffres(h)}–${deuxChiffres(h + 2)}`),
    t('off_hours'),
  ];
  const valeur = new Map(data.cellules.map((c) => [`${c.jour}:${c.tranche}`, c.nombre]));
  const nombreDe = (jour: number, tranche: number) => valeur.get(`${jour}:${tranche}`) ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{t("operator_activity_title")}</h3>
          <p className="text-[10px] text-gray-400">{t('last_4_weeks_actions', { count: data.total })}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isFetching && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
          <select
            value={operateur}
            onChange={(e) => setOperateur(e.target.value)}
            aria-label={t('operator')}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[9rem] py-0.5 pl-2 pr-6 text-[11px] border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#65b741]"
          >
            <option value="">{t('all_operators')}</option>
            {data.operateurs.map((o) => (
              <option key={o.id_keycloak} value={o.id_keycloak}>{o.nom || o.id_keycloak.slice(0, 8)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Jours */}
        <div className="flex mb-1">
          <div className="w-12 shrink-0" />
          {jours.map((j) => (
            <span key={j} className="flex-1 text-[10px] font-medium text-gray-500 text-center capitalize">{j}</span>
          ))}
        </div>

        {/* Tranches horaires */}
        <div className="flex-1 flex flex-col gap-[3px] min-h-0">
          {tranches.map((libelle, tranche) => (
            <div key={libelle} className="flex-1 flex items-stretch gap-[3px] min-h-0">
              <span className="text-[10px] text-gray-500 w-12 pr-1.5 shrink-0 flex items-center justify-end whitespace-nowrap">
                {libelle}
              </span>
              {jours.map((_, jour) => (
                <div
                  key={jour}
                  className={`flex-1 rounded-sm ${COULEURS[niveau(nombreDe(jour, tranche), data.maximum)]} cursor-pointer hover:ring-1 hover:ring-gray-400`}
                  onMouseEnter={(e) => {
                    const r = (e.target as HTMLElement).getBoundingClientRect();
                    const p = (e.target as HTMLElement).closest('.relative')!.getBoundingClientRect();
                    setSurvol({ jour, tranche, x: r.left - p.left + r.width / 2, y: r.top - p.top - 6 });
                  }}
                  onMouseLeave={() => setSurvol(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {survol && (
        <div
          className="absolute z-50 bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full"
          style={{ left: survol.x, top: survol.y }}
        >
          <p className="font-medium capitalize">{jours[survol.jour]} · {tranches[survol.tranche]}</p>
          <p className="text-gray-300">{t('actions_count', { count: nombreDe(survol.jour, survol.tranche) })}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
