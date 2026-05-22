'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';

const QUIZ_STEPS = 5;
const TOTAL_STEPS = 6;

const stepTitles = [
  'Тип квартиры',
  'Бюджет',
  'Приоритеты',
  'Способ покупки',
  'Первоначальный взнос',
  'Контакты',
];

const apartmentTypeOptions = [
  { label: 'Студия', value: 'studio' },
  { label: '1-комнатная', value: '1room' },
  { label: '2-комнатная', value: '2rooms' },
  { label: '3-комнатная', value: '3rooms' },
  { label: '4+ комнат', value: '4plus' },
  { label: 'Ещё выбираю', value: 'choosing' },
];

const budgetOptions = [
  { label: '5–7 млн', value: '5_to_7' },
  { label: '7–10 млн', value: '7_to_10' },
  { label: '10+ млн', value: '10_plus' },
];

const priorityOptions = [
  { label: 'Цена и выгодные условия', value: 'price' },
  { label: 'Локация / транспорт', value: 'location' },
  { label: 'Новый дом и качество строительства', value: 'quality' },
  { label: 'Инфраструктура (школы/сад/магазины)', value: 'infrastructure' },
  { label: 'Планировка и метраж', value: 'layout' },
  { label: 'Для инвестиций (рост цены / аренда)', value: 'investment' },
];

const purchaseMethodOptions = [
  { label: 'Наличные', value: 'cash' },
  { label: 'Ипотека', value: 'mortgage' },
  { label: 'Ещё не решил(а), нужна консультация', value: 'need_consultation' },
];

const downPaymentOptions = [
  { label: 'Только маткапитал', value: 'only_maternal' },
  { label: 'Маткапитал + свои средства', value: 'maternal_plus_own' },
  { label: 'Только свои средства (наличные)', value: 'only_own' },
  { label: 'Пока не знаю / нужна консультация', value: 'need_advice' },
];

const initialAnswers = {
  apartmentType: '',
  budgetPreset: '',
  priority: '',
  purchaseMethod: '',
  cashAmount: null,
  downPaymentType: '',
  ownFundsAmount: null,
  consultationFromBudget: false,
  name: '',
  phone: '',
  telegram: '',
  company: '',
  privacyConsent: false,
};

function formatNumber(val) {
  const digits = String(val).replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function isIncompatible(answers) {
  return (
    answers.budgetPreset === '5_to_7' &&
    ['2rooms', '3rooms', '4plus'].includes(answers.apartmentType)
  );
}

function getNextStep(step, answers) {
  if (step === 4) {
    return answers.purchaseMethod === 'mortgage' ? 5 : TOTAL_STEPS;
  }
  if (step === 5) return TOTAL_STEPS;
  return step + 1;
}

function getPrevStep(step, answers) {
  if (step === TOTAL_STEPS) {
    if (answers.consultationFromBudget) return 2;
    if (answers.purchaseMethod === 'mortgage') return 5;
    return 4;
  }
  return step - 1;
}

export default function LeadFormSection() {
  const [leadAnswers, setLeadAnswers] = useState(initialAnswers);
  const [open, setOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [embeddedStep, setEmbeddedStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [embeddedDone, setEmbeddedDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('leadModalClosed');
    if (flag) return;

    const openModal = () => setOpen(true);
    let timeoutId;

    if (typeof window.requestIdleCallback === 'function') {
      timeoutId = window.requestIdleCallback(openModal, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(openModal, 900);
    }

    return () => {
      if (typeof window.cancelIdleCallback === 'function' && typeof timeoutId === 'number') {
        window.cancelIdleCallback(timeoutId);
      } else {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const modalProgress = useMemo(() => {
    if (done) return 100;
    return Math.min(100, Math.max(0, Math.round((modalStep / TOTAL_STEPS) * 100)));
  }, [done, modalStep]);

  const embeddedProgress = useMemo(() => {
    if (embeddedDone) return 100;
    return Math.min(100, Math.max(0, Math.round((embeddedStep / TOTAL_STEPS) * 100)));
  }, [embeddedDone, embeddedStep]);

  const closeModal = () => {
    sessionStorage.setItem('leadModalClosed', '1');
    setOpen(false);
  };

  const setValue = (key, value) => setLeadAnswers((prev) => ({ ...prev, [key]: value }));

  const canProceed = (step) => {
    if (step === 1) return Boolean(leadAnswers.apartmentType);
    if (step === 2) return Boolean(leadAnswers.budgetPreset) && !isIncompatible(leadAnswers);
    if (step === 3) return Boolean(leadAnswers.priority);
    if (step === 4) return Boolean(leadAnswers.purchaseMethod);
    if (step === 5) return Boolean(leadAnswers.downPaymentType);
    return true;
  };

  const nextModal = () => setModalStep((prev) => getNextStep(prev, leadAnswers));
  const prevModal = () => setModalStep((prev) => getPrevStep(prev, leadAnswers));
  const nextEmbedded = () => setEmbeddedStep((prev) => getNextStep(prev, leadAnswers));
  const prevEmbedded = () => setEmbeddedStep((prev) => getPrevStep(prev, leadAnswers));

  const resetEmbedded = () => {
    setEmbeddedDone(false);
    setEmbeddedStep(1);
    setLeadAnswers(initialAnswers);
    setSubmitErrorMessage('');
  };

  const buildPayload = () => ({
    name: leadAnswers.name,
    phone: leadAnswers.phone,
    privacyConsent: leadAnswers.privacyConsent,
    source: 'main',
    pageUrl: window.location.href,
    createdAt: new Date().toISOString(),
    company: leadAnswers.company,
    answers: {
      apartmentType: leadAnswers.apartmentType,
      budgetPreset: leadAnswers.budgetPreset,
      priority: leadAnswers.priority,
      purchaseMethod: leadAnswers.purchaseMethod,
      cashAmount: leadAnswers.cashAmount,
      downPaymentType: leadAnswers.downPaymentType,
      ownFundsAmount: leadAnswers.ownFundsAmount,
      consultationFromBudget: leadAnswers.consultationFromBudget,
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

    if (!leadAnswers.name.trim()) {
      setSubmitErrorMessage('Укажите ваше имя.');
      return false;
    }
    if (!leadAnswers.phone.trim()) {
      setSubmitErrorMessage('Укажите номер телефона.');
      return false;
    }
    if (!leadAnswers.privacyConsent) {
      setSubmitErrorMessage('Необходимо согласие на обработку персональных данных.');
      return false;
    }

    const payload = buildPayload();
    setIsSubmitting(true);
    setSubmitErrorMessage('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[LeadForm] failed to parse response JSON:', parseError);
      }

      if (response.ok && (data?.success === true || data?.ok === true)) {
        if (typeof window !== 'undefined' && typeof window.ym === 'function') {
          window.ym(107023721, 'reachGoal', 'lead_submit');
        }
        return true;
      }

      const msg = data?.message || 'Не удалось отправить. Попробуйте ещё раз.';
      console.error('[LeadForm] submit error — response.ok:', response.ok, '| data:', data);
      setSubmitErrorMessage(msg);
      return false;
    } catch (error) {
      console.error('[LeadForm] submit failed:', error);
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

  const stepLabel = (step) =>
    step <= QUIZ_STEPS ? `Вопрос ${step} из ${QUIZ_STEPS}` : 'Контакты';

  const renderStep = (step, setStep) => {
    if (step === 1) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">Какую квартиру Вы рассматриваете?</p>
          <InlineChoice
            options={apartmentTypeOptions.map((o) => o.label)}
            value={apartmentTypeOptions.find((o) => o.value === leadAnswers.apartmentType)?.label || ''}
            onSelect={(label) => {
              const opt = apartmentTypeOptions.find((o) => o.label === label);
              if (!opt) return;
              setLeadAnswers((prev) => ({
                ...prev,
                apartmentType: opt.value,
                ...(prev.apartmentType !== opt.value
                  ? {
                      budgetPreset: '',
                      priority: '',
                      purchaseMethod: '',
                      cashAmount: null,
                      downPaymentType: '',
                      ownFundsAmount: null,
                      consultationFromBudget: false,
                    }
                  : {}),
              }));
            }}
          />
        </div>
      );
    }

    if (step === 2) {
      const incompatible = isIncompatible(leadAnswers);
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">На какой бюджет Вы ориентируетесь?</p>
          <InlineChoice
            options={budgetOptions.map((o) => o.label)}
            value={budgetOptions.find((o) => o.value === leadAnswers.budgetPreset)?.label || ''}
            onSelect={(label) => {
              const opt = budgetOptions.find((o) => o.label === label);
              if (!opt) return;
              setLeadAnswers((prev) => ({
                ...prev,
                budgetPreset: opt.value,
                ...(prev.budgetPreset !== opt.value
                  ? {
                      priority: '',
                      purchaseMethod: '',
                      cashAmount: null,
                      downPaymentType: '',
                      ownFundsAmount: null,
                      consultationFromBudget: false,
                    }
                  : {}),
              }));
            }}
          />
          {incompatible && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 space-y-3">
              <p className="text-sm text-red-700 leading-relaxed">
                К сожалению, в текущих рыночных условиях мы не сможем подобрать вам квартиру
                такого метража в этом бюджете. Давайте обсудим варианты на консультации.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setLeadAnswers((prev) => ({ ...prev, consultationFromBudget: true }));
                    setStep(TOTAL_STEPS);
                  }}
                >
                  Проконсультироваться
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Изменить параметры
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">Что для Вас самое важное в выборе?</p>
          <InlineChoice
            options={priorityOptions.map((o) => o.label)}
            value={priorityOptions.find((o) => o.value === leadAnswers.priority)?.label || ''}
            onSelect={(label) => {
              const opt = priorityOptions.find((o) => o.label === label);
              if (!opt) return;
              setLeadAnswers((prev) => ({
                ...prev,
                priority: opt.value,
                ...(prev.priority !== opt.value
                  ? {
                      purchaseMethod: '',
                      cashAmount: null,
                      downPaymentType: '',
                      ownFundsAmount: null,
                    }
                  : {}),
              }));
            }}
          />
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">Как Вы планируете покупать?</p>
          <InlineChoice
            options={purchaseMethodOptions.map((o) => o.label)}
            value={purchaseMethodOptions.find((o) => o.value === leadAnswers.purchaseMethod)?.label || ''}
            onSelect={(label) => {
              const opt = purchaseMethodOptions.find((o) => o.label === label);
              if (!opt) return;
              setLeadAnswers((prev) => ({
                ...prev,
                purchaseMethod: opt.value,
                ...(prev.purchaseMethod !== opt.value
                  ? { cashAmount: null, downPaymentType: '', ownFundsAmount: null }
                  : {}),
              }));
            }}
          />
          {leadAnswers.purchaseMethod === 'cash' && (
            <div className="space-y-2">
              <label className="text-sm text-[color:var(--muted)]">Какой суммой располагаете?</label>
              <input
                className="focus-ring w-full rounded-xl border border-[color:var(--border)] px-4 py-3"
                placeholder="Например: 5 000 000 ₽"
                inputMode="numeric"
                value={leadAnswers.cashAmount != null ? formatNumber(leadAnswers.cashAmount) + ' ₽' : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setValue('cashAmount', digits || null);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    if (step === 5) {
      const needsAmount = ['maternal_plus_own', 'only_own'].includes(leadAnswers.downPaymentType);
      const amountLabel =
        leadAnswers.downPaymentType === 'maternal_plus_own'
          ? 'Сколько собственных средств готовы добавить к маткапиталу?'
          : 'Какую сумму готовы внести как первоначальный взнос?';

      return (
        <div className="space-y-3">
          <p className="text-sm font-medium">Как Вы планируете формировать первоначальный взнос?</p>
          <InlineChoice
            options={downPaymentOptions.map((o) => o.label)}
            value={downPaymentOptions.find((o) => o.value === leadAnswers.downPaymentType)?.label || ''}
            onSelect={(label) => {
              const opt = downPaymentOptions.find((o) => o.label === label);
              if (!opt) return;
              setLeadAnswers((prev) => ({
                ...prev,
                downPaymentType: opt.value,
                ...(prev.downPaymentType !== opt.value ? { ownFundsAmount: null } : {}),
              }));
            }}
          />
          {needsAmount && (
            <div className="space-y-2">
              <label className="text-sm text-[color:var(--muted)]">{amountLabel}</label>
              <input
                className="focus-ring w-full rounded-xl border border-[color:var(--border)] px-4 py-3"
                placeholder="Например: 800 000 ₽"
                inputMode="numeric"
                value={leadAnswers.ownFundsAmount != null ? formatNumber(leadAnswers.ownFundsAmount) + ' ₽' : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setValue('ownFundsAmount', digits || null);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    // Step 6 — contacts (unchanged)
    return (
      <div className="grid gap-3">
        <p className="text-sm text-[color:var(--muted)]">Оставьте контакты — вышлем подборку и поможем с ипотекой</p>
        <input
          className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3"
          placeholder="Ваше имя"
          value={leadAnswers.name}
          onChange={(e) => setValue('name', e.target.value)}
          required
        />
        <input
          className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3"
          placeholder="Номер телефона"
          type="tel"
          value={leadAnswers.phone}
          onChange={(e) => setValue('phone', e.target.value)}
          required
        />
        <input
          className="focus-ring rounded-xl border border-[color:var(--border)] px-4 py-3"
          placeholder="Ваш Telegram (не обязательно)"
          value={leadAnswers.telegram}
          onChange={(e) => setValue('telegram', e.target.value)}
        />
        <label className="flex items-start gap-2.5 rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.7)] px-3 py-2.5 text-xs leading-relaxed text-[color:var(--muted)] md:text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--accent2)]"
            checked={leadAnswers.privacyConsent}
            onChange={(e) => setValue('privacyConsent', e.target.checked)}
            required
          />
          <span>
            Нажимая кнопку, я даю согласие на обработку персональных данных в соответствии с{' '}
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[color:var(--accent2)] underline-offset-2 transition hover:text-[color:var(--accent2)]"
            >
              Политикой конфиденциальности
            </Link>
            .
          </span>
        </label>
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
          {!embeddedDone && (
            <div className="mb-5 text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
                Получите подборку квартир под ваш бюджет
              </h2>
              <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="quiz-benefit-pill">→ 5–7 вариантов квартир</span>
                <span className="quiz-benefit-pill">→ Расчёт ипотеки</span>
                <span className="quiz-benefit-pill">→ Одобрение за 24 часа</span>
              </div>
            </div>
          )}

          <Card className="embedded-lead-card reveal p-7 transition-colors duration-200 md:p-10">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[rgba(17,24,39,0.55)]">Быстрый подбор</p>
            <p className="mt-3 max-w-2xl text-[rgba(17,24,39,0.70)]">
              5 вопросов — и мы пришлём варианты с ценами и планировками.
            </p>

            <div className="mb-2 mt-6 flex items-center justify-between text-xs text-[color:var(--muted)]">
              <span>{embeddedDone ? 'Готово' : stepLabel(embeddedStep)}</span>
              <span>{embeddedDone ? '100%' : `${embeddedProgress}%`}</span>
            </div>
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg2)]">
              <div
                className="h-full max-w-full rounded-full bg-[color:var(--accent2)] transition-all"
                style={{ width: `${embeddedProgress}%` }}
              />
            </div>

            {embeddedDone ? (
              <div className="space-y-5">
                <h3 className="text-2xl tracking-tight">Заявка принята!</h3>
                <p className="text-[color:var(--muted)]">Мы свяжемся с вами в течение 5 минут и пришлём подборку квартир.</p>
                <p className="text-xs text-[color:var(--muted)]">Для вас это бесплатно — мою работу оплачивает застройщик.</p>
                <Button type="button" onClick={resetEmbedded}>Начать заново</Button>
              </div>
            ) : (
              <form onSubmit={submitEmbedded} className="space-y-6">
                <div key={`emb-${embeddedStep}`} className="quiz-step-animate">
                  {renderStep(embeddedStep, setEmbeddedStep)}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {embeddedStep > 1 && (
                    <Button type="button" variant="ghost" onClick={prevEmbedded}>
                      Назад
                    </Button>
                  )}
                  {embeddedStep < TOTAL_STEPS ? (
                    <Button type="button" onClick={nextEmbedded} disabled={!canProceed(embeddedStep)}>
                      Далее
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !leadAnswers.name.trim() ||
                        !leadAnswers.phone.trim() ||
                        !leadAnswers.privacyConsent
                      }
                    >
                      {isSubmitting ? 'Отправка...' : 'Получить подборку квартир'}
                    </Button>
                  )}
                </div>
                {submitErrorMessage && (
                  <p className="text-sm text-red-500">{submitErrorMessage}</p>
                )}
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
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">Получить подборку</p>
                <h3 className="text-2xl tracking-tight">
                  {done ? 'Заявка принята!' : stepTitles[modalStep - 1]}
                </h3>
              </div>
              <button type="button" className="focus-ring rounded-lg px-2 py-1 text-sm" onClick={closeModal}>
                Закрыть
              </button>
            </div>

            {!done && (
              <div className="mb-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
                <span>{stepLabel(modalStep)}</span>
                <span>{modalProgress}%</span>
              </div>
            )}
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg2)]">
              <div
                className="h-full max-w-full rounded-full bg-[color:var(--accent2)] transition-all"
                style={{ width: `${modalProgress}%` }}
              />
            </div>

            {done ? (
              <div className="space-y-5">
                <p className="text-[color:var(--muted)]">
                  Мы свяжемся с вами в течение 5 минут и пришлём подборку квартир.
                </p>
                <p className="text-xs text-[color:var(--muted)]">Для вас это бесплатно — мою работу оплачивает застройщик.</p>
                <Button onClick={closeModal}>Закрыть</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <div key={`mod-${modalStep}`} className="quiz-step-animate">
                  {renderStep(modalStep, setModalStep)}
                </div>
                <div className="flex flex-wrap gap-3">
                  {modalStep > 1 && (
                    <Button type="button" variant="ghost" onClick={prevModal}>
                      Назад
                    </Button>
                  )}
                  {modalStep < TOTAL_STEPS ? (
                    <Button type="button" onClick={nextModal} disabled={!canProceed(modalStep)}>
                      Далее
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !leadAnswers.name.trim() ||
                        !leadAnswers.phone.trim() ||
                        !leadAnswers.privacyConsent
                      }
                    >
                      {isSubmitting ? 'Отправка...' : 'Получить подборку квартир'}
                    </Button>
                  )}
                </div>
                {submitErrorMessage && (
                  <p className="text-sm text-red-500">{submitErrorMessage}</p>
                )}
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
