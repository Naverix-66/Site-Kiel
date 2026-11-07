/* ============================================================
   PLANS — LA CARTE DU FJORD
   ============================================================
   La carte sert à deux choses :
     1. situer les lieux de l'enquête (le port, l'appartement) ;
     2. porter le geste de l'acte III : poser une épingle à
        l'endroit où on pense qu'elle est.

   Aucune épingle fausse n'est punie. À chaque mauvais endroit,
   Mira explique POURQUOI ça ne tient pas — et une réfutation
   fait avancer autant qu'une bonne réponse.

   Les positions sont en pourcentage du cadre de la carte :
   x de 0 (gauche) à 100, y de 0 (haut) à 100.
   ============================================================ */

const LIEUX = [

    {
        id: "domicile",
        nom: "Jägersberg 14",
        sousTitre: "Chez elle et Mira",
        x: 54, y: 76,
        enregistre: true,
    },
    {
        id: "hoern",
        nom: "Hörn",
        sousTitre: "Le port, le kiosk, la passerelle",
        x: 49, y: 82,
        enregistre: true,
    },
    {
        id: "gaarden",
        nom: "Gaarden",
        sousTitre: "Chez Jonas",
        x: 62, y: 79,
        enregistre: true,
        choisissable: true,
        refus: "Jonas t'aurait vendue sans le vouloir en deux jours — et c'est elle qui l'a écrit : « c'est le premier endroit où ils iront ». " +
            "En plus, Tobias avait une alerte sur cette adresse.",
    },
    {
        id: "falckenstein",
        nom: "Falckenstein",
        sousTitre: "La plage, le camping",
        x: 40, y: 48,
        choisissable: true,
        refus: "La plage, en novembre ? Il n'y a pas un toit sur six kilomètres. Et le camping ferme le 15 octobre.",
    },
    {
        id: "schilksee",
        nom: "Schilksee",
        sousTitre: "Le port olympique",
        x: 34, y: 38,
        choisissable: true,
        refus: "Trop de monde, trop de caméras, et un gardien de port qui connaît tout le monde. Elle cherchait le contraire de ça.",
    },
    {
        id: "laboe",
        nom: "Laboe",
        sousTitre: "L'autre rive",
        x: 69, y: 40,
        choisissable: true,
        refus: "L'autre rive, ça veut dire le ferry ou 40 km par la route. Avec un vélo, un chat et une caisse de transport : non.",
    },
    {
        id: "eckernforde",
        nom: "Eckernförde",
        sousTitre: "La maison de sa grand-mère",
        x: 9, y: 14,
        choisissable: true,
        pisteDeMira: true,
        refus: "C'est la piste de Mira, et elle est fausse : la maison est vendue depuis le mois de mai. Hanne elle-même l'écrit. " +
            "Mais relis ce mail jusqu'au bout : il y parle d'autre chose qu'elle n'a pas vendu.",
    },
    {
        id: "bulk",
        nom: "Bülk",
        sousTitre: "Le phare, et trois cabanes derrière",
        x: 27, y: 22,
        choisissable: true,
        bonne: true,
    },
];


function lieuParId(id) {
    return LIEUX.filter(function (l) { return l.id === id; })[0] || null;
}


/* ------------------------------------------------------------
   LE DESSIN DE LA CARTE
   ------------------------------------------------------------
   Le fjord de Kiel, de mémoire : une entrée au nord-ouest
   (Strande / Laboe), un étranglement au milieu, et la ville au
   fond, au sud. Ce n'est pas une carte exacte, c'est une carte
   lisible — comme celle qu'on dessine sur une nappe.
   ------------------------------------------------------------ */
function dessinerCarte() {
    return '<svg viewBox="0 0 300 500" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" ' +
        'xmlns="http://www.w3.org/2000/svg">' +

        /* la terre */
        '<rect width="300" height="500" fill="#101A16"/>' +
        '<rect width="300" height="500" fill="#13211C"/>' +

        /* la mer : la Baltique en haut, le fjord qui descend */
        '<path d="M0 0 L300 0 L300 150 ' +
        'C250 160 210 190 196 240 ' +
        'C184 286 190 330 176 372 ' +
        'C166 404 150 420 150 450 ' +
        'L150 500 L120 500 L120 450 ' +
        'C120 418 136 396 146 366 ' +
        'C158 330 150 286 162 238 ' +
        'C176 182 210 140 262 124 ' +
        'C210 112 150 104 96 96 ' +
        'C48 88 18 60 0 30 Z" fill="#17304A"/>' +

        /* le fond du fjord, la ville */
        '<path d="M96 440 L186 440 L186 500 L96 500 Z" fill="#17304A" opacity="0.9"/>' +

        /* les bancs de sable / hauts-fonds */
        '<path d="M150 150 C190 170 215 200 220 240" stroke="#1E3C5A" stroke-width="7" fill="none" opacity="0.6"/>' +

        /* la ville de Kiel : une trame de rues */
        '<g stroke="#1B2B24" stroke-width="2" opacity="0.9">' +
        '<path d="M60 430 L240 430 M60 455 L240 455 M60 480 L240 480"/>' +
        '<path d="M80 410 L80 500 M110 410 L110 500 M200 410 L200 500 M230 410 L230 500"/>' +
        "</g>" +

        /* les villages, en petits pâtés */
        '<g fill="#1C2E26">' +
        '<rect x="54" y="92" width="26" height="18" rx="3"/>' +      /* Strande */
        '<rect x="84" y="176" width="22" height="14" rx="3"/>' +     /* Schilksee */
        '<rect x="96" y="226" width="20" height="13" rx="3"/>' +     /* Falckenstein */
        '<rect x="214" y="186" width="28" height="18" rx="3"/>' +    /* Laboe */
        '<rect x="14" y="56" width="24" height="16" rx="3"/>' +      /* Eckernförde */
        "</g>" +

        /* le phare de Bülk : un petit trait blanc et son éclat */
        '<g><circle cx="66" cy="104" r="14" fill="#FFE9B0" opacity="0.14"/>' +
        '<rect x="64" y="96" width="4" height="12" fill="#F4F1EA"/>' +
        '<circle cx="66" cy="95" r="2.4" fill="#FFE9B0"/></g>' +

        /* le nom de la mer, en typographie de carte */
        '<text x="236" y="40" font-family="-apple-system, sans-serif" font-size="11" fill="#3E6A94" ' +
        'text-anchor="middle" letter-spacing="2" opacity="0.9">OSTSEE</text>' +
        '<text x="150" y="330" font-family="-apple-system, sans-serif" font-size="10" fill="#3E6A94" ' +
        'text-anchor="middle" letter-spacing="2" opacity="0.8" transform="rotate(-78 150 330)">KIELER FÖRDE</text>' +

        "</svg>";
}
