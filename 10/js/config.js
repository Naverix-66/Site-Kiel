/* ============================================================
   CONFIGURATION GLOBALE — OCTOBRE
   ============================================================
   Toutes les valeurs qu'on aura envie de régler au feeling
   pendant le développement vivent ICI, et nulle part ailleurs.
   Si tu te retrouves à écrire un nombre "magique" au milieu
   d'un autre fichier, c'est qu'il doit remonter dans celui-ci.
   ============================================================ */


/* ------------------------------------------------------------
   MONDE & PIXEL ART
   ------------------------------------------------------------
   On travaille en tuiles de 16x16 pixels (c'est le standard des
   packs d'assets d'intérieur). Une "position en tuiles" est donc
   toujours multipliée par TAILLE_TUILE pour devenir une position
   en pixels du monde.
   ------------------------------------------------------------ */
const TAILLE_TUILE = 32;

// Combien de tuiles on veut voir tenir dans la plus PETITE dimension
// de l'écran. C'est le vrai réglage de "à quel point on est zoomé".
// Plus le nombre est petit, plus on est proche de Bob.
const TUILES_VISIBLES = 10;

// Garde-fous : on ne veut jamais un zoom absurde.
const ZOOM_MIN = 2;
const ZOOM_MAX = 5;


/* ------------------------------------------------------------
   BOB
   ------------------------------------------------------------ */
const VITESSE_BOB = 150;           // pixels du monde par seconde
                                   // (doublée avec la tuile : Bob doit toujours
                                   //  franchir le même nombre de tuiles par seconde)
const RAYON_BOB = 6;               // taille du Bob provisoire (une simple boule)
const LARGEUR_HITBOX_BOB = 20;     // la boîte de collision est plus petite
const HAUTEUR_HITBOX_BOB = 12;      // que le sprite : classique en vue de dessus,
                                   // seuls "les pieds" bloquent contre les murs.


/* ------------------------------------------------------------
   JOYSTICK VIRTUEL (téléphone)
   ------------------------------------------------------------ */
const JOYSTICK_RAYON_BASE = 55;    // le grand cercle fixe
const JOYSTICK_RAYON_POUCE = 26;   // le petit cercle qui suit le doigt
const JOYSTICK_MARGE = 30;         // distance depuis le coin bas-gauche de l'écran
const JOYSTICK_ZONE_MORTE = 0.15;  // en dessous de 15% d'inclinaison, on considère
                                   // que le doigt ne bouge pas (évite les tremblements)


/* ------------------------------------------------------------
   PALETTE
   ------------------------------------------------------------
   On reprend l'identité "clean girl" du calendrier (index.css)
   et on la pousse vers une ambiance nocturne d'octobre :
   la chambre est éclairée à la lampe de chevet, pas au néon.
   ------------------------------------------------------------ */
const COULEUR_ENCRE = [75, 59, 54];          // #4B3B36 — le texte
const COULEUR_ACCENT = [217, 166, 160];      // #D9A6A0 — le rose du site
const COULEUR_ACCENT_FONCE = [193, 127, 119];// #C17F77
const COULEUR_OR = [201, 168, 118];          // #C9A876 — les moments importants
const COULEUR_CREME = [251, 243, 238];       // #FBF3EE — le fond du site
const COULEUR_NUIT = [35, 28, 44];           // le fond hors-écran / les bords
const COULEUR_SOL_TEST = [58, 46, 62];       // placeholder tant qu'on n'a pas les tuiles
const COULEUR_MUR_TEST = [93, 74, 92];       // placeholder


/* ------------------------------------------------------------
   SAUVEGARDE
   ------------------------------------------------------------
   Une seule clé localStorage pour tout le jeu : on y range un
   objet JSON (acte en cours, objets ramassés, dialogues déjà vus).
   ------------------------------------------------------------ */
const CLE_SAUVEGARDE = "bob-octobre-sauvegarde";


/* ------------------------------------------------------------
   COULEURS PROVISOIRES DU MOBILIER
   ------------------------------------------------------------
   Uniquement le temps qu'on n'a pas les vraies tuiles dessinées.
   Le but n'est PAS que ce soit joli : c'est que tu distingues
   chaque meuble d'un coup d'œil pendant que tu construis le plan.
   Tout ce bloc disparaîtra au Lot 2.
   ------------------------------------------------------------ */
const COULEUR_SOL = [72, 56, 48];        // parquet
const COULEUR_TAPIS = [238, 232, 228];   // le tapis blanc en fourrure
const COULEUR_LIT = [116, 146, 190];     // draps bleu et blanc
const COULEUR_BOIS = [122, 94, 74];      // table de nuit, bureau, chaise
const COULEUR_BLANC_MEUBLE = [226, 220, 214]; // rangements, meubles de cuisine
const COULEUR_METAL = [166, 172, 178];   // frigo, évier, robinet
const COULEUR_MIROIR = [178, 200, 210];  // le grand miroir
const COULEUR_SANITAIRE = [242, 244, 246]; // douche, toilettes
const COULEUR_PORTE = [201, 168, 118];   // les passages, bien voyants


/* ------------------------------------------------------------
   LES PLANCHES DE BOB ET DES PELUCHES
   ------------------------------------------------------------
   Rangées une animation par ligne, en cellules carrées (voir
   moteur.js). Toutes refaites d'un coup par
   outils/refaire_peluches.ps1.
   ------------------------------------------------------------ */

// La hauteur de Bob dans le monde, en pixels : ~1,4 tuile. À
// 1 tuile = 50 cm, ça fait ~70 cm, sa taille réelle. Un lit de 4
// tuiles le dépasse donc de trois têtes — il redevient une PELUCHE
// dans un appartement d'humain, et plus un humain.
// C'est aussi l'unité des tailles de personnages.js : Samsam
// (taille 1.6) fait 72 px.
const HAUTEUR_BOB = 45;

// ⚠️ LA FINESSE DES PERSONNAGES.
// Leurs planches sont dessinées 2 fois plus fin que le décor, et
// affichées réduites de moitié. Le jeu agrandit tout de 2 à 5 fois
// (calculerZoom), donc un pixel de personnage n'est jamais plus
// petit qu'un pixel d'écran : on voit TOUT le détail des dessins
// d'Evan au lieu d'une version ramenée à 32 px de haut, qui
// faisait « hyper pixélisé » et rendait les visages inquiétants.
// Doit rester égal à $FINESSE dans outils/refaire_peluches.ps1.
const FINESSE_PELUCHES = 2;

const VITESSE_ANIM_MARCHE = 8;     // images par seconde du cycle de marche

// Vitesse des peluches quand l'histoire les fait traverser
// l'appartement (voir marche.js). Chaque acte peut la changer
// au cas par cas : Doudou va lentement, Bluey file.
const VITESSE_MARCHE_PELUCHE = 60;


/* ------------------------------------------------------------
   ORDRE DE DESSIN (le "z")
   ------------------------------------------------------------
   Règle du jeu vu de dessus : ce qui est plus BAS à l'écran est
   plus PROCHE, donc dessiné par-dessus. On calcule donc le z de
   chaque objet mobile à partir de sa position verticale :

        z = Z_DECOR + position Y des pieds

   C'est ce qui fera passer Bob DERRIÈRE le lit quand il est
   au-dessus, et DEVANT quand il est en dessous.

   Le sol, lui, garde un z fixe : il est toujours tout au fond.
   ------------------------------------------------------------ */
const Z_SOL = 0;
const Z_DECOR = 10;                // base à laquelle on ajoute le Y


/* ------------------------------------------------------------
   LE DIALOGUE
   ------------------------------------------------------------
   La boîte de dialogue se dimensionne TOUJOURS en pourcentage de
   l'écran, jamais en pixels fixes : c'est la seule façon qu'elle
   soit lisible à la fois sur le téléphone de Klara et sur ton PC.
   Les min/max l'empêchent de devenir ridicule aux deux extrêmes.
   ------------------------------------------------------------ */
const DIALOGUE_VITESSE_TEXTE = 45;   // caractères par seconde
const DIALOGUE_MARGE = 16;           // distance au bord de l'écran
const DIALOGUE_PART_HAUTEUR = 0.34;  // 34% de la hauteur de l'écran
const DIALOGUE_HAUTEUR_MIN = 120;
const DIALOGUE_HAUTEUR_MAX = 260;

// ⚠️ La taille du TEXTE se calcule, elle ne se fixe pas.
// Une taille en pixels écrite en dur donne forcément tort quelque
// part : 17 px est correct sur un PC en 1280 de large, et
// minuscule sur le téléphone de Klara. On la déduit donc de la
// plus PETITE dimension de l'écran (voir echelleInterface()
// dans dialogue.js), et ces deux bornes empêchent les extrêmes.
const TAILLE_TEXTE_MIN = 15;
const TAILLE_TEXTE_MAX = 24;

// Délai pendant lequel la boîte IGNORE les entrées, juste après
// son ouverture. Sans lui, le clic qui ouvre le dialogue passe
// aussi la première réplique : elle n'aurait pas le temps de la
// lire. 0,18 s suffit et ne se sent pas.
const DIALOGUE_VERROU = 0.18;


/* ------------------------------------------------------------
   LES INTERACTIONS
   ------------------------------------------------------------ */
// Portée, en pixels du monde, à laquelle Bob peut interagir avec
// un objet. Mesurée depuis ses pieds jusqu'au BORD de la zone,
// pas jusqu'à son centre : sinon un grand meuble serait
// injouable et un petit objet trop facile.
const PORTEE_INTERACTION = 40;

const BOUTON_ACTION_RAYON = 34;
const BOUTON_ACTION_MARGE = 30;


/* ------------------------------------------------------------
   ORDRE DE DESSIN DE L'INTERFACE
   ------------------------------------------------------------
   Très au-dessus de Z_DECOR + n'importe quelle position Y : une
   boîte de dialogue ne doit JAMAIS passer derrière un meuble.
   ------------------------------------------------------------ */
const Z_INTERFACE = 2000;


/* ------------------------------------------------------------
   LES MURS
   ------------------------------------------------------------
   Deux tuiles de room_builder.png, qui vont ENSEMBLE : le pack
   dessine ses murs sur deux rangées, et prendre l'une sans
   l'autre donne un mur sans plafond ou un mur sans plinthe.

        1300 = colonne 8, ligne 17  -> haut (ligne de plafond)
        1376 = colonne 8, ligne 18  -> bas  (avec la plinthe)

   Papier peint crème uni, choisi pour rester dans l'identité
   "clean girl" du calendrier. Pour en changer, ouvre
   outils/grille_zone.ps1 : il fabrique une planche numérotée où
   se lisent tous les autres papiers peints du pack.
   ------------------------------------------------------------ */
const FRAME_MUR_HAUT = 1300;
const FRAME_MUR_BAS = 1376;

// Le DESSUS des murs n'est plus une case de la planche : c'est
// mur_dessus.png, un carré de 32 découpé DANS le papier peint
// crème ci-dessus. Voir pieces.js pour la raison.

// Le DESSUS des murs — ce qu'on voit des murs de gauche, de droite
// et du bas, qu'on regarde presque à la verticale.
//
// C'était un aplat violet, et ça se voyait : le jeu avait trois murs
// texturés et deux murs en rectangle de couleur. C'est maintenant la
// tuile de bordure de pièce du pack (colonne 15, ligne 2), un beige
// rayé qui s'accorde au papier peint crème de la face.
//
// Ses voisines, si tu veux varier : 166 a un liseré sombre à gauche,
// 169 en a un à droite, 14 à 17 ont une arête sombre en haut.
// outils/grille_zone.ps1 les affiche toutes avec leurs numéros.
const FRAME_MUR_DESSUS = 167;

const COULEUR_MUR_DESSUS = [64, 55, 66];   // gardée en secours


/* ------------------------------------------------------------
   L'INVENTAIRE
   ------------------------------------------------------------
   Il s'affiche en haut à GAUCHE : c'est le seul coin de l'écran
   qui reste libre. Le joystick tient le bas-gauche, le bouton
   d'action le bas-droit, la boîte de dialogue tout le bas, et
   la ligne d'objectif le haut-centre.
   ------------------------------------------------------------ */
const INVENTAIRE_MARGE = 14;


/* ------------------------------------------------------------
   LES SOLS
   ------------------------------------------------------------
   Le parquet est le sol par défaut de tout l'appartement. Ces
   deux-là le remplacent dans la cuisine et la salle de bain
   (voir le tableau "sols" de pieces.js).

   Choisis par mesure et non à l'œil : j'ai calculé la luminance
   et la neutralité de toutes les tuiles de sol de la planche, et
   retenu les plus claires qui se répètent sans couture.

        5520  carrelage blanc à losanges  -> les deux pièces

   La cuisine a d'abord eu un aplat gris clair (4464), plus blanc
   que le parquet mais sans aucune texture : à l'écran, ça faisait
   un grand trou gris au milieu de l'appartement. Le même carrelage
   que la salle de bain marche beaucoup mieux — et dans un vrai
   appartement, c'est souvent le même.

   Pour en changer : outils/grille_zone.ps1 affiche la planche
   avec les numéros écrits sur chaque case.
   ------------------------------------------------------------ */
const FRAME_SOL_CUISINE = 5520;
const FRAME_SOL_SDB = 5520;


/* ------------------------------------------------------------
   LA NUIT (voir lumieres.js)
   ------------------------------------------------------------
   Le voile de nuit passe par-dessus tout le décor et les
   personnages, mais SOUS l'interface (objectif, inventaire,
   bulles, joystick, dialogue).
   ------------------------------------------------------------ */
const Z_NUIT = Z_INTERFACE - 150;
const COULEUR_NUIT_VOILE = [16, 18, 42];
const OPACITE_NUIT = 0.3;        // 0 = plein jour, 1 = noir complet
