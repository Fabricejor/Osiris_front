# Store

Ce dossier (`src/store`) contient la configuration pour la gestion de l'état global (Global State Management) de l'application.

## Règles
- C'est ici que l'on configure Zustand, Redux, Jotai, ou les Contextes React globaux.
- On y stocke les états qui doivent être partagés par de nombreux composants distants dans l'arborescence (ex: données de l'utilisateur connecté, thème de l'application, paramètres globaux du dashboard).
- Pour un état local à un composant, il faut utiliser `useState` ou `useReducer` directement dans le composant concerné.
