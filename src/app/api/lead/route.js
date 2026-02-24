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

  if (payload.message) lines.push(`Сообщение: ${escapeHtml(payload.message)}`);

  return lines.join('\n');
}

function validatePhone(rawPhone) {
  const phone = String(rawPhone ?? '').trim();
  if (!phone) {
    return {
      ok: false,
      status: 400,
      body: {
        ok: false,
        code: 'MISSING_PHONE',
        message: 'Укажите номер телефона (можно с +7).',
      },
    };
  }

  if (/\p{L}/u.test(phone)) {
    return {
      ok: false,
      status: 400,
      body: {
        ok: false,
        code: 'INVALID_PHONE',
        message: 'Некорректный номер. Используйте цифры, +, пробелы, скобки или дефисы.',
      },
    };
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return {
      ok: false,
      status: 400,
      body: {
        ok: false,
        code: 'INVALID_PHONE',
        message: 'Номер слишком короткий. Пример: +7 999 000-00-00',
      },
    };
  }

  return { ok: true, phone, phoneDigits };
}

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload || typeof payload !== 'object') {
      return Response.json({ ok: false, code: 'BAD_REQUEST', message: 'Пустой запрос.' }, { status: 400 });
    }

    if (payload.company && String(payload.company).trim()) {
      return Response.json({ ok: true });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return Response.json({ ok: false, code: 'RATE_LIMIT', message: 'Слишком много запросов. Попробуйте чуть позже.' }, { status: 429 });
    }

    const phoneValidation = validatePhone(payload.phone);
    if (!phoneValidation.ok) {
      return Response.json(phoneValidation.body, { status: phoneValidation.status });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return Response.json({ ok: false, code: 'MISSING_TELEGRAM_TOKEN', message: 'Missing TELEGRAM_BOT_TOKEN' }, { status: 500 });
    }

    const safePayload = {
      ...payload,
      phone: phoneValidation.phone,
      answers: asRecord(payload.answers),
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
      let telegramBody = null;
      try {
        telegramBody = await telegramResponse.json();
      } catch {
        telegramBody = { text: await telegramResponse.text() };
      }
      console.error('Telegram API error:', telegramBody);
      return Response.json(
        {
          ok: false,
          code: 'TELEGRAM_ERROR',
          message: 'Не удалось отправить. Попробуйте ещё раз.',
          telegram: telegramBody,
        },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Lead API error:', error);
    return Response.json(
      {
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Не удалось отправить. Попробуйте ещё раз.',
      },
      { status: 500 }
    );
  }
}
