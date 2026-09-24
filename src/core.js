/* dysizz-vie — constantes et petits utilitaires partagés */
"use strict";

const PLUGIN = "dysizz-vie";
const VERSION = typeof __DZV_VERSION__ !== "undefined" ? __DZV_VERSION__ : "dev";
const isAdmin = (req) => !!(req && req.user && req.user.role_id === 1);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const denied = (res) => res.status(403).send("Réservé aux administrateurs");
/* empreinte courte et stable d'un objet (pour savoir si tu as modifié une vue) */
const stable = (v) => (Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().filter((k) => k !== "rndid").map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v));
const hash = (v) => {
  const s = stable(v);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
};
/* texte brut depuis du HTML (flux RSS, mails) : jamais de balise stockée */
const plain = (html, max = 0) => {
  let s = String(html == null ? "" : html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch (e) { return " "; } })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch (e) { return " "; } })
    .replace(/[ \t\r\f\v]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  if (max && s.length > max) s = s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
  return s;
};
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "")) ? String(u).slice(0, 1000) : "");

module.exports = { PLUGIN, VERSION, isAdmin, esc, denied, hash, stable, plain, safeUrl };
