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

const data = [
  { date: '01 Août', records: 18, rate: 94 },
  { date: '03 Août', records: 24, rate: 95 },
  { date: '05 Août', records: 22, rate: 96 },
  { date: '07 Août', records: 30, rate: 95 },
  { date: '09 Août', records: 28, rate: 97 },
  { date: '11 Août', records: 35, rate: 98 },
  { date: '13 Août', records: 42, rate: 96 },
  { date: '15 Août', records: 38, rate: 97 },
  { date: '17 Août', records: 45, rate: 98 },
  { date: '19 Août', records: 32, rate: 97 },
  { date: '21 Août', records: 40, rate: 98 },
  { date: '23 Août', records: 48, rate: 99 },
];

const BAR_COLORS = ['#08704F', '#0a8a63', '#7BC148', '#10B981', '#059669', '#34D399'];

export default function DataProcessingVolumes() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Volumes de Pages Numérisées & Taux de Précision OCR
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          Moyenne : <strong className="text-emerald-700">33.5 pages / jour</strong> · Précision : <strong className="text-emerald-700">96.9%</strong>
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
              domain={[0, 60]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[90, 100]}
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
                if (name === 'records') return [`${value} pages scannées`, 'Volume'];
                return [`${value}%`, 'Précision OCR'];
              }}
            />
            <Bar yAxisId="left" dataKey="records" radius={[3, 3, 0, 0]} barSize={18}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} opacity={0.85} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rate"
              stroke="#08704F"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#08704F' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
