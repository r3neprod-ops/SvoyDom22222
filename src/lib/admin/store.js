import { getSql, ensureSchema } from './db';

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

function mapped(value, map) {
  const v = String(value ?? '').trim();
  return map[v] || v.replaceAll('_', ' ');
}

function buildMessage(answers) {
  if (!answers || typeof answers !== 'object') return '';
  const parts = [];
  if (answers.propertyType) parts.push(`Тип: ${answers.propertyType}`);
  if (answers.apartmentType) parts.push(`Планировка: ${mapped(answers.apartmentType, APARTMENT_TYPE_LABELS)}`);
  if (answers.budgetPreset) parts.push(`Бюджет: ${mapped(answers.budgetPreset, BUDGET_LABELS)}`);
  if (answers.downPaymentType) parts.push(`Взнос: ${mapped(answers.downPaymentType, DOWN_PAYMENT_LABELS)}`);
  if (answers.monthlyPayment) parts.push(`Платёж: ${mapped(answers.monthlyPayment, MONTHLY_PAYMENT_LABELS)}`);
  if (Array.isArray(answers.matchedPlans) && answers.matchedPlans.length) {
    parts.push(`Планировки: ${answers.matchedPlans.slice(0, 4).map((plan) => plan.title || plan.caption || plan.id).filter(Boolean).join('; ')}`);
  }
  if (answers.telegram) parts.push(`Telegram: ${answers.telegram}`);
  return parts.join(', ');
}

function normalizeLeadSource(payload) {
  const rawSource = String(payload?.source ?? '').trim();
  if (rawSource) return SOURCE_ALIASES[rawSource] || rawSource;

  const pageUrl = String(payload?.pageUrl ?? '').toLowerCase();
  if (pageUrl.includes('noviy-adres') || pageUrl.includes('noviyadres')) return 'noviyadres';
  if (pageUrl.includes('svoydom')) return 'svoydom_lugansk';

  return null;
}

export async function addLead(payload) {
  await ensureSchema();
  const sql = getSql();
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  const name = payload?.name || answers?.name || '';
  const phone = payload?.phone || answers?.phone || '';
  const message = buildMessage(answers);
  const source = normalizeLeadSource(payload);

  const [row] = await sql`
    INSERT INTO leads (name, phone, message, status, source)
    VALUES (${name}, ${phone}, ${message}, 'new', ${source})
    RETURNING id
  `;

  return { id: row.id, name, phone, message, status: 'new', source };
}

export async function getLeads() {
  await ensureSchema();
  const sql = getSql();
  return sql`
    SELECT l.*, u.name AS assigned_to_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    ORDER BY l.created_at DESC
  `;
}
