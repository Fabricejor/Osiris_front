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
import { ArrowUpDown, Stethoscope } from 'lucide-react';

type Operator = {
  name: string;
  role: string;
  facility: string;
  totalValidations: number;
  avgTime: string;
  efficiencyScore: number;
  status: 'Actif' | 'En attente';
};

const operatorData: Operator[] = [
  { name: 'Dr. Aissatou Diop', role: 'Médecin Superviseur', facility: 'CS Médina', totalValidations: 184, avgTime: '42s', efficiencyScore: 99.2, status: 'Actif' },
  { name: 'Mme Fatou Ndiaye', role: 'Sage-femme Maîtresse', facility: 'PS Potou', totalValidations: 240, avgTime: '38s', efficiencyScore: 98.6, status: 'Actif' },
  { name: 'Mme Aminata Diallo', role: 'Sage-femme d\'État', facility: 'HR Fatick', totalValidations: 195, avgTime: '45s', efficiencyScore: 97.4, status: 'Actif' },
  { name: 'M. Ibrahima Sarr', role: 'Infirmier Chef de Poste', facility: 'PS Gandiol', totalValidations: 142, avgTime: '50s', efficiencyScore: 96.8, status: 'Actif' },
  { name: 'Mme Khady Fall', role: 'Sage-femme', facility: 'CS Roi Baudouin', totalValidations: 110, avgTime: '40s', efficiencyScore: 98.0, status: 'Actif' },
];

const columnHelper = createColumnHelper<Operator>();

export default function OperatorEfficiencyTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Praticien / Validateur',
        cell: (info) => (
          <div>
            <span className="font-bold text-gray-900 block">{info.getValue()}</span>
            <span className="text-[11px] text-gray-500">{info.row.original.role}</span>
          </div>
        ),
      }),
      columnHelper.accessor('facility', {
        header: 'Structure Sanitaire',
        cell: (info) => <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('totalValidations', {
        header: 'Actes Validés',
        cell: (info) => <span className="font-bold text-gray-800">{info.getValue()} actes</span>,
      }),
      columnHelper.accessor('avgTime', {
        header: 'Temps Moyen / Acte',
        cell: (info) => <span className="text-gray-600 font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('efficiencyScore', {
        header: 'Conformité Clinique',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600">{info.getValue()}%</span>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${info.getValue()}%` }} />
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: (info) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {info.getValue()}
          </span>
        ),
      }),
    ],
    []
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          Rendement et Suivi des Praticiens Validateurs
        </h3>
        <span className="text-xs text-gray-500">5 praticiens enregistrés</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left font-bold text-gray-600 p-2.5 cursor-pointer select-none"
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
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
