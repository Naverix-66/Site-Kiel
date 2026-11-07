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
const OBJECTIFS = [
    {
        id: "o_mon_fil", acte: 1,
        titre: "Relire ce qu'elle m'a écrit",
        texte: "Le 8 novembre à 23 h 02, elle a écrit à un numéro qui n'était pas celui de Mira. C'était le mien.",
    },
    {
        id: "o_soiree", acte: 1,
        titre: "Savoir ce qu'elle faisait vraiment ce soir-là",
        texte: "Elle a dit à Mira qu'elle travaillait. Vérifier.",
    },
    {
        id: "o_chrono", acte: 1,
        titre: "Reconstituer la nuit du 8",
        texte: "Six traces, six applications différentes. Les remettre dans l'ordre.",
    },
    {
        id: "o_prive", acte: 2,
        titre: "Ouvrir l'album qu'elle a fermé",
        texte: "Un album « Privé » protégé par quatre chiffres. Elle a laissé l'indice dans ses notes.",
    },
    {
        id: "o_mouchard", acte: 2,
        titre: "Comprendre qui la regardait",
        texte: "Quelque chose, dans ce téléphone, savait toujours où elle était.",
    },
    {
        id: "o_fuite", acte: 2,
        titre: "Comprendre pourquoi elle est partie",
        texte: "Ce n'est pas une nuit qu'il faut regarder, c'est les trois semaines d'avant.",
    },
    {
        id: "o_eckernforde", acte: 3,
        titre: "Vérifier la piste de Mira",
        texte: "Mira est certaine qu'elle est chez sa grand-mère, à Eckernförde.",
    },
    {
        id: "o_lieu", acte: 3,
        titre: "Trouver où elle est",
        texte: "Elle n'a pas effacé les bonnes photos. Ou alors elle les a effacées exprès.",
    },
    {
        id: "o_questions", acte: 4,
        titre: "Lui prouver que je ne suis pas lui",
        texte: "Trois questions. Les réponses sont toutes dans ce téléphone.",
    },
    {
        id: "o_preuve", acte: 4,
        titre: "Envoyer la preuve à Me Vogt",
        texte: "Le journal de positions et le reçu d'abonnement. C'est ça qui vaut quelque chose.",
    },
];


/* ------------------------------------------------------------
   LES DÉDUCTIONS
   ------------------------------------------------------------
   question   : ce que le carnet demande
   consigne   : comment on répond
   paires     : toutes les combinaisons d'indices acceptées
                (on reste souple : plusieurs raisonnements
                justes valent mieux qu'un seul attendu)
   conclusion : ce que le carnet écrit quand c'est bon
   rate       : ce que Mira dit quand ça ne tient pas
   ------------------------------------------------------------ */
const DEDUCTIONS = [
    {
        id: "d_mensonge", acte: 1, objectif: "o_soiree",
        question: "Qu'est-ce qu'elle faisait, le soir du 8 ?",
        consigne: "Désigne les deux traces qui ne disent pas la même chose.",
        paires: [["sms_mensonge", "agenda_repos"], ["sms_mensonge", "photo_horn"]],
        conclusion: "Elle a menti à Mira sur sa soirée. Elle n'était pas au travail : elle était dehors, avec son appareil.",
        rate: "Ces deux-là vont dans le même sens. Cherche plutôt deux choses qui se contredisent.",
    },
    {
        id: "d_rentree", acte: 1,
        question: "Est-ce qu'elle est rentrée, cette nuit-là ?",
        consigne: "Deux traces suffisent à le prouver.",
        paires: [["sante_pas", "wifi_retour"], ["wifi_retour", "suppressions"], ["wifi_retour", "ecran_eteint"]],
        conclusion: "Elle est rentrée. 1 h 14, wifi de l'appartement. Elle n'a pas disparu dans le port : elle a dormi chez elle.",
        rate: "Pas assez. Il faut quelque chose qui prouve un lieu, pas seulement un mouvement.",
    },
    {
        id: "d_telephone_laisse", acte: 2,
        question: "Pourquoi laisser son téléphone derrière elle ?",
        consigne: "Relie ce qui suivait ses déplacements à ce qu'elle a fait en rentrant.",
        paires: [["mouchard", "suppressions"], ["journal_47", "suppressions"], ["mouchard", "ecran_eteint"], ["journal_47", "ecran_eteint"]],
        conclusion: "Un téléphone qui bouge, c'est une adresse. Elle a nettoyé ce qu'il ne devait pas voir, et elle l'a laissé là.",
        rate: "Il manque le pourquoi. Qu'est-ce qui, dans ce téléphone, la rendait trouvable ?",
    },
    {
        id: "d_pas_enleve", acte: 2,
        question: "Est-ce que Tobias l'a enlevée ?",
        consigne: "Deux traces disent que non.",
        paires: [
            ["journal_47", "tobias_ecrit_apres"],
            ["appareil_jumele", "tobias_ecrit_apres"],
            ["journal_domicile", "tobias_ecrit_apres"],
            ["journal_domicile", "mouchard"],
        ],
        conclusion: "Non. Il la croyait chez elle, et il lui écrit encore le 14. On n'écrit pas à quelqu'un qu'on a enlevé.",
        rate: "Ça ne répond pas à la question. Qu'est-ce qu'il a fait APRÈS le 8 ?",
    },
    {
        id: "d_fuite", acte: 2, objectif: "o_fuite",
        question: "Qu'est-ce qu'elle préparait ?",
        consigne: "Deux préparatifs, dans les trois semaines d'avant.",
        paires: [
            ["rdv_avocate", "retraits"],
            ["rdv_avocate", "jonas_argent"],
            ["retraits", "jonas_argent"],
            ["brouillon_avocate", "retraits"],
            ["brouillon_avocate", "rdv_avocate"],
            ["objectif_vendu", "retraits"],
            ["objectif_vendu", "jonas_argent"],
            ["bus_501", "retraits"],
            ["liste_courses", "retraits"],
            ["liste_courses", "jonas_argent"],
            ["liste_courses", "objectif_vendu"],
            ["liste_courses", "bus_501"],
            ["conseils_avocate", "retraits"],
            ["conseils_avocate", "liste_courses"],
            ["plan_du_coffre", "liste_courses"],
            ["plan_du_coffre", "retraits"],
            ["plan_du_coffre", "conseils_avocate"],
        ],
        conclusion: "Un départ. Une avocate, de l'argent liquide, du matériel vendu. Ce n'est pas une disparition : c'est une fuite, préparée.",
        rate: "Ce sont des faits, mais ils ne racontent pas un projet. Cherche ce qui coûte de l'argent et ce qui en rapporte.",
    },
    {
        id: "d_eckernforde", acte: 3, objectif: "o_eckernforde",
        question: "Est-elle chez sa grand-mère, à Eckernförde ?",
        consigne: "Une seule trace suffit à casser cette piste — trouve-la, avec ce qu'elle laisse à la place.",
        paires: [["mail_hanne_maison", "mail_hanne_cabane"], ["mail_hanne_maison", "note_endroits"], ["mail_hanne_maison", "photo_imprimee"]],
        conclusion: "Impossible : la maison est vendue depuis mai. Mais dans le même mail, Hanne parle d'autre chose qu'elle n'a pas vendu.",
        rate: "Mira y croit dur comme fer. Pour lui dire non, il faut une preuve que la maison n'est plus à eux.",
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
        texte: "Commence par le début : ouvre Messages, et cherche ton propre numéro. C'est le dernier fil de la nuit du 8.",
    },
    {
        quand: function () { return !ENQUETE.a("agenda_repos"); },
        texte: "Elle a dit à Mira qu'elle travaillait ce soir-là. Regarde son agenda, pour voir si c'est vrai.",
    },
    {
        quand: function () { return !ENQUETE.a("sante_pas") || !ENQUETE.a("wifi_retour"); },
        texte: "Un téléphone compte les pas et note les wifi auxquels il se connecte. Santé, puis Réglages → Wi-Fi.",
    },
    {
        quand: function () { return !ETAT.chronoValidee; },
        texte: "Ouvre le carnet, onglet Chronologie : il faut remettre les six traces de la nuit dans l'ordre.",
    },
    {
        quand: function () { return !ENQUETE.a("note_code"); },
        texte: "Elle a laissé une note bizarre, sans titre. Elle explique comment ouvrir ce qui est fermé.",
    },
    {
        quand: function () { return !estOuvert("albumPrive"); },
        texte: "« L'heure de la photo que je préfère » : dans Photos, l'album Favoris ne contient qu'une image. Regarde l'heure de prise de vue — c'est le code.",
    },
    {
        quand: function () { return !ENQUETE.a("capture_code_tobias"); },
        texte: "Dans l'album Privé, il y a une capture où on voit Tobias déverrouiller son propre téléphone. Son code y est lisible.",
    },
    {
        quand: function () { return !estOuvert("mouchard"); },
        texte: "Il y a deux calculatrices sur cet écran d'accueil. Pourquoi deux ? Le dossier Utilitaires. Le code, c'est le sien : 1908.",
    },
    {
        quand: function () { return !ENQUETE.a("recu_familysafe"); },
        texte: "Un abonnement, ça se paie, et ça laisse un reçu. Regarde dans la corbeille de sa boîte mail.",
    },
    {
        quand: function () { return !ETAT.deductions.d_fuite; },
        texte: "Regarde novembre dans son agenda, et les mails de sa banque. Quelqu'un qui part prépare deux choses : du liquide, et une avocate.",
    },
    {
        quand: function () { return !ETAT.deductions.d_eckernforde; },
        texte: "Mira se trompe sur Eckernförde, et c'est sa propre grand-mère qui l'écrit : relis le mail de Hanne, en mai.",
    },
    {
        quand: function () { return !ETAT.epinglePosee; },
        texte: "Les trois photos supprimées sont du 3 juillet, comme celle que tu as dans la main. Bülk. Pose l'épingle là, dans Plans.",
    },
    {
        quand: function () { return true; },
        texte: "Relis le fil où elle t'écrit. Tout ce qu'elle a laissé, elle l'a laissé pour quelqu'un qui lirait jusqu'au bout.",
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
        OS.toast("Noté : " + apercu(INDICES[id].quoi, 44));

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
            OS.toast(nouveaux === 1
                ? "Noté : " + apercu(INDICES[liste[0]].quoi, 40)
                : nouveaux + " nouvelles notes dans le carnet");
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

    /* --- les déductions de l'acte en cours, pas encore faites --- */
    deductionsOuvertes: function () {
        return DEDUCTIONS.filter(function (d) {
            if (ETAT.deductions[d.id]) return false;
            if (d.acte > ETAT.acte) return false;

            // on ne pose la question que si la joueuse a de quoi
            // y répondre : au moins une paire entièrement trouvée
            return d.paires.some(function (paire) {
                return paire.every(function (id) { return ENQUETE.a(id); });
            });
        });
    },

    deductionsFaites: function () {
        return DEDUCTIONS.filter(function (d) { return ETAT.deductions[d.id]; });
    },

    /* --- valider une déduction : le geste central du jeu --- */
    valider: function (idDeduction, deuxIndices) {

        const deduction = DEDUCTIONS.filter(function (d) { return d.id === idDeduction; })[0];
        if (!deduction) return { bon: false, texte: "" };

        const a = deuxIndices[0];
        const b = deuxIndices[1];

        const bon = deduction.paires.some(function (paire) {
            return (paire[0] === a && paire[1] === b) || (paire[0] === b && paire[1] === a);
        });

        if (bon) {
            ETAT.deductions[idDeduction] = true;
            if (deduction.objectif) this.remplirObjectif(deduction.objectif);
            sauvegarder();
            SONS.succes();

            if (typeof SCENARIO !== "undefined") SCENARIO.deductionFaite(idDeduction);

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
