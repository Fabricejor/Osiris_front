"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Download, Filter, FileText, Calendar } from 'lucide-react';

export default function ExportsPage() {
  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title="Data Export">
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6 max-w-3xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Export Generation</h2>
          <p className="text-sm text-gray-500">Select parameters to extract data from validated sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Structure Sanitaire</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]">
              <option>Toutes les structures</option>
              <option>Centre de Santé Amitié</option>
              <option>Hôpital Général de Yoff</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Catalogue / Registre</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]">
              <option>Tous les registres</option>
              <option>Registre CPN</option>
              <option>Registre Naissance</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date de début</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="date" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date de fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="date" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Format d'export</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="radio" name="format" value="csv" defaultChecked className="text-[#65b741] focus:ring-[#65b741]" />
              CSV
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="radio" name="format" value="pdf" className="text-[#65b741] focus:ring-[#65b741]" />
              PDF
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#65b741] text-white rounded-lg text-sm font-bold hover:bg-[#5aa43a] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Generate Export
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">Recent Exports</h3>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-gray-100">File Name</th>
                <th className="p-4 border-b border-gray-100">Date</th>
                <th className="p-4 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 text-sm">export_cpn_oct2023.csv</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">Oct 25, 2023 14:30</td>
                <td className="p-4 text-right">
                  <button className="text-sm font-semibold text-[#65b741] hover:text-[#5aa43a]">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
