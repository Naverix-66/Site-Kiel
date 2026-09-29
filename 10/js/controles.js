/* ============================================================
   CONTRÔLES — clavier (PC) + joystick virtuel (téléphone)
   ============================================================
   RÈGLE D'OR DE CE FICHIER :
   le reste du jeu ne doit JAMAIS savoir si le joueur est sur
   téléphone ou sur PC. Tout ce fichier existe pour transformer
   deux entrées très différentes en UNE SEULE réponse commune :
   "dans quelle direction veut-on aller, maintenant ?"

   Une seule fonction sera appelée de l'extérieur : lireDirection().
   ============================================================ */


/* ------------------------------------------------------------
   ÉTAT INTERNE DU JOYSTICK
   ------------------------------------------------------------
   Ces variables ne doivent être lues/écrites QUE dans ce fichier.
   ------------------------------------------------------------ */
let joystickActif = false;              // le doigt est-il posé sur le joystick ?
let joystickIdentifiantDoigt = null;    // quel doigt, si elle en pose plusieurs
let joystickVecteur = vec2(0, 0);       // l'inclinaison actuelle, entre -1 et 1


/* ============================================================
   À TOI DE JOUER — FONCTION 3
   ============================================================
   function lireDirection()

   BUT
     Renvoyer la direction voulue par le joueur, sous forme d'un
     vecteur kaplay (vec2) dont la longueur ne dépasse JAMAIS 1.

   ENTRÉES
     Aucune. La fonction regarde l'état du clavier et la variable
     joystickVecteur ci-dessus.

   SORTIE
     - vec2(0, 0) si le joueur ne demande rien.
     - vec2(1, 0) s'il va vers la droite, vec2(0, -1) vers le haut
       (attention : en 2D l'axe Y est inversé, -1 = vers le haut).
     - un vecteur de longueur 1 en diagonale, PAS vec2(1, 1).

   COMPORTEMENT ATTENDU
     1. Si joystickActif est vrai, renvoie joystickVecteur.
        Le joystick a la priorité : si elle a le doigt dessus,
        on ignore le clavier.
     2. Sinon, construis un vecteur à partir des touches :
        - flèches ET ZQSD ET WASD doivent marcher (elle peut être
          sur un clavier QWERTY, et toi sur AZERTY).
        - noms de touches TOUJOURS en minuscules : "left", "right",
          "up", "down", ou la lettre seule ("d"). Un nom mal
          orthographié renvoie false EN SILENCE, sans erreur.
        - ⚠️ event.key dépend de la DISPOSITION du clavier :
            toi, AZERTY   -> "z" "q" "s" "d"
            Klara, QWERTZ -> "w" "a" "s" "d"
          Il faut les DEUX jeux. "a" et "w" te manquent encore.
     3. Si le vecteur obtenu n'est pas nul, NORMALISE-LE
        (méthode .unit() en kaplay) pour que la diagonale ne soit
        pas plus rapide que la ligne droite.

   BON À SAVOIR (vérifié dans kaplay 3001)
     .unit() sur un vecteur nul renvoie (0, 0) : il ne plante pas.
     Le test de longueur sert juste à éviter un calcul inutile.
   ============================================================ */


function lireDirection(){
  let direction = joystickVecteur.clone();
  if (!joystickActif){
    direction = vec2(0,0);
    if (isKeyDown("left")  || isKeyDown("q") || isKeyDown("a")) {   // "a" = clavier allemand

      direction.x = direction.x - 1;

    }
    if(isKeyDown("right") || isKeyDown("d")){

      direction.x = direction.x + 1;

    }
    if (isKeyDown("up")    || isKeyDown("z") || isKeyDown("w")) {   // "w" = clavier allemand

      direction.y = direction.y - 1;

    }
    if (isKeyDown("down") || isKeyDown("s")){

      direction.y = direction.y + 1;

    }
    direction = direction.unit();
  }
  return direction;
}


/* ============================================================
   ⬇️  À TOI DE JOUER — n°4 : LE JOYSTICK TACTILE  ⬇️
   ============================================================
   C'est la fonction la plus dure du Lot 1, mais elle se découpe
   en 4 blocs indépendants. Fais-les un par un, dans l'ordre, en
   testant à chaque fois.

   POUR TESTER SANS TÉLÉPHONE
     F12 -> Ctrl+Shift+M (mode appareil) -> choisis un téléphone
     -> RECHARGE la page. Sans le rechargement, kaplay garde
     l'ancienne taille d'écran.

   ------------------------------------------------------------
   CE QUI EST VÉRIFIÉ (tu peux t'y fier)
   ------------------------------------------------------------
   - fixed() colle un objet à l'ÉCRAN, pas au monde. Testé :
     avec la caméra envoyée à 1000 px de là, l'objet fixed()
     n'a pas bougé d'un pixel.
   - onTouchStart((position, toucher) => ...) :
       . position = un vec2 en coordonnées ÉCRAN, relatives au
         coin haut-gauche du canvas. Donc le MÊME repère que
         tes objets fixed() : tu peux comparer directement,
         sans aucune conversion.
       . toucher = l'objet Touch du navigateur. C'est
         toucher.identifier qui distingue les doigts.
   - L'événement est déclenché UNE FOIS PAR DOIGT.
   - Idem pour onTouchMove et onTouchEnd.
   ------------------------------------------------------------




   BLOC 4 — LÂCHER
     onTouchEnd((position, toucher) => { ... })

     - Ignore si ce n'est pas le bon identifier.
     - joystickActif = false
     - joystickVecteur = vec2(0, 0)   ← sinon Bob part tout seul
       à l'infini dans la dernière direction
     - Remets le pouce au centre et les opacités d'origine.
     - Remets joystickIdentifiantDoigt à null.

     ✅ Test final : Bob suit ton doigt, s'arrête net quand tu
        relâches, va plus lentement si tu inclines à moitié, et
        le clavier fonctionne toujours quand tu ne touches pas
        le joystick.
   ============================================================ */

function creerJoystick() {

    // Le centre de la base, en coordonnées ÉCRAN.
    // Calculé ici et pas en haut du fichier : height() doit être
    // lu au moment où la scène démarre.
    const centre = vec2(
        JOYSTICK_MARGE + JOYSTICK_RAYON_BASE,
        height() - JOYSTICK_MARGE - JOYSTICK_RAYON_BASE
    );

    // fixed() = collé à l'ÉCRAN, pas au monde. Sans lui, le
    // joystick partirait avec la caméra.
    const base = add([
        circle(JOYSTICK_RAYON_BASE),
        pos(centre),
        anchor("center"),
        fixed(),
        color(255, 255, 255),
        opacity(0.25),
        z(Z_INTERFACE - 21),   // au-dessus de la nuit (lumieres.js)
    ]);

    const pouce = add([
        circle(JOYSTICK_RAYON_POUCE),
        pos(centre),
        anchor("center"),
        fixed(),
        color(255, 255, 255),
        opacity(0.35),
        z(Z_INTERFACE - 20),
    ]);


    /* --------------------------------------------------------
       LES TROIS GESTES
       --------------------------------------------------------
       Le joystick doit répondre au DOIGT (téléphone) et à la
       SOURIS (PC). Ce sont deux familles d'événements totalement
       différentes en JavaScript, mais le comportement voulu est
       identique — alors on l'écrit UNE fois ici, et on branche
       les deux familles dessus tout en bas.

       Le seul point commun qu'il leur faut : un identifiant, pour
       savoir qui tient le joystick. Un doigt en a un, fourni par
       le navigateur. La souris n'en a pas, donc on lui en invente
       un, et comme il n'y a jamais qu'une seule souris, ça suffit.
       -------------------------------------------------------- */
    const SOURIS = "souris";

    function prendre(position, identifiant) {
        // Quelqu'un tient déjà le joystick : un second doigt ne
        // doit pas le lui voler.
        if (joystickActif) return;

        // Le geste a commencé ailleurs sur l'écran.
        // Le x1.6 est une zone de tolérance : sur un téléphone on
        // vise mal, et un joystick qui n'obéit qu'au pixel exact
        // est insupportable.
        if (position.dist(centre) > JOYSTICK_RAYON_BASE * 1.6) return;

        joystickActif = true;
        joystickIdentifiantDoigt = identifiant;

        // Retour visuel : elle doit VOIR que le joystick a répondu.
        base.opacity = 0.7;
        pouce.opacity = 0.8;
    }

    function suivre(position, identifiant) {
        if (!joystickActif) return;
        if (identifiant !== joystickIdentifiantDoigt) return;

        const ecart = position.sub(centre);
        joystickVecteur = ecart.scale(1 / JOYSTICK_RAYON_BASE);

        // On plafonne : un doigt tiré au-delà du bord de la base
        // ne doit pas donner une vitesse absurde.
        if (joystickVecteur.len() > 1) {
            joystickVecteur = joystickVecteur.unit();
        }

        // Zone morte : sans elle, un pouce posé immobile — jamais
        // parfaitement au centre, et qui tremble d'un pixel — fait
        // dériver Bob en permanence.
        if (joystickVecteur.len() < JOYSTICK_ZONE_MORTE) {
            joystickVecteur = vec2(0, 0);
        }

        pouce.pos = centre.add(joystickVecteur.scale(JOYSTICK_RAYON_BASE));
    }

    function lacher(identifiant) {
        if (identifiant !== joystickIdentifiantDoigt) return;

        joystickActif = false;

        // Sans cette remise à zéro, Bob continuerait à courir tout
        // seul, à l'infini, dans la dernière direction demandée.
        joystickVecteur = vec2(0, 0);
        joystickIdentifiantDoigt = null;

        pouce.pos = centre;
        base.opacity = 0.25;
        pouce.opacity = 0.35;
    }


    /* --------------------------------------------------------
       BRANCHEMENT DES DEUX FAMILLES D'ÉVÉNEMENTS
       --------------------------------------------------------
       Tactile : le navigateur fournit toucher.identifier, stable
       pendant toute la durée du contact.

       Souris : mousePos() renvoie la position en coordonnées
       ÉCRAN — le même repère que nos objets fixed(), donc aucune
       conversion à faire. (Vérifié : la valeur ne change pas
       quand la caméra bouge.)
       -------------------------------------------------------- */
    onTouchStart((position, toucher) => prendre(position, toucher.identifier));
    onTouchMove((position, toucher) => suivre(position, toucher.identifier));
    onTouchEnd((position, toucher) => lacher(toucher.identifier));

    onMousePress(() => prendre(mousePos(), SOURIS));
    onMouseMove(() => suivre(mousePos(), SOURIS));
    onMouseRelease(() => lacher(SOURIS));
}
