/* ============================================================
   LES MEUBLES ANIMÉS — les portes et le frigo
   ============================================================
   Evan : « si on arrive à faire des animations interactives pour
   le joueur avec les portes ou avec le frigo, par exemple ».

   - LA PORTE DE LA SALLE DE BAIN ('+' sur le plan) : UNE porte en
     bois, qui s'ouvre toute seule quand Bob approche et se referme
     quand il s'éloigne.

   - LA PORTE D'ENTRÉE ('P') : fermée à clé. Elle est dans le mur
     du BAS, qu'on voit d'au-dessus : on la dessine donc vue de
     dessus, avec un paillasson devant. Elle tremble quand Bob
     essaie de l'ouvrir.

   - LE FRIGO : sa porte s'ouvre quand Bob l'ouvre dans l'histoire
     (ouvrirLeFrigo / fermerLeFrigo, appelées par acte1.js).

   Les images sont chargées dans moteur.js (porte_bois, frigo_face).
   ============================================================ */

const animes = {
    portes: [],
    porteEntree: null,
    frigo: null,
};

// Distance (pieds de Bob -> milieu de la porte) sous laquelle elle
// s'ouvre, et vitesse de l'animation.
const PORTE_DISTANCE_OUVERTURE = 1.8 * TAILLE_TUILE;
const PORTE_IMAGES_PAR_SECONDE = 14;


/* ------------------------------------------------------------
   poserLesMeublesAnimes(piece) — appelée par la scène, après
   poserMeubles() (le frigo doit déjà exister).
   ------------------------------------------------------------ */
function poserLesMeublesAnimes(piece) {

    animes.portes = [];
    trouverZones(piece.plan, "+").forEach(poserUnePorte);
    trouverZones(piece.plan, "P").forEach(poserLaPorteDEntree);

    // Le frigo est posé par poserMeubles(), qui marque chaque meuble
    // du nom de son image.
    animes.frigo = get("image-frigo_face")[0] || null;

    onUpdate(animerLesPortes);
}


/* ------------------------------------------------------------
   Une porte intérieure.
   ------------------------------------------------------------ */
function poserUnePorte(zone) {

    const yBas = (zone.y + 1) * TAILLE_TUILE;

    // UNE seule porte (Evan), dans la case de gauche de l'ouverture.
    // Les autres cases redeviennent du mur : sa face, et un obstacle
    // pour que Bob ne passe pas à côté de la porte.
    for (let i = 1; i < zone.largeur; i++) {
        const x = (zone.x + i) * TAILLE_TUILE;
        add([
            sprite("piece", { frame: FRAME_MUR_BAS }),
            pos(x, zone.y * TAILLE_TUILE),
            z(Z_DECOR + yBas),
            "mur",
        ]);
        add([
            rect(TAILLE_TUILE, TAILLE_TUILE),
            pos(x, zone.y * TAILLE_TUILE),
            area(),
            body({ isStatic: true }),
            opacity(0),
            "obstacle",
        ]);
    }

    const battant = add([
        sprite("porte_bois", { frame: 0 }),
        pos(zone.x * TAILLE_TUILE, yBas),
        anchor("botleft"),
        // Même règle que les meubles : Bob qui passe la porte a
        // les pieds au-dessus de ce bord, il est donc dessiné
        // derrière le battant ouvert — il traverse le mur.
        z(Z_DECOR + yBas),
        "porte",
    ]);

    animes.portes.push({
        battants: [battant],
        centre: vec2((zone.x + 0.5) * TAILLE_TUILE, (zone.y + 0.5) * TAILLE_TUILE),
        image: 0,          // 0 = fermée, 4 = ouverte
        attente: 0,
    });
}


function animerLesPortes() {

    const bob = get("bob")[0];
    if (!bob) return;

    animes.portes.forEach(function (porte) {

        const voulue = bob.pos.dist(porte.centre) < PORTE_DISTANCE_OUVERTURE ? 4 : 0;
        porte.attente -= dt();
        if (porte.image === voulue || porte.attente > 0) return;

        // Une image à la fois, dans un sens ou dans l'autre : la
        // porte peut changer d'avis en plein mouvement.
        porte.attente = 1 / PORTE_IMAGES_PAR_SECONDE;
        const avant = porte.image;
        porte.image += voulue > porte.image ? 1 : -1;
        // Le son au premier mouvement, et au claquement final.
        if (typeof jouerSon === "function") {
            if (avant === 0) jouerSon("porteOuvre");
            if (porte.image === 0) jouerSon("porteFerme");
        }
        porte.battants.forEach(function (b) { b.frame = porte.image; });
    });
}


/* ------------------------------------------------------------
   La porte d'entrée, vue de dessus, dans l'épaisseur du mur.
   ------------------------------------------------------------ */
function poserLaPorteDEntree(zone) {

    const x = zone.x * TAILLE_TUILE;
    const y = zone.y * TAILLE_TUILE;
    const l = zone.largeur * TAILLE_TUILE;

    const battant = add([
        rect(l - 6, 12, { radius: 2 }),
        pos(x + 3, y + 2),
        color(122, 82, 54),
        outline(1, rgb(70, 46, 30)),
        z(Z_DECOR + y + TAILLE_TUILE),
    ]);

    // La poignée, côté appartement.
    const poignee = add([
        rect(6, 3),
        pos(x + l - 16, y + 3),
        color(214, 196, 150),
        z(Z_DECOR + y + TAILLE_TUILE + 1),
    ]);

    // Le paillasson, juste devant, dans l'appartement.
    add([
        rect(l - 14, 16, { radius: 3 }),
        pos(x + 7, y - 20),
        color(139, 106, 74),
        outline(2, rgb(104, 78, 54)),
        z(Z_SOL + 1),
    ]);

    animes.porteEntree = { battant: battant, poignee: poignee, x: battant.pos.x, xPoignee: poignee.pos.x };
}


// Bob essaie d'ouvrir : la porte tremble dans son cadre.
function secouerLaPorteDEntree() {

    const p = animes.porteEntree;
    if (!p) return;
    if (typeof jouerSon === "function") jouerSon("porteBloquee");

    const debut = time();
    const secousse = onUpdate(function () {
        const t = time() - debut;
        const dx = t < 0.45 ? Math.sin(t * 70) * 1.5 : 0;
        p.battant.pos.x = p.x + dx;
        p.poignee.pos.x = p.xPoignee + dx;
        if (t >= 0.45) secousse.cancel();
    });
}


/* ------------------------------------------------------------
   Le frigo
   ------------------------------------------------------------ */
// Image par image, dans un sens ou dans l'autre, comme les portes.
const FRIGO_OUVERT = 5;

function ouvrirLeFrigo() {
    amenerLeFrigoA(FRIGO_OUVERT);
    if (typeof jouerSon === "function") { jouerSon("frigoOuvre"); demarrerBoucle("frigoRonron"); }
}

function fermerLeFrigo() {
    amenerLeFrigoA(0);
    if (typeof jouerSon === "function") { jouerSon("frigoFerme"); arreterBoucle("frigoRonron"); }
}

function amenerLeFrigoA(image) {
    const frigo = animes.frigo;
    if (!frigo) return;
    if (animes.minuterieFrigo) animes.minuterieFrigo.cancel();

    let attente = 0;
    animes.minuterieFrigo = onUpdate(function () {
        attente -= dt();
        if (attente > 0) return;
        if (frigo.frame === image) {
            animes.minuterieFrigo.cancel();
            animes.minuterieFrigo = null;
            return;
        }
        attente = 1 / PORTE_IMAGES_PAR_SECONDE;
        frigo.frame += image > frigo.frame ? 1 : -1;
    });
}
