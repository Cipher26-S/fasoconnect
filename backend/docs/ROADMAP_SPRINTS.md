# Feuille de route technique FasoConnect

## Sprint 1 — Authentification complète
Objectifs :
- Finaliser l'authentification avec logout et refresh token si besoin.
- Vérifier les tests d'authentification.
- Valider les cas d'erreur et les statuts HTTP.

Livrables :
- Endpoints d'authentification stables.
- Tests couvrant login/register/profile/password change.

## Sprint 2 — CRUD Categories
Objectifs :
- CRUD complet des catégories.
- Validation stricte sur le nom et la description.
- Gestion des erreurs liées aux doublons.

## Sprint 3 — CRUD Artisans
Objectifs :
- CRUD des profils artisans.
- Vérification des relations avec User et Category.
- Validation des champs métier.

## Sprint 4 — CRUD Service Requests
Objectifs :
- Création, consultation, mise à jour et suppression des demandes.
- Contrôle d'accès selon le rôle.
- Validation des dates et budgets.

## Sprint 5 — Assignment
Objectifs :
- Assignation d'un artisan à une demande.
- Gestion des statuts d'assignation.
- Notifications associées.

## Sprint 6 — Reviews
Objectifs :
- Création de reviews après service.
- Contrôle de l'unicité par demande et reviewer.
- Calcul de la note moyenne artisan.

## Sprint 7 — Notifications
Objectifs :
- Système de notifications utilisateur.
- Lecture / marquage comme lu.
- Intégration aux événements métier.

## Sprint 8 — Recommendation Engine
Objectifs :
- Recommandation d'artisans par catégorie, localisation et popularité.
- Base de logique de scoring simple et extensible.

## Sprint 9 — Swagger / OpenAPI
Objectifs :
- Documenter l'API avec Swagger.
- Exposer les schémas de réponse et d'erreur.

## Sprint 10 — Dashboard React
Objectifs :
- Interface web de gestion et consultation.
- Intégration avec l'API backend.

## Sprint 11 — Application Flutter
Objectifs :
- Application mobile pour clients et artisans.
- Authentification mobile et consultation des demandes.

## Sprint 12 — Déploiement
Objectifs :
- Déploiement backend et base de données en environnement de production.
- CI/CD, variables d'environnement, sécurité et monitoring.
