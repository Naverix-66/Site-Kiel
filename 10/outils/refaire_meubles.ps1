# ============================================================
#  REFAIRE_MEUBLES.PS1
# ============================================================
#  Regenere les meubles sur mesure a partir des sources du pack.
#
#  POURQUOI CE FICHIER EXISTE
#  Le plan de l'appartement bouge : Evan le redessine, les zones
#  changent de taille. Les meubles fabriques a la main pour une
#  zone donnee deviennent alors faux.
#
#  Plutot que de refaire la decoupe a la main a chaque fois - et de
#  reperdre les bonnes marges - on garde la RECETTE ici. Une seule
#  commande, et tous les meubles sur mesure reviennent a la bonne
#  taille.
#
#  USAGE
#    powershell -File refaire_meubles.ps1
#
#  POUR CHANGER UNE TAILLE : modifie LargeurTuiles / HauteurTuiles
#  dans la recette concernee, en recopiant la taille de la zone
#  affichee par les avertissements de la console du jeu.
#  (Le jeu ecrit par exemple : "'G' (lit) : la zone du plan fait
#   5x7 tuiles, le meuble fait 3x3.")
#
#  POUR AJOUTER UN MEUBLE : ajoute une recette. Les quatre marges
#  se lisent sur l'image source ; l'important est que la bande du
#  MILIEU ne contienne qu'un motif repetable (du tissu, du bois,
#  du carrelage) et aucun detail unique (un oreiller, une poignee).
#  Voir l'en-tete de etirer_9tranches.ps1.
# ============================================================

$ErrorActionPreference = "Stop"

$ici = Split-Path $MyInvocation.MyCommand.Path -Parent
$outil = Join-Path $ici "etirer_9tranches.ps1"
$meubles = Join-Path (Split-Path $ici -Parent) "assets\decor\meubles"

$TUILE = 32

$rotation = Join-Path $ici "tourner.ps1"


# ============================================================
#  1. LES ROTATIONS
# ============================================================
#  Le pack dessine tout pour un mur situe EN HAUT. L'appartement
#  de Klara a sa cuisine contre le mur de DROITE et son lit
#  contre le mur de GAUCHE. Un quart de tour regle les deux, et
#  ne deforme aucun pixel.
# ============================================================
$rotations = @(
    # Le lit : la tete doit etre contre le mur de GAUCHE.
    # 270 deg = le haut de l'image part a gauche.
    @{ source = "lit_source.png";         sortie = "lit_source_h.png";     degres = 270 },

    # La cuisine : 90 deg = ce qui regardait en bas regarde a
    # GAUCHE, donc vers la piece, pour un meuble colle a droite.
    # Le bord GAUCHE devient le bord HAUT, d'ou les noms.
    @{ source = "cuisine_coin_gauche.png"; sortie = "cuisine_v_haut.png";   degres = 90 },
    @{ source = "cuisine_long.png";        sortie = "cuisine_v_centre.png"; degres = 90 },
    @{ source = "cuisine_coin_droit.png";  sortie = "cuisine_v_bas.png";    degres = 90 },
    @{ source = "evier_cuisine.png";       sortie = "evier_vertical.png";   degres = 90 }
)

foreach ($r in $rotations) {
    $entree = Join-Path $meubles $r.source
    if (-not (Test-Path $entree)) {
        Write-Warning ("source introuvable, rotation ignoree : {0}" -f $entree)
        continue
    }
    & powershell -ExecutionPolicy Bypass -File $rotation `
        -Entree $entree -Sortie (Join-Path $meubles $r.sortie) -Degres $r.degres
}


# ============================================================
#  2. LES AGRANDISSEMENTS EN 9 TRANCHES
# ============================================================
$recettes = @(
    @{
        nom          = "lit_klara"
        source       = "lit_source_h.png"  # le lit du pack, deja pivote
        LargeurTuiles = 5                  # <- la zone 'G' du plan
        HauteurTuiles = 7
        # Marges relevees au pixel sur la source pivotee (96x64) :
        #   x 0..33  tete de lit + oreillers -> fixe
        #   x 34..62 couette unie            -> REPETE
        #   x 63..96 barre de pied           -> fixe
        # En hauteur, les deux bords du lit sont fins et le milieu
        # est de la couette pure : 8 px de chaque cote suffisent.
        Gauche = 34; Droite = 33; Haut = 8; Bas = 8
    }
)

foreach ($r in $recettes) {

    $entree = Join-Path $meubles $r.source
    $sortie = Join-Path $meubles ($r.nom + ".png")

    if (-not (Test-Path $entree)) {
        Write-Warning ("source introuvable, recette ignoree : {0}" -f $entree)
        continue
    }

    & powershell -ExecutionPolicy Bypass -File $outil `
        -Entree $entree -Sortie $sortie `
        -LargeurCible ($r.LargeurTuiles * $TUILE) `
        -HauteurCible ($r.HauteurTuiles * $TUILE) `
        -Gauche $r.Gauche -Droite $r.Droite -Haut $r.Haut -Bas $r.Bas
}

""
"Pense a verifier que le catalogue js/meubles.js annonce bien les memes"
"tailles en tuiles que celles regenerees ci-dessus."
