/* ============================================================
   APPLICATION — NOTES
   ============================================================
   Deux écrans : la liste, une note.

   Une des notes est verrouillée par un MOT (pas par un code
   à quatre chiffres) : c'est le seul endroit du jeu où on
   tape des lettres. Le mot, c'est le nom du chat — qui traîne
   dans un mail de vétérinaire et dans une légende de photo.
   ============================================================ */

enregistrerApp({
    id: "notes",
    nom: "Notes",
    icone: "notes",

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Notes",
            contenu: function (corps) {

                const liste = el("div", { classe: "liste" });

                notesVisibles().forEach(function (note) {

                    const verrouillee = note.verrou && !estOuvert(note.verrou);

                    liste.appendChild(ligne({
                        titre: titreDeNote(note),
                        sousTitre: apercuDeNote(note),
                        droite: dateDeListe(note.t),
                        classe: verrouillee ? "ligne--verrouillee" : null,
                        auClic: function () {
                            if (verrouillee) {
                                demanderMotDeLaNote(note);
                            } else {
                                ouvrirNote(note);
                            }
                        },
                    }));

                    if (verrouillee) {
                        const derniere = liste.lastChild;
                        derniere.insertBefore(el("span", {
                            classe: "glyphe",
                            style: { width: "15px", height: "15px", color: "var(--texte-faible)" },
                            html: ICONES.verrou,
                        }), derniere.firstChild);
                    }
                });

                corps.appendChild(liste);

                corps.appendChild(el("div", {
                    classe: "groupe-pied",
                    style: { padding: "14px 20px" },
                    texte: notesVisibles().length + " notes",
                }));
            },
        });
    },
});


function demanderMotDeLaNote(note) {
    OS.demanderMot({
        titre: note.consigne || "Note verrouillée",
        indice: note.indiceDeVerrou,
        bonMot: note.mot,
        annule: function () { },
        reussi: function () {
            ouvrirVerrou(note.verrou);
            SONS.revelation();
            OS.toast("Note déverrouillée", { icone: ICONES.verrouOuvert });
            OS.rafraichir();
            plusTard(function () { ouvrirNote(note); }, 200);
        },
    });
}


function ouvrirNote(note) {

    marquerLu("note:" + note.id);

    OS.pousser({
        titre: "",
        retourTexte: "Notes",
        contenu: function (corps) {

            const bloc = el("div", { classe: "note-corps" });

            if (note.titre) bloc.appendChild(el("h2", { texte: note.titre }));

            bloc.appendChild(el("div", {
                classe: "date",
                texte: dateLongue(note.t) + " à " + justeLHeure(note.t),
            }));

            (note.corps || []).forEach(function (element) {

                if (element.type === "liste") {
                    const ul = el("ul");

                    (element.items || []).forEach(function (item) {
                        const li = el("li", { classe: item.coche ? "coche" : "" });

                        const texte = el("span", {
                            classe: (item.souligne ? "souligne " : "") + (item.barre ? "barre" : ""),
                            texte: item.texte,
                        });

                        li.appendChild(texte);
                        ul.appendChild(li);
                    });

                    bloc.appendChild(ul);
                    return;
                }

                if (element.type === "manuscrit") {
                    bloc.appendChild(el("p", { classe: "manuscrit", texte: element.texte }));
                    return;
                }

                bloc.appendChild(el("p", {
                    texte: element.texte,
                    style: element.texte === "" ? { height: "12px" } : null,
                }));
            });

            corps.appendChild(bloc);
        },
    });

    plusTard(function () {
        if (note.indice) ENQUETE.trouver(note.indice);
    }, 450);
}
