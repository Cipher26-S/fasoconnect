# Authentification

## Flux

1. **Inscription** (`POST /api/auth/register`) — le mot de passe est hashé avec `passlib.context.CryptContext(schemes=["bcrypt"])` avant stockage. L'inscription publique d'un compte `ADMIN` est bloquée en production sauf configuration explicite.
2. **Connexion** (`POST /api/auth/login`) — vérifie le mot de passe avec `pwd_context.verify(...)`, refuse les comptes au statut `SUSPENDED`, puis émet une paire de jetons JWT.
3. **Rafraîchissement** (`POST /api/auth/refresh`) — échange un refresh token valide contre une nouvelle paire de jetons.
4. **Déconnexion** (`POST /api/auth/logout`) — route authentifiée ; côté client, il s'agit de supprimer les jetons stockés (l'API ne maintient pas de liste de révocation).

## Jetons

Deux jetons signés avec `python-jose` :

| Jeton | Contenu | Durée par défaut |
|---|---|---|
| Access token | `{ "sub": id, "role": role, "token_type": "access" }` | 15 minutes |
| Refresh token | `{ "sub": id, "role": role, "token_type": "refresh" }` | 7 jours |

Le champ `token_type` empêche qu'un refresh token soit accepté comme access token (ou l'inverse).

## Dépendance d'authentification

Exprimée comme une dépendance FastAPI, injectée dans chaque route protégée :

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(token)          # vérifie signature + expiration
    if payload["token_type"] != "access":
        raise AppError("Invalid authentication token", 401)

    user = await db.get(User, payload["sub"])   # utilisateur rechargé depuis la base
    if user is None:
        raise AppError("User no longer exists", 401)
    if user.status != UserStatus.ACTIVE:
        raise AppError("This account is suspended", 403)

    return user
```

Chaque route protégée déclare `current_user: User = Depends(get_current_user)` — FastAPI gère l'injection, la validation et la documentation OpenAPI du schéma de sécurité automatiquement.

## Autorisation par rôle

Une fabrique de dépendance paramétrée par les rôles autorisés :

```python
def require_role(*roles: UserRole):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise AppError("You do not have permission to perform this action", 403)
        return current_user
    return dependency
```

Utilisée en déclaration de route : `Depends(require_role(UserRole.ADMIN))`.

## Points de vigilance

- L'utilisateur est rechargé depuis la base à chaque requête authentifiée (pas seulement décodé depuis le jeton) : un changement de rôle ou une suspension de compte prend effet immédiatement, sans attendre l'expiration du jeton.
- Il n'y a pas de révocation active de jeton avant expiration : un access token compromis reste valide jusqu'à 15 minutes après le vol, ce qui borne le risque sans l'éliminer.
