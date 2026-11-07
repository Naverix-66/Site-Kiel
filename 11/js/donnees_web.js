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
            { type: "p", classe: "chapeau", texte: "Les logiciels de surveillance grand public sont vendus légalement comme des outils de « sécurité familiale ». Installés sans consentement, ils sont illégaux — et quasiment invisibles." },
            { type: "h2", texte: "Les neuf signes" },
            {
                type: "liste", items: [
                    "La batterie se vide plus vite qu'avant, sans raison.",
                    "Le téléphone est tiède alors que vous ne l'utilisez pas.",
                    "Une application anodine (calculatrice, bloc-notes, lampe torche) demande la localisation « Toujours ».",
                    "Vous avez deux fois la même application.",
                    "L'icône de localisation apparaît alors que vous ne faites rien.",
                    "Des reçus d'abonnement que vous n'avez jamais souscrit.",
                    "Une règle de messagerie que vous n'avez pas créée.",
                    "La personne sait des choses qu'elle ne peut pas savoir.",
                    "Elle dit que vous êtes paranoïaque.",
                ],
            },
            {
                type: "encadre",
                texte: "Avant de supprimer quoi que ce soit : faites des captures d'écran. " +
                    "Une application effacée, c'est une preuve effacée. Et la personne qui vous surveille sait, dans la minute, que vous l'avez supprimée.",
            },
            { type: "h2", texte: "Ce qu'il ne faut pas faire" },
            { type: "p", texte: "Ne confrontez pas. Ne prévenez pas. Documentez, puis faites-vous accompagner." },
        ],
    },

    p_familysafe: {
        titre: "FamilySafe",
        url: "familysafe-app.com",
        corps: [
            { type: "p", classe: "chapeau", texte: "Gardez un œil sur ce qui compte." },
            { type: "h2", texte: "Parce qu'aimer, c'est savoir" },
            { type: "p", texte: "Recevez une alerte dès qu'un proche arrive quelque part, ou en repart. Définissez vos zones. Consultez l'historique des trente derniers jours, minute par minute." },
            {
                type: "liste", items: [
                    "Position en direct, précision 5 m",
                    "Alertes d'arrivée et de départ",
                    "Historique 30 jours",
                    "Icône personnalisable (discrétion)",
                    "Fonctionne en arrière-plan, sans notification sur l'appareil suivi",
                ],
            },
            { type: "p", texte: "4,99 €/mois. Sans engagement." },
            {
                type: "encadre",
                texte: "L'utilisation de FamilySafe requiert le consentement explicite de la personne localisée. " +
                    "Toute installation à l'insu d'un tiers est une infraction dans la plupart des pays.",
            },
        ],
    },

    p_droits: {
        titre: "Nachstellung (§ 238) — vos droits",
        url: "frauenberatung-kiel.de/stalking",
        corps: [
            { type: "p", classe: "chapeau", texte: "Centre d'accompagnement de Kiel — permanence téléphonique tous les jours, 9 h – 20 h." },
            { type: "h2", texte: "Ce que dit la loi" },
            { type: "p", texte: "Suivre quelqu'un, le contacter de manière répétée contre sa volonté, ou surveiller ses déplacements par un moyen technique est punissable, même sans aucune violence physique." },
            { type: "h2", texte: "Ce qui constitue une preuve" },
            {
                type: "liste", items: [
                    "Les captures d'écran datées",
                    "Les relevés d'appels",
                    "Un logiciel de localisation installé sur votre appareil, et surtout : la facture correspondante",
                    "Les témoignages de votre entourage",
                ],
            },
            {
                type: "encadre",
                texte: "Une procédure est longue. Elle n'empêche pas, à elle seule, l'autre personne de savoir où vous dormez. " +
                    "Votre sécurité immédiate passe avant le dossier.",
            },
        ],
    },

    p_bus501: {
        titre: "Ligne 501 — Kiel ⇄ Strande",
        url: "kvg-kiel.de/linie-501",
        corps: [
            { type: "h2", texte: "Horaires — du lundi au vendredi" },
            {
                type: "liste", items: [
                    "Kiel Hbf → Strande : 5 h 42, 6 h 42, puis toutes les heures jusqu'à 20 h 42",
                    "Service de nuit (vendredi, samedi) : 23 h 40, 1 h 10",
                    "Durée du trajet : 38 min — arrêt « Strande, Bülker Weg »",
                    "Du dernier arrêt au phare de Bülk : 2,4 km à pied, chemin côtier",
                ],
            },
            { type: "p", texte: "Les vélos sont acceptés hors heures de pointe (1,80 €)." },
        ],
    },

    p_phare: {
        titre: "Leuchtturm Bülk",
        url: "nordsee-ostsee-wiki.de/buelk",
        corps: [
            { type: "p", classe: "chapeau", texte: "Bülk, commune de Strande, Schleswig-Holstein." },
            { type: "p", texte: "Le phare de Bülk marque l'entrée du fjord de Kiel. Le premier feu date de 1807 : c'est le plus ancien de la Förde. La tour actuelle, haute de 25 m, est blanche à bandeau rouge." },
            { type: "h2", texte: "Le hameau" },
            { type: "p", texte: "Derrière le phare subsistent trois anciennes cabanes de pêcheurs, aujourd'hui privées. Elles ne sont pas raccordées au réseau d'eau courante et ne sont pas habitables à l'année." },
            { type: "p", texte: "Le sentier côtier relie Bülk à Falckenstein (6 km) et à Schilksee (3 km). En hiver, le hameau est régulièrement coupé par les submersions de tempête et le chemin n'est pas déneigé." },
            {
                type: "encadre",
                texte: "Le feu émet un éclat blanc toutes les 3 secondes, visible à 15 milles nautiques. " +
                    "Par temps de brume, la corne de brume fonctionne en continu.",
            },
        ],
    },

    p_meteo: {
        titre: "Météo Kiel — 10 jours",
        url: "wetter.de/kiel",
        corps: [
            { type: "h2", texte: "Semaine du 8 novembre" },
            {
                type: "liste", items: [
                    "Vendredi 8 : brouillard dense, 4 °C, visibilité 200 m, vent nul",
                    "Samedi 9 : brouillard le matin, 3 °C",
                    "Dimanche 10 : pluie, 6 °C, vent de sud-ouest 40 km/h",
                ],
            },
            { type: "p", texte: "Avertissement : brouillard sur la Förde jusqu'à dimanche matin. Les liaisons maritimes peuvent être interrompues." },
        ],
    },

    /* easter egg */
    p_calendrier: {
        titre: "11-months",
        url: "naverix-66.github.io/siteKiel",
        corps: [
            { type: "p", classe: "chapeau", texte: "Voici le calendrier de cette longue année :" },
            { type: "p", texte: "Clique sur un mois pour jouer ! Et patiente le mois prochain pour découvrir un nouveau jeu." },
            {
                type: "liste", items: [
                    "Septembre — débloqué",
                    "Octobre — débloqué",
                    "Novembre — débloqué",
                    "Décembre — pas encore",
                ],
            },
            { type: "encadre", texte: "Onze mois, onze jeux. Celui-ci est le troisième." },
        ],
    },
};


function pageWeb(id) {
    return PAGES_WEB[id] || null;
}
