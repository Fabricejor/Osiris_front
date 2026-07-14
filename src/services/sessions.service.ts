import { apiClient } from "./apiClient";

export interface ScannedPage {
  id: string; // Or number, adjust based on actual API
  nom_fichier: string;
  statut_traitement: string;
  score_confiance_moyen?: number;
  url_image?: string;
  // Computed for frontend mock
  name?: string;
  statusText?: string;
  confidence?: number;
  image?: string;
  status?: string;
}

export interface DonneeExtraite {
  id: string;
  valeur_extraite: string;
  score_confiance: number;
  statut_validation: string;
  // ... other fields mapping to the clinical tab
}

export interface PiiCellule {
  id: string;
  valeur_texte: string;
  type_pii: string; // e.g. NOM, PRENOM, TELEPHONE
  statut_validation: string;
  score_confiance?: number;
}

export const SessionsService = {
  getPages: async (sessionId: string) => {
    return apiClient<ScannedPage[]>(`/sessions/${sessionId}/pages`, {
      method: "GET",
    });
  },

  getClinicalData: async (sessionId: string) => {
    return apiClient<DonneeExtraite[]>(`/donnees-extraites/session/${sessionId}`, {
      method: "GET",
    });
  },

  getPiiData: async (sessionId: string) => {
    return apiClient<PiiCellule[]>(`/pii-cellules/session/${sessionId}`, {
      method: "GET",
    });
  },

  validateClinicalData: async (id: string, data: Partial<DonneeExtraite>) => {
    return apiClient<DonneeExtraite>(`/donnees-extraites/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  validatePiiData: async (id: string, data: Partial<PiiCellule>) => {
    return apiClient<PiiCellule>(`/pii-cellules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
};
