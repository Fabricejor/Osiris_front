/**
 * Ce fichier centralise les types et interfaces globaux de l'application.
 * Vous pouvez les importer n'importe où via `import type { User } from "@/types";`
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'AGENT_TERRAIN' | 'VALIDEUR_MEDICAL' | 'ADMIN' | 'SUPERADMIN';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface DonneeExtraite {
  id: string;
  id_registre_scanne: string;
  donnees_brutes_ocr: Record<string, any>;
  donnees_validees?: Record<string, any>;
  alertes?: string[];
  missings_reels?: string[];
  statut: 'A_VALIDER' | 'VALIDEE' | 'REJETEE';
  date_validation?: string;
  score_confiance?: number;
  valeur_extraite?: string;
}

export interface PiiCellule {
  id: string;
  cell_id: string;
  nom_champ: string;
  crop_url: string;
  valeur_saisie?: string;
  date_saisie?: string;
  statut: 'A_SAISIR' | 'SAISIE';
  score_confiance?: number;
}

export interface AuditLog {
  id: string;
  type_action: string;
  type_ressource: string;
  id_ressource?: string;
  id_utilisateur_acteur: string;
  details?: Record<string, any>;
  date_action: string;
}
