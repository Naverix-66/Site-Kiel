/* ============================================================
   LES NOTES
   ============================================================
   Les notes sont l'endroit où quelqu'un se parle à soi-même.
   C'est donc là que se cachent les choses les plus utiles — et
   la seule chose qu'elle ait vraiment protégée.

   Un bloc de note :
       { type: "p",         texte: "…" }
       { type: "liste",     items: [{ texte, coche, souligne, barre }] }
       { type: "manuscrit", texte: "…" }   (pour les notes écrites vite)
   ============================================================ */

const NOTES = [

    {
        id: "n01",
        titre: "",
        t: "02/11 23:40",
        indice: "note_code",
        corps: [
            { type: "p", texte: "Pour ouvrir ce qui est fermé :" },
            { type: "p", texte: "l'heure de la photo que je préfère." },
            { type: "p", texte: "" },
            { type: "p", texte: "Ne pas écrire le code. Jamais." },
        ],
    },

    {
        id: "n02",
        titre: "Me Vogt — ce qu'elle a dit",
        t: "04/11 12:30",
        indice: "conseils_avocate",
        corps: [
            { type: "p", texte: "1. Une plainte est possible même sans violence." },
            { type: "p", texte: "2. La preuve, c'est le logiciel. Pas mes insomnies." },
            { type: "p", texte: "3. Ne pas le confronter. Ne pas le prévenir." },
            { type: "p", texte: "4. Ne rien dire à personne. Pas même à Mira." },
            { type: "p", texte: "" },
            { type: "p", texte: "Elle m'a demandé si j'avais un endroit. J'ai dit oui." },
        ],
    },

    {
        id: "n03",
        titre: "les endroits où personne ne pense à regarder",
        t: "28/10 02:14",
        indice: "note_endroits",
        corps: [
            {
                type: "liste",
                items: [
                    { texte: "la buanderie du 3e (trop de monde)", barre: true },
                    { texte: "le local vélos (il a la clé)", barre: true },
                    { texte: "chez Jonas (c'est le premier endroit où ils iront)", barre: true },
                    { texte: "chez Oma — vendu", barre: true },
                    { texte: "derrière le phare — B.", souligne: true },
                ],
            },
            { type: "p", texte: "" },
            { type: "manuscrit", texte: "en hiver il n'y a personne là-bas. personne du tout." },
        ],
    },

    {
        id: "n04",
        titre: "courses",
        t: "06/11 18:02",
        indice: "liste_courses",
        corps: [
            {
                type: "liste",
                items: [
                    { texte: "croquettes (grand sac)", coche: true },
                    { texte: "caisse de transport", coche: true },
                    { texte: "piles AA", coche: true },
                    { texte: "carte SIM prépayée (pas en ville, à Gaarden)", coche: true },
                    { texte: "bougies", coche: true },
                    { texte: "gaz camping", coche: false },
                    { texte: "pain", coche: false },
                ],
            },
        ],
    },

    {
        id: "n05",
        titre: "mdp",
        t: "12/09 10:20",
        corps: [
            { type: "p", texte: "wifi maison : ••••••••••" },
            { type: "p", texte: "netflix : (c'est celui de Jonas)" },
            { type: "p", texte: "labo : brandt1998" },
            { type: "p", texte: "" },
            { type: "p", texte: "coffre : son nom, en majuscules. 4 lettres." },
        ],
    },

    {
        id: "n06",
        titre: "Coffre",
        t: "07/11 23:58",
        verrou: "coffre",
        indice: "plan_du_coffre",
        mot: MOT_DU_COFFRE,
        consigne: "Note verrouillée",
        indiceDeVerrou: "« son nom, en majuscules, 4 lettres » — il vit ici et il a un carnet de vaccination.",
        corps: [
            { type: "p", texte: "Ce que je prends :" },
            {
                type: "liste",
                items: [
                    { texte: "l'appareil et les six pellicules", coche: true },
                    { texte: "les négatifs (tous)", coche: true },
                    { texte: "Keks, la caisse, les croquettes", coche: true },
                    { texte: "900 €", coche: true },
                    { texte: "le vélo", coche: true },
                ],
            },
            { type: "p", texte: "" },
            { type: "p", texte: "Ce que je laisse :" },
            {
                type: "liste",
                items: [
                    { texte: "le téléphone. SURTOUT le téléphone.", souligne: true },
                    { texte: "mes clés sur la table" },
                    { texte: "un mot pour Mira — non. elle dirait tout, et ce serait de ma faute." },
                ],
            },
            { type: "p", texte: "" },
            { type: "p", texte: "Je ne me cache pas de la police. Je me cache d'une seule personne." },
            { type: "p", texte: "" },
            { type: "manuscrit", texte: "si quelqu'un lit ça : je vais bien. je suis partie debout." },
        ],
    },

    {
        id: "n07",
        titre: "pour plus tard",
        t: "30/10 04:02",
        corps: [
            { type: "manuscrit", texte: "Mira laisse la lampe du salon allumée quand je rentre tard." },
            { type: "manuscrit", texte: "Elle ne me l'a jamais dit. Elle fait juste ça." },
            { type: "manuscrit", texte: "" },
            { type: "manuscrit", texte: "Je crois que c'est ça, les gens. Pas ce qu'ils promettent. Ce qu'ils laissent allumé." },
        ],
    },

    {
        id: "n08",
        titre: "série — nuit sans personne",
        t: "24/10 23:50",
        corps: [
            { type: "p", texte: "12 images. Format carré. Tirages 30x30, papier baryté." },
            { type: "p", texte: "Les grues. Le ferry de 22 h 40. Le lampadaire de Düsternbrook (le seul qui clignote)." },
            { type: "p", texte: "Titre de l'expo : « personne ne regarde la ville à cette heure-là »." },
            { type: "p", texte: "" },
            { type: "p", texte: "Demander à Lisbeth si le kiosk veut les accrocher en janvier." },
        ],
    },
];


function notesVisibles() {
    return NOTES.slice().sort(function (a, b) {
        return clefDeTri(b.t) - clefDeTri(a.t);
    });
}


function noteParId(id) {
    return NOTES.filter(function (n) { return n.id === id; })[0] || null;
}


/* Le titre affiché dans la liste : une note sans titre prend sa
   première ligne, comme sur un vrai téléphone. */
function titreDeNote(note) {
    if (note.titre) return note.titre;

    const premierTexte = (note.corps || []).filter(function (bloc) {
        return bloc.texte && bloc.texte.trim() !== "";
    })[0];

    return premierTexte ? apercu(premierTexte.texte, 32) : "Nouvelle note";
}


/* L'aperçu gris, sous le titre. */
function apercuDeNote(note) {
    if (note.verrou && !estOuvert(note.verrou)) return "Note verrouillée";

    const textes = [];
    (note.corps || []).forEach(function (bloc) {
        if (bloc.texte) textes.push(bloc.texte);
        if (bloc.items) bloc.items.forEach(function (i) { textes.push(i.texte); });
    });

    // on saute la première ligne quand elle sert déjà de titre
    const debut = note.titre ? 0 : 1;
    return apercu(textes.slice(debut).join(" "), 54) || "Aucun texte supplémentaire";
}
