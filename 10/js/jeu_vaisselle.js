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

   On joue en faisant glisser un doigt n'importe où sur l'écran
   (ou avec les flèches). Le doigt ne cache jamais la baguette.

   ------------------------------------------------------------
   RÉGLER
     VAISSELLE.chemin       le passage, du fond vers la surface
     VAISSELLE.vitesseMax   au-delà, la pile tangue
   Tout est en « unités de pile » : la pile fait 300 de large, et
   l'écran l'agrandit ou la réduit pour qu'elle tienne.
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

    vitesseMax: 65,          // unités par seconde
    vitesseClavier: 48,
    rayon: 5,                // le bout de la baguette
    longueurBaguette: 200,
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
   le passage. À gauche et à droite, un morceau de vaisselle. Dans
   les passages étroits, un verre borde le chemin.
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
        const bordG = Math.min(c1.x - c1.w / 2, c2.x - c2.w / 2);
        const bordD = Math.max(c1.x + c1.w / 2, c2.x + c2.w / 2);
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
        return {
            x0: a, x1: b, type: type, cote: cote,
            teinte: hasard(),
            chute: null,
        };
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
        let l = large ? 70 + hasard() * 70 : 26 + hasard() * 22;
        if (x1 - x - l < 18) l = x1 - x;
        tranche.morceaux.push(morceau(x, x + l, type));
        x += l + 1;
    }
}


/* ============================================================
   jeuDeLaVaisselle({ puis })
   ============================================================ */
function jeuDeLaVaisselle(o) {

    const V = VAISSELLE;
    const pile = empilerLaVaisselle();
    const yDepart = V.H - 30;

    const etat = {
        phase: "jeu",          // jeu | effondrement | gagne
        depuis: 0,
        bout: vec2(passageDeLaVaisselle(yDepart).x, yDepart),
        trace: [],
        vitesse: 0,
        tangue: 0,             // 0 = stable, 1 = tout s'effondre
        contact: false,
        camY: V.H - 260,
        hauteurVue: 320,
        rates: 0,
        prochainTinte: 0,
        prochainAvertissement: 0,
        reapparition: 1,       // l'opacité de la pile qui se reforme
        goutte: 0,
    };

    commencerJeu(null);

    const page = ouvrirPage({
        titre: "La pile de vaisselle",
        consigne: "Remonte la baguette jusqu'en haut. Tout doucement. Et ne touche surtout pas les verres.",
        aide: "Fais glisser ton doigt n'importe où (ou les flèches). Lentement.",
        couleurVue: [44, 50, 60],
        dessiner: function (g) { dessinerLaVaisselle(g, pile, etat); },
    });

    direDansLaPage(page, "La baguette est tout au fond.", 2.2);

    const boucle = onUpdate(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();
        const g = placerPage(page);
        if (surveillerLeSommeil(page)) return;

        const s = echelleDeLaVaisselle(g);
        etat.hauteurVue = g.vue.h / s;

        if (etat.phase === "jeu") {
            avancerLaBaguette(etat, pile, s, page);
        } else if (etat.phase === "effondrement") {
            const t = time() - etat.depuis;
            if (t > 1.9) {
                // On remet tout en place, et la baguette au fond.
                pile.forEach(function (tr) { tr.morceaux.forEach(function (m) { m.chute = null; }); });
                etat.bout = vec2(passageDeLaVaisselle(yDepart).x, yDepart);
                etat.trace = [];
                etat.tangue = 0;
                etat.vitesse = 0;
                etat.reapparition = 0;
                etat.phase = "jeu";
                lireGlisse();
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
        const cible = Math.max(-80, Math.min(V.H + 60 - etat.hauteurVue, etat.bout.y - etat.hauteurVue * 0.6));
        etat.camY += (cible - etat.camY) * Math.min(1, dt() * 4);
    });
}


function echelleDeLaVaisselle(g) {
    return Math.min(g.vue.l / VAISSELLE.L, g.vue.h / 320);
}


// Le balancement de la pile à la hauteur y (en unités).
function balancement(etat, y) {
    return Math.sin(time() * 7 + y * 0.045) * etat.tangue * 5;
}


function avancerLaBaguette(etat, pile, s, page) {

    const V = VAISSELLE;

    // Ce que le joueur demande : le doigt, et les flèches.
    // Sur un petit écran, le doigt va un peu plus vite que la pièce :
    // on garde de la précision même quand tout est dessiné petit.
    let d = lireGlisse().scale(1 / Math.max(s, 1.3));
    const fleches = lireFleches();
    if (fleches.len() > 0) d = d.add(fleches.unit().scale(V.vitesseClavier * dt()));
    if (d.len() > 40) d = d.unit().scale(40);

    // La vitesse, lissée : c'est elle que la pile ressent.
    const v = dt() > 0 ? d.len() / dt() : 0;
    etat.vitesse += (v - etat.vitesse) * Math.min(1, dt() * 10);

    // On avance par petits pas, pour ne jamais traverser une assiette.
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
   LE DESSIN
   ============================================================ */
function dessinerLaVaisselle(g, pile, etat) {

    const V = VAISSELLE;
    const vue = g.vue;
    const s = echelleDeLaVaisselle(g);
    const ox = vue.x + (vue.l - V.L * s) / 2;
    const X = function (u) { return ox + u * s; };
    const Y = function (u) { return vue.y + (u - etat.camY) * s; };
    const tChute = etat.phase === "effondrement" ? time() - etat.depuis : 0;

    // ---- l'évier : de l'acier brossé ----
    drawRect({ pos: vec2(X(0), vue.y), width: V.L * s, height: vue.h, color: rgb(92, 100, 112) });
    for (let u = 6; u < V.L; u += 11) {
        drawLine({ p1: vec2(X(u), vue.y), p2: vec2(X(u), vue.y + vue.h), width: 1, color: rgb(255, 255, 255), opacity: 0.05 });
    }
    drawRect({ pos: vec2(X(0), vue.y), width: 6 * s, height: vue.h, color: rgb(66, 72, 84) });
    drawRect({ pos: vec2(X(V.L - 6), vue.y), width: 6 * s, height: vue.h, color: rgb(66, 72, 84) });

    // ---- au-dessus de la pile : la cuisine, la nuit ----
    const ySurface = Y(0);
    if (ySurface > vue.y) {
        const h = Math.min(vue.h, ySurface - vue.y);
        drawRect({ pos: vec2(vue.x, vue.y), width: vue.l, height: h, color: rgb(28, 26, 44) });
        // la lune qui entre par la fenêtre de la cuisine
        drawCircle({ pos: vec2(X(60), Y(-150)), radius: 70 * s, color: rgb(150, 170, 230), opacity: 0.08 });
        // le robinet, et une goutte qui tombe de temps en temps
        drawRect({ pos: vec2(X(244), Y(-150)), width: 12 * s, height: 90 * s, radius: 4 * s, color: rgb(170, 178, 190) });
        drawRect({ pos: vec2(X(196), Y(-150)), width: 60 * s, height: 11 * s, radius: 5 * s, color: rgb(170, 178, 190) });
        drawRect({ pos: vec2(X(196), Y(-142)), width: 9 * s, height: 10 * s, radius: 3 * s, color: rgb(140, 148, 160) });
        const tg = (time() % 3.2) / 3.2;
        if (tg < 0.35) {
            drawCircle({ pos: vec2(X(200.5), Y(-128 + tg * 300)), radius: 2.2 * s, color: rgb(170, 210, 250), opacity: 0.8 });
        }
        // le rebord de l'évier
        drawRect({ pos: vec2(X(-14), ySurface - 7 * s), width: (V.L + 28) * s, height: 9 * s, radius: 3 * s, color: rgb(176, 184, 196) });
        drawLine({ p1: vec2(X(-10), ySurface - 6 * s), p2: vec2(X(V.L + 10), ySurface - 6 * s), width: 1.5, color: rgb(255, 255, 255), opacity: 0.5 });
        // la sortie
        const c = passageDeLaVaisselle(0);
        drawText({ text: "SORTIE", size: Math.max(10, g.t - 4), pos: vec2(X(c.x), Y(-32)), anchor: "center", color: rgb(...COULEUR_OR) });
        drawTriangle({
            p1: vec2(X(c.x), Y(-22)), p2: vec2(X(c.x - 8), Y(-12)), p3: vec2(X(c.x + 8), Y(-12)),
            color: rgb(...COULEUR_OR),
        });
    }

    // ---- le fond : la flaque et la bonde ----
    const yFond = Y(V.H);
    if (yFond < vue.y + vue.h + 40) {
        drawEllipse({ pos: vec2(X(150), Y(V.H - 8)), radiusX: 132 * s, radiusY: 10 * s, color: rgb(120, 160, 200), opacity: 0.35 });
        drawCircle({ pos: vec2(X(150), Y(V.H + 12)), radius: 17 * s, color: rgb(34, 38, 46), outline: { width: 2, color: rgb(130, 138, 150) } });
        drawLine({ p1: vec2(X(138), Y(V.H + 12)), p2: vec2(X(162), Y(V.H + 12)), width: 2, color: rgb(130, 138, 150) });
        drawLine({ p1: vec2(X(150), Y(V.H)), p2: vec2(X(150), Y(V.H + 24)), width: 2, color: rgb(130, 138, 150) });
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
        const queue = bout.add(direction.scale(V.longueurBaguette));
        const a = vec2(X(bout.x), Y(bout.y));
        const b = vec2(X(queue.x), Math.min(Y(queue.y), vue.y + vue.h + 30));
        drawLine({ p1: a, p2: b, width: 7 * s, color: rgb(140, 100, 60) });
        drawLine({ p1: a, p2: b, width: 5 * s, color: rgb(224, 190, 138) });
        drawLine({ p1: a, p2: b, width: 1.4 * s, color: rgb(250, 228, 186), opacity: 0.7 });
    }

    // ---- la vaisselle ----
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
            if (y > vue.y + vue.h + 10 || y + tr.h * s < vue.y - 10) return;
            const proche = m.type === "verre" && etat.phase === "jeu"
                && Math.abs(etat.bout.y - (tr.haut + tr.h / 2)) < 26
                && Math.abs(etat.bout.x - (m.x0 + m.x1) / 2) < 40;
            dessinerMorceau(m, X(m.x0 + b + dx), y, (m.x1 - m.x0) * s, tr.h * s, alpha, proche, s);
        });
    });

    // ---- la patte de Bob, au bout ----
    if (etat.phase !== "effondrement") {
        const p = vec2(X(etat.bout.x), Y(etat.bout.y));
        drawCircle({ pos: p, radius: 7 * s, color: rgb(62, 49, 40), outline: { width: 1.5, color: rgb(30, 24, 20) } });
        drawCircle({ pos: p.add(vec2(-2 * s, 1.5 * s)), radius: 2.8 * s, color: rgb(233, 212, 186) });
    }

    // ---- la hauteur parcourue, sur le bord droit ----
    const xg = vue.x + vue.l - 14;
    const hg = vue.h - 40;
    const avance = Math.max(0, Math.min(1, 1 - etat.bout.y / V.H));
    drawRect({ pos: vec2(xg, vue.y + 20), width: 6, height: hg, radius: 3, color: rgb(255, 255, 255), opacity: 0.15 });
    drawRect({ pos: vec2(xg, vue.y + 20 + hg * (1 - avance)), width: 6, height: hg * avance, radius: 3, color: rgb(...COULEUR_OR) });

    // ---- la pile qui tangue : un voile rouge qui monte ----
    if (etat.tangue > 0.25 && etat.phase === "jeu") {
        drawRect({ pos: vec2(vue.x, vue.y), width: vue.l, height: vue.h, color: rgb(214, 84, 72), opacity: (etat.tangue - 0.25) * 0.25 });
    }
}


// Un morceau de vaisselle dans son rectangle (x, y, l, h en pixels).
function dessinerMorceau(m, x, y, l, h, alpha, proche, s) {

    if (alpha <= 0.01 || l < 2) return;
    const contour = function (c) { return { width: 1, color: rgb(...c) }; };

    if (m.type === "assiettes") {
        const n = Math.max(1, Math.floor(h / (7 * s)));
        const ph = h / n;
        const blanc = m.teinte < 0.5 ? [246, 243, 236] : [238, 236, 230];
        for (let k = 0; k < n; k++) {
            drawRect({ pos: vec2(x, y + k * ph + 0.5), width: l, height: ph - 1, radius: Math.min(ph / 2, 4 * s), color: rgb(...blanc), opacity: alpha, outline: contour([164, 154, 144]) });
            drawLine({ p1: vec2(x + 3, y + k * ph + 2), p2: vec2(x + l - 3, y + k * ph + 2), width: 1.3, color: rgb(116, 156, 200), opacity: alpha });
        }

    } else if (m.type === "bol") {
        drawRect({ pos: vec2(x, y), width: l, height: h, radius: h / 2, color: rgb(234, 214, 190), opacity: alpha, outline: contour([170, 150, 130]) });
        drawRect({ pos: vec2(x + 3, y + h * 0.38), width: Math.max(0, l - 6), height: h * 0.16, color: rgb(196, 112, 86), opacity: alpha });

    } else if (m.type === "casserole") {
        drawRect({ pos: vec2(x, y), width: l, height: h, radius: 4 * s, color: rgb(66, 70, 80), opacity: alpha, outline: contour([36, 40, 46]) });
        drawLine({ p1: vec2(x + 3, y + 3), p2: vec2(x + l - 3, y + 3), width: 1.5, color: rgb(130, 136, 148), opacity: alpha });
        const xr = m.cote === "gauche" ? x + 5 * s : x + l - 5 * s;
        drawCircle({ pos: vec2(xr, y + h / 2), radius: 1.8 * s, color: rgb(150, 156, 168), opacity: alpha });

    } else if (m.type === "couvercle") {
        drawRect({ pos: vec2(x, y + h * 0.25), width: l, height: h * 0.75, radius: h * 0.37, color: rgb(178, 186, 196), opacity: alpha, outline: contour([118, 126, 138]) });
        drawCircle({ pos: vec2(x + l / 2, y + h * 0.28), radius: h * 0.2, color: rgb(60, 64, 72), opacity: alpha });

    } else if (m.type === "tasse") {
        const c = m.teinte < 0.33 ? [200, 110, 90] : (m.teinte < 0.66 ? [110, 150, 190] : [226, 190, 96]);
        drawRect({ pos: vec2(x, y), width: l, height: h, radius: 5 * s, color: rgb(...c), opacity: alpha, outline: contour(c.map(function (v) { return v * 0.7; })) });
        const xa = m.cote === "gauche" ? x + 4 * s : x + l - 4 * s;
        drawCircle({ pos: vec2(xa, y + h / 2), radius: h * 0.28, fill: false, opacity: alpha, outline: { width: 2 * s, color: rgb(...c) } });

    } else if (m.type === "fourchettes") {
        for (let k = 1; k <= 3; k++) {
            const yf = y + k * h / 4;
            drawLine({ p1: vec2(x + 2, yf), p2: vec2(x + l - 2, yf), width: 2 * s, color: rgb(198, 204, 212), opacity: alpha });
            const xp = m.cote === "gauche" ? x + l - 2 : x + 2;
            const sens = m.cote === "gauche" ? -1 : 1;
            drawLine({ p1: vec2(xp, yf), p2: vec2(xp + sens * 7 * s, yf - 2.5 * s), width: 1, color: rgb(198, 204, 212), opacity: alpha });
            drawLine({ p1: vec2(xp, yf), p2: vec2(xp + sens * 7 * s, yf + 2.5 * s), width: 1, color: rgb(198, 204, 212), opacity: alpha });
        }

    } else if (m.type === "verre") {
        // Un verre dans un autre verre. Il tremble quand on approche.
        const tremble = proche ? Math.sin(time() * 40) * 0.9 : 0;
        const bord = proche ? [255, 150, 130] : [226, 240, 250];
        drawRect({ pos: vec2(x + tremble, y), width: l, height: h, radius: 3 * s, color: rgb(180, 215, 240), opacity: 0.28 * alpha, outline: { width: 1.6, color: rgb(...bord) } });
        drawRect({ pos: vec2(x + 3 * s + tremble, y + 3 * s), width: Math.max(0, l - 6 * s), height: Math.max(0, h - 6 * s), radius: 2 * s, fill: false, opacity: alpha, outline: { width: 1, color: rgb(...bord) } });
        drawLine({ p1: vec2(x + 4 * s + tremble, y + 3 * s), p2: vec2(x + 4 * s + tremble, y + h - 3 * s), width: 1.5, color: rgb(255, 255, 255), opacity: 0.6 * alpha });
    }
}
