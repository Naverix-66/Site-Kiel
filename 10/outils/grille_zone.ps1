# ============================================================
#  GRILLE_ZONE.PS1
# ============================================================
#  room_builder.png fait 76 x 113 tuiles. Impossible de lire un
#  numero de frame dessus a l'oeil.
#
#  Cet outil en decoupe une ZONE, l'agrandit, et ecrit le NUMERO
#  DE FRAME dans chaque case. On regarde, on releve le numero,
#  on le colle dans pieces.js.
#
#  USAGE
#    powershell -File grille_zone.ps1 -Entree ..\assets\decor\room_builder.png `
#      -Sortie ..\assets\decor\_zone_murs.png `
#      -Col0 0 -Lig0 0 -Col1 20 -Lig1 12
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Entree,
    [Parameter(Mandatory=$true)][string]$Sortie,
    [int]$Tuile = 32,
    [int]$Colonnes = 76,       # largeur de la planche, en tuiles
    [int]$Col0 = 0,
    [int]$Lig0 = 0,
    [int]$Col1 = 15,
    [int]$Lig1 = 10,
    [int]$Zoom = 2
)

Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Entree)) { Write-Error "Fichier introuvable : $Entree"; exit 1 }

$src = [System.Drawing.Image]::FromFile($Entree)

$nbCol = $Col1 - $Col0 + 1
$nbLig = $Lig1 - $Lig0 + 1
$caseL = $Tuile * $Zoom
$out = New-Object System.Drawing.Bitmap(($nbCol * $caseL), ($nbLig * $caseL))

$gr = [System.Drawing.Graphics]::FromImage($out)
$gr.Clear([System.Drawing.Color]::FromArgb(255, 24, 22, 30))
$gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

$gr.DrawImage($src,
    (New-Object System.Drawing.Rectangle(0, 0, ($nbCol * $caseL), ($nbLig * $caseL))),
    (New-Object System.Drawing.Rectangle(($Col0 * $Tuile), ($Lig0 * $Tuile), ($nbCol * $Tuile), ($nbLig * $Tuile))),
    [System.Drawing.GraphicsUnit]::Pixel)

$stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, 255, 60, 160), 1)
$police = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Bold)
$ombre = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 0, 0, 0))
$encre = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 235, 90))

for ($l = 0; $l -lt $nbLig; $l++) {
    for ($c = 0; $c -lt $nbCol; $c++) {
        $x = $c * $caseL
        $y = $l * $caseL
        $gr.DrawRectangle($stylo, $x, $y, $caseL, $caseL)

        $frame = ($Lig0 + $l) * $Colonnes + ($Col0 + $c)
        # ombre portee : le numero doit rester lisible sur une tuile claire
        $gr.DrawString("$frame", $police, $ombre, ($x + 3), ($y + 2))
        $gr.DrawString("$frame", $police, $encre, ($x + 2), ($y + 1))
    }
}

$gr.Dispose()
$out.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $src.Dispose()

"zone col $Col0..$Col1 / lig $Lig0..$Lig1  ->  $Sortie"
