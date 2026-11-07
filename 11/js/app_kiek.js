/* ============================================================
   APPLICATION — KIEK
   ============================================================
   Les vidéos verticales. (« kiek mal » = « regarde voir », en
   bas-allemand. Pour l'appeler autrement, il y a deux endroits :
   ici et ICONES_APPS.)

   Une vidéo plein écran, on glisse vers le haut pour la
   suivante. Pas de lecture vidéo réelle : une peinture SVG qui
   respire lentement, des sous-titres qui défilent, et toute la
   ferronnerie habituelle (cœur, commentaires, son qui tourne).

   Ce qui compte dans le jeu : l'onglet ENREGISTRÉES. Ce que
   quelqu'un met de côté à 2 h du matin en dit plus long que ce
   qu'il publie.
   ============================================================ */

enregistrerApp({
    id: "kiek",
    nom: "Kiek",
    icone: "kiek",
    classe: "app--kiek",

    ouvrir: function () {
        let index = 0;
        let onglet = "pourtoi";

        OS.pousser({
            sansBarre: true,
            plein: true,
            contenu: function (vue) {

                const liste = onglet === "enregistrees"
                    ? VIDEOS.filter(function (v) { return v.enregistreeLe; })
                    : VIDEOS;

                if (index >= liste.length) index = 0;
                const video = liste[index];

                /* --- l'écran de la vidéo --- */
                const ecran = el("div", { classe: "kiek-video" });

                ecran.appendChild(el("div", { classe: "kiek-image" }, [
                    peindre(video.peinture, { recadre: true }),
                ]));

                /* on passe à la suivante d'un appui ou d'un glissé */
                const suivante = function () {
                    index = (index + 1) % liste.length;
                    SONS.tape();
                    OS.rafraichir();
                };

                ecran.addEventListener("click", suivante);

                let departY = null;
                ecran.addEventListener("touchstart", function (e) { departY = e.touches[0].clientY; });
                ecran.addEventListener("touchend", function (e) {
                    if (departY === null) return;
                    const delta = departY - e.changedTouches[0].clientY;
                    if (delta > 50) suivante();
                    if (delta < -50) { index = (index - 1 + liste.length) % liste.length; OS.rafraichir(); }
                    departY = null;
                });

                /* --- les onglets du haut --- */
                ecran.appendChild(el("div", { classe: "kiek-haut" }, [
                    el("div", {
                        classe: "kiek-onglet" + (onglet === "enregistrees" ? " kiek-onglet--actif" : ""),
                        texte: "Enregistrées",
                        auClic: function (e) {
                            e.stopPropagation();
                            onglet = "enregistrees"; index = 0;
                            SONS.tape();
                            OS.rafraichir();
                        },
                    }),
                    el("div", {
                        classe: "kiek-onglet" + (onglet === "pourtoi" ? " kiek-onglet--actif" : ""),
                        texte: "Pour toi",
                        auClic: function (e) {
                            e.stopPropagation();
                            onglet = "pourtoi"; index = 0;
                            SONS.tape();
                            OS.rafraichir();
                        },
                    }),
                ]));

                /* --- les sous-titres, au milieu --- */
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

                /* --- la colonne de droite --- */
                ecran.appendChild(el("div", { classe: "kiek-actions" }, [
                    el("div", { classe: "kiek-action" }, [
                        avatar({ nom: video.compte, couleur: "#2C3340" }, 44),
                    ]),
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

                /* --- le bas : compte, légende, son --- */
                const bas = el("div", { classe: "kiek-bas" });

                bas.appendChild(el("div", { classe: "kiek-compte", texte: "@" + video.compte }));
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

                /* --- le compteur de position --- */
                ecran.appendChild(el("div", {
                    classe: "kiek-position",
                    texte: (index + 1) + " / " + liste.length + "   ↑ glisse",
                }));

                vue.appendChild(ecran);

                /* --- la barre d'onglets du bas --- */
                vue.appendChild(barreOnglets([
                    { id: "accueil", nom: "Accueil", icone: ICONES.maison },
                    { id: "recherche", nom: "Rechercher", icone: ICONES.loupe },
                    { id: "boite", nom: "Boîte", icone: ICONES.bulle },
                    { id: "profil", nom: "Profil", icone: ICONES.personne },
                ], "accueil", function (id) {
                    if (id === "recherche") { OS.ouvrirRecherche(); return; }
                    if (id === "profil") {
                        onglet = "enregistrees";
                        index = 0;
                        OS.rafraichir();
                        return;
                    }
                    OS.toast("Pas de connexion.", { info: true, icone: ICONES.info });
                }));

                if (video.indice) {
                    plusTard(function () { ENQUETE.trouver(video.indice); }, 900);
                }
            },
        });
    },
});
