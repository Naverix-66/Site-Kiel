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

   ------------------------------------------------------------
   TOUS LES RACCOURCIS, DANS L'ORDRE DE L'HISTOIRE

       ?neuf       une partie neuve
       ?acte2      l'appartement, l'équipement prêt
       ?acte3      la façade, en haut de la corde
       ?acte4      la cour, début du combat
       ?phare      la cour, phase 2 (la veilleuse en l'air)
       ?ausol      la cour, phase 3 (elle est à terre)
       ?nid        le nid, tout en haut de l'arbre
       ?corde      le retour, et la corde à attraper
       ?epilogue   l'appartement à l'aube
       ?fin        le mot de la fin
   ============================================================ */

if (typeof raccourciEpilogue === "function" && raccourciEpilogue()) {
    // rien : le raccourci a déjà tout préparé
} else if (typeof raccourciActeIV === "function" && raccourciActeIV()) {
    // rien
} else if (typeof raccourciActeIII !== "function" || !raccourciActeIII()) {
    charger();
}

function sceneDeDepart() {

    if (typeof location !== "undefined" && /[?&](neuf|acte2)\b/.test(location.search)) {
        return "appartement";
    }

    // Le mot de la fin : il n'y a plus de jeu derrière.
    if (memoire.acte >= 6) return "fin";

    // L'épilogue se joue dans l'appartement (voir installerStudio).
    if (memoire.acte >= 5) return "appartement";

    // En pleine bagarre : la cour, ou le nid si elle l'a emporté.
    if (memoire.acte >= 4) {
        return memoire.drapeaux.combat_phase === 4 ? "nid" : "cour";
    }

    if (memoire.acte >= 3) return "facade";
    return "appartement";
}

const depart = sceneDeDepart();
if (depart === "appartement") go("appartement", "studio");
else go(depart);
