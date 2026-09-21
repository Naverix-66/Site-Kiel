/* ============================================================
   PEINDRE EN PIXELS — pour les petits jeux
   ============================================================
   Evan : les dessins des petits jeux étaient « pas très clean ».
   C'est vrai : des formes lisses, sans contour, au milieu d'un
   jeu en pixel art.

   Tout ce qui est dessiné dans les petits jeux est donc peint
   ICI, pixel par pixel, sur des <canvas>, une seule fois au
   chargement — contour sombre, ombre, reflet, comme les meubles
   du pack. Le jeu n'a ensuite plus qu'à poser ces images.

   Ce fichier ne contient que les pinceaux. Les tableaux sont dans
   chaque jeu (jeu_vaisselle.js, jeu_couture.js) et dans reveil.js.
   ============================================================ */


function nouvelleToile(largeur, hauteur) {
    const toile = document.createElement("canvas");
    toile.width = largeur;
    toile.height = hauteur;
    const ctx = toile.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { toile: toile, ctx: ctx };
}


function css(c) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (c[3] === undefined ? 1 : c[3]) + ")";
}


// Un rectangle plein, aligné sur les pixels.
function pave(ctx, x, y, l, h, c) {
    if (l <= 0 || h <= 0) return;
    ctx.fillStyle = css(c);
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(l), Math.round(h));
}


function pixel(ctx, x, y, c) {
    pave(ctx, x, y, 1, 1, c);
}


// Un rectangle aux coins cassés d'un pixel : l'arrondi du pixel art.
function paveArrondi(ctx, x, y, l, h, c) {
    if (l < 3 || h < 3) { pave(ctx, x, y, l, h, c); return; }
    pave(ctx, x + 1, y, l - 2, h, c);
    pave(ctx, x, y + 1, 1, h - 2, c);
    pave(ctx, x + l - 1, y + 1, 1, h - 2, c);
}


// Une boîte : un contour d'un pixel, et le fond dedans.
function boite(ctx, x, y, l, h, fond, contour) {
    paveArrondi(ctx, x, y, l, h, contour);
    paveArrondi(ctx, x + 1, y + 1, l - 2, h - 2, fond);
}


// Un disque plein, ligne par ligne.
function disque(ctx, cx, cy, r, c) {
    for (let dy = -r; dy <= r; dy++) {
        const w = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
        pave(ctx, cx - w, cy + dy, 2 * w + 1, 1, c);
    }
}


// Un disque avec son contour.
function rond(ctx, cx, cy, r, fond, contour) {
    disque(ctx, cx, cy, r, contour);
    if (r > 1) disque(ctx, cx, cy, r - 1, fond);
}


// Une ligne d'épaisseur 1, pixel par pixel (Bresenham).
function trait(ctx, x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
        pixel(ctx, x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
    }
}


function eclaircir(c, k) {
    return [0, 1, 2].map(function (i) { return Math.round(c[i] + (255 - c[i]) * k); }).concat(c.length > 3 ? [c[3]] : []);
}

function assombrir(c, k) {
    return [0, 1, 2].map(function (i) { return Math.round(c[i] * (1 - k)); }).concat(c.length > 3 ? [c[3]] : []);
}


// La patte de Bob (brun presque noir, coussinet crème), vue de
// dessus : elle tient ce qu'on déplace dans les deux jeux.
function peindreLaPatte() {
    const t = nouvelleToile(15, 15);
    rond(t.ctx, 7, 7, 7, [62, 49, 40], [28, 22, 18]);
    disque(t.ctx, 7, 8, 3, [233, 212, 186]);
    pixel(t.ctx, 4, 4, [96, 78, 66]);
    pixel(t.ctx, 5, 3, [96, 78, 66]);
    return t.toile;
}

loadSprite("patte_de_bob", peindreLaPatte());
