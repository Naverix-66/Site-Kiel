/* ============================================================
   L'HISTOIRE — LE MOTEUR
   ============================================================
   Ce fichier ne raconte RIEN. Il contient la machinerie :
   la mémoire de la partie, l'objectif affiché en haut, la pose
   des peluches, et l'installation des zones interactives.

   Le texte, lui, est dans acte1.js. Les actes suivants auront
   chacun le leur.

   C'est la séparation la plus importante du projet : on peut
   réécrire tout l'acte I sans jamais rouvrir ce fichier, et
   ajouter un personnage sans jamais toucher au dialogue.
   ============================================================ */


/* ============================================================
   LA MÉMOIRE
   ============================================================
   Un seul objet, sauvegardé dans le navigateur sous une seule
   clé. Klara jouera sur son téléphone, probablement en plusieurs
   fois : elle doit pouvoir fermer l'onglet et revenir.

   Tout est enveloppé dans des try/catch : en navigation privée,
   localStorage existe mais LÈVE une exception à l'écriture. Sans
   ça, le jeu planterait chez une partie des joueurs, et
   uniquement chez ceux-là — le pire type de bug à retrouver.
   ============================================================ */
const memoire = {
    acte: 1,
    drapeaux: {},
};


function sauvegarder() {
    try {
        localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(memoire));
    } catch (erreur) {
        // Pas grave : on perd la reprise, pas la partie en cours.
    }
}


/* ------------------------------------------------------------
   RECOMMENCER DEPUIS LE DÉBUT
   ------------------------------------------------------------
   Indispensable pour tester : sans ça, une fois l'ouverture vue,
   elle ne revient jamais, et on ne peut plus juger la première
   minute du jeu — qui est justement celle qui compte le plus.

   DEUX FAÇONS, au choix :

     1. ouvrir octobre.html?neuf
        (c'est la plus simple : on ajoute ?neuf à l'adresse)

     2. taper recommencer() dans la console du navigateur

   Les deux effacent la sauvegarde et rechargent la page.
   ------------------------------------------------------------ */
function recommencer() {
    try {
        localStorage.removeItem(CLE_SAUVEGARDE);
    } catch (erreur) {
        // tant pis, on recharge quand même
    }
    location.reload();
}


// Vrai si l'adresse contient ?neuf — on démarre alors une partie
// vierge sans toucher à la sauvegarde qui existe déjà.
function onVeutUnePartieNeuve() {
    return typeof location !== "undefined"
        && /[?&]neuf\b/.test(location.search);
}


function charger() {

    if (onVeutUnePartieNeuve()) {
        console.log(
            "%cPartie neuve (?neuf) : la sauvegarde est ignorée.",
            "color:#c9a876;font-weight:bold"
        );
        return;
    }

    try {
        const brut = localStorage.getItem(CLE_SAUVEGARDE);
        if (!brut) return;

        const lu = JSON.parse(brut);
        memoire.acte = lu.acte || 1;
        memoire.drapeaux = lu.drapeaux || {};
        memoire.objets = lu.objets || [];
    } catch (erreur) {
        // Sauvegarde corrompue : on repart de zéro plutôt que de
        // planter. Une sauvegarde illisible ne doit jamais
        // empêcher de jouer.
    }
}


function noter(nom) {
    memoire.drapeaux[nom] = true;
    sauvegarder();
}

function oublier(nom) {
    delete memoire.drapeaux[nom];
    sauvegarder();
}

function saitQue(nom) {
    return memoire.drapeaux[nom] === true;
}

// Compte combien de drapeaux d'une liste sont posés. Sert partout
// pour les compteurs de progression ("2 traces sur 3").
function combien(noms) {
    let n = 0;
    noms.forEach(function (nom) { if (saitQue(nom)) n++; });
    return n;
}


/* ============================================================
   L'OBJECTIF À L'ÉCRAN
   ============================================================
   Une seule ligne, en haut. Ce n'est pas du confort : c'est ce
   qui évite qu'on repose le téléphone. À tout instant, le joueur
   doit pouvoir répondre à "je fais quoi, là ?".

   ⚠️ MAIS il ne doit JAMAIS dire OÙ. C'est toute la différence
   entre un objectif et une flèche : "Fouille l'appartement"
   donne une direction, "Va voir la fenêtre" supprime le jeu.
   ============================================================ */
let objetifAffiche = null;
let objetifFond = null;

function creerObjectif() {

    // Un bandeau sombre DERRIÈRE le texte, et pas seulement du
    // texte clair : le sol est du parquet clair, et sans ce fond
    // la ligne disparaît dès que Bob marche sur une lame claire.
    // Règle générale du jeu : aucun texte d'interface ne se pose
    // jamais directement sur le décor.
    objetifFond = add([
        rect(10, 10, { radius: 8 }),
        pos(0, 0),
        anchor("top"),
        fixed(),
        z(Z_INTERFACE - 6),
        color(...COULEUR_NUIT),
        opacity(0),
    ]);

    objetifAffiche = add([
        text("", { size: echelleInterface() - 3, width: 300, align: "center" }),
        pos(0, 0),
        anchor("top"),
        fixed(),
        z(Z_INTERFACE - 5),
        color(...COULEUR_CREME),
        opacity(0.95),
    ]);

    // Le bandeau se redimensionne à chaque image : la hauteur du
    // texte n'est connue de kaplay qu'une image APRÈS qu'on l'a
    // écrit. Sans ce rafraîchissement, un objectif qui passe sur
    // deux lignes déborderait de son fond.
    //
    // Et si l'écran change de taille (téléphone qu'on tourne, onglet
    // ouvert en arrière-plan qui n'avait pas encore de largeur), on
    // refait toute la mise en page : sinon le texte garde la largeur
    // du premier instant — parfois NÉGATIVE — et s'écrit une lettre
    // par ligne sur toute la hauteur de l'écran.
    let largeurConnue = width();
    let hauteurConnue = height();

    objetifAffiche.onUpdate(function () {
        if (width() !== largeurConnue || height() !== hauteurConnue) {
            largeurConnue = width();
            hauteurConnue = height();
            placerObjectif();
        }
        objetifFond.height = (objetifAffiche.height || echelleInterface()) + 16;
    });

    placerObjectif();
}

function placerObjectif() {

    const taille = echelleInterface() - 3;

    objetifAffiche.textSize = taille;
    objetifAffiche.width = Math.max(120, Math.min(width() - 40, 640));
    objetifAffiche.pos = vec2(width() / 2, 18);

    objetifFond.pos = vec2(width() / 2, 10);
    objetifFond.width = objetifAffiche.width + 28;
    objetifFond.height = (objetifAffiche.height || taille) + 16;
    objetifFond.opacity = objetifAffiche.text === "" ? 0 : 0.6;
}

// Le bord gauche et le bas de la pastille d'objectif, en pixels
// d'écran — ou null si elle est vide. L'inventaire s'en sert pour
// ne jamais écrire par-dessus (inventaire.js).
function basDeLObjectif() {
    if (!objetifFond || objetifFond.opacity === 0) return null;
    return {
        gauche: objetifFond.pos.x - objetifFond.width / 2,
        y: objetifFond.pos.y + objetifFond.height,
    };
}

function objectif(texte) {
    if (!objetifAffiche) return;
    objetifAffiche.text = texte;
    placerObjectif();
}

// À appeler après CHAQUE dialogue qui fait avancer l'histoire.
// Une seule fonction décide de la ligne affichée (dans acte1.js),
// plutôt qu'un objectif() écrit à la main à vingt endroits : sinon,
// au rechargement de la page, la ligne du haut serait fausse.
function rafraichirObjectif() {
    objectif(objectifCourant());

    // La ligne du haut et les bulles "!" disent la même chose, l'une
    // en mots et l'autre en position. Les mettre à jour ensemble est
    // le seul moyen qu'elles ne se contredisent jamais.
    if (typeof rafraichirBulles === "function") rafraichirBulles();
}


/* ============================================================
   LES PELUCHES À L'ÉCRAN
   ============================================================
   Deux cas, et le reste du jeu ne voit pas la différence :

   - la peluche a sa planche (PELUCHES_DESSINEES, moteur.js) :
     c'est un sprite animé, avec les mêmes animations que Bob ;

   - elle ne l'a pas encore : c'est une pastille de sa couleur,
     avec son nom au-dessus. Elle est jouable quand même — c'est
     ce qui permet d'écrire un personnage avant d'avoir son dessin.

   Dans les deux cas, le corps est ancré par les PIEDS, et tout
   ce qui bouge (idle, sursaut, marche) passe par basePos.
   ============================================================ */
const PELUCHES = {};


function creerPeluche(cle, tuileX, tuileY) {

    const perso = PERSONNAGES[cle];
    const taille = perso.taille || 1;
    const dessinee = PELUCHES_DESSINEES.indexOf(cle) >= 0;

    // La hauteur du personnage dans le monde. Elle place son nom,
    // sa bulle « ! », et rien d'autre : la planche est déjà
    // dessinée à cette hauteur, on ne l'agrandit jamais ici.
    const cote = dessinee ? taille * HAUTEUR_BOB : taille * TAILLE_TUILE * 0.8;

    // Une planche dessinée est plus fine que le monde (config.js) :
    // on l'affiche réduite d'autant. vie.js repart de cette échelle
    // à chaque image.
    const echelle = dessinee ? 1 / FINESSE_PELUCHES : 1;

    const corps = dessinee
        ? add([
            sprite(cle, { anim: "idle-bas" }),
            pos(0, 0),
            anchor("bot"),
            scale(echelle),
            rotate(0),           // pour ceux qui se dandinent (vie.js)
            opacity(1),
            z(Z_DECOR),
            "peluche",
        ])
        : add([
            rect(cote, cote, { radius: cote / 3 }),
            pos(0, 0),
            anchor("bot"),
            color(...perso.couleurPlaceholder),
            outline(2, rgb(...COULEUR_ENCRE)),
            rotate(0),
            opacity(1),
            z(Z_DECOR),
            "peluche",
        ]);

    // Le nom au-dessus de la tête ne sert qu'aux pastilles : une
    // pastille violette ne dit pas qui elle est. Un vrai dessin,
    // si — et le bouton d'action donne le nom dès qu'on approche.
    // En encre sombre, et pas en crème : le parquet est clair, un
    // texte clair posé dessus devient invisible.
    const etiquette = add([
        text(perso.nom, { size: 10 }),
        pos(0, 0),
        anchor("center"),
        color(...COULEUR_ENCRE),
        opacity(dessinee ? 0 : 1),
        z(Z_DECOR),
    ]);

    // L'ombre est créée ICI et pas par creerOmbre() : elle doit
    // suivre la position AU SOL du personnage, pas son corps. Un
    // Bluey qui rebondit doit décoller de son ombre ; s'il
    // l'emporte avec lui, il a l'air de glisser sur un ressort.
    // Elle grandit avec le personnage : Samsam ne tient pas sur
    // l'ombre de Bluey.
    const ombre = add([
        circle(7 * Math.max(0.8, taille)),
        scale(vec2(1, 0.45)),
        color(0, 0, 0),
        opacity(0.28),
        pos(0, 0),
        anchor("center"),
        z(Z_DECOR),
    ]);

    const peluche = {
        cle: cle,
        corps: corps,
        etiquette: etiquette,
        ombre: ombre,
        cote: cote,
        echelle: echelle,
        dessinee: dessinee,
        avecEtiquette: !dessinee,
        enMarche: false,     // pendant marcherVers() (marche.js)
        zone: null,          // rempli par installerCasting()
        basePos: vec2(0, 0), // sa place au sol ; tout le reste en découle
        bump: 0,             // le sursaut quand il parle (vie.js)
        aDuNeuf: false,      // affiche la bulle "!" (vie.js)

        // Décalage d'horloge propre au personnage, pour que les
        // quatre idles ne battent pas à l'unisson. Dérivé du nom :
        // toujours le même, donc reproductible d'une partie à
        // l'autre — et sans tirage au sort, qui est interdit dans
        // les scripts de workflow et de toute façon inutile ici.
        dephasage: (cle.charCodeAt(0) % 10) * 0.37,
    };

    placerPeluche(peluche, tuileX, tuileY);

    PELUCHES[cle] = peluche;
    return peluche;
}


/* ------------------------------------------------------------
   placerPeluche(peluche, tuileX, tuileY)
   ------------------------------------------------------------
   Déplace le corps, l'étiquette ET la zone interactive d'un
   seul coup. Les trois doivent bouger ensemble — c'est
   exactement le genre d'oubli qui donne un Bluey invisible qui
   parle depuis l'autre bout de l'appartement.
   ------------------------------------------------------------ */
function placerPeluche(peluche, tuileX, tuileY) {

    const x = tuileX * TAILLE_TUILE + TAILLE_TUILE / 2;
    const y = tuileY * TAILLE_TUILE + TAILLE_TUILE;

    // On ne pose que basePos : c'est vie.js qui recompose la
    // position réelle du corps, de l'étiquette et de l'ombre à
    // chaque image, en y ajoutant l'idle et le bump.
    peluche.basePos = vec2(x, y);

    peluche.corps.pos = vec2(x, y);
    peluche.corps.z = Z_DECOR + y;
    peluche.etiquette.pos = vec2(x, y - peluche.cote - 6);
    peluche.etiquette.z = Z_DECOR + y + 1;
    peluche.ombre.pos = vec2(x, y - 2);

    if (peluche.zone) deplacerInteractif(peluche.zone, tuileX, tuileY);
}


function montrerPeluche(peluche, visible) {
    peluche.cache = !visible;
    const o = visible ? 1 : 0;
    peluche.corps.opacity = o;
    peluche.etiquette.opacity = peluche.avecEtiquette ? o : 0;
    peluche.ombre.opacity = visible ? 0.28 : 0;
}


/* ------------------------------------------------------------
   orienterPeluche(peluche, cible)
   ------------------------------------------------------------
   Tourne une peluche dessinée vers un point du monde : de face,
   de dos, ou de profil (retournée si la cible est à gauche).
   Sans effet sur une pastille, qui n'a ni face ni dos.
   ------------------------------------------------------------ */
function orienterPeluche(peluche, cible) {

    if (!peluche.dessinee || !cible) return;

    const ecartX = cible.x - peluche.basePos.x;
    const ecartY = cible.y - peluche.basePos.y;

    if (Math.abs(ecartX) > Math.abs(ecartY)) {
        peluche.corps.flipX = ecartX < 0;
        jouerAnimation(peluche.corps, "idle-cote");
    } else {
        peluche.corps.flipX = false;
        jouerAnimation(peluche.corps, ecartY < 0 ? "idle-haut" : "idle-bas");
    }
}


/* ------------------------------------------------------------
   changerDeTenue(peluche, tenue)
   ------------------------------------------------------------
   Change la planche d'une peluche dessinée (voir TENUES dans
   moteur.js) sans rien changer d'autre : même place, même taille,
   même animation en cours. Le portrait suit tout seul.
   ------------------------------------------------------------ */
function changerDeTenue(peluche, tenue) {
    APPARENCES[peluche.cle] = tenue;
    if (!peluche.dessinee) return;
    const anim = peluche.corps.animEnCours || "idle-bas";
    peluche.corps.use(sprite(tenue, { anim: anim }));
    peluche.corps.animEnCours = anim;
}


// De face, comme au repos.
function remettreDeFace(peluche) {
    if (!peluche.dessinee) return;
    peluche.corps.flipX = false;
    jouerAnimation(peluche.corps, "idle-bas");
}


/* ============================================================
   installerCasting(casting)
   ============================================================
   Pose tout le monde d'un coup, d'après un simple tableau.

   ------------------------------------------------------------
   AJOUTER UN PERSONNAGE = UNE LIGNE

       { cle: "rosy", x: 20, y: 8, verbe: "Parler à Rosy",
         action: parlerARosy }

   - cle      la clé dans PERSONNAGES (personnages.js), qui donne
              aussi sa taille
   - x, y     sa case sur le plan, comme partout ailleurs
   - verbe    ce que le bouton d'action affichera
   - action   la fonction de dialogue (dans acte1.js)
   - zone     (optionnel) { largeur, hauteur } si sa zone
              d'approche doit être plus large que lui —
              typiquement un personnage posé sur un meuble
   - cache    (optionnel) true = il commence invisible
   - priorite (optionnel) 1 = il l'emporte sur le décor autour de
              lui. Indispensable s'il est posé contre une grande
              zone (le tapis) : sinon le bouton affiche le décor.
   ------------------------------------------------------------ */
function installerCasting(casting) {

    casting.forEach(function (fiche) {

        const peluche = creerPeluche(fiche.cle, fiche.x, fiche.y);

        peluche.zone = ajouterInteractif({
            x: fiche.x,
            y: fiche.y,
            largeur: (fiche.zone && fiche.zone.largeur) || 1,
            hauteur: (fiche.zone && fiche.zone.hauteur) || 1,
            verbe: fiche.verbe,
            action: fiche.action,
            actif: fiche.actif || null,
            priorite: fiche.priorite || 0,
            hauteurVisuelle: peluche.cote,
        });

        // Posé volontairement SUR un meuble (Samsam sur le lit).
        // Le vérificateur de plan doit le savoir, sinon il signale
        // une peluche "dans un mur" à chaque démarrage — et une
        // alerte qu'on apprend à ignorer ne sert plus à rien.
        peluche.surMeuble = !!fiche.surMeuble;

        if (fiche.cache) montrerPeluche(peluche, false);
    });
}


/* ============================================================
   installerDecor(liste)
   ============================================================
   Les zones interactives qui ne sont pas des personnages : les
   meubles qu'on peut regarder, la fenêtre, la porte.

   Même format que ajouterInteractif(), en tableau. C'est là que
   vit tout le dialogue annexe — et c'est volontairement le plus
   gros tableau du jeu : c'est lui qui fait qu'un appartement a
   l'air habité plutôt que décoré.
   ============================================================ */
function installerDecor(liste) {
    liste.forEach(function (entree) {
        ajouterInteractif(entree);
    });
}


/* ============================================================
   installerStudio()
   ============================================================
   Le point d'entrée appelé par la scène. Il ne décide de rien :
   il branche la mémoire, l'interface, puis passe la main à
   l'acte en cours.
   ============================================================ */
function installerStudio() {

    charger();
    creerObjectif();
    preparerInteractions();
    inventaire.aDroite = false;
    preparerInventaire();

    installerCasting(CASTING_STUDIO);
    installerDecor(DECOR_STUDIO);

    // APRÈS le casting : la vie a besoin que les peluches existent.
    preparerLaVie();

    // Contrôle de cohérence entre le plan et tout ce qu'on vient d'y
    // poser. Il n'empêche rien : il ÉCRIT dans la console. Voir
    // verifications.js pour ce qu'il attrape et pourquoi.
    verifierLePlan(PIECES.studio);

    demarrerActeI();
}
