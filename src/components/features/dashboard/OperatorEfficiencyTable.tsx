"use client";

import { useTranslation } from '@/hooks/useTranslation';
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { Loader2 } from 'lucide-react';

type Operator = {
  name: string;
  totalValidations: number;
  /** Délai moyen envoi → validation, en secondes (null : aucune donnée). */
  delaiSecondes: number | null;
  /** Lignes validées / lignes revues, en % (null : aucune ligne revue). */
  tauxValidation: number | null;
  status: 'Active' | 'Inactive';
};

/** Actif = au moins une ligne revue dans les 7 derniers jours. */
const DELAI_ACTIF_MS = 7 * 24 * 60 * 60 * 1000;

/** 5400 → « 1 h 30 min » ; 90 → « 2 min » ; 2 j+ → « 2 j 3 h ». */
function formaterDelai(secondes: number | null): string {
  if (secondes == null) return '—';
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `${Math.max(1, minutes)} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 48) return `${heures} h ${String(minutes % 60).padStart(2, '0')} min`;
  return `${Math.floor(heures / 24)} j ${heures % 24} h`;
}

const columnHelper = createColumnHelper<Operator>();

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Inactive: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL_KEYS = {
  'Active': 'efficiency_status_active',
  'Inactive': 'efficiency_status_inactive',
} as const;

export default function OperatorEfficiencyTable() {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { data: operatorData = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-operator-efficiency'],
    queryFn: async () => {
      const res = await DashboardService.getOperatorEfficiency();
      // Map backend model to frontend model for the table
      return res.map(op => ({
        name: op.operator,
        totalValidations: op.processed,
        delaiSecondes: op.delai_moyen_secondes ?? null,
        tauxValidation: op.taux_validation ?? null,
        status: op.derniere_activite && Date.now() - new Date(op.derniere_activite).getTime() < DELAI_ACTIF_MS
          ? 'Active'
          : 'Inactive',
      } as Operator));
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t("efficiency_column_operator"),
        cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
      }),
      columnHelper.accessor('totalValidations', {
        header: t("efficiency_column_validated"),
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('delaiSecondes', {
        header: t("efficiency_column_time"),
        cell: (info) => formaterDelai(info.getValue()),
      }),
      columnHelper.accessor('tauxValidation', {
        header: t("efficiency_column_accuracy"),
        cell: (info) => (info.getValue() == null ? '—' : `${info.getValue()} %`),
      }),
      columnHelper.accessor('status', {
        header: t("efficiency_column_status"),
        cell: (info) => {
          const status = info.getValue();
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusStyles[status]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t(STATUS_LABEL_KEYS[status])}
            </span>
          );
        },
      }),
    ],
    [t]
  );

  const table = useReactTable({
    data: operatorData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("efficiency_table_title")}</h3>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-2 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#65b741] mx-auto mb-2" />
                  {t("loading_efficiency")}
                </td>
              </tr>
            ) : isError || operatorData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {t("no_data_available")}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap border-b border-gray-50">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-50 mt-auto">
        <span className="text-[11px] text-gray-500 mr-2">
          {t('page_n', { page: table.getState().pagination.pageIndex + 1 })}
        </span>
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <span className="w-6 h-6 flex items-center justify-center text-[11px] font-medium bg-gray-100 rounded text-gray-700">
          {table.getState().pagination.pageIndex + 1}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
