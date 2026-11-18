#!/usr/bin/env node
// Generate the responsive / re-cropped images used by the site. Developer machine only.
// Needs libwebp's command-line tools (cwebp, dwebp) on PATH. No npm dependencies.
//
//   node tools/images.mjs grads     # graduate headshots: 4:5 crops at 240w + up to 480w
//   node tools/images.mjs hero      # homepage hero photos: opaque 5:4 crops, 480w + 713w
//   node tools/images.mjs headers   # interior page header photos: 1040x417 centre crop
//   node tools/images.mjs all
//
// Sources live OUTSIDE site/ so they are never deployed:
//   source-images/grads/<year>-<city>-<name>.webp   (add new graduates here, then run "grads")
//   source-images/photo/<name>.webp
// Outputs go to site/assets/img/... with the width in the file name. Never overwrite a
// published file with different content: images are cached for a long time, so a changed
// image needs a new name. A run prints a JSON manifest (file -> width x height) on stdout.
//
// Crops reproduce exactly what the CSS displayed before (object-fit: cover), so nothing
// visible is lost: headshots use object-position "center 22%" in a 4:5 box.

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'source-images');
const OUT = join(root, 'site', 'assets', 'img');
const Q = Number(process.env.Q || 82);   // WebP quality. 80-85 keeps re-encodes visually identical
const tmp = mkdtempSync(join(tmpdir(), 'lf-img-'));

export function webpSize(file) {
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') throw new Error('not webp: ' + file);
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
  throw new Error('unknown webp chunk ' + chunk);
}

// Decode once to a lossless PNG, then crop/resize/encode from that (one lossy generation only).
function encode(src, out, { crop, resize, noalpha = true }) {
  const png = join(tmp, basename(src) + '.png');
  if (!existsSync(png)) execFileSync('dwebp', ['-quiet', src, '-o', png]);
  const args = ['-quiet', '-q', String(Q), '-m', '6', '-sharp_yuv', '-metadata', 'none'];
  if (noalpha) args.push('-noalpha');
  if (crop) args.push('-crop', ...crop.map((n) => String(Math.round(n))));
  if (resize) args.push('-resize', String(resize[0]), String(resize[1]));
  mkdirSync(dirname(out), { recursive: true });
  execFileSync('cwebp', [...args, png, '-o', out]);
  return { file: out.slice(root.length + 1).replace(/\\/g, '/'), ...webpSize(out), bytes: statSync(out).size };
}

function grads() {
  const dir = join(SRC, 'grads');
  const manifest = {};
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.webp')).sort()) {
    const src = join(dir, f);
    const { w, h } = webpSize(src);
    // 4:5 crop, horizontally centred, vertically at 22% (the CSS object-position).
    let cw, ch, x, y;
    if (w / h > 0.8) { ch = h; cw = Math.round(h * 0.8); x = (w - cw) / 2; y = 0; }
    else { cw = w; ch = Math.round(w / 0.8); x = 0; y = (h - ch) * 0.22; }
    const name = f.replace(/\.webp$/, '');
    // Widths: 240 (1x desktop), 360 (2x phones), 480 (2x desktop / 3x phones); never upscale.
    // If the crop is narrower than 480 but clearly wider than the last tier, add it at native width.
    const widths = [240, 360, 480].filter((t) => t <= cw);
    if (!widths.length || (cw < 480 && cw > widths[widths.length - 1] + 40)) widths.push(cw);
    const files = widths.map((t) => encode(src, join(OUT, 'grads', `${name}-${t}.webp`),
      { crop: [x, y, cw, ch], resize: cw > t ? [t, Math.round(t * 1.25)] : null, noalpha: false }));
    // noalpha: false - some headshots are cut-outs on a transparent background; dropping the
    // alpha channel would expose the junk pixels stored under it.
    manifest[name] = { source: { w, h, bytes: statSync(src).size }, files };
  }
  return manifest;
}

function hero() {
  // The three slider photos share one angled transparent mask; x147 y23 713x570 is fully opaque in all of them
  // (it is the region the old arch showed), so the alpha channel can go. The homepage rotator crossfades these.
  const crop = [147, 23, 713, 570];
  const out = {};
  for (const n of ['hero-accelerate', 'hero-closing-gap', 'hero-connect']) {
    const src = join(SRC, 'photo', `${n}.webp`);
    out[n] = {
      large: encode(src, join(OUT, 'photo', `${n}-713.webp`), { crop }),
      small: encode(src, join(OUT, 'photo', `${n}-480.webp`), { crop, resize: [480, 384] }),
    };
  }
  return out;
}

function headers() {
  // Shown with object-fit: cover in a box at most ~2.4:1, so a centred 1040x417 crop keeps all of it.
  const out = {};
  for (const n of ['hdr-workshop-table', 'hdr-group-table']) {
    const src = join(SRC, 'photo', `${n}.webp`);
    const { w, h } = webpSize(src);
    out[n] = encode(src, join(OUT, 'photo', `${n}-1040.webp`), { crop: [(w - 1040) / 2, 0, 1040, h] });
  }
  return out;
}

const what = process.argv[2] || 'all';
const result = {};
try {
  if (what === 'grads' || what === 'all') result.grads = grads();
  if (what === 'hero' || what === 'all') result.hero = hero();
  if (what === 'headers' || what === 'all') result.headers = headers();
} finally { rmSync(tmp, { recursive: true, force: true }); }
console.log(JSON.stringify(result, null, 1));
