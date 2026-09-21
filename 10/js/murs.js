/* ============================================================
   LES MURS ET LES FENÊTRES
   ============================================================
   Jusqu'ici les murs étaient des carrés de couleur unie. Ce
   fichier leur donne une vraie texture — sans toucher d'un seul
   caractère au plan de pieces.js.

   ------------------------------------------------------------
   LE PRINCIPE : UN MUR A DEUX FACES

   En vue de dessus, un mur se voit de deux façons selon l'endroit
   où on se trouve :

     - le mur du HAUT d'une pièce, on en voit la FACE, comme sur
       une photo prise depuis le milieu de la pièce : papier
       peint, plinthe en bas, fenêtres ;

     - les murs de gauche, de droite et du bas, on en voit le
       DESSUS, c'est-à-dire une simple tranche sombre.

   Le plan ne dit pas lequel est lequel — et il n'a pas à le
   dire. On le DÉDUIT : un mur dont la case juste en dessous est
   du sol, c'est un mur dont on voit la face. Tous les autres
   sont des dessus.

   C'est ce qui permet de ne jamais demander à Evan d'annoter son
   plan : il dessine des '#', et le code trouve tout seul.

   ------------------------------------------------------------
   LA FACE FAIT DEUX TUILES DE HAUT

   Le pack dessine ses murs sur deux tuiles : la ligne de plafond
   en haut, la plinthe en bas. Le plan, lui, n'a qu'une tuile
   d'épaisseur de mur.

   On dessine donc la face sur DEUX tuiles, en débordant d'une
   tuile VERS LE HAUT — c'est-à-dire à l'extérieur de
   l'appartement, là où il n'y a rien. Rien à recouvrir, rien à
   casser, et les fenêtres du pack (qui font elles aussi 2 tuiles
   de haut) tombent alors exactement en face.
   ============================================================ */


/* ------------------------------------------------------------
   Les trois caractères du plan qui sont des murs pleins.
   'P' et '+' (les portes) n'en font PAS partie : ce sont des
   trous dans le mur, et c'est justement ce qui donne des
   embrasures correctes sans avoir rien à dessiner.
   ------------------------------------------------------------ */
function estUnMur(caractere) {
    return caractere === "#" || caractere === "F" || caractere === "J";
}


/* ------------------------------------------------------------
   Lit une case du plan, en renvoyant null hors du plan.
   ------------------------------------------------------------
   C'est LE garde-fou de tout ce fichier : on regarde sans arrêt
   la case d'à côté, et sans ce null on lirait undefined à chaque
   bord de l'appartement.
   ------------------------------------------------------------ */
function caseDuPlan(plan, x, y) {
    if (y < 0 || y >= plan.length) return null;
    if (x < 0 || x >= plan[y].length) return null;
    return plan[y][x];
}


// Un mur dont on voit la face = un mur qui a du sol juste dessous.
function estUneFaceDeMur(plan, x, y) {
    const dessous = caseDuPlan(plan, x, y + 1);
    if (dessous === null) return false;
    return !estUnMur(dessous);
}


/* ------------------------------------------------------------
   A-t-on le droit de déborder d'une tuile vers le haut ?
   ------------------------------------------------------------
   OUI si au-dessus il n'y a rien (le bord de l'appartement) ou
   un autre mur : on déborde alors dans du vide, ou sur une
   tranche de mur qu'on recouvre volontairement.

   NON si au-dessus il y a du sol. C'est le cas du mur de la
   salle de bain, qui a du parquet des deux côtés. Déborder là
   dessinerait un mur par-dessus une case où Bob a le droit de
   marcher — et comme la face est dessinée PLUS BAS que lui dans
   l'ordre de profondeur, Bob disparaîtrait purement et
   simplement derrière elle en passant.

   Ces murs-là n'ont donc qu'une tuile de face : du papier peint
   et la plinthe. C'est exactement ce qu'on voit d'une cloison
   quand on la regarde presque à la verticale.
   ------------------------------------------------------------ */
function peutDeborderEnHaut(plan, x, y) {
    const dessus = caseDuPlan(plan, x, y - 1);
    return dessus === null || estUnMur(dessus);
}


/* ============================================================
   dessinerSols(piece)
   ============================================================
   Repeint le sol de certaines pièces par-dessus le parquet.

   On REPEINT plutôt que de marquer le plan : Evan n'a pas à
   ajouter une lettre par pièce dans son dessin, il donne un
   rectangle en cases dans le tableau "sols" de pieces.js.

   Les murs traversés par un rectangle sont sautés — sinon un
   rectangle un peu large repeindrait le mur en carrelage, et
   l'appartement se mettrait à ressembler à une piscine.
   ============================================================ */
function dessinerSols(piece) {

    if (!piece.sols) return;

    piece.sols.forEach(function (zone) {
        for (let y = zone.y; y < zone.y + zone.hauteur; y++) {
            for (let x = zone.x; x < zone.x + zone.largeur; x++) {

                const c = caseDuPlan(piece.plan, x, y);
                if (c === null || estUnMur(c)) continue;

                // z(0.5) : juste au-dessus du parquet, qui est à 0,
                // et bien en dessous de tout le reste.
                add([
                    sprite("piece", { frame: zone.frame }),
                    pos(x * TAILLE_TUILE, y * TAILLE_TUILE),
                    z(Z_SOL + 0.5),
                    "sol",
                ]);
            }
        }
    });
}


/* ============================================================
   dessinerMurs(piece)
   ============================================================ */
function dessinerMurs(piece) {

    const plan = piece.plan;

    for (let y = 0; y < plan.length; y++) {
        for (let x = 0; x < plan[y].length; x++) {

            if (!estUnMur(plan[y][x])) continue;
            if (!estUneFaceDeMur(plan, x, y)) continue;

            // Les deux morceaux reçoivent le MÊME z, calculé depuis
            // le bas du mur : Bob passe donc devant la face entière
            // dès qu'il est plus bas qu'elle, et jamais à moitié.
            const profondeur = Z_DECOR + (y + 1) * TAILLE_TUILE;

            if (peutDeborderEnHaut(plan, x, y)) {
                add([
                    sprite("piece", { frame: FRAME_MUR_HAUT }),
                    pos(x * TAILLE_TUILE, (y - 1) * TAILLE_TUILE),
                    z(profondeur),
                    "mur",
                ]);
            }

            add([
                sprite("piece", { frame: FRAME_MUR_BAS }),
                pos(x * TAILLE_TUILE, y * TAILLE_TUILE),
                z(profondeur),
                "mur",
            ]);
        }
    }
}


/* ============================================================
   dessinerFenetres(piece)
   ============================================================
   Les fenêtres du plan ('F' pour les trois grandes, 'J' pour
   celle de la cuisine) sont des SUITES de cases côte à côte. On
   les repère d'un bloc, puis on les compose comme un meuble
   modulaire : un montant à gauche, des vitres au milieu, un
   montant à droite.

   Composer plutôt qu'étirer : une fenêtre étirée a des montants
   de largeurs différentes d'un côté et de l'autre, et ça se voit
   immédiatement.
   ============================================================ */
function dessinerFenetres(piece) {

    const plan = piece.plan;

    for (let y = 0; y < plan.length; y++) {

        let x = 0;

        while (x < plan[y].length) {

            const caractere = plan[y][x];

            if (caractere !== "F" && caractere !== "J") {
                x++;
                continue;
            }

            // Longueur de la suite de fenêtres qui commence ici.
            let longueur = 1;
            while (caseDuPlan(plan, x + longueur, y) === caractere) longueur++;

            dessinerUneFenetre(x, y, longueur);

            x += longueur;
        }
    }
}


function dessinerUneFenetre(x0, y, longueur) {

    // +1 pour passer devant la face du mur, qui est au même z.
    const profondeur = Z_DECOR + (y + 1) * TAILLE_TUILE + 1;

    for (let i = 0; i < longueur; i++) {

        let image = "fenetre_centre";
        let retourne = false;

        if (i === 0) {
            image = "fenetre_bord";
        } else if (i === longueur - 1) {
            image = "fenetre_bord";
            retourne = true;   // le même montant, retourné : les deux
                               // côtés sont ainsi rigoureusement symétriques
        }

        add([
            sprite(image, { flipX: retourne }),
            pos((x0 + i) * TAILLE_TUILE, (y - 1) * TAILLE_TUILE),
            z(profondeur),
            "fenetre",
        ]);
    }
}
