/* ============================================================
   FJORDGRAM
   ============================================================
   Un réseau social, c'est une archive publique de l'endroit où
   on était. Et une archive de ceux qui regardent.

   Le vrai indice de cette application n'est pas dans une
   publication : il est dans le fait que le MÊME compte
   commente les onze, toujours dans la minute, toujours sur
   le lieu ou l'heure. On ne le remarque qu'en faisant défiler.
   ============================================================ */

const PROFIL_FJORDGRAM = {
    pseudo: "lena.b.nacht",
    nom: "Lena Brandt",
    bio: "photographies de nuit · Kiel · argentique uniquement\n« personne ne regarde la ville à cette heure-là »",
    publications: 11,
    abonnes: 412,
    abonnements: 180,
};


const PUBLICATIONS = [

    {
        id: "f01", peinture: "ferry", t: "08/11 22:34",
        lieu: "Hörn, Kiel",
        legende: "dernier bateau",
        jaime: 38,
        commentaires: [
            { de: "mira.lq", txt: "tu rentres quand ?" },
            { de: "t.reh", lui: true, txt: "22h34. tu n'es pas au travail." },
        ],
    },

    {
        id: "f02", peinture: "lampadaire_brume", t: "30/10 23:30",
        lieu: "Düsternbrook, Kiel",
        legende: "le seul lampadaire de Kiel qui clignote. je l'attends depuis trois semaines.",
        jaime: 64,
        commentaires: [
            { de: "labor.nordlicht", txt: "celle-là on la veut en 40x40 pour la vitrine" },
            { de: "t.reh", lui: true, txt: "tu as changé d'itinéraire" },
        ],
    },

    {
        id: "f03", peinture: "grues", t: "24/10 22:48",
        lieu: "Werft, Kiel",
        legende: "nuit sans personne #3",
        jaime: 51,
        commentaires: [
            { de: "mehmet.k", txt: "👏👏" },
            { de: "t.reh", lui: true, txt: "tu étais encore dehors à cette heure-là" },
        ],
    },

    {
        id: "f04", peinture: "kiosque", t: "02/10 23:14",
        lieu: "Hörn, Kiel",
        legende: "mon bureau",
        jaime: 29,
        commentaires: [
            { de: "lisbeth.g", txt: "la lumière est horrible et pourtant tu la rends belle" },
            { de: "t.reh", lui: true, txt: "jolie veste. elle est nouvelle ?" },
        ],
    },

    {
        id: "f05", peinture: "chat_fenetre", t: "12/09 08:02",
        lieu: "Kiel",
        legende: "Keks a décidé que c'était sa place. le débat est clos.",
        jaime: 112,
        commentaires: [
            { de: "jonas.brandt", txt: "il s'appelle vraiment Keks ?? 😂" },
            { de: "lena.b.nacht", txt: "il est roux et il est mou. c'était ça ou Zwieback." },
            { de: "bluey_kiel", txt: "J'AI VU UN OISEAU GÉANT !!!" },
            { de: "t.reh", lui: true, txt: "tu as déplacé le fauteuil" },
        ],
    },

    {
        id: "f06", peinture: "deux_filles", t: "15/08 00:40",
        lieu: "Kiel",
        legende: "coloc de nuit. elle rentre à 6h, je pars à 22h, on se croise comme deux ferries.",
        jaime: 97,
        commentaires: [
            { de: "mira.lq", txt: "je te laisse la lampe allumée quand même" },
            { de: "t.reh", lui: true, txt: "vous étiez que toutes les deux ?" },
        ],
    },

    {
        id: "f07", peinture: "fjord_juillet", t: "03/07 21:04",
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
        id: "f08", peinture: "velo_bleu", t: "12/06 11:20",
        lieu: "Kiel",
        legende: "il a un nom mais je ne le dirai pas",
        jaime: 44,
        commentaires: [
            { de: "jonas.brandt", txt: "c'est Horst. elle l'a appelé Horst." },
            { de: "t.reh", lui: true, txt: "tu es passée devant chez moi à 11h18" },
        ],
    },
];


/* Le compte qui commente tout. On le calcule au lieu de
   l'écrire en dur : si on ajoute une publication, le compte
   reste juste. */
function commentairesDeLui() {
    let total = 0;
    PUBLICATIONS.forEach(function (publication) {
        publication.commentaires.forEach(function (c) {
            if (c.lui) total++;
        });
    });
    return total;
}


function publicationsTriees() {
    return PUBLICATIONS.slice().sort(function (a, b) {
        return clefDeTri(b.t) - clefDeTri(a.t);
    });
}
