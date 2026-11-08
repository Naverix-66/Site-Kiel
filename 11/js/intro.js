/* ============================================================
   ACTE 0 — L'ENVELOPPE
   ============================================================
   Quatre écrans, et pas une seule interface :

     1. une enveloppe kraft, qu'on ouvre d'un appui
     2. le mot de Mira, qui s'écrit à la main
     3. la photo imprimée, qu'on retourne
     4. le téléphone, qui demande quatre chiffres

   On réutilise l'idée de l'enveloppe et de l'écriture
   progressive de la lettre d'octobre (lettre/lettre.js) —
   c'est devenu la signature de ce calendrier : avant chaque
   jeu, il y a du papier.

   Le code du téléphone est au dos de la photo. Et le lieu
   écrit à côté du code est la réponse de la toute fin du jeu :
   la joueuse l'a dans la main dès la première minute, et elle
   ne le saura qu'à la dernière.
   ============================================================ */

/* Onze lignes. Pas une de plus : c'est la première chose qu'on
   lit du jeu, et on n'a pas encore la moindre raison d'avoir
   envie de lire. */
const LE_MOT = [
    "Lena a disparu dans la nuit du 8 novembre.",
    "C'est ma colocataire.",
    "",
    "J'ai retrouvé son téléphone onze jours plus tard,",
    "dans la machine à laver. La police a classé le dossier.",
    "",
    "Cette nuit-là, à 23 h 02, elle a écrit à un numéro.",
    "Elle croyait m'écrire. Un chiffre de travers.",
    "Ce numéro, c'est le vôtre. Et vous avez répondu.",
    "",
    "Alors fouillez ce téléphone. Tout est dedans.",
    "Trouvez-la.",
    "",
    "Le code, c'est la date de la photo. Elle est au dos.",
];


const INTRO = {

    zone: null,

    /* L'acte 0 vit dans sa propre couche, par-dessus le
       téléphone. On la recrée au besoin : on peut revenir au
       mot depuis le pavé de code, alors qu'elle a été enlevée. */
    assurerZone: function () {
        if (this.zone && this.zone.parentNode) return this.zone;

        this.zone = el("div", { classe: "acte0" });
        document.getElementById("ecran").appendChild(this.zone);
        return this.zone;
    },


    /* ========================================================
       commencer()
       ========================================================
       Appelée au démarrage si la partie n'a pas commencé.
       ======================================================== */
    commencer: function () {

        this.assurerZone();

        if (ETAT.telephoneDeverrouille) {
            // partie déjà commencée : on ne rejoue pas l'enveloppe
            this.terminer(true);
            return;
        }

        if (ETAT.photoRetournee) { this.ecranPhoto(); return; }
        if (ETAT.motLu) { this.ecranPhoto(); return; }
        if (ETAT.enveloppeOuverte) { this.ecranMot(); return; }

        this.ecranEnveloppe();
    },


    /* --------------------------------------------------------
       1. L'ENVELOPPE
       -------------------------------------------------------- */
    ecranEnveloppe: function () {

        vide(this.zone);

        this.zone.appendChild(el("div", { classe: "acte0-titre", texte: "Onze jours" }));

        const enveloppe = el("div", { classe: "enveloppe" }, [
            el("div", { classe: "rabat" }),
            el("div", { classe: "cachet", texte: "M" }),
            el("div", { classe: "adresse", html: JOUEUSE + "<br>Kiel" }),
        ]);

        const consigne = el("div", { classe: "acte0-consigne", texte: "Appuie sur l'enveloppe" });

        enveloppe.addEventListener("click", function () {
            if (enveloppe.classList.contains("ouverte")) return;

            enveloppe.classList.add("ouverte");
            SONS.ouverture();

            ETAT.enveloppeOuverte = true;
            sauvegarder();

            consigne.textContent = "…";

            plusTard(function () { INTRO.ecranMot(); }, 1100);
        });

        this.zone.appendChild(enveloppe);
        this.zone.appendChild(consigne);
    },


    /* --------------------------------------------------------
       2. LE MOT, ÉCRIT À LA MAIN
       -------------------------------------------------------- */
    /* --------------------------------------------------------
       2. LE MOT
       --------------------------------------------------------
       ⚠️ DEUXIÈME VERSION. La première écrivait lettre par
       lettre, avec un curseur qui clignotait : le papier
       grandissait à mesure, les lignes sautaient, le curseur
       se baladait — ça faisait brouillon.

       Maintenant les lignes sont toutes posées dès le départ
       (donc le papier a sa taille finale, rien ne bouge) et
       elles apparaissent en fondu, l'une après l'autre. On lit
       au rythme où ça s'écrit, sans que rien ne tressaute.
       -------------------------------------------------------- */
    ecranMot: function () {

        this.assurerZone();
        vide(this.zone);

        const papier = el("div", { classe: "mot" });
        this.zone.appendChild(papier);

        const consigne = el("div", { classe: "acte0-consigne", texte: "" });
        this.zone.appendChild(consigne);

        const PAS = 0.34;          // secondes entre deux lignes
        let decalage = 0.3;

        LE_MOT.forEach(function (texte) {

            if (texte === "") {
                papier.appendChild(el("div", { style: { height: "13px" } }));
                return;
            }

            papier.appendChild(el("div", {
                classe: "mot-ligne",
                texte: texte,
                style: { animationDelay: decalage.toFixed(2) + "s" },
            }));

            decalage += PAS;
        });

        papier.appendChild(el("div", {
            classe: "mot-ligne signature",
            texte: "— M.",
            style: { animationDelay: (decalage + 0.2).toFixed(2) + "s" },
        }));

        const toutMontrer = function () {
            papier.classList.add("mot--entier");
        };

        // un appui sur le papier affiche tout d'un coup
        papier.addEventListener("click", toutMontrer);

        const total = (decalage + 0.9) * 1000;

        plusTard(function () {
            ETAT.motLu = true;
            sauvegarder();

            toutMontrer();
            consigne.appendChild(bouton("Il y avait aussi une photo", function () {
                INTRO.ecranPhoto();
            }, { classe: "bouton--papier" }));
        }, total);
    },


    /* --------------------------------------------------------
       3. LA PHOTO IMPRIMÉE
       -------------------------------------------------------- */
    ecranPhoto: function () {

        this.assurerZone();
        vide(this.zone);

        this.zone.appendChild(el("div", { classe: "acte0-titre", texte: "Dans l'enveloppe" }));

        const photo = el("div", { classe: "photo-imprimee" }, [
            el("div", { classe: "faces" }, [
                el("div", { classe: "face face--recto" }, [
                    peindre("fjord_juillet", { recadre: true, detail: true }),
                ]),
                el("div", { classe: "face face--dos" }, [
                    el("div", { classe: "mention", texte: "au crayon, au dos" }),
                    el("div", { classe: "crayon", texte: "Bülk, 03.07" }),
                    el("div", { classe: "crayon", texte: "— le jour où j'ai compris" }),
                ]),
            ]),
        ]);

        const consigne = el("div", { classe: "acte0-consigne", texte: "Retourne la photo" });

        photo.addEventListener("click", function () {

            photo.classList.toggle("retournee");
            SONS.tape();

            if (!ETAT.photoRetournee) {
                ETAT.photoRetournee = true;
                ENQUETE.trouver("photo_imprimee");
                sauvegarder();
            }

            if (photo.classList.contains("retournee")) {
                vide(consigne);
                plusTard(function () {
                    consigne.appendChild(bouton("Allumer le téléphone", function () {
                        INTRO.ecranCode();
                    }, { classe: "bouton--papier" }));
                }, 900);
            }
        });

        this.zone.appendChild(photo);
        this.zone.appendChild(consigne);

        this.zone.appendChild(el("div", {
            classe: "acte0-lien cliquable",
            texte: "relire le mot",
            auClic: function () { INTRO.ecranMot(); },
        }));

        if (ETAT.photoRetournee) {
            vide(consigne);
            consigne.appendChild(bouton("Allumer le téléphone", function () {
                INTRO.ecranCode();
            }, { classe: "bouton--papier" }));
        }
    },


    /* --------------------------------------------------------
       4. LE CODE
       -------------------------------------------------------- */
    ecranCode: function () {

        // On efface l'acte 0 : derrière, il y a le téléphone.
        if (this.zone) {
            this.zone.style.animation = "disparition 0.6s ease forwards";
            const zoneAEffacer = this.zone;
            plusTard(function () { if (zoneAEffacer.parentNode) zoneAEffacer.remove(); }, 620);
        }

        OS.dessinerAccueil();

        OS.demanderCode({
            titre: "Saisir le code",
            indice: "Quatre chiffres. « Le code, c'est la date de la photo. »",
            bonCode: CODE_TELEPHONE,

            /* On peut toujours retourner lire le mot et retourner
               la photo : rien n'est pire que d'être coincée
               devant un pavé numérique en ayant oublié l'indice. */
            libelleAnnule: "Le mot",
            annule: function () { INTRO.ecranPhoto(); },

            reussi: function () { INTRO.terminer(false); },
            rate: function () {
                // Au troisième échec, le mot de Mira revient à l'écran.
                INTRO.echecs = (INTRO.echecs || 0) + 1;
                if (INTRO.echecs === 3) {
                    OS.toast("« la date de la photo » — regarde ce qui est écrit au dos : 03.07", {
                        icone: ICONES.info, duree: 6000,
                    });
                }
            },
        });
    },


    /* --------------------------------------------------------
       terminer() — le téléphone s'ouvre
       -------------------------------------------------------- */
    terminer: function (silencieux) {

        ETAT.telephoneDeverrouille = true;
        if (ETAT.acte < 1) ETAT.acte = 1;
        sauvegarder();

        if (this.zone && this.zone.parentNode) this.zone.remove();

        OS.dessinerAccueil();
        SCENARIO.demarrer();

        /* ⚠️ On n'abandonne pas la joueuse devant seize icônes.
           Le téléphone s'ouvre là où l'histoire commence : la
           conversation avec Mira, qui est en train d'écrire.
           (Avant, on atterrissait sur l'écran d'accueil sans
           savoir quoi faire — c'était le reproche le plus juste
           qu'on pouvait faire à l'intro.) */
        if (!silencieux) {
            plusTard(function () { allerAuFil("mira"); }, 1200);
        }
    },
};
