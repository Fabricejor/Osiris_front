"use client";

import { useTranslation } from '@/hooks/useTranslation';
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

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { Loader2 } from 'lucide-react';

export default function OperatorPerformanceComparison() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-operator-comparison'],
    queryFn: DashboardService.getOperatorComparison,
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
