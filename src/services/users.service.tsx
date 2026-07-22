import { apiClient } from "./apiClient";
import type { User } from "../types";

// Ce fichier regroupe uniquement les requêtes liées à la gestion des utilisateurs (ex: pour l'admin du dashboard)

export const UsersService = {
  getAllUsers: async () => {
    const res = await apiClient<{items: any[], total: number}>("/v1/auth/users", {
      method: "GET",
    });
    return (res.items || []).map((u: any) => ({
      id: u.id_keycloak,
      email: u.email,
      firstName: u.nom_prenom?.split(' ')[0] || '',
      lastName: u.nom_prenom?.split(' ').slice(1).join(' ') || '',
      role: u.type_utilisateur,
      status: u.status,
      createdAt: u.created_at || new Date().toISOString(),
      updatedAt: u.updated_at || new Date().toISOString(),
    } as User));
  },

  getUserById: async (userId: string) => {
    return apiClient<User>(`/v1/auth/users/${userId}`, {
      method: "GET",
    });
  },

  createUser: async (data: any) => {
    // Format the payload according to backend schema expectations
    const payload = {
      email: data.email,
      nom_prenom: data.nom_prenom || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      numero_telephone: data.numero_telephone,
    };

    const role = (data.role || '').toUpperCase();

    if (role === 'ADMIN') {
      return apiClient<any>("/v1/auth/admins", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          id_structure_sanitaire: data.id_structure_sanitaire
        }),
      });
    } else if (role === 'VALIDEUR_MEDICAL' || role === 'VALIDEUR') {
      return apiClient<any>("/v1/auth/valideurs-medicaux", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } else {
      // Default to AGENT_TERRAIN
      return apiClient<any>("/v1/auth/agents-terrain", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  },


  updateUser: async (userId: string, data: Partial<User> | { status: string, nom_prenom?: string, numero_telephone?: string }) => {
    return apiClient<User>(`/v1/auth/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (userId: string) => {
    return apiClient<{ temporary_password: string }>(`/v1/auth/users/${userId}/reset-password`, {
      method: "POST",
    });
  },

  deleteUser: async (userId: string) => {
    return apiClient(`/v1/auth/users/${userId}`, {
      method: "DELETE",
    });
  },
};
