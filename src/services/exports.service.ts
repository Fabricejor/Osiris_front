import { apiClient } from "./apiClient";

import type { components } from "@/types/api.generated";

// Types générés depuis l'OpenAPI du backend (`npm run gen:api`).
type Schemas = components["schemas"];

/** Body de `POST /exports`. Le backend refuse tout champ en plus (`extra="forbid"`) :
 *  pas de structure (l'export couvre implicitement la structure de l'admin) ni de format
 *  (toujours CSV). */
export type ExportCreate = Schemas["ExportCreate"];
/** Un export : statut (EN_ATTENTE → EN_COURS → PRET / ECHEC), filtres, `download_url` si PRET. */
export type ExportRead = Schemas["ExportRead"];
export type StatutExport = Schemas["StatutExport"];

export const ExportsService = {
  generateExport: async (data: ExportCreate) => {
    return apiClient<ExportRead>("/v1/exports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRecentExports: async () => {
    const res = await apiClient<Schemas["ExportsListResponse"]>("/v1/exports", {
      method: "GET",
    });
    return res.items ?? [];
  },

  /** Relit l'export : `download_url` est une URL présignée à durée courte, à demander
   *  au moment du téléchargement (celle de la liste peut avoir expiré). */
  getExport: async (id: string) => {
    return apiClient<ExportRead>(`/v1/exports/${id}`, {
      method: "GET",
    });
  },

  /** Refusé (409) tant que l'export est en cours, sauf s'il est bloqué depuis plus de 2 h. */
  deleteExport: async (id: string) => {
    return apiClient<void>(`/v1/exports/${id}`, { method: "DELETE" });
  },
};
