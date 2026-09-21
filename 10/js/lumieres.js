/* ============================================================
   LA NUIT — l'ambiance et les lumières
   ============================================================
   Il est 2 h 14. L'appartement ne peut pas être éclairé comme en
   plein jour : il est dans le noir, sauf là où quelque chose
   éclaire vraiment, chez Klara, cette nuit-là.

     - la VEILLEUSE JAUNE de Klara, sur la table de nuit (c'est
       aussi la lumière de l'acte II — le phare) ;
     - la LUNE, qui tombe par les fenêtres ;
     - l'ÉCRAN DU BUREAU, resté allumé sur le billet d'avion ;
     - un filet de lumière SOUS LA PORTE D'ENTRÉE (la cage
       d'escalier) ;
     - le FRIGO, quand on l'ouvre (animes.js).

   ------------------------------------------------------------
   COMMENT ÇA MARCHE (et pourquoi c'est léger)

   Tout le noir est UNE seule image, calculée une fois au
   chargement sur un <canvas> : un voile bleu nuit, dans lequel
   on « perce » des trous dégradés là où il y a une lumière, puis
   on teinte ces trous de la couleur de la lumière. Le jeu n'a
   ensuite qu'une image à poser par-dessus le décor : aucun calcul
   par image, rien de lourd pour un téléphone.

   Seule la lumière du frigo bouge : c'est un halo à part, dont
   l'opacité suit l'ouverture de sa porte. Et à l'acte II, la
   veilleuse déménage : trois voiles tout prêts (NUITS), et un
   halo pour le phare.

   ------------------------------------------------------------
   RÉGLER

     OPACITE_NUIT (config.js)   plus haut = plus sombre
     LUMIERES_STUDIO            une ligne par lumière, en cases
   ============================================================ */


// Chaque lumière : sa position (en cases, au centre de la tache),
// son rayon (en cases), l'allongement vertical (la lune tombe en
// biais depuis la fenêtre), la part de noir qu'elle efface (0 à 1),
// et sa teinte.
const LUMIERES_STUDIO = [
    // la veilleuse jaune, sur la table de nuit (T en 1,4)
    { x: 1.6, y: 4.4, rayon: 3.2, etire: 1, efface: 0.95, couleur: [255, 196, 96], teinte: 0.32 },

    // la lune, sous chacune des trois fenêtres du salon…
    { x: 5.5, y: 2.2, rayon: 2.4, etire: 1.7, efface: 0.55, couleur: [170, 192, 255], teinte: 0.12 },
    { x: 9.5, y: 2.2, rayon: 2.4, etire: 1.7, efface: 0.55, couleur: [170, 192, 255], teinte: 0.12 },
    { x: 13.5, y: 2.2, rayon: 2.4, etire: 1.7, efface: 0.55, couleur: [170, 192, 255], teinte: 0.12 },
    // … et sous celle de la cuisine
    { x: 23, y: 2.2, rayon: 2.6, etire: 1.7, efface: 0.55, couleur: [170, 192, 255], teinte: 0.12 },

    // l'écran du bureau, resté allumé
    { x: 10, y: 1.6, rayon: 2, etire: 1, efface: 0.6, couleur: [120, 170, 255], teinte: 0.22 },

    // le filet de lumière sous la porte d'entrée
    { x: 23, y: 16, rayon: 1.6, etire: 0.5, efface: 0.6, couleur: [255, 186, 120], teinte: 0.25 },
];


/* ------------------------------------------------------------
   Le voile, dessiné une fois, au chargement du jeu.
   ------------------------------------------------------------
   Une case de plus en haut : la caméra montre une tuile au-dessus
   de la pièce (le haut des murs, voir suivreAvecLaCamera).
   ------------------------------------------------------------ */
const NUIT_MARGE_HAUT = TAILLE_TUILE;

function dessinerLeVoileDeNuit(piece, lumieres) {

    const largeur = piece.plan[0].length * TAILLE_TUILE;
    const hauteur = piece.plan.length * TAILLE_TUILE + NUIT_MARGE_HAUT;

    const toile = document.createElement("canvas");
    toile.width = largeur;
    toile.height = hauteur;
    const ctx = toile.getContext("2d");

    // 1. le noir, partout
    const n = COULEUR_NUIT_VOILE;
    ctx.fillStyle = "rgba(" + n[0] + "," + n[1] + "," + n[2] + "," + OPACITE_NUIT + ")";
    ctx.fillRect(0, 0, largeur, hauteur);

    lumieres.forEach(function (l) {
        const cx = l.x * TAILLE_TUILE;
        const cy = l.y * TAILLE_TUILE + NUIT_MARGE_HAUT;
        const r = l.rayon * TAILLE_TUILE;

        // On dessine dans un repère étiré verticalement : un cercle
        // y devient une tache allongée, comme la lune qui tombe.
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, l.etire);

        // 2. on efface le noir, du centre vers le bord
        ctx.globalCompositeOperation = "destination-out";
        let g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, "rgba(0,0,0," + l.efface + ")");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(-r, -r, 2 * r, 2 * r);

        // 3. on teinte la tache de la couleur de la lumière
        ctx.globalCompositeOperation = "source-over";
        const c = l.couleur;
        g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + l.teinte + ")");
        g.addColorStop(1, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(-r, -r, 2 * r, 2 * r);

        ctx.restore();
    });

    return toile;
}


// Un halo seul (pour les lumières qui bougent), blanc chaud.
function dessinerUnHalo(rayon, couleur) {
    const toile = document.createElement("canvas");
    toile.width = toile.height = rayon * 2;
    const ctx = toile.getContext("2d");
    const g = ctx.createRadialGradient(rayon, rayon, 0, rayon, rayon, rayon);
    g.addColorStop(0, "rgba(" + couleur.join(",") + ",1)");
    g.addColorStop(1, "rgba(" + couleur.join(",") + ",0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rayon * 2, rayon * 2);
    return toile;
}


/* ------------------------------------------------------------
   Les trois nuits de l'acte II
   ------------------------------------------------------------
   La veilleuse est une lumière qui DÉMÉNAGE : sur la table de nuit
   (tout l'acte I), débranchée dans les pattes de Bob (le studio
   tombe dans le bleu), puis sur le rebord de la fenêtre, allumée
   comme un phare. Trois voiles, calculés une fois chacun, et on
   passe de l'un à l'autre (changerDeNuit).
   ------------------------------------------------------------ */
const LUMIERE_PHARE = {
    x: 5.5, y: 1.1, rayon: 4, etire: 1.15, efface: 0.97, couleur: [255, 196, 96], teinte: 0.36,
};

const NUITS = {
    nuit_studio: LUMIERES_STUDIO,
    nuit_sans_veilleuse: LUMIERES_STUDIO.slice(1),
    nuit_phare: [LUMIERE_PHARE].concat(LUMIERES_STUDIO.slice(1)),
};


// Chargées AVANT le lancement : kaplay attend toutes les images
// avant de démarrer la scène, les voiles sont donc prêts à temps.
Object.keys(NUITS).forEach(function (nom) {
    loadSprite(nom, dessinerLeVoileDeNuit(PIECES.studio, NUITS[nom]));
});
loadSprite("halo_frigo", dessinerUnHalo(3 * TAILLE_TUILE, [255, 244, 214]));
loadSprite("halo_phare", dessinerUnHalo(2 * TAILLE_TUILE, [255, 214, 130]));


/* ------------------------------------------------------------
   allumerLaNuit() — appelée par la scène, après les meubles.
   ------------------------------------------------------------ */
const voile = { actuel: null };

function allumerLaNuit() {

    voile.actuel = add([
        sprite("nuit_studio"),
        pos(0, -NUIT_MARGE_HAUT),
        z(Z_NUIT),
        opacity(1),
        { nomDeNuit: "nuit_studio", fondu: null },
    ]);

    // Une scène neuve : l'ancien phare a disparu avec l'ancienne scène.
    phare.lampe = null;
    phare.halo = null;
    phare.allume = false;

    // La lumière du frigo : posée devant sa porte, éteinte tant
    // qu'il est fermé. Son intensité suit l'image de la porte
    // (0 = fermé, 5 = grand ouvert).
    const frigo = typeof animes !== "undefined" ? animes.frigo : null;
    if (!frigo) return;

    const halo = add([
        sprite("halo_frigo"),
        pos(frigo.pos.x + 1.5 * TAILLE_TUILE, frigo.pos.y - 0.5 * TAILLE_TUILE),
        anchor("center"),
        opacity(0),
        z(Z_NUIT + 1),
    ]);

    halo.onUpdate(function () {
        halo.opacity = 0.45 * Math.min(1, frigo.frame / 5);
    });
}


/* ------------------------------------------------------------
   changerDeNuit(nom, duree) — passer d'un voile à un autre
   ------------------------------------------------------------
   duree = 0 : d'un coup (une prise qu'on débranche).
   Sinon, un fondu : l'ancien voile s'efface pendant que le
   nouveau apparaît.
   ------------------------------------------------------------ */
function changerDeNuit(nom, duree) {

    const ancienne = voile.actuel;
    if (ancienne && ancienne.nomDeNuit === nom) return;

    const nouvelle = add([
        sprite(nom),
        pos(0, -NUIT_MARGE_HAUT),
        z(Z_NUIT),
        opacity(duree ? 0 : 1),
        { nomDeNuit: nom, fondu: null },
    ]);
    voile.actuel = nouvelle;

    if (!ancienne) return;

    // Un changement en plein fondu : on arrête l'ancien fondu là où
    // il en est, et c'est de là que repart le nouveau.
    if (ancienne.fondu) ancienne.fondu.cancel();

    if (!duree) {
        destroy(ancienne);
        return;
    }

    const debut = time();
    const depart = ancienne.opacity;
    nouvelle.fondu = onUpdate(function () {
        const k = Math.min(1, (time() - debut) / duree);
        nouvelle.opacity = k;
        ancienne.opacity = depart * (1 - k);
        if (k >= 1) {
            nouvelle.fondu.cancel();
            nouvelle.fondu = null;
            destroy(ancienne);
        }
    });
}


/* ------------------------------------------------------------
   Le phare : la veilleuse sur le rebord de la fenêtre de gauche
   ------------------------------------------------------------
   La lampe elle-même (l'icône d'Evan, en petit) et un halo qui
   respire doucement, tous deux AU-DESSUS du voile : c'est une
   lumière, elle ne doit pas être dans le noir.
   allume = false : posée mais pas encore branchée.
   ------------------------------------------------------------ */
const phare = { lampe: null, halo: null, allume: false, depuis: 0 };

function poserLePhare(allume) {

    const x = LUMIERE_PHARE.x * TAILLE_TUILE;
    const y = TAILLE_TUILE - 2;

    if (!phare.lampe) {
        phare.lampe = add([
            sprite("icones_objets", { frame: ICONES_OBJETS.veilleuse }),
            pos(x, y),
            anchor("bot"),
            scale(16 / TAILLE_CASE_ICONE),
            z(Z_NUIT + 2),
        ]);

        phare.halo = add([
            sprite("halo_phare"),
            pos(x, y - 6),
            anchor("center"),
            opacity(0),
            z(Z_NUIT + 1),
        ]);

        phare.halo.onUpdate(function () {
            if (!phare.allume) { phare.halo.opacity = 0; return; }
            const k = Math.min(1, (time() - phare.depuis) / 1.5);
            phare.halo.opacity = k * (0.5 + 0.1 * Math.sin(time() * 2.2));
        });
    }

    if (allume && !phare.allume) {
        phare.allume = true;
        phare.depuis = time();
    }
}
