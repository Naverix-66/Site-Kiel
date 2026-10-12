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
    msParLettre: 55,          // écart entre deux lettres d'un même mot
    dureeLettre: 260,         // durée du fondu d'apparition de chaque lettre
    espace: 90,               // petite respiration entre deux mots
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
let mots = [];                  // [{ element, lettres, debut }] : chaque mot et son moment d'apparition
let dureeTotale = 0;            // durée totale de l'écriture (ms)
let debutEcriture = 0;          // moment où l'écriture a commencé
let indexMot = 0;               // le dernier mot dont l'écriture a commencé
let cibleDefilement = 0;        // où la feuille doit descendre (défilement doux)
let boucle = null;              // la boucle requestAnimationFrame
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
    racine.setProperty("--duree-lettre", (MOUVEMENT_REDUIT ? 1 : ECRITURE.dureeLettre) + "ms");
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

            // Chaque lettre dans son propre <span class="c">.
            // Array.from découpe correctement les accents et les émojis.
            Array.from(morceau).forEach(function (caractere) {
                const lettre = document.createElement("span");
                lettre.className = "c";
                lettre.textContent = caractere;
                mot.append(lettre);
            });

            // Légère inclinaison au hasard : effet "écrit à la main"
            mot.style.setProperty("--penche", hasard(-1.2, 1.2).toFixed(2) + "deg");
            mot.style.setProperty("--decale", hasard(-1, 1).toFixed(2) + "px");

            fragment.append(mot);
        });

        noeud.replaceWith(fragment);
    });

    return Array.from(texte.querySelectorAll(".mot")).map(function (element) {
        return { element: element, lettres: Array.from(element.querySelectorAll(".c")), debut: 0 };
    });
}


/* ============================================================
   RYTHME D'ÉCRITURE
   ============================================================
   On calcule À L'AVANCE le moment d'apparition de chaque lettre
   (en ms depuis le début de l'écriture) et on le donne au CSS
   dans --d. Ensuite, le navigateur joue tout seul.
   ============================================================ */

/* Pause à faire APRÈS ce mot, selon sa ponctuation et le paragraphe suivant */
function pauseApres(mot, motSuivant) {
    let pause = ECRITURE.espace;

    // Dernier signe du mot, en ignorant guillemets/parenthèses fermants
    const dernierSigne = mot.element.textContent.replace(/[»”")\u202F]+$/, "").slice(-1);

    if (dernierSigne !== "" && ".!?…".includes(dernierSigne)) {
        pause += ECRITURE.pausePoint;
    } else if (dernierSigne !== "" && ",;:".includes(dernierSigne)) {
        pause += ECRITURE.pauseVirgule;
    }

    // Le mot suivant est dans un autre paragraphe : grande respiration
    if (motSuivant && mot.element.closest("p") !== motSuivant.element.closest("p")) {
        pause += ECRITURE.pauseParagraphe;
    }

    return pause;
}

function calculerLeRythme() {
    let instant = 0;

    mots.forEach(function (mot, i) {
        mot.debut = instant;

        mot.lettres.forEach(function (lettre) {
            lettre.style.setProperty("--d", Math.round(instant) + "ms");
            instant += ECRITURE.msParLettre;
        });

        instant += pauseApres(mot, mots[i + 1]);
    });

    dureeTotale = instant + ECRITURE.dureeLettre;
}


/* ============================================================
   ÉCRITURE
   ============================================================ */
function commencerAEcrire() {
    debutEcriture = performance.now();
    cibleDefilement = contenu.scrollTop;

    // Une seule classe, et toutes les lettres démarrent avec leur délai
    texte.classList.add("en-ecriture");

    if (MOUVEMENT_REDUIT) {
        toutAfficher();
        return;
    }
    boucle = requestAnimationFrame(suivreLEcriture);
}

/* Bouton "afficher toute la lettre" : les lettres pas encore écrites
   apparaissent toutes maintenant, en un fondu rapide en cascade */
function toutAfficher() {
    const maintenant = performance.now() - debutEcriture;
    let decalage = 0;

    mots.forEach(function (mot) {
        mot.lettres.forEach(function (lettre) {
            const debutPrevu = parseFloat(lettre.style.getPropertyValue("--d"));
            if (debutPrevu > maintenant) {
                lettre.style.setProperty("--d", Math.round(maintenant + decalage) + "ms");
                decalage = MOUVEMENT_REDUIT ? 0 : Math.min(decalage + 1.5, 500);
            }
        });
    });

    terminerLaLettre();
}

function terminerLaLettre() {
    cancelAnimationFrame(boucle);
    scene.classList.add("lettre-terminee");
}


/* ============================================================
   DÉFILEMENT AUTOMATIQUE
   ============================================================
   À chaque image (requestAnimationFrame, ~60 fois par seconde) :
   - on repère le mot en train de s'écrire ;
   - s'il arrive vers le bas de la zone visible, on fixe une
     nouvelle "cible" un peu plus bas ;
   - on rapproche la feuille de cette cible de 6 % de l'écart à
     chaque image : ça donne un glissement continu qui ralentit
     tout seul en arrivant (au lieu de démarrer/s'arrêter d'un coup).
   Si elle fait défiler elle-même, on la laisse tranquille un moment.
   ============================================================ */
function suivreLEcriture() {
    const ecoule = performance.now() - debutEcriture;

    if (ecoule > dureeTotale) {
        terminerLaLettre();
        return;
    }

    while (indexMot < mots.length - 1 && mots[indexMot + 1].debut <= ecoule) {
        indexMot++;
    }

    const elleLitASonRythme = Date.now() - derniereActionLectrice < ECRITURE.repitApresScroll;

    if (elleLitASonRythme) {
        cibleDefilement = contenu.scrollTop;
    } else {
        const mot = mots[indexMot].element;
        const basDuMot = mot.offsetTop + mot.offsetHeight;

        if (basDuMot > cibleDefilement + contenu.clientHeight * 0.8) {
            cibleDefilement = basDuMot - contenu.clientHeight * 0.62;
        }

        // Certains navigateurs arrondissent scrollTop au pixel : on avance
        // donc toujours d'au moins 1 px, sinon la feuille resterait bloquée
        // à quelques pixels de sa cible.
        const ecart = cibleDefilement - contenu.scrollTop;
        if (Math.abs(ecart) >= 1) {
            const pas = ecart * 0.06;
            contenu.scrollTop += Math.abs(pas) < 1 ? Math.sign(ecart) : pas;
        }
    }

    boucle = requestAnimationFrame(suivreLEcriture);
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
calculerLeRythme();
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

// On attend les polices (max 2,5 s) avant de faire apparaître la scène,
// pour éviter de voir le texte changer de police sous nos yeux.
Promise.race([document.fonts.ready, attendre(2500)]).then(function () {
    calculerLEchelle();
    document.body.classList.add("pret");
});
