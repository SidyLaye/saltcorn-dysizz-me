# Journal des versions

## 2.1.0

- **Pages « Régler »** (`/dysizz-me/reglages/<module>`) : Mails pro (adresse, offre OVH, mot de passe rangé chiffré, bouton Tester) et Emploi (clés France Travail). Plus besoin de toucher aux variables du serveur ni aux workflows ; les réglages sont réappliqués après chaque mise à jour.
- Démarrage en 3 étapes sur `/dysizz-me` (installer, régler, utiliser) et bandeau « à régler » en haut des pages concernées.
- Lecteur de mail refait : expéditeur, date, actions, et le vrai rendu du mail (HTML isolé, images distantes à la demande).
- Tuiles de Me sur l'accueil Dysizz (`/dysizz`), avec mails non lus, tâches du jour, pannes.

## 2.0.0

- La solution s'appelle maintenant **Me** (module `dysizz-me`, page `/dysizz-me`). L'installation existante (modules, réglages) est reprise toute seule.
- Nouveau module **Surveillance** (groupe Système) : sites vérifiés toutes les 5 minutes, statut en tuiles (DZ Statut), temps de réponse en graphique (DZ Graphique), incidents (DZ Journal), certificats TLS vérifiés chaque jour, une seule alerte par incident, ménage automatique.
- Avant d'installer un module, on vérifie que toutes ses vues et tous ses blocs existent, avec un message clair (« mets à jour dysizz-ui… »).
- Demande dysizz-ui 3.3 et dysizz-flow 2.0.

## 1.0.0

- Solution « Me » en 12 modules : Accueil, Tâches, Objectifs & habitudes, Maison, Budget, Santé, Documents, Mails pro, Emploi, Veille tech, Vidéos, Actus France & Sénégal.
- Uniquement des définitions : l'affichage vient de dysizz-ui (blocs UI, vues de données, coquille d'application), les 14 automatismes sont des workflows faits de blocs dysizz-flow.
- Installation en un clic par module. Une mise à jour garde les vues, pages et workflows que tu as modifiés, ainsi que tes réglages. Le retrait garde les données.
