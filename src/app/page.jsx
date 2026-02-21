import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import RevealOnScroll from '@/components/RevealOnScroll';
import SlotBox from '@/components/SlotBox';

const directions = [
  { title: 'Инвестиционные квартиры', text: 'Лоты с прогнозируемой доходностью и ликвидностью.' },
  { title: 'Загородные резиденции', text: 'Тихие локации, приватность и архитектура статуса.' },
  { title: 'Коммерческие объекты', text: 'Премиальные активы для стабильного денежного потока.' },
];

const steps = [
  'Короткий бриф и фиксация целей.',
  'Подборка релевантных объектов и финансовая модель.',
  'Переговоры, юридическая экспертиза и закрытие сделки.',
  'Сопровождение после покупки и управление активом.',
];

const complexes = ['River Club Residence', 'Maison de Parc', 'The Linden Quarter'];
const services = ['Оценка и стратегия покупки', 'Юридическая и налоговая проверка', 'Комплектация и управление объектом'];
const reviews = [
  { name: 'Алексей В.', quote: 'Сделка прошла спокойно и без суеты. Чёткий сервис уровня private banking.' },
  { name: 'Марина К.', quote: 'Получили редкий объект до выхода в открытый рынок. Всё прозрачно и по делу.' },
];
const faqs = [
  { q: 'Сколько длится подбор?', a: 'Обычно 7–21 день, в зависимости от параметров и класса актива.' },
  { q: 'Работаете ли с зарубежными клиентами?', a: 'Да, полностью дистанционный процесс с онлайн-согласованием этапов.' },
];

export default function HomePage() {
  return (
    <main>
      <RevealOnScroll />

      <section id="hero" className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0" style={{ background: 'var(--heroGradient)' }} />
        <div className="absolute inset-0" style={{ background: 'var(--softFade)' }} />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="reveal">
              <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">Premium real estate advisory</p>
              <h1 className="max-w-4xl tracking-tight text-4xl leading-[1.08] md:text-6xl">Недвижимость с характером, которая работает на ваш капитал.</h1>
              <p className="mt-6 max-w-2xl text-base leading-[1.625] text-[color:var(--muted)]">
                Подбираем и сопровождаем премиальные объекты: от городской классики до инвестиционных лотов с потенциалом роста.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button as="a" href="#contacts" variant="primary">Обсудить задачу</Button>
                <Button as="a" href="#directions" variant="secondary">Смотреть направления</Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[color:var(--muted)]">
                <a className="focus-ring rounded-lg px-1" href="tel:+79990000000">+7 (999) 000-00-00</a>
                <a className="focus-ring rounded-lg px-1" href="mailto:concierge@svoydom.ru">concierge@svoydom.ru</a>
                <span>Москва · Санкт-Петербург · Сочи</span>
              </div>
            </div>
            <div className="reveal h-80 md:h-[28rem]">
              <SlotBox className="h-full" />
            </div>
          </div>
        </Container>
      </section>

      <section id="directions" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="Направления" title="Точное попадание в ваши сценарии" subtitle="Каждое направление — отдельная стратегия под цели семьи, капитала или бизнеса." />
          <div className="grid gap-6 md:grid-cols-3">
            {directions.map((item) => (
              <Card key={item.title} className="reveal">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[color:var(--accent2)]">Expertise</p>
                <h3 className="text-2xl tracking-tight leading-[1.15]">{item.title}</h3>
                <p className="mt-3 text-[color:var(--muted)]">{item.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="cta" className="py-20 md:py-24">
        <Container>
          <Card className="reveal p-8 md:p-12" >
            <div className="rounded-2xl p-8 md:p-12" style={{ background: 'var(--heroGradient)' }}>
              <h3 className="max-w-3xl text-3xl leading-[1.1] tracking-tight md:text-5xl">Закрываем сделки quietly, быстро и с сильной переговорной позицией.</h3>
              <p className="mt-4 max-w-2xl text-[color:var(--muted)]">Фиксируем цену, сроки и риски до подписания — чтобы вы чувствовали контроль на каждом этапе.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button as="a" href="#contacts">Получить персональный план</Button>
                <Button as="a" href="#steps" variant="ghost">Как мы работаем</Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      <section id="steps" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="Этапы" title="Прозрачный путь от запроса до ключей" />
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, idx) => (
              <Card key={step} className="reveal">
                <p className="text-sm text-[color:var(--accent)]">0{idx + 1}</p>
                <p className="mt-2 text-lg">{step}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="complexes" className="py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="ЖК" title="Актуальные премиальные комплексы" />
          <div className="grid gap-6 md:grid-cols-3">
            {complexes.map((name) => (
              <Card key={name} className="reveal min-h-44">
                <SlotBox className="mb-6 h-28" />
                <h3 className="text-xl tracking-tight">{name}</h3>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="services" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="Услуги" title="Консьерж-сопровождение полного цикла" />
          <div className="grid gap-5 md:grid-cols-3">
            {services.map((item) => (
              <Card key={item} className="reveal">
                <p className="text-lg tracking-tight">{item}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="reviews" className="py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="Отзывы" title="Что говорят клиенты" />
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((review) => (
              <Card key={review.name} className="reveal">
                <p className="text-lg text-[color:var(--text)]">“{review.quote}”</p>
                <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">{review.name}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="faq" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="FAQ" title="Частые вопросы" />
          <div className="space-y-4">
            {faqs.map((item) => (
              <Card key={item.q} className="reveal">
                <h3 className="text-xl tracking-tight">{item.q}</h3>
                <p className="mt-2 text-[color:var(--muted)]">{item.a}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="contacts" className="py-20 md:py-28">
        <Container>
          <SectionHeader
            eyebrow="Контакты"
            title="Обсудим вашу задачу лично"
            subtitle="Ответим в тот же день и предложим 2–3 точных сценария под ваш бюджет и горизонт инвестирования."
          />
          <Card className="reveal">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">Private desk</p>
                <a href="tel:+79990000000" className="mt-2 block text-2xl tracking-tight focus-ring rounded-lg">+7 (999) 000-00-00</a>
              </div>
              <Button as="a" href="mailto:concierge@svoydom.ru" variant="primary">Написать concierge</Button>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
