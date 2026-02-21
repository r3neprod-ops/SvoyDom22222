'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import {
  budgetOptions,
  finishOptions,
  layoutOptions,
  zoneOptions,
} from '@/data/formOptions';

const stepTitles = [
  'Давайте определим вашу зону интереса',
  'Какой вариант вы рассматриваете?',
  'Давайте определимся по бюджету',
  'Поговорим об отделке внутри',
  'Первоначальный взнос',
  'Оставьте контакты — пришлю подборку',
];

const downPaymentOptions = [
  { label: 'Маткапитал', value: 'matcap' },
  { label: 'Маткапитал + собственные средства', value: 'matcap_plus_own' },
  { label: 'Собственные средства', value: 'own' },
];

const initialState = {
  zone: '',
  layout: '',
  budget: '',
  customBudget: '',
  finish: '',
  downPaymentType: '',
  downPaymentOwnAmount: '',
  name: '',
  phone: '',
  telegram: '',
};

export default function LeadFormSection() {
  const [form, setForm] = useState(initialState);
  const [open, setOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [done, setDone] = useState(false);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    const flag = sessionStorage.getItem('leadModalClosed');
    if (!flag) setOpen(true);
  }, []);

  const step = open ? modalStep : 1;

  const progress = useMemo(() => {
    if (done) return 100;
    const percent = Math.round((modalStep / stepTitles.length) * 100);
    return Math.min(100, Math.max(0, percent));
  }, [done, modalStep]);

  const closeModal = () => {
    sessionStorage.setItem('leadModalClosed', '1');
    setOpen(false);
  };

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setDownPaymentType = (value) => {
    setForm((prev) => ({
      ...prev,
      downPaymentType: value,
      downPaymentOwnAmount: value === 'matcap' ? '' : prev.downPaymentOwnAmount,
    }));
    setAmountError('');
  };

  const continueFromInline = () => {
    setModalStep(3);
    setOpen(true);
  };

  const isOwnAmountValid = () => {
    if (!form.downPaymentOwnAmount) return true;
    const amount = Number(form.downPaymentOwnAmount);
    return Number.isFinite(amount) && amount > 0;
  };

  const next = () => {
    if (modalStep === 5 && !isOwnAmountValid()) {
      setAmountError('Введите сумму больше 0 или оставьте поле пустым.');
      return;
    }
    setAmountError('');
    setModalStep((prev) => Math.min(prev + 1, stepTitles.length));
  };

  const prev = () => {
    setAmountError('');
    setModalStep((prev) => Math.max(prev - 1, 1));
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      zone: form.zone,
      layout: form.layout,
      budget: form.budget === 'Свой вариант' ? form.customBudget : form.budget,
      finish: form.finish,
      downPaymentType: form.downPaymentType || null,
      downPaymentOwnAmount: form.downPaymentOwnAmount ? Number(form.downPaymentOwnAmount) : null,
      name: form.name,
      phone: form.phone,
      telegram: form.telegram,
    };
    console.log('lead-payload', payload);
    setDone(true);
  };

  const showOwnAmount = form.downPaymentType === 'matcap_plus_own' || form.downPaymentType === 'own';

  return (
    <>
      <section id="lead-form" className="py-12 md:py-16">
        <Container>
          <Card className="reveal rounded-[22px] border-[rgba(17,24,39,0.10)] bg-[rgba(255,255,255,0.62)] p-7 shadow-[0_18px_50px_rgba(17,24,39,0.10)] [backdrop-filter:blur(14px)_saturate(120%)] transition-colors duration-200 hover:border-[rgba(17,24,39,0.14)] hover:shadow-[0_22px_58px_rgba(17,24,39,0.12)] md:p-10">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[rgba(17,24,39,0.55)]">Короткая заявка</p>
            <h2 className="text-3xl tracking-tight leading-[1.1] text-[#111827] md:text-4xl">Подобрать варианты</h2>
            <p className="mt-3 max-w-2xl text-[rgba(17,24,39,0.70)]">Ответьте на 2 коротких вопроса, а остальное заполним в удобном окне.</p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <InlineChoice title={stepTitles[0]} options={zoneOptions} value={form.zone} onSelect={(value) => setValue('zone', value)} />
              <InlineChoice title={stepTitles[1]} options={layoutOptions} value={form.layout} onSelect={(value) => setValue('layout', value)} />
            </div>

            <div className="mt-8">
              <Button onClick={continueFromInline} disabled={!form.zone || !form.layout}>Продолжить подбор</Button>
            </div>
          </Card>
        </Container>
      </section>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadowHover)] md:p-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">Получить подборку</p>
                <h3 className="text-2xl tracking-tight">{done ? 'Спасибо!' : stepTitles[step - 1]}</h3>
              </div>
              <button type="button" className="focus-ring rounded-lg px-2 py-1 text-sm" onClick={closeModal}>Закрыть</button>
            </div>

            <div className="mb-6 w-full h-2 rounded-full bg-[color:var(--bg2)] overflow-hidden">
              <div
                className="h-full max-w-full rounded-full bg-[color:var(--accent2)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {done ? (
              <div className="space-y-5">
                <p className="text-[color:var(--muted)]">Спасибо! Я свяжусь с вами и пришлю подборку.</p>
                <Button onClick={closeModal}>Отлично</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                {step === 1 && <InlineChoice options={zoneOptions} value={form.zone} onSelect={(value) => setValue('zone', value)} />}
                {step === 2 && <InlineChoice options={layoutOptions} value={form.layout} onSelect={(value) => setValue('layout', value)} />}
                {step === 3 && (
                  <div className="space-y-3">
                    <InlineChoice options={budgetOptions} value={form.budget} onSelect={(value) => setValue('budget', value)} />
                    {form.budget === 'Свой вариант' && (
                      <input
                        className="focus-ring w-full rounded-xl border border-[color:var(--border)] px-4 py-3"
                        placeholder="Введите ваш бюджет"
                        value={form.customBudget}
                        onChange={(e) => setValue('customBudget', e.target.value)}
                      />
                    )}
                  </div>
                )}
                {step === 4 && <InlineChoice options={finishOptions} value={form.finish} onSelect={(value) => setValue('finish', value)} />}
                {step === 5 && (
                  <div className="space-y-4">
                    <InlineChoice
                      options={downPaymentOptions.map((item) => item.label)}
                      value={downPaymentOptions.find((item) => item.value === form.downPaymentType)?.label || ''}
                      onSelect={(label) => {
                        const option = downPaymentOptions.find((item) => item.label === label);
                        if (option) setDownPaymentType(option.value);
                      }}
                    />
                    <p className="text-sm text-[color:var(--muted)]">Выберите, из каких средств планируете сформировать первый взнос.</p>
                    {showOwnAmount && (
                      <div className="space-y-2">
                        <input
                          className="focus-ring w-full rounded-xl border border-[color:var(--border)] px-4 py-3"
                          placeholder={
                            form.downPaymentType === 'matcap_plus_own'
                              ? 'Сколько собственных средств планируете внести? (₽)'
                              : 'Какую сумму планируете внести в качестве первоначального взноса? (₽)'
                          }
                          type="number"
                          min="0"
                          value={form.downPaymentOwnAmount}
                          onChange={(e) => {
                            setValue('downPaymentOwnAmount', e.target.value);
                            setAmountError('');
                          }}
                        />
                        {amountError && <p className="text-sm text-red-500">{amountError}</p>}
                      </div>
                    )}
                  </div>
                )}
                {step === 6 && (
                  <div className="grid gap-3">
                    <input className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3" placeholder="Ваше имя" value={form.name} onChange={(e) => setValue('name', e.target.value)} required />
                    <input className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3" placeholder="Номер телефона для связи" value={form.phone} onChange={(e) => setValue('phone', e.target.value)} required />
                    <input className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3" placeholder="Ваш Telegram для связи (не обязательно)" value={form.telegram} onChange={(e) => setValue('telegram', e.target.value)} />
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {step > 1 && (
                    <Button type="button" variant="ghost" onClick={prev}>Назад</Button>
                  )}
                  {step < stepTitles.length ? (
                    <Button type="button" onClick={next}>Далее</Button>
                  ) : (
                    <Button type="submit">Получить подборку</Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InlineChoice({ title, options, value, onSelect }) {
  return (
    <div>
      {title && <p className="mb-3 text-sm font-medium">{title}</p>}
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`focus-ring rounded-xl border px-4 py-3 text-left text-sm transition ${
              value === option
                ? 'border-[color:var(--accent2)] bg-[color:var(--bg2)]'
                : 'border-[color:var(--border)] hover:border-[color:var(--borderStrong)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
