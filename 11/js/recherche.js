/* ============================================================
   LA RECHERCHE GLOBALE
   ============================================================
   Le petit « Rechercher » de l'écran d'accueil, qui fouille
   TOUT le téléphone d'un coup : messages, photos, notes,
   mails, historique, agenda, contacts.

   C'est l'outil anti-blocage le plus élégant du jeu : quand on
   ne sait plus quoi faire, on tape un mot qui traîne dans la
   tête — « clé », « Bülk », « liquide », « Keks » — et le
   téléphone montre tous les endroits où il apparaît.

   Et ça récompense exactement le bon réflexe : recouper.
   ============================================================ */

const RECHERCHE = {

    ouvrir: function () {

        const fond = el("div", { classe: "recherche-fond" });

        const champ = el("input", {
            attrs: { type: "text", placeholder: "Rechercher dans le téléphone", autocomplete: "off", spellcheck: "false" },
        });

        const resultats = el("div", { classe: "recherche-resultats" });

        const relancer = function () {
            vide(resultats);
            RECHERCHE.afficher(resultats, champ.value);
        };

        champ.addEventListener("input", relancer);

        fond.appendChild(el("div", { classe: "recherche-champ" }, [
            el("span", { classe: "glyphe", html: ICONES.loupe }),
            champ,
            el("span", {
                classe: "glyphe cliquable",
                style: { width: "17px", height: "17px", color: "var(--texte-gris)" },
                html: ICONES.croixCercle,
                auClic: function () { OS.fermerRecouvrement(); },
            }),
        ]));

        fond.appendChild(resultats);

        OS.ouvrirRecouvrement(fond);
        RECHERCHE.afficher(resultats, "");

        plusTard(function () { champ.focus(); }, 120);
    },


    /* --------------------------------------------------------
       afficher(zone, mot)
       -------------------------------------------------------- */
    afficher: function (zone, mot) {

        const recherche = sansAccents(String(mot).trim());

        if (recherche.length < 2) {
            zone.appendChild(el("div", { classe: "recherche-titre-groupe", texte: "SUGGESTIONS" }));

            ["Bülk", "clé", "liquide", "Keks", "repos", "familysafe", "1h14", "cabane"]
                .forEach(function (suggestion) {
                    zone.appendChild(ligne({
                        titre: suggestion,
                        chevron: false,
                        auClic: function () {
                            const champ = zone.parentNode.querySelector("input");
                            champ.value = suggestion;
                            vide(zone);
                            RECHERCHE.afficher(zone, suggestion);
                        },
                    }));
                });
            return;
        }

        const groupes = RECHERCHE.chercher(recherche);
        let total = 0;

        Object.keys(groupes).forEach(function (nomDuGroupe) {

            const trouvailles = groupes[nomDuGroupe];
            if (trouvailles.length === 0) return;

            total += trouvailles.length;

            zone.appendChild(el("div", { classe: "recherche-titre-groupe", texte: nomDuGroupe.toUpperCase() }));

            trouvailles.slice(0, 8).forEach(function (trouvaille) {
                zone.appendChild(ligne({
                    titre: trouvaille.titre,
                    sousTitre: trouvaille.texte,
                    droite: trouvaille.date || "",
                    auClic: function () {
                        OS.fermerRecouvrement();
                        if (trouvaille.ouvrir) trouvaille.ouvrir();
                    },
                }));
            });
        });

        if (total === 0) {
            zone.appendChild(videMessage("Aucun résultat pour « " + mot + " »."));
        }
    },


    /* --------------------------------------------------------
       chercher(mot) — renvoie les résultats par groupe
       -------------------------------------------------------- */
    chercher: function (recherche) {

        const correspond = function (texte) {
            return sansAccents(texte || "").indexOf(recherche) !== -1;
        };

        const groupes = {
            messages: [],
            photos: [],
            notes: [],
            mail: [],
            safari: [],
            agenda: [],
            contacts: [],
            carnet: [],
        };

        /* --- messages --- */
        FILS.forEach(function (fil) {
            if (fil.cache && fil.cache()) return;

            messagesDuFil(fil.id).forEach(function (message) {
                if (!correspond(message.txt)) return;

                groupes.messages.push({
                    titre: (fil.nomDuGroupe || nomContact(fil.contact)) + " — " + justeLHeure(message.t),
                    texte: message.txt,
                    date: dateDeListe(message.t),
                    ouvrir: function () { allerAuFil(fil.id); },
                });
            });
        });

        /* --- photos (lieu, légende, date) --- */
        PHOTOS.forEach(function (photo) {
            if (photo.cache && photo.cache()) return;
            if (photo.albums.indexOf("prive") !== -1 && !estOuvert("albumPrive")) return;

            if (!correspond(photo.lieu) && !correspond(photo.legende) && !correspond(photo.t)) return;

            groupes.photos.push({
                titre: photo.lieu || "Photo",
                texte: photo.legende || (dateLongue(photo.t) + " à " + justeLHeure(photo.t)),
                date: dateDeListe(photo.t),
                ouvrir: function () {
                    const album = ALBUMS.filter(function (a) { return photo.albums.indexOf(a.id) !== -1; })[0];
                    OS.ouvrirApp("photos");
                    plusTard(function () {
                        if (album) ouvrirAlbum(album);
                        plusTard(function () {
                            ouvrirVisionneuse(photo, photosDeLAlbum(album ? album.id : "pellicule"));
                        }, 140);
                    }, 120);
                },
            });
        });

        /* --- notes --- */
        NOTES.forEach(function (note) {
            if (note.verrou && !estOuvert(note.verrou)) return;

            const textes = [];
            (note.corps || []).forEach(function (bloc) {
                if (bloc.texte) textes.push(bloc.texte);
                if (bloc.items) bloc.items.forEach(function (i) { textes.push(i.texte); });
            });

            if (!correspond(note.titre) && !correspond(textes.join(" "))) return;

            groupes.notes.push({
                titre: titreDeNote(note),
                texte: apercu(textes.join(" "), 70),
                date: dateDeListe(note.t),
                ouvrir: function () {
                    OS.ouvrirApp("notes");
                    plusTard(function () { ouvrirNote(note); }, 120);
                },
            });
        });

        /* --- mails --- */
        MAILS.forEach(function (mail) {
            const textes = [];
            (mail.corps || []).forEach(function (bloc) {
                if (bloc.texte) textes.push(bloc.texte);
                if (bloc.lignes) bloc.lignes.forEach(function (paire) { textes.push(paire[0] + " " + paire[1]); });
            });

            if (!correspond(mail.objet) && !correspond(mail.de.nom) && !correspond(textes.join(" "))) return;

            groupes.mail.push({
                titre: mail.objet,
                texte: mail.de.nom + " — " + apercu(textes.join(" "), 56),
                date: dateDeListe(mail.t),
                ouvrir: function () {
                    OS.ouvrirApp("mail");
                    plusTard(function () { ouvrirMail(mail); }, 120);
                },
            });
        });

        /* --- historique et recherches web --- */
        HISTORIQUE_WEB.forEach(function (entree) {
            if (!correspond(entree.titre) && !correspond(entree.url)) return;

            groupes.safari.push({
                titre: entree.titre,
                texte: entree.url,
                date: dateDeListe(entree.t),
                ouvrir: function () {
                    OS.ouvrirApp("safari");
                    if (entree.page) plusTard(function () { ouvrirPageWeb(entree.page); }, 120);
                },
            });
        });

        RECHERCHES_WEB.forEach(function (entree) {
            if (!correspond(entree.texte)) return;

            groupes.safari.push({
                titre: entree.texte,
                texte: "Recherche — " + dateLongue(entree.t),
                date: dateDeListe(entree.t),
                ouvrir: function () { OS.ouvrirApp("safari"); },
            });
        });

        /* --- agenda --- */
        EVENEMENTS.forEach(function (evenement) {
            if (!correspond(evenement.titre) && !correspond(evenement.note)) return;

            groupes.agenda.push({
                titre: evenement.titre,
                texte: dateLongue(evenement.t) + (evenement.duree ? " · " + evenement.duree : ""),
                date: dateDeListe(evenement.t),
                ouvrir: function () { OS.ouvrirApp("calendrier"); },
            });
        });

        /* --- contacts --- */
        Object.keys(CONTACTS).forEach(function (id) {
            const contact = CONTACTS[id];
            if (!correspond(contact.nom) && !correspond(contact.nomComplet) && !correspond(contact.numero)) return;

            groupes.contacts.push({
                titre: nomContact(id),
                texte: contact.numero + (contact.role ? " · " + contact.role : ""),
                ouvrir: function () {
                    OS.ouvrirApp("telephone");
                    plusTard(function () { ficheContact(id); }, 120);
                },
            });
        });

        /* --- le carnet --- */
        ENQUETE.liste().forEach(function (indice) {
            if (!correspond(indice.quoi) && !correspond(indice.ou)) return;

            groupes.carnet.push({
                titre: apercu(indice.quoi, 50),
                texte: indice.ou,
                ouvrir: function () { OS.ouvrirApp("carnet"); },
            });
        });

        return groupes;
    },
};
