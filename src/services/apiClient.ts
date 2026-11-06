/**
 * apiClient.ts
 * 
 * Un client de base (wrapper autour de fetch) pour faciliter les appels vers votre API Backend.
 * Ce fichier centralise la logique de vos requêtes (gestion des headers par défaut, 
 * interception des erreurs, etc.).
 */

import { useAuthStore } from '@/store/authStore';
import { env } from '@/utils/env';
import { logger } from '@/utils/logger';
import { logSecurityEventClient } from '@/utils/securityMonitor';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  // Vous pouvez ajouter des options personnalisées ici (ex: requireAuth: boolean)
}

/**
 * Endpoints d'auth pour lesquels un 401 ne doit PAS déclencher de refresh :
 * identifiants invalides (login), refresh lui-même, logout.
 */
const NO_REFRESH_ENDPOINTS = ['/v1/auth/session', '/v1/auth/session/refresh', '/v1/auth/login', '/v1/auth/logout'];

/**
 * Refresh partagé : si plusieurs requêtes reçoivent un 401 en même temps
 * (ex. les 10 appels du dashboard), un seul POST /auth/session/refresh part
 * et toutes attendent son résultat.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`${API_BASE_URL}/v1/auth/session/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

function handleSessionExpired() {
  useAuthStore.getState().logout();
  // Optionnel : rediriger vers /login, mais le Guard s'en chargera généralement via l'état
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

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
    let response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);

    // 2b. Access token expiré : on tente UN refresh (cookie httpOnly) puis on
    // rejoue la requête. On ne déconnecte que si le refresh échoue.
    const endpointPath = endpoint.split('?')[0];
    if (response.status === 401 && !NO_REFRESH_ENDPOINTS.includes(endpointPath)) {
      const refreshed = await refreshSession();
      if (refreshed) {
        response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
      }
    }

    // 3. Gestion des erreurs (ex: 401 Unauthorized, 404 Not Found)
    if (!response.ok) {
      if (response.status === 401 && !NO_REFRESH_ENDPOINTS.includes(endpointPath)) {
        // Refresh impossible (refresh token expiré/révoqué) → vraie fin de session.
        handleSessionExpired();
      }

      if (response.status === 403) {
         logSecurityEventClient({
            type: 'AUTH_FAILURE',
            message: `Forbidden access attempt to ${endpoint}`,
            severity: 'medium',
            context: 'apiClient interceptor'
         });
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
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    
    // Si la réponse est 204 No Content, on ne parse pas le JSON
    if (response.status === 204) {
      return {} as T;
    }
    
    // 4. Retourner les données formatées
    const data = await response.json();
    return data as T;
    
  } catch (error) {
    logger.error(`[API Error] lors de l'appel vers ${endpoint}:`, error);
    throw error;
  }
}

