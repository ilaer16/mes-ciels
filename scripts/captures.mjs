// Vignettes des outils web : capture d'écran de chaque outil sans vignette, via Edge (protocole DevTools).
// Usage local : npm run captures   (puis commit + push). Ferme la fenêtre d'accueil et charge la démo si l'outil en a une.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if (!EDGE) throw new Error('Edge introuvable');
const resources = JSON.parse(fs.readFileSync('resources.json', 'utf8'));
const todo = resources.filter(r => r.format === 'outil' && !r.vignette && /^https?:/.test(r.url));
if (!todo.length) { console.log('Aucun outil sans vignette.'); process.exit(0); }

const port = 9333, profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ciels-'));
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) { await sleep(250); target = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json()).then(l => l.find(t => t.type === 'page')).catch(() => null); }
if (!target) { edge.kill(); throw new Error('Edge ne répond pas'); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let n = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); pending.get(m.id)?.(m); pending.delete(m.id); });
const cdp = (method, params = {}) => new Promise((ok, ko) => { const id = ++n; pending.set(id, m => m.error ? ko(new Error(m.error.message)) : ok(m.result)); ws.send(JSON.stringify({ id, method, params })); });
const clickText = re => cdp('Runtime.evaluate', { expression: `(() => { const b = [...document.querySelectorAll('button, a')].find(b => ${re}.test(b.textContent.trim())); b?.click(); return !!b; })()`, returnByValue: true });

await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
try {
  for (const r of todo) {
    await cdp('Page.navigate', { url: r.url });
    await sleep(3500);
    await clickText('/^(passer|fermer|ignorer|skip|×)$/i');           // fenêtre d'accueil
    await sleep(500);
    await clickText('/charger la d[ée]mo|voir la d[ée]mo|^d[ée]mo$/i'); // données de démonstration, si l'outil en a
    await sleep(2500);
    await clickText('/^(passer|fermer|ignorer|skip|×)$/i');           // accueil ouvert après la démo
    // dernier recours : retirer tout calque fixe qui couvre l'écran (fenêtre d'accueil sans bouton « passer »)
    await cdp('Runtime.evaluate', { expression: `for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e), r = e.getBoundingClientRect();
      if (s.position === 'fixed' && r.width > innerWidth * .6 && r.height > innerHeight * .6) e.remove(); }
      document.body.style.overflow = ''; document.documentElement.style.overflow = '';` });
    await sleep(800);
    const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    const name = 'files/outil-' + new URL(r.url).hostname.split('.')[0] + '.jpg';
    fs.writeFileSync('public/' + name, Buffer.from(data, 'base64'));
    r.vignette = name;
    console.log('✓', r.titre, '->', name);
  }
} finally { ws.close(); edge.kill(); }
fs.writeFileSync('resources.json', JSON.stringify(resources, null, 2) + '\n');
