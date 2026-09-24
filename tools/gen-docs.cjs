/* Génère docs/MODULES.md depuis les définitions des modules (src/modules).
   La doc ne peut donc pas être en retard sur le code. */
const fs = require("fs");
const path = require("path");
const Module = require("module");
const orig = Module._load;
Module._load = function (req, ...rest) { if (req.startsWith("@saltcorn/")) return class {}; return orig.call(this, req, ...rest); };
const MODULES = require("../src/modules");
const strip = (h) => String(h || "").replace(/<li>/g, "\n- ").replace(/<\/?(ol|ul|p|b|code|a)[^>]*>/g, (m) => (m.startsWith("<code") || m === "</code>" ? "`" : "")).replace(/<[^>]+>/g, "").trim();
let md = `# Les modules\n\n> Fichier généré par \`tools/gen-docs.cjs\` depuis \`src/modules/\`. Ne pas modifier à la main.\n\n`;
md += MODULES.map((m) => `- [${m.label}](#${m.key}) — ${m.description}`).join("\n") + "\n";
for (const m of MODULES) {
  md += `\n---\n\n## <a id="${m.key}"></a>${m.label}\n\n${m.description}\n\n`;
  if ((m.depends || []).length) md += `S'appuie sur : ${m.depends.join(", ")}.\n\n`;
  if (m.setup) md += `### À régler\n\n${strip(m.setup)}\n\n`;
  md += `### Comment ça marche\n\n| Quand | Ce qui se passe |\n|---|---|\n${(m.explain || []).map(([a, b]) => `| ${a} | ${b} |`).join("\n")}\n\n`;
  for (const t of m.tables || []) {
    md += `### Table \`${t.name}\`\n\n${t.description || ""}\n\n| Champ | Type | Détail |\n|---|---|---|\n`;
    md += t.fields.map((f) => `| \`${f.name}\` ${f.label} | ${f.type}${f.required ? ", obligatoire" : ""}${f.unique ? ", unique" : ""} | ${f.options ? "choix : " + f.options.join(", ") : ""}${f.description || ""} |`).join("\n") + "\n\n";
  }
  if ((m.views || []).length) md += `### Vues\n\n| Vue | Type | Table | Rôle |\n|---|---|---|---|\n${m.views.map((v) => `| \`${v.name}\` | ${v.template} | ${v.table || "—"} | ${v.description || ""} |`).join("\n")}\n\n`;
  if ((m.pages || []).length) md += `### Pages\n\n${m.pages.map((p) => `- \`/page/${p.name}\` — ${p.title}`).join("\n")}\n\n`;
  if ((m.triggers || []).length) {
    md += `### Workflows (blocs dysizz-flow)\n\n`;
    for (const t of m.triggers) {
      md += `#### \`${t.name}\` — ${t.when}${t.table ? " sur " + t.table : ""}\n\n${t.description}.\n\n| Étape | Bloc | Condition |\n|---|---|---|\n`;
      md += t.steps.map((x) => `| ${x.name} | \`${x.action_name}\` | ${x.only_if ? "`" + x.only_if + "`" : ""}${x.next_step && x.next_step.includes("?") ? " suite : `" + x.next_step + "`" : ""} |`).join("\n") + "\n\n";
      for (const x of t.steps) if (x.configuration.code) md += `Code de l'étape \`${x.name}\` :\n\n\`\`\`js\n${x.configuration.code}\n\`\`\`\n\n`;
    }
  }
}
fs.writeFileSync(path.join(__dirname, "..", "docs", "MODULES.md"), md);
console.log("docs/MODULES.md", Math.round(md.length / 1024), "Ko");
