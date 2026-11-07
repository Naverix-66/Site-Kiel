/* ============================================================
   LE SYSTÈME
   ============================================================
   C'est le "iOS" du jeu. Il ne sait rien de l'histoire : il
   sait juste afficher une barre d'état, un écran d'accueil,
   empiler des écrans, et faire glisser des bannières.

   Vocabulaire :
     - une APP     : { id, nom, icone, ouvrir() }
     - une VUE     : un écran empilé dans une app
     - la PILE     : les vues de l'app ouverte (la dernière est
                     celle qu'on voit)

   Pour écrire une application, il n'y a qu'une fonction à
   connaître : OS.pousser().

       enregistrerApp({
           id: "notes",
           nom: "Notes",
           icone: "notes",
           ouvrir: function () {
               OS.pousser({
                   grandTitre: "Notes",
                   contenu: function (corps) {
                       corps.appendChild(ligne({ titre: "Bonjour" }));
                   },
               });
           },
       });
   ============================================================ */


/* ------------------------------------------------------------
   LE REGISTRE DES APPLICATIONS
   ------------------------------------------------------------
   Chaque fichier app_*.js s'enregistre tout seul au chargement.
   L'ordre d'enregistrement = l'ordre sur l'écran d'accueil.
   ------------------------------------------------------------ */
const APPS = [];
const APPS_PAR_ID = {};

function enregistrerApp(definition) {
    APPS.push(definition);
    APPS_PAR_ID[definition.id] = definition;
}

function app(id) {
    return APPS_PAR_ID[id];
}


/* ------------------------------------------------------------
   LES DOSSIERS DE L'ÉCRAN D'ACCUEIL
   ------------------------------------------------------------ */
const DOSSIERS = {
    utilitaires: { nom: "Utilitaires" },
};


const OS = {

    /* --- les éléments du DOM, remplis par demarrer() --- */
    appareil: null,
    ecran: null,
    scene: null,
    barreStatut: null,
    zoneBannieres: null,
    zoneToasts: null,
    recouvrement: null,

    /* --- où on en est --- */
    appOuverte: null,       // identifiant de l'app ouverte, ou null (accueil)
    pile: [],               // les vues empilées dans l'app ouverte
    elementApp: null,
    dossierOuvert: null,
    verrouille: false,


    /* ========================================================
       DÉMARRAGE
       ======================================================== */
    demarrer: function () {

        this.appareil = document.getElementById("appareil");
        this.ecran = document.getElementById("ecran");
        this.scene = document.getElementById("scene");
        this.barreStatut = document.getElementById("barre-statut");
        this.zoneBannieres = document.getElementById("bannieres");
        this.zoneToasts = document.getElementById("toasts");
        this.recouvrement = document.getElementById("recouvrement");

        // Mode "ajouté à l'écran d'accueil" : c'est la vraie barre
        // d'état d'iOS qui s'affiche, on efface la nôtre.
        if (window.navigator.standalone === true ||
            (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)) {
            document.body.classList.add("autonome");
        }

        // Le son ne peut naître que d'un geste : on attend le premier.
        const premierContact = function () {
            reveillerLAudio();
            document.removeEventListener("pointerdown", premierContact);
        };
        document.addEventListener("pointerdown", premierContact);

        // La barre blanche du bas ramène à l'accueil.
        const indicateur = document.getElementById("indicateur-accueil");
        if (indicateur) {
            indicateur.addEventListener("click", function () {
                if (OS.verrouille) return;
                if (OS.dossierOuvert) { OS.fermerDossier(); return; }
                if (OS.appOuverte) OS.fermerApp();
            });
        }

        this.installerGestes();

        this.dessinerBarreStatut();
        setInterval(function () { OS.dessinerBarreStatut(); }, 10000);

        // La batterie baisse très lentement (pur décor).
        setInterval(function () {
            if (ETAT.batterie > 4) {
                ETAT.batterie -= 1;
                sauvegarder();
                OS.dessinerBarreStatut();
            }
        }, BATTERIE_MINUTES_PAR_POURCENT * 60000);
    },


    /* ========================================================
       LES GESTES
       ========================================================
       Deux gestes, les deux vrais gestes d'un iPhone :

         - glisser depuis le BORD GAUCHE : on revient en arrière.
           L'écran suit le doigt, celui de dessous se découvre.
           Au premier écran d'une app, le même geste referme
           l'app et découvre l'écran d'accueil.

         - glisser vers le HAUT depuis le bas : retour à
           l'accueil, de n'importe où.

       On utilise les évènements « pointer » : ça marche au doigt
       sur le téléphone ET à la souris sur l'ordinateur, sans
       écrire le code deux fois.
       ======================================================== */
    installerGestes: function () {

        const LARGEUR_BORD = 30;      // la zone sensible, à gauche
        const SEUIL_RETOUR = 70;      // au-delà, on valide le retour
        const SEUIL_ACCUEIL = 60;     // glissé vers le haut

        let depart = null;            // { x, y, temps }
        let mode = null;              // null | "retour" | "accueil" | "abandon"
        let glissant = null;          // l'élément qu'on déplace
        let dessous = null;           // celui qu'on découvre

        const self = this;

        /* ⚠️ Les vues du dessous gardent une animation CSS
           terminée (« recule », en fill forwards). Une animation
           bat un style en ligne dans la cascade : sans
           « important », le déplacement au doigt n'aurait aucun
           effet sur elles. D'où ces deux fonctions. */
        const poser = function (element, propriete, valeur) {
            if (element) element.style.setProperty(propriete, valeur, "important");
        };

        const retirer = function (element, propriete) {
            if (element) element.style.removeProperty(propriete);
        };

        const elementsDuGeste = function () {
            // Au-dessus du premier écran : on fait glisser la vue.
            if (self.pile.length > 1) {
                return {
                    haut: self.pile[self.pile.length - 1].element,
                    bas: self.pile[self.pile.length - 2].element,
                };
            }
            // Au premier écran : on fait glisser l'application
            // entière, et c'est l'accueil qu'on découvre.
            if (self.elementApp) {
                return { haut: self.elementApp, bas: null };
            }
            return null;
        };

        const terminer = function (valide) {

            poser(glissant, "transition", "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)");
            poser(glissant, "transform", valide ? "translateX(100%)" : "translateX(0)");

            poser(dessous, "transition", "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1), filter 0.26s ease");
            poser(dessous, "transform", valide ? "translateX(0)" : "translateX(-26%)");
            poser(dessous, "filter", valide ? "brightness(1)" : "brightness(0.72)");

            const ancienGlissant = glissant;
            const ancienDessous = dessous;
            const fermaitLApp = self.pile.length <= 1;

            if (valide) {
                plusTard(function () {
                    if (ancienDessous) {
                        ancienDessous.classList.remove("vue--dessous");
                        retirer(ancienDessous, "transition");
                        retirer(ancienDessous, "transform");
                        retirer(ancienDessous, "filter");
                    }
                    if (fermaitLApp) {
                        self.fermerApp({ glisse: true, silencieux: true });
                    } else {
                        // on retire la vue du dessus sans rejouer d'animation
                        const haut = self.pile.pop();
                        if (haut && haut.element.parentNode) haut.element.remove();
                        self.rafraichir();
                    }
                }, 250);
                SONS.retour();
            } else {
                plusTard(function () {
                    retirer(ancienGlissant, "transition");
                    retirer(ancienGlissant, "transform");
                    retirer(ancienDessous, "transition");
                    retirer(ancienDessous, "transform");
                    retirer(ancienDessous, "filter");
                }, 270);
            }

            depart = null;
            mode = null;
            glissant = null;
            dessous = null;
        };

        this.scene.addEventListener("pointerdown", function (evenement) {
            if (self.verrouille) return;
            if (!self.appOuverte) return;

            depart = { x: evenement.clientX, y: evenement.clientY, temps: Date.now() };
            mode = null;
        });

        this.scene.addEventListener("pointermove", function (evenement) {
            if (!depart) return;

            const dx = evenement.clientX - depart.x;
            const dy = evenement.clientY - depart.y;

            /* --- on décide du geste au premier mouvement net --- */
            if (!mode) {
                if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

                const hauteur = self.scene.clientHeight;

                if (depart.x <= LARGEUR_BORD && dx > 0 && Math.abs(dx) > Math.abs(dy)) {
                    const elements = elementsDuGeste();
                    if (!elements) { mode = "abandon"; return; }

                    mode = "retour";
                    glissant = elements.haut;
                    dessous = elements.bas;

                    poser(glissant, "transition", "none");
                    poser(dessous, "transition", "none");

                } else if (depart.y > hauteur - 60 && dy < 0 && Math.abs(dy) > Math.abs(dx)) {
                    mode = "accueil";

                } else {
                    mode = "abandon";     // c'est un défilement ordinaire
                }
            }

            if (mode === "retour") {
                evenement.preventDefault();
                const avance = Math.max(0, dx);
                poser(glissant, "transform", "translateX(" + avance + "px)");

                if (dessous) {
                    const largeur = self.scene.clientWidth || 390;
                    const part = Math.min(avance / largeur, 1);
                    poser(dessous, "transform", "translateX(" + (-26 + 26 * part) + "%)");
                    poser(dessous, "filter", "brightness(" + (0.72 + 0.28 * part) + ")");
                }
            }
        });

        const relacher = function (evenement) {
            if (!depart) return;

            const dx = evenement.clientX - depart.x;
            const dy = evenement.clientY - depart.y;
            const duree = Date.now() - depart.temps;

            if (mode === "retour") {
                // un geste rapide valide même s'il est court
                const rapide = duree < 300 && dx > 40;
                terminer(dx > SEUIL_RETOUR || rapide);
                return;
            }

            if (mode === "accueil" && -dy > SEUIL_ACCUEIL) {
                depart = null;
                mode = null;
                self.fermerApp();
                return;
            }

            depart = null;
            mode = null;
        };

        // sur la fenêtre, pas sur la scène : un doigt relâché
        // au-dessus de la barre d'état doit quand même compter
        window.addEventListener("pointerup", relacher);
        window.addEventListener("pointercancel", function () {
            if (mode === "retour") terminer(false);
            depart = null;
            mode = null;
        });
    },


    /* ========================================================
       LA BARRE D'ÉTAT
       ======================================================== */
    dessinerBarreStatut: function () {
        if (!this.barreStatut) return;

        vide(this.barreStatut);

        this.barreStatut.appendChild(el("div", { classe: "statut-heure", texte: heureReelle() }));

        const batterie = el("div", {
            classe: "statut-batterie" + (ETAT.batterie <= 20 ? " statut-batterie--faible" : ""),
        }, [
            el("div", { classe: "statut-batterie-jus", style: { width: Math.max(ETAT.batterie, 3) + "%" } }),
        ]);

        this.barreStatut.appendChild(el("div", { classe: "statut-droite" }, [
            el("div", { classe: "statut-icone", html: BARRES_RESEAU }),
            el("div", { classe: "statut-icone", html: ICONES.wifi }),
            batterie,
        ]));
    },


    /* ========================================================
       L'ÉCRAN D'ACCUEIL
       ======================================================== */
    dessinerAccueil: function () {

        /* ⚠️ L'écran d'accueil reste TOUJOURS dans le DOM, en
           dessous de l'application ouverte. C'est ce qui permet au
           geste de retour de faire glisser l'app vers la droite et
           de découvrir l'accueil derrière, comme sur un iPhone.
           (Avant, on effaçait la scène : il n'y avait rien
           derrière, et le glissement n'avait aucun sens.) */

        const accueil = el("div", { classe: "accueil", attrs: { id: "accueil" } });

        // La barre de recherche (la "recherche globale" du jeu).
        const grille = el("div", { classe: "grille-apps" });

        // Les apps qui ne sont pas dans le dock et pas dans un dossier.
        const dansLeDock = [];
        const dossiersVus = {};

        APPS.forEach(function (definition) {
            if (definition.cachee && definition.cachee()) return;

            if (definition.dock) {
                dansLeDock.push(definition);
                return;
            }

            if (definition.dossier) {
                if (!dossiersVus[definition.dossier]) {
                    dossiersVus[definition.dossier] = [];
                    grille.appendChild(OS.tuileDossier(definition.dossier, dossiersVus[definition.dossier]));
                }
                dossiersVus[definition.dossier].push(definition);
                return;
            }

            grille.appendChild(OS.tuileApp(definition));
        });

        accueil.appendChild(grille);

        // Les dossiers dessinent leurs mini-icônes après coup, quand
        // on connaît enfin leur contenu. (On cherche dans `accueil`
        // et pas dans la scène : à cet instant, l'écran d'accueil
        // n'y est pas encore attaché.)
        Object.keys(dossiersVus).forEach(function (nomDuDossier) {
            OS.remplirApercuDossier(accueil, nomDuDossier, dossiersVus[nomDuDossier]);
        });

        accueil.appendChild(el("div", { classe: "points-page" }, [
            el("span", { classe: "point-page actif" }),
        ]));

        accueil.appendChild(el("div", {
            classe: "barre-recherche-accueil",
            auClic: function () { OS.ouvrirRecherche(); },
        }, [
            el("span", { classe: "glyphe", html: ICONES.loupe }),
            el("span", { texte: "Rechercher" }),
        ]));

        const dock = el("div", { classe: "dock" });
        dansLeDock.forEach(function (definition) {
            dock.appendChild(OS.tuileApp(definition));
        });
        accueil.appendChild(dock);

        if (this.elementAccueil && this.elementAccueil.parentNode) {
            this.elementAccueil.remove();
        }
        this.elementAccueil = accueil;
        this.scene.insertBefore(accueil, this.scene.firstChild);
    },


    tuileApp: function (definition) {

        const icone = ICONES_APPS[definition.icone] || ICONES_APPS.notes;

        const boite = el("div", {
            classe: "app-icone",
            style: { background: icone.fond },
            html: icone.glyphe,
        });

        const nombre = definition.badge ? definition.badge() : 0;
        if (nombre > 0) {
            boite.appendChild(el("div", { classe: "badge", texte: nombre > 99 ? "99+" : String(nombre) }));
        }

        return el("div", {
            classe: "app-tuile",
            auClic: function () { OS.ouvrirApp(definition.id); },
        }, [
            boite,
            el("div", { classe: "app-nom", texte: definition.nom }),
        ]);
    },


    tuileDossier: function (nomDuDossier, listeVide) {
        const dossier = DOSSIERS[nomDuDossier] || { nom: nomDuDossier };

        const apercu = el("div", { classe: "dossier-apercu", donnees: { dossier: nomDuDossier } });

        const boite = el("div", { classe: "app-icone" }, [apercu]);

        return el("div", {
            classe: "app-tuile",
            donnees: { tuileDossier: nomDuDossier },
            auClic: function () { OS.ouvrirDossier(nomDuDossier); },
        }, [
            boite,
            el("div", { classe: "app-nom", texte: dossier.nom }),
        ]);
    },


    remplirApercuDossier: function (racine, nomDuDossier, apps) {
        const apercu = racine.querySelector('[data-dossier="' + nomDuDossier + '"]');
        if (!apercu) return;

        let badgeTotal = 0;

        apps.slice(0, 4).forEach(function (definition) {
            const icone = ICONES_APPS[definition.icone] || ICONES_APPS.notes;
            apercu.appendChild(el("div", {
                classe: "dossier-mini",
                style: { background: icone.fond },
                html: icone.glyphe,
            }));
        });

        apps.forEach(function (definition) {
            if (definition.badge) badgeTotal += definition.badge();
        });

        if (badgeTotal > 0) {
            const tuile = racine.querySelector('[data-tuile-dossier="' + nomDuDossier + '"] .app-icone');
            if (tuile) tuile.appendChild(el("div", { classe: "badge", texte: String(badgeTotal) }));
        }
    },


    ouvrirDossier: function (nomDuDossier) {
        SONS.ouverture();
        this.dossierOuvert = nomDuDossier;

        const dossier = DOSSIERS[nomDuDossier] || { nom: nomDuDossier };

        const plateau = el("div", { classe: "dossier-plateau" });
        const grille = el("div", { classe: "grille-apps" });

        APPS.forEach(function (definition) {
            if (definition.dossier !== nomDuDossier) return;
            if (definition.cachee && definition.cachee()) return;
            grille.appendChild(OS.tuileApp(definition));
        });

        plateau.appendChild(grille);

        const fond = el("div", { classe: "dossier-ouvert" }, [
            el("div", { classe: "dossier-titre", texte: dossier.nom }),
            plateau,
        ]);

        fond.addEventListener("click", function (evenement) {
            if (evenement.target === fond) OS.fermerDossier();
        });

        this.scene.appendChild(fond);
    },


    fermerDossier: function () {
        const fond = this.scene.querySelector(".dossier-ouvert");
        if (fond) fond.remove();
        this.dossierOuvert = null;
    },


    /* ========================================================
       OUVRIR ET FERMER UNE APPLICATION
       ======================================================== */
    ouvrirApp: function (id) {

        const definition = app(id);
        if (!definition) return;

        SONS.ouverture();
        this.fermerDossier();

        // une app déjà ouverte : on la remplace
        if (this.elementApp && this.elementApp.parentNode) this.elementApp.remove();

        this.appOuverte = id;
        this.pile = [];

        this.elementApp = el("div", {
            classe: "app app--ouvrante" + (definition.clair ? " app--clair" : "") +
                (definition.classe ? " " + definition.classe : ""),
        });
        this.scene.appendChild(this.elementApp);

        definition.ouvrir();

        plusTard(function () {
            if (OS.elementApp) OS.elementApp.classList.remove("app--ouvrante");
        }, 300);

        // Le scénario écoute les ouvertures d'app (c'est souvent
        // comme ça qu'une étape se déclenche).
        if (typeof SCENARIO !== "undefined") SCENARIO.appOuverte(id);
    },


    /* options.glisse : true quand c'est le geste du doigt qui ferme
       l'app (on laisse alors l'animation de glissement finir au
       lieu de jouer le rétrécissement). */
    fermerApp: function (options) {
        if (!this.appOuverte) return;

        const o = options || {};
        if (!o.silencieux) SONS.retour();

        const ancienne = this.elementApp;
        if (ancienne) {
            if (!o.glisse) ancienne.classList.add("app--fermante");
            plusTard(function () { if (ancienne.parentNode) ancienne.remove(); }, o.glisse ? 260 : 220);
        }

        this.appOuverte = null;
        this.pile = [];
        this.elementApp = null;

        this.dessinerAccueil();
    },


    /* ========================================================
       LA PILE DE VUES
       ========================================================
       options :
         titre        : le titre de la barre de navigation
         sousTitre    : la deuxième ligne, plus petite
         grandTitre   : à la place de titre, le gros titre iOS
         retourTexte  : le libellé à côté du chevron
         action       : { texte|icone, auClic } à droite
         contenu      : fonction(corps) qui remplit l'écran
         plein        : true -> on reçoit la vue entière, sans
                        zone de défilement (messages, calculette)
         sansBarre    : true -> aucune barre de navigation
       ======================================================== */
    pousser: function (options) {

        if (!this.elementApp) return null;

        const o = options || {};
        const estRacine = this.pile.length === 0;

        const vue = el("section", { classe: "vue" });
        vue.dataSource = o;        // on garde les options pour pouvoir redessiner

        /* --- la barre de navigation --- */
        if (!o.sansBarre) {
            const barre = el("div", { classe: "barre-nav" });

            if (estRacine) {
                barre.appendChild(el("div", { classe: "barre-nav-retour" }));
            } else {
                barre.appendChild(el("div", {
                    classe: "barre-nav-retour",
                    auClic: function () { OS.retour(); },
                }, [
                    el("span", { classe: "glyphe", html: ICONES.chevronGauche }),
                    el("span", { texte: o.retourTexte || "" }),
                ]));
            }

            const titre = el("div", { classe: "barre-nav-titre" });
            if (o.grandTitre && estRacine) {
                // le titre de la barre reste vide : c'est le grand
                // titre, dans le corps, qui porte le nom de l'app
                titre.textContent = "";
            } else {
                titre.textContent = o.titre || "";
                if (o.sousTitre) {
                    titre.appendChild(el("span", { classe: "barre-nav-sous-titre", texte: o.sousTitre }));
                }
            }
            barre.appendChild(titre);

            if (o.action) {
                barre.appendChild(el("div", {
                    classe: "barre-nav-action",
                    auClic: o.action.auClic,
                }, [
                    o.action.icone
                        ? el("span", { classe: "glyphe", html: o.action.icone, style: { width: "20px", height: "20px" } })
                        : el("span", { texte: o.action.texte || "" }),
                ]));
            } else {
                barre.appendChild(el("div", { classe: "barre-nav-action" }));
            }

            vue.appendChild(barre);
        }

        /* --- le corps --- */
        if (o.plein) {
            if (o.contenu) o.contenu(vue);
        } else {
            if (o.grandTitre) {
                vue.appendChild(el("h1", { classe: "grand-titre", texte: o.grandTitre }));
            }
            const corps = el("div", { classe: "corps" });
            vue.appendChild(corps);
            if (o.contenu) o.contenu(corps);
        }

        /* --- l'animation d'empilement --- */
        const dessous = this.pile[this.pile.length - 1];
        if (dessous) {
            dessous.element.classList.remove("vue--revient");
            dessous.element.classList.add("vue--dessous");
            vue.classList.add("vue--entrante");
            SONS.tape();
        }

        this.elementApp.appendChild(vue);
        this.pile.push({ element: vue, options: o });

        return vue;
    },


    retour: function () {
        if (this.pile.length <= 1) {
            this.fermerApp();
            return;
        }

        SONS.retour();

        const haut = this.pile.pop();
        haut.element.classList.add("vue--sortante");
        plusTard(function () {
            if (haut.element.parentNode) haut.element.remove();
        }, 240);

        const dessous = this.pile[this.pile.length - 1];
        if (dessous) {
            dessous.element.classList.remove("vue--dessous");
            dessous.element.classList.add("vue--revient");
            plusTard(function () { dessous.element.classList.remove("vue--revient"); }, 240);
        }

        // Redessiner la vue qui revient : son contenu a peut-être
        // changé (un indice trouvé, un fil devenu lu…).
        this.rafraichir();
    },


    /* Redessine la vue du dessus sans animation. */
    rafraichir: function () {
        const haut = this.pile[this.pile.length - 1];
        if (!haut || !haut.options || !haut.options.contenu) return;

        const o = haut.options;

        if (o.plein) {
            // Les vues "pleines" se redessinent entièrement : on
            // enlève tout sauf la barre de navigation.
            const barre = haut.element.querySelector(".barre-nav");
            vide(haut.element);
            if (barre) haut.element.appendChild(barre);
            o.contenu(haut.element);
        } else {
            const corps = haut.element.querySelector(".corps");
            if (!corps) return;
            const defilement = corps.scrollTop;
            vide(corps);
            o.contenu(corps);
            corps.scrollTop = defilement;
        }
    },


    /* Remonte jusqu'à l'écran racine de l'app ouverte. */
    retourRacine: function () {
        while (this.pile.length > 1) {
            const haut = this.pile.pop();
            if (haut.element.parentNode) haut.element.remove();
        }
        const racine = this.pile[0];
        if (racine) racine.element.classList.remove("vue--dessous");
        this.rafraichir();
    },


    /* ========================================================
       BANNIÈRES DE NOTIFICATION
       ======================================================== */
    notifier: function (options) {
        const o = options || {};
        const definition = o.appId ? app(o.appId) : null;
        const icone = definition ? (ICONES_APPS[definition.icone] || ICONES_APPS.messages) : ICONES_APPS.messages;

        if (o.son !== false) SONS.notification();

        const banniere = el("div", { classe: "banniere" }, [
            el("div", { classe: "banniere-icone", style: { background: icone.fond }, html: icone.glyphe }),
            el("div", { classe: "banniere-texte" }, [
                el("div", { classe: "banniere-titre" }, [
                    el("span", { texte: o.titre || (definition ? definition.nom : "") }),
                    el("span", { texte: "maintenant" }),
                ]),
                el("div", { classe: "banniere-corps", texte: o.texte || "" }),
            ]),
        ]);

        const partir = function () {
            if (!banniere.parentNode) return;
            banniere.classList.add("banniere--partante");
            plusTard(function () { if (banniere.parentNode) banniere.remove(); }, 300);
        };

        banniere.addEventListener("click", function () {
            partir();
            if (o.auClic) o.auClic();
            else if (o.appId) OS.ouvrirApp(o.appId);
        });

        this.zoneBannieres.appendChild(banniere);
        plusTard(partir, o.duree || DUREE_BANNIERE);

        this.rafraichirBadges();
    },


    /* Le petit bandeau du bas : « Noté dans le carnet ». */
    toast: function (texte, options) {
        const o = options || {};

        const bandeau = el("div", { classe: "toast" + (o.info ? " toast--info" : "") }, [
            el("span", { classe: "glyphe", html: o.icone || ICONES.carnet }),
            el("span", { texte: texte }),
        ]);

        this.zoneToasts.appendChild(bandeau);

        plusTard(function () {
            bandeau.classList.add("toast--partant");
            plusTard(function () { if (bandeau.parentNode) bandeau.remove(); }, 300);
        }, o.duree || 2600);
    },


    /* Redessine l'écran d'accueil (donc les pastilles rouges).
       Il est toujours là, derrière l'app : on peut le rafraîchir
       même quand une application est ouverte. */
    rafraichirBadges: function () {
        if (!this.scene || !this.elementAccueil) return;

        const dossierEtaitOuvert = this.dossierOuvert;
        this.dessinerAccueil();
        if (dossierEtaitOuvert && !this.appOuverte) this.ouvrirDossier(dossierEtaitOuvert);
    },


    /* ========================================================
       BOÎTE DE DIALOGUE SYSTÈME
       ========================================================
       OS.alerte({
           titre: "Supprimer ?",
           message: "C'est définitif.",
           boutons: [
               { texte: "Annuler" },
               { texte: "Supprimer", danger: true, auClic: fn },
           ],
       });
       ======================================================== */
    alerte: function (options) {
        const o = options || {};

        const fond = el("div", { classe: "alerte-fond" });
        const boutons = el("div", { classe: "alerte-boutons" });

        (o.boutons || [{ texte: "OK" }]).forEach(function (b) {
            boutons.appendChild(el("div", {
                classe: "alerte-bouton" + (b.fort ? " alerte-bouton--fort" : "") +
                    (b.danger ? " alerte-bouton--danger" : ""),
                texte: b.texte,
                auClic: function () {
                    fond.remove();
                    if (b.auClic) b.auClic();
                },
            }));
        });

        fond.appendChild(el("div", { classe: "alerte" }, [
            el("div", { classe: "alerte-texte" }, [
                el("div", { classe: "alerte-titre", texte: o.titre || "" }),
                o.message ? el("div", { classe: "alerte-message", texte: o.message }) : null,
            ]),
            boutons,
        ]));

        this.ecran.appendChild(fond);
    },


    /* ========================================================
       DEMANDER UN CODE À QUATRE CHIFFRES
       ========================================================
       Sert au déverrouillage du téléphone, à l'album privé et
       au mouchard. On passe :
         titre, message, indice   -> ce qu'on affiche
         bonCode                  -> la chaîne attendue
         reussi()                 -> ce qu'on fait si c'est bon
         annule()                 -> le bouton "Annuler"
       ======================================================== */
    demanderCode: function (options) {
        const o = options || {};
        let saisie = "";

        const points = el("div", { classe: "code-points" });
        const longueur = o.longueur || 4;
        let toucheTexte = null;        // la touche en bas à droite : "Annuler" puis "Effacer"

        const dessinerPoints = function () {
            vide(points);
            for (let i = 0; i < longueur; i++) {
                points.appendChild(el("div", {
                    classe: "code-point" + (i < saisie.length ? " plein" : ""),
                }));
            }
            if (toucheTexte) {
                toucheTexte.textContent = saisie.length > 0 ? "Effacer" : (o.annule ? "Annuler" : "");
            }
        };

        const ecran = el("div", { classe: "ecran-verrou" });
        ecran.appendChild(el("div", { classe: "fond" }));

        if (o.sansHorloge !== true) {
            ecran.appendChild(el("div", { classe: "verrou-heure", texte: heureReelle() }));
            ecran.appendChild(el("div", { classe: "verrou-date", texte: dateReelleLongue() }));
        }

        ecran.appendChild(el("div", { classe: "verrou-consigne", texte: o.titre || "Saisir le code" }));
        ecran.appendChild(points);

        if (o.indice) {
            ecran.appendChild(el("div", { classe: "verrou-indice", texte: o.indice }));
        }

        dessinerPoints();

        /* le pavé numérique */
        const pave = el("div", { classe: "pave" });
        const lettres = ["", "", "A B C", "D E F", "G H I", "J K L", "M N O", "P Q R S", "T U V", "W X Y Z"];

        const tape = function (chiffre) {
            if (saisie.length >= longueur) return;
            SONS.clavier();
            saisie += chiffre;
            dessinerPoints();

            if (saisie.length === longueur) {
                plusTard(function () { verifier(); }, 180);
            }
        };

        const verifier = function () {
            if (saisie === String(o.bonCode)) {
                SONS.deverrouillage();
                plusTard(function () {
                    OS.fermerRecouvrement();
                    if (o.reussi) o.reussi();
                }, 220);
            } else {
                SONS.erreur();
                points.classList.add("faux");
                plusTard(function () {
                    points.classList.remove("faux");
                    saisie = "";
                    dessinerPoints();
                    if (o.rate) o.rate();
                }, 500);
            }
        };

        // Une touche = un chiffre. On enferme le chiffre dans une
        // fonction pour que chaque touche garde le sien.
        const toucheChiffre = function (chiffre) {
            return el("div", {
                classe: "pave-touche",
                auClic: function () { tape(String(chiffre)); },
            }, [
                el("span", { texte: String(chiffre) }),
                lettres[chiffre] ? el("span", { classe: "pave-lettres", texte: lettres[chiffre] }) : null,
            ]);
        };

        for (let n = 1; n <= 9; n++) {
            pave.appendChild(toucheChiffre(n));
        }

        pave.appendChild(el("div", { classe: "pave-touche pave-touche--vide" }));
        pave.appendChild(toucheChiffre(0));

        toucheTexte = el("div", {
            classe: "pave-touche pave-touche--texte",
            texte: o.annule ? "Annuler" : "",
            auClic: function () {
                if (saisie.length > 0) {
                    SONS.tape();
                    saisie = saisie.slice(0, -1);
                    dessinerPoints();
                } else if (o.annule) {
                    OS.fermerRecouvrement();
                    o.annule();
                }
            },
        });
        pave.appendChild(toucheTexte);

        ecran.appendChild(pave);

        this.ouvrirRecouvrement(ecran);
        return ecran;
    },


    /* ========================================================
       DEMANDER UN MOT (clavier de lettres)
       ======================================================== */
    demanderMot: function (options) {
        const o = options || {};
        let saisie = "";

        const affichage = el("div", { classe: "saisie-mot" });

        const dessiner = function () {
            affichage.textContent = saisie;
        };

        const ecran = el("div", { classe: "ecran-verrou" });
        ecran.appendChild(el("div", { classe: "fond" }));
        ecran.appendChild(el("div", { classe: "verrou-consigne", texte: o.titre || "Mot de passe" }));

        if (o.indice) {
            ecran.appendChild(el("div", { classe: "verrou-indice", texte: o.indice }));
        }

        ecran.appendChild(affichage);

        const rangees = ["QWERTZUIOP", "ASDFGHJKL", "YXCVBNM"];
        const clavier = el("div", { classe: "clavier-lettres" });

        rangees.forEach(function (rangee) {
            const ligneClavier = el("div", { classe: "clavier-rangee" });

            rangee.split("").forEach(function (lettre) {
                ligneClavier.appendChild(el("div", {
                    classe: "clavier-touche",
                    texte: lettre,
                    auClic: function () {
                        if (saisie.length >= 12) return;
                        SONS.clavier();
                        saisie += lettre;
                        dessiner();
                    },
                }));
            });

            clavier.appendChild(ligneClavier);
        });

        clavier.appendChild(el("div", { classe: "clavier-rangee" }, [
            el("div", {
                classe: "clavier-touche clavier-touche--large",
                texte: "effacer",
                auClic: function () {
                    SONS.tape();
                    saisie = saisie.slice(0, -1);
                    dessiner();
                },
            }),
            el("div", {
                classe: "clavier-touche clavier-touche--large",
                texte: o.annule ? "annuler" : " ",
                auClic: function () {
                    if (o.annule) { OS.fermerRecouvrement(); o.annule(); }
                },
            }),
            el("div", {
                classe: "clavier-touche clavier-touche--large",
                texte: "ok",
                auClic: function () {
                    if (sansAccents(saisie) === sansAccents(String(o.bonMot))) {
                        SONS.deverrouillage();
                        plusTard(function () {
                            OS.fermerRecouvrement();
                            if (o.reussi) o.reussi();
                        }, 200);
                    } else {
                        SONS.erreur();
                        affichage.classList.add("faux");
                        plusTard(function () {
                            affichage.classList.remove("faux");
                            saisie = "";
                            dessiner();
                        }, 450);
                    }
                },
            }),
        ]));

        ecran.appendChild(clavier);

        this.ouvrirRecouvrement(ecran);
    },


    /* ========================================================
       LE RECOUVREMENT (ce qui passe PAR-DESSUS tout)
       ======================================================== */
    ouvrirRecouvrement: function (element) {
        vide(this.recouvrement);
        this.recouvrement.appendChild(element);
        this.recouvrement.classList.add("visible");
        this.verrouille = true;
    },

    fermerRecouvrement: function () {
        vide(this.recouvrement);
        this.recouvrement.classList.remove("visible");
        this.verrouille = false;
    },


    /* ========================================================
       LA RECHERCHE GLOBALE
       ========================================================
       Elle vit dans recherche.js ; OS ne fait que l'afficher.
       ======================================================== */
    ouvrirRecherche: function () {
        if (typeof RECHERCHE === "undefined") return;
        RECHERCHE.ouvrir();
    },
};


/* Les barres de réseau de la barre d'état, dessinées à la main. */
const BARRES_RESEAU =
    '<svg viewBox="0 0 20 14" aria-hidden="true">' +
    '<rect x="0" y="9" width="3.2" height="5" rx="1" fill="currentColor"/>' +
    '<rect x="5.6" y="6.5" width="3.2" height="7.5" rx="1" fill="currentColor"/>' +
    '<rect x="11.2" y="4" width="3.2" height="10" rx="1" fill="currentColor"/>' +
    '<rect x="16.8" y="1.5" width="3.2" height="12.5" rx="1" fill="currentColor" opacity="0.35"/>' +
    '</svg>';
