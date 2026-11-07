/* ============================================================
   APPLICATION — FJORDGRAM
   ============================================================
   Trois onglets en bas, comme le vrai :

     Accueil     le fil des comptes qu'elle suit
     Rechercher  une barre de recherche et tous les comptes
     Profil      le sien

   Et surtout : on peut ouvrir le profil de n'importe qui.
   Celui de l'ex est le plus parlant du jeu — trois
   publications, 38 abonnés, 412 abonnements, et la liste de
   ceux qu'il suit, qui est exactement la liste des gens
   qu'elle connaît.
   ============================================================ */

enregistrerApp({
    id: "fjordgram",
    nom: "Fjordgram",
    icone: "fjordgram",

    ouvrir: function () {
        ecranOnglets({
            grandTitre: "Fjordgram",
            titrePar: function (onglet) {
                if (onglet === "recherche") return "Rechercher";
                if (onglet === "profil") return "@" + COMPTES.lena.pseudo;
                return "Fjordgram";
            },
            onglets: [
                { id: "accueil", nom: "Accueil", icone: ICONES.maison },
                { id: "recherche", nom: "Rechercher", icone: ICONES.loupe },
                { id: "profil", nom: "Profil", icone: ICONES.personne },
            ],
            defaut: "accueil",

            dessiner: function (corps, onglet) {
                if (onglet === "accueil") filFjordgram(corps);
                if (onglet === "recherche") rechercheComptes(corps, "fjordgram");
                if (onglet === "profil") contenuProfil(corps, "lena", "fjordgram");
            },
        });
    },
});


/* ------------------------------------------------------------
   LE FIL
   ------------------------------------------------------------ */
function filFjordgram(corps) {

    /* la rangée de « stories », en haut : c'est ce détail qui
       fait reconnaître l'application au premier coup d'œil */
    const stories = el("div", { classe: "stories" });

    ["lena"].concat(ABONNEMENTS_DE_LENA).forEach(function (id) {
        const c = compte(id);
        if (!c) return;

        stories.appendChild(el("div", {
            classe: "story cliquable",
            auClic: function () { ouvrirProfil(id, "fjordgram"); },
        }, [
            el("div", { classe: "story-cercle" }, [avatar({ nom: c.nom, couleur: c.couleur }, 58)]),
            el("div", { classe: "story-nom", texte: c.moi ? "Vous" : c.pseudo }),
        ]));
    });

    corps.appendChild(stories);

    filDActualite().forEach(function (publication) {
        corps.appendChild(carteDePublication(publication));
    });
}


/* ------------------------------------------------------------
   RECHERCHER — commun aux deux réseaux
   ------------------------------------------------------------ */
function rechercheComptes(corps, reseau) {

    let filtre = "";

    const resultats = el("div", { classe: "liste" });

    const dessinerResultats = function () {
        vide(resultats);

        const mot = sansAccents(filtre.trim());

        Object.keys(COMPTES).forEach(function (id) {
            const c = COMPTES[id];

            if (mot && sansAccents(c.pseudo).indexOf(mot) === -1 &&
                sansAccents(c.nom).indexOf(mot) === -1) return;

            const combien = reseau === "kiek" ? videosDe(id).length : publicationsDe(id).length;

            resultats.appendChild(ligne({
                avatar: avatar({ nom: c.nom, couleur: c.couleur }, 44),
                titre: c.pseudo,
                sousTitre: c.nom + " · " + combien + (combien > 1 ? " publications" : " publication"),
                lignes: 1,
                auClic: function () { ouvrirProfil(id, reseau); },
            }));
        });

        if (!resultats.firstChild) {
            resultats.appendChild(videMessage("Aucun compte à ce nom."));
        }
    };

    /* un vrai champ de saisie : on tape, ça filtre */
    const champ = el("input", {
        attrs: { type: "text", placeholder: "Rechercher un compte", autocomplete: "off" },
    });

    champ.addEventListener("input", function () {
        filtre = champ.value;
        dessinerResultats();
    });

    corps.appendChild(el("div", { classe: "champ-recherche champ-recherche--actif" }, [
        el("span", { classe: "glyphe", html: ICONES.loupe }),
        champ,
    ]));

    corps.appendChild(el("div", {
        classe: "groupe-titre",
        style: { padding: "4px 18px 4px" },
        texte: "COMPTES",
    }));

    corps.appendChild(resultats);
    dessinerResultats();
}


/* ------------------------------------------------------------
   UN PROFIL
   ------------------------------------------------------------ */
function ouvrirProfil(id, reseau) {

    const c = compte(id);
    if (!c) return;

    OS.pousser({
        titre: "@" + c.pseudo,
        retourTexte: "Retour",
        contenu: function (corps) { contenuProfil(corps, id, reseau); },
    });

    if (c.indice) {
        plusTard(function () { ENQUETE.trouver(c.indice); }, 600);
    }
}


function contenuProfil(corps, id, reseau) {

    const c = compte(id);
    if (!c) return;

    const publications = reseau === "kiek" ? videosDe(id) : publicationsDe(id);

    /* --- l'en-tête --- */
    corps.appendChild(el("div", { classe: "fg-entete" }, [
        avatar({ nom: c.nom, couleur: c.couleur }, 74),
        el("div", { classe: "fg-stats" }, [
            el("div", {}, [
                el("b", { texte: String(publications.length) }),
                el("span", { texte: "publications" }),
            ]),
            el("div", {}, [
                el("b", { texte: nombreCourt(c.abonnes) }),
                el("span", { texte: "abonnés" }),
            ]),
            el("div", {
                classe: c.suit ? "cliquable" : "",
                auClic: c.suit ? function () { listeDesAbonnements(c); } : null,
            }, [
                el("b", { texte: nombreCourt(c.abonnements) }),
                el("span", { texte: "abonnements" }),
            ]),
        ]),
    ]));

    const bio = el("div", { classe: "fg-bio" });
    bio.appendChild(el("b", { texte: c.nom }));
    String(c.bio || "").split("\n").forEach(function (ligneBio) {
        bio.appendChild(el("div", { texte: ligneBio }));
    });
    corps.appendChild(bio);

    /* --- le déséquilibre abonnés / abonnements saute aux yeux --- */
    if (c.lui) {
        corps.appendChild(el("div", {
            classe: "bandeau-info",
            texte: "38 abonnés, 412 abonnements. Appuie sur « abonnements ».",
        }));
    }

    /* --- la grille --- */
    if (publications.length === 0) {
        corps.appendChild(videMessage("Aucune publication."));
        return;
    }

    const grille = el("div", { classe: "fg-grille" });

    publications.forEach(function (publication) {
        grille.appendChild(el("div", {
            classe: "vignette cliquable",
            auClic: function () {
                if (reseau === "kiek") ouvrirFluxKiek(publications, publications.indexOf(publication));
                else ouvrirPublication(publication);
            },
        }, [peindre(publication.peinture, { recadre: true })]));
    });

    corps.appendChild(grille);
}


/* Qui il suit : la vraie claque du profil. */
function listeDesAbonnements(c) {

    OS.pousser({
        titre: "Abonnements",
        sousTitre: "@" + c.pseudo,
        retourTexte: "Profil",
        contenu: function (corps) {

            const liste = el("div", { classe: "liste" });

            (c.suit || []).forEach(function (id) {
                const suivi = compte(id);
                if (!suivi) return;

                liste.appendChild(ligne({
                    avatar: avatar({ nom: suivi.nom, couleur: suivi.couleur }, 44),
                    titre: suivi.pseudo,
                    sousTitre: suivi.nom,
                    lignes: 1,
                    auClic: function () { ouvrirProfil(id, "fjordgram"); },
                }));
            });

            corps.appendChild(liste);

            corps.appendChild(el("div", {
                classe: "bandeau-info",
                texte: "…et 405 autres comptes.",
            }));
        },
    });

    plusTard(function () { ENQUETE.trouver("ex_profil"); }, 500);
}


/* Une publication seule (depuis une grille). */
function ouvrirPublication(publication) {
    OS.pousser({
        titre: "Publication",
        retourTexte: "Profil",
        contenu: function (corps) {
            corps.appendChild(carteDePublication(publication));
        },
    });
}


/* ------------------------------------------------------------
   UNE CARTE DE PUBLICATION
   ------------------------------------------------------------ */
function carteDePublication(publication) {

    const auteur = compte(publication.auteur) || COMPTES.lena;
    const bloc = el("div", { classe: "fg-publication" });

    bloc.appendChild(el("div", {
        classe: "fg-pub-entete cliquable",
        auClic: function () { ouvrirProfil(auteur.id, "fjordgram"); },
    }, [
        avatar({ nom: auteur.nom, couleur: auteur.couleur }, 32),
        el("div", {}, [
            el("div", { texte: auteur.pseudo }),
            publication.lieu
                ? el("div", { style: { fontSize: "11px", fontWeight: "400", color: "var(--texte-gris)" }, texte: publication.lieu })
                : null,
        ]),
    ]));

    bloc.appendChild(el("div", {
        classe: "fg-pub-image cliquable",
        auClic: function () {
            if (publication.indice) ENQUETE.trouver(publication.indice);
            SONS.tape();
        },
    }, [peindre(publication.peinture, { recadre: true })]));

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
        legende.appendChild(el("b", { texte: auteur.pseudo + " " }));
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

    if (publication.indice) {
        plusTard(function () { ENQUETE.trouver(publication.indice); }, 800);
    }

    return bloc;
}


/* 142000 -> « 142 k » */
function nombreCourt(n) {
    if (n >= 1000) return Math.round(n / 100) / 10 + " k";
    return String(n);
}
