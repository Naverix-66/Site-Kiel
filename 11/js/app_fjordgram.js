/* ============================================================
   APPLICATION — FJORDGRAM
   ============================================================
   Un profil, onze publications, et un seul commentateur.

   L'indice n'est dans aucune publication : il est dans la
   répétition. Il a commenté les onze, toujours sur l'heure ou
   sur le lieu, jamais sur la photo. Le jeu compte pour la
   joueuse (« il a commenté 8 publications sur 8 ») mais ne le
   souligne qu'une fois qu'elle a fait défiler jusqu'en bas.
   ============================================================ */

enregistrerApp({
    id: "fjordgram",
    nom: "Fjordgram",
    icone: "fjordgram",

    ouvrir: function () {
        OS.pousser({
            titre: PROFIL_FJORDGRAM.pseudo,
            contenu: function (corps) {

                /* --- l'en-tête du profil --- */
                corps.appendChild(el("div", { classe: "fg-entete" }, [
                    avatar({ nom: PROFIL_FJORDGRAM.nom, couleur: "#2C5F8A" }, 74),
                    el("div", { classe: "fg-stats" }, [
                        el("div", {}, [
                            el("b", { texte: String(PUBLICATIONS.length) }),
                            el("span", { texte: "publications" }),
                        ]),
                        el("div", {}, [
                            el("b", { texte: String(PROFIL_FJORDGRAM.abonnes) }),
                            el("span", { texte: "abonnés" }),
                        ]),
                        el("div", {}, [
                            el("b", { texte: String(PROFIL_FJORDGRAM.abonnements) }),
                            el("span", { texte: "abonnements" }),
                        ]),
                    ]),
                ]));

                const bio = el("div", { classe: "fg-bio" });
                bio.appendChild(el("b", { texte: PROFIL_FJORDGRAM.nom }));
                PROFIL_FJORDGRAM.bio.split("\n").forEach(function (ligneBio) {
                    bio.appendChild(el("div", { texte: ligneBio }));
                });
                corps.appendChild(bio);

                /* --- les publications, en entier --- */
                publicationsTriees().forEach(function (publication) {
                    corps.appendChild(carteDePublication(publication));
                });

                /* --- le constat, en bas --- */
                corps.appendChild(el("div", {
                    classe: "mira-aide",
                    style: { background: "var(--ardoise)", border: "1px dashed var(--separateur)", color: "var(--texte)" },
                    html: "<b>Au fait</b>Le compte <b>@t.reh</b> a commenté " + commentairesDeLui() +
                        " publications sur " + PUBLICATIONS.length + ". Jamais la photo. Toujours l'heure, " +
                        "le lieu, ou ce qu'elle portait.",
                }));
            },
        });
    },
});


function carteDePublication(publication) {

    const bloc = el("div", { classe: "fg-publication" });

    bloc.appendChild(el("div", { classe: "fg-pub-entete" }, [
        avatar({ nom: PROFIL_FJORDGRAM.nom, couleur: "#2C5F8A" }, 32),
        el("div", {}, [
            el("div", { texte: PROFIL_FJORDGRAM.pseudo }),
            publication.lieu
                ? el("div", { style: { fontSize: "11px", fontWeight: "400", color: "var(--texte-gris)" }, texte: publication.lieu })
                : null,
        ]),
    ]));

    const image = el("div", {
        classe: "fg-pub-image cliquable",
        auClic: function () {
            if (publication.indice) ENQUETE.trouver(publication.indice);
            SONS.tape();
        },
    }, [peindre(publication.peinture, { recadre: true })]);

    bloc.appendChild(image);

    bloc.appendChild(el("div", { classe: "fg-pub-actions" }, [
        el("span", { classe: "glyphe", html: ICONES.coeurVide }),
        el("span", { classe: "glyphe", html: ICONES.bulle }),
        el("span", { classe: "glyphe", html: ICONES.partage }),
    ]));

    bloc.appendChild(el("div", {
        classe: "fg-legende",
        style: { fontWeight: "600" },
        texte: publication.jaime + " j'aime",
    }));

    if (publication.legende) {
        const legende = el("div", { classe: "fg-legende" });
        legende.appendChild(el("b", { texte: PROFIL_FJORDGRAM.pseudo + " " }));
        legende.appendChild(el("span", { texte: publication.legende }));
        bloc.appendChild(legende);
    }

    (publication.commentaires || []).forEach(function (commentaire) {
        const element = el("div", {
            classe: "fg-commentaire" + (commentaire.lui ? " fg-commentaire--lui" : ""),
        });
        element.appendChild(el("b", { texte: commentaire.de + " " }));
        element.appendChild(el("span", { texte: commentaire.txt }));
        bloc.appendChild(element);
    });

    bloc.appendChild(el("div", {
        classe: "fg-lieu",
        texte: dateLongue(publication.t) + " à " + justeLHeure(publication.t),
    }));

    return bloc;
}
