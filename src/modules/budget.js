"use strict";
const K = require("./_kit");

/* recalcul des soldes : exécuté après chaque ajout, modification ou suppression d'opération */
const SOLDES = `// Recalcule le solde de chaque compte :
// solde = solde de départ + revenus - dépenses - virements sortants + virements entrants.
const Comptes = Table.findOne({ name: "comptes" });
const Ops = Table.findOne({ name: "operations" });
const somme = async (where) => Number(((await Ops.aggregationQuery({ s: { field: "montant", aggregate: "Sum" } }, { where })) || {}).s || 0);
for (const c of await Comptes.getRows({})) {
  const solde = (c.solde_initial || 0)
    + await somme({ compte: c.id, type: "revenu" })
    - await somme({ compte: c.id, type: "dépense" })
    - await somme({ compte: c.id, type: "virement" })
    + await somme({ vers_compte: c.id, type: "virement" });
  if (Math.abs((c.solde || 0) - solde) > 0.001) await Comptes.updateRow({ solde }, c.id, undefined, true);
}`;

const trig = (when) => K.wf(`operations_soldes_${when.toLowerCase()}`, when, "operations", `Recalcule les soldes des comptes (${when === "Insert" ? "ajout" : when === "Update" ? "modification" : "suppression"} d'une opération)`, [
  K.st("soldes", "dzf_code", { code: SOLDES, sortie: "soldes" }),
]);

const TILES = JSON.stringify([
  { id: "rev", label: "Revenus du mois", icon: "fas fa-arrow-down", table: "operations", stat: "sum", field: "montant", where: { type: "revenu" }, period: { field: "date", range: "month" }, format: "eur", tone: "success" },
  { id: "dep", label: "Dépenses du mois", icon: "fas fa-arrow-up", table: "operations", stat: "sum", field: "montant", where: { type: "dépense" }, period: { field: "date", range: "month" }, format: "eur", tone: "warning" },
  { id: "bud", label: "Budget prévu", icon: "fas fa-bullseye", table: "budget_categories", stat: "sum", field: "budget_mensuel", where: { type: "dépense" }, format: "eur", hidden: false },
  { label: "Reste dans le budget", icon: "fas fa-piggy-bank", expr: "bud - dep", format: "eur", tone: "info" },
], null, 1);

module.exports = {
  key: "budget",
  label: "Budget",
  icon: "fas fa-wallet",
  group: "Vie perso",
  description: "Comptes et soldes, dépenses et revenus saisis à la main en 10 secondes, budget mensuel par catégorie avec barres qui virent au rouge quand ça dépasse.",
  depends: [],
  tables: [
    {
      name: "comptes", description: "Tes comptes (banque, espèces, épargne, mobile money)",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.opts("type", "Type", ["courant", "épargne", "espèces", "carte", "mobile money"]),
        K.opts("devise", "Devise", ["EUR", "XOF"]),
        K.num("solde_initial", "Solde de départ", { default: 0 }),
        K.num("solde", "Solde (calculé)", { default: 0, description: "Mis à jour par les déclencheurs operations_soldes_*" }),
        K.color("couleur", "Couleur"),
        K.bool("actif", "Actif", { default: true }),
      ],
    },
    {
      name: "budget_categories", description: "Catégories de dépenses et de revenus, avec budget mensuel",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.opts("type", "Type", ["dépense", "revenu"]),
        K.s("icone", "Icône", { description: "Nom d'icône Font Awesome, ex. fas fa-home" }),
        K.color("couleur", "Couleur"),
        K.num("budget_mensuel", "Budget par mois"),
      ],
    },
    {
      name: "operations", description: "Chaque dépense, revenu ou virement",
      fields: [
        K.date("date", "Date", { required: true }),
        K.s("libelle", "Libellé", { required: true }),
        K.num("montant", "Montant", { required: true, description: "Toujours positif : le type dit si c'est une dépense ou un revenu" }),
        K.opts("type", "Type", ["dépense", "revenu", "virement"]),
        K.key("categorie", "Catégorie", "budget_categories", "nom"),
        K.key("compte", "Compte", "comptes", "nom"),
        K.key("vers_compte", "Vers le compte (virement)", "comptes", "nom"),
        K.s("note", "Note"),
        K.bool("pointee", "Pointée sur le relevé"),
      ],
    },
  ],
  views: [
    K.edit("operation_modifier", "operations", [
      ["montant", "Montant"], ["type", "Type"], ["libelle", "Libellé"], ["date", "Date", "editDay"],
      ["categorie", "Catégorie", "select"], ["compte", "Compte", "select"], ["vers_compte", "Vers le compte (si virement)", "select"], ["pointee", "Pointée"], ["note", "Note", "textarea"],
    ], { delete: true, title: "Opération", width: 620 }),
    K.list("operations_liste", "operations", [
      ["Date", K.dateFr("date")],
      ["Libellé", K.field("libelle", "as_text")],
      ["Catégorie", K.join("categorie.nom", "as_text")],
      ["Compte", K.join("compte.nom", "as_text")],
      ["Montant", K.box('type === "revenu" ? "dzv-amt dzv-in" : type === "virement" ? "dzv-amt dzv-move" : "dzv-amt dzv-out"', K.O({ clsFormula: true, el: "span" }), K.field("montant", "show", { cfg: { decimal_places: 2 } }))],
    ], { order: "date", desc: true, rowClick: "`/view/operation_modifier?id=${id}`", limit: 30, description: "Dernières opérations" }),
    K.custom("budget_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 4 }, "Revenus, dépenses, budget et reste du mois"),
    K.custom("budget_mois", "DZ Répartition", "operations", {
      champ_groupe: "categorie", champ_valeur: "montant", champ_date: "date", periode: "month", champ_libelle: "nom", champ_objectif: "budget_mensuel",
      champ_couleur: "couleur", champ_icone: "icone", format: "eur", filtre: '{"type":"dépense"}', filtre_groupes: '{"type":"dépense"}', texte_vide: "Aucune dépense ce mois-ci",
    }, "Dépenses du mois par catégorie, comparées au budget"),
    K.edit("compte_modifier", "comptes", [["nom", "Nom"], ["type", "Type"], ["devise", "Devise"], ["solde_initial", "Solde de départ"], ["couleur", "Couleur"], ["actif", "Actif"]], { delete: true, title: "Compte", width: 560 }),
    K.show("compte_carte", "comptes", K.box("dzv-tile", K.O({ url: "`javascript:ajax_modal('/view/compte_modifier?id=${id}')`", urlFormula: true }),
      K.meta(K.field("type", "as_text"), K.field("devise", "as_text")),
      K.field("nom", "as_text", { cls: "dzv-tile-title" }),
      K.box("dzv-big", K.formula("(solde || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (devise === 'XOF' ? ' FCFA' : ' €')")))),
    K.feed("comptes_grille", "comptes", "compte_carte", { include: "actif == true", order: "id", desc: false, md: 2, lg: 2, xl: 2 }),
    K.edit("categorie_modifier", "budget_categories", [["nom", "Nom"], ["type", "Type"], ["budget_mensuel", "Budget par mois"], ["icone", "Icône"], ["couleur", "Couleur"]], { delete: true, title: "Catégorie", width: 560 }),
    K.list("categories_liste", "budget_categories", [
      ["Catégorie", K.field("nom", "as_text")], ["Type", K.field("type", "as_text", { cls: "dzv-pill" })], ["Budget / mois", K.field("budget_mensuel", "show", { cfg: { decimal_places: 0 } })],
    ], { order: "nom", desc: false, rowClick: "`/view/categorie_modifier?id=${id}`", limit: 60 }),
  ],
  triggers: [trig("Insert"), trig("Update"), trig("Delete")],
  seeds: {
    comptes: [
      { nom: "Compte courant", type: "courant", devise: "EUR", solde_initial: 0, solde: 0, actif: true },
      { nom: "Espèces", type: "espèces", devise: "EUR", solde_initial: 0, solde: 0, actif: true },
    ],
    budget_categories: [
      ["Logement", "fas fa-home", 0], ["Courses", "fas fa-shopping-basket", 250], ["Transport", "fas fa-subway", 90], ["Abonnements", "fas fa-sync", 40],
      ["Restaurants & sorties", "fas fa-utensils", 120], ["Santé", "fas fa-heartbeat", 30], ["Shopping", "fas fa-tshirt", 80], ["Famille & envois", "fas fa-hand-holding-heart", 0],
      ["Formation & tech", "fas fa-laptop-code", 30], ["Impôts & frais", "fas fa-landmark", 0], ["Imprévus", "fas fa-bolt", 50],
    ].map(([nom, icone, b]) => ({ nom, icone, type: "dépense", budget_mensuel: b }))
      .concat([["Salaire", "fas fa-briefcase"], ["Remboursements", "fas fa-undo"], ["Autres revenus", "fas fa-coins"]].map(([nom, icone]) => ({ nom, icone, type: "revenu" }))),
  },
  pages: [{
    name: "budget", title: "Budget", quick: { label: "Dépense", url: "/view/operation_modifier" },
    content: [
      K.view("budget_chiffres"),
      K.grid("dzv-grid-main",
        K.panel("Dernières opérations", "fas fa-receipt", K.view("operations_liste"), { cls: "dzv-ops", actions: K.modalBtn("Revenu", "/view/operation_modifier?type=revenu", "fas fa-arrow-down") + K.modalBtn("Dépense", "/view/operation_modifier?type=dépense", "fas fa-arrow-up") }),
        K.box("dzv-grid",
          K.panel("Ce mois par catégorie", "fas fa-chart-bar", K.view("budget_mois")),
          K.panel("Comptes", "fas fa-university", K.view("comptes_grille"), { actions: K.modalBtn("Compte", "/view/compte_modifier") }))),
      K.panel("Catégories et budgets", "fas fa-tags", K.view("categories_liste"), { actions: K.modalBtn("Catégorie", "/view/categorie_modifier") }),
    ],
  }],
  nav: [{ page: "budget", label: "Budget", icon: "fas fa-wallet", group: "Vie perso", order: 10, mobile: true, keywords: "argent dépenses comptes finances" }],
  quick: [{ label: "Nouvelle dépense", icon: "fas fa-arrow-up", url: "/view/operation_modifier?type=dépense", keywords: "dépense achat" }, { label: "Nouveau revenu", icon: "fas fa-arrow-down", url: "/view/operation_modifier?type=revenu", keywords: "revenu salaire" }],
  explain: [
    ["Tu ajoutes une dépense", "Formulaire « operation_modifier ». Montant toujours positif ; le type (dépense, revenu, virement) donne le sens."],
    ["Juste après", "Les workflows « operations_soldes_insert / update / delete » (bloc Code) recalculent le solde de chaque compte (champ comptes.solde)."],
    ["Le budget du mois", "La vue « budget_mois » (DZ Répartition) additionne les dépenses du mois par catégorie et les compare au champ budget_mensuel."],
    ["Les chiffres du haut", "La vue « budget_chiffres » (DZ Indicateurs) : sommes filtrées par type et par période ; « Reste » = budget prévu − dépenses."],
  ],
};
