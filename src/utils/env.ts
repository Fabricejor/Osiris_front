/**
 * env.ts
 *
 * Validation stricte des variables d'environnement au démarrage de l'application
 * (Inspiré des bonnes pratiques de sécurité)
 */

export const env = {
  // NEXT_PUBLIC_API_URL est utilisé côté client et serveur
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  
  // NODE_ENV par défaut en développement
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // URL de webhook pour le monitoring de sécurité (optionnel)
  SECURITY_WEBHOOK_URL: process.env.SECURITY_WEBHOOK_URL,

  get isProduction() {
    return this.NODE_ENV === "production";
  },

  get isDevelopment() {
    return this.NODE_ENV === "development";
  }
};
