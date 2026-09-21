/* ============================================================
   SCÈNE : L'APPARTEMENT
   ============================================================
   C'est le chef d'orchestre. Il ne calcule presque rien lui-même :
   il appelle, dans le bon ordre, les fonctions des autres fichiers.
   Garde-le toujours court et lisible — dès qu'un bloc grossit ici,
   c'est qu'il doit partir dans son propre fichier.
   ============================================================ */


/* ------------------------------------------------------------
   CAMÉRA (déjà écrite — lis-la, elle te servira de modèle)
   ------------------------------------------------------------
   La caméra suit un point — Bob, en temps normal, ou ce que
   l'ouverture veut montrer (intro.js) — MAIS elle refuse de
   sortir des murs de la pièce : sans ce garde-fou, quand Bob
   s'approche d'un bord on verrait le vide noir autour du décor,
   ce qui casse l'illusion.
   ------------------------------------------------------------ */
function suivreAvecLaCamera(point, taille) {
    const zoom = getCamScale().x;

    // Ce que la caméra montre du monde, en pixels, à ce zoom-là.
    const demiLargeurVue = width() / (2 * zoom);
    const demiHauteurVue = height() / (2 * zoom);

    const largeurPiece = taille.largeur * TAILLE_TUILE;
    const hauteurPiece = taille.hauteur * TAILLE_TUILE;

    // Par défaut, la caméra est pile sur son point...
    let x = point.x;
    let y = point.y;

    // ...puis on la recadre pour ne jamais dépasser les bords.
    if (largeurPiece <= demiLargeurVue * 2) {
        x = largeurPiece / 2;   // la pièce tient à l'écran : on la centre
    } else {
        x = Math.max(demiLargeurVue, Math.min(largeurPiece - demiLargeurVue, x));
    }

    // ⚠️ En HAUT, on s'autorise UNE tuile de plus que la pièce.
    // Le mur du fond est dessiné sur deux tuiles (voir murs.js) et
    // déborde donc d'une tuile au-dessus du plan. Sans ce tuile de
    // marge, on ne verrait jamais que sa moitié basse — et les
    // fenêtres, qui font elles aussi deux tuiles de haut, seraient
    // coupées en deux sur toute la partie.
    const margeHaut = TAILLE_TUILE;

    if (hauteurPiece <= demiHauteurVue * 2) {
        y = hauteurPiece / 2;
    } else {
        y = Math.max(demiHauteurVue - margeHaut, Math.min(hauteurPiece - demiHauteurVue, y));
    }

    setCamPos(x, y);
}


/* ============================================================
   DESSIN DE LA PIÈCE
   ============================================================
   Grâce au plan ASCII et au dictionnaire TUILES (dans
   pieces.js), il n'y a quasiment plus rien à écrire ici.
   C'est le signe qu'on a mis l'intelligence au bon endroit :
   dans les DONNÉES, pas dans le code.

   Elle renvoie l'objet "niveau" créé par kaplay — on en aura
   besoin plus tard pour connaître les dimensions réelles de la
   pièce et pour retrouver une tuile précise.
   ============================================================ */
function dessinerPiece(piece) {
    const niveau = addLevel(piece.plan, {
        tileWidth: TAILLE_TUILE,
        tileHeight: TAILLE_TUILE,
        tiles: TUILES,
    });

    // Le décor entier est tout au fond. Bob, son ombre et les
    // meubles mobiles auront un z calculé à partir de leur
    // position, donc toujours supérieur : ils passeront devant.
    niveau.z = Z_SOL;

    return niveau;
}


/* ------------------------------------------------------------
   Dimensions de la pièce, déduites du plan.
   (Le nombre de colonnes = la longueur d'une ligne, le nombre
   de lignes = la taille du tableau. Comme ça on n'a jamais à
   écrire les dimensions à la main : elles ne peuvent pas
   devenir fausses.)
   ------------------------------------------------------------ */
function dimensionsDeLaPiece(piece) {
    return {
        largeur: piece.plan[0].length,
        hauteur: piece.plan.length,
    };
}


/* ============================================================
   POSER LES MEUBLES
   ============================================================
   La deuxième couche du décor. Le plan ASCII gère le sol et les
   murs ; ici on pose les meubles, qui occupent plusieurs tuiles
   avec une image différente dans chacune.

   Deux choses importantes se jouent dans cette fonction :

   1. TOUTES les tuiles d'un même meuble reçoivent le MÊME z,
      calculé depuis son bord BAS. Sans ça, Bob pourrait se
      retrouver devant le pied d'une étagère et derrière son
      sommet en même temps.

   2. Le meuble reçoit UNE seule zone de collision, pas une par
      tuile. Seize petites boîtes accolées, c'est seize fois plus
      de tests par image, et surtout Bob accrocherait sur leurs
      arêtes internes en glissant le long du meuble.
   ============================================================ */
function trouverZones(plan, lettre) {

    const zones = [];
    const dejaVu = plan.map(function (ligne) {
        return new Array(ligne.length).fill(false);
    });

    for (let y = 0; y < plan.length; y++) {
        for (let x = 0; x < plan[y].length; x++) {

            if (plan[y][x] !== lettre || dejaVu[y][x]) continue;

            // Remplissage par diffusion : on part d'une case et on
            // ramasse toutes celles qui la touchent, de proche en
            // proche, en notant la boîte qui les contient toutes.
            let minX = x, maxX = x, minY = y, maxY = y;
            const aVisiter = [[x, y]];
            dejaVu[y][x] = true;

            while (aVisiter.length > 0) {
                const caseCourante = aVisiter.pop();
                const cx = caseCourante[0];
                const cy = caseCourante[1];

                if (cx < minX) minX = cx;
                if (cx > maxX) maxX = cx;
                if (cy < minY) minY = cy;
                if (cy > maxY) maxY = cy;

                const voisines = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];

                for (let i = 0; i < voisines.length; i++) {
                    const nx = voisines[i][0];
                    const ny = voisines[i][1];

                    if (ny < 0 || ny >= plan.length) continue;
                    if (nx < 0 || nx >= plan[ny].length) continue;
                    if (dejaVu[ny][nx] || plan[ny][nx] !== lettre) continue;

                    dejaVu[ny][nx] = true;
                    aVisiter.push([nx, ny]);
                }
            }

            zones.push({
                x: minX,
                y: minY,
                largeur: maxX - minX + 1,
                hauteur: maxY - minY + 1,
            });
        }
    }

    return zones;
}


/* ------------------------------------------------------------
   Dessine UN meuble : son image, puis sa collision.
   ------------------------------------------------------------ */
function dessinerMeuble(modele, zone) {

    // Le "pied" du meuble, c'est son bord bas — exactement comme
    // les pieds de Bob décident de son ordre de dessin.
    //
    // Un meuble étirable épouse la zone : c'est donc la hauteur de
    // la ZONE qui commande, pas celle du catalogue. Sans ça le tapis
    // se poserait cinq tuiles trop haut.
    // Un meuble ADOSSÉ (meubles.js) déborde sur le mur au-dessus de
    // sa zone : seule la partie au sol compte pour poser son pied.
    const hauteurEmprise = modele.etirable ? zone.hauteur : modele.hauteur - (modele.adosse || 0);
    const yPied = (zone.y + hauteurEmprise) * TAILLE_TUILE;
    const profondeur = (modele.solide ? (Z_DECOR + yPied) : (Z_SOL + 1)) + (modele.dessus || 0);

    // On ancre en BAS À GAUCHE : l'image peut être plus haute que
    // son emprise au sol (une penderie fait 3 tuiles de haut mais
    // n'occupe qu'une tuile de sol). C'est le bas qui doit tomber
    // juste, jamais le haut.
    const xPixels = zone.x * TAILLE_TUILE;

    if (modele.segments && modele.sens === "vertical") {
        dessinerSegmentsVertical(modele, zone);
        return;   // il pose sa propre collision, adaptée à sa colonne

    } else if (modele.segments) {
        dessinerSegments(modele, zone, xPixels, yPied, profondeur);

    } else if (modele.etirable) {
        // Le sprite épouse la zone du plan, quelle qu'elle soit.
        add([
            sprite(modele.image, {
                width: zone.largeur * TAILLE_TUILE,
                height: zone.hauteur * TAILLE_TUILE,
            }),
            pos(xPixels, yPied),
            anchor("botleft"),
            z(profondeur),
            "meuble",
        ]);

    } else {
        add([
            sprite(modele.image),
            pos(xPixels, yPied),
            anchor("botleft"),
            z(profondeur),
            "meuble",
            "image-" + modele.image,   // pour le retrouver (animes.js)
        ]);
    }

    if (!modele.solide) return;

    // UNE seule zone de collision pour tout le meuble, pas une par
    // tuile : plusieurs petites boîtes accolées, c'est autant de
    // tests en plus par image, et Bob accrocherait sur leurs arêtes
    // internes en longeant le meuble.
    //
    // basSolide ne bloque que le pied d'un meuble haut : Bob passe
    // alors devant sa partie supérieure, et c'est ça qui donne la
    // sensation de profondeur.
    const tuilesBloquantes = modele.basSolide || hauteurEmprise;

    add([
        rect(zone.largeur * TAILLE_TUILE, tuilesBloquantes * TAILLE_TUILE),
        pos(xPixels, yPied - tuilesBloquantes * TAILLE_TUILE),
        area(),
        body({ isStatic: true }),
        opacity(0),          // invisible : ce n'est qu'un obstacle
        "obstacle",
    ]);
}


/* ------------------------------------------------------------
   UN MEUBLE MODULAIRE
   ------------------------------------------------------------
   Bord gauche, puis des motifs de centre répétés, puis bord
   droit — jusqu'à remplir exactement la largeur de la zone.

   C'est ce qui permet une penderie ou un plan de travail de
   n'importe quelle longueur SANS jamais étirer une image, ce qui
   détruirait le pixel art.

   Quand il y a plusieurs motifs de centre, on alterne : ça évite
   la répétition mécanique qui trahit tout de suite le procédé.
   ------------------------------------------------------------ */
function dessinerSegments(modele, zone, xPixels, yPied, profondeur) {

    const seg = modele.segments;

    for (let i = 0; i < zone.largeur; i++) {

        let image;

        if (i === 0) {
            image = seg.gauche;
        } else if (i === zone.largeur - 1) {
            image = seg.droite;
        } else {
            // (i - 1) et non i : on veut que le premier motif de
            // centre soit bien le premier de la liste.
            image = seg.centre[(i - 1) % seg.centre.length];
        }

        add([
            sprite(image),
            pos(xPixels + i * TAILLE_TUILE, yPied),
            anchor("botleft"),
            z(profondeur),
            "meuble",
        ]);
    }
}


/* ------------------------------------------------------------
   UN MEUBLE MODULAIRE VERTICAL
   ------------------------------------------------------------
   LE PROBLÈME QU'IL RÈGLE : la cuisine de Klara est contre le mur
   de DROITE. Or le pack ne dessine ses plans de travail que vus de
   face, tournés vers le bas, pour un mur situé en haut. Plaqué
   contre un mur latéral, un tel meuble montre sa façade là où on
   devrait voir son flanc — et ça se voit immédiatement.

   La solution tient en deux morceaux :
     - outils/tourner.ps1 fait pivoter les trois pièces d'un quart
       de tour (un quart de tour ne déforme aucun pixel) ;
     - cette fonction les empile du HAUT vers le BAS au lieu de les
       aligner de gauche à droite.

   Le plan de travail ne fait qu'UNE case de profondeur, collée au
   mur, quelle que soit la largeur de la zone dessinée : un
   comptoir de trois cases de fond n'existe dans aucune cuisine.
   Le reste de la zone reste du sol — c'est là qu'on se tient pour
   cuisiner.
   ------------------------------------------------------------ */
function dessinerSegmentsVertical(modele, zone) {

    const seg = modele.segments;

    // Collé au bord droit de la zone, donc contre le mur.
    const x = (zone.x + zone.largeur - 1) * TAILLE_TUILE;

    for (let i = 0; i < zone.hauteur; i++) {

        let image;

        if (i === 0) {
            image = seg.haut;
        } else if (i === zone.hauteur - 1) {
            image = seg.bas;
        } else {
            image = seg.centre[(i - 1) % seg.centre.length];
        }

        const yBas = (zone.y + i + 1) * TAILLE_TUILE;

        add([
            sprite(image),
            pos(x, yBas),
            anchor("botleft"),
            z(Z_DECOR + yBas),
            "meuble",
        ]);
    }

    if (!modele.solide) return;

    add([
        rect(TAILLE_TUILE, zone.hauteur * TAILLE_TUILE),
        pos(x, zone.y * TAILLE_TUILE),
        area(),
        body({ isStatic: true }),
        opacity(0),
        "obstacle",
    ]);
}


/* ============================================================
   POSER LES MEUBLES, D'APRÈS LES ZONES DU PLAN
   ============================================================
   On lit le plan, on repère chaque bloc de lettre, et on y pose
   le meuble correspondant.

   La fonction est BAVARDE exprès : si l'emprise dessinée dans le
   plan ne fait pas la taille du meuble, elle le dit dans la
   console avec les deux tailles. C'est le seul moyen de s'en
   apercevoir — sinon le meuble se dessine décalé ou trop petit
   dans sa zone, et on cherche longtemps.
   ============================================================ */
function poserMeubles(piece) {

    Object.keys(ZONES_MEUBLES).forEach(function (lettre) {

        const nomMeuble = ZONES_MEUBLES[lettre];
        const zones = trouverZones(piece.plan, lettre);

        if (zones.length === 0) return;

        const modele = CATALOGUE_MEUBLES[nomMeuble];

        if (!modele) {
            console.warn(
                "'" + lettre + "' : le meuble \"" + nomMeuble + "\" n'est pas encore "
                + "au catalogue. La zone reste du parquet nu."
            );
            return;
        }

        zones.forEach(function (zone) {

            // Un meuble modulaire ou étirable s'adapte à la zone : il n'y a
            // donc rien à signaler pour lui.
            // Un meuble modulaire VERTICAL épouse la hauteur de sa
            // zone et ne fait qu'une case de large : il n'y a donc
            // jamais rien à signaler pour lui.
            if (modele.sens === "vertical") {
                dessinerMeuble(modele, zone);
                return;
            }

            const sAdapte = modele.segments || modele.etirable;
            const largeurAttendue = sAdapte ? zone.largeur : modele.largeur;
            const hauteurAttendue = sAdapte && modele.etirable ? zone.hauteur : modele.hauteur - (modele.adosse || 0);

            if (zone.largeur !== largeurAttendue || zone.hauteur !== hauteurAttendue) {
                console.warn(
                    "'" + lettre + "' (" + nomMeuble + ") : la zone du plan fait "
                    + zone.largeur + "x" + zone.hauteur + " tuiles, le meuble fait "
                    + largeurAttendue + "x" + hauteurAttendue + "."
                );
            }

            dessinerMeuble(modele, zone);
        });
    });
}


/* ============================================================
   LA SCÈNE
   ============================================================
   L'ordre compte : le décor, puis Bob, puis son ombre (qui a
   besoin de le suivre), puis le joystick. La boucle onUpdate
   vient en dernier, une fois que tout ce qu'elle pilote existe.
   ============================================================ */
scene("appartement", (nomDeLaPiece) => {

    const piece = PIECES[nomDeLaPiece];
    const taille = dimensionsDeLaPiece(piece);

    setCamScale(calculerZoom());

    // ⚠️ Indispensable : on pose la caméra SUR la pièce.
    // Par défaut, kaplay la laisse au centre de la fenêtre du
    // navigateur — soit très loin à droite du décor, qui commence
    // toujours en (0, 0). Sans cette ligne on ne voit que le fond.
    // Dès que Bob existera, suivreAvecLaCamera() prendra le relais.
    setCamPos(
        taille.largeur * TAILLE_TUILE / 2,
        taille.hauteur * TAILLE_TUILE / 2
    );

    // ---- LE DÉCOR ----
    // L'ordre compte : le sol et la collision d'abord, puis la face
    // texturée des murs par-dessus, puis les fenêtres dans les murs,
    // et enfin les meubles.
    dessinerPiece(piece);
    dessinerSols(piece);
    dessinerMurs(piece);
    dessinerFenetres(piece);
    poserMeubles(piece);
    poserLesMeublesAnimes(piece);     // les portes et le frigo (animes.js)
    allumerLaNuit();                  // la nuit et ses lumières (lumieres.js)
    preparerLesSons();                // les sons et la musique (sons.js)

    // ---- BOB ----
    const bob = creerBob(piece.departDeBob.x, piece.departDeBob.y);

    // L'ombre est créée APRÈS Bob : elle a besoin de le suivre.
    // On la range sur Bob : l'ouverture doit pouvoir les cacher
    // tous les deux pendant que l'acteur joue la scène.
    bob.ombre = creerOmbre(bob);

    // ---- LES CONTRÔLES TACTILES ----
    creerJoystick();

    // ---- L'HISTOIRE ----
    // Pose les peluches, déclare les zones interactives, et lance
    // l'ouverture. Après creerJoystick() : la boîte de dialogue doit
    // être créée APRÈS le joystick pour passer par-dessus lui.
    installerStudio();

    onUpdate(() => {

        // Pendant un dialogue, Bob est figé : on ne veut pas qu'il
        // s'éloigne de son interlocuteur au milieu d'une phrase, ni
        // que la barre d'espace serve à deux choses à la fois.
        // On le remet quand même sur son animation d'attente, sinon
        // il resterait bloqué sur une image de son cycle de marche.
        // Pendant l'ouverture animée, Bob est caché et c'est un
        // acteur qui joue (intro.js) : on ne pilote rien.
        // Même chose pendant un petit jeu (jeux.js), et une fois Bob
        // passé par la fenêtre, à la fin de l'acte II.
        if (introEnCours() || bobEstSorti()) {
            cacherInterfaceAction();
        } else if (dialogueEnCours() || jeuEnCours()) {
            jouerAnimation(bob, "idle-" + bob.direction);
        } else {
            deplacerBob(bob);
            majInteractions(bob);
        }

        // Recalcule l'ordre de dessin de Bob à partir de sa position
        // verticale : plus il est bas à l'écran, plus il est proche,
        // donc dessiné par-dessus. C'est ce qui le fera passer
        // derrière les meubles situés plus bas que lui.
        trierParProfondeur(bob);

        const regard = introEnCours() ? pointDeVueIntro()
            : (bobEstSorti() ? pointDeVueSortie() : bob.pos);
        suivreAvecLaCamera(regard, taille);
    });

});
