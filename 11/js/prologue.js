/* ============================================================
   LE PROLOGUE — la nuit du 8, sur TON téléphone
   ============================================================
   Avant l'enveloppe, avant le téléphone de Lena, il y a cinq
   minutes où la joueuse est simplement elle-même : vendredi
   8 novembre, 23 h, au lit, en train de faire défiler des
   vidéos.

   Et un numéro inconnu écrit.

   Tout le jeu raconte ensuite cette conversation-là. Autant
   la faire vivre une fois, au lieu de la résumer : quand elle
   la relira onze jours plus tard sur le téléphone de Lena,
   elle saura ce que ça faisait d'être de l'autre côté.

   ⚠️ Un parti pris : on ne CHOISIT pas ses réponses. Elles
   sont déjà écrites dans le champ de saisie, il n'y a qu'à
   appuyer sur envoyer. On ne joue pas ce qu'on aurait voulu
   répondre, on rejoue ce qu'on a répondu. C'est ce qui rend
   la dernière réplique de Lena insupportable.
   ============================================================ */


/* Le fil d'actualité de Klara, cette nuit-là. Rien à voir avec
   l'enquête : c'est le bruit de fond d'une soirée ordinaire. */
const VIDEOS_PROLOGUE = [
    {
        compte: "keks.der.kater",
        peinture: "chat_fenetre",
        legende: "il a décidé que 23h c'était l'heure de courir",
        son: "son original — keks.der.kater",
        jaime: "12,4 k",
        commentaires: 211,
    },
    {
        compte: "bluey_kiel",
        peinture: "peluches",
        legende: "J'AI VU UN OISEAU GÉANT !!!",
        son: "son original — bluey_kiel",
        jaime: "8",
        commentaires: 11,
    },
    {
        compte: "kiel.bynight",
        peinture: "lampadaire_brume",
        legende: "le brouillard est tombé d'un coup sur la Förde",
        son: "Nordlicht — Ava Nordwind",
        jaime: "3 902",
        commentaires: 64,
    },
];


/* La conversation, réplique par réplique.
   de: "elle" = le numéro inconnu / "moi" = la joueuse
   Une réplique "moi" attend qu'on appuie sur envoyer. */
const CONVERSATION_PROLOGUE = [
    { de: "elle", txt: "tu es réveillée ? je rentre tard. ne ferme pas à clé", heure: "23:02" },
    { de: "moi", txt: "Je pense que vous vous êtes trompée de numéro 🙂", heure: "23:04" },
    { de: "elle", txt: "oh", heure: "23:05" },
    { de: "elle", txt: "pardon. un chiffre à côté.", heure: "23:05" },
    { de: "moi", txt: "Pas de souci, ça arrive. Bonne nuit !", heure: "23:06" },
    { de: "elle", txt: "il y a quelqu'un chez vous ?", heure: "23:12", attente: 2600 },
    { de: "moi", txt: "Euh. Oui, pourquoi ?", heure: "23:13" },
    { de: "elle", txt: "pour rien. c'est bien.", heure: "23:14" },
    { de: "elle", txt: "gardez la porte fermée quand même", heure: "23:15" },
    { de: "moi", txt: "Vous me faites un peu peur là. Ça va aller ?", heure: "23:17" },
    { de: "elle", txt: "Non. Mais merci d'avoir répondu.", heure: "23:19", attente: 4200, derniere: true },
];


const PROLOGUE = {

    zone: null,

    commencer: async function () {

        this.zone = el("div", { classe: "prologue" });
        document.getElementById("ecran").appendChild(this.zone);

        OS.heureForcee = "23:01";
        OS.dessinerBarreStatut();

        await this.carton();
        await this.defilement();
        await this.conversation();
        await this.transition();

        ETAT.prologueVu = true;
        sauvegarder();

        OS.heureForcee = null;
        OS.dessinerBarreStatut();

        if (this.zone && this.zone.parentNode) this.zone.remove();

        INTRO.commencer();
    },


    /* --------------------------------------------------------
       1. LE CARTON — le jour, l'heure, et c'est tout
       -------------------------------------------------------- */
    carton: async function () {

        vide(this.zone);

        const carton = el("div", { classe: "carton" }, [
            el("div", { classe: "carton-jour", texte: "vendredi 8 novembre" }),
            el("div", { classe: "carton-heure", texte: "23 h 01" }),
            el("div", { classe: "carton-lieu", texte: "chez toi" }),
        ]);

        this.zone.appendChild(carton);

        await attendre(3600);

        carton.classList.add("carton--part");
        await attendre(700);
    },


    /* --------------------------------------------------------
       2. LE DÉFILEMENT — on scrolle, comme tous les soirs
       -------------------------------------------------------- */
    defilement: async function () {

        vide(this.zone);
        this.zone.classList.add("prologue--noir");

        const pile = el("div", { classe: "kiek-pile kiek-pile--auto" });

        VIDEOS_PROLOGUE.forEach(function (video) {
            const ecran = el("div", { classe: "kiek-ecran" });

            ecran.appendChild(el("div", { classe: "kiek-image" }, [
                peindre(video.peinture, { recadre: true }),
            ]));

            ecran.appendChild(el("div", { classe: "kiek-actions" }, [
                el("div", { classe: "kiek-action" }, [
                    avatar({ nom: video.compte, couleur: "#2C3340" }, 44),
                ]),
                el("div", { classe: "kiek-action" }, [
                    el("span", { classe: "glyphe", html: ICONES.coeur }),
                    el("span", { classe: "kiek-chiffre", texte: video.jaime }),
                ]),
                el("div", { classe: "kiek-action" }, [
                    el("span", { classe: "glyphe", html: ICONES.bulle }),
                    el("span", { classe: "kiek-chiffre", texte: String(video.commentaires) }),
                ]),
                el("div", { classe: "kiek-disque" }, [
                    el("span", { classe: "glyphe", html: ICONES.musique }),
                ]),
            ]));

            ecran.appendChild(el("div", { classe: "kiek-bas" }, [
                el("div", { classe: "kiek-compte", texte: "@" + video.compte }),
                el("div", { classe: "kiek-legende", texte: video.legende }),
                el("div", { classe: "kiek-son" }, [
                    el("span", { classe: "glyphe", html: ICONES.musique }),
                    el("span", { texte: video.son }),
                ]),
            ]));

            pile.appendChild(ecran);
        });

        this.zone.appendChild(pile);

        this.zone.appendChild(el("div", { classe: "kiek-haut" }, [
            el("div", { classe: "kiek-onglet", texte: "Abonnements" }),
            el("div", { classe: "kiek-onglet kiek-onglet--actif", texte: "Pour toi" }),
        ]));

        /* le pouce qui remonte tout seul */
        await attendre(2800);

        for (let i = 1; i < VIDEOS_PROLOGUE.length; i++) {
            pile.scrollTo({ top: pile.children[i].offsetTop, behavior: "smooth" });
            await attendre(2900);
        }

        /* --- et le message arrive --- */
        OS.heureForcee = "23:02";
        OS.dessinerBarreStatut();

        await this.banniere();
    },


    /* --------------------------------------------------------
       3. LA NOTIFICATION
       -------------------------------------------------------- */
    banniere: function () {

        const self = this;

        return new Promise(function (resoudre) {

            SONS.message();

            const banniere = el("div", { classe: "banniere banniere--prologue cliquable" }, [
                el("div", {
                    classe: "banniere-icone",
                    style: { background: ICONES_APPS.messages.fond },
                    html: ICONES_APPS.messages.glyphe,
                }),
                el("div", { classe: "banniere-texte" }, [
                    el("div", { classe: "banniere-titre" }, [
                        el("span", { texte: "Numéro inconnu" }),
                        el("span", { texte: "maintenant" }),
                    ]),
                    el("div", {
                        classe: "banniere-corps",
                        texte: "tu es réveillée ? je rentre tard. ne ferme pas à clé",
                    }),
                ]),
            ]);

            const zoneBanniere = el("div", { classe: "prologue-bannieres" }, [banniere]);
            self.zone.appendChild(zoneBanniere);

            banniere.addEventListener("click", function () {
                zoneBanniere.remove();
                resoudre();
            });

            // si elle n'appuie pas, on finit par ouvrir quand même
            plusTard(function () {
                if (zoneBanniere.parentNode) {
                    zoneBanniere.remove();
                    resoudre();
                }
            }, 9000);
        });
    },


    /* --------------------------------------------------------
       4. LA CONVERSATION
       -------------------------------------------------------- */
    conversation: async function () {

        vide(this.zone);
        this.zone.classList.remove("prologue--noir");

        /* l'en-tête, comme dans Messages */
        this.zone.appendChild(el("div", { classe: "barre-nav" }, [
            el("div", { classe: "barre-nav-retour" }, [
                el("span", { classe: "glyphe", html: ICONES.chevronGauche }),
            ]),
            el("div", { classe: "barre-nav-titre", texte: "Numéro inconnu" }),
            el("div", { classe: "barre-nav-action" }),
        ]));

        const fil = el("div", { classe: "fil" });
        this.zone.appendChild(fil);

        fil.appendChild(el("div", { classe: "separateur-date" }, [
            el("b", { texte: "vendredi 8 novembre" }),
            el("span", { texte: "  23:02" }),
        ]));

        const barre = el("div", { classe: "barre-saisie barre-saisie--prologue" });
        this.zone.appendChild(barre);

        for (let i = 0; i < CONVERSATION_PROLOGUE.length; i++) {
            const replique = CONVERSATION_PROLOGUE[i];

            OS.heureForcee = replique.heure;
            OS.dessinerBarreStatut();

            if (replique.de === "elle") {
                await this.elleEcrit(fil, replique);
            } else {
                await this.jeReponds(fil, barre, replique);
            }
        }

        /* « Lu », et plus rien */
        fil.appendChild(el("div", { classe: "accuse-lecture", texte: "Lu à 23:19" }));
        fil.scrollTop = fil.scrollHeight;

        vide(barre);
        barre.appendChild(el("div", { classe: "faux-champ", texte: "Message" }));

        await attendre(4500);
    },


    /* elle écrit : les trois points, puis la bulle */
    elleEcrit: async function (fil, replique) {

        const points = el("div", { classe: "ecrit" }, [
            el("span"), el("span"), el("span"),
        ]);

        fil.appendChild(points);
        fil.scrollTop = fil.scrollHeight;

        await attendre(replique.attente || 1500);

        points.remove();

        fil.appendChild(el("div", {
            classe: "bulle bulle--eux bulle--pointe",
            texte: replique.txt,
        }));

        SONS.message();
        fil.scrollTop = fil.scrollHeight;

        await attendre(900);
    },


    /* moi : le texte est déjà écrit, il n'y a qu'à l'envoyer */
    jeReponds: function (fil, barre, replique) {

        return new Promise(function (resoudre) {

            vide(barre);

            const champ = el("div", { classe: "faux-champ faux-champ--pret", texte: replique.txt });

            const envoyer = el("div", { classe: "bouton-envoyer cliquable" }, [
                el("span", { classe: "glyphe", html: ICONES.flecheHaut }),
            ]);

            barre.appendChild(champ);
            barre.appendChild(envoyer);

            envoyer.addEventListener("click", function () {
                SONS.message();

                vide(barre);
                barre.appendChild(el("div", { classe: "faux-champ", texte: "Message" }));

                fil.appendChild(el("div", {
                    classe: "bulle bulle--moi bulle--pointe",
                    texte: replique.txt,
                }));

                fil.scrollTop = fil.scrollHeight;

                plusTard(resoudre, 700);
            });
        });
    },


    /* --------------------------------------------------------
       5. ONZE JOURS PLUS TARD
       -------------------------------------------------------- */
    transition: async function () {

        vide(this.zone);
        this.zone.classList.add("prologue--noir");

        const carton = el("div", { classe: "carton" }, [
            el("div", { classe: "carton-heure", style: { fontSize: "27px" }, texte: "Onze jours plus tard" }),
        ]);

        this.zone.appendChild(carton);

        await attendre(3400);

        carton.classList.add("carton--part");
        await attendre(700);
    },
};
