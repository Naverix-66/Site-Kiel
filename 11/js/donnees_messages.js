/* ============================================================
   LES CONVERSATIONS
   ============================================================
   Le téléphone appartient à Lena. Donc, dans TOUS les fils :

       de: "moi"  -> c'est Lena qui écrit (bulle bleue, à droite)
       de: "eux"  -> c'est l'autre (bulle grise, à gauche)

   Ça donne une sensation très particulière dans le fil « Numéro
   inconnu » : la joueuse voit ses propres messages à GAUCHE,
   comme une étrangère. C'est voulu, et Mira le fait remarquer.

   Un message peut porter :
       indice  : l'identifiant d'un indice ramassé à la lecture
       photo   : une clef de peintures.js (photo envoyée)
       info    : une petite ligne grise sous la bulle
       efface  : true -> « ce message a été supprimé »

   Le scénario ajoute des messages en direct dans
   ETAT.messagesAjoutes : on les recolle à la lecture
   (voir messagesDuFil()).
   ============================================================ */

const FILS = [

    /* ========================================================
       MIRA — la colocataire, et la voix qui accompagne tout le jeu
       ======================================================== */
    {
        id: "mira",
        contact: "mira",
        messages: [
            { de: "eux", t: "02/11 18:12", txt: "tu rentres quand ? j'ai fait trop de soupe" },
            { de: "moi", t: "02/11 18:40", txt: "22h. garde m'en un bol" },

            { de: "eux", t: "04/11 09:02", txt: "il est passé au boulot hier. il a demandé si tu travaillais mardi" },
            { de: "moi", t: "04/11 09:11", txt: "tu lui as dit quoi" },
            { de: "eux", t: "04/11 09:14", txt: "rien. que je savais pas." },
            { de: "eux", t: "04/11 09:22", txt: "lena il faut porter plainte" },
            { de: "moi", t: "04/11 09:48", txt: "je gère." },

            {
                de: "moi", t: "08/11 19:42", txt: "je bosse tard, ne m'attends pas",
                indice: "sms_mensonge",
            },
            { de: "eux", t: "08/11 19:44", txt: "ok. je te laisse la lampe allumée" },

            { de: "eux", t: "09/11 16:02", txt: "lena ? tu réponds pas" },
            { de: "eux", t: "09/11 22:50", txt: "ton vélo est plus là. ton appareil non plus." },
            { de: "eux", t: "10/11 19:30", txt: "je suis allée à la police. ils ont pris la déposition." },
            { de: "eux", t: "13/11 02:11", txt: "je dors plus" },
            { de: "eux", t: "17/11 20:04", txt: "ils ont classé. onze jours, et un dossier fermé." },

            /* --- et puis, le 19, elle fait une lessive --- */
            { de: "eux", t: "19/11 14:20", txt: "je l'ai trouvé. dans la machine à laver." },
            { de: "eux", t: "19/11 23:08", txt: "le dernier numéro qu'elle a écrit cette nuit-là, c'est pas le mien. c'est presque le mien." },
            { de: "eux", t: "20/11 09:05", txt: "je vous l'ai envoyé ce matin. avec un mot." },
            { de: "eux", t: "20/11 09:06", txt: "j'écris sur son numéro, ça arrive en wifi. répondez-moi là." },
            { de: "eux", t: "21/11 08:14", txt: "vous l'avez reçu ?" },
        ],
    },


    /* ========================================================
       LE NUMÉRO INCONNU — c'est-à-dire la joueuse
       ========================================================
       Le cœur du jeu. Onze répliques, et tout est dedans.
       ======================================================== */
    {
        id: "klara",
        contact: "klara",
        messages: [
            {
                de: "moi", t: "08/11 23:02", txt: "tu es réveillée ? je rentre tard. ne ferme pas à clé",
                indice: "sms_a_moi",
            },
            { de: "eux", t: "08/11 23:04", txt: "Je pense que vous vous êtes trompée de numéro 🙂" },
            { de: "moi", t: "08/11 23:05", txt: "oh" },
            { de: "moi", t: "08/11 23:05", txt: "pardon. un chiffre à côté." },
            { de: "eux", t: "08/11 23:06", txt: "Pas de souci, ça arrive. Bonne nuit !" },
            { de: "moi", t: "08/11 23:12", txt: "il y a quelqu'un chez vous ?" },
            { de: "eux", t: "08/11 23:13", txt: "Euh. Oui, pourquoi ?" },
            { de: "moi", t: "08/11 23:14", txt: "pour rien. c'est bien." },
            { de: "moi", t: "08/11 23:15", txt: "gardez la porte fermée quand même" },
            { de: "eux", t: "08/11 23:17", txt: "Vous me faites un peu peur là. Ça va aller ?" },
            {
                de: "moi", t: "08/11 23:19", txt: "Non. Mais merci d'avoir répondu.",
                indice: "lena_reponse",
                info: "Lu à 23:19",
            },
        ],
    },


    /* ========================================================
       TOBIAS — l'ex
       ========================================================
       Serrurier. Il ouvre les portes des gens pour vivre, et il
       trouve ça normal.

       C'est LE méchant de l'histoire, et il fonctionne en
       cycle — c'est ce cycle qui est insupportable à lire :

         il rend service  →  il surveille  →  il reproche  →
         il menace  →  il s'excuse  →  il rend service…

       Il sait des choses qu'il ne devrait pas savoir. Il le dit
       calmement. Et quand elle résiste, il énumère ce qu'il
       peut atteindre : son frère, son labo, sa grand-mère, son
       chat, sa porte. Il n'a jamais besoin de lever la main.

       Deux garde-fous d'écriture : aucune violence physique
       n'est décrite, et il ne sait JAMAIS où elle est. Il reste
       un homme qui menace dans le vide — c'est ça qui le rend
       à la fois terrifiant et pathétique.
       ======================================================== */
    {
        id: "tobias",
        contact: "tobias",
        messages: [
            { de: "eux", t: "12/09 08:40", txt: "j'ai remplacé le joint de ta porte en passant. elle fermait mal." },
            { de: "moi", t: "12/09 12:10", txt: "tu es entré ?" },
            { de: "eux", t: "12/09 12:11", txt: "de l'extérieur. je suis serrurier lena 🙂" },

            { de: "eux", t: "20/10 21:14", txt: "tu as changé ta photo. elle est jolie" },
            { de: "eux", t: "28/10 23:36", txt: "tu rentres tard en ce moment. tu devrais pas prendre la Kiellinie seule à cette heure là" },

            { de: "eux", t: "01/11 07:48", txt: "bon anniversaire à ta grand-mère. dis lui bonjour" },
            { de: "moi", t: "01/11 12:20", txt: "comment tu sais ça" },
            { de: "eux", t: "01/11 12:22", txt: "j'ai de la mémoire, c'est tout." },

            { de: "eux", t: "03/11 19:30", txt: "tu as changé de boulangerie" },
            { de: "eux", t: "03/11 19:30", txt: "celle de Holtenauer est meilleure, tu avais raison" },

            { de: "eux", t: "05/11 23:51", txt: "tu étais où ce soir" },
            { de: "moi", t: "05/11 23:52", txt: "arrête" },
            { de: "eux", t: "05/11 23:52", txt: "je m'inquiète. c'est tout." },
            { de: "moi", t: "05/11 23:55", txt: "ne m'écris plus" },
            { de: "eux", t: "05/11 23:56", txt: "ne me parle pas comme ça" },
            { de: "eux", t: "05/11 23:57", txt: "je t'ai attendue deux heures devant le labo mardi. deux heures." },
            { de: "eux", t: "05/11 23:58", txt: "tu me fais passer pour un con devant tout le monde et c'est moi le problème" },
            { de: "eux", t: "06/11 00:02", txt: "ok" },
            { de: "eux", t: "06/11 00:03", txt: "ok" },
            { de: "eux", t: "06/11 00:19", txt: "tu as éteint ta lampe à 00h12. dors bien." },

            { de: "eux", t: "06/11 04:40", txt: "tu as beaucoup bougé cette nuit. tu cherchais quelque chose ?" },

            /* --- le 7 : il dit tout haut ce qu'il peut atteindre --- */
            { de: "eux", t: "07/11 21:02", txt: "je sais que tu prépares quelque chose" },
            {
                de: "eux", t: "07/11 21:04",
                txt: "alors je te dis un truc une fois. si tu pars, je te retrouve.",
                indice: "menace_depart",
            },
            { de: "eux", t: "07/11 21:04", txt: "c'est pas une menace. c'est juste comme ça." },
            { de: "eux", t: "07/11 21:09", txt: "ton frère bosse le mardi. ta grand mère est à Eckernförde. ton labo ferme à 18h. je sais tout ça depuis des mois et j'ai jamais rien fait de mal." },
            { de: "eux", t: "07/11 21:11", txt: "et je peux ouvrir ta porte en quatre minutes. tu le sais aussi." },
            { de: "moi", t: "07/11 21:40", txt: "qu'est-ce que tu veux" },
            { de: "eux", t: "07/11 21:41", txt: "que tu arrêtes de me mentir. c'est tout ce que j'ai jamais demandé." },
            { de: "eux", t: "07/11 23:58", txt: "pardon pour tout à l'heure. j'étais fatigué. tu sais que je suis pas comme ça." },

            {
                de: "eux", t: "08/11 22:49", txt: "pourquoi tu raccroches",
                indice: "sms_tobias_nuit",
            },
            { de: "eux", t: "08/11 22:50", txt: "lena" },
            { de: "eux", t: "08/11 22:58", txt: "il fait 4 degrés et tu n'as pas pris ton écharpe verte" },
            { de: "eux", t: "08/11 23:20", txt: "ok." },

            /* --- après : il écrit encore. Donc il ne sait pas. --- */
            { de: "eux", t: "10/11 07:15", txt: "ta porte est fermée à double tour. ce n'est pas ton habitude." },
            { de: "eux", t: "11/11 03:12", txt: "OÙ EST-CE QUE TU ES" },
            { de: "eux", t: "11/11 03:14", txt: "pardon. j'ai pas dormi." },
            { de: "eux", t: "12/11 20:10", txt: "je suis passé. mira ne m'a pas ouvert." },
            { de: "eux", t: "12/11 20:13", txt: "dis lui que je sais qu'elle sait." },
            { de: "eux", t: "13/11 19:30", txt: "tu as pris le chat." },
            { de: "eux", t: "13/11 19:31", txt: "donc tu es partie. donc tu me mentais depuis des semaines, en me regardant dans les yeux." },
            { de: "eux", t: "13/11 19:44", txt: "après tout ce que j'ai fait pour toi." },
            {
                de: "eux", t: "14/11 02:44", txt: "dis juste que tu es vivante",
                indice: "tobias_ecrit_apres",
            },
            { de: "eux", t: "14/11 02:51", txt: "je sais que je suis trop. je travaille là dessus. vraiment." },
            { de: "eux", t: "14/11 02:52", txt: "reviens et je change. tu me connais." },
            { de: "eux", t: "16/11 13:02", txt: "la police m'a appelé. je leur ai dit que je savais pas où tu étais." },
            { de: "eux", t: "16/11 13:03", txt: "c'est la première fois en sept mois que c'est vrai." },
        ],
    },


    /* ========================================================
       JONAS — le petit frère
       ======================================================== */
    {
        id: "jonas",
        contact: "jonas",
        messages: [
            { de: "eux", t: "12/10 13:20", txt: "maman demande si tu viens à noël" },
            { de: "moi", t: "12/10 19:44", txt: "je sais pas encore" },

            { de: "moi", t: "26/10 17:40", txt: "tu peux me prêter 300 en liquide ? je te rends en décembre" },
            { de: "eux", t: "26/10 17:52", txt: "ça va ??" },
            { de: "moi", t: "26/10 17:53", txt: "oui. pose pas de questions s'il te plaît" },
            {
                de: "eux", t: "26/10 18:30", txt: "ok. demain au resto, je te les donne. je pose pas de questions.",
                indice: "jonas_argent",
            },
            { de: "moi", t: "26/10 18:31", txt: "t'es le meilleur" },
            { de: "eux", t: "26/10 18:32", txt: "je sais" },

            { de: "eux", t: "09/11 19:00", txt: "mira m'a appelé. t'es où ???" },
            { de: "eux", t: "11/11 10:20", txt: "la police est venue chez maman. elle a rien dit mais elle a pas dormi." },
            { de: "eux", t: "15/11 22:10", txt: "je sais que tu vas bien" },
            { de: "eux", t: "15/11 22:11", txt: "en fait j'en sais rien. mais je le sais." },
            { de: "eux", t: "18/11 08:02", txt: "si tu lis ça un jour : j'ai rien dit. à personne. comme tu voulais." },
        ],
    },


    /* ========================================================
       LISBETH — la fausse piste
       ========================================================
       Trois messages en pleine nuit : de quoi soupçonner
       n'importe qui. Le fil du groupe (juste en dessous)
       explique tout. C'est le premier petit test du jeu :
       est-ce qu'on vérifie avant de soupçonner ?
       ======================================================== */
    {
        id: "lisbeth",
        contact: "lisbeth",
        messages: [
            { de: "eux", t: "02/11 11:20", txt: "ton ex est venu changer la serrure du kiosk ce matin. il a pas voulu être payé" },
            { de: "eux", t: "02/11 11:21", txt: "il est adorable franchement. je comprends pas pourquoi tu en parles jamais" },

            { de: "eux", t: "08/11 22:31", txt: "tu peux me remplacer demain matin ? 6h-12h" },
            { de: "eux", t: "08/11 23:40", txt: "lena ? c'est urgent là, je dois trouver quelqu'un" },
            { de: "eux", t: "09/11 00:58", txt: "laisse tomber, pawel a dit oui" },
            { de: "eux", t: "09/11 00:59", txt: "merci quand même 😘" },
            { de: "eux", t: "11/11 12:40", txt: "mira m'a dit. je suis là si t'as besoin. n'importe quand." },
        ],
    },

    {
        id: "groupe_kiosk",
        contact: null,
        nomDuGroupe: "Kiosk 24",
        groupe: ["Lisbeth", "Mehmet", "Pawel", "Lena"],
        messages: [
            { de: "eux", auteur: "Lisbeth", t: "08/11 22:30", txt: "quelqu'un peut prendre 6h-12h demain ???" },
            { de: "eux", auteur: "Mehmet", t: "08/11 22:35", txt: "pas moi désolé je suis à hambourg" },
            { de: "eux", auteur: "Lisbeth", t: "08/11 23:39", txt: "sérieux personne ?" },
            { de: "eux", auteur: "Pawel", t: "09/11 00:57", txt: "je peux" },
            { de: "eux", auteur: "Lisbeth", t: "09/11 00:58", txt: "pawel je t'aime" },
            { de: "eux", auteur: "Mehmet", t: "12/11 17:20", txt: "des nouvelles de lena ?" },
            { de: "eux", auteur: "Lisbeth", t: "12/11 17:44", txt: "non." },
        ],
    },


    /* ========================================================
       BOB — easter egg (le jeu d'octobre)
       ======================================================== */
    {
        id: "bob",
        contact: "bob",
        messages: [
            { de: "eux", t: "08/10 03:14", txt: "BOB A TROUVÉ UN TÉLÉPHONE" },
            { de: "eux", t: "08/10 03:14", txt: "BOB NE SAIT PAS ÉCRIRE" },
            { de: "eux", t: "08/10 03:15", txt: "cakey dit que je dois le rendre" },
            { de: "eux", t: "08/10 03:16", txt: "cakey a un gâteau et elle le partage pas" },
            { de: "eux", t: "08/10 03:40", txt: "bonne nuit madame" },
            { de: "moi", t: "08/10 09:12", txt: "???" },
        ],
    },


    /* ========================================================
       LE COMPTE SANS NOM — acte IV
       ========================================================
       Vide au départ. Le scénario le remplit, et le fil
       n'apparaît dans la liste qu'à ce moment-là.
       ======================================================== */
    {
        id: "nebel",
        contact: "nebel",
        cache: function () { return ETAT.acte < 4; },
        messages: [],
    },
];


const FILS_PAR_ID = {};
FILS.forEach(function (fil) { FILS_PAR_ID[fil.id] = fil; });


/* ------------------------------------------------------------
   messagesDuFil(id)
   ------------------------------------------------------------
   Les messages écrits d'avance PLUS ceux que le scénario a
   ajoutés en cours de partie, le tout remis dans l'ordre.
   ------------------------------------------------------------ */
function messagesDuFil(id) {
    const fil = FILS_PAR_ID[id];
    if (!fil) return [];

    const ajoutes = ETAT.messagesAjoutes.filter(function (m) { return m.fil === id; });

    /* ⚠️ Les messages reçus pendant la partie portent l'HEURE
       RÉELLE de la joueuse. Si elle joue à 00 h 49, cette heure
       est « plus tôt » que le 21/11 08:14 écrit d'avance, et ils
       se rangeaient avant. Donc : tout ce qui arrive en direct
       passe après, toujours, dans l'ordre d'arrivée. */
    return fil.messages.slice().sort(function (a, b) {
        return clefDeTri(a.t) - clefDeTri(b.t);
    }).concat(ajoutes);
}


/* Le dernier message d'un fil (pour la liste des conversations). */
function dernierMessage(id) {
    const messages = messagesDuFil(id);
    return messages[messages.length - 1] || null;
}


/* Les fils visibles, du plus récent au plus ancien. */
function filsVisibles() {
    return FILS.filter(function (fil) {
        if (fil.cache && fil.cache()) return false;
        return messagesDuFil(fil.id).length > 0;
    }).sort(function (a, b) {
        const da = dernierMessage(a.id);
        const db = dernierMessage(b.id);
        return clefDeTri(db ? db.t : "01/01") - clefDeTri(da ? da.t : "01/01");
    });
}


/* Combien de fils n'ont pas encore été ouverts (le badge rouge). */
function filsNonLus() {
    return filsVisibles().filter(function (fil) {
        return !dejaLu("fil:" + fil.id);
    }).length;
}
