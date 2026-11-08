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
                if (onglet === "recherche") return "";     // en-tête dessiné par l'onglet
                if (onglet === "profil") return "@" + COMPTES.lena.pseudo;
                return "";
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

    /* --- l'en-tête : le nom à gauche, les messages à droite --- */
    corps.appendChild(el("div", { classe: "fg-barre" }, [
        el("div", { classe: "fg-logo", texte: "Fjordgram" }),
        el("div", {
            classe: "fg-messages cliquable",
            auClic: function () { ecranDM(); },
        }, [
            el("span", { classe: "glyphe", html: ICONES.flecheHaut }),
            el("span", { classe: "badge badge--petit", texte: "3" }),
        ]),
    ]));

    /* --- les stories : on les REGARDE, on n'ouvre pas le profil --- */
    const stories = el("div", { classe: "stories" });

    const avecStories = ["lena"].concat(ABONNEMENTS_DE_LENA).filter(function (id) {
        return storiesDe(id).length > 0;
    });

    avecStories.forEach(function (id, position) {
        const c = compte(id);

        stories.appendChild(el("div", {
            classe: "story cliquable",
            auClic: function () { ouvrirStories(avecStories, position); },
        }, [
            el("div", {
                classe: "story-cercle" + (dejaLu("story:" + id) ? " story-cercle--vue" : ""),
            }, [avatar({ nom: c.nom, couleur: c.couleur }, 58)]),
            el("div", { classe: "story-nom", texte: c.moi ? "Vous" : c.pseudo }),
        ]));
    });

    corps.appendChild(stories);

    filDActualite().forEach(function (publication) {
        corps.appendChild(carteDePublication(publication));
    });
}


/* ------------------------------------------------------------
   LES STORIES
   ------------------------------------------------------------
   Plein écran, les petites barres en haut qui se remplissent,
   on appuie à droite pour avancer, à gauche pour revenir.
   La plupart ne racontent rien d'utile à l'enquête : c'est la
   vie des gens, et c'est ce qui fait qu'on y croit.
   ------------------------------------------------------------ */
function ouvrirStories(comptes, position) {

    let indexCompte = position;
    let indexStory = 0;
    let minuteur = null;

    /* ⚠️ Le minuteur d'avance automatique doit MOURIR avec
       l'écran. Sans ce garde-fou, il continuait de tourner après
       qu'on avait quitté les stories (geste de retour, accueil,
       autre application) et finissait par fermer l'application
       ouverte à ce moment-là, l'air de rien. */
    const ecranToujoursLa = function () {
        return !!document.querySelector(".story-plein");
    };

    const avancer = function () {
        if (!ecranToujoursLa()) {
            if (minuteur) clearTimeout(minuteur);
            return;
        }

        const stories = storiesDe(comptes[indexCompte]);

        if (indexStory < stories.length - 1) {
            indexStory++;
        } else if (indexCompte < comptes.length - 1) {
            indexCompte++;
            indexStory = 0;
        } else {
            if (minuteur) clearTimeout(minuteur);
            OS.retour();
            return;
        }
        OS.rafraichir();
    };

    const reculer = function () {
        if (indexStory > 0) indexStory--;
        else if (indexCompte > 0) { indexCompte--; indexStory = 0; }
        OS.rafraichir();
    };

    OS.pousser({
        sansBarre: true,
        plein: true,
        contenu: function (vue) {

            const id = comptes[indexCompte];
            const c = compte(id);
            const stories = storiesDe(id);
            const story = stories[indexStory] || stories[0];

            marquerLu("story:" + id);

            const ecran = el("div", { classe: "story-plein" });

            ecran.appendChild(el("div", { classe: "story-image" }, [
                peindre(story.peinture, { recadre: true }),
            ]));

            /* les barres de progression */
            const barres = el("div", { classe: "story-barres" });
            stories.forEach(function (s, i) {
                barres.appendChild(el("div", { classe: "story-barre" }, [
                    el("i", {
                        classe: i < indexStory ? "pleine" : (i === indexStory ? "en-cours" : ""),
                    }),
                ]));
            });
            ecran.appendChild(barres);

            /* qui, et quand */
            ecran.appendChild(el("div", { classe: "story-entete" }, [
                avatar({ nom: c.nom, couleur: c.couleur }, 30),
                el("span", { classe: "story-pseudo", texte: c.pseudo }),
                el("span", { classe: "story-heure", texte: justeLHeure(story.t) }),
                el("span", {
                    classe: "story-fermer glyphe cliquable",
                    html: ICONES.croix,
                    auClic: function () {
                        if (minuteur) clearTimeout(minuteur);
                        OS.retour();
                    },
                }),
            ]));

            if (story.texte) {
                ecran.appendChild(el("div", { classe: "story-texte", texte: story.texte }));
            }

            if (story.ancienne) {
                ecran.appendChild(el("div", { classe: "story-archive", texte: "archivée · " + dateLongue(story.t) }));
            }

            /* les deux moitiés d'écran : avancer / revenir */
            ecran.appendChild(el("div", {
                classe: "story-zone story-zone--gauche",
                auClic: function () { reculer(); },
            }));
            ecran.appendChild(el("div", {
                classe: "story-zone story-zone--droite",
                auClic: function () { avancer(); },
            }));

            vue.appendChild(ecran);

            if (minuteur) clearTimeout(minuteur);
            minuteur = plusTard(avancer, 5200);
        },
    });
}


/* ------------------------------------------------------------
   LES MESSAGES PRIVÉS
   ------------------------------------------------------------ */
function ecranDM() {

    OS.pousser({
        titre: "Messages",
        retourTexte: "Fjordgram",
        contenu: function (corps) {

            const liste = el("div", { classe: "liste" });

            DM_FJORDGRAM.forEach(function (fil) {
                const c = compte(fil.compte);
                const dernier = fil.messages[fil.messages.length - 1];

                liste.appendChild(ligne({
                    avatar: avatar({ nom: c.nom, couleur: c.couleur }, 48),
                    titre: c.pseudo,
                    sousTitre: (dernier.de === "moi" ? "Vous : " : "") + dernier.txt,
                    droite: dateDeListe(dernier.t),
                    lignes: 1,
                    auClic: function () { ouvrirDM(fil); },
                }));
            });

            corps.appendChild(liste);

            corps.appendChild(titreDeSectionSombre("Invitations"));

            corps.appendChild(ligne({
                avatar: avatar({ nom: "?", couleur: "#3A4250" }, 48),
                titre: "ok_nord",
                sousTitre: "Demande de message · 2 photos",
                lignes: 1,
                chevron: false,
                auClic: function () {
                    OS.alerte({
                        titre: "ok_nord",
                        message: "Compte créé il y a trois mois. Aucune publication.\n\nElle n'a jamais accepté.",
                        boutons: [{ texte: "Laisser", fort: true }],
                    });
                },
            }));
        },
    });
}


function ouvrirDM(fil) {
    const c = compte(fil.compte);

    OS.pousser({
        titre: c.pseudo,
        retourTexte: "Messages",
        plein: true,
        contenu: function (vue) {

            const zone = el("div", { classe: "fil" });

            fil.messages.forEach(function (m, i) {
                const suivant = fil.messages[i + 1];
                const finDeRafale = !suivant || suivant.de !== m.de;

                zone.appendChild(el("div", {
                    classe: "bulle bulle--" + (m.de === "moi" ? "moi" : "eux") + (finDeRafale ? " bulle--pointe" : ""),
                    texte: m.txt,
                }));
            });

            vue.appendChild(zone);

            vue.appendChild(el("div", { classe: "barre-saisie" }, [
                el("div", { classe: "faux-champ", texte: "Message…" }),
            ]));
        },
    });
}


function titreDeSectionSombre(texte) {
    return el("div", {
        classe: "groupe-titre",
        style: { padding: "18px 18px 6px" },
        texte: texte.toUpperCase(),
    });
}


/* ------------------------------------------------------------
   RECHERCHER — commun aux deux réseaux
   ------------------------------------------------------------ */
let filtreRechercheFjordgram = "";

function rechercheComptes(corps, reseau) {

    /* --- la barre de recherche --- */
    const champ = el("input", {
        attrs: { type: "text", placeholder: "Rechercher", autocomplete: "off" },
    });
    champ.value = filtreRechercheFjordgram;

    champ.addEventListener("input", function () {
        filtreRechercheFjordgram = champ.value;
        OS.rafraichir();
        // on redonne le curseur au champ après le redessin
        plusTard(function () {
            const nouveau = document.querySelector(".champ-recherche--actif input");
            if (nouveau) { nouveau.focus(); nouveau.setSelectionRange(99, 99); }
        }, 10);
    });

    corps.appendChild(el("div", { classe: "champ-recherche champ-recherche--actif" }, [
        el("span", { classe: "glyphe", html: ICONES.loupe }),
        champ,
    ]));

    const mot = sansAccents(filtreRechercheFjordgram.trim());

    /* --- quand on tape : les comptes --- */
    if (mot) {
        const comptes = Object.keys(COMPTES).filter(function (id) {
            return sansAccents(COMPTES[id].pseudo).indexOf(mot) !== -1 ||
                sansAccents(COMPTES[id].nom).indexOf(mot) !== -1;
        });

        const liste = el("div", { classe: "liste" });

        comptes.forEach(function (id) {
            const c = COMPTES[id];
            liste.appendChild(ligne({
                avatar: avatar({ nom: c.nom, couleur: c.couleur }, 44),
                titre: c.pseudo,
                sousTitre: c.nom + " · " + nombreCourt(c.abonnes) + " abonnés",
                lignes: 1,
                auClic: function () { ouvrirProfil(id, reseau); },
            }));
        });

        corps.appendChild(liste);

        if (comptes.length === 0) {
            corps.appendChild(videMessage("Aucun compte à ce nom."));
        }
        return;
    }

    /* --- sinon : la mosaïque, comme l'onglet Explorer --- */
    const mosaique = el("div", { classe: "fg-explorer" });

    PUBLICATIONS.slice().sort(function (a, b) {
        return b.jaime - a.jaime;
    }).forEach(function (publication, position) {

        const tuile = el("div", {
            classe: "vignette cliquable" + (position % 7 === 0 ? " vignette--grande" : ""),
            auClic: function () { ouvrirPublication(publication); },
        }, [peindre(publication.peinture, { recadre: true })]);

        mosaique.appendChild(tuile);
    });

    corps.appendChild(mosaique);
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
