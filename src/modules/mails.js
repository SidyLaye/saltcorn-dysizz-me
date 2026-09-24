"use strict";
const K = require("./_kit");

const REGLES = `// À l'arrivée de chaque mail (relève) : on applique tes règles (table mail_regles)
// puis on prévient si le mail est important.
const Regles = Table.findOne({ name: "mail_regles" });
const Taches = Table.findOne({ name: "taches" });
const maj = {};
for (const r of await Regles.getRows({ actif: true })) {
  const motif = String(r.contient || "").toLowerCase();
  if (!motif) continue;
  const cible = r.champ === "sujet" ? row.sujet : r.champ === "domaine" ? String(row.de || "").split("@")[1] : row.de + " " + row.de_nom;
  if (!String(cible || "").toLowerCase().includes(motif)) continue;
  if (r.action === "important") maj.important = true;
  if (r.action === "à traiter") maj.statut = "à traiter";
  if (r.action === "archiver") maj.statut = "archivé";
  if (r.action === "créer une tâche" && Taches && !row.tache) {
    const t = await Taches.insertRow({ titre: "Mail : " + row.sujet, domaine: "Pro", statut: "à faire", priorite: "haute", recurrence: "aucune", source: "mail", notes: row.de_nom + " <" + row.de + ">\\n\\n" + String(row.extrait || "") });
    maj.tache = t; maj.statut = "à traiter";
  }
}
if (Object.keys(maj).length) await table.updateRow(maj, row.id, undefined, true);
if (maj.important && !row.lu)
  for (const u of await User.find({ role_id: 1 }))
    await Notification.create({ user_id: u.id, title: "Mail important de " + (row.de_nom || row.de), body: row.sujet, link: "/page/mails" });`;

const statut = (label, s, icon, style = "btn-outline-secondary") => K.jsBtn(label, `// Change le statut du mail.\nawait table.updateRow({ statut: ${JSON.stringify(s)}, lu: true }, row.id, user);\nreturn { reload_page: true };`, { icon, style });

const EN_TACHE = `// Crée une tâche à partir du mail et relie les deux.
const Taches = Table.findOne({ name: "taches" });
if (!Taches) return { error: "Module Tâches non installé" };
const id = await Taches.insertRow({ titre: "Mail : " + row.sujet, domaine: "Pro", statut: "à faire", priorite: "normale", recurrence: "aucune", source: "mail", notes: row.de_nom + " <" + row.de + ">\\n\\n" + String(row.extrait || "") });
await table.updateRow({ tache: id, statut: "à traiter", lu: true }, row.id, user);
return { notify: "Tâche créée", reload_page: true };`;

const TILES = JSON.stringify([
  { label: "Non lus", icon: "fas fa-envelope", table: "mails", stat: "count", where: { lu: false, statut: { in: ["nouveau", "lu", "à traiter"] } }, href: "/page/mails?lu=false", tone: "info" },
  { label: "À traiter", icon: "fas fa-flag", table: "mails", stat: "count", where: { statut: "à traiter" }, href: "/page/mails?statut=%C3%A0%20traiter", tone: "warning" },
  { label: "Importants", icon: "fas fa-star", table: "mails", stat: "count", where: { important: true, statut: { in: ["nouveau", "lu", "à traiter"] } }, href: "/page/mails?important=true", tone: "danger" },
  { label: "Reçus aujourd'hui", icon: "fas fa-inbox", table: "mails", stat: "count", period: { field: "date", range: "today" } },
], null, 1);

module.exports = {
  key: "mails",
  label: "Mails pro",
  icon: "fas fa-envelope",
  group: "Travail",
  description: "Ta boîte pro (OVH ou tout serveur IMAP) relevée toutes les 5 minutes, en lecture seule : non lus, importants, à traiter, règles automatiques, mail → tâche en un clic.",
  depends: ["taches"],
  setup: `<ol>
<li>Dans Dokploy (ton service Saltcorn → Environment), ajoute <code>DZ_MAIL_PASSWORD=le mot de passe de ta boîte</code>, puis redéploie.</li>
<li>Saltcorn → Déclencheurs → <b>mails_releve</b> → étape <b>reglages</b> : mets ton adresse dans « utilisateur ». Serveur : <code>ssl0.ovh.net</code> (MX Plan) ou <code>pro1.mail.ovh.net</code> (E-mail Pro).</li>
<li>« Test run » du workflow pour une première relève. Ensuite c'est automatique (toutes les ~5 min). Tant que l'adresse est vide, le workflow s'arrête tout de suite sans erreur.</li>
</ol><p>Rien n'est modifié sur le serveur mail : ni lu, ni déplacé, ni supprimé.</p>`,
  tables: [
    {
      name: "mails", description: "Copie locale de tes mails (lecture seule)",
      fields: [
        K.int("uid", "UID IMAP"), K.s("dossier", "Dossier"), K.s("message_id", "Message-ID"),
        K.s("de", "Adresse de l'expéditeur"), K.s("de_nom", "Expéditeur"), K.s("a", "Destinataires"),
        K.s("sujet", "Sujet"), K.date("date", "Date"), K.s("extrait", "Extrait"), K.s("corps", "Texte"),
        K.bool("lu", "Lu"), K.bool("suivi", "Suivi (drapeau)"), K.bool("important", "Important"), K.int("pieces_jointes", "Pièces jointes", { default: 0 }),
        K.opts("statut", "Statut", ["nouveau", "lu", "à traiter", "en attente", "traité", "archivé"]),
        K.key("tache", "Tâche liée", "taches", "titre"), K.s("note", "Note"),
      ],
    },
    {
      name: "mail_regles", description: "Règles appliquées à l'arrivée d'un mail",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.opts("champ", "Si", ["expéditeur", "sujet", "domaine"]),
        K.s("contient", "Contient", { required: true }),
        K.opts("action", "Alors", ["important", "à traiter", "archiver", "créer une tâche"]),
        K.bool("actif", "Active", { default: true }),
      ],
    },
  ],
  views: [
    K.show("mail_lecture", "mails", K.box("dzv-mail",
      K.box("dzv-mail-head",
        K.field("sujet", "as_text", { cls: "dzv-mail-title" }),
        K.meta(K.field("de_nom", "as_text"), K.field("de", "as_text"), K.dateFr("date", { time: true }), K.field("statut", "as_text")),
        K.box("dzv-tile-actions",
          statut("À traiter", "à traiter", "fas fa-flag", "btn-outline-warning"), statut("En attente", "en attente", "far fa-clock"), statut("Traité", "traité", "fas fa-check", "btn-outline-success"), statut("Archiver", "archivé", "fas fa-archive"),
          K.jsBtn("En faire une tâche", EN_TACHE, { icon: "fas fa-check-circle", style: "btn-primary" }))),
      K.formula("pieces_jointes ? '<span class=\"dzv-meta\"><i class=\"fas fa-paperclip\"></i>' + pieces_jointes + ' pièce(s) jointe(s) : à ouvrir dans ton webmail</span>' : ''", { html: true }),
      K.field("corps", "as_text", { cls: "dzv-mail-body", block: true })), { title: "Mail", width: 860 }),
    K.list("mails_boite", "mails", [
      ["", K.formula("(important ? '<i class=\"fas fa-star\" style=\"color:var(--dzv-warning)\"></i>' : '') + (pieces_jointes ? ' <i class=\"fas fa-paperclip dzv-muted\"></i>' : '')", { html: true, block: false })],
      ["De", K.box("dzv-mail-from", K.field("de_nom", "as_text"))],
      ["Sujet", K.box("", K.box("dzv-mail-subj", K.field("sujet", "as_text")), K.box("dzv-mail-ext", K.field("extrait", "as_text")))],
      ["Statut", K.field("statut", "as_text", { cls: "dzv-pill" })],
      ["Reçu", K.dateFr("date", { time: true })],
    ], {
      include: 'statut != "archivé" && statut != "traité"', order: "date", desc: true, rowClick: "`/view/mail_lecture?id=${id}`", limit: 40,
      state: { _row_color_formula: "" }, description: "Boîte de réception (hors traités et archivés)",
    }),
    K.list("mails_tous", "mails", [
      ["De", K.field("de_nom", "as_text")], ["Sujet", K.field("sujet", "as_text")], ["Statut", K.field("statut", "as_text", { cls: "dzv-pill" })], ["Reçu", K.dateFr("date", { time: true })],
    ], { include: 'statut == "traité" || statut == "archivé"', order: "date", desc: true, rowClick: "`/view/mail_lecture?id=${id}`", limit: 20, description: "Mails traités et archivés" }),
    K.edit("regle_modifier", "mail_regles", [["nom", "Nom"], ["champ", "Si"], ["contient", "Contient"], ["action", "Alors"], ["actif", "Active"]], { delete: true, title: "Règle", width: 560 }),
    K.list("regles_liste", "mail_regles", [["Règle", K.field("nom", "as_text")], ["Si", K.field("champ", "as_text")], ["Contient", K.field("contient", "as_text")], ["Alors", K.field("action", "as_text", { cls: "dzv-pill" })], ["Active", K.field("actif", "show")]],
      { order: "nom", desc: false, rowClick: "`/view/regle_modifier?id=${id}`" }),
    K.custom("mails_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 4 }, "Compteurs de la boîte"),
  ],
  triggers: [
    K.wf("mails_releve", "Often", null, "Relève la boîte mail toutes les ~5 min (lecture seule, sans doublon, un seul passage à la fois)", [
      K.st("reglages", "dzf_definir", { valeurs: K.J({ utilisateur: "", serveur: "ssl0.ovh.net", variable_mot_de_passe: "DZ_MAIL_PASSWORD", dossier: "INBOX" }), fusionner: true }, { next_step: 'utilisateur ? "verrou" : ""' }),
      K.st("verrou", "dzf_verrou", { action: "prendre", nom: "releve-mails", duree: 600, sortie: "verrou" }, { next_step: 'verrou ? "dernier" : ""' }),
      K.st("dernier", "dzf_table_compter", { table: "mails", stat: "max", champ: "uid", filtre: K.J({ dossier: "{{dossier}}" }), sortie: "dernier_uid" }),
      K.st("relever", "dzf_imap_lire", { serveur: "{{serveur}}", port: 993, utilisateur: "{{utilisateur}}", variable_mot_de_passe: "{{variable_mot_de_passe}}", dossier: "{{dossier}}", depuis_uid: "{{dernier_uid}}", jours: 14, max: 100, si_erreur: "continuer", delai_max: 180, sortie: "nouveaux" }),
      K.st("preparer", "dzf_liste_transformer", { liste: "{{nouveaux}}", modele: '{"uid":"{{item.uid}}","dossier":"{{item.dossier}}","message_id":"{{item.message_id}}","de":"{{item.de}}","de_nom":"{{item.de_nom}}","a":"{{item.a}}","sujet":"{{item.sujet}}","date":"{{item.date}}","extrait":"{{item.extrait}}","corps":"{{item.corps}}","lu":"{{item.lu}}","suivi":"{{item.suivi}}","pieces_jointes":"{{item.pieces_jointes}}","important":false,"statut":"nouveau"}', sortie: "lignes" }),
      K.st("ranger", "dzf_table_upsert", { table: "mails", liste: "{{lignes}}", cle: "message_id", sortie: "bilan" }),
      K.st("liberer", "dzf_verrou", { action: "libérer", nom: "releve-mails", sortie: "verrou_libre" }),
    ], { reglages: ["valeurs"] }),
    K.wf("mails_regles", "Insert", "mails", "Applique tes règles à chaque nouveau mail et prévient si important", [
      K.st("regles", "dzf_code", { code: REGLES, sortie: "regles" }),
    ]),
  ],
  seeds: { mail_regles: [{ nom: "Mails de la direction", champ: "domaine", contient: "ambs-agency.com", action: "important", actif: false }] },
  pages: [{
    name: "mails", title: "Mails pro",
    content: [
      K.view("mails_chiffres"),
      K.chips([["Boîte", ""], ["Non lus", "lu=false", "fas fa-envelope"], ["À traiter", "statut=à traiter", "fas fa-flag"], ["En attente", "statut=en attente", "far fa-clock"], ["Importants", "important=true", "fas fa-star"]]),
      K.panel("Boîte de réception", "fas fa-inbox", K.view("mails_boite"), { cls: "dzv-mails" }),
      K.grid("dzv-grid-2",
        K.panel("Règles automatiques", "fas fa-magic", K.view("regles_liste"), { actions: K.modalBtn("Règle", "/view/regle_modifier") }),
        K.panel("Traités et archivés", "fas fa-archive", K.view("mails_tous", { state: "fixed", fixed: {}, id: "mtraites" }))),
    ],
  }],
  nav: [{ page: "mails", label: "Mails", icon: "fas fa-envelope", group: "Travail", order: 10, mobile: true, keywords: "email boîte réception ovh" }],
  quick: [{ label: "Règle de mail", icon: "fas fa-magic", url: "/view/regle_modifier", keywords: "filtre mail" }],
  explain: [
    ["Toutes les 5 minutes", "Le workflow « mails_releve » : Définir (tes réglages) → Verrou → Table : compter (dernier UID) → Mail : lire (IMAP, lecture seule) → Liste : transformer → Table : ajouter ou mettre à jour → Verrou libéré."],
    ["Un mail arrive", "Le workflow « mails_regles » (bloc Code) (à chaque ajout) applique tes règles : important, à traiter, archiver, ou créer une tâche. Si c'est important : notification."],
    ["Tu lis un mail", "Clic sur une ligne → vue « mail_lecture » en fenêtre, avec les boutons de statut et « En faire une tâche »."],
      ],
};
