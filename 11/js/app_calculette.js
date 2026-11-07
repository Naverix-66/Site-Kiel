/* ============================================================
   APPLICATIONS — LES DEUX CALCULATRICES
   ============================================================
   Il y en a deux dans le dossier Utilitaires. La première
   calcule. La seconde demande un code.

   C'est le cœur de l'acte II, et c'est volontairement très
   simple à trouver et très difficile à remarquer : l'icône est
   la même, le nom change d'une lettre. « Calculatrice » et
   « Calculette ».

   Les vraies applications de surveillance grand public font
   exactement ça.
   ============================================================ */


/* ============================================================
   1. LA VRAIE — elle calcule, pour de bon
   ============================================================ */
enregistrerApp({
    id: "calculatrice",
    nom: "Calculatrice",
    icone: "calculette",
    dossier: "utilitaires",

    ouvrir: function () {

        let affichage = "0";
        let memoire = null;
        let operation = null;
        let onRecommence = false;

        OS.pousser({
            sansBarre: true,
            plein: true,
            contenu: function (vue) {

                vue.appendChild(el("div", { classe: "calc-ecran", texte: affichage }));

                const touches = el("div", { classe: "calc-touches" });

                const calculer = function () {
                    const a = parseFloat(memoire);
                    const b = parseFloat(affichage);

                    if (operation === "+") return a + b;
                    if (operation === "−") return a - b;
                    if (operation === "×") return a * b;
                    if (operation === "÷") return b === 0 ? "Erreur" : a / b;
                    return b;
                };

                const chiffre = function (c) {
                    SONS.clavier();
                    if (onRecommence || affichage === "0") {
                        affichage = c;
                        onRecommence = false;
                    } else if (affichage.length < 11) {
                        affichage += c;
                    }
                    OS.rafraichir();
                };

                const poserOperation = function (op) {
                    SONS.clavier();
                    if (operation && !onRecommence) {
                        affichage = String(calculer());
                    }
                    memoire = affichage;
                    operation = op;
                    onRecommence = true;
                    OS.rafraichir();
                };

                const disposition = [
                    [{ t: "C", classe: "gris" }, { t: "+/−", classe: "gris" }, { t: "%", classe: "gris" }, { t: "÷", classe: "orange" }],
                    [{ t: "7" }, { t: "8" }, { t: "9" }, { t: "×", classe: "orange" }],
                    [{ t: "4" }, { t: "5" }, { t: "6" }, { t: "−", classe: "orange" }],
                    [{ t: "1" }, { t: "2" }, { t: "3" }, { t: "+", classe: "orange" }],
                    [{ t: "0", large: true }, { t: "," }, { t: "=", classe: "orange" }],
                ];

                disposition.forEach(function (rangee) {
                    rangee.forEach(function (touche) {

                        touches.appendChild(el("div", {
                            classe: "calc-touche" +
                                (touche.classe ? " calc-touche--" + touche.classe : "") +
                                (touche.large ? " calc-touche--large" : ""),
                            texte: touche.t,
                            auClic: function () {

                                const t = touche.t;

                                if ("0123456789".indexOf(t) !== -1) { chiffre(t); return; }

                                if (t === "," ) {
                                    if (affichage.indexOf(".") === -1) { affichage += "."; OS.rafraichir(); }
                                    return;
                                }

                                if (t === "C") {
                                    SONS.tape();
                                    affichage = "0"; memoire = null; operation = null;
                                    OS.rafraichir();
                                    return;
                                }

                                if (t === "+/−") {
                                    affichage = String(-parseFloat(affichage));
                                    OS.rafraichir();
                                    return;
                                }

                                if (t === "%") {
                                    affichage = String(parseFloat(affichage) / 100);
                                    OS.rafraichir();
                                    return;
                                }

                                if (t === "=") {
                                    SONS.clavier();
                                    if (operation) {
                                        affichage = String(calculer());
                                        operation = null;
                                        memoire = null;
                                        onRecommence = true;
                                        OS.rafraichir();
                                    }
                                    return;
                                }

                                poserOperation(t);
                            },
                        }));
                    });
                });

                vue.appendChild(touches);
            },
        });
    },
});


/* ============================================================
   2. L'AUTRE
   ============================================================ */
enregistrerApp({
    id: "calculette",
    nom: "Calculette",
    icone: "calculette",
    dossier: "utilitaires",

    ouvrir: function () {

        if (!estOuvert("mouchard")) {
            ENQUETE.trouver("deux_calculettes");

            OS.demanderCode({
                titre: "Code d'accès",
                indice: "Ce n'est pas une calculatrice. Et ce n'est pas son code à elle.",
                bonCode: CODE_MOUCHARD,
                sansHorloge: true,
                annule: function () { OS.fermerApp(); },
                reussi: function () {
                    ouvrirVerrou("mouchard");
                    SONS.revelation();
                    ENQUETE.trouver("mouchard");
                    ENQUETE.remplirObjectif("o_mouchard");
                    // on rouvre l'application : l'écran du mouchard
                    // devient l'écran d'accueil de l'app, et la
                    // fausse calculatrice disparaît de la pile.
                    OS.ouvrirApp("calculette");
                },
            });

            // Pendant que le pavé est affiché, on pose quand même
            // l'écran en dessous : la fausse calculatrice.
            OS.pousser({
                sansBarre: true,
                plein: true,
                contenu: function (vue) {
                    vue.appendChild(el("div", { classe: "calc-ecran", texte: "0" }));
                    vue.appendChild(el("div", {
                        classe: "vide-message",
                        texte: "Cette application demande un code d'accès.",
                    }));
                },
            });
            return;
        }

        ecranMouchard();
    },
});


/* ------------------------------------------------------------
   L'INTÉRIEUR DU MOUCHARD
   ------------------------------------------------------------ */
function ecranMouchard() {

    OS.pousser({
        titre: MOUCHARD.nomReel,
        plein: true,
        contenu: function (vue) {

            vue.appendChild(el("div", { classe: "mouchard-entete" }, [
                el("h2", { texte: MOUCHARD.nomReel }),
                el("p", { texte: "Affiché sous le nom « " + MOUCHARD.nomAffiche + " » sur cet appareil." }),
            ]));

            const corps = el("div", { classe: "corps" });

            corps.appendChild(groupe(null, [
                ligneReglage("Appareil surveillé", "iPhone de Lena"),
                ligneReglage("Appareil administrateur", MOUCHARD.appareilAdmin, {
                    alerte: true,
                    auClic: function () {
                        ENQUETE.trouver("appareil_jumele");
                        OS.alerte({
                            titre: MOUCHARD.appareilAdmin,
                            message: "C'est cet appareil qui reçoit les positions et les alertes. " +
                                "Il peut les consulter à tout moment, sans que l'appareil surveillé en soit informé.",
                            boutons: [{ texte: "Fermer", fort: true }],
                        });
                    },
                }),
                ligneReglage("Installé le", MOUCHARD.installe),
                ligneReglage("Historique conservé", MOUCHARD.retention),
            ], "Abonnement actif depuis le 12 avril. Septième mois consécutif."));

            corps.appendChild(groupe("alertes configurées", MOUCHARD.alertes.map(function (alerte) {
                return ligneReglage(alerte, "Activée");
            })));

            corps.appendChild(groupe(null, [
                ligneReglage("Journal des positions", "30 jours", {
                    auClic: function () { ecranJournal(); },
                }),
            ]));

            corps.appendChild(el("div", { classe: "zone-boutons" }, [
                bouton("Désinstaller l'application", function () {
                    OS.alerte({
                        titre: "Ne fais pas ça",
                        message: "Une application effacée, c'est une preuve effacée — et l'appareil administrateur " +
                            "reçoit une notification dans la minute. C'est écrit noir sur blanc dans la page " +
                            "qu'elle a lue le 6 novembre à 2 h 16.",
                        boutons: [{ texte: "Ne pas y toucher", fort: true }],
                    });
                }, { classe: "bouton--danger" }),
            ]));

            vue.appendChild(corps);
        },
    });
}


function ecranJournal() {

    OS.pousser({
        titre: "Journal des positions",
        retourTexte: "Retour",
        contenu: function (corps) {

            corps.appendChild(el("div", {
                classe: "groupe-pied",
                style: { padding: "12px 18px" },
                texte: "Les positions de plus de 30 jours sont supprimées. Le journal commence le 20 octobre.",
            }));

            let jourCourant = "";

            JOURNAL_POSITIONS.forEach(function (position) {

                const jour = position.t.split(" ")[0];
                if (jour !== jourCourant) {
                    jourCourant = jour;
                    corps.appendChild(el("div", {
                        classe: "groupe-titre",
                        style: { padding: "14px 16px 6px" },
                        texte: dateLongue(position.t),
                    }));
                }

                corps.appendChild(el("div", {
                    classe: "journal-ligne" + (position.souligne ? " journal-ligne--souligne" : ""),
                }, [
                    el("div", { classe: "journal-heure", texte: justeLHeure(position.t) }),
                    el("div", { classe: "journal-lieu", texte: position.lieu }),
                    position.alerte
                        ? el("span", { classe: "etiquette etiquette--alerte", texte: "alerte envoyée" })
                        : null,
                ]));
            });

            corps.appendChild(el("div", {
                classe: "mira-aide",
                html: "<b>Ce qu'il a vu, lui</b>Une fille rentrée chez elle à 1 h 14, et qui n'est plus ressortie. " +
                    "Pendant trois jours, son téléphone lui a répété « Domicile » toutes les heures.",
            }));

            if (ETAT.acte >= 4 && !ETAT.preuvesEnvoyees) {
                corps.appendChild(el("div", { classe: "zone-boutons" }, [
                    bouton("Transférer ce journal à Me Vogt", function () {
                        SCENARIO.envoyerPreuves();
                    }),
                ]));
            }
        },
    });

    plusTard(function () {
        ENQUETE.trouverPlusieurs(["journal_47", "journal_domicile"]);
    }, 500);
}
