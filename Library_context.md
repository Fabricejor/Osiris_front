# Context.md - Bibliothèques Frontend

Ce projet utilise Next.js, React et TailwindCSS.

Les bibliothèques suivantes sont installées et doivent être privilégiées dans tout le projet.

---

# Shadcn/UI

Shadcn/UI est la bibliothèque principale de composants.

Toujours utiliser les composants Shadcn avant d'en créer un personnalisé.

Exemples :

- Button
- Card
- Input
- Table
- Dialog
- Select
- Badge
- Sheet
- Tabs
- Calendar
- Alert
- Skeleton

Ne jamais recréer un composant déjà disponible dans Shadcn.

---

# Radix UI

Radix UI fournit les composants accessibles utilisés par Shadcn.

Utiliser Radix uniquement lorsque le composant n'existe pas directement dans Shadcn.

Exemples :

- Dialog
- Dropdown Menu
- Tooltip
- Popover
- Tabs
- Select
- Avatar
- Checkbox
- Switch
- Scroll Area

---

# TanStack React Query

Toutes les requêtes HTTP vers le backend doivent être gérées avec React Query.

Utiliser :

- useQuery()
- useMutation()
- QueryClient

Avantages :

- cache automatique
- refetch
- retry
- gestion du loading
- gestion des erreurs

Ne jamais utiliser useEffect pour charger des données provenant de l'API.

---

# TanStack Table

Toutes les tables du projet doivent utiliser TanStack Table.

Fonctionnalités :

- tri
- pagination
- recherche
- filtres
- colonnes dynamiques
- sélection de lignes

---

# React Hook Form

Tous les formulaires doivent utiliser React Hook Form.

Exemples :

- Connexion
- Validation OCR
- Profil
- Filtres
- Export

Éviter les useState pour gérer les champs d'un formulaire.

---

# Zod

Toutes les validations doivent être réalisées avec Zod.

Utiliser des schémas de validation.

Exemples :

- email
- mot de passe
- nombres
- dates
- champs obligatoires

Toujours connecter Zod à React Hook Form via @hookform/resolvers.

---

# Zustand

Zustand est utilisé pour le state global de l'application.

À utiliser uniquement pour les données globales.

Exemples :

- utilisateur connecté
- token
- sidebar
- thème
- notifications
- batch sélectionné

Ne pas utiliser Zustand pour les données provenant de l'API.

Les données serveur doivent rester dans React Query.

---

# Axios

Toutes les requêtes HTTP doivent passer par Axios.

Créer une seule instance Axios.

Exemple :

lib/api.ts

Cette instance doit gérer :

- baseURL
- Authorization
- interceptors
- gestion des erreurs

---

# Lucide React

Toutes les icônes doivent provenir de Lucide React.

Ne jamais mélanger plusieurs bibliothèques d'icônes.

---

# Sonner

Toutes les notifications doivent utiliser Sonner.

Exemples :

- succès
- erreur
- avertissement
- information

Ne pas utiliser alert().

---

# Date-fns

Toutes les manipulations de dates doivent utiliser date-fns.

Exemples :

- formatage
- différence entre dates
- ajout de jours
- comparaison

Ne pas manipuler les dates manuellement.

---

# React Day Picker

Tous les calendriers utilisent React Day Picker.

À utiliser avec les composants Shadcn.

---

# Recharts

Tous les graphiques utilisent Recharts.

Exemples :

- BarChart
- LineChart
- PieChart
- AreaChart

Aucune autre bibliothèque de graphiques ne doit être utilisée.

---

# React Photo View

Utilisé pour afficher les images OCR.

Fonctionnalités :

- aperçu plein écran
- galerie
- navigation

---

# React Zoom Pan Pinch

Utilisé pour manipuler les images OCR.

Fonctionnalités :

- zoom
- déplacement
- rotation

Principalement utilisé dans l'écran de validation clinique.

---

# Next Themes

Utilisé pour gérer le thème de l'application.

Le thème doit être géré via ThemeProvider.

---

# Framer Motion

Toutes les animations utilisent Framer Motion.

Exemples :

- ouverture de dialogue
- apparition de cartes
- transitions
- animations de page

Éviter les animations CSS complexes.

---

# CMDK

CMDK est utilisé pour créer une palette de commandes.

Exemple :

Ctrl + K

Recherche rapide dans l'application.

---

# React Resizable Panels

Utilisé pour créer des panneaux redimensionnables.

Principal cas d'utilisation :

Écran de validation OCR

- image à gauche
- formulaire à droite

L'utilisateur peut ajuster la largeur des deux panneaux.

---

# clsx

Utilisé pour construire les classes CSS de manière conditionnelle.

---

# tailwind-merge

Utilisé avec clsx pour éviter les conflits de classes Tailwind.

Toujours privilégier une fonction utilitaire de type cn() qui combine clsx et tailwind-merge.

---

# Règles générales

- Toujours privilégier les composants Shadcn.
- Toujours utiliser React Query pour les données serveur.
- Toujours utiliser Axios pour les appels API.
- Toujours utiliser React Hook Form + Zod pour les formulaires.
- Toujours utiliser Zustand uniquement pour le state global.
- Toujours utiliser Lucide React pour les icônes.
- Toujours utiliser Sonner pour les notifications.
- Toujours utiliser Recharts pour les graphiques.
- Toujours utiliser Framer Motion pour les animations.
- Toujours utiliser React Resizable Panels pour les interfaces à double panneau.
- Ne jamais introduire une nouvelle bibliothèque sans justification.

---

# Three.js / React Three Fiber / Drei

Utilisés pour l'affichage et la manipulation de modèles 3D (ex: .glb, .gltf) dans l'application.

Bibliothèques :
- `three` : Moteur 3D principal.
- `@react-three/fiber` : Wrapper React pour Three.js.
- `@react-three/drei` : Composants utilitaires pour faciliter la création de scènes 3D (contrôles de caméra, environnement, chargement de modèles, etc.).

---

# React Icons

Utilisé pour avoir accès à une plus large variété de packs d'icônes (Material Design, FontAwesome, etc.), particulièrement pour obtenir des icônes exactes ou spécifiques à certaines maquettes lorsque Lucide React ne suffit pas.
