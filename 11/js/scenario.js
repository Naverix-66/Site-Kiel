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

    /* ⚠️ UN COMPTEUR, pas un booléen.
       Avec un simple vrai/faux, une suite de répliques qui en
       déclenchait une autre libérait le verrou trop tôt : une
       deuxième conversation démarrait par-dessus la première et
       les messages s'entremêlaient. C'était ça, les dialogues
       auxquels on ne comprenait rien.
       Le compteur ne retombe à zéro que quand TOUT est fini. */
    occupe: 0,
    derniereActivite: 0,
    dernierIndice: Date.now(),
    derniereAide: 0,


    /* ========================================================
       DÉMARRAGE
       ======================================================== */
    demarrer: function () {

        this.reprise();

        this.demarreeA = Date.now();

        // Le filet de sécurité : si rien n'a été trouvé depuis un
        // moment, Mira finit par souffler quelque chose.
        setInterval(function () { SCENARIO.verifierSiOnPatine(); }, 20000);

        // Et la vie du téléphone, qui continue pendant qu'on cherche.
        setInterval(function () { SCENARIO.vieDuTelephone(); }, 15000);

        /* ⚠️ Un battement régulier.
           Tout le scénario avance par déclenchements : une
           réponse, une trace trouvée, une scène qui finit. Si
           l'un de ces déclencheurs manque à l'appel — et il en
           manquait un après certaines réactions de Mira — la
           question suivante restait en attente pour toujours.
           Ce battement de six secondes rattrape tout : il est
           sans effet quand une conversation est en cours. */
        setInterval(function () { SCENARIO.verifier(); }, 6000);

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

        /* Une conversation qui attend qu'on y entre ? */
        if (this.occupe === 0 && !this.enCours) {
            const branche = BRANCHES.filter(function (b) {
                return b.fil === idFil && !etapeFaite("br:" + b.id) && b.quand();
            })[0];

            if (branche) {
                marquerEtape("br:" + branche.id);
                this.occupe++;

                plusTard(function () {
                    branche.jouer();
                    SCENARIO.occupe = Math.max(0, SCENARIO.occupe - 1);
                }, 900);
                return;
            }
        }

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
    /* --------------------------------------------------------
       forcerQuestion(deduction)
       --------------------------------------------------------
       Depuis le carnet : « demande-lui ». On ouvre la
       conversation et Mira pose la question tout de suite, même
       si le scénario avait raté son déclenchement.
       -------------------------------------------------------- */
    forcerQuestion: function (deduction) {
        if (!deduction || ETAT.deductions[deduction.id]) return;

        this.enCours = null;
        this.occupe = 0;
        this.ecritDans = null;

        allerAuFil("mira");
        plusTard(function () { SCENARIO.poserLaQuestion(deduction); }, 500);
    },


    verifier: function () {

        /* Garde-fou : si le compteur est resté bloqué sans la
           moindre activité pendant une demi-minute, c'est qu'une
           suite de répliques s'est interrompue en chemin. On le
           remet à zéro plutôt que de figer la partie. */
        if (this.occupe > 0 && this.derniereActivite &&
            Date.now() - this.derniereActivite > 30000) {
            this.occupe = 0;
            this.ecritDans = null;
        }


        // Les actes avancent TOUJOURS, même si Mira attend une
        // réponse qui ne vient pas. (Première version : le
        // changement d'acte se faisait à la fin d'une scène — une
        // joueuse qui ignorait une question de Mira restait
        // bloquée en acte I pour toujours. Jamais deux fois.)
        this.verifierLesActes();

        if (this.occupe > 0) return;

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
        if (aDemander && this.occupe === 0) {
            this.poserLaQuestion(aDemander);
            return;
        }

        for (let i = 0; i < SCENES.length; i++) {
            const scene = SCENES[i];

            if (etapeFaite(scene.id)) continue;
            if (this.sceneLancee === scene.id) continue;   // déjà en train de se jouer
            if (!scene.quand()) continue;

            this.jouer(scene);
            return;
        }
    },


    jouer: async function (scene) {

        this.occupe++;
        this.derniereActivite = Date.now();

        /* La scène n'est marquée « jouée » qu'à la FIN (plus bas).
           Si la page est rechargée au milieu, elle se rejoue en
           entier plutôt que de laisser la moitié des répliques
           dans le vide. Le compteur, lui, empêche de la lancer
           deux fois dans la même partie. */
        this.sceneLancee = scene.id;

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

        marquerEtape(scene.id);
        this.sceneLancee = null;

        if (scene.apres) scene.apres();

        this.occupe = Math.max(0, this.occupe - 1);

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
            /* On tient le verrou pendant la demi-seconde qui
               sépare la réponse de la réaction : sinon une autre
               scène pouvait se glisser entre les deux. */
            this.occupe++;

            plusTard(function () {
                suite(idReponse, reponse);
                SCENARIO.occupe = Math.max(0, SCENARIO.occupe - 1);
            }, 500);
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
                        /* Mira réagit avec SES mots. La phrase du
                           carnet, elle, s'écrit dans le carnet —
                           on ne la lui fait pas réciter. */
                        const reaction = (deduction.reaction || ["oui."]).map(function (t) {
                            return { txt: t };
                        });
                        self.repondre("mira", reaction);

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

        this.occupe++;
        this.derniereActivite = Date.now();

        /* ⚠️ try/finally : si quoi que ce soit lève une erreur au
           milieu d'une réplique, le compteur doit redescendre.
           Sans ça, il restait bloqué au-dessus de zéro et TOUT
           le scénario se figeait en silence — plus une question,
           plus une scène, pour le reste de la partie. */
        try {
            for (let i = 0; i < repliques.length; i++) {

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

            /* apres() AVANT de relâcher : c'est souvent lui qui
               enchaîne la suite de la conversation, et il doit la
               démarrer pendant que le verrou tient encore. */
            if (apres) apres();

        } finally {
            this.ecritDans = null;
            this.occupe = Math.max(0, this.occupe - 1);
            this.derniereActivite = Date.now();
        }

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
        if (this.occupe > 0 || this.enCours) return;

        const maintenant = Date.now();
        if (maintenant - this.dernierIndice < DELAI_INDICE_DOUX) return;
        if (maintenant - this.derniereAide < DELAI_INDICE_DOUX * 1.6) return;

        this.derniereAide = maintenant;
        this.dernierIndice = maintenant;

        this.envoyer("mira", ENQUETE.aide());
    },


    /* ========================================================
       L'AMBIANCE — le téléphone vit pendant qu'on fouille
       ========================================================
       Un vrai téléphone ne reste pas immobile. Toutes les deux
       minutes environ, il se passe quelque chose : Jonas écrit,
       quelqu'un ajoute une story, une appli pousse une
       notification.

       ⚠️ RÈGLE ABSOLUE, pour ne jamais perdre la joueuse :
       une notification d'ambiance ne change JAMAIS l'objectif,
       n'apporte JAMAIS d'indice, et n'attend JAMAIS de réponse.
       C'est du décor. Ce qu'il faut faire reste écrit au même
       endroit, dans le carnet, du début à la fin.

       Et jamais pendant que Mira pose une question : on ne
       parle pas par-dessus quelqu'un.
       ======================================================== */
    demarreeA: Date.now(),
    derniereAmbiance: 0,

    vieDuTelephone: function () {

        if (ETAT.acte === 0) return;
        if (this.occupe > 0 || this.enCours) return;

        const maintenant = Date.now();

        // on laisse deux minutes de calme en arrivant
        if (maintenant - this.demarreeA < 120000) return;
        if (maintenant - this.derniereAmbiance < 110000) return;

        for (let i = 0; i < AMBIANCE.length; i++) {
            const evenement = AMBIANCE[i];

            if (etapeFaite("amb:" + evenement.id)) continue;
            if (evenement.quand && !evenement.quand()) continue;

            marquerEtape("amb:" + evenement.id);
            this.derniereAmbiance = maintenant;
            evenement.faire();
            return;
        }
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
   LES CONVERSATIONS QU'ON MÈNE
   ============================================================
   Jusqu'ici, les fils étaient figés : on lisait ce qui avait
   été écrit avant, et c'est tout. Ici, on RÉPOND — depuis le
   téléphone de Lena, donc les gens croient d'abord parler à
   elle.

   Ce qu'on choisit de dire change ce qu'on obtient. Jonas
   protège sa sœur : si on le brusque, il se ferme ; si on lui
   dit la vérité, il finit par lâcher deux choses que personne
   d'autre ne sait.

   ⚠️ Même règle que partout : on ne peut pas se fermer une
   porte définitivement. Si Jonas se braque, Mira rattrape le
   coup et la conversation se rouvre.
   ============================================================ */
const BRANCHES = [
    {
        id: "jonas_ouverture",
        fil: "jonas",
        quand: function () { return ETAT.acte >= 2; },
        jouer: function () { jonasRemarqueQuelquun(); },
    },
];


function jonasRemarqueQuelquun() {

    SCENARIO.repondre("jonas", [
        { txt: "lena ???" },
        { txt: "t'es là ? je vois que tu lis" },
    ], function () {
        SCENARIO.enCours = {
            fil: "jonas",
            reponses: [
                { id: "jv", txt: "Ce n'est pas Lena. Mira m'a envoyé son téléphone." },
                { id: "jb", txt: "Je sais pour les 300 €." },
                { id: "jr", txt: "Ne pas répondre." },
            ],
            suite: function (id) {

                if (id === "jr") {
                    SCENARIO.repondre("jonas", [{ txt: "ok." }], function () {
                        // la porte reste ouverte : on pourra revenir
                        ETAT.etapesScenario["br:jonas_ouverture"] = false;
                        sauvegarder();
                    });
                    return;
                }

                if (id === "jb") {
                    /* Le bluff : il panique et se ferme. Mira
                       rattrape, et on repart sur la vérité. */
                    SCENARIO.repondre("jonas", [
                        { txt: "qui êtes vous ???" },
                        { txt: "c'est son téléphone. répondez." },
                    ], function () {
                        plusTard(function () {
                            SCENARIO.repondre("mira", [
                                { txt: "jonas vient de m'appeler en panique." },
                                { txt: "je lui ai expliqué. dites-lui qui vous êtes, il parlera." },
                            ], function () {
                                jonasSeCalme();
                            });
                        }, 1200);
                    });
                    return;
                }

                jonasSeCalme();
            },
        };
        SCENARIO.rafraichirSiVisible("jonas");
    });
}


function jonasSeCalme() {

    SCENARIO.repondre("jonas", [
        { txt: "mira m'a prévenu qu'elle envoyait le téléphone à quelqu'un." },
        { txt: "je pensais pas que ça servirait à quelque chose." },
        { txt: "demandez." },
    ], function () {
        jonasQuestions();
    });
}


function jonasQuestions() {

    const reponses = [];

    if (!ENQUETE.a("jonas_sim")) {
        reponses.push({ id: "j_argent", txt: "Pourquoi elle t'a demandé 300 € en liquide ?" });
    }
    if (!ENQUETE.a("jonas_cabane")) {
        reponses.push({ id: "j_ou", txt: "Où est-ce qu'elle irait, si elle devait disparaître ?" });
    }
    reponses.push({ id: "j_fin", txt: "Merci, Jonas." });

    SCENARIO.enCours = {
        fil: "jonas",
        reponses: reponses,
        suite: function (id) {

            if (id === "j_argent") {
                SCENARIO.repondre("jonas", [
                    { txt: "elle voulait du liquide, elle a pas dit pourquoi." },
                    { txt: "et elle m'a demandé si je connaissais quelqu'un qui vend des cartes sim sans papiers." },
                    { txt: "j'ai dit non. j'aurais dû poser des questions." },
                ], function () {
                    ENQUETE.trouver("jonas_sim");
                    jonasQuestions();
                });
                return;
            }

            if (id === "j_ou") {
                SCENARIO.repondre("jonas", [
                    { txt: "nulle part. elle déteste partir, elle a jamais quitté Kiel." },
                    { pause: 1600 },
                    { txt: "…attendez." },
                    { txt: "il y a la cabane du grand-père, au bord de l'eau. mais elle y va jamais en hiver, il y fait -2." },
                ], function () {
                    ENQUETE.trouver("jonas_cabane");
                    jonasQuestions();
                });
                return;
            }

            SCENARIO.repondre("jonas", [
                { txt: "si vous la trouvez, dites lui que j'ai rien dit à maman." },
            ]);
        },
    };

    SCENARIO.rafraichirSiVisible("jonas");
}


/* ============================================================
   L'AMBIANCE
   ============================================================
   Du décor, uniquement du décor. Rien ici n'avance l'enquête,
   rien n'attend de réponse, rien ne doit faire croire à la
   joueuse qu'elle doit s'en occuper.

   Dans l'ordre où ça arrive, environ toutes les deux minutes.
   ============================================================ */
const AMBIANCE = [

    {
        id: "jonas_nouvelles",
        faire: function () {
            SCENARIO.envoyer("jonas", "des nouvelles ?");
        },
    },

    {
        id: "story_lisbeth",
        faire: function () {
            OS.notifier({
                appId: "fjordgram",
                titre: "Fjordgram",
                texte: "lisbeth.g a ajouté à sa story",
            });
        },
    },

    {
        id: "kiek_pousse",
        faire: function () {
            OS.notifier({
                appId: "kiek",
                titre: "Kiek",
                texte: "kiel.bynight a publié une vidéo · brouillard sur la Förde",
            });
        },
    },

    {
        id: "mira_pause",
        quand: function () { return ETAT.acte >= 2; },
        faire: function () {
            SCENARIO.envoyer("mira", "je prends mon service. si je réponds pas tout de suite, c'est que je suis dans une chambre.");
        },
    },

    {
        id: "meteo",
        faire: function () {
            OS.notifier({
                appId: "safari",
                titre: "Kieler Nachrichten",
                texte: "Brouillard sur la Förde cette nuit encore. Visibilité 300 m.",
            });
        },
    },

    {
        id: "jonas_photo",
        faire: function () {
            SCENARIO.envoyer("jonas", "maman a retrouvé une photo de nous deux à Laboe. on avait des casquettes affreuses.");
        },
    },

    {
        id: "mira_retour",
        quand: function () { return etapeFaite("amb:mira_pause"); },
        faire: function () {
            SCENARIO.envoyer("mira", "pause. vous en êtes où ?");
        },
    },

    {
        id: "labor_relance",
        faire: function () {
            OS.notifier({
                appId: "mail",
                titre: "Labor Nordlicht",
                texte: "Vos tirages attendent toujours. On les garde encore un mois.",
            });
        },
    },
];


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
            { txt: "pardon" },
            { txt: "bonjour. moi c'est Mira. je vivais avec elle" },
        ],
        question: {
            reponses: [
                { id: "r1a", txt: "Je ne sais pas si je peux aider." },
                { id: "r1b", txt: "Je me souviens de son message." },
            ],
            suite: function (id) {
                const repliques = id === "r1a"
                    ? [{ txt: "moi non plus je sais pas" }, { txt: "mais y a que vous qui lui avez répondu cette nuit là" }]
                    : [{ txt: "4417 au lieu de 4471" }, { txt: "un chiffre. et c'est tombé chez vous" }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "allez dans Messages. votre fil c'est « numéro inconnu »" },
                ]));
            },
        },
    },

    {
        id: "s2_mon_fil",
        fil: "mira",
        quand: function () { return dejaLu("fil:klara:lu") && ENQUETE.a("lena_reponse"); },
        suite: [
            { txt: "vos messages à vous sont à gauche, c'est bizarre je sais", delai: 2600 },
            { txt: "c'est son téléphone. il croit que c'est elle qui parle" },
            { pause: 1200 },
            { txt: "« gardez la porte fermée quand même »" },
            { txt: "elle écrit ça à une inconnue et à moi elle dit rien" },
        ],
        question: {
            reponses: [
                { id: "r2a", txt: "Elle avait peur de quelqu'un." },
                { id: "r2b", txt: "Elle vous croyait seule à l'appartement." },
            ],
            suite: function (id) {
                const repliques = id === "r2a"
                    ? [{ txt: "oui" }, { txt: "et pas d'un inconnu dans la rue. de quelqu'un qui savait où elle dormait" }]
                    : [{ txt: "ah" }, { txt: "j'avais pas vu ça comme ça. elle vérifiait, quoi" }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "ce soir là elle m'a dit qu'elle bossait" },
                    { txt: "regardez son agenda" },
                ]), function () {
                    ENQUETE.remplirObjectif("o_mon_fil");
                });
            },
        },
    },

    /* ⚠️ Il y avait ici une scène « s3_mensonge » qui répétait
       mot pour mot ce que Mira venait de répondre à la question.
       Tout son contenu est passé dans la `reaction` de la
       déduction d_mensonge. Ne pas la recréer. */

    {
        id: "s4_chrono",
        fil: "mira",
        quand: function () { return ETAT.chronoValidee; },
        suite: [
            { txt: "1h14", delai: 2400 },
            { pause: 1600 },
            { txt: "j'étais dans la chambre d'à côté" },
            { txt: "elle a fait du bruit dans la cuisine, j'ai pensé « tiens elle rentre tôt »" },
            { txt: "et je me suis rendormie" },
        ],
        question: {
            reponses: [
                { id: "r4a", txt: "Elle ne voulait pas que vous sachiez." },
                { id: "r4b", txt: "Ce n'est pas votre faute." },
            ],
            suite: function (id) {
                const repliques = id === "r4a"
                    ? [{ txt: "elle voulait pas que je PUISSE savoir" }, { txt: "c'est pas pareil. on peut pas dire ce qu'on sait pas" }]
                    : [{ txt: "si un peu" }, { txt: "mais merci" }];

                SCENARIO.repondre("mira", repliques.concat([
                    { pause: 1000 },
                    { txt: "donc la question c'est plus où elle est. c'est pourquoi elle est partie" },
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
            { txt: "elle gardait des captures", delai: 2600 },
            { txt: "je savais qu'il était lourd. je savais pas qu'elle gardait des preuves" },
            { pause: 1200 },
            { txt: "on garde des preuves quand on prépare quelque chose, non ?" },
        ],
    },

    {
        id: "s6_mouchard",
        fil: "mira",
        quand: function () { return estOuvert("mouchard") && ENQUETE.a("mouchard"); },
        suite: [
            { txt: "un logiciel", delai: 2600 },
            { txt: "depuis avril. sept mois" },
            { pause: 1800 },
            { txt: "j'ai cru qu'elle avait oublié son téléphone. elle l'a LAISSÉ" },
            { txt: "regardez les trois semaines d'avant. l'agenda, la banque, ses notes" },
        ],
    },

    {
        id: "s7_fuite",
        fil: "mira",
        quand: function () { return ETAT.deductions.d_fuite === true; },
        /* (le « elle est partie » est déjà dit en réaction à la
           déduction : ici on enchaîne seulement sur sa fausse
           certitude) */
        suite: [
            { txt: "bon.", delai: 3000 },
            { txt: "alors elle est chez sa grand mère, à Eckernförde" },
            { txt: "j'en suis sûre à 100%" },
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
        /* (le « vendue, en mai » est dans la réaction de la
           déduction : ici on va directement à la suite) */
        suite: [
            { txt: "bon. qu'est-ce qu'on fait maintenant", delai: 2600 },
        ],
        question: {
            reponses: [
                { id: "r8a", txt: "C'est vous qui avez trouvé le téléphone." },
                { id: "r8b", txt: "Relisez le mail jusqu'au bout." },
            ],
            suite: function (id) {
                const repliques = id === "r8a"
                    ? [{ txt: "…" }, { txt: "merci" }]
                    : [{ txt: "attendez" }];

                SCENARIO.repondre("mira", repliques.concat([
                    { txt: "« la cabane je ne la vends pas »" },
                    { txt: "y a une cabane. je savais même pas" },
                    { txt: "trouvez où elle est et posez l'épingle dans Plans" },
                ]));
            },
        },
    },

    {
        id: "s9_lieu",
        fil: "mira",
        quand: function () { return ETAT.epinglePosee === "bulk"; },
        suite: [
            { txt: "Bülk", delai: 2200 },
            { txt: "on y est allées une fois, en vélo. il pleuvait" },
            { txt: "elle avait dit « ici personne peut me téléphoner ». j'avais trouvé ça romantique" },
            { pause: 1800 },
            { txt: "elle attend que quelqu'un comprenne" },
            { txt: "depuis onze jours" },
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
