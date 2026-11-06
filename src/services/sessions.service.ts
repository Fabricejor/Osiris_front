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
  // Champs calculés par le backend (agrégés depuis les pages de la session).
  /** rejected > anomaly > validated > pending */
  statut_validation: FolderStatus;
  /** Moyenne des scores OCR des pages (0-100), null si aucune page traitée. */
  score_confiance_moyen: number | null;
  nb_pages_validees: number;
  nb_pages_rejetees: number;
  nb_pages_anomalie: number;
  /** Nom de l'agent terrain. */
  operateur: string | null;
  /** Structure sanitaire de l'agent. */
  clinique: string | null;
}

/** Statut d'affichage d'une session (calculé côté backend). */
export function sessionFolderStatus(session: Pick<SessionScan, "statut_validation"> | undefined): FolderStatus {
  return session?.statut_validation ?? "pending";
}

/** Libellé lisible (le backend ne stocke pas de libellé de session). */
export function sessionLabel(session: SessionScan): string {
  const date = new Date(session.date_debut || session.date_creation).toLocaleDateString("fr-FR");
  return `${session.type_registre} ${session.annee_version} — ${date}`;
}

/** Miroir de `StatutTraitement` (backend : src/core/constants/processing.py). */
export type StatutTraitement =
  | "RECU"
  | "EN_TRAITEMENT"
  | "A_VALIDER"
  | "VALIDE"
  | "FUSION_INCOMPLETE"
  | "ECHEC_RECALAGE"
  | "REJETEE";

/** Miroir de `RegistreScanneRead` (backend : src/schemas/page.py). */
export interface RegistreScanne {
  id_registre_scanne: string;
  id_session_scan: string;
  type_registre: string;
  annee_version: number;
  type_page: string;
  numero_ordre_ligne: number | null;
  /** Clé objet MinIO (pas une URL affichable). */
  url_image_page_gauche: string | null;
  url_image_page_droite: string | null;
  /** URLs GET pré-signées (expirent après quelques minutes), null si indisponibles. */
  image_url_page_gauche?: string | null;
  image_url_page_droite?: string | null;
  statut_traitement: StatutTraitement;
  /** Decimal sérialisé en chaîne par le backend (ex. "72.50"), 0-100. */
  score_confiance: string | number | null;
  date_creation: string;
  date_modification: string;
}

/** Page prête à afficher (cartes OCR + popup de validation). */
export interface PageView {
  id: string;
  id_session_scan: string;
  name: string;
  status: StatutTraitement;
  statusText: string;
  isAnomaly: boolean;
  confidence: number;
  /** URL d'image affichable (pré-signée, expire) — vide si indisponible. */
  image: string;
  date_creation: string;
}

const STATUT_LABEL: Record<StatutTraitement, string> = {
  RECU: "En traitement",
  EN_TRAITEMENT: "En traitement",
  A_VALIDER: "À valider",
  VALIDE: "Validée",
  FUSION_INCOMPLETE: "Anomalie",
  ECHEC_RECALAGE: "Échec recalage",
  REJETEE: "Rejetée",
};

export function toPageView(page: RegistreScanne): PageView {
  const ligne = page.numero_ordre_ligne ? ` · ligne ${page.numero_ordre_ligne}` : "";
  return {
    id: page.id_registre_scanne,
    id_session_scan: page.id_session_scan,
    name: `${page.type_registre} ${page.annee_version}${ligne} · ${page.id_registre_scanne.slice(0, 8)}`,
    status: page.statut_traitement,
    statusText: STATUT_LABEL[page.statut_traitement] ?? page.statut_traitement,
    isAnomaly: page.statut_traitement === "FUSION_INCOMPLETE" || page.statut_traitement === "ECHEC_RECALAGE",
    confidence: Math.round(Number(page.score_confiance ?? 0)),
    image: page.image_url_page_gauche ?? page.image_url_page_droite ?? "",
    date_creation: page.date_creation,
  };
}

/** Miroir de `EtapeTimelineRead` (backend : src/schemas/session.py). */
export interface EtapeTimeline {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
  time: string | null;
  subtitle: string | null;
  details: string | null;
}

/** Catégorie d'affichage d'une page : validée, à revoir (anomalie / rejet), en attente. */
export type PageCategory = "validated" | "review" | "pending";

export function pageCategory(page: PageView): PageCategory {
  if (page.status === "VALIDE") return "validated";
  if (page.isAnomaly || page.status === "REJETEE") return "review";
  return "pending";
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
    return apiClient<ListResponse<RegistreScanne>>(`/v1/sessions/${sessionId}/pages`, {
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
    return apiClient<SessionScan>(`/v1/sessions/${sessionId}`, {
      method: "GET",
    });
  },

  /**
   * Récupère la timeline d'une session
   */
  getSessionTimeline: async (sessionId: string) => {
    return apiClient<EtapeTimeline[]>(`/v1/sessions/${sessionId}/timeline`, {
      method: "GET",
    });
  },

  /**
   * Récupère la file d'attente globale des pages nécessitant une vérification OCR
   */
  getPagesQueue: async (limit: number = 50, offset: number = 0) => {
    return apiClient<ListResponse<RegistreScanne>>(`/v1/pages/queue?limit=${limit}&offset=${offset}`, {
      method: "GET",
    });
  },

  /**
   * Valide une page (OCR Processing)
   */
  validatePage: async (pageId: string) => {
    return apiClient<RegistreScanne>(`/v1/pages/${pageId}/validate`, {
      method: "POST",
    });
  },

  /**
   * Rejette une page (OCR Processing)
   */
  rejectPage: async (pageId: string, motif?: string) => {
    return apiClient<RegistreScanne>(`/v1/pages/${pageId}/reject`, {
      method: "POST",
      body: JSON.stringify({ motif: motif || null }),
    });
  }
};
