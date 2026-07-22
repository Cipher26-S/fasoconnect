# Moteur de recommandation

Route : `GET /api/recommendations/artisans`. Implémentation : `app/services/recommendation.py`.

## Principe

Chaque artisan candidat reçoit un score calculé sur 8 critères pondérés. Les artisans sont triés par score décroissant, puis par note moyenne décroissante en cas d'égalité. Le score maximal théorique est de **115 points**.

## Contexte de la recommandation

La requête peut fournir directement `category_id`, `city`, `latitude`/`longitude`, `budget`, ou référencer une demande de service existante via `service_request_id` — auquel cas le contexte (catégorie, localisation, budget, artisan déjà assigné à exclure) est déduit automatiquement de cette demande.

## Grille de score

| Critère | Poids max | Règle de calcul |
|---|---|---|
| Catégorie | 40 | Acquis dès lors que l'artisan correspond au filtre de catégorie (filtrage appliqué en amont, au niveau de la requête base de données) |
| Disponibilité | 15 | 15 si `availability = True`, sinon 0 |
| Vérification | 10 | 10 si le profil est vérifié par un administrateur, sinon 0 |
| Localisation | 15 | Si coordonnées GPS disponibles : `15 × (1 − distance / distance_max)`, `distance_max` par défaut 50 km (paramètre `max_distance_km`) ; si pas de coordonnées mais même ville : 10 ; sinon 0 |
| Note moyenne | 15 | `(note_moyenne / 5) × 15`, calculée sur tous les avis reçus via les demandes de service de l'artisan |
| Popularité | 10 | `min(nombre_demandes_complétées × 2, 10)` |
| Expérience | 5 | `min(années_expérience, 10) × 0.5` |
| Adéquation budget | 5 | 5 si le taux horaire de l'artisan est inférieur ou égal au budget de la demande, sinon 0 |

La distance entre deux points géographiques est calculée avec la formule de Haversine.

## Filtres additionnels

- `availability_only` — n'inclut que les artisans disponibles.
- `verified_only` — n'inclut que les artisans vérifiés.
- `max_distance_km` — exclut les artisans au-delà de cette distance (si des coordonnées sont fournies).
- L'artisan déjà assigné à la demande de référence (le cas échéant) est systématiquement exclu.
- `limit` — nombre maximum de résultats retournés, après tri.

## Réponse

Chaque artisan recommandé inclut le détail du score (`recommendation.score_breakdown`) en plus du score total, ce qui rend le classement explicable plutôt qu'une simple boîte noire — utile aussi bien côté administration que pour justifier un choix côté client.
