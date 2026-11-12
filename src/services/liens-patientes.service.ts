import { apiClient } from './apiClient';
import type { components } from '@/types/api.generated';

type Schemas = components['schemas'];
export type LienPatiente = Schemas['LienPatienteRead'];
export type StatutLienPatiente = Schemas['StatutLienPatiente'];
export type BilanRapprochement = Schemas['BilanRapprochementRead'];
export type DecisionLien = Schemas['DecisionLienRead'];

/** Résumé d'un dossier dans `criteres.avant` / `criteres.apres` (cf. backend `Dossier.resume`). */
export interface DossierResume {
  type_registre: 'CPN' | 'ACCOUCHEMENTS' | 'CPON' | 'SAA';
  numero_ordre: number;
  nom: string | null;
  adresse: string | null;
  age: number | null;
  parite: number | null;
  gestite: number | null;
  date_reference: string | null;
  nombre_visites: number | null;
}

export interface CriteresLien {
  similarite_nom?: number;
  similarite_adresse?: number;
  ecart_jours?: number;
  ecart_age?: number;
  ecart_parite?: number;
  avant?: DossierResume;
  apres?: DossierResume;
}

export const LiensPatientesService = {
  /** Recalcule les suggestions sur les données validées (liens décidés jamais modifiés). */
  calculer: () => apiClient<BilanRapprochement>('/v1/liens-patientes/calculer', { method: 'POST' }),

  lister: (statut: StatutLienPatiente, limit = 50, offset = 0) =>
    apiClient<{ items: LienPatiente[]; total: number }>(
      `/v1/liens-patientes?statut=${statut}&limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    ),

  confirmer: (id: string) => apiClient<DecisionLien>(`/v1/liens-patientes/${id}/confirmer`, { method: 'POST' }),

  rejeter: (id: string) => apiClient<DecisionLien>(`/v1/liens-patientes/${id}/rejeter`, { method: 'POST' }),
};
