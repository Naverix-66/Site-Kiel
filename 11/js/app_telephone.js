/* ============================================================
   APPLICATION — TÉLÉPHONE
   ============================================================
   Trois onglets : Récents, Contacts, Messagerie.

   C'est la seule application où figurent des DURÉES, et une
   durée raconte une scène : « entrant, 3 s » veut dire qu'elle
   a décroché, entendu sa voix, et raccroché.

   La messagerie vocale est jouée sans aucun fichier audio : on
   affiche la transcription (ce que fait un iPhone) et on anime
   une forme d'onde. ⚠️ Si on enregistre de vraies voix avec
   Piper comme en octobre, il suffira d'ajouter un champ `son`.
   ============================================================ */

enregistrerApp({
    id: "telephone",
    nom: "Téléphone",
    icone: "telephone",
    dock: true,

    badge: function () {
        return repondeurNonLus() + appelsNonLus();
    },

    ouvrir: function () {
        ecranOnglets({
            grandTitre: "Téléphone",
            titrePar: function (onglet) {
                if (onglet === "contacts") return "Contacts";
                if (onglet === "repondeur") return "Messagerie";
                return "Récents";
            },
            onglets: [
                { id: "recents", nom: "Récents", icone: ICONES.horloge },
                { id: "contacts", nom: "Contacts", icone: ICONES.personne },
                { id: "repondeur", nom: "Messagerie", icone: ICONES.repondeur },
            ],
            defaut: "recents",
            dessiner: function (corps, onglet) {
                if (onglet === "recents") listeDesAppels(corps);
                if (onglet === "contacts") listeDesContacts(corps);
                if (onglet === "repondeur") listeDuRepondeur(corps);
            },
        });
    },
});


/* ------------------------------------------------------------
   RÉCENTS
   ------------------------------------------------------------ */
function listeDesAppels(corps) {

    const liste = el("div", { classe: "liste" });

    APPELS.forEach(function (appel) {

        const contact = CONTACTS[appel.contact] || { nom: appel.contact };
        const manque = appel.type === "manque";

        const icone = manque ? ICONES.telephoneManque : ICONES.telephone;

        const centre = el("div", { classe: "ligne-centre" }, [
            el("div", { classe: "ligne-haut" }, [
                el("div", { classe: "ligne-titre", texte: nomContact(appel.contact) }),
                el("div", { classe: "ligne-droite", texte: dateDeListe(appel.t) }),
            ]),
            el("div", { classe: "appel-type" }, [
                el("span", { classe: "glyphe", html: icone, style: manque ? { color: "var(--rouge)" } : null }),
                el("span", { texte: libelleAppel(appel) + (appel.note ? " · " + appel.note : "") }),
            ]),
        ]);

        // le petit « i » bleu dans un cercle, à droite : c'est LE
        // repère visuel des appels récents sur iPhone
        const infoBouton = el("div", {
            classe: "bouton-info glyphe",
            html: ICONES.info,
            auClic: function () {
                marquerLu("appel:" + appel.t);
                if (appel.indice) ENQUETE.trouver(appel.indice);
                ficheContact(appel.contact);
            },
        });

        liste.appendChild(el("div", {
            classe: "ligne" + (manque ? " ligne--manque" : ""),
            auClic: function () {
                marquerLu("appel:" + appel.t);
                if (appel.indice) ENQUETE.trouver(appel.indice);
            },
        }, [centre, infoBouton]));
    });

    corps.appendChild(liste);
}


/* ------------------------------------------------------------
   CONTACTS
   ------------------------------------------------------------ */
function listeDesContacts(corps) {

    const liste = el("div", { classe: "liste" });

    const ordre = ["mira", "tobias", "jonas", "hanne", "lisbeth", "vogt", "klara", "bob"];

    ordre.forEach(function (id) {
        const contact = CONTACTS[id];
        if (!contact) return;

        liste.appendChild(ligne({
            avatar: avatar(id, 42),
            titre: nomContact(id),
            sousTitre: contact.role === "moi" ? "C'est mon numéro." : (contact.details || contact.role || ""),
            lignes: 1,
            auClic: function () { ficheContact(id); },
        }));
    });

    corps.appendChild(liste);
}


function ficheContact(id) {

    const contact = CONTACTS[id];
    if (!contact) return;

    OS.pousser({
        titre: nomContact(id),
        retourTexte: "Téléphone",
        contenu: function (corps) {

            corps.appendChild(el("div", {
                style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "18px 0 6px" },
            }, [
                avatar(id, 84),
                el("div", { style: { fontSize: "22px", fontWeight: "600" }, texte: contact.nomComplet }),
                el("div", { style: { fontSize: "14px", color: "var(--texte-gris)" }, texte: contact.role || "" }),
            ]));

            corps.appendChild(groupe(null, [
                ligneReglage("mobile", contact.numero),
                contact.details ? ligneReglage("note", contact.details) : null,
            ]));

            const fil = FILS.filter(function (f) { return f.contact === id; })[0];
            if (fil && messagesDuFil(fil.id).length > 0) {
                corps.appendChild(groupe(null, [
                    ligneReglage("Voir la conversation", null, {
                        auClic: function () { allerAuFil(fil.id); },
                    }),
                ]));
            }

            const appels = APPELS.filter(function (a) { return a.contact === id; });
            if (appels.length > 0) {
                corps.appendChild(groupe("appels", appels.slice(0, 8).map(function (a) {
                    return ligneReglage(dateDeListe(a.t), libelleAppel(a));
                })));
            }
        },
    });
}


/* ------------------------------------------------------------
   MESSAGERIE VOCALE
   ------------------------------------------------------------ */
function listeDuRepondeur(corps) {

    const liste = el("div", { classe: "liste" });

    REPONDEUR.slice().sort(function (a, b) {
        return clefDeTri(b.t) - clefDeTri(a.t);
    }).forEach(function (message) {

        const nonLu = !dejaLu("repondeur:" + message.id);

        const bloc = el("div", { classe: "ligne repondeur-ligne" });

        if (nonLu) bloc.appendChild(el("span", { classe: "point-bleu" }));

        bloc.appendChild(el("div", { classe: "repondeur-haut" }, [
            avatar(message.contact, 40),
            el("div", { classe: "ligne-centre" }, [
                el("div", { classe: "ligne-haut" }, [
                    el("div", { classe: "ligne-titre", texte: nomContact(message.contact) }),
                    el("div", { classe: "ligne-droite", texte: dateDeListe(message.t) }),
                ]),
                el("div", { classe: "ligne-detail", texte: dateLongue(message.t) + " · " + message.duree }),
            ]),
        ]));

        bloc.appendChild(lecteurAudio(message));

        bloc.appendChild(el("div", { classe: "transcription", texte: message.transcription }));

        if (message.note) {
            bloc.appendChild(el("div", { classe: "ligne-detail", texte: message.note }));
        }

        liste.appendChild(bloc);
    });

    corps.appendChild(liste);
}


/* ------------------------------------------------------------
   lecteurAudio(message)
   ------------------------------------------------------------
   Une forme d'onde dessinée en barres, qui se colore de gauche
   à droite pendant la « lecture ». La durée est celle écrite
   dans les données : on fait semblant, et ça suffit — c'est la
   transcription qu'on lit, de toute façon.
   ------------------------------------------------------------ */
function lecteurAudio(message) {

    const nombreDeBarres = 42;
    const onde = el("div", { classe: "onde" });
    const barres = [];

    for (let i = 0; i < nombreDeBarres; i++) {
        // une silhouette de voix : des creux et des bosses stables
        const hauteur = 20 + Math.abs(Math.sin(i * 0.9) * 50) + Math.abs(Math.cos(i * 2.3) * 28);
        const barre = el("i", { style: { height: Math.min(hauteur, 100) + "%" } });
        barres.push(barre);
        onde.appendChild(barre);
    }

    const bouton = el("div", { classe: "lecteur-bouton cliquable" }, [
        el("span", { classe: "glyphe", html: ICONES.lecture }),
    ]);

    let enLecture = false;
    let minuteur = null;
    let position = 0;

    const secondes = (function () {
        const morceaux = String(message.duree).split(":");
        return Number(morceaux[0]) * 60 + Number(morceaux[1] || 0);
    })();

    const arreter = function () {
        enLecture = false;
        if (minuteur) clearInterval(minuteur);
        minuteur = null;
        bouton.firstChild.innerHTML = ICONES.lecture;
    };

    bouton.addEventListener("click", function () {

        if (enLecture) { arreter(); return; }

        marquerLu("repondeur:" + message.id);
        if (message.indice) ENQUETE.trouver(message.indice);

        enLecture = true;
        bouton.firstChild.innerHTML = ICONES.pause;
        SONS.tape();

        const pasDeTemps = (secondes * 1000) / nombreDeBarres;

        minuteur = setInterval(function () {
            if (position >= nombreDeBarres) {
                position = 0;
                barres.forEach(function (b) { b.classList.remove("jouee"); });
                arreter();
                return;
            }
            barres[position].classList.add("jouee");
            position++;
        }, pasDeTemps);
    });

    return el("div", { classe: "lecteur" }, [
        bouton,
        onde,
        el("div", { classe: "ligne-detail", texte: message.duree }),
    ]);
}
