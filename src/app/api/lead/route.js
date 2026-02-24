const REQUEST_WINDOW_MS = 60 * 1000;
const TELEGRAM_CHAT_ID = '612622372';
const ipRequestStore = new Map();

const PROPERTY_TYPE_LABELS = {
  apartment: 'Новостройка (квартира)',
  apartment_newbuild: 'Новостройка (квартира)',
  house: 'Частный дом',
  land_house: 'Участок + дом',
  'land+house': 'Участок + дом',
  plot_house: 'Участок + дом',
  consultation: 'Нужна консультация',
};

const APARTMENT_TYPE_LABELS = {
  studio_20_30: 'Студия (20–30 м²)',
  '1k_40_55': '1-комнатная (40–55 м²)',
  '2k_55_65': '2-комнатная (55–65 м²)',
  '3k_65_plus': '3+ комнат (65+ м²)',
  dont_know: 'Пока не знаю',
};

const TIMELINE_LABELS = {
  urgent_1_2w: 'Срочно (1–2 недели)',
  '1_2m': 'В течение 1–2 месяцев',
  '3_6m': 'В течение 3–6 месяцев',
  no_hurry: 'Не спешу',
  just_looking: 'Просто прицениваюсь',
};

const DOWN_PAYMENT_LABELS = {
  matcap: 'Маткапитал',
  own: 'Свои средства',
  matcap_plus_own: 'Маткапитал + свои средства',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function humanizeFallback(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.replaceAll('_', ' ');
}

function formatBudget(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const mapped = {
    '4_6': '4–6 млн ₽',
    '6_8': '6–8 млн ₽',
    '8_10': '8–10 млн ₽',
    '10_plus': '10+ млн ₽',
    custom: 'Свой вариант',
  };

  if (mapped[raw]) return mapped[raw];

  const normalized = raw.replace(',', '.');
  if (/^\d+(?:\.\d+)?_\d+(?:\.\d+)?$/.test(normalized)) {
    const [from, to] = normalized.split('_');
    return `${from}–${to} млн ₽`;
  }
  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    return `${normalized} млн ₽`;
  }

  return humanizeFallback(raw);
}

function mappedAnswer(value, map) {
  if (value === null || value === undefined || value === '') return '';
  const normalized = String(value).trim();
  return map[normalized] || humanizeFallback(normalized);
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
  const lines = ['🆕 <b>Новая заявка</b>'];

  lines.push(`Имя: ${escapeHtml(payload.name || '—')}`);
  lines.push(`Телефон: ${escapeHtml(payload.phone || '—')}`);

  const answers = asRecord(payload.answers);
  const formattedAnswers = [
    ['Что вы хотите выбрать?', mappedAnswer(answers.propertyType, PROPERTY_TYPE_LABELS)],
    ['Какой вариант вы рассматриваете?', mappedAnswer(answers.apartmentType, APARTMENT_TYPE_LABELS)],
    ['Насколько срочно нужна консультация?', mappedAnswer(answers.timeline, TIMELINE_LABELS)],
    ['На какой бюджет ориентируетесь?', formatBudget(answers.budgetPreset) || humanizeFallback(answers.budgetCustom)],
    ['Первоначальный взнос:', mappedAnswer(answers.downPaymentType, DOWN_PAYMENT_LABELS)],
  ].filter(([, answer]) => Boolean(answer));

  if (formattedAnswers.length > 0) {
    lines.push('');
    lines.push('<b>Ответы:</b>');
    for (const [question, answer] of formattedAnswers) {
      lines.push(`<b>${escapeHtml(question)}</b> ${escapeHtml(answer)}`);
    }
  }

  if (payload.pageUrl) lines.push(`Страница: ${escapeHtml(payload.pageUrl)}`);
  lines.push(`Время: ${escapeHtml(payload.createdAt || new Date().toISOString())}`);

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
