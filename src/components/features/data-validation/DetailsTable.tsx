"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileJson,
  ExternalLink,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { FolderStatus } from '@/components/ui/folderUI';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

type PatientData = {
  id: string;
  age: number;
  gender: string;
  diagnosisCode: string;
  labResult: string;
  date: string;
  status: FolderStatus;
};

// Mock data based on the provided image
const patientData: PatientData[] = [
  { id: '9a8b7c6d-e5f4-4g3h...', age: 72, gender: 'Female', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'pending' },
  { id: '3d2e1f0a-b9c8-7d6e...', age: 45, gender: 'Male', diagnosisCode: 'I10.0', labResult: 'HbA1c 6.8%', date: '10/25/2024', status: 'validated' },
  { id: '7f6e5d4c-a3b2-1c0d...', age: 45, gender: 'Male', diagnosisCode: 'J45.9', labResult: 'FEV1 78%', date: '10/24/2024', status: 'validated' },
  { id: '1b0a9c8d-7e6f-5g4h...', age: 38, gender: 'Male', diagnosisCode: 'K57.3', labResult: 'CRP 12mg/L', date: '10/24/2024', status: 'rejected' },
  { id: '5h4g3f2e-1d0c-9b8a...', age: 72, gender: 'Female', diagnosisCode: 'E11.9', labResult: 'HbA1c 8.1%', date: '10/23/2024', status: 'pending' },
  { id: '2c3d4e5f-6g7h-8i9j...', age: 60, gender: 'Female', diagnosisCode: 'M54.5', labResult: 'ESR 45mm/h', date: '10/23/2024', status: 'anomaly' },
  { id: '8j9i0h1g-2f3e-4d5c...', age: 46, gender: 'Male', diagnosisCode: 'F32.1', labResult: 'TSH 2.1mU/L', date: '10/22/2024', status: 'pending' },
  { id: '4d5e6f7g-8h9i-0j1k...', age: 45, gender: 'Male', diagnosisCode: 'G43.9', labResult: 'CBC Normal', date: '10/22/2024', status: 'validated' },
  { id: '6f7g8h9i-0j1k-2l3m...', age: 70, gender: 'Female', diagnosisCode: 'N18.3', labResult: 'eGFR 42mL/min', date: '10/21/2024', status: 'rejected' },
  { id: '0k1l2m3n-4o5p-6q7r...', age: 45, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.0%', date: '10/21/2024', status: 'validated' },
  { id: '9r8q7p6o-5n4m-3l2k...', age: 48, gender: 'Female', diagnosisCode: 'L40.0', labResult: 'PASI 8.5', date: '10/20/2024', status: 'pending' },
];

const columnHelper = createColumnHelper<PatientData>();

const STATUS_TAG: Record<FolderStatus, { bg: string; text: string; dot: string }> = {
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  validated: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected:  { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
  anomaly:   { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500' },
};

interface DetailsTableProps {
  search: string;
  statusFilter: FolderStatus | 'all';
}

const IdCell = (info: any) => (
  <span className="font-mono text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
    {info.getValue()}
  </span>
);

export default function DetailsTable({ search, statusFilter }: Readonly<DetailsTableProps>) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { t } = useTranslation();

  const StatusCell = useMemo(() => (info: any) => {
    const status = info.getValue() as FolderStatus;
    const statusTag = STATUS_TAG[status];
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusTag.bg} ${statusTag.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusTag.dot}`} />
        {t(status as any)}
      </span>
    );
  }, [t]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t("patient_id"),
        cell: IdCell,
      }),
      columnHelper.accessor('age', {
        header: t("age"),
      }),
      columnHelper.accessor('gender', {
        header: t("gender"),
      }),
      columnHelper.accessor('diagnosisCode', {
        header: t("diagnosis"),
      }),
      columnHelper.accessor('labResult', {
        header: t("lab_result"),
      }),
      columnHelper.accessor('date', {
        header: t("date"),
      }),
      columnHelper.accessor('status', {
        header: t("status"),
        cell: StatusCell,
      }),
    ],
    [t, StatusCell]
  );

  const filteredData = useMemo(() => {
    return patientData.filter((p) => {
      const matchesSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.diagnosisCode.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  // Stat counts
  const stats = useMemo(() => {
    const data = filteredData;
    return {
      total: data.length,
      validated: data.filter(d => d.status === 'validated').length,
      pending: data.filter(d => d.status === 'pending').length,
      rejected: data.filter(d => d.status === 'rejected').length,
      anomaly: data.filter(d => d.status === 'anomaly').length,
    };
  }, [filteredData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
      {/* Main Table Card */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Table Header / Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Mini stats */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{stats.total}</span>
              <span className="text-xs text-gray-400">{t("records")}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              {[
                { label: t("validated"), count: stats.validated, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                { label: t("pending"), count: stats.pending, color: 'text-amber-600', dot: 'bg-amber-500' },
                { label: t("rejected"), count: stats.rejected, color: 'text-red-600', dot: 'bg-red-500' },
                { label: t("anomaly"), count: stats.anomaly, color: 'text-blue-600', dot: 'bg-blue-500' },
              ].map(s => (
                <span key={s.label} className={`inline-flex items-center gap-1 text-[11px] font-semibold ${s.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.count}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <FileJson className="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 sticky top-0 z-10 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className="text-left py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-800 hover:bg-gray-100/60 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-emerald-500" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-gray-300" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-gray-600 text-[13px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-gray-400 text-sm">
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400">
            {filteredData.length} {t("total")} · {t("page_of", { page: table.getState().pagination.pageIndex + 1, total: Math.max(table.getPageCount(), 1) })}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg hover:bg-white hover:border hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg hover:bg-white hover:border hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <span className="px-3 py-1 text-xs font-bold bg-gray-900 text-white rounded-lg min-w-[28px] text-center">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg hover:bg-white hover:border hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg hover:bg-white hover:border hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Info Panel */}
      <aside className="shrink-0 w-[280px] bg-white border border-gray-100 rounded-2xl flex flex-col overflow-y-auto shadow-sm" style={{ scrollbarWidth: 'thin' }}>
        {/* Open button */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => router.push('/dashboard/data-validation/2026-0035')}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
          >
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            {t("open_batch")}
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t("info")}</h3>
        </div>

        <div className="px-4 pb-4 space-y-4">
          {/* Status breakdown */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 space-y-2.5">
            {[
              { label: t("validated"), count: stats.validated, total: stats.total, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
              { label: t("pending"), count: stats.pending, total: stats.total, color: 'bg-amber-500', textColor: 'text-amber-700' },
              { label: t("rejected"), count: stats.rejected, total: stats.total, color: 'bg-red-500', textColor: 'text-red-700' },
              { label: t("anomaly"), count: stats.anomaly, total: stats.total, color: 'bg-blue-500', textColor: 'text-blue-700' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-semibold ${s.textColor}`}>{s.label}</span>
                  <span className="text-[11px] font-bold text-gray-600">{s.count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${s.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: s.total > 0 ? `${(s.count / s.total) * 100}%` : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100" />

          {/* Data Volume */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-700">{t("storage")}</h4>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-gray-500 font-medium">3.5 TB <span className="text-gray-400 font-normal">/ 5 TB</span></p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Export Status */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-700">{t("status")}</h4>
            </div>
            <p className="text-xs text-gray-500">Last Export: 10/24/2024 — CSV format</p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Recent Activities */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-700">{t("activity_log")}</h4>
            </div>
            <div className="space-y-3 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gray-100">
              {[
                { label: 'Export entries', time: '10/24/2024', color: 'bg-emerald-400' },
                { label: 'Batch validated', time: '10/24/2024', color: 'bg-emerald-400' },
                { label: 'Anomaly flagged', time: '10/23/2024', color: 'bg-blue-400' },
                { label: 'Records imported', time: '10/22/2024', color: 'bg-gray-300' },
              ].map((activity, i) => (
                <div key={`${activity.label}-${i}`} className="flex items-start gap-2.5 relative z-10">
                  <span className={`w-2.5 h-2.5 rounded-full ${activity.color} mt-0.5 shrink-0 ring-2 ring-white`} />
                  <div>
                    <p className="text-xs text-gray-700 font-medium">{activity.label}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />{activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Tags */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">{t("tags")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Clinical', 'De-identified', 'Cardiology'].map((tag) => (
                <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
