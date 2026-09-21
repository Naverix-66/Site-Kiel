# La planche de casting

**À générer AVANT les planches d'animation individuelles.**

---

## Pourquoi cette étape

Les 6 peluches sont des espèces totalement différentes : un ours, un lapin
Jellycat, un lapin à oreilles de fraise, un tout petit ourson, un vieil ours
abîmé. Générées **séparément**, elles sortiront toutes :

- à la même taille,
- avec des proportions de tête différentes,
- avec des épaisseurs de trait et des palettes qui ne se parlent pas.

Or la bible du jeu repose sur leurs **tailles relatives**. Samsam est *très
gros*, Bluey est *tout petit*, Fraisy a des *oreilles immenses*. Si tout le
monde fait 48 px, on perd la moitié de la personnalité du groupe — et on la perd
définitivement, parce qu'on ne pourra plus rattraper la cohérence après coup.

D'où la méthode :

1. **Une planche de casting** — les 6, debout de face, côte à côte, dans une
   seule image. Ça verrouille le style commun ET les tailles relatives.
2. **Ensuite** la planche d'animation de chacune, en fournissant le casting
   comme image de référence.

---

## Les tailles relatives

Bob sert d'unité de mesure : **45 px**, soit ~70 cm en vrai.

| Peluche | Taille | Hauteur du sprite |
|---|---|---|
| **Samsam** | très gros | ~58 px |
| **Fraisy** | corps moyen, OREILLES immenses | ~42 px + oreilles hors gabarit |
| **Bob** | référence | **45 px** |
| **Rosy** | moyenne | ~40 px |
| **Doudou** | petit, tassé | ~36 px |
| **Bluey** | tout petit | ~26 px |

---

## Les 6 personnages

Description physique uniquement — les caractères sont dans `js/personnages.js`.

**Bob** — ours en peluche brun très foncé. T-shirt blanc, short noir à bandes
blanches. Museau ovale crème, gros nez noir, coussinets crème.
Voir `BOB_reference.md` pour sa palette complète.

**Samsam** — ourson **gris**, très gros et lourd. **Toujours en pyjama.**
Paupières tombantes, air perpétuellement sur le point de se rendormir.

**Rosy** — lapin **Jellycat blanc**. Longues oreilles tombantes, corps mou et
pelucheux, proportions Jellycat (tête ronde, membres souples).
**Tient une rose dans les pattes** — c'est son attribut, il ne la quitte jamais.

**Fraisy** — lapin de taille moyenne dont les **oreilles sont immenses** et ont
une **texture de fraise** : rouge,
avec des petits points de graines et des feuilles vertes à la base.
Expression joueuse, un peu folle.

**Bluey** — **tout petit** ourson **bleu**. Proportions exagérément bébé :
tête énorme par rapport au corps. Air innocent et surexcité.

**Doudou** — ours **très vieux et très abîmé**. Pelage usé et pelucheux par
endroits, coutures visibles, une oreille rapiécée, couleur passée et délavée.
Se tient un peu voûté. **Ses cicatrices sont son histoire** — elles doivent se
voir, c'est le personnage qui vient de loin.

---

## Le prompt du casting

```
Pixel art character line-up sheet, 6 different plush toy characters standing
side by side in a single row, all facing the viewer, full body, on a strict
common baseline (all feet on the same horizontal line).

Transparent background. NO text, NO labels, NO names, NO titles anywhere.
Hard pixel edges, no anti-aliasing, no blur, no outer glow.
One single consistent art style, one shared palette logic, identical line
weight and identical head-to-body proportion logic across all six.

Their RELATIVE SIZES matter and must be respected, from left to right:

1. A tiny blue teddy bear, by far the smallest, huge head compared to its
   body, innocent excited expression. (smallest)
2. A very old worn brown teddy bear, faded patchy fur, visible stitching,
   one patched ear, slightly hunched. (small)
3. A white Jellycat-style plush rabbit, long floppy ears, soft rounded body,
   holding a red rose in its paws. (medium)
4. A dark chocolate brown teddy bear wearing a white t-shirt and black shorts
   with white side stripes, large cream oval muzzle, big black nose, cream
   foot pads. (medium-large, this one is the reference size)
5. A very large fat grey teddy bear wearing pyjamas, heavy, droopy sleepy
   eyelids. (large)
6. A medium-sized plush rabbit with ENORMOUS oversized ears that have a
   strawberry texture: red with
   small seed dots and green leaves at the base. The BODY is average sized,
   only the ears are comically huge. Playful goofy expression.
   (average body, but the tallest silhouette because of the ears)
```

---

## Ensuite : les planches d'animation

Une fois le casting validé, chaque peluche reçoit sa planche sur le **même
gabarit que Bob** (voir `BOB_reference.md`) :

- cellules de **48 × 48 px**, grille stricte, aucun texte
- 4 lignes × 4 colonnes
- ligne 1 : idle face / dos / gauche / droite
- lignes 2-4 : marche bas / gauche / haut, 4 frames chacune
- **pieds alignés sur la même ligne de base dans toutes les cellules**

Le personnage occupe sa hauteur du tableau ci-dessus **à l'intérieur** de la
cellule de 48 px, aligné en bas. Bluey ne remplit donc que ~26 px de sa
cellule — c'est voulu, ça garde une grille unique et un code unique pour tout
le monde.

Fournir la planche de casting comme image de référence à chaque génération.
