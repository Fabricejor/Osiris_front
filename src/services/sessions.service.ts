import { apiClient } from "./apiClient";

export interface SessionScan {
  id: string;
  type_registre: string;
  annee_version: number;
  libelle_session: string;
  statut: string;
  date_creation: string;
  nb_pages: number;
}

export interface ScannedPage {
  id: string; 
  numero_page: number;
  type_page: string;
  statut: string;
  object_key?: string;
}

interface ListResponse<T> {
  items: T[];
  total: number;
}

export const SessionsService = {
  /**
   * Récupère la liste des sessions
   */
  getSessions: async (limit: number = 50, offset: number = 0) => {
    return apiClient<ListResponse<SessionScan>>(`/v1/sessions?limit=${limit}&offset=${offset}`, {
      method: "GET",
    });
  },

  /**
   * Récupère les pages d'une session
   */
  getPages: async (sessionId: string) => {
    return apiClient<ListResponse<ScannedPage>>(`/v1/sessions/${sessionId}/pages`, {
      method: "GET",
    });
  },

  /**
   * Ouvre une nouvelle session de scan
   */
  createSession: async (type_registre: string, annee_version: number, libelle_session: string) => {
    return apiClient<{ id_session_scan: string }>('/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ type_registre, annee_version, libelle_session })
    });
  }
};
