"use client";

/**
 * Calendrier d'activité : lignes validées par jour sur les 12 derniers mois
 * (une case = un jour, colonnes = semaines du lundi au dimanche).
 *
 * Le backend renvoie des dates ISO et des nombres ; mois, jours et dates sont
 * formatés ici dans la langue de l'utilisateur. Intensité relative au jour le
 * plus actif de la période (pas de seuils fixes).
 */
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardService } from '@/services/dashboard.service';

const COULEURS = ['bg-gray-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'];
const JOUR_MS = 24 * 60 * 60 * 1000;

/** « 2026-11-03 » → timestamp UTC minuit (évite les décalages de fuseau). */
function versUtc(iso: string): number {
  const [a, m, j] = iso.split('-').map(Number);
  return Date.UTC(a, m - 1, j);
}

function niveau(nombre: number, maximum: number): number {
  if (nombre <= 0 || maximum <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((nombre / maximum) * 4)));
}

type Case = { ts: number; nombre: number; dansPeriode: boolean };

export default function ActivityHeatmap() {
  const { t, language } = useTranslation();
  const locale = language === 'fr' ? 'fr-FR' : 'en-GB';
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-activity-heatmap'],
    queryFn: DashboardService.getActivityHeatmap,
  });
  const [survol, setSurvol] = useState<{ c: Case; x: number; y: number } | null>(null);

  const grille = useMemo(() => {
    if (!data) return null;
    const parJour = new Map(data.jours.map((j) => [versUtc(j.date), j.nombre]));
    const debut = versUtc(data.date_debut);
    const fin = versUtc(data.date_fin);
    // Première colonne : le lundi qui précède (ou égale) la date de début.
    const decalage = (new Date(debut).getUTCDay() + 6) % 7;
    const semaines: Case[][] = [];
    for (let ts = debut - decalage * JOUR_MS; ts <= fin; ts += 7 * JOUR_MS) {
      semaines.push(
        Array.from({ length: 7 }, (_, i) => {
          const jour = ts + i * JOUR_MS;
          return { ts: jour, nombre: parJour.get(jour) ?? 0, dansPeriode: jour >= debut && jour <= fin };
        }),
      );
    }
    // Libellé du mois sur la semaine qui contient le 1er du mois.
    const fmtMois = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
    const mois = semaines.map((s) => {
      const premier = s.find((c) => c.dansPeriode && new Date(c.ts).getUTCDate() === 1);
      return premier ? fmtMois.format(premier.ts) : '';
    });
    return { semaines, mois };
  }, [data, locale]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
      </div>
    );
  }

  if (isError || !data || !grille) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">{t("no_data_available")}</p>
      </div>
    );
  }

  const fmtJourSemaine = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  // 2024-01-01 est un lundi : libellés lundi, mercredi, vendredi.
  const joursAffiches = [0, 2, 4].map((i) => ({ i, nom: fmtJourSemaine.format(Date.UTC(2024, 0, 1 + i)) }));
  const fmtDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  const nbSemaines = grille.semaines.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col relative">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{t("activity_heatmap_title")}</h3>
        <span className="text-[11px] text-gray-500">{t('validated_rows_12_months', { count: data.total })}</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {/* Mois */}
        <div className="grid gap-[2px] ml-8 mb-1" style={{ gridTemplateColumns: `repeat(${nbSemaines}, minmax(0, 1fr))` }}>
          {grille.mois.map((m, i) => (
            <span key={i} className="text-[9px] text-gray-400 whitespace-nowrap overflow-visible">{m}</span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Jours de la semaine */}
          <div className="grid grid-rows-7 gap-[2px] w-7 shrink-0">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="text-[9px] text-gray-400 leading-none flex items-center">
                {joursAffiches.find((j) => j.i === i)?.nom ?? ''}
              </span>
            ))}
          </div>

          {/* Cases : une colonne par semaine */}
          <div className="flex-1 grid grid-flow-col grid-rows-7 gap-[2px]" style={{ gridTemplateColumns: `repeat(${nbSemaines}, minmax(0, 1fr))` }}>
            {grille.semaines.flatMap((semaine) =>
              semaine.map((c) => (
                <div
                  key={c.ts}
                  className={`aspect-square rounded-[2px] ${c.dansPeriode ? `${COULEURS[niveau(c.nombre, data.maximum)]} hover:ring-1 hover:ring-emerald-600 cursor-pointer` : ''}`}
                  onMouseEnter={c.dansPeriode ? (e) => {
                    const r = (e.target as HTMLElement).getBoundingClientRect();
                    const p = (e.target as HTMLElement).closest('.relative')!.getBoundingClientRect();
                    setSurvol({ c, x: r.left - p.left + r.width / 2, y: r.top - p.top - 6 });
                  } : undefined}
                  onMouseLeave={() => setSurvol(null)}
                />
              )),
            )}
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-gray-400">
          <span>{t('less')}</span>
          {COULEURS.map((c) => <span key={c} className={`w-2.5 h-2.5 rounded-[2px] ${c}`} />)}
          <span>{t('more')}</span>
        </div>
      </div>

      {survol && (
        <div
          className="absolute z-50 bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full"
          style={{ left: survol.x, top: survol.y }}
        >
          <p className="font-medium">{fmtDate.format(survol.c.ts)}</p>
          <p className="text-gray-300">{t('validated_rows_count', { count: survol.c.nombre })}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
