/* ============================================================
   APPLICATION — SANTÉ
   ============================================================
   Un seul écran, un graphique, et la plus belle preuve du jeu :
   4 212 pas entre 23 h 51 et 1 h 08.

   Personne n'efface ses pas. On efface des photos, des
   messages, un historique — jamais un compteur de pas. C'est
   pour ça que c'est là que se casse l'hypothèse « elle s'est
   noyée dans le port » : elle a marché une heure et quart,
   et elle est rentrée.
   ============================================================ */

enregistrerApp({
    id: "sante",
    nom: "Santé",
    icone: "sante",

    ouvrir: function () {
        let jourAffiche = "09/11";

        OS.pousser({
            grandTitre: "Activité",
            contenu: function (corps) {

                const jour = SANTE_JOURS.filter(function (j) { return j.t === jourAffiche; })[0] || SANTE_JOURS[0];

                /* --- le chiffre du jour --- */
                corps.appendChild(el("div", { classe: "chiffre-cle" }, [
                    el("div", { classe: "libelle", texte: dateLongue(jour.t) }),
                    el("div", { classe: "valeur", texte: String(jour.total).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " pas" }),
                ]));

                if (jour.remarque) {
                    corps.appendChild(el("div", {
                        classe: "groupe-pied",
                        style: { padding: "0 18px 6px" },
                        texte: jour.remarque,
                    }));
                }

                /* --- le graphique, heure par heure --- */
                const maximum = Math.max.apply(null, jour.heures.concat([1]));
                const graphique = el("div", { classe: "graphique" });

                jour.heures.forEach(function (pas, heure) {
                    const hauteur = Math.round((pas / maximum) * 100);
                    graphique.appendChild(el("i", {
                        classe: pas === 0 ? "zero" : (heure <= 5 || heure >= 22 ? "nuit" : ""),
                        style: { height: Math.max(hauteur, 1) + "%" },
                        attrs: { title: heure + " h — " + pas + " pas" },
                    }));
                });

                corps.appendChild(graphique);

                corps.appendChild(el("div", { classe: "graphique-axes" }, [
                    el("span", { texte: "0 h" }),
                    el("span", { texte: "6 h" }),
                    el("span", { texte: "12 h" }),
                    el("span", { texte: "18 h" }),
                    el("span", { texte: "23 h" }),
                ]));

                /* --- choisir le jour --- */
                const segments = el("div", { classe: "segments" });
                SANTE_JOURS.forEach(function (j) {
                    segments.appendChild(el("div", {
                        classe: "segment" + (j.t === jourAffiche ? " actif" : ""),
                        texte: dateCourte(j.t),
                        auClic: function () {
                            jourAffiche = j.t;
                            SONS.tape();
                            OS.rafraichir();
                            if (j.indice) ENQUETE.trouver(j.indice);
                        },
                    }));
                });
                corps.appendChild(segments);

                /* --- la marche de la nuit du 8 --- */
                if (jourAffiche === "09/11" || jourAffiche === "08/11") {
                    corps.appendChild(groupe("entraînement enregistré", [
                        ligneReglage("Type", "Marche"),
                        ligneReglage("Début", "8 nov. — 23 h 51"),
                        ligneReglage("Fin", "9 nov. — 1 h 08"),
                        ligneReglage("Durée", SANTE_DETAIL_NUIT.duree),
                        ligneReglage("Distance", SANTE_DETAIL_NUIT.distance),
                        ligneReglage("Pas", String(SANTE_DETAIL_NUIT.pas), { alerte: true }),
                    ], SANTE_DETAIL_NUIT.rythme));

                    plusTard(function () { ENQUETE.trouver("sante_pas"); }, 500);
                }

                corps.appendChild(groupe("autres données", [
                    ligneReglage("Sommeil", "Aucune donnée depuis le 9 novembre"),
                    ligneReglage("Fréquence cardiaque", "Aucun appareil connecté"),
                ]));
            },
        });
    },
});
