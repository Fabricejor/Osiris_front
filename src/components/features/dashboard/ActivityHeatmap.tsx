"use client";

import { useTranslation } from '@/hooks/useTranslation';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { Loader2 } from 'lucide-react';

const INTENSITY_COLORS = [
  'bg-gray-100',
  'bg-emerald-100',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-600',
];

function getIntensity(val: number) {
  if (val === 0) return 0;
  if (val < 30) return 1;
  if (val < 60) return 2;
  if (val < 90) return 3;
  return 4;
}

export default function ActivityHeatmap() {
  const { t, language } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-activity-heatmap'],
    queryFn: DashboardService.getActivityHeatmap,
  });

  const [hover, setHover] = useState<{ row: number; col: number; x: number; y: number } | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
      </div>
    );
  }

  if (isError || !data || !data.data) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const { months, data: heatmapData } = data;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col relative">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{t("activity_heatmap_title")}</h3>
      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {/* Month headers */}
        <div className="flex mb-1 ml-5">
          {months.map((month, i) => (
            <span key={`${month}-${i}`} className="flex-1 text-[9px] text-gray-400 text-center">
              {month}
            </span>
          ))}
        </div>
        {/* Heatmap grid */}
        <div className="space-y-[3px]">
          {heatmapData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-[3px]">
              <span className="text-[9px] text-gray-400 w-5 text-right flex-none">{rowIndex + 1}</span>
              {row.map((val, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex-1 w-3 h-3 rounded-[2px] ${INTENSITY_COLORS[getIntensity(val)]} transition-colors duration-150 cursor-pointer hover:ring-1 hover:ring-emerald-500`}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const parent = (e.target as HTMLElement).closest('.relative')!.getBoundingClientRect();
                    setHover({ row: rowIndex, col: colIndex, x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top - 8 });
                  }}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Tooltip */}
      {hover && (
        <div
          className="absolute z-50 bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full"
          style={{ left: hover.x, top: hover.y }}
        >
          <p className="font-medium">
            {months[hover.col]}, {language === 'fr' ? `Sem. ${hover.row + 1}` : `Week ${hover.row + 1}`}
          </p>
          <p className="text-gray-300">{heatmapData[hover.row][hover.col]} {t("records").toLowerCase()}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
