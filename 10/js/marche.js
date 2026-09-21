/* ============================================================
   LA MARCHE — quand l'histoire fait traverser une peluche
   ============================================================
   Avant ce fichier, une peluche qui « traversait l'appartement »
   disparaissait d'un endroit pour réapparaître à un autre. La
   narration disait « il se lève, ça lui prend du temps » pendant
   que Doudou se téléportait.

   Maintenant elle marche vraiment : elle cherche son chemin entre
   les meubles, joue son cycle de marche dans la bonne direction,
   et sa zone interactive la suit case après case.

   ------------------------------------------------------------
   UNE SEULE FONCTION À RETENIR

       marcherVers(PELUCHES.doudou, 7, 1, { vitesse: 55 })

   Options, toutes facultatives :
       vitesse   pixels du monde par seconde (VITESSE_MARCHE_PELUCHE)
       puis      une fonction appelée à l'arrivée

   ------------------------------------------------------------
   LE CHEMIN

   Un parcours en largeur sur les cases du plan, en quatre
   directions, avec la même règle que le vérificateur de plan
   (caseMarchable, verifications.js). Quatre directions et pas
   huit : en diagonale, une peluche couperait le coin des meubles,
   et son animation n'aurait pas de sens (elle n'a que face, dos
   et profil).

   S'il n'existe aucun chemin, la peluche est posée directement à
   l'arrivée, et la console le dit : l'histoire ne doit jamais
   rester bloquée à cause d'un meuble mal placé.
   ============================================================ */


function cheminVers(plan, depart, arrivee) {

    const cle = function (x, y) { return x + "," + y; };
    const venu = {};
    venu[cle(depart.x, depart.y)] = null;

    const file = [depart];
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (file.length > 0) {
        const c = file.shift();

        if (c.x === arrivee.x && c.y === arrivee.y) {
            // On remonte le fil jusqu'au départ.
            const chemin = [];
            let k = cle(c.x, c.y);
            let n = c;
            while (n) {
                chemin.unshift(n);
                n = venu[k];
                if (n) k = cle(n.x, n.y);
            }
            chemin.shift();          // la case de départ, où l'on est déjà
            return chemin;
        }

        directions.forEach(function (d) {
            const x = c.x + d[0];
            const y = c.y + d[1];
            const k = cle(x, y);
            if (k in venu) return;
            if (!caseMarchable(plan, x, y)) return;
            venu[k] = c;
            file.push({ x: x, y: y });
        });
    }

    return null;
}


// Les pieds d'une peluche posée sur une case : milieu en largeur,
// bas de la case en hauteur. Exactement comme placerPeluche().
function piedsSurLaCase(x, y) {
    return vec2(x * TAILLE_TUILE + TAILLE_TUILE / 2, y * TAILLE_TUILE + TAILLE_TUILE);
}


function caseSousLesPieds(peluche) {
    return {
        x: Math.floor(peluche.basePos.x / TAILLE_TUILE),
        y: Math.floor((peluche.basePos.y - 1) / TAILLE_TUILE),
    };
}


function marcherVers(peluche, tuileX, tuileY, options) {

    options = options || {};
    const vitesse = options.vitesse || VITESSE_MARCHE_PELUCHE;

    // Une marche déjà en cours s'arrête là où elle en est.
    if (peluche.marche) peluche.marche.cancel();

    const arrivee = { x: tuileX, y: tuileY };
    const chemin = cheminVers(PIECES.studio.plan, caseSousLesPieds(peluche), arrivee);

    const arriver = function () {
        peluche.enMarche = false;
        peluche.marche = null;
        peluche.finirLaMarche = null;
        placerPeluche(peluche, tuileX, tuileY);
        remettreDeFace(peluche);
        if (options.puis) options.puis();
    };

    // Pour terminerLesMarches() : arriver tout de suite.
    peluche.finirLaMarche = function () {
        if (peluche.marche) peluche.marche.cancel();
        arriver();
    };

    if (!chemin) {
        console.warn(
            "marcherVers : aucun chemin pour " + PERSONNAGES[peluche.cle].nom
            + " jusqu'en (" + tuileX + ", " + tuileY + "). Posée directement."
        );
        arriver();
        return;
    }

    if (chemin.length === 0) {
        arriver();
        return;
    }

    peluche.enMarche = true;
    let etape = 0;

    peluche.marche = onUpdate(function () {

        // On peut franchir plusieurs cases dans la même image si
        // l'onglet a été mis en veille : dt() est alors énorme, et
        // la peluche ne doit pas rester en arrière pour autant.
        let reste = vitesse * Math.min(dt(), 0.5);

        while (reste > 0 && etape < chemin.length) {

            const cible = piedsSurLaCase(chemin[etape].x, chemin[etape].y);
            const ecart = cible.sub(peluche.basePos);
            const distance = ecart.len();

            // L'animation suit la direction du pas en cours.
            if (peluche.dessinee && distance > 0) {
                if (Math.abs(ecart.x) > Math.abs(ecart.y)) {
                    peluche.corps.flipX = ecart.x < 0;
                    jouerAnimation(peluche.corps, "marche-cote");
                } else {
                    peluche.corps.flipX = false;
                    jouerAnimation(peluche.corps, ecart.y < 0 ? "marche-haut" : "marche-bas");
                }
            }

            if (distance <= reste) {
                peluche.basePos = cible;
                reste -= distance;

                // La zone suit la peluche : on peut lui parler en
                // chemin, à l'endroit où on la voit.
                if (peluche.zone) deplacerInteractif(peluche.zone, chemin[etape].x, chemin[etape].y);
                etape++;
            } else {
                peluche.basePos = peluche.basePos.add(ecart.unit().scale(reste));
                reste = 0;
            }
        }

        if (etape >= chemin.length) {
            peluche.marche.cancel();
            arriver();
        }
    });
}


/* ------------------------------------------------------------
   terminerLesMarches()
   ------------------------------------------------------------
   Pose immédiatement à l'arrivée toutes les peluches en chemin.
   Sert aux tests automatiques (qui ne laissent pas passer le
   temps), et à toute scène qui a besoin que tout le monde soit
   arrivé avant de commencer.
   ------------------------------------------------------------ */
function terminerLesMarches() {
    Object.keys(PELUCHES).forEach(function (cle) {
        const p = PELUCHES[cle];
        if (p.finirLaMarche) p.finirLaMarche();
    });
}
