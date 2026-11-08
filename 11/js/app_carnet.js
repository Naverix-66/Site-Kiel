/* ============================================================
   APPLICATION — LE CARNET
   ============================================================
   ⚠️ TROISIÈME VERSION, et la bonne : le carnet ne raisonne
   plus à la place de la joueuse, et il n'explique plus rien.

   Il ne reste que quatre choses, sur un seul écran :

       1. ce qu'il faut faire maintenant — une ligne, un bouton
       2. ce que je sais déjà — des phrases courtes
       3. la nuit du 8 — un chiffre : 4/6
       4. mes traces — un chiffre

   Les questions de raisonnement, elles, ont déménagé dans la
   conversation avec Mira (voir scenario.js). On répond à une
   amie qui demande, pas à un formulaire.
   ============================================================ */

/* L'ordre juste de la nuit du 8. Une pièce n'apparaît que si on
   a trouvé la trace : l'écran sert donc aussi de liste de ce
   qu'il reste à chercher. */
const PIECES_CHRONO = [
    { indice: "sms_mensonge", heure: "19:42", quoi: "« je bosse tard » — SMS à Mira" },
    { indice: "photo_horn", heure: "22:10", quoi: "Photo de la Hörnbrücke" },
    { indice: "appel_tobias", heure: "22:48", quoi: "Appel de Tobias, 3 secondes" },
    { indice: "sms_a_moi", heure: "23:02", quoi: "Le message qui m'était destiné" },
    { indice: "sante_pas", heure: "23:51", quoi: "4 212 pas" },
    { indice: "wifi_retour", heure: "01:14", quoi: "Retour sur le wifi de l'appartement" },
];


enregistrerApp({
    id: "carnet",
    nom: "Carnet",
    icone: "carnet",
    dock: true,
    classe: "app--carnet",

    // plus de pastille rouge : le carnet n'a rien à réclamer,
    // c'est Mira qui vient poser les questions
    badge: function () { return 0; },

    ouvrir: function () {
        OS.pousser({
            titre: "Carnet",
            contenu: function (corps) { ecranCarnet(corps); },
        });
    },
});


function ecranCarnet(corps) {

    const compte = questionsDuDossier();

    /* --- l'en-tête du dossier --- */
    corps.appendChild(el("div", { classe: "dossier-entete" }, [
        el("div", { classe: "dossier-reference", texte: "DOSSIER 11-4482/26" }),
        el("h2", { texte: "Brandt, Lena" }),
        el("div", { classe: "dossier-compte" }, [
            el("b", { texte: compte.repondues + " / " + compte.total }),
            el("span", { texte: " questions répondues" }),
        ]),
        el("div", { classe: "avancement-barre" }, [
            el("i", { style: { width: Math.round((compte.repondues / compte.total) * 100) + "%" } }),
        ]),
    ]));

    /* --- la prochaine chose à faire, en une ligne --- */
    const restants = ENQUETE.objectifs().filter(function (o) { return !ENQUETE.objectifFait(o.id); });

    if (restants.length > 0) {
        const courant = restants[0];

        corps.appendChild(el("div", {
            classe: "bande-maintenant cliquable",
            auClic: function () {
                const cible = courant.cible;
                if (!cible) return;
                if (cible.onglet === "chrono") { ecranChronologie(); return; }
                if (cible.fil) { allerAuFil(cible.fil); return; }
                if (cible.app) OS.ouvrirApp(cible.app);
            },
        }, [
            el("div", {}, [
                el("div", { classe: "bande-maintenant-sur", texte: "MAINTENANT" }),
                el("div", { classe: "bande-maintenant-titre", texte: courant.titre }),
            ]),
            el("span", { classe: "glyphe chevron-carte", html: ICONES.chevron }),
        ]));
    }

    /* --- le dossier : les questions, groupe par groupe --- */
    DOSSIER.forEach(function (groupeDeQuestions) {

        const accessible = ETAT.acte >= groupeDeQuestions.acte;

        corps.appendChild(el("div", { classe: "titre-section" }, [
            el("span", { texte: groupeDeQuestions.groupe.toUpperCase() }),
        ]));

        groupeDeQuestions.questions.forEach(function (question) {

            /* pas encore accessible : la ligne est caviardée */
            if (!accessible) {
                corps.appendChild(el("div", { classe: "question-ligne question-ligne--secrete" }, [
                    el("span", { classe: "question-puce", texte: "·" }),
                    el("span", {
                        classe: "caviarde",
                        style: { width: (55 + (question.texte.length % 7) * 5) + "%" },
                    }),
                ]));
                return;
            }

            const repondue = question.repondue();

            const ligneQuestion = el("div", {
                classe: "question-ligne" + (repondue ? " question-ligne--repondue" : ""),
                auClic: (!repondue && question.ecran) ? question.ecran : null,
            }, [
                el("span", { classe: "question-puce", texte: repondue ? "✓" : "?" }),
                el("div", {}, [
                    el("div", { classe: "question-texte", texte: question.texte }),
                    repondue
                        ? el("div", { classe: "question-reponse", texte: question.reponse })
                        : (question.ecran
                            ? el("div", { classe: "question-action", texte: "y répondre →" })
                            : null),
                ]),
            ]);

            corps.appendChild(ligneQuestion);
        });
    });

    /* --- le bas : les traces, et le coup de main --- */
    corps.appendChild(el("div", {
        classe: "lien-traces cliquable",
        texte: ETAT.indices.length + " traces notées  →",
        auClic: function () { ecranDesTraces(); },
    }));

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
}


function titreDeSection(texte) {
    return el("div", { classe: "titre-section" }, [el("span", { texte: texte.toUpperCase() })]);
}


/* ------------------------------------------------------------
   LES TRACES
   ------------------------------------------------------------ */
function ecranDesTraces() {

    OS.pousser({
        titre: "Mes traces",
        retourTexte: "Carnet",
        contenu: function (corps) {

            const traces = ENQUETE.liste();

            if (traces.length === 0) {
                corps.appendChild(videMessage("Rien pour l'instant."));
                return;
            }

            traces.slice().reverse().forEach(function (indice) {
                corps.appendChild(el("div", {
                    classe: "indice-carte cliquable",
                    auClic: function () {
                        if (!indice.app || !app(indice.app)) return;
                        SONS.tape();
                        OS.ouvrirApp(indice.app);
                    },
                }, [
                    el("div", { classe: "quoi", texte: indice.quoi }),
                    el("div", { classe: "ou", texte: indice.ou }),
                ]));
            });
        },
    });
}


/* ------------------------------------------------------------
   LA NUIT DU 8
   ------------------------------------------------------------ */
function ecranChronologie() {

    OS.pousser({
        titre: "La nuit du 8",
        retourTexte: "Carnet",
        contenu: function (corps) { contenuChronologie(corps); },
    });
}


function contenuChronologie(corps) {

    const disponibles = PIECES_CHRONO.filter(function (p) { return ENQUETE.a(p.indice); });
    const manquantes = PIECES_CHRONO.filter(function (p) { return !ENQUETE.a(p.indice); });

    corps.appendChild(el("div", { classe: "avancement" }, [
        el("div", { classe: "avancement-texte" }, [
            el("span", { texte: ETAT.chronoValidee ? "Chronologie établie" : "Traces retrouvées" }),
            el("span", { texte: disponibles.length + " / " + PIECES_CHRONO.length }),
        ]),
        el("div", { classe: "avancement-barre" }, [
            el("i", { style: { width: Math.round((disponibles.length / PIECES_CHRONO.length) * 100) + "%" } }),
        ]),
    ]));

    /* --- ce qui manque, et où le chercher --- */
    if (manquantes.length > 0 && !ETAT.chronoValidee) {
        corps.appendChild(titreDeSection("Il manque"));

        manquantes.forEach(function (piece) {
            const indice = INDICES[piece.indice] || {};
            corps.appendChild(el("div", { classe: "etape etape--manquante" }, [
                el("div", { classe: "etape-puce", texte: "?" }),
                el("div", { classe: "etape-titre", texte: indice.ou || "quelque part" }),
            ]));
        });
    }

    if (disponibles.length === 0) return;

    corps.appendChild(titreDeSection(ETAT.chronoValidee ? "Cette nuit-là" : "À remettre dans l'ordre"));

    /* L'ordre courant : celui de la joueuse, ou un ordre mélangé
       mais STABLE (pas de nouveau mélange à chaque affichage). */
    if (!ETAT.ordreChrono) {
        ETAT.ordreChrono = melangeStable(PIECES_CHRONO.map(function (p) { return p.indice; }));
        sauvegarder();
    }

    const ordre = ETAT.ordreChrono.filter(function (id) {
        return disponibles.some(function (p) { return p.indice === id; });
    });

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
                ? el("div", { style: { fontSize: "12px", color: "var(--accent-fonce)" }, texte: piece.heure })
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
            bouton(manquantes.length > 0 ? "Il manque des traces" : "Valider l'ordre",
                function () { validerLaChrono(ordre); },
                { desactive: manquantes.length > 0 }),
        ]));
    }
}


/* Un mélange sans hasard : on intercale, donc l'ordre de départ
   n'est jamais déjà le bon, et il ne change pas d'un affichage
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
            message: "Elle est rentrée. Elle a dormi quatre heures, et elle est repartie à l'aube sans son téléphone.",
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

    let bonnesPlaces = 0;
    ordre.forEach(function (id, i) { if (id === juste[i]) bonnesPlaces++; });

    OS.alerte({
        titre: bonnesPlaces + " sur " + juste.length + " à la bonne place",
        message: "Les heures sont écrites partout : sous les messages, en haut des photos, dans les réglages.",
        boutons: [{ texte: "Je reprends", fort: true }],
    });
}
