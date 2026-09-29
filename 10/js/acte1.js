/* ============================================================
   ACTE I — FERMER LA FENÊTRE
   ============================================================
   Tout le texte de l'acte I, et lui seul. La machinerie est dans
   histoire.js, le dialogue dans dialogue.js, la vie dans vie.js.

   ------------------------------------------------------------
   LE PRINCIPE, ET IL TIENT EN UNE PHRASE

   Le jeu ment au joueur pendant vingt minutes.

   Il ouvre sur une corvée : il fait froid d'un seul côté, une
   fenêtre est ouverte, Bob descend du lit pour la fermer et se
   recoucher. Le mot « Rosy » n'est prononcé par PERSONNE avant
   la dix-huitième minute — et c'est Bob qui le dit, à Bluey,
   sous la forme d'une question à laquelle Bluey n'arrive pas à
   répondre.

   ------------------------------------------------------------
   LA CHAÎNE — chaque maillon NOMME le suivant ET sa question

     1. la fenêtre     le loquet est tordu VERS L'EXTÉRIEUR
     2. BLUEY          prix : trois manches de cache-cache
                       -> « demande à Samsam ce qu'il a entendu
                          pendant que je criais »
     3. le miroir      étoilé à trente centimètres du sol, une
                       plume coincée dans le cadre. (objet)
     4. CAKEY          elle compte tout le monde : il manque Samsam.
                       -> « Fraisy n'a pas quitté la cuisine »
                       et elle laisse échapper qu'on prépare à Bob
                       une surprise pour ce soir. Qui se mange.
     5. FRAISY         prix : la tomate du milieu
                       -> « il traversait. Demande-lui pourquoi. »
     6. SAMSAM         prix : la chaussette de sous le lit
                       -> « on ne tape pas deux fois dans un
                          miroir pour se regarder soi »
     7. BLUEY, RETOUR  le paiement du gag
     8. DOUDOU         prix : rien. Il ne répond qu'à la plume.
                       Bob recolle la surprise de Cakey et la
                       crêpe de Fraisy : c'était Rosy.
     9. CAKEY          les deux secrets : Rosy ET Bob sont venus la
                       voir, chacun pour l'autre, pour le même soir.
    10. la fenêtre     et le pyjama Miffy de Samsam — qui ouvre
                       l'acte II (acte2.js).

   Le lit n'est plus un maillon : c'était une station muette, et
   c'est maintenant Cakey qui dit qu'il manque quelqu'un. Evan
   voulait que ce soient les doudous qui racontent. Le lit reste
   à visiter, avec son texte, pour ceux qui y vont d'eux-mêmes.

   ------------------------------------------------------------
   TROIS RÈGLES D'ÉCRITURE, APPRISES À LA DURE

   1. LE GAG ET LE DRAME SONT LA MÊME INFORMATION.
      « Y A PLUS DE CRÊPES » fait rire à la minute 10 ; c'est la
      phrase qui explique tout à la minute 22.

   2. LA NARRATION NE DÉCIDE JAMAIS POUR LE JOUEUR.
      Jamais de « il n'y reviendra pas », jamais de « Bob a une
      dignité à tenir ». On décrit ce qu'il y a ; ce que le
      joueur en fait ne regarde que lui.

   3. BOB N'EST JAMAIS CONDESCENDANT AVEC KLARA.
      Ni sur son ménage, ni sur ses affaires, ni sur ses courses.
      Il l'admire. Tout ce qu'elle fait lui paraît remarquable,
      et il le dit simplement. C'est le personnage.
   ============================================================ */


/* ============================================================
   LE CASTING DU STUDIO
   ============================================================ */
const CASTING_STUDIO = [

    {
        cle: "bluey", x: 15, y: 3,
        verbe: verbeBluey,
        action: parlerABluey,
    },

    {
        cle: "fraisy", x: 22, y: 4,
        verbe: verbeFraisy,
        action: parlerAFraisy,
    },

    {
        cle: "doudou", x: 25, y: 14,
        verbe: "Parler à Doudou",
        action: parlerADoudou,
    },

    // Samsam est couché SOUS LA FENÊTRE depuis des heures, sous le
    // rideau tombé. Tant que Fraisy n'a pas dit « il traversait »,
    // il n'y a là qu'un rideau : sa zone reste inerte, sinon le
    // bouton d'action vendrait la mèche.
    {
        cle: "samsam", x: 2, y: 1,
        verbe: verbeSamsam,
        action: parlerASamsam,
        zone: { largeur: 2, hauteur: 1 },
        cache: true,
        actif: function () { return saitQue("samsam_trouve"); },
    },

    // Cakey attend AU PIED DU LIT depuis minuit : elle veut être la
    // première à souhaiter joyeux 8 octobre au premier qui se réveille.
    // Priorité 1 : elle est collée au tapis, dont la zone est immense.
    // Sans ça, on a Cakey sous le nez et le bouton affiche « Le tapis
    // blanc ».
    {
        cle: "cakey", x: 6, y: 7,
        verbe: "Parler à Cakey",
        action: parlerACakey,
        priorite: 1,
    },

];


/* ------------------------------------------------------------
   Comment chacun bouge quand personne ne lui parle (voir vie.js).
   ------------------------------------------------------------ */
const STYLES_IDLE = {
    bluey: "rebondit",
    fraisy: "balance",
    samsam: "respire",
    doudou: "regarde",
    cakey: "danse",
};


/* ============================================================
   LES OBJETS
   ============================================================ */
const OBJETS = {
    petale: { nom: "Une pétale de rose" },
    plume: { nom: "Une plume blanche" },
    tomate: { nom: "Une tomate" },
    chaussette: { nom: "Une chaussette en laine" },
    pyjama: { nom: "Le pyjama Miffy de Samsam" },
};


/* ============================================================
   LE DÉCOR INTERACTIF
   ============================================================
   La moitié de ces zones ne sert à rien. C'est la moitié qui
   fait qu'on a l'air d'être chez quelqu'un.
   ============================================================ */
const DECOR_STUDIO = [

    // ---- la chaîne ----
    { x: 4, y: 0, largeur: 3, hauteur: 1, verbe: verbeFenetre, action: laFenetre },
    { x: 9, y: 15, largeur: 6, hauteur: 1, verbe: "Le grand miroir", action: leMiroir },

    {
        x: 1, y: 1, largeur: 3, hauteur: 1,
        verbe: "Le rideau par terre",
        action: leRideau,
        actif: function () { return !saitQue("samsam_trouve"); },
    },

    { x: 1, y: 10, largeur: 3, hauteur: 2, verbe: "Le lit", action: leLit },
    { x: 4, y: 10, largeur: 2, hauteur: 2, verbe: verbeSousLeLit, action: sousLeLit },
    { x: 18, y: 1, largeur: 3, hauteur: 3, verbe: verbeFrigo, action: leFrigo },
    { x: 7, y: 5, largeur: 7, hauteur: 9, verbe: "Le tapis blanc", action: leTapis },

    // ---- le décor qui ne sert à rien ----
    { x: 1, y: 4, largeur: 1, hauteur: 1, verbe: "La table de nuit", action: laTableDeNuit },
    { x: 25, y: 1, largeur: 3, hauteur: 4, verbe: "Le plan de travail", action: leplanDeTravail },
    { x: 27, y: 5, largeur: 1, hauteur: 2, verbe: "L'évier", action: lEvier },
    { x: 9, y: 1, largeur: 2, hauteur: 2, verbe: "Le bureau", action: leBureau },
    { x: 1, y: 14, largeur: 5, hauteur: 2, verbe: "La penderie", action: laPenderie },
    { x: 16, y: 8, largeur: 4, hauteur: 4, verbe: "La douche", action: laDouche },
    { x: 22, y: 8, largeur: 2, hauteur: 2, verbe: "Le lavabo", action: leLavabo },
    { x: 26, y: 8, largeur: 1, hauteur: 2, verbe: "Les toilettes", action: lesToilettes },
    { x: 22, y: 16, largeur: 2, hauteur: 1, verbe: "La porte d'entrée", action: laPorte },

];


const MANCHES_BLUEY = ["bluey_1", "bluey_2", "bluey_3"];


/* ============================================================
   L'OBJECTIF ET LES BULLES
   ============================================================ */
function objectifCourant() {

    if (!saitQue("ouverture")) return "";
    // Les actes suivants passent AVANT : le plus récent d'abord, sinon
    // la ligne du haut resterait bloquée sur l'acte I.
    if (typeof epilogueEnCours === "function" && epilogueEnCours()) {
        return objectifEpilogue();                     // epilogue.js
    }
    if (saitQue("acte2")) return objectifActeII();     // acte2.js
    if (!saitQue("fenetre_vue")) return "Fermer la fenêtre.";

    if (!saitQue("bluey_ok")) {
        if (saitQue("bluey_lance")) {
            return "Bluey s'est caché. (" + combien(MANCHES_BLUEY) + "/3)";
        }
        return "Fermer la fenêtre. Trouver de l'aide.";
    }

    if (!saitQue("miroir")) return "Vérifier ce que Bluey a vu.";
    if (!saitQue("cakey_ok")) return "Trouver Samsam.";

    if (!saitQue("fraisy_ok")) {
        if (aObjet("tomate")) return "Rapporter la tomate à Fraisy.";
        if (saitQue("fraisy_faim")) return "Fraisy ne réfléchit pas le ventre vide.";
        return "Demander à Fraisy si elle a vu Samsam.";
    }

    if (!saitQue("samsam_ok")) {
        if (!saitQue("samsam_trouve")) return "Samsam a traversé l'appartement cette nuit.";
        if (aObjet("chaussette")) return "Couvrir Samsam.";
        if (!saitQue("samsam_couvert")) return "Samsam tremble. Trouver de quoi le couvrir.";
        return "Écouter Samsam.";
    }

    if (!saitQue("bluey_retour")) return "Retourner voir Bluey.";
    if (!saitQue("verite")) return "Doudou attend.";
    if (!saitQue("cakey_secret")) return "Cakey sait tout ce qui se fête.";

    return "Une corde. Une lumière. Une arme. Une armure.";
}


/* ------------------------------------------------------------
   Un seul personnage porte la bulle « ! » à la fois. Deux bulles
   allumées, c'est une carte au trésor avec deux croix.
   ------------------------------------------------------------ */
function rafraichirBulles() {

    if (typeof effacerToutesLesBulles !== "function") return;
    effacerToutesLesBulles();

    if (typeof epilogueEnCours === "function" && epilogueEnCours()) {
        bullesEpilogue();                              // epilogue.js
        return;
    }
    if (saitQue("acte2")) { bullesActeII(); return; }   // acte2.js
    if (!saitQue("bluey_ok")) { marquerDuNeuf("bluey", saitQue("fenetre_vue")); return; }
    if (!saitQue("miroir")) return;
    if (!saitQue("cakey_ok")) { marquerDuNeuf("cakey", true); return; }
    if (!saitQue("fraisy_ok")) { marquerDuNeuf("fraisy", true); return; }
    if (!saitQue("samsam_ok")) { marquerDuNeuf("samsam", saitQue("samsam_trouve")); return; }
    if (!saitQue("bluey_retour")) { marquerDuNeuf("bluey", true); return; }
    if (!saitQue("verite")) { marquerDuNeuf("doudou", true); return; }
    if (!saitQue("cakey_secret")) { marquerDuNeuf("cakey", true); return; }
}


// Un son joué au moment où une réplique s'affiche (sons.js) :
//     { texte: "…", quand: sonner("revelation") }
function sonner(nom) {
    return function () {
        if (typeof jouerSon === "function") jouerSon(nom);
    };
}


/* ============================================================
   DÉMARRAGE
   ============================================================ */
function demarrerActeI() {

    // octobre.html?acte2 : on saute directement à l'acte II (acte2.js).
    const raccourci = raccourciActeII();

    poserLeRideauTombe();

    if (!saitQue("ouverture")) {
        ouverture();
        return;
    }

    // Sauvegardes d'avant Cakey : le maillon 4 était le lit. Une
    // partie déjà passée chez Fraisy resterait bloquée sur « Trouver
    // Samsam », avec la bulle sur Cakey pour toujours.
    if (saitQue("fraisy_faim") && !saitQue("cakey_ok")) noter("cakey_ok");

    rafraichirObjectif();

    if (saitQue("samsam_trouve")) montrerPeluche(PELUCHES.samsam, true);
    if (saitQue("bluey_lance") && !saitQue("bluey_ok")) cacherBluey();

    // Après la vérité, Doudou attend sous la fenêtre. Sans cette
    // ligne, une partie reprise le renvoyait à l'entrée.
    if (saitQue("verite")) placerPeluche(PELUCHES.doudou, 7, 1);

    // L'acte II se joue dans le même studio : il reprend la main ici.
    if (saitQue("acte2")) demarrerActeII(raccourci);
}


/* ------------------------------------------------------------
   LE RIDEAU TOMBÉ
   ------------------------------------------------------------
   C'est une étape de la chaîne, et l'ouverture le montre : il
   fallait qu'on le voie. Le pack de meubles n'a pas de rideau
   par terre, alors il est dessiné ici, en tas de plis.

   Il est dessiné PAR-DESSUS Samsam (z juste au-dessus de ses
   pieds) : une fois trouvé, Samsam apparaît à moitié dessous,
   ce qui est exactement la situation.

   ⚠️ Couleur crème neutre, à confirmer avec Evan (la vraie
   couleur des rideaux de Klara).
   ------------------------------------------------------------ */
const COULEUR_RIDEAU = [236, 230, 219];
const COULEUR_RIDEAU_PLI = [176, 164, 146];

function poserLeRideauTombe() {

    const x0 = 1 * TAILLE_TUILE;
    const sol = 2 * TAILLE_TUILE;          // le bas de la ligne 1

    // Des plis qui se chevauchent, du fond vers l'avant.
    const plis = [
        { x: 18, y: -16, l: 24, h: 11 },
        { x: 44, y: -18, l: 30, h: 13 },
        { x: 70, y: -14, l: 22, h: 10 },
        { x: 12, y: -7, l: 26, h: 13 },
        { x: 38, y: -8, l: 36, h: 15 },
        { x: 68, y: -6, l: 30, h: 12 },
    ];

    plis.forEach(function (p, i) {
        add([
            rect(p.l, p.h, { radius: p.h / 2 }),
            pos(x0 + p.x, sol + p.y),
            anchor("center"),
            color(...COULEUR_RIDEAU),
            outline(1, rgb(...COULEUR_RIDEAU_PLI)),
            z(Z_DECOR + sol + 1 + i * 0.01),
        ]);
    });

    // L'ourlet, qui dit « c'est un rideau » et pas « des coussins ».
    add([
        rect(58, 2),
        pos(x0 + 40, sol - 3),
        anchor("center"),
        color(...COULEUR_RIDEAU_PLI),
        opacity(0.8),
        z(Z_DECOR + sol + 1.1),
    ]);
}


/* ============================================================
   L'OUVERTURE — le jeu ment
   ============================================================
   Tout le monde dort dans le lit : Klara au milieu, les doudous
   autour. C'est la première image du jeu, et c'est la seule fois
   où on verra la famille au complet avant la toute fin.
   ============================================================ */
function ouverture() {

    // Les « quand » mettent la scène en images (intro.js) :
    // chacun se déclenche à l'instant où sa réplique s'affiche.
    lancerDialogue([
        { texte: "2 h 14.", quand: introCommence },
        { texte: "Dans le lit, tout le monde dort. Klara au milieu, et les doudous autour d'elle, chacun à sa place, comme tous les soirs depuis toujours." },
        { texte: "Bob se réveille parce qu'il a froid d'un seul côté.", quand: introFrisson },
        { qui: "bob", texte: "...", quand: introSeRedresse },
        { qui: "bob", texte: "Le chauffage." },
        { texte: "Ce n'est pas le chauffage." },
        { texte: "Au-dessus de la tête du lit, le rideau de la fenêtre de gauche est par terre. Il n'y est jamais.", quand: introRegardeLaFenetre },
        { qui: "bob", texte: "Bon.", quand: introRevientABob },
        { texte: "Bob fait quarante centimètres et il est deux heures quatorze du matin. Il descend du lit, il va fermer cette fenêtre, et il revient se coucher.", quand: introDescendDuLit },
    ], function () {
        introTermine();
        noter("ouverture");
        rafraichirObjectif();
    });
}


/* ============================================================
   LA FENÊTRE
   ============================================================ */
function verbeFenetre() {
    return saitQue("cakey_secret") ? "Sortir" : "La fenêtre";
}


function laFenetre() {

    if (saitQue("cakey_secret")) {
        sortirParLaFenetre();
        return;
    }

    // Entre Doudou et Cakey : c'est Doudou qui retient Bob, pas la
    // narration. Il vient de s'asseoir là, et il sait ce que Cakey
    // garde depuis des semaines.
    if (saitQue("verite")) {
        const enChemin = PELUCHES.doudou.enMarche;
        lancerDialogue([
            enChemin
                ? { texte: "Au loin, Doudou traverse l'appartement, un pas après l'autre. Il n'est pas encore arrivé." }
                : { texte: "Doudou est assis sous la fenêtre. Il a les yeux fermés, mais il ne dort pas." },
            { qui: "doudou", texte: "Cakey d'abord, mon grand." },
        ]);
        return;
    }

    if (saitQue("fenetre_vue")) {
        lancerDialogue([
            { texte: "Le loquet est toujours tordu. Vers l'extérieur." },
            { qui: "bob", texte: "Il me faut quelqu'un." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "La fenêtre de gauche est ouverte de la largeur d'une patte." },
        { qui: "bob", texte: "Voilà." },
        { texte: "Bob pousse. Elle ne bouge pas. Il pousse plus fort, des deux pattes, en calant ses pieds contre le mur. Elle ne bouge toujours pas." },
        { texte: "Le loquet est tordu." },
        { qui: "bob", texte: "Vers l'extérieur." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Il me faut quelqu'un." },
    ], function () {
        noter("fenetre_vue");
        rafraichirObjectif();
    });
}


/* ============================================================
   BLUEY — le seul réveillé, et le seul qui n'exagère jamais
   ============================================================ */
// ⚠️ TROIS CACHETTES, DANS CET ORDRE, ET PLUS DE TIRAGE AU SORT.
//
// L'ancienne version tirait au hasard parmi sept cases en refusant
// seulement la précédente. Résultat, remonté par Evan : Bluey est
// réapparu deux fois au même endroit (la mémoire du tirage ne
// survivait pas à un rechargement, et sa case de départ faisait
// partie de la liste). Un ordre fixe rend ce bug impossible.
//
// Chaque cachette a son INDICE : une ligne de narration jouée juste
// avant la manche, qui dit de quel côté on entend glousser. Sans
// ça, le joueur fouillait 25 m² à l'aveugle.
const CACHETTES_BLUEY = [
    { x: 24, y: 10, indice: "Quelque part du côté de la salle de bain, quelqu'un essaie très fort de ne pas rire." },
    { x: 2, y: 13, indice: "Un « hi hi » étouffé, du côté de la penderie." },
    { x: 23, y: 1, indice: "Ça glousse dans la cuisine. Ça glousse très mal." },
];

function indiceDeLaManche(n) {
    return { texte: CACHETTES_BLUEY[n].indice };
}


function verbeBluey() {
    if (saitQue("bluey_lance") && !saitQue("bluey_ok")) return "Bluey ?";
    return "Parler à Bluey";
}


function parlerABluey() {

    if (!saitQue("fenetre_vue")) {
        lancerDialogue([
            { qui: "bluey", texte: "BOB !! T'ES DESCENDU !! MOI AUSSI JE SUIS DESCENDU !! ON EST DEUX !!" },
            { qui: "bob", texte: "On est deux." },
            { qui: "bluey", texte: "C'EST LA MEILLEURE NUIT DE MA VIE." },
        ]);
        return;
    }

    if (saitQue("bluey_retour")) {
        lancerDialogue([
            { qui: "bluey", texte: "..." },
            { qui: "bob", texte: "Ça va aller." },
            { qui: "bluey", texte: "Tu dis ça avec ta voix de quand ça va pas aller." },
        ]);
        return;
    }

    if (saitQue("samsam_ok")) {
        blueyRetour();
        return;
    }

    if (saitQue("bluey_ok")) {
        lancerDialogue([
            { qui: "bluey", texte: "IL A TAPÉ DANS LE MIROIR !! DEUX FOIS !! VA VOIR !!" },
            { qui: "bob", texte: "J'y vais." },
        ]);
        return;
    }

    if (saitQue("bluey_lance")) {
        blueyRetrouve();
        return;
    }

    lancerDialogue([
        { qui: "bob", texte: "Bluey. Le loquet est coincé. Tu es petit, tu peux passer par-dessus." },
        { qui: "bluey", texte: "OUI !! ...NON !! ATTENDS !!" },
        { qui: "bluey", texte: "BOB. IL S'EST PASSÉ UN TRUC CETTE NUIT." },
        { qui: "bob", texte: "Il fait froid, c'est tout." },
        { qui: "bluey", texte: "NON MAIS UN VRAI TRUC !! IL Y AVAIT UN OISEAU !!" },
        { qui: "bob", texte: "Un oiseau." },
        { qui: "bluey", texte: "GRAND COMME LE FRIGO !! NON !! COMME LE LIT !! NON !!" },
        { qui: "bluey", texte: "...COMME LE FRIGO." },
        { texte: "Bob hoche la tête comme on hoche la tête devant Bluey. C'est-à-dire en pensant à autre chose." },
        { qui: "bluey", texte: "ET IL A TAPÉ DANS LE MIROIR !! DEUX FOIS !! TOC TOC !!" },
        { qui: "bob", texte: "D'accord." },
        { qui: "bluey", texte: "ET SAMSAM IL EST PAS DANS LE LIT." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Quoi ?" },
        { qui: "bluey", texte: "JE TE RACONTE TOUT !! MAIS ÇA SORT PAS QUAND JE SUIS ASSIS !!" },
        { qui: "bob", texte: "Bluey—" },
        { qui: "bluey", texte: "TROUVE-MOI TROIS FOIS ET JE TE DIS TOUT !! PROMIS JURÉ !!" },
        { texte: "Il a déjà disparu." },
        indiceDeLaManche(0),
    ], function () {
        noter("bluey_lance");
        cacherBluey();
        rafraichirObjectif();
    });
}


/* ------------------------------------------------------------
   cacherBluey()
   ------------------------------------------------------------
   La cachette dépend du nombre de manches déjà gagnées, qui est
   SAUVEGARDÉ : même après un rechargement, on ne peut pas tomber
   deux fois sur la même.

   Bluey n'est pas invisible : il DÉPASSE, à moitié transparent,
   et il continue de gigoter. C'est plus juste — c'est Bluey — et
   c'est ce qui rend la manche faisable sur un petit écran. Seul
   son nom disparaît, sinon il se trahirait à l'autre bout de la
   pièce.

   La PRIORITÉ est indispensable : il se cache par définition
   CONTRE quelque chose, donc à l'intérieur d'une zone de décor.
   Sans elle, on a Bluey sous le nez et le bouton affiche « La
   penderie ».
   ------------------------------------------------------------ */
function cacherBluey() {

    const n = Math.min(combien(MANCHES_BLUEY), CACHETTES_BLUEY.length - 1);
    const cachette = CACHETTES_BLUEY[n];

    const bluey = PELUCHES.bluey;
    placerPeluche(bluey, cachette.x, cachette.y);

    bluey.corps.opacity = 0.15;
    bluey.etiquette.opacity = 0;
    bluey.cache = true;          // éteint sa bulle « ! » (voir vie.js)

    bluey.zone.priorite = 1;
}


function blueyRetrouve() {

    montrerPeluche(PELUCHES.bluey, true);
    const manche = combien(MANCHES_BLUEY) + 1;

    if (manche === 1) {
        noter("bluey_1");
        lancerDialogue([
            { qui: "bluey", texte: "AAAAH !! NON !! COMMENT T'AS FAIT !!" },
            { qui: "bob", texte: "Tu dépassais." },
            { qui: "bluey", texte: "JE DÉPASSE JAMAIS !!" },
            { texte: "Il dépassait de partout." },
            { qui: "bluey", texte: "ENCORE !! FERME LES YEUX !!" },
            indiceDeLaManche(1),
        ], mancheSuivante);
        return;
    }

    if (manche === 2) {
        noter("bluey_2");
        lancerDialogue([
            { qui: "bluey", texte: "CETTE FOIS J'ÉTAIS VRAIMENT BIEN CACHÉ !!" },
            { qui: "bob", texte: "Tu m'as dit coucou." },
            { qui: "bluey", texte: "OUI MAIS DOUCEMENT !!" },
            { qui: "bluey", texte: "DERNIÈRE !! LA PLUS DURE DE L'UNIVERS !!" },
            indiceDeLaManche(2),
        ], mancheSuivante);
        return;
    }

    noter("bluey_3");
    lancerDialogue([
        { texte: "Cette fois, il ne crie pas." },
        { qui: "bluey", texte: "Tu m'as trouvé trois fois." },
        { qui: "bob", texte: "Trois fois." },
        { qui: "bluey", texte: "Personne me trouve jamais trois fois." },
        { qui: "bluey", texte: "Personne me cherche jamais trois fois." },
        { qui: "bob", texte: "Moi si." },
        { qui: "bluey", texte: "C'EST VRAI !! TOI TU CHERCHES TOUT LE MONDE !! SURTOUT ROSY !!" },
        { qui: "bluey", texte: "TU LA REGARDES QUAND ELLE DORT !! JE T'AI VU !!" },
        { qui: "bob", texte: "Je— non. Je regardais… le mur. Derrière elle. Le mur." },
        { qui: "bluey", texte: "LE MUR IL EST DE L'AUTRE CÔTÉ, BOB." },
        { qui: "bob", texte: "…" },
        { qui: "bluey", texte: "..." },
        { qui: "bluey", texte: "BON !! L'OISEAU !!" },
        { qui: "bluey", texte: "Il est entré par la fenêtre de gauche. Celle qui est ouverte. Il a fait DEUX TOURS de l'appartement." },
        { qui: "bob", texte: "Deux tours ?" },
        { qui: "bluey", texte: "Il cherchait ! Il a regardé sur le bureau, dans l'évier, derrière le miroir !" },
        { qui: "bluey", texte: "Et après il a tapé dans le miroir. DEUX FOIS. Avec la tête." },
        { qui: "bob", texte: "Un oiseau qui se cogne dans un miroir, Bluey, ça arrive." },
        { qui: "bluey", texte: "IL S'EST PAS COGNÉ !! IL A TAPÉ !! C'EST PAS PAREIL !!" },
        { qui: "bluey", texte: "ET PENDANT QUE JE CRIAIS, MOI, J'ENTENDAIS RIEN !!" },
        { qui: "bluey", texte: "SAMSAM IL ENTEND TOUT !! DEMANDE-LUI CE QU'IL A ENTENDU PENDANT QUE JE CRIAIS !!" },
        { qui: "bob", texte: "Samsam dort." },
        { qui: "bluey", texte: "SAMSAM IL EST PAS DANS LE LIT, BOB." },
    ], function () {
        noter("bluey_ok");
        PELUCHES.bluey.zone.priorite = 0;

        // ⚠️ IL DOIT RENTRER. Sans ça, Bluey reste sur sa dernière
        // cachette pour le reste de la partie — et comme les
        // cachettes sont choisies contre les meubles, il s'installe
        // devant le frigo et rend la tomate impossible à prendre.
        // Trouvé en jouant l'acte en entier.
        // Il rentre en sautillant, et vite : c'est Bluey.
        marcherVers(PELUCHES.bluey, 15, 3, { vitesse: 120 });

        rafraichirObjectif();
    });
}


function mancheSuivante() {
    cacherBluey();
    rafraichirObjectif();
}


/* ============================================================
   BLUEY, LE RETOUR — le paiement du gag
   ============================================================ */
function blueyRetour() {

    lancerDialogue([
        { texte: "Bluey est assis. Exactement là où Bob l'a laissé." },
        { qui: "bluey", texte: "Tu es revenu." },
        { qui: "bob", texte: "Oui." },
        { qui: "bluey", texte: "Personne revient." },
        { qui: "bluey", texte: "ENFIN SI !! TOUT LE MONDE REVIENT !! C'EST UN APPARTEMENT !! ON PEUT PAS PARTIR !!" },
        { qui: "bob", texte: "Bluey. L'oiseau, dans le miroir." },
        { qui: "bob", texte: "Samsam dit qu'on ne tape pas deux fois dans un miroir pour se regarder soi." },
        { qui: "bluey", texte: "..." },
        { qui: "bluey", texte: "Il se regardait pas." },
        { qui: "bluey", texte: "Il tournait la tête sur le côté. Comme ça. Pour voir DERRIÈRE son bec." },
        { qui: "bob", texte: "Pourquoi il ferait ça." },
        { qui: "bluey", texte: "Parce qu'il avait un truc dans le bec." },
        { qui: "bluey", texte: "Un truc blanc." },
        { qui: "bluey", texte: "Et ça bougeait." },
        { texte: "Bob ne dit rien." },
        { qui: "bluey", texte: "Ça bougeait beaucoup." },
        { qui: "bluey", texte: "J'ai cru que c'était un jeu." },
        { qui: "bluey", texte: "J'ai ri." },
        { texte: "..." },
        { qui: "bob", texte: "Où est Rosy.", quand: sonner("revelation") },
        { texte: "Bob se retourne vers le lit. Vers la petite place vide, à côté de la sienne." },
        { texte: "Il vient seulement de comprendre pourquoi elle est vide." },
        { texte: "Bluey ouvre la bouche. Il la referme." },
        { texte: "C'est la première fois de sa vie qu'il n'a rien à dire." },
        { qui: "bluey", texte: "...J'aurais pas dû rire ?" },
        { qui: "bob", texte: "Tu pouvais pas savoir." },
        { qui: "bluey", texte: "J'ai dit à tout le monde qu'il y avait un oiseau." },
        { qui: "bluey", texte: "Toute la nuit, Bob. À tout le monde." },
        { qui: "bob", texte: "Je sais." },
        { qui: "bob", texte: "Et tu avais raison à chaque fois." },
        { qui: "bluey", texte: "..." },
        { qui: "bluey", texte: "Va voir Doudou." },
        { qui: "bluey", texte: "Lui il répond jamais, mais il écoute toujours. Moi c'est l'inverse." },
    ], function () {
        noter("bluey_retour");
        rafraichirObjectif();
    });
}


/* ============================================================
   LE MIROIR — la station muette qui change tout
   ============================================================ */
function leMiroir() {

    if (saitQue("miroir")) {
        lancerDialogue([
            { texte: "L'étoile dans le verre est toujours là, à trente centimètres du sol." },
            { qui: "bob", texte: "Deux fois." },
        ]);
        return;
    }

    if (!saitQue("bluey_ok")) {
        lancerDialogue([
            { texte: "Le grand miroir. Bob se regarde dedans." },
            { texte: "Un ours brun très foncé, en t-shirt blanc et short noir à bandes. Quarante centimètres." },
            { texte: "Il se redresse un peu." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Le grand miroir." },
        { texte: "À trente centimètres du sol, le verre est étoilé. Frappé par quelque chose de dur, et de pointu." },
        { qui: "bob", texte: "..." },
        { texte: "Et coincée dans le cadre, tout en bas : une plume. Blanche. Longue comme le bras de Bob." },
        { texte: "Beaucoup trop grande pour un pigeon." },
        { qui: "bob", texte: "Il ne mentait pas." },
        { texte: "Bob range la plume sous son t-shirt. Il met un temps anormalement long à la ranger bien." },
    ], function () {
        noter("miroir");
        prendreObjet("plume");
        rafraichirObjectif();
    });
}


/* ============================================================
   CAKEY — la fête
   ============================================================
   ⚠️ RELIRE SA VOIX DANS personnages.js AVANT D'ÉCRIRE ICI.

   Elle a deux règles et elle y tient plus qu'à tout :
     1. elle ne dit JAMAIS une surprise ;
     2. on ne coupe pas le gâteau tant qu'il manque quelqu'un.

   Toute son utilité dans l'acte tient dans ces deux règles.
   La première lui fait lâcher, sans le vouloir, qu'on prépare à
   Bob une surprise « qui se mange » : c'est la moitié de l'indice
   que Bob recolle chez Doudou. La seconde fait du gâteau intact
   une horloge : tant qu'il n'est pas coupé, il manque quelqu'un.

   Et elle garde deux secrets qui n'en font qu'un : Rosy et Bob
   sont venus la voir, chacun de son côté, pour préparer quelque
   chose à l'autre. Pour le même soir.
   ============================================================ */
function parlerACakey() {

    if (saitQue("cakey_secret")) {
        lancerDialogue([
            { qui: "cakey", texte: "Je garde le gâteau. Personne n'y touche." },
            { qui: "cakey", texte: "Fraisy est déjà passée deux fois. Elle m'a dit « je vérifie juste qu'il va bien »." },
            { qui: "bob", texte: "Il va bien ?" },
            { qui: "cakey", texte: "Il va très bien. Il attend Rosy, comme tout le monde." },
        ]);
        return;
    }

    if (saitQue("verite")) {
        lesDeuxSecrets();
        return;
    }

    if (saitQue("bluey_retour")) {
        cakeyOublieDeSourire();
        return;
    }

    if (saitQue("samsam_ok")) {
        lancerDialogue([
            { qui: "cakey", texte: "Tu fais ta tête de quand tu réfléchis trop, Bob." },
            { qui: "bob", texte: "Samsam a entendu des choses, cette nuit." },
            { qui: "cakey", texte: "Samsam entend tout. Et il ne dit jamais rien pour rien." },
            { qui: "cakey", texte: "Va au bout. Je note tout ce qu'on fêtera après." },
        ]);
        return;
    }

    if (saitQue("samsam_couvert")) {
        lancerDialogue([
            { qui: "cakey", texte: "Tu l'as couvert ? Avec une chaussette ?" },
            { qui: "cakey", texte: "Oh, Bob. Celle-là, on la fête pour de vrai." },
            { qui: "cakey", texte: "Va l'écouter. Il parle lentement, mais il ne parle jamais pour rien." },
        ]);
        return;
    }

    if (saitQue("samsam_trouve")) {
        if (aObjet("chaussette")) {
            lancerDialogue([
                { qui: "cakey", texte: "Une chaussette en laine ! Parfait." },
                { qui: "cakey", texte: "On la fête quand elle sera sur Samsam." },
            ]);
            return;
        }
        lancerDialogue([
            { qui: "bob", texte: "Samsam était sous le rideau. Sous la fenêtre ouverte." },
            { qui: "cakey", texte: "Depuis tout ce temps ? Il doit avoir si froid." },
            { qui: "cakey", texte: "Il ne le dira pas. Il ne le dit jamais." },
            { qui: "cakey", texte: "Il lui faut quelque chose de chaud, Bob. En laine. Et grand : c'est Samsam." },
        ]);
        return;
    }

    if (saitQue("fraisy_ok")) {
        lancerDialogue([
            { qui: "bob", texte: "Fraisy dit que Samsam est sous le rideau." },
            { qui: "cakey", texte: "Sous le rideau ? Sous la fenêtre ouverte ?" },
            { qui: "cakey", texte: "Va vite, Bob. Et regarde s'il a froid. Lui, il ne le dira pas." },
        ]);
        return;
    }

    if (saitQue("cakey_ok")) {
        if (aObjet("tomate")) {
            lancerDialogue([
                { qui: "cakey", texte: "Une tomate ! On f—" },
                { qui: "cakey", texte: "Non. Plus tard. Je la note." },
            ]);
            return;
        }
        lancerDialogue([
            { qui: "cakey", texte: "Fraisy ! Dans la cuisine !" },
            { qui: "cakey", texte: "Et si elle te parle de mon gâteau, dis-lui qu'il n'est toujours pas coupé." },
        ]);
        return;
    }

    if (saitQue("miroir")) {
        cakeyCompte();
        return;
    }

    if (saitQue("bluey_ok")) {
        avecBonjourDeCakey([
            { qui: "cakey", texte: "Bluey est passé en courant. Il a dit « MIROIR » sept fois." },
            { qui: "cakey", texte: "Il avait l'air très sûr de lui. Encore plus que d'habitude." },
        ]);
        return;
    }

    if (saitQue("bluey_lance")) {
        avecBonjourDeCakey([
            { qui: "cakey", texte: "Tu joues à cache-cache avec Bluey ? J'adore ce jeu." },
            { qui: "cakey", texte: "Écoute bien. Il ne sait pas rire en silence. Personne ne lui a jamais appris, et je trouve ça très bien." },
        ]);
        return;
    }

    if (saitQue("fenetre_vue")) {
        avecBonjourDeCakey([
            { qui: "bob", texte: "Cakey. Le loquet de la fenêtre est tordu. J'ai besoin d'aide." },
            { qui: "cakey", texte: "Avec plaisir ! Mais j'ai les pattes prises." },
            { qui: "bob", texte: "Pose ton gâteau." },
            { texte: "Cakey le regarde comme s'il venait de proposer d'annuler Noël." },
            { qui: "cakey", texte: "Un gâteau d'anniversaire, Bob. Par terre. Un 8 octobre." },
            { qui: "bob", texte: "D'accord." },
            { qui: "cakey", texte: "Demande à Bluey ! Il est petit, il passe partout, et il est réveillé depuis des heures." },
            { qui: "cakey", texte: "Il raconte à tout le monde qu'il a vu un oiseau géant. Moi, je l'ai cru." },
            { qui: "cakey", texte: "Enfin, j'ai fait comme si. Il était tellement content qu'on l'écoute." },
        ]);
        return;
    }

    if (saitQue("cakey_bonjour")) {
        lancerDialogue([
            { qui: "cakey", texte: "Ferme vite ta fenêtre, et après, on fête !" },
        ]);
        return;
    }

    avecBonjourDeCakey([
        { qui: "bob", texte: "Je vais fermer la fenêtre. Il fait froid." },
        { qui: "cakey", texte: "Ferme vite, et après, on fête !" },
    ]);
}


/* ------------------------------------------------------------
   Le bonjour de Cakey — une seule fois, quel que soit le moment
   où on vient la voir. C'est lui qui pose « le 8 » dès le début,
   pour rire. Chez Doudou, le même 8 ne fera plus rire du tout.
   ------------------------------------------------------------ */
function avecBonjourDeCakey(suite, fin) {

    const bonjour = saitQue("cakey_bonjour") ? [] : [
        { qui: "cakey", texte: "Bob ! Tu es réveillé !" },
        { qui: "cakey", texte: "Joyeux 8 octobre !", quand: sonner("sifflet") },
        { qui: "bob", texte: "Cakey. Il est deux heures du matin." },
        { qui: "cakey", texte: "Deux heures et quart. Ça fait deux heures et quart que c'est le 8, et deux heures et quart que j'attends que quelqu'un se réveille pour le lui dire." },
        { qui: "cakey", texte: "C'est leur jour, Bob. À Klara, et à celui qu'elle attend." },
        { qui: "cakey", texte: "Le seul anniversaire qu'on choisit. C'est mon préféré." },
        { qui: "bob", texte: "Joyeux 8, Cakey." },
        { texte: "Cakey ferme les yeux, comme quand on reçoit un cadeau." },
        { qui: "cakey", texte: "Merci. C'était exactement comme je l'imaginais." },
    ];

    noter("cakey_bonjour");
    lancerDialogue(bonjour.concat(suite), fin);
}


/* ------------------------------------------------------------
   MAILLON 4 — elle compte tout le monde, et elle laisse échapper
   la surprise.
   ------------------------------------------------------------ */
function cakeyCompte() {

    avecBonjourDeCakey([
        { qui: "bob", texte: "Cakey. Samsam n'est pas dans le lit." },
        { qui: "cakey", texte: "Je sais ! Je compte tout le monde, tout le temps. C'est plus fort que moi : une fête, ça commence par une liste." },
        { qui: "cakey", texte: "Et sur ma liste, tout à l'heure, il y avait un Samsam en moins." },
        { qui: "bob", texte: "Tu l'as vu partir ?" },
        { qui: "cakey", texte: "Non. Je surveillais le gâteau." },
        { qui: "cakey", texte: "Fraisy tourne autour depuis minuit. Elle passe, elle repasse, elle dit « il sent bon, ton gâteau »." },
        { qui: "cakey", texte: "Il sent bon, c'est vrai. Mais il n'est pas coupé." },
        { qui: "cakey", texte: "Par contre, Fraisy n'a pas quitté la cuisine de la nuit. Si quelqu'un a vu passer Samsam, c'est elle." },
        { texte: "Cakey remarque la plume qui dépasse du t-shirt de Bob." },
        { qui: "cakey", texte: "Tu as trouvé une plume ! On fête ça !" },
        { qui: "bob", texte: "Plus tard, Cakey." },
        { qui: "cakey", texte: "Plus tard. D'accord. De toute façon, ce soir, il y a déjà une surprise pour toi, alors—" },
        { texte: "Elle s'arrête net." },
        { qui: "bob", texte: "Une surprise ?" },
        { qui: "cakey", texte: "Non. Aucune. Personne ne te prépare rien. Surtout rien qui se mange." },
        { qui: "cakey", texte: "..." },
        { qui: "cakey", texte: "Oh non." },
        { qui: "cakey", texte: "Oublie, Bob. Je ne dis jamais une surprise. Jamais. C'est ma règle." },
        { qui: "cakey", texte: "Enfin, j'en ai deux. L'autre, c'est qu'on ne coupe pas le gâteau tant qu'il manque quelqu'un." },
        { qui: "cakey", texte: "Alors ramène-moi Samsam. J'ai très, très envie de le couper." },
    ], function () {
        noter("cakey_ok");
        rafraichirObjectif();
    });
}


/* ------------------------------------------------------------
   Entre Bluey et Doudou — la seule fois où son sourire lâche.
   Elle a gardé la surprise de Rosy pour elle toute la nuit, sans
   s'inquiéter : Rosy était « occupée ». Elle comprend en même
   temps que le joueur qu'elle aurait dû revenir depuis longtemps.
   ------------------------------------------------------------ */
function cakeyOublieDeSourire() {

    lancerDialogue([
        { qui: "bob", texte: "Cakey. Tu as vu Rosy, cette nuit ?" },
        { qui: "cakey", texte: "Rosy ? Rosy est occ—" },
        { texte: "Elle s'arrête." },
        { texte: "Elle regarde vers la cuisine. Elle ne dit pas l'heure." },
        { texte: "Pour la première fois de la nuit, Cakey a oublié de sourire." },
        { texte: "Elle s'en rend compte. Elle se remet à sourire, exprès, très fort." },
        { qui: "cakey", texte: "Va voir Doudou, Bob. Doudou sait toujours tout." },
        { qui: "cakey", texte: "Moi, je garde le gâteau. Il ne bouge pas d'ici." },
    ]);
}


/* ------------------------------------------------------------
   MAILLON 9 — les deux secrets.
   C'est ici que l'histoire d'amour devient claire, et pas
   seulement devinée : Cakey est la seule à les avoir vus venir
   TOUS LES DEUX.
   ------------------------------------------------------------ */
function lesDeuxSecrets() {

    lancerDialogue([
        { qui: "bob", texte: "Cakey." },
        { qui: "cakey", texte: "Doudou t'a dit." },
        { texte: "Ce n'est pas une question. Elle a les yeux qui brillent, et elle sourit quand même." },
        { qui: "bob", texte: "La surprise. C'était la crêpe." },
        { qui: "cakey", texte: "Elle est venue me voir il y a une semaine. Elle voulait te faire une surprise pour le 8, et elle ne savait pas quoi." },
        { qui: "cakey", texte: "Je lui ai dit : une crêpe. Au sucre. Bob adore ça, et une crêpe, ça se partage." },
        { qui: "cakey", texte: "Elle a quand même redemandé à Fraisy. Au sucre ou à la confiture. Tu la connais : elle vérifie toujours tout deux fois." },
        { qui: "cakey", texte: "Et elle a répété toute la semaine la phrase qu'elle voulait te dire en te la donnant." },
        { qui: "bob", texte: "Quelle phrase ?" },
        { qui: "cakey", texte: "Ça, c'est à elle de te la dire." },
        { texte: "..." },
        { qui: "bob", texte: "Tout le monde le savait ? Pour elle et moi ?" },
        { qui: "cakey", texte: "Bob. Tout le monde. Depuis des mois." },
        { qui: "cakey", texte: "Tous les matins, tu ramasses sa rose quand elle la fait tomber, et tu la lui remets dans les pattes avant qu'elle se réveille." },
        { qui: "cakey", texte: "Et elle a appris toutes tes blagues par cœur. Même les nulles." },
        { qui: "bob", texte: "Elles sont pas nulles." },
        { qui: "cakey", texte: "Elle rit quand même. C'est à ça qu'on sait." },
        { qui: "cakey", texte: "Et tu veux savoir le plus beau ?" },
        { qui: "cakey", texte: "Il y a trois semaines, toi aussi, tu es venu me voir. Tu voulais un élastique. « Un joli. »" },
        { qui: "cakey", texte: "Je t'en ai trouvé quatorze. Aucun n'était assez bien pour elle." },
        { qui: "bob", texte: "Je— c'était pour— ah." },
        { qui: "cakey", texte: "Deux surprises. Le même soir. Chacun pour l'autre. Et aucun des deux ne savait.", quand: sonner("revelation") },
        { qui: "cakey", texte: "J'ai gardé les deux. Ce sont les plus beaux secrets qu'on m'ait jamais confiés." },
        { qui: "bob", texte: "Pourquoi personne n'a rien dit ?" },
        { qui: "cakey", texte: "Parce que c'était à vous de le dire." },
        { qui: "cakey", texte: "Et parce que c'était joli à regarder." },
        { texte: "..." },
        { qui: "bob", texte: "Elle ne l'a pas lâchée, Cakey. La crêpe." },
        { qui: "cakey", texte: "Non." },
        { qui: "cakey", texte: "Et tu sais ce que ça veut dire ?" },
        { qui: "cakey", texte: "Qu'elle compte toujours te la donner." },
        { texte: "Bob ne répond pas. Mais il se tient un peu plus droit." },
        { qui: "cakey", texte: "Je garde le gâteau. Personne n'y touche. Pas même Fraisy." },
        { qui: "cakey", texte: "On le coupera quand vous serez rentrés. Tous les deux." },
        { qui: "cakey", texte: "Alors dépêche-toi, Bob. J'ai très, très envie de le couper." },
    ], function () {
        noter("cakey_secret");
        rafraichirObjectif();
    });
}


/* ============================================================
   LE LIT — la place vide
   ============================================================
   Bob y dormait il y a dix minutes. C'est ça qui fait mal : il
   était juste à côté.

   Ce n'est plus un maillon de la chaîne (c'est Cakey qui dit
   qu'il manque Samsam), mais le texte reste pour ceux qui y vont.
   ============================================================ */
function leLit() {

    if (saitQue("lit_vu")) {
        lancerDialogue([
            { texte: "La place de Samsam est toujours vide. Le creux n'est même plus tiède." },
        ]);
        return;
    }

    if (!saitQue("bluey_ok")) {
        lancerDialogue([
            { texte: "Le lit. Klara au milieu, et tout le monde autour." },
            { texte: "Bob les regarde dormir un moment. C'est une des choses qu'il préfère au monde." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Le lit. Klara dort, profondément, une mèche en travers de la figure." },
        { texte: "Bob remonte la couette sur elle. Ça lui prend un certain temps, avec quarante centimètres." },
        { qui: "bob", texte: "Voilà." },
        { texte: "Puis il regarde à côté de sa propre place." },
        { texte: "Il y a un creux. Un grand creux, de la taille d'un très gros ours gris." },
        { texte: "Bob s'endort contre ce creux tous les soirs depuis des années." },
        { qui: "bob", texte: "Samsam ?" },
        { texte: "Il pose la patte dessus." },
        { texte: "C'est froid." },
        { texte: "De l'autre côté de la place de Bob, il y a une autre place. Plus petite. Celle de quelqu'un qui s'endort toujours après lui." },
        { texte: "Elle est vide aussi." },
        { qui: "bob", texte: "..." },
    ], function () {
        noter("lit_vu");
        rafraichirObjectif();
    });
}


/* ============================================================
   FRAISY — elle a tout vu, et elle regardait ailleurs
   ============================================================ */
function verbeFraisy() {
    if (aObjet("tomate") && saitQue("fraisy_faim")) return "Donner la tomate à Fraisy";
    return "Parler à Fraisy";
}


function parlerAFraisy() {

    if (saitQue("fraisy_ok")) {
        lancerDialogue([
            { qui: "fraisy", texte: "Tu sais ce qui m'énerve ? Maintenant j'ai plus faim, alors je réfléchis, et c'est horrible." },
            { qui: "bob", texte: "Bienvenue." },
            { qui: "fraisy", texte: "Comment vous faites, vous, toute la journée ?" },
        ]);
        return;
    }

    if (aObjet("tomate")) {
        fraisyMange();
        return;
    }

    if (saitQue("fraisy_faim")) {
        lancerDialogue([
            { qui: "fraisy", texte: "Alors ? La tomate du milieu ?" },
            { qui: "bob", texte: "Je cherche." },
            { qui: "fraisy", texte: "Elle est au milieu, Bob. C'est dans le nom." },
        ]);
        return;
    }

    if (!saitQue("cakey_ok")) {
        lancerDialogue([
            { qui: "fraisy", texte: "Oh, Bob ! Dis, il reste du pain ? Non parce que moi je dis ça, je dis rien, mais il reste jamais de pain." },
            { qui: "bob", texte: "Plus tard, Fraisy." },
            { qui: "fraisy", texte: "« Plus tard ». Tu sais que le pain il t'attend pas, toi ?" },
        ]);
        return;
    }

    lancerDialogue([
        { qui: "bob", texte: "Fraisy. Samsam n'est pas dans le lit." },
        { qui: "fraisy", texte: "Ah oui. Ça." },
        { qui: "bob", texte: "« Ah oui ça » ?" },
        { qui: "fraisy", texte: "Bah je l'ai vu. Il traversait." },
        { qui: "bob", texte: "Il traversait." },
        { qui: "fraisy", texte: "L'appartement. Du lit vers la fenêtre. Je l'ai regardé faire pendant une heure et quart, j'avais rien d'autre à faire, vu qu'il n'y a PLUS DE CRÊPES." },
        { qui: "bob", texte: "..." },
        { qui: "fraisy", texte: "Non parce que ça aussi c'est un sujet." },
        { qui: "fraisy", texte: "Et Cakey ne coupera pas son gâteau tant qu'il manque quelqu'un. Alors moi aussi, je compte. Toute la nuit. Et ça ne tombe jamais juste." },
        { qui: "bob", texte: "Fraisy. Une heure et quart." },
        { qui: "fraisy", texte: "Il va pas vite, tu sais bien." },
        { qui: "bob", texte: "Tu lui as demandé où il allait ?" },
        { qui: "fraisy", texte: "Oui." },
        { qui: "bob", texte: "Et ?" },
        { qui: "fraisy", texte: "Il a pas répondu." },
        { qui: "fraisy", texte: "Il avait pas assez d'air pour répondre ET avancer. Alors il a choisi d'avancer." },
        { texte: "..." },
        { qui: "bob", texte: "Il est où, maintenant." },
        { qui: "fraisy", texte: "Écoute, je te dirais bien, mais là tout de suite j'ai un cerveau de décoration." },
        { qui: "fraisy", texte: "Il marche au sucre, mon cerveau. Et il n'y a plus de crêpes. Tu vois le problème." },
        { qui: "bob", texte: "Il y a un frigo entier." },
        { qui: "fraisy", texte: "Alors vas-y. Décris-moi le frigo. Je t'écoute." },
    ], function () {
        noter("fraisy_faim");
        rafraichirObjectif();
    });
}


function fraisyMange() {

    lancerDialogue([
        { texte: "Bob tend la tomate. Il a fait toute la traversée en la portant devant sa tête, sans rien voir." },
        { qui: "fraisy", texte: "Celle du milieu." },
        { qui: "bob", texte: "Celle du milieu." },
        { qui: "fraisy", texte: "Tu vois que c'était pas compliqué." },
        { texte: "Elle la mange comme une pomme. Ça prend quatre secondes." },
        { qui: "fraisy", texte: "Bon." },
        { qui: "fraisy", texte: "Samsam. Il est allé jusqu'à la fenêtre de gauche, et il s'est couché dessous. Le rideau lui est tombé dessus. Il n'a pas bougé depuis." },
        { qui: "bob", texte: "Le rideau par terre." },
        { qui: "fraisy", texte: "C'est pas un rideau, Bob. Enfin si. Mais pas que." },
        { qui: "bob", texte: "..." },
        { qui: "fraisy", texte: "Ah, et les crêpes ! Vers minuit, quelqu'un est venu prendre la dernière. Sur la pointe des pattes." },
        { qui: "fraisy", texte: "Elle m'a demandé si tu la préférais au sucre ou à la confiture." },
        { qui: "bob", texte: "…Qui ça, « elle » ?" },
        { qui: "fraisy", texte: "Mmmh." },
        { texte: "Fraisy a la bouche pleine de tomate. Elle fait un geste vague qui peut vouloir dire à peu près n'importe qui." },
        { qui: "bob", texte: "Et tu lui as répondu quoi ?" },
        { qui: "fraisy", texte: "Sucre. Évidemment. Je te connais." },
        { qui: "bob", texte: "…C'est vrai que je la préfère au sucre." },
        { qui: "fraisy", texte: "Demande à Samsam pourquoi il traversait. Moi il m'a pas répondu." },
        { qui: "fraisy", texte: "À toi il répondra. Il répond toujours à tout le monde, c'est sa maladie." },
        { texte: "Bob est déjà parti." },
        { qui: "fraisy", texte: "...Et pour les crêpes, personne me demande rien, hein. C'est bien. C'est très bien." },
    ], function () {
        noter("fraisy_ok");
        donnerObjet("tomate");
        rafraichirObjectif();
    });
}


/* ============================================================
   SAMSAM — le grand cœur
   ============================================================
   ⚠️ RELIRE SA VOIX DANS personnages.js AVANT D'ÉCRIRE ICI.
   CE N'EST PAS UN PARESSEUX. Aucune réplique ne doit pouvoir se
   lire comme une blague sur sa flemme — il n'en fait jamais sur
   lui-même, et il ne se plaint jamais de son corps.

   Il a dit oui à quelque chose d'impossible, il s'est levé, et
   il a mis une heure et quart à parcourir six mètres en sachant
   à chaque centimètre qu'il n'y arriverait pas.
   ============================================================ */
function leRideau() {

    if (!saitQue("fraisy_ok")) {
        lancerDialogue([
            { texte: "Le rideau de gauche, par terre, en tas." },
            { texte: "Bob tire dessus à deux pattes. Il est coincé sous quelque chose de lourd." },
            { texte: "Ça ne bouge pas d'un millimètre." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Le rideau par terre. En tas. Coincé sous quelque chose de lourd." },
        { texte: "Bob s'agenouille. Il soulève un coin." },
        { texte: "Du gris. Du pyjama. Des petites oreilles de lapin imprimées dessus." },
        { qui: "bob", texte: "...Samsam ?" },
        { texte: "Il est couché sous la fenêtre ouverte, à l'endroit exact où le froid entre. Il n'arrive pas à se retourner." },
        { qui: "samsam", texte: "...Bob." },
        { qui: "bob", texte: "Qu'est-ce que tu fais là." },
        { qui: "samsam", texte: "J'arrive." },
        { qui: "bob", texte: "Tu arrives où ?" },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Je vais y arriver." },
    ], function () {
        noter("samsam_trouve");
        montrerPeluche(PELUCHES.samsam, true);
        rafraichirObjectif();
    });
}


function verbeSamsam() {
    if (aObjet("chaussette")) return "Couvrir Samsam";
    return "Parler à Samsam";
}


function parlerASamsam() {

    if (aObjet("chaussette") && !saitQue("samsam_couvert")) {
        couvrirSamsam();
        return;
    }

    if (saitQue("samsam_ok")) {
        lancerDialogue([
            { qui: "samsam", texte: "Tu es encore là." },
            { qui: "bob", texte: "Je réfléchis." },
            { qui: "samsam", texte: "Réfléchis à côté de moi, alors. J'aime bien." },
        ]);
        return;
    }

    if (saitQue("samsam_couvert")) {
        samsamRaconte();
        return;
    }

    lancerDialogue([
        { qui: "bob", texte: "Samsam. Fraisy dit que tu traversais." },
        { qui: "samsam", texte: "..." },
        { texte: "Il essaie de répondre. Le son sort, mais pas les mots." },
        { qui: "samsam", texte: "...j'ai... la fenêtre est... il faut que..." },
        { qui: "bob", texte: "Samsam." },
        { qui: "bob", texte: "Tu as froid ?" },
        { qui: "samsam", texte: "Non." },
        { texte: "La fenêtre est ouverte depuis quatre heures et il est couché juste dessous." },
        { qui: "bob", texte: "Bouge pas. Je reviens." },
        { qui: "samsam", texte: "D'accord." },
    ], function () {
        rafraichirObjectif();
    });
}


function couvrirSamsam() {

    lancerDialogue([
        { texte: "Bob traîne la chaussette de laine sur six mètres. Elle est aussi grande que lui." },
        { texte: "Il la pose sur Samsam. Il la remet. Il la remet encore. Il met beaucoup trop de temps à la poser bien." },
        { qui: "samsam", texte: "Elle est chaude." },
        { qui: "bob", texte: "Oui." },
        { qui: "samsam", texte: "Je n'avais pas froid." },
        { qui: "bob", texte: "Je sais." },
        { texte: "..." },
        { qui: "samsam", texte: "Merci, Bob." },
    ], function () {
        noter("samsam_couvert");
        donnerObjet("chaussette");
        rafraichirObjectif();
    });
}


function samsamRaconte() {

    lancerDialogue([
        { qui: "bob", texte: "Bluey veut savoir ce que tu as entendu pendant qu'il criait." },
        { qui: "samsam", texte: "Lui, il criait. Donc lui, il n'entendait rien." },
        { qui: "samsam", texte: "Moi j'ai entendu des doigts sur le plan de travail. Durs. Trois." },
        { qui: "samsam", texte: "Puis de la vaisselle qui bouge dans l'évier." },
        { qui: "samsam", texte: "Puis un cri, dedans. Ce n'était pas Bluey." },
        { qui: "bob", texte: "Qui c'était." },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Et beaucoup plus tard, un deuxième cri. Dehors. Loin." },
        { qui: "samsam", texte: "Et pas dans la même direction que le premier." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Fraisy dit que tu traversais." },
        { qui: "samsam", texte: "Oui." },
        { qui: "bob", texte: "Pourquoi." },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Quelqu'un a crié mon nom." },
        { qui: "bob", texte: "Qui." },
        { qui: "samsam", texte: "Elle." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Rosy ?" },
        { qui: "samsam", texte: "Oui." },
        { qui: "samsam", texte: "Une fois." },
        { qui: "samsam", texte: "Tu sais qu'elle dort contre toi, Bob ? Tous les soirs. Elle attend que tu sois endormi, et elle se rapproche." },
        { qui: "samsam", texte: "Elle croit que personne ne le voit." },
        { qui: "bob", texte: "Je— elle— ah. Bon. D'accord. Ah." },
        { qui: "samsam", texte: "Alors quand elle a crié mon nom, et pas le tien, j'ai compris qu'elle ne voulait surtout pas te réveiller." },
        { qui: "samsam", texte: "Je me suis levé à ta place." },
        { texte: "Il dit ça comme si c'était une phrase normale." },
        { qui: "samsam", texte: "J'ai mis du temps." },
        { qui: "bob", texte: "Combien." },
        { qui: "samsam", texte: "Je ne sais pas. Longtemps." },
        { qui: "samsam", texte: "Quand je suis arrivé, le rideau était déjà par terre, et la fenêtre était déjà ouverte." },
        { qui: "bob", texte: "Alors tu t'es arrêté." },
        { qui: "samsam", texte: "Non." },
        { qui: "samsam", texte: "Je continuais." },
        { qui: "bob", texte: "Tu continuais vers quoi, Samsam." },
        { qui: "samsam", texte: "Dehors." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Samsam. Tu ne peux pas descendre." },
        { qui: "samsam", texte: "Non." },
        { qui: "samsam", texte: "Mais j'y allais.", quand: silenceDuStudio },
        { texte: "..." },
        { qui: "bob", texte: "..." },
        { qui: "samsam", texte: "Je suis désolé, Bob." },
        { qui: "bob", texte: "Ce n'est pas ta faute." },
        { qui: "samsam", texte: "Je sais." },
        { qui: "samsam", texte: "C'est ça qui est embêtant." },
        { texte: "..." },
        { qui: "samsam", texte: "Retourne voir Bluey." },
        { qui: "bob", texte: "Bluey ?" },
        { qui: "samsam", texte: "Il a VU. Moi j'ai seulement entendu." },
        { qui: "samsam", texte: "Et personne ne lui a jamais rien demandé." },
        { qui: "samsam", texte: "Demande-lui ce que l'oiseau regardait dans le miroir." },
        { qui: "bob", texte: "Il se regardait, non ?" },
        { qui: "samsam", texte: "Bob." },
        { qui: "samsam", texte: "On ne tape pas deux fois dans un miroir pour se regarder soi." },
    ], function () {
        noter("samsam_ok");
        rafraichirObjectif();
    });
}


/* ------------------------------------------------------------
   LE SILENCE — une seule fois dans tout l'acte, sur « Mais j'y
   allais ». Les idles s'arrêtent, y compris le rebond de Bluey à
   l'autre bout de la pièce. La deuxième fois qu'on ferait ça, ça
   ne vaudrait déjà plus rien.
   ------------------------------------------------------------ */
function silenceDuStudio() {
    if (typeof figerLeStudio === "function") figerLeStudio(2);
}


/* ============================================================
   DOUDOU — le pivot
   ============================================================
   RÈGLE D'ÉCRITURE : il ne répond jamais directement, il répond
   par un souvenir. Mais il n'est PAS froid — c'est l'erreur à ne
   pas faire avec lui. Il est vieux, lent, et profondément tendre.
   Il appelle Bob par son nom, souvent. Il ne juge personne.
   ============================================================ */
function parlerADoudou() {

    if (saitQue("verite")) {
        lancerDialogue([
            { qui: "doudou", texte: "Tu es encore là, Bob." },
            { qui: "bob", texte: "Je réfléchis." },
            { qui: "doudou", texte: "Non. Tu as peur." },
            { qui: "doudou", texte: "C'est bien. Ceux qui n'ont pas peur oublient de faire attention." },
        ]);
        return;
    }

    if (!saitQue("bluey_retour")) {
        lancerDialogue([
            { qui: "bob", texte: "Doudou, il faut que je—" },
            { qui: "doudou", texte: "Assieds-toi deux secondes." },
            { qui: "bob", texte: "Je n'ai pas le temps." },
            { qui: "doudou", texte: "Je sais. Personne ne l'a jamais." },
            { qui: "doudou", texte: "Écoute tout le monde d'abord, Bob. Même Bluey." },
            { qui: "doudou", texte: "Surtout Bluey. C'est celui qu'on écoute le moins, et c'est celui qui voit le mieux." },
        ]);
        return;
    }

    if (!aObjet("plume")) {
        lancerDialogue([
            { qui: "doudou", texte: "Il y a quelque chose de blanc, coincé dans le cadre du miroir." },
            { qui: "doudou", texte: "Depuis le début de la nuit." },
            { qui: "bob", texte: "Comment tu sais ça ?" },
            { qui: "doudou", texte: "Je suis vieux. Je regarde. C'est à peu près tout ce que je sais faire." },
            { qui: "doudou", texte: "Va le chercher, mon grand." },
        ]);
        return;
    }

    laVerite();
}


function laVerite() {

    // Evan : « quand Doudou raconte son histoire, c'est pas très
    // clair ». Le souvenir de Sylt reste, mais il est maintenant
    // suivi d'une explication qui ne laisse rien à deviner : la
    // crêpe, Rosy qui ne la lâche pas, le loquet, le nid.
    lancerDialogue([
        { texte: "Doudou prend la plume dans ses deux pattes. Il la reconnaît tout de suite." },
        { qui: "doudou", texte: "C'est une plume de mouette, mon grand." },
        { qui: "bob", texte: "Une mouette. Dans l'appartement." },
        { qui: "doudou", texte: "Assieds-toi. Je vais te raconter quelque chose, et tu vas comprendre." },
        { qui: "doudou", texte: "Un jour, je suis allé à Sylt, une île tout au nord. On y va en train : les rails passent sur la mer." },
        { qui: "doudou", texte: "J'étais dans un sac, avec Klara et celui qui m'a amené ici. Ils marchaient vers la plage, une crêpe chacun, et ils riaient." },
        { qui: "doudou", texte: "Une mouette tournait au-dessus d'eux. D'un coup, elle a plongé sur la dame qui venait en face, et elle est repartie avec sa crêpe.", quand: sonner("mouette") },
        { qui: "doudou", texte: "Klara a tellement ri qu'elle a dû se tenir à lui pour ne pas tomber." },
        { qui: "doudou", texte: "Ce jour-là, j'ai appris une chose : une mouette ne résiste jamais à une crêpe. Elle la sent de très loin, et elle vient la prendre." },
        { qui: "doudou", texte: "Même à Kiel. Même par une fenêtre ouverte, au deuxième étage." },
        { texte: "..." },
        { qui: "bob", texte: "Cette nuit, Fraisy a vu quelqu'un prendre la dernière crêpe. Au sucre. Pour moi." },
        { qui: "bob", texte: "Et Cakey m'a dit que quelqu'un me préparait une surprise pour ce soir. Une surprise qui se mange." },
        { qui: "doudou", texte: "Oui." },
        { qui: "bob", texte: "C'était Rosy." },
        { qui: "doudou", texte: "C'était Rosy, mon grand. Cette crêpe, c'était ta surprise.", quand: sonner("revelation") },
        { qui: "bob", texte: "..." },
        { qui: "doudou", texte: "La mouette l'a sentie. Elle est entrée par la fenêtre de gauche, et elle est allée droit à la cuisine. Samsam a entendu ses griffes sur le plan de travail." },
        { qui: "doudou", texte: "Rosy tenait la crêpe. La mouette a tiré. Rosy n'a pas lâché." },
        { qui: "bob", texte: "Elle aurait dû la lâcher." },
        { qui: "doudou", texte: "Oui. Mais c'était la tienne." },
        { qui: "doudou", texte: "Alors la mouette a tout emporté : la crêpe, et Rosy accrochée à la crêpe. C'est ça, le « truc blanc qui bougeait » que Bluey a vu dans son bec." },
        { qui: "doudou", texte: "Rosy a crié le nom de Samsam, pour ne pas te réveiller. Et en repartant, la mouette a forcé la fenêtre. C'est pour ça que le loquet est tordu vers l'extérieur." },
        { texte: "..." },
        { qui: "bob", texte: "Où est-ce qu'elle l'a emmenée ?" },
        { qui: "doudou", texte: "Là où les mouettes rangent tout ce qu'elles volent : dans leur nid." },
        { qui: "doudou", texte: "En bas, dans la cour, il y a de grands arbres. Le nid est tout en haut du plus grand. Je l'ai vu briller depuis la fenêtre." },
        { qui: "bob", texte: "C'est deux étages plus bas." },
        { qui: "doudou", texte: "Oui, mon grand." },
        { texte: "..." },
        { qui: "bob", texte: "C'est le 8, ce soir." },
        { qui: "doudou", texte: "Je sais." },
        { texte: "Sous le lit, il y a une boîte fermée par un élastique. Bob aussi avait préparé une surprise pour ce soir. Pour elle." },
        { qui: "bob", texte: "Tout le monde le savait ? Pour elle et moi ?" },
        { qui: "doudou", texte: "La première fois que je suis venu ici, tu m'as présenté tout le monde." },
        { qui: "doudou", texte: "« Samsam. Fraisy. Bluey. Cakey. » Très fort, très clair." },
        { qui: "doudou", texte: "Et « Rosy », tout bas, en regardant tes pieds." },
        { qui: "bob", texte: "..." },
        { qui: "doudou", texte: "Je n'habite même pas ici, Bob. Et même moi, je le savais." },
        { qui: "doudou", texte: "Pour le reste, va voir Cakey. Elle sait tout ce qui se fête." },
        { texte: "..." },
        { qui: "bob", texte: "Je vais la chercher." },
        { qui: "doudou", texte: "Alors il te faudra une corde pour descendre, une lumière pour y voir, quelque chose pour te défendre, et quelque chose pour te protéger." },
        { qui: "doudou", texte: "Et tu reviens. Tu m'entends, Bob ? Tu reviens." },
        { texte: "Doudou se lève — ça lui prend du temps — et il traverse tout l'appartement jusqu'à la fenêtre de gauche, pour libérer le passage." },
    ], function () {
        noter("verite");
        donnerObjet("plume");     // il l'a gardée dans ses pattes
        // « Il se lève — ça lui prend du temps — et il traverse tout
        // l'appartement. » Pour de vrai, maintenant, et lentement.
        marcherVers(PELUCHES.doudou, 7, 1, { vitesse: 50 });
        rafraichirObjectif();
    });
}


/* ============================================================
   LA SORTIE — le pyjama Miffy
   ============================================================
   La scène du pyjama est maintenant dans acte2.js
   (sortirParLaFenetre) : c'est elle qui ouvre l'acte II.
   ============================================================ */


/* ============================================================
   LE FRIGO — plein, et Moin dessus
   ============================================================
   ⚠️ D'APRÈS EVAN : il n'y a RIEN d'autre que Moin sur cette
   porte. Pas d'aimant, pas de photo, pas de liste de courses.
   Moin, et c'est tout.
   ============================================================ */
function verbeFrigo() {
    if (saitQue("fraisy_faim") && !aObjet("tomate") && !saitQue("fraisy_ok")) {
        return "Ouvrir le frigo";
    }
    return "Le frigo";
}


function leFrigo() {

    if (saitQue("fraisy_faim") && !aObjet("tomate") && !saitQue("fraisy_ok")) {
        ouvrirLeFrigo();
        lancerDialogue([
            { texte: "Bob ouvre le frigo. La lumière lui arrive en pleine figure." },
            { texte: "Des poivrons. Des courgettes. Un demi-chou. Trois boîtes de tomates. Un grand tupperware de sauce bolognaise. Et encore des courgettes." },
            { qui: "bob", texte: "Klara." },
            { qui: "bob", texte: "Des légumes partout, et de la bolognaise pour trois jours." },
            { qui: "bob", texte: "C'est tellement toi, ce frigo." },
            { texte: "Au milieu, une tomate. Presque trop mûre. Celle qui sait qu'elle va bientôt mourir et qui a décidé d'être délicieuse." },
            { qui: "bob", texte: "...Celle du milieu." },
        ], function () {
            fermerLeFrigo();
            prendreObjet("tomate");
            rafraichirObjectif();
        });
        return;
    }

    if (saitQue("moin")) {
        lancerDialogue([
            { texte: "Moin regarde la fenêtre de la cuisine. Il la regardait déjà tout à l'heure." },
            { qui: "bob", texte: "C'est ce que je me disais." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Le frigo. Sur la porte, il n'y a rien." },
        { texte: "Et tout en haut, à califourchon sur le frigo, il y a un phoque." },
        { texte: "Sur son ventre, en grosses lettres : MOIN.", quand: sonner("moin") },
        { qui: "bob", texte: "Moin." },
        { qui: "bob", texte: "Est-ce que tu as vu quelque chose, cette nuit ?" },
        { texte: "Moin ne répond pas. Moin ne répond jamais." },
        { texte: "Moin ne connaît qu'un mot, et c'est bonjour." },
        { qui: "bob", texte: "...D'accord. Merci quand même." },
    ], function () {
        noter("moin");
    });
}


/* ============================================================
   LE DÉCOR QUI NE SERT À RIEN
   ============================================================
   C'est le seul endroit du jeu où Klara va reconnaître son
   appartement. Chaque ligne doit faire sourire, serrer le cœur,
   ou les deux.

   ⚠️ DEUX INTERDITS ABSOLUS ICI :
   - la narration ne décide jamais de ce que le joueur fera ;
   - Bob n'est jamais condescendant avec Klara. Jamais.
   ============================================================ */

function leTapis() {

    if (saitQue("petale")) {
        if (saitQue("verite")) {
            lancerDialogue([
                { texte: "Le grand tapis blanc. Il faut le traverser en entier pour aller du lit à la fenêtre." },
                { qui: "bob", texte: "Elle est passée par là." },
                { qui: "bob", texte: "Et j'ai dormi." },
            ]);
            return;
        }
        lancerDialogue([
            { texte: "Le grand tapis blanc, celui qui fait la moitié de la pièce. Il est très doux et il perd ses poils partout." },
        ]);
        return;
    }

    /* ⚠️ C'EST ICI QUE SE JOUE TOUTE LA FIN DU JEU.
       Evan : « en amont, on doit mieux comprendre que la rose est
       pour Klara, sur la table de nuit ». Il avait raison : le geste
       existait depuis le début, mais on ne le nommait nulle part, et
       à l'épilogue on ne comprenait pas pourquoi Bob traversait la
       pièce pour poser une pétale sur un meuble. Il le dit ici, la
       première fois qu'il la ramasse, et on n'y revient qu'au nid. */
    lancerDialogue([
        { texte: "Le grand tapis blanc, celui qui fait la moitié de la pièce." },
        { texte: "Par terre, au milieu, une pétale de rose." },
        { qui: "bob", texte: "Le bouquet en perd tout le temps." },
        { texte: "Il la ramasse sans y penser une seconde. Ça fait quatre ans qu'il fait ce geste-là." },
        { qui: "bob", texte: "Je la poserai sur sa table de nuit avant qu'elle ouvre les yeux. Comme tous les matins." },
        { qui: "bob", texte: "Elle croit que c'est le bouquet qui les met là." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "C'est un peu le bouquet, aussi." },
    ], function () {
        noter("petale");
        prendreObjet("petale");
    });
}


function laTableDeNuit() {
    lancerDialogue([
        { texte: "La table de nuit, à la tête du lit. Une lampe, un verre d'eau à moitié bu, et un livre posé à l'envers pour ne pas perdre la page." },
        { texte: "Le livre est à l'envers depuis trois semaines." },
        { qui: "bob", texte: "Elle le finira." },
        { qui: "bob", texte: "Elle finit toujours tout. Elle prend juste son temps." },
    ]);
}


function verbeSousLeLit() {
    if (saitQue("samsam_trouve") && !saitQue("samsam_couvert") && !aObjet("chaussette")) {
        return "Chercher sous le lit";
    }
    return "Sous le lit";
}


function sousLeLit() {

    // La chaussette n'apparaît que quand on en a besoin : la trouver
    // trop tôt, c'est l'avoir oubliée au moment utile.
    if (saitQue("samsam_trouve") && !saitQue("samsam_couvert") && !aObjet("chaussette")) {
        lancerDialogue([
            { texte: "Sous le lit : de la poussière, deux chaussettes dépareillées, et une boîte fermée par un élastique." },
            { texte: "Bob repousse la boîte un peu plus loin dans le noir." },
            { qui: "bob", texte: "Pas maintenant." },
            { texte: "Il prend la plus grande des deux chaussettes. Elle est en laine, et elle fait sa taille." },
        ], function () {
            prendreObjet("chaussette");
            rafraichirObjectif();
        });
        return;
    }

    if (saitQue("verite")) {
        lancerDialogue([
            { texte: "La boîte est toujours là, tout au fond, contre le mur." },
            { qui: "bob", texte: "Je reviens." },
            { qui: "bob", texte: "Bouge pas." },
            { texte: "Il parle à une boîte." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Sous le lit : de la poussière, deux chaussettes dépareillées, et une boîte." },
        { texte: "Elle est fermée par un élastique. Bob a mis trois semaines à trouver le bon élastique." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Pas maintenant." },
        { texte: "Il la repousse un peu plus loin dans le noir." },
    ]);
}


function leplanDeTravail() {

    if (saitQue("samsam_ok")) {
        lancerDialogue([
            { texte: "Dans la poussière du plan de travail, trois marques. Espacées comme des doigts." },
            { qui: "bob", texte: "Trois." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Le plan de travail. Propre, essuyé, avec les plantes alignées le long du mur." },
        { qui: "bob", texte: "Elle range tout avant de se coucher. Tous les soirs." },
        { texte: "Tout au bout, trois petites marques dans la poussière. Bob ne les voit pas." },
    ]);
}


function lEvier() {

    if (saitQue("samsam_ok")) {
        lancerDialogue([
            { texte: "La pile de vaisselle a bougé. Quelque chose est monté dessus cette nuit." },
            { qui: "bob", texte: "Et ça n'a rien cassé." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "L'évier." },
        { texte: "Il y a une casserole, deux assiettes, trois fourchettes, un couvercle, un verre à l'intérieur d'un autre verre, et quelque chose tout au fond qu'on ne peut plus identifier." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Elle fera ça demain." },
        { texte: "L'empilement tient debout. C'est même assez impressionnant." },
        { qui: "bob", texte: "Franchement, c'est beau." },
    ]);
}


function leBureau() {
    lancerDialogue([
        { texte: "Le bureau de Klara. Deux écrans, un clavier, et un mug de thé." },
        { qui: "bob", texte: "Elle a travaillé tard. Encore." },
        { texte: "Sur l'écran resté allumé, un onglet ouvert : un billet d'avion. Aller simple, dans l'autre sens." },
        { qui: "bob", texte: "...Il arrive bientôt." },
        { qui: "bob", texte: "Elle a regardé ce billet au moins dix fois cette semaine." },
    ]);
}


function laPenderie() {
    lancerDialogue([
        { texte: "Des piles de pulls, rangées par couleur, du plus clair au plus foncé." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Je sais pas comment elle fait." },
        { texte: "Derrière la troisième pile, là où on ne range rien parce qu'on n'y voit rien : un paquet de biscuits ouvert." },
        { qui: "bob", texte: "Alors ça, c'est brillant." },
    ]);
}


function laDouche() {
    lancerDialogue([
        { texte: "La douche. Le rideau est tiré à moitié." },
        { texte: "Le tapis de bain est trempé." },
        { qui: "bob", texte: "..." },
        { texte: "Personne ne s'est lavé cette nuit." },
    ]);
}


function leLavabo() {
    lancerDialogue([
        { texte: "Deux brosses à dents dans le verre. Une rose, une bleue." },
        { texte: "La bleue n'a servi qu'une semaine. En août." },
        { texte: "Elle n'a pas été rangée. Elle est restée dans le verre, avec l'autre." },
        { qui: "bob", texte: "..." },
    ]);
}


function lesToilettes() {
    lancerDialogue([
        { texte: "Les toilettes." },
        { texte: "Sur le rebord, un petit canard en plastique. Personne ne sait pourquoi il est là. Il y est depuis le premier jour." },
        { qui: "bob", texte: "Salut." },
        { texte: "Le canard ne dit rien. Le canard et Moin ne s'adressent pas la parole." },
    ]);
}


function laPorte() {

    secouerLaPorteDEntree();

    if (saitQue("verite")) {
        lancerDialogue([
            { texte: "La porte d'entrée. Toujours fermée à clé." },
            { qui: "bob", texte: "De toute façon, je ne sors pas par là." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "La porte d'entrée. Fermée à clé, de l'intérieur, comme tous les soirs." },
        { qui: "bob", texte: "Personne n'est entré par là." },
        { texte: "Sur le meuble à côté : un trousseau de clés et un paquet de mouchoirs entamé." },
    ]);
}
