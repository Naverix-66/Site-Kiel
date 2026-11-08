/* ============================================================
   LES RÉSEAUX — COMPTES, PUBLICATIONS, VIDÉOS
   ============================================================
   Deux applications (Fjordgram et Kiek) partagent le même
   annuaire de comptes. On peut donc chercher quelqu'un, ouvrir
   son profil, et voir ce qu'il publie — y compris l'ex.

   Le profil de Tobias est volontairement le plus intéressant du
   jeu : trois publications, 38 abonnés, et 412 abonnements. Il
   suit tout le monde autour d'elle, un par un.
   ============================================================ */

const COMPTES = {

    lena: {
        id: "lena",
        pseudo: "lena.b.nacht",
        nom: "Lena Brandt",
        couleur: "#2C5F8A",
        bio: "photographies de nuit · Kiel · argentique\n« personne ne regarde la ville à cette heure-là »",
        abonnes: 412,
        abonnements: 180,
        moi: true,
    },

    tobias: {
        id: "tobias",
        pseudo: "t.reh",
        nom: "Tobias Reh",
        couleur: "#7A5B4A",
        bio: "Schlüsseldienst Reh · Kiel · ouvert 24 h/24\n« une porte, c'est juste une question de temps »",
        abonnes: 38,
        abonnements: 412,
        lui: true,
        indice: "ex_profil",
        // ce qu'il suit : son entourage à elle, un par un
        suit: ["lena", "mira", "jonas", "lisbeth", "labor", "keks", "kielbynight"],
    },

    mira: {
        id: "mira",
        pseudo: "mira.lq",
        nom: "Mira Lindqvist",
        couleur: "#4E6B8A",
        bio: "infirmière de nuit · UKSH\nje dors quand vous travaillez",
        abonnes: 288,
        abonnements: 301,
    },

    jonas: {
        id: "jonas",
        pseudo: "jonas.brandt",
        nom: "Jonas",
        couleur: "#4A6B5A",
        bio: "cuisinier · petit frère officiel",
        abonnes: 196,
        abonnements: 240,
    },

    lisbeth: {
        id: "lisbeth",
        pseudo: "lisbeth.g",
        nom: "Lisbeth",
        couleur: "#6B5A7A",
        bio: "Kiosk 24 · nuits impaires",
        abonnes: 154,
        abonnements: 198,
    },

    keks: {
        id: "keks",
        pseudo: "keks.der.kater",
        nom: "Keks",
        couleur: "#C96A2E",
        bio: "chat roux. 6 kg. aucune ambition.",
        abonnes: 1877,
        abonnements: 1,
    },

    bluey: {
        id: "bluey",
        pseudo: "bluey_kiel",
        nom: "Bluey",
        couleur: "#4C84C4",
        bio: "J'AI VU UN OISEAU GÉANT",
        abonnes: 11,
        abonnements: 6,
    },

    kielbynight: {
        id: "kielbynight",
        pseudo: "kiel.bynight",
        nom: "Kiel by night",
        couleur: "#3A4250",
        bio: "la ville quand il n'y a personne",
        abonnes: 9840,
        abonnements: 12,
    },

    labor: {
        id: "labor",
        pseudo: "labor.nordlicht",
        nom: "Labor Nordlicht",
        couleur: "#5A6B4A",
        bio: "développement argentique · Kiel",
        abonnes: 2104,
        abonnements: 340,
    },

    sicher: {
        id: "sicher",
        pseudo: "sicher.im.netz",
        nom: "Sicher im Netz",
        couleur: "#2E5A6B",
        bio: "vos données, vos règles",
        abonnes: 142000,
        abonnements: 3,
    },

    neu: {
        id: "neu",
        pseudo: "neu.anfangen",
        nom: "Neu anfangen",
        couleur: "#6B4A5A",
        bio: "recommencer ailleurs",
        abonnes: 88400,
        abonnements: 21,
    },
};


function compte(id) {
    return COMPTES[id] || null;
}

function compteParPseudo(pseudo) {
    const trouve = Object.keys(COMPTES).filter(function (id) {
        return COMPTES[id].pseudo === pseudo;
    })[0];
    return trouve ? COMPTES[trouve] : null;
}


/* Ce que Lena suit : tout le monde sauf l'ex (elle l'a retiré). */
const ABONNEMENTS_DE_LENA = ["mira", "jonas", "lisbeth", "keks", "bluey", "kielbynight", "labor"];


/* ============================================================
   FJORDGRAM — les publications
   ============================================================ */

const PUBLICATIONS = [

    /* ---------- elle ---------- */
    {
        id: "f01", auteur: "lena", peinture: "ferry", t: "08/11 22:34",
        lieu: "Hörn, Kiel",
        legende: "dernier bateau",
        jaime: 38,
        commentaires: [
            { de: "mira.lq", txt: "tu rentres quand ?" },
            { de: "t.reh", lui: true, txt: "22h34. tu n'es pas au travail." },
        ],
    },
    {
        id: "f02", auteur: "lena", peinture: "lampadaire_brume", t: "30/10 23:30",
        lieu: "Düsternbrook, Kiel",
        legende: "le seul lampadaire de Kiel qui clignote",
        jaime: 64,
        commentaires: [
            { de: "labor.nordlicht", txt: "celle-là on la veut en 40x40 pour la vitrine" },
            { de: "t.reh", lui: true, txt: "tu as changé d'itinéraire" },
        ],
    },
    {
        id: "f03", auteur: "lena", peinture: "grues", t: "24/10 22:48",
        lieu: "Werft, Kiel",
        legende: "nuit sans personne #3",
        jaime: 51,
        commentaires: [
            { de: "mehmet.k", txt: "👏" },
            { de: "t.reh", lui: true, txt: "tu étais encore dehors à cette heure-là" },
        ],
    },
    {
        id: "f04", auteur: "lena", peinture: "kiosque", t: "02/10 23:14",
        lieu: "Hörn, Kiel",
        legende: "mon bureau",
        jaime: 29,
        commentaires: [
            { de: "lisbeth.g", txt: "la lumière est horrible et pourtant tu la rends belle" },
            { de: "t.reh", lui: true, txt: "jolie veste. elle est nouvelle ?" },
        ],
    },
    {
        id: "f05", auteur: "lena", peinture: "chat_fenetre", t: "12/09 08:02",
        lieu: "Kiel",
        legende: "Keks a décidé que c'était sa place",
        jaime: 112,
        commentaires: [
            { de: "jonas.brandt", txt: "il s'appelle vraiment Keks ?? 😂" },
            { de: "lena.b.nacht", txt: "il est roux et il est mou." },
            { de: "bluey_kiel", txt: "J'AI VU UN OISEAU GÉANT !!!" },
            { de: "t.reh", lui: true, txt: "tu as déplacé le fauteuil" },
        ],
    },
    {
        id: "f06", auteur: "lena", peinture: "deux_filles", t: "15/08 00:40",
        lieu: "Kiel",
        legende: "coloc de nuit. on se croise comme deux ferries.",
        jaime: 97,
        commentaires: [
            { de: "mira.lq", txt: "je te laisse la lampe allumée quand même" },
            { de: "t.reh", lui: true, txt: "vous étiez que toutes les deux ?" },
        ],
    },
    {
        id: "f07", auteur: "lena", peinture: "fjord_juillet", t: "03/07 21:04",
        lieu: "Strande",
        legende: "ici, je respire",
        jaime: 203,
        indice: "post_strande",
        commentaires: [
            { de: "hanne.b", txt: "c'est la maison de ton grand père ma Lena ❤️ la clé tu sais où elle est" },
            { de: "mira.lq", txt: "c'est où ça ???" },
            { de: "lena.b.nacht", txt: "nulle part 🙂" },
            { de: "t.reh", lui: true, txt: "tu y es allée avec qui" },
        ],
    },
    {
        id: "f08", auteur: "lena", peinture: "velo_bleu", t: "12/06 11:20",
        lieu: "Kiel",
        legende: "il a un nom mais je ne le dirai pas",
        jaime: 44,
        commentaires: [
            { de: "jonas.brandt", txt: "c'est Horst. elle l'a appelé Horst." },
            { de: "t.reh", lui: true, txt: "tu es passée devant chez moi à 11h18" },
        ],
    },

    /* ---------- lui ----------
       Trois publications. La deuxième est la plus glaçante :
       le même endroit qu'elle, le même soir, 38 minutes après. */
    {
        id: "t01", auteur: "tobias", peinture: "quai_nuit", t: "14/11 19:02",
        lieu: "Kiel",
        legende: "les gens croient qu'on peut disparaître. on peut pas. si quelqu'un la voit, c'est à MOI qu'on le dit.",
        jaime: 12,
        indice: "ex_cherche_aussi",
        commentaires: [
            { de: "mira.lq", txt: "arrête d'écrire sur elle." },
            { de: "t.reh", lui: true, txt: "tu me parleras autrement quand on l'aura retrouvée." },
            { de: "lisbeth.g", txt: "courage Tobias 🙏" },
        ],
    },
    {
        id: "t02", auteur: "tobias", peinture: "hornbrucke", t: "02/11 22:40",
        lieu: "Hörn, Kiel",
        legende: "intervention à 22h. je passais par là de toute façon.",
        jaime: 4,
        commentaires: [],
    },
    {
        id: "t03", auteur: "tobias", peinture: "porte_bleue", t: "20/09 23:50",
        lieu: "Kiel",
        legende: "une porte, c'est juste une question de temps. 4 minutes celle-là.",
        jaime: 7,
        commentaires: [
            { de: "jonas.brandt", txt: "😂 flippant mec" },
            { de: "t.reh", lui: true, txt: "c'est mon métier 🙂" },
        ],
    },

    /* ---------- les autres ---------- */
    {
        id: "m01", auteur: "mira", peinture: "appartement_nuit", t: "16/11 21:10",
        lieu: "Jägersberg 14",
        legende: "je laisse la lampe allumée. c'est tout ce que je sais faire.",
        jaime: 84,
        commentaires: [
            { de: "jonas.brandt", txt: "❤️" },
            { de: "lisbeth.g", txt: "on est là" },
        ],
    },
    {
        id: "m02", auteur: "mira", peinture: "deux_filles", t: "04/09 02:20",
        lieu: "UKSH",
        legende: "pause de 3h du matin",
        jaime: 41,
        commentaires: [{ de: "lena.b.nacht", txt: "rentre, je te garde de la soupe" }],
    },
    {
        id: "j01", auteur: "jonas", peinture: "kiosque", t: "27/10 13:40",
        lieu: "Pizzeria Montana",
        legende: "ma sœur paie jamais l'addition",
        jaime: 58,
        commentaires: [{ de: "lena.b.nacht", txt: "faux" }],
    },
    {
        id: "l01", auteur: "lisbeth", peinture: "kiosque", t: "09/11 06:40",
        lieu: "Kiosk 24",
        legende: "6h du matin, remplacement de dernière minute. merci pawel.",
        jaime: 22,
        commentaires: [],
    },
    {
        id: "k01", auteur: "kielbynight", peinture: "grues", t: "10/11 01:12",
        lieu: "Werft, Kiel",
        legende: "chantier naval, 1h12",
        jaime: 2410,
        commentaires: [],
    },
    {
        id: "ke01", auteur: "keks", peinture: "chat_fenetre", t: "05/11 09:00",
        lieu: "le fauteuil",
        legende: "mon fauteuil",
        jaime: 311,
        commentaires: [{ de: "jonas.brandt", txt: "roi" }],
    },
];


function publicationsDe(idCompte) {
    return PUBLICATIONS.filter(function (p) { return p.auteur === idCompte; })
        .sort(function (a, b) { return clefDeTri(b.t) - clefDeTri(a.t); });
}


/* Le fil d'actualité : ce que publient les comptes qu'elle suit,
   plus les siens. */
function filDActualite() {
    return PUBLICATIONS.filter(function (p) {
        return p.auteur === "lena" || ABONNEMENTS_DE_LENA.indexOf(p.auteur) !== -1;
    }).sort(function (a, b) { return clefDeTri(b.t) - clefDeTri(a.t); });
}


/* Le compte qui commente tout. On le calcule : si on ajoute une
   publication, le compte reste juste. */
function commentairesDeLui() {
    let total = 0;
    publicationsDe("lena").forEach(function (publication) {
        publication.commentaires.forEach(function (c) {
            if (c.lui) total++;
        });
    });
    return total;
}


/* ============================================================
   LES STORIES
   ============================================================
   Une story par compte. La plupart ne servent à rien pour
   l'enquête, et c'est exprès : c'est un téléphone, pas un
   dossier d'instruction. On regarde la vie des gens.
   ============================================================ */

const STORIES = {
    lena: [
        { peinture: "ferry", texte: "dernier bateau", t: "08/11 22:36", ancienne: true },
        { peinture: "noir_presque", texte: "", t: "08/11 23:47", ancienne: true },
    ],
    mira: [
        { peinture: "appartement_nuit", texte: "jour 13. la lampe est toujours allumée.", t: "21/11 06:40" },
    ],
    jonas: [
        { peinture: "kiosque", texte: "service du midi, 84 couverts, je suis mort", t: "21/11 15:20" },
    ],
    lisbeth: [
        { peinture: "kiosque", texte: "qui a encore fini le café", t: "21/11 04:12" },
    ],
    keks: [
        { peinture: "chat_fenetre", texte: "", t: "20/11 11:00" },
    ],
    kielbynight: [
        { peinture: "grues", texte: "brouillard sur la Förde", t: "21/11 02:30" },
    ],
    labor: [
        { peinture: "lampadaire_brume", texte: "tirages prêts : Brandt, 6 pellicules", t: "19/11 17:00" },
    ],
    bluey: [
        { peinture: "peluches", texte: "L'OISEAU EST REVENU", t: "20/11 03:14" },
    ],
};


function storiesDe(id) {
    return STORIES[id] || [];
}


/* ============================================================
   LES MESSAGES PRIVÉS DE FJORDGRAM
   ============================================================
   Trois fils, très courts. Du décor, et une demande d'un
   compte inconnu qu'elle n'a jamais acceptée.
   ============================================================ */

const DM_FJORDGRAM = [
    {
        compte: "mira",
        messages: [
            { de: "eux", txt: "tu dors ?", t: "06/11 02:40" },
            { de: "eux", txt: "je vois que tu es en ligne", t: "06/11 02:41" },
            { de: "moi", txt: "je regarde des vidéos débiles", t: "06/11 02:44" },
        ],
    },
    {
        compte: "jonas",
        messages: [
            { de: "eux", txt: "regarde ça 😂", t: "28/10 20:10" },
            { de: "moi", txt: "c'est toi en entier", t: "28/10 20:12" },
        ],
    },
    {
        compte: "labor",
        messages: [
            { de: "eux", txt: "tes tirages sont prêts, on ferme à 18h", t: "05/11 11:02" },
        ],
    },
];


/* ============================================================
   KIEK — les vidéos verticales
   ============================================================
   Le TikTok du jeu. (« kiek mal » = « regarde voir », en
   bas-allemand. Pour le renommer : ici, app_kiek.js et
   ICONES_APPS.)

   Ce qu'elle a ENREGISTRÉ compte plus que ce qu'elle a publié.
   Ce que quelqu'un met de côté à 2 h du matin en dit plus long
   que tout le reste.
   ============================================================ */

const VIDEOS = [
    {
        id: "v01", auteur: "sicher",
        peinture: "lampadaire_brume",
        legende: "3 signes que ton téléphone est suivi 👀",
        son: "son original — sicher.im.netz",
        jaime: "84,2 k",
        commentaires: 1203,
        enregistreeLe: "06/11 02:12",
        indice: "video_sauvee",
        sousTitres: [
            "1. la batterie se vide sans raison",
            "2. une appli banale demande ta position « toujours »",
            "3. tu as deux fois la même appli",
        ],
    },
    {
        id: "v02", auteur: "neu",
        peinture: "quai_nuit",
        legende: "partir sans laisser d'adresse — règle n°1 : le téléphone reste",
        son: "son original — neu.anfangen",
        jaime: "212 k",
        commentaires: 4871,
        enregistreeLe: "06/11 03:50",
        indice: "video_partir",
        sousTitres: [
            "un téléphone qui bouge, c'est une adresse",
            "un téléphone qui reste, c'est quelqu'un qui dort chez lui",
        ],
    },
    {
        id: "v03", auteur: "keks",
        peinture: "chat_fenetre",
        legende: "Keks a encore volé le fauteuil 🧡",
        son: "son original — keks.der.kater",
        jaime: "1 877",
        commentaires: 64,
        aimee: true,
        sousTitres: ["il s'appelle Keks", "il ne bouge pas"],
    },
    {
        id: "v04", auteur: "kielbynight",
        peinture: "grues",
        legende: "le chantier naval à 2 h du matin",
        son: "Nordlicht — Ava Nordwind",
        jaime: "12,4 k",
        commentaires: 211,
        aimee: true,
        sousTitres: ["personne", "vraiment personne"],
    },
    {
        id: "v05", auteur: "bluey",
        peinture: "peluches",
        legende: "J'AI VU UN OISEAU GÉANT !!!",
        son: "son original — bluey_kiel",
        jaime: "8",
        commentaires: 11,
        sousTitres: ["PERSONNE NE ME CROIT", "J'AI RAISON DEPUIS LE DÉBUT"],
    },
    {
        id: "v06", auteur: "lena",
        peinture: "ferry",
        legende: "le ferry de 22h40, en 15 secondes",
        son: "son original — lena.b.nacht",
        jaime: "340",
        commentaires: 18,
        sousTitres: ["il passe toujours à la même seconde"],
    },
    {
        id: "v07", auteur: "mira",
        peinture: "appartement_nuit",
        legende: "la lampe reste allumée",
        son: "son original — mira.lq",
        jaime: "96",
        commentaires: 7,
        sousTitres: ["jour 8"],
    },
    {
        id: "v08", auteur: "tobias",
        peinture: "quai_nuit",
        legende: "elle marchait toujours par là",
        son: "son original — t.reh",
        jaime: "3",
        commentaires: 0,
        sousTitres: ["si vous la voyez"],
    },
];


function videosDe(idCompte) {
    return VIDEOS.filter(function (v) { return v.auteur === idCompte; });
}

function videosEnregistrees() {
    return VIDEOS.filter(function (v) { return v.enregistreeLe; });
}

function videosAimees() {
    return VIDEOS.filter(function (v) { return v.aimee; });
}

function videoParId(id) {
    return VIDEOS.filter(function (v) { return v.id === id; })[0] || null;
}
