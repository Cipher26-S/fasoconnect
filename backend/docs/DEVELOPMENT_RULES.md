# Règles de développement FasoConnect

1. Aucun fichier ne doit être modifié sans explication claire du pourquoi.
2. Aucune logique métier ne doit rester dans les contrôleurs.
3. La logique métier doit être centralisée dans des services dédiés.
4. Les validations doivent être séparées dans des validateurs Zod.
5. Les erreurs doivent être traitées de façon uniforme via AppError.
6. Les réponses JSON doivent suivre un format cohérent.
7. Les statuts HTTP doivent respecter les cas métier.
8. Les endpoints doivent être testés avant d'être considérés comme livrés.
9. Le code doit rester lisible, maintenable et conforme aux principes SOLID.
10. Les dépendances doivent rester minimales et explicites.
