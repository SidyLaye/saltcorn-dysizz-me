/* Charge index.js (le fichier livré) avec des doublures de @saltcorn/*. */
const Module = require("module");
const orig = Module._load;
Module._load = function (req, ...rest) { if (req.startsWith("@saltcorn/")) return class { constructor(o) { Object.assign(this, o); } }; return orig.call(this, req, ...rest); };
const assert = require("assert");
const plugin = require("../index.js");
assert.strictEqual(plugin.plugin_name, "dysizz-me");
assert(plugin.routes.some((r) => r.url === "/dysizz-me"));
assert(!plugin.viewtemplates && !plugin.actions, "la solution ne contient que des définitions");
console.log("plugin OK :", plugin.routes.length, "routes");
