# Architecture technique — FasoConnect Backend

Documentation de l'architecture du backend Node.js/Express/Prisma/PostgreSQL. Chaque document couvre une préoccupation précise :

| Document | Contenu |
|---|---|
| [data-model.md](data-model.md) | Les 9 entités, leurs relations et les règles de suppression en cascade |
| [modules.md](modules.md) | Les 12 modules fonctionnels et l'ensemble des routes exposées |
| [authentication.md](authentication.md) | Le flux JWT, la gestion des rôles et les middlewares de sécurité |
| [recommendation-engine.md](recommendation-engine.md) | L'algorithme de recommandation d'artisans (scoring pondéré à 8 critères) |

## Vue d'ensemble

```
Client (mobile Flutter / web React)
        │  HTTP + JSON, Bearer JWT
        ▼
┌───────────────────────────────────┐
│  Express (src/app-express.js)     │
│  ├─ helmet, cors, morgan          │
│  ├─ 12 routeurs par module        │
│  └─ gestionnaire d'erreurs global │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  Services (src/services/)         │
│  logique métier, un fichier par   │
│  domaine, aucun accès direct      │
│  aux requêtes/réponses HTTP       │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  Prisma Client (généré)           │
└───────────────────────────────────┘
        │
        ▼
   PostgreSQL (base "fasoconnect")
```

## Principes de conception

- **Séparation stricte routes / contrôleurs / services** : les contrôleurs ne contiennent pas de logique métier, celle-ci vit dans `src/services/`.
- **Validation systématique en entrée** : chaque route qui accepte un corps de requête passe par un schéma Zod dédié (`src/validators/`).
- **Gestion d'erreurs centralisée** : toute erreur métier est levée via `AppError` et interceptée par un middleware unique qui uniformise le format de réponse JSON.
- **Autorisation par rôle** : le middleware `authorizeRoles(...roles)` restreint certaines routes aux rôles `ADMIN`, `ARTISAN` ou `CUSTOMER`.
- **Documentation générée depuis le code** : la spécification OpenAPI (`src/docs/openapi.js`) est servie directement par l'API, pas maintenue dans un outil externe.
