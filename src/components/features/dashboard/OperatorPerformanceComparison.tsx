"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

const data = [
  { name: 'Sarah J.', processed: 22000, errors: 1200 },
  { name: 'Michael K.', processed: 19500, errors: 800 },
  { name: 'Emily R.', processed: 17000, errors: 1500 },
  { name: 'David L.', processed: 15000, errors: 900 },
  { name: 'Jessica T.', processed: 12000, errors: 600 },
];

export default function OperatorPerformanceComparison() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("operator_comparison_title")}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value: any) => value.toString()}
            />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: '11px', color: '#6b7280' }}
            />
            <Bar dataKey="processed" name={t("processed")} fill="#1e40af" radius={[3, 3, 0, 0]} barSize={18} />
            <Bar dataKey="errors" name={t("errors_label")} fill="#22c55e" radius={[3, 3, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
