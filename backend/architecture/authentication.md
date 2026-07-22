# Authentification

## Flux

1. **Inscription** (`POST /api/auth/register`) — le mot de passe est hashé avec bcrypt (12 rounds) avant stockage. L'inscription publique d'un compte `ADMIN` est bloquée en production sauf si `ALLOW_ADMIN_REGISTRATION=true`.
2. **Connexion** (`POST /api/auth/login`) — vérifie le mot de passe avec `bcrypt.compare`, refuse les comptes au statut `SUSPENDED`, puis émet une paire de jetons JWT.
3. **Rafraîchissement** (`POST /api/auth/refresh`) — échange un refresh token valide contre une nouvelle paire de jetons.
4. **Déconnexion** (`POST /api/auth/logout`) — route authentifiée, côté client il s'agit de supprimer les jetons stockés (l'API ne maintient pas de liste de révocation).

## Jetons

Deux jetons signés avec `JWT_SECRET` :

| Jeton | Contenu | Durée par défaut |
|---|---|---|
| Access token | `{ id, role, tokenType: 'access' }` | 15 minutes (`JWT_EXPIRES_IN`) |
| Refresh token | `{ id, role, tokenType: 'refresh' }` | 7 jours (`JWT_REFRESH_EXPIRES_IN`) |

Le champ `tokenType` empêche qu'un refresh token soit accepté comme access token (ou l'inverse) : le middleware d'authentification vérifie explicitement `tokenType === 'access'`.

## Middleware d'authentification (`src/middleware/auth.js`)

Sur chaque route protégée :

1. Extrait le token de l'en-tête `Authorization: Bearer <token>`.
2. Vérifie la signature et l'expiration avec `JWT_SECRET`.
3. Recharge l'utilisateur depuis la base (garantit que le rôle et le statut sont à jour, pas seulement ceux figés dans le jeton au moment de l'émission).
4. Rejette si l'utilisateur n'existe plus ou si son statut n'est pas `ACTIVE`.
5. Attache l'utilisateur à `req.user` pour les contrôleurs suivants.

## Autorisation par rôle

`authorizeRoles(...roles)` est un second middleware, appliqué après `auth`, qui compare `req.user.role` à la liste de rôles autorisés pour la route (ex. `authorizeRoles('ADMIN')`, `authorizeRoles('ARTISAN')`). Un rôle non listé reçoit une réponse `403`.

## Points de vigilance

- Les jetons ne sont pas interchangeables entre deux instances de backend connectées à des bases différentes (chaque jeton encode un `id` propre à sa base).
- Il n'y a pas de révocation active de jeton avant expiration : un access token compromis reste valide jusqu'à 15 minutes après le vol, ce qui borne le risque sans l'éliminer.
