import { apiClient } from "./apiClient";

export interface StructureSanitaire {
  id: string;
  nom: string;
  type_structure: string;
  region: string;
  district_sanitaire: string;
  statut?: string; // Optional field for frontend mock display
}

export const StructuresService = {
  getAll: async () => {
    // Note: Assuming API prefix handles /api/v1
    return apiClient<StructureSanitaire[]>("/structures-sanitaires", {
      method: "GET",
    });
  },

  getById: async (id: string) => {
    return apiClient<StructureSanitaire>(`/structures-sanitaires/${id}`, {
      method: "GET",
    });
  },

  create: async (data: Omit<StructureSanitaire, "id">) => {
    return apiClient<StructureSanitaire>("/structures-sanitaires", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<StructureSanitaire>) => {
    return apiClient<StructureSanitaire>(`/structures-sanitaires/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient(`/structures-sanitaires/${id}`, {
      method: "DELETE",
    });
  },
};
