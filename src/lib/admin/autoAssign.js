import { getSql } from './db';

export async function autoAssignLead(leadId) {
  const sql = getSql();

  // Find active employee with fewest active leads, tiebreak by last_assigned_at (oldest first)
  const [employee] = await sql`
    SELECT u.id,
           COUNT(l.id) FILTER (WHERE l.status IN ('new', 'in_progress')) AS active_leads
    FROM users u
    LEFT JOIN leads l ON l.assigned_to = u.id
    WHERE u.role = 'employee' AND u.is_active = true
    GROUP BY u.id, u.last_assigned_at
    ORDER BY active_leads ASC, u.last_assigned_at ASC NULLS FIRST
    LIMIT 1
  `;

  if (!employee) return null;

  await sql`
    UPDATE leads SET assigned_to = ${employee.id} WHERE id = ${leadId}
  `;

  await sql`
    UPDATE users SET
      leads_count = leads_count + 1,
      last_assigned_at = NOW()
    WHERE id = ${employee.id}
  `;

  return employee.id;
}
