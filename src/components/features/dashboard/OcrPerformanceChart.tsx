"use client";

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

const rawData = [
  { labelEn: 'Prescription', labelFr: 'Prescription', value: 32 },
  { labelEn: 'Lab Report', labelFr: 'Rapport Labo', value: 28 },
  { labelEn: 'Invoice', labelFr: 'Facture', value: 22 },
  { labelEn: 'Consent', labelFr: 'Consentement', value: 18 },
  { labelEn: 'Other', labelFr: 'Autre', value: 12 },
];

const COLORS = ['#08704F', '#7BC148', '#4ade80', '#86efac', '#bbf7d0'];

export default function OcrPerformanceChart() {
  const { t, language } = useTranslation();

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      name: language === 'fr' ? d.labelFr : d.labelEn
    }));
  }, [language]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{t("ocr_performance")}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
