/* ============================================================
   LE NID — tout en haut de l'arbre
   ============================================================
   La scène la plus calme du jeu, juste après la plus bruyante.

   ------------------------------------------------------------
   POURQUOI ELLE SE JOUE COMME L'ACTE I
   ------------------------------------------------------------
   On revient exprès à la grammaire de l'appartement : on marche
   à gauche et à droite, un point doré flotte au-dessus de ce
   qu'on peut toucher, un verbe s'écrit à côté du bouton, on
   appuie. Rien de neuf à apprendre à la dernière minute — et le
   jeu se referme sur le geste avec lequel il a commencé.

   ------------------------------------------------------------
   CE QU'IL Y A DANS LE NID
   ------------------------------------------------------------
   Tout ce qu'elle lui a pris, dans l'ordre où elle l'a pris : le
   dé à coudre, le couvercle. Et tout ce qu'elle a pris à
   d'autres, avant lui — c'est ça qui fait mal, pas le vol.

   Rosy est prise dans un fil de fer. Un fil de fleuriste, celui
   qu'on serre autour d'un bouquet. Personne ne le dit à voix
   haute : Rosy tient une rose depuis le premier jour du jeu.

   ------------------------------------------------------------
   LE PÉTALE (décision d'Evan)
   ------------------------------------------------------------
   Bob le pose devant la mouette pour pouvoir sortir. Puis, au
   bord du nid, il revient le prendre, SOUS SON REGARD. Elle ne
   bouge pas. C'est là qu'elle arrête d'être un monstre, et on ne
   l'explique nulle part.

   ------------------------------------------------------------
   POUR TESTER
       octobre.html?nid
   ============================================================ */


// L'éclat de verre : il n'existe que comme filet de sécurité (voir
// essayerAvecLesPattes, plus bas). Pas d'icône : il n'y en a pas sur
// la planche d'Evan, et un objet sans icône garde son nom seul.
OBJETS.verre = { nom: "Un éclat de verre bleu" };


/* ⚠️ LA HAUTEUR DE « sol » N'EST PAS UN CHOIX D'IMAGE.
   La boîte de dialogue mange le bas de l'écran : 34 % de sa hauteur,
   plus une marge (voir DIALOGUE_PART_HAUTEUR, config.js). Tout ce qui
   est dessiné sous ~63 % de la scène est donc caché DÈS QUE
   QUELQU'UN PARLE — et ici, tout le monde parle tout le temps.
   Mesuré sur quatre formats d'écran (portrait de téléphone compris) :
   avec sol à 59 % de H, les pieds de Bob restent toujours au-dessus
   de la boîte. Si tu bouges l'un, revérifie l'autre. */
const NID = {
    L: 600,
    H: 380,

    sol: 226,                      // le plancher du nid : la ligne des pieds
    bord: { gauche: 52, droite: 536 },
    horizon: 140,
    rebord: 254,                   // le haut du rebord de devant

    // Où sont les choses, en x. Elles sont peintes dans le décor à
    // ces abscisses-là : une seule source, jamais deux.
    choses: {
        de: 96,
        couvercle: 176,
        tresor: 268,
        rosy: 372,
        bord: 494,
    },
};


const COUL_NID = {
    cielHaut: [38, 40, 74],
    cielBas: [176, 132, 112],
    cielOr: [232, 178, 128],

    villeLoin: [46, 44, 62],
    villeClaire: [64, 60, 78],
    fenetreVille: [244, 206, 140],
    eau: [76, 80, 104],
    eauClaire: [186, 168, 154],

    arbreLoin: [26, 32, 30],
    cour: [18, 22, 24],

    brindille: [92, 76, 56],
    brindilleClaire: [128, 108, 78],
    brindilleSombre: [54, 44, 34],
    duvet: [176, 168, 150],

    feuille: [40, 50, 36],
    feuilleRousse: [122, 84, 44],
    feuilleOr: [150, 116, 54],

    brille: [214, 206, 172],
    or: [196, 168, 96],
    argent: [188, 194, 200],
};


/* ============================================================
   LA PEINTURE
   ============================================================ */
function peindreLeGrandNid() {

    const t = nouvelleToile(NID.L, NID.H);
    const ctx = t.ctx;
    const alea = hasardFixe(20261008);

    peindreLeCielDuNid(ctx, alea);
    peindreKielDeLoin(ctx, alea);
    peindreLaCourDenBas(ctx, alea);
    peindreLaBrancheEtLeNid(ctx, alea);
    peindreLeTresor(ctx, alea);
    peindreLesFeuillesDuNid(ctx, alea);

    return t.toile;
}


function peindreLeCielDuNid(ctx, alea) {

    // Cinq heures moins le quart, le 8 octobre, à Kiel. Le ciel n'est
    // pas encore bleu : il est violet en haut et cuivre en bas, et la
    // limite entre les deux monte de minute en minute.
    for (let y = 0; y < NID.horizon + 20; y++) {
        const k = Math.pow(y / (NID.horizon + 20), 1.6);
        const c = melangeNid(COUL_NID.cielHaut, COUL_NID.cielBas, k);
        pave(ctx, 0, y, NID.L, 1, c);
    }
    // La bande chaude, juste au-dessus des toits.
    for (let y = NID.horizon - 34; y < NID.horizon + 20; y++) {
        const k = 1 - Math.abs(y - (NID.horizon - 4)) / 34;
        if (k <= 0) continue;
        pave(ctx, 0, y, NID.L, 1, [COUL_NID.cielOr[0], COUL_NID.cielOr[1], COUL_NID.cielOr[2], k * 0.5]);
    }

    // Les dernières étoiles, en haut, et seulement en haut.
    for (let i = 0; i < 40; i++) {
        const y = alea() * (NID.horizon - 70);
        const x = alea() * NID.L;
        const clarte = 0.15 + alea() * 0.45 * (1 - y / NID.horizon);
        pixel(ctx, x, y, [236, 238, 246, clarte]);
    }

    // Deux traînées de nuages, très plates : c'est un ciel de bord de
    // mer, il n'y a rien pour arrêter le vent.
    for (let n = 0; n < 3; n++) {
        const y = 40 + n * 34 + alea() * 12;
        const x0 = alea() * NID.L * 0.5;
        const l = 160 + alea() * 260;
        for (let x = x0; x < x0 + l; x += 2) {
            const k = Math.sin(((x - x0) / l) * Math.PI);
            pave(ctx, x, y + Math.sin(x * 0.03) * 2, 2, 2 + k * 3,
                [122, 108, 126, 0.12 + k * 0.16]);
        }
    }
}


function melangeNid(a, b, k) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * k),
        Math.round(a[1] + (b[1] - a[1]) * k),
        Math.round(a[2] + (b[2] - a[2]) * k),
    ];
}


/* ------------------------------------------------------------
   KIEL, de tout en haut
   ------------------------------------------------------------
   Du sommet d'un arbre de cour, on voit par-dessus les toits. Et
   Kiel est un port : au fond, il y a de l'eau, et sur l'eau il y
   a des grues. C'est tout ce qu'il faut pour que la ville soit
   celle-là et pas une autre.
   ------------------------------------------------------------ */
function peindreKielDeLoin(ctx, alea) {

    const y0 = NID.horizon;

    // L'eau du fjord, tout au fond, avec la première lumière dessus.
    pave(ctx, 0, y0 - 16, NID.L, 18, COUL_NID.eau);
    for (let i = 0; i < 90; i++) {
        const x = alea() * NID.L;
        const y = y0 - 15 + alea() * 15;
        pave(ctx, x, y, 2 + alea() * 6, 1, [COUL_NID.eauClaire[0], COUL_NID.eauClaire[1], COUL_NID.eauClaire[2], 0.12 + alea() * 0.3]);
    }

    // Les grues du chantier naval : trois silhouettes maigres, et
    // c'est la ville entière.
    [{ x: 92, h: 62 }, { x: 148, h: 48 }, { x: 468, h: 54 }].forEach(function (g) {
        const base = y0 - 4;
        pave(ctx, g.x, base - g.h, 3, g.h, COUL_NID.villeLoin);
        pave(ctx, g.x - 22, base - g.h, 46, 3, COUL_NID.villeLoin);
        pave(ctx, g.x - 22, base - g.h + 3, 3, 9, COUL_NID.villeLoin);
        // la petite lumière rouge tout en haut
        pixel(ctx, g.x + 1, base - g.h - 2, [196, 76, 68]);
    });

    // Les toits. Des pignons pointus : c'est le nord de l'Allemagne.
    let x = -14;
    while (x < NID.L + 20) {
        const l = 26 + Math.floor(alea() * 46);
        const h = 16 + Math.floor(alea() * 34);
        const haut = y0 - h;
        const clair = alea() > 0.6;
        const c = clair ? COUL_NID.villeClaire : COUL_NID.villeLoin;
        pave(ctx, x, haut, l, h + 24, c);

        // le pignon
        for (let i = 0; i < l / 2; i++) {
            pave(ctx, x + i, haut - (l / 2 - i) * 0.55, 1, 2, c);
            pave(ctx, x + l - 1 - i, haut - (l / 2 - i) * 0.55, 1, 2, c);
        }
        pave(ctx, x, haut, l, 1, eclaircir(c, 0.14));

        // deux ou trois fenêtres allumées, pas plus : à cinq heures,
        // presque tout le monde dort encore.
        for (let f = 0; f < 3; f++) {
            if (alea() > 0.24) continue;
            pave(ctx, x + 4 + alea() * (l - 10), haut + 6 + alea() * (h - 4), 2, 3, COUL_NID.fenetreVille);
        }
        x += l + 1;
    }

    // Le clocher, quelque part au milieu : un repère, pour que la
    // ligne de toits ne soit pas qu'une bande.
    const cx = 318;
    pave(ctx, cx, y0 - 76, 14, 80, COUL_NID.villeLoin);
    for (let i = 0; i < 22; i++) {
        pave(ctx, cx + 7 - Math.round(i * 0.32), y0 - 76 - 22 + i, Math.max(1, Math.round(i * 0.64)), 1, COUL_NID.villeLoin);
    }
    pave(ctx, cx + 4, y0 - 62, 6, 6, [226, 198, 138]);      // l'horloge
    pixel(ctx, cx + 6, y0 - 60, [40, 36, 40]);
}


/* ------------------------------------------------------------
   LA COUR, TOUT EN BAS
   ------------------------------------------------------------
   On ne la détaille pas : c'est une masse noire avec de l'herbe
   dedans, et une petite lumière couchée. Il faut juste qu'on
   comprenne qu'on est TRÈS haut.
   ------------------------------------------------------------ */
function peindreLaCourDenBas(ctx, alea) {

    const y0 = NID.horizon + 18;
    const y1 = NID.sol + 10;

    for (let y = y0; y < y1; y++) {
        const k = (y - y0) / (y1 - y0);
        pave(ctx, 0, y, NID.L, 1, melangeNid(COUL_NID.arbreLoin, COUL_NID.cour, k));
    }

    // Les couronnes des autres arbres de la cour, vues de dessus.
    // Petites et peu contrastées : douze mètres plus bas, dans le noir,
    // ça ne fait que des masses. Un gros disque bien net là-dedans
    // ressemble à une bulle posée sur l'image, pas à un arbre.
    for (let i = 0; i < 190; i++) {
        const x = alea() * NID.L;
        const y = y0 + 6 + alea() * (y1 - y0 - 24);
        const k = 1 - (y - y0) / (y1 - y0);
        const c = alea() > 0.94 ? COUL_NID.feuilleRousse : COUL_NID.arbreLoin;
        disque(ctx, x, y, 4 + alea() * 9, [c[0], c[1], c[2], 0.22 + k * 0.3]);
    }

    // La veilleuse, couchée dans l'herbe, minuscule. Elle est encore
    // allumée. C'est le seul point chaud de tout le bas de l'image.
    const vx = 236, vy = y1 - 26;
    for (let r = 26; r >= 1; r -= 3) {
        disque(ctx, vx, vy, r, [255, 206, 130, 0.035]);
    }
    pave(ctx, vx - 2, vy - 1, 4, 3, [255, 238, 182]);

    // Et deux fenêtres allumées dans le mur d'en face, très bas.
    pave(ctx, 66, y1 - 54, 4, 5, [230, 196, 136, 0.5]);
    pave(ctx, 512, y1 - 40, 4, 5, [230, 196, 136, 0.35]);
}


/* ------------------------------------------------------------
   LA BRANCHE, ET LE NID
   ------------------------------------------------------------ */
function peindreLaBrancheEtLeNid(ctx, alea) {

    // La grosse branche qui porte tout, en travers du cadre.
    for (let x = 0; x < NID.L; x++) {
        const y = NID.sol + 18 + Math.sin(x * 0.006) * 10;
        const e = 26 + Math.sin(x * 0.011) * 6;
        for (let i = 0; i < e; i++) {
            const c = i < e * 0.18 ? COUL_NID.brindilleClaire
                : (i > e * 0.7 ? COUL_NID.brindilleSombre : COUL_NID.brindille);
            pixel(ctx, x, y + i, c);
        }
    }

    // Le fond du nid : une cuvette de brindilles, tassée.
    for (let i = 0; i < 1400; i++) {
        const x = NID.bord.gauche - 24 + alea() * (NID.bord.droite - NID.bord.gauche + 48);
        const y = NID.sol - 22 + alea() * 46;
        const a = (alea() - 0.5) * 1.1;          // surtout à l'horizontale
        const lg = 6 + alea() * 22;
        const d = alea();
        const c = d > 0.72 ? COUL_NID.brindilleClaire
            : (d > 0.3 ? COUL_NID.brindille : COUL_NID.brindilleSombre);
        trait(ctx, x, y, x + Math.cos(a) * lg, y + Math.sin(a) * lg, c);
    }

    // Le creux, plus sombre, là où Bob marche.
    for (let i = 0; i < 260; i++) {
        const x = NID.bord.gauche + alea() * (NID.bord.droite - NID.bord.gauche);
        const y = NID.sol - 8 + alea() * 14;
        pave(ctx, x, y, 3 + alea() * 8, 1, [30, 24, 20, 0.35]);
    }

    // Du duvet : des plumes à elle, restées dedans. C'est chez elle.
    for (let i = 0; i < 90; i++) {
        const x = NID.bord.gauche + alea() * (NID.bord.droite - NID.bord.gauche);
        const y = NID.sol - 16 + alea() * 24;
        disque(ctx, x, y, 1 + alea() * 2.4, [COUL_NID.duvet[0], COUL_NID.duvet[1], COUL_NID.duvet[2], 0.35 + alea() * 0.3]);
    }

    /* Le rebord de DEVANT, par-dessus tout : c'est lui qui nous met
       DANS le nid au lieu de devant.

       ⚠️ Il est volontairement SOMBRE et peu dense. Premier essai :
       mille huit cents brindilles claires, et le bas de l'écran
       devenait un champ de paille qui tirait l'œil plus fort que
       Rosy. Un premier plan, ça cadre ; ça ne se regarde pas. */
    const creuxDe = function (x) { return Math.sin((x / NID.L) * Math.PI) * 14; };

    for (let i = 0; i < 850; i++) {
        const x = -20 + alea() * (NID.L + 40);
        const haut = NID.rebord + creuxDe(x);
        const y = haut + alea() * (NID.H - haut);
        const profond = (y - haut) / Math.max(1, NID.H - haut);
        const a = (alea() - 0.5) * 1.4;
        const lg = 8 + alea() * 26;
        const d = alea();
        // Plus on descend, plus c'est noir : on entre dans le nid.
        const c = d > 0.9 ? COUL_NID.brindille : COUL_NID.brindilleSombre;
        trait(ctx, x, y, x + Math.cos(a) * lg, y + Math.sin(a) * lg,
            [c[0], c[1], c[2], 0.85 - profond * 0.35]);
    }

    // La masse du rebord : un aplat sombre sous la ligne de crête,
    // qui donne sa silhouette au premier plan.
    for (let x = 0; x < NID.L; x++) {
        const haut = NID.rebord + creuxDe(x);
        for (let y = haut; y < NID.H; y++) {
            const profond = (y - haut) / Math.max(1, NID.H - haut);
            pave(ctx, x, y, 1, 1, [14, 12, 14, 0.42 + profond * 0.4]);
        }
        // la crête elle-même, éclairée par le ciel
        pave(ctx, x, haut - 1, 1, 2, [96, 82, 62, 0.5]);
    }

    // Et l'ombre que le rebord jette DANS le nid, juste au-dessus.
    for (let x = 0; x < NID.L; x++) {
        pave(ctx, x, NID.rebord + creuxDe(x) - 14, 1, 15, [12, 10, 12, 0.26]);
    }

    // Les deux montants qui sortent du nid à droite : le chemin vers
    // le bord, et le seul endroit par où on peut repartir.
    trait(ctx, NID.bord.droite - 6, NID.sol + 4, NID.L - 10, NID.sol - 30, COUL_NID.brindille);
    trait(ctx, NID.bord.droite - 6, NID.sol + 7, NID.L - 10, NID.sol - 27, COUL_NID.brindilleSombre);
    trait(ctx, NID.bord.droite + 4, NID.sol - 2, NID.L - 4, NID.sol - 44, COUL_NID.brindilleClaire);
}


/* ------------------------------------------------------------
   CE QUI BRILLE DEDANS
   ------------------------------------------------------------
   Vingt-trois objets. Aucun n'est à elle. C'est l'idée.
   ------------------------------------------------------------ */
function peindreLeTresor(ctx, alea) {

    const x0 = NID.choses.tresor;
    const y0 = NID.sol - 4;

    // Un tas, autour de l'abscisse « trésor ».
    const objets = [
        { dx: -44, dy: -2, l: 7, h: 4, c: COUL_NID.or },            // une pièce
        { dx: -30, dy: 2, l: 4, h: 4, c: COUL_NID.argent },
        { dx: -18, dy: -4, l: 11, h: 3, c: [188, 186, 190] },       // un trombone
        { dx: -6, dy: 1, l: 5, h: 5, c: [214, 188, 96] },
        { dx: 6, dy: -3, l: 9, h: 3, c: [206, 208, 214] },          // une barrette
        { dx: 18, dy: 2, l: 6, h: 4, c: [174, 96, 88] },            // un capuchon rouge
        { dx: 30, dy: -2, l: 4, h: 6, c: [148, 190, 204] },         // du verre bleu
        { dx: 42, dy: 1, l: 8, h: 3, c: COUL_NID.brille },
        { dx: 54, dy: -3, l: 5, h: 5, c: [222, 210, 160] },
        { dx: -52, dy: 3, l: 6, h: 3, c: [160, 164, 172] },
        { dx: 64, dy: 2, l: 7, h: 4, c: [198, 170, 108] },
    ];

    objets.forEach(function (o) {
        pave(ctx, x0 + o.dx, y0 + o.dy - o.h, o.l, o.h, o.c);
        pave(ctx, x0 + o.dx, y0 + o.dy - o.h, o.l, 1, eclaircir(o.c, 0.35));
        pave(ctx, x0 + o.dx, y0 + o.dy - 1, o.l, 1, assombrir(o.c, 0.4));
        pixel(ctx, x0 + o.dx + 1, y0 + o.dy - o.h - 1, [248, 244, 230]);
    });

    // Un morceau de papier d'aluminium froissé, un peu plus grand que
    // le reste : ça accroche la lumière n'importe comment.
    for (let i = 0; i < 26; i++) {
        const x = x0 + 76 + alea() * 22;
        const y = y0 - 10 + alea() * 10;
        pave(ctx, x, y, 1 + alea() * 4, 1 + alea() * 2,
            alea() > 0.5 ? [224, 228, 232] : [158, 164, 170]);
    }
}


function peindreLesFeuillesDuNid(ctx, alea) {

    // Le feuillage qui cadre, en haut et sur les côtés. C'est octobre :
    // il y en a de rousses.
    for (let i = 0; i < 340; i++) {
        const bord = alea();
        let x, y;
        if (bord < 0.45) { x = alea() * NID.L; y = alea() * 56; }
        else if (bord < 0.72) { x = alea() * 60; y = alea() * NID.H * 0.6; }
        else { x = NID.L - alea() * 60; y = alea() * NID.H * 0.6; }

        const d = alea();
        const c = d > 0.86 ? COUL_NID.feuilleRousse
            : (d > 0.74 ? COUL_NID.feuilleOr : COUL_NID.feuille);
        disque(ctx, x, y, 3 + alea() * 9, c);
    }

    // Les brindilles qui pendent du haut, devant tout.
    for (let i = 0; i < 26; i++) {
        const x = alea() * NID.L;
        const h = 20 + alea() * 70;
        trait(ctx, x, -4, x + (alea() - 0.5) * 24, h, COUL_NID.brindilleSombre);
    }

    // Un voile sombre sur les quatre bords : on est dans un arbre, il
    // fait noir autour.
    for (let i = 0; i < 46; i++) {
        const o = 0.03;
        pave(ctx, 0, i, NID.L, 1, [10, 12, 18, o * (1 - i / 46) * 2]);
        pave(ctx, 0, NID.H - 1 - i, NID.L, 1, [10, 12, 18, o * (1 - i / 46) * 2.4]);
        pave(ctx, i, 0, 1, NID.H, [10, 12, 18, o * (1 - i / 46) * 1.6]);
        pave(ctx, NID.L - 1 - i, 0, 1, NID.H, [10, 12, 18, o * (1 - i / 46) * 1.6]);
    }
}


loadSprite("nid_fond", peindreLeGrandNid());


/* ============================================================
   L'ÉTAT DE LA SCÈNE
   ============================================================ */
const nid = {

    etape: "arrivee",     // arrivee | rosy | libre | mouette | petale | repris | parti
    bob: { x: 470, y: NID.sol, vers: -1, marche: false },
    rosy: { x: NID.choses.rosy, libre: false, tremble: 0 },
    oiseau: { x: NID.L + 70, y: NID.sol, posee: false, vers: -1 },
    petale: null,         // { x, y } dès qu'il est posé dans le nid
    fil: 1,               // 1 = entier, 0 = coupé
    aube: 0.62,
    cible: null,          // la chose la plus proche de Bob
    vu: {},               // ce qu'il a déjà regardé
    ui: null,
    aide: 0,
    voile: 0,
};


/* ============================================================
   LA SCÈNE
   ============================================================ */
scene("nid", function () {

    oublierLeDialogue();
    charger();
    APPARENCES.samsam = "samsam_sans_pyjama";
    preparerLesSons();

    inventaire.aDroite = false;
    creerObjectif();
    preparerInventaire();
    creerJoystick();

    remettreLeNid();
    installerLInterfaceDuNid();
    brancherLesCommandesDuNid();

    onUpdate(function () {
        majLeSonDuNid();
        if (!nidTermine() && !dialogueEnCours() && !jeuEnCours()) {
            majBobDansLeNid();
            majLaCibleDuNid();
        }
        majLaMouetteDuNid();
        majLaCameraDuNid();
        majLInterfaceDuNid();
    });

    onDraw(function () {
        if (nid.cadre) {
            remplirAutourDeLArene(nid.cadre, NID.L, NID.H,
                rgb(COUL_NID.cielHaut[0], COUL_NID.cielHaut[1], COUL_NID.cielHaut[2]),
                rgb(18, 15, 16), "nid_fond");
        }
        drawSprite({ sprite: "nid_fond", pos: vec2(0, 0), width: NID.L, height: NID.H });
        dessinerLAubeDuNid();
        dessinerLesChosesDuNid();
        dessinerRosy();
        dessinerLaMouetteDuNid();
        dessinerBobDansLeNid();
        dessinerLeRebordDeDevant();
        dessinerLIndicateurDuNid();
        dessinerLeVoileDuNid();
    });

    arriverDansLeNid();
});


// Les deux dernières étapes : le dialogue de départ, puis le fondu.
// Dans les deux, on ne pilote plus rien et l'interface est rangée.
function nidTermine() {
    return nid.etape === "depart" || nid.etape === "parti";
}


function remettreLeNid() {
    nid.etape = "arrivee";
    nid.ailes = false;
    nid.bob.x = 470;
    nid.bob.y = NID.sol;
    nid.bob.vers = -1;
    nid.bob.marche = false;
    nid.rosy.libre = false;
    nid.rosy.tremble = 0;
    nid.oiseau.x = NID.L + 70;
    nid.oiseau.posee = false;
    nid.oiseau.rapporte = false;
    nid.oiseau.recule = false;
    nid.oiseau.vers = -1;
    nid.petale = null;
    nid.fil = 1;
    nid.aube = 0.62;
    nid.cible = null;
    nid.vu = {};
    nid.voile = 0;
    nid.aide = time() + 18;
}


function majLaCameraDuNid() {
    // Même règle qu'à la cour : tableau fixe sur grand écran, cadrage
    // qui suit Bob sur un téléphone (voir cadrerLArene, cour.js).
    // 0 -> 300 : du ciel au fond du nid. Le rebord de devant, en
    // dessous, est du premier plan : il peut sortir du cadre.
    nid.cadre = cadrerLArene(NID.L, NID.H, nid.bob.x, 430, 0, 300);
    setCamPos(nid.cadre.x, nid.cadre.y);
}


function majLeSonDuNid() {
    if (typeof volumeDeBoucle !== "function" || !son.ctx) return;
    if (typeof musiqueDuDehors === "function") musiqueDuDehors(true);
    // On est à douze mètres du sol, dans un arbre, au bord de la mer :
    // c'est l'endroit le plus venté du jeu. Mais pas au point de
    // couvrir la musique, alors on a baissé d'un cran.
    volumeDeBoucle("vent", 0.44);
    volumeDeBoucle("nuit", 0.22);
}


/* ============================================================
   LES COMMANDES — les mêmes que dans l'appartement
   ============================================================ */
function brancherLesCommandesDuNid() {

    const b = { tenu: false, id: null };
    nid.bouton = b;

    const surLeBouton = function (p) {
        return p.dist(nid.centreBouton || vec2(-999, -999)) < BOUTON_ACTION_RAYON * 1.5;
    };

    onTouchStart(function (p, t) {
        if (!surLeBouton(p)) return;
        b.tenu = true;
        b.id = t ? t.identifier : 0;
        agirDansLeNid();
    });
    onTouchEnd(function (p, t) {
        if ((t ? t.identifier : 0) === b.id) { b.tenu = false; b.id = null; }
    });
    onMousePress(function () {
        if (!surLeBouton(mousePos())) return;
        b.tenu = true; b.id = "souris";
        agirDansLeNid();
    });
    onMouseRelease(function () { if (b.id === "souris") { b.tenu = false; b.id = null; } });

    onKeyPress("space", agirDansLeNid);
    onKeyPress("e", agirDansLeNid);
    onKeyPress("enter", agirDansLeNid);
}


function majBobDansLeNid() {

    const b = nid.bob;
    const direction = lireDirection().x;

    b.marche = direction !== 0;
    if (b.marche) {
        b.x += direction * 66 * dt();
        b.vers = direction > 0 ? 1 : -1;
    }

    // À droite, la mouette bouche le passage tant qu'elle est là.
    let droite = NID.bord.droite;
    if (nid.oiseau.posee && nid.etape !== "repris" && !nidTermine()) {
        droite = Math.min(droite, nid.oiseau.x - 34);
    }
    b.x = Math.max(NID.bord.gauche, Math.min(droite, b.x));
}


/* ------------------------------------------------------------
   LES CHOSES, ET LEURS VERBES
   ------------------------------------------------------------
   Une seule table. Le verbe de chacune dépend de où on en est :
   c'est ce qui fait qu'on n'a jamais besoin d'un mode d'emploi.
   Une chose sans verbe est une chose qu'on ne peut pas toucher
   MAINTENANT, et le point doré ne s'allume pas dessus.
   ------------------------------------------------------------ */
const CHOSES_DU_NID = [

    {
        cle: "de", x: NID.choses.de,
        verbe: function () { return aObjet("de") ? null : "Le dé à coudre"; },
        action: reprendreLeDe,
    },

    {
        cle: "couvercle", x: NID.choses.couvercle,
        verbe: function () { return aObjet("couvercle") ? null : "Le couvercle"; },
        action: reprendreLeCouvercle,
    },

    {
        cle: "tresor", x: NID.choses.tresor,
        verbe: function () { return "Tout ce qui brille"; },
        action: regarderLeTresor,
    },

    {
        cle: "rosy", x: NID.choses.rosy,
        verbe: function () {
            if (!nid.rosy.libre) {
                if (nid.vu.rosy && aDeQuoiCouper()) return "Couper le fil";
                return "Rosy";
            }
            return "Parler à Rosy";
        },
        action: laChoseLaPlusImportante,
    },

    {
        // La pétale n'est plus une chose à cliquer : c'est ELLE qui
        // vient la rendre, au bord du nid (voir reprendreLePetale).
        cle: "petale", x: 0,
        verbe: function () { return null; },
        action: function () { },
    },

    {
        cle: "bord", x: NID.choses.bord,
        verbe: function () {
            if (!nid.rosy.libre) return null;
            if (nid.etape === "libre") return "Le bord du nid";
            // "mouette" ne dure que le temps de deux dialogues qui
            // s'enchaînent : rien à toucher pendant ce temps-là.
            if (nid.etape === "mouette") return null;
            // Tant que le pétale est par terre, on ne peut pas
            // repartir. Ce n'est pas une punition : c'est la seule
            // façon d'être sûr que Klara voie Bob revenir le
            // chercher, et c'est le meilleur moment de l'acte.
            if (nid.etape === "repris") return "Repartir";
            return null;
        },
        action: allerAuBord,
    },
];


function xDeLaChose(chose) {
    if (chose.cle === "petale") return nid.petale ? nid.petale.x : -999;
    return chose.x;
}


function majLaCibleDuNid() {

    let meilleure = null;
    let plusProche = 999;

    CHOSES_DU_NID.forEach(function (chose) {
        if (!chose.verbe()) return;
        const d = Math.abs(xDeLaChose(chose) - nid.bob.x);
        if (d > 52) return;
        if (d < plusProche) { plusProche = d; meilleure = chose; }
    });

    nid.cible = meilleure;
}


function agirDansLeNid() {
    if (dialogueEnCours() || jeuEnCours()) return;
    if (nidTermine()) return;
    if (!nid.cible) return;
    const chose = nid.cible;
    nid.bob.vers = xDeLaChose(chose) > nid.bob.x ? 1 : -1;
    chose.action();
}


/* ============================================================
   CE QU'IL TROUVE
   ============================================================ */
function arriverDansLeNid() {

    nid.etape = "arrivee";
    lancerDialogue([
        { texte: "Le bec s'ouvre. Bob tombe de vingt centimètres et atterrit sur un tapis de brindilles qui craque." },
        { texte: "Le nid est immense. Vu de la cour, c'était un tas. De l'intérieur, c'est une pièce." },
        { texte: "Elle ressort sans le regarder, et le ciel se referme au-dessus." },
        { texte: "Il fait presque jour. Par-dessus le bord du nid, on voit les toits, et derrière les toits, il y a de l'eau." },
        { qui: "bob", texte: "...c'est la mer." },
        { texte: "Trois grues maigres, très loin, avec une petite lumière rouge chacune. Une horloge sur un clocher. Des fenêtres qui s'allument une par une." },
        { texte: "Bob n'a jamais vu la ville de Klara. Il la voit maintenant, et elle est en train de se réveiller." },
        { qui: "bob", texte: "Rosy." },
        { texte: "Elle est là. Au fond du nid, contre le rebord, et elle ne s'est pas levée quand il est tombé." },
    ], function () {
        nid.etape = "rosy";
        if (typeof objectif === "function") objectif("Rosy.");
        nid.aide = time() + 20;
    });
}


function reprendreLeDe() {

    prendreObjet("de");
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.7);

    lancerDialogue([
        { texte: "Le dé à coudre. Il est posé sur le côté, au milieu de trois pièces de monnaie qui ne sont pas d'ici." },
        { texte: "Bob le remet sur sa tête. Il est froid, et il va exactement là où il allait." },
        { qui: "bob", texte: "Bon." },
        { qui: "bob", texte: "Un." },
    ]);
}


function reprendreLeCouvercle() {

    prendreObjet("couvercle");
    if (typeof sonSynthe === "function") sonSynthe("clang", 0.45);

    lancerDialogue([
        { texte: "Le couvercle de jus de mangue. Il y a une marque de bec dessus, bien nette, en plein milieu." },
        { texte: "Bob le repasse à son bras." },
        { qui: "bob", texte: "Deux." },
        { texte: "Il regarde le fond du nid, et tout ce qui brille dedans." },
        { qui: "bob", texte: "...et tout le reste appartient à quelqu'un." },
    ]);
}


function regarderLeTresor() {

    if (!nid.vu.tresor) {
        nid.vu.tresor = true;
        lancerDialogue([
            { texte: "Il y a vingt-trois choses dans ce nid, et Bob les compte." },
            { texte: "Une barrette à cheveux argentée. Un trombone. Un capuchon de stylo rouge. Un morceau de verre bleu poli par la mer. Une boucle d'oreille seule." },
            { texte: "Un bout de papier d'aluminium, froissé et lissé et refroissé, comme si quelqu'un y avait passé du temps." },
            { qui: "bob", texte: "..." },
            { qui: "bob", texte: "La boucle d'oreille, elle est toute seule." },
            { qui: "bob", texte: "Ça veut dire qu'il y a quelqu'un, en bas, qui a l'autre." },
            { texte: "Bob ne prend rien. Il remet même le trombone à plat." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Vingt-trois choses, et aucune n'est à elle." },
        { qui: "bob", texte: "Elle ne les mange pas. Elle ne s'en sert pas." },
        { qui: "bob", texte: "Elle les garde." },
    ]);
}


/* ------------------------------------------------------------
   ROSY
   ------------------------------------------------------------
   Sa voix, c'est son contrat : elle s'inquiète pour les autres
   AVANT de s'inquiéter pour elle, et avec Bob ses phrases
   s'arrêtent en plein milieu.
   ------------------------------------------------------------ */
function laChoseLaPlusImportante() {

    if (nid.rosy.libre) { parlerARosyDansLeNid(); return; }
    if (!nid.vu.rosy) { trouverRosy(); return; }
    if (aDeQuoiCouper()) { couperLeFil(); return; }
    essayerAvecLesPattes();
}


function trouverRosy() {

    nid.vu.rosy = true;
    nid.rosy.tremble = time();

    lancerDialogue([
        { texte: "Elle est entière. C'est la première chose que Bob vérifie, et c'est la seule qui compte." },
        { texte: "Elle a un fil de fer autour d'une patte et autour du ventre. Un fil fin, tourné trois fois, du genre qu'on serre autour d'un bouquet pour que les tiges tiennent ensemble." },
        // Rosy tient sa rose sur sa planche : on ne la lui enlève pas, et
        // on n'en peint pas une deuxième par terre (Evan).
        { texte: "Elle tient toujours sa rose. Les deux pattes serrées dessus, comme depuis le début." },
        { qui: "rosy", texte: "Bob ?" },
        { qui: "rosy", texte: "Bob, tu es— qu'est-ce que tu fais ic—" },
        { qui: "rosy", texte: "Est-ce que tout le monde va bien ? Est-ce que Bluey a dormi ? Il ne dort jamais quand il y a du bruit." },
        { qui: "bob", texte: "..." },
        { qui: "rosy", texte: "Et Samsam ? Il a froid sans son pyjama, il ne le dira pas mais il a froid." },
        { qui: "rosy", texte: "Et la fenêtre. Bob. Est-ce que quelqu'un a pensé à fermer la fenêtre ?" },
        { qui: "bob", texte: "Rosy." },
        { qui: "bob", texte: "La fenêtre est fermée." },
        { qui: "bob", texte: "Tout le monde va bien. Ils sont tous à la fenêtre et ils crient depuis trois heures." },
        { qui: "rosy", texte: "Oh." },
        { qui: "rosy", texte: "..." },
        { qui: "rosy", texte: "Alors ça va." },
        { texte: "Elle ne s'est pas plainte une fois. Pas du fil, pas de la nuit, pas du froid." },
        { qui: "bob", texte: "Tiens bon. Je te sors de là." },
    ], function () {
        if (typeof objectif === "function") objectif("Couper le fil.");
        nid.aide = time() + 12;
    });
}


/* ⚠️ Filet de sécurité. L'acte IV garantit que Bob arrive ici avec
   sa baguette cassée : elle casse dans une scène écrite d'avance.
   Mais si un jour une partie rechargée au mauvais moment le prive de
   tout, il ne doit PAS y avoir de nid sans sortie. Le nid fournit
   alors l'outil lui-même — il y a un morceau de verre poli par la
   mer dans le tas, et il est là depuis le premier dessin. */
function essayerAvecLesPattes() {

    lancerDialogue([
        { texte: "Bob prend le fil à deux pattes et tire." },
        { texte: "Le fil ne bouge pas. Il n'y a rien à tirer : c'est du métal, et ça a été tourné par quelqu'un qui savait le faire." },
        { qui: "bob", texte: "Il faudrait le couper." },
        { qui: "bob", texte: "Et je n'ai plus rien qui coupe." },
        { texte: "Il regarde ses pattes. Elles sont en peluche. Elles ont toujours été en peluche." },
        { texte: "Puis il regarde le tas, au milieu du nid." },
        { qui: "bob", texte: "...le morceau de verre." },
        { texte: "Bob va le chercher. C'est un éclat de verre bleu, usé par la mer sur trois côtés — et pas du tout sur le quatrième.", quand: prendreLeVerre },
        { qui: "bob", texte: "Elle l'a gardé parce qu'il brille." },
        { qui: "bob", texte: "Moi je le garde parce qu'il coupe." },
    ]);
}


function prendreLeVerre() {
    prendreObjet("verre");
    if (typeof sonSynthe === "function") sonSynthe("vitre", 0.5);
}


// Ce qui coupe un fil de fer : le bout cassé de la baguette, ou, à
// défaut, l'éclat de verre du nid. Une seule fonction, pour que les
// verbes et les dialogues ne puissent pas se contredire.
function aDeQuoiCouper() {
    return aObjet("baguette_cassee") || aObjet("verre");
}


function couperLeFil() {

    const debut = aObjet("baguette_cassee")
        ? [
            { texte: "Bob sort ce qui lui reste de la baguette : quatre centimètres de bois clair, cassés en biseau." },
            { texte: "Il n'a jamais rien coupé avec. Ça n'a jamais été fait pour ça — c'était une baguette à sushi, et avant cette nuit c'était un souvenir de restaurant." },
        ]
        : [
            { texte: "Bob sort l'éclat de verre bleu. Trois côtés sont doux comme un galet. Le quatrième ne l'est pas du tout." },
            { texte: "Il a passé des années dans la mer pour finir dans ce nid. Personne ne l'a jamais fabriqué pour couper quoi que ce soit." },
        ];

    lancerDialogue(debut.concat([
        { texte: "Il glisse le tranchant sous le fil, contre la patte de Rosy, et il appuie." },
        { qui: "rosy", texte: "Aïe— non, ça va. Continue." },
        { qui: "rosy", texte: "Continue, Bob." },
        { texte: "Le bois mord le métal. Le fil se tord. Bob appuie encore.", quand: grincerLeFil },
        { texte: "Et le fil casse.", quand: casserLeFil },
        { texte: "Rosy se lève. Elle se tient debout dans un nid de mouette, à douze mètres du sol, sa rose toujours dans les pattes." },
        { qui: "rosy", texte: "..." },
        { qui: "rosy", texte: "Bob. Ta baguette est cassée." },
        { qui: "bob", texte: "Oui." },
        { qui: "rosy", texte: "Tu l'as cassée pour venir ?" },
        { qui: "bob", texte: "Je l'ai cassée en te cherchant. C'est pas pareil." },
        { qui: "bob", texte: "Enfin — si. C'est pareil." },
        { qui: "bob", texte: "...oui." },
        { texte: "Elle le regarde. Elle ne dit rien pendant trois secondes, ce qui, chez Rosy, est très long." },
        { qui: "rosy", texte: "Tu as une marque de bec sur ton couvercle." },
        { qui: "bob", texte: "Il y en a trois." },
    ]), function () {
        nid.rosy.libre = true;
        nid.etape = "libre";
        if (typeof objectif === "function") objectif("Rentrer.");
        nid.aide = time() + 14;
        if (typeof jouerSon === "function") jouerSon("revelation", { volume: 0.45 });
    });
}


function grincerLeFil() {
    if (typeof sonSynthe === "function") sonSynthe("grince", 0.8);
}


function casserLeFil() {
    nid.fil = 0;
    if (typeof sonSynthe === "function") sonSynthe("tinte", 1);
    if (typeof jouerSon === "function") jouerSon("pop", { volume: 0.5 });
}


function parlerARosyDansLeNid() {

    if (!nid.vu.parle) {
        nid.vu.parle = true;
        lancerDialogue([
            { qui: "rosy", texte: "Bob. Comment est-ce qu'on descend ?" },
            { qui: "bob", texte: "..." },
            { texte: "Bob regarde par-dessus le bord. Le tronc fait douze mètres, l'écorce est mouillée, et il a déjà essayé quatre fois de la monter." },
            { qui: "bob", texte: "On ne descend pas." },
            { qui: "rosy", texte: "Oh." },
            { qui: "bob", texte: "Quelqu'un nous descend." },
            { qui: "rosy", texte: "..." },
            { qui: "rosy", texte: "Elle ?" },
            { qui: "bob", texte: "Elle." },
        ]);
        return;
    }

    // ⚠️ Pas un mot sur une couture : Bob n'a jamais été décousu, et
    // rien sur lui n'a jamais été réparé (Evan). Rosy remarque ce qui
    // se voit vraiment après une nuit dehors — de la terre et de
    // l'herbe.
    lancerDialogue([
        { qui: "rosy", texte: "Tu as de la terre partout. Et de l'herbe dans le dos." },
        { qui: "rosy", texte: "Doudou va te brosser. Il va râler, et il va te brosser quand même." },
        { qui: "bob", texte: "Il râle jamais." },
        { qui: "rosy", texte: "..." },
        { qui: "rosy", texte: "Non." },
    ]);
}


/* ------------------------------------------------------------
   LE BORD — elle revient, et elle se met en travers
   ------------------------------------------------------------ */
function allerAuBord() {

    if (nid.etape === "libre") { elleRevient(); return; }
    if (nid.etape !== "repris") return;
    // Au bord, si la pétale est encore par terre chez elle, c'est
    // qu'elle n'est pas encore venue la rendre. Elle vient.
    if (nid.petale) { reprendreLePetale(); return; }
    repartir();
}


function elleRevient() {

    nid.etape = "mouette";
    lancerDialogue([
        { texte: "Bob prend la patte de Rosy et il l'emmène vers la sortie du nid, là où deux grosses brindilles font une marche." },
        { texte: "Quelque chose se pose derrière eux. Le nid s'enfonce de deux centimètres.", quand: poserLaMouetteDuNid },
        { qui: "rosy", texte: "Bob—" },
        { texte: "Elle est entre eux et le bord. Elle ne crie pas. Elle ne bouge pas. Elle les regarde, la tête un peu penchée, comme les oiseaux regardent." },
        { texte: "Bob n'a plus de baguette. Le couvercle ne sert à rien ici : il n'y a pas la place de le lever." },
        { qui: "bob", texte: "..." },
        { texte: "Alors Bob fait la seule chose qui lui reste. Il fouille dans son short." },
        { texte: "Et il sort une pétale de rose." },
    ], function () {
        if (typeof objectif === "function") objectif("Il ne reste que la pétale.");
        nid.aide = time() + 12;
        offrirLePetale();
    });
}


function poserLaMouetteDuNid() {
    nid.oiseau.posee = true;
    nid.oiseau.x = NID.bord.droite + 16;
    nid.oiseau.vers = -1;
    if (typeof jouerSon === "function") jouerSon("atterrissage", { volume: 0.6 });
}


function offrirLePetale() {

    lancerDialogue([
        { texte: "C'est une pétale de rose rouge. Elle est un peu écornée sur un bord, parce qu'elle a fait toute la nuit dans la poche d'un ours." },
        { texte: "Bob la pose par terre, entre elle et lui, sur les brindilles.", quand: poserLePetale },
        { qui: "bob", texte: "Tiens." },
        { qui: "bob", texte: "Elle brille pas. Mais elle est douce, et tu n'en as pas." },
        { texte: "Elle regarde la pétale. Elle la regarde longtemps." },
        { texte: "Puis elle recule d'un pas, sur le côté, et le bord du nid est libre." },
        { qui: "rosy", texte: "Bob." },
        { qui: "rosy", texte: "C'était celle de ce matin." },
        { qui: "bob", texte: "Je sais." },
        { qui: "bob", texte: "Viens." },
    ], function () {
        nid.etape = "repris";
        if (typeof objectif === "function") objectif("Repartir.");
        nid.aide = time() + 16;
    });
}


function poserLePetale() {
    donnerObjet("petale");
    nid.petale = { x: nid.bob.x + 26, y: NID.sol - 3 };
    if (typeof sonSynthe === "function") sonSynthe("tok", 0.2);
}


/* ------------------------------------------------------------
   ET IL REVIENT LE PRENDRE (décision d'Evan)
   ------------------------------------------------------------
   Sous son regard. Elle ne bouge pas. On n'explique rien.
   ------------------------------------------------------------ */
/* ⚠️ CE N'EST PLUS BOB QUI LA REPREND : C'EST ELLE QUI LA REND.
   Evan : « j'aime que Bob donne la pétale à la mouette, mais c'est
   pas très cohérent qu'il lui donne et que direct après il la
   récupère ». Exact — ça annulait le don.

   Alors le don reste entier, et c'est ELLE qui revient la poser
   devant lui. Une pétale ne brille pas : elle n'en veut pas, et elle
   le fait savoir de la seule façon qu'elle connaît. C'est aussi ce
   qu'elle fera à l'épilogue avec la veilleuse — elle ne donne pas,
   elle RÉPARE. On ne l'explique nulle part. */
function reprendreLePetale() {

    lancerDialogue([
        { texte: "Ils sont au bord. Derrière eux, quelque chose remue dans les brindilles." },
        { qui: "rosy", texte: "Bob—" },
        { texte: "Elle avance. Elle a la pétale dans le bec.", quand: elleRapporteLaPetale },
        { texte: "Elle la pose par terre, devant les pattes de Bob, et elle recule d'un pas.", quand: elleReposeLaPetale },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Tu en veux pas ?" },
        { texte: "Elle penche la tête." },
        { qui: "bob", texte: "Elle brille pas. C'est ça ?" },
        { texte: "Elle est à trente centimètres. Elle pourrait fermer le bec une fois et ce serait fini." },
        { texte: "Elle ne bouge pas." },
        { texte: "Bob se baisse et il ramasse la pétale.", quand: ramasserLePetale },
        { qui: "bob", texte: "Merci." },
        { qui: "bob", texte: "Elle n'est pas à moi." },
        // ⚠️ C'EST ICI QU'ON EXPLIQUE LA PÉTALE, et nulle part ailleurs.
        // Evan : « j'ai pas compris qu'il fallait mettre la pétale sur
        // la table de nuit, pourquoi ?? ». Il avait raison : le geste
        // existait depuis l'acte I (le tapis blanc, « elle en perd tout
        // le temps »), mais personne ne l'avait jamais dit à voix haute.
        { qui: "bob", texte: "Klara en perd tout le temps. Son bouquet en laisse tomber une ou deux par nuit, sur le grand tapis blanc." },
        { qui: "bob", texte: "Tous les matins je les ramasse, et j'en pose une sur sa table de nuit avant qu'elle ouvre les yeux." },
        { qui: "bob", texte: "Elle croit que c'est le bouquet qui les met là." },
        { qui: "bob", texte: "Ça fait quatre ans." },
        { qui: "bob", texte: "Je vais pas m'arrêter ce matin." },
        { texte: "Elle penche la tête de l'autre côté." },
        { texte: "Et elle regarde ailleurs. Vers la mer, vers les grues, vers le ciel qui est en train de devenir gris clair." },
        { qui: "rosy", texte: "..." },
        { qui: "rosy", texte: "Bob." },
        { qui: "rosy", texte: "Est-ce que tu viens de discuter avec une mouette ?" },
        { qui: "bob", texte: "Non." },
        { qui: "bob", texte: "J'ai expliqué." },
    ], function () {
        if (typeof objectif === "function") objectif("Repartir.");
    });
}


function elleRapporteLaPetale() {
    nid.oiseau.rapporte = true;          // elle marche vers Bob avec
    nid.petale = null;                   // la pétale est dans son bec
    if (typeof jouerSon === "function") jouerSon("moin", { volume: 0.25 });
}


function elleReposeLaPetale() {
    nid.oiseau.rapporte = false;
    nid.oiseau.recule = true;
    nid.petale = { x: nid.bob.x + 22 * nid.bob.vers, y: NID.sol - 3 };
    if (typeof sonSynthe === "function") sonSynthe("tok", 0.2);
}


function ramasserLePetale() {
    prendreObjet("petale");
    nid.petale = null;
}


function repartir() {

    // "depart" et pas encore "parti" : le dialogue joue, les commandes
    // sont rangées, mais la mouette n'ouvre les ailes qu'à la réplique
    // qui le dit. Un décor qui anticipe le texte, ça se remarque.
    nid.etape = "depart";
    lancerDialogue([
        { texte: "Bob se met au bord, Rosy contre lui, et il regarde en bas." },
        { texte: "Douze mètres. L'herbe, la veilleuse couchée qui brille encore, la plaque d'égout, les vélos bleus. Et tout en haut du mur d'en face, un carré jaune." },
        { qui: "bob", texte: "Rosy." },
        { qui: "bob", texte: "Tu vois le carré jaune ?" },
        { qui: "rosy", texte: "Oui." },
        { qui: "bob", texte: "C'est là qu'on habite." },
        { texte: "Derrière eux, quelque chose ouvre deux ailes de soixante centimètres.", quand: ouvrirLesAiles },
        { qui: "rosy", texte: "Bob." },
        { qui: "bob", texte: "Tiens bon." },
        { qui: "bob", texte: "C'est tout ce qu'il y a à faire. Doudou me l'a dit au début de la nuit et je l'ai pas compris avant maintenant." },
        { texte: "Le bec se referme doucement sur le dos de Rosy. Elle ne crie pas." },
        { texte: "Et le nid s'en va vers le bas." },
    ], function () {
        nid.etape = "parti";
        quitterLeNid();
    });
}


function ouvrirLesAiles() {
    nid.ailes = true;
    if (typeof sonSynthe === "function") sonSynthe("rafale", 0.4);
}


function quitterLeNid() {
    noter("nid_fait");
    memoire.drapeaux.combat_phase = 5;
    sauvegarder();
    nid.voile = 0.001;
    // Un petit fondu au noir avant de revenir dans la cour : on
    // change de point de vue, et un fondu vaut mieux qu'une coupure.
    const fondu = onUpdate(function () {
        nid.voile = Math.min(1, nid.voile + dt() * 1.2);
        if (nid.voile >= 1) {
            fondu.cancel();
            go("cour");
        }
    });
}


/* ============================================================
   LA MOUETTE, DANS LE NID
   ============================================================ */
function majLaMouetteDuNid() {

    const o = nid.oiseau;
    if (!o.posee) return;

    // Elle vient rendre la pétale, puis elle recule. C'est le seul
    // moment où elle s'approche de son plein gré.
    if (o.rapporte) {
        o.x += ((nid.bob.x + 40 * nid.bob.vers) - o.x) * Math.min(1, dt() * 1.5);
        o.vers = nid.bob.x < o.x ? -1 : 1;
        return;
    }

    // Sinon elle glisse jusqu'à sa place, et elle ne bouge plus. C'est
    // son immobilité qui est inquiétante, pas ses mouvements.
    const vise = o.recule || nid.etape === "repris" || nidTermine()
        ? NID.bord.droite + 52
        : NID.bord.droite + 6;
    o.x += (vise - o.x) * Math.min(1, dt() * 1.6);
}


function dessinerLaMouetteDuNid() {

    const o = nid.oiseau;
    if (!o.posee) return;

    // Ailes fermées : elle est plus petite que Bob. De près, dans un
    // nid, ça ne rassure pas du tout.
    let frame = 0;
    if (nid.etape === "repris") frame = 2;            // elle picore, l'air de rien
    if (nid.ailes) frame = 13;                        // elle ouvre

    drawEllipse({
        pos: vec2(o.x, NID.sol + 3), radiusX: 16, radiusY: 4,
        color: rgb(0, 0, 0), opacity: 0.3,
    });
    drawSprite({
        sprite: "mouette", frame: frame,
        pos: vec2(o.x, NID.sol),
        width: CASE_MOUETTE, height: CASE_MOUETTE,
        anchor: "bot", flipX: o.vers < 0,
    });

    // Son œil, qui ne cligne presque jamais. Deux pixels, et c'est ce
    // qui fait qu'on ne lui tourne pas le dos.
    if (!nid.ailes) {
        const clignote = Math.sin(time() * 0.7) > 0.985;
        if (!clignote) {
            drawRect({
                pos: vec2(o.x - 12, NID.sol - 30), width: 2, height: 2,
                color: rgb(238, 232, 214), opacity: 0.9,
            });
        }
    }
}


/* ============================================================
   LE DESSIN
   ============================================================ */
function dessinerLAubeDuNid() {

    // Le jour monte pendant toute la scène : très lentement, et
    // personne ne le commente.
    nid.aube = Math.min(0.95, nid.aube + dt() * 0.008);
    drawRect({
        pos: vec2(0, 0), width: NID.L, height: NID.horizon + 40,
        color: rgb(240, 196, 150), opacity: (nid.aube - 0.62) * 0.5,
    });
    drawRect({
        pos: vec2(0, 0), width: NID.L, height: NID.H,
        color: rgb(190, 180, 200), opacity: (nid.aube - 0.62) * 0.18,
    });
}


function dessinerLesChosesDuNid() {

    // Le dé et le couvercle, tant qu'il ne les a pas repris. Ils sont
    // dessinés ICI et pas dans le décor, parce qu'ils disparaissent.
    if (!aObjet("de")) {
        const x = NID.choses.de, y = NID.sol - 2;
        drawRect({ pos: vec2(x - 4, y - 8), width: 8, height: 8, color: rgb(178, 172, 160) });
        drawRect({ pos: vec2(x - 4, y - 8), width: 8, height: 2, color: rgb(214, 210, 200) });
        drawRect({ pos: vec2(x - 3, y - 7), width: 6, height: 5, color: rgb(140, 134, 124) });
        etincelle(x + 3, y - 9, 0);
    }

    if (!aObjet("couvercle")) {
        const x = NID.choses.couvercle, y = NID.sol - 2;
        drawEllipse({ pos: vec2(x, y - 3), radiusX: 13, radiusY: 4.5, color: rgb(150, 152, 156) });
        drawEllipse({ pos: vec2(x, y - 4), radiusX: 10, radiusY: 3, color: rgb(196, 198, 202) });
        drawEllipse({ pos: vec2(x - 3, y - 5), radiusX: 3.5, radiusY: 1.2, color: rgb(230, 232, 236) });
        etincelle(x - 8, y - 8, 1.3);
    }

    // Le pétale, posé dans les brindilles. Il ne brille pas. C'est
    // dit dans le texte, et c'est vrai à l'écran.
    if (nid.petale) {
        const p = nid.petale;
        drawEllipse({
            pos: vec2(p.x, p.y), radiusX: 6, radiusY: 3.4,
            angle: -14, color: rgb(168, 52, 62),
        });
        drawEllipse({
            pos: vec2(p.x - 1, p.y - 1), radiusX: 4, radiusY: 2,
            angle: -14, color: rgb(206, 78, 88),
        });
    }

    // Les étincelles du tas, en continu : c'est ce qui attire l'œil
    // vers le seul endroit du nid qu'on n'est pas obligé de regarder.
    etincelle(NID.choses.tresor - 30, NID.sol - 10, 0.6);
    etincelle(NID.choses.tresor + 22, NID.sol - 8, 2.1);
    etincelle(NID.choses.tresor + 60, NID.sol - 11, 3.4);
}


// Un éclat qui passe. Toujours la même formule, décalée dans le
// temps : ça coûte trois lignes et ça fait vivre tout un tas.
function etincelle(x, y, decalage) {
    const k = (Math.sin(time() * 1.6 + decalage) + 1) / 2;
    if (k < 0.72) return;
    const o = (k - 0.72) / 0.28;
    drawRect({ pos: vec2(x - 3, y), width: 6, height: 1, color: rgb(255, 250, 232), opacity: o * 0.8 });
    drawRect({ pos: vec2(x, y - 3), width: 1, height: 6, color: rgb(255, 250, 232), opacity: o * 0.8 });
}


function dessinerRosy() {

    const r = nid.rosy;
    // La même règle que partout : la case d'un personnage vaut celle
    // de Bob (56) multipliée par sa taille. Rosy fait 0,9.
    const t = PERSONNAGES.rosy.taille * 56;

    // Libre, elle suit Bob de deux pas. Prise, elle ne bouge pas du
    // tout, et c'est ça qui se voit.
    let x = r.x;
    let frame = 0;
    if (r.libre) {
        x = nid.bob.x - 26 * nid.bob.vers;
        x = Math.max(NID.bord.gauche - 4, Math.min(NID.bord.droite + 4, x));
        frame = nid.bob.marche ? 12 + Math.floor(time() * 7) % 4 : 2;
        r.x += (x - r.x) * Math.min(1, dt() * 3.4);
        x = r.x;
    }

    drawEllipse({
        pos: vec2(x, NID.sol + 3), radiusX: 11, radiusY: 3.5,
        color: rgb(0, 0, 0), opacity: 0.26,
    });

    // Elle tremble un peu, les premières secondes.
    const tremble = r.libre || !r.tremble ? 0
        : Math.max(0, 1 - (time() - r.tremble) / 8) * Math.sin(time() * 18) * 0.7;

    // ⚠️ flipX comme pour Bob : < 0. Elle le SUIT, elle ne lui fait pas
    // face — avec le test inversé, elle marchait à reculons.
    drawSprite({
        sprite: "rosy", frame: frame,
        pos: vec2(x + tremble, NID.sol),
        width: t, height: t, anchor: "bot",
        flipX: r.libre ? nid.bob.vers < 0 : false,
    });

    // ⚠️ PAS de rose peinte par terre : elle en tient déjà une sur sa
    // planche, et il ne peut pas y en avoir deux (Evan).

    // LE FIL DE FER. Trois tours, et on voit qu'il serre.
    if (nid.fil > 0) {
        const c = rgb(158, 162, 170);
        for (let i = 0; i < 3; i++) {
            const y = NID.sol - 10 - i * 5;
            drawEllipse({
                pos: vec2(x, y), radiusX: 11 - i * 0.6, radiusY: 2.4,
                fill: false, outline: { width: 1, color: c }, opacity: 0.95,
            });
        }
        // le bout qui dépasse, tortillé
        drawLine({ p1: vec2(x + 10, NID.sol - 15), p2: vec2(x + 18, NID.sol - 21), width: 1, color: c });
        drawLine({ p1: vec2(x + 18, NID.sol - 21), p2: vec2(x + 14, NID.sol - 26), width: 1, color: c });
        // et le tour autour de la patte
        drawEllipse({
            pos: vec2(x - 4, NID.sol - 2), radiusX: 5, radiusY: 2,
            fill: false, outline: { width: 1, color: c }, opacity: 0.95,
        });
    }
}


function dessinerBobDansLeNid() {

    const b = nid.bob;
    let frame = 2;
    if (b.marche) frame = 12 + Math.floor(time() * 8) % 4;

    drawEllipse({
        pos: vec2(b.x, b.y + 3), radiusX: 13, radiusY: 4,
        color: rgb(0, 0, 0), opacity: 0.3,
    });
    drawSprite({
        sprite: "bob", frame: frame,
        pos: vec2(b.x, b.y + 2),
        width: 56, height: 56, anchor: "bot", flipX: b.vers < 0,
    });

    /* ⚠️ ON NE PEINT RIEN DANS SES PATTES ICI.
       Evan : « j'aime pas que Bob ait ses armes dans les mains dans le
       nid, c'est moche ». Il a raison : des ellipses et des traits
       posés à la main par-dessus une planche dessinée, ça se voit tout
       de suite, et ça ne ressemble à rien. Ses affaires, on les suit
       dans l'inventaire, à gauche — c'est fait pour ça. */
}


// Le rebord de devant, redécoupé dans le décor et repeint PAR-DESSUS
// les personnages : ils sont dans la cuvette du nid, pas posés sur
// une image de nid.
function dessinerLeRebordDeDevant() {
    // Assez haut pour mordre sur les pieds de tout le monde : les
    // brindilles doivent passer DEVANT, sinon les personnages ont
    // l'air posés sur une photo de nid.
    const y = NID.rebord - 28;
    drawSprite({
        sprite: "nid_fond",
        pos: vec2(0, y), width: NID.L, height: NID.H - y,
        quad: quad(0, y / NID.H, 1, (NID.H - y) / NID.H),
    });
}


/* Le point doré au-dessus de ce qu'on peut toucher : le même qu'au
   premier acte (interactions.js). Il a juste un halo en plus — dans
   le nid, le fond est presque noir, et une pastille couleur vieil or
   posée dessus se confond avec les brindilles. */
function dessinerLIndicateurDuNid() {
    if (!nid.cible) return;
    const x = xDeLaChose(nid.cible);
    const y = NID.sol - 62 + Math.sin(time() * 3) * 3;
    const bat = 0.6 + Math.abs(Math.sin(time() * 2.4)) * 0.4;

    for (let i = 3; i >= 1; i--) {
        drawCircle({
            pos: vec2(x, y), radius: 5 + i * 5,
            color: rgb(...COULEUR_OR), opacity: 0.07 * bat,
        });
    }
    drawCircle({ pos: vec2(x, y), radius: 6, color: rgb(...COULEUR_OR) });
    drawCircle({ pos: vec2(x - 1.6, y - 1.6), radius: 2, color: rgb(252, 244, 222) });
    drawCircle({
        pos: vec2(x, y), radius: 6,
        fill: false, outline: { width: 2, color: rgb(...COULEUR_ENCRE) },
    });
}


function dessinerLeVoileDuNid() {
    if (!nid.voile) return;
    drawRect({
        pos: vec2(0, 0), width: NID.L, height: NID.H,
        color: rgb(12, 12, 18), opacity: nid.voile,
    });
}


/* ============================================================
   L'INTERFACE — celle de l'appartement, à l'identique
   ============================================================ */
function installerLInterfaceDuNid() {

    const ui = {};

    ui.bouton = add([
        circle(BOUTON_ACTION_RAYON),
        pos(0, 0), anchor("center"), fixed(), z(Z_INTERFACE - 5),
        color(...COULEUR_ACCENT),
        outline(3, rgb(...COULEUR_CREME)),
        opacity(0),
    ]);

    ui.point = add([
        circle(9),
        pos(0, 0), anchor("center"), fixed(), z(Z_INTERFACE - 4),
        color(...COULEUR_CREME), opacity(0),
    ]);

    ui.fondVerbe = add([
        rect(10, 10, { radius: 6 }),
        pos(0, 0), anchor("right"), fixed(), z(Z_INTERFACE - 5),
        color(...COULEUR_NUIT), opacity(0),
    ]);

    ui.verbe = add([
        text("", { size: 14 }),
        pos(0, 0), anchor("right"), fixed(), z(Z_INTERFACE - 4),
        color(...COULEUR_CREME), opacity(0),
    ]);

    ui.aide = add([
        text("", { size: 14, width: 420, align: "center" }),
        pos(0, 0), anchor("top"), fixed(), z(Z_INTERFACE),
        color(...COULEUR_CREME), opacity(0),
    ]);

    ui.fondAide = add([
        rect(10, 10, { radius: 8 }),
        pos(0, 0), anchor("top"), fixed(), z(Z_INTERFACE - 1),
        color(...COULEUR_NUIT), opacity(0),
    ]);

    nid.ui = ui;
}


function majLInterfaceDuNid() {

    const ui = nid.ui;
    if (!ui) return;
    const cache = dialogueEnCours() || jeuEnCours() || nidTermine();

    const centre = vec2(
        width() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON,
        height() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON
    );
    nid.centreBouton = centre;

    const verbe = nid.cible ? nid.cible.verbe() : null;
    const visible = !cache && !!verbe;

    ui.bouton.pos = centre;
    ui.point.pos = centre;
    ui.bouton.opacity = visible ? (nid.bouton && nid.bouton.tenu ? 1 : 0.85) : 0;
    ui.point.opacity = visible ? 0.9 : 0;

    ui.verbe.textSize = echelleInterface() - 2;
    ui.verbe.text = verbe || "";
    ui.verbe.pos = centre.add(vec2(-BOUTON_ACTION_RAYON - 12, 0));
    ui.verbe.opacity = visible ? 1 : 0;

    ui.fondVerbe.pos = ui.verbe.pos.add(vec2(9, 0));
    ui.fondVerbe.width = (ui.verbe.width || 10) + 18;
    ui.fondVerbe.height = (ui.verbe.height || 16) + 10;
    ui.fondVerbe.opacity = visible ? 0.65 : 0;

    // En haut, sous l'objectif : le bas de l'écran est pris par le
    // joystick et par le bouton (même raison qu'à l'acte IV).
    const reste = (nid.aide || 0) - time();
    const bas = typeof basDeLObjectif === "function" ? basDeLObjectif() : null;
    ui.aide.text = "← →  marcher.     ESPACE : le mot écrit à côté du bouton.";
    ui.aide.textSize = echelleInterface() - 2;
    ui.aide.width = Math.min(width() - 40, 460);
    ui.aide.pos = vec2(width() / 2, (bas ? bas.y : 44) + 20);
    const o = cache ? 0 : Math.max(0, Math.min(1, reste / 2)) * 0.9;
    ui.aide.opacity = o;
    ui.fondAide.pos = ui.aide.pos.sub(vec2(0, 8));
    ui.fondAide.width = ui.aide.width + 24;
    ui.fondAide.height = (ui.aide.height || 20) + 16;
    ui.fondAide.opacity = o * 0.95;

    // Même chose qu'à l'acte IV : l'inventaire descend sous l'aide.
    if (typeof poserBandeauDAide === "function") {
        poserBandeauDAide(o < 0.04 ? null : {
            gauche: ui.fondAide.pos.x - ui.fondAide.width / 2,
            droite: ui.fondAide.pos.x + ui.fondAide.width / 2,
            y: ui.fondAide.pos.y + ui.fondAide.height,
        });
    }
}
