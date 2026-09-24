/* =====================================================================
   dysizz-me — la solution « Me » pour Saltcorn (point d'entrée)
   Elle ne contient que des définitions : tables, vues, pages et workflows.
   L'affichage vient de dysizz-ui (blocs UI, vues de données), les
   automatismes de dysizz-flow (blocs workflow). Les deux doivent être installés.
   index.js est GÉNÉRÉ depuis src/ par tools/build.mjs.
   ===================================================================== */
"use strict";
const { PLUGIN } = require("./core");
const admin = require("./admin");
const { dysizz_hub } = require("./hub");

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
    { url: "/dysizz-me/reglages/:key", method: "get", callback: admin.settingsPage },
    { url: "/dysizz-me/reglages/:key", method: "post", callback: admin.settingsSave },
    { url: "/dysizz-me/reglages/:key/tester", method: "post", callback: admin.settingsTest },
  ],
};
