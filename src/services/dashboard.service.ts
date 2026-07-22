import { apiClient } from './apiClient';
import {
  DashboardStat,
  ProcessingEfficiencyData,
  OcrPerformanceData,
  OcrConfidenceData,
  ActivityHeatmapData,
  ProcessingVolumesData,
  OperatorEfficiencyData,
  OperatorPerformanceComparisonData,
  ValidationStatusData,
  OperatorActivityHeatmapData
} from '@/types';

export const DashboardService = {
  getStats: () => {
    return apiClient<DashboardStat[]>('/v1/dashboard/stats', { method: 'GET' });
  },

  getProcessingEfficiency: () => {
    return apiClient<ProcessingEfficiencyData[]>('/v1/dashboard/processing-efficiency', { method: 'GET' });
  },

  getOcrPerformance: () => {
    return apiClient<OcrPerformanceData[]>('/v1/dashboard/ocr-performance', { method: 'GET' });
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

  getOperatorActivityHeatmap: () => {
    return apiClient<OperatorActivityHeatmapData>('/v1/dashboard/operator-activity-heatmap', { method: 'GET' });
  }
};
