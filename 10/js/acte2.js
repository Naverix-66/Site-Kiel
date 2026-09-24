/* ============================================================
   ACTE II — L'ÉQUIPEMENT
   ============================================================
   Le même studio, la même nuit, dix minutes plus tard. Bob a
   voulu partir avec une corde et rien d'autre ; Doudou l'a
   retenu. Il lui faut maintenant de quoi descendre deux étages
   dans le noir et affronter une mouette — et tout est chez
   Klara. Il suffit de demander aux autres où elle le range.

   ------------------------------------------------------------
   CHACUN SON OBJET, CHACUN SON RÔLE (décidé avec Evan)

     l'arme       une baguette à sushi, au fond de la vaisselle
                  -> FRAISY sait où (elle est allée lécher le riz)
                  -> petit jeu : la tirer sans faire tomber la pile
     le bouclier  le couvercle du jus de mangue, dans le frigo
                  -> BLUEY l'a vu briller (personne ne lui a demandé)
                  -> trop serré : c'est SAMSAM qui l'ouvre, sans se
                     lever ; et FRAISY accourt pour le jus
     le casque    le dé à coudre de la boîte à couture offerte par
                  la mère de Klara, dans la penderie
                  -> CAKEY sait où (c'est là qu'elle a trouvé les
                     quatorze élastiques de Bob)
                  -> petit jeu : le prendre sans rien déranger
     la corde     le pyjama Miffy de Samsam ; DOUDOU le prépare
                  pendant tout l'acte, et fait LE nœud à la fin
     la lumière   la veilleuse jaune, qui ne marche que branchée.
                  -> DOUDOU s'en souvient (sa première nuit ici)
                  -> BLUEY hurle quand Bob la débranche
                  -> CAKEY a l'idée du phare
                  -> TOUT LE MONDE tire la rallonge (petit jeu)
                  -> elle reste à la fenêtre, allumée
     le pétale    ne sert à rien. Sauf à tout.

   Les trois premiers se cherchent dans n'importe quel ordre. La
   lumière vient en dernier, et c'est Bob qui le dit : sans elle,
   il n'y verrait plus rien pour chercher le reste.

   ------------------------------------------------------------
   COMMENT L'ACTE II SE BRANCHE SUR L'ACTE I

   Rien n'est recréé : ce sont les mêmes zones et les mêmes
   personnages. brancherActeII() change seulement ce que font
   certaines zones (le verbe et l'action), en les retrouvant par
   leur action de l'acte I. Tout le reste du décor garde son
   texte, qui tient compte de « verite » depuis longtemps.

   objectifCourant() et rafraichirBulles() (acte1.js) passent la
   main à ce fichier dès que « acte2 » est noté.

   ------------------------------------------------------------
   POUR TESTER SANS REJOUER L'ACTE I

       octobre.html?acte2      démarre l'acte II au début
                               (efface la partie en cours)

   ------------------------------------------------------------
   LES RÈGLES D'ÉCRITURE NE CHANGENT PAS (voir acte1.js)
   La narration ne décide jamais pour le joueur. Bob n'est
   jamais condescendant avec Klara. Et on n'invente pas d'objets.
   ============================================================ */


const acte2 = {
    installe: false,
    rallonge: null,
    sorti: false,
};


// Les objets de l'acte, pour l'inventaire (voir OBJETS, acte1.js).
OBJETS.baguette = { nom: "Une baguette à sushi" };
OBJETS.jus = { nom: "Un jus de mangue (fermé)" };
OBJETS.couvercle = { nom: "Un couvercle argenté" };
OBJETS.de = { nom: "Un dé à coudre" };
OBJETS.veilleuse = { nom: "La veilleuse jaune" };


// Où chacun se tient quand tout le monde est à la fenêtre (à partir
// de l'idée du phare). Aucune de ces cases ne gêne l'accès à la
// fenêtre de gauche (cases 4 à 6) ni au bureau (9 et 10).
const POSTES_FENETRE = {
    doudou: [7, 1],
    samsam: [2, 1],
    fraisy: [2, 3],
    bluey: [4, 3],
    cakey: [7, 3],
};


function armureComplete() {
    return saitQue("arme") && saitQue("bouclier") && saitQue("casque");
}


/* ============================================================
   L'OBJECTIF ET LES BULLES
   ============================================================
   L'objectif dit CE qui manque, jamais OÙ : ce sont les autres qui
   savent où Klara range les choses.
   ============================================================ */
function objectifActeII() {

    if (saitQue("depart")) return "La suite arrive bientôt.";
    if (saitQue("phare")) return "Descendre.";
    if (saitQue("rallonge")) return "Brancher la veilleuse à la fenêtre.";
    if (saitQue("veilleuse_debranchee")) return "Amener du courant jusqu'à la fenêtre.";

    const manque = [];
    if (!saitQue("arme")) manque.push("Une arme.");
    if (!saitQue("bouclier")) manque.push(aObjet("jus") ? "Un bouclier (trop serré)." : "Un bouclier.");
    if (!saitQue("casque")) manque.push("Un casque.");
    manque.push("Une lumière.");
    return manque.join(" ");
}


function bullesActeII() {

    if (saitQue("veilleuse_debranchee")) return;
    if (aObjet("jus")) { marquerDuNeuf("samsam", true); return; }
    if (!saitQue("arme") && !saitQue("indice_arme")) { marquerDuNeuf("fraisy", true); return; }
    if (!saitQue("bouclier") && !saitQue("indice_bouclier")) { marquerDuNeuf("bluey", true); return; }
    if (!saitQue("casque") && !saitQue("indice_casque")) { marquerDuNeuf("cakey", true); return; }
    if (armureComplete() && !saitQue("indice_lumiere")) { marquerDuNeuf("doudou", true); return; }
}


/* ============================================================
   DÉMARRAGE
   ============================================================
   Appelée à la fin de l'acte I (nouveau = true : on montre le
   carton), et à chaque rechargement d'une partie en cours.
   Elle remet le studio exactement dans l'état où on l'a laissé.
   ============================================================ */
function demarrerActeII(nouveau) {

    if (acte2.installe) return;
    acte2.installe = true;

    brancherActeII();

    // La plume est restée à Doudou, le pyjama est parti chez lui
    // (et les parties d'avant l'acte II avaient encore les deux).
    if (aObjet("plume")) donnerObjet("plume");
    if (aObjet("pyjama")) donnerObjet("pyjama");

    // Samsam a donné son pyjama : il porte sa planche sans pyjama
    // (dessinée par Evan), et son portrait suit.
    samsamSansPyjama();

    placerPeluche(PELUCHES.doudou, 7, 1);
    if (saitQue("jus_ouvert")) placerPeluche(PELUCHES.fraisy, 2, 3);
    if (saitQue("veilleuse_debranchee")) {
        Object.keys(POSTES_FENETRE).forEach(function (cle) {
            placerPeluche(PELUCHES[cle], POSTES_FENETRE[cle][0], POSTES_FENETRE[cle][1]);
        });
    }

    // La lumière : sur la table de nuit, dans les pattes de Bob, ou
    // à la fenêtre.
    if (saitQue("phare")) {
        changerDeNuit("nuit_phare", 0);
        poserLePhare(true);
    } else if (saitQue("veilleuse_debranchee")) {
        changerDeNuit("nuit_sans_veilleuse", 0);
    }
    if (saitQue("rallonge")) poserLaRallonge();

    if (saitQue("depart")) faireSortirBob(false);

    rafraichirObjectif();

    if (nouveau) afficherCarton("Acte II", "L'équipement", avertirSiBesoin);
    else avertirSiBesoin();
}


function samsamSansPyjama() {
    changerDeTenue(PELUCHES.samsam, "samsam_sans_pyjama");
    montrerPeluche(PELUCHES.samsam, true);
}


/* ------------------------------------------------------------
   Les zones qui changent de rôle. On les retrouve par leur
   action de l'acte I.
   ------------------------------------------------------------ */
function brancherActeII() {

    reecrireZone(laFenetre, verbeFenetreII, laFenetreII);
    reecrireZone(lEvier, verbeEvierII, lEvierII);
    reecrireZone(leFrigo, verbeFrigoII, leFrigoII);
    reecrireZone(laPenderie, verbePenderieII, laPenderieII);
    reecrireZone(laTableDeNuit, verbeTableDeNuitII, laTableDeNuitII);
    reecrireZone(leBureau, verbeBureauII, leBureauII);

    faireParler("fraisy", "Parler à Fraisy", parlerAFraisyII);
    faireParler("bluey", "Parler à Bluey", parlerABlueyII);
    faireParler("cakey", "Parler à Cakey", parlerACakeyII);
    faireParler("samsam", verbeSamsamII, parlerASamsamII);
    faireParler("doudou", "Parler à Doudou", parlerADoudouII);
}


function reecrireZone(ancienneAction, verbe, action) {
    const zone = interactions.zones.find(function (z) { return z.action === ancienneAction; });
    if (!zone) {
        console.warn("Acte II : zone introuvable pour " + ancienneAction.name);
        return;
    }
    zone.verbe = verbe;
    zone.action = action;
}


function faireParler(cle, verbe, action) {
    const zone = PELUCHES[cle] && PELUCHES[cle].zone;
    if (!zone) return;
    zone.verbe = verbe;
    zone.action = action;
}


/* ------------------------------------------------------------
   Tester l'acte II sans rejouer l'acte I : octobre.html?acte2
   ------------------------------------------------------------
   Appelée par demarrerActeI() avant tout le reste. Pose tous les
   drapeaux de l'acte I, comme si Samsam venait de donner son
   pyjama. Une seule fois : l'adresse est nettoyée ensuite, pour
   qu'un rechargement reprenne la partie au lieu de la refaire.
   ------------------------------------------------------------ */
function raccourciActeII() {

    if (typeof location === "undefined" || !/[?&]acte2\b/.test(location.search)) return false;

    memoire.drapeaux = {};
    memoire.objets = ["petale"];
    [
        "ouverture", "fenetre_vue", "bluey_lance", "bluey_1", "bluey_2", "bluey_3",
        "bluey_ok", "miroir", "cakey_bonjour", "cakey_ok", "fraisy_faim", "fraisy_ok",
        "samsam_trouve", "samsam_couvert", "samsam_ok", "bluey_retour", "verite",
        "cakey_secret", "petale", "moin", "acte2",
    ].forEach(function (d) { memoire.drapeaux[d] = true; });
    // Sinon une partie déjà rendue à l'acte III repartirait sur la
    // façade au rechargement suivant (voir sceneDeDepart, octobre.js).
    memoire.acte = 2;
    sauvegarder();
    redessinerInventaire();

    try { history.replaceState(null, "", location.pathname); } catch (e) { /* tant pis */ }
    console.log("%cActe II : partie préparée (?acte2).", "color:#c9a876;font-weight:bold");
    return true;
}


/* ============================================================
   LA FIN DE L'ACTE I — la corde, et Doudou qui retient Bob
   ============================================================
   Remplace l'ancienne sortie : Bob voulait partir tout de suite.
   Le phoque et le gâteau levé sont gardés pour le vrai départ, à
   la fin de cet acte.
   ============================================================ */
function sortirParLaFenetre() {

    lancerDialogue([
        { qui: "samsam", texte: "Tu y vas." },
        { qui: "bob", texte: "Oui." },
        { qui: "samsam", texte: "..." },
        { texte: "Samsam commence à retirer son pyjama. Ça lui prend un temps fou." },
        { qui: "bob", texte: "Samsam, qu'est-ce que tu fais." },
        { qui: "samsam", texte: "Il est grand. Il est très grand. Découpé en bandes, ça fait une corde." },
        { qui: "bob", texte: "C'est ton pyjama Miffy." },
        { qui: "samsam", texte: "Oui." },
        { qui: "bob", texte: "Tu ne l'as jamais quitté. Pas une seule nuit. Jamais." },
        { qui: "samsam", texte: "Non." },
        { qui: "samsam", texte: "Je l'aime beaucoup, ce pyjama." },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Mais à côté de Rosy, Bob, c'est un bout de tissu." },
        { qui: "bob", texte: "..." },
        { qui: "samsam", texte: "Prends-le. S'il te plaît." },
        { qui: "samsam", texte: "C'est le seul endroit où je peux aller." },
        { texte: "Bob prend le pyjama. Il est encore tiède.", quand: samsamSansPyjama },
        { texte: "Samsam garde la chaussette." },
        { texte: "" },
        { texte: "Bob grimpe sur le rebord et ouvre la fenêtre en grand. Le froid entre d'un coup, comme de l'eau." },
        { texte: "En bas, il n'y a rien. Ni la cour, ni les arbres. Deux étages de noir." },
        { texte: "Tout au fond, très loin, quelque chose brille. À peine." },
        { qui: "bob", texte: "Elle est là." },
        { qui: "doudou", texte: "Bob." },
        { qui: "doudou", texte: "Tu vois cette couture, sur mon bras ? Et celle-là, sur mon oreille ?" },
        { qui: "doudou", texte: "Un jour, je suis sorti dehors sans rien. Je suis revenu avec elles." },
        { qui: "bob", texte: "Je n'ai pas le temps, Doudou." },
        { qui: "doudou", texte: "Tu as le temps de bien faire, mon grand. C'est le seul qui compte." },
        { qui: "doudou", texte: "Une lumière pour y voir. Quelque chose pour te défendre. Quelque chose pour te protéger. Après, tu descends." },
        { qui: "doudou", texte: "Donne-moi le pyjama. Je vais préparer la corde pendant que tu cherches." },
        { texte: "Bob redescend du rebord. Il pose le pyjama dans les pattes de Doudou." },
        { qui: "bob", texte: "Où est-ce que je trouve tout ça, à deux heures du matin ?" },
        { qui: "doudou", texte: "Ici. Klara a toujours ce qu'il faut, mon grand." },
        { qui: "doudou", texte: "Demande aux autres où elle le range. Ils le savent mieux que toi et moi." },
    ].concat(avertissementDeDoudou()), function () {
        noter("averti_bruit");
        noter("acte2");
        demarrerActeII(true);
    });
}


/* ------------------------------------------------------------
   Klara dort juste là. Doudou le dit avant que Bob ne fouille
   quoi que ce soit : trop de bruit, et elle se réveille. Et si
   elle se réveille, on fait ce que toutes les peluches savent
   faire. (Voir reveil.js.)
   ------------------------------------------------------------ */
function avertissementDeDoudou() {
    return [
        { qui: "doudou", texte: "Et doucement, surtout. Klara dort juste là." },
        { qui: "doudou", texte: "Une assiette qui tombe, un bureau qui cogne, et elle se réveille." },
        { qui: "doudou", texte: "La première chose qu'on apprend, quand on est une peluche : si un humain se réveille, on ne bouge plus. On fait le mort." },
        { qui: "doudou", texte: "Tout le monde ici sait le faire. Mais mieux vaut ne pas avoir à le faire, mon grand." },
    ];
}


// Pour les parties déjà dans l'acte II (et octobre.html?acte2) : ceux
// qui n'ont pas entendu Doudou l'entendent une fois.
function avertirSiBesoin() {
    if (saitQue("averti_bruit") || saitQue("depart")) return;
    lancerDialogue(avertissementDeDoudou(), function () {
        noter("averti_bruit");
    });
}


/* ============================================================
   DOUDOU — la corde, et la mémoire de la veilleuse
   ============================================================ */
function parlerADoudouII() {

    if (saitQue("phare")) {
        lancerDialogue([
            { qui: "doudou", texte: "Le nœud est prêt. Il t'attend, comme nous tous." },
            { qui: "doudou", texte: "Quand tu veux, mon grand. Pas avant." },
        ]);
        return;
    }

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { qui: "doudou", texte: "Va, mon grand. On est tous là." },
        ]);
        return;
    }

    if (armureComplete() && !saitQue("indice_lumiere")) {
        lancerDialogue([
            { qui: "doudou", texte: "Tu as tout, Bob. Sauf la lumière." },
            { qui: "doudou", texte: "La première nuit où je suis venu ici, j'ai eu peur. Je ne connaissais rien de l'appartement, et il faisait très noir." },
            { qui: "doudou", texte: "Klara ne savait même pas que j'avais peur. Elle ne m'a rien dit." },
            { qui: "doudou", texte: "Elle a juste laissé sa veilleuse allumée. Toute la nuit. Comme tous les soirs." },
            { qui: "doudou", texte: "Je me suis endormi en la regardant." },
            { qui: "bob", texte: "La veilleuse." },
            { qui: "doudou", texte: "C'est la seule lumière d'ici qui ne s'éteint jamais, mon grand." },
        ], function () {
            noter("indice_lumiere");
            rafraichirObjectif();
        });
        return;
    }

    const trouves = combien(["arme", "bouclier", "casque"]);

    if (trouves === 0) {
        lancerDialogue([
            { texte: "Doudou a étalé le pyjama de Samsam par terre, sous la fenêtre. Il le roule, il le noue, il vérifie le nœud, et il recommence." },
            { qui: "doudou", texte: "Ne t'occupe pas de moi. Je suis lent, mais je ne m'arrête pas." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Les jambes du pyjama sont nouées aux manches. Ça fait déjà une longue corde grise, avec des petites oreilles de lapin imprimées tout du long." },
        { qui: "doudou", texte: "Il reste le plus dur : le nœud du bout, celui qui tient tout." },
        { qui: "doudou", texte: "Celui-là, je le ferai quand tu seras prêt. Pas avant." },
    ]);
}


/* ============================================================
   FRAISY — l'arme (et le jus)
   ============================================================ */
function parlerAFraisyII() {

    if (saitQue("phare")) {
        lancerDialogue([
            { qui: "fraisy", texte: "Tu sais ce que je vais faire pendant que t'es pas là ? Rien." },
            { qui: "fraisy", texte: "Enfin, finir le jus. Mais à part ça, rien. Je vais regarder la fenêtre." },
            { qui: "fraisy", texte: "C'est long, de regarder une fenêtre. Je sais pas comment fait Bluey." },
        ]);
        return;
    }

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { qui: "fraisy", texte: "On tire quand tu veux ! Moi je tire très fort. Enfin, très fort pour ma taille." },
        ]);
        return;
    }

    if (saitQue("jus_ouvert")) {
        lancerDialogue([
            { qui: "fraisy", texte: "On le boit à deux, avec Samsam. Une gorgée chacun." },
            { qui: "fraisy", texte: "Bon. Deux pour moi, une pour lui. Il a dit oui." },
            { qui: "fraisy", texte: "Il dit oui à tout, Samsam. Alors je lui en redonne une, pour que ce soit juste." },
        ]);
        return;
    }

    if (saitQue("arme")) {
        lancerDialogue([
            { qui: "fraisy", texte: "Tu l'as ! La baguette !" },
            { qui: "fraisy", texte: "Tu sais qu'on peut manger avec ? Enfin. Toi, tu vas taper avec. C'est bien aussi." },
            { qui: "fraisy", texte: "Si tu as faim en bas, tu pourras toujours... non. Il en faut deux. Oublie." },
        ]);
        return;
    }

    if (saitQue("indice_arme")) {
        lancerDialogue([
            { qui: "fraisy", texte: "Au fond de l'évier ! Sous tout le reste ! Sous le verre qui est dans l'autre verre !" },
            { qui: "fraisy", texte: "Doucement, par contre. Si la pile tombe, ça va réveiller Klara, et Klara endormie, c'est sacré." },
        ]);
        return;
    }

    lancerDialogue([
        { qui: "fraisy", texte: "Bob ! T'es revenu ! T'es pas parti ? T'as oublié quelque chose ? Moi j'oublie tout le temps quelque chose. Surtout le dessert." },
        { qui: "bob", texte: "Il me faut une arme, Fraisy." },
        { qui: "fraisy", texte: "Une arme. Une ARME. D'accord." },
        { qui: "fraisy", texte: "Une fourchette ! Non, trop de piques, tu vas te piquer toi-même. Une cuillère ! Non, une cuillère c'est pour la glace. Il reste de la glace ?" },
        { qui: "bob", texte: "Fraisy." },
        { qui: "fraisy", texte: "Pardon. Je sais ! Au fond de l'évier, tout en dessous de la vaisselle, il y a une baguette. Des sushis de mardi." },
        { qui: "fraisy", texte: "Je le sais parce que je suis allée vérifier s'il restait du riz dessus." },
        { qui: "bob", texte: "Il en restait ?" },
        { qui: "fraisy", texte: "Plus maintenant." },
    ], function () {
        noter("indice_arme");
        rafraichirObjectif();
    });
}


/* ------------------------------------------------------------
   L'évier — la pile de vaisselle, et ce qu'il y a tout au fond.
   « Quelque chose tout au fond qu'on ne peut plus identifier »,
   disait l'acte I. C'était la baguette.
   ------------------------------------------------------------ */
function verbeEvierII() {
    return saitQue("arme") ? "L'évier" : "Fouiller la vaisselle";
}


function lEvierII() {

    if (saitQue("arme")) {
        lancerDialogue([
            { texte: "La pile de vaisselle tient toujours debout. Il lui manque une baguette, et ça ne se voit pas." },
            { qui: "bob", texte: "Franchement, c'est beau." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "La pile de vaisselle. Une casserole, deux assiettes, trois fourchettes, un couvercle, un verre dans un autre verre." },
        { texte: "Et tout au fond, la chose qu'on ne pouvait plus identifier : une baguette à sushi." },
        { qui: "bob", texte: "Une arme." },
        { qui: "bob", texte: "Si je tire trop vite, tout tombe." },
        { qui: "bob", texte: "Cette pile tient debout toute seule. C'est de l'architecture. Je ne serai pas celui qui la fait tomber." },
    ], function () {
        jeuDeLaVaisselle({
            puis: function () {
                lancerDialogue([
                    { texte: "La baguette sort de la pile. Rien ne bouge. Pas une fourchette." },
                    { qui: "bob", texte: "Une baguette. Une seule." },
                    { texte: "Les baguettes vont toujours par deux. L'autre a disparu le soir des sushis, comme toutes les autres baguettes du monde." },
                    { texte: "Bob la tient à deux pattes, pointe en avant. Elle est plus grande que lui." },
                    { qui: "bob", texte: "En garde." },
                ], function () {
                    prendreObjet("baguette");
                    noter("arme");
                    rafraichirObjectif();
                });
            },
        });
    });
}


/* ============================================================
   BLUEY — le bouclier, et le cri
   ============================================================ */
function parlerABlueyII() {

    if (saitQue("phare")) {
        lancerDialogue([
            { qui: "bluey", texte: "JE SURVEILLE LE PHARE !! S'IL S'ÉTEINT, JE CRIE !!" },
            { qui: "bluey", texte: "IL VA PAS S'ÉTEINDRE !! MAIS JE CRIE QUAND MÊME, AU CAS OÙ !!" },
            { qui: "bob", texte: "D'accord, Bluey." },
            { qui: "bluey", texte: "..." },
            { qui: "bluey", texte: "Tu vas avoir froid, en bas." },
        ]);
        return;
    }

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { qui: "bluey", texte: "LE SERPENT BLANC !! SOUS LE BUREAU !! C'EST UNE RALLONGE !!" },
            { qui: "bluey", texte: "C'EST UN SERPENT !! MAIS C'EST UNE RALLONGE !!" },
        ]);
        return;
    }

    if (aObjet("jus")) {
        lancerDialogue([
            { qui: "bluey", texte: "LE ROND ARGENTÉ !! TU L'AS !!" },
            { qui: "bluey", texte: "MAIS IL EST ENCORE SUR LA BOUTEILLE !! IL FAUT QUELQU'UN DE TRÈS FORT !!" },
            { qui: "bluey", texte: "PAS MOI !! MOI JE SUIS TRÈS FORT MAIS PAS POUR ÇA !!" },
        ]);
        return;
    }

    if (!saitQue("bouclier") && !saitQue("indice_bouclier")) {
        lancerDialogue([
            { qui: "bluey", texte: "BOB !! T'ES PAS PARTI !! TROP BIEN !!" },
            { qui: "bluey", texte: "ENFIN NON !! IL FAUT QUE TU PARTES !! MAIS T'ES LÀ !! TROP BIEN !!" },
            { qui: "bob", texte: "Il me faut un bouclier, Bluey." },
            { qui: "bluey", texte: "LE ROND ARGENTÉ !!" },
            { qui: "bob", texte: "Le quoi ?" },
            { qui: "bluey", texte: "DANS LE FRIGO !! TOUT AU FOND !! SUR LA PETITE BOUTEILLE JAUNE !! IL BRILLE QUAND ON OUVRE LA PORTE !! COMME UNE PIÈCE !!" },
            { qui: "bluey", texte: "JE L'AI VU QUAND T'AS PRIS LA TOMATE !! PERSONNE M'A DEMANDÉ !!" },
            { qui: "bob", texte: "..." },
            { qui: "bob", texte: "Merci, Bluey. Vraiment." },
            { qui: "bluey", texte: "BOB M'A DIT MERCI !! AVEC SA VRAIE VOIX !!" },
        ], function () {
            noter("indice_bouclier");
            rafraichirObjectif();
        });
        return;
    }

    if (armureComplete()) {
        lancerDialogue([
            { qui: "bluey", texte: "T'AS UNE ÉPÉE !! T'AS UN BOUCLIER !! T'AS UN CASQUE !!" },
            { qui: "bluey", texte: "T'ES UN CHEVALIER !! NON, T'ES BOB !! C'EST PAREIL !!" },
        ]);
        return;
    }

    if (saitQue("arme")) {
        lancerDialogue([
            { qui: "bluey", texte: "BOB !! T'AS UNE ÉPÉE !!" },
            { qui: "bob", texte: "C'est une baguette." },
            { qui: "bluey", texte: "C'EST UNE BAGUETTE !! C'EST UNE ÉPÉE !! C'EST LES DEUX !!" },
        ]);
        return;
    }

    lancerDialogue([
        { qui: "bluey", texte: "JE SURVEILLE LA FENÊTRE !! SI LA MOUETTE REVIENT, JE CRIE !!" },
        { qui: "bluey", texte: "TRÈS FORT !! COMME TOUT À L'HEURE !! MAIS PLUS FORT !!" },
    ]);
}


/* ------------------------------------------------------------
   Le frigo — le jus de mangue, et son couvercle trop serré.
   ------------------------------------------------------------ */
function verbeFrigoII() {
    if (saitQue("bouclier") || aObjet("jus")) return "Le frigo";
    return "Ouvrir le frigo";
}


function leFrigoII() {

    if (saitQue("bouclier") || aObjet("jus")) {
        lancerDialogue([
            { texte: "Le frigo ronronne dans le noir. Tout en haut, Moin regarde la fenêtre de la cuisine." },
            { qui: "bob", texte: "Moin." },
            { texte: "Moin ne répond pas. Mais il a l'air d'accord." },
        ]);
        return;
    }

    ouvrirLeFrigo();
    lancerDialogue([
        { texte: "Bob rouvre le frigo. La lumière, encore, en pleine figure." },
        { texte: "Derrière la bolognaise, tout au fond, une petite bouteille en verre de jus de mangue. Son couvercle est rond, et argenté." },
        saitQue("indice_bouclier")
            ? { qui: "bob", texte: "Le rond argenté. Bluey avait raison." }
            : { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Un bouclier." },
        { texte: "Bob attrape la bouteille à deux pattes et tourne le couvercle. Rien. Il cale ses pieds contre une courgette et tourne plus fort. Toujours rien." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Il me faut quelqu'un." },
        { texte: "Il sort la bouteille du frigo. Elle est presque aussi grande que lui." },
    ], function () {
        fermerLeFrigo();
        prendreObjet("jus");
        rafraichirObjectif();
    });
}


/* ============================================================
   SAMSAM — sans pyjama, et plus fort que tout le monde
   ============================================================
   Il ne se lève pas parce qu'il n'y arrive pas. Il aide quand
   même plus que les autres, d'une seule patte.
   ============================================================ */
function verbeSamsamII() {
    return aObjet("jus") ? "Donner le jus à Samsam" : "Parler à Samsam";
}


function parlerASamsamII() {

    if (aObjet("jus")) {
        samsamOuvreLeJus();
        return;
    }

    if (saitQue("phare")) {
        lancerDialogue([
            { qui: "samsam", texte: "Mon pyjama est très solide." },
            { qui: "samsam", texte: "Il a tenu toutes mes nuits. Il tiendra la tienne." },
        ]);
        return;
    }

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { qui: "samsam", texte: "Je tiendrai le bout." },
            { qui: "samsam", texte: "Je ne peux pas tirer debout. Mais je peux tenir." },
        ]);
        return;
    }

    if (saitQue("jus_ouvert")) {
        lancerDialogue([
            { texte: "Contre le mur, sous la fenêtre, Samsam et Fraisy partagent la bouteille de jus de mangue." },
            { qui: "samsam", texte: "Il fait moins froid, à deux." },
            { qui: "samsam", texte: "Je n'avais pas froid." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Samsam, sous la fenêtre, sans son pyjama. Il a l'air plus petit, comme ça. Il ne l'est pas." },
        { qui: "samsam", texte: "Tu cherches." },
        { qui: "bob", texte: "Oui." },
        { qui: "samsam", texte: "Si tu as quelque chose de lourd à porter. Ou de dur à ouvrir." },
        { qui: "samsam", texte: "Je ne bouge pas. Mais je suis là." },
    ]);
}


function samsamOuvreLeJus() {

    lancerDialogue([
        { qui: "bob", texte: "Samsam. Tu peux ouvrir ça ?" },
        { qui: "samsam", texte: "Oui." },
        { texte: "Samsam prend la bouteille d'une seule patte, sans se lever. Et il tourne." },
        { texte: "Le couvercle résiste. Samsam ne dit rien. Il tourne encore, tout doucement, et son bras tremble un peu." },
        { texte: "Pop.", quand: sonner("bouchon") },
        { qui: "samsam", texte: "Voilà." },
        { qui: "samsam", texte: "Pardon. C'était long." },
        { qui: "bob", texte: "C'était parfait, Samsam." },
        { texte: "Tout au fond de la cuisine, deux oreilles de fraise se dressent d'un coup.", quand: fraisyAccourt },
        { qui: "fraisy", texte: "J'ai entendu un bouchon !" },
        { texte: "Fraisy traverse tout l'appartement en quatre secondes." },
        { qui: "fraisy", texte: "Du jus de mangue ! À deux heures du matin ! C'est le meilleur moment pour du jus de mangue, tout le monde le sait." },
        { qui: "fraisy", texte: "Samsam, t'en veux ? T'en veux. On partage." },
        { qui: "fraisy", texte: "Bob, tu gardes le couvercle, et nous on garde ce qu'il y a dedans. C'est équitable." },
        { texte: "Fraisy s'assoit contre Samsam, la bouteille entre eux deux. Samsam a un peu moins froid." },
        { texte: "Bob tient le couvercle au bout de son bras. Il est rond, argenté, et il fait exactement sa taille." },
    ], function () {
        terminerLesMarches();
        donnerObjet("jus");
        prendreObjet("couvercle");
        noter("jus_ouvert");
        noter("bouclier");
        rafraichirObjectif();
    });
}


function fraisyAccourt() {
    marcherVers(PELUCHES.fraisy, 2, 3, { vitesse: 170 });
}


/* ============================================================
   CAKEY — le casque
   ============================================================ */
function parlerACakeyII() {

    if (saitQue("phare")) {
        lancerDialogue([
            { qui: "cakey", texte: "Je ne te dis pas au revoir, Bob." },
            { qui: "cakey", texte: "On ne dit pas au revoir à quelqu'un qu'on attend. On dit : à tout à l'heure." },
            { qui: "cakey", texte: "À tout à l'heure, Bob. Je garde le gâteau." },
        ]);
        return;
    }

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { qui: "cakey", texte: "Sous le bureau, Bob ! Bluey l'a vue, la rallonge." },
            { qui: "cakey", texte: "Il voit tout, Bluey. Un jour, on va tous se mettre à l'écouter, et ce sera une très belle fête." },
        ]);
        return;
    }

    if (!saitQue("casque") && !saitQue("indice_casque")) {
        lancerDialogue([
            { qui: "cakey", texte: "Bob ! Tu es encore là. Je suis contente, et je ne devrais pas l'être. Je suis contente quand même." },
            { qui: "bob", texte: "Il me faut un casque, Cakey." },
            { qui: "cakey", texte: "Un casque..." },
            { qui: "cakey", texte: "Oh ! Tu te souviens de tes quatorze élastiques ?" },
            { qui: "bob", texte: "Oui." },
            { qui: "cakey", texte: "Je les ai trouvés dans la boîte à couture de Klara. Celle que sa maman lui a offerte. Dans la penderie, derrière les pulls." },
            { qui: "cakey", texte: "Dedans, il y a un dé à coudre. Tout petit, tout dur, et à mon avis exactement de la taille de ta tête." },
            { qui: "cakey", texte: "Mais fais très, très attention, Bob. Cette boîte, Klara y tient. Chaque aiguille a sa place." },
            { qui: "bob", texte: "Je ferai attention." },
            { qui: "cakey", texte: "Je sais. C'est pour ça que c'est à toi que je le dis." },
        ], function () {
            noter("indice_casque");
            rafraichirObjectif();
        });
        return;
    }

    if (!saitQue("casque")) {
        lancerDialogue([
            { qui: "cakey", texte: "La boîte à couture, Bob. Dans la penderie, derrière les pulls." },
            { qui: "cakey", texte: "Doucement, surtout. Tu fais toujours tout doucement quand ça compte." },
        ]);
        return;
    }

    lancerDialogue([
        { qui: "cakey", texte: "Je tiens la liste de tout ce qu'on fêtera en rentrant." },
        { qui: "cakey", texte: "Rosy. Toi. Le 8. La crêpe, si elle a survécu. Et maintenant, ton casque." },
        { qui: "cakey", texte: "Ça va faire une très longue fête. Tant mieux." },
    ]);
}


/* ------------------------------------------------------------
   La penderie — la boîte à couture de la maman de Klara.
   Bob la fouille avec d'infinies précautions.
   ------------------------------------------------------------ */
function verbePenderieII() {
    if (saitQue("casque")) return "La penderie";
    return saitQue("indice_casque") ? "Ouvrir la boîte à couture" : "La penderie";
}


function laPenderieII() {

    if (saitQue("casque")) {
        lancerDialogue([
            { texte: "Les pulls, par couleur. Derrière, la boîte à couture, refermée exactement comme avant." },
            { qui: "bob", texte: "Je le rapporte demain. Promis." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "Des piles de pulls, rangées par couleur. Derrière la troisième, à côté des biscuits, une boîte à couture." },
        { texte: "C'est la maman de Klara qui la lui a offerte. Elle est rangée tout au fond, là où rien ne peut lui arriver." },
        { texte: "Bob soulève le couvercle comme on soulève quelque chose qui dort." },
        { texte: "Dedans, tout est à sa place. Les bobines, par couleur. Les aiguilles, plantées en rang dans un petit coussin. Et au milieu, un dé à coudre en métal." },
        { qui: "bob", texte: "Même ici, tout est rangé." },
        { qui: "bob", texte: "Je ne dérange rien. Rien du tout." },
    ], function () {
        jeuDeLaCouture({
            puis: function (rates) {
                lancerDialogue([
                    { texte: "Bob remet l'épingle et la bobine exactement où elles étaient, et il referme la boîte comme on borde quelqu'un." },
                    rates > 0
                        ? { texte: "Il a une petite piqûre au bout de la patte. Il ne dira rien. Ça ne se fait pas, de se plaindre d'une boîte qu'on emprunte." }
                        : { texte: "Pas une piqûre. Pas un fil de travers." },
                    { texte: "Il essaie le dé. Il lui va parfaitement. C'est un peu inquiétant." },
                    { qui: "bob", texte: "Je le rapporte demain. Promis." },
                    { texte: "Il parle à une boîte." },
                ], function () {
                    prendreObjet("de");
                    noter("casque");
                    rafraichirObjectif();
                });
            },
        });
    });
}


/* ============================================================
   LA LUMIÈRE — la veilleuse, le cri, et l'idée du phare
   ============================================================ */
function verbeTableDeNuitII() {
    if (saitQue("veilleuse_debranchee")) return "La table de nuit";
    return armureComplete() ? "Débrancher la veilleuse" : "La veilleuse";
}


function laTableDeNuitII() {

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { texte: "La table de nuit. Le verre d'eau, le livre à l'envers. Et une prise vide." },
            { qui: "bob", texte: "Elle l'aura demain soir. Promis." },
        ]);
        return;
    }

    if (!armureComplete()) {
        lancerDialogue([
            { texte: "La veilleuse jaune de Klara, sur la table de nuit. Allumée, comme toutes les nuits." },
            { qui: "bob", texte: "Une lumière." },
            { qui: "bob", texte: "Si je la prends maintenant, je n'y verrai plus rien pour chercher le reste." },
        ]);
        return;
    }

    lancerDialogue([
        { texte: "La veilleuse jaune de Klara. C'est la seule lumière de l'appartement qui ne s'éteint jamais." },
        { texte: "Bob tire sur le fil. La prise sort du mur avec un petit bruit sec.", quand: debrancherLaVeilleuse },
        { texte: "Et la veilleuse s'éteint." },
        { texte: "Tout l'appartement tombe dans le bleu." },
        { qui: "bluey", texte: "BOB !!! TU L'AS TUÉE !!!" },
        { qui: "bob", texte: "Je l'ai débranchée." },
        { qui: "bluey", texte: "ELLE MARCHE QUE BRANCHÉE !! JE LE SAIS !! JE L'AI JAMAIS DÉBRANCHÉE !! ENFIN, UNE FOIS !! J'AI EU TRÈS PEUR !!" },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Elle ne marche que branchée." },
        { qui: "bob", texte: "Et en bas, dans la cour, il n'y a pas de prise." },
        { texte: "..." },
        { qui: "cakey", texte: "Alors elle reste là-haut, Bob." },
        { qui: "bob", texte: "Cakey, il me faut une lumière." },
        { qui: "cakey", texte: "Tu en auras une. Pas dans tes pattes : à la fenêtre." },
        { qui: "cakey", texte: "On la branche, on la pose sur le rebord, tournée vers dehors, et on la laisse allumée toute la nuit. Comme un phare." },
        { qui: "cakey", texte: "D'en bas, tu la verras. Et tu sauras toujours par où remonter." },
        { qui: "cakey", texte: "On laisse toujours une lumière allumée pour ceux qu'on attend." },
        { qui: "cakey", texte: "Pourquoi tu crois que Klara la laisse allumée toutes les nuits ?" },
        { texte: "Bob regarde le bureau. L'écran est resté allumé, sur un billet d'avion." },
        { qui: "bob", texte: "..." },
        { qui: "bob", texte: "Le fil ne va pas jusqu'à la fenêtre." },
        { qui: "bluey", texte: "LE SERPENT BLANC !! SOUS LE BUREAU !! IL EST TRÈS LONG !! C'EST UNE RALLONGE !! C'EST UN SERPENT !!" },
        { qui: "cakey", texte: "Tout le monde à la fenêtre ! Samsam, tu tiendras le bout. Fraisy, Bluey, avec moi : on va tirer." },
    ], function () {
        prendreObjet("veilleuse");
        noter("veilleuse_debranchee");
        tousALaFenetre();
        rafraichirObjectif();
    });
}


function debrancherLaVeilleuse() {
    if (typeof jouerSon === "function") jouerSon("prise");
    changerDeNuit("nuit_sans_veilleuse", 0);
}


// Tout le monde se rassemble près de la fenêtre, chacun à son pas.
function tousALaFenetre() {
    Object.keys(POSTES_FENETRE).forEach(function (cle) {
        const p = PELUCHES[cle];
        const poste = POSTES_FENETRE[cle];
        if (cle === "samsam") return;       // il y est déjà, sous la fenêtre
        marcherVers(p, poste[0], poste[1], { vitesse: cle === "doudou" ? 50 : 90 });
    });
}


/* ------------------------------------------------------------
   Le bureau — la rallonge. Tout le monde tire.
   ------------------------------------------------------------ */
function verbeBureauII() {
    if (saitQue("veilleuse_debranchee") && !saitQue("rallonge")) return "Sous le bureau";
    return "Le bureau";
}


function leBureauII() {

    if (!saitQue("veilleuse_debranchee")) {
        leBureau();
        return;
    }

    if (saitQue("rallonge")) {
        lancerDialogue([
            { texte: "Sous le bureau, la rallonge part vers la fenêtre. Les écrans, eux, n'ont rien senti." },
            { qui: "bob", texte: "Tant mieux. Elle travaille dessus." },
        ]);
        return;
    }

    // Ceux qui étaient encore en chemin arrivent d'un coup : on ne
    // tire pas une rallonge avec la moitié de l'équipe.
    terminerLesMarches();

    lancerDialogue([
        { texte: "Sous le bureau, une multiprise. Les deux écrans de Klara y sont branchés, et une longue rallonge blanche, enroulée sur elle-même." },
        { qui: "bob", texte: "Pas les écrans. Elle travaille dessus." },
        { texte: "Bob attrape le bout de la rallonge. Il est coincé derrière le pied du bureau." },
        { qui: "cakey", texte: "Tous ensemble ! À trois !" },
        { qui: "bluey", texte: "TROIS !!" },
        { qui: "cakey", texte: "Bluey, on n'a pas encore dit un et deux." },
        { qui: "bluey", texte: "UN !! DEUX !! TROIS !!" },
    ], function () {
        jeuDeForce({
            titre: "Tirer la rallonge",
            consigne: "Appuie vite, tout le monde tire avec toi. Mais quand ça COINCE, arrête-toi net : le bureau cogne, et Klara dort juste à côté.",
            appuis: 20,
            fuite: 0.1,
            equipe: ["cakey", "bluey", "fraisy", "doudou"],
            cris: ["HISSEZ !!", "Encore !", "Elle bouge !", "Tirez, tirez !", "Mon gâteau ! Ça va, il va bien."],
            puis: function () {
                lancerDialogue([
                    { texte: "La rallonge se décoince d'un coup. Tout le monde tombe en arrière. Sauf Samsam." },
                    { texte: "Le bout de la rallonge est arrivé jusqu'à la fenêtre, dans la patte de Samsam. Il a tiré sans se lever. C'est lui qui a le plus tiré." },
                    { qui: "samsam", texte: "Pardon. Je ne pouvais pas me lever." },
                    { qui: "cakey", texte: "Samsam, tu viens de faire la moitié du travail." },
                    { qui: "samsam", texte: "Oh." },
                    { qui: "samsam", texte: "..." },
                    { qui: "samsam", texte: "Merci, Cakey." },
                ], function () {
                    noter("rallonge");
                    poserLaRallonge();
                    rafraichirObjectif();
                });
            },
        });
    });
}


// La rallonge, du dessous du bureau jusqu'au rebord de la fenêtre :
// un fil blanc posé par terre, dessiné sous tout ce qui se tient
// debout dans la rangée.
function poserLaRallonge() {

    if (acte2.rallonge) return;
    const T = TAILLE_TUILE;
    const points = [
        vec2(9.4 * T, 2.2 * T),
        vec2(8.4 * T, 2.55 * T),
        vec2(7.3 * T, 2.3 * T),
        vec2(6.4 * T, 1.75 * T),
        vec2(5.9 * T, 1.05 * T),
    ];

    acte2.rallonge = add([
        pos(0, 0),
        z(Z_DECOR + 1.2 * T),
        {
            draw: function () {
                drawLines({ pts: points, width: 2, color: rgb(236, 232, 224) });
            },
        },
    ]);
}


/* ============================================================
   LA FENÊTRE — le phare, puis le départ
   ============================================================ */
function verbeFenetreII() {
    if (saitQue("phare")) return "Descendre";
    if (saitQue("rallonge")) return "Brancher la veilleuse";
    return "La fenêtre";
}


function laFenetreII() {

    if (saitQue("phare")) {
        leDepart();
        return;
    }

    if (saitQue("rallonge")) {
        allumerLePhare();
        return;
    }

    if (saitQue("veilleuse_debranchee")) {
        lancerDialogue([
            { texte: "La fenêtre, ouverte en grand. La veilleuse dans les pattes de Bob ne sert à rien tant qu'elle n'est pas branchée." },
            { qui: "doudou", texte: "Il faut du courant jusqu'ici, mon grand." },
        ]);
        return;
    }

    const manque = [];
    if (!saitQue("arme")) manque.push("de quoi te défendre");
    if (!saitQue("bouclier") || !saitQue("casque")) manque.push("de quoi te protéger");
    manque.push("une lumière");

    lancerDialogue([
        { texte: "La fenêtre, ouverte en grand. Le froid entre toujours." },
        { qui: "doudou", texte: "Pas encore, mon grand. Il te manque " + joindreAvecEt(manque) + "." },
    ]);
}


function joindreAvecEt(liste) {
    if (liste.length <= 1) return liste.join("");
    return liste.slice(0, -1).join(", ") + " et " + liste[liste.length - 1];
}


function allumerLePhare() {

    lancerDialogue([
        { texte: "Bob grimpe sur le rebord avec la veilleuse. Il la pose tout au bord, tournée vers dehors.", quand: poserLaVeilleuse },
        { texte: "Samsam lui tend le bout de la rallonge. Bob branche." },
        { texte: "...", quand: phareSAllume },
        { texte: "Elle s'allume." },
        { texte: "Dehors, sur la façade, une petite tache jaune. Tout en bas, le haut des arbres de la cour attrape un peu de sa lumière." },
        { qui: "cakey", texte: "Voilà. Maintenant, on t'attend." },
        { qui: "bluey", texte: "C'EST UN PHARE !! ON A UN PHARE !! C'EST MOI QUI AI EU L'IDÉE !!" },
        { qui: "cakey", texte: "C'était mon idée, Bluey." },
        { qui: "bluey", texte: "C'EST CAKEY QUI A EU L'IDÉE !! MAIS C'EST MOI QUI AI CRIÉ !!" },
        { qui: "doudou", texte: "Il faut toujours quelqu'un pour crier, Bluey. Sinon personne ne se réveille." },
        { qui: "doudou", texte: "Le nœud est prêt, Bob. Quand tu veux." },
    ], function () {
        donnerObjet("veilleuse");
        noter("phare");
        rafraichirObjectif();
    });
}


function poserLaVeilleuse() {
    poserLePhare(false);
}


function phareSAllume() {
    poserLePhare(true);
    changerDeNuit("nuit_phare", 1.5);
    if (typeof jouerSon === "function") jouerSon("prise");
    if (typeof jouerMorceau === "function") jouerMorceau("mystique");
}


/* ------------------------------------------------------------
   LE DÉPART — le nœud, les au revoir, et Moin.
   ------------------------------------------------------------ */
function leDepart() {

    lancerDialogue([
        { qui: "doudou", texte: "Viens là, mon grand." },
        { texte: "Doudou a fait du pyjama de Samsam une longue corde crème, avec le liseré rouge qui tourne autour tout du long, et les petits boutons encore dessus." },
        { texte: "Il en attache le bout à la poignée de la fenêtre. Un seul nœud, lent, énorme. Ses pattes tremblent. Le nœud, lui, ne tremble pas." },
        { qui: "doudou", texte: "Il tiendra. Toi, tiens-le." },
        { texte: "Bob enfile le dé à coudre. Il glisse la baguette dans l'élastique de son short. Il passe le couvercle à son bras." },
        { qui: "cakey", texte: "Et le pétale, Bob ? Il sert à quoi ?" },
        { qui: "bob", texte: "À rien." },
        { qui: "bob", texte: "Je le lui rends. Comme tous les matins." },
        { qui: "samsam", texte: "Bob." },
        { qui: "samsam", texte: "Pardon de ne pas pouvoir descendre avec toi." },
        { qui: "bob", texte: "Tu descends avec moi, Samsam. Tu es la corde." },
        { qui: "samsam", texte: "..." },
        { qui: "samsam", texte: "Oui." },
        { qui: "fraisy", texte: "Et si tu vois la crêpe— non. Rien. Ramène Rosy." },
        { qui: "fraisy", texte: "Mais si la crêpe est là aussi, ce serait bête de la laisser. Je dis ça." },
        { qui: "bluey", texte: "BOB !! TU REVIENS, HEIN !!" },
        { qui: "bob", texte: "Je reviens." },
        { qui: "bluey", texte: "..." },
        { qui: "bluey", texte: "TU L'AS DIT AVEC TA VOIX DE QUAND ÇA VA ALLER." },
        { texte: "Au pied de la fenêtre, Cakey lève son gâteau bien haut, comme on lève un verre." },
        { texte: "Derrière eux, tout en haut du frigo, une petite voix." },
        { texte: "— Moin.", quand: sonner("moin") },
        { qui: "bob", texte: "Moin." },
        { texte: "Moin ne connaît qu'un mot. Ici, le même mot sert à dire bonjour et à dire au revoir." },
        { texte: "Bob passe une jambe par la fenêtre. Puis l'autre. La corde se tend.", quand: function () { faireSortirBob(true); } },
        { texte: "Et il descend." },
    ], function () {
        noter("depart");
        rafraichirObjectif();
        // Et on quitte l'appartement pour de bon : la suite se
        // joue dehors, sur la façade (acte3.js).
        afficherCarton("Fin de l'acte II", "La façade, maintenant.", commencerActeIII);
    });
}


/* ------------------------------------------------------------
   Bob passe par la fenêtre : il monte sur le rebord et disparaît.
   Ensuite, plus rien ne bouge — la caméra reste sur la fenêtre,
   le phare allumé, et tout le monde qui regarde dehors.
   ------------------------------------------------------------ */
function faireSortirBob(anime) {

    acte2.sorti = true;
    const bob = get("bob")[0];
    if (!bob) return;

    const rebord = vec2(5.5 * TAILLE_TUILE, 1.3 * TAILLE_TUILE);
    bob.direction = "haut";
    bob.flipX = false;
    jouerAnimation(bob, "idle-haut");

    if (!anime) {
        bob.pos = rebord;
        bob.hidden = true;
        if (bob.ombre) bob.ombre.hidden = true;
        return;
    }

    const depart = bob.pos;
    const debut = time();
    const montee = onUpdate(function () {
        const k = Math.min(1, (time() - debut) / 0.9);
        bob.pos = depart.lerp(rebord, k);
        bob.opacity = 1 - k * k;
        if (bob.ombre) bob.ombre.opacity = 0.28 * (1 - k);
        if (k >= 1) {
            montee.cancel();
            bob.hidden = true;
            bob.opacity = 1;
            if (bob.ombre) bob.ombre.hidden = true;
        }
    });
}


function bobEstSorti() {
    return acte2.sorti;
}


// Ce que la caméra regarde quand Bob est parti : la fenêtre.
function pointDeVueSortie() {
    return vec2(5.5 * TAILLE_TUILE, 3 * TAILLE_TUILE);
}
