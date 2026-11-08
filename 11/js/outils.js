/* ============================================================
   OUTILS
   ============================================================
   Les cinq ou six fonctions dont TOUT le reste du jeu se sert.
   Il n'y a pas de framework ici : une application du téléphone,
   c'est une fonction qui fabrique des éléments et les empile.
   ============================================================ */


/* ------------------------------------------------------------
   el(balise, options, enfants)
   ------------------------------------------------------------
   Fabrique un élément HTML en une ligne.

     el("div", { classe: "carte", texte: "Bonjour" })
     el("button", { classe: "bouton", auClic: function () { ... } })
     el("div", { classe: "liste" }, [ el("p", { texte: "a" }) ])

   Options comprises :
     classe   -> class
     texte    -> textContent (jamais innerHTML : pas d'injection)
     html     -> innerHTML (seulement pour nos propres SVG)
     attrs    -> { "data-id": "x", "aria-label": "y" }
     style    -> { color: "red" }
     auClic   -> écouteur de clic/tap
     donnees  -> { id: "x" } devient data-id="x"
   ------------------------------------------------------------ */
function el(balise, options, enfants) {

    const element = document.createElement(balise);
    const opt = options || {};

    if (opt.classe) element.className = opt.classe;
    if (opt.texte !== undefined && opt.texte !== null) element.textContent = String(opt.texte);
    if (opt.html !== undefined) element.innerHTML = opt.html;

    if (opt.attrs) {
        Object.keys(opt.attrs).forEach(function (cle) {
            element.setAttribute(cle, opt.attrs[cle]);
        });
    }

    if (opt.donnees) {
        Object.keys(opt.donnees).forEach(function (cle) {
            element.dataset[cle] = opt.donnees[cle];
        });
    }

    if (opt.style) {
        Object.keys(opt.style).forEach(function (cle) {
            element.style[cle] = opt.style[cle];
        });
    }

    if (opt.auClic) {
        element.addEventListener("click", opt.auClic);
        element.classList.add("cliquable");
    }

    (enfants || []).forEach(function (enfant) {
        if (enfant) element.appendChild(enfant);
    });

    return element;
}


/* ------------------------------------------------------------
   vide(element)
   ------------------------------------------------------------
   Enlève tous les enfants d'un élément. Utilisé à chaque fois
   qu'on redessine un écran.
   ------------------------------------------------------------ */
function vide(element) {
    while (element && element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
}


/* ------------------------------------------------------------
   attendre(ms) / plusTard(fn, ms)
   ------------------------------------------------------------
   attendre() s'utilise avec await dans les mises en scène
   (l'intro, les messages de Mira).
   ------------------------------------------------------------ */
function attendre(ms) {
    return new Promise(function (resoudre) {
        setTimeout(resoudre, ms);
    });
}

function plusTard(fn, ms) {
    return setTimeout(fn, ms);
}


/* ------------------------------------------------------------
   LES DATES, VERSION TÉLÉPHONE
   ------------------------------------------------------------
   Toutes les dates du jeu s'écrivent "JJ/MM" ou "JJ/MM HH:MM".
   Ces fonctions les transforment en ce qu'un téléphone
   afficherait vraiment.
   ------------------------------------------------------------ */

const MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const MOIS_COURT = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const JOURS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];


// "08/11 22:10" -> { jour:8, mois:11, heure:22, minute:10 }
function decouperDate(texte) {
    const morceaux = String(texte).trim().split(" ");
    const datePart = morceaux[0].split("/");
    const heurePart = (morceaux[1] || "").split(":");

    return {
        jour: Number(datePart[0]) || 1,
        mois: Number(datePart[1]) || 11,
        heure: heurePart[0] !== undefined && heurePart[0] !== "" ? Number(heurePart[0]) : null,
        minute: heurePart[1] !== undefined && heurePart[1] !== "" ? Number(heurePart[1]) : null,
    };
}


// "08/11 22:10" -> "22:10"
function justeLHeure(texte) {
    const d = decouperDate(texte);
    if (d.heure === null) return "";
    return pad2(d.heure) + ":" + pad2(d.minute || 0);
}


// "08/11" -> "8 novembre"
function dateLongue(texte) {
    const d = decouperDate(texte);
    return d.jour + " " + MOIS_FR[d.mois - 1];
}


// "08/11" -> "8 nov."
function dateCourte(texte) {
    const d = decouperDate(texte);
    return d.jour + " " + MOIS_COURT[d.mois - 1];
}


/* Ce qu'un téléphone affiche à droite d'une conversation :
   l'heure si c'est aujourd'hui, le jour sinon. */
function dateDeListe(texte) {
    const d = decouperDate(texte);
    const auj = decouperDate(AUJOURDHUI);

    if (d.jour === auj.jour && d.mois === auj.mois) {
        return justeLHeure(texte);
    }
    return pad2(d.jour) + "/" + pad2(d.mois);
}


/* L'en-tête de séparation au milieu d'un fil de discussion :
   « jeudi 8 novembre 22:10 » */
function dateDeSeparateur(texte) {
    const d = decouperDate(texte);

    if (estAujourdhui(texte)) {
        return "aujourd'hui " + justeLHeure(texte);
    }
    return dateLongue(texte) + (d.heure !== null ? " " + justeLHeure(texte) : "");
}


function estAujourdhui(texte) {
    const d = decouperDate(texte);
    const auj = decouperDate(AUJOURDHUI);
    return d.jour === auj.jour && d.mois === auj.mois;
}


// Pour trier : "08/11 22:10" -> 8221000 (comparable, sans objet Date)
function clefDeTri(texte) {
    const d = decouperDate(texte);
    return d.mois * 1000000 + d.jour * 10000 + (d.heure || 0) * 100 + (d.minute || 0);
}


function pad2(n) {
    return String(n).length < 2 ? "0" + n : String(n);
}


/* ------------------------------------------------------------
   L'HEURE RÉELLE
   ------------------------------------------------------------
   La barre d'état affiche la VRAIE heure de la joueuse. C'est
   un détail idiot et c'est pourtant ce qui fait le plus pour
   l'illusion : le téléphone a l'air allumé, là, maintenant.
   ------------------------------------------------------------ */
function heureReelle() {
    const maintenant = new Date();
    return pad2(maintenant.getHours()) + ":" + pad2(maintenant.getMinutes());
}

function dateReelleLongue() {
    const maintenant = new Date();
    return JOURS_FR[maintenant.getDay()] + " " + maintenant.getDate() + " " + MOIS_FR[maintenant.getMonth()];
}


/* ------------------------------------------------------------
   TEXTE
   ------------------------------------------------------------ */

// Enlève les accents et met en minuscules : pour la recherche.
function sansAccents(texte) {
    return String(texte)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

// Coupe un texte long pour l'aperçu d'une liste.
function apercu(texte, longueur) {
    const t = String(texte).replace(/\s+/g, " ").trim();
    const max = longueur || 60;
    if (t.length <= max) return t;
    return t.slice(0, max - 1).trimEnd() + "…";
}

// Les initiales d'un nom, pour les pastilles de contact.
function initiales(nom) {
    const mots = String(nom).replace(/[^\p{L}\s]/gu, " ").trim().split(/\s+/);
    if (mots.length === 0 || mots[0] === "") return "?";
    if (mots.length === 1) return mots[0].slice(0, 1).toUpperCase();
    return (mots[0].slice(0, 1) + mots[1].slice(0, 1)).toUpperCase();
}

// Transforme un texte en paragraphes (les \n\n sont des respirations).
function paragraphes(texte, classe) {
    const bloc = el("div", { classe: classe || "texte" });

    String(texte).split("\n").forEach(function (ligne) {
        if (ligne.trim() === "") {
            bloc.appendChild(el("div", { classe: "respiration" }));
        } else {
            bloc.appendChild(el("p", { texte: ligne }));
        }
    });

    return bloc;
}


/* ------------------------------------------------------------
   PETITS MORCEAUX D'INTERFACE RÉUTILISABLES
   ------------------------------------------------------------
   Ce sont les briques qu'on retrouve dans toutes les applis
   iOS : une ligne de liste, un groupe de réglages, une
   pastille de contact. On les écrit une fois.
   ------------------------------------------------------------ */

/* Une ligne de liste "à la iOS" :
   [avatar]  Titre                        droite >
             sous-titre sur deux lignes
*/
function ligne(options) {
    const o = options || {};
    const classes = ["ligne"];

    if (o.nonLue) classes.push("ligne--non-lue");
    if (o.chevron !== false) classes.push("ligne--chevron");
    // iOS ne trace jamais le trait de séparation sous l'avatar :
    // il démarre à la hauteur du texte. C'est un détail minuscule
    // et c'est l'un de ceux qui font « vrai téléphone ».
    if (o.avatar) classes.push("ligne--avatar");
    if (o.classe) classes.push(o.classe);

    const gauche = [];

    if (o.avatar) gauche.push(o.avatar);

    const centre = el("div", { classe: "ligne-centre" });

    const hautDeLigne = el("div", { classe: "ligne-haut" }, [
        el("div", { classe: "ligne-titre", texte: o.titre }),
        o.droite ? el("div", { classe: "ligne-droite", texte: o.droite }) : null,
    ]);
    centre.appendChild(hautDeLigne);

    if (o.sousTitre) {
        centre.appendChild(el("div", {
            classe: "ligne-sous-titre" + (o.lignes === 1 ? " ligne-sous-titre--une" : ""),
            texte: o.sousTitre,
        }));
    }

    if (o.detail) {
        centre.appendChild(el("div", { classe: "ligne-detail", texte: o.detail }));
    }

    gauche.push(centre);

    const element = el("div", { classe: classes.join(" "), auClic: o.auClic }, gauche);

    if (o.nonLue) {
        element.insertBefore(el("span", { classe: "point-bleu" }), element.firstChild);
    }

    return element;
}


/* Un groupe de réglages : un titre en petit, puis une carte
   arrondie qui contient des lignes séparées par des traits. */
function groupe(titre, lignes, piedDeGroupe) {
    const bloc = el("div", { classe: "groupe" });

    if (titre) {
        bloc.appendChild(el("div", { classe: "groupe-titre", texte: titre.toUpperCase() }));
    }

    const carte = el("div", { classe: "groupe-carte" });
    (lignes || []).forEach(function (l) {
        if (l) carte.appendChild(l);
    });
    bloc.appendChild(carte);

    if (piedDeGroupe) {
        bloc.appendChild(el("div", { classe: "groupe-pied", texte: piedDeGroupe }));
    }

    return bloc;
}


/* Une ligne de réglage : "Libellé .......... valeur >" */
function ligneReglage(libelle, valeur, options) {
    const o = options || {};

    return el("div", {
        classe: "reglage" + (o.auClic ? " reglage--cliquable" : "") + (o.classe ? " " + o.classe : ""),
        auClic: o.auClic,
    }, [
        o.icone ? el("div", { classe: "reglage-icone", html: o.icone, style: o.couleurIcone ? { background: o.couleurIcone } : null }) : null,
        el("div", { classe: "reglage-libelle", texte: libelle }),
        valeur !== undefined && valeur !== null
            ? el("div", { classe: "reglage-valeur" + (o.alerte ? " reglage-valeur--alerte" : ""), texte: valeur })
            : null,
        o.auClic ? el("div", { classe: "reglage-chevron", html: ICONES.chevron }) : null,
    ]);
}


/* La pastille ronde avec les initiales (ou une couleur) qui
   sert d'avatar partout dans le téléphone. */
function avatar(nomOuContact, taille) {
    const contact = typeof nomOuContact === "string" ? (CONTACTS[nomOuContact] || { nom: nomOuContact }) : nomOuContact;
    const t = taille || 44;

    return el("div", {
        classe: "avatar",
        texte: contact.initiales || initiales(contact.nom),
        style: {
            width: t + "px",
            height: t + "px",
            fontSize: Math.round(t * 0.38) + "px",
            background: contact.couleur || "#3A4250",
        },
    });
}


/* Un gros bouton plein largeur, comme les boutons d'action iOS. */
function bouton(texte, auClic, options) {
    const o = options || {};
    return el("button", {
        classe: "bouton" + (o.classe ? " " + o.classe : ""),
        texte: texte,
        auClic: auClic,
        attrs: o.desactive ? { disabled: "disabled" } : null,
    });
}


/* Le petit message gris et centré qu'on met quand une liste
   est vide ("Aucune note", "Rien ici"). */
function videMessage(texte) {
    return el("div", { classe: "vide-message", texte: texte });
}


/* ------------------------------------------------------------
   LA BARRE D'ONGLETS DU BAS
   ------------------------------------------------------------
   LE truc qui manquait pour que ça ressemble à iOS. Sur un
   iPhone, Téléphone, Photos, Santé et compagnie n'ont pas des
   onglets en haut : elles ont une barre translucide EN BAS,
   avec une icône et un mot sous chaque icône.

   onglets : [{ id, nom, icone }]
   -----------------------------------------------------------*/
function barreOnglets(onglets, actif, surChangement) {

    const barre = el("div", { classe: "barre-onglets" });

    (onglets || []).forEach(function (onglet) {
        barre.appendChild(el("div", {
            classe: "onglet" + (onglet.id === actif ? " onglet--actif" : ""),
            auClic: function () {
                if (onglet.id === actif) return;
                SONS.tape();
                surChangement(onglet.id);
            },
        }, [
            el("span", { classe: "onglet-icone glyphe", html: onglet.icone }),
            el("span", { classe: "onglet-nom", texte: onglet.nom }),
        ]));
    });

    return barre;
}


/* ------------------------------------------------------------
   ecranOnglets(options)
   ------------------------------------------------------------
   Un écran complet "à la iOS" : grand titre, zone qui défile,
   barre d'onglets en bas. L'onglet actif est gardé en mémoire
   et l'écran se redessine tout seul quand on en change.

   ecranOnglets({
       grandTitre: "Photos",
       onglets: [{ id: "albums", nom: "Albums", icone: ICONES.… }],
       defaut: "albums",
       dessiner: function (corps, onglet) { … },
   });
   -----------------------------------------------------------*/
function ecranOnglets(options) {

    const o = options || {};
    let actif = o.defaut || (o.onglets[0] && o.onglets[0].id);

    OS.pousser({
        titre: o.titre || "",
        plein: true,
        cle: o.cle,
        contenu: function (vue) {

            const corps = el("div", { classe: "corps corps--onglets" });

            // un titre vide = l'onglet dessine son propre en-tête
            const titreCourant = o.titrePar ? o.titrePar(actif) : o.grandTitre;
            if (titreCourant) {
                corps.appendChild(el("h1", { classe: "grand-titre", texte: titreCourant }));
            }

            o.dessiner(corps, actif);
            vue.appendChild(corps);

            vue.appendChild(barreOnglets(o.onglets, actif, function (id) {
                actif = id;
                OS.rafraichir();
            }));
        },
    });
}


/* ------------------------------------------------------------
   LA BARRE D'OUTILS DU BAS (Safari, Mail, la visionneuse)
   ------------------------------------------------------------
   outils : [{ icone, auClic, desactive }]
   -----------------------------------------------------------*/
function barreOutils(outils) {

    const barre = el("div", { classe: "barre-outils" });

    (outils || []).forEach(function (outil) {
        barre.appendChild(el("div", {
            classe: "outil" + (outil.desactive ? " outil--eteint" : ""),
            auClic: outil.desactive ? null : outil.auClic,
        }, [
            el("span", { classe: "glyphe", html: outil.icone }),
        ]));
    });

    return barre;
}


/* ------------------------------------------------------------
   LE CHAMP DE RECHERCHE GRIS DES LISTES iOS
   ------------------------------------------------------------
   Il ne cherche rien ici : il ouvre la recherche globale.
   C'est exactement ce que fait un iPhone quand on tire une
   liste vers le bas.
   -----------------------------------------------------------*/
function champDeRecherche(placeholder) {
    return el("div", {
        classe: "champ-recherche",
        auClic: function () { OS.ouvrirRecherche(); },
    }, [
        el("span", { classe: "glyphe", html: ICONES.loupe }),
        el("span", { texte: placeholder || "Rechercher" }),
    ]);
}
