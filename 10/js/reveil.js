/* ============================================================
   KLARA — elle dort, et parfois elle se réveille
   ============================================================
   Klara dort dans son lit, sous la couette jusqu'aux oreilles : on
   ne voit d'elle qu'une forme sous le tissu (on ne dessine pas son
   visage à sa place — si un jour Evan fait son dessin, il ira ici).

   Quand la jauge du sommeil déborde (jeux.js), le petit jeu se met
   en pause et on revient dans le studio :

     1. la caméra plonge vers le lit ; la forme sous la couette
        remue ; en bas de l'écran, sous-titré à SON nom :
        « Klara : …mmh ? … c'est quoi, ce bruit… »
     2. PANIQUE : tout le monde court se ranger au pied du lit, et
        s'effondre, raide, comme une peluche qu'on a posée là.
        Doudou ne court pas : il fait le mort sur place. Samsam non
        plus : il ne peut pas se lever, et pour une fois, ça tombe
        bien. Bob, lui, se fige là où il est.
     3. « Klara : …zzz ». Elle s'est rendormie.
     4. tout le monde se relève et retourne à sa place, deux
        répliques, et on reprend le jeu exactement où on en était.

   Ce n'est PAS une punition : c'est un gag, et on ne perd rien.
   ============================================================ */


// Où chacun court se ranger : le parquet au pied du lit (colonne 6,
// entre le lit et le tapis). Ceux qui n'ont pas de place font le
// mort sur place.
const PLACES_DE_PANIQUE = {
    cakey: [6, 6],
    fraisy: [6, 8],
    bluey: [6, 10],
};

// Le lit (G dans le plan) va des cases 1 à 5, lignes 5 à 11. La tête
// de lit est à GAUCHE : Klara dort la tête contre elle, allongée
// vers la droite, dans la moitié haute (Bob dort juste en dessous).
const KLARA_AU_LIT = { x: 58, y: 230, l: 104, h: 42 };
const TETE_DE_KLARA = vec2(KLARA_AU_LIT.x + 14, KLARA_AU_LIT.y + 20);

const klara = { forme: null };


/* ------------------------------------------------------------
   La forme sous la couette : pas un dessin de Klara, une OMBRE
   posée sur la couette du lit (reflet en haut, ombre en bas), qui
   laisse voir les rayures du tissu au travers.
   ------------------------------------------------------------ */
function peindreKlaraSousLaCouette() {

    const K = KLARA_AU_LIT;
    const t = nouvelleToile(K.l, K.h);
    const ctx = t.ctx;
    const milieu = K.h / 2;

    // La demi-épaisseur de la forme, colonne par colonne : la tête
    // (ronde), puis les épaules, la taille, les hanches, les jambes.
    const epaisseur = function (x) {
        if (x < 24) {
            const d = x - 12;
            return Math.sqrt(Math.max(0, 144 - d * d)) * 0.95;
        }
        const points = [[24, 12], [34, 17], [54, 14], [68, 16], [86, 12], [103, 7]];
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];
            if (x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
        }
        return 0;
    };

    for (let x = 0; x < K.l; x++) {
        const e = Math.round(epaisseur(x));
        if (e < 2) continue;
        const haut = Math.round(milieu - e);
        const bas = Math.round(milieu + e);
        for (let y = haut; y <= bas; y++) {
            const f = (y - haut) / (bas - haut);
            if (f < 0.3) pixel(ctx, x, y, [255, 255, 255, 0.24 - f * 0.5]);
            else if (f > 0.62) pixel(ctx, x, y, [40, 60, 110, (f - 0.62) * 0.55]);
        }
        pixel(ctx, x, haut, [255, 255, 255, 0.45]);
        pixel(ctx, x, bas, [60, 80, 130, 0.55]);
        pixel(ctx, x, bas + 1, [60, 80, 130, 0.3]);
    }
    // le creux entre la tête et les épaules
    for (let y = milieu - 9; y <= milieu + 9; y++) pixel(ctx, 24, y, [60, 80, 130, 0.35]);

    return t.toile;
}

loadSprite("klara_sous_la_couette", peindreKlaraSousLaCouette());


// Appelée par la scène, après les meubles.
function coucherKlara() {
    const lit = get("image-lit_klara")[0];
    klara.forme = add([
        sprite("klara_sous_la_couette"),
        pos(KLARA_AU_LIT.x, KLARA_AU_LIT.y),
        scale(1),
        z(lit ? lit.z + 1 : Z_DECOR + 400),
        "klara",
    ]);
}


/* ------------------------------------------------------------
   Les sous-titres de Klara : en bas de l'écran, à son nom, sans
   qu'on ait à appuyer. C'est ce qui dit, sans le moindre doute,
   que c'est ELLE qui se réveille.
   ------------------------------------------------------------ */
function creerSousTitre() {
    const st = {};
    st.fond = add([rect(10, 10, { radius: 10 }), pos(0, 0), color(...COULEUR_CREME), outline(3, rgb(...COULEUR_ACCENT)), opacity(0), fixed(), z(Z_INTERFACE + 38)]);
    st.nom = add([text("Klara", { size: 16 }), pos(0, 0), color(...COULEUR_ACCENT_FONCE), opacity(0), fixed(), z(Z_INTERFACE + 39)]);
    st.texte = add([text("", { size: 18, width: 300 }), pos(0, 0), color(...COULEUR_ENCRE), opacity(0), fixed(), z(Z_INTERFACE + 39)]);
    st.placer = function (opacite) {
        const t = echelleInterface();
        const l = Math.min(width() - 32, 520);
        const x = (width() - l) / 2;
        st.nom.textSize = t - 1;
        st.texte.textSize = t + 2;
        st.texte.width = l - 32;
        const h = 14 + (t - 1) + 6 + st.texte.height + 14;
        const y = height() - h - 20;
        st.fond.pos = vec2(x, y);
        st.fond.width = l;
        st.fond.height = h;
        st.nom.pos = vec2(x + 16, y + 12);
        st.texte.pos = vec2(x + 16, y + 12 + t + 5);
        st.fond.opacity = opacite;
        st.nom.opacity = opacite;
        st.texte.opacity = opacite;
    };
    st.detruire = function () { destroy(st.fond); destroy(st.nom); destroy(st.texte); };
    return st;
}


/* ============================================================
   reveillerKlara(puis) — la scène
   ============================================================ */
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
    const sousTitre = creerSousTitre();

    // La caméra plonge vers le lit, et s'approche.
    jeu.regard = bob ? bob.pos : TETE_DE_KLARA;
    const zoomAvant = vie.zoomVoulu;
    vie.zoomVoulu = vie.zoomBase * 1.45;
    const litVu = TETE_DE_KLARA.add(vec2(40, 10));

    shake(8);
    if (typeof sonSynthe === "function") sonSynthe("tok", 1.5);

    let etape = 0;
    let fini = false;

    const dire = function (texte) { sousTitre.texte.text = texte; };

    const boucle = onUpdate(function () {

        const t = time() - debut;

        jeu.regard = jeu.regard.lerp(etape < 4 ? litVu : (bob ? bob.pos : litVu), Math.min(1, dt() * 3));

        // Le bandeau, les premières secondes.
        const k = t < 0.25 ? t / 0.25 : (t < 2.2 ? 1 : Math.max(0, 1 - (t - 2.2) / 0.4));
        bandeau.textSize = Math.round(Math.max(20, Math.min(40, width() * 0.06)));
        bandeau.pos = vec2(width() / 2, height() * 0.16);
        bandeau.opacity = k;
        fondBandeau.pos = bandeau.pos;
        fondBandeau.width = bandeau.width + 40;
        fondBandeau.height = bandeau.height + 20;
        fondBandeau.opacity = 0.92 * k * (0.85 + 0.15 * Math.sin(time() * 14));

        // Les sous-titres de Klara.
        sousTitre.placer(etape >= 1 && etape < 4 ? 1 : 0);

        // Klara remue sous la couette tant qu'elle n'est pas rendormie :
        // elle se tourne à moitié, puis retombe.
        if (klara.forme) {
            const remue = t > 0.2 && t < 3.3;
            const a = remue ? Math.sin(t * 9) * Math.min(1, (3.3 - t)) : 0;
            klara.forme.pos = vec2(KLARA_AU_LIT.x + a * 1.5, KLARA_AU_LIT.y - Math.abs(a) * 2);
            klara.forme.scale = vec2(1, 1 + Math.abs(a) * 0.12);
        }

        // 1. « …mmh ? »
        if (etape === 0 && t > 0.3) {
            etape = 1;
            dire("...mmh ?");

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

        if (etape === 1 && t > 1.5) {
            etape = 2;
            dire("...c'est quoi, ce bruit...");
        }

        // Ceux qui traînent arrivent d'un coup.
        if (etape === 2 && t > 2.6) {
            etape = 3;
            terminerLesMarches();
            dire("...");
        }

        // 3. Elle se rendort.
        if (etape === 3 && t > 3.4) {
            etape = 35;
            dire("...zzz");
            sommeil.bruit = 0;
        }

        // 4. Tout le monde se relève.
        if (etape === 35 && t > 4.8) {
            etape = 4;
            vie.zoomVoulu = zoomAvant;
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

        if (etape === 4 && t > 5.4 && !fini) {
            fini = true;
            boucle.cancel();
            destroy(bandeau);
            destroy(fondBandeau);
            sousTitre.detruire();
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
// commente ; ensuite, juste un mot ou deux.
function repliquesApresLeReveil(premiereFois) {

    if (premiereFois) {
        return [
            { texte: "Klara se retourne sous la couette. Et elle se rendort. Elle n'a rien vu." },
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
