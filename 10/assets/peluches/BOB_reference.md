# Bob — fiche de dessin

Référence : la photo de la vraie peluche.
À garder ouvert pendant le dessin ou la génération du sprite.

---

## Ce qui fait Bob

Grand ours en peluche, fourrure **brun très foncé, presque noire**.
Grosse tête ronde, ventre rond, membres longs.

**Ses marques identitaires**, dans l'ordre d'importance :

1. **Le t-shirt blanc** — un t-shirt blanc classique. C'est ce qu'on voit en premier.
2. **Le short noir à bandes blanches** sur les côtés.
3. **Le museau** — un large ovale crème qui couvre tout le bas du visage.
4. **Le nez** — noir, gros, arrondi, très visible sur le crème.
5. **Les coussinets** — deux gros ovales crème sous les pieds.

Les yeux sont petits, sombres, et se fondent presque dans la fourrure.
Les oreilles sont rondes, dressées, entièrement foncées.

---

## ⚠️ La lisibilité, et comment la tenue la règle

Bob est **très foncé**, et le jeu se passe **la nuit**, dans un décor sombre.
Un ours brun-noir sur un parquet sombre serait une tache illisible.

**Le t-shirt blanc résout presque tout.** C'est la plus grande surface claire du
sprite, donc la première chose que l'œil accroche dans une pièce mal éclairée.
Il rend aussi Bob immédiatement distinguable de n'importe quel autre ourson brun.

Les trois règles qui restent :

- **Éclaircis la fourrure par rapport à la photo.** Le pixel art exagère
  toujours. Un `#3E3128` se lit bien mieux qu'un `#211A16` fidèle mais noir.
- **Le museau et les coussinets sont ses phares secondaires.** Ne les rétrécis
  pas pour « faire réaliste » — donne-leur au contraire un pixel de plus que la
  logique ne le voudrait.
- **Un liséré chaud d'un pixel** sur le contour (`#7A6248`) le détache du décor.
  Surtout pas un contour noir : ça l'écraserait encore plus.

---

## Palette (14 couleurs)

### Fourrure
| Rôle | Hex | RGB |
|---|---|---|
| ombre profonde | `#1F1815` | 31, 24, 21 |
| ombre | `#2C231D` | 44, 35, 29 |
| **base** | `#3E3128` | 62, 49, 40 |
| lumière | `#52412F` | 82, 65, 47 |
| reflet (duvet) | `#6B5540` | 107, 85, 64 |

### Crème (museau, coussinets)
| Rôle | Hex | RGB |
|---|---|---|
| ombre | `#C9B99C` | 201, 185, 156 |
| **base** | `#E4D7BE` | 228, 215, 190 |
| lumière | `#F6EEDC` | 246, 238, 220 |

### Tenue
| Rôle | Hex | RGB |
|---|---|---|
| t-shirt blanc | `#F2F0EC` | 242, 240, 236 |
| ombre du t-shirt | `#CFCBC4` | 207, 203, 196 |
| short noir | `#1A1A1E` | 26, 26, 30 |
| bandes du short | `#F2F0EC` | 242, 240, 236 |

### Traits
| Rôle | Hex | RGB |
|---|---|---|
| nez et yeux | `#14100E` | 20, 16, 14 |
| liséré de contour | `#7A6248` | 122, 98, 72 |

`#3E3128` est aussi la `couleurPlaceholder` de Bob dans `js/personnages.js`.

---

## Format à produire

Le jeu passe en **tuiles de 32 px** (le pack LimeZu livre le même tileset en
16, 32 et 48, avec des grilles identiques — changer d'échelle ne coûte qu'une
constante). À cette échelle, 1 tuile ≈ 50 cm, soit ~1,5 cm par pixel.

Bob mesurant ~70 cm en vrai, son sprite fait donc **environ 45 px de haut**.

| | |
|---|---|
| Fichier | PNG, **fond transparent** |
| Cellule | **48 × 48 px**, grille stricte, aucune variation d'espacement |
| Planche | **4 lignes × 4 colonnes** = 16 cellules |
| Interdit | tout texte, libellé, titre ou en-tête dans l'image |

Ordre des lignes :

| Ligne | Contenu |
|---|---|
| 1 | idle : face, dos, gauche, droite |
| 2 | marche vers le bas — 4 frames |
| 3 | marche vers la gauche — 4 frames |
| 4 | marche vers le haut — 4 frames |

La marche vers la droite n'est pas à générer : elle est produite en miroir dans
le code (`flipX`). Autant économiser 4 frames de risque d'incohérence.

**Contrainte capitale : les pieds doivent être alignés sur la même ligne de base
dans les 16 cellules.** Sans ça, Bob sautille verticalement pendant sa marche,
et c'est le défaut le plus visible et le plus difficile à rattraper après coup.
