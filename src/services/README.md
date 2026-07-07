# Services

Ce dossier (`src/services`) centralise la logique de communication avec les systèmes externes, principalement les appels d'API (backend).

## Règles
- Toutes les requêtes HTTP (fetch, axios) vers l'extérieur doivent être encapsulées dans des fonctions placées ici.
- Cela permet de séparer la logique de récupération de données de la logique de présentation (les composants).
- Exemples de fichiers : `auth.service.ts`, `user.service.ts`, `apiClient.ts`.
- En cas de changement d'URL d'API ou de méthode d'authentification, les modifications se feront uniquement ici.
