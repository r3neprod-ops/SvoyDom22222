import { getDb } from './db';

function buildMessage(answers) {
  if (!answers || typeof answers !== 'object') return '';
  const parts = [];
  if (answers.propertyType)    parts.push(`Тип: ${answers.propertyType}`);
  if (answers.apartmentType)   parts.push(`Планировка: ${answers.apartmentType}`);
  if (answers.budgetPreset)    parts.push(`Бюджет: ${answers.budgetPreset}`);
  if (answers.downPaymentType) parts.push(`Взнос: ${answers.downPaymentType}`);
  if (answers.telegram)        parts.push(`Telegram: ${answers.telegram}`);
  return parts.join(', ');
}

export function addLead(payload) {
  const db = getDb();
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  const name    = payload?.name  || answers?.name  || '';
  const phone   = payload?.phone || answers?.phone || '';
  const message = buildMessage(answers);

  const result = db.prepare(
    'INSERT INTO leads (name, phone, message, status) VALUES (?, ?, ?, ?)'
  ).run(name, phone, message, 'new');

  return { id: result.lastInsertRowid, name, phone, message, status: 'new' };
}

export function getLeads() {
  const db = getDb();
  return db.prepare(`
    SELECT l.*, u.name AS assigned_to_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    ORDER BY l.created_at DESC
  `).all();
}
