/* ============================================================
   APPLICATION — KIEK
   ============================================================
   Les vidéos verticales. (« kiek mal » = « regarde voir », en
   bas-allemand. Pour renommer l'appli : ici et ICONES_APPS.)

   Quatre onglets, comme le vrai :

     Pour toi     le flux plein écran, on glisse vers le haut
     Rechercher   tous les comptes, dont celui de l'ex
     Boîte        vide (elle n'y répondait plus)
     Profil       ses vidéos, celles qu'elle a enregistrées,
                  celles qu'elle a aimées

   Ce qui compte pour l'enquête est dans ENREGISTRÉES.
   ============================================================ */

enregistrerApp({
    id: "kiek",
    nom: "Kiek",
    icone: "kiek",
    classe: "app--kiek",

    ouvrir: function () {
        ouvrirFluxKiek(VIDEOS, 0);
    },
});


/* ------------------------------------------------------------
   LE FLUX PLEIN ÉCRAN
   ------------------------------------------------------------
   liste : les vidéos à faire défiler (tout, un compte, les
   enregistrées…). depart : l'index de celle qu'on ouvre.
   ------------------------------------------------------------ */
function ouvrirFluxKiek(liste, depart) {

    let index = depart || 0;

    OS.pousser({
        sansBarre: true,
        plein: true,
        contenu: function (vue) {

            if (index >= liste.length) index = 0;
            if (index < 0) index = liste.length - 1;

            const video = liste[index];
            const auteur = compte(video.auteur) || COMPTES.lena;

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
                    classe: "kiek-onglet",
                    texte: "Abonnements",
                    auClic: function (e) {
                        e.stopPropagation();
                        OS.retour();
                        plusTard(function () { ecranComptesKiek(); }, 120);
                    },
                }),
                el("div", { classe: "kiek-onglet kiek-onglet--actif", texte: "Pour toi" }),
            ]));

            /* --- les sous-titres --- */
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
                el("div", {
                    classe: "kiek-action cliquable",
                    auClic: function (e) {
                        e.stopPropagation();
                        ouvrirProfilKiek(auteur.id);
                    },
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

            /* --- le bas --- */
            const bas = el("div", { classe: "kiek-bas" });

            bas.appendChild(el("div", {
                classe: "kiek-compte cliquable",
                texte: "@" + auteur.pseudo,
                auClic: function (e) { e.stopPropagation(); ouvrirProfilKiek(auteur.id); },
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

            ecran.appendChild(el("div", {
                classe: "kiek-position",
                texte: (index + 1) + " / " + liste.length + "   ↑ glisse",
            }));

            vue.appendChild(ecran);

            /* --- la barre d'onglets --- */
            vue.appendChild(barreOnglets([
                { id: "accueil", nom: "Pour toi", icone: ICONES.maison },
                { id: "recherche", nom: "Rechercher", icone: ICONES.loupe },
                { id: "boite", nom: "Boîte", icone: ICONES.bulle },
                { id: "profil", nom: "Profil", icone: ICONES.personne },
            ], "accueil", function (id) {
                if (id === "recherche") { ecranComptesKiek(); return; }
                if (id === "profil") { ouvrirProfilKiek("lena"); return; }
                if (id === "boite") {
                    OS.toast("Aucun message. Elle avait tout coupé.", { info: true, icone: ICONES.info });
                }
            }));

            if (video.indice) {
                plusTard(function () { ENQUETE.trouver(video.indice); }, 900);
            }
        },
    });
}


/* ------------------------------------------------------------
   RECHERCHER UN COMPTE
   ------------------------------------------------------------ */
function ecranComptesKiek() {
    OS.pousser({
        titre: "Rechercher",
        retourTexte: "Pour toi",
        contenu: function (corps) { rechercheComptes(corps, "kiek"); },
    });
}


/* ------------------------------------------------------------
   UN PROFIL KIEK
   ------------------------------------------------------------
   Trois onglets, comme le vrai : ses vidéos, celles qu'elle a
   enregistrées, celles qu'elle a aimées. Les deux dernières
   n'existent que sur son propre profil.
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

            /* les trois onglets, seulement chez elle */
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
                const vignette = el("div", {
                    classe: "vignette cliquable",
                    auClic: function () { ouvrirFluxKiek(liste, position); },
                }, [peindre(video.peinture, { recadre: true })]);

                if (video.enregistreeLe) {
                    vignette.appendChild(el("div", { classe: "vignette-jours", texte: "⌕" }));
                }

                grille.appendChild(vignette);
            });

            corps.appendChild(grille);
        },
    });

    if (c.indice) {
        plusTard(function () { ENQUETE.trouver(c.indice); }, 600);
    }
}
