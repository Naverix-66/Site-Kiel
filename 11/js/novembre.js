/* ============================================================
   LE LANCEMENT
   ============================================================
   Le seul fichier qui s'exécute tout seul. Tout le reste
   attend d'être appelé.

   Ordre des opérations :
     1. charger la sauvegarde
     2. démarrer le système (barre d'état, écouteurs)
     3. soit l'enveloppe (première partie), soit le téléphone
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    charger();

    OS.demarrer();

    /* En mode développement on saute tout l'acte 0. */
    if (DEV) {
        console.log("ONZE JOURS — mode dev");
        console.log("Code du téléphone :", CODE_TELEPHONE);
        console.log("Album privé :", CODE_ALBUM_PRIVE, "— Mouchard :", CODE_MOUCHARD, "— Coffre :", MOT_DU_COFFRE);

        ETAT.prologueVu = true;
        ETAT.enveloppeOuverte = true;
        ETAT.motLu = true;
        ETAT.photoRetournee = true;
        ENQUETE.trouver("photo_imprimee");

        INTRO.terminer(true);
        return;
    }

    /* Partie déjà commencée : on va directement au téléphone. */
    if (ETAT.telephoneDeverrouille) {
        OS.dessinerAccueil();
        SCENARIO.demarrer();
        return;
    }

    /* Toute première fois : la nuit du 8, sur SON téléphone à
       elle. C'est là qu'elle reçoit le message perdu et qu'elle
       y répond — onze jours avant de recevoir l'enveloppe. */
    if (!ETAT.prologueVu) {
        PROLOGUE.commencer();
        return;
    }

    /* Sinon : l'enveloppe. */
    INTRO.commencer();
});


/* ------------------------------------------------------------
   On écrit la sauvegarde avant que la page ne se ferme.
   ------------------------------------------------------------ */
window.addEventListener("pagehide", function () {
    sauvegarderMaintenant();
});

window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") sauvegarderMaintenant();
});


/* ------------------------------------------------------------
   L'heure de la barre d'état se remet à jour quand on revient
   sur l'onglet (sinon elle reste figée à l'heure du départ).
   ------------------------------------------------------------ */
document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        OS.dessinerBarreStatut();
        reveillerLAudio();
    }
});
