import { apiClient } from './apiClient';
import type { components } from '@/types/api.generated';

// Types générés depuis l'OpenAPI du backend (`npm run gen:api`).
type Schemas = components['schemas'];
export type AuditLogRead = Schemas['AuditLogRead'];

export interface FiltresAudit {
  type_action?: string;
  type_ressource?: string;
  /** AAAA-MM-JJ, inclus. */
  date_debut?: string;
  /** AAAA-MM-JJ, inclus (jusqu'à la fin de la journée). */
  date_fin?: string;
}

export const AuditService = {
  /** Journal d'activité paginé ; filtres appliqués par l'API sur tout l'historique. */
  async getLogs(limit: number = 50, offset: number = 0, filtres: FiltresAudit = {}) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    for (const [cle, valeur] of Object.entries(filtres)) {
      if (valeur) params.append(cle, valeur);
    }
    return apiClient<Schemas['AuditLogsListResponse']>(`/v1/audit?${params.toString()}`, { method: 'GET' });
  },
};
