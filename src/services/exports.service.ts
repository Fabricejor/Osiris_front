import { apiClient } from "./apiClient";

import type { ExportFormat, ExportRecord, ExportFilterOptions } from "../types";

export interface ExportRequest {
  structure_id?: string;
  catalogue_id?: string;
  date_debut?: string;
  date_fin?: string;
  format?: ExportFormat;
}

export const ExportsService = {
  generateExport: async (data: any) => {
    return apiClient<{ message: string; export_id: string }>("/v1/exports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRecentExports: async () => {
    const res = await apiClient<{items: ExportRecord[], total: number}>("/v1/exports", {
      method: "GET",
    });
    return res.items || [];
  },

  downloadExport: async (id: string) => {
    return apiClient<{ url: string }>(`/v1/exports/${id}/download`, {
      method: "GET",
    });
  },
};
