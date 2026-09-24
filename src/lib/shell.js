/* dysizz-vie — la « coquille » commune à toutes les pages des modules :
   menu latéral (ordinateur), barre du bas + tiroir (mobile), barre du haut,
   palette Ctrl K. Elle est régénérée à chaque installation / retrait de module,
   pour que le menu montre toujours exactement les modules installés.
   Tout est rangé dans des conteneurs repérés par leur id (dzv-nav, dzv-top…) :
   le reste de la page, que tu peux modifier dans l'éditeur, n'est pas touché. */
"use strict";
const { esc } = require("../core");
const { box, O, text } = require("./layout");

const GROUPS = ["Aujourd'hui", "Organisation", "Vie perso", "Travail", "Veille"];

const navItems = (mods) =>
  mods.flatMap((m) => (m.nav || []).map((n) => ({ ...n, module: m.key })))
    .sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || (a.order || 50) - (b.order || 50));

const sideHtml = (items, current) => {
  let html = `<a class="dz-brand dzv-brand" href="/page/accueil"><span class="dz-brand-mark"></span>Ma vie</a>
<button class="dz-search dzv-search" type="button" data-dz-cmdk-open><i class="fas fa-search"></i><span>Aller à…</span><span class="dz-kbd">Ctrl K</span></button>`;
  let g = null;
  for (const it of items) {
    if (it.group !== g) { g = it.group; html += `<div class="dz-side-label">${esc(g)}</div>`; }
    html += `<a class="dz-side-item${it.page === current ? " dz-active" : ""}" href="/page/${esc(it.page)}"><i class="${esc(it.icon)}"></i>${esc(it.label)}</a>`;
  }
  html += `<div class="dz-side-foot dzv-side-foot"><a href="/dysizz-vie" class="dzv-foot-link"><i class="fas fa-puzzle-piece"></i>Modules</a><button class="dz-btn dz-btn-ghost dz-icon-btn dz-theme-btn" data-dz-theme-toggle aria-label="Thème"><i class="fas fa-moon dz-moon"></i><i class="fas fa-sun dz-sun"></i></button></div>`;
  return html;
};

const topHtml = (title, icon, quick) => `
<button class="dz-btn dz-btn-ghost dz-icon-btn dzv-only-mobile" type="button" data-dz-open="#dzv-drawer" aria-label="Menu"><i class="fas fa-bars"></i></button>
<h1 class="dzv-title"><i class="${esc(icon)}"></i>${esc(title)}</h1>
<div class="dzv-top-actions">
  ${quick ? `<a class="dz-btn dz-btn-primary dz-btn-sm" href="javascript:ajax_modal('${esc(quick.url)}')"><i class="fas fa-plus"></i><span class="dzv-hide-sm">${esc(quick.label)}</span></a>` : ""}
  <button class="dz-btn dz-btn-ghost dz-icon-btn" type="button" data-dz-cmdk-open aria-label="Rechercher"><i class="fas fa-search"></i></button>
</div>`;

const bottomHtml = (items, current) => {
  const main = items.filter((i) => i.mobile).slice(0, 4);
  return main.map((i) => `<a href="/page/${esc(i.page)}"${i.page === current ? ' class="dz-active"' : ""}><i class="${esc(i.icon)}"></i>${esc(i.short || i.label)}</a>`).join("") +
    `<a href="#" data-dz-open="#dzv-drawer"><i class="fas fa-th-large"></i>Plus</a>`;
};

const cmdkHtml = (items, mods) => {
  const quick = mods.flatMap((m) => m.quick || []);
  return `<div data-dz-cmdk class="dz-cmdk"><div class="dz-cmdk-box">
<input placeholder="Aller à une page, créer quelque chose…" aria-label="Recherche">
<div class="dz-cmdk-list">
<div class="dz-cmdk-group">Aller à</div>
${items.map((i) => `<a href="/page/${esc(i.page)}" data-keywords="${esc(i.keywords || "")}"><i class="${esc(i.icon)}"></i>${esc(i.label)}</a>`).join("\n")}
<div class="dz-cmdk-group">Créer</div>
${quick.map((q) => `<a href="javascript:ajax_modal('${esc(q.url)}')" data-keywords="ajouter nouveau nouvelle ${esc(q.keywords || "")}"><i class="${esc(q.icon)}"></i>${esc(q.label)}</a>`).join("\n")}
<div class="dz-cmdk-group">Réglages</div>
<a href="/dysizz-vie" data-keywords="modules installer"><i class="fas fa-puzzle-piece"></i>Modules</a>
<a href="#" data-dz-theme-toggle data-keywords="sombre clair"><i class="fas fa-adjust"></i>Changer de thème</a>
<div class="dz-cmdk-empty" hidden>Aucun résultat</div>
</div>
<div class="dz-cmdk-foot"><span><span class="dz-kbd">↑↓</span> naviguer</span><span><span class="dz-kbd">Entrée</span> ouvrir</span><span><span class="dz-kbd">Échap</span> fermer</span></div>
</div></div>`;
};

/* les morceaux régénérés, par id de conteneur */
const parts = (mods, page) => {
  const items = navItems(mods);
  const me = items.find((i) => i.page === page.name) || {};
  const quick = page.quick || (mods.find((m) => (m.pages || []).some((p) => p.name === page.name)) || {}).quick?.[0];
  return {
    "dzv-nav": text(sideHtml(items, page.name)),
    "dzv-top": text(topHtml(page.title, me.icon || page.icon || "fas fa-circle", quick)),
    "dzv-bottom": text(bottomHtml(items, page.name)),
    "dzv-drawer": text(sideHtml(items, page.name)),
    "dzv-cmdk": text(cmdkHtml(items, mods)),
  };
};

/* page complète : coquille + contenu du module */
const shellLayout = (mods, page, content) => {
  const p = parts(mods, page);
  const c = (id, cls, el) => box(cls, O({ id, el }), p[id]);
  return {
    above: [
      box("dz-app dzv-app",
        c("dzv-nav", "dz-side dzv-side", "aside"),
        box("dz-app-main",
          c("dzv-top", "dz-app-top dzv-top", "header"),
          box("dz-app-body dzv-body", ...content)),
        c("dzv-bottom", "dz-bottom-nav dzv-bottom", "nav"),
        c("dzv-drawer", "dz-drawer dz-left dzv-drawer", "div"),
        c("dzv-cmdk", "dzv-cmdk-wrap", "div")),
    ],
  };
};

/* remplace les morceaux de coquille dans une page existante (le contenu reste tel quel) */
const refreshShell = (layout, mods, page) => {
  const p = parts(mods, page);
  let touched = 0;
  const walk = (s) => {
    if (!s || typeof s !== "object") return;
    if (Array.isArray(s)) return s.forEach(walk);
    if (s.type === "container" && s.customId && p[s.customId]) { s.contents = p[s.customId]; touched++; return; }
    if (s.above) s.above.forEach(walk);
    if (s.besides) s.besides.forEach(walk);
    if (s.contents && typeof s.contents === "object") walk(s.contents);
  };
  walk(layout);
  return touched;
};

module.exports = { shellLayout, refreshShell, navItems, GROUPS };
