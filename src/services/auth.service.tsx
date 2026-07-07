import { apiClient } from "./apiClient";
import type { User } from "../types"; // En supposant que vous ayez un type User dans src/types

// Ce fichier regroupe uniquement les requêtes liées à l'authentification

export const AuthService = {
  login: async (credentials: Record<string, string>) => {
    return apiClient<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: Record<string, string>) => {
    return apiClient<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiClient("/auth/logout", {
      method: "POST",
    });
  },
};
