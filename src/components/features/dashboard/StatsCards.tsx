"use client";

import React from 'react';
import {
  CheckCircle,
  TrendingUp,
  Clock,
  ScanLine,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const stats = [
  {
    title: 'Taux de Validation Conforme',
    value: '98.2%',
    change: '+1.4%',
    positive: true,
    icon: CheckCircle,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Précision Extraction OCR',
    value: '97.6%',
    change: '+2.1%',
    positive: true,
    icon: ScanLine,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Temps Moyen OCR / Page',
    value: '3.4s',
    change: '-0.8s',
    positive: true,
    icon: Clock,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Recalage Géométrique (ECC)',
    value: '0.88',
    change: 'Optimal (>=0.55)',
    positive: true,
    icon: TrendingUp,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Registres Numérisés (Lots)',
    value: '14 lots',
    change: '420 doubles pages',
    positive: true,
    icon: BookOpen,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Alertes / À Réviser',
    value: '3 lots',
    change: 'Ratures & contrastes',
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
          className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-start gap-3 hover:shadow-md transition-shadow duration-200"
        >
          <div className={`${stat.iconBg} p-2 rounded-lg shrink-0`}>
            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-500 truncate leading-tight">{stat.title}</p>
            <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{stat.value}</p>
            <span
              className={`text-[10px] font-medium ${
                stat.positive ? 'text-emerald-600' : 'text-orange-600'
              }`}
            >
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
