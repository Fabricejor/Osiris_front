# Utils

Ce dossier (`src/utils`) rassemble les fonctions utilitaires pures.

## Règles
- Une fonction pure ne dépend pas de l'état de l'application et n'a pas d'effets de bord (si on lui donne la même entrée, elle renvoie toujours la même sortie).
- Idéalement, ces fonctions ne dépendent d'aucune bibliothèque liée à React.
- Exemples : `formatDate.ts`, `calculateTotal.ts`, `validateEmail.ts`.
- Ces fonctions sont facilement testables avec des tests unitaires (Jest, Vitest).
