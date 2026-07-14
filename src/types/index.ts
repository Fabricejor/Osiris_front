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
  status?: string;
  ip_address?: string;
  user_name?: string;
}

export interface DashboardStat {
  title: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon?: any; // Just for frontend mapping if needed, usually we don't return icon from backend
}

export interface ProcessingEfficiencyData {
  name: string;
  value: number;
}

export interface OcrPerformanceData {
  name: string;
  value: number;
}

export interface OcrConfidenceData {
  name: string;
  value: number;
}

export interface ActivityHeatmapData {
  // 6 weeks x 12 months array for instance, or any structure
  weeks: number[];
  months: string[];
  data: number[][]; // [weekIndex][monthIndex]
}

export interface ProcessingVolumesData {
  date: string;
  records: number;
  rate: number;
}

export interface OperatorEfficiencyData {
  id: string;
  operator: string;
  role: string;
  processed: number;
  accuracy: number;
  avgTime: string;
  status: 'Online' | 'Offline' | 'Busy';
}

export interface OperatorPerformanceComparisonData {
  name: string;
  processed: number;
  errors: number;
}

export interface ValidationStatusData {
  name: string;
  value: number;
}

export interface OperatorActivityHeatmapData {
  hours: string[];
  days: string[];
  data: number[][]; // [hourIndex][dayIndex]
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

export type ExportFormat = 'csv' | 'pdf';

export interface ExportRecord {
  id: string;
  fileName: string;
  date: string;
  status: string;
  downloadUrl?: string;
}

export interface ExportFilterOptions {
  structure_id?: string;
  catalogue_id?: string;
  date_debut?: string;
  date_fin?: string;
}
