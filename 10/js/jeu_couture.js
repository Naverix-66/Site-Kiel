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

   On pose le doigt (ou on clique) n'importe où : la pièce est PRISE,
   et suit le geste à partir de là (elle ne saute jamais). Ou les flèches.
   Entre deux pièces, une petite pause.

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
    raideur: 3,           // souris/doigt : vitesse = écart x raideur
    vitesseSuivi: 150,    // ... plafonnée à ça

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
//
// Une aiguille est plantée dans la MOUSSE, jamais par-dessus le
// sillon d'à côté. Evan : entre deux sillons trop proches, on aurait
// dit qu'elle appartenait au voisin. Si son côté n'a pas la place,
// elle passe de l'autre côté ; si aucun n'a la place, pas d'aiguille.
const LONGUEUR_AIGUILLE = 16;

function planterLesAiguilles(piece) {
    const aiguilles = [];
    const c = piece.chemin;
    for (let i = 1; i < c.length - 1; i++) {
        const a = vec2(c[i][0], c[i][1]);
        const b = vec2(c[i + 1][0], c[i + 1][1]);
        const milieu = a.lerp(b, 0.5);
        const dir = b.sub(a).unit();
        const cotes = i % 2 === 0 ? [1, -1] : [-1, 1];
        for (let k = 0; k < cotes.length; k++) {
            const normale = vec2(-dir.y, dir.x).scale(cotes[k]);
            const pointe = milieu.add(normale.scale(piece.demi - 1));
            if (!aiguilleDansLaMousse(piece, pointe, normale)) continue;
            aiguilles.push({
                pos: pointe,
                dehors: normale,
                couleur: COULEURS_EPINGLES[i % COULEURS_EPINGLES.length],
            });
            break;
        }
    }
    return aiguilles;
}


// Toute l'aiguille, de la pointe à la tête, doit rester dans la
// mousse : loin des autres sillons, loin du sien, et dans la boîte.
function aiguilleDansLaMousse(piece, pointe, dehors) {
    for (let k = 4; k <= LONGUEUR_AIGUILLE + 4; k += 2) {
        const p = pointe.add(dehors.scale(k));
        if (p.x < 20 || p.x > COUTURE.L - 20 || p.y < 74 || p.y > COUTURE.H - 20) return false;
        if (plusProcheDuSillon(piece.chemin, p).distance < piece.demi + 1) return false;
        for (let j = 0; j < COUTURE.pieces.length; j++) {
            const autre = COUTURE.pieces[j];
            if (autre === piece) continue;
            if (plusProcheDuSillon(autre.chemin, p).distance < autre.demi + 4) return false;
        }
    }
    return true;
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
        prise: null,          // l'écart pointeur-pièce, au moment où on l'a prise
        reprise: 0,           // la pause entre deux pièces
    };

    commencerJeu(null);

    const page = ouvrirPage({
        titre: "La boîte à couture",
        consigne: "Sors l'épingle, puis la bobine, puis le dé. Ne touche ni les bords, ni les aiguilles.",
        aide: "Pose le doigt (ou clique) n'importe où et déplace-le : la pièce suit ton geste. Ou les flèches.",
        couleurVue: [58, 44, 38],
        dessiner: function (g) { dessinerLaCouture(g, pieces, etat); },
    });

    direDansLaPage(page, "D'abord, l'épingle.", 2);

    const boucle = boucleDeJeu(function () {

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

        // Une petite pause entre deux pièces : on souffle, et on
        // reprend la suivante tranquillement.
        if (time() < etat.reprise) {
            etat.prise = null;
            return;
        }

        // On PREND la pièce là où on pose le doigt (ou clique) : elle ne
        // saute jamais vers le pointeur, elle suit le geste à partir de
        // là. Evan : sinon la pièce suivante filait vers la souris, restée
        // loin, et BZZT tout de suite. Aux flèches : vitesse fixe.
        let voulue = vec2(0, 0);
        const tenu = pointeurTenu();
        if (tenu) {
            const coin = origineDeLaCouture(g);
            const souris = vec2((tenu.x - coin.x) / s, (tenu.y - coin.y) / s);
            if (!etat.prise) etat.prise = souris.sub(piece.pos);
            const cible = souris.sub(etat.prise);
            voulue = cible.sub(piece.pos).scale(C.raideur);
            if (voulue.len() > C.vitesseSuivi) voulue = voulue.unit().scale(C.vitesseSuivi);
        } else {
            etat.prise = null;
            const fleches = lireFleches();
            if (fleches.len() > 0) voulue = fleches.unit().scale(C.vitesseClavier);
        }
        let d = voulue.scale(dt());
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
            etat.reprise = time() + 0.9;
            etat.prise = null;
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

// Le coin de la boîte, à l'écran (elle est centrée dans la vue).
function origineDeLaCouture(g) {
    const s = echelleDeLaCouture(g);
    return vec2(g.vue.x + (g.vue.l - COUTURE.L * s) / 2, g.vue.y + (g.vue.h - COUTURE.H * s) / 2);
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
   LA PEINTURE — une fois, au chargement (voir pixels.js)
   ============================================================
   La boîte entière (bois, couvercle rembourré, coussin-tomate,
   mètre ruban, mousse, sillons, aiguilles) est UNE image. Les trois
   pièces et la patte de Bob sont de petites images à part, qu'on
   déplace.
   ============================================================ */
function peindreLaBoiteACouture() {

    const C = COUTURE;
    const t = nouvelleToile(C.L, C.H);
    const ctx = t.ctx;

    // ---- la boîte en bois ----
    boite(ctx, 0, 0, C.L, C.H, [150, 104, 68], [72, 46, 28]);
    pave(ctx, 2, 1, C.L - 4, 2, [184, 136, 94]);
    for (let y = 6; y < C.H - 4; y += 7) {
        const decalage = (y * 13) % 40;
        for (let x = 4 + decalage; x < C.L - 8; x += 46) pave(ctx, x, y, 18, 1, [136, 92, 58]);
    }
    boite(ctx, 8, 8, C.L - 16, C.H - 16, [196, 150, 104], [108, 72, 44]);
    pave(ctx, 9, 9, C.L - 18, 2, [214, 170, 124]);

    // ---- la mousse ----
    boite(ctx, 15, 70, C.L - 30, C.H - 86, [242, 230, 216], [176, 156, 136]);
    for (let x = 18; x < C.L - 18; x += 4) pave(ctx, x, C.sortie, 2, 1, [186, 156, 128]);

    // ---- les sillons, taillés dans la mousse ----
    // trois passes : le bord, l'ombre (en haut à gauche), le fond
    const suivreLeSillon = function (def, rayon, decalage, couleur) {
        const c = def.chemin;
        for (let i = 0; i < c.length - 1; i++) {
            const n = Math.ceil(Math.hypot(c[i + 1][0] - c[i][0], c[i + 1][1] - c[i][1]));
            for (let k = 0; k <= n; k++) {
                const x = c[i][0] + (c[i + 1][0] - c[i][0]) * k / n;
                const y = c[i][1] + (c[i + 1][1] - c[i][1]) * k / n;
                disque(ctx, Math.round(x + decalage), Math.round(y + decalage), rayon, couleur);
            }
        }
    };
    C.pieces.forEach(function (def) { suivreLeSillon(def, def.demi + 1, 0, [150, 112, 104]); });
    C.pieces.forEach(function (def) { suivreLeSillon(def, def.demi, 0, [184, 144, 140]); });
    C.pieces.forEach(function (def) { suivreLeSillon(def, def.demi - 1, 1, [214, 178, 174]); });

    // ---- les aiguilles, plantées au bord des sillons ----
    C.pieces.forEach(function (def) {
        planterLesAiguilles(def).forEach(function (a) {
            const tete = a.pos.add(a.dehors.scale(LONGUEUR_AIGUILLE));
            trait(ctx, a.pos.x, a.pos.y, tete.x, tete.y, [214, 218, 226]);
            trait(ctx, a.pos.x + 1, a.pos.y, tete.x + 1, tete.y, [150, 156, 166]);
            rond(ctx, Math.round(tete.x), Math.round(tete.y), 3, a.couleur, assombrir(a.couleur, 0.45));
            pixel(ctx, Math.round(tete.x) - 1, Math.round(tete.y) - 1, [255, 255, 255]);
            pave(ctx, Math.round(a.pos.x) - 1, Math.round(a.pos.y) - 1, 2, 2, [244, 248, 252]);
        });
    });

    // ---- en dernier, le couvercle : il recouvre le haut des sillons ----
    boite(ctx, 15, 14, C.L - 30, 50, [236, 202, 206], [166, 116, 124]);
    for (let y = 20; y < 60; y += 8) {
        for (let x = 22 + ((y / 8) % 2) * 6; x < C.L - 20; x += 12) {
            pixel(ctx, x, y, [206, 158, 166]);
            pixel(ctx, x + 1, y + 1, [248, 224, 228]);
        }
    }
    C.pieces.forEach(function (p) {
        const r = p.rayon + 3;
        for (let a = 0; a < 360; a += 20) {
            const rad = a * Math.PI / 180;
            pixel(ctx, p.rangement[0] + Math.cos(rad) * r, p.rangement[1] + Math.sin(rad) * r, [190, 140, 150]);
        }
    });

    // le coussin à épingles (une tomate)
    rond(ctx, 40, 39, 15, [206, 66, 66], [118, 30, 30]);
    for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 4;
        trait(ctx, 40 + Math.cos(a) * 14, 39 + Math.sin(a) * 14, 40 - Math.cos(a) * 14, 39 - Math.sin(a) * 14, [168, 46, 46]);
    }
    disque(ctx, 35, 33, 3, [236, 118, 112]);
    rond(ctx, 40, 39, 4, [96, 156, 90], [46, 90, 44]);
    [[29, 30], [51, 31], [46, 51], [31, 48]].forEach(function (e, k) {
        const bout = [e[0] + (e[0] - 40) * 0.45, e[1] + (e[1] - 39) * 0.45];
        trait(ctx, e[0], e[1], bout[0], bout[1], [214, 218, 226]);
        rond(ctx, Math.round(bout[0]), Math.round(bout[1]), 2, COULEURS_EPINGLES[k], assombrir(COULEURS_EPINGLES[k], 0.45));
    });

    // le mètre ruban
    pave(ctx, 226, 44, 26, 7, [150, 110, 30]);
    pave(ctx, 227, 45, 24, 5, [244, 224, 150]);
    for (let x = 229; x < 250; x += 3) pave(ctx, x, 45, 1, 2, [90, 70, 40]);
    rond(ctx, 262, 39, 14, [236, 200, 80], [148, 108, 28]);
    rond(ctx, 262, 39, 5, [122, 98, 58], [70, 54, 30]);
    disque(ctx, 257, 33, 2, [250, 228, 150]);

    return t.toile;
}


function peindreLEpingle() {
    const t = nouvelleToile(11, 27);
    pave(t.ctx, 5, 9, 1, 17, [214, 218, 226]);
    pave(t.ctx, 6, 9, 1, 16, [140, 146, 156]);
    rond(t.ctx, 5, 5, 5, [214, 64, 86], [128, 30, 50]);
    pave(t.ctx, 3, 3, 2, 2, [255, 196, 206]);
    return t.toile;
}

function peindreLaBobine() {
    const t = nouvelleToile(23, 23);
    rond(t.ctx, 11, 11, 11, [214, 176, 128], [118, 82, 48]);
    rond(t.ctx, 11, 11, 8, [86, 126, 196], [50, 80, 136]);
    for (let a = 0; a < 360; a += 12) {
        const rad = a * Math.PI / 180;
        pixel(t.ctx, 11 + Math.cos(rad) * 6, 11 + Math.sin(rad) * 6, [140, 176, 232]);
    }
    rond(t.ctx, 11, 11, 3, [96, 64, 40], [60, 40, 24]);
    pave(t.ctx, 5, 5, 2, 2, [236, 206, 160]);
    return t.toile;
}

function peindreLeDe() {
    const t = nouvelleToile(27, 27);
    rond(t.ctx, 13, 13, 13, [198, 204, 214], [98, 104, 116]);
    for (let a = 0; a < 360; a += 8) {
        const rad = a * Math.PI / 180;
        pixel(t.ctx, 13 + Math.cos(rad) * 10, 13 + Math.sin(rad) * 10, [156, 162, 174]);
    }
    for (let x = -7; x <= 7; x += 3) {
        for (let y = -7; y <= 7; y += 3) {
            if (x * x + y * y > 50) continue;
            pixel(t.ctx, 13 + x, 13 + y, [136, 142, 154]);
        }
    }
    disque(t.ctx, 9, 9, 2, [240, 244, 250]);
    return t.toile;
}

function peindreLaPatteRouge() {
    const t = nouvelleToile(15, 15);
    rond(t.ctx, 7, 7, 7, [222, 60, 50], [120, 24, 20]);
    disque(t.ctx, 7, 8, 3, [255, 190, 170]);
    return t.toile;
}

loadSprite("boite_a_couture", peindreLaBoiteACouture());
loadSprite("couture_epingle", peindreLEpingle());
loadSprite("couture_bobine", peindreLaBobine());
loadSprite("couture_de", peindreLeDe());
loadSprite("patte_de_bob_rouge", peindreLaPatteRouge());

// Chaque pièce : son image, sa taille, et le point qui correspond à
// sa position (la tête de l'épingle, le centre des deux autres).
const SPRITES_COUTURE = {
    epingle: { sprite: "couture_epingle", l: 11, h: 27, ax: 5.5, ay: 5 },
    bobine: { sprite: "couture_bobine", l: 23, h: 23, ax: 11.5, ay: 11.5 },
    de: { sprite: "couture_de", l: 27, h: 27, ax: 13.5, ay: 13.5 },
};


/* ============================================================
   L'AFFICHAGE, à chaque image
   ============================================================ */
function dessinerLaCouture(g, pieces, etat) {

    const C = COUTURE;
    const vue = g.vue;
    const s = echelleDeLaCouture(g);
    const o = origineDeLaCouture(g);
    const P = function (x, y) { return vec2(o.x + x * s, o.y + y * s); };

    drawSprite({ sprite: "boite_a_couture", pos: P(0, 0), width: C.L * s, height: C.H * s });

    // L'aiguille qu'on frôle presque brille en rouge.
    if (!etat.fini) {
        const p = pieces[etat.courante];
        p.aiguilles.forEach(function (a) {
            if (p.pos.dist(a.pos) < p.def.rayon + 9) {
                drawRect({ pos: P(a.pos.x - 2, a.pos.y - 2), width: 4 * s, height: 4 * s, color: rgb(255, 110, 90), opacity: 0.6 + 0.4 * Math.sin(time() * 14) });
            }
        });
    }

    // Les pièces : celles qui attendent leur tour sont un peu éteintes.
    pieces.forEach(function (p, i) {
        const d = SPRITES_COUTURE[p.def.type];
        drawSprite({
            sprite: d.sprite, pos: P(p.pos.x - d.ax, p.pos.y - d.ay), width: d.l * s, height: d.h * s,
            opacity: i === etat.courante || p.sortie ? 1 : 0.8,
        });
    });

    // La patte de Bob, sur la pièce qu'on tient. Rouge au BZZT : le nez
    // du Docteur Maboule.
    if (!etat.fini) {
        const p = pieces[etat.courante];
        const c = P(p.pos.x + p.def.rayon * 0.7, p.pos.y - p.def.rayon * 0.7);
        drawSprite({ sprite: etat.eclair > 0.05 ? "patte_de_bob_rouge" : "patte_de_bob", pos: c, anchor: "center", width: 15 * s, height: 15 * s });
    }

    // Le BZZT : tout clignote en rouge.
    if (etat.eclair > 0) {
        drawRect({ pos: vec2(vue.x, vue.y), width: vue.l, height: vue.h, color: rgb(230, 60, 50), opacity: etat.eclair * 0.35 });
    }
}
