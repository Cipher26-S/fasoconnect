# Modèle de données

Source de vérité : [`prisma/schema.prisma`](../prisma/schema.prisma). 9 entités, 4 énumérations.

## Énumérations

| Énumération | Valeurs |
|---|---|
| `UserRole` | `ADMIN`, `CUSTOMER`, `ARTISAN` |
| `UserStatus` | `ACTIVE`, `SUSPENDED` |
| `RequestStatus` | `PENDING`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `AssignmentStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED` |

## Entités

### User
Compte unique pour les trois rôles (client, artisan, administrateur). Un `User` avec le rôle `ARTISAN` possède un profil `Artisan` associé (relation 1-1).

| Champ | Type | Remarque |
|---|---|---|
| `email` | `String` | unique |
| `password` | `String` | hash bcrypt, jamais renvoyé par l'API |
| `role` | `UserRole` | défaut `CUSTOMER` |
| `status` | `UserStatus` | défaut `ACTIVE` ; `SUSPENDED` bloque la connexion |

### Category
Catégorie de métier (ex. plomberie, électricité). Référencée par `Artisan` et `ServiceRequest`.

### Artisan
Profil professionnel lié à un `User` (`onDelete: Cascade` — supprimer l'utilisateur supprime son profil artisan). Contient la localisation (`latitude`/`longitude`), le taux horaire, la disponibilité et le statut de vérification par un administrateur.

### ServiceRequest
Demande de service émise par un client. Référence son client (cascade), éventuellement un artisan assigné (`SetNull` si l'artisan est supprimé) et une catégorie (`Restrict` — une catégorie utilisée ne peut pas être supprimée).

### ServiceRequestImage
Photos jointes à une demande de service (cascade avec la demande).

### Assignment
Attribution d'une demande à un artisan, avec un statut de cycle de vie propre (`AssignmentStatus`) distinct du statut de la demande elle-même.

### Review
Avis laissé après une demande complétée. Un couple (`serviceRequestId`, `reviewerId`) est unique : un client ne peut noter la même demande qu'une fois.

### Notification
Notification applicative liée à un utilisateur (cascade).

### FavoriteArtisan
Association client ↔ artisan favori. Couple (`userId`, `artisanId`) unique.

## Relations et règles de suppression

| Relation | Comportement à la suppression |
|---|---|
| `Artisan.user → User` | `Cascade` |
| `Artisan.category → Category` | `Restrict` |
| `ServiceRequest.customer → User` | `Cascade` |
| `ServiceRequest.artisan → Artisan` | `SetNull` |
| `ServiceRequest.category → Category` | `Restrict` |
| `ServiceRequestImage.serviceRequest → ServiceRequest` | `Cascade` |
| `Assignment.serviceRequest → ServiceRequest` | `Cascade` |
| `Assignment.artisan → Artisan` | `Cascade` |
| `Assignment.assignedByUser → User` | `Cascade` |
| `Review.serviceRequest → ServiceRequest` | `Cascade` |
| `Review.reviewer / reviewee → User` | `Cascade` |
| `Notification.user → User` | `Cascade` |
| `FavoriteArtisan.user → User` | `Cascade` |
| `FavoriteArtisan.artisan → Artisan` | `Cascade` |

Conséquence pratique : supprimer un `User` supprime en cascade son profil artisan (le cas échéant), ses demandes de service, ses attributions, ses avis donnés/reçus, ses notifications et ses favoris — sans nécessiter de nettoyage manuel côté application.
