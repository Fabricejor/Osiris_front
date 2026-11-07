/**
 * Traduction des erreurs de l'API.
 *
 * Le backend renvoie `{detail, code}` : `detail` est une phrase en français (aide,
 * conservée pour l'app mobile), `code` un identifiant stable. La traduction est
 * faite ici, dans la langue choisie par l'utilisateur.
 *
 * - Code métier précis (ex. `SESSION_CLOSED`) → toujours le libellé traduit.
 * - Code générique (`NOT_FOUND`, `CONFLICT`…) : le `detail` du backend est plus
 *   précis (« Export 123 introuvable. ») → affiché tel quel en français, libellé
 *   générique traduit dans les autres langues.
 */
import { useLanguageStore } from "@/store/useLanguageStore";
import type { TranslationKey } from "@/utils/translations";

const CODES_METIER: Record<string, TranslationKey> = {
  INVALID_TOKEN: "error_invalid_token",
  TOKEN_EXPIRED: "error_token_expired",
  AGENT_TERRAIN_MANQUANT: "error_agent_terrain_manquant",
  SESSION_NOT_FOUND: "error_session_not_found",
  SESSION_FORBIDDEN: "error_session_forbidden",
  SESSION_CLOSED: "error_session_closed",
  SESSION_CONFLICT: "error_session_conflict",
  CATALOGUE_NOT_FOUND: "error_catalogue_not_found",
  STORAGE_OBJECT_MISSING: "error_storage_object_missing",
};

const CODES_GENERIQUES: Record<string, TranslationKey> = {
  BAD_REQUEST: "error_bad_request",
  UNAUTHORIZED: "error_unauthorized",
  FORBIDDEN: "error_forbidden",
  NOT_FOUND: "error_not_found",
  METHOD_NOT_ALLOWED: "error_bad_request",
  CONFLICT: "error_conflict",
  PAYLOAD_TOO_LARGE: "error_payload_too_large",
  VALIDATION_ERROR: "error_validation",
  RATE_LIMITED: "error_rate_limited",
  INTERNAL_ERROR: "error_internal",
  SERVER_ERROR: "error_internal",
  SERVICE_UNAVAILABLE: "error_service_unavailable",
};

/** Code déduit du statut HTTP quand le backend n'en fournit pas (proxy, ancienne version…). */
function codeDepuisStatut(status: number): string {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 413) return "PAYLOAD_TOO_LARGE";
  if (status === 422) return "VALIDATION_ERROR";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 502 && status <= 504) return "SERVICE_UNAVAILABLE";
  if (status >= 500) return "INTERNAL_ERROR";
  return "BAD_REQUEST";
}

/** Erreur levée par `apiClient` : `message` est déjà traduit, `code` / `detail` restent accessibles. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly detail: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function creerApiError(status: number, corps: unknown): ApiError {
  const { language, t } = useLanguageStore.getState();
  const donnees = (corps && typeof corps === "object" ? corps : {}) as { code?: unknown; detail?: unknown };
  const code = typeof donnees.code === "string" ? donnees.code : codeDepuisStatut(status);
  const detail = donnees.detail;

  let message: string;
  if (CODES_METIER[code]) {
    message = t(CODES_METIER[code]);
  } else if (language === "fr" && typeof detail === "string" && detail.trim()) {
    message = detail;
  } else {
    message = t(CODES_GENERIQUES[code] ?? "error_unknown");
  }
  return new ApiError(message, status, code, detail);
}

/** Échec réseau (API injoignable, CORS, coupure) : `fetch` lève une TypeError. */
export function creerErreurReseau(cause: unknown): ApiError {
  const { t } = useLanguageStore.getState();
  return new ApiError(t("error_network"), 0, "NETWORK_ERROR", cause instanceof Error ? cause.message : null);
}
