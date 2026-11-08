/* ============================================================
   APPLICATION — PHOTOS
   ============================================================
   Trois onglets en bas (Photothèque, Albums, Rechercher) comme
   sur un vrai iPhone, et une visionneuse avec sa bande de
   vignettes et sa barre d'outils.

   La visionneuse est l'endroit le plus important du jeu après
   Messages : c'est là qu'on lit l'HEURE d'une photo. Deux
   indices majeurs (le code de l'album privé, et la date des
   photos supprimées) ne sont pas dans l'image, ils sont dans
   la petite ligne grise du haut.
   ============================================================ */

enregistrerApp({
    id: "photos",
    nom: "Photos",
    icone: "photos",
    dock: true,

    ouvrir: function () {
        ecranOnglets({
            grandTitre: "Photos",
            titrePar: function (onglet) {
                if (onglet === "albums") return "Albums";
                if (onglet === "recherche") return "Rechercher";
                return "Photothèque";
            },
            onglets: [
                { id: "bibliotheque", nom: "Photothèque", icone: ICONES.grille },
                { id: "albums", nom: "Albums", icone: ICONES.album },
                { id: "recherche", nom: "Rechercher", icone: ICONES.loupe },
            ],
            defaut: "bibliotheque",
            dessiner: function (corps, onglet) {
                if (onglet === "bibliotheque") grilleParJour(corps, photosDeLAlbum("pellicule"), "pellicule");
                if (onglet === "albums") listeDesAlbums(corps);
                if (onglet === "recherche") rechercheDePhotos(corps);
            },
        });
    },
});


/* ------------------------------------------------------------
   LA PHOTOTHÈQUE — toutes les photos, groupées par jour
   ------------------------------------------------------------ */
function grilleParJour(corps, photos, idAlbum) {

    let jourCourant = "";
    let grille = null;

    /* ⚠️ Les traces portées par une photo se ramassent à
       l'affichage de la grille, pas en ouvrant la photo. La
       date et le lieu sont écrits en tête de chaque journée :
       si on les a sous les yeux, on les a lus. (Même règle que
       pour la liste des appels. L'heure exacte reste dans la
       visionneuse pour qui veut vérifier, et le carnet la note
       de toute façon.) */
    plusTard(function () {
        const aNoter = [];
        photos.forEach(function (photo) {
            if (photo.indice) aNoter.push(photo.indice);
        });
        ENQUETE.trouverPlusieurs(aNoter);
    }, 700);

    photos.forEach(function (photo) {
        const jour = photo.t.split(" ")[0];

        if (jour !== jourCourant) {
            jourCourant = jour;

            const entete = el("div", { classe: "jour-photos", texte: dateLongue(photo.t) });
            if (photo.lieu) entete.appendChild(el("span", { texte: photo.lieu }));
            corps.appendChild(entete);

            grille = el("div", { classe: "grille-photos" });
            corps.appendChild(grille);
        }

        const vignette = el("div", {
            classe: "vignette cliquable",
            auClic: function () { ouvrirVisionneuse(photo, photos); },
        }, [imagePhoto(photo, { recadre: true })]);

        if (photo.favori) {
            vignette.appendChild(el("div", { classe: "vignette-coeur glyphe", html: ICONES.coeur }));
        }
        if (photo.supprimeeLe) {
            vignette.appendChild(el("div", { classe: "vignette-jours", texte: "22 j" }));
        }

        grille.appendChild(vignette);
    });

    if (photos.length === 0) corps.appendChild(videMessage("Aucune photo."));
    void idAlbum;
}


/* ------------------------------------------------------------
   LES ALBUMS
   ------------------------------------------------------------ */
function listeDesAlbums(corps) {

    const grille = el("div", { classe: "album-grille" });

    ALBUMS.forEach(function (album) {

        const photos = photosDeLAlbum(album.id);
        const verrouille = album.verrou && !estOuvert(album.verrou);

        const couverture = el("div", { classe: "couverture" });
        const photoDeCouverture = photoParId(album.couverture);

        if (verrouille) {
            couverture.appendChild(el("div", { classe: "cadenas" }, [
                el("span", { classe: "glyphe", html: ICONES.verrou }),
            ]));
        } else if (photoDeCouverture) {
            couverture.appendChild(imagePhoto(photoDeCouverture, { recadre: true }));
        }

        grille.appendChild(el("div", {
            classe: "album-carte cliquable",
            auClic: function () {
                if (verrouille) demanderCodeAlbum(album);
                else ouvrirAlbum(album);
            },
        }, [
            couverture,
            el("div", { classe: "nom", texte: album.nom }),
            el("div", { classe: "nombre", texte: verrouille ? "Verrouillé" : String(photos.length) }),
        ]));
    });

    corps.appendChild(grille);
}


function rechercheDePhotos(corps) {

    corps.appendChild(champDeRecherche("Lieux, dates, légendes"));

    const lieux = [];
    PHOTOS.forEach(function (photo) {
        if (!photo.lieu) return;
        if (photo.albums.indexOf("prive") !== -1 && !estOuvert("albumPrive")) return;
        if (lieux.indexOf(photo.lieu) === -1) lieux.push(photo.lieu);
    });

    corps.appendChild(groupe("lieux", lieux.map(function (lieu) {
        const dedans = PHOTOS.filter(function (p) { return p.lieu === lieu; });
        return ligneReglage(lieu, String(dedans.length), {
            auClic: function () {
                OS.pousser({
                    titre: lieu,
                    retourTexte: "Photos",
                    contenu: function (zone) { grilleParJour(zone, dedans, "pellicule"); },
                });
            },
        });
    })));
}


function demanderCodeAlbum(album) {
    OS.demanderCode({
        titre: album.nom,
        indice: album.indice,
        bonCode: album.code,
        sansHorloge: true,
        annule: function () { },
        reussi: function () {
            ouvrirVerrou(album.verrou);
            SONS.revelation();
            OS.toast("Album déverrouillé", { icone: ICONES.verrouOuvert });
            ENQUETE.remplirObjectif("o_prive");
            OS.rafraichir();
            plusTard(function () { ouvrirAlbum(album); }, 200);
        },
    });
}


/* ------------------------------------------------------------
   UN ALBUM
   ------------------------------------------------------------ */
function ouvrirAlbum(album) {

    const photos = photosDeLAlbum(album.id);

    OS.pousser({
        titre: album.nom,
        sousTitre: photos.length + (photos.length > 1 ? " éléments" : " élément"),
        retourTexte: "Albums",
        contenu: function (corps) {

            if (album.id === "supprimes") {
                corps.appendChild(el("div", {
                    classe: "bandeau-info",
                    texte: "Supprimées le 9 novembre à 1 h 20.",
                }));
            }

            grilleParJour(corps, photos, album.id);
        },
    });

    if (album.id === "supprimes") {
        plusTard(function () { ENQUETE.trouver("suppressions"); }, 400);
    }
}


/* ------------------------------------------------------------
   LA VISIONNEUSE
   ------------------------------------------------------------
   Barre du haut : la date et l'heure (c'est là que se jouent
   deux énigmes). Bande de vignettes en bas pour passer d'une
   photo à l'autre d'un doigt, et barre d'outils façon iOS.
   ------------------------------------------------------------ */
function ouvrirVisionneuse(photo, voisines) {

    let indexCourant = voisines.indexOf(photo);
    if (indexCourant < 0) indexCourant = 0;

    let infosVisibles = false;

    OS.pousser({
        sansBarre: true,
        plein: true,
        contenu: function (vue) {

            const courante = voisines[indexCourant] || photo;

            const visionneuse = el("div", { classe: "visionneuse" });

            /* --- la barre du haut --- */
            visionneuse.appendChild(el("div", { classe: "visionneuse-barre" }, [
                el("div", {
                    classe: "cliquable",
                    style: { color: "var(--bleu)", minWidth: "54px", fontSize: "16px" },
                    texte: "OK",
                    auClic: function () { OS.retour(); },
                }),
                el("div", { classe: "titre" }, [
                    el("div", { texte: dateLongue(courante.t) }),
                    el("span", { texte: justeLHeure(courante.t) + (courante.lieu ? " · " + courante.lieu : "") }),
                ]),
                el("div", { style: { minWidth: "54px" } }),
            ]));

            /* --- l'image, qu'on peut agrandir d'un appui --- */
            const zoneImage = el("div", { classe: "visionneuse-image" });
            const image = imagePhoto(courante, { grande: true });
            image.classList.add("zoomable");
            zoneImage.appendChild(image);

            zoneImage.addEventListener("click", function () {
                zoneImage.classList.toggle("zoome");
                SONS.tape();
            });

            visionneuse.appendChild(zoneImage);

            /* --- la légende, s'il y en a une --- */
            if (courante.legende) {
                visionneuse.appendChild(el("div", {
                    classe: "visionneuse-legende",
                    texte: "« " + courante.legende + " »",
                }));
            }

            /* --- les informations complètes --- */
            if (infosVisibles) {
                const exif = el("div", { classe: "photo-exif" });
                exif.appendChild(el("div", { html: "<b>Prise le</b> " + dateLongue(courante.t) + " à " + justeLHeure(courante.t) }));
                if (courante.lieu) exif.appendChild(el("div", { html: "<b>Lieu</b> " + courante.lieu }));
                exif.appendChild(el("div", { html: "<b>Appareil</b> " + (courante.appareil || "—") }));
                if (courante.supprimeeLe) {
                    exif.appendChild(el("div", { html: "<b>Supprimée le</b> " + dateLongue(courante.supprimeeLe) + " à " + justeLHeure(courante.supprimeeLe) }));
                }
                visionneuse.appendChild(exif);
            }

            /* --- la bande de vignettes --- */
            const bande = el("div", { classe: "bande-vignettes" });

            voisines.forEach(function (voisine, index) {
                bande.appendChild(el("div", {
                    classe: "mini-vignette" + (index === indexCourant ? " mini-vignette--active" : ""),
                    auClic: function () {
                        indexCourant = index;
                        SONS.tape();
                        OS.rafraichir();
                    },
                }, [imagePhoto(voisine, { recadre: true })]));
            });

            visionneuse.appendChild(bande);

            /* --- la barre d'outils --- */
            visionneuse.appendChild(barreOutils([
                { icone: ICONES.partage, auClic: function () { OS.toast("Rien ne sort de ce téléphone.", { info: true, icone: ICONES.info }); } },
                { icone: courante.favori ? ICONES.coeur : ICONES.coeurVide, auClic: function () { SONS.tape(); } },
                {
                    icone: ICONES.info, auClic: function () {
                        infosVisibles = !infosVisibles;
                        SONS.tape();
                        OS.rafraichir();
                    },
                },
                { icone: ICONES.corbeille, desactive: true },
            ]));

            vue.appendChild(visionneuse);

            if (courante.indice) {
                plusTard(function () { ENQUETE.trouver(courante.indice); }, 500);
            }
        },
    });
}
