import { apiClient } from "./apiClient";

import type { CatalogueRegistre, CreateCatalogueDto, UpdateCatalogueDto } from "../types";
import type { components } from "@/types/api.generated";

export const CataloguesService = {
  /** Catalogue d'un (type, année) : sections → champs (nom, libellé, ordre, type, unité). */
  getByTypeAnnee: async (typeRegistre: string, anneeVersion: number) => {
    return apiClient<components["schemas"]["CatalogueRegistre"]>(
      `/v1/catalogue-registres/${encodeURIComponent(typeRegistre)}/${anneeVersion}`,
      { method: "GET" },
    );
  },

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
