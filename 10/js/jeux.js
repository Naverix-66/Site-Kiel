/* ============================================================
   LES PETITS JEUX — et les cartons de titre
   ============================================================
   L'acte II n'est pas qu'une suite de conversations : il y a des
   choses à FAIRE avec les pattes. Deux petits jeux, qui servent
   chacun deux fois, et qui ne font jamais perdre :

     jeuDePrecision   un trait va et vient sur une barre ; on
                      appuie quand il passe dans la zone dorée.
                      Tirer une baguette du fond d'une pile de
                      vaisselle, prendre un dé à coudre sans
                      toucher aux aiguilles.

     jeuDeForce       on appuie vite, tous ensemble, pour remplir
                      une barre qui se vide doucement. Tirer une
                      rallonge coincée derrière un bureau.

   Et un carton : un titre plein écran (« Acte II »), qui se
   referme tout seul.

   ------------------------------------------------------------
   UN SEUL BOUTON, PARTOUT

   On appuie avec la barre d'espace, Entrée, E, un clic ou un
   doigt posé N'IMPORTE OÙ sur l'écran : sur le téléphone de
   Klara, viser un petit bouton pendant qu'un trait défile serait
   injouable.

   Pendant un jeu, Bob ne bouge pas et rien d'autre n'est
   interactif (voir jeuEnCours() dans scene_appartement.js).

   ------------------------------------------------------------
   ON NE PERD JAMAIS

   Un raté fait trembler la pile, piquer une aiguille, et on
   recommence. C'est une peluche de quarante centimètres qui fait
   de son mieux : le jeu doit être drôle, pas punitif.
   ============================================================ */


const jeu = {
    actif: false,
    objets: [],
    ecouteurs: [],
    verrou: 0,
};


function jeuEnCours() {
    return jeu.actif;
}


/* ------------------------------------------------------------
   La mécanique commune
   ------------------------------------------------------------ */
function commencerJeu(appui) {

    jeu.actif = true;
    jeu.objets = [];
    jeu.ecouteurs = [];

    // Le doigt qui vient de fermer le dialogue ne doit pas compter
    // comme un premier appui.
    jeu.verrou = 0.35;

    if (typeof interactions !== "undefined") interactions.cible = null;
    if (typeof cacherInterfaceAction === "function") cacherInterfaceAction();

    const appuyer = function () {
        if (!jeu.actif || jeu.verrou > 0) return;
        appui();
    };
    // Rangé ici pour pouvoir appuyer depuis la console : jeu.appuyer()
    jeu.appuyer = appuyer;

    const e = jeu.ecouteurs;
    e.push(onKeyPress("space", appuyer));
    e.push(onKeyPress("enter", appuyer));
    e.push(onKeyPress("e", appuyer));
    e.push(onMousePress(appuyer));
    e.push(onTouchStart(appuyer));
}


function finirJeu() {
    jeu.ecouteurs.forEach(function (e) { e.cancel(); });
    jeu.objets.forEach(function (o) { destroy(o); });
    jeu.ecouteurs = [];
    jeu.objets = [];
    jeu.actif = false;
}


// Ajoute un objet d'interface qui disparaîtra avec le jeu.
function objetDeJeu(composants) {
    const o = add(composants.concat([fixed()]));
    jeu.objets.push(o);
    return o;
}


/* ------------------------------------------------------------
   Le panneau : un cadre crème au milieu de l'écran, un titre,
   une consigne, et un message qui dit ce qui vient d'arriver.
   Replacé à chaque image (téléphone qu'on tourne).
   ------------------------------------------------------------ */
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

    p.messageJusqua = 0;
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
    const hauteur = marge + (t + 2) + 8 + p.consigne.height + 16
        + hauteurBarre + 14 + (t + 4) * 2 + marge;

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
    p.message.pos = vec2(width() / 2, yBarre + hauteurBarre + 12 + t + 6);
    p.message.opacity = time() < p.messageJusqua ? 1 : 0;

    return { x: x + marge, y: yBarre, largeur: largeur - 2 * marge, hauteur: hauteurBarre, t: t };
}


function direDansLePanneau(p, texte, duree) {
    p.message.text = texte;
    p.messageJusqua = time() + (duree || 1.4);
}


/* ============================================================
   jeuDePrecision(options)
   ============================================================
     titre, consigne   ce qu'on lit
     reussites         combien de fois il faut viser juste (3)
     vitesse           en largeurs de barre par seconde (0.9)
     zone              la largeur de la zone dorée, de 0 à 1 (0.22)
     bravos            une phrase par réussite (facultatif)
     rates             des phrases pour les ratés, dans l'ordre
     puis(rates)       la suite, avec le nombre de ratés
   ============================================================ */
function jeuDePrecision(o) {

    const etat = {
        phase: Math.random() * 2,
        vitesse: o.vitesse || 0.9,
        zone: o.zone || 0.22,
        centre: 0.5,
        reussies: 0,
        rates: 0,
        pause: 0,
        fini: false,
        eclat: 0,              // l'éclat de la zone après un appui
        couleurEclat: null,
    };

    const nouveauCentre = function () {
        const bord = etat.zone / 2 + 0.06;
        etat.centre = bord + Math.random() * (1 - 2 * bord);
    };
    nouveauCentre();

    // Un aller-retour régulier (et non un sinus) : le trait ne
    // ralentit pas aux bords, il ne traverse pas la zone en coup de
    // vent quand elle est au milieu.
    const curseur = function () {
        const t = ((etat.phase % 2) + 2) % 2;
        return 1 - Math.abs(t - 1);
    };

    commencerJeu(function () {
        if (etat.pause > 0 || etat.fini) return;

        const p = curseur();
        if (Math.abs(p - etat.centre) <= etat.zone / 2) {
            etat.reussies++;
            etat.pause = 0.5;
            etat.eclat = 1;
            etat.couleurEclat = [140, 196, 120];
            if (typeof jouerSon === "function") jouerSon("pop", { vitesse: 1 + 0.15 * etat.reussies, volume: 0.7 });
            if (o.bravos && o.bravos[etat.reussies - 1]) direDansLePanneau(panneau, o.bravos[etat.reussies - 1]);

            if (etat.reussies >= (o.reussites || 3)) {
                etat.fini = true;
                etat.pause = 0.9;
            } else {
                etat.vitesse *= 1.18;
                nouveauCentre();
            }
        } else {
            etat.pause = 0.7;
            etat.eclat = 1;
            etat.couleurEclat = [214, 110, 100];
            if (typeof jouerSon === "function") jouerSon("tremble");
            shake(3);
            const phrases = o.rates || ["Raté."];
            direDansLePanneau(panneau, phrases[etat.rates % phrases.length]);
            etat.rates++;
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
    const cible = objetDeJeu([
        rect(10, 10, { radius: 5 }),
        pos(0, 0),
        color(...COULEUR_OR),
        z(Z_INTERFACE + 22),
    ]);
    const trait = objetDeJeu([
        rect(5, 10, { radius: 2 }),
        pos(0, 0),
        anchor("top"),
        color(...COULEUR_ENCRE),
        z(Z_INTERFACE + 23),
    ]);

    const points = [];
    for (let i = 0; i < (o.reussites || 3); i++) {
        points.push(objetDeJeu([
            circle(6),
            pos(0, 0),
            anchor("center"),
            color(...COULEUR_CREME),
            outline(2, rgb(...COULEUR_OR)),
            z(Z_INTERFACE + 22),
        ]));
    }

    const boucle = onUpdate(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();
        if (etat.pause > 0) {
            etat.pause -= dt();
            if (etat.pause <= 0 && etat.fini) {
                boucle.cancel();
                finirJeu();
                if (o.puis) o.puis(etat.rates);
                return;
            }
        } else {
            etat.phase += etat.vitesse * dt();
        }
        etat.eclat = Math.max(0, etat.eclat - dt() * 2);

        const g = placerPanneau(panneau);

        barre.pos = vec2(g.x, g.y);
        barre.width = g.largeur;
        barre.height = g.hauteur;

        cible.pos = vec2(g.x + (etat.centre - etat.zone / 2) * g.largeur, g.y);
        cible.width = etat.zone * g.largeur;
        cible.height = g.hauteur;
        cible.color = etat.eclat > 0 && etat.couleurEclat
            ? rgb(...etat.couleurEclat)
            : rgb(...COULEUR_OR);

        trait.pos = vec2(g.x + curseur() * g.largeur, g.y - 4);
        trait.height = g.hauteur + 8;

        const ecart = 20;
        const x0 = width() / 2 - (points.length - 1) * ecart / 2;
        points.forEach(function (point, i) {
            point.pos = vec2(x0 + i * ecart, g.y + g.hauteur + 16);
            point.color = i < etat.reussies ? rgb(...COULEUR_OR) : rgb(...COULEUR_CREME);
        });
    });
}


/* ============================================================
   jeuDeForce(options)
   ============================================================
     titre, consigne   ce qu'on lit
     appuis            combien d'appuis pour remplir la barre (16)
     fuite             ce qui se vide chaque seconde, de 0 à 1 (0.12)
     equipe            les clés des peluches qui tirent avec Bob :
                       elles sursautent à chaque appui
     cris              des phrases, une au hasard de temps en temps
     puis()            la suite
   ============================================================ */
function jeuDeForce(o) {

    const etat = { plein: 0, fini: false, pause: 0, prochainCri: 0 };
    const appuis = o.appuis || 16;
    const fuite = o.fuite === undefined ? 0.12 : o.fuite;

    commencerJeu(function () {
        if (etat.fini) return;

        etat.plein = Math.min(1, etat.plein + 1 / appuis);
        if (typeof jouerSon === "function") jouerSon("tire", { vitesse: 0.7 + Math.random() * 0.6 });

        // Tout le monde tire : ils sursautent, un peu au hasard.
        (o.equipe || []).forEach(function (cle) {
            const p = PELUCHES[cle];
            if (p && Math.random() < 0.6) p.bump = 4;
        });
        const bob = get("bob")[0];
        if (bob && bob.ombre) shake(1);

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

    const boucle = onUpdate(function () {

        if (jeu.verrou > 0) jeu.verrou -= dt();

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
        }

        const g = placerPanneau(panneau);

        barre.pos = vec2(g.x, g.y);
        barre.width = g.largeur;
        barre.height = g.hauteur;

        jauge.pos = vec2(g.x, g.y);
        jauge.width = Math.max(g.hauteur, etat.plein * g.largeur);
        jauge.height = g.hauteur;
        jauge.opacity = etat.plein > 0.01 ? 1 : 0;
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
