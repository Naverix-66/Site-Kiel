/* ============================================================
   LA PELLICULE
   ============================================================
   Chaque photo porte ses métadonnées, exactement comme une
   vraie : date, heure, lieu, appareil. Et c'est TOUT l'intérêt —
   la moitié des indices du jeu ne sont pas dans l'image, ils
   sont dans l'heure de prise de vue.

   Une photo s'affiche de trois façons possibles :
       peinture : "hornbrucke"      -> dessinée en SVG
       capture  : "sms_3h"          -> une fausse capture d'écran
                                       (du vrai HTML maquillé)
       fichier  : "assets/truc.jpg" -> une vraie photo, si un
                                       jour Evan en met une
   ============================================================ */

const PHOTOS = [

    /* ---------- le printemps, l'été ---------- */
    {
        id: "p01", peinture: "velo_bleu", t: "12/06 11:20",
        lieu: "Jägersberg, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        albums: ["pellicule"],
    },
    {
        id: "p02", peinture: "fjord_juillet", t: "03/07 21:04",
        lieu: "Strande", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "",
        favori: true,
        albums: ["pellicule", "favoris"],
        indice: "photo_favorite",
    },
    {
        id: "p03", peinture: "deux_filles", t: "15/08 00:40",
        lieu: "Jägersberg, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "les nuits où Mira ne travaille pas",
        albums: ["pellicule"],
    },

    /* ---------- easter egg : la nuit du 8 octobre ---------- */
    {
        id: "p04", peinture: "peluches", t: "08/10 03:20",
        lieu: "Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "??? je n'ai pas pris cette photo",
        albums: ["pellicule"],
    },

    /* ---------- l'automne ---------- */
    {
        id: "p05", peinture: "chat_fenetre", t: "12/09 08:02",
        lieu: "Jägersberg, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "sa place",
        albums: ["pellicule"],
    },
    {
        id: "p06", peinture: "kiosque", t: "02/10 23:14",
        lieu: "Hörn, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        albums: ["pellicule"],
    },
    {
        id: "p07", peinture: "grues", t: "24/10 22:48",
        lieu: "Werft, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "pour la série « nuit sans personne »",
        albums: ["pellicule"],
    },
    {
        id: "p08", peinture: "lampadaire_brume", t: "30/10 23:30",
        lieu: "Düsternbrook, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        albums: ["pellicule"],
    },
    {
        id: "p09", peinture: "quai_nuit", t: "02/11 22:02",
        lieu: "Hörn, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        albums: ["pellicule"],
    },
    {
        id: "p10", peinture: "appartement_nuit", t: "07/11 19:50",
        lieu: "Jägersberg 14, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "elle laisse toujours la lampe allumée",
        albums: ["pellicule"],
    },

    /* ---------- la nuit du 8 ---------- */
    {
        id: "p11", peinture: "hornbrucke", t: "08/11 22:10",
        lieu: "Hörnbrücke, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        albums: ["pellicule"],
        indice: "photo_horn",
    },
    {
        id: "p12", peinture: "ferry", t: "08/11 22:34",
        lieu: "Hörn, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "le dernier de la soirée",
        albums: ["pellicule"],
    },
    {
        id: "p13", peinture: "noir_presque", t: "08/11 23:46",
        lieu: "Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "",
        albums: ["pellicule"],
    },


    /* ========================================================
       L'ALBUM PRIVÉ — verrouillé (code 2104)
       ========================================================
       Ce ne sont pas des photos : ce sont des preuves. Elle les
       gardait en prévision du jour où il faudrait les montrer
       à quelqu'un.
       ======================================================== */
    {
        id: "pr01", capture: "sms_3h", t: "02/10 03:41",
        lieu: null, appareil: "Capture d'écran",
        legende: "14 messages entre 3 h et 3 h 40",
        albums: ["prive"],
        indice: "capture_3h",
    },
    {
        id: "pr02", capture: "appels_manques", t: "11/10 09:12",
        lieu: null, appareil: "Capture d'écran",
        legende: "une nuit de travail. 23 appels.",
        albums: ["prive"],
    },
    {
        id: "pr03", peinture: "fleurs_porte", t: "18/10 07:40",
        lieu: "Jägersberg 14, Kiel", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "je n'ai donné cette adresse à personne",
        albums: ["prive"],
        indice: "capture_fleurs",
    },
    {
        id: "pr04", capture: "je_sais_toujours", t: "26/10 01:22",
        lieu: null, appareil: "Capture d'écran",
        legende: "garder. montrer. ne pas effacer.",
        albums: ["prive"],
    },
    {
        id: "pr05", capture: "code_tobias", t: "29/10 20:16",
        lieu: null, appareil: "Capture d'écran",
        legende: "il tape son code devant moi comme si j'étais un meuble",
        albums: ["prive"],
        indice: "capture_code_tobias",
    },


    /* ========================================================
       RÉCEMMENT SUPPRIMÉS
       ========================================================
       Supprimées le 9 novembre à 1 h 20, en rentrant. Toutes
       les trois datent du 3 juillet. C'est la clef de l'acte III.
       ======================================================== */
    {
        id: "s01", peinture: "phare_bulk", t: "03/07 21:58",
        lieu: "Bülk, Strande", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        supprimeeLe: "09/11 01:20",
        albums: ["supprimes"],
        indice: "photos_supprimees",
    },
    {
        id: "s02", peinture: "porte_bleue", t: "03/07 22:10",
        lieu: "Bülk, Strande", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        supprimeeLe: "09/11 01:20",
        albums: ["supprimes"],
    },
    {
        id: "s03", peinture: "cle_pierres", t: "03/07 22:12",
        lieu: "Bülk, Strande", appareil: "iPhone 12 mini — 26 mm — f/1.6",
        legende: "la troisième pierre",
        supprimeeLe: "09/11 01:20",
        albums: ["supprimes"],
    },


    /* ========================================================
       ÉPILOGUE — n'apparaît qu'à la toute fin
       ======================================================== */
    {
        id: "e01", peinture: "argentique_fin", t: "12/12 15:30",
        lieu: "Bülk, Strande", appareil: "Scan — négatif 35 mm",
        legende: "de l'intérieur",
        albums: ["pellicule"],
        cache: function () { return !ETAT.epilogueVu; },
    },
];


/* ------------------------------------------------------------
   LES ALBUMS
   ------------------------------------------------------------ */
const ALBUMS = [
    { id: "pellicule", nom: "Pellicule", couverture: "p11" },
    { id: "favoris", nom: "Favoris", couverture: "p02" },
    {
        id: "prive", nom: "Privé", couverture: "pr01",
        verrou: "albumPrive", code: CODE_ALBUM_PRIVE,
        consigne: "Album verrouillé",
        indice: "Quatre chiffres. Elle a laissé l'explication dans ses notes.",
    },
    { id: "supprimes", nom: "Récemment supprimés", couverture: "s01", pied: "Les éléments sont conservés 30 jours." },
];


function photosDeLAlbum(idAlbum) {
    return PHOTOS.filter(function (photo) {
        if (photo.cache && photo.cache()) return false;
        return photo.albums.indexOf(idAlbum) !== -1;
    }).sort(function (a, b) {
        return clefDeTri(b.t) - clefDeTri(a.t);     // les plus récentes en premier
    });
}


function photoParId(id) {
    return PHOTOS.filter(function (p) { return p.id === id; })[0] || null;
}


/* ------------------------------------------------------------
   imagePhoto(photo, options)
   ------------------------------------------------------------
   Fabrique l'image d'une photo, quelle que soit sa nature.
   options.recadre : remplir le cadre en coupant (vignettes).
   options.grande  : pour les captures, afficher en grand.
   ------------------------------------------------------------ */
function imagePhoto(photo, options) {
    const o = options || {};

    if (photo.fichier) {
        return el("img", { attrs: { src: photo.fichier, alt: photo.legende || "" } });
    }

    if (photo.capture) {
        const fabrique = CAPTURES[photo.capture] || CAPTURES.manquante;
        const element = fabrique();
        if (o.grande) element.classList.add("capture--grande");
        return element;
    }

    return peindre(photo.peinture, { recadre: o.recadre });
}


/* ============================================================
   LES CAPTURES D'ÉCRAN
   ============================================================
   Astuce : une capture d'écran de téléphone, dans un téléphone,
   c'est juste… du HTML. On redessine une mini-interface de
   messagerie, en 9/16, et ça passe pour une image. Avantage
   énorme : le texte reste net quand on zoome, et on peut
   l'écrire en français sans repasser par un éditeur d'images.
   ============================================================ */

/* Un petit fil de discussion maquillé en capture. */
function captureFil(options) {
    const o = options || {};

    const fil = el("div", { classe: "capture-fil" });

    (o.messages || []).forEach(function (m) {
        if (m.heure) {
            fil.appendChild(el("div", { classe: "capture-heure", texte: m.heure }));
        }
        fil.appendChild(el("div", {
            classe: "capture-bulle capture-bulle--" + (m.de === "moi" ? "moi" : "eux"),
            texte: m.txt,
        }));
    });

    return el("div", { classe: "capture" }, [
        el("div", { classe: "capture-statut" }, [
            el("span", { texte: o.heure || "03:41" }),
            el("span", { texte: "▂▄ ▮" }),
        ]),
        el("div", { classe: "capture-nav", texte: o.titre || "Tobias" }),
        fil,
    ]);
}


const CAPTURES = {

    /* 14 messages entre 3 h et 3 h 40. On en montre six : le
       reste se devine, et c'est pire. */
    sms_3h: function () {
        return captureFil({
            heure: "03:41",
            titre: "Tobias",
            messages: [
                { heure: "03:02", de: "eux", txt: "tu dors ?" },
                { de: "eux", txt: "tu dors pas, tu as lu" },
                { heure: "03:14", de: "eux", txt: "pourquoi tu as éteint la lumière du salon à 1h12" },
                { de: "eux", txt: "je demande juste" },
                { heure: "03:31", de: "eux", txt: "réponds" },
                { heure: "03:40", de: "eux", txt: "dors bien" },
            ],
        });
    },

    /* La liste d'appels manqués d'une seule nuit. */
    appels_manques: function () {
        const liste = el("div", { classe: "capture-fil" });

        const heures = ["04:12", "03:58", "03:41", "03:20", "02:52", "02:41", "02:30", "01:58", "01:12", "00:40"];
        heures.forEach(function (h) {
            liste.appendChild(el("div", {
                classe: "capture-bulle capture-bulle--eux",
                texte: "Tobias — appel manqué — " + h,
            }));
        });

        return el("div", { classe: "capture" }, [
            el("div", { classe: "capture-statut" }, [
                el("span", { texte: "09:12" }),
                el("span", { texte: "▂▄ ▮" }),
            ]),
            el("div", { classe: "capture-nav", texte: "Récents — 23 manqués" }),
            liste,
        ]);
    },

    /* La phrase qui dit tout, et qu'il a écrite lui-même. */
    je_sais_toujours: function () {
        return captureFil({
            heure: "01:22",
            titre: "Tobias",
            messages: [
                { heure: "01:18", de: "moi", txt: "comment tu savais que j'étais au kiosk" },
                { de: "eux", txt: "je sais toujours où tu es" },
                { de: "eux", txt: "c'est pas une menace. c'est juste comme ça." },
                { heure: "01:21", de: "moi", txt: "qu'est-ce que tu veux dire" },
                { de: "eux", txt: "rien. dors." },
            ],
        });
    },

    /* La capture la plus bête du jeu, et la plus utile :
       une photo prise au restaurant, où on voit son écran. */
    code_tobias: function () {
        const ecran = el("div", { classe: "capture-fil" });

        ecran.appendChild(el("div", {
            classe: "capture-bulle capture-bulle--eux",
            texte: "photo prise au Pizzeria Montana, 29/10 — on voit son téléphone dans le reflet de la vitre",
        }));

        // le pavé numérique photographié, chiffres tapés visibles
        const pave = el("div", {
            classe: "capture-fil",
            style: {
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "6px",
                padding: "10px",
            },
        });

        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].forEach(function (chiffre) {
            const touche = el("div", {
                texte: chiffre,
                style: {
                    textAlign: "center",
                    padding: "7px 0",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    fontSize: "13px",
                },
            });

            // les quatre touches usées / éclairées par son doigt
            if (chiffre === "1" || chiffre === "9" || chiffre === "0" || chiffre === "8") {
                touche.style.background = "rgba(255,214,10,0.45)";
                touche.style.color = "#14171E";
                touche.style.fontWeight = "700";
            }

            pave.appendChild(touche);
        });

        return el("div", { classe: "capture" }, [
            el("div", { classe: "capture-statut" }, [
                el("span", { texte: "20:16" }),
                el("span", { texte: "▂▄ ▮" }),
            ]),
            el("div", { classe: "capture-nav", texte: "1 9 0 8" }),
            ecran,
            pave,
            el("div", {
                classe: "capture-heure",
                texte: "il déverrouille toujours dans le même ordre",
            }),
        ]);
    },

    manquante: function () {
        return el("div", { classe: "capture" }, [
            el("div", { classe: "capture-nav", texte: "capture manquante" }),
        ]);
    },
};
