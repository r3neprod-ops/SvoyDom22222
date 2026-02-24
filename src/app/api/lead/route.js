const REQUEST_WINDOW_MS = 60 * 1000;
const TELEGRAM_CHAT_ID = '612622372';
const ipRequestStore = new Map();

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function cleanPhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '').trim();
}

function isRateLimited(ip) {
  const now = Date.now();

  for (const [key, expiresAt] of ipRequestStore.entries()) {
    if (expiresAt <= now) ipRequestStore.delete(key);
  }

  const expiresAt = ipRequestStore.get(ip);
  if (expiresAt && expiresAt > now) return true;

  ipRequestStore.set(ip, now + REQUEST_WINDOW_MS);
  return false;
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function buildTelegramText(payload) {
  const lines = ['<b>Новая заявка</b>'];

  lines.push(`Имя: ${escapeHtml(payload.name || '—')}`);
  lines.push(`Телефон: ${escapeHtml(payload.phone || '—')}`);

  if (payload.message) lines.push(`Сообщение: ${escapeHtml(payload.message)}`);

  const answers = asRecord(payload.answers);
  if (Object.keys(answers).length > 0) {
    lines.push('');
    lines.push('<b>Ответы:</b>');
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined || value === '') continue;
      lines.push(`${escapeHtml(key)}: ${escapeHtml(value)}`);
    }
  }

  if (payload.pageUrl) lines.push(`Страница: ${escapeHtml(payload.pageUrl)}`);
  lines.push(`Время: ${escapeHtml(payload.createdAt || new Date().toISOString())}`);

  const utm = asRecord(payload.utm);
  if (Object.keys(utm).length > 0) {
    const nonEmptyUtm = Object.entries(utm).filter(([, value]) => Boolean(value));
    if (nonEmptyUtm.length > 0) {
      lines.push('');
      lines.push('<b>UTM:</b>');
      for (const [key, value] of nonEmptyUtm) {
        lines.push(`${escapeHtml(key)}: ${escapeHtml(value)}`);
      }
    }
  }

  return lines.join('\n');
}

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload || typeof payload !== 'object') {
      return Response.json({ ok: false, error: 'Empty request body' }, { status: 400 });
    }

    if (payload.company && String(payload.company).trim()) {
      return Response.json({ ok: true });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return Response.json({ ok: false, error: 'Too many requests' }, { status: 429 });
    }

    const phone = cleanPhone(payload.phone);
    if (phone.replace(/\D/g, '').length < 8) {
      return Response.json({ ok: false, error: 'Invalid phone' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return Response.json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN' }, { status: 500 });
    }

    const safePayload = {
      ...payload,
      phone,
      name: payload.name || '',
      answers: asRecord(payload.answers),
      utm: asRecord(payload.utm),
    };

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: buildTelegramText(safePayload),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!telegramResponse.ok) {
      const telegramErrorText = await telegramResponse.text();
      console.error('Telegram API error:', telegramErrorText);
      return Response.json({ ok: false, error: 'Telegram error', telegram: telegramErrorText }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Lead API error:', error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
