'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import {
  budgetChoices,
  getBudgetChoice,
  getFloorPlanMatches,
  getRoomChoice,
  roomChoices,
} from '@/data/floorplans';

const OPEN_EVENT = 'open-floorplan-quiz';
const LANDING_SOURCE = 'svoydom_lugansk';
const FORM_SECTION = 'floorplan_quiz_popup';

const stepMeta = {
  budget: { index: 1, label: 'Бюджет', progress: 33 },
  rooms: { index: 2, label: 'Комнатность', progress: 66 },
  results: { index: 3, label: 'Подборка', progress: 100 },
};

const emptyLead = {
  name: '',
  phone: '',
  company: '',
};

function getPlanWord(count) {
  if (count === 1) return 'планировку';
  if (count > 1 && count < 5) return 'планировки';
  return 'планировок';
}

function formatArea(area) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(area);
}

function getResultIntro(hasExactMatches) {
  return hasExactMatches
    ? 'Показываем найденные варианты по вашим параметрам.'
    : 'Точных вариантов в бюджете пока нет, поэтому показываем ближайшие найденные планировки.';
}

function serializePlan(plan) {
  return {
    id: plan.id,
    complex: plan.complex,
    title: plan.title,
    rooms: plan.roomLabel,
    area: plan.area,
    price: plan.priceLabel,
    caption: plan.caption,
    source: `${plan.sourceName}, проверено ${plan.sourceChecked}`,
  };
}

export default function LeadFormSection() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState('budget');
  const [budget, setBudget] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [lead, setLead] = useState(emptyLead);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const lockedScrollYRef = useRef(0);
  const bodyStyleRef = useRef({});

  const selectedBudget = budget ? getBudgetChoice(budget) : null;
  const selectedRooms = rooms ? getRoomChoice(rooms) : null;
  const currentMeta = stepMeta[step];

  const matchedPlans = useMemo(() => {
    if (!budget || !rooms) return [];
    return getFloorPlanMatches(budget, rooms);
  }, [budget, rooms]);

  const hasExactBudgetMatches = useMemo(() => {
    if (!budget || !rooms) return true;

    const maxPrice = selectedBudget?.maxPriceRub ?? null;
    return matchedPlans.some((plan) => {
      const priceFits = maxPrice === null || plan.priceRub <= maxPrice;
      const roomsFit = rooms === 'any' || plan.rooms === rooms;
      return priceFits && roomsFit;
    });
  }, [budget, matchedPlans, rooms, selectedBudget?.maxPriceRub]);

  useEffect(() => {
    const openQuiz = () => {
      setOpen(true);
      setDone(false);
      setError('');
      setStep(budget && rooms ? 'results' : 'budget');
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
  }, [budget, rooms]);

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

  const scrollToContactForm = () => {
    if (modalRef.current && formRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const formRect = formRef.current.getBoundingClientRect();
      const targetTop = formRect.top - modalRect.top + modalRef.current.scrollTop - 16;
      modalRef.current.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    }

    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 420);
  };

  const selectBudget = (value) => {
    setBudget(value);
    setError('');
    setStep('rooms');
  };

  const selectRooms = (value) => {
    setRooms(value);
    setError('');
    setStep('results');
  };

  const goBack = () => {
    setError('');
    if (step === 'results') setStep('rooms');
    if (step === 'rooms') setStep('budget');
  };

  const restart = () => {
    setBudget(null);
    setRooms(null);
    setLead(emptyLead);
    setDone(false);
    setError('');
    setStep('budget');
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
            quiz: 'floorplan_quiz_popup',
            formSection: FORM_SECTION,
            budgetPreset: selectedBudget?.value || '',
            budget: selectedBudget?.label || '',
            apartmentType: selectedRooms?.value || '',
            rooms: selectedRooms?.label || '',
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
                  Подберём планировки под ваш бюджет за 2 вопроса
                </h2>
                <p className="mt-3 max-w-2xl text-[color:var(--muted)]">
                  Покажем реальные квартирные планировки из открытых источников, а менеджер уточнит наличие и свободные квартиры.
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
                      2 вопроса и реальные планировки
                    </p>
                    <h3
                      id="floorplan-quiz-title"
                      className="mt-2 max-w-md text-[1.55rem] font-bold leading-tight tracking-tight text-white sm:text-3xl"
                    >
                      Квартиры в новостройках Луганска под ваш бюджет
                    </h3>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    {['Бюджет', 'Комнатность', 'Планировки'].map((item, index) => {
                      const active = index + 1 <= currentMeta.index;
                      return (
                        <div
                          key={item}
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${
                            active
                              ? 'border-[#d7c4a5]/45 bg-white/10 text-white'
                              : 'border-white/10 bg-white/[0.03] text-white/52'
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                              active ? 'bg-[#d7c4a5] text-[#1f2937]' : 'bg-white/10 text-white/55'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-semibold">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <section ref={contentRef} className="min-w-0 p-4 sm:p-6 lg:overflow-y-auto lg:p-7">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    <span>
                      Шаг {currentMeta.index} из 3 · {currentMeta.label}
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

                {done ? (
                  <div className="min-w-0 py-4">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                      Заявка принята
                    </p>
                    <h2 className="mt-2 text-[1.6rem] font-bold leading-tight tracking-tight sm:text-3xl">
                      Подборка ушла менеджеру
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                      Свяжемся с вами, уточним актуальное наличие и покажем свободные квартиры по выбранным параметрам.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => setOpen(false)}>
                        Закрыть
                      </Button>
                      <Button type="button" variant="ghost" onClick={restart}>
                        Начать заново
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {step === 'budget' && (
                      <QuizQuestion
                        title="На какой бюджет ориентируетесь?"
                        description="Выберите верхнюю границу. Сначала фильтруем по цене, затем по комнатности."
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          {budgetChoices.map((choice) => (
                            <ChoiceButton
                              key={choice.value}
                              active={budget === choice.value}
                              title={choice.label}
                              text={choice.value === 'to-6' ? 'покажем самые доступные варианты' : 'подберём планировки в диапазоне'}
                              onClick={() => selectBudget(choice.value)}
                            />
                          ))}
                        </div>
                      </QuizQuestion>
                    )}

                    {step === 'rooms' && (
                      <QuizQuestion
                        title="Сколько комнат рассматриваете?"
                        description="Планировки не кликабельны: это витрина найденных вариантов, дальше наличие уточнит менеджер."
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          {roomChoices.map((choice) => (
                            <ChoiceButton
                              key={choice.value}
                              active={rooms === choice.value}
                              title={choice.label}
                              text={choice.value === 'any' ? 'покажем всё, что подходит по бюджету' : 'сравним найденные планировки'}
                              onClick={() => selectRooms(choice.value)}
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
                              Результат
                            </p>
                            <h2 className="mt-2 max-w-full break-words text-[1.55rem] font-bold leading-tight tracking-tight sm:text-3xl">
                              Подобрали {matchedPlans.length} {getPlanWord(matchedPlans.length)} под ваш запрос
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                              {selectedBudget?.label} · {selectedRooms?.label}. {getResultIntro(hasExactBudgetMatches)}
                            </p>
                          </div>
                          <Button type="button" variant="ghost" className="w-fit rounded-full !px-4 !py-2" onClick={goBack}>
                            ← Назад
                          </Button>
                        </div>

                        <p className="mt-4 rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-3 text-sm font-medium leading-relaxed text-[color:var(--muted)]">
                          Нажмите на любую планировку, и мы сразу переведём вас к форме связи для уточнения цены, этажа и свободных квартир.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {matchedPlans.map((plan) => (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={scrollToContactForm}
                              data-complex={plan.complex}
                              className="focus-ring group min-w-0 overflow-hidden rounded-[22px] border border-[#eadfcd] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--accent2)] hover:shadow-[0_16px_36px_rgba(31,41,55,0.12)]"
                              aria-label={`Оставить контакт по планировке ${plan.complex}, ${plan.title}`}
                            >
                              <div className="relative aspect-[4/3] bg-[#fffdf8]">
                                <Image
                                  src={plan.image}
                                  alt={`${plan.complex}: ${plan.title}`}
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
                                    {plan.caption}
                                  </h3>
                                  <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
                                    {plan.roomLabel} · {formatArea(plan.area)} м²
                                  </p>
                                </div>
                                <p className="rounded-xl bg-[#fbf7ef] px-3 py-2 text-[11px] font-semibold leading-snug text-[color:var(--muted)]">
                                  Источник: {plan.sourceName}, проверено {plan.sourceChecked}
                                </p>
                                <p className="text-xs font-bold text-[color:var(--accent2)] transition group-hover:translate-x-0.5">
                                  Уточнить наличие →
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>

                        <form
                          ref={formRef}
                          onSubmit={handleSubmit}
                          className="mt-5 grid gap-3 rounded-[24px] border border-[#eadfcd] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
                        >
                          <div className="min-w-0">
                            <label className="text-sm font-medium" htmlFor="floorplan-quiz-name">
                              Имя
                            </label>
                            <input
                              ref={nameInputRef}
                              id="floorplan-quiz-name"
                              value={lead.name}
                              onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))}
                              placeholder="Например, Анна"
                              className="focus-ring mt-1.5 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[#fffdf8] px-4 text-base"
                              autoComplete="name"
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="text-sm font-medium" htmlFor="floorplan-quiz-phone">
                              Телефон
                            </label>
                            <input
                              id="floorplan-quiz-phone"
                              type="tel"
                              value={lead.phone}
                              onChange={(event) => setLead((prev) => ({ ...prev, phone: event.target.value }))}
                              placeholder="+7 999 123 45 67"
                              className="focus-ring mt-1.5 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[#fffdf8] px-4 text-base"
                              autoComplete="tel"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="min-h-12 h-auto w-full px-5 py-3 text-center leading-tight sm:w-auto"
                            >
                              {isSubmitting ? 'Отправляем...' : 'Получить консультацию'}
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
                          <div className="sm:col-span-3">
                            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
                            <p className="mt-1 text-xs leading-relaxed text-[color:var(--muted)]">
                              Нажимая кнопку, вы соглашаетесь с{' '}
                              <Link
                                href="/privacy-policy"
                                className="font-semibold text-[color:var(--accent2)] underline-offset-4 hover:underline"
                              >
                                политикой конфиденциальности
                              </Link>
                              . Цены являются ориентиром по открытым источникам и уточняются перед бронью.
                            </p>
                          </div>
                        </form>
                      </div>
                    )}

                    {step !== 'budget' && step !== 'results' && (
                      <Button type="button" variant="ghost" className="mt-5 rounded-full !px-4 !py-2" onClick={goBack}>
                        ← Назад
                      </Button>
                    )}
                  </>
                )}
              </section>
            </div>

            <button
              type="button"
              aria-label="Закрыть квиз"
              className="focus-ring absolute right-5 top-5 z-[81] grid h-9 w-9 place-items-center rounded-full border border-white/45 bg-white/80 text-xl leading-none text-[#1f2937] shadow-sm transition hover:bg-white"
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
