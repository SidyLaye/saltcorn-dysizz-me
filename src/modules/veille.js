"use strict";
const K = require("./_kit");

const THEMES = ["dev", "cyber", "ia", "devops", "mlops", "cloud", "réseau", "systèmes", "data", "tech fr", "actus france", "actus sénégal"];

/* bascule d'un champ oui/non sans recharger la page : la carte change de classe */
const toggle = (field, label, icon, cls) => K.jsBtn(label, `// Bascule « ${field} » et met à jour la carte sans recharger la page.
await table.updateRow({ ${field}: !row.${field} }, row.id, user);
return { eval_js: "var c=document.getElementById('art-" + row.id + "');if(c)c.classList.toggle('${cls}'," + !row.${field} + ")" };`, { icon, style: "btn-link", cls: `dzv-tg dzv-tg-${field}` });

const SRC = (s) => ({ ...s, actif: true, etat: "", erreur: "" });
const site = (nom, url, theme) => SRC({ nom, type: "site", url, theme });

/* image de l'article, ou une vignette de couleur avec l'initiale de la source quand il n'y en a pas */
const THEME_ICON = { dev: "fa-code", cyber: "fa-shield-alt", ia: "fa-brain", devops: "fa-infinity", mlops: "fa-project-diagram", cloud: "fa-cloud", "réseau": "fa-network-wired", "systèmes": "fa-server", data: "fa-database", "tech fr": "fa-laptop-code", "actus france": "fa-newspaper", "actus sénégal": "fa-globe-africa" };
const IMG_FML = (cls) => `(image && /^https?:/.test(image)) ? '<div class="${cls}"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="' + String(image).replace(/"/g, '%22').replace(/</g, '%3C') + '" onerror="this.parentNode.classList.add(\\'dzv-noimg\\');this.remove()"></div>' : '<div class="${cls} dzv-noimg"><i class="fas ' + (${JSON.stringify(THEME_ICON)}[theme] || 'fa-rss') + '"></i></div>'`;
const card = (extraTop = []) => K.box("`dzv-article${lu ? ' dzv-read' : ''}${favori ? ' dzv-fav' : ''}${plus_tard ? ' dzv-later' : ''}`", K.O({ clsFormula: true, id: "`art-${id}`" }),
  ...extraTop,
  K.box("dzv-article-in",
    K.box("dzv-article-src", ...K.spans(K.join("source.nom", "as_text"), K.dateFr("date"), K.field("theme", "as_text"))),
    K.link("titre", "url", { cls: "dzv-article-title", block: true }),
    K.field("resume", "as_text", { cls: "dzv-article-sum", block: true })),
  K.box("dzv-tile-actions", toggle("lu", "Lu", "fas fa-check", "dzv-read"), toggle("favori", "Favori", "fas fa-star", "dzv-fav"), toggle("plus_tard", "Plus tard", "far fa-clock", "dzv-later")));

const ETAT_SOURCES = `// Note l'état de chaque source lue (ok / erreur) et garde les identifiants YouTube trouvés.
const S = Table.findOne({ name: "veille_sources" });
const erreurs = new Map((row.articles_erreurs || []).map((e) => [String(e.source), e.erreur]));
for (const c of row.articles_chaines || []) await S.updateRow({ youtube_id: c.youtube_id }, c.source, undefined, true);
for (const s of row.sources || []) {
  const err = erreurs.get(String(s.id));
  await S.updateRow({ derniere_synchro: new Date(), etat: err ? "erreur" : "ok", erreur: err ? String(err).slice(0, 300) : "" }, s.id, undefined, true);
}
return erreurs.size;`;

const RELIRE = `// Lance tout de suite le workflow veille_releve.
await Trigger.findOne({ name: "veille_releve" }).runWithoutRow({ user });
return { notify: "Relecture lancée", reload_page: true };`;

module.exports = {
  key: "veille",
  label: "Veille tech",
  icon: "fas fa-satellite-dish",
  group: "Veille",
  description: "Les nouveautés dev, cyber (dont alertes CERT-FR), IA, DevOps, MLOps, cloud, réseau et systèmes, lues toutes les heures depuis des flux RSS que tu choisis. Lu, favori, à lire plus tard.",
  depends: [],
  tables: [
    {
      name: "veille_sources", description: "Les sites et chaînes suivis",
      fields: [
        K.s("nom", "Nom", { required: true }),
        K.opts("type", "Type", ["site", "youtube"]),
        K.s("url", "Adresse du flux RSS / Atom", { description: "Pour YouTube : laisse vide et remplis la chaîne" }),
        K.s("chaine", "Chaîne YouTube", { description: "@nom de la chaîne ou lien vers la chaîne" }),
        K.s("youtube_id", "Identifiant de chaîne (trouvé automatiquement)"),
        K.opts("theme", "Thème", THEMES),
        K.bool("actif", "Suivie", { default: true }),
        K.date("derniere_synchro", "Dernière lecture"),
        K.s("etat", "État"), K.s("erreur", "Erreur"), K.int("nb_derniers", "Éléments dans le flux"),
      ],
    },
    {
      name: "veille_articles", description: "Articles et vidéos récupérés",
      fields: [
        K.key("source", "Source", "veille_sources", "nom"),
        K.s("titre", "Titre"), K.s("url", "Lien", { unique: true }), K.date("date", "Publié le"), K.s("resume", "Résumé"),
        K.s("image", "Image"), K.s("auteur", "Auteur"), K.opts("theme", "Thème", THEMES), K.opts("type", "Type", ["article", "vidéo"]),
        K.s("video_id", "Vidéo YouTube"), K.bool("lu", "Lu"), K.bool("favori", "Favori"), K.bool("plus_tard", "Plus tard"), K.date("ajoute_le", "Ajouté le"),
      ],
    },
  ],
  views: [
    K.show("article_carte", "veille_articles", card([K.formula(IMG_FML("dzv-article-img"), { html: true })]), { description: "Carte d'un article" }),
    K.feed("veille_fil", "veille_articles", "article_carte", { include: 'type == "article" && theme != "actus france" && theme != "actus sénégal"', order: "date", desc: true, limit: 30, md: 2, lg: 3 }),
    K.edit("source_modifier", "veille_sources", [["nom", "Nom"], ["type", "Type"], ["theme", "Thème"], ["url", "Adresse du flux (site)"], ["chaine", "Chaîne YouTube (@nom)"], ["actif", "Suivie"]], { delete: true, title: "Source", width: 620 }),
    K.list("sources_liste", "veille_sources", [
      ["Source", K.field("nom", "as_text")], ["Type", K.field("type", "as_text")], ["Thème", K.field("theme", "as_text", { cls: "dzv-pill" })],
      ["État", K.field("etat", "as_text", { cls: "dzv-pill" })], ["Erreur", K.field("erreur", "ellipsize", { cfg: { nchars: 60 } })], ["Lue", K.dateFr("derniere_synchro", { time: true })],
    ], { order: "theme", desc: false, rowClick: "`/view/source_modifier?id=${id}`", limit: 200, description: "Sources suivies et leur état" }),
  ],
  triggers: [
    K.wf("veille_releve", "Hourly", null, "Lit toutes les sources actives (sites et chaînes YouTube), toutes les heures", [
      K.st("verrou", "dzf_verrou", { action: "prendre", nom: "releve-veille", duree: 900, sortie: "verrou" }, { next_step: 'verrou ? "sources" : ""' }),
      K.st("sources", "dzf_table_chercher", { table: "veille_sources", filtre: K.J({ actif: true }), limite: 500, sortie: "sources" }),
      K.st("lire", "dzf_rss", { sources: "{{sources}}", champs_source: "theme", max_par_source: 30, en_parallele: 4, delai_max: 240, sortie: "articles" }),
      K.st("nouveaux", "dzf_liste_dedoublonner", { liste: "{{articles}}", cle: "url", table: "veille_articles", sortie: "nouveaux" }),
      K.st("images", "dzf_images_articles", { liste: "{{nouveaux}}", max: 40, en_parallele: 6, delai_s: 8, sortie: "nouveaux", si_erreur: "continuer", delai_max: 150 }, { only_if: "nouveaux.length > 0" }),
      K.st("maintenant", "dzf_dates", { operation: "maintenant", sortie: "maintenant" }),
      K.st("preparer", "dzf_liste_transformer", { liste: "{{nouveaux}}", modele: K.J({ source: "{{item.source}}", titre: "{{item.titre}}", url: "{{item.url}}", date: "{{item.date}}", resume: "{{item.resume}}", image: "{{item.image}}", auteur: "{{item.auteur}}", theme: "{{item.source_theme}}", type: "{{item.type}}", video_id: "{{item.video_id}}", lu: false, favori: false, plus_tard: false, ajoute_le: "{{maintenant}}" }), sortie: "lignes" }),
      K.st("ranger", "dzf_table_upsert", { table: "veille_articles", liste: "{{lignes}}", cle: "url", sans_declencheurs: true, sortie: "bilan" }),
      K.st("etat", "dzf_code", { code: ETAT_SOURCES, sortie: "sources_en_erreur" }),
      K.st("limite", "dzf_dates", { operation: "ajouter des jours", jours: -60, sortie: "limite" }),
      K.st("menage", "dzf_table_supprimer", { table: "veille_articles", filtre: K.J({ lu: true, favori: false, plus_tard: false, ajoute_le: { lt: "{{limite}}" } }), sortie: "supprimes" }),
      K.st("liberer", "dzf_verrou", { action: "libérer", nom: "releve-veille", sortie: "verrou_libre" }),
    ]),
  ],
  seedMerge: { veille_sources: "nom" },
  seeds: {
    veille_sources: [
      site("Hacker News", "https://hnrss.org/frontpage", "dev"), site("DEV Community", "https://dev.to/feed", "dev"), site("Journal du hacker", "https://www.journalduhacker.net/rss", "dev"),
      site("GitHub Blog", "https://github.blog/feed/", "dev"), site("Stack Overflow Blog", "https://stackoverflow.blog/feed/", "dev"),
      site("CERT-FR · alertes", "https://www.cert.ssi.gouv.fr/alerte/feed/", "cyber"), site("CERT-FR · avis", "https://www.cert.ssi.gouv.fr/avis/feed/", "cyber"),
      site("The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "cyber"), site("BleepingComputer", "https://www.bleepingcomputer.com/feed/", "cyber"),
      site("Krebs on Security", "https://krebsonsecurity.com/feed/", "cyber"), site("Zataz", "https://www.zataz.com/feed/", "cyber"),
      site("Hugging Face", "https://huggingface.co/blog/feed.xml", "ia"), site("OpenAI", "https://openai.com/news/rss.xml", "ia"), site("Google AI", "https://blog.google/technology/ai/rss/", "ia"),
      site("Simon Willison", "https://simonwillison.net/atom/everything/", "ia"),
      site("Kubernetes", "https://kubernetes.io/feed.xml", "devops"), site("Docker", "https://www.docker.com/blog/feed/", "devops"), site("CNCF", "https://www.cncf.io/blog/feed/", "devops"),
      site("HashiCorp", "https://www.hashicorp.com/blog/feed.xml", "devops"), site("AWS · nouveautés", "https://aws.amazon.com/about-aws/whats-new/recent/feed/", "cloud"),
      site("neptune.ai", "https://neptune.ai/blog/feed", "mlops"), site("Towards Data Science", "https://towardsdatascience.com/feed", "data"),
      site("Cloudflare", "https://blog.cloudflare.com/rss/", "réseau"), site("APNIC", "https://blog.apnic.net/feed/", "réseau"), site("Packet Pushers", "https://packetpushers.net/feed/", "réseau"),
      site("LWN.net", "https://lwn.net/headlines/rss", "systèmes"), site("LinuxFr", "https://linuxfr.org/news.atom", "systèmes"), site("Phoronix", "https://www.phoronix.com/rss.php", "systèmes"),
      site("Next", "https://next.ink/feed/", "tech fr"), site("Korben", "https://korben.info/feed", "tech fr"), site("Le Monde · Pixels", "https://www.lemonde.fr/pixels/rss_full.xml", "tech fr"),
    ],
  },
  pages: [{
    name: "veille", title: "Veille tech", quick: { label: "Source", url: "/view/source_modifier" },
    content: [
      K.chips([["Tout", ""], ...[["Dev", "dev", "fas fa-code"], ["Cyber", "cyber", "fas fa-shield-alt"], ["IA", "ia", "fas fa-brain"], ["DevOps", "devops", "fas fa-infinity"], ["MLOps", "mlops", "fas fa-project-diagram"], ["Cloud", "cloud", "fas fa-cloud"], ["Réseau", "réseau", "fas fa-network-wired"], ["Systèmes", "systèmes", "fab fa-linux"], ["Data", "data", "fas fa-database"], ["Tech FR", "tech fr", "fas fa-flag"]].map(([l, v, i]) => [l, `theme=${v}`, i]),
        ["Non lus", "lu=false", "far fa-circle"], ["Favoris", "favori=true", "fas fa-star"], ["Plus tard", "plus_tard=true", "far fa-clock"]]),
      K.view("veille_fil"),
    ],
  }, {
    name: "sources", title: "Sources suivies", quick: { label: "Source", url: "/view/source_modifier" },
    content: [
      K.text('<p class="dzv-muted">Sites (flux RSS / Atom) et chaînes YouTube lus toutes les heures. Clique une ligne pour la modifier ; « Lire » la relit tout de suite. Une source en erreur montre la raison.</p>'),
      K.chips([["Toutes", ""], ["Sites", "type=site", "fas fa-rss"], ["YouTube", "type=youtube", "fab fa-youtube"], ["En erreur", "etat=erreur", "fas fa-exclamation-triangle"]]),
      K.panel("Sources", "fas fa-rss", [K.view("sources_liste"), K.box("dzv-tile-actions", K.jsBtn("Tout relire maintenant", RELIRE, { icon: "fas fa-sync", style: "btn-outline-secondary" }))], { actions: K.modalBtn("Source", "/view/source_modifier") }),
    ],
  }],
  nav: [
    { page: "veille", label: "Veille tech", short: "Veille", icon: "fas fa-satellite-dish", group: "Veille", order: 10, mobile: true, keywords: "rss actualités tech cyber ia devops" },
    { page: "sources", label: "Sources suivies", icon: "fas fa-rss", group: "Veille", order: 90, keywords: "flux rss chaînes youtube" },
  ],
  quick: [{ label: "Nouvelle source (RSS ou YouTube)", icon: "fas fa-rss", url: "/view/source_modifier", keywords: "flux rss chaîne" }],
  explain: [
    ["Toutes les heures", "Le workflow « veille_releve » : Verrou → Table : chercher (sources) → Lire des flux → Liste : enlever les doublons → Liste : transformer → Table : ajouter ou mettre à jour → Code (état des sources) → ménage → Verrou libéré."],
    ["Une source ne marche pas", "Sa colonne État passe à « erreur » avec la raison. Corrige l'adresse, puis « Tout relire maintenant »."],
    ["Ajouter un site", "Bouton + Source : colle l'adresse de son flux RSS (souvent /feed ou /rss)."],
    ["Ménage", "Les articles lus de plus de 60 jours sont supprimés à chaque relève, sauf favoris et « plus tard » (étapes « limite » et « menage » du workflow)."],
  ],
};
module.exports.THEMES = THEMES;
module.exports.card = card;
module.exports.toggle = toggle;
module.exports.IMG_FML = IMG_FML;
