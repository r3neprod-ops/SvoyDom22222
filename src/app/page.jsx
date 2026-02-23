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

      <div
        className="relative"
        style={{
          backgroundImage: 'url(https://cdn.builder.io/api/v1/image/assets%2F5940eccd50a845709f0c0fa0a222cdc1%2F6e6b28460afc4aa4a8fb711213fa8d32)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <section id="hero" className="relative pt-28 pb-16 md:pt-36 md:pb-24">
          {/* Mascot Layer */}
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F5940eccd50a845709f0c0fa0a222cdc1%2Ff96af0c12b084e3595a0f7073f704db2?format=webp&width=800&height=1200"
            alt="Mascot"
            className="absolute right-0 top-0 z-10 hidden h-auto w-96 md:block"
          />
          <Container className="flex flex-col gap-5">
            {/* Hero Text Panel - localized backdrop only under content */}
            <div
              className="reveal max-w-xl sm:max-w-2xl md:max-w-3xl rounded-[18px] md:rounded-[22px] p-4 sm:p-5 md:p-6 border border-[rgba(17,24,39,0.10)]"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(10px) saturate(120%)',
                WebkitBackdropFilter: 'blur(10px) saturate(120%)',
                boxShadow: '0 18px 50px rgba(17,24,39,0.10)',
              }}
            >
              <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[rgba(17,24,39,0.55)]">Я помогу тебе оформить ипотеку и выбрать идеальный ЖК</p>
              <h1 className="max-w-3xl text-4xl leading-[1.08] tracking-tight text-[#111827] md:text-6xl">Квартира в ипотеку под 2%</h1>
              <p className="mt-6 max-w-2xl text-base leading-[1.625] text-[rgba(17,24,39,0.72)]">Помогу разобраться, выбрать квартиру и оформить ипотеку — доведу до сделки.</p>
              <p className="mt-3 text-sm text-[rgba(17,24,39,0.72)]">Для вас это бесплатно: работаю по партнёрской программе с застройщиками Луганска.</p>
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
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[rgba(17,24,39,0.72)]">
                <a className="focus-ring rounded-lg px-1" href={`tel:${brand.phoneHref}`}>{brand.phoneDisplay}</a>
                <a className="focus-ring rounded-lg px-1" href={brand.telegramUrl} target="_blank" rel="noreferrer">Telegram</a>
              </div>
            </div>
          </Container>
        </section>

        <LeadFormSection />
      </div>

      <section id="services" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader title="Помогу выбрать ЖК и оформить ипотеку, взяв на себя все этапы работы с банками и застройщиками." />
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
          <SectionHeader title="Жилые комплексы" subtitle="Сравните ключевые варианты и выберите формат, который подходит под ваш сценарий покупки." />
          <div className="space-y-4">
            {/* Top row: 2 cards side by side */}
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
            {/* Bottom row: single card centered */}
            <div className="flex justify-center">
              <div className="w-full sm:w-[calc(50%-8px)]">
                {complexes.slice(2).map((item) => (
                  <ComplexCarouselCard key={item.id} complex={item} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="process" className="bg-[color:var(--bg2)] py-20 md:py-28">
        <Container>
          <SectionHeader title="Пошаговое сопровождение до подписания договора" />
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
          <SectionHeader title="Что говорят клиенты" />
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
          <SectionHeader title="Частые вопросы" />
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
          <SectionHeader title="Оставьте заявку или напишите в Telegram" subtitle="Свяжусь с вами, уточню детали и покажу варианты, которые реально подходят." />
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
