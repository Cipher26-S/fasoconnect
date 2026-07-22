# FasoConnect — Backend

API REST qui met en relation des clients avec des artisans locaux (recherche, demandes de service, attribution, avis, recommandations). Développée en Node.js/Express avec Prisma et PostgreSQL.

## Stack technique

| Rôle | Choix |
|---|---|
| Framework HTTP | Express 5 |
| Accès base de données | Prisma ORM |
| Base de données | PostgreSQL |
| Validation | Zod |
| Authentification | JWT (jsonwebtoken) + bcrypt |
| Upload d'images | Multer + Cloudinary |
| Documentation API | Swagger UI / OpenAPI (`/api/docs`) |
| Tests | Runner natif Node.js (`node --test`) |

## Prérequis

- Node.js 22 LTS (ou plus récent) et npm
- PostgreSQL 16+ en local ou accessible à distance

Voir le [guide d'installation complet](../FasoConnect-guide-installation.pdf) pour une procédure détaillée sur poste Windows vierge (installation de Node.js, PostgreSQL, configuration du PATH).

## Démarrage rapide

```bash
npm install
cp .env.example .env        # puis renseigner DATABASE_URL, JWT_SECRET, etc.
npx prisma generate
npx prisma migrate dev
npm run dev
```

Le serveur démarre sur `http://localhost:5000`. Vérifications :

- `GET /health` → statut de l'API
- `GET /api/docs` → documentation interactive Swagger

## Scripts npm

| Script | Effet |
|---|---|
| `npm run dev` | Démarre le serveur avec rechargement automatique (nodemon) |
| `npm start` | Démarre le serveur en mode simple |
| `npm test` | Exécute la suite de tests automatisés (17 tests) |
| `npm run prisma:generate` | Régénère le client Prisma dans `generated/prisma` |
| `npm run prisma:migrate` | Applique les migrations de schéma |
| `npm run prisma:studio` | Ouvre une interface web pour explorer la base de données |
| `npm run prisma:validate` | Valide la cohérence du schéma Prisma |

## Structure du projet

```
backend/
├── prisma/
│   ├── schema.prisma       # modèle de données (source de vérité)
│   └── migrations/         # historique des migrations SQL
├── src/
│   ├── app-express.js      # configuration de l'application Express (point d'entrée logique)
│   ├── server.js           # démarrage du serveur HTTP
│   ├── config/             # configuration (client Prisma)
│   ├── middleware/         # authentification, upload
│   ├── modules/            # un dossier par domaine métier (routes + contrôleurs)
│   ├── services/           # logique métier, isolée des contrôleurs
│   ├── validators/         # schémas de validation Zod
│   ├── common/             # utilitaires transverses (erreurs, wrapper async)
│   └── docs/               # définition OpenAPI servie par le module docs
├── test/                   # suite de tests automatisés
└── architecture/           # documentation technique détaillée (voir ci-dessous)
```

## Documentation technique

Le dossier [`architecture/`](architecture/README.md) détaille :

- [Modèle de données](architecture/data-model.md) — entités, relations, règles de suppression
- [Modules fonctionnels](architecture/modules.md) — les 12 modules et leurs routes
- [Authentification](architecture/authentication.md) — flux JWT, rôles, middlewares
- [Moteur de recommandation](architecture/recommendation-engine.md) — algorithme de scoring pondéré

Les notes de développement historiques (audit initial, règles de contribution) restent disponibles dans [`docs/`](docs/).

## Déploiement (Render)

Le fichier [`render.yaml`](../render.yaml) à la racine du dépôt décrit un déploiement reproductible sur [Render](https://render.com) : un service web Node.js (dossier `backend/`) et une base PostgreSQL managée.

1. Pousser le dépôt sur GitHub.
2. Sur Render : **New → Blueprint**, sélectionner ce dépôt. Render détecte `render.yaml` et propose de créer le service web `fasoconnect-backend` et la base `fasoconnect-db`.
3. Renseigner les variables marquées comme secrètes (non générées automatiquement) : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — laissables vides si l'upload d'images n'est pas testé immédiatement.
4. Déployer. Le build exécute `npm install` puis `prisma generate` ; le démarrage applique les migrations (`prisma migrate deploy`) avant de lancer le serveur.
5. Vérifier `https://<nom-du-service>.onrender.com/health` et `/api/docs`.

`JWT_SECRET` est généré automatiquement par Render (valeur aléatoire, différente de celle utilisée en local — normal, chaque environnement a son propre secret). `DATABASE_URL` est injecté automatiquement depuis la base managée.

> Sur le plan gratuit, le service web s'arrête après une période d'inactivité et redémarre à la requête suivante (délai de quelques secondes) ; vérifiez les conditions actuelles de la base PostgreSQL gratuite sur render.com avant de considérer ce plan pour des données à conserver durablement.

## Tests

```bash
npm test
```

La suite couvre l'authentification, les utilisateurs, les artisans, les demandes de service, les attributions, les avis, les notifications, les recommandations, les favoris et le tableau de bord.

> Les tests écrivent actuellement des données réelles dans la base de développement plutôt que dans une base dédiée — à isoler avant d'automatiser ces tests en intégration continue.
