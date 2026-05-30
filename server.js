const http = require('http');
const { spawn } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

const publicPort = Number(process.env.PORT || 3000);
const publicHost = '0.0.0.0';
const nextHost = '127.0.0.1';
const nextPort = Number(process.env.NEXT_INTERNAL_PORT || publicPort + 1);

let nextProcess = null;
let nextReady = false;
let shuttingDown = false;

function sendOk(response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end('{"ok":true}');
}

function sendStarting(response) {
  response.statusCode = 503;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end('Starting');
}

function isHealthPath(url) {
  return url === '/health' || url.startsWith('/health?') || url === '/api/health' || url.startsWith('/api/health?');
}

function isRootPath(url) {
  return url === '/' || url.startsWith('/?');
}

function proxyToNext(request, response) {
  const headers = { ...request.headers, host: `${nextHost}:${nextPort}` };
  const proxyRequest = http.request(
    {
      hostname: nextHost,
      port: nextPort,
      path: request.url,
      method: request.method,
      headers,
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 500, proxyResponse.headers);
      proxyResponse.pipe(response);
    }
  );

  proxyRequest.on('error', (error) => {
    console.error('[server] proxy failed:', error.message);
    if (!response.headersSent) {
      response.statusCode = nextReady ? 502 : 503;
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store');
    }
    response.end(nextReady ? 'Bad Gateway' : 'Starting');
  });

  request.pipe(proxyRequest);
}

const server = http.createServer((request, response) => {
  const url = request.url || '/';

  if (isHealthPath(url) || request.method === 'HEAD') {
    sendOk(response);
    return;
  }

  if (!nextReady) {
    if (isRootPath(url)) {
      sendOk(response);
      return;
    }

    sendStarting(response);
    return;
  }

  proxyToNext(request, response);
});

function waitForNextReady() {
  const check = http.request(
    {
      hostname: nextHost,
      port: nextPort,
      path: '/health',
      method: 'GET',
      timeout: 1000,
    },
    (response) => {
      response.resume();
      if (response.statusCode && response.statusCode < 500) {
        nextReady = true;
        console.log(`[server] Next.js is ready on http://${nextHost}:${nextPort}`);
        return;
      }
      setTimeout(waitForNextReady, 1000);
    }
  );

  check.on('timeout', () => check.destroy());
  check.on('error', () => {
    if (!shuttingDown) {
      setTimeout(waitForNextReady, 1000);
    }
  });
  check.end();
}

function startNext() {
  const nextBin = require.resolve('next/dist/bin/next');
  nextProcess = spawn(process.execPath, [nextBin, 'start', '-H', nextHost, '-p', String(nextPort)], {
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      PORT: String(nextPort),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  nextProcess.stdout.on('data', (data) => process.stdout.write(`[next] ${data}`));
  nextProcess.stderr.on('data', (data) => process.stderr.write(`[next] ${data}`));
  nextProcess.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[server] Next.js exited: code=${code} signal=${signal || ''}`);
    process.exit(code || 1);
  });

  waitForNextReady();
}

function shutdown() {
  shuttingDown = true;
  if (nextProcess && !nextProcess.killed) {
    nextProcess.kill('SIGTERM');
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(publicPort, publicHost, () => {
  console.log(`[server] listening on http://${publicHost}:${publicPort}`);
  startNext();
});
