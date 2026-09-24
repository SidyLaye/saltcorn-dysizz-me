"use strict";
const K = require("./_kit");
const { DOMAINES } = require("./taches");

/* coche / décoche l'habitude pour aujourd'hui, puis recompte la semaine */
const HABIT_TOGGLE = `// Bouton « Fait aujourd'hui » d'une habitude.
const Suivi = Table.findOne({ name: "habitudes_suivi" });
const jour = new Date(); jour.setHours(0, 0, 0, 0);
const deja = await Suivi.getRow({ habitude: row.id, jour });
if (deja) await Suivi.deleteRows({ id: deja.id });
else await Suivi.insertRow({ habitude: row.id, jour, fait: true });
// lundi de cette semaine
const lundi = new Date(jour); lundi.setDate(jour.getDate() - ((jour.getDay() + 6) % 7));
const n = await Suivi.countRows({ habitude: row.id, jour: { gt: lundi, equal: true } });
await table.updateRow({ semaine: n, fait_aujourdhui: !deja }, row.id, user, true);
return { reload_page: true };`;

const PROGRESS = `(() => { const p = cible ? Math.max(0, Math.min(100, Math.round((actuel || 0) / cible * 100))) : 0; return '<div class="dzv-prog"><span style="width:' + p + '%"></span></div><div class="dzv-prog-row"><span>' + (actuel || 0) + ' / ' + (cible || 0) + ' ' + String(unite || '').replace(/[<>&"]/g, '') + '</span><b>' + p + ' %</b></div>'; })()`;

module.exports = {
  key: "objectifs",
  label: "Objectifs & habitudes",
  icon: "fas fa-bullseye",
  group: "Organisation",
  description: "Objectifs chiffrés par horizon (semaine → long terme) avec progression, et habitudes à cocher chaque jour avec compteur de la semaine.",
  depends: [],
  tables: [
    {
      name: "objectifs", description: "Ce que tu veux atteindre",
      fields: [
        K.s("titre", "Objectif", { required: true }),
        K.opts("domaine", "Domaine", DOMAINES),
        K.opts("horizon", "Horizon", ["ce mois", "cette semaine", "ce trimestre", "cette année", "long terme"]),
        K.num("cible", "Cible (nombre)"),
        K.num("actuel", "Où j'en suis", { default: 0 }),
        K.s("unite", "Unité", { description: "€, km, livres, heures…" }),
        K.date("echeance", "Échéance"),
        K.opts("statut", "Statut", ["en cours", "atteint", "abandonné"]),
        K.s("pourquoi", "Pourquoi c'est important"),
      ],
    },
    {
      name: "habitudes", description: "Ce que tu veux faire régulièrement",
      fields: [
        K.s("nom", "Habitude", { required: true }),
        K.s("icone", "Icône", { default: "fas fa-check", description: "Nom d'icône Font Awesome, ex. fas fa-running" }),
        K.int("par_semaine", "Fois par semaine", { default: 7 }),
        K.bool("active", "Active", { default: true }),
        K.key("objectif", "Objectif lié", "objectifs", "titre"),
        K.int("semaine", "Faites cette semaine", { default: 0 }),
        K.bool("fait_aujourdhui", "Fait aujourd'hui"),
      ],
    },
    {
      name: "habitudes_suivi", description: "Une ligne par habitude cochée et par jour",
      fields: [K.key("habitude", "Habitude", "habitudes", "nom", { required: true }), K.date("jour", "Jour", { required: true }), K.bool("fait", "Fait", { default: true })],
    },
  ],
  views: [
    K.edit("objectif_modifier", "objectifs", [
      ["titre", "Objectif"], ["domaine", "Domaine"], ["horizon", "Horizon"], ["statut", "Statut"],
      ["actuel", "Où j'en suis"], ["cible", "Cible"], ["unite", "Unité"], ["echeance", "Échéance", "editDay"], ["pourquoi", "Pourquoi c'est important", "textarea"],
    ], { delete: true, title: "Objectif", width: 620 }),
    K.show("objectif_carte", "objectifs", K.box("dzv-tile", K.O({ url: "`javascript:ajax_modal('/view/objectif_modifier?id=${id}')`", urlFormula: true }),
      K.meta(K.field("horizon", "as_text"), K.field("domaine", "as_text"), K.dateFr("echeance")),
      K.field("titre", "as_text", { cls: "dzv-tile-title" }),
      K.formula(PROGRESS, { html: true }))),
    K.feed("objectifs_grille", "objectifs", "objectif_carte", { include: 'statut == "en cours"', order: "echeance", desc: false, lg: 3 }),
    K.edit("habitude_modifier", "habitudes", [["nom", "Habitude"], ["icone", "Icône"], ["par_semaine", "Fois par semaine"], ["objectif", "Objectif lié", "select"], ["active", "Active"]], { delete: true, title: "Habitude", width: 560 }),
    K.show("habitude_ligne", "habitudes", K.box("`dzv-habit${fait_aujourdhui ? ' dzv-habit-done' : ''}`", K.O({ clsFormula: true }),
      K.formula("`<span class=\"dzv-habit-ic\"><i class=\"${(icone || 'fas fa-check').replace(/[^a-z0-9 -]/g, '')}\"></i></span>`", { html: true, block: false }),
      K.box("dzv-habit-t", K.field("nom", "as_text"), K.formula("`${semaine || 0} / ${par_semaine || 7} cette semaine`", { style: "", cls: "dzv-muted" })),
      K.jsBtn("Fait", HABIT_TOGGLE, { style: "btn-outline-success", icon: "fas fa-check" }),
      K.modalLink("habitude_modifier", ""))),
    K.feed("habitudes_jour", "habitudes", "habitude_ligne", { include: "active == true", order: "id", desc: false, md: 1, lg: 1 }),
  ],
  triggers: [
    K.wf("habitudes_minuit", "Daily", null, "Remise à zéro quotidienne (et hebdomadaire le lundi)", [
      K.st("remise", "dzf_table_modifier", { table: "habitudes", filtre: K.J({ fait_aujourdhui: true }), valeurs: K.J({ fait_aujourdhui: false }), sans_declencheurs: true, sortie: "remis" }),
      K.st("lundi", "dzf_verifier", { condition: "new Date().getDay() === 1", si_faux: "renvoyer faux", sortie: "lundi" }),
      K.st("semaine", "dzf_table_modifier", { table: "habitudes", filtre: K.J({ semaine: { gt: 0 } }), valeurs: K.J({ semaine: 0 }), sans_declencheurs: true, sortie: "semaine_remise" }, { only_if: "lundi" }),
    ]),
  ],
  seeds: {
    objectifs: [
      { titre: "Valider le mémoire RNCP", domaine: "Apprentissage", horizon: "cette année", cible: 100, actuel: 40, unite: "%", statut: "en cours" },
      { titre: "Mettre de côté chaque mois", domaine: "Finances", horizon: "ce mois", cible: 300, actuel: 0, unite: "€", statut: "en cours" },
    ],
    habitudes: [
      { nom: "Sport ou marche 30 min", icone: "fas fa-running", par_semaine: 4, active: true, semaine: 0, fait_aujourdhui: false },
      { nom: "Veille tech 20 min", icone: "fas fa-newspaper", par_semaine: 5, active: true, semaine: 0, fait_aujourdhui: false },
      { nom: "Lire", icone: "fas fa-book", par_semaine: 5, active: true, semaine: 0, fait_aujourdhui: false },
    ],
  },
  pages: [{
    name: "objectifs", title: "Objectifs & habitudes", quick: { label: "Nouvel objectif", url: "/view/objectif_modifier" },
    content: [
      K.grid("dzv-grid-main",
        K.panel("Objectifs en cours", "fas fa-bullseye", K.view("objectifs_grille"), { actions: K.modalBtn("Objectif", "/view/objectif_modifier") }),
        K.panel("Habitudes du jour", "fas fa-seedling", K.view("habitudes_jour"), { actions: K.modalBtn("Habitude", "/view/habitude_modifier") })),
    ],
  }],
  nav: [{ page: "objectifs", label: "Objectifs", icon: "fas fa-bullseye", group: "Organisation", order: 20, keywords: "habitudes buts progression" }],
  quick: [{ label: "Nouvel objectif", icon: "fas fa-bullseye", url: "/view/objectif_modifier" }, { label: "Nouvelle habitude", icon: "fas fa-seedling", url: "/view/habitude_modifier" }],
  explain: [
    ["Tu crées un objectif", "Table « objectifs ». La barre de progression est un texte calculé (formule) dans la vue « objectif_carte » : actuel / cible."],
    ["Tu coches une habitude", "Le bouton « Fait » (action JavaScript dans la vue « habitude_ligne ») ajoute une ligne dans « habitudes_suivi » et recompte la semaine."],
    ["Chaque nuit", "Le workflow « habitudes_minuit » (blocs Table : modifier + Vérifier) remet « fait aujourd'hui » à zéro ; le lundi, il remet aussi le compteur de la semaine."],
  ],
};
