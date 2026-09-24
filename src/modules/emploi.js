"use strict";
const K = require("./_kit");

const slug = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
const setStatut = (label, st, icon, style = "btn-link") => K.jsBtn(label, `// Change le statut de l'offre sans recharger la page.
await table.updateRow({ statut: ${JSON.stringify(st)} }, row.id, user);
return { eval_js: "var c=document.getElementById('off-" + row.id + "');if(c)c.setAttribute('data-statut','${slug(st)}')" };`, { icon, style });

const POSTULER = `// Crée une candidature à partir de l'offre (tu la retrouves dans le tableau des candidatures).
const C = Table.findOne({ name: "candidatures" });
if (!(await C.getRow({ offre: row.id })))
  await C.insertRow({ entreprise: row.entreprise || "?", poste: row.titre, offre: row.id, lien: row.url, statut: "à envoyer" });
await table.updateRow({ statut: "postulé" }, row.id, user);
return { notify: "Ajoutée à tes candidatures", reload_page: true };`;

const CHERCHER = `// Pour chaque recherche active : bloc France Travail, puis rangement sans doublon.
const R = Table.findOne({ name: "emploi_recherches" });
let nouvelles = 0;
for (const r of await R.getRows({ actif: true })) {
  const o = await Actions.dzf_france_travail({ mots_cles: r.mots_cles || "", departement: r.departement || "", commune: r.commune || "", rayon_km: r.rayon_km || "", contrat: r.contrat || "", alternance: !!r.alternance, depuis_jours: r.depuis_jours || 7, sortie: "offres", si_erreur: "continuer" });
  const offres = (o.offres || []).map((x) => ({ ...x, recherche: r.id, statut: "nouvelle" }));
  const u = await Actions.dzf_table_upsert({ table: "offres_emploi", liste: offres, cle: "ref", sortie: "b" });
  nouvelles += (u.b && u.b.ajoutes) || 0;
  await R.updateRow({ derniere_synchro: new Date(), etat: o.offres_erreur ? String(o.offres_erreur).slice(0, 200) : "ok" }, r.id, undefined, true);
}
return nouvelles;`;

module.exports = {
  key: "emploi",
  label: "Emploi",
  icon: "fas fa-user-tie",
  group: "Travail",
  description: "Offres d'emploi en France (API France Travail, gratuite) selon tes recherches enregistrées, tri rapide (intéressante / écarter / postuler) et suivi des candidatures avec relance automatique.",
  depends: [],
  setup: "<p>Crée une application gratuite sur <a href=\"https://francetravail.io\" target=\"_blank\" rel=\"noopener\">francetravail.io</a> (API « Offres d'emploi v2 »), puis colle ses deux clés dans <a href=\"/dysizz-me/reglages/emploi\">Régler Emploi</a>. Tes recherches se règlent ensuite dans la page Emploi.</p>",
  settings: {
    intro: "Les offres viennent de l'API officielle de France Travail (gratuite). 1) Crée un compte sur <a href=\"https://francetravail.io\" target=\"_blank\" rel=\"noopener\">francetravail.io</a>. 2) « Créer une application », coche l'API <b>Offres d'emploi v2</b>. 3) Copie ici l'identifiant et la clé secrète.",
    fields: [
      { name: "client_id", label: "Identifiant client", type: "password", secret: "FT_CLIENT_ID", required: true },
      { name: "client_secret", label: "Clé secrète", type: "password", secret: "FT_CLIENT_SECRET", required: true },
    ],
    apply: [{ trigger: "emplois_releve", step: "configure", set: { condition: "true" } }],
    test: {
      action: "dzf_france_travail",
      config: () => ({ mots_cles: "data", depuis_jours: 7 }),
      ok: (r) => `Connexion réussie. ${Array.isArray(r) ? r.length : 0} offre(s) « data » cette semaine.`,
      explain: (m) => (/401|invalid_client|unauthorized/i.test(m) ? "France Travail refuse les clés : recopie-les (et vérifie que l'API Offres d'emploi v2 est cochée)." : ""),
    },
    after: "Règle maintenant tes recherches dans la page Emploi.",
  },
  tables: [
    {
      name: "emploi_recherches", description: "Tes recherches enregistrées",
      fields: [
        K.s("nom", "Nom", { required: true }), K.s("mots_cles", "Mots-clés", { description: "Séparés par des virgules, ex. devops,kubernetes" }),
        K.s("departement", "Département(s)", { description: "Ex. 75 ou 75,92,93 — vide = toute la France" }), K.s("commune", "Code commune INSEE"),
        K.int("rayon_km", "Rayon (km) autour de la commune"), K.s("contrat", "Contrat", { description: "CDI, CDD, MIS (intérim)… vide = tous" }),
        K.bool("alternance", "Alternance seulement"), K.bool("teletravail", "Télétravail"), K.int("depuis_jours", "Publiées depuis (jours)", { default: 7 }),
        K.bool("actif", "Active", { default: true }), K.date("derniere_synchro", "Dernière recherche"), K.s("etat", "État"),
      ],
    },
    {
      name: "offres_emploi", description: "Offres trouvées",
      fields: [
        K.s("ref", "Référence", { unique: true }), K.s("titre", "Poste"), K.s("entreprise", "Entreprise"), K.s("lieu", "Lieu"), K.s("contrat", "Contrat"),
        K.s("salaire", "Salaire"), K.s("experience", "Expérience"), K.date("date", "Publiée le"), K.s("url", "Lien"), K.s("description", "Description"),
        K.key("recherche", "Recherche", "emploi_recherches", "nom"), K.opts("statut", "Statut", ["nouvelle", "intéressante", "postulé", "écartée"]),
        K.s("source", "Source"), K.s("note", "Note"),
      ],
    },
    {
      name: "candidatures", description: "Suivi de tes candidatures",
      fields: [
        K.s("entreprise", "Entreprise", { required: true }), K.s("poste", "Poste", { required: true }), K.key("offre", "Offre", "offres_emploi", "titre"),
        K.s("lien", "Lien"), K.opts("statut", "Statut", ["à envoyer", "envoyée", "relance", "entretien", "refus", "offre"]),
        K.date("envoyee_le", "Envoyée le"), K.date("relance_le", "Relancer le"), K.s("contact", "Contact"), K.s("notes", "Notes"),
      ],
    },
  ],
  views: [
    K.show("offre_carte", "offres_emploi", K.box("`dzv-tile dzv-offre dzv-o-${String(statut || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/\\s+/g, '-')}`", K.O({ clsFormula: true, id: "`off-${id}`" }),
      K.meta(K.field("entreprise", "as_text"), K.field("lieu", "as_text"), K.dateFr("date")),
      K.box("dzv-tile-title", K.O({ url: "`javascript:ajax_modal('/view/offre_lecture?id=${id}')`", urlFormula: true }), K.field("titre", "as_text")),
      K.meta(K.field("contrat", "as_text", { cls: "dzv-pill" }), K.field("salaire", "as_text")),
      K.box("dzv-tile-actions",
        setStatut("Intéressante", "intéressante", "fas fa-heart"), setStatut("Écarter", "écartée", "fas fa-times"),
        K.jsBtn("Postuler", POSTULER, { icon: "fas fa-paper-plane", style: "btn-outline-primary" }), K.link("'Voir'", "url", { cls: "btn btn-sm btn-link" }))), { description: "Carte d'une offre" }),
    K.show("offre_lecture", "offres_emploi", K.box("dzv-mail",
      K.box("dzv-mail-head", K.field("titre", "as_text", { cls: "dzv-mail-title" }), K.meta(K.field("entreprise", "as_text"), K.field("lieu", "as_text"), K.field("contrat", "as_text"), K.field("salaire", "as_text"), K.field("experience", "as_text")),
        K.box("dzv-tile-actions", K.jsBtn("Postuler", POSTULER, { icon: "fas fa-paper-plane", style: "btn-primary" }), K.link("'Ouvrir l\\'offre'", "url", { cls: "btn btn-sm btn-outline-secondary" }))),
      K.field("description", "as_text", { cls: "dzv-mail-body", block: true })), { title: "Offre", width: 860 }),
    K.feed("offres_fil", "offres_emploi", "offre_carte", { include: 'statut != "écartée" && statut != "postulé"', order: "date", desc: true, limit: 30, md: 2, lg: 3 }),
    K.edit("recherche_modifier", "emploi_recherches", [["nom", "Nom"], ["mots_cles", "Mots-clés"], ["departement", "Département(s)"], ["contrat", "Contrat (CDI, CDD…)"], ["commune", "Code commune INSEE"], ["rayon_km", "Rayon (km)"], ["depuis_jours", "Publiées depuis (jours)"], ["alternance", "Alternance seulement"], ["teletravail", "Télétravail"], ["actif", "Active"]], { delete: true, title: "Recherche", width: 620 }),
    K.list("recherches_liste", "emploi_recherches", [["Recherche", K.field("nom", "as_text")], ["Mots-clés", K.field("mots_cles", "as_text")], ["Lieu", K.field("departement", "as_text")], ["Alternance", K.field("alternance", "show")], ["État", K.field("etat", "as_text", { cls: "dzv-pill" })], ["", K.jsBtn("Chercher", "// Lance tout de suite le workflow emplois_releve.\nawait Trigger.findOne({ name: \"emplois_releve\" }).runWithoutRow({ user });\nreturn { notify: \"Recherche lancée\", reload_page: true };", { icon: "fas fa-search", style: "btn-outline-secondary" })]],
      { order: "nom", desc: false, rowClick: "`/view/recherche_modifier?id=${id}`" }),
    K.edit("candidature_modifier", "candidatures", [["entreprise", "Entreprise"], ["poste", "Poste"], ["statut", "Statut"], ["lien", "Lien de l'offre"], ["envoyee_le", "Envoyée le", "editDay"], ["relance_le", "Relancer le", "editDay"], ["contact", "Contact"], ["notes", "Notes", "textarea"]], { delete: true, title: "Candidature", width: 620 }),
    K.custom("candidatures_tableau", "DZ Tableau", "candidatures", {
      champ_colonnes: "statut", colonnes: "à envoyer,envoyée,relance,entretien,refus,offre", champ_titre: "poste", champs_infos: "entreprise,relance_le",
      tri: "relance_le", colonne_finie: "refus", max_finies: 8, vue_fiche: "candidature_modifier", vue_creation: "candidature_modifier", filtre: "",
    }, "Suivi des candidatures par statut"),
  ],
  triggers: [
    K.wf("emplois_releve", "Hourly", null, "Cherche les nouvelles offres pour tes recherches (toutes les heures)", [
      K.st("configure", "dzf_verifier", { condition: "!!(process.env.FT_CLIENT_ID && process.env.FT_CLIENT_SECRET)", si_faux: "renvoyer faux", sortie: "configure" }, { next_step: 'configure ? "chercher" : ""' }),
      K.st("chercher", "dzf_code", { code: CHERCHER, sortie: "nouvelles", delai_max: 300 }),
      K.st("ancien", "dzf_dates", { operation: "ajouter des jours", jours: -45, sortie: "limite" }),
      K.st("menage", "dzf_table_supprimer", { table: "offres_emploi", filtre: K.J({ statut: { in: ["nouvelle", "écartée"] }, date: { lt: "{{limite}}" } }), sortie: "supprimees" }),
    ]),
    K.wf("candidatures_relance_date", "Update", "candidatures", "Date d'envoi et date de relance (+10 jours) automatiques", [
      K.st("maintenant", "dzf_dates", { operation: "maintenant", sortie: "maintenant" }),
      K.st("envoi", "dzf_table_modifier", { table: "candidatures", id: "{{id}}", valeurs: K.J({ envoyee_le: "{{maintenant}}" }), sans_declencheurs: true, sortie: "e" }, { only_if: 'statut == "envoyée" && !envoyee_le' }),
      K.st("date_relance", "dzf_dates", { operation: "ajouter des jours", date: "{{envoyee_le}}", jours: 10, sortie: "relance" }),
      K.st("relance", "dzf_table_modifier", { table: "candidatures", id: "{{id}}", valeurs: K.J({ relance_le: "{{relance}}" }), sans_declencheurs: true, sortie: "r" }, { only_if: 'statut == "envoyée" && !relance_le' }),
    ]),
    K.wf("candidatures_rappel", "Daily", null, "Notification des candidatures à relancer", [
      K.st("demain", "dzf_dates", { operation: "ajouter des jours", jours: 1, format: "jour (AAAA-MM-JJ)", sortie: "demain" }),
      K.st("a_relancer", "dzf_table_chercher", { table: "candidatures", filtre: K.J({ statut: { in: ["envoyée", "relance"] }, relance_le: { lt: "{{demain}}" } }), limite: 50, sortie: "a_relancer" }),
      K.st("texte", "dzf_texte", { modele: "{{lignes}}", liste: "{{a_relancer}}", modele_ligne: "- {{item.entreprise}} — {{item.poste}}", sortie: "texte" }),
      K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "Candidature(s) à relancer", texte: "{{texte}}", lien: "/page/emploi", sortie: "notifies" }, { only_if: "a_relancer.length > 0" }),
    ]),
  ],
  seeds: {
    emploi_recherches: [
      { nom: "Data engineer", mots_cles: "data engineer", depuis_jours: 7, actif: true, alternance: false, teletravail: false },
      { nom: "DevOps / MLOps (alternance)", mots_cles: "devops,mlops", depuis_jours: 14, actif: true, alternance: true, teletravail: false },
      { nom: "Cybersécurité", mots_cles: "cybersécurité", depuis_jours: 7, actif: false, alternance: false, teletravail: false },
    ],
  },
  pages: [{
    name: "emploi", title: "Emploi", quick: { label: "Candidature", url: "/view/candidature_modifier" },
    content: [
      K.panel("Candidatures", "fas fa-paper-plane", K.view("candidatures_tableau"), { actions: K.modalBtn("Candidature", "/view/candidature_modifier") }),
      K.chips([["Nouvelles et intéressantes", ""], ["Intéressantes", "statut=intéressante", "fas fa-heart"]]),
      K.view("offres_fil"),
      K.panel("Mes recherches", "fas fa-search", K.view("recherches_liste"), { actions: K.modalBtn("Recherche", "/view/recherche_modifier") }),
    ],
  }],
  nav: [{ page: "emploi", label: "Emploi", icon: "fas fa-user-tie", group: "Travail", order: 20, keywords: "offres candidatures job alternance" }],
  quick: [{ label: "Nouvelle candidature", icon: "fas fa-paper-plane", url: "/view/candidature_modifier", keywords: "postuler job" }],
  explain: [
    ["Toutes les heures", "Le workflow « emplois_releve » (blocs Vérifier → Code qui appelle France Travail et Table : ajouter ou mettre à jour → Dates → Table : supprimer) interroge France Travail pour chaque recherche active et ajoute les nouvelles offres."],
    ["Tu tries", "Boutons de la carte : Intéressante, Écarter (disparaît), Postuler (crée une candidature « à envoyer »)."],
    ["Tu envoies", "Passe la candidature à « envoyée » : le workflow « candidatures_relance_date » (Dates → Table : modifier) note la date et prévoit une relance à +10 jours."],
    ["Le jour de la relance", "Le workflow « candidatures_rappel » (Dates → Table : chercher → Texte → Notifier) t'envoie une notification le matin."],
  ],
};
