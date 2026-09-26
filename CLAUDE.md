# dysizz-me — solution « Me » pour Saltcorn

À lire d'abord (communs aux trois dépôts) : `saltcorn-dysizz-ui/docs/VISION.md`,
`docs/DECISIONS.md` et `docs/AUDIT.md` du dépôt `saltcorn-dysizz-ui`.

## Stack
- Plugin Saltcorn **1.6.2**, Node ≥ 18. 13 modules (`src/modules/`) qui créent tables,
  vues, pages et workflows **uniquement** avec les vues de `dysizz-ui` et les blocs de `dysizz-flow`.
- Installation : `src/installer.js` (vérifie la présence des vues et blocs requis).
- Créer un module : `docs/CREER-UN-MODULE.md`. Détail de chaque module : `docs/MODULES.md` (GÉNÉRÉ).

## Commandes
- Build : `cd tools && npm ci && node build.mjs` (régénère `index.js` et `docs/MODULES.md`).
- Tests : `NODE_PATH=tools/node_modules node tests/run.cjs`.
- Après un nouveau bloc dans flow : mettre à jour `tests/flow-blocks.json`.

## Règles
- `index.js` et `docs/MODULES.md` sont GÉNÉRÉS : reconstruire puis commiter les deux (AUDIT F4).
- Nouvelle version : `package.json` + `CHANGELOG.md`.
- **Dépôt public** : aucun secret, IP, domaine interne ni donnée personnelle.
- Un module ne dépend jamais d'un code propre à me : s'il manque une brique, elle va dans ui ou flow.
- Instance réelle : analyse, puis simulation sans écriture, puis écriture.

## Pièges
- Rôles inversés : 1 admin … 100 public. Tout ce que me crée est en `min_role` 1 (admin) : garder ainsi.
- Deux workflows tournent en `Often` (~288 fois par jour) : `mails_releve`, `surveillance_verifier`.
- Tables qui grossissent vite : `veille_articles` (ménage des articles lus de plus de 60 jours,
  `src/modules/veille.js:91`), `surveillance_mesures` (workflow hebdomadaire `surveillance_menage`), `dzf_metriques`.
