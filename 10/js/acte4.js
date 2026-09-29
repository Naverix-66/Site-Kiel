/* ============================================================
   ACTE IV — LA MOUETTE
   ============================================================
   Bob est en bas de tout, dans l'herbe trempée, avec une baguette
   qui n'est pas une épée. Le nid est en haut du grand arbre, et
   Rosy est dedans.

   ------------------------------------------------------------
   UNE SEULE TOUCHE : ESPACE
   ------------------------------------------------------------
   Evan : « je savais pas que bob pouvait se protéger, on devrait
   mettre une touche unique. » Il avait raison deux fois : une
   protection sans touche à elle, personne ne devine qu'elle
   existe.

       ← →  (ou Q/D, ou A/D, ou le joystick)   marcher
       ESPACE tenu                             lever le couvercle
       ESPACE appuyé quand le bouton s'allume  frapper

   ESPACE ne fait jamais deux choses en même temps : dès qu'un
   coup est possible, le couvercle ne se lève plus et le bouton
   change de mot. Le joueur n'a donc jamais à choisir une touche,
   seulement un MOMENT. (E et ENTRÉE font la même chose en
   silence — c'est déjà le cas partout ailleurs dans le jeu.)

   ------------------------------------------------------------
   ET SURTOUT : ON VOIT OÙ ÇA VA TOMBER
   ------------------------------------------------------------
   Evan : « j'ai pas bien compris le combat, ce que je dois faire,
   c'est tellement vague. » Le combat était juste, mais invisible.
   Alors tout ce qui va arriver est maintenant DESSINÉ AU SOL :

     une colonne de lumière + un cercle dans l'herbe   là où elle
                                                       va tomber
     le cercle est doré    Bob n'est pas dedans
     le cercle est rouge   Bob est dedans, et il va se faire
                           toucher s'il ne bouge pas
     un arc rouge devant elle, au sol   la portée de son coup
                                        d'aile (phase 3)

   Le cercle de la phase 1 suit Bob EN RETARD. C'est tout le
   combat : elle vise là où il était. On n'a pas besoin de
   l'écrire, il suffit de le montrer une fois.

   ------------------------------------------------------------
   CE QUI TIENT TOUT L'ACTE
   ------------------------------------------------------------
   1. L'ARBRE NE SE GRIMPE PAS. On le montre en trente secondes,
      au début, et on ne revient jamais dessus. Bob ne monte pas :
      c'est ELLE qui l'emporte, et c'est en se faisant emporter
      qu'il arrive enfin là-haut.

   2. LE PYJAMA DE SAMSAM PEND CONTRE LE MUR, dans le décor,
      quarante-quatre pixels au-dessus de sa tête, pendant tout le
      combat. Personne ne le montre du doigt. Il servira à la
      dernière seconde de l'acte.

   3. SES AFFAIRES LE QUITTENT UNE PAR UNE, et c'est le calendrier
      de l'acte : le dé (il brille, elle le vise), puis le
      couvercle, puis la baguette qui casse. Tout monte dans le
      nid : il retrouve ses affaires avant de la retrouver, elle.

   4. LE PÉTALE NE SERT À RIEN. Jusqu'au moment où tout le reste a
      cassé.

   5. JAMAIS DE MORT. Le couvercle bloque TOUJOURS. Rater coûte du
      terrain, du temps, et le ciel s'éclaircit d'un cran — on
      croit d'abord à un compte à rebours, et on finit par
      comprendre que le jour qui se lève est la bonne nouvelle.

   ------------------------------------------------------------
   LES QUATRE PHASES, ET LEUR VERBE
   ------------------------------------------------------------
   1  L'OMBRE      elle tombe là où tu étais.     → esquiver
                   Le couvercle bloque, mais il est LOURD.
   2  LE PHARE     elle va vers ce qui brille.    → sortir de la
                   lumière — ou lever le couvercle exprès, pour
                   l'attirer sur soi et la renvoyer au sol.
   3  AU SOL       elle est énorme, et à terre.   → lire son coup
                   d'aile, passer derrière, frapper. Trois coups.
   4  ELLE L'EMPORTE                              → tenir bon.

   ------------------------------------------------------------
   POUR TESTER
       octobre.html?acte4      le début de l'acte
       octobre.html?phare      directement la phase 2
       octobre.html?ausol      directement la phase 3

   ------------------------------------------------------------
   LES RÈGLES D'ÉCRITURE NE CHANGENT PAS (voir acte1.js).
   ============================================================ */


/* Les deux objets que l'acte ajoute. La baguette cassée reprend
   l'icône de la baguette : c'est le même bout de bois, en plus
   court et en plus pointu. */
OBJETS.baguette_cassee = { nom: "Une baguette cassée (pointue)" };
ICONES_OBJETS.baguette_cassee = ICONES_OBJETS.baguette;


const COMBAT = {

    hauteurBob: 56,       // la case du sprite ; sa vraie hauteur ≈ 43
    pieds: 24,
    marche: 78,           // px par seconde
    rayon: 14,            // demi-largeur de son corps

    /* ---- LE COUVERCLE ----
       Il bloque TOUJOURS, sans aucune adresse : Klara ne peut pas
       se sentir mauvaise. Deux nuances, et c'est tout le sel :
         - levé dans la dernière demi-seconde, il fait DONG au lieu
           de CLONG, et elle s'écrase au sol ;
         - il est LOURD. Bob ne le tient qu'une seconde et demie,
           après quoi ses bras lâchent. Sans ça, se protéger serait
           gratuit, et il n'y aurait aucune raison de jamais le
           baisser — donc aucun jeu. */
    parade: 0.85,
    couvercleHaut: 30,
    couvercleTenu: 2.0,
    couvercleRepos: 0.9,

    /* ---- LE PIQUÉ ----
       Annoncé par Bluey, puis elle se fige en l'air, puis elle
       tombe. Elle ne corrige JAMAIS sa trajectoire en vol. */
    annonce: 0.55,
    fige: 0.85,
    altitude: 190,        // la hauteur où elle se fige (ligne des pattes)
    // ⚠️ Mesuré : elle vise où Bob était il y a VISEILYA secondes,
    // donc marcher sans s'arrêter le met VISEILYA x marche = 43 px
    // à côté. Il faut que ça dépasse franchement le rayon de
    // contact (22 px), sinon le joueur qui esquive se fait quand
    // même toucher, et l'esquive n'existe pas.
    viseIlYA: 0.55,
    vitessePique: 460,
    sonnee: 2.4,          // le temps qu'elle reste au sol après un DONG
    portee: 30,           // la portée de Bob quand il frappe
    reculBob: 130,        // ce qu'un coup lui coûte, en px
    raideur: 0.85,        // le temps où il ne répond plus après

    /* ---- LA LAMPE (phase 2) ----
       La veilleuse de Klara, descendue au bout de la rallonge. Son
       faisceau balaie l'herbe : c'est LUI qui est dangereux, pas
       la lampe. */
    /* ⚠️ Evan : « la lampe ne doit pas pendre comme ça au milieu du
       vide ». Elle était accrochée à rien, avec un fil en diagonale
       qui traversait tout l'écran. Maintenant la rallonge sort du
       coin de la fenêtre, passe par-dessus l'appui, et la lampe pend
       À LA VERTICALE contre le mur, comme une baladeuse de chantier.
       C'est son FAISCEAU qui balaie la cour, pas elle. */
    lampe: { ancreX: 112, ancreY: 168, fil: 132 },
    cordon: { x: 95, y: 112 },     // le coin bas-droit de la fenêtre
    rayonLumiere: 58,
    periodeFaisceau: 11,           // secondes pour un aller-retour
    amplitudeFaisceau: 250,
    piquesDuPhare: 4,              // après quoi elle s'en prend à la lampe

    /* ---- AU SOL (phase 3) ----
       Elle marche moins vite que Bob : il peut toujours reculer.
       Mais la cour a deux murs, et elle finit par l'y coller. La
       seule sortie, c'est de passer DERRIÈRE elle — et elle met du
       temps à se retourner. */
    marcheOiseau: 54,
    approche: 46,         // à quelle distance elle s'arrête pour crier
    porteeAile: 68,       // la portée de son coup d'aile
    fente: 18,            // ce qu'elle gagne en se fendant dessus
    // ⚠️ Evan : « impossible de passer derrière la mouette, elle
    // frappe un peu trop vite ». Son cri dure maintenant 0,85 s au
    // lieu de 0,55 : à 78 px/s, ça laisse 66 px pour la contourner,
    // soit largement de quoi passer son aile de 68. Et elle met un
    // tiers de temps en plus à se retourner derrière soi.
    menace: 0.85,         // le cri, avant le coup : le temps de réagir
    balaie: 0.26,
    titube: 1.3,          // son déséquilibre — la fenêtre pour frapper
    tourne: 0.55,         // le temps qu'elle met à faire demi-tour
    coupsPourLaFin: 3,    // trois coups de baguette dans tout l'acte
};


const combat = {

    phase: 0,             // 0 l'ouverture, 1 l'ombre, 2 le phare,
                          // 3 au sol, 4 elle l'emporte, 5 le retour
    etat: "attente",      // attente | jeu | scene | fin
    gel: null,            // les comptes à rebours mis en pause

    bob: {
        x: 120, y: COUR.sol, vers: 1, marche: false,
        couvercle: false, depuis: 0, fatigue: 0, repos: 0,
        sonne: 0, souvenirs: [],
    },

    oiseau: {
        x: COUR.nid.x, y: COUR.nid.y + 34,
        etat: "nid",      // nid | annonce | fige | pique | sol | marche
                          // remonte | avance | tourne | menace | balaie
                          // titube | emporte
        jusqua: 0,
        cible: 0,         // le point verrouillé de son piqué
        vx: 0, vy: 0,
        vers: -1,         // -1 = elle regarde à gauche
        coups: 0,         // coups de baguette reçus (phase 3)
        porte: null,      // ce qu'elle a dans le bec : "de" | "couvercle"
    },

    piques: 0,            // piqués de la phase 1
    piquesPhare: 0,       // piqués de la phase 2
    dong: 0,
    voix: [],
    secousse: 0,
    aube: 0,              // 0 = nuit noire, 1 = le jour se lève
    fenetre: 1,           // la lumière de la fenêtre de Klara (0 = éteinte)
    lampe: { balance: 0, depuis: 0 },   // son balancement quand on tape dedans
    lampeTombee: null,    // { x } dès que la rallonge casse
    scene: null,          // la scène animée en cours (voir jouerLaScene)
    plumes: [],
    moments: {},
    bouton: { tenu: false, id: null, centre: vec2(0, 0), verbe: "", chaud: 0 },
    aide: 0,              // jusqu'à quand la ligne d'aide reste affichée
    retour: null,         // l'état du final (phase 5)
    ui: null,
};


/* ============================================================
   LA SCÈNE
   ============================================================ */
scene("cour", function () {

    oublierLeDialogue();
    charger();

    // Samsam est sans pyjama depuis la fin de l'acte I : son pyjama
    // est la corde, et elle pend sur le mur, dans le décor.
    APPARENCES.samsam = "samsam_sans_pyjama";
    preparerLesSons();

    // La liste de ses affaires passe à DROITE : c'est elle qu'on
    // regarde se vider pendant tout l'acte, mais pas au prix de la
    // fenêtre de Klara, qui est dans le coin haut-gauche.
    inventaire.aDroite = true;
    creerObjectif();
    preparerInventaire();

    // Le joystick du reste du jeu, en bas à gauche : la cour n'a
    // aucune raison d'avoir ses propres commandes tactiles.
    creerJoystick();

    installerLInterfaceDuCombat();
    brancherLesCommandesDeLaCour();
    remettreLeCombat();

    onUpdate(function () {
        majLeSonDeLaCour();
        if (combat.etat === "jeu" && !dialogueEnCours() && !jeuEnCours()) {
            majBob();
            majLOiseau();
            majLesMomentsDuCombat();
        }
        // ⚠️ Ces trois-là tournent MÊME PENDANT un dialogue. Evan :
        // « on a du mal à comprendre juste avec le texte ». Alors le
        // décor bouge pendant qu'on lit, et le texte ne fait plus que
        // commenter ce qu'on est en train de voir.
        if (combat.etat === "saisie") majLaSaisie();
        if (combat.etat === "envol") majLEnvol();
        if (combat.etat === "retour") majLeRetour();
        majLaScene();
        majLaLampeQuiPend();
        majLesPlumes();
        majLaCameraDeLaCour();
        majLInterfaceDuCombat();
    });

    onDraw(function () {
        if (combat.cadre) {
            remplirAutourDeLArene(combat.cadre, COUR.L, COUR.H,
                rgb(20, 24, 38), rgb(12, 16, 14), "cour_fond");
        }
        drawSprite({ sprite: "cour_fond", pos: vec2(0, 0), width: COUR.L, height: COUR.H });
        dessinerLaFenetreDeLoin();
        dessinerLAube();
        dessinerLaLampe();
        dessinerLaMenace();
        dessinerLOiseau();
        dessinerCeQuElleEmporte();
        dessinerBobDansLaCour();
        dessinerLesPlumes();
        dessinerLaPluieDeLaCour();
        dessinerLeVoileDuRetour();
    });

    ouvrirLaCour();
});


/* ------------------------------------------------------------
   ouvrirLaCour() — par où on entre dans la scène
   ------------------------------------------------------------
   Trois portes : la première fois (le carton + l'ouverture), le
   retour du nid (le final), et le simple rechargement de page en
   pleine bagarre.
   ------------------------------------------------------------ */
function ouvrirLaCour() {

    if (combat.phase >= 5) {
        commencerLeRetour();
        return;
    }

    if (!saitQue("cour_commencee")) {
        afficherCarton("Acte IV", "La mouette", function () {
            noter("cour_commencee");
            lOuvertureDeLaCour();
        });
        return;
    }

    combat.etat = "jeu";
    combat.aide = time() + 14;
    combat.oiseau.jusqua = time() + 3;   // une respiration avant le premier piqué
    direLaRegle();
}


// L'arène est FIXE : on ne suit plus Bob, on le regarde. Tout le
// cadre tient à l'écran, et la distance entre lui et le petit
// carré jaune se voit du début à la fin.
function majLaCameraDeLaCour() {

    // Sur grand écran, l'arène est FIXE et on la voit en entier.
    // Sur un téléphone tenu debout, elle grossit et suit Bob : voir
    // cadrerLArene() dans cour.js, qui explique pourquoi.
    const suivi = combat.etat === "retour" || combat.etat === "envol"
        ? (combat.oiseau.x + combat.bob.x) / 2
        : combat.bob.x;
    // 62 -> 496 : du haut de la fenêtre de Klara au ras du chemin.
    // Au-dessus il n'y a que du ciel, en dessous que du lierre.
    combat.cadre = cadrerLArene(COUR.L, COUR.H, suivi, 430, 62, 496);

    const s = combat.secousse > 0 ? combat.secousse : 0;
    const tremble = s > 0 ? Math.min(1, s * 3) : 0;
    setCamPos(
        combat.cadre.x + (tremble ? rand(-5, 5) * tremble : 0),
        combat.cadre.y + (tremble ? rand(-5, 5) * tremble : 0)
    );
    if (combat.secousse > 0) combat.secousse -= dt();
}


function secouer(force) {
    combat.secousse = Math.max(combat.secousse, force);
}


function remettreLeCombat() {

    combat.moments = memoire.drapeaux.combat_moments || {};
    combat.phase = memoire.drapeaux.combat_phase || 0;

    // ⚠️ TOUT remettre à zéro, et pas seulement les positions.
    // Même piège qu'à l'acte III : un compteur oublié ici, et la
    // scène rechargée se comporte comme si la partie précédente
    // continuait (elle piquait dès la première image, Bob était
    // sonné sans raison, le ciel était déjà clair).
    combat.bob.x = 120;
    combat.bob.y = COUR.sol;
    combat.bob.vers = 1;
    combat.bob.marche = false;
    combat.bob.couvercle = false;
    combat.bob.depuis = 0;
    combat.bob.fatigue = 0;
    combat.bob.repos = 0;
    combat.bob.sonne = 0;
    combat.bob.souvenirs = [];

    combat.oiseau.x = COUR.nid.x;
    combat.oiseau.y = COUR.nid.y + 34;
    combat.oiseau.etat = "nid";
    combat.oiseau.jusqua = 0;
    combat.oiseau.cible = 0;
    combat.oiseau.vx = 0;
    combat.oiseau.vy = 0;
    combat.oiseau.vers = -1;
    combat.oiseau.coups = 0;
    combat.oiseau.porte = null;

    combat.piques = 0;
    combat.piquesPhare = 0;
    combat.balayages = 0;
    combat.dong = 0;
    combat.voix = [];
    combat.secousse = 0;
    combat.plumes = [];
    combat.gel = null;
    combat.retour = null;

    // L'aube et la lampe dépendent de là où on en est.
    combat.aube = Math.min(0.75, (combat.phase - 1) * 0.16);
    combat.fenetre = combat.phase >= 2 ? 0 : 1;
    combat.lampe = { balance: 0, depuis: 0 };
    combat.lampeTombee = combat.phase >= 3 ? { x: 205 } : null;
    combat.scene = null;
    combat.bob.grimpe = false;

    combat.etat = "attente";

    // Elle se pose tout de suite si on reprend en pleine phase 3.
    if (combat.phase === 3) {
        combat.oiseau.etat = "avance";
        combat.oiseau.y = COUR.sol;
        combat.oiseau.x = Math.min(COUR.marche.droite, combat.bob.x + 165);
        combat.oiseau.vers = -1;
        combat.oiseau.jusqua = time() + 1.5;
    }
}


/* ------------------------------------------------------------
   FIGER / REPRENDRE — pour que les dialogues ne trichent pas
   ------------------------------------------------------------
   Tous les comptes à rebours du combat sont des HEURES ABSOLUES
   (time() + durée). Un dialogue de dix secondes les périme donc
   tous d'un coup : la mouette sonnée au sol repartait à la
   seconde où le joueur fermait la boîte de dialogue, et son
   étourdissement de deux secondes n'existait plus.

   On mesure ce qu'il reste au moment où on fige, et on le rend au
   moment où on reprend. Toute scène scénarisée passe par là.
   ------------------------------------------------------------ */
function figerLeCombat() {
    if (combat.etat === "scene") return;
    combat.gel = {
        oiseau: combat.oiseau.jusqua - time(),
        bob: combat.bob.sonne - time(),
        repos: combat.bob.repos - time(),
    };
    combat.etat = "scene";
}


function reprendreLeCombat() {
    const g = combat.gel || {};
    combat.oiseau.jusqua = time() + Math.max(0, g.oiseau || 0);
    combat.bob.sonne = time() + Math.max(0, g.bob || 0);
    combat.bob.repos = time() + Math.max(0, g.repos || 0);
    combat.bob.souvenirs = [];       // sinon elle vise où il était AVANT la scène
    combat.bob.fatigue = 0;
    combat.gel = null;
    combat.etat = "jeu";
    combat.aide = time() + 8;
}


/* ============================================================
   LES COMMANDES
   ============================================================
   Une direction, une action. Exactement comme dans
   l'appartement : le joueur n'apprend rien de neuf.
   ============================================================ */
function brancherLesCommandesDeLaCour() {

    const b = combat.bouton;
    b.tenu = false;
    b.id = null;

    const surLeBouton = function (p) {
        return p.dist(b.centre) < BOUTON_ACTION_RAYON * 1.5;
    };

    onTouchStart(function (p, t) {
        if (!surLeBouton(p)) return;
        b.tenu = true;
        b.id = t ? t.identifier : 0;
        appuyerDansLaCour();
    });
    onTouchEnd(function (p, t) {
        if ((t ? t.identifier : 0) === b.id) { b.tenu = false; b.id = null; }
    });

    onMousePress(function () {
        if (!surLeBouton(mousePos())) return;
        b.tenu = true;
        b.id = "souris";
        appuyerDansLaCour();
    });
    onMouseRelease(function () {
        if (b.id === "souris") { b.tenu = false; b.id = null; }
    });

    onKeyPress("space", appuyerDansLaCour);
    onKeyPress("e", appuyerDansLaCour);
    onKeyPress("enter", appuyerDansLaCour);
}


// Tenue = le couvercle. Une fonction, deux familles d'entrées.
function actionTenue() {
    if (combat.bouton.tenu) return true;
    return isKeyDown("space") || isKeyDown("e") || isKeyDown("enter");
}


// Appuyée = frapper, ou attraper la corde à la toute fin.
function appuyerDansLaCour() {
    if (dialogueEnCours() || jeuEnCours()) return;
    if (combat.etat === "retour") { attraperLaCorde(); return; }
    if (combat.etat !== "jeu") return;
    frapper();
}


/* ------------------------------------------------------------
   Ce que l'action ferait MAINTENANT. Le bouton l'écrit, et
   majBob s'en sert pour que ESPACE ne fasse jamais deux choses
   à la fois.
   ------------------------------------------------------------ */
function coupPossible() {

    if (combat.etat !== "jeu") return null;
    const o = combat.oiseau;
    const b = combat.bob;
    if (time() < b.sonne) return null;
    if (Math.abs(o.x - b.x) > COMBAT.portee + 22) return null;

    // Phase 3 : la baguette, et seulement quand elle est en
    // déséquilibre. Le bouton ne s'allume qu'à ce moment-là : c'est
    // lui qui apprend la fenêtre au joueur.
    if (combat.phase >= 3) {
        if (!aObjet("baguette")) return null;
        return o.etat === "titube" ? "baguette" : null;
    }

    // Phases 1 et 2 : elle est écrasée au sol, et Bob a encore le
    // couvercle au bras. Il lui en met un coup. Ça ne casse rien,
    // ça ne compte pas dans les trois coups de baguette, et c'est
    // la récompense du DONG.
    if (o.etat !== "sol") return null;
    if (!aObjet("couvercle")) return null;
    return "couvercle";
}


/* ============================================================
   BOB
   ============================================================ */
function majBob() {

    const b = combat.bob;

    if (time() < b.sonne) {
        b.marche = false;
        b.couvercle = false;
        b.fatigue = 0;
        return;
    }

    const direction = lireDirection().x;
    const veutFrapper = coupPossible() !== null;

    /* ---- le couvercle ----
       Il se lève tout de suite et se baisse tout de suite : c'est
       une posture, pas une animation. Mais il pèse : au bout de
       COUVERCLE_TENU secondes les bras de Bob lâchent, et il faut
       le laisser retomber avant de pouvoir le relever. */
    const veutCouvercle = actionTenue()
        && !veutFrapper
        && aObjet("couvercle")
        && time() > b.repos;

    if (veutCouvercle && !b.couvercle) {
        b.depuis = time();
        if (typeof sonSynthe === "function") sonSynthe("tok", 0.25);
    }
    b.couvercle = veutCouvercle;

    /* ⚠️ LES BRAS NE FATIGUENT PAS PENDANT QU'ELLE ATTAQUE.
       Sans cette ligne, le couvercle pouvait retomber à l'image
       exacte du contact : le joueur se protégeait, et se faisait
       toucher quand même. Mesuré en simulation — deux piqués sur
       deux. C'est exactement ce qu'Evan a interdit : « il bloque
       TOUJOURS, sans adresse, Klara ne peut pas se sentir
       mauvaise ».

       Le poids du couvercle reste : on ne peut pas vivre dessous.
       Mais dès qu'elle s'annonce, Bob tient jusqu'au bout. Ce qui
       se joue à ce moment-là n'est plus « est-ce que je tiens »,
       c'est « est-ce que je lève TÔT (clong) ou TARD (dong) » —
       et ça, c'est le jeu qu'on voulait. */
    if (b.couvercle) {
        if (!elleAttaque()) b.fatigue += dt();
        if (b.fatigue >= COMBAT.couvercleTenu) {
            b.couvercle = false;
            b.fatigue = 0;
            b.repos = time() + COMBAT.couvercleRepos;
            if (typeof sonSynthe === "function") sonSynthe("terre", 0.35);
        }
    } else {
        b.fatigue = Math.max(0, b.fatigue - dt() * 1.6);
    }

    // Se protéger, c'est se clouer sur place : exactement la règle
    // de la façade (se coller au mur, c'est ne plus descendre).
    b.marche = !b.couvercle && direction !== 0;
    if (b.marche) {
        b.x += direction * COMBAT.marche * dt();
        b.vers = direction > 0 ? 1 : -1;
    }
    b.x = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, b.x));

    // On garde où il était : elle vise où il ÉTAIT, pas où il est.
    b.souvenirs.push({ t: time(), x: b.x });
    while (b.souvenirs.length && b.souvenirs[0].t < time() - 1.4) b.souvenirs.shift();
}


/* ============================================================
   LES SCÈNES ANIMÉES
   ============================================================
   Evan : « fais des animations pour l'acte 4 — peut-être je vois
   juste pas à cause du texte ». Il voyait juste : trois moments
   importants n'existaient QU'EN TEXTE. Bob qui n'arrive pas à
   grimper, la mouette qui lui prend le dé sur la tête, et la lampe
   qu'elle casse.

   Une scène, c'est un nom et une horloge. Elle tourne dans le
   onUpdate MÊME PENDANT LE DIALOGUE, et les répliques la
   rattrapent avec leur champ « quand ». Le texte ne raconte plus
   ce qui s'est passé : il commente ce qui est en train de se
   passer.
   ============================================================ */
function jouerLaScene(nom) {
    combat.scene = { nom: nom, debut: time(), etape: 0 };
}


function tempsDeLaScene() {
    return combat.scene ? time() - combat.scene.debut : 0;
}


// Un pas d'animation qui ne se déclenche qu'une fois, quand
// l'horloge de la scène dépasse « quand ».
function auMoment(quand, faire) {
    const s = combat.scene;
    if (!s || s.etape > quand) return false;
    if (tempsDeLaScene() < quand) return false;
    s.etape = quand + 0.0001;
    if (faire) faire();
    return true;
}


function majLaScene() {
    const s = combat.scene;
    if (!s || !s.nom) return;
    if (s.nom === "grimpe") majLaSceneDeLArbre();
    else if (s.nom === "de") majLaSceneDuDe();
    else if (s.nom === "lampe") majLaSceneDeLaLampe();
    else if (s.nom === "vol_couvercle") majLaSceneDuVolDuCouvercle();
}


/* ------------------------------------------------------------
   1. BOB N'ARRIVE PAS À GRIMPER
   ------------------------------------------------------------
   Trois tentatives, de plus en plus haut, et trois chutes sur les
   fesses. C'est la seule démonstration de tout l'acte : l'arbre ne
   se grimpe pas, et on ne le redira plus jamais.
   ------------------------------------------------------------ */
function majLaSceneDeLArbre() {

    const b = combat.bob;
    const s = combat.scene;
    // Sur l'écorce, pas à côté : il doit grimper DEVANT le tronc.
    const pied = COUR.arbre.x - COUR.arbre.largeur / 2 + 16;

    // Il traverse la cour jusqu'au tronc.
    if (s.marche) {
        const reste = pied - b.x;
        if (Math.abs(reste) > 4) {
            b.vers = reste > 0 ? 1 : -1;
            b.marche = true;
            b.x += b.vers * COMBAT.marche * 2.4 * dt();
            return;
        }
        b.marche = false;
        b.vers = 1;
        s.marche = false;
    }

    /* ⚠️ Un essai demandé PENDANT la traversée attend son tour.
       Sinon son chrono démarrait au clic du joueur, il s'écoulait
       pendant que Bob marchait encore, et l'escalade était déjà finie
       quand il arrivait à l'arbre : on ne voyait rien du tout. */
    if (s.prochainEssai != null && !s.essai) {
        s.essai = { debut: time(), hauteur: s.prochainEssai, tombe: false };
        s.prochainEssai = null;
        if (typeof sonSynthe === "function") sonSynthe("grince", 0.3);
    }

    // Une tentative : il monte en 0,6 s, il tient un instant, il
    // retombe en 0,25 s. « hauteur » change à chaque essai.
    if (!s.essai) return;
    const t = time() - s.essai.debut;
    if (t < 0.6) {
        b.y = COUR.sol - s.essai.hauteur * (t / 0.6);
        b.grimpe = true;
    } else if (t < 0.85) {
        b.y = COUR.sol - s.essai.hauteur;
    } else if (t < 1.1) {
        b.y = COUR.sol - s.essai.hauteur * (1 - (t - 0.85) / 0.25);
    } else {
        if (!s.essai.tombe) {
            s.essai.tombe = true;
            b.y = COUR.sol;
            b.grimpe = false;
            b.sonne = time() + 0.5;      // il reste sur les fesses
            secouer(0.2);
            if (typeof sonSynthe === "function") sonSynthe("terre", 0.5);
            lacherDesPlumes(b.x, COUR.sol - 6, 3, 0.3);
        }
        b.y = COUR.sol;
    }
}


function bobVaAuTronc() {
    combat.scene.marche = true;
}


function bobEssayeDeGrimper(hauteur) {
    return function () {
        if (!combat.scene) return;
        combat.scene.essai = null;
        combat.scene.prochainEssai = hauteur;
    };
}


function bobRevientDeLArbre() {
    if (combat.scene) {
        combat.scene.essai = null;
        combat.scene.prochainEssai = null;
    }
    combat.bob.grimpe = false;
    combat.bob.y = COUR.sol;
}


/* ------------------------------------------------------------
   2. ELLE LUI PREND LE DÉ SUR LA TÊTE
   ------------------------------------------------------------ */
function majLaSceneDuDe() {

    const o = combat.oiseau;
    const b = combat.bob;
    const t = tempsDeLaScene();

    if (t < 1.2) {                       // elle sort du nid et se fige
        o.etat = "fige";
        o.x += ((b.x + 30) - o.x) * Math.min(1, dt() * 2.8);
        o.y += (COMBAT.altitude - o.y) * Math.min(1, dt() * 2.8);
        o.vers = -1;
        return;
    }
    if (!combat.scene.pique) return;     // on attend la bonne réplique

    const p = time() - combat.scene.pique;
    if (p < 0.45) {                      // elle tombe sur sa tête
        o.etat = "pique";
        const k = p / 0.45;
        o.x = combat.scene.dep.x + (b.x + 10 - combat.scene.dep.x) * k;
        o.y = combat.scene.dep.y + (b.y - 36 - combat.scene.dep.y) * k;
        return;
    }
    if (!combat.scene.pris) {
        combat.scene.pris = true;
        perdreLeDe();
        secouer(0.35);
        lacherDesPlumes(b.x, b.y - 44, 5, 0.6);
    }
    /* ⚠️ « vol » et pas « emporte ». Evan : « elle a ça dans la
       bouche, ça ressemble pas au casque ». La pose « emporte » de sa
       planche tient quelque chose de MOU et de rose — c'est parfait
       quand elle emporte Bob, et ça ne ressemble à rien quand elle
       emporte un dé à coudre. Alors elle vole normalement, et on
       peint le dé à son bec (voir dessinerCeQuElleEmporte). */
    o.etat = "vol";
    combat.oiseau.porte = "de";
    o.x += (COUR.nid.x - o.x) * Math.min(1, dt() * 1.7);
    o.y += ((COUR.nid.y + 34) - o.y) * Math.min(1, dt() * 1.7);
    o.vers = 1;
}


/* Ce qu'elle a dans le bec, peint à la main par-dessus sa planche.
   Le bec est au bord avant de la case, à peu près aux deux tiers de
   sa hauteur. */
function dessinerCeQuElleEmporte() {

    const o = combat.oiseau;
    if (!o.porte) return;

    const x = o.x + (o.vers < 0 ? -26 : 26);
    const y = o.y - 24;

    /* La VRAIE icône de l'objet, la même que dans l'inventaire.
       Evan : « elle a ça dans la bouche, ça ressemble pas au casque ».
       Des rectangles peints à la main n'y ressemblaient pas davantage :
       ce qu'il faut reconnaître dans son bec, c'est l'image qu'on a vue
       en le ramassant. */
    const taille = o.porte === "couvercle" ? 22 : 16;
    const frame = (typeof ICONES_OBJETS !== "undefined") ? ICONES_OBJETS[o.porte] : undefined;
    if (typeof frame !== "number") return;

    drawSprite({
        sprite: "icones_objets", frame: frame,
        pos: vec2(x, y), width: taille, height: taille,
        anchor: "center", flipX: o.vers < 0,
    });
}


function elleViseLaTete() {
    combat.scene.dep = { x: combat.oiseau.x, y: combat.oiseau.y };
    combat.scene.pique = time();
    if (typeof sonSynthe === "function") sonSynthe("rafale", 0.5);
}


/* ------------------------------------------------------------
   3. ELLE CASSE LA LAMPE
   ------------------------------------------------------------ */
function majLaSceneDeLaLampe() {

    const o = combat.oiseau;
    const t = tempsDeLaScene();
    const L = positionDeLaLampe();

    if (t < 1.4) {                       // elle remonte et se fige au-dessus
        o.etat = "fige";
        o.x += ((L.x + 46) - o.x) * Math.min(1, dt() * 1.8);
        o.y += ((L.y - 54) - o.y) * Math.min(1, dt() * 1.8);
        o.vers = -1;
        return;
    }

    const c = combat.scene.coup;
    if (!c) { o.etat = "fige"; return; }

    const p = time() - c;
    if (p < 0.35) {                      // elle fond sur la lampe
        o.etat = "pique";
        o.x += (L.x - o.x) * Math.min(1, dt() * 9);
        o.y += (L.y - o.y) * Math.min(1, dt() * 9);
        return;
    }
    o.etat = "vol";                      // elle tourne autour en attendant
    o.x += ((L.x + 60) - o.x) * Math.min(1, dt() * 2);
    o.y += ((L.y - 40) - o.y) * Math.min(1, dt() * 2);
    o.vers = -1;
}


function elleTapeLaLampe() {
    combat.scene.coup = time();
    combat.lampe.balance = 1;
    combat.lampe.depuis = time();
    coupSurLaLampe();
}


// Est-ce qu'il y a quelque chose à parer, là, maintenant ? Sert au
// poids du couvercle (majBob) : on ne fatigue jamais pendant une
// attaque.
function elleAttaque() {
    const e = combat.oiseau.etat;
    return e === "annonce" || e === "fige" || e === "pique"
        || e === "menace" || e === "balaie";
}


function bobIlYA(secondes) {
    const b = combat.bob;
    for (let i = 0; i < b.souvenirs.length; i++) {
        if (b.souvenirs[i].t >= time() - secondes) return b.souvenirs[i].x;
    }
    return b.x;
}


/* ============================================================
   LE FAISCEAU DE LA VEILLEUSE (phase 2)
   ============================================================
   La lampe ne bouge pas. C'est sa tache de lumière qui balaie
   l'herbe, lentement, d'un mur à l'autre. Elle ne fait aucun mal :
   elle dit seulement OÙ la mouette va tomber. « Reste hors de la
   lumière » est une règle qu'on n'a pas besoin d'écrire.
   ============================================================ */
function xDuFaisceau() {
    const centre = (COUR.marche.gauche + COUR.marche.droite) / 2;
    const w = (Math.PI * 2) / COMBAT.periodeFaisceau;
    return centre + Math.sin(time() * w) * COMBAT.amplitudeFaisceau;
}


function laLampeEstEnLAir() {
    return combat.phase === 2 && !combat.lampeTombee;
}


/* Où est la lampe, maintenant. Un pendule tout bête accroché sous
   l'appui de la fenêtre : au repos elle pend droit, et quand la
   mouette tape dedans elle part en arrière et revient, de moins en
   moins fort. */
function positionDeLaLampe() {

    if (combat.lampeTombee) {
        return { x: combat.lampeTombee.x, y: COUR.sol - 5, angle: 0 };
    }

    const L = COMBAT.lampe;
    const l = combat.lampe;
    let angle = 0;
    if (l && l.balance > 0) {
        const t = time() - l.depuis;
        angle = Math.sin(t * 5.4) * l.balance * 0.55 * Math.exp(-t * 0.5);
    }
    return {
        x: L.ancreX + Math.sin(angle) * L.fil,
        y: L.ancreY + Math.cos(angle) * L.fil,
        angle: angle,
    };
}


function majLaLampeQuiPend() {
    const l = combat.lampe;
    if (!l || l.balance <= 0) return;
    l.balance = Math.max(0, l.balance - dt() * 0.42);
}


/* ------------------------------------------------------------
   cibleProbable() — le cercle au sol, avant le verrouillage
   ------------------------------------------------------------
   C'est LA fonction de lisibilité de l'acte. Ce qu'elle renvoie
   est dessiné dans l'herbe, en continu, pendant qu'elle est figée
   en l'air. Le joueur voit donc la règle au lieu de la lire :

     phase 1        le cercle suit Bob en retard
     phase 2        le cercle est sous la lumière...
     phase 2 + couvercle levé   ...et il saute sur Bob, parce que
                    le couvercle brille plus que la veilleuse.

   Ce dernier cas est tout le jeu de la phase 2 : le bouclier
   devient un appât, et c'est au joueur de décider quand il veut
   qu'elle vienne.
   ------------------------------------------------------------ */
function cibleProbable() {
    if (laLampeEstEnLAir() && !combat.bob.couvercle) return xDuFaisceau();
    if (combat.bob.couvercle) return combat.bob.x;
    return bobIlYA(COMBAT.viseIlYA);
}


/* ============================================================
   LA MOUETTE
   ============================================================ */
function majLOiseau() {

    const o = combat.oiseau;
    const b = combat.bob;

    switch (o.etat) {

        case "nid":
            // Elle ne bouge pas tant que la phase n'a pas commencé.
            if (combat.phase >= 1 && combat.phase <= 2 && time() > o.jusqua) lancerUnPique();
            return;

        case "annonce":
            // Elle se laisse tomber du nid, sans un battement d'aile.
            o.y = COUR.nid.y + 34 + (COMBAT.altitude - COUR.nid.y - 34)
                * Math.min(1, 1 - (o.jusqua - time()) / COMBAT.annonce);
            o.x += (COUR.L / 2 + (b.x - COUR.L / 2) * 0.55 - o.x) * Math.min(1, dt() * 3);
            o.vers = b.x < o.x ? -1 : 1;
            if (time() > o.jusqua) {
                o.etat = "fige";
                o.jusqua = time() + COMBAT.fige;
                o.y = COMBAT.altitude;
                if (typeof sonSynthe === "function") sonSynthe("grince", 0.5);
            }
            return;

        case "fige":
            // Elle tient en l'air, ailes grandes ouvertes. C'est le
            // moment où le joueur décide : sortir de la ligne, ou
            // lever le couvercle.
            o.y = COMBAT.altitude + Math.sin(time() * 9) * 3;
            o.vers = cibleProbable() < o.x ? -1 : 1;
            if (time() > o.jusqua) verrouillerEtPiquer();
            return;

        case "pique":
            /* ⚠️ Evan : « si Bob attire la mouette sur lui et relâche
               le bouclier, elle ne change pas d'itinéraire ».
               À la phase 1, c'est LA règle : elle ne corrige jamais.
               Mais à la phase 2, la règle n'est plus la même — elle va
               vers CE QUI BRILLE. Si le couvercle se referme en plein
               vol, ce n'est plus lui le plus brillant, et elle repart
               vers la lampe. Le joueur peut donc l'appeler, puis
               changer d'avis, tant qu'elle a encore de la hauteur. */
            if (combat.phase === 2 && o.viseLeCouvercle && !b.couvercle
                && o.y < COUR.sol - 90) {
                o.viseLeCouvercle = false;
                o.cible = xDuFaisceau();
                const vers = vec2(o.cible - o.x, COUR.sol - o.y).unit();
                o.vx = vers.x * COMBAT.vitessePique;
                o.vy = vers.y * COMBAT.vitessePique;
                o.vers = o.vx < 0 ? -1 : 1;
                if (typeof sonSynthe === "function") sonSynthe("grince", 0.35);
            }
            o.x += o.vx * dt();
            o.y += o.vy * dt();
            if (contactDuPique()) return;
            if (o.y >= COUR.sol) elleRateEtSePose();
            return;

        case "marche":
            // Elle a raté. Elle ne repart pas tout de suite : elle
            // picore l'herbe comme si de rien n'était, ce qui est
            // exactement ce que font les mouettes de Kiel.
            o.x += o.vers * 26 * dt();
            if (o.x < 90) { o.x = 90; o.vers = 1; }
            if (o.x > COUR.L - 90) { o.x = COUR.L - 90; o.vers = -1; }
            if (time() > o.jusqua) o.etat = "remonte";
            return;

        case "sol":
            // Sonnée. La seule fenêtre où Bob peut la toucher.
            if (time() > o.jusqua) o.etat = "remonte";
            return;

        case "remonte":
            o.x += (COUR.nid.x - o.x) * Math.min(1, dt() * 2.4);
            o.y += (COUR.nid.y + 34 - o.y) * Math.min(1, dt() * 2.4);
            o.vers = o.x > COUR.nid.x ? -1 : 1;
            if (Math.abs(o.y - (COUR.nid.y + 34)) < 5) {
                o.etat = "nid";
                o.jusqua = time() + 1.8 + Math.random() * 1.4;
            }
            return;

        /* ---- PHASE 3 : elle est à terre, et elle est immense ---- */

        case "avance":
            if (time() < o.jusqua) return;
            majSonAvance();
            return;

        case "tourne":
            if (time() > o.jusqua) { o.vers = -o.vers; o.etat = "avance"; }
            return;

        case "menace":
            if (time() > o.jusqua) {
                o.etat = "balaie";
                o.jusqua = time() + COMBAT.balaie;
                leCoupDAile();
            }
            return;

        case "balaie":
            // Elle se fend dessus pendant le balayage.
            o.x += o.vers * (COMBAT.fente / COMBAT.balaie) * dt();
            if (time() > o.jusqua) {
                o.etat = "titube";
                // Au douzième balayage sans un seul coup reçu, elle met
                // beaucoup plus de temps à se rattraper. Voir leCoupDAile.
                o.jusqua = time() + COMBAT.titube
                    * ((combat.balayages || 0) >= 12 && o.coups === 0 ? 1.9 : 1);
            }
            return;

        case "titube":
            if (time() > o.jusqua) o.etat = "avance";
            return;
    }
}


function lancerUnPique() {
    const o = combat.oiseau;
    o.etat = "annonce";
    o.jusqua = time() + COMBAT.annonce;

    if (combat.phase === 2) combat.piquesPhare++;
    else combat.piques++;

    const n = combat.piques + combat.piquesPhare;
    crierDeLaFenetre("bluey", [
        "ELLE ARRIVE !!",
        "BOB !! ELLE DESCEND !!",
        "ATTENTION !! ATTENTION !!",
        "ELLE REDESCEND ENCORE !!",
    ][n % 4]);
    if (typeof jouerSon === "function") jouerSon("mouette", { volume: 0.4 });
}


function verrouillerEtPiquer() {

    const o = combat.oiseau;

    // Elle verrouille ICI, et plus jamais après : tout l'acte tient
    // sur cette ligne. Le cercle au sol se fige en même temps, et
    // c'est ce qui donne au joueur sa demi-seconde pour sortir.
    o.cible = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, cibleProbable()));

    // On retient POURQUOI elle a choisi là : si c'est le couvercle qui
    // l'a attirée et qu'il se referme, elle changera d'avis en vol
    // (voir le cas "pique", plus haut).
    o.viseLeCouvercle = combat.bob.couvercle;

    const arrivee = combat.bob.couvercle ? COUR.sol - 40 : COUR.sol;
    const d = vec2(o.cible - o.x, arrivee - o.y).unit();
    o.vx = d.x * COMBAT.vitessePique;
    o.vy = d.y * COMBAT.vitessePique;
    o.vers = o.vx < 0 ? -1 : 1;
    o.etat = "pique";
    if (typeof sonSynthe === "function") sonSynthe("rafale", 0.45);
}


/* ------------------------------------------------------------
   Le contact. Le couvercle d'abord : il est au-dessus de la tête
   de Bob, donc elle le rencontre AVANT lui. C'est la seule raison
   pour laquelle se protéger marche.
   ------------------------------------------------------------ */
function contactDuPique() {

    const o = combat.oiseau;
    const b = combat.bob;

    if (b.couvercle
        && Math.abs(o.x - b.x) < COMBAT.rayon + 13
        && o.y >= b.y - COMBAT.couvercleHaut - 26) {
        // Levé dans la dernière demi-seconde : DONG, et elle
        // s'écrase. Levé plus tôt : CLONG, elle rebondit dessus.
        elleSEcrase(time() - b.depuis < COMBAT.parade);
        return true;
    }

    if (Math.abs(o.x - b.x) < COMBAT.rayon + 8 && o.y >= b.y - 38) {
        elleTouche();
        return true;
    }

    return false;
}


function elleRateEtSePose() {
    const o = combat.oiseau;
    o.y = COUR.sol;
    o.etat = "marche";
    o.jusqua = time() + 2.4;
    o.vers = o.vx < 0 ? -1 : 1;
    secouer(0.12);
    lacherDesPlumes(o.x, COUR.sol - 16, 4, 0.5);
    if (typeof jouerSon === "function") jouerSon("atterrissage", { volume: 0.45 });
}


/* Le couvercle bloque TOUJOURS : il n'y a aucune adresse à avoir,
   et Klara ne peut pas se sentir mauvaise. Mais levé dans la
   dernière demi-seconde, il ne se contente pas d'arrêter le bec :
   il le RENVOIE. Elle s'écrase, elle reste au sol deux secondes et
   demie, et c'est la seule ouverture de tout l'acte. Lever tôt,
   c'est survivre ; lever tard, c'est gagner du terrain. */
function elleSEcrase(dong) {

    const o = combat.oiseau;
    secouer(dong ? 0.45 : 0.2);
    if (typeof sonSynthe === "function") sonSynthe(dong ? "clang" : "tok", dong ? 1 : 0.7);
    lacherDesPlumes(o.x, o.y - 20, dong ? 9 : 3, dong ? 1 : 0.5);

    if (dong) {
        o.etat = "sol";
        o.x = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, o.x));
        o.y = COUR.sol;
        o.jusqua = time() + COMBAT.sonnee;
        combat.dong++;
        if (combat.dong === 1) premierDong();
        else crierDeLaFenetre("bluey", "ENCORE !! REFAIS-LE !!");
    } else {
        // Elle rebondit dessus et repart, intacte.
        o.etat = "remonte";
        crierDeLaFenetre("cakey", "elle a tapé dedans, Bob ! tiens bon !");
    }
}


function elleTouche() {

    const o = combat.oiseau;
    const b = combat.bob;

    b.sonne = time() + COMBAT.raideur;
    b.x += (o.vx > 0 ? 1 : -1) * COMBAT.reculBob;
    b.x = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, b.x));
    b.couvercle = false;
    b.fatigue = 0;

    o.etat = "remonte";
    secouer(0.6);

    // Le ciel s'éclaircit d'un cran. On croit d'abord à un compte à
    // rebours ; c'est le contraire.
    combat.aube = Math.min(1, combat.aube + 0.055);

    if (typeof sonSynthe === "function") sonSynthe("terre", 1);
    crierDeLaFenetre("doudou", "Relève-toi, mon grand. Elle est déjà repartie.");
}


/* ------------------------------------------------------------
   PHASE 3 — son manège au sol
   ------------------------------------------------------------ */
function majSonAvance() {

    const o = combat.oiseau;
    const b = combat.bob;
    const ecart = b.x - o.x;

    // Bob est passé derrière elle : elle doit faire demi-tour, et
    // ça lui prend du temps. C'est la seule sortie quand elle l'a
    // collé à un mur.
    if (ecart * o.vers < 0 && Math.abs(ecart) > 14) {
        o.etat = "tourne";
        o.jusqua = time() + COMBAT.tourne;
        return;
    }

    if (Math.abs(ecart) <= COMBAT.approche) {
        o.etat = "menace";
        o.jusqua = time() + COMBAT.menace;
        crierEnVain();
        if (typeof jouerSon === "function") jouerSon("mouette", { volume: 0.55 });
        return;
    }

    /* ⚠️ Elle accélère quand elle est loin, et seulement là.
       Mesuré : à vitesse constante (54 px/s contre les 78 de Bob),
       un joueur qui recule sans jamais s'arrêter ne la laisse JAMAIS
       arriver. Le combat ne se perdait pas — il ne se passait plus
       rien du tout, ce qui est pire.

       De près elle reste plus lente que lui : passer derrière elle
       marche toujours, et c'est ça le jeu de la phase. */
    const loin = Math.max(0, Math.abs(ecart) - COMBAT.approche);
    const vitesse = COMBAT.marcheOiseau + Math.min(46, loin * 0.34);
    o.x += o.vers * vitesse * dt();
    o.x = Math.max(COUR.marche.gauche - 10, Math.min(COUR.marche.droite + 10, o.x));
}


/* ------------------------------------------------------------
   Le coup d'aile, et le FILET DE SÉCURITÉ de la phase 3
   ------------------------------------------------------------
   Les phases 1 et 2 avancent toutes seules : elles comptent des
   piqués, pas des réussites. La phase 3 est la SEULE du jeu qui
   demande au joueur de réussir quelque chose — trois coups — et
   donc la seule où l'on peut rester coincé.

   Alors on ne le laisse pas coincé. Doudou explique une deuxième
   fois au bout de quatre balayages, une troisième au bout de neuf,
   et à partir de douze elle met nettement plus de temps à se
   remettre de son déséquilibre. Le joueur finira toujours par
   passer, et il ne saura jamais qu'on l'a aidé.
   ------------------------------------------------------------ */
function leCoupDAile() {

    const o = combat.oiseau;
    const b = combat.bob;

    combat.balayages = (combat.balayages || 0) + 1;
    if (combat.balayages === 4 && o.coups === 0) {
        crierDeLaFenetre("doudou", "Quand elle frappe dans le vide, elle perd l'équilibre. C'est là.");
    } else if (combat.balayages === 9 && o.coups === 0) {
        crierDeLaFenetre("doudou", "Laisse-la frapper, mon grand. Puis va la toucher pendant qu'elle se rattrape.");
    }

    secouer(0.25);
    if (typeof sonSynthe === "function") sonSynthe("rafale", 0.3);
    lacherDesPlumes(o.x + o.vers * 20, COUR.sol - 24, 5, 0.6);

    const bout = o.x + o.vers * COMBAT.porteeAile;
    const dedans = o.vers > 0 ? (b.x > o.x - 6 && b.x < bout) : (b.x < o.x + 6 && b.x > bout);
    if (!dedans || time() < b.sonne) return;

    b.sonne = time() + COMBAT.raideur;
    b.x += o.vers * COMBAT.reculBob;
    b.x = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, b.x));
    secouer(0.55);
    combat.aube = Math.min(1, combat.aube + 0.05);
    if (typeof sonSynthe === "function") sonSynthe("terre", 1);
}


/* ============================================================
   FRAPPER
   ============================================================ */
function frapper() {

    const quoi = coupPossible();
    const o = combat.oiseau;
    const b = combat.bob;

    // Un coup dans le vide ne coûte rien : le bouton dit déjà quand
    // ça sert, et punir un joueur qui essaie est le meilleur moyen
    // qu'il n'essaie plus jamais.
    if (!quoi) {
        if (combat.phase >= 3 && aObjet("baguette") && time() > b.sonne) {
            b.vers = o.x > b.x ? 1 : -1;
            if (typeof sonSynthe === "function") sonSynthe("tok", 0.2);
        }
        return;
    }

    b.vers = o.x > b.x ? 1 : -1;
    secouer(0.2);
    lacherDesPlumes(o.x, COUR.sol - 22, 6, 0.7);

    if (quoi === "couvercle") {
        if (typeof sonSynthe === "function") sonSynthe("clang", 0.6);
        if (!combat.moments.coupDeCouvercle) {
            momentDuCombat("coupDeCouvercle");
            crierDeLaFenetre("fraisy", "OUI ! encore ! attends non — oui ! encore !");
        }
        // Elle se relève une demi-seconde plus tôt : le coup la
        // réveille autant qu'il lui fait mal.
        o.jusqua = Math.min(o.jusqua, time() + 0.8);
        return;
    }

    // La baguette. Trois coups dans tout l'acte, et le troisième
    // est écrit d'avance.
    o.coups++;
    if (typeof sonSynthe === "function") sonSynthe("tok", 1);
    combat.aube = Math.min(1, combat.aube + 0.04);

    if (o.coups === 1) {
        crierDeLaFenetre("bluey", "IL L'A TOUCHÉE !! IL L'A TOUCHÉE !!");
        o.etat = "tourne";
        o.jusqua = time() + 0.5;
    } else if (o.coups === 2) {
        crierDeLaFenetre("samsam", "Encore une fois, Bob.");
        o.etat = "tourne";
        o.jusqua = time() + 0.5;
    } else {
        laBaguetteCasse();
    }
}


/* ============================================================
   LES MOMENTS
   ============================================================ */
function momentDuCombat(nom) {
    if (combat.moments[nom]) return true;
    combat.moments[nom] = true;
    memoire.drapeaux.combat_moments = combat.moments;
    sauvegarder();
    return false;
}


function passerALaPhase(n) {
    combat.phase = n;
    memoire.drapeaux.combat_phase = n;
    combat.aube = Math.min(1, combat.aube + 0.08);
    sauvegarder();
    direLaRegle();
}


function majLesMomentsDuCombat() {

    const o = combat.oiseau;

    // La toute première fois qu'elle se fige : on arrête tout, et
    // Doudou dit la règle une seule fois, avec le cercle sous les
    // yeux. C'est le moment le plus important de l'acte — c'est
    // celui qui décide si le joueur comprend, ou pas.
    if (o.etat === "fige" && !combat.moments.premierFige) {
        momentDuCombat("premierFige");
        lePremierPique();
        return;
    }

    // Fin de la phase 1 : au cinquième piqué, elle ne vise plus Bob.
    if (combat.phase === 1 && combat.piques >= 5 && o.etat === "nid"
        && !combat.moments.de) {
        momentDuCombat("de");
        elleEmporteLeDe();
        return;
    }

    // Fin de la phase 2 : elle en a assez de la lumière.
    if (combat.phase === 2 && combat.piquesPhare > COMBAT.piquesDuPhare
        && o.etat === "nid" && !combat.moments.cordeCassee) {
        momentDuCombat("cordeCassee");
        laRallongeCasse();
        return;
    }
}


/* ------------------------------------------------------------
   LA LIGNE DU HAUT — une RÈGLE, jamais une consigne
   ------------------------------------------------------------
   « Évite-la » ne dit rien. « Elle vise là où tu étais » dit tout,
   et laisse le joueur trouver quoi en faire. C'est la même
   discipline que les objectifs de l'acte I.
   ------------------------------------------------------------ */
function direLaRegle() {
    if (typeof objectif !== "function") return;
    if (combat.phase <= 1) objectif("Elle tombe là où tu étais il y a une seconde.");
    else if (combat.phase === 2) objectif("Elle ne te vise plus : elle vise la lumière. Tiens.");
    else if (combat.phase === 3) objectif("Elle est à terre. Passe derrière elle.");
    else objectif("");
}


function lePremierPique() {

    figerLeCombat();
    lancerDialogue([
        { texte: "Elle s'arrête. En plein ciel, au-dessus de la cour, ailes grandes ouvertes — et elle ne bouge plus du tout." },
        { texte: "Dans l'herbe, sous elle, un rond de lumière pâle. Il est exactement là où Bob se tenait il y a une seconde." },
        { qui: "bluey", texte: "POURQUOI ELLE S'ARRÊTE ?! POURQUOI ELLE S'ARRÊTE COMME ÇA ?!" },
        { qui: "doudou", texte: "Elle a déjà choisi, Bluey." },
        { qui: "doudou", texte: "À Sylt, elle avait choisi la dame qui venait en face bien avant de descendre. Nous, on l'a vue viser. On n'a rien dit. On a serré nos crêpes." },
        { qui: "doudou", texte: "Elle ne change jamais d'avis en route, mon grand. Elle tombe là où tu étais." },
        { qui: "bob", texte: "Alors il faut que je n'y sois plus." },
        { qui: "doudou", texte: "Oui." },
        { qui: "doudou", texte: "Ou alors tu lèves le couvercle et tu ne bouges plus d'un pouce. Il arrêtera son bec. Il l'arrêtera à chaque fois." },
        { qui: "doudou", texte: "Mais il est lourd, et tes bras sont des bras d'ours en peluche. Tu ne le tiendras pas longtemps en l'air." },
        { qui: "samsam", texte: "Bob." },
        { qui: "samsam", texte: "Le rond dans l'herbe. Regarde-le, et pas elle." },
    ], function () {
        reprendreLeCombat();
        combat.aide = time() + 20;
    });
}


function premierDong() {
    figerLeCombat();
    lancerDialogue([
        { texte: "Le bec tape le couvercle de jus de mangue. Toute la cour sonne, et le mur d'en face renvoie le bruit une seconde plus tard." },
        { texte: "Elle tombe dans l'herbe sur le flanc, une aile en travers, et elle ne se relève pas tout de suite." },
        { qui: "bluey", texte: "ÇA A FAIT DONG !! BOB A FAIT DONG !!" },
        { qui: "cakey", texte: "au dernier moment, Bob. tu l'as levé au tout dernier moment." },
        { qui: "bob", texte: "...ça marche." },
        { qui: "bob", texte: "Tant qu'elle est par terre, elle n'est nulle part ailleurs." },
    ], reprendreLeCombat);
}


/* ------------------------------------------------------------
   L'OUVERTURE — on tue l'idée de grimper, en trente secondes
   ------------------------------------------------------------ */
function lOuvertureDeLaCour() {

    combat.etat = "scene";
    jouerLaScene("grimpe");
    lancerDialogue([
        { texte: "L'herbe est trempée et elle sent la terre. Au-dessus, la cour est immense, et elle est vide." },
        { texte: "Le grand arbre est là, à vingt pas. Tout en haut, dans la première fourche, il y a un tas de brindilles qui accroche la lumière par endroits." },
        { qui: "bob", texte: "Rosy." },
        { texte: "Bob traverse la cour et attrape l'écorce.", quand: bobVaAuTronc },
        { texte: "Il monte de trois pattes. L'écorce est mouillée.", quand: bobEssayeDeGrimper(22) },
        { texte: "Il redescend sur les fesses." },
        { texte: "Il recommence. Il monte un peu plus haut.", quand: bobEssayeDeGrimper(38) },
        { texte: "Il redescend de la même façon." },
        { texte: "Une troisième fois, pour être sûr.", quand: bobEssayeDeGrimper(30) },
        { texte: "Non.", quand: bobRevientDeLArbre },
        { qui: "doudou", texte: "Mon grand." },
        { qui: "doudou", texte: "Quand j'ai traversé, je n'ai pas marché une seule fois." },
        { qui: "doudou", texte: "On m'a porté tout le long. Dans un sac, dans un train, dans des bras." },
        { qui: "doudou", texte: "Je n'ai jamais choisi le chemin. J'ai juste tenu bon pendant qu'on m'emmenait." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Elle est trop haut, Doudou." },
        { qui: "doudou", texte: "Oui." },
        { qui: "doudou", texte: "Alors attends qu'elle descende." },
        { texte: "Tout en haut du mur, très loin, un rectangle jaune grand comme un ongle. Quatre petites têtes dedans, et une cinquième qui saute." },
        { qui: "cakey", texte: "on est là, Bob ! on voit tout !" },
        { qui: "bluey", texte: "MOI JE VOIS MIEUX QUE TOUT LE MONDE !!" },
        { qui: "doudou", texte: "Alors regarde bien, Bluey. Et dis-lui tout ce que tu vois." },
    ], function () {
        combat.scene = null;
        combat.bob.grimpe = false;
        combat.bob.y = COUR.sol;
        combat.bob.sonne = 0;
        passerALaPhase(1);
        combat.etat = "jeu";
        combat.oiseau.jusqua = time() + 2.2;
        combat.aide = time() + 22;
    });
}


function elleEmporteLeDe() {

    figerLeCombat();
    jouerLaScene("de");
    lancerDialogue([
        { texte: "Elle repart en l'air, et elle se fige encore une fois. Mais cette fois elle ne regarde pas Bob." },
        { texte: "Elle regarde ce qui brille sur sa tête." },
        { qui: "bluey", texte: "ELLE REGARDE TA TÊTE !! BOB !! ELLE REGARDE TA TÊTE !!" },
        { qui: "doudou", texte: "La dame qui venait en face, à Sylt. Elle avait ses lunettes de soleil posées sur les cheveux." },
        { qui: "doudou", texte: "Elles brillaient. C'est là que la mouette a regardé en premier." },
        { texte: "Elle tombe.", quand: elleViseLaTete },
        { texte: "Le dé à coudre part avec elle. On l'entend tomber dans le nid, tout en haut, avec un bruit de petite monnaie." },
        { texte: "Bob est tête nue. La cour est plus froide d'un coup." },
        { qui: "bob", texte: "Il est là-haut, maintenant." },
        { qui: "bob", texte: "Tout ce qu'elle me prend est là-haut." },
        { qui: "bob", texte: "...c'est là que je vais, de toute façon." },
        { qui: "cakey", texte: "Bob. j'ai une idée." },
        { qui: "cakey", texte: "elle va vers ce qui brille. alors on va lui donner quelque chose de beaucoup plus brillant que toi." },
        { qui: "bob", texte: "Quoi ?" },
        { qui: "cakey", texte: "..." },
        { qui: "cakey", texte: "la veilleuse." },
        { texte: "Personne ne répond. Tout en haut, le petit carré jaune tremble : quelqu'un vient de décrocher quelque chose du rebord." },
        { qui: "doudou", texte: "Cakey." },
        { qui: "cakey", texte: "je sais." },
        { qui: "cakey", texte: "je sais que c'est sa lumière à elle. je sais qu'elle est allumée toutes les nuits depuis qu'on est là." },
        { qui: "cakey", texte: "on la lui rendra allumée. c'est tout ce que je promets." },
    ], function () {
        leRideauDuPhare();
    });
}


function perdreLeDe() {
    donnerObjet("de");
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.6);
}


/* ------------------------------------------------------------
   PHASE 2 — le phare, et son prix
   ------------------------------------------------------------
   Evan a tranché : « la veilleuse peut servir de phare, avec son
   prix. » Le prix est le bon parce qu'on le VOIT : la seule chose
   chaude de tout l'écran — le petit carré jaune tout en haut à
   gauche — s'éteint. À partir de là, ils crient dans le noir.
   ------------------------------------------------------------ */
function leRideauDuPhare() {

    lancerDialogue([
        { texte: "Là-haut, le carré jaune s'éteint.", quand: eteindreLaFenetre },
        { texte: "La façade devient un mur noir avec un trou noir dedans. Bob ne voit plus personne. Il les entend encore." },
        { qui: "samsam", texte: "Je tiens la rallonge, Bob." },
        { qui: "samsam", texte: "Je ne peux pas descendre. Mais je peux tenir." },
        { texte: "Quelque chose glisse le long du mur, très lentement. Une petite lampe jaune, au bout d'un fil, qui descend jusqu'au milieu de la cour et s'arrête là.", quand: allumerLaLampe },
        { texte: "Elle éclaire un rond d'herbe en dessous d'elle. Le rond se met à glisser doucement vers la gauche, puis vers la droite : en haut, quelqu'un fait tourner la lampe." },
        { qui: "fraisy", texte: "C'EST MOI QUI LA FAIS TOURNER ! enfin — c'est Cakey qui tient, mais c'est moi qui pousse. c'est presque pareil." },
        { qui: "doudou", texte: "Mon grand. Elle ira vers la lumière." },
        { qui: "doudou", texte: "Alors ne sois pas dedans." },
        { qui: "bob", texte: "Et je gagne comment ?" },
        // ⚠️ Evan : « j'ai pas compris si je dois l'attirer, la sonner
        // et la frapper pour gagner ». On répond franchement : il n'y
        // a rien à gagner dans cette phase. Il n'y a qu'à tenir.
        { qui: "doudou", texte: "Tu ne gagnes pas." },
        { qui: "doudou", texte: "Tu tiens. Elle finira par en avoir assez de cette lampe, et ce jour-là elle descendra s'en occuper elle-même." },
        { qui: "doudou", texte: "C'est à ce moment-là que tout change. Jusque-là, reste hors de la lumière, et respire." },
        { qui: "bob", texte: "Et si je lève le couvercle ?" },
        { qui: "doudou", texte: "..." },
        { qui: "doudou", texte: "Alors c'est toi qui brilleras le plus, et elle viendra sur toi." },
        { qui: "doudou", texte: "Ça ne te fera pas avancer. Mais ça te fera un couvercle qui sonne, et un moment de tranquillité." },
        { qui: "bob", texte: "Bien." },
        { qui: "bob", texte: "Comme ça je saurai quand." },
    ], function () {
        // ⚠️ reprendreLeCombat() D'ABORD : c'est lui qui rend aux
        // comptes à rebours ce qu'il leur restait avant la scène. Si
        // on règle o.jusqua avant lui, il l'écrase avec la vieille
        // valeur et elle repique à la seconde où la boîte se ferme.
        combat.scene = null;          // la scène du dé a fini son travail
        reprendreLeCombat();
        passerALaPhase(2);
        combat.piquesPhare = 0;
        combat.oiseau.etat = "nid";
        /* ⚠️ Elle vient de déposer le dé là-haut : elle n'a plus rien
           dans le bec. Sans cette ligne, le dé restait peint à son bec
           pendant TOUTE la phase du phare — elle piquait la lampe avec
           un dé à coudre au bout du nez. (Evan, au test.) On le retrouve
           d'ailleurs dans le nid, ce qui n'a de sens que si elle l'a
           lâché ici. */
        combat.oiseau.porte = null;
        combat.oiseau.x = COUR.nid.x;
        combat.oiseau.y = COUR.nid.y + 34;
        combat.oiseau.jusqua = time() + 2;
        combat.aide = time() + 20;
    });
}


function eteindreLaFenetre() {
    combat.fenetre = 0;
    if (typeof sonSynthe === "function") sonSynthe("tok", 0.5);
}


function allumerLaLampe() {
    combat.lampeTombee = null;
    if (typeof jouerSon === "function") jouerSon("prise");
    if (typeof jouerMorceau === "function") jouerMorceau("mystique");
}


function laRallongeCasse() {

    figerLeCombat();
    jouerLaScene("lampe");
    lancerDialogue([
        { texte: "Elle remonte, elle se fige — et cette fois le rond dans l'herbe ne l'intéresse plus du tout." },
        { texte: "Elle regarde la lampe." },
        { qui: "cakey", texte: "oh." },
        { qui: "bluey", texte: "ELLE VA SUR LA LAMPE !! ELLE VA SUR LA LAMPE !!" },
        { texte: "Le bec tape le verre. La lampe part en arrière, revient, tape le mur.", quand: elleTapeLaLampe },
        { texte: "Le fil tient. Il grince.", quand: grincementDuFil },
        { texte: "Puis il ne tient plus." },
        { texte: "La veilleuse tombe. Elle fait trois mètres, elle rebondit une fois dans l'herbe haute, et elle s'arrête sur le flanc.", quand: laLampeTombe },
        { texte: "Elle est toujours allumée." },
        { texte: "Couchée dans l'herbe, elle n'éclaire plus un rond : elle éclaire à plat, tout du long, et toute la cour se retrouve avec une ombre immense derrière elle." },
        { qui: "samsam", texte: "Pardon." },
        { qui: "samsam", texte: "Pardon, j'ai tenu aussi fort que j'ai pu." },
        { qui: "bob", texte: "Samsam." },
        { qui: "bob", texte: "Elle est encore allumée. Tu as tenu." },
        { texte: "En bas, la mouette descend. Pas en piqué, cette fois. Lentement, en cercles, comme quelque chose qui a décidé de rester." },
        { qui: "doudou", texte: "Mon grand. Elle se pose." },
        { qui: "doudou", texte: "Tout ce que je t'ai dit sur les piqués, tu peux l'oublier." },
    ], function () {
        elleSePose();
    });
}


function coupSurLaLampe() {
    secouer(0.4);
    if (typeof sonSynthe === "function") sonSynthe("vitre", 0.9);
}


function grincementDuFil() {
    if (typeof sonSynthe === "function") sonSynthe("grince", 1);
}


function laLampeTombe() {
    combat.lampeTombee = { x: 205 };
    combat.lampe.balance = 0;
    combat.scene = null;          // la scène animée a fini son travail
    secouer(0.5);
    if (typeof sonSynthe === "function") sonSynthe("fracas", 0.55);
}


/* ------------------------------------------------------------
   PHASE 3 — elle se pose, et elle prend le couvercle
   ------------------------------------------------------------
   Sa taille est le retournement de l'acte. Ailes fermées, elle
   est plus PETITE que Bob (c'est mesuré, voir HAUTEUR_MOUETTE
   dans moteur.js). Ailes ouvertes, elle fait deux fois sa largeur.
   Le joueur découvre les deux dans la même seconde.
   ------------------------------------------------------------ */
function elleSePose() {

    lancerDialogue([
        { texte: "Elle touche l'herbe à dix pas de lui, sans un bruit, et elle replie ses ailes.", quand: poserLOiseau },
        { texte: "Et repliée, debout dans l'herbe, elle est plus petite que lui." },
        { qui: "bluey", texte: "...elle est petite ?!" },
        { qui: "bluey", texte: "ELLE EST TOUTE PETITE !! BOB !! ELLE EST PLUS PETITE QUE TOI !!" },
        { qui: "bob", texte: "Oui." },
        { texte: "Elle ouvre." },
        { texte: "D'un seul coup elle prend deux fois plus de place que lui, et le vent de ses ailes plaque l'herbe jusqu'aux pieds de Bob.", quand: leGrandDeploiement },
        { qui: "bluey", texte: "..." },
        { qui: "bluey", texte: "je la vois plus. je vois plus Bob." },
        { texte: "Elle avance. Le couvercle argenté brille au bras de Bob, à hauteur de son bec, et c'est la chose la plus brillante qui reste dans cette cour.", quand: elleAvanceSurLeCouvercle },
        { texte: "Elle le prend. Elle ne le lui arrache même pas : elle le décroche, comme on prend une assiette sur une table.", quand: perdreLeCouvercle },
        { texte: "Elle remonte le poser chez elle, et elle redescend aussitôt." },
        { texte: "On l'entend tomber dans le nid, tout en haut. Un bruit de casserole, très loin.", quand: elleRevientSansLeCouvercle },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "D'accord." },
        { texte: "Bob sort la baguette de l'élastique de son short." },
        { texte: "C'est une baguette à sushi en bois clair. Elle est exactement à sa taille." },
        { qui: "bob", texte: "Rosy est là-haut." },
        { qui: "bob", texte: "Et toi tu es là." },
        { qui: "doudou", texte: "Elle a une aile qui balaie, mon grand. Large, et basse." },
        { qui: "doudou", texte: "Elle crie avant. Elle crie toujours avant." },
        { qui: "doudou", texte: "Ne recule pas jusqu'au mur. Passe derrière elle — elle met un temps fou à se retourner." },
    ], function () {
        combat.scene = null;
        reprendreLeCombat();          // avant de régler ses minuteries
        passerALaPhase(3);
        combat.oiseau.etat = "avance";
        combat.oiseau.coups = 0;
        combat.oiseau.porte = null;
        combat.oiseau.y = COUR.sol;
        combat.oiseau.jusqua = time() + 0.8;
        combat.aide = time() + 24;
        lesVoixSeTaisent();
    });
}


function poserLOiseau() {
    const o = combat.oiseau;
    o.etat = "sol";
    o.y = COUR.sol;
    o.x = Math.min(COUR.marche.droite, combat.bob.x + 150);
    o.vers = o.x > combat.bob.x ? -1 : 1;
    o.jusqua = time() + 999;
    if (typeof jouerSon === "function") jouerSon("atterrissage", { volume: 0.5 });
}


function leGrandDeploiement() {
    secouer(0.35);
    lacherDesPlumes(combat.oiseau.x, COUR.sol - 30, 12, 0.8);
    if (typeof sonSynthe === "function") sonSynthe("rafale", 0.6);
}


/* ------------------------------------------------------------
   Elle prend le couvercle — et on le voit (Evan : « anime aussi
   quand elle vole le bouclier »). Trois temps, calés sur trois
   répliques : elle avance à portée, elle le décroche, elle monte
   le ranger chez elle et redescend.
   ------------------------------------------------------------ */
function elleAvanceSurLeCouvercle() {
    jouerLaScene("vol_couvercle");
    combat.scene.etape2 = 0;
}


function perdreLeCouvercle() {
    donnerObjet("couvercle");
    combat.bob.couvercle = false;
    combat.oiseau.porte = "couvercle";
    if (combat.scene) combat.scene.monte = time();
    secouer(0.3);
    lacherDesPlumes(combat.bob.x + 14, combat.bob.y - 26, 4, 0.5);
    if (typeof sonSynthe === "function") sonSynthe("clang", 0.5);
}


function elleRevientSansLeCouvercle() {
    if (combat.scene) combat.scene.redescend = time();
    if (typeof sonSynthe === "function") sonSynthe("clang", 0.25);
}


function majLaSceneDuVolDuCouvercle() {

    const o = combat.oiseau;
    const b = combat.bob;
    const s = combat.scene;

    // 3. elle redescend, les pattes vides
    if (s.redescend) {
        o.porte = null;
        o.etat = "vol";
        o.vers = -1;
        o.x += ((b.x + 105) - o.x) * Math.min(1, dt() * 2.2);
        o.y += (COUR.sol - o.y) * Math.min(1, dt() * 2.2);
        if (Math.abs(o.y - COUR.sol) < 4) { o.y = COUR.sol; o.etat = "avance"; }
        return;
    }

    // 2. elle monte le ranger dans le nid
    if (s.monte) {
        o.etat = "vol";
        o.vers = 1;
        o.x += (COUR.nid.x - o.x) * Math.min(1, dt() * 1.9);
        o.y += ((COUR.nid.y + 34) - o.y) * Math.min(1, dt() * 1.9);
        return;
    }

    // 1. elle avance sur lui, ailes ouvertes, jusqu'à portée de bec
    o.etat = "cri";
    o.vers = b.x > o.x ? 1 : -1;
    o.y = COUR.sol;
    o.x += ((b.x + 30 * (o.x > b.x ? 1 : -1)) - o.x) * Math.min(1, dt() * 1.4);
}


// Une fois la veilleuse par terre et la fenêtre éteinte, ils ne
// voient plus rien. Bob est seul pour la première fois du jeu, et
// c'est le moment où il est le plus fort.
function lesVoixSeTaisent() {
    combat.voix = [];
    if (momentDuCombat("silence")) return;
    // Sans « qui » : ce n'est personne qui parle, c'est ce que Bob
    // entend. Les voix nommées, à partir d'ici, arrivent coupées.
    combat.voix.push({
        qui: null,
        texte: "Ils crient encore, là-haut. On n'entend plus ce qu'ils disent.",
        jusqua: time() + 5,
    });
}


function crierEnVain() {
    // Ses cris couvrent tout. On garde quand même une voix de temps
    // en temps : coupée, à moitié perdue.
    if (Math.random() > 0.3) return;
    const bouts = [
        "BOB !! ...— ...!!",
        "...derrière !! passe—",
        "mon grand, ...—",
        "...!!",
    ];
    combat.voix.push({
        qui: null, texte: bouts[Math.floor(Math.random() * bouts.length)],
        jusqua: time() + 2.2,
    });
    if (combat.voix.length > 2) combat.voix.shift();
}


/* ------------------------------------------------------------
   Le troisième coup. Il est écrit d'avance : la baguette doit
   casser, parce que c'est une baguette cassée qui coupera le fil
   dans le nid. On ne peut pas laisser le hasard décider de ça.
   ------------------------------------------------------------ */
function laBaguetteCasse() {

    figerLeCombat();

    const b = combat.bob;
    const sur = b.x < 150 ? "la grille de cave, au pied du mur"
        : (b.x > 470 ? "le bord du bac en béton" : "une pierre du chemin");

    lancerDialogue([
        { texte: "Bob lève la baguette pour la troisième fois." },
        { texte: "Elle se décale d'un pas sur le côté. Juste un pas." },
        { texte: "La baguette passe à côté d'elle et tape " + sur + " de toute la force du coup.", quand: leCraquement },
        { texte: "Elle casse en deux." },
        { texte: "Bob regarde ce qui lui reste dans la patte : un bout de bois clair de quatre centimètres, cassé en biseau." },
        { qui: "bob", texte: "..." },
        { texte: "Le bout cassé est pointu. Beaucoup plus pointu que la baguette ne l'a jamais été." },
        { qui: "bob", texte: "Bon." },
        { texte: "Elle crie. De tout près, un cri de mouette ne ressemble pas à un cri d'oiseau : ça ressemble à quelqu'un qui rit très mal." },
        { texte: "Elle ouvre en grand, elle avance sur lui, et Bob ne recule pas." },
        { qui: "bob", texte: "Vas-y." },
    ], function () {
        casserLaBaguette();
        elleLEmporte();
    });
}


function leCraquement() {
    secouer(0.5);
    if (typeof sonSynthe === "function") { sonSynthe("tok", 1); sonSynthe("vitre", 0.35); }
}


function casserLaBaguette() {
    donnerObjet("baguette");
    prendreObjet("baguette_cassee");
}


/* ------------------------------------------------------------
   PHASE 4 — elle l'emporte
   ------------------------------------------------------------
   Le paiement de la phrase de Doudou, à l'ouverture : « Je n'ai
   jamais choisi le chemin. J'ai juste tenu bon pendant qu'on
   m'emmenait. » Bob ne monte pas à l'arbre. Il se fait emmener.
   ------------------------------------------------------------ */
function elleLEmporte() {

    /* ⚠️ ON MONTRE D'ABORD, ON PARLE APRÈS.
       Première version : le dialogue démarrait tout de suite et
       racontait un enlèvement qu'on ne voyait pas. Evan : « on a du
       mal à comprendre juste avec le texte, ça fait un peu histoire à
       comprendre ». Maintenant il y a deux secondes de silence où elle
       se ramasse, fond sur lui et décolle — et le texte n'arrive que
       quand la cour est déjà en train de rétrécir. */
    combat.etat = "saisie";
    combat.saisie = time();
    combat.saisiePrise = false;
    combat.oiseau.etat = "cri";
    combat.bob.vers = combat.oiseau.x > combat.bob.x ? 1 : -1;
    if (typeof objectif === "function") objectif("");
}


function majLaSaisie() {

    const o = combat.oiseau;
    const b = combat.bob;
    const t = time() - combat.saisie;

    // 1. elle se ramasse, ailes grandes ouvertes, et elle crie
    if (t < 0.6) {
        o.etat = "cri";
        o.vers = b.x > o.x ? 1 : -1;
        return;
    }

    // 2. elle fond sur lui
    if (t < 1.05) {
        o.etat = "pique";
        const cote = o.x > b.x ? 1 : -1;
        o.x += ((b.x + 12 * cote) - o.x) * Math.min(1, dt() * 10);
        return;
    }

    // 3. le bec se referme : secousse, plumes, cri
    if (!combat.saisiePrise) {
        combat.saisiePrise = true;
        o.etat = "emporte";
        o.x = b.x + 12;
        // 26 px au-dessus de l'herbe : Bob pend 25 px sous elle, donc
        // il part exactement de là où il était. Sans ça, il s'enfonçait
        // d'un demi-corps dans la pelouse avant de décoller.
        o.y = COUR.sol - 26;
        secouer(0.8);
        lacherDesPlumes(b.x, COUR.sol - 30, 16, 1.1);
        if (typeof sonSynthe === "function") sonSynthe("rafale", 0.8);
        if (typeof jouerSon === "function") jouerSon("mouette", { volume: 0.7 });
    }

    // 4. le sol s'en va — et SEULEMENT LÀ on se met à parler
    if (t > 1.9) {
        combat.etat = "envol";
        parlerPendantLEnvol();
    }
}


function parlerPendantLEnvol() {

    lancerDialogue([
        // ⚠️ BOB N'A JAMAIS ÉTÉ DÉCOUSU (Evan). Aucune couture, aucune
        // réparation, aucune cicatrice sur lui : il est entier, et il
        // l'est resté. Les seules coutures du jeu sont celles de
        // Doudou, qui vient de loin, et celle que Doudou refait au
        // pyjama de Samsam à l'épilogue.
        { texte: "Le bec se referme sur son épaule. Pas sur son bras : sur l'épaule gauche, celle où Klara pose la main quand elle le prend." },
        { qui: "bob", texte: "!!" },
        { texte: "Là, en dessous : l'herbe haute, la veilleuse couchée qui brille, les vélos bleus, la plaque d'égout. Tout ça rétrécit." },
        { texte: "Bob ne se débat pas. Il attrape le bec à deux pattes, et il tient." },
        { qui: "bob", texte: "...c'est ça." },
        { qui: "bob", texte: "C'est ça, le chemin." },
        { texte: "Le mur passe à côté d'eux. Quelque part là-dedans, il y a une longue corde crème avec un liseré rouge, et un nœud fait par un très vieil ours." },
        { texte: "Elle vire vers l'arbre. L'odeur arrive avant le nid : de la brindille, de la vase, et quelque chose de sucré." },
        { qui: "bob", texte: "Rosy ?" },
    ], function () {
        combat.phase = 4;
        memoire.drapeaux.combat_phase = 4;
        sauvegarder();
        afficherCarton("Le nid", "Tout en haut de l'arbre.", function () { go("nid"); });
    });
}


/* Elle l'emmène. Elle ne file pas droit : elle monte en longeant le
   mur, puis elle traverse vers l'arbre — c'est le chemin que Bob
   fera à l'envers, et à l'endroit, dans dix minutes. */
function majLEnvol() {

    const o = combat.oiseau;
    const b = combat.bob;
    const cible = vec2(COUR.nid.x, COUR.nid.y + 30);

    o.y += (cible.y - o.y) * Math.min(1, dt() * 0.42);
    o.x += (cible.x - o.x) * Math.min(1, dt() * 0.3);
    o.vers = 1;

    b.x = o.x - 13;
    b.y = o.y + 25;

    combat.aube = Math.min(1, combat.aube + dt() * 0.012);
    if (Math.random() < dt() * 1.6) lacherDesPlumes(o.x, o.y - 18, 1, 0.3);
}


/* ============================================================
   PHASE 5 — LE RETOUR, ET LA CORDE
   ============================================================
   On revient du nid dans la cour, parce que la corde est ICI, et
   parce que c'est la même arène : le joueur connaît déjà chaque
   pixel du chemin qu'il est en train de faire à l'envers.

   La fenêtre de 0,8 seconde est INRATABLE à la longue : si Bob
   manque la corde, elle fait demi-tour et repasse. Jamais de mort,
   même à la dernière image du dernier acte.
   ============================================================ */
function commencerLeRetour() {

    combat.etat = "retour";
    combat.aube = Math.max(combat.aube, 0.62);
    combat.fenetre = 0;
    combat.lampeTombee = { x: 205 };
    /* Même règle qu'à la saisie : le vol commence TOUT DE SUITE, en
       silence. On les voit sortir du nid et descendre le long du mur
       pendant deux secondes et demie, et le dialogue ne s'ouvre
       qu'après — pendant que ça continue de bouger. */
    combat.retour = {
        etape: "vol",
        t: time(),
        passages: 0,
        fenetreOuverte: false,
        parle: false,
        silenceJusqua: time() + 2.6,
        prise: 0,
        voile: 0,
    };

    const o = combat.oiseau;
    o.etat = "emporte";
    o.x = COUR.nid.x;
    o.y = COUR.nid.y + 30;
    o.vers = -1;

    const b = combat.bob;
    b.x = COUR.nid.x - 10;
    b.y = COUR.nid.y + 44;

    if (typeof objectif === "function") objectif("");
    if (typeof jouerSon === "function") jouerSon("mouette", { volume: 0.5 });
}


function parlerPendantLeRetour() {

    lancerDialogue([
        { texte: "Elle les tient tous les deux. Rosy dans le bec, Bob accroché au bec." },
        { texte: "Et elle ne monte pas : elle descend, en longeant le mur, lentement, comme si elle savait exactement où elle va." },
        { qui: "rosy", texte: "Bob— Bob, elle—" },
        { qui: "bob", texte: "Je sais." },
        { qui: "bob", texte: "Regarde le mur, Rosy. Pas en bas. Le mur." },
        { texte: "Sur le mur, quelque chose de crème avec un liseré rouge qui tourne autour tout du long." },
        { qui: "samsam", texte: "BOB." },
        { qui: "samsam", texte: "JE L'AI. JE LA TIENS DES DEUX PATTES." },
        { qui: "samsam", texte: "QUAND TU PASSES, TU ATTRAPES." },
    ], function () {
        combat.aide = time() + 30;
        if (typeof objectif === "function") objectif("Attrape la corde au passage.");
    });
}


/* ------------------------------------------------------------
   Son vol : un grand aller-retour horizontal devant le mur, à la
   hauteur du bout de la corde. Elle ralentit en passant devant.
   ------------------------------------------------------------ */
function majLeRetour() {

    const r = combat.retour;
    if (!r) return;
    if (jeuEnCours()) return;

    // ⚠️ On NE s'arrête PAS pendant un dialogue : le vol continue sous
    // le texte, sinon on lit un vol immobile. Seule la fenêtre de
    // prise reste fermée tant que quelqu'un parle (voir plus bas), pour
    // qu'on n'attrape pas la corde par mégarde en passant une réplique.
    const parle = dialogueEnCours();

    const o = combat.oiseau;
    const b = combat.bob;

    if (r.etape === "vol") {

        // Le silence du début : on regarde, on ne lit pas encore.
        if (!r.parle && !parle && time() > r.silenceJusqua) {
            r.parle = true;
            parlerPendantLeRetour();
            return;
        }

        // Un va-et-vient de l'arbre au mur, sur 8 secondes, qui
        // descend un peu à chaque passage.
        const p = (time() - r.t) / 3.4;   // un passage devant la corde toutes les 6,8 s
        const k = 0.5 - Math.cos(p * Math.PI) * 0.5;   // 0 -> 1 -> 0, sans fin
        const droite = COUR.nid.x;
        const gauche = COUR.corde.x + 4;
        o.x = droite + (gauche - droite) * k;
        // Elle descend jusqu'à la hauteur du bout du pyjama, et elle y
        // reste : c'est cette ligne-là qui rend la prise possible.
        o.y = (COUR.nid.y + 30)
            + (COUR.corde.bout - 18 - (COUR.nid.y + 30)) * Math.min(1, p / 0.8);
        o.vers = k > 0.5 ? -1 : 1;

        b.x = o.x + 14 * (o.vers > 0 ? -1 : 1);
        b.y = o.y + 22;

        // La fenêtre : quand il passe à portée du bout de la corde.
        // Fermée tant qu'on parle : on ne la rate pas parce qu'on
        // lisait, et on ne l'attrape pas en passant une réplique.
        const aPortee = r.parle && !parle
            && Math.abs(b.x - COUR.corde.x) < 46
            && Math.abs(b.y - COUR.corde.bout) < 56;

        if (aPortee && !r.fenetreOuverte) {
            r.fenetreOuverte = true;
            r.ouverteDepuis = time();
            r.passages++;
            if (typeof sonSynthe === "function") sonSynthe("tinte", 0.5);
        } else if (!aPortee && r.fenetreOuverte) {
            r.fenetreOuverte = false;
            laCordeEstPassee();
        }
        return;
    }

    if (r.etape === "prise") {
        // Il se balance au bout du pyjama, et il monte. Pas parce
        // qu'il grimpe : parce qu'on le tire.
        /* ⚠️ Evan : « Bob et Rosy remontent jusqu'au ciel ». Ils
           montaient jusqu'à cent pixels au-dessus du décor, en
           traversant tout ce qui n'est pas l'immeuble. Ils s'arrêtent
           maintenant À LA FENÊTRE, là où Samsam tire — c'est là qu'ils
           vont, et c'est là que le fondu doit commencer. */
        const p = (time() - r.prise);
        const balance = Math.sin(p * 3.4) * Math.max(0, 22 - p * 9);
        const arrivee = FENETRE_DE_LOIN.y + FENETRE_DE_LOIN.h;
        b.x = COUR.corde.x + balance;
        b.y = Math.max(arrivee, COUR.corde.bout + 4 - Math.max(0, (p - 1.8)) * 150);

        o.x += (COUR.L + 140 - o.x) * Math.min(1, dt() * 0.7);
        o.y -= 34 * dt();

        if (b.y <= arrivee) {
            r.etape = "monte";
            r.t = time();
        }
        return;
    }

    if (r.etape === "monte") {
        // ⚠️ On attend que la boîte de dialogue soit refermée avant de
        // changer de scène. Sinon on quittait la cour en plein texte,
        // et l'appartement s'ouvrait avec un dialogue fantôme encore
        // « actif » qui bloquait tout (voir oublierLeDialogue).
        if (parle) return;
        r.voile = Math.min(1, r.voile + dt() * 0.5);
        if (r.voile >= 1 && !r.fini) {
            r.fini = true;
            combat.etat = "fin";
            laRemontee();
        }
        return;
    }
}


function laCordeEstPassee() {
    const r = combat.retour;
    if (r.passages === 1) {
        crierDeLaFenetre("samsam", "Elle revient. Elle va repasser. Je ne lâche pas.");
    } else if (r.passages === 2) {
        crierDeLaFenetre("doudou", "Elle vous ramène, mon grand. Regarde-la faire.");
    } else if (r.passages % 2 === 1) {
        crierDeLaFenetre("samsam", "Je ne lâche pas, Bob.");
    }
}


function attraperLaCorde() {

    const r = combat.retour;
    if (!r || r.etape !== "vol" || !r.fenetreOuverte) return;

    r.etape = "prise";
    r.prise = time();
    secouer(0.3);
    if (typeof sonSynthe === "function") sonSynthe("grince", 0.7);
    if (typeof objectif === "function") objectif("");

    lancerDialogue([
        { texte: "La patte de Bob se referme sur du tissu." },
        { texte: "Du coton crème, un peu pelucheux, avec un liseré rouge qui tourne autour." },
        { texte: "Le bec le lâche. La mouette continue tout droit, sans un cri, et elle sort du cadre." },
        { texte: "Bob se balance au bout du pyjama de Samsam, à trois mètres du sol, Rosy accrochée à son cou." },
        { qui: "samsam", texte: "JE TE TIENS." },
        { qui: "samsam", texte: "BOB. JE TE TIENS." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Je sais, Samsam." },
        { qui: "bob", texte: "Je l'ai su tout du long." },
        { texte: "Et la corde se met à monter." },
        { texte: "Pas parce que Bob grimpe. Parce que tout en haut, quelqu'un de très gros, qui ne se lève jamais, tire." },
        /* ⚠️ PERSONNE N'ALLUME RIEN. Evan : « pourquoi ils allument la
           lumière du plafond ?? ça a aucun sens ». Il a raison, et
           c'est pire que ça : tout le jeu tient sur « ne pas réveiller
           Klara ». Allumer le plafonnier à cinq heures du matin
           annulerait quatre heures de précautions.

           Ce qui rend la fenêtre visible, c'est le ciel. Elle ne
           redevient pas jaune : elle devient grise, et on distingue à
           nouveau cinq têtes dedans. */
        { texte: "Là-haut, la fenêtre n'est plus tout à fait noire. Le ciel a commencé à la remplir par-derrière." },
        { texte: "Cinq têtes penchées au-dessus du vide, et dix pattes sur l'appui." },
        { qui: "cakey", texte: "on te voit, Bob." },
        { qui: "cakey", texte: "on te voit très bien." },
    ], function () {
        if (typeof jouerSon === "function") jouerSon("revelation", { volume: 0.5 });
    });
}


// (La fenêtre ne se rallume jamais : c'est le jour qui la remplit.
// Voir dessinerLaFenetreDeLoin, qui éclaircit les silhouettes au fur
// et à mesure que combat.aube monte.)


function laRemontee() {
    memoire.acte = 5;
    noter("cour_finie");
    memoire.drapeaux.combat_phase = 6;
    sauvegarder();
    afficherCarton("Fin de l'acte IV", "Il est cinq heures et quelque.", function () {
        commencerLEpilogue();
    });
}


/* ============================================================
   LES VOIX D'EN HAUT
   ============================================================ */
function crierDeLaFenetre(qui, texte) {
    combat.voix.push({ qui: qui, texte: texte, jusqua: time() + 3.6 });
    if (combat.voix.length > 3) combat.voix.shift();
    if (typeof demarrerBavardage === "function" && qui && qui !== "bob") {
        demarrerBavardage(qui);
        wait(0.3, arreterBavardage);
    }
}


/* ============================================================
   LES PLUMES
   ============================================================
   Il en tombe à chaque choc. C'est le seul retour visuel qui dit
   « tu lui as fait quelque chose » — elle n'a pas de barre de vie,
   et elle n'en aura jamais.
   ============================================================ */
function lacherDesPlumes(x, y, combien, force) {
    for (let i = 0; i < combien; i++) {
        combat.plumes.push({
            x: x + rand(-14, 14),
            y: y + rand(-10, 10),
            vx: rand(-40, 40) * force,
            vy: rand(-70, -10) * force,
            a: rand(0, 360),
            va: rand(-90, 90),
            vie: rand(1.6, 3.2),
        });
    }
    if (combat.plumes.length > 60) combat.plumes.splice(0, combat.plumes.length - 60);
}


function majLesPlumes() {
    for (let i = combat.plumes.length - 1; i >= 0; i--) {
        const p = combat.plumes[i];
        p.vie -= dt();
        if (p.vie <= 0 || p.y > COUR.sol + 30) { combat.plumes.splice(i, 1); continue; }
        p.x += p.vx * dt();
        p.y += p.vy * dt();
        p.vy += 34 * dt();
        p.vx *= 0.985;
        // Une plume ne tombe pas droit : elle godille.
        p.x += Math.sin(time() * 5 + p.a) * 18 * dt();
        p.a += p.va * dt();
    }
}


function dessinerLesPlumes() {
    combat.plumes.forEach(function (p) {
        drawEllipse({
            pos: vec2(p.x, p.y), radiusX: 3.5, radiusY: 1.4,
            angle: p.a, color: rgb(236, 238, 240),
            opacity: Math.min(0.85, p.vie * 0.5),
        });
    });
}


/* ============================================================
   LE DESSIN
   ============================================================ */
function dessinerBobDansLaCour() {

    const b = combat.bob;

    // Frame 0 = de face (il se cache derrière le couvercle),
    // frame 2 = de profil, 12..15 = la marche de profil.
    let frame = 2;
    if (b.grimpe) frame = 1;                 // de dos, agrippé à l'écorce
    else if (time() < b.sonne) frame = 0;
    else if (b.couvercle) frame = 0;
    else if (b.marche) frame = 12 + Math.floor(time() * 8) % 4;

    const angle = (time() < b.sonne && !b.grimpe) ? 16 * b.vers : 0;

    // Son ombre : elle le décolle du décor. Sans elle, il a l'air
    // collé sur l'image. Dès qu'il quitte le sol, elle disparaît —
    // une ombre sous des pieds qui pendent à trois mètres, c'est ce
    // qui casse le mieux une illusion.
    if (b.y >= COUR.sol - 2 && !b.grimpe
        && combat.etat !== "retour" && combat.etat !== "envol") {
        drawEllipse({
            pos: vec2(b.x, b.y + 3), radiusX: 13, radiusY: 4,
            color: rgb(0, 0, 0), opacity: 0.3,
        });
    }

    drawSprite({
        sprite: "bob", frame: frame,
        pos: vec2(b.x, b.y + 2),
        width: COMBAT.hauteurBob, height: COMBAT.hauteurBob,
        anchor: "bot", flipX: b.vers < 0, angle: angle,
    });

    // Rosy, accrochée à son cou pendant tout le retour.
    if (combat.etat === "retour" || combat.phase >= 5) {
        const t = PERSONNAGES.rosy.taille * COMBAT.hauteurBob;
        drawSprite({
            sprite: "rosy", frame: 2,
            pos: vec2(b.x - 11 * b.vers, b.y - 14),
            width: t, height: t, anchor: "bot", flipX: b.vers > 0, opacity: 0.98,
        });
    }

    // Le couvercle, levé au-dessus de la tête.
    if (b.couvercle) {
        const y = b.y - COMBAT.couvercleHaut - 14 + Math.min(6, b.fatigue * 4);
        drawEllipse({ pos: vec2(b.x, y), radiusX: 15, radiusY: 5, color: rgb(150, 152, 156) });
        drawEllipse({ pos: vec2(b.x, y - 1), radiusX: 12, radiusY: 3.5, color: rgb(196, 198, 202) });
        drawEllipse({ pos: vec2(b.x, y - 2), radiusX: 5, radiusY: 1.5, color: rgb(226, 228, 232) });

        // La jauge de bras : un petit arc qui se vide. Discrète, mais
        // elle explique en une image pourquoi le couvercle retombe.
        const reste = 1 - Math.min(1, b.fatigue / COMBAT.couvercleTenu);
        drawRect({
            pos: vec2(b.x - 15, y - 11), width: 30, height: 3,
            color: rgb(0, 0, 0), opacity: 0.4,
        });
        drawRect({
            pos: vec2(b.x - 15, y - 11), width: 30 * reste, height: 3,
            color: reste < 0.34 ? rgb(226, 108, 96) : rgb(226, 212, 150),
            opacity: 0.95,
        });
    } else if (time() < b.repos) {
        // Ses bras récupèrent : on le dit, sinon un joueur qui appuie
        // sans effet croit que la touche ne marche pas.
        const reste = (b.repos - time()) / COMBAT.couvercleRepos;
        drawRect({
            pos: vec2(b.x - 15, b.y - 58), width: 30, height: 3,
            color: rgb(0, 0, 0), opacity: 0.35,
        });
        drawRect({
            pos: vec2(b.x - 15, b.y - 58), width: 30 * (1 - reste), height: 3,
            color: rgb(150, 156, 168), opacity: 0.8,
        });
    }

    // La baguette, quand il a de quoi frapper.
    if (combat.phase >= 3 && (aObjet("baguette") || aObjet("baguette_cassee"))) {
        const longueur = aObjet("baguette") ? 17 : 7;
        const y = b.y - 24;
        drawLine({
            p1: vec2(b.x + 8 * b.vers, y),
            p2: vec2(b.x + (8 + longueur) * b.vers, y - 6),
            width: 2.5, color: rgb(216, 192, 148),
        });
    }
}


/* ------------------------------------------------------------
   LA MENACE — le cercle dans l'herbe
   ------------------------------------------------------------
   C'est la réponse à « c'est tellement vague ». Tout ce qui va
   arriver est dessiné au sol AVANT d'arriver.
   ------------------------------------------------------------ */
function dessinerLaMenace() {

    if (combat.etat !== "jeu" && combat.etat !== "scene") return;

    const o = combat.oiseau;
    const b = combat.bob;

    /* ---- le piqué : la colonne et le cercle ---- */
    if (o.etat === "fige" || o.etat === "pique" || o.etat === "annonce") {

        const verrouille = o.etat === "pique";
        const x = o.etat === "annonce" ? cibleProbable()
            : (verrouille ? o.cible : cibleProbable());
        const danger = Math.abs(x - b.x) < COMBAT.rayon + 10 && !b.couvercle;
        const battement = 0.5 + Math.sin(time() * (verrouille ? 18 : 7)) * 0.5;

        const couleur = danger ? rgb(228, 96, 86) : rgb(232, 206, 142);
        const force = o.etat === "annonce" ? 0.45 : (verrouille ? 1 : 0.8);

        // La colonne : c'est elle qu'on voit du coin de l'œil, même
        // sur un téléphone tenu à bout de bras.
        const hautColonne = COUR.horizon - 40;
        const hauteurColonne = COUR.sol - hautColonne + 14;
        drawRect({
            pos: vec2(x - 23, hautColonne), width: 46, height: hauteurColonne,
            color: couleur, opacity: (0.07 + battement * 0.07) * force,
        });
        drawRect({
            pos: vec2(x - 23, hautColonne), width: 1.5, height: hauteurColonne,
            color: couleur, opacity: (0.26 + battement * 0.28) * force,
        });
        drawRect({
            pos: vec2(x + 22, hautColonne), width: 1.5, height: hauteurColonne,
            color: couleur, opacity: (0.26 + battement * 0.28) * force,
        });

        // Le cercle dans l'herbe.
        const r = 24 - battement * 3 * force;
        drawEllipse({
            pos: vec2(x, COUR.sol + 4), radiusX: r, radiusY: r * 0.3,
            fill: false, outline: { width: verrouille ? 2.5 : 1.6, color: couleur },
            opacity: (0.55 + battement * 0.45) * force,
        });
        drawEllipse({
            pos: vec2(x, COUR.sol + 4), radiusX: r * 0.42, radiusY: r * 0.13,
            color: couleur, opacity: (0.16 + battement * 0.2) * force,
        });

        // Le fil entre elle et le point verrouillé : elle ne changera
        // plus d'avis, et ça se voit.
        if (verrouille) {
            drawLine({
                p1: vec2(o.x, o.y - 12), p2: vec2(x, COUR.sol + 2),
                width: 1, color: couleur, opacity: 0.3,
            });
        }

        // Le « ! » au-dessus de Bob s'il est dedans.
        if (danger) dessinerLAlerte(b.x, b.y - 52, battement);
    }

    /* ---- le coup d'aile : l'arc devant elle ---- */
    if (o.etat === "menace" || o.etat === "balaie") {

        const enCours = o.etat === "balaie";
        const bout = o.x + o.vers * COMBAT.porteeAile;
        const gauche = Math.min(o.x, bout);
        const largeur = Math.abs(bout - o.x);
        const battement = enCours ? 1 : 0.35 + Math.sin(time() * 13) * 0.35;
        const dedans = o.vers > 0 ? (b.x > o.x - 6 && b.x < bout) : (b.x < o.x + 6 && b.x > bout);
        const couleur = dedans ? rgb(228, 96, 86) : rgb(228, 150, 110);

        drawRect({
            pos: vec2(gauche, COUR.sol - 4), width: largeur, height: 12,
            color: couleur, opacity: 0.1 + battement * 0.22,
        });
        drawEllipse({
            pos: vec2(o.x + o.vers * (COMBAT.porteeAile * 0.5), COUR.sol + 3),
            radiusX: largeur * 0.5, radiusY: 8,
            fill: false, outline: { width: enCours ? 2.5 : 1.4, color: couleur },
            opacity: 0.45 + battement * 0.5,
        });
        if (dedans) dessinerLAlerte(b.x, b.y - 52, battement);
    }

    /* ---- elle est à terre : le cercle de portée de Bob ---- */
    if (coupPossible()) {
        const battement = 0.5 + Math.sin(time() * 8) * 0.5;
        drawEllipse({
            pos: vec2(o.x, COUR.sol + 4), radiusX: 22, radiusY: 7,
            fill: false, outline: { width: 2, color: rgb(214, 232, 170) },
            opacity: 0.5 + battement * 0.4,
        });
    }
}


// Un « ! » peint à la main : deux rectangles. Un vrai texte dans le
// monde serait flou au zoom de l'arène.
function dessinerLAlerte(x, y, battement) {
    const o = 0.6 + battement * 0.4;
    const h = 10 + battement * 2;
    drawRect({ pos: vec2(x - 2, y - h), width: 4, height: h * 0.66, color: rgb(240, 120, 108), opacity: o });
    drawRect({ pos: vec2(x - 2, y - h * 0.24), width: 4, height: 4, color: rgb(240, 120, 108), opacity: o });
}


function dessinerLOiseau() {

    const o = combat.oiseau;
    let frame = 0;

    if (o.etat === "nid" || o.etat === "annonce") frame = 0;
    else if (o.etat === "fige") frame = 13;                       // ailes grandes ouvertes
    else if (o.etat === "pique") frame = 12;
    else if (o.etat === "marche" || o.etat === "avance") frame = 4 + Math.floor(time() * 7) % 4;
    else if (o.etat === "tourne") frame = 0;
    else if (o.etat === "menace") frame = 1;                      // elle jacasse
    else if (o.etat === "balaie") frame = 14;                     // l'aile qui balaie
    else if (o.etat === "titube") frame = 3;                      // en déséquilibre
    else if (o.etat === "sol") frame = 3;
    else if (o.etat === "remonte") frame = 8 + Math.floor(time() * 9) % 4;
    else if (o.etat === "emporte") frame = 15;
    else if (o.etat === "cri") frame = 13;             // ailes grandes ouvertes

    // Son ombre sur l'herbe : elle arrive TOUJOURS avant elle, et
    // c'est ce qui rend le piqué lisible même sans regarder en haut.
    if (o.y < COUR.sol - 26) {
        const k = Math.max(0, 1 - (COUR.sol - o.y) / 380);
        drawEllipse({
            pos: vec2(o.x, COUR.sol + 4),
            radiusX: 15 + k * 24, radiusY: 4 + k * 5,
            color: rgb(0, 0, 0), opacity: 0.16 + k * 0.32,
        });
    }

    /* ⚠️ anchor "bot", et pas "center".
       Sa planche est alignée par le BAS : dans chacune des seize
       cases, le dernier pixel non transparent est sur la dernière
       ligne (vérifié case par case). o.y est donc la ligne de ses
       PATTES, exactement comme pour Bob — et posée au sol, elle
       n'entre plus de trente pixels dans la pelouse. */
    drawSprite({
        sprite: "mouette", frame: frame,
        pos: vec2(o.x, o.y),
        width: CASE_MOUETTE, height: CASE_MOUETTE,
        anchor: "bot", flipX: o.vers < 0,
    });
}


// Le ciel qui s'éclaircit. Le joueur croit d'abord à un compte à
// rebours. C'est le contraire : c'est le matin qui arrive.
function dessinerLAube() {
    if (combat.aube <= 0) return;
    const k = combat.aube;
    drawRect({
        pos: vec2(0, 0), width: COUR.L, height: COUR.horizon + 40,
        color: rgb(126, 132, 156), opacity: k * 0.2,
    });
    // Une bande plus chaude tout en bas du ciel : le jour se lève
    // toujours par le bas.
    drawRect({
        pos: vec2(0, COUR.horizon - 70), width: COUR.L, height: 112,
        color: rgb(214, 158, 122), opacity: k * 0.14,
    });
}


/* ------------------------------------------------------------
   LA VEILLEUSE — en l'air, puis couchée dans l'herbe
   ------------------------------------------------------------ */
function dessinerLaLampe() {

    if (combat.phase < 2) return;

    if (combat.lampeTombee) {
        dessinerLaLampeCouchee();
        return;
    }

    const A = COMBAT.lampe;
    const c = COMBAT.cordon;
    const L = positionDeLaLampe();
    const xSol = xDuFaisceau();

    /* La rallonge. Deux morceaux, et c'est ce qui la rend crédible :
       un bout mou qui sort du coin de la fenêtre et passe par-dessus
       l'appui, puis le fil TENDU qui descend droit jusqu'à la lampe.
       Quand elle se balance, c'est ce deuxième morceau qui pivote. */
    for (let i = 0; i < 10; i++) {
        const t0 = i / 10, t1 = (i + 1) / 10;
        const p = function (t) {
            return vec2(
                c.x + (A.ancreX - c.x) * t,
                c.y + (A.ancreY - c.y) * t + Math.sin(t * Math.PI) * 7
            );
        };
        drawLine({ p1: p(t0), p2: p(t1), width: 1.5, color: rgb(28, 26, 30) });
    }
    drawLine({
        p1: vec2(A.ancreX, A.ancreY), p2: vec2(L.x, L.y - 8),
        width: 1.5, color: rgb(28, 26, 30),
    });

    // Le faisceau : un cône de la lampe jusqu'à la tache au sol.
    drawTriangle({
        p1: vec2(L.x, L.y + 4),
        p2: vec2(xSol - COMBAT.rayonLumiere, COUR.sol + 6),
        p3: vec2(xSol + COMBAT.rayonLumiere, COUR.sol + 6),
        color: rgb(255, 208, 128), opacity: 0.09,
    });
    drawTriangle({
        p1: vec2(L.x, L.y + 4),
        p2: vec2(xSol - COMBAT.rayonLumiere * 0.45, COUR.sol + 6),
        p3: vec2(xSol + COMBAT.rayonLumiere * 0.45, COUR.sol + 6),
        color: rgb(255, 224, 160), opacity: 0.1,
    });

    // La tache dans l'herbe.
    drawEllipse({
        pos: vec2(xSol, COUR.sol + 3),
        radiusX: COMBAT.rayonLumiere, radiusY: COMBAT.rayonLumiere * 0.3,
        color: rgb(255, 212, 140), opacity: 0.2,
    });
    drawEllipse({
        pos: vec2(xSol, COUR.sol + 3),
        radiusX: COMBAT.rayonLumiere * 0.55, radiusY: COMBAT.rayonLumiere * 0.18,
        color: rgb(255, 232, 178), opacity: 0.22,
    });

    // La lampe elle-même, et son halo.
    for (let i = 4; i >= 1; i--) {
        drawCircle({
            pos: vec2(L.x, L.y), radius: 9 + i * 11,
            color: rgb(255, 208, 128), opacity: 0.05,
        });
    }
    drawRect({ pos: vec2(L.x - 6, L.y - 8), width: 12, height: 14, color: rgb(230, 200, 108) });
    drawRect({ pos: vec2(L.x - 7, L.y - 2), width: 14, height: 8, color: rgb(255, 238, 178) });
    drawRect({ pos: vec2(L.x - 3, L.y - 12), width: 6, height: 5, color: rgb(58, 54, 52) });
}


function dessinerLaLampeCouchee() {

    const x = combat.lampeTombee.x;
    const y = COUR.sol - 5;

    // Couchée, elle éclaire à plat : une longue nappe basse, et tout
    // ce qui est debout dans la cour a maintenant une ombre immense
    // derrière lui.
    drawEllipse({
        pos: vec2(x, COUR.sol + 4), radiusX: 250, radiusY: 22,
        color: rgb(255, 204, 132), opacity: 0.11,
    });
    drawEllipse({
        pos: vec2(x, COUR.sol + 4), radiusX: 110, radiusY: 13,
        color: rgb(255, 226, 168), opacity: 0.13,
    });
    for (let i = 4; i >= 1; i--) {
        drawCircle({
            pos: vec2(x, y), radius: 6 + i * 9,
            color: rgb(255, 208, 128), opacity: 0.055,
        });
    }
    drawRect({ pos: vec2(x - 8, y - 5), width: 16, height: 10, color: rgb(230, 200, 108) });
    drawRect({ pos: vec2(x - 8, y - 2), width: 16, height: 6, color: rgb(255, 240, 186) });

    // Le bout de rallonge qui traîne dans l'herbe.
    drawLine({ p1: vec2(x + 8, y + 2), p2: vec2(x + 46, COUR.sol + 3), width: 1.5, color: rgb(28, 26, 30) });
    drawLine({ p1: vec2(x + 46, COUR.sol + 3), p2: vec2(x + 72, COUR.sol - 1), width: 1.5, color: rgb(28, 26, 30) });
}


/* ------------------------------------------------------------
   LA FENÊTRE, TOUT EN HAUT À GAUCHE
   ------------------------------------------------------------
   Grande comme un ongle, et c'est la seule chose chaude de tout
   l'écran. Ils sont cinq dedans, à deux étages au-dessus, et ils
   ne peuvent rien faire d'autre que regarder et crier. C'est
   exactement ce que l'acte leur demande.

   Quand ils décrochent la veilleuse (phase 2), elle s'éteint. À
   partir de là, la façade est un mur noir avec un trou noir.
   ------------------------------------------------------------ */
/* ⚠️ LE DÉCALAGE DE 40 PIXELS.
   Evan : « y'a un décalage entre la fenêtre et les doudous ». Il n'y
   en avait pas entre les doudous et la fenêtre : il y en avait entre
   la fenêtre PEINTE et le rectangle allumé qu'on posait dessus.

   peindreLaFacadeDeLoin (cour.js) ne colle pas la façade en haut de
   la toile : elle la pose de façon que l'herbe tombe sur COUR.sol,
   donc elle commence à COUR.sol - hauteur, soit 40 px plus bas. Ce
   décalage manquait ici, et tout ce qu'on dessinait « dans la
   fenêtre » flottait 40 px au-dessus d'elle.

   On le recalcule donc exactement comme cour.js, à partir des mêmes
   nombres : deux repères qui doivent coïncider ne se règlent jamais
   séparément. */
const FENETRE_DE_LOIN = (function () {
    const f = COUR.facade;
    const t = FACADE.travees[FACADE.traveeDeKlara];
    const e = f.echelle;
    const hautDeLaFacade = COUR.sol - Math.round((FACADE.herbe - f.depuisY) * e);
    return {
        x: f.x + (t.x + 6 - f.depuisX) * e,
        y: hautDeLaFacade + (FACADE.baies[0] + 6 - f.depuisY) * e,
        l: (t.l - 12) * e,
        h: (FACADE.hauteurBaie - 15) * e,
    };
})();


function dessinerLaFenetreDeLoin() {

    const w = FENETRE_DE_LOIN;
    const allumee = combat.fenetre;

    drawRect({ pos: vec2(w.x, w.y), width: w.l, height: w.h, color: rgb(20, 17, 24) });

    if (allumee > 0) {
        drawRect({
            pos: vec2(w.x, w.y), width: w.l, height: w.h,
            color: rgb(255, 202, 128),
            opacity: (0.30 + Math.sin(time() * 1.4) * 0.02) * allumee,
        });
        // La flaque de lumière qu'elle jette sur la façade autour.
        for (let i = 5; i >= 1; i--) {
            drawCircle({
                pos: vec2(w.x + w.l / 2, w.y + w.h / 2),
                radius: (w.l * 0.9) * (i / 5),
                color: rgb(255, 196, 110), opacity: 0.035 * (1 - i / 7) * allumee,
            });
        }
    }

    /* Eux. Le plus grand derrière, le plus petit qui saute devant.
       Éteinte, on ne voit plus que leurs silhouettes — et c'est pire.

       ⚠️ Evan : « y'a un décalage entre la fenêtre et les doudous ».
       Le trou fait 64 px de large : à cinq là-dedans, il suffit de
       deux ou trois pixels de trop pour que Bluey et Fraisy montent
       sur le cadre. On les resserre, on les rapetisse — et surtout on
       repeint les montants par-dessus (voir plus bas), pour qu'aucun
       débordement ne soit plus possible, quoi qu'on change ici. */
    const sol = w.y + w.h + 4;
    const monde = [
        { cle: "samsam", dx: 0.38 },
        { cle: "cakey", dx: 0.62 },
        { cle: "doudou", dx: 0.15 },
        { cle: "fraisy", dx: 0.80 },
        { cle: "bluey", dx: 0.91, saute: true },
    ];
    monde.forEach(function (p, i) {
        const taille = 17 * (PERSONNAGES[p.cle] ? PERSONNAGES[p.cle].taille : 1);
        const bouge = p.saute
            ? -Math.max(0, Math.sin(time() * 3.1)) * 5
            : Math.sin(time() * 2 + i) * 0.8;
        const dessin = {
            sprite: apparenceDe(p.cle), frame: 0,
            pos: vec2(w.x + w.l * p.dx, sol + bouge),
            width: taille, height: taille, anchor: "bot",
            // Fenêtre éteinte, ce sont des silhouettes — jusqu'à ce que
            // le jour se lève derrière eux et les rende au monde. Rien
            // ne s'allume dans cette pièce : Klara y dort.
            opacity: Math.min(1, 0.32 + allumee * 0.6 + combat.aube * 0.45),
        };
        if (allumee <= 0) {
            const k = Math.min(1, combat.aube);
            dessin.color = rgb(
                Math.round(66 + k * 120),
                Math.round(64 + k * 118),
                Math.round(82 + k * 118)
            );
        }
        drawSprite(dessin);
    });

    /* On repeint le CADRE par-dessus eux, découpé dans le décor
       lui-même : l'appui sous leurs pieds, et les deux montants de
       chaque côté. C'est un vrai masque — ils sont DANS le trou, et
       plus rien ne peut en sortir.

       Découper dans « cour_fond » plutôt que de peindre des
       rectangles : la brique, le béton et leurs ombres sont déjà là,
       au bon endroit et à la bonne couleur. Un rectangle posé dessus
       se verrait au premier coup d'œil. */
    const morceauDuDecor = function (x, y, l, h) {
        drawSprite({
            sprite: "cour_fond",
            pos: vec2(x, y), width: l, height: h,
            quad: quad(x / COUR.L, y / COUR.H, l / COUR.L, h / COUR.H),
        });
    };

    morceauDuDecor(w.x - 10, w.y + w.h, w.l + 20, 22);   // l'appui
    morceauDuDecor(w.x - 10, w.y - 6, 10, w.h + 8);      // le montant gauche
    morceauDuDecor(w.x + w.l, w.y - 6, 10, w.h + 8);     // le montant droit
    morceauDuDecor(w.x - 10, w.y - 8, w.l + 20, 4);      // le linteau
}


function dessinerLaPluieDeLaCour() {
    // Il ne pleut plus vraiment : il tombe ce qui reste dans les arbres.
    for (let i = 0; i < 26; i++) {
        const x = (i * 211.7) % COUR.L;
        const y = ((time() * (60 + (i % 5) * 20) + i * 97) % COUR.H);
        drawRect({ pos: vec2(x, y), width: 1, height: 4, color: rgb(150, 170, 190), opacity: 0.12 });
    }
}


// Le fondu au blanc de la remontée, à la toute fin de l'acte.
function dessinerLeVoileDuRetour() {
    const r = combat.retour;
    if (!r || !r.voile) return;
    drawRect({
        pos: vec2(0, 0), width: COUR.L, height: COUR.H,
        color: rgb(255, 238, 214), opacity: r.voile,
    });
}


/* ============================================================
   L'INTERFACE
   ============================================================ */
function installerLInterfaceDuCombat() {

    const ui = {};

    ui.voix = add([
        text("", { size: 14, width: 300, align: "left" }),
        pos(0, 0), anchor("topleft"), color(...COULEUR_CREME),
        opacity(0), fixed(), z(Z_INTERFACE),
    ]);

    ui.aide = add([
        text("", { size: 15, width: 460, align: "center" }),
        pos(0, 0), anchor("top"), color(...COULEUR_CREME),
        opacity(0), fixed(), z(Z_INTERFACE),
    ]);

    ui.fondAide = add([
        rect(10, 10, { radius: 8 }),
        pos(0, 0), anchor("top"), color(...COULEUR_NUIT),
        opacity(0), fixed(), z(Z_INTERFACE - 1),
    ]);

    /* ---- le bouton d'action, exactement comme dans l'appartement ----
       ⚠️ Le verbe se met À CÔTÉ du bouton, ancré à droite, avec sa
       pastille sombre — et surtout pas DEDANS. Testé : « COUVERCLE »
       écrit dans un cercle de 34 px de rayon déborde des deux côtés et
       sort de l'écran. C'est la raison d'être de cette disposition
       dans interactions.js, et il n'y a aucune raison d'en inventer
       une autre ici. */
    ui.bouton = add([
        circle(BOUTON_ACTION_RAYON),
        pos(0, 0), anchor("center"), fixed(), z(Z_INTERFACE - 5),
        color(...COULEUR_ACCENT),
        outline(3, rgb(...COULEUR_CREME)),
        opacity(0.5),
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
        text("", { size: 13 }),
        pos(0, 0), anchor("right"), fixed(), z(Z_INTERFACE - 4),
        color(...COULEUR_CREME), opacity(0),
    ]);

    combat.ui = ui;
    combat.aide = time() + 16;
}


function majLInterfaceDuCombat() {

    const ui = combat.ui;
    if (!ui) return;
    const cache = dialogueEnCours() || jeuEnCours();

    /* ---- les voix d'en haut ---- */
    const vivantes = combat.voix.filter(function (v) { return time() < v.jusqua; });
    combat.voix = vivantes;
    if (vivantes.length) {
        const v = vivantes[vivantes.length - 1];
        const p = v.qui ? PERSONNAGES[v.qui] : null;
        ui.voix.text = (p ? p.nom + " — " : "") + v.texte;
        ui.voix.color = rgb(...(p ? eclaircir(p.couleurPlaceholder, 0.35) : [150, 146, 156]));
        ui.voix.textSize = echelleInterface() - 2;
        ui.voix.width = Math.min(320, width() - 44);
        ui.voix.pos = vec2(22, height() * 0.26);
        ui.voix.opacity = cache ? 0 : Math.min(1, (v.jusqua - time()) / 0.6) * 0.92;
    } else {
        ui.voix.opacity = 0;
    }

    /* ---- le bouton, et son verbe ---- */
    const centre = vec2(
        width() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON,
        height() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON
    );
    combat.bouton.centre = centre;

    const quoi = verbeDuBouton();
    const bat = quoi.chaud ? Math.abs(Math.sin(time() * 6)) : 0;

    ui.bouton.pos = centre;
    ui.bouton.radius = BOUTON_ACTION_RAYON * (1 + bat * 0.07);
    ui.bouton.color = rgb(...quoi.couleur);
    ui.bouton.opacity = cache ? 0
        : (combat.bouton.tenu ? 1 : (quoi.chaud ? 0.5 + bat * 0.5 : 0.42));

    ui.point.pos = centre;
    ui.point.opacity = cache ? 0 : (quoi.mot ? 0.9 : 0.35);

    ui.verbe.textSize = Math.max(11, echelleInterface() - 3);
    ui.verbe.text = quoi.mot;
    ui.verbe.pos = centre.add(vec2(-BOUTON_ACTION_RAYON - 12, 0));
    ui.verbe.opacity = cache || !quoi.mot ? 0 : 1;

    ui.fondVerbe.pos = ui.verbe.pos.add(vec2(9, 0));
    ui.fondVerbe.width = (ui.verbe.width || 10) + 18;
    ui.fondVerbe.height = (ui.verbe.height || 16) + 10;
    ui.fondVerbe.opacity = cache || !quoi.mot ? 0 : 0.65;

    /* ---- la ligne d'aide ----
       EN HAUT, juste sous l'objectif, et pas en bas : le bas de
       l'écran est déjà pris par le joystick à gauche et le bouton à
       droite. Sur le téléphone de Klara, une ligne d'aide centrée en
       bas passe SOUS son pouce. */
    const reste = (combat.aide || 0) - time();
    const bas = typeof basDeLObjectif === "function" ? basDeLObjectif() : null;
    ui.aide.text = texteDAide();
    ui.aide.textSize = echelleInterface() - 2;
    ui.aide.width = Math.min(width() - 40, 460);
    ui.aide.pos = vec2(width() / 2, (bas ? bas.y : 44) + 20);
    const o = cache ? 0 : Math.max(0, Math.min(1, reste / 2)) * 0.95;
    ui.aide.opacity = o;
    ui.fondAide.pos = ui.aide.pos.sub(vec2(0, 8));
    ui.fondAide.width = ui.aide.width + 24;
    ui.fondAide.height = (ui.aide.height || 20) + 16;
    ui.fondAide.opacity = o * 0.95;

    // On déclare la place qu'on prend : l'inventaire descendra sous
    // nous tant que la ligne d'aide est là (voir histoire.js).
    if (typeof poserBandeauDAide === "function") {
        poserBandeauDAide(o < 0.04 ? null : {
            gauche: ui.fondAide.pos.x - ui.fondAide.width / 2,
            droite: ui.fondAide.pos.x + ui.fondAide.width / 2,
            y: ui.fondAide.pos.y + ui.fondAide.height,
        });
    }
}


function verbeDuBouton() {

    if (combat.etat === "retour") {
        const r = combat.retour;
        if (r && r.etape === "vol") {
            return r.fenetreOuverte
                ? { mot: "ATTRAPE", couleur: [232, 214, 140], chaud: true }
                : { mot: "", couleur: COULEUR_ACCENT, chaud: false };
        }
        return { mot: "", couleur: COULEUR_ACCENT, chaud: false };
    }

    const quoi = coupPossible();
    if (quoi) return { mot: "FRAPPER", couleur: [214, 232, 170], chaud: true };

    const b = combat.bob;
    if (!aObjet("couvercle")) return { mot: "", couleur: [120, 116, 128], chaud: false };
    if (time() < b.repos) return { mot: "BRAS LOURDS", couleur: [120, 116, 128], chaud: false };
    return { mot: "COUVERCLE", couleur: COULEUR_ACCENT, chaud: false };
}


/* ------------------------------------------------------------
   La ligne d'aide dit les TOUCHES, et rien d'autre. Les règles
   du combat, ce sont les personnages qui les disent, et la ligne
   du haut qui les rappelle. On ne met jamais un nom de touche
   dans la bouche de Doudou.
   ------------------------------------------------------------ */
function texteDAide() {
    if (combat.etat === "retour") return "ESPACE (ou le bouton) : attraper la corde quand le bouton s'allume.";
    if (combat.phase >= 3) return "← →  marcher.     ESPACE : frapper — quand le bouton s'allume.";
    return "← →  marcher.     ESPACE tenu : lever le couvercle (et ne plus bouger).";
}


/* ============================================================
   LE SON
   ============================================================ */
function majLeSonDeLaCour() {
    if (typeof volumeDeBoucle !== "function" || !son.ctx) return;
    if (typeof musiqueDuDehors === "function") musiqueDuDehors(true);
    // Le vent et la nuit laissent la place à la musique du dehors :
    // ils étaient au même niveau qu'elle, et à eux deux ils la
    // couvraient exactement.
    volumeDeBoucle("vent", combat.phase >= 3 ? 0.16 : 0.26);
    volumeDeBoucle("nuit", 0.34);
}


/* ============================================================
   L'ENTRÉE DANS L'ACTE
   ============================================================ */
function commencerActeIV() {
    memoire.acte = 4;
    noter("acte4");
    delete memoire.drapeaux.combat_phase;
    delete memoire.drapeaux.combat_moments;
    delete memoire.drapeaux.cour_commencee;
    delete memoire.drapeaux.nid_fait;
    sauvegarder();
    go("cour");
}


/* ------------------------------------------------------------
   LES RACCOURCIS D'ADRESSE
   ------------------------------------------------------------
       octobre.html?acte4    le début de l'acte
       octobre.html?phare    la phase 2, la veilleuse en l'air
       octobre.html?ausol    la phase 3, elle est à terre
       octobre.html?nid      le nid
       octobre.html?corde    le retour et la corde
       octobre.html?fin      l'épilogue
   ------------------------------------------------------------ */
const DRAPEAUX_AVANT_ACTE_IV = [
    "ouverture", "fenetre_vue", "bluey_lance", "bluey_1", "bluey_2", "bluey_3",
    "bluey_ok", "miroir", "cakey_bonjour", "cakey_ok", "fraisy_faim", "fraisy_ok",
    "samsam_trouve", "samsam_couvert", "samsam_ok", "bluey_retour", "verite",
    "cakey_secret", "petale", "moin", "acte2",
    "averti_bruit", "arme", "bouclier", "casque", "jus_ouvert",
    "veilleuse_debranchee", "rallonge", "phare", "depart", "acte3",
    "descente_commencee", "descente_finie", "acte4",
];


function preparerUnePartieDActeIV(phase, objets, drapeauxEnPlus) {

    memoire.drapeaux = {};
    DRAPEAUX_AVANT_ACTE_IV.concat(drapeauxEnPlus || []).forEach(function (d) {
        memoire.drapeaux[d] = true;
    });
    memoire.objets = objets;
    memoire.acte = 4;
    if (phase > 0) {
        memoire.drapeaux.combat_phase = phase;
        memoire.drapeaux.cour_commencee = true;
        memoire.drapeaux.combat_moments = { premierFige: true, de: phase >= 2, cordeCassee: phase >= 3 };
    }
    sauvegarder();

    try { history.replaceState(null, "", location.pathname); } catch (e) { /* tant pis */ }
}


function raccourciActeIV() {

    if (typeof location === "undefined") return false;
    const adresse = location.search;

    if (/[?&]acte4\b/.test(adresse)) {
        preparerUnePartieDActeIV(0, ["petale", "baguette", "couvercle", "de"]);
        console.log("%cActe IV : partie préparée (?acte4).", "color:#c9a876;font-weight:bold");
        return true;
    }

    if (/[?&]phare\b/.test(adresse)) {
        preparerUnePartieDActeIV(2, ["petale", "baguette", "couvercle"]);
        console.log("%cActe IV, phase 2 : le phare (?phare).", "color:#c9a876;font-weight:bold");
        return true;
    }

    if (/[?&]ausol\b/.test(adresse)) {
        preparerUnePartieDActeIV(3, ["petale", "baguette"]);
        console.log("%cActe IV, phase 3 : elle est à terre (?ausol).", "color:#c9a876;font-weight:bold");
        return true;
    }

    if (/[?&]nid\b/.test(adresse)) {
        preparerUnePartieDActeIV(4, ["petale", "baguette_cassee"]);
        console.log("%cActe IV : le nid (?nid).", "color:#c9a876;font-weight:bold");
        return true;
    }

    if (/[?&]corde\b/.test(adresse)) {
        preparerUnePartieDActeIV(5, ["petale", "baguette_cassee", "de", "couvercle"], ["nid_fait"]);
        console.log("%cActe IV : le retour et la corde (?corde).", "color:#c9a876;font-weight:bold");
        return true;
    }

    if (/[?&]fin\b/.test(adresse)) {
        preparerUnePartieDActeIV(6, [],
            ["nid_fait", "cour_finie", "epi_arrive", "epi_gateau",
                "epi_veilleuse", "epi_elastique", "epi_petale"]);
        memoire.acte = 6;
        sauvegarder();
        console.log("%cLe mot de la fin (?fin).", "color:#c9a876;font-weight:bold");
        return true;
    }

    return false;
}
