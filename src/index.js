/* =====================================================================
   dysizz-vie — la solution « Ma vie » pour Saltcorn (point d'entrée)
   Elle ne contient que des définitions : tables, vues, pages et workflows.
   L'affichage vient de dysizz-ui (blocs UI, vues de données), les
   automatismes de dysizz-flow (blocs workflow). Les deux doivent être installés.
   index.js est GÉNÉRÉ depuis src/ par tools/build.mjs.
   ===================================================================== */
"use strict";
const { PLUGIN } = require("./core");
const admin = require("./admin");

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: PLUGIN,
  routes: [
    { url: "/dysizz-vie", method: "get", callback: admin.home },
    { url: "/dysizz-vie/m/:key", method: "get", callback: admin.detail },
    { url: "/dysizz-vie/install/:key", method: "post", callback: admin.install },
    { url: "/dysizz-vie/install-all", method: "post", callback: admin.installAll },
    { url: "/dysizz-vie/uninstall/:key", method: "post", callback: admin.uninstall },
  ],
};
