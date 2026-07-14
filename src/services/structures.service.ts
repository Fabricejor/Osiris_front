import { apiClient } from "./apiClient";
import type { StructureSanitaire, CreateStructureDto, UpdateStructureDto } from "../types";

export const StructuresService = {
  getAll: async () => {
    const res = await apiClient<{items: StructureSanitaire[], total: number}>("/v1/structures", {
      method: "GET",
    });
    
    // Map backend properties to frontend expectations
    return (res.items || []).map(item => ({
      ...item,
      id: item.id_structure_sanitaire,
      nom: item.nom_structure,
      region: 'N/A', // Assuming not returned by backend
      type_structure: 'Standard', // Assuming not returned by backend
      statut: 'Active'
    }));
  },

  getById: async (id: string) => {
    return apiClient<StructureSanitaire>(`/v1/structures/${id}`, {
      method: "GET",
    });
  },

  create: async (data: CreateStructureDto) => {
    return apiClient<StructureSanitaire>("/v1/structures", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateStructureDto) => {
    return apiClient<StructureSanitaire>(`/v1/structures/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient(`/v1/structures/${id}`, {
      method: "DELETE",
    });
  },
};
