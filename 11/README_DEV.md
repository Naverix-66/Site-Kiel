# Notes de dev — jeu de novembre

**ONZE JOURS** — une enquête dans le téléphone d'une femme qui a disparu.
Jeu web, pensé **pour un iPhone**, en plein écran, sans aucune dépendance.

L'histoire, les personnages, les codes et la solution sont dans `HISTOIRE.md`.
Ce fichier-ci ne parle que de technique.

---

## Lancer le jeu

### Sur l'ordinateur
Comme en octobre : **Live Server** dans VS Code.
Clic droit sur `11/novembre.html` → *Open with Live Server*.

Un double-clic sur le fichier marche aussi (il n'y a aucune image à charger,
tout est dessiné en SVG) — mais `localStorage` est capricieux en `file://`,
donc la sauvegarde peut ne pas tenir. Préfère Live Server.

### Sur ton téléphone, en vrai
1. lance Live Server,
2. récupère l'adresse réseau (`http://192.168.x.x:5500/11/novembre.html`),
3. ouvre-la dans Safari, **Partager → Sur l'écran d'accueil**.

À partir de là le jeu s'ouvre en plein écran, sans barre d'adresse, et c'est
la **vraie barre d'état d'iOS** qui sert de barre d'état au jeu (on efface la
nôtre dans ce cas : voir `body.autonome` dans le CSS). C'est le mode pour
lequel tout a été réglé — c'est comme ça qu'il faut le montrer à Klara.

### Mode développement
Ajoute `?dev` à l'URL :

```
http://127.0.0.1:5500/11/novembre.html?dev
```

- l'acte 0 (enveloppe, mot, photo, code) est sauté,
- les codes s'affichent dans la console,
- Réglages gagne une section « développement » : *tout déverrouiller* et
  *effacer la sauvegarde*.

### Repartir de zéro
Réglages → développement → *Effacer la sauvegarde* (en mode dev),
ou dans la console : `effacerLaSauvegarde(); location.reload();`
ou encore : change `CLE_SAUVEGARDE` dans `js/config.js`.

---

## Comment c'est construit

Même principe qu'en octobre : **pas de framework, pas d'import/export**.
Chaque fichier peut utiliser ce qui est défini dans les fichiers chargés
au-dessus de lui dans `novembre.html`. L'ordre des `<script>` compte.

```
novembre.html        la coquille + l'ordre de chargement
novembre.css         TOUT le style (rangé en 11 sections numérotées)
js/
  config.js          les constantes (codes, dates, couleurs, rythme)
  outils.js          el(), les dates, les briques d'interface
  icones.js          toutes les icônes, en SVG
  sauvegarde.js      ETAT + localStorage
  sons.js            les sons, synthétisés (aucun fichier audio)
  peintures.js       les photos, peintes en SVG
  donnees_*.js       le contenu du téléphone (8 fichiers)
  enquete.js         indices, objectifs, déductions, aides
  os.js              le « système » : accueil, pile de vues, notifications
  app_*.js           une application = un fichier (14)
  recherche.js       la recherche globale
  scenario.js        les actes, Mira en direct, la fin
  intro.js           l'enveloppe, le mot, la photo, le code
  novembre.js        le lancement
```

### Écrire une application

Il n'y a qu'une fonction à connaître, `OS.pousser()` :

```js
enregistrerApp({
    id: "notes",
    nom: "Notes",
    icone: "notes",          // une clef de ICONES_APPS
    dock: true,              // (facultatif) dans le dock du bas
    dossier: "utilitaires",  // (facultatif) rangée dans un dossier
    badge: function () { return 3; },   // (facultatif) la pastille rouge

    ouvrir: function () {
        OS.pousser({
            grandTitre: "Notes",
            contenu: function (corps) {
                corps.appendChild(ligne({ titre: "Bonjour" }));
            },
        });
    },
});
```

`OS.pousser()` empile un écran (avec le glissement et le bouton retour).
`plein: true` donne la vue entière au lieu d'une zone qui défile (pour les
écrans qui ont une barre en bas : Messages, la calculatrice, Plans).
`OS.rafraichir()` redessine l'écran du dessus — c'est comme ça qu'on gère
les onglets : on garde l'onglet courant dans une variable, et on redessine.

### Ajouter un indice

1. l'écrire dans `INDICES` (`js/enquete.js`) ;
2. accrocher son identifiant à l'endroit où on le lit :
   `indice: "mon_indice"` sur un message, une photo, une note, un mail…
   (ou appeler `ENQUETE.trouver("mon_indice")` à la main) ;
3. si on veut qu'il serve à conclure quelque chose, l'ajouter aux `paires`
   d'une déduction.

Les indices se ramassent **tout seuls à la lecture**. On ne cache jamais rien
derrière un pixel : le jeu, c'est de relier, pas de fouiller.

### Remplacer une peinture par une vraie photo

Toutes les photos sont dessinées en SVG dans `js/peintures.js`. Si tu prends
de vraies photos à Kiel, mets le fichier dans `11/assets/` et remplace, dans
`js/donnees_photos.js` :

```js
{ id: "p11", peinture: "hornbrucke", … }
```
par
```js
{ id: "p11", fichier: "assets/hornbrucke.jpg", … }
```

Le reste du jeu ne change pas (`imagePhoto()` gère les deux cas).

---

## Les deux pièges déjà rencontrés (et corrigés)

### 1. La fusion de sauvegarde qui efface la progression
`fusionner()` ne gardait que les clés présentes dans le modèle. Or la moitié
de la progression vit dans des dictionnaires **vides** au départ
(`objectifs`, `deductions`, `lus`, `etapesScenario`). Résultat : à chaque
rechargement de page, les déductions disparaissaient et les scènes déjà vues
se rejouaient. La fusion garde maintenant **l'union** des clés.
→ `js/sauvegarde.js`, et un gros ⚠️ dans le commentaire.

### 2. La progression suspendue à une réponse de dialogue
Les changements d'acte se faisaient à la fin d'une scène de Mira. Une joueuse
qui ignorait une question de Mira (très possible : on a un téléphone entier à
fouiller) restait **bloquée en acte I pour toujours**.
Maintenant l'acte se déduit uniquement de ce qui est établi
(`SCENARIO.verifierLesActes()`), et une question de Mira sans réponse expire
au bout de deux minutes. Les questions de Lena, elles, n'expirent jamais :
c'est la fin du jeu, on attend.

**Règle générale qu'on en tire :** aucune progression ne doit dépendre d'un
clic sur un bouton de dialogue.

---

## Règles de conception (à ne pas casser)

1. **On ne peut jamais être bloquée.** Bouton « Mira, aide-moi » dans le
   carnet (`ENQUETE.aide()` descend une liste d'aides dans l'ordre), et Mira
   relance d'elle-même au bout de 2 min 30 sans rien trouver.
2. **Une erreur n'est jamais punie.** Une mauvaise épingle sur la carte fait
   avancer (Mira explique pourquoi ça ne tient pas). Une mauvaise réponse à
   Lena fait répéter la question avec un indice en plus.
3. **Ce n'est pas un jeu d'horreur.** Pas de sursaut, pas de menace dirigée
   vers la joueuse, pas de compte à rebours.
4. **Pas de chasse au pixel.** Lire = trouver.
5. **Jamais deux fois la même source.** Chaque ligne de la chronologie est
   prouvée par une application différente.

---

## Vérifié

Partie complète jouée de bout en bout dans le navigateur, sans une seule
erreur console :

- acte 0 : enveloppe → mot écrit à la main → photo retournée → code `0307` ;
- 15 applications ouvertes, 45 écrans parcourus (albums, visionneuse, notes,
  mails, pages web, journal du mouchard…) ;
- les 6 déductions valident sur leurs bonnes paires et refusent les mauvaises ;
- la chronologie se valide, les actes s'enchaînent, les trois questions de
  Lena fonctionnent (y compris une mauvaise réponse qui reboucle) ;
- l'épilogue arrive, la photo argentique apparaît dans la pellicule ;
- la sauvegarde survit à un rechargement (44 indices, 100 %).

Le parcours « normal » de l'acte I (Messages → Calendrier → Photos →
Téléphone → Santé → Réglages) ramasse exactement les 6 traces de la
chronologie. C'est le cœur de la boucle de jeu, il est juste.

---

## Reste à faire

- [ ] la voix de Lena à l'acte IV (Piper, comme les peluches d'octobre —
      voir `10/outils/voix.js`) ; pour l'instant : forme d'onde + transcription ;
- [ ] une icône pour « Sur l'écran d'accueil » (il faut un vrai PNG 180×180,
      `apple-touch-icon` n'accepte pas de SVG) ;
- [ ] le cadeau réel branché à l'épilogue ;
- [ ] relire tous les textes à voix haute (c'est comme ça qu'on repère les
      répliques qui sonnent faux) ;
- [ ] les six points ⚠️ en bas de `HISTOIRE.md`.
