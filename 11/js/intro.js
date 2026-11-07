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
    "Son code, c'est la date de la photo. Elle est au dos.",
];


const INTRO = {

    zone: null,

    /* ========================================================
       commencer()
       ========================================================
       Appelée au démarrage si la partie n'a pas commencé.
       ======================================================== */
    commencer: function () {

        this.zone = el("div", { classe: "acte0" });
        document.getElementById("ecran").appendChild(this.zone);

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
    ecranMot: function () {

        vide(this.zone);

        const papier = el("div", { classe: "mot" });
        this.zone.appendChild(papier);

        const consigne = el("div", { classe: "acte0-consigne", texte: "" });
        this.zone.appendChild(consigne);

        let ligneCourante = 0;
        let lettreCourante = 0;
        let elementLigne = null;
        let fini = false;
        let minuteur = null;

        const curseur = el("span", { classe: "curseur" });

        const terminerLEcriture = function () {
            if (fini) return;
            fini = true;

            if (minuteur) clearTimeout(minuteur);

            vide(papier);
            LE_MOT.forEach(function (ligne) {
                papier.appendChild(el("div", {
                    texte: ligne,
                    style: ligne === "" ? { height: "14px" } : null,
                }));
            });
            papier.appendChild(el("div", { classe: "signature", texte: "— M." }));

            ETAT.motLu = true;
            sauvegarder();

            consigne.textContent = "";
            consigne.appendChild(bouton("Il y avait aussi une photo", function () {
                INTRO.ecranPhoto();
            }, { classe: "bouton--papier" }));
        };

        const ecrireUneLettre = function () {

            if (fini) return;

            if (ligneCourante >= LE_MOT.length) {
                terminerLEcriture();
                return;
            }

            const texte = LE_MOT[ligneCourante];

            if (!elementLigne) {
                elementLigne = el("div", {
                    style: texte === "" ? { height: "14px" } : null,
                });
                papier.appendChild(elementLigne);
                papier.appendChild(curseur);
            }

            if (lettreCourante >= texte.length) {
                ligneCourante++;
                lettreCourante = 0;
                elementLigne = null;
                minuteur = plusTard(ecrireUneLettre, texte === "" ? 60 : 220);
                return;
            }

            elementLigne.textContent += texte.charAt(lettreCourante);
            lettreCourante++;

            // un son très discret, une lettre sur cinq
            if (lettreCourante % 5 === 0) souffle(0.015, 0.012, 2600);

            minuteur = plusTard(ecrireUneLettre, VITESSE_ECRITURE_LETTRE);
        };

        // Un appui sur le papier termine l'écriture tout de suite.
        papier.addEventListener("click", terminerLEcriture);

        plusTard(ecrireUneLettre, 500);
    },


    /* --------------------------------------------------------
       3. LA PHOTO IMPRIMÉE
       -------------------------------------------------------- */
    ecranPhoto: function () {

        vide(this.zone);

        this.zone.appendChild(el("div", { classe: "acte0-titre", texte: "Dans l'enveloppe" }));

        const photo = el("div", { classe: "photo-imprimee" }, [
            el("div", { classe: "faces" }, [
                el("div", { classe: "face face--recto" }, [
                    peindre("fjord_juillet", { recadre: true }),
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
            indice: "Quatre chiffres. « Son code, c'était toujours la date de la photo qu'elle gardait sur elle. »",
            bonCode: CODE_TELEPHONE,
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

        if (!silencieux) {
            OS.toast("Carnet d'enquête ouvert", { icone: ICONES.carnet });
        }

        SCENARIO.demarrer();
    },
};
