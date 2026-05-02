'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_LABELS = { new: 'Новый', in_progress: 'В работе', closed: 'Закрыт' };
const STATUS_COLORS = {
  new:         'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  closed:      'bg-green-100 text-green-700',
};
const STATUSES = ['new', 'in_progress', 'closed'];
const FILTER_OPTIONS = [
  { value: '',            label: 'Все' },
  { value: 'new',         label: 'Новые' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'closed',      label: 'Закрыты' },
];

const MSG_LABELS = {
  'Тип': {
    apartment:         'Новостройка (квартира)',
    apartment_newbuild:'Новостройка (квартира)',
    house:             'Частный дом',
    land_house:        'Участок + дом',
    'land+house':      'Участок + дом',
    plot_house:        'Участок + дом',
    consultation:      'Нужна консультация',
  },
  'Планировка': {
    studio_20_30: 'Студия 20–30 м²',
    studio_30_40: 'Студия 30–40 м²',
    one_40_55:    '1-комнатная 40–55 м²',
    '1k_40_55':   '1-комнатная 40–55 м²',
    two_55_75:    '2-комнатная 55–75 м²',
    '2k_55_65':   '2-комнатная 55–65 м²',
    three_75_100: '3-комнатная 75–100 м²',
    '3k_65_plus': '3+ комнат 65+ м²',
    four_100:     '4+ комнат от 100 м²',
  },
  'Бюджет': {
    '3_5':    '3–5 млн ₽',
    '5_7':    '5–7 млн ₽',
    '6_8':    '6–8 млн ₽',
    '7_10':   '7–10 млн ₽',
    '10_15':  '10–15 млн ₽',
    '15_plus':'от 15 млн ₽',
  },
  'Взнос': {
    matcap:      'Материнский капитал',
    mortgage:    'Ипотека',
    cash:        'Наличные',
    installment: 'Рассрочка',
  },
};

function formatMessage(message) {
  if (!message) return '—';
  return message.split(', ').map((part) => {
    const sep = part.indexOf(': ');
    if (sep === -1) return part;
    const key = part.slice(0, sep);
    const val = part.slice(sep + 2);
    const dict = MSG_LABELS[key];
    return `${key}: ${dict?.[val] ?? val}`;
  }).join(', ');
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function DashboardClient({ user }) {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifStatus, setNotifStatus] = useState('default');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifStatus(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setNotifStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotifStatus(permission);
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const keyRes = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await keyRes.json();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
      setNotifStatus('granted');
    } catch (err) {
      console.error('Push subscription error:', err);
      setNotifStatus('default');
    }
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/leads?status=${filter}` : '/api/leads';
      const res = await fetch(url);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      if (data.ok) {
        setLeads(data.leads);
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('fetchLeads error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchLeads();
  };

  const assignLead = async (id, value) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_to: value ? Number(value) : null }),
    });
    fetchLeads();
  };

  const deleteLead = async (id) => {
    if (!confirm('Удалить лид?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Лиды</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {isAdmin ? `Администратор · ${user.name}` : `Сотрудник · ${user.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={notifStatus === 'granted' ? undefined : enableNotifications}
                disabled={notifStatus === 'loading' || notifStatus === 'denied'}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  notifStatus === 'granted'
                    ? 'cursor-default border-green-200 bg-green-50 text-green-700'
                    : notifStatus === 'denied'
                    ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-600'
                    : notifStatus === 'loading'
                    ? 'cursor-wait border-slate-200 bg-white text-slate-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {notifStatus === 'granted'
                  ? 'Уведомления включены ✓'
                  : notifStatus === 'denied'
                  ? 'Уведомления заблокированы'
                  : notifStatus === 'loading'
                  ? 'Подключение...'
                  : 'Включить уведомления'}
              </button>
            )}
            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Выйти
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                filter === value
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Загрузка...</div>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center text-slate-500">Лидов нет.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="p-3">Дата</th>
                    <th className="p-3">Имя</th>
                    <th className="p-3">Телефон</th>
                    <th className="p-3">Сообщение</th>
                    <th className="p-3">Статус</th>
                    {isAdmin && <th className="p-3">Назначен</th>}
                    <th className="p-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-100 align-top">
                      <td className="whitespace-nowrap p-3 text-slate-500">{formatDate(lead.created_at)}</td>
                      <td className="p-3 font-medium">{lead.name || '—'}</td>
                      <td className="whitespace-nowrap p-3">{lead.phone || '—'}</td>
                      <td className="max-w-xs p-3 text-slate-600">{formatMessage(lead.message)}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[lead.status] ?? lead.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-3">
                          <select
                            value={lead.assigned_to ?? ''}
                            onChange={(e) => assignLead(lead.id, e.target.value || null)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                          >
                            <option value="">Не назначен</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {STATUSES.filter((s) => s !== lead.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(lead.id, s)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs transition hover:bg-slate-100"
                            >
                              → {STATUS_LABELS[s]}
                            </button>
                          ))}
                          {isAdmin && (
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
