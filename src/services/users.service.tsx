import { apiClient } from "./apiClient";
import type { User } from "../types";

// Ce fichier regroupe uniquement les requêtes liées à la gestion des utilisateurs (ex: pour l'admin du dashboard)

export const UsersService = {
  getAllUsers: async () => {
    return apiClient<User[]>("/users", {
      method: "GET",
    });
  },

  getUserById: async (userId: string) => {
    return apiClient<User>(`/users/${userId}`, {
      method: "GET",
    });
  },

  updateUser: async (userId: string, data: Partial<User>) => {
    return apiClient<User>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (userId: string) => {
    return apiClient(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};
