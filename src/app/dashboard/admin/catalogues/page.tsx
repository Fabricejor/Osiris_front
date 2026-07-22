"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Search, Plus, Filter, MoreVertical, Library, FileText, Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CataloguesService } from '@/services/catalogues.service';

export default function CataloguesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type_registre: '',
    annee_version: new Date().getFullYear(),
    libelle: '',
    rangs_par_patient: 1
  });

  const queryClient = useQueryClient();

  const { data: catalogues = [], isLoading, isError } = useQuery({
    queryKey: ['catalogues'],
    queryFn: CataloguesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => CataloguesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogues'] });
      setIsAddModalOpen(false);
      setFormData({ type_registre: '', annee_version: new Date().getFullYear(), libelle: '', rangs_par_patient: 1 });
      alert("Catalogue créé avec succès !");
    },
    onError: (error) => {
      console.error("Error creating catalogue", error);
      alert("Erreur lors de la création du catalogue");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CataloguesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogues'] });
      setActiveDropdownId(null);
      alert("Catalogue supprimé avec succès !");
    },
    onError: (error) => {
      console.error("Error deleting catalogue", error);
      alert("Erreur lors de la suppression du catalogue");
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title="Catalogues & Modèles">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#65b741] text-white rounded-lg text-sm font-semibold hover:bg-[#5aa43a] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Model
        </button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search catalogues..."
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
                <th className="p-4 border-b border-gray-100">Name & Version</th>
                <th className="p-4 border-b border-gray-100">Structure</th>
                <th className="p-4 border-b border-gray-100">Status</th>
                <th className="p-4 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#65b741]" />
                      <span>Loading catalogues...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-red-500">
                    Failed to load catalogues. Ensure you are authenticated and the API is running.
                  </td>
                </tr>
              ) : catalogues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No catalogues found.
                  </td>
                </tr>
              ) : (
                catalogues.map((catalogue) => (
                  <tr key={catalogue.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
                          <Library className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{catalogue.nom_registre}</div>
                          <div className="text-xs text-gray-500">Version: {catalogue.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400"/> {catalogue.sectionsCount || 0} Sections</div>
                        <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400"/> {catalogue.fieldsCount || 0} Fields</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        catalogue.est_actif ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {catalogue.est_actif ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === catalogue.id ? null : (catalogue.id ?? null))}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdownId === catalogue.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setActiveDropdownId(null)}
                          />
                          <div className="absolute right-12 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 text-left">
                            <button
                              onClick={() => {
                                if (catalogue.id && window.confirm('Voulez-vous vraiment supprimer ce catalogue ?')) {
                                  deleteMutation.mutate(catalogue.id);
                                }
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Add New Catalogue</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Registre *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  placeholder="e.g. CONSULTATION"
                  value={formData.type_registre}
                  onChange={e => setFormData({...formData, type_registre: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année / Version *</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  placeholder="e.g. 2024"
                  value={formData.annee_version}
                  onChange={e => setFormData({...formData, annee_version: parseInt(e.target.value) || new Date().getFullYear()})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  placeholder="e.g. Registre des Consultations"
                  value={formData.libelle}
                  onChange={e => setFormData({...formData, libelle: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rangs par patient *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  value={formData.rangs_par_patient}
                  onChange={e => setFormData({...formData, rangs_par_patient: parseInt(e.target.value) || 1})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2 px-4 bg-[#65b741] text-white rounded-lg text-sm font-medium hover:bg-[#5aa43a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
