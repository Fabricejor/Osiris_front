# Lib

Ce dossier (`src/lib`) contient le code de configuration et d'initialisation pour des bibliothèques tierces, ainsi que des utilitaires fondamentaux liés au cœur du projet.

## Règles
- C'est ici que l'on instancie ou configure les clients externes (ex: Prisma, Supabase, Firebase, client GraphQL).
- On y trouve souvent les fonctions utilitaires fortement couplées à l'infrastructure du projet, comme la fonction `cn` pour Tailwind CSS (utilisant `clsx` et `tailwind-merge`).
- Différence avec `utils/` : `lib/` est pour la configuration et les dépendances externes, `utils/` est pour les fonctions pures indépendantes.
