/* dysizz-me 2.2.1 — FICHIER GÉNÉRÉ par tools/build.mjs depuis src/. Ne pas modifier à la main. */
"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/core.js
var require_core = __commonJS({
  "src/core.js"(exports2, module2) {
    "use strict";
    var PLUGIN2 = "dysizz-me";
    var VERSION = true ? "2.2.1" : "dev";
    var isAdmin = (req) => !!(req && req.user && req.user.role_id === 1);
    var esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
    var denied = (res) => res.status(403).send("R\xE9serv\xE9 aux administrateurs");
    var stable = (v) => Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().filter((k) => k !== "rndid").map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v);
    var hash = (v) => {
      const s = stable(v);
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0).toString(36);
    };
    var plain = (html, max = 0) => {
      let s = String(html == null ? "" : html).replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => {
        try {
          return String.fromCodePoint(+n);
        } catch (e) {
          return " ";
        }
      }).replace(/&#x([0-9a-f]+);/gi, (_, n) => {
        try {
          return String.fromCodePoint(parseInt(n, 16));
        } catch (e) {
          return " ";
        }
      }).replace(/[ \t\r\f\v]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
      if (max && s.length > max) s = s.slice(0, max - 1).replace(/\s+\S*$/, "") + "\u2026";
      return s;
    };
    var safeUrl = (u) => /^https?:\/\//i.test(String(u || "")) ? String(u).slice(0, 1e3) : "";
    module2.exports = { PLUGIN: PLUGIN2, VERSION, isAdmin, esc, denied, hash, stable, plain, safeUrl };
  }
});

// src/lib/layout.js
var require_layout = __commonJS({
  "src/lib/layout.js"(exports2, module2) {
    "use strict";
    var field = (name, fieldview = "show", o = {}) => ({ type: "field", field_name: name, fieldview, textStyle: o.style || "", block: !!o.block, configuration: o.cfg || {}, ...o.cls ? { class: o.cls } : {} });
    var join = (path, fieldview = "as_text", o = {}) => ({ type: "join_field", join_field: path, fieldview, textStyle: o.style || "", block: !!o.block, configuration: o.cfg || {} });
    var text = (html, o = {}) => ({ type: "blank", contents: html, isHTML: o.html !== false, block: o.block !== false, textStyle: o.style || "", customClass: o.cls || "" });
    var formula = (expr, o = {}) => ({ type: "blank", contents: expr, isFormula: { text: true }, isHTML: !!o.html, block: o.block !== false, textStyle: o.style || "", customClass: o.cls || "" });
    var box = (cls, ...children) => {
      let opts = {};
      if (children.length && children[0] && children[0].__opts) opts = children.shift();
      const c = { type: "container", customClass: cls, contents: children.length === 1 ? children[0] : { above: children }, htmlElement: opts.el || "div" };
      if (opts.url) {
        c.url = opts.url;
        if (opts.urlFormula) c.isFormula = { ...c.isFormula || {}, url: true };
      }
      if (opts.clsFormula) c.isFormula = { ...c.isFormula || {}, customClass: true };
      if (opts.showIf) c.showIfFormula = opts.showIf;
      if (opts.id) {
        c.customId = opts.id;
        if (opts.id.includes("`")) c.isFormula = { ...c.isFormula || {}, customId: true };
      }
      if (opts.style) c.style = opts.style;
      return c;
    };
    var O = (o) => ({ __opts: true, ...o });
    var row = (widths, ...cols) => ({ besides: cols, widths, breakpoints: widths.map(() => "md"), aligns: widths.map(() => "start"), style: {} });
    var above = (...xs) => ({ above: xs });
    var image = (urlExpr, o = {}) => ({ type: "image", srctype: "URL", url: urlExpr, isFormula: { url: true }, alt: o.alt || "", customClass: o.cls || "", style: o.style || {}, block: false });
    var link = (textExpr, urlExpr, o = {}) => ({ type: "link", text: textExpr, url: urlExpr, isFormula: { text: true, url: true }, target_blank: o.blank !== false, link_class: o.cls || "", link_style: "", link_size: "", block: !!o.block, textStyle: "" });
    var action = (name, label, o = {}) => ({
      type: "action",
      action_name: name,
      action_label: label || " ",
      action_style: o.style || "btn-outline-secondary",
      action_size: o.size || "btn-sm",
      action_icon: o.icon || "",
      block: false,
      minRole: o.minRole || 1,
      confirm: !!o.confirm,
      configuration: o.cfg || {},
      rndid: o.id || Math.random().toString(16).slice(2, 8),
      ...o.cls ? { action_class: o.cls } : {}
    });
    var vlink = (view2, label, o = {}) => ({
      type: "view_link",
      view: view2,
      view_label: label,
      in_modal: o.modal !== false,
      link_style: o.style || "",
      link_size: o.size || "",
      link_icon: o.icon || "",
      textStyle: "",
      block: false,
      minRole: o.minRole || 1,
      ...o.cls ? { link_class: o.cls } : {},
      ...o.labelFormula ? { isFormula: { label: true } } : {}
    });
    var view = (name, o = {}) => ({ type: "view", view: name, name: o.id || name.replace(/[^a-z0-9]/gi, "").slice(0, 12), state: o.state || "shared", ...o.fixed ? { configuration: o.fixed } : {}, ...o.relation ? { relation: o.relation } : {} });
    var columnsOf = (layout) => {
      const cols = [];
      const walk = (s) => {
        if (!s) return;
        if (Array.isArray(s)) return s.forEach(walk);
        if (s.above) return s.above.forEach(walk);
        if (s.besides) return s.besides.forEach(walk);
        if (s.type === "container") return walk(s.contents);
        const { type, ...rest } = s;
        if (type === "field") cols.push({ type: "Field", ...rest });
        else if (type === "join_field") cols.push({ type: "JoinField", ...rest });
        else if (type === "action") cols.push({ type: "Action", ...rest });
        else if (type === "view_link") cols.push({ type: "ViewLink", ...rest });
        else if (s.type === "tabs") (s.contents || []).forEach(walk);
      };
      walk(layout);
      return cols;
    };
    var editConfig = (fields, o = {}) => {
      const rows = fields.map((f) => {
        const [name, label, fv = "edit"] = f;
        return box("dzv-field", text(`<label class="dzv-label" for="input${name}">${label}</label>`, { html: true }), field(name, fv));
      });
      const grid = box(o.cols === 1 ? "dzv-form" : "dzv-form dzv-form-2", ...rows);
      const btns = box(
        "dzv-form-actions",
        action("Save", o.saveLabel || "Enregistrer", { style: "btn-primary", size: "", icon: "fas fa-check" }),
        ...o.delete ? [action("Delete", "Supprimer", { style: "btn-outline-danger", size: "", icon: "fas fa-trash", confirm: true })] : []
      );
      const layout = above(grid, btns);
      return {
        layout,
        columns: columnsOf(layout),
        destination_type: "Back to referer",
        view_when_done: o.done || "",
        auto_save: false,
        split_paste: false,
        confirm_leave: false
      };
    };
    var showConfig = (layout) => ({ layout, columns: columnsOf(layout), page_title: "", page_title_formula: false });
    var listConfig = (cols, o = {}) => {
      const besides = cols.map(([label, seg]) => ({ header_label: label, contents: seg, ...seg.__align ? { alignment: seg.__align } : {} }));
      const layout = { list_columns: true, besides };
      return {
        layout,
        columns: columnsOf(besides.map((b) => b.contents)),
        default_state: {
          _order_field: o.order || "id",
          _descending: o.desc !== false,
          _rows_per_page: o.limit || 50,
          _hover_rows: true,
          _omit_header: !!o.noHeader,
          _responsive_collapse: false,
          _row_click_type: o.rowClick ? o.rowClickType || "Popup" : "Nothing",
          ...o.rowClick ? { _row_click_url_formula: o.rowClick } : {},
          ...o.include ? { include_fml: o.include } : {},
          ...o.state || {}
        },
        ...o.create ? { view_to_create: o.create, create_view_display: "Popup", create_view_label: o.createLabel || "Ajouter", create_view_location: "Top right", create_link_style: "btn btn-primary", create_link_size: "btn-sm" } : {},
        hide_null_columns: false,
        transpose: false
      };
    };
    var feedConfig = (showView, o = {}) => ({
      show_view: showView,
      order_field: o.order || "id",
      descending: o.desc !== false,
      cols_sm: 1,
      cols_md: o.md || 2,
      cols_lg: o.lg || 3,
      cols_xl: o.xl || o.lg || 3,
      in_card: false,
      masonry_container: false,
      rows_per_page: o.limit || 24,
      hide_pagination: !!o.noPagination,
      ...o.create ? { view_to_create: o.create, create_view_display: "Popup", create_view_label: o.createLabel || "Ajouter", create_view_location: "Top right", create_link_style: "btn btn-primary", create_link_size: "btn-sm" } : {},
      ...o.groupby ? { groupby: o.groupby } : {},
      ...o.include ? { include_fml: o.include } : {},
      ...o.exclude ? { exclusion_where: o.exclude } : {},
      always_create_view: !!o.create,
      _omit_header: true,
      ...o.empty ? { empty_view: "" } : {}
    });
    module2.exports = { link, field, join, text, formula, box, O, row, above, image, action, vlink, view, columnsOf, editConfig, showConfig, listConfig, feedConfig };
  }
});

// src/lib/shell.js
var require_shell = __commonJS({
  "src/lib/shell.js"(exports2, module2) {
    "use strict";
    var { esc } = require_core();
    var { box, O, text } = require_layout();
    var GROUPS = ["Aujourd'hui", "Organisation", "Vie perso", "Travail", "Veille", "Syst\xE8me"];
    var navItems = (mods) => mods.flatMap((m) => (m.nav || []).map((n) => ({ ...n, module: m.key }))).sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || (a.order || 50) - (b.order || 50));
    var sideHtml = (items, current) => {
      let html = `<a class="dz-brand dzv-brand" href="/page/accueil"><span class="dz-brand-mark"></span>Me</a>
<button class="dz-search dzv-search" type="button" data-dz-cmdk-open><i class="fas fa-search"></i><span>Aller \xE0\u2026</span><span class="dz-kbd">Ctrl K</span></button>`;
      let g = null;
      for (const it of items) {
        if (it.group !== g) {
          g = it.group;
          html += `<div class="dz-side-label">${esc(g)}</div>`;
        }
        html += `<a class="dz-side-item${it.page === current ? " dz-active" : ""}" href="/page/${esc(it.page)}"><i class="${esc(it.icon)}"></i>${esc(it.label)}</a>`;
      }
      html += `<div class="dz-side-foot dzv-side-foot"><a href="/dysizz-me" class="dzv-foot-link"><i class="fas fa-puzzle-piece"></i>Modules</a><button class="dz-btn dz-btn-ghost dz-icon-btn dz-theme-btn" data-dz-theme-toggle aria-label="Th\xE8me"><i class="fas fa-moon dz-moon"></i><i class="fas fa-sun dz-sun"></i></button></div>`;
      return html;
    };
    var topHtml = (title, icon, quick) => `
<button class="dz-btn dz-btn-ghost dz-icon-btn dzv-only-mobile" type="button" data-dz-open="#dzv-drawer" aria-label="Menu"><i class="fas fa-bars"></i></button>
<h1 class="dzv-title"><i class="${esc(icon)}"></i>${esc(title)}</h1>
<div class="dzv-top-actions">
  ${quick ? `<a class="dz-btn dz-btn-primary dz-btn-sm" href="javascript:ajax_modal('${esc(quick.url)}')"><i class="fas fa-plus"></i><span class="dzv-hide-sm">${esc(quick.label)}</span></a>` : ""}
  <button class="dz-btn dz-btn-ghost dz-icon-btn" type="button" data-dz-cmdk-open aria-label="Rechercher"><i class="fas fa-search"></i></button>
</div>
<div class="dzv-setup-hint" hidden></div><script>(function(){var el=document.currentScript.previousElementSibling;fetch("/dysizz-me/etat?page="+encodeURIComponent(location.pathname.split("/").pop()),{credentials:"same-origin"}).then(function(r){return r.ok?r.json():null}).then(function(j){if(!j||!j.hint)return;var t=document.createElement("span");t.textContent=j.hint;el.innerHTML='<i class="fas fa-sliders-h"></i>';el.appendChild(t);var a=document.createElement("a");a.className="dz-btn dz-btn-primary dz-btn-sm";a.href=j.url;a.textContent="R\xE9gler maintenant";el.appendChild(a);el.hidden=false}).catch(function(){})})();</script>`;
    var bottomHtml = (items, current) => {
      const main = items.filter((i) => i.mobile).slice(0, 4);
      return main.map((i) => `<a href="/page/${esc(i.page)}"${i.page === current ? ' class="dz-active"' : ""}><i class="${esc(i.icon)}"></i>${esc(i.short || i.label)}</a>`).join("") + `<a href="#" data-dz-open="#dzv-drawer"><i class="fas fa-th-large"></i>Plus</a>`;
    };
    var cmdkHtml = (items, mods) => {
      const quick = mods.flatMap((m) => m.quick || []);
      return `<div data-dz-cmdk class="dz-cmdk"><div class="dz-cmdk-box">
<input placeholder="Aller \xE0 une page, cr\xE9er quelque chose\u2026" aria-label="Recherche">
<div class="dz-cmdk-list">
<div class="dz-cmdk-group">Aller \xE0</div>
${items.map((i) => `<a href="/page/${esc(i.page)}" data-keywords="${esc(i.keywords || "")}"><i class="${esc(i.icon)}"></i>${esc(i.label)}</a>`).join("\n")}
<div class="dz-cmdk-group">Cr\xE9er</div>
${quick.map((q) => `<a href="javascript:ajax_modal('${esc(q.url)}')" data-keywords="ajouter nouveau nouvelle ${esc(q.keywords || "")}"><i class="${esc(q.icon)}"></i>${esc(q.label)}</a>`).join("\n")}
<div class="dz-cmdk-group">R\xE9glages</div>
<a href="/dysizz-me" data-keywords="modules installer"><i class="fas fa-puzzle-piece"></i>Modules</a>
<a href="#" data-dz-theme-toggle data-keywords="sombre clair"><i class="fas fa-adjust"></i>Changer de th\xE8me</a>
<div class="dz-cmdk-empty" hidden>Aucun r\xE9sultat</div>
</div>
<div class="dz-cmdk-foot"><span><span class="dz-kbd">\u2191\u2193</span> naviguer</span><span><span class="dz-kbd">Entr\xE9e</span> ouvrir</span><span><span class="dz-kbd">\xC9chap</span> fermer</span></div>
</div></div>`;
    };
    var parts = (mods, page) => {
      const items = navItems(mods);
      const me = items.find((i) => i.page === page.name) || {};
      const quick = page.quick || (mods.find((m) => (m.pages || []).some((p) => p.name === page.name)) || {}).quick?.[0];
      return {
        "dzv-nav": text(sideHtml(items, page.name)),
        "dzv-top": text(topHtml(page.title, me.icon || page.icon || "fas fa-circle", quick)),
        "dzv-bottom": text(bottomHtml(items, page.name)),
        "dzv-drawer": text(sideHtml(items, page.name)),
        "dzv-cmdk": text(cmdkHtml(items, mods))
      };
    };
    var shellLayout = (mods, page, content) => {
      const p = parts(mods, page);
      const c = (id, cls, el) => box(cls, O({ id, el }), p[id]);
      return {
        above: [
          box(
            "dz-app dzv-app",
            c("dzv-nav", "dz-side dzv-side", "aside"),
            box(
              "dz-app-main",
              c("dzv-top", "dz-app-top dzv-top", "header"),
              box("dz-app-body dzv-body", ...content)
            ),
            c("dzv-bottom", "dz-bottom-nav dzv-bottom", "nav"),
            c("dzv-drawer", "dz-drawer dz-left dzv-drawer", "div"),
            c("dzv-cmdk", "dzv-cmdk-wrap", "div")
          )
        ]
      };
    };
    var refreshShell = (layout, mods, page) => {
      const p = parts(mods, page);
      let touched = 0;
      const walk = (s) => {
        if (!s || typeof s !== "object") return;
        if (Array.isArray(s)) return s.forEach(walk);
        if (s.type === "container" && s.customId && p[s.customId]) {
          s.contents = p[s.customId];
          touched++;
          return;
        }
        if (s.above) s.above.forEach(walk);
        if (s.besides) s.besides.forEach(walk);
        if (s.contents && typeof s.contents === "object") walk(s.contents);
      };
      walk(layout);
      return touched;
    };
    module2.exports = { shellLayout, refreshShell, navItems, GROUPS };
  }
});

// src/settings.js
var require_settings = __commonJS({
  "src/settings.js"(exports2, module2) {
    "use strict";
    var { esc } = require_core();
    var flowApi = () => {
      try {
        const p = require("@saltcorn/data/db/state").getState().plugins["dysizz-flow"];
        return p && p.dysizz_flow_api;
      } catch (e) {
        return null;
      }
    };
    var hasSecret = async (name) => {
      if (process.env[name]) return "env";
      const api = flowApi();
      try {
        return api && await api.hasSecret(name) ? "coffre" : "";
      } catch (e) {
        return "";
      }
    };
    var values = async (mod, cfg) => ({ ...Object.fromEntries((mod.settings.fields || []).filter((f) => !f.secret).map((f) => [f.name, f.default ?? ""])), ...((cfg || {}).settings || {})[mod.key] || {} });
    var configured = async (mod, cfg) => {
      if (!mod.settings) return true;
      const v = await values(mod, cfg);
      for (const f of mod.settings.fields || []) {
        if (!f.required) continue;
        if (f.secret ? !await hasSecret(f.secret) : !String(v[f.name] ?? "").trim()) return false;
      }
      return true;
    };
    var applyToWorkflows = async (mod, v) => {
      const Trigger = require("@saltcorn/data/models/trigger");
      const WorkflowStep = require("@saltcorn/data/models/workflow_step");
      const done = [];
      for (const a of mod.settings.apply || []) {
        const t = Trigger.findOne({ name: a.trigger });
        if (!t) continue;
        const s = (await WorkflowStep.find({ trigger_id: t.id })).find((x) => x.name === a.step);
        if (!s) continue;
        const c = { ...s.configuration || {} };
        if (a.json) {
          let o = {};
          try {
            o = typeof c[a.json] === "string" ? JSON.parse(c[a.json] || "{}") : c[a.json] || {};
          } catch (e) {
            o = {};
          }
          for (const [k, f] of Object.entries(a.map || {})) o[k] = typeof f === "function" ? f(v) : v[f];
          c[a.json] = JSON.stringify(o);
        }
        for (const [k, x] of Object.entries(a.set || {})) c[k] = typeof x === "function" ? x(v) : x;
        await s.update({ configuration: c });
        await require_installer().restamp(mod.key, a.trigger);
        done.push(`${a.trigger} \u2192 ${a.step}`);
      }
      return done;
    };
    var inputHtml = (f, v, secretState) => {
      const id = `s_${f.name}`;
      const help = f.help ? `<small>${f.help}</small>` : "";
      if (f.type === "bool") return `<label class="dzs-check"><input type="checkbox" name="${esc(f.name)}" ${v === true || v === "on" || v === "true" ? "checked" : ""}> ${esc(f.label)}</label>${help}`;
      let input;
      if (f.type === "select") input = `<select class="form-select" id="${id}" name="${esc(f.name)}">${(f.options || []).map(([ov, ol]) => `<option value="${esc(ov)}"${String(ov) === String(v) ? " selected" : ""}>${esc(ol)}</option>`).join("")}</select>`;
      else if (f.type === "password") input = `<input class="form-control" type="password" id="${id}" name="${esc(f.name)}" autocomplete="new-password" placeholder="${secretState ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022 (d\xE9j\xE0 rang\xE9, laisse vide pour garder)" : ""}">`;
      else input = `<input class="form-control" type="${f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}" id="${id}" name="${esc(f.name)}" value="${esc(v ?? "")}"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ""}>`;
      const badge = f.type === "password" ? secretState === "env" ? '<span class="dzs-b ok">variable du serveur</span>' : secretState ? '<span class="dzs-b ok">rang\xE9 dans le coffre</span>' : '<span class="dzs-b">pas encore rang\xE9</span>' : "";
      return `<label for="${id}">${esc(f.label)}${f.required ? ' <span class="req">*</span>' : ""} ${badge}</label>${input}${help}`;
    };
    var CSS = `.dzs{max-width:760px;margin:0 auto}.dzs h1{font-weight:750;letter-spacing:-.02em;display:flex;gap:.7rem;align-items:center}
.dzs-card{border:1px solid var(--dzv-border,#ddd);border-radius:16px;background:var(--dzv-surface,#fff);padding:1.3rem 1.4rem;display:flex;flex-direction:column;gap:1rem}
.dzs-f{display:flex;flex-direction:column;gap:.3rem}.dzs-f label{font-weight:650;font-size:.9rem}.dzs-f small{color:var(--dzv-mute,#777);font-size:.8rem}.dzs-f .req{color:#e5484d}
.dzs-check{display:flex!important;gap:.5rem;align-items:center;font-weight:500!important}
.dzs-b{font:600 .68rem ui-monospace,monospace;text-transform:uppercase;padding:.12rem .45rem;border-radius:6px;background:var(--dzv-surface-2,#eee);color:var(--dzv-mute,#777);margin-left:.3rem}.dzs-b.ok{background:rgba(48,164,108,.15);color:#1f8a57}
.dzs-intro{color:var(--dzv-soft,#555);line-height:1.6}.dzs-bar{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
.dzs-res{padding:.8rem 1rem;border-radius:12px;font-size:.9rem;display:none}.dzs-res.ok{display:block;background:rgba(48,164,108,.12);color:#1f7a4d}.dzs-res.ko{display:block;background:rgba(229,72,77,.1);color:#c0343a}
.dzs-steps{counter-reset:s;list-style:none;padding:0;display:flex;flex-direction:column;gap:.6rem}.dzs-steps li{display:flex;gap:.7rem;align-items:flex-start}
.dzs-steps li::before{counter-increment:s;content:counter(s);width:26px;height:26px;border-radius:50%;background:var(--dzv-primary,#5b5bf0);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.8rem;flex:none}
.dzs-flash{padding:.8rem 1rem;border-radius:12px;margin-bottom:1rem}.dzs-flash.ok{background:rgba(48,164,108,.12)}.dzs-flash.ko{background:rgba(229,72,77,.1)}`;
    var page = async (req, res, mod) => {
      const { getCfg } = require_installer();
      const cfg = await getCfg();
      const v = await values(mod, cfg);
      const S = mod.settings;
      const secretStates = {};
      for (const f of S.fields) if (f.secret) secretStates[f.name] = await hasSecret(f.secret);
      const q = req.query || {};
      const csrf = req.csrfToken ? req.csrfToken() : "";
      const installed = (cfg.installed || []).includes(mod.key);
      const html = `<style>${CSS}</style><div class="dzs">
<p><a href="/dysizz-me">\u2190 Modules de Me</a></p>
<h1><i class="${esc(mod.icon)}"></i> R\xE9gler ${esc(mod.label)}</h1>
${q.ok ? `<div class="dzs-flash ok">${esc(q.ok)}</div>` : ""}${q.err ? `<div class="dzs-flash ko">${esc(q.err)}</div>` : ""}
${!installed ? `<div class="dzs-flash ko">Ce module n'est pas encore install\xE9 : installe-le depuis la page des modules, puis reviens ici.</div>` : ""}
${!flowApi() && S.fields.some((f) => f.secret) ? `<div class="dzs-flash ko">Le coffre de dysizz-flow est introuvable : mets \xE0 jour dysizz-flow (2.1 ou plus) pour ranger les mots de passe ici.</div>` : ""}
<form class="dzs-card" method="post" action="/dysizz-me/reglages/${esc(mod.key)}" id="dzs-form" autocomplete="off">
<input type="hidden" name="_csrf" value="${esc(csrf)}">
${S.intro ? `<div class="dzs-intro">${S.intro}</div>` : ""}
${S.fields.map((f) => `<div class="dzs-f">${inputHtml(f, v[f.name], secretStates[f.name])}</div>`).join("")}
<div class="dzs-res" id="dzs-res"></div>
<div class="dzs-bar">${S.test ? `<button type="button" class="btn btn-outline-secondary" id="dzs-test"><i class="fas fa-plug"></i> Tester</button>` : ""}
<button class="btn btn-primary"><i class="fas fa-check"></i> Enregistrer</button>
${installed && (mod.pages || [])[0] ? `<a class="btn btn-link" href="/page/${esc(mod.pages[0].name)}">Ouvrir ${esc(mod.label)}</a>` : ""}</div>
<small style="color:var(--dzv-mute,#777)">Les mots de passe sont chiffr\xE9s dans le coffre de dysizz-flow et ne sont plus jamais r\xE9affich\xE9s.</small>
</form></div>
<script>(function(){var b=document.getElementById("dzs-test");if(!b)return;b.addEventListener("click",function(){var f=document.getElementById("dzs-form"),r=document.getElementById("dzs-res");r.className="dzs-res ok";r.textContent="Test en cours\u2026";b.disabled=true;
fetch("/dysizz-me/reglages/${esc(mod.key)}/tester",{method:"POST",credentials:"same-origin",headers:{"CSRF-Token":${JSON.stringify(csrf)}},body:new URLSearchParams(new FormData(f))}).then(function(x){return x.json()}).then(function(j){b.disabled=false;r.className="dzs-res "+(j.ok?"ok":"ko");r.textContent=j.message}).catch(function(e){b.disabled=false;r.className="dzs-res ko";r.textContent=e.message})})})();</script>`;
      res.sendWrap({ title: `R\xE9gler ${mod.label}`, requestFluidLayout: false }, { above: [{ type: "blank", isHTML: true, contents: html.replace(/\{\{/g, "&#123;&#123;").replace(/\}\}/g, "&#125;&#125;") }] });
    };
    var readForm = (mod, body) => {
      const out = {}, secrets = {};
      for (const f of mod.settings.fields) {
        let x = body[f.name];
        if (f.type === "bool") x = x === "on" || x === "true" || x === true;
        else x = String(x ?? "").trim();
        if (f.type === "number" && x !== "") x = Number(x);
        if (f.secret) {
          if (x) secrets[f.secret] = x;
        } else out[f.name] = x;
      }
      return { out, secrets };
    };
    var save = async (req, res, mod) => {
      const { getCfg, saveCfg } = require_installer();
      const back = (k, m) => res.redirect(`/dysizz-me/reglages/${mod.key}?${k}=${encodeURIComponent(m)}`);
      try {
        const { out, secrets } = readForm(mod, req.body || {});
        for (const f of mod.settings.fields) if (f.required && !f.secret && out[f.name] === "") return back("err", `\xAB ${f.label} \xBB est obligatoire`);
        if (Object.keys(secrets).length) {
          const api = flowApi();
          if (!api) return back("err", "Coffre introuvable : mets \xE0 jour dysizz-flow");
          for (const [n, val] of Object.entries(secrets)) await api.writeSecret(n, val, `Me \xB7 ${mod.label}`);
        }
        for (const f of mod.settings.fields) if (f.required && f.secret && !await hasSecret(f.secret)) return back("err", `\xAB ${f.label} \xBB est obligatoire`);
        const cfg = await getCfg();
        await saveCfg({ settings: { ...cfg.settings || {}, [mod.key]: out } });
        const done = await applyToWorkflows(mod, out);
        for (const [pg, fn] of Object.entries(mod.settings.pageRoles || {})) {
          const Page = require("@saltcorn/data/models/page");
          const pp = Page.findOne({ name: pg });
          if (pp) await Page.update(pp.id, { min_role: fn(out) });
        }
        back("ok", `R\xE9glages enregistr\xE9s${done.length ? " et appliqu\xE9s aux workflows" : ""}. ${mod.settings.after || ""}`);
      } catch (e) {
        back("err", e.message);
      }
    };
    var test = async (req, res, mod) => {
      const T = mod.settings.test;
      const reply = (ok, message) => res.json({ ok, message });
      if (!T) return reply(false, "Pas de test pour ce module");
      const action = require("@saltcorn/data/db/state").getState().actions[T.action];
      if (!action) return reply(false, `Bloc ${T.action} introuvable : dysizz-flow est-il install\xE9 ?`);
      const { getCfg } = require_installer();
      const { out, secrets } = readForm(mod, req.body || {});
      const v = { ...await values(mod, await getCfg()), ...out };
      if (Object.keys(secrets).length) {
        const api = flowApi();
        if (!api) return reply(false, "Coffre introuvable : mets \xE0 jour dysizz-flow");
        for (const [n, val] of Object.entries(secrets)) await api.writeSecret(n, val, `Me \xB7 ${mod.label}`);
      }
      try {
        const r = await Promise.race([action.run({ configuration: { ...T.config(v), sortie: "r", delai_max: 40 }, row: {}, user: req.user, req, mode: "workflow" }), new Promise((_, rej) => setTimeout(() => rej(new Error("pas de r\xE9ponse apr\xE8s 45 s")), 45e3))]);
        reply(true, T.ok ? T.ok(T.okFull ? r : r && r.r, v) : "\xC7a marche.");
      } catch (e) {
        reply(false, (T.explain ? T.explain(e.message) : "") || `\xC9chec : ${e.message}`);
      }
    };
    module2.exports = { page, save, test, configured, values, applyToWorkflows };
  }
});

// src/installer.js
var require_installer = __commonJS({
  "src/installer.js"(exports2, module2) {
    "use strict";
    var { hash } = require_core();
    var { shellLayout, refreshShell } = require_shell();
    var M = () => ({
      Table: require("@saltcorn/data/models/table"),
      Field: require("@saltcorn/data/models/field"),
      View: require("@saltcorn/data/models/view"),
      Page: require("@saltcorn/data/models/page"),
      Trigger: require("@saltcorn/data/models/trigger"),
      Plugin: require("@saltcorn/data/models/plugin"),
      db: require("@saltcorn/data/db"),
      state: require("@saltcorn/data/db/state").getState()
    });
    var CFG_KEY = "dysizz_me";
    var OLD_KEY = "dysizz_vie";
    var getCfg = async () => {
      const C = require("@saltcorn/data/models/config");
      const cur = await C.getConfig(CFG_KEY, null);
      if (cur) return cur;
      const old = await C.getConfig(OLD_KEY, null);
      if (old) {
        await C.setConfig(CFG_KEY, old);
        return old;
      }
      return {};
    };
    var saveCfg = async (patch) => {
      const C = require("@saltcorn/data/models/config");
      await C.setConfig(CFG_KEY, { ...await getCfg(), ...patch });
    };
    var fieldSpec = (f) => {
      const attrs = { ...f.attributes || {} };
      if (f.options) attrs.options = Array.isArray(f.options) ? f.options.join(",") : f.options;
      if (f.summary) attrs.summary_field = f.summary;
      if (f.default !== void 0) attrs.default = f.default;
      return { name: f.name, label: f.label || f.name, type: f.type, required: !!f.required, is_unique: !!f.unique, attributes: attrs, description: f.description || "" };
    };
    var moduleStatus = async (mod, cfg) => {
      const { Table, View, Page, Trigger } = M();
      const stamps = ((cfg || await getCfg()).stamps || {})[mod.key] || {};
      const out = { tables: [], views: [], pages: [], triggers: [] };
      for (const t of mod.tables || []) {
        const tb = Table.findOne({ name: t.name });
        const have = tb ? new Set(tb.getFields().map((f) => f.name)) : /* @__PURE__ */ new Set();
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
    var stripShell = (layout) => {
      const copy = JSON.parse(JSON.stringify(layout || {}));
      const walk = (s) => {
        if (!s || typeof s !== "object") return;
        if (Array.isArray(s)) return s.forEach(walk);
        if (s.type === "container" && /^dzv-(nav|top|bottom|drawer|cmdk)$/.test(s.customId || "")) {
          s.contents = null;
          return;
        }
        if (s.above) s.above.forEach(walk);
        if (s.besides) s.besides.forEach(walk);
        if (s.contents && typeof s.contents === "object") walk(s.contents);
      };
      walk(copy);
      return copy;
    };
    var WS = () => require("@saltcorn/data/models/workflow_step");
    var stepsOf = (wf) => wf.steps.map((st, i) => ({ ...st, next_step: st.next_step !== void 0 ? st.next_step : wf.steps[i + 1] ? wf.steps[i + 1].name : "", only_if: st.only_if || "" }));
    var norm = (x) => ({ name: x.name, action_name: x.action_name, configuration: x.configuration || {}, next_step: x.next_step || "", only_if: x.only_if || "" });
    var readSteps = async (trigger_id) => (await WS().find({ trigger_id })).map(norm);
    var writeSteps = async (trig, want, cur, keep = {}) => {
      const db = require("@saltcorn/data/db");
      await db.deleteWhere("_sc_workflow_steps", { trigger_id: trig.id });
      for (let i = 0; i < want.length; i++) {
        const w = want[i];
        const old = cur.find((c) => c.name === w.name);
        const kept = {};
        for (const k of keep[w.name] || []) if (old && old.configuration && old.configuration[k] !== void 0 && old.configuration[k] !== "") kept[k] = old.configuration[k];
        await WS().create({ trigger_id: trig.id, name: w.name, action_name: w.action_name, configuration: { ...w.configuration, ...kept }, next_step: w.next_step, only_if: w.only_if, initial_step: i === 0 });
      }
    };
    var missingDeps = () => {
      const { state } = M();
      const miss = [];
      if (!state.viewtemplates["DZ Tableau"]) miss.push("dysizz-ui (3.2 ou plus)");
      if (!state.actions["dzf_table_chercher"]) miss.push("dysizz-flow");
      return miss;
    };
    var installModule = async (mod, allMods, { reset = false } = {}) => {
      const { Table, Field, View, Page, Trigger, state } = M();
      const miss = missingDeps();
      if (miss.length) throw new Error(`installe d'abord : ${miss.join(", ")}`);
      const vts = [...new Set((mod.views || []).map((v) => v.template))].filter((t) => !state.viewtemplates[t]);
      const acts = [...new Set((mod.triggers || []).flatMap((t) => (t.steps || []).map((s) => s.action_name)))].filter((a) => !state.actions[a]);
      if (vts.length || acts.length) throw new Error(`mets \xE0 jour ${[vts.length && `dysizz-ui (vues manquantes : ${vts.join(", ")})`, acts.length && `dysizz-flow (blocs manquants : ${acts.join(", ")})`].filter(Boolean).join(" et ")}`);
      const log = [];
      const cfg = await getCfg();
      const installed = new Set(cfg.installed || []);
      for (const d of mod.depends || []) if (!installed.has(d)) {
        const dep = allMods.find((m) => m.key === d);
        if (dep) log.push(...(await installModule(dep, allMods)).map((l) => `[${dep.label}] ${l}`));
      }
      const stamps = { ...(await getCfg()).stamps || {} };
      const my = { ...stamps[mod.key] || {} };
      for (const t of mod.tables || []) {
        let tb = Table.findOne({ name: t.name });
        if (!tb) {
          tb = await Table.create(t.name, { min_role_read: 1, min_role_write: 1, description: t.description || "" });
          log.push(`table ${t.name} cr\xE9\xE9e`);
        }
        await state.refresh_tables?.(true);
        tb = Table.findOne({ name: t.name });
        const have = new Set(tb.getFields().map((f) => f.name));
        for (const f of t.fields) {
          if (have.has(f.name)) {
            const exf = tb.getFields().find((x) => x.name === f.name);
            if (f.is_unique === false && exf && exf.is_unique) {
              try {
                await exf.update({ is_unique: false });
                log.push(`champ ${t.name}.${f.name} : plus unique`);
              } catch (e) {
                log.push(`champ ${t.name}.${f.name} : ${e.message}`);
              }
            }
            continue;
          }
          await Field.create({ table: tb, ...fieldSpec(f) });
          log.push(`champ ${t.name}.${f.name} ajout\xE9`);
        }
      }
      await state.refresh_tables?.(true);
      for (const [tname, rows] of Object.entries(mod.seeds || {})) {
        const tb = Table.findOne({ name: tname });
        if (!tb || my["s:" + tname]) continue;
        const mergeKey = (mod.seedMerge || {})[tname];
        let n = 0;
        if (mergeKey) {
          for (const r of rows) if (!await tb.getRow({ [mergeKey]: r[mergeKey] })) {
            await tb.insertRow(await resolveRefs(r));
            n++;
          }
        } else if (await tb.countRows({}) === 0) {
          for (const r of rows) {
            await tb.insertRow(await resolveRefs(r));
            n++;
          }
        }
        my["s:" + tname] = 1;
        if (n) log.push(`${n} lignes de d\xE9part dans ${tname}`);
      }
      for (const v of mod.views || []) {
        const tb = v.table ? Table.findOne({ name: v.table }) : null;
        const ex = View.findOne({ name: v.name });
        const cfgV = typeof v.config === "function" ? v.config() : v.config;
        const attrs = { ...v.title ? { popup_title: v.title, page_title: v.title } : {}, ...v.width ? { popup_width: v.width, popup_width_units: "px" } : {} };
        if (!ex) {
          await View.create({ name: v.name, table_id: tb ? tb.id : null, viewtemplate: v.template, configuration: cfgV, min_role: v.min_role || 1, description: v.description || "", attributes: attrs });
          log.push(`vue ${v.name} cr\xE9\xE9e`);
        } else if (reset || !my["v:" + v.name] || hash(ex.configuration) === my["v:" + v.name]) {
          await View.update({ configuration: cfgV, viewtemplate: v.template, table_id: tb ? tb.id : null, description: v.description || "", attributes: { ...ex.attributes || {}, ...attrs } }, ex.id);
          if (reset) log.push(`vue ${v.name} r\xE9initialis\xE9e`);
          else if (hash(ex.configuration) !== hash(cfgV)) log.push(`vue ${v.name} mise \xE0 jour`);
        } else log.push(`vue ${v.name} gard\xE9e (tu l'as modifi\xE9e)`);
        my["v:" + v.name] = hash(cfgV);
      }
      await state.refresh_views?.(true);
      for (const wf of mod.triggers || []) {
        const tb = wf.table ? Table.findOne({ name: wf.table }) : null;
        const ex = Trigger.findOne({ name: wf.name });
        const def = { name: wf.name, description: wf.description || "", action: "Workflow", when_trigger: wf.when, table_id: tb ? tb.id : null, configuration: {}, min_role: 1 };
        const want = stepsOf(wf);
        if (!ex) {
          const created = await Trigger.create(def);
          const tid = created.id || (Trigger.findOne({ name: wf.name }) || {}).id;
          await writeSteps(created, want, []);
          log.push(`workflow ${wf.name} cr\xE9\xE9 (${want.length} \xE9tapes)`);
          my["t:" + wf.name] = hash((await readSteps(tid)).map(norm));
        } else {
          const cur = await readSteps(ex.id);
          if (reset || !my["t:" + wf.name] || hash(cur.map(norm)) === my["t:" + wf.name] || hash(cur.map(norm)) === hash(want.map(norm))) {
            await Trigger.update(ex.id, { ...def, when_trigger: reset ? wf.when : ex.when_trigger });
            await writeSteps(ex, want, cur, wf.keep || {});
            my["t:" + wf.name] = hash((await readSteps(ex.id)).map(norm));
          } else log.push(`workflow ${wf.name} gard\xE9 (tu l'as modifi\xE9)`);
        }
      }
      await state.refresh_triggers?.(true);
      installed.add(mod.key);
      const mods = allMods.filter((m) => installed.has(m.key));
      for (const p of mod.pages || []) {
        const ex = Page.findOne({ name: p.name });
        const layout = p.shell === false ? { above: contentOf(p, installed) } : shellLayout(mods, p, contentOf(p, installed));
        if (!ex) {
          await Page.create({ name: p.name, title: p.title, description: p.description || "", min_role: p.min_role || 1, layout, fixed_states: {}, attributes: { no_menu: p.shell !== false, request_fluid_layout: true } });
          log.push(`page ${p.name} cr\xE9\xE9e`);
        } else if (reset || !my["p:" + p.name] || hash(stripShell(ex.layout)) === my["p:" + p.name]) {
          await Page.update(ex.id, { layout, title: p.title, description: p.description || "", attributes: { ...ex.attributes || {}, no_menu: true, request_fluid_layout: true } });
        } else log.push(`page ${p.name} gard\xE9e (tu l'as modifi\xE9e)`);
        my["p:" + p.name] = hash(stripShell(layout));
      }
      stamps[mod.key] = my;
      await saveCfg({ installed: [...installed], stamps });
      await refreshAllShells(allMods);
      if (mod.key === "accueil" || installed.has("accueil")) await setHome();
      const saved = ((await getCfg()).settings || {})[mod.key];
      if (mod.settings && saved) {
        try {
          await require_settings().applyToWorkflows(mod, saved);
        } catch (e) {
          log.push(`r\xE9glages non r\xE9appliqu\xE9s : ${e.message}`);
        }
      }
      return log;
    };
    var uninstallModule = async (mod, allMods, { dropTables = false } = {}) => {
      const { Table, View, Page, Trigger, state } = M();
      const cfg = await getCfg();
      const installed = new Set(cfg.installed || []);
      const users = allMods.filter((m) => m.key !== mod.key && installed.has(m.key) && (m.depends || []).includes(mod.key));
      if (users.length) throw new Error(`D'abord retirer : ${users.map((u) => u.label).join(", ")} (ils utilisent ce module)`);
      const log = [];
      for (const p of mod.pages || []) {
        const ex = Page.findOne({ name: p.name });
        if (ex) {
          await ex.delete();
          log.push(`page ${p.name} retir\xE9e`);
        }
      }
      for (const tr of mod.triggers || []) {
        const ex = Trigger.findOne({ name: tr.name });
        if (ex) {
          await ex.delete();
          log.push(`workflow ${tr.name} retir\xE9`);
        }
      }
      for (const v of [...mod.views || []].reverse()) {
        const ex = View.findOne({ name: v.name });
        if (ex) {
          await View.delete({ id: ex.id });
          log.push(`vue ${v.name} retir\xE9e`);
        }
      }
      if (dropTables) {
        for (const t of [...mod.tables || []].reverse()) {
          const tb = Table.findOne({ name: t.name });
          if (tb) {
            await tb.delete();
            log.push(`table ${t.name} SUPPRIM\xC9E avec ses donn\xE9es`);
          }
        }
      }
      await state.refresh?.(true);
      installed.delete(mod.key);
      const stamps = { ...cfg.stamps || {} };
      delete stamps[mod.key];
      await saveCfg({ installed: [...installed], stamps });
      await refreshAllShells(allMods);
      return log;
    };
    var contentOf = (p, installed) => typeof p.content === "function" ? p.content(installed) : p.content;
    var refreshAllShells = async (allMods) => {
      const { Page, state } = M();
      const cfg = await getCfg();
      const installed = new Set(cfg.installed || []);
      const stamps = { ...cfg.stamps || {} };
      let stampsChanged = false;
      const mods = allMods.filter((m) => installed.has(m.key));
      for (const m of mods) for (const p of m.pages || []) {
        const ex = Page.findOne({ name: p.name });
        if (!ex || p.shell === false) continue;
        const my = stamps[m.key] || {};
        if (typeof p.content === "function" && (!my["p:" + p.name] || hash(stripShell(ex.layout)) === my["p:" + p.name])) {
          const layout2 = shellLayout(mods, p, contentOf(p, installed));
          await Page.update(ex.id, { layout: layout2 });
          stamps[m.key] = { ...my, ["p:" + p.name]: hash(stripShell(layout2)) };
          stampsChanged = true;
          continue;
        }
        const layout = JSON.parse(JSON.stringify(ex.layout));
        if (refreshShell(layout, mods, p)) await Page.update(ex.id, { layout });
      }
      if (stampsChanged) await saveCfg({ stamps });
      await state.refresh_pages?.(true);
    };
    var setHome = async () => {
      try {
        const { Page, state } = M();
        if (!Page.findOne({ name: "accueil" })) return;
        const cfg = await getCfg();
        if (cfg.home_set) return;
        const byRole = state.getConfigCopy("home_page_by_role", {}) || {};
        if (!byRole[1]) {
          byRole[1] = "accueil";
          await state.setConfig("home_page_by_role", byRole);
        }
        await saveCfg({ home_set: true });
      } catch (e) {
      }
    };
    var resolveRefs = async (row) => {
      const { Table } = M();
      const out = {};
      for (const [k, v] of Object.entries(row)) {
        if (v && typeof v === "object" && v.$ref) {
          const { $ref, ...where } = v;
          const tb = Table.findOne({ name: $ref });
          const r = tb && await tb.getRow(where);
          out[k] = r ? r.id : null;
        } else if (v && typeof v === "object" && v.$daysFromNow !== void 0) {
          const d = /* @__PURE__ */ new Date();
          d.setHours(9, 0, 0, 0);
          d.setDate(d.getDate() + v.$daysFromNow);
          out[k] = d.toISOString();
        } else out[k] = v;
      }
      return out;
    };
    var restamp = async (modKey, triggerName) => {
      const { Trigger } = M();
      const t = Trigger.findOne({ name: triggerName });
      if (!t) return;
      const cfg = await getCfg();
      const stamps = { ...cfg.stamps || {} };
      stamps[modKey] = { ...stamps[modKey] || {}, ["t:" + triggerName]: hash((await readSteps(t.id)).map(norm)) };
      await saveCfg({ stamps });
    };
    module2.exports = { restamp, missingDeps, installModule, uninstallModule, moduleStatus, getCfg, saveCfg, refreshAllShells };
  }
});

// src/modules/_kit.js
var require_kit = __commonJS({
  "src/modules/_kit.js"(exports2, module2) {
    "use strict";
    var L = require_layout();
    var s = (name, label, o = {}) => ({ name, label, type: "String", ...o });
    var opts = (name, label, options, o = {}) => ({ name, label, type: "String", options, default: options[0], required: true, ...o });
    var int = (name, label, o = {}) => ({ name, label, type: "Integer", ...o });
    var num = (name, label, o = {}) => ({ name, label, type: "Float", ...o });
    var bool = (name, label, o = {}) => ({ name, label, type: "Bool", default: false, ...o });
    var date = (name, label, o = {}) => ({ name, label, type: "Date", ...o });
    var file = (name, label, o = {}) => ({ name, label, type: "File", ...o });
    var color = (name, label, o = {}) => ({ name, label, type: "Color", ...o });
    var key = (name, label, table, summary, o = {}) => ({ name, label, type: `Key to ${table}`, summary, ...o });
    var edit = (name, table, fields, o = {}) => ({ name, table, template: "Edit", title: o.title, width: o.width, description: o.description || `Formulaire ${table}`, config: L.editConfig(fields, o) });
    var show = (name, table, layout, o = {}) => ({ name, table, template: "Show", title: o.title, width: o.width, description: o.description || "", config: L.showConfig(layout) });
    var list = (name, table, cols, o = {}) => ({ name, table, template: "List", description: o.description || "", config: L.listConfig(cols, o) });
    var feed = (name, table, showView, o = {}) => ({ name, table, template: "Feed", description: o.description || "", config: L.feedConfig(showView, o) });
    var custom = (name, template, table, config, description) => ({ name, table, template, description, config });
    var spans = (...segs) => segs.map((x) => L.box("", L.O({ el: "span" }), x));
    var meta = (...segs) => L.box("dzv-tile-meta", ...segs.map((x) => L.box("", L.O({ el: "span" }), x)));
    var dateFr = (f, o = {}) => L.formula(`${f} ? new Date(${f}).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short'${o.year ? ", year: 'numeric'" : ""} })${o.time ? ` + ' ' + new Date(${f}).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })` : ""} : ''`, { block: false, cls: o.cls || "" });
    var modalLink = (viewName, label, icon = "fas fa-pen", cls = "btn btn-sm btn-link") => ({ type: "link", text: label, url: `\`javascript:ajax_modal('/view/${viewName}?id=\${id}')\``, isFormula: { url: true }, link_icon: icon, link_class: cls, link_style: "", link_size: "", block: false, textStyle: "" });
    var jsBtn = (label, codeStr, o = {}) => L.action("run_js_code", label, { ...o, cfg: { code: codeStr, run_where: "Server" } });
    var st = (name, action_name, configuration, o = {}) => ({ name, action_name, configuration, ...o });
    var wf = (name, when, table, description, steps, keep) => ({ name, when, table, description, steps, keep: keep || {} });
    var J = (o) => JSON.stringify(o);
    var panel = (title, icon, content, o = {}) => L.box(
      `dzv-panel${o.cls ? " " + o.cls : ""}`,
      L.text(`<div class="dzv-panel-head"><h2><i class="${icon}"></i>${title}</h2>${o.actions ? `<div class="dzv-panel-actions">${o.actions}</div>` : ""}</div>`),
      ...Array.isArray(content) ? content : [content]
    );
    var grid = (cls, ...xs) => L.box(`dzv-grid ${cls}`, ...xs);
    var chips = (items) => L.text(`<nav class="dzv-chips" data-dzv-chips>${items.map(([label, qs, icon]) => `<a href="?${encodeURI(qs)}" data-q="${qs}">${icon ? `<i class="${icon}"></i>` : ""}${label}</a>`).join("")}</nav>`);
    var modalBtn = (label, url, icon = "fas fa-plus", cls = "dz-btn dz-btn-sm dz-btn-ghost") => `<a class="${cls}" href="javascript:ajax_modal('${url}')"><i class="${icon}"></i>${label}</a>`;
    module2.exports = { ...L, st, wf, J, spans, meta, modalLink, dateFr, s, opts, int, num, bool, date, file, color, key, edit, show, list, feed, custom, jsBtn, panel, grid, chips, modalBtn };
  }
});

// src/modules/accueil.js
var require_accueil = __commonJS({
  "src/modules/accueil.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var TILES = JSON.stringify([
      { label: "T\xE2ches pour aujourd'hui", icon: "fas fa-check-circle", table: "taches", stat: "count", where: { not: { statut: "fait" } }, period: { field: "echeance", range: "today" }, href: "/page/taches", tone: "warning", optional: true },
      { label: "En retard", icon: "fas fa-fire", table: "taches", stat: "count", where: { not: { statut: "fait" } }, period: { field: "echeance", range: "overdue" }, href: "/page/taches", tone: "danger", optional: true },
      { label: "Mails \xE0 traiter", icon: "fas fa-envelope", table: "mails", stat: "count", where: { or: [{ statut: "\xE0 traiter" }, { lu: false, statut: "nouveau" }] }, href: "/page/mails", tone: "info", optional: true },
      { id: "dep", label: "D\xE9pens\xE9 ce mois", icon: "fas fa-wallet", table: "operations", stat: "sum", field: "montant", where: { type: "d\xE9pense" }, period: { field: "date", range: "month" }, format: "eur", href: "/page/budget", optional: true },
      { label: "Nouvelles offres", icon: "fas fa-user-tie", table: "offres_emploi", stat: "count", where: { statut: "nouvelle" }, href: "/page/emploi", optional: true },
      { label: "Vid\xE9os pas vues", icon: "fab fa-youtube", table: "veille_articles", stat: "count", where: { type: "vid\xE9o", lu: false }, period: { field: "date", range: "last7" }, href: "/page/videos", optional: true }
    ], null, 1);
    var SOURCES = JSON.stringify([
      { table: "taches", date: "echeance", titre: "titre", icon: "fas fa-check-circle", where: { not: { statut: "fait" } }, vue: "tache_modifier", retard: true },
      { table: "rdv_sante", date: "date", titre: "motif", icon: "fas fa-stethoscope", where: { fait: false }, vue: "rdv_modifier", tone: "info" },
      { table: "documents", date: "expire_le", titre: "titre", icon: "fas fa-folder-open", vue: "document_modifier", libelle: "expire" },
      { table: "candidatures", date: "relance_le", titre: "entreprise", sous_titre: "poste", icon: "fas fa-paper-plane", where: { statut: { in: ["envoy\xE9e", "relance"] } }, vue: "candidature_modifier", libelle: "relance", retard: true },
      { table: "objectifs", date: "echeance", titre: "titre", icon: "fas fa-bullseye", where: { statut: "en cours" }, vue: "objectif_modifier", libelle: "objectif" }
    ], null, 1);
    module2.exports = {
      key: "accueil",
      label: "Accueil",
      icon: "fas fa-sun",
      group: "Aujourd'hui",
      description: "Ta page du matin : chiffres cl\xE9s de tous les modules, ce qui t'attend dans les 7 jours, t\xE2ches du jour, habitudes, mails \xE0 traiter, derni\xE8res vid\xE9os et actus.",
      depends: [],
      tables: [],
      views: [
        K.custom("accueil_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 3 }, "Les chiffres du jour, tous modules confondus"),
        K.custom("accueil_semaine", "DZ \xC0 venir", null, { sources: SOURCES, jours: 7, texte_vide: "Rien de pr\xE9vu cette semaine. Profites-en." }, "\xC9ch\xE9ances, rendez-vous, expirations et relances des 7 jours")
      ],
      pages: [{
        name: "accueil",
        title: "Accueil",
        /* contenu recalculé quand tu installes ou retires un module */
        content: (installed) => {
          const has = (k) => installed.has(k);
          const right = [
            has("taches") && K.panel("Aujourd'hui", "fas fa-check-circle", K.view("taches_aujourdhui"), { actions: K.modalBtn("T\xE2che", "/view/tache_modifier") }),
            has("objectifs") && K.panel("Habitudes", "fas fa-seedling", K.view("habitudes_jour"))
          ].filter(Boolean);
          const bottom = [
            has("mails") && K.panel("Bo\xEEte mail", "fas fa-inbox", K.view("mails_boite", { id: "accmails" }), { cls: "dzv-mails", actions: '<a class="dz-btn dz-btn-sm dz-btn-ghost" href="/page/mails">Tout voir</a>' }),
            has("videos") && K.panel("Derni\xE8res vid\xE9os", "fab fa-youtube", K.view("videos_grille", { id: "accvid" }), { actions: '<a class="dz-btn dz-btn-sm dz-btn-ghost" href="/page/videos">Tout voir</a>' }),
            has("actus") && K.grid("dzv-grid-2", K.panel("France", "fas fa-flag", K.view("actus_france", { id: "accfr" })), K.panel("S\xE9n\xE9gal", "fas fa-globe-africa", K.view("actus_senegal", { id: "accsn" })))
          ].filter(Boolean);
          return [
            K.text('<div class="dzv-hero"><div><h2 data-dzv-hello>Bonjour</h2><p data-dzv-date></p></div><div class="dzv-top-actions"><button class="dz-btn dz-btn-ghost dz-btn-sm" type="button" data-dz-cmdk-open><i class="fas fa-bolt"></i> Cr\xE9er ou aller \xE0\u2026 <span class="dz-kbd">Ctrl K</span></button></div></div>'),
            K.view("accueil_chiffres"),
            right.length ? K.grid("dzv-grid-main", K.panel("Cette semaine", "far fa-calendar", K.view("accueil_semaine")), K.box("dzv-grid", ...right)) : K.panel("Cette semaine", "far fa-calendar", K.view("accueil_semaine")),
            ...bottom,
            ...installed.size <= 1 ? [K.text('<div class="dzv-panel dzv-empty"><i class="fas fa-puzzle-piece"></i><p>Installe des modules (t\xE2ches, budget, mails, veille\u2026) depuis <a href="/dysizz-me">la page Modules</a> : ils appara\xEEtront ici.</p></div>')] : []
          ];
        }
      }],
      nav: [{ page: "accueil", label: "Accueil", icon: "fas fa-sun", group: "Aujourd'hui", order: 1, mobile: true, keywords: "dashboard tableau de bord aujourd'hui" }],
      explain: [
        ["Les chiffres du haut", "Vue \xAB accueil_chiffres \xBB (DZ Indicateurs) : chaque tuile compte ou additionne dans la table d'un module. Une tuile dont le module n'est pas install\xE9 est cach\xE9e."],
        ["Cette semaine", "Vue \xAB accueil_semaine \xBB (DZ \xC0 venir) : rassemble \xE9ch\xE9ances de t\xE2ches, rendez-vous, expirations de documents, relances de candidatures et objectifs."],
        ["Le reste de la page", "Des vues des autres modules. La page est recalcul\xE9e quand tu installes ou retires un module (sauf si tu l'as modifi\xE9e toi-m\xEAme)."]
      ]
    };
  }
});

// src/modules/taches.js
var require_taches = __commonJS({
  "src/modules/taches.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var DOMAINES = ["Pro", "Maison", "Perso", "Administratif", "Finances", "Sant\xE9", "Apprentissage"];
    var TOGGLE = `// Bouton \xAB fait \xBB : bascule le statut. Le d\xE9clencheur \xAB taches_cycle \xBB
// note la date et recr\xE9e la t\xE2che si elle se r\xE9p\xE8te.
await table.updateRow({ statut: row.statut === "fait" ? "\xE0 faire" : "fait" }, row.id, user);
return { reload_page: true };`;
    var PROCHAINE = `// Calcule la prochaine \xE9ch\xE9ance si la t\xE2che est faite et se r\xE9p\xE8te.
if (row.statut !== "fait" || !row.recurrence || row.recurrence === "aucune" || row.suivante_creee) return null;
const d = row.echeance ? new Date(row.echeance) : new Date();
if (row.recurrence === "chaque jour") d.setDate(d.getDate() + 1);
if (row.recurrence === "chaque semaine") d.setDate(d.getDate() + 7);
if (row.recurrence === "chaque mois") d.setMonth(d.getMonth() + 1);
if (row.recurrence === "chaque ann\xE9e") d.setFullYear(d.getFullYear() + 1);
return d.toISOString();`;
    module2.exports = {
      key: "taches",
      label: "T\xE2ches",
      icon: "fas fa-check-circle",
      group: "Organisation",
      description: "T\xE2ches pro, maison et perso en tableau (\xE0 faire, en cours, en attente, fait), projets, t\xE2ches qui se r\xE9p\xE8tent, rappel du matin.",
      depends: [],
      tables: [
        {
          name: "projets",
          description: "Un projet regroupe des t\xE2ches",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.opts("domaine", "Domaine", DOMAINES),
            K.opts("statut", "Statut", ["actif", "en pause", "termin\xE9"]),
            K.date("echeance", "\xC9ch\xE9ance"),
            K.color("couleur", "Couleur"),
            K.s("description", "Description")
          ]
        },
        {
          name: "taches",
          description: "Toutes tes t\xE2ches, quel que soit le domaine",
          fields: [
            K.s("titre", "Titre", { required: true }),
            K.opts("domaine", "Domaine", DOMAINES),
            K.key("projet", "Projet", "projets", "nom"),
            K.opts("statut", "Statut", ["\xE0 faire", "en cours", "en attente", "fait"]),
            K.opts("priorite", "Priorit\xE9", ["normale", "haute", "urgente", "basse"]),
            K.date("echeance", "\xC9ch\xE9ance"),
            K.opts("recurrence", "Se r\xE9p\xE8te", ["aucune", "chaque jour", "chaque semaine", "chaque mois", "chaque ann\xE9e"]),
            K.s("notes", "Notes"),
            K.s("lien", "Lien"),
            K.s("source", "Origine", { description: "manuel, mail, document\u2026" }),
            K.date("fait_le", "Fait le"),
            K.bool("suivante_creee", "Occurrence suivante cr\xE9\xE9e")
          ]
        }
      ],
      views: [
        K.edit("tache_modifier", "taches", [
          ["titre", "Titre"],
          ["domaine", "Domaine"],
          ["statut", "Statut"],
          ["priorite", "Priorit\xE9"],
          ["echeance", "\xC9ch\xE9ance", "edit"],
          ["recurrence", "Se r\xE9p\xE8te"],
          ["projet", "Projet", "select"],
          ["lien", "Lien"],
          ["notes", "Notes", "textarea"]
        ], { delete: true, title: "T\xE2che", width: 640, description: "Ajouter ou modifier une t\xE2che (s'ouvre en fen\xEAtre)" }),
        K.custom("taches_tableau", "DZ Tableau", "taches", {
          champ_colonnes: "statut",
          colonnes: "\xE0 faire,en cours,en attente,fait",
          champ_titre: "titre",
          champs_infos: "echeance,priorite,domaine,projet.nom",
          tri: "echeance",
          colonne_finie: "fait",
          max_finies: 10,
          vue_fiche: "tache_modifier",
          vue_creation: "tache_modifier",
          filtre: ""
        }, "Tableau des t\xE2ches par statut, glisser-d\xE9poser"),
        K.list("taches_aujourdhui", "taches", [
          ["", K.jsBtn("", TOGGLE, { style: "btn-link", size: "", icon: "far fa-circle", cls: "dzv-check" })],
          ["T\xE2che", K.field("titre", "as_text")],
          ["Priorit\xE9", K.field("priorite", "as_text", { cls: "dzv-pill" })],
          ["\xC9ch\xE9ance", K.dateFr("echeance")]
        ], { include: 'statut != "fait" && echeance < today(1)', order: "echeance", desc: false, noHeader: true, rowClick: "`/view/tache_modifier?id=${id}`", limit: 20, description: "T\xE2ches du jour et en retard" }),
        K.edit("projet_modifier", "projets", [["nom", "Nom"], ["domaine", "Domaine"], ["statut", "Statut"], ["echeance", "\xC9ch\xE9ance", "editDay"], ["couleur", "Couleur"], ["description", "Description", "textarea"]], { delete: true, title: "Projet", width: 600 }),
        K.show("projet_carte", "projets", K.box(
          "dzv-tile",
          K.O({ url: "`javascript:ajax_modal('/view/projet_modifier?id=${id}')`", urlFormula: true }),
          K.field("nom", "as_text", { cls: "dzv-tile-title" }),
          K.meta(K.field("domaine", "as_text"), K.field("statut", "as_text"), K.dateFr("echeance"))
        )),
        K.feed("projets_grille", "projets", "projet_carte", { include: 'statut != "termin\xE9"', order: "echeance", desc: false, lg: 3 })
      ],
      triggers: [
        K.wf("taches_cycle", "Update", "taches", "Date de fin + t\xE2che suivante si elle se r\xE9p\xE8te", [
          K.st("maintenant", "dzf_dates", { operation: "maintenant", sortie: "maintenant" }),
          K.st("noter_fin", "dzf_table_modifier", { table: "taches", id: "{{id}}", valeurs: K.J({ fait_le: "{{maintenant}}" }), sans_declencheurs: true, sortie: "fin" }, { only_if: 'statut == "fait" && !fait_le' }),
          K.st("rouvrir", "dzf_table_modifier", { table: "taches", id: "{{id}}", valeurs: K.J({ fait_le: null }), sans_declencheurs: true, sortie: "rouverte" }, { only_if: 'statut != "fait" && !!fait_le' }),
          K.st("prochaine_date", "dzf_code", { code: PROCHAINE, sortie: "prochaine" }),
          K.st("creer_suivante", "dzf_table_ajouter", { table: "taches", valeurs: K.J({ titre: "{{titre}}", domaine: "{{domaine}}", projet: "{{projet}}", priorite: "{{priorite}}", recurrence: "{{recurrence}}", notes: "{{notes}}", lien: "{{lien}}", statut: "\xE0 faire", echeance: "{{prochaine}}" }), sortie: "suivante" }, { only_if: "!!prochaine" }),
          K.st("marquer", "dzf_table_modifier", { table: "taches", id: "{{id}}", valeurs: K.J({ suivante_creee: true }), sans_declencheurs: true, sortie: "marquee" }, { only_if: "!!prochaine" })
        ]),
        K.wf("taches_rappel", "Daily", null, "Notification du matin (t\xE2ches du jour et en retard)", [
          K.st("demain", "dzf_dates", { operation: "ajouter des jours", jours: 1, format: "jour (AAAA-MM-JJ)", sortie: "demain" }),
          K.st("compter", "dzf_table_compter", { table: "taches", filtre: K.J({ not: { statut: "fait" }, echeance: { lt: "{{demain}}" } }), stat: "compter", sortie: "total" }),
          K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "{{total}} t\xE2che(s) pour aujourd'hui", texte: "Dont celles en retard.", lien: "/page/taches", sortie: "notifies" }, { only_if: "total > 0" })
        ])
      ],
      seeds: {
        projets: [{ nom: "M\xE9moire RNCP", domaine: "Apprentissage", statut: "actif" }],
        taches: [
          { titre: "Faire le tour de mon nouvel espace", domaine: "Perso", statut: "\xE0 faire", priorite: "normale", recurrence: "aucune", echeance: { $daysFromNow: 0 } },
          { titre: "Sortir les poubelles", domaine: "Maison", statut: "\xE0 faire", priorite: "normale", recurrence: "chaque semaine", echeance: { $daysFromNow: 2 } }
        ]
      },
      pages: [{
        name: "taches",
        title: "T\xE2ches",
        quick: { label: "Nouvelle t\xE2che", url: "/view/tache_modifier" },
        content: [
          K.chips([["Tout", ""], ["Pro", "domaine=Pro", "fas fa-briefcase"], ["Maison", "domaine=Maison", "fas fa-home"], ["Perso", "domaine=Perso", "fas fa-user"], ["Administratif", "domaine=Administratif", "fas fa-stamp"], ["Apprentissage", "domaine=Apprentissage", "fas fa-graduation-cap"]]),
          K.view("taches_tableau"),
          K.panel("Projets en cours", "fas fa-layer-group", K.view("projets_grille"), { actions: K.modalBtn("Nouveau projet", "/view/projet_modifier") })
        ]
      }],
      nav: [{ page: "taches", label: "T\xE2ches", icon: "fas fa-check-circle", group: "Organisation", order: 10, mobile: true, keywords: "todo \xE0 faire kanban projets" }],
      quick: [{ label: "Nouvelle t\xE2che", icon: "fas fa-check-circle", url: "/view/tache_modifier", keywords: "t\xE2che todo" }],
      explain: [
        ["Tu ajoutes une t\xE2che", "Formulaire \xAB tache_modifier \xBB (bouton + ou Ctrl K). Elle arrive dans la colonne de son statut."],
        ["Tu glisses une carte", "La vue \xAB taches_tableau \xBB (type DZ Tableau) change le champ statut de la ligne."],
        ["Une t\xE2che passe \xE0 \xAB fait \xBB", "Le workflow \xAB taches_cycle \xBB (\xE0 chaque modification) : bloc Dates \u2192 Table : modifier (fait_le) \u2192 Code (prochaine \xE9ch\xE9ance) \u2192 Table : ajouter (la suivante)."],
        ["Chaque matin", "Le workflow \xAB taches_rappel \xBB : Dates \u2192 Table : compter \u2192 Notifier (seulement s'il y en a)."]
      ]
    };
    module2.exports.DOMAINES = DOMAINES;
    module2.exports.TOGGLE = TOGGLE;
  }
});

// src/modules/objectifs.js
var require_objectifs = __commonJS({
  "src/modules/objectifs.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var { DOMAINES } = require_taches();
    var HABIT_TOGGLE = `// Bouton \xAB Fait aujourd'hui \xBB d'une habitude.
const Suivi = Table.findOne({ name: "habitudes_suivi" });
const jour = new Date(); jour.setHours(0, 0, 0, 0);
const deja = await Suivi.getRow({ habitude: row.id, jour });
if (deja) await Suivi.deleteRows({ id: deja.id });
else await Suivi.insertRow({ habitude: row.id, jour, fait: true });
// lundi de cette semaine
const lundi = new Date(jour); lundi.setDate(jour.getDate() - ((jour.getDay() + 6) % 7));
const n = await Suivi.countRows({ habitude: row.id, jour: { gt: lundi, equal: true } });
await table.updateRow({ semaine: n, fait_aujourdhui: !deja }, row.id, user, true);
return { reload_page: true };`;
    var PROGRESS = `(() => { const p = cible ? Math.max(0, Math.min(100, Math.round((actuel || 0) / cible * 100))) : 0; return '<div class="dzv-prog"><span style="width:' + p + '%"></span></div><div class="dzv-prog-row"><span>' + (actuel || 0) + ' / ' + (cible || 0) + ' ' + String(unite || '').replace(/[<>&"]/g, '') + '</span><b>' + p + ' %</b></div>'; })()`;
    module2.exports = {
      key: "objectifs",
      label: "Objectifs & habitudes",
      icon: "fas fa-bullseye",
      group: "Organisation",
      description: "Objectifs chiffr\xE9s par horizon (semaine \u2192 long terme) avec progression, et habitudes \xE0 cocher chaque jour avec compteur de la semaine.",
      depends: [],
      tables: [
        {
          name: "objectifs",
          description: "Ce que tu veux atteindre",
          fields: [
            K.s("titre", "Objectif", { required: true }),
            K.opts("domaine", "Domaine", DOMAINES),
            K.opts("horizon", "Horizon", ["ce mois", "cette semaine", "ce trimestre", "cette ann\xE9e", "long terme"]),
            K.num("cible", "Cible (nombre)"),
            K.num("actuel", "O\xF9 j'en suis", { default: 0 }),
            K.s("unite", "Unit\xE9", { description: "\u20AC, km, livres, heures\u2026" }),
            K.date("echeance", "\xC9ch\xE9ance"),
            K.opts("statut", "Statut", ["en cours", "atteint", "abandonn\xE9"]),
            K.s("pourquoi", "Pourquoi c'est important")
          ]
        },
        {
          name: "habitudes",
          description: "Ce que tu veux faire r\xE9guli\xE8rement",
          fields: [
            K.s("nom", "Habitude", { required: true }),
            K.s("icone", "Ic\xF4ne", { default: "fas fa-check", description: "Nom d'ic\xF4ne Font Awesome, ex. fas fa-running" }),
            K.int("par_semaine", "Fois par semaine", { default: 7 }),
            K.bool("active", "Active", { default: true }),
            K.key("objectif", "Objectif li\xE9", "objectifs", "titre"),
            K.int("semaine", "Faites cette semaine", { default: 0 }),
            K.bool("fait_aujourdhui", "Fait aujourd'hui")
          ]
        },
        {
          name: "habitudes_suivi",
          description: "Une ligne par habitude coch\xE9e et par jour",
          fields: [K.key("habitude", "Habitude", "habitudes", "nom", { required: true }), K.date("jour", "Jour", { required: true }), K.bool("fait", "Fait", { default: true })]
        }
      ],
      views: [
        K.edit("objectif_modifier", "objectifs", [
          ["titre", "Objectif"],
          ["domaine", "Domaine"],
          ["horizon", "Horizon"],
          ["statut", "Statut"],
          ["actuel", "O\xF9 j'en suis"],
          ["cible", "Cible"],
          ["unite", "Unit\xE9"],
          ["echeance", "\xC9ch\xE9ance", "editDay"],
          ["pourquoi", "Pourquoi c'est important", "textarea"]
        ], { delete: true, title: "Objectif", width: 620 }),
        K.show("objectif_carte", "objectifs", K.box(
          "dzv-tile",
          K.O({ url: "`javascript:ajax_modal('/view/objectif_modifier?id=${id}')`", urlFormula: true }),
          K.meta(K.field("horizon", "as_text"), K.field("domaine", "as_text"), K.dateFr("echeance")),
          K.field("titre", "as_text", { cls: "dzv-tile-title" }),
          K.formula(PROGRESS, { html: true })
        )),
        K.feed("objectifs_grille", "objectifs", "objectif_carte", { include: 'statut == "en cours"', order: "echeance", desc: false, lg: 3 }),
        K.edit("habitude_modifier", "habitudes", [["nom", "Habitude"], ["icone", "Ic\xF4ne"], ["par_semaine", "Fois par semaine"], ["objectif", "Objectif li\xE9", "select"], ["active", "Active"]], { delete: true, title: "Habitude", width: 560 }),
        K.show("habitude_ligne", "habitudes", K.box(
          "`dzv-habit${fait_aujourdhui ? ' dzv-habit-done' : ''}`",
          K.O({ clsFormula: true }),
          K.formula(`\`<span class="dzv-habit-ic"><i class="\${(icone || 'fas fa-check').replace(/[^a-z0-9 -]/g, '')}"></i></span>\``, { html: true, block: false }),
          K.box("dzv-habit-t", K.field("nom", "as_text"), K.formula("`${semaine || 0} / ${par_semaine || 7} cette semaine`", { style: "", cls: "dzv-muted" })),
          K.jsBtn("Fait", HABIT_TOGGLE, { style: "btn-outline-success", icon: "fas fa-check" }),
          K.modalLink("habitude_modifier", "")
        )),
        K.feed("habitudes_jour", "habitudes", "habitude_ligne", { include: "active == true", order: "id", desc: false, md: 1, lg: 1 })
      ],
      triggers: [
        K.wf("habitudes_minuit", "Daily", null, "Remise \xE0 z\xE9ro quotidienne (et hebdomadaire le lundi)", [
          K.st("remise", "dzf_table_modifier", { table: "habitudes", filtre: K.J({ fait_aujourdhui: true }), valeurs: K.J({ fait_aujourdhui: false }), sans_declencheurs: true, sortie: "remis" }),
          K.st("lundi", "dzf_verifier", { condition: "new Date().getDay() === 1", si_faux: "renvoyer faux", sortie: "lundi" }),
          K.st("semaine", "dzf_table_modifier", { table: "habitudes", filtre: K.J({ semaine: { gt: 0 } }), valeurs: K.J({ semaine: 0 }), sans_declencheurs: true, sortie: "semaine_remise" }, { only_if: "lundi" })
        ])
      ],
      seeds: {
        objectifs: [
          { titre: "Valider le m\xE9moire RNCP", domaine: "Apprentissage", horizon: "cette ann\xE9e", cible: 100, actuel: 40, unite: "%", statut: "en cours" },
          { titre: "Mettre de c\xF4t\xE9 chaque mois", domaine: "Finances", horizon: "ce mois", cible: 300, actuel: 0, unite: "\u20AC", statut: "en cours" }
        ],
        habitudes: [
          { nom: "Sport ou marche 30 min", icone: "fas fa-running", par_semaine: 4, active: true, semaine: 0, fait_aujourdhui: false },
          { nom: "Veille tech 20 min", icone: "fas fa-newspaper", par_semaine: 5, active: true, semaine: 0, fait_aujourdhui: false },
          { nom: "Lire", icone: "fas fa-book", par_semaine: 5, active: true, semaine: 0, fait_aujourdhui: false }
        ]
      },
      pages: [{
        name: "objectifs",
        title: "Objectifs & habitudes",
        quick: { label: "Nouvel objectif", url: "/view/objectif_modifier" },
        content: [
          K.grid(
            "dzv-grid-main",
            K.panel("Objectifs en cours", "fas fa-bullseye", K.view("objectifs_grille"), { actions: K.modalBtn("Objectif", "/view/objectif_modifier") }),
            K.panel("Habitudes du jour", "fas fa-seedling", K.view("habitudes_jour"), { actions: K.modalBtn("Habitude", "/view/habitude_modifier") })
          )
        ]
      }],
      nav: [{ page: "objectifs", label: "Objectifs", icon: "fas fa-bullseye", group: "Organisation", order: 20, keywords: "habitudes buts progression" }],
      quick: [{ label: "Nouvel objectif", icon: "fas fa-bullseye", url: "/view/objectif_modifier" }, { label: "Nouvelle habitude", icon: "fas fa-seedling", url: "/view/habitude_modifier" }],
      explain: [
        ["Tu cr\xE9es un objectif", "Table \xAB objectifs \xBB. La barre de progression est un texte calcul\xE9 (formule) dans la vue \xAB objectif_carte \xBB : actuel / cible."],
        ["Tu coches une habitude", "Le bouton \xAB Fait \xBB (action JavaScript dans la vue \xAB habitude_ligne \xBB) ajoute une ligne dans \xAB habitudes_suivi \xBB et recompte la semaine."],
        ["Chaque nuit", "Le workflow \xAB habitudes_minuit \xBB (blocs Table : modifier + V\xE9rifier) remet \xAB fait aujourd'hui \xBB \xE0 z\xE9ro ; le lundi, il remet aussi le compteur de la semaine."]
      ]
    };
  }
});

// src/modules/maison.js
var require_maison = __commonJS({
  "src/modules/maison.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var COCHER = `// Coche / d\xE9coche un article de la liste de courses.
await table.updateRow({ pris: !row.pris }, row.id, user);
return { reload_page: true };`;
    var VIDER = `// Retire de la liste les articles d\xE9j\xE0 pris.
const t = Table.findOne({ name: "courses" });
await t.deleteRows({ pris: true });
return { reload_page: true };`;
    module2.exports = {
      key: "maison",
      label: "Maison",
      icon: "fas fa-home",
      group: "Organisation",
      description: "Les t\xE2ches de la maison (m\xE9nage, factures, r\xE9parations) en tableau, les routines qui se r\xE9p\xE8tent, et la liste de courses par rayon.",
      depends: ["taches"],
      tables: [{
        name: "courses",
        description: "Liste de courses",
        fields: [
          K.s("article", "Article", { required: true }),
          K.s("quantite", "Quantit\xE9"),
          K.opts("rayon", "Rayon", ["\xE9picerie", "fruits & l\xE9gumes", "frais", "surgel\xE9s", "boissons", "hygi\xE8ne", "maison", "autre"]),
          K.bool("pris", "Pris")
        ]
      }],
      views: [
        K.edit("course_modifier", "courses", [["article", "Article"], ["quantite", "Quantit\xE9"], ["rayon", "Rayon"]], { delete: true, title: "Article", width: 520, cols: 1 }),
        K.list("courses_liste", "courses", [
          ["", K.jsBtn("", COCHER, { style: "btn-link", size: "", icon: "far fa-square", cls: "dzv-check" })],
          ["Article", K.field("article", "as_text")],
          ["Qt\xE9", K.field("quantite", "as_text")],
          ["Rayon", K.field("rayon", "as_text", { cls: "dzv-pill" })]
        ], { order: "pris", desc: false, noHeader: true, rowClick: "`/view/course_modifier?id=${id}`", limit: 100, state: { _row_color_formula: "" }, description: "Liste de courses" })
      ],
      seeds: { courses: [{ article: "Riz", quantite: "5 kg", rayon: "\xE9picerie", pris: false }, { article: "Oignons", quantite: "1 filet", rayon: "fruits & l\xE9gumes", pris: false }] },
      pages: [{
        name: "maison",
        title: "Maison",
        quick: { label: "T\xE2che maison", url: "/view/tache_modifier?domaine=Maison" },
        content: [
          K.grid(
            "dzv-grid-main",
            K.panel("T\xE2ches de la maison", "fas fa-broom", K.view("taches_tableau", { state: "fixed", fixed: { domaine: "Maison" }, id: "tmaison" }), { actions: K.modalBtn("T\xE2che", "/view/tache_modifier?domaine=Maison") }),
            K.panel("Courses", "fas fa-shopping-basket", [K.view("courses_liste"), K.box("dzv-tile-actions", K.jsBtn("Retirer les articles pris", VIDER, { icon: "fas fa-broom", style: "btn-outline-secondary" }))], { actions: K.modalBtn("Article", "/view/course_modifier") })
          )
        ]
      }],
      nav: [{ page: "maison", label: "Maison", icon: "fas fa-home", group: "Organisation", order: 30, keywords: "courses m\xE9nage routine" }],
      quick: [{ label: "Article de courses", icon: "fas fa-shopping-basket", url: "/view/course_modifier", keywords: "courses" }],
      explain: [
        ["T\xE2ches de la maison", "Ce sont les t\xE2ches du module T\xE2ches avec domaine = Maison : la page int\xE8gre la vue \xAB taches_tableau \xBB avec ce filtre fix\xE9."],
        ["Routines (poubelles, m\xE9nage\u2026)", "Une t\xE2che avec \xAB Se r\xE9p\xE8te \xBB : quand tu la passes \xE0 fait, la suivante est cr\xE9\xE9e (d\xE9clencheur \xAB taches_cycle \xBB)."],
        ["Courses", "Table \xAB courses \xBB. La case \xE0 cocher est une action JavaScript de la vue \xAB courses_liste \xBB ; le bouton du bas supprime les articles pris."]
      ]
    };
  }
});

// src/modules/budget.js
var require_budget = __commonJS({
  "src/modules/budget.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var SOLDES = `// Recalcule le solde de chaque compte :
// solde = solde de d\xE9part + revenus - d\xE9penses - virements sortants + virements entrants.
const Comptes = Table.findOne({ name: "comptes" });
const Ops = Table.findOne({ name: "operations" });
const somme = async (where) => Number(((await Ops.aggregationQuery({ s: { field: "montant", aggregate: "Sum" } }, { where })) || {}).s || 0);
for (const c of await Comptes.getRows({})) {
  const solde = (c.solde_initial || 0)
    + await somme({ compte: c.id, type: "revenu" })
    - await somme({ compte: c.id, type: "d\xE9pense" })
    - await somme({ compte: c.id, type: "virement" })
    + await somme({ vers_compte: c.id, type: "virement" });
  if (Math.abs((c.solde || 0) - solde) > 0.001) await Comptes.updateRow({ solde }, c.id, undefined, true);
}`;
    var trig = (when) => K.wf(`operations_soldes_${when.toLowerCase()}`, when, "operations", `Recalcule les soldes des comptes (${when === "Insert" ? "ajout" : when === "Update" ? "modification" : "suppression"} d'une op\xE9ration)`, [
      K.st("soldes", "dzf_code", { code: SOLDES, sortie: "soldes" })
    ]);
    var TILES = JSON.stringify([
      { id: "rev", label: "Revenus du mois", icon: "fas fa-arrow-down", table: "operations", stat: "sum", field: "montant", where: { type: "revenu" }, period: { field: "date", range: "month" }, format: "eur", tone: "success" },
      { id: "dep", label: "D\xE9penses du mois", icon: "fas fa-arrow-up", table: "operations", stat: "sum", field: "montant", where: { type: "d\xE9pense" }, period: { field: "date", range: "month" }, format: "eur", tone: "warning" },
      { id: "bud", label: "Budget pr\xE9vu", icon: "fas fa-bullseye", table: "budget_categories", stat: "sum", field: "budget_mensuel", where: { type: "d\xE9pense" }, format: "eur", hidden: false },
      { label: "Reste dans le budget", icon: "fas fa-piggy-bank", expr: "bud - dep", format: "eur", tone: "info" }
    ], null, 1);
    module2.exports = {
      key: "budget",
      label: "Budget",
      icon: "fas fa-wallet",
      group: "Vie perso",
      description: "Comptes et soldes, d\xE9penses et revenus saisis \xE0 la main en 10 secondes, budget mensuel par cat\xE9gorie avec barres qui virent au rouge quand \xE7a d\xE9passe.",
      depends: [],
      tables: [
        {
          name: "comptes",
          description: "Tes comptes (banque, esp\xE8ces, \xE9pargne, mobile money)",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.opts("type", "Type", ["courant", "\xE9pargne", "esp\xE8ces", "carte", "mobile money"]),
            K.opts("devise", "Devise", ["EUR", "XOF"]),
            K.num("solde_initial", "Solde de d\xE9part", { default: 0 }),
            K.num("solde", "Solde (calcul\xE9)", { default: 0, description: "Mis \xE0 jour par les d\xE9clencheurs operations_soldes_*" }),
            K.color("couleur", "Couleur"),
            K.bool("actif", "Actif", { default: true })
          ]
        },
        {
          name: "budget_categories",
          description: "Cat\xE9gories de d\xE9penses et de revenus, avec budget mensuel",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.opts("type", "Type", ["d\xE9pense", "revenu"]),
            K.s("icone", "Ic\xF4ne", { description: "Nom d'ic\xF4ne Font Awesome, ex. fas fa-home" }),
            K.color("couleur", "Couleur"),
            K.num("budget_mensuel", "Budget par mois")
          ]
        },
        {
          name: "operations",
          description: "Chaque d\xE9pense, revenu ou virement",
          fields: [
            K.date("date", "Date", { required: true }),
            K.s("libelle", "Libell\xE9", { required: true }),
            K.num("montant", "Montant", { required: true, description: "Toujours positif : le type dit si c'est une d\xE9pense ou un revenu" }),
            K.opts("type", "Type", ["d\xE9pense", "revenu", "virement"]),
            K.key("categorie", "Cat\xE9gorie", "budget_categories", "nom"),
            K.key("compte", "Compte", "comptes", "nom"),
            K.key("vers_compte", "Vers le compte (virement)", "comptes", "nom"),
            K.s("note", "Note"),
            K.bool("pointee", "Point\xE9e sur le relev\xE9")
          ]
        }
      ],
      views: [
        K.edit("operation_modifier", "operations", [
          ["montant", "Montant"],
          ["type", "Type"],
          ["libelle", "Libell\xE9"],
          ["date", "Date", "editDay"],
          ["categorie", "Cat\xE9gorie", "select"],
          ["compte", "Compte", "select"],
          ["vers_compte", "Vers le compte (si virement)", "select"],
          ["pointee", "Point\xE9e"],
          ["note", "Note", "textarea"]
        ], { delete: true, title: "Op\xE9ration", width: 620 }),
        K.list("operations_liste", "operations", [
          ["Date", K.dateFr("date")],
          ["Libell\xE9", K.field("libelle", "as_text")],
          ["Cat\xE9gorie", K.join("categorie.nom", "as_text")],
          ["Compte", K.join("compte.nom", "as_text")],
          ["Montant", K.box('type === "revenu" ? "dzv-amt dzv-in" : type === "virement" ? "dzv-amt dzv-move" : "dzv-amt dzv-out"', K.O({ clsFormula: true, el: "span" }), K.field("montant", "show", { cfg: { decimal_places: 2 } }))]
        ], { order: "date", desc: true, rowClick: "`/view/operation_modifier?id=${id}`", limit: 30, description: "Derni\xE8res op\xE9rations" }),
        K.custom("budget_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 4 }, "Revenus, d\xE9penses, budget et reste du mois"),
        K.custom("budget_mois", "DZ R\xE9partition", "operations", {
          champ_groupe: "categorie",
          champ_valeur: "montant",
          champ_date: "date",
          periode: "month",
          champ_libelle: "nom",
          champ_objectif: "budget_mensuel",
          champ_couleur: "couleur",
          champ_icone: "icone",
          format: "eur",
          filtre: '{"type":"d\xE9pense"}',
          filtre_groupes: '{"type":"d\xE9pense"}',
          texte_vide: "Aucune d\xE9pense ce mois-ci"
        }, "D\xE9penses du mois par cat\xE9gorie, compar\xE9es au budget"),
        K.edit("compte_modifier", "comptes", [["nom", "Nom"], ["type", "Type"], ["devise", "Devise"], ["solde_initial", "Solde de d\xE9part"], ["couleur", "Couleur"], ["actif", "Actif"]], { delete: true, title: "Compte", width: 560 }),
        K.show("compte_carte", "comptes", K.box(
          "dzv-tile",
          K.O({ url: "`javascript:ajax_modal('/view/compte_modifier?id=${id}')`", urlFormula: true }),
          K.meta(K.field("type", "as_text"), K.field("devise", "as_text")),
          K.field("nom", "as_text", { cls: "dzv-tile-title" }),
          K.box("dzv-big", K.formula("(solde || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (devise === 'XOF' ? ' FCFA' : ' \u20AC')"))
        )),
        K.feed("comptes_grille", "comptes", "compte_carte", { include: "actif == true", order: "id", desc: false, md: 2, lg: 2, xl: 2 }),
        K.edit("categorie_modifier", "budget_categories", [["nom", "Nom"], ["type", "Type"], ["budget_mensuel", "Budget par mois"], ["icone", "Ic\xF4ne"], ["couleur", "Couleur"]], { delete: true, title: "Cat\xE9gorie", width: 560 }),
        K.list("categories_liste", "budget_categories", [
          ["Cat\xE9gorie", K.field("nom", "as_text")],
          ["Type", K.field("type", "as_text", { cls: "dzv-pill" })],
          ["Budget / mois", K.field("budget_mensuel", "show", { cfg: { decimal_places: 0 } })]
        ], { order: "nom", desc: false, rowClick: "`/view/categorie_modifier?id=${id}`", limit: 60 })
      ],
      triggers: [trig("Insert"), trig("Update"), trig("Delete")],
      seeds: {
        comptes: [
          { nom: "Compte courant", type: "courant", devise: "EUR", solde_initial: 0, solde: 0, actif: true },
          { nom: "Esp\xE8ces", type: "esp\xE8ces", devise: "EUR", solde_initial: 0, solde: 0, actif: true }
        ],
        budget_categories: [
          ["Logement", "fas fa-home", 0],
          ["Courses", "fas fa-shopping-basket", 250],
          ["Transport", "fas fa-subway", 90],
          ["Abonnements", "fas fa-sync", 40],
          ["Restaurants & sorties", "fas fa-utensils", 120],
          ["Sant\xE9", "fas fa-heartbeat", 30],
          ["Shopping", "fas fa-tshirt", 80],
          ["Famille & envois", "fas fa-hand-holding-heart", 0],
          ["Formation & tech", "fas fa-laptop-code", 30],
          ["Imp\xF4ts & frais", "fas fa-landmark", 0],
          ["Impr\xE9vus", "fas fa-bolt", 50]
        ].map(([nom, icone, b]) => ({ nom, icone, type: "d\xE9pense", budget_mensuel: b })).concat([["Salaire", "fas fa-briefcase"], ["Remboursements", "fas fa-undo"], ["Autres revenus", "fas fa-coins"]].map(([nom, icone]) => ({ nom, icone, type: "revenu" })))
      },
      pages: [{
        name: "budget",
        title: "Budget",
        quick: { label: "D\xE9pense", url: "/view/operation_modifier" },
        content: [
          K.view("budget_chiffres"),
          K.grid(
            "dzv-grid-main",
            K.panel("Derni\xE8res op\xE9rations", "fas fa-receipt", K.view("operations_liste"), { cls: "dzv-ops", actions: K.modalBtn("Revenu", "/view/operation_modifier?type=revenu", "fas fa-arrow-down") + K.modalBtn("D\xE9pense", "/view/operation_modifier?type=d\xE9pense", "fas fa-arrow-up") }),
            K.box(
              "dzv-grid",
              K.panel("Ce mois par cat\xE9gorie", "fas fa-chart-bar", K.view("budget_mois")),
              K.panel("Comptes", "fas fa-university", K.view("comptes_grille"), { actions: K.modalBtn("Compte", "/view/compte_modifier") })
            )
          ),
          K.panel("Cat\xE9gories et budgets", "fas fa-tags", K.view("categories_liste"), { actions: K.modalBtn("Cat\xE9gorie", "/view/categorie_modifier") })
        ]
      }],
      nav: [{ page: "budget", label: "Budget", icon: "fas fa-wallet", group: "Vie perso", order: 10, mobile: true, keywords: "argent d\xE9penses comptes finances" }],
      quick: [{ label: "Nouvelle d\xE9pense", icon: "fas fa-arrow-up", url: "/view/operation_modifier?type=d\xE9pense", keywords: "d\xE9pense achat" }, { label: "Nouveau revenu", icon: "fas fa-arrow-down", url: "/view/operation_modifier?type=revenu", keywords: "revenu salaire" }],
      explain: [
        ["Tu ajoutes une d\xE9pense", "Formulaire \xAB operation_modifier \xBB. Montant toujours positif ; le type (d\xE9pense, revenu, virement) donne le sens."],
        ["Juste apr\xE8s", "Les workflows \xAB operations_soldes_insert / update / delete \xBB (bloc Code) recalculent le solde de chaque compte (champ comptes.solde)."],
        ["Le budget du mois", "La vue \xAB budget_mois \xBB (DZ R\xE9partition) additionne les d\xE9penses du mois par cat\xE9gorie et les compare au champ budget_mensuel."],
        ["Les chiffres du haut", "La vue \xAB budget_chiffres \xBB (DZ Indicateurs) : sommes filtr\xE9es par type et par p\xE9riode ; \xAB Reste \xBB = budget pr\xE9vu \u2212 d\xE9penses."]
      ]
    };
  }
});

// src/modules/sante.js
var require_sante = __commonJS({
  "src/modules/sante.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var TILES = JSON.stringify([
      { label: "RDV dans les 30 jours", icon: "fas fa-stethoscope", table: "rdv_sante", stat: "count", where: { fait: false }, period: { field: "date", range: "next30" }, tone: "info" },
      { label: "Traitements en cours", icon: "fas fa-pills", table: "traitements", stat: "count", where: { actif: true } },
      { label: "Poids moyen (30 j)", icon: "fas fa-weight", table: "mesures_sante", stat: "avg", field: "valeur", where: { type: "poids (kg)" }, period: { field: "date", range: "last30" }, format: "dec", sub: "kg" },
      { label: "Sommeil moyen (7 j)", icon: "fas fa-bed", table: "mesures_sante", stat: "avg", field: "valeur", where: { type: "sommeil (h)" }, period: { field: "date", range: "last7" }, format: "dec", sub: "heures par nuit" }
    ], null, 1);
    module2.exports = {
      key: "sante",
      label: "Sant\xE9",
      icon: "fas fa-heartbeat",
      group: "Vie perso",
      description: "Rendez-vous m\xE9dicaux avec rappel la veille, traitements en cours, mesures (poids, tension, sommeil, pas\u2026) et carnet des soignants.",
      depends: [],
      tables: [
        {
          name: "sante_contacts",
          description: "M\xE9decins, dentiste, pharmacie\u2026",
          fields: [K.s("nom", "Nom", { required: true }), K.s("specialite", "Sp\xE9cialit\xE9"), K.s("telephone", "T\xE9l\xE9phone"), K.s("adresse", "Adresse"), K.s("notes", "Notes")]
        },
        {
          name: "rdv_sante",
          description: "Rendez-vous m\xE9dicaux",
          fields: [
            K.date("date", "Date et heure", { required: true }),
            K.s("motif", "Motif", { required: true }),
            K.key("contact", "Avec", "sante_contacts", "nom"),
            K.s("lieu", "Lieu"),
            K.s("notes", "Notes / compte rendu"),
            K.bool("fait", "Pass\xE9")
          ]
        },
        {
          name: "traitements",
          description: "M\xE9dicaments et soins en cours",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.s("dosage", "Dosage"),
            K.opts("moments", "Quand", ["matin", "midi", "soir", "matin et soir", "matin, midi et soir", "au besoin"]),
            K.date("debut", "D\xE9but"),
            K.date("fin", "Fin"),
            K.bool("actif", "En cours", { default: true }),
            K.s("notes", "Notes")
          ]
        },
        {
          name: "mesures_sante",
          description: "Suivi chiffr\xE9 (poids, tension, sommeil\u2026)",
          fields: [
            K.date("date", "Date", { required: true }),
            K.opts("type", "Mesure", ["poids (kg)", "tension", "sommeil (h)", "pas", "fr\xE9quence cardiaque", "glyc\xE9mie", "humeur (1 \xE0 5)", "autre"], { required: true }),
            K.num("valeur", "Valeur", { required: true }),
            K.num("valeur2", "2e valeur", { description: "ex. tension basse" }),
            K.s("note", "Note")
          ]
        }
      ],
      views: [
        K.edit("rdv_modifier", "rdv_sante", [["motif", "Motif"], ["date", "Date et heure", "edit"], ["contact", "Avec", "select"], ["lieu", "Lieu"], ["fait", "Pass\xE9"], ["notes", "Notes / compte rendu", "textarea"]], { delete: true, title: "Rendez-vous", width: 600 }),
        K.list("rdv_a_venir", "rdv_sante", [
          ["Quand", K.dateFr("date", { time: true })],
          ["Motif", K.field("motif", "as_text")],
          ["Avec", K.join("contact.nom", "as_text")],
          ["Lieu", K.field("lieu", "as_text")]
        ], { include: "fait == false", order: "date", desc: false, rowClick: "`/view/rdv_modifier?id=${id}`", limit: 20 }),
        K.edit("traitement_modifier", "traitements", [["nom", "Nom"], ["dosage", "Dosage"], ["moments", "Quand"], ["actif", "En cours"], ["debut", "D\xE9but", "editDay"], ["fin", "Fin", "editDay"], ["notes", "Notes", "textarea"]], { delete: true, title: "Traitement", width: 600 }),
        K.list(
          "traitements_en_cours",
          "traitements",
          [["Traitement", K.field("nom", "as_text")], ["Dosage", K.field("dosage", "as_text")], ["Quand", K.field("moments", "as_text", { cls: "dzv-pill" })], ["Jusqu'au", K.dateFr("fin")]],
          { include: "actif == true", order: "nom", desc: false, rowClick: "`/view/traitement_modifier?id=${id}`", limit: 30 }
        ),
        K.edit("mesure_modifier", "mesures_sante", [["type", "Mesure"], ["valeur", "Valeur"], ["valeur2", "2e valeur (tension basse\u2026)"], ["date", "Date", "edit"], ["note", "Note", "textarea"]], { delete: true, title: "Mesure", width: 560 }),
        K.list(
          "mesures_recentes",
          "mesures_sante",
          [["Date", K.dateFr("date")], ["Mesure", K.field("type", "as_text")], ["Valeur", K.field("valeur", "show")], ["", K.field("valeur2", "show")], ["Note", K.field("note", "as_text")]],
          { order: "date", desc: true, rowClick: "`/view/mesure_modifier?id=${id}`", limit: 15 }
        ),
        K.edit("soignant_modifier", "sante_contacts", [["nom", "Nom"], ["specialite", "Sp\xE9cialit\xE9"], ["telephone", "T\xE9l\xE9phone"], ["adresse", "Adresse"], ["notes", "Notes", "textarea"]], { delete: true, title: "Soignant", width: 560 }),
        K.list("soignants_liste", "sante_contacts", [["Nom", K.field("nom", "as_text")], ["Sp\xE9cialit\xE9", K.field("specialite", "as_text")], ["T\xE9l\xE9phone", K.field("telephone", "as_text")]], { order: "nom", desc: false, rowClick: "`/view/soignant_modifier?id=${id}`" }),
        K.custom("sante_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 4 }, "Chiffres sant\xE9")
      ],
      triggers: [
        K.wf("sante_rappel", "Daily", null, "Notification la veille d'un rendez-vous et avant la fin d'un traitement", [
          K.st("aujourdhui", "dzf_dates", { operation: "d\xE9but du jour", format: "iso", sortie: "aujourdhui" }),
          K.st("demain", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 1, sortie: "demain" }),
          K.st("apres_demain", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 2, sortie: "apres_demain" }),
          K.st("dans7", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 7, sortie: "dans7" }),
          K.st("rdv", "dzf_table_chercher", { table: "rdv_sante", filtre: K.J({ fait: false, date: { gt: "{{demain}}", lt: "{{apres_demain}}", equal: true } }), tri: "date", limite: 20, sortie: "rdv" }),
          K.st("texte_rdv", "dzf_texte", { modele: "{{lignes}}", liste: "{{rdv}}", modele_ligne: "- {{item.motif}} {{item.lieu}}", sortie: "texte_rdv" }),
          K.st("notifier_rdv", "dzf_notifier", { qui: "administrateurs", titre: "Rendez-vous demain", texte: "{{texte_rdv}}", lien: "/page/sante", sortie: "n1" }, { only_if: "rdv.length > 0" }),
          K.st("fins", "dzf_table_chercher", { table: "traitements", filtre: K.J({ actif: true, fin: { gt: "{{aujourdhui}}", lt: "{{dans7}}", equal: true } }), limite: 20, sortie: "fins" }),
          K.st("texte_fins", "dzf_texte", { modele: "Penser \xE0 l'ordonnance ?\n{{lignes}}", liste: "{{fins}}", modele_ligne: "- {{item.nom}}", sortie: "texte_fins" }),
          K.st("notifier_fins", "dzf_notifier", { qui: "administrateurs", titre: "Traitement(s) bient\xF4t termin\xE9(s)", texte: "{{texte_fins}}", lien: "/page/sante", sortie: "n2" }, { only_if: "fins.length > 0" })
        ])
      ],
      pages: [{
        name: "sante",
        title: "Sant\xE9",
        quick: { label: "Rendez-vous", url: "/view/rdv_modifier" },
        content: [
          K.view("sante_chiffres"),
          K.grid(
            "dzv-grid-2",
            K.panel("Rendez-vous", "fas fa-stethoscope", K.view("rdv_a_venir"), { actions: K.modalBtn("RDV", "/view/rdv_modifier") }),
            K.panel("Traitements en cours", "fas fa-pills", K.view("traitements_en_cours"), { actions: K.modalBtn("Traitement", "/view/traitement_modifier") })
          ),
          K.grid(
            "dzv-grid-main",
            K.panel("Mesures", "fas fa-chart-line", K.view("mesures_recentes"), { actions: K.modalBtn("Mesure", "/view/mesure_modifier") }),
            K.panel("Soignants", "fas fa-user-md", K.view("soignants_liste"), { actions: K.modalBtn("Soignant", "/view/soignant_modifier") })
          )
        ]
      }],
      nav: [{ page: "sante", label: "Sant\xE9", icon: "fas fa-heartbeat", group: "Vie perso", order: 20, keywords: "m\xE9decin rdv traitement poids sommeil" }],
      quick: [{ label: "RDV m\xE9dical", icon: "fas fa-stethoscope", url: "/view/rdv_modifier", keywords: "m\xE9decin" }, { label: "Mesure sant\xE9", icon: "fas fa-weight", url: "/view/mesure_modifier", keywords: "poids sommeil tension" }],
      explain: [
        ["Tu notes un rendez-vous", "Table \xAB rdv_sante \xBB. Il appara\xEEt dans la page Sant\xE9 et dans \xAB Cette semaine \xBB de l'accueil."],
        ["La veille au matin", "Le workflow \xAB sante_rappel \xBB (Dates \u2192 Table : chercher \u2192 Texte \u2192 Notifier) t'envoie une notification, et une autre quand un traitement se termine dans la semaine."],
        ["Tes mesures", "Table \xAB mesures_sante \xBB. Les moyennes du haut sont calcul\xE9es par la vue \xAB sante_chiffres \xBB (DZ Indicateurs)."]
      ]
    };
  }
});

// src/modules/documents.js
var require_documents = __commonJS({
  "src/modules/documents.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var CATS = ["identit\xE9", "sant\xE9", "banque", "imp\xF4ts", "logement", "travail", "\xE9tudes", "v\xE9hicule", "assurance", "factures", "autre"];
    var ICONS = { identit\u00E9: "fa-id-card", sant\u00E9: "fa-notes-medical", banque: "fa-university", imp\u00F4ts: "fa-landmark", logement: "fa-home", travail: "fa-briefcase", \u00E9tudes: "fa-graduation-cap", v\u00E9hicule: "fa-car", assurance: "fa-shield-alt", factures: "fa-file-invoice", autre: "fa-file" };
    var ICON_FML = `'<span class="dzv-doc-ic"><i class="fas ' + (${JSON.stringify(ICONS)}[categorie] || 'fa-file') + '"></i></span>'`;
    var EXPIRY_FML = `expire_le ? (() => { const j = Math.round((new Date(expire_le) - new Date()) / 864e5); return j < 0 ? '<span class="dzv-meta dzv-late">expir\xE9</span>' : j <= (rappel_jours || 60) ? '<span class="dzv-meta dzv-today">expire dans ' + j + ' j</span>' : '<span class="dzv-meta">valable jusqu\\'au ' + new Date(expire_le).toLocaleDateString('fr-FR') + '</span>'; })() : ''`;
    module2.exports = {
      key: "documents",
      label: "Documents",
      icon: "fas fa-folder-open",
      group: "Vie perso",
      description: "Coffre de documents rang\xE9s par cat\xE9gorie (identit\xE9, imp\xF4ts, logement\u2026), fichiers joints, dates d'expiration avec rappel et t\xE2che de renouvellement automatique.",
      depends: [],
      setup: "<p>Les fichiers sont rang\xE9s par Saltcorn (Param\xE8tres \u2192 Fichiers). Sur plusieurs serveurs, utilise le stockage S3 pour que tous les n\u0153uds les voient.</p>",
      tables: [{
        name: "documents",
        description: "Tes papiers importants",
        fields: [
          K.s("titre", "Titre", { required: true }),
          K.opts("categorie", "Cat\xE9gorie", CATS),
          K.file("fichier", "Fichier"),
          K.date("date_document", "Date du document"),
          K.date("expire_le", "Expire le"),
          K.int("rappel_jours", "Me pr\xE9venir (jours avant)", { default: 60 }),
          K.bool("important", "Important"),
          K.s("notes", "Notes"),
          K.bool("rappel_envoye", "Rappel envoy\xE9")
        ]
      }],
      views: [
        K.edit("document_modifier", "documents", [
          ["titre", "Titre"],
          ["categorie", "Cat\xE9gorie"],
          ["fichier", "Fichier", "upload"],
          ["date_document", "Date du document", "editDay"],
          ["expire_le", "Expire le", "editDay"],
          ["rappel_jours", "Me pr\xE9venir (jours avant)"],
          ["important", "Important"],
          ["notes", "Notes", "textarea"]
        ], { delete: true, title: "Document", width: 620 }),
        K.show("document_carte", "documents", K.box(
          "dzv-tile dzv-doc",
          K.box("dzv-doc-top", K.formula(ICON_FML, { html: true, block: false }), K.box("dzv-doc-t", K.field("titre", "as_text", { cls: "dzv-tile-title" }), K.meta(K.field("categorie", "as_text"), K.dateFr("date_document")))),
          K.formula(EXPIRY_FML, { html: true }),
          K.box("dzv-tile-actions", K.field("fichier", "Download link"), K.modalLink("document_modifier", "Modifier"))
        )),
        K.feed("documents_grille", "documents", "document_carte", { order: "categorie", desc: false, lg: 3, limit: 60 })
      ],
      triggers: [
        K.wf("documents_rappel", "Daily", null, "Pr\xE9vient avant l'expiration d'un document et cr\xE9e une t\xE2che \xAB Renouveler \xBB", [
          K.st("aujourdhui", "dzf_dates", { operation: "d\xE9but du jour", sortie: "aujourdhui" }),
          K.st("horizon", "dzf_dates", { operation: "ajouter des jours", date: "{{aujourdhui}}", jours: 365, sortie: "horizon" }),
          K.st("proches", "dzf_table_chercher", { table: "documents", filtre: K.J({ rappel_envoye: false, expire_le: { gt: "{{aujourdhui}}", lt: "{{horizon}}" } }), tri: "expire_le", limite: 200, sortie: "proches" }),
          K.st("a_prevenir", "dzf_liste_filtrer", { liste: "{{proches}}", expression: "(new Date(item.expire_le) - Date.now()) / 864e5 <= (item.rappel_jours || 60)", sortie: "a_prevenir" }),
          K.st("taches", "dzf_liste_transformer", { liste: "{{a_prevenir}}", modele: K.J({ titre: "Renouveler : {{item.titre}}", domaine: "Administratif", statut: "\xE0 faire", priorite: "haute", recurrence: "aucune", echeance: "{{item.expire_le}}", source: "document" }), sortie: "taches" }),
          K.st("creer_taches", "dzf_table_ajouter", { table: "taches", liste: "{{taches}}", si_erreur: "continuer", sortie: "taches_creees" }, { only_if: "a_prevenir.length > 0" }),
          K.st("marquer", "dzf_table_modifier", { table: "documents", ids: "{{a_prevenir}}", valeurs: K.J({ rappel_envoye: true }), sans_declencheurs: true, sortie: "marques" }, { only_if: "a_prevenir.length > 0" }),
          K.st("texte", "dzf_texte", { modele: "{{lignes}}", liste: "{{a_prevenir}}", modele_ligne: "- {{item.titre}}", sortie: "texte" }),
          K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "Document(s) bient\xF4t expir\xE9(s)", texte: "{{texte}}", lien: "/page/documents", sortie: "notifies" }, { only_if: "a_prevenir.length > 0" })
        ])
      ],
      pages: [{
        name: "documents",
        title: "Documents",
        quick: { label: "Document", url: "/view/document_modifier" },
        content: [
          K.chips([["Tout", ""], ...CATS.slice(0, 10).map((c) => [c.charAt(0).toUpperCase() + c.slice(1), `categorie=${encodeURIComponent(c)}`, `fas ${ICONS[c]}`])]),
          K.view("documents_grille")
        ]
      }],
      nav: [{ page: "documents", label: "Documents", icon: "fas fa-folder-open", group: "Vie perso", order: 30, keywords: "papiers passeport carte identit\xE9 imp\xF4ts coffre" }],
      quick: [{ label: "Nouveau document", icon: "fas fa-folder-open", url: "/view/document_modifier", keywords: "papier fichier" }],
      explain: [
        ["Tu ranges un document", "Table \xAB documents \xBB avec un champ Fichier. Le fichier est stock\xE9 par Saltcorn (local ou S3)."],
        ["Il va expirer", "Le workflow \xAB documents_rappel \xBB (chaque matin : Table : chercher \u2192 Liste : filtrer \u2192 Table : ajouter \u2192 Notifier) te pr\xE9vient X jours avant (champ rappel_jours) et cr\xE9e une t\xE2che \xAB Renouveler \xBB si le module T\xE2ches est install\xE9."],
        ["La carte du document", "Vue \xAB document_carte \xBB : l'ic\xF4ne et l'alerte d'expiration sont des textes calcul\xE9s (formules) ; le lien de t\xE9l\xE9chargement vient du champ fichier."]
      ]
    };
  }
});

// src/modules/mails.js
var require_mails = __commonJS({
  "src/modules/mails.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var REGLES = `// \xC0 l'arriv\xE9e de chaque mail (rel\xE8ve) : on applique tes r\xE8gles (table mail_regles)
// puis on pr\xE9vient si le mail est important.
const Regles = Table.findOne({ name: "mail_regles" });
const Taches = Table.findOne({ name: "taches" });
const maj = {};
for (const r of await Regles.getRows({ actif: true })) {
  const motif = String(r.contient || "").toLowerCase();
  if (!motif) continue;
  const cible = r.champ === "sujet" ? row.sujet : r.champ === "domaine" ? String(row.de || "").split("@")[1] : row.de + " " + row.de_nom;
  if (!String(cible || "").toLowerCase().includes(motif)) continue;
  if (r.action === "important") maj.important = true;
  if (r.action === "\xE0 traiter") maj.statut = "\xE0 traiter";
  if (r.action === "archiver") maj.statut = "archiv\xE9";
  if (r.action === "cr\xE9er une t\xE2che" && Taches && !row.tache) {
    const t = await Taches.insertRow({ titre: "Mail : " + row.sujet, domaine: "Pro", statut: "\xE0 faire", priorite: "haute", recurrence: "aucune", source: "mail", notes: row.de_nom + " <" + row.de + ">\\n\\n" + String(row.extrait || "") });
    maj.tache = t; maj.statut = "\xE0 traiter";
  }
}
if (Object.keys(maj).length) await table.updateRow(maj, row.id, undefined, true);
if (maj.important && !row.lu)
  for (const u of await User.find({ role_id: 1 }))
    await Notification.create({ user_id: u.id, title: "Mail important de " + (row.de_nom || row.de), body: row.sujet, link: "/page/mails" });`;
    var statut = (label, s, icon, style = "btn-outline-secondary") => K.jsBtn(label, `// Change le statut du mail.
await table.updateRow({ statut: ${JSON.stringify(s)}, lu: true }, row.id, user);
return { reload_page: true };`, { icon, style });
    var EN_TACHE = `// Cr\xE9e une t\xE2che \xE0 partir du mail et relie les deux.
const Taches = Table.findOne({ name: "taches" });
if (!Taches) return { error: "Module T\xE2ches non install\xE9" };
const id = await Taches.insertRow({ titre: "Mail : " + row.sujet, domaine: "Pro", statut: "\xE0 faire", priorite: "normale", recurrence: "aucune", source: "mail", notes: row.de_nom + " <" + row.de + ">\\n\\n" + String(row.extrait || "") });
await table.updateRow({ tache: id, statut: "\xE0 traiter", lu: true }, row.id, user);
return { notify: "T\xE2che cr\xE9\xE9e", reload_page: true };`;
    var TILES = JSON.stringify([
      { label: "Non lus", icon: "fas fa-envelope", table: "mails", stat: "count", where: { lu: false, statut: { in: ["nouveau", "lu", "\xE0 traiter"] } }, href: "/page/mails?lu=false", tone: "info" },
      { label: "\xC0 traiter", icon: "fas fa-flag", table: "mails", stat: "count", where: { statut: "\xE0 traiter" }, href: "/page/mails?statut=%C3%A0%20traiter", tone: "warning" },
      { label: "Importants", icon: "fas fa-star", table: "mails", stat: "count", where: { important: true, statut: { in: ["nouveau", "lu", "\xE0 traiter"] } }, href: "/page/mails?important=true", tone: "danger" },
      { label: "Re\xE7us aujourd'hui", icon: "fas fa-inbox", table: "mails", stat: "count", period: { field: "date", range: "today" } }
    ], null, 1);
    module2.exports = {
      key: "mails",
      label: "Mails pro",
      icon: "fas fa-envelope",
      group: "Travail",
      description: "Ta bo\xEEte pro (OVH ou tout serveur IMAP) relev\xE9e toutes les 5 minutes, en lecture seule : non lus, importants, \xE0 traiter, r\xE8gles automatiques, mail \u2192 t\xE2che en un clic.",
      depends: ["taches"],
      setup: `<p>Tout se r\xE8gle dans <a href="/dysizz-me/reglages/mails">R\xE9gler Mails pro</a> : ton adresse, ton offre OVH, ton mot de passe (rang\xE9 chiffr\xE9), puis \xAB Tester \xBB. Rien n'est modifi\xE9 sur le serveur mail : ni lu, ni d\xE9plac\xE9, ni supprim\xE9.</p>`,
      settings: {
        intro: "Relie ta bo\xEEte mail. Elle est relev\xE9e toutes les 5 minutes, <b>en lecture seule</b> : rien n'est marqu\xE9 lu, d\xE9plac\xE9 ou supprim\xE9 chez OVH.",
        fields: [
          { name: "adresse", label: "Ton adresse e-mail", type: "email", required: true, placeholder: "prenom.nom@mondomaine.com" },
          { name: "offre", label: "O\xF9 est ta bo\xEEte ?", type: "select", default: "ssl0.ovh.net", options: [["ssl0.ovh.net", "OVH \xB7 MX Plan (mail inclus avec le nom de domaine)"], ["pro1.mail.ovh.net", "OVH \xB7 E-mail Pro"], ["imap.gmail.com", "Gmail (mot de passe d'application)"], ["outlook.office365.com", "Outlook / Microsoft 365"], ["autre", "Autre serveur (je le pr\xE9cise)"]], help: "Pas s\xFBr ? Dans ton espace client OVH, rubrique E-mails : \xAB MX Plan \xBB ou \xAB E-mail Pro \xBB." },
          { name: "serveur_autre", label: "Serveur IMAP (si \xAB Autre \xBB)", type: "text", placeholder: "imap.mondomaine.com" },
          { name: "mot_de_passe", label: "Mot de passe de la bo\xEEte", type: "password", secret: "ME_MAIL_MDP", required: true, help: "Rang\xE9 chiffr\xE9 dans le coffre, jamais r\xE9affich\xE9." },
          { name: "port", label: "Port", type: "number", default: 993, help: "993 dans presque tous les cas." },
          { name: "dossier", label: "Dossier relev\xE9", type: "text", default: "INBOX", help: "INBOX = bo\xEEte de r\xE9ception." }
        ],
        apply: [
          { trigger: "mails_releve", step: "reglages", json: "valeurs", map: { utilisateur: "adresse", serveur: (v) => v.offre === "autre" ? v.serveur_autre : v.offre, dossier: "dossier", variable_mot_de_passe: () => "ME_MAIL_MDP" } },
          { trigger: "mails_releve", step: "relever", set: { port: (v) => Number(v.port) || 993 } }
        ],
        test: {
          action: "dzf_imap_lire",
          config: (v) => ({ serveur: v.offre === "autre" ? v.serveur_autre : v.offre, port: Number(v.port) || 993, utilisateur: v.adresse, variable_mot_de_passe: "ME_MAIL_MDP", dossier: v.dossier || "INBOX", jours: 3, max: 3 }),
          ok: (r) => `Connexion r\xE9ussie. ${(r || []).length} message(s) sur les 3 derniers jours${r && r[0] ? `, par exemple \xAB ${r[0].sujet} \xBB` : ""}.`,
          explain: (m) => /auth|credential|login|password|LOGIN/i.test(m) ? "Le serveur refuse l'adresse ou le mot de passe. V\xE9rifie-les (et l'offre choisie)." : /ENOTFOUND|getaddrinfo/i.test(m) ? "Serveur introuvable : v\xE9rifie l'offre ou le nom du serveur." : /timeout|ETIMEDOUT|délai/i.test(m) ? "Le serveur ne r\xE9pond pas (port bloqu\xE9 ? mauvais serveur ?)." : ""
        },
        after: "La premi\xE8re rel\xE8ve se fait dans les 5 minutes."
      },
      tables: [
        {
          name: "mails",
          description: "Copie locale de tes mails (lecture seule)",
          fields: [
            K.int("uid", "UID IMAP"),
            K.s("dossier", "Dossier"),
            K.s("message_id", "Message-ID"),
            K.s("de", "Adresse de l'exp\xE9diteur"),
            K.s("de_nom", "Exp\xE9diteur"),
            K.s("a", "Destinataires"),
            K.s("sujet", "Sujet"),
            K.date("date", "Date"),
            K.s("extrait", "Extrait"),
            K.s("corps", "Texte"),
            K.bool("lu", "Lu"),
            K.bool("suivi", "Suivi (drapeau)"),
            K.bool("important", "Important"),
            K.int("pieces_jointes", "Pi\xE8ces jointes", { default: 0 }),
            K.opts("statut", "Statut", ["nouveau", "lu", "\xE0 traiter", "en attente", "trait\xE9", "archiv\xE9"]),
            K.key("tache", "T\xE2che li\xE9e", "taches", "titre"),
            K.s("note", "Note")
          ]
        },
        {
          name: "mail_regles",
          description: "R\xE8gles appliqu\xE9es \xE0 l'arriv\xE9e d'un mail",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.opts("champ", "Si", ["exp\xE9diteur", "sujet", "domaine"]),
            K.s("contient", "Contient", { required: true }),
            K.opts("action", "Alors", ["important", "\xE0 traiter", "archiver", "cr\xE9er une t\xE2che"]),
            K.bool("actif", "Active", { default: true })
          ]
        }
      ],
      views: [
        K.show("mail_lecture", "mails", K.box(
          "dzv-mail",
          K.box(
            "dzv-mail-head",
            K.box("dzv-mail-title", K.field("sujet", "as_text")),
            K.box(
              "dzv-mail-top",
              K.formula(`'<span class="dzv-mail-av">' + String(de_nom || de || '?').trim().charAt(0).replace(/[<>&]/g, '?') + '</span>'`, { html: true, block: false }),
              K.box("dzv-mail-who", K.box("dzv-mail-n", K.field("de_nom", "as_text")), K.box("dzv-mail-a", K.field("de", "as_text"))),
              K.box("dzv-mail-when", K.dateFr("date", { time: true, year: true }))
            ),
            K.box(
              "dzv-mail-actions",
              statut("\xC0 traiter", "\xE0 traiter", "fas fa-flag", "btn-outline-warning"),
              statut("En attente", "en attente", "far fa-clock"),
              statut("Trait\xE9", "trait\xE9", "fas fa-check", "btn-outline-success"),
              statut("Archiver", "archiv\xE9", "fas fa-archive"),
              K.jsBtn("En faire une t\xE2che", EN_TACHE, { icon: "fas fa-check-circle", style: "btn-primary" })
            )
          ),
          K.formula(`pieces_jointes ? '<span class="dzv-meta"><i class="fas fa-paperclip"></i>' + pieces_jointes + ' pi\xE8ce(s) jointe(s) : \xE0 ouvrir dans ton webmail</span>' : ''`, { html: true }),
          K.field("corps", "dz_mail", { block: true })
        ), { title: "Mail", width: 900 }),
        K.list("mails_boite", "mails", [
          ["", K.formula(`(important ? '<i class="fas fa-star" style="color:var(--dzv-warning)"></i>' : '') + (pieces_jointes ? ' <i class="fas fa-paperclip dzv-muted"></i>' : '')`, { html: true, block: false })],
          ["De", K.box("dzv-mail-from", K.field("de_nom", "as_text"))],
          ["Sujet", K.box("", K.box("dzv-mail-subj", K.field("sujet", "as_text")), K.box("dzv-mail-ext", K.field("extrait", "as_text")))],
          ["Statut", K.field("statut", "as_text", { cls: "dzv-pill" })],
          ["Re\xE7u", K.dateFr("date", { time: true })]
        ], {
          include: 'statut != "archiv\xE9" && statut != "trait\xE9"',
          order: "date",
          desc: true,
          rowClick: "`/view/mail_lecture?id=${id}`",
          limit: 40,
          state: { _row_color_formula: "" },
          description: "Bo\xEEte de r\xE9ception (hors trait\xE9s et archiv\xE9s)"
        }),
        K.list("mails_tous", "mails", [
          ["De", K.field("de_nom", "as_text")],
          ["Sujet", K.field("sujet", "as_text")],
          ["Statut", K.field("statut", "as_text", { cls: "dzv-pill" })],
          ["Re\xE7u", K.dateFr("date", { time: true })]
        ], { include: 'statut == "trait\xE9" || statut == "archiv\xE9"', order: "date", desc: true, rowClick: "`/view/mail_lecture?id=${id}`", limit: 20, description: "Mails trait\xE9s et archiv\xE9s" }),
        K.edit("regle_modifier", "mail_regles", [["nom", "Nom"], ["champ", "Si"], ["contient", "Contient"], ["action", "Alors"], ["actif", "Active"]], { delete: true, title: "R\xE8gle", width: 560 }),
        K.list(
          "regles_liste",
          "mail_regles",
          [["R\xE8gle", K.field("nom", "as_text")], ["Si", K.field("champ", "as_text")], ["Contient", K.field("contient", "as_text")], ["Alors", K.field("action", "as_text", { cls: "dzv-pill" })], ["Active", K.field("actif", "show")]],
          { order: "nom", desc: false, rowClick: "`/view/regle_modifier?id=${id}`" }
        ),
        K.custom("mails_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 4 }, "Compteurs de la bo\xEEte")
      ],
      triggers: [
        K.wf("mails_releve", "Often", null, "Rel\xE8ve la bo\xEEte mail toutes les ~5 min (lecture seule, sans doublon, un seul passage \xE0 la fois)", [
          K.st("reglages", "dzf_definir", { valeurs: K.J({ utilisateur: "", serveur: "ssl0.ovh.net", variable_mot_de_passe: "DZ_MAIL_PASSWORD", dossier: "INBOX" }), fusionner: true }, { next_step: 'utilisateur ? "verrou" : ""' }),
          K.st("verrou", "dzf_verrou", { action: "prendre", nom: "releve-mails", duree: 600, sortie: "verrou" }, { next_step: 'verrou ? "dernier" : ""' }),
          K.st("dernier", "dzf_table_compter", { table: "mails", stat: "max", champ: "uid", filtre: K.J({ dossier: "{{dossier}}" }), sortie: "dernier_uid" }),
          K.st("relever", "dzf_imap_lire", { serveur: "{{serveur}}", port: 993, utilisateur: "{{utilisateur}}", variable_mot_de_passe: "{{variable_mot_de_passe}}", dossier: "{{dossier}}", depuis_uid: "{{dernier_uid}}", jours: 14, max: 100, si_erreur: "continuer", delai_max: 180, sortie: "nouveaux" }),
          K.st("preparer", "dzf_liste_transformer", { liste: "{{nouveaux}}", modele: '{"uid":"{{item.uid}}","dossier":"{{item.dossier}}","message_id":"{{item.message_id}}","de":"{{item.de}}","de_nom":"{{item.de_nom}}","a":"{{item.a}}","sujet":"{{item.sujet}}","date":"{{item.date}}","extrait":"{{item.extrait}}","corps":"{{item.contenu}}","lu":"{{item.lu}}","suivi":"{{item.suivi}}","pieces_jointes":"{{item.pieces_jointes}}","important":false,"statut":"nouveau"}', sortie: "lignes" }),
          K.st("ranger", "dzf_table_upsert", { table: "mails", liste: "{{lignes}}", cle: "message_id", sortie: "bilan" }),
          K.st("liberer", "dzf_verrou", { action: "lib\xE9rer", nom: "releve-mails", sortie: "verrou_libre" })
        ], { reglages: ["valeurs"] }),
        K.wf("mails_regles", "Insert", "mails", "Applique tes r\xE8gles \xE0 chaque nouveau mail et pr\xE9vient si important", [
          K.st("regles", "dzf_code", { code: REGLES, sortie: "regles" })
        ])
      ],
      seeds: { mail_regles: [{ nom: "Mails de la direction", champ: "domaine", contient: "ambs-agency.com", action: "important", actif: false }] },
      pages: [{
        name: "mails",
        title: "Mails pro",
        content: [
          K.view("mails_chiffres"),
          K.chips([["Bo\xEEte", ""], ["Non lus", "lu=false", "fas fa-envelope"], ["\xC0 traiter", "statut=\xE0 traiter", "fas fa-flag"], ["En attente", "statut=en attente", "far fa-clock"], ["Importants", "important=true", "fas fa-star"]]),
          K.panel("Bo\xEEte de r\xE9ception", "fas fa-inbox", K.view("mails_boite"), { cls: "dzv-mails" }),
          K.grid(
            "dzv-grid-2",
            K.panel("R\xE8gles automatiques", "fas fa-magic", K.view("regles_liste"), { actions: K.modalBtn("R\xE8gle", "/view/regle_modifier") }),
            K.panel("Trait\xE9s et archiv\xE9s", "fas fa-archive", K.view("mails_tous", { state: "fixed", fixed: {}, id: "mtraites" }))
          )
        ]
      }],
      nav: [{ page: "mails", label: "Mails", icon: "fas fa-envelope", group: "Travail", order: 10, mobile: true, keywords: "email bo\xEEte r\xE9ception ovh" }],
      quick: [{ label: "R\xE8gle de mail", icon: "fas fa-magic", url: "/view/regle_modifier", keywords: "filtre mail" }],
      explain: [
        ["Toutes les 5 minutes", "Le workflow \xAB mails_releve \xBB : D\xE9finir (tes r\xE9glages) \u2192 Verrou \u2192 Table : compter (dernier UID) \u2192 Mail : lire (IMAP, lecture seule) \u2192 Liste : transformer \u2192 Table : ajouter ou mettre \xE0 jour \u2192 Verrou lib\xE9r\xE9."],
        ["Un mail arrive", "Le workflow \xAB mails_regles \xBB (bloc Code) (\xE0 chaque ajout) applique tes r\xE8gles : important, \xE0 traiter, archiver, ou cr\xE9er une t\xE2che. Si c'est important : notification."],
        ["Tu lis un mail", "Clic sur une ligne \u2192 vue \xAB mail_lecture \xBB en fen\xEAtre, avec les boutons de statut et \xAB En faire une t\xE2che \xBB."]
      ]
    };
  }
});

// src/modules/emploi.js
var require_emploi = __commonJS({
  "src/modules/emploi.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var slug = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    var setStatut = (label, st, icon, style = "btn-link") => K.jsBtn(label, `// Change le statut de l'offre sans recharger la page.
await table.updateRow({ statut: ${JSON.stringify(st)} }, row.id, user);
return { eval_js: "var c=document.getElementById('off-" + row.id + "');if(c)c.setAttribute('data-statut','${slug(st)}')" };`, { icon, style });
    var POSTULER = `// Cr\xE9e une candidature \xE0 partir de l'offre (tu la retrouves dans le tableau des candidatures).
const C = Table.findOne({ name: "candidatures" });
if (!(await C.getRow({ offre: row.id })))
  await C.insertRow({ entreprise: row.entreprise || "?", poste: row.titre, offre: row.id, lien: row.url, statut: "\xE0 envoyer" });
await table.updateRow({ statut: "postul\xE9" }, row.id, user);
return { notify: "Ajout\xE9e \xE0 tes candidatures", reload_page: true };`;
    var CHERCHER = `// Pour chaque recherche active : le bloc \xAB Emploi : chercher dans plusieurs sources \xBB,
// puis rangement sans doublon. Chaque source en panne est not\xE9e dans l'\xE9tat de la recherche.
const R = Table.findOne({ name: "emploi_recherches" });
let nouvelles = 0;
for (const r of await R.getRows({ actif: true })) {
  const o = await Actions.dzf_emplois({ sources: r.sources || "france_travail,adzuna,jooble,arbeitnow,remotive,jobicy,himalayas,remoteok", mots_cles: r.mots_cles || "", departement: r.departement || "", lieu: r.lieu || "", commune: r.commune || "", rayon_km: r.rayon_km || "", contrat: r.contrat || "", alternance: !!r.alternance, teletravail: !!r.teletravail, depuis_jours: r.depuis_jours || 7, flux_rss: r.flux_rss || "", sortie: "offres", si_erreur: "continuer" });
  const offres = (o.offres || []).map((x) => ({ ...x, recherche: r.id, statut: "nouvelle" }));
  const u = await Actions.dzf_table_upsert({ table: "offres_emploi", liste: offres, cle: "ref", sortie: "b" });
  nouvelles += (u.b && u.b.ajoutes) || 0;
  const bilan = (o.offres_sources || []).filter((x) => !x.ignoree).map((x) => x.source + (x.ok ? " " + x.offres : " \u2717")).join(" \xB7 ");
  await R.updateRow({ derniere_synchro: new Date(), etat: o.offres_erreur ? String(o.offres_erreur).slice(0, 200) : (bilan || "aucune source").slice(0, 300) }, r.id, undefined, true);
}
return nouvelles;`;
    module2.exports = {
      key: "emploi",
      label: "Emploi",
      icon: "fas fa-user-tie",
      group: "Travail",
      description: "Offres d'emploi en France et en t\xE9l\xE9travail, cherch\xE9es dans plusieurs sources (France Travail, Adzuna, Jooble, Arbeitnow, Remotive, Jobicy, Himalayas, RemoteOK, flux RSS) selon tes recherches enregistr\xE9es, tri rapide (int\xE9ressante / \xE9carter / postuler) et suivi des candidatures avec relance automatique.",
      depends: [],
      setup: `<p>Sans rien r\xE9gler, les sources sans cl\xE9 marchent d\xE9j\xE0 (Arbeitnow, Remotive, Jobicy, Himalayas, RemoteOK). Pour plus d'offres fran\xE7aises, ajoute des cl\xE9s gratuites dans <a href="/dysizz-me/reglages/emploi">R\xE9gler Emploi</a> : France Travail, Adzuna, Jooble.</p>`,
      settings: {
        intro: `Les sources <b>sans cl\xE9</b> marchent d\xE9j\xE0 : Arbeitnow (Europe), Remotive, Jobicy, Himalayas, RemoteOK (t\xE9l\xE9travail). Pour beaucoup plus d'offres en France, ajoute une ou plusieurs <b>cl\xE9s gratuites</b> :<ul><li><a href="https://francetravail.io" target="_blank" rel="noopener">francetravail.io</a> \u2192 cr\xE9er une application, cocher \xAB Offres d'emploi v2 \xBB.</li><li><a href="https://developer.adzuna.com" target="_blank" rel="noopener">developer.adzuna.com</a> \u2192 s'inscrire, copier App ID et App Key.</li><li><a href="https://fr.jooble.org/api/about" target="_blank" rel="noopener">jooble.org/api</a> \u2192 demander une cl\xE9.</li></ul>`,
        fields: [
          { name: "ft_id", label: "France Travail \xB7 identifiant client", type: "password", secret: "FT_CLIENT_ID" },
          { name: "ft_secret", label: "France Travail \xB7 cl\xE9 secr\xE8te", type: "password", secret: "FT_CLIENT_SECRET" },
          { name: "adzuna_id", label: "Adzuna \xB7 App ID", type: "password", secret: "ADZUNA_APP_ID" },
          { name: "adzuna_key", label: "Adzuna \xB7 App Key", type: "password", secret: "ADZUNA_APP_KEY" },
          { name: "jooble_key", label: "Jooble \xB7 cl\xE9", type: "password", secret: "JOOBLE_KEY" }
        ],
        apply: [],
        test: {
          action: "dzf_emplois",
          config: () => ({ sources: "france_travail,adzuna,jooble,arbeitnow,remotive,jobicy,himalayas,remoteok", mots_cles: "data,devops", depuis_jours: 7 }),
          okFull: true,
          ok: (r) => {
            const s = r && r.r_sources || [];
            return `${(r && r.r || []).length} offre(s) cette semaine. ${s.map((x) => `${x.source} : ${x.ok ? x.offres : x.ignoree ? "pas de cl\xE9" : "erreur (" + x.erreur + ")"}`).join(" \xB7 ")}`;
          }
        },
        after: "R\xE8gle maintenant tes recherches dans la page Emploi (mots-cl\xE9s, lieu, sources)."
      },
      tables: [
        {
          name: "emploi_recherches",
          description: "Tes recherches enregistr\xE9es",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.s("mots_cles", "Mots-cl\xE9s", { description: "S\xE9par\xE9s par des virgules, ex. devops,kubernetes" }),
            K.s("departement", "D\xE9partement(s)", { description: "Ex. 75 ou 75,92,93 \u2014 vide = toute la France" }),
            K.s("commune", "Code commune INSEE"),
            K.int("rayon_km", "Rayon (km) autour de la commune"),
            K.s("contrat", "Contrat", { description: "CDI, CDD, MIS (int\xE9rim)\u2026 vide = tous" }),
            K.s("sources", "Sources", { description: "france_travail, adzuna, jooble, arbeitnow, remotive, jobicy, himalayas, remoteok, rss \u2014 vide = toutes", default: "france_travail,adzuna,jooble,arbeitnow,remotive,jobicy,himalayas,remoteok" }),
            K.s("lieu", "Ville ou r\xE9gion (Adzuna, Jooble)"),
            K.s("flux_rss", "Flux RSS d'offres (source rss)"),
            K.bool("alternance", "Alternance seulement"),
            K.bool("teletravail", "T\xE9l\xE9travail"),
            K.int("depuis_jours", "Publi\xE9es depuis (jours)", { default: 7 }),
            K.bool("actif", "Active", { default: true }),
            K.date("derniere_synchro", "Derni\xE8re recherche"),
            K.s("etat", "\xC9tat")
          ]
        },
        {
          name: "offres_emploi",
          description: "Offres trouv\xE9es",
          fields: [
            K.s("ref", "R\xE9f\xE9rence", { unique: true }),
            K.s("titre", "Poste"),
            K.s("entreprise", "Entreprise"),
            K.s("lieu", "Lieu"),
            K.s("contrat", "Contrat"),
            K.s("salaire", "Salaire"),
            K.s("experience", "Exp\xE9rience"),
            K.date("date", "Publi\xE9e le"),
            K.s("url", "Lien"),
            K.s("description", "Description"),
            K.key("recherche", "Recherche", "emploi_recherches", "nom"),
            K.opts("statut", "Statut", ["nouvelle", "int\xE9ressante", "postul\xE9", "\xE9cart\xE9e"]),
            K.s("source", "Source"),
            K.s("logo", "Logo"),
            K.bool("teletravail", "T\xE9l\xE9travail"),
            K.s("note", "Note")
          ]
        },
        {
          name: "candidatures",
          description: "Suivi de tes candidatures",
          fields: [
            K.s("entreprise", "Entreprise", { required: true }),
            K.s("poste", "Poste", { required: true }),
            K.key("offre", "Offre", "offres_emploi", "titre"),
            K.s("lien", "Lien"),
            K.opts("statut", "Statut", ["\xE0 envoyer", "envoy\xE9e", "relance", "entretien", "refus", "offre"]),
            K.date("envoyee_le", "Envoy\xE9e le"),
            K.date("relance_le", "Relancer le"),
            K.s("contact", "Contact"),
            K.s("notes", "Notes")
          ]
        }
      ],
      views: [
        K.show("offre_carte", "offres_emploi", K.box(
          "`dzv-tile dzv-offre dzv-o-${String(statut || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/\\s+/g, '-')}`",
          K.O({ clsFormula: true, id: "`off-${id}`" }),
          K.box(
            "dzv-offre-top",
            K.formula(`logo && /^https?:/.test(logo) ? '<img class="dzv-offre-logo" loading="lazy" referrerpolicy="no-referrer" alt="" src="' + String(logo).replace(/"/g, '%22') + '">' : '<span class="dzv-offre-logo dzv-noimg">' + String(entreprise || '?').trim().charAt(0).replace(/[<>&]/g, '?') + '</span>'`, { html: true, block: false }),
            K.meta(K.field("entreprise", "as_text"), K.field("lieu", "as_text"), K.dateFr("date"))
          ),
          K.box("dzv-tile-title", K.O({ url: "`javascript:ajax_modal('/view/offre_lecture?id=${id}')`", urlFormula: true }), K.field("titre", "as_text")),
          K.meta(K.field("source", "as_text"), K.field("contrat", "as_text"), K.field("salaire", "as_text")),
          K.box(
            "dzv-tile-actions",
            setStatut("Int\xE9ressante", "int\xE9ressante", "fas fa-heart"),
            setStatut("\xC9carter", "\xE9cart\xE9e", "fas fa-times"),
            K.jsBtn("Postuler", POSTULER, { icon: "fas fa-paper-plane", style: "btn-outline-primary" }),
            K.link("'Voir'", "url", { cls: "btn btn-sm btn-link" })
          )
        ), { description: "Carte d'une offre" }),
        K.show("offre_lecture", "offres_emploi", K.box(
          "dzv-mail",
          K.box(
            "dzv-mail-head",
            K.field("titre", "as_text", { cls: "dzv-mail-title" }),
            K.meta(K.field("entreprise", "as_text"), K.field("lieu", "as_text"), K.field("contrat", "as_text"), K.field("salaire", "as_text"), K.field("experience", "as_text")),
            K.box("dzv-tile-actions", K.jsBtn("Postuler", POSTULER, { icon: "fas fa-paper-plane", style: "btn-primary" }), K.link("'Ouvrir l\\'offre'", "url", { cls: "btn btn-sm btn-outline-secondary" }))
          ),
          K.field("description", "as_text", { cls: "dzv-mail-body", block: true })
        ), { title: "Offre", width: 860 }),
        K.feed("offres_fil", "offres_emploi", "offre_carte", { include: 'statut != "\xE9cart\xE9e" && statut != "postul\xE9"', order: "date", desc: true, limit: 30, md: 2, lg: 3 }),
        K.edit("recherche_modifier", "emploi_recherches", [["nom", "Nom"], ["mots_cles", "Mots-cl\xE9s"], ["sources", "Sources"], ["departement", "D\xE9partement(s) (France Travail)"], ["lieu", "Ville ou r\xE9gion (Adzuna, Jooble)"], ["flux_rss", "Flux RSS d'offres"], ["contrat", "Contrat (CDI, CDD\u2026)"], ["commune", "Code commune INSEE"], ["rayon_km", "Rayon (km)"], ["depuis_jours", "Publi\xE9es depuis (jours)"], ["alternance", "Alternance seulement"], ["teletravail", "T\xE9l\xE9travail"], ["actif", "Active"]], { delete: true, title: "Recherche", width: 620 }),
        K.list(
          "recherches_liste",
          "emploi_recherches",
          [["Recherche", K.field("nom", "as_text")], ["Mots-cl\xE9s", K.field("mots_cles", "as_text")], ["Lieu", K.field("departement", "as_text")], ["Alternance", K.field("alternance", "show")], ["\xC9tat", K.field("etat", "as_text", { cls: "dzv-pill" })], ["", K.jsBtn("Chercher", '// Lance tout de suite le workflow emplois_releve.\nawait Trigger.findOne({ name: "emplois_releve" }).runWithoutRow({ user });\nreturn { notify: "Recherche lanc\xE9e", reload_page: true };', { icon: "fas fa-search", style: "btn-outline-secondary" })]],
          { order: "nom", desc: false, rowClick: "`/view/recherche_modifier?id=${id}`" }
        ),
        K.edit("candidature_modifier", "candidatures", [["entreprise", "Entreprise"], ["poste", "Poste"], ["statut", "Statut"], ["lien", "Lien de l'offre"], ["envoyee_le", "Envoy\xE9e le", "editDay"], ["relance_le", "Relancer le", "editDay"], ["contact", "Contact"], ["notes", "Notes", "textarea"]], { delete: true, title: "Candidature", width: 620 }),
        K.custom("candidatures_tableau", "DZ Tableau", "candidatures", {
          champ_colonnes: "statut",
          colonnes: "\xE0 envoyer,envoy\xE9e,relance,entretien,refus,offre",
          champ_titre: "poste",
          champs_infos: "entreprise,relance_le",
          tri: "relance_le",
          colonne_finie: "refus",
          max_finies: 8,
          vue_fiche: "candidature_modifier",
          vue_creation: "candidature_modifier",
          filtre: ""
        }, "Suivi des candidatures par statut")
      ],
      triggers: [
        K.wf("emplois_releve", "Hourly", null, "Cherche les nouvelles offres pour tes recherches (toutes les heures)", [
          K.st("chercher", "dzf_code", { code: CHERCHER, sortie: "nouvelles", delai_max: 300 }),
          K.st("ancien", "dzf_dates", { operation: "ajouter des jours", jours: -45, sortie: "limite" }),
          K.st("menage", "dzf_table_supprimer", { table: "offres_emploi", filtre: K.J({ statut: { in: ["nouvelle", "\xE9cart\xE9e"] }, date: { lt: "{{limite}}" } }), sortie: "supprimees" })
        ]),
        K.wf("candidatures_relance_date", "Update", "candidatures", "Date d'envoi et date de relance (+10 jours) automatiques", [
          K.st("maintenant", "dzf_dates", { operation: "maintenant", sortie: "maintenant" }),
          K.st("envoi", "dzf_table_modifier", { table: "candidatures", id: "{{id}}", valeurs: K.J({ envoyee_le: "{{maintenant}}" }), sans_declencheurs: true, sortie: "e" }, { only_if: 'statut == "envoy\xE9e" && !envoyee_le' }),
          K.st("date_relance", "dzf_dates", { operation: "ajouter des jours", date: "{{envoyee_le}}", jours: 10, sortie: "relance" }),
          K.st("relance", "dzf_table_modifier", { table: "candidatures", id: "{{id}}", valeurs: K.J({ relance_le: "{{relance}}" }), sans_declencheurs: true, sortie: "r" }, { only_if: 'statut == "envoy\xE9e" && !relance_le' })
        ]),
        K.wf("candidatures_rappel", "Daily", null, "Notification des candidatures \xE0 relancer", [
          K.st("demain", "dzf_dates", { operation: "ajouter des jours", jours: 1, format: "jour (AAAA-MM-JJ)", sortie: "demain" }),
          K.st("a_relancer", "dzf_table_chercher", { table: "candidatures", filtre: K.J({ statut: { in: ["envoy\xE9e", "relance"] }, relance_le: { lt: "{{demain}}" } }), limite: 50, sortie: "a_relancer" }),
          K.st("texte", "dzf_texte", { modele: "{{lignes}}", liste: "{{a_relancer}}", modele_ligne: "- {{item.entreprise}} \u2014 {{item.poste}}", sortie: "texte" }),
          K.st("notifier", "dzf_notifier", { qui: "administrateurs", titre: "Candidature(s) \xE0 relancer", texte: "{{texte}}", lien: "/page/emploi", sortie: "notifies" }, { only_if: "a_relancer.length > 0" })
        ])
      ],
      seeds: {
        emploi_recherches: [
          { nom: "Data engineer", mots_cles: "data engineer", depuis_jours: 7, actif: true, alternance: false, teletravail: false },
          { nom: "DevOps / MLOps (alternance)", mots_cles: "devops,mlops", depuis_jours: 14, actif: true, alternance: true, teletravail: false },
          { nom: "Cybers\xE9curit\xE9", mots_cles: "cybers\xE9curit\xE9", depuis_jours: 7, actif: false, alternance: false, teletravail: false }
        ]
      },
      pages: [{
        name: "emploi",
        title: "Emploi",
        quick: { label: "Candidature", url: "/view/candidature_modifier" },
        content: [
          K.panel("Candidatures", "fas fa-paper-plane", K.view("candidatures_tableau"), { actions: K.modalBtn("Candidature", "/view/candidature_modifier") }),
          K.chips([["Nouvelles et int\xE9ressantes", ""], ["Int\xE9ressantes", "statut=int\xE9ressante", "fas fa-heart"]]),
          K.view("offres_fil"),
          K.panel("Mes recherches", "fas fa-search", K.view("recherches_liste"), { actions: K.modalBtn("Recherche", "/view/recherche_modifier") })
        ]
      }],
      nav: [{ page: "emploi", label: "Emploi", icon: "fas fa-user-tie", group: "Travail", order: 20, keywords: "offres candidatures job alternance" }],
      quick: [{ label: "Nouvelle candidature", icon: "fas fa-paper-plane", url: "/view/candidature_modifier", keywords: "postuler job" }],
      explain: [
        ["Toutes les heures", "Le workflow \xAB emplois_releve \xBB (blocs V\xE9rifier \u2192 Code qui appelle France Travail et Table : ajouter ou mettre \xE0 jour \u2192 Dates \u2192 Table : supprimer) interroge France Travail pour chaque recherche active et ajoute les nouvelles offres."],
        ["Tu tries", "Boutons de la carte : Int\xE9ressante, \xC9carter (dispara\xEEt), Postuler (cr\xE9e une candidature \xAB \xE0 envoyer \xBB)."],
        ["Tu envoies", "Passe la candidature \xE0 \xAB envoy\xE9e \xBB : le workflow \xAB candidatures_relance_date \xBB (Dates \u2192 Table : modifier) note la date et pr\xE9voit une relance \xE0 +10 jours."],
        ["Le jour de la relance", "Le workflow \xAB candidatures_rappel \xBB (Dates \u2192 Table : chercher \u2192 Texte \u2192 Notifier) t'envoie une notification le matin."]
      ]
    };
  }
});

// src/modules/veille.js
var require_veille = __commonJS({
  "src/modules/veille.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var THEMES = ["dev", "cyber", "ia", "devops", "mlops", "cloud", "r\xE9seau", "syst\xE8mes", "data", "tech fr", "actus france", "actus s\xE9n\xE9gal"];
    var toggle = (field, label, icon, cls) => K.jsBtn(label, `// Bascule \xAB ${field} \xBB et met \xE0 jour la carte sans recharger la page.
await table.updateRow({ ${field}: !row.${field} }, row.id, user);
return { eval_js: "var c=document.getElementById('art-" + row.id + "');if(c)c.classList.toggle('${cls}'," + !row.${field} + ")" };`, { icon, style: "btn-link", cls: `dzv-tg dzv-tg-${field}` });
    var SRC = (s) => ({ ...s, actif: true, etat: "", erreur: "" });
    var site = (nom, url, theme) => SRC({ nom, type: "site", url, theme });
    var THEME_ICON = { dev: "fa-code", cyber: "fa-shield-alt", ia: "fa-brain", devops: "fa-infinity", mlops: "fa-project-diagram", cloud: "fa-cloud", "r\xE9seau": "fa-network-wired", "syst\xE8mes": "fa-server", data: "fa-database", "tech fr": "fa-laptop-code", "actus france": "fa-newspaper", "actus s\xE9n\xE9gal": "fa-globe-africa" };
    var IMG_FML = (cls) => `(image && /^https?:/.test(image)) ? '<div class="${cls}"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="' + String(image).replace(/"/g, '%22').replace(/</g, '%3C') + '" onerror="this.parentNode.classList.add(\\'dzv-noimg\\');this.remove()"></div>' : '<div class="${cls} dzv-noimg"><i class="fas ' + (${JSON.stringify(THEME_ICON)}[theme] || 'fa-rss') + '"></i></div>'`;
    var card = (extraTop = []) => K.box(
      "`dzv-article${lu ? ' dzv-read' : ''}${favori ? ' dzv-fav' : ''}${plus_tard ? ' dzv-later' : ''}`",
      K.O({ clsFormula: true, id: "`art-${id}`" }),
      ...extraTop,
      K.box(
        "dzv-article-in",
        K.box("dzv-article-src", ...K.spans(K.join("source.nom", "as_text"), K.dateFr("date"), K.field("theme", "as_text"))),
        K.link("titre", "url", { cls: "dzv-article-title", block: true }),
        K.field("resume", "as_text", { cls: "dzv-article-sum", block: true })
      ),
      K.box("dzv-tile-actions", toggle("lu", "Lu", "fas fa-check", "dzv-read"), toggle("favori", "Favori", "fas fa-star", "dzv-fav"), toggle("plus_tard", "Plus tard", "far fa-clock", "dzv-later"))
    );
    var ETAT_SOURCES = `// Note l'\xE9tat de chaque source lue (ok / erreur) et garde les identifiants YouTube trouv\xE9s.
const S = Table.findOne({ name: "veille_sources" });
const erreurs = new Map((row.articles_erreurs || []).map((e) => [String(e.source), e.erreur]));
for (const c of row.articles_chaines || []) { if (!c.source) continue; if (c.youtube_id) await S.updateRow({ youtube_id: c.youtube_id }, c.source, undefined, true); else if (c.flux) await S.updateRow({ url: c.flux }, c.source, undefined, true); }
for (const s of row.sources || []) {
  const err = erreurs.get(String(s.id));
  await S.updateRow({ derniere_synchro: new Date(), etat: err ? "erreur" : "ok", erreur: err ? String(err).slice(0, 300) : "" }, s.id, undefined, true);
}
return erreurs.size;`;
    var RELIRE = `// Lance tout de suite le workflow veille_releve.
await Trigger.findOne({ name: "veille_releve" }).runWithoutRow({ user });
return { notify: "Relecture lanc\xE9e", reload_page: true };`;
    module2.exports = {
      key: "veille",
      label: "Veille tech",
      icon: "fas fa-satellite-dish",
      group: "Veille",
      description: "Les nouveaut\xE9s dev, cyber (dont alertes CERT-FR), IA, DevOps, MLOps, cloud, r\xE9seau et syst\xE8mes, lues toutes les heures depuis des flux RSS que tu choisis. Lu, favori, \xE0 lire plus tard.",
      depends: [],
      tables: [
        {
          name: "veille_sources",
          description: "Les sites et cha\xEEnes suivis",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.opts("type", "Type", ["site", "youtube"]),
            K.s("url", "Adresse du flux RSS / Atom", { description: "Pour YouTube : laisse vide et remplis la cha\xEEne" }),
            K.s("chaine", "Cha\xEEne YouTube", { description: "@nom de la cha\xEEne ou lien vers la cha\xEEne" }),
            K.s("youtube_id", "Identifiant de cha\xEEne (trouv\xE9 automatiquement)"),
            K.opts("theme", "Th\xE8me", THEMES),
            K.bool("actif", "Suivie", { default: true }),
            K.date("derniere_synchro", "Derni\xE8re lecture"),
            K.s("etat", "\xC9tat"),
            K.s("erreur", "Erreur"),
            K.int("nb_derniers", "\xC9l\xE9ments dans le flux")
          ]
        },
        {
          name: "veille_articles",
          description: "Articles et vid\xE9os r\xE9cup\xE9r\xE9s",
          fields: [
            K.key("source", "Source", "veille_sources", "nom"),
            K.s("titre", "Titre"),
            K.s("url", "Lien", { unique: true }),
            K.date("date", "Publi\xE9 le"),
            K.s("resume", "R\xE9sum\xE9"),
            K.s("image", "Image"),
            K.s("auteur", "Auteur"),
            K.opts("theme", "Th\xE8me", THEMES),
            K.opts("type", "Type", ["article", "vid\xE9o"]),
            K.s("video_id", "Vid\xE9o YouTube"),
            K.bool("lu", "Lu"),
            K.bool("favori", "Favori"),
            K.bool("plus_tard", "Plus tard"),
            K.date("ajoute_le", "Ajout\xE9 le")
          ]
        }
      ],
      views: [
        K.show("article_carte", "veille_articles", card([K.formula(IMG_FML("dzv-article-img"), { html: true })]), { description: "Carte d'un article" }),
        K.feed("veille_fil", "veille_articles", "article_carte", { include: 'type == "article" && theme != "actus france" && theme != "actus s\xE9n\xE9gal"', order: "date", desc: true, limit: 30, md: 2, lg: 3 }),
        K.edit("source_modifier", "veille_sources", [["nom", "Nom"], ["type", "Type"], ["theme", "Th\xE8me"], ["url", "Adresse du flux (site)"], ["chaine", "Cha\xEEne YouTube (@nom)"], ["actif", "Suivie"]], { delete: true, title: "Source", width: 620 }),
        K.list("sources_liste", "veille_sources", [
          ["Source", K.field("nom", "as_text")],
          ["Type", K.field("type", "as_text")],
          ["Th\xE8me", K.field("theme", "as_text", { cls: "dzv-pill" })],
          ["\xC9tat", K.field("etat", "as_text", { cls: "dzv-pill" })],
          ["Erreur", K.field("erreur", "ellipsize", { cfg: { nchars: 60 } })],
          ["Lue", K.dateFr("derniere_synchro", { time: true })]
        ], { order: "theme", desc: false, rowClick: "`/view/source_modifier?id=${id}`", limit: 200, description: "Sources suivies et leur \xE9tat" })
      ],
      triggers: [
        K.wf("veille_releve", "Hourly", null, "Lit toutes les sources actives (sites et cha\xEEnes YouTube), toutes les heures", [
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
          K.st("liberer", "dzf_verrou", { action: "lib\xE9rer", nom: "releve-veille", sortie: "verrou_libre" })
        ])
      ],
      seedMerge: { veille_sources: "nom" },
      seeds: {
        veille_sources: [
          site("Hacker News", "https://hnrss.org/frontpage", "dev"),
          site("DEV Community", "https://dev.to/feed", "dev"),
          site("Journal du hacker", "https://www.journalduhacker.net/rss", "dev"),
          site("GitHub Blog", "https://github.blog/feed/", "dev"),
          site("Stack Overflow Blog", "https://stackoverflow.blog/feed/", "dev"),
          site("CERT-FR \xB7 alertes", "https://www.cert.ssi.gouv.fr/alerte/feed/", "cyber"),
          site("CERT-FR \xB7 avis", "https://www.cert.ssi.gouv.fr/avis/feed/", "cyber"),
          site("The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "cyber"),
          site("BleepingComputer", "https://www.bleepingcomputer.com/feed/", "cyber"),
          site("Krebs on Security", "https://krebsonsecurity.com/feed/", "cyber"),
          site("Zataz", "https://www.zataz.com/feed/", "cyber"),
          site("Hugging Face", "https://huggingface.co/blog/feed.xml", "ia"),
          site("OpenAI", "https://openai.com/news/rss.xml", "ia"),
          site("Google AI", "https://blog.google/technology/ai/rss/", "ia"),
          site("Simon Willison", "https://simonwillison.net/atom/everything/", "ia"),
          site("Kubernetes", "https://kubernetes.io/feed.xml", "devops"),
          site("Docker", "https://www.docker.com/blog/feed/", "devops"),
          site("CNCF", "https://www.cncf.io/blog/feed/", "devops"),
          site("HashiCorp", "https://www.hashicorp.com/blog/feed.xml", "devops"),
          site("AWS \xB7 nouveaut\xE9s", "https://aws.amazon.com/about-aws/whats-new/recent/feed/", "cloud"),
          site("neptune.ai", "https://neptune.ai/blog/feed", "mlops"),
          site("Towards Data Science", "https://towardsdatascience.com/feed", "data"),
          site("Cloudflare", "https://blog.cloudflare.com/rss/", "r\xE9seau"),
          site("APNIC", "https://blog.apnic.net/feed/", "r\xE9seau"),
          site("Packet Pushers", "https://packetpushers.net/feed/", "r\xE9seau"),
          site("LWN.net", "https://lwn.net/headlines/rss", "syst\xE8mes"),
          site("LinuxFr", "https://linuxfr.org/news.atom", "syst\xE8mes"),
          site("Phoronix", "https://www.phoronix.com/rss.php", "syst\xE8mes"),
          site("Next", "https://next.ink/feed/", "tech fr"),
          site("Korben", "https://korben.info/feed", "tech fr"),
          site("Le Monde \xB7 Pixels", "https://www.lemonde.fr/pixels/rss_full.xml", "tech fr")
        ]
      },
      pages: [{
        name: "veille",
        title: "Veille tech",
        quick: { label: "Source", url: "/view/source_modifier" },
        content: [
          K.chips([
            ["Tout", ""],
            ...[["Dev", "dev", "fas fa-code"], ["Cyber", "cyber", "fas fa-shield-alt"], ["IA", "ia", "fas fa-brain"], ["DevOps", "devops", "fas fa-infinity"], ["MLOps", "mlops", "fas fa-project-diagram"], ["Cloud", "cloud", "fas fa-cloud"], ["R\xE9seau", "r\xE9seau", "fas fa-network-wired"], ["Syst\xE8mes", "syst\xE8mes", "fab fa-linux"], ["Data", "data", "fas fa-database"], ["Tech FR", "tech fr", "fas fa-flag"]].map(([l, v, i]) => [l, `theme=${v}`, i]),
            ["Non lus", "lu=false", "far fa-circle"],
            ["Favoris", "favori=true", "fas fa-star"],
            ["Plus tard", "plus_tard=true", "far fa-clock"]
          ]),
          K.view("veille_fil")
        ]
      }, {
        name: "sources",
        title: "Sources suivies",
        quick: { label: "Source", url: "/view/source_modifier" },
        content: [
          K.text('<p class="dzv-muted">Sites (flux RSS / Atom) et cha\xEEnes YouTube lus toutes les heures. Clique une ligne pour la modifier ; \xAB Lire \xBB la relit tout de suite. Une source en erreur montre la raison.</p>'),
          K.chips([["Toutes", ""], ["Sites", "type=site", "fas fa-rss"], ["YouTube", "type=youtube", "fab fa-youtube"], ["En erreur", "etat=erreur", "fas fa-exclamation-triangle"]]),
          K.panel("Sources", "fas fa-rss", [K.view("sources_liste"), K.box("dzv-tile-actions", K.jsBtn("Tout relire maintenant", RELIRE, { icon: "fas fa-sync", style: "btn-outline-secondary" }))], { actions: K.modalBtn("Source", "/view/source_modifier") })
        ]
      }],
      nav: [
        { page: "veille", label: "Veille tech", short: "Veille", icon: "fas fa-satellite-dish", group: "Veille", order: 10, mobile: true, keywords: "rss actualit\xE9s tech cyber ia devops" },
        { page: "sources", label: "Sources suivies", icon: "fas fa-rss", group: "Veille", order: 90, keywords: "flux rss cha\xEEnes youtube" }
      ],
      quick: [{ label: "Nouvelle source (RSS ou YouTube)", icon: "fas fa-rss", url: "/view/source_modifier", keywords: "flux rss cha\xEEne" }],
      explain: [
        ["Toutes les heures", "Le workflow \xAB veille_releve \xBB : Verrou \u2192 Table : chercher (sources) \u2192 Lire des flux \u2192 Liste : enlever les doublons \u2192 Liste : transformer \u2192 Table : ajouter ou mettre \xE0 jour \u2192 Code (\xE9tat des sources) \u2192 m\xE9nage \u2192 Verrou lib\xE9r\xE9."],
        ["Une source ne marche pas", "Sa colonne \xC9tat passe \xE0 \xAB erreur \xBB avec la raison. Corrige l'adresse, puis \xAB Tout relire maintenant \xBB."],
        ["Ajouter un site", "Bouton + Source : colle l'adresse de son flux RSS (souvent /feed ou /rss)."],
        ["M\xE9nage", "Les articles lus de plus de 60 jours sont supprim\xE9s \xE0 chaque rel\xE8ve, sauf favoris et \xAB plus tard \xBB (\xE9tapes \xAB limite \xBB et \xAB menage \xBB du workflow)."]
      ]
    };
    module2.exports.THEMES = THEMES;
    module2.exports.card = card;
    module2.exports.toggle = toggle;
    module2.exports.IMG_FML = IMG_FML;
  }
});

// src/modules/videos.js
var require_videos = __commonJS({
  "src/modules/videos.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var { toggle } = require_veille();
    var yt = (nom, chaine, youtube_id, theme) => ({ nom, type: "youtube", chaine, youtube_id: youtube_id || "", theme, actif: true, etat: "", erreur: "", url: "" });
    var VID = "String(video_id || '').replace(/[^\\w-]/g, '')";
    var THUMB = `'<span class="dzv-thumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + ${VID} + '/mqdefault.jpg"></span>'`;
    var PLAYER = `'<div class="dzv-player"><iframe src="https://www.youtube-nocookie.com/embed/' + ${VID} + '?rel=0&playsinline=1" title="Lecteur vid\xE9o" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div><p class="dzv-player-alt"><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + ${VID} + '"><i class="fab fa-youtube"></i> Ouvrir sur YouTube</a></p>'`;
    module2.exports = {
      key: "videos",
      label: "Vid\xE9os",
      icon: "fab fa-youtube",
      group: "Veille",
      description: "Les derni\xE8res vid\xE9os des cha\xEEnes YouTube dev, cyber, IA, DevOps/MLOps, r\xE9seau et syst\xE8mes que tu suis, regard\xE9es directement dans l'appli (sans pub de suivi, lecteur youtube-nocookie).",
      depends: ["veille"],
      setup: "<p>Si tu actives la Content Security Policy de Saltcorn, autorise <code>www.youtube-nocookie.com</code> (cadres) et <code>i.ytimg.com</code> (images).</p><p>Ajouter une cha\xEEne : bouton + Source, type \xAB youtube \xBB, et colle son @nom (ex. <code>@TechWorldwithNana</code>).</p>",
      tables: [],
      views: [
        K.show("video_carte", "veille_articles", K.box(
          "`dzv-article dzv-video${lu ? ' dzv-read' : ''}${favori ? ' dzv-fav' : ''}${plus_tard ? ' dzv-later' : ''}`",
          K.O({ clsFormula: true, id: "`art-${id}`" }),
          K.box("", K.O({ url: "`javascript:ajax_modal('/view/video_lecture?id=${id}')`", urlFormula: true }), K.formula(THUMB, { html: true })),
          K.box(
            "dzv-article-in",
            K.box("dzv-article-src", ...K.spans(K.join("source.nom", "as_text"), K.dateFr("date"))),
            K.box("dzv-article-title", K.O({ url: "`javascript:ajax_modal('/view/video_lecture?id=${id}')`", urlFormula: true }), K.field("titre", "as_text"))
          ),
          K.box("dzv-tile-actions", toggle("lu", "Vue", "fas fa-check", "dzv-read"), toggle("favori", "Favori", "fas fa-star", "dzv-fav"), toggle("plus_tard", "Plus tard", "far fa-clock", "dzv-later"))
        ), { description: "Vignette d'une vid\xE9o" }),
        K.show("video_lecture", "veille_articles", K.box(
          "dzv-mail",
          K.formula(PLAYER, { html: true }),
          K.field("titre", "as_text", { cls: "dzv-mail-title" }),
          K.meta(K.join("source.nom", "as_text"), K.dateFr("date"), K.field("theme", "as_text")),
          K.box("dzv-tile-actions", toggle("lu", "Vue", "fas fa-check", "dzv-read"), toggle("favori", "Favori", "fas fa-star", "dzv-fav"), toggle("plus_tard", "Plus tard", "far fa-clock", "dzv-later"), K.link("'Ouvrir sur YouTube'", "url", { cls: "btn btn-sm btn-link" })),
          K.field("resume", "as_text", { cls: "dzv-mail-body", block: true })
        ), { title: "Vid\xE9o", width: 980, description: "Lecteur vid\xE9o en fen\xEAtre" }),
        K.feed("videos_grille", "veille_articles", "video_carte", { include: 'type == "vid\xE9o"', order: "date", desc: true, limit: 24, md: 2, lg: 3, xl: 4 })
      ],
      seedMerge: { veille_sources: "nom" },
      seeds: {
        veille_sources: [
          yt("Fireship", "@Fireship", "UCsBjURrPoezykLs9EqgamOA", "dev"),
          yt("Grafikart", "@grafikart", "UCj_iGliGCkLcHSZ8eqVNPDQ", "dev"),
          yt("ByteByteGo", "@ByteByteGo", "UCZgt6AzoyjslHTC9dz0UoTw", "dev"),
          yt("Hussein Nasser", "@hnasr", "UC_ML5xP23TOWKUcc-oAE_Eg", "dev"),
          yt("TechWorld with Nana", "@TechWorldwithNana", "UCdngmbVKX1Tgre699-XLlUA", "devops"),
          yt("DevOps Toolkit", "@DevOpsToolkit", "", "devops"),
          yt("Xavki", "@xavki", "", "devops"),
          yt("Cocadmin", "@cocadmin", "", "devops"),
          yt("NetworkChuck", "@NetworkChuck", "UC9x0AN7BWHpCDHSm9NiJFJQ", "r\xE9seau"),
          yt("David Bombal", "@davidbombal", "UCP7WmQ_U4GB3K51Od9QvM0w", "r\xE9seau"),
          yt("John Hammond", "@_JohnHammond", "UCVeW9qkBjo3zosnqUbG7CFw", "cyber"),
          yt("IppSec", "@ippsec", "UCa6eh7gCkpPo5XXUDfygQQA", "cyber"),
          yt("LiveOverflow", "@LiveOverflow", "UClcE-kVhqyiHCcjYwcpfj9w", "cyber"),
          yt("Andrej Karpathy", "@AndrejKarpathy", "UCXUPKJO5MZQN11PqgIvyuvQ", "ia"),
          yt("Two Minute Papers", "@TwoMinutePapers", "UCbfYPyITQ-7l4upoX8nvctg", "ia"),
          yt("Yannic Kilcher", "@YannicKilcher", "UCZHmQk67mSJgfCCTn7xBfew", "ia"),
          yt("Machine Learnia", "@MachineLearnia", "", "ia"),
          yt("MLOps.community", "@MLOps", "", "mlops"),
          yt("Learn Linux TV", "@LearnLinuxTV", "", "syst\xE8mes"),
          yt("Computerphile", "@Computerphile", "UC9-y-6csu5WGm29I7JiwpnA", "syst\xE8mes"),
          yt("Micode", "@Micode", "UCYnvxJ-PKiGXo_tYXpWAC-w", "tech fr"),
          yt("Underscore_", "@Underscore_", "", "tech fr")
        ]
      },
      pages: [{
        name: "videos",
        title: "Vid\xE9os",
        quick: { label: "Cha\xEEne", url: "/view/source_modifier?type=youtube" },
        content: [
          K.chips([["Tout", ""], ["Dev", "theme=dev", "fas fa-code"], ["Cyber", "theme=cyber", "fas fa-shield-alt"], ["IA", "theme=ia", "fas fa-brain"], ["DevOps", "theme=devops", "fas fa-infinity"], ["MLOps", "theme=mlops", "fas fa-project-diagram"], ["R\xE9seau", "theme=r\xE9seau", "fas fa-network-wired"], ["Syst\xE8mes", "theme=syst\xE8mes", "fab fa-linux"], ["Tech FR", "theme=tech fr", "fas fa-flag"], ["Pas vues", "lu=false", "far fa-circle"], ["Plus tard", "plus_tard=true", "far fa-clock"], ["Favoris", "favori=true", "fas fa-star"]]),
          K.view("videos_grille")
        ]
      }],
      nav: [{ page: "videos", label: "Vid\xE9os", icon: "fab fa-youtube", group: "Veille", order: 20, keywords: "youtube cha\xEEne tuto" }],
      quick: [{ label: "Nouvelle cha\xEEne YouTube", icon: "fab fa-youtube", url: "/view/source_modifier?type=youtube", keywords: "youtube" }],
      explain: [
        ["Les cha\xEEnes", "Ce sont des lignes de \xAB veille_sources \xBB de type youtube. Leur identifiant (UC\u2026) est trouv\xE9 tout seul \xE0 partir du @nom."],
        ["Toutes les heures", "Le m\xEAme d\xE9clencheur que la veille (\xAB veille_releve \xBB) lit le flux de chaque cha\xEEne et ajoute les vid\xE9os (type = vid\xE9o)."],
        ["Tu cliques une vid\xE9o", "La vue \xAB video_lecture \xBB s'ouvre en fen\xEAtre avec le lecteur youtube-nocookie : pas besoin d'aller sur YouTube."]
      ]
    };
  }
});

// src/modules/actus.js
var require_actus = __commonJS({
  "src/modules/actus.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var { IMG_FML } = require_veille();
    var site = (nom, url, theme) => ({ nom, type: "site", url, theme, actif: true, etat: "", erreur: "" });
    module2.exports = {
      key: "actus",
      label: "Actus France & S\xE9n\xE9gal",
      icon: "fas fa-globe-africa",
      group: "Veille",
      description: "Les titres du jour en France et au S\xE9n\xE9gal c\xF4te \xE0 c\xF4te (franceinfo, Le Monde, France 24, Seneweb, Dakaractu, APS, Le Soleil, RFI Afrique\u2026), mis \xE0 jour toutes les heures.",
      depends: ["veille"],
      tables: [],
      views: [
        K.show("actu_ligne", "veille_articles", K.box(
          "`dzv-line dzv-line-img${lu ? ' dzv-read' : ''}`",
          K.O({ clsFormula: true, id: "`art-${id}`" }),
          K.formula(IMG_FML("dzv-line-thumb"), { html: true }),
          K.box("", K.box("dzv-line-src", K.join("source.nom", "as_text")), K.link("titre", "url", { cls: "dzv-line-title" }), K.box("dzv-mail-ext", K.dateFr("date", { time: true })))
        ), { description: "Une ligne d'actualit\xE9 avec son image" }),
        K.feed("actus_france", "veille_articles", "actu_ligne", { include: 'theme == "actus france"', order: "date", desc: true, limit: 25, md: 1, lg: 1 }),
        K.feed("actus_senegal", "veille_articles", "actu_ligne", { include: 'theme == "actus s\xE9n\xE9gal"', order: "date", desc: true, limit: 25, md: 1, lg: 1 })
      ],
      seedMerge: { veille_sources: "nom" },
      seeds: {
        veille_sources: [
          site("franceinfo", "https://www.francetvinfo.fr/titres.rss", "actus france"),
          site("Le Monde", "https://www.lemonde.fr/rss/une.xml", "actus france"),
          site("France 24", "https://www.france24.com/fr/rss", "actus france"),
          site("20 Minutes", "https://www.20minutes.fr/feeds/rss-une.xml", "actus france"),
          site("Seneweb", "https://www.seneweb.com/feed", "actus s\xE9n\xE9gal"),
          site("Dakaractu", "https://www.dakaractu.com/xml/syndication.rss", "actus s\xE9n\xE9gal"),
          site("APS", "https://aps.sn/feed/", "actus s\xE9n\xE9gal"),
          site("Le Soleil", "https://lesoleil.sn/feed/", "actus s\xE9n\xE9gal"),
          site("Senego", "https://senego.com/feed", "actus s\xE9n\xE9gal"),
          site("RFI Afrique", "https://www.rfi.fr/fr/afrique/rss", "actus s\xE9n\xE9gal")
        ]
      },
      pages: [{
        name: "actus",
        title: "Actus France & S\xE9n\xE9gal",
        content: [K.grid(
          "dzv-grid-2",
          K.panel("France", "fas fa-flag", K.view("actus_france")),
          K.panel("S\xE9n\xE9gal", "fas fa-globe-africa", K.view("actus_senegal"))
        )]
      }],
      nav: [{ page: "actus", label: "Actus FR & SN", short: "Actus", icon: "fas fa-globe-africa", group: "Veille", order: 30, keywords: "actualit\xE9s france s\xE9n\xE9gal news" }],
      explain: [
        ["Les journaux", "Des lignes de \xAB veille_sources \xBB avec le th\xE8me \xAB actus france \xBB ou \xAB actus s\xE9n\xE9gal \xBB. Ajoute ou retire un journal depuis la page Veille (Sources suivies)."],
        ["Toutes les heures", "Le d\xE9clencheur \xAB veille_releve \xBB lit les flux ; la page montre les 25 derniers titres de chaque pays."]
      ]
    };
  }
});

// src/modules/surveillance.js
var require_surveillance = __commonJS({
  "src/modules/surveillance.js"(exports2, module2) {
    "use strict";
    var K = require_kit();
    var TYPES = ["http", "api", "tcp", "dns", "dns_change", "tls", "domaine", "contenu", "liste_noire", "mail", "prometheus", "battement", "securite"];
    var TYPE_AIDE = {
      http: "Site ou page : code HTTP, temps de r\xE9ponse, texte attendu (champ \xAB Attendu \xBB)",
      api: "Sc\xE9nario d'API en plusieurs appels, avec v\xE9rifications (JSON dans \xAB Attendu \xBB)",
      tcp: "Service joignable sur un port (base, SMTP, SSH\u2026) : cible = serveur, port",
      dns: "Le domaine pointe bien vers \xAB Attendu \xBB (ex. l'IP de ton serveur)",
      dns_change: "Pr\xE9vient si les enregistrements DNS changent (d\xE9tournement, erreur)",
      tls: "Certificat : jours restants (seuil = jours avant alerte)",
      domaine: "Expiration du nom de domaine (seuil = jours avant alerte)",
      contenu: "La page a chang\xE9 (d\xE9figuration, prix, CGU\u2026) ; \xAB Attendu \xBB = rep\xE8re de d\xE9but",
      liste_noire: "IP ou domaine sur une liste noire anti-spam",
      mail: "SPF, DMARC, MX du domaine",
      prometheus: "Valeur d'une m\xE9trique (\xAB Attendu \xBB = requ\xEAte PromQL, seuil = maximum)",
      battement: "Une t\xE2che cron doit appeler son adresse de battement ; seuil = minutes max sans nouvelles",
      securite: "Note de s\xE9curit\xE9 A \xE0 F (en-t\xEAtes, TLS, ports, mail, liste noire), 1 fois par jour"
    };
    var VERIFIER = `// Sondes dues (selon leur intervalle), v\xE9rifi\xE9es 6 par 6 avec le bon bloc dysizz-flow.
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
      case "dns": { const x = await r("dzf_dns", { domaine: host(s.url), type: "A", attendu: s.attendu || "" }); return { etat: x.ok ? "ok" : "panne", raison: x.ok ? "" : "attendu " + s.attendu + ", trouv\xE9 " + x.valeurs.join(", "), details: x.valeurs }; }
      case "dns_change": { const x = await r("dzf_dns_changement", { domaine: host(s.url) }); return { etat: x.etat, raison: x.raison, details: x.enregistrements }; }
      case "tls": { const x = await r("dzf_certificat_tls", { hotes: host(s.url), port: s.port || 443 }); const j = x.jours_restants; return { etat: j === null ? "panne" : j < 0 || x.valide === false ? "panne" : j <= (s.seuil || 14) ? "lent" : "ok", raison: j === null ? x.erreur : j + " jour(s) restant(s)" + (x.valide === false ? " \xB7 invalide" : ""), tls_jours: j, tls_expire_le: x.fin || null }; }
      case "domaine": { const x = await r("dzf_domaine_expiration", { domaine: host(s.url), alerte_jours: s.seuil || 30 }); return { etat: x.etat === "inconnu" ? "lent" : x.etat, raison: x.jours_restants === null ? "date inconnue" : "expire dans " + x.jours_restants + " j (" + (x.registrar || "?") + ")" }; }
      case "contenu": { const x = await r("dzf_contenu_change", { url: s.url, debut: s.attendu || "" }); return { etat: x.etat, raison: x.change ? "modifi\xE9e : " + x.apercu : x.premiere_fois ? "premi\xE8re lecture" : "" }; }
      case "liste_noire": { const x = await r("dzf_liste_noire", { cible: host(s.url) }); return { etat: x.etat, raison: x.raison, details: x.details }; }
      case "mail": { const x = await r("dzf_dns_mail", { domaine: host(s.url) }); return { etat: x.ok ? "ok" : "lent", raison: (x.conseils || []).join(" ; "), details: { spf: x.spf, dmarc: x.dmarc, mx: x.mx } }; }
      case "prometheus": { const x = await r("dzf_prometheus", { url: s.url, requete: s.attendu || "up", max: s.seuil === null || s.seuil === undefined ? "" : s.seuil }); return { etat: x.etat, raison: x.raison || "valeur " + x.valeur, ms: Math.round(x.valeur) }; }
      case "battement": { const age = s.dernier_ok ? (now - new Date(s.dernier_ok)) / 60e3 : null; return { etat: age === null ? "lent" : age > (s.seuil || 60) ? "panne" : "ok", raison: age === null ? "jamais re\xE7u" : "dernier signal il y a " + Math.round(age) + " min", keep_ok: true }; }
      case "securite": { const x = await r("dzf_note_securite", { url: s.url }); return { etat: x.etat, raison: "note " + x.note + " (" + x.score + "/100)" + (x.a_corriger.length ? " \xB7 " + x.a_corriger.slice(0, 2).join(" ; ") : ""), note_secu: x.note, score: x.score, details: x.a_corriger }; }
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
    /* incident : ouvert \xE0 la panne, ferm\xE9 au retour */
    const ouvert = await E.getRow({ sonde: s.id, ouvert: true });
    if (x.etat === "panne" && !ouvert) await E.insertRow({ quand, debut: quand, site: s.nom, sonde: s.id, etat: "panne", ouvert: true, message: "En panne : " + (x.raison || "?") });
    if (x.etat !== "panne" && ouvert) await E.updateRow({ ouvert: false, fin: quand, duree_min: Math.round((quand - new Date(ouvert.debut || ouvert.quand)) / 60e3), etat: "ok", message: ouvert.message + " \u2192 r\xE9tabli" }, ouvert.id);
    if (x.etat === "lent" && s.etat !== "lent" && s.etat) await E.insertRow({ quand, debut: quand, fin: quand, site: s.nom, sonde: s.id, etat: "lent", ouvert: false, message: "Attention : " + (x.raison || "") });
    const a = await Actions.dzf_alerte({ cle: "sonde-" + s.id, probleme: x.etat === "panne", silence_min: 60, sortie: "a" });
    if (a.a && a.a.envoyer) alertes.push((a.a.etat === "r\xE9tabli" ? "\u2705 " : "\u{1F534} ") + s.nom + " : " + a.a.etat + (x.raison && a.a.etat !== "r\xE9tabli" ? " (" + x.raison + ")" : a.a.duree_min ? " apr\xE8s " + a.a.duree_min + " min" : ""));
  }));
}
return { verifiees: sondes.length, alertes, texte: alertes.join("\\n") };`;
    var DISPO = `// Pourcentage de v\xE9rifications r\xE9ussies par sonde, sur 24 h, 7 jours et 30 jours.
const S = Table.findOne({ name: "surveillance_sites" });
const M = Table.findOne({ name: "surveillance_mesures" });
const pct = async (id, h) => { const r = await M.aggregationQuery({ n: { field: "id", aggregate: "Count" } }, { where: { sonde: id, quand: { gt: new Date(Date.now() - h * 3600e3) } } }); const k = await M.aggregationQuery({ n: { field: "id", aggregate: "Count" } }, { where: { sonde: id, ok: true, quand: { gt: new Date(Date.now() - h * 3600e3) } } }); return r && Number(r.n) ? Math.round((1000 * Number(k.n)) / Number(r.n)) / 10 : null; };
for (const s of await S.getRows({ actif: true })) await S.updateRow({ dispo_24h: await pct(s.id, 24), dispo_7j: await pct(s.id, 168), dispo_30j: await pct(s.id, 720) }, s.id, undefined, true);
return true;`;
    var ETAT_TILE = "etat";
    var LIEN_BATTEMENT = `type === 'battement' ? (jeton ? '<div class="dzv-meta"><i class="fas fa-heartbeat"></i> Adresse \xE0 appeler par ta t\xE2che : <code>/dysizz-me/battement/' + String(jeton).replace(/[^a-z0-9]/g, '') + '</code></div>' : '<div class="dzv-meta">L\\'adresse de battement appara\xEEt apr\xE8s la premi\xE8re v\xE9rification</div>') : ''`;
    module2.exports = {
      key: "surveillance",
      label: "Surveillance",
      icon: "fas fa-heartbeat",
      group: "Syst\xE8me",
      description: "Tes sites, API, serveurs et domaines surveill\xE9s en profondeur : 13 types de sondes (site, sc\xE9nario d'API, port, DNS et ses changements, certificat, expiration du domaine, contenu modifi\xE9, liste noire, mail, Prometheus, battement de t\xE2ches cron, note de s\xE9curit\xE9 A-F), incidents avec dur\xE9e, disponibilit\xE9 24 h / 7 j / 30 j, page de statut publique, alertes sans spam par notification, ntfy ou Telegram.",
      depends: [],
      setup: '<p>Ajoute des sondes dans la page Surveillance. Pour recevoir les alertes sur ton t\xE9l\xE9phone : <a href="/dysizz-me/reglages/surveillance">R\xE9gler Surveillance</a> (ntfy ou Telegram).</p>',
      settings: {
        intro: "Les alertes arrivent toujours en notification dans Saltcorn. Tu peux aussi les recevoir sur ton t\xE9l\xE9phone : <b>ntfy</b> (application gratuite, sans compte : choisis un nom de sujet difficile \xE0 deviner) ou <b>Telegram</b> (cr\xE9e un bot avec @BotFather, puis donne son jeton et ton identifiant de discussion).",
        fields: [
          { name: "ntfy_sujet", label: "ntfy \xB7 sujet", type: "text", placeholder: "ex. sidy-alertes-7f3k9", help: "Installe l'appli ntfy et abonne-toi \xE0 ce sujet. Vide = pas de ntfy." },
          { name: "ntfy_serveur", label: "ntfy \xB7 serveur", type: "text", default: "https://ntfy.sh", help: "Ton propre serveur ntfy si tu en as un." },
          { name: "telegram_chat", label: "Telegram \xB7 identifiant de discussion", type: "text", help: "Vide = pas de Telegram. Ton identifiant : \xE9cris \xE0 @userinfobot." },
          { name: "telegram_jeton", label: "Telegram \xB7 jeton du bot", type: "password", secret: "TELEGRAM_BOT_TOKEN" },
          { name: "page_publique", label: "Page de statut publique (/page/statut) visible sans connexion", type: "bool" }
        ],
        apply: [
          { trigger: "surveillance_verifier", step: "ntfy", set: { sujet: (v) => v.ntfy_sujet || "", serveur: (v) => v.ntfy_serveur || "https://ntfy.sh" } },
          { trigger: "surveillance_verifier", step: "telegram", set: { chat_id: (v) => v.telegram_chat || "" } }
        ],
        pageRoles: { statut: (v) => v.page_publique ? 100 : 80 },
        test: { action: "dzf_ntfy", config: (v) => ({ serveur: v.ntfy_serveur || "https://ntfy.sh", sujet: v.ntfy_sujet, titre: "Test Surveillance", texte: "Si tu lis ceci, les alertes arrivent bien." }), ok: () => "Message de test envoy\xE9 sur ntfy." }
      },
      tables: [
        {
          name: "surveillance_sites",
          description: "Les sondes : sites, API, serveurs, domaines\u2026",
          fields: [
            K.s("nom", "Nom", { required: true }),
            K.opts("type", "Type de sonde", TYPES),
            K.s("url", "Cible (adresse, domaine ou IP)", { required: true, is_unique: false }),
            K.int("port", "Port"),
            K.s("attendu", "Attendu / r\xE9glage"),
            K.int("seuil", "Seuil"),
            K.int("intervalle_min", "Toutes les (minutes)", { default: 5 }),
            K.s("groupe", "Groupe"),
            K.bool("publique", "Sur la page de statut"),
            K.bool("actif", "Surveill\xE9", { default: true }),
            K.s("etat", "\xC9tat"),
            K.int("ms", "Temps / valeur"),
            K.int("code_http", "Code HTTP"),
            K.s("raison", "Raison"),
            K.date("verifie_le", "V\xE9rifi\xE9 le"),
            K.date("dernier_ok", "Dernier OK"),
            K.s("jeton", "Jeton de battement"),
            K.int("tls_jours", "Certificat : jours restants"),
            K.date("tls_expire_le", "Certificat : expire le"),
            K.int("tls_alerte_jours", "Pr\xE9venir (jours avant l'expiration du certificat)", { default: 14 }),
            K.s("note_secu", "Note de s\xE9curit\xE9"),
            K.int("score", "Score de s\xE9curit\xE9"),
            K.num("dispo_24h", "Dispo 24 h (%)"),
            K.num("dispo_7j", "Dispo 7 j (%)"),
            K.num("dispo_30j", "Dispo 30 j (%)"),
            K.s("details", "D\xE9tails (JSON)"),
            K.s("note", "Note")
          ]
        },
        { name: "surveillance_mesures", description: "Chaque v\xE9rification (gard\xE9es 90 jours)", fields: [K.date("quand", "Quand"), K.s("site", "Sonde"), K.int("sonde", "Id de la sonde"), K.int("ms", "Temps (ms)"), K.bool("ok", "OK")] },
        { name: "surveillance_evenements", description: "Incidents : d\xE9but, fin, dur\xE9e", fields: [K.date("quand", "Quand"), K.s("site", "Sonde"), K.int("sonde", "Id de la sonde"), K.s("etat", "\xC9tat"), K.s("message", "Message"), K.date("debut", "D\xE9but"), K.date("fin", "Fin"), K.int("duree_min", "Dur\xE9e (min)"), K.bool("ouvert", "En cours")] }
      ],
      views: [
        K.edit("site_modifier", "surveillance_sites", [["nom", "Nom"], ["type", "Type de sonde"], ["url", "Cible (adresse, domaine ou IP)"], ["port", "Port (tcp, tls)"], ["attendu", "Attendu / r\xE9glage", "textarea"], ["seuil", "Seuil (ms, jours, minutes ou valeur max selon le type)"], ["intervalle_min", "V\xE9rifier toutes les (minutes)"], ["groupe", "Groupe"], ["publique", "Afficher sur la page de statut"], ["actif", "Surveill\xE9"], ["note", "Note", "textarea"]], { delete: true, title: "Sonde", width: 640 }),
        K.show("sonde_fiche", "surveillance_sites", K.box(
          "dzv-mail",
          K.box(
            "dzv-mail-head",
            K.box("dzv-mail-title", K.field("nom", "as_text")),
            K.meta(K.field("type", "as_text"), K.field("url", "as_text"), K.field("etat", "as_text"), K.dateFr("verifie_le", { time: true })),
            K.box("dzv-tile-actions", K.modalLink("site_modifier", "Modifier"))
          ),
          K.box("dzv-kv", K.meta(K.text("Dispo 24 h"), K.field("dispo_24h", "show"), K.text("7 j"), K.field("dispo_7j", "show"), K.text("30 j"), K.field("dispo_30j", "show"))),
          K.field("raison", "as_text", { block: true }),
          K.formula(LIEN_BATTEMENT, { html: true }),
          K.formula(`note_secu ? '<div class="dzv-meta">Note de s\xE9curit\xE9 : <b>' + String(note_secu).replace(/[^A-F]/g, '') + '</b> (' + (score || 0) + '/100)</div>' : ''`, { html: true }),
          K.formula(`details ? '<pre class="dzv-code-small">' + String(details).replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 4000) + '</pre>' : ''`, { html: true })
        ), { title: "Sonde", width: 760 }),
        K.custom("surveillance_statut", "DZ Statut", "surveillance_sites", { champ_nom: "nom", champ_etat: ETAT_TILE, champ_detail: "raison", champ_date: "verifie_le", vue: "sonde_fiche", filtre: '{"actif":true}', texte_vide: "Ajoute une premi\xE8re sonde" }, "\xC9tat de chaque sonde"),
        K.custom("surveillance_dispo", "DZ Disponibilit\xE9", "surveillance_mesures", { champ_date: "quand", champ_ok: "ok", champ_groupe: "site", jours: 30, texte_vide: "La disponibilit\xE9 appara\xEEt apr\xE8s les premi\xE8res v\xE9rifications" }, "Disponibilit\xE9 jour par jour sur 30 jours"),
        K.custom("statut_public", "DZ Disponibilit\xE9", "surveillance_mesures", { champ_date: "quand", champ_ok: "ok", champ_groupe: "site", jours: 90, groupes_table: "surveillance_sites", groupes_champ: "nom", groupes_filtre: '{"publique":true}', texte_vide: "Pas encore de donn\xE9es" }, "Page de statut : 90 jours"),
        K.custom("surveillance_temps", "DZ Graphique", "surveillance_mesures", { champ_date: "quand", champ_valeur: "ms", calcul: "moyenne", champ_serie: "site", periode: "last7", pas: "heure", type: "courbe", format: "int", hauteur: 220, filtre: '{"ok":true}', texte_vide: "Les temps de r\xE9ponse appara\xEEtront apr\xE8s les premi\xE8res v\xE9rifications" }, "Temps de r\xE9ponse moyen par heure"),
        K.custom("surveillance_journal", "DZ Journal", "surveillance_evenements", { champ_date: "quand", champ_message: "message", champ_niveau: "etat", champ_source: "site", champ_detail: "duree_min", unite: "min", jours: 30, limite: 200, texte_vide: "Aucun incident sur 30 jours" }, "Incidents et retours \xE0 la normale"),
        K.list("sites_liste", "surveillance_sites", [
          ["Sonde", K.field("nom", "as_text")],
          ["Type", K.field("type", "as_text")],
          ["Cible", K.field("url", "as_text")],
          ["\xC9tat", K.field("etat", "as_text")],
          ["24 h", K.field("dispo_24h", "show")],
          ["30 j", K.field("dispo_30j", "show")],
          ["S\xE9cu", K.field("note_secu", "as_text")]
        ], { order: "nom", desc: false, rowClick: "`/view/sonde_fiche?id=${id}`", limit: 200, description: "Toutes les sondes" })
      ],
      triggers: [
        K.wf("surveillance_verifier", "Often", null, "Toutes les ~5 min : v\xE9rifie les sondes dues, note mesures et incidents, pr\xE9vient une fois par incident (notification, ntfy, Telegram)", [
          K.st("verrou", "dzf_verrou", { action: "prendre", nom: "me-surveillance", duree: 280, sortie: "verrou" }, { next_step: 'verrou ? "verifier" : ""' }),
          K.st("verifier", "dzf_code", { code: VERIFIER, sortie: "v", delai_max: 270 }),
          K.st("prevenir", "dzf_notifier", { qui: "administrateurs", titre: "Surveillance", texte: "{{v.texte}}", lien: "/page/surveillance", sortie: "notifies" }, { only_if: "v && v.alertes.length > 0" }),
          K.st("ntfy", "dzf_ntfy", { serveur: "https://ntfy.sh", sujet: "", titre: "Surveillance", texte: "{{v.texte}}", priorite: "high", si_erreur: "continuer", sortie: "ntfy" }, { only_if: "v && v.alertes.length > 0" }),
          K.st("telegram", "dzf_telegram", { variable_jeton: "TELEGRAM_BOT_TOKEN", chat_id: "", texte: "Surveillance\n{{v.texte}}", si_erreur: "continuer", sortie: "tg" }, { only_if: "v && v.alertes.length > 0" }),
          K.st("liberer", "dzf_verrou", { action: "lib\xE9rer", nom: "me-surveillance", sortie: "verrou_libre" })
        ], { ntfy: ["sujet", "serveur"], telegram: ["chat_id"] }),
        K.wf("surveillance_dispo", "Hourly", null, "Chaque heure : disponibilit\xE9 de chaque sonde sur 24 h, 7 j et 30 j", [
          K.st("calcul", "dzf_code", { code: DISPO, sortie: "dispo", delai_max: 120 })
        ]),
        K.wf("surveillance_menage", "Weekly", null, "Chaque semaine : garde 90 jours de mesures et un an d'incidents", [
          K.st("mesures", "dzf_nettoyer", { table: "surveillance_mesures", champ_date: "quand", jours: 90, sortie: "mesures_supprimees" }),
          K.st("evenements", "dzf_nettoyer", { table: "surveillance_evenements", champ_date: "quand", jours: 365, sortie: "evenements_supprimes" })
        ])
      ],
      seedMerge: { surveillance_sites: "nom" },
      seeds: {
        surveillance_sites: [
          { nom: "AMBS Agency", type: "http", url: "https://ambs-agency.com", actif: true, intervalle_min: 5, seuil: 2e3, groupe: "Sites", publique: false },
          { nom: "AMBS \xB7 domaine", type: "domaine", url: "ambs-agency.com", actif: true, intervalle_min: 1440, seuil: 30, groupe: "Domaines", publique: false },
          { nom: "AMBS \xB7 mail (SPF/DMARC)", type: "mail", url: "ambs-agency.com", actif: true, intervalle_min: 1440, groupe: "Domaines", publique: false },
          { nom: "AMBS \xB7 s\xE9curit\xE9", type: "securite", url: "https://ambs-agency.com", actif: true, intervalle_min: 1440, groupe: "S\xE9curit\xE9", publique: false }
        ]
      },
      pages: [
        {
          name: "surveillance",
          title: "Surveillance",
          quick: { label: "Sonde", url: "/view/site_modifier" },
          content: [
            K.view("surveillance_statut"),
            K.panel("Disponibilit\xE9 sur 30 jours", "fas fa-signal", K.view("surveillance_dispo")),
            K.grid(
              "dzv-grid-2",
              K.panel("Temps de r\xE9ponse", "fas fa-chart-line", K.view("surveillance_temps")),
              K.panel("Incidents", "fas fa-stream", K.view("surveillance_journal"))
            ),
            K.panel("Toutes les sondes", "fas fa-list", K.view("sites_liste"), { actions: `${K.modalBtn("Ajouter", "/view/site_modifier")}<a class="dz-btn dz-btn-sm dz-btn-ghost" href="/page/statut" target="_blank"><i class="fas fa-external-link-alt"></i>Page de statut</a>` }),
            K.text(`<details class="dzv-panel dzv-help"><summary><i class="fas fa-question-circle"></i> Les 13 types de sondes</summary><ul>${Object.entries(TYPE_AIDE).map(([k, v]) => `<li><code>${k}</code> \u2014 ${v}</li>`).join("")}</ul></details>`)
          ]
        },
        {
          name: "statut",
          title: "Statut des services",
          shell: false,
          min_role: 80,
          content: [K.text('<div class="dzv-statuspage"><h1>Statut des services</h1><p class="dzv-muted">Disponibilit\xE9 des 90 derniers jours.</p></div>'), K.view("statut_public")]
        }
      ],
      nav: [{ page: "surveillance", label: "Surveillance", icon: "fas fa-heartbeat", group: "Syst\xE8me", order: 10, keywords: "sites uptime panne serveur monitoring certificat tls domaine s\xE9curit\xE9 api" }],
      quick: [{ label: "Nouvelle sonde", icon: "fas fa-heartbeat", url: "/view/site_modifier", keywords: "uptime monitoring surveiller" }],
      explain: [
        ["Toutes les 5 minutes", "Le workflow \xAB surveillance_verifier \xBB prend les sondes dues (chacune a son intervalle), appelle pour chacune le bon bloc dysizz-flow (site, sc\xE9nario d'API, port, DNS, certificat, domaine, contenu, liste noire, mail, Prometheus, battement, note de s\xE9curit\xE9), 6 \xE0 la fois."],
        ["Incidents", "Une panne ouvre un incident dans \xAB surveillance_evenements \xBB ; le retour \xE0 la normale le ferme avec sa dur\xE9e."],
        ["Une seule alerte", "Le bloc \xAB Alerte (sans spam) \xBB par sonde : une alerte \xE0 la panne, un rappel toutes les heures au plus, puis \xAB r\xE9tabli \xBB. Envoy\xE9e en notification, et sur ntfy / Telegram si r\xE9gl\xE9s."],
        ["Disponibilit\xE9", "\xAB surveillance_dispo \xBB calcule chaque heure le % de v\xE9rifications r\xE9ussies sur 24 h, 7 j et 30 j ; la vue DZ Disponibilit\xE9 dessine une barre par jour."],
        ["Battement", "Pour une t\xE2che cron : cr\xE9e une sonde de type battement, puis fais appeler par ta t\xE2che l'adresse affich\xE9e (curl). Sans nouvelles depuis \xAB seuil \xBB minutes : panne."],
        ["Page de statut", "/page/statut montre les sondes marqu\xE9es \xAB page de statut \xBB. Elle devient publique si tu le coches dans R\xE9gler Surveillance."]
      ]
    };
  }
});

// src/modules/index.js
var require_modules = __commonJS({
  "src/modules/index.js"(exports2, module2) {
    "use strict";
    module2.exports = [
      require_accueil(),
      require_taches(),
      require_objectifs(),
      require_maison(),
      require_budget(),
      require_sante(),
      require_documents(),
      require_mails(),
      require_emploi(),
      require_veille(),
      require_videos(),
      require_actus(),
      require_surveillance()
    ];
  }
});

// src/admin.js
var require_admin = __commonJS({
  "src/admin.js"(exports2, module2) {
    "use strict";
    var { esc, isAdmin, denied, VERSION } = require_core();
    var { installModule, uninstallModule, moduleStatus, getCfg } = require_installer();
    var MODULES = require_modules();
    var { GROUPS } = require_shell();
    var csrf = (req) => req.csrfToken ? req.csrfToken() : "";
    var form = (req, action, inner, o = {}) => `<form method="post" action="${action}" class="dzv-inline"${o.confirm ? ` onsubmit="return confirm('${esc(o.confirm)}')"` : ""}><input type="hidden" name="_csrf" value="${esc(csrf(req))}">${inner}</form>`;
    var ADMIN_CSS = `/* ---------- page d'administration des modules ---------- */
.dzv-admin { max-width: 1180px; margin: 0 auto; }
.dzv-admin h1 { font-weight: 750; letter-spacing: -.02em; display: flex; gap: .6rem; align-items: center; flex-wrap: wrap; }
.dzv-admin h2 { font-size: 1.05rem; font-weight: 700; margin: 2rem 0 .8rem; }
.dzv-admin-top { display: flex; gap: 1rem; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; }
.dzv-admin-top p { color: var(--dzv-mute); max-width: 70ch; }
.dzv-admin-group { font: 600 .74rem var(--dzv-mono) !important; text-transform: uppercase; letter-spacing: .12em; color: var(--dzv-mute); }
.dzv-admin-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); }
.dzv-mod { display: flex; flex-direction: column; gap: .6rem; padding: 1.1rem; border-radius: var(--dzv-radius); border: 1px solid var(--dzv-border); background: var(--dzv-surface); }
.dzv-mod-on { border-color: color-mix(in srgb, var(--dzv-success) 45%, var(--dzv-border)); }
.dzv-mod-head { display: flex; gap: .75rem; align-items: center; }
.dzv-mod-head b { display: block; font-size: 1.02rem; }
.dzv-mod-ic { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: var(--dzv-primary-soft); color: var(--dzv-ink); font-size: 1.05rem; flex: none; }
.dzv-mod p { margin: 0; color: var(--dzv-soft); font-size: .88rem; line-height: 1.5; }
.dzv-mod-counts { display: flex; flex-wrap: wrap; gap: .35rem; }
.dzv-mod-counts span { font: 600 .68rem var(--dzv-mono); padding: .15rem .5rem; border-radius: 99px; background: var(--dzv-surface-2); color: var(--dzv-mute); }
.dzv-mod-deps { font-size: .8rem; color: var(--dzv-mute); }
.dzv-mod-actions { display: flex; flex-wrap: wrap; gap: .3rem; align-items: center; margin-top: auto; }
.dzv-inline { display: inline; margin: 0; }
.dzv-st { display: inline-block; font: 600 .66rem var(--dzv-mono); text-transform: uppercase; letter-spacing: .06em; padding: .15rem .45rem; border-radius: 6px; background: var(--dzv-surface-2); color: var(--dzv-mute); margin-left: .35rem; vertical-align: middle; }
.dzv-st-on { background: color-mix(in srgb, var(--dzv-success) 15%, transparent); color: var(--dzv-success); }
.dzv-st-part { background: color-mix(in srgb, var(--dzv-warning) 18%, transparent); color: color-mix(in srgb, var(--dzv-warning) 70%, var(--dzv-text)); }
.dzv-flash { padding: .8rem 1rem; border-radius: 10px; margin: 1rem 0; font-size: .9rem; }
.dzv-ok { background: color-mix(in srgb, var(--dzv-success) 12%, transparent); }
.dzv-ko { background: color-mix(in srgb, var(--dzv-danger) 12%, transparent); }
.dzv-flows { display: grid; gap: .5rem; }
.dzv-flow { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 2fr); gap: .8rem; align-items: center; padding: .75rem .9rem; border-radius: 12px; background: var(--dzv-surface-2); font-size: .9rem; }
.dzv-flow-q { font-weight: 650; }
.dzv-flow > i { color: var(--dzv-ink); }
@media (max-width: 640px) { .dzv-flow { grid-template-columns: 1fr; } .dzv-flow > i { transform: rotate(90deg); } }
.dzv-det { border: 1px solid var(--dzv-border); border-radius: 12px; padding: .7rem .9rem; margin-bottom: .5rem; background: var(--dzv-surface); }
.dzv-det summary { cursor: pointer; }
.dzv-det summary small { color: var(--dzv-mute); }
.dzv-edit { font-size: .8rem; margin-left: .5rem; }
.dzv-fields { width: 100%; margin-top: .7rem; font-size: .85rem; }
.dzv-fields th { font: 600 .68rem var(--dzv-mono); text-transform: uppercase; color: var(--dzv-mute); padding: .3rem .4rem; }
.dzv-fields td { border-top: 1px solid var(--dzv-border); padding: .35rem .4rem; vertical-align: top; }
.dzv-code { margin: .7rem 0 0; padding: .9rem 1rem; border-radius: 10px; background: #0f1117; color: #e6e6ea; font: .8rem/1.55 var(--dzv-mono); white-space: pre-wrap; max-height: 420px; overflow: auto; }
.dzv-ul { list-style: none; padding: 0; display: grid; gap: .4rem; font-size: .9rem; }
.dzv-ul i { color: var(--dzv-mute); width: 1.2em; }
.dzv-ul small { color: var(--dzv-mute); }
.dzv-danger { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; padding: 1rem; border-radius: 12px; border: 1px dashed var(--dzv-border); }
.dzv-setup { padding: 1rem 1.1rem; border-radius: 12px; background: var(--dzv-primary-soft); }
.dzv-setup h2 { margin-top: 0 !important; }
.dzv-setup code { font-size: .85em; }
.dzv-start { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: .8rem; margin: 1rem 0 .5rem; }
.dzv-start-s { border: 1px solid var(--dzv-border); border-radius: 14px; padding: 1rem; background: var(--dzv-surface); display: flex; flex-direction: column; gap: .5rem; align-items: flex-start; }
.dzv-start-s p { margin: 0; color: var(--dzv-soft); font-size: .88rem; }
.dzv-start-s.done { border-color: color-mix(in srgb, var(--dzv-success) 45%, var(--dzv-border)); }
.dzv-start-s.done b::after { content: " \u2713"; color: var(--dzv-success); }

`;
    var wrap = (res, title, html) => res.sendWrap({ title, requestFluidLayout: false }, { above: [{ type: "blank", isHTML: true, contents: `<style>${ADMIN_CSS}</style><div class="dzv-admin">${html}</div>`.replace(/\{\{/g, "&#123;&#123;").replace(/\}\}/g, "&#125;&#125;") }] });
    var flash = (req) => {
      const q = req.query || {};
      return (q.ok ? `<div class="dzv-flash dzv-ok">${esc(q.ok).replace(/\n/g, "<br>")}</div>` : "") + (q.err ? `<div class="dzv-flash dzv-ko">${esc(q.err)}</div>` : "");
    };
    var settings = require_settings();
    var modOf = (req) => MODULES.find((x) => x.key === req.params.key && x.settings);
    var settingsPage = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const m = modOf(req);
      if (!m) return res.redirect("/dysizz-me");
      return settings.page(req, res, m);
    };
    var settingsSave = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const m = modOf(req);
      if (!m) return res.redirect("/dysizz-me");
      return settings.save(req, res, m);
    };
    var settingsTest = async (req, res) => {
      if (!isAdmin(req)) return res.status(403).json({ ok: false, message: "r\xE9serv\xE9 aux admins" });
      const m = modOf(req);
      if (!m) return res.json({ ok: false, message: "module inconnu" });
      return settings.test(req, res, m);
    };
    var battement = async (req, res) => {
      res.setHeader("Cache-Control", "no-store");
      const jeton = String(req.params.jeton || "");
      if (!/^[a-z0-9]{16,64}$/.test(jeton)) return res.status(404).json({ ok: false });
      const T = require("@saltcorn/data/models/table").findOne({ name: "surveillance_sites" });
      const s = T && await T.getRow({ jeton, type: "battement" });
      if (!s) return res.status(404).json({ ok: false });
      await T.updateRow({ dernier_ok: /* @__PURE__ */ new Date(), etat: "ok", raison: "signal re\xE7u" }, s.id, void 0, true);
      res.json({ ok: true });
    };
    var etat = async (req, res) => {
      res.setHeader("Cache-Control", "no-store");
      if (!isAdmin(req)) return res.json({});
      const page = String((req.query || {}).page || "");
      const m = MODULES.find((x) => x.settings && (x.pages || []).some((p) => p.name === page));
      if (!m) return res.json({});
      const cfg = await getCfg();
      if (!(cfg.installed || []).includes(m.key) || await settings.configured(m, cfg)) return res.json({});
      res.json({ hint: `${m.label} n'est pas encore r\xE9gl\xE9 : il ne peut rien r\xE9cup\xE9rer pour l'instant.`, url: `/dysizz-me/reglages/${m.key}` });
    };
    var badge = (st) => st.installed ? '<span class="dzv-st dzv-st-on">install\xE9</span>' : st.partial ? '<span class="dzv-st dzv-st-part">incomplet</span>' : '<span class="dzv-st">non install\xE9</span>';
    var home = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const cfg = await getCfg();
      const cards = [];
      for (const g of GROUPS) {
        const mods = MODULES.filter((m) => m.group === g);
        if (!mods.length) continue;
        cards.push(`<h2 class="dzv-admin-group">${esc(g)}</h2><div class="dzv-admin-grid">`);
        for (const m of mods) {
          const st = await moduleStatus(m, cfg);
          const needConf = st.installed && m.settings && !await settings.configured(m, cfg);
          const deps = (m.depends || []).map((d) => (MODULES.find((x) => x.key === d) || {}).label || d);
          cards.push(`<div class="dzv-mod${st.installed ? " dzv-mod-on" : ""}">
<div class="dzv-mod-head"><span class="dzv-mod-ic"><i class="${esc(m.icon)}"></i></span><div><b>${esc(m.label)}</b>${badge(st)}${needConf ? '<span class="dzv-st dzv-st-part">\xE0 r\xE9gler</span>' : ""}</div></div>
<p>${esc(m.description)}</p>
<div class="dzv-mod-counts"><span>${(m.tables || []).length} tables</span><span>${(m.views || []).length} vues</span><span>${(m.pages || []).length} pages</span><span>${(m.triggers || []).length} workflows</span></div>
${deps.length ? `<div class="dzv-mod-deps">Utilise : ${esc(deps.join(", "))}</div>` : ""}
<div class="dzv-mod-actions">
${st.installed && m.settings ? `<a class="btn btn-sm ${needConf ? "btn-primary" : "btn-outline-secondary"}" href="/dysizz-me/reglages/${m.key}"><i class="fas fa-sliders-h"></i> R\xE9gler</a>` : ""}
${form(req, `/dysizz-me/install/${m.key}`, `<button class="btn btn-sm ${st.installed ? "btn-outline-secondary" : "btn-primary"}">${st.installed ? "Mettre \xE0 jour" : "Installer"}</button>`)}
<a class="btn btn-sm btn-link" href="/dysizz-me/m/${m.key}">Ce qu'il y a derri\xE8re</a>
${st.installed && (m.pages || [])[0] ? `<a class="btn btn-sm btn-link" href="/page/${esc(m.pages[0].name)}">Ouvrir</a>` : ""}
</div></div>`);
        }
        cards.push("</div>");
      }
      const miss = require_installer().missingDeps();
      const inst = new Set(cfg.installed || []);
      const toConf = [];
      for (const m of MODULES) if (inst.has(m.key) && m.settings && !await settings.configured(m, cfg)) toConf.push(m);
      const s1 = inst.size > 0, s2 = s1 && !toConf.length;
      const steps = `<div class="dzv-start">
<div class="dzv-start-s${s1 ? " done" : ""}"><b>1. Installer</b><p>${s1 ? `${inst.size} module(s) install\xE9(s). Tu peux en ajouter plus bas.` : "Installe tout d'un coup, ou seulement les modules qui t'int\xE9ressent plus bas."}</p>${s1 ? "" : form(req, "/dysizz-me/install-all", '<button class="btn btn-primary btn-sm"><i class="fas fa-magic"></i> Tout installer</button>')}</div>
<div class="dzv-start-s${s2 ? " done" : ""}"><b>2. R\xE9gler</b><p>${!s1 ? "Apr\xE8s l'installation." : toConf.length ? "Ces modules ont besoin de toi (adresse mail, cl\xE9s\u2026) :" : "Tout est r\xE9gl\xE9."}</p>${toConf.map((m) => `<a class="btn btn-sm btn-outline-primary" href="/dysizz-me/reglages/${m.key}"><i class="${esc(m.icon)}"></i> ${esc(m.label)}</a>`).join(" ")}</div>
<div class="dzv-start-s"><b>3. Utiliser</b><p>Ouvre Me : ta journ\xE9e, tes mails, tes t\xE2ches\u2026</p>${inst.has("accueil") ? '<a class="btn btn-sm btn-primary" href="/page/accueil"><i class="fas fa-sun"></i> Ouvrir Me</a>' : ""}</div></div>`;
      wrap(res, "Modules", `${flash(req)}
<div class="dzv-admin-top"><div><h1>Me</h1><p>La solution est d\xE9coup\xE9e en modules. Chacun ajoute des tables, des vues (blocs de dysizz-ui), des pages et des workflows (blocs de dysizz-flow). Tout reste modifiable dans Saltcorn ; \xAB Ce qu'il y a derri\xE8re \xBB montre comment chaque module fonctionne. Version ${esc(VERSION)}.</p></div>
${form(req, "/dysizz-me/install-all", '<button class="btn btn-primary"><i class="fas fa-magic"></i> Tout installer</button>')}</div>
${steps}
${miss.length ? `<div class="dzv-flash dzv-ko">Cette solution a besoin de : <b>${esc(miss.join(", "))}</b>. Installe-les d'abord (Param\xE8tres \u2192 Modules).</div>` : ""}
${cards.join("")}`);
    };
    var detail = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const m = MODULES.find((x) => x.key === req.params.key);
      if (!m) return res.redirect("/dysizz-me");
      const st = await moduleStatus(m);
      const changed = (x) => x.changed ? ` <span class="dzv-st dzv-st-part" title="Tu l'as modifi\xE9 : une mise \xE0 jour ne l'\xE9crase pas">modifi\xE9</span>` : "";
      const missing = (x) => x.exists ? "" : ' <span class="dzv-st">absent</span>';
      const tables = (m.tables || []).map((t) => {
        const s = st.tables.find((x) => x.name === t.name) || {};
        return `<details class="dzv-det"><summary><i class="fas fa-table"></i> <b>${esc(t.name)}</b>${missing(s)} <small>${esc(t.description || "")}${s.exists ? ` \xB7 ${s.rows ?? "?"} lignes` : ""}</small>
${s.id ? `<a href="/table/${s.id}" class="dzv-edit">ouvrir dans Saltcorn</a>` : ""}</summary>
<table class="dzv-fields"><tr><th>Champ</th><th>Type</th><th>D\xE9tail</th></tr>${t.fields.map((f) => `<tr><td><code>${esc(f.name)}</code> ${esc(f.label || "")}</td><td>${esc(f.type)}${f.required ? " \xB7 obligatoire" : ""}${f.unique ? " \xB7 unique" : ""}</td><td>${f.options ? "choix : " + esc([].concat(f.options).join(", ")) : ""}${f.description ? esc(f.description) : ""}</td></tr>`).join("")}</table></details>`;
      }).join("");
      const views = (m.views || []).map((v) => {
        const s = st.views.find((x) => x.name === v.name) || {};
        return `<li><i class="fas fa-eye"></i> <b>${esc(v.name)}</b> <small>${esc(v.template)}${v.table ? " sur " + esc(v.table) : ""}</small>${missing(s)}${changed(s)} \u2014 ${esc(v.description || "")}
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
          return `<li><b>${esc(x.name)}</b> \u2014 <a href="/dysizz-flow/bloc/${encodeURIComponent(x.action_name)}">${esc(a && a.description ? a.description.split(" \u2014 ")[0] : x.action_name)}</a>${x.only_if ? ` <small>seulement si <code>${esc(x.only_if)}</code></small>` : ""}${x.next_step && x.next_step.includes("?") ? ` <small>ensuite : <code>${esc(x.next_step)}</code></small>` : ""}${code ? `<details><summary>code</summary><pre class="dzv-code">${esc(code)}</pre></details>` : ""}</li>`;
        }).join("");
        return `<details class="dzv-det"><summary><i class="fas fa-project-diagram"></i> <b>${esc(t.name)}</b>${missing(s)}${changed(s)} <small>${esc(t.when)}${t.table ? " sur " + esc(t.table) : ""} \xB7 ${t.steps.length} \xE9tapes</small> \u2014 ${esc(t.description || "")}
${s.id ? `<a class="dzv-edit" href="/actions/configure/${s.id}">ouvrir dans l'\xE9diteur de workflows</a>` : ""}</summary><ol class="dzv-wf">${steps}</ol></details>`;
      }).join("");
      const flow = (m.explain || []).map(([a, b]) => `<div class="dzv-flow"><div class="dzv-flow-q">${esc(a)}</div><i class="fas fa-arrow-right"></i><div class="dzv-flow-a">${esc(b)}</div></div>`).join("");
      const dependents = MODULES.filter((x) => (x.depends || []).includes(m.key)).map((x) => x.label);
      wrap(res, `Module ${m.label}`, `${flash(req)}
<p><a href="/dysizz-me">\u2190 Modules</a></p>
<div class="dzv-admin-top"><div><h1><i class="${esc(m.icon)}"></i> ${esc(m.label)} ${badge(st)}</h1><p>${esc(m.description)}</p>
${(m.depends || []).length ? `<p class="dzv-muted">S'appuie sur : ${esc(m.depends.join(", "))}.</p>` : ""}${dependents.length ? `<p class="dzv-muted">Utilis\xE9 par : ${esc(dependents.join(", "))}.</p>` : ""}</div>
<div class="dzv-mod-actions">${form(req, `/dysizz-me/install/${m.key}?back=m`, `<button class="btn btn-primary">${st.installed ? "Mettre \xE0 jour" : "Installer"}</button>`)}</div></div>
${m.setup ? `<div class="dzv-setup"><h2>\xC0 r\xE9gler</h2>${m.setup}</div>` : ""}
<h2>Comment \xE7a marche</h2><div class="dzv-flows">${flow}</div>
<h2>Tables</h2>${tables}
<h2>Vues</h2><ul class="dzv-ul">${views}</ul>
<h2>Pages</h2><ul class="dzv-ul">${pages}</ul>
<h2>Workflows <small class="dzv-muted">(faits de blocs dysizz-flow)</small></h2>${triggers || '<p class="dzv-muted">Aucun.</p>'}
<h2>Entretien</h2>
<div class="dzv-danger">
${form(req, `/dysizz-me/install/${m.key}?reset=1&back=m`, '<button class="btn btn-outline-warning btn-sm">R\xE9initialiser vues, pages et workflows</button>', { confirm: "Tes modifications des vues, pages et workflows de ce module seront remplac\xE9es par la version du module. Tes donn\xE9es ne bougent pas. Continuer ?" })}
${form(req, `/dysizz-me/uninstall/${m.key}`, '<button class="btn btn-outline-secondary btn-sm">Retirer (garder les donn\xE9es)</button>', { confirm: "Retirer les pages, vues et d\xE9clencheurs de ce module ? Les tables et leurs donn\xE9es restent." })}
${form(req, `/dysizz-me/uninstall/${m.key}?drop=1`, `<input name="confirm" placeholder="tape ${esc(m.key)}" class="form-control form-control-sm" style="width:140px;display:inline-block"> <button class="btn btn-outline-danger btn-sm">Tout supprimer, donn\xE9es comprises</button>`)}
</div>`);
    };
    var go = (res, url, key, msg, isErr) => res.redirect(`${url}${url.includes("?") ? "&" : "?"}${isErr ? "err" : "ok"}=${encodeURIComponent(msg)}`);
    var install = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const m = MODULES.find((x) => x.key === req.params.key);
      if (!m) return res.redirect("/dysizz-me");
      const back = req.query.back === "m" ? `/dysizz-me/m/${m.key}` : "/dysizz-me";
      try {
        const log = await installModule(m, MODULES, { reset: req.query.reset === "1" });
        go(res, back, m.key, `${m.label} : ${log.length ? log.slice(0, 25).join(" \xB7 ") + (log.length > 25 ? ` \xB7 (+${log.length - 25})` : "") : "d\xE9j\xE0 \xE0 jour"}`);
      } catch (e) {
        console.error("[dysizz-me]", e);
        go(res, back, m.key, `${m.label} : ${e.message}`, true);
      }
    };
    var installAll = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const done = [];
      try {
        for (const m of MODULES) {
          await installModule(m, MODULES);
          done.push(m.label);
        }
        go(res, "/dysizz-me", "", `Install\xE9s : ${done.join(", ")}. Ta page d'accueil : /page/accueil`);
      } catch (e) {
        console.error("[dysizz-me]", e);
        go(res, "/dysizz-me", "", `Arr\xEAt apr\xE8s ${done.join(", ") || "rien"} : ${e.message}`, true);
      }
    };
    var uninstall = async (req, res) => {
      if (!isAdmin(req)) return denied(res);
      const m = MODULES.find((x) => x.key === req.params.key);
      if (!m) return res.redirect("/dysizz-me");
      const drop = req.query.drop === "1";
      if (drop && (req.body || {}).confirm !== m.key) return go(res, `/dysizz-me/m/${m.key}`, m.key, `Tape \xAB ${m.key} \xBB pour confirmer la suppression des donn\xE9es`, true);
      try {
        const log = await uninstallModule(m, MODULES, { dropTables: drop });
        go(res, "/dysizz-me", m.key, `${m.label} retir\xE9 : ${log.join(" \xB7 ") || "rien \xE0 retirer"}`);
      } catch (e) {
        go(res, `/dysizz-me/m/${m.key}`, m.key, e.message, true);
      }
    };
    module2.exports = { battement, etat, settingsPage, settingsSave, settingsTest, home, detail, install, installAll, uninstall };
  }
});

// src/hub.js
var require_hub = __commonJS({
  "src/hub.js"(exports2, module2) {
    "use strict";
    var MODULES = require_modules();
    var COLORS = { accueil: "#0063b1", taches: "#00a300", objectifs: "#603cba", maison: "#8a5a2b", budget: "#1e7145", sante: "#b91d47", documents: "#3a4a5c", mails: "#2d89ef", emploi: "#e3a21a", veille: "#00aba9", videos: "#e51400", actus: "#7e3878", surveillance: "#da532c" };
    var SIZE = { accueil: "w", taches: "m", mails: "m", budget: "m" };
    var count = async (table, where) => {
      const T = require("@saltcorn/data/models/table");
      const t = T.findOne({ name: table });
      return t ? t.countRows(where) : null;
    };
    var day = (n = 0) => {
      const d = /* @__PURE__ */ new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + n);
      return d;
    };
    var LIVE = {
      taches: async () => {
        const n = await count("taches", { not: { statut: "fait" }, echeance: { lt: day(1) } });
        return n === null ? null : n ? { n, text: `${n} pour aujourd'hui` } : { text: "rien d'urgent" };
      },
      mails: async () => {
        const n = await count("mails", { lu: false });
        return n === null ? null : n ? { n, text: `${n} non lu${n > 1 ? "s" : ""}` } : { text: "tout est lu" };
      },
      surveillance: async () => {
        const n = await count("surveillance_sites", { actif: true, etat: "panne" });
        return n === null ? null : n ? { n, text: `${n} en panne` } : { text: "tout fonctionne" };
      },
      documents: async () => {
        const n = await count("documents", { expire_le: { gt: day(0), lt: day(60) } });
        return n ? { n, text: `${n} expire${n > 1 ? "nt" : ""} bient\xF4t` } : null;
      }
    };
    var dysizz_hub2 = async (req) => {
      const { getConfig } = require("@saltcorn/data/models/config");
      const cfg = await getConfig("dysizz_me", null) || await getConfig("dysizz_vie", null) || {};
      const installed = new Set(cfg.installed || []);
      const tiles = [];
      for (const m of MODULES) {
        if (!installed.has(m.key)) continue;
        for (const n of m.nav || []) tiles.push({
          group: "Mes applis",
          label: n.label,
          sub: m.key === "accueil" ? "Me \xB7 ta journ\xE9e en un coup d'\u0153il" : (m.description || "").split(/[.:]/)[0],
          url: `/page/${n.page}`,
          icon: n.icon,
          color: COLORS[m.key] || "#0063b1",
          size: SIZE[m.key] || "s",
          min_role: 80,
          live: LIVE[m.key]
        });
      }
      const admin2 = req.user && req.user.role_id === 1;
      if (admin2) tiles.push({ group: "Mes applis", label: "R\xE9glages de Me", sub: "modules, configuration", url: "/dysizz-me", icon: "fas fa-puzzle-piece", color: "#3a4a5c", size: tiles.length ? "s" : "w" });
      return tiles;
    };
    module2.exports = { dysizz_hub: dysizz_hub2 };
  }
});

// src/index.js
var { PLUGIN } = require_core();
var admin = require_admin();
var { dysizz_hub } = require_hub();
module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: PLUGIN,
  /* tuiles sur l'accueil Dysizz (/dysizz) */
  dysizz_hub,
  routes: [
    { url: "/dysizz-me", method: "get", callback: admin.home },
    { url: "/dysizz-me/m/:key", method: "get", callback: admin.detail },
    { url: "/dysizz-me/install/:key", method: "post", callback: admin.install },
    { url: "/dysizz-me/install-all", method: "post", callback: admin.installAll },
    { url: "/dysizz-me/uninstall/:key", method: "post", callback: admin.uninstall },
    { url: "/dysizz-me/etat", method: "get", callback: admin.etat },
    { url: "/dysizz-me/battement/:jeton", method: "get", callback: admin.battement },
    { url: "/dysizz-me/battement/:jeton", method: "post", noCsrf: true, callback: admin.battement },
    { url: "/dysizz-me/battement/", method: "post", noCsrf: true, callback: (req, res) => res.status(404).json({ ok: false }) },
    { url: "/dysizz-me/reglages/:key", method: "get", callback: admin.settingsPage },
    { url: "/dysizz-me/reglages/:key", method: "post", callback: admin.settingsSave },
    { url: "/dysizz-me/reglages/:key/tester", method: "post", callback: admin.settingsTest }
  ]
};
