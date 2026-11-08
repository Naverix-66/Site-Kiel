/* ============================================================
   LE MOTEUR D'ENQUÊTE
   ============================================================
   C'est ici que vit le JEU, par opposition au téléphone (qui
   n'est qu'une interface).

   Le principe, et c'est tout le pari de ce mois :

     - les INDICES se ramassent TOUT SEULS. Si la joueuse a lu
       le message, vu la photo, ouvert le reçu, c'est noté. On
       ne cache rien derrière un pixel de 3 px.

     - le jeu, ce n'est pas de trouver : c'est de RELIER. Une
       déduction se valide en désignant les deux traces qui, mises
       côte à côte, prouvent quelque chose qu'aucune des deux ne
       dit toute seule. Un SMS dit « je bosse ce soir » ; l'agenda
       dit « repos ». Séparément : rien. Ensemble : un mensonge.

     - on ne peut jamais être bloquée. AIDES contient, dans
       l'ordre, ce que Mira finit par souffler.
   ============================================================ */


/* ------------------------------------------------------------
   LES INDICES
   ------------------------------------------------------------
   quoi  : la phrase qui s'écrit dans le carnet. C'est un CONSTAT,
           jamais une interprétation.
   ou    : d'où elle vient (ça compte : la joueuse doit pouvoir
           y retourner).
   quand : l'heure dans l'histoire, s'il y en a une.
   app   : pour l'icône, et pour pouvoir y retourner d'un appui.
   ------------------------------------------------------------ */
const INDICES = {

    /* ---------- acte I : la nuit du 8 ---------- */

    sms_mensonge: {
        acte: 1, app: "messages", quand: "08/11 19:42",
        quoi: "« Je bosse tard, ne m'attends pas. »",
        ou: "Messages → Mira",
    },
    agenda_repos: {
        acte: 1, app: "calendrier", quand: "08/11",
        quoi: "Le 8 novembre, elle était en repos. Aucun service.",
        ou: "Calendrier → semaine du 8",
    },
    photo_horn: {
        acte: 1, app: "photos", quand: "08/11 22:10",
        quoi: "Elle photographie la Hörnbrücke dans le brouillard.",
        ou: "Photos → Pellicule",
    },
    appel_tobias: {
        acte: 1, app: "telephone", quand: "08/11 22:48",
        quoi: "Appel de Tobias. Décroché, puis coupé au bout de 3 secondes.",
        ou: "Téléphone → Récents",
    },
    sms_tobias_nuit: {
        acte: 1, app: "messages", quand: "08/11 22:49",
        quoi: "Tobias : « pourquoi tu raccroches ».",
        ou: "Messages → Tobias",
    },
    sms_a_moi: {
        acte: 1, app: "messages", quand: "08/11 23:02",
        quoi: "Le message qu'elle m'a envoyé par erreur : elle croyait écrire à Mira.",
        ou: "Messages → mon numéro",
    },
    lena_reponse: {
        acte: 1, app: "messages", quand: "08/11 23:19",
        quoi: "Sa dernière phrase à moi : « Non. Mais merci d'avoir répondu. »",
        ou: "Messages → mon numéro",
    },
    sante_pas: {
        acte: 1, app: "sante", quand: "08/11 23:51",
        quoi: "4 212 pas entre 23 h 51 et 1 h 08. Elle a marché longtemps.",
        ou: "Santé → Activité du 8",
    },
    wifi_retour: {
        acte: 1, app: "reglages", quand: "09/11 01:14",
        quoi: "À 1 h 14, le téléphone se reconnecte au wifi de l'appartement.",
        ou: "Réglages → Wi-Fi",
    },
    suppressions: {
        acte: 1, app: "photos", quand: "09/11 01:20",
        quoi: "À 1 h 20, trois photos supprimées d'un coup.",
        ou: "Photos → Récemment supprimés",
    },
    ecran_eteint: {
        acte: 1, app: "reglages", quand: "09/11 05:36",
        quoi: "Plus un seul déverrouillage après 5 h 36. Le téléphone est posé.",
        ou: "Réglages → Temps d'écran",
    },
    police_classe: {
        acte: 1, app: "mail", quand: "19/11",
        quoi: "La police a classé : majeure, aucun signe de violence, départ volontaire.",
        ou: "Mail → Boîte de réception",
    },

    /* ---------- acte II : celui qui regardait ---------- */

    note_code: {
        acte: 2, app: "notes",
        quoi: "« Pour ouvrir ce qui est fermé : l'heure de la photo que je préfère. »",
        ou: "Notes → sans titre",
    },
    photo_favorite: {
        acte: 2, app: "photos", quand: "03/07 21:04",
        quoi: "Une seule photo a un cœur. Elle a été prise à 21 h 04.",
        ou: "Photos → Favoris",
    },
    capture_3h: {
        acte: 2, app: "photos", quand: "02/10 03:12",
        quoi: "Elle gardait des captures : 14 messages de Tobias entre 3 h et 3 h 40.",
        ou: "Photos → album Privé",
    },
    capture_fleurs: {
        acte: 2, app: "photos", quand: "18/10",
        quoi: "Des fleurs livrées devant une porte dont elle n'avait donné l'adresse à personne.",
        ou: "Photos → album Privé",
    },
    capture_code_tobias: {
        acte: 2, app: "photos",
        quoi: "Sur une capture, il tape son code devant elle : 1908.",
        ou: "Photos → album Privé",
    },
    deux_calculettes: {
        acte: 2, app: "calculette",
        quoi: "Il y a deux calculatrices dans le dossier Utilitaires.",
        ou: "Écran d'accueil → Utilitaires",
    },
    mouchard: {
        acte: 2, app: "calculette",
        quoi: "La deuxième calculatrice n'en est pas une : c'est FamilySafe, un traceur.",
        ou: "Utilitaires → Calculette",
    },
    journal_47: {
        acte: 2, app: "calculette",
        quoi: "Un journal de positions, minute par minute. Mais seulement sur 30 jours : rien avant le 20 octobre.",
        ou: "FamilySafe → Journal",
    },
    journal_domicile: {
        acte: 2, app: "calculette",
        quoi: "Après le 9 novembre à 5 h 36, le journal répète « Domicile » pendant trois jours.",
        ou: "FamilySafe → Journal",
    },
    appareil_jumele: {
        acte: 2, app: "calculette",
        quoi: "L'appareil qui reçoit les positions s'appelle « iPhone de Tobias ».",
        ou: "FamilySafe → Réglages",
    },
    recu_familysafe: {
        acte: 2, app: "mail", quand: "01/11",
        quoi: "L'abonnement est payé par T. Reh, carte se terminant par 4417.",
        ou: "Mail → Corbeille",
    },
    regle_mail: {
        acte: 2, app: "reglages", quand: "12/04",
        quoi: "Une règle créée le 12 avril efface automatiquement les mails de FamilySafe.",
        ou: "Réglages → Mail → Règles",
    },
    rdv_avocate: {
        acte: 2, app: "calendrier", quand: "04/11 11:00",
        quoi: "Rendez-vous le 4 novembre : « Me Vogt — 11 h ». Sans intitulé.",
        ou: "Calendrier → novembre",
    },
    brouillon_avocate: {
        acte: 2, app: "mail",
        quoi: "Un mail à Me Vogt, écrit et jamais envoyé.",
        ou: "Mail → Brouillons",
    },
    retraits: {
        acte: 2, app: "mail", quand: "02/11",
        quoi: "600 € retirés en liquide, en trois fois, en dix jours.",
        ou: "Mail → Boîte de réception",
    },
    jonas_argent: {
        acte: 2, app: "messages", quand: "26/10",
        quoi: "Elle a demandé de l'argent liquide à son frère, sans dire pourquoi.",
        ou: "Messages → Jonas",
    },
    ex_profil: {
        acte: 2, app: "fjordgram",
        quoi: "Son profil à lui : 38 abonnés, 412 abonnements. Il suit tout son entourage à elle, un par un.",
        ou: "Fjordgram → @t.reh",
    },
    ex_cherche_aussi: {
        acte: 2, app: "fjordgram", quand: "14/11",
        quoi: "Le 14 novembre, il publie « si quelqu'un l'a vue ». Il la cherche aussi.",
        ou: "Fjordgram → @t.reh",
    },
    video_sauvee: {
        acte: 2, app: "kiek", quand: "06/11",
        quoi: "Elle a enregistré une vidéo : « 3 signes que ton téléphone est suivi ».",
        ou: "Kiek → Enregistrées",
    },
    video_partir: {
        acte: 2, app: "kiek", quand: "06/11",
        quoi: "Et une autre : « partir sans laisser d'adresse — le téléphone reste ».",
        ou: "Kiek → Enregistrées",
    },
    liste_courses: {
        acte: 2, app: "notes", quand: "06/11",
        quoi: "Liste de courses du 6 novembre : croquettes, caisse de transport, carte SIM prépayée.",
        ou: "Notes → courses",
    },
    conseils_avocate: {
        acte: 2, app: "notes", quand: "04/11",
        quoi: "L'avocate lui a dit : ne le confronte pas, ne préviens personne, et garde le logiciel comme preuve.",
        ou: "Notes → Me Vogt",
    },
    plan_du_coffre: {
        acte: 2, app: "notes", quand: "07/11",
        quoi: "Sa liste de départ, écrite la veille : ce qu'elle emporte, ce qu'elle laisse. Le téléphone en majuscules.",
        ou: "Notes → Coffre",
    },
    recherches_web: {
        acte: 2, app: "safari", quand: "06/11",
        quoi: "Ses recherches : « savoir si mon téléphone est suivi », « supprimer familysafe ».",
        ou: "Safari → Historique",
    },
    tobias_ecrit_apres: {
        acte: 2, app: "messages", quand: "14/11",
        quoi: "Tobias lui écrit encore le 14. Il la cherche aussi.",
        ou: "Messages → Tobias",
    },

    /* ---------- acte III : où ---------- */

    photo_imprimee: {
        acte: 3, app: "carnet",
        quoi: "Au dos de la photo de l'enveloppe : « Bülk, 03.07 — le jour où j'ai compris ».",
        ou: "L'enveloppe",
    },
    photos_supprimees: {
        acte: 3, app: "photos", quand: "03/07",
        quoi: "Les trois photos supprimées datent du 3 juillet : un phare, une porte bleue, une clé.",
        ou: "Photos → Récemment supprimés",
    },
    mail_hanne_maison: {
        acte: 3, app: "mail", quand: "14/05",
        quoi: "La maison d'Eckernförde est vendue depuis mai.",
        ou: "Mail → Oma",
    },
    mail_hanne_cabane: {
        acte: 3, app: "mail", quand: "14/05",
        quoi: "« la cabane je ne la vends pas la clé est sous la troisième pierre »",
        ou: "Mail → Oma",
    },
    note_endroits: {
        acte: 3, app: "notes",
        quoi: "Une liste : « les endroits où personne ne pense à regarder ». Un B. souligné trois fois.",
        ou: "Notes",
    },
    post_strande: {
        acte: 3, app: "fjordgram", quand: "03/07",
        quoi: "Un post géotagué Strande : « ici, je respire ».",
        ou: "Fjordgram → ses publications",
    },
    bus_501: {
        acte: 3, app: "safari", quand: "06/11",
        quoi: "Elle a consulté les horaires du bus 501 pour Strande. Le 6 novembre.",
        ou: "Safari → Historique",
    },
    chat_parti: {
        acte: 3, app: "messages", quand: "19/11",
        quoi: "La gamelle, la caisse et le chat ont disparu de l'appartement.",
        ou: "Messages → Mira",
    },
    objectif_vendu: {
        acte: 3, app: "mail", quand: "28/10",
        quoi: "Elle a vendu un objectif 400 € en liquide, remise en main propre.",
        ou: "Mail → Boîte de réception",
    },
    nom_du_chat: {
        acte: 3, app: "mail", quand: "12/09",
        quoi: "Le chat s'appelle Keks. Vacciné en septembre.",
        ou: "Mail → Cabinet vétérinaire",
    },

    /* ---------- acte IV ---------- */

    compte_nebel: {
        acte: 4, app: "messages",
        quoi: "Un compte sans nom écrit trois mots : « Qui es-tu ? »",
        ou: "Messages",
    },
};


/* ------------------------------------------------------------
   LES OBJECTIFS
   ------------------------------------------------------------
   Ce qui s'affiche en haut du carnet : « voilà ce que tu
   cherches maintenant ». Un objectif se remplit soit par une
   déduction, soit par un évènement du scénario.
   ------------------------------------------------------------ */
/* Chaque objectif tient en UNE phrase et sait où il faut aller :
   le carnet affiche un bouton qui ouvre directement le bon
   endroit. Personne ne doit jamais se demander « et maintenant
   je fais quoi ? ». */
const OBJECTIFS = [
    {
        id: "o_mon_fil", acte: 1,
        titre: "Lire ce qu'elle m'a écrit",
        texte: "Dans Messages, le fil « Numéro inconnu ». C'est moi.",
        cible: { app: "messages", fil: "klara", bouton: "Ouvrir le fil" },
    },
    {
        id: "o_soiree", acte: 1,
        titre: "Travaillait-elle vraiment ce soir-là ?",
        texte: "Elle l'a dit à Mira. Son agenda le dira aussi.",
        cible: { app: "calendrier", bouton: "Ouvrir l'agenda" },
    },
    {
        id: "o_chrono", acte: 1,
        titre: "Remettre la nuit du 8 dans l'ordre",
        texte: "Six traces à classer, onglet « Nuit du 8 ».",
        cible: { onglet: "chrono", bouton: "Aller à la chronologie" },
    },
    {
        id: "o_prive", acte: 2,
        titre: "Ouvrir l'album « Privé »",
        texte: "Quatre chiffres. L'explication est dans ses notes.",
        cible: { app: "photos", bouton: "Ouvrir Photos" },
    },
    {
        id: "o_mouchard", acte: 2,
        titre: "Trouver ce qui la suivait",
        texte: "Quelque chose, ici, savait toujours où elle était.",
        cible: { app: "reglages", bouton: "Ouvrir Réglages" },
    },
    {
        id: "o_fuite", acte: 2,
        titre: "Comprendre pourquoi elle est partie",
        texte: "Regarder les trois semaines d'avant, pas la nuit.",
        cible: { onglet: "conclusions", bouton: "Aller aux conclusions" },
    },
    {
        id: "o_eckernforde", acte: 3,
        titre: "Vérifier la piste de Mira",
        texte: "Elle jure qu'elle est chez sa grand-mère.",
        cible: { app: "mail", bouton: "Ouvrir Mail" },
    },
    {
        id: "o_lieu", acte: 3,
        titre: "Trouver où elle est",
        texte: "Poser l'épingle sur la carte.",
        cible: { app: "plans", bouton: "Ouvrir Plans" },
    },
    {
        id: "o_questions", acte: 4,
        titre: "Répondre à ses trois questions",
        texte: "Les réponses sont toutes dans ce téléphone.",
        cible: { app: "messages", fil: "nebel", bouton: "Lui répondre" },
    },
    {
        id: "o_preuve", acte: 4,
        titre: "Envoyer la preuve à Me Vogt",
        texte: "Le reçu d'abonnement, dans la corbeille de sa boîte mail.",
        cible: { app: "mail", bouton: "Ouvrir Mail" },
    },
];


/* ------------------------------------------------------------
   LES DÉDUCTIONS
   ------------------------------------------------------------
   ⚠️ REFONTE. Avant, on choisissait deux traces dans une liste,
   dans le carnet. C'était une corvée d'écran : beaucoup de
   texte, un écran de plus, et la joueuse se demandait ce qu'on
   attendait d'elle.

   Maintenant, c'est MIRA qui pose la question, dans la
   conversation, dès que la joueuse a de quoi répondre. On
   choisit une réponse courte, comme on répondrait à une amie.
   Zéro interface en plus, et on réfléchit autant.

   requis     : les traces à avoir trouvées pour que Mira demande
   question   : ce qu'elle écrit
   reponses   : deux ou trois répliques, une seule juste
   conclusion : la phrase qui s'inscrit dans le carnet
   rate       : ce qu'elle répond si on se trompe (jamais puni :
                elle redemande)
   ------------------------------------------------------------ */
const DEDUCTIONS = [
    {
        id: "d_mensonge", acte: 1, objectif: "o_soiree",
        requis: ["sms_mensonge", "agenda_repos"],
        question: "alors ? elle bossait vraiment ce soir-là ?",
        reponses: [
            { id: "m1", txt: "Non. Elle était en repos.", bonne: true },
            { id: "m2", txt: "Oui, elle avait un service." },
            { id: "m3", txt: "Impossible à savoir." },
        ],
        conclusion: "Le 8, elle était en repos. Elle a menti à Mira sur sa soirée.",
        rate: "regarde son agenda, au 8.",
    },
    {
        id: "d_rentree", acte: 1,
        requis: ["sante_pas", "wifi_retour"],
        question: "et elle est rentrée, ou pas ?",
        reponses: [
            { id: "r1", txt: "Oui. 1 h 14, wifi de l'appartement.", bonne: true },
            { id: "r2", txt: "Non, elle n'est jamais revenue." },
            { id: "r3", txt: "Elle a pris le dernier bateau." },
        ],
        conclusion: "Elle est rentrée à 1 h 14. Elle n'a pas disparu dehors.",
        rate: "dans Réglages, le wifi garde l'heure de la dernière connexion.",
    },
    {
        id: "d_telephone_laisse", acte: 2,
        requis: ["mouchard", "suppressions"],
        question: "pourquoi laisser son téléphone, alors ?",
        reponses: [
            { id: "t1", txt: "Parce qu'il la rendait trouvable.", bonne: true },
            { id: "t2", txt: "Elle l'a oublié, c'est tout." },
            { id: "t3", txt: "Pour qu'on le trouve et qu'on cherche." },
        ],
        conclusion: "Elle a laissé le téléphone exprès : un téléphone qui bouge, c'est une adresse.",
        rate: "qu'est-ce qu'il y avait dessus qui la suivait ?",
    },
    {
        id: "d_pas_enleve", acte: 2,
        requis: ["tobias_ecrit_apres", "journal_domicile"],
        question: "c'est lui qui l'a prise, hein ? dis-moi que c'est lui.",
        reponses: [
            { id: "p1", txt: "Non. Il la cherche aussi.", bonne: true },
            { id: "p2", txt: "Oui, tout l'accuse." },
            { id: "p3", txt: "Il l'a suivie jusqu'au port." },
        ],
        conclusion: "Ce n'est pas lui : il la croyait chez elle, et il lui écrit encore le 14.",
        rate: "relis ce qu'il lui écrit APRÈS le 8. On n'écrit pas à quelqu'un qu'on a enlevé.",
    },
    {
        id: "d_fuite", acte: 2, objectif: "o_fuite",
        requis: ["rdv_avocate", "retraits"],
        question: "une avocate, 600 € en liquide… qu'est-ce qu'elle préparait ?",
        reponses: [
            { id: "f1", txt: "Son départ. Depuis des semaines.", bonne: true },
            { id: "f2", txt: "Un procès contre lui." },
            { id: "f3", txt: "Un voyage." },
        ],
        conclusion: "Ce n'est pas une disparition, c'est une fuite préparée.",
        rate: "une procédure prend deux ans. Elle, elle a acheté une caisse de transport pour un chat.",
    },
    {
        id: "d_eckernforde", acte: 3, objectif: "o_eckernforde",
        requis: ["mail_hanne_maison"],
        question: "elle est chez sa grand-mère à Eckernförde, c'est sûr. non ?",
        reponses: [
            { id: "e1", txt: "Non, la maison est vendue depuis mai.", bonne: true },
            { id: "e2", txt: "Oui, allons-y." },
            { id: "e3", txt: "Sa grand-mère l'aurait dit." },
        ],
        conclusion: "Pas Eckernförde : la maison est vendue. Mais Hanne parle d'une cabane.",
        rate: "le mail d'Oma, en mai. Jusqu'au bout.",
    },
];


/* ------------------------------------------------------------
   LES AIDES
   ------------------------------------------------------------
   Lues dans l'ordre : la première dont la condition est vraie
   est celle que Mira souffle. C'est le filet de sécurité du
   jeu : on ne peut jamais rester coincée.
   ------------------------------------------------------------ */
const AIDES = [
    {
        quand: function () { return !ENQUETE.a("sms_a_moi"); },
        texte: "Ouvre Messages, fil « Numéro inconnu ». C'est vous deux.",
    },
    {
        quand: function () { return !ENQUETE.a("agenda_repos"); },
        texte: "Son agenda. Regarde le 8 novembre.",
    },
    {
        quand: function () { return !ENQUETE.a("sante_pas"); },
        texte: "Santé. Un téléphone compte les pas, même la nuit.",
    },
    {
        quand: function () { return !ENQUETE.a("wifi_retour"); },
        texte: "Réglages → Wi-Fi. L'heure de la dernière connexion.",
    },
    {
        quand: function () { return !ETAT.chronoValidee; },
        texte: "Carnet → Nuit du 8. Les six traces, dans l'ordre.",
    },
    {
        quand: function () { return !ENQUETE.a("note_code"); },
        texte: "Dans Notes, il y en a une sans titre. Lis-la.",
    },
    {
        quand: function () { return !estOuvert("albumPrive"); },
        texte: "Photos → Favoris. Une seule photo. Son heure, c'est le code.",
    },
    {
        quand: function () { return !ENQUETE.a("capture_code_tobias"); },
        texte: "Dans l'album Privé, une capture montre son code à lui.",
    },
    {
        quand: function () { return !estOuvert("mouchard"); },
        texte: "Deux calculatrices dans Utilitaires. La deuxième n'en est pas une.",
    },
    {
        quand: function () { return !ENQUETE.a("recu_familysafe"); },
        texte: "Mail → Corbeille. Un abonnement, ça laisse un reçu.",
    },
    {
        quand: function () { return !ETAT.deductions.d_fuite; },
        texte: "Son agenda de novembre, et les mails de la banque.",
    },
    {
        quand: function () { return !ETAT.deductions.d_eckernforde; },
        texte: "Mail → le message d'Oma, en mai. Mira se trompe.",
    },
    {
        quand: function () { return !ETAT.epinglePosee; },
        texte: "Bülk. Comme au dos de ta photo. Pose l'épingle dans Plans.",
    },
    {
        quand: function () { return true; },
        texte: "Relis votre fil à toutes les deux. Tout est parti de là.",
    },
];


/* ============================================================
   LE MOTEUR
   ============================================================ */
const ENQUETE = {

    /* --- un indice entre dans le carnet --- */
    trouver: function (id) {
        if (!INDICES[id]) {
            if (DEV) console.warn("Indice inconnu :", id);
            return false;
        }

        if (ETAT.indices.indexOf(id) !== -1) return false;

        ETAT.indices.push(id);
        sauvegarder();

        SONS.indice();
        OS.toast("Noté dans le carnet", { duree: 1700 });

        // Le scénario peut réagir à un indice précis.
        if (typeof SCENARIO !== "undefined") SCENARIO.indiceTrouve(id);

        return true;
    },

    /* --- plusieurs d'un coup (une page qui en contient trois) --- */
    trouverPlusieurs: function (liste) {
        let nouveaux = 0;
        const self = this;

        (liste || []).forEach(function (id) {
            if (ETAT.indices.indexOf(id) !== -1) return;
            if (!INDICES[id]) return;
            ETAT.indices.push(id);
            nouveaux++;
            if (typeof SCENARIO !== "undefined") SCENARIO.indiceTrouve(id);
        });

        if (nouveaux > 0) {
            sauvegarder();
            SONS.indice();
            OS.toast(nouveaux === 1 ? "Noté dans le carnet" : nouveaux + " traces notées",
                { duree: 1700 });
        }

        void self;
        return nouveaux;
    },

    /* --- est-ce qu'on a cet indice ? --- */
    a: function (id) {
        return ETAT.indices.indexOf(id) !== -1;
    },

    /* --- la liste des indices trouvés, objets complets --- */
    liste: function () {
        return ETAT.indices.map(function (id) {
            const indice = INDICES[id] || { quoi: id, ou: "?" };
            return {
                id: id,
                quoi: indice.quoi,
                ou: indice.ou,
                quand: indice.quand || "",
                app: indice.app,
                acte: indice.acte,
            };
        });
    },

    /* --- les objectifs visibles (ceux de l'acte en cours et avant) --- */
    objectifs: function () {
        return OBJECTIFS.filter(function (o) {
            return o.acte <= ETAT.acte;
        });
    },

    objectifFait: function (id) {
        return ETAT.objectifs[id] === true;
    },

    remplirObjectif: function (id) {
        if (ETAT.objectifs[id]) return false;
        ETAT.objectifs[id] = true;
        sauvegarder();
        return true;
    },

    /* --- les questions que Mira peut poser maintenant --- */
    deductionsOuvertes: function () {
        return DEDUCTIONS.filter(function (d) {
            if (ETAT.deductions[d.id]) return false;
            if (d.acte > ETAT.acte) return false;

            // on ne demande que si la joueuse a de quoi répondre
            return d.requis.every(function (id) { return ENQUETE.a(id); });
        });
    },

    deductionsFaites: function () {
        return DEDUCTIONS.filter(function (d) { return ETAT.deductions[d.id]; });
    },

    deduction: function (id) {
        return DEDUCTIONS.filter(function (d) { return d.id === id; })[0] || null;
    },

    /* --- valider une réponse donnée dans la conversation --- */
    repondre: function (idDeduction, idReponse) {

        const deduction = this.deduction(idDeduction);
        if (!deduction) return { bon: false, texte: "" };

        const reponse = deduction.reponses.filter(function (r) { return r.id === idReponse; })[0];

        if (reponse && reponse.bonne) {
            ETAT.deductions[idDeduction] = true;
            if (deduction.objectif) this.remplirObjectif(deduction.objectif);
            sauvegarder();
            SONS.succes();
            return { bon: true, texte: deduction.conclusion };
        }

        SONS.echec();
        return { bon: false, texte: deduction.rate };
    },

    /* --- le coup de main de Mira --- */
    aide: function () {
        for (let i = 0; i < AIDES.length; i++) {
            if (AIDES[i].quand()) return AIDES[i].texte;
        }
        return AIDES[AIDES.length - 1].texte;
    },

    /* --- où on en est, en pourcentage (pour le carnet) --- */
    progression: function () {
        const total = Object.keys(INDICES).length;
        return Math.round((ETAT.indices.length / total) * 100);
    },
};
