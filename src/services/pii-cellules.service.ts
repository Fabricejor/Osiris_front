import { apiClient } from './apiClient';
import type { PiiCellule } from '@/types';

interface ListResponse<T> {
  items: T[];
  total: number;
}

export const PiiCellulesService = {
  /**
   * Récupère la liste des cellules PII nécessitant une saisie
   */
  async getCellulesASaisir(
    limit: number = 50,
    offset: number = 0,
    statut: string = 'a_saisir',
    id_session_scan?: string
  ): Promise<ListResponse<PiiCellule>> {
    let url = `/v1/pii-cellules?limit=${limit}&offset=${offset}&statut=${statut}`;
    if (id_session_scan) {
      url += `&id_session_scan=${id_session_scan}`;
    }
    return apiClient<ListResponse<PiiCellule>>(url, { method: 'GET' });
  },

  /**
   * Récupère le détail d'une cellule PII (incluant une URL de crop présignée fraîche)
   */
  async getCelluleById(id: string): Promise<PiiCellule> {
    return apiClient<PiiCellule>(`/v1/pii-cellules/${id}`, { method: 'GET' });
  },

  /**
   * Enregistre la saisie d'une cellule PII
   */
  async saisirCellule(id: string, valeur: string): Promise<void> {
    await apiClient(`/v1/pii-cellules/${id}/saisir`, {
      method: 'POST',
      body: JSON.stringify({ valeur }),
    });
  }
};
