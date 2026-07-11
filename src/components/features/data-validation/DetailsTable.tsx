"use client";

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
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import type { FolderStatus } from '@/components/ui/folderUI';

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
  { id: '9a8b7c6d-e5f4-4g3h...', age: 45, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'validated' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 45, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'validated' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 38, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'rejected' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 72, gender: 'Female', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'pending' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 60, gender: 'Female', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'anomaly' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 46, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'pending' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 45, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'validated' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 70, gender: 'Female', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'rejected' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 45, gender: 'Male', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'validated' },
  { id: '9a8b7c6d-e5f4-4g3h...', age: 48, gender: 'Female', diagnosisCode: 'E11.9', labResult: 'HbA1c 7.2%', date: '10/25/2024', status: 'pending' },
];

const columnHelper = createColumnHelper<PatientData>();

const STATUS_TAG: Record<FolderStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  validated: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  anomaly: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

interface DetailsTableProps {
  search: string;
  statusFilter: FolderStatus | 'all';
}

export default function DetailsTable({ search, statusFilter }: DetailsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Patient ID (UUID)',
        cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
      }),
      columnHelper.accessor('age', {
        header: 'Age',
      }),
      columnHelper.accessor('gender', {
        header: 'Gender',
      }),
      columnHelper.accessor('diagnosisCode', {
        header: 'Diagnosis Code',
      }),
      columnHelper.accessor('labResult', {
        header: 'Lab Result',
      }),
      columnHelper.accessor('date', {
        header: 'Date',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const statusTag = STATUS_TAG[status];
          return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusTag.bg} ${statusTag.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusTag.dot}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
    ],
    []
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
        {/* Table Filters/Actions Header */}
        <div className="flex items-center gap-3 mb-4">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg">
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
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-gray-600 text-[13px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      <aside className="flex-shrink-0 w-[320px] bg-white border border-gray-100 rounded-xl flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Data Summary</h3>
        </div>
        
        {/* Open button */}
        <div className="p-4 border-b border-gray-100 bg-emerald-50/50">
          <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
            Open Folder Details
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Data Volume */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Data Volume</h4>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
            </div>
            <p className="text-xs text-gray-500">3.5 TB / 5 TB</p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Export Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1.5">Export Status</h4>
            <p className="text-xs text-gray-500">Last Export: 10/24/2024, CSV</p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Recent Activities */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activities</h4>
            <div className="space-y-3 relative before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-gray-100">
              {[
                'Export entries at 10/24/2024',
                'Export activity at 10/24/2024',
                'Export activity at 10/24/2024',
                'Export activities: 10/24/2024'
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-2 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 mt-1 flex-shrink-0 ring-4 ring-white" />
                  <p className="text-xs text-gray-600">{activity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Tags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Clinical', 'De-identified', 'Cardiology'].map(tag => (
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
