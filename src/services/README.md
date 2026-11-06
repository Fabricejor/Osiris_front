# Services

Ce dossier (`src/services`) centralise la logique de communication avec les systèmes externes, principalement les appels d'API (backend).

## Règles
- Toutes les requêtes HTTP (fetch, axios) vers l'extérieur doivent être encapsulées dans des fonctions placées ici.
- Cela permet de séparer la logique de récupération de données de la logique de présentation (les composants).
- Exemples de fichiers : `auth.service.ts`, `user.service.ts`, `apiClient.ts`.
- En cas de changement d'URL d'API ou de méthode d'authentification, les modifications se feront uniquement ici.

## Types de l'API (générés)

Les types des réponses du backend sont **générés** depuis son schéma OpenAPI,
dans `src/types/api.generated.ts` (ne pas modifier à la main). Les services
les ré-exportent (ex. `SessionScan = components["schemas"]["SessionScanRead"]`).

Après une modification d'un schéma côté backend :

```bash
# 1. Dans osiris_back : exporter le schéma (sans démarrer de serveur)
uv run python scripts/api/export_openapi.py ../Osiris_front/openapi.json
# 2. Dans Osiris_front : régénérer les types, puis vérifier la compilation
npm run gen:api
npx tsc --noEmit
```

Un champ renommé ou supprimé côté backend fait alors échouer `tsc` au lieu
d'afficher `undefined` à l'écran.
