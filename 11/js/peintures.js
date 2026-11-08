/* ============================================================
   LES PEINTURES
   ============================================================
   Le téléphone contient une quarantaine d'images et PAS UN SEUL
   FICHIER. Tout est peint en SVG, comme la façade et la cour
   d'octobre.

   Trois raisons :
     1. ça pèse zéro octet et ça se charge instantanément ;
     2. ça se retouche au clavier (« le phare un peu plus à
        gauche ») sans ouvrir un éditeur d'images ;
     3. on peut y cacher des détails lisibles — un numéro sur
        une coque, un mot sur une porte — et la joueuse peut
        zoomer dessus : c'est du vectoriel, ça reste net.

   Chaque peinture est un objet :
       { boite: "0 0 300 400", dessin: function () { return "<...>"; } }

   On ne l'utilise jamais directement : on appelle peindre().

   ⚠️ Si Evan veut remplacer une peinture par une vraie photo
   prise à Kiel, il suffit de mettre le fichier dans 11/assets/
   et d'écrire `fichier: "assets/hornbrucke.jpg"` dans la photo
   concernée (donnees_photos.js). Le reste du jeu ne change pas.
   ============================================================ */


/* ------------------------------------------------------------
   LE VOCABULAIRE COMMUN
   ------------------------------------------------------------
   Des petits bouts de SVG qu'on recombine d'une peinture à
   l'autre : le ciel, l'eau, la brume, le grain.
   ------------------------------------------------------------ */

/* Un dégradé vertical. On fabrique un identifiant unique à
   chaque appel, sinon deux dégradés du même nom se marchent
   dessus dans la page. */
let compteurDeDegrades = 0;

function degrade(etapes, vertical) {
    compteurDeDegrades++;
    const id = "deg" + compteurDeDegrades;

    let arrets = "";
    etapes.forEach(function (e) {
        arrets += '<stop offset="' + e[0] + '" stop-color="' + e[1] + '"' +
            (e[2] !== undefined ? ' stop-opacity="' + e[2] + '"' : "") + "/>";
    });

    const coords = vertical === false
        ? 'x1="0" y1="0" x2="1" y2="0"'
        : 'x1="0" y1="0" x2="0" y2="1"';

    return {
        id: id,
        def: '<linearGradient id="' + id + '" ' + coords + '>' + arrets + "</linearGradient>",
    };
}


/* ------------------------------------------------------------
   LE MODE LÉGER
   ------------------------------------------------------------
   ⚠️ Le grain (feTurbulence) et la brume (feGaussianBlur) sont
   des filtres SVG, et un filtre coûte très cher dès qu'il
   couvre tout l'écran. Tant qu'on affichait une photo à la
   fois, aucun problème. Depuis que Kiek empile huit vidéos
   plein écran et que le fil d'Insta en aligne quinze, Safari
   sur iPhone finissait par rendre l'âme : c'était ÇA, les
   plantages de Kiek.

   Donc : par défaut on peint LÉGER (aucun filtre). On ne
   demande le grain que là où il y a une seule image à l'écran
   — la visionneuse Photos et la photo imprimée de l'enveloppe —
   avec peindre(clef, { detail: true }).
   ------------------------------------------------------------ */
let PEINTURE_DETAILLEE = false;


/* Le grain argentique : un bruit léger posé sur toute l'image.
   C'est LE détail qui fait "photo de nuit" au lieu de "dessin" —
   mais on ne se l'autorise qu'en gros plan. */
function grain(opacite) {
    if (!PEINTURE_DETAILLEE) return "";

    compteurDeDegrades++;
    const id = "grain" + compteurDeDegrades;

    return '<filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/>' +
        '<feColorMatrix type="saturate" values="0"/></filter>' +
        '<rect width="100%" height="100%" filter="url(#' + id + ')" opacity="' + (opacite || 0.14) + '" ' +
        'style="mix-blend-mode:overlay"/>';
}


/* Le vignettage : les coins qui s'assombrissent. */
function vignette(force) {
    compteurDeDegrades++;
    const id = "vig" + compteurDeDegrades;

    return '<radialGradient id="' + id + '" cx="50%" cy="48%" r="72%">' +
        '<stop offset="55%" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="100%" stop-color="#000" stop-opacity="' + (force || 0.55) + '"/>' +
        '</radialGradient>' +
        '<rect width="100%" height="100%" fill="url(#' + id + ')"/>';
}


/* Une bande de brume horizontale. Floutée en gros plan, simple
   dégradé en mode léger — à l'œil, à cette taille, on ne voit
   pas la différence. */
function brume(y, hauteur, opacite, couleur) {
    compteurDeDegrades++;
    const id = "flou" + compteurDeDegrades;
    const teinte = couleur || "#8FA3BE";

    if (!PEINTURE_DETAILLEE) {
        const doux = degrade([
            ["0%", teinte, 0],
            ["45%", teinte, opacite],
            ["100%", teinte, 0],
        ]);
        return "<defs>" + doux.def + "</defs>" +
            '<rect x="-60" y="' + y + '" width="500" height="' + hauteur + '" fill="url(#' + doux.id + ')"/>';
    }

    return '<filter id="' + id + '"><feGaussianBlur stdDeviation="9"/></filter>' +
        '<rect x="-60" y="' + y + '" width="500" height="' + hauteur + '" ' +
        'fill="' + teinte + '" opacity="' + opacite + '" filter="url(#' + id + ')"/>';
}


/* Un halo de lumière (lampadaire, phare, fenêtre). */
function halo(x, y, rayon, couleur, opacite) {
    compteurDeDegrades++;
    const id = "halo" + compteurDeDegrades;

    return '<radialGradient id="' + id + '">' +
        '<stop offset="0%" stop-color="' + couleur + '" stop-opacity="' + (opacite || 0.9) + '"/>' +
        '<stop offset="100%" stop-color="' + couleur + '" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + rayon + '" fill="url(#' + id + ')"/>';
}


/* Le reflet vertical d'une lumière sur l'eau : une colonne
   tremblée, faite de petits traits. */
function reflet(x, yDebut, yFin, largeur, couleur, opacite) {
    let traits = "";
    let y = yDebut;
    let i = 0;

    while (y < yFin) {
        const l = largeur * (0.35 + Math.abs(Math.sin(i * 1.7)) * 0.9);
        const o = (opacite || 0.5) * (1 - (y - yDebut) / (yFin - yDebut)) * (0.5 + Math.abs(Math.cos(i * 2.3)) * 0.7);
        traits += '<rect x="' + (x - l / 2) + '" y="' + y + '" width="' + l + '" height="1.6" ' +
            'fill="' + couleur + '" opacity="' + o.toFixed(2) + '" rx="0.8"/>';
        y += 3.4;
        i++;
    }

    return traits;
}


/* Des fenêtres allumées sur une façade. */
function fenetres(x, y, colonnes, rangees, pas, taille) {
    let dessin = "";

    for (let c = 0; c < colonnes; c++) {
        for (let r = 0; r < rangees; r++) {
            // une fenêtre sur trois est allumée (toujours la même,
            // on ne veut pas que ça scintille à chaque rendu)
            const allumee = ((c * 7 + r * 3) % 3) === 0;
            if (!allumee) continue;

            const chaud = ((c + r) % 4) === 0 ? "#FFD79A" : "#F5C87A";
            dessin += '<rect x="' + (x + c * pas) + '" y="' + (y + r * pas) + '" ' +
                'width="' + taille + '" height="' + taille * 1.3 + '" fill="' + chaud + '" ' +
                'opacity="' + (0.55 + ((c * r) % 3) * 0.14).toFixed(2) + '"/>';
        }
    }

    return dessin;
}


/* Une grue de chantier naval, en silhouette. */
function grue(x, sol, hauteur, sens) {
    const t = hauteur;
    const d = sens === "gauche" ? -1 : 1;

    return '<g stroke="#0A0F18" stroke-width="3" fill="none" opacity="0.92">' +
        '<path d="M' + x + ' ' + sol + ' L' + x + ' ' + (sol - t) + '"/>' +
        '<path d="M' + (x - 7) + ' ' + sol + ' L' + x + ' ' + (sol - t * 0.3) + ' L' + (x + 7) + ' ' + sol + '"/>' +
        '<path d="M' + (x - d * t * 0.5) + ' ' + (sol - t * 0.92) + ' L' + (x + d * t * 0.78) + ' ' + (sol - t * 0.92) + '"/>' +
        '<path d="M' + x + ' ' + (sol - t) + ' L' + (x + d * t * 0.72) + ' ' + (sol - t * 0.9) + '"/>' +
        '<path d="M' + x + ' ' + (sol - t) + ' L' + (x - d * t * 0.45) + ' ' + (sol - t * 0.9) + '"/>' +
        '<path d="M' + (x + d * t * 0.62) + ' ' + (sol - t * 0.9) + ' L' + (x + d * t * 0.62) + ' ' + (sol - t * 0.55) + '"/>' +
        "</g>" +
        '<circle cx="' + (x + d * t * 0.62) + '" cy="' + (sol - t * 0.5) + '" r="2.2" fill="#FF5A3C" opacity="0.9"/>';
}


/* Une silhouette humaine très simple, de dos. */
function silhouette(x, sol, hauteur, couleur) {
    const h = hauteur;
    const c = couleur || "#05080E";

    return '<g fill="' + c + '">' +
        '<ellipse cx="' + x + '" cy="' + (sol - h * 0.9) + '" rx="' + h * 0.11 + '" ry="' + h * 0.12 + '"/>' +
        '<path d="M' + (x - h * 0.17) + ' ' + sol + ' Q' + (x - h * 0.19) + ' ' + (sol - h * 0.62) + ' ' + x + ' ' + (sol - h * 0.78) +
        ' Q' + (x + h * 0.19) + ' ' + (sol - h * 0.62) + ' ' + (x + h * 0.17) + ' ' + sol + ' Z"/>' +
        "</g>";
}


/* ------------------------------------------------------------
   LES PEINTURES
   ------------------------------------------------------------ */
const PEINTURES = {

    /* ---------- la nuit du 8, dans le port ---------- */

    hornbrucke: {
        boite: "0 0 300 400",
        dessin: function () {
            const ciel = degrade([["0%", "#0D1522"], ["55%", "#1B2A42"], ["100%", "#0A1120"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="300" height="400" fill="url(#' + ciel.id + ')"/>' +
                brume(150, 120, 0.2) +
                // la passerelle : trois arches basses
                '<g stroke="#070B12" stroke-width="5" fill="none">' +
                '<path d="M-10 250 L310 250"/>' +
                '<path d="M20 250 Q60 212 100 250"/>' +
                '<path d="M110 250 Q150 208 190 250"/>' +
                '<path d="M200 250 Q240 214 280 250"/>' +
                "</g>" +
                // les lampes de la passerelle
                halo(60, 232, 26, "#F5C87A", 0.5) +
                halo(150, 228, 30, "#F5C87A", 0.55) +
                halo(240, 234, 26, "#F5C87A", 0.5) +
                '<circle cx="60" cy="232" r="2.6" fill="#FFEFCB"/>' +
                '<circle cx="150" cy="228" r="3" fill="#FFEFCB"/>' +
                '<circle cx="240" cy="234" r="2.6" fill="#FFEFCB"/>' +
                // la ville derrière, à peine
                '<rect x="0" y="196" width="300" height="56" fill="#0B1220" opacity="0.75"/>' +
                fenetres(14, 206, 10, 3, 27, 5) +
                // l'eau
                '<rect x="0" y="250" width="300" height="150" fill="#060A11"/>' +
                reflet(60, 252, 330, 9, "#F5C87A", 0.42) +
                reflet(150, 252, 360, 11, "#F5C87A", 0.5) +
                reflet(240, 252, 330, 9, "#F5C87A", 0.42) +
                brume(246, 40, 0.14) +
                vignette(0.6) + grain(0.17);
        },
    },

    grues: {
        boite: "0 0 300 400",
        dessin: function () {
            const ciel = degrade([["0%", "#0E1726"], ["58%", "#24364F"], ["100%", "#0A1018"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="300" height="400" fill="url(#' + ciel.id + ')"/>' +
                brume(180, 130, 0.17) +
                grue(60, 270, 120, "droite") +
                grue(150, 272, 150, "droite") +
                grue(245, 268, 100, "gauche") +
                '<rect x="0" y="268" width="300" height="14" fill="#070B12"/>' +
                '<rect x="0" y="282" width="300" height="118" fill="#05080E"/>' +
                reflet(150, 284, 380, 7, "#9FB4D0", 0.2) +
                halo(285, 258, 34, "#F5C87A", 0.35) +
                vignette(0.62) + grain(0.19);
        },
    },

    quai_nuit: {
        boite: "0 0 300 400",
        dessin: function () {
            const ciel = degrade([["0%", "#0B1220"], ["70%", "#16233A"], ["100%", "#0C1526"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="300" height="400" fill="url(#' + ciel.id + ')"/>' +
                // un lampadaire, très haut, légèrement de biais
                '<path d="M250 400 L250 120 Q250 104 234 104 L206 104" stroke="#070B12" stroke-width="5" fill="none"/>' +
                halo(206, 106, 72, "#F5C87A", 0.6) +
                '<ellipse cx="206" cy="106" rx="7" ry="4" fill="#FFF3D6"/>' +
                brume(90, 150, 0.2) +
                // le sol mouillé
                '<rect x="0" y="300" width="300" height="100" fill="#0A111C"/>' +
                '<rect x="0" y="300" width="300" height="100" fill="#1B2B45" opacity="0.5"/>' +
                reflet(206, 302, 398, 22, "#F5C87A", 0.4) +
                // une bitte d'amarrage
                '<path d="M40 300 L40 274 Q40 266 50 266 Q60 266 60 274 L60 300 Z" fill="#05080E"/>' +
                vignette(0.58) + grain(0.2);
        },
    },

    ferry: {
        boite: "0 0 400 300",
        dessin: function () {
            const ciel = degrade([["0%", "#0A1120"], ["74%", "#1A2B45"], ["100%", "#060A12"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="400" height="300" fill="url(#' + ciel.id + ')"/>' +
                brume(120, 90, 0.18) +
                // le ferry : une masse sombre percée de hublots
                '<path d="M120 196 L300 196 L292 216 L128 216 Z" fill="#070C15"/>' +
                '<rect x="150" y="176" width="120" height="20" fill="#0A1020"/>' +
                '<rect x="196" y="160" width="44" height="18" fill="#0A1020"/>' +
                fenetres(158, 181, 10, 1, 11, 5) +
                fenetres(202, 164, 4, 1, 10, 4) +
                halo(130, 196, 20, "#FF5A3C", 0.5) +
                halo(296, 196, 20, "#58D68D", 0.45) +
                '<rect x="0" y="216" width="400" height="84" fill="#05080E"/>' +
                reflet(210, 218, 298, 46, "#F5C87A", 0.3) +
                reflet(130, 218, 270, 10, "#FF5A3C", 0.3) +
                vignette(0.55) + grain(0.18);
        },
    },

    lampadaire_brume: {
        boite: "0 0 300 400",
        dessin: function () {
            const fond = degrade([["0%", "#121C2C"], ["100%", "#0A1320"]]);

            return "<defs>" + fond.def + "</defs>" +
                '<rect width="300" height="400" fill="url(#' + fond.id + ')"/>' +
                halo(150, 150, 130, "#F5C87A", 0.5) +
                '<path d="M150 400 L150 160" stroke="#070B12" stroke-width="7"/>' +
                '<ellipse cx="150" cy="152" rx="13" ry="9" fill="#FFF0CF"/>' +
                brume(100, 230, 0.26) +
                vignette(0.6) + grain(0.22);
        },
    },

    kiosque: {
        boite: "0 0 400 300",
        dessin: function () {
            return '<rect width="400" height="300" fill="#0A1018"/>' +
                '<rect x="60" y="120" width="280" height="130" fill="#101823"/>' +
                '<rect x="80" y="146" width="112" height="76" fill="#F5C87A" opacity="0.82"/>' +
                '<rect x="208" y="146" width="112" height="76" fill="#F5C87A" opacity="0.7"/>' +
                '<rect x="80" y="146" width="112" height="76" fill="none" stroke="#0A1018" stroke-width="4"/>' +
                '<rect x="208" y="146" width="112" height="76" fill="none" stroke="#0A1018" stroke-width="4"/>' +
                // l'enseigne au néon
                '<rect x="130" y="96" width="140" height="22" rx="4" fill="#12202E"/>' +
                '<text x="200" y="112" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" ' +
                'fill="#6FE7D6" text-anchor="middle" letter-spacing="2">KIOSK 24</text>' +
                halo(200, 107, 70, "#6FE7D6", 0.3) +
                '<rect x="0" y="250" width="400" height="50" fill="#070C14"/>' +
                reflet(136, 252, 298, 40, "#F5C87A", 0.26) +
                vignette(0.5) + grain(0.17);
        },
    },

    appartement_nuit: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#080C14"/>' +
                '<rect x="40" y="70" width="220" height="250" fill="#0E1623"/>' +
                '<rect x="60" y="96" width="78" height="100" fill="#F0C07E" opacity="0.8"/>' +
                '<rect x="162" y="96" width="78" height="100" fill="#2A3A52" opacity="0.6"/>' +
                '<rect x="60" y="216" width="78" height="80" fill="#2A3A52" opacity="0.45"/>' +
                '<rect x="162" y="216" width="78" height="80" fill="#F0C07E" opacity="0.35"/>' +
                '<path d="M99 96 L99 196 M60 146 L138 146" stroke="#0E1623" stroke-width="5"/>' +
                // une plante sur le rebord, en contre-jour
                '<path d="M112 196 L112 176 M112 180 Q104 170 98 172 M112 182 Q122 172 128 176" ' +
                'stroke="#09101A" stroke-width="3" fill="none"/>' +
                halo(99, 146, 86, "#F5C87A", 0.3) +
                vignette(0.6) + grain(0.18);
        },
    },

    noir_presque: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#03050A"/>' +
                halo(236, 316, 60, "#2C4766", 0.5) +
                '<path d="M0 340 Q80 330 150 344 Q230 358 300 346 L300 400 L0 400 Z" fill="#02040A"/>' +
                grain(0.3);
        },
    },


    /* ---------- le 3 juillet, à Bülk ---------- */

    phare_bulk: {
        boite: "0 0 300 400",
        dessin: function () {
            const ciel = degrade([["0%", "#27405E"], ["42%", "#6E7FA0"], ["72%", "#D6A587"], ["100%", "#F0C79C"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="300" height="400" fill="url(#' + ciel.id + ')"/>' +
                // le faisceau, large et doux
                '<path d="M196 150 L300 96 L300 206 Z" fill="#FFE9B0" opacity="0.2"/>' +
                '<path d="M196 150 L0 118 L0 196 Z" fill="#FFE9B0" opacity="0.12"/>' +
                // la tour
                '<path d="M178 300 L186 152 L208 152 L216 300 Z" fill="#F4F1EA"/>' +
                '<rect x="182" y="196" width="30" height="26" fill="#C9433A"/>' +
                '<rect x="184" y="140" width="24" height="14" fill="#2B3440"/>' +
                '<rect x="186" y="128" width="20" height="12" fill="#FFE9B0"/>' +
                halo(196, 134, 46, "#FFE9B0", 0.75) +
                '<path d="M180 300 L214 300 L218 312 L176 312 Z" fill="#E7E2D8"/>' +
                // la dune
                '<path d="M0 306 Q70 288 150 300 Q230 312 300 302 L300 400 L0 400 Z" fill="#8E8A6C"/>' +
                '<path d="M0 330 Q90 316 170 328 Q240 338 300 330 L300 400 L0 400 Z" fill="#6F6E54"/>' +
                // les herbes
                '<g stroke="#5A5C40" stroke-width="2" fill="none" opacity="0.8">' +
                '<path d="M24 400 Q20 372 12 360"/><path d="M40 400 Q42 374 52 362"/>' +
                '<path d="M66 400 Q60 376 54 366"/><path d="M250 400 Q256 372 266 360"/>' +
                '<path d="M276 400 Q270 374 262 364"/>' +
                "</g>" +
                vignette(0.32) + grain(0.1);
        },
    },

    porte_bleue: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#B9AE97"/>' +
                // les planches du bardage
                '<g stroke="#A79C84" stroke-width="2">' +
                '<path d="M0 40 L300 40 M0 90 L300 90 M0 330 L300 330 M0 380 L300 380"/>' +
                "</g>" +
                // la porte
                '<rect x="62" y="56" width="176" height="300" fill="#2F6E8F"/>' +
                '<rect x="62" y="56" width="176" height="300" fill="none" stroke="#24536B" stroke-width="6"/>' +
                '<g fill="none" stroke="#24536B" stroke-width="4">' +
                '<rect x="82" y="80" width="136" height="104"/>' +
                '<rect x="82" y="206" width="136" height="126"/>' +
                "</g>" +
                // la peinture écaillée
                '<g fill="#8C9A96" opacity="0.5">' +
                '<path d="M96 300 q10 -8 18 2 q-8 10 -18 -2 Z"/>' +
                '<path d="M190 120 q8 -6 14 2 q-6 8 -14 -2 Z"/>' +
                '<path d="M120 338 q14 -5 20 3 q-10 7 -20 -3 Z"/>' +
                "</g>" +
                // la poignée et la serrure
                '<circle cx="212" cy="212" r="7" fill="#C9A876"/>' +
                '<rect x="206" y="226" width="12" height="16" rx="2" fill="#B2905F"/>' +
                // le numéro, gravé : un détail qu'on peut zoomer
                '<rect x="128" y="36" width="44" height="18" rx="2" fill="#24536B"/>' +
                '<text x="150" y="50" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" ' +
                'fill="#F4F1EA" text-anchor="middle" letter-spacing="1">BÜLK 3</text>' +
                vignette(0.3) + grain(0.11);
        },
    },

    cle_pierres: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#6E6A57"/>' +
                // les pierres
                '<g>' +
                '<ellipse cx="70" cy="300" rx="58" ry="40" fill="#8B8673"/>' +
                '<ellipse cx="172" cy="330" rx="66" ry="44" fill="#948F7B"/>' +
                '<ellipse cx="256" cy="286" rx="52" ry="36" fill="#7E7A68"/>' +
                '<ellipse cx="120" cy="238" rx="48" ry="30" fill="#817D6B"/>' +
                "</g>" +
                // la main, en haut, à contre-jour
                '<path d="M60 0 L60 120 Q84 150 120 152 Q160 154 176 132 L186 92 L200 100 L196 40 L172 0 Z" fill="#C79E86"/>' +
                '<path d="M176 132 Q188 120 186 92" stroke="#B08A72" stroke-width="3" fill="none"/>' +
                // la clé, tenue entre deux doigts
                '<g transform="rotate(16 150 190)">' +
                '<circle cx="150" cy="168" r="13" fill="none" stroke="#C9A876" stroke-width="6"/>' +
                '<path d="M150 182 L150 228" stroke="#C9A876" stroke-width="6"/>' +
                '<path d="M150 212 L164 212 M150 222 L162 222" stroke="#C9A876" stroke-width="6"/>' +
                "</g>" +
                vignette(0.36) + grain(0.12);
        },
    },

    /* Un double de clés posé sur la table de la cuisine, avec un
       mot plié à côté. Rien de violent, aucune menace : un
       cadeau. C'est l'objet le plus effrayant du jeu. */
    double_cle: {
        boite: "0 0 300 400",
        dessin: function () {
            const bois = degrade([["0%", "#8A6A4A"], ["100%", "#6E5238"]]);

            return "<defs>" + bois.def + "</defs>" +
                '<rect width="300" height="400" fill="url(#' + bois.id + ')"/>' +
                // les veines du bois
                '<g stroke="#5E452F" stroke-width="2" opacity="0.5">' +
                '<path d="M0 90 Q150 80 300 96 M0 190 Q150 202 300 186 M0 300 Q150 288 300 304"/>' +
                "</g>" +
                halo(150, 120, 190, "#FFE2A8", 0.22) +
                // le mot plié
                '<g transform="rotate(-4 150 290)">' +
                '<rect x="62" y="248" width="176" height="96" rx="2" fill="#F6F1E6"/>' +
                '<rect x="62" y="248" width="176" height="96" rx="2" fill="none" stroke="#DED6C4" stroke-width="2"/>' +
                '<path d="M62 296 L238 296" stroke="#E4DCCB" stroke-width="2"/>' +
                '<text x="150" y="276" font-family="Caveat, cursive" font-size="21" fill="#5A5048" text-anchor="middle">' +
                "je t'en ai fait un double</text>" +
                '<text x="150" y="322" font-family="Caveat, cursive" font-size="21" fill="#5A5048" text-anchor="middle">' +
                "au cas où. T.</text>" +
                "</g>" +
                // la clé, neuve, posée dessus
                '<g transform="rotate(24 150 180)">' +
                '<circle cx="150" cy="140" r="22" fill="none" stroke="#C8B48A" stroke-width="9"/>' +
                '<circle cx="150" cy="140" r="8" fill="#6E5238"/>' +
                '<path d="M150 162 L150 232" stroke="#C8B48A" stroke-width="10"/>' +
                '<path d="M150 206 L170 206 M150 220 L166 220" stroke="#C8B48A" stroke-width="9"/>' +
                "</g>" +
                vignette(0.4) + grain(0.12);
        },
    },

    fjord_juillet: {
        boite: "0 0 400 300",
        dessin: function () {
            const ciel = degrade([["0%", "#8DB6DC"], ["70%", "#CFE0EC"], ["100%", "#E6EDF2"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="400" height="300" fill="url(#' + ciel.id + ')"/>' +
                '<g fill="#F7F9FA" opacity="0.85">' +
                '<ellipse cx="90" cy="64" rx="46" ry="18"/><ellipse cx="130" cy="58" rx="34" ry="14"/>' +
                '<ellipse cx="300" cy="46" rx="54" ry="16"/>' +
                "</g>" +
                '<rect x="0" y="162" width="400" height="6" fill="#7E99B4" opacity="0.5"/>' +
                '<rect x="0" y="168" width="400" height="132" fill="#4E7FA6"/>' +
                '<g stroke="#6FA0C4" stroke-width="2" opacity="0.6">' +
                '<path d="M0 196 L400 196 M0 214 L400 214 M0 236 L400 236 M0 262 L400 262"/>' +
                "</g>" +
                // deux voiles au loin
                '<path d="M292 162 L292 134 L310 162 Z" fill="#FBFCFD"/>' +
                '<path d="M330 162 L330 144 L342 162 Z" fill="#FBFCFD" opacity="0.8"/>' +
                vignette(0.22) + grain(0.08);
        },
    },

    velo_bleu: {
        boite: "0 0 400 300",
        dessin: function () {
            return '<rect width="400" height="300" fill="#C6BFB0"/>' +
                '<rect x="0" y="0" width="400" height="212" fill="#CFC8B9"/>' +
                '<g stroke="#B8B1A2" stroke-width="2"><path d="M0 60 L400 60 M0 130 L400 130"/></g>' +
                '<rect x="0" y="212" width="400" height="88" fill="#8E897C"/>' +
                // le vélo
                '<g stroke="#2F6E8F" stroke-width="7" fill="none">' +
                '<circle cx="124" cy="216" r="46"/><circle cx="286" cy="216" r="46"/>' +
                '<path d="M124 216 L186 216 L222 150 L258 216"/>' +
                '<path d="M186 216 L214 150 L250 150"/>' +
                '<path d="M222 150 L286 216"/>' +
                "</g>" +
                '<path d="M200 142 L232 142" stroke="#1C1A17" stroke-width="8"/>' +
                '<path d="M252 142 L272 134" stroke="#1C1A17" stroke-width="8"/>' +
                // le panier
                '<rect x="246" y="118" width="40" height="28" rx="4" fill="none" stroke="#C9A876" stroke-width="5"/>' +
                vignette(0.28) + grain(0.1);
        },
    },


    /* ---------- les gens, les choses ---------- */

    chat_fenetre: {
        boite: "0 0 300 400",
        dessin: function () {
            const ciel = degrade([["0%", "#A8C2D8"], ["100%", "#DCE5EB"]]);

            return "<defs>" + ciel.def + "</defs>" +
                '<rect width="300" height="400" fill="#2A2420"/>' +
                '<rect x="30" y="40" width="240" height="250" fill="url(#' + ciel.id + ')"/>' +
                '<path d="M30 230 Q150 214 270 232 L270 290 L30 290 Z" fill="#6E8CA8" opacity="0.8"/>' +
                '<path d="M150 40 L150 290 M30 164 L270 164" stroke="#2A2420" stroke-width="9"/>' +
                '<rect x="20" y="286" width="260" height="22" fill="#3A322C"/>' +
                // le chat, assis de dos sur le rebord
                '<g fill="#C96A2E">' +
                '<path d="M118 286 Q112 230 134 214 Q150 202 168 214 Q188 228 182 286 Z"/>' +
                '<path d="M134 216 L128 192 L146 206 Z"/>' +
                '<path d="M166 216 L174 192 L156 206 Z"/>' +
                '<path d="M182 286 Q206 282 214 252 Q216 240 206 240 Q200 240 202 252 Q196 274 180 274 Z"/>' +
                "</g>" +
                '<g fill="#E08B4C" opacity="0.75">' +
                '<path d="M126 262 q22 -6 42 0 q-20 8 -42 0 Z"/>' +
                '<path d="M130 240 q20 -5 38 0 q-18 7 -38 0 Z"/>' +
                "</g>" +
                vignette(0.3) + grain(0.1);
        },
    },

    deux_filles: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#17131B"/>' +
                halo(220, 90, 120, "#F5C87A", 0.42) +
                '<rect x="0" y="300" width="300" height="100" fill="#2A211C"/>' +
                // deux tasses
                '<g fill="#E8DCCB"><rect x="58" y="282" width="34" height="24" rx="4"/>' +
                '<rect x="206" y="284" width="32" height="22" rx="4"/></g>' +
                // les deux silhouettes, épaule contre épaule
                silhouette(110, 300, 190, "#0B0A10") +
                silhouette(186, 300, 178, "#100D14") +
                // un rire : juste une mèche de cheveux qui dépasse
                '<path d="M196 150 Q214 164 208 192" stroke="#241B20" stroke-width="7" fill="none"/>' +
                vignette(0.5) + grain(0.16);
        },
    },

    fleurs_porte: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#4A4540"/>' +
                '<rect x="0" y="0" width="300" height="190" fill="#5A544D"/>' +
                '<rect x="0" y="190" width="300" height="60" fill="#6B645B"/>' +
                // le paillasson
                '<rect x="40" y="250" width="220" height="110" rx="6" fill="#3A342C"/>' +
                '<g stroke="#4A4336" stroke-width="3">' +
                '<path d="M40 272 L260 272 M40 296 L260 296 M40 320 L260 320 M40 344 L260 344"/>' +
                "</g>" +
                // le bouquet, posé en travers
                '<g transform="rotate(-12 150 270)">' +
                '<path d="M120 300 L180 240" stroke="#5C6B3E" stroke-width="7"/>' +
                '<path d="M132 302 L186 254" stroke="#5C6B3E" stroke-width="6"/>' +
                '<g fill="#C9495F">' +
                '<circle cx="186" cy="238" r="16"/><circle cx="206" cy="252" r="13"/>' +
                '<circle cx="172" cy="222" r="12"/><circle cx="196" cy="220" r="11"/>' +
                "</g>" +
                '<g fill="#E07288" opacity="0.8">' +
                '<circle cx="190" cy="234" r="7"/><circle cx="204" cy="250" r="5"/>' +
                "</g>" +
                '<rect x="140" y="286" width="36" height="24" rx="2" fill="#F4F1EA" transform="rotate(8 158 298)"/>' +
                "</g>" +
                vignette(0.4) + grain(0.13);
        },
    },

    peluches: {
        boite: "0 0 400 300",
        dessin: function () {
            return '<rect width="400" height="300" fill="#2A2230"/>' +
                halo(330, 70, 110, "#F5C87A", 0.35) +
                // le lit
                '<rect x="0" y="150" width="400" height="150" fill="#E8DFEA"/>' +
                '<rect x="0" y="150" width="400" height="18" fill="#D8CCDC"/>' +
                '<rect x="20" y="104" width="130" height="58" rx="12" fill="#F2EAF2"/>' +
                // Bob, bleu, au milieu
                '<g><ellipse cx="170" cy="206" rx="40" ry="44" fill="#4C84C4"/>' +
                '<circle cx="146" cy="170" r="13" fill="#4C84C4"/><circle cx="194" cy="170" r="13" fill="#4C84C4"/>' +
                '<circle cx="158" cy="198" r="5" fill="#15202F"/><circle cx="182" cy="198" r="5" fill="#15202F"/>' +
                '<path d="M160 218 Q170 228 180 218" stroke="#15202F" stroke-width="3" fill="none"/></g>' +
                // une peluche rose, à droite
                '<g><ellipse cx="258" cy="216" rx="32" ry="34" fill="#E79CB4"/>' +
                '<circle cx="240" cy="188" r="11" fill="#E79CB4"/><circle cx="276" cy="188" r="11" fill="#E79CB4"/>' +
                '<circle cx="249" cy="210" r="4" fill="#4A2733"/><circle cx="267" cy="210" r="4" fill="#4A2733"/></g>' +
                // une jaune, derrière
                '<g><ellipse cx="320" cy="222" rx="26" ry="28" fill="#F0CE72"/>' +
                '<circle cx="334" cy="202" r="9" fill="#F0CE72"/>' +
                '<circle cx="313" cy="218" r="3.5" fill="#4A3A1A"/><circle cx="328" cy="218" r="3.5" fill="#4A3A1A"/></g>' +
                vignette(0.34) + grain(0.11);
        },
    },

    argentique_fin: {
        boite: "0 0 400 300",
        dessin: function () {
            const ciel = degrade([["0%", "#C9D6DE"], ["100%", "#E9EDEE"]]);

            return "<defs>" + ciel.def + "</defs>" +
                // l'intérieur sombre de la cabane
                '<rect width="400" height="300" fill="#231E1A"/>' +
                // la porte ouverte : le cadre de lumière
                '<rect x="96" y="40" width="200" height="240" fill="url(#' + ciel.id + ')"/>' +
                '<rect x="96" y="196" width="200" height="84" fill="#5E86A6"/>' +
                '<path d="M96 196 L296 196" stroke="#8CA8BE" stroke-width="3"/>' +
                '<rect x="96" y="40" width="200" height="240" fill="none" stroke="#2F6E8F" stroke-width="10"/>' +
                // le chat assis dans l'embrasure, de dos
                '<g fill="#B35F28">' +
                '<path d="M196 280 Q190 232 210 218 Q224 208 240 218 Q258 230 252 280 Z"/>' +
                '<path d="M210 220 L204 198 L220 212 Z"/><path d="M238 220 L246 198 L230 212 Z"/>' +
                "</g>" +
                // les bords d'un négatif scanné
                '<rect x="0" y="0" width="400" height="10" fill="#141210"/>' +
                '<rect x="0" y="290" width="400" height="10" fill="#141210"/>' +
                vignette(0.3) + grain(0.16);
        },
    },

    /* une image de secours, si on appelle une clef qui n'existe pas */
    manquante: {
        boite: "0 0 300 400",
        dessin: function () {
            return '<rect width="300" height="400" fill="#1A2030"/>' +
                '<text x="150" y="196" font-family="-apple-system, sans-serif" font-size="15" ' +
                'fill="#5F6878" text-anchor="middle">image manquante</text>';
        },
    },
};


/* ------------------------------------------------------------
   peindre(clef, options)
   ------------------------------------------------------------
   Renvoie un élément prêt à insérer.

   options.recadre : true pour remplir son cadre en coupant ce
                     qui dépasse (vignettes carrées), false pour
                     voir la photo entière (visionneuse).
   ------------------------------------------------------------ */
function peindre(clef, options) {
    const o = options || {};
    const p = PEINTURES[clef] || PEINTURES.manquante;

    const ratio = o.recadre ? "xMidYMid slice" : "xMidYMid meet";

    // detail: true -> grain et flou. Réservé aux écrans qui
    // n'affichent qu'une seule image (voir le mode léger).
    PEINTURE_DETAILLEE = !!o.detail;

    const svg = '<svg viewBox="' + p.boite + '" preserveAspectRatio="' + ratio + '" ' +
        'width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        p.dessin() + "</svg>";

    PEINTURE_DETAILLEE = false;

    return el("div", { classe: "photo-peinte", html: svg });
}
