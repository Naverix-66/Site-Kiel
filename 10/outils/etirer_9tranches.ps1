# ============================================================
#  ETIRER_9TRANCHES.PS1
# ============================================================
#  LE PROBLEME QU'IL RESOUT
#
#  Nos zones du plan et les meubles du pack ne font jamais la
#  meme taille. Le lit de Klara occupe 5x7 cases ; le lit du pack
#  fait 2,5 x 2,5 cases. Il flotte au milieu d'un trou.
#
#  Les deux mauvaises solutions habituelles :
#    - agrandir l'image  -> les pixels grossissent, ca ne colle
#      plus au reste du decor, ca devient flou ou baveux ;
#    - etirer l'image    -> les montants, les pieds et les
#      coutures se deforment, et ca se voit immediatement.
#
#  LA BONNE SOLUTION : LA DECOUPE EN 9 TRANCHES
#
#  On decoupe l'image en 9 morceaux avec quatre marges :
#
#        +------+--------------+------+
#        | coin |    bord haut | coin |   <- Haut
#        +------+--------------+------+
#        | bord |    CENTRE    | bord |
#        |gauche|              |droite|
#        +------+--------------+------+
#        | coin |    bord bas  | coin |   <- Bas
#        +------+--------------+------+
#          Gauche              Droite
#
#  Les 4 COINS ne bougent jamais : tete de lit, pieds, angles.
#  Les 4 BORDS se REPETENT le long d'un seul axe.
#  Le CENTRE se REPETE dans les deux sens.
#
#  On REPETE, on n'etire pas : chaque pixel garde exactement sa
#  taille d'origine. Le meuble grandit, le pixel art reste net.
#  C'est la technique standard des interfaces de jeu, et elle
#  marche tout aussi bien sur un matelas que sur un bouton.
#
#  BIEN CHOISIR SES MARGES
#  Le centre doit tomber sur un motif PERIODIQUE (la couette, le
#  bois d'un plan de travail, un carrelage). S'il tombe sur un
#  detail unique - un oreiller, une poignee - ce detail sera
#  duplique en boucle et ca se verra. Regarde toujours le resultat.
#
#  USAGE
#    powershell -File etirer_9tranches.ps1 `
#      -Entree ..\assets\decor\meubles\lit.png `
#      -Sortie ..\assets\decor\meubles\lit_grand.png `
#      -LargeurCible 160 -HauteurCible 224 `
#      -Gauche 40 -Droite 24 -Haut 26 -Bas 36
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Entree,
    [Parameter(Mandatory=$true)][string]$Sortie,
    [Parameter(Mandatory=$true)][int]$LargeurCible,
    [Parameter(Mandatory=$true)][int]$HauteurCible,
    [int]$Gauche = 8,
    [int]$Droite = 8,
    [int]$Haut = 8,
    [int]$Bas = 8,
    [string]$Apercu = ""
)

Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Entree)) { Write-Error "Fichier introuvable : $Entree"; exit 1 }

$src = New-Object System.Drawing.Bitmap($Entree)
$largeurSrc = $src.Width
$hauteurSrc = $src.Height

# ---- garde-fous ---------------------------------------------
# Sans eux, une marge trop grande donne une bande centrale de
# largeur zero, et la boucle de repetition tourne a l'infini.
if (($Gauche + $Droite) -ge $largeurSrc) {
    Write-Error "Gauche + Droite ($($Gauche + $Droite)) doit rester sous la largeur de l'image ($largeurSrc)."
    exit 1
}
if (($Haut + $Bas) -ge $hauteurSrc) {
    Write-Error "Haut + Bas ($($Haut + $Bas)) doit rester sous la hauteur de l'image ($hauteurSrc)."
    exit 1
}
if ($LargeurCible -lt ($Gauche + $Droite) -or $HauteurCible -lt ($Haut + $Bas)) {
    Write-Error "La cible ($LargeurCible x $HauteurCible) est plus petite que les coins ($($Gauche+$Droite) x $($Haut+$Bas)). Cet outil agrandit, il ne reduit pas."
    exit 1
}

$centreLargeurSrc = $largeurSrc - $Gauche - $Droite
$centreHauteurSrc = $hauteurSrc - $Haut - $Bas
$centreLargeurCible = $LargeurCible - $Gauche - $Droite
$centreHauteurCible = $HauteurCible - $Haut - $Bas

$out = New-Object System.Drawing.Bitmap($LargeurCible, $HauteurCible, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gr = [System.Drawing.Graphics]::FromImage($out)
$gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$gr.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver


# ---- copie un morceau de la source a une place exacte --------
function Copier($sx, $sy, $sl, $sh, $dx, $dy) {
    if ($sl -le 0 -or $sh -le 0) { return }
    $gr.DrawImage($src,
        (New-Object System.Drawing.Rectangle($dx, $dy, $sl, $sh)),
        (New-Object System.Drawing.Rectangle($sx, $sy, $sl, $sh)),
        [System.Drawing.GraphicsUnit]::Pixel)
}


# ---- pave une zone en repetant un morceau -------------------
# La derniere repetition est TRONQUEE au lieu de deborder : sans
# ce rognage, un motif de 16 px pave sur 20 px depasserait de
# 12 px et irait ecraser le coin d'a cote.
function Paver($sx, $sy, $sl, $sh, $dx, $dy, $dl, $dh) {
    if ($sl -le 0 -or $sh -le 0 -or $dl -le 0 -or $dh -le 0) { return }

    $y = 0
    while ($y -lt $dh) {
        $hauteurMorceau = [Math]::Min($sh, ($dh - $y))
        $x = 0
        while ($x -lt $dl) {
            $largeurMorceau = [Math]::Min($sl, ($dl - $x))
            $gr.DrawImage($src,
                (New-Object System.Drawing.Rectangle(($dx + $x), ($dy + $y), $largeurMorceau, $hauteurMorceau)),
                (New-Object System.Drawing.Rectangle($sx, $sy, $largeurMorceau, $hauteurMorceau)),
                [System.Drawing.GraphicsUnit]::Pixel)
            $x += $largeurMorceau
        }
        $y += $hauteurMorceau
    }
}


# ---- les 4 coins, intacts -----------------------------------
Copier 0 0 $Gauche $Haut 0 0
Copier ($largeurSrc - $Droite) 0 $Droite $Haut ($LargeurCible - $Droite) 0
Copier 0 ($hauteurSrc - $Bas) $Gauche $Bas 0 ($HauteurCible - $Bas)
Copier ($largeurSrc - $Droite) ($hauteurSrc - $Bas) $Droite $Bas ($LargeurCible - $Droite) ($HauteurCible - $Bas)

# ---- les 4 bords, repetes sur un axe ------------------------
Paver $Gauche 0 $centreLargeurSrc $Haut $Gauche 0 $centreLargeurCible $Haut
Paver $Gauche ($hauteurSrc - $Bas) $centreLargeurSrc $Bas $Gauche ($HauteurCible - $Bas) $centreLargeurCible $Bas
Paver 0 $Haut $Gauche $centreHauteurSrc 0 $Haut $Gauche $centreHauteurCible
Paver ($largeurSrc - $Droite) $Haut $Droite $centreHauteurSrc ($LargeurCible - $Droite) $Haut $Droite $centreHauteurCible

# ---- le centre, repete dans les deux sens -------------------
Paver $Gauche $Haut $centreLargeurSrc $centreHauteurSrc $Gauche $Haut $centreLargeurCible $centreHauteurCible

$gr.Dispose()
$out.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)


# ---- image de controle --------------------------------------
# On ne fait JAMAIS confiance a un decoupage sans le regarder :
# une marge mal placee duplique un oreiller en boucle, et ca ne
# se voit que sur l'image.
if ($Apercu -ne "") {
    $zoom = 4
    $ecart = 24
    $img = New-Object System.Drawing.Bitmap((($largeurSrc + $LargeurCible) * $zoom + $ecart), ([Math]::Max($hauteurSrc, $HauteurCible) * $zoom))
    $gc = [System.Drawing.Graphics]::FromImage($img)
    $gc.Clear([System.Drawing.Color]::FromArgb(255, 40, 36, 50))
    $gc.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $gc.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    $gc.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, ($largeurSrc * $zoom), ($hauteurSrc * $zoom))))

    # les lignes de coupe, sur l'original
    $stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 255, 60, 160), 2)
    $gc.DrawLine($stylo, ($Gauche * $zoom), 0, ($Gauche * $zoom), ($hauteurSrc * $zoom))
    $gc.DrawLine($stylo, (($largeurSrc - $Droite) * $zoom), 0, (($largeurSrc - $Droite) * $zoom), ($hauteurSrc * $zoom))
    $gc.DrawLine($stylo, 0, ($Haut * $zoom), ($largeurSrc * $zoom), ($Haut * $zoom))
    $gc.DrawLine($stylo, 0, (($hauteurSrc - $Bas) * $zoom), ($largeurSrc * $zoom), (($hauteurSrc - $Bas) * $zoom))

    $gc.DrawImage($out, (New-Object System.Drawing.Rectangle((($largeurSrc * $zoom) + $ecart), 0, ($LargeurCible * $zoom), ($HauteurCible * $zoom))))

    $gc.Dispose()
    $img.Save($Apercu, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    "apercu de controle : $Apercu"
}

$out.Dispose()
$src.Dispose()

"{0} ({1}x{2}) -> {3} ({4}x{5}) = {6}x{7} tuiles" -f `
    (Split-Path $Entree -Leaf), $largeurSrc, $hauteurSrc, `
    (Split-Path $Sortie -Leaf), $LargeurCible, $HauteurCible, `
    ($LargeurCible / 32), ($HauteurCible / 32)
