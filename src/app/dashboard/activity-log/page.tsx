"use client";

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

import { AuditService } from '@/services/audit.service';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';
import type { AuditLog } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/hooks/useTranslation';

// Mock data removed

export default function ActivityLogPage() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => AuditService.getLogs(100, 0),
  });

  const gridTemplate = "grid-cols-[100px_200px_minmax(250px,_1fr)_120px_100px_120px]";

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">{t("success_status")}</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">{t("pending")}</span>;
      case 'error':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200">{t("error_status")}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  const filteredLogs = React.useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((log: AuditLog) => {
      const logUser = log.id_utilisateur_acteur || 'System';
      const logAction = log.type_action || '';
      const logStatus = log.status || 'Success'; // Fallback if still missing

      const matchSearch = logUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        logAction.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'All' || logStatus.toLowerCase() === statusFilter.toLowerCase();

      let matchAction = true;
      if (actionFilter !== 'All') {
        matchAction = logAction.toLowerCase().includes(actionFilter.toLowerCase());
      }

      return matchSearch && matchStatus && matchAction;
    });
  }, [data, searchQuery, statusFilter, actionFilter]);

  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.date_action);
      let dateStr = format(date, 'MMM d, yyyy');

      if (isToday(date)) dateStr = `Today - ${dateStr}`;
      else if (isYesterday(date)) dateStr = `Yesterday - ${dateStr}`;

      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push({
        id: log.id,
        time: format(date, 'hh:mm a'),
        user: log.user_name || log.id_utilisateur_acteur || 'System',
        action: log.type_action,
        docId: log.id_ressource || '-',
        status: log.status || 'Success',
        ip: log.ip_address || '-',
        avatar: `https://ui-avatars.com/api/?name=${log.user_name || log.id_utilisateur_acteur || 'Sys'}`
      });
    });

    return Object.entries(groups).map(([dateStr, logs]) => ({
      dateStr,
      logs
    }));
  }, [filteredLogs]);

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

      {/* Header */}
      <PageHeader title="Activity Log" />
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{t("activity_log_subtitle")}</p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex-wrap">

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="searchInput" className="block text-xs font-bold text-gray-700 mb-1.5">{t("search_folders")}</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="searchInput"
              type="text"
              placeholder={t("search_logs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#65b741] focus:border-transparent text-gray-700 font-medium"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="w-[240px]">
          <span id="dateRangeLabel" className="block text-xs font-bold text-gray-700 mb-1.5">{t("date_range")}</span>
          <button aria-labelledby="dateRangeLabel" className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Oct 1, 2023 - Oct 31, 2023</span>
            </div>
          </button>
        </div>

        {/* Status */}
        <fieldset className="flex flex-col">
          <legend className="block text-xs font-bold text-gray-700 mb-1.5">{t("status")}</legend>
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white h-[38px]">
            <button onClick={() => setStatusFilter('All')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t("all_filter")}</button>
            <button onClick={() => setStatusFilter('Success')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'Success' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>{t("success_status")}</button>
            <button onClick={() => setStatusFilter('Pending')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'Pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>{t("pending")}</button>
            <button onClick={() => setStatusFilter('Error')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'Error' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>{t("error_status")}</button>
          </div>
        </fieldset>

        {/* Action Type */}
        <fieldset className="flex flex-col">
          <legend className="block text-xs font-bold text-gray-700 mb-1.5">{t("action_type")}</legend>
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white h-[38px]">
            <button onClick={() => setActionFilter('All')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t("all_filter")}</button>
            <button onClick={() => setActionFilter('Access')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'Access' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>{language === 'fr' ? 'Accès' : 'Access'}</button>
            <button onClick={() => setActionFilter('Edit')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'Edit' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>{t("edit_action")}</button>
            <button onClick={() => setActionFilter('Upload')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'Upload' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>{language === 'fr' ? 'Téléchargement' : 'Upload'}</button>
          </div>
        </fieldset>

        {/* Filter Button */}
        <div className="flex items-end h-[58px]">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors h-[38px] shadow-sm">
            <Filter className="w-4 h-4" /> {language === 'fr' ? 'Filtrer' : 'Filter'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">

        {/* Table Headers */}
        <div className={`grid ${gridTemplate} gap-4 mb-6 ml-10 text-sm font-bold text-gray-500`}>
          <div>Timestamp</div>
          <div>{t("user_column")}</div>
          <div>{t("action_column")}</div>
          <div>{t("doc_id_column")}</div>
          <div>{t("status")}</div>
          <div>{t("ip_column")}</div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {groupedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <Search className="w-8 h-8 opacity-50" />
              <p>No activity logs match your filters.</p>
            </div>
          ) : groupedLogs.map((group) => (
            <div key={group.dateStr} className="mb-10 last:mb-0">
              {/* Group Date Header */}
              <h2 className="text-lg font-bold text-gray-900 mb-4">{group.dateStr}</h2>

              <div className="relative pl-10 space-y-4">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-[-16px] w-[2px] bg-gray-200" />

                {group.logs.map((log, index) => (
                  <div key={log.id || `log-${index}`} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute left-[-26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-gray-300 bg-white z-10 group-hover:border-[#65b741] transition-colors" />

                    {/* Row Card */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow hover:border-[#65b741]/30">
                      <div className={`grid ${gridTemplate} gap-4 items-center`}>
                        {/* Timestamp */}
                        <div className="text-sm font-bold text-gray-600">{log.time}</div>

                        {/* User */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img src={log.avatar} alt={log.user} width={32} height={32} className="object-cover w-full h-full" />
                          </div>
                          <span className="text-sm font-bold text-gray-800">{log.user}</span>
                        </div>

                        {/* Action */}
                        <div className="text-sm font-semibold text-gray-700 truncate pr-4">{log.action}</div>

                        {/* Document ID */}
                        <div className="text-sm font-bold text-gray-500">{log.docId}</div>

                        {/* Status */}
                        <div>{getStatusBadge(log.status)}</div>

                        {/* IP Address */}
                        <div className="text-sm font-medium text-gray-500">{log.ip}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 mt-8 border-t border-gray-100 pt-6">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-300 text-gray-800 text-sm font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-gray-500 hover:bg-gray-50 text-sm font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-gray-500 hover:bg-gray-50 text-sm font-bold">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-gray-500 hover:bg-gray-50 text-sm font-bold">10</button>
          </div>

          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
