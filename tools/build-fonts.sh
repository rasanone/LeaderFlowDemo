#!/usr/bin/env sh
# Rebuild the self-hosted, trimmed WOFF2 fonts in site/assets/fonts/.
# Runs on the developer's machine only; nothing here is deployed.
#
# Needs: Python 3 with fonttools + brotli (use a throwaway venv:
#   python -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools brotli)
# Inputs: the OFL variable TTFs from https://github.com/google/fonts
#   ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf
#   ofl/fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf
#   ofl/inter/Inter[opsz,wght].ttf
# downloaded into their own folder (SRC below). Keep downloads out of site/ and tools/.
#
# Usage: PY=path/to/venv/python SRC=path/to/downloads sh tools/build-fonts.sh
#
# What is kept (matches what site.css actually uses):
#   Fraunces roman  : opsz 9-144 (font-optical-sizing:auto), wght 300-600, SOFT pinned 100, WONK pinned 1
#   Fraunces italic : wght 300-400, opsz pinned 72, SOFT 100, WONK 1 (only used at display sizes: hero <em>,
#                     highlighted cities, feature quote; pinning opsz halves the file: 70 KB -> 40 KB)
#   Inter           : wght 400-600, opsz pinned 14 (the default Google Fonts served)
#   Latin subset + common punctuation. Fraunces keeps all its features (case, liga, rvrn, ss01);
#   Inter keeps only the ones used (body sets "cv11","ss01"), which cuts it from 52 KB to 34 KB.
# If you use a new weight or character range in the CSS, widen the ranges here and re-run.
# Bump VERSION when the files change, so the long-cache filenames change too.
set -eu
PY="${PY:-python}"
SRC="${SRC:?set SRC to the folder with the downloaded TTFs}"
OUT="$(dirname "$0")/../site/assets/fonts"
VERSION="v1"
TMP="$(mktemp -d)"
UNICODES="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308,U+0327,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"
INTER_FEATURES="calt,case,ccmp,kern,liga,locl,mark,mkmk,rvrn,ss01,cv11,tnum"

mkdir -p "$OUT"
"$PY" -I -m fontTools.varLib.instancer "$SRC/Fraunces[SOFT,WONK,opsz,wght].ttf" SOFT=100 WONK=1 wght=300:600 -o "$TMP/fr-roman.ttf"
"$PY" -I -m fontTools.varLib.instancer "$SRC/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf" SOFT=100 WONK=1 wght=300:400 opsz=72 -o "$TMP/fr-italic.ttf"
"$PY" -I -m fontTools.varLib.instancer "$SRC/Inter[opsz,wght].ttf" opsz=14 wght=400:600 -o "$TMP/inter.ttf"

for pair in "fr-roman:fraunces-roman" "fr-italic:fraunces-italic" "inter:inter"; do
  in="${pair%%:*}"; out="${pair##*:}"
  feats="*"; [ "$in" = inter ] && feats="$INTER_FEATURES"
  "$PY" -I -m fontTools.subset "$TMP/$in.ttf" --flavor=woff2 --unicodes="$UNICODES" \
    --layout-features="$feats" --no-hinting --desubroutinize \
    --name-IDs='*' --name-languages='*' \
    --output-file="$OUT/$out-$VERSION.woff2"
done
rm -rf "$TMP"
ls -l "$OUT"
