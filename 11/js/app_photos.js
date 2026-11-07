/* ============================================================
   APPLICATION — PHOTOS
   ============================================================
   Trois écrans : les albums, un album, et la visionneuse.

   La visionneuse est l'endroit le plus important du jeu après
   Messages : c'est là qu'on lit l'HEURE d'une photo. Deux
   indices majeurs (le code de l'album privé, et la date des
   photos supprimées) ne sont pas dans l'image, ils sont dans
   la petite ligne grise en dessous.

   D'où le bouton « i » : on peut toujours afficher les
   métadonnées complètes, et un appui sur l'image zoome (les
   peintures sont vectorielles, ça reste net).
   ============================================================ */

enregistrerApp({
    id: "photos",
    nom: "Photos",
    icone: "photos",
    dock: true,

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Albums",
            contenu: function (corps) { listeDesAlbums(corps); },
        });
    },
});


/* ------------------------------------------------------------
   ÉCRAN 1 — les albums
   ------------------------------------------------------------ */
function listeDesAlbums(corps) {

    const grille = el("div", { classe: "album-grille" });

    ALBUMS.forEach(function (album) {

        const photos = photosDeLAlbum(album.id);
        const verrouille = album.verrou && !estOuvert(album.verrou);

        const couverture = el("div", { classe: "couverture" });

        const photoDeCouverture = photoParId(album.couverture);
        if (photoDeCouverture && !verrouille) {
            couverture.appendChild(imagePhoto(photoDeCouverture, { recadre: true }));
        } else if (verrouille) {
            couverture.appendChild(el("div", { classe: "cadenas" }, [
                el("span", { classe: "glyphe", html: ICONES.verrou }),
            ]));
        }

        grille.appendChild(el("div", {
            classe: "album-carte cliquable",
            auClic: function () {
                if (verrouille) {
                    demanderCodeAlbum(album);
                } else {
                    ouvrirAlbum(album);
                }
            },
        }, [
            couverture,
            el("div", { classe: "nom", texte: album.nom }),
            el("div", {
                classe: "nombre",
                texte: verrouille ? album.consigne : photos.length + (photos.length > 1 ? " éléments" : " élément"),
            }),
        ]));
    });

    corps.appendChild(grille);
}


function demanderCodeAlbum(album) {
    OS.demanderCode({
        titre: album.nom + " — code à 4 chiffres",
        indice: album.indice,
        bonCode: album.code,
        sansHorloge: true,
        annule: function () { /* on reste sur la liste */ },
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
   ÉCRAN 2 — un album
   ------------------------------------------------------------ */
function ouvrirAlbum(album) {

    const photos = photosDeLAlbum(album.id);

    OS.pousser({
        titre: album.nom,
        retourTexte: "Albums",
        contenu: function (corps) {

            if (album.id === "supprimes") {
                corps.appendChild(el("div", {
                    classe: "groupe-pied",
                    style: { padding: "10px 18px 4px" },
                    texte: "Ces éléments ont été supprimés le 9 novembre à 1 h 20. " +
                        "Ils seront définitivement effacés au bout de 30 jours.",
                }));
            }

            /* On regroupe par jour, comme la vraie application. */
            let jourCourant = "";
            let grille = null;

            photos.forEach(function (photo) {
                const jour = photo.t.split(" ")[0];

                if (jour !== jourCourant) {
                    jourCourant = jour;

                    const entete = el("div", { classe: "jour-photos", texte: dateLongue(photo.t) });
                    if (photo.lieu) {
                        entete.appendChild(el("span", { texte: photo.lieu }));
                    }
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

            if (photos.length === 0) {
                corps.appendChild(videMessage("Aucune photo."));
            }
        },
    });

    // Ouvrir l'album des suppressions est en soi une découverte.
    if (album.id === "supprimes") {
        plusTard(function () { ENQUETE.trouver("suppressions"); }, 400);
    }
}


/* ------------------------------------------------------------
   ÉCRAN 3 — la visionneuse
   ------------------------------------------------------------ */
function ouvrirVisionneuse(photo, voisines) {

    let indexCourant = voisines.indexOf(photo);
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
                    style: { color: "var(--bleu)", minWidth: "60px" },
                    texte: "Fermer",
                    auClic: function () { OS.retour(); },
                }),
                el("div", { classe: "titre" }, [
                    el("div", { texte: dateLongue(courante.t) }),
                    el("span", { texte: justeLHeure(courante.t) + (courante.lieu ? " · " + courante.lieu : "") }),
                ]),
                el("div", {
                    classe: "cliquable glyphe",
                    style: { width: "22px", height: "22px", color: "var(--bleu)" },
                    html: ICONES.info,
                    auClic: function () {
                        infosVisibles = !infosVisibles;
                        OS.rafraichir();
                    },
                }),
            ]));

            /* --- l'image, zoomable --- */
            const zoneImage = el("div", { classe: "visionneuse-image" });
            const image = imagePhoto(courante, { grande: true });
            image.classList.add("zoomable");
            zoneImage.appendChild(image);

            zoneImage.addEventListener("click", function () {
                zoneImage.classList.toggle("zoome");
                SONS.tape();
            });

            visionneuse.appendChild(zoneImage);

            /* --- les métadonnées complètes --- */
            if (infosVisibles) {
                const exif = el("div", { classe: "photo-exif" });

                exif.appendChild(el("div", { html: "<b>Date</b> — " + dateLongue(courante.t) + ", " + justeLHeure(courante.t) }));
                if (courante.lieu) exif.appendChild(el("div", { html: "<b>Lieu</b> — " + courante.lieu }));
                exif.appendChild(el("div", { html: "<b>Appareil</b> — " + (courante.appareil || "—") }));
                if (courante.supprimeeLe) {
                    exif.appendChild(el("div", {
                        html: "<b>Supprimée</b> — " + dateLongue(courante.supprimeeLe) + ", " + justeLHeure(courante.supprimeeLe),
                    }));
                }
                exif.appendChild(el("div", { html: "<b>Fichier</b> — IMG_" + courante.id.toUpperCase() + ".HEIC" }));

                visionneuse.appendChild(exif);
            }

            /* --- la légende et la navigation --- */
            const legende = el("div", { classe: "visionneuse-legende" });

            if (courante.legende) {
                legende.appendChild(el("div", { texte: "« " + courante.legende + " »" }));
            }

            legende.appendChild(el("div", { classe: "visionneuse-outils" }, [
                el("div", {
                    classe: "cliquable",
                    style: { opacity: indexCourant > 0 ? "1" : "0.3" },
                    texte: "‹ Précédente",
                    auClic: function () {
                        if (indexCourant > 0) { indexCourant--; OS.rafraichir(); SONS.tape(); }
                    },
                }),
                el("div", {
                    classe: "cliquable",
                    style: { opacity: indexCourant < voisines.length - 1 ? "1" : "0.3" },
                    texte: "Suivante ›",
                    auClic: function () {
                        if (indexCourant < voisines.length - 1) { indexCourant++; OS.rafraichir(); SONS.tape(); }
                    },
                }),
            ]));

            visionneuse.appendChild(legende);
            vue.appendChild(visionneuse);

            /* --- l'indice attaché à la photo --- */
            if (courante.indice) {
                plusTard(function () { ENQUETE.trouver(courante.indice); }, 500);
            }
        },
    });
}
