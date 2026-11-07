"use client";

import React from 'react';
import {
  Clock,
  ScanLine,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/translations';

type IconConfig = { icon: React.ComponentType<{ className?: string }>; bg: string; color: string };

// Icône par code de statistique (`DashboardStat.code`).
const iconMap: Record<string, IconConfig> = {
  TOTAL_SCANS: { icon: ScanLine, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  PROCESSED_ROWS: { icon: FileCheck, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  PENDING_REVIEWS: { icon: Clock, bg: 'bg-orange-50', color: 'text-orange-500' },
  REJECTED_ROWS: { icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-500' },
};

// Codes renvoyés par le backend (`DashboardStat.code`) → clés de traduction.
const CODE_KEYS: Record<string, TranslationKey> = {
  TOTAL_SCANS: 'stat_total_scans',
  PROCESSED_ROWS: 'stat_processed_rows',
  PENDING_REVIEWS: 'stat_pending_reviews',
  REJECTED_ROWS: 'stat_rejected_rows',
};

export default function StatsCards() {
  const { t } = useTranslation();
  const { data: stats = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: DashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24 bg-white rounded-xl border border-gray-100">
        <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
      </div>
    );
  }

  if (isError || stats.length === 0) {
    return (
      <div className="flex justify-center items-center h-24 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500 text-sm">{t("no_stats_available")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const iconConfig = (stat.code && iconMap[stat.code]) || { icon: AlertCircle, bg: 'bg-gray-50', color: 'text-gray-500' };
        const IconComponent = iconConfig.icon;

        return (
          <div
            key={stat.title}
            className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`${iconConfig.bg} p-2 rounded-lg shrink-0`}>
              <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 truncate leading-tight">{stat.code && CODE_KEYS[stat.code] ? t(CODE_KEYS[stat.code]) : stat.title}</p>
              <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{stat.value}</p>
              <span
                className={`text-[11px] font-medium ${stat.positive ? 'text-emerald-600' : 'text-orange-600'
                  }`}
              >
                ({stat.change})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
