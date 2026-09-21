/* ============================================================
   LE SYSTÈME DE DIALOGUE
   ============================================================
   C'est la pièce la plus importante du jeu après Bob lui-même :
   toute l'histoire passe par elle. Un jeu narratif se juge
   d'abord sur sa boîte de dialogue, avant même sur ses décors.

   Le reste du jeu ne connaît que DEUX fonctions :

       lancerDialogue(repliques, quandFini)
       dialogueEnCours()

   Tout le reste est interne à ce fichier.

   ------------------------------------------------------------
   LE FORMAT D'UNE RÉPLIQUE

       { qui: "bluey", texte: "J'AI VU UN OISEAU GÉANT !!" }

   - "qui" est une clé de PERSONNAGES (voir personnages.js).
     Absent = narration : pas de nom, pas de portrait, et un
     texte d'une couleur plus discrète.

   - une réplique peut porter un champ "choix" :

       { qui: "bob", texte: "Tu es sûr ?", choix: [
             { texte: "Le croire", quand: function () { ... } },
             { texte: "Hausser les épaules", quand: function () { ... } },
       ]}

     Les choix n'apparaissent qu'une fois la réplique ENTIÈREMENT
     écrite : sinon on choisirait avant d'avoir lu la question.

   ------------------------------------------------------------
   CE QU'IL FAUT SAVOIR SUR LES CHOIX

   Choisir FERME le dialogue en cours, puis exécute "quand".
   C'est volontaire : ça permet à "quand" de relancer un autre
   dialogue dans la foulée, ce qui est le cas 9 fois sur 10.
   En conséquence, le "quandFini" du dialogue parent n'est PAS
   appelé quand le joueur passe par un choix : c'est le choix
   qui prend la main sur la suite.
   ============================================================ */


/* ------------------------------------------------------------
   L'ÉTAT — une seule boîte de dialogue peut exister à la fois.
   ------------------------------------------------------------ */
const dialogue = {
    actif: false,
    repliques: [],
    index: 0,

    texteComplet: "",     // la réplique en entier
    reveles: 0,           // combien de caractères sont déjà écrits.
                          // Un nombre à virgule : c'est lui qu'on fait
                          // avancer au rythme du temps, et on l'arrondit
                          // seulement au moment d'afficher.
    fini: false,          // la réplique est entièrement écrite

    verrou: 0,            // secondes restantes d'insensibilité aux entrées
    quandFini: null,

    ui: null,             // les objets graphiques de la boîte
    ecouteurs: [],        // les écouteurs d'entrées, à débrancher à la fermeture
    boite: null,          // la géométrie de la boîte, en coordonnées écran

    choix: null,          // la liste de choix ouverte, ou null
    choixSelection: 0,
    zonesChoix: [],       // rectangles écran, pour savoir où on a touché

    largeurEcran: 0,
    hauteurEcran: 0,
};


function dialogueEnCours() {
    return dialogue.actif;
}


/* ============================================================
   echelleInterface()
   ============================================================
   La taille de référence de TOUT le texte d'interface du jeu :
   la boîte de dialogue, les choix, le verbe du bouton d'action,
   la ligne d'objectif.

   Elle se déduit de la plus PETITE dimension de l'écran, et pas
   de la largeur. Sinon un téléphone tenu à l'horizontale — large
   mais très plat — hériterait d'un texte énorme qui ne laisserait
   plus la place d'afficher trois lignes.
   ============================================================ */
function echelleInterface() {
    const base = Math.min(width(), height());
    return Math.round(Math.max(TAILLE_TEXTE_MIN, Math.min(TAILLE_TEXTE_MAX, base * 0.042)));
}


/* ============================================================
   lancerDialogue(repliques, quandFini)
   ============================================================ */
function lancerDialogue(repliques, quandFini) {

    // Deux dialogues en même temps, c'est toujours un bug d'appel.
    // On le dit plutôt que de l'avaler en silence.
    if (dialogue.actif) {
        console.warn("lancerDialogue : un dialogue est deja ouvert, celui-ci est ignore.");
        return;
    }
    if (!repliques || repliques.length === 0) return;

    dialogue.actif = true;
    dialogue.repliques = repliques;
    dialogue.index = -1;
    dialogue.quandFini = quandFini || null;
    dialogue.ecouteurs = [];
    dialogue.choix = null;
    dialogue.zonesChoix = [];
    dialogue.verrou = DIALOGUE_VERROU;

    dialogue.ui = construireInterfaceDialogue();
    placerInterfaceDialogue();
    brancherEntreesDialogue();

    if (typeof auDebutDuDialogue === "function") auDebutDuDialogue();

    repliqueSuivante();
}


/* ============================================================
   CONSTRUCTION DE LA BOÎTE
   ============================================================
   fixed() = collé à l'ÉCRAN et pas au monde. Sans lui, la boîte
   partirait avec la caméra dès que Bob bouge.

   Le portrait, c'est deux couches :
   - un carré de la couleur du personnage (couleurPlaceholder),
     qui suffit à reconnaître qui parle d'un coup d'œil ;
   - par-dessus, sa tête dessinée (assets/peluches/portraits/),
     quand elle existe. Elle est recréée à chaque changement
     d'interlocuteur (voir peindrePortrait).
   ============================================================ */
function construireInterfaceDialogue() {

    const ui = {};

    ui.fond = add([
        rect(10, 10, { radius: 10 }),
        pos(0, 0),
        fixed(),
        z(Z_INTERFACE),
        color(...COULEUR_CREME),
        outline(3, rgb(...COULEUR_ACCENT)),
        opacity(0.97),
    ]);

    ui.portrait = add([
        rect(10, 10, { radius: 8 }),
        pos(0, 0),
        fixed(),
        z(Z_INTERFACE + 1),
        color(...COULEUR_ACCENT),
        outline(2, rgb(...COULEUR_ENCRE)),
    ]);

    ui.image = null;         // la tête dessinée, posée sur le carré
    ui.imageDe = null;       // à qui elle appartient

    ui.nom = add([
        text("", { size: echelleInterface() - 3 }),
        pos(0, 0),
        fixed(),
        z(Z_INTERFACE + 2),
        color(...COULEUR_ACCENT_FONCE),
    ]);

    // On passe une largeur DÈS LA CRÉATION, même provisoire.
    // kaplay ne fait passer le texte à la ligne que si l'option
    // width était présente à la création. Créer le texte sans
    // largeur puis la régler après ne marcherait pas : tout
    // sortirait sur une seule ligne interminable.
    ui.corps = add([
        text("", { size: echelleInterface(), width: 200, lineSpacing: 5 }),
        pos(0, 0),
        fixed(),
        z(Z_INTERFACE + 2),
        color(...COULEUR_ENCRE),
    ]);

    // Le petit triangle "appuie pour continuer".
    ui.fleche = add([
        polygon([vec2(0, 0), vec2(12, 0), vec2(6, 9)]),
        pos(0, 0),
        fixed(),
        z(Z_INTERFACE + 2),
        color(...COULEUR_ACCENT_FONCE),
        opacity(0),
    ]);

    ui.options = [];

    return ui;
}


/* ============================================================
   placerInterfaceDialogue()
   ============================================================
   Calcule la géométrie à partir de la taille ACTUELLE de l'écran.
   Rappelée si l'écran change de taille — un téléphone qu'on
   tourne, une fenêtre qu'on redimensionne.
   ============================================================ */
function placerInterfaceDialogue() {

    const ui = dialogue.ui;
    const m = DIALOGUE_MARGE;

    const hauteur = Math.max(
        DIALOGUE_HAUTEUR_MIN,
        Math.min(DIALOGUE_HAUTEUR_MAX, height() * DIALOGUE_PART_HAUTEUR)
    );
    const largeur = width() - m * 2;
    const x = m;
    const y = height() - m - hauteur;

    dialogue.boite = { x: x, y: y, largeur: largeur, hauteur: hauteur };

    ui.fond.pos = vec2(x, y);
    ui.fond.width = largeur;
    ui.fond.height = hauteur;

    const taille = echelleInterface();
    ui.nom.textSize = taille - 3;
    ui.corps.textSize = taille;

    const cote = Math.max(40, Math.min(hauteur - 28, 80));
    ui.portrait.pos = vec2(x + 12, y + 12);
    ui.portrait.width = cote;
    ui.portrait.height = cote;
    placerPortrait();

    // DEUX colonnes de texte possibles, et pas une seule :
    //   - un personnage parle -> le texte commence après le portrait
    //   - c'est de la narration -> le portrait disparaît, et le texte
    //     récupère toute la largeur.
    // Sur le téléphone de Klara, ce carré vide mangerait un quart de
    // la ligne pour ne rien dire. Et comme la narration n'a de toute
    // façon ni nom ni portrait, le décalage se lit comme un
    // changement de voix, pas comme un bug de mise en page.
    dialogue.xAvecPortrait = x + 12 + cote + 14;
    dialogue.xSansPortrait = x + 16;
    dialogue.xDroiteTexte = x + largeur - 16;

    dialogue.yNom = y + 12;
    dialogue.yCorps = y + 14 + (taille - 3) + 8;

    ui.fleche.pos = vec2(x + largeur - 24, y + hauteur - 20);

    dialogue.largeurEcran = width();
    dialogue.hauteurEcran = height();

    // La colonne dépend de la réplique en cours : on la réapplique.
    if (dialogue.repliques.length > 0 && dialogue.index >= 0) {
        placerColonneTexte(!!dialogue.repliques[dialogue.index].qui);
    }
}


/* ------------------------------------------------------------
   LE PORTRAIT DESSINÉ
   ------------------------------------------------------------
   Le fond reprend la couleur du personnage, mais PÂLIE quand il a
   un dessin : Bob est brun très foncé, et son portrait posé sur
   son brun disparaîtrait. Sans dessin, la couleur reste franche —
   c'est alors elle seule qui dit qui parle.
   ------------------------------------------------------------ */
function couleurDeFondDuPortrait(cle) {
    const c = PERSONNAGES[cle].couleurPlaceholder;
    if (!aUnPortrait(cle)) return c;
    return c.map(function (v, i) {
        return Math.round(v * 0.35 + COULEUR_CREME[i] * 0.65);
    });
}


function peindrePortrait(cle) {

    const ui = dialogue.ui;
    const nom = cle && aUnPortrait(cle) ? cle : null;

    // Même interlocuteur qu'à la réplique d'avant : rien à refaire.
    if (ui.imageDe === nom) return;

    if (ui.image) destroy(ui.image);
    ui.image = null;
    ui.imageDe = nom;
    if (!nom) return;

    ui.image = add([
        sprite("portrait_" + nom),
        pos(0, 0),
        anchor("center"),
        scale(1),
        opacity(0),
        fixed(),
        z(Z_INTERFACE + 2),
    ]);
    placerPortrait();
}


// Centre la tête dans le carré et l'agrandit pour le remplir.
function placerPortrait() {
    const ui = dialogue.ui;
    if (!ui.image) return;

    const cote = ui.portrait.width;
    const plusGrand = Math.max(ui.image.width, ui.image.height);

    // Taille pas encore connue (image pas prête) : on attend, caché,
    // au lieu de diviser par zéro et d'afficher une tête géante.
    // majDialogue() rappelle cette fonction à chaque image.
    ui.image.opacity = plusGrand > 0 ? 1 : 0;
    if (!plusGrand) return;

    ui.image.pos = ui.portrait.pos.add(vec2(cote / 2, cote / 2));
    ui.image.scale = vec2((cote - 6) / plusGrand);
}


function placerColonneTexte(avecPortrait) {
    const ui = dialogue.ui;
    const xTexte = avecPortrait ? dialogue.xAvecPortrait : dialogue.xSansPortrait;

    ui.nom.pos = vec2(xTexte, dialogue.yNom);
    ui.corps.pos = vec2(xTexte, avecPortrait ? dialogue.yCorps : dialogue.yNom + 6);
    ui.corps.width = dialogue.xDroiteTexte - xTexte;
}


/* ============================================================
   repliqueSuivante()
   ============================================================ */
function repliqueSuivante() {

    dialogue.index++;

    if (dialogue.index >= dialogue.repliques.length) {
        // On mémorise la suite AVANT de fermer : fermerDialogue()
        // remet quandFini à null.
        const suite = dialogue.quandFini;
        fermerDialogue();
        if (suite) suite();
        return;
    }

    const replique = dialogue.repliques[dialogue.index];
    const perso = replique.qui ? PERSONNAGES[replique.qui] : null;

    dialogue.texteComplet = replique.texte;
    dialogue.reveles = 0;
    dialogue.fini = false;

    const ui = dialogue.ui;
    ui.corps.text = "";

    if (perso) {
        ui.nom.text = perso.nom;
        ui.portrait.opacity = 1;
        ui.portrait.color = rgb(...couleurDeFondDuPortrait(replique.qui));
        ui.corps.color = rgb(...COULEUR_ENCRE);
        peindrePortrait(replique.qui);
    } else {
        // Narration : ni nom, ni portrait, et un texte plus clair.
        // Le joueur doit sentir en un coup d'oeil que ce n'est
        // personne qui parle.
        ui.nom.text = "";
        ui.portrait.opacity = 0;
        ui.corps.color = rgb(...COULEUR_ACCENT_FONCE);
        peindrePortrait(null);
    }

    placerColonneTexte(!!perso);
    ui.fleche.opacity = 0;

    // CROCHET. Défini par vie.js, qui s'en sert pour faire sursauter
    // celui qui parle et tourner Bob vers lui. Le test d'existence
    // n'est pas de la superstition : ce fichier doit pouvoir tourner
    // seul, sans vie.js, sans rien casser.
    if (typeof auChangementDeReplique === "function") {
        auChangementDeReplique(replique.qui || null);
    }

    // Une réplique peut déclencher quelque chose AU MOMENT où elle
    // s'affiche — un silence, un tremblement, un objet qui bouge.
    // C'est ce qui permet de caler un effet sur une phrase précise
    // plutôt que sur la fin du dialogue, où il arriverait trop tard.
    if (replique.quand) replique.quand();

    // Les sons (sons.js) : un clic pour chaque réplique suivante, et le
    // babillage de celui qui parle pendant que le texte s'écrit.
    if (typeof jouerSon === "function" && dialogue.index > 0) jouerSon("clic");
    if (typeof demarrerBavardage === "function") demarrerBavardage(replique.qui);
}


/* ============================================================
   majDialogue() — appelée à chaque image
   ============================================================ */
function majDialogue() {

    if (!dialogue.actif) return;

    placerPortrait();

    if (dialogue.verrou > 0) dialogue.verrou -= dt();

    // L'écran a changé de taille (téléphone tourné) : on replace tout.
    if (width() !== dialogue.largeurEcran || height() !== dialogue.hauteurEcran) {
        placerInterfaceDialogue();
        if (dialogue.choix) placerChoix();
    }

    // ---- la machine à écrire ----
    if (!dialogue.fini) {
        dialogue.reveles += DIALOGUE_VITESSE_TEXTE * dt();

        const n = Math.min(Math.floor(dialogue.reveles), dialogue.texteComplet.length);
        dialogue.ui.corps.text = dialogue.texteComplet.slice(0, n);

        if (n >= dialogue.texteComplet.length) auTexteFini();
    }

    // ---- la flèche qui clignote ----
    if (dialogue.fini && !dialogue.choix) {
        // Une valeur qui oscille doucement entre 0,2 et 1.
        dialogue.ui.fleche.opacity = 0.2 + (Math.sin(time() * 6) + 1) / 2 * 0.8;
    }
}


/* ------------------------------------------------------------
   Appelée UNE SEULE FOIS, à l'instant où la réplique finit de
   s'écrire. C'est là qu'on ouvre les choix, s'il y en a.
   ------------------------------------------------------------ */
function auTexteFini() {
    dialogue.fini = true;
    if (typeof arreterBavardage === "function") arreterBavardage();

    const replique = dialogue.repliques[dialogue.index];
    if (replique.choix) ouvrirChoix(replique.choix);
}


/* ============================================================
   LES ENTRÉES
   ============================================================
   Clavier ET tactile ET souris, comme partout ailleurs dans ce
   jeu : Klara jouera au doigt, toi à la barre d'espace.

   Les écouteurs sont MÉMORISÉS pour être débranchés à la
   fermeture. Sans ça, ils s'empileraient à chaque dialogue et,
   au dixième, une seule pression en ferait avancer dix.
   ============================================================ */
function brancherEntreesDialogue() {

    const e = dialogue.ecouteurs;

    e.push(onKeyPress("space", entreeValider));
    e.push(onKeyPress("enter", entreeValider));
    e.push(onKeyPress("e", entreeValider));

    e.push(onKeyPress("up", function () { deplacerSelection(-1); }));
    e.push(onKeyPress("down", function () { deplacerSelection(1); }));
    e.push(onKeyPress("z", function () { deplacerSelection(-1); }));   // AZERTY
    e.push(onKeyPress("w", function () { deplacerSelection(-1); }));   // QWERTZ
    e.push(onKeyPress("s", function () { deplacerSelection(1); }));

    e.push(onMousePress(function () { entreePointeur(mousePos()); }));
    e.push(onTouchStart(function (position) { entreePointeur(position); }));

    e.push(onUpdate(majDialogue));
}


function entreeValider() {
    if (!dialogue.actif || dialogue.verrou > 0) return;

    // Le texte est encore en train de s'écrire : on l'affiche
    // d'un coup. C'est LA convention du genre, et ne pas la
    // respecter rend un jeu narratif pénible pour qui lit vite.
    if (!dialogue.fini) {
        dialogue.reveles = dialogue.texteComplet.length;
        dialogue.ui.corps.text = dialogue.texteComplet;
        auTexteFini();
        return;
    }

    if (dialogue.choix) {
        validerChoix(dialogue.choixSelection);
        return;
    }

    repliqueSuivante();
}


/* ------------------------------------------------------------
   Un doigt ou un clic. Si des choix sont ouverts et qu'on a
   touché l'un d'eux, on le prend. Sinon, c'est un "continuer".
   ------------------------------------------------------------ */
function entreePointeur(position) {
    if (!dialogue.actif || dialogue.verrou > 0) return;

    if (dialogue.choix && dialogue.fini) {
        for (let i = 0; i < dialogue.zonesChoix.length; i++) {
            const zone = dialogue.zonesChoix[i];
            if (position.x >= zone.x && position.x <= zone.x + zone.largeur
                && position.y >= zone.y && position.y <= zone.y + zone.hauteur) {
                validerChoix(i);
                return;
            }
        }
        // Touché à côté des choix : on ne fait RIEN. Un choix ne
        // doit jamais pouvoir être passé par mégarde.
        return;
    }

    entreeValider();
}


/* ============================================================
   LES CHOIX
   ============================================================ */
function ouvrirChoix(choix) {
    dialogue.choix = choix;
    dialogue.choixSelection = 0;
    dialogue.ui.fleche.opacity = 0;

    choix.forEach(function (option) {
        const fond = add([
            rect(10, 10, { radius: 8 }),
            pos(0, 0),
            fixed(),
            z(Z_INTERFACE + 3),
            color(...COULEUR_CREME),
            outline(2, rgb(...COULEUR_ACCENT)),
            opacity(0.97),
        ]);

        const etiquette = add([
            text(option.texte, { size: echelleInterface() - 1 }),
            pos(0, 0),
            fixed(),
            z(Z_INTERFACE + 4),
            color(...COULEUR_ENCRE),
        ]);

        dialogue.ui.options.push({ fond: fond, etiquette: etiquette });
    });

    placerChoix();
    peindreSelection();
}


function placerChoix() {

    const b = dialogue.boite;
    // Un choix doit rester ATTRAPABLE AU DOIGT : on ne descend
    // jamais sous 40 px de haut, la hauteur minimale d'une cible
    // tactile confortable, quelle que soit la taille du texte.
    const hauteurOption = Math.max(40, echelleInterface() * 2.1);
    const ecart = 6;
    const largeur = Math.min(b.largeur - 24, 460);
    const x = b.x + b.largeur - largeur - 12;

    const total = dialogue.ui.options.length * (hauteurOption + ecart);
    const yDepart = b.y - total - 8;

    dialogue.zonesChoix = [];

    dialogue.ui.options.forEach(function (option, i) {
        const y = yDepart + i * (hauteurOption + ecart);

        option.fond.pos = vec2(x, y);
        option.fond.width = largeur;
        option.fond.height = hauteurOption;

        option.etiquette.pos = vec2(x + 14, y + (hauteurOption - echelleInterface()) / 2 - 1);

        dialogue.zonesChoix.push({ x: x, y: y, largeur: largeur, hauteur: hauteurOption });
    });
}


function deplacerSelection(pas) {
    if (!dialogue.actif || !dialogue.choix || !dialogue.fini) return;

    const n = dialogue.choix.length;

    // Le "+ n" avant le modulo : en JavaScript, (-1 % 3) vaut -1
    // et pas 2. Sans lui, remonter depuis le premier choix
    // sortirait de la liste.
    dialogue.choixSelection = (dialogue.choixSelection + pas + n) % n;

    peindreSelection();
}


function peindreSelection() {
    dialogue.ui.options.forEach(function (option, i) {
        const choisi = (i === dialogue.choixSelection);
        option.fond.color = choisi ? rgb(...COULEUR_ACCENT) : rgb(...COULEUR_CREME);
        option.etiquette.color = choisi ? rgb(...COULEUR_CREME) : rgb(...COULEUR_ENCRE);
    });
}


function validerChoix(i) {
    const option = dialogue.choix[i];
    if (!option) return;

    // On ferme AVANT d'exécuter la suite : "quand" a ainsi le
    // droit de relancer immédiatement un autre dialogue.
    fermerDialogue();
    if (option.quand) option.quand();
}


/* ============================================================
   fermerDialogue()
   ============================================================ */
function fermerDialogue() {

    dialogue.ecouteurs.forEach(function (ecouteur) { ecouteur.cancel(); });
    dialogue.ecouteurs = [];

    const ui = dialogue.ui;
    if (ui) {
        destroy(ui.fond);
        destroy(ui.portrait);
        destroy(ui.nom);
        destroy(ui.corps);
        destroy(ui.fleche);
        if (ui.image) destroy(ui.image);
        ui.options.forEach(function (option) {
            destroy(option.fond);
            destroy(option.etiquette);
        });
    }

    dialogue.actif = false;
    dialogue.ui = null;
    dialogue.repliques = [];
    dialogue.choix = null;
    dialogue.zonesChoix = [];
    dialogue.quandFini = null;

    if (typeof arreterBavardage === "function") arreterBavardage();
    if (typeof aLaFinDuDialogue === "function") aLaFinDuDialogue();
}
