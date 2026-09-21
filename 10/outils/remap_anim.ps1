# ============================================================
#  REMAP_ANIM.PS1
# ============================================================
#  Réordonne les frames d'une planche déjà recadrée, pour que
#  chaque animation occupe une PLAGE CONTIGUË de frames.
#
#  Pourquoi : l'option `anims` de kaplay ne décrit une animation
#  que par un intervalle { from, to }. Elle ne sait pas prendre
#  une liste arbitraire de frames. Si le cycle de marche est
#  éparpillé dans la planche (7, 11, 15, 19), il faut soit
#  piloter les frames à la main à chaque image, soit — bien plus
#  propre — ranger la planche dans l'ordre des animations.
#
#  On choisit la seconde : la planche devient auto-descriptive
#  et le code se réduit à une déclaration.
#
#  USAGE
#    powershell -File remap_anim.ps1 -Entree bob.png -Sortie bob_anim.png `
#               -Colonnes 4 -Cellule 36 -Ordre "0,1,3,0, 4,0,5,0, 13,14,16,17, 7,11,15,19"
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Entree,
    [Parameter(Mandatory=$true)][string]$Sortie,
    [Parameter(Mandatory=$true)][string]$Ordre,   # frames source, séparées par des virgules
    [int]$Cellule = 36,
    [int]$Colonnes = 4                            # colonnes de la planche SOURCE
)

Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Entree)) { Write-Error "Fichier introuvable : $Entree"; exit 1 }

$liste = @()
foreach ($t in ($Ordre -split ",")) {
    $t = $t.Trim()
    if ($t -ne "") { $liste += [int]$t }
}

$src = New-Object System.Drawing.Bitmap($Entree)
$colSrc = [int]($src.Width / $Cellule)

# la planche de sortie garde 4 colonnes : une animation par ligne
$colOut = 4
$ligOut = [int][Math]::Ceiling($liste.Count / $colOut)

$out = New-Object System.Drawing.Bitmap(($colOut * $Cellule), ($ligOut * $Cellule), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($out)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$g.Clear([System.Drawing.Color]::Transparent)

$i = 0
foreach ($f in $liste) {
    $sc = $f % $colSrc
    $sr = [int][Math]::Floor($f / $colSrc)
    $dc = $i % $colOut
    $dr = [int][Math]::Floor($i / $colOut)
    $g.DrawImage($src,
        (New-Object System.Drawing.Rectangle(($dc * $Cellule), ($dr * $Cellule), $Cellule, $Cellule)),
        (New-Object System.Drawing.Rectangle(($sc * $Cellule), ($sr * $Cellule), $Cellule, $Cellule)),
        [System.Drawing.GraphicsUnit]::Pixel)
    "  frame source $f -> frame sortie $i"
    $i++
}

$g.Dispose()
$out.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $src.Dispose()

""
"=> $Sortie  ($colOut colonnes x $ligOut lignes, cellules de $Cellule px)"
"   pour kaplay : loadSprite(nom, chemin, { sliceX: $colOut, sliceY: $ligOut, anims: {...} })"
