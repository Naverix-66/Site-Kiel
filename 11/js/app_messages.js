/* ============================================================
   APPLICATION — MESSAGES
   ============================================================
   Deux écrans : la liste des conversations, et un fil.

   Particularité du jeu : Mira écrit EN DIRECT dans le fil de
   Lena. La joueuse lui répond en choisissant une réplique
   (pas de clavier : on est sur un téléphone, et surtout on
   veut que chaque réponse compte).

   C'est le scénario (scenario.js) qui décide quand Mira parle
   et ce qu'on peut lui répondre. Cette application ne fait que
   l'afficher.
   ============================================================ */

enregistrerApp({
    id: "messages",
    nom: "Messages",
    icone: "messages",
    dock: true,

    badge: function () {
        return filsNonLus();
    },

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Messages",
            contenu: function (corps) {
                listeDesFils(corps);
            },
        });
    },
});


/* ------------------------------------------------------------
   ÉCRAN 1 — la liste des conversations
   ------------------------------------------------------------ */
function listeDesFils(corps) {

    corps.appendChild(champDeRecherche());

    const liste = el("div", { classe: "liste" });

    filsVisibles().forEach(function (fil) {

        const dernier = dernierMessage(fil.id);
        const nonLu = !dejaLu("fil:" + fil.id);
        const nom = fil.nomDuGroupe || nomContact(fil.contact);

        const apercuTexte = dernier
            ? (dernier.de === "moi" ? "Vous : " : "") + dernier.txt
            : "";

        liste.appendChild(ligne({
            avatar: fil.nomDuGroupe
                ? avatar({ nom: fil.nomDuGroupe, couleur: "#3A4250" }, 48)
                : avatar(fil.contact, 48),
            titre: nom,
            sousTitre: apercuTexte,
            droite: dernier ? dateDeListe(dernier.t) : "",
            nonLue: nonLu,
            auClic: function () { ouvrirFil(fil.id); },
        }));
    });

    corps.appendChild(liste);
}


/* ------------------------------------------------------------
   ÉCRAN 2 — un fil de discussion
   ------------------------------------------------------------ */
function ouvrirFil(idFil) {

    const fil = FILS_PAR_ID[idFil];
    if (!fil) return;

    const premiereOuverture = marquerLu("fil:" + idFil);

    // Les indices portés par les messages : on les ramasse à la
    // lecture. Si elle a ouvert le fil, elle a lu.
    const indices = [];
    messagesDuFil(idFil).forEach(function (m) {
        if (m.indice) indices.push(m.indice);
    });

    const nom = fil.nomDuGroupe || nomContact(fil.contact);

    OS.pousser({
        titre: nom,
        sousTitre: fil.nomDuGroupe ? fil.groupe.length + " personnes" : null,
        retourTexte: "Messages",
        plein: true,
        // cle sert au scénario : « est-ce que la joueuse a ce fil
        // sous les yeux en ce moment ? » (sinon on notifie)
        cle: "fil:" + fil.id,
        contenu: function (vue) { dessinerFil(vue, fil); },
    });

    // On ramasse les indices juste après l'affichage, pour que
    // le petit bandeau « Noté » passe par-dessus le fil ouvert.
    plusTard(function () {
        ENQUETE.trouverPlusieurs(indices);
        if (typeof SCENARIO !== "undefined") SCENARIO.filOuvert(idFil, premiereOuverture);
    }, 420);
}


function dessinerFil(vue, fil) {

    const zone = el("div", { classe: "fil" });
    const messages = messagesDuFil(fil.id);

    /* --- l'en-tête : avatar, nom, numéro --- */
    const contact = fil.contact ? CONTACTS[fil.contact] : null;
    zone.appendChild(el("div", { classe: "fil-entete-contact" }, [
        fil.nomDuGroupe
            ? avatar({ nom: fil.nomDuGroupe, couleur: "#3A4250" }, 62)
            : avatar(fil.contact, 62),
        el("div", { classe: "nom", texte: fil.nomDuGroupe || nomContact(fil.contact) }),
        el("div", {
            classe: "numero",
            texte: fil.nomDuGroupe ? fil.groupe.join(", ") : (contact ? contact.numero : ""),
        }),
    ]));

    /* --- les messages ---
       Règles d'affichage, copiées sur iOS :
         - une seule ligne de date, centrée, quand le temps saute
           (jour différent, ou plus d'une demi-heure de silence) ;
         - pas d'heure sous chaque bulle : c'était illisible ;
         - la pointe de bulle seulement sur la dernière d'une rafale ;
         - « Lu » seulement sous le tout dernier message envoyé. */

    let dernierHorodatage = -1;

    messages.forEach(function (message, index) {

        const quand = clefDeTri(message.t);
        const precedent = messages[index - 1];
        const suivant = messages[index + 1];

        const jourDifferent = !precedent || precedent.t.split(" ")[0] !== message.t.split(" ")[0];
        const grandSilence = dernierHorodatage >= 0 && (quand - dernierHorodatage) > 30;

        if (jourDifferent || grandSilence) {
            const d = decouperDate(message.t);
            const etiquette = el("div", { classe: "separateur-date" });

            etiquette.appendChild(el("b", {
                texte: estAujourdhui(message.t) ? "Aujourd'hui" : dateLongue(message.t),
            }));
            etiquette.appendChild(el("span", { texte: d.heure !== null ? "  " + justeLHeure(message.t) : "" }));

            zone.appendChild(etiquette);
        }

        dernierHorodatage = quand;

        if (message.efface) {
            zone.appendChild(el("div", {
                classe: "bulle bulle--eux bulle--pointe",
                texte: "Ce message a été supprimé",
                style: { opacity: "0.45", fontStyle: "italic" },
            }));
            return;
        }

        const aMoi = message.de === "moi";

        // Dans un groupe, on écrit qui parle au-dessus de la rafale.
        if (message.auteur && !aMoi && (!precedent || precedent.auteur !== message.auteur)) {
            zone.appendChild(el("div", { classe: "bulle-heure", texte: message.auteur }));
        }

        // Dernière bulle de la rafale ? (changement de camp, ou fin)
        const finDeRafale = !suivant || suivant.de !== message.de || suivant.auteur !== message.auteur;

        zone.appendChild(el("div", {
            classe: "bulle bulle--" + (aMoi ? "moi" : "eux") + (finDeRafale ? " bulle--pointe" : ""),
            texte: message.txt,
        }));

        // l'accusé de lecture, une seule fois, sur le dernier envoyé
        if (message.info && aMoi && !suivant) {
            zone.appendChild(el("div", { classe: "accuse-lecture", texte: message.info }));
        }
    });

    /* --- Mira est en train d'écrire ? --- */
    if (typeof SCENARIO !== "undefined" && SCENARIO.estEnEcriture(fil.id)) {
        zone.appendChild(el("div", { classe: "ecrit" }, [
            el("span"), el("span"), el("span"),
        ]));
    }

    vue.appendChild(zone);

    /* --- les réponses proposées, ou la barre de saisie morte --- */
    const reponses = (typeof SCENARIO !== "undefined") ? SCENARIO.reponsesPour(fil.id) : null;

    if (reponses && reponses.length > 0) {
        const zoneReponses = el("div", { classe: "reponses" });

        reponses.forEach(function (reponse) {
            zoneReponses.appendChild(el("button", {
                classe: "reponse",
                texte: reponse.txt,
                auClic: function () {
                    SONS.message();
                    SCENARIO.choisirReponse(fil.id, reponse.id);
                },
            }));
        });

        vue.appendChild(zoneReponses);

    } else {
        vue.appendChild(el("div", { classe: "barre-saisie" }, [
            el("div", {
                classe: "faux-champ",
                texte: fil.id === "mira" ? "Attendre Mira…" : "Message",
            }),
            el("span", { classe: "glyphe", style: { width: "22px", height: "22px" }, html: ICONES.flecheHaut }),
        ]));
    }

    /* On colle le fil en bas, comme un vrai.

       ⚠️ Tout de suite, PUIS au prochain rendu. Avant, on
       attendait 30 ms : le fil s'affichait donc en haut, puis
       sautait en bas — c'était la secousse visible à chaque
       message reçu. La version synchrone suffit quand on
       rafraîchit (la vue est déjà dans la page) ; le
       requestAnimationFrame couvre le cas où la vue vient
       d'être créée et n'est pas encore attachée. */
    const callerEnBas = function () { zone.scrollTop = zone.scrollHeight; };

    callerEnBas();
    window.requestAnimationFrame(callerEnBas);
}


/* ------------------------------------------------------------
   OUVRIR UN FIL DEPUIS N'IMPORTE OÙ
   ------------------------------------------------------------
   Utilisé par les bannières de notification et par le carnet.
   ------------------------------------------------------------ */
function allerAuFil(idFil) {
    if (OS.appOuverte === "messages") {
        OS.retourRacine();
        ouvrirFil(idFil);
        return;
    }

    OS.ouvrirApp("messages");
    plusTard(function () { ouvrirFil(idFil); }, 120);
}
