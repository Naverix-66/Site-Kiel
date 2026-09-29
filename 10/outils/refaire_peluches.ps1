# ============================================================
#  REFAIRE_PELUCHES.PS1
# ============================================================
#  Refait d'un seul coup TOUTES les images des personnages à partir
#  des planches générées par Evan (assets\peluches\*_planche_2d*) :
#
#    1. les planches de jeu     assets\peluches\<clé>_anim.png   (Bob compris)
#    2. les portraits           assets\peluches\portraits\<clé>.png
#    3. les icônes d'objets     assets\ui\objets.png  (3 x 3, cases de 64 px)
#
#  Tout passe par planche_hd.ps1 (voir pourquoi dans son en-tête).
#  Les planches sont dessinées $FINESSE fois plus fin que le monde,
#  et le jeu les affiche réduites d'autant (FINESSE_PELUCHES,
#  js\config.js). Les deux nombres DOIVENT rester égaux.
#
#  USAGE (depuis n'importe où)
#    powershell -ExecutionPolicy Bypass -File outils\refaire_peluches.ps1
#
#  AJOUTER UNE PELUCHE : une ligne dans $CASTING ci-dessous, puis
#  sa clé dans PELUCHES_DESSINEES (js\moteur.js).
# ============================================================

param(
    [string]$Racine = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = "Stop"
$outilHD = Join-Path $PSScriptRoot "planche_hd.ps1"
$dossierPeluches = Join-Path $Racine "assets\peluches"
$dossierPortraits = Join-Path $dossierPeluches "portraits"
$dossierUi = Join-Path $Racine "assets\ui"
$travail = Join-Path $env:TEMP "refaire_peluches"

foreach ($d in @($dossierPortraits, $dossierUi)) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}
if (Test-Path $travail) { Remove-Item -Recurse -Force $travail }
New-Item -ItemType Directory -Force -Path $travail | Out-Null


# ------------------------------------------------------------
#  LES RÉGLAGES
# ------------------------------------------------------------
$FINESSE = 2                   # = FINESSE_PELUCHES dans js\config.js
$HAUTEUR_BOB = 45              # = HAUTEUR_BOB dans js\config.js

#  taille = celle de js\personnages.js (1 = Bob).
#  ⚠️ Si une taille change là-bas, la changer ICI aussi.
#  fichier = le préfixe des planches d'Evan (Cakey s'écrit « cackey »).
#  apercu  = l'aperçu remove.bg de la même planche (sert au détourage).
$CASTING = @(
    @{ cle = "bluey";  fichier = "bluey";  taille = 0.7; apercu = "bluey_planche_2d-removebg-preview.png" },
    @{ cle = "rosy";   fichier = "rosy";   taille = 0.9; apercu = "rosy_planche_2d-removebg-preview.png" },
    @{ cle = "doudou"; fichier = "doudou"; taille = 1.0; apercu = "doudou_planche_2d-removebg-preview.png" },
    @{ cle = "fraisy"; fichier = "fraisy"; taille = 0.8; apercu = "fraisy_planche_2d-removebg-preview (1).png" },
    @{ cle = "cakey";  fichier = "cackey"; taille = 1.45; apercu = "cackey_planche_2d-removebg-preview.png" },
    @{ cle = "samsam"; fichier = "samsam"; taille = 1.6; apercu = "samsam_planche_2d-removebg-preview.png" },
    # Samsam après avoir donné son pyjama (acte II) : une TENUE, pas un
    # personnage — voir TENUES dans js\moteur.js.
    @{ cle = "samsam_sans_pyjama"; fichier = "samsamNoPyjama"; taille = 1.6; apercu = "samsamNoPyjama_planche_2d.png" }
)

# Les planches où l'IA a mis une image de PROFIL au bout d'une
# marche de face ou de dos. On la remplace par l'image du milieu
# de la même ligne : sinon le personnage se tourne un instant
# de côté à chaque pas.
#   ligne 1 = marche vers le bas, ligne 2 = marche vers le haut
$REPARATIONS = @{
    "cakey" = @(
        @{ ligne = 1; source = 1; cible = 3 },
        @{ ligne = 2; source = 1; cible = 3 }
    )
}

# Bob : sa planche d'origine n'est pas au gabarit 4 x 4. On la
# remet d'abord sur une grille (repack_sprites.ps1), puis dans
# l'ordre des animations (remap_anim.ps1). Cet ordre a été
# retrouvé en comparant l'ancienne planche de jeu, image par image.
$ORDRE_BOB = "0,1,3,0, 4,0,5,0, 13,14,16,17, 7,11,15,19"

# Les portraits sont tous rendus à la même hauteur avant découpe :
# les visages ont ainsi la même finesse dans la boîte de dialogue.
$HAUTEUR_PORTRAIT = 110
$PART_PORTRAIT = 0.66          # tête + épaules

# Les icônes : cases de 32 px dans le monde, donc 32 x FINESSE ici.
$CASE_ICONE = 32 * $FINESSE


Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class OutilsPeluches
{
    static byte[] Lire(string chemin, out int l, out int h)
    {
        using (var b = new Bitmap(chemin))
        {
            l = b.Width; h = b.Height;
            var bd = b.LockBits(new Rectangle(0, 0, l, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            var p = new byte[l * h * 4];
            for (int y = 0; y < h; y++)
                Marshal.Copy(new IntPtr(bd.Scan0.ToInt64() + (long)y * bd.Stride), p, y * l * 4, l * 4);
            b.UnlockBits(bd);
            return p;
        }
    }

    static void Ecrire(byte[] p, int l, int h, string chemin)
    {
        using (var b = new Bitmap(l, h, PixelFormat.Format32bppArgb))
        {
            var bd = b.LockBits(new Rectangle(0, 0, l, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            for (int y = 0; y < h; y++)
                Marshal.Copy(p, y * l * 4, new IntPtr(bd.Scan0.ToInt64() + (long)y * bd.Stride), l * 4);
            b.UnlockBits(bd);
            b.Save(chemin, ImageFormat.Png);
        }
    }

    static Rectangle Boite(byte[] p, int l, int x0, int y0, int x1, int y1)
    {
        int bx0 = int.MaxValue, by0 = int.MaxValue, bx1 = -1, by1 = -1;
        for (int y = y0; y < y1; y++)
            for (int x = x0; x < x1; x++)
                if (p[(y * l + x) * 4 + 3] > 0)
                {
                    if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
                    if (y < by0) by0 = y; if (y > by1) by1 = y;
                }
        if (bx1 < 0) return new Rectangle(0, 0, 0, 0);
        return new Rectangle(bx0, by0, bx1 - bx0 + 1, by1 - by0 + 1);
    }

    static void Copier(byte[] src, int ls, Rectangle zone, byte[] dst, int ld, int dx, int dy)
    {
        for (int y = 0; y < zone.Height; y++)
            for (int x = 0; x < zone.Width; x++)
            {
                int s = ((zone.Y + y) * ls + zone.X + x) * 4;
                int d = ((dy + y) * ld + dx + x) * 4;
                for (int k = 0; k < 4; k++) dst[d + k] = src[s + k];
            }
    }

    // Recopie une case d'une planche 4 x 4 sur une autre.
    public static void CopierCase(string chemin, int colSource, int ligneSource, int colCible, int ligneCible)
    {
        int l, h;
        var p = Lire(chemin, out l, out h);
        int c = l / 4;
        var copie = (byte[])p.Clone();
        Copier(copie, l, new Rectangle(colSource * c, ligneSource * c, c, c), p, l, colCible * c, ligneCible * c);
        Ecrire(p, l, h, chemin);
    }

    // Remplace une case d'une planche (grille x grille) par une image
    // de la taille d'une case.
    public static void CollerCase(string planche, int grille, int col, int ligne, string image)
    {
        int l, h, li, hi;
        var p = Lire(planche, out l, out h);
        var q = Lire(image, out li, out hi);
        int c = l / grille;
        for (int y = 0; y < c; y++)
            for (int x = 0; x < c; x++)
                for (int k = 0; k < 4; k++)
                    p[((ligne * c + y) * l + col * c + x) * 4 + k] =
                        (x < li && y < hi) ? q[(y * li + x) * 4 + k] : (byte)0;
        Ecrire(p, l, h, planche);
    }

    // Tête et épaules de la case (0,0), recadrées en carré.
    public static string Portrait(string planche, double part, string sortie)
    {
        int l, h;
        var p = Lire(planche, out l, out h);
        int c = l / 4;
        var corps = Boite(p, l, 0, 0, c, c);
        int k = (int)Math.Round(corps.Height * part);
        var tete = Boite(p, l, 0, corps.Y, c, corps.Y + k);
        int cote = Math.Max(k, tete.Width);
        var q = new byte[cote * cote * 4];
        Copier(p, l, new Rectangle(tete.X, corps.Y, tete.Width, k), q, cote, (cote - tete.Width) / 2, cote - k);
        Ecrire(q, cote, cote, sortie);
        return cote + "x" + cote;
    }

    // Pose une image transparente sur un fond blanc : c'est ce que
    // planche_hd.ps1 attend comme « JPG ».
    public static void SurFondBlanc(string source, string sortie)
    {
        using (var src = new Bitmap(source))
        using (var b = new Bitmap(src.Width, src.Height))
        using (var g = Graphics.FromImage(b))
        {
            g.Clear(Color.White);
            g.DrawImage(src, 0, 0, src.Width, src.Height);
            b.Save(sortie, ImageFormat.Png);
        }
    }

    // Efface tout ce qui est franchement vert. Sert à la planche de
    // la mouette, où deux cases ont des touffes d'herbe dessinées au
    // sol : elle n'a aucun vert sur elle (blanc, gris, noir, bec
    // jaune, pattes roses), donc le filtre ne peut pas la mordre.
    public static int SansVert(string chemin)
    {
        int efface = 0;
        int l, h;
        var p = Lire(chemin, out l, out h);
        for (int i = 0; i < l * h; i++)
        {
            int bl = p[i * 4], g = p[i * 4 + 1], r = p[i * 4 + 2], a = p[i * 4 + 3];
            if (a > 0 && g > r + 10 && g > bl + 10) { p[i * 4 + 3] = 0; efface++; }
        }
        Ecrire(p, l, h, chemin);
        return efface;
    }
}
'@


# Un appel à un outil, dans son propre processus (ils déclarent
# chacun leurs classes C#, qui ne peuvent pas cohabiter).
function Outil($script, [string[]]$parametres) {
    $journal = & powershell -NoProfile -ExecutionPolicy Bypass -File $script @parametres 2>&1
    if ($LASTEXITCODE -ne 0) { $journal | Out-Host; throw "$([IO.Path]::GetFileName($script)) a échoué" }
    return $journal
}

function PlancheHD($jpg, $apercu, $hauteur, $sortie, [string[]]$autres = @()) {
    $controle = Join-Path $travail ("controle_" + [IO.Path]::GetFileName($sortie))
    $journal = Outil $outilHD (@("-Jpg", $jpg, "-Apercu", $apercu, "-Hauteur", $hauteur,
        "-Sortie", $sortie, "-Controle", $controle) + $autres)
    return (($journal | Select-String -Pattern "controle :" | Select-Object -First 1) -replace "^controle : ", "").ToString().Trim()
}


# ---- 0. BOB, REMIS AU GABARIT -------------------------------
$bobGrille = Join-Path $travail "bob_grille.png"
$bobAnim = Join-Path $travail "bob_grille_anim.png"
$bobBlanc = Join-Path $travail "bob_blanc.png"
Outil (Join-Path $PSScriptRoot "repack_sprites.ps1") @("-Entree", (Join-Path $dossierPeluches "sprite_sheet_bob-removebg-preview.png"),
    "-Sortie", $bobGrille, "-Cellule", "136", "-Echelle", "1.0") | Out-Null
Outil (Join-Path $PSScriptRoot "remap_anim.ps1") @("-Entree", $bobGrille, "-Sortie", $bobAnim,
    "-Cellule", "136", "-Ordre", $ORDRE_BOB) | Out-Null
[OutilsPeluches]::SurFondBlanc($bobAnim, $bobBlanc)

$sujets = @(@{ cle = "bob"; jpg = $bobBlanc; apercu = $bobAnim; taille = 1.0 })
foreach ($p in $CASTING) {
    $sujets += @{
        cle = $p.cle; taille = $p.taille
        jpg = Join-Path $dossierPeluches "$($p.fichier)_planche_2d.jpg"
        apercu = Join-Path $dossierPeluches $p.apercu
    }
}


# ---- 1. LES PLANCHES DE JEU ---------------------------------
"1. Planches de jeu (finesse x$FINESSE)"
foreach ($s in $sujets) {
    $hauteur = [int][Math]::Round($s.taille * $HAUTEUR_BOB * $FINESSE)
    $sortie = Join-Path $dossierPeluches "$($s.cle)_anim.png"
    $c = PlancheHD $s.jpg $s.apercu $hauteur $sortie
    "   $($s.cle) : $c"
    if ($REPARATIONS.ContainsKey($s.cle)) {
        foreach ($r in $REPARATIONS[$s.cle]) {
            [OutilsPeluches]::CopierCase($sortie, $r.source, $r.ligne, $r.cible, $r.ligne)
            "     case ($($r.ligne),$($r.cible)) remplacée par ($($r.ligne),$($r.source))"
        }
    }
}


# ---- 2. LES PORTRAITS ----------------------------------------
"2. Portraits"
foreach ($s in $sujets) {
    $grande = Join-Path $travail "portrait_$($s.cle)_anim.png"
    PlancheHD $s.jpg $s.apercu $HAUTEUR_PORTRAIT $grande | Out-Null
    $taille = [OutilsPeluches]::Portrait($grande, $PART_PORTRAIT, (Join-Path $dossierPortraits "$($s.cle).png"))
    "   $($s.cle) : $taille"
}


# ---- 3. LES ICÔNES -------------------------------------------
#  Ordre de la planche d'Evan (= ICONES_OBJETS, js\moteur.js) :
#  veilleuse, baguette, couvercle | dé, pétale, plume | tomate, chaussette, pyjama
"3. Icones"
$c = PlancheHD (Join-Path $dossierPeluches "objects_planche_2d.jpg") `
    (Join-Path $dossierPeluches "objects_planche_2d-removebg-preview.png") `
    $CASE_ICONE (Join-Path $dossierUi "objets.png") @("-Grille", "3", "-ChaqueCase")
"   objets.png : cases de $CASE_ICONE px"

#  La veilleuse : la planche la montrait en lampe de chevet. Evan a
#  dessiné la vraie (lampe.png, déjà détourée) : elle prend la case 0.
$lampe = Join-Path $dossierPeluches "lampe.png"
$lampeBlanc = Join-Path $travail "lampe_blanc.png"
$veilleuse = Join-Path $travail "veilleuse_icone.png"
[OutilsPeluches]::SurFondBlanc($lampe, $lampeBlanc)
PlancheHD $lampeBlanc $lampe $CASE_ICONE $veilleuse @("-Grille", "1", "-ChaqueCase") | Out-Null
[OutilsPeluches]::CollerCase((Join-Path $dossierUi "objets.png"), 3, 0, 0, $veilleuse)
"   veilleuse (lampe.png) -> case 0"


# ---- 4. LA MOUETTE -------------------------------------------
#  Elle n'est pas dans $CASTING : ce n'est pas une peluche, elle n'a
#  ni portrait ni gabarit de marche, et sa planche demande deux
#  traitements que les autres n'ont pas.
#
#  1. Elle arrive en 2816 x 1536 (cases de 704 x 384) et planche_hd
#     déduit la case de la seule LARGEUR : il faut d'abord la remettre
#     au carré, sans rien déformer (carrer_planche.ps1).
#  2. Deux de ses cases ont des touffes d'herbe dessinées au sol. Elle
#     n'a pas un seul pixel vert sur elle, donc on les efface à la
#     couleur : c'est sans risque et ça évite de retoucher à la main.
#
#  -Hauteur 77 = 0,85 (60 cm contre les 70 de Bob) x 45 x FINESSE.
"4. La mouette"
$mouetteJpg = Join-Path $dossierPeluches "mouette_planche_2d.jpg"
if (Test-Path $mouetteJpg) {
    $outilCarre = Join-Path $PSScriptRoot "carrer_planche.ps1"
    $carre = Join-Path $travail "mouette_carre.png"
    $carreApercu = Join-Path $travail "mouette_carre_apercu.png"

    & $outilCarre -Entree $mouetteJpg -Sortie $carre -Fond blanc | Out-Null
    & $outilCarre -Entree (Join-Path $dossierPeluches "mouette_planche_2d-removebg-preview.png") `
        -Sortie $carreApercu -Fond transparent | Out-Null

    $sortieMouette = Join-Path $dossierPeluches "mouette_anim.png"
    PlancheHD $carre $carreApercu 77 $sortieMouette | Out-Null
    $verts = [OutilsPeluches]::SansVert($sortieMouette)
    "   mouette_anim.png (herbe effacee : $verts pixels)"
} else {
    "   (planche de la mouette absente, on passe)"
}

""
"Terminé. Images de contrôle agrandies dans : $travail"
