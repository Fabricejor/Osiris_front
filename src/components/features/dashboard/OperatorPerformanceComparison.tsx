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

const data = [
  { name: 'PS Potou', processed: 126, errors: 4 },
  { name: 'CS Médina', processed: 168, errors: 6 },
  { name: 'HR Fatick', processed: 95, errors: 8 },
  { name: 'Nabil Choucair', processed: 110, errors: 3 },
  { name: 'Dalal Jamm', processed: 85, errors: 2 },
];

export default function OperatorPerformanceComparison() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Validation par Structure Sanitaire</h3>
        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          Actes vs Alertes
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
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
              formatter={(value: any, name: any) => {
                if (name === 'processed') return [`${value} actes validés`, 'Validés'];
                return [`${value} alertes résolues`, 'Alertes'];
              }}
            />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#6b7280' }}
            />
            <Bar dataKey="processed" name="Actes validés" fill="#08704F" radius={[3, 3, 0, 0]} barSize={16} />
            <Bar dataKey="errors" name="Alertes résolues" fill="#F59E0B" radius={[3, 3, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
