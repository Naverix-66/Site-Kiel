/* ============================================================
   LE CASTING
   ============================================================
   Que des DONNÉES. Aucune logique ici.

   Le champ "voix" n'est pas décoratif : c'est le contrat
   d'écriture du personnage. Avant d'écrire la moindre réplique,
   on relit sa voix. C'est ce qui fait qu'au bout de 40 dialogues
   les personnages ne se mettent pas tous à parler pareil.

   ------------------------------------------------------------
   AJOUTER UN PERSONNAGE — les 3 endroits, et rien d'autre

   1. ICI : une entrée avec nom, description, traits, voix, taille
      et couleurPlaceholder. La VOIX est obligatoire : un
      personnage sans contrat d'écriture finit toujours par parler
      comme Bob.

   2. Dans acte1.js, une ligne dans CASTING_STUDIO : sa case sur
      le plan, et la fonction qui le fait parler.

   3. Dans acte1.js toujours, cette fonction de dialogue.

   C'est tout. Tant qu'il n'a pas de dessin, il apparaît comme une
   pastille de sa couleur avec son nom au-dessus, et il est
   jouable tout de suite.

   ------------------------------------------------------------
   ET QUAND SON DESSIN ARRIVE (une 4e étape, facultative)

   La planche générée (même gabarit que Bob) s'ajoute dans
   outils/refaire_peluches.ps1, qui produit assets/peluches/<clé>_anim.png
   et son portrait. On ajoute ensuite la clé à PELUCHES_DESSINEES
   dans moteur.js. Rien d'autre ne change.

   ------------------------------------------------------------
   taille : sa hauteur par rapport à Bob (1 = Bob, ~70 cm), soit
   taille × HAUTEUR_BOB pixels dans le monde. Sa planche est
   dessinée à cette hauteur × FINESSE_PELUCHES, puis affichée
   réduite d'autant (config.js).
   ⚠️ Si on change une taille, il faut la changer aussi dans
   refaire_peluches.ps1 et relancer le script.

   couleurPlaceholder : la pastille tant qu'il n'a pas de dessin,
   et le fond de son portrait dans la boîte de dialogue.
   ============================================================ */

const PERSONNAGES = {

    bob: {
        nom: "Bob",
        role: "héros",
        description: "Grand ours en peluche brun très foncé, presque noir. "
            + "Museau ovale crème, gros nez noir, coussinets crème sous les pieds. "
            + "Porte un t-shirt blanc et un short noir à bandes blanches. "
            + "Le préféré de Klara, son héros.",
        traits: ["téméraire", "intrépide", "courageux", "fort", "très gentil", "protecteur"],
        voix: "Direct, franc, jamais ironique. Phrases courtes et affirmatives. "
            + "Ne se plaint jamais, minimise le danger. Quand il parle de Rosy, "
            + "il perd ses moyens et bafouille — SEUL moment où il hésite.",
        taille: 1.0,
        couleurPlaceholder: [62, 49, 40],   // #3E3128 — le brun foncé réel
    },

    rosy: {
        nom: "Rosy",
        role: "l'aimée / la disparue",
        description: "Lapin Jellycat blanc, tient une rose dans les pattes.",
        traits: ["amoureuse de Bob", "coquette", "inquiète", "très mignonne", "protectrice", "la maman du groupe"],
        voix: "Douce et attentionnée, mais s'inquiète à voix haute pour tout le monde. "
            + "Pose des questions du type « tu as bien... ? ». Se corrige elle-même. "
            + "Avec Bob : timide, phrases qui s'arrêtent en plein milieu.",
        taille: 0.9,
        couleurPlaceholder: [250, 246, 244],
    },

    samsam: {
        nom: "Samsam",
        role: "le grand cœur",
        description: "Très gros ourson gris, toujours en pyjama.",
        traits: ["intelligent", "immense", "lent", "d'une gentillesse excessive"],
        voix: "Parle lentement, en peu de mots, et dit des choses étonnamment justes. "
            + "Dit OUI à tout, y compris à ce qu'il ne peut pas faire — puis s'excuse "
            + "longuement de ne pas avoir pu. Ne se plaint jamais de rien, et surtout "
            + "pas de lui-même. "
            + "⚠️ CE N'EST PAS UN PARESSEUX. C'est l'erreur à ne jamais faire avec lui. "
            + "S'il ne se lève pas, c'est qu'il n'y ARRIVE pas, et ça lui coûte "
            + "énormément. Le gag, c'est qu'il aide plus que tout le monde sans bouger "
            + "d'un centimètre — jamais qu'il refuse d'aider. Et une fois, ça doit "
            + "serrer la gorge.",
        taille: 1.6,
        couleurPlaceholder: [150, 150, 158],
    },

    fraisy: {
        nom: "Fraisy",
        role: "le chaos joyeux",
        description: "Lapin à peine plus grand que Bluey, oreilles à texture de fraise.",
        traits: ["joueuse", "marrante", "un peu fofolle"],
        voix: "Débit rapide, part en digression, change de sujet en plein milieu "
            + "d'une phrase puis revient. Prend tout à la légère, même le danger. "
            + "Ramène systématiquement la conversation à la nourriture.",
        taille: 0.8,
        couleurPlaceholder: [232, 106, 122],
    },

    bluey: {
        nom: "Bluey",
        role: "la petite bombe d'énergie",
        description: "Tout petit ourson bleu.",
        traits: ["hyper joueur", "drôle", "foufou", "mignon", "innocent"],
        voix: "MAJUSCULES ET POINTS D'EXCLAMATION. Se contredit d'une phrase à l'autre "
            + "sans s'en rendre compte. Ne comprend pas la gravité de la situation, "
            + "ce qui est drôle — puis, une fois, bouleversant.",
        taille: 0.7,
        couleurPlaceholder: [110, 160, 226],
    },

    doudou: {
        nom: "Doudou",
        role: "le mentor",
        description: "Ourson très vieux et très abîmé. N'habite PAS cet appartement.",
        traits: ["très sage", "intelligent", "physiquement très faible", "vieux"],
        voix: "Lent, posé, économe en mots. Ne répond jamais directement à une "
            + "question : il répond par un souvenir. C'est le seul à connaître le "
            + "monde HORS de l'appartement — et ses cicatrices viennent de là.",
        taille: 1.0,
        couleurPlaceholder: [148, 128, 108],
    },

    cakey: {
        nom: "Cakey",
        role: "la fête",
        description: "Presque aussi grande que Samsam : de loin la plus grande de "
            + "toutes les peluches après lui. Tient toujours un gâteau "
            + "d'anniversaire dans les pattes, et ne le pose jamais.",
        traits: ["extrêmement gentille", "attentionnée", "heureuse",
            "de loin la plus positive", "hyper sociale", "drôle", "adore les fêtes"],
        voix: "Chaleureuse, rapide quand elle est contente, c'est-à-dire presque tout "
            + "le temps. Trouve une raison de fêter n'importe quoi. Connaît les petites "
            + "habitudes de chacun et les cite. Appelle tout le monde par son nom. "
            + "DEUX RÈGLES SACRÉES : elle ne dit JAMAIS une surprise (mais elle en "
            + "laisse échapper des bouts sans le vouloir), et on ne coupe pas le "
            + "gâteau tant qu'il manque quelqu'un. "
            + "Pas de majuscules : ça, c'est Bluey. "
            + "⚠️ SON OPTIMISME N'EST PAS DE LA NAÏVETÉ. Elle voit très bien quand ça "
            + "va mal, et elle choisit le bon côté exprès, pour les autres. Une fois, "
            + "elle oublie de sourire, et elle s'en rend compte.",
        // Evan : « Cakey est presque aussi grande que Samsam, c'est de
        // loin la plus grande à part lui. » (Samsam est à 1.6.)
        taille: 1.45,
        couleurPlaceholder: [196, 156, 222],
    },

};
