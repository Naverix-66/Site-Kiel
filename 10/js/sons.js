/* ============================================================
   LES SONS
   ============================================================
   Les fichiers d'Evan sont dans assets/sounds. Beaucoup sont des
   « planches » de sons : un fichier de 20 secondes qui contient
   70 bruits de pas, un sifflet de fête répété dix fois, le frigo
   qui s'ouvre ET se referme. Plutôt que de les redécouper, on joue
   directement le bon MORCEAU (début, durée), mesuré une fois pour
   toutes (voir les nombres dans SONS).

   On passe par l'audio du navigateur (Web Audio) plutôt que par
   kaplay : c'est lui qui sait jouer un morceau précis d'un fichier,
   changer la hauteur d'un son, et faire des fondus.

   ------------------------------------------------------------
   CE QUI JOUE

   en continu   l'ambiance de nuit, la musique (Keys Left By The
                Door), le vent qui entre par la fenêtre ouverte —
                d'autant plus fort que Bob en est près
   au hasard    une mouette, au loin, de temps en temps
   Bob          ses pas feutrés, son atterrissage (ouverture)
   dialogues    un babillage pendant que le texte s'écrit, plus
                aigu pour Bluey, plus grave pour Samsam ; un clic
                pour passer à la réplique suivante
   objets       un « pop » quand Bob ramasse quelque chose
   meubles      la porte de la salle de bain, la porte d'entrée
                fermée à clé, le frigo (et son ronron)
   moments      le sifflet de Cakey, le couinement de Moin, une
                note douce sur les révélations, la mouette de Sylt

   ------------------------------------------------------------
   LE TÉLÉPHONE

   Un navigateur ne joue AUCUN son avant que le joueur ait touché
   l'écran. Tout démarre donc au premier toucher (ou à la première
   touche) — l'ouverture en demande un de toute façon.

   Bouton ♪ en bas à droite (ou touche M) : couper / remettre le
   son. Le choix est retenu d'une partie à l'autre.
   ============================================================ */


// debut, duree : le morceau à jouer, en secondes. morceaux : une
// liste de [debut, duree] parmi lesquels on pioche au hasard.
// debut / fin sur une boucle : la partie qui tourne.
const SONS = {
    clic:           { fichier: "click_text.mp3", debut: 0.14, duree: 0.2, volume: 0.45 },
    babillage:      { fichier: "blip_text.mp3", volume: 0.16 },
    pop:            { fichier: "pop_gettingItem.mp3", debut: 0.15, duree: 0.45, volume: 0.6 },
    atterrissage:   { fichier: "atterissage_bob.mp3", debut: 0.1, duree: 0.5, volume: 0.7 },
    pas:            { fichier: "plush_footsteps2.m4a", volume: 0.3,
                      morceaux: [[0.6, 0.12], [0.9, 0.1], [1.14, 0.1], [1.4, 0.1], [1.66, 0.1], [1.84, 0.14]] },

    porteOuvre:     { fichier: "openning_door.mp3", debut: 0.25, duree: 0.7, volume: 0.45 },
    porteFerme:     { fichier: "closed_door.mp3", debut: 0, duree: 0.5, volume: 0.4 },
    porteBloquee:   { fichier: "closed_door.mp3", debut: 0, duree: 0.5, volume: 0.6, vitesse: 1.3 },
    frigoOuvre:     { fichier: "open_and_close_fridge.mp3", debut: 0.75, duree: 0.9, volume: 0.6 },
    frigoFerme:     { fichier: "open_and_close_fridge.mp3", debut: 5.3, duree: 0.8, volume: 0.6 },
    frigoRonron:    { fichier: "buzz_fridge.mp3", volume: 0.22 },

    sifflet:        { fichier: "party_whistle.mp3", debut: 0.2, duree: 2, volume: 0.4 },
    moin:           { fichier: "squeak_moin.mp3", debut: 0, duree: 0.32, volume: 0.6 },
    revelation:     { fichier: "ui_reveal.mp3", debut: 0.1, duree: 2.2, volume: 0.4 },
    mouette:        { fichier: "seagull_sounds.mp3", debut: 0.1, duree: 3.8, volume: 0.35 },

    nuit:           { fichier: "nigth_sounds.mp3", volume: 0.3 },
    vent:           { fichier: "wind_trough_window.mp3", debut: 0.3, volume: 0.45 },
    musique:        { fichier: "Keys_Left_By_The_Door.mp3", debut: 0, fin: 55, volume: 0.28 },
};

// La hauteur du babillage de chacun (1 = normale).
const VOIX = {
    bob: 0.85, samsam: 0.68, doudou: 0.78, cakey: 1.12,
    fraisy: 1.25, bluey: 1.45, rosy: 1.18,
};

const CLE_SON_COUPE = "bob-octobre-son-coupe";

const son = {
    ctx: null,
    maitre: null,
    tampons: {},
    boucles: {},
    coupe: false,
    bavardage: null,
    bouton: null,
};


/* ============================================================
   preparerLesSons() — appelée une fois par la scène
   ============================================================ */
function preparerLesSons() {

    try { son.coupe = localStorage.getItem(CLE_SON_COUPE) === "1"; } catch (e) { son.coupe = false; }

    const debloquer = function () {
        if (!son.ctx) demarrerAudio();
        else if (son.ctx.state === "suspended") son.ctx.resume();
    };
    window.addEventListener("pointerdown", debloquer);
    window.addEventListener("touchstart", debloquer);
    window.addEventListener("keydown", debloquer);

    creerBoutonDuSon();
    onKeyPress("m", basculerLeSon);

    // Les pas de Bob, le vent, la mouette : vérifiés à chaque image.
    let prochainPas = 0;
    let prochaineMouette = time() + 40 + Math.random() * 40;

    onUpdate(function () {
        if (!son.ctx) return;
        const bob = get("bob")[0];
        if (!bob) return;

        // Un pas toutes les 0,28 s tant qu'il marche.
        const marche = !dialogueEnCours() && bob.animEnCours && bob.animEnCours.indexOf("marche") === 0;
        if (marche && time() > prochainPas) {
            prochainPas = time() + 0.28;
            jouerSon("pas", { vitesse: 0.9 + Math.random() * 0.2 });
        }

        // Le vent : plus fort près de la fenêtre ouverte (cases 4 à 6).
        const fenetre = vec2(5.5 * TAILLE_TUILE, 0.5 * TAILLE_TUILE);
        const proche = Math.max(0, 1 - bob.pos.dist(fenetre) / (9 * TAILLE_TUILE));
        volumeDeBoucle("vent", 0.08 + 0.92 * proche);

        // Une mouette au loin, de temps en temps.
        if (time() > prochaineMouette) {
            prochaineMouette = time() + 50 + Math.random() * 60;
            jouerSon("mouette", { volume: 0.35 });
        }
    });
}


function demarrerAudio() {
    const Contexte = window.AudioContext || window.webkitAudioContext;
    if (!Contexte) return;

    son.ctx = new Contexte();
    son.maitre = son.ctx.createGain();
    son.maitre.gain.value = son.coupe ? 0 : 1;
    son.maitre.connect(son.ctx.destination);

    // Chaque fichier une seule fois, en arrière-plan : le jeu ne
    // l'attend pas. Un son pas encore arrivé est simplement muet.
    const fichiers = [];
    Object.keys(SONS).forEach(function (nom) {
        if (fichiers.indexOf(SONS[nom].fichier) < 0) fichiers.push(SONS[nom].fichier);
    });

    fichiers.forEach(function (fichier) {
        fetch("assets/sounds/" + fichier)
            .then(function (r) { return r.arrayBuffer(); })
            .then(function (b) { return son.ctx.decodeAudioData(b); })
            .then(function (tampon) {
                son.tampons[fichier] = tampon;
                lancerLesAmbiances();
            })
            .catch(function () {
                console.warn("Son introuvable ou illisible : " + fichier);
            });
    });
}


// Les boucles de fond démarrent dès que leur fichier est arrivé.
function lancerLesAmbiances() {
    demarrerBoucle("nuit");
    demarrerBoucle("musique");
    demarrerBoucle("vent", 0.08);
}


/* ============================================================
   JOUER
   ============================================================ */
function jouerSon(nom, options) {

    options = options || {};
    const def = SONS[nom];
    if (!def || !son.ctx) return null;
    const tampon = son.tampons[def.fichier];
    if (!tampon) return null;

    let debut = def.debut || 0;
    let duree = def.duree;
    if (def.morceaux) {
        const m = def.morceaux[Math.floor(Math.random() * def.morceaux.length)];
        debut = m[0];
        duree = m[1];
    }

    const source = son.ctx.createBufferSource();
    source.buffer = tampon;
    source.playbackRate.value = (def.vitesse || 1) * (options.vitesse || 1);

    const gain = son.ctx.createGain();
    gain.gain.value = def.volume * (options.volume === undefined ? 1 : options.volume);
    source.connect(gain);
    gain.connect(son.maitre);

    source.start(0, debut, duree);
    return { source: source, gain: gain };
}


function demarrerBoucle(nom, volume) {

    if (son.boucles[nom]) return son.boucles[nom];
    const def = SONS[nom];
    if (!def || !son.ctx) return null;
    const tampon = son.tampons[def.fichier];
    if (!tampon) return null;

    const source = son.ctx.createBufferSource();
    source.buffer = tampon;
    source.loop = true;
    source.loopStart = def.debut || 0;
    source.loopEnd = def.fin || tampon.duration;

    // Un fondu d'entrée de deux secondes : rien ne doit démarrer d'un coup.
    const gain = son.ctx.createGain();
    const cible = def.volume * (volume === undefined ? 1 : volume);
    gain.gain.setValueAtTime(0, son.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(cible, son.ctx.currentTime + 2);

    source.connect(gain);
    gain.connect(son.maitre);
    source.start(0, source.loopStart);

    son.boucles[nom] = { source: source, gain: gain };
    return son.boucles[nom];
}


function volumeDeBoucle(nom, volume) {
    const b = son.boucles[nom];
    if (!b) return;
    b.gain.gain.setTargetAtTime(SONS[nom].volume * volume, son.ctx.currentTime, 0.3);
}


function arreterBoucle(nom) {
    const b = son.boucles[nom];
    if (!b) return;
    delete son.boucles[nom];
    b.gain.gain.setTargetAtTime(0, son.ctx.currentTime, 0.15);
    b.source.stop(son.ctx.currentTime + 0.8);
}


/* ------------------------------------------------------------
   Le babillage des dialogues (appelé par dialogue.js)
   ------------------------------------------------------------
   Un fichier de 17 secondes joué en boucle depuis un point pris au
   hasard, à la hauteur du personnage, tant que sa réplique
   s'écrit. La narration, elle, se lit en silence.
   ------------------------------------------------------------ */
function demarrerBavardage(qui) {
    arreterBavardage();
    if (!qui || !son.ctx) return;
    const tampon = son.tampons[SONS.babillage.fichier];
    if (!tampon) return;

    const source = son.ctx.createBufferSource();
    source.buffer = tampon;
    source.loop = true;
    source.playbackRate.value = VOIX[qui] || 1;
    const gain = son.ctx.createGain();
    gain.gain.value = SONS.babillage.volume;
    source.connect(gain);
    gain.connect(son.maitre);
    source.start(0, Math.random() * (tampon.duration - 1));
    son.bavardage = { source: source, gain: gain };
}

function arreterBavardage() {
    if (!son.bavardage) return;
    const b = son.bavardage;
    son.bavardage = null;
    b.gain.gain.setTargetAtTime(0, son.ctx.currentTime, 0.03);
    b.source.stop(son.ctx.currentTime + 0.2);
}


/* ------------------------------------------------------------
   Le bouton ♪ — couper / remettre le son
   ------------------------------------------------------------
   En bas à droite, au-dessus du bouton d'action : le haut de
   l'écran est pris par l'objectif et l'inventaire.
   ------------------------------------------------------------ */
function creerBoutonDuSon() {

    son.bouton = add([
        circle(15),
        pos(0, 0),
        anchor("center"),
        fixed(),
        color(...COULEUR_NUIT),
        opacity(0.55),
        z(Z_INTERFACE - 5),
    ]);
    const signe = add([
        text("", { size: 14 }),
        pos(0, 0),
        anchor("center"),
        fixed(),
        color(...COULEUR_CREME),
        z(Z_INTERFACE - 4),
    ]);

    const placer = function () {
        const p = vec2(width() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON,
            height() - BOUTON_ACTION_MARGE - BOUTON_ACTION_RAYON * 2 - 34);
        son.bouton.pos = p;
        signe.pos = p;
        signe.text = son.coupe ? "×" : "♪";
        // Caché pendant les dialogues : la boîte prend le bas de l'écran.
        const visible = !dialogueEnCours();
        son.bouton.opacity = visible ? 0.55 : 0;
        signe.opacity = visible ? 1 : 0;
    };
    son.bouton.onUpdate(placer);

    const toucher = function (p) {
        if (dialogueEnCours() || !p) return;
        if (p.dist(son.bouton.pos) < 26) basculerLeSon();
    };
    onMousePress(function () { toucher(mousePos()); });
    onTouchStart(function (p) { toucher(p); });
}


function basculerLeSon() {
    son.coupe = !son.coupe;
    try { localStorage.setItem(CLE_SON_COUPE, son.coupe ? "1" : "0"); } catch (e) { /* tant pis */ }
    if (son.maitre) son.maitre.gain.setTargetAtTime(son.coupe ? 0 : 1, son.ctx.currentTime, 0.1);
}
