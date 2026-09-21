# ============================================================
#  INVENTAIRE_MEUBLES.PS1
# ============================================================
#  Parcourt une planche de tuiles et DÉTECTE tout seul les
#  meubles qui s'y trouvent, avec leur position et leur taille
#  exactes en tuiles.
#
#  Pourquoi cet outil : un meuble occupe plusieurs tuiles (un lit
#  fait 3x4), et relever ses coordonnées à l'œil sur une image
#  zoomée est le meilleur moyen de le couper en deux dans le jeu.
#  Ici on mesure les pixels, on ne devine rien.
#
#  ALGORITHME — découpe alternée
#  On part d'un grand rectangle et on essaie de le couper en
#  bandes horizontales (des lignes entièrement vides le séparent).
#  Si ça coupe, on relance sur chaque morceau. Sinon on essaie de
#  le couper en bandes verticales. Si ça coupe, on relance. Quand
#  un rectangle ne se coupe plus dans aucun sens, c'est un meuble.
#
#  Une seule passe ne suffit pas : les meubles sont à la fois
#  empilés ET côte à côte, donc il faut alterner les deux sens
#  jusqu'à ce que plus rien ne bouge.
#
#  La sortie est directement collable dans js/meubles.js.
#
#  USAGE
#    powershell -File inventaire_meubles.ps1 -Entree ..\assets\decor\interiors.png `
#               -LigneDebut 0 -LigneFin 12
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Entree,
    [int]$Tuile = 16,
    [int]$Colonnes = 16,       # colonnes de la planche
    [int]$LigneDebut = 0,
    [int]$LigneFin = 9999,
    [int]$SeuilAlpha = 24,
    [int]$EcartMin = 1,        # lignes/colonnes vides pour séparer deux meubles
    [int]$TailleMin = 1,       # on ignore les objets plus petits (en tuiles)
    [string]$Apercu = ""       # si renseigné : PNG de contrôle avec les boîtes dessinées
)

Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Entree)) { Write-Error "Fichier introuvable : $Entree"; exit 1 }

$bmp = New-Object System.Drawing.Bitmap($Entree)
$largeurPx = $bmp.Width
$hauteurPx = $bmp.Height
$zoneLock = New-Object System.Drawing.Rectangle(0, 0, $largeurPx, $hauteurPx)
$donnees = $bmp.LockBits($zoneLock, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$pas = $donnees.Stride
$octets = New-Object byte[] ($pas * $hauteurPx)
[System.Runtime.InteropServices.Marshal]::Copy($donnees.Scan0, $octets, 0, $octets.Length)
$bmp.UnlockBits($donnees)
$bmp.Dispose()

$yDebut = $LigneDebut * $Tuile
$yFin = [Math]::Min(($LigneFin + 1) * $Tuile, $hauteurPx) - 1


# ---- découpe une suite de booléens en bandes contiguës -------
# ⚠️ PowerShell "déballe" un tableau d'un seul élément quand une
# fonction le renvoie. D'où le `return ,$res` : la virgule force
# le tableau à sortir comme UN objet. Sans elle, une liste d'une
# seule bande sortirait comme une bande nue, et la boucle
# appelante itérerait sur ses champs au lieu de ses éléments.
function Bandes($presence, $i0, $i1, $ecart) {
    $res = @(); $debut = -1; $vide = 0
    for ($i = $i0; $i -le $i1; $i++) {
        if ($presence[$i]) { if ($debut -lt 0) { $debut = $i }; $vide = 0 }
        else {
            if ($debut -ge 0) {
                $vide++
                if ($vide -ge $ecart) { $res += ,@{ d = $debut; f = ($i - $vide) }; $debut = -1; $vide = 0 }
            }
        }
    }
    if ($debut -ge 0) { $res += ,@{ d = $debut; f = $i1 } }
    return ,$res
}

function LignesOccupees($x0, $x1, $y0, $y1) {
    $t = New-Object bool[] $hauteurPx
    for ($y = $y0; $y -le $y1; $y++) {
        for ($x = $x0; $x -le $x1; $x++) {
            if ($octets[$y * $pas + $x * 4 + 3] -ge $SeuilAlpha) { $t[$y] = $true; break }
        }
    }
    return ,$t
}

function ColonnesOccupees($x0, $x1, $y0, $y1) {
    $t = New-Object bool[] $largeurPx
    for ($x = $x0; $x -le $x1; $x++) {
        for ($y = $y0; $y -le $y1; $y++) {
            if ($octets[$y * $pas + $x * 4 + 3] -ge $SeuilAlpha) { $t[$x] = $true; break }
        }
    }
    return ,$t
}


# ---- découpe alternée jusqu'à stabilisation -----------------
$aTraiter = New-Object System.Collections.ArrayList
[void]$aTraiter.Add(@{ x0 = 0; x1 = ($largeurPx - 1); y0 = $yDebut; y1 = $yFin })
$atomiques = @()
$garde = 0

while ($aTraiter.Count -gt 0 -and $garde -lt 50000) {
    $garde++
    $r = $aTraiter[0]; $aTraiter.RemoveAt(0)

    # 1. peut-on le couper en bandes horizontales ?
    $bl = Bandes (LignesOccupees $r.x0 $r.x1 $r.y0 $r.y1) $r.y0 $r.y1 $EcartMin
    if ($bl.Count -eq 0) { continue }                  # rectangle entièrement vide
    if ($bl.Count -gt 1) {
        foreach ($b in $bl) { [void]$aTraiter.Add(@{ x0 = $r.x0; x1 = $r.x1; y0 = $b.d; y1 = $b.f }) }
        continue
    }
    $y0 = $bl[0].d; $y1 = $bl[0].f                     # resserré verticalement

    # 2. peut-on le couper en bandes verticales ?
    $bc = Bandes (ColonnesOccupees $r.x0 $r.x1 $y0 $y1) $r.x0 $r.x1 $EcartMin
    if ($bc.Count -eq 0) { continue }
    if ($bc.Count -gt 1) {
        foreach ($b in $bc) { [void]$aTraiter.Add(@{ x0 = $b.d; x1 = $b.f; y0 = $y0; y1 = $y1 }) }
        continue
    }
    $x0 = $bc[0].d; $x1 = $bc[0].f

    # 3. Le rectangle a été resserré : il faut retenter une découpe
    # horizontale sur la zone réduite, sinon on s'arrêterait sur un
    # bloc encore composite (deux meubles empilés dans une colonne).
    if ($y0 -ne $r.y0 -or $y1 -ne $r.y1 -or $x0 -ne $r.x0 -or $x1 -ne $r.x1) {
        $bl2 = Bandes (LignesOccupees $x0 $x1 $y0 $y1) $y0 $y1 $EcartMin
        if ($bl2.Count -gt 1) {
            foreach ($b in $bl2) { [void]$aTraiter.Add(@{ x0 = $x0; x1 = $x1; y0 = $b.d; y1 = $b.f }) }
            continue
        }
    }

    # plus rien ne se coupe : c'est un meuble
    $atomiques += ,@{ x0 = $x0; y0 = $y0; x1 = $x1; y1 = $y1 }
}


# ---- arrondi à la grille de tuiles et sortie ----------------
$resultats = @()
foreach ($a in $atomiques) {
    $col = [int][Math]::Floor($a.x0 / $Tuile)
    $lig = [int][Math]::Floor($a.y0 / $Tuile)
    $larg = [int][Math]::Ceiling(($a.x1 + 1) / $Tuile) - $col
    $haut = [int][Math]::Ceiling(($a.y1 + 1) / $Tuile) - $lig
    if ($larg -ge $TailleMin -and $haut -ge $TailleMin) {
        $resultats += ,@{ col = $col; lig = $lig; larg = $larg; haut = $haut }
    }
}

"// {0} objets detectes (lignes {1} a {2})" -f $resultats.Count, $LigneDebut, $LigneFin
"// frame = ligne x $Colonnes + colonne"
""
foreach ($t in ($resultats | Sort-Object { $_.lig * 1000 + $_.col })) {
    $frame = $t.lig * $Colonnes + $t.col
    "    {{ frame: {0,5}, largeur: {1}, hauteur: {2} }},   // col {3}, ligne {4}" -f $frame, $t.larg, $t.haut, $t.col, $t.lig
}


# ---- image de contrôle -------------------------------------
# On ne fait jamais confiance à une détection sans la regarder.
if ($Apercu -ne "") {
    $srcImg = [System.Drawing.Image]::FromFile($Entree)
    $zoom = 3
    $hZone = ($yFin - $yDebut + 1)
    $img = New-Object System.Drawing.Bitmap(($largeurPx * $zoom), ($hZone * $zoom))
    $gr = [System.Drawing.Graphics]::FromImage($img)
    $gr.Clear([System.Drawing.Color]::FromArgb(255, 24, 22, 30))
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $gr.DrawImage($srcImg,
        (New-Object System.Drawing.Rectangle(0, 0, ($largeurPx * $zoom), ($hZone * $zoom))),
        (New-Object System.Drawing.Rectangle(0, $yDebut, $largeurPx, $hZone)),
        [System.Drawing.GraphicsUnit]::Pixel)

    $stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 60, 160), 2)
    $police = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Bold)
    $pinceau = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 230, 90))

    foreach ($t in $resultats) {
        $bx = $t.col * $Tuile * $zoom
        $by = ($t.lig * $Tuile - $yDebut) * $zoom
        $bw = $t.larg * $Tuile * $zoom
        $bh = $t.haut * $Tuile * $zoom
        $gr.DrawRectangle($stylo, $bx, $by, $bw, $bh)
        $gr.DrawString(("{0}" -f ($t.lig * $Colonnes + $t.col)), $police, $pinceau, ($bx + 3), ($by + 2))
    }
    $gr.Dispose()
    $img.Save($Apercu, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose(); $srcImg.Dispose()
    ""
    "// apercu de controle : $Apercu"
}
