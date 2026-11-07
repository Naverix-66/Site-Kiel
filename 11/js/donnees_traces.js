/* ============================================================
   LES TRACES INVOLONTAIRES
   ============================================================
   Tout ce qu'un téléphone enregistre sans qu'on le lui demande :
   les pas, les wifi, les déverrouillages, la batterie. Personne
   ne pense à effacer ça. C'est pour cette raison que c'est la
   partie la plus fiable de l'enquête — et la plus facile à
   oublier quand on efface ses messages à 1 h 20 du matin.
   ============================================================ */


/* ------------------------------------------------------------
   SANTÉ — les pas, heure par heure
   ------------------------------------------------------------
   24 valeurs par jour, de 0 h à 23 h.
   ------------------------------------------------------------ */
const SANTE_JOURS = [
    {
        t: "06/11", total: 8421,
        heures: [0, 0, 0, 0, 0, 0, 0, 120, 840, 1210, 420, 310, 680, 540, 220, 180, 960, 1140, 420, 380, 210, 120, 60, 0],
    },
    {
        t: "07/11", total: 6210,
        heures: [0, 0, 0, 0, 0, 0, 0, 0, 640, 980, 310, 240, 520, 480, 180, 140, 720, 880, 360, 300, 180, 60, 40, 0],
    },
    {
        t: "08/11", total: 12834, nuit: true,
        heures: [0, 0, 0, 0, 0, 0, 0, 0, 210, 640, 380, 290, 1180, 760, 420, 380, 540, 980, 1260, 820, 460, 1090, 1826, 1246],
        remarque: "Sortie à 19 h 12. Rentrée à 1 h 14.",
    },
    {
        t: "09/11", total: 3178,
        heures: [2208, 758, 0, 0, 0, 142, 70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        remarque: "Plus un pas après 5 h 36.",
        indice: "sante_pas",
    },
    {
        t: "10/11", total: 0,
        heures: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        remarque: "Aucune donnée. Le téléphone ne bouge plus.",
    },
    {
        t: "11/11", total: 0,
        heures: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
];

/* Le détail que le graphique ne montre pas, et qui est l'indice :
   4 212 pas entre 23 h 51 et 1 h 08, d'un seul tenant. */
const SANTE_DETAIL_NUIT = {
    titre: "Marche — 8 novembre, 23 h 51 → 9 novembre, 1 h 08",
    pas: 4212,
    distance: "3,1 km",
    duree: "1 h 17 min",
    rythme: "Marche soutenue, sans arrêt de plus de 2 minutes.",
};


/* ------------------------------------------------------------
   RÉGLAGES — WI-FI
   ------------------------------------------------------------ */
const RESEAUX_WIFI = [
    {
        nom: "Brandt_Lindqvist", actuel: true,
        detail: "Connecté le 09/11 à 01:14",
        indice: "wifi_retour",
        note: "Déconnecté le 08/11 à 19:12. Reconnecté le 09/11 à 01:14. Puis plus aucune interruption.",
    },
    { nom: "Kiosk24_Gast", detail: "08/11, 21:12" },
    { nom: "UKSH-Besucher", detail: "02/11, 14:40" },
    {
        nom: "Camping_Strande_Gast", detail: "03/07, 20:48",
        note: "Un seul usage, le 3 juillet. À 11 km de Kiel.",
    },
    { nom: "Labor_Nordlicht", detail: "05/11, 16:20" },
    { nom: "Telekom_FON", detail: "28/10, 14:12" },
];


/* ------------------------------------------------------------
   RÉGLAGES — TEMPS D'ÉCRAN ET BATTERIE
   ------------------------------------------------------------ */
const TEMPS_ECRAN = {
    dernierDeverrouillage: "09/11 05:36",
    indice: "ecran_eteint",
    jours: [
        { t: "06/11", duree: "5 h 12", deverrouillages: 118 },
        { t: "07/11", duree: "3 h 48", deverrouillages: 92 },
        { t: "08/11", duree: "4 h 12", deverrouillages: 141 },
        { t: "09/11", duree: "0 h 22", deverrouillages: 6 },
        { t: "10/11", duree: "—", deverrouillages: 0 },
        { t: "11/11", duree: "—", deverrouillages: 0 },
    ],
    remarque: "Six déverrouillages le 9 novembre, tous entre 1 h 14 et 5 h 36. Puis rien.",
};

const BATTERIE_HISTORIQUE = {
    derniereCharge: "08/11 18:40",
    extinction: "12/11 06:02",
    remarque: "Le téléphone s'est éteint tout seul, batterie vide, le 12 novembre à 6 h 02. " +
        "Il est resté allumé et immobile pendant trois jours.",
};


/* ------------------------------------------------------------
   RÉGLAGES — LOCALISATION
   ------------------------------------------------------------
   La ligne qui ne devrait pas être là. Une calculatrice n'a
   aucune raison de connaître une position, et encore moins
   « toujours ».
   ------------------------------------------------------------ */
const AUTORISATIONS_LOCALISATION = [
    { nom: "Plans", valeur: "Pendant l'utilisation" },
    { nom: "Appareil photo", valeur: "Pendant l'utilisation" },
    { nom: "Fjordgram", valeur: "Jamais" },
    { nom: "Météo", valeur: "Pendant l'utilisation" },
    {
        nom: "Calculette", valeur: "Toujours", alerte: true,
        fleche: true,
        note: "Position relevée il y a 3 minutes.",
        indice: "deux_calculettes",
    },
    { nom: "Safari", valeur: "Demander" },
];


/* ------------------------------------------------------------
   RÉGLAGES — RÈGLES DE MESSAGERIE
   ------------------------------------------------------------
   Une règle, créée en avril, depuis un ordinateur. Elle n'a
   jamais vu un seul reçu.
   ------------------------------------------------------------ */
const REGLES_MAIL = [
    {
        nom: "(sans nom)",
        creee: "12/04 21:52",
        depuis: "Navigateur — Kiel, DE",
        condition: "Si l'expéditeur contient « familysafe »",
        action: "Déplacer vers la Corbeille et marquer comme lu",
        indice: "regle_mail",
    },
    {
        nom: "Newsletters",
        creee: "03/02 10:14",
        depuis: "iPhone de Lena",
        condition: "Si l'objet contient « newsletter »",
        action: "Déplacer vers Promotions",
    },
];


/* ============================================================
   LE JOURNAL DU MOUCHARD
   ============================================================
   47 jours d'abonnement, mais seulement 30 jours d'historique
   conservé. C'est très important pour l'histoire : le 3 juillet
   n'y est PAS. Il ne sait rien de Bülk.
   ============================================================ */

const MOUCHARD = {
    nomAffiche: "Calculette",
    nomReel: "FamilySafe Premium",
    installe: "12/04 21:48",
    appareilAdmin: "iPhone de Tobias",
    retention: "30 jours",
    alertes: [
        "Arrivée / départ — Domicile",
        "Arrivée / départ — Kiosk 24",
        "Zone personnalisée — « chez Jonas »",
        "Déplacement de plus de 2 km après 22 h",
    ],
};

/* La nuit du 8, telle que la voyait Tobias. */
const JOURNAL_POSITIONS = [
    { t: "08/11 19:12", lieu: "Domicile — départ", alerte: true },
    { t: "08/11 19:40", lieu: "Holtenauer Straße" },
    { t: "08/11 20:30", lieu: "Hörn — quai est" },
    { t: "08/11 21:12", lieu: "Kiosk 24" },
    { t: "08/11 22:10", lieu: "Hörnbrücke", souligne: true },
    { t: "08/11 22:48", lieu: "Hörnbrücke — immobile 12 min" },
    { t: "08/11 23:20", lieu: "Bootshafen" },
    { t: "08/11 23:51", lieu: "Kiellinie — en mouvement" },
    { t: "09/11 00:40", lieu: "Düsternbrook — en mouvement" },
    { t: "09/11 01:14", lieu: "Domicile — arrivée", alerte: true, souligne: true },
    { t: "09/11 05:36", lieu: "Domicile" },
    { t: "09/11 12:00", lieu: "Domicile" },
    { t: "10/11 00:00", lieu: "Domicile" },
    { t: "10/11 12:00", lieu: "Domicile" },
    { t: "11/11 00:00", lieu: "Domicile" },
    { t: "11/11 12:00", lieu: "Domicile" },
    { t: "12/11 00:00", lieu: "Domicile" },
    { t: "12/11 06:02", lieu: "Signal perdu — batterie" },
];
