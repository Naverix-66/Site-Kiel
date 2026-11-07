/* ============================================================
   APPLICATION — SAFARI
   ============================================================
   Trois onglets : Historique, Recherches, Favoris.

   L'historique d'un navigateur est le document le plus intime
   d'un téléphone. Celui de Lena tient en onze lignes datées
   d'une seule nuit — celle du 6 novembre, entre 2 h et 4 h du
   matin — et il raconte tout : elle a compris, elle a vérifié,
   elle a cherché un avocat, puis un horaire de bus.
   ============================================================ */

enregistrerApp({
    id: "safari",
    nom: "Safari",
    icone: "safari",

    ouvrir: function () {
        let onglet = "historique";

        OS.pousser({
            grandTitre: "Safari",
            contenu: function (corps) {

                const segments = el("div", { classe: "segments" });

                [["historique", "Historique"], ["recherches", "Recherches"], ["favoris", "Favoris"]]
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

                if (onglet === "historique") historiqueWeb(corps);
                if (onglet === "recherches") recherchesWeb(corps);
                if (onglet === "favoris") favorisWeb(corps);
            },
        });
    },
});


function historiqueWeb(corps) {

    const liste = el("div", { classe: "liste" });
    let jourCourant = "";

    HISTORIQUE_WEB.slice().sort(function (a, b) {
        return clefDeTri(b.t) - clefDeTri(a.t);
    }).forEach(function (entree) {

        const jour = entree.t.split(" ")[0];
        if (jour !== jourCourant) {
            jourCourant = jour;
            liste.appendChild(el("div", { classe: "groupe-titre", style: { padding: "16px 16px 6px" }, texte: dateLongue(entree.t) }));
        }

        liste.appendChild(ligne({
            titre: entree.titre,
            sousTitre: entree.url,
            droite: justeLHeure(entree.t),
            lignes: 1,
            auClic: function () {
                if (entree.indice) ENQUETE.trouver(entree.indice);

                if (entree.page) {
                    ouvrirPageWeb(entree.page);
                } else {
                    OS.alerte({
                        titre: "Safari ne peut pas ouvrir la page",
                        message: "Le téléphone n'est pas connecté à Internet. Seules les pages mises en cache sont lisibles.",
                        boutons: [{ texte: "OK", fort: true }],
                    });
                }
            },
        }));
    });

    corps.appendChild(liste);
}


function recherchesWeb(corps) {

    const liste = el("div", { classe: "liste" });
    let jourCourant = "";

    RECHERCHES_WEB.slice().sort(function (a, b) {
        return clefDeTri(b.t) - clefDeTri(a.t);
    }).forEach(function (recherche) {

        const jour = recherche.t.split(" ")[0];
        if (jour !== jourCourant) {
            jourCourant = jour;
            liste.appendChild(el("div", {
                classe: "groupe-titre",
                style: { padding: "16px 16px 6px" },
                texte: dateLongue(recherche.t),
            }));
        }

        const element = ligne({
            titre: recherche.texte,
            droite: justeLHeure(recherche.t),
            classe: "recherche-ligne",
            chevron: false,
            auClic: function () { ENQUETE.trouver("recherches_web"); },
        });

        element.insertBefore(el("span", {
            classe: "glyphe loupe",
            style: { width: "15px", height: "15px", color: "var(--texte-faible)" },
            html: ICONES.loupe,
        }), element.firstChild);

        liste.appendChild(element);
    });

    corps.appendChild(liste);

    corps.appendChild(el("div", {
        classe: "groupe-pied",
        style: { padding: "16px 20px" },
        texte: "Huit des onze recherches ont été faites la même nuit, entre 2 h 14 et 4 h 20.",
    }));
}


function favorisWeb(corps) {

    corps.appendChild(groupe(null, FAVORIS_WEB.map(function (favori) {
        return ligneReglage(favori.titre, null, {
            auClic: function () {
                if (favori.page) ouvrirPageWeb(favori.page);
                else OS.toast("Page indisponible hors connexion", { info: true, icone: ICONES.info });
            },
        });
    })));
}


/* ------------------------------------------------------------
   UNE PAGE WEB
   ------------------------------------------------------------ */
function ouvrirPageWeb(id) {

    const page = pageWeb(id);
    if (!page) return;

    marquerLu("page:" + id);

    OS.pousser({
        titre: page.titre,
        retourTexte: "Safari",
        plein: true,
        contenu: function (vue) {

            vue.appendChild(el("div", { classe: "safari-barre-url" }, [
                el("span", { classe: "glyphe", style: { width: "13px", height: "13px" }, html: ICONES.verrou }),
                el("span", { texte: page.url }),
            ]));

            const corps = el("div", { classe: "corps" });

            const contenu = el("div", {
                classe: "page-web" + (page.type === "journal" ? " page-web--journal" : ""),
            });

            contenu.appendChild(el("h1", { texte: page.titre }));

            (page.corps || []).forEach(function (bloc) {

                if (bloc.type === "h2") {
                    contenu.appendChild(el("h2", { texte: bloc.texte }));
                    return;
                }

                if (bloc.type === "liste") {
                    const ul = el("ul");
                    (bloc.items || []).forEach(function (item) {
                        ul.appendChild(el("li", { texte: item }));
                    });
                    contenu.appendChild(ul);
                    return;
                }

                if (bloc.type === "encadre") {
                    contenu.appendChild(el("div", { classe: "encadre", texte: bloc.texte }));
                    return;
                }

                contenu.appendChild(el("p", { classe: bloc.classe || "", texte: bloc.texte }));
            });

            corps.appendChild(contenu);
            vue.appendChild(corps);
        },
    });

    plusTard(function () {
        if (page.indice) ENQUETE.trouver(page.indice);
    }, 500);
}
