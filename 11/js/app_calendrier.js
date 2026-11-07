/* ============================================================
   APPLICATION — CALENDRIER
   ============================================================
   Une grille de mois qu'on peut feuilleter, et la liste des
   évènements du jour choisi.

   Deux cases comptent dans tout le jeu :
     - le 8 novembre, où il est écrit « Repos » (donc le SMS de
       19 h 42 à Mira est un mensonge) ;
     - le 3 juillet, où il est écrit « B. » et rien d'autre.
   ============================================================ */

enregistrerApp({
    id: "calendrier",
    nom: "Calendrier",
    icone: "calendrier",

    ouvrir: function () {
        let moisAffiche = 11;
        let jourChoisi = 8;

        OS.pousser({
            titre: "",
            plein: true,
            contenu: function (vue) {

                /* --- l'en-tête du mois, avec les flèches --- */
                const index = MOIS_CONSULTABLES.indexOf(moisAffiche);

                vue.appendChild(el("div", { classe: "barre-nav" }, [
                    el("div", {
                        classe: "barre-nav-retour cliquable",
                        style: { opacity: index > 0 ? "1" : "0.3" },
                        auClic: function () {
                            if (index > 0) {
                                moisAffiche = MOIS_CONSULTABLES[index - 1];
                                jourChoisi = 1;
                                SONS.tape();
                                OS.rafraichir();
                            }
                        },
                    }, [el("span", { classe: "glyphe", html: ICONES.chevronGauche })]),

                    el("div", { classe: "barre-nav-titre", texte: MOIS_FR[moisAffiche - 1] }),

                    el("div", {
                        classe: "barre-nav-action cliquable",
                        style: { opacity: index < MOIS_CONSULTABLES.length - 1 ? "1" : "0.3" },
                        auClic: function () {
                            if (index < MOIS_CONSULTABLES.length - 1) {
                                moisAffiche = MOIS_CONSULTABLES[index + 1];
                                jourChoisi = 1;
                                SONS.tape();
                                OS.rafraichir();
                            }
                        },
                    }, [el("span", {
                        classe: "glyphe",
                        style: { width: "11px", height: "18px" },
                        html: ICONES.chevron,
                    })]),
                ]));

                const corps = el("div", { classe: "corps" });

                /* --- les jours de la semaine --- */
                const entete = el("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        padding: "10px 8px 6px",
                        fontSize: "12px",
                        color: "var(--texte-gris)",
                        textAlign: "center",
                    },
                });

                ["L", "M", "M", "J", "V", "S", "D"].forEach(function (lettre) {
                    entete.appendChild(el("div", { texte: lettre }));
                });
                corps.appendChild(entete);

                /* --- la grille du mois --- */
                const grille = el("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "2px",
                        padding: "0 8px",
                    },
                });

                const decalage = premierJourDuMois(moisAffiche);
                for (let vide2 = 0; vide2 < decalage; vide2++) {
                    grille.appendChild(el("div"));
                }

                for (let jour = 1; jour <= joursDuMois(moisAffiche); jour++) {

                    const evenements = evenementsDuJour(jour, moisAffiche);
                    const estChoisi = jour === jourChoisi;

                    const case_ = el("div", {
                        classe: "cliquable",
                        style: {
                            aspectRatio: "1 / 1",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "3px",
                            borderRadius: "50%",
                            fontSize: "16px",
                            background: estChoisi ? "var(--rouge)" : "transparent",
                            color: estChoisi ? "#fff" : "var(--texte)",
                        },
                        auClic: function () {
                            jourChoisi = jour;
                            SONS.tape();
                            OS.rafraichir();
                        },
                    }, [el("div", { texte: String(jour) })]);

                    if (evenements.length > 0) {
                        const points = el("div", { style: { display: "flex", gap: "2px" } });
                        evenements.slice(0, 3).forEach(function (evenement) {
                            points.appendChild(el("span", {
                                style: {
                                    width: "5px",
                                    height: "5px",
                                    borderRadius: "50%",
                                    background: estChoisi ? "#fff" : (COULEURS_EVENEMENT[evenement.couleur] || "var(--bleu)"),
                                },
                            }));
                        });
                        case_.appendChild(points);
                    }

                    grille.appendChild(case_);
                }

                corps.appendChild(grille);

                /* --- les évènements du jour choisi --- */
                const evenements = evenementsDuJour(jourChoisi, moisAffiche);

                corps.appendChild(el("div", {
                    classe: "groupe-titre",
                    style: { padding: "20px 18px 8px" },
                    texte: jourChoisi + " " + MOIS_FR[moisAffiche - 1],
                }));

                if (evenements.length === 0) {
                    corps.appendChild(videMessage("Aucun évènement."));
                } else {
                    const liste = el("div", { classe: "liste" });

                    evenements.forEach(function (evenement) {
                        const element = ligne({
                            titre: evenement.titre,
                            sousTitre: evenement.duree || (evenement.toutLeJour ? "toute la journée" : ""),
                            detail: evenement.note || null,
                            chevron: false,
                            auClic: function () {
                                if (evenement.indice) ENQUETE.trouver(evenement.indice);
                                SONS.tape();
                            },
                        });

                        element.style.borderLeft = "4px solid " + (COULEURS_EVENEMENT[evenement.couleur] || "#0A84FF");
                        liste.appendChild(element);
                    });

                    corps.appendChild(liste);

                    // Les deux dates qui comptent se ramassent à
                    // l'affichage : on les a sous les yeux.
                    plusTard(function () {
                        evenements.forEach(function (evenement) {
                            if (evenement.indice) ENQUETE.trouver(evenement.indice);
                        });
                    }, 450);
                }

                vue.appendChild(corps);
            },
        });
    },
});
