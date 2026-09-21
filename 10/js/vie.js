/* ============================================================
   LA VIE — ce qui manquait quand on parlait aux peluches
   ============================================================
   Evan : « il manque vraiment un truc dans le jeu là, juste
   parler aux PNJ. Une animation ou je sais pas, quelque chose. »

   Il a raison, et le diagnostic est précis : deux pastilles
   immobiles qui échangent du texte, ce sont deux pastilles
   immobiles. Ce fichier ne change pas une ligne de l'histoire —
   il fait bouger les corps pendant qu'elle se raconte.

   ------------------------------------------------------------
   CINQ CHOSES, PAR ORDRE D'IMPORTANCE

   1. UN IDLE PAR PERSONNAGE, reconnaissable de loin, sans texte.
      Bluey rebondit sans arrêt. Fraisy se balance. Samsam ne
      bouge pas du tout — il RESPIRE, et c'est tout : on doit
      pouvoir le confondre avec un coussin. Doudou est immobile,
      sauf qu'il suit Bob des yeux à travers la pièce.
      C'est la caractérisation la moins chère qui existe : on
      sait qui est qui avant d'avoir lu un seul mot.

   2. LE BUMP. Celui qui parle monte de quelques pixels et
      redescend, à chaque réplique. Sans ça, on lit un texte ;
      avec ça, quelqu'un parle.

   3. LA BULLE. Un point d'exclamation doré au-dessus de qui a
      du NEUF à dire, et qui s'éteint dès qu'on l'a écouté. Dans
      un jeu de piste, c'est ce qui évite de refaire le tour de
      l'appartement en demandant « et toi ? » à tout le monde.

   4. LA CAMÉRA se rapproche de 15 % pendant un dialogue, et
      Bob se tourne vers son interlocuteur.

   5. LE SILENCE. Une fonction pour tout figer, deux secondes.
      À n'utiliser qu'UNE fois dans l'acte : la deuxième fois,
      ça ne vaut déjà plus rien.

   ------------------------------------------------------------
   COMMENT C'EST BRANCHÉ

   dialogue.js appelle trois crochets, s'ils existent :
   auDebutDuDialogue(), auChangementDeReplique(qui), aLaFinDuDialogue().
   Ce fichier les définit. Si on le retire du projet, le jeu
   continue de tourner exactement comme avant — en moins vivant.
   ============================================================ */


const vie = {
    zoomBase: 1,
    zoomVoulu: 1,
    gelJusquA: 0,        // horloge de fin du silence imposé
    interlocuteur: null,
};


/* ============================================================
   preparerLaVie()
   ============================================================
   Appelée par la scène, APRÈS que les peluches existent.
   ============================================================ */
function preparerLaVie() {

    vie.zoomBase = calculerZoom();
    vie.zoomVoulu = vie.zoomBase;
    vie.gelJusquA = 0;
    vie.interlocuteur = null;

    Object.keys(PELUCHES).forEach(function (cle) {
        animerPeluche(PELUCHES[cle]);
    });

    // Le zoom se rapproche doucement pendant les dialogues.
    // lerp() et non une affectation brutale : un changement de
    // zoom instantané donne un à-coup très désagréable, surtout
    // sur téléphone.
    onUpdate(function () {
        const zoom = getCamScale().x;
        setCamScale(lerp(zoom, vie.zoomVoulu, dt() * 6));
    });
}


/* ------------------------------------------------------------
   animerPeluche(peluche)
   ------------------------------------------------------------
   Compose la position finale à partir de TROIS morceaux :
       basePos   où le personnage se tient (posée par l'acte)
     + idle      son mouvement permanent
     + bump      le sursaut de la réplique en cours

   On recompose à chaque image au lieu de déplacer le corps :
   sinon les trois effets se marchent dessus et le personnage
   dérive petit à petit à travers la pièce.
   ------------------------------------------------------------ */
function animerPeluche(peluche) {

    const perso = PERSONNAGES[peluche.cle];
    const style = STYLES_IDLE[peluche.cle] || "immobile";

    peluche.bump = 0;

    peluche.corps.onUpdate(function () {

        let decalageY = 0;
        let decalageX = 0;
        let etirement = 1;
        let penche = 0;

        // Pendant une marche (marche.js), l'idle se tait : une
        // peluche qui se dandine en marchant a l'air de glisser.
        // Sauf Bluey, dont le rebond DEVIENT sa façon de marcher.
        const auRepos = !peluche.enMarche || style === "rebondit";

        if (!leStudioEstFige() && auRepos) {

            // time() est une horloge globale : décaler chaque
            // personnage par une valeur qui lui est propre évite
            // qu'ils rebondissent tous en même temps, ce qui
            // ferait très vite "machine" et pas "vivant".
            const t = time() + peluche.dephasage;

            if (style === "rebondit") {
                // Bluey : une vraie parabole, pas un sinus. Un
                // sinus flotte ; une parabole retombe. La valeur
                // absolue d'un sinus donne exactement ça.
                decalageY = -Math.abs(Math.sin(t * 5)) * 6;

            } else if (style === "balance") {
                decalageX = Math.sin(t * 2.5) * 2;

            } else if (style === "respire") {
                // Samsam ne se déplace PAS. Il gonfle.
                etirement = 1 + Math.sin(t * 1.1) * 0.025;

            } else if (style === "danse") {
                // Cakey se dandine, comme quelqu'un qui fredonne une
                // chanson d'anniversaire dans sa tête : penchée d'un
                // côté, penchée de l'autre, avec un petit sautillement
                // à chaque passage par le milieu. Le pivot est à ses
                // pieds (anchor "bot") : elle tangue, elle ne tourne pas.
                penche = Math.sin(t * 3) * 6;
                decalageY = -Math.abs(Math.cos(t * 3)) * 2;
            }
        }

        decalageY -= peluche.bump;

        // Le bump retombe tout seul.
        if (peluche.bump > 0) peluche.bump = Math.max(0, peluche.bump - dt() * 40);

        peluche.corps.pos = peluche.basePos.add(vec2(decalageX, decalageY));
        peluche.corps.scale = vec2(peluche.echelle, peluche.echelle * etirement);
        peluche.corps.angle = penche;
        peluche.corps.z = Z_DECOR + peluche.basePos.y;

        peluche.etiquette.pos = peluche.basePos.add(
            vec2(decalageX, decalageY - peluche.cote - 6)
        );
        peluche.etiquette.z = Z_DECOR + peluche.basePos.y + 1;

        // L'ombre reste au SOL : elle suit basePos et ignore le
        // rebond. C'est ce qui fait qu'un personnage qui saute a
        // l'air de décoller, au lieu d'emporter son ombre avec lui.
        peluche.ombre.pos = peluche.basePos.add(vec2(decalageX, -2));
        peluche.ombre.z = Z_DECOR + peluche.basePos.y - 0.5;
        peluche.ombre.opacity = peluche.corps.opacity * 0.28;

        if (peluche.enMarche) return;

        // Doudou suit Bob des yeux. Il ne bouge pas d'un
        // centimètre — il se tourne. Personne ne le remarquera
        // consciemment, et tout le monde le sentira.
        // Il reste de face tant que Bob est à peu près devant lui,
        // et ne passe de profil que quand Bob est franchement sur
        // le côté : il ne tourne jamais le dos pour regarder.
        if (style === "regarde") {
            const bob = get("bob")[0];
            if (!bob) return;
            if (!peluche.dessinee) {
                peluche.corps.flipX = bob.pos.x < peluche.basePos.x;
            } else if (Math.abs(bob.pos.x - peluche.basePos.x) > TAILLE_TUILE) {
                orienterPeluche(peluche, vec2(bob.pos.x, peluche.basePos.y));
            } else {
                remettreDeFace(peluche);
            }
            return;
        }

        // Les autres regardent celui qui leur parle, puis se
        // remettent de face un instant après la fin du dialogue.
        if (peluche.retourDeFace && time() > peluche.retourDeFace) {
            peluche.retourDeFace = 0;
            remettreDeFace(peluche);
        }
    });

    // La bulle "!" — créée une fois, cachée par défaut.
    peluche.bulle = add([
        text("!", { size: 22 }),
        pos(0, 0),
        anchor("center"),
        color(...COULEUR_OR),
        opacity(0),
        z(Z_INTERFACE - 20),
    ]);

    peluche.bulle.onUpdate(function () {
        // Pas de bulle sur un personnage caché : pendant le
        // cache-cache, elle trahirait Bluey à travers toute la pièce.
        // Ni quand Bob est déjà devant : le point doré prend la place.
        const vise = interactions.cible && interactions.cible === peluche.zone;
        if (!peluche.aDuNeuf || peluche.cache || dialogueEnCours() || vise) {
            peluche.bulle.opacity = 0;
            return;
        }
        peluche.bulle.opacity = peluche.corps.opacity;
        peluche.bulle.pos = peluche.basePos.add(
            vec2(0, -peluche.cote - 20 + Math.sin(time() * 4) * 3)
        );
        peluche.bulle.z = Z_NUIT + 10;      // lisible même dans le noir
    });
}


/* ------------------------------------------------------------
   Qui a du neuf à dire.
   ------------------------------------------------------------
   C'est l'ACTE qui décide, pas ce fichier : on lui donne juste
   de quoi l'afficher.
   ------------------------------------------------------------ */
function marquerDuNeuf(cle, oui) {
    const p = PELUCHES[cle];
    if (p) p.aDuNeuf = !!oui;
}

function effacerToutesLesBulles() {
    Object.keys(PELUCHES).forEach(function (cle) {
        PELUCHES[cle].aDuNeuf = false;
    });
}


/* ============================================================
   LE SILENCE
   ============================================================
   Tout se fige : les idles, et rien d'autre. Bob garde la main,
   parce qu'un joueur à qui on retire le contrôle sans prévenir
   croit que le jeu a planté.

   ⚠️ UNE SEULE FOIS PAR ACTE. C'est un effet qui ne marche que
   s'il n'a jamais servi avant.
   ============================================================ */
function figerLeStudio(secondes) {
    vie.gelJusquA = time() + secondes;
}

function leStudioEstFige() {
    return time() < vie.gelJusquA;
}


/* ============================================================
   LES TROIS CROCHETS APPELÉS PAR dialogue.js
   ============================================================ */

function auDebutDuDialogue() {
    vie.zoomVoulu = vie.zoomBase * 1.15;
}


function aLaFinDuDialogue() {
    vie.zoomVoulu = vie.zoomBase;
    vie.interlocuteur = null;

    // Ceux qui s'étaient tournés vers Bob se remettent de face,
    // sans se presser : un demi-tour pile à la dernière réplique
    // ferait mécanique.
    Object.keys(PELUCHES).forEach(function (cle) {
        const p = PELUCHES[cle];
        if (p.tourneVersBob) {
            p.tourneVersBob = false;
            p.retourDeFace = time() + 1.2;
        }
    });
}


/* ------------------------------------------------------------
   Appelée à CHAQUE réplique, avec la clé de qui parle (ou null
   pour la narration).
   ------------------------------------------------------------ */
function auChangementDeReplique(qui) {

    if (!qui) return;

    const peluche = PELUCHES[qui];
    if (peluche && peluche.corps.opacity > 0) {
        peluche.bump = 5;
        vie.interlocuteur = peluche;
    }

    const bob = get("bob")[0];

    // Celui qui parle se tourne vers Bob. Doudou le fait déjà tout
    // seul (son idle), et on ne retourne pas quelqu'un en marche.
    if (bob && peluche && !peluche.enMarche && STYLES_IDLE[qui] !== "regarde") {
        orienterPeluche(peluche, bob.pos);
        peluche.tourneVersBob = true;
        peluche.retourDeFace = 0;
    }

    // Bob se tourne vers celui qui parle. Il ne le fait pas quand
    // c'est LUI qui parle, évidemment : il ne va pas se regarder.
    if (!bob || qui === "bob") return;

    const cible = vie.interlocuteur;
    if (!cible) return;

    const ecartX = cible.basePos.x - bob.pos.x;
    const ecartY = cible.basePos.y - bob.pos.y;

    if (Math.abs(ecartX) > Math.abs(ecartY)) {
        bob.direction = "cote";
        bob.flipX = ecartX < 0;
    } else {
        bob.direction = ecartY < 0 ? "haut" : "bas";
    }

    jouerAnimation(bob, "idle-" + bob.direction);
}
