import { apiClient } from "./apiClient";

export interface CatalogueRegistre {
  id: string;
  nom_registre: string;
  version: string;
  est_actif: boolean;
  // Computed fields for frontend mock display
  sectionsCount?: number;
  fieldsCount?: number;
  status?: string; 
}

export const CataloguesService = {
  getAll: async () => {
    return apiClient<CatalogueRegistre[]>("/catalogues", {
      method: "GET",
    });
  },

  getById: async (id: string) => {
    return apiClient<CatalogueRegistre>(`/catalogues/${id}`, {
      method: "GET",
    });
  },

  create: async (data: Omit<CatalogueRegistre, "id">) => {
    return apiClient<CatalogueRegistre>("/catalogues", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CatalogueRegistre>) => {
    return apiClient<CatalogueRegistre>(`/catalogues/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient(`/catalogues/${id}`, {
      method: "DELETE",
    });
  },
};
