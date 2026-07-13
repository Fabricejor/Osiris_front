"use client";

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

const rawData = [
  { nameKey: 1, value: 22 },
  { nameKey: 2, value: 25 },
  { nameKey: 3, value: 28 },
  { nameKey: 4, value: 30 },
  { nameKey: 5, value: 29 },
  { nameKey: 6, value: 32 },
  { nameKey: 7, value: 35 },
  { nameKey: 8, value: 38 },
  { nameKey: 9, value: 40 },
  { nameKey: 10, value: 42 },
  { nameKey: 11, value: 44 },
  { nameKey: 12, value: 45 },
];

export default function ProcessingEfficiencyChart() {
  const { t, language } = useTranslation();

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      name: language === 'fr' ? `Sem. ${d.nameKey}` : `Week ${d.nameKey}`
    }));
  }, [language]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("processing_efficiency")}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7BC148" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7BC148" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}s`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value: any) => [`${value}s`, t("processing_time")]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#7BC148"
              strokeWidth={2.5}
              fill="url(#colorEfficiency)"
              dot={false}
              activeDot={{ r: 5, fill: '#7BC148', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
