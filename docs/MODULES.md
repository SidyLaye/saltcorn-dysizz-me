# Les modules

> Fichier généré par `tools/gen-docs.cjs` depuis `src/modules/`. Ne pas modifier à la main.

- [Accueil](#accueil) — Ta page du matin : chiffres clés de tous les modules, ce qui t'attend dans les 7 jours, tâches du jour, habitudes, mails à traiter, dernières vidéos et actus.
- [Tâches](#taches) — Tâches pro, maison et perso en tableau (à faire, en cours, en attente, fait), projets, tâches qui se répètent, rappel du matin.
- [Objectifs & habitudes](#objectifs) — Objectifs chiffrés par horizon (semaine → long terme) avec progression, et habitudes à cocher chaque jour avec compteur de la semaine.
- [Maison](#maison) — Les tâches de la maison (ménage, factures, réparations) en tableau, les routines qui se répètent, et la liste de courses par rayon.
- [Budget](#budget) — Comptes et soldes, dépenses et revenus saisis à la main en 10 secondes, budget mensuel par catégorie avec barres qui virent au rouge quand ça dépasse.
- [Santé](#sante) — Rendez-vous médicaux avec rappel la veille, traitements en cours, mesures (poids, tension, sommeil, pas…) et carnet des soignants.
- [Documents](#documents) — Coffre de documents rangés par catégorie (identité, impôts, logement…), fichiers joints, dates d'expiration avec rappel et tâche de renouvellement automatique.
- [Mails pro](#mails) — Ta boîte pro (OVH ou tout serveur IMAP) relevée toutes les 5 minutes, en lecture seule : non lus, importants, à traiter, règles automatiques, mail → tâche en un clic.
- [Emploi](#emploi) — Offres d'emploi en France (API France Travail, gratuite) selon tes recherches enregistrées, tri rapide (intéressante / écarter / postuler) et suivi des candidatures avec relance automatique.
- [Veille tech](#veille) — Les nouveautés dev, cyber (dont alertes CERT-FR), IA, DevOps, MLOps, cloud, réseau et systèmes, lues toutes les heures depuis des flux RSS que tu choisis. Lu, favori, à lire plus tard.
- [Vidéos](#videos) — Les dernières vidéos des chaînes YouTube dev, cyber, IA, DevOps/MLOps, réseau et systèmes que tu suis, regardées directement dans l'appli (sans pub de suivi, lecteur youtube-nocookie).
- [Actus France & Sénégal](#actus) — Les titres du jour en France et au Sénégal côte à côte (franceinfo, Le Monde, France 24, Seneweb, Dakaractu, APS, Le Soleil, RFI Afrique…), mis à jour toutes les heures.

---

## <a id="accueil"></a>Accueil

Ta page du matin : chiffres clés de tous les modules, ce qui t'attend dans les 7 jours, tâches du jour, habitudes, mails à traiter, dernières vidéos et actus.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Les chiffres du haut | Vue « accueil_chiffres » (DZ Indicateurs) : chaque tuile compte ou additionne dans la table d'un module. Une tuile dont le module n'est pas installé est cachée. |
| Cette semaine | Vue « accueil_semaine » (DZ À venir) : rassemble échéances de tâches, rendez-vous, expirations de documents, relances de candidatures et objectifs. |
| Le reste de la page | Des vues des autres modules. La page est recalculée quand tu installes ou retires un module (sauf si tu l'as modifiée toi-même). |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `accueil_chiffres` | DZ Indicateurs | — | Les chiffres du jour, tous modules confondus |
| `accueil_semaine` | DZ À venir | — | Échéances, rendez-vous, expirations et relances des 7 jours |

### Pages

- `/page/accueil` — Accueil


---

## <a id="taches"></a>Tâches

Tâches pro, maison et perso en tableau (à faire, en cours, en attente, fait), projets, tâches qui se répètent, rappel du matin.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Tu ajoutes une tâche | Formulaire « tache_modifier » (bouton + ou Ctrl K). Elle arrive dans la colonne de son statut. |
| Tu glisses une carte | La vue « taches_tableau » (type DZ Tableau) change le champ statut de la ligne. |
| Une tâche passe à « fait » | Le workflow « taches_cycle » (à chaque modification) : bloc Dates → Table : modifier (fait_le) → Code (prochaine échéance) → Table : ajouter (la suivante). |
| Chaque matin | Le workflow « taches_rappel » : Dates → Table : compter → Notifier (seulement s'il y en a). |

### Table `projets`

Un projet regroupe des tâches

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `domaine` Domaine | String, obligatoire | choix : Pro, Maison, Perso, Administratif, Finances, Santé, Apprentissage |
| `statut` Statut | String, obligatoire | choix : actif, en pause, terminé |
| `echeance` Échéance | Date |  |
| `couleur` Couleur | Color |  |
| `description` Description | String |  |

### Table `taches`

Toutes tes tâches, quel que soit le domaine

| Champ | Type | Détail |
|---|---|---|
| `titre` Titre | String, obligatoire |  |
| `domaine` Domaine | String, obligatoire | choix : Pro, Maison, Perso, Administratif, Finances, Santé, Apprentissage |
| `projet` Projet | Key to projets |  |
| `statut` Statut | String, obligatoire | choix : à faire, en cours, en attente, fait |
| `priorite` Priorité | String, obligatoire | choix : normale, haute, urgente, basse |
| `echeance` Échéance | Date |  |
| `recurrence` Se répète | String, obligatoire | choix : aucune, chaque jour, chaque semaine, chaque mois, chaque année |
| `notes` Notes | String |  |
| `lien` Lien | String |  |
| `source` Origine | String | manuel, mail, document… |
| `fait_le` Fait le | Date |  |
| `suivante_creee` Occurrence suivante créée | Bool |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `tache_modifier` | Edit | taches | Ajouter ou modifier une tâche (s'ouvre en fenêtre) |
| `taches_tableau` | DZ Tableau | taches | Tableau des tâches par statut, glisser-déposer |
| `taches_aujourdhui` | List | taches | Tâches du jour et en retard |
| `projet_modifier` | Edit | projets | Formulaire projets |
| `projet_carte` | Show | projets |  |
| `projets_grille` | Feed | projets |  |

### Pages

- `/page/taches` — Tâches

### Workflows (blocs dysizz-flow)

#### `taches_cycle` — Update sur taches

Date de fin + tâche suivante si elle se répète.

| Étape | Bloc | Condition |
|---|---|---|
| maintenant | `dzf_dates` |  |
| noter_fin | `dzf_table_modifier` | `statut == "fait" && !fait_le` |
| rouvrir | `dzf_table_modifier` | `statut != "fait" && !!fait_le` |
| prochaine_date | `dzf_code` |  |
| creer_suivante | `dzf_table_ajouter` | `!!prochaine` |
| marquer | `dzf_table_modifier` | `!!prochaine` |

Code de l'étape `prochaine_date` :

```js
// Calcule la prochaine échéance si la tâche est faite et se répète.
if (row.statut !== "fait" || !row.recurrence || row.recurrence === "aucune" || row.suivante_creee) return null;
const d = row.echeance ? new Date(row.echeance) : new Date();
if (row.recurrence === "chaque jour") d.setDate(d.getDate() + 1);
if (row.recurrence === "chaque semaine") d.setDate(d.getDate() + 7);
if (row.recurrence === "chaque mois") d.setMonth(d.getMonth() + 1);
if (row.recurrence === "chaque année") d.setFullYear(d.getFullYear() + 1);
return d.toISOString();
```

#### `taches_rappel` — Daily

Notification du matin (tâches du jour et en retard).

| Étape | Bloc | Condition |
|---|---|---|
| demain | `dzf_dates` |  |
| compter | `dzf_table_compter` |  |
| notifier | `dzf_notifier` | `total > 0` |


---

## <a id="objectifs"></a>Objectifs & habitudes

Objectifs chiffrés par horizon (semaine → long terme) avec progression, et habitudes à cocher chaque jour avec compteur de la semaine.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Tu crées un objectif | Table « objectifs ». La barre de progression est un texte calculé (formule) dans la vue « objectif_carte » : actuel / cible. |
| Tu coches une habitude | Le bouton « Fait » (action JavaScript dans la vue « habitude_ligne ») ajoute une ligne dans « habitudes_suivi » et recompte la semaine. |
| Chaque nuit | Le workflow « habitudes_minuit » (blocs Table : modifier + Vérifier) remet « fait aujourd'hui » à zéro ; le lundi, il remet aussi le compteur de la semaine. |

### Table `objectifs`

Ce que tu veux atteindre

| Champ | Type | Détail |
|---|---|---|
| `titre` Objectif | String, obligatoire |  |
| `domaine` Domaine | String, obligatoire | choix : Pro, Maison, Perso, Administratif, Finances, Santé, Apprentissage |
| `horizon` Horizon | String, obligatoire | choix : ce mois, cette semaine, ce trimestre, cette année, long terme |
| `cible` Cible (nombre) | Float |  |
| `actuel` Où j'en suis | Float |  |
| `unite` Unité | String | €, km, livres, heures… |
| `echeance` Échéance | Date |  |
| `statut` Statut | String, obligatoire | choix : en cours, atteint, abandonné |
| `pourquoi` Pourquoi c'est important | String |  |

### Table `habitudes`

Ce que tu veux faire régulièrement

| Champ | Type | Détail |
|---|---|---|
| `nom` Habitude | String, obligatoire |  |
| `icone` Icône | String | Nom d'icône Font Awesome, ex. fas fa-running |
| `par_semaine` Fois par semaine | Integer |  |
| `active` Active | Bool |  |
| `objectif` Objectif lié | Key to objectifs |  |
| `semaine` Faites cette semaine | Integer |  |
| `fait_aujourdhui` Fait aujourd'hui | Bool |  |

### Table `habitudes_suivi`

Une ligne par habitude cochée et par jour

| Champ | Type | Détail |
|---|---|---|
| `habitude` Habitude | Key to habitudes, obligatoire |  |
| `jour` Jour | Date, obligatoire |  |
| `fait` Fait | Bool |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `objectif_modifier` | Edit | objectifs | Formulaire objectifs |
| `objectif_carte` | Show | objectifs |  |
| `objectifs_grille` | Feed | objectifs |  |
| `habitude_modifier` | Edit | habitudes | Formulaire habitudes |
| `habitude_ligne` | Show | habitudes |  |
| `habitudes_jour` | Feed | habitudes |  |

### Pages

- `/page/objectifs` — Objectifs & habitudes

### Workflows (blocs dysizz-flow)

#### `habitudes_minuit` — Daily

Remise à zéro quotidienne (et hebdomadaire le lundi).

| Étape | Bloc | Condition |
|---|---|---|
| remise | `dzf_table_modifier` |  |
| lundi | `dzf_verifier` |  |
| semaine | `dzf_table_modifier` | `lundi` |


---

## <a id="maison"></a>Maison

Les tâches de la maison (ménage, factures, réparations) en tableau, les routines qui se répètent, et la liste de courses par rayon.

S'appuie sur : taches.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Tâches de la maison | Ce sont les tâches du module Tâches avec domaine = Maison : la page intègre la vue « taches_tableau » avec ce filtre fixé. |
| Routines (poubelles, ménage…) | Une tâche avec « Se répète » : quand tu la passes à fait, la suivante est créée (déclencheur « taches_cycle »). |
| Courses | Table « courses ». La case à cocher est une action JavaScript de la vue « courses_liste » ; le bouton du bas supprime les articles pris. |

### Table `courses`

Liste de courses

| Champ | Type | Détail |
|---|---|---|
| `article` Article | String, obligatoire |  |
| `quantite` Quantité | String |  |
| `rayon` Rayon | String, obligatoire | choix : épicerie, fruits & légumes, frais, surgelés, boissons, hygiène, maison, autre |
| `pris` Pris | Bool |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `course_modifier` | Edit | courses | Formulaire courses |
| `courses_liste` | List | courses | Liste de courses |

### Pages

- `/page/maison` — Maison


---

## <a id="budget"></a>Budget

Comptes et soldes, dépenses et revenus saisis à la main en 10 secondes, budget mensuel par catégorie avec barres qui virent au rouge quand ça dépasse.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Tu ajoutes une dépense | Formulaire « operation_modifier ». Montant toujours positif ; le type (dépense, revenu, virement) donne le sens. |
| Juste après | Les workflows « operations_soldes_insert / update / delete » (bloc Code) recalculent le solde de chaque compte (champ comptes.solde). |
| Le budget du mois | La vue « budget_mois » (DZ Répartition) additionne les dépenses du mois par catégorie et les compare au champ budget_mensuel. |
| Les chiffres du haut | La vue « budget_chiffres » (DZ Indicateurs) : sommes filtrées par type et par période ; « Reste » = budget prévu − dépenses. |

### Table `comptes`

Tes comptes (banque, espèces, épargne, mobile money)

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `type` Type | String, obligatoire | choix : courant, épargne, espèces, carte, mobile money |
| `devise` Devise | String, obligatoire | choix : EUR, XOF |
| `solde_initial` Solde de départ | Float |  |
| `solde` Solde (calculé) | Float | Mis à jour par les déclencheurs operations_soldes_* |
| `couleur` Couleur | Color |  |
| `actif` Actif | Bool |  |

### Table `budget_categories`

Catégories de dépenses et de revenus, avec budget mensuel

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `type` Type | String, obligatoire | choix : dépense, revenu |
| `icone` Icône | String | Nom d'icône Font Awesome, ex. fas fa-home |
| `couleur` Couleur | Color |  |
| `budget_mensuel` Budget par mois | Float |  |

### Table `operations`

Chaque dépense, revenu ou virement

| Champ | Type | Détail |
|---|---|---|
| `date` Date | Date, obligatoire |  |
| `libelle` Libellé | String, obligatoire |  |
| `montant` Montant | Float, obligatoire | Toujours positif : le type dit si c'est une dépense ou un revenu |
| `type` Type | String, obligatoire | choix : dépense, revenu, virement |
| `categorie` Catégorie | Key to budget_categories |  |
| `compte` Compte | Key to comptes |  |
| `vers_compte` Vers le compte (virement) | Key to comptes |  |
| `note` Note | String |  |
| `pointee` Pointée sur le relevé | Bool |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `operation_modifier` | Edit | operations | Formulaire operations |
| `operations_liste` | List | operations | Dernières opérations |
| `budget_chiffres` | DZ Indicateurs | — | Revenus, dépenses, budget et reste du mois |
| `budget_mois` | DZ Répartition | operations | Dépenses du mois par catégorie, comparées au budget |
| `compte_modifier` | Edit | comptes | Formulaire comptes |
| `compte_carte` | Show | comptes |  |
| `comptes_grille` | Feed | comptes |  |
| `categorie_modifier` | Edit | budget_categories | Formulaire budget_categories |
| `categories_liste` | List | budget_categories |  |

### Pages

- `/page/budget` — Budget

### Workflows (blocs dysizz-flow)

#### `operations_soldes_insert` — Insert sur operations

Recalcule les soldes des comptes (ajout d'une opération).

| Étape | Bloc | Condition |
|---|---|---|
| soldes | `dzf_code` |  |

Code de l'étape `soldes` :

```js
// Recalcule le solde de chaque compte :
// solde = solde de départ + revenus - dépenses - virements sortants + virements entrants.
const Comptes = Table.findOne({ name: "comptes" });
const Ops = Table.findOne({ name: "operations" });
const somme = async (where) => Number(((await Ops.aggregationQuery({ s: { field: "montant", aggregate: "Sum" } }, { where })) || {}).s || 0);
for (const c of await Comptes.getRows({})) {
  const solde = (c.solde_initial || 0)
    + await somme({ compte: c.id, type: "revenu" })
    - await somme({ compte: c.id, type: "dépense" })
    - await somme({ compte: c.id, type: "virement" })
    + await somme({ vers_compte: c.id, type: "virement" });
  if (Math.abs((c.solde || 0) - solde) > 0.001) await Comptes.updateRow({ solde }, c.id, undefined, true);
}
```

#### `operations_soldes_update` — Update sur operations

Recalcule les soldes des comptes (modification d'une opération).

| Étape | Bloc | Condition |
|---|---|---|
| soldes | `dzf_code` |  |

Code de l'étape `soldes` :

```js
// Recalcule le solde de chaque compte :
// solde = solde de départ + revenus - dépenses - virements sortants + virements entrants.
const Comptes = Table.findOne({ name: "comptes" });
const Ops = Table.findOne({ name: "operations" });
const somme = async (where) => Number(((await Ops.aggregationQuery({ s: { field: "montant", aggregate: "Sum" } }, { where })) || {}).s || 0);
for (const c of await Comptes.getRows({})) {
  const solde = (c.solde_initial || 0)
    + await somme({ compte: c.id, type: "revenu" })
    - await somme({ compte: c.id, type: "dépense" })
    - await somme({ compte: c.id, type: "virement" })
    + await somme({ vers_compte: c.id, type: "virement" });
  if (Math.abs((c.solde || 0) - solde) > 0.001) await Comptes.updateRow({ solde }, c.id, undefined, true);
}
```

#### `operations_soldes_delete` — Delete sur operations

Recalcule les soldes des comptes (suppression d'une opération).

| Étape | Bloc | Condition |
|---|---|---|
| soldes | `dzf_code` |  |

Code de l'étape `soldes` :

```js
// Recalcule le solde de chaque compte :
// solde = solde de départ + revenus - dépenses - virements sortants + virements entrants.
const Comptes = Table.findOne({ name: "comptes" });
const Ops = Table.findOne({ name: "operations" });
const somme = async (where) => Number(((await Ops.aggregationQuery({ s: { field: "montant", aggregate: "Sum" } }, { where })) || {}).s || 0);
for (const c of await Comptes.getRows({})) {
  const solde = (c.solde_initial || 0)
    + await somme({ compte: c.id, type: "revenu" })
    - await somme({ compte: c.id, type: "dépense" })
    - await somme({ compte: c.id, type: "virement" })
    + await somme({ vers_compte: c.id, type: "virement" });
  if (Math.abs((c.solde || 0) - solde) > 0.001) await Comptes.updateRow({ solde }, c.id, undefined, true);
}
```


---

## <a id="sante"></a>Santé

Rendez-vous médicaux avec rappel la veille, traitements en cours, mesures (poids, tension, sommeil, pas…) et carnet des soignants.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Tu notes un rendez-vous | Table « rdv_sante ». Il apparaît dans la page Santé et dans « Cette semaine » de l'accueil. |
| La veille au matin | Le workflow « sante_rappel » (Dates → Table : chercher → Texte → Notifier) t'envoie une notification, et une autre quand un traitement se termine dans la semaine. |
| Tes mesures | Table « mesures_sante ». Les moyennes du haut sont calculées par la vue « sante_chiffres » (DZ Indicateurs). |

### Table `sante_contacts`

Médecins, dentiste, pharmacie…

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `specialite` Spécialité | String |  |
| `telephone` Téléphone | String |  |
| `adresse` Adresse | String |  |
| `notes` Notes | String |  |

### Table `rdv_sante`

Rendez-vous médicaux

| Champ | Type | Détail |
|---|---|---|
| `date` Date et heure | Date, obligatoire |  |
| `motif` Motif | String, obligatoire |  |
| `contact` Avec | Key to sante_contacts |  |
| `lieu` Lieu | String |  |
| `notes` Notes / compte rendu | String |  |
| `fait` Passé | Bool |  |

### Table `traitements`

Médicaments et soins en cours

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `dosage` Dosage | String |  |
| `moments` Quand | String, obligatoire | choix : matin, midi, soir, matin et soir, matin, midi et soir, au besoin |
| `debut` Début | Date |  |
| `fin` Fin | Date |  |
| `actif` En cours | Bool |  |
| `notes` Notes | String |  |

### Table `mesures_sante`

Suivi chiffré (poids, tension, sommeil…)

| Champ | Type | Détail |
|---|---|---|
| `date` Date | Date, obligatoire |  |
| `type` Mesure | String, obligatoire | choix : poids (kg), tension, sommeil (h), pas, fréquence cardiaque, glycémie, humeur (1 à 5), autre |
| `valeur` Valeur | Float, obligatoire |  |
| `valeur2` 2e valeur | Float | ex. tension basse |
| `note` Note | String |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `rdv_modifier` | Edit | rdv_sante | Formulaire rdv_sante |
| `rdv_a_venir` | List | rdv_sante |  |
| `traitement_modifier` | Edit | traitements | Formulaire traitements |
| `traitements_en_cours` | List | traitements |  |
| `mesure_modifier` | Edit | mesures_sante | Formulaire mesures_sante |
| `mesures_recentes` | List | mesures_sante |  |
| `soignant_modifier` | Edit | sante_contacts | Formulaire sante_contacts |
| `soignants_liste` | List | sante_contacts |  |
| `sante_chiffres` | DZ Indicateurs | — | Chiffres santé |

### Pages

- `/page/sante` — Santé

### Workflows (blocs dysizz-flow)

#### `sante_rappel` — Daily

Notification la veille d'un rendez-vous et avant la fin d'un traitement.

| Étape | Bloc | Condition |
|---|---|---|
| aujourdhui | `dzf_dates` |  |
| demain | `dzf_dates` |  |
| apres_demain | `dzf_dates` |  |
| dans7 | `dzf_dates` |  |
| rdv | `dzf_table_chercher` |  |
| texte_rdv | `dzf_texte` |  |
| notifier_rdv | `dzf_notifier` | `rdv.length > 0` |
| fins | `dzf_table_chercher` |  |
| texte_fins | `dzf_texte` |  |
| notifier_fins | `dzf_notifier` | `fins.length > 0` |


---

## <a id="documents"></a>Documents

Coffre de documents rangés par catégorie (identité, impôts, logement…), fichiers joints, dates d'expiration avec rappel et tâche de renouvellement automatique.

### À régler

Les fichiers sont rangés par Saltcorn (Paramètres → Fichiers). Sur plusieurs serveurs, utilise le stockage S3 pour que tous les nœuds les voient.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Tu ranges un document | Table « documents » avec un champ Fichier. Le fichier est stocké par Saltcorn (local ou S3). |
| Il va expirer | Le workflow « documents_rappel » (chaque matin : Table : chercher → Liste : filtrer → Table : ajouter → Notifier) te prévient X jours avant (champ rappel_jours) et crée une tâche « Renouveler » si le module Tâches est installé. |
| La carte du document | Vue « document_carte » : l'icône et l'alerte d'expiration sont des textes calculés (formules) ; le lien de téléchargement vient du champ fichier. |

### Table `documents`

Tes papiers importants

| Champ | Type | Détail |
|---|---|---|
| `titre` Titre | String, obligatoire |  |
| `categorie` Catégorie | String, obligatoire | choix : identité, santé, banque, impôts, logement, travail, études, véhicule, assurance, factures, autre |
| `fichier` Fichier | File |  |
| `date_document` Date du document | Date |  |
| `expire_le` Expire le | Date |  |
| `rappel_jours` Me prévenir (jours avant) | Integer |  |
| `important` Important | Bool |  |
| `notes` Notes | String |  |
| `rappel_envoye` Rappel envoyé | Bool |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `document_modifier` | Edit | documents | Formulaire documents |
| `document_carte` | Show | documents |  |
| `documents_grille` | Feed | documents |  |

### Pages

- `/page/documents` — Documents

### Workflows (blocs dysizz-flow)

#### `documents_rappel` — Daily

Prévient avant l'expiration d'un document et crée une tâche « Renouveler ».

| Étape | Bloc | Condition |
|---|---|---|
| aujourdhui | `dzf_dates` |  |
| horizon | `dzf_dates` |  |
| proches | `dzf_table_chercher` |  |
| a_prevenir | `dzf_liste_filtrer` |  |
| taches | `dzf_liste_transformer` |  |
| creer_taches | `dzf_table_ajouter` | `a_prevenir.length > 0` |
| marquer | `dzf_table_modifier` | `a_prevenir.length > 0` |
| texte | `dzf_texte` |  |
| notifier | `dzf_notifier` | `a_prevenir.length > 0` |


---

## <a id="mails"></a>Mails pro

Ta boîte pro (OVH ou tout serveur IMAP) relevée toutes les 5 minutes, en lecture seule : non lus, importants, à traiter, règles automatiques, mail → tâche en un clic.

S'appuie sur : taches.

### À régler

- Dans Dokploy (ton service Saltcorn → Environment), ajoute `DZ_MAIL_PASSWORD=le mot de passe de ta boîte`, puis redéploie.

- Saltcorn → Déclencheurs → mails_releve → étape reglages : mets ton adresse dans « utilisateur ». Serveur : `ssl0.ovh.net` (MX Plan) ou `pro1.mail.ovh.net` (E-mail Pro).

- « Test run » du workflow pour une première relève. Ensuite c'est automatique (toutes les ~5 min). Tant que l'adresse est vide, le workflow s'arrête tout de suite sans erreur.
Rien n'est modifié sur le serveur mail : ni lu, ni déplacé, ni supprimé.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Toutes les 5 minutes | Le workflow « mails_releve » : Définir (tes réglages) → Verrou → Table : compter (dernier UID) → Mail : lire (IMAP, lecture seule) → Liste : transformer → Table : ajouter ou mettre à jour → Verrou libéré. |
| Un mail arrive | Le workflow « mails_regles » (bloc Code) (à chaque ajout) applique tes règles : important, à traiter, archiver, ou créer une tâche. Si c'est important : notification. |
| Tu lis un mail | Clic sur une ligne → vue « mail_lecture » en fenêtre, avec les boutons de statut et « En faire une tâche ». |

### Table `mails`

Copie locale de tes mails (lecture seule)

| Champ | Type | Détail |
|---|---|---|
| `uid` UID IMAP | Integer |  |
| `dossier` Dossier | String |  |
| `message_id` Message-ID | String |  |
| `de` Adresse de l'expéditeur | String |  |
| `de_nom` Expéditeur | String |  |
| `a` Destinataires | String |  |
| `sujet` Sujet | String |  |
| `date` Date | Date |  |
| `extrait` Extrait | String |  |
| `corps` Texte | String |  |
| `lu` Lu | Bool |  |
| `suivi` Suivi (drapeau) | Bool |  |
| `important` Important | Bool |  |
| `pieces_jointes` Pièces jointes | Integer |  |
| `statut` Statut | String, obligatoire | choix : nouveau, lu, à traiter, en attente, traité, archivé |
| `tache` Tâche liée | Key to taches |  |
| `note` Note | String |  |

### Table `mail_regles`

Règles appliquées à l'arrivée d'un mail

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `champ` Si | String, obligatoire | choix : expéditeur, sujet, domaine |
| `contient` Contient | String, obligatoire |  |
| `action` Alors | String, obligatoire | choix : important, à traiter, archiver, créer une tâche |
| `actif` Active | Bool |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `mail_lecture` | Show | mails |  |
| `mails_boite` | List | mails | Boîte de réception (hors traités et archivés) |
| `mails_tous` | List | mails | Mails traités et archivés |
| `regle_modifier` | Edit | mail_regles | Formulaire mail_regles |
| `regles_liste` | List | mail_regles |  |
| `mails_chiffres` | DZ Indicateurs | — | Compteurs de la boîte |

### Pages

- `/page/mails` — Mails pro

### Workflows (blocs dysizz-flow)

#### `mails_releve` — Often

Relève la boîte mail toutes les ~5 min (lecture seule, sans doublon, un seul passage à la fois).

| Étape | Bloc | Condition |
|---|---|---|
| reglages | `dzf_definir` |  suite : `utilisateur ? "verrou" : ""` |
| verrou | `dzf_verrou` |  suite : `verrou ? "dernier" : ""` |
| dernier | `dzf_table_compter` |  |
| relever | `dzf_imap_lire` |  |
| preparer | `dzf_liste_transformer` |  |
| ranger | `dzf_table_upsert` |  |
| liberer | `dzf_verrou` |  |

#### `mails_regles` — Insert sur mails

Applique tes règles à chaque nouveau mail et prévient si important.

| Étape | Bloc | Condition |
|---|---|---|
| regles | `dzf_code` |  |

Code de l'étape `regles` :

```js
// À l'arrivée de chaque mail (relève) : on applique tes règles (table mail_regles)
// puis on prévient si le mail est important.
const Regles = Table.findOne({ name: "mail_regles" });
const Taches = Table.findOne({ name: "taches" });
const maj = {};
for (const r of await Regles.getRows({ actif: true })) {
  const motif = String(r.contient || "").toLowerCase();
  if (!motif) continue;
  const cible = r.champ === "sujet" ? row.sujet : r.champ === "domaine" ? String(row.de || "").split("@")[1] : row.de + " " + row.de_nom;
  if (!String(cible || "").toLowerCase().includes(motif)) continue;
  if (r.action === "important") maj.important = true;
  if (r.action === "à traiter") maj.statut = "à traiter";
  if (r.action === "archiver") maj.statut = "archivé";
  if (r.action === "créer une tâche" && Taches && !row.tache) {
    const t = await Taches.insertRow({ titre: "Mail : " + row.sujet, domaine: "Pro", statut: "à faire", priorite: "haute", recurrence: "aucune", source: "mail", notes: row.de_nom + " <" + row.de + ">\n\n" + String(row.extrait || "") });
    maj.tache = t; maj.statut = "à traiter";
  }
}
if (Object.keys(maj).length) await table.updateRow(maj, row.id, undefined, true);
if (maj.important && !row.lu)
  for (const u of await User.find({ role_id: 1 }))
    await Notification.create({ user_id: u.id, title: "Mail important de " + (row.de_nom || row.de), body: row.sujet, link: "/page/mails" });
```


---

## <a id="emploi"></a>Emploi

Offres d'emploi en France (API France Travail, gratuite) selon tes recherches enregistrées, tri rapide (intéressante / écarter / postuler) et suivi des candidatures avec relance automatique.

### À régler

- Crée un compte sur francetravail.io, puis une application avec l'API « Offres d'emploi v2 » (gratuit).

- Dans Dokploy (service Saltcorn → Environment) : `FT_CLIENT_ID=…` et `FT_CLIENT_SECRET=…`, puis redéploie.

- Règle tes recherches (mots-clés, département, alternance…) dans la page Emploi, puis Déclencheurs → emplois_releve → « Test run » (tant que les variables manquent, il s'arrête sans erreur).

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Toutes les heures | Le workflow « emplois_releve » (blocs Vérifier → Code qui appelle France Travail et Table : ajouter ou mettre à jour → Dates → Table : supprimer) interroge France Travail pour chaque recherche active et ajoute les nouvelles offres. |
| Tu tries | Boutons de la carte : Intéressante, Écarter (disparaît), Postuler (crée une candidature « à envoyer »). |
| Tu envoies | Passe la candidature à « envoyée » : le workflow « candidatures_relance_date » (Dates → Table : modifier) note la date et prévoit une relance à +10 jours. |
| Le jour de la relance | Le workflow « candidatures_rappel » (Dates → Table : chercher → Texte → Notifier) t'envoie une notification le matin. |

### Table `emploi_recherches`

Tes recherches enregistrées

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `mots_cles` Mots-clés | String | Séparés par des virgules, ex. devops,kubernetes |
| `departement` Département(s) | String | Ex. 75 ou 75,92,93 — vide = toute la France |
| `commune` Code commune INSEE | String |  |
| `rayon_km` Rayon (km) autour de la commune | Integer |  |
| `contrat` Contrat | String | CDI, CDD, MIS (intérim)… vide = tous |
| `alternance` Alternance seulement | Bool |  |
| `teletravail` Télétravail | Bool |  |
| `depuis_jours` Publiées depuis (jours) | Integer |  |
| `actif` Active | Bool |  |
| `derniere_synchro` Dernière recherche | Date |  |
| `etat` État | String |  |

### Table `offres_emploi`

Offres trouvées

| Champ | Type | Détail |
|---|---|---|
| `ref` Référence | String, unique |  |
| `titre` Poste | String |  |
| `entreprise` Entreprise | String |  |
| `lieu` Lieu | String |  |
| `contrat` Contrat | String |  |
| `salaire` Salaire | String |  |
| `experience` Expérience | String |  |
| `date` Publiée le | Date |  |
| `url` Lien | String |  |
| `description` Description | String |  |
| `recherche` Recherche | Key to emploi_recherches |  |
| `statut` Statut | String, obligatoire | choix : nouvelle, intéressante, postulé, écartée |
| `source` Source | String |  |
| `note` Note | String |  |

### Table `candidatures`

Suivi de tes candidatures

| Champ | Type | Détail |
|---|---|---|
| `entreprise` Entreprise | String, obligatoire |  |
| `poste` Poste | String, obligatoire |  |
| `offre` Offre | Key to offres_emploi |  |
| `lien` Lien | String |  |
| `statut` Statut | String, obligatoire | choix : à envoyer, envoyée, relance, entretien, refus, offre |
| `envoyee_le` Envoyée le | Date |  |
| `relance_le` Relancer le | Date |  |
| `contact` Contact | String |  |
| `notes` Notes | String |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `offre_carte` | Show | offres_emploi | Carte d'une offre |
| `offre_lecture` | Show | offres_emploi |  |
| `offres_fil` | Feed | offres_emploi |  |
| `recherche_modifier` | Edit | emploi_recherches | Formulaire emploi_recherches |
| `recherches_liste` | List | emploi_recherches |  |
| `candidature_modifier` | Edit | candidatures | Formulaire candidatures |
| `candidatures_tableau` | DZ Tableau | candidatures | Suivi des candidatures par statut |

### Pages

- `/page/emploi` — Emploi

### Workflows (blocs dysizz-flow)

#### `emplois_releve` — Hourly

Cherche les nouvelles offres pour tes recherches (toutes les heures).

| Étape | Bloc | Condition |
|---|---|---|
| configure | `dzf_verifier` |  suite : `configure ? "chercher" : ""` |
| chercher | `dzf_code` |  |
| ancien | `dzf_dates` |  |
| menage | `dzf_table_supprimer` |  |

Code de l'étape `chercher` :

```js
// Pour chaque recherche active : bloc France Travail, puis rangement sans doublon.
const R = Table.findOne({ name: "emploi_recherches" });
let nouvelles = 0;
for (const r of await R.getRows({ actif: true })) {
  const o = await Actions.dzf_france_travail({ mots_cles: r.mots_cles || "", departement: r.departement || "", commune: r.commune || "", rayon_km: r.rayon_km || "", contrat: r.contrat || "", alternance: !!r.alternance, depuis_jours: r.depuis_jours || 7, sortie: "offres", si_erreur: "continuer" });
  const offres = (o.offres || []).map((x) => ({ ...x, recherche: r.id, statut: "nouvelle" }));
  const u = await Actions.dzf_table_upsert({ table: "offres_emploi", liste: offres, cle: "ref", sortie: "b" });
  nouvelles += (u.b && u.b.ajoutes) || 0;
  await R.updateRow({ derniere_synchro: new Date(), etat: o.offres_erreur ? String(o.offres_erreur).slice(0, 200) : "ok" }, r.id, undefined, true);
}
return nouvelles;
```

#### `candidatures_relance_date` — Update sur candidatures

Date d'envoi et date de relance (+10 jours) automatiques.

| Étape | Bloc | Condition |
|---|---|---|
| maintenant | `dzf_dates` |  |
| envoi | `dzf_table_modifier` | `statut == "envoyée" && !envoyee_le` |
| date_relance | `dzf_dates` |  |
| relance | `dzf_table_modifier` | `statut == "envoyée" && !relance_le` |

#### `candidatures_rappel` — Daily

Notification des candidatures à relancer.

| Étape | Bloc | Condition |
|---|---|---|
| demain | `dzf_dates` |  |
| a_relancer | `dzf_table_chercher` |  |
| texte | `dzf_texte` |  |
| notifier | `dzf_notifier` | `a_relancer.length > 0` |


---

## <a id="veille"></a>Veille tech

Les nouveautés dev, cyber (dont alertes CERT-FR), IA, DevOps, MLOps, cloud, réseau et systèmes, lues toutes les heures depuis des flux RSS que tu choisis. Lu, favori, à lire plus tard.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Toutes les heures | Le workflow « veille_releve » : Verrou → Table : chercher (sources) → Lire des flux → Liste : enlever les doublons → Liste : transformer → Table : ajouter ou mettre à jour → Code (état des sources) → ménage → Verrou libéré. |
| Une source ne marche pas | Sa colonne État passe à « erreur » avec la raison. Corrige l'adresse, puis « Tout relire maintenant ». |
| Ajouter un site | Bouton + Source : colle l'adresse de son flux RSS (souvent /feed ou /rss). |
| Ménage | Les articles lus de plus de 60 jours sont supprimés à chaque relève, sauf favoris et « plus tard » (étapes « limite » et « menage » du workflow). |

### Table `veille_sources`

Les sites et chaînes suivis

| Champ | Type | Détail |
|---|---|---|
| `nom` Nom | String, obligatoire |  |
| `type` Type | String, obligatoire | choix : site, youtube |
| `url` Adresse du flux RSS / Atom | String | Pour YouTube : laisse vide et remplis la chaîne |
| `chaine` Chaîne YouTube | String | @nom de la chaîne ou lien vers la chaîne |
| `youtube_id` Identifiant de chaîne (trouvé automatiquement) | String |  |
| `theme` Thème | String, obligatoire | choix : dev, cyber, ia, devops, mlops, cloud, réseau, systèmes, data, tech fr, actus france, actus sénégal |
| `actif` Suivie | Bool |  |
| `derniere_synchro` Dernière lecture | Date |  |
| `etat` État | String |  |
| `erreur` Erreur | String |  |
| `nb_derniers` Éléments dans le flux | Integer |  |

### Table `veille_articles`

Articles et vidéos récupérés

| Champ | Type | Détail |
|---|---|---|
| `source` Source | Key to veille_sources |  |
| `titre` Titre | String |  |
| `url` Lien | String, unique |  |
| `date` Publié le | Date |  |
| `resume` Résumé | String |  |
| `image` Image | String |  |
| `auteur` Auteur | String |  |
| `theme` Thème | String, obligatoire | choix : dev, cyber, ia, devops, mlops, cloud, réseau, systèmes, data, tech fr, actus france, actus sénégal |
| `type` Type | String, obligatoire | choix : article, vidéo |
| `video_id` Vidéo YouTube | String |  |
| `lu` Lu | Bool |  |
| `favori` Favori | Bool |  |
| `plus_tard` Plus tard | Bool |  |
| `ajoute_le` Ajouté le | Date |  |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `article_carte` | Show | veille_articles | Carte d'un article |
| `veille_fil` | Feed | veille_articles |  |
| `source_modifier` | Edit | veille_sources | Formulaire veille_sources |
| `sources_liste` | List | veille_sources | Sources suivies et leur état |

### Pages

- `/page/veille` — Veille tech
- `/page/sources` — Sources suivies

### Workflows (blocs dysizz-flow)

#### `veille_releve` — Hourly

Lit toutes les sources actives (sites et chaînes YouTube), toutes les heures.

| Étape | Bloc | Condition |
|---|---|---|
| verrou | `dzf_verrou` |  suite : `verrou ? "sources" : ""` |
| sources | `dzf_table_chercher` |  |
| lire | `dzf_rss` |  |
| nouveaux | `dzf_liste_dedoublonner` |  |
| maintenant | `dzf_dates` |  |
| preparer | `dzf_liste_transformer` |  |
| ranger | `dzf_table_upsert` |  |
| etat | `dzf_code` |  |
| limite | `dzf_dates` |  |
| menage | `dzf_table_supprimer` |  |
| liberer | `dzf_verrou` |  |

Code de l'étape `etat` :

```js
// Note l'état de chaque source lue (ok / erreur) et garde les identifiants YouTube trouvés.
const S = Table.findOne({ name: "veille_sources" });
const erreurs = new Map((row.articles_erreurs || []).map((e) => [String(e.source), e.erreur]));
for (const c of row.articles_chaines || []) await S.updateRow({ youtube_id: c.youtube_id }, c.source, undefined, true);
for (const s of row.sources || []) {
  const err = erreurs.get(String(s.id));
  await S.updateRow({ derniere_synchro: new Date(), etat: err ? "erreur" : "ok", erreur: err ? String(err).slice(0, 300) : "" }, s.id, undefined, true);
}
return erreurs.size;
```


---

## <a id="videos"></a>Vidéos

Les dernières vidéos des chaînes YouTube dev, cyber, IA, DevOps/MLOps, réseau et systèmes que tu suis, regardées directement dans l'appli (sans pub de suivi, lecteur youtube-nocookie).

S'appuie sur : veille.

### À régler

Si tu actives la Content Security Policy de Saltcorn, autorise `www.youtube-nocookie.com` (cadres) et `i.ytimg.com` (images).Ajouter une chaîne : bouton + Source, type « youtube », et colle son @nom (ex. `@TechWorldwithNana`).

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Les chaînes | Ce sont des lignes de « veille_sources » de type youtube. Leur identifiant (UC…) est trouvé tout seul à partir du @nom. |
| Toutes les heures | Le même déclencheur que la veille (« veille_releve ») lit le flux de chaque chaîne et ajoute les vidéos (type = vidéo). |
| Tu cliques une vidéo | La vue « video_lecture » s'ouvre en fenêtre avec le lecteur youtube-nocookie : pas besoin d'aller sur YouTube. |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `video_carte` | Show | veille_articles | Vignette d'une vidéo |
| `video_lecture` | Show | veille_articles | Lecteur vidéo en fenêtre |
| `videos_grille` | Feed | veille_articles |  |

### Pages

- `/page/videos` — Vidéos


---

## <a id="actus"></a>Actus France & Sénégal

Les titres du jour en France et au Sénégal côte à côte (franceinfo, Le Monde, France 24, Seneweb, Dakaractu, APS, Le Soleil, RFI Afrique…), mis à jour toutes les heures.

S'appuie sur : veille.

### Comment ça marche

| Quand | Ce qui se passe |
|---|---|
| Les journaux | Des lignes de « veille_sources » avec le thème « actus france » ou « actus sénégal ». Ajoute ou retire un journal depuis la page Veille (Sources suivies). |
| Toutes les heures | Le déclencheur « veille_releve » lit les flux ; la page montre les 25 derniers titres de chaque pays. |

### Vues

| Vue | Type | Table | Rôle |
|---|---|---|---|
| `actu_ligne` | Show | veille_articles | Une ligne d'actualité |
| `actus_france` | Feed | veille_articles |  |
| `actus_senegal` | Feed | veille_articles |  |

### Pages

- `/page/actus` — Actus France & Sénégal

