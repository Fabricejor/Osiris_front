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

  updateUser: async (userId: string, data: Partial<User>) => {
    return apiClient<User>(`/v1/auth/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (userId: string) => {
    return apiClient(`/v1/auth/users/${userId}`, {
      method: "DELETE",
    });
  },
};
