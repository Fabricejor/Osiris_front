import { apiClient } from "./apiClient";

import type { CatalogueRegistre, CreateCatalogueDto, UpdateCatalogueDto } from "../types";

export const CataloguesService = {
  getAll: async () => {
    const res = await apiClient<{items: CatalogueRegistre[], total: number}>("/v1/catalogue-registres", {
      method: "GET",
    });
    
    // Map backend properties to frontend expectations
    return (res.items || []).map(item => ({
      ...item,
      id: item.id_catalogue_registre,
      nom_registre: item.libelle || item.type_registre,
      version: item.annee_version,
      sectionsCount: item.nombre_sections || 0,
      fieldsCount: item.nombre_champs || 0,
      est_actif: true // Assuming active for now, as backend doesn't seem to have a status field here
    }));
  },

  getById: async (id: string) => {
    return apiClient<CatalogueRegistre>(`/v1/catalogue-registres/${id}`, {
      method: "GET",
    });
  },

  create: async (data: CreateCatalogueDto) => {
    return apiClient<CatalogueRegistre>("/v1/catalogue-registres", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateCatalogueDto) => {
    return apiClient<CatalogueRegistre>(`/v1/catalogue-registres/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient(`/v1/catalogue-registres/${id}`, {
      method: "DELETE",
    });
  },
};
