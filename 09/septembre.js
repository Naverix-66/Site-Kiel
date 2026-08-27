/* ============================================================
   CONFIGURATION
   ============================================================ */
const GRAVITE = 1600;
const FORCE_DU_SAUT = 500;

// Variables de vitesse dynamique
const VITESSE_JEU_BASE = 200;
const VITESSE_MAX = 380;             // Baissé pour que ça reste jouable
const ACCELERATION_PAR_POINT = 4;    // Accélère beaucoup plus doucement
const INTERVALLE_OBSTACLES_BASE = 2; // Temps de base entre deux tuyaux

const LARGEUR_TUYAU = 100;
const TAILLE_TROU = 300;
const HAUTEUR_CAPUCHON = 26;          // hauteur affichée du capuchon fleuri, en jeu

const PROBABILITE_BONUS = 0.15;
const DUREE_RALENTI = 5;
const DUREE_INVINCIBILITE = 4;
const DUREE_MINI = 6;

const VITESSE_DEFILEMENT_FOND = 20;   // px/seconde, bien plus lent que les tuyaux (effet de profondeur)

const COULEUR_ENCRE = [75, 59, 54];
const COULEUR_ACCENT = [217, 166, 160];
const COULEUR_ACCENT_FONCE = [193, 127, 119];
const COULEUR_OR = [201, 168, 118];
const COULEUR_FOND_BADGE = [252, 238, 234];

const CLE_MEILLEUR_SCORE = "flappy-bob-meilleur-score";


/* ============================================================
   INITIALISATION
   ============================================================ */
kaplay({
    background: "#FBF3EE",
});

setGravity(GRAVITE);

loadSprite("bob", "flappy_bob.png");
loadSprite("icone-ralenti", "sablier.png");
loadSprite("icone-bouclier", "bouclier.png");
loadSprite("icone-mini", "potion.png");
loadSprite("fond-jeu", "fond_ecran.jpg");
loadSprite("tuyau-corps", "tuyau_corps.png");
loadSprite("tuyau-capuchon", "tuyau_capuchon.png");


/* ============================================================
   MEILLEUR SCORE (localStorage)
   ============================================================ */
function lireMeilleurScore() {
    return Number(localStorage.getItem(CLE_MEILLEUR_SCORE)) || 0;
}

function sauvegarderMeilleurScore(score) {
    localStorage.setItem(CLE_MEILLEUR_SCORE, score);
}


/* ============================================================
   DÉCOR DE FOND
   ============================================================ */
function ajouterFond() {
    const largeurFond = width();

    for (let i = 0; i < 2; i++) {
        const morceau = add([
            sprite("fond-jeu", { width: largeurFond, height: height() }),
            pos(i * largeurFond, 0),
            z(-2),
        ]);

        morceau.onUpdate(() => {
            morceau.pos.x -= VITESSE_DEFILEMENT_FOND * dt();
            if (morceau.pos.x <= -largeurFond) {
                morceau.pos.x += largeurFond * 2;
            }
        });
    }
}

function ajouterDecorFond() {
    for (let i = 0; i < 6; i++) {
        const taille = rand(20, 50);

        const bulle = add([
            circle(taille),
            pos(rand(0, width()), rand(0, height())),
            color(...COULEUR_ACCENT),
            opacity(rand(0.05, 0.15)),
            z(-1),
        ]);

        bulle.onUpdate(() => {
            bulle.pos.y -= 8 * dt();
            if (bulle.pos.y < -taille) {
                bulle.pos.y = height() + taille;
                bulle.pos.x = rand(0, width());
            }
        });
    }
}


/* ============================================================
   BOUTON "RETOUR AU CALENDRIER"
   ============================================================ */
function ajouterBoutonRetour() {
    const bouton = add([
        text("← Calendrier", { size: 16 }),
        pos(16, 16),
        color(...COULEUR_ENCRE),
        opacity(0.6),
        area(),
    ]);

    bouton.onClick(() => {
        window.location.href = "../../index.html";
    });

    return bouton;
}


/* ============================================================
   TUYAU (capuchon fleuri + corps étiré)
   ============================================================ */
function ajouterCollisionTuyau(x, y, hauteur) {
    add([
        rect(LARGEUR_TUYAU, hauteur),
        pos(x, y),
        area(),
        offscreen({ destroy: true }),
        opacity(0),
        "obstacle",
        "defilement",
    ]);
}

function ajouterVisuelTuyau(x, y, hauteur, capEnBas) {
    const hauteurCorps = hauteur - HAUTEUR_CAPUCHON;
    const yCorps = capEnBas ? y : y + HAUTEUR_CAPUCHON;
    const yCapuchon = capEnBas ? y + hauteurCorps : y;

    add([
        sprite("tuyau-corps", { width: LARGEUR_TUYAU, height: hauteurCorps }),
        pos(x, yCorps),
        offscreen({ destroy: true }),
        "defilement",
    ]);

    add([
        sprite("tuyau-capuchon", { width: LARGEUR_TUYAU + 10, height: HAUTEUR_CAPUCHON }),
        pos(x - 5, yCapuchon),
        offscreen({ destroy: true }),
        "defilement",
    ]);
}


/* ============================================================
   SCÈNE : MENU
   ============================================================ */
scene("menu", () => {
    ajouterFond();
    ajouterDecorFond();
    ajouterBoutonRetour();

    add([
        text("Flappy Bob", { size: 48 }),
        pos(width() / 2, height() * 0.28),
        anchor("center"),
        color(...COULEUR_ACCENT_FONCE),
    ]);

    const bobMenu = add([
        sprite("bob"),
        scale(0.5),
        pos(width() / 2, height() * 0.45),
        anchor("center"),
    ]);

    bobMenu.onUpdate(() => {
        bobMenu.pos.y = height() * 0.45 + Math.sin(time() * 3) * 10;
    });

    const reglesDuJeu = [
        "Clique, appuie sur Espace ou touche l'écran pour voler",
        "Évite les tuyaux",
        "Attrape les bonus pour t'aider",
    ];

    reglesDuJeu.forEach(function (ligne, index) {
        add([
            text(ligne, { size: 18 }),
            pos(width() / 2, height() * 0.6 + index * 28),
            anchor("center"),
            color(...COULEUR_ENCRE),
        ]);
    });

    add([
        text("Meilleur score : " + lireMeilleurScore(), { size: 16 }),
        pos(width() / 2, height() * 0.76),
        anchor("center"),
        color(...COULEUR_OR),
    ]);

    const invitation = add([
        text("Clique pour commencer", { size: 20 }),
        pos(width() / 2, height() * 0.87),
        anchor("center"),
        color(...COULEUR_ACCENT_FONCE),
    ]);

    invitation.onUpdate(() => {
        invitation.opacity = 0.6 + Math.sin(time() * 4) * 0.4;
    });

    onClick(() => go("jeu"));
    onKeyPress("space", () => go("jeu"));
});


/* ============================================================
   SCÈNE : JEU
   ============================================================ */
scene("jeu", () => {
    debug.timeScale = 1;

    ajouterFond();
    ajouterDecorFond();

    let jeuEnCours = true;

    const bob = add([
        sprite("bob"),
        scale(0.4),
        pos(width() * 0.1, height() / 3),
        area({ scale: 0.8 }),
        body({ jumpForce: FORCE_DU_SAUT }),
    ]);

    let score = 0;
    let vitesseActuelle = VITESSE_JEU_BASE; // Vitesse qui va augmenter !
    let tempsBonusRestant = 0;
    let bonusActif = null;

    // --- MOTEUR DE DÉFILEMENT ---
    onUpdate("defilement", (obj) => {
        if (!jeuEnCours) return;
        obj.pos.x -= vitesseActuelle * dt();
    });

    const texteScore = add([
        text(score, { size: 32 }),
        pos(24, 24),
        color(...COULEUR_ENCRE),
    ]);

    // --- UI DU BONUS ---
    const LARGEUR_BADGE = 150;
    const HAUTEUR_BADGE = 40;

    const badgeBonus = add([
        rect(LARGEUR_BADGE, HAUTEUR_BADGE, { radius: HAUTEUR_BADGE / 2 }),
        pos(width() / 2 - LARGEUR_BADGE / 2, 70),
        color(...COULEUR_FOND_BADGE),
        outline(2, rgb(...COULEUR_ACCENT)),
        opacity(0),
    ]);

    const iconeBadge = badgeBonus.add([
        sprite("icone-ralenti", { width: 22, height: 22 }),
        pos(20, HAUTEUR_BADGE / 2),
        anchor("left"),
    ]);

    const texteBadge = badgeBonus.add([
        text("0.0s", { size: 16 }),
        pos(50, HAUTEUR_BADGE / 2),
        anchor("left"),
        color(...COULEUR_ENCRE),
    ]);


    function ajouterObstacle() {
        if (!jeuEnCours) return;

        const hauteurTrou = rand(100, height() - 250);

        // Tuyau Haut
        ajouterCollisionTuyau(width(), 0, hauteurTrou);
        ajouterVisuelTuyau(width(), 0, hauteurTrou, true);

        // Marqueur de Score
        add([
            rect(20, TAILLE_TROU),
            pos(width(), hauteurTrou),
            area(),
            offscreen({ destroy: true }),
            opacity(0),
            "marqueur-score",
            "defilement",
        ]);

        // Tuyau Bas
        const yDebutBas = hauteurTrou + TAILLE_TROU;
        const hauteurBas = height() - yDebutBas;
        ajouterCollisionTuyau(width(), yDebutBas, hauteurBas);
        ajouterVisuelTuyau(width(), yDebutBas, hauteurBas, false);

        // Génération du Bonus
        if (rand(0, 1) < PROBABILITE_BONUS) {
            const yDeBase = hauteurTrou + (TAILLE_TROU / 2) + rand(-40, 40);

            const listeBonus = [
                { type: "ralenti", image: "icone-ralenti" },
                { type: "invincible", image: "icone-bouclier" },
                { type: "mini", image: "icone-mini" },
            ];

            const bonusChoisi = choose(listeBonus);

            const bonus = add([
                sprite(bonusChoisi.image, { width: 28, height: 28 }),
                anchor("center"),
                pos(width(), yDeBase),
                area({ scale: 0.8 }),
                offscreen({ destroy: true }),
                { typeBonus: bonusChoisi.type, imageSprite: bonusChoisi.image, yDeBase: yDeBase },
                "bonus",
                "defilement",
            ]);

            bonus.onUpdate(() => {
                bonus.pos.y = bonus.yDeBase + Math.sin(time() * 4) * 6;
            });
        }
    }


    // --- BOUCLE D'APPARITION INTELLIGENTE ---
    function programmerProchainObstacle() {
        if (!jeuEnCours) return;
        ajouterObstacle();

        // 1. Distance de base quand on est à la vitesse de départ
        const distanceDeBase = VITESSE_JEU_BASE * INTERVALLE_OBSTACLES_BASE;
        
        // 2. Astuce de Game Design : on écarte les tuyaux au fur et à mesure que ça accélère !
        // (vitesseActuelle - VITESSE_JEU_BASE) représente la vitesse "en plus".
        // On la multiplie par 0.8 pour ajouter des pixels d'écart supplémentaires.
        const distanceBonus = (vitesseActuelle - VITESSE_JEU_BASE) * 0.8;
        
        const distanceTotale = distanceDeBase + distanceBonus;

        // 3. On calcule le temps d'attente avec cette nouvelle distance
        const tempsAttente = distanceTotale / vitesseActuelle;

        wait(tempsAttente, programmerProchainObstacle);
    }
    
    // Lancer la première apparition
    programmerProchainObstacle();


    // --- LOGIQUE DES BONUS ---
    function desactiverAncienBonus() {
        if (bonusActif === "ralenti") {
            debug.timeScale = 1;
            bob.unuse("outline");
        } else if (bonusActif === "invincible") {
            bob.estInvincible = false;
            bob.opacity = 1;
        } else if (bonusActif === "mini") {
            bob.use(scale(0.4));
        }

        bonusActif = null;
        badgeBonus.opacity = 0;
    }

    function activerBonus(type, imageSprite) {
        if (bonusActif) desactiverAncienBonus();

        bonusActif = type;
        badgeBonus.opacity = 1;
        iconeBadge.use(sprite(imageSprite, { width: 22, height: 22 }));

        if (type === "ralenti") {
            tempsBonusRestant = DUREE_RALENTI;
            debug.timeScale = 0.7;
            bob.use(outline(4, rgb(...COULEUR_ACCENT)));
        } else if (type === "invincible") {
            tempsBonusRestant = DUREE_INVINCIBILITE;
            bob.estInvincible = true;
            bob.opacity = 0.4;
        } else if (type === "mini") {
            tempsBonusRestant = DUREE_MINI;
            bob.use(scale(0.2));
        }
    }


    function terminerLaPartie() {
        if (!jeuEnCours) return;
        jeuEnCours = false;

        debug.timeScale = 1;

        shake(6);
        flash(rgb(...COULEUR_ACCENT_FONCE), 0.25);

        const estRecord = score > lireMeilleurScore();
        if (estRecord) {
            sauvegarderMeilleurScore(score);
        }

        wait(0.7, () => {
            go("gameover", { score: score, estRecord: estRecord });
        });
    }


    // --- CONTRÔLES ---
    onClick(() => {
        if (jeuEnCours) bob.jump();
    });

    onKeyPress("space", () => {
        if (jeuEnCours) bob.jump();
    });


    // --- UPDATE GÉNÉRAL ---
    onUpdate(() => {
        if (!jeuEnCours) return;

        if (bob.pos.y < 0 || bob.pos.y > height()) {
            terminerLaPartie();
        }

        if (tempsBonusRestant > 0) {
            tempsBonusRestant -= dt();
            texteBadge.text = tempsBonusRestant.toFixed(1) + "s";

            if (tempsBonusRestant <= 0) {
                desactiverAncienBonus();
            }
        }
    });


    // --- COLLISIONS ---
    bob.onCollide("obstacle", () => {
        if (bob.estInvincible) return;
        terminerLaPartie();
    });

    bob.onCollide("marqueur-score", (marqueur) => {
        if (!jeuEnCours) return;
        score += 1;
        texteScore.text = score;
        destroy(marqueur);
        
        // Accélération dynamique du jeu !
        if (vitesseActuelle < VITESSE_MAX) {
            vitesseActuelle += ACCELERATION_PAR_POINT;
        }
    });

    bob.onCollide("bonus", (bonus) => {
        destroy(bonus);
        activerBonus(bonus.typeBonus, bonus.imageSprite);
    });

});


/* ============================================================
   SCÈNE : GAME OVER
   ============================================================ */
scene("gameover", ({ score, estRecord }) => {
    ajouterFond();
    ajouterBoutonRetour();

    add([
        text("Perdu !", { size: 40 }),
        pos(width() / 2, height() * 0.32),
        anchor("center"),
        color(...COULEUR_ACCENT_FONCE),
    ]);

    add([
        text("Score : " + score, { size: 24 }),
        pos(width() / 2, height() * 0.45),
        anchor("center"),
        color(...COULEUR_ENCRE),
    ]);

    if (estRecord) {
        add([
            text("✨ Nouveau record ! ✨", { size: 20 }),
            pos(width() / 2, height() * 0.53),
            anchor("center"),
            color(...COULEUR_OR),
        ]);
    } else {
        add([
            text("Meilleur score : " + lireMeilleurScore(), { size: 18 }),
            pos(width() / 2, height() * 0.53),
            anchor("center"),
            color(...COULEUR_ENCRE),
        ]);
    }

    const invitation = add([
        text("Clique pour rejouer", { size: 18 }),
        pos(width() / 2, height() * 0.68),
        anchor("center"),
        color(...COULEUR_ACCENT_FONCE),
    ]);

    invitation.onUpdate(() => {
        invitation.opacity = 0.6 + Math.sin(time() * 4) * 0.4;
    });

    onClick(() => go("jeu"));
    onKeyPress("space", () => go("jeu"));
});


go("menu");