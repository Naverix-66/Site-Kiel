/* ============================================================
   LA BOÎTE À COUTURE — un Docteur Maboule
   ============================================================
   La boîte que la maman de Klara lui a offerte, vue de dessus. Le
   dé à coudre est tout au fond. Pour l'atteindre, il faut d'abord
   sortir l'épingle, puis la bobine, puis le dé lui-même — chacun
   par son sillon, taillé dans la mousse, jusqu'au couvercle.

   Comme au Docteur Maboule :
     - toucher le bord du sillon, ou une des aiguilles plantées
       tout autour : BZZT. « Aïe ! » La patte de Bob s'allume en
       rouge, et ça fait du bruit (la jauge du sommeil de Klara).
       On ne perd rien : la pièce reste où elle est. Seule Klara
       risque de se réveiller ;
     - on sort les trois pièces, dans l'ordre ;
     - tout est rangé dans le couvercle, pour être remis EXACTEMENT
       à sa place demain.

   Même commande que la vaisselle : un doigt qui glisse n'importe
   où (ou les flèches).

   ------------------------------------------------------------
   RÉGLER
     COUTURE.pieces   le sillon de chacune (points, du fond vers la
                      sortie), sa demi-largeur, et la taille de la
                      pièce. Marge = demi - rayon : plus elle est
                      petite, plus c'est dur.
   Tout est en « unités de boîte » (300 x 400).
   ============================================================ */


const COUTURE = {
    L: 300,
    H: 400,
    sortie: 66,           // au-dessus de cette ligne, la pièce est sortie
    vitesseClavier: 55,

    pieces: [
        {
            nom: "l'épingle", type: "epingle", rayon: 5, demi: 13,
            chemin: [[60, 345], [60, 285], [88, 245], [88, 175], [58, 135], [58, 60]],
            rangement: [96, 38],
        },
        {
            nom: "la bobine", type: "bobine", rayon: 10, demi: 17,
            chemin: [[240, 345], [240, 292], [212, 252], [212, 182], [244, 142], [244, 102], [226, 60]],
            rangement: [150, 38],
        },
        {
            nom: "le dé", type: "de", rayon: 12, demi: 18,
            chemin: [[150, 372], [150, 325], [126, 290], [126, 245], [174, 205], [174, 160], [134, 122], [150, 60]],
            rangement: [204, 38],
        },
    ],
};

const COULEURS_EPINGLES = [[214, 64, 86], [86, 126, 196], [236, 190, 70], [110, 170, 110], [180, 110, 200]];


// Les aiguilles plantées au bord des sillons : une au milieu de
// chaque segment intérieur, d'un côté puis de l'autre. Elles
// débordent un peu dans le sillon — c'est tout le jeu.
function planterLesAiguilles(piece) {
    const aiguilles = [];
    const c = piece.chemin;
    for (let i = 1; i < c.length - 1; i++) {
        const a = vec2(c[i][0], c[i][1]);
        const b = vec2(c[i + 1][0], c[i + 1][1]);
        const milieu = a.lerp(b, 0.5);
        const dir = b.sub(a).unit();
        const normale = vec2(-dir.y, dir.x).scale(i % 2 === 0 ? 1 : -1);
        aiguilles.push({
            pos: milieu.add(normale.scale(piece.demi - 1)),
            dehors: normale,
            couleur: COULEURS_EPINGLES[i % COULEURS_EPINGLES.length],
        });
    }
    return aiguilles;
}


// Le point le plus proche d'un sillon, et la distance.
function plusProcheDuSillon(chemin, p) {
    let meilleur = null;
    let d = Infinity;
    for (let i = 0; i < chemin.length - 1; i++) {
        const a = vec2(chemin[i][0], chemin[i][1]);
        const b = vec2(chemin[i + 1][0], chemin[i + 1][1]);
        const ab = b.sub(a);
        const t = Math.max(0, Math.min(1, p.sub(a).dot(ab) / ab.dot(ab)));
        const q = a.add(ab.scale(t));
        const dq = p.dist(q);
        if (dq < d) { d = dq; meilleur = q; }
    }
    return { point: meilleur, distance: d };
}


/* ============================================================
   jeuDeLaCouture({ puis })
   ============================================================
   puis(aie) reçoit le nombre de « Aïe ».
   ============================================================ */
function jeuDeLaCouture(o) {

    const C = COUTURE;
    const pieces = C.pieces.map(function (p) {
        return {
            def: p,
            pos: vec2(p.chemin[0][0], p.chemin[0][1]),
            sortie: false,
            rangee: false,
            aiguilles: planterLesAiguilles(p),
        };
    });

    const etat = {
        courante: 0,
        aie: 0,
        eclair: 0,            // le flash rouge du BZZT
        invulnerable: 0,
        fini: false,
        depuis: 0,
    };

    commencerJeu(null);

    const page = ouvrirPage({
        titre: "La boîte à couture",
        consigne: "Sors l'épingle, puis la bobine, puis le dé. Ne touche ni les bords, ni les aiguilles.",
        aide: "Fais glisser ton doigt n'importe où (ou les flèches).",
        couleurVue: [58, 44, 38],
        dessiner: function (g) { dessinerLaCouture(g, pieces, etat); },
    });

    direDansLaPage(page, "D'abord, l'épingle.", 2);

    const boucle = onUpdate(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();
        const g = placerPage(page);
        if (surveillerLeSommeil(page)) return;

        etat.eclair = Math.max(0, etat.eclair - dt() * 2.5);

        // Les pièces sorties vont se ranger dans le couvercle.
        pieces.forEach(function (p) {
            if (p.sortie && !p.rangee) {
                const cible = vec2(p.def.rangement[0], p.def.rangement[1]);
                p.pos = p.pos.lerp(cible, Math.min(1, dt() * 6));
                if (p.pos.dist(cible) < 0.5) { p.pos = cible; p.rangee = true; }
            }
        });

        if (etat.fini) {
            if (time() - etat.depuis > 1.6) {
                boucle.cancel();
                finirJeu();
                if (o.puis) o.puis(etat.aie);
            }
            return;
        }

        const piece = pieces[etat.courante];
        const s = echelleDeLaCouture(g);

        // Sur un petit écran, le doigt va un peu plus vite que la pièce :
        // on garde de la précision même quand tout est dessiné petit.
        let d = lireGlisse().scale(1 / Math.max(s, 1.3));
        const fleches = lireFleches();
        if (fleches.len() > 0) d = d.add(fleches.unit().scale(C.vitesseClavier * dt()));
        if (d.len() > 20) d = d.unit().scale(20);

        const pas = Math.max(1, Math.ceil(d.len() / 1.5));
        for (let i = 0; i < pas; i++) {
            piece.pos = piece.pos.add(d.scale(1 / pas));
            if (heurterLaCouture(piece, etat, page)) break;
        }

        // Sortie !
        if (piece.pos.y < C.sortie) {
            piece.sortie = true;
            if (typeof jouerSon === "function") jouerSon("pop", { vitesse: 1 + 0.15 * etat.courante });
            etat.courante++;
            if (etat.courante >= pieces.length) {
                etat.fini = true;
                etat.depuis = time();
                direDansLaPage(page, "Le dé ! Et tout est rangé, prêt à être remis à sa place.", 2.2, COULEUR_OR);
            } else {
                const suivante = pieces[etat.courante].def.nom;
                direDansLaPage(page, (etat.courante === 1 ? "L'épingle est sortie. Maintenant, " : "La bobine aussi. Et maintenant, ") + suivante + ".", 2.2);
            }
        }
    });
}


function echelleDeLaCouture(g) {
    return Math.min(g.vue.l / COUTURE.L, g.vue.h / COUTURE.H);
}


// La pièce contre le bord de son sillon et contre les aiguilles.
// Elle est repoussée à l'intérieur ; au premier contact, BZZT.
// Renvoie true s'il y a eu un BZZT.
function heurterLaCouture(piece, etat, page) {

    const def = piece.def;
    let touche = false;

    const proche = plusProcheDuSillon(def.chemin, piece.pos);
    const limite = def.demi - def.rayon;
    if (proche.distance > limite) {
        const retour = piece.pos.sub(proche.point).unit().scale(limite - 0.2);
        piece.pos = proche.point.add(retour);
        touche = true;
    }

    piece.aiguilles.forEach(function (a) {
        const d = piece.pos.dist(a.pos);
        const mini = def.rayon + 2.5;
        if (d < mini) {
            const dir = d > 0.001 ? piece.pos.sub(a.pos).unit() : a.dehors.scale(-1);
            piece.pos = a.pos.add(dir.scale(mini + 0.2));
            touche = true;
        }
    });

    if (touche && time() > etat.invulnerable) {
        etat.invulnerable = time() + 0.7;
        etat.eclair = 1;
        etat.aie++;
        faireDuBruit(0.2);
        shake(4);
        if (typeof sonSynthe === "function") sonSynthe("bzzt");
        const cris = ["BZZT ! Aïe !", "Aïe. Une aiguille.", "BZZT ! Pardon, pardon.", "Aïe ! (tout bas)"];
        direDansLaPage(page, cris[(etat.aie - 1) % cris.length], 1.1, [255, 150, 130]);
        return true;
    }
    return false;
}


/* ============================================================
   LE DESSIN
   ============================================================ */
function dessinerLaCouture(g, pieces, etat) {

    const C = COUTURE;
    const vue = g.vue;
    const s = echelleDeLaCouture(g);
    const ox = vue.x + (vue.l - C.L * s) / 2;
    const oy = vue.y + (vue.h - C.H * s) / 2;
    const P = function (x, y) { return vec2(ox + x * s, oy + y * s); };

    // ---- la boîte ----
    drawRect({ pos: P(0, 0), width: C.L * s, height: C.H * s, radius: 16 * s, color: rgb(150, 104, 68), outline: { width: 3, color: rgb(96, 64, 40) } });
    drawRect({ pos: P(9, 9), width: (C.L - 18) * s, height: (C.H - 18) * s, radius: 11 * s, color: rgb(196, 150, 104) });

    // ---- le couvercle rembourré, en haut : on y range ce qu'on sort ----
    drawRect({ pos: P(16, 15), width: (C.L - 32) * s, height: 48 * s, radius: 8 * s, color: rgb(236, 202, 206) });
    for (let x = 26; x < C.L - 20; x += 14) {
        for (let y = 22; y < 60; y += 12) {
            drawCircle({ pos: P(x + (y % 24 === 22 ? 0 : 7), y), radius: 1.1 * s, color: rgb(214, 168, 176) });
        }
    }
    pieces.forEach(function (p) {
        drawCircle({ pos: P(p.def.rangement[0], p.def.rangement[1]), radius: (p.def.rayon + 3) * s, fill: false, outline: { width: 1, color: rgb(200, 150, 160) } });
    });

    // le coussin à épingles (une tomate), et le mètre ruban
    drawCircle({ pos: P(40, 39), radius: 15 * s, color: rgb(208, 68, 68), outline: { width: 1.5, color: rgb(150, 40, 40) } });
    for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 4;
        drawLine({ p1: P(40 + Math.cos(a) * 15, 39 + Math.sin(a) * 15), p2: P(40 - Math.cos(a) * 15, 39 - Math.sin(a) * 15), width: 1, color: rgb(170, 48, 48) });
    }
    drawCircle({ pos: P(40, 39), radius: 4 * s, color: rgb(90, 150, 90) });
    [[30, 30], [50, 32], [44, 50], [32, 47]].forEach(function (e, k) {
        drawLine({ p1: P(e[0], e[1]), p2: P(e[0] + (e[0] - 40) * 0.5, e[1] + (e[1] - 39) * 0.5), width: 1.2, color: rgb(210, 214, 222) });
        drawCircle({ pos: P(e[0] + (e[0] - 40) * 0.5, e[1] + (e[1] - 39) * 0.5), radius: 2 * s, color: rgb(...COULEURS_EPINGLES[k]) });
    });
    drawCircle({ pos: P(262, 39), radius: 14 * s, color: rgb(236, 200, 80), outline: { width: 1.5, color: rgb(170, 130, 40) } });
    drawCircle({ pos: P(262, 39), radius: 5 * s, color: rgb(120, 96, 56) });

    // ---- la mousse, et ses sillons ----
    drawRect({ pos: P(16, 70), width: (C.L - 32) * s, height: (C.H - 86) * s, radius: 8 * s, color: rgb(242, 230, 216) });
    drawLine({ p1: P(18, C.sortie), p2: P(C.L - 18, C.sortie), width: 1, color: rgb(170, 130, 100), opacity: 0.6 });

    pieces.forEach(function (p, i) {
        const actif = i === etat.courante && !etat.fini;
        dessinerSillon(p.def, P, s, [150, 112, 104], p.def.demi + 1.5);
        dessinerSillon(p.def, P, s, actif ? [222, 184, 180] : [206, 170, 166], p.def.demi);
    });

    // ---- les aiguilles ----
    pieces.forEach(function (p, i) {
        if (p.sortie) return;
        p.aiguilles.forEach(function (a) {
            const pointe = a.pos;
            const tete = pointe.add(a.dehors.scale(16));
            const proche = i === etat.courante && p.pos.dist(pointe) < p.def.rayon + 10;
            drawLine({ p1: P(pointe.x, pointe.y), p2: P(tete.x, tete.y), width: 1.6 * s, color: rgb(205, 210, 218) });
            drawCircle({ pos: P(tete.x, tete.y), radius: 2.8 * s, color: rgb(...a.couleur) });
            drawCircle({ pos: P(pointe.x, pointe.y), radius: 2.5 * s, color: proche ? rgb(255, 150, 130) : rgb(236, 240, 246) });
        });
    });

    // ---- les pièces ----
    pieces.forEach(function (p, i) {
        dessinerPiece(p.def.type, P(p.pos.x, p.pos.y), s, i === etat.courante || p.sortie ? 1 : 0.75);
    });

    // ---- la patte de Bob, sur la pièce qu'on tient ----
    if (!etat.fini) {
        const p = pieces[etat.courante];
        const c = P(p.pos.x + p.def.rayon * 0.6, p.pos.y - p.def.rayon * 0.6);
        const rouge = etat.eclair > 0.05;
        drawCircle({ pos: c, radius: 6 * s, color: rouge ? rgb(220, 60, 50) : rgb(62, 49, 40), outline: { width: 1.5, color: rgb(30, 24, 20) } });
        drawCircle({ pos: c.add(vec2(-1.5 * s, 1.5 * s)), radius: 2.4 * s, color: rgb(233, 212, 186) });
    }

    // ---- le BZZT : tout clignote en rouge ----
    if (etat.eclair > 0) {
        drawRect({ pos: vec2(vue.x, vue.y), width: vue.l, height: vue.h, color: rgb(230, 60, 50), opacity: etat.eclair * 0.35 });
    }
}


function dessinerSillon(def, P, s, couleur, demi) {
    const c = def.chemin;
    for (let i = 0; i < c.length - 1; i++) {
        drawLine({ p1: P(c[i][0], c[i][1]), p2: P(c[i + 1][0], c[i + 1][1]), width: 2 * demi * s, color: rgb(...couleur) });
    }
    c.forEach(function (pt) {
        drawCircle({ pos: P(pt[0], pt[1]), radius: demi * s, color: rgb(...couleur) });
    });
}


function dessinerPiece(type, c, s, alpha) {

    if (type === "epingle") {
        drawLine({ p1: c, p2: c.add(vec2(0, 20 * s)), width: 1.6 * s, color: rgb(205, 210, 218), opacity: alpha });
        drawCircle({ pos: c, radius: 5 * s, color: rgb(214, 64, 86), opacity: alpha, outline: { width: 1, color: rgb(150, 40, 60) } });
        drawCircle({ pos: c.add(vec2(-1.5 * s, -1.5 * s)), radius: 1.4 * s, color: rgb(255, 255, 255), opacity: 0.8 * alpha });

    } else if (type === "bobine") {
        drawCircle({ pos: c, radius: 10 * s, color: rgb(214, 176, 128), opacity: alpha, outline: { width: 1.2, color: rgb(150, 110, 70) } });
        drawCircle({ pos: c, radius: 7.5 * s, color: rgb(86, 126, 196), opacity: alpha });
        drawCircle({ pos: c, radius: 5.5 * s, fill: false, opacity: 0.5 * alpha, outline: { width: 1, color: rgb(140, 176, 230) } });
        drawCircle({ pos: c, radius: 2.4 * s, color: rgb(90, 60, 40), opacity: alpha });

    } else if (type === "de") {
        drawCircle({ pos: c, radius: 12 * s, color: rgb(198, 204, 214), opacity: alpha, outline: { width: 1.5, color: rgb(128, 134, 146) } });
        drawCircle({ pos: c, radius: 9.5 * s, fill: false, opacity: alpha, outline: { width: 1, color: rgb(160, 166, 178) } });
        for (let x = -6; x <= 6; x += 3) {
            for (let y = -6; y <= 6; y += 3) {
                if (x * x + y * y > 40) continue;
                drawCircle({ pos: c.add(vec2(x * s, y * s)), radius: 0.9 * s, color: rgb(140, 146, 158), opacity: alpha });
            }
        }
        drawCircle({ pos: c.add(vec2(-4 * s, -4 * s)), radius: 2 * s, color: rgb(255, 255, 255), opacity: 0.5 * alpha });
    }
}
