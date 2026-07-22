# Modules fonctionnels

12 modules, chacun structuré en `*.routes.js` (déclaration des routes), `*.controller.js` (adaptation HTTP) et un service dédié dans `src/services/` (logique métier). Toutes les routes sont préfixées par `/api`.

## auth — `/api/auth`

| Méthode | Route | Accès |
|---|---|---|
| POST | `/register` | public |
| POST | `/login` | public |
| POST | `/refresh` | public (nécessite un refresh token valide) |
| POST | `/logout` | authentifié |
| GET | `/me` | authentifié |

## users — `/api/users`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | ADMIN |
| GET | `/profile` | authentifié |
| PUT | `/profile` | authentifié |
| PUT | `/change-password` | authentifié |
| PATCH | `/:id/status` | ADMIN |

## categories — `/api/categories`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | public |
| POST | `/` | ADMIN |

## artisans — `/api/artisans`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | public |
| GET | `/profile` | ARTISAN |
| POST | `/profile` | ARTISAN (upload photo de profil) |
| PUT | `/profile` | ARTISAN (upload photo de profil) |
| DELETE | `/profile` | ARTISAN |
| PATCH | `/:id/verify` | ADMIN |
| GET | `/:id` | public |

## service-requests — `/api/service-requests`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | authentifié |
| POST | `/` | authentifié (upload jusqu'à 10 images) |
| GET | `/:id` | authentifié |
| PUT | `/:id` | authentifié (upload jusqu'à 10 images) |
| PATCH | `/:id/status` | authentifié |
| DELETE | `/:id` | authentifié |

## assignments — `/api/assignments`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | authentifié |
| POST | `/` | authentifié |
| GET | `/:id` | authentifié |
| PATCH | `/:id/accept` | authentifié |
| PATCH | `/:id/reject` | authentifié |
| PATCH | `/:id/complete` | authentifié |

## reviews — `/api/reviews`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | authentifié |
| POST | `/` | authentifié |
| GET | `/:id` | authentifié |

## notifications — `/api/notifications`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/` | authentifié |
| PATCH | `/read-all` | authentifié |
| GET | `/:id` | authentifié |
| PATCH | `/:id/read` | authentifié |

## recommendations — `/api/recommendations`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/artisans` | authentifié |

Détail de l'algorithme : [recommendation-engine.md](recommendation-engine.md).

## favorites — `/api/favorites`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/artisans` | authentifié |
| POST | `/artisans/:artisanId` | authentifié |
| DELETE | `/artisans/:artisanId` | authentifié |

## dashboard — `/api/dashboard`

Statistiques agrégées pour l'administration : `/summary`, `/users`, `/artisans`, `/categories`, `/service-requests`, `/assignments`, `/reviews`, `/notifications`, `/monthly`, `/top-artisans`, `/top-categories`.

## docs — `/api/docs`

Sert la documentation interactive (Swagger UI) sur `/api/docs` et la spécification brute sur `/api/docs/openapi.json`.
