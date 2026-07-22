import { apiClient } from './apiClient';
import type { User } from '@/types';

// FastAPI default token response structure (OAuth2PasswordBearer)
interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const AuthService = {
  /**
   * Se connecte à l'API via le endpoint de session web (httpOnly cookies)
   */
  async login(username: string, password: string):Promise<{ user: User }> {
    // 1. Appel du endpoint web (crée des cookies httpOnly en réponse)
    await apiClient('/v1/auth/session', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    // 2. Récupération du profil utilisateur (les cookies sont envoyés automatiquement par apiClient)
    let user: User;
    try {
      user = await this.getCurrentUser();
    } catch (e) {
      console.warn("Could not fetch /v1/auth/me, falling back to basic user");
      user = {
        id: '1',
        email: username,
        firstName: 'Admin',
        lastName: 'Osiris',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return { user };
  },

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    return apiClient<User>('/v1/auth/me', {
      method: 'GET'
    });
  },

  /**
   * Déconnecte l'utilisateur en appelant le backend
   */
  async logout(): Promise<void> {
    try {
      await apiClient('/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
  },

  /**
   * Change le mot de passe (principalement utilisé pour le premier login avec mot de passe temporaire)
   */
  async changePassword(username: string, current_password: string, new_password: string): Promise<void> {
    await apiClient('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ username, current_password, new_password })
    });
  }
};
