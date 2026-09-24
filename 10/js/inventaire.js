/* ============================================================
   L'INVENTAIRE
   ============================================================
   Bob ramasse des choses et les donne. C'est ce qui transforme
   une suite de conversations en jeu de piste : entre deux
   personnages, il y a maintenant un aller-retour à faire.

   ------------------------------------------------------------
   TROIS FONCTIONS, ET RIEN D'AUTRE À RETENIR

       prendreObjet("tomate")    Bob le ramasse
       aObjet("tomate")          est-ce qu'il l'a ?
       donnerObjet("tomate")     il s'en sépare

   ------------------------------------------------------------
   OÙ ÇA S'AFFICHE, ET POURQUOI LÀ

   Les quatre coins de l'écran sont déjà pris :
       en bas à gauche   le joystick
       en bas à droite   le bouton d'action
       en bas au milieu  la boîte de dialogue
       en haut au milieu la ligne d'objectif

   Il reste le coin HAUT-GAUCHE. L'inventaire y descend en
   colonne. Il ne contiendra jamais plus de quatre ou cinq
   objets à la fois — si un jour il en faut plus, c'est le
   scénario qu'il faut revoir, pas l'affichage.

   ------------------------------------------------------------
   L'ICÔNE À CÔTÉ DU NOM, JAMAIS À SA PLACE

   Une icône qu'on ne reconnaît pas est pire qu'un mot qu'on lit :
   sur le téléphone de Klara, un petit carré rouge peut être une
   tomate ou un pétale. Les icônes dessinées par Evan (planche
   assets/ui/objets.png, table ICONES_OBJETS dans moteur.js)
   s'ajoutent donc DEVANT le nom. Un objet sans icône garde son
   nom seul, et c'est très bien.
   ============================================================ */


const inventaire = {
    ui: null,
    lignes: [],
    aDroite: false,    // l'acte IV la met à droite (voir placerInventaire)
};


/* ------------------------------------------------------------
   La liste des objets vit dans la MÉMOIRE, donc elle est
   sauvegardée avec le reste. Klara peut fermer l'onglet en
   pleine quête et retrouver sa tomate.
   ------------------------------------------------------------ */
function objetsDeBob() {
    if (!memoire.objets) memoire.objets = [];
    return memoire.objets;
}


function aObjet(id) {
    return objetsDeBob().indexOf(id) >= 0;
}


function prendreObjet(id) {
    if (aObjet(id)) return;

    objetsDeBob().push(id);
    if (typeof jouerSon === "function") jouerSon("pop");
    sauvegarder();
    redessinerInventaire();
}


function donnerObjet(id) {
    const liste = objetsDeBob();
    const i = liste.indexOf(id);
    if (i < 0) return;

    liste.splice(i, 1);
    sauvegarder();
    redessinerInventaire();
}


/* ------------------------------------------------------------
   Le nom lisible d'un objet.
   ------------------------------------------------------------
   OBJETS est défini dans le fichier de l'acte en cours : c'est
   du contenu, pas de la machinerie. Si un id n'y est pas, on
   affiche l'id brut plutôt que de planter — un inventaire qui
   fait tomber le jeu serait absurde.
   ------------------------------------------------------------ */
function nomDObjet(id) {
    if (typeof OBJETS !== "undefined" && OBJETS[id]) return OBJETS[id].nom;
    return id;
}


/* ============================================================
   preparerInventaire()
   ============================================================
   Appelée une fois au démarrage de la scène.
   ============================================================ */
function preparerInventaire() {
    inventaire.lignes = [];
    inventaire.ui = { fonds: [], textes: [] };
    redessinerInventaire();
    onUpdate(placerInventaire);
}


/* ------------------------------------------------------------
   placerInventaire() — à chaque image
   ------------------------------------------------------------
   La colonne descend SOUS la ligne d'objectif dès qu'une de ses
   pastilles la toucherait. Sur un grand écran, l'objectif est
   étroit et centré : l'inventaire reste tout en haut. Sur le
   téléphone de Klara, l'objectif prend toute la largeur : sans
   ça, les deux textes s'écriraient l'un sur l'autre.

   La largeur des pastilles suit celle de leur texte, qui n'est
   connue qu'une image APRÈS l'écriture. D'où ce recalcul continu,
   comme pour la pastille du bouton d'action.
   ------------------------------------------------------------ */
function placerInventaire() {

    const lignes = inventaire.lignes;
    if (lignes.length === 0) return;

    // L'écran a changé de taille, et le texte avec lui : on refait
    // les pastilles (redessinerInventaire rappelle cette fonction).
    if (lignes[0].taille !== echelleInterface() - 3) {
        redessinerInventaire();
        return;
    }

    let plusLarge = 0;
    lignes.forEach(function (l) {
        l.fond.width = (l.xTexte - INVENTAIRE_MARGE) + l.etiquette.width + 10;
        plusLarge = Math.max(plusLarge, l.fond.width);
    });

    let haut = INVENTAIRE_MARGE;
    const bas = typeof basDeLObjectif === "function" ? basDeLObjectif() : null;
    if (bas && INVENTAIRE_MARGE + plusLarge + 8 > bas.gauche) {
        haut = bas.y + 8;
    }

    // À l'acte IV, la liste passe à DROITE : le coin haut-gauche de
    // l'arène est occupé par la fenêtre de Klara, et c'est la seule
    // chose de l'écran qu'on n'a pas le droit de cacher.
    lignes.forEach(function (l, i) {
        const y = haut + i * (l.hauteur + 4);
        const x = inventaire.aDroite
            ? width() - INVENTAIRE_MARGE - l.fond.width
            : INVENTAIRE_MARGE;
        l.fond.pos = vec2(x, y);
        if (l.image) l.image.pos = vec2(x + 5, y + 3);
        l.etiquette.pos = vec2(x + (l.xTexte - INVENTAIRE_MARGE), y + (l.hauteur - l.taille) / 2 - 1);
    });
}


/* ------------------------------------------------------------
   redessinerInventaire()
   ------------------------------------------------------------
   On DÉTRUIT et on refait à chaque changement, plutôt que de
   réutiliser les objets graphiques. C'est un peu brutal, mais
   ça arrive trois fois par partie et ça supprime toute une
   famille de bugs : une ligne fantôme qui reste après qu'on a
   donné un objet, un décalage quand il en manque un au milieu.
   ------------------------------------------------------------ */
function redessinerInventaire() {

    if (!inventaire.ui) return;

    inventaire.ui.fonds.forEach(function (o) { destroy(o); });
    inventaire.ui.textes.forEach(function (o) { destroy(o); });
    inventaire.ui.fonds = [];
    inventaire.ui.textes = [];
    inventaire.lignes = [];

    const liste = objetsDeBob();
    if (liste.length === 0) return;

    const taille = echelleInterface() - 3;
    const hauteurLigne = Math.max(26, taille * 1.7);

    // Les positions sont posées par placerInventaire(), à chaque image.
    liste.forEach(function (id) {

        const fond = add([
            rect(10, hauteurLigne, { radius: 6 }),
            pos(INVENTAIRE_MARGE, INVENTAIRE_MARGE),
            fixed(),
            z(Z_INTERFACE - 6),
            color(...COULEUR_NUIT),
            opacity(0.6),
        ]);

        // L'icône, carrée, à la hauteur de la pastille.
        let xTexte = INVENTAIRE_MARGE + 10;
        let image = null;
        const icone = typeof ICONES_OBJETS !== "undefined" ? ICONES_OBJETS[id] : undefined;

        if (typeof icone === "number") {
            const coteIcone = hauteurLigne - 6;
            image = add([
                sprite("icones_objets", { frame: icone }),
                pos(INVENTAIRE_MARGE + 5, INVENTAIRE_MARGE + 3),
                scale(1),
                fixed(),
                z(Z_INTERFACE - 5),
            ]);
            image.scale = vec2(coteIcone / TAILLE_CASE_ICONE);
            inventaire.ui.textes.push(image);
            xTexte = INVENTAIRE_MARGE + 5 + coteIcone + 5;
        }

        const etiquette = add([
            text(nomDObjet(id), { size: taille }),
            pos(xTexte, INVENTAIRE_MARGE),
            fixed(),
            z(Z_INTERFACE - 5),
            color(...COULEUR_OR),
        ]);

        inventaire.ui.fonds.push(fond);
        inventaire.ui.textes.push(etiquette);
        inventaire.lignes.push({
            fond: fond,
            image: image,
            etiquette: etiquette,
            xTexte: xTexte,
            hauteur: hauteurLigne,
            taille: taille,
        });
    });

    placerInventaire();
}
