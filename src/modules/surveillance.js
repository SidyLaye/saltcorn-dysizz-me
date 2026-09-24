"use strict";
const K = require("./_kit");

/* ce qui a changé depuis la dernière vérification, et les lignes à écrire */
const PREPARER = `// row.sites = les sites avant l'appel, row.resultats = l'appel (même ordre)
const avant = new Map((row.sites || []).map((s) => [s.id, s]));
const quand = new Date().toISOString();
const maj = [], mesures = [], evenements = [];
for (const r of row.resultats || []) {
  const s = avant.get(r.id) || {};
  maj.push({ id: r.id, etat: r.etat, ms: r.ms, code_http: r.statut, raison: r.raison || "", verifie_le: quand });
  mesures.push({ quand, site: s.nom || r.url, ms: r.ms });
  if (s.etat !== r.etat && (s.etat || r.etat !== "ok"))
    evenements.push({ quand, site: s.nom || r.url, etat: r.etat, message: s.etat ? (r.etat === "ok" ? "de nouveau en ligne" : r.etat === "lent" ? "répond lentement" + (r.raison ? " : " + r.raison : "") : "en panne" + (r.raison ? " : " + r.raison : "")) : "première vérification : " + r.etat });
}
const pannes = (row.resultats || []).filter((r) => r.etat === "panne");
return { maj, mesures, evenements, pannes, texte: pannes.map((p) => "- " + (avant.get(p.id) || {}).nom + " (" + (p.raison || "?") + ")").join("\\n") };`;

const TLS = `// row.sites et row.tls sont dans le même ordre
const maj = (row.sites || []).map((s, i) => { const c = (row.tls || [])[i] || {}; return { id: s.id, tls_jours: c.jours_restants ?? null, tls_expire_le: c.fin || null }; });
const bientot = (row.sites || []).filter((s, i) => { const c = (row.tls || [])[i] || {}; return c.jours_restants !== null && c.jours_restants !== undefined && c.jours_restants <= (s.tls_alerte_jours || 14); });
return { maj, bientot, texte: bientot.map((s) => "- " + s.nom).join("\\n") };`;

const TLS_FML = `tls_jours === null || tls_jours === undefined ? '' : tls_jours < 0 ? '<span class="dzv-meta dzv-late">certificat expiré</span>' : tls_jours <= 14 ? '<span class="dzv-meta dzv-today">certificat : ' + tls_jours + ' j</span>' : '<span class="dzv-meta">certificat : ' + tls_jours + ' j</span>'`;

module.exports = {
  key: "surveillance",
  label: "Surveillance",
  icon: "fas fa-heartbeat",
  group: "Système",
  description: "Tes sites et services surveillés toutes les 5 minutes : en ligne, lent ou en panne, temps de réponse en graphique, historique des incidents, certificats TLS qui expirent. Une seule alerte par incident, puis « rétabli ».",
  depends: [],
  setup: "<p>Ajoute tes sites (adresse complète, ex. <code>https://monsite.fr</code>). Pour un service interne (base, SMTP…), le bloc « service joignable (TCP) » de dysizz-flow peut être ajouté au workflow.</p>",
  tables: [
    {
      name: "surveillance_sites", description: "Les sites et services surveillés",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.s("url", "Adresse", { required: true, is_unique: true }),
        K.bool("actif", "Surveillé", { default: true }),
        K.s("etat", "État"),
        K.int("ms", "Temps de réponse (ms)"),
        K.int("code_http", "Code HTTP"),
        K.s("raison", "Raison"),
        K.date("verifie_le", "Vérifié le"),
        K.int("tls_jours", "Certificat : jours restants"),
        K.date("tls_expire_le", "Certificat : expire le"),
        K.int("tls_alerte_jours", "Prévenir (jours avant l'expiration du certificat)", { default: 14 }),
        K.s("note", "Note"),
      ],
    },
    { name: "surveillance_mesures", description: "Temps de réponse (gardés 30 jours)", fields: [K.date("quand", "Quand"), K.s("site", "Site"), K.int("ms", "Temps (ms)")] },
    { name: "surveillance_evenements", description: "Changements d'état (incidents, retours à la normale)", fields: [K.date("quand", "Quand"), K.s("site", "Site"), K.s("etat", "État"), K.s("message", "Message")] },
  ],
  views: [
    K.edit("site_modifier", "surveillance_sites", [["nom", "Nom"], ["url", "Adresse"], ["actif", "Surveillé"], ["tls_alerte_jours", "Prévenir (jours avant l'expiration du certificat)"], ["note", "Note", "textarea"]], { delete: true, title: "Site surveillé", width: 560 }),
    K.custom("surveillance_statut", "DZ Statut", "surveillance_sites", { champ_nom: "nom", champ_etat: "etat", champ_detail: "ms", unite: "ms", champ_date: "verifie_le", vue: "site_modifier", filtre: '{"actif":true}', texte_vide: "Ajoute un premier site à surveiller" }, "État de chaque site"),
    K.custom("surveillance_temps", "DZ Graphique", "surveillance_mesures", { champ_date: "quand", champ_valeur: "ms", calcul: "moyenne", champ_serie: "site", periode: "last7", pas: "heure", type: "courbe", format: "int", hauteur: 220, texte_vide: "Les temps de réponse apparaîtront après les premières vérifications" }, "Temps de réponse moyen par heure, un trait par site"),
    K.custom("surveillance_journal", "DZ Journal", "surveillance_evenements", { champ_date: "quand", champ_message: "message", champ_niveau: "etat", champ_source: "site", jours: 30, limite: 200, texte_vide: "Aucun incident sur 30 jours" }, "Incidents et retours à la normale"),
    K.list("sites_liste", "surveillance_sites", [
      ["Site", K.field("nom", "as_text")],
      ["Adresse", K.field("url", "as_text")],
      ["État", K.field("etat", "as_text", { cls: "dzv-pill" })],
      ["Temps", K.field("ms", "show")],
      ["Certificat", K.formula(TLS_FML, { html: true, block: false })],
      ["Surveillé", K.field("actif", "show")],
    ], { order: "nom", desc: false, rowClick: "`/view/site_modifier?id=${id}`", limit: 100, description: "Tous les sites" }),
  ],
  triggers: [
    K.wf("surveillance_verifier", "Often", null, "Toutes les ~5 min : appelle chaque site, note l'état et le temps, garde l'historique, prévient une fois par incident", [
      K.st("verrou", "dzf_verrou", { action: "prendre", nom: "me-surveillance", duree: 240, sortie: "verrou" }, { next_step: 'verrou ? "sites" : ""' }),
      K.st("sites", "dzf_table_chercher", { table: "surveillance_sites", filtre: K.J({ actif: true }), tri: "id", limite: 500, sortie: "sites" }),
      K.st("appeler", "dzf_ping_http", { cibles: "{{sites}}", lent_ms: 2000, delai_s: 10, en_parallele: 8, sortie: "resultats", delai_max: 120 }, { only_if: "sites.length > 0" }),
      K.st("preparer", "dzf_code", { code: PREPARER, sortie: "p" }, { only_if: "sites.length > 0" }),
      K.st("ranger", "dzf_table_upsert", { table: "surveillance_sites", liste: "{{p.maj}}", cle: "id", mettre_a_jour: "etat,ms,code_http,raison,verifie_le", sans_declencheurs: true, sortie: "bilan" }, { only_if: "sites.length > 0" }),
      K.st("mesures", "dzf_table_ajouter", { table: "surveillance_mesures", liste: "{{p.mesures}}", sans_declencheurs: true, sortie: "mesures" }, { only_if: "sites.length > 0" }),
      K.st("evenements", "dzf_table_ajouter", { table: "surveillance_evenements", liste: "{{p.evenements}}", sortie: "evenements" }, { only_if: "sites.length > 0 && p.evenements.length > 0" }),
      K.st("alerte", "dzf_alerte", { cle: "me-sites", probleme: "{{p.pannes}}", silence_min: 60, sortie: "alerte" }, { only_if: "sites.length > 0" }),
      K.st("prevenir", "dzf_notifier", { qui: "administrateurs", titre: "Surveillance : {{alerte.etat}}", texte: "{{p.texte}}", lien: "/page/surveillance", sortie: "notifies" }, { only_if: "sites.length > 0 && alerte.envoyer" }),
      K.st("liberer", "dzf_verrou", { action: "libérer", nom: "me-surveillance", sortie: "verrou_libre" }),
    ], { appeler: ["lent_ms", "delai_s"], alerte: ["silence_min"] }),
    K.wf("surveillance_certificats", "Daily", null, "Chaque jour : vérifie le certificat TLS de chaque site en https et prévient avant qu'il expire", [
      K.st("sites", "dzf_table_chercher", { table: "surveillance_sites", filtre: K.J({ actif: true, url: { ilike: "https://" } }), tri: "id", limite: 500, sortie: "sites" }),
      K.st("tls", "dzf_certificat_tls", { hotes: "{{sites}}", port: 443, sortie: "tls", delai_max: 180, si_erreur: "continuer" }, { only_if: "sites.length > 0" }),
      K.st("preparer", "dzf_code", { code: TLS, sortie: "c" }, { only_if: "sites.length > 0 && tls" }),
      K.st("ranger", "dzf_table_upsert", { table: "surveillance_sites", liste: "{{c.maj}}", cle: "id", mettre_a_jour: "tls_jours,tls_expire_le", sans_declencheurs: true, sortie: "bilan" }, { only_if: "sites.length > 0 && tls" }),
      K.st("prevenir", "dzf_notifier", { qui: "administrateurs", titre: "Certificat(s) bientôt expiré(s)", texte: "{{c.texte}}", lien: "/page/surveillance", sortie: "notifies" }, { only_if: "sites.length > 0 && tls && c.bientot.length > 0" }),
    ]),
    K.wf("surveillance_menage", "Weekly", null, "Chaque semaine : garde 30 jours de temps de réponse et 180 jours d'incidents", [
      K.st("mesures", "dzf_nettoyer", { table: "surveillance_mesures", champ_date: "quand", jours: 30, sortie: "mesures_supprimees" }),
      K.st("evenements", "dzf_nettoyer", { table: "surveillance_evenements", champ_date: "quand", jours: 180, sortie: "evenements_supprimes" }),
    ]),
  ],
  seedMerge: { surveillance_sites: "url" },
  seeds: {
    surveillance_sites: [{ nom: "AMBS Agency", url: "https://ambs-agency.com", actif: true, tls_alerte_jours: 14 }],
  },
  pages: [{
    name: "surveillance", title: "Surveillance", quick: { label: "Site", url: "/view/site_modifier" },
    content: [
      K.view("surveillance_statut"),
      K.grid("dzv-grid-2",
        K.panel("Temps de réponse", "fas fa-chart-line", K.view("surveillance_temps")),
        K.panel("Incidents", "fas fa-stream", K.view("surveillance_journal"))),
      K.panel("Tous les sites", "fas fa-list", K.view("sites_liste"), { actions: K.modalBtn("Ajouter", "/view/site_modifier") }),
    ],
  }],
  nav: [{ page: "surveillance", label: "Surveillance", icon: "fas fa-heartbeat", group: "Système", order: 10, keywords: "sites uptime panne serveur monitoring certificat tls" }],
  quick: [{ label: "Surveiller un site", icon: "fas fa-heartbeat", url: "/view/site_modifier", keywords: "uptime monitoring" }],
  explain: [
    ["Toutes les 5 minutes", "Le workflow « surveillance_verifier » : Verrou (une seule exécution à la fois) → Table : chercher les sites → Surveillance : site en ligne ? (en parallèle) → Code (ce qui a changé) → Table : ajouter ou mettre à jour → Table : ajouter (mesures, incidents) → Alerte (sans spam) → Notifier."],
    ["Une seule alerte", "Le bloc « Alerte (sans spam) » ne prévient qu'une fois par heure tant que la panne dure, puis une fois quand tout est rétabli."],
    ["Le graphique", "Vue « surveillance_temps » (DZ Graphique) : moyenne par heure des temps de la table surveillance_mesures, un trait par site. Le regroupement est fait par la base."],
    ["Les certificats", "Le workflow « surveillance_certificats » (chaque jour) lit le certificat TLS de chaque site en https, range le nombre de jours restants et prévient avant l'expiration."],
    ["Le ménage", "« surveillance_menage » (chaque semaine) garde 30 jours de mesures et 180 jours d'incidents, pour que les tables restent légères."],
  ],
};
