import { apiClient } from "./apiClient";

import { useAuthStore } from "@/store/authStore";
import type { FolderStatus } from "@/components/ui/folderUI";
import type { components } from "@/types/api.generated";
import type { TranslationKey } from "@/utils/translations";

// Types générés depuis l'OpenAPI du backend (`npm run gen:api`) : un champ
// renommé côté backend casse la compilation au lieu de donner `undefined`.
type Schemas = components["schemas"];

export type StatutSession = Schemas["StatutSession"];
/** Réponse de `POST /pages/{id}/reservation`. */
export type ReservationPage = Schemas["ReservationRead"];
/** `SessionScanRead` + champs calculés (statut_validation, score moyen, opérateur, clinique). */
export type SessionScan = Schemas["SessionScanRead"];

/** Statut d'affichage d'une session (calculé côté backend). */
export function sessionFolderStatus(session: Pick<SessionScan, "statut_validation"> | undefined): FolderStatus {
  return session?.statut_validation ?? "pending";
}

/** Date + heure courte : « 07/11/2026 14:32 ». */
export function formatDateHeure(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/** Libellé lisible (le backend ne stocke pas de libellé de session) :
 *  type, année et date/heure d'ouverture, pour distinguer deux sessions du même jour. */
export function sessionLabel(session: SessionScan): string {
  return `${session.type_registre} ${session.annee_version} — ${formatDateHeure(session.date_debut || session.date_creation)}`;
}

/** Qui / où : « Awa Diop · CS Fatick · Fatick » (parties absentes omises). */
export function sessionSousTitre(session: SessionScan): string {
  const structure = session.district && session.district !== session.clinique
    ? [session.clinique, session.district]
    : [session.clinique];
  return [session.operateur, ...structure].filter(Boolean).join(" · ");
}



export type StatutTraitement = Schemas["StatutTraitement"];
/**
 * `RegistreScanneRead`. Attention : `url_image_page_*` = clé objet MinIO
 * (pas une URL) ; `image_url_page_*` = URL pré-signée affichable ;
 * `score_confiance` = Decimal sérialisé en chaîne ("72.50"), 0-100.
 */
export type RegistreScanne = Schemas["RegistreScanneRead"];

/** En-têtes lus sur la page comparés au catalogue (backend : `ControleEntetes`). */
export interface ControleEntetes {
  colonnes_inconnues: string[];
  champs_absents: string[];
  ordre_different: boolean;
  cles_non_mappees: string[];
  /**
   * Étendue horizontale de chaque colonne sur la photo, {nom_champ: [xmin, xmax]}
   * (0..1000). Vide pour les pages lues avant son introduction.
   */
  colonnes: Record<string, [number, number]>;
}

function lireColonnes(brut: unknown): Record<string, [number, number]> {
  if (!brut || typeof brut !== "object") return {};
  const colonnes: Record<string, [number, number]> = {};
  for (const [nom, x] of Object.entries(brut as Record<string, unknown>)) {
    if (
      Array.isArray(x) && x.length === 2 &&
      x.every((v) => typeof v === "number" && Number.isFinite(v)) && x[0] < x[1]
    ) {
      colonnes[nom] = [x[0], x[1]];
    }
  }
  return colonnes;
}

function lireControleEntetes(brut: unknown): ControleEntetes | null {
  if (!brut || typeof brut !== "object") return null;
  const c = brut as Partial<ControleEntetes>;
  return {
    colonnes_inconnues: Array.isArray(c.colonnes_inconnues) ? c.colonnes_inconnues : [],
    champs_absents: Array.isArray(c.champs_absents) ? c.champs_absents : [],
    ordre_different: c.ordre_different === true,
    cles_non_mappees: Array.isArray(c.cles_non_mappees) ? c.cles_non_mappees : [],
    colonnes: lireColonnes(c.colonnes),
  };
}

/** Page prête à afficher (cartes OCR + popup de validation). */
export interface PageView {
  id: string;
  id_session_scan: string;
  type_registre: string;
  annee_version: number;
  name: string;
  status: StatutTraitement;
  /** Clé de traduction du statut (afficher avec `t(page.statusKey)`). */
  statusKey: TranslationKey;
  isAnomaly: boolean;
  confidence: number;
  /** URL d'image affichable (pré-signée, expire) — vide si indisponible. */
  image: string;
  /** Écarts entre la page et le registre de référence (null si non contrôlé). */
  controleEntetes: ControleEntetes | null;
  /** Motif du dernier échec OCR (statut ECHEC_OCR), null sinon. */
  erreurOcr: string | null;
  /** Encore « en traitement » 30 min après sa dernière mise à jour : job OCR perdu. */
  ocrBloque: boolean;
  /** Ouverte en ce moment par un AUTRE utilisateur (nom + échéance), null sinon. */
  reserveeParAutre: { nom: string; jusqua: string } | null;
  /** Problèmes de photo mesurés à l'envoi (FLOUE, BOUGEE, TROP_SOMBRE…), tous côtés confondus. */
  problemesPhoto: string[];
  date_creation: string;
}

/** Codes des problèmes de photo (bloquants forcés + avertissements), sans doublon. */
function problemesPhoto(page: RegistreScanne): string[] {
  const codes = new Set<string>();
  for (const cote of Object.values(page.qualite_photo ?? {})) {
    if (!cote || typeof cote !== "object") continue;
    const { bloquants, avertissements } = cote as { bloquants?: unknown; avertissements?: unknown };
    for (const liste of [bloquants, avertissements]) {
      if (Array.isArray(liste)) liste.forEach((c) => typeof c === "string" && codes.add(c));
    }
  }
  return [...codes];
}

/** Réservation d'un autre utilisateur encore active, null sinon. */
function reservationAutre(page: RegistreScanne): PageView["reserveeParAutre"] {
  const moi = useAuthStore.getState().user?.id;
  if (!page.reserve_par || !page.reserve_jusqu_a || page.reserve_par === moi) return null;
  if (new Date(page.reserve_jusqu_a).getTime() <= Date.now()) return null;
  return { nom: page.reserve_par_nom ?? "?", jusqua: page.reserve_jusqu_a };
}

/** « 14:32 » (heure locale). */
export function heureCourte(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** Au-delà, une page encore en OCR est considérée bloquée (job perdu, worker arrêté). */
const DELAI_OCR_BLOQUE_MS = 30 * 60 * 1000;

const STATUT_LABEL: Record<StatutTraitement, TranslationKey> = {
  RECU: "statut_en_traitement",
  EN_TRAITEMENT: "statut_en_traitement",
  A_VALIDER: "statut_a_valider",
  VALIDE: "statut_valide",
  FUSION_INCOMPLETE: "statut_anomalie",
  ECHEC_RECALAGE: "statut_echec_recalage",
  ECHEC_OCR: "statut_echec_ocr",
  REJETEE: "statut_rejetee",
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
    statusKey: STATUT_LABEL[page.statut_traitement] ?? "statut_en_traitement",
    isAnomaly:
      page.statut_traitement === "FUSION_INCOMPLETE" ||
      page.statut_traitement === "ECHEC_RECALAGE" ||
      page.statut_traitement === "ECHEC_OCR",
    confidence: Math.round(Number(page.score_confiance ?? 0)),
    image: page.image_url_page_gauche ?? page.image_url_page_droite ?? "",
    controleEntetes: lireControleEntetes(page.controle_entetes),
    erreurOcr: page.erreur_ocr ?? null,
    ocrBloque:
      (page.statut_traitement === "RECU" || page.statut_traitement === "EN_TRAITEMENT") &&
      Date.now() - new Date(page.date_modification).getTime() > DELAI_OCR_BLOQUE_MS,
    reserveeParAutre: reservationAutre(page),
    problemesPhoto: problemesPhoto(page),
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
  /** `q` : recherche côté serveur (agent, structure, district, type, année, début d'ID) —
   *  porte sur toutes les sessions visibles, pas seulement la page chargée. */
  getSessions: async (limit: number = 50, offset: number = 0, q?: string) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (q?.trim()) params.set("q", q.trim());
    return apiClient<ListResponse<SessionScan>>(`/v1/sessions?${params.toString()}`, {
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
   * Réserve (ou renouvelle) la page ouverte. `obtenue=false` : un autre
   * utilisateur l'a ouverte (nom + échéance) → afficher en lecture seule.
   */
  reserverPage: async (pageId: string): Promise<ReservationPage> => {
    return apiClient<ReservationPage>(`/v1/pages/${pageId}/reservation`, { method: "POST" });
  },

  /** Libère la page à la fermeture (sans effet si un autre la tient). */
  libererPage: async (pageId: string): Promise<void> => {
    await apiClient<void>(`/v1/pages/${pageId}/reservation`, { method: "DELETE" });
  },

  /**
   * Plus ancienne page à valider libre, réservée pour moi ; null s'il n'y en a plus.
   */
  pageSuivante: async (): Promise<RegistreScanne | null> => {
    const page = await apiClient<RegistreScanne | null>(`/v1/pages/suivante`, { method: "POST" });
    return page && typeof page === "object" && "id_registre_scanne" in page ? page : null;
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
  },

  /**
   * Relance l'OCR d'une page (échec OCR, recalage, page bloquée) → statut RECU.
   * Réservé à l'agent de la session, à l'admin de sa structure et au superadmin.
   */
  retraiterPage: async (sessionId: string, pageId: string) => {
    return apiClient<RegistreScanne>(`/v1/sessions/${sessionId}/pages/${pageId}/retraiter`, {
      method: "POST",
    });
  },
};
