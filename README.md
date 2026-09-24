# dysizz-vie

La solution « Ma vie » pour Saltcorn, découpée en modules. Chaque module s'installe en un clic et crée de vraies tables, vues, pages et workflows Saltcorn. Tu peux tout lire et tout modifier dans Saltcorn.

Elle ne contient **que des définitions**. Elle s'appuie sur deux autres modules, à installer avant elle :

| Module | Rôle |
|---|---|
| [dysizz-ui](https://github.com/SidyLaye/saltcorn-dysizz-ui) (3.2 ou plus) | le design, les blocs UI et les vues de données (DZ Indicateurs, DZ Tableau, DZ Répartition, DZ À venir) |
| [dysizz-flow](https://github.com/SidyLaye/saltcorn-dysizz-flow) | les blocs workflow : tous les automatismes de la solution sont des workflows faits de ces blocs |

## Les modules

| Groupe | Module | En bref |
|---|---|---|
| Aujourd'hui | **Accueil** | Chiffres du jour, les 7 prochains jours, tâches, habitudes, mails, vidéos, actus |
| Organisation | **Tâches** | Tableau à glisser-déposer, projets, tâches qui se répètent, rappel du matin |
| | **Objectifs & habitudes** | Objectifs chiffrés avec progression, habitudes à cocher chaque jour |
| | **Maison** | Tâches de la maison, routines, liste de courses |
| Vie perso | **Budget** | Comptes et soldes, dépenses et revenus, budget mensuel par catégorie |
| | **Santé** | Rendez-vous (rappel la veille), traitements, mesures, soignants |
| | **Documents** | Coffre de papiers, dates d'expiration, rappel et tâche « Renouveler » |
| Travail | **Mails pro** | Boîte IMAP (OVH…) relevée toutes les 5 min, règles, mail → tâche |
| | **Emploi** | Offres France Travail selon tes recherches, suivi des candidatures |
| Veille | **Veille tech** | Dev, cyber (CERT-FR), IA, DevOps, MLOps, cloud, réseau, systèmes (RSS) |
| | **Vidéos** | Chaînes YouTube, lecture directement dans l'appli |
| | **Actus France & Sénégal** | Les titres du jour des deux pays côte à côte |

Le détail de chaque module (tables, champs, vues, déclencheurs et leur code) est dans [docs/MODULES.md](docs/MODULES.md). Tu le retrouves aussi dans Saltcorn, sur `/dysizz-vie`, bouton « Ce qu'il y a derrière ».

## Installer

1. Installe **dysizz-ui**, puis **dysizz-flow**.
2. Saltcorn → Paramètres → Modules → Ajouter : dépôt GitHub `SidyLaye/saltcorn-dysizz-vie`.
3. Ouvre `/dysizz-vie`, puis clique sur « Tout installer » ou installe les modules un par un. Ta page d'accueil devient `/page/accueil`.
4. Pour les modules qui parlent à l'extérieur (mails, emploi), suis l'encadré « À régler » de leur page « Ce qu'il y a derrière ».

### Secrets

Les mots de passe ne vont jamais dans la base. Tu les mets dans les variables d'environnement du service Saltcorn (Dokploy → Environment) :

| Variable | Pour |
|---|---|
| `DZ_MAIL_PASSWORD` | la boîte mail (module Mails pro) |
| `FT_CLIENT_ID`, `FT_CLIENT_SECRET` | l'API France Travail (module Emploi), gratuite sur francetravail.io |

## Ce qui se passe à l'installation

- Une table manquante est créée. Une table qui existe déjà n'est jamais vidée : tes données restent.
- Les données d'exemple ne sont ajoutées qu'une fois, dans une table vide.
- Si tu modifies une vue, une page ou un déclencheur d'un module, une mise à jour ne l'écrase pas. La page du module l'indique (« modifié »). « Réinitialiser » remet la version du module.
- Le menu de toutes les pages suit la liste des modules installés.
- « Retirer » enlève les pages, vues et déclencheurs, mais garde les tables. La suppression des données demande de taper le nom du module.

## Les automatismes

Chaque automatisme est un **workflow Saltcorn** fait de blocs dysizz-flow. Tu l'ouvres dans l'éditeur de workflows (Paramètres → Déclencheurs), tu vois chaque étape et tu peux la modifier, sans code ou en code. Quelques exemples :

- **veille_releve** : Verrou → Table : chercher → Lire des flux → Enlever les doublons → Transformer → Ajouter ou mettre à jour → ménage.
- **mails_releve** : Définir (tes réglages) → Verrou → dernier UID → Mail : lire → Transformer → Ajouter ou mettre à jour.
- **taches_cycle** : Dates → Table : modifier → Code (prochaine échéance) → Table : ajouter.

Une mise à jour du module ne remplace pas un workflow que tu as modifié. Tes réglages (adresse mail…) sont gardés.

## Développer

```bash
cd tools && npm ci && node build.mjs   # construit index.js + docs/MODULES.md
cd .. && NODE_PATH=tools/node_modules node tests/run.cjs
```

- `src/modules/<module>.js` : la définition d'un module. Voir [docs/CREER-UN-MODULE.md](docs/CREER-UN-MODULE.md).
- `src/installer.js` : l'installation, la mise à jour et le retrait (tables, vues, pages, workflows).
- `src/lib/shell.js` : la coquille commune (menu, barre mobile, palette Ctrl K), faite de classes dysizz-ui.
- `tests/flow-blocks.json` : la liste des blocs dysizz-flow et de leurs réglages, pour vérifier les workflows (à recopier quand dysizz-flow change).
- `index.js` est **généré** : ne le modifie pas à la main. La CI vérifie qu'il est à jour.

Licence MIT.
