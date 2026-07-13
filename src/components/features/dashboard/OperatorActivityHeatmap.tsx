"use client";

import React, { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const daysFr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const hours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];

// Generate random activity data (0-4 intensity)
function generateData() {
  return daysEn.map(() =>
    daysEn.map(() => Math.floor(Math.random() * 5))
  );
}

const levelsEn = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const levelsFr = ['Très faible', 'Faible', 'Modérée', 'Élevée', 'Très élevée'];

const COLORS = [
  'bg-green-100',   // 0 - Very Low
  'bg-yellow-200',  // 1 - Low
  'bg-yellow-400',  // 2 - Moderate
  'bg-orange-400',  // 3 - High
  'bg-red-500',     // 4 - Very High
];

const heatData = generateData();

type HoverInfo = { row: number; col: number; x: number; y: number } | null;

export default function OperatorActivityHeatmap() {
  const [hover, setHover] = useState<HoverInfo>(null);
  const { t, language } = useTranslation();

  const columns = useMemo(() => {
    return language === 'fr' ? daysFr : daysEn;
  }, [language]);

  const rows = useMemo(() => {
    return language === 'fr' ? daysFr : daysEn;
  }, [language]);

  const levelLabels = useMemo(() => {
    return language === 'fr' ? levelsFr : levelsEn;
  }, [language]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col relative">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("operator_activity_title")}</h3>
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Column headers */}
        <div className="flex mb-1.5">
          <div className="w-10 shrink-0" />
          {columns.map((col, i) => (
            <span key={`col-${col}-${i}`} className="flex-1 text-[10px] font-medium text-gray-500 text-center">
              {col}
            </span>
          ))}
          <div className="w-10 shrink-0" />
        </div>

        {/* Rows */}
        <div className="flex-1 flex flex-col gap-[3px] justify-center min-h-0 py-1">
          {heatData.map((row, rowIndex) => (
            <div key={`row-${rows[rowIndex]}-${rowIndex}`} className="flex-1 flex items-stretch gap-[3px] min-h-0">
              <span className="text-[10px] text-gray-500 w-10 text-right pr-2 shrink-0 flex items-center justify-end">
                {rows[rowIndex]}
              </span>
              {row.map((level, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`flex-1 rounded-sm ${COLORS[level]} transition-colors duration-150 cursor-pointer hover:ring-1 hover:ring-gray-400`}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const parent = (e.target as HTMLElement).closest('.relative')!.getBoundingClientRect();
                    setHover({
                      row: rowIndex,
                      col: colIndex,
                      x: rect.left - parent.left + rect.width / 2,
                      y: rect.top - parent.top - 8,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
              <span className="text-[10px] text-gray-400 w-10 pl-2 shrink-0 flex items-center">
                {hours[rowIndex] || ''}
              </span>
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
          <p className="font-medium">{rows[hover.row]} — {columns[hover.col]}</p>
          <p className="text-gray-300">Activity: {levelLabels[heatData[hover.row][hover.col]]}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
