/* ============================================================
   VARIABLE GLOBALE À METTRE À JOUR CHAQUE MOIS
   ============================================================
   C'est la SEULE ligne à changer une fois par mois.
   Mets simplement le numéro du mois en cours (1 = janvier,
   9 = septembre, 12 = décembre, etc.)
   ============================================================ */
const MOIS_ACTUEL = 9;


//Mettre un higher_score.
//Septembre : memorie game w/ bob AI (bob cuisinier/bob coquette...)


/* ============================================================
   ORDRE CHRONOLOGIQUE DU CALENDRIER
   ============================================================
   Ton calendrier ne suit pas l'ordre janvier -> décembre,
   il commence en septembre et finit en juillet.
   Ce tableau décrit cet ordre-là, dans l'ordre où les mois
   doivent se débloquer les uns après les autres.
   ============================================================ */
const ORDRE_DU_CALENDRIER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];


/* ============================================================
   JOUR DE DÉBLOCAGE DU MOIS
   ============================================================
   Le mois EN COURS (celui qui correspond à MOIS_ACTUEL) ne se
   débloque pas dès le 1er : il faut attendre ce jour-là du mois.
   Avant cette date, sa case reste verrouillée mais affiche un
   décompte au survol ("encore X jours").
   ============================================================ */
const JOUR_DE_DEBLOCAGE = 8;


/* ============================================================
   NOMS DE FICHIERS
   ============================================================
   Fait le lien entre le numéro du mois et le nom du fichier
   HTML vers lequel on redirige (ex : 9 -> "septembre.html").
   Si tes fichiers s'appellent autrement, c'est ici qu'il faut
   changer.
   ============================================================ */
const NOMS_DE_FICHIERS = {
    1: "01/janvier.html",
    2: "02/fevrier.html",
    3: "03/mars.html",
    4: "04/avril.html",
    5: "05/mai.html",
    6: "06/juin.html",
    7: "07/juillet.html",
    9: "09/septembre.html",
    10: "10/octobre.html",
    11: "11/novembre.html",
    12: "12/decembre.html",
};


/* ============================================================
   FONCTION : estDisponible(mois)
   ============================================================
   Renvoie true si le mois donné doit déjà être débloqué.
   - Les mois avant MOIS_ACTUEL sont toujours débloqués.
   - Les mois après MOIS_ACTUEL sont toujours verrouillés.
   - Le mois EN COURS (= MOIS_ACTUEL) ne se débloque que le
     JOUR_DE_DEBLOCAGE (le 8, par ex.), pas avant.
   ============================================================ */
function estDisponible(mois) {
    const indexDuMoisActuel = ORDRE_DU_CALENDRIER.indexOf(MOIS_ACTUEL);
    const indexDuMois = ORDRE_DU_CALENDRIER.indexOf(mois);

    if (indexDuMois < indexDuMoisActuel) {
        return true;
    }

    if (indexDuMois === indexDuMoisActuel) {
        const jourAujourdhui = new Date().getDate();
        return jourAujourdhui >= JOUR_DE_DEBLOCAGE;
    }

    return false;
}


/* ============================================================
   FONCTION : joursAvantDeblocage(mois)
   ============================================================
   Calcule combien de jours il reste avant le JOUR_DE_DEBLOCAGE
   du mois donné. On utilise de vraies dates (objets Date) pour
   que ça reste juste même quand le mois ciblé tombe l'année
   suivante (ex : on est en décembre, le mois ciblé est janvier).
   ============================================================ */
function joursAvantDeblocage(mois) {
    const aujourdhui = new Date();
    const anneeActuelle = aujourdhui.getFullYear();
    const moisReelActuel = aujourdhui.getMonth() + 1;   // getMonth() renvoie 0 à 11

    // Si le mois ciblé arrive "avant" le mois civil actuel, c'est qu'on
    // parle en réalité de ce mois l'année prochaine.
    let anneeCible = anneeActuelle;
    if (mois < moisReelActuel) {
        anneeCible = anneeActuelle + 1;
    }

    const dateDeDeblocage = new Date(anneeCible, mois - 1, JOUR_DE_DEBLOCAGE);

    const differenceEnMillisecondes = dateDeDeblocage - aujourdhui;
    const differenceEnJours = Math.ceil(differenceEnMillisecondes / (1000 * 60 * 60 * 24));

    return Math.max(differenceEnJours, 1);
}


/* ============================================================
   FONCTION : trouverProchainMoisVerrouille()
   ============================================================
   Repère, dans l'ordre du calendrier, le premier mois qui n'est
   PAS encore disponible. C'est celui qui doit afficher le
   décompte (peu importe si c'est "le mois civil actuel" ou un
   mois plus tard). Renvoie undefined si tous les mois sont
   déjà débloqués (fin du calendrier).
   ============================================================ */
function trouverProchainMoisVerrouille() {
    return ORDRE_DU_CALENDRIER.find(function (mois) {
        return !estDisponible(mois);
    });
}


/* ============================================================
   FONCTION : redirigerVers(mois)
   ============================================================
   Change la page vers le fichier HTML du mois donné.
   ============================================================ */
function redirigerVers(mois) {
    const fichier = NOMS_DE_FICHIERS[mois];

    if (fichier) {
        window.location.href = fichier;
    }
}


/* ============================================================
   INITIALISATION
   ============================================================
   Au chargement de la page, on parcourt toutes les cases du
   calendrier et, pour chacune, on décide si elle est
   disponible ou verrouillée, puis on branche le clic
   uniquement sur les cases disponibles.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {

    const cases = document.querySelectorAll(".case");

    // Le mois qui doit afficher le décompte : la toute première case
    // verrouillée dans l'ordre du calendrier (pas forcément MOIS_ACTUEL).
    const moisAvecDecompte = trouverProchainMoisVerrouille();

    cases.forEach(function (caseCourante) {

        // Le numéro du mois est stocké dans l'attribut data-mois du HTML
        const mois = Number(caseCourante.dataset.mois);

        if (estDisponible(mois)) {

            caseCourante.classList.add("disponible");

            caseCourante.addEventListener("click", function () {
                redirigerVers(mois);
            });

        } else {

            caseCourante.classList.add("verrouille");
            // Pas d'écouteur de clic ajouté : la case reste inactive.

            // Si c'est la prochaine case à se débloquer, on ajoute une classe
            // spéciale + le nombre de jours restants, pour afficher un
            // décompte au survol (voir CSS).
            if (mois === moisAvecDecompte) {
                caseCourante.classList.add("prochain-a-debloquer");
                caseCourante.dataset.jours = joursAvantDeblocage(mois);
            }

        }

    });

});