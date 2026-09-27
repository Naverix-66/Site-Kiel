/* ============================================================
   LES INTERACTIONS
   ============================================================
   Le deuxième pilier d'un jeu narratif après le dialogue : la
   façon dont le joueur comprend QU'IL PEUT faire quelque chose,
   et OÙ.

   La règle d'or, ici, c'est qu'on ne demande jamais au joueur de
   deviner. Trois signaux redondants, tout le temps :

     1. un point qui flotte au-dessus de l'objet le plus proche ;
     2. un bouton d'action qui APPARAÎT en bas à droite, et qui
        n'existe pas le reste du temps (un bouton mort est pire
        que pas de bouton) ;
     3. le verbe écrit à côté : "Parler à Bluey", "Regarder".

   Trois signaux, parce que Klara jouera sur son téléphone, sans
   personne à côté d'elle pour lui expliquer.

   ------------------------------------------------------------
   POURQUOI PAS UNE COLLISION KAPLAY

   On aurait pu poser un area() sur chaque objet et écouter les
   collisions. On calcule la distance à la main, pour une raison
   précise : on ne veut pas seulement savoir SI Bob est à portée,
   on veut savoir DE QUOI IL EST LE PLUS PROCHE. Avec des
   collisions, deux objets voisins déclencheraient tous les deux,
   et l'indicateur sauterait de l'un à l'autre.
   ============================================================ */


const interactions = {
    zones: [],
    cible: null,
    ui: null,
    ecouteurs: [],
};


/* ============================================================
   preparerInteractions()
   ============================================================
   À appeler UNE FOIS au début de la scène, avant d'ajouter quoi
   que ce soit.

   La remise à zéro n'est pas une précaution inutile : la liste
   des zones vit en dehors des scènes, alors que les objets
   graphiques, eux, sont détruits à chaque changement de scène.
   Sans ce nettoyage, revenir dans l'appartement empilerait une
   deuxième série de zones par-dessus la première.
   ============================================================ */
function preparerInteractions() {

    interactions.zones = [];
    interactions.cible = null;
    interactions.ecouteurs.forEach(function (e) { e.cancel(); });
    interactions.ecouteurs = [];

    const ui = {};

    // ---- l'indicateur qui flotte au-dessus de l'objet ----
    // Il vit dans le MONDE (pas de fixed) : il doit rester
    // accroché à l'objet quand la caméra bouge.
    /* Le point doré, celui qui flotte au-dessus de ce qu'on peut
       toucher. Evan : « j'aime bien comment t'as fait le point doré
       dans le nid, possible de faire le même pour tout le jeu ? ».

       Trois morceaux qui bougent ensemble : un halo qui respire, la
       pastille d'or cerclée d'encre, et un éclat clair en haut à
       gauche. Sur un parquet clair comme sur des brindilles noires,
       il se voit — une pastille couleur vieil or toute seule se
       confondait avec la moitié du décor. */
    ui.halo = add([
        circle(15),
        pos(0, 0),
        anchor("center"),
        z(Z_INTERFACE - 11),
        color(...COULEUR_OR),
        opacity(0),
    ]);

    ui.indicateur = add([
        circle(6),
        pos(0, 0),
        anchor("center"),
        z(Z_INTERFACE - 10),
        color(...COULEUR_OR),
        outline(2, rgb(...COULEUR_ENCRE)),
        opacity(0),
    ]);

    ui.eclat = add([
        circle(2),
        pos(0, 0),
        anchor("center"),
        z(Z_INTERFACE - 9),
        color(252, 244, 222),
        opacity(0),
    ]);

    // ---- le bouton d'action ----
    ui.bouton = add([
        circle(BOUTON_ACTION_RAYON),
        pos(0, 0),
        anchor("center"),
        fixed(),
        z(Z_INTERFACE - 5),
        color(...COULEUR_ACCENT),
        outline(3, rgb(...COULEUR_CREME)),
        opacity(0),
    ]);

    ui.pointBouton = add([
        circle(9),
        pos(0, 0),
        anchor("center"),
        fixed(),
        z(Z_INTERFACE - 4),
        color(...COULEUR_CREME),
        opacity(0),
    ]);

    // ---- le verbe, à gauche du bouton ----
    // Avec sa pastille sombre : le verbe s'affiche par-dessus le
    // décor, qui peut être clair ou foncé selon l'endroit où se
    // trouve Bob. Sans fond, il devient illisible une fois sur deux.
    ui.fondEtiquette = add([
        rect(10, 10, { radius: 6 }),
        pos(0, 0),
        anchor("right"),
        fixed(),
        z(Z_INTERFACE - 5),
        color(...COULEUR_NUIT),
        opacity(0),
    ]);

    ui.etiquette = add([
        text("", { size: echelleInterface() - 2 }),
        pos(0, 0),
        anchor("right"),
        fixed(),
        z(Z_INTERFACE - 4),
        color(...COULEUR_CREME),
        opacity(0),
    ]);

    interactions.ui = ui;
    placerBoutonAction();

    // ---- les entrées ----
    const e = interactions.ecouteurs;
    e.push(onKeyPress("e", declencherInteraction));
    e.push(onKeyPress("space", declencherInteraction));
    e.push(onKeyPress("enter", declencherInteraction));

    e.push(onMousePress(function () { pointeurInteraction(mousePos()); }));
    e.push(onTouchStart(function (position) { pointeurInteraction(position); }));
}


function placerBoutonAction() {
    const ui = interactions.ui;

    const centre = vec2(
        width() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON,
        height() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON
    );

    ui.bouton.pos = centre;
    ui.pointBouton.pos = centre;
    // anchor("right") désigne le milieu du bord DROIT : le verbe
    // grandit donc vers la gauche, et son bord droit reste collé au
    // bouton quelle que soit la longueur du texte.
    ui.etiquette.textSize = echelleInterface() - 2;
    ui.etiquette.pos = centre.add(vec2(-BOUTON_ACTION_RAYON - 12, 0));
    ui.fondEtiquette.pos = ui.etiquette.pos.add(vec2(9, 0));

    interactions.centreBouton = centre;
}


/* ============================================================
   ajouterInteractif(options)
   ============================================================
   options :
     x, y, largeur, hauteur   l'emprise, EN TUILES, comme le plan
     verbe                    ce qu'on affiche : "Parler à Rosy"
     action                   la fonction à exécuter
     actif                    (optionnel) fonction qui renvoie
                              false pour désactiver temporairement
                              la zone — par exemple une porte qui
                              ne s'ouvre qu'à l'acte II.

   Les coordonnées sont en TUILES parce que tout le reste du jeu
   l'est : le plan, les meubles, le point de départ de Bob. On
   convertit en pixels ici, une seule fois, et plus personne n'y
   pense ensuite.
   ============================================================ */
function ajouterInteractif(options) {

    const zone = {
        gauche: options.x * TAILLE_TUILE,
        haut: options.y * TAILLE_TUILE,
        droite: (options.x + (options.largeur || 1)) * TAILLE_TUILE,
        bas: (options.y + (options.hauteur || 1)) * TAILLE_TUILE,

        verbe: options.verbe || "Regarder",
        action: options.action,
        actif: options.actif || null,

        // 0 par défaut. Monter à 1 pour qu'une zone l'emporte sur
        // le décor qui l'entoure, même de plus loin.
        priorite: options.priorite || 0,

        // La hauteur du dessin posé sur la zone (un personnage) : le
        // point doré se met au-dessus de sa tête, pas sur son ventre.
        hauteurVisuelle: options.hauteurVisuelle || 0,

        // Voir le RÉ-ARMEMENT dans majInteractions().
        consommee: false,
    };

    interactions.zones.push(zone);

    // On RENVOIE la zone : c'est ce qui permet de la déplacer ou de
    // la retirer plus tard. Le cache-cache de Bluey s'en sert à
    // chaque manche pour déménager sa zone dans une autre pièce.
    return zone;
}


/* ------------------------------------------------------------
   retirerInteractif(zone) / deplacerInteractif(zone, x, y)
   ------------------------------------------------------------
   Pour tout ce qui bouge en cours de partie. On remet toujours
   consommee à false en déplaçant : une zone qui déménage est,
   par définition, une zone neuve.
   ------------------------------------------------------------ */
function retirerInteractif(zone) {
    const i = interactions.zones.indexOf(zone);
    if (i >= 0) interactions.zones.splice(i, 1);
    if (interactions.cible === zone) {
        interactions.cible = null;
        cacherInterfaceAction();
    }
}


function deplacerInteractif(zone, tuileX, tuileY) {
    const largeur = zone.droite - zone.gauche;
    const hauteur = zone.bas - zone.haut;

    zone.gauche = tuileX * TAILLE_TUILE;
    zone.haut = tuileY * TAILLE_TUILE;
    zone.droite = zone.gauche + largeur;
    zone.bas = zone.haut + hauteur;

    zone.consommee = false;
}


/* ------------------------------------------------------------
   Distance entre un point et un RECTANGLE (et non son centre).
   ------------------------------------------------------------
   Pour un grand meuble, la distance au centre serait absurde :
   Bob collé contre le bord d'un lit de 4 tuiles en serait à
   2 tuiles "de distance", et ne pourrait pas interagir.

   L'astuce classique : sur chaque axe, on mesure de combien on
   DÉPASSE le rectangle. Si on est entre ses deux bords, on ne
   dépasse pas, et l'écart vaut 0 sur cet axe.
   ------------------------------------------------------------ */
function distanceAuRectangle(point, zone) {
    const ecartX = Math.max(zone.gauche - point.x, 0, point.x - zone.droite);
    const ecartY = Math.max(zone.haut - point.y, 0, point.y - zone.bas);
    return Math.sqrt(ecartX * ecartX + ecartY * ecartY);
}


/* ============================================================
   majInteractions(bob) — appelée à chaque image par la scène
   ============================================================ */
function majInteractions(bob) {

    const ui = interactions.ui;
    if (!ui) return;

    // Pendant un dialogue, plus rien n'est interactif : sinon on
    // pourrait relancer une conversation par-dessus celle en cours.
    if (dialogueEnCours()) {
        interactions.cible = null;
        cacherInterfaceAction();
        return;
    }

    // L'écran a changé de taille : on replace le bouton.
    if (interactions.centreBouton.x !== width() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON) {
        placerBoutonAction();
    }

    // ---- chercher la zone la plus proche ----
    let meilleure = null;
    let meilleureDistance = PORTEE_INTERACTION;
    let meilleurePriorite = -1;

    interactions.zones.forEach(function (zone) {

        const distance = distanceAuRectangle(bob.pos, zone);

        // RÉ-ARMEMENT.
        // Une zone qu'on vient d'utiliser reste "consommée" tant que
        // Bob ne s'en est pas éloigné. Sans ça, la touche qui ferme
        // la dernière réplique d'un dialogue relance aussitôt le même
        // dialogue, et on ne peut plus en sortir qu'en marchant.
        //
        // Le x1.5 n'est pas un détail : si on ré-armait à la distance
        // EXACTE de déclenchement, Bob posé pile sur la limite
        // ferait clignoter la zone entre armée et consommée à chaque
        // image. Il faut s'éloigner franchement pour réarmer.
        if (distance > PORTEE_INTERACTION * 1.5) {
            zone.consommee = false;
        }

        if (zone.consommee) return;
        if (zone.actif && !zone.actif()) return;
        if (distance >= PORTEE_INTERACTION) return;

        // LA PRIORITÉ passe avant la distance.
        //
        // Sans elle, le décor mange les personnages : Bluey caché
        // au pied de la penderie est à 30 px de Bob, la penderie à
        // 0 px — et c'est la penderie qui gagne. Le joueur voit
        // "La penderie" alors qu'il a Bluey sous le nez, et la
        // manche de cache-cache devient infinissable.
        //
        // À priorité égale, c'est le plus proche qui l'emporte,
        // comme avant.
        const priorite = zone.priorite || 0;

        if (priorite > meilleurePriorite
            || (priorite === meilleurePriorite && distance < meilleureDistance)) {
            meilleurePriorite = priorite;
            meilleureDistance = distance;
            meilleure = zone;
        }
    });

    interactions.cible = meilleure;

    if (!meilleure) {
        cacherInterfaceAction();
        return;
    }

    // ---- montrer les trois signaux ----
    const centreX = (meilleure.gauche + meilleure.droite) / 2;

    // Le flottement : une oscillation lente de 4 pixels. C'est ce
    // petit mouvement qui attire l'oeil — un point immobile se
    // confond avec le décor.
    const flottement = Math.sin(time() * 4) * 4;

    // OÙ LE POSER. Au-dessus du bord haut, ça marche pour un petit
    // meuble. Pas pour le reste (remonté par Evan) :
    //  - un personnage est plus haut que sa case : le point tombait
    //    sur son ventre. On le met au-dessus de sa tête ;
    //  - un grand meuble (le tapis, 7 x 9 cases) : le bord haut est
    //    loin de Bob, et le point masquait le bureau. On le met au
    //    plus près de Bob — à ses pieds s'il est dessus.
    let ix = centreX;
    let iy = meilleure.haut - 14;
    const grand = meilleure.droite - meilleure.gauche > 2 * TAILLE_TUILE
        || meilleure.bas - meilleure.haut > 2 * TAILLE_TUILE;

    if (meilleure.hauteurVisuelle) {
        iy = meilleure.bas - meilleure.hauteurVisuelle - 12;
    } else if (grand) {
        ix = Math.max(meilleure.gauche + 8, Math.min(meilleure.droite - 8, bob.pos.x));
        const dessus = bob.pos.x > meilleure.gauche && bob.pos.x < meilleure.droite
            && bob.pos.y > meilleure.haut && bob.pos.y < meilleure.bas;
        iy = dessus
            ? bob.pos.y + 8
            : Math.max(meilleure.haut + 6, Math.min(meilleure.bas - 6, bob.pos.y));
    }

    const centre = vec2(ix, iy + flottement);
    const bat = 0.6 + Math.abs(Math.sin(time() * 2.4)) * 0.4;
    ui.indicateur.pos = centre;
    ui.indicateur.opacity = 1;
    ui.halo.pos = centre;
    ui.halo.opacity = 0.16 * bat;
    ui.eclat.pos = centre.add(vec2(-1.8, -1.8));
    ui.eclat.opacity = 0.9;

    ui.bouton.opacity = 0.9;
    ui.pointBouton.opacity = 1;
    ui.etiquette.opacity = 1;

    // Le verbe peut être une FONCTION, pas seulement un texte.
    // C'est ce qui permet au bouton de dire "Parler à Bluey" puis
    // "Montrer la plume à Bluey" une fois qu'on a la plume — sans
    // avoir à créer deux zones concurrentes au même endroit.
    // Un acte où le bouton ne dit qu'une chose est un acte où on
    // ne fait qu'une chose.
    ui.etiquette.text = (typeof meilleure.verbe === "function")
        ? meilleure.verbe()
        : meilleure.verbe;

    // La pastille se met à la taille du verbe. Comme kaplay ne
    // connaît la largeur d'un texte qu'une image après l'avoir
    // écrit, on la recalcule ici à chaque image plutôt qu'au
    // moment du changement de cible : sinon elle aurait toujours
    // la taille du verbe PRÉCÉDENT.
    ui.fondEtiquette.opacity = 0.6;
    ui.fondEtiquette.width = ui.etiquette.width + 18;
    ui.fondEtiquette.height = ui.etiquette.height + 10;
}


function cacherInterfaceAction() {
    const ui = interactions.ui;
    ui.indicateur.opacity = 0;
    ui.halo.opacity = 0;
    ui.eclat.opacity = 0;
    ui.bouton.opacity = 0;
    ui.pointBouton.opacity = 0;
    ui.etiquette.opacity = 0;
    ui.fondEtiquette.opacity = 0;
}


/* ============================================================
   declencherInteraction()
   ============================================================ */
function declencherInteraction() {
    if (dialogueEnCours()) return;
    if (!interactions.cible) return;
    if (!interactions.cible.action) return;

    const zone = interactions.cible;

    // Consommée : elle ne se rallumera qu'une fois Bob reparti.
    // On le fait AVANT d'exécuter l'action, parce que l'action ouvre
    // en général un dialogue, et qu'on ne reviendra donc pas ici.
    zone.consommee = true;
    interactions.cible = null;
    cacherInterfaceAction();

    zone.action();
}


/* ------------------------------------------------------------
   Un doigt ou un clic sur le bouton d'action.
   ------------------------------------------------------------
   Le x1.4 est la même tolérance que sur le joystick : sur un
   téléphone on vise mal, et un bouton qui n'obéit qu'au pixel
   exact est insupportable.

   Un toucher AILLEURS sur l'écran ne déclenche rien : c'est
   voulu. Le joystick occupe le coin opposé, et on ne veut pas
   qu'un doigt posé au hasard fasse parler Bob.
   ------------------------------------------------------------ */
function pointeurInteraction(position) {
    if (dialogueEnCours()) return;
    if (!interactions.cible) return;

    if (position.dist(interactions.centreBouton) > BOUTON_ACTION_RAYON * 1.4) return;

    declencherInteraction();
}
