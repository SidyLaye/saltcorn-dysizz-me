"use strict";
const K = require("./_kit");

const TYPES = ["http", "api", "tcp", "dns", "dns_change", "tls", "domaine", "contenu", "liste_noire", "mail", "prometheus", "battement", "securite"];
const TYPE_AIDE = {
  http: "Site ou page : code HTTP, temps de réponse, texte attendu (champ « Attendu »)",
  api: "Scénario d'API en plusieurs appels, avec vérifications (JSON dans « Attendu »)",
  tcp: "Service joignable sur un port (base, SMTP, SSH…) : cible = serveur, port",
  dns: "Le domaine pointe bien vers « Attendu » (ex. l'IP de ton serveur)",
  dns_change: "Prévient si les enregistrements DNS changent (détournement, erreur)",
  tls: "Certificat : jours restants (seuil = jours avant alerte)",
  domaine: "Expiration du nom de domaine (seuil = jours avant alerte)",
  contenu: "La page a changé (défiguration, prix, CGU…) ; « Attendu » = repère de début",
  liste_noire: "IP ou domaine sur une liste noire anti-spam",
  mail: "SPF, DMARC, MX du domaine",
  prometheus: "Valeur d'une métrique (« Attendu » = requête PromQL, seuil = maximum)",
  battement: "Une tâche cron doit appeler son adresse de battement ; seuil = minutes max sans nouvelles",
  securite: "Note de sécurité A à F (en-têtes, TLS, ports, mail, liste noire), 1 fois par jour",
};

/* toute la vérification : quelles sondes sont dues, quel bloc pour quel type,
   mesures, incidents ouverts / fermés, alertes (une seule par incident) */
const VERIFIER = `// Sondes dues (selon leur intervalle), vérifiées 6 par 6 avec le bon bloc dysizz-flow.
const S = Table.findOne({ name: "surveillance_sites" });
const M = Table.findOne({ name: "surveillance_mesures" });
const E = Table.findOne({ name: "surveillance_evenements" });
const now = Date.now();
const sondes = (await S.getRows({ actif: true })).filter((s) => !s.verifie_le || now - new Date(s.verifie_le) >= Math.max(1, s.intervalle_min || 5) * 60e3 - 45e3);
const host = (u) => String(u || "").replace(/^https?:\\/\\//, "").replace(/[\\/:].*$/, "");
const one = async (s) => {
  const t0 = Date.now();
  const r = async (bloc, cfg) => { const o = await Actions[bloc]({ ...cfg, sortie: "r", si_erreur: "continuer" }); if (o.r_erreur) throw new Error(o.r_erreur); return o.r; };
  try {
    switch (s.type || "http") {
      case "http": { const x = await r("dzf_ping_http", { cibles: s.url, contient: s.attendu || "", lent_ms: s.seuil || 2000, delai_s: 15 }); return { etat: x.etat, ms: x.ms, code_http: x.statut, raison: x.raison }; }
      case "api": { const x = await r("dzf_api_scenario", { etapes: s.attendu || "[]" }); return { etat: x.etat, ms: x.ms, raison: x.raison, details: x.etapes }; }
      case "tcp": { const x = await r("dzf_port_ouvert", { hote: host(s.url), port: s.port || 443, delai_ms: 5000 }); return { etat: x.ok ? (s.seuil && x.ms > s.seuil ? "lent" : "ok") : "panne", ms: x.ms, raison: x.raison }; }
      case "dns": { const x = await r("dzf_dns", { domaine: host(s.url), type: "A", attendu: s.attendu || "" }); return { etat: x.ok ? "ok" : "panne", raison: x.ok ? "" : "attendu " + s.attendu + ", trouvé " + x.valeurs.join(", "), details: x.valeurs }; }
      case "dns_change": { const x = await r("dzf_dns_changement", { domaine: host(s.url) }); return { etat: x.etat, raison: x.raison, details: x.enregistrements }; }
      case "tls": { const x = await r("dzf_certificat_tls", { hotes: host(s.url), port: s.port || 443 }); const j = x.jours_restants; return { etat: j === null ? "panne" : j < 0 || x.valide === false ? "panne" : j <= (s.seuil || 14) ? "lent" : "ok", raison: j === null ? x.erreur : j + " jour(s) restant(s)" + (x.valide === false ? " · invalide" : ""), tls_jours: j, tls_expire_le: x.fin || null }; }
      case "domaine": { const x = await r("dzf_domaine_expiration", { domaine: host(s.url), alerte_jours: s.seuil || 30 }); return { etat: x.etat === "inconnu" ? "lent" : x.etat, raison: x.jours_restants === null ? "date inconnue" : "expire dans " + x.jours_restants + " j (" + (x.registrar || "?") + ")" }; }
      case "contenu": { const x = await r("dzf_contenu_change", { url: s.url, debut: s.attendu || "" }); return { etat: x.etat, raison: x.change ? "modifiée : " + x.apercu : x.premiere_fois ? "première lecture" : "" }; }
      case "liste_noire": { const x = await r("dzf_liste_noire", { cible: host(s.url) }); return { etat: x.etat, raison: x.raison, details: x.details }; }
      case "mail": { const x = await r("dzf_dns_mail", { domaine: host(s.url) }); return { etat: x.ok ? "ok" : "lent", raison: (x.conseils || []).join(" ; "), details: { spf: x.spf, dmarc: x.dmarc, mx: x.mx } }; }
      case "prometheus": { const x = await r("dzf_prometheus", { url: s.url, requete: s.attendu || "up", max: s.seuil === null || s.seuil === undefined ? "" : s.seuil }); return { etat: x.etat, raison: x.raison || "valeur " + x.valeur, ms: Math.round(x.valeur) }; }
      case "battement": { const age = s.dernier_ok ? (now - new Date(s.dernier_ok)) / 60e3 : null; return { etat: age === null ? "lent" : age > (s.seuil || 60) ? "panne" : "ok", raison: age === null ? "jamais reçu" : "dernier signal il y a " + Math.round(age) + " min", keep_ok: true }; }
      case "securite": { const x = await r("dzf_note_securite", { url: s.url }); return { etat: x.etat, raison: "note " + x.note + " (" + x.score + "/100)" + (x.a_corriger.length ? " · " + x.a_corriger.slice(0, 2).join(" ; ") : ""), note_secu: x.note, score: x.score, details: x.a_corriger }; }
      default: return { etat: "panne", raison: "type inconnu : " + s.type };
    }
  } catch (e) { return { etat: "panne", raison: String(e.message || e).slice(0, 300), ms: Date.now() - t0 }; }
};
const alertes = [];
for (let i = 0; i < sondes.length; i += 6) {
  await Promise.all(sondes.slice(i, i + 6).map(async (s) => {
    const x = await one(s);
    const quand = new Date();
    const maj = { etat: x.etat, raison: String(x.raison || "").slice(0, 500), verifie_le: quand };
    if (x.ms !== undefined) maj.ms = x.ms;
    if (x.code_http !== undefined) maj.code_http = x.code_http;
    for (const k of ["tls_jours", "tls_expire_le", "note_secu", "score"]) if (x[k] !== undefined) maj[k] = x[k];
    if (x.details !== undefined) maj.details = JSON.stringify(x.details).slice(0, 8000);
    if (x.etat === "ok" && !x.keep_ok) maj.dernier_ok = quand;
    if (s.type === "battement" && !s.jeton) maj.jeton = [...Array(24)].map(() => "abcdefghijkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 32)]).join("");
    await S.updateRow(maj, s.id, undefined, true);
    await M.insertRow({ quand, site: s.nom, sonde: s.id, ms: x.ms ?? null, ok: x.etat !== "panne" }, undefined, undefined, true);
    /* incident : ouvert à la panne, fermé au retour */
    const ouvert = await E.getRow({ sonde: s.id, ouvert: true });
    if (x.etat === "panne" && !ouvert) await E.insertRow({ quand, debut: quand, site: s.nom, sonde: s.id, etat: "panne", ouvert: true, message: "En panne : " + (x.raison || "?") });
    if (x.etat !== "panne" && ouvert) await E.updateRow({ ouvert: false, fin: quand, duree_min: Math.round((quand - new Date(ouvert.debut || ouvert.quand)) / 60e3), etat: "ok", message: ouvert.message + " → rétabli" }, ouvert.id);
    if (x.etat === "lent" && s.etat !== "lent" && s.etat) await E.insertRow({ quand, debut: quand, fin: quand, site: s.nom, sonde: s.id, etat: "lent", ouvert: false, message: "Attention : " + (x.raison || "") });
    const a = await Actions.dzf_alerte({ cle: "sonde-" + s.id, probleme: x.etat === "panne", silence_min: 60, sortie: "a" });
    if (a.a && a.a.envoyer) alertes.push((a.a.etat === "rétabli" ? "✅ " : "🔴 ") + s.nom + " : " + a.a.etat + (x.raison && a.a.etat !== "rétabli" ? " (" + x.raison + ")" : a.a.duree_min ? " après " + a.a.duree_min + " min" : ""));
  }));
}
return { verifiees: sondes.length, alertes, texte: alertes.join("\\n") };`;

/* disponibilité sur 24 h, 7 j et 30 j, calculée par la base */
const DISPO = `// Pourcentage de vérifications réussies par sonde, sur 24 h, 7 jours et 30 jours.
const S = Table.findOne({ name: "surveillance_sites" });
const M = Table.findOne({ name: "surveillance_mesures" });
const pct = async (id, h) => { const r = await M.aggregationQuery({ n: { field: "id", aggregate: "Count" } }, { where: { sonde: id, quand: { gt: new Date(Date.now() - h * 3600e3) } } }); const k = await M.aggregationQuery({ n: { field: "id", aggregate: "Count" } }, { where: { sonde: id, ok: true, quand: { gt: new Date(Date.now() - h * 3600e3) } } }); return r && Number(r.n) ? Math.round((1000 * Number(k.n)) / Number(r.n)) / 10 : null; };
for (const s of await S.getRows({ actif: true })) await S.updateRow({ dispo_24h: await pct(s.id, 24), dispo_7j: await pct(s.id, 168), dispo_30j: await pct(s.id, 720) }, s.id, undefined, true);
return true;`;

const ETAT_TILE = "etat";
const LIEN_BATTEMENT = `type === 'battement' ? (jeton ? '<div class="dzv-meta"><i class="fas fa-heartbeat"></i> Adresse à appeler par ta tâche : <code>/dysizz-me/battement/' + String(jeton).replace(/[^a-z0-9]/g, '') + '</code></div>' : '<div class="dzv-meta">L\\'adresse de battement apparaît après la première vérification</div>') : ''`;

module.exports = {
  key: "surveillance",
  label: "Surveillance",
  icon: "fas fa-heartbeat",
  group: "Système",
  description: "Tes sites, API, serveurs et domaines surveillés en profondeur : 13 types de sondes (site, scénario d'API, port, DNS et ses changements, certificat, expiration du domaine, contenu modifié, liste noire, mail, Prometheus, battement de tâches cron, note de sécurité A-F), incidents avec durée, disponibilité 24 h / 7 j / 30 j, page de statut publique, alertes sans spam par notification, ntfy ou Telegram.",
  depends: [],
  setup: "<p>Ajoute des sondes dans la page Surveillance. Pour recevoir les alertes sur ton téléphone : <a href=\"/dysizz-me/reglages/surveillance\">Régler Surveillance</a> (ntfy ou Telegram).</p>",
  settings: {
    intro: "Les alertes arrivent toujours en notification dans Saltcorn. Tu peux aussi les recevoir sur ton téléphone : <b>ntfy</b> (application gratuite, sans compte : choisis un nom de sujet difficile à deviner) ou <b>Telegram</b> (crée un bot avec @BotFather, puis donne son jeton et ton identifiant de discussion).",
    fields: [
      { name: "ntfy_sujet", label: "ntfy · sujet", type: "text", placeholder: "ex. sidy-alertes-7f3k9", help: "Installe l'appli ntfy et abonne-toi à ce sujet. Vide = pas de ntfy." },
      { name: "ntfy_serveur", label: "ntfy · serveur", type: "text", default: "https://ntfy.sh", help: "Ton propre serveur ntfy si tu en as un." },
      { name: "telegram_chat", label: "Telegram · identifiant de discussion", type: "text", help: "Vide = pas de Telegram. Ton identifiant : écris à @userinfobot." },
      { name: "telegram_jeton", label: "Telegram · jeton du bot", type: "password", secret: "TELEGRAM_BOT_TOKEN" },
      { name: "page_publique", label: "Page de statut publique (/page/statut) visible sans connexion", type: "bool" },
    ],
    apply: [
      { trigger: "surveillance_verifier", step: "ntfy", set: { sujet: (v) => v.ntfy_sujet || "", serveur: (v) => v.ntfy_serveur || "https://ntfy.sh" } },
      { trigger: "surveillance_verifier", step: "telegram", set: { chat_id: (v) => v.telegram_chat || "" } },
    ],
    pageRoles: { statut: (v) => (v.page_publique ? 100 : 80) },
    test: { action: "dzf_ntfy", config: (v) => ({ serveur: v.ntfy_serveur || "https://ntfy.sh", sujet: v.ntfy_sujet, titre: "Test Surveillance", texte: "Si tu lis ceci, les alertes arrivent bien." }), ok: () => "Message de test envoyé sur ntfy." },
  },
  tables: [
    {
      name: "surveillance_sites", description: "Les sondes : sites, API, serveurs, domaines…",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.opts("type", "Type de sonde", TYPES),
        K.s("url", "Cible (adresse, domaine ou IP)", { required: true, is_unique: false }),
        K.int("port", "Port"), K.s("attendu", "Attendu / réglage"), K.int("seuil", "Seuil"), K.int("intervalle_min", "Toutes les (minutes)", { default: 5 }),
        K.s("groupe", "Groupe"), K.bool("publique", "Sur la page de statut"),
        K.bool("actif", "Surveillé", { default: true }),
        K.s("etat", "État"), K.int("ms", "Temps / valeur"), K.int("code_http", "Code HTTP"), K.s("raison", "Raison"),
        K.date("verifie_le", "Vérifié le"), K.date("dernier_ok", "Dernier OK"), K.s("jeton", "Jeton de battement"),
        K.int("tls_jours", "Certificat : jours restants"), K.date("tls_expire_le", "Certificat : expire le"), K.int("tls_alerte_jours", "Prévenir (jours avant l'expiration du certificat)", { default: 14 }),
        K.s("note_secu", "Note de sécurité"), K.int("score", "Score de sécurité"),
        K.num("dispo_24h", "Dispo 24 h (%)"), K.num("dispo_7j", "Dispo 7 j (%)"), K.num("dispo_30j", "Dispo 30 j (%)"),
        K.s("details", "Détails (JSON)"), K.s("note", "Note"),
      ],
    },
    { name: "surveillance_mesures", description: "Chaque vérification (gardées 90 jours)", fields: [K.date("quand", "Quand"), K.s("site", "Sonde"), K.int("sonde", "Id de la sonde"), K.int("ms", "Temps (ms)"), K.bool("ok", "OK")] },
    { name: "surveillance_evenements", description: "Incidents : début, fin, durée", fields: [K.date("quand", "Quand"), K.s("site", "Sonde"), K.int("sonde", "Id de la sonde"), K.s("etat", "État"), K.s("message", "Message"), K.date("debut", "Début"), K.date("fin", "Fin"), K.int("duree_min", "Durée (min)"), K.bool("ouvert", "En cours")] },
  ],
  views: [
    K.edit("site_modifier", "surveillance_sites", [["nom", "Nom"], ["type", "Type de sonde"], ["url", "Cible (adresse, domaine ou IP)"], ["port", "Port (tcp, tls)"], ["attendu", "Attendu / réglage", "textarea"], ["seuil", "Seuil (ms, jours, minutes ou valeur max selon le type)"], ["intervalle_min", "Vérifier toutes les (minutes)"], ["groupe", "Groupe"], ["publique", "Afficher sur la page de statut"], ["actif", "Surveillé"], ["note", "Note", "textarea"]], { delete: true, title: "Sonde", width: 640 }),
    K.show("sonde_fiche", "surveillance_sites", K.box("dzv-mail",
      K.box("dzv-mail-head", K.box("dzv-mail-title", K.field("nom", "as_text")), K.meta(K.field("type", "as_text"), K.field("url", "as_text"), K.field("etat", "as_text"), K.dateFr("verifie_le", { time: true })),
        K.box("dzv-tile-actions", K.modalLink("site_modifier", "Modifier"))),
      K.box("dzv-kv", K.meta(K.text("Dispo 24 h"), K.field("dispo_24h", "show"), K.text("7 j"), K.field("dispo_7j", "show"), K.text("30 j"), K.field("dispo_30j", "show"))),
      K.field("raison", "as_text", { block: true }),
      K.formula(LIEN_BATTEMENT, { html: true }),
      K.formula("note_secu ? '<div class=\"dzv-meta\">Note de sécurité : <b>' + String(note_secu).replace(/[^A-F]/g, '') + '</b> (' + (score || 0) + '/100)</div>' : ''", { html: true }),
      K.formula("details ? '<pre class=\"dzv-code-small\">' + String(details).replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 4000) + '</pre>' : ''", { html: true })), { title: "Sonde", width: 760 }),
    K.custom("surveillance_statut", "DZ Statut", "surveillance_sites", { champ_nom: "nom", champ_etat: ETAT_TILE, champ_detail: "raison", champ_date: "verifie_le", vue: "sonde_fiche", filtre: '{"actif":true}', texte_vide: "Ajoute une première sonde" }, "État de chaque sonde"),
    K.custom("surveillance_dispo", "DZ Disponibilité", "surveillance_mesures", { champ_date: "quand", champ_ok: "ok", champ_groupe: "site", jours: 30, texte_vide: "La disponibilité apparaît après les premières vérifications" }, "Disponibilité jour par jour sur 30 jours"),
    K.custom("statut_public", "DZ Disponibilité", "surveillance_mesures", { champ_date: "quand", champ_ok: "ok", champ_groupe: "site", jours: 90, groupes_table: "surveillance_sites", groupes_champ: "nom", groupes_filtre: '{"publique":true}', texte_vide: "Pas encore de données" }, "Page de statut : 90 jours"),
    K.custom("surveillance_temps", "DZ Graphique", "surveillance_mesures", { champ_date: "quand", champ_valeur: "ms", calcul: "moyenne", champ_serie: "site", periode: "last7", pas: "heure", type: "courbe", format: "int", hauteur: 220, filtre: '{"ok":true}', texte_vide: "Les temps de réponse apparaîtront après les premières vérifications" }, "Temps de réponse moyen par heure"),
    K.custom("surveillance_journal", "DZ Journal", "surveillance_evenements", { champ_date: "quand", champ_message: "message", champ_niveau: "etat", champ_source: "site", champ_detail: "duree_min", unite: "min", jours: 30, limite: 200, texte_vide: "Aucun incident sur 30 jours" }, "Incidents et retours à la normale"),
    K.list("sites_liste", "surveillance_sites", [
      ["Sonde", K.field("nom", "as_text")], ["Type", K.field("type", "as_text")], ["Cible", K.field("url", "as_text")],
      ["État", K.field("etat", "as_text")], ["24 h", K.field("dispo_24h", "show")], ["30 j", K.field("dispo_30j", "show")], ["Sécu", K.field("note_secu", "as_text")],
    ], { order: "nom", desc: false, rowClick: "`/view/sonde_fiche?id=${id}`", limit: 200, description: "Toutes les sondes" }),
  ],
  triggers: [
    K.wf("surveillance_verifier", "Often", null, "Toutes les ~5 min : vérifie les sondes dues, note mesures et incidents, prévient une fois par incident (notification, ntfy, Telegram)", [
      K.st("verrou", "dzf_verrou", { action: "prendre", nom: "me-surveillance", duree: 280, sortie: "verrou" }, { next_step: 'verrou ? "verifier" : ""' }),
      K.st("verifier", "dzf_code", { code: VERIFIER, sortie: "v", delai_max: 270 }),
      K.st("prevenir", "dzf_notifier", { qui: "administrateurs", titre: "Surveillance", texte: "{{v.texte}}", lien: "/page/surveillance", sortie: "notifies" }, { only_if: "v && v.alertes.length > 0" }),
      K.st("ntfy", "dzf_ntfy", { serveur: "https://ntfy.sh", sujet: "", titre: "Surveillance", texte: "{{v.texte}}", priorite: "high", si_erreur: "continuer", sortie: "ntfy" }, { only_if: "v && v.alertes.length > 0" }),
      K.st("telegram", "dzf_telegram", { variable_jeton: "TELEGRAM_BOT_TOKEN", chat_id: "", texte: "Surveillance\n{{v.texte}}", si_erreur: "continuer", sortie: "tg" }, { only_if: "v && v.alertes.length > 0" }),
      K.st("liberer", "dzf_verrou", { action: "libérer", nom: "me-surveillance", sortie: "verrou_libre" }),
    ], { ntfy: ["sujet", "serveur"], telegram: ["chat_id"] }),
    K.wf("surveillance_dispo", "Hourly", null, "Chaque heure : disponibilité de chaque sonde sur 24 h, 7 j et 30 j", [
      K.st("calcul", "dzf_code", { code: DISPO, sortie: "dispo", delai_max: 120 }),
    ]),
    K.wf("surveillance_menage", "Weekly", null, "Chaque semaine : garde 90 jours de mesures et un an d'incidents", [
      K.st("mesures", "dzf_nettoyer", { table: "surveillance_mesures", champ_date: "quand", jours: 90, sortie: "mesures_supprimees" }),
      K.st("evenements", "dzf_nettoyer", { table: "surveillance_evenements", champ_date: "quand", jours: 365, sortie: "evenements_supprimes" }),
    ]),
  ],
  seedMerge: { surveillance_sites: "nom" },
  seeds: {
    surveillance_sites: [
      { nom: "AMBS Agency", type: "http", url: "https://ambs-agency.com", actif: true, intervalle_min: 5, seuil: 2000, groupe: "Sites", publique: false },
      { nom: "AMBS · domaine", type: "domaine", url: "ambs-agency.com", actif: true, intervalle_min: 1440, seuil: 30, groupe: "Domaines", publique: false },
      { nom: "AMBS · mail (SPF/DMARC)", type: "mail", url: "ambs-agency.com", actif: true, intervalle_min: 1440, groupe: "Domaines", publique: false },
      { nom: "AMBS · sécurité", type: "securite", url: "https://ambs-agency.com", actif: true, intervalle_min: 1440, groupe: "Sécurité", publique: false },
    ],
  },
  pages: [
    {
      name: "surveillance", title: "Surveillance", quick: { label: "Sonde", url: "/view/site_modifier" },
      content: [
        K.view("surveillance_statut"),
        K.panel("Disponibilité sur 30 jours", "fas fa-signal", K.view("surveillance_dispo")),
        K.grid("dzv-grid-2",
          K.panel("Temps de réponse", "fas fa-chart-line", K.view("surveillance_temps")),
          K.panel("Incidents", "fas fa-stream", K.view("surveillance_journal"))),
        K.panel("Toutes les sondes", "fas fa-list", K.view("sites_liste"), { actions: `${K.modalBtn("Ajouter", "/view/site_modifier")}<a class="dz-btn dz-btn-sm dz-btn-ghost" href="/page/statut" target="_blank"><i class="fas fa-external-link-alt"></i>Page de statut</a>` }),
        K.text(`<details class="dzv-panel dzv-help"><summary><i class="fas fa-question-circle"></i> Les 13 types de sondes</summary><ul>${Object.entries(TYPE_AIDE).map(([k, v]) => `<li><code>${k}</code> — ${v}</li>`).join("")}</ul></details>`),
      ],
    },
    {
      name: "statut", title: "Statut des services", shell: false, min_role: 80,
      content: [K.text('<div class="dzv-statuspage"><h1>Statut des services</h1><p class="dzv-muted">Disponibilité des 90 derniers jours.</p></div>'), K.view("statut_public")],
    },
  ],
  nav: [{ page: "surveillance", label: "Surveillance", icon: "fas fa-heartbeat", group: "Système", order: 10, keywords: "sites uptime panne serveur monitoring certificat tls domaine sécurité api" }],
  quick: [{ label: "Nouvelle sonde", icon: "fas fa-heartbeat", url: "/view/site_modifier", keywords: "uptime monitoring surveiller" }],
  explain: [
    ["Toutes les 5 minutes", "Le workflow « surveillance_verifier » prend les sondes dues (chacune a son intervalle), appelle pour chacune le bon bloc dysizz-flow (site, scénario d'API, port, DNS, certificat, domaine, contenu, liste noire, mail, Prometheus, battement, note de sécurité), 6 à la fois."],
    ["Incidents", "Une panne ouvre un incident dans « surveillance_evenements » ; le retour à la normale le ferme avec sa durée."],
    ["Une seule alerte", "Le bloc « Alerte (sans spam) » par sonde : une alerte à la panne, un rappel toutes les heures au plus, puis « rétabli ». Envoyée en notification, et sur ntfy / Telegram si réglés."],
    ["Disponibilité", "« surveillance_dispo » calcule chaque heure le % de vérifications réussies sur 24 h, 7 j et 30 j ; la vue DZ Disponibilité dessine une barre par jour."],
    ["Battement", "Pour une tâche cron : crée une sonde de type battement, puis fais appeler par ta tâche l'adresse affichée (curl). Sans nouvelles depuis « seuil » minutes : panne."],
    ["Page de statut", "/page/statut montre les sondes marquées « page de statut ». Elle devient publique si tu le coches dans Régler Surveillance."],
  ],
};
