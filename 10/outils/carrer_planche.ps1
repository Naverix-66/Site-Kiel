# ============================================================
#  CARRER_PLANCHE.PS1
# ============================================================
#  planche_hd.ps1 découpe une planche en cases CARRÉES : il déduit
#  la case de la seule largeur (cote = largeur / grille), puis lit
#  autant de lignes que de colonnes. Une planche qui n'est pas
#  carrée le fait donc sortir du tableau.
#
#  Les planches de peluches d'Evan arrivent en 2048 x 2048, et tout
#  va bien. Celle de la mouette est arrivée en 2816 x 1536 : quatre
#  colonnes et quatre lignes, mais des cases de 704 x 384.
#
#  Cet outil remet ce genre de planche au carré SANS RIEN
#  DÉFORMER : chaque case est recopiée telle quelle, centrée dans
#  une case carrée de la largeur d'origine. Le dessin ne bouge pas
#  d'un pixel, il gagne juste du vide au-dessus et en dessous.
#
#  USAGE
#    powershell -ExecutionPolicy Bypass -File outils\carrer_planche.ps1 `
#        -Entree assets\peluches\mouette_planche_2d.jpg `
#        -Sortie assets\peluches\mouette_planche_2d_carre.png
#
#    -Grille   colonnes (= lignes) de la planche (4 par défaut)
#    -Fond     "blanc" (par défaut) ou "transparent"
# ============================================================

param(
    [Parameter(Mandatory = $true)][string]$Entree,
    [Parameter(Mandatory = $true)][string]$Sortie,
    [int]$Grille = 4,
    [string]$Fond = "blanc"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$cheminEntree = (Resolve-Path $Entree).Path
# La sortie peut être relative (appel à la main) ou déjà absolue
# (appel depuis refaire_peluches.ps1, qui écrit dans son dossier de
# travail) : on ne colle le dossier courant que si elle est relative.
$cheminSortie = if ([System.IO.Path]::IsPathRooted($Sortie)) { $Sortie }
    else { [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Sortie)) }

$source = [System.Drawing.Image]::FromFile($cheminEntree)
try {
    $caseL = [int][Math]::Floor($source.Width / $Grille)
    $caseH = [int][Math]::Floor($source.Height / $Grille)

    if ($caseL -eq $caseH) {
        Write-Host "Déjà carrée ($caseL x $caseH) : on recopie telle quelle."
    }

    $cote = $caseL
    # ⚠️ Chaque argument entre parenthèses : en PowerShell la virgule
    # est PRIORITAIRE sur la multiplication, et « $a * $b, $c » se lit
    # « $a * ($b, $c) » — donc une multiplication par un tableau.
    $cote2 = $cote * $Grille
    $cible = New-Object System.Drawing.Bitmap($cote2, $cote2, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb))
    $g = [System.Drawing.Graphics]::FromImage($cible)
    try {
        if ($Fond -eq "blanc") { $g.Clear([System.Drawing.Color]::White) }
        else { $g.Clear([System.Drawing.Color]::Transparent) }

        # Pas de lissage : on recopie pixel pour pixel.
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

        $marge = [int][Math]::Floor(($cote - $caseH) / 2)

        for ($lig = 0; $lig -lt $Grille; $lig++) {
            for ($col = 0; $col -lt $Grille; $col++) {
                $depuis = New-Object System.Drawing.Rectangle(($col * $caseL), ($lig * $caseH), $caseL, $caseH)
                $vers = New-Object System.Drawing.Rectangle(($col * $cote), ($lig * $cote + $marge), $caseL, $caseH)
                $g.DrawImage($source, $vers, $depuis, ([System.Drawing.GraphicsUnit]::Pixel))
            }
        }
    } finally { $g.Dispose() }

    $cible.Save($cheminSortie, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host ("{0} : cases {1} x {2} -> planche carrée {3} x {3}, cases de {4} px" -f
        (Split-Path $Entree -Leaf), $caseL, $caseH, ($cote * $Grille), $cote)
    $cible.Dispose()
} finally { $source.Dispose() }
