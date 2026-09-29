/* ============================================================
   LE VÉRIFICATEUR DE PLAN
   ============================================================
   POURQUOI CE FICHIER EXISTE

   Le plan de pieces.js est vivant : Evan le redessine, l'agrandit,
   le rétrécit. Il est passé de 39 colonnes à 29 en une seule
   soirée.

   Or TOUT le reste du jeu est repéré en cases de ce plan : le
   point de départ de Bob, la position de chaque peluche, chaque
   zone interactive, chaque cachette du cache-cache. Quand le plan
   bouge, tout ça devient faux EN SILENCE :

     - Bob apparaît dans un mur, et la physique l'éjecte à un
       endroit différent à chaque partie ;
     - une peluche se retrouve dans le vide, hors de l'appartement ;
     - une zone devient inatteignable, et la quête qui en dépend
       est simplement infinissable.

   Aucun de ces bugs ne lève d'erreur. On ne les découvre qu'en
   jouant, et parfois seulement au bout de dix minutes de partie.

   Ce fichier les affiche tous dans la console au démarrage, avec
   la case exacte à corriger. Trois secondes au lieu d'une heure.
   ============================================================ */


/* ------------------------------------------------------------
   Une case est-elle praticable ?
   ------------------------------------------------------------
   Pas seulement "est-ce du parquet" : une lettre de zone (le lit,
   la douche) dessine du parquet mais reçoit par-dessus un meuble
   qui, lui, peut être solide. On va donc demander au catalogue.

   Le tapis est le contre-exemple utile : c'est une zone, et on
   marche dessus.
   ------------------------------------------------------------ */
function caseMarchable(plan, x, y) {

    const c = caseDuPlan(plan, x, y);
    if (c === null) return false;

    if (c === "." || c === "+") return true;
    if (estUnMur(c)) return false;

    // Une lettre de zone : praticable seulement si le meuble qu'on
    // pose dessus ne bloque pas.
    const nomMeuble = ZONES_MEUBLES[c];
    if (!nomMeuble) return false;

    const modele = CATALOGUE_MEUBLES[nomMeuble];
    if (!modele) return false;

    // Un meuble modulaire VERTICAL (le plan de travail de la
    // cuisine) ne bloque que la colonne collée au mur : tout le
    // reste de sa zone est du sol sur lequel on se tient pour
    // cuisiner. Le compter comme plein ferait croire au
    // vérificateur que l'évier est inatteignable.
    if (modele.sens === "vertical") return true;

    return modele.solide === false;
}


/* ------------------------------------------------------------
   Une zone interactive est-elle atteignable ?
   ------------------------------------------------------------
   Bob doit pouvoir poser ses pieds à portée du rectangle. Comme
   PORTEE_INTERACTION vaut un peu plus d'une tuile, il suffit
   qu'UNE case du rectangle, ou de la couronne d'une case qui
   l'entoure, soit praticable.
   ------------------------------------------------------------ */
function zoneAtteignable(plan, zone) {

    const x0 = Math.floor(zone.gauche / TAILLE_TUILE) - 1;
    const x1 = Math.floor(zone.droite / TAILLE_TUILE);
    const y0 = Math.floor(zone.haut / TAILLE_TUILE) - 1;
    const y1 = Math.floor(zone.bas / TAILLE_TUILE);

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (caseMarchable(plan, x, y)) return true;
        }
    }

    return false;
}


/* ============================================================
   verifierLePlan(piece)
   ============================================================
   À appeler une fois, au démarrage de la scène, APRÈS que les
   zones ont été installées.
   ============================================================ */
function verifierLePlan(piece) {

    const plan = piece.plan;
    const problemes = [];

    // ---- 1. toutes les lignes de la même longueur ----
    // C'est LA règle absolue du plan, et la seule erreur qui
    // décale tout l'appartement d'un coup.
    const largeur = plan[0].length;
    plan.forEach(function (ligne, y) {
        if (ligne.length !== largeur) {
            problemes.push(
                "ligne " + y + " du plan : " + ligne.length + " caractères "
                + "au lieu de " + largeur + "."
            );
        }
    });

    // ---- 2. le point de départ de Bob ----
    const depart = piece.departDeBob;
    if (!caseMarchable(plan, depart.x, depart.y)) {
        problemes.push(
            "departDeBob (" + depart.x + ", " + depart.y + ") n'est pas une case "
            + "où l'on peut marcher : '" + caseDuPlan(plan, depart.x, depart.y) + "'."
        );
    }

    // ---- 3. les peluches ----
    Object.keys(PELUCHES).forEach(function (cle) {
        const p = PELUCHES[cle];

        // Samsam dort SUR le lit : c'est voulu, on ne le signale pas.
        if (p.surMeuble) return;

        const x = Math.floor(p.corps.pos.x / TAILLE_TUILE);
        const y = Math.floor((p.corps.pos.y - 1) / TAILLE_TUILE);
        if (!caseMarchable(plan, x, y)) {
            problemes.push(
                PERSONNAGES[cle].nom + " est posé en (" + x + ", " + y + "), "
                + "qui n'est pas une case libre."
            );
        }
    });

    // ---- 4. les cachettes du cache-cache ----
    CACHETTES_BLUEY.forEach(function (c, i) {
        if (!caseMarchable(plan, c.x, c.y)) {
            problemes.push(
                "cachette n°" + i + " (" + c.x + ", " + c.y + ") : Bluey y serait "
                + "introuvable, la manche ne finirait jamais."
            );
        }
    });

    // ---- 5. les zones interactives ----
    interactions.zones.forEach(function (zone) {
        if (!zoneAtteignable(plan, zone)) {
            problemes.push(
                "la zone \"" + (typeof zone.verbe === "function" ? zone.verbe() : zone.verbe)
                + "\" n'est bordée par aucune case "
                + "praticable : Bob ne pourra jamais l'atteindre."
            );
        }
    });

    // ---- le verdict ----
    if (problemes.length === 0) {
        console.log(
            "%cPlan vérifié : " + largeur + "x" + plan.length + " cases, tout est cohérent.",
            "color:#7ec87e;font-weight:bold"
        );
        return;
    }

    console.warn(
        "PLAN — " + problemes.length + " problème(s). "
        + "Le jeu tourne quand même, mais ces points-là sont cassés :"
    );
    problemes.forEach(function (p) { console.warn("   • " + p); });
}
