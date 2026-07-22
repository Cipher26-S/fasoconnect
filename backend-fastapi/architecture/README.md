# Architecture technique — FasoConnect Backend

Documentation de l'architecture du backend Python/FastAPI/SQLAlchemy/PostgreSQL. Chaque document couvre une préoccupation précise :

| Document | Contenu |
|---|---|
| [data-model.md](data-model.md) | Les 9 entités, leurs relations et les règles de suppression en cascade |
| [modules.md](modules.md) | Les 12 modules fonctionnels et l'ensemble des routes exposées |
| [authentication.md](authentication.md) | Le flux JWT, la gestion des rôles et les dépendances de sécurité |
| [recommendation-engine.md](recommendation-engine.md) | L'algorithme de recommandation d'artisans (scoring pondéré à 8 critères) |

## Vue d'ensemble

```
Client (mobile / web)
        │  HTTP + JSON, Bearer JWT
        ▼
┌───────────────────────────────────┐
│  FastAPI (app/main.py)            │
│  ├─ middlewares CORS, erreurs     │
│  ├─ 12 routeurs par module        │
│  └─ documentation OpenAPI auto    │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  Services (app/services/)         │
│  logique métier, un fichier par   │
│  domaine, indépendante du         │
│  framework HTTP                   │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  SQLAlchemy 2.0 (async)           │
└───────────────────────────────────┘
        │
        ▼
   PostgreSQL (base "fasoconnect")
```

## Principes de conception

- **Séparation stricte routeurs / schémas / services** : les routeurs FastAPI ne contiennent pas de logique métier, celle-ci vit dans `app/services/`, testable indépendamment du framework HTTP.
- **Validation systématique en entrée/sortie** : chaque route déclare ses schémas Pydantic (`app/schemas/`) en paramètre et en type de retour — FastAPI valide et documente automatiquement à partir de ces déclarations.
- **Gestion d'erreurs centralisée** : une exception métier dédiée (`AppError`) est interceptée par un gestionnaire d'exception global, pour un format de réponse JSON uniforme.
- **Autorisation par rôle** : une dépendance FastAPI (`Depends(require_role("ADMIN"))`) restreint certaines routes aux rôles `ADMIN`, `ARTISAN` ou `CUSTOMER`.
- **Documentation générée depuis le code** : la spécification OpenAPI est produite automatiquement à partir des schémas Pydantic et des annotations de route, sans maintenance manuelle.
