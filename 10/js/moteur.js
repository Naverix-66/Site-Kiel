/* ============================================================
   MOTEUR — démarrage de kaplay et chargement des images
   ============================================================
   Ce fichier est le premier à "faire" quelque chose : il crée le
   canvas. Tous les fichiers chargés après lui peuvent donc
   utiliser les fonctions de kaplay (add, sprite, scene...).
   ============================================================ */

kaplay({
    background: [...COULEUR_NUIT],

    // crisp: true = pas de lissage. C'est CE réglage qui fait la
    // différence entre "du vrai pixel art" et "une image floue".
    crisp: true,

    stretch: false,
    letterbox: false,

    // Par défaut, kaplay transforme chaque toucher en clic de souris.
    // On le désactive : le joystick écoute MAINTENANT les deux
    // familles d'événements séparément (tactile ET souris), donc
    // laisser la conversion active ferait réagir les deux chemins
    // au même doigt, et on perdrait le suivi multi-doigts.
    touchToMouse: false,
});

// Vue de dessus : personne ne tombe, donc pas de gravité.
setGravity(0);


/* ============================================================
   CHARGEMENT DES IMAGES
   ============================================================
   ⚠️ À partir d'ici, ouvrir octobre.html en double-clic ne marche
   plus : Chrome refuse de charger une image depuis file://.
   Il faut passer par Live Server. Voir README_DEV.md.
   ============================================================ */


/* ------------------------------------------------------------
   LE DÉCOR
   ------------------------------------------------------------
   Deux planches du pack "Modern Interiors" de LimeZu, en 16x16.
   Une planche est un seul PNG que kaplay découpe en grille :
   sliceX = nombre de colonnes, sliceY = nombre de lignes.

   On désigne ensuite une case par son NUMÉRO DE FRAME :

        frame = ligne x nombre de colonnes + colonne

   Les images _grille_*.png dans assets/decor/ sont les mêmes
   planches avec la grille et les numéros dessinés dessus : c'est
   là qu'on lit les coordonnées d'une tuile.
   ------------------------------------------------------------ */
// ⚠️ On charge les planches en 32x32. Le pack livre EXACTEMENT les
// mêmes grilles en 16, 32 et 48 (16x107, 16x56, 76x113...), donc
// changer de résolution ne casse aucun numéro de frame ni aucune
// position du plan. C'est ce qui a rendu le passage à 32 gratuit.
//
// La planche générique interiors.png n'est PAS chargée : en 32x32
// elle fait 512 x 34048 px, bien au-delà de la taille maximale de
// texture des cartes graphiques (4096). Elle échouerait en silence.
// Les planches par thème suffisent, et sont plus faciles à fouiller.
loadSprite("piece",   "assets/decor/room_builder.png", { sliceX: 76, sliceY: 113 });

const MEUBLES_A_CHARGER = [
    "assiettes_cuisine", "bureau_gaming", "cafe_cuisine", "couteau_cuisine",
    "cuisine_coin_droit", "cuisine_coin_gauche", "cuisine_long", "douche",
    "evier_cuisine", "fenetre_bord", "fenetre_centre", "fenetre_double",
    "fleures_cuisine", "frigo_cuisine", "lampe_table_nuit", "lavabo",
    "lit", "lumiere_table_nuit", "meuble_droite_bureau", "meuble_entree",
    "meuble_habit_centre_A", "meuble_habit_gauche", "meuble_habits_centre_B",
    "meuble_habits_droite", "mirroir_A", "mirroir_B", "mirroir_bureau",
    "pq", "table_nuit", "tapis_douche", "tapis_fourrure", "toilettes",
    "toilettes_profil", "lit_klara", "mur_dessus",
    "comptoir_v_centre", "comptoir_v_bas", "evier_vertical",
];

// ---- LES MEUBLES ----
// Un fichier PNG par meuble, et non plus un numéro de frame dans une
// grande planche. C'est ce qui supprime définitivement les bugs de
// cadrage : ce qu'on voit dans le fichier est ce qui s'affiche.
MEUBLES_A_CHARGER.forEach(function (nom) {
    loadSprite(nom, "assets/decor/meubles/" + nom + ".png");
});

// Les meubles ANIMÉS (voir animes.js), découpés en images.
//
// Le frigo du pack, vu de FACE (il regarde vers le bas, comme chez
// Klara) : 7 images de 64 px de large, le frigo dans la moitié gauche,
// sa porte qui s'ouvre dans la moitié droite. 0 = fermé, 5 = grand
// ouvert. animes.js fait défiler les images dans un sens ou l'autre.
loadSprite("frigo_face", "assets/decor/meubles/frigo_anime.png", { sliceX: 7 });

// Une porte en bois de 2 cases de haut : 0 = fermée, 4 = ouverte.
loadSprite("porte_bois", "assets/decor/meubles/porte_bois.png", { sliceX: 5 });


/* ------------------------------------------------------------
   BOB
   ------------------------------------------------------------
   La planche est rangée UNE ANIMATION PAR LIGNE, ce qui permet
   de décrire chaque animation par une simple plage from -> to.
   (kaplay ne sait pas prendre une liste de frames éparpillées ;
    c'est pour ça que outils/remap_anim.ps1 a réordonné la
    planche d'origine.)

        ligne 0 : les poses fixes
        ligne 1 : marche vers le bas
        ligne 2 : marche vers le haut
        ligne 3 : marche de profil

   Il n'y a pas d'animation "marche vers la droite" : on réutilise
   celle de profil en la retournant avec flipX. Deux fois moins
   d'images à produire, et zéro risque d'incohérence entre les
   deux côtés.
   ------------------------------------------------------------ */
const ANIMS_PELUCHE = {
    "idle-bas": 0,
    "idle-haut": 1,
    "idle-cote": 2,

    "marche-bas": { from: 4, to: 7, loop: true, speed: VITESSE_ANIM_MARCHE },
    "marche-haut": { from: 8, to: 11, loop: true, speed: VITESSE_ANIM_MARCHE },
    "marche-cote": { from: 12, to: 15, loop: true, speed: VITESSE_ANIM_MARCHE },
};

loadSprite("bob", "assets/peluches/bob_anim.png", {
    sliceX: 4,
    sliceY: 4,
    anims: ANIMS_PELUCHE,
});


/* ------------------------------------------------------------
   LES AUTRES PELUCHES
   ------------------------------------------------------------
   EXACTEMENT le même rangement que Bob, donc les mêmes noms
   d'animation. Les planches générées par Evan passent d'abord
   par outils/refaire_peluches.ps1, qui les ramène à ce gabarit et
   à la bonne taille (voir « taille » dans personnages.js, et
   FINESSE_PELUCHES dans config.js).

   Une clé absente de cette liste reste une pastille de couleur :
   on peut ajouter un personnage avant d'avoir son dessin.

   Rosy est chargée même si elle n'apparaît pas dans l'acte I :
   c'est toute la raison du voyage, elle servira.
   ------------------------------------------------------------ */
const PELUCHES_DESSINEES = ["bluey", "fraisy", "samsam", "doudou", "cakey", "rosy"];

PELUCHES_DESSINEES.forEach(function (cle) {
    loadSprite(cle, "assets/peluches/" + cle + "_anim.png", {
        sliceX: 4,
        sliceY: 4,
        anims: ANIMS_PELUCHE,
    });
});


/* ------------------------------------------------------------
   LES PORTRAITS de la boîte de dialogue
   ------------------------------------------------------------
   Tête et épaules, découpées dans la planche de chacun. Bob en a
   un aussi : c'est lui qui parle le plus.
   ------------------------------------------------------------ */
["bob"].concat(PELUCHES_DESSINEES).forEach(function (cle) {
    loadSprite("portrait_" + cle, "assets/peluches/portraits/" + cle + ".png");
});

function aUnPortrait(cle) {
    return cle === "bob" || PELUCHES_DESSINEES.indexOf(cle) >= 0;
}


/* ------------------------------------------------------------
   LES TENUES — un personnage qui change d'apparence en route
   ------------------------------------------------------------
   Samsam donne son pyjama à la fin de l'acte I : à l'acte II, il
   a sa planche sans pyjama (et le portrait qui va avec). Une tenue
   a le même gabarit et la même taille que le personnage ; elle se
   met avec changerDeTenue() (histoire.js), et APPARENCES dit qui
   porte quoi en ce moment.
   ------------------------------------------------------------ */
const TENUES = ["samsam_sans_pyjama"];

TENUES.forEach(function (tenue) {
    loadSprite(tenue, "assets/peluches/" + tenue + "_anim.png", {
        sliceX: 4,
        sliceY: 4,
        anims: ANIMS_PELUCHE,
    });
    loadSprite("portrait_" + tenue, "assets/peluches/portraits/" + tenue + ".png");
});

/* ------------------------------------------------------------
   LA MOUETTE (acte III bis / acte IV)
   ------------------------------------------------------------
   Le seul personnage du jeu qui n'est pas une peluche : des
   plumes, pas de coutures, et un œil qui ne cligne pas. Sa
   planche ne suit donc pas le gabarit des peluches — elle a ses
   propres poses, et surtout TOUTES SES CASES SONT À LA MÊME
   ÉCHELLE : ailes fermées elle est plus petite que Bob, ailes
   ouvertes elle fait presque deux fois sa hauteur en largeur.
   C'est tout le personnage qui tient dans cet écart, donc on ne
   redimensionne jamais une pose séparément.

   ⚠️ Elle regarde à DROITE sur toute la planche (sauf le cri, de
   trois quarts face) : c'est flipX qui la tourne vers la gauche.

   Refaite par outils/refaire_peluches.ps1, qui passe d'abord sa
   planche par carrer_planche.ps1 (elle arrive en 2816 x 1536).
   ------------------------------------------------------------ */
const ANIMS_MOUETTE = {
    "posee": 0,        // debout, ailes fermées
    "jacasse": 1,      // debout, bec ouvert vers le ciel
    "picore": 2,       // penchée, bec au sol, l'air de rien
    "sonnee": 3,       // bec coincé, ailes en désordre

    "marche": { from: 4, to: 7, loop: true, speed: 7 },
    "vol": { from: 8, to: 11, loop: true, speed: 9 },

    "pique": 12,       // ailes repliées en V, en diagonale
    "cri": 13,         // trois quarts face, ailes grandes ouvertes
    "coup_aile": 14,   // une aile qui balaie
    "emporte": 15,     // en vol, quelque chose de mou dans le bec
};

loadSprite("mouette", "assets/peluches/mouette_anim.png", {
    sliceX: 4,
    sliceY: 4,
    anims: ANIMS_MOUETTE,
});

/* Sa taille à l'écran, et il faut la calculer, pas la deviner.

   Bob est dessiné dans une case de 116 px où il n'occupe que 90 px.
   À l'acte III sa case fait 56 px (CORDE.hauteurBob), donc sa VRAIE
   hauteur à l'écran est 56 x 90/116 ≈ 43 px.

   La mouette fait 60 cm contre ses 70 : 43 x 60/70 ≈ 37 px. Et elle
   occupe 77 px dans une case de 176.

   D'où : debout, ailes fermées, ELLE EST PLUS PETITE QUE LUI — et
   c'est exactement ce qui doit surprendre le joueur la première fois
   qu'elle se pose. Elle n'est terrifiante que quand elle ouvre. */
const HAUTEUR_MOUETTE = 37;
const CASE_MOUETTE = Math.round(HAUTEUR_MOUETTE * 176 / 77);


const APPARENCES = {};

// La planche (et le portrait) que porte ce personnage en ce moment.
function apparenceDe(cle) {
    return APPARENCES[cle] || cle;
}


/* ------------------------------------------------------------
   LES ICÔNES D'OBJETS
   ------------------------------------------------------------
   Une planche de 3 x 3, dans l'ordre où Evan l'a générée. La
   table donne la case de chaque objet, par son identifiant
   (celui de OBJETS dans l'acte en cours). Les quatre premiers
   serviront à l'acte II.
   ------------------------------------------------------------ */
loadSprite("icones_objets", "assets/ui/objets.png", { sliceX: 3, sliceY: 3 });

// Le côté d'une case de la planche (32 px x FINESSE_PELUCHES). On ne le
// LIT JAMAIS sur l'image : au lancement, une icône créée avant que la
// planche soit prête mesure 0 px, et l'agrandir « pour qu'elle tienne »
// la multipliait par 26 — le pétale de rose géant qui cachait l'écran.
const TAILLE_CASE_ICONE = 32 * FINESSE_PELUCHES;

const ICONES_OBJETS = {
    veilleuse: 0,
    baguette: 1,
    couvercle: 2,
    de: 3,
    petale: 4,
    plume: 5,
    tomate: 6,
    chaussette: 7,
    pyjama: 8,
};


/* ------------------------------------------------------------
   OUTIL : calculerZoom()
   ------------------------------------------------------------
   Le même jeu doit être lisible sur un écran de téléphone de
   375px de large et sur un écran PC de 1920px. Au lieu de fixer
   un zoom en dur, on le calcule pour qu'on voie TOUJOURS à peu
   près le même nombre de tuiles autour de Bob.
   ------------------------------------------------------------ */
function calculerZoom() {
    const plusPetiteDimension = Math.min(width(), height());
    const zoomIdeal = plusPetiteDimension / (TUILES_VISIBLES * TAILLE_TUILE);

    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomIdeal));
}
