/* ============================================================
   BOB — le personnage joueur
   ============================================================ */


/* ============================================================
   creerBob(tuileX, tuileY)
   ============================================================
   Fait apparaître Bob et lui donne de quoi se déplacer, buter
   contre les murs, et s'animer.
   ============================================================ */
function creerBob(tuileX, tuileY) {

    // Le plan est en tuiles, le monde est en pixels.
    // On vise le MILIEU de la tuile en largeur, et son BAS en
    // hauteur : la position de Bob désigne ses pieds.
    const x = tuileX * TAILLE_TUILE + TAILLE_TUILE / 2;
    const y = tuileY * TAILLE_TUILE + TAILLE_TUILE;

    const bob = add([
        sprite("bob"),
        pos(x, y),

        // anchor("bot") = la position désigne le BAS du sprite.
        // C'est ce qui permet ensuite de calculer le tri par
        // profondeur et de poser l'ombre au bon endroit, sans
        // jamais avoir à corriger d'un demi-sprite.
        anchor("bot"),

        // La boîte de collision ne fait que 12 x 8, aux PIEDS de
        // Bob — alors que le sprite en fait 36 de haut.
        //
        // C'est un des trucs les plus importants du game feel en
        // vue de dessus : si la boîte faisait toute la hauteur du
        // sprite, Bob se cognerait à une table alors que sa tête
        // seule la touche, et le déplacement paraîtrait raide.
        // Seuls ses pieds doivent buter contre les meubles.
        //
        // ⚠️ anchor("bot") s'applique AUSSI à cette forme, c'est
        // pourquoi son offset est (0, 0) et pas (-6, -8).
        // Vérifié : la zone obtenue est bien centrée sur les pieds.
        //
        // ⚠️ La forme est réduite AVEC le sprite (scale ci-dessous) :
        // elle est donc écrite FINESSE_PELUCHES fois plus grande,
        // pour mesurer au final LARGEUR x HAUTEUR dans le monde.
        area({ shape: new Rect(vec2(0, 0),
            LARGEUR_HITBOX_BOB * FINESSE_PELUCHES,
            HAUTEUR_HITBOX_BOB * FINESSE_PELUCHES) }),

        // La planche est dessinée plus fin que le monde (config.js).
        scale(1 / FINESSE_PELUCHES),

        body(),
        z(Z_DECOR),
        "bob",

        // Des données à nous, rangées sur l'objet :
        {
            direction: "bas",     // la dernière direction regardée
            animEnCours: null,    // pour ne pas relancer l'anim à chaque image
        },
    ]);

    jouerAnimation(bob, "idle-bas");

    return bob;
}


/* ============================================================
   jouerAnimation(bob, nom)
   ============================================================
   play() redémarre l'animation depuis sa première image.
   Comme deplacerBob() est appelée ~60 fois par seconde, appeler
   play() sans condition figerait Bob sur son image n°1 : il
   repartirait de zéro avant d'avoir eu le temps d'avancer.

   On ne relance donc que si l'animation CHANGE réellement.
   ============================================================ */
function jouerAnimation(bob, nom) {
    if (bob.animEnCours === nom) return;

    bob.animEnCours = nom;
    bob.play(nom);
}


/* ============================================================
   deplacerBob(bob)
   ============================================================
   Appelée à chaque image par la scène.
   ============================================================ */
function deplacerBob(bob) {

    const direction = lireDirection();

    // Personne ne demande rien : Bob s'arrête, tourné du côté
    // où il regardait déjà.
    if (direction.len() === 0) {
        jouerAnimation(bob, "idle-" + bob.direction);
        return;
    }

    // .move() applique déjà le temps écoulé entre deux images.
    // Ne JAMAIS multiplier par dt() en plus.
    bob.move(direction.scale(VITESSE_BOB));

    // Quelle animation jouer ? L'axe le plus incliné l'emporte.
    // En diagonale, on préfère donc l'animation de profil, qui
    // se lit mieux que celle de face.
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
        bob.direction = "cote";
        // Une seule animation de profil pour les deux côtés :
        // on la retourne quand il va à gauche.
        bob.flipX = direction.x < 0;
    } else if (direction.y < 0) {
        bob.direction = "haut";
    } else {
        bob.direction = "bas";
    }

    jouerAnimation(bob, "marche-" + bob.direction);
}


/* ============================================================
   trierParProfondeur(objet)
   ============================================================
   Recalcule l'ordre de dessin d'un objet mobile à partir de sa
   position verticale : plus il est bas à l'écran, plus il est
   proche, donc dessiné par-dessus.

   À appeler à chaque image pour tout ce qui bouge. Les meubles,
   eux, étant immobiles, n'ont besoin d'être triés qu'une fois.
   ============================================================ */
function trierParProfondeur(objet) {
    objet.z = Z_DECOR + objet.pos.y;
}


/* ============================================================
   creerOmbre(cible)
   ============================================================
   Une ellipse sombre sous les pieds. Trois lignes de code pour
   un des meilleurs rapports effet/effort du jeu : sans ombre, un
   personnage en vue de dessus a l'air de flotter au-dessus du
   sol. Avec, il est POSÉ dessus.

   L'ombre est un objet indépendant, pas un enfant de Bob : les
   enfants sont dessinés APRÈS leur parent en kaplay, l'ombre
   serait donc passée par-dessus lui.
   ============================================================ */
function creerOmbre(cible) {

    const ombre = add([
        circle(7),
        scale(vec2(1, 0.45)),          // aplatie = une ellipse
        color(0, 0, 0),
        opacity(0.28),
        pos(cible.pos),
        anchor("center"),
        z(Z_DECOR),
    ]);

    ombre.onUpdate(() => {
        ombre.pos = cible.pos.add(vec2(0, -2));

        // juste DERRIÈRE sa cible dans l'ordre de dessin
        ombre.z = Z_DECOR + cible.pos.y - 0.5;
    });

    return ombre;
}
