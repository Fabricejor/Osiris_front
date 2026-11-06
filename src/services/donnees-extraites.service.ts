import { apiClient } from './apiClient';
import type { components } from '@/types/api.generated';

/** `DonneeExtraiteRead` (backend : src/schemas/donnee_extraite.py) — généré depuis l'OpenAPI. */
export type DonneeExtraite = components['schemas']['DonneeExtraiteRead'];
export type CategorieRejet = components['schemas']['CategorieRejet'];

interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface DonneesFiltres {
  statut?: 'a_valider' | 'validee' | 'rejetee';
  id_session_scan?: string;
  /** Lignes d'UNE page (registre_scanne) — ce qu'affiche le popup de validation. */
  id_registre_scanne?: string;
}

export const DonneesExtraitesService = {
  /** Lignes extraites par l'OCR, filtrées par statut / session / page. */
  async getDonnees(
    filtres: DonneesFiltres = {},
    limit: number = 100,
    offset: number = 0,
  ): Promise<ListResponse<DonneeExtraite>> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    params.set('statut', filtres.statut ?? 'a_valider');
    if (filtres.id_session_scan) params.set('id_session_scan', filtres.id_session_scan);
    if (filtres.id_registre_scanne) params.set('id_registre_scanne', filtres.id_registre_scanne);
    return apiClient<ListResponse<DonneeExtraite>>(`/v1/donnees-extraites?${params}`, { method: 'GET' });
  },

  async getDonneeById(id: string): Promise<DonneeExtraite> {
    return apiClient<DonneeExtraite>(`/v1/donnees-extraites/${id}`, { method: 'GET' });
  },

  /**
   * Valide une ligne. `corrections` = `{nom_champ: nouvelle_valeur}` pour les
   * seuls champs modifiés ; vide → la lecture OCR est acceptée telle quelle.
   */
  async validerDonnee(id: string, corrections: Record<string, unknown> = {}): Promise<DonneeExtraite> {
    return apiClient<DonneeExtraite>(`/v1/donnees-extraites/${id}/valider`, {
      method: 'POST',
      body: JSON.stringify({ corrections }),
    });
  },

  async rejeterDonnee(id: string, categorie: CategorieRejet, motif?: string): Promise<DonneeExtraite> {
    return apiClient<DonneeExtraite>(`/v1/donnees-extraites/${id}/rejeter`, {
      method: 'POST',
      body: JSON.stringify({ categorie, motif }),
    });
  },
};
