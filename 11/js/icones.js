/* ============================================================
   ICÔNES
   ============================================================
   Tout est dessiné en SVG, à la main, sans aucun fichier image.
   Deux familles :

   1. ICONES       : les petits symboles de l'interface
                     (chevrons, loupe, cœur, corbeille…).
                     Ils héritent de la couleur du texte
                     (fill="currentColor"), donc une icône prend
                     automatiquement la couleur de son contexte.

   2. ICONES_APPS  : les grandes icônes de l'écran d'accueil.
                     Chacune a un fond (dégradé CSS) et un
                     glyphe blanc. Le fond est posé par le CSS,
                     le glyphe est injecté dedans.

   Toutes les icônes sont en viewBox 0 0 100 100 : on les met à
   l'échelle avec le CSS, jamais en touchant au SVG.
   ============================================================ */


/* ------------------------------------------------------------
   1. LES SYMBOLES DE L'INTERFACE
   ------------------------------------------------------------ */
const ICONES = {

    chevron:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M35 18 L67 50 L35 82" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    chevronGauche:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M65 18 L33 50 L65 82" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    chevronBas:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 35 L50 67 L82 35" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    loupe:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="43" cy="43" r="27" fill="none" stroke="currentColor" stroke-width="10"/><path d="M63 63 L86 86" stroke="currentColor" stroke-width="11" stroke-linecap="round"/></svg>',

    info:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="29" r="6" fill="currentColor"/><path d="M50 44 L50 73" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    coeur:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 84 C20 64 8 50 8 34 C8 21 18 12 30 12 C39 12 46 17 50 24 C54 17 61 12 70 12 C82 12 92 21 92 34 C92 50 80 64 50 84 Z" fill="currentColor"/></svg>',

    coeurVide:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 84 C20 64 8 50 8 34 C8 21 18 12 30 12 C39 12 46 17 50 24 C54 17 61 12 70 12 C82 12 92 21 92 34 C92 50 80 64 50 84 Z" fill="none" stroke="currentColor" stroke-width="8"/></svg>',

    corbeille:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M22 30 L78 30 L72 88 L28 88 Z" fill="none" stroke="currentColor" stroke-width="8"/><path d="M14 30 L86 30" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M38 20 L62 20" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M42 45 L42 74 M58 45 L58 74" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>',

    partage:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 10 L50 62" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M32 28 L50 10 L68 28" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 48 L18 48 L18 88 L82 88 L82 48 L76 48" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    plus:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>',

    croix:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M26 26 L74 74 M74 26 L26 74" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>',

    croixCercle:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="currentColor" opacity="0.25"/><path d="M34 34 L66 66 M66 34 L34 66" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    verrou:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="44" width="56" height="44" rx="10" fill="currentColor"/><path d="M34 44 L34 32 C34 21 41 14 50 14 C59 14 66 21 66 32 L66 44" fill="none" stroke="currentColor" stroke-width="9"/></svg>',

    verrouOuvert:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="44" width="56" height="44" rx="10" fill="currentColor"/><path d="M34 44 L34 32 C34 21 41 14 50 14 C59 14 66 21 66 28" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    cle:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="9"/><path d="M45 45 L84 84" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M66 78 L78 66 M74 86 L86 74" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    telephone:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M26 14 C18 14 12 21 12 29 C12 60 40 88 71 88 C79 88 86 82 86 74 L86 64 L64 56 L56 68 C46 62 38 54 32 44 L44 36 L36 14 Z" fill="currentColor"/></svg>',

    telephoneManque:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 30 C14 30 10 35 10 41 C10 66 32 88 57 88 C63 88 68 84 68 78 L68 70 L50 64 L44 73 C36 68 30 62 25 54 L34 48 L28 30 Z" fill="currentColor"/><path d="M62 14 L92 44 M92 14 L62 44" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    repondeur:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="26" cy="58" r="16" fill="none" stroke="currentColor" stroke-width="9"/><circle cx="74" cy="58" r="16" fill="none" stroke="currentColor" stroke-width="9"/><path d="M26 42 L74 42" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    micro:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="38" y="12" width="24" height="46" rx="12" fill="currentColor"/><path d="M26 48 C26 62 37 72 50 72 C63 72 74 62 74 48" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M50 72 L50 88 M36 88 L64 88" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>',

    lecture:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M28 16 L84 50 L28 84 Z" fill="currentColor"/></svg>',

    pause:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="26" y="18" width="16" height="64" rx="5" fill="currentColor"/><rect x="58" y="18" width="16" height="64" rx="5" fill="currentColor"/></svg>',

    epingle:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 C33 8 20 21 20 38 C20 60 50 92 50 92 C50 92 80 60 80 38 C80 21 67 8 50 8 Z" fill="currentColor"/><circle cx="50" cy="37" r="11" fill="#0B0E13"/></svg>',

    alerte:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 10 L92 86 L8 86 Z" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/><path d="M50 36 L50 62" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="74" r="5.5" fill="currentColor"/></svg>',

    oeil:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M6 50 C22 28 36 20 50 20 C64 20 78 28 94 50 C78 72 64 80 50 80 C36 80 22 72 6 50 Z" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="50" r="13" fill="currentColor"/></svg>',

    horloge:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8"/><path d="M50 26 L50 52 L70 62" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    appareilPhoto:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="8" y="26" width="84" height="56" rx="12" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="54" r="17" fill="none" stroke="currentColor" stroke-width="8"/><path d="M34 26 L40 16 L60 16 L66 26" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/></svg>',

    dossier:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M10 26 L40 26 L48 36 L90 36 L90 80 L10 80 Z" fill="currentColor"/></svg>',

    lien:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M40 60 L60 40" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M34 44 L24 54 C16 62 16 74 24 82 C32 90 44 90 52 82 L62 72" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M38 28 L48 18 C56 10 68 10 76 18 C84 26 84 38 76 46 L66 56" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>',

    coche:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 54 L40 76 L84 24" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    cocheCercle:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="currentColor"/><path d="M30 52 L44 66 L72 36" fill="none" stroke="#0B0E13" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    cercleVide:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="7"/></svg>',

    etoile:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 L62 38 L94 40 L69 60 L78 92 L50 74 L22 92 L31 60 L6 40 L38 38 Z" fill="currentColor"/></svg>',

    fleche:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 50 L86 50 M62 26 L86 50 L62 74" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    flecheHaut:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 86 L50 16 M26 40 L50 16 L74 40" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    localisation:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M88 12 L12 44 L44 54 L54 88 Z" fill="currentColor"/></svg>',

    carnet:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="20" y="12" width="62" height="76" rx="8" fill="none" stroke="currentColor" stroke-width="8"/><path d="M34 32 L68 32 M34 50 L68 50 M34 68 L56 68" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M20 24 L8 24 M20 50 L8 50 M20 76 L8 76" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>',

    batterie:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="10" y="34" width="72" height="32" rx="9" fill="none" stroke="currentColor" stroke-width="7"/><path d="M88 44 L88 56" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>',

    bulle:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14 C27 14 10 28 10 46 C10 58 18 68 30 73 L28 90 L46 77 C47 77 49 78 50 78 C73 78 90 64 90 46 C90 28 73 14 50 14 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/></svg>',

    wifi:
        '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 40 C34 22 66 22 86 40" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M28 56 C40 45 60 45 72 56" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="74" r="7" fill="currentColor"/></svg>',
};


/* ------------------------------------------------------------
   2. LES ICÔNES DE L'ÉCRAN D'ACCUEIL
   ------------------------------------------------------------
   fond   : le dégradé CSS de la tuile
   glyphe : le dessin blanc par-dessus
   ------------------------------------------------------------ */
const ICONES_APPS = {

    messages: {
        fond: "linear-gradient(180deg, #5BF675 0%, #0ACD2E 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><path d="M50 16 C27 16 10 30 10 48 C10 59 16 68 26 74 C25 80 21 86 15 90 C25 90 34 86 40 80 C43 80 47 81 50 81 C73 81 90 66 90 48 C90 30 73 16 50 16 Z" fill="#fff"/></svg>',
    },

    photos: {
        fond: "linear-gradient(180deg, #FFFFFF 0%, #F2F2F6 100%)",
        glyphe: '<svg viewBox="0 0 100 100">' +
            '<g opacity="0.95">' +
            '<ellipse cx="50" cy="26" rx="9" ry="19" fill="#FDCB2E"/>' +
            '<ellipse cx="50" cy="74" rx="9" ry="19" fill="#2CB1F0"/>' +
            '<ellipse cx="26" cy="50" rx="19" ry="9" fill="#F74E3C"/>' +
            '<ellipse cx="74" cy="50" rx="19" ry="9" fill="#39C65B"/>' +
            '<ellipse cx="33" cy="33" rx="9" ry="19" transform="rotate(-45 33 33)" fill="#FA8E2B"/>' +
            '<ellipse cx="67" cy="67" rx="9" ry="19" transform="rotate(-45 67 67)" fill="#1E8FEA"/>' +
            '<ellipse cx="67" cy="33" rx="19" ry="9" transform="rotate(-45 67 33)" fill="#F2D32C"/>' +
            '<ellipse cx="33" cy="67" rx="19" ry="9" transform="rotate(-45 33 67)" fill="#7ED04B"/>' +
            '<circle cx="50" cy="50" r="9" fill="#F7F4EC"/>' +
            '</g></svg>',
    },

    telephone: {
        fond: "linear-gradient(180deg, #5BF675 0%, #0ACD2E 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><path d="M30 14 C21 14 14 22 14 31 C14 63 41 90 73 90 C82 90 90 83 90 74 L90 63 L66 54 L58 67 C47 60 40 53 33 42 L46 34 L37 14 Z" fill="#fff"/></svg>',
    },

    mail: {
        fond: "linear-gradient(180deg, #4EB8FF 0%, #0A6CF5 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><rect x="12" y="26" width="76" height="48" rx="8" fill="#fff"/><path d="M14 30 L50 56 L86 30" fill="none" stroke="#0A6CF5" stroke-width="7" stroke-linejoin="round"/></svg>',
    },

    notes: {
        fond: "linear-gradient(180deg, #FFFFFF 0%, #FFE9A8 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" rx="4" fill="#FDD84D"/><rect x="14" y="14" width="72" height="16" fill="#F7F2E3"/><path d="M26 46 L74 46 M26 60 L74 60 M26 74 L56 74" stroke="#B9972A" stroke-width="6" stroke-linecap="round"/></svg>',
    },

    safari: {
        fond: "linear-gradient(180deg, #19C7FB 0%, #1575F0 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#fff"/><circle cx="50" cy="50" r="33" fill="#1B8FEA"/>' +
            '<path d="M50 50 L72 28 L56 56 Z" fill="#FF3B30"/><path d="M50 50 L28 72 L44 44 Z" fill="#F2F2F7"/>' +
            '<path d="M50 14 L50 20 M50 80 L50 86 M14 50 L20 50 M80 50 L86 50" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
    },

    plans: {
        fond: "linear-gradient(180deg, #8FE3A0 0%, #4DBF77 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><path d="M8 24 L34 14 L66 26 L92 16 L92 78 L66 88 L34 76 L8 86 Z" fill="#F4F6F2"/>' +
            '<path d="M34 14 L34 76 M66 26 L66 88" stroke="#9DB7A5" stroke-width="3"/>' +
            '<path d="M8 56 L34 50 L66 62 L92 54" fill="none" stroke="#7FC6E8" stroke-width="7"/>' +
            '<path d="M50 30 C42 30 36 36 36 44 C36 55 50 70 50 70 C50 70 64 55 64 44 C64 36 58 30 50 30 Z" fill="#FF473A"/></svg>',
    },

    reglages: {
        fond: "linear-gradient(180deg, #A9B0BC 0%, #6B7280 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><g fill="#fff"><circle cx="50" cy="50" r="30"/></g>' +
            '<g stroke="#fff" stroke-width="9" stroke-linecap="round">' +
            '<path d="M50 6 L50 18 M50 82 L50 94 M6 50 L18 50 M82 50 L94 50"/>' +
            '<path d="M19 19 L27 27 M73 73 L81 81 M81 19 L73 27 M27 73 L19 81"/></g>' +
            '<circle cx="50" cy="50" r="12" fill="#6B7280"/></svg>',
    },

    sante: {
        fond: "linear-gradient(180deg, #FFFFFF 0%, #F6F6F8 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><path d="M50 84 C22 64 10 51 10 36 C10 23 20 14 32 14 C40 14 46 18 50 25 C54 18 60 14 68 14 C80 14 90 23 90 36 C90 51 78 64 50 84 Z" fill="#FB3B5C"/></svg>',
    },

    musique: {
        fond: "linear-gradient(180deg, #FB5C74 0%, #F62C55 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><path d="M38 70 L38 28 L78 20 L78 62" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>' +
            '<ellipse cx="30" cy="70" rx="13" ry="11" fill="#fff"/><ellipse cx="70" cy="62" rx="13" ry="11" fill="#fff"/></svg>',
    },

    calendrier: {
        fond: "linear-gradient(180deg, #FFFFFF 0%, #F2F2F6 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><text x="50" y="34" font-size="20" font-family="-apple-system, sans-serif" fill="#FF453A" text-anchor="middle" font-weight="600">NOV.</text>' +
            '<text x="50" y="86" font-size="54" font-family="-apple-system, sans-serif" fill="#1C1C1E" text-anchor="middle" font-weight="300">8</text></svg>',
    },

    calculette: {
        fond: "linear-gradient(180deg, #4A4A4F 0%, #26262A 100%)",
        glyphe: '<svg viewBox="0 0 100 100">' +
            '<rect x="14" y="14" width="72" height="20" rx="4" fill="#3A3A3E"/>' +
            '<g fill="#8E8E93"><rect x="14" y="40" width="18" height="16" rx="4"/><rect x="38" y="40" width="18" height="16" rx="4"/>' +
            '<rect x="14" y="62" width="18" height="16" rx="4"/><rect x="38" y="62" width="18" height="16" rx="4"/></g>' +
            '<g fill="#FF9F0A"><rect x="62" y="40" width="24" height="38" rx="4"/></g></svg>',
    },

    fjordgram: {
        fond: "linear-gradient(135deg, #7B4BD6 0%, #E0457B 55%, #F6A33D 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><rect x="18" y="18" width="64" height="64" rx="20" fill="none" stroke="#fff" stroke-width="8"/>' +
            '<circle cx="50" cy="50" r="17" fill="none" stroke="#fff" stroke-width="8"/><circle cx="69" cy="31" r="5" fill="#fff"/></svg>',
    },

    carnet: {
        fond: "linear-gradient(180deg, #E6C79B 0%, #C9A876 100%)",
        glyphe: '<svg viewBox="0 0 100 100"><rect x="22" y="12" width="60" height="76" rx="6" fill="#FBF3EE"/>' +
            '<path d="M22 12 L22 88" stroke="#9C8880" stroke-width="6"/>' +
            '<path d="M36 34 L70 34 M36 48 L70 48 M36 62 L58 62" stroke="#C17F77" stroke-width="5" stroke-linecap="round"/>' +
            '<circle cx="62" cy="68" r="14" fill="none" stroke="#4B3B36" stroke-width="5"/>' +
            '<path d="M72 78 L84 90" stroke="#4B3B36" stroke-width="6" stroke-linecap="round"/></svg>',
    },

    dossier: {
        fond: "rgba(255,255,255,0.14)",
        glyphe: "",   // le dossier affiche des mini-icônes, géré par os.js
    },
};
