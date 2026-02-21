import Header from '@/components/layout/Header';
import RevealOnScroll from '@/components/RevealOnScroll';
import LeadFormSection from '@/components/sections/LeadFormSection';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import brand from '@/data/brand';
import complexes from '@/data/complexes';
import faq from '@/data/faq';
import processSteps from '@/data/process';
import reviews from '@/data/reviews';
import services from '@/data/services';

export default function HomePage() {
  return (
    <main>
      <RevealOnScroll />
      <Header />

      <section id="hero" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="absolute inset-0" style={{ background: 'var(--heroGradient)' }} />
        <div className="absolute inset-0" style={{ background: 'var(--softFade)' }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(246,244,240,0.92) 0%, rgba(246,244,240,0.78) 40%, rgba(246,244,240,0.35) 70%, rgba(246,244,240,0.10) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(246,244,240,0.75) 0%, rgba(246,244,240,0.55) 55%, rgba(246,244,240,0.70) 100%)',
          }}
        />
        <Container className="relative">
          <div className="reveal max-w-4xl rounded-[20px] border border-[rgba(17,24,39,0.10)] bg-[rgba(255,255,255,0.55)] p-4 shadow-[0_18px_50px_rgba(17,24,39,0.12)] backdrop-blur-[10px] sm:p-5 md:p-7">
            <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[rgba(17,24,39,0.55)]">Я помогу тебе оформить ипотеку и выбрать идеальный ЖК</p>
            <h1 className="max-w-3xl text-4xl leading-[1.08] tracking-tight text-[#111827] [text-shadow:0_1px_0_rgba(255,255,255,0.35)] md:text-6xl">Квартира в ипотеку под 2%</h1>
            <p className="mt-6 max-w-2xl text-base leading-[1.625] text-[rgba(17,24,39,0.70)]">Помогаю выбрать ЖК и оформить ипотеку — бесплатно для вас</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button as="a" href="#lead-form">Подобрать варианты</Button>
              <Button
                as="a"
                href={brand.telegramUrl}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                className="border-[rgba(17,24,39,0.14)] bg-[rgba(255,255,255,0.40)] text-[color:var(--text)] backdrop-blur-[10px] hover:bg-[rgba(255,255,255,0.55)] hover:shadow-md active:bg-[rgba(255,255,255,0.32)]"
              >
                Написать в Telegram
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[rgba(17,24,39,0.70)]">
              <a className="focus-ring rounded-lg px-1" href={`tel:${brand.phoneHref}`}>{brand.phoneDisplay}</a>
              <a className="focus-ring rounded-lg px-1" href={brand.telegramUrl} target="_blank" rel="noreferrer">Telegram</a>
            </div>
          </div>
        </Container>
      </section>

      <LeadFormSection />

      <section id="services" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader
            eyebrow="Мои услуги"
            title="Помогу выбрать ЖК и оформить ипотеку, взяв на себя все этапы работы с банками и застройщиками."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => (
              <Card key={item.title} className="reveal">
                <h3 className="text-xl tracking-tight leading-[1.15]">{item.title}</h3>
                <p className="mt-3 text-[color:var(--muted)]">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="complexes" className="py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="ЖК" title="Подборка актуальных комплексов" subtitle="Подберу подходящие варианты под ваши цели, бюджет и желаемый район." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {complexes.map((item) => (
              <Card key={item.title} className="reveal">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--accent2)]">Жилой комплекс</p>
                <h3 className="mt-3 text-2xl tracking-tight leading-[1.12]">{item.title}</h3>
                <p className="mt-3 text-[color:var(--muted)]">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="process" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="Как я работаю" title="Пошаговое сопровождение до подписания договора" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((item, idx) => (
              <Card key={item.title} className="reveal">
                <p className="text-sm text-[color:var(--accent)]">0{idx + 1}</p>
                <h3 className="mt-2 text-xl tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[color:var(--muted)]">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="reviews" className="py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="Отзывы" title="Что говорят клиенты" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.name + review.sourceLabel} className="reveal">
                <p className="text-base">“{review.text}”</p>
                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">{review.sourceLabel}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{review.name}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="faq" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader eyebrow="FAQ" title="Частые вопросы" />
          <div className="space-y-4">
            {faq.map((item) => (
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
          <SectionHeader eyebrow="Контакты" title="Оставьте заявку или напишите в Telegram" subtitle="Свяжусь с вами, уточню детали и отправлю подборку по вашим параметрам." />
          <Card className="reveal">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <a href={`tel:${brand.phoneHref}`} className="focus-ring block rounded-lg text-2xl tracking-tight">{brand.phoneDisplay}</a>
                <a href={brand.telegramUrl} target="_blank" rel="noreferrer" className="focus-ring mt-2 inline-block rounded-lg text-[color:var(--accent2)]">Написать в Telegram</a>
              </div>
              <div className="text-sm text-[color:var(--muted)]">
                <p>{brand.ipLabel}</p>
                <p className="mt-1">{brand.ipInn}</p>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
