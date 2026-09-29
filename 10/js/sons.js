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
                Door) — basse, et plus basse encore pendant les
                dialogues —, le vent qui entre par la fenêtre
                ouverte, d'autant plus fort que Bob en est près
   petits jeux  la musique se retire presque entièrement ; les
                tintements, le fracas et le buzzer sont fabriqués
                par le navigateur (sonSynthe, en bas du fichier)
   par-dessus   Mystic sounds, quand le phare s'allume (acte II) :
                la musique se retire le temps qu'il joue
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
    // Evan : « la musique est un peu trop forte, on n'entend pas les
    // autres sons ». Elle est à peine au-dessus de la nuit, et elle se
    // pousse encore pendant les dialogues (voir preparerLesSons).
    musique:        { fichier: "Keys_Left_By_The_Door.mp3", debut: 0, fin: 55, volume: 0.12 },

    /* ---- l'acte III, la cour, le nid ----
       La musique du DEHORS, déposée par Evan le 27/09. La façade, la
       cour et le nid la prennent tout seuls à la place de celle de
       l'appartement (musiqueDuDehors, plus bas).

       ⚠️ fin: 172 et pas 181. Le morceau fait 3 min 01, et ses six
       dernières secondes sont un fondu de sortie : en bouclant sur
       toute la durée, on entendait la musique mourir puis repartir,
       six fois par partie. Mesuré seconde par seconde : à 172 s le
       niveau est exactement celui du début (0,047 contre 0,043), donc
       le raccord ne s'entend pas.

       ⚠️ depart: 36. C'EST LA LIGNE QUI COMPTE. Evan : « on n'entend
       pas assez la 2e musique ». Ce n'était pas le volume : relevé
       seconde par seconde, le morceau a trente-six secondes d'intro
       très douce (0,04 puis 0,10 puis 0,16) avant d'atteindre son
       niveau, 0,24. On démarrait donc la façade sur le passage le
       plus effacé de tout le morceau. Maintenant on entre en plein
       dedans, et l'intro ne revient qu'au tour suivant — dans deux
       minutes seize, comme une respiration.

       ⚠️ volume: 0,20 et pas 0,3. Les deux morceaux ont le même
       niveau à l'enregistrement (RMS 0,20) : à 0,3, le dehors aurait
       été deux fois et demie plus fort que le dedans, et Evan avait
       déjà dit une fois que la musique couvrait tout. À 0,20, en
       entrant à 36 s, il est nettement au-dessus de l'appartement
       sans écraser le vent ni les cris de Bluey. */
    dehors:         { fichier: "Patterns_On_The_Glass.mp3", debut: 0, fin: 172, depart: 36, volume: 0.20 },
    pluie:          { fichier: "wind_trough_window.mp3", debut: 1.2, volume: 0.2, vitesse: 1.6 },

    // ---- l'acte II ----
    mystique:       { fichier: "mystic_sounds.mp3", volume: 0.45 },
    prise:          { fichier: "click_text.mp3", debut: 0.14, duree: 0.2, volume: 0.9, vitesse: 0.55 },
    bouchon:        { fichier: "pop_gettingItem.mp3", debut: 0.15, duree: 0.45, volume: 0.8, vitesse: 0.7 },
    tremble:        { fichier: "closed_door.mp3", debut: 0, duree: 0.3, volume: 0.22, vitesse: 1.9 },
    tire:           { fichier: "click_text.mp3", debut: 0.14, duree: 0.2, volume: 0.5 },
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
    pousseMusique: null,  // la part de volume laissée à la musique
    morceauJusquA: 0,     // un morceau joue par-dessus jusqu'à cette heure
    musiqueEnCours: "musique",  // "musique" dedans, "dehors" sur la façade
    branche: false,       // les écouteurs de la fenêtre sont posés
    fenetreFermee: false, // l'épilogue la referme : plus un souffle
};


/* ============================================================
   preparerLesSons() — appelée une fois par la scène
   ============================================================ */
function preparerLesSons() {

    try { son.coupe = localStorage.getItem(CLE_SON_COUPE) === "1"; } catch (e) { son.coupe = false; }

    // Une scène neuve : la fenêtre est ouverte jusqu'à preuve du
    // contraire. C'est l'épilogue qui la referme (epilogue.js).
    son.fenetreFermee = false;

    // Chaque scène rappelle preparerLesSons (le bouton ♪ et la
    // boucle meurent avec elle), mais les écouteurs de la fenêtre,
    // eux, survivent : on ne les pose qu'une fois.
    if (!son.branche) {
        son.branche = true;
        const debloquer = function () {
            if (!son.ctx) demarrerAudio();
            else if (son.ctx.state === "suspended") son.ctx.resume();
        };
        window.addEventListener("pointerdown", debloquer);
        window.addEventListener("touchstart", debloquer);
        window.addEventListener("keydown", debloquer);
    }

    creerBoutonDuSon();
    onKeyPress("m", basculerLeSon);

    // Les pas de Bob, le vent, la mouette : vérifiés à chaque image.
    let prochainPas = 0;
    let prochaineMouette = time() + 40 + Math.random() * 40;

    onUpdate(function () {
        if (!son.ctx) return;

        // La musique laisse la place : aux voix pendant un dialogue, et
        // à un morceau joué par-dessus (jouerMorceau), et presque tout
        // entière pendant un petit jeu : on y retient son souffle.
        // ⚠️ AVANT le test sur Bob : à l'acte III, Bob n'est pas un
        // objet de la scène (acte3.js le dessine lui-même), et la
        // musique resterait bloquée au volume de la dernière phrase.
        const pousse = son.morceauJusquA > son.ctx.currentTime ? 0.2
            : (jeuEnCours() ? 0.15 : (dialogueEnCours() ? 0.65 : 1));
        if (pousse !== son.pousseMusique && son.boucles[son.musiqueEnCours]) {
            son.pousseMusique = pousse;
            volumeDeBoucle(son.musiqueEnCours, pousse);
        }

        const bob = get("bob")[0];
        if (!bob) return;

        // Un pas toutes les 0,28 s tant qu'il marche.
        const marche = !dialogueEnCours() && bob.animEnCours && bob.animEnCours.indexOf("marche") === 0;
        if (marche && time() > prochainPas) {
            prochainPas = time() + 0.28;
            jouerSon("pas", { vitesse: 0.9 + Math.random() * 0.2 });
        }

        // Le vent : plus fort près de la fenêtre ouverte (cases 4 à 6).
        // Sauf une fois : à l'épilogue, Bob la referme, et le froid
        // s'arrête d'un coup. C'est le premier silence de la nuit, et
        // il doit s'entendre.
        if (son.fenetreFermee) {
            volumeDeBoucle("vent", 0);
        } else {
            const fenetre = vec2(5.5 * TAILLE_TUILE, 0.5 * TAILLE_TUILE);
            const proche = Math.max(0, 1 - bob.pos.dist(fenetre) / (9 * TAILLE_TUILE));
            volumeDeBoucle("vent", 0.08 + 0.92 * proche);
        }

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
    const optionnels = [];
    Object.keys(SONS).forEach(function (nom) {
        const f = SONS[nom].fichier;
        if (fichiers.indexOf(f) < 0) fichiers.push(f);
        if (SONS[nom].optionnel && optionnels.indexOf(f) < 0) optionnels.push(f);
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
                // Un son "optionnel" est un son qu'on attend encore :
                // il ne doit pas salir la console tant qu'il manque.
                if (optionnels.indexOf(fichier) < 0) {
                    console.warn("Son introuvable ou illisible : " + fichier);
                }
            });
    });
}


// Les boucles de fond démarrent dès que leur fichier est arrivé.
function lancerLesAmbiances() {
    demarrerBoucle("nuit");
    demarrerBoucle(son.musiqueEnCours);
    demarrerBoucle("vent", 0.08);
}


/* ------------------------------------------------------------
   DEDANS / DEHORS
   ------------------------------------------------------------
   L'appartement a sa musique ; la façade en veut une autre, plus
   tendue. Tant que le fichier du dehors n'est pas là, on garde
   celle de l'appartement : on appelle donc cette fonction à
   chaque image, et elle bascule toute seule le jour où le
   morceau arrive.
   ------------------------------------------------------------ */
function musiqueDuDehors(dehors) {

    if (!son.ctx) return;
    const voulue = dehors && son.tampons[SONS.dehors.fichier] ? "dehors" : "musique";
    if (voulue === son.musiqueEnCours && son.boucles[voulue]) return;
    if (voulue === son.musiqueEnCours) return;

    arreterBoucle(son.musiqueEnCours);
    son.musiqueEnCours = voulue;
    son.pousseMusique = null;
    demarrerBoucle(voulue);
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


// Un morceau joué une fois, par-dessus tout : la musique se retire
// le temps qu'il dure, puis revient d'elle-même.
function jouerMorceau(nom) {
    const joue = jouerSon(nom);
    if (!joue) return;
    son.morceauJusquA = son.ctx.currentTime + joue.source.buffer.duration;
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

    /* « depart » : où l'on ENTRE dans le morceau, qui n'est pas
       forcément là où il BOUCLE. Un morceau qui commence par une
       longue intro douce s'entend à peine pendant sa première minute,
       alors qu'il boucle très bien par ailleurs — c'est exactement le
       cas de la musique du dehors. On entre donc en plein dedans, et
       l'intro ne revient qu'au tour suivant, comme une respiration. */
    const depart = def.depart === undefined ? source.loopStart : def.depart;

    // Un fondu d'entrée de deux secondes : rien ne doit démarrer d'un coup.
    const gain = son.ctx.createGain();
    const cible = def.volume * (volume === undefined ? 1 : volume);
    gain.gain.setValueAtTime(0, son.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(cible, son.ctx.currentTime + 2);

    source.connect(gain);
    gain.connect(son.maitre);
    source.start(0, depart);

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
        const visible = !dialogueEnCours() && !jeuEnCours();
        son.bouton.opacity = visible ? 0.55 : 0;
        signe.opacity = visible ? 1 : 0;
    };
    son.bouton.onUpdate(placer);

    const toucher = function (p) {
        if (dialogueEnCours() || jeuEnCours() || !p) return;
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


/* ============================================================
   LES SONS FABRIQUÉS — pour les petits jeux
   ============================================================
   Pas de fichier : l'audio du navigateur sait fabriquer des sons
   simples, et ceux-là sont exactement ce qu'il faut.

     "tinte"    un verre ou une assiette qu'on effleure (deux notes
                aiguës qui s'éteignent vite)
     "fracas"   une pile de vaisselle qui s'effondre (un souffle de
                bruit, et une pluie de tintements)
     "bzzt"     le buzzer du Docteur Maboule
     "tok"      un choc mou (une bobine contre la mousse)

   Ils passent par le même volume général que le reste : le bouton
   ♪ les coupe aussi.
   ============================================================ */
function sonSynthe(nom, force) {

    if (!son.ctx || son.ctx.state !== "running") return;
    const ctx = son.ctx;
    const t = ctx.currentTime;
    const k = force === undefined ? 1 : force;

    if (nom === "tinte") {
        const f = 2400 + Math.random() * 2200;
        ping(t, f, 0.1 * k, 0.35);
        ping(t + 0.01, f * 1.49, 0.04 * k, 0.25);

    } else if (nom === "fracas") {
        souffle(t, 1.1, 0.32 * k);
        for (let i = 0; i < 14; i++) {
            ping(t + Math.random() * 0.9, 1500 + Math.random() * 3500, (0.05 + Math.random() * 0.08) * k, 0.3 + Math.random() * 0.4);
        }

    } else if (nom === "bzzt") {
        [110, 166].forEach(function (f) {
            const o = ctx.createOscillator();
            o.type = "square";
            o.frequency.value = f;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.06 * k, t);
            g.gain.setValueAtTime(0.06 * k, t + 0.32);
            g.gain.linearRampToValueAtTime(0, t + 0.4);
            o.connect(g);
            g.connect(son.maitre);
            o.start(t);
            o.stop(t + 0.42);
        });

    } else if (nom === "tok") {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(190, t);
        o.frequency.exponentialRampToValueAtTime(80, t + 0.09);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.25 * k, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.connect(g);
        g.connect(son.maitre);
        o.start(t);
        o.stop(t + 0.14);

    } else if (nom === "clang") {
        // La fonte de la descente de gouttière : trois partiels qui
        // ne sont pas d'accord entre eux, et qui durent trop longtemps.
        souffle(t, 0.25, 0.18 * k);
        [392, 587, 933, 1411].forEach(function (f, i) {
            ping(t + i * 0.004, f * (1 + (Math.random() - 0.5) * 0.02), (0.1 - i * 0.02) * k, 2.2 - i * 0.3);
        });

    } else if (nom === "grince") {
        // Une corde tendue qui travaille : un filet de scie très bas,
        // modulé, qui s'arrête net.
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(78, t);
        o.frequency.linearRampToValueAtTime(112, t + 0.4);
        const trem = ctx.createOscillator();
        trem.type = "sine";
        trem.frequency.value = 17;
        const profondeur = ctx.createGain();
        profondeur.gain.value = 18;
        trem.connect(profondeur);
        profondeur.connect(o.frequency);
        const filtre = ctx.createBiquadFilter();
        filtre.type = "lowpass";
        filtre.frequency.value = 900;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.07 * k, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        o.connect(filtre);
        filtre.connect(g);
        g.connect(son.maitre);
        o.start(t); trem.start(t);
        o.stop(t + 0.5); trem.stop(t + 0.5);

    } else if (nom === "vitre") {
        ping(t, 3100, 0.07 * k, 0.5);
        ping(t + 0.006, 4700, 0.045 * k, 0.35);
        ping(t + 0.012, 2050, 0.03 * k, 0.6);

    } else if (nom === "terre") {
        // Un pot de terre : ça fait un bruit mat, et ça se vide un peu.
        souffle(t, 0.35, 0.22 * k);
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.setValueAtTime(130, t);
        o.frequency.exponentialRampToValueAtTime(55, t + 0.18);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2 * k, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(g); g.connect(son.maitre);
        o.start(t); o.stop(t + 0.3);

    } else if (nom === "rafale") {
        // Le souffle qui monte, tient, et s'en va : deux secondes et
        // demie de bruit filtré qui balaye les aigus.
        const duree = 2.6;
        const n = Math.floor(ctx.sampleRate * duree);
        const tampon = ctx.createBuffer(1, n, ctx.sampleRate);
        const d = tampon.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = tampon;
        const filtre = ctx.createBiquadFilter();
        filtre.type = "bandpass";
        filtre.Q.value = 1.4;
        filtre.frequency.setValueAtTime(420, t);
        filtre.frequency.linearRampToValueAtTime(1500, t + 1.1);
        filtre.frequency.linearRampToValueAtTime(380, t + duree);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16 * k, t + 0.9);
        g.gain.setValueAtTime(0.16 * k, t + 1.5);
        g.gain.linearRampToValueAtTime(0, t + duree);
        source.connect(filtre); filtre.connect(g); g.connect(son.maitre);
        source.start(t);
    }
}


// Une note pure qui s'éteint : la base d'un tintement.
function ping(t, frequence, volume, duree) {
    const ctx = son.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = frequence;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g);
    g.connect(son.maitre);
    o.start(t);
    o.stop(t + duree + 0.05);
}


// Un souffle de bruit qui décroît : le cœur d'un fracas.
function souffle(t, duree, volume) {
    const ctx = son.ctx;
    const n = Math.floor(ctx.sampleRate * duree);
    const tampon = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = tampon.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const source = ctx.createBufferSource();
    source.buffer = tampon;
    const filtre = ctx.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = 2200;
    filtre.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.value = volume;
    source.connect(filtre);
    filtre.connect(g);
    g.connect(son.maitre);
    source.start(t);
}
