/**
 * Ce fichier centralise les types et interfaces globaux de l'application.
 * Vous pouvez les importer n'importe où via `import type { User } from "@/types";`
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
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

// Vous pourrez ajouter ici d'autres types métier, par exemple :
// export interface Product { ... }
// export interface Transaction { ... }
