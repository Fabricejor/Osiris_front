"use client";

import React from 'react';
// eslint-disable-next-line
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Verified', value: 75, color: '#22c55e' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Rejected', value: 10, color: '#ef4444' },
];

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function ValidationStatusDistribution() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Validation Status Distribution</h3>
      <div className="flex-1 min-h-0 flex items-center">
        <div className="w-3/5 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry) => (
                  // eslint-disable-next-line
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-2/5 space-y-2.5 pl-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-gray-600">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
