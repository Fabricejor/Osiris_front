# UI Components

Ce dossier (`src/components/ui`) est destiné à contenir tous les composants de base, dits "stupides" (dumb components) ou de présentation. 

## Règles
- Ces composants ne doivent contenir aucune logique métier (business logic).
- Ils reçoivent des données et des callbacks via leurs `props`.
- Ils sont hautement réutilisables à travers toute l'application.
- Exemples : `Button`, `Input`, `Card`, `Modal`, `Tooltip`, etc.
- Typiquement, c'est ici que l'on place les composants générés par des outils comme **shadcn/ui**.
