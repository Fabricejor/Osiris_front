import { apiClient } from './apiClient';
import { ValidationStatusData } from '@/types';
import type { components } from '@/types/api.generated';

// Types générés depuis l'OpenAPI du backend (`npm run gen:api`).
type Schemas = components['schemas'];
export type DashboardStat = Schemas['DashboardStat'];
export type ActivityHeatmapData = Schemas['ActivityHeatmapData'];
export type OperatorActivityHeatmapData = Schemas['OperatorActivityHeatmapData'];
export type ProcessingVolumesData = Schemas['ProcessingVolumesData'];
export type ProcessingEfficiencyData = Schemas['ProcessingEfficiencyData'];
export type OcrConfidenceData = Schemas['OcrConfidenceData'];
export type OperatorEfficiencyData = Schemas['OperatorEfficiencyData'];
export type OperatorPerformanceComparisonData = Schemas['OperatorPerformanceComparisonData'];

export const DashboardService = {
  getStats: () => {
    return apiClient<DashboardStat[]>('/v1/dashboard/stats', { method: 'GET' });
  },

  getProcessingEfficiency: () => {
    return apiClient<ProcessingEfficiencyData[]>('/v1/dashboard/processing-efficiency', { method: 'GET' });
  },

  getOcrConfidence: () => {
    return apiClient<OcrConfidenceData[]>('/v1/dashboard/ocr-confidence', { method: 'GET' });
  },

  getActivityHeatmap: () => {
    return apiClient<ActivityHeatmapData>('/v1/dashboard/activity-heatmap', { method: 'GET' });
  },

  getProcessingVolumes: () => {
    return apiClient<ProcessingVolumesData[]>('/v1/dashboard/processing-volumes', { method: 'GET' });
  },

  getOperatorEfficiency: () => {
    return apiClient<OperatorEfficiencyData[]>('/v1/dashboard/operator-efficiency', { method: 'GET' });
  },

  getOperatorComparison: () => {
    return apiClient<OperatorPerformanceComparisonData[]>('/v1/dashboard/operator-comparison', { method: 'GET' });
  },

  getValidationStatus: () => {
    return apiClient<ValidationStatusData[]>('/v1/dashboard/validation-status', { method: 'GET' });
  },

  /** `idOperateur` (id_keycloak) : limiter à un opérateur ; absent = tous. */
  getOperatorActivityHeatmap: (idOperateur?: string) => {
    const params = idOperateur ? `?id_operateur=${encodeURIComponent(idOperateur)}` : '';
    return apiClient<OperatorActivityHeatmapData>(`/v1/dashboard/operator-activity-heatmap${params}`, { method: 'GET' });
  }
};
