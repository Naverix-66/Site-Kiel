/* ============================================================
   L'APPARTEMENT — LE PLAN
   ============================================================
   CHANGEMENT D'APPROCHE PAR RAPPORT À LA V1 DE CE FICHIER :
   on ne décrit plus le décor avec une liste de rectangles, mais
   avec un DESSIN EN ASCII. Kaplay sait lire ça nativement
   (fonction addLevel) et fabrique tout seul un objet par
   caractère.

   Pourquoi c'est très nettement mieux ici :
   - tu VOIS le plan de l'appartement en lisant le code ;
   - déplacer le lit = déplacer 4 lettres, pas recalculer des
     coordonnées ;
   - ajouter une pièce = coller un nouveau dessin ;
   - et quand tu m'auras envoyé le vrai plan, on corrige ça en
     cinq minutes au lieu d'une heure.

   RÈGLE ABSOLUE : toutes les lignes d'un plan doivent faire
   EXACTEMENT la même longueur. Une seule ligne trop courte et
   la pièce est décalée. Utilise "_" pour le vide (l'extérieur
   de l'appartement), jamais l'espace : un espace en fin de
   ligne est invisible et se fait manger par les éditeurs.
   ============================================================ */


/* ------------------------------------------------------------
   LÉGENDE DES CARACTÈRES
   ------------------------------------------------------------
   #  mur                        .  sol (le parquet)
   F  une des 3 grandes fenêtres J  la fenêtre de la cuisine
   K  plan de travail cuisine    e  l'évier
   P  la porte d'entrée          +  la porte de la salle de bain
   _  extérieur (rien)

   Les MEUBLES ne sont plus ici : ils sont dans "objets", plus bas.
   Ce plan ne décrit que le sol, les murs et les ouvertures.

   ⚠️ RÈGLE ABSOLUE : toutes les lignes doivent faire EXACTEMENT
   la même longueur (34 caractères). Une seule ligne trop courte
   et toute la pièce est décalée.
   ------------------------------------------------------------
   #  mur                        .  sol (parquet)
   F  fenêtre (les 3 grandes)    J  fenêtre de la cuisine
   M  le grand miroir            T  le tapis blanc en fourrure
   L  le lit (draps bleu/blanc)  n  la table de nuit
   B  le bureau (setup gaming)   c  la chaise
   R  les rangements blancs      f  le frigo
   K  meuble de cuisine          e  l'évier de la cuisine
   d  la douche                  w  le robinet / lavabo
   t  les toilettes              P  la porte d'entrée
   +  passage entre deux pièces  _  extérieur (rien)
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   ⚠️ PLAN PROVISOIRE
   ------------------------------------------------------------
   Dessiné d'après ta description écrite, en attendant ta photo
   du plan. Les proportions sont sûrement fausses. C'est VOULU :
   il est beaucoup plus facile de corriger un plan existant que
   d'en partir d'une page blanche. Massacre-le sans pitié.
   ------------------------------------------------------------ */
// Le parquet clair : colonne 14, ligne 61 de room_builder (76 colonnes).
// Une seule constante, pour ne le changer qu'à un endroit.
const FRAME_PARQUET = 4650;

const PIECES = {

    studio: {
        nom: "Le studio",
        // Au PIED DU LIT, validé par Evan : l'ouverture dit que Bob
        // descend du lit, et Cakey l'attend juste au-dessus, en (6, 7).
        // C'est aussi là que l'animation d'ouverture (intro.js) le
        // fait atterrir. Les deux doivent rester d'accord.
        departDeBob: { x: 6, y: 9 },

                plan: [
            "####FFF#FFF#FFF######JJJJ####",
            "#........EE......#h......KKK#",
            "#........EE......#h......KKK#",
            "#................#h......KKK#",
            "#T.......................KKK#",
            "#GGGGG.DDDDDDD...........KKe#",
            "#GGGGG.DDDDDDD...........KKe#",
            "#GGGGG.DDDDDDD.##############",
            "#GGGGG.DDDDDDD.#dddd..ww..t.#",
            "#GGGGG.DDDDDDD.#dddd..ww..t.#",
            "#GGGGG.DDDDDDD.#dddd........#",
            "#GGGGG.DDDDDDD.#dddd........#",
            "#......DDDDDDD.######++######",
            "#......DDDDDDD..............#",
            "#C..........................#",
            "#CCCCC...BBBBBB.............#",
            "######################PP#####",
        ],

        /* ------------------------------------------------------
           LES SOLS PAR PIÈCE
           ------------------------------------------------------
           Tout le plan est en parquet par défaut. Ces rectangles
           repeignent le sol par-dessus, là où ce n'est pas du
           parquet dans la vraie vie.

           C'est volontairement à CÔTÉ du plan et pas dedans : tu
           n'as pas à annoter ton dessin avec une lettre de plus
           par pièce. Tu donnes un rectangle, en cases, comme pour
           un meuble.

           x, y = coin haut-gauche ; largeur, hauteur = en cases.
           Les murs traversés par un rectangle sont ignorés — on ne
           repeint que ce sur quoi on marche.

           Pour changer une texture : outils/grille_zone.ps1
           affiche la planche avec les numéros de frame dessus.
           ------------------------------------------------------ */
        sols: [
            // La cuisine : un sol clair et uni, nettement plus blanc
            // que le parquet du salon.
            { x: 18, y: 1, largeur: 10, hauteur: 6, frame: FRAME_SOL_CUISINE },

            // La salle de bain : du vrai carrelage blanc à losanges.
            { x: 16, y: 8, largeur: 12, hauteur: 4, frame: FRAME_SOL_SDB },
        ],
    },

};


/* ============================================================
   LE DICTIONNAIRE DES TUILES
   ============================================================
   COMMENT ÇA MARCHE, EN UNE PHRASE :
   kaplay lit le plan caractère par caractère ; pour chaque
   caractère, il cherche la ligne correspondante là-dessous, et
   fabrique un carré de 16x16 à cet endroit-là.

   Le caractère "L" apparaît 12 fois dans le plan ?
   Alors la ligne "L" ci-dessous sera exécutée 12 fois, et tu
   auras 12 carrés de lit posés au bon endroit. Tu n'écris la
   recette qu'UNE fois.

   ------------------------------------------------------------
   LES DEUX SEULES RECETTES QUI EXISTENT
   ------------------------------------------------------------
   1. TRAVERSABLE : Bob marche dessus (le sol, le tapis).
      -> pas de area(), pas de body().
   2. SOLIDE : Bob se cogne dedans (les murs, les meubles).
      -> avec area() ET body({ isStatic: true }).

   C'est tout. Il n'y a rien d'autre à comprendre.
   Les deux fonctions ci-dessous écrivent ces recettes pour toi,
   pour que tu n'aies pas à recopier 6 lignes par meuble.
   ============================================================ */


// Bob marche dessus. z(0) = dessiné tout au fond.
function tuileTraversable(couleur) {
    return [
        rect(TAILLE_TUILE, TAILLE_TUILE),
        color(...couleur),
        z(0),
    ];
}

// Rose fluo = "pas encore fait". Aucune de ces tuiles ne doit
// rester à la fin : tant que tu vois du rose, il te reste du boulot.
function tuileAFaire() {
    return [
        rect(TAILLE_TUILE, TAILLE_TUILE),
        color(255, 0, 200),
        area(),
        body({ isStatic: true }),
        z(1),
    ];
}


// Bob se cogne dedans. z(1) = dessiné par-dessus le sol.
function tuileSolide(couleur) {
    return [
        rect(TAILLE_TUILE, TAILLE_TUILE),
        color(...couleur),
        area(),
        body({ isStatic: true }),
        z(1),
    ];
}

// Une tuile piochée dans une planche d'images, au lieu d'un carré de couleur.
function tuileImage(frame) {
    return [
        sprite("piece", { frame: frame }),
        z(0),
    ];
}

// Idem, mais Bob se cogne dedans : c'est ce qui sert aux murs.
//
// ⚠️ area() DOIT être écrit avant body(). Vérifié dans le code de
// kaplay : body() ne branche la résolution des collisions que s'il
// voit déjà une zone sur l'objet au moment où il s'ajoute. Dans
// l'autre ordre, le mur est bien là mais Bob le traverse.
function tuileImageSolide(frame) {
    return [
        sprite("piece", { frame: frame }),
        area(),
        body({ isStatic: true }),
        z(1),
    ];
}

// Même chose, mais depuis un PNG à nous plutôt qu'une case de la
// planche du pack. C'est ce qui sert au dessus des murs, découpé
// sur mesure dans le papier peint pour que tout s'accorde.
function tuileSpriteSolide(nom) {
    return [
        sprite(nom),
        area(),
        body({ isStatic: true }),
        z(1),
    ];
}


/* ============================================================
   ⬇️  À TOI DE JOUER  ⬇️
   ============================================================
   Il y a 20 lignes ci-dessous. J'en ai rempli 5 pour te montrer
   le motif exact. Les 15 autres sont marquées "// À REMPLIR" :
   remplace juste ce commentaire par la bonne ligne, sur le
   modèle de celles du dessus.

   Une ligne se lit comme ça :

        "L": () => tuileSolide(COULEUR_LIT),
         ^         ^            ^
         |         |            └── la couleur (toutes sont
         |         |                définies dans config.js)
         |         └── traversable ou solide ?
         └── le caractère dans le plan

   Le "() =>" devant est obligatoire : il dit à kaplay
   « ne fabrique pas la tuile tout de suite, fabrique-la à
   chaque fois que tu croises ce caractère ». Sans lui, tu
   n'aurais qu'UN seul mur pour tout l'appartement.
   ============================================================ */

const TUILES = {

    /* ---- LE SOL ---- */
    ".": () => tuileImage(FRAME_PARQUET),

    /* ---- LES ZONES DE MEUBLE ----
       Ces lettres ne dessinent PAS le meuble : elles dessinent le
       parquet, et marquent l'emprise. C'est poserMeubles() qui
       vient poser la bonne image par-dessus.

       La correspondance lettre -> meuble est dans meubles.js
       (ZONES_MEUBLES). */
    "G": () => tuileImage(FRAME_PARQUET),   // le lit
    "D": () => tuileImage(FRAME_PARQUET),   // le tapis en fourrure
    "C": () => tuileImage(FRAME_PARQUET),   // les rangements
    "B": () => tuileImage(FRAME_PARQUET),   // le grand miroir
    "E": () => tuileImage(FRAME_PARQUET),   // le bureau gaming
    "h": () => tuileImage(FRAME_PARQUET),   // le frigo
    "d": () => tuileImage(FRAME_PARQUET),   // la douche
    "w": () => tuileImage(FRAME_PARQUET),   // le lavabo
    "t": () => tuileImage(FRAME_PARQUET),   // les toilettes
    "n": () => tuileImage(FRAME_PARQUET),   // la table de nuit
    "T": () => tuileImage(FRAME_PARQUET),   // la table de nuit, à la tête du lit

    /* ---- LES MURS ET OUVERTURES ---- */
    // Ces trois tuiles sont la COLLISION et le DESSUS du mur — ce
    // qu'on voit des murs de gauche, de droite et du bas, qu'on
    // regarde presque à la verticale.
    //
    // ⚠️ C'ÉTAIT LE BUG "les murs verticaux font pas naturel".
    // Ils utilisaient une tuile de bordure BEIGE RAYÉE du pack,
    // pendant que les murs du fond, eux, avaient un papier peint
    // CRÈME. Deux matières différentes pour un même mur : l'œil le
    // voit tout de suite, même sans savoir pourquoi.
    //
    // mur_dessus.png est découpé DANS ce papier peint crème (voir
    // outils/refaire_meubles.ps1) : tous les murs de l'appartement
    // sont maintenant faits de la même chose.
    "#": () => tuileSpriteSolide("mur_dessus"),
    "F": () => tuileSpriteSolide("mur_dessus"),   // les 3 grandes fenêtres
    "J": () => tuileSpriteSolide("mur_dessus"),   // la fenêtre de la cuisine

    /* ---- LA CUISINE ----
       Le plan de travail et l'évier sont devenus des ZONES : leurs
       lettres ne rendent donc que du parquet, et poserMeubles()
       vient assembler le meuble par-dessus. */
    "K": () => tuileImage(FRAME_PARQUET),
    "e": () => tuileImage(FRAME_PARQUET),

    /* ---- LES PASSAGES (traversables) ---- */
    "P": () => tuileSpriteSolide("mur_dessus"),     // la porte d'entrée : fermée à clé, dessinée par animes.js
    "+": () => tuileImage(FRAME_PARQUET),           // la porte de la salle de bain : ses battants sont dans animes.js
};
