/* ============================================================
   APPLICATION — MAIL
   ============================================================
   Trois écrans : les boîtes, une boîte, un message.

   C'est l'application la plus ennuyeuse du téléphone, et c'est
   exprès : personne ne lit ses reçus. Or la seule preuve
   solide de toute l'histoire est un reçu de 4,99 € rangé dans
   une corbeille par une règle automatique.

   C'est aussi d'ici que part le dernier geste du jeu :
   transférer le dossier à l'avocate.
   ============================================================ */

enregistrerApp({
    id: "mail",
    nom: "Mail",
    icone: "mail",

    badge: function () { return mailsNonLus(); },

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Boîtes",
            contenu: function (corps) {

                corps.appendChild(champDeRecherche());

                corps.appendChild(groupe(null, BOITES_MAIL.map(function (boite) {
                    const mails = mailsDeLaBoite(boite.id);
                    const nonLus = mails.filter(function (m) { return !dejaLu("mail:" + m.id); }).length;

                    return ligneReglage(boite.nom, nonLus > 0 ? String(nonLus) : String(mails.length), {
                        auClic: function () { ouvrirBoite(boite); },
                        alerte: nonLus > 0,
                    });
                })));

                corps.appendChild(el("div", {
                    classe: "bandeau-info",
                    texte: "lena.brandt@posteo.de",
                }));
            },
        });
    },
});


function ouvrirBoite(boite) {

    OS.pousser({
        titre: boite.nom,
        retourTexte: "Boîtes",
        contenu: function (corps) {

            const mails = mailsDeLaBoite(boite.id);
            const liste = el("div", { classe: "liste" });

            mails.forEach(function (mail) {
                const nonLu = !dejaLu("mail:" + mail.id);

                const centre = el("div", { classe: "ligne-centre" }, [
                    el("div", { classe: "ligne-haut" }, [
                        el("div", { classe: "mail-expediteur", texte: boite.id === "brouillons" ? "À : " + mail.a : mail.de.nom }),
                        el("div", { classe: "ligne-droite", texte: dateDeListe(mail.t) }),
                    ]),
                    el("div", { classe: "mail-objet", texte: mail.objet }),
                    el("div", { classe: "mail-apercu", texte: apercuDeMail(mail) }),
                ]);

                const element = el("div", {
                    classe: "ligne ligne--chevron" + (nonLu ? " ligne--non-lue" : ""),
                    auClic: function () { ouvrirMail(mail); },
                }, [centre]);

                if (nonLu) element.insertBefore(el("span", { classe: "point-bleu" }), element.firstChild);

                liste.appendChild(element);
            });

            corps.appendChild(liste);

            if (mails.length === 0) corps.appendChild(videMessage("Aucun message."));
            if (boite.pied) corps.appendChild(el("div", { classe: "groupe-pied", style: { padding: "12px 18px" }, texte: boite.pied }));
        },
    });
}


function ouvrirMail(mail) {

    marquerLu("mail:" + mail.id);

    OS.pousser({
        titre: "",
        retourTexte: "Retour",
        action: { icone: ICONES.corbeille, auClic: function () { OS.toast("On ne jette rien. Pas aujourd'hui.", { info: true, icone: ICONES.info }); } },
        contenu: function (corps) {

            corps.appendChild(el("div", { classe: "mail-entete" }, [
                el("div", { classe: "objet", texte: mail.objet }),
                el("div", { classe: "de", html: "De <b>" + mail.de.nom + "</b> &lt;" + mail.de.adresse + "&gt;" }),
                mail.a ? el("div", { classe: "de", html: "À <b>" + mail.a + "</b>" }) : null,
                el("div", { classe: "de", texte: dateLongue(mail.t) + " à " + justeLHeure(mail.t) }),
            ]));

            const corpsMail = el("div", { classe: "mail-corps" });

            (mail.corps || []).forEach(function (bloc) {

                if (bloc.type === "cite") {
                    corpsMail.appendChild(el("div", { classe: "cite", texte: bloc.texte }));
                    return;
                }

                if (bloc.type === "recu") {
                    const recu = el("div", { classe: "recu" });

                    (bloc.lignes || []).forEach(function (paire) {
                        recu.appendChild(el("div", { classe: "recu-ligne" }, [
                            el("span", { texte: paire[0] }),
                            el("b", { texte: paire[1] }),
                        ]));
                    });

                    if (bloc.total) {
                        recu.appendChild(el("div", { classe: "recu-ligne recu-total" }, [
                            el("span", { texte: bloc.total[0] }),
                            el("span", { texte: bloc.total[1] }),
                        ]));
                    }

                    corpsMail.appendChild(recu);
                    return;
                }

                corpsMail.appendChild(el("p", { texte: bloc.texte, style: { marginBottom: "12px" } }));
            });

            corps.appendChild(corpsMail);

            /* --- le dernier geste du jeu --- */
            if (mail.id === "c01" && ETAT.acte >= 4 && !ETAT.preuvesEnvoyees) {
                corps.appendChild(el("div", { classe: "zone-boutons" }, [
                    bouton("Transférer à Me Vogt", function () {
                        SCENARIO.envoyerPreuves();
                    }),
                    el("div", {
                        classe: "groupe-pied",
                        texte: "Le reçu d'abonnement et le journal de positions. C'est ça, le dossier.",
                    }),
                ]));
            }

            if (mail.id === "c01" && ETAT.preuvesEnvoyees) {
                corps.appendChild(el("div", { classe: "zone-boutons" }, [
                    el("div", {
                        classe: "mira-aide",
                        html: "<b>Envoyé</b>Transféré à kanzlei@vogt-partner.de, avec le journal de positions en pièce jointe.",
                    }),
                ]));
            }
        },
    });

    plusTard(function () {
        if (mail.indice) ENQUETE.trouver(mail.indice);
        if (mail.indicesEnPlus) ENQUETE.trouverPlusieurs(mail.indicesEnPlus);
    }, 500);
}


/* ------------------------------------------------------------
   LES RÈGLES DE TRI
   ------------------------------------------------------------
   La ligne la plus glaçante du téléphone, et la plus facile à
   rater : une règle sans nom, créée depuis un navigateur, qui
   efface une seule chose.
   ------------------------------------------------------------ */
function ecranReglesMail() {

    OS.pousser({
        titre: "Règles de tri",
        retourTexte: "Mail",
        contenu: function (corps) {

            REGLES_MAIL.forEach(function (regle) {
                corps.appendChild(groupe(regle.nom, [
                    ligneReglage("Condition", null),
                    el("div", { classe: "reglage", style: { color: "var(--texte-gris)", fontSize: "14px" } }, [
                        el("div", { classe: "reglage-libelle", texte: regle.condition }),
                    ]),
                    ligneReglage("Action", null),
                    el("div", { classe: "reglage", style: { color: "var(--texte-gris)", fontSize: "14px" } }, [
                        el("div", { classe: "reglage-libelle", texte: regle.action }),
                    ]),
                    ligneReglage("Créée le", regle.creee, { alerte: !!regle.indice }),
                    ligneReglage("Depuis", regle.depuis, { alerte: !!regle.indice }),
                ]));
            });

            corps.appendChild(el("div", {
                classe: "groupe-pied",
                style: { padding: "14px 20px" },
                texte: "Une règle créée depuis un navigateur ne laisse aucune notification sur le téléphone.",
            }));
        },
    });

    plusTard(function () { ENQUETE.trouver("regle_mail"); }, 500);
}
