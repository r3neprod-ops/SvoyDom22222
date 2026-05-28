import { revalidateTag } from 'next/cache';
import { addLead } from '@/lib/admin/store';
import { sendPushToAll } from '@/lib/admin/push';
import { autoAssignLead } from '@/lib/admin/autoAssign';
import { getSql } from '@/lib/admin/db';
import { getCorsHeaders, jsonWithCors } from '@/lib/cors';

const DEDUPE_WINDOW_MS = 30 * 1000;
const recentLeadStore = new Map();

const SOURCE_ALIASES = {
  svoydom_lugansk: 'svoydom_lugansk',
  floorplan_quiz_popup: 'svoydom_lugansk',
  unlock_layouts: 'svoydom_lugansk',
  main: 'svoydom_lugansk',
  noviyadres: 'noviyadres',
  landing_2: 'noviyadres',
  main_quiz: 'noviyadres',
  instant_floorplan_quiz: 'noviyadres',
};

const SOURCE_LABELS = {
  svoydom_lugansk: 'СвойДом Луганск',
  noviyadres: 'Новый Адрес',
};

const APARTMENT_TYPE_LABELS = {
  studio: 'Студия',
  '1room': 'Однокомнатная квартира',
  '1-room': 'Однокомнатная квартира',
  '2rooms': 'Двухкомнатная квартира',
  '2-room': 'Двухкомнатная квартира',
  '3rooms': 'Трёхкомнатная квартира',
  '3-room': 'Трёхкомнатная квартира',
  '4plus': 'Четырёхкомнатная квартира или больше',
  any: 'Пока не знаю, нужна консультация',
  choosing: 'Пока не знаю, нужна консультация',
};

const BUDGET_LABELS = {
  'to-6': 'до 6 млн',
  '6-8': '6–8 млн',
  '8-10': '8–10 млн',
  '10-plus': 'от 10 млн',
  '5_to_7': '5–7 млн',
  '7_to_10': '7–10 млн',
  '10_plus': 'от 10 млн',
};

const PRIORITY_LABELS = {
  price: 'Цена и выгодные условия',
  location: 'Локация / транспорт',
  quality: 'Новый дом и качество строительства',
  infrastructure: 'Инфраструктура (школы/сад/магазины)',
  layout: 'Планировка и метраж',
  investment: 'Для инвестиций (рост цены / аренда)',
};

const PURCHASE_METHOD_LABELS = {
  cash: 'Наличные',
  mortgage: 'Ипотека',
  need_consultation: 'Ещё не решил(а), нужна консультация',
};

const DOWN_PAYMENT_LABELS = {
  only_own: 'Только свои средства',
  only_maternal: 'Материнский капитал',
  maternal_plus_own: 'Материнский капитал и свои средства',
  no_down_payment: 'Хочу узнать, можно ли без первоначального взноса',
  need_advice: 'Пока не знаю',
};

const MONTHLY_PAYMENT_LABELS = {
  up_to_20: 'До 20 000 ₽',
  '20_to_30': '20 000–30 000 ₽',
  '30_to_40': '30 000–40 000 ₽',
  over_40: 'Больше 40 000 ₽',
  payment_consultation: 'Пока не знаю, нужна консультация',
};

function humanizeFallback(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.replaceAll('_', ' ');
}

function formatRubles(amount) {
  if (amount == null) return null;
  const digits = String(amount).replace(/\D/g, '');
  if (!digits) return null;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}

function mappedAnswer(value, map) {
  if (value === null || value === undefined || value === '') return '';
  const normalized = String(value).trim();
  return map[normalized] || humanizeFallback(normalized);
}

function normalizeLeadSource(payload) {
  const rawSource = String(payload?.source ?? '').trim();
  if (rawSource) return SOURCE_ALIASES[rawSource] || rawSource;

  const pageUrl = String(payload?.pageUrl ?? '').toLowerCase();
  if (pageUrl.includes('noviy-adres') || pageUrl.includes('noviyadres')) return 'noviyadres';
  if (pageUrl.includes('svoydom')) return 'svoydom_lugansk';

  return '';
}

function getSourceLabel(source) {
  if (!source) return 'Не указан';
  return SOURCE_LABELS[source] || source;
}

function formatMatchedPlans(value) {
  if (!Array.isArray(value) || value.length === 0) return [];

  const rows = value
    .slice(0, 4)
    .map((plan, index) => {
      if (!plan || typeof plan !== 'object') return '';
      const title = plan.title || plan.caption || 'Планировка';
      const complex = plan.complex ? `ЖК ${plan.complex}` : 'ЖК не указан';
      const area = plan.area ? `${plan.area} м²` : '';
      const price = plan.price || '';
      const source = plan.source ? ` (${plan.source})` : '';

      return `${index + 1}. ${complex}: ${title}${area ? `, ${area}` : ''}${price ? `, ${price}` : ''}${source}`;
    })
    .filter(Boolean);

  if (rows.length === 0) return [];
  return ['Подобранные планировки:', ...rows];
}

function makeDedupKey(phoneDigits, answers) {
  const normalizedAnswers = Object.keys(answers || {})
    .sort()
    .reduce((acc, key) => {
      const value = answers[key];
      if (value === null || value === undefined || value === '') return acc;
      acc[key] = String(value);
      return acc;
    }, {});

  return `${phoneDigits}|${JSON.stringify(normalizedAnswers)}`;
}

function isDuplicateLead(key) {
  const now = Date.now();

  for (const [storedKey, expiresAt] of recentLeadStore.entries()) {
    if (expiresAt <= now) recentLeadStore.delete(storedKey);
  }

  const expiresAt = recentLeadStore.get(key);
  if (expiresAt && expiresAt > now) return true;

  recentLeadStore.set(key, now + DEDUPE_WINDOW_MS);
  return false;
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
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

async function sendToBitrix24(payload) {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
  console.log('[Bitrix] URL configured:', !!webhookUrl);
  if (!webhookUrl) return;

  const finalUrl = webhookUrl.replace(/\/+$/, '') + '/crm.lead.add.json';
  console.log('[Bitrix] Final URL:', finalUrl);

  const answers = asRecord(payload.answers);
  const sourceLabel = getSourceLabel(payload.source);
  const bitrixPayload = {
    fields: {
      TITLE: `[${sourceLabel}] Заявка: ${payload.name || '—'} ${payload.phone || '—'}`,
      NAME: `${payload.name || ''} (${sourceLabel})`,
      PHONE: [{ VALUE: payload.phone || '', VALUE_TYPE: 'WORK' }],
      COMMENTS: [
        `Лендинг: ${sourceLabel}`,
        answers.formSection && `Форма: ${humanizeFallback(answers.formSection)}`,
        answers.consultationFromBudget && '⚠️ Запрос на консультацию: бюджет не соответствует желаемому метражу',
        answers.apartmentType && `Тип квартиры: ${mappedAnswer(answers.apartmentType, APARTMENT_TYPE_LABELS)}`,
        answers.budgetPreset && `Бюджет: ${mappedAnswer(answers.budgetPreset, BUDGET_LABELS)}`,
        answers.priority && `Приоритет: ${mappedAnswer(answers.priority, PRIORITY_LABELS)}`,
        answers.purchaseMethod && `Способ покупки: ${mappedAnswer(answers.purchaseMethod, PURCHASE_METHOD_LABELS)}`,
        answers.cashAmount && `Сумма наличными: ${formatRubles(answers.cashAmount)}`,
        answers.downPaymentType && `Первоначальный взнос: ${mappedAnswer(answers.downPaymentType, DOWN_PAYMENT_LABELS)}`,
        answers.ownFundsAmount && `Собственные средства на взнос: ${formatRubles(answers.ownFundsAmount)}`,
        answers.monthlyPayment && `Комфортный платёж: ${mappedAnswer(answers.monthlyPayment, MONTHLY_PAYMENT_LABELS)}`,
        answers.telegram && `Telegram: ${answers.telegram}`,
        ...formatMatchedPlans(answers.matchedPlans),
        payload.pageUrl && `Страница: ${payload.pageUrl}`,
      ]
        .filter(Boolean)
        .join('\n'),
      SOURCE_ID: 'WEB',
      SOURCE_DESCRIPTION: `Лид с сайта: ${sourceLabel}`,
    },
    params: { REGISTER_SONET_EVENT: 'Y' },
  };

  console.log('[Bitrix] Payload:', JSON.stringify(bitrixPayload));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bitrixPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('[Bitrix] Status:', response.status);
    console.log('[Bitrix] Response:', await response.text());
  } catch (error) {
    console.error('[Bitrix] Error:', error.message);
  }
}

export async function OPTIONS(request) {
  const corsHeaders = getCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('[Lead] Request received at:', new Date().toISOString());

  try {
    const payload = await request.json();

    if (!payload || typeof payload !== 'object') {
      return jsonWithCors(request, { ok: false, code: 'BAD_REQUEST', message: 'Пустой запрос.' }, { status: 400 });
    }

    if (payload.company && String(payload.company).trim()) {
      return jsonWithCors(request, { ok: true });
    }

    console.log('[Lead] Step: validation');
    const phoneValidation = validatePhone(payload.phone);
    if (!phoneValidation.ok) {
      return jsonWithCors(request, phoneValidation.body, { status: phoneValidation.status });
    }

    if (payload.privacyConsent !== true) {
      return jsonWithCors(
        request,
        {
          ok: false,
          code: 'MISSING_PRIVACY_CONSENT',
          message: 'Необходимо согласие на обработку персональных данных.',
        },
        { status: 400 }
      );
    }

    const safePayload = {
      ...payload,
      phone: phoneValidation.phone,
      source: normalizeLeadSource(payload),
      privacyConsent: payload.privacyConsent === true,
      answers: asRecord(payload.answers),
    };

    console.log('[Lead] Step: dedup');
    const dedupeKey = makeDedupKey(phoneValidation.phoneDigits, safePayload.answers);
    if (isDuplicateLead(dedupeKey)) {
      console.log('[Lead] Duplicate detected, skipping bitrix:', dedupeKey);
      return jsonWithCors(request, { ok: true, deduped: true });
    }

    console.log('[Lead] Step: db');
    let leadId = null;
    try {
      const lead = await addLead(safePayload);
      leadId = lead.id;
      try {
        const sql = getSql();
        const [setting] = await sql`SELECT value FROM settings WHERE key = 'auto_assign'`;
        if (setting?.value === 'true') {
          await autoAssignLead(leadId);
        }
      } catch (assignErr) {
        console.error('Auto-assign error:', assignErr);
      }
      revalidateTag('leads');
      sendPushToAll({
        title: 'Новый лид!',
        body: `Имя: ${safePayload.name || '—'}, Телефон: ${safePayload.phone || '—'}`,
      }).catch((err) => console.error('Push notification error:', err));
    } catch (dbError) {
      console.error('Lead DB save error:', dbError);
      return jsonWithCors(
        request,
        { ok: false, code: 'DB_ERROR', message: 'Не удалось сохранить заявку. Попробуйте ещё раз.' },
        { status: 500 }
      );
    }

    console.log('[Lead] Step: bitrix');
    await sendToBitrix24(safePayload);

    console.log('[Lead] Completed in', Date.now() - startTime, 'ms');
    return jsonWithCors(request, { success: true, leadId });
  } catch (error) {
    console.error('Lead API error:', error);
    return jsonWithCors(
      request,
      {
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Не удалось отправить. Попробуйте ещё раз.',
      },
      { status: 500 }
    );
  }
}
