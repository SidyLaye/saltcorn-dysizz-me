# Créer un module

Un module est un fichier `src/modules/<nom>.js` qui décrit des objets Saltcorn. L'installateur les crée, et on peut relancer l'installation autant de fois qu'on veut.

## Squelette

```js
"use strict";
const K = require("./_kit");

module.exports = {
  key: "lectures",                       // identifiant unique, sans espace
  label: "Lectures",
  icon: "fas fa-book",
  group: "Vie perso",                    // Aujourd'hui, Organisation, Vie perso, Travail, Veille
  description: "Livres à lire, en cours, lus, avec notes.",
  depends: [],                           // ex. ["taches"] si tu utilises ses tables ou ses vues

  tables: [{
    name: "livres", description: "Mes livres",
    fields: [
      K.s("titre", "Titre", { required: true }),
      K.s("auteur", "Auteur"),
      K.opts("statut", "Statut", ["à lire", "en cours", "lu"]),   // le premier choix est la valeur par défaut
      K.int("note", "Note sur 5"),
      K.date("fini_le", "Fini le"),
    ],
  }],

  views: [
    K.edit("livre_modifier", "livres", [["titre", "Titre"], ["auteur", "Auteur"], ["statut", "Statut"], ["note", "Note"]], { delete: true, title: "Livre", width: 560 }),
    K.custom("livres_tableau", "DZ Tableau", "livres", { champ_colonnes: "statut", champ_titre: "titre", champs_infos: "auteur", vue_fiche: "livre_modifier", vue_creation: "livre_modifier" }, "Mes livres par statut"),
  ],

  triggers: [          // des workflows faits de blocs dysizz-flow
    K.wf("lectures_rappel", "Weekly", null, "Rappel des livres en cours", [
      K.st("compter", "dzf_table_compter", { table: "livres", filtre: K.J({ statut: "en cours" }), sortie: "total" }),
      K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "{{total}} livre(s) en cours", lien: "/page/lectures" }, { only_if: "total > 0" }),
    ]),
  ],
  seeds: { livres: [{ titre: "Designing Data-Intensive Applications", auteur: "M. Kleppmann", statut: "à lire" }] },

  pages: [{
    name: "lectures", title: "Lectures", quick: { label: "Livre", url: "/view/livre_modifier" },
    content: [K.view("livres_tableau")],
  }],
  nav: [{ page: "lectures", label: "Lectures", icon: "fas fa-book", group: "Vie perso", order: 40 }],
  quick: [{ label: "Nouveau livre", icon: "fas fa-book", url: "/view/livre_modifier" }],
  explain: [["Tu ajoutes un livre", "Formulaire « livre_modifier ». Glisse la carte pour changer son statut."]],
};
```

Puis ajoute `require("./lectures")` dans `src/modules/index.js`, lance `node tools/build.mjs` puis les tests.

## Les raccourcis de `_kit.js`

| Raccourci | Donne |
|---|---|
| `K.s`, `K.int`, `K.num`, `K.bool`, `K.date`, `K.file`, `K.color` | un champ du type correspondant |
| `K.opts(nom, libellé, [choix])` | un champ texte à choix (liste déroulante) |
| `K.key(nom, libellé, table, champ_affiché)` | une clé vers une autre table |
| `K.edit(nom, table, [[champ, libellé, fieldview?]], options)` | un formulaire (vue Edit) qui revient à la page d'avant |
| `K.show(nom, table, layout)` | une fiche (vue Show) |
| `K.list(nom, table, [[entête, segment]], options)` | une liste (vue List) ; `include` = filtre, `rowClick` = ouvrir en fenêtre |
| `K.feed(nom, table, vue_fiche, options)` | une grille de fiches (vue Feed) |
| `K.custom(nom, modèle, table, config, description)` | une vue d'un autre modèle (DZ Tableau, DZ Indicateurs…) |
| `K.field`, `K.join("projet.nom")`, `K.formula(expr)`, `K.dateFr(champ)` | les segments d'un layout |
| `K.jsBtn(libellé, code)` | un bouton qui lance du JavaScript côté serveur (action run_js_code) |
| `K.modalLink(vue, libellé)` | un lien qui ouvre une vue en fenêtre pour la ligne |
| `K.panel(titre, icône, contenu, { actions })`, `K.grid("dzv-grid-2", …)`, `K.chips([...])` | la mise en page des pages |

## Règles

- Les noms de tables, vues, pages et déclencheurs doivent être uniques dans tout le kit. Le test `tests/modules.test.cjs` le vérifie, ainsi que les champs utilisés par les vues.
- Une page n'intègre que des vues de son module ou de ses dépendances (`depends`).
- Automatismes : des workflows de blocs dysizz-flow (`K.wf` + `K.st`). Un bloc « Code » seulement quand aucun bloc ne convient. Mets `sans_declencheurs: true` quand tu modifies la ligne qui a lancé le workflow, sinon il se relance lui-même.
- Il manque un bloc ? Ajoute-le dans dysizz-flow, pas dans la solution.
- Tables en `min_role` 1 (admin) par défaut : rien n'est public.
- Pour les secrets, utilise des variables d'environnement, jamais un champ de la base.
