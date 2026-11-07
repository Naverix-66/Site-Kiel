/* ============================================================
   APPLICATION — RÉGLAGES
   ============================================================
   L'application la plus sous-estimée du téléphone. Elle
   contient quatre choses décisives :

     - Wi-Fi          : l'heure exacte où elle est rentrée
     - Temps d'écran  : l'heure exacte où elle a posé le téléphone
     - Batterie       : combien de temps il est resté allumé, seul
     - Localisation   : une calculatrice qui suit une position

   Et, dans Mail, une règle de tri que personne ne lit jamais.
   ============================================================ */

enregistrerApp({
    id: "reglages",
    nom: "Réglages",
    icone: "reglages",

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Réglages",
            contenu: function (corps) {

                corps.appendChild(groupe(null, [
                    ligneReglage("Wi-Fi", "Brandt_Lindqvist", {
                        couleurIcone: "var(--bleu)", icone: ICONES.wifi,
                        auClic: function () { ecranWifi(); },
                    }),
                    ligneReglage("Bluetooth", "Non connecté", { couleurIcone: "var(--bleu)", icone: ICONES.lien }),
                    ligneReglage("Données cellulaires", "Pas de carte SIM", { couleurIcone: "var(--vert)", icone: ICONES.telephone }),
                ], "La carte SIM a été retirée. Le téléphone ne fonctionne qu'en wifi."));

                corps.appendChild(groupe(null, [
                    ligneReglage("Général", null, {
                        couleurIcone: "var(--texte-faible)", icone: ICONES.horloge,
                        auClic: function () { ecranGeneral(); },
                    }),
                    ligneReglage("Batterie", ETAT.batterie + " %", {
                        couleurIcone: "var(--vert)", icone: ICONES.batterie,
                        auClic: function () { ecranBatterie(); },
                    }),
                    ligneReglage("Temps d'écran", null, {
                        couleurIcone: "var(--violet)", icone: ICONES.horloge,
                        auClic: function () { ecranTempsDEcran(); },
                    }),
                    ligneReglage("Confidentialité", null, {
                        couleurIcone: "var(--bleu)", icone: ICONES.oeil,
                        auClic: function () { ecranConfidentialite(); },
                    }),
                ]));

                corps.appendChild(groupe(null, [
                    ligneReglage("Mail", "2 règles de tri", {
                        couleurIcone: "var(--bleu)", icone: ICONES.mail,
                        auClic: function () { ecranReglesMail(); },
                    }),
                    ligneReglage("Face ID et code", "Désactivé", {
                        couleurIcone: "var(--vert)", icone: ICONES.verrou,
                        auClic: function () { ecranFaceId(); },
                    }),
                    ligneReglage("Sons", ETAT.sonsActives ? "Activés" : "Coupés", {
                        couleurIcone: "var(--rose)", icone: ICONES.micro,
                        auClic: function () {
                            ETAT.sonsActives = !ETAT.sonsActives;
                            sauvegarder();
                            if (ETAT.sonsActives) SONS.tape();
                            OS.rafraichir();
                        },
                    }),
                ], "Le code de déverrouillage a été désactivé par Mira avant de poster le téléphone, pour que tu puisses l'ouvrir. Enfin : elle a essayé."));

                if (DEV) {
                    corps.appendChild(groupe("développement", [
                        ligneReglage("Tout déverrouiller", null, {
                            auClic: function () {
                                ouvrirVerrou("albumPrive");
                                ouvrirVerrou("mouchard");
                                ouvrirVerrou("coffre");
                                ETAT.acte = 4;
                                sauvegarder();
                                OS.toast("Verrous ouverts, acte IV", { info: true });
                            },
                        }),
                        ligneReglage("Effacer la sauvegarde", null, {
                            auClic: function () {
                                OS.alerte({
                                    titre: "Tout effacer ?",
                                    message: "La partie repartira de l'enveloppe.",
                                    boutons: [
                                        { texte: "Annuler" },
                                        {
                                            texte: "Effacer", danger: true, auClic: function () {
                                                effacerLaSauvegarde();
                                                window.location.reload();
                                            },
                                        },
                                    ],
                                });
                            },
                        }),
                    ]));
                }
            },
        });
    },
});


/* ------------------------------------------------------------
   WI-FI — l'heure du retour
   ------------------------------------------------------------ */
function ecranWifi() {

    OS.pousser({
        titre: "Wi-Fi",
        retourTexte: "Réglages",
        contenu: function (corps) {

            const actuel = RESEAUX_WIFI.filter(function (r) { return r.actuel; })[0];

            if (actuel) {
                corps.appendChild(groupe("réseau actuel", [
                    ligneReglage(actuel.nom, "Connecté", { auClic: function () { ficheReseau(actuel); } }),
                ], actuel.detail));
            }

            corps.appendChild(groupe("réseaux connus", RESEAUX_WIFI.filter(function (r) {
                return !r.actuel;
            }).map(function (reseau) {
                return ligneReglage(reseau.nom, reseau.detail, {
                    auClic: function () { ficheReseau(reseau); },
                });
            }), "Un téléphone garde la trace de chaque réseau auquel il s'est connecté, avec la date."));
        },
    });
}


function ficheReseau(reseau) {

    OS.pousser({
        titre: reseau.nom,
        retourTexte: "Wi-Fi",
        contenu: function (corps) {

            corps.appendChild(groupe(null, [
                ligneReglage("Dernière connexion", reseau.detail),
                ligneReglage("Connexion automatique", "Oui"),
            ], reseau.note || null));
        },
    });

    if (reseau.indice) {
        plusTard(function () { ENQUETE.trouver(reseau.indice); }, 450);
    }
}


/* ------------------------------------------------------------
   TEMPS D'ÉCRAN — l'heure où il a été posé
   ------------------------------------------------------------ */
function ecranTempsDEcran() {

    OS.pousser({
        titre: "Temps d'écran",
        retourTexte: "Réglages",
        contenu: function (corps) {

            corps.appendChild(el("div", { classe: "chiffre-cle" }, [
                el("div", { classe: "libelle", texte: "Dernier déverrouillage" }),
                el("div", { classe: "valeur", texte: justeLHeure(TEMPS_ECRAN.dernierDeverrouillage) }),
                el("div", {
                    classe: "libelle",
                    texte: dateLongue(TEMPS_ECRAN.dernierDeverrouillage) + " — puis plus rien",
                }),
            ]));

            corps.appendChild(groupe("par jour", TEMPS_ECRAN.jours.map(function (jour) {
                return ligneReglage(dateCourte(jour.t), jour.duree + " · " + jour.deverrouillages + " déverrouillages", {
                    alerte: jour.deverrouillages === 0,
                });
            }), TEMPS_ECRAN.remarque));
        },
    });

    plusTard(function () { ENQUETE.trouver(TEMPS_ECRAN.indice); }, 450);
}


/* ------------------------------------------------------------
   BATTERIE
   ------------------------------------------------------------ */
function ecranBatterie() {

    OS.pousser({
        titre: "Batterie",
        retourTexte: "Réglages",
        contenu: function (corps) {

            corps.appendChild(el("div", { classe: "chiffre-cle" }, [
                el("div", { classe: "valeur", texte: ETAT.batterie + " %" }),
                el("div", { classe: "libelle", texte: "Niveau actuel — rechargé par Mira le 19 novembre" }),
            ]));

            corps.appendChild(groupe("historique", [
                ligneReglage("Dernière charge avant", BATTERIE_HISTORIQUE.derniereCharge),
                ligneReglage("Extinction automatique", BATTERIE_HISTORIQUE.extinction, { alerte: true }),
            ], BATTERIE_HISTORIQUE.remarque));
        },
    });
}


/* ------------------------------------------------------------
   CONFIDENTIALITÉ — la ligne qui ne devrait pas être là
   ------------------------------------------------------------ */
function ecranConfidentialite() {

    OS.pousser({
        titre: "Confidentialité",
        retourTexte: "Réglages",
        contenu: function (corps) {

            corps.appendChild(groupe(null, [
                ligneReglage("Service de localisation", "Activé", {
                    auClic: function () { ecranLocalisation(); },
                }),
                ligneReglage("Suivi", "Demander"),
                ligneReglage("Analyse et améliorations", null),
            ]));
        },
    });
}


function ecranLocalisation() {

    OS.pousser({
        titre: "Localisation",
        retourTexte: "Confidentialité",
        contenu: function (corps) {

            corps.appendChild(groupe("applications", AUTORISATIONS_LOCALISATION.map(function (autorisation) {

                const ligneAutorisation = ligneReglage(
                    autorisation.nom,
                    autorisation.valeur + (autorisation.fleche ? "  ➤" : ""),
                    {
                        alerte: autorisation.alerte,
                        auClic: autorisation.alerte ? function () {
                            ENQUETE.trouver(autorisation.indice);
                            OS.alerte({
                                titre: "Calculette",
                                message: autorisation.note + "\n\nUne calculatrice n'a aucune raison de connaître une position. " +
                                    "Et encore moins « Toujours ».",
                                boutons: [{ texte: "…", fort: true }],
                            });
                        } : null,
                    }
                );

                return ligneAutorisation;
            }), "La flèche indique qu'une application a utilisé votre position récemment."));
        },
    });
}


/* ------------------------------------------------------------
   FACE ID ET CODE
   ------------------------------------------------------------ */
function ecranFaceId() {

    OS.pousser({
        titre: "Face ID et code",
        retourTexte: "Réglages",
        contenu: function (corps) {

            corps.appendChild(groupe(null, [
                ligneReglage("Face ID", "Non configuré"),
                ligneReglage("Code", "Désactivé"),
                ligneReglage("Effacement des données", "Après 10 tentatives"),
            ], "Mira a désactivé le code après l'avoir trouvé — enfin, après avoir mis onze essais à le trouver. " +
                "Elle n'a pas réussi à enlever le verrou de l'album privé : celui-là est indépendant."));
        },
    });
}


/* ------------------------------------------------------------
   GÉNÉRAL / À PROPOS
   ------------------------------------------------------------ */
function ecranGeneral() {

    OS.pousser({
        titre: "Général",
        retourTexte: "Réglages",
        contenu: function (corps) {

            corps.appendChild(groupe(null, [
                ligneReglage("Informations", null, {
                    auClic: function () {
                        OS.pousser({
                            titre: "Informations",
                            retourTexte: "Général",
                            contenu: function (zone) {
                                zone.appendChild(groupe(null, [
                                    ligneReglage("Nom", "iPhone de Lena"),
                                    ligneReglage("Modèle", "iPhone 12 mini"),
                                    ligneReglage("Capacité", "128 Go"),
                                    ligneReglage("Disponible", "11,2 Go"),
                                    ligneReglage("Photos", String(PHOTOS.length)),
                                    ligneReglage("Numéro de série", "F2LX9K8HQ1LN"),
                                ]));

                                zone.appendChild(groupe("réseau", [
                                    ligneReglage("Carte SIM", "Aucune"),
                                    ligneReglage("Adresse Wi-Fi", "A4:83:E7:2C:91:04"),
                                ]));
                            },
                        });
                    },
                }),
                ligneReglage("Stockage", "116,8 Go utilisés"),
                ligneReglage("Date et heure", "Automatique"),
            ]));
        },
    });
}
