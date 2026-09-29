/* ============================================================
   LA PILE DE VAISSELLE — remonter la baguette
   ============================================================
   On voit l'évier de l'intérieur. La pile monte très haut, et la
   baguette est tout en bas, sous absolument toute la vaisselle.
   Il faut la faire remonter jusqu'à la surface, en la guidant dans
   le petit passage qui serpente entre les assiettes.

     - TOUT DOUCEMENT : au-delà d'une certaine vitesse, la pile
       tangue. Si elle tangue trop, tout s'effondre.
     - effleurer une assiette, un bol, une casserole : ça tinte,
       ça fait un peu de bruit, et la pile tangue un peu plus ;
     - toucher un VERRE : tout s'effondre, tout de suite.
     - un effondrement fait un bruit énorme (la jauge du sommeil de
       Klara bondit) et la baguette retombe au fond. On recommence.

   ------------------------------------------------------------
   LES COMMANDES (Evan : « avec la souris, la baguette ne suit pas
   assez ; aux flèches, c'est beaucoup trop simple »)

     souris / doigt   on TIENT (bouton enfoncé, ou doigt posé), et
                      la baguette file vers le pointeur — d'autant
                      plus vite qu'il est loin. Pointeur juste
                      au-dessus : elle monte doucement. Pointeur en
                      haut de l'écran : elle fonce, et tout tombe.
     flèches          la baguette ACCÉLÈRE tant qu'on tient la
                      touche : au bout d'une seconde, c'est trop
                      vite. Il faut tapoter.

   Une jauge « vitesse », à gauche, montre où est la limite.

   ------------------------------------------------------------
   LE DESSIN
   Toute la vaisselle est peinte en pixels, une fois, au chargement
   (voir pixels.js) : c'est une seule image, découpée morceau par
   morceau à l'affichage, pour que chaque morceau puisse tanguer et
   tomber tout seul.

   RÉGLER
     VAISSELLE.chemin       le passage, du fond vers la surface
     VAISSELLE.vitesseMax   au-delà, la pile tangue
     VAISSELLE.raideur      la souris/le doigt : plus haut = plus nerveux
   Tout est en « unités de pile » (1 unité = 1 pixel de peinture) :
   la pile fait 300 de large, et l'écran l'agrandit pour qu'elle tienne.
   ============================================================ */


const VAISSELLE = {
    L: 300,
    H: 1400,

    // [y, milieu du passage, largeur du passage], du fond (y = H)
    // jusqu'au-dessus de la surface (y < 0).
    chemin: [
        [1400, 150, 90],
        [1330, 150, 70],
        [1250, 110, 52],
        [1170, 110, 44],
        [1090, 180, 50],
        [1010, 200, 40],
        [930, 140, 46],
        [850, 96, 44],
        [770, 96, 36],
        [690, 160, 48],
        [610, 208, 44],
        [530, 170, 38],
        [450, 112, 46],
        [370, 112, 38],
        [290, 176, 46],
        [210, 150, 42],
        [130, 122, 52],
        [60, 150, 80],
        [0, 150, 160],
        [-200, 150, 300],
    ],

    vitesseMax: 65,          // unités par seconde : au-delà, la pile tangue
    raideur: 2.5,            // souris/doigt : vitesse = écart x raideur
    vitesseSuivi: 240,       // ... plafonnée à ça
    clavierAccel: 55,        // flèches : l'accélération, par seconde
    clavierMax: 170,
    rayon: 5,                // le bout de la baguette
    longueurBaguette: 210,
    margeHaut: 300,          // la cuisine, au-dessus de la surface (dans l'image du fond)
};

const TYPES_VAISSELLE = ["assiettes", "assiettes", "bol", "casserole", "couvercle", "tasse", "fourchettes"];


// Le passage à la hauteur y : son milieu et sa largeur.
function passageDeLaVaisselle(y) {
    const c = VAISSELLE.chemin;
    if (y >= c[0][0]) return { x: c[0][1], w: c[0][2] };
    for (let i = 0; i < c.length - 1; i++) {
        const a = c[i];
        const b = c[i + 1];
        if (y <= a[0] && y >= b[0]) {
            let t = (a[0] - y) / (a[0] - b[0]);
            t = t * t * (3 - 2 * t);
            return { x: a[1] + (b[1] - a[1]) * t, w: a[2] + (b[2] - a[2]) * t };
        }
    }
    const d = c[c.length - 1];
    return { x: d[1], w: d[2] };
}


// Un hasard qui donne toujours la même pile : on peut apprendre
// le chemin d'un essai à l'autre.
function hasardFixe(graine) {
    let s = graine >>> 0;
    return function () {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}


/* ------------------------------------------------------------
   La pile : des tranches horizontales, chacune coupée en deux par
   le passage. À gauche et à droite, de la vaisselle. Dans les
   passages étroits, un verre borde le chemin. Tout est en nombres
   entiers : ce sont des pixels de peinture.
   ------------------------------------------------------------ */
function empilerLaVaisselle() {

    const V = VAISSELLE;
    const hasard = hasardFixe(8102026);
    const pile = [];
    let bas = V.H - 44;
    let i = 0;

    while (bas > 24) {
        const h = 20 + Math.floor(hasard() * 4) * 3;
        const haut = bas - h;
        // Le bord de chaque tranche suit le passage là où il est le
        // plus ouvert, en haut ou en bas de la tranche : le milieu du
        // passage ne frôle ainsi jamais rien. C'est le joueur qui
        // frôle, quand il s'en écarte.
        const c1 = passageDeLaVaisselle(haut);
        const c2 = passageDeLaVaisselle(bas);
        const bordG = Math.floor(Math.min(c1.x - c1.w / 2, c2.x - c2.w / 2));
        const bordD = Math.ceil(Math.max(c1.x + c1.w / 2, c2.x + c2.w / 2));
        const tranche = { haut: haut, h: h, morceaux: [] };
        const etroit = Math.min(c1.w, c2.w) < 42;

        poserMorceaux(tranche, 6, bordG, "gauche", hasard, etroit && i % 3 === 0);
        poserMorceaux(tranche, bordD, V.L - 6, "droite", hasard, etroit && i % 3 === 1);

        pile.push(tranche);
        bas = haut - 2;
        i++;
    }
    return pile;
}


function poserMorceaux(tranche, x0, x1, cote, hasard, avecVerre) {

    if (x1 - x0 < 4) return;

    const morceau = function (a, b, type) {
        return { x0: a, x1: b, type: type, cote: cote, teinte: hasard(), chute: null };
    };
    const auHasard = function () {
        return TYPES_VAISSELLE[Math.floor(hasard() * TYPES_VAISSELLE.length)];
    };

    // Le verre, s'il y en a un, borde le passage.
    if (avecVerre && x1 - x0 > 34) {
        const lv = 24;
        if (cote === "gauche") {
            tranche.morceaux.push(morceau(x1 - lv, x1, "verre"));
            x1 -= lv;
        } else {
            tranche.morceaux.push(morceau(x0, x0 + lv, "verre"));
            x0 += lv;
        }
    }

    // Le reste en morceaux de taille raisonnable : une tasse ne fait
    // pas toute la largeur d'un évier. Les assiettes, si.
    let x = x0;
    while (x1 - x > 2) {
        const type = auHasard();
        const large = type === "assiettes" || type === "casserole";
        let l = Math.round(large ? 70 + hasard() * 70 : 26 + hasard() * 22);
        if (x1 - x - l < 18) l = x1 - x;
        tranche.morceaux.push(morceau(x, x + l, type));
        x += l + 1;
    }
}


/* ============================================================
   LA PEINTURE — une fois, au chargement
   ============================================================ */
const PILE_VAISSELLE = empilerLaVaisselle();

function peindreLaPile(pile) {
    const V = VAISSELLE;
    const t = nouvelleToile(V.L, V.H);
    pile.forEach(function (tr) {
        tr.morceaux.forEach(function (m) { peindreMorceau(t.ctx, m, tr.haut, tr.h); });
    });
    return t.toile;
}


function peindreMorceau(ctx, m, y, h) {

    const x = m.x0;
    const l = m.x1 - m.x0;
    if (l < 3) return;

    if (m.type === "assiettes") {
        const n = Math.max(1, Math.floor(h / 5));
        const ph = Math.floor(h / n);
        const blanc = m.teinte < 0.5 ? [246, 243, 236] : [238, 235, 227];
        for (let k = 0; k < n; k++) {
            const yk = y + h - (k + 1) * ph;
            boite(ctx, x, yk, l, ph, blanc, [118, 110, 102]);
            pave(ctx, x + 2, yk + 1, l - 4, 1, [108, 148, 196]);          // le liseré bleu
            if (ph >= 5) pave(ctx, x + 2, yk + ph - 2, l - 4, 1, [214, 207, 196]);
            pixel(ctx, x + 3, yk + 2, [255, 255, 255]);
        }

    } else if (m.type === "bol") {
        const fond = [236, 216, 192];
        const contour = [128, 104, 84];
        for (let r = 0; r < h; r++) {
            const f = r / (h - 1);
            const retrait = Math.round(f * f * l * 0.22);
            const xr = x + retrait;
            const lr = l - 2 * retrait;
            pave(ctx, xr, y + r, lr, 1, contour);
            if (r === 0 || r === h - 1) continue;
            const c = (f > 0.3 && f < 0.48) ? [196, 110, 84] : (f > 0.72 ? [214, 190, 164] : fond);
            pave(ctx, xr + 1, y + r, lr - 2, 1, c);
        }
        pave(ctx, x + 2, y + 1, l - 4, 1, [250, 240, 226]);
        pave(ctx, x + Math.round(l * 0.2), y + 3, 1, Math.max(0, Math.round(h * 0.3)), [252, 244, 232]);

    } else if (m.type === "casserole") {
        boite(ctx, x, y, l, h, [70, 74, 84], [30, 32, 38]);
        pave(ctx, x + 1, y + 1, l - 2, 2, [134, 140, 152]);
        pave(ctx, x + 1, y + h - 3, l - 2, 1, [52, 56, 64]);
        pave(ctx, x + Math.round(l * 0.3), y + 4, 2, Math.max(0, h - 9), [100, 106, 118]);
        const xm = m.cote === "gauche" ? x + 4 : x + l - 6;
        pave(ctx, xm, y + 4, 2, 2, [150, 156, 168]);
        pave(ctx, xm, y + h - 7, 2, 2, [150, 156, 168]);

    } else if (m.type === "couvercle") {
        const cx = x + l / 2;
        const haut = y + 3;
        const hh = h - 3;
        for (let r = 0; r < hh; r++) {
            const f = (hh - r) / hh;
            const demi = Math.max(2, Math.round((l / 2) * Math.sqrt(Math.max(0, 1 - f * f * 0.85))));
            pave(ctx, cx - demi, haut + r, 2 * demi, 1, [104, 112, 124]);
            const c = r < 2 ? [222, 228, 236] : (r > hh - 4 ? [148, 156, 168] : [178, 186, 196]);
            pave(ctx, cx - demi + 1, haut + r, 2 * demi - 2, 1, c);
        }
        pave(ctx, x, y + h - 1, l, 1, [92, 100, 112]);
        boite(ctx, Math.round(cx - 3), y, 6, 5, [60, 64, 72], [28, 30, 36]);

    } else if (m.type === "tasse") {
        const c = m.teinte < 0.33 ? [204, 112, 92] : (m.teinte < 0.66 ? [108, 148, 192] : [226, 188, 92]);
        const contour = assombrir(c, 0.5);
        const anse = 6;
        const bx = m.cote === "gauche" ? x + anse - 1 : x;
        const bl = l - anse + 1;
        boite(ctx, bx, y + 1, bl, h - 1, c, contour);
        pave(ctx, bx + 1, y + 2, bl - 2, 2, assombrir(c, 0.25));
        pave(ctx, bx + 2, y + 5, 2, Math.max(0, h - 9), eclaircir(c, 0.4));
        // l'anse, côté mur : un anneau
        const ax = m.cote === "gauche" ? x : x + l - anse;
        const ay = y + Math.round(h * 0.25);
        const ah = Math.max(6, Math.round(h * 0.5));
        paveArrondi(ctx, ax, ay, anse, ah, contour);
        paveArrondi(ctx, ax + 1, ay + 1, anse - 2, ah - 2, c);
        ctx.clearRect(ax + 2, ay + 2, anse - 4, ah - 4);

    } else if (m.type === "fourchettes") {
        for (let k = 1; k <= 3; k++) {
            const yf = y + Math.round(k * h / 4) - 1;
            pave(ctx, x + 1, yf - 1, l - 2, 4, [96, 102, 112]);
            pave(ctx, x + 2, yf, l - 4, 2, [206, 212, 220]);
            pixel(ctx, x + 3, yf, [255, 255, 255]);
            // la tête et les dents, côté passage
            const xt = m.cote === "gauche" ? x + l - 8 : x;
            pave(ctx, xt, yf - 2, 8, 6, [96, 102, 112]);
            pave(ctx, xt + 1, yf - 1, 6, 4, [206, 212, 220]);
            const xd = m.cote === "gauche" ? xt + 3 : xt + 1;
            ctx.clearRect(xd, yf, 4, 1);
            ctx.clearRect(xd, yf + 2, 4, 1);
        }

    } else if (m.type === "verre") {
        // Un verre dans un autre verre, transparent : on voit l'évier au travers.
        pave(ctx, x + 1, y + 1, l - 2, h - 2, [190, 225, 245, 0.25]);
        pave(ctx, x, y + 1, 1, h - 2, [228, 242, 250]);
        pave(ctx, x + l - 1, y + 1, 1, h - 2, [228, 242, 250]);
        pave(ctx, x + 1, y, l - 2, 1, [228, 242, 250]);
        pave(ctx, x + 1, y + h - 3, l - 2, 3, [200, 228, 246, 0.7]);
        pave(ctx, x + 4, y + 3, 1, h - 7, [228, 242, 250, 0.75]);
        pave(ctx, x + l - 5, y + 3, 1, h - 7, [228, 242, 250, 0.75]);
        pave(ctx, x + 5, y + 3, l - 10, 1, [228, 242, 250, 0.75]);
        pave(ctx, x + 2, y + 2, 1, h - 6, [255, 255, 255, 0.9]);
    }
}


// L'évier : la cuisine la nuit au-dessus, le rebord, l'acier brossé,
// et tout au fond la flaque et la bonde. Une seule grande image.
function peindreLEvier() {

    const V = VAISSELLE;
    const Y0 = V.margeHaut;
    const t = nouvelleToile(V.L, V.H + Y0 + 60);
    const ctx = t.ctx;

    // la cuisine, la nuit
    pave(ctx, 0, 0, V.L, Y0, [30, 28, 46]);
    boite(ctx, 22, 60, 100, 128, [50, 60, 98], [18, 18, 32]);
    pave(ctx, 71, 61, 2, 126, [18, 18, 32]);
    pave(ctx, 23, 122, 98, 2, [18, 18, 32]);
    disque(ctx, 98, 92, 9, [226, 230, 244]);
    disque(ctx, 94, 89, 8, [50, 60, 98]);
    [[40, 78], [55, 100], [36, 150], [100, 140], [60, 170], [110, 170]].forEach(function (e) { pixel(ctx, e[0], e[1], [200, 206, 236]); });
    pave(ctx, 22, 188, 100, 3, [70, 66, 90]);

    // le robinet
    boite(ctx, 236, 140, 16, Y0 - 140, [168, 176, 188], [66, 72, 84]);
    pave(ctx, 239, 142, 2, Y0 - 146, [226, 232, 240]);
    boite(ctx, 192, 140, 60, 13, [168, 176, 188], [66, 72, 84]);
    pave(ctx, 194, 142, 44, 2, [226, 232, 240]);
    boite(ctx, 192, 151, 11, 10, [138, 146, 158], [66, 72, 84]);

    // le rebord de l'évier (y = 0)
    pave(ctx, 0, Y0 - 9, V.L, 10, [176, 184, 196]);
    pave(ctx, 0, Y0 - 9, V.L, 1, [238, 242, 248]);
    pave(ctx, 0, Y0 - 1, V.L, 1, [96, 102, 114]);

    // l'intérieur : de l'acier brossé
    const h = V.H + 60;
    pave(ctx, 0, Y0, V.L, h, [92, 100, 112]);
    for (let x = 2; x < V.L; x += 5) {
        pave(ctx, x, Y0, 1, h, (x * 7) % 3 === 0 ? [100, 108, 120] : [86, 94, 106]);
    }
    pave(ctx, 0, Y0, 7, h, [64, 70, 82]);
    pave(ctx, V.L - 7, Y0, 7, h, [64, 70, 82]);
    pave(ctx, 7, Y0, 1, h, [124, 132, 144]);
    pave(ctx, V.L - 8, Y0, 1, h, [52, 58, 70]);

    // la flaque, et la bonde
    const yb = Y0 + V.H;
    for (let r = -8; r <= 8; r++) {
        const w = Math.round(128 * Math.sqrt(1 - (r / 9) * (r / 9)));
        pave(ctx, 150 - w, yb - 8 + r, 2 * w, 1, [130, 168, 206, 0.35]);
    }
    rond(ctx, 150, yb + 14, 17, [34, 38, 46], [132, 140, 152]);
    pave(ctx, 138, yb + 13, 25, 2, [132, 140, 152]);
    pave(ctx, 149, yb + 2, 2, 25, [132, 140, 152]);

    return t.toile;
}


// La baguette : du bois clair, plus fine au bout, deux traits gravés.
function peindreLaBaguette() {
    const L = VAISSELLE.longueurBaguette;
    const t = nouvelleToile(8, L);
    const ctx = t.ctx;
    for (let y = 0; y < L; y++) {
        const w = y < 24 ? 4 : (y < 70 ? 5 : 6);
        const x = Math.floor((8 - w) / 2);
        pave(ctx, x, y, w, 1, [120, 84, 50]);
        pave(ctx, x + 1, y, w - 2, 1, [226, 192, 140]);
        if (w > 4) pixel(ctx, x + 1, y, [246, 224, 182]);
    }
    pave(ctx, 2, 0, 4, 1, [120, 84, 50]);
    for (let y = 80; y < L - 20; y += 23) pave(ctx, 4, y, 1, 7, [198, 160, 110]);
    pave(ctx, 1, L - 50, 6, 1, [150, 110, 70]);
    pave(ctx, 1, L - 45, 6, 1, [150, 110, 70]);
    return t.toile;
}

loadSprite("pile_vaisselle", peindreLaPile(PILE_VAISSELLE));
loadSprite("fond_evier", peindreLEvier());
loadSprite("baguette_sushi", peindreLaBaguette());


/* ============================================================
   jeuDeLaVaisselle({ puis })
   ============================================================ */
function jeuDeLaVaisselle(o) {

    const V = VAISSELLE;
    const pile = PILE_VAISSELLE;
    pile.forEach(function (tr) { tr.morceaux.forEach(function (m) { m.chute = null; }); });
    const yDepart = V.H - 30;

    const etat = {
        phase: "jeu",          // jeu | effondrement | gagne
        depuis: 0,
        bout: vec2(passageDeLaVaisselle(yDepart).x, yDepart),
        trace: [],
        vitesse: 0,
        vClavier: 0,
        tangue: 0,             // 0 = stable, 1 = tout s'effondre
        contact: false,
        camY: V.H - 260,
        rates: 0,
        prochainTinte: 0,
        prochainAvertissement: 0,
        reapparition: 1,
    };

    commencerJeu(null);

    const page = ouvrirPage({
        titre: "La pile de vaisselle",
        consigne: "Remonte la baguette jusqu'en haut. Tout doucement. Et ne touche surtout pas les verres.",
        aide: "Tiens la souris (ou le doigt) un peu au-dessus de la baguette : plus tu es loin, plus elle va vite. Aux flèches : tapote.",
        couleurVue: [36, 40, 50],
        dessiner: function (g) { dessinerLaVaisselle(g, pile, etat); },
    });

    direDansLaPage(page, "La baguette est tout au fond. Klara dort à côté.", 2.4);

    const boucle = boucleDeJeu(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();
        const g = placerPage(page);
        if (surveillerLeSommeil(page)) return;

        if (etat.phase === "jeu") {
            avancerLaBaguette(etat, pile, g, page);
        } else if (etat.phase === "effondrement") {
            if (time() - etat.depuis > 1.9) {
                // On remet tout en place, et la baguette au fond.
                pile.forEach(function (tr) { tr.morceaux.forEach(function (m) { m.chute = null; }); });
                etat.bout = vec2(passageDeLaVaisselle(yDepart).x, yDepart);
                etat.trace = [];
                etat.tangue = 0;
                etat.vitesse = 0;
                etat.vClavier = 0;
                etat.reapparition = 0;
                etat.phase = "jeu";
                jeu.pointeur.enfonce = false;
                direDansLaPage(page, "Bob remet tout en place, assiette par assiette. On recommence.", 2.4);
            }
        } else if (etat.phase === "gagne") {
            if (time() - etat.depuis > 1.4) {
                boucle.cancel();
                finirJeu();
                if (o.puis) o.puis(etat.rates);
                return;
            }
        }

        etat.reapparition = Math.min(1, etat.reapparition + dt() * 1.6);

        // La caméra suit le bout de la baguette, un peu au-dessus du
        // milieu : on voit surtout ce qui reste à monter.
        const hu = g.vue.h / echelleDeLaVaisselle(g);
        const cible = Math.max(-80, Math.min(V.H + 60 - hu, etat.bout.y - hu * 0.6));
        etat.camY += (cible - etat.camY) * Math.min(1, dt() * 4);
    });
}


function echelleDeLaVaisselle(g) {
    return Math.min(g.vue.l / VAISSELLE.L, g.vue.h / 320);
}

// Où commence la pile, à l'écran (elle est centrée dans la vue).
function origineDeLaVaisselle(g) {
    const s = echelleDeLaVaisselle(g);
    return vec2(g.vue.x + (g.vue.l - VAISSELLE.L * s) / 2, g.vue.y);
}


// Le balancement de la pile à la hauteur y (en unités).
function balancement(etat, y) {
    return Math.sin(time() * 7 + y * 0.045) * etat.tangue * 5;
}


function avancerLaBaguette(etat, pile, g, page) {

    const V = VAISSELLE;
    const s = echelleDeLaVaisselle(g);
    const o = origineDeLaVaisselle(g);

    // Ce que le joueur demande.
    let voulue = vec2(0, 0);
    const tenu = pointeurTenu();
    if (tenu) {
        // La baguette file vers le pointeur, d'autant plus vite qu'il
        // est loin.
        const cible = vec2((tenu.x - o.x) / s, etat.camY + (tenu.y - o.y) / s);
        voulue = cible.sub(etat.bout).scale(V.raideur);
        if (voulue.len() > V.vitesseSuivi) voulue = voulue.unit().scale(V.vitesseSuivi);
        etat.vClavier = 0;
    } else {
        // Aux flèches, elle accélère tant qu'on tient la touche.
        const f = lireFleches();
        if (f.len() > 0) {
            etat.vClavier = Math.min(V.clavierMax, etat.vClavier + V.clavierAccel * dt());
            voulue = f.unit().scale(etat.vClavier);
        } else {
            etat.vClavier = 0;
        }
    }

    let d = voulue.scale(dt());
    if (d.len() > 30) d = d.unit().scale(30);

    // On avance par petits pas, pour ne jamais traverser une assiette.
    const avant = etat.bout.clone();
    const pas = Math.max(1, Math.ceil(d.len() / 2));
    let touche = false;
    for (let i = 0; i < pas; i++) {
        etat.bout = etat.bout.add(d.scale(1 / pas));
        etat.bout.x = Math.max(8 + V.rayon, Math.min(V.L - 8 - V.rayon, etat.bout.x));
        etat.bout.y = Math.min(V.H - 20, etat.bout.y);

        const choc = heurterLaPile(etat, pile);
        if (choc === "verre") {
            effondrer(etat, pile, page, "Le verre ! Tout s'écroule !");
            return;
        }
        if (choc) touche = true;
    }

    // La vitesse réelle, lissée : c'est elle que la pile ressent.
    const v = dt() > 0 ? etat.bout.dist(avant) / dt() : 0;
    etat.vitesse += (v - etat.vitesse) * Math.min(1, dt() * 10);

    // La trace : la baguette suit le chemin parcouru.
    const dernier = etat.trace[etat.trace.length - 1];
    if (!dernier || dernier.dist(etat.bout) > 4) {
        etat.trace.push(etat.bout.clone());
        if (etat.trace.length > 60) etat.trace.shift();
    }

    // Trop vite : la pile tangue.
    if (etat.vitesse > V.vitesseMax) {
        etat.tangue += (etat.vitesse / V.vitesseMax - 1) * dt() * 2.2;
        if (time() > etat.prochainAvertissement) {
            etat.prochainAvertissement = time() + 1.2;
            direDansLaPage(page, "Trop vite ! La pile tangue...", 1.1, [255, 196, 150]);
        }
    } else {
        etat.tangue = Math.max(0, etat.tangue - 0.35 * dt());
    }

    // Une assiette effleurée : ça tinte, et la pile tangue un peu.
    if (touche) {
        etat.tangue += 0.9 * dt();
        if (!etat.contact || time() > etat.prochainTinte) {
            etat.prochainTinte = time() + 0.35;
            etat.tangue += 0.12;
            faireDuBruit(0.04);
            if (typeof sonSynthe === "function") sonSynthe("tinte", 0.8);
        }
    }
    etat.contact = touche;

    // Une pile qui tangue tinte toute seule.
    if (etat.tangue > 0.4 && Math.random() < dt() * 4 * etat.tangue) {
        if (typeof sonSynthe === "function") sonSynthe("tinte", 0.4 * etat.tangue);
        faireDuBruit(0.01);
    }

    if (etat.tangue >= 1) {
        effondrer(etat, pile, page, "Trop vite ! Tout s'écroule !");
        return;
    }

    // Arrivé à la surface !
    if (etat.bout.y <= 6) {
        etat.phase = "gagne";
        etat.depuis = time();
        if (typeof jouerSon === "function") jouerSon("pop", { vitesse: 1.1 });
        direDansLaPage(page, "Elle sort ! Rien n'est tombé.", 2, COULEUR_OR);
    }
}


// Le bout de la baguette contre la pile. Renvoie "verre" si un verre
// est touché, true pour un simple frôlement, false sinon. Repousse
// le bout hors de ce qu'il touche.
function heurterLaPile(etat, pile) {

    const r = VAISSELLE.rayon;
    const p = etat.bout;
    let frole = false;

    for (let i = 0; i < pile.length; i++) {
        const tr = pile[i];
        if (p.y + r < tr.haut || p.y - r > tr.haut + tr.h) continue;
        const b = balancement(etat, tr.haut);

        for (let j = 0; j < tr.morceaux.length; j++) {
            const m = tr.morceaux[j];
            const x0 = m.x0 + b;
            const x1 = m.x1 + b;
            const cx = Math.max(x0, Math.min(x1, p.x));
            const cy = Math.max(tr.haut, Math.min(tr.haut + tr.h, p.y));
            const dx = p.x - cx;
            const dy = p.y - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 >= r * r) continue;

            if (m.type === "verre") return "verre";

            const d = Math.sqrt(d2);
            if (d < 0.001) {
                p.x = m.cote === "gauche" ? x1 + r : x0 - r;
            } else {
                p.x += dx / d * (r - d);
                p.y += dy / d * (r - d);
            }
            frole = true;
        }
    }
    return frole;
}


function effondrer(etat, pile, page, texte) {

    etat.phase = "effondrement";
    etat.depuis = time();
    etat.rates++;

    pile.forEach(function (tr) {
        tr.morceaux.forEach(function (m) {
            m.chute = {
                vx: (Math.random() - 0.5) * 160,
                vy: -80 - Math.random() * 160,
            };
        });
    });

    if (typeof sonSynthe === "function") sonSynthe("fracas");
    shake(14);
    faireDuBruit(0.5);
    direDansLaPage(page, "CRAAAAC !  " + texte, 1.9, [255, 150, 130]);
}


/* ============================================================
   L'AFFICHAGE, à chaque image
   ============================================================ */
function dessinerLaVaisselle(g, pile, etat) {

    const V = VAISSELLE;
    const vue = g.vue;
    const s = echelleDeLaVaisselle(g);
    const o = origineDeLaVaisselle(g);
    const X = function (u) { return o.x + u * s; };
    const Y = function (u) { return o.y + (u - etat.camY) * s; };
    const tChute = etat.phase === "effondrement" ? time() - etat.depuis : 0;

    // ---- l'évier, la partie visible de la grande image ----
    const HF = V.H + V.margeHaut + 60;
    const q0 = Math.max(0, (etat.camY + V.margeHaut) / HF);
    const qh = Math.min(1 - q0, vue.h / s / HF);
    drawSprite({ sprite: "fond_evier", pos: vec2(X(0), vue.y), width: V.L * s, height: qh * HF * s, quad: quad(0, q0, 1, qh) });

    // une goutte qui tombe du robinet, de temps en temps
    const tg = (time() % 3.2) / 3.2;
    if (tg < 0.3) {
        const yg = -150 + 10 + tg * 480;
        if (Y(yg) > vue.y) drawRect({ pos: vec2(X(196), Y(yg)), width: 3 * s, height: 4 * s, color: rgb(170, 210, 250) });
    }

    // la sortie
    const ySortie = Y(-34);
    if (ySortie > vue.y + 8) {
        const cx = passageDeLaVaisselle(0).x;
        drawText({ text: "SORTIE", size: Math.max(10, g.t - 4), pos: vec2(X(cx), ySortie), anchor: "center", color: rgb(...COULEUR_OR) });
        drawTriangle({ p1: vec2(X(cx), Y(-22)), p2: vec2(X(cx - 7), Y(-13)), p3: vec2(X(cx + 7), Y(-13)), color: rgb(...COULEUR_OR) });
    }

    // ---- la baguette, DERRIÈRE la vaisselle ----
    if (etat.phase !== "effondrement" || tChute < 0.05) {
        const bout = etat.bout;
        let direction = vec2(0, 1);
        for (let i = etat.trace.length - 1; i >= 0; i--) {
            if (etat.trace[i].dist(bout) > 50) {
                direction = etat.trace[i].sub(bout).unit();
                break;
            }
        }
        // Elle reste plutôt verticale : c'est une baguette, pas une corde.
        direction = direction.add(vec2(0, 1.5)).unit();
        const angle = Math.atan2(-direction.x, direction.y) * 180 / Math.PI;
        // On la coupe au bas de la vue (au-delà, c'est le pied de page).
        const reste = (vue.y + vue.h - Y(bout.y)) / (s * Math.max(0.2, direction.y));
        const longueur = Math.max(0, Math.min(V.longueurBaguette, reste));
        if (longueur > 1) {
            drawSprite({
                sprite: "baguette_sushi",
                pos: vec2(X(bout.x), Y(bout.y)),
                anchor: "top",
                angle: angle,
                width: 8 * s,
                height: longueur * s,
                quad: quad(0, 0, 1, longueur / V.longueurBaguette),
            });
        }
    }

    // ---- la vaisselle, morceau par morceau ----
    pile.forEach(function (tr) {
        const b = balancement(etat, tr.haut);
        tr.morceaux.forEach(function (m) {
            let dx = 0;
            let dy = 0;
            let alpha = etat.reapparition;
            if (m.chute) {
                dx = m.chute.vx * tChute;
                dy = m.chute.vy * tChute + 700 * tChute * tChute;
                alpha = Math.max(0, 1 - Math.max(0, tChute - 0.9) / 0.8);
            }
            const y = Y(tr.haut + dy);
            if (y > vue.y + vue.h + 10 || y + tr.h * s < vue.y - 10 || alpha <= 0.01) return;
            const l = m.x1 - m.x0;
            const x = X(m.x0 + b + dx);
            drawSprite({
                sprite: "pile_vaisselle",
                pos: vec2(x, y),
                width: l * s,
                height: tr.h * s,
                quad: quad(m.x0 / V.L, tr.haut / V.H, l / V.L, tr.h / V.H),
                opacity: alpha,
            });

            // Un verre tout proche tremble et s'entoure de rouge.
            if (m.type === "verre" && etat.phase === "jeu"
                && Math.abs(etat.bout.y - (tr.haut + tr.h / 2)) < 26
                && Math.abs(etat.bout.x - (m.x0 + m.x1) / 2) < 40) {
                drawRect({
                    pos: vec2(x + Math.sin(time() * 40) * s, y), width: l * s, height: tr.h * s,
                    fill: false, outline: { width: 2, color: rgb(255, 120, 100) },
                    opacity: 0.6 + 0.4 * Math.sin(time() * 12),
                });
            }
        });
    });

    if (etat.phase === "effondrement") return;

    // ---- le fil entre le pointeur et la baguette ----
    const tenu = pointeurTenu();
    const bout = vec2(X(etat.bout.x), Y(etat.bout.y));
    if (tenu) {
        const ecart = tenu.sub(bout);
        const n = Math.floor(ecart.len() / 8);
        const trop = etat.vitesse > V.vitesseMax;
        for (let i = 1; i < n; i++) {
            const p = bout.add(ecart.scale(i / n));
            drawRect({ pos: p.sub(vec2(1, 1)), width: 2, height: 2, color: trop ? rgb(255, 150, 120) : rgb(...COULEUR_CREME), opacity: 0.7 });
        }
        drawCircle({ pos: tenu, radius: 9, fill: false, outline: { width: 2, color: trop ? rgb(255, 150, 120) : rgb(...COULEUR_CREME) }, opacity: 0.8 });
    }

    // ---- la patte de Bob, au bout ----
    drawSprite({ sprite: "patte_de_bob", pos: bout, anchor: "center", width: 15 * s, height: 15 * s });

    // ---- à droite : la hauteur parcourue ----
    const hg = vue.h - 40;
    const xg = vue.x + vue.l - 14;
    const avance = Math.max(0, Math.min(1, 1 - etat.bout.y / V.H));
    drawRect({ pos: vec2(xg, vue.y + 20), width: 6, height: hg, radius: 3, color: rgb(255, 255, 255), opacity: 0.15 });
    drawRect({ pos: vec2(xg, vue.y + 20 + hg * (1 - avance)), width: 6, height: hg * avance, radius: 3, color: rgb(...COULEUR_OR) });

    // ---- à gauche : la vitesse, et la limite ----
    const xv = vue.x + 8;
    const hv = Math.min(160, hg * 0.5);
    const yv = vue.y + 20;
    const k = Math.min(1, etat.vitesse / (V.vitesseMax * 2));
    drawRect({ pos: vec2(xv, yv), width: 8, height: hv, radius: 4, color: rgb(255, 255, 255), opacity: 0.15 });
    drawRect({ pos: vec2(xv, yv), width: 8, height: hv / 2, radius: 4, color: rgb(214, 84, 72), opacity: 0.25 });
    drawRect({ pos: vec2(xv, yv + hv * (1 - k)), width: 8, height: hv * k, radius: 4, color: k > 0.5 ? rgb(236, 110, 90) : rgb(140, 196, 140) });
    drawText({ text: "vitesse", size: Math.max(9, g.t - 6), pos: vec2(xv, yv + hv + 6), color: rgb(...COULEUR_CREME), opacity: 0.7 });

    // ---- la pile qui tangue : un voile rouge qui monte ----
    if (etat.tangue > 0.25) {
        drawRect({ pos: vec2(vue.x, vue.y), width: vue.l, height: vue.h, color: rgb(214, 84, 72), opacity: (etat.tangue - 0.25) * 0.25 });
    }
}
