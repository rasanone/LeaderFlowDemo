#!/usr/bin/env node
// Headless page check: console errors, failed requests, first-view weight, screenshots.
// No npm dependencies: drives an installed Chromium browser (Edge or Chrome) over the
// DevTools protocol using Node's built-in WebSocket (Node 22+).
//
// Usage:
//   python -m http.server 8123 -d site        (in another terminal)
//   node tools/check-pages.mjs [baseUrl] [outDir]
// Env: BROWSER=path/to/msedge.exe|chrome.exe   PAGES=comma,separated,paths   FULL=1 (also scroll to bottom)
//
// Output: a JSON report on stdout and PNG screenshots in outDir (default: ./.check-out).

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const base = (process.argv[2] || 'http://127.0.0.1:8123').replace(/\/$/, '');
const outDir = process.argv[3] || '.check-out';
mkdirSync(outDir, { recursive: true });

const candidates = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const browserPath = candidates.find((p) => existsSync(p));
if (!browserPath) { console.error('No Chromium browser found; set BROWSER=...'); process.exit(2); }

const PAGES = (process.env.PAGES || [
  '/', '/about-us/', '/become-a-sponsor/', '/connect-with-us/',
  '/flowcilitators/become-a-flowcilitator/', '/flowcilitators/meet-the-flowcilitators/',
  '/leaderflow-development-program/', '/leaderflow-development-program/application-process/',
  '/leaderflow-development-program/application-form/', '/leaderflow-development-program/application-form/apply/', '/leaderflow-development-program/leaderflow-graduates/',
  '/leaderflow-development-program/participantfaqs/', '/404.html',
].join(',')).split(',');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812, dpr: 2, mobile: true },
  { name: 'desktop', width: 1366, height: 900, dpr: 1, mobile: false },
];

const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'lf-check-'));
const browser = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJSON(path, method = 'GET') {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}${path}`, { method }); if (r.ok) return r.json(); } catch {}
    await sleep(200);
  }
  throw new Error('DevTools not reachable');
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method) listeners.forEach((fn) => fn(msg));
  };
  return new Promise((resolve) => ws.onopen = () => resolve({
    send: (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }),
    on: (fn) => listeners.push(fn),
    close: () => ws.close(),
  }));
}

const report = [];
try {
  await getJSON('/json/version');
  for (const vp of VIEWPORTS) {
    for (const path of PAGES) {
      const target = await getJSON('/json/new?about:blank', 'PUT');
      const cdp = await connect(target.webSocketDebuggerUrl);
      const reqs = new Map(); const problems = [];
      cdp.on((m) => {
        const p = m.params;
        if (m.method === 'Network.responseReceived') { const r = reqs.get(p.requestId) || {}; Object.assign(r, { url: p.response.url, status: p.response.status, type: p.type, mime: p.response.mimeType }); reqs.set(p.requestId, r); if (p.response.status >= 400 && !p.response.url.endsWith('/404.html')) problems.push(`HTTP ${p.response.status} ${p.response.url}`); }
        if (m.method === 'Network.loadingFinished') { const r = reqs.get(p.requestId) || {}; r.bytes = p.encodedDataLength; reqs.set(p.requestId, r); }
        if (m.method === 'Network.loadingFailed' && !p.canceled) problems.push(`FAILED ${p.errorText} ${(reqs.get(p.requestId) || {}).url || p.requestId}`);
        if (m.method === 'Runtime.exceptionThrown') problems.push(`EXCEPTION ${p.exceptionDetails.exception?.description || p.exceptionDetails.text}`);
        if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(p.type)) problems.push(`CONSOLE.${p.type} ${p.args.map((a) => a.value ?? a.description).join(' ')}`);
        if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(p.entry.level)) problems.push(`LOG.${p.entry.level} ${p.entry.text} ${p.entry.url || ''}`);
      });
      await cdp.send('Network.enable'); await cdp.send('Runtime.enable'); await cdp.send('Log.enable'); await cdp.send('Page.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
      await cdp.send('Page.navigate', { url: base + path });
      await sleep(2500);
      const sum = (filter) => [...reqs.values()].filter(filter).reduce((a, r) => a + (r.bytes || 0), 0);
      const kb = (n) => Math.round(n / 102.4) / 10;
      const firstView = {
        total: kb(sum(() => true)), requests: reqs.size,
        origins: [...new Set([...reqs.values()].map((r) => r.url && new URL(r.url).origin).filter(Boolean))],
        fonts: kb(sum((r) => r.type === 'Font')), images: kb(sum((r) => r.type === 'Image')),
        doc: kb(sum((r) => r.type === 'Document')), css: kb(sum((r) => r.type === 'Stylesheet')), js: kb(sum((r) => r.type === 'Script')),
        imageCount: [...reqs.values()].filter((r) => r.type === 'Image').length,
      };
      const metrics = await cdp.send('Runtime.evaluate', { returnByValue: true, expression: `(() => ({
        scrollWidth: document.documentElement.scrollWidth, innerWidth: innerWidth,
        title: document.title, h1: document.querySelectorAll('h1').length,
        inlineStyles: document.querySelectorAll('[style]').length,
        inlineScripts: [...document.scripts].filter(s => !s.src && s.type !== 'application/ld+json').length,
        canonical: document.querySelector('link[rel=canonical]')?.href || null,
        brokenImages: [...document.images].filter(i => i.complete && i.loading !== 'lazy' && i.naturalWidth === 0 && !i.closest('[hidden]') && i.getClientRects().length).map(i => i.currentSrc || i.src),
        lcp: null
      }))()` });
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const name = `${vp.name}-${path.replace(/[\/.]+/g, '_').replace(/^_|_$/g, '') || 'home'}.png`;
      writeFileSync(join(outDir, name), Buffer.from(shot.data, 'base64'));
      let full = null;
      if (process.env.FULL) {
        await cdp.send('Runtime.evaluate', { awaitPromise: true, expression: `(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } })()` });
        await sleep(2000);
        full = { total: kb(sum(() => true)), images: kb(sum((r) => r.type === 'Image')), imageCount: [...reqs.values()].filter((r) => r.type === 'Image').length };
        if (process.env.FULLSHOT) {
          await cdp.send('Runtime.evaluate', { expression: 'scrollTo(0,0)' }); await sleep(300);
          const fs = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
          writeFileSync(join(outDir, 'full-' + name), Buffer.from(fs.data, 'base64'));
        }
      }
      report.push({ viewport: vp.name, path, firstView, full, ...metrics.result.value, problems });
      cdp.close();
      await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
    }
  }
} finally {
  browser.kill();
}
console.log(JSON.stringify(report, null, 1));
