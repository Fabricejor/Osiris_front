/**
 * Ce fichier centralise les types et interfaces globaux de l'application.
 * Vous pouvez les importer n'importe où via `import type { User } from "@/types";`
 */

export type UserRole = 'AGENT_TERRAIN' | 'VALIDEUR_MEDICAL' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  /** Rôle effectif (dérivé des rôles Keycloak de /auth/me). */
  role: UserRole;
  /** Rôles Keycloak bruts (ex. ["admin", "superadmin"]). */
  roles?: string[];
  avatarUrl?: string;
  /** Nom complet tel qu'enregistré (`nom_prenom`). */
  fullName?: string;
  phone?: string | null;
  status?: string;
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



export interface AuditLog {
  id: string;
  type_action: string;
  type_ressource: string;
  id_ressource?: string;
  id_utilisateur_acteur: string;
  details?: Record<string, any>;
  date_action: string;
  status?: string;
  ip_address?: string;
  user_name?: string;
}

export interface ValidationStatusData {
  name: string;
  value: number;
}

export interface StructureSanitaire {
  id_structure_sanitaire: string;
  nom_structure: string;
  district_sanitaire?: string | null;
  localisation?: string | null;
  date_creation: string;
  // Fields used by frontend UI not directly matched by backend schema
  id?: string;
  nom?: string;
  type_structure?: string;
  region?: string;
  statut?: string;
}

export interface CreateStructureDto {
  nom_structure: string;
  district_sanitaire?: string | null;
  localisation?: string | null;
}

export interface UpdateStructureDto {
  nom_structure?: string;
  district_sanitaire?: string | null;
  localisation?: string | null;
}

export interface CatalogueRegistre {
  id_catalogue_registre: string;
  type_registre: string;
  annee_version: number;
  libelle: string;
  rangs_par_patient: number;
  nombre_sections?: number;
  nombre_champs?: number;
  sections?: any[];
  // Mapped for frontend UI
  id?: string;
  nom_registre?: string;
  version?: string | number;
  sectionsCount?: number;
  fieldsCount?: number;
  est_actif?: boolean;
}

export interface CreateCatalogueDto {
  type_registre: string;
  annee_version: number;
  libelle: string;
  rangs_par_patient: number;
}

export interface UpdateCatalogueDto {
  type_registre?: string;
  annee_version?: number;
  libelle?: string;
  rangs_par_patient?: number;
}

// Exports : types générés depuis l'API, voir `services/exports.service.ts`.
