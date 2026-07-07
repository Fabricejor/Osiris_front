# Types

Ce dossier (`src/types`) est dédié au typage TypeScript.

## Règles
- Il contient les interfaces (`interface`) et les types globaux (`type`) utilisés à travers l'application.
- Exemples : `User`, `Transaction`, `ApiResponse`.
- L'avantage de les centraliser ici est d'éviter les importations circulaires (circular dependencies) et de garder un code propre et structuré.
