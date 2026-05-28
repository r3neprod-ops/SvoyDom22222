'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import brand from '@/data/brand';
import {
  getBudgetChoice,
  getFloorPlanMatches,
  getRoomChoice,
} from '@/data/floorplans';

const OPEN_EVENT = 'open-floorplan-quiz';
const LANDING_SOURCE = 'unlock_layouts';
const FORM_SECTION = 'floorplan_quiz_unlock';
const UNLOCK_STORAGE_KEY = 'svoydom_layouts_unlocked';
const UNLOCK_EVENT = 'svoydom:layouts-unlocked';

const stepMeta = {
  apartment: { index: 1, label: 'Квартира', progress: 25 },
  downPayment: { index: 2, label: 'Первоначальный взнос', progress: 50 },
  payment: { index: 3, label: 'Платёж', progress: 75 },
  results: { index: 4, label: 'Подборка', progress: 100 },
};

const sidebarSteps = [
  { key: 'apartment', label: 'Квартира' },
  { key: 'downPayment', label: 'Взнос' },
  { key: 'payment', label: 'Платёж' },
  { key: 'results', label: 'Подборка' },
];

const apartmentOptions = [
  { value: 'studio', rooms: 'studio', label: 'Студия', hint: 'компактный формат с низким входом' },
  { value: '1room', rooms: '1-room', label: 'Однокомнатная квартира', hint: 'для жизни или первой покупки' },
  { value: '2rooms', rooms: '2-room', label: 'Двухкомнатная квартира', hint: 'больше пространства для семьи' },
  { value: '3rooms', rooms: '3-room', label: 'Трёхкомнатная квартира', hint: 'просторный семейный формат' },
  { value: 'choosing', rooms: 'any', label: 'Пока не знаю, нужна консультация', hint: 'покажем разные варианты' },
];

const downPaymentOptions = [
  { value: 'only_maternal', label: 'Материнский капитал', hint: 'проверим подходящие сценарии' },
  { value: 'maternal_plus_own', label: 'Материнский капитал и свои средства', hint: 'учтём оба источника взноса' },
  { value: 'only_own', label: 'Только свои средства', hint: 'подберём под ваш вход' },
  { value: 'no_down_payment', label: 'Хочу узнать, можно ли без первоначального взноса', hint: 'разберём доступные варианты' },
  { value: 'need_advice', label: 'Пока не знаю', hint: 'специалист подскажет' },
];

const monthlyPaymentOptions = [
  { value: 'up_to_20', budget: 'to-6', label: 'До 20 000 ₽', hint: 'начнём с самых доступных планировок' },
  { value: '20_to_30', budget: '6-8', label: '20 000–30 000 ₽', hint: 'сравним варианты среднего бюджета' },
  { value: '30_to_40', budget: '8-10', label: '30 000–40 000 ₽', hint: 'покажем больше площадей и форматов' },
  { value: 'over_40', budget: '10-plus', label: 'Больше 40 000 ₽', hint: 'откроем расширенную подборку' },
  { value: 'payment_consultation', budget: null, label: 'Пока не знаю, нужна консультация', hint: 'подберём без жёсткого лимита' },
];

const trustItems = [
  'Бесплатная консультация',
  'Подбор под ваш бюджет',
  'Помощь с ипотекой под 2%',
  'Работаем с новостройками Луганска',
  'Без комиссии для клиента',
];

const emptyLead = {
  name: '',
  phone: '',
  company: '',
};

function needsOwnFundsAmount(value) {
  return ['maternal_plus_own', 'only_own'].includes(value);
}

function formatNumber(val) {
  const digits = String(val).replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function getPlanWord(count) {
  if (count === 1) return 'планировка';
  if (count > 1 && count < 5) return 'планировки';
  return 'планировок';
}

function formatArea(area) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(area);
}

function humanizeApartmentText(value) {
  return String(value || '')
    .replaceAll('1-комнатная', 'однокомнатная квартира')
    .replaceAll('2-комнатная', 'двухкомнатная квартира')
    .replaceAll('3-комнатная', 'трёхкомнатная квартира');
}

function capitalizeFirst(value) {
  const text = String(value || '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function getResultIntro(hasExactMatches) {
  return hasExactMatches
    ? 'Показываем найденные варианты по вашим параметрам.'
    : 'Точных вариантов пока нет, поэтому показываем ближайшие найденные планировки.';
}

function serializePlan(plan) {
  return {
    id: plan.id,
    complex: plan.complex,
    title: capitalizeFirst(humanizeApartmentText(plan.title)),
    rooms: humanizeApartmentText(plan.roomLabel),
    area: plan.area,
    price: plan.priceLabel,
    caption: capitalizeFirst(humanizeApartmentText(plan.caption)),
    source: `${plan.sourceName}, проверено ${plan.sourceChecked}`,
  };
}

export default function LeadFormSection() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState('apartment');
  const [apartment, setApartment] = useState(null);
  const [downPayment, setDownPayment] = useState(null);
  const [ownFundsAmount, setOwnFundsAmount] = useState(null);
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [lead, setLead] = useState(emptyLead);
  const [done, setDone] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const lockedScrollYRef = useRef(0);
  const bodyStyleRef = useRef({});

  const selectedApartment = apartmentOptions.find((choice) => choice.value === apartment) || null;
  const selectedDownPayment = downPaymentOptions.find((choice) => choice.value === downPayment) || null;
  const selectedPayment = monthlyPaymentOptions.find((choice) => choice.value === monthlyPayment) || null;
  const derivedRooms = selectedApartment?.rooms || null;
  const derivedBudget = selectedPayment?.budget || null;
  const selectedBudget = derivedBudget ? getBudgetChoice(derivedBudget) : null;
  const selectedRooms = derivedRooms ? getRoomChoice(derivedRooms) : null;
  const currentMeta = stepMeta[step];

  const matchedPlans = useMemo(() => {
    if (!apartment || !downPayment || !monthlyPayment) return [];
    return getFloorPlanMatches(derivedBudget, derivedRooms || 'any');
  }, [apartment, derivedBudget, derivedRooms, downPayment, monthlyPayment]);

  const visiblePlans = unlocked ? matchedPlans : matchedPlans.slice(0, 4);

  const hasExactBudgetMatches = useMemo(() => {
    if (!derivedBudget || !derivedRooms) return true;

    const maxPrice = selectedBudget?.maxPriceRub ?? null;
    return matchedPlans.some((plan) => {
      const priceFits = maxPrice === null || plan.priceRub <= maxPrice;
      const roomsFit = derivedRooms === 'any' || plan.rooms === derivedRooms;
      return priceFits && roomsFit;
    });
  }, [derivedBudget, derivedRooms, matchedPlans, selectedBudget?.maxPriceRub]);

  useEffect(() => {
    const openQuiz = () => {
      setOpen(true);
      setDone(false);
      setError('');
      setStep(apartment && downPayment && monthlyPayment ? 'results' : 'apartment');
    };

    const captureCtaClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickable = target.closest('a, button');
      if (!clickable) return;

      const text = clickable.textContent?.toLowerCase().trim() || '';
      const href = clickable.getAttribute('href') || '';
      const asksForSelection =
        href === '#lead-form' ||
        href === '/#lead-form' ||
        text.includes('получить подбор') ||
        text.includes('узнать цены') ||
        text.includes('цены и планировки');

      if (!asksForSelection) return;

      event.preventDefault();
      openQuiz();
    };

    window.addEventListener(OPEN_EVENT, openQuiz);
    document.addEventListener('click', captureCtaClick);

    return () => {
      window.removeEventListener(OPEN_EVENT, openQuiz);
      document.removeEventListener('click', captureCtaClick);
    };
  }, [apartment, downPayment, monthlyPayment]);

  useEffect(() => {
    const syncUnlockState = () => {
      setUnlocked(window.localStorage.getItem(UNLOCK_STORAGE_KEY) === 'true');
    };

    syncUnlockState();
    window.addEventListener('storage', syncUnlockState);
    window.addEventListener(UNLOCK_EVENT, syncUnlockState);

    return () => {
      window.removeEventListener('storage', syncUnlockState);
      window.removeEventListener(UNLOCK_EVENT, syncUnlockState);
    };
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (!open) return undefined;

    lockedScrollYRef.current = window.scrollY;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    bodyStyleRef.current = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyStyleRef.current.overflow || '';
      document.body.style.position = bodyStyleRef.current.position || '';
      document.body.style.top = bodyStyleRef.current.top || '';
      document.body.style.left = bodyStyleRef.current.left || '';
      document.body.style.right = bodyStyleRef.current.right || '';
      document.body.style.width = bodyStyleRef.current.width || '';
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.scrollTo(0, lockedScrollYRef.current);
    };
  }, [open]);

  const unlockSelection = () => {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
    window.dispatchEvent(new Event(UNLOCK_EVENT));
    setUnlocked(true);
  };

  const canOpenSidebarStep = (targetStep) => {
    if (targetStep === 'apartment') return true;
    if (targetStep === 'downPayment') return Boolean(apartment);
    if (targetStep === 'payment') return Boolean(apartment && downPayment && (!needsOwnFundsAmount(downPayment) || ownFundsAmount));
    if (targetStep === 'results') return Boolean(apartment && downPayment && monthlyPayment && (!needsOwnFundsAmount(downPayment) || ownFundsAmount));
    return false;
  };

  const openSidebarStep = (targetStep) => {
    if (!canOpenSidebarStep(targetStep)) return;
    setError('');
    setDone(false);
    setStep(targetStep);
  };

  const selectApartment = (value) => {
    setApartment(value);
    setError('');
    setDone(false);
    setStep('downPayment');
  };

  const selectDownPayment = (value) => {
    setDownPayment(value);
    setError('');
    setDone(false);
    if (!needsOwnFundsAmount(value)) {
      setOwnFundsAmount(null);
      setStep('payment');
    }
  };

  const continueAfterDownPayment = () => {
    if (!downPayment) return;
    if (needsOwnFundsAmount(downPayment) && !ownFundsAmount) return;
    setStep('payment');
  };

  const selectMonthlyPayment = (value) => {
    setMonthlyPayment(value);
    setError('');
    setDone(false);
    setStep('results');
  };

  const goBack = () => {
    setError('');
    if (step === 'results') setStep('payment');
    if (step === 'payment') setStep('downPayment');
    if (step === 'downPayment') setStep('apartment');
  };

  const restart = () => {
    setApartment(null);
    setDownPayment(null);
    setOwnFundsAmount(null);
    setMonthlyPayment(null);
    setLead(emptyLead);
    setDone(false);
    setError('');
    setStep('apartment');
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = lead.name.trim();
    const cleanPhone = lead.phone.trim();

    if (cleanName.length < 2) {
      setError('Укажите имя, чтобы менеджер понял, как к вам обращаться.');
      return;
    }

    if (!/^\+?[0-9\s\-()]{10,}$/.test(cleanPhone)) {
      setError('Укажите корректный номер телефона.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          privacyConsent: true,
          source: LANDING_SOURCE,
          pageUrl: window.location.href,
          createdAt: new Date().toISOString(),
          company: lead.company,
          answers: {
            quiz: 'floorplan_quiz_unlock',
            formSection: FORM_SECTION,
            apartmentType: selectedApartment?.value || '',
            rooms: selectedApartment?.label || '',
            downPaymentType: selectedDownPayment?.value || '',
            downPayment: selectedDownPayment?.label || '',
            ownFundsAmount,
            monthlyPayment: selectedPayment?.value || '',
            monthlyPaymentLabel: selectedPayment?.label || '',
            budgetPreset: selectedBudget?.value || '',
            budget: selectedBudget?.label || '',
            matchedPlans: matchedPlans.map(serializePlan),
          },
          utm: {
            source: new URLSearchParams(window.location.search).get('utm_source') || '',
            medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
            campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
            term: new URLSearchParams(window.location.search).get('utm_term') || '',
            content: new URLSearchParams(window.location.search).get('utm_content') || '',
          },
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[FloorplanQuiz] failed to parse response JSON:', parseError);
      }

      if (!response.ok || !(data?.success === true || data?.ok === true)) {
        throw new Error(data?.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      if (typeof window !== 'undefined' && typeof window.ym === 'function') {
        window.ym(107023721, 'reachGoal', 'lead_submit');
      }

      unlockSelection();
      setDone(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось отправить заявку. Попробуйте ещё раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPlan = (plan) => {
    if (!unlocked || !plan?.sourceUrl) return;
    window.open(plan.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const renderPlanCard = (plan) => (
    <button
      key={plan.id}
      type="button"
      onClick={() => openPlan(plan)}
      data-complex={plan.complex}
      className="focus-ring group min-w-0 overflow-hidden rounded-[22px] border border-[#eadfcd] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--accent2)] hover:shadow-[0_16px_36px_rgba(31,41,55,0.12)]"
      aria-label={`Открыть планировку ${plan.complex}, ${plan.title}`}
    >
      <div className="relative aspect-[4/3] bg-[#fffdf8]">
        <Image
          src={plan.image}
          alt={`${plan.complex}: ${capitalizeFirst(humanizeApartmentText(plan.title))}`}
          fill
          sizes="(min-width: 1280px) 230px, (min-width: 640px) 45vw, 90vw"
          className="object-contain p-2"
        />
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#f2eadf] px-2.5 py-1 text-[11px] font-bold text-[#6e5535]">
            ЖК {plan.complex}
          </span>
          <span className="text-xs font-bold text-[color:var(--accent2)]">
            {plan.priceLabel}
          </span>
        </div>
        <div>
          <h3 className="break-words text-sm font-bold leading-snug">
            {capitalizeFirst(humanizeApartmentText(plan.caption))}
          </h3>
          <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
            {humanizeApartmentText(plan.roomLabel)} · {formatArea(plan.area)} м²
          </p>
        </div>
        <p className="rounded-xl bg-[#fbf7ef] px-3 py-2 text-[11px] font-semibold leading-snug text-[color:var(--muted)]">
          Источник: {plan.sourceName}, проверено {plan.sourceChecked}
        </p>
        <p className="text-xs font-bold text-[color:var(--accent2)] transition group-hover:translate-x-0.5">
          {unlocked ? 'Смотреть планировку →' : 'Доступ после заявки →'}
        </p>
      </div>
    </button>
  );

  return (
    <>
      <section id="lead-form" className="py-12 md:py-16">
        <Container>
          <Card className="embedded-lead-card reveal p-6 md:p-9">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--accent)]">
                  Быстрый подбор
                </p>
                <h2 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight text-[#111827] md:text-3xl">
                  Подберём планировки под ваши ответы
                </h2>
                <p className="mt-3 max-w-2xl text-[color:var(--muted)]">
                  Ответьте на 3 вопроса — покажем персональную подборку квартир с планировками и ценами.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Button type="button" onClick={restart} className="px-6 py-4">
                  Получить подборку
                </Button>
                <Button as="a" href="#complexes" variant="ghost" className="px-6 py-4">
                  Смотреть ЖК
                </Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-[rgba(17,24,39,0.42)] p-3 backdrop-blur-[3px] sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="floorplan-quiz-title"
        >
          <div ref={modalRef} className="relative my-auto w-full max-w-5xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-[24px] border border-white/70 bg-[#fbf7ef] shadow-[0_34px_110px_rgba(31,41,55,0.35)] sm:rounded-[30px]">
            <div className="grid min-w-0 lg:max-h-[calc(100dvh-1.5rem)] lg:grid-cols-[0.8fr_1.2fr]">
              <aside className="relative min-w-0 overflow-hidden bg-[#1f2937] p-4 text-white sm:p-6 lg:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_6%,rgba(176,141,87,0.38),transparent_30%),linear-gradient(145deg,rgba(123,165,154,0.20),transparent_46%)]" />
                <div className="relative">
                  <div className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/82">
                    Быстрый подбор
                  </div>
                  <div className="mt-5">
                    <p className="font-semibold text-[#d7c4a5]">
                      3 вопроса и реальные планировки
                    </p>
                    <h3
                      id="floorplan-quiz-title"
                      className="mt-2 max-w-md text-[1.55rem] font-bold leading-tight tracking-tight text-white sm:text-3xl"
                    >
                      Квартиры в новостройках Луганска под ваш сценарий
                    </h3>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-4 lg:grid-cols-1">
                    {sidebarSteps.map((item, index) => {
                      const itemMeta = stepMeta[item.key];
                      const completedOrCurrent = itemMeta.index <= currentMeta.index;
                      const current = item.key === step;
                      const reachable = canOpenSidebarStep(item.key);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openSidebarStep(item.key)}
                          disabled={!reachable}
                          aria-current={current ? 'step' : undefined}
                          className={`focus-ring flex items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                            current
                              ? 'border-[#d7c4a5] bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                              : completedOrCurrent
                                ? 'border-[#d7c4a5]/45 bg-white/10 text-white hover:border-[#d7c4a5]/70 hover:bg-white/[0.14]'
                                : 'border-white/10 bg-white/[0.03] text-white/52'
                          } ${
                            reachable
                              ? 'cursor-pointer hover:-translate-y-0.5'
                              : 'cursor-not-allowed opacity-70'
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                              completedOrCurrent ? 'bg-[#d7c4a5] text-[#1f2937]' : 'bg-white/10 text-white/55'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <section ref={contentRef} className="min-w-0 p-4 sm:p-6 lg:overflow-y-auto lg:p-7">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    <span>
                      Шаг {currentMeta.index} из 4 · {currentMeta.label}
                    </span>
                    <span>{currentMeta.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#eadfcd]">
                    <div
                      className="h-full rounded-full bg-[color:var(--accent2)] transition-all"
                      style={{ width: `${currentMeta.progress}%` }}
                    />
                  </div>
                </div>

                {step === 'apartment' && (
                  <QuizQuestion
                    title="Какая квартира вас интересует?"
                    description="Выберите формат, а мы используем его для текущего подбора планировок."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {apartmentOptions.map((choice) => (
                        <ChoiceButton
                          key={choice.value}
                          active={apartment === choice.value}
                          title={choice.label}
                          text={choice.hint}
                          onClick={() => selectApartment(choice.value)}
                        />
                      ))}
                    </div>
                  </QuizQuestion>
                )}

                {step === 'downPayment' && (
                  <QuizQuestion
                    title="Что планируете использовать для первоначального взноса?"
                    description="Это поможет специалисту сразу проверить подходящий ипотечный сценарий."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {downPaymentOptions.map((choice) => (
                        <ChoiceButton
                          key={choice.value}
                          active={downPayment === choice.value}
                          title={choice.label}
                          text={choice.hint}
                          onClick={() => selectDownPayment(choice.value)}
                        />
                      ))}
                    </div>
                    {needsOwnFundsAmount(downPayment) && (
                      <div className="mt-4 rounded-[22px] border border-[#eadfcd] bg-white/70 p-4">
                        <label className="text-sm font-semibold" htmlFor="own-funds-amount">
                          Какая сумма своих средств есть на первоначальный взнос?
                        </label>
                        <input
                          id="own-funds-amount"
                          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[#fffdf8] px-4 text-base"
                          placeholder="Например, 800 000 ₽"
                          inputMode="numeric"
                          value={ownFundsAmount != null ? formatNumber(ownFundsAmount) + ' ₽' : ''}
                          onChange={(event) => {
                            const digits = event.target.value.replace(/\D/g, '');
                            setOwnFundsAmount(digits || null);
                          }}
                        />
                      </div>
                    )}
                    {downPayment && (
                      <Button
                        type="button"
                        className="mt-5 rounded-full !px-5 !py-3"
                        disabled={needsOwnFundsAmount(downPayment) && !ownFundsAmount}
                        onClick={continueAfterDownPayment}
                      >
                        Далее
                      </Button>
                    )}
                  </QuizQuestion>
                )}

                {step === 'payment' && (
                  <QuizQuestion
                    title="Какой ежемесячный платёж был бы комфортным?"
                    description="По ответу определим ценовой диапазон и покажем подходящие планировки."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {monthlyPaymentOptions.map((choice) => (
                        <ChoiceButton
                          key={choice.value}
                          active={monthlyPayment === choice.value}
                          title={choice.label}
                          text={choice.hint}
                          onClick={() => selectMonthlyPayment(choice.value)}
                        />
                      ))}
                    </div>
                  </QuizQuestion>
                )}

                {step === 'results' && (
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                          Персональная подборка
                        </p>
                        <h2 className="mt-2 max-w-full break-words text-[1.55rem] font-bold leading-tight tracking-tight sm:text-3xl">
                          Подобрали {matchedPlans.length} {getPlanWord(matchedPlans.length)} под ваши ответы
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                          {selectedApartment?.label}
                          {selectedPayment ? ` · ${selectedPayment.label}` : ''}
                          {selectedBudget ? ` · ориентир ${selectedBudget.label}` : ''}. {getResultIntro(hasExactBudgetMatches)}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" className="w-fit rounded-full !px-4 !py-2" onClick={goBack}>
                        ← Назад
                      </Button>
                    </div>

                    {matchedPlans.length === 0 ? (
                      <div className="mt-5 rounded-[24px] border border-[#eadfcd] bg-white p-5">
                        <h3 className="text-xl font-bold">Пока нет подходящих вариантов</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                          По этим ответам лучше уточнить задачу вручную. Специалист подскажет, какие варианты доступны.
                        </p>
                      </div>
                    ) : (
                      <>
                        {!unlocked && (
                          <p className="mt-4 rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-3 text-sm font-medium leading-relaxed text-[color:var(--muted)]">
                            Первые карточки уже видны. Оставьте контакт — откроем планировки и условия на этой странице.
                          </p>
                        )}

                        {unlocked && (
                          <div className="mt-4 rounded-[24px] border border-[rgba(123,165,154,0.32)] bg-[rgba(123,165,154,0.12)] p-5">
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--accent2)]">
                              Подборка открыта
                            </p>
                            <h3 className="mt-2 text-xl font-bold">Специалист скоро свяжется с вами</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                              Специалист скоро свяжется с вами и поможет подобрать лучший вариант.
                            </p>
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                              <Button as="a" href={brand.telegramUrl} target="_blank" rel="noreferrer" variant="ghost">
                                Написать в Telegram
                              </Button>
                              <Button type="button" onClick={() => setOpen(false)}>
                                Продолжить просмотр
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="relative mt-5">
                          <div className={`grid gap-3 sm:grid-cols-2 ${unlocked ? '' : 'pointer-events-none select-none blur-[2.5px]'}`}>
                            {visiblePlans.map(renderPlanCard)}
                          </div>

                          {!unlocked && (
                            <div className="absolute inset-x-0 top-0 z-10 flex justify-center p-2 sm:p-5">
                              <form
                                onSubmit={handleSubmit}
                                className="w-full max-w-xl rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_70px_rgba(31,41,55,0.20)] backdrop-blur-xl sm:p-6"
                              >
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                                  Доступ к подборке
                                </p>
                                <h3 className="mt-3 text-[1.45rem] font-bold leading-tight tracking-tight sm:text-2xl">
                                  Откройте подборку с планировками и ценами
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                                  Мы уже подобрали варианты квартир под ваши ответы. Оставьте контакт — откроем планировки и отправим условия ипотеки под 2%.
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-[rgba(31,41,55,0.60)]">
                                  Без спама и навязчивых звонков. Сначала уточним задачу и покажем подходящие варианты.
                                </p>

                                <div className="mt-5 grid gap-3">
                                  <input
                                    value={lead.name}
                                    onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))}
                                    placeholder="Имя"
                                    className="focus-ring h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[#fffdf8] px-4 text-base"
                                    autoComplete="name"
                                  />
                                  <input
                                    type="tel"
                                    value={lead.phone}
                                    onChange={(event) => setLead((prev) => ({ ...prev, phone: event.target.value }))}
                                    placeholder="Телефон"
                                    className="focus-ring h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[#fffdf8] px-4 text-base"
                                    autoComplete="tel"
                                  />
                                  <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="min-h-12 w-full px-5 py-3 text-center leading-tight"
                                  >
                                    {isSubmitting ? 'Открываем подборку...' : 'Открыть подборку'}
                                  </Button>
                                </div>

                                <input
                                  tabIndex={-1}
                                  autoComplete="off"
                                  aria-hidden="true"
                                  className="hidden"
                                  name="company"
                                  value={lead.company}
                                  onChange={(event) => setLead((prev) => ({ ...prev, company: event.target.value }))}
                                />

                                <p className="mt-3 text-xs leading-relaxed text-[color:var(--muted)]">
                                  После отправки формы подборка откроется на этой странице. Нажимая кнопку, вы соглашаетесь с{' '}
                                  <Link
                                    href="/privacy-policy"
                                    className="font-semibold text-[color:var(--accent2)] underline-offset-4 hover:underline"
                                  >
                                    политикой конфиденциальности
                                  </Link>
                                  .
                                </p>
                                {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

                                <div className="mt-5 grid gap-2 text-sm text-[#111827] sm:grid-cols-2">
                                  {trustItems.map((item) => (
                                    <span key={item} className="inline-flex items-center gap-2">
                                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color:var(--accent2)] text-[10px] font-bold text-white">✓</span>
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step !== 'apartment' && step !== 'results' && (
                  <Button type="button" variant="ghost" className="mt-5 rounded-full !px-4 !py-2" onClick={goBack}>
                    ← Назад
                  </Button>
                )}
              </section>
            </div>

            <button
              type="button"
              aria-label="Закрыть квиз"
              className="focus-ring absolute right-4 top-4 z-[81] grid h-8 w-8 place-items-center rounded-full border border-[#eadfcd] bg-[#fbf7ef]/95 text-base font-semibold leading-none text-[#6e5535] shadow-[0_8px_22px_rgba(31,41,55,0.10)] transition hover:border-[#d7c4a5] hover:bg-white hover:text-[#1f2937] sm:right-5 sm:top-5"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function QuizQuestion({ title, description, children }) {
  return (
    <div className="min-w-0">
      <h2 className="max-w-full break-words text-[1.55rem] font-bold leading-tight tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChoiceButton({ active, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group flex min-h-[92px] w-full items-start justify-between gap-3 rounded-[22px] border p-4 text-left transition ${
        active
          ? 'border-[color:var(--accent2)] bg-[color:var(--accent2)] text-white shadow-[0_16px_30px_rgba(123,165,154,0.24)]'
          : 'border-[#eadfcd] bg-white hover:border-[color:var(--accent2)] hover:bg-[#fffaf2]'
      }`}
    >
      <span className="min-w-0">
        <span className="block break-words text-base font-bold leading-tight">{title}</span>
        <span className={`mt-1.5 block text-xs font-semibold leading-snug ${active ? 'text-white/76' : 'text-[color:var(--muted)]'}`}>
          {text}
        </span>
      </span>
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition ${
          active
            ? 'border-white bg-white text-[color:var(--accent2)]'
            : 'border-[#d7c5aa] text-transparent group-hover:border-[color:var(--accent2)]'
        }`}
        aria-hidden="true"
      >
        ✓
      </span>
    </button>
  );
}

export function openFloorplanQuiz() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}
