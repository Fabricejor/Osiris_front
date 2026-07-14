import { apiClient } from "./apiClient";

export interface ExportRequest {
  structure_id?: string;
  catalogue_id?: string;
  date_debut?: string;
  date_fin?: string;
  format_export: "csv" | "pdf";
}

export interface ExportRecord {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  format: string;
  url?: string;
}

export const ExportsService = {
  generateExport: async (data: ExportRequest) => {
    return apiClient<{ message: string; export_id: string }>("/exports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRecentExports: async () => {
    return apiClient<ExportRecord[]>("/exports", {
      method: "GET",
    });
  },

  downloadExport: async (id: string) => {
    // Usually download endpoints might return a blob or a pre-signed URL
    // Depending on the backend implementation, you might need to handle Blob specifically.
    return apiClient<{ url: string }>(`/exports/${id}/download`, {
      method: "GET",
    });
  }
};
