import { apiClient } from './apiClient';

export interface Registre {
  id: string;
  id_session_scan: string;
  numero_page?: number;
  type_page?: string;
  statut: string;
  object_key?: string;
  date_creation: string;
}

export const RegistresService = {
  /**
   * Récupère un registre par son ID
   */
  async getRegistreById(id: string): Promise<Registre> {
    return apiClient<Registre>(`/v1/registres/${id}`, { method: 'GET' });
  }
};
