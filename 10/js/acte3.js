/* ============================================================
   ACTE III — LA DESCENTE
   ============================================================
   Bob est passé par la fenêtre. Fin du studio crème : ici c'est
   la façade, vue de côté, bleue et froide, et ça descend.

   ------------------------------------------------------------
   CE QU'ON JOUE (décidé avec Evan)

     - temps réel à la corde : on file le pyjama de Samsam, on se
       balance, le vent pousse ;
     - quand on rate, on NE MEURT PAS : Bob glisse, le nœud de
       Doudou tient, et on le remonte d'en haut. On reperd de la
       hauteur, c'est tout ;
     - l'acte s'arrête quand Bob touche le sol de la cour.
       L'arbre et le nid, c'est l'acte IV.

   ------------------------------------------------------------
   LES COMMANDES

     souris / doigt   là où on tire, Bob va : plus bas que lui =
                      la corde file, plus à droite = il se balance
                      à droite. On le tient sur lui = il ne bouge
                      plus. C'est le même geste analogique que
                      dans les deux petits jeux de l'acte II.
     flèches          bas = descendre, haut = remonter,
                      gauche/droite = se balancer.

   ------------------------------------------------------------
   LA RÈGLE QUI TIENT TOUT L'ACTE

   « Quand ça souffle, on ne descend pas. » C'est Doudou qui la
   dit, au premier mètre : tant que Bob ne file pas la corde, il
   se colle au mur et la rafale ne le prend presque pas. Dès
   qu'il file, la corde a du mou et il part.

   ------------------------------------------------------------
   LA ROUTE, DE HAUT EN BAS (voir facade.js pour les mesures)

     196   l'appui de Klara : le départ
     326   le cordon de briques : ça dépasse, on ralentit
     380   la fenêtre du 1er s'allume : on ne bouge plus
     456   l'appui du 1er : on souffle, on parle
     548   la toile d'araignée : elle est vide. Presque.
     640   le collier de la gouttière qui fuit : on passe entre
     716   l'appui du rez : la télé du voisin, et le pyjama
     740   le bout de la corde. Il manque un étage.
     900   l'herbe

   ------------------------------------------------------------
   POUR TESTER SANS REJOUER LES DEUX PREMIERS ACTES

       octobre.html?acte3

   ------------------------------------------------------------
   LES RÈGLES D'ÉCRITURE NE CHANGENT PAS (voir acte1.js).
   ============================================================ */


const CORDE = {

    hauteurBob: 56,       // sa taille à l'écran, en pixels de façade
    rayon: 13,            // ce qui le fait toucher les choses
    pieds: 24,            // du centre de Bob à ses pieds
    bras: 18,             // ...et de son centre à ses mains, qui
                          //    tiennent la corde : la longueur de
                          //    corde s'arrête LÀ, pas à son nombril.

    longueur: 520,        // le pyjama de Samsam : il s'arrête à 728

    vitesseMax: 52,       // on descend au plus vite comme ça
    vitesseMontee: 28,
    accel: 130,           // le temps que met la corde à filer
    frein: 320,           // et le temps qu'elle met à s'arrêter
    lent: 26,             // au-dessus, les saillies accrochent

    pesanteur: 620,       // celle du pendule
    // Mesuré : avec ces deux-là, Bob atteint x=448 quand la corde
    // fait 200 (il ne peut donc PAS contourner un appui de fenêtre :
    // il faut se poser dessus), et x=530 quand elle fait 460 — en
    // bas, le balancier devient assez large pour aller taper dans la
    // gouttière. La difficulté monte toute seule avec la corde.
    poussee: 215,         // ce que Bob peut faire tout seul
    amorti: 1.0,          // il tourne longtemps quand il file
    amortiColle: 2.6,     // il se colle au mur quand il ne file pas
    angleMax: 0.62,

    marche: 46,           // sa vitesse quand il marche sur un appui

    // Le couloir de descente : à gauche il y a la gouttière, à
    // droite le mur de la travée d'à côté.
    gauche: 290,
    droite: 496,

    chutePesanteur: 420,
    chuteMax: 230,
    chutePilotage: 190,
};


const descente = {

    etat: "corde",        // corde | appui | glisse | remonte | chute | sol
    longueur: 20,
    vitesse: 0,
    angle: 0,
    vAngle: 0,
    x: 0,
    y: 0,

    appui: null,          // l'appui sous ses pieds, s'il y en a un
    appuiPrecedent: 24,   // la longueur de corde du dernier appui tenu
    avantGlissade: 0,     // ...et celle d'avant la dernière glissade
    versLaDroite: true,
    chuteX: 0,
    chuteY: 0,
    regardeEnHaut: 0,

    jusqua: 0,            // la fin de l'état en cours
    depuis: 0,
    reprise: 0,           // on ne teste rien tant que ça dure

    trempe: 0,            // il est mouillé jusqu'à cette heure
    secousse: 0,

    moments: {},          // les moments déjà joués
    voix: [],             // les cris venus d'en haut
    doigt: { enfonce: false, position: null, id: null },

    vent: { force: 0, cible: 0, prochaine: 0, annonce: 0, jusqua: 0, dose: 0 },
    fenetre: { allumee: 0, jusqua: 0, ouverte: false },
    fuite: { prochaine: 0, jusqua: 0 },

    aide: 0,              // la ligne de commandes s'efface toute seule
    ui: null,
    fini: false,
};


/* ============================================================
   LA SCÈNE
   ============================================================ */
scene("facade", function () {

    charger();
    preparerLesSons();
    preparerInventaire();
    brancherLeDoigt();

    setCamScale(zoomDeLaFacade());
    setCamPos(FACADE.ancre.x, FACADE.ancre.y + 60);

    installerLInterfaceDeLaDescente();
    remettreLaDescente();

    onUpdate(function () {
        majLeSonDeLaFacade();
        if (!dialogueEnCours() && !jeuEnCours()) {
            majLeVent();
            majLaDescente();
            majLesMoments();
        }
        majLaCameraDeLaFacade();
        majLInterfaceDeLaDescente();
    });

    onDraw(function () {
        dessinerLeMurDeLaFacade();
        dessinerLesLumieresDeLaFacade();
        dessinerLaFenetreDeKlara();
        dessinerLaFuite();
        dessinerLaCordeDeSamsam();
        dessinerBobDehors();
        dessinerLaPluie();
    });

    // Le rideau se lève : le carton, puis les premiers mots.
    if (!saitQue("descente_commencee")) {
        afficherCarton("Acte III", "La descente", function () {
            noter("descente_commencee");
            lesPremiersMots();
        });
    }
});


function zoomDeLaFacade() {
    return Math.max(1.4, Math.min(4, Math.min(height() / 300, width() / 260)));
}


// On regarde Bob, mais un peu en dessous : ce qui compte, dans
// une descente, c'est ce qui arrive par en bas.
function majLaCameraDeLaFacade() {

    const zoom = zoomDeLaFacade();
    setCamScale(zoom);

    const demiL = width() / (2 * zoom);
    const demiH = height() / (2 * zoom);

    let x = descente.x;
    let y = descente.y + 46;
    let douceur = 6;

    if (descente.etat === "sol") y = descente.y - 20;

    // La toute fin : Bob lève la tête, et la caméra remonte avec
    // lui jusqu'à la petite tache jaune, tout là-haut.
    if (descente.regardeEnHaut) {
        x = FACADE.ancre.x;
        y = FACADE.ancre.y + 40;
        douceur = 0.7;
    }

    x = Math.max(demiL, Math.min(FACADE.L - demiL, x));
    y = Math.max(demiH, Math.min(FACADE.H - demiH, y));

    if (FACADE.L <= demiL * 2) x = FACADE.L / 2;

    const vue = getCamPos().lerp(vec2(x, y), Math.min(1, dt() * douceur));
    setCamPos(
        vue.x + (descente.secousse > 0 ? rand(-3, 3) : 0),
        vue.y + (descente.secousse > 0 ? rand(-3, 3) : 0)
    );

    if (descente.secousse > 0) descente.secousse -= dt();
}


/* ============================================================
   REMETTRE BOB SUR LA CORDE
   ============================================================
   Au premier départ, ou au rechargement de la page : on le
   repose au dernier appui atteint. Un acte de quatre minutes ne
   se recommence pas en entier pour une glissade.
   ============================================================ */
function remettreLaDescente() {

    descente.moments = memoire.drapeaux.descente_moments || {};
    descente.etat = "corde";
    descente.vitesse = 0;
    descente.angle = 0;
    descente.vAngle = 0;
    descente.appui = null;
    descente.fini = false;
    descente.aide = time() + 16;

    const repere = memoire.drapeaux.descente_appui;
    if (repere === undefined || repere === null) {
        descente.longueur = 24;
    } else {
        descente.longueur = longueurPourPoser(repere);
    }
    descente.appuiPrecedent = descente.longueur;

    // On a déjà entendu le bout de la corde : le mot "lâcher" doit
    // revenir tout seul si on recharge la page ici.
    if (descente.moments.bout) descente.moments.pretALacher = true;

    if (saitQue("descente_finie")) {
        descente.etat = "sol";
        descente.x = 408;
        descente.y = FACADE.herbe - 8;
        descente.fini = true;
    }

    placerBobSurLaCorde();
}


function placerBobSurLaCorde() {
    const d = descente.longueur + CORDE.bras;
    descente.x = FACADE.ancre.x + Math.sin(descente.angle) * d;
    descente.y = FACADE.ancre.y + Math.cos(descente.angle) * d;
}


// La longueur de corde qu'il faut pour que les pieds de Bob
// tombent pile sur cette hauteur-là.
function longueurPourPoser(y) {
    return y - FACADE.ancre.y - CORDE.pieds - CORDE.bras;
}


/* ============================================================
   LE VENT
   ============================================================
   Un fond qui respire, et des rafales annoncées. L'annonce est
   tout : une rafale qui tombe sans prévenir n'est pas difficile,
   elle est injuste.
   ============================================================ */
function majLeVent() {

    const v = descente.vent;
    const t = time();

    if (v.prochaine === 0) v.prochaine = t + 9;

    // L'annonce, puis la rafale.
    if (t > v.prochaine && t > v.jusqua) {
        v.annonce = t + 1.5;
        v.jusqua = t + 1.5 + 2.6 + Math.random() * 1.4;
        v.prochaine = v.jusqua + 7 + Math.random() * 7;
        v.dose = Math.random() > 0.5 ? 1 : -1;
        if (typeof jouerSon === "function") jouerSon("vent", { volume: 0.5 });
    }

    const dansLaRafale = t > v.annonce && t < v.jusqua;
    const calme = Math.sin(t * 0.7) * 10 + Math.sin(t * 1.9) * 6;

    if (dansLaRafale) {
        // elle monte, elle tient, elle retombe
        const k = Math.min(1, (t - v.annonce) / 0.8) * Math.min(1, (v.jusqua - t) / 0.7);
        v.force = calme + v.dose * 200 * k * (0.75 + 0.25 * Math.sin(t * 9));
    } else {
        v.force = calme;
    }
}


function rafaleEnCours() {
    return time() > descente.vent.annonce && time() < descente.vent.jusqua;
}


function rafaleAnnoncee() {
    return time() < descente.vent.annonce && descente.vent.annonce - time() < 1.5;
}


/* ============================================================
   LA DESCENTE, IMAGE PAR IMAGE
   ============================================================ */
function majLaDescente() {

    if (descente.etat === "corde") majSurLaCorde();
    else if (descente.etat === "appui") majSurLAppui();
    else if (descente.etat === "glisse") majLaGlissade();
    else if (descente.etat === "remonte") majLaRemontee();
    else if (descente.etat === "chute") majLaChute();
}


// Ce que le joueur demande : {descendre: -1..1, cote: -1..1}
function ceQueLeJoueurDemande() {

    const f = lireFleches();
    if (f.x !== 0 || f.y !== 0) {
        return { descendre: f.y, cote: f.x };
    }

    const tenu = doigtTenu();
    if (!tenu) return { descendre: 0, cote: 0 };

    const monde = toWorld(tenu);
    const dy = monde.y - descente.y;
    const dx = monde.x - descente.x;

    return {
        descendre: Math.max(-1, Math.min(1, dy / 38)),
        cote: Math.max(-1, Math.min(1, dx / 44)),
    };
}


function majSurLaCorde() {

    const ordre = ceQueLeJoueurDemande();
    const dessus = descente.y;

    // ---- la corde qui file ----
    const voulue = ordre.descendre > 0
        ? ordre.descendre * CORDE.vitesseMax * (time() < descente.trempe ? 1.35 : 1)
        : ordre.descendre * CORDE.vitesseMontee;

    const pente = voulue > descente.vitesse ? CORDE.accel : CORDE.frein;
    descente.vitesse += Math.max(-pente * dt(), Math.min(pente * dt(), voulue - descente.vitesse));

    descente.longueur += descente.vitesse * dt();
    descente.longueur = Math.max(20, Math.min(CORDE.longueur, descente.longueur));

    if (descente.longueur >= CORDE.longueur) descente.vitesse = Math.min(0, descente.vitesse);

    // ---- le pendule ----
    const L = Math.max(40, descente.longueur);
    const file = descente.vitesse > 6;

    let acc = -(CORDE.pesanteur / L) * Math.sin(descente.angle);
    acc += (descente.vent.force / L) * Math.cos(descente.angle);
    acc += (ordre.cote * CORDE.poussee / L);

    descente.vAngle += acc * dt();
    descente.vAngle *= Math.exp(-(file ? CORDE.amorti : CORDE.amortiColle) * dt());
    descente.angle += descente.vAngle * dt();

    if (Math.abs(descente.angle) > CORDE.angleMax) {
        descente.angle = Math.sign(descente.angle) * CORDE.angleMax;
        descente.vAngle *= -0.35;
    }

    placerBobSurLaCorde();

    if (time() < descente.reprise) return;

    // ---- ce qu'il touche ----
    if (descente.x - CORDE.rayon < CORDE.gauche) {
        glisser("gouttiere");
        return;
    }
    if (descente.x + CORDE.rayon > CORDE.droite) {
        glisser("mur");
        return;
    }
    if (traverse(dessus, descente.y, FACADE.bandeau.y - 4, FACADE.bandeau.y + FACADE.bandeau.h + 6)
        && descente.vitesse > CORDE.lent) {
        glisser("bandeau");
        return;
    }
    if (descente.fuite && time() < descente.fuite.jusqua && jetDEau(descente.x, descente.y)) {
        seFaireTremper();
    }

    // ---- un appui sous les pieds ----
    if (descente.vitesse > 0) {
        const appui = appuiSousLesPieds(dessus, descente.y);
        if (appui) poserSurLAppui(appui);
    }
}


// Est-ce qu'on est passé de a à b en franchissant la bande ?
function traverse(a, b, haut, bas) {
    const pa = a + CORDE.pieds;
    const pb = b + CORDE.pieds;
    return (pa < bas && pb > haut);
}


function appuiSousLesPieds(avant, apres) {

    const travee = FACADE.travees[FACADE.traveeDeKlara];
    for (let i = 1; i < FACADE.appuis.length; i++) {
        const y = FACADE.appuis[i];
        if (avant + CORDE.pieds <= y && apres + CORDE.pieds >= y) {
            if (descente.x > travee.x + 4 && descente.x < travee.x + travee.l - 4) {
                return { y: y, x0: travee.x - 3, x1: travee.x + travee.l + 3, etage: i };
            }
        }
    }
    return null;
}


/* ------------------------------------------------------------
   SUR UN APPUI DE FENÊTRE
   ------------------------------------------------------------
   Le seul endroit où on respire. Il sert de repère de reprise :
   si on recharge la page, Bob repart d'ici.
   ------------------------------------------------------------ */
function poserSurLAppui(appui) {

    descente.etat = "appui";
    descente.appui = appui;
    descente.y = appui.y - CORDE.pieds;
    descente.vAngle = 0;
    descente.angle = Math.atan2(descente.x - FACADE.ancre.x, descente.y - FACADE.ancre.y);

    if (descente.vitesse > 40) {
        if (typeof sonSynthe === "function") sonSynthe("tok", 0.8);
        descente.secousse = 0.2;
    } else if (typeof jouerSon === "function") {
        jouerSon("atterrissage", { volume: 0.4 });
    }
    descente.vitesse = 0;

    descente.appuiPrecedent = longueurPourPoser(appui.y);
    memoire.drapeaux.descente_appui = appui.y;
    sauvegarder();
}


function majSurLAppui() {

    const ordre = ceQueLeJoueurDemande();
    const appui = descente.appui;

    if (ordre.cote !== 0) {
        descente.x += ordre.cote * CORDE.marche * dt();
        descente.versLaDroite = ordre.cote > 0;
    }
    descente.x = Math.max(appui.x0 + 6, Math.min(appui.x1 - 6, descente.x));

    descente.longueur = Math.hypot(descente.x - FACADE.ancre.x, descente.y - FACADE.ancre.y) - CORDE.bras;
    descente.angle = Math.atan2(descente.x - FACADE.ancre.x, descente.y - FACADE.ancre.y);

    // Il repart quand on redemande à descendre.
    if (ordre.descendre > 0.35) {
        descente.etat = "corde";
        descente.appui = null;
        descente.vitesse = 12;
        descente.vAngle = 0;
        descente.reprise = time() + 0.25;
        descente.y += 2;
    }
}


/* ------------------------------------------------------------
   LA GLISSADE — la seule sanction de l'acte
   ------------------------------------------------------------
   Bob part, le nœud tient, et on le remonte d'en haut. Il n'y a
   pas de partie perdue : il y a de la hauteur à refaire.
   ------------------------------------------------------------ */
function glisser(raison) {

    descente.etat = "glisse";
    descente.avantGlissade = descente.longueur;
    descente.jusqua = time() + 0.55;
    descente.vitesse = 210;
    descente.secousse = 0.7;
    descente.reprise = time() + 1.2;

    if (typeof sonSynthe === "function") {
        sonSynthe(raison === "gouttiere" ? "fracas" : "tok", raison === "gouttiere" ? 0.8 : 1);
    }
    if (typeof shake === "function") shake(raison === "gouttiere" ? 12 : 7);

    if (raison === "gouttiere") crierDEnHaut("bluey", "LE TUYAU !! IL A TOUCHÉ LE TUYAU !!");
    else if (raison === "bandeau") crierDEnHaut("doudou", "Trop vite, mon grand.");
    else if (raison === "fenetre") crierDEnHaut("cakey", "Oh !");
    else crierDEnHaut("bluey", "BOB !!");
}


function majLaGlissade() {

    // Il part, mais pas indéfiniment : une glissade fait une
    // centaine de pixels, le temps d'avoir très peur.
    const fin = Math.min(CORDE.longueur, descente.avantGlissade + 105);

    descente.longueur = Math.min(fin, descente.longueur + descente.vitesse * dt());
    descente.vAngle *= Math.pow(0.02, dt());
    descente.angle += descente.vAngle * dt();
    placerBobSurLaCorde();

    if (time() > descente.jusqua || descente.longueur >= fin) {
        descente.etat = "remonte";
        descente.jusqua = time() + 1.4;
        descente.vitesse = -132;
        if (typeof sonSynthe === "function") sonSynthe("tok", 0.5);
        crierDEnHaut("samsam", "Je te tiens.");
    }
}


function majLaRemontee() {

    descente.longueur += descente.vitesse * dt();
    descente.angle *= Math.pow(0.05, dt());
    descente.vAngle *= Math.pow(0.02, dt());

    // On le remonte d'une centaine de pixels — jamais plus haut que
    // le dernier appui tenu : une glissade coûte du chemin, pas la
    // moitié de l'acte.
    const plancher = Math.max(descente.appuiPrecedent, descente.avantGlissade - 110);
    descente.longueur = Math.max(plancher, descente.longueur);
    placerBobSurLaCorde();

    if (time() > descente.jusqua || descente.longueur <= plancher) {
        descente.etat = "corde";
        descente.vitesse = 0;
        descente.reprise = time() + 0.4;
    }
}


/* ------------------------------------------------------------
   LE JET D'EAU DU COLLIER QUI FUIT
   ------------------------------------------------------------ */
function jetDEau(x, y) {
    const g = FACADE.gouttiere;
    return y > 626 && y < 660 && x < 430 && x > g.x;
}


function seFaireTremper() {
    if (time() < descente.trempe) return;
    descente.trempe = time() + 6;
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.5);
    crierDEnHaut("bob", "...froid.");
}


/* ============================================================
   LA CHUTE, À LA FIN DE LA CORDE
   ============================================================ */
function lacherLaCorde() {

    descente.etat = "chute";
    descente.chuteX = Math.cos(descente.angle) * descente.vAngle * descente.longueur;
    descente.chuteY = 30;
    if (typeof jouerSon === "function") jouerSon("vent", { volume: 0.8 });
}


function majLaChute() {

    const ordre = ceQueLeJoueurDemande();

    descente.chuteX += ordre.cote * CORDE.chutePilotage * dt();
    descente.chuteX *= Math.pow(0.35, dt());
    descente.chuteY = Math.min(CORDE.chuteMax, descente.chuteY + CORDE.chutePesanteur * dt());

    descente.x += descente.chuteX * dt();
    descente.y += descente.chuteY * dt();
    descente.x = Math.max(30, Math.min(FACADE.L - 30, descente.x));

    if (descente.y + CORDE.pieds >= FACADE.herbe + 6) {
        descente.y = FACADE.herbe + 6 - CORDE.pieds;
        descente.etat = "sol";
        toucherLeSol();
    }
}


function surUnSoupirail(x) {
    return FACADE.soupiraux.some(function (sx) {
        return x > sx - 6 && x < sx + 46;
    });
}


/* ============================================================
   LES MOMENTS
   ============================================================
   Chacun se joue une fois, quand Bob passe sa hauteur. On les
   retient dans la sauvegarde : ils ne se rejouent pas quand on
   recharge la page.
   ============================================================ */
function momentJoue(nom) {
    if (descente.moments[nom]) return true;
    descente.moments[nom] = true;
    memoire.drapeaux.descente_moments = descente.moments;
    sauvegarder();
    return false;
}


function majLesMoments() {

    if (descente.etat === "chute" || descente.etat === "sol") return;
    const y = descente.y;

    // Pendant une glissade, on n'a pas la tête à raconter.
    const calme = descente.etat === "corde" || descente.etat === "appui";
    if (!calme) return;

    if (y > 252 && !descente.moments.bandeau && !momentJoue("bandeau")) {
        crierDEnHaut("doudou", "Les briques dépassent, juste en dessous de toi.");
    }

    if (y > 360 && !descente.moments.fenetre && !momentJoue("fenetre")) {
        allumerLaFenetreDuVoisin();
    }

    // Le souvenir de Doudou attend que la lumière du voisin soit
    // repartie : on ne se raconte pas la gare avec un projecteur
    // dans le dos.
    if (descente.etat === "appui" && descente.appui && descente.appui.etage === 1
        && !descente.fenetre.allumee
        && !descente.moments.premier && !momentJoue("premier")) {
        surLAppuiDuPremier();
    }

    if (y > 536 && !descente.moments.araignee && !momentJoue("araignee")) {
        lAraignee();
    }

    if (y > 600 && !descente.moments.fuite && !momentJoue("fuite")) {
        crierDEnHaut("bob", "Le tuyau perd de l'eau, en bas.");
        descente.fuite.prochaine = time() + 1.5;
    }

    if (descente.etat === "appui" && descente.appui && descente.appui.etage === 2
        && !descente.moments.rez && !momentJoue("rez")) {
        surLAppuiDuRez();
    }

    if (descente.longueur >= CORDE.longueur - 2 && descente.etat === "corde"
        && !descente.moments.bout && !momentJoue("bout")) {
        leBoutDeLaCorde();
    }

    majLaFenetreDuVoisin();
    majLaFuite();
}


/* ------------------------------------------------------------
   LES PREMIERS MOTS
   ------------------------------------------------------------ */
function lesPremiersMots() {

    lancerDialogue([
        { texte: "Dehors, le vent ne passe plus par la fenêtre. Il est partout à la fois, et il pousse." },
        { texte: "En dessous : deux étages de brique mouillée, et la cour tout au fond, qui bouge un peu." },
        { qui: "doudou", texte: "La corde tient, mon grand. Le reste, c'est toi." },
        { qui: "doudou", texte: "Quand ça souffle, on ne descend pas. On se colle, et on attend." },
        { qui: "doudou", texte: "Le vent s'en va toujours avant nous." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Samsam ?" },
        { qui: "samsam", texte: "Je suis là. Tout du long." },
    ], function () {
        descente.aide = time() + 18;
    });
}


/* ------------------------------------------------------------
   LA FENÊTRE DU VOISIN
   ------------------------------------------------------------
   Elle s'allume pendant que Bob est pile devant. La règle est
   simple et elle se comprend sans qu'on l'écrive : on ne bouge
   plus. S'il descend quand même, la fenêtre s'ouvre.
   ------------------------------------------------------------ */
function allumerLaFenetreDuVoisin() {

    descente.fenetre.allumee = time();
    descente.fenetre.jusqua = time() + 6.5;
    descente.fenetre.ouverte = false;
    if (typeof jouerSon === "function") jouerSon("prise", { volume: 0.5 });
    crierDEnHaut("cakey", "La fenêtre du dessous ! Ne bouge plus !");
}


function majLaFenetreDuVoisin() {

    const f = descente.fenetre;
    if (!f.jusqua) return;

    if (time() > f.jusqua) {
        if (f.allumee) {
            f.allumee = 0;
            f.jusqua = 0;
            crierDEnHaut("bob", "...");
        }
        return;
    }

    // Il descend devant une fenêtre allumée : quelqu'un vient voir.
    // Posé sur l'appui, il est SOUS la vitre : on ne le voit pas.
    if (!f.ouverte && descente.etat === "corde"
        && descente.vitesse > 14 && time() > f.allumee + 0.7) {
        f.ouverte = true;
        f.jusqua = time() + 1.6;
        if (typeof jouerSon === "function") jouerSon("porteOuvre", { volume: 0.5 });
        descente.vent.force += 240;
        glisser("fenetre");
    }
}


/* ------------------------------------------------------------
   LES AUTRES MOMENTS
   ------------------------------------------------------------ */
function surLAppuiDuPremier() {

    lancerDialogue([
        { texte: "Un appui de fenêtre large comme un trottoir. Bob s'assoit dessus, les jambes dans le vide." },
        { texte: "Tout en haut, la fenêtre de Klara est déjà petite. La tache jaune de la veilleuse tient dans une patte." },
        { qui: "bluey", texte: "IL EST À LA MOITIÉ !! IL EST À LA MOITIÉ !!" },
        { qui: "cakey", texte: "On te voit, Bob !" },
        { qui: "doudou", texte: "La nuit où je suis arrivé, il y avait un rebord comme celui-là, dans une gare." },
        { qui: "doudou", texte: "Je m'y suis assis aussi. J'ai regardé en bas, et j'ai trouvé que c'était très loin." },
        { qui: "doudou", texte: "Et puis quelqu'un m'a ramassé, et on est arrivés." },
        { qui: "bob", texte: "Elle t'a ramassé." },
        { qui: "doudou", texte: "Elle m'a ramassé." },
    ]);
}


function lAraignee() {

    crierDEnHaut("bob", "Bonsoir.");
    descente.moments.araigneeVue = true;
}


function surLAppuiDuRez() {

    lancerDialogue([
        { texte: "Derrière la vitre, une lumière bleue qui change sans arrêt. Quelqu'un, là-dedans, ne dort pas non plus." },
        { texte: "D'en haut, on n'entend plus rien. Le vent a pris toutes les voix." },
        { qui: "bob", texte: "Samsam. Tu es toujours là ?" },
        { texte: "Bob tire un coup sec sur le pyjama." },
        { texte: "Le pyjama tire un coup sec en retour." },
        { qui: "bob", texte: "D'accord." },
    ]);
}


function leBoutDeLaCorde() {

    if (typeof jouerMorceau === "function") jouerMorceau("mystique");

    lancerDialogue([
        { texte: "La corde s'arrête. En dessous, il n'y a plus que le bout du pyjama, qui pend, et l'herbe qui bouge toute seule." },
        { qui: "bob", texte: "Il manque un bout." },
        { texte: "Le nœud de Doudou est tout en haut. Il ne s'ouvrira pas : c'est pour ça qu'il l'a fait comme ça." },
        { qui: "bob", texte: "Merci, Doudou." },
    ], function () {
        descente.moments.pretALacher = true;
        memoire.drapeaux.descente_moments = descente.moments;
        sauvegarder();
        // Le clic qui ferme le dialogue ne doit pas être celui qui
        // lui fait lâcher la corde.
        descente.reprise = time() + 0.6;
    });
}


// Le seul moment de l'acte où un appui fait autre chose que
// descendre : le bout de la corde est atteint, il faut lâcher.
function peutLacher() {
    return descente.moments.pretALacher
        && descente.etat === "corde"
        && time() > descente.reprise
        && !dialogueEnCours()
        && !jeuEnCours();
}


function toucherLeSol() {

    descente.secousse = 0.5;
    descente.fini = true;
    noter("descente_finie");
    memoire.acte = 4;
    sauvegarder();

    const grille = surUnSoupirail(descente.x);

    if (grille) {
        if (typeof sonSynthe === "function") sonSynthe("fracas", 1);
        if (typeof shake === "function") shake(16);
    } else {
        if (typeof jouerSon === "function") jouerSon("atterrissage", { volume: 0.8 });
    }

    lancerDialogue(finDeLaDescente(grille), function () {
        afficherCarton("Fin de l'acte III", "La mouette n'est plus très loin.");
    });
}


function finDeLaDescente(grille) {

    const debut = grille
        ? [
            { texte: "Bob tombe sur une grille de cave. Le bruit fait le tour de la cour, tape contre le mur d'en face, et revient." },
            { texte: "Quelque part, une fenêtre s'allume. Puis se rallonge en un carré jaune sur l'herbe. Puis s'éteint." },
            { qui: "bob", texte: "..." },
            { qui: "bob", texte: "Pardon." },
        ]
        : [
            { texte: "L'herbe se referme au-dessus de lui sans faire de bruit. Elle est trempée, et elle sent la terre." },
            { texte: "Bob se relève. Les brins lui passent au-dessus de la tête." },
        ];

    return debut.concat([
        { texte: "Tout en haut, très loin, quatre petites têtes dépassent d'un rectangle jaune." },
        { qui: "bluey", texte: "IL EST EN BAS !! IL EST EN BAS !!" },
        { qui: "cakey", texte: "Bob ! On te voit !" },
        { texte: "D'ici, la fenêtre de Klara n'est qu'une tache jaune de la taille d'un ongle.", quand: regarderVersLeHaut },
        { texte: "Bob lève une patte. Il ne sait pas s'ils le voient." },
        { texte: "Au fond de la cour, très haut dans un arbre, quelque chose bouge et se rendort.", quand: sonner("mouette") },
        { qui: "bob", texte: "Rosy." },
    ]);
}


function regarderVersLeHaut() {
    descente.regardeEnHaut = time();
}


/* ============================================================
   LES VOIX D'EN HAUT
   ============================================================
   Elles ne coupent pas le jeu : on continue de descendre pendant
   qu'on se fait crier dessus. Plus Bob est bas, plus elles sont
   pâles — jusqu'à ne plus arriver du tout.
   ============================================================ */
function crierDEnHaut(qui, texte) {
    descente.voix.push({ qui: qui, texte: texte, jusqua: time() + 3.6 });
    if (descente.voix.length > 3) descente.voix.shift();
    if (typeof demarrerBavardage === "function" && qui !== "bob") {
        demarrerBavardage(qui);
        wait(0.35, arreterBavardage);
    }
}


/* ============================================================
   LE DESSIN
   ============================================================ */
function dessinerLeMurDeLaFacade() {
    drawSprite({ sprite: "facade_mur", pos: vec2(0, 0), width: FACADE.L, height: FACADE.H });
}


// Une flaque de lumière molle : des cercles de plus en plus
// grands et de plus en plus transparents.
function flaqueDeLumiere(x, y, rayon, couleur, force) {
    for (let i = 6; i >= 1; i--) {
        drawCircle({
            pos: vec2(x, y),
            radius: rayon * (i / 6),
            color: rgb(couleur[0], couleur[1], couleur[2]),
            opacity: force * 0.05 * (1 - i / 8),
        });
    }
}


function dessinerLesLumieresDeLaFacade() {

    // Le phare de Klara, sur son appui. On ne dessine pas la
    // veilleuse (Evan : elle ne rendait pas bien) : juste sa lumière.
    const p = FACADE.ancre;
    flaqueDeLumiere(p.x - 6, p.y + 2, 130, [255, 196, 96], 1.1 + Math.sin(time() * 1.7) * 0.06);
    drawCircle({ pos: vec2(p.x - 6, p.y - 2), radius: 3.5, color: rgb(255, 232, 168), opacity: 0.9 });

    // La télé du rez-de-chaussée, derrière la vitre.
    const travee = FACADE.travees[FACADE.traveeDeKlara];
    const bleu = 0.5 + Math.sin(time() * 5.3) * 0.2 + Math.sin(time() * 2.1) * 0.15;
    drawRect({
        pos: vec2(travee.x + 6, FACADE.baies[2] + 6),
        width: travee.l - 12,
        height: FACADE.hauteurBaie - 15,
        color: rgb(96, 128, 210),
        opacity: 0.12 + bleu * 0.1,
    });

    // La fenêtre du voisin du 1er, quand elle s'allume.
    const f = descente.fenetre;
    if (f.allumee) {
        const age = time() - f.allumee;
        const k = Math.min(1, age / 0.25) * (f.jusqua ? Math.min(1, (f.jusqua - time()) / 0.5) : 0);
        drawRect({
            pos: vec2(travee.x + 4, FACADE.baies[1] + 4),
            width: travee.l - 8,
            height: FACADE.hauteurBaie - 11,
            color: rgb(255, 214, 150),
            opacity: 0.62 * Math.max(0, k),
        });
        flaqueDeLumiere(travee.x + travee.l / 2, FACADE.baies[1] + 50, 150, [255, 208, 140], Math.max(0, k));

        // L'ombre de quelqu'un qui traverse la pièce.
        if (age > 1.6 && age < 3.4) {
            drawRect({
                pos: vec2(travee.x + 20 + (age - 1.6) * 40, FACADE.baies[1] + 10),
                width: 34,
                height: FACADE.hauteurBaie - 24,
                color: rgb(40, 30, 24),
                opacity: 0.5,
            });
        }
    }
}


// La fenêtre de Klara est la seule qui soit ouverte : c'est par
// là que Bob est sorti. On voit le noir de la pièce, la lumière
// chaude qui en sort, et ceux qui regardent.
function dessinerLaFenetreDeKlara() {

    const travee = FACADE.travees[FACADE.traveeDeKlara];
    const x = travee.x + 6;
    const y = FACADE.baies[0] + 6;
    const l = travee.l - 12;
    const h = FACADE.hauteurBaie - 15;

    drawRect({ pos: vec2(x, y), width: l, height: h, color: rgb(22, 18, 28) });
    drawRect({ pos: vec2(x, y), width: l, height: h, color: rgb(255, 198, 120), opacity: 0.16 });

    // Les battants, poussés contre le mur.
    drawRect({ pos: vec2(x - 5, y), width: 6, height: h, color: rgb(138, 136, 130) });
    drawRect({ pos: vec2(x + l - 1, y), width: 6, height: h, color: rgb(138, 136, 130) });

    // Ceux qui regardent. Ils sont loin, et de dos on ne verrait
    // rien : on les dessine de face, petits, dans l'encadrement.
    const monde = [
        { cle: "doudou", dx: 0.18, taille: 30 },
        { cle: "cakey", dx: 0.44, taille: 28 },
        { cle: "bluey", dx: 0.66, taille: 22 },
        { cle: "fraisy", dx: 0.84, taille: 20 },
    ];
    monde.forEach(function (p, i) {
        const bouge = Math.sin(time() * 2 + i) * 1.2;
        drawSprite({
            sprite: apparenceDe(p.cle),
            frame: 0,
            pos: vec2(x + l * p.dx, y + h - 2 + bouge),
            width: p.taille,
            height: p.taille,
            anchor: "bot",
            opacity: 0.92,
        });
    });
}


function dessinerLaFuite() {

    const f = descente.fuite;
    if (!f.jusqua || time() > f.jusqua) return;

    const g = FACADE.gouttiere;
    const k = Math.min(1, (f.jusqua - time()) / 0.3);
    for (let i = 0; i < 26; i++) {
        const a = i / 26;
        const x = g.x + g.l + a * 150;
        const y = 634 + a * a * 26 + Math.sin(time() * 20 + i) * 2;
        drawRect({
            pos: vec2(x, y),
            width: 5,
            height: 2,
            color: rgb(150, 180, 210),
            opacity: 0.5 * k * (1 - a * 0.5),
        });
    }
}


// La corde : le pyjama de Samsam, gris, avec ses oreilles de
// lapin imprimées tout du long (voir le départ, acte2.js).
function dessinerLaCordeDeSamsam() {

    if (descente.etat === "chute" || descente.etat === "sol") {
        dessinerLeBoutQuiPend();
        return;
    }

    const a = FACADE.ancre;
    const mains = vec2(
        descente.x - Math.sin(descente.angle) * 18,
        descente.y - Math.cos(descente.angle) * 18
    );

    drawLine({ p1: vec2(a.x, a.y), p2: mains, width: 3.2, color: rgb(104, 106, 116) });
    drawLine({
        p1: vec2(a.x - 0.6, a.y), p2: vec2(mains.x - 0.6, mains.y),
        width: 1, color: rgb(142, 144, 154), opacity: 0.7,
    });

    // Les oreilles, une tous les vingt-six pixels.
    const total = mains.dist(vec2(a.x, a.y));
    const dir = mains.sub(vec2(a.x, a.y)).unit();
    const cote = vec2(-dir.y, dir.x);
    for (let d = 22; d < total - 6; d += 26) {
        const p = vec2(a.x, a.y).add(dir.scale(d));
        [-1, 1].forEach(function (s) {
            drawEllipse({
                pos: p.add(cote.scale(s * 2.4)),
                radiusX: 1.1, radiusY: 2.6,
                angle: Math.atan2(dir.y, dir.x) * 180 / Math.PI + s * 22,
                color: rgb(206, 206, 212), opacity: 0.75,
            });
        });
    }

    // Le nœud de Doudou, à la poignée.
    drawCircle({ pos: vec2(a.x, a.y), radius: 4.5, color: rgb(120, 122, 132) });
    drawCircle({ pos: vec2(a.x - 1, a.y - 1), radius: 2, color: rgb(158, 160, 168) });
}


function dessinerLeBoutQuiPend() {
    const a = FACADE.ancre;
    const bout = a.y + CORDE.longueur;
    drawLine({ p1: vec2(a.x, a.y), p2: vec2(a.x, bout), width: 3.2, color: rgb(104, 106, 116) });
    for (let d = 22; d < CORDE.longueur - 6; d += 26) {
        [-1, 1].forEach(function (s) {
            drawEllipse({
                pos: vec2(a.x + s * 2.4, a.y + d),
                radiusX: 1.1, radiusY: 2.6, angle: s * 22,
                color: rgb(206, 206, 212), opacity: 0.75,
            });
        });
    }
}


function dessinerBobDehors() {

    const tombe = descente.etat === "chute";
    const surAppui = descente.etat === "appui";

    let frame = 1;                       // de dos : il regarde le mur
    let flip = false;

    if (tombe) frame = 0;                // de face : il tombe
    else if (surAppui) {
        const ordre = ceQueLeJoueurDemande();
        if (ordre.cote !== 0) frame = 12 + Math.floor(time() * 8) % 4;
        else frame = 2;
        flip = descente.versLaDroite;
    } else if (descente.etat === "sol") {
        frame = 0;
    }

    const angle = surAppui || tombe || descente.etat === "sol"
        ? (tombe ? Math.sin(time() * 12) * 6 : 0)
        : -descente.angle * 180 / Math.PI;

    // Son ombre sur le mur, décalée : il y a une lumière en haut.
    drawSprite({
        sprite: "bob", frame: frame,
        pos: vec2(descente.x + 5, descente.y + 4),
        width: CORDE.hauteurBob, height: CORDE.hauteurBob,
        anchor: "center", angle: angle, flipX: flip,
        color: rgb(0, 0, 0), opacity: 0.32,
    });

    drawSprite({
        sprite: "bob", frame: frame,
        pos: vec2(descente.x, descente.y),
        width: CORDE.hauteurBob, height: CORDE.hauteurBob,
        anchor: "center", angle: angle, flipX: flip,
    });

    // Trempé : il goutte.
    if (time() < descente.trempe) {
        for (let i = 0; i < 3; i++) {
            const k = (time() * 1.6 + i * 0.33) % 1;
            drawRect({
                pos: vec2(descente.x - 8 + i * 8, descente.y + 18 + k * 26),
                width: 2, height: 5,
                color: rgb(150, 180, 210), opacity: 0.6 * (1 - k),
            });
        }
    }
}


/* ------------------------------------------------------------
   LA PLUIE
   ------------------------------------------------------------
   Elle est fine, et elle penche avec le vent. C'est elle qui dit
   au joueur qu'une rafale arrive, avant même le bruit.
   ------------------------------------------------------------ */
function dessinerLaPluie() {

    const zoom = zoomDeLaFacade();
    const cam = getCamPos();
    const demiL = width() / (2 * zoom);
    const demiH = height() / (2 * zoom);
    const penche = descente.vent.force * 0.055;
    const t = time();

    for (let i = 0; i < 110; i++) {
        const v = 330 + (i % 7) * 60;
        const x = ((i * 137.5) % (demiL * 2)) + cam.x - demiL;
        const y = ((t * v + i * 53) % (demiH * 2 + 60)) + cam.y - demiH - 30;
        drawLine({
            p1: vec2(x, y),
            p2: vec2(x + penche * 0.9, y + 13),
            width: 1,
            color: rgb(170, 190, 215),
            opacity: 0.16 + (i % 3) * 0.05,
        });
    }
}


/* ============================================================
   L'INTERFACE
   ============================================================
   Des objets fixés à l'écran, comme dans les petits jeux : la
   ligne des commandes, l'avertissement de rafale, les voix d'en
   haut, la jauge de vitesse et celle de la hauteur.
   ============================================================ */
function installerLInterfaceDeLaDescente() {

    const ui = {};

    ui.aide = add([
        text("", { size: 15, width: 420, align: "center" }),
        pos(0, 0), anchor("center"), color(...COULEUR_CREME),
        opacity(0), fixed(), z(Z_INTERFACE),
    ]);

    ui.rafale = add([
        text("", { size: 20 }),
        pos(0, 0), anchor("center"), color(...COULEUR_OR),
        opacity(0), fixed(), z(Z_INTERFACE),
    ]);

    ui.voix = add([
        text("", { size: 14, width: 300, align: "left" }),
        pos(0, 0), anchor("topleft"), color(...COULEUR_CREME),
        opacity(0), fixed(), z(Z_INTERFACE),
    ]);

    ui.jauge = add([
        rect(8, 120), pos(0, 0), anchor("botleft"),
        color(200, 200, 210), opacity(0), fixed(), z(Z_INTERFACE),
    ]);
    ui.jaugeFond = add([
        rect(8, 120), pos(0, 0), anchor("botleft"),
        color(0, 0, 0), opacity(0.3), fixed(), z(Z_INTERFACE - 1),
    ]);
    ui.hauteur = add([
        rect(4, 4), pos(0, 0), anchor("center"),
        color(...COULEUR_OR), opacity(0), fixed(), z(Z_INTERFACE),
    ]);
    ui.hauteurFond = add([
        rect(2, 120), pos(0, 0), anchor("top"),
        color(220, 220, 230), opacity(0.25), fixed(), z(Z_INTERFACE - 1),
    ]);

    descente.ui = ui;
}


function majLInterfaceDeLaDescente() {

    const ui = descente.ui;
    if (!ui) return;

    const marge = 22;
    const cache = dialogueEnCours() || jeuEnCours() || descente.fini;

    // ---- la ligne des commandes ----
    const reste = descente.aide - time();
    ui.aide.text = pointeurEstTactile()
        ? "Pose le doigt sous Bob : la corde file. Plus tu le tiens loin, plus vite ça descend."
        : "Tiens le clic sous Bob (ou ↓) : la corde file. ← → pour te balancer. Lâche pour te coller au mur.";
    ui.aide.textSize = echelleInterface() - 1;
    ui.aide.width = Math.min(width() - 60, 460);
    ui.aide.pos = vec2(width() / 2, height() - 44);
    ui.aide.opacity = cache ? 0 : Math.max(0, Math.min(1, reste / 2)) * 0.85;

    // ---- la rafale (et, tout à la fin, le mot qu'on attend) ----
    const fige = (rafaleEnCours() || descente.fenetre.allumee) && !peutLacher();
    let motRafale = "";
    if (peutLacher()) motRafale = pointeurEstTactile() ? "TOUCHER POUR LÂCHER" : "CLIC OU ESPACE : LÂCHER";
    else if (descente.fenetre.allumee) motRafale = "NE BOUGE PLUS";
    else if (rafaleAnnoncee()) motRafale = "UNE RAFALE ARRIVE";
    else if (rafaleEnCours()) motRafale = "NE BOUGE PLUS";
    ui.rafale.text = motRafale;
    ui.rafale.textSize = Math.round(echelleInterface() * 1.15);
    ui.rafale.pos = vec2(width() / 2, 64);
    ui.rafale.color = fige ? rgb(232, 120, 110) : rgb(...COULEUR_OR);
    ui.rafale.opacity = cache || !motRafale ? 0 : 0.7 + Math.sin(time() * 9) * 0.3;

    // ---- les voix d'en haut ----
    const vivantes = descente.voix.filter(function (v) { return time() < v.jusqua; });
    descente.voix = vivantes;
    if (vivantes.length) {
        const v = vivantes[vivantes.length - 1];
        const nom = PERSONNAGES[v.qui] ? PERSONNAGES[v.qui].nom : "";
        ui.voix.text = nom + " — " + v.texte;
        ui.voix.color = rgb(...(PERSONNAGES[v.qui]
            ? eclaircir(PERSONNAGES[v.qui].couleurPlaceholder, 0.35)
            : COULEUR_CREME));
        ui.voix.textSize = echelleInterface() - 2;
        ui.voix.width = Math.min(320, width() - marge * 2);
        ui.voix.pos = vec2(marge, height() * 0.3);
        ui.voix.opacity = cache ? 0 : Math.min(1, (v.jusqua - time()) / 0.6) * 0.9;
    } else {
        ui.voix.opacity = 0;
    }

    // ---- la jauge de vitesse, à droite ----
    const hauteurJauge = Math.min(180, height() * 0.3);
    const xJauge = width() - marge;
    const yJauge = height() / 2 + hauteurJauge / 2;
    const part = Math.max(0, descente.vitesse) / CORDE.vitesseMax;
    const trop = descente.vitesse > CORDE.lent;

    ui.jaugeFond.width = 8;
    ui.jaugeFond.height = hauteurJauge;
    ui.jaugeFond.pos = vec2(xJauge, yJauge);
    ui.jaugeFond.opacity = cache ? 0 : 0.3;

    ui.jauge.width = 8;
    ui.jauge.height = Math.max(1, hauteurJauge * Math.min(1, part));
    ui.jauge.pos = vec2(xJauge, yJauge);
    ui.jauge.color = trop ? rgb(232, 150, 96) : rgb(190, 210, 200);
    ui.jauge.opacity = cache ? 0 : 0.8;

    // ---- la hauteur, à gauche ----
    const hautTrait = height() * 0.25;
    const basTrait = height() * 0.75;
    const k = (descente.y - FACADE.ancre.y) / (FACADE.herbe - FACADE.ancre.y);

    ui.hauteurFond.width = 2;
    ui.hauteurFond.height = basTrait - hautTrait;
    ui.hauteurFond.pos = vec2(marge, hautTrait);
    ui.hauteurFond.opacity = cache ? 0 : 0.22;

    ui.hauteur.width = 10;
    ui.hauteur.height = 3;
    ui.hauteur.pos = vec2(marge + 1, hautTrait + (basTrait - hautTrait) * Math.min(1, Math.max(0, k)));
    ui.hauteur.opacity = cache ? 0 : 0.85;
}


function pointeurEstTactile() {
    return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
}


/* ============================================================
   LE DOIGT (ou la souris)
   ============================================================ */
function brancherLeDoigt() {

    const d = descente.doigt;

    const poser = function (position, id) {
        d.enfonce = true;
        d.position = position;
        d.id = id;
        if (peutLacher()) lacherLaCorde();
    };
    const bouger = function (position, id) {
        if (d.enfonce && id !== d.id) return;
        d.position = position;
    };
    const lever = function () { d.enfonce = false; };

    onMousePress(function () { poser(mousePos(), "souris"); });
    onMouseMove(function () { bouger(mousePos(), "souris"); });
    onMouseRelease(lever);
    onTouchStart(function (p, t) { poser(p, t ? t.identifier : 0); });
    onTouchMove(function (p, t) { bouger(p, t ? t.identifier : 0); });
    onTouchEnd(lever);

    onKeyPress("space", function () {
        if (peutLacher()) lacherLaCorde();
    });
}


function doigtTenu() {
    const d = descente.doigt;
    if (!d.enfonce || !d.position) return null;
    if (dialogueEnCours() || jeuEnCours()) return null;
    return d.position;
}


/* ============================================================
   LE SON DE LA FAÇADE
   ============================================================
   Dehors, le vent n'est plus un filet qui passe par la fenêtre :
   c'est le fond de tout l'acte. Il monte avec les rafales.
   ============================================================ */
function majLeSonDeLaFacade() {

    if (typeof volumeDeBoucle !== "function" || !son.ctx) return;

    const fort = rafaleEnCours() ? 1 : 0.45;
    volumeDeBoucle("vent", fort);
    volumeDeBoucle("nuit", 0.4);
}


/* ------------------------------------------------------------
   LE JET DE LA GOUTTIÈRE, QUI REPREND TOUTES LES TROIS SECONDES
   ------------------------------------------------------------ */
function majLaFuite() {

    const f = descente.fuite;
    if (!f.prochaine) return;

    if (time() > f.prochaine) {
        f.jusqua = time() + 1.1;
        f.prochaine = time() + 3.4;
        if (typeof sonSynthe === "function") sonSynthe("tinte", 0.25);
    }
}


/* ============================================================
   L'ENTRÉE DANS L'ACTE, DEPUIS L'ACTE II
   ============================================================ */
function commencerActeIII() {
    memoire.acte = 3;
    noter("acte3");
    delete memoire.drapeaux.descente_appui;
    delete memoire.drapeaux.descente_moments;
    sauvegarder();
    go("facade");
}


// octobre.html?acte3 : on saute les deux premiers actes.
function raccourciActeIII() {

    if (typeof location === "undefined" || !/[?&]acte3\b/.test(location.search)) return false;

    if (typeof raccourciActeII === "function") {
        // les mêmes drapeaux que l'acte II, plus tout ce que l'acte II donne
        memoire.drapeaux = {};
        [
            "ouverture", "fenetre_vue", "bluey_lance", "bluey_1", "bluey_2", "bluey_3",
            "bluey_ok", "miroir", "cakey_bonjour", "cakey_ok", "fraisy_faim", "fraisy_ok",
            "samsam_trouve", "samsam_couvert", "samsam_ok", "bluey_retour", "verite",
            "cakey_secret", "petale", "moin", "acte2",
            "averti_bruit", "arme", "bouclier", "casque", "jus_ouvert",
            "veilleuse_debranchee", "rallonge", "phare", "depart", "acte3",
        ].forEach(function (d) { memoire.drapeaux[d] = true; });
    }
    memoire.objets = ["petale", "baguette", "couvercle", "de"];
    memoire.acte = 3;
    sauvegarder();

    try { history.replaceState(null, "", location.pathname); } catch (e) { /* tant pis */ }
    console.log("%cActe III : partie préparée (?acte3).", "color:#c9a876;font-weight:bold");
    return true;
}
