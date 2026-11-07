/* ============================================================
   APPLICATION — LE CARNET
   ============================================================
   Ce n'est pas une application du téléphone de Lena : c'est
   celle de la joueuse. D'où le papier crème, l'encre brune et
   la typographie du calendrier — c'est le seul endroit du jeu
   où on sort du téléphone.

   Quatre onglets :
     Objectifs    — ce qu'on cherche maintenant
     Indices      — tout ce qu'on a ramassé
     Chronologie  — remettre la nuit du 8 dans l'ordre
     Conclusions  — relier deux indices pour prouver quelque chose

   Et un bouton « Mira, aide-moi », qui ne laisse jamais
   personne coincée.
   ============================================================ */

/* L'ordre juste de la nuit du 8. Chaque pièce n'apparaît que
   si l'indice correspondant a été trouvé : la chronologie sert
   aussi de liste de ce qu'il reste à chercher. */
const PIECES_CHRONO = [
    { indice: "sms_mensonge", heure: "19:42", quoi: "« je bosse tard, ne m'attends pas » — SMS à Mira" },
    { indice: "photo_horn", heure: "22:10", quoi: "Photo de la Hörnbrücke dans le brouillard" },
    { indice: "appel_tobias", heure: "22:48", quoi: "Appel de Tobias, décroché 3 secondes" },
    { indice: "sms_a_moi", heure: "23:02", quoi: "Le message qui m'était destiné par erreur" },
    { indice: "sante_pas", heure: "23:51", quoi: "4 212 pas, d'un seul tenant" },
    { indice: "wifi_retour", heure: "01:14", quoi: "Retour sur le wifi de l'appartement" },
];


enregistrerApp({
    id: "carnet",
    nom: "Carnet",
    icone: "carnet",
    dock: true,
    classe: "app--carnet",

    badge: function () {
        // le badge signale une déduction possible : c'est l'appel
        // du jeu, « tu as de quoi conclure quelque chose »
        return ENQUETE.deductionsOuvertes().length;
    },

    ouvrir: function () {
        let onglet = "objectifs";

        OS.pousser({
            titre: "Carnet d'enquête",
            contenu: function (corps) {

                const segments = el("div", { classe: "segments" });

                [["objectifs", "Objectifs"], ["indices", "Indices"],
                 ["chrono", "Nuit du 8"], ["conclusions", "Conclusions"]]
                    .forEach(function (paire) {
                        segments.appendChild(el("div", {
                            classe: "segment" + (onglet === paire[0] ? " actif" : ""),
                            texte: paire[1],
                            auClic: function () {
                                onglet = paire[0];
                                SONS.tape();
                                OS.rafraichir();
                            },
                        }));
                    });

                corps.appendChild(segments);

                if (onglet === "objectifs") ongletObjectifs(corps);
                if (onglet === "indices") ongletIndices(corps);
                if (onglet === "chrono") ongletChronologie(corps);
                if (onglet === "conclusions") ongletConclusions(corps);
            },
        });
    },
});


/* ------------------------------------------------------------
   ONGLET 1 — OBJECTIFS
   ------------------------------------------------------------ */
function ongletObjectifs(corps) {

    const objectifs = ENQUETE.objectifs();

    objectifs.forEach(function (objectif) {
        const fait = ENQUETE.objectifFait(objectif.id);

        corps.appendChild(el("div", { classe: "objectif" + (fait ? " objectif--fait" : "") }, [
            el("div", {
                classe: "coche-objectif glyphe",
                html: fait ? ICONES.cocheCercle : ICONES.cercleVide,
            }),
            el("div", {}, [
                el("div", { classe: "objectif-titre", texte: objectif.titre }),
                el("div", { classe: "objectif-texte", texte: objectif.texte }),
            ]),
        ]));
    });

    if (objectifs.length === 0) {
        corps.appendChild(videMessage("Ouvre le téléphone. On verra bien."));
    }

    /* --- le coup de main --- */
    corps.appendChild(el("div", { classe: "zone-boutons" }, [
        bouton("Mira, aide-moi", function () {
            SONS.message();
            const texte = ENQUETE.aide();

            OS.alerte({
                titre: "Mira",
                message: texte,
                boutons: [{ texte: "Merci", fort: true }],
            });

            ETAT.messagesAjoutes.push({
                fil: "mira",
                de: "eux",
                t: AUJOURDHUI + " " + heureReelle(),
                txt: texte,
            });
            sauvegarder();
        }, { classe: "bouton--discret" }),
    ]));

    corps.appendChild(el("div", {
        classe: "groupe-pied",
        style: { padding: "0 18px 24px", textAlign: "center" },
        texte: ETAT.indices.length + " traces notées · " + ENQUETE.progression() + " % du dossier",
    }));
}


/* ------------------------------------------------------------
   ONGLET 2 — INDICES
   ------------------------------------------------------------ */
function ongletIndices(corps) {

    const indices = ENQUETE.liste();

    if (indices.length === 0) {
        corps.appendChild(videMessage("Rien pour l'instant.\nTout ce que tu liras d'important se notera ici tout seul."));
        return;
    }

    // les plus récents en haut : c'est ce qu'on vient de trouver
    // qui intéresse
    indices.slice().reverse().forEach(function (indice) {

        corps.appendChild(el("div", {
            classe: "indice-carte cliquable",
            auClic: function () {
                if (!indice.app || !app(indice.app)) return;
                SONS.tape();
                OS.ouvrirApp(indice.app);
            },
        }, [
            el("div", { classe: "quoi", texte: indice.quoi }),
            indice.quand ? el("div", { classe: "quand", texte: dateLongue(indice.quand) + (justeLHeure(indice.quand) ? " — " + justeLHeure(indice.quand) : "") }) : null,
            el("div", { classe: "ou", texte: indice.ou }),
        ]));
    });

    corps.appendChild(el("div", {
        classe: "groupe-pied",
        style: { padding: "6px 18px 24px", textAlign: "center" },
        texte: "Appuie sur une trace pour retourner là où tu l'as trouvée.",
    }));
}


/* ------------------------------------------------------------
   ONGLET 3 — LA CHRONOLOGIE
   ------------------------------------------------------------ */
function ongletChronologie(corps) {

    /* Les pièces disponibles : celles dont on a l'indice. */
    const disponibles = PIECES_CHRONO.filter(function (piece) {
        return ENQUETE.a(piece.indice);
    });

    const manquantes = PIECES_CHRONO.length - disponibles.length;

    corps.appendChild(el("div", { classe: "question-carte" }, [
        el("h3", { texte: "La nuit du 8 novembre" }),
        el("p", {
            texte: ETAT.chronoValidee
                ? "Remise dans l'ordre. Elle est rentrée à 1 h 14 : elle n'a pas disparu dehors."
                : "Six traces, six applications différentes. Remets-les dans l'ordre où elles se sont produites.",
        }),
        manquantes > 0 && !ETAT.chronoValidee
            ? el("div", {
                classe: "consigne",
                texte: "Il manque encore " + manquantes + (manquantes > 1 ? " traces." : " trace.") + " Continue de fouiller.",
            })
            : null,
    ]));

    if (disponibles.length === 0) {
        corps.appendChild(videMessage("Aucune trace de cette nuit-là pour l'instant."));
        return;
    }

    /* L'ordre courant : celui de la joueuse, ou un ordre mélangé
       mais STABLE (pas de nouveau mélange à chaque affichage). */
    if (!ETAT.ordreChrono) {
        ETAT.ordreChrono = melangeStable(PIECES_CHRONO.map(function (p) { return p.indice; }));
        sauvegarder();
    }

    const ordre = ETAT.ordreChrono.filter(function (id) {
        return disponibles.some(function (p) { return p.indice === id; });
    });

    // une pièce trouvée après le premier mélange : on l'ajoute
    disponibles.forEach(function (piece) {
        if (ordre.indexOf(piece.indice) === -1) ordre.push(piece.indice);
    });

    const zone = el("div", { classe: "chrono-liste" });

    ordre.forEach(function (id, position) {

        const piece = PIECES_CHRONO.filter(function (p) { return p.indice === id; })[0];
        if (!piece) return;

        const bougerLaPiece = function (direction) {
            const nouvelOrdre = ordre.slice();
            const cible = position + direction;
            if (cible < 0 || cible >= nouvelOrdre.length) return;

            const temporaire = nouvelOrdre[position];
            nouvelOrdre[position] = nouvelOrdre[cible];
            nouvelOrdre[cible] = temporaire;

            // on réécrit l'ordre complet en gardant les pièces
            // pas encore trouvées à la fin
            const reste = ETAT.ordreChrono.filter(function (x) { return nouvelOrdre.indexOf(x) === -1; });
            ETAT.ordreChrono = nouvelOrdre.concat(reste);
            sauvegarder();
            SONS.tape();
            OS.rafraichir();
        };

        zone.appendChild(el("div", { classe: "chrono-piece" + (ETAT.chronoValidee ? " posee" : "") }, [
            el("div", { classe: "rang", texte: ETAT.chronoValidee ? piece.heure.slice(0, 2) : String(position + 1) }),
            el("div", { classe: "quoi", texte: piece.quoi }),
            ETAT.chronoValidee
                ? el("div", { classe: "quand", style: { fontSize: "12px", color: "var(--accent-fonce)" }, texte: piece.heure })
                : el("div", { classe: "fleches" }, [
                    el("div", {
                        classe: "fleche-bouton",
                        auClic: function () { bougerLaPiece(-1); },
                    }, [el("span", { classe: "glyphe", html: ICONES.flecheHaut })]),
                    el("div", {
                        classe: "fleche-bouton fleche-bouton--bas",
                        auClic: function () { bougerLaPiece(1); },
                    }, [el("span", { classe: "glyphe", html: ICONES.flecheHaut })]),
                ]),
        ]));
    });

    corps.appendChild(zone);

    if (!ETAT.chronoValidee) {
        corps.appendChild(el("div", { classe: "zone-boutons" }, [
            bouton("Valider la chronologie", function () { validerLaChrono(ordre); },
                { desactive: manquantes > 0 }),
        ]));
    }
}


/* Un mélange qui ne dépend pas du hasard : on décale la liste
   d'un cran sur deux. Comme ça, la chronologie n'est jamais
   déjà juste au départ, et elle ne change pas d'un affichage
   à l'autre. */
function melangeStable(liste) {
    const pairs = liste.filter(function (x, i) { return i % 2 === 0; });
    const impairs = liste.filter(function (x, i) { return i % 2 === 1; });
    return impairs.reverse().concat(pairs);
}


function validerLaChrono(ordre) {

    const juste = PIECES_CHRONO.map(function (p) { return p.indice; });

    const bon = ordre.length === juste.length && ordre.every(function (id, i) {
        return id === juste[i];
    });

    if (bon) {
        ETAT.chronoValidee = true;
        ENQUETE.remplirObjectif("o_chrono");
        sauvegarder();
        SONS.succes();

        OS.alerte({
            titre: "1 h 14",
            message: "Elle est rentrée. Elle n'a pas disparu dans le port : elle a dormi chez elle, " +
                "et elle est repartie à l'aube, sans son téléphone.\n\nCe n'est pas une enquête sur une nuit. " +
                "C'est une enquête sur une décision.",
            boutons: [{
                texte: "Continuer", fort: true, auClic: function () {
                    OS.rafraichir();
                    if (typeof SCENARIO !== "undefined") SCENARIO.chronoValidee();
                },
            }],
        });
        return;
    }

    SONS.echec();

    /* Un indice utile plutôt qu'un simple « non » : combien de
       traces sont à la bonne place. */
    let bonnesPlaces = 0;
    ordre.forEach(function (id, i) {
        if (id === juste[i]) bonnesPlaces++;
    });

    OS.alerte({
        titre: "Pas encore",
        message: bonnesPlaces + " trace" + (bonnesPlaces > 1 ? "s sont" : " est") + " à la bonne place sur " +
            juste.length + ".\n\nRappel : les heures sont écrites dans les applications. Dans Messages, " +
            "sous chaque bulle. Dans Photos, en haut de la visionneuse.",
        boutons: [{ texte: "Je reprends", fort: true }],
    });
}


/* ------------------------------------------------------------
   ONGLET 4 — LES CONCLUSIONS
   ------------------------------------------------------------ */
function ongletConclusions(corps) {

    const ouvertes = ENQUETE.deductionsOuvertes();
    const faites = ENQUETE.deductionsFaites();

    if (ouvertes.length === 0 && faites.length === 0) {
        corps.appendChild(videMessage("Rien à conclure pour l'instant.\nLe carnet te posera une question dès que tu auras de quoi y répondre."));
        return;
    }

    ouvertes.forEach(function (deduction) {
        corps.appendChild(el("div", {
            classe: "question-carte cliquable",
            auClic: function () { ecranDeduction(deduction); },
        }, [
            el("h3", { texte: deduction.question }),
            el("p", { texte: deduction.consigne }),
            el("div", { classe: "consigne", texte: "Répondre →" }),
        ]));
    });

    faites.forEach(function (deduction) {
        corps.appendChild(el("div", { classe: "question-carte" }, [
            el("h3", { texte: deduction.question }),
            el("p", { style: { color: "var(--encre)" }, texte: deduction.conclusion }),
            el("div", { classe: "consigne" }, [
                el("span", { classe: "etiquette etiquette--fait", texte: "établi" }),
            ]),
        ]));
    });
}


/* ------------------------------------------------------------
   RELIER DEUX INDICES
   ------------------------------------------------------------
   Le geste central du jeu. On choisit deux traces, et on
   regarde si elles prouvent quelque chose ensemble.
   ------------------------------------------------------------ */
function ecranDeduction(deduction) {

    let choisis = [];

    OS.pousser({
        titre: "Conclusion",
        retourTexte: "Carnet",
        contenu: function (corps) {

            corps.appendChild(el("div", { classe: "question-carte" }, [
                el("h3", { texte: deduction.question }),
                el("p", { texte: deduction.consigne }),
                el("div", {
                    classe: "consigne",
                    texte: choisis.length === 0 ? "Choisis une première trace."
                        : (choisis.length === 1 ? "Et maintenant la deuxième." : "Deux traces choisies."),
                }),
            ]));

            ENQUETE.liste().forEach(function (indice) {

                const estChoisi = choisis.indexOf(indice.id) !== -1;

                corps.appendChild(el("div", {
                    classe: "indice-carte cliquable" + (estChoisi ? " choisi" : ""),
                    auClic: function () {
                        SONS.tape();

                        if (estChoisi) {
                            choisis = choisis.filter(function (id) { return id !== indice.id; });
                        } else {
                            if (choisis.length >= 2) choisis.shift();
                            choisis.push(indice.id);
                        }

                        OS.rafraichir();
                    },
                }, [
                    el("div", { classe: "quoi", texte: indice.quoi }),
                    el("div", { classe: "ou", texte: indice.ou }),
                ]));
            });

            corps.appendChild(el("div", { classe: "zone-boutons" }, [
                bouton("Relier ces deux traces", function () {

                    const resultat = ENQUETE.valider(deduction.id, choisis);

                    if (resultat.bon) {
                        OS.alerte({
                            titre: "C'est établi",
                            message: resultat.texte,
                            boutons: [{
                                texte: "Noter dans le carnet", fort: true, auClic: function () {
                                    OS.retour();
                                },
                            }],
                        });
                    } else {
                        OS.alerte({
                            titre: "Ça ne tient pas",
                            message: resultat.texte,
                            boutons: [{ texte: "Je réessaie", fort: true }],
                        });
                    }
                }, { desactive: choisis.length !== 2 }),
            ]));
        },
    });
}
