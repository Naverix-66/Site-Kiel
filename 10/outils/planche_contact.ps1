# ============================================================
#  PLANCHE_CONTACT.PS1
# ============================================================
#  Le pack complet livre chaque meuble en fichier PNG isolé —
#  5381 rien que pour les intérieurs. Impossible de choisir dans
#  un explorateur de fichiers.
#
#  Cet outil fabrique une PLANCHE-CONTACT : tous les meubles d'un
#  dossier, agrandis, alignés, avec le NOM de leur fichier écrit
#  dessous. On regarde, on note les noms qui nous plaisent, on
#  les copie dans le projet.
#
#  On peut filtrer par taille, ce qui est le vrai gain : pour
#  trouver un lit, on ne regarde que les objets d'au moins
#  3 tuiles de large et 4 de haut, et la liste passe de 556 à
#  une vingtaine.
#
#  USAGE
#    powershell -File planche_contact.ps1 `
#      -Dossier "...\4_Bedroom_Singles" -Sortie "...\lits.png" `
#      -LargeurMin 3 -HauteurMin 4
# ============================================================

param(
    [Parameter(Mandatory=$true)][string]$Dossier,
    [Parameter(Mandatory=$true)][string]$Sortie,
    [int]$Tuile = 16,
    [int]$Zoom = 3,
    [int]$LargeurMin = 0,      # en tuiles
    [int]$HauteurMin = 0,
    [int]$LargeurMax = 99,
    [int]$HauteurMax = 99,
    [int]$ParLigne = 10,
    [int]$Maximum = 60         # garde-fou : au-delà la planche devient illisible
)

Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $Dossier)) { Write-Error "Dossier introuvable : $Dossier"; exit 1 }

# ---- sélection ----------------------------------------------
$retenus = @()
foreach ($f in (Get-ChildItem $Dossier -File -Filter *.png | Sort-Object Name)) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $lt = [int]($img.Width / $Tuile)
    $ht = [int]($img.Height / $Tuile)
    $img.Dispose()
    if ($lt -ge $LargeurMin -and $ht -ge $HauteurMin -and $lt -le $LargeurMax -and $ht -le $HauteurMax) {
        $retenus += ,@{ chemin = $f.FullName; nom = $f.BaseName; lt = $lt; ht = $ht }
    }
    if ($retenus.Count -ge $Maximum) { break }
}

if ($retenus.Count -eq 0) { "Aucun objet ne correspond au filtre."; exit 0 }

# ---- mise en page -------------------------------------------
# Toutes les cases font la taille du plus grand objet retenu, pour
# que la grille reste régulière et qu'on compare à échelle égale.
$maxL = 0; $maxH = 0
foreach ($o in $retenus) {
    if ($o.lt -gt $maxL) { $maxL = $o.lt }
    if ($o.ht -gt $maxH) { $maxH = $o.ht }
}
$caseL = $maxL * $Tuile * $Zoom + 12
$caseH = $maxH * $Tuile * $Zoom + 30      # 30 px pour écrire le nom dessous

$colonnes = [Math]::Min($ParLigne, $retenus.Count)
$lignes = [Math]::Ceiling($retenus.Count / $colonnes)

$out = New-Object System.Drawing.Bitmap(($colonnes * $caseL), ($lignes * $caseH))
$gr = [System.Drawing.Graphics]::FromImage($out)
$gr.Clear([System.Drawing.Color]::FromArgb(255, 42, 34, 44))
$gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

$police = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Bold)
$pinceau = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 215, 100))
$stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 120, 200), 1)

$i = 0
foreach ($o in $retenus) {
    $cx = ($i % $colonnes) * $caseL
    $cy = [Math]::Floor($i / $colonnes) * $caseH

    $img = [System.Drawing.Image]::FromFile($o.chemin)
    $dl = $o.lt * $Tuile * $Zoom
    $dh = $o.ht * $Tuile * $Zoom
    # centré horizontalement, calé en bas de la case
    $dx = $cx + [int](($caseL - $dl) / 2)
    $dy = $cy + ($caseH - 30 - $dh)
    $gr.DrawImage($img, (New-Object System.Drawing.Rectangle($dx, $dy, $dl, $dh)))
    $img.Dispose()

    $gr.DrawRectangle($stylo, $cx, $cy, $caseL, ($caseH - 26))

    # le numéro du fichier suffit : le préfixe est commun à tout le dossier
    $court = ($o.nom -split "_")[-1]
    $gr.DrawString(("{0}  {1}x{2}" -f $court, $o.lt, $o.ht), $police, $pinceau, ($cx + 6), ($cy + $caseH - 24))
    $i++
}

$gr.Dispose()
$dossierSortie = Split-Path $Sortie -Parent
if ($dossierSortie -and -not (Test-Path $dossierSortie)) { New-Item -ItemType Directory -Force -Path $dossierSortie | Out-Null }
$out.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()

"{0} objets retenus (filtre {1}x{2} mini)" -f $retenus.Count, $LargeurMin, $HauteurMin
"=> $Sortie"
