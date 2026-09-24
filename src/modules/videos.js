"use strict";
const K = require("./_kit");
const { toggle } = require("./veille");

/* chaîne : [nom, @handle, identifiant si connu, thème]. L'identifiant manquant est trouvé à la première lecture. */
const yt = (nom, chaine, youtube_id, theme) => ({ nom, type: "youtube", chaine, youtube_id: youtube_id || "", theme, actif: true, etat: "", erreur: "", url: "" });

const VID = "String(video_id || '').replace(/[^\\w-]/g, '')";
const THUMB = `'<span class="dzv-thumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + ${VID} + '/mqdefault.jpg"></span>'`;
const PLAYER = `'<div class="dzv-player"><iframe src="https://www.youtube-nocookie.com/embed/' + ${VID} + '?rel=0" title="Lecteur vidéo" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>'`;

module.exports = {
  key: "videos",
  label: "Vidéos",
  icon: "fab fa-youtube",
  group: "Veille",
  description: "Les dernières vidéos des chaînes YouTube dev, cyber, IA, DevOps/MLOps, réseau et systèmes que tu suis, regardées directement dans l'appli (sans pub de suivi, lecteur youtube-nocookie).",
  depends: ["veille"],
  setup: "<p>Si tu actives la Content Security Policy de Saltcorn, autorise <code>www.youtube-nocookie.com</code> (cadres) et <code>i.ytimg.com</code> (images).</p><p>Ajouter une chaîne : bouton + Source, type « youtube », et colle son @nom (ex. <code>@TechWorldwithNana</code>).</p>",
  tables: [],
  views: [
    K.show("video_carte", "veille_articles", K.box("`dzv-article dzv-video${lu ? ' dzv-read' : ''}${favori ? ' dzv-fav' : ''}${plus_tard ? ' dzv-later' : ''}`", K.O({ clsFormula: true, id: "`art-${id}`" }),
      K.box("", K.O({ url: "`javascript:ajax_modal('/view/video_lecture?id=${id}')`", urlFormula: true }), K.formula(THUMB, { html: true })),
      K.box("dzv-article-in",
        K.box("dzv-article-src", ...K.spans(K.join("source.nom", "as_text"), K.dateFr("date"))),
        K.box("dzv-article-title", K.O({ url: "`javascript:ajax_modal('/view/video_lecture?id=${id}')`", urlFormula: true }), K.field("titre", "as_text"))),
      K.box("dzv-tile-actions", toggle("lu", "Vue", "fas fa-check", "dzv-read"), toggle("favori", "Favori", "fas fa-star", "dzv-fav"), toggle("plus_tard", "Plus tard", "far fa-clock", "dzv-later"))), { description: "Vignette d'une vidéo" }),
    K.show("video_lecture", "veille_articles", K.box("dzv-mail",
      K.formula(PLAYER, { html: true }),
      K.field("titre", "as_text", { cls: "dzv-mail-title" }),
      K.meta(K.join("source.nom", "as_text"), K.dateFr("date"), K.field("theme", "as_text")),
      K.box("dzv-tile-actions", toggle("lu", "Vue", "fas fa-check", "dzv-read"), toggle("favori", "Favori", "fas fa-star", "dzv-fav"), toggle("plus_tard", "Plus tard", "far fa-clock", "dzv-later"), K.link("'Ouvrir sur YouTube'", "url", { cls: "btn btn-sm btn-link" })),
      K.field("resume", "as_text", { cls: "dzv-mail-body", block: true })), { title: "Vidéo", width: 980, description: "Lecteur vidéo en fenêtre" }),
    K.feed("videos_grille", "veille_articles", "video_carte", { include: 'type == "vidéo"', order: "date", desc: true, limit: 24, md: 2, lg: 3, xl: 4 }),
  ],
  seedMerge: { veille_sources: "nom" },
  seeds: {
    veille_sources: [
      yt("Fireship", "@Fireship", "UCsBjURrPoezykLs9EqgamOA", "dev"), yt("Grafikart", "@grafikart", "UCj_iGliGCkLcHSZ8eqVNPDQ", "dev"),
      yt("ByteByteGo", "@ByteByteGo", "UCZgt6AzoyjslHTC9dz0UoTw", "dev"), yt("Hussein Nasser", "@hnasr", "UC_ML5xP23TOWKUcc-oAE_Eg", "dev"),
      yt("TechWorld with Nana", "@TechWorldwithNana", "UCdngmbVKX1Tgre699-XLlUA", "devops"), yt("DevOps Toolkit", "@DevOpsToolkit", "", "devops"),
      yt("Xavki", "@xavki", "", "devops"), yt("Cocadmin", "@cocadmin", "", "devops"),
      yt("NetworkChuck", "@NetworkChuck", "UC9x0AN7BWHpCDHSm9NiJFJQ", "réseau"), yt("David Bombal", "@davidbombal", "UCP7WmQ_U4GB3K51Od9QvM0w", "réseau"),
      yt("John Hammond", "@_JohnHammond", "UCVeW9qkBjo3zosnqUbG7CFw", "cyber"), yt("IppSec", "@ippsec", "UCa6eh7gCkpPo5XXUDfygQQA", "cyber"),
      yt("LiveOverflow", "@LiveOverflow", "UClcE-kVhqyiHCcjYwcpfj9w", "cyber"),
      yt("Andrej Karpathy", "@AndrejKarpathy", "UCXUPKJO5MZQN11PqgIvyuvQ", "ia"), yt("Two Minute Papers", "@TwoMinutePapers", "UCbfYPyITQ-7l4upoX8nvctg", "ia"),
      yt("Yannic Kilcher", "@YannicKilcher", "UCZHmQk67mSJgfCCTn7xBfew", "ia"), yt("Machine Learnia", "@MachineLearnia", "", "ia"),
      yt("MLOps.community", "@MLOps", "", "mlops"),
      yt("Learn Linux TV", "@LearnLinuxTV", "", "systèmes"), yt("Computerphile", "@Computerphile", "UC9-y-6csu5WGm29I7JiwpnA", "systèmes"),
      yt("Micode", "@Micode", "UCYnvxJ-PKiGXo_tYXpWAC-w", "tech fr"), yt("Underscore_", "@Underscore_", "", "tech fr"),
    ],
  },
  pages: [{
    name: "videos", title: "Vidéos", quick: { label: "Chaîne", url: "/view/source_modifier?type=youtube" },
    content: [
      K.chips([["Tout", ""], ["Dev", "theme=dev", "fas fa-code"], ["Cyber", "theme=cyber", "fas fa-shield-alt"], ["IA", "theme=ia", "fas fa-brain"], ["DevOps", "theme=devops", "fas fa-infinity"], ["MLOps", "theme=mlops", "fas fa-project-diagram"], ["Réseau", "theme=réseau", "fas fa-network-wired"], ["Systèmes", "theme=systèmes", "fab fa-linux"], ["Tech FR", "theme=tech fr", "fas fa-flag"], ["Pas vues", "lu=false", "far fa-circle"], ["Plus tard", "plus_tard=true", "far fa-clock"], ["Favoris", "favori=true", "fas fa-star"]]),
      K.view("videos_grille"),
    ],
  }],
  nav: [{ page: "videos", label: "Vidéos", icon: "fab fa-youtube", group: "Veille", order: 20, keywords: "youtube chaîne tuto" }],
  quick: [{ label: "Nouvelle chaîne YouTube", icon: "fab fa-youtube", url: "/view/source_modifier?type=youtube", keywords: "youtube" }],
  explain: [
    ["Les chaînes", "Ce sont des lignes de « veille_sources » de type youtube. Leur identifiant (UC…) est trouvé tout seul à partir du @nom."],
    ["Toutes les heures", "Le même déclencheur que la veille (« veille_releve ») lit le flux de chaque chaîne et ajoute les vidéos (type = vidéo)."],
    ["Tu cliques une vidéo", "La vue « video_lecture » s'ouvre en fenêtre avec le lecteur youtube-nocookie : pas besoin d'aller sur YouTube."],
  ],
};
