"use client";

import React from 'react';
import {
  CheckCircle,
  TrendingUp,
  Clock,
  ScanLine,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

const stats = [
  {
    title: 'Data Validation Rate',
    value: '98.5%',
    change: '+2.1%',
    positive: true,
    icon: CheckCircle,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Operator Performance Score',
    value: '92.0%',
    change: '+1.5%',
    positive: true,
    icon: TrendingUp,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Avg. Processing Time',
    value: '45s',
    change: '-5s',
    positive: true,
    icon: Clock,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'OCR Success Rate',
    value: '96.8%',
    change: '+0.8%',
    positive: true,
    icon: ScanLine,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Daily Validations',
    value: '14,500',
    change: '+12%',
    positive: true,
    icon: FileCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Pending Review',
    value: '1,200',
    change: '-300',
    positive: false,
    icon: AlertCircle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3 hover:shadow-md transition-shadow duration-200"
        >
          <div className={`${stat.iconBg} p-2 rounded-lg shrink-0`}>
            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 truncate leading-tight">{stat.title}</p>
            <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{stat.value}</p>
            <span
              className={`text-[11px] font-medium ${
                stat.positive ? 'text-emerald-600' : 'text-orange-600'
              }`}
            >
              ({stat.change})
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
