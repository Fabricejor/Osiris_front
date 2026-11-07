"use client";

/**
 * Pages par statut de traitement, dans l'ordre du circuit (reçue → validée /
 * rejetée, puis anomalies). Le backend renvoie des codes de statut et des
 * nombres de pages ; libellés traduits ici.
 */
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardService } from '@/services/dashboard.service';
import { STATUTS_TRAITEMENT } from './libelles';

const COULEUR: Record<string, string> = {
  VALIDE: '#22c55e',
  REJETEE: '#ef4444',
  FUSION_INCOMPLETE: '#f59e0b',
  ECHEC_RECALAGE: '#f59e0b',
  ECHEC_OCR: '#f59e0b',
};

export default function ProcessingEfficiencyChart() {
  const { t } = useTranslation();
  const { data: brut = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-processing-efficiency'],
    queryFn: DashboardService.getProcessingEfficiency,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
      </div>
    );
  }

  if (isError || brut.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">{t("no_data_available")}</p>
      </div>
    );
  }

  const parCode = new Map(brut.map((d) => [d.code ?? d.name, d.value]));
  const connus = new Set(STATUTS_TRAITEMENT.map(([code]) => code));
  const data = [
    // Statuts présents, dans l'ordre du circuit…
    ...STATUTS_TRAITEMENT.filter(([code]) => parCode.has(code)).map(([code, cle]) => ({
      code, nom: t(cle), value: parCode.get(code) ?? 0,
    })),
    // … puis tout statut inconnu du front (nouveau statut backend), sans le perdre.
    ...brut.filter((d) => !connus.has(d.code ?? d.name)).map((d) => ({ code: d.name, nom: d.name, value: d.value })),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("processing_efficiency")}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="nom" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value) => [t('pages_count', { count: Number(value) }), '']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
              {data.map((d) => <Cell key={d.code} fill={COULEUR[d.code] ?? '#7BC148'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
