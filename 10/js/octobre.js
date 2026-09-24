/* ============================================================
   OCTOBRE — point d'entrée
   ============================================================
   Le tout dernier fichier chargé. Il ne fait qu'une chose :
   dire par quelle scène le jeu commence.

   Il faut lire la sauvegarde AVANT de choisir : une partie
   rangée à l'acte III ne recommence pas dans l'appartement.
   charger() est appelé une deuxième fois par installerStudio(),
   ce qui ne coûte rien et garde les deux scènes indépendantes.

   ⚠️ Les raccourcis d'adresse passent AVANT la sauvegarde :
   ?neuf et ?acte2 doivent rouvrir l'appartement même si la
   partie enregistrée est déjà dehors, sur la façade.

   Plus tard, ce sera go("titre") et l'écran-titre enchaînera
   vers l'appartement.
   ============================================================ */

if (typeof raccourciActeIII !== "function" || !raccourciActeIII()) charger();

function sceneDeDepart() {
    if (typeof location !== "undefined" && /[?&](neuf|acte2)\b/.test(location.search)) {
        return "appartement";
    }
    return memoire.acte >= 3 ? "facade" : "appartement";
}

if (sceneDeDepart() === "facade") go("facade");
else go("appartement", "studio");
