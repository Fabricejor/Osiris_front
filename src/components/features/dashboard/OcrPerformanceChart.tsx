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
  Cell,
} from 'recharts';

const data = [
  { name: 'Accouchements (ACC)', value: 45, count: '189 pages' },
  { name: 'Prénatales (CPN)', value: 30, count: '126 pages' },
  { name: 'Postnatales (CPON)', value: 15, count: '63 pages' },
  { name: 'Après Avortement (SAA)', value: 10, count: '42 pages' },
];

const COLORS = ['#08704F', '#10B981', '#34D399', '#6EE7B7'];

export default function OcrPerformanceChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Typologie des Registres</h3>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          420 pages
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
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
              formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.count})`, 'Proportion']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={26}>
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
