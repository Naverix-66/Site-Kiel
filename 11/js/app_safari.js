/* ============================================================
   APPLICATION — SAFARI
   ============================================================
   Une page de démarrage (favoris, historique, recherches) et
   des pages lisibles. La barre d'adresse est EN BAS, avec la
   barre d'outils : c'est comme ça depuis iOS 15, et c'est ce
   qui fait reconnaître Safari au premier coup d'œil.

   L'historique d'un navigateur est le document le plus intime
   d'un téléphone. Celui de Lena tient en une nuit — celle du
   6 novembre, entre 2 h et 4 h du matin.
   ============================================================ */

enregistrerApp({
    id: "safari",
    nom: "Safari",
    icone: "safari",

    ouvrir: function () {
        pageDeDemarrage();
    },
});


function pageDeDemarrage() {

    OS.pousser({
        sansBarre: true,
        plein: true,
        contenu: function (vue) {

            const corps = el("div", { classe: "corps" });

            corps.appendChild(el("h1", { classe: "grand-titre", texte: "Démarrage" }));

            /* --- les favoris, en grille d'icônes --- */
            corps.appendChild(el("div", { classe: "groupe-titre", style: { padding: "0 18px 8px" }, texte: "FAVORIS" }));

            const grille = el("div", { classe: "grille-favoris" });

            FAVORIS_WEB.forEach(function (favori) {
                grille.appendChild(el("div", {
                    classe: "favori cliquable",
                    auClic: function () {
                        if (favori.page) ouvrirPageWeb(favori.page);
                        else horsLigne();
                    },
                }, [
                    el("div", { classe: "favori-pastille", texte: favori.titre.slice(0, 1).toUpperCase() }),
                    el("div", { classe: "favori-nom", texte: favori.titre }),
                ]));
            });

            corps.appendChild(grille);

            /* --- l'historique --- */
            corps.appendChild(el("div", { classe: "groupe-titre", style: { padding: "18px 18px 8px" }, texte: "HISTORIQUE" }));

            const liste = el("div", { classe: "liste" });
            let jourCourant = "";

            HISTORIQUE_WEB.slice().sort(function (a, b) {
                return clefDeTri(b.t) - clefDeTri(a.t);
            }).forEach(function (entree) {

                const jour = entree.t.split(" ")[0];
                if (jour !== jourCourant) {
                    jourCourant = jour;
                    liste.appendChild(el("div", {
                        classe: "sous-titre-liste",
                        texte: dateLongue(entree.t),
                    }));
                }

                liste.appendChild(ligne({
                    titre: entree.titre,
                    sousTitre: entree.url,
                    droite: justeLHeure(entree.t),
                    lignes: 1,
                    auClic: function () {
                        if (entree.indice) ENQUETE.trouver(entree.indice);
                        if (entree.page) ouvrirPageWeb(entree.page);
                        else horsLigne();
                    },
                }));
            });

            corps.appendChild(liste);

            /* --- les recherches --- */
            corps.appendChild(el("div", { classe: "groupe-titre", style: { padding: "22px 18px 8px" }, texte: "RECHERCHES RÉCENTES" }));

            const recherches = el("div", { classe: "liste" });

            RECHERCHES_WEB.slice().sort(function (a, b) {
                return clefDeTri(b.t) - clefDeTri(a.t);
            }).forEach(function (recherche) {

                const element = ligne({
                    titre: recherche.texte,
                    droite: dateDeListe(recherche.t),
                    classe: "recherche-ligne",
                    chevron: false,
                    auClic: function () { ENQUETE.trouver("recherches_web"); },
                });

                element.insertBefore(el("span", {
                    classe: "glyphe loupe",
                    style: { width: "15px", height: "15px", color: "var(--texte-faible)" },
                    html: ICONES.loupe,
                }), element.firstChild);

                recherches.appendChild(element);
            });

            corps.appendChild(recherches);

            /* Ses recherches sont lisibles d'un coup d'œil :
               on les note sans attendre un clic. */
            plusTard(function () { ENQUETE.trouver("recherches_web"); }, 700);

            vue.appendChild(corps);

            /* --- la barre d'adresse et la barre d'outils, en bas --- */
            vue.appendChild(barreAdresse("Rechercher ou saisir une adresse"));
            vue.appendChild(outilsSafari(null));
        },
    });
}


function barreAdresse(texte, verrouille) {
    return el("div", { classe: "barre-adresse" }, [
        el("div", { classe: "champ-adresse" }, [
            verrouille ? el("span", { classe: "glyphe", html: ICONES.verrou }) : null,
            el("span", { texte: texte }),
        ]),
    ]);
}


function outilsSafari(page) {
    return barreOutils([
        {
            icone: ICONES.chevronGauche,
            desactive: !page,
            auClic: function () { OS.retour(); },
        },
        { icone: ICONES.chevron, desactive: true },
        { icone: ICONES.partage, auClic: function () { horsLigne(); } },
        { icone: ICONES.livre, auClic: function () { OS.toast("Les favoris sont sur la page de démarrage.", { info: true, icone: ICONES.info }); } },
        { icone: ICONES.onglets, auClic: function () { OS.toast("1 onglet ouvert", { info: true, icone: ICONES.info }); } },
    ]);
}


function horsLigne() {
    OS.alerte({
        titre: "Pas de connexion",
        message: "Le téléphone est en wifi mais la page n'est pas en cache. Seules les pages déjà visitées sont lisibles.",
        boutons: [{ texte: "OK", fort: true }],
    });
}


/* ------------------------------------------------------------
   UNE PAGE WEB
   ------------------------------------------------------------ */
function ouvrirPageWeb(id) {

    const page = pageWeb(id);
    if (!page) return;

    marquerLu("page:" + id);

    OS.pousser({
        sansBarre: true,
        plein: true,
        contenu: function (vue) {

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

            vue.appendChild(barreAdresse(page.url, true));
            vue.appendChild(outilsSafari(page));
        },
    });

    plusTard(function () {
        if (page.indice) ENQUETE.trouver(page.indice);
    }, 500);
}
