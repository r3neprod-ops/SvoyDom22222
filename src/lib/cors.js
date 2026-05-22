const DEFAULT_ALLOWED_ORIGINS = [
  'https://r3neprod-ops-svoydom-redesign-99e5.twc1.net',
  'https://noviyadres.ru',
];

function parseAllowedOrigins() {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...fromEnv])];
}

export function getCorsHeaders(request) {
  const origin = request.headers.get('origin');
  if (!origin) return {};

  const allowedOrigins = parseAllowedOrigins();
  if (!allowedOrigins.includes(origin)) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export function jsonWithCors(request, body, init = {}) {
  const corsHeaders = getCorsHeaders(request);
  const headers = { ...corsHeaders, ...(init.headers || {}) };
  return Response.json(body, { ...init, headers });
}
