/* ============================================================
   KLARA SE RÉVEILLE — tout le monde fait le mort
   ============================================================
   Quand la jauge du sommeil déborde (jeux.js), le petit jeu se met
   en pause et on revient dans le studio :

     1. le lit bouge ; au-dessus de l'oreiller : « …mmh ? »
     2. PANIQUE : tout le monde court se ranger au pied du lit, et
        s'effondre, raide, comme une peluche qu'on a posée là.
        Doudou ne court pas : il fait le mort sur place. Samsam non
        plus : il ne peut pas se lever, et pour une fois, ça tombe
        bien. Bob, lui, se fige là où il est.
     3. silence… « …zzz ». Elle s'est rendormie.
     4. tout le monde se relève et retourne à sa place, deux
        répliques, et on reprend le jeu exactement où on en était.

   Ce n'est PAS une punition : c'est un gag, et on ne perd rien.
   La seule chose qu'on y perd, c'est une demi-minute.
   ============================================================ */


// Où chacun court se ranger : le parquet au pied du lit (colonne 6,
// entre le lit et le tapis). Ceux qui n'ont pas de place font le
// mort sur place.
const PLACES_DE_PANIQUE = {
    cakey: [6, 6],
    fraisy: [6, 8],
    bluey: [6, 10],
};

// Le haut du lit, là où dort Klara (le lit va des cases 1 à 5, de
// la ligne 5 à la ligne 11 ; les oreillers sont en haut).
const TETE_DE_KLARA = vec2(3 * TAILLE_TUILE, 5.4 * TAILLE_TUILE);


function reveillerKlara(puis) {

    sommeil.reveils++;
    const premiereFois = sommeil.reveils === 1;
    const bob = get("bob")[0];
    const debut = time();

    // Où chacun était, pour y retourner après.
    const avant = {};
    Object.keys(PELUCHES).forEach(function (cle) {
        const p = PELUCHES[cle];
        if (p.cache) return;
        avant[cle] = caseSousLesPieds(p);
    });

    // ---- ce qu'on montre à l'écran ----
    const bandeau = add([
        text("KLARA SE RÉVEILLE !", { size: 28 }),
        pos(0, 0),
        anchor("center"),
        color(255, 236, 214),
        opacity(0),
        fixed(),
        z(Z_INTERFACE + 40),
    ]);
    const fondBandeau = add([
        rect(10, 10, { radius: 10 }),
        pos(0, 0),
        anchor("center"),
        color(196, 76, 64),
        opacity(0),
        fixed(),
        z(Z_INTERFACE + 39),
    ]);
    const murmure = add([
        text("", { size: 12 }),
        pos(TETE_DE_KLARA.sub(vec2(0, 18))),
        anchor("center"),
        color(...COULEUR_CREME),
        opacity(0),
        z(Z_NUIT + 12),
    ]);

    const lit = get("image-lit_klara")[0] || null;
    const litX = lit ? lit.pos.x : 0;

    // La caméra glisse vers le lit.
    jeu.regard = bob ? bob.pos : TETE_DE_KLARA;

    shake(8);
    if (typeof sonSynthe === "function") sonSynthe("tok", 1.5);

    let etape = 0;
    let fini = false;

    const boucle = onUpdate(function () {

        const t = time() - debut;

        jeu.regard = jeu.regard.lerp(etape < 4 ? TETE_DE_KLARA.add(vec2(TAILLE_TUILE * 2, TAILLE_TUILE * 2)) : (bob ? bob.pos : TETE_DE_KLARA), Math.min(1, dt() * 3));

        // Le bandeau, les premières secondes.
        const k = t < 0.25 ? t / 0.25 : (t < 2.4 ? 1 : Math.max(0, 1 - (t - 2.4) / 0.4));
        bandeau.textSize = Math.round(Math.max(20, Math.min(40, width() * 0.06)));
        bandeau.pos = vec2(width() / 2, height() * 0.2);
        bandeau.opacity = k;
        fondBandeau.pos = bandeau.pos;
        fondBandeau.width = bandeau.width + 40;
        fondBandeau.height = bandeau.height + 20;
        fondBandeau.opacity = 0.92 * k * (0.85 + 0.15 * Math.sin(time() * 14));

        // Le lit remue tant qu'elle n'est pas rendormie.
        if (lit) lit.pos.x = litX + (t > 0.2 && t < 3.2 ? Math.sin(time() * 30) * 0.8 : 0);

        // 1. « …mmh ? »
        if (etape === 0 && t > 0.3) {
            etape = 1;
            murmure.text = "...mmh ?";
            murmure.opacity = 1;

            // 2. Tout le monde court se ranger.
            Object.keys(avant).forEach(function (cle) {
                const p = PELUCHES[cle];
                const place = PLACES_DE_PANIQUE[cle];
                p.aDuNeuf = true;         // un « ! » au-dessus de la tête
                if (place) {
                    marcherVers(p, place[0], place[1], {
                        vitesse: 230,
                        puis: function () { faireLeMort(p); },
                    });
                } else {
                    faireLeMort(p);
                }
            });
            if (bob) figerBob(bob, true);
        }

        // Ceux qui traînent arrivent d'un coup.
        if (etape === 1 && t > 2.4) {
            etape = 2;
            terminerLesMarches();
            murmure.text = "...";
        }

        // 3. Elle se rendort.
        if (etape === 2 && t > 3.3) {
            etape = 3;
            murmure.text = "...zzz";
            sommeil.bruit = 0;
        }

        // 4. Tout le monde se relève.
        if (etape === 3 && t > 4.6) {
            etape = 4;
            murmure.opacity = 0;
            if (lit) lit.pos.x = litX;
            if (bob) figerBob(bob, false);
            Object.keys(avant).forEach(function (cle) {
                const p = PELUCHES[cle];
                p.pose = null;
                p.aDuNeuf = false;
                const a = avant[cle];
                if (a && PLACES_DE_PANIQUE[cle]) marcherVers(p, a.x, a.y, { vitesse: 110 });
            });
            if (typeof rafraichirBulles === "function") rafraichirBulles();
        }

        if (etape === 4 && t > 5.2 && !fini) {
            fini = true;
            boucle.cancel();
            destroy(bandeau);
            destroy(fondBandeau);
            destroy(murmure);
            lancerDialogue(repliquesApresLeReveil(premiereFois), function () {
                terminerLesMarches();
                jeu.regard = null;
                if (puis) puis();
            });
        }
    });
}


// Une peluche qui fait le mort : raide, couchée sur le côté.
function faireLeMort(p) {
    p.pose = Math.random() < 0.5 ? -82 : 82;
    p.bump = 6;
    if (typeof sonSynthe === "function") sonSynthe("tok", 0.6);
}


// Bob se fige là où il est, couché lui aussi.
function figerBob(bob, fige) {
    if (fige) {
        bob.isStatic = true;
        bob.angle = bob.flipX ? -82 : 82;
    } else {
        bob.angle = 0;
        bob.isStatic = false;
    }
}


// Ce qu'on se dit en se relevant. La première fois, tout le monde
// commente ; ensuite, juste un ou deux mots.
function repliquesApresLeReveil(premiereFois) {

    if (premiereFois) {
        return [
            { texte: "Klara s'est rendormie. Elle n'a rien vu." },
            { qui: "bluey", texte: "ON A FAIT LES MORTS !! TOUS ENSEMBLE !! C'EST LE MEILLEUR JEU DE LA NUIT !!" },
            { qui: "cakey", texte: "Le gâteau n'a rien. Je l'ai tenu en l'air tout du long." },
            { qui: "doudou", texte: "Moi, je n'ai pas couru. À mon âge, on fait le mort sur place. Personne ne voit la différence." },
            { qui: "samsam", texte: "Pour une fois, ne pas pouvoir me lever, ça m'a arrangé." },
            { qui: "bob", texte: "Pardon. Doucement, cette fois." },
        ];
    }

    const reserve = [
        { qui: "fraisy", texte: "J'ai fait la morte tellement bien que j'ai failli m'endormir pour de vrai." },
        { qui: "bluey", texte: "ENCORE !! ENFIN NON !! ENFIN SI !! ENFIN NON !!" },
        { qui: "cakey", texte: "Elle s'est rendormie en souriant. Elle devait rêver de quelque chose de joli." },
        { qui: "doudou", texte: "Elle a le sommeil de ceux qui se sentent chez eux, mon grand. Mais ne tire pas trop sur la corde." },
        { qui: "samsam", texte: "Elle a dit un mot en dormant. Je crois que c'était un prénom." },
        { qui: "fraisy", texte: "Si elle se réveille pour de bon, on lui propose un jus de mangue. Ça calme tout le monde." },
    ];
    const i = Math.floor(Math.random() * reserve.length);
    return [
        { texte: "Klara se retourne, et se rendort." },
        reserve[i],
        { qui: "bob", texte: "Pardon." },
    ];
}
