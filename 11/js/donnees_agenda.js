/* ============================================================
   L'AGENDA
   ============================================================
   Un agenda ne ment jamais : personne ne pense à se créer un
   faux emploi du temps. C'est pour ça que la première faille
   de l'histoire est ici — le 8 novembre, elle était en repos.

   Les mois consultables vont de juillet à décembre : le 3
   juillet porte une seule lettre, et c'est l'indice le plus
   discret du jeu.
   ============================================================ */

const EVENEMENTS = [

    /* ---------- juillet ---------- */
    {
        t: "03/07", titre: "B.", toutLeJour: true, couleur: "or",
        note: "Une seule lettre. Pas d'heure, pas de lieu, pas d'invité.",
    },

    /* ---------- septembre ---------- */
    { t: "12/09 09:30", titre: "Vétérinaire — Keks", couleur: "vert" },

    /* ---------- octobre ---------- */
    { t: "02/10 18:00", titre: "Service — Kiosk 24", duree: "18:00 → 00:00" },
    { t: "11/10 18:00", titre: "Service — Kiosk 24", duree: "18:00 → 00:00" },
    { t: "20/10 19:00", titre: "Oma — appeler", couleur: "orange" },
    { t: "26/10 19:30", titre: "Jonas — Pizzeria Montana" },
    { t: "28/10 14:00", titre: "Kiel Hbf — remise objectif", couleur: "orange" },

    /* ---------- novembre ---------- */
    { t: "02/11 18:00", titre: "Service — Kiosk 24", duree: "18:00 → 00:00" },
    {
        t: "04/11 11:00", titre: "Me Vogt", duree: "11:00 → 12:00",
        couleur: "rouge",
        note: "Aucun intitulé, aucune adresse. Juste un nom.",
        indice: "rdv_avocate",
    },
    { t: "05/11 18:00", titre: "Service — Kiosk 24", duree: "18:00 → 00:00" },
    { t: "05/11 16:00", titre: "Labo — récupérer les tirages" },
    {
        t: "08/11", titre: "Repos", toutLeJour: true, couleur: "vert",
        note: "Elle n'avait pas de service ce soir-là.",
        indice: "agenda_repos",
    },
    { t: "11/11 11:00", titre: "Me Vogt — dépôt du dossier", duree: "11:00 → 12:00", couleur: "rouge" },
    { t: "14/11 18:00", titre: "Service — Kiosk 24", duree: "18:00 → 00:00" },
    { t: "21/11 20:00", titre: "Anniversaire Mehmet — La Pumpe" },

    /* ---------- décembre ---------- */
    { t: "24/12", titre: "Noël — chez maman ?", toutLeJour: true, couleur: "orange" },
];


const COULEURS_EVENEMENT = {
    bleu: "#0A84FF",
    vert: "#30D158",
    rouge: "#FF453A",
    orange: "#FF9F0A",
    or: "#C9A876",
};


/* Les mois qu'on peut feuilleter, dans l'ordre. */
const MOIS_CONSULTABLES = [7, 8, 9, 10, 11, 12];


function evenementsDuMois(mois) {
    return EVENEMENTS.filter(function (e) {
        return decouperDate(e.t).mois === mois;
    }).sort(function (a, b) { return clefDeTri(a.t) - clefDeTri(b.t); });
}


function evenementsDuJour(jour, mois) {
    return EVENEMENTS.filter(function (e) {
        const d = decouperDate(e.t);
        return d.jour === jour && d.mois === mois;
    });
}


/* Le nombre de jours d'un mois (année non bissextile : on n'a
   pas besoin de plus pour un agenda de six mois). */
function joursDuMois(mois) {
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mois - 1];
}


/* Le jour de la semaine du 1er du mois, pour aligner la grille.
   0 = lundi. Valeurs figées : l'agenda est un décor, pas un
   calendrier réel — mais il doit être cohérent d'un mois à
   l'autre, donc on les calcule à partir d'un point de départ.
   Ici : le 1er juillet tombe un mercredi (= 2). */
function premierJourDuMois(mois) {
    let decalage = 2;                      // juillet
    for (let m = 7; m < mois; m++) {
        decalage = (decalage + joursDuMois(m)) % 7;
    }
    return decalage;
}
