/* ============================================================
   OCTOBRE — point d'entrée
   ============================================================
   Le tout dernier fichier chargé. Il ne fait qu'une chose :
   dire par quelle scène le jeu commence.

   Il faut lire la sauvegarde AVANT de choisir : une partie
   rangée à l'acte III ne recommence pas dans l'appartement.
   charger() est appelé une deuxième fois par installerStudio(),
   ce qui ne coûte rien et garde les scènes indépendantes.

   ⚠️ Les raccourcis d'adresse passent AVANT la sauvegarde :
   ?neuf et ?acte2 doivent rouvrir l'appartement même si la
   partie enregistrée est déjà dehors, sur la façade.

   Plus tard, ce sera go("titre") et l'écran-titre enchaînera
   vers l'appartement.
   ============================================================ */

if (typeof raccourciActeIV === "function" && raccourciActeIV()) {
    // rien : le raccourci a déjà tout préparé
} else if (typeof raccourciActeIII !== "function" || !raccourciActeIII()) {
    charger();
}

function sceneDeDepart() {
    if (typeof location !== "undefined" && /[?&](neuf|acte2)\b/.test(location.search)) {
        return "appartement";
    }
    if (memoire.acte >= 4) return "cour";
    if (memoire.acte >= 3) return "facade";
    return "appartement";
}

const depart = sceneDeDepart();
if (depart === "appartement") go("appartement", "studio");
else go(depart);
