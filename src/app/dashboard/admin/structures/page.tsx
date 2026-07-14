"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Search, Plus, Filter, MoreVertical, Building2, MapPin, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StructuresService } from '@/services/structures.service';

export default function StructuresPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: structures = [], isLoading, isError } = useQuery({
    queryKey: ['structures'],
    queryFn: StructuresService.getAll,
  });

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title="Structures Sanitaires">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#65b741] text-white rounded-lg text-sm font-semibold hover:bg-[#5aa43a] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Structure
        </button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search structures..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-100">Name</th>
                <th className="p-4 border-b border-gray-100">Type</th>
                <th className="p-4 border-b border-gray-100">Location</th>
                <th className="p-4 border-b border-gray-100">Status</th>
                <th className="p-4 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#65b741]" />
                      <span>Loading structures...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-red-500">
                    Failed to load structures. Ensure you are authenticated and the API is running.
                  </td>
                </tr>
              ) : structures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No structures found.
                  </td>
                </tr>
              ) : (
                structures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">{structure.nom}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{structure.type_structure}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {structure.region} - {structure.district_sanitaire}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        structure.statut === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {structure.statut || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
