# Constants

Ce dossier (`src/constants`) sert à stocker toutes les valeurs constantes de l'application.

## Règles
- Il aide à éviter les "magic numbers" (nombres magiques) et les chaînes de caractères codées en dur un peu partout dans le code.
- Exemples : clés du Local Storage, URL d'API de base, palettes de couleurs d'application (si non gérées par Tailwind), menus de navigation statiques.
- En centralisant ces valeurs, on s'assure qu'en cas de modification, on ne change le code qu'à un seul endroit.
