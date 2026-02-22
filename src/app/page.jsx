import Header from '@/components/layout/Header';
import RevealOnScroll from '@/components/RevealOnScroll';
import LeadFormSection from '@/components/sections/LeadFormSection';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import ComplexCarouselCard from '@/components/complexes/ComplexCarouselCard';
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
          <div className="reveal max-w-4xl bg-transparent p-4 shadow-none backdrop-blur-0 sm:p-5 md:p-7">
            <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[rgba(17,24,39,0.55)]">Я помогу тебе оформить ипотеку и выбрать идеальный ЖК</p>
            <h1 className="max-w-3xl text-4xl leading-[1.08] tracking-tight text-[#111827] [text-shadow:0_1px_0_rgba(255,255,255,0.35)] md:text-6xl">Квартира в ипотеку под 2%</h1>
            <p className="mt-6 max-w-2xl text-base leading-[1.625] text-[rgba(17,24,39,0.70)]">Помогу разобраться, выбрать квартиру и оформить ипотеку — доведу до сделки.</p>
            <p className="mt-3 text-sm text-[rgba(17,24,39,0.70)]">Для вас это бесплатно: работаю по партнёрской программе с застройщиками Луганска.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button as="a" href="#lead-form">Получить консультацию</Button>
              <Button
                as="a"
                href={brand.telegramUrl}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                className="border-[rgba(17,24,39,0.14)] bg-[rgba(255,255,255,0.35)] text-[#111827] [backdrop-filter:blur(12px)_saturate(140%)] hover:bg-[rgba(255,255,255,0.48)] hover:shadow-[0_10px_30px_rgba(17,24,39,0.10)] active:bg-[rgba(255,255,255,0.55)]"
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
          <SectionHeader eyebrow="ЖК" title="Жилые комплексы" subtitle="Сравните ключевые варианты и выберите формат, который подходит под ваш сценарий покупки." />
          <div className="space-y-4">
            <div
              className="relative rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
              style={{
                backgroundImage: 'url()',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {complexes.slice(0, 2).map((item) => (
                <ComplexCarouselCard key={item.id} complex={item} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {complexes.slice(2).map((item) => (
                <ComplexCarouselCard key={item.id} complex={item} />
              ))}
            </div>
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
          <div className="mb-6 rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.68)] p-5">
            <h3 className="text-xl tracking-tight">Почему для вас бесплатно?</h3>
            <p className="mt-2 text-[color:var(--muted)]">Я сотрудничаю с застройщиками по Луганску. Когда вы выходите на сделку, застройщик оплачивает мою работу как партнёру. Для вас цена квартиры не меняется — вы получаете консультацию и сопровождение бесплатно.</p>
          </div>
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
          <SectionHeader eyebrow="Контакты" title="Оставьте заявку или напишите в Telegram" subtitle="Свяжусь с вами, уточню детали и покажу варианты, которые реально подходят." />
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
