"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { Loader2 } from 'lucide-react';

const RADIAN = Math.PI / 180;

const STATUS_COLORS: Record<string, string> = {
  'Verified': '#22c55e',
  'Pending': '#f59e0b',
  'Rejected': '#ef4444',
};

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
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-validation-status'],
    queryFn: DashboardService.getValidationStatus,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
      </div>
    );
  }

  if (isError || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{t("validation_status_title")}</h3>
      <div className="flex-1 min-h-0 flex items-center">
        <div className="w-3/5 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius="80%"
                fill="#8884d8"
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
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
                style={{ backgroundColor: STATUS_COLORS[entry.name] || '#9ca3af' }}
              />
              <span className="text-[11px] text-gray-600">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
