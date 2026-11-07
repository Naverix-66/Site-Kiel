/* ============================================================
   APPLICATION — PLANS
   ============================================================
   Un seul écran : la carte du fjord, et un panneau en bas.

   C'est ici que se joue l'acte III. Quand la joueuse pense
   savoir où Lena est partie, elle pose une épingle.

   Règle de conception : une épingle fausse ne punit JAMAIS.
   Mira explique pourquoi ça ne tient pas, l'endroit reste
   marqué comme écarté, et on continue. Éliminer, c'est
   enquêter aussi.
   ============================================================ */

enregistrerApp({
    id: "plans",
    nom: "Plans",
    icone: "plans",

    ouvrir: function () {
        let lieuSelectionne = null;

        OS.pousser({
            titre: "Kieler Förde",
            plein: true,
            contenu: function (vue) {

                /* --- la carte --- */
                const zone = el("div", { classe: "carte-zone", html: dessinerCarte() });

                LIEUX.forEach(function (lieu) {

                    const ecarte = ETAT.epinglesRatees.indexOf(lieu.id) !== -1;
                    const choisi = ETAT.epinglePosee === lieu.id;

                    const marqueur = el("div", {
                        classe: "carte-lieu cliquable" +
                            (choisi ? " carte-lieu--choisi" : "") +
                            (lieuSelectionne === lieu.id ? " carte-lieu--propose" : ""),
                        style: { left: lieu.x + "%", top: lieu.y + "%" },
                        auClic: function () {
                            lieuSelectionne = lieu.id;
                            SONS.tape();
                            OS.rafraichir();
                        },
                    }, [
                        el("div", { classe: "broche glyphe", html: ICONES.epingle }),
                        el("div", {
                            classe: "etiquette-lieu",
                            texte: lieu.nom + (ecarte ? " ✕" : "") + (choisi ? " ✓" : ""),
                            style: ecarte ? { opacity: "0.45", textDecoration: "line-through" } : null,
                        }),
                    ]);

                    zone.appendChild(marqueur);
                });

                vue.appendChild(zone);

                /* --- le panneau du bas --- */
                const panneau = el("div", { classe: "carte-panneau" });

                const lieu = lieuSelectionne ? lieuParId(lieuSelectionne) : null;

                if (!lieu) {
                    panneau.appendChild(el("h3", { texte: "Kieler Förde" }));
                    panneau.appendChild(el("p", {
                        texte: ETAT.acte >= 3
                            ? "Appuie sur un endroit. Quand tu penses savoir où elle est, pose l'épingle."
                            : "Les lieux enregistrés de Lena, et tout le fjord autour.",
                    }));

                } else {
                    panneau.appendChild(el("h3", { texte: lieu.nom }));
                    panneau.appendChild(el("p", { texte: lieu.sousTitre || "" }));

                    if (ETAT.epinglePosee === lieu.id) {
                        panneau.appendChild(el("div", {
                            classe: "mira-aide",
                            style: { margin: "12px 0 0" },
                            html: "<b>C'est là.</b>Derrière le phare, la troisième cabane. La clé est sous la troisième pierre.",
                        }));

                    } else if (ETAT.epinglesRatees.indexOf(lieu.id) !== -1) {
                        panneau.appendChild(el("div", {
                            classe: "mira-aide",
                            style: { margin: "12px 0 0" },
                            html: "<b>Écarté</b>" + lieu.refus,
                        }));

                    } else if (lieu.choisissable && ETAT.acte >= 3 && !ETAT.epinglePosee) {
                        panneau.appendChild(el("div", { style: { marginTop: "12px" } }, [
                            bouton("Poser l'épingle ici", function () {
                                poserLEpingle(lieu);
                            }),
                        ]));

                    } else if (lieu.enregistre) {
                        panneau.appendChild(el("div", {
                            classe: "groupe-pied",
                            style: { padding: "8px 0 0" },
                            texte: "Lieu enregistré par Lena.",
                        }));
                    }
                }

                vue.appendChild(panneau);
            },
        });
    },
});


/* ------------------------------------------------------------
   poserLEpingle(lieu)
   ------------------------------------------------------------ */
function poserLEpingle(lieu) {

    if (lieu.bonne) {
        ETAT.epinglePosee = lieu.id;
        ENQUETE.remplirObjectif("o_lieu");
        sauvegarder();
        SONS.revelation();

        OS.alerte({
            titre: "Bülk",
            message: "Derrière le phare, trois cabanes de pêcheurs. L'une est bleue. " +
                "Elle y est allée le 3 juillet, et elle a photographié la clé.",
            boutons: [{
                texte: "C'est là", fort: true, auClic: function () {
                    OS.rafraichir();
                    if (typeof SCENARIO !== "undefined") SCENARIO.epingleTrouvee();
                },
            }],
        });
        return;
    }

    /* --- une fausse piste : on l'écarte, et ça fait avancer --- */
    if (ETAT.epinglesRatees.indexOf(lieu.id) === -1) {
        ETAT.epinglesRatees.push(lieu.id);
        sauvegarder();
    }

    SONS.echec();

    OS.alerte({
        titre: "Non, pas là",
        message: lieu.refus,
        boutons: [{
            texte: "Écarter cet endroit", fort: true, auClic: function () {
                OS.rafraichir();
                if (typeof SCENARIO !== "undefined") SCENARIO.epingleRatee(lieu.id);
            },
        }],
    });
}
