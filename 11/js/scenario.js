/* ============================================================
   LE SCÉNARIO
   ============================================================
   Le chef d'orchestre. Il écoute ce que fait la joueuse
   (ouvrir une app, lire un fil, trouver un indice, valider une
   déduction) et il décide quand Mira parle, quand un acte
   change, et quand Lena répond enfin.

   Une SCÈNE, c'est :
       id       : pour ne jamais la rejouer
       quand()  : la condition qui la déclenche
       suite    : la liste des répliques, dans l'ordre
       question : les réponses proposées à la joueuse (facultatif)
       apres()  : ce qui se passe à la fin (changer d'acte…)

   Règle de mise en scène : Mira n'écrit jamais deux pavés d'un
   coup. Elle écrit court, elle se reprend, elle envoie trois
   messages là où un seul suffirait. C'est comme ça qu'on écrit
   vraiment à 2 h du matin.
   ============================================================ */

const SCENARIO = {

    ecritDans: null,        // le fil où « … » s'affiche
    enCours: null,          // la question posée à la joueuse
    sceneEnCours: false,    // pour ne pas jouer deux scènes à la fois
    dernierIndice: Date.now(),
    derniereAide: 0,


    /* ========================================================
       DÉMARRAGE
       ======================================================== */
    demarrer: function () {

        this.reprise();

        // Le filet de sécurité : si rien n'a été trouvé depuis un
        // moment, Mira finit par souffler quelque chose.
        setInterval(function () { SCENARIO.verifierSiOnPatine(); }, 20000);

        plusTard(function () { SCENARIO.verifier(); }, 900);
    },


    /* --------------------------------------------------------
       reprise()
       --------------------------------------------------------
       Les questions posées à la joueuse ne sont PAS sauvegardées
       (ce sont des fonctions, ça ne se range pas dans un JSON).
       Si la page est rechargée au mauvais moment, une question
       peut donc se perdre — et avec elle un changement d'acte.

       Cette fonction répare tout ça au démarrage, en partant de
       ce qui est vrai dans l'état : si la chronologie est
       validée, l'acte II est forcément commencé, etc.
       Comme ça, recharger la page ne peut jamais bloquer une
       partie.
       -------------------------------------------------------- */
    reprise: function () {

        if (ETAT.chronoValidee && ETAT.acte < 2) ETAT.acte = 2;
        if (ETAT.deductions.d_fuite && ETAT.acte < 3) ETAT.acte = 3;
        if (ETAT.epinglePosee === "bulk" && ETAT.acte < 4) ETAT.acte = 4;
        if (ETAT.preuvesEnvoyees && ETAT.acte < 5) ETAT.acte = 5;

        sauvegarder();

        // Une question de Lena restée en l'air : on la repose.
        if (ETAT.acte >= 4 && etapeFaite("s10_nebel") && ETAT.questionsLenaRepondues.length < 3) {
            const dejaRepondues = ETAT.questionsLenaRepondues.length;

            plusTard(function () {
                if (dejaRepondues === 0) poserQuestionUne();
                else if (dejaRepondues === 1) poserQuestionDeux();
                else poserQuestionTrois();
            }, 1800);
        }
    },


    /* ========================================================
       LES ÉVÈNEMENTS QUE LE JEU LUI ENVOIE
       ======================================================== */
    appOuverte: function () {
        this.verifier();
    },

    filOuvert: function (idFil) {
        if (idFil === "klara") ETAT.lus["fil:klara:lu"] = true;
        sauvegarder();
        this.verifier();
    },

    indiceTrouve: function () {
        this.dernierIndice = Date.now();
        plusTard(function () { SCENARIO.verifier(); }, 1200);
    },

    deductionFaite: function () {
        plusTard(function () { SCENARIO.verifier(); }, 700);
    },

    chronoValidee: function () {
        plusTard(function () { SCENARIO.verifier(); }, 500);
    },

    epingleTrouvee: function () {
        plusTard(function () { SCENARIO.verifier(); }, 500);
    },

    epingleRatee: function (idLieu) {
        const lieu = lieuParId(idLieu);
        if (!lieu) return;

        this.envoyer("mira", "ok. donc pas " + lieu.nom + ".");
        plusTard(function () { SCENARIO.verifier(); }, 1500);
    },


    /* ========================================================
       LE MOTEUR DE SCÈNES
       ======================================================== */
    verifier: function () {

        // Les actes avancent TOUJOURS, même si Mira attend une
        // réponse qui ne vient pas. (Première version : le
        // changement d'acte se faisait à la fin d'une scène — une
        // joueuse qui ignorait une question de Mira restait
        // bloquée en acte I pour toujours. Jamais deux fois.)
        this.verifierLesActes();

        if (this.sceneEnCours) return;

        // Une question de Mira restée sans réponse finit par
        // s'effacer : elle ne va pas attendre toute la nuit.
        // (poseeA n'existe que sur les questions de scène : les
        //  questions posées à la main, comme celle de la toute
        //  fin, n'expirent pas.)
        if (this.enCours && this.enCours.fil === "mira" && this.enCours.poseeA &&
            Date.now() - this.enCours.poseeA > 120000) {
            this.enCours = null;
            this.rafraichirSiVisible("mira");
        }

        if (this.enCours) return;          // on attend une réponse

        /* Une question de raisonnement à poser ? Mira la pose
           elle-même, dans la conversation. (Avant, ça vivait
           dans un écran du carnet : trop lourd, trop écrit.) */
        const aDemander = ENQUETE.deductionsOuvertes()[0];
        if (aDemander && !this.sceneEnCours) {
            this.poserLaQuestion(aDemander);
            return;
        }

        for (let i = 0; i < SCENES.length; i++) {
            const scene = SCENES[i];

            if (etapeFaite(scene.id)) continue;
            if (!scene.quand()) continue;

            this.jouer(scene);
            return;
        }
    },


    jouer: async function (scene) {

        this.sceneEnCours = true;
        marquerEtape(scene.id);

        for (let i = 0; i < scene.suite.length; i++) {
            const replique = scene.suite[i];

            // une pause pure, sans message
            if (replique.pause) {
                await attendre(replique.pause);
                continue;
            }

            const fil = replique.fil || scene.fil || "mira";

            this.ecritDans = fil;
            this.rafraichirSiVisible(fil);

            await attendre(replique.delai || DELAI_AVANT_REPONSE_MIRA);

            this.ecritDans = null;
            this.envoyer(fil, replique.txt, { indice: replique.indice });

            await attendre(420);
        }

        if (scene.question) {
            this.enCours = {
                fil: scene.question.fil || scene.fil || "mira",
                reponses: scene.question.reponses,
                suite: scene.question.suite,
                poseeA: Date.now(),
            };
            this.rafraichirSiVisible(this.enCours.fil);
        }

        this.sceneEnCours = false;

        if (scene.apres) scene.apres();

        if (!scene.question) plusTard(function () { SCENARIO.verifier(); }, 1200);
    },


    /* ========================================================
       ENVOYER / RÉPONDRE
       ======================================================== */
    envoyer: function (fil, texte, options) {
        const o = options || {};

        ETAT.messagesAjoutes.push({
            fil: fil,
            de: "eux",
            t: AUJOURDHUI + " " + heureReelle(),
            txt: texte,
        });

        // Un fil qu'on vient de recevoir redevient « non lu »,
        // sauf si on l'a sous les yeux.
        if (!this.estVisible(fil)) {
            ETAT.lus["fil:" + fil] = false;
        }

        sauvegarder();

        if (o.indice) ENQUETE.trouver(o.indice);

        if (this.estVisible(fil)) {
            SONS.message();
            this.rafraichirSiVisible(fil);
        } else {
            const contact = FILS_PAR_ID[fil];
            OS.notifier({
                appId: "messages",
                titre: contact ? nomContact(contact.contact) : "Messages",
                texte: texte,
                auClic: function () { allerAuFil(fil); },
            });
        }
    },


    reponsesPour: function (fil) {
        if (!this.enCours) return null;
        if (this.enCours.fil !== fil) return null;
        return this.enCours.reponses;
    },


    choisirReponse: function (fil, idReponse) {

        if (!this.enCours || this.enCours.fil !== fil) return;

        const reponse = this.enCours.reponses.filter(function (r) { return r.id === idReponse; })[0];
        if (!reponse) return;

        ETAT.messagesAjoutes.push({
            fil: fil,
            de: "moi",
            t: AUJOURDHUI + " " + heureReelle(),
            txt: reponse.txt,
        });

        ETAT.reponsesChoisies[idReponse] = true;
        sauvegarder();

        const suite = this.enCours.suite;
        this.enCours = null;
        this.rafraichirSiVisible(fil);

        if (suite) {
            plusTard(function () { suite(idReponse, reponse); }, 500);
        } else {
            plusTard(function () { SCENARIO.verifier(); }, 900);
        }
    },


    /* --------------------------------------------------------
       poserLaQuestion(deduction)
       --------------------------------------------------------
       Mira demande, on répond d'un appui. Une mauvaise réponse
       ne coûte rien : elle dit où regarder, et elle redemande.
       -------------------------------------------------------- */
    poserLaQuestion: function (deduction) {

        const self = this;

        this.repondre("mira", [{ txt: deduction.question }], function () {
            self.enCours = {
                fil: "mira",
                reponses: deduction.reponses.map(function (r) {
                    return { id: deduction.id + ":" + r.id, txt: r.txt };
                }),
                suite: function (idComplet) {

                    const idReponse = idComplet.split(":")[1];
                    const resultat = ENQUETE.repondre(deduction.id, idReponse);

                    if (resultat.bon) {
                        self.repondre("mira", [
                            { txt: "oui." },
                            { txt: resultat.texte },
                        ]);
                    } else {
                        self.repondre("mira", [
                            { txt: "non, je crois pas." },
                            { txt: resultat.texte },
                        ], function () {
                            self.poserLaQuestion(deduction);
                        });
                    }
                },
            };
            self.rafraichirSiVisible("mira");
        });
    },


    /* Jouer une petite suite de répliques en dehors d'une scène
       (les réactions aux réponses). */
    repondre: async function (fil, repliques, apres) {

        this.sceneEnCours = true;

        for (let i = 0; i < repliques.length; i++) {

            // une pause pure, sans message (comme dans jouer())
            if (repliques[i].pause) {
                await attendre(repliques[i].pause);
                continue;
            }

            this.ecritDans = fil;
            this.rafraichirSiVisible(fil);

            await attendre(repliques[i].delai || DELAI_AVANT_REPONSE_MIRA);

            this.ecritDans = null;
            this.envoyer(fil, repliques[i].txt);

            await attendre(380);
        }

        this.sceneEnCours = false;
        if (apres) apres();
        plusTard(function () { SCENARIO.verifier(); }, 900);
    },


    estEnEcriture: function (fil) {
        return this.ecritDans === fil;
    },


    /* ========================================================
       OUTILS
       ======================================================== */

    /* La joueuse a-t-elle ce fil sous les yeux, là, maintenant ? */
    estVisible: function (fil) {
        if (OS.appOuverte !== "messages") return false;
        const haut = OS.pile[OS.pile.length - 1];
        return !!(haut && haut.options && haut.options.cle === "fil:" + fil);
    },

    rafraichirSiVisible: function (fil) {
        if (this.estVisible(fil)) OS.rafraichir();
        else OS.rafraichirBadges();
    },


    /* --------------------------------------------------------
       verifierLesActes()
       --------------------------------------------------------
       L'acte en cours se déduit UNIQUEMENT de ce que la joueuse
       a établi. Aucune réplique, aucune scène, aucun clic sur
       un bouton de dialogue n'est nécessaire pour avancer.
       -------------------------------------------------------- */
    verifierLesActes: function () {
        if (ETAT.acte < 1) return;

        if (ETAT.chronoValidee) this.passerALActe(2);
        if (ETAT.deductions.d_fuite) this.passerALActe(3);
        if (ETAT.epinglePosee === "bulk") this.passerALActe(4);
        if (ETAT.preuvesEnvoyees) this.passerALActe(5);
    },


    /* ========================================================
       CHANGER D'ACTE
       ======================================================== */
    passerALActe: function (numero) {
        if (ETAT.acte >= numero) return;

        ETAT.acte = numero;
        sauvegarder();

        const titres = {
            2: "Acte II — Celui qui regardait",
            3: "Acte III — Où",
            4: "Acte IV — Lui parler",
            5: "Épilogue",
        };

        plusTard(function () {
            OS.notifier({
                appId: "carnet",
                titre: "Carnet d'enquête",
                texte: titres[numero] + " — de nouveaux objectifs.",
                son: false,
            });
            SONS.revelation();
        }, 800);
    },


    /* ========================================================
       LE FILET DE SÉCURITÉ
       ========================================================
       Si rien n'a été trouvé depuis un bon moment, Mira souffle
       la prochaine chose à regarder. On ne reste jamais coincée
       dans un cadeau.
       ======================================================== */
    verifierSiOnPatine: function () {

        if (ETAT.acte === 0) return;
        if (this.sceneEnCours || this.enCours) return;

        const maintenant = Date.now();
        if (maintenant - this.dernierIndice < DELAI_INDICE_DOUX) return;
        if (maintenant - this.derniereAide < DELAI_INDICE_DOUX * 1.6) return;

        this.derniereAide = maintenant;
        this.dernierIndice = maintenant;

        this.envoyer("mira", ENQUETE.aide());
    },


    /* ========================================================
       LE DERNIER GESTE DU JEU
       ======================================================== */
    envoyerPreuves: function () {

        if (ETAT.preuvesEnvoyees) return;

        ETAT.preuvesEnvoyees = true;
        ENQUETE.remplirObjectif("o_preuve");
        sauvegarder();

        SONS.succes();

        OS.alerte({
            titre: "Transféré",
            message: "Le reçu d'abonnement, le journal de positions et les captures d'écran sont partis " +
                "chez Me Vogt.\n\nC'est tout ce que tu pouvais faire d'ici. C'est énorme.",
            boutons: [{
                texte: "Fermer", fort: true, auClic: function () {
                    OS.rafraichir();
                    plusTard(function () { SCENARIO.verifier(); }, 600);
                },
            }],
        });
    },
};


/* ============================================================
   LES SCÈNES
   ============================================================ */
const SCENES = [

    /* ---------- ACTE I ---------- */

    {
        id: "s1_ouverture",
        fil: "mira",
        quand: function () { return ETAT.telephoneDeverrouille; },
        suite: [
            { txt: "vous l'avez ouvert ??", delai: 2200 },
            { txt: "pardon. bonjour. je m'appelle Mira, je vivais avec elle." },
        ],
        question: {
            reponses: [
                { id: "r1a", txt: "Je ne sais pas si je peux aider." },
                { id: "r1b", txt: "Je me souviens de son message." },
            ],
            suite: function (id) {
                const repliques = id === "r1a"
                    ? [{ txt: "moi non plus." }, { txt: "mais vous êtes la seule qui lui a répondu cette nuit-là." }]
                    : [{ txt: "4417 au lieu de 4471." }, { txt: "un chiffre, et c'est tombé chez vous." }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "ouvrez Messages. votre fil, c'est « numéro inconnu »." },
                ]));
            },
        },
    },

    {
        id: "s2_mon_fil",
        fil: "mira",
        quand: function () { return dejaLu("fil:klara:lu") && ENQUETE.a("lena_reponse"); },
        suite: [
            { txt: "vos messages sont à gauche. c'est son téléphone à elle : il croit que c'est elle qui parle.", delai: 2600 },
            { txt: "« gardez la porte fermée quand même »." },
            { txt: "elle a écrit ça à une inconnue. et rien à moi." },
        ],
        question: {
            reponses: [
                { id: "r2a", txt: "Elle avait peur de quelqu'un." },
                { id: "r2b", txt: "Elle vous croyait seule à l'appartement." },
            ],
            suite: function (id) {
                const repliques = id === "r2a"
                    ? [{ txt: "oui. et pas d'un inconnu : de quelqu'un qui savait où elle habitait." }]
                    : [{ txt: "ah." }, { txt: "j'avais pas vu ça comme ça. elle vérifiait." }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "ce soir-là elle m'a dit qu'elle travaillait. vérifiez son agenda." },
                ]), function () {
                    ENQUETE.remplirObjectif("o_mon_fil");
                });
            },
        },
    },

    {
        id: "s3_mensonge",
        fil: "mira",
        quand: function () { return ETAT.deductions.d_mensonge === true; },
        suite: [
            { txt: "repos. elle était en repos et elle m'a dit qu'elle bossait.", delai: 2000 },
            { txt: "en six ans elle m'a jamais menti." },
            { txt: "il faut la nuit entière alors. carnet → « nuit du 8 »." },
        ],
    },

    {
        id: "s4_chrono",
        fil: "mira",
        quand: function () { return ETAT.chronoValidee; },
        suite: [
            { txt: "1h14.", delai: 2400 },
            { pause: 1400 },
            { txt: "j'étais dans la chambre d'à côté." },
        ],
        question: {
            reponses: [
                { id: "r4a", txt: "Elle ne voulait pas que vous sachiez." },
                { id: "r4b", txt: "Ce n'est pas votre faute." },
            ],
            suite: function (id) {
                const repliques = id === "r4a"
                    ? [{ txt: "elle voulait pas que je PUISSE savoir. c'est pas pareil." }]
                    : [{ txt: "si, un peu. mais merci." }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "donc la question c'est plus « où ». c'est « pourquoi »." },
                ]), function () {
                    SCENARIO.passerALActe(2);
                });
            },
        },
    },


    /* ---------- ACTE II ---------- */

    {
        id: "s5_prive",
        fil: "mira",
        quand: function () { return estOuvert("albumPrive") && ENQUETE.a("capture_3h"); },
        suite: [
            { txt: "elle gardait des captures.", delai: 2600 },
            { txt: "je savais qu'il était lourd. je savais pas qu'elle documentait." },
            { txt: "on documente quand on prépare quelque chose." },
        ],
    },

    {
        id: "s6_mouchard",
        fil: "mira",
        quand: function () { return estOuvert("mouchard") && ENQUETE.a("mouchard"); },
        suite: [
            { txt: "un logiciel. depuis avril.", delai: 2600 },
            { pause: 1600 },
            { txt: "j'ai cru qu'elle avait oublié son téléphone. elle l'a LAISSÉ." },
            { txt: "regardez les trois semaines d'avant : l'agenda, la banque, ses notes." },
        ],
    },

    {
        id: "s7_fuite",
        fil: "mira",
        quand: function () { return ETAT.deductions.d_fuite === true; },
        suite: [
            { txt: "d'accord. elle est pas disparue, elle est partie.", delai: 2200 },
            { txt: "pardon. je tape mal quand je pleure." },
            { pause: 1200 },
            { txt: "alors elle est chez sa grand-mère, à Eckernförde. j'en suis sûre à 100%." },
        ],
        apres: function () {
            SCENARIO.passerALActe(3);
            ENQUETE.remplirObjectif("o_fuite");
        },
    },


    /* ---------- ACTE III ---------- */

    {
        id: "s8_eckernforde",
        fil: "mira",
        quand: function () { return ETAT.deductions.d_eckernforde === true; },
        suite: [
            { txt: "vendue. en mai.", delai: 2400 },
            { txt: "je suis vraiment nulle à ça." },
        ],
        question: {
            reponses: [
                { id: "r8a", txt: "C'est vous qui avez trouvé le téléphone." },
                { id: "r8b", txt: "Relisez le mail jusqu'au bout." },
            ],
            suite: function (id) {
                const repliques = id === "r8a" ? [{ txt: "…merci." }] : [{ txt: "attendez." }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "« la cabane je ne la vends pas ». il y a une cabane." },
                    { txt: "trouvez où, et posez l'épingle dans Plans." },
                ]));
            },
        },
    },

    {
        id: "s9_lieu",
        fil: "mira",
        quand: function () { return ETAT.epinglePosee === "bulk"; },
        suite: [
            { txt: "Bülk.", delai: 2200 },
            { txt: "on y est allées une fois. elle avait dit « ici personne peut me téléphoner »." },
            { txt: "j'avais trouvé ça romantique." },
            { pause: 1500 },
            { txt: "elle attend que quelqu'un comprenne. depuis onze jours." },
        ],
        apres: function () {
            SCENARIO.passerALActe(4);

            // Le compte sans nom se réveille.
            plusTard(function () {
                SCENARIO.verifier();
            }, 3000);
        },
    },


    /* ---------- ACTE IV ---------- */

    {
        id: "s10_nebel",
        fil: "nebel",
        quand: function () { return ETAT.acte >= 4; },
        suite: [
            { txt: "Qui es-tu ?", delai: 3000 },
        ],
        question: {
            reponses: [
                { id: "r10a", txt: "Le numéro à qui tu as écrit le 8 novembre." },
                { id: "r10b", txt: "Une amie de Mira." },
                { id: "r10c", txt: "Police de Kiel." },
            ],
            suite: function (id) {
                if (id === "r10a") {
                    SCENARIO.repondre("nebel", [
                        { txt: "Il peut avoir lu ce fil, lui aussi." },
                        { txt: "Alors trois questions. Les réponses sont toutes dans ce téléphone." },
                    ], poserQuestionUne);
                    return;
                }

                SCENARIO.repondre("nebel", [
                    { txt: "Non." },
                    { txt: "Recommence. Et cette fois, dis la vérité." },
                ], demanderQuiTuEs);
            },
        },
    },

    {
        id: "s11_fin",
        fil: "nebel",
        quand: function () { return ETAT.questionsLenaRepondues.length >= 3; },
        suite: [
            { txt: "C'est toi.", delai: 2600 },
            { pause: 1800 },
            { txt: "Je t'ai fait peur cette nuit-là. Tu as répondu quand même." },
            { txt: "C'est la seule chose gentille de ce mois-là." },
            { pause: 1400 },
            { txt: "Je ne rentre pas encore. Il faut que le dossier existe avant." },
            { txt: "Le reçu de 4,99 € est dans la corbeille de ma boîte mail. Envoie-le à Me Vogt." },
            { txt: "Et dis à Mira de laisser la lampe allumée." },
        ],
        apres: function () {
            ENQUETE.remplirObjectif("o_questions");
        },
    },

    {
        id: "s12_epilogue",
        fil: "nebel",
        quand: function () { return ETAT.preuvesEnvoyees; },
        suite: [
            { txt: "Reçu. Me Vogt a ouvert le dossier.", delai: 3200 },
            { pause: 2000 },
            { txt: "Il fait froid ici. Le phare tourne toutes les trois secondes, Keks le déteste." },
            { txt: "Je développe mes pellicules dans l'évier. Je n'ai jamais aussi bien travaillé." },
            { pause: 1600 },
            { txt: "Merci d'avoir lu jusqu'au bout. Les gens s'arrêtent avant, d'habitude." },
            { txt: "Je t'ai envoyé une photo." },
        ],
        apres: function () {
            ETAT.epilogueVu = true;
            ETAT.acte = 5;
            sauvegarder();

            plusTard(function () {
                OS.notifier({
                    appId: "photos",
                    titre: "Photos",
                    texte: "Une nouvelle photo a été ajoutée à la pellicule.",
                });
            }, 2000);

            plusTard(function () {
                SCENARIO.repondre("mira", [
                    { txt: "elle m'a appelée." },
                    { txt: "trente-huit secondes. elle a dit « je vais bien » et elle a raccroché." },
                    { txt: "trente-huit secondes, c'est long quand on respire pas." },
                    { pause: 1500 },
                    { txt: "merci. vraiment. je sais même pas votre prénom." },
                ], function () {
                    SCENARIO.enCours = {
                        fil: "mira",
                        reponses: [
                            { id: "fin_nom", txt: JOUEUSE + "." },
                        ],
                        suite: function () {
                            ETAT.numeroEnregistre = true;
                            sauvegarder();

                            SCENARIO.repondre("mira", [
                                { txt: JOUEUSE + ". je l'enregistre." },
                                { txt: "si vous passez un jour à Kiel, il y a toujours trop de soupe ici." },
                            ]);
                        },
                    };
                    SCENARIO.rafraichirSiVisible("mira");
                });
            }, 6000);
        },
    },
];


/* ------------------------------------------------------------
   LES TROIS QUESTIONS DE LENA
   ------------------------------------------------------------
   Écrites à part, parce qu'elles s'enchaînent.

   Règle : une mauvaise réponse ne casse RIEN. Elle répond
   « Non. », elle dit où chercher, et elle repose exactement la
   même question. (Elle menace de casser la carte SIM. Elle
   bluffe. On ne punit jamais la joueuse d'un cadeau.)
   ------------------------------------------------------------ */

/* Un petit utilitaire : poser une question dans le fil de Lena. */
function poserQuestionNebel(reponses, suite) {
    // Pas de poseeA : les questions de Lena, elles, n'expirent
    // jamais. C'est la fin du jeu, on attend le temps qu'il faut.
    SCENARIO.enCours = { fil: "nebel", reponses: reponses, suite: suite };
    SCENARIO.rafraichirSiVisible("nebel");
}


/* « Qui es-tu ? », reposée après une mauvaise réponse. */
function demanderQuiTuEs() {
    poserQuestionNebel([
        { id: "r10a", txt: "Le numéro à qui tu as écrit le 8 novembre." },
        { id: "r10b", txt: "Une amie de Mira." },
    ], function (id) {
        if (id === "r10a") {
            SCENARIO.repondre("nebel", [
                { txt: "Il peut avoir lu ce fil, lui aussi." },
                { txt: "Alors trois questions. Les réponses sont toutes dans ce téléphone." },
            ], poserQuestionUne);
        } else {
            SCENARIO.repondre("nebel", [{ txt: "Non." }], demanderQuiTuEs);
        }
    });
}


/* Question 1 — le chat. */
function poserQuestionUne() {
    SCENARIO.repondre("nebel", [
        { txt: "Comment s'appelle mon chat ?" },
    ], function () {
        poserQuestionNebel([
            { id: "q1_keks", txt: "Keks." },
            { id: "q1_horst", txt: "Horst." },
            { id: "q1_zwieback", txt: "Zwieback." },
        ], function (id) {

            if (id !== "q1_keks") {
                SCENARIO.repondre("nebel", [
                    { txt: "Non." },
                    { txt: "C'est dans un mail de vétérinaire, et dans la légende d'une photo. Cherche." },
                ], poserQuestionUne);
                return;
            }

            ETAT.questionsLenaRepondues.push("chat");
            sauvegarder();

            SCENARIO.repondre("nebel", [
                { txt: "Keks. Oui." },
            ], poserQuestionDeux);
        });
    });
}


/* Question 2 — le dos de la photo imprimée. */
function poserQuestionDeux() {
    SCENARIO.repondre("nebel", [
        { txt: "Mira t'a envoyé une photo imprimée avec le téléphone. Qu'est-ce qui est écrit au dos ?" },
    ], function () {
        poserQuestionNebel([
            { id: "q2_juste", txt: "« Bülk, 03.07 — le jour où j'ai compris »" },
            { id: "q2_faux1", txt: "« Strande, juillet — pour plus tard »" },
            { id: "q2_faux2", txt: "Rien. Le dos est vide." },
        ], function (id) {

            if (id !== "q2_juste") {
                SCENARIO.repondre("nebel", [
                    { txt: "Non." },
                    { txt: "Retourne-la. Elle est dans l'enveloppe, pas dans le téléphone." },
                ], poserQuestionDeux);
                return;
            }

            ETAT.questionsLenaRepondues.push("photo");
            sauvegarder();

            SCENARIO.repondre("nebel", [
                { txt: "C'est mon écriture." },
            ], poserQuestionTrois);
        });
    });
}


/* Question 3 — la dernière phrase de cette nuit-là. */
function poserQuestionTrois() {
    SCENARIO.repondre("nebel", [
        { txt: "Dernière. Cette nuit-là, qu'est-ce que je t'ai répondu, à la fin ?" },
    ], function () {
        poserQuestionNebel([
            { id: "q3_juste", txt: "« Non. Mais merci d'avoir répondu. »" },
            { id: "q3_faux1", txt: "« Tout va bien, bonne nuit. »" },
            { id: "q3_faux2", txt: "« Pardon pour le dérangement. »" },
        ], function (id) {

            if (id !== "q3_juste") {
                SCENARIO.repondre("nebel", [
                    { txt: "Non." },
                    { txt: "C'est le dernier message de notre fil. Relis-le." },
                ], poserQuestionTrois);
                return;
            }

            ETAT.questionsLenaRepondues.push("reponse");
            sauvegarder();
            SONS.revelation();

            plusTard(function () { SCENARIO.verifier(); }, 1200);
        });
    });
}
