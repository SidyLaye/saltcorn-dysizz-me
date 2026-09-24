# Journal des versions

## 2.0.0

- La solution s'appelle maintenant **Me** (module `dysizz-me`, page `/dysizz-me`). L'installation existante (modules, réglages) est reprise toute seule.
- Nouveau module **Surveillance** (groupe Système) : sites vérifiés toutes les 5 minutes, statut en tuiles (DZ Statut), temps de réponse en graphique (DZ Graphique), incidents (DZ Journal), certificats TLS vérifiés chaque jour, une seule alerte par incident, ménage automatique.
- Avant d'installer un module, on vérifie que toutes ses vues et tous ses blocs existent, avec un message clair (« mets à jour dysizz-ui… »).
- Demande dysizz-ui 3.3 et dysizz-flow 2.0.

## 1.0.0

- Solution « Me » en 12 modules : Accueil, Tâches, Objectifs & habitudes, Maison, Budget, Santé, Documents, Mails pro, Emploi, Veille tech, Vidéos, Actus France & Sénégal.
- Uniquement des définitions : l'affichage vient de dysizz-ui (blocs UI, vues de données, coquille d'application), les 14 automatismes sont des workflows faits de blocs dysizz-flow.
- Installation en un clic par module. Une mise à jour garde les vues, pages et workflows que tu as modifiés, ainsi que tes réglages. Le retrait garde les données.
