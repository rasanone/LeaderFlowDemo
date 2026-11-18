#!/usr/bin/env node
// Check every internal link, image, srcset entry, stylesheet, script and same-page #anchor
// in site/**/*.html resolves to a real file. External URLs are listed, not fetched.
// No dependencies.   node tools/check-links.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const KNOWN_PLACEHOLDERS = ['#APPLICATION-FORM-URL-TBC']; // filled in when the application tool is chosen (O4)

function walk(d) { return readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const files = walk(site);
const html = files.filter((f) => f.endsWith('.html'));
const problems = []; const external = new Set(); let checked = 0;

for (const file of html) {
  const src = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [];
  for (const m of src.matchAll(/\s(href|src|srcset|content)="([^"]*)"/g)) {
    if (m[1] === 'srcset') m[2].split(',').forEach((part) => refs.push(part.trim().split(/\s+/)[0]));
    else if (m[1] === 'content') { const u = m[2].match(/url=(.+)$/); if (u) refs.push(u[1]); }
    else refs.push(m[2]);
  }
  // data-src on video facades points to external players: list them too
  for (const m of src.matchAll(/data-src="([^"]+)"/g)) if (/^https?:/.test(m[1])) external.add(m[1]);
  for (const ref of refs) {
    if (!ref || /^(mailto:|tel:|data:)/.test(ref)) continue;
    if (/^https?:\/\//.test(ref)) { if (!ref.startsWith('https://leaderflow.org/')) external.add(ref); continue; }
    checked++;
    if (KNOWN_PLACEHOLDERS.includes(ref)) continue;
    if (ref.startsWith('#')) { if (ref.length > 1 && !ids.has(ref.slice(1))) problems.push(`${relative(site, file)}: missing anchor ${ref}`); continue; }
    const clean = ref.split('#')[0].split('?')[0];
    if (clean.startsWith('/api/')) continue; // form actions: Pages Functions, not files
    let target = clean.startsWith('/') ? join(site, clean) : join(dirname(file), clean);
    if (clean.endsWith('/') || clean === '' || clean === '.') target = join(target, 'index.html');
    else if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) problems.push(`${relative(site, file)}: broken ${ref}`);
    else if (!resolve(target).startsWith(site)) problems.push(`${relative(site, file)}: points outside site/ ${ref}`);
  }
}
console.log(`${html.length} pages, ${checked} internal references checked.`);
console.log(`External URLs (${external.size}):\n  ` + [...external].sort().join('\n  '));
if (problems.length) { console.log(`\nPROBLEMS (${problems.length}):\n  ` + problems.join('\n  ')); process.exit(1); }
console.log('\nNo broken internal links or images.');
