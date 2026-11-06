import { apiClient } from './apiClient';
import type { components } from '@/types/api.generated';

/** `PiiCelluleRead` (backend : src/schemas/pii_cellule.py) — généré depuis l'OpenAPI. */
export type PiiCellule = components['schemas']['PiiCelluleRead'];

interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface PiiFiltres {
  statut?: 'a_saisir' | 'saisie';
  id_session_scan?: string;
  /** Cellules d'UNE page (registre_scanne). */
  id_registre_scanne?: string;
}

export const PiiCellulesService = {
  /** Cellules PII (crop image + valeur pré-lue) à saisir par le valideur. */
  async getCellules(
    filtres: PiiFiltres = {},
    limit: number = 100,
    offset: number = 0,
  ): Promise<ListResponse<PiiCellule>> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    params.set('statut', filtres.statut ?? 'a_saisir');
    if (filtres.id_session_scan) params.set('id_session_scan', filtres.id_session_scan);
    if (filtres.id_registre_scanne) params.set('id_registre_scanne', filtres.id_registre_scanne);
    return apiClient<ListResponse<PiiCellule>>(`/v1/pii-cellules?${params}`, { method: 'GET' });
  },

  /** Détail (avec une URL de crop présignée fraîche). */
  async getCelluleById(id: string): Promise<PiiCellule> {
    return apiClient<PiiCellule>(`/v1/pii-cellules/${id}`, { method: 'GET' });
  },

  async saisirCellule(id: string, valeur: string): Promise<PiiCellule> {
    return apiClient<PiiCellule>(`/v1/pii-cellules/${id}/saisir`, {
      method: 'POST',
      body: JSON.stringify({ valeur }),
    });
  },
};
