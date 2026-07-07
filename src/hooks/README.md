# Custom Hooks

Ce dossier (`src/hooks`) regroupe tous les React Hooks personnalisés créés pour l'application.

## Règles
- Un hook personnalisé commence toujours par `use` (ex: `useAuth`, `useLocalStorage`, `useWindowSize`).
- Ils permettent d'extraire et de réutiliser la logique d'état ou des effets de bord à travers plusieurs composants.
- Ils ne doivent pas renvoyer de JSX (ce serait alors un composant).
