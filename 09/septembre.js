kaplay({
    background: "#FBF3EE",
});

setGravity(1600);

loadSprite("bob", "flappy_bob.png");
loadSprite("icone-ralenti", "sablier.png");   // <- adapte le chemin/nom à ton fichier

scene("jeu", () => {

    debug.timeScale = 1;   // sécurité : chaque nouvelle partie démarre à vitesse normale

    let SPEED = 200;

    const bob = add([
        sprite("bob"),
        scale(0.4),
        pos(width() * 0.1, height() / 3),
        area({ scale: 0.8 }),
        body(),
    ]);

    let score = 0;

    const textScore = add([
        text(score),
        pos(24, 24),
    ]);

    function ajouterObstacle() {
        const hauteurTrou = rand(100, height() - 250);
        const tailleTrou = 300;
        const largeurTuyau = 100;

        add([
            rect(largeurTuyau, hauteurTrou),
            pos(width(), 0),
            area(),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            "obstacle",
        ]);

        add([
            rect(20, tailleTrou),
            pos(width(), hauteurTrou + (tailleTrou / 2)),
            area(),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            opacity(0),
            "marqueur-score",
        ]);

        add([
            rect(largeurTuyau, height() - tailleTrou),
            pos(width(), hauteurTrou + tailleTrou),
            area(),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            "obstacle",
        ]);

        if (rand(0, 1) < 0.1) {
            const typesDisponibles = ["ralenti"];
            const type = choose(typesDisponibles);

            const centreDuTrou = hauteurTrou + (tailleTrou / 2);
            const y = centreDuTrou + rand(-40, 40);

            const bonusIcone = add([
                sprite("icone-ralenti", { width: 28, height: 28 }),
                anchor("center"),
                pos(width(), y),
                area({ scale: 0.8 }),
                move(LEFT, SPEED),
                offscreen({ destroy: true }),
                { typeBonus: type },
                "bonus",
            ]);

            // petit flottement pour un effet plus "vivant", moins statique
            bonusIcone.onUpdate(() => {
                bonusIcone.pos.y += Math.sin(time() * 4) * 0.5;
            });
        }
    }

    function activerBonus(type) {
        if (type === "ralenti") {
            debug.timeScale = 0.7;

            bob.use(outline(4, rgb(100, 150, 255)));

            wait(15, () => {
                debug.timeScale = 1;
                bob.unuse("outline");
            });
        }
    }

    function finPartie() {
        debug.timeScale = 1;   // <- on annule le ralenti tout de suite, avant même de changer de scène
        go("gameover");
    }

    loop(2, ajouterObstacle);

    onClick(() => {
        bob.jump(500);
    });

    onKeyPress("space", () => {
        bob.jump(500);
    });

    onUpdate(() => {
        if (bob.pos.y < 0 || bob.pos.y > height()) {
            finPartie();
        }
    });

    bob.onCollide("obstacle", () => {
        finPartie();
    });

    bob.onCollide("marqueur-score", (marqueur) => {
        score += 1;
        textScore.text = score;
        destroy(marqueur);
    });

    bob.onCollide("bonus", (bonus) => {
        destroy(bonus);
        activerBonus(bonus.typeBonus);
    });

});

scene("gameover", () => {
    add([
        text("Perdu ! Clique pour rejouer"),
        pos(width() / 2, height() / 2),
        anchor("center"),
    ]);

    onClick(() => go("jeu"));
    onKeyPress("space", () => go("jeu"));
});

go("jeu");