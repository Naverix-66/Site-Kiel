/* ============================================================
   L'ÉPILOGUE — le 8 octobre, cinq heures et quelque
   ============================================================
   Le jeu se referme là où il a commencé : dans les 25 m² de
   Klara, en vue de dessus, avec une ligne d'objectif en haut et
   un bouton « parler à » en bas. On ne fabrique aucune machinerie
   nouvelle pour la dernière scène — c'est la scène de
   l'appartement, telle quelle, avec un autre casting et d'autres
   dialogues.

   ------------------------------------------------------------
   L'ORDRE DES CHOSES (et pourquoi c'est cet ordre)
   ------------------------------------------------------------
   1. Bob revient par la fenêtre, avec Rosy. Tout le monde tire.
   2. LE GÂTEAU. Cakey ne le coupe pas tant qu'il manque
      quelqu'un : il ne manque plus personne, alors elle le coupe.
      Et comme Samsam ne peut pas venir, c'est le gâteau qui va
      à Samsam.
   3. LA VEILLEUSE revient. Pas par eux : ils ne peuvent pas
      descendre. Par ELLE. C'est la dernière fois qu'on la voit,
      et personne n'a le temps de dire merci.
   4. L'ÉLASTIQUE. Ce que Bob avait préparé pour le 8 octobre, et
      qu'on n'apprend qu'ici — Cakey lui en avait trouvé quatorze.
   5. LE PÉTALE, sur la table de nuit. Comme tous les matins.
      C'est la dernière action du jeu.

   ------------------------------------------------------------
   ET LA FIN
   ------------------------------------------------------------
   scene("fin") : le pixel art s'efface sur une vraie photo, et
   le texte défile. Le texte est TOUT EN HAUT de ce fichier, dans
   MOT_DE_LA_FIN, pour qu'Evan puisse le remplacer par le sien
   sans rien chercher.

   ------------------------------------------------------------
   POUR TESTER
       octobre.html?epilogue     l'appartement à l'aube
       octobre.html?fin          directement le texte de fin
   ============================================================ */


/* ============================================================
   ⚠️⚠️  EVAN : C'EST ICI QUE TU ÉCRIS TON TEXTE.  ⚠️⚠️
   ============================================================
   Une chaîne entre guillemets = une ligne à l'écran.
   Une chaîne vide "" = une ligne de blanc.
   Tu peux en mettre autant que tu veux : ça défile.

   La toute dernière carte — « Joyeux 4 ans, Klara. » — n'est pas
   dans cette liste : elle est en dessous, dans DERNIER_MOT, et
   elle reste affichée à la fin sans jamais s'en aller.

   Ce qui est écrit là est un texte PROVISOIRE. Il parle du jeu et
   pas de vous deux, exprès : c'est à toi de dire ça, pas à moi.
   ============================================================ */
const MOT_DE_LA_FIN = [

    "Le 8 octobre, à sept heures, Klara s'est réveillée.",
    "",
    "La fenêtre était fermée.",
    "Le pyjama de Samsam était recousu, un peu de travers.",
    "Et il y avait une pétale de rose sur sa table de nuit,",
    "comme tous les matins.",
    "",
    "Elle n'a rien remarqué.",
    "",
    "C'est exactement ce qu'ils voulaient.",
    "",
    "",
    "",
    "Personne, ici, ne peut marcher.",
    "Personne ne peut parler, ni descendre douze mètres le long",
    "d'un mur, ni tenir tête à une mouette de Kiel.",
    "",
    "Mais tout le monde, ici, t'attend.",
    "Tous les jours. Depuis le début.",
    "",
    "",
    "",
    "Il y a quatre ans, un 8 octobre.",
    "",
];


// La carte qui reste. Deux lignes au maximum : c'est la dernière
// chose qu'on lit, il ne faut pas qu'elle soit longue.
const DERNIER_MOT = "Joyeux 4 ans, Klara.";
const DERNIER_MOT_PETIT = "— 8 octobre";


/* ------------------------------------------------------------
   LA PHOTO
   ------------------------------------------------------------
   Dépose la vraie photo de vous deux ici :

       10/assets/photos/nous.jpg

   Rien d'autre à faire. Tant qu'elle n'y est pas, la fin se joue
   sur la façade de l'immeuble au lever du jour, avec la fenêtre
   allumée — c'est déjà juste, mais ce n'est pas vous.
   ------------------------------------------------------------ */
const CHEMIN_PHOTO = "assets/photos/nous.jpg";


// Le seul objet que l'épilogue ajoute. Pas d'icône : il n'y en a pas
// sur la planche, et un objet sans icône garde son nom seul.
OBJETS.elastique = { nom: "Un élastique rouge (un joli)" };


/* ============================================================
   ENTRER DANS L'ÉPILOGUE
   ============================================================ */
function commencerLEpilogue() {
    memoire.acte = 5;
    noter("cour_finie");
    sauvegarder();
    go("appartement", "studio");
}


/* Dès que la cour est finie, l'appartement se rejoue en mode
   épilogue — y compris si Klara recharge la page après la fin.

   ⚠️ SAUF si l'adresse demande explicitement un acte antérieur.
   C'est la même règle que dans octobre.js : les raccourcis d'adresse
   passent AVANT la sauvegarde. Sans cette ligne, ?acte2 rouvrait
   l'appartement... avec le casting de l'épilogue et « Il reste le
   pétale » écrit en haut, parce que la partie enregistrée était
   finie. (Attrapé en relisant les trois premiers actes après coup :
   une porte neuve peut casser une porte ancienne.) */
function epilogueEnCours() {
    if (typeof memoire === "undefined") return false;
    if (typeof location !== "undefined" && /[?&](neuf|acte2)\b/.test(location.search)) {
        return false;
    }
    return saitQue("cour_finie");
}


/* ============================================================
   LE CASTING DE L'ÉPILOGUE
   ============================================================
   Tout le monde est sous la fenêtre, là où Samsam est couché
   depuis le début de la nuit. Pas au milieu du tapis : Samsam ne
   peut pas venir, donc c'est la fête qui vient à lui. Personne ne
   le dit, et c'est toute la scène.
   ============================================================ */
const CASTING_EPILOGUE = [

    {
        cle: "samsam", x: 2, y: 1,
        verbe: "Parler à Samsam",
        action: samsamALaFin,
        zone: { largeur: 2, hauteur: 1 },
    },

    // ⚠️ Personne en (5, 2) : c'est là que Bob atterrit en rentrant
    // par la fenêtre. Cakey y était, et comme elle fait une fois et
    // demie sa taille, elle le cachait entièrement — on arrivait dans
    // l'épilogue sans voir son propre personnage.
    {
        cle: "cakey", x: 8, y: 2,
        verbe: verbeCakeyALaFin,
        action: cakeyALaFin,
        priorite: 1,
    },

    {
        cle: "doudou", x: 10, y: 3,
        verbe: "Parler à Doudou",
        action: doudouALaFin,
    },

    {
        cle: "rosy", x: 3, y: 3,
        verbe: verbeRosyALaFin,
        action: rosyALaFin,
        priorite: 1,
    },

    {
        cle: "bluey", x: 6, y: 4,
        verbe: "Parler à Bluey",
        action: blueyALaFin,
    },

    {
        cle: "fraisy", x: 9, y: 4,
        verbe: "Parler à Fraisy",
        action: fraisyALaFin,
    },

];


const DECOR_EPILOGUE = [

    {
        x: 4, y: 0, largeur: 3, hauteur: 1,
        verbe: verbeFenetreALaFin,
        action: laFenetreALaFin,
        priorite: 1,
    },

    {
        x: 1, y: 4, largeur: 1, hauteur: 1,
        verbe: verbeTableDeNuitALaFin,
        action: laTableDeNuitALaFin,
        priorite: 1,
    },

    { x: 1, y: 10, largeur: 5, hauteur: 2, verbe: "Klara", action: klaraDort },
    { x: 7, y: 5, largeur: 7, hauteur: 7, verbe: "Le tapis blanc", action: leTapisALaFin },

];


/* ============================================================
   L'INSTALLATION
   ============================================================
   Appelée par installerStudio() (histoire.js) à la place de
   demarrerActeI().
   ============================================================ */
function installerEpilogue() {

    // Bob n'est plus « sorti par la fenêtre » : il vient d'y
    // rentrer. Sans cette ligne, la scène le laisse figé et caché.
    if (typeof acte2 !== "undefined") acte2.sorti = false;

    // Et il ne marche plus tout seul : une scène quittée en plein
    // déplacement scripté laisserait le drapeau levé pour toujours.
    bobScripte = false;

    installerCasting(CASTING_EPILOGUE);
    installerDecor(DECOR_EPILOGUE);
    preparerLaVie();

    // Samsam a récupéré son pyjama : Doudou a défait le nœud et l'a
    // recousu pendant que Bob remontait. C'est la première chose
    // qu'on voit, et elle ne demande aucune explication.
    APPARENCES.samsam = "samsam";
    if (PELUCHES.samsam) changerDeTenue(PELUCHES.samsam, "samsam");

    // La chambre est froide et bleue : sa veilleuse est encore dans
    // l'herbe de la cour. C'est le seul trou qui reste à boucher.
    if (!saitQue("epi_veilleuse")) changerDeNuit("nuit_sans_veilleuse", 0);

    // Partie rechargée après la rentrée : la fenêtre est déjà fermée,
    // donc plus de vent. Sans ça, le froid revenait tout seul.
    if (saitQue("epi_arrive")) son.fenetreFermee = true;

    // La musique de l'appartement revient. Celle du dehors s'arrête
    // avec la nuit du dehors.
    if (typeof musiqueDuDehors === "function") musiqueDuDehors(false);

    verifierLePlan(PIECES.studio);

    if (!saitQue("epi_arrive")) laRentree();
    else rafraichirObjectif();
}


/* ------------------------------------------------------------
   LA LIGNE DU HAUT, ET LA BULLE « ! »
   ------------------------------------------------------------ */
function objectifEpilogue() {
    if (!saitQue("epi_arrive")) return "";
    if (!saitQue("epi_gateau")) return "Il ne manque plus personne.";
    if (!saitQue("epi_veilleuse")) return "Quelque chose a tapé contre la vitre.";
    if (!saitQue("epi_elastique")) return "Le 8 octobre a commencé.";
    return "La pétale de ce matin n'est pas encore posée.";
}


function bullesEpilogue() {
    if (typeof marquerDuNeuf !== "function") return;
    if (!saitQue("epi_gateau")) { marquerDuNeuf("cakey", true); return; }
    if (!saitQue("epi_veilleuse")) return;     // c'est la fenêtre : pas de bulle
    if (!saitQue("epi_elastique")) { marquerDuNeuf("rosy", true); return; }
}


/* ============================================================
   FAIRE MARCHER BOB PENDANT QU'ON LIT
   ============================================================
   Evan : « quand Bob ferme la fenêtre, on fait une petite
   animation de lui qui bouge vers la fenêtre, et on coupe le
   bruit du vent. » Il a raison : « Bob la ferme » écrit dans une
   boîte de dialogue, ce n'est pas une action, c'est un résumé.

   scene_appartement.js remet Bob en posture d'attente à chaque
   image pendant un dialogue — d'où le drapeau, qu'il consulte.
   ============================================================ */
let bobScripte = false;

function bobMarcheToutSeul() {
    return bobScripte;
}


function bobVaVers(tuileX, tuileY, duree, quandFini) {

    const bob = get("bob")[0];
    if (!bob) { if (quandFini) quandFini(); return; }

    const depart = bob.pos;
    const arrivee = vec2(tuileX * TAILLE_TUILE, tuileY * TAILLE_TUILE);
    const ecart = arrivee.sub(depart);
    const debut = time();

    bobScripte = true;
    bob.direction = Math.abs(ecart.x) > Math.abs(ecart.y)
        ? "cote" : (ecart.y < 0 ? "haut" : "bas");
    bob.flipX = bob.direction === "cote" && ecart.x < 0;
    jouerAnimation(bob, "marche-" + bob.direction);

    const pas = onUpdate(function () {
        const k = Math.min(1, (time() - debut) / duree);
        bob.pos = depart.add(ecart.scale(k));
        if (k < 1) return;
        pas.cancel();
        bobScripte = false;
        jouerAnimation(bob, "idle-" + bob.direction);
        if (quandFini) quandFini();
    });
}


/* ============================================================
   1. LA RENTRÉE
   ============================================================ */
function laRentree() {

    // Bob et Rosy arrivent sur le rebord. La caméra est donc là, et
    // on voit toute la pièce derrière eux.
    // Il atterrit SUR LE PARQUET, à deux pas du rebord : il lui reste
    // donc un chemin à faire pour aller la fermer, et on le verra le
    // faire.
    const bob = get("bob")[0];
    if (bob) {
        bob.pos = vec2(5.5 * TAILLE_TUILE, 3.6 * TAILLE_TUILE);
        bob.direction = "bas";
        jouerAnimation(bob, "idle-bas");
        if (bob.ombre) { bob.ombre.hidden = false; bob.ombre.opacity = 0.28; }
        bob.hidden = false;
        bob.opacity = 1;
    }

    lancerDialogue([
        { texte: "Le rebord de la fenêtre. Six pattes attrapent Bob en même temps et le tirent à l'intérieur." },
        { texte: "Il atterrit sur le parquet, sur les fesses, avec Rosy sur lui." },
        { qui: "bluey", texte: "ILS SONT LÀ !!! ILS SONT LÀ ILS SONT LÀ ILS SONT LÀ !!" },
        { qui: "fraisy", texte: "ROSY ! t'as une odeur de brindille ! t'as une odeur de brindille et de— attends, tu sens la mer ?" },
        { qui: "rosy", texte: "Est-ce que quelqu'un a froid ? Bluey, tu as les oreilles gelées." },
        { qui: "bluey", texte: "JE M'EN FICHE DE MES OREILLES !!" },
        { texte: "Doudou est assis contre le mur, sous la fenêtre. Il tient un bout de pyjama et une aiguille, et il n'a pas levé les yeux." },
        { qui: "doudou", texte: "Ferme la fenêtre, mon grand.", quand: bobVaALaFenetre },
        { texte: "Bob monte sur le rebord. Les deux battants sont grands ouverts depuis minuit." },
        { texte: "Il pousse le premier. Il pousse le deuxième.", quand: fermerLaFenetreDeKlara },
        { texte: "Et le froid s'arrête. D'un coup, comme on coupe le son." },
        { texte: "C'est la première fois de toute la nuit.", quand: bobRedescendDuRebord },
        { qui: "doudou", texte: "Voilà." },
        { texte: "Sur le lit, la bosse sous la couette n'a pas bougé d'un centimètre. Klara dort depuis le début et elle n'a rien entendu." },
        { qui: "bob", texte: "Elle n'a rien entendu ?" },
        { qui: "cakey", texte: "rien du tout. pas une fois." },
        { qui: "cakey", texte: "on a été très forts." },
        { qui: "samsam", texte: "Bob." },
        { texte: "Samsam est toujours couché au même endroit, sous la fenêtre, dans la même position que quand Bob l'a trouvé il y a quatre heures." },
        { texte: "Il a son pyjama sur lui. Il y a une couture neuve, un peu de travers, qui fait le tour du ventre." },
        { qui: "samsam", texte: "Tu es rentré." },
        { qui: "bob", texte: "Tu m'as tenu." },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Oui." },
        { texte: "C'est tout ce qu'il dit. Et c'est la première fois de la nuit qu'il ne s'excuse pas." },
    ], function () {
        noter("epi_arrive");
        rafraichirObjectif();
        if (typeof jouerSon === "function") jouerSon("revelation", { volume: 0.5 });
    });
}


function bobVaALaFenetre() {
    bobVaVers(5.5, 1.9, 1.1);
}


function fermerLaFenetreDeKlara() {
    // Le vent s'arrête ICI, sur cette réplique-là, et pas une seconde
    // avant : c'est le seul moment du jeu où le silence est un
    // évènement.
    son.fenetreFermee = true;
    if (typeof volumeDeBoucle === "function") volumeDeBoucle("vent", 0);
    if (typeof jouerSon === "function") jouerSon("porteFerme", { volume: 0.5 });
}


function bobRedescendDuRebord() {
    bobVaVers(5.5, 3.4, 0.9);
}


/* ============================================================
   2. LE GÂTEAU
   ============================================================ */
function verbeCakeyALaFin() {
    if (!saitQue("epi_gateau")) return "Cakey attend";
    return "Parler à Cakey";
}


function cakeyALaFin() {

    if (saitQue("epi_gateau")) {
        lancerDialogue([
            { qui: "cakey", texte: "il en reste, Bob. il en restera toujours." },
            { qui: "cakey", texte: "c'est le principe d'un gâteau qu'on partage : il est plus grand après." },
            { qui: "bob", texte: "C'est pas comment ça marche, Cakey." },
            { qui: "cakey", texte: "je sais. mais dis-le à personne." },
        ]);
        return;
    }

    lancerDialogue([
        { qui: "cakey", texte: "bon." },
        { texte: "Cakey se met au milieu, son gâteau dans les pattes, et elle compte. Elle compte à voix haute, comme toujours, et en pointant chacun du doigt." },
        { qui: "cakey", texte: "Bluey. Fraisy. Doudou. Samsam. Rosy." },
        { qui: "cakey", texte: "Bob." },
        { qui: "cakey", texte: "six." },
        { texte: "Elle s'arrête. C'est la première fois depuis minuit qu'elle arrive au bout de sa liste." },
        { qui: "cakey", texte: "..." },
        { qui: "cakey", texte: "six." },
        { qui: "bluey", texte: "POURQUOI ELLE PLEURE ?!" },
        { qui: "fraisy", texte: "elle pleure pas, Bluey, elle a du glaçage dans l'œil. c'est très fréquent." },
        { qui: "cakey", texte: "j'ai du glaçage dans l'œil." },
        { texte: "Elle regarde vers la fenêtre, où Samsam est couché, et elle ne bouge pas tout de suite." },
        { qui: "cakey", texte: "Samsam, tu peux te lever ?" },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Non." },
        { qui: "samsam", texte: "Pardon." },
        { qui: "cakey", texte: "parfait." },
        { texte: "Et Cakey traverse la pièce avec son gâteau et le pose par terre, à côté de la tête de Samsam.", quand: poserLeGateau },
        { qui: "cakey", texte: "on coupe ici." },
        { texte: "Personne ne fait remarquer qu'elle vient de déplacer la fête de trois mètres pour quelqu'un qui n'avait rien demandé." },
        { qui: "doudou", texte: "Cakey." },
        { qui: "cakey", texte: "oui ?" },
        { qui: "doudou", texte: "Rien." },
        { texte: "Elle coupe le gâteau en six parts. Elles ne sont pas égales : celle de Samsam est plus grande, et celle de Bluey a le plus de glaçage.", quand: couperLeGateau },
        { qui: "cakey", texte: "voilà. joyeux 8 octobre, tout le monde." },
        { qui: "bluey", texte: "JOYEUX 8 OCTOBRE !!!" },
        { qui: "fraisy", texte: "joyeux 8 octobre ! est-ce qu'on peut le refaire demain ?" },
        { qui: "doudou", texte: "Non." },
        { qui: "doudou", texte: "Le 8, c'est une fois par an. C'est même toute l'idée." },
    ], function () {
        noter("epi_gateau");
        rafraichirObjectif();
        // Elle arrive pendant qu'ils mangent : la lumière reviendra
        // toute seule, mais il faudra que Bob aille à la fenêtre.
        gratterALaFenetre();
    });
}


function poserLeGateau() {
    if (typeof jouerSon === "function") jouerSon("pop", { volume: 0.5 });
    if (PELUCHES.cakey) placerPeluche(PELUCHES.cakey, 4, 1);
}


function couperLeGateau() {
    if (typeof jouerSon === "function") jouerSon("sifflet", { volume: 0.35 });
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.5);
}


/* ============================================================
   3. LA VEILLEUSE, RAPPORTÉE
   ============================================================
   Elle prend ce qui brille. La dernière chose qu'elle fait, dans
   tout le jeu, c'est en rapporter une. On ne l'explique pas, on
   ne la remercie pas, et elle ne revient plus.
   ============================================================ */
function gratterALaFenetre() {
    if (typeof sonSynthe === "function") sonSynthe("vitre", 0.35);
    lancerDialogue([
        { texte: "Quelque chose tape contre la vitre. Deux fois, sans insister." },
        { qui: "bluey", texte: "...c'est quoi ?" },
        { qui: "fraisy", texte: "c'est rien. c'est le vent. c'est toujours le vent. sauf quand c'est pas le vent." },
    ], function () {
        rafraichirObjectif();
    });
}


function verbeFenetreALaFin() {
    if (!saitQue("epi_gateau")) return "La fenêtre";
    if (!saitQue("epi_veilleuse")) return "Regarder la fenêtre";
    return "La fenêtre";
}


function laFenetreALaFin() {

    if (!saitQue("epi_gateau")) {
        lancerDialogue([
            { texte: "La fenêtre est fermée. Dehors, la cour est grise, et on commence à distinguer le grand arbre." },
            { texte: "Le pyjama de Samsam n'y pend plus. Il est sur Samsam." },
        ]);
        return;
    }

    if (!saitQue("epi_veilleuse")) {
        lancerDialogue([
            { texte: "Bob monte sur le rebord et regarde à travers la vitre." },
            { texte: "Elle est là. Sur l'appui, de l'autre côté du verre, à trente centimètres de lui." },
            { qui: "bluey", texte: "..." },
            { qui: "fraisy", texte: "personne ne bouge. personne ne bouge, personne ne bouge, person—" },
            { texte: "Elle a quelque chose dans le bec. Quelque chose de jaune, de trapu, avec un fil qui pend." },
            { qui: "rosy", texte: "Bob. C'est—" },
            { qui: "bob", texte: "Oui." },
            { texte: "Elle pose la veilleuse sur l'appui de la fenêtre. Elle la pose vraiment : elle la met debout, et elle la lâche doucement.", quand: poserLaVeilleuseALaFin },
            { texte: "Elle est encore allumée." },
            { texte: "Puis elle recule d'un pas sur la pierre, elle regarde Bob à travers la vitre pendant un temps qui paraît très long, et elle ouvre." },
            { texte: "Et il n'y a plus rien sur l'appui de la fenêtre qu'une veilleuse jaune." },
            { qui: "bluey", texte: "ELLE A DIT MERCI ?!" },
            { qui: "doudou", texte: "Non, Bluey." },
            { qui: "doudou", texte: "Elle a rendu." },
            { qui: "bob", texte: "..." },
            { qui: "bob", texte: "J'ai repris quelque chose chez elle. Cette nuit." },
            { qui: "bob", texte: "Je crois qu'on est à égalité." },
            { texte: "Bob ouvre la fenêtre juste le temps de prendre la veilleuse, et il la referme aussitôt." },
            { texte: "Il la porte jusqu'à la table de nuit. Il la rebranche. Il la repose exactement là où elle était hier soir, tournée du même côté.", quand: rebrancherLaVeilleuse },
            { texte: "Et le studio redevient jaune." },
            { qui: "cakey", texte: "voilà." },
            { qui: "cakey", texte: "maintenant c'est bien." },
        ], function () {
            noter("epi_veilleuse");
            rafraichirObjectif();
        });
        return;
    }

    lancerDialogue([
        { texte: "La fenêtre est fermée, et il commence à faire gris dehors." },
        { texte: "Tout au fond de la cour, dans le grand arbre, il y a un tas de brindilles qu'on ne remarque pas si on ne sait pas qu'il est là." },
    ]);
}


function poserLaVeilleuseALaFin() {
    if (typeof jouerSon === "function") jouerSon("moin", { volume: 0.3 });
}


function rebrancherLaVeilleuse() {
    changerDeNuit("nuit_studio", 2.5);
    if (typeof jouerSon === "function") jouerSon("prise");
}


/* ============================================================
   4. L'ÉLASTIQUE — ce que Bob avait préparé pour le 8
   ============================================================ */
function verbeRosyALaFin() {
    if (!saitQue("epi_gateau")) return "Parler à Rosy";
    if (!saitQue("epi_elastique")) return "Rosy";
    return "Parler à Rosy";
}


function rosyALaFin() {

    if (!saitQue("epi_gateau")) {
        lancerDialogue([
            { qui: "rosy", texte: "Bob, tu devrais t'asseoir. Tu as descendu un mur." },
            { qui: "bob", texte: "Je suis descendu, oui." },
            { qui: "rosy", texte: "Deux fois." },
            { qui: "bob", texte: "La deuxième, c'était pas moi qui conduisais." },
        ]);
        return;
    }

    if (saitQue("epi_elastique")) {
        lancerDialogue([
            { qui: "rosy", texte: "Il me va ?" },
            { qui: "bob", texte: "..." },
            { qui: "bob", texte: "Oui." },
            { qui: "rosy", texte: "Tu as dit ça très vite." },
            { qui: "bob", texte: "J'avais préparé." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Rosy est assise contre le mur, sa rose dans les pattes, et elle a remis ses oreilles droites." },
        { qui: "rosy", texte: "Bob." },
        { qui: "rosy", texte: "Je t'ai fait quelque chose. Enfin — j'ai essayé. C'est dans la cuisine, et je ne sais pas si ça a tenu." },
        { qui: "rosy", texte: "C'est une crêpe." },
        { qui: "bob", texte: "..." },
        { qui: "rosy", texte: "Je sais que c'est bête. Mais Doudou a raconté Sylt une fois, et tu as fait une tête, et—" },
        { qui: "rosy", texte: "Et je me suis dit que le 8, une crêpe, c'était—" },
        { qui: "bob", texte: "Rosy." },
        { qui: "bob", texte: "Attends." },
        { texte: "Bob fouille dans la poche de son short. Il en sort d'abord la pétale, qu'il remet. Puis autre chose." },
        { texte: "Un élastique à cheveux. Rouge foncé, avec un liseré doré, un peu plus petit que les autres.", quand: sortirLElastique },
        { qui: "bob", texte: "Ça fait trois semaines que je l'ai." },
        { qui: "bob", texte: "Je l'ai demandé à Cakey. Je lui ai dit : un joli." },
        { qui: "cakey", texte: "il m'a dit « un joli »." },
        { qui: "cakey", texte: "je lui en ai trouvé quatorze." },
        { qui: "bluey", texte: "QUATORZE ?!" },
        { qui: "cakey", texte: "il a mis vingt minutes à choisir. je l'ai laissé faire." },
        { qui: "bob", texte: "Cakey." },
        { qui: "cakey", texte: "pardon." },
        { texte: "Bob tend l'élastique à Rosy. Il ne dit rien du tout, parce que c'est le seul moment du jeu où il n'a pas de phrase." },
        { qui: "rosy", texte: "..." },
        { qui: "rosy", texte: "Tu l'as gardé trois semaines." },
        { qui: "bob", texte: "Je l'ai gardé pour aujourd'hui." },
        { qui: "rosy", texte: "Bob, aujourd'hui tu as été enlevé par une mouette." },
        { qui: "bob", texte: "Oui, mais c'était quand même aujourd'hui." },
        { texte: "Rosy prend l'élastique. Elle met ses oreilles en arrière avec, très sérieusement, comme quelqu'un qui fait quelque chose d'important.", quand: donnerLElastique },
        { qui: "fraisy", texte: "OH." },
        { qui: "fraisy", texte: "oh. oh oh oh." },
        // Evan : « pourquoi Bluey ne regarde pas, j'ai pas compris ? »
        // Parce que Fraisy trouve que ce moment-là ne les regarde pas.
        // C'était dit en une demi-phrase ; maintenant c'est dit.
        { qui: "fraisy", texte: "Bluey. BLUEY. tourne-toi." },
        { qui: "bluey", texte: "POURQUOI JE ME TOURNE ?!" },
        { qui: "fraisy", texte: "parce que ce moment-là, il est pas pour nous. il est pour eux deux." },
        { qui: "bluey", texte: "..." },
        { qui: "bluey", texte: "...d'accord." },
        { texte: "Bluey se tourne vers le mur. Il met même ses pattes sur ses yeux, ce que personne ne lui avait demandé." },
        { qui: "doudou", texte: "Viens par là, Bluey. Je vais te raconter un train qui roule sur la mer." },
        { qui: "bluey", texte: "...un train qui roule sur la MER ?!" },
        { qui: "doudou", texte: "Sur la mer. Vingt minutes. Il n'y a que de l'eau des deux côtés." },
        { qui: "bluey", texte: "ET APRÈS ?!" },
        { qui: "doudou", texte: "Après, on arrive." },
    ], function () {
        noter("epi_elastique");
        rafraichirObjectif();
        if (typeof jouerSon === "function") jouerSon("revelation", { volume: 0.5 });
    });
}


function sortirLElastique() {
    prendreObjet("elastique");
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.4);
}


function donnerLElastique() {
    donnerObjet("elastique");
    if (typeof jouerSon === "function") jouerSon("pop", { volume: 0.5 });
}


/* ============================================================
   5. LE PÉTALE — la dernière action du jeu
   ============================================================ */
function verbeTableDeNuitALaFin() {
    if (!saitQue("epi_elastique")) return "La table de nuit";
    if (aObjet("petale")) return "Poser la pétale";
    return "La table de nuit";
}


function laTableDeNuitALaFin() {

    if (!saitQue("epi_elastique") || !aObjet("petale")) {
        lancerDialogue([
            { texte: "La table de nuit de Klara. Sa veilleuse, un verre d'eau à moitié plein, et un livre ouvert à l'envers sur une page qu'elle n'a pas fini de lire." },
            { texte: "Il y a un rond plus clair dans la poussière, à gauche de la veilleuse. C'est là que va la pétale, tous les matins." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Bob monte sur la table de nuit." },
        { texte: "Sa veilleuse est chaude. Le verre d'eau est à moitié plein. Le livre est retourné sur une page qu'elle finira demain." },
        { texte: "Il y a un rond plus clair dans la poussière, à gauche de la veilleuse." },
        { qui: "bob", texte: "..." },
        { texte: "Bob sort la pétale de rose. Elle est écornée sur un bord. Elle a fait toute la nuit dehors, elle est passée dans le bec d'une mouette, et elle est revenue." },
        { texte: "Bob le pose dans le rond.", quand: poserLePetaleALaFin },
        { texte: "Il l'oriente. Il recule d'un pas pour vérifier. Il le tourne encore un peu." },
        { qui: "bob", texte: "Voilà." },
        { texte: "Derrière lui, la bosse sous la couette respire lentement." },
        { qui: "bob", texte: "Bonjour, Klara." },
        { qui: "bob", texte: "Il s'est rien passé cette nuit." },
        { texte: "Il redescend. Il va se remettre exactement là où Klara l'a laissé hier soir, sur le lit, contre l'oreiller." },
        { texte: "Un par un, tout le monde retourne à sa place. Personne ne dit rien. C'est une chose qu'ils savent faire sans se le dire." },
        { texte: "Doudou est le dernier à s'asseoir. Il regarde la fenêtre, où il commence à faire gris." },
        { qui: "doudou", texte: "Bonne journée, mon grand." },
    ], function () {
        finirLeJeu();
    });
}


function poserLePetaleALaFin() {
    donnerObjet("petale");
    if (typeof sonSynthe === "function") sonSynthe("tinte", 0.35);
}


function finirLeJeu() {
    noter("epi_petale");
    memoire.acte = 6;
    sauvegarder();
    afficherCarton("Le 8 octobre", "Kiel, sept heures du matin.", function () {
        go("fin");
    });
}


/* ============================================================
   LE RESTE DU DÉCOR — ce qui ne sert à rien, et qui sert à tout
   ============================================================ */
function klaraDort() {
    lancerDialogue([
        { texte: "Klara dort sur le côté, une main sous l'oreiller, la couette remontée jusqu'au nez." },
        { texte: "Elle a un pli sur la joue, à l'endroit où le drap a appuyé toute la nuit." },
        { qui: "bob", texte: "Elle a travaillé hier. Elle travaille tous les jours." },
        { qui: "bob", texte: "Elle a déménagé dans une ville où elle ne connaissait personne, et elle a monté ce lit toute seule." },
        { qui: "bob", texte: "Je sais, j'étais dans le carton." },
        { qui: "bob", texte: "...elle est très forte." },
    ]);
}


function leTapisALaFin() {
    lancerDialogue([
        { texte: "Le grand tapis blanc en fourrure. Il est couvert de miettes de gâteau, de deux brindilles, et d'un peu de terre de la cour." },
        { qui: "bob", texte: "Il faudra nettoyer avant qu'elle se lève." },
        { qui: "fraisy", texte: "je m'en occupe !" },
        { qui: "bob", texte: "Fraisy, tu ne nettoies pas. Tu manges." },
        { qui: "fraisy", texte: "c'est une façon de nettoyer." },
    ]);
}


function samsamALaFin() {
    if (!saitQue("epi_gateau")) {
        lancerDialogue([
            { qui: "samsam", texte: "Bob." },
            { qui: "samsam", texte: "J'ai senti quand tu es arrivé au bout. La corde a fait un bruit différent." },
            { qui: "bob", texte: "Tu as tenu trois heures." },
            { qui: "samsam", texte: "Je n'avais rien d'autre à faire." },
            { qui: "bob", texte: "Samsam." },
            { qui: "bob", texte: "Tu avais quelque chose d'autre à faire, et tu ne l'as pas fait." },
            { qui: "bob", texte: "Tu as tenu, à la place." },
            { qui: "samsam", texte: "..." },
            { qui: "samsam", texte: "Oui." },
        ]);
        return;
    }
    lancerDialogue([
        { qui: "samsam", texte: "Mon pyjama sent la pluie." },
        { qui: "bob", texte: "Il a fait toute la nuit dehors." },
        { qui: "samsam", texte: "Oui." },
        { qui: "samsam", texte: "C'est la première fois qu'il va quelque part." },
        { texte: "Samsam ne dit pas « moi non plus ». Il ne le dit jamais." },
    ]);
}


function doudouALaFin() {
    if (!saitQue("epi_elastique")) {
        lancerDialogue([
            { qui: "doudou", texte: "Assieds-toi, mon grand." },
            { texte: "Doudou a une aiguille plantée dans le bras, là où il la range, et un fil crème qui pend." },
            { qui: "doudou", texte: "Quand je suis arrivé ici, j'ai mis trois jours à comprendre où j'étais." },
            { qui: "doudou", texte: "Ce n'est pas le voyage qui est long. C'est l'arrivée." },
            { qui: "bob", texte: "Et maintenant ?" },
            { qui: "doudou", texte: "Maintenant c'est chez moi." },
            { qui: "doudou", texte: "Ça prend le temps que ça prend, et un matin c'est fait." },
        ]);
        return;
    }
    lancerDialogue([
        { qui: "doudou", texte: "Tu as vu la mer, cette nuit." },
        { qui: "bob", texte: "De tout en haut de l'arbre. Il y avait des grues." },
        { qui: "doudou", texte: "Oui." },
        { qui: "doudou", texte: "C'est de ce côté-là qu'on est arrivés, avec Klara. Par le train, par le nord." },
        { qui: "doudou", texte: "Elle avait un sac trop lourd et un papier avec une adresse dessus." },
        { qui: "doudou", texte: "Elle a regardé l'immeuble longtemps avant de monter." },
        { qui: "bob", texte: "Elle avait peur ?" },
        { qui: "doudou", texte: "Non." },
        { qui: "doudou", texte: "Elle comptait les fenêtres." },
    ]);
}


function blueyALaFin() {
    const lignes = [
        [
            { qui: "bluey", texte: "BOB !! T'AS COMBIEN DE MARQUES DE BEC ?!" },
            { qui: "bob", texte: "Trois." },
            { qui: "bluey", texte: "MOI J'EN AI ZÉRO !!" },
            { qui: "bluey", texte: "...c'est mieux ou c'est moins bien ?" },
            { qui: "bob", texte: "C'est mieux." },
            { qui: "bluey", texte: "ALORS J'AI GAGNÉ !!" },
        ],
        [
            { qui: "bluey", texte: "J'AI TOUT VU !! J'AI CRIÉ TOUTE LA NUIT !!" },
            { qui: "bluey", texte: "j'ai plus de voix." },
            { qui: "bluey", texte: "ÇA S'ENTEND PAS !!" },
        ],
        [
            { qui: "bluey", texte: "Bob." },
            { qui: "bluey", texte: "...quand j'ai crié « elle arrive », tu m'as entendu ?" },
            { qui: "bob", texte: "Chaque fois." },
            { qui: "bluey", texte: "..." },
            { qui: "bluey", texte: "D'ACCORD !!" },
            { texte: "Bluey part en courant faire trois tours du tapis. C'est ce qu'il fait quand c'est trop." },
        ],
    ];
    lancerDialogue(lignes[Math.floor(Math.random() * lignes.length)]);
}


function fraisyALaFin() {
    lancerDialogue([
        { qui: "fraisy", texte: "alors. la crêpe." },
        { qui: "fraisy", texte: "j'y ai pas touché." },
        { qui: "bob", texte: "Fraisy." },
        { qui: "fraisy", texte: "j'y ai presque pas touché." },
        { qui: "fraisy", texte: "j'ai vérifié qu'elle était bonne. c'est différent. si elle était pas bonne tu aurais été déçu et j'ai pris ce risque pour toi." },
        { qui: "bob", texte: "...merci, Fraisy." },
        { qui: "fraisy", texte: "de rien !! elle est très bonne !! il en reste les trois quarts !!" },
        { qui: "fraisy", texte: "...les deux tiers." },
    ]);
}


/* ============================================================
   LA SCÈNE DE FIN
   ============================================================
   Plus de jeu. Une image, du texte qui monte, et une dernière
   carte qui reste.
   ============================================================ */
const FIN = {
    debut: 0,
    photoLargeur: 0,
    photoHauteur: 0,
    lignes: [],
    hauteurTexte: 0,
    fini: false,
    finiDepuis: 0,
    presse: false,
    ui: null,
};


/* La photo se charge à part, à la main, pour une raison simple :
   si le fichier n'est pas là, kaplay écrirait une erreur rouge dans
   la console à CHAQUE lancement du jeu. Ici, s'il manque, il ne se
   passe rien du tout, et la fin se joue sur la façade. */
(function chargerLaPhotoDeLaFin() {
    if (typeof Image === "undefined") return;
    const img = new Image();
    img.onload = function () {
        FIN.photoLargeur = img.naturalWidth || img.width;
        FIN.photoHauteur = img.naturalHeight || img.height;
        try { loadSprite("photo_de_la_fin", img); } catch (e) { /* tant pis */ }
    };
    img.onerror = function () { /* pas de photo : la façade fera l'affaire */ };
    img.src = CHEMIN_PHOTO;
})();


function laPhotoEstPrete() {
    if (typeof getSprite !== "function") return false;
    const a = getSprite("photo_de_la_fin");
    return !!(a && a.data);
}


const DEFILEMENT_FIN = 30;        // pixels par seconde
const INTERLIGNE_FIN = 1.7;


// Assez grand pour se lire de loin sur un PC, assez petit pour tenir
// sur un écran de téléphone sans que chaque phrase passe sur trois
// lignes.
function tailleDuTexteDeLaFin() {
    return Math.max(13, Math.min(21, Math.round(Math.min(width(), height() * 1.5) / 36)));
}


scene("fin", function () {

    noter("fin_vue");
    sauvegarder();
    preparerLesSons();
    if (typeof musiqueDuDehors === "function") musiqueDuDehors(false);

    setCamScale(1);
    setCamPos(width() / 2, height() / 2);

    FIN.debut = time();
    FIN.fini = false;
    FIN.finiDepuis = 0;
    FIN.monte = 0;
    FIN.doigt = false;

    construireLeTexteDeLaFin();

    // Tenir l'écran (ou une touche) fait défiler plus vite. On ne peut
    // pas SAUTER : c'est la seule chose du jeu qu'on ne peut pas
    // passer, et c'est voulu.
    onTouchStart(function (p) { if (!toucheLeRetour(p)) FIN.doigt = true; });
    onTouchEnd(function (p) { FIN.doigt = false; if (toucheLeRetour(p)) revenirAuCalendrier(); });
    onMouseRelease(function () { if (toucheLeRetour(mousePos())) revenirAuCalendrier(); });

    onUpdate(function () {
        setCamScale(1);
        setCamPos(width() / 2, height() / 2);
        // Lu à chaque image plutôt que mémorisé sur un événement : un
        // « relâché » qu'on rate laisserait le texte accéléré pour
        // toujours.
        FIN.presse = FIN.doigt
            || isKeyDown("space") || isKeyDown("enter") || isKeyDown("e")
            || (typeof isMouseDown === "function" && isMouseDown());
        majLeTexteDeLaFin();
    });

    onDraw(function () {
        dessinerLImageDeLaFin();
        dessinerLeFondDeLaDerniereCarte();
        dessinerLeCoeurDeLaFin();
        dessinerLeVoileDeLaFin();
    });
});


function construireLeTexteDeLaFin() {

    FIN.lignes.forEach(function (o) { destroy(o); });
    FIN.lignes = [];

    const taille = tailleDuTexteDeLaFin();
    const pas = Math.round(taille * INTERLIGNE_FIN);

    MOT_DE_LA_FIN.forEach(function (ligne, i) {
        const o = add([
            text(ligne, { size: taille, width: Math.min(width() - 50, 760), align: "center" }),
            pos(width() / 2, height() + 60 + i * pas),
            anchor("center"),
            fixed(),
            z(Z_INTERFACE + 60),
            color(...COULEUR_CREME),
            opacity(0),
            { rang: i },
        ]);
        FIN.lignes.push(o);
    });

    FIN.pas = pas;
    FIN.hauteurTexte = MOT_DE_LA_FIN.length * pas;

    // La dernière carte. Elle existe dès le début, invisible, et elle
    // ne bouge jamais : c'est elle qui reste à l'écran à la fin.
    FIN.ui = {};
    FIN.ui.grand = add([
        text(DERNIER_MOT, { size: 34, width: Math.min(width() - 50, 620), align: "center" }),
        pos(width() / 2, height() / 2 - 14),
        anchor("center"), fixed(), z(Z_INTERFACE + 62),
        color(...COULEUR_OR), opacity(0),
    ]);
    FIN.ui.petit = add([
        text(DERNIER_MOT_PETIT, { size: 15, align: "center" }),
        pos(width() / 2, height() / 2 + 34),
        anchor("center"), fixed(), z(Z_INTERFACE + 62),
        color(...COULEUR_CREME), opacity(0),
    ]);

    /* La porte de sortie (Evan). Elle n'apparaît qu'avec la dernière
       carte : avant, il n'y a rien à quitter, et une flèche visible
       pendant le texte serait une invitation à ne pas le lire. */
    FIN.ui.fondRetour = add([
        rect(10, 10, { radius: 8 }),
        pos(0, 0), anchor("left"), fixed(), z(Z_INTERFACE + 61),
        color(...COULEUR_NUIT), opacity(0),
    ]);
    FIN.ui.retour = add([
        text("<  Le calendrier", { size: 15 }),
        pos(0, 0), anchor("left"), fixed(), z(Z_INTERFACE + 62),
        color(...COULEUR_CREME), opacity(0),
    ]);
}


// Le rectangle cliquable de la flèche, ou null tant qu'elle n'est pas
// là. Un seul calcul, lu par le dessin ET par le clic : les deux ne
// peuvent pas se désaccorder.
function zoneDuRetour() {
    const ui = FIN.ui;
    if (!ui || !ui.retour || ui.retour.opacity < 0.5) return null;
    const f = ui.fondRetour;
    return {
        x: f.pos.x, y: f.pos.y - f.height / 2,
        l: f.width, h: f.height,
    };
}


function toucheLeRetour(p) {
    const z = zoneDuRetour();
    if (!z || !p) return false;
    return p.x >= z.x && p.x <= z.x + z.l && p.y >= z.y && p.y <= z.y + z.h;
}


function revenirAuCalendrier() {
    try { location.href = "../index.html"; } catch (e) { /* tant pis */ }
}


function majLeTexteDeLaFin() {

    const t = time() - FIN.debut;
    const vitesse = DEFILEMENT_FIN * (FIN.presse ? 3.2 : 1);

    // La montée, en gardant la position exacte plutôt qu'en
    // l'accumulant : sur un onglet qui a ramé, un cumul dérive.
    FIN.monte = (FIN.monte || 0) + vitesse * dt();

    const taille = tailleDuTexteDeLaFin();
    const pas = Math.round(taille * INTERLIGNE_FIN);
    FIN.pas = pas;

    /* ⚠️ On EMPILE les lignes d'après leur hauteur réelle, au lieu de
       les poser tous les « pas ». Une phrase un peu longue passe sur
       deux lignes (et Evan écrira ce qu'il veut, il n'a pas à compter
       ses caractères) : à pas fixe, elle recouvrait la suivante. */
    let y = height() + 60 - FIN.monte;
    let derniere = 0;

    FIN.lignes.forEach(function (o) {
        o.textSize = taille;
        o.width = Math.min(width() - 50, 760);
        o.pos = vec2(width() / 2, y);

        // Elles apparaissent en bas et s'effacent en haut : jamais de
        // texte coupé net par un bord d'écran.
        const hautDoux = Math.min(1, Math.max(0, (y - 30) / 110));
        const basDoux = Math.min(1, Math.max(0, (height() - y) / 110));
        o.opacity = Math.min(hautDoux, basDoux) * Math.min(1, t / 1.6);

        derniere = Math.max(derniere, y);
        y += Math.max(pas, (o.height || taille) + Math.round(taille * 0.75));
    });

    // Le texte est passé : la dernière carte arrive et ne s'en va plus.
    if (!FIN.fini && derniere < height() * 0.34) {
        FIN.fini = true;
        FIN.finiDepuis = time();
        if (typeof jouerSon === "function") jouerSon("revelation", { volume: 0.6 });
    }

    const ui = FIN.ui;
    if (!ui) return;
    const k = FIN.fini ? Math.min(1, (time() - FIN.finiDepuis) / 2.4) : 0;
    ui.grand.textSize = Math.max(24, Math.min(44, Math.round(width() / 17)));
    ui.grand.width = Math.min(width() - 50, 620);
    ui.grand.pos = vec2(width() / 2, height() / 2 - 16);
    ui.grand.opacity = k;
    ui.petit.textSize = Math.max(12, Math.min(17, Math.round(width() / 44)));
    ui.petit.pos = vec2(width() / 2, height() / 2 + ui.grand.textSize * 0.9);
    ui.petit.opacity = k * 0.75;

    // La flèche de retour, en bas à gauche, une fois tout dit.
    const apparu = Math.max(0, Math.min(1, (k - 0.55) / 0.45));
    ui.retour.textSize = Math.max(13, Math.min(17, Math.round(width() / 48)));
    ui.retour.pos = vec2(24, height() - 36);
    ui.retour.opacity = apparu * 0.9;
    ui.fondRetour.pos = vec2(14, height() - 36);
    ui.fondRetour.width = (ui.retour.width || 120) + 30;
    ui.fondRetour.height = (ui.retour.height || 18) + 18;
    ui.fondRetour.opacity = apparu * 0.55;
}


/* ------------------------------------------------------------
   Le fond de la dernière carte
   ------------------------------------------------------------
   ⚠️ Indispensable, et pas décoratif. « Joyeux 4 ans, Klara » est
   écrit en or, et la photo qu'Evan posera là est INCONNUE : si
   elle est claire — une plage, la neige, un mur blanc —, l'or
   disparaît dedans. Testé sur la façade de secours, qui est
   orangée : le texte devenait illisible.

   Alors on pose une ombre douce, seulement au milieu, seulement à
   la fin. Elle ne cache pas la photo : elle fait une place au
   texte.
   ------------------------------------------------------------ */
function dessinerLeFondDeLaDerniereCarte() {

    if (!FIN.fini) return;
    const k = Math.min(1, (time() - FIN.finiDepuis) / 2.4);
    if (k <= 0) return;

    const centre = height() / 2;
    const demi = Math.max(90, height() * 0.19);
    const bandes = 64;

    for (let i = 0; i < bandes; i++) {
        const y = centre - demi + (demi * 2 / bandes) * i;
        const d = Math.abs(y + demi / bandes - centre) / demi;
        const fondu = Math.pow(Math.max(0, 1 - d), 1.4);
        drawRect({
            pos: vec2(0, y), width: width(), height: (demi * 2 / bandes) + 1,
            color: rgb(8, 7, 12), opacity: 0.52 * fondu * k,
        });
    }
}


/* Un petit cœur peint à la main, tout en bas, une fois que tout est
   dit. Peint et pas écrit : la police du jeu est une police bitmap,
   et elle n'a pas de ♥ — un caractère qui manque, ça s'affiche en
   carré vide, et un carré vide ne veut rien dire. */
function dessinerLeCoeurDeLaFin() {
    if (!FIN.fini) return;
    const k = Math.max(0, Math.min(1, (time() - FIN.finiDepuis - 1.4) / 1.6));
    if (k <= 0) return;

    const x = width() / 2;
    const y = height() - 42;
    const r = 4.5;
    const c = rgb(...COULEUR_ACCENT);
    const o = k * 0.8 * (0.85 + Math.sin(time() * 1.8) * 0.15);

    drawCircle({ pos: vec2(x - r * 0.8, y - r * 0.5), radius: r, color: c, opacity: o });
    drawCircle({ pos: vec2(x + r * 0.8, y - r * 0.5), radius: r, color: c, opacity: o });
    drawTriangle({
        p1: vec2(x - r * 1.75, y - r * 0.1),
        p2: vec2(x + r * 1.75, y - r * 0.1),
        p3: vec2(x, y + r * 1.9),
        color: c, opacity: o,
    });
}


/* ------------------------------------------------------------
   L'IMAGE DE FOND
   ------------------------------------------------------------
   La vraie photo si elle est là. Sinon la façade de l'immeuble au
   lever du jour, cadrée sur la fenêtre de Klara — c'est la même
   toile que celle de l'acte III, il n'y a rien de neuf à peindre.
   ------------------------------------------------------------ */
function dessinerLImageDeLaFin() {

    drawRect({ pos: vec2(0, 0), width: width(), height: height(), color: rgb(12, 11, 16) });

    const t = time() - FIN.debut;
    const apparition = Math.min(1, t / 3.5);
    // Un très léger rapprochement, tout du long : une image
    // parfaitement immobile pendant quarante secondes a l'air en
    // panne.
    const zoom = 1.04 + Math.min(0.10, t * 0.0024);

    if (laPhotoEstPrete() && FIN.photoLargeur > 0) {
        const ratioEcran = width() / height();
        const ratioPhoto = FIN.photoLargeur / FIN.photoHauteur;
        let l, h;
        if (ratioPhoto > ratioEcran) { h = height() * zoom; l = h * ratioPhoto; }
        else { l = width() * zoom; h = l / ratioPhoto; }
        drawSprite({
            sprite: "photo_de_la_fin",
            pos: vec2(width() / 2, height() / 2),
            width: l, height: h, anchor: "center",
            opacity: apparition,
        });
    } else {
        dessinerLaFacadeALAube(zoom, apparition);
    }

    /* Un voile sombre, plus dense en haut et en bas : c'est ce qui
       rend le texte lisible sur n'importe quelle photo, claire ou
       foncée, sans avoir à la retoucher.

       ⚠️ Il s'ALLÈGE quand le texte est fini : à la dernière carte,
       il ne reste que « Joyeux 4 ans, Klara », et c'est la photo
       qu'on doit regarder, pas le voile. */
    const ouvert = FIN.fini ? Math.min(1, (time() - FIN.finiDepuis) / 2.4) : 0;
    const bandes = 22;
    for (let i = 0; i < bandes; i++) {
        const y = (height() / bandes) * i;
        const k = Math.abs(i - (bandes - 1) / 2) / ((bandes - 1) / 2);
        drawRect({
            pos: vec2(0, y), width: width(), height: height() / bandes + 1,
            color: rgb(10, 9, 14),
            opacity: (0.12 + k * 0.28) * (1 - ouvert * 0.45),
        });
    }
}


function dessinerLaFacadeALAube(zoom, apparition) {

    if (typeof FACADE === "undefined") return;

    // Le cadrage : la travée de Klara, au deuxième étage.
    const tr = FACADE.travees[FACADE.traveeDeKlara];
    const marge = 96;
    const sx = tr.x - marge;
    const sy = FACADE.baies[0] - marge;
    const sl = tr.l + marge * 2;
    const sh = sl * (height() / Math.max(1, width()));

    const l = width() * zoom;
    const h = height() * zoom;

    drawSprite({
        sprite: "facade_mur",
        pos: vec2(width() / 2, height() / 2),
        width: l, height: h, anchor: "center",
        quad: quad(sx / FACADE.L, sy / FACADE.H, sl / FACADE.L, sh / FACADE.H),
        opacity: apparition,
    });

    // Le jour qui se lève dessus : une lumière rasante, cuivrée, qui
    // vient de la gauche — c'est de ce côté-là que se lève le soleil
    // quand on regarde cette cour.
    drawRect({
        pos: vec2(0, 0), width: width(), height: height(),
        color: rgb(236, 172, 122), opacity: 0.16 * apparition,
    });
    drawRect({
        pos: vec2(0, 0), width: width() * 0.45, height: height(),
        color: rgb(255, 208, 150), opacity: 0.1 * apparition,
    });

    /* Et la fenêtre allumée : c'est là qu'ils sont tous.

       ⚠️ Sa place est CALCULÉE à partir du même cadrage que l'image,
       et pas posée à l'œil au milieu de l'écran. Premier essai : un
       rectangle jaune à 50 % / 50 %, qui tombait dans le coin de la
       vraie fenêtre peinte. Deux repères qui doivent coïncider ne se
       règlent jamais séparément. */
    const X = function (u) { return width() / 2 + (u - 0.5) * l; };
    const Y = function (v) { return height() / 2 + (v - 0.5) * h; };

    const x0 = X((tr.x + 8 - sx) / sl);
    const x1 = X((tr.x + tr.l - 8 - sx) / sl);
    const y0 = Y((FACADE.baies[0] + 8 - sy) / sh);
    const y1 = Y((FACADE.baies[0] + FACADE.hauteurBaie - 10 - sy) / sh);

    drawRect({
        pos: vec2(x0, y0), width: x1 - x0, height: y1 - y0,
        color: rgb(255, 208, 138),
        opacity: (0.4 + Math.sin(time() * 1.2) * 0.025) * apparition,
    });
    for (let i = 6; i >= 1; i--) {
        drawCircle({
            pos: vec2((x0 + x1) / 2, (y0 + y1) / 2),
            radius: (x1 - x0) * (i / 4),
            color: rgb(255, 196, 120), opacity: 0.022 * apparition,
        });
    }
}


// Le noir du tout début, et rien d'autre : la scène arrive après un
// carton, il ne faut pas deux fondus l'un sur l'autre.
function dessinerLeVoileDeLaFin() {
    const t = time() - FIN.debut;
    if (t > 1.2) return;
    drawRect({
        pos: vec2(0, 0), width: width(), height: height(),
        color: rgb(10, 9, 14), opacity: 1 - t / 1.2,
    });
}


/* ============================================================
   LES RACCOURCIS
   ============================================================ */
function raccourciEpilogue() {

    if (typeof location === "undefined") return false;

    if (/[?&]epilogue\b/.test(location.search)) {
        preparerUnePartieDActeIV(6, ["petale"], ["nid_fait", "cour_finie"]);
        memoire.acte = 5;
        sauvegarder();
        try { history.replaceState(null, "", location.pathname); } catch (e) { /* tant pis */ }
        console.log("%cL'épilogue (?epilogue).", "color:#c9a876;font-weight:bold");
        return true;
    }

    return false;
}
