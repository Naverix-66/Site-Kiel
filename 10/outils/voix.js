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

   GÉNÉRER AVEC PIPER (voir REGLAGES plus bas) :

       node outils/voix.js --echantillon      3 répliques par peluche
       node outils/voix.js --generer          toutes celles qui manquent

   Il faut piper (pip install piper-tts, dans le venv activé) et
   ffmpeg. Les modèles .onnx sont cherchés dans ~/piper-voix, ou
   dans le dossier donné par la variable PIPER_VOIX.
   Pour réécouter une peluche après un réglage : supprimer ses
   fichiers (voir A_ENREGISTRER.md) et relancer.
   ============================================================ */
const fs = require("fs");
const os = require("os");
const { spawnSync } = require("child_process");
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

// Piper, peluche par peluche. À régler À L'OREILLE :
//   modele   le fichier .onnx (sans extension) dans ~/piper-voix
//   locuteur pour les modèles à plusieurs voix (upmc : 0 ou 1)
//   lenteur  --length-scale de Piper : > 1 plus lent, < 1 plus rapide
//   hauteur  1 = naturelle, 1.4 = bien plus aigu, 0.8 = plus grave
const REGLAGES = {
    bluey:  { modele: "fr_FR-tom-medium",   lenteur: 0.85, hauteur: 1.55 },
    fraisy: { modele: "fr_FR-siwis-medium", lenteur: 0.9,  hauteur: 1.3 },
    cakey:  { modele: "fr_FR-upmc-medium",  locuteur: 0, lenteur: 1.0, hauteur: 1.1 },
    rosy:   { modele: "fr_FR-siwis-medium", lenteur: 1.0,  hauteur: 1.05 },
    samsam: { modele: "fr_FR-upmc-medium",  locuteur: 1, lenteur: 1.05, hauteur: 0.93 },
    doudou: { modele: "fr_FR-tom-medium",   lenteur: 1.1,  hauteur: 0.92 },
};

// Ce que Piper PRONONCE — le texte affiché et l'empreinte, eux, ne
// changent pas. Les points de suspension en tête (« ...Bob. ») et les
// tirets de phrase coupée (« C'est— ») le font bafouiller.
function texteAPrononcer(texte) {
    return texte
        .replace(/^[\s.…—-]+/, "")              // « ...Bob. » -> « Bob. »
        .replace(/\s*[—–]\s*$/, "...")          // « C'est— » -> « C'est... »
        .replace(/\s*[—–]\s*/g, ", ")           // tiret au milieu -> virgule
        .replace(/…/g, "...")
        .replace(/([!?])[!?]+/g, "$1");          // « !!! » -> « ! »
}

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

// 2. Générer avec Piper (seulement avec --generer / --echantillon)
const ECHANTILLON = process.argv.includes("--echantillon");
if (ECHANTILLON || process.argv.includes("--generer")) {
    const dossierModeles = process.env.PIPER_VOIX || path.join(os.homedir(), "piper-voix");
    const ffmpegFiltres = spawnSync("ffmpeg", ["-hide_banner", "-filters"], { encoding: "utf8" });
    if (ffmpegFiltres.error) { console.error("ffmpeg introuvable."); process.exit(1); }
    // rubberband change la hauteur sans changer la vitesse. Sans lui,
    // on accélère le son (effet « chipmunk ») : moins propre, mais ça marche.
    const rubberband = /rubberband/.test(ffmpegFiltres.stdout);
    const tmp = path.join(os.tmpdir(), "voix_peluche.wav");

    Object.keys(repliques).sort().forEach(function (qui) {
        const r = REGLAGES[qui];
        if (!r) { console.warn("Pas de réglage pour " + qui + ", ignoré."); return; }
        const modele = path.join(dossierModeles, r.modele + ".onnx");
        if (!fs.existsSync(modele)) { console.error("Modèle introuvable : " + modele); process.exit(1); }

        // La fréquence d'échantillonnage du modèle (16 000 pour « low », 22 050 sinon).
        const frequence = JSON.parse(fs.readFileSync(modele + ".json", "utf8")).audio.sample_rate;
        let liste = repliques[qui].filter(x => !presents[x.cle]);
        if (ECHANTILLON) liste = liste.slice(0, 3);
        liste.forEach(function (x, i) {
            process.stdout.write("\r" + qui + " " + (i + 1) + "/" + liste.length + "   ");
            const args = ["-m", "piper", "-m", modele, "-f", tmp, "--length-scale", String(r.lenteur)];
            if (r.locuteur !== undefined) args.push("--speaker", String(r.locuteur));
            // Le texte passe par l'entrée standard : marche avec toutes les versions de Piper.
            const p = spawnSync(process.env.PIPER_PYTHON || "python3", args, { input: texteAPrononcer(x.texte), encoding: "utf8" });
            if (p.status !== 0) { console.error("\nPiper a échoué :\n" + p.stderr); process.exit(1); }

            const filtre = rubberband
                ? "rubberband=pitch=" + r.hauteur
                : "asetrate=" + frequence + "*" + r.hauteur + ",aresample=" + frequence;
            const sortie = path.join(DOSSIER_VOIX, x.cle + ".mp3");
            const f = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-af", filtre,
                "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "6", sortie], { encoding: "utf8" });
            if (f.status !== 0) { console.error("\nffmpeg a échoué :\n" + f.stderr); process.exit(1); }
            presents[x.cle] = x.cle + ".mp3";
        });
        if (liste.length) console.log("");
    });
}

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

// 3. La liste des voix disponibles, pour le jeu ----------------
const dispo = {};
vues.forEach(function (cle) { if (presents[cle]) dispo[cle] = presents[cle]; });
fs.writeFileSync(path.join(RACINE, "js", "voix_dispo.js"),
    "// Écrit par outils/voix.js — ne pas modifier à la main.\n" +
    "const VOIX_DISPO = " + JSON.stringify(dispo, null, 1) + ";\n");

console.log(total + " répliques, " + faits + " déjà enregistrées.");
