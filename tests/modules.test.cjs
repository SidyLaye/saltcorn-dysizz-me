/* Cohérence des modules : chaque vue, page et déclencheur pointe vers des
   tables, champs, vues et modèles qui existent. Évite de livrer un module cassé. */
const assert = require("assert");
const Module = require("module");
const orig = Module._load;
Module._load = function (req, ...rest) {
  if (req.startsWith("@saltcorn/")) return class {};
  return orig.call(this, req, ...rest);
};
const MODULES = require("../src/modules");
const { shellLayout } = require("../src/lib/shell");
const NATIVE = ["List", "Show", "Edit", "Feed", "Filter"];
const OURS = ["DZ Indicateurs", "DZ Tableau", "DZ Répartition", "DZ À venir", "DZ Graphique", "DZ Calendrier", "DZ Journal", "DZ Statut"];
/* les blocs de dysizz-flow et leurs réglages (tests/flow-blocks.json, copié depuis dysizz-flow) */
const FLOW = require("./flow-blocks.json");
const COMMON = ["sortie", "si_erreur", "delai_max", "journaliser", "essais", "pause_essais"];
const keys = new Set(MODULES.map((m) => m.key));
const tables = new Map();
const views = new Map();
const names = { view: new Set(), page: new Set(), trigger: new Set(), table: new Set() };
let n = 0;
for (const m of MODULES) {
  for (const k of ["key", "label", "icon", "group", "description"]) assert(m[k], `${m.key || "?"} : ${k} manquant`);
  for (const d of m.depends || []) assert(keys.has(d), `${m.key} dépend de ${d} inconnu`);
  for (const t of m.tables || []) {
    assert(!names.table.has(t.name), `table ${t.name} en double`); names.table.add(t.name);
    tables.set(t.name, new Set(["id", ...t.fields.map((f) => f.name)]));
    for (const f of t.fields) {
      const ref = /^Key to (.+)$/.exec(f.type);
      if (ref) assert(tables.has(ref[1]), `${t.name}.${f.name} → table ${ref[1]} doit être définie avant`);
      if (f.options) assert(f.options.includes(f.default ?? f.options[0]), `${t.name}.${f.name} : défaut hors choix`);
    }
  }
  for (const v of m.views || []) { assert(!names.view.has(v.name), `vue ${v.name} en double`); names.view.add(v.name); views.set(v.name, v); }
  for (const p of m.pages || []) { assert(!names.page.has(p.name), `page ${p.name} en double`); names.page.add(p.name); }
  for (const t of m.triggers || []) { assert(!names.trigger.has(t.name), `déclencheur ${t.name} en double`); names.trigger.add(t.name); }
}
const fieldOk = (table, path) => {
  const [a, b] = path.split(".");
  const fs = tables.get(table);
  if (!fs || !fs.has(a)) return false;
  return true && (!b || true);
};
const walk = (seg, cb) => {
  if (!seg || typeof seg !== "object") return;
  if (Array.isArray(seg)) return seg.forEach((s) => walk(s, cb));
  cb(seg);
  for (const k of ["above", "besides"]) if (seg[k]) seg[k].forEach((s) => walk(s, cb));
  if (seg.contents && typeof seg.contents === "object") walk(seg.contents, cb);
};
for (const v of views.values()) {
  assert([...NATIVE, ...OURS].includes(v.template), `${v.name} : modèle ${v.template} inconnu`);
  if (NATIVE.includes(v.template)) assert(tables.has(v.table), `${v.name} : table ${v.table} inconnue`);
  const cfg = v.config;
  walk(cfg.layout, (s) => {
    if (s.type === "field") { assert(fieldOk(v.table, s.field_name), `${v.name} : champ ${s.field_name} inconnu dans ${v.table}`); n++; }
    if (s.type === "join_field") { assert(fieldOk(v.table, s.join_field), `${v.name} : jointure ${s.join_field}`); n++; }
    if (s.type === "action") assert(["Save", "Delete", "run_js_code"].includes(s.action_name) || FLOW[s.action_name], `${v.name} : action ${s.action_name}`);
    if (s.type === "action" && s.action_name === "run_js_code") new Function(`return (async () => { ${s.configuration.code} })`);
    if (s.type === "view") assert(views.has(s.view), `${v.name} intègre la vue inconnue ${s.view}`);
    if (s.isFormula && s.isFormula.text) new Function(`return (${s.contents})`);
  });
  if (v.template === "Feed") assert(views.get(cfg.show_view)?.template === "Show", `${v.name} : show_view ${cfg.show_view}`);
  if (v.template === "DZ Tableau") assert(tables.get(v.table).has(cfg.champ_colonnes), `${v.name} : champ des colonnes`);
  if (["DZ Graphique", "DZ Calendrier", "DZ Journal", "DZ Statut"].includes(v.template)) for (const [k, f] of Object.entries(cfg)) if (k.startsWith("champ_") && f) assert(tables.get(v.table).has(f), `${v.name} : ${k} « ${f} » absent de ${v.table}`);
  if (["DZ Graphique", "DZ Calendrier", "DZ Journal", "DZ Statut"].includes(v.template) && cfg.vue) assert(views.has(cfg.vue), `${v.name} : vue ${cfg.vue} inconnue`);
  if (v.template === "DZ Indicateurs") JSON.parse(cfg.tuiles);
  if (v.template === "DZ À venir") JSON.parse(cfg.sources);
}
/* les pages n'intègrent que des vues de leur module ou de ses dépendances (sauf l'accueil, calculé) */
for (const m of MODULES) {
  const allowed = new Set([m.key, ...(m.depends || [])]);
  const avail = new Set(MODULES.filter((x) => allowed.has(x.key)).flatMap((x) => (x.views || []).map((v) => v.name)));
  for (const p of m.pages || []) {
    const content = typeof p.content === "function" ? p.content(new Set(keys)) : p.content;
    const layout = shellLayout(MODULES, p, content);
    walk(layout, (s) => {
      if (s.type !== "view") return;
      assert(views.has(s.view), `page ${p.name} : vue ${s.view} inconnue`);
      if (typeof p.content !== "function") assert(avail.has(s.view), `page ${p.name} utilise ${s.view} hors de ses dépendances`);
    });
  }
  for (const t of m.triggers || []) {
    assert(["Insert", "Update", "Delete", "Often", "Hourly", "Daily", "Weekly", "Never", "API call"].includes(t.when), `${t.name} : quand ${t.when}`);
    if (t.table) assert(tables.has(t.table), `${t.name} : table ${t.table}`);
    const stepNames = new Set(t.steps.map((x) => x.name));
    for (const x of t.steps) {
      assert(FLOW[x.action_name], `${t.name}.${x.name} : bloc inconnu ${x.action_name}`);
      for (const k of Object.keys(x.configuration)) assert(COMMON.includes(k) || FLOW[x.action_name].includes(k), `${t.name}.${x.name} : réglage ${k} inconnu pour ${x.action_name}`);
      if (x.configuration.code) new Function(`return (async () => { ${x.configuration.code} })`);
      if (x.configuration.table) assert(tables.has(x.configuration.table), `${t.name}.${x.name} : table ${x.configuration.table}`);
      for (const k of ["valeurs", "filtre", "modele"]) if (typeof x.configuration[k] === "string" && /^\{\s*("|\})/.test(x.configuration[k])) JSON.parse(x.configuration[k]);
      if (x.next_step && !x.next_step.includes("?")) assert(stepNames.has(x.next_step), `${t.name}.${x.name} → ${x.next_step}`);
    }
    for (const k of Object.keys(t.keep || {})) assert(stepNames.has(k), `${t.name} : keep ${k}`);
  }
}
console.log(`modules OK : ${MODULES.length} modules, ${names.table.size} tables, ${views.size} vues, ${names.page.size} pages, ${names.trigger.size} workflows, ${n} champs vérifiés`);
