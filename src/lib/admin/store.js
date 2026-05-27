import { getSql, ensureSchema } from './db';

const APARTMENT_TYPE_LABELS = {
  studio:   'Студия',
  '1room':  '1-комнатная',
  '1-room': '1-комнатная',
  '2rooms': '2-комнатная',
  '2-room': '2-комнатная',
  '3rooms': '3-комнатная',
  '3-room': '3-комнатная',
  '4plus':  '4+ комнат',
  any: 'Ещё выбираю',
  choosing: 'Ещё выбираю',
};

const BUDGET_LABELS = {
  'to-6': 'до 6 млн',
  '6-8': '6–8 млн',
  '8-10': '8–10 млн',
  '10-plus': 'от 10 млн',
  '5_to_7':  '5–7 млн',
  '7_to_10': '7–10 млн',
  '10_plus': 'от 10 млн',
};

const SOURCE_ALIASES = {
  svoydom_lugansk: 'svoydom_lugansk',
  floorplan_quiz_popup: 'svoydom_lugansk',
  main: 'svoydom_lugansk',
  noviyadres: 'noviyadres',
  landing_2: 'noviyadres',
  main_quiz: 'noviyadres',
  instant_floorplan_quiz: 'noviyadres',
};

const DOWN_PAYMENT_LABELS = {
  only_own:        'Только собственные средства',
  only_maternal:   'Материнский капитал',
  maternal_plus_own: 'Маткапитал + свои средства',
  need_advice:     'Нужна консультация',
};

function mapped(value, map) {
  const v = String(value ?? '').trim();
  return map[v] || v.replaceAll('_', ' ');
}

function buildMessage(answers) {
  if (!answers || typeof answers !== 'object') return '';
  const parts = [];
  if (answers.propertyType)    parts.push(`Тип: ${answers.propertyType}`);
  if (answers.apartmentType)   parts.push(`Планировка: ${mapped(answers.apartmentType, APARTMENT_TYPE_LABELS)}`);
  if (answers.budgetPreset)    parts.push(`Бюджет: ${mapped(answers.budgetPreset, BUDGET_LABELS)}`);
  if (answers.downPaymentType) parts.push(`Взнос: ${mapped(answers.downPaymentType, DOWN_PAYMENT_LABELS)}`);
  if (answers.telegram)        parts.push(`Telegram: ${answers.telegram}`);
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
  const name    = payload?.name  || answers?.name  || '';
  const phone   = payload?.phone || answers?.phone || '';
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
