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
};

function fichierDeVoix(replique) {
    if (!replique || !replique.qui || typeof VOIX_DISPO === "undefined") return null;
    return VOIX_DISPO[empreinteVoix(replique.qui, replique.texte)] || null;
}

function prechargerVoix(repliques) {
    if (!son.ctx) return;
    repliques.forEach(function (r) {
        const fichier = fichierDeVoix(r);
        if (!fichier) return;
        const cle = empreinteVoix(r.qui, r.texte);
        if (voix.tampons[cle] || voix.enCours[cle]) return;
        voix.enCours[cle] = true;
        fetch("assets/voix/" + fichier)
            .then(function (rep) { return rep.arrayBuffer(); })
            .then(function (b) { return son.ctx.decodeAudioData(b); })
            .then(function (tampon) { voix.tampons[cle] = tampon; })
            .catch(function () { console.warn("Voix illisible : " + fichier); })
            .finally(function () { delete voix.enCours[cle]; });
    });
}

// Renvoie true si une voix joue : dialogue.js saute alors le babillage.
function jouerVoix(replique) {
    arreterVoix();
    if (!son.ctx || !replique.qui) return false;
    const tampon = voix.tampons[empreinteVoix(replique.qui, replique.texte)];
    if (!tampon) return false;

    const source = son.ctx.createBufferSource();
    source.buffer = tampon;
    const gain = son.ctx.createGain();
    gain.gain.value = 0.9;
    source.connect(gain);
    gain.connect(son.maitre);
    source.start();
    voix.lecture = { source: source, gain: gain };
    return true;
}

function arreterVoix() {
    if (!voix.lecture) return;
    const v = voix.lecture;
    voix.lecture = null;
    v.gain.gain.setTargetAtTime(0, son.ctx.currentTime, 0.03);
    v.source.stop(son.ctx.currentTime + 0.2);
}
