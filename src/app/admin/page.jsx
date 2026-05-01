import { readDb } from '@/lib/admin/store';

export default function AdminPage() {
  const db = readDb();
  const leads = [...(db.leads || [])].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <main style={{ padding: '24px', background: '#fff', minHeight: '100vh', color: '#111' }}>
      <h1 style={{ marginBottom: '8px' }}>Админ-панель</h1>
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Лиды</h2>

      {leads.length === 0 ? (
        <p>Пока лидов нет</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Дата и время</th>
                <th style={thStyle}>Имя</th>
                <th style={thStyle}>Телефон</th>
                <th style={thStyle}>Данные формы</th>
                <th style={thStyle}>Источник</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={tdStyle}>{lead.id ?? '—'}</td>
                  <td style={tdStyle}>{lead.created_at || '—'}</td>
                  <td style={tdStyle}>{lead.name || '—'}</td>
                  <td style={tdStyle}>{lead.phone || '—'}</td>
                  <td style={tdStyle}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(lead.form_data_json || {}, null, 2)}</pre>
                  </td>
                  <td style={tdStyle}>{lead.source_page || 'site-form'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const thStyle = {
  border: '1px solid #ddd',
  textAlign: 'left',
  padding: '10px',
  background: '#f6f6f6',
};

const tdStyle = {
  border: '1px solid #ddd',
  textAlign: 'left',
  padding: '10px',
  verticalAlign: 'top',
};
