import { apiClient } from './apiClient';
import type { AuditLog } from '@/types';

interface ListResponse<T> {
  items: T[];
  total: number;
}

export const AuditService = {
  /**
   * Récupère le journal d'activités (audit)
   */
  async getLogs(
    limit: number = 50,
    offset: number = 0,
    type_action?: string,
    type_ressource?: string
  ): Promise<ListResponse<AuditLog>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (type_action) params.append('type_action', type_action);
    if (type_ressource) params.append('type_ressource', type_ressource);

    return apiClient<ListResponse<AuditLog>>(`/v1/audit?${params.toString()}`, { method: 'GET' });
  }
};
