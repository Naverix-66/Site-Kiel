/* ============================================================
   SAUVEGARDE
   ============================================================
   Tout l'état du jeu tient dans UN objet, ETAT, rangé dans
   localStorage sous une seule clé. Deux règles :

   1. On ne met dans ETAT que ce qui doit survivre à un
      rechargement (progression, indices trouvés, verrous
      ouverts). Tout ce qui est "où on en est dans l'écran"
      reste en mémoire dans os.js.
   2. Quand on ajoute un champ, on l'ajoute AUSSI dans
      ETAT_NEUF, sinon une vieille sauvegarde n'aura pas le
      champ et on se retrouve avec des undefined partout.
   ============================================================ */


function etatNeuf() {
    return {

        /* --- où on en est dans l'histoire --- */
        acte: 0,                  // 0 = l'enveloppe, 1 à 4 = les actes, 5 = épilogue
        enveloppeOuverte: false,
        motLu: false,
        photoRetournee: false,
        telephoneDeverrouille: false,

        /* --- les verrous internes du téléphone --- */
        verrous: {
            albumPrive: false,
            mouchard: false,
            coffre: false,
        },

        /* --- ce que la joueuse a trouvé --- */
        indices: [],              // identifiants d'indices, dans l'ordre de découverte
        lus: {},                  // "fil:mira", "note:3", "mail:7"… -> true
        objectifs: {},            // identifiant d'objectif -> true quand il est rempli
        deductions: {},           // identifiant de déduction -> true quand elle est validée
        chronoValidee: false,
        ordreChrono: null,        // l'ordre dans lequel la joueuse a posé les traces
        epinglePosee: null,       // identifiant du lieu épinglé en acte III
        epinglesRatees: [],       // les lieux proposés à tort (Mira commente)

        /* --- la discussion en direct avec Mira --- */
        messagesAjoutes: [],      // { fil, de, t, txt, indice } empilés par le scénario
        etapesScenario: {},       // identifiant d'étape -> true (pour ne jamais rejouer)
        reponsesChoisies: {},      // identifiant de question -> identifiant de réponse

        /* --- la fin --- */
        questionsLenaRepondues: [],
        preuvesEnvoyees: false,
        epilogueVu: false,

        /* --- décor --- */
        batterie: BATTERIE_DEPART,
        demarreLe: Date.now(),
        numeroEnregistre: false,  // Mira enregistre le numéro de la joueuse sous son prénom
        sonsActives: true,
    };
}


let ETAT = etatNeuf();


/* ------------------------------------------------------------
   charger()
   ------------------------------------------------------------
   On fusionne la sauvegarde avec un état neuf : comme ça, un
   champ ajouté après coup existe toujours.
   ------------------------------------------------------------ */
function charger() {

    const neuf = etatNeuf();

    let brut = null;
    try {
        brut = window.localStorage.getItem(CLE_SAUVEGARDE);
    } catch (erreur) {
        // navigation privée : on joue sans sauvegarde, c'est tout.
        ETAT = neuf;
        return ETAT;
    }

    if (!brut) {
        ETAT = neuf;
        return ETAT;
    }

    let lu = {};
    try {
        lu = JSON.parse(brut) || {};
    } catch (erreur) {
        lu = {};
    }

    ETAT = fusionner(neuf, lu);
    return ETAT;
}


/* ------------------------------------------------------------
   fusionner(modele, lu)
   ------------------------------------------------------------
   Récursive sur les objets simples, et elle garde l'UNION des
   clés des deux côtés.

   ⚠️ C'est le piège qui nous a mordus : une première version ne
   gardait que les clés présentes dans le modèle. Or la moitié
   de la progression vit dans des dictionnaires ouverts
   (objectifs, deductions, lus, etapesScenario) qui sont VIDES
   dans le modèle. Résultat : à chaque rechargement de page, la
   joueuse perdait ses déductions et rejouait les scènes déjà
   vues. Ne jamais refermer cette union.
   ------------------------------------------------------------ */
function fusionner(modele, lu) {
    const resultat = {};

    const cles = Object.keys(modele);
    Object.keys(lu || {}).forEach(function (cle) {
        if (cles.indexOf(cle) === -1) cles.push(cle);
    });

    cles.forEach(function (cle) {
        const valeurModele = modele[cle];
        const valeurLue = lu[cle];

        const modeleEstObjet = valeurModele && typeof valeurModele === "object" && !Array.isArray(valeurModele);
        const lueEstObjet = valeurLue && typeof valeurLue === "object" && !Array.isArray(valeurLue);

        if (modeleEstObjet && lueEstObjet) {
            resultat[cle] = fusionner(valeurModele, valeurLue);
        } else if (valeurLue !== undefined) {
            resultat[cle] = valeurLue;
        } else {
            resultat[cle] = valeurModele;
        }
    });

    return resultat;
}


/* ------------------------------------------------------------
   sauvegarder()
   ------------------------------------------------------------
   Appelée très souvent (à chaque indice, chaque lecture).
   On attend 300 ms avant d'écrire pour ne pas écrire dix fois
   pendant une même animation.
   ------------------------------------------------------------ */
let minuteurDeSauvegarde = null;

function sauvegarder() {
    if (minuteurDeSauvegarde) clearTimeout(minuteurDeSauvegarde);

    minuteurDeSauvegarde = setTimeout(function () {
        minuteurDeSauvegarde = null;
        try {
            window.localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(ETAT));
        } catch (erreur) {
            // quota plein ou navigation privée : on continue sans rien dire.
        }
    }, 300);
}


/* Écriture immédiate (avant de recharger la page, par exemple). */
function sauvegarderMaintenant() {
    if (minuteurDeSauvegarde) clearTimeout(minuteurDeSauvegarde);
    minuteurDeSauvegarde = null;
    try {
        window.localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(ETAT));
    } catch (erreur) { /* tant pis */ }
}


function effacerLaSauvegarde() {
    try {
        window.localStorage.removeItem(CLE_SAUVEGARDE);
    } catch (erreur) { /* tant pis */ }
    ETAT = etatNeuf();
}


/* ------------------------------------------------------------
   PETITS RACCOURCIS DE LECTURE/ÉCRITURE
   ------------------------------------------------------------ */

// "a-t-elle déjà lu ça ?" — sert aux points bleus "non lu".
function dejaLu(clef) {
    return ETAT.lus[clef] === true;
}

function marquerLu(clef) {
    if (!ETAT.lus[clef]) {
        ETAT.lus[clef] = true;
        sauvegarder();
        return true;      // true = c'est la première fois
    }
    return false;
}

// Les verrous.
function estOuvert(nomDuVerrou) {
    return ETAT.verrous[nomDuVerrou] === true;
}

function ouvrirVerrou(nomDuVerrou) {
    ETAT.verrous[nomDuVerrou] = true;
    sauvegarder();
}

// Les étapes du scénario : on ne rejoue jamais deux fois la même scène.
function etapeFaite(id) {
    return ETAT.etapesScenario[id] === true;
}

function marquerEtape(id) {
    ETAT.etapesScenario[id] = true;
    sauvegarder();
}
