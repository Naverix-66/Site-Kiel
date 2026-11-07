/* ============================================================
   SONS
   ============================================================
   Aucun fichier audio : tout est synthétisé au moment où on en
   a besoin (Web Audio API). C'est trois fois rien en code et ça
   change tout pour la sensation : un clavier qui fait "tic", un
   message qui fait "pop", un déverrouillage qui fait "ta-dam".

   ⚠️ Deux pièges iOS, les deux déjà contournés ici :

   1. Safari refuse de créer un contexte audio avant que la
      joueuse ait touché l'écran. On crée donc le contexte au
      PREMIER appui, pas au chargement.
   2. Le contexte repart en "suspended" quand on quitte l'onglet.
      On le réveille à chaque son (resume()).
   ============================================================ */


let contexteAudio = null;


/* Appelé au premier contact avec l'écran (voir os.js). */
function reveillerLAudio() {
    if (!ETAT.sonsActives) return;

    try {
        if (!contexteAudio) {
            const Constructeur = window.AudioContext || window.webkitAudioContext;
            if (!Constructeur) return;
            contexteAudio = new Constructeur();
        }
        if (contexteAudio.state === "suspended") {
            contexteAudio.resume();
        }
    } catch (erreur) {
        contexteAudio = null;
    }
}


/* ------------------------------------------------------------
   note() — une seule note, avec une enveloppe douce
   ------------------------------------------------------------
   frequence : en hertz (440 = la)
   duree     : en secondes
   volume    : 0 à 1
   retard    : pour enchaîner des notes
   forme     : "sine" (doux), "triangle" (clair), "square" (dur)
   ------------------------------------------------------------ */
function note(frequence, duree, volume, retard, forme) {
    if (!ETAT.sonsActives) return;
    reveillerLAudio();
    if (!contexteAudio) return;

    const debut = contexteAudio.currentTime + (retard || 0);

    const oscillateur = contexteAudio.createOscillator();
    const gain = contexteAudio.createGain();

    oscillateur.type = forme || "sine";
    oscillateur.frequency.setValueAtTime(frequence, debut);

    // Attaque très courte puis extinction exponentielle : c'est
    // ce qui fait la différence entre un "son d'interface" et un bip.
    gain.gain.setValueAtTime(0.0001, debut);
    gain.gain.exponentialRampToValueAtTime(volume || 0.08, debut + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, debut + (duree || 0.12));

    oscillateur.connect(gain);
    gain.connect(contexteAudio.destination);

    oscillateur.start(debut);
    oscillateur.stop(debut + (duree || 0.12) + 0.03);
}


/* Un souffle de bruit blanc filtré : les "clic" secs et les
   pages qui glissent. */
function souffle(duree, volume, frequenceFiltre) {
    if (!ETAT.sonsActives) return;
    reveillerLAudio();
    if (!contexteAudio) return;

    const d = duree || 0.06;
    const echantillons = Math.floor(contexteAudio.sampleRate * d);
    const tampon = contexteAudio.createBuffer(1, echantillons, contexteAudio.sampleRate);
    const donnees = tampon.getChannelData(0);

    for (let i = 0; i < echantillons; i++) {
        // décroissance linéaire : un "tss" qui s'éteint
        donnees[i] = (Math.random() * 2 - 1) * (1 - i / echantillons);
    }

    const source = contexteAudio.createBufferSource();
    source.buffer = tampon;

    const filtre = contexteAudio.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = frequenceFiltre || 1800;
    filtre.Q.value = 0.8;

    const gain = contexteAudio.createGain();
    gain.gain.value = volume || 0.05;

    source.connect(filtre);
    filtre.connect(gain);
    gain.connect(contexteAudio.destination);

    source.start();
}


/* ------------------------------------------------------------
   LA BIBLIOTHÈQUE DE SONS DU JEU
   ------------------------------------------------------------
   C'est la seule partie qu'on appelle depuis le reste du code :
   SONS.clavier(), SONS.message()…
   ------------------------------------------------------------ */
const SONS = {

    // un appui quelconque dans l'interface
    tape: function () {
        souffle(0.035, 0.035, 2400);
    },

    // une touche du pavé numérique
    clavier: function () {
        souffle(0.03, 0.055, 3200);
        note(1400, 0.04, 0.03, 0, "triangle");
    },

    // on ouvre une application
    ouverture: function () {
        souffle(0.09, 0.03, 900);
    },

    // on revient en arrière
    retour: function () {
        souffle(0.07, 0.022, 700);
    },

    // le code est bon : le téléphone s'ouvre
    deverrouillage: function () {
        note(523.25, 0.14, 0.07, 0, "sine");       // do
        note(783.99, 0.22, 0.06, 0.09, "sine");    // sol
    },

    // le code est faux
    erreur: function () {
        note(180, 0.12, 0.08, 0, "triangle");
        note(150, 0.16, 0.07, 0.1, "triangle");
    },

    // un message arrive
    message: function () {
        note(880, 0.09, 0.055, 0, "sine");
        note(1318.5, 0.14, 0.05, 0.07, "sine");
    },

    // une notification générale (bannière)
    notification: function () {
        note(1046.5, 0.1, 0.05, 0, "sine");
        note(1396.9, 0.18, 0.045, 0.1, "sine");
    },

    // un indice entre dans le carnet
    indice: function () {
        note(1174.7, 0.08, 0.035, 0, "triangle");
        note(1567.98, 0.12, 0.03, 0.06, "triangle");
    },

    // une déduction est validée : la petite récompense du jeu
    succes: function () {
        note(659.25, 0.12, 0.055, 0, "sine");      // mi
        note(830.61, 0.12, 0.05, 0.1, "sine");     // sol#
        note(987.77, 0.26, 0.055, 0.2, "sine");    // si
    },

    // une déduction ne tient pas
    echec: function () {
        note(392, 0.14, 0.05, 0, "sine");
        note(329.63, 0.22, 0.045, 0.12, "sine");
    },

    // une photo supprimée qu'on récupère, un verrou qui cède
    revelation: function () {
        note(261.63, 0.5, 0.045, 0, "sine");
        note(392, 0.5, 0.035, 0.05, "sine");
        note(523.25, 0.7, 0.04, 0.12, "sine");
    },
};
