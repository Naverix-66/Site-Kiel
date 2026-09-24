/* ============================================================
   ACTE IV — LA MOUETTE
   ============================================================
   Bob est en bas de tout, dans l'herbe trempée, avec une baguette
   qui n'est pas une épée. Le nid est en haut du grand arbre, et
   Rosy est dedans.

   ------------------------------------------------------------
   CE QUI TIENT TOUT L'ACTE

   1. L'ARBRE NE SE GRIMPE PAS. On le montre en trente secondes,
      au début, et on ne revient jamais dessus. Bob ne monte pas :
      c'est ELLE qui l'emporte, et c'est en se faisant emporter
      qu'il arrive enfin à portée de la corde.

   2. LE PYJAMA DE SAMSAM PEND CONTRE LE MUR, dans le décor,
      quarante-quatre pixels au-dessus de sa tête, pendant tout le
      combat. Personne ne le montre du doigt.

   3. SES AFFAIRES LE QUITTENT UNE PAR UNE, et c'est le calendrier
      de l'acte : le dé (il brille, elle le vise), puis le
      couvercle (c'est la chose la plus brillante de la cour),
      puis la baguette qui casse. Tout monte dans le nid : il
      retrouve ses affaires avant de la retrouver, elle.

   4. LE PÉTALE NE SERT À RIEN. Jusqu'au moment où tout le reste a
      cassé.

   5. JAMAIS DE MORT. Rater coûte du terrain, du temps, et le ciel
      s'éclaircit d'un cran — on croit d'abord à un compte à
      rebours, et on finit par comprendre que le jour qui se lève
      est la bonne nouvelle.

   ------------------------------------------------------------
   LES COMMANDES

     souris / doigt   là où on tire, Bob marche. Tenu SUR lui, il
                      lève le couvercle au-dessus de sa tête.
     flèches          gauche/droite pour marcher, bas ou espace
                      pour le couvercle.

   Se protéger, c'est se clouer sur place : exactement la règle de
   la façade (se coller au mur, c'est ne plus descendre).

   ------------------------------------------------------------
   POUR TESTER

       octobre.html?acte4

   ------------------------------------------------------------
   LES RÈGLES D'ÉCRITURE NE CHANGENT PAS (voir acte1.js).
   ============================================================ */


const COMBAT = {

    hauteurBob: 56,       // la case du sprite ; sa vraie hauteur ≈ 43
    pieds: 24,
    marche: 74,           // px par seconde
    rayon: 14,

    // Le couvercle : il bloque TOUJOURS, sans adresse. Mais levé
    // dans la dernière demi-seconde, il fait DONG au lieu de CLONG,
    // et c'est la seule ouverture de la baguette.
    parade: 0.40,
    couvercleHaut: 30,

    // Le piqué : annoncé par Bluey, puis elle se fige, puis elle
    // tombe. Elle ne corrige JAMAIS sa trajectoire en vol.
    annonce: 0.6,
    fige: 0.8,
    // ⚠️ Mesuré : elle vise où Bob était il y a VISEILYA secondes,
    // donc marcher sans s'arrêter le met VISEILYA x marche = 41 px à
    // côté. Il faut que ça dépasse franchement le rayon de contact
    // (22 px), sinon le joueur qui esquive se fait quand même
    // toucher, et l'esquive n'existe pas.
    viseIlYA: 0.55,       // elle vise où était Bob il y a...
    vitessePique: 400,

    sonnee: 2.2,          // le temps qu'elle reste au sol après un DONG
    portee: 26,           // la portée de la baguette
    reculBob: 150,        // ce qu'un coup d'aile lui coûte, en px
};


const combat = {

    phase: 0,             // 0 l'ouverture, 1 l'ombre, 2 le phare, 3 elle se pose, 4 elle le prend
    etat: "attente",      // attente | jeu | scene | fin
    debut: 0,

    bob: {
        x: 120, y: COUR.sol, vers: 1, marche: false,
        couvercle: false, depuis: 0, sonne: 0, souvenirs: [],
    },

    oiseau: {
        x: COUR.nid.x, y: COUR.nid.y + 20,
        etat: "nid",      // nid | annonce | fige | pique | sol | marche | remonte | cri | emporte
        jusqua: 0,
        cible: 0,
        vx: 0, vy: 0,
        vers: -1,
        touchee: 0,       // nombre de coups de baguette reçus
    },

    piques: 0,
    dong: 0,
    voix: [],
    secousse: 0,
    aube: 0,              // 0 = nuit noire, 1 = le jour se lève
    moments: {},
    doigt: { enfonce: false, position: null, id: null },
    ui: null,
};


/* ============================================================
   LA SCÈNE
   ============================================================ */
scene("cour", function () {

    charger();
    APPARENCES.samsam = "samsam_sans_pyjama";
    preparerLesSons();

    // La liste de ses affaires passe à droite : c'est elle qu'on
    // regarde se vider pendant tout l'acte, mais pas au prix de la
    // fenêtre de Klara, qui est dans le coin haut-gauche.
    inventaire.aDroite = true;
    preparerInventaire();

    brancherLeDoigtDeLaCour();

    installerLInterfaceDuCombat();
    remettreLeCombat();

    onUpdate(function () {
        majLeSonDeLaCour();
        if (!dialogueEnCours() && !jeuEnCours() && combat.etat === "jeu") {
            majBob();
            majLOiseau();
            majLesMomentsDuCombat();
        }
        majLaCameraDeLaCour();
        majLInterfaceDuCombat();
    });

    onDraw(function () {
        drawSprite({ sprite: "cour_fond", pos: vec2(0, 0), width: COUR.L, height: COUR.H });
        dessinerLaFenetreDeLoin();
        dessinerLAube();
        dessinerLeFaisceau();
        dessinerLOiseau();
        dessinerBobDansLaCour();
        dessinerLaPluieDeLaCour();
    });

    if (!saitQue("cour_commencee")) {
        afficherCarton("Acte IV", "La mouette", function () {
            noter("cour_commencee");
            lOuvertureDeLaCour();
        });
    } else {
        combat.etat = "jeu";
    }
});


// L'arène est FIXE : on ne suit plus Bob, on le regarde. Tout le
// cadre tient à l'écran, et la distance entre lui et la fenêtre
// jaune se voit du début à la fin.
function majLaCameraDeLaCour() {
    const zoom = Math.min(width() / COUR.L, height() / COUR.H);
    setCamScale(zoom);
    setCamPos(
        COUR.L / 2 + (combat.secousse > 0 ? rand(-4, 4) : 0),
        COUR.H / 2 + (combat.secousse > 0 ? rand(-4, 4) : 0)
    );
    if (combat.secousse > 0) combat.secousse -= dt();
}


function remettreLeCombat() {
    combat.moments = memoire.drapeaux.combat_moments || {};
    combat.phase = memoire.drapeaux.combat_phase || 0;
    combat.bob.x = 120;
    combat.bob.y = COUR.sol;
    combat.oiseau.x = COUR.nid.x;
    combat.oiseau.y = COUR.nid.y + 20;
    combat.oiseau.etat = "nid";
    combat.etat = "attente";
    combat.debut = time();
}


/* ============================================================
   BOB
   ============================================================ */
function ceQueLeJoueurVeut() {

    const f = lireFleches();
    if (f.x !== 0) return { marche: f.x, couvercle: false };
    if (f.y > 0) return { marche: 0, couvercle: true };

    const tenu = doigtDeLaCour();
    if (!tenu) return { marche: 0, couvercle: false };

    const monde = toWorld(tenu);
    const ecart = monde.x - combat.bob.x;

    // Tenu SUR lui : il se protège. Tenu plus loin : il marche.
    if (Math.abs(ecart) < 34) return { marche: 0, couvercle: true };
    return { marche: Math.max(-1, Math.min(1, ecart / 60)), couvercle: false };
}


function majBob() {

    const b = combat.bob;
    const ordre = ceQueLeJoueurVeut();

    if (time() < b.sonne) {
        b.marche = false;
        return;
    }

    // Le couvercle se lève tout de suite et se baisse tout de suite :
    // c'est une posture, pas une animation.
    if (ordre.couvercle && !b.couvercle) b.depuis = time();
    b.couvercle = ordre.couvercle && aObjet("couvercle");

    b.marche = !b.couvercle && ordre.marche !== 0;
    if (b.marche) {
        b.x += ordre.marche * COMBAT.marche * dt();
        b.vers = ordre.marche > 0 ? 1 : -1;
    }
    b.x = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, b.x));

    // On garde où il était : elle vise où il ÉTAIT, pas où il est.
    b.souvenirs.push({ t: time(), x: b.x });
    while (b.souvenirs.length && b.souvenirs[0].t < time() - 1.2) b.souvenirs.shift();
}


function bobIlYA(secondes) {
    const b = combat.bob;
    for (let i = 0; i < b.souvenirs.length; i++) {
        if (b.souvenirs[i].t >= time() - secondes) return b.souvenirs[i].x;
    }
    return b.x;
}


/* ============================================================
   LA MOUETTE
   ============================================================
   Un seul motif dans la phase 1, avec un tell énorme : elle se
   fige en l'air, et elle tombe sur l'endroit où Bob était il y a
   quatre dixièmes de seconde. Elle ne corrige jamais. Tout le
   reste de l'acte se construit là-dessus.
   ============================================================ */
function majLOiseau() {

    const o = combat.oiseau;
    const b = combat.bob;

    if (o.etat === "nid") {
        // Elle ne bouge pas tant que Bob n'a pas touché l'arbre, ou
        // tant que la phase n'a pas commencé.
        if (combat.phase >= 1 && time() > o.jusqua) lancerUnPique();
        return;
    }

    if (o.etat === "annonce") {
        o.y = COUR.nid.y + 20 - (time() - (o.jusqua - COMBAT.annonce)) * 20;
        if (time() > o.jusqua) {
            o.etat = "fige";
            o.jusqua = time() + COMBAT.fige;
            o.x = COUR.L / 2 + (b.x - COUR.L / 2) * 0.6;
            o.y = 150;
        }
        return;
    }

    if (o.etat === "fige") {
        // Elle tient en l'air, ailes en V. C'est le moment où le
        // joueur décide : sortir de la ligne, ou lever le couvercle.
        o.y = 150 + Math.sin(time() * 9) * 3;
        if (time() > o.jusqua) {
            o.cible = bobIlYA(COMBAT.viseIlYA);
            const d = vec2(o.cible - o.x, COUR.sol - 16 - o.y).unit();
            o.vx = d.x * COMBAT.vitessePique;
            o.vy = d.y * COMBAT.vitessePique;
            o.vers = o.vx < 0 ? -1 : 1;
            o.etat = "pique";
            if (typeof sonSynthe === "function") sonSynthe("rafale", 0.5);
        }
        return;
    }

    if (o.etat === "pique") {
        o.x += o.vx * dt();
        o.y += o.vy * dt();

        // Le couvercle bloque toujours. Levé tard, il fait DONG.
        if (Math.abs(o.x - b.x) < COMBAT.rayon + 8 && Math.abs(o.y - (b.y - 20)) < 30) {
            if (b.couvercle) {
                const tard = time() - b.depuis < COMBAT.parade;
                elleSEcrase(tard);
            } else {
                elleTouche();
            }
            return;
        }
        if (o.y > COUR.sol - 14) {
            // Elle a raté. Elle ne repart pas : elle se pose, et elle
            // picore l'herbe comme si de rien n'était.
            o.y = COUR.sol - 14;
            o.etat = "marche";
            o.jusqua = time() + 2.6;
            if (typeof jouerSon === "function") jouerSon("atterrissage", { volume: 0.5 });
        }
        return;
    }

    if (o.etat === "marche") {
        o.x += o.vers * 26 * dt();
        if (o.x < 80 || o.x > COUR.L - 80) o.vers *= -1;
        if (time() > o.jusqua) remonterAuNid();
        return;
    }

    if (o.etat === "sol") {
        // Sonnée. C'est le seul endroit du jeu où une baguette à
        // sushi a un sens : elle est à sa taille, et elle ne bouge pas.
        if (time() > o.jusqua) remonterAuNid();
        return;
    }

    if (o.etat === "remonte") {
        o.x += (COUR.nid.x - o.x) * Math.min(1, dt() * 2.2);
        o.y += (COUR.nid.y + 20 - o.y) * Math.min(1, dt() * 2.2);
        if (Math.abs(o.y - (COUR.nid.y + 20)) < 4) {
            o.etat = "nid";
            o.jusqua = time() + 2.2 + Math.random() * 1.6;
        }
        return;
    }
}


function lancerUnPique() {
    const o = combat.oiseau;
    o.etat = "annonce";
    o.jusqua = time() + COMBAT.annonce;
    combat.piques++;
    crierDeLaFenetre("bluey", ["ELLE ARRIVE !!", "BOB !! ELLE DESCEND !!", "ATTENTION !! ATTENTION !!"][combat.piques % 3]);
}


function remonterAuNid() {
    const o = combat.oiseau;
    o.etat = "remonte";
}


/* Le couvercle bloque TOUJOURS : il n'y a aucune adresse à avoir,
   et Klara ne peut pas se sentir mauvaise. Mais levé dans la
   dernière demi-seconde, il ne se contente pas d'arrêter le bec :
   il le RENVOIE. Elle s'écrase, elle reste au sol deux secondes, à
   sa taille, et c'est la seule fois où une baguette à sushi sert à
   quelque chose. Lever tôt, c'est survivre ; lever tard, c'est
   gagner du terrain. */
function elleSEcrase(dong) {

    const o = combat.oiseau;
    combat.secousse = dong ? 0.4 : 0.2;

    if (typeof sonSynthe === "function") sonSynthe(dong ? "clang" : "tok", dong ? 1 : 0.7);
    if (typeof shake === "function") shake(dong ? 12 : 5);

    if (dong) {
        o.etat = "sol";
        o.y = COUR.sol - 14;
        o.jusqua = time() + COMBAT.sonnee;
        combat.dong++;
        if (combat.dong === 1) premierDong();
        else crierDeLaFenetre("bluey", "ENCORE !! REFAIS-LE !!");
    } else {
        // Elle rebondit dessus et repart, intacte.
        o.etat = "remonte";
        crierDeLaFenetre("cakey", "Elle a tapé dedans, Bob ! Tiens bon !");
    }
}


function elleTouche() {

    const o = combat.oiseau;
    const b = combat.bob;

    b.sonne = time() + 0.9;
    b.x += (o.vx > 0 ? 1 : -1) * COMBAT.reculBob;
    b.x = Math.max(COUR.marche.gauche, Math.min(COUR.marche.droite, b.x));
    b.couvercle = false;

    o.etat = "remonte";
    combat.secousse = 0.6;
    combat.aube = Math.min(1, combat.aube + 0.06);

    if (typeof sonSynthe === "function") sonSynthe("tok", 1);
    if (typeof shake === "function") shake(9);
    crierDeLaFenetre("doudou", "Relève-toi, mon grand. Elle est déjà repartie.");
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


function majLesMomentsDuCombat() {

    // Fin de la phase 1 : au cinquième piqué, elle ne vise plus Bob.
    if (combat.phase === 1 && combat.piques >= 5 && combat.oiseau.etat === "nid"
        && !combat.moments.de && !momentDuCombat("de")) {
        elleEmporteLeDe();
    }
}


function premierDong() {
    combat.etat = "scene";
    lancerDialogue([
        { texte: "Le bec tape le couvercle de jus de mangue. Toute la cour sonne, et le mur d'en face renvoie le bruit une seconde plus tard." },
        { texte: "Quelque part, une fenêtre s'allume. Un carré jaune tombe sur l'herbe, puis s'éteint." },
        { qui: "bluey", texte: "ÇA A FAIT DONG !! BOB A FAIT DONG !!" },
        { qui: "bob", texte: "...ça marche." },
    ], function () { combat.etat = "jeu"; });
}


/* ------------------------------------------------------------
   L'OUVERTURE — on tue l'idée de grimper, en trente secondes
   ------------------------------------------------------------ */
function lOuvertureDeLaCour() {

    combat.etat = "scene";
    lancerDialogue([
        { texte: "L'herbe est trempée et elle sent la terre. Au-dessus, la cour est immense, et elle est vide." },
        { texte: "Le grand arbre est là, à vingt pas. Tout en haut, dans la première fourche, il y a un tas de brindilles qui accroche la lumière par endroits." },
        { qui: "bob", texte: "Rosy." },
        { texte: "Bob attrape l'écorce. Il monte de trois pattes. L'écorce est mouillée." },
        { texte: "Il redescend sur les fesses." },
        { texte: "Il recommence. Il monte un peu plus haut. Il redescend de la même façon." },
        { qui: "doudou", texte: "Mon grand." },
        { qui: "doudou", texte: "Quand j'ai traversé, je n'ai pas marché une seule fois." },
        { qui: "doudou", texte: "On m'a porté tout le long. Dans un sac, dans un train, dans des bras." },
        { qui: "doudou", texte: "Je n'ai jamais choisi le chemin. J'ai juste tenu bon pendant qu'on m'emmenait." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Elle est trop haut, Doudou." },
        { qui: "doudou", texte: "Oui." },
        { qui: "doudou", texte: "Alors attends qu'elle descende." },
        { texte: "Tout en haut du mur, très loin, un rectangle jaune grand comme un ongle. Quatre petites têtes dedans." },
        { qui: "cakey", texte: "On est là, Bob ! On voit tout !" },
        { qui: "bluey", texte: "MOI JE VOIS MIEUX QUE TOUT LE MONDE !!" },
        { qui: "doudou", texte: "Alors regarde bien, Bluey. Et dis-lui tout ce que tu vois." },
    ], function () {
        combat.phase = 1;
        combat.etat = "jeu";
        combat.oiseau.jusqua = time() + 2;
        memoire.drapeaux.combat_phase = 1;
        sauvegarder();
    });
}


function elleEmporteLeDe() {

    combat.etat = "scene";
    lancerDialogue([
        { texte: "Elle repart en l'air, et elle se fige encore une fois. Mais cette fois elle ne regarde pas Bob." },
        { texte: "Elle regarde ce qui brille sur sa tête." },
        { qui: "bluey", texte: "ELLE REGARDE TA TÊTE !! BOB !! ELLE REGARDE TA TÊTE !!" },
        { qui: "doudou", texte: "La dame qui était assise en face, à Sylt. Elle avait ses lunettes de soleil posées sur les cheveux." },
        { qui: "doudou", texte: "Elles brillaient. C'est là que la mouette a regardé en premier." },
        { texte: "Le dé à coudre part avec elle. On l'entend tomber dans le nid, tout en haut, avec un bruit de petite monnaie.", quand: perdreLeDe },
        { texte: "Bob est tête nue. La cour est plus froide d'un coup." },
        { qui: "bob", texte: "Il est là-haut, maintenant." },
        { qui: "bob", texte: "Tout ce qu'elle me prend est là-haut." },
        { qui: "bob", texte: "...c'est là que je vais, de toute façon." },
    ], function () {
        combat.phase = 2;
        combat.etat = "jeu";
        memoire.drapeaux.combat_phase = 2;
        sauvegarder();
    });
}


function perdreLeDe() {
    const i = memoire.objets.indexOf("de");
    if (i >= 0) memoire.objets.splice(i, 1);
    redessinerInventaire();
    sauvegarder();
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.6);
}


/* ============================================================
   LES VOIX D'EN HAUT
   ============================================================ */
function crierDeLaFenetre(qui, texte) {
    combat.voix.push({ qui: qui, texte: texte, jusqua: time() + 3.4 });
    if (combat.voix.length > 3) combat.voix.shift();
    if (typeof demarrerBavardage === "function" && qui !== "bob") {
        demarrerBavardage(qui);
        wait(0.3, arreterBavardage);
    }
}


/* ============================================================
   LE DESSIN
   ============================================================ */
function dessinerBobDansLaCour() {

    const b = combat.bob;
    let frame = 2;
    if (time() < b.sonne) frame = 0;
    else if (b.couvercle) frame = 1;
    else if (b.marche) frame = 12 + Math.floor(time() * 8) % 4;

    const angle = time() < b.sonne ? 18 * b.vers : 0;

    drawSprite({
        sprite: "bob", frame: frame,
        pos: vec2(b.x, b.y + 2),
        width: COMBAT.hauteurBob, height: COMBAT.hauteurBob,
        anchor: "bot", flipX: b.vers < 0, angle: angle,
    });

    // Le couvercle, levé au-dessus de la tête.
    if (b.couvercle) {
        const y = b.y - COMBAT.couvercleHaut - 14;
        drawEllipse({ pos: vec2(b.x, y), radiusX: 15, radiusY: 5, color: rgb(150, 152, 156) });
        drawEllipse({ pos: vec2(b.x, y - 1), radiusX: 12, radiusY: 3.5, color: rgb(196, 198, 202) });
        drawEllipse({ pos: vec2(b.x, y - 2), radiusX: 5, radiusY: 1.5, color: rgb(226, 228, 232) });
    }
}


function dessinerLOiseau() {

    const o = combat.oiseau;
    let frame = 0;
    let flip = o.vers > 0;

    if (o.etat === "nid" || o.etat === "annonce") frame = 0;
    else if (o.etat === "fige") frame = 13;            // ailes grandes ouvertes
    else if (o.etat === "pique") frame = 12;
    else if (o.etat === "marche") frame = 4 + Math.floor(time() * 7) % 4;
    else if (o.etat === "sol") frame = 3;              // sonnée
    else if (o.etat === "remonte") frame = 8 + Math.floor(time() * 9) % 4;

    // Son ombre sur l'herbe : elle arrive TOUJOURS avant elle.
    if (o.y < COUR.sol - 30) {
        const k = Math.max(0, 1 - (COUR.sol - o.y) / 400);
        drawEllipse({
            pos: vec2(o.x, COUR.sol + 4),
            radiusX: 16 + k * 22, radiusY: 4 + k * 5,
            color: rgb(0, 0, 0), opacity: 0.18 + k * 0.3,
        });
    }

    drawSprite({
        sprite: "mouette", frame: frame,
        pos: vec2(o.x, o.y),
        width: CASE_MOUETTE, height: CASE_MOUETTE,
        anchor: "center", flipX: flip,
    });
}


// Le ciel qui s'éclaircit : le joueur croit d'abord à un compte à
// rebours. C'est le contraire.
function dessinerLAube() {
    if (combat.aube <= 0) return;
    drawRect({
        pos: vec2(0, 0), width: COUR.L, height: COUR.horizon + 40,
        color: rgb(120, 126, 150), opacity: combat.aube * 0.22,
    });
}


/* ------------------------------------------------------------
   LA FENÊTRE, TOUT EN HAUT À GAUCHE
   ------------------------------------------------------------
   Grande comme un ongle, et c'est la seule chose chaude de tout
   l'écran. Ils sont cinq dedans, à deux étages au-dessus, et ils
   ne peuvent rien faire d'autre que regarder et crier. C'est
   exactement ce que l'acte leur demande.
   ------------------------------------------------------------ */
const FENETRE_DE_LOIN = (function () {
    const f = COUR.facade;
    const t = FACADE.travees[FACADE.traveeDeKlara];
    const e = f.echelle;
    return {
        x: f.x + (t.x + 6 - f.depuisX) * e,
        y: (FACADE.baies[0] + 6 - f.depuisY) * e,
        l: (t.l - 12) * e,
        h: (FACADE.hauteurBaie - 15) * e,
    };
})();


function dessinerLaFenetreDeLoin() {

    const w = FENETRE_DE_LOIN;

    drawRect({ pos: vec2(w.x, w.y), width: w.l, height: w.h, color: rgb(24, 20, 28) });
    drawRect({
        pos: vec2(w.x, w.y), width: w.l, height: w.h,
        color: rgb(255, 202, 128), opacity: 0.30 + Math.sin(time() * 1.4) * 0.02,
    });

    // La flaque de lumière qu'elle jette sur la façade autour.
    for (let i = 5; i >= 1; i--) {
        drawCircle({
            pos: vec2(w.x + w.l / 2, w.y + w.h / 2),
            radius: (w.l * 0.9) * (i / 5),
            color: rgb(255, 196, 110), opacity: 0.035 * (1 - i / 7),
        });
    }

    // Eux. Le plus grand derrière, le plus petit qui saute devant.
    const sol = w.y + w.h + 8;
    const monde = [
        { cle: "samsam", dx: 0.58 },
        { cle: "cakey", dx: 0.33 },
        { cle: "doudou", dx: 0.16 },
        { cle: "fraisy", dx: 0.78 },
        { cle: "bluey", dx: 0.90, saute: true },
    ];
    monde.forEach(function (p, i) {
        const taille = 22 * (PERSONNAGES[p.cle] ? PERSONNAGES[p.cle].taille : 1);
        const bouge = p.saute
            ? -Math.max(0, Math.sin(time() * 3.1)) * 5
            : Math.sin(time() * 2 + i) * 0.8;
        drawSprite({
            sprite: apparenceDe(p.cle), frame: 0,
            pos: vec2(w.x + w.l * p.dx, sol + bouge),
            width: taille, height: taille, anchor: "bot", opacity: 0.95,
        });
    });

    // On repeint l'appui par-dessus leurs pieds, découpé dans le
    // décor lui-même : ils sont DANS la pièce, accoudés au rebord.
    const bande = w.y + w.h;
    drawSprite({
        sprite: "cour_fond",
        pos: vec2(w.x - 8, bande), width: w.l + 16, height: 22,
        quad: quad((w.x - 8) / COUR.L, bande / COUR.H, (w.l + 16) / COUR.L, 22 / COUR.H),
    });
}


function dessinerLeFaisceau() {
    // (phase 2 : le phare de Cakey)
}


function dessinerLaPluieDeLaCour() {
    // Il ne pleut plus vraiment : il tombe ce qui reste dans les arbres.
    for (let i = 0; i < 26; i++) {
        const x = (i * 211.7) % COUR.L;
        const y = ((time() * (60 + (i % 5) * 20) + i * 97) % COUR.H);
        drawRect({ pos: vec2(x, y), width: 1, height: 4, color: rgb(150, 170, 190), opacity: 0.12 });
    }
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
        pos(0, 0), anchor("center"), color(...COULEUR_CREME),
        opacity(0), fixed(), z(Z_INTERFACE),
    ]);

    combat.ui = ui;
    combat.aide = time() + 20;
}


function majLInterfaceDuCombat() {

    const ui = combat.ui;
    if (!ui) return;
    const cache = dialogueEnCours() || jeuEnCours();

    const vivantes = combat.voix.filter(function (v) { return time() < v.jusqua; });
    combat.voix = vivantes;
    if (vivantes.length) {
        const v = vivantes[vivantes.length - 1];
        const p = PERSONNAGES[v.qui];
        ui.voix.text = (p ? p.nom : "") + " — " + v.texte;
        ui.voix.color = rgb(...(p ? eclaircir(p.couleurPlaceholder, 0.35) : COULEUR_CREME));
        ui.voix.textSize = echelleInterface() - 2;
        ui.voix.width = Math.min(320, width() - 44);
        ui.voix.pos = vec2(22, height() * 0.24);
        ui.voix.opacity = cache ? 0 : Math.min(1, (v.jusqua - time()) / 0.6) * 0.92;
    } else {
        ui.voix.opacity = 0;
    }

    const reste = (combat.aide || 0) - time();
    ui.aide.text = "Marche : tire à gauche ou à droite (ou ← →). "
        + "Tiens le doigt SUR Bob (ou ↓) : il lève le couvercle, et il ne bouge plus.";
    ui.aide.textSize = echelleInterface() - 1;
    ui.aide.width = Math.min(width() - 60, 500);
    ui.aide.pos = vec2(width() / 2, height() - 46);
    ui.aide.opacity = cache ? 0 : Math.max(0, Math.min(1, reste / 2)) * 0.85;
}


/* ============================================================
   LE DOIGT, ET LE SON
   ============================================================ */
function brancherLeDoigtDeLaCour() {

    const d = combat.doigt;
    const poser = function (position, id) { d.enfonce = true; d.position = position; d.id = id; };
    const bouger = function (position, id) { if (d.enfonce && id !== d.id) return; d.position = position; };
    const lever = function () { d.enfonce = false; };

    onMousePress(function () { poser(mousePos(), "souris"); });
    onMouseMove(function () { bouger(mousePos(), "souris"); });
    onMouseRelease(lever);
    onTouchStart(function (p, t) { poser(p, t ? t.identifier : 0); });
    onTouchMove(function (p, t) { bouger(p, t ? t.identifier : 0); });
    onTouchEnd(lever);

    // La baguette : trois coups dans tout l'acte, et seulement sur
    // une mouette au sol.
    onKeyPress("space", frapper);
    onMousePress(frapper);
}


function frapper() {

    if (combat.etat !== "jeu" || dialogueEnCours() || jeuEnCours()) return;
    const o = combat.oiseau;
    if (o.etat !== "sol") return;
    if (!aObjet("baguette")) return;
    if (Math.abs(o.x - combat.bob.x) > COMBAT.portee + 20) return;

    o.touchee++;
    combat.secousse = 0.25;
    if (typeof sonSynthe === "function") sonSynthe("tok", 0.8);
    if (o.touchee === 1) crierDeLaFenetre("fraisy", "VAS-Y BOB !!");
}


function doigtDeLaCour() {
    const d = combat.doigt;
    if (!d.enfonce || !d.position) return null;
    if (dialogueEnCours() || jeuEnCours()) return null;
    return d.position;
}


function majLeSonDeLaCour() {
    if (typeof volumeDeBoucle !== "function" || !son.ctx) return;
    if (typeof musiqueDuDehors === "function") musiqueDuDehors(true);
    volumeDeBoucle("vent", 0.35);
    volumeDeBoucle("nuit", 0.5);
}


/* ============================================================
   L'ENTRÉE DANS L'ACTE
   ============================================================ */
function commencerActeIV() {
    memoire.acte = 4;
    noter("acte4");
    delete memoire.drapeaux.combat_phase;
    delete memoire.drapeaux.combat_moments;
    sauvegarder();
    go("cour");
}


// octobre.html?acte4
function raccourciActeIV() {

    if (typeof location === "undefined" || !/[?&]acte4\b/.test(location.search)) return false;

    memoire.drapeaux = {};
    [
        "ouverture", "fenetre_vue", "bluey_lance", "bluey_1", "bluey_2", "bluey_3",
        "bluey_ok", "miroir", "cakey_bonjour", "cakey_ok", "fraisy_faim", "fraisy_ok",
        "samsam_trouve", "samsam_couvert", "samsam_ok", "bluey_retour", "verite",
        "cakey_secret", "petale", "moin", "acte2",
        "averti_bruit", "arme", "bouclier", "casque", "jus_ouvert",
        "veilleuse_debranchee", "rallonge", "phare", "depart", "acte3",
        "descente_commencee", "descente_finie", "acte4",
    ].forEach(function (d) { memoire.drapeaux[d] = true; });
    memoire.objets = ["petale", "baguette", "couvercle", "de"];
    memoire.acte = 4;
    sauvegarder();

    try { history.replaceState(null, "", location.pathname); } catch (e) { /* tant pis */ }
    console.log("%cActe IV : partie préparée (?acte4).", "color:#c9a876;font-weight:bold");
    return true;
}
