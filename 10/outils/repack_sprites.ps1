# ============================================================
#  REPACK_SPRITES.PS1
# ============================================================
#  Prend une planche de sprites générée avec un espacement
#  irrégulier, et la recompose sur une GRILLE STRICTE que
#  kaplay peut découper avec sliceX / sliceY.
#
#  Méthode : on ne devine rien. On repère les bandes de lignes
#  et de colonnes qui contiennent des pixels opaques, chaque
#  intersection est un sprite, et on le recolle centré
#  horizontalement et calé sur la ligne de base de sa cellule.
#
#  USAGE
#    powershell -File repack_sprites.ps1 -Entree "..\assets\sprite_sheet_bob.png" `
#                                        -Sortie "..\assets\peluches\bob.png"
#
#  Le calage en bas de cellule est essentiel : c'est lui qui
#  empêche le personnage de sautiller verticalement d'une frame
#  à l'autre pendant l'animation.
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Entree,
    [Parameter(Mandatory=$true)][string]$Sortie,
    [int]$Cellule = 48,        # taille d'une cellule de la grille de sortie
    [int]$SeuilAlpha = 24,     # en dessous, le pixel compte comme vide
    [int]$EcartMin = 3,        # trou minimum (en px) pour séparer deux sprites
    [double]$Echelle = 1.0     # facteur de reduction applique a TOUS les sprites
                               # (le meme pour tous : sinon le perso change de
                               #  taille d une frame a l autre)
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $Entree)) { Write-Error "Fichier introuvable : $Entree"; exit 1 }

# ---- lecture rapide de tous les pixels -----------------------
$bmp = New-Object System.Drawing.Bitmap($Entree)
$L = $bmp.Width; $H = $bmp.Height
$rect = New-Object System.Drawing.Rectangle(0, 0, $L, $H)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$octets = New-Object byte[] ($stride * $H)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $octets, 0, $octets.Length)
$bmp.UnlockBits($data)

function EstOpaque($x, $y) { return $octets[$y * $stride + $x * 4 + 3] -ge $SeuilAlpha }

# ---- découpe une suite de booléens en bandes contiguës -------
function Bandes($presence, $n) {
    $res = @(); $debut = -1; $vide = 0
    for ($i = 0; $i -lt $n; $i++) {
        if ($presence[$i]) {
            if ($debut -lt 0) { $debut = $i }
            $vide = 0
        } else {
            if ($debut -ge 0) {
                $vide++
                if ($vide -ge $EcartMin) { $res += ,@($debut, ($i - $vide)); $debut = -1; $vide = 0 }
            }
        }
    }
    if ($debut -ge 0) { $res += ,@($debut, ($n - 1)) }
    return $res
}

# ---- bandes de LIGNES ---------------------------------------
$ligneOccupee = New-Object bool[] $H
for ($y = 0; $y -lt $H; $y++) {
    for ($x = 0; $x -lt $L; $x++) { if (EstOpaque $x $y) { $ligneOccupee[$y] = $true; break } }
}
$bandesLignes = Bandes $ligneOccupee $H

# ---- pour chaque bande de lignes, bandes de COLONNES --------
$sprites = @()
foreach ($bl in $bandesLignes) {
    $y0 = $bl[0]; $y1 = $bl[1]
    $colOccupee = New-Object bool[] $L
    for ($x = 0; $x -lt $L; $x++) {
        for ($y = $y0; $y -le $y1; $y++) { if (EstOpaque $x $y) { $colOccupee[$x] = $true; break } }
    }
    $bandesCols = Bandes $colOccupee $L
    $ligneSprites = @()
    foreach ($bc in $bandesCols) {
        $x0 = $bc[0]; $x1 = $bc[1]
        # on resserre la boîte sur le contenu réel
        $ry0 = $y1; $ry1 = $y0
        for ($y = $y0; $y -le $y1; $y++) {
            for ($x = $x0; $x -le $x1; $x++) {
                if (EstOpaque $x $y) {
                    if ($y -lt $ry0) { $ry0 = $y }
                    if ($y -gt $ry1) { $ry1 = $y }
                    break
                }
            }
        }
        $ligneSprites += ,@{ x = $x0; y = $ry0; l = ($x1 - $x0 + 1); h = ($ry1 - $ry0 + 1) }
    }
    $sprites += ,$ligneSprites
}

# ---- rapport de détection -----------------------------------
"Planche lue      : $Entree  ($L x $H)"
"Lignes detectees : $($sprites.Count)"
$maxCols = 0
$iL = 0
foreach ($ls in $sprites) {
    if ($ls.Count -gt $maxCols) { $maxCols = $ls.Count }
    $tailles = ($ls | ForEach-Object { "$($_.l)x$($_.h)" }) -join "  "
    "  ligne $iL : $($ls.Count) sprites -> $tailles"
    $iL++
}

$plusHaut = 0; $plusLarge = 0
foreach ($ls in $sprites) { foreach ($s in $ls) {
    if ($s.h -gt $plusHaut) { $plusHaut = $s.h }
    if ($s.l -gt $plusLarge) { $plusLarge = $s.l }
} }
"Sprite le plus grand : $plusLarge x $plusHaut px"

if (($plusHaut * $Echelle) -gt $Cellule -or ($plusLarge * $Echelle) -gt $Cellule) {
    "ATTENTION : un sprite depasse la cellule de $Cellule px. Relance avec -Cellule $([Math]::Max($plusLarge,$plusHaut))"
}

# ---- recomposition sur grille stricte -----------------------
$sortieL = $maxCols * $Cellule
$sortieH = $sprites.Count * $Cellule
$out = New-Object System.Drawing.Bitmap($sortieL, $sortieH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($out)
if ($Echelle -lt 1.0) { $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic }
else { $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor }
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$g.Clear([System.Drawing.Color]::Transparent)

$src = New-Object System.Drawing.Bitmap($Entree)
for ($r = 0; $r -lt $sprites.Count; $r++) {
    for ($c = 0; $c -lt $sprites[$r].Count; $c++) {
        $s = $sprites[$r][$c]
        # centre horizontalement, cale en BAS de la cellule (ligne de base commune)
        $nl = [int][Math]::Round($s.l * $Echelle)
        $nh = [int][Math]::Round($s.h * $Echelle)
        $dx = $c * $Cellule + [int](($Cellule - $nl) / 2)
        $dy = $r * $Cellule + ($Cellule - $nh)
        $g.DrawImage($src,
            (New-Object System.Drawing.Rectangle($dx, $dy, $nl, $nh)),
            (New-Object System.Drawing.Rectangle($s.x, $s.y, $s.l, $s.h)),
            [System.Drawing.GraphicsUnit]::Pixel)
    }
}
$dossier = Split-Path $Sortie -Parent
if ($dossier -and -not (Test-Path $dossier)) { New-Item -ItemType Directory -Force -Path $dossier | Out-Null }
$out.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $out.Dispose(); $src.Dispose(); $bmp.Dispose()

""
"=> $Sortie"
"   grille stricte : $maxCols colonnes x $($sprites.Count) lignes, cellules de $Cellule px"
"   pour kaplay    : loadSprite(nom, chemin, { sliceX: $maxCols, sliceY: $($sprites.Count) })"
