#!/usr/bin/env node
// Render site/favicon.ico (16 + 32 px) and site/apple-touch-icon.png (180 px) from the
// brand SVG, using a headless Chromium browser (Edge or Chrome). No npm dependencies.
//   node tools/make-icons.mjs        (BROWSER=path/to/chrome to override)
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'site/assets/img/brand/favicon.svg'), 'utf8');
// iOS masks the touch icon itself, so that one is drawn full-bleed (no rounded corners).
const squareSvg = svg.replace(/<rect([^>]*?) rx="\d+"/, '<rect$1');
const browserPath = [process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium',
].filter(Boolean).find((p) => existsSync(p));
if (!browserPath) throw new Error('No Chromium browser found; set BROWSER');

const port = 9800 + Math.floor(Math.random() * 100);
const proc = spawn(browserPath, ['--headless=new', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'lf-icons-'))}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function devtools(path, method = 'GET') {
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${port}${path}`, { method }); if (r.ok) return r.json(); } catch {} await sleep(200); }
  throw new Error('DevTools not reachable');
}

try {
  const t = await devtools('/json/new?about:blank', 'PUT');
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const wait = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m.result); wait.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

  async function render(markup, size) {
    await send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
    const html = `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`;
    await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') });
    await sleep(400);
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
    return Buffer.from(shot.data, 'base64');
  }

  writeFileSync(join(root, 'site/apple-touch-icon.png'), await render(squareSvg, 180));
  const pngs = [[16, await render(svg, 16)], [32, await render(svg, 32)]];
  // ICO container holding PNG images (supported by every current browser).
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length; const dir = []; const data = [];
  for (const [size, png] of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size, 0); e.writeUInt8(size, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
    offset += png.length; dir.push(e); data.push(png);
  }
  writeFileSync(join(root, 'site/favicon.ico'), Buffer.concat([header, ...dir, ...data]));
  ws.close();
  console.log('wrote site/apple-touch-icon.png and site/favicon.ico');
} finally { proc.kill(); }
