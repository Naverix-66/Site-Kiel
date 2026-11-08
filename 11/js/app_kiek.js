/* ============================================================
   APPLICATION — KIEK
   ============================================================
   Les vidéos verticales. (« kiek mal » = « regarde voir ».
   Pour renommer l'appli : ici et ICONES_APPS.)

   ⚠️ Le défilement est un VRAI défilement : les vidéos sont
   empilées les unes sous les autres dans une zone en
   scroll-snap. On monte, on descend, ça accroche, ça a de
   l'inertie — c'est le navigateur qui s'en occupe, et c'est
   pour ça que ça tombe juste. (Première version : un appui
   redessinait l'écran, sans animation et sans retour arrière.)

   Quatre onglets : Pour toi, Découvrir, Boîte, Profil.
   ============================================================ */

enregistrerApp({
    id: "kiek",
    nom: "Kiek",
    icone: "kiek",
    classe: "app--kiek",

    ouvrir: function () {
        ouvrirFluxKiek(VIDEOS, 0, "pourtoi");
    },
});


/* ------------------------------------------------------------
   LE FLUX
   ------------------------------------------------------------
   liste   : les vidéos empilées
   depart  : celle sur laquelle on arrive
   section : "pourtoi" | "abonnements" | autre (depuis un profil)
   ------------------------------------------------------------ */
function ouvrirFluxKiek(liste, depart, section) {

    let sectionCourante = section || "autre";

    OS.pousser({
        sansBarre: true,
        plein: true,
        contenu: function (vue) {

            const videos = sectionCourante === "abonnements"
                ? VIDEOS.filter(function (v) {
                    return v.auteur === "lena" || ABONNEMENTS_DE_LENA.indexOf(v.auteur) !== -1;
                })
                : liste;

            const pile = el("div", { classe: "kiek-pile" });

            videos.forEach(function (video) {
                pile.appendChild(ecranDeVideo(video));
            });

            if (videos.length === 0) {
                pile.appendChild(el("div", { classe: "vide-message", texte: "Aucune vidéo." }));
            }

            vue.appendChild(pile);

            /* --- les deux onglets du haut --- */
            if (sectionCourante !== "autre") {
                vue.appendChild(el("div", { classe: "kiek-haut" }, [
                    el("div", {
                        classe: "kiek-onglet" + (sectionCourante === "abonnements" ? " kiek-onglet--actif" : ""),
                        texte: "Abonnements",
                        auClic: function () {
                            sectionCourante = "abonnements";
                            SONS.tape();
                            OS.rafraichir();
                        },
                    }),
                    el("div", {
                        classe: "kiek-onglet" + (sectionCourante === "pourtoi" ? " kiek-onglet--actif" : ""),
                        texte: "Pour toi",
                        auClic: function () {
                            sectionCourante = "pourtoi";
                            SONS.tape();
                            OS.rafraichir();
                        },
                    }),
                ]));
            }

            /* --- la barre d'onglets du bas --- */
            vue.appendChild(barreOnglets([
                { id: "accueil", nom: "Accueil", icone: ICONES.maison },
                { id: "recherche", nom: "Découvrir", icone: ICONES.loupe },
                { id: "boite", nom: "Boîte", icone: ICONES.bulle },
                { id: "profil", nom: "Profil", icone: ICONES.personne },
            ], sectionCourante === "autre" ? "" : "accueil", function (id) {
                if (id === "recherche") { ecranDecouvrir(); return; }
                if (id === "profil") { ouvrirProfilKiek("lena"); return; }
                if (id === "boite") { OS.toast("Aucun message.", { info: true, icone: ICONES.info }); return; }
                if (id === "accueil") {
                    if (sectionCourante === "autre") { OS.retourRacine(); return; }
                    sectionCourante = "pourtoi";
                    OS.rafraichir();
                }
            }));

            /* on se place sur la vidéo demandée, sans animation */
            plusTard(function () {
                const cible = pile.children[depart || 0];
                if (cible) pile.scrollTop = cible.offsetTop;
            }, 20);

            /* la trace éventuelle de la vidéo d'arrivée */
            const arrivee = videos[depart || 0];
            if (arrivee && arrivee.indice) {
                plusTard(function () { ENQUETE.trouver(arrivee.indice); }, 1200);
            }
        },
    });
}


/* Un écran de vidéo : l'image, les sous-titres, la colonne de
   droite, le bas. */
function ecranDeVideo(video) {

    const auteur = compte(video.auteur) || COMPTES.lena;
    const ecran = el("div", { classe: "kiek-ecran" });

    ecran.appendChild(el("div", { classe: "kiek-image" }, [
        peindre(video.peinture, { recadre: true }),
    ]));

    if (video.sousTitres) {
        const titres = el("div", { classe: "kiek-sous-titres" });
        video.sousTitres.forEach(function (ligneTexte, i) {
            titres.appendChild(el("div", {
                classe: "kiek-sous-titre",
                texte: ligneTexte,
                style: { animationDelay: (i * 1.6) + "s" },
            }));
        });
        ecran.appendChild(titres);
    }

    ecran.appendChild(el("div", { classe: "kiek-actions" }, [
        el("div", {
            classe: "kiek-action cliquable",
            auClic: function () { ouvrirProfilKiek(auteur.id); },
        }, [avatar({ nom: auteur.nom, couleur: auteur.couleur }, 44)]),
        el("div", { classe: "kiek-action" }, [
            el("span", { classe: "glyphe", html: ICONES.coeur }),
            el("span", { classe: "kiek-chiffre", texte: video.jaime }),
        ]),
        el("div", { classe: "kiek-action" }, [
            el("span", { classe: "glyphe", html: ICONES.bulle }),
            el("span", { classe: "kiek-chiffre", texte: String(video.commentaires) }),
        ]),
        el("div", { classe: "kiek-action" }, [
            el("span", { classe: "glyphe", html: ICONES.partage }),
            el("span", { classe: "kiek-chiffre", texte: "Partager" }),
        ]),
        el("div", { classe: "kiek-disque" }, [
            el("span", { classe: "glyphe", html: ICONES.musique }),
        ]),
    ]));

    const bas = el("div", { classe: "kiek-bas" });

    bas.appendChild(el("div", {
        classe: "kiek-compte cliquable",
        texte: "@" + auteur.pseudo,
        auClic: function () { ouvrirProfilKiek(auteur.id); },
    }));
    bas.appendChild(el("div", { classe: "kiek-legende", texte: video.legende }));

    if (video.enregistreeLe) {
        bas.appendChild(el("div", {
            classe: "kiek-enregistree",
            texte: "Enregistrée le " + dateLongue(video.enregistreeLe) + " à " + justeLHeure(video.enregistreeLe),
        }));
    }

    bas.appendChild(el("div", { classe: "kiek-son" }, [
        el("span", { classe: "glyphe", html: ICONES.musique }),
        el("span", { texte: video.son }),
    ]));

    ecran.appendChild(bas);

    return ecran;
}


/* ------------------------------------------------------------
   DÉCOUVRIR
   ------------------------------------------------------------
   Une barre de recherche, puis une mosaïque de vignettes avec
   le nombre de vues : c'est à ça que ressemble l'onglet
   recherche de ces applications. Quand on tape, les comptes
   qui correspondent apparaissent au-dessus.
   ------------------------------------------------------------ */
function ecranDecouvrir() {

    let filtre = "";

    OS.pousser({
        titre: "Découvrir",
        retourTexte: "Kiek",
        plein: true,
        contenu: function (vue) {

            const corps = el("div", { classe: "corps" });

            /* le champ */
            const champ = el("input", {
                attrs: { type: "text", placeholder: "Rechercher", autocomplete: "off" },
            });
            champ.value = filtre;

            champ.addEventListener("input", function () {
                filtre = champ.value;
                OS.rafraichir();
            });

            corps.appendChild(el("div", { classe: "champ-recherche champ-recherche--actif" }, [
                el("span", { classe: "glyphe", html: ICONES.loupe }),
                champ,
            ]));

            const mot = sansAccents(filtre.trim());

            /* les comptes qui correspondent */
            if (mot) {
                const comptes = Object.keys(COMPTES).filter(function (id) {
                    return sansAccents(COMPTES[id].pseudo).indexOf(mot) !== -1 ||
                        sansAccents(COMPTES[id].nom).indexOf(mot) !== -1;
                });

                if (comptes.length > 0) {
                    corps.appendChild(el("div", { classe: "groupe-titre", style: { padding: "4px 18px 4px" }, texte: "COMPTES" }));

                    const liste = el("div", { classe: "liste" });
                    comptes.forEach(function (id) {
                        const c = COMPTES[id];
                        liste.appendChild(ligne({
                            avatar: avatar({ nom: c.nom, couleur: c.couleur }, 44),
                            titre: "@" + c.pseudo,
                            sousTitre: c.nom + " · " + nombreCourt(c.abonnes) + " abonnés",
                            lignes: 1,
                            auClic: function () { ouvrirProfilKiek(id); },
                        }));
                    });
                    corps.appendChild(liste);
                }
            }

            /* la mosaïque */
            const resultats = VIDEOS.filter(function (v) {
                if (!mot) return true;
                const auteur = compte(v.auteur) || {};
                return sansAccents(v.legende).indexOf(mot) !== -1 ||
                    sansAccents(auteur.pseudo || "").indexOf(mot) !== -1;
            });

            corps.appendChild(el("div", {
                classe: "groupe-titre",
                style: { padding: "10px 18px 6px" },
                texte: mot ? "VIDÉOS" : "TENDANCES",
            }));

            const mosaique = el("div", { classe: "kiek-mosaique" });

            resultats.forEach(function (video) {
                const auteur = compte(video.auteur) || COMPTES.lena;

                mosaique.appendChild(el("div", {
                    classe: "kiek-tuile cliquable",
                    auClic: function () { ouvrirFluxKiek(resultats, resultats.indexOf(video), "autre"); },
                }, [
                    peindre(video.peinture, { recadre: true }),
                    el("div", { classe: "kiek-tuile-vues" }, [
                        el("span", { classe: "glyphe", html: ICONES.lecture }),
                        el("span", { texte: video.jaime }),
                    ]),
                    el("div", { classe: "kiek-tuile-legende", texte: video.legende }),
                    el("div", { classe: "kiek-tuile-compte", texte: "@" + auteur.pseudo }),
                ]));
            });

            corps.appendChild(mosaique);

            if (resultats.length === 0) {
                corps.appendChild(videMessage("Aucune vidéo."));
            }

            vue.appendChild(corps);
        },
    });
}


/* ------------------------------------------------------------
   UN PROFIL
   ------------------------------------------------------------ */
function ouvrirProfilKiek(id) {

    const c = compte(id);
    if (!c) return;

    let onglet = "videos";

    OS.pousser({
        titre: "@" + c.pseudo,
        retourTexte: "Retour",
        contenu: function (corps) {

            corps.appendChild(el("div", {
                style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 0 8px" },
            }, [
                avatar({ nom: c.nom, couleur: c.couleur }, 82),
                el("div", { style: { fontSize: "17px", fontWeight: "700" }, texte: "@" + c.pseudo }),
            ]));

            corps.appendChild(el("div", { classe: "fg-stats", style: { padding: "0 0 12px" } }, [
                el("div", {}, [
                    el("b", { texte: nombreCourt(c.abonnements) }),
                    el("span", { texte: "abonnements" }),
                ]),
                el("div", {}, [
                    el("b", { texte: nombreCourt(c.abonnes) }),
                    el("span", { texte: "abonnés" }),
                ]),
                el("div", {}, [
                    el("b", { texte: String(videosDe(id).length) }),
                    el("span", { texte: "vidéos" }),
                ]),
            ]));

            corps.appendChild(el("div", {
                classe: "fg-bio",
                style: { textAlign: "center" },
                texte: c.bio || "",
            }));

            let liste = videosDe(id);

            if (c.moi) {
                const segments = el("div", { classe: "segments" });

                [["videos", "Vidéos"], ["enregistrees", "Enregistrées"], ["aimees", "Aimées"]]
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

                if (onglet === "enregistrees") liste = videosEnregistrees();
                if (onglet === "aimees") liste = videosAimees();
            }

            if (liste.length === 0) {
                corps.appendChild(videMessage("Rien ici."));
                return;
            }

            const grille = el("div", { classe: "fg-grille" });

            liste.forEach(function (video, position) {
                grille.appendChild(el("div", {
                    classe: "vignette cliquable",
                    auClic: function () { ouvrirFluxKiek(liste, position, "autre"); },
                }, [peindre(video.peinture, { recadre: true })]));
            });

            corps.appendChild(grille);
        },
    });

    if (c.indice) {
        plusTard(function () { ENQUETE.trouver(c.indice); }, 600);
    }
}
