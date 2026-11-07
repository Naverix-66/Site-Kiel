/* ============================================================
   APPLICATION — SANTÉ
   ============================================================
   Un écran « Résumé » fait de cartes, comme la vraie
   application : un titre de couleur, un grand chiffre, un
   graphique. Rien d'autre.

   Et dedans, la plus belle preuve du jeu : 4 212 pas entre
   23 h 51 et 1 h 08. Personne n'efface ses pas. C'est ce qui
   casse l'hypothèse « elle s'est noyée dans le port » : elle a
   marché une heure et quart, et elle est rentrée.
   ============================================================ */

enregistrerApp({
    id: "sante",
    nom: "Santé",
    icone: "sante",

    ouvrir: function () {
        let jourAffiche = "09/11";

        ecranOnglets({
            grandTitre: "Résumé",
            onglets: [
                { id: "resume", nom: "Résumé", icone: ICONES.coeur },
                { id: "parcourir", nom: "Parcourir", icone: ICONES.loupe },
            ],
            defaut: "resume",

            dessiner: function (corps, onglet) {

                if (onglet === "parcourir") {
                    corps.appendChild(champDeRecherche("Données de santé"));
                    corps.appendChild(groupe("catégories", [
                        ligneReglage("Activité", "6 jours", { couleurIcone: "var(--orange)", icone: ICONES.flecheHaut }),
                        ligneReglage("Sommeil", "Aucune donnée", { couleurIcone: "var(--violet)", icone: ICONES.horloge }),
                        ligneReglage("Fréquence cardiaque", "Aucun appareil", { couleurIcone: "var(--rouge)", icone: ICONES.coeur }),
                    ]));
                    return;
                }

                /* --- le choix du jour, en pastilles --- */
                const jours = el("div", { classe: "pastilles-jours" });

                SANTE_JOURS.forEach(function (j) {
                    jours.appendChild(el("div", {
                        classe: "pastille-jour" + (j.t === jourAffiche ? " pastille-jour--active" : ""),
                        auClic: function () {
                            jourAffiche = j.t;
                            SONS.tape();
                            OS.rafraichir();
                            if (j.indice) ENQUETE.trouver(j.indice);
                        },
                    }, [
                        el("div", { classe: "pastille-jour-nom", texte: dateCourte(j.t).split(" ")[1] }),
                        el("div", { classe: "pastille-jour-nombre", texte: dateCourte(j.t).split(" ")[0] }),
                    ]));
                });

                corps.appendChild(jours);

                const jour = SANTE_JOURS.filter(function (j) { return j.t === jourAffiche; })[0] || SANTE_JOURS[0];

                /* --- la carte « Pas » --- */
                const carte = el("div", { classe: "carte-sante" });

                carte.appendChild(el("div", { classe: "carte-sante-titre" }, [
                    el("span", { texte: "Pas" }),
                    el("span", { classe: "carte-sante-date", texte: dateLongue(jour.t) }),
                ]));

                carte.appendChild(el("div", {
                    classe: "carte-sante-valeur",
                    texte: String(jour.total).replace(/\B(?=(\d{3})+(?!\d))/g, " "),
                }));

                const maximum = Math.max.apply(null, jour.heures.concat([1]));
                const graphique = el("div", { classe: "graphique" });

                jour.heures.forEach(function (pas, heure) {
                    graphique.appendChild(el("i", {
                        classe: pas === 0 ? "zero" : (heure <= 5 || heure >= 22 ? "nuit" : ""),
                        style: { height: Math.max(Math.round((pas / maximum) * 100), 1) + "%" },
                    }));
                });

                carte.appendChild(graphique);

                carte.appendChild(el("div", { classe: "graphique-axes" }, [
                    el("span", { texte: "0 h" }),
                    el("span", { texte: "6 h" }),
                    el("span", { texte: "12 h" }),
                    el("span", { texte: "18 h" }),
                    el("span", { texte: "23 h" }),
                ]));

                if (jour.remarque) {
                    carte.appendChild(el("div", { classe: "carte-sante-note", texte: jour.remarque }));
                }

                corps.appendChild(carte);

                /* --- la carte « Marche », les deux jours qui comptent --- */
                if (jourAffiche === "09/11" || jourAffiche === "08/11") {

                    const marche = el("div", { classe: "carte-sante" });

                    marche.appendChild(el("div", { classe: "carte-sante-titre" }, [
                        el("span", { texte: "Marche" }),
                        el("span", { classe: "carte-sante-date", texte: "nuit du 8" }),
                    ]));

                    marche.appendChild(el("div", { classe: "carte-sante-valeur", texte: "4 212 pas" }));

                    marche.appendChild(el("div", { classe: "carte-sante-lignes" }, [
                        el("div", {}, [el("b", { texte: "23 h 51 → 1 h 08" }), el("span", { texte: "sans arrêt" })]),
                        el("div", {}, [el("b", { texte: SANTE_DETAIL_NUIT.distance }), el("span", { texte: "parcourus" })]),
                    ]));

                    corps.appendChild(marche);

                    plusTard(function () { ENQUETE.trouver("sante_pas"); }, 500);
                }
            },
        });
    },
});
