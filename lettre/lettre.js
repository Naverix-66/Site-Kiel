/* ============================================================
   LA LETTRE — ouverture de l'enveloppe et écriture mot à mot
   ============================================================
   Principe : le JS ne dessine rien et ne déplace rien lui-même.
   Il ajoute des classes sur .scene, une par étape, au bon moment.
   Tout le visuel (positions, rotations, couleurs) est dans le CSS.
   ============================================================ */


/* ============================================================
   RÉGLAGES — c'est ici qu'on change la vitesse
   ============================================================ */

/* Durée de chaque étape de l'ouverture (en millisecondes).
   Ces valeurs sont aussi envoyées au CSS (voir transmettreLesDureesAuCSS). */
const DUREES = {
    sceau: 800,          // le cachet de cire se brise
    rabat: 1100,         // le rabat de l'enveloppe s'ouvre
    sortie: 1300,        // la lettre glisse hors de l'enveloppe
    envol: 1300,         // l'enveloppe s'en va, la lettre vient au centre
    depli: 950,          // un volet de la lettre se déplie
    entreVolets: 500,    // décalage entre le volet du haut et celui du bas
};

/* Rythme de l'écriture */
const ECRITURE = {
    msParLettre: 58,          // temps pour "écrire" une lettre d’un mot
    dureeMin: 240,            // un mot très court prend au moins ce temps
    dureeMax: 850,            // un mot très long ne dépasse pas ce temps
    espace: 70,               // petite respiration entre deux mots
    pauseVirgule: 300,        // après , ; :
    pausePoint: 700,          // après . ! ? …
    pauseParagraphe: 950,     // avant un nouveau paragraphe
    repitApresScroll: 5000,   // si elle fait défiler elle-même, on ne la suit plus pendant ce temps
};


/* ============================================================
   ÉLÉMENTS DE LA PAGE
   ============================================================ */
const scene = document.getElementById("scene");
const flottant = document.querySelector(".flottant");
const enveloppe = document.getElementById("enveloppe");
const lettre = document.getElementById("lettre");
const contenu = document.getElementById("contenu");
const texte = document.getElementById("texte");
const ambiance = document.querySelector(".ambiance");
const eclats = document.querySelector(".eclats");
const boutonPasser = document.getElementById("bouton-passer");
const boutonRejouer = document.getElementById("bouton-rejouer");

/* Si l'appareil demande moins d'animations, on respecte ce choix */
const MOUVEMENT_REDUIT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ============================================================
   ÉTAT
   ============================================================ */
let mots = [];                  // tous les <span class="mot">, dans l'ordre
let indexMot = 0;               // le prochain mot à écrire
let minuteurEcriture = null;    // pour pouvoir arrêter l'écriture (bouton "afficher tout")
let lettreOuverte = false;      // empêche de lancer l'ouverture deux fois
let derniereActionLectrice = 0; // moment où elle a fait défiler la lettre elle-même


/* ============================================================
   PETITS OUTILS
   ============================================================ */

/* Renvoie une promesse qui se résout après "ms" millisecondes.
   Avec "await attendre(500)", on peut écrire une séquence
   d'étapes de haut en bas, comme une recette. */
function attendre(ms) {
    return new Promise(function (resoudre) {
        setTimeout(resoudre, ms);
    });
}

/* Nombre au hasard entre min et max */
function hasard(min, max) {
    return min + Math.random() * (max - min);
}


/* ============================================================
   FONCTION : transmettreLesDureesAuCSS()
   ============================================================
   Crée les variables CSS --duree-sceau, --duree-rabat, …
   à partir de l'objet DUREES. Ainsi, CSS et JS utilisent
   exactement les mêmes durées : on ne règle qu'à un endroit.
   ============================================================ */
function transmettreLesDureesAuCSS() {
    if (MOUVEMENT_REDUIT) {
        Object.keys(DUREES).forEach(function (cle) {
            DUREES[cle] = 1;
        });
    }

    const racine = document.documentElement.style;
    racine.setProperty("--duree-sceau", DUREES.sceau + "ms");
    racine.setProperty("--duree-rabat", DUREES.rabat + "ms");
    racine.setProperty("--duree-sortie", DUREES.sortie + "ms");
    racine.setProperty("--duree-envol", DUREES.envol + "ms");
    racine.setProperty("--duree-depli", DUREES.depli + "ms");
    racine.setProperty("--delai-volets", DUREES.entreVolets + "ms");
}


/* ============================================================
   FONCTION : calculerLEchelle()
   ============================================================
   La lettre pliée doit tenir dans l'enveloppe. On calcule de
   combien la rétrécir (ex : 0.66 = 66 % de sa taille) et on
   le donne au CSS via --echelle.
   ============================================================ */
function calculerLEchelle() {
    const hauteurLettrePliee = lettre.offsetHeight / 3;

    const selonLaLargeur = (enveloppe.offsetWidth * 0.88) / lettre.offsetWidth;
    const selonLaHauteur = (enveloppe.offsetHeight * 0.62) / hauteurLettrePliee;

    scene.style.setProperty("--echelle", Math.min(selonLaLargeur, selonLaHauteur).toFixed(3));
}


/* ============================================================
   FONCTION : typographieFrancaise(chaine)
   ============================================================
   - Remplace l'espace avant ! ? : ; » par une espace insécable
     fine, pour que la ponctuation ne parte jamais seule à la
     ligne suivante.
   - Remplace l'apostrophe droite ' par la vraie apostrophe ’.
   ============================================================ */
function typographieFrancaise(chaine) {
    return chaine
        .replace(/'/g, "’")
        .replace(/[  ]+([!?:;»])/g, " $1")
        .replace(/«[  ]+/g, "« ");
}


/* ============================================================
   FONCTION : decouperEnMots()
   ============================================================
   Parcourt tout le texte écrit dans le HTML et entoure chaque
   mot d'un <span class="mot">. Les balises existantes (<p>,
   <em>, <br>…) sont conservées telles quelles.

   On découpe seulement sur les VRAIS espaces (pas \s), sinon
   les espaces insécables ajoutées juste au-dessus seraient
   coupées elles aussi.
   ============================================================ */
function decouperEnMots() {

    // 1) On liste d'abord tous les morceaux de texte…
    //    (modifier la page PENDANT le parcours perturberait le parcours)
    const noeudsDeTexte = [];
    const parcours = document.createTreeWalker(texte, NodeFilter.SHOW_TEXT);
    while (parcours.nextNode()) {
        noeudsDeTexte.push(parcours.currentNode);
    }

    // 2) …puis on remplace chacun par une suite de <span class="mot">
    noeudsDeTexte.forEach(function (noeud) {

        // Les blancs entre deux balises : on les laisse tranquilles
        if (noeud.textContent.trim() === "") {
            return;
        }

        const morceaux = typographieFrancaise(noeud.textContent).split(/([ \t\n\r]+)/);
        const fragment = document.createDocumentFragment();

        morceaux.forEach(function (morceau) {
            if (morceau === "") {
                return;
            }

            // Un espace : on remet une seule espace normale entre les mots
            if (/^[ \t\n\r]+$/.test(morceau)) {
                fragment.append(" ");
                return;
            }

            const mot = document.createElement("span");
            mot.className = "mot";
            mot.textContent = morceau;

            // Légère inclinaison au hasard : effet "écrit à la main"
            mot.style.setProperty("--penche", hasard(-1.2, 1.2).toFixed(2) + "deg");
            mot.style.setProperty("--decale", hasard(-1, 1).toFixed(2) + "px");

            fragment.append(mot);
        });

        noeud.replaceWith(fragment);
    });

    return Array.from(texte.querySelectorAll(".mot"));
}


/* ============================================================
   RYTHME D'ÉCRITURE
   ============================================================ */

/* Un mot long met plus de temps à s'écrire qu'un mot court */
function dureeDEcriture(mot) {
    const duree = mot.textContent.length * ECRITURE.msParLettre;
    return Math.min(ECRITURE.dureeMax, Math.max(ECRITURE.dureeMin, duree));
}

/* Pause à faire APRÈS ce mot, selon sa ponctuation et le paragraphe suivant */
function pauseApres(mot, motSuivant) {
    let pause = ECRITURE.espace;

    // Dernier signe du mot, en ignorant guillemets/parenthèses fermants
    const dernierSigne = mot.textContent.replace(/[»”") ]+$/, "").slice(-1);

    if (dernierSigne !== "" && ".!?…".includes(dernierSigne)) {
        pause += ECRITURE.pausePoint;
    } else if (dernierSigne !== "" && ",;:".includes(dernierSigne)) {
        pause += ECRITURE.pauseVirgule;
    }

    // Le mot suivant est dans un autre paragraphe : grande respiration
    if (motSuivant && mot.closest("p") !== motSuivant.closest("p")) {
        pause += ECRITURE.pauseParagraphe;
    }

    return pause;
}


/* ============================================================
   ÉCRITURE MOT À MOT
   ============================================================ */
function commencerAEcrire() {
    if (MOUVEMENT_REDUIT) {
        toutAfficher();
        return;
    }
    ecrireLeMotSuivant();
}

function ecrireLeMotSuivant() {
    if (indexMot >= mots.length) {
        terminerLaLettre();
        return;
    }

    const mot = mots[indexMot];
    const motSuivant = mots[indexMot + 1];
    const duree = dureeDEcriture(mot);

    // La durée est donnée au CSS, qui fait l'animation "plume"
    mot.style.setProperty("--duree-mot", duree + "ms");
    mot.classList.add("est-ecrit");
    suivreLEcriture(mot);

    indexMot++;

    // Le mot suivant commence un peu AVANT que celui-ci soit fini :
    // l'écriture reste fluide, comme une vraie main qui enchaîne.
    minuteurEcriture = setTimeout(ecrireLeMotSuivant, duree * 0.8 + pauseApres(mot, motSuivant));
}

/* Bouton "afficher toute la lettre" : tout le reste apparaît d'un coup */
function toutAfficher() {
    clearTimeout(minuteurEcriture);

    mots.slice(indexMot).forEach(function (mot) {
        mot.classList.add("est-ecrit", "instant");
    });
    indexMot = mots.length;

    terminerLaLettre();
}

function terminerLaLettre() {
    scene.classList.add("lettre-terminee");
}


/* ============================================================
   DÉFILEMENT AUTOMATIQUE
   ============================================================
   Quand le mot qu'on vient d'écrire arrive vers le bas de la
   zone visible, on fait descendre la lettre en douceur.
   Si elle fait défiler elle-même (pour relire), on arrête de
   la suivre quelques secondes pour ne pas lui "voler" la page.
   ============================================================ */
function suivreLEcriture(mot) {
    const ilYAPeu = Date.now() - derniereActionLectrice < ECRITURE.repitApresScroll;
    if (ilYAPeu) {
        return;
    }

    // offsetTop est mesuré depuis le haut du contenu de .lettre__contenu
    const basDuMot = mot.offsetTop + mot.offsetHeight;
    const limiteVisible = contenu.scrollTop + contenu.clientHeight * 0.8;

    if (basDuMot > limiteVisible) {
        contenu.scrollTo({
            top: basDuMot - contenu.clientHeight * 0.62,
            behavior: "smooth",
        });
    }
}

function noterUneActionDeLectrice() {
    derniereActionLectrice = Date.now();
}


/* ============================================================
   L'OUVERTURE — la séquence complète, étape par étape
   ============================================================ */
async function ouvrirLaLettre() {
    if (lettreOuverte) {
        return;
    }
    lettreOuverte = true;

    arreterLeFlottement();

    // 1. Le cachet se brise
    scene.classList.add("sceau-casse");
    await attendre(DUREES.sceau * 0.55);

    // 2. Le rabat s'ouvre, quelques pétales s'échappent
    scene.classList.add("rabat-ouvert");
    lancerLesEclats();
    await attendre(DUREES.rabat * 0.9);

    // 3. La lettre glisse hors de l'enveloppe
    scene.classList.add("lettre-sortie");
    await attendre(DUREES.sortie);

    // 4. Elle passe devant, l'enveloppe s'en va, la lettre vient au centre
    scene.classList.add("lettre-devant", "enveloppe-partie");
    await attendre(DUREES.envol);

    // 5. Elle se déplie (volet du haut, puis volet du bas)
    scene.classList.add("lettre-depliee");
    await attendre(DUREES.depli + DUREES.entreVolets);

    // 6. Place à la lecture
    scene.classList.add("en-lecture");
    contenu.focus({ preventScroll: true });   // pour pouvoir défiler au clavier
    await attendre(MOUVEMENT_REDUIT ? 1 : 500);

    commencerAEcrire();
}


/* ============================================================
   FONCTION : arreterLeFlottement()
   ============================================================
   Si on retirait simplement l'animation de flottement,
   l'enveloppe "sauterait" d'un coup à sa position de départ.
   Astuce : on lit sa position actuelle, on la fige en style
   inline, on retire l'animation, puis on la ramène à zéro avec
   une transition douce.
   ============================================================ */
function arreterLeFlottement() {
    flottant.style.transform = getComputedStyle(flottant).transform;
    flottant.classList.remove("flotte");

    // Force le navigateur à appliquer la position figée AVANT la transition
    flottant.getBoundingClientRect();

    flottant.style.transition = "transform .5s ease-out";
    flottant.style.transform = "none";
}


/* ============================================================
   DÉCOR : pétales qui tombent + éclats à l'ouverture
   ============================================================ */
function semerLesPetales() {
    if (MOUVEMENT_REDUIT) {
        return;
    }

    const nombre = window.innerWidth < 600 ? 9 : 16;

    for (let i = 0; i < nombre; i++) {
        const petale = document.createElement("span");
        petale.className = "petale";

        petale.style.setProperty("--x", hasard(0, 100).toFixed(1) + "vw");
        petale.style.setProperty("--taille", hasard(8, 17).toFixed(1) + "px");
        petale.style.setProperty("--duree", hasard(14, 26).toFixed(1) + "s");
        // Délai négatif : les pétales sont déjà en train de tomber au chargement
        petale.style.setProperty("--delai", (-hasard(0, 26)).toFixed(1) + "s");
        petale.style.setProperty("--derive", hasard(-60, 60).toFixed(0) + "px");
        petale.style.setProperty("--opacite", hasard(0.35, 0.75).toFixed(2));

        ambiance.append(petale);
    }
}

function lancerLesEclats() {
    if (MOUVEMENT_REDUIT) {
        return;
    }

    for (let i = 0; i < 16; i++) {
        const eclat = document.createElement("span");

        // 10 pétales, 4 cœurs, 2 étincelles dorées
        if (i < 10) {
            eclat.className = "eclat eclat--petale";
        } else if (i < 14) {
            eclat.className = "eclat eclat--coeur";
            eclat.textContent = "♥";
        } else {
            eclat.className = "eclat eclat--etincelle";
            eclat.textContent = "✦";
        }

        eclat.style.setProperty("--dx", hasard(-170, 170).toFixed(0) + "px");
        eclat.style.setProperty("--dy", hasard(-280, -120).toFixed(0) + "px");
        eclat.style.setProperty("--tourne", hasard(-220, 220).toFixed(0) + "deg");
        eclat.style.setProperty("--delai", hasard(0, 300).toFixed(0) + "ms");
        eclat.style.setProperty("--taille", hasard(9, 16).toFixed(0) + "px");

        // Une fois son animation finie, l'éclat est retiré de la page
        eclat.addEventListener("animationend", function () {
            eclat.remove();
        });

        eclats.append(eclat);
    }
}


/* ============================================================
   INITIALISATION
   (le script est chargé avec "defer" : la page est déjà prête)
   ============================================================ */
transmettreLesDureesAuCSS();
mots = decouperEnMots();
calculerLEchelle();
semerLesPetales();

window.addEventListener("resize", calculerLEchelle);

// Un clic n'importe où sur l'enveloppe (ou Entrée sur le cachet) ouvre la lettre
enveloppe.addEventListener("click", ouvrirLaLettre);

boutonPasser.addEventListener("click", toutAfficher);
boutonRejouer.addEventListener("click", function () {
    window.location.reload();
});

// Si elle fait défiler la lettre elle-même, on le note
["wheel", "touchstart", "touchmove", "keydown", "mousedown"].forEach(function (evenement) {
    contenu.addEventListener(evenement, noterUneActionDeLectrice, { passive: true });
});

// Quand l'encre d'un mot est sèche, on fait le ménage (voir .sec dans le CSS)
texte.addEventListener("animationend", function (evenement) {
    const nom = evenement.animationName;
    if (nom === "secher" || nom === "apparaitre") {
        evenement.target.classList.add("sec");
    }
});

// On attend les polices (max 2,5 s) avant de faire apparaître la scène,
// pour éviter de voir le texte changer de police sous nos yeux.
Promise.race([document.fonts.ready, attendre(2500)]).then(function () {
    calculerLEchelle();
    document.body.classList.add("pret");
});
