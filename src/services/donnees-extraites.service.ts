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
  /** 'tous' : lignes à valider, validées et rejetées. */
  statut?: 'a_valider' | 'validee' | 'rejetee' | 'tous';
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
    if (filtres.statut === 'tous') params.set('inclure_validees', 'true');
    else params.set('statut', filtres.statut ?? 'a_valider');
    if (filtres.id_session_scan) params.set('id_session_scan', filtres.id_session_scan);
    if (filtres.id_registre_scanne) params.set('id_registre_scanne', filtres.id_registre_scanne);
    return apiClient<ListResponse<DonneeExtraite>>(`/v1/donnees-extraites?${params}`, { method: 'GET' });
  },

  /**
   * TOUTES les lignes d'une page (à valider, validées, rejetées), toutes
   * pages de résultats confondues : une page CPN 2023 dépasse souvent 100 lignes.
   */
  async getToutesDeLaPage(idRegistre: string): Promise<DonneeExtraite[]> {
    const items: DonneeExtraite[] = [];
    for (let offset = 0; ; offset += 100) {
      const page = await this.getDonnees({ id_registre_scanne: idRegistre, statut: 'tous' }, 100, offset);
      items.push(...page.items);
      if (page.items.length === 0 || items.length >= page.total) return items;
    }
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

  /** Corrige une ligne DÉJÀ validée (tracé dans l'audit, avant / après). */
  async corrigerDonnee(id: string, corrections: Record<string, unknown>): Promise<DonneeExtraite> {
    return apiClient<DonneeExtraite>(`/v1/donnees-extraites/${id}/corriger`, {
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
