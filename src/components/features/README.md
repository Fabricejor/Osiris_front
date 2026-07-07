# Features Components

Ce dossier (`src/components/features`) regroupe les composants liés à des fonctionnalités spécifiques du métier de l'application.

## Règles
- Contrairement aux composants `ui/`, ces composants sont "intelligents" (smart components).
- Ils peuvent contenir de la logique métier, appeler des hooks personnalisés, se connecter au store global, ou gérer leur propre état complexe.
- Ils sont généralement spécifiques à un domaine de l'application et peu réutilisables en dehors de ce contexte.
- Exemples : `UserProfileCard`, `DashboardAnalyticsChart`, `TransactionHistoryTable`, etc.
