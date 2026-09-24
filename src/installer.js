/* dysizz-me — installation des modules.
   Un module = des tables + des vues + des pages + des déclencheurs, décrits
   dans src/modules/<module>.js. L'installation est « idempotente » : on peut
   la relancer autant de fois qu'on veut.
     - une table ou un champ manquant est créé ; une table existante n'est
       JAMAIS vidée ni modifiée (tes données restent) ;
     - une vue, page ou déclencheur manquant est créé ; s'il existe déjà et
       que tu l'as modifié, on le laisse (sauf « Réinitialiser ») ;
     - les données d'exemple ne sont ajoutées que dans une table vide. */
"use strict";
const { hash } = require("./core");
const { shellLayout, refreshShell } = require("./lib/shell");

const M = () => ({
  Table: require("@saltcorn/data/models/table"),
  Field: require("@saltcorn/data/models/field"),
  View: require("@saltcorn/data/models/view"),
  Page: require("@saltcorn/data/models/page"),
  Trigger: require("@saltcorn/data/models/trigger"),
  Plugin: require("@saltcorn/data/models/plugin"),
  db: require("@saltcorn/data/db"),
  state: require("@saltcorn/data/db/state").getState(),
});

/* ---------- état des modules (installés + empreintes) ----------
   Rangé dans la configuration du tenant (clé « dysizz_me »), pas dans
   celle du plugin : une réinstallation ou mise à jour du plugin ne l'efface pas. */
const CFG_KEY = "dysizz_me";
/* lu et écrit directement en base : le cache de configuration de Saltcorn ne garde que ses propres clés */
/* l'ancienne clé (quand la solution s'appelait dysizz-vie) est reprise une fois, sans rien perdre */
const OLD_KEY = "dysizz_vie";
const getCfg = async () => {
  const C = require("@saltcorn/data/models/config");
  const cur = await C.getConfig(CFG_KEY, null);
  if (cur) return cur;
  const old = await C.getConfig(OLD_KEY, null);
  if (old) { await C.setConfig(CFG_KEY, old); return old; }
  return {};
};
const saveCfg = async (patch) => {
  const C = require("@saltcorn/data/models/config");
  await C.setConfig(CFG_KEY, { ...(await getCfg()), ...patch });
};

/* ---------- résolution des références ---------- */
const fieldSpec = (f) => {
  const attrs = { ...(f.attributes || {}) };
  if (f.options) attrs.options = Array.isArray(f.options) ? f.options.join(",") : f.options;
  if (f.summary) attrs.summary_field = f.summary;
  if (f.default !== undefined) attrs.default = f.default;
  return { name: f.name, label: f.label || f.name, type: f.type, required: !!f.required, is_unique: !!f.unique, attributes: attrs, description: f.description || "" };
};

/* statut détaillé d'un module : ce qui existe, ce qui manque, ce que tu as modifié */
const moduleStatus = async (mod, cfg) => {
  const { Table, View, Page, Trigger } = M();
  const stamps = ((cfg || (await getCfg())).stamps || {})[mod.key] || {};
  const out = { tables: [], views: [], pages: [], triggers: [] };
  for (const t of mod.tables || []) {
    const tb = Table.findOne({ name: t.name });
    const have = tb ? new Set(tb.getFields().map((f) => f.name)) : new Set();
    out.tables.push({ name: t.name, exists: !!tb, id: tb && tb.id, missingFields: tb ? t.fields.filter((f) => !have.has(f.name)).map((f) => f.name) : [], rows: tb ? await tb.countRows({}).catch(() => null) : 0 });
  }
  for (const v of mod.views || []) {
    const ex = View.findOne({ name: v.name });
    out.views.push({ name: v.name, exists: !!ex, changed: !!(ex && stamps["v:" + v.name] && hash(ex.configuration) !== stamps["v:" + v.name]) });
  }
  for (const p of mod.pages || []) {
    const ex = Page.findOne({ name: p.name });
    out.pages.push({ name: p.name, exists: !!ex, changed: !!(ex && stamps["p:" + p.name] && hash(stripShell(ex.layout)) !== stamps["p:" + p.name]) });
  }
  for (const tr of mod.triggers || []) {
    const ex = Trigger.findOne({ name: tr.name });
    out.triggers.push({ name: tr.name, exists: !!ex, id: ex && ex.id, changed: !!(ex && stamps["t:" + tr.name] && hash((await readSteps(ex.id)).map(norm)) !== stamps["t:" + tr.name]) });
  }
  const all = [...out.tables, ...out.views, ...out.pages, ...out.triggers];
  out.installed = all.length > 0 && all.every((x) => x.exists) && out.tables.every((t) => !t.missingFields.length);
  out.partial = !out.installed && all.some((x) => x.exists);
  return out;
};

/* la coquille (menu) change à chaque module installé : on l'ignore pour détecter tes modifications */
const stripShell = (layout) => {
  const copy = JSON.parse(JSON.stringify(layout || {}));
  const walk = (s) => {
    if (!s || typeof s !== "object") return;
    if (Array.isArray(s)) return s.forEach(walk);
    if (s.type === "container" && /^dzv-(nav|top|bottom|drawer|cmdk)$/.test(s.customId || "")) { s.contents = null; return; }
    if (s.above) s.above.forEach(walk);
    if (s.besides) s.besides.forEach(walk);
    if (s.contents && typeof s.contents === "object") walk(s.contents);
  };
  walk(copy);
  return copy;
};

/* ---------- étapes de workflow ---------- */
const WS = () => require("@saltcorn/data/models/workflow_step");
const stepsOf = (wf) => wf.steps.map((st, i) => ({ ...st, next_step: st.next_step !== undefined ? st.next_step : wf.steps[i + 1] ? wf.steps[i + 1].name : "", only_if: st.only_if || "" }));
const norm = (x) => ({ name: x.name, action_name: x.action_name, configuration: x.configuration || {}, next_step: x.next_step || "", only_if: x.only_if || "" });
const readSteps = async (trigger_id) => (await WS().find({ trigger_id })).map(norm);
/* remplace les étapes ; garde les réglages « secrets » que tu as remplis (adresse, serveur…) */
const writeSteps = async (trig, want, cur, keep = {}) => {
  const db = require("@saltcorn/data/db");
  await db.deleteWhere("_sc_workflow_steps", { trigger_id: trig.id });
  for (let i = 0; i < want.length; i++) {
    const w = want[i];
    const old = cur.find((c) => c.name === w.name);
    const kept = {};
    for (const k of keep[w.name] || []) if (old && old.configuration && old.configuration[k] !== undefined && old.configuration[k] !== "") kept[k] = old.configuration[k];
    await WS().create({ trigger_id: trig.id, name: w.name, action_name: w.action_name, configuration: { ...w.configuration, ...kept }, next_step: w.next_step, only_if: w.only_if, initial_step: i === 0 });
  }
};

/* ---------- ce dont la solution a besoin ---------- */
const missingDeps = () => {
  const { state } = M();
  const miss = [];
  if (!state.viewtemplates["DZ Tableau"]) miss.push("dysizz-ui (3.2 ou plus)");
  if (!state.actions["dzf_table_chercher"]) miss.push("dysizz-flow");
  return miss;
};

/* ---------- installation ---------- */
const installModule = async (mod, allMods, { reset = false } = {}) => {
  const { Table, Field, View, Page, Trigger, state } = M();
  const miss = missingDeps();
  if (miss.length) throw new Error(`installe d'abord : ${miss.join(", ")}`);
  /* chaque module peut utiliser des vues ou des blocs plus récents : on vérifie tout avant d'écrire quoi que ce soit */
  const vts = [...new Set((mod.views || []).map((v) => v.template))].filter((t) => !state.viewtemplates[t]);
  const acts = [...new Set((mod.triggers || []).flatMap((t) => (t.steps || []).map((s) => s.action_name)))].filter((a) => !state.actions[a]);
  if (vts.length || acts.length) throw new Error(`mets à jour ${[vts.length && `dysizz-ui (vues manquantes : ${vts.join(", ")})`, acts.length && `dysizz-flow (blocs manquants : ${acts.join(", ")})`].filter(Boolean).join(" et ")}`);
  const log = [];
  const cfg = await getCfg();
  const installed = new Set(cfg.installed || []);
  for (const d of mod.depends || []) if (!installed.has(d)) {
    const dep = allMods.find((m) => m.key === d);
    if (dep) log.push(...(await installModule(dep, allMods)).map((l) => `[${dep.label}] ${l}`));
  }
  const stamps = { ...((await getCfg()).stamps || {}) };
  const my = { ...(stamps[mod.key] || {}) };

  /* 1. tables et champs (dans l'ordre : une clé vers une table suppose qu'elle existe) */
  for (const t of mod.tables || []) {
    let tb = Table.findOne({ name: t.name });
    if (!tb) {
      tb = await Table.create(t.name, { min_role_read: 1, min_role_write: 1, description: t.description || "" });
      log.push(`table ${t.name} créée`);
    }
    await state.refresh_tables?.(true);
    tb = Table.findOne({ name: t.name });
    const have = new Set(tb.getFields().map((f) => f.name));
    for (const f of t.fields) {
      if (have.has(f.name)) {
        /* un champ qui n'est plus « unique » dans une nouvelle version : on retire la contrainte */
        const exf = tb.getFields().find((x) => x.name === f.name);
        if (f.is_unique === false && exf && exf.is_unique) { try { await exf.update({ is_unique: false }); log.push(`champ ${t.name}.${f.name} : plus unique`); } catch (e) { log.push(`champ ${t.name}.${f.name} : ${e.message}`); } }
        continue;
      }
      await Field.create({ table: tb, ...fieldSpec(f) });
      log.push(`champ ${t.name}.${f.name} ajouté`);
    }
  }
  await state.refresh_tables?.(true);

  /* 2. données de départ : une seule fois par module. Dans une table vide, ou
        (seedMerge) en ajoutant celles qui manquent, repérées par un champ (ex. nom) */
  for (const [tname, rows] of Object.entries(mod.seeds || {})) {
    const tb = Table.findOne({ name: tname });
    if (!tb || my["s:" + tname]) continue;
    const mergeKey = (mod.seedMerge || {})[tname];
    let n = 0;
    if (mergeKey) {
      for (const r of rows) if (!(await tb.getRow({ [mergeKey]: r[mergeKey] }))) { await tb.insertRow(await resolveRefs(r)); n++; }
    } else if ((await tb.countRows({})) === 0) {
      for (const r of rows) { await tb.insertRow(await resolveRefs(r)); n++; }
    }
    my["s:" + tname] = 1;
    if (n) log.push(`${n} lignes de départ dans ${tname}`);
  }

  /* 3. vues */
  for (const v of mod.views || []) {
    const tb = v.table ? Table.findOne({ name: v.table }) : null;
    const ex = View.findOne({ name: v.name });
    const cfgV = typeof v.config === "function" ? v.config() : v.config;
    const attrs = { ...(v.title ? { popup_title: v.title, page_title: v.title } : {}), ...(v.width ? { popup_width: v.width, popup_width_units: "px" } : {}) };
    if (!ex) {
      await View.create({ name: v.name, table_id: tb ? tb.id : null, viewtemplate: v.template, configuration: cfgV, min_role: v.min_role || 1, description: v.description || "", attributes: attrs });
      log.push(`vue ${v.name} créée`);
    } else if (reset || !my["v:" + v.name] || hash(ex.configuration) === my["v:" + v.name]) {
      await View.update({ configuration: cfgV, viewtemplate: v.template, table_id: tb ? tb.id : null, description: v.description || "", attributes: { ...(ex.attributes || {}), ...attrs } }, ex.id);
      if (reset) log.push(`vue ${v.name} réinitialisée`);
      else if (hash(ex.configuration) !== hash(cfgV)) log.push(`vue ${v.name} mise à jour`);
    } else log.push(`vue ${v.name} gardée (tu l'as modifiée)`);
    my["v:" + v.name] = hash(cfgV);
  }
  await state.refresh_views?.(true);

  /* 4. workflows : un déclencheur « Workflow » et ses étapes, faites de blocs dysizz-flow */
  for (const wf of mod.triggers || []) {
    const tb = wf.table ? Table.findOne({ name: wf.table }) : null;
    const ex = Trigger.findOne({ name: wf.name });
    const def = { name: wf.name, description: wf.description || "", action: "Workflow", when_trigger: wf.when, table_id: tb ? tb.id : null, configuration: {}, min_role: 1 };
    const want = stepsOf(wf);
    /* l'empreinte gardée est celle des étapes vraiment écrites (avec tes réglages conservés),
       pour qu'une prochaine mise à jour sache si tu as modifié le workflow depuis */
    if (!ex) {
      const created = await Trigger.create(def);
      const tid = created.id || (Trigger.findOne({ name: wf.name }) || {}).id;
      await writeSteps(created, want, []);
      log.push(`workflow ${wf.name} créé (${want.length} étapes)`);
      my["t:" + wf.name] = hash((await readSteps(tid)).map(norm));
    } else {
      const cur = await readSteps(ex.id);
      if (reset || !my["t:" + wf.name] || hash(cur.map(norm)) === my["t:" + wf.name] || hash(cur.map(norm)) === hash(want.map(norm))) {
        await Trigger.update(ex.id, { ...def, when_trigger: reset ? wf.when : ex.when_trigger });
        await writeSteps(ex, want, cur, wf.keep || {});
        my["t:" + wf.name] = hash((await readSteps(ex.id)).map(norm));
      } else log.push(`workflow ${wf.name} gardé (tu l'as modifié)`);
    }
  }
  await state.refresh_triggers?.(true);

  /* 5. pages (avec la coquille commune) */
  installed.add(mod.key);
  const mods = allMods.filter((m) => installed.has(m.key));
  for (const p of mod.pages || []) {
    const ex = Page.findOne({ name: p.name });
    /* shell: false = page sans menu de Me (ex. page de statut publique) */
    const layout = p.shell === false ? { above: contentOf(p, installed) } : shellLayout(mods, p, contentOf(p, installed));
    if (!ex) {
      await Page.create({ name: p.name, title: p.title, description: p.description || "", min_role: p.min_role || 1, layout, fixed_states: {}, attributes: { no_menu: p.shell !== false, request_fluid_layout: true } });
      log.push(`page ${p.name} créée`);
    } else if (reset || !my["p:" + p.name] || hash(stripShell(ex.layout)) === my["p:" + p.name]) {
      await Page.update(ex.id, { layout, title: p.title, description: p.description || "", attributes: { ...(ex.attributes || {}), no_menu: true, request_fluid_layout: true } });
    } else log.push(`page ${p.name} gardée (tu l'as modifiée)`);
    my["p:" + p.name] = hash(stripShell(layout));
  }

  stamps[mod.key] = my;
  await saveCfg({ installed: [...installed], stamps });
  await refreshAllShells(allMods);
  if (mod.key === "accueil" || installed.has("accueil")) await setHome();
  /* tes réglages (page « Régler ») sont réappliqués aux workflows qui viennent d'être (ré)écrits */
  const saved = ((await getCfg()).settings || {})[mod.key];
  if (mod.settings && saved) { try { await require("./settings").applyToWorkflows(mod, saved); } catch (e) { log.push(`réglages non réappliqués : ${e.message}`); } }
  return log;
};

/* ---------- retrait : pages, vues et déclencheurs ; les tables seulement si demandé ---------- */
const uninstallModule = async (mod, allMods, { dropTables = false } = {}) => {
  const { Table, View, Page, Trigger, state } = M();
  const cfg = await getCfg();
  const installed = new Set(cfg.installed || []);
  const users = allMods.filter((m) => m.key !== mod.key && installed.has(m.key) && (m.depends || []).includes(mod.key));
  if (users.length) throw new Error(`D'abord retirer : ${users.map((u) => u.label).join(", ")} (ils utilisent ce module)`);
  const log = [];
  for (const p of mod.pages || []) { const ex = Page.findOne({ name: p.name }); if (ex) { await ex.delete(); log.push(`page ${p.name} retirée`); } }
  for (const tr of mod.triggers || []) { const ex = Trigger.findOne({ name: tr.name }); if (ex) { await ex.delete(); log.push(`workflow ${tr.name} retiré`); } }
  /* les vues d'autres modules peuvent intégrer celles-ci : on retire dans l'ordre inverse */
  for (const v of [...(mod.views || [])].reverse()) { const ex = View.findOne({ name: v.name }); if (ex) { await View.delete({ id: ex.id }); log.push(`vue ${v.name} retirée`); } }
  if (dropTables) {
    for (const t of [...(mod.tables || [])].reverse()) {
      const tb = Table.findOne({ name: t.name });
      if (tb) { await tb.delete(); log.push(`table ${t.name} SUPPRIMÉE avec ses données`); }
    }
  }
  await state.refresh?.(true);
  installed.delete(mod.key);
  const stamps = { ...(cfg.stamps || {}) };
  delete stamps[mod.key];
  await saveCfg({ installed: [...installed], stamps });
  await refreshAllShells(allMods);
  return log;
};

const contentOf = (p, installed) => (typeof p.content === "function" ? p.content(installed) : p.content);

/* le menu de toutes les pages de modules suit la liste des modules installés ;
   une page dont le contenu dépend des modules présents (l'accueil) est
   recalculée, sauf si tu l'as modifiée à la main */
const refreshAllShells = async (allMods) => {
  const { Page, state } = M();
  const cfg = await getCfg();
  const installed = new Set(cfg.installed || []);
  const stamps = { ...(cfg.stamps || {}) };
  let stampsChanged = false;
  const mods = allMods.filter((m) => installed.has(m.key));
  for (const m of mods) for (const p of m.pages || []) {
    const ex = Page.findOne({ name: p.name });
    if (!ex || p.shell === false) continue;
    const my = stamps[m.key] || {};
    if (typeof p.content === "function" && (!my["p:" + p.name] || hash(stripShell(ex.layout)) === my["p:" + p.name])) {
      const layout = shellLayout(mods, p, contentOf(p, installed));
      await Page.update(ex.id, { layout });
      stamps[m.key] = { ...my, ["p:" + p.name]: hash(stripShell(layout)) };
      stampsChanged = true;
      continue;
    }
    const layout = JSON.parse(JSON.stringify(ex.layout));
    if (refreshShell(layout, mods, p)) await Page.update(ex.id, { layout });
  }
  if (stampsChanged) await saveCfg({ stamps });
  await state.refresh_pages?.(true);
};

/* la page d'accueil du module devient celle de l'administrateur */
const setHome = async () => {
  try {
    const { Page, state } = M();
    if (!Page.findOne({ name: "accueil" })) return;
    const cfg = await getCfg();
    if (cfg.home_set) return;
    /* seulement pour le rôle admin, et seulement si tu n'as rien choisi */
    const byRole = state.getConfigCopy("home_page_by_role", {}) || {};
    if (!byRole[1]) { byRole[1] = "accueil"; await state.setConfig("home_page_by_role", byRole); }
    await saveCfg({ home_set: true });
  } catch (e) { /* pas bloquant */ }
};

/* {"$ref":"table","champ":"valeur"} → id de la ligne correspondante */
const resolveRefs = async (row) => {
  const { Table } = M();
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v && typeof v === "object" && v.$ref) {
      const { $ref, ...where } = v;
      const tb = Table.findOne({ name: $ref });
      const r = tb && (await tb.getRow(where));
      out[k] = r ? r.id : null;
    } else if (v && typeof v === "object" && v.$daysFromNow !== undefined) {
      const d = new Date(); d.setHours(9, 0, 0, 0); d.setDate(d.getDate() + v.$daysFromNow);
      out[k] = d.toISOString();
    } else out[k] = v;
  }
  return out;
};

/* après une modification faite par Me lui-même (ex. page Régler) : ce n'est pas « toi » qui as modifié */
const restamp = async (modKey, triggerName) => {
  const { Trigger } = M();
  const t = Trigger.findOne({ name: triggerName });
  if (!t) return;
  const cfg = await getCfg();
  const stamps = { ...(cfg.stamps || {}) };
  stamps[modKey] = { ...(stamps[modKey] || {}), ["t:" + triggerName]: hash((await readSteps(t.id)).map(norm)) };
  await saveCfg({ stamps });
};

module.exports = { restamp, missingDeps, installModule, uninstallModule, moduleStatus, getCfg, saveCfg, refreshAllShells };
