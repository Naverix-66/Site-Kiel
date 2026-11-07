/* ============================================================
   CONFIGURATION GLOBALE — NOVEMBRE
   « ONZE JOURS », le téléphone de Lena Brandt
   ============================================================
   Toutes les valeurs qu'on aura envie de régler au feeling
   vivent ICI, et nulle part ailleurs.
   Si tu te retrouves à écrire une valeur "magique" au milieu
   d'un autre fichier, c'est qu'elle doit remonter dans celui-ci.
   ============================================================ */


/* ------------------------------------------------------------
   LA JOUEUSE
   ------------------------------------------------------------
   Le jeu s'adresse à elle directement : c'est elle qui a reçu
   le message perdu du 8 novembre à 23 h 02.
   ------------------------------------------------------------ */
const JOUEUSE = "Klara";
const NUMERO_JOUEUSE = "+49 176 2208 4417";   // un chiffre d'écart avec Mira : 4471 / 4417


/* ------------------------------------------------------------
   LES DATES DU SCÉNARIO
   ------------------------------------------------------------
   On écrit les dates "en dur" sous forme de texte court
   (JJ/MM) parce que c'est un téléphone : ce qu'on lit, ce sont
   des étiquettes, pas des calculs. Les seules vraies dates
   JavaScript du jeu sont l'horloge de la barre d'état (qui
   affiche l'heure réelle, pour l'illusion) et la chronologie.
   ------------------------------------------------------------ */
const NUIT_DE_LA_DISPARITION = "08/11";
const JOUR_OU_MIRA_TROUVE_LE_TELEPHONE = "19/11";
const AUJOURDHUI = "21/11";              // le jour où la joueuse ouvre l'enveloppe
const JOURS_DEPUIS = 11;                 // d'où le titre du jeu


/* ------------------------------------------------------------
   LES CODES ⚠️ SPOILERS
   ------------------------------------------------------------
   Rappel de la règle d'or (cf. HISTOIRE.md) : aucun code n'est
   devinable sans indice, et aucun code n'est bloquant — Mira
   finit toujours par aider.
   ------------------------------------------------------------ */
const CODE_TELEPHONE = "0307";     // au dos de la photo imprimée : « Bülk, 03.07 »
const CODE_ALBUM_PRIVE = "2104";   // l'heure de la photo qu'elle a mise en favori
const CODE_MOUCHARD = "1908";      // le code de Tobias, vu dans une capture d'écran
const MOT_DU_COFFRE = "KEKS";      // le chat


/* ------------------------------------------------------------
   APPAREIL
   ------------------------------------------------------------
   Référence : iPhone 13/14 en points CSS (390 x 844).
   Sur un vrai téléphone on prend tout l'écran ; sur ordinateur
   on dessine un cadre de cette taille au milieu de la page
   (voir novembre.css, section « Sur ordinateur »).
   ------------------------------------------------------------ */
const LARGEUR_REFERENCE = 390;
const HAUTEUR_REFERENCE = 844;

// Le niveau de batterie affiché. Il baisse très lentement
// pendant la partie (pur décor : ça ne bloque jamais rien).
const BATTERIE_DEPART = 38;
const BATTERIE_MINUTES_PAR_POURCENT = 4;


/* ------------------------------------------------------------
   PALETTE
   ------------------------------------------------------------
   Deux mondes de couleurs :

   1. LE JEU (l'enveloppe, le mot de Mira, le carnet d'enquête)
      reprend l'identité du calendrier : crème, encre, rose, or.
   2. LE TÉLÉPHONE est en mode sombre, parce que c'est un
      téléphone de novembre, à Kiel, et que ses photos sont
      toutes prises de nuit.

   Les valeurs réelles sont dans novembre.css (variables CSS).
   On les redonne ici parce que les peintures SVG en ont besoin
   côté JavaScript.
   ------------------------------------------------------------ */
const COULEURS = {
    // le papier (acte 0)
    creme: "#FBF3EE",
    encre: "#4B3B36",
    encreClaire: "#9C8880",
    accent: "#D9A6A0",
    accentFonce: "#C17F77",
    or: "#C9A876",

    // le téléphone
    nuit: "#0B0E13",
    ardoise: "#161A22",
    ardoiseClaire: "#1F2530",
    separateur: "#2A313D",
    texte: "#F2F4F7",
    texteGris: "#8A93A3",
    bleuIos: "#0A84FF",
    vertIos: "#30D158",
    rougeIos: "#FF453A",
    orangeIos: "#FF9F0A",
    jauneIos: "#FFD60A",
    violetIos: "#BF5AF2",
    roseIos: "#FF6482",

    // le fjord, pour les peintures
    fjordHaut: "#1A2740",
    fjordBas: "#070B12",
    brume: "#8FA3BE",
    lumiereVille: "#F5C87A",
    phare: "#FFE9B0",
};


/* ------------------------------------------------------------
   RYTHME
   ------------------------------------------------------------
   Tout ce qui est "en secondes" dans la mise en scène.
   ------------------------------------------------------------ */
const VITESSE_ECRITURE_LETTRE = 22;      // ms par lettre, pour le mot de Mira
const DUREE_BANNIERE = 5200;             // combien de temps une notification reste
const DELAI_AVANT_REPONSE_MIRA = 1400;   // elle "écrit..." un peu avant de répondre
const DELAI_INDICE_DOUX = 150000;        // 2 min 30 sans rien trouver → Mira relance


/* ------------------------------------------------------------
   SAUVEGARDE
   ------------------------------------------------------------
   Une seule clé localStorage pour tout le jeu.
   Changer la clé = repartir de zéro (pratique en dev).
   ------------------------------------------------------------ */
const CLE_SAUVEGARDE = "onze-jours-sauvegarde-v1";


/* ------------------------------------------------------------
   MODE DÉVELOPPEMENT
   ------------------------------------------------------------
   Mets DEV à true pour :
     - sauter l'enveloppe et le code du téléphone,
     - déverrouiller tous les actes,
     - afficher les codes dans la console.
   À remettre à false avant de montrer le jeu à Klara. 🙂
   On peut aussi activer le mode dev en ajoutant ?dev à l'URL.
   ------------------------------------------------------------ */
let DEV = false;

if (typeof window !== "undefined" && window.location.search.indexOf("dev") !== -1) {
    DEV = true;
}
