# BOB — La Nuit du 8

**Bible narrative.** Document de référence du jeu d'octobre.
On s'y réfère avant d'écrire le moindre dialogue ou de dessiner le moindre décor.
Statut : verrouillé sauf mentions ⚠️.

---

## Le pitch

Nuit du 8 octobre, Kiel. Klara dort. Les peluches s'animent.
Bob avait préparé quelque chose pour Rosy, ce soir précisément.
Rosy n'est plus là. La fenêtre est entrouverte. Sur le tapis blanc :
un pétale de rose, et **une plume blanche**.

Bob va descendre la façade d'un immeuble de Kiel pour aller la chercher.

**Ton :** mignon et émouvant sur le fond, drôle et un peu absurde en surface,
avec deux ou trois moments franchement épiques. Ça finit bien. Toujours.

---

## La structure — 4 actes

### Acte I — L'enquête *(studio, vue de dessus)*
Le hub s'ouvre. Bob interroge tout le monde. Chacun détient **un fragment**
de la vérité et **demande un service** avant de le lâcher.

| Perso | Ce qu'il sait | Son prix |
|---|---|---|
| **Bluey** | « J'AI VU UN OISEAU GÉANT !! » — personne ne le croit. Il a raison. | Trop excité pour se souvenir : trois manches de cache-cache |
| **Cakey** | Il manque Samsam dans le lit. Et quelqu'un prépare une surprise à Bob pour ce soir — elle ne dira pas qui. | Aucun. Mais elle ne coupe pas son gâteau tant qu'il manque quelqu'un |
| **Fraisy** | A vu Samsam traverser l'appartement. Vers minuit, quelqu'un a pris la dernière crêpe, au sucre, pour Bob. | Elle a faim : la tomate du milieu |
| **Samsam** | A entendu Rosy crier son nom, et s'est levé à la place de Bob. | Il a froid et ne le dira jamais : une chaussette en laine |
| **Doudou** | La vérité entière. Il connaît les mouettes (Sylt). Et il sait qu'il existe un chemin vers le bas. | Rien. Il ne répond qu'à la plume |

Chez Doudou, c'est Bob qui recolle les morceaux : la surprise « qui se mange »
de Cakey + la dernière crêpe de Fraisy + une mouette = c'était Rosy.
Puis Cakey lui donne les deux secrets qu'elle gardait (voir son portrait).

**Gags récurrents d'Acte I :** tout le monde ignore Bluey, et Bluey a raison
depuis la première seconde. Et Cakey ne dit jamais une surprise — mais elle
en laisse échapper la moitié.

### Acte II — L'équipement *(studio, vue de dessus)*
Quatre objets à trouver, chacun dans une zone différente — une lumière, une
arme, une armure, et la corde. Ridicules et sérieux à la fois.
Plus **le pétale de rose**, qui ne sert à rien. Sauf à tout.

**Décidé avec Evan** (les vrais objets de chez Klara — on n'en invente pas d'autres) :
- **La lumière — la veilleuse jaune de la table de nuit.** Elle ne marche que
  branchée. On ne triche pas : Bluey s'en rend compte en hurlant, les doudous
  tirent la rallonge jusqu'à la fenêtre, et la veilleuse **reste là-haut,
  allumée, comme un phare**. Elle éclaire un peu la façade pendant la descente,
  et surtout elle montre à Bob par où remonter. **C'est l'idée de Cakey** : on
  laisse toujours une lumière allumée pour ceux qu'on attend.
- **L'arme** — une baguette à sushi, au fond de la vaisselle de l'évier.
- **Le bouclier** — le couvercle d'une bouteille en verre de jus de mangue, dans le frigo.
- **Le casque** — un dé à coudre, dans la boîte à couture offerte par la mère
  de Klara, rangée dans la penderie. Bob la fouille avec d'infinies précautions.
- **La corde** — le pyjama Miffy de Samsam (fin de l'acte I). **Le nœud** : Doudou.

**Codé (21/09, `js/acte2.js`, sauvegarde d'avant : tag git `avant-acte-2`)** :
- **Ouverture** : Samsam donne son pyjama — il passe à sa planche sans pyjama
  (tenue `samsam_sans_pyjama`, portrait compris). Bob ouvre la fenêtre en grand, ne voit que
  du noir ; Doudou le retient (« Je suis sorti dehors sans rien. Je suis revenu
  avec elles », ses coutures) et prend le pyjama pour préparer la corde.
  Carton « Acte II — L'équipement ».
- **Chacun son objet** : Fraisy sait où est la baguette (elle a léché le riz) ;
  Bluey a vu « le rond doré » dans le frigo quand Bob a pris la tomate ; Cakey
  a trouvé les quatorze élastiques dans la boîte à couture, donc elle sait pour
  le dé ; Samsam ouvre le jus trop serré sans se lever, d'une seule patte, et
  Fraisy traverse l'appartement en quatre secondes pour le jus.
- **Deux petits jeux** (`js/jeux.js`, on ne perd jamais) : tirer la baguette
  sans faire tomber la pile, prendre le dé sans toucher aux aiguilles (on vise
  la zone dorée) ; puis tirer la rallonge tous ensemble (on appuie vite).
- **La lumière en dernier** (Bob : « si je la prends maintenant, je n'y verrai
  plus rien pour chercher le reste »). Doudou se souvient de sa première nuit
  ici, la veilleuse allumée. Bob la débranche : le studio tombe dans le bleu,
  Bluey hurle, Cakey a l'idée du phare (« Pourquoi tu crois que Klara la laisse
  allumée toutes les nuits ? » — et Bob regarde le billet d'avion). Tout le
  monde tire la rallonge ; c'est Samsam, sans se lever, qui a le plus tiré.
- **Le phare** s'allume à la fenêtre (vraie lumière, et Mystic sounds).
- **Le départ** : le nœud de Doudou, l'équipement enfilé, le pétale (« Je le
  lui rends. Comme tous les matins. »), « Tu descends avec moi, Samsam. Tu es
  la corde. », la voix de Bluey « de quand ça va aller », le gâteau levé, Moin.
  Bob passe par la fenêtre. Carton « Fin de l'acte II ».
- Le gâteau levé et le « Moin » d'au revoir, qui fermaient l'acte I, sont
  passés au vrai départ.

### Acte III — La descente *(façade, VUE DE CÔTÉ — changement de gameplay)*
Bob passe par la fenêtre et descend en rappel la façade de l'immeuble.
Vent de la Baltique, pluie, les fenêtres allumées des voisins, et **la cour intérieure
et ses arbres** qui se rapprochent en bas. Deux étages : assez haut pour faire peur,
assez court pour rester une séquence tenue.

**C'est le morceau de bravoure du jeu.** Rupture totale : le studio est crème
et lumineux, ici c'est bleu, froid, immense, vertical.

### Acte IV — Le boss : **La Mouette** *(arène)*
Kiel est un port. Les mouettes y sont énormes et sans aucune pitié.
Son nid est **en haut d’un arbre de la cour intérieure**, plein de choses brillantes.
Rosy est dedans.
Combat en phases : elle plonge, elle crie, elle lâche des trucs.

### Épilogue
Bob remonte Rosy à l'aube. Tout le monde applaudit.
Et **là seulement**, Bob sort ce qu'il avait préparé pour le 8 octobre.

Dernier écran : le pixel art s'efface sur **une vraie photo d'Evan et Klara**.

---

## Le casting

Voir `js/personnages.js` pour les voix — le contrat d'écriture de chacun.

### Doudou — le pivot émotionnel
Doudou est **la peluche d'Evan**. Il n'habite pas ici : il a fait le voyage.
Il est vieux et abîmé **parce qu'il vient de loin**, pas parce qu'il est faible.

C'est le seul qui connaît le monde en dehors de l'appartement, parce que c'est
le seul à l'avoir traversé pour venir. Il ne dit jamais « je suis venu de loin ».
Il le montre.

**Son souvenir clé — Sylt.** Une île du nord qu'on n'atteint qu'en train, les rails
posés sur la mer. Doudou y était, dans un sac, avec Klara et Evan. Une mouette tournait
au-dessus d'eux ; ils ont serré leurs crêpes ; elle est descendue sur la femme assise en
face et lui a pris la sienne. Klara a tellement ri qu'elle a dû se tenir à Evan.
C'est la private joke, et c'est aussi la clé de l'acte I.

**Il n'est pas froid.** Vieux, lent, tendre. Il appelle Bob « mon grand ».

**Règle d'écriture :** Doudou ne répond jamais directement à une question.
Il répond par un souvenir. Et on ne surligne JAMAIS ce qu'il représente —
si le joueur le comprend tout seul, ça marche ; si on l'explique, ça meurt.

### Cakey — la fête
Assez grande (entre Bob et Samsam), un gâteau d'anniversaire dans les pattes,
qu'elle ne pose jamais. Extrêmement gentille, attentionnée, de loin la plus
positive. Elle adore les fêtes, et tout le monde l'adore. Son gâteau est délicieux.

Elle attend au pied du lit depuis minuit : elle veut être la première à
souhaiter joyeux 8 octobre au premier qui se réveille. Le 8, c'est leur jour,
à Klara et à celui qu'elle attend. « Le seul anniversaire qu'on choisit. »

**Ses deux règles :** elle ne dit JAMAIS une surprise, et on ne coupe pas le
gâteau tant qu'il manque quelqu'un. Toute son utilité vient de là :
- **Acte I, maillon 4** : elle compte tout le monde (il manque Samsam, Fraisy a
  forcément vu quelque chose), et elle laisse échapper qu'on prépare à Bob une
  surprise « qui se mange ». Elle remplace le lit, qui était une station muette.
- **Acte I, maillon 9** : les deux secrets. Rosy est venue la voir pour la crêpe ;
  Bob, trois semaines plus tôt, pour l'élastique (« Un joli. » Elle lui en a trouvé
  quatorze). Chacun pour l'autre, le même soir. C'est elle qui rend l'histoire
  d'amour claire, et plus seulement devinée.
- **Le 8** : elle le fête dès la première minute, pour rire. Chez Doudou, le même
  8 ne fait plus rire du tout.
- **Acte II** : l'idée du phare (la veilleuse laissée allumée à la fenêtre).
- **Épilogue** : le gâteau est enfin coupé, quand Bob et Rosy sont rentrés.
  ⚠️ Il n'est JAMAIS partagé avec la mouette (décision d'Evan).

**Son optimisme n'est pas de la naïveté.** Elle voit très bien quand ça va mal,
et elle choisit le bon côté exprès, pour les autres. Une seule fois, elle oublie
de sourire — quand Bob lui demande où est Rosy.

---

## Pourquoi cette histoire

- **Émotion** : Bob traverse un monde entier — 25 m² et une façade — pour elle.
- **Drôle** : Samsam qui aide sans jamais se lever, Bluey qu'on n'écoute pas,
  Fraisy qui mange les preuves, Cakey qui ne sait pas garder une surprise.
- **Absurde** : une mouette comme boss final, un cure-dent comme épée.
- **Épique** : la descente.
- **Ancré dans le réel** : le vrai studio, les 3 vraies fenêtres, la vraie ville
  portuaire, les vraies peluches, la vraie date.
- **Ça tombe pile** sur la nuit du 8 octobre.

---

## Variété de gameplay

Trois modes distincts, c'est ce qui fait la différence entre un mini-jeu
et un vrai jeu :

1. **Vue de dessus** — l'appartement, l'exploration, les dialogues (Actes I-II)
2. **Vue de côté** — la descente en rappel (Acte III)
3. **Arène** — le combat contre la Mouette (Acte IV)

---

## ⚠️ À confirmer

- ~~Étage~~ → **2e étage**. La descente en rappel est validée.

- **Est-ce qu'au moins une des 3 fenêtres s'ouvre ?** (a priori oui)
- ~~Décor du bas~~ → **une immense cour intérieure**, avec un parc et des arbres. Le nid de la Mouette est **dans un arbre**.
- Le plan réel de l'appartement (photo en attente) → corrige `js/pieces.js`.
- ~~Sprites des peluches~~ → **reçus le 17/09** (Rosy, Samsam, Fraisy, Bluey,
  Doudou, Cakey + les icônes d'objets), convertis par `outils/refaire_peluches.ps1`.
  **Samsam sans pyjama** et **la vraie veilleuse** (lampe.png) reçus le 21/09.
  Manque : **Moin** (il n'existe qu'en texte).
- La vraie couleur des rideaux de Klara (le rideau tombé est crème pour l'instant).
- ~~Cakey appâte la mouette avec son gâteau~~ → **NON, décidé par Evan.**
  Cakey ne partage JAMAIS son gâteau avec la mouette.
- Le texte exact de la fin, et la photo finale.
