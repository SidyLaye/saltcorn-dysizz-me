"use strict";
const K = require("./_kit");

const CATS = ["identité", "santé", "banque", "impôts", "logement", "travail", "études", "véhicule", "assurance", "factures", "autre"];
const ICONS = { identité: "fa-id-card", santé: "fa-notes-medical", banque: "fa-university", impôts: "fa-landmark", logement: "fa-home", travail: "fa-briefcase", études: "fa-graduation-cap", véhicule: "fa-car", assurance: "fa-shield-alt", factures: "fa-file-invoice", autre: "fa-file" };

const ICON_FML = `'<span class="dzv-doc-ic"><i class="fas ' + (${JSON.stringify(ICONS)}[categorie] || 'fa-file') + '"></i></span>'`;
const EXPIRY_FML = `expire_le ? (() => { const j = Math.round((new Date(expire_le) - new Date()) / 864e5); return j < 0 ? '<span class="dzv-meta dzv-late">expiré</span>' : j <= (rappel_jours || 60) ? '<span class="dzv-meta dzv-today">expire dans ' + j + ' j</span>' : '<span class="dzv-meta">valable jusqu\\'au ' + new Date(expire_le).toLocaleDateString('fr-FR') + '</span>'; })() : ''`;

module.exports = {
  key: "documents",
  label: "Documents",
  icon: "fas fa-folder-open",
  group: "Vie perso",
  description: "Coffre de documents rangés par catégorie (identité, impôts, logement…), fichiers joints, dates d'expiration avec rappel et tâche de renouvellement automatique.",
  depends: [],
  setup: "<p>Les fichiers sont rangés par Saltcorn (Paramètres → Fichiers). Sur plusieurs serveurs, utilise le stockage S3 pour que tous les nœuds les voient.</p>",
  tables: [{
    name: "documents", description: "Tes papiers importants",
    fields: [
      K.s("titre", "Titre", { required: true }),
      K.opts("categorie", "Catégorie", CATS),
      K.file("fichier", "Fichier"),
      K.date("date_document", "Date du document"),
      K.date("expire_le", "Expire le"),
      K.int("rappel_jours", "Me prévenir (jours avant)", { default: 60 }),
      K.bool("important", "Important"),
      K.s("notes", "Notes"),
      K.bool("rappel_envoye", "Rappel envoyé"),
    ],
  }],
  views: [
    K.edit("document_modifier", "documents", [
      ["titre", "Titre"], ["categorie", "Catégorie"], ["fichier", "Fichier", "upload"], ["date_document", "Date du document", "editDay"],
      ["expire_le", "Expire le", "editDay"], ["rappel_jours", "Me prévenir (jours avant)"], ["important", "Important"], ["notes", "Notes", "textarea"],
    ], { delete: true, title: "Document", width: 620 }),
    K.show("document_carte", "documents", K.box("dzv-tile dzv-doc",
      K.box("dzv-doc-top", K.formula(ICON_FML, { html: true, block: false }), K.box("dzv-doc-t", K.field("titre", "as_text", { cls: "dzv-tile-title" }), K.meta(K.field("categorie", "as_text"), K.dateFr("date_document")))),
      K.formula(EXPIRY_FML, { html: true }),
      K.box("dzv-tile-actions", K.field("fichier", "Download link"), K.modalLink("document_modifier", "Modifier")))),
    K.feed("documents_grille", "documents", "document_carte", { order: "categorie", desc: false, lg: 3, limit: 60 }),
  ],
  triggers: [
    K.wf("documents_rappel", "Daily", null, "Prévient avant l'expiration d'un document et crée une tâche « Renouveler »", [
      K.st("aujourdhui", "dzf_dates", { operation: "début du jour", sortie: "aujourdhui" }),
      K.st("horizon", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 365, sortie: "horizon" }),
      K.st("proches", "dzf_table_chercher", { table: "documents", filtre: K.J({ rappel_envoye: false, expire_le: { gt: "{{aujourdhui}}", lt: "{{horizon}}" } }), tri: "expire_le", limite: 200, sortie: "proches" }),
      K.st("a_prevenir", "dzf_liste_filtrer", { liste: "{{proches}}", expression: "(new Date(item.expire_le) - Date.now()) / 864e5 <= (item.rappel_jours || 60)", sortie: "a_prevenir" }),
      K.st("taches", "dzf_liste_transformer", { liste: "{{a_prevenir}}", modele: K.J({ titre: "Renouveler : {{item.titre}}", domaine: "Administratif", statut: "à faire", priorite: "haute", recurrence: "aucune", echeance: "{{item.expire_le}}", source: "document" }), sortie: "taches" }),
      K.st("creer_taches", "dzf_table_ajouter", { table: "taches", liste: "{{taches}}", si_erreur: "continuer", sortie: "taches_creees" }, { only_if: "a_prevenir.length > 0" }),
      K.st("marquer", "dzf_table_modifier", { table: "documents", ids: "{{a_prevenir}}", valeurs: K.J({ rappel_envoye: true }), sans_declencheurs: true, sortie: "marques" }, { only_if: "a_prevenir.length > 0" }),
      K.st("texte", "dzf_texte", { modele: "{{lignes}}", liste: "{{a_prevenir}}", modele_ligne: "- {{item.titre}}", sortie: "texte" }),
      K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "Document(s) bientôt expiré(s)", texte: "{{texte}}", lien: "/page/documents", sortie: "notifies" }, { only_if: "a_prevenir.length > 0" }),
    ]),
  ],
  pages: [{
    name: "documents", title: "Documents", quick: { label: "Document", url: "/view/document_modifier" },
    content: [
      K.chips([["Tout", ""], ...CATS.slice(0, 10).map((c) => [c.charAt(0).toUpperCase() + c.slice(1), `categorie=${encodeURIComponent(c)}`, `fas ${ICONS[c]}`])]),
      K.view("documents_grille"),
    ],
  }],
  nav: [{ page: "documents", label: "Documents", icon: "fas fa-folder-open", group: "Vie perso", order: 30, keywords: "papiers passeport carte identité impôts coffre" }],
  quick: [{ label: "Nouveau document", icon: "fas fa-folder-open", url: "/view/document_modifier", keywords: "papier fichier" }],
  explain: [
    ["Tu ranges un document", "Table « documents » avec un champ Fichier. Le fichier est stocké par Saltcorn (local ou S3)."],
    ["Il va expirer", "Le workflow « documents_rappel » (chaque matin : Table : chercher → Liste : filtrer → Table : ajouter → Notifier) te prévient X jours avant (champ rappel_jours) et crée une tâche « Renouveler » si le module Tâches est installé."],
    ["La carte du document", "Vue « document_carte » : l'icône et l'alerte d'expiration sont des textes calculés (formules) ; le lien de téléchargement vient du champ fichier."],
  ],
};
