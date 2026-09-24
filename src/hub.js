/* Les tuiles de Me sur l'accueil Dysizz (/dysizz, fourni par dysizz-ui).
   Une tuile par module installé, avec quelques infos en direct. */
"use strict";
const MODULES = require("./modules");

const COLORS = { accueil: "#0063b1", taches: "#00a300", objectifs: "#603cba", maison: "#8a5a2b", budget: "#1e7145", sante: "#b91d47", documents: "#3a4a5c", mails: "#2d89ef", emploi: "#e3a21a", veille: "#00aba9", videos: "#e51400", actus: "#7e3878", surveillance: "#da532c" };
const SIZE = { accueil: "w", taches: "m", mails: "m", budget: "m" };

const count = async (table, where) => {
  const T = require("@saltcorn/data/models/table");
  const t = T.findOne({ name: table });
  return t ? t.countRows(where) : null;
};
const day = (n = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const LIVE = {
  taches: async () => { const n = await count("taches", { not: { statut: "fait" }, echeance: { lt: day(1) } }); return n === null ? null : n ? { n, text: `${n} pour aujourd'hui` } : { text: "rien d'urgent" }; },
  mails: async () => { const n = await count("mails", { lu: false }); return n === null ? null : n ? { n, text: `${n} non lu${n > 1 ? "s" : ""}` } : { text: "tout est lu" }; },
  surveillance: async () => { const n = await count("surveillance_sites", { actif: true, etat: "panne" }); return n === null ? null : n ? { n, text: `${n} en panne` } : { text: "tout fonctionne" }; },
  documents: async () => { const n = await count("documents", { expire_le: { gt: day(0), lt: day(60) } }); return n ? { n, text: `${n} expire${n > 1 ? "nt" : ""} bientôt` } : null; },
};

const dysizz_hub = async (req) => {
  const { getConfig } = require("@saltcorn/data/models/config");
  const cfg = (await getConfig("dysizz_me", null)) || (await getConfig("dysizz_vie", null)) || {};
  const installed = new Set(cfg.installed || []);
  const tiles = [];
  for (const m of MODULES) {
    if (!installed.has(m.key)) continue;
    for (const n of m.nav || []) tiles.push({
      group: "Mes applis", label: n.label, sub: m.key === "accueil" ? "Me · ta journée en un coup d'œil" : (m.description || "").split(/[.:]/)[0],
      url: `/page/${n.page}`, icon: n.icon, color: COLORS[m.key] || "#0063b1", size: SIZE[m.key] || "s", min_role: 80, live: LIVE[m.key],
    });
  }
  const admin = req.user && req.user.role_id === 1;
  if (admin) tiles.push({ group: "Mes applis", label: "Réglages de Me", sub: "modules, configuration", url: "/dysizz-me", icon: "fas fa-puzzle-piece", color: "#3a4a5c", size: tiles.length ? "s" : "w" });
  return tiles;
};

module.exports = { dysizz_hub };
