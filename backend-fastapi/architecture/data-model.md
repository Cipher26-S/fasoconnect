# Modèle de données

Modèles définis avec SQLAlchemy 2.0, gérés par des migrations Alembic. 9 entités, 4 énumérations.

## Énumérations

Déclarées comme `enum.Enum` Python, mappées en type `ENUM` PostgreSQL par SQLAlchemy :

| Énumération | Valeurs |
|---|---|
| `UserRole` | `ADMIN`, `CUSTOMER`, `ARTISAN` |
| `UserStatus` | `ACTIVE`, `SUSPENDED` |
| `RequestStatus` | `PENDING`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `AssignmentStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED` |

## Entités

### User
Compte unique pour les trois rôles (client, artisan, administrateur). Un `User` avec le rôle `ARTISAN` possède un profil `Artisan` associé (relation 1-1). Le mot de passe est stocké sous forme de hash bcrypt (passlib), jamais sérialisé dans les schémas Pydantic de sortie. `email` est unique ; `status = SUSPENDED` bloque la connexion.

### Category
Catégorie de métier (ex. plomberie, électricité). Référencée par `Artisan` et `ServiceRequest`.

### Artisan
Profil professionnel lié à un `User` (relation 1-1 via `user_id` unique). Contient la localisation (`latitude`/`longitude`), le taux horaire (`Numeric(10, 2)`), la disponibilité et le statut de vérification par un administrateur.

### ServiceRequest
Demande de service émise par un client. Référence son client, éventuellement un artisan assigné, et une catégorie.

### ServiceRequestImage
Photos jointes à une demande de service.

### Assignment
Attribution d'une demande à un artisan, avec un statut de cycle de vie propre (`AssignmentStatus`) distinct du statut de la demande elle-même.

### Review
Avis laissé après une demande complétée. Contrainte unique composite sur `(service_request_id, reviewer_id)` : un client ne peut noter la même demande qu'une fois.

### Notification
Notification applicative liée à un utilisateur.

### FavoriteArtisan
Association client ↔ artisan favori. Contrainte unique composite sur `(user_id, artisan_id)`.

## Relations et règles de suppression

Les cascades sont définies via le paramètre `ondelete` des `ForeignKey` SQLAlchemy (et `cascade="all, delete-orphan"` côté relation ORM) :

| Relation | Comportement à la suppression |
|---|---|
| `Artisan.user → User` | `CASCADE` |
| `Artisan.category → Category` | `RESTRICT` |
| `ServiceRequest.customer → User` | `CASCADE` |
| `ServiceRequest.artisan → Artisan` | `SET NULL` |
| `ServiceRequest.category → Category` | `RESTRICT` |
| `ServiceRequestImage.serviceRequest → ServiceRequest` | `CASCADE` |
| `Assignment.serviceRequest → ServiceRequest` | `CASCADE` |
| `Assignment.artisan → Artisan` | `CASCADE` |
| `Assignment.assignedByUser → User` | `CASCADE` |
| `Review.serviceRequest → ServiceRequest` | `CASCADE` |
| `Review.reviewer / reviewee → User` | `CASCADE` (deux clés étrangères vers `User`) |
| `Notification.user → User` | `CASCADE` |
| `FavoriteArtisan.user → User` | `CASCADE` |
| `FavoriteArtisan.artisan → Artisan` | `CASCADE` |

Conséquence pratique : supprimer un `User` supprime en cascade son profil artisan (le cas échéant), ses demandes de service, ses attributions, ses avis donnés/reçus, ses notifications et ses favoris — sans nécessiter de nettoyage manuel côté application.

## Migrations

Le schéma est versionné avec Alembic. Une première révision (`alembic revision --autogenerate -m "init"`) crée l'ensemble des tables ; les évolutions ultérieures du schéma sont ajoutées comme des révisions successives, appliquées avec `alembic upgrade head`.
