"use strict";
const K = require("./_kit");
const { IMG_FML } = require("./veille");

const site = (nom, url, theme) => ({ nom, type: "site", url, theme, actif: true, etat: "", erreur: "" });

module.exports = {
  key: "actus",
  label: "Actus France & Sénégal",
  icon: "fas fa-globe-africa",
  group: "Veille",
  description: "Les titres du jour en France et au Sénégal côte à côte (franceinfo, Le Monde, France 24, Seneweb, Dakaractu, APS, Le Soleil, RFI Afrique…), mis à jour toutes les heures.",
  depends: ["veille"],
  tables: [],
  views: [
    K.show("actu_ligne", "veille_articles", K.box("`dzv-line dzv-line-img${lu ? ' dzv-read' : ''}`", K.O({ clsFormula: true, id: "`art-${id}`" }),
      K.formula(IMG_FML("dzv-line-thumb"), { html: true }),
      K.box("", K.box("dzv-line-src", K.join("source.nom", "as_text")), K.link("titre", "url", { cls: "dzv-line-title" }), K.box("dzv-mail-ext", K.dateFr("date", { time: true })))), { description: "Une ligne d'actualité avec son image" }),
    K.feed("actus_france", "veille_articles", "actu_ligne", { include: 'theme == "actus france"', order: "date", desc: true, limit: 25, md: 1, lg: 1 }),
    K.feed("actus_senegal", "veille_articles", "actu_ligne", { include: 'theme == "actus sénégal"', order: "date", desc: true, limit: 25, md: 1, lg: 1 }),
  ],
  seedMerge: { veille_sources: "nom" },
  seeds: {
    veille_sources: [
      site("franceinfo", "https://www.francetvinfo.fr/titres.rss", "actus france"), site("Le Monde", "https://www.lemonde.fr/rss/une.xml", "actus france"),
      site("France 24", "https://www.france24.com/fr/rss", "actus france"), site("20 Minutes", "https://www.20minutes.fr/feeds/rss-une.xml", "actus france"),
      site("Seneweb", "https://www.seneweb.com/feed", "actus sénégal"), site("Dakaractu", "https://www.dakaractu.com/xml/syndication.rss", "actus sénégal"),
      site("APS", "https://aps.sn/feed/", "actus sénégal"), site("Le Soleil", "https://lesoleil.sn/feed/", "actus sénégal"),
      site("Senego", "https://senego.com/feed", "actus sénégal"), site("RFI Afrique", "https://www.rfi.fr/fr/afrique/rss", "actus sénégal"),
    ],
  },
  pages: [{
    name: "actus", title: "Actus France & Sénégal",
    content: [K.grid("dzv-grid-2",
      K.panel("France", "fas fa-flag", K.view("actus_france")),
      K.panel("Sénégal", "fas fa-globe-africa", K.view("actus_senegal")))],
  }],
  nav: [{ page: "actus", label: "Actus FR & SN", short: "Actus", icon: "fas fa-globe-africa", group: "Veille", order: 30, keywords: "actualités france sénégal news" }],
  explain: [
    ["Les journaux", "Des lignes de « veille_sources » avec le thème « actus france » ou « actus sénégal ». Ajoute ou retire un journal depuis la page Veille (Sources suivies)."],
    ["Toutes les heures", "Le déclencheur « veille_releve » lit les flux ; la page montre les 25 derniers titres de chaque pays."],
  ],
};
