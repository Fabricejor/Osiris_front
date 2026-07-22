"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Download, Filter, FileText, Calendar, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExportsService } from '@/services/exports.service';
import { StructuresService } from '@/services/structures.service';
import { CataloguesService } from '@/services/catalogues.service';

export default function ExportsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    structure_id: '',
    catalogue_id: '',
    date_debut: '',
    date_fin: '',
    format: 'csv'
  });

  const { data: structures = [] } = useQuery({
    queryKey: ['structures'],
    queryFn: StructuresService.getAll,
  });

  const { data: catalogues = [] } = useQuery({
    queryKey: ['catalogues'],
    queryFn: CataloguesService.getAll,
  });

  const { data: recentExports = [], isLoading: isLoadingExports } = useQuery({
    queryKey: ['recentExports'],
    queryFn: ExportsService.getRecentExports,
  });

  const exportMutation = useMutation({
    mutationFn: (data: any) => ExportsService.generateExport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentExports'] });
      alert("Export initié avec succès !");
    },
    onError: (error) => {
      console.error("Error generating export", error);
      alert("Erreur lors de la génération de l'export");
    }
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => ExportsService.downloadExport(id),
    onSuccess: (data) => {
      if (data && data.url) {
        window.open(data.url, '_blank');
      } else {
        alert("URL de téléchargement non disponible");
      }
    },
    onError: (error) => {
      console.error("Error downloading export", error);
      alert("Erreur lors du téléchargement de l'export");
    }
  });

  const handleGenerate = () => {
    const payload: any = {};
    
    // The backend's ExportCreate schema forbids extra fields and expects:
    // type_registre, annee_version, date_debut, date_fin.
    // It specifically does NOT want format or structure_id.
    
    if (formData.catalogue_id) {
      const selectedCatalogue = catalogues.find(c => c.id === formData.catalogue_id);
      if (selectedCatalogue) {
        payload.type_registre = selectedCatalogue.type_registre;
        payload.annee_version = selectedCatalogue.version; // mapped from annee_version in service
      }
    }
    
    if (formData.date_debut) payload.date_debut = formData.date_debut;
    if (formData.date_fin) payload.date_fin = formData.date_fin;

    exportMutation.mutate(payload);
  };

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
            <select 
              value={formData.structure_id}
              onChange={e => setFormData({...formData, structure_id: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
            >
              <option value="">Toutes les structures</option>
              {structures.map(structure => (
                <option key={structure.id} value={structure.id}>{structure.nom}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Catalogue / Registre</label>
            <select 
              value={formData.catalogue_id}
              onChange={e => setFormData({...formData, catalogue_id: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
            >
              <option value="">Tous les registres</option>
              {catalogues.map(catalogue => (
                <option key={catalogue.id} value={catalogue.id}>{catalogue.nom_registre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date de début</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={formData.date_debut}
                onChange={e => setFormData({...formData, date_debut: e.target.value})}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date de fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={formData.date_fin}
                onChange={e => setFormData({...formData, date_fin: e.target.value})}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Format d'export</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="radio" 
                name="format" 
                value="csv" 
                checked={formData.format === 'csv'}
                onChange={e => setFormData({...formData, format: e.target.value})}
                className="text-[#65b741] focus:ring-[#65b741]" 
              />
              CSV
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="radio" 
                name="format" 
                value="pdf" 
                checked={formData.format === 'pdf'}
                onChange={e => setFormData({...formData, format: e.target.value})}
                className="text-[#65b741] focus:ring-[#65b741]" 
              />
              PDF
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#65b741] text-white rounded-lg text-sm font-bold hover:bg-[#5aa43a] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate Export
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
              {isLoadingExports ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#65b741]" />
                      <span>Loading exports...</span>
                    </div>
                  </td>
                </tr>
              ) : recentExports.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No recent exports found.
                  </td>
                </tr>
              ) : (
                recentExports.map((exportRecord) => (
                  <tr key={exportRecord.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 text-sm">{exportRecord.fileName || `Export_${exportRecord.id}`}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {exportRecord.date ? new Date(exportRecord.date).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => downloadMutation.mutate(exportRecord.id)}
                        disabled={downloadMutation.isPending && downloadMutation.variables === exportRecord.id}
                        className="text-sm font-semibold text-[#65b741] hover:text-[#5aa43a] disabled:opacity-50"
                      >
                        {downloadMutation.isPending && downloadMutation.variables === exportRecord.id ? 'Downloading...' : 'Download'}
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
