"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { Loader2 } from 'lucide-react';

const COLORS = ['#08704F', '#7BC148', '#d1fae5'];

export default function OcrConfidenceChart() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-ocr-confidence'],
    queryFn: DashboardService.getOcrConfidence,
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
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{t("ocr_confidence")}</h3>
      <div className="flex-1 min-h-0 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 space-y-2 pl-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-[11px] text-gray-600">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
