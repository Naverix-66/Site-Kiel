/* ============================================================
   LA BOÎTE MAIL
   ============================================================
   Le mail, c'est l'administratif : les reçus, la banque, le
   vétérinaire. C'est gris, c'est ennuyeux, et c'est pour ça
   que c'est là que se trouve la seule preuve utilisable devant
   un juge.

   Un bloc de corps :
       { type: "p",    texte: "…" }
       { type: "cite", texte: "…" }          (texte transféré)
       { type: "recu", lignes: [[gauche, droite], …], total: […] }
   ============================================================ */

const MAILS = [

    /* ================= BOÎTE DE RÉCEPTION ================= */

    {
        id: "m01",
        boite: "reception",
        de: { nom: "Mira Lindqvist", adresse: "mira.lindqvist@posteo.de" },
        objet: "Transféré : Vermisstenanzeige — classement sans suite",
        t: "17/11 20:22",
        indice: "police_classe",
        corps: [
            { type: "p", texte: "Je t'envoie ça. Je sais que c'est absurde d'envoyer un mail à quelqu'un qui a disparu. Mais si un jour tu lis ta boîte, je veux que tu saches exactement ce qu'ils ont écrit." },
            { type: "p", texte: "Je ne suis pas d'accord avec une seule ligne de ce papier." },
            { type: "p", texte: "M." },
            { type: "p", texte: "" },
            { type: "cite", texte: "Polizeidirektion Kiel — Kommissariat 11" },
            { type: "cite", texte: "Objet : disparition signalée le 10/11, Brandt, Lena, née le 14.03 — dossier 11-4482/26" },
            { type: "cite", texte: "La personne concernée est majeure. Aucun élément ne laisse supposer une infraction, un accident ou une atteinte à son intégrité. Le domicile ne présente aucune trace d'effraction ni de lutte. Des effets personnels (vélo, matériel photographique, animal domestique) ont été emportés." },
            { type: "cite", texte: "Il s'agit selon toute vraisemblance d'un départ volontaire. Une personne majeure a le droit de ne pas être localisée." },
            { type: "cite", texte: "Le dossier est classé. Il sera réactivé en cas d'élément nouveau." },
        ],
    },

    {
        id: "m02",
        boite: "reception",
        de: { nom: "Sparkasse Kiel", adresse: "service@sparkasse-kiel.de" },
        objet: "Récapitulatif de vos opérations — novembre",
        t: "02/11 06:00",
        indice: "retraits",
        corps: [
            { type: "p", texte: "Bonjour Mme Brandt, voici le récapitulatif des opérations sur votre compte courant." },
            {
                type: "recu",
                lignes: [
                    ["24/10 — Retrait DAB Holtenauer Str.", "− 200,00 €"],
                    ["28/10 — Retrait DAB Hauptbahnhof", "− 200,00 €"],
                    ["01/11 — Retrait DAB Gaarden", "− 200,00 €"],
                    ["28/10 — Virement reçu (Kleinanzeigen)", "+ 400,00 €"],
                ],
                total: ["Solde au 02/11", "1 148,62 €"],
            },
            { type: "p", texte: "Trois retraits en espèces en dix jours, c'est inhabituel sur votre compte. Si vous ne reconnaissez pas une opération, contactez-nous." },
        ],
    },

    {
        id: "m03",
        boite: "reception",
        de: { nom: "Kleinanzeigen", adresse: "no-reply@kleinanzeigen.de" },
        objet: "Votre annonce est vendue : Objectif 35 mm f/2",
        t: "28/10 14:12",
        indice: "objectif_vendu",
        corps: [
            { type: "p", texte: "Félicitations, votre article est vendu." },
            {
                type: "recu",
                lignes: [
                    ["Article", "Objectif 35 mm f/2 (argentique)"],
                    ["Prix", "400,00 €"],
                    ["Mode de remise", "En main propre — Kiel Hbf"],
                    ["Paiement", "Espèces"],
                ],
            },
            { type: "p", texte: "Pensez à retirer votre annonce si l'article n'est plus disponible." },
        ],
    },

    {
        id: "m04",
        boite: "reception",
        de: { nom: "Tierarztpraxis am Schrevenpark", adresse: "praxis@tierarzt-schrevenpark.de" },
        objet: "Rappel de vaccination",
        t: "12/09 09:40",
        indice: "nom_du_chat",
        corps: [
            { type: "p", texte: "Chère Mme Brandt," },
            {
                type: "recu",
                lignes: [
                    ["Patient", "KEKS"],
                    ["Espèce", "Chat européen, roux, mâle"],
                    ["Né en", "2021"],
                    ["Puce", "276098106452991"],
                    ["Prochain rappel", "12/09 de l'année prochaine"],
                ],
            },
            { type: "p", texte: "Keks s'est très bien tenu cette fois. (Enfin : il a mordu l'assistante, mais moins fort que l'an dernier.)" },
            { type: "p", texte: "Bien à vous, Dr. Petersen" },
        ],
    },

    {
        id: "m05",
        boite: "reception",
        de: { nom: "Oma", adresse: "hanne.brandt@t-online.de" },
        objet: "la maison",
        t: "14/05 17:30",
        indice: "mail_hanne_maison",
        indicesEnPlus: ["mail_hanne_cabane"],
        corps: [
            { type: "p", texte: "ma Lena" },
            { type: "p", texte: "j'ai signé mardi la maison est vendue je pleure mais c'est fait les nouveaux ont trois enfants et la dame a demandé si le pommier donnait encore j'ai dit oui" },
            { type: "p", texte: "je pars chez ta tante à Eckernförde pour l'été et après on verra je n'ai pas besoin de huit pièces pour une personne qui dort dans une" },
            { type: "p", texte: "la cabane je ne la vends pas ils ont proposé mais non la cabane c'est à ton grand-père et c'est à toi maintenant la clé est sous la troisième pierre comme toujours personne n'y va jamais en hiver il n'y a que le vent et le phare" },
            { type: "p", texte: "viens quand tu veux tu n'as pas besoin de prévenir c'est ça une maison" },
            { type: "p", texte: "je t'embrasse fort mange autre chose que du pain" },
            { type: "p", texte: "Oma" },
        ],
    },

    {
        id: "m06",
        boite: "reception",
        de: { nom: "Tobias Reh", adresse: "t.reh@mailbox.org" },
        objet: "pour toi",
        t: "06/11 01:14",
        corps: [
            { type: "p", texte: "Je sais que tu ne répondras pas. Je l'écris quand même, comme ça c'est dit." },
            { type: "p", texte: "J'ai réfléchi. J'ai été trop présent. Les gens me disent que je suis trop intense et ils ont raison, mais ils ne savent pas d'où ça vient. Toi tu le sais." },
            { type: "p", texte: "Je ne te demande pas de revenir. Je te demande juste de ne pas me supprimer de ta vie comme on supprime une application." },
            { type: "p", texte: "Je veux juste savoir que tu vas bien. Tous les jours. C'est tout. C'est pas beaucoup." },
            { type: "p", texte: "T." },
        ],
    },

    {
        id: "m07",
        boite: "reception",
        de: { nom: "Labor Nordlicht", adresse: "kontakt@labor-nordlicht.de" },
        objet: "Vos tirages sont prêts (6 pellicules)",
        t: "05/11 11:02",
        corps: [
            { type: "p", texte: "Bonjour Lena, vos six pellicules sont développées et les planches-contacts sont prêtes." },
            { type: "p", texte: "Comme d'habitude on t'a gardé les négatifs à part dans une pochette. On ferme à 18 h." },
            { type: "p", texte: "PS : la série de nuit est très belle. Lars dit que la numéro 9 est la meilleure chose que tu aies faite." },
        ],
    },

    {
        id: "m08",
        boite: "reception",
        de: { nom: "Kieler Nachrichten", adresse: "newsletter@kn-online.de" },
        objet: "Ce qui se passe à Kiel ce week-end",
        t: "08/11 07:00",
        corps: [
            { type: "p", texte: "Marché de la Saint-Martin sur le Rathausplatz, concert à la Pumpe, et brouillard sur la Förde jusqu'à dimanche : visibilité réduite à 200 m, les ferries pourraient être retardés." },
        ],
    },


    /* ===================== BROUILLONS ===================== */

    {
        id: "b01",
        boite: "brouillons",
        de: { nom: "Moi", adresse: "lena.brandt@posteo.de" },
        a: "kanzlei@vogt-partner.de",
        objet: "Re: rendez-vous du 11",
        t: "07/11 23:30",
        indice: "brouillon_avocate",
        corps: [
            { type: "p", texte: "Madame Vogt," },
            { type: "p", texte: "Je ne viendrai pas lundi. Ce n'est pas parce que j'ai changé d'avis." },
            { type: "p", texte: "Vous m'avez dit qu'une procédure prend entre huit mois et deux ans, et que pendant tout ce temps il saurait exactement où je dors. Je n'ai pas deux ans. J'ai besoin d'un hiver." },
            { type: "p", texte: "Je garde tout. Les captures, les relevés, et le nom du logiciel. Le jour où je pourrai me battre d'un endroit où il ne peut pas sonner à ma porte, je reviendrai vous voir avec le dossier complet." },
            { type: "p", texte: "Si quelqu'un d'autre que moi vous écrit depuis cette adresse, c'est que les choses se sont passées autrement que prévu. Dans ce cas, croyez cette personne." },
            { type: "p", texte: "Lena Brandt" },
        ],
    },

    {
        id: "b02",
        boite: "brouillons",
        de: { nom: "Moi", adresse: "lena.brandt@posteo.de" },
        a: "t.reh@mailbox.org",
        objet: "(sans objet)",
        t: "06/11 02:40",
        corps: [
            { type: "p", texte: "Je ne te dois rien." },
        ],
    },


    /* ====================== CORBEILLE ======================
       Elle n'a rien jeté : c'est une RÈGLE de messagerie, créée
       en avril depuis un ordinateur à Kiel, qui déplace ici tout
       ce qui vient de FamilySafe. Elle n'a jamais vu ces mails.
       ====================================================== */

    {
        id: "c01",
        boite: "corbeille",
        de: { nom: "FamilySafe", adresse: "billing@familysafe-app.com" },
        objet: "Votre reçu FamilySafe Premium — novembre",
        t: "01/11 04:12",
        indice: "recu_familysafe",
        corps: [
            { type: "p", texte: "Merci de votre confiance. Voici le reçu de votre abonnement." },
            {
                type: "recu",
                lignes: [
                    ["Formule", "FamilySafe Premium — suivi illimité"],
                    ["Appareil surveillé", "iPhone de Lena (iPhone 12 mini)"],
                    ["Appareil administrateur", "iPhone de Tobias"],
                    ["Titulaire du compte", "T. REH"],
                    ["Moyen de paiement", "Visa •••• 4417"],
                    ["Période", "01/11 → 30/11"],
                    ["Abonné depuis", "12 avril — 7e mois consécutif"],
                ],
                total: ["Montant prélevé", "4,99 €"],
            },
            { type: "p", texte: "Vous pouvez gérer votre abonnement depuis l'application. Rappel : le consentement de la personne surveillée est obligatoire dans votre pays." },
        ],
    },

    {
        id: "c02",
        boite: "corbeille",
        de: { nom: "FamilySafe", adresse: "billing@familysafe-app.com" },
        objet: "Votre reçu FamilySafe Premium — octobre",
        t: "01/10 04:12",
        corps: [
            { type: "p", texte: "Merci de votre confiance. Montant prélevé : 4,99 €. Visa •••• 4417." },
        ],
    },

    {
        id: "c03",
        boite: "corbeille",
        de: { nom: "FamilySafe", adresse: "support@familysafe-app.com" },
        objet: "Bienvenue sur FamilySafe !",
        t: "12/04 21:48",
        corps: [
            { type: "p", texte: "Votre appareil « iPhone de Lena » est maintenant lié à votre compte. Vous recevrez une alerte à chaque arrivée et chaque départ des lieux que vous définissez." },
            { type: "p", texte: "Conseil : l'icône de l'application peut être personnalisée pour plus de discrétion." },
        ],
    },
];


const BOITES_MAIL = [
    { id: "reception", nom: "Boîte de réception" },
    { id: "brouillons", nom: "Brouillons" },
    { id: "corbeille", nom: "Corbeille", pied: "Les éléments sont supprimés définitivement au bout de 30 jours." },
];


function mailsDeLaBoite(id) {
    return MAILS.filter(function (m) { return m.boite === id; })
        .sort(function (a, b) { return clefDeTri(b.t) - clefDeTri(a.t); });
}


function mailParId(id) {
    return MAILS.filter(function (m) { return m.id === id; })[0] || null;
}


/* L'aperçu de deux lignes dans la liste. */
function apercuDeMail(mail) {
    const textes = [];
    (mail.corps || []).forEach(function (bloc) {
        if (bloc.texte) textes.push(bloc.texte);
    });
    return apercu(textes.join(" "), 80);
}


function mailsNonLus() {
    return mailsDeLaBoite("reception").filter(function (m) {
        return !dejaLu("mail:" + m.id);
    }).length;
}
