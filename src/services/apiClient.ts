/**
 * apiClient.ts
 * 
 * Un client de base (wrapper autour de fetch) pour faciliter les appels vers votre API Backend.
 * Ce fichier centralise la logique de vos requêtes (gestion des headers par défaut, 
 * interception des erreurs, etc.).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  // Vous pouvez ajouter des options personnalisées ici (ex: requireAuth: boolean)
}

import { useAuthStore } from '@/store/authStore';

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { headers, ...restOptions } = options;

  // 1. Préparation des Headers par défaut (ex: Content-Type)
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const finalOptions: RequestInit = {
    ...restOptions,
    credentials: "include", // Très important pour envoyer les cookies httpOnly
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  try {
    // 2. L'appel HTTP
    const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
    
    // 3. Gestion des erreurs (ex: 401 Unauthorized, 404 Not Found)
    if (!response.ok) {
      if (response.status === 401) {
        // Handle 401 Unauthorized globally
        useAuthStore.getState().logout();
        // Optionnel : rediriger vers /login, mais le Guard s'en chargera généralement via l'état
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.href = '/';
        }
      }
      
      // Tentative de lecture du body JSON pour extraire le "detail"
      let errorMessage = `Erreur HTTP: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Le body n'est pas du JSON, on garde le message générique
      }
      
      throw new Error(errorMessage);
    }
    
    // Si la réponse est 204 No Content, on ne parse pas le JSON
    if (response.status === 204) {
      return {} as T;
    }
    
    // 4. Retourner les données formatées
    const data = await response.json();
    return data as T;
    
  } catch (error) {
    console.error(`[API Error] lors de l'appel vers ${endpoint}:`, error);
    throw error;
  }
}
