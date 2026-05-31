const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = process.cwd();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function sendResponse(res, status, body, contentType) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendResponse(res, 404, 'Not found', 'text/plain; charset=utf-8');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    sendResponse(res, 200, data, contentType);
  });
}

function handleRequest(req, res) {
  const requestedPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  let relativePath = requestedPath === '/' ? '/snooze.html' : requestedPath;
  relativePath = decodeURIComponent(relativePath);

  const safePath = path.normalize(path.join(ROOT, relativePath));
  if (!safePath.startsWith(ROOT)) {
    sendResponse(res, 400, 'Bad request', 'text/plain; charset=utf-8');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendResponse(res, 404, 'Not found', 'text/plain; charset=utf-8');
      return;
    }
    sendFile(res, safePath);
  });
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/`);
});
