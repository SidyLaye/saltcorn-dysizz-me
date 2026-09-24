"use strict";
const K = require("./_kit");

const COCHER = `// Coche / décoche un article de la liste de courses.
await table.updateRow({ pris: !row.pris }, row.id, user);
return { reload_page: true };`;

const VIDER = `// Retire de la liste les articles déjà pris.
const t = Table.findOne({ name: "courses" });
await t.deleteRows({ pris: true });
return { reload_page: true };`;

module.exports = {
  key: "maison",
  label: "Maison",
  icon: "fas fa-home",
  group: "Organisation",
  description: "Les tâches de la maison (ménage, factures, réparations) en tableau, les routines qui se répètent, et la liste de courses par rayon.",
  depends: ["taches"],
  tables: [{
    name: "courses", description: "Liste de courses",
    fields: [
      K.s("article", "Article", { required: true }),
      K.s("quantite", "Quantité"),
      K.opts("rayon", "Rayon", ["épicerie", "fruits & légumes", "frais", "surgelés", "boissons", "hygiène", "maison", "autre"]),
      K.bool("pris", "Pris"),
    ],
  }],
  views: [
    K.edit("course_modifier", "courses", [["article", "Article"], ["quantite", "Quantité"], ["rayon", "Rayon"]], { delete: true, title: "Article", width: 520, cols: 1 }),
    K.list("courses_liste", "courses", [
      ["", K.jsBtn("", COCHER, { style: "btn-link", size: "", icon: "far fa-square", cls: "dzv-check" })],
      ["Article", K.field("article", "as_text")],
      ["Qté", K.field("quantite", "as_text")],
      ["Rayon", K.field("rayon", "as_text", { cls: "dzv-pill" })],
    ], { order: "pris", desc: false, noHeader: true, rowClick: "`/view/course_modifier?id=${id}`", limit: 100, state: { _row_color_formula: "" }, description: "Liste de courses" }),
  ],
  seeds: { courses: [{ article: "Riz", quantite: "5 kg", rayon: "épicerie", pris: false }, { article: "Oignons", quantite: "1 filet", rayon: "fruits & légumes", pris: false }] },
  pages: [{
    name: "maison", title: "Maison", quick: { label: "Tâche maison", url: "/view/tache_modifier?domaine=Maison" },
    content: [
      K.grid("dzv-grid-main",
        K.panel("Tâches de la maison", "fas fa-broom", K.view("taches_tableau", { state: "fixed", fixed: { domaine: "Maison" }, id: "tmaison" }), { actions: K.modalBtn("Tâche", "/view/tache_modifier?domaine=Maison") }),
        K.panel("Courses", "fas fa-shopping-basket", [K.view("courses_liste"), K.box("dzv-tile-actions", K.jsBtn("Retirer les articles pris", VIDER, { icon: "fas fa-broom", style: "btn-outline-secondary" }))], { actions: K.modalBtn("Article", "/view/course_modifier") })),
    ],
  }],
  nav: [{ page: "maison", label: "Maison", icon: "fas fa-home", group: "Organisation", order: 30, keywords: "courses ménage routine" }],
  quick: [{ label: "Article de courses", icon: "fas fa-shopping-basket", url: "/view/course_modifier", keywords: "courses" }],
  explain: [
    ["Tâches de la maison", "Ce sont les tâches du module Tâches avec domaine = Maison : la page intègre la vue « taches_tableau » avec ce filtre fixé."],
    ["Routines (poubelles, ménage…)", "Une tâche avec « Se répète » : quand tu la passes à fait, la suivante est créée (déclencheur « taches_cycle »)."],
    ["Courses", "Table « courses ». La case à cocher est une action JavaScript de la vue « courses_liste » ; le bouton du bas supprime les articles pris."],
  ],
};
