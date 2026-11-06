import { apiClient } from "./apiClient";

import type { FolderStatus } from "@/components/ui/folderUI";
import type { components } from "@/types/api.generated";

// Types générés depuis l'OpenAPI du backend (`npm run gen:api`) : un champ
// renommé côté backend casse la compilation au lieu de donner `undefined`.
type Schemas = components["schemas"];

export type StatutSession = Schemas["StatutSession"];
/** `SessionScanRead` + champs calculés (statut_validation, score moyen, opérateur, clinique). */
export type SessionScan = Schemas["SessionScanRead"];

/** Statut d'affichage d'une session (calculé côté backend). */
export function sessionFolderStatus(session: Pick<SessionScan, "statut_validation"> | undefined): FolderStatus {
  return session?.statut_validation ?? "pending";
}

/** Libellé lisible (le backend ne stocke pas de libellé de session). */
export function sessionLabel(session: SessionScan): string {
  const date = new Date(session.date_debut || session.date_creation).toLocaleDateString("fr-FR");
  return `${session.type_registre} ${session.annee_version} — ${date}`;
}

export type StatutTraitement = Schemas["StatutTraitement"];
/**
 * `RegistreScanneRead`. Attention : `url_image_page_*` = clé objet MinIO
 * (pas une URL) ; `image_url_page_*` = URL pré-signée affichable ;
 * `score_confiance` = Decimal sérialisé en chaîne ("72.50"), 0-100.
 */
export type RegistreScanne = Schemas["RegistreScanneRead"];

/** Page prête à afficher (cartes OCR + popup de validation). */
export interface PageView {
  id: string;
  id_session_scan: string;
  type_registre: string;
  annee_version: number;
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
    type_registre: page.type_registre,
    annee_version: page.annee_version,
    name: `${page.type_registre} ${page.annee_version}${ligne} · ${page.id_registre_scanne.slice(0, 8)}`,
    status: page.statut_traitement,
    statusText: STATUT_LABEL[page.statut_traitement] ?? page.statut_traitement,
    isAnomaly: page.statut_traitement === "FUSION_INCOMPLETE" || page.statut_traitement === "ECHEC_RECALAGE",
    confidence: Math.round(Number(page.score_confiance ?? 0)),
    image: page.image_url_page_gauche ?? page.image_url_page_droite ?? "",
    date_creation: page.date_creation,
  };
}

export type EtapeTimeline = Schemas["EtapeTimelineRead"];

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
