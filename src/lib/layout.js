/* dysizz-vie — petits constructeurs de layouts Saltcorn.
   Ils produisent exactement le JSON que le constructeur de vues de Saltcorn
   enregistre : une vue créée ici s'ouvre et se modifie normalement dans
   Saltcorn (Vues → la vue → Modifier). */
"use strict";

/* ---------- segments ---------- */
const field = (name, fieldview = "show", o = {}) => ({ type: "field", field_name: name, fieldview, textStyle: o.style || "", block: !!o.block, configuration: o.cfg || {}, ...(o.cls ? { class: o.cls } : {}) });
const join = (path, fieldview = "as_text", o = {}) => ({ type: "join_field", join_field: path, fieldview, textStyle: o.style || "", block: !!o.block, configuration: o.cfg || {} });
const text = (html, o = {}) => ({ type: "blank", contents: html, isHTML: o.html !== false, block: o.block !== false, textStyle: o.style || "", customClass: o.cls || "" });
/* texte calculé à partir de la ligne (expression JavaScript de Saltcorn) */
const formula = (expr, o = {}) => ({ type: "blank", contents: expr, isFormula: { text: true }, isHTML: !!o.html, block: o.block !== false, textStyle: o.style || "", customClass: o.cls || "" });
const box = (cls, ...children) => {
  let opts = {};
  if (children.length && children[0] && children[0].__opts) opts = children.shift();
  const c = { type: "container", customClass: cls, contents: children.length === 1 ? children[0] : { above: children }, htmlElement: opts.el || "div" };
  if (opts.url) { c.url = opts.url; if (opts.urlFormula) c.isFormula = { ...(c.isFormula || {}), url: true }; }
  if (opts.clsFormula) c.isFormula = { ...(c.isFormula || {}), customClass: true };
  if (opts.showIf) c.showIfFormula = opts.showIf;
  if (opts.id) { c.customId = opts.id; if (opts.id.includes("`")) c.isFormula = { ...(c.isFormula || {}), customId: true }; }
  if (opts.style) c.style = opts.style;
  return c;
};
const O = (o) => ({ __opts: true, ...o });
const row = (widths, ...cols) => ({ besides: cols, widths, breakpoints: widths.map(() => "md"), aligns: widths.map(() => "start"), style: {} });
const above = (...xs) => ({ above: xs });
const image = (urlExpr, o = {}) => ({ type: "image", srctype: "URL", url: urlExpr, isFormula: { url: true }, alt: o.alt || "", customClass: o.cls || "", style: o.style || {}, block: false });
/* lien dont le texte et l'adresse viennent de la ligne (formules) */
const link = (textExpr, urlExpr, o = {}) => ({ type: "link", text: textExpr, url: urlExpr, isFormula: { text: true, url: true }, target_blank: o.blank !== false, link_class: o.cls || "", link_style: "", link_size: "", block: !!o.block, textStyle: "" });
/* bouton d'action (enregistrer, supprimer, action personnalisée…) */
const action = (name, label, o = {}) => ({
  type: "action", action_name: name, action_label: label || " ", action_style: o.style || "btn-outline-secondary",
  action_size: o.size || "btn-sm", action_icon: o.icon || "", block: false, minRole: o.minRole || 1,
  confirm: !!o.confirm, configuration: o.cfg || {}, rndid: o.id || Math.random().toString(16).slice(2, 8), ...(o.cls ? { action_class: o.cls } : {}),
});
/* lien vers une autre vue (souvent ouverte en fenêtre) */
const vlink = (view, label, o = {}) => ({
  type: "view_link", view, view_label: label, in_modal: o.modal !== false, link_style: o.style || "", link_size: o.size || "",
  link_icon: o.icon || "", textStyle: "", block: false, minRole: o.minRole || 1, ...(o.cls ? { link_class: o.cls } : {}),
  ...(o.labelFormula ? { isFormula: { label: true } } : {}),
});
/* vue intégrée dans une page ou une autre vue */
const view = (name, o = {}) => ({ type: "view", view: name, name: o.id || name.replace(/[^a-z0-9]/gi, "").slice(0, 12), state: o.state || "shared", ...(o.fixed ? { configuration: o.fixed } : {}), ...(o.relation ? { relation: o.relation } : {}) });

/* ---------- colonnes déduites du layout (ce que Saltcorn attend dans configuration.columns) ---------- */
const columnsOf = (layout) => {
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

/* ---------- vues complètes ---------- */

/* Formulaire : une ligne par champ, libellé au-dessus (lisible sur mobile) */
const editConfig = (fields, o = {}) => {
  const rows = fields.map((f) => {
    const [name, label, fv = "edit"] = f;
    return box("dzv-field", text(`<label class="dzv-label" for="input${name}">${label}</label>`, { html: true }), field(name, fv));
  });
  const grid = box(o.cols === 1 ? "dzv-form" : "dzv-form dzv-form-2", ...rows);
  const btns = box("dzv-form-actions", action("Save", o.saveLabel || "Enregistrer", { style: "btn-primary", size: "", icon: "fas fa-check" }),
    ...(o.delete ? [action("Delete", "Supprimer", { style: "btn-outline-danger", size: "", icon: "fas fa-trash", confirm: true })] : []));
  const layout = above(grid, btns);
  return {
    layout, columns: columnsOf(layout), destination_type: "Back to referer", view_when_done: o.done || "",
    auto_save: false, split_paste: false, confirm_leave: false,
  };
};

/* Fiche (vue Show) avec un layout libre */
const showConfig = (layout) => ({ layout, columns: columnsOf(layout), page_title: "", page_title_formula: false });

/* Liste (vue List) : colonnes [libellé, segment] */
const listConfig = (cols, o = {}) => {
  const besides = cols.map(([label, seg]) => ({ header_label: label, contents: seg, ...(seg.__align ? { alignment: seg.__align } : {}) }));
  const layout = { list_columns: true, besides };
  return {
    layout, columns: columnsOf(besides.map((b) => b.contents)),
    default_state: {
      _order_field: o.order || "id", _descending: o.desc !== false, _rows_per_page: o.limit || 50, _hover_rows: true,
      _omit_header: !!o.noHeader, _responsive_collapse: false,
      _row_click_type: o.rowClick ? (o.rowClickType || "Popup") : "Nothing", ...(o.rowClick ? { _row_click_url_formula: o.rowClick } : {}),
      ...(o.include ? { include_fml: o.include } : {}), ...(o.state || {}),
    },
    ...(o.create ? { view_to_create: o.create, create_view_display: "Popup", create_view_label: o.createLabel || "Ajouter", create_view_location: "Top right", create_link_style: "btn btn-primary", create_link_size: "btn-sm" } : {}),
    hide_null_columns: false, transpose: false,
  };
};

/* Flux (vue Feed) : une fiche par ligne, en grille */
const feedConfig = (showView, o = {}) => ({
  show_view: showView, order_field: o.order || "id", descending: o.desc !== false, cols_sm: 1, cols_md: o.md || 2, cols_lg: o.lg || 3, cols_xl: o.xl || o.lg || 3,
  in_card: false, masonry_container: false, rows_per_page: o.limit || 24, hide_pagination: !!o.noPagination,
  ...(o.create ? { view_to_create: o.create, create_view_display: "Popup", create_view_label: o.createLabel || "Ajouter", create_view_location: "Top right", create_link_style: "btn btn-primary", create_link_size: "btn-sm" } : {}),
  ...(o.groupby ? { groupby: o.groupby } : {}),
  ...(o.include ? { include_fml: o.include } : {}), ...(o.exclude ? { exclusion_where: o.exclude } : {}),
  always_create_view: !!o.create, _omit_header: true, ...(o.empty ? { empty_view: "" } : {}),
});

module.exports = { link, field, join, text, formula, box, O, row, above, image, action, vlink, view, columnsOf, editConfig, showConfig, listConfig, feedConfig };
