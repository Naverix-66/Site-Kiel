/* ============================================================
   LES VOIX DES PELUCHES
   ============================================================
   Chaque réplique doublée a un fichier dans assets/voix, nommé
   d'après l'EMPREINTE de « qui|texte » (voir empreinteVoix).
   On n'a donc jamais eu à numéroter les répliques à la main : le
   texte EST l'identifiant. Si un texte change, son empreinte
   change, plus aucun fichier ne correspond, et la réplique
   retombe toute seule sur le babillage de sons.js.

   VOIX_DISPO (js/voix_dispo.js, écrit par outils/voix.js) liste
   les fichiers réellement présents : le jeu ne réclame jamais un
   fichier qui n'existe pas.

   Le chargement se fait au lancement de chaque dialogue, pour ses
   seules répliques. Une voix pas encore arrivée = babillage.
   ============================================================ */

// FNV-1a 32 bits. Le MÊME calcul tourne dans outils/voix.js :
// n'en modifier un qu'en modifiant l'autre.
function empreinteVoix(qui, texte) {
    const s = (qui + "|" + texte).normalize("NFC");
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
}

const voix = {
    tampons: {},      // empreinte -> AudioBuffer décodé
    enCours: {},      // empreinte -> true pendant le téléchargement
    lecture: null,    // la voix qui joue
    attendue: null,   // empreinte de la réplique affichée dont la voix n'est pas encore arrivée
};

function fichierDeVoix(replique) {
    if (!replique || !replique.qui || typeof VOIX_DISPO === "undefined") return null;
    return VOIX_DISPO[empreinteVoix(replique.qui, replique.texte)] || null;
}

function chargerVoix(r) {
    const fichier = fichierDeVoix(r);
    if (!fichier || !son.ctx) return;
    const cle = empreinteVoix(r.qui, r.texte);
    if (voix.tampons[cle] || voix.enCours[cle]) return;
    voix.enCours[cle] = true;
    fetch("assets/voix/" + fichier)
        .then(function (rep) { return rep.arrayBuffer(); })
        .then(function (b) { return son.ctx.decodeAudioData(b); })
        .then(function (tampon) {
            voix.tampons[cle] = tampon;
            // La réplique s'est affichée AVANT que sa voix arrive (c'est
            // le cas de la première de chaque dialogue) : si elle est
            // toujours à l'écran, on la lance maintenant, à la place du
            // babillage qui avait pris le relais.
            if (voix.attendue === cle) {
                voix.attendue = null;
                if (typeof arreterBavardage === "function") arreterBavardage();
                lancerVoix(tampon);
            }
        })
        .catch(function () { console.warn("Voix illisible : " + fichier); })
        .finally(function () { delete voix.enCours[cle]; });
}

function prechargerVoix(repliques) {
    repliques.forEach(chargerVoix);
}

// Renvoie true si une voix joue : dialogue.js saute alors le babillage.
function jouerVoix(replique) {
    arreterVoix();
    if (!son.ctx || !replique.qui) return false;
    const cle = empreinteVoix(replique.qui, replique.texte);
    const tampon = voix.tampons[cle];
    if (!tampon) {
        // Pas encore arrivée : elle partira toute seule à l'arrivée.
        if (fichierDeVoix(replique)) { voix.attendue = cle; chargerVoix(replique); }
        return false;
    }
    lancerVoix(tampon);
    return true;
}

function lancerVoix(tampon) {
    const source = son.ctx.createBufferSource();
    source.buffer = tampon;
    const gain = son.ctx.createGain();
    gain.gain.value = 0.9;
    source.connect(gain);
    gain.connect(son.maitre);
    source.start();
    voix.lecture = { source: source, gain: gain };
}

function arreterVoix() {
    voix.attendue = null;
    if (!voix.lecture) return;
    const v = voix.lecture;
    voix.lecture = null;
    v.gain.gain.setTargetAtTime(0, son.ctx.currentTime, 0.03);
    v.source.stop(son.ctx.currentTime + 0.2);
}
