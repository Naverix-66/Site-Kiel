/* ============================================================
   L'OUVERTURE ANIMÉE — Bob dans le lit, puis au pied du lit
   ============================================================
   Evan : « si t'arrives à faire une petite animation pour
   commencer le jeu, c'est génial ».

   Le texte de l'ouverture est dans acte1.js, et il ne change pas.
   Ce fichier ne fait que le mettre en images, réplique par
   réplique, grâce au champ « quand » des répliques :

     « 2 h 14. »                  la nuit, Bob dort, des « z »
     « Bob se réveille… froid »   il frissonne
     « … »                        il se redresse
     « Au-dessus de la tête… »    la caméra monte vers la fenêtre
     « Bon. »                     elle redescend sur Bob
     « Il descend du lit… »       il traverse la couette et saute

   ------------------------------------------------------------
   LE PRINCIPE TECHNIQUE

   Le vrai Bob a une boîte de collision, et le lit est solide : le
   poser dessus, c'est se faire éjecter par la physique. Pendant
   l'ouverture, le vrai Bob est donc CACHÉ, déjà posé à son point
   de départ, et c'est un ACTEUR — le même dessin, sans physique —
   qui joue la scène. Quand l'acteur atterrit, il cède sa place
   au vrai Bob, pile au même endroit.

   Si le joueur passe les répliques très vite, introTermine()
   saute directement à la dernière image : l'ouverture ne peut
   jamais laisser Bob coincé dans le lit.
   ============================================================ */


const intro = {
    enCours: false,
    acteur: null,
    voile: null,
    camera: null,        // le point regardé, lissé
    cible: null,         // le point que la caméra veut regarder
    phase: "",
    debutPhase: 0,
    prochainZ: 0,
    prochainVent: 0,
    particules: [],
    depart: null,        // les pieds de Bob, couché
    bord: null,          // le bord du lit, avant le saut
    arrivee: null,       // son point de départ dans la partie
};


// Réglages de la scène, en pixels du monde.
const INTRO_VITESSE_MARCHE = 70;
const INTRO_DUREE_SAUT = 0.45;
const INTRO_HAUTEUR_SAUT = 16;
const INTRO_OPACITE_NUIT = 0.5;


function introEnCours() {
    return intro.enCours;
}


// Ce que la caméra doit suivre pendant l'ouverture.
function pointDeVueIntro() {
    return intro.camera;
}


/* ------------------------------------------------------------
   « 2 h 14. »
   ------------------------------------------------------------ */
function introCommence() {

    const bob = get("bob")[0];
    if (!bob) return;

    intro.enCours = true;
    bob.hidden = true;
    if (bob.ombre) bob.ombre.hidden = true;

    const piece = PIECES.studio;
    intro.arrivee = vec2(
        piece.departDeBob.x * TAILLE_TUILE + TAILLE_TUILE / 2,
        piece.departDeBob.y * TAILLE_TUILE + TAILLE_TUILE
    );

    // Sa place dans le lit : la tête sur les oreillers (contre le
    // mur de gauche), les pieds vers le milieu, dans la moitié du
    // lit la plus proche de nous. Le lit va des cases 1 à 5.
    intro.depart = vec2(3 * TAILLE_TUILE + 2, intro.arrivee.y - 20);
    intro.bord = vec2(5 * TAILLE_TUILE + 16, intro.depart.y);

    intro.acteur = add([
        sprite("bob", { anim: "idle-bas" }),
        pos(intro.depart),
        anchor("bot"),
        rotate(-90),          // couché, la tête à gauche
        scale(1 / FINESSE_PELUCHES),
        z(Z_DECOR + 20 * TAILLE_TUILE),
        { animEnCours: "idle-bas" },
    ]);

    // La nuit. Elle se lève quand Bob pose le pied par terre :
    // ce sont ses yeux qui s'habituent au noir.
    intro.voile = add([
        rect(width(), height()),
        pos(0, 0),
        fixed(),
        color(...COULEUR_NUIT),
        opacity(INTRO_OPACITE_NUIT),
        z(Z_INTERFACE - 100),
    ]);

    intro.camera = intro.depart.sub(vec2(20, 10));
    intro.cible = intro.camera;
    changerDePhase("dort");

    intro.boucle = onUpdate(animerIntro);
}


function introFrisson() { changerDePhase("frisson"); }
function introSeRedresse() { changerDePhase("redresse"); }
function introRevientABob() { changerDePhase("decide"); }
function introDescendDuLit() { changerDePhase("marche"); }

function introRegardeLaFenetre() {
    changerDePhase("regarde");
    // Le rideau tombé, sous la fenêtre de gauche.
    intro.cible = vec2(3.5 * TAILLE_TUILE, 2 * TAILLE_TUILE);
}


function changerDePhase(nom) {
    if (!intro.enCours) return;
    intro.phase = nom;
    intro.debutPhase = time();
}


/* ------------------------------------------------------------
   La boucle de l'ouverture, une fois par image.
   ------------------------------------------------------------ */
function animerIntro() {

    if (!intro.enCours) return;

    const a = intro.acteur;
    const t = time() - intro.debutPhase;

    // Le voile suit la taille de l'écran (téléphone qu'on tourne).
    intro.voile.width = width();
    intro.voile.height = height();

    const surLeLit = intro.phase === "dort" || intro.phase === "frisson";

    if (intro.phase === "dort") {
        a.angle = -90;
        if (time() > intro.prochainZ) {
            intro.prochainZ = time() + 0.9;
            lacherUnZ(a.pos.add(vec2(-38, -14)));
        }

    } else if (intro.phase === "frisson") {
        a.angle = -90;
        a.pos = intro.depart.add(vec2(t < 0.8 ? Math.sin(t * 70) * 1.2 : 0, 0));

    } else if (intro.phase === "redresse") {
        a.pos = intro.depart;
        const k = Math.min(1, t / 0.35);
        a.angle = -90 * (1 - k * k);
        jouerAnimation(a, "idle-bas");

    } else if (intro.phase === "regarde") {
        a.angle = 0;
        jouerAnimation(a, "idle-haut");

    } else if (intro.phase === "decide") {
        a.angle = 0;
        a.flipX = false;
        jouerAnimation(a, "idle-cote");
        intro.cible = a.pos.sub(vec2(0, 16));

    } else if (intro.phase === "marche") {
        a.angle = 0;
        a.flipX = false;
        jouerAnimation(a, "marche-cote");
        const avance = intro.depart.x + t * INTRO_VITESSE_MARCHE;
        if (avance >= intro.bord.x) {
            a.pos = intro.bord;
            changerDePhase("saut");
        } else {
            a.pos = vec2(avance, intro.depart.y);
        }
        intro.cible = a.pos.sub(vec2(0, 16));

    } else if (intro.phase === "saut") {
        const k = Math.min(1, t / INTRO_DUREE_SAUT);
        const sol = intro.bord.lerp(intro.arrivee, k);
        a.pos = sol.sub(vec2(0, Math.sin(k * Math.PI) * INTRO_HAUTEUR_SAUT));
        jouerAnimation(a, "idle-cote");
        if (k >= 1) {
            a.pos = intro.arrivee;
            a.z = Z_DECOR + intro.arrivee.y;
            souleverDeLaPoussiere(intro.arrivee);
            if (typeof jouerSon === "function") jouerSon("atterrissage");
            changerDePhase("atterrit");
        }
        intro.cible = a.pos.sub(vec2(0, 16));

    } else if (intro.phase === "atterrit") {
        // Un petit écrasement à la réception : c'est une peluche.
        const k = Math.min(1, t / 0.2);
        const e = 1 / FINESSE_PELUCHES;
        a.scale = vec2(e * (1 + 0.12 * (1 - k)), e * (1 - 0.15 * (1 - k)));
        if (k >= 1) jouerAnimation(a, "idle-bas");
    }

    if (surLeLit || intro.phase === "redresse") intro.cible = intro.depart.sub(vec2(20, 10));

    // Un filet d'air froid tombe de la fenêtre ouverte, du début à
    // la fin : c'est lui qui a réveillé Bob.
    if (time() > intro.prochainVent) {
        intro.prochainVent = time() + 0.16;
        lacherUnCourantDAir();
    }

    // La caméra glisse vers sa cible au lieu d'y sauter.
    intro.camera = intro.camera.lerp(intro.cible, Math.min(1, dt() * 3));

    animerParticules();
}


/* ------------------------------------------------------------
   Les petites choses qui flottent
   ------------------------------------------------------------ */
function ajouterParticule(objet, vitesse, duree) {
    intro.particules.push({ objet: objet, vitesse: vitesse, fin: time() + duree, duree: duree, opacite: objet.opacity });
}

function animerParticules() {
    intro.particules = intro.particules.filter(function (p) {
        const reste = p.fin - time();
        if (reste <= 0) {
            destroy(p.objet);
            return false;
        }
        p.objet.pos = p.objet.pos.add(p.vitesse.scale(dt()));
        p.objet.opacity = p.opacite * Math.min(1, reste / (p.duree * 0.6));
        return true;
    });
}


function lacherUnZ(position) {
    const lettre = add([
        text("z", { size: 9 }),
        pos(position),
        anchor("center"),
        color(...COULEUR_CREME),
        opacity(0.9),
        z(Z_DECOR + 20 * TAILLE_TUILE + 1),
    ]);
    ajouterParticule(lettre, vec2(-6, -14), 1.6);
}


function lacherUnCourantDAir() {
    // Sous la fenêtre de gauche (cases 4 à 6 de la première ligne).
    const filet = add([
        rect(rand(4, 8), 1),
        pos(rand(4 * TAILLE_TUILE, 7 * TAILLE_TUILE), TAILLE_TUILE + rand(0, 6)),
        color(255, 255, 255),
        opacity(0.45),
        z(Z_DECOR + TAILLE_TUILE * 2),
    ]);
    ajouterParticule(filet, vec2(rand(-10, 10), rand(40, 60)), 1.3);
}


function souleverDeLaPoussiere(sol) {
    [-1, 1].forEach(function (sens) {
        for (let i = 0; i < 2; i++) {
            const grain = add([
                circle(rand(1.5, 2.5)),
                pos(sol.add(vec2(sens * rand(3, 7), -1))),
                color(...COULEUR_CREME),
                opacity(0.7),
                z(Z_DECOR + sol.y + 1),
            ]);
            ajouterParticule(grain, vec2(sens * rand(14, 26), rand(-10, -4)), 0.45);
        }
    });
}


/* ------------------------------------------------------------
   La fin de l'ouverture — appelée quand le dialogue se ferme.
   ------------------------------------------------------------
   Quoi qu'il se soit passé avant, on arrive au même état : Bob
   debout au pied du lit, jouable, la nuit qui se dissipe.
   ------------------------------------------------------------ */
function introTermine() {

    if (!intro.enCours) return;
    intro.enCours = false;

    if (intro.boucle) intro.boucle.cancel();
    intro.particules.forEach(function (p) { destroy(p.objet); });
    intro.particules = [];
    if (intro.acteur) destroy(intro.acteur);
    intro.acteur = null;

    const bob = get("bob")[0];
    if (bob) {
        bob.pos = intro.arrivee;
        bob.direction = "bas";
        bob.flipX = false;
        jouerAnimation(bob, "idle-bas");
        bob.hidden = false;
        if (bob.ombre) bob.ombre.hidden = false;
    }

    // La nuit se dissipe doucement, puis le voile disparaît.
    const voile = intro.voile;
    intro.voile = null;
    const debut = time();
    const fondu = onUpdate(function () {
        const k = Math.min(1, (time() - debut) / 1.6);
        voile.width = width();
        voile.height = height();
        voile.opacity = INTRO_OPACITE_NUIT * (1 - k);
        if (k >= 1) {
            fondu.cancel();
            destroy(voile);
        }
    });
}
