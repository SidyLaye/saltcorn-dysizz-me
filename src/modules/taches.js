"use strict";
const K = require("./_kit");

const DOMAINES = ["Pro", "Maison", "Perso", "Administratif", "Finances", "Santé", "Apprentissage"];

/* cocher / décocher une tâche (le déclencheur taches_cycle fait le reste) */
const TOGGLE = `// Bouton « fait » : bascule le statut. Le déclencheur « taches_cycle »
// note la date et recrée la tâche si elle se répète.
await table.updateRow({ statut: row.statut === "fait" ? "à faire" : "fait" }, row.id, user);
return { reload_page: true };`;

/* prochaine échéance d'une tâche qui se répète (null sinon) */
const PROCHAINE = `// Calcule la prochaine échéance si la tâche est faite et se répète.
if (row.statut !== "fait" || !row.recurrence || row.recurrence === "aucune" || row.suivante_creee) return null;
const d = row.echeance ? new Date(row.echeance) : new Date();
if (row.recurrence === "chaque jour") d.setDate(d.getDate() + 1);
if (row.recurrence === "chaque semaine") d.setDate(d.getDate() + 7);
if (row.recurrence === "chaque mois") d.setMonth(d.getMonth() + 1);
if (row.recurrence === "chaque année") d.setFullYear(d.getFullYear() + 1);
return d.toISOString();`;

module.exports = {
  key: "taches",
  label: "Tâches",
  icon: "fas fa-check-circle",
  group: "Organisation",
  description: "Tâches pro, maison et perso en tableau (à faire, en cours, en attente, fait), projets, tâches qui se répètent, rappel du matin.",
  depends: [],
  tables: [
    {
      name: "projets", description: "Un projet regroupe des tâches",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.opts("domaine", "Domaine", DOMAINES),
        K.opts("statut", "Statut", ["actif", "en pause", "terminé"]),
        K.date("echeance", "Échéance"),
        K.color("couleur", "Couleur"),
        K.s("description", "Description"),
      ],
    },
    {
      name: "taches", description: "Toutes tes tâches, quel que soit le domaine",
      fields: [
        K.s("titre", "Titre", { required: true }),
        K.opts("domaine", "Domaine", DOMAINES),
        K.key("projet", "Projet", "projets", "nom"),
        K.opts("statut", "Statut", ["à faire", "en cours", "en attente", "fait"]),
        K.opts("priorite", "Priorité", ["normale", "haute", "urgente", "basse"]),
        K.date("echeance", "Échéance"),
        K.opts("recurrence", "Se répète", ["aucune", "chaque jour", "chaque semaine", "chaque mois", "chaque année"]),
        K.s("notes", "Notes"),
        K.s("lien", "Lien"),
        K.s("source", "Origine", { description: "manuel, mail, document…" }),
        K.date("fait_le", "Fait le"),
        K.bool("suivante_creee", "Occurrence suivante créée"),
      ],
    },
  ],
  views: [
    K.edit("tache_modifier", "taches", [
      ["titre", "Titre"], ["domaine", "Domaine"], ["statut", "Statut"], ["priorite", "Priorité"],
      ["echeance", "Échéance", "edit"], ["recurrence", "Se répète"], ["projet", "Projet", "select"], ["lien", "Lien"],
      ["notes", "Notes", "textarea"],
    ], { delete: true, title: "Tâche", width: 640, description: "Ajouter ou modifier une tâche (s'ouvre en fenêtre)" }),
    K.custom("taches_tableau", "DZ Tableau", "taches", {
      champ_colonnes: "statut", colonnes: "à faire,en cours,en attente,fait", champ_titre: "titre",
      champs_infos: "echeance,priorite,domaine,projet.nom", tri: "echeance", colonne_finie: "fait", max_finies: 10,
      vue_fiche: "tache_modifier", vue_creation: "tache_modifier", filtre: "",
    }, "Tableau des tâches par statut, glisser-déposer"),
    K.list("taches_aujourdhui", "taches", [
      ["", K.jsBtn("", TOGGLE, { style: "btn-link", size: "", icon: "far fa-circle", cls: "dzv-check" })],
      ["Tâche", K.field("titre", "as_text")],
      ["Priorité", K.field("priorite", "as_text", { cls: "dzv-pill" })],
      ["Échéance", K.dateFr("echeance")],
    ], { include: 'statut != "fait" && echeance < today(1)', order: "echeance", desc: false, noHeader: true, rowClick: "`/view/tache_modifier?id=${id}`", limit: 20, description: "Tâches du jour et en retard" }),
    K.edit("projet_modifier", "projets", [["nom", "Nom"], ["domaine", "Domaine"], ["statut", "Statut"], ["echeance", "Échéance", "editDay"], ["couleur", "Couleur"], ["description", "Description", "textarea"]], { delete: true, title: "Projet", width: 600 }),
    K.show("projet_carte", "projets", K.box("dzv-tile", K.O({ url: "`javascript:ajax_modal('/view/projet_modifier?id=${id}')`", urlFormula: true }),
      K.field("nom", "as_text", { cls: "dzv-tile-title" }),
      K.meta(K.field("domaine", "as_text"), K.field("statut", "as_text"), K.dateFr("echeance")))),
    K.feed("projets_grille", "projets", "projet_carte", { include: 'statut != "terminé"', order: "echeance", desc: false, lg: 3 }),
  ],
  triggers: [
    K.wf("taches_cycle", "Update", "taches", "Date de fin + tâche suivante si elle se répète", [
      K.st("maintenant", "dzf_dates", { operation: "maintenant", sortie: "maintenant" }),
      K.st("noter_fin", "dzf_table_modifier", { table: "taches", id: "{{id}}", valeurs: K.J({ fait_le: "{{maintenant}}" }), sans_declencheurs: true, sortie: "fin" }, { only_if: 'statut == "fait" && !fait_le' }),
      K.st("rouvrir", "dzf_table_modifier", { table: "taches", id: "{{id}}", valeurs: K.J({ fait_le: null }), sans_declencheurs: true, sortie: "rouverte" }, { only_if: 'statut != "fait" && !!fait_le' }),
      K.st("prochaine_date", "dzf_code", { code: PROCHAINE, sortie: "prochaine" }),
      K.st("creer_suivante", "dzf_table_ajouter", { table: "taches", valeurs: K.J({ titre: "{{titre}}", domaine: "{{domaine}}", projet: "{{projet}}", priorite: "{{priorite}}", recurrence: "{{recurrence}}", notes: "{{notes}}", lien: "{{lien}}", statut: "à faire", echeance: "{{prochaine}}" }), sortie: "suivante" }, { only_if: "!!prochaine" }),
      K.st("marquer", "dzf_table_modifier", { table: "taches", id: "{{id}}", valeurs: K.J({ suivante_creee: true }), sans_declencheurs: true, sortie: "marquee" }, { only_if: "!!prochaine" }),
    ]),
    K.wf("taches_rappel", "Daily", null, "Notification du matin (tâches du jour et en retard)", [
      K.st("demain", "dzf_dates", { operation: "ajouter des jours", jours: 1, format: "jour (AAAA-MM-JJ)", sortie: "demain" }),
      K.st("compter", "dzf_table_compter", { table: "taches", filtre: K.J({ not: { statut: "fait" }, echeance: { lt: "{{demain}}" } }), stat: "compter", sortie: "total" }),
      K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "{{total}} tâche(s) pour aujourd'hui", texte: "Dont celles en retard.", lien: "/page/taches", sortie: "notifies" }, { only_if: "total > 0" }),
    ]),
  ],
  seeds: {
    projets: [{ nom: "Mémoire RNCP", domaine: "Apprentissage", statut: "actif" }],
    taches: [
      { titre: "Faire le tour de mon nouvel espace", domaine: "Perso", statut: "à faire", priorite: "normale", recurrence: "aucune", echeance: { $daysFromNow: 0 } },
      { titre: "Sortir les poubelles", domaine: "Maison", statut: "à faire", priorite: "normale", recurrence: "chaque semaine", echeance: { $daysFromNow: 2 } },
    ],
  },
  pages: [{
    name: "taches", title: "Tâches", quick: { label: "Nouvelle tâche", url: "/view/tache_modifier" },
    content: [
      K.chips([["Tout", ""], ["Pro", "domaine=Pro", "fas fa-briefcase"], ["Maison", "domaine=Maison", "fas fa-home"], ["Perso", "domaine=Perso", "fas fa-user"], ["Administratif", "domaine=Administratif", "fas fa-stamp"], ["Apprentissage", "domaine=Apprentissage", "fas fa-graduation-cap"]]),
      K.view("taches_tableau"),
      K.panel("Projets en cours", "fas fa-layer-group", K.view("projets_grille"), { actions: K.modalBtn("Nouveau projet", "/view/projet_modifier") }),
    ],
  }],
  nav: [{ page: "taches", label: "Tâches", icon: "fas fa-check-circle", group: "Organisation", order: 10, mobile: true, keywords: "todo à faire kanban projets" }],
  quick: [{ label: "Nouvelle tâche", icon: "fas fa-check-circle", url: "/view/tache_modifier", keywords: "tâche todo" }],
  explain: [
    ["Tu ajoutes une tâche", "Formulaire « tache_modifier » (bouton + ou Ctrl K). Elle arrive dans la colonne de son statut."],
    ["Tu glisses une carte", "La vue « taches_tableau » (type DZ Tableau) change le champ statut de la ligne."],
    ["Une tâche passe à « fait »", "Le workflow « taches_cycle » (à chaque modification) : bloc Dates → Table : modifier (fait_le) → Code (prochaine échéance) → Table : ajouter (la suivante)."],
    ["Chaque matin", "Le workflow « taches_rappel » : Dates → Table : compter → Notifier (seulement s'il y en a)."],
  ],
};
module.exports.DOMAINES = DOMAINES;
module.exports.TOGGLE = TOGGLE;
