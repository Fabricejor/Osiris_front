"use client";

import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

const data = [
  { date: 'Mar 18', records: 4500, rate: 18 },
  { date: 'Mar 19', records: 5200, rate: 20 },
  { date: 'Mar 10', records: 4800, rate: 19 },
  { date: 'Mar 11', records: 5500, rate: 22 },
  { date: 'Mar 12', records: 6200, rate: 25 },
  { date: 'Mar 13', records: 7000, rate: 28 },
  { date: 'Mar 14', records: 6800, rate: 27 },
  { date: 'Mar 15', records: 12500, rate: 50 },
  { date: 'Mar 16', records: 8500, rate: 34 },
  { date: 'Mar 17', records: 9000, rate: 36 },
  { date: 'Mar 18', records: 7500, rate: 30 },
  { date: 'Mar 19', records: 8200, rate: 33 },
  { date: 'Mar 20', records: 7000, rate: 28 },
  { date: 'Mar 23', records: 8800, rate: 35 },
  { date: 'Mar 24', records: 9500, rate: 38 },
  { date: 'Mar 25', records: 10000, rate: 40 },
];

const BAR_COLORS = ['#08704F', '#0a8a63', '#7BC148', '#4ade80', '#08704F', '#0a8a63'];

export default function DataProcessingVolumes() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("data_volumes_title")}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#08704F" stopOpacity={1} />
                <stop offset="100%" stopColor="#7BC148" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'records') return [`${value.toLocaleString()} ${t("records").toLowerCase()}`, t("volume_scanned")];
                return [`${value}%`, t("efficiency")];
              }}
              labelFormatter={(label) => `${label}, 2024`}
            />
            <Bar yAxisId="left" dataKey="records" radius={[3, 3, 0, 0]} barSize={20}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} opacity={0.85} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rate"
              stroke="#08704F"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#08704F', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
