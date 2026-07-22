"use client";

import React from 'react';
import {
  CheckCircle,
  TrendingUp,
  Clock,
  ScanLine,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';

// Icons map based on backend title (or you could map by ID)
const iconMap: Record<string, any> = {
  'Data Validation Rate': { icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  'Operator Performance Score': { icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  'Avg. Processing Time': { icon: Clock, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  'OCR Success Rate': { icon: ScanLine, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  'Daily Validations': { icon: FileCheck, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  'Pending Review': { icon: AlertCircle, bg: 'bg-orange-50', color: 'text-orange-500' },
};

export default function StatsCards() {
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
        <p className="text-gray-500 text-sm">No stats available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const iconConfig = iconMap[stat.title] || { icon: AlertCircle, bg: 'bg-gray-50', color: 'text-gray-500' };
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
              <p className="text-[11px] text-gray-500 truncate leading-tight">{stat.title}</p>
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
