/* Pages d'administration : /dysizz-me (catalogue des modules) et
   /dysizz-me/m/:key (ce qu'il y a derrière un module). */
"use strict";
const { esc, isAdmin, denied, VERSION } = require("./core");
const { installModule, uninstallModule, moduleStatus, getCfg } = require("./installer");
const MODULES = require("./modules");
const { GROUPS } = require("./lib/shell");

const csrf = (req) => (req.csrfToken ? req.csrfToken() : "");
const form = (req, action, inner, o = {}) => `<form method="post" action="${action}" class="dzv-inline"${o.confirm ? ` onsubmit="return confirm('${esc(o.confirm)}')"` : ""}><input type="hidden" name="_csrf" value="${esc(csrf(req))}">${inner}</form>`;
const ADMIN_CSS = "/* ---------- page d'administration des modules ---------- */\n.dzv-admin { max-width: 1180px; margin: 0 auto; }\n.dzv-admin h1 { font-weight: 750; letter-spacing: -.02em; display: flex; gap: .6rem; align-items: center; flex-wrap: wrap; }\n.dzv-admin h2 { font-size: 1.05rem; font-weight: 700; margin: 2rem 0 .8rem; }\n.dzv-admin-top { display: flex; gap: 1rem; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; }\n.dzv-admin-top p { color: var(--dzv-mute); max-width: 70ch; }\n.dzv-admin-group { font: 600 .74rem var(--dzv-mono) !important; text-transform: uppercase; letter-spacing: .12em; color: var(--dzv-mute); }\n.dzv-admin-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); }\n.dzv-mod { display: flex; flex-direction: column; gap: .6rem; padding: 1.1rem; border-radius: var(--dzv-radius); border: 1px solid var(--dzv-border); background: var(--dzv-surface); }\n.dzv-mod-on { border-color: color-mix(in srgb, var(--dzv-success) 45%, var(--dzv-border)); }\n.dzv-mod-head { display: flex; gap: .75rem; align-items: center; }\n.dzv-mod-head b { display: block; font-size: 1.02rem; }\n.dzv-mod-ic { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: var(--dzv-primary-soft); color: var(--dzv-ink); font-size: 1.05rem; flex: none; }\n.dzv-mod p { margin: 0; color: var(--dzv-soft); font-size: .88rem; line-height: 1.5; }\n.dzv-mod-counts { display: flex; flex-wrap: wrap; gap: .35rem; }\n.dzv-mod-counts span { font: 600 .68rem var(--dzv-mono); padding: .15rem .5rem; border-radius: 99px; background: var(--dzv-surface-2); color: var(--dzv-mute); }\n.dzv-mod-deps { font-size: .8rem; color: var(--dzv-mute); }\n.dzv-mod-actions { display: flex; flex-wrap: wrap; gap: .3rem; align-items: center; margin-top: auto; }\n.dzv-inline { display: inline; margin: 0; }\n.dzv-st { display: inline-block; font: 600 .66rem var(--dzv-mono); text-transform: uppercase; letter-spacing: .06em; padding: .15rem .45rem; border-radius: 6px; background: var(--dzv-surface-2); color: var(--dzv-mute); margin-left: .35rem; vertical-align: middle; }\n.dzv-st-on { background: color-mix(in srgb, var(--dzv-success) 15%, transparent); color: var(--dzv-success); }\n.dzv-st-part { background: color-mix(in srgb, var(--dzv-warning) 18%, transparent); color: color-mix(in srgb, var(--dzv-warning) 70%, var(--dzv-text)); }\n.dzv-flash { padding: .8rem 1rem; border-radius: 10px; margin: 1rem 0; font-size: .9rem; }\n.dzv-ok { background: color-mix(in srgb, var(--dzv-success) 12%, transparent); }\n.dzv-ko { background: color-mix(in srgb, var(--dzv-danger) 12%, transparent); }\n.dzv-flows { display: grid; gap: .5rem; }\n.dzv-flow { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 2fr); gap: .8rem; align-items: center; padding: .75rem .9rem; border-radius: 12px; background: var(--dzv-surface-2); font-size: .9rem; }\n.dzv-flow-q { font-weight: 650; }\n.dzv-flow > i { color: var(--dzv-ink); }\n@media (max-width: 640px) { .dzv-flow { grid-template-columns: 1fr; } .dzv-flow > i { transform: rotate(90deg); } }\n.dzv-det { border: 1px solid var(--dzv-border); border-radius: 12px; padding: .7rem .9rem; margin-bottom: .5rem; background: var(--dzv-surface); }\n.dzv-det summary { cursor: pointer; }\n.dzv-det summary small { color: var(--dzv-mute); }\n.dzv-edit { font-size: .8rem; margin-left: .5rem; }\n.dzv-fields { width: 100%; margin-top: .7rem; font-size: .85rem; }\n.dzv-fields th { font: 600 .68rem var(--dzv-mono); text-transform: uppercase; color: var(--dzv-mute); padding: .3rem .4rem; }\n.dzv-fields td { border-top: 1px solid var(--dzv-border); padding: .35rem .4rem; vertical-align: top; }\n.dzv-code { margin: .7rem 0 0; padding: .9rem 1rem; border-radius: 10px; background: #0f1117; color: #e6e6ea; font: .8rem/1.55 var(--dzv-mono); white-space: pre-wrap; max-height: 420px; overflow: auto; }\n.dzv-ul { list-style: none; padding: 0; display: grid; gap: .4rem; font-size: .9rem; }\n.dzv-ul i { color: var(--dzv-mute); width: 1.2em; }\n.dzv-ul small { color: var(--dzv-mute); }\n.dzv-danger { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; padding: 1rem; border-radius: 12px; border: 1px dashed var(--dzv-border); }\n.dzv-setup { padding: 1rem 1.1rem; border-radius: 12px; background: var(--dzv-primary-soft); }\n.dzv-setup h2 { margin-top: 0 !important; }\n.dzv-setup code { font-size: .85em; }\n.dzv-start { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: .8rem; margin: 1rem 0 .5rem; }\n.dzv-start-s { border: 1px solid var(--dzv-border); border-radius: 14px; padding: 1rem; background: var(--dzv-surface); display: flex; flex-direction: column; gap: .5rem; align-items: flex-start; }\n.dzv-start-s p { margin: 0; color: var(--dzv-soft); font-size: .88rem; }\n.dzv-start-s.done { border-color: color-mix(in srgb, var(--dzv-success) 45%, var(--dzv-border)); }\n.dzv-start-s.done b::after { content: \" ✓\"; color: var(--dzv-success); }\n\n";
/* les {{ }} du texte sont écrits en entités : Saltcorn les prendrait pour des variables de page */
const wrap = (res, title, html) => res.sendWrap({ title, requestFluidLayout: false }, { above: [{ type: "blank", isHTML: true, contents: `<style>${ADMIN_CSS}</style><div class="dzv-admin">${html}</div>`.replace(/\{\{/g, "&#123;&#123;").replace(/\}\}/g, "&#125;&#125;") }] });
const flash = (req) => {
  const q = req.query || {};
  return (q.ok ? `<div class="dzv-flash dzv-ok">${esc(q.ok).replace(/\n/g, "<br>")}</div>` : "") + (q.err ? `<div class="dzv-flash dzv-ko">${esc(q.err)}</div>` : "");
};
const settings = require("./settings");
const modOf = (req) => MODULES.find((x) => x.key === req.params.key && x.settings);
const settingsPage = async (req, res) => { if (!isAdmin(req)) return denied(res); const m = modOf(req); if (!m) return res.redirect("/dysizz-me"); return settings.page(req, res, m); };
const settingsSave = async (req, res) => { if (!isAdmin(req)) return denied(res); const m = modOf(req); if (!m) return res.redirect("/dysizz-me"); return settings.save(req, res, m); };
const settingsTest = async (req, res) => { if (!isAdmin(req)) return res.status(403).json({ ok: false, message: "réservé aux admins" }); const m = modOf(req); if (!m) return res.json({ ok: false, message: "module inconnu" }); return settings.test(req, res, m); };
/* battement : une tâche cron appelle /dysizz-me/battement/<jeton> (GET ou POST, sans connexion) */
const battement = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const jeton = String(req.params.jeton || "");
  if (!/^[a-z0-9]{16,64}$/.test(jeton)) return res.status(404).json({ ok: false });
  const T = require("@saltcorn/data/models/table").findOne({ name: "surveillance_sites" });
  const s = T && (await T.getRow({ jeton, type: "battement" }));
  if (!s) return res.status(404).json({ ok: false });
  await T.updateRow({ dernier_ok: new Date(), etat: "ok", raison: "signal reçu" }, s.id, undefined, true);
  res.json({ ok: true });
};

/* pour la coquille des pages : ce module a-t-il besoin d'être réglé ? (admins seulement) */
const etat = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!isAdmin(req)) return res.json({});
  const page = String((req.query || {}).page || "");
  const m = MODULES.find((x) => x.settings && (x.pages || []).some((p) => p.name === page));
  if (!m) return res.json({});
  const cfg = await getCfg();
  if (!(cfg.installed || []).includes(m.key) || (await settings.configured(m, cfg))) return res.json({});
  res.json({ hint: `${m.label} n'est pas encore réglé : il ne peut rien récupérer pour l'instant.`, url: `/dysizz-me/reglages/${m.key}` });
};
const badge = (st) => (st.installed ? '<span class="dzv-st dzv-st-on">installé</span>' : st.partial ? '<span class="dzv-st dzv-st-part">incomplet</span>' : '<span class="dzv-st">non installé</span>');

const home = async (req, res) => {
  if (!isAdmin(req)) return denied(res);
  const cfg = await getCfg();
  const cards = [];
  for (const g of GROUPS) {
    const mods = MODULES.filter((m) => m.group === g);
    if (!mods.length) continue;
    cards.push(`<h2 class="dzv-admin-group">${esc(g)}</h2><div class="dzv-admin-grid">`);
    for (const m of mods) {
      const st = await moduleStatus(m, cfg);
      const needConf = st.installed && m.settings && !(await settings.configured(m, cfg));
      const deps = (m.depends || []).map((d) => (MODULES.find((x) => x.key === d) || {}).label || d);
      cards.push(`<div class="dzv-mod${st.installed ? " dzv-mod-on" : ""}">
<div class="dzv-mod-head"><span class="dzv-mod-ic"><i class="${esc(m.icon)}"></i></span><div><b>${esc(m.label)}</b>${badge(st)}${needConf ? '<span class="dzv-st dzv-st-part">à régler</span>' : ""}</div></div>
<p>${esc(m.description)}</p>
<div class="dzv-mod-counts"><span>${(m.tables || []).length} tables</span><span>${(m.views || []).length} vues</span><span>${(m.pages || []).length} pages</span><span>${(m.triggers || []).length} workflows</span></div>
${deps.length ? `<div class="dzv-mod-deps">Utilise : ${esc(deps.join(", "))}</div>` : ""}
<div class="dzv-mod-actions">
${st.installed && m.settings ? `<a class="btn btn-sm ${needConf ? "btn-primary" : "btn-outline-secondary"}" href="/dysizz-me/reglages/${m.key}"><i class="fas fa-sliders-h"></i> Régler</a>` : ""}
${form(req, `/dysizz-me/install/${m.key}`, `<button class="btn btn-sm ${st.installed ? "btn-outline-secondary" : "btn-primary"}">${st.installed ? "Mettre à jour" : "Installer"}</button>`)}
<a class="btn btn-sm btn-link" href="/dysizz-me/m/${m.key}">Ce qu'il y a derrière</a>
${st.installed && (m.pages || [])[0] ? `<a class="btn btn-sm btn-link" href="/page/${esc(m.pages[0].name)}">Ouvrir</a>` : ""}
</div></div>`);
    }
    cards.push("</div>");
  }
  const miss = require("./installer").missingDeps();
  /* démarrage en 3 étapes, pour ne pas avoir à tout comprendre */
  const inst = new Set(cfg.installed || []);
  const toConf = [];
  for (const m of MODULES) if (inst.has(m.key) && m.settings && !(await settings.configured(m, cfg))) toConf.push(m);
  const s1 = inst.size > 0, s2 = s1 && !toConf.length;
  const steps = `<div class="dzv-start">
<div class="dzv-start-s${s1 ? " done" : ""}"><b>1. Installer</b><p>${s1 ? `${inst.size} module(s) installé(s). Tu peux en ajouter plus bas.` : "Installe tout d'un coup, ou seulement les modules qui t'intéressent plus bas."}</p>${s1 ? "" : form(req, "/dysizz-me/install-all", '<button class="btn btn-primary btn-sm"><i class="fas fa-magic"></i> Tout installer</button>')}</div>
<div class="dzv-start-s${s2 ? " done" : ""}"><b>2. Régler</b><p>${!s1 ? "Après l'installation." : toConf.length ? "Ces modules ont besoin de toi (adresse mail, clés…) :" : "Tout est réglé."}</p>${toConf.map((m) => `<a class="btn btn-sm btn-outline-primary" href="/dysizz-me/reglages/${m.key}"><i class="${esc(m.icon)}"></i> ${esc(m.label)}</a>`).join(" ")}</div>
<div class="dzv-start-s"><b>3. Utiliser</b><p>Ouvre Me : ta journée, tes mails, tes tâches…</p>${inst.has("accueil") ? '<a class="btn btn-sm btn-primary" href="/page/accueil"><i class="fas fa-sun"></i> Ouvrir Me</a>' : ""}</div></div>`;
  wrap(res, "Modules", `${flash(req)}
<div class="dzv-admin-top"><div><h1>Me</h1><p>La solution est découpée en modules. Chacun ajoute des tables, des vues (blocs de dysizz-ui), des pages et des workflows (blocs de dysizz-flow). Tout reste modifiable dans Saltcorn ; « Ce qu'il y a derrière » montre comment chaque module fonctionne. Version ${esc(VERSION)}.</p></div>
${form(req, "/dysizz-me/install-all", '<button class="btn btn-primary"><i class="fas fa-magic"></i> Tout installer</button>')}</div>
${steps}
${miss.length ? `<div class="dzv-flash dzv-ko">Cette solution a besoin de : <b>${esc(miss.join(", "))}</b>. Installe-les d'abord (Paramètres → Modules).</div>` : ""}
${cards.join("")}`);
};

const detail = async (req, res) => {
  if (!isAdmin(req)) return denied(res);
  const m = MODULES.find((x) => x.key === req.params.key);
  if (!m) return res.redirect("/dysizz-me");
  const st = await moduleStatus(m);
  const changed = (x) => (x.changed ? ' <span class="dzv-st dzv-st-part" title="Tu l\'as modifié : une mise à jour ne l\'écrase pas">modifié</span>' : "");
  const missing = (x) => (x.exists ? "" : ' <span class="dzv-st">absent</span>');
  const tables = (m.tables || []).map((t) => {
    const s = st.tables.find((x) => x.name === t.name) || {};
    return `<details class="dzv-det"><summary><i class="fas fa-table"></i> <b>${esc(t.name)}</b>${missing(s)} <small>${esc(t.description || "")}${s.exists ? ` · ${s.rows ?? "?"} lignes` : ""}</small>
${s.id ? `<a href="/table/${s.id}" class="dzv-edit">ouvrir dans Saltcorn</a>` : ""}</summary>
<table class="dzv-fields"><tr><th>Champ</th><th>Type</th><th>Détail</th></tr>${t.fields.map((f) => `<tr><td><code>${esc(f.name)}</code> ${esc(f.label || "")}</td><td>${esc(f.type)}${f.required ? " · obligatoire" : ""}${f.unique ? " · unique" : ""}</td><td>${f.options ? "choix : " + esc([].concat(f.options).join(", ")) : ""}${f.description ? esc(f.description) : ""}</td></tr>`).join("")}</table></details>`;
  }).join("");
  const views = (m.views || []).map((v) => {
    const s = st.views.find((x) => x.name === v.name) || {};
    return `<li><i class="fas fa-eye"></i> <b>${esc(v.name)}</b> <small>${esc(v.template)}${v.table ? " sur " + esc(v.table) : ""}</small>${missing(s)}${changed(s)} — ${esc(v.description || "")}
${s.exists ? `<a class="dzv-edit" href="/viewedit/config/${encodeURIComponent(v.name)}">modifier</a> <a class="dzv-edit" href="/view/${encodeURIComponent(v.name)}">voir</a>` : ""}</li>`;
  }).join("");
  const pages = (m.pages || []).map((p) => {
    const s = st.pages.find((x) => x.name === p.name) || {};
    return `<li><i class="far fa-file"></i> <b>${esc(p.name)}</b>${missing(s)}${changed(s)} ${s.exists ? `<a class="dzv-edit" href="/pageedit/edit/${encodeURIComponent(p.name)}">modifier</a> <a class="dzv-edit" href="/page/${encodeURIComponent(p.name)}">ouvrir</a>` : ""}</li>`;
  }).join("");
  const { getState } = require("@saltcorn/data/db/state");
  const actions = getState().actions || {};
  const triggers = (m.triggers || []).map((t) => {
    const s = st.triggers.find((x) => x.name === t.name) || {};
    const steps = t.steps.map((x) => {
      const code = x.configuration && x.configuration.code;
      const a = actions[x.action_name];
      return `<li><b>${esc(x.name)}</b> — <a href="/dysizz-flow/bloc/${encodeURIComponent(x.action_name)}">${esc((a && a.description ? a.description.split(" — ")[0] : x.action_name))}</a>${x.only_if ? ` <small>seulement si <code>${esc(x.only_if)}</code></small>` : ""}${x.next_step && x.next_step.includes("?") ? ` <small>ensuite : <code>${esc(x.next_step)}</code></small>` : ""}${code ? `<details><summary>code</summary><pre class="dzv-code">${esc(code)}</pre></details>` : ""}</li>`;
    }).join("");
    return `<details class="dzv-det"><summary><i class="fas fa-project-diagram"></i> <b>${esc(t.name)}</b>${missing(s)}${changed(s)} <small>${esc(t.when)}${t.table ? " sur " + esc(t.table) : ""} · ${t.steps.length} étapes</small> — ${esc(t.description || "")}
${s.id ? `<a class="dzv-edit" href="/actions/configure/${s.id}">ouvrir dans l'éditeur de workflows</a>` : ""}</summary><ol class="dzv-wf">${steps}</ol></details>`;
  }).join("");
  const flow = (m.explain || []).map(([a, b]) => `<div class="dzv-flow"><div class="dzv-flow-q">${esc(a)}</div><i class="fas fa-arrow-right"></i><div class="dzv-flow-a">${esc(b)}</div></div>`).join("");
  const dependents = MODULES.filter((x) => (x.depends || []).includes(m.key)).map((x) => x.label);
  wrap(res, `Module ${m.label}`, `${flash(req)}
<p><a href="/dysizz-me">← Modules</a></p>
<div class="dzv-admin-top"><div><h1><i class="${esc(m.icon)}"></i> ${esc(m.label)} ${badge(st)}</h1><p>${esc(m.description)}</p>
${(m.depends || []).length ? `<p class="dzv-muted">S'appuie sur : ${esc(m.depends.join(", "))}.</p>` : ""}${dependents.length ? `<p class="dzv-muted">Utilisé par : ${esc(dependents.join(", "))}.</p>` : ""}</div>
<div class="dzv-mod-actions">${form(req, `/dysizz-me/install/${m.key}?back=m`, `<button class="btn btn-primary">${st.installed ? "Mettre à jour" : "Installer"}</button>`)}</div></div>
${m.setup ? `<div class="dzv-setup"><h2>À régler</h2>${m.setup}</div>` : ""}
<h2>Comment ça marche</h2><div class="dzv-flows">${flow}</div>
<h2>Tables</h2>${tables}
<h2>Vues</h2><ul class="dzv-ul">${views}</ul>
<h2>Pages</h2><ul class="dzv-ul">${pages}</ul>
<h2>Workflows <small class="dzv-muted">(faits de blocs dysizz-flow)</small></h2>${triggers || '<p class="dzv-muted">Aucun.</p>'}
<h2>Entretien</h2>
<div class="dzv-danger">
${form(req, `/dysizz-me/install/${m.key}?reset=1&back=m`, '<button class="btn btn-outline-warning btn-sm">Réinitialiser vues, pages et workflows</button>', { confirm: "Tes modifications des vues, pages et workflows de ce module seront remplacées par la version du module. Tes données ne bougent pas. Continuer ?" })}
${form(req, `/dysizz-me/uninstall/${m.key}`, '<button class="btn btn-outline-secondary btn-sm">Retirer (garder les données)</button>', { confirm: "Retirer les pages, vues et déclencheurs de ce module ? Les tables et leurs données restent." })}
${form(req, `/dysizz-me/uninstall/${m.key}?drop=1`, `<input name="confirm" placeholder="tape ${esc(m.key)}" class="form-control form-control-sm" style="width:140px;display:inline-block"> <button class="btn btn-outline-danger btn-sm">Tout supprimer, données comprises</button>`)}
</div>`);
};

const go = (res, url, key, msg, isErr) => res.redirect(`${url}${url.includes("?") ? "&" : "?"}${isErr ? "err" : "ok"}=${encodeURIComponent(msg)}`);

const install = async (req, res) => {
  if (!isAdmin(req)) return denied(res);
  const m = MODULES.find((x) => x.key === req.params.key);
  if (!m) return res.redirect("/dysizz-me");
  const back = req.query.back === "m" ? `/dysizz-me/m/${m.key}` : "/dysizz-me";
  try {
    const log = await installModule(m, MODULES, { reset: req.query.reset === "1" });
    go(res, back, m.key, `${m.label} : ${log.length ? log.slice(0, 25).join(" · ") + (log.length > 25 ? ` · (+${log.length - 25})` : "") : "déjà à jour"}`);
  } catch (e) {
    console.error("[dysizz-me]", e);
    go(res, back, m.key, `${m.label} : ${e.message}`, true);
  }
};

const installAll = async (req, res) => {
  if (!isAdmin(req)) return denied(res);
  const done = [];
  try {
    for (const m of MODULES) { await installModule(m, MODULES); done.push(m.label); }
    go(res, "/dysizz-me", "", `Installés : ${done.join(", ")}. Ta page d'accueil : /page/accueil`);
  } catch (e) {
    console.error("[dysizz-me]", e);
    go(res, "/dysizz-me", "", `Arrêt après ${done.join(", ") || "rien"} : ${e.message}`, true);
  }
};

const uninstall = async (req, res) => {
  if (!isAdmin(req)) return denied(res);
  const m = MODULES.find((x) => x.key === req.params.key);
  if (!m) return res.redirect("/dysizz-me");
  const drop = req.query.drop === "1";
  if (drop && (req.body || {}).confirm !== m.key) return go(res, `/dysizz-me/m/${m.key}`, m.key, `Tape « ${m.key} » pour confirmer la suppression des données`, true);
  try {
    const log = await uninstallModule(m, MODULES, { dropTables: drop });
    go(res, "/dysizz-me", m.key, `${m.label} retiré : ${log.join(" · ") || "rien à retirer"}`);
  } catch (e) {
    go(res, `/dysizz-me/m/${m.key}`, m.key, e.message, true);
  }
};

module.exports = { battement, etat, settingsPage, settingsSave, settingsTest, home, detail, install, installAll, uninstall };
