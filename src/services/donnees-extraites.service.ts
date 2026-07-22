import { apiClient } from './apiClient';
import type { DonneeExtraite } from '@/types';

interface ListResponse<T> {
  items: T[];
  total: number;
}

export const DonneesExtraitesService = {
  /**
   * Récupère la liste des données extraites nécessitant une validation (ou filtrées)
   */
  async getDonneesAValider(
    limit: number = 20,
    offset: number = 0,
    statut: string = 'a_valider',
    id_session_scan?: string
  ): Promise<ListResponse<DonneeExtraite>> {
    let url = `/v1/donnees-extraites?limit=${limit}&offset=${offset}&statut=${statut}`;
    if (id_session_scan) {
      url += `&id_session_scan=${id_session_scan}`;
    }
    return apiClient<ListResponse<DonneeExtraite>>(url, { method: 'GET' });
  },

  /**
   * Récupère les détails d'une ligne extraite par son ID
   */
  async getDonneeById(id: string): Promise<DonneeExtraite> {
    return apiClient<DonneeExtraite>(`/v1/donnees-extraites/${id}`, { method: 'GET' });
  },

  /**
   * Valide les données extraites (avec ou sans corrections)
   */
  async validerDonnee(id: string, corrections: Record<string, any> = {}): Promise<void> {
    await apiClient(`/v1/donnees-extraites/${id}/valider`, {
      method: 'POST',
      body: JSON.stringify({ corrections }),
    });
  },

  /**
   * Rejette la donnée avec un motif
   */
  async rejeterDonnee(id: string, categorie: string, motif?: string): Promise<void> {
    await apiClient(`/v1/donnees-extraites/${id}/rejeter`, {
      method: 'POST',
      body: JSON.stringify({ categorie, motif }),
    });
  }
};
