/* ============================================================
   APPLICATION — MUSIQUE
   ============================================================
   Décor et respiration. Aucun indice obligatoire ici : c'est
   l'application qu'on ouvre par curiosité, et qui fait exister
   quelqu'un. On apprend trois choses sur Lena en lisant ses
   playlists, et c'est tout ce qu'on lui demande.

   ⚠️ Evan : les titres sont des inventions. Si tu veux mettre
   de vraies chansons (et éventuellement un vrai extrait audio
   dans 11/assets/), c'est ici.
   ============================================================ */

const PLAYLISTS = [
    {
        id: "pl01",
        nom: "nuit sans personne",
        sousTitre: "11 titres · pour marcher à 2 h du matin",
        couleur: "#2C5F8A",
        titres: [
            ["Hafenlichter", "Ava Nordwind", "4:12"],
            ["Sous la passerelle", "Clé de Sol", "3:38"],
            ["Brume (version longue)", "Ida Sørensen", "7:02"],
            ["Bülk", "Ava Nordwind", "2:54"],
            ["Le ferry de 22 h 40", "Les Mouettes Tristes", "3:19"],
            ["Novembre, encore", "Ida Sørensen", "5:41"],
            ["Trois secondes", "Hanno K.", "2:08"],
            ["Nordlicht", "Ava Nordwind", "4:50"],
            ["Ce qu'on laisse allumé", "Clé de Sol", "4:04"],
            ["Marcher jusqu'à ce que ça passe", "Hanno K.", "6:22"],
            ["Rentrer", "Ida Sørensen", "3:11"],
        ],
    },
    {
        id: "pl02",
        nom: "Oma",
        sousTitre: "6 titres · à mettre fort dans la cuisine",
        couleur: "#8A6B5A",
        titres: [
            ["Schlager pour toujours", "Die Gemütlichen", "3:02"],
            ["Rote Grütze", "Die Gemütlichen", "2:48"],
            ["Un bonnet, Lena", "Hanne B.", "0:41"],
            ["Valse du pommier", "Orchester Eckernförde", "3:55"],
            ["Trop de soupe", "Die Gemütlichen", "2:30"],
            ["Le vent de l'est", "Orchester Eckernförde", "4:18"],
        ],
    },
    {
        id: "pl03",
        nom: "08.10",
        sousTitre: "11 titres · ne pas demander",
        couleur: "#C9A876",
        titres: [
            ["Un oiseau géant", "Bluey", "0:11"],
            ["Le gâteau n'est pas à partager", "Cakey", "1:08"],
            ["Descendre une façade", "Bob", "4:08"],
            ["La veilleuse reste allumée", "Cakey", "3:33"],
            ["Une plume blanche", "Doudou", "5:12"],
            ["Chaussette en laine", "Samsam", "2:02"],
            ["La dernière crêpe", "Fraisy", "1:44"],
            ["Dé à coudre", "Bob", "2:20"],
            ["Baguette à sushi", "Bob", "0:58"],
            ["Le nid", "Rosy", "6:40"],
            ["Rentrer par la fenêtre", "Bob", "3:08"],
        ],
    },
];


enregistrerApp({
    id: "musique",
    nom: "Musique",
    icone: "musique",

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Playlists",
            contenu: function (corps) {

                const liste = el("div", { classe: "liste" });

                PLAYLISTS.forEach(function (playlist) {
                    const pochette = el("div", {
                        style: {
                            width: "52px", height: "52px", borderRadius: "6px", flex: "0 0 auto",
                            background: "linear-gradient(145deg, " + playlist.couleur + ", #12161F)",
                        },
                    });

                    liste.appendChild(ligne({
                        avatar: pochette,
                        titre: playlist.nom,
                        sousTitre: playlist.sousTitre,
                        lignes: 1,
                        auClic: function () { ouvrirPlaylist(playlist); },
                    }));
                });

                corps.appendChild(liste);

                corps.appendChild(el("div", {
                    classe: "groupe-pied",
                    style: { padding: "16px 20px" },
                    texte: "Dernière écoute : 8 novembre, 23 h 44.",
                }));
            },
        });
    },
});


function ouvrirPlaylist(playlist) {

    OS.pousser({
        titre: playlist.nom,
        retourTexte: "Playlists",
        contenu: function (corps) {

            corps.appendChild(el("div", {
                style: {
                    margin: "14px auto 10px",
                    width: "180px", height: "180px", borderRadius: "10px",
                    background: "linear-gradient(145deg, " + playlist.couleur + ", #12161F)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                },
            }));

            corps.appendChild(el("div", {
                style: { textAlign: "center", fontSize: "20px", fontWeight: "700", padding: "4px 20px" },
                texte: playlist.nom,
            }));

            corps.appendChild(el("div", {
                style: { textAlign: "center", fontSize: "13px", color: "var(--texte-gris)", paddingBottom: "12px" },
                texte: playlist.sousTitre,
            }));

            const liste = el("div", { classe: "liste" });

            playlist.titres.forEach(function (titre, index) {
                liste.appendChild(ligne({
                    titre: titre[0],
                    sousTitre: titre[1],
                    droite: titre[2],
                    lignes: 1,
                    chevron: false,
                    auClic: function () {
                        SONS.tape();
                        OS.toast("Aucun écouteur connecté", { info: true, icone: ICONES.micro });
                    },
                }));
                void index;
            });

            corps.appendChild(liste);
        },
    });
}
