import { apiClient } from './apiClient';
import type { User, UserRole } from '@/types';

/** Réponse de GET /auth/me (backend : `UtilisateurRead`, src/schemas/utilisateur.py). */
interface MeResponse {
  id_keycloak: string;
  email: string;
  nom_prenom: string;
  numero_telephone: string | null;
  type_utilisateur: 'ADMIN' | 'AGENT_TERRAIN' | 'VALIDEUR_MEDICAL' | 'ANALYSTE';
  status: string;
  roles: string[];
  date_creation: string;
  date_modification: string;
}

/** Rôle effectif : les rôles Keycloak (JWT) font foi, `superadmin` l'emporte. */
function deriveRole(me: MeResponse): UserRole {
  if (me.roles.includes('superadmin')) return 'SUPERADMIN';
  if (me.roles.includes('admin')) return 'ADMIN';
  if (me.roles.includes('valideur_medical')) return 'VALIDEUR_MEDICAL';
  if (me.roles.includes('agent_terrain')) return 'AGENT_TERRAIN';
  return me.type_utilisateur === 'ANALYSTE' ? 'VALIDEUR_MEDICAL' : me.type_utilisateur;
}

function toUser(me: MeResponse): User {
  const [firstName, ...rest] = me.nom_prenom.trim().split(/\s+/);
  return {
    id: me.id_keycloak,
    email: me.email,
    firstName,
    lastName: rest.join(' '),
    role: deriveRole(me),
    roles: me.roles,
    fullName: me.nom_prenom,
    phone: me.numero_telephone,
    status: me.status,
    createdAt: me.date_creation,
    updatedAt: me.date_modification,
  };
}

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

    // 2. Récupération du profil utilisateur (les cookies sont envoyés automatiquement par apiClient).
    // Pas de profil de secours : sans /auth/me on ne connaît pas le rôle réel,
    // le login doit échouer plutôt que d'inventer un ADMIN.
    const user = await this.getCurrentUser();
    return { user };
  },

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    const me = await apiClient<MeResponse>('/v1/auth/me', {
      method: 'GET'
    });
    return toUser(me);
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
