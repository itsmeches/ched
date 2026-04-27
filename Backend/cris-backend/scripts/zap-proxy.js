import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { URL } from 'node:url';

const HOST = '127.0.0.1';
const PORT = 8000;
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 8001;
const PUBLIC_DIR = path.resolve('public');

const MIME_TYPES = {
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.map': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.html': 'text/html; charset=UTF-8',
};

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.removeHeader('X-Powered-By');
}

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404;
      setSecurityHeaders(res);
      res.end('Not Found');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', String(stat.size));
    setSecurityHeaders(res);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.statusCode = 500;
      setSecurityHeaders(res);
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
}

function proxyToBackend(req, res) {
  const options = {
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    method: req.method,
    path: req.url,
    headers: { ...req.headers },
  };

  delete options.headers.host;

  const backendReq = http.request(options, (backendRes) => {
    res.statusCode = backendRes.statusCode || 502;

    for (const [key, value] of Object.entries(backendRes.headers)) {
      if (key.toLowerCase() === 'x-powered-by') {
        continue;
      }
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    }

    setSecurityHeaders(res);
    backendRes.pipe(res);
  });

  backendReq.on('error', () => {
    res.statusCode = 502;
    setSecurityHeaders(res);
    res.end('Bad Gateway: backend server not reachable');
  });

  req.pipe(backendReq);
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const normalized = path.normalize(decodeURIComponent(parsed.pathname)).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, normalized);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      serveStatic(req, res, filePath);
      return;
    }

    proxyToBackend(req, res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`ZAP proxy listening on http://${HOST}:${PORT}`);
  console.log(`Proxying dynamic requests to http://${BACKEND_HOST}:${BACKEND_PORT}`);
});
