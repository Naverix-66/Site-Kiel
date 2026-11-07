/* ============================================================
   LE RÉPERTOIRE
   ============================================================
   Un contact sert partout : Messages, Téléphone, Mail, le
   carnet. On le définit une fois ici.

   couleur : la pastille d'avatar. On garde des couleurs
             sourdes : c'est un téléphone de novembre.
   ============================================================ */

const CONTACTS = {

    /* La propriétaire du téléphone. « moi », dans toutes les
       conversations : les bulles bleues, à droite, c'est elle. */
    lena: {
        nom: "Lena",
        nomComplet: "Lena Brandt",
        numero: "+49 176 5540 1193",
        couleur: "#2C5F8A",
        role: "la propriétaire du téléphone",
    },

    mira: {
        nom: "Mira",
        nomComplet: "Mira Lindqvist",
        numero: "+49 176 2208 4471",
        couleur: "#4E6B8A",
        role: "colocataire",
        details: "UKSH — service de nuit",
    },

    /* La joueuse. Au départ le téléphone ne connaît pas ce
       numéro : il affiche « Numéro inconnu ». Mira l'enregistre
       sous son prénom au cours de l'acte I. */
    klara: {
        nom: "Numéro inconnu",
        nomComplet: "Numéro inconnu",
        numero: NUMERO_JOUEUSE,
        couleur: "#5A5A66",
        role: "moi",
    },

    tobias: {
        nom: "Tobias",
        nomComplet: "Tobias Reh",
        numero: "+49 171 9908 2244",
        couleur: "#7A5B4A",
        role: "ex",
    },

    jonas: {
        nom: "Jonas",
        nomComplet: "Jonas Brandt",
        numero: "+49 160 4471 8820",
        couleur: "#4A6B5A",
        role: "frère",
    },

    hanne: {
        nom: "Oma",
        nomComplet: "Hanne Brandt",
        numero: "+49 4351 772 318",
        couleur: "#8A6B5A",
        role: "grand-mère",
        details: "Eckernförde",
    },

    lisbeth: {
        nom: "Lisbeth (kiosk)",
        nomComplet: "Lisbeth Groth",
        numero: "+49 152 3390 1174",
        couleur: "#6B5A7A",
        role: "collègue",
    },

    vogt: {
        nom: "Me Vogt",
        nomComplet: "Cabinet Vogt & Partner",
        numero: "+49 431 220 9140",
        couleur: "#3E4A5A",
        role: "avocate",
    },

    /* Easter egg : le fil de peluches d'octobre. */
    bob: {
        nom: "Bob",
        nomComplet: "Bob",
        numero: "+49 000 000 0008",
        couleur: "#4C84C4",
        role: "???",
    },

    /* Acte IV : le compte sans nom. */
    nebel: {
        nom: "—",
        nomComplet: "—",
        numero: "inconnu",
        couleur: "#2A313D",
        role: "???",
    },
};


/* Le nom à afficher pour un contact : certains changent de nom
   au cours du jeu (le numéro de la joueuse, par exemple). */
function nomContact(id) {
    if (id === "klara" && ETAT.numeroEnregistre) return JOUEUSE;
    const contact = CONTACTS[id];
    return contact ? contact.nom : id;
}
