/* ============================================================
   outils/voix.js — à lancer depuis le dossier 10 :

       node outils/voix.js

   1. Relève toutes les répliques des peluches (sauf Bob, et sauf
      la narration) dans js/*.js, et écrit assets/voix/A_ENREGISTRER.md :
      pour chaque peluche, sa voix à imiter puis ses répliques, chacune
      avec le NOM DE FICHIER à donner à l'enregistrement.
   2. Regarde quels fichiers sont déjà dans assets/voix et écrit
      js/voix_dispo.js, la liste que lit le jeu.

   Relancer après avoir déposé de nouveaux fichiers audio.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const DOSSIER_VOIX = path.join(RACINE, "assets", "voix");
const MUETS = ["bob"];
const EXTENSIONS = [".mp3", ".ogg", ".wav", ".m4a"];

// Ce qu'on décrit à l'outil de synthèse vocale, peluche par peluche.
const PORTRAITS = {
    bluey:  "Tout petit ourson bleu, garçon. Voix très aiguë d'enfant de 5 ans, surexcitée, parle vite, crie souvent. Débit rapide.",
    fraisy: "Petite lapine, oreilles en fraise. Voix aiguë de petite fille, espiègle, gourmande, rieuse, un peu chaotique.",
    cakey:  "Grande peluche, fille, l'âme de la fête. Voix féminine chaleureuse et enjouée, malicieuse (elle garde des surprises).",
    rosy:   "Lapine blanche avec une rose. Voix féminine douce, tendre, posée, un peu rêveuse.",
    samsam: "Très gros ourson gris en pyjama, garçon. Voix grave, lente, gentille et rassurante, un peu timide.",
    doudou: "Très vieil ourson abîmé, le sage. Voix masculine âgée, grave et un peu éraillée, calme, parle lentement.",
};

// FNV-1a 32 bits — IDENTIQUE à empreinteVoix() de js/voix.js.
function empreinteVoix(qui, texte) {
    const s = (qui + "|" + texte).normalize("NFC");
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
}

// 1. Relever les répliques ------------------------------------
const MOTIF = /qui:\s*"(\w+)"\s*,\s*texte:\s*"((?:[^"\\]|\\.)*)"/g;
const repliques = {};   // qui -> [{ cle, texte, source }]
const vues = new Set();

fs.readdirSync(path.join(RACINE, "js")).filter(f => f.endsWith(".js")).sort().forEach(function (f) {
    const code = fs.readFileSync(path.join(RACINE, "js", f), "utf8");
    let m;
    while ((m = MOTIF.exec(code))) {
        const qui = m[1];
        if (MUETS.includes(qui)) continue;
        const texte = JSON.parse('"' + m[2].replace(/\\'/g, "'") + '"');
        if (!/\p{L}/u.test(texte)) continue;   // « ... » : un silence, rien à dire
        const cle = empreinteVoix(qui, texte);
        if (vues.has(cle)) continue;
        vues.add(cle);
        (repliques[qui] = repliques[qui] || []).push({ cle, texte, source: f });
    }
});

fs.mkdirSync(DOSSIER_VOIX, { recursive: true });
const presents = {};
fs.readdirSync(DOSSIER_VOIX).forEach(function (f) {
    const ext = path.extname(f).toLowerCase();
    if (EXTENSIONS.includes(ext)) presents[path.basename(f, ext)] = f;
});

let md = "# Répliques à enregistrer\n\n" +
    "Généré par `node outils/voix.js` — ne pas modifier à la main.\n\n" +
    "Chaque réplique s'enregistre dans **assets/voix/** sous le nom indiqué " +
    "(`.mp3` conseillé ; `.ogg`, `.wav`, `.m4a` acceptés), puis on relance le script.\n" +
    "✅ = fichier déjà présent.\n";
let total = 0, faits = 0;
Object.keys(repliques).sort().forEach(function (qui) {
    const liste = repliques[qui];
    md += "\n## " + qui + " (" + liste.length + " répliques)\n\n";
    md += "**Voix :** " + (PORTRAITS[qui] || "à décrire") + "\n\n";
    liste.forEach(function (r) {
        const fait = presents[r.cle];
        total++; if (fait) faits++;
        md += "- " + (fait ? "✅ " : "") + "`" + r.cle + "` — " + r.texte + "\n";
    });
});
md = md.replace("✅ = fichier", faits + " / " + total + " faites. ✅ = fichier");
fs.writeFileSync(path.join(DOSSIER_VOIX, "A_ENREGISTRER.md"), md);

// 2. La liste des voix disponibles, pour le jeu ----------------
const dispo = {};
vues.forEach(function (cle) { if (presents[cle]) dispo[cle] = presents[cle]; });
fs.writeFileSync(path.join(RACINE, "js", "voix_dispo.js"),
    "// Écrit par outils/voix.js — ne pas modifier à la main.\n" +
    "const VOIX_DISPO = " + JSON.stringify(dispo, null, 1) + ";\n");

console.log(total + " répliques, " + faits + " déjà enregistrées.");
