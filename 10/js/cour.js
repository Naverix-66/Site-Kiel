/* ============================================================
   LA COUR — le décor de l'acte IV
   ============================================================
   Peinte au chargement, d'après les trois photos qu'Evan a prises
   depuis la fenêtre : ce n'est pas une petite cour fermée, c'est
   un parc. Une grande pelouse, des arbres adultes aux troncs
   clairs, un chemin pavé qui longe le mur avec sa plaque d'égout,
   des arceaux à vélos bleus, un bac en béton au pied d'un arbre,
   du lierre en contrebas, et l'immeuble d'en face qui ferme le
   fond. Les photos sont en été : ici c'est la nuit du 8 octobre.

   ------------------------------------------------------------
   LE CADRE

   Un seul plan, fixe, vu de côté — on ne suit plus Bob, on le
   regarde. Trois plans superposés :

     au fond    le ciel, les autres arbres, l'immeuble d'en face
                et la pelouse qui remonte
     au milieu  À GAUCHE la façade de l'acte III, redessinée deux
                fois plus petite (elle est plus loin), avec tout
                en haut la fenêtre jaune et, contre le mur, LE
                BOUT DU PYJAMA — quarante pixels au-dessus de la
                tête de Bob, et pas un de moins.
                À DROITE le grand arbre, et le nid dans sa fourche.
     devant     l'herbe où Bob marche, puis le chemin, puis le
                lierre du tout premier plan

   Bob et ceux qui l'aiment tiennent dans la même image du début à
   la fin de l'acte, et la distance entre eux se voit.
   ============================================================ */


const COUR = {

    L: 760,
    H: 560,

    sol: 470,          // la ligne où Bob pose les pieds
    horizon: 342,      // au-dessus : le ciel et le fond
    bas: 560,

    // La façade de l'acte III, vue de plus loin : on redessine la
    // toile de facade.js à la moitié de sa taille. L'échelle n'est
    // pas un choix esthétique — c'est elle qui décide de la hauteur
    // du bout de la corde, donc de tout le final (voir corde).
    facade: { x: 0, depuisX: 240, largeur: 330, depuisY: 40, echelle: 0.5 },

    arbre: { x: 585, largeur: 92, fourche: 208 },
    nid: { x: 612, y: 118, l: 104, h: 42 },

    // Le bout du pyjama de Samsam. Bob mesure 43 px : sa tête est
    // donc à 427, et la corde s'arrête 44 px plus haut. Il la voit
    // pendant tout le combat. Il ne peut pas l'atteindre.
    corde: { x: 65, bout: 383 },

    marche: { gauche: 52, droite: 706 },

    // Les choses de la cour, posées le long du sol.
    velos: { x: 118, n: 3 },
    bac: { x: 506, l: 148, h: 26 },
    poubelles: { x: 300 },
    plaque: { x: 250, y: 516 },
};


const COUL_COUR = {
    ciel: [22, 26, 40],
    cielBas: [38, 42, 58],

    loin: [26, 30, 38],          // les masses d'arbres du fond
    loinClair: [36, 42, 48],

    briqueLoin: [54, 34, 30],
    toitLoin: [46, 30, 28],
    fenetreLoin: [92, 84, 64],

    pelouse: [34, 46, 32],
    pelouseLoin: [40, 52, 38],
    pelouseDevant: [26, 36, 26],
    herbe: [[44, 58, 38], [36, 50, 34], [54, 68, 44], [30, 42, 30]],
    herbeSeche: [74, 70, 48],

    pave: [46, 44, 46],
    paveJoint: [32, 30, 32],
    beton: [60, 58, 58],
    fonte: [34, 32, 34],
    velo: [46, 66, 96],

    ecorce: [50, 44, 42],
    ecorceClaire: [78, 72, 68],
    ecorceSombre: [30, 26, 26],
    feuille: [34, 42, 30],
    feuilleRousse: [78, 56, 32],
    feuilleOr: [96, 76, 38],

    nid: [58, 46, 34],
    nidClair: [84, 70, 50],
    brille: [168, 160, 130],

    lierre: [20, 28, 22],
};


/* ============================================================
   LA PEINTURE
   ============================================================ */
function peindreLaCour() {

    const t = nouvelleToile(COUR.L, COUR.H);
    const ctx = t.ctx;
    const alea = hasardFixe(20261009);

    peindreLeCiel(ctx, alea);
    peindreLeFond(ctx, alea);
    peindreLaPelouse(ctx, alea);
    peindreLaFacadeDeLoin(ctx);
    peindreLeChemin(ctx, alea);
    peindreLArbre(ctx, alea);
    peindreLesChoses(ctx, alea);
    peindreLePremierPlan(ctx, alea);

    return t.toile;
}


function peindreLeCiel(ctx, alea) {

    // Un ciel d'octobre à quatre heures du matin : couvert, et qui
    // renvoie les lumières de la ville par en dessous.
    for (let y = 0; y < COUR.horizon; y++) {
        const k = y / COUR.horizon;
        pave(ctx, 0, y, COUR.L, 1, melangeCouleur(COUL_COUR.ciel, COUL_COUR.cielBas, k * k));
    }

    // Quelques trouées plus claires, très lentes.
    for (let i = 0; i < 26; i++) {
        const x = alea() * COUR.L;
        const y = alea() * COUR.horizon * 0.8;
        const l = 40 + alea() * 120;
        pave(ctx, x, y, l, 2 + alea() * 5, [58, 62, 78, 0.10 + alea() * 0.1]);
    }
}


function melangeCouleur(a, b, k) {
    return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * k); });
}


/* ------------------------------------------------------------
   LE FOND : les autres arbres, et l'immeuble d'en face
   ------------------------------------------------------------ */
function peindreLeFond(ctx, alea) {

    // L'immeuble d'en face (photo 1) : brique, trois étages, toit de
    // tuiles, et deux ou trois fenêtres encore allumées à cette heure.
    const bx = 214, bl = 330, bh = 104;
    const by = COUR.horizon - bh;

    pave(ctx, bx, by + 12, bl, bh - 12, COUL_COUR.briqueLoin);
    for (let y = by + 12; y < by + bh; y += 4) {
        pave(ctx, bx, y, bl, 1, assombrir(COUL_COUR.briqueLoin, 0.15));
    }
    // le toit
    for (let i = 0; i < 14; i++) {
        pave(ctx, bx + i * (bl / 14), by, bl / 14 - 1, 13, COUL_COUR.toitLoin);
    }
    pave(ctx, bx - 3, by + 11, bl + 6, 3, assombrir(COUL_COUR.toitLoin, 0.3));

    // les fenêtres
    for (let etage = 0; etage < 3; etage++) {
        for (let i = 0; i < 9; i++) {
            const fx = bx + 16 + i * 35;
            const fy = by + 22 + etage * 27;
            const allumee = alea() > 0.86;
            pave(ctx, fx, fy, 15, 17, allumee ? COUL_COUR.fenetreLoin : [20, 22, 30]);
            pave(ctx, fx - 1, fy - 1, 17, 1, [78, 76, 72]);
            if (allumee) {
                pave(ctx, fx, fy, 15, 17, [140, 122, 78, 0.35]);
            }
        }
    }

    // Les masses d'arbres, derrière et autour : on ne distingue rien,
    // c'est un mur de noir un peu vert.
    for (let x = -20; x < COUR.L + 20; x += 9) {
        const h = 70 + Math.sin(x * 0.021) * 40 + Math.sin(x * 0.057) * 26 + alea() * 22;
        const c = alea() > 0.7 ? COUL_COUR.loinClair : COUL_COUR.loin;
        pave(ctx, x, COUR.horizon - h, 10, h, c);
        // le haut des couronnes, dentelé
        for (let i = 0; i < 4; i++) {
            pave(ctx, x + alea() * 8, COUR.horizon - h - alea() * 14, 3, 6, c);
        }
    }
}


function peindreLaPelouse(ctx, alea) {

    // La grande pelouse, qui remonte vers le fond.
    for (let y = COUR.horizon; y < COUR.sol; y++) {
        const k = (y - COUR.horizon) / (COUR.sol - COUR.horizon);
        pave(ctx, 0, y, COUR.L, 1, melangeCouleur(COUL_COUR.pelouseLoin, COUL_COUR.pelouse, k));
    }

    // Des touffes, de plus en plus grandes à mesure qu'elles
    // s'approchent : c'est ce qui donne la profondeur.
    for (let i = 0; i < 1400; i++) {
        const y = COUR.horizon + alea() * (COUR.sol - COUR.horizon);
        const k = (y - COUR.horizon) / (COUR.sol - COUR.horizon);
        const x = alea() * COUR.L;
        const h = 1 + k * 5 + alea() * 3;
        const c = COUL_COUR.herbe[Math.floor(alea() * COUL_COUR.herbe.length)];
        trait(ctx, x, y, x + (alea() - 0.5) * 3, y - h, c);
    }

    // Les allées de pavés qui traversent la pelouse au fond (photo 1).
    for (let i = 0; i < 40; i++) {
        const x = 300 + i * 9;
        const y = COUR.horizon + 26 + i * 0.7;
        pave(ctx, x, y, 8, 3, [52, 48, 46, 0.7]);
    }
}


/* ------------------------------------------------------------
   LA FAÇADE, VUE DE PLUS LOIN
   ------------------------------------------------------------
   On ne la repeint pas : on redessine la toile de l'acte III à la
   moitié de sa taille, avec le lissage ACTIVÉ. C'est le seul
   endroit du jeu où on lisse quelque chose, et c'est voulu : un
   mur à vingt mètres n'a pas des arêtes nettes.
   ------------------------------------------------------------ */
function peindreLaFacadeDeLoin(ctx) {

    if (typeof TOILE_FACADE === "undefined") return;

    const f = COUR.facade;
    const hauteurSource = FACADE.herbe - f.depuisY;    // jusqu'à l'herbe
    const l = Math.round(f.largeur * f.echelle);
    const h = Math.round(hauteurSource * f.echelle);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
        TOILE_FACADE,
        f.depuisX, f.depuisY, f.largeur, hauteurSource,
        f.x, COUR.sol - h, l, h
    );
    ctx.restore();

    // L'angle du mur, à droite, et son ombre portée sur la pelouse.
    pave(ctx, f.x + l, COUR.sol - h, 2, h, [0, 0, 0, 0.5]);
    pave(ctx, f.x, COUR.sol, l + 26, 5, [0, 0, 0, 0.35]);

    // Le bout du pyjama de Samsam, qui pend contre le mur. Il est
    // dessiné ICI, dans le décor, parce que c'est ce qu'il est
    // pendant tout l'acte : du décor. Jusqu'à la dernière minute.
    const cx = COUR.corde.x;
    for (let y = COUR.sol - h; y < COUR.corde.bout; y += 6) {
        const clair = Math.floor(y / 6) % 2 === 0;
        pave(ctx, cx, y, 2, 6, clair ? [150, 146, 132] : [112, 106, 94]);
        if (Math.floor(y / 6) % 4 === 0) pixel(ctx, cx, y + 2, [104, 40, 52]);
    }
    // son extrémité, effilochée
    pave(ctx, cx - 1, COUR.corde.bout, 4, 3, [132, 126, 112]);
    pixel(ctx, cx - 2, COUR.corde.bout + 3, [132, 126, 112]);
    pixel(ctx, cx + 3, COUR.corde.bout + 2, [132, 126, 112]);
}


function peindreLeChemin(ctx, alea) {

    // Le chemin pavé qui longe le mur (photos 1 et 2), en contrebas
    // de la ligne où marche Bob.
    const y0 = COUR.sol + 34;
    pave(ctx, 0, y0, COUR.L, COUR.bas - y0, COUL_COUR.pave);

    for (let y = y0; y < COUR.bas; y += 11) {
        const decalage = ((y - y0) / 11) % 2 === 0 ? 0 : 9;
        pave(ctx, 0, y, COUR.L, 1, COUL_COUR.paveJoint);
        for (let x = -18; x < COUR.L; x += 18) {
            pave(ctx, x + decalage, y, 1, 11, COUL_COUR.paveJoint);
            if (alea() > 0.82) {
                pave(ctx, x + decalage + 1, y + 1, 16, 9, eclaircir(COUL_COUR.pave, 0.06));
            }
        }
    }

    // La plaque d'égout de la photo 2.
    const p = COUR.plaque;
    pave(ctx, p.x - 2, p.y - 2, 40, 28, assombrir(COUL_COUR.fonte, 0.3));
    pave(ctx, p.x, p.y, 36, 24, COUL_COUR.fonte);
    for (let i = 0; i < 5; i++) pave(ctx, p.x + 3 + i * 6, p.y + 3, 3, 18, assombrir(COUL_COUR.fonte, 0.35));
    pave(ctx, p.x, p.y, 36, 1, eclaircir(COUL_COUR.fonte, 0.25));

    // La bordure entre l'herbe et le chemin.
    pave(ctx, 0, y0 - 4, COUR.L, 4, COUL_COUR.beton);
    pave(ctx, 0, y0 - 4, COUR.L, 1, eclaircir(COUL_COUR.beton, 0.2));
}


/* ------------------------------------------------------------
   LE GRAND ARBRE, ET LE NID
   ------------------------------------------------------------ */
function peindreLArbre(ctx, alea) {

    const a = COUR.arbre;
    const gauche = a.x - a.largeur / 2;

    // Le tronc : il s'élargit vers le bas, comme tous les troncs.
    for (let y = 0; y < COUR.sol; y++) {
        const k = y / COUR.sol;
        const demi = (a.largeur / 2) * (0.62 + k * 0.38);
        const c = melangeCouleur(COUL_COUR.ecorce, COUL_COUR.ecorceSombre, 0.2 + k * 0.2);
        pave(ctx, a.x - demi, y, demi * 2, 1, c);
        // la lumière de la ville accroche le bord gauche
        pave(ctx, a.x - demi, y, 3, 1, COUL_COUR.ecorceClaire);
        pave(ctx, a.x + demi - 4, y, 4, 1, COUL_COUR.ecorceSombre);
    }

    // L'écorce : des sillons verticaux, longs et irréguliers.
    for (let i = 0; i < 180; i++) {
        const x = gauche + 4 + alea() * (a.largeur - 8);
        const y = alea() * COUR.sol;
        const h = 14 + alea() * 60;
        const c = alea() > 0.5 ? COUL_COUR.ecorceSombre : COUL_COUR.ecorceClaire;
        pave(ctx, x, y, 1 + (alea() > 0.8 ? 1 : 0), h, [c[0], c[1], c[2], 0.35]);
    }

    // Les grosses branches : une à gauche (celle qui porte le nid),
    // deux à droite qui sortent du cadre.
    brancher(ctx, a.x - 10, a.fourche, -0.75, 150, 15, alea);
    brancher(ctx, a.x + 8, a.fourche - 40, 0.55, 190, 13, alea);
    brancher(ctx, a.x + 4, a.fourche + 70, 0.9, 130, 10, alea);
    brancher(ctx, a.x - 6, a.fourche + 120, -1.05, 90, 8, alea);

    // La couronne : des masses sombres, et quelques feuilles rousses
    // — c'est le 8 octobre, ça commence à peine à tourner.
    for (let i = 0; i < 340; i++) {
        const t = alea() * Math.PI * 2;
        const r = alea();
        const x = a.x + Math.cos(t) * r * 230;
        const y = 120 + Math.sin(t) * r * 130 - 40;
        if (y > a.fourche + 60) continue;      // pas de feuilles sous la fourche
        const d = alea();
        const c = d > 0.94 ? COUL_COUR.feuilleRousse
            : (d > 0.88 ? COUL_COUR.feuilleOr : COUL_COUR.feuille);
        disque(ctx, x, y, 3 + alea() * 7, c);
    }
    // quelques feuilles isolées qui tombent
    for (let i = 0; i < 26; i++) {
        pave(ctx, alea() * COUR.L, 120 + alea() * (COUR.sol - 160), 3, 2,
            alea() > 0.5 ? COUL_COUR.feuilleRousse : COUL_COUR.feuilleOr);
    }

    peindreLeNid(ctx, alea);
}


function brancher(ctx, x, y, angle, longueur, epaisseur, alea) {

    let px = x, py = y, a = angle;
    let e = epaisseur;
    const pas = 8;

    for (let d = 0; d < longueur; d += pas) {
        a += (alea() - 0.5) * 0.22;
        const nx = px + Math.cos(a) * pas;
        const ny = py + Math.sin(a) * pas;
        for (let i = -Math.floor(e / 2); i <= Math.floor(e / 2); i++) {
            const c = i < -e / 6 ? COUL_COUR.ecorceClaire
                : (i > e / 4 ? COUL_COUR.ecorceSombre : COUL_COUR.ecorce);
            trait(ctx, px, py + i, nx, ny + i, c);
        }
        px = nx; py = ny;
        e = Math.max(2, e * 0.93);

        // des ramilles, de temps en temps
        if (alea() > 0.72) {
            const sa = a + (alea() - 0.5) * 1.6;
            trait(ctx, px, py, px + Math.cos(sa) * 26, py + Math.sin(sa) * 26, COUL_COUR.ecorceSombre);
        }
    }
}


function peindreLeNid(ctx, alea) {

    const n = COUR.nid;

    // La fourche qui le porte.
    pave(ctx, n.x - 8, n.y + n.h - 6, 30, 24, COUL_COUR.ecorce);

    // Le nid : des brindilles dans tous les sens, et rien d'autre.
    for (let i = 0; i < 240; i++) {
        const t = alea() * Math.PI * 2;
        const r = alea();
        const x = n.x + Math.cos(t) * r * (n.l / 2);
        const y = n.y + n.h / 2 + Math.sin(t) * r * (n.h / 2);
        const a = (alea() - 0.5) * 2.4;
        const lg = 5 + alea() * 14;
        const c = alea() > 0.6 ? COUL_COUR.nidClair : COUL_COUR.nid;
        trait(ctx, x, y, x + Math.cos(a) * lg, y + Math.sin(a) * lg, c);
    }

    // Le creux, plus sombre.
    for (let i = 0; i < 60; i++) {
        const x = n.x - n.l / 4 + alea() * (n.l / 2);
        const y = n.y + 6 + alea() * 10;
        pave(ctx, x, y, 2 + alea() * 4, 1, [22, 18, 16]);
    }

    // Et ce qui brille dedans : tout ce qu'elle a volé, et que
    // quelqu'un, quelque part, a cherché.
    for (let i = 0; i < 22; i++) {
        const x = n.x - n.l / 2 + 6 + alea() * (n.l - 12);
        const y = n.y + 4 + alea() * (n.h - 12);
        const c = alea() > 0.5 ? COUL_COUR.brille : [188, 168, 96];
        pave(ctx, x, y, 2 + alea() * 3, 2, c);
        if (alea() > 0.7) pixel(ctx, x + 1, y - 1, [222, 216, 190]);
    }
}


/* ------------------------------------------------------------
   CE QU'IL Y A DANS LA COUR
   ------------------------------------------------------------ */
function peindreLesChoses(ctx, alea) {

    // Les arceaux à vélos bleus, contre le mur (photos 1 et 2).
    for (let i = 0; i < COUR.velos.n; i++) {
        const x = COUR.velos.x + i * 30;
        const h = 26;
        const y = COUR.sol;
        pave(ctx, x, y - h, 3, h, COUL_COUR.velo);
        pave(ctx, x + 20, y - h, 3, h, COUL_COUR.velo);
        pave(ctx, x, y - h - 2, 23, 3, COUL_COUR.velo);
        pave(ctx, x, y - h - 2, 23, 1, eclaircir(COUL_COUR.velo, 0.3));
        pave(ctx, x - 1, y - 1, 25, 2, [0, 0, 0, 0.4]);
    }

    // Les poubelles, un peu plus loin (photo 2).
    for (let i = 0; i < 2; i++) {
        const x = COUR.poubelles.x + i * 34;
        const l = 26, h = 34;
        const y = COUR.sol - h;
        pave(ctx, x, y, l, h, [44, 46, 44]);
        pave(ctx, x, y, l, 2, [70, 72, 68]);
        pave(ctx, x, y + 4, l, 2, [30, 32, 30]);
        pave(ctx, x + l - 4, y + 2, 4, h - 2, [30, 32, 30]);
        pave(ctx, x - 1, COUR.sol - 1, l + 2, 2, [0, 0, 0, 0.4]);
    }

    // Le bac en béton au pied de l'arbre (photo 1).
    const b = COUR.bac;
    pave(ctx, b.x, COUR.sol - b.h, b.l, b.h, COUL_COUR.beton);
    pave(ctx, b.x, COUR.sol - b.h, b.l, 3, eclaircir(COUL_COUR.beton, 0.22));
    for (let i = 0; i < 5; i++) {
        pave(ctx, b.x + i * (b.l / 5), COUR.sol - b.h, 1, b.h, assombrir(COUL_COUR.beton, 0.3));
    }
    pave(ctx, b.x - 2, COUR.sol - 2, b.l + 4, 3, [0, 0, 0, 0.45]);
    // la terre et les mauvaises herbes dedans
    for (let x = b.x + 3; x < b.x + b.l - 3; x += 3) {
        trait(ctx, x, COUR.sol - b.h, x + (alea() - 0.5) * 6, COUR.sol - b.h - 6 - alea() * 12,
            COUL_COUR.herbe[Math.floor(alea() * 4)]);
    }

    // Une grille de cave au pied du mur : la même qu'à l'acte III,
    // et celle sur laquelle la baguette va casser.
    pave(ctx, 24, COUR.sol - 14, 34, 14, [20, 20, 22]);
    for (let i = 0; i < 4; i++) pave(ctx, 27 + i * 8, COUR.sol - 14, 2, 14, [50, 50, 54]);
    pave(ctx, 24, COUR.sol - 15, 34, 2, COUL_COUR.beton);

    // L'herbe haute du bord, là où Bob a atterri à la fin de l'acte III.
    for (let x = 0; x < COUR.L; x += 2) {
        const h = 6 + alea() * 14;
        const c = COUL_COUR.herbe[Math.floor(alea() * COUL_COUR.herbe.length)];
        trait(ctx, x, COUR.sol + 2, x + (alea() - 0.5) * 5, COUR.sol - h, c);
        if (alea() > 0.95) {
            trait(ctx, x, COUR.sol + 2, x + (alea() - 0.5) * 8, COUR.sol - h - 8, COUL_COUR.herbeSeche);
        }
    }
}


function peindreLePremierPlan(ctx, alea) {

    // Le lierre du tout premier plan (photo 3) : on est dedans, donc
    // c'est sombre et ça ne sert qu'à cadrer.
    const y0 = COUR.bas - 34;
    for (let x = -4; x < COUR.L; x += 5) {
        const h = 18 + alea() * 30;
        pave(ctx, x, COUR.bas - h, 5, h, COUL_COUR.lierre);
        for (let i = 0; i < 3; i++) {
            disque(ctx, x + alea() * 6, COUR.bas - h + alea() * 10, 3 + alea() * 4, COUL_COUR.lierre);
        }
    }
    pave(ctx, 0, y0 + 20, COUR.L, COUR.bas - y0 - 20, [14, 20, 16]);

    // La nuit, par-dessus tout : elle tombe surtout sur le bas, parce
    // que la seule lumière de la cour vient d'en haut.
    for (let y = 0; y < COUR.H; y += 2) {
        const k = Math.max(0, (y - COUR.horizon * 0.4) / (COUR.H - COUR.horizon * 0.4));
        pave(ctx, 0, y, COUR.L, 2, [8, 10, 24, 0.06 + k * 0.22]);
    }
}


loadSprite("cour_fond", peindreLaCour());


/* ============================================================
   CADRER UNE ARÈNE — la cour, et plus tard le nid
   ============================================================
   Les deux décors vus de côté sont des tableaux plus larges que
   hauts. Sur un écran d'ordinateur, on les montre EN ENTIER et la
   caméra ne bouge pas : c'est le choix d'Evan, et il est juste —
   on voit d'un seul coup d'œil la distance entre Bob, tout en
   bas, et le petit carré jaune, tout en haut.

   Mais sur le téléphone de Klara, tenu debout, « tout montrer »
   donne une arène haute comme un timbre au milieu de deux grandes
   bandes noires. Mesuré : 375 x 812, l'arène tombe à 375 x 276.
   Injouable, et surtout moche.

   Alors, et SEULEMENT dans ce cas-là :
     - on grossit jusqu'à ce qu'une largeur utile remplisse
       l'écran ;
     - la caméra suit Bob, bornée aux bords du décor ;
     - et on remplit ce qui dépasse de la toile avec du ciel en
       haut et du sombre en bas, pour qu'il n'y ait jamais, jamais
       de bande noire.

   Sur grand écran, rien ne change : zoomTout l'emporte, la caméra
   reste au centre, et il n'y a rien à remplir.
   ============================================================ */
function cadrerLArene(L, H, cibleX, largeurMini) {

    const zoomTout = Math.min(width() / L, height() / H);
    const zoomLisible = Math.min(height() / H, width() / largeurMini);
    const zoom = Math.max(zoomTout, zoomLisible);
    setCamScale(zoom);

    const demi = width() / (2 * zoom);
    const demiH = height() / (2 * zoom);

    let x = L / 2;
    if (demi < L / 2) x = Math.max(demi, Math.min(L - demi, cibleX));

    let y = H / 2;
    if (demiH < H / 2) y = Math.max(demiH, Math.min(H - demiH, H / 2));

    return { zoom: zoom, x: x, y: y, demi: demi, demiH: demiH };
}


/* Ce qui dépasse de la toile : du ciel au-dessus, du sombre en
   dessous et sur les côtés. À appeler EN PREMIER dans le onDraw.

   ⚠️ En DÉGRADÉ, et pas en aplat. Un grand rectangle d'une seule
   couleur au-dessus du décor, ça ne se lit pas comme un ciel : ça se
   lit comme un bug d'affichage. Le dégradé, lui, passe inaperçu, et
   c'est tout ce qu'on lui demande. */
function remplirAutourDeLArene(cadre, L, H, ciel, sombre) {

    const g = cadre.x - cadre.demi - 4;
    const d = cadre.x + cadre.demi + 4;
    const h = cadre.y - cadre.demiH - 4;
    const b = cadre.y + cadre.demiH + 4;
    const l = d - g;

    const bandes = 24;

    if (h < 0) {
        // plus on monte, plus la nuit est profonde
        const hauteur = -h / bandes;
        for (let i = 0; i < bandes; i++) {
            const y = h + hauteur * i;
            const k = 1 - (i / bandes);
            drawRect({
                pos: vec2(g, y), width: l, height: hauteur + 1,
                color: melangerVersNoir(ciel, k * 0.55),
            });
        }
    }

    if (b > H) {
        const hauteur = (b - H) / bandes;
        for (let i = 0; i < bandes; i++) {
            const y = H + hauteur * i;
            const k = i / bandes;
            drawRect({
                pos: vec2(g, y), width: l, height: hauteur + 1,
                color: melangerVersNoir(sombre, k * 0.7),
            });
        }
    }

    if (g < 0) drawRect({ pos: vec2(g, h), width: -g, height: b - h, color: melangerVersNoir(sombre, 0.35) });
    if (d > L) drawRect({ pos: vec2(L, h), width: d - L, height: b - h, color: melangerVersNoir(sombre, 0.35) });
}


function melangerVersNoir(couleur, k) {
    return rgb(
        Math.round(couleur.r * (1 - k)),
        Math.round(couleur.g * (1 - k)),
        Math.round(couleur.b * (1 - k))
    );
}
