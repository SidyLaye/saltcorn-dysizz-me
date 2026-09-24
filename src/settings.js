/* Réglages d'un module, sans passer par les workflows :
   /dysizz-me/reglages/:key — un formulaire simple, un bouton « Tester »,
   et à l'enregistrement :
     - les mots de passe vont dans le coffre chiffré de dysizz-flow (jamais en clair) ;
     - les autres valeurs sont gardées dans la configuration de Me ;
     - elles sont recopiées dans les étapes de workflow concernées.

   Un module déclare :
   settings: {
     intro: "texte",
     fields: [{ name, label, help, type: "text|email|password|number|select|bool", options: [[valeur, libellé]], default, required, secret: "NOM_DU_SECRET" }],
     apply: [{ trigger, step, json: "valeurs", map: { cle_etape: "champ" } } | { trigger, step, set: { cle: valeur } }],
     test: { action: "dzf_…", config: (v) => ({…}), ok: (resultat, v) => "message" },
   } */
"use strict";
const { esc } = require("./core");

const flowApi = () => {
  try { const p = require("@saltcorn/data/db/state").getState().plugins["dysizz-flow"]; return p && p.dysizz_flow_api; } catch (e) { return null; }
};
const hasSecret = async (name) => {
  if (process.env[name]) return "env";
  const api = flowApi();
  try { return api && (await api.hasSecret(name)) ? "coffre" : ""; } catch (e) { return ""; }
};

const values = async (mod, cfg) => ({ ...Object.fromEntries((mod.settings.fields || []).filter((f) => !f.secret).map((f) => [f.name, f.default ?? ""])), ...(((cfg || {}).settings || {})[mod.key] || {}) });

/* un module est « configuré » quand ses champs obligatoires ont une valeur (ou un secret rangé) */
const configured = async (mod, cfg) => {
  if (!mod.settings) return true;
  const v = await values(mod, cfg);
  for (const f of mod.settings.fields || []) {
    if (!f.required) continue;
    if (f.secret ? !(await hasSecret(f.secret)) : !String(v[f.name] ?? "").trim()) return false;
  }
  return true;
};

const applyToWorkflows = async (mod, v) => {
  const Trigger = require("@saltcorn/data/models/trigger");
  const WorkflowStep = require("@saltcorn/data/models/workflow_step");
  const done = [];
  for (const a of mod.settings.apply || []) {
    const t = Trigger.findOne({ name: a.trigger });
    if (!t) continue;
    const s = (await WorkflowStep.find({ trigger_id: t.id })).find((x) => x.name === a.step);
    if (!s) continue;
    const c = { ...(s.configuration || {}) };
    if (a.json) {
      let o = {};
      try { o = typeof c[a.json] === "string" ? JSON.parse(c[a.json] || "{}") : c[a.json] || {}; } catch (e) { o = {}; }
      for (const [k, f] of Object.entries(a.map || {})) o[k] = typeof f === "function" ? f(v) : v[f];
      c[a.json] = JSON.stringify(o);
    }
    for (const [k, x] of Object.entries(a.set || {})) c[k] = typeof x === "function" ? x(v) : x;
    await s.update({ configuration: c });
    done.push(`${a.trigger} → ${a.step}`);
  }
  return done;
};

const inputHtml = (f, v, secretState) => {
  const id = `s_${f.name}`;
  const help = f.help ? `<small>${f.help}</small>` : "";
  if (f.type === "bool") return `<label class="dzs-check"><input type="checkbox" name="${esc(f.name)}" ${v === true || v === "on" || v === "true" ? "checked" : ""}> ${esc(f.label)}</label>${help}`;
  let input;
  if (f.type === "select") input = `<select class="form-select" id="${id}" name="${esc(f.name)}">${(f.options || []).map(([ov, ol]) => `<option value="${esc(ov)}"${String(ov) === String(v) ? " selected" : ""}>${esc(ol)}</option>`).join("")}</select>`;
  else if (f.type === "password") input = `<input class="form-control" type="password" id="${id}" name="${esc(f.name)}" autocomplete="new-password" placeholder="${secretState ? "•••••••• (déjà rangé, laisse vide pour garder)" : ""}">`;
  else input = `<input class="form-control" type="${f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}" id="${id}" name="${esc(f.name)}" value="${esc(v ?? "")}"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ""}>`;
  const badge = f.type === "password" ? (secretState === "env" ? '<span class="dzs-b ok">variable du serveur</span>' : secretState ? '<span class="dzs-b ok">rangé dans le coffre</span>' : '<span class="dzs-b">pas encore rangé</span>') : "";
  return `<label for="${id}">${esc(f.label)}${f.required ? ' <span class="req">*</span>' : ""} ${badge}</label>${input}${help}`;
};

const CSS = `.dzs{max-width:760px;margin:0 auto}.dzs h1{font-weight:750;letter-spacing:-.02em;display:flex;gap:.7rem;align-items:center}
.dzs-card{border:1px solid var(--dzv-border,#ddd);border-radius:16px;background:var(--dzv-surface,#fff);padding:1.3rem 1.4rem;display:flex;flex-direction:column;gap:1rem}
.dzs-f{display:flex;flex-direction:column;gap:.3rem}.dzs-f label{font-weight:650;font-size:.9rem}.dzs-f small{color:var(--dzv-mute,#777);font-size:.8rem}.dzs-f .req{color:#e5484d}
.dzs-check{display:flex!important;gap:.5rem;align-items:center;font-weight:500!important}
.dzs-b{font:600 .68rem ui-monospace,monospace;text-transform:uppercase;padding:.12rem .45rem;border-radius:6px;background:var(--dzv-surface-2,#eee);color:var(--dzv-mute,#777);margin-left:.3rem}.dzs-b.ok{background:rgba(48,164,108,.15);color:#1f8a57}
.dzs-intro{color:var(--dzv-soft,#555);line-height:1.6}.dzs-bar{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
.dzs-res{padding:.8rem 1rem;border-radius:12px;font-size:.9rem;display:none}.dzs-res.ok{display:block;background:rgba(48,164,108,.12);color:#1f7a4d}.dzs-res.ko{display:block;background:rgba(229,72,77,.1);color:#c0343a}
.dzs-steps{counter-reset:s;list-style:none;padding:0;display:flex;flex-direction:column;gap:.6rem}.dzs-steps li{display:flex;gap:.7rem;align-items:flex-start}
.dzs-steps li::before{counter-increment:s;content:counter(s);width:26px;height:26px;border-radius:50%;background:var(--dzv-primary,#5b5bf0);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.8rem;flex:none}
.dzs-flash{padding:.8rem 1rem;border-radius:12px;margin-bottom:1rem}.dzs-flash.ok{background:rgba(48,164,108,.12)}.dzs-flash.ko{background:rgba(229,72,77,.1)}`;

const page = async (req, res, mod) => {
  const { getCfg } = require("./installer");
  const cfg = await getCfg();
  const v = await values(mod, cfg);
  const S = mod.settings;
  const secretStates = {};
  for (const f of S.fields) if (f.secret) secretStates[f.name] = await hasSecret(f.secret);
  const q = req.query || {};
  const csrf = req.csrfToken ? req.csrfToken() : "";
  const installed = (cfg.installed || []).includes(mod.key);
  const html = `<style>${CSS}</style><div class="dzs">
<p><a href="/dysizz-me">← Modules de Me</a></p>
<h1><i class="${esc(mod.icon)}"></i> Régler ${esc(mod.label)}</h1>
${q.ok ? `<div class="dzs-flash ok">${esc(q.ok)}</div>` : ""}${q.err ? `<div class="dzs-flash ko">${esc(q.err)}</div>` : ""}
${!installed ? `<div class="dzs-flash ko">Ce module n'est pas encore installé : installe-le depuis la page des modules, puis reviens ici.</div>` : ""}
${!flowApi() && S.fields.some((f) => f.secret) ? `<div class="dzs-flash ko">Le coffre de dysizz-flow est introuvable : mets à jour dysizz-flow (2.1 ou plus) pour ranger les mots de passe ici.</div>` : ""}
<form class="dzs-card" method="post" action="/dysizz-me/reglages/${esc(mod.key)}" id="dzs-form" autocomplete="off">
<input type="hidden" name="_csrf" value="${esc(csrf)}">
${S.intro ? `<div class="dzs-intro">${S.intro}</div>` : ""}
${S.fields.map((f) => `<div class="dzs-f">${inputHtml(f, v[f.name], secretStates[f.name])}</div>`).join("")}
<div class="dzs-res" id="dzs-res"></div>
<div class="dzs-bar">${S.test ? `<button type="button" class="btn btn-outline-secondary" id="dzs-test"><i class="fas fa-plug"></i> Tester</button>` : ""}
<button class="btn btn-primary"><i class="fas fa-check"></i> Enregistrer</button>
${installed && (mod.pages || [])[0] ? `<a class="btn btn-link" href="/page/${esc(mod.pages[0].name)}">Ouvrir ${esc(mod.label)}</a>` : ""}</div>
<small style="color:var(--dzv-mute,#777)">Les mots de passe sont chiffrés dans le coffre de dysizz-flow et ne sont plus jamais réaffichés.</small>
</form></div>
<script>(function(){var b=document.getElementById("dzs-test");if(!b)return;b.addEventListener("click",function(){var f=document.getElementById("dzs-form"),r=document.getElementById("dzs-res");r.className="dzs-res ok";r.textContent="Test en cours…";b.disabled=true;
fetch("/dysizz-me/reglages/${esc(mod.key)}/tester",{method:"POST",credentials:"same-origin",headers:{"CSRF-Token":${JSON.stringify(csrf)}},body:new URLSearchParams(new FormData(f))}).then(function(x){return x.json()}).then(function(j){b.disabled=false;r.className="dzs-res "+(j.ok?"ok":"ko");r.textContent=j.message}).catch(function(e){b.disabled=false;r.className="dzs-res ko";r.textContent=e.message})})})();</script>`;
  res.sendWrap({ title: `Régler ${mod.label}`, requestFluidLayout: false }, { above: [{ type: "blank", isHTML: true, contents: html.replace(/\{\{/g, "&#123;&#123;").replace(/\}\}/g, "&#125;&#125;") }] });
};

/* valeurs du formulaire : les mots de passe vides veulent dire « garder l'ancien » */
const readForm = (mod, body) => {
  const out = {}, secrets = {};
  for (const f of mod.settings.fields) {
    let x = body[f.name];
    if (f.type === "bool") x = x === "on" || x === "true" || x === true;
    else x = String(x ?? "").trim();
    if (f.type === "number" && x !== "") x = Number(x);
    if (f.secret) { if (x) secrets[f.secret] = x; } else out[f.name] = x;
  }
  return { out, secrets };
};

const save = async (req, res, mod) => {
  const { getCfg, saveCfg } = require("./installer");
  const back = (k, m) => res.redirect(`/dysizz-me/reglages/${mod.key}?${k}=${encodeURIComponent(m)}`);
  try {
    const { out, secrets } = readForm(mod, req.body || {});
    for (const f of mod.settings.fields) if (f.required && !f.secret && out[f.name] === "") return back("err", `« ${f.label} » est obligatoire`);
    if (Object.keys(secrets).length) {
      const api = flowApi();
      if (!api) return back("err", "Coffre introuvable : mets à jour dysizz-flow");
      for (const [n, val] of Object.entries(secrets)) await api.writeSecret(n, val, `Me · ${mod.label}`);
    }
    for (const f of mod.settings.fields) if (f.required && f.secret && !(await hasSecret(f.secret))) return back("err", `« ${f.label} » est obligatoire`);
    const cfg = await getCfg();
    await saveCfg({ settings: { ...(cfg.settings || {}), [mod.key]: out } });
    const done = await applyToWorkflows(mod, out);
    back("ok", `Réglages enregistrés${done.length ? " et appliqués aux workflows" : ""}. ${mod.settings.after || ""}`);
  } catch (e) { back("err", e.message); }
};

const test = async (req, res, mod) => {
  const T = mod.settings.test;
  const reply = (ok, message) => res.json({ ok, message });
  if (!T) return reply(false, "Pas de test pour ce module");
  const action = require("@saltcorn/data/db/state").getState().actions[T.action];
  if (!action) return reply(false, `Bloc ${T.action} introuvable : dysizz-flow est-il installé ?`);
  const { getCfg } = require("./installer");
  const { out, secrets } = readForm(mod, req.body || {});
  const v = { ...(await values(mod, await getCfg())), ...out };
  /* un mot de passe tapé mais pas encore enregistré : on le range d'abord (sinon impossible de tester) */
  if (Object.keys(secrets).length) {
    const api = flowApi();
    if (!api) return reply(false, "Coffre introuvable : mets à jour dysizz-flow");
    for (const [n, val] of Object.entries(secrets)) await api.writeSecret(n, val, `Me · ${mod.label}`);
  }
  try {
    const r = await Promise.race([action.run({ configuration: { ...T.config(v), sortie: "r", delai_max: 40 }, row: {}, user: req.user, req, mode: "workflow" }), new Promise((_, rej) => setTimeout(() => rej(new Error("pas de réponse après 45 s")), 45000))]);
    reply(true, T.ok ? T.ok(r && r.r, v) : "Ça marche.");
  } catch (e) {
    reply(false, (T.explain ? T.explain(e.message) : "") || `Échec : ${e.message}`);
  }
};

module.exports = { page, save, test, configured, values, applyToWorkflows };
