'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';

const stepTitles = [
  'Что подбираем?',
  'Планировка',
  'Бюджет',
  'Первоначальный взнос',
  'Контакты',
];

const propertyOptions = [
  { label: 'Новостройка (квартира)', value: 'apartment_newbuild' },
  { label: 'Частный дом', value: 'house' },
  { label: 'Участок + дом', value: 'land_house' },
  { label: 'Нужна консультация', value: 'consultation' },
];

const apartmentOptionsBase = [
  { label: 'Студия 20–30 м²', value: 'studio_20_30' },
  { label: '1-комнатная 40–55 м²', value: '1k_40_55' },
  { label: '2-комнатная 55–65 м²', value: '2k_55_65' },
  { label: '3+ комнат 65+ м²', value: '3k_65_plus' },
];

const budgetOptions = [
  { label: '4–6 млн', value: '4_6' },
  { label: '6–8 млн', value: '6_8' },
  { label: '8–10 млн', value: '8_10' },
  { label: '10+ млн', value: '10_plus' },
  { label: 'Свой вариант', value: 'custom' },
];

const downPaymentOptions = [
  { label: 'Маткапитал', value: 'matcap' },
  { label: 'Маткапитал + собственные средства', value: 'matcap_plus_own' },
  { label: 'Собственные средства', value: 'own' },
];

const initialAnswers = {
  propertyType: '',
  apartmentType: '',
  budgetPreset: '',
  budgetCustom: '',
  downPaymentType: '',
  downPaymentOwnAmount: '',
  name: '',
  phone: '',
  telegram: '',
  company: '',
};

export default function LeadFormSection() {
  const [leadAnswers, setLeadAnswers] = useState(initialAnswers);
  const [open, setOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [embeddedStep, setEmbeddedStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [embeddedDone, setEmbeddedDone] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('leadModalClosed');
    if (!flag) setOpen(true);
  }, []);

  const apartmentOptions = useMemo(() => {
    if (leadAnswers.propertyType && leadAnswers.propertyType !== 'apartment_newbuild') {
      return [...apartmentOptionsBase, { label: 'Пока не знаю', value: 'dont_know' }];
    }
    return apartmentOptionsBase;
  }, [leadAnswers.propertyType]);

  const modalProgress = useMemo(() => {
    if (done) return 100;
    const percent = Math.round((modalStep / stepTitles.length) * 100);
    return Math.min(100, Math.max(0, percent));
  }, [done, modalStep]);

  const embeddedProgress = useMemo(() => {
    if (embeddedDone) return 100;
    const percent = Math.round((embeddedStep / stepTitles.length) * 100);
    return Math.min(100, Math.max(0, percent));
  }, [embeddedDone, embeddedStep]);

  const closeModal = () => {
    sessionStorage.setItem('leadModalClosed', '1');
    setOpen(false);
  };

  const setValue = (key, value) => setLeadAnswers((prev) => ({ ...prev, [key]: value }));

  const setDownPaymentType = (value) => {
    setLeadAnswers((prev) => ({
      ...prev,
      downPaymentType: value,
      downPaymentOwnAmount: value === 'matcap' ? '' : prev.downPaymentOwnAmount,
    }));
    setAmountError('');
  };

  const isOwnAmountValid = () => {
    if (!leadAnswers.downPaymentOwnAmount) return true;
    const amount = Number(leadAnswers.downPaymentOwnAmount);
    return Number.isFinite(amount) && amount > 0;
  };

  const canProceed = (step) => {
    if (step === 1) return Boolean(leadAnswers.propertyType);
    if (step === 2) return Boolean(leadAnswers.apartmentType);
    if (step === 3) {
      if (!leadAnswers.budgetPreset) return false;
      if (leadAnswers.budgetPreset === 'custom') return Boolean(leadAnswers.budgetCustom.trim());
      return true;
    }
    return true;
  };

  const nextModal = () => {
    if (modalStep === 5 && !isOwnAmountValid()) {
      setAmountError('Введите сумму больше 0 или оставьте поле пустым.');
      return;
    }
    setAmountError('');
    setModalStep((prev) => Math.min(prev + 1, stepTitles.length));
  };

  const prevModal = () => {
    setAmountError('');
    setModalStep((prev) => Math.max(prev - 1, 1));
  };

  const nextEmbedded = () => {
    if (embeddedStep === 5 && !isOwnAmountValid()) {
      setAmountError('Введите сумму больше 0 или оставьте поле пустым.');
      return;
    }
    setAmountError('');
    setEmbeddedStep((prev) => Math.min(prev + 1, stepTitles.length));
  };

  const prevEmbedded = () => {
    setAmountError('');
    setEmbeddedStep((prev) => Math.max(prev - 1, 1));
  };

  const resetEmbedded = () => {
    setEmbeddedDone(false);
    setEmbeddedStep(1);
    setSubmitErrorMessage('');
  };

  const buildPayload = () => ({
    name: leadAnswers.name,
    phone: leadAnswers.phone,
    pageUrl: window.location.href,
    createdAt: new Date().toISOString(),
    company: leadAnswers.company,
    answers: {
      propertyType: leadAnswers.propertyType,
      apartmentType: leadAnswers.apartmentType,
      budgetPreset: leadAnswers.budgetPreset,
      budgetCustom: leadAnswers.budgetCustom,
      downPaymentType: leadAnswers.downPaymentType || null,
      downPaymentOwnAmount: leadAnswers.downPaymentOwnAmount ? String(leadAnswers.downPaymentOwnAmount) : null,
      telegram: leadAnswers.telegram,
    },
    utm: {
      source: new URLSearchParams(window.location.search).get('utm_source') || '',
      medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
      campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
      term: new URLSearchParams(window.location.search).get('utm_term') || '',
      content: new URLSearchParams(window.location.search).get('utm_content') || '',
    },
  });

  const submitLead = async () => {
    if (isSubmitting) return false;

    const payload = buildPayload();

    setIsSubmitting(true);
    setSubmitErrorMessage('');
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.ok === true) {
        if (typeof window !== 'undefined' && typeof window.ym === 'function') {
          window.ym(107023721, 'reachGoal', 'lead_submit');
        }

        return true;
      }

      setSubmitErrorMessage(data?.message || 'Не удалось отправить. Попробуйте ещё раз.');
      return false;
    } catch (error) {
      console.error('Lead submit failed', error);
      setSubmitErrorMessage('Не удалось отправить. Попробуйте ещё раз.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const ok = await submitLead();
    if (ok) setDone(true);
  };

  const submitEmbedded = async (event) => {
    event.preventDefault();
    const ok = await submitLead();
    if (ok) setEmbeddedDone(true);
  };

  const showOwnAmount = leadAnswers.downPaymentType === 'matcap_plus_own' || leadAnswers.downPaymentType === 'own';

  const renderStep = (step) => {
    if (step === 1) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">Что вы хотите выбрать?</p>
          <InlineChoice
            options={propertyOptions.map((item) => item.label)}
            value={propertyOptions.find((item) => item.value === leadAnswers.propertyType)?.label || ''}
            onSelect={(label) => {
              const option = propertyOptions.find((item) => item.label === label);
              if (option) setValue('propertyType', option.value);
            }}
          />
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">Какой вариант вы рассматриваете?</p>
          <InlineChoice
            options={apartmentOptions.map((item) => item.label)}
            value={apartmentOptions.find((item) => item.value === leadAnswers.apartmentType)?.label || ''}
            onSelect={(label) => {
              const option = apartmentOptions.find((item) => item.label === label);
              if (option) setValue('apartmentType', option.value);
            }}
          />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">На какой бюджет ориентируетесь?</p>
          <InlineChoice
            options={budgetOptions.map((item) => item.label)}
            value={budgetOptions.find((item) => item.value === leadAnswers.budgetPreset)?.label || ''}
            onSelect={(label) => {
              const option = budgetOptions.find((item) => item.label === label);
              if (option) setValue('budgetPreset', option.value);
            }}
          />
          {leadAnswers.budgetPreset === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm text-[color:var(--muted)]">Введите сумму (можно примерно)</label>
              <input
                className="focus-ring w-full rounded-xl border border-[color:var(--border)] px-4 py-3"
                placeholder="Например: 7 500 000"
                value={leadAnswers.budgetCustom}
                onChange={(e) => setValue('budgetCustom', e.target.value)}
              />
            </div>
          )}
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-4">
          <InlineChoice
            options={downPaymentOptions.map((item) => item.label)}
            value={downPaymentOptions.find((item) => item.value === leadAnswers.downPaymentType)?.label || ''}
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
                  leadAnswers.downPaymentType === 'matcap_plus_own'
                    ? 'Сколько собственных средств планируете внести? (₽)'
                    : 'Какую сумму планируете внести в качестве первоначального взноса? (₽)'
                }
                type="number"
                min="0"
                value={leadAnswers.downPaymentOwnAmount}
                onChange={(e) => {
                  setValue('downPaymentOwnAmount', e.target.value);
                  setAmountError('');
                }}
              />
              {amountError && <p className="text-sm text-red-500">{amountError}</p>}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-3">
        <p className="text-sm text-[color:var(--muted)]">Оставьте контакты — помогу выбрать лучший вариант</p>
        <input className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3" placeholder="Ваше имя" value={leadAnswers.name} onChange={(e) => setValue('name', e.target.value)} required />
        <input className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3" placeholder="Номер телефона для связи" value={leadAnswers.phone} onChange={(e) => setValue('phone', e.target.value)} required />
        <input className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3" placeholder="Ваш Telegram для связи (не обязательно)" value={leadAnswers.telegram} onChange={(e) => setValue('telegram', e.target.value)} />
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          name="company"
          value={leadAnswers.company}
          onChange={(e) => setValue('company', e.target.value)}
        />
      </div>
    );
  };

  return (
    <>
      <section id="lead-form" className="py-12 md:py-16">
        <Container>
          <Card className="embedded-lead-card reveal p-7 transition-colors duration-200 md:p-10">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[rgba(17,24,39,0.55)]">Короткая заявка</p>
            <h2 className="text-3xl tracking-tight leading-[1.1] text-[#111827] md:text-4xl">Получить консультацию</h2>
            <p className="mt-3 max-w-2xl text-[rgba(17,24,39,0.70)]">Расскажу, какие варианты реально подходят, и сопровожу покупку до сделки.</p>

            <div className="mb-6 mt-6 h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg2)]">
              <div className="h-full max-w-full rounded-full bg-[color:var(--accent2)] transition-all" style={{ width: `${embeddedProgress}%` }} />
            </div>

            {embeddedDone ? (
              <div className="space-y-5">
                <h3 className="text-2xl tracking-tight">Готово</h3>
                <p className="text-[color:var(--muted)]">Спасибо! Свяжусь с вами, уточню детали и помогу выбрать подходящий вариант.</p>
                <p className="text-xs text-[color:var(--muted)]">Для вас это бесплатно — мою работу оплачивает застройщик.</p>
                <Button type="button" onClick={resetEmbedded}>Начать заново</Button>
              </div>
            ) : (
              <form onSubmit={submitEmbedded} className="space-y-6">
                {renderStep(embeddedStep)}
                <div className="mt-8 flex flex-wrap gap-3">
                  {embeddedStep > 1 && (
                    <Button type="button" variant="ghost" onClick={prevEmbedded}>Назад</Button>
                  )}
                  {embeddedStep < stepTitles.length ? (
                    <Button type="button" onClick={nextEmbedded} disabled={!canProceed(embeddedStep)}>Далее</Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !leadAnswers.name.trim() || !leadAnswers.phone.trim()}>
                      {isSubmitting ? 'Отправка...' : 'Получить консультацию'}
                    </Button>
                  )}
                </div>
                {submitErrorMessage && <p className="text-sm text-[color:var(--muted)]">{submitErrorMessage}</p>}
              </form>
            )}
          </Card>
        </Container>
      </section>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadowHover)] md:p-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">Получить консультацию</p>
                <h3 className="text-2xl tracking-tight">{done ? 'Спасибо!' : stepTitles[modalStep - 1]}</h3>
              </div>
              <button type="button" className="focus-ring rounded-lg px-2 py-1 text-sm" onClick={closeModal}>Закрыть</button>
            </div>

            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg2)]">
              <div className="h-full max-w-full rounded-full bg-[color:var(--accent2)] transition-all" style={{ width: `${modalProgress}%` }} />
            </div>

            {done ? (
              <div className="space-y-5">
                <p className="text-[color:var(--muted)]">
                  Спасибо! Я свяжусь с вами и пришлю варианты.
                </p>
                <p className="text-xs text-[color:var(--muted)]">Для вас это бесплатно — мою работу оплачивает застройщик.</p>
                <Button onClick={closeModal}>Закрыть</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                {renderStep(modalStep)}

                <div className="flex flex-wrap gap-3">
                  {modalStep > 1 && (
                    <Button type="button" variant="ghost" onClick={prevModal}>Назад</Button>
                  )}
                  {modalStep < stepTitles.length ? (
                    <Button type="button" onClick={nextModal} disabled={!canProceed(modalStep)}>Далее</Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !leadAnswers.name.trim() || !leadAnswers.phone.trim()}>
                      {isSubmitting ? 'Отправка...' : 'Получить консультацию'}
                    </Button>
                  )}
                </div>
                {submitErrorMessage && <p className="text-sm text-[color:var(--muted)]">{submitErrorMessage}</p>}
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
