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

   GÉNÉRER (Gemini par défaut, voir GEMINI plus bas) :

       export GEMINI_API_KEY=ta_clé          (aistudio.google.com)
       node outils/voix.js --echantillon      3 répliques par peluche
       node outils/voix.js --generer          toutes celles qui manquent

   Les indications de jeu (« en chuchotant »…) se mettent dans
   outils/voix_directions.json, champ « jeu ». Le script reprend là
   où il s'est arrêté : un quota atteint n'est pas grave.

   Avec Piper : ajouter --moteur piper (voir REGLAGES). Il faut piper (pip install piper-tts, dans le venv activé) et
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

// 2. Les indications de jeu, réplique par réplique ---------------
// outils/voix_directions.json : [{ cle, qui, texte, jeu }], par peluche.
// Le script tient qui/texte à jour ; « jeu » est à remplir (à la main
// ou par une IA) : « en chuchotant, au bord des larmes »… Vide = rien.
// Ces indications vivent ICI et pas dans le texte du jeu : sinon elles
// s'afficheraient à l'écran, et changeraient l'empreinte de la réplique.
const FICHIER_DIRECTIONS = path.join(__dirname, "voix_directions.json");
const anciennes = {};
if (fs.existsSync(FICHIER_DIRECTIONS)) {
    JSON.parse(fs.readFileSync(FICHIER_DIRECTIONS, "utf8")).forEach(d => { anciennes[d.cle] = d.jeu; });
}
const directions = {};   // empreinte -> indication
const tableau = [];
Object.keys(repliques).sort().forEach(function (qui) {
    repliques[qui].forEach(function (x) {
        directions[x.cle] = anciennes[x.cle] || "";
        tableau.push({ cle: x.cle, qui: qui, texte: x.texte, jeu: directions[x.cle] });
    });
});
// Une réplique par ligne : lisible, et facile à faire remplir par une IA.
fs.writeFileSync(FICHIER_DIRECTIONS, "[\n" + tableau.map(d => " " + JSON.stringify(d)).join(",\n") + "\n]\n");

// 3. Générer (seulement avec --generer / --echantillon) ----------
const ECHANTILLON = process.argv.includes("--echantillon");
const i_moteur = process.argv.indexOf("--moteur");
const MOTEUR = i_moteur > 0 ? process.argv[i_moteur + 1] : "gemini";
const attendre = ms => new Promise(r => setTimeout(r, ms));

function verifierFfmpeg() {
    const f = spawnSync("ffmpeg", ["-hide_banner", "-filters"], { encoding: "utf8" });
    if (f.error) { console.error("ffmpeg introuvable."); process.exit(1); }
    // rubberband change la hauteur sans changer la vitesse. Sans lui,
    // on accélère le son (effet « chipmunk ») : moins propre, mais ça marche.
    return /rubberband/.test(f.stdout);
}

// Du son brut (entree, avec ses options d'entrée ffmpeg) à un .mp3 à la bonne hauteur.
function versMp3(optionsEntree, entree, frequence, hauteur, sortie, rubberband) {
    const args = ["-y", "-loglevel", "error"].concat(optionsEntree, ["-i", entree]);
    if (hauteur && hauteur !== 1) {
        args.push("-af", rubberband
            ? "rubberband=pitch=" + hauteur
            : "asetrate=" + frequence + "*" + hauteur + ",aresample=" + frequence);
    }
    args.push("-ac", "1", "-codec:a", "libmp3lame", "-q:a", "6", sortie);
    const f = spawnSync("ffmpeg", args, { encoding: "utf8" });
    if (f.status !== 0) { console.error("\nffmpeg a échoué :\n" + f.stderr); process.exit(1); }
}

function aGenerer(qui) {
    let liste = repliques[qui].filter(x => !presents[x.cle]);
    return ECHANTILLON ? liste.slice(0, 3) : liste;
}

async function genererPiper() {
    const dossierModeles = process.env.PIPER_VOIX || path.join(os.homedir(), "piper-voix");
    const rubberband = verifierFfmpeg();
    const tmp = path.join(os.tmpdir(), "voix_peluche.wav");

    Object.keys(repliques).sort().forEach(function (qui) {
        const r = REGLAGES[qui];
        if (!r) { console.warn("Pas de réglage pour " + qui + ", ignoré."); return; }
        const modele = path.join(dossierModeles, r.modele + ".onnx");
        if (!fs.existsSync(modele)) { console.error("Modèle introuvable : " + modele); process.exit(1); }

        // La fréquence d'échantillonnage du modèle (16 000 pour « low », 22 050 sinon).
        const frequence = JSON.parse(fs.readFileSync(modele + ".json", "utf8")).audio.sample_rate;
        const liste = aGenerer(qui);
        liste.forEach(function (x, i) {
            process.stdout.write("\r" + qui + " " + (i + 1) + "/" + liste.length + "   ");
            const args = ["-m", "piper", "-m", modele, "-f", tmp, "--length-scale", String(r.lenteur)];
            if (r.locuteur !== undefined) args.push("--speaker", String(r.locuteur));
            // Le texte passe par l'entrée standard : marche avec toutes les versions de Piper.
            const p = spawnSync(process.env.PIPER_PYTHON || "python3", args, { input: texteAPrononcer(x.texte), encoding: "utf8" });
            if (p.status !== 0) { console.error("\nPiper a échoué :\n" + p.stderr); process.exit(1); }
            versMp3([], tmp, frequence, r.hauteur, path.join(DOSSIER_VOIX, x.cle + ".mp3"), rubberband);
            presents[x.cle] = x.cle + ".mp3";
        });
        if (liste.length) console.log("");
    });
}

// Gemini : une voix de base par peluche (voir la liste des voix dans
// la doc « Gemini speech generation »), son portrait comme consigne,
// et l'indication de jeu de la réplique (voix_directions.json).
const GEMINI = {
    bluey:  { voix: "Fenrir",     hauteur: 1.15 },
    fraisy: { voix: "Leda",       hauteur: 1.1 },
    cakey:  { voix: "Laomedeia",  hauteur: 1 },
    rosy:   { voix: "Achernar",   hauteur: 1 },
    samsam: { voix: "Umbriel",    hauteur: 0.95 },
    doudou: { voix: "Algenib",    hauteur: 1 },
};

function consigneGemini(qui, x) {
    const jeu = directions[x.cle];
    return "Tu doubles " + qui + ", une peluche dans un jeu vidéo. Sa voix : " + PORTRAITS[qui] +
        (jeu ? " Pour cette réplique, joue-la " + jeu + "." : "") +
        " Dis en français, exactement et uniquement, la réplique suivante :\n" + x.texte;
}

async function appelGemini(cle, modele, voix, consigne) {
    for (let essai = 1; essai <= 4; essai++) {
        const rep = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + modele + ":generateContent", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": cle },
            body: JSON.stringify({
                contents: [{ parts: [{ text: consigne }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voix } } },
                },
            }),
        });
        if (rep.ok) {
            const json = await rep.json();
            const part = json.candidates && json.candidates[0].content.parts.find(p => p.inlineData);
            if (part) return Buffer.from(part.inlineData.data, "base64");
            console.warn("\nRéponse sans audio, nouvel essai.");
        } else if (rep.status === 429 || rep.status >= 500) {
            const detail = await rep.text();
            // « limit: 0 » : ce modèle n'est pas du tout dans l'offre gratuite.
            // « PerDay » : le quota du jour est épuisé. Attendre ne sert à rien.
            if (/limit: 0\b/.test(detail) || /PerDay/i.test(detail)) {
                console.error("\nGemini refuse (quota) :\n" + detail.slice(0, 800));
                return null;
            }
            // Sinon, trop de requêtes à la minute ou serveur occupé : on souffle.
            console.warn("\nGemini " + rep.status + ", pause d'une minute (essai " + essai + "/4)…");
            await attendre(60000);
        } else {
            throw new Error("Gemini " + rep.status + " : " + await rep.text());
        }
    }
    return null;   // quota du jour sans doute épuisé
}

async function genererGemini() {
    const cle = process.env.GEMINI_API_KEY;
    if (!cle) { console.error("Il manque la clé : export GEMINI_API_KEY=..."); process.exit(1); }
    const modele = process.env.GEMINI_MODELE || "gemini-2.5-flash-preview-tts";
    const pause = Number(process.env.GEMINI_PAUSE || 7000);   // ~8 requêtes / minute
    const rubberband = verifierFfmpeg();
    const tmp = path.join(os.tmpdir(), "voix_peluche.pcm");

    for (const qui of Object.keys(repliques).sort()) {
        const g = GEMINI[qui];
        if (!g) { console.warn("Pas de voix Gemini pour " + qui + ", ignoré."); continue; }
        const liste = aGenerer(qui);
        for (let i = 0; i < liste.length; i++) {
            const x = liste[i];
            process.stdout.write("\r" + qui + " " + (i + 1) + "/" + liste.length + "   ");
            const pcm = await appelGemini(cle, modele, g.voix, consigneGemini(qui, x));
            if (!pcm) {
                console.log("\nGemini refuse toujours : quota atteint ? Ce qui est fait est gardé, relance plus tard.");
                return;
            }
            fs.writeFileSync(tmp, pcm);
            // Gemini renvoie du PCM brut : 16 bits, 24 kHz, mono.
            versMp3(["-f", "s16le", "-ar", "24000", "-ac", "1"], tmp, 24000, g.hauteur,
                path.join(DOSSIER_VOIX, x.cle + ".mp3"), rubberband);
            presents[x.cle] = x.cle + ".mp3";
            await attendre(pause);
        }
        if (liste.length) console.log("");
    }
}

async function principal() {
        if (ECHANTILLON || process.argv.includes("--generer")) {
            if (MOTEUR === "piper") await genererPiper();
            else if (MOTEUR === "gemini") await genererGemini();
            else { console.error("Moteur inconnu : " + MOTEUR); process.exit(1); }
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

    // 4. La liste des voix disponibles, pour le jeu ----------------
    const dispo = {};
    vues.forEach(function (cle) { if (presents[cle]) dispo[cle] = presents[cle]; });
    fs.writeFileSync(path.join(RACINE, "js", "voix_dispo.js"),
        "// Écrit par outils/voix.js — ne pas modifier à la main.\n" +
        "const VOIX_DISPO = " + JSON.stringify(dispo, null, 1) + ";\n");

    console.log(total + " répliques, " + faits + " déjà enregistrées.");
}

principal();
