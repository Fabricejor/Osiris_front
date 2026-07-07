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

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { headers, ...restOptions } = options;
  
  // 1. Préparation des Headers par défaut (ex: Content-Type, Authorization si token présent)
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${votreTokenIci}`,
  };

  const finalOptions: RequestInit = {
    ...restOptions,
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
      // Optionnel : Gérer ici le rafraîchissement des tokens si vous avez un 401
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    // 4. Retourner les données formatées
    const data = await response.json();
    return data as T;
    
  } catch (error) {
    console.error(`[API Error] lors de l'appel vers ${endpoint}:`, error);
    throw error;
  }
}
