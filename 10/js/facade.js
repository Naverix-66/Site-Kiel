/* ============================================================
   LA FAÇADE — le décor de l'acte III
   ============================================================
   Peinte au chargement, pixel par pixel, d'après la photo de
   l'immeuble qu'Evan a envoyée : brique rouge sombre montée en
   panneresses, encadrements blancs, une descente de gouttière
   entre deux travées, les soupiraux au ras du sol et de l'herbe
   haute qui monte jusqu'au bas du mur.

   ------------------------------------------------------------
   LE REPÈRE

   Tout se mesure en "pixels de façade", y vers le BAS, depuis le
   coin haut-gauche de la toile. La scène (acte3.js) travaille
   dans ces mêmes coordonnées : pas de conversion, jamais.

        y = 30    le bas du bandeau de toit
        y = 196   l'appui de la fenêtre de Klara (2e étage)
        y = 456   l'appui du 1er
        y = 716   l'appui du rez-de-chaussée
        y = 900   l'herbe

   Bob fait 56 px de haut : la descente fait donc douze Bob et
   demi, ce qui est exactement ce que deux étages représentent
   pour une peluche de soixante-dix centimètres.

   ------------------------------------------------------------
   LA NUIT

   Le mur est peint DÉJÀ sombre, à la lumière de la ville : on ne
   pose pas un voile noir par-dessus une façade de jour, ça donne
   toujours du gris. Les lumières (le phare de Klara, une fenêtre
   de voisin qui s'allume) sont ajoutées au-dessus, à l'image,
   par la scène — elles doivent pouvoir bouger et s'éteindre.
   ============================================================ */


const FACADE = {

    L: 620,
    H: 1000,

    toit: 30,          // sous le bandeau de rive
    beton: 858,        // haut du soubassement
    herbe: 900,        // le sol de la cour
    bas: 1000,

    // Les quatre travées de fenêtres, de gauche à droite. La photo
    // en montre une étroite coupée par le bord, deux larges, et une
    // étroite à droite avant l'immeuble en retour.
    travees: [
        { x: 14,  l: 48,  carreaux: 1 },
        { x: 108, l: 132, carreaux: 2 },
        { x: 300, l: 140, carreaux: 2 },   // celle de Klara
        { x: 496, l: 50,  carreaux: 1 },
    ],
    traveeDeKlara: 2,

    baies: [100, 360, 620],   // le haut de la baie, par étage
    hauteurBaie: 96,
    appuis: [196, 456, 716],  // le dessus de l'appui, par étage

    gouttiere: { x: 254, l: 18 },

    // Ce qui dépasse du mur, et qu'il faut contourner en se
    // balançant. acte3.js reprend ces mesures telles quelles pour
    // savoir ce que Bob touche : un obstacle qu'on voit et un
    // obstacle qui cogne ne doivent jamais être à deux endroits.
    // Elles se suivent de haut en bas sans jamais se contredire :
    // le fil ferme la gauche, le jet du collier garde la gauche
    // fermée, puis la parabole ferme la droite. On passe donc à
    // droite, puis on traverse à gauche.
    jardiniere: { x: 296, l: 42, y: 428, h: 28 },
    fil: { x0: 262, x1: 404, y: 506, creux: 16 },
    fuite: { y: 584, portee: 158 },
    parabole: { x: 452, y: 672, r: 30 },

    // Le cordon de briques saillantes entre le 2e et le 1er.
    bandeau: { y: 326, h: 10 },

    aile: 566,                // l'immeuble en retour, tout à droite

    // Là où le pyjama de Samsam est noué, et la ligne de descente.
    ancre: { x: 370, y: 190 },

    soupiraux: [150, 300, 450],
};


const COUL_FACADE = {
    ciel:       [26, 28, 42],
    rive:       [34, 31, 34],
    bandeauToit:[104, 101, 96],

    joint:      [70, 64, 64],
    briques: [
        [78, 46, 38], [86, 52, 42], [68, 40, 34],
        [92, 58, 46], [74, 48, 42], [82, 48, 36],
    ],
    briqueRare: [58, 35, 31],
    briqueClaire: [104, 68, 54],

    cadre:      [146, 144, 138],
    cadreOmbre: [92, 90, 86],
    vitre:      [28, 32, 42],
    reflet:     [46, 55, 72],
    rideau:     [96, 92, 88],
    plante:     [48, 66, 48],

    appui:      [92, 90, 88],
    appuiHaut:  [124, 122, 118],
    ombre:      [20, 18, 24],

    tuyau:      [52, 54, 60],
    tuyauClair: [92, 96, 104],
    tuyauSombre:[30, 31, 36],

    beton:      [68, 66, 68],
    soupirail:  [20, 20, 24],
    barreau:    [56, 56, 60],

    terre:      [32, 34, 28],
    herbes: [[48, 62, 40], [40, 54, 36], [58, 72, 46], [36, 46, 32]],
    herbeSeche: [76, 72, 50],

    toile:      [128, 132, 138],
};


/* ============================================================
   LA PEINTURE
   ============================================================ */
function peindreLaFacade() {

    const t = nouvelleToile(FACADE.L, FACADE.H);
    const ctx = t.ctx;
    const alea = hasardFixe(20261008);   // le mur est toujours le même

    // Le ciel qu'on devine au-dessus du toit.
    pave(ctx, 0, 0, FACADE.L, FACADE.toit, COUL_FACADE.ciel);

    peindreLaBrique(ctx, alea);
    peindreLeBandeau(ctx, alea);

    // Les fenêtres, étage par étage et travée par travée.
    FACADE.baies.forEach(function (y, etage) {
        FACADE.travees.forEach(function (travee, i) {
            // Celle de Klara est restée grande ouverte : c'est par
            // là que Bob est sorti. La scène y met la lumière et
            // ceux qui regardent.
            const ouverte = etage === 0 && i === FACADE.traveeDeKlara;
            peindreUneFenetre(ctx, travee, y, alea, ouverte);
        });
    });

    peindreLaGouttiere(ctx, alea);
    peindreLaJardiniere(ctx, alea);
    peindreLeFilALinge(ctx, alea);
    peindreLaParabole(ctx);
    peindreLaToileDAraignee(ctx);
    peindreLeToit(ctx);
    peindreLeSoubassement(ctx, alea);
    peindreLHerbe(ctx, alea);
    salirLeMur(ctx, alea);

    return t.toile;
}


/* ------------------------------------------------------------
   LA BRIQUE
   ------------------------------------------------------------
   Panneresses de 26 x 10 avec un joint de 2, une rangée sur deux
   décalée d'une demi-brique. Chaque brique tire sa couleur du
   hasard fixe : deux murs de suite sont identiques, mais aucune
   brique ne ressemble tout à fait à sa voisine.
   ------------------------------------------------------------ */
function peindreLaBrique(ctx, alea) {

    const LB = 26, HB = 10, J = 2;
    const haut = FACADE.toit;
    const bas = FACADE.beton;

    pave(ctx, 0, haut, FACADE.L, bas - haut, COUL_FACADE.joint);

    let ligne = 0;
    for (let y = haut; y < bas; y += HB + J) {
        const decalage = (ligne % 2) * ((LB + J) / 2);
        for (let x = -LB; x < FACADE.L; x += LB + J) {
            const bx = Math.round(x + decalage);
            const hauteur = Math.min(HB, bas - y);
            peindreUneBrique(ctx, bx, y, LB, hauteur, alea);
        }
        ligne++;
    }

    // L'immeuble en retour : la même brique, mais dans l'ombre.
    pave(ctx, FACADE.aile, haut, FACADE.L - FACADE.aile, bas - haut, [0, 0, 0, 0.42]);
    pave(ctx, FACADE.aile, haut, 2, bas - haut, [0, 0, 0, 0.55]);
}


function peindreUneBrique(ctx, x, y, l, h, alea) {

    const d = alea();
    let c = COUL_FACADE.briques[Math.floor(d * COUL_FACADE.briques.length)];
    if (d > 0.965) c = COUL_FACADE.briqueClaire;
    else if (d < 0.05) c = COUL_FACADE.briqueRare;

    pave(ctx, x, y, l, h, c);
    if (h < 3) return;

    pave(ctx, x, y, l, 1, eclaircir(c, 0.10));
    pave(ctx, x, y + h - 1, l, 1, assombrir(c, 0.20));

    // Le grain : deux ou trois pixels qui accrochent la lumière.
    const n = 2 + Math.floor(alea() * 3);
    for (let i = 0; i < n; i++) {
        const px = x + 2 + Math.floor(alea() * (l - 4));
        const py = y + 1 + Math.floor(alea() * (h - 2));
        pixel(ctx, px, py, alea() > 0.5 ? eclaircir(c, 0.16) : assombrir(c, 0.22));
    }
}


// Le cordon de briques posées de chant, entre le 2e et le 1er :
// il dépasse du mur de trois pixels, et c'est LUI qui accroche
// tout ce qui descend trop vite.
function peindreLeBandeau(ctx, alea) {

    const y = FACADE.bandeau.y;
    const h = FACADE.bandeau.h;

    for (let x = -12; x < FACADE.L; x += 12) {
        const c = COUL_FACADE.briques[Math.floor(alea() * COUL_FACADE.briques.length)];
        pave(ctx, x, y, 11, h, eclaircir(c, 0.06));
        pave(ctx, x, y, 11, 1, eclaircir(c, 0.22));
    }

    // Le dessous, qui est toujours dans son propre noir.
    pave(ctx, 0, y + h, FACADE.L, 3, [0, 0, 0, 0.45]);
    pave(ctx, 0, y - 1, FACADE.L, 1, [0, 0, 0, 0.25]);
}


/* ------------------------------------------------------------
   UNE FENÊTRE
   ------------------------------------------------------------
   Linteau de briques de chant, encadrement blanc, un ou deux
   vantaux, et un appui de béton qui déborde de cinq pixels de
   chaque côté. Derrière la vitre : rien, un rideau, ou la plante
   qu'on voit sur la photo. C'est le hasard fixe qui décide, donc
   c'est toujours la même fenêtre qui a la plante.
   ------------------------------------------------------------ */
function peindreUneFenetre(ctx, travee, y, alea, ouverte) {

    const x = travee.x;
    const l = travee.l;
    const h = FACADE.hauteurBaie;

    // Le linteau : des briques debout, juste au-dessus.
    for (let bx = x - 4; bx < x + l + 4; bx += 11) {
        const c = COUL_FACADE.briques[Math.floor(alea() * COUL_FACADE.briques.length)];
        pave(ctx, bx, y - 12, 10, 12, c);
        pave(ctx, bx, y - 12, 10, 1, eclaircir(c, 0.18));
    }

    // L'embrasure : le mur a de l'épaisseur.
    pave(ctx, x - 2, y - 2, l + 4, h + 4, COUL_FACADE.ombre);

    // Le dormant.
    pave(ctx, x, y, l, h, COUL_FACADE.cadre);
    pave(ctx, x, y, l, 2, eclaircir(COUL_FACADE.cadre, 0.25));
    pave(ctx, x, y + h - 3, l, 3, COUL_FACADE.cadreOmbre);

    // Les vitres — sauf si la fenêtre est ouverte : il n'y a
    // plus que le noir de la pièce derrière.
    const marge = 6;
    if (ouverte) {
        pave(ctx, x + marge, y + marge, l - marge * 2, h - marge - 9, [16, 13, 20]);
    } else {
        const large = (l - marge * 2 - (travee.carreaux - 1) * 5) / travee.carreaux;
        for (let k = 0; k < travee.carreaux; k++) {
            const vx = x + marge + k * (large + 5);
            peindreUnCarreau(ctx, vx, y + marge, large, h - marge - 9, alea);
        }
    }

    // L'appui de béton.
    const ax = x - 5;
    const al = l + 10;
    const ay = y + h;
    pave(ctx, ax, ay, al, 9, COUL_FACADE.appui);
    pave(ctx, ax, ay, al, 2, COUL_FACADE.appuiHaut);
    pave(ctx, ax, ay + 9, al, 3, [0, 0, 0, 0.5]);
    pave(ctx, ax, ay + 7, al, 2, assombrir(COUL_FACADE.appui, 0.35));
}


function peindreUnCarreau(ctx, x, y, l, h, alea) {

    pave(ctx, x, y, l, h, COUL_FACADE.vitre);

    // Le reflet du ciel, en biais, en haut à gauche.
    for (let i = 0; i < Math.min(l, h) * 0.8; i++) {
        pave(ctx, x + i, y, 1, Math.max(0, Math.min(h, h * 0.45 - i * 0.4)), COUL_FACADE.reflet);
    }
    pave(ctx, x, y, l, 1, eclaircir(COUL_FACADE.reflet, 0.1));

    const d = alea();
    if (d > 0.72) {
        // un rideau tiré, qui pend
        pave(ctx, x, y, l, Math.round(h * (0.3 + alea() * 0.4)), [
            COUL_FACADE.rideau[0], COUL_FACADE.rideau[1], COUL_FACADE.rideau[2], 0.5,
        ]);
    } else if (d > 0.55) {
        // la plante de la photo, en ombre chinoise
        const px = x + l / 2;
        const pb = y + h - 2;
        for (let f = 0; f < 7; f++) {
            const dx = (f - 3) * 3;
            trait(ctx, px, pb, px + dx * 2, pb - 10 - alea() * 14, COUL_FACADE.plante);
        }
        pave(ctx, px - 4, pb - 4, 9, 5, [52, 40, 36]);
    }

    // Le montant qui coupe la vitre en deux dans la hauteur.
    pave(ctx, x, y + Math.round(h * 0.42), l, 3, COUL_FACADE.cadre);
}


/* ------------------------------------------------------------
   LA DESCENTE DE GOUTTIÈRE
   ------------------------------------------------------------ */
function peindreLaGouttiere(ctx, alea) {

    const g = FACADE.gouttiere;
    const bas = FACADE.beton + 20;

    pave(ctx, g.x - 2, FACADE.toit, g.l + 4, bas - FACADE.toit, [0, 0, 0, 0.35]);
    pave(ctx, g.x, FACADE.toit - 6, g.l, bas - FACADE.toit + 6, COUL_FACADE.tuyau);
    pave(ctx, g.x, FACADE.toit - 6, 2, bas - FACADE.toit + 6, COUL_FACADE.tuyauSombre);
    pave(ctx, g.x + g.l - 3, FACADE.toit - 6, 3, bas - FACADE.toit + 6, COUL_FACADE.tuyauSombre);
    pave(ctx, g.x + 4, FACADE.toit - 6, 3, bas - FACADE.toit + 6, COUL_FACADE.tuyauClair);

    // Les colliers, et la rouille qui coule dessous.
    for (let y = FACADE.toit + 40; y < bas - 40; y += 128) {
        pave(ctx, g.x - 4, y, g.l + 8, 7, eclaircir(COUL_FACADE.tuyau, 0.18));
        pave(ctx, g.x - 4, y + 7, g.l + 8, 2, COUL_FACADE.tuyauSombre);
        pave(ctx, g.x + 2, y + 9, 3, 14 + alea() * 20, [78, 52, 34, 0.5]);
    }

    // Le coude, en bas, qui recrache dans la cour.
    pave(ctx, g.x, bas, g.l, 16, COUL_FACADE.tuyau);
    pave(ctx, g.x + g.l, bas + 8, 14, 12, COUL_FACADE.tuyau);
    pave(ctx, g.x + g.l, bas + 8, 14, 3, COUL_FACADE.tuyauClair);
}


/* ------------------------------------------------------------
   LES TROIS CHOSES QUI DÉPASSENT
   ------------------------------------------------------------
   Elles existent pour une seule raison : obliger Bob à se
   déplacer de gauche à droite pendant qu'il descend. Le fil
   ferme la gauche, la parabole ferme la droite juste en dessous,
   et la jardinière occupe le coin gauche de l'appui du 1er —
   celui sur lequel on se pose.
   ------------------------------------------------------------ */
function peindreLaJardiniere(ctx, alea) {

    const j = FACADE.jardiniere;
    const terre = [46, 36, 30];
    const pot = [104, 62, 46];

    // Les fleurs d'octobre, c'est-à-dire ce qu'il en reste.
    for (let x = j.x + 3; x < j.x + j.l - 3; x += 3) {
        const h = 10 + alea() * 22;
        const penche = (alea() - 0.5) * 10;
        const c = alea() > 0.7 ? [86, 78, 44] : [48, 62, 42];
        trait(ctx, x, j.y + 6, x + penche, j.y + 6 - h, c);
        if (alea() > 0.86) pixel(ctx, Math.round(x + penche), Math.round(j.y + 6 - h), [140, 92, 84]);
    }

    pave(ctx, j.x, j.y + 4, j.l, 6, terre);
    pave(ctx, j.x, j.y + 8, j.l, j.h - 8, pot);
    pave(ctx, j.x, j.y + 8, j.l, 2, eclaircir(pot, 0.2));
    pave(ctx, j.x, j.y + j.h - 2, j.l, 2, assombrir(pot, 0.35));
    pave(ctx, j.x, j.y + 8, 2, j.h - 8, assombrir(pot, 0.25));
    pave(ctx, j.x + j.l - 2, j.y + 8, 2, j.h - 8, assombrir(pot, 0.25));
    pave(ctx, j.x - 1, j.y + j.h, j.l + 2, 3, [0, 0, 0, 0.45]);
}


function peindreLeFilALinge(ctx, alea) {

    const f = FACADE.fil;
    const fil = [154, 150, 142];

    // Le crochet, à droite, planté dans un joint.
    pave(ctx, f.x1, f.y + f.creux - 4, 4, 10, [64, 62, 60]);

    // Le fil, qui pend : une chaînette, dessinée de proche en proche.
    let avantX = f.x0, avantY = f.y;
    for (let i = 1; i <= 40; i++) {
        const k = i / 40;
        const x = f.x0 + (f.x1 - f.x0) * k;
        const y = f.y + Math.sin(k * Math.PI) * f.creux + k * 8;
        trait(ctx, avantX, avantY, x, y, fil);
        avantX = x; avantY = y;
    }

    // Une pince, deux pinces, et une chaussette que personne n'a
    // ramassée depuis l'été.
    [0.24, 0.52, 0.78].forEach(function (k, i) {
        const x = Math.round(f.x0 + (f.x1 - f.x0) * k);
        const y = Math.round(f.y + Math.sin(k * Math.PI) * f.creux + k * 8);
        pave(ctx, x - 2, y - 1, 5, 9, i === 1 ? [126, 96, 62] : [96, 92, 88]);
        pave(ctx, x - 2, y - 1, 5, 2, [150, 146, 140]);
        if (i === 1) {
            pave(ctx, x - 5, y + 8, 11, 20, [92, 96, 112]);
            pave(ctx, x - 5, y + 8, 11, 3, [116, 120, 136]);
            pave(ctx, x - 5, y + 24, 16, 6, [92, 96, 112]);
            pave(ctx, x - 5, y + 28, 16, 2, [70, 74, 88]);
        }
    });
}


// Une parabole. Tout le monde en a une, personne ne la regarde,
// et pour une peluche de soixante-dix centimètres c'est un mur.
function peindreLaParabole(ctx) {

    const p = FACADE.parabole;

    // Le bras et la platine, contre le mur.
    pave(ctx, p.x + p.r - 6, p.y - 4, 14, 8, [58, 58, 62]);
    pave(ctx, p.x + p.r + 6, p.y - 10, 5, 22, [46, 46, 50]);
    pave(ctx, p.x + p.r + 5, p.y - 12, 7, 3, [78, 78, 84]);

    pave(ctx, p.x - p.r - 2, p.y - p.r - 2, p.r * 2 + 4, p.r * 2 + 4, [0, 0, 0, 0.3]);
    rond(ctx, p.x, p.y, p.r, [118, 116, 112], [74, 72, 70]);
    rond(ctx, p.x, p.y, p.r - 5, [98, 96, 94], [84, 82, 80]);

    // Le creux : la lumière de la ville tombe dedans par le haut.
    for (let i = 0; i < p.r - 6; i++) {
        pave(ctx, p.x - (p.r - 8) + i, p.y - p.r + 8,
            1, Math.max(0, (p.r - 10) - i * 0.7), [134, 132, 128, 0.5]);
    }

    // Le bras de la tête, et la tête.
    trait(ctx, p.x, p.y, p.x - p.r - 6, p.y + 12, [70, 68, 66]);
    trait(ctx, p.x, p.y + 1, p.x - p.r - 6, p.y + 13, [52, 50, 48]);
    pave(ctx, p.x - p.r - 12, p.y + 8, 10, 8, [138, 136, 132]);
    pave(ctx, p.x - p.r - 12, p.y + 8, 10, 2, [168, 166, 162]);
}


// Dans l'angle du tuyau et du mur, à mi-hauteur. Personne ne
// l'entretient. Elle est vide.
function peindreLaToileDAraignee(ctx) {

    const g = FACADE.gouttiere;
    const cx = g.x + g.l + 2;
    const cy = 548;
    const c = [COUL_FACADE.toile[0], COUL_FACADE.toile[1], COUL_FACADE.toile[2], 0.32];

    for (let i = 0; i <= 5; i++) {
        const a = -1.0 + i * 0.42;
        trait(ctx, cx, cy, cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, c);
    }
    for (let r = 12; r <= 44; r += 11) {
        for (let i = 0; i < 5; i++) {
            const a0 = -1.0 + i * 0.42;
            const a1 = a0 + 0.42;
            trait(ctx, cx + Math.cos(a0) * r, cy + Math.sin(a0) * r,
                       cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, c);
        }
    }

    // L'araignée, au bord, qui ne fait rien.
    const ax = cx + 30;
    const ay = cy + 6;
    disque(ctx, ax, ay, 2, [24, 22, 26]);
    for (let i = 0; i < 4; i++) {
        trait(ctx, ax, ay, ax - 5 + i * 2, ay - 5, [24, 22, 26]);
        trait(ctx, ax, ay, ax - 5 + i * 2, ay + 5, [24, 22, 26]);
    }
}


function peindreLeToit(ctx) {

    // La rive d'ardoises, puis la planche blanche sous le débord.
    pave(ctx, 0, 0, FACADE.L, 12, COUL_FACADE.rive);
    for (let x = 0; x < FACADE.L; x += 7) {
        pave(ctx, x, 0, 1, 12, assombrir(COUL_FACADE.rive, 0.3));
    }
    pave(ctx, 0, 12, FACADE.L, 14, COUL_FACADE.bandeauToit);
    pave(ctx, 0, 12, FACADE.L, 2, eclaircir(COUL_FACADE.bandeauToit, 0.3));
    pave(ctx, 0, 26, FACADE.L, 4, [0, 0, 0, 0.55]);

    // La gouttière horizontale, qui court sous le bandeau.
    pave(ctx, 0, 22, FACADE.L, 5, COUL_FACADE.tuyau);
    pave(ctx, 0, 22, FACADE.L, 1, COUL_FACADE.tuyauClair);
}


function peindreLeSoubassement(ctx, alea) {

    pave(ctx, 0, FACADE.beton, FACADE.L, FACADE.herbe - FACADE.beton + 20, COUL_FACADE.beton);
    pave(ctx, 0, FACADE.beton, FACADE.L, 2, eclaircir(COUL_FACADE.beton, 0.25));

    // Les coulures et les éclats du béton.
    for (let i = 0; i < 90; i++) {
        const x = Math.floor(alea() * FACADE.L);
        const y = FACADE.beton + 3 + Math.floor(alea() * 34);
        pave(ctx, x, y, 2 + Math.floor(alea() * 9), 1,
            alea() > 0.5 ? eclaircir(COUL_FACADE.beton, 0.12) : assombrir(COUL_FACADE.beton, 0.2));
    }

    // Les soupiraux de la cave, grillagés.
    FACADE.soupiraux.forEach(function (x) {
        const y = FACADE.beton + 8;
        pave(ctx, x - 2, y - 2, 44, 28, assombrir(COUL_FACADE.beton, 0.35));
        pave(ctx, x, y, 40, 24, COUL_FACADE.soupirail);
        for (let b = 0; b < 5; b++) pave(ctx, x + 3 + b * 8, y, 2, 24, COUL_FACADE.barreau);
        for (let b = 0; b < 3; b++) pave(ctx, x, y + 3 + b * 8, 40, 2, COUL_FACADE.barreau);
        pave(ctx, x, y, 40, 1, eclaircir(COUL_FACADE.barreau, 0.3));
    });
}


function peindreLHerbe(ctx, alea) {

    pave(ctx, 0, FACADE.herbe, FACADE.L, FACADE.bas - FACADE.herbe, COUL_FACADE.terre);

    // Trois rangs d'herbe, du plus lointain au plus proche : les
    // derniers brins sont plus grands et plus clairs, et cachent
    // le pied du mur comme sur la photo.
    for (let rang = 0; rang < 3; rang++) {
        const base = FACADE.herbe + rang * 16;
        for (let x = -2; x < FACADE.L; x += 2) {
            const hauteur = 14 + alea() * (18 + rang * 12);
            const penche = (alea() - 0.5) * 7;
            const c = COUL_FACADE.herbes[Math.floor(alea() * COUL_FACADE.herbes.length)];
            trait(ctx, x, base + 8, x + penche, base - hauteur,
                rang === 2 ? eclaircir(c, 0.12) : c);
            if (alea() > 0.94) {
                trait(ctx, x, base + 8, x + penche * 1.6, base - hauteur - 10, COUL_FACADE.herbeSeche);
            }
        }
        pave(ctx, 0, base + 6, FACADE.L, 18, COUL_FACADE.terre);
    }

    // Le tout premier plan, flou de nuit : on est dedans.
    pave(ctx, 0, FACADE.bas - 42, FACADE.L, 42, [18, 22, 18]);
    for (let x = -2; x < FACADE.L; x += 3) {
        trait(ctx, x, FACADE.bas, x + (alea() - 0.5) * 12, FACADE.bas - 30 - alea() * 26, [22, 28, 22]);
    }
}


/* ------------------------------------------------------------
   LA SALETÉ ET LA NUIT
   ------------------------------------------------------------
   Un mur propre a l'air faux. On assombrit le bas (la lumière de
   la ville vient d'en haut), on met du vert au ras du sol, et on
   laisse quelques traînées sous les appuis de fenêtre.
   ------------------------------------------------------------ */
function salirLeMur(ctx, alea) {

    // Les larmes sous les appuis.
    FACADE.appuis.forEach(function (y) {
        FACADE.travees.forEach(function (travee) {
            for (let i = 0; i < 7; i++) {
                const x = travee.x - 4 + Math.floor(alea() * (travee.l + 8));
                pave(ctx, x, y + 12, 1 + Math.floor(alea() * 2), 8 + alea() * 34, [0, 0, 0, 0.13]);
            }
        });
    });

    // Le dégradé du haut vers le bas.
    for (let y = FACADE.toit; y < FACADE.beton; y += 4) {
        const k = (y - FACADE.toit) / (FACADE.beton - FACADE.toit);
        pave(ctx, 0, y, FACADE.L, 4, [4, 6, 16, 0.05 + k * 0.17]);
    }

    // La mousse verte au pied du mur.
    for (let y = FACADE.beton - 80; y < FACADE.beton; y += 2) {
        const k = (y - (FACADE.beton - 80)) / 80;
        pave(ctx, 0, y, FACADE.L, 2, [44, 58, 40, k * 0.2]);
    }
}


loadSprite("facade_mur", peindreLaFacade());
