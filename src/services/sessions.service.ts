import { apiClient } from "./apiClient";

import type { FolderStatus } from "@/components/ui/folderUI";

/** Miroir de `SessionScanRead` (backend : src/schemas/session.py). */
export type StatutSession = "EN_COURS" | "RECU" | "EN_TRAITEMENT" | "A_VALIDER" | "VALIDE";

export interface SessionScan {
  id_session_scan: string;
  id_agent_terrain: string;
  type_registre: string;
  annee_version: number;
  statut_session: StatutSession;
  nombre_pages: number;
  date_debut: string;
  date_fin: string | null;
  date_creation: string;
  date_modification: string;
}

/** Statut backend → statut d'affichage des dossiers. */
export function sessionFolderStatus(statut: StatutSession | undefined): FolderStatus {
  return statut === "VALIDE" ? "validated" : "pending";
}

/** Libellé lisible (le backend ne stocke pas de libellé de session). */
export function sessionLabel(session: SessionScan): string {
  const date = new Date(session.date_debut || session.date_creation).toLocaleDateString("fr-FR");
  return `${session.type_registre} ${session.annee_version} — ${date}`;
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
  createSession: async (type_registre: string, annee_version: number) => {
    // Le backend refuse les champs inconnus (extra="forbid") : pas de libelle_session.
    return apiClient<{ id_session_scan: string }>('/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ type_registre, annee_version })
    });
  },

  /**
   * Récupère les détails d'une session
   */
  getSessionById: async (sessionId: string) => {
    return apiClient<any>(`/v1/sessions/${sessionId}`, {
      method: "GET",
    });
  },

  /**
   * Récupère la timeline d'une session
   */
  getSessionTimeline: async (sessionId: string) => {
    return apiClient<any[]>(`/v1/sessions/${sessionId}/timeline`, {
      method: "GET",
    });
  },

  /**
   * Récupère la file d'attente globale des pages nécessitant une vérification OCR
   */
  getPagesQueue: async (limit: number = 50, offset: number = 0) => {
    return apiClient<ListResponse<any>>(`/v1/pages/queue?limit=${limit}&offset=${offset}`, {
      method: "GET",
    });
  },

  /**
   * Valide une page (OCR Processing)
   */
  validatePage: async (pageId: string) => {
    return apiClient(`/v1/pages/${pageId}/validate`, {
      method: "POST",
    });
  },

  /**
   * Rejette une page (OCR Processing)
   */
  rejectPage: async (pageId: string) => {
    return apiClient(`/v1/pages/${pageId}/reject`, {
      method: "POST",
    });
  }
};
