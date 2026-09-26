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
  Bluey a vu « le rond argenté » dans le frigo quand Bob a pris la tomate ; Cakey
  a trouvé les quatorze élastiques dans la boîte à couture, donc elle sait pour
  le dé ; Samsam ouvre le jus trop serré sans se lever, d'une seule patte, et
  Fraisy traverse l'appartement en quatre secondes pour le jus.
- **Trois petits jeux** (refaits le 21/09 à la demande d'Evan : « plus durs, et
  avec une âme ») :
  - **Le sommeil de Klara** (`js/jeux.js`, `js/reveil.js`) : Doudou prévient au
    début de l'acte (« Une assiette qui tombe, un bureau qui cogne, et elle se
    réveille… si un humain se réveille, on fait le mort »). Chaque maladresse
    fait du bruit, une jauge monte. Si elle déborde, Klara se réveille : la
    caméra plonge sur le lit, sa forme remue sous la couette, sous-titres à son
    nom (« …mmh ? … c'est quoi, ce bruit… … zzz »), et tout le monde court se
    ranger au pied du lit et fait le mort (Doudou sur place, « à mon âge » ;
    Samsam, pour une fois, arrangé de ne pas pouvoir se lever). Elle se
    rendort, et on reprend exactement où on en était.
  - **Klara dort dans son lit** : une forme sous la couette, jusqu'aux oreilles
    (on ne dessine pas son visage à sa place ; un dessin d'Evan pourra la
    remplacer).
  - **Les dessins des jeux** sont peints en pixels au chargement (`js/pixels.js`).
  - **Commandes** : on tient la souris / le doigt, et l'objet file vers le
    pointeur d'autant plus vite qu'il est loin (analogique). Aux flèches, la
    baguette accélère tant qu'on tient : il faut tapoter.
  - **La pile de vaisselle** (`js/jeu_vaisselle.js`) : l'évier vu de l'intérieur,
    une pile très haute, la baguette tout au fond. On la remonte en faisant
    glisser le doigt. Trop vite : la pile tangue, puis s'effondre (fracas, bruit
    énorme, retour au fond). Toucher un verre : effondrement immédiat.
  - **La boîte à couture** (`js/jeu_couture.js`) : un Docteur Maboule. Sortir
    l'épingle, la bobine, puis le dé, chacun par son sillon dans la mousse ;
    toucher un bord ou une aiguille : BZZT, « Aïe ! », du bruit.
  - **La rallonge** : il faut tirer vite, mais s'arrêter net quand ça COINCE
    (sinon le bureau cogne, et Klara dort juste à côté).
  - Les tintements, le fracas et le buzzer sont fabriqués par le navigateur
    (`sonSynthe`, dans `js/sons.js`) ; la musique se retire pendant les jeux.
- **La lumière en dernier** (Bob : « si je la prends maintenant, je n'y verrai
  plus rien pour chercher le reste »). Doudou se souvient de sa première nuit
  ici, la veilleuse allumée. Bob la débranche : le studio tombe dans le bleu,
  Bluey hurle, Cakey a l'idée du phare (« Pourquoi tu crois que Klara la laisse
  allumée toutes les nuits ? » — et Bob regarde le billet d'avion). Tout le
  monde tire la rallonge ; c'est Samsam, sans se lever, qui a le plus tiré.
- **Le phare** s'allume à la fenêtre : seulement sa lumière (Evan : la petite lampe
  dessinée sur le rebord ne rendait pas bien), et Mystic sounds.
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

**CODÉ** (`js/facade.js` pour le décor, `js/acte3.js` pour l'acte) :

- **La façade est celle de la photo d'Evan** : brique rouge sombre montée en
  panneresses, encadrements blancs, appuis de béton, descente de gouttière entre
  deux travées, soupiraux de cave au ras du sol, herbe haute qui cache le pied du
  mur, et l'immeuble en retour dans l'ombre à droite. Tout est peint au
  chargement, pixel par pixel, en couleurs de nuit — on ne pose pas un voile noir
  sur un mur de jour. La fenêtre de Klara est la seule ouverte : lumière chaude,
  et quatre petites têtes dedans qui regardent.
- **Les commandes** : le pointeur est un geste analogique (plus bas que Bob = la
  corde file, plus à droite = il se balance), ou les flèches. Même famille que les
  deux petits jeux de l'acte II.
- **La règle de l'acte, dite par Doudou** : « Quand ça souffle, on ne descend
  pas. » Tant que Bob ne file pas la corde, il se colle au mur et la rafale ne le
  prend presque pas. Les rafales s'annoncent une seconde et demie à l'avance — la
  pluie penche avant le bruit.
- **La sanction, décidée par Evan** : jamais de partie perdue. Bob glisse d'une
  centaine de pixels, le nœud de Doudou tient, Samsam dit « Je te tiens », et on
  le remonte. Il reperd de la hauteur, et jamais plus haut que le dernier appui.
- **Les appuis de fenêtre sont les respirations** : Bob s'y pose, y marche, et
  c'est là que la partie se range. Recharger la page ne fait pas recommencer
  l'acte.
- **La route** : le cordon de briques saillantes (on ralentit), la fenêtre du
  voisin qui s'allume pile quand Bob est devant la vitre (on ne bouge plus ;
  posé sur l'appui, il est sous la vitre, donc invisible), l'appui du 1er et le
  souvenir de Doudou, la toile d'araignée vide (« Bonsoir. »), le
  collier de gouttière qui fuit (trempé, il glisse plus vite), l'appui du rez et
  la télé bleue du voisin qui ne dort pas non plus, puis **le bout de la corde :
  il manque un étage**. Bob lâche, vise l'herbe — et pas une grille de cave.
- **Trois choses dépassent du mur, et c'est ce qui fait jouer la gauche et la
  droite** : la jardinière au coin gauche de l'appui du 1er, le fil à linge (avec
  sa chaussette oubliée) qui ferme la gauche, et la parabole qui ferme la droite
  juste en dessous. On passe donc à droite, puis on retraverse à gauche.
  Vérifié par calcul : le passage le plus étroit laisse 24 px de large pour un
  Bob de 22, et tout est à portée du balancier.
- **Le souvenir de Doudou**, sur l'appui du 1er : le train qui roule sur l'eau —
  celui de la mouette et de la crêpe. Le sac était ouvert, il y avait de l'eau
  des deux côtés, il a regardé ses pattes pendant vingt minutes, et puis les
  rails sont revenus sur la terre. « Ça se termine toujours, ces endroits-là. »
- **La corde est vraiment le pyjama** : couleurs relevées sur la planche de
  Samsam (tissu crème, liseré bordeaux, petits boutons), tordues en corde.
  Et Samsam est à la fenêtre **sans son pyjama**, forcément.
- **Le dernier plan** : la caméra remonte toute la façade jusqu'à la tache jaune
  de la veilleuse, grande comme un ongle. Un cri de mouette, très haut dans un
  arbre. Carton « Fin de l'acte III ».


### Acte IV — Le boss : **La Mouette** *(arène, vue de côté)*
Kiel est un port. Les mouettes y sont énormes et sans aucune pitié.
Son nid est **en haut d'un arbre de la cour intérieure**, plein de choses brillantes.
Rosy est dedans.

**CODÉ** (`js/cour.js` pour l'arène, `js/acte4.js` pour l'acte, `js/nid.js`
pour le nid) :

- **UNE SEULE TOUCHE : ESPACE.** Evan : « je savais pas que Bob pouvait se
  protéger, on devrait mettre une touche unique. » Gauche/droite pour marcher
  (flèches, QD, AD, ou le joystick du reste du jeu), ESPACE **tenu** pour lever
  le couvercle, ESPACE **appuyé** pour frapper. ESPACE ne fait jamais deux
  choses à la fois : dès qu'un coup est possible, le couvercle ne se lève plus
  et le mot à côté du bouton change. Le joueur n'a jamais à choisir une touche,
  seulement un moment.
- **ET SURTOUT : ON VOIT OÙ ÇA VA TOMBER.** Evan : « j'ai pas bien compris le
  combat, c'est tellement vague. » Le combat était juste, mais invisible. Tout ce
  qui va arriver est maintenant dessiné AU SOL, avant d'arriver :
  une colonne de lumière et un cercle dans l'herbe à l'endroit exact du piqué,
  **doré** quand Bob n'est pas dedans, **rouge** quand il l'est, avec un « ! »
  au-dessus de sa tête. Et un arc rouge devant la mouette au sol, qui montre la
  portée de son coup d'aile. En phase 1 le cercle suit Bob **en retard** : c'est
  toute la règle du combat, montrée au lieu d'être écrite.
- **Le tout premier piqué arrête le jeu** : elle reste figée en l'air, le cercle
  est sous les yeux du joueur, et Doudou dit la règle une seule fois. C'est le
  moment qui décide si Klara comprend ou pas.
- **Phase 1 — L'OMBRE.** Elle tombe là où Bob était il y a une seconde. Esquiver,
  ou lever le couvercle et ne plus bouger. Le couvercle **bloque toujours**
  (règle d'Evan : Klara ne peut pas se sentir mauvaise), mais il est LOURD :
  Bob ne le tient que deux secondes. ⚠️ Ses bras ne fatiguent jamais PENDANT une
  attaque — sinon le couvercle pouvait retomber à l'image exacte du contact, et
  on se faisait toucher en se protégeant. Levé tôt : CLONG, elle rebondit. Levé
  tard : **DONG**, elle s'écrase au sol, et c'est la seule ouverture de l'acte.
  Au cinquième piqué, elle ne vise plus Bob : elle vise **le dé qui brille sur sa
  tête**, et elle l'emporte.
- **Phase 2 — LE PHARE, et son prix** (décision d'Evan). Cakey fait descendre la
  veilleuse de Klara au bout de la rallonge, au milieu de la cour. Le prix se
  VOIT : la seule chose chaude de tout l'écran — le petit carré jaune tout en
  haut à gauche — **s'éteint**. À partir de là ils crient dans le noir.
  Le faisceau balaie l'herbe, et la mouette tombe dans la lumière : « reste hors
  de la lumière » est une règle qu'on n'a pas eu besoin d'écrire. Retournement :
  **lever le couvercle la ramène sur soi**, parce qu'il brille plus que la
  veilleuse. Le bouclier devient un appât, et c'est au joueur de choisir quand.
  Au bout de cinq piqués elle s'en prend à la lampe : le fil grince, il casse, la
  veilleuse tombe dans l'herbe **encore allumée**, et la cour se retrouve éclairée
  à plat, avec des ombres immenses.
- **Phase 3 — AU SOL.** Elle se pose. Ailes fermées, **elle est plus petite que
  Bob** (c'est mesuré : 37 px contre 43) — et une seconde plus tard elle ouvre,
  et elle fait deux fois sa largeur. Elle lui prend le couvercle au passage, sans
  même l'arracher. Bob sort la baguette. Elle crie avant chaque coup d'aile ;
  reculer jusqu'au mur ne sert à rien, il faut **passer derrière elle** — elle
  met un temps fou à se retourner. Trois coups de baguette, et le troisième est
  écrit d'avance : elle se décale, la baguette tape la grille de cave et **casse
  en deux**. Le bout cassé est pointu. Beaucoup plus pointu que la baguette ne
  l'a jamais été.
- **Phase 4 — ELLE L'EMPORTE.** Le paiement de la phrase de Doudou à l'ouverture
  (« Je n'ai jamais choisi le chemin, j'ai juste tenu bon pendant qu'on
  m'emmenait »). Bob ne monte pas à l'arbre : il se fait emmener. La cour
  rétrécit sous lui pendant qu'on lit.
- **Jamais de mort, et jamais de blocage.** Les phases 1 et 2 comptent des
  piqués, pas des réussites : elles avancent toutes seules. La phase 3 est la
  seule qui demande de réussir — alors Doudou réexplique au bout de quatre
  balayages, puis de neuf, et à partir de douze elle met nettement plus de temps
  à se rattraper. Le joueur finira toujours par passer, et il ne saura jamais
  qu'on l'a aidé.
- **Vérifié par simulation** (horloge factice, image par image, six
  comportements) : immobile = touché 5 fois sur 5 ; va-et-vient = 0 touche ;
  couvercle tenu = 5 CLONG, 0 touche ; couvercle levé pendant le piqué = 4 DONG,
  0 touche ; au sol en fuyant toujours = elle finit quand même par arriver ;
  au sol en frappant = la baguette casse en vingt secondes.
- **Le cadrage** : sur un écran d'ordinateur, l'arène est FIXE et on la voit en
  entier — on lit d'un coup d'œil la distance entre Bob et la petite fenêtre
  jaune. Sur le téléphone de Klara, tenu debout, « tout montrer » donnait une
  arène haute comme un timbre entre deux bandes noires (mesuré : 375 x 276) :
  elle grossit donc de moitié, la caméra suit Bob, et ce qui dépasse de la toile
  est rempli par un ciel et une ombre en dégradé — jamais de bande noire.

### Le nid *(`js/nid.js`)*
La scène la plus calme du jeu, juste après la plus bruyante. Elle se joue
**exactement comme l'acte I** : on marche à gauche et à droite, un point doré
flotte au-dessus de ce qu'on peut toucher, un verbe s'écrit à côté du bouton, on
appuie. Le jeu se referme sur le geste avec lequel il a commencé.

- **Du sommet de l'arbre, on voit Kiel** : les toits à pignons, un clocher avec
  son horloge, trois grues de chantier naval avec leur petite lumière rouge, et
  derrière, **l'eau**. Bob n'a jamais vu la ville de Klara. Il la voit, et elle
  est en train de se réveiller.
- **Vingt-trois choses brillent dans le nid, et aucune n'est à elle.** Une
  barrette, un trombone, un morceau de verre bleu poli par la mer, une boucle
  d'oreille **seule** — « ça veut dire qu'il y a quelqu'un, en bas, qui a
  l'autre. » Bob ne prend rien d'autre que ce qui est à lui : le dé, le couvercle.
- **Rosy est prise dans un fil de fer.** Un fil de fleuriste, celui qu'on serre
  autour d'un bouquet. Personne ne le dit à voix haute : Rosy tient une rose
  depuis le premier jour du jeu. Elle s'inquiète pour tout le monde avant de
  s'inquiéter pour elle, et sa première question est : « Est-ce que quelqu'un a
  pensé à fermer la fenêtre ? »
- **C'est la baguette CASSÉE qui coupe le fil.** Filet de sécurité : si une
  partie rechargée au mauvais moment privait Bob de tout, il prend l'éclat de
  verre du tas. Il n'y a pas de nid sans sortie.
- **LE PÉTALE** (décision d'Evan). La mouette revient se mettre entre eux et le
  bord. Bob n'a plus rien : il pose le pétale par terre, devant elle. « Il brille
  pas. Mais il est doux, et tu n'en as pas. » Elle recule d'un pas, et le passage
  est libre. Puis, au bord du nid, **Bob revient le prendre, sous son regard.**
  Elle ne bouge pas. « Il n'est pas à moi. Je le rapporte à quelqu'un chaque
  matin. Ça fait quatre ans. » C'est là qu'elle arrête d'être un monstre, et on
  ne l'explique nulle part.

### Le retour, et la corde *(retour dans `js/acte4.js`)*
Elle les prend tous les deux et les descend le long du mur. **Le pyjama de Samsam
pend là depuis le début de l'acte, quarante-quatre pixels au-dessus de la tête de
Bob, dans le décor, et personne ne l'a jamais montré du doigt.** Une fenêtre de
huit dixièmes de seconde pour l'attraper — et si on la rate, elle fait demi-tour
et repasse. Jamais de mort, même à la dernière image du dernier acte.

« JE TE TIENS. » C'est Samsam qui le dit. Celui qui ne se lève jamais est celui
qui rattrape. Et la corde monte : pas parce que Bob grimpe, parce que quelqu'un
de très gros tire.

### Épilogue *(`js/epilogue.js`)*
**CODÉ.** Il se joue dans l'appartement, en vue de dessus, avec la ligne
d'objectif en haut et le bouton « parler à » en bas : c'est la scène de l'acte I,
telle quelle, avec un autre casting et d'autres dialogues.

1. **La rentrée.** Six pattes tirent Bob et Rosy par la fenêtre. Doudou est assis
   contre le mur avec une aiguille et un bout de pyjama, et il ne lève pas les
   yeux : « Ferme la fenêtre, mon grand. » Samsam a une couture neuve, un peu de
   travers. Klara n'a rien entendu.
2. **LE GÂTEAU.** Cakey compte : Bluey, Fraisy, Doudou, Samsam, Rosy, Bob. Six.
   C'est la première fois depuis minuit qu'elle arrive au bout de sa liste. Et
   comme Samsam ne peut pas venir, **c'est le gâteau qui va à Samsam** : elle
   traverse la pièce et le pose par terre, à côté de sa tête. Personne ne fait
   remarquer qu'elle vient de déplacer la fête de trois mètres pour quelqu'un qui
   n'avait rien demandé.
3. **LA VEILLEUSE REVIENT.** Pas par eux — ils ne peuvent pas descendre. **Par
   elle.** Elle la pose sur l'appui de la fenêtre, debout, encore allumée, et
   elle s'en va. « Elle a dit merci ?! » — « Non, Bluey. Elle a rendu. » Bob la
   rebranche, et le studio redevient jaune.
4. **L'ÉLASTIQUE.** Rosy a fait une crêpe (Sylt). Bob sort ce qu'il gardait depuis
   trois semaines : un élastique rouge à liseré doré. « Je lui ai dit : un joli. »
   — « je lui en ai trouvé quatorze. » Pendant ce temps Doudou emmène Bluey
   raconter un train qui roule sur la mer.
5. **LE PÉTALE**, sur la table de nuit, dans le rond plus clair de la poussière.
   « Bonjour, Klara. Il s'est rien passé cette nuit. » Puis tout le monde retourne
   à sa place, sans rien dire, parce que c'est une chose qu'ils savent faire.

**Le mot de la fin** (`scene("fin")`) : le texte défile sur une vraie photo — et
tant qu'elle n'est pas là, sur la façade de l'immeuble au lever du jour, avec la
fenêtre de Klara allumée. La dernière carte reste : **« Joyeux 4 ans, Klara. »**

⚠️ **Le texte est tout en haut de `js/epilogue.js`, dans `MOT_DE_LA_FIN`.**
Une chaîne = une ligne, une chaîne vide = un blanc. Celui qui y est parle du jeu
et pas de vous deux, exprès : c'est à Evan de dire ça.
⚠️ **La photo va dans `10/assets/photos/nous.jpg`.** Rien d'autre à faire.

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
4. **Et retour au 1** — le nid, puis l'épilogue, se rejouent avec la grammaire
   de l'acte I : marcher, un verbe, un bouton. Le jeu se referme sur son
   premier geste, et il n'y a rien de neuf à apprendre à la dernière minute.

---

## ⚠️ À confirmer

- ~~Étage~~ → **2e étage**. La descente en rappel est validée.

- **Est-ce qu'au moins une des 3 fenêtres s'ouvre ?** (a priori oui)
- ~~La façade~~ → **photo reçue le 24/09**, peinte dans `js/facade.js`.
  Restent inventés, à confirmer : le cordon de briques saillantes entre les deux
  étages, le collier de gouttière qui fuit, la toile d'araignée, la jardinière,
  le fil à linge et la parabole.
- **La musique du dehors** : Evan la cherche. Dès que le fichier est posé dans
  `10/assets/sounds/dehors.mp3`, la façade le prend tout seul à la place de la
  musique de l'appartement (SONS.dehors, `optionnel: true` : tant qu'il manque,
  rien ne se plaint).
- ~~Taille de Cakey~~ → **1.45** (Evan : « presque aussi grande que Samsam, de
  loin la plus grande à part lui »). Samsam est à 1.6, Bob et Doudou à 1.0.
- ~~Décor du bas~~ → **une immense cour intérieure**, avec un parc et des arbres. Le nid de la Mouette est **dans un arbre**.
- Le plan réel de l'appartement (photo en attente) → corrige `js/pieces.js`.
- ~~Sprites des peluches~~ → **reçus le 17/09** (Rosy, Samsam, Fraisy, Bluey,
  Doudou, Cakey + les icônes d'objets), convertis par `outils/refaire_peluches.ps1`.
  **Samsam sans pyjama** et **la vraie veilleuse** (lampe.png) reçus le 21/09.
  **La mouette reçue le 24/09** : seize poses (posée, jacasse, picore, sonnée,
  marche, vol, piqué, cri ailes grandes ouvertes, coup d'aile, elle emporte
  quelque chose de mou), toutes à la MÊME échelle — ailes fermées elle est plus
  petite que Bob, ailes ouvertes elle fait presque deux fois sa hauteur en
  largeur, et tout le personnage tient dans cet écart. Ce n'est pas une
  peluche : des plumes, pas une couture, et elle ne sourit jamais.
  Sa planche arrivait en 2816 x 1536, donc en cases NON carrées, ce que
  `planche_hd.ps1` ne sait pas découper : `outils/carrer_planche.ps1` la remet
  au carré sans rien déformer, juste avant.
  Manque : **Moin** (il n'existe qu'en texte).
- La vraie couleur des rideaux de Klara (le rideau tombé est crème pour l'instant).
- ~~Cakey appâte la mouette avec son gâteau~~ → **NON, décidé par Evan.**
  Cakey ne partage JAMAIS son gâteau avec la mouette. (Et elle ne le partage pas
  non plus à l'épilogue : elle le DÉPLACE, pour que Samsam en ait.)

### Ce qui attend Evan, et rien d'autre

1. **LE TEXTE DE LA FIN.** `js/epilogue.js`, tout en haut, `MOT_DE_LA_FIN`.
   Une chaîne entre guillemets = une ligne à l'écran, une chaîne vide = un blanc.
   Ce qui est écrit là est provisoire et parle du jeu, pas de vous deux :
   c'est à toi de dire ça. La dernière carte (« Joyeux 4 ans, Klara. ») est
   juste en dessous, dans `DERNIER_MOT`, et elle reste à l'écran sans s'en aller.
2. **LA PHOTO.** `10/assets/photos/nous.jpg`. Rien d'autre à faire : le jeu la
   prend tout seul. Tant qu'elle n'y est pas, la fin se joue sur la façade de
   l'immeuble au lever du jour — c'est déjà juste, mais ce n'est pas vous.
   (Tant qu'elle manque, la console affiche un 404 sur ce fichier. C'est normal :
   c'est comme ça qu'on sait qu'elle n'est pas là, et ça ne casse rien.)
3. **LA MUSIQUE DU DEHORS.** `10/assets/sounds/dehors.mp3`. Pareil : dès qu'elle
   est là, la façade, la cour et le nid la prennent à la place de la musique de
   l'appartement.
4. **MOIN.** Il n'existe encore qu'en texte.
