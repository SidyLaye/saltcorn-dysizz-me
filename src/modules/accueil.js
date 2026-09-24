"use strict";
const K = require("./_kit");

/* les tuiles et la frise ignorent d'elles-mêmes les modules non installés */
const TILES = JSON.stringify([
  { label: "Tâches pour aujourd'hui", icon: "fas fa-check-circle", table: "taches", stat: "count", where: { not: { statut: "fait" } }, period: { field: "echeance", range: "today" }, href: "/page/taches", tone: "warning", optional: true },
  { label: "En retard", icon: "fas fa-fire", table: "taches", stat: "count", where: { not: { statut: "fait" } }, period: { field: "echeance", range: "overdue" }, href: "/page/taches", tone: "danger", optional: true },
  { label: "Mails à traiter", icon: "fas fa-envelope", table: "mails", stat: "count", where: { or: [{ statut: "à traiter" }, { lu: false, statut: "nouveau" }] }, href: "/page/mails", tone: "info", optional: true },
  { id: "dep", label: "Dépensé ce mois", icon: "fas fa-wallet", table: "operations", stat: "sum", field: "montant", where: { type: "dépense" }, period: { field: "date", range: "month" }, format: "eur", href: "/page/budget", optional: true },
  { label: "Nouvelles offres", icon: "fas fa-user-tie", table: "offres_emploi", stat: "count", where: { statut: "nouvelle" }, href: "/page/emploi", optional: true },
  { label: "Vidéos pas vues", icon: "fab fa-youtube", table: "veille_articles", stat: "count", where: { type: "vidéo", lu: false }, period: { field: "date", range: "last7" }, href: "/page/videos", optional: true },
], null, 1);

const SOURCES = JSON.stringify([
  { table: "taches", date: "echeance", titre: "titre", icon: "fas fa-check-circle", where: { not: { statut: "fait" } }, vue: "tache_modifier", retard: true },
  { table: "rdv_sante", date: "date", titre: "motif", icon: "fas fa-stethoscope", where: { fait: false }, vue: "rdv_modifier", tone: "info" },
  { table: "documents", date: "expire_le", titre: "titre", icon: "fas fa-folder-open", vue: "document_modifier", libelle: "expire" },
  { table: "candidatures", date: "relance_le", titre: "entreprise", sous_titre: "poste", icon: "fas fa-paper-plane", where: { statut: { in: ["envoyée", "relance"] } }, vue: "candidature_modifier", libelle: "relance", retard: true },
  { table: "objectifs", date: "echeance", titre: "titre", icon: "fas fa-bullseye", where: { statut: "en cours" }, vue: "objectif_modifier", libelle: "objectif" },
], null, 1);

module.exports = {
  key: "accueil",
  label: "Accueil",
  icon: "fas fa-sun",
  group: "Aujourd'hui",
  description: "Ta page du matin : chiffres clés de tous les modules, ce qui t'attend dans les 7 jours, tâches du jour, habitudes, mails à traiter, dernières vidéos et actus.",
  depends: [],
  tables: [],
  views: [
    K.custom("accueil_chiffres", "DZ Indicateurs", null, { tuiles: TILES, colonnes: 3 }, "Les chiffres du jour, tous modules confondus"),
    K.custom("accueil_semaine", "DZ À venir", null, { sources: SOURCES, jours: 7, texte_vide: "Rien de prévu cette semaine. Profites-en." }, "Échéances, rendez-vous, expirations et relances des 7 jours"),
  ],
  pages: [{
    name: "accueil", title: "Accueil",
    /* contenu recalculé quand tu installes ou retires un module */
    content: (installed) => {
      const has = (k) => installed.has(k);
      const right = [
        has("taches") && K.panel("Aujourd'hui", "fas fa-check-circle", K.view("taches_aujourdhui"), { actions: K.modalBtn("Tâche", "/view/tache_modifier") }),
        has("objectifs") && K.panel("Habitudes", "fas fa-seedling", K.view("habitudes_jour")),
      ].filter(Boolean);
      const bottom = [
        has("mails") && K.panel("Boîte mail", "fas fa-inbox", K.view("mails_boite", { id: "accmails" }), { cls: "dzv-mails", actions: '<a class="dz-btn dz-btn-sm dz-btn-ghost" href="/page/mails">Tout voir</a>' }),
        has("videos") && K.panel("Dernières vidéos", "fab fa-youtube", K.view("videos_grille", { id: "accvid" }), { actions: '<a class="dz-btn dz-btn-sm dz-btn-ghost" href="/page/videos">Tout voir</a>' }),
        has("actus") && K.grid("dzv-grid-2", K.panel("France", "fas fa-flag", K.view("actus_france", { id: "accfr" })), K.panel("Sénégal", "fas fa-globe-africa", K.view("actus_senegal", { id: "accsn" }))),
      ].filter(Boolean);
      return [
        K.text('<div class="dzv-hero"><div><h2 data-dzv-hello>Bonjour</h2><p data-dzv-date></p></div><div class="dzv-top-actions"><button class="dz-btn dz-btn-ghost dz-btn-sm" type="button" data-dz-cmdk-open><i class="fas fa-bolt"></i> Créer ou aller à… <span class="dz-kbd">Ctrl K</span></button></div></div>'),
        K.view("accueil_chiffres"),
        right.length ? K.grid("dzv-grid-main", K.panel("Cette semaine", "far fa-calendar", K.view("accueil_semaine")), K.box("dzv-grid", ...right)) : K.panel("Cette semaine", "far fa-calendar", K.view("accueil_semaine")),
        ...bottom,
        ...(installed.size <= 1 ? [K.text('<div class="dzv-panel dzv-empty"><i class="fas fa-puzzle-piece"></i><p>Installe des modules (tâches, budget, mails, veille…) depuis <a href="/dysizz-vie">la page Modules</a> : ils apparaîtront ici.</p></div>')] : []),
      ];
    },
  }],
  nav: [{ page: "accueil", label: "Accueil", icon: "fas fa-sun", group: "Aujourd'hui", order: 1, mobile: true, keywords: "dashboard tableau de bord aujourd'hui" }],
  explain: [
    ["Les chiffres du haut", "Vue « accueil_chiffres » (DZ Indicateurs) : chaque tuile compte ou additionne dans la table d'un module. Une tuile dont le module n'est pas installé est cachée."],
    ["Cette semaine", "Vue « accueil_semaine » (DZ À venir) : rassemble échéances de tâches, rendez-vous, expirations de documents, relances de candidatures et objectifs."],
    ["Le reste de la page", "Des vues des autres modules. La page est recalculée quand tu installes ou retires un module (sauf si tu l'as modifiée toi-même)."],
  ],
};
