const http = require('http');
const next = require('next');

const port = Number(process.env.PORT || 3000);
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let ready = false;

function sendOk(response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end('{"ok":true}');
}

const server = http.createServer(async (request, response) => {
  const url = request.url || '/';
  const isHealthPath = url === '/health' || url.startsWith('/health?') || url === '/api/health' || url.startsWith('/api/health?');
  const isRoot = url === '/' || url.startsWith('/?');

  if (isHealthPath || request.method === 'HEAD') {
    sendOk(response);
    return;
  }

  if (!ready && isRoot) {
    sendOk(response);
    return;
  }

  if (!ready) {
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end('Starting');
    return;
  }

  try {
    await handle(request, response);
  } catch (error) {
    console.error('[server] request failed:', error);
    response.statusCode = 500;
    response.end('Internal Server Error');
  }
});

server.listen(port, hostname, () => {
  console.log(`[server] listening on http://${hostname}:${port}`);
});

app
  .prepare()
  .then(() => {
    ready = true;
    console.log('[server] Next.js is ready');
  })
  .catch((error) => {
    console.error('[server] Next.js failed to prepare:', error);
    setTimeout(() => process.exit(1), 1000);
  });
