const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 5173;
const DIST = path.join(__dirname, 'dist');

const mime = {
  '.html' : 'text/html; charset=utf-8',
  '.js'   : 'application/javascript',
  '.css'  : 'text/css',
  '.svg'  : 'image/svg+xml',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.ico'  : 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff' : 'font/woff',
  '.ttf'  : 'font/ttf',
};

http.createServer((req, res) => {
  let urlPath  = req.url.split('?')[0];
  let filePath = path.join(DIST, urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const contentType = mime[path.extname(filePath)] || 'application/octet-stream';

  try {
    const isHtml = path.extname(filePath) === '.html';
    const headers = {
      'Content-Type': contentType,
      ...(isHtml
        ? { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
        : { 'Cache-Control': 'public, max-age=31536000, immutable' })
    };
    res.writeHead(200, headers);
    res.end(fs.readFileSync(filePath));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }

}).listen(PORT, '127.0.0.1', () => {
  console.log('\n  K-Magic Prompt - Movies a correr em http://localhost:' + PORT);
  console.log('  Fecha esta janela para parar.\n');
});
