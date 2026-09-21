# ============================================================
#  TOURNER.PS1
# ============================================================
#  Fait pivoter un PNG de 90, 180 ou 270 degres, sans aucune
#  perte : une rotation d'un quart de tour ne fait que deplacer
#  des pixels, elle n'en invente aucun. Le pixel art y survit
#  parfaitement, contrairement a un agrandissement.
#
#  POURQUOI ON EN A BESOIN
#  Le pack dessine ses meubles pour un mur situe EN HAUT : le
#  plan de travail de la cuisine, les commodes, les eviers sont
#  tous vus de face, tournes vers le bas.
#
#  L'appartement de Klara a sa cuisine contre le mur de DROITE.
#  Un plan de travail tourne vers le bas, plaque contre un mur
#  lateral, est immediatement faux : on voit sa facade a la place
#  de son flanc.
#
#  Un quart de tour regle ca. Attention au sens :
#     90   un meuble tourne vers le BAS regarde ensuite a GAUCHE
#          -> c'est ce qu'il faut pour un mur a DROITE
#     270  il regarde a DROITE
#          -> pour un mur a GAUCHE
#
#  USAGE
#    powershell -File tourner.ps1 -Entree ..\assets\decor\meubles\cuisine_long.png `
#      -Sortie ..\assets\decor\meubles\cuisine_long_gauche.png -Degres 90
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Entree,
    [Parameter(Mandatory=$true)][string]$Sortie,
    [ValidateSet(90,180,270)][int]$Degres = 90
)

Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Entree)) { Write-Error "Fichier introuvable : $Entree"; exit 1 }

$img = New-Object System.Drawing.Bitmap($Entree)
$avant = "{0}x{1}" -f $img.Width, $img.Height

switch ($Degres) {
    90  { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
    180 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
    270 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
}

$dossier = Split-Path $Sortie -Parent
if ($dossier -and -not (Test-Path $dossier)) { New-Item -ItemType Directory -Force -Path $dossier | Out-Null }

$img.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)
$apres = "{0}x{1}" -f $img.Width, $img.Height
$img.Dispose()

"{0}  {1} -> {2}  ({3} deg)" -f (Split-Path $Sortie -Leaf), $avant, $apres, $Degres
