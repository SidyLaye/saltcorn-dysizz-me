/* Raccourcis pour écrire les modules de façon lisible.
   Un module décrit : ses tables (champs), ses vues, ses pages, ses
   déclencheurs, ses données de départ, et une explication de son
   fonctionnement (affichée sur la page « Ce qu'il y a derrière »). */
"use strict";
const L = require("../lib/layout");

/* ---- champs ---- */
const s = (name, label, o = {}) => ({ name, label, type: "String", ...o });
const opts = (name, label, options, o = {}) => ({ name, label, type: "String", options, default: options[0], required: true, ...o });
const int = (name, label, o = {}) => ({ name, label, type: "Integer", ...o });
const num = (name, label, o = {}) => ({ name, label, type: "Float", ...o });
const bool = (name, label, o = {}) => ({ name, label, type: "Bool", default: false, ...o });
const date = (name, label, o = {}) => ({ name, label, type: "Date", ...o });
const file = (name, label, o = {}) => ({ name, label, type: "File", ...o });
const color = (name, label, o = {}) => ({ name, label, type: "Color", ...o });
const key = (name, label, table, summary, o = {}) => ({ name, label, type: `Key to ${table}`, summary, ...o });

/* ---- vues ---- */
const edit = (name, table, fields, o = {}) => ({ name, table, template: "Edit", title: o.title, width: o.width, description: o.description || `Formulaire ${table}`, config: L.editConfig(fields, o) });
const show = (name, table, layout, o = {}) => ({ name, table, template: "Show", title: o.title, width: o.width, description: o.description || "", config: L.showConfig(layout) });
const list = (name, table, cols, o = {}) => ({ name, table, template: "List", description: o.description || "", config: L.listConfig(cols, o) });
const feed = (name, table, showView, o = {}) => ({ name, table, template: "Feed", description: o.description || "", config: L.feedConfig(showView, o) });
const custom = (name, template, table, config, description) => ({ name, table, template, description, config });

/* petites infos en ligne sous un titre (séparées par des points) */
const spans = (...segs) => segs.map((x) => L.box("", L.O({ el: "span" }), x));
const meta = (...segs) => L.box("dzv-tile-meta", ...segs.map((x) => L.box("", L.O({ el: "span" }), x)));

/* date lisible en français quel que soit le réglage de langue de Saltcorn */
const dateFr = (f, o = {}) => L.formula(`${f} ? new Date(${f}).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short'${o.year ? ", year: 'numeric'" : ""} })${o.time ? ` + ' ' + new Date(${f}).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })` : ""} : ''`, { block: false, cls: o.cls || "" });

/* lien « modifier » qui ouvre une vue en fenêtre pour la ligne courante */
const modalLink = (viewName, label, icon = "fas fa-pen", cls = "btn btn-sm btn-link") => ({ type: "link", text: label, url: `\`javascript:ajax_modal('/view/${viewName}?id=\${id}')\``, isFormula: { url: true }, link_icon: icon, link_class: cls, link_style: "", link_size: "", block: false, textStyle: "" });

/* action JavaScript attachée à un bouton (code lisible dans la vue) */
const jsBtn = (label, codeStr, o = {}) => L.action("run_js_code", label, { ...o, cfg: { code: codeStr, run_where: "Server" } });

/* ---- workflows (blocs dysizz-flow) ----
   wf(nom, quand, table, description, [étapes], { étape: [réglages gardés] })
   st(nom, bloc, réglages, { only_if, next_step })
   Les étapes s'enchaînent dans l'ordre ; « only_if » saute une étape. */
const st = (name, action_name, configuration, o = {}) => ({ name, action_name, configuration, ...o });
const wf = (name, when, table, description, steps, keep) => ({ name, when, table, description, steps, keep: keep || {} });
const J = (o) => JSON.stringify(o);

/* ---- morceaux de page ---- */
const panel = (title, icon, content, o = {}) => L.box(`dzv-panel${o.cls ? " " + o.cls : ""}`,
  L.text(`<div class="dzv-panel-head"><h2><i class="${icon}"></i>${title}</h2>${o.actions ? `<div class="dzv-panel-actions">${o.actions}</div>` : ""}</div>`),
  ...(Array.isArray(content) ? content : [content]));
const grid = (cls, ...xs) => L.box(`dzv-grid ${cls}`, ...xs);
/* puces de filtre : liens qui changent l'état de la page (?champ=valeur) */
const chips = (items) => L.text(`<nav class="dzv-chips" data-dzv-chips>${items.map(([label, qs, icon]) => `<a href="?${encodeURI(qs)}" data-q="${qs}">${icon ? `<i class="${icon}"></i>` : ""}${label}</a>`).join("")}</nav>`);
const modalBtn = (label, url, icon = "fas fa-plus", cls = "dz-btn dz-btn-sm dz-btn-ghost") => `<a class="${cls}" href="javascript:ajax_modal('${url}')"><i class="${icon}"></i>${label}</a>`;

module.exports = { ...L, st, wf, J, spans, meta, modalLink, dateFr, s, opts, int, num, bool, date, file, color, key, edit, show, list, feed, custom, jsBtn, panel, grid, chips, modalBtn };
