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
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Loader2 } from 'lucide-react';
import type { FolderStatus } from '@/components/ui/folderUI';
import { useQuery } from '@tanstack/react-query';
import { SessionsService, SessionScan } from '@/services/sessions.service';

const columnHelper = createColumnHelper<SessionScan>();

const STATUS_TAG: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  validated: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  anomaly: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

interface DetailsTableProps {
  search: string;
  statusFilter: string;
}

const IdCell = (info: any) => <span className="font-medium text-gray-800">{info.getValue()}</span>;

const StatusCell = (info: any) => {
  const status = (info.getValue() as string).toLowerCase();
  const statusTag = STATUS_TAG[status] || STATUS_TAG['pending'];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusTag.bg} ${statusTag.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusTag.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function DetailsTable({ search, statusFilter }: Readonly<DetailsTableProps>) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sessions-table'],
    queryFn: () => SessionsService.getSessions(50, 0),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Session ID',
        cell: IdCell,
      }),
      columnHelper.accessor('type_registre', {
        header: 'Type Registre',
      }),
      columnHelper.accessor('annee_version', {
        header: 'Année',
      }),
      columnHelper.accessor('libelle_session', {
        header: 'Libellé',
      }),
      columnHelper.accessor('nb_pages', {
        header: 'Pages',
      }),
      columnHelper.accessor('date_creation', {
        header: 'Date Création',
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
      }),
      columnHelper.accessor('statut', {
        header: 'Status',
        cell: StatusCell,
      }),
    ],
    []
  );

  const filteredData = useMemo(() => {
    const items = data?.items || [];
    return items.filter((s) => {
      const matchesSearch = 
        s.id.toLowerCase().includes(search.toLowerCase()) || 
        (s.libelle_session && s.libelle_session.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || s.statut.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

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
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : null}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 px-4 text-[12px] font-semibold text-gray-700 cursor-pointer select-none hover:text-gray-900 transition-colors"
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedSessionId(row.original.id)}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedSessionId === row.original.id ? 'bg-emerald-50/50' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-gray-600 text-[13px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredData.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-gray-500">
                    Aucune session trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-1 pt-3 mt-auto">
          <span className="text-[12px] text-gray-500 mr-2">
            Page {table.getState().pagination.pageIndex + 1}
          </span>
          <button
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="w-7 h-7 flex items-center justify-center text-[12px] font-medium bg-gray-100 rounded text-gray-700">
            {table.getState().pagination.pageIndex + 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Right Info Panel for Details View */}
      <aside className="shrink-0 w-[320px] bg-white border border-gray-100 rounded-xl flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="p-4 border-b border-gray-100 bg-emerald-50/50">
          <button 
            onClick={() => selectedSessionId ? router.push(`/dashboard/data-validation/${selectedSessionId}`) : null}
            disabled={!selectedSessionId}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            Open Selected Session
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Session Summary</h3>
        </div>

        <div className="p-4 space-y-5">
          {selectedSessionId ? (
            <p className="text-sm text-gray-600">Selected Session ID: <br/><span className="font-mono text-xs">{selectedSessionId}</span></p>
          ) : (
            <p className="text-sm text-gray-500 italic">Select a session from the table to view details and open it.</p>
          )}

          <div className="h-px bg-gray-100" />

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1.5">Export Status</h4>
            <p className="text-xs text-gray-500">Available formats: CSV, JSON</p>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {['OCR', 'Pending Validation'].map(tag => (
                <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
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
