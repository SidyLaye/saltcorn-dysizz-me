# Journal des versions

## 2.2.0

- **Surveillance en profondeur** : 13 types de sondes (site, scénario d'API, port, DNS, changement DNS, certificat, domaine, contenu, liste noire, mail, Prometheus, battement de tâche cron, note de sécurité), intervalle par sonde, incidents avec durée, disponibilité 24 h / 7 j / 30 j, page de statut (publique si tu veux), alertes par notification, ntfy et Telegram.
- **Emploi** : plusieurs sources (dont 5 sans clé), réglages des clés France Travail / Adzuna / Jooble, source et logo sur chaque offre.
- **Veille et actus** : une image pour chaque article (image de la page si le flux n'en a pas, sinon vignette de couleur).
- **Vidéos** : correction de l'erreur 153 de YouTube (politique de « referrer »), lien de secours vers YouTube.
- Une modification faite par les pages Régler n'empêche plus les mises à jour des workflows.

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
