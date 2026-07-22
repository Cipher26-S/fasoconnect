# FasoConnect — Backend

API REST qui met en relation des clients avec des artisans locaux : recherche d'artisans, demandes de service, attribution, avis, recommandations. Développée en Python avec FastAPI, SQLAlchemy et PostgreSQL.

## Stack technique

| Rôle | Choix |
|---|---|
| Framework HTTP | FastAPI |
| Serveur ASGI | uvicorn |
| Accès base de données | SQLAlchemy 2.0 (async) |
| Migrations de schéma | Alembic |
| Validation des données | Pydantic v2 |
| Authentification | python-jose (JWT) + passlib[bcrypt] |
| Upload d'images | python-multipart + Cloudinary SDK |
| Documentation API | OpenAPI générée automatiquement (Swagger UI / Redoc) |
| Tests automatisés | pytest + httpx (client async) |
| Base de données | PostgreSQL |

## Prérequis

- Python 3.11 ou plus récent
- PostgreSQL 16+ en local ou accessible à distance

## Démarrage rapide

```bash
python -m venv .venv
source .venv/bin/activate        # ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
cp .env.example .env              # renseigner DATABASE_URL, JWT_SECRET, etc.
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Le serveur démarre sur `http://localhost:8000`. Vérifications :

- `GET /health` → statut de l'API
- `GET /docs` → documentation interactive Swagger UI
- `GET /redoc` → documentation Redoc

## Structure du projet

```
backend-fastapi/
├── alembic/
│   ├── versions/            # historique des migrations de schéma
│   └── env.py
├── app/
│   ├── main.py               # point d'entrée de l'application FastAPI
│   ├── config.py             # configuration (variables d'environnement)
│   ├── database.py           # connexion et session SQLAlchemy
│   ├── models/                # modèles SQLAlchemy (une classe par entité)
│   ├── schemas/               # schémas Pydantic (validation entrée/sortie)
│   ├── routers/                # un routeur FastAPI par module métier
│   ├── services/               # logique métier, indépendante de FastAPI
│   ├── dependencies/           # dépendances partagées (authentification, pagination)
│   └── core/                   # utilitaires transverses (sécurité, gestion d'erreurs)
├── tests/                    # suite de tests automatisés (pytest)
└── architecture/             # documentation technique détaillée
```

## Documentation technique

Le dossier [`architecture/`](architecture/README.md) détaille :

- [Modèle de données](architecture/data-model.md) — entités, relations, règles de suppression
- [Modules fonctionnels](architecture/modules.md) — les 12 modules et leurs routes
- [Authentification](architecture/authentication.md) — flux JWT, rôles, dépendances de sécurité
- [Moteur de recommandation](architecture/recommendation-engine.md) — algorithme de scoring pondéré

## Tests

```bash
pytest
```

La suite couvre l'authentification, les utilisateurs, les artisans, les demandes de service, les attributions, les avis, les notifications, les recommandations, les favoris et le tableau de bord.
