# ============================================================
#  PLANCHE_HD.PS1
# ============================================================
#  Planche générée par IA (4 x 4, même gabarit que Bob) -> planche
#  de jeu en HAUTE DÉFINITION.
#
#  POURQUOI CET OUTIL
#
#  La première conversion (supprimée) ramenait chaque peluche à la grille de
#  pixels du décor (Bluey : 32 px de haut), réduisait à 24 couleurs
#  et épaississait les traits sombres. À l'écran, c'était « hyper
#  pixélisé » (Evan), et les visages faisaient un peu peur : les
#  yeux se fondaient dans le contour.
#
#  Celui-ci :
#    - part du JPG d'origine (2048 px), pas de l'aperçu remove.bg
#      (500 px) — l'aperçu ne sert plus qu'à repérer les trous
#      fermés du fond (entre un bras et le corps) ;
#    - dessine la planche FINESSE fois plus fin que le monde
#      (voir FINESSE_PELUCHES dans js/config.js), et le jeu
#      l'affiche réduite d'autant : un pixel de planche n'est
#      jamais plus gros qu'un pixel d'écran ;
#    - garde toutes les couleurs (moyenne de surface), sans
#      palette et sans renforcer le contour.
#
#  USAGE
#    powershell -ExecutionPolicy Bypass -File planche_hd.ps1 `
#        -Jpg ..\assets\peluches\rosy_planche_2d.jpg `
#        -Apercu ..\assets\peluches\rosy_planche_2d-removebg-preview.png `
#        -Hauteur 80 -Sortie ..\assets\peluches\rosy_anim.png
#
#    -Hauteur   hauteur, en pixels de PLANCHE, de la pose de face
#               (ligne 0, colonne 0) = taille x 45 x FINESSE
#    -Grille    colonnes (= lignes) de la planche source (4 ; 3 pour
#               la planche d'objets)
#    -Controle  (facultatif) image agrandie x2 sur fond sombre et
#               clair, pour vérifier les bords
#
#  Les planches d'objets passent par le même outil (voir
#  refaire_peluches.ps1), avec -Grille 3.
# ============================================================

param(
    [Parameter(Mandatory = $true)][string]$Jpg,
    [Parameter(Mandatory = $true)][string]$Apercu,
    [Parameter(Mandatory = $true)][int]$Hauteur,
    [Parameter(Mandatory = $true)][string]$Sortie,
    [int]$Grille = 4,
    [string]$Controle = "",
    # Pour les icônes : chaque case est mise à l'échelle SÉPARÉMENT
    # pour tenir dans un carré de -Hauteur pixels, et centrée.
    [switch]$ChaqueCase
)

$ErrorActionPreference = "Stop"

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;

public static class PlancheHD
{
    public static StringBuilder Journal = new StringBuilder();

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

    // La couleur du fond : celle des bords de l'image (médiane par
    // canal). Blanche pour les personnages, magenta pour les objets —
    // le prompt autorisait les deux.
    static int FondB, FondG, FondR;

    static void LireLeFond(byte[] p, int l, int h)
    {
        var bs = new List<int>(); var gs = new List<int>(); var rs = new List<int>();
        for (int x = 0; x < l; x += 3)
            foreach (int y in new int[] { 1, h - 2 })
            { int i = (y * l + x) * 4; bs.Add(p[i]); gs.Add(p[i + 1]); rs.Add(p[i + 2]); }
        for (int y = 0; y < h; y += 3)
            foreach (int x in new int[] { 1, l - 2 })
            { int i = (y * l + x) * 4; bs.Add(p[i]); gs.Add(p[i + 1]); rs.Add(p[i + 2]); }
        bs.Sort(); gs.Sort(); rs.Sort();
        FondB = bs[bs.Count / 2]; FondG = gs[gs.Count / 2]; FondR = rs[rs.Count / 2];
    }

    // Écart au fond : le plus grand écart des trois canaux.
    static int EcartAuFond(byte[] p, int i)
    {
        return Math.Max(Math.Abs(p[i] - FondB), Math.Max(Math.Abs(p[i + 1] - FondG), Math.Abs(p[i + 2] - FondR)));
    }

    // Le fond, bruité par la compression JPG.
    static bool PresqueBlanc(byte[] p, int i) { return EcartAuFond(p, i) <= 42; }

    // Teinte (0-360) et saturation (0-1) d'une couleur.
    static void TeinteSat(int r, int g, int b, out double teinte, out double sat)
    {
        int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
        double d = mx - mn;
        sat = mx == 0 ? 0 : d / mx;
        if (d == 0) { teinte = 0; return; }
        if (mx == r) teinte = 60 * (((g - b) / d) % 6);
        else if (mx == g) teinte = 60 * ((b - r) / d + 2);
        else teinte = 60 * ((r - g) / d + 4);
        if (teinte < 0) teinte += 360;
    }

    // Quand le fond est une couleur vive (le magenta des objets),
    // l'IA dessine ses lueurs dans cette même teinte : un halo rose
    // autour de la veilleuse. Tout ce qui a la teinte du fond est
    // du fond, qu'il touche le bord ou non.
    static bool FondVif() { return Math.Max(FondR, Math.Max(FondG, FondB)) - Math.Min(FondR, Math.Min(FondG, FondB)) > 100; }

    static bool MemeTeinteQueLeFond(byte[] p, int i)
    {
        double tf, sf, t, s;
        TeinteSat(FondR, FondG, FondB, out tf, out sf);
        TeinteSat(p[i + 2], p[i + 1], p[i], out t, out s);
        double ecart = Math.Abs(t - tf); if (ecart > 180) ecart = 360 - ecart;
        // Seulement les couleurs CLAIRES : le pied de la veilleuse est
        // d'un violet très sombre, de la même teinte, et doit rester.
        int clarte = Math.Max(p[i], Math.Max(p[i + 1], p[i + 2]));
        return s > 0.3 && ecart < 28 && clarte > 120;
    }

    // ------------------------------------------------------------
    // Le masque : true = la peluche.
    //   1. le blanc relié aux bords de l'image ou aux lignes de la
    //      grille est du fond (le contour sombre arrête le remplissage) ;
    //   2. un îlot blanc fermé est du fond si l'aperçu remove.bg y
    //      est majoritairement transparent (un trou entre bras et
    //      corps), et de la peluche sinon (le ventre blanc de Rosy) ;
    //   3. on ronge les pixels clairs collés au fond : ce sont les
    //      bavures de compression autour du contour.
    // ------------------------------------------------------------
    static bool[] Masque(byte[] p, int l, int h, int grille, byte[] ap, int la, int ha)
    {
        int n = l * h;
        var fond = new bool[n];
        var blanc = new bool[n];

        // Garde-fou : le remplissage ne traverse que ce que l'aperçu
        // remove.bg voit AUSSI comme du fond. Sans lui, un corps blanc
        // au contour clair (Fraisy) se ferait manger par le fond.
        for (int y = 0; y < h; y++)
        {
            int ay = Math.Min(ha - 1, y * ha / h);
            for (int x = 0; x < l; x++)
            {
                int ax = Math.Min(la - 1, x * la / l);
                int i = y * l + x;
                blanc[i] = PresqueBlanc(p, i * 4) && ap[(ay * la + ax) * 4 + 3] < 160;
            }
        }

        var pile = new Stack<int>();
        Action<int> semer = delegate (int k) { if (blanc[k] && !fond[k]) { fond[k] = true; pile.Push(k); } };
        int cote = l / grille;
        for (int x = 0; x < l; x++)
            for (int g = 0; g <= grille; g++) { int y = Math.Min(h - 1, g * cote); semer(y * l + x); }
        for (int y = 0; y < h; y++)
            for (int g = 0; g <= grille; g++) { int x = Math.Min(l - 1, g * cote); semer(y * l + x); }
        Remplir(pile, fond, blanc, l, h);

        // 2. les îlots blancs fermés
        var vu = new bool[n];
        var ilot = new List<int>();
        for (int s = 0; s < n; s++)
        {
            if (!blanc[s] || fond[s] || vu[s]) continue;
            ilot.Clear();
            var q = new Stack<int>(); q.Push(s); vu[s] = true;
            while (q.Count > 0)
            {
                int k = q.Pop(); ilot.Add(k);
                int x = k % l, y = k / l;
                if (x > 0) Pousser(q, vu, blanc, fond, k - 1);
                if (x < l - 1) Pousser(q, vu, blanc, fond, k + 1);
                if (y > 0) Pousser(q, vu, blanc, fond, k - l);
                if (y < h - 1) Pousser(q, vu, blanc, fond, k + l);
            }
            double somme = 0;
            foreach (int k in ilot)
            {
                int ax = Math.Min(la - 1, (k % l) * la / l), ay = Math.Min(ha - 1, (k / l) * ha / h);
                somme += ap[(ay * la + ax) * 4 + 3];
            }
            if (somme / ilot.Count < 128) foreach (int k in ilot) fond[k] = true;
        }

        // 2 bis. la teinte du fond, si le fond est vif
        if (FondVif())
            for (int i = 0; i < n; i++)
                if (!fond[i] && MemeTeinteQueLeFond(p, i * 4)) fond[i] = true;

        // 3. ronger les bavures (des pixels encore proches de la
        //    couleur du fond, collés au fond)
        for (int passe = 0; passe < 3; passe++)
        {
            var aRonger = new List<int>();
            for (int y = 1; y < h - 1; y++)
                for (int x = 1; x < l - 1; x++)
                {
                    int k = y * l + x;
                    if (fond[k] || EcartAuFond(p, k * 4) > 70) continue;
                    if (fond[k - 1] || fond[k + 1] || fond[k - l] || fond[k + l]) aRonger.Add(k);
                }
            foreach (int k in aRonger) fond[k] = true;
        }

        var masque = new bool[n];
        for (int i = 0; i < n; i++) masque[i] = !fond[i];
        return masque;
    }

    static void Pousser(Stack<int> q, bool[] vu, bool[] blanc, bool[] fond, int k)
    {
        if (!vu[k] && blanc[k] && !fond[k]) { vu[k] = true; q.Push(k); }
    }

    static void Remplir(Stack<int> pile, bool[] fond, bool[] blanc, int l, int h)
    {
        while (pile.Count > 0)
        {
            int k = pile.Pop();
            int x = k % l, y = k / l;
            if (x > 0 && blanc[k - 1] && !fond[k - 1]) { fond[k - 1] = true; pile.Push(k - 1); }
            if (x < l - 1 && blanc[k + 1] && !fond[k + 1]) { fond[k + 1] = true; pile.Push(k + 1); }
            if (y > 0 && blanc[k - l] && !fond[k - l]) { fond[k - l] = true; pile.Push(k - l); }
            if (y < h - 1 && blanc[k + l] && !fond[k + l]) { fond[k + l] = true; pile.Push(k + l); }
        }
    }

    class Case
    {
        public int Col, Lig, X0, Y0, X1, Y1;     // boîte opaque, coordonnées source
        public bool Vide;
    }

    // Retire les poussières : composantes opaques minuscules.
    static void Epousseter(bool[] m, int l, int h, int x0, int y0, int x1, int y1, int seuil)
    {
        var vu = new bool[l * h];
        var comp = new List<int>();
        for (int y = y0; y < y1; y++)
            for (int x = x0; x < x1; x++)
            {
                int s = y * l + x;
                if (!m[s] || vu[s]) continue;
                comp.Clear();
                var q = new Stack<int>(); q.Push(s); vu[s] = true;
                while (q.Count > 0)
                {
                    int k = q.Pop(); comp.Add(k);
                    int cx = k % l, cy = k / l;
                    int[] vois = { cx > x0 ? k - 1 : -1, cx < x1 - 1 ? k + 1 : -1, cy > y0 ? k - l : -1, cy < y1 - 1 ? k + l : -1 };
                    foreach (int v in vois) if (v >= 0 && m[v] && !vu[v]) { vu[v] = true; q.Push(v); }
                }
                if (comp.Count < seuil) foreach (int k in comp) m[k] = false;
            }
    }

    public static string Convertir(string jpg, string apercu, int hauteur, string sortie, int grille, string controle, bool chaqueCase)
    {
        Journal.Clear();
        int l, h, la, ha;
        var p = Lire(jpg, out l, out h);
        var ap = Lire(apercu, out la, out ha);
        LireLeFond(p, l, h);
        Journal.AppendLine("fond : rgb(" + FondR + "," + FondG + "," + FondB + ")");
        var m = Masque(p, l, h, grille, ap, la, ha);
        int cote = l / grille;
        Journal.AppendLine("source " + l + "x" + h + ", case " + cote + " px");

        // Les poussières font moins d'un « pixel d'art » (~ cote/50).
        int poussiere = Math.Max(16, (cote / 50) * (cote / 50));

        var cases = new List<Case>();
        for (int lig = 0; lig < grille; lig++)
            for (int col = 0; col < grille; col++)
            {
                int cx0 = col * cote, cy0 = lig * cote;
                // une petite marge : on ne lit pas les bords de case
                int mg = cote / 64;
                Epousseter(m, l, h, cx0 + mg, cy0 + mg, cx0 + cote - mg, cy0 + cote - mg, poussiere);
                var c = new Case { Col = col, Lig = lig, X0 = int.MaxValue, Y0 = int.MaxValue, X1 = -1, Y1 = -1 };
                for (int y = cy0 + mg; y < cy0 + cote - mg; y++)
                    for (int x = cx0 + mg; x < cx0 + cote - mg; x++)
                        if (m[y * l + x])
                        {
                            if (x < c.X0) c.X0 = x; if (x > c.X1) c.X1 = x;
                            if (y < c.Y0) c.Y0 = y; if (y > c.Y1) c.Y1 = y;
                        }
                c.Vide = c.X1 < 0;
                cases.Add(c);
            }

        // L'échelle : UNE pour toute la planche (personnage), ou une
        // par case (icônes).
        var echelles = new double[cases.Count];
        var reference = cases[0];
        if (reference.Vide && !chaqueCase) throw new Exception("la case (0,0) est vide");
        double commune = chaqueCase ? 0 : (double)hauteur / (reference.Y1 - reference.Y0 + 1);
        for (int i = 0; i < cases.Count; i++)
        {
            var c = cases[i];
            if (c.Vide) continue;
            echelles[i] = chaqueCase
                ? (double)(hauteur - 4) / Math.Max(c.X1 - c.X0 + 1, c.Y1 - c.Y0 + 1)
                : commune;
        }

        // La taille des cases de sortie. Pour un personnage, on garde
        // la place du dessin par rapport au CENTRE de sa case source :
        // la marche ne tremble pas de gauche à droite.
        int C;
        if (chaqueCase) C = hauteur;
        else
        {
            double demi = 0, haut = 0;
            for (int i = 0; i < cases.Count; i++)
            {
                var c = cases[i];
                if (c.Vide) continue;
                double centre = c.Col * cote + cote / 2.0;
                demi = Math.Max(demi, Math.Max(centre - c.X0, c.X1 + 1 - centre) * commune);
                haut = Math.Max(haut, (c.Y1 - c.Y0 + 1) * commune);
            }
            C = (int)Math.Ceiling((Math.Max(2 * demi, haut) + 4) / 4.0) * 4;
        }

        int L = C * grille;
        var o = new byte[L * L * 4];

        for (int i = 0; i < cases.Count; i++)
        {
            var c = cases[i];
            if (c.Vide) continue;
            double s = echelles[i];
            int ox0 = c.Col * C, oy0 = c.Lig * C;

            // Correspondance sortie -> source.
            double srcX0, srcY0;
            if (chaqueCase)
            {
                double lw = (c.X1 - c.X0 + 1) * s, lh = (c.Y1 - c.Y0 + 1) * s;
                srcX0 = c.X0 - ((C - lw) / 2) / s;
                srcY0 = c.Y0 - ((C - lh) / 2) / s;
            }
            else
            {
                srcX0 = (c.Col * cote + cote / 2.0) - (C / 2.0) / s;
                srcY0 = (c.Y1 + 1) - C / s;
            }

            int n = Math.Max(2, (int)Math.Ceiling(1.0 / s) + 1);   // échantillons par côté
            for (int oy = 0; oy < C; oy++)
                for (int ox = 0; ox < C; ox++)
                {
                    int dedans = 0; long sr = 0, sg = 0, sb = 0;
                    for (int j = 0; j < n; j++)
                        for (int k = 0; k < n; k++)
                        {
                            int sx = (int)Math.Floor(srcX0 + (ox + (k + 0.5) / n) / s);
                            int sy = (int)Math.Floor(srcY0 + (oy + (j + 0.5) / n) / s);
                            if (sx < c.Col * cote || sy < c.Lig * cote || sx >= (c.Col + 1) * cote || sy >= (c.Lig + 1) * cote) continue;
                            if (sx < 0 || sy < 0 || sx >= l || sy >= h) continue;
                            int si = sy * l + sx;
                            if (!m[si]) continue;
                            dedans++;
                            sb += p[si * 4]; sg += p[si * 4 + 1]; sr += p[si * 4 + 2];
                        }
                    if (dedans * 2 < n * n) continue;
                    int d = ((oy0 + oy) * L + ox0 + ox) * 4;
                    o[d] = (byte)(sb / dedans); o[d + 1] = (byte)(sg / dedans); o[d + 2] = (byte)(sr / dedans); o[d + 3] = 255;
                }
        }

        // Les pieds exactement sur la dernière ligne de chaque case
        // (l'arrondi peut laisser une ligne vide dessous).
        if (!chaqueCase)
        {
            for (int i = 0; i < cases.Count; i++)
            {
                var c = cases[i];
                if (c.Vide) continue;
                int ox0 = c.Col * C, oy0 = c.Lig * C, bas = -1;
                for (int y = C - 1; y >= 0 && bas < 0; y--)
                    for (int x = 0; x < C; x++)
                        if (o[((oy0 + y) * L + ox0 + x) * 4 + 3] != 0) { bas = y; break; }
                int dec = (C - 1) - bas;
                if (bas < 0 || dec == 0) continue;
                for (int y = C - 1; y >= 0; y--)
                    for (int x = 0; x < C; x++)
                    {
                        int dst = ((oy0 + y) * L + ox0 + x) * 4;
                        int ys = y - dec;
                        for (int b = 0; b < 4; b++)
                            o[dst + b] = ys >= 0 ? o[((oy0 + ys) * L + ox0 + x) * 4 + b] : (byte)0;
                    }
            }
        }

        Ecrire(o, L, L, sortie);
        Journal.AppendLine("planche " + L + "x" + L + ", cases de " + C + " px" + (chaqueCase ? "" : ", echelle " + commune.ToString("0.000")));

        // Contrôle : la hauteur réelle de la pose de face.
        if (!chaqueCase)
        {
            int top = -1, bot = -1;
            for (int y = 0; y < C; y++)
                for (int x = 0; x < C; x++)
                    if (o[(y * L + x) * 4 + 3] != 0) { if (top < 0) top = y; bot = y; }
            Journal.AppendLine("controle : pose de face " + (bot - top + 1) + " px (voulu " + hauteur + "), pieds sur la ligne " + bot + " / " + (C - 1));
        }

        if (!string.IsNullOrEmpty(controle))
        {
            int Z = 2, PW = L * Z;
            var pv = new byte[PW * 2 * PW * 4];
            int[][] fonds = { new int[] { 0x52, 0x41, 0x2F }, new int[] { 0xF3, 0xEF, 0xE3 } };
            for (int panneau = 0; panneau < 2; panneau++)
                for (int y = 0; y < PW; y++)
                    for (int x = 0; x < PW; x++)
                    {
                        int si = ((y / Z) * L + (x / Z)) * 4;
                        int d = (y * PW * 2 + x + panneau * PW) * 4;
                        if (o[si + 3] != 0) { pv[d] = o[si]; pv[d + 1] = o[si + 1]; pv[d + 2] = o[si + 2]; }
                        else { pv[d] = (byte)fonds[panneau][2]; pv[d + 1] = (byte)fonds[panneau][1]; pv[d + 2] = (byte)fonds[panneau][0]; }
                        pv[d + 3] = 255;
                    }
            Ecrire(pv, PW * 2, PW, controle);
        }

        return Journal.ToString();
    }
}
'@

$journal = [PlancheHD]::Convertir(
    [IO.Path]::GetFullPath($Jpg),
    [IO.Path]::GetFullPath($Apercu),
    $Hauteur,
    [IO.Path]::GetFullPath($Sortie),
    $Grille,
    $(if ($Controle) { [IO.Path]::GetFullPath($Controle) } else { "" }),
    [bool]$ChaqueCase)
Write-Output $journal
