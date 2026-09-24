"use strict";
const K = require("./_kit");

const TILES = JSON.stringify([
  { label: "RDV dans les 30 jours", icon: "fas fa-stethoscope", table: "rdv_sante", stat: "count", where: { fait: false }, period: { field: "date", range: "next30" }, tone: "info" },
  { label: "Traitements en cours", icon: "fas fa-pills", table: "traitements", stat: "count", where: { actif: true } },
  { label: "Poids moyen (30 j)", icon: "fas fa-weight", table: "mesures_sante", stat: "avg", field: "valeur", where: { type: "poids (kg)" }, period: { field: "date", range: "last30" }, format: "dec", sub: "kg" },
  { label: "Sommeil moyen (7 j)", icon: "fas fa-bed", table: "mesures_sante", stat: "avg", field: "valeur", where: { type: "sommeil (h)" }, period: { field: "date", range: "last7" }, format: "dec", sub: "heures par nuit" },
], null, 1);

module.exports = {
  key: "sante",
  label: "Santé",
  icon: "fas fa-heartbeat",
  group: "Vie perso",
  description: "Rendez-vous médicaux avec rappel la veille, traitements en cours, mesures (poids, tension, sommeil, pas…) et carnet des soignants.",
  depends: [],
  tables: [
    {
      name: "sante_contacts", description: "Médecins, dentiste, pharmacie…",
      fields: [K.s("nom", "Nom", { required: true }), K.s("specialite", "Spécialité"), K.s("telephone", "Téléphone"), K.s("adresse", "Adresse"), K.s("notes", "Notes")],
    },
    {
      name: "rdv_sante", description: "Rendez-vous médicaux",
      fields: [
        K.date("date", "Date et heure", { required: true }), K.s("motif", "Motif", { required: true }),
        K.key("contact", "Avec", "sante_contacts", "nom"), K.s("lieu", "Lieu"), K.s("notes", "Notes / compte rendu"), K.bool("fait", "Passé"),
      ],
    },
    {
      name: "traitements", description: "Médicaments et soins en cours",
      fields: [
        K.s("nom", "Nom", { required: true }), K.s("dosage", "Dosage"),
        K.opts("moments", "Quand", ["matin", "midi", "soir", "matin et soir", "matin, midi et soir", "au besoin"]),
        K.date("debut", "Début"), K.date("fin", "Fin"), K.bool("actif", "En cours", { default: true }), K.s("notes", "Notes"),
      ],
    },
    {
      name: "mesures_sante", description: "Suivi chiffré (poids, tension, sommeil…)",
      fields: [
        K.date("date", "Date", { required: true }),
        K.opts("type", "Mesure", ["poids (kg)", "tension", "sommeil (h)", "pas", "fréquence cardiaque", "glycémie", "humeur (1 à 5)", "autre"], { required: true }),
        K.num("valeur", "Valeur", { required: true }), K.num("valeur2", "2e valeur", { description: "ex. tension basse" }), K.s("note", "Note"),
      ],
    },
  ],
  views: [
    K.edit("rdv_modifier", "rdv_sante", [["motif", "Motif"], ["date", "Date et heure", "edit"], ["contact", "Avec", "select"], ["lieu", "Lieu"], ["fait", "Passé"], ["notes", "Notes / compte rendu", "textarea"]], { delete: true, title: "Rendez-vous", width: 600 }),
    K.list("rdv_a_venir", "rdv_sante", [
      ["Quand", K.dateFr("date", { time: true })], ["Motif", K.field("motif", "as_text")], ["Avec", K.join("contact.nom", "as_text")], ["Lieu", K.field("lieu", "as_text")],
    ], { include: "fait == false", order: "date", desc: false, rowClick: "`/view/rdv_modifier?id=${id}`", limit: 20 }),
    K.edit("traitement_modifier", "traitements", [["nom", "Nom"], ["dosage", "Dosage"], ["moments", "Quand"], ["actif", "En cours"], ["debut", "Début", "editDay"], ["fin", "Fin", "editDay"], ["notes", "Notes", "textarea"]], { delete: true, title: "Traitement", width: 600 }),
    K.list("traitements_en_cours", "traitements", [["Traitement", K.field("nom", "as_text")], ["Dosage", K.field("dosage", "as_text")], ["Quand", K.field("moments", "as_text", { cls: "dzv-pill" })], ["Jusqu'au", K.dateFr("fin")]],
      { include: "actif == true", order: "nom", desc: false, rowClick: "`/view/traitement_modifier?id=${id}`", limit: 30 }),
    K.edit("mesure_modifier", "mesures_sante", [["type", "Mesure"], ["valeur", "Valeur"], ["valeur2", "2e valeur (tension basse…)"], ["date", "Date", "edit"], ["note", "Note", "textarea"]], { delete: true, title: "Mesure", width: 560 }),
    K.list("mesures_recentes", "mesures_sante", [["Date", K.dateFr("date")], ["Mesure", K.field("type", "as_text")], ["Valeur", K.field("valeur", "show")], ["", K.field("valeur2", "show")], ["Note", K.field("note", "as_text")]],
      { order: "date", desc: true, rowClick: "`/view/mesure_modifier?id=${id}`", limit: 15 }),
    K.edit("soignant_modifier", "sante_contacts", [["nom", "Nom"], ["specialite", "Spécialité"], ["telephone", "Téléphone"], ["adresse", "Adresse"], ["notes", "Notes", "textarea"]], { delete: true, title: "Soignant", width: 560 }),
    K.list("soignants_liste", "sante_contacts", [["Nom", K.field("nom", "as_text")], ["Spécialité", K.field("specialite", "as_text")], ["Téléphone", K.field("telephone", "as_text")]], { order: "nom", desc: false, rowClick: "`/view/soignant_modifier?id=${id}`" }),
    K.custom("sante_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 4 }, "Chiffres santé"),
  ],
  triggers: [
    K.wf("sante_rappel", "Daily", null, "Notification la veille d'un rendez-vous et avant la fin d'un traitement", [
      K.st("aujourdhui", "dzf_dates", { operation: "début du jour", format: "iso", sortie: "aujourdhui" }),
      K.st("demain", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 1, sortie: "demain" }),
      K.st("apres_demain", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 2, sortie: "apres_demain" }),
      K.st("dans7", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 7, sortie: "dans7" }),
      K.st("rdv", "dzf_table_chercher", { table: "rdv_sante", filtre: K.J({ fait: false, date: { gt: "{{demain}}", lt: "{{apres_demain}}", equal: true } }), tri: "date", limite: 20, sortie: "rdv" }),
      K.st("texte_rdv", "dzf_texte", { modele: "{{lignes}}", liste: "{{rdv}}", modele_ligne: "- {{item.motif}} {{item.lieu}}", sortie: "texte_rdv" }),
      K.st("notifier_rdv", "dzf_notifier", { qui: "administrateurs", titre: "Rendez-vous demain", texte: "{{texte_rdv}}", lien: "/page/sante", sortie: "n1" }, { only_if: "rdv.length > 0" }),
      K.st("fins", "dzf_table_chercher", { table: "traitements", filtre: K.J({ actif: true, fin: { gt: "{{aujourdhui}}", lt: "{{dans7}}", equal: true } }), limite: 20, sortie: "fins" }),
      K.st("texte_fins", "dzf_texte", { modele: "Penser à l'ordonnance ?\n{{lignes}}", liste: "{{fins}}", modele_ligne: "- {{item.nom}}", sortie: "texte_fins" }),
      K.st("notifier_fins", "dzf_notifier", { qui: "administrateurs", titre: "Traitement(s) bientôt terminé(s)", texte: "{{texte_fins}}", lien: "/page/sante", sortie: "n2" }, { only_if: "fins.length > 0" }),
    ]),
  ],
  pages: [{
    name: "sante", title: "Santé", quick: { label: "Rendez-vous", url: "/view/rdv_modifier" },
    content: [
      K.view("sante_chiffres"),
      K.grid("dzv-grid-2",
        K.panel("Rendez-vous", "fas fa-stethoscope", K.view("rdv_a_venir"), { actions: K.modalBtn("RDV", "/view/rdv_modifier") }),
        K.panel("Traitements en cours", "fas fa-pills", K.view("traitements_en_cours"), { actions: K.modalBtn("Traitement", "/view/traitement_modifier") })),
      K.grid("dzv-grid-main",
        K.panel("Mesures", "fas fa-chart-line", K.view("mesures_recentes"), { actions: K.modalBtn("Mesure", "/view/mesure_modifier") }),
        K.panel("Soignants", "fas fa-user-md", K.view("soignants_liste"), { actions: K.modalBtn("Soignant", "/view/soignant_modifier") })),
    ],
  }],
  nav: [{ page: "sante", label: "Santé", icon: "fas fa-heartbeat", group: "Vie perso", order: 20, keywords: "médecin rdv traitement poids sommeil" }],
  quick: [{ label: "RDV médical", icon: "fas fa-stethoscope", url: "/view/rdv_modifier", keywords: "médecin" }, { label: "Mesure santé", icon: "fas fa-weight", url: "/view/mesure_modifier", keywords: "poids sommeil tension" }],
  explain: [
    ["Tu notes un rendez-vous", "Table « rdv_sante ». Il apparaît dans la page Santé et dans « Cette semaine » de l'accueil."],
    ["La veille au matin", "Le workflow « sante_rappel » (Dates → Table : chercher → Texte → Notifier) t'envoie une notification, et une autre quand un traitement se termine dans la semaine."],
    ["Tes mesures", "Table « mesures_sante ». Les moyennes du haut sont calculées par la vue « sante_chiffres » (DZ Indicateurs)."],
  ],
};
