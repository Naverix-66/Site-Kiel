/* ============================================================
   LES PETITS JEUX — le socle commun
   ============================================================
   L'acte II n'est pas qu'une suite de conversations : il y a des
   choses à FAIRE avec les pattes, en pleine nuit, à côté de Klara
   qui dort. Trois petits jeux :

     la vaisselle   remonter une baguette du fond d'une pile de
                    vaisselle, tout doucement (jeu_vaisselle.js)
     la couture     un Docteur Maboule dans la boîte à couture de
                    la maman de Klara (jeu_couture.js)
     la rallonge    tirer tous ensemble, et s'arrêter net quand ça
                    coince (jeuDeForce, plus bas)

   Ce fichier contient ce qu'ils partagent :
     - les entrées (appuyer, faire glisser un doigt, les flèches) ;
     - LE SOMMEIL DE KLARA : chaque maladresse fait du bruit, une
       jauge monte, et si elle déborde, Klara se réveille
       (reveil.js) ;
     - la PAGE : un grand cadre presque plein écran, où chaque jeu
       dessine sa scène ;
     - le carton de titre (« Acte II »).

   ------------------------------------------------------------
   LA RÈGLE QUI NE CHANGE PAS : ON NE PERD JAMAIS

   Le bruit est la seule pénalité, et le réveil de Klara n'en est
   pas vraiment une : tout le monde court se ranger, fait le mort,
   elle se rendort, et on reprend exactement où on en était.
   ============================================================ */


const jeu = {
    actif: false,
    enPause: false,       // pendant que Klara se réveille
    objets: [],
    ecouteurs: [],
    verrou: 0,
    appuyer: null,        // pour appuyer depuis la console : jeu.appuyer()
    regard: null,         // ce que la caméra doit regarder, ou null
    pointeur: { enfonce: false, dernier: null, glisse: vec2(0, 0), doigt: null },
};


function jeuEnCours() {
    return jeu.actif;
}


// La caméra (scene_appartement.js) regarde ce point s'il existe.
function regardImpose() {
    return jeu.regard;
}


/* ============================================================
   LES ENTRÉES
   ============================================================
   - un APPUI : espace, Entrée, E, un clic ou un doigt posé ;
   - un GLISSER : le doigt (ou la souris, bouton enfoncé) qui se
     déplace. On lit le déplacement, pas la position : le doigt
     peut être n'importe où sur l'écran, il ne cache jamais ce
     qu'il déplace ;
   - les FLÈCHES (et ZQSD, WASD), pour jouer au clavier.
   ============================================================ */
function commencerJeu(appui) {

    jeu.actif = true;
    jeu.enPause = false;
    jeu.objets = [];
    jeu.ecouteurs = [];
    jeu.pointeur = { enfonce: false, dernier: null, glisse: vec2(0, 0), doigt: null };

    // Le doigt qui vient de fermer le dialogue ne doit pas compter
    // comme un premier appui.
    jeu.verrou = 0.35;

    if (typeof interactions !== "undefined" && interactions.ui) {
        interactions.cible = null;
        cacherInterfaceAction();
    }

    const appuyer = function () {
        if (!jeu.actif || jeu.enPause || jeu.verrou > 0) return;
        if (appui) appui();
    };
    jeu.appuyer = appuyer;

    const p = jeu.pointeur;
    const poser = function (position, doigt) {
        p.enfonce = true;
        p.dernier = position;
        p.doigt = doigt;
        appuyer();
    };
    const bouger = function (position, doigt) {
        if (!p.enfonce || doigt !== p.doigt || !p.dernier) return;
        if (!jeu.enPause && jeu.verrou <= 0) p.glisse = p.glisse.add(position.sub(p.dernier));
        p.dernier = position;
    };
    const lever = function () {
        p.enfonce = false;
        p.dernier = null;
    };

    const e = jeu.ecouteurs;
    e.push(onKeyPress("space", appuyer));
    e.push(onKeyPress("enter", appuyer));
    e.push(onKeyPress("e", appuyer));
    e.push(onMousePress(function () { poser(mousePos(), "souris"); }));
    e.push(onMouseMove(function () { bouger(mousePos(), "souris"); }));
    e.push(onMouseRelease(lever));
    e.push(onTouchStart(function (position, touche) { poser(position, touche ? touche.identifier : 0); }));
    e.push(onTouchMove(function (position, touche) { bouger(position, touche ? touche.identifier : 0); }));
    e.push(onTouchEnd(lever));
}


function finirJeu() {
    jeu.ecouteurs.forEach(function (e) { e.cancel(); });
    jeu.objets.forEach(function (o) { destroy(o); });
    jeu.ecouteurs = [];
    jeu.objets = [];
    jeu.actif = false;
    jeu.enPause = false;
    jeu.regard = null;
}


// Le déplacement du doigt depuis la dernière lecture, en pixels
// d'écran. Remis à zéro à chaque lecture.
function lireGlisse() {
    const g = jeu.pointeur.glisse;
    jeu.pointeur.glisse = vec2(0, 0);
    return g;
}


// Les flèches, en vecteur (non normalisé : la diagonale va un peu
// plus vite, ce qui n'a aucune importance ici).
function lireFleches() {
    let x = 0;
    let y = 0;
    if (isKeyDown("left") || isKeyDown("q") || isKeyDown("a")) x -= 1;
    if (isKeyDown("right") || isKeyDown("d")) x += 1;
    if (isKeyDown("up") || isKeyDown("z") || isKeyDown("w")) y -= 1;
    if (isKeyDown("down") || isKeyDown("s")) y += 1;
    return vec2(x, y);
}


// Ajoute un objet d'interface qui disparaîtra avec le jeu.
function objetDeJeu(composants) {
    const o = add(composants.concat([fixed()]));
    jeu.objets.push(o);
    return o;
}


/* ============================================================
   LE SOMMEIL DE KLARA
   ============================================================
   bruit va de 0 (elle dort profondément) à 1 (elle se réveille).
   Il redescend tout seul, lentement : un joueur prudent a toujours
   le droit à l'erreur, un joueur brutal la réveille.
   ============================================================ */
const sommeil = {
    bruit: 0,
    reveils: 0,
    derniereSecousse: 0,
};

const SOMMEIL_RETOMBE = 0.03;      // par seconde


function faireDuBruit(quantite) {
    sommeil.bruit = Math.min(1, sommeil.bruit + quantite);
    sommeil.derniereSecousse = time();
}


// À appeler à chaque image par le jeu en cours. Si Klara se
// réveille, le jeu est mis en pause le temps de la scène
// (reveil.js), puis reprend tout seul. Renvoie true tant que le
// jeu doit attendre.
function surveillerLeSommeil(page) {

    if (jeu.enPause) return true;

    // On regarde AVANT de laisser retomber : la jauge est plafonnée
    // à 1, elle n'y resterait pas une seule image sinon.
    if (sommeil.bruit < 1) {
        sommeil.bruit = Math.max(0, sommeil.bruit - SOMMEIL_RETOMBE * dt());
    } else {
        jeu.enPause = true;
        jeu.pointeur.enfonce = false;
        if (page) montrerLaPage(page, false);
        reveillerKlara(function () {
            sommeil.bruit = 0;
            if (page) montrerLaPage(page, true);
            jeu.pointeur.glisse = vec2(0, 0);
            jeu.verrou = 0.4;
            jeu.enPause = false;
        });
        return true;
    }
    return false;
}


// La jauge, dessinée dans la page (et dans le panneau de la
// rallonge). Bleu nuit quand elle dort, orange quand elle bouge,
// rouge juste avant le réveil.
function dessinerJaugeDeSommeil(x, y, largeur, taille) {

    const b = sommeil.bruit;
    const inquiete = b > 0.66;
    const texte = b < 0.33 ? "Klara dort" : (inquiete ? "Klara bouge..." : "Klara remue");
    const couleurTexte = inquiete ? [200, 80, 70] : COULEUR_ENCRE;

    drawText({ text: texte, size: taille, pos: vec2(x, y), color: rgb(...couleurTexte) });

    const hauteur = Math.max(8, Math.round(taille * 0.6));
    const yb = y + taille + 5;
    drawRect({ pos: vec2(x, yb), width: largeur, height: hauteur, radius: hauteur / 2, color: rgb(...COULEUR_ENCRE), opacity: 0.14 });

    if (b > 0.005) {
        const c = b < 0.5
            ? melanger([110, 150, 210], [236, 168, 84], b / 0.5)
            : melanger([236, 168, 84], [214, 84, 72], (b - 0.5) / 0.5);
        const pulse = inquiete ? 0.75 + 0.25 * Math.sin(time() * 10) : 1;
        drawRect({ pos: vec2(x, yb), width: Math.max(hauteur, largeur * b), height: hauteur, radius: hauteur / 2, color: rgb(...c), opacity: pulse });
    }

    // Le seuil : au bout, un petit réveil.
    drawCircle({ pos: vec2(x + largeur + 9, yb + hauteur / 2), radius: hauteur * 0.7, color: rgb(...(inquiete ? [214, 84, 72] : [180, 170, 160])) });
}


function melanger(a, b, k) {
    k = Math.max(0, Math.min(1, k));
    return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * k); });
}


/* ============================================================
   LA PAGE — un grand cadre presque plein écran
   ============================================================
   En haut : le titre, la consigne, et la jauge du sommeil de Klara.
   Au milieu : la VUE, où le jeu dessine sa scène (dessiner(g),
   appelée à chaque image avec la géométrie en pixels d'écran).
   En bas : une ligne d'aide.

   Le jeu dessine ce qu'il veut dans la vue ; tout ce qui en
   déborde en haut ou en bas est recouvert par l'en-tête et le
   pied de page, dessinés par-dessus.
   ============================================================ */
function ouvrirPage(options) {

    const p = { visible: true, message: "", messageJusqua: 0, couleurMessage: COULEUR_CREME, g: null };

    // Le fond crème, et la vue sombre au milieu.
    p.fond = objetDeJeu([
        pos(0, 0),
        z(Z_INTERFACE + 20),
        {
            draw: function () {
                if (!p.visible || !p.g) return;
                const g = p.g;
                drawRect({ pos: vec2(0, 0), width: width(), height: height(), color: rgb(...COULEUR_NUIT), opacity: 0.55 });
                drawRect({ pos: vec2(g.x, g.y), width: g.l, height: g.h, radius: 14, color: rgb(...COULEUR_CREME), outline: { width: 3, color: rgb(...COULEUR_ACCENT) } });
                drawRect({ pos: vec2(g.vue.x, g.vue.y), width: g.vue.l, height: g.vue.h, radius: 10, color: rgb(...(options.couleurVue || [40, 44, 56])) });
            },
        },
    ]);

    // La scène du jeu.
    p.scene = objetDeJeu([
        pos(0, 0),
        z(Z_INTERFACE + 21),
        {
            draw: function () {
                if (!p.visible || !p.g) return;
                if (options.dessiner) options.dessiner(p.g);
            },
        },
    ]);

    // L'en-tête et le pied de page, par-dessus ce qui déborde.
    p.cadre = objetDeJeu([
        pos(0, 0),
        z(Z_INTERFACE + 22),
        {
            draw: function () {
                if (!p.visible || !p.g) return;
                const g = p.g;
                const creme = rgb(...COULEUR_CREME);
                drawRect({ pos: vec2(g.x + 3, g.y + 3), width: g.l - 6, height: g.vue.y - g.y - 3, color: creme });
                drawRect({ pos: vec2(g.x + 3, g.vue.y + g.vue.h), width: g.l - 6, height: g.y + g.h - (g.vue.y + g.vue.h) - 3, color: creme });
                // la jauge du sommeil (à droite du titre, ou dessous)
                dessinerJaugeDeSommeil(g.jauge.x, g.jauge.y, g.jauge.l, g.jauge.t);
                // le message du moment, en bas de la vue
                if (time() < p.messageJusqua && p.message) {
                    const taille = g.t + 2;
                    drawText({
                        text: p.message, size: taille, width: g.vue.l - 24, align: "center",
                        pos: vec2(g.vue.x + 12, g.vue.y + g.vue.h - taille * 2.4),
                        color: rgb(...p.couleurMessage),
                    });
                }
            },
        },
    ]);

    p.titre = objetDeJeu([
        text(options.titre, { size: 20 }),
        pos(0, 0),
        color(...COULEUR_ENCRE),
        z(Z_INTERFACE + 23),
    ]);

    p.consigne = objetDeJeu([
        text(options.consigne, { size: 14, width: 300 }),
        pos(0, 0),
        color(...COULEUR_ACCENT_FONCE),
        z(Z_INTERFACE + 23),
    ]);

    p.aide = objetDeJeu([
        text(options.aide || "", { size: 12, width: 300, align: "center" }),
        pos(0, 0),
        anchor("top"),
        color(...COULEUR_ENCRE),
        opacity(0.7),
        z(Z_INTERFACE + 23),
    ]);

    p.textes = [p.titre, p.consigne, p.aide];
    placerPage(p);
    return p;
}


// Recalcule la géométrie (téléphone qu'on tourne) et renvoie-la.
function placerPage(p) {

    const t = echelleInterface();
    const marge = Math.min(14, Math.round(Math.min(width(), height()) * 0.025));
    const x = marge;
    const y = marge;
    const l = width() - 2 * marge;
    const h = height() - 2 * marge;

    // Sur un écran étroit (téléphone tenu droit), la jauge passe
    // SOUS la consigne : à côté, elle l'écraserait en cinq lignes.
    const etroit = l < 560;
    const tj = Math.max(11, t - 5);
    const hj = tj + 5 + Math.max(8, Math.round(tj * 0.6));
    const lj = etroit ? Math.min(220, l - 80) : Math.min(200, l * 0.34);

    p.titre.textSize = t + 3;
    p.titre.pos = vec2(x + 16, y + 12);
    p.consigne.textSize = Math.max(12, t - 3);
    p.consigne.width = etroit ? l - 32 : l - 32 - lj - 50;
    p.consigne.pos = vec2(x + 16, y + 12 + t + 9);

    let basEntete = p.consigne.pos.y + p.consigne.height;
    let jauge;
    if (etroit) {
        jauge = { x: x + 16, y: basEntete + 8, l: lj, t: tj };
        basEntete = jauge.y + hj;
    } else {
        jauge = { x: x + l - lj - 34, y: y + 12, l: lj, t: tj };
        basEntete = Math.max(basEntete, jauge.y + hj);
    }
    const hautEntete = basEntete + 12 - y;

    p.aide.textSize = Math.max(11, t - 5);
    p.aide.width = l - 32;
    const hautPied = p.aide.height + 18;
    p.aide.pos = vec2(width() / 2, y + h - hautPied + 9);

    const vue = { x: x + 12, y: y + hautEntete, l: l - 24, h: h - hautEntete - hautPied };
    p.g = { x: x, y: y, l: l, h: h, vue: vue, t: t, jauge: jauge };
    return p.g;
}


function montrerLaPage(p, visible) {
    p.visible = visible;
    p.textes.forEach(function (o) { o.hidden = !visible; });
}


function direDansLaPage(p, texte, duree, couleur) {
    p.message = texte;
    p.messageJusqua = time() + (duree || 1.4);
    p.couleurMessage = couleur || COULEUR_CREME;
}


/* ============================================================
   Le petit panneau (la rallonge garde un cadre plus modeste :
   on doit voir tout le monde tirer derrière).
   ============================================================ */
function creerPanneau(titre, consigne) {

    const p = {};

    p.fond = objetDeJeu([
        rect(10, 10, { radius: 12 }),
        pos(0, 0),
        color(...COULEUR_CREME),
        outline(3, rgb(...COULEUR_ACCENT)),
        opacity(0.97),
        z(Z_INTERFACE + 20),
    ]);

    p.titre = objetDeJeu([
        text(titre, { size: 20 }),
        pos(0, 0),
        anchor("top"),
        color(...COULEUR_ENCRE),
        z(Z_INTERFACE + 21),
    ]);

    p.consigne = objetDeJeu([
        text(consigne, { size: 14, width: 300, align: "center" }),
        pos(0, 0),
        anchor("top"),
        color(...COULEUR_ACCENT_FONCE),
        z(Z_INTERFACE + 21),
    ]);

    p.message = objetDeJeu([
        text("", { size: 15, width: 300, align: "center" }),
        pos(0, 0),
        anchor("top"),
        color(...COULEUR_ENCRE),
        opacity(0),
        z(Z_INTERFACE + 21),
    ]);

    // La jauge du sommeil, sous la barre.
    p.jauge = objetDeJeu([
        pos(0, 0),
        z(Z_INTERFACE + 21),
        {
            draw: function () {
                if (!p.geo || p.cache) return;
                dessinerJaugeDeSommeil(p.geo.x, p.geo.yJauge, Math.min(200, p.geo.largeur - 30), Math.max(11, p.geo.t - 5));
            },
        },
    ]);

    p.messageJusqua = 0;
    p.textes = [p.fond, p.titre, p.consigne, p.message];
    return p;
}


// Replace le panneau ; renvoie la zone libre au milieu, où chaque
// jeu dessine sa barre.
function placerPanneau(p) {

    const t = echelleInterface();
    const largeur = Math.min(width() - 32, 460);
    const marge = 16;

    p.titre.textSize = t + 2;
    p.consigne.textSize = Math.max(12, t - 4);
    p.message.textSize = Math.max(12, t - 3);
    p.consigne.width = largeur - 2 * marge;
    p.message.width = largeur - 2 * marge;

    const hauteurBarre = Math.max(22, t * 1.3);
    const hauteurJauge = t + 18;
    const hauteur = marge + (t + 2) + 8 + p.consigne.height + 16
        + hauteurBarre + 14 + (t + 4) * 2 + hauteurJauge + marge;

    const x = (width() - largeur) / 2;
    // Au-dessus du milieu : le bas de l'écran est celui du joystick
    // et de la boîte de dialogue.
    const y = Math.max(12, height() * 0.42 - hauteur / 2);

    p.fond.pos = vec2(x, y);
    p.fond.width = largeur;
    p.fond.height = hauteur;

    p.titre.pos = vec2(width() / 2, y + marge);
    p.consigne.pos = vec2(width() / 2, y + marge + t + 10);

    const yBarre = p.consigne.pos.y + p.consigne.height + 16;
    p.message.pos = vec2(width() / 2, yBarre + hauteurBarre + 12);
    p.message.opacity = time() < p.messageJusqua ? 1 : 0;

    p.geo = {
        x: x + marge, y: yBarre, largeur: largeur - 2 * marge, hauteur: hauteurBarre, t: t,
        yJauge: y + hauteur - marge - hauteurJauge + 4,
    };
    return p.geo;
}


function montrerLePanneau(p, visible) {
    p.cache = !visible;
    p.textes.forEach(function (o) { o.hidden = !visible; });
}


function direDansLePanneau(p, texte, duree) {
    p.message.text = texte;
    p.messageJusqua = time() + (duree || 1.4);
}


/* ============================================================
   jeuDeForce(options) — la rallonge
   ============================================================
   On appuie vite pour remplir la barre, qui se vide toute seule.
   Mais la rallonge est coincée derrière le pied du bureau : de
   temps en temps, ÇA COINCE (la barre devient rouge). Tirer à ce
   moment-là cogne le bureau — du bruit, et on recule un peu. Il
   faut s'arrêter net, puis repartir.

     titre, consigne   ce qu'on lit
     appuis            combien d'appuis pour remplir la barre (26)
     fuite             ce qui se vide chaque seconde, de 0 à 1 (0.2)
     equipe            les clés des peluches qui tirent avec Bob
     cris              des phrases, une au hasard de temps en temps
     puis()            la suite
   ============================================================ */
function jeuDeForce(o) {

    const etat = {
        plein: 0,
        fini: false,
        pause: 0,
        prochainCri: 0,
        phase: "tire",
        finPhase: time() + 1.6,
        prevenu: false,
    };
    const appuis = o.appuis || 26;
    const fuite = o.fuite === undefined ? 0.2 : o.fuite;

    commencerJeu(function () {
        if (etat.fini) return;

        if (etat.phase === "coince") {
            // On tire alors que ça coince : le bureau cogne.
            etat.plein = Math.max(0, etat.plein - 0.05);
            faireDuBruit(0.09);
            shake(4);
            if (typeof jouerSon === "function") jouerSon("tremble", { vitesse: 0.8 });
            direDansLePanneau(panneau, "BANG ! Ça coince ! On arrête de tirer !", 1);
            return;
        }

        etat.plein = Math.min(1, etat.plein + 1 / appuis);
        if (typeof jouerSon === "function") jouerSon("tire", { vitesse: 0.7 + Math.random() * 0.6 });

        // Tout le monde tire : ils sursautent, un peu au hasard.
        (o.equipe || []).forEach(function (cle) {
            const p = PELUCHES[cle];
            if (p && Math.random() < 0.6) p.bump = 4;
        });
        shake(1);

        if (o.cris && time() > etat.prochainCri) {
            etat.prochainCri = time() + 1.1;
            direDansLePanneau(panneau, o.cris[Math.floor(Math.random() * o.cris.length)], 1);
        }

        if (etat.plein >= 1) {
            etat.fini = true;
            etat.pause = 0.8;
            if (typeof jouerSon === "function") jouerSon("pop", { vitesse: 0.8 });
            shake(5);
        }
    });

    const panneau = creerPanneau(o.titre, o.consigne);

    const barre = objetDeJeu([
        rect(10, 10, { radius: 6 }),
        pos(0, 0),
        color(...COULEUR_ENCRE),
        opacity(0.12),
        z(Z_INTERFACE + 21),
    ]);
    const jauge = objetDeJeu([
        rect(10, 10, { radius: 6 }),
        pos(0, 0),
        color(...COULEUR_OR),
        z(Z_INTERFACE + 22),
    ]);
    const etiquette = objetDeJeu([
        text("", { size: 14 }),
        pos(0, 0),
        anchor("center"),
        color(...COULEUR_CREME),
        z(Z_INTERFACE + 23),
    ]);
    panneau.textes.push(barre, jauge, etiquette);

    const boucle = onUpdate(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();
        if (surveillerLeSommeil(null)) {
            montrerLePanneau(panneau, false);
            return;
        }
        if (panneau.cache) {
            montrerLePanneau(panneau, true);
            etat.finPhase = time() + 1.2;
            etat.phase = "tire";
        }

        if (etat.fini) {
            etat.pause -= dt();
            if (etat.pause <= 0) {
                boucle.cancel();
                finirJeu();
                if (o.puis) o.puis();
                return;
            }
        } else {
            etat.plein = Math.max(0, etat.plein - fuite * dt());

            // Les phases : on tire, puis ça coince, puis on tire...
            // Un quart de seconde avant que ça coince, la barre
            // clignote en orange : on a le temps de lever le doigt.
            if (time() > etat.finPhase) {
                if (etat.phase === "tire") {
                    etat.phase = "coince";
                    etat.finPhase = time() + 0.8 + Math.random() * 0.6;
                    if (typeof jouerSon === "function") jouerSon("tremble", { vitesse: 0.6, volume: 0.6 });
                } else {
                    etat.phase = "tire";
                    etat.finPhase = time() + 1.3 + Math.random() * 1.2;
                }
            }
        }

        const g = placerPanneau(panneau);
        const bientot = etat.phase === "tire" && etat.finPhase - time() < 0.3 && !etat.fini;

        barre.pos = vec2(g.x, g.y);
        barre.width = g.largeur;
        barre.height = g.hauteur;

        jauge.pos = vec2(g.x, g.y);
        jauge.width = Math.max(g.hauteur, etat.plein * g.largeur);
        jauge.height = g.hauteur;
        jauge.opacity = etat.plein > 0.01 ? 1 : 0;

        if (etat.phase === "coince") {
            barre.color = rgb(214, 84, 72);
            barre.opacity = 0.35 + 0.15 * Math.sin(time() * 18);
            jauge.color = rgb(214, 84, 72);
            etiquette.text = "ÇA COINCE !";
        } else {
            barre.color = rgb(...COULEUR_ENCRE);
            barre.opacity = 0.12;
            jauge.color = bientot && Math.sin(time() * 40) > 0 ? rgb(236, 168, 84) : rgb(...COULEUR_OR);
            etiquette.text = etat.fini ? "" : "TIREZ !";
        }
        etiquette.textSize = Math.max(12, g.t - 2);
        etiquette.pos = vec2(g.x + g.largeur / 2, g.y + g.hauteur / 2);
    });
}



/* ============================================================
   afficherCarton(titre, sousTitre, puis)
   ============================================================
   Un titre plein écran, sur fond de nuit, qui s'efface tout seul
   au bout de quelques secondes — ou dès qu'on touche l'écran,
   passé la première seconde.
   ============================================================ */
function afficherCarton(titre, sousTitre, puis) {

    const debut = time();
    let fermeture = 0;

    commencerJeu(function () {
        if (time() - debut > 1 && !fermeture) fermeture = time();
    });

    const fond = objetDeJeu([
        rect(width(), height()),
        pos(0, 0),
        color(...COULEUR_NUIT),
        opacity(0),
        z(Z_INTERFACE + 50),
    ]);
    const grand = objetDeJeu([
        text(titre, { size: 40 }),
        pos(0, 0),
        anchor("center"),
        color(...COULEUR_OR),
        opacity(0),
        z(Z_INTERFACE + 51),
    ]);
    const petit = objetDeJeu([
        text(sousTitre || "", { size: 18, width: 300, align: "center" }),
        pos(0, 0),
        anchor("center"),
        color(...COULEUR_CREME),
        opacity(0),
        z(Z_INTERFACE + 51),
    ]);

    const TENUE = 3.2;

    const boucle = onUpdate(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();

        const t = time() - debut;
        if (!fermeture && t > TENUE) fermeture = time();

        const entree = Math.min(1, t / 0.8);
        const sortie = fermeture ? Math.min(1, (time() - fermeture) / 0.9) : 0;
        const k = entree * (1 - sortie);

        fond.width = width();
        fond.height = height();
        fond.opacity = 0.9 * k;

        const taille = Math.round(Math.max(28, Math.min(56, width() * 0.09)));
        grand.textSize = taille;
        grand.pos = vec2(width() / 2, height() / 2 - taille * 0.4);
        grand.opacity = k;

        petit.textSize = echelleInterface() + 1;
        petit.width = Math.min(width() - 40, 520);
        petit.pos = vec2(width() / 2, height() / 2 + taille * 0.6);
        petit.opacity = k;

        if (sortie >= 1) {
            boucle.cancel();
            finirJeu();
            if (puis) puis();
        }
    });
}
