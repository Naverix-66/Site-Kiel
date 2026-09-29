/* ============================================================
   LE CATALOGUE DES MEUBLES
   ============================================================
   CHANGEMENT D'APPROCHE, ET C'EST LE BON

   Avant, un meuble était décrit par un numéro de frame dans une
   grande planche. C'était la source de TOUS nos bugs de texture :
   un cadrage décalé d'une tuile, et le meuble sortait coupé en
   deux ou remplacé par son voisin.

   Maintenant, un meuble = UN FICHIER PNG. Plus de grille, plus
   de numéro, plus de cadrage. On ne peut littéralement plus se
   tromper : ce qu'on voit dans le fichier est ce qui s'affiche.

   Les fichiers sont dans assets/decor/meubles/, découpés depuis
   le pack à sa résolution native — jamais agrandis, parce que
   agrandir du pixel art le détruit.

   ------------------------------------------------------------
   LES CHAMPS

   image      le nom du sprite (= le nom du fichier, sans .png)
   largeur    emprise au sol EN TUILES, en largeur
   hauteur    idem en hauteur
   solide     false pour ce sur quoi on marche (les tapis)
   basSolide  hauteur de la zone de collision, comptée depuis le
              BAS du meuble. Une penderie de 3 tuiles de haut n'en
              bloque qu'une : Bob passe alors DEVANT sa partie
              haute, ce qui donne la profondeur.
              Absent = tout le meuble bloque.
   adosse     nombre de tuiles du HAUT de l'image qui débordent sur le mur
              au-dessus de la zone (le miroir d'un lavabo, le réservoir
              des toilettes, les écrans du bureau). La zone du plan ne
              couvre alors que le sol : hauteur - adosse tuiles.
   segments   pour les meubles MODULAIRES (voir ci-dessous)
   etirable   le sprite prend la taille EXACTE de la zone du plan.
              À réserver aux textures douces (un tapis) : sur une
              image à lignes droites, l'étirement se voit tout de suite.

   ------------------------------------------------------------
   LES MEUBLES MODULAIRES

   Certains meubles sont livrés en morceaux : un bord gauche, un
   ou plusieurs motifs de centre, un bord droit. Le code les
   assemble pour remplir la largeur EXACTE de la zone dessinée
   dans le plan.

   C'est ce qui permet une penderie ou un plan de travail de
   n'importe quelle longueur, sans jamais étirer une seule image.
   ============================================================ */

const CATALOGUE_MEUBLES = {

    /* ---- LA CHAMBRE ---- */

    // Le lit de Klara, fabriqué sur mesure pour SA zone du plan.
    //
    // Le pack ne contient aucun lit de plus de 3x3 tuiles : j'ai
    // vérifié les 556 objets de son dossier chambre. Celui-ci est
    // donc un lit de 2x3 du pack (lit_source.png) agrandi en 5x7
    // par DÉCOUPE EN 9 TRANCHES — voir outils/etirer_9tranches.ps1.
    //
    // On ne l'a ni étiré ni zoomé : la tête de lit, les oreillers et
    // la barre de pied sont ceux d'origine, au pixel près, et seul
    // le tissu de la couette a été répété. C'est pour ça qu'il fait
    // la taille de ta zone sans avoir l'air d'un agrandissement.
    //
    // ⚠️ SI TU CHANGES LA ZONE 'G' DU PLAN : relance
    //    outils/refaire_meubles.ps1, il régénère tout aux nouvelles
    //    dimensions. Ne modifie pas lit_klara.png à la main.
    lit: {
        image: "lit_klara",
        largeur: 5,
        hauteur: 7,
        solide: true,
    },

    tapis: {
        image: "tapis_fourrure",
        largeur: 4,
        hauteur: 4,
        solide: false,          // on marche dessus

        // SEUL meuble étirable du catalogue, et c'est un cas à part :
        // la fourrure est une texture douce, sans arête nette. L'étirer
        // ne se voit pas, là où étirer un lit ou une commode — qui ont
        // des lignes droites et des angles — saute immédiatement aux yeux.
        // Il prend donc exactement la taille de la zone du plan.
        etirable: true,
    },

    tableNuit: {
        image: "table_nuit",
        largeur: 1,
        hauteur: 2,
        solide: true,
        basSolide: 1,
    },

    lampeChevet: {
        image: "lampe_table_nuit",
        largeur: 1,
        hauteur: 2,
        solide: false,          // elle est POSÉE sur la table de nuit
    },

    // Modulaire : remplit la largeur de la zone du plan.
    rangements: {
        segments: {
            gauche: "meuble_habit_gauche",
            centre: ["meuble_habit_centre_A", "meuble_habits_centre_B"],
            droite: "meuble_habits_droite",
        },
        hauteur: 3,
        solide: true,
        basSolide: 1,
    },

    /* ---- LE BUREAU ---- */

    bureau: {
        image: "bureau_gaming",
        largeur: 2,
        hauteur: 3,
        solide: true,
        basSolide: 2,
        adosse: 1,
    },

    meubleBureau: {
        image: "meuble_droite_bureau",
        largeur: 1,
        hauteur: 2,
        solide: true,
        basSolide: 1,
    },

    miroirBureau: {
        image: "mirroir_bureau",
        largeur: 1,
        hauteur: 1,
        solide: true,
    },

    /* ---- LA SALLE DE BAIN ---- */

    miroir: {
        image: "mirroir_A",
        largeur: 2,
        hauteur: 2,
        solide: true,
        basSolide: 1,
    },

    miroirEtroit: {
        image: "mirroir_B",
        largeur: 1,
        hauteur: 2,
        solide: true,
        basSolide: 1,
    },

    douche: {
        image: "douche",
        largeur: 2,
        hauteur: 2,
        solide: true,
    },

    lavabo: {
        image: "lavabo",
        largeur: 2,
        hauteur: 3,
        solide: true,
        basSolide: 2,
        adosse: 1,
    },

    // Celles du PACK, vues de dessus. On est revenu à celles-là :
    // l'imitation générée était trop lisse à côté des aplats du pack,
    // et ça se voyait. toilettes_profil.png reste dans le dossier si
    // jamais on veut réessayer un jour.
    toilettes: {
        image: "toilettes",
        largeur: 1,
        hauteur: 3,
        solide: true,
        basSolide: 2,
        adosse: 1,
    },

    tapisDouche: {
        image: "tapis_douche",
        largeur: 2,
        hauteur: 2,
        solide: false,
    },

    papierToilette: {
        image: "pq",
        largeur: 1,
        hauteur: 1,
        solide: false,
    },

    /* ---- LA CUISINE ---- */

    frigo: {
        // Vu de face, et animé : sa porte s'ouvre quand Bob l'ouvre
        // (animes.js).
        image: "frigo_face",
        largeur: 1,
        hauteur: 3,
        solide: true,
        basSolide: 2,
    },

    // ⚠️ MODULAIRE **VERTICAL**.
    //
    // La cuisine de Klara longe le mur de DROITE. Le pack, lui, ne
    // dessine ses plans de travail que vus de face, pour un mur du
    // haut : posé contre un mur latéral, on voyait sa façade au lieu
    // de son flanc, et c'était le morceau le plus laid du jeu.
    //
    // Première version : des pièces de façade pivotées d'un quart de
    // tour. Ratée (Evan) : on voyait des tiroirs couchés. Celle-ci
    // prend le DESSUS de comptoir blanc du kit cuisine du pack
    // (12_Kitchen, la jambe droite du « ∩ »), qui est dessiné vu du
    // dessus : il longe un mur latéral sans rien trahir.
    //
    // Le meuble ne fait qu'UNE case de profondeur, collée au mur,
    // même si la zone du plan en fait trois : un comptoir de trois
    // cases de fond n'existe nulle part. Le reste de la zone reste
    // du sol de cuisine — c'est là qu'on se tient pour cuisiner.
    planTravail: {
        sens: "vertical",
        segments: {
            haut: "comptoir_v_centre",
            centre: ["comptoir_v_centre"],
            bas: "comptoir_v_bas",
        },
        solide: true,
    },

    // Pivoté lui aussi : il s'encastre dans le plan de travail
    // vertical, donc il regarde à gauche comme lui.
    evier: {
        image: "evier_vertical",
        largeur: 1,
        hauteur: 2,
        solide: true,
        dessus: 1,          // toujours par-dessus le plan de travail
    },

    /* ---- L'ENTRÉE ---- */

    meubleEntree: {
        image: "meuble_entree",
        largeur: 2,
        hauteur: 3,
        solide: true,
        basSolide: 1,
    },

};


/* ============================================================
   LES ZONES DU PLAN
   ============================================================
   Quelle lettre du plan ASCII correspond à quel meuble.

   C'est bien plus lisible que des coordonnées : on DESSINE
   l'emprise du lit dans le plan, et le code y pose le bon
   meuble tout seul.

   À ne pas confondre avec le dictionnaire TUILES de pieces.js :

   - une ZONE (ici) = un meuble posé UNE fois, dont l'image
     s'étale sur toute son emprise. Le lit, la douche, la penderie.

   - une TUILE (là-bas) = un motif RÉPÉTÉ à l'identique sur
     chaque case. Le parquet, les murs.

   Mettre un lit en tuile dessinerait cent fois la même image ;
   mettre un parquet en zone n'en dessinerait qu'un bout.
   ============================================================ */
const ZONES_MEUBLES = {
    "G": "lit",
    "D": "tapis",
    "C": "rangements",
    "B": "miroir",
    "E": "bureau",
    "h": "frigo",
    "d": "douche",
    "w": "lavabo",
    "t": "toilettes",
    "n": "tableNuit",
    "T": "tableNuit",      // à la tête du lit
    "K": "planTravail",
    "e": "evier",
};
