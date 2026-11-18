# Compute @font-face fallback metric overrides (size-adjust, ascent/descent-override) so the
# Georgia/Arial fallbacks take up the same space as Fraunces/Inter while the web fonts load.
# Usage: python -I tools/fallback-metrics.py <folder with the source TTFs>   (needs fonttools)
# Windows paths for Georgia/Arial below; on macOS use /System/Library/Fonts/Supplemental/Georgia.ttf etc.
# Paste the printed values into the "Fallbacks" @font-face rules at the top of site/assets/css/site.css.
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
SAMPLE = "The LeaderFlow Development Program prepares diverse professionals to lead in architecture, engineering and construction."
def metrics(path, loc=None):
    f = TTFont(path)
    if loc: f = instantiateVariableFont(f, loc)
    upm = f['head'].unitsPerEm; cmap = f.getBestCmap(); hmtx = f['hmtx']
    w = sum(hmtx[cmap[ord(c)]][0] for c in SAMPLE if ord(c) in cmap) / len(SAMPLE)
    h = f['hhea']
    return dict(upm=upm, avg=w/upm, asc=h.ascent/upm, desc=-h.descent/upm, gap=h.lineGap/upm)
src = sys.argv[1]
pairs = [("Fraunces", f"{src}/Fraunces[SOFT,WONK,opsz,wght].ttf", dict(wght=500, opsz=72, SOFT=100, WONK=1), "C:/Windows/Fonts/georgia.ttf", "Georgia"),
         ("Inter", f"{src}/Inter[opsz,wght].ttf", dict(wght=400, opsz=14), "C:/Windows/Fonts/arial.ttf", "Arial")]
for name, p, loc, fb, fbname in pairs:
    a = metrics(p, loc); b = metrics(fb)
    sa = a['avg'] / b['avg']
    print(f'{name} Fallback ({fbname}): size-adjust: {sa*100:.2f}%; ascent-override: {a["asc"]/sa*100:.2f}%; descent-override: {a["desc"]/sa*100:.2f}%; line-gap-override: {a["gap"]/sa*100:.2f}%;')
