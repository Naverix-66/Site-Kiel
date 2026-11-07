/* ============================================================
   SAFARI — HISTORIQUE, RECHERCHES, PAGES
   ============================================================
   C'est la partie la plus parlante du téléphone. On ne cherche
   pas « comment savoir si on est suivi » par curiosité.

   L'historique se lit comme un journal intime écrit sans le
   vouloir : les dates comptent autant que les mots.
   ============================================================ */


/* ------------------------------------------------------------
   LES RECHERCHES
   ------------------------------------------------------------ */
const RECHERCHES_WEB = [
    { t: "06/11 02:14", texte: "savoir si mon téléphone est suivi" },
    { t: "06/11 02:20", texte: "application espion icone calculatrice" },
    { t: "06/11 02:38", texte: "familysafe supprimer sans que l'autre le sache" },
    { t: "06/11 02:52", texte: "est-ce qu'il voit si j'éteins mon téléphone" },
    { t: "06/11 03:10", texte: "stalking plainte allemagne" },
    { t: "06/11 03:44", texte: "bus 501 kiel strande horaires nuit" },
    { t: "06/11 04:02", texte: "chauffage gaz camping cabane hiver" },
    { t: "06/11 04:20", texte: "combien de temps un chat peut rester dans une caisse" },
    { t: "01/11 23:40", texte: "avocat droit des victimes kiel" },
    { t: "28/10 13:10", texte: "prix objectif 35mm occasion" },
    { t: "20/10 21:16", texte: "comment savoir qui regarde mon profil fjordgram" },
];


/* ------------------------------------------------------------
   L'HISTORIQUE DE NAVIGATION
   ------------------------------------------------------------
   page : l'identifiant d'une page lisible (PAGES_WEB).
          Sans page, le lien est mort — comme dans un vrai
          historique, on ne peut pas tout rouvrir.
   ------------------------------------------------------------ */
const HISTORIQUE_WEB = [
    { t: "06/11 02:16", titre: "Mon téléphone est-il surveillé ? 9 signes", url: "sicher-im-netz.de/stalkerware", page: "p_stalkerware", indice: "recherches_web" },
    { t: "06/11 02:42", titre: "FamilySafe — gardez un œil sur ce qui compte", url: "familysafe-app.com", page: "p_familysafe" },
    { t: "06/11 03:12", titre: "Nachstellung (§ 238) — vos droits", url: "frauenberatung-kiel.de/stalking", page: "p_droits" },
    { t: "06/11 03:46", titre: "Ligne 501 — Kiel ⇄ Strande", url: "kvg-kiel.de/linie-501", page: "p_bus501", indice: "bus_501" },
    { t: "06/11 04:08", titre: "Leuchtturm Bülk", url: "nordsee-ostsee-wiki.de/buelk", page: "p_phare" },
    { t: "05/11 16:40", titre: "Labor Nordlicht — tarifs développement", url: "labor-nordlicht.de/preise" },
    { t: "02/11 10:20", titre: "Météo Kiel — 10 jours", url: "wetter.de/kiel", page: "p_meteo" },
    { t: "28/10 13:12", titre: "Objectif 35 mm f/2 — annonces", url: "kleinanzeigen.de/s-objektiv" },
    { t: "12/10 22:04", titre: "11-months", url: "naverix-66.github.io/siteKiel", page: "p_calendrier" },
];


/* Les marque-pages. */
const FAVORIS_WEB = [
    { titre: "Labor Nordlicht", url: "labor-nordlicht.de" },
    { titre: "Ligne 501 — Kiel ⇄ Strande", url: "kvg-kiel.de/linie-501", page: "p_bus501" },
    { titre: "Leuchtturm Bülk", url: "nordsee-ostsee-wiki.de/buelk", page: "p_phare" },
    { titre: "11-months", url: "naverix-66.github.io/siteKiel", page: "p_calendrier" },
];


/* ------------------------------------------------------------
   LES PAGES LISIBLES
   ------------------------------------------------------------
   type : "journal" -> fond blanc, mise en page de presse
          sinon      -> page sombre ordinaire

   Blocs : { type: "p" | "h2" | "liste" | "encadre", … }
   ------------------------------------------------------------ */
const PAGES_WEB = {

    p_stalkerware: {
        titre: "Mon téléphone est-il surveillé ?",
        url: "sicher-im-netz.de/stalkerware",
        corps: [
            { type: "p", classe: "chapeau", texte: "Ces logiciels sont vendus légalement comme des outils de « sécurité familiale ». Installés sans consentement, ils sont illégaux — et presque invisibles." },
            { type: "h2", texte: "Les signes" },
            {
                type: "liste", items: [
                    "La batterie se vide sans raison.",
                    "Une application banale demande la localisation « Toujours ».",
                    "Vous avez deux fois la même application.",
                    "Des reçus d'abonnement que vous n'avez pas pris.",
                    "La personne sait des choses qu'elle ne peut pas savoir.",
                ],
            },
            {
                type: "encadre",
                texte: "Ne supprimez rien tout de suite : une application effacée, c'est une preuve effacée — et l'autre personne en est prévenue dans la minute.",
            },
        ],
    },

    p_familysafe: {
        titre: "FamilySafe",
        url: "familysafe-app.com",
        corps: [
            { type: "p", classe: "chapeau", texte: "Gardez un œil sur ce qui compte." },
            {
                type: "liste", items: [
                    "Position en direct, précision 5 m",
                    "Alertes d'arrivée et de départ",
                    "Historique 30 jours",
                    "Icône personnalisable",
                    "Aucune notification sur l'appareil suivi",
                ],
            },
            { type: "p", texte: "4,99 €/mois, sans engagement." },
            { type: "encadre", texte: "L'installation à l'insu d'un tiers est une infraction." },
        ],
    },

    p_droits: {
        titre: "Harcèlement — vos droits",
        url: "frauenberatung-kiel.de/stalking",
        corps: [
            { type: "p", classe: "chapeau", texte: "Centre d'accompagnement de Kiel. Tous les jours, 9 h – 20 h." },
            { type: "p", texte: "Surveiller les déplacements de quelqu'un par un moyen technique est punissable, même sans aucune violence." },
            { type: "h2", texte: "Ce qui fait preuve" },
            {
                type: "liste", items: [
                    "Les captures d'écran datées",
                    "Le logiciel installé — et surtout la facture",
                    "Les relevés d'appels",
                ],
            },
            { type: "encadre", texte: "Une procédure est longue. Votre sécurité passe avant le dossier." },
        ],
    },

    p_bus501: {
        titre: "Ligne 501 — Kiel ⇄ Strande",
        url: "kvg-kiel.de/linie-501",
        corps: [
            {
                type: "liste", items: [
                    "Kiel Hbf → Strande, toutes les heures jusqu'à 20 h 42",
                    "Nuit (ven. et sam.) : 23 h 40 et 1 h 10",
                    "38 min — arrêt « Strande, Bülker Weg »",
                    "De l'arrêt au phare de Bülk : 2,4 km à pied",
                ],
            },
            { type: "p", texte: "Vélos acceptés, 1,80 €." },
        ],
    },

    p_phare: {
        titre: "Leuchtturm Bülk",
        url: "nordsee-ostsee-wiki.de/buelk",
        corps: [
            { type: "p", classe: "chapeau", texte: "Bülk, commune de Strande." },
            { type: "p", texte: "Le phare marque l'entrée du fjord de Kiel. C'est le plus ancien de la Förde." },
            { type: "p", texte: "Derrière le phare subsistent trois anciennes cabanes de pêcheurs, privées, sans eau courante." },
            { type: "encadre", texte: "En hiver, le hameau est souvent coupé par les tempêtes. Il n'y a personne." },
        ],
    },

    p_meteo: {
        titre: "Météo Kiel",
        url: "wetter.de/kiel",
        corps: [
            {
                type: "liste", items: [
                    "Ven. 8 : brouillard dense, 4 °C, visibilité 200 m",
                    "Sam. 9 : brouillard le matin, 3 °C",
                    "Dim. 10 : pluie, 6 °C",
                ],
            },
        ],
    },

    /* easter egg */
    p_calendrier: {
        titre: "11-months",
        url: "naverix-66.github.io/siteKiel",
        corps: [
            { type: "p", classe: "chapeau", texte: "Voici le calendrier de cette longue année :" },
            { type: "p", texte: "Clique sur un mois pour jouer." },
            { type: "encadre", texte: "Onze mois, onze jeux. Celui-ci est le troisième." },
        ],
    },
};


function pageWeb(id) {
    return PAGES_WEB[id] || null;
}
