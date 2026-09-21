# Notes de dev — jeu d'octobre

## Lancer le jeu

### Lot 1 (maintenant) — double-clic
Le jeu n'utilise aucune image : tout est dessiné avec des formes.
Un double-clic sur `octobre.html` suffit.

### Lot 2 et suivants — il faudra un serveur local
Dès qu'on chargera de vraies images (`loadSprite`), le double-clic
**ne marchera plus**. Chrome bloque le chargement d'images depuis le
protocole `file://` :

```
Access to image at 'file:///...' from origin 'null' has been blocked
by CORS policy
```

Ce n'est pas un bug de notre code, et ça ne se contourne pas proprement.
Il faut servir les fichiers en `http://`.

**Solution la plus simple, VS Code est déjà installé :**

1. Ouvrir VS Code dans le dossier `siteKiel`
2. Extensions (Ctrl+Shift+X) → chercher **Live Server** (Ritwick Dey)
3. Installer
4. Clic droit sur `10/octobre.html` → **Open with Live Server**

Le jeu s'ouvre sur `http://127.0.0.1:5500/10/octobre.html`, les images
se chargent, et la page se recharge toute seule à chaque sauvegarde.

À faire avant de commencer le Lot 2.

## Tester le tactile sans téléphone

F12 → l'icône téléphone/tablette en haut à gauche du panneau (ou
Ctrl+Shift+M) → choisir un modèle de téléphone → recharger la page.
Les événements tactiles sont alors simulés à la souris.

⚠️ Il faut **recharger après** avoir changé de mode : kaplay lit la
taille de l'écran au démarrage.

## Pièges déjà rencontrés

- **Les lignes d'un plan ASCII doivent toutes faire exactement la même
  longueur.** Une seule ligne trop courte et toute la pièce est décalée.
  Utiliser `_` pour le vide, jamais l'espace (invisible, et mangé par
  certains éditeurs).
- **Renommer une pièce dans `pieces.js`** oblige à mettre à jour l'appel
  `go("appartement", "...")` dans `octobre.js`.
- **`bob.move()` applique déjà le delta-temps.** Ne jamais multiplier par
  `dt()` en plus.

## Risque connu : le tunneling

Les murs font 16 px d'épaisseur. Si Bob se déplace de **plus de 16 px entre
deux images**, il traverse le mur sans jamais le toucher.

Le calcul : `pixels par image = VITESSE_BOB × dt`

| Fréquence d'images | dt | Déplacement/image à 70 px/s | Risque |
|---|---|---|---|
| 60 fps (normal) | 0,016 s | 1,2 px | aucun |
| 30 fps (téléphone chargé) | 0,033 s | 2,3 px | aucun |
| 4 fps (onglet en arrière-plan) | 0,25 s | 17,5 px | **traverse** |

Vérifié en conditions réelles : à 1 fps Bob traverse les murs, à vitesse
normale il s'arrête exactement contre eux.

En pratique le risque est faible (il faudrait descendre sous ~5 fps). Mais si
on augmente un jour `VITESSE_BOB` au-delà de ~300, il faudra soit épaissir les
murs, soit découper le déplacement en plusieurs petits pas par image.

## Vérifié et validé

- `addLevel` + le dictionnaire `TUILES` : 494 tuiles générées correctement
  depuis le plan ASCII.
- Le rendu du studio : lit, bureau, chaise, tapis, miroir, salle d'eau,
  tout tombe au bon endroit.
- `area()` + `body({ isStatic: true })` sur les tuiles et `area()` + `body()`
  sur Bob : la résolution de collision se déclenche bien.
- ⚠️ L'ordre compte : `area()` doit être placé **avant** `body()` dans la
  liste des composants. Le composant `body` branche la résolution des
  collisions dans son `add()`, et il ne le fait que s'il voit déjà un `area`.

## ⚠️ Jamais de JPG pour un sprite

Un sprite doit **toujours** être en PNG. Constaté en vrai sur
`sprite_sheet_bob.jpg` :

| | JPG | PNG |
|---|---|---|
| Transparence | **impossible** (24 bits, pas de canal alpha) | oui |
| Couleurs plates | détruites par la compression | conservées |
| Couleurs comptées sur la planche de Bob | **5173** | ~30 attendues |

Deux conséquences fatales pour du pixel art :

1. **Le damier de transparence devient de vrais pixels gris et blancs.** Le
   personnage se retrouve enfermé dans un rectangle opaque en jeu.
2. **Les aplats sont marbrés.** Chaque zone d'une seule couleur devient un
   dégradé bruité, ce qui interdit toute retouche propre et fait baver les
   contours.

Le bruit JPG empêche même de **mesurer** la grille native du sprite : les
plages de couleur constante sont hachées, donc on ne peut plus déduire la
taille d'un pixel logique. Un fichier JPG de pixel art n'est pas récupérable,
il est à regénérer.
