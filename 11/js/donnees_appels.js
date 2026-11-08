/* ============================================================
   APPELS ET RÉPONDEUR
   ============================================================
   Le journal d'appels est le seul endroit du téléphone où une
   DURÉE est écrite. « Décroché, 3 secondes » raconte toute une
   scène en trois mots.

   Les messages du répondeur sont donnés avec leur
   transcription : c'est ce que fait un iPhone, et ça nous
   permet de les « écouter » sans aucun fichier audio.
   ⚠️ Si on enregistre de vraies voix plus tard (Piper, comme en
   octobre), il suffira d'ajouter `son: "assets/…"`.
   ============================================================ */

const APPELS = [
    { contact: "mira", type: "manque", t: "19/11 14:18" },
    { contact: "hanne", type: "manque", t: "15/11 16:08" },
    { contact: "tobias", type: "manque", t: "12/11 20:28" },
    { contact: "vogt", type: "manque", t: "11/11 11:18" },
    { contact: "jonas", type: "manque", t: "10/11 19:02" },
    { contact: "mira", type: "manque", t: "10/11 08:18" },
    { contact: "mira", type: "manque", t: "09/11 16:00" },
    { contact: "mira", type: "manque", t: "09/11 11:35" },

    /* --- la nuit du 8 --- */
    { contact: "tobias", type: "manque", t: "08/11 23:00" },
    { contact: "tobias", type: "manque", t: "08/11 22:52" },
    {
        contact: "tobias", type: "entrant", t: "08/11 22:48", duree: "3 s",
        indice: "appel_tobias",
        note: "Décroché, puis raccroché.",
    },
    { contact: "lisbeth", type: "manque", t: "08/11 21:30" },

    /* --- avant --- */
    { contact: "mira", type: "sortant", t: "07/11 12:04", duree: "9 min 12 s" },
    { contact: "vogt", type: "sortant", t: "02/11 15:40", duree: "6 min 12 s", note: "Prise de rendez-vous." },
    { contact: "jonas", type: "sortant", t: "26/10 18:35", duree: "2 min 40 s" },
    { contact: "hanne", type: "sortant", t: "20/10 18:00", duree: "41 min 03 s" },
    { contact: "tobias", type: "manque", t: "11/10 04:12" },
    { contact: "tobias", type: "manque", t: "11/10 03:58" },
    { contact: "tobias", type: "manque", t: "11/10 03:41" },
];


const REPONDEUR = [
    {
        id: "r01",
        contact: "mira",
        t: "10/11 08:20",
        duree: "0:34",
        transcription: "Lena c'est moi. Il est huit heures, ton vélo n'est pas là, ton appareil n'est pas là, et j'ai dormi à quatre mètres de toi. " +
            "Je vais au commissariat à dix heures. Si tu es quelque part et que tu ne veux pas qu'on te trouve, " +
            "écris-moi juste un point. Un point, Lena. Je comprendrai.",
    },
    {
        id: "r02",
        contact: "vogt",
        t: "11/11 11:18",
        duree: "0:18",
        indice: "rdv_avocate",
        transcription: "Madame Brandt, Cabinet Vogt. Vous n'êtes pas venue au rendez-vous de ce matin et vous ne répondez pas. " +
            "Rappelez-moi quand vous pouvez — et surtout, ne faites rien seule.",
    },
    {
        id: "r03",
        contact: "tobias",
        t: "12/11 20:28",
        duree: "0:22",
        transcription: "C'est moi. Je suis en bas. La lumière du salon est allumée et le rideau de la cuisine est tiré du mauvais côté, " +
            "comme quand c'est Mira qui le ferme. Donc tu n'es pas là. " + "\n" +
            "(silence de six secondes) " + "\n" +
            "Je ne monte pas, hein. Je dis juste que je sais.",
    },
    {
        id: "r04",
        contact: "hanne",
        t: "15/11 16:08",
        duree: "1:02",
        transcription: "Ma Lena, c'est Oma. J'ai fait de la Rote Grütze, il y en a trop, c'est toujours trop pour une personne. " +
            "Tu viendras peut-être avant Noël ? Ne te sens pas obligée, je dis ça comme ça. " +
            "Ta tante dit que je parle trop longtemps sur les répondeurs. Alors je raccroche. " +
            "Mets un bonnet, il fait un vent terrible ici. Et à Kiel aussi, j'ai regardé.",
        note: "Elle ne sait pas.",
    },
];


function appelsNonLus() {
    return APPELS.filter(function (a) {
        return a.type === "manque" && !dejaLu("appel:" + a.t);
    }).length;
}


function repondeurNonLus() {
    return REPONDEUR.filter(function (m) { return !dejaLu("repondeur:" + m.id); }).length;
}


/* L'étiquette d'un appel dans la liste. */
function libelleAppel(appel) {
    if (appel.type === "manque") return "Appel manqué";
    if (appel.type === "entrant") return "Entrant — " + (appel.duree || "");
    return "Sortant — " + (appel.duree || "");
}
