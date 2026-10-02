# FasoConnect

> Plateforme de mise en relation entre clients et artisans qualifiés (électriciens, plombiers, mécaniciens…) au Burkina Faso.

Projet de fin d'études — Licence Informatique, option Programmation, Burkina Institute of Technology (BIT).

FasoConnect permet à un client de trouver un artisan près de chez lui, de lui envoyer une demande de service, de suivre l'avancement de l'intervention puis de laisser un avis. Les artisans disposent de leur propre espace pour compléter leur profil professionnel, consulter les missions ouvertes dans leur catégorie et faire avancer leurs interventions. Un tableau de bord web permet l'administration de la plateforme.

## Fonctionnalités

- **Authentification** : inscription et connexion par JWT (access + refresh token), rôles client / artisan / admin
- **Recherche d'artisans** par catégorie et localisation, avec recommandations
- **Demandes de service** : création, attribution à un artisan, cycle de vie complet (`ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED`)
- **Espace artisan** : onboarding du profil professionnel, missions ouvertes, suivi des interventions
- **Avis et notes** laissés par les clients après une intervention terminée
- **Tableau de bord admin** (web) : statistiques, gestion des utilisateurs et des artisans, export CSV
- **Upload d'images** (photos de profil, réalisations) via Cloudinary

## Architecture

```
FasoConnect/
├── backend/          API REST Node.js / Express 5 / Prisma / PostgreSQL
├── backend-fastapi/  Implémentation alternative de l'API en Python / FastAPI
├── mobile/           Application mobile Flutter (clients et artisans)
├── web/              Tableau de bord web React + Vite + Tailwind
└── render.yaml       Blueprint de déploiement Render (API + web + base)
```

## Stack technique

| Couche | Technologies |
|---|---|
| Mobile | Flutter, Dart, Provider, Dio |
| Web | React 18, Vite, Tailwind CSS |
| API | Node.js, Express 5, Prisma ORM, Zod, JWT, bcrypt, Multer + Cloudinary |
| Base de données | PostgreSQL |
| Documentation API | Swagger / OpenAPI (`/api/docs`) |
| Déploiement | Render |

## Démarrage rapide

**Prérequis** : Node.js 22+, PostgreSQL 16+, Flutter SDK 3.x.

### 1. API

```bash
cd backend
npm install
cp .env.example .env      # renseigner DATABASE_URL, JWT_SECRET, etc.
npx prisma generate
npx prisma migrate dev
npm run dev
```

La documentation interactive est ensuite disponible sur `http://localhost:<PORT>/api/docs`.
Voir [backend/README.md](backend/README.md) pour le détail.

### 2. Tableau de bord web

```bash
cd web
npm install
npm run dev
```

### 3. Application mobile

```bash
cd mobile
flutter pub get
flutter run
```

## Auteur

**Sawadogo Kiswendsida Salif** — Développeur Full-Stack & Mobile
[GitHub](https://github.com/Cipher26-S) · [LinkedIn](https://www.linkedin.com/in/salif-sawadogo-348081375)
