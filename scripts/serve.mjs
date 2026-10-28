// Aperçu local : npm run dev -> http://localhost:${process.env.PORT || 8090}
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.join(import.meta.dirname, '..', 'public'), types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404).end('404'); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 8090, () => console.log(`http://localhost:${process.env.PORT || 8090}`));
