/* Construit index.js depuis src/ (et docs/MODULES.md depuis les définitions). */
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = (...p) => path.join(root, ...p);
const pkg = JSON.parse(fs.readFileSync(r("package.json"), "utf8"));
await build({
  absWorkingDir: root, entryPoints: [r("src", "index.js")], outfile: r("index.js"), bundle: true, platform: "node", target: "node18", format: "cjs",
  external: ["@saltcorn/*"], define: { __DZV_VERSION__: JSON.stringify(pkg.version) },
  banner: { js: `/* dysizz-me ${pkg.version} — FICHIER GÉNÉRÉ par tools/build.mjs depuis src/. Ne pas modifier à la main. */` },
  legalComments: "none", logLevel: "warning",
});
execFileSync(process.execPath, [r("tools", "gen-docs.cjs")], { stdio: "inherit" });
console.log("index.js", Math.round(fs.statSync(r("index.js")).size / 1024), "Ko");
