'use client';

import { useState } from 'react';
import brand from '@/data/brand';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

const navItems = [
  { label: 'Услуги', href: '#services' },
  { label: 'ЖК', href: '#complexes' },
  { label: 'Как работаю', href: '#process' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border)] bg-white/70 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-[72px]">
          <a href="#hero" className="focus-ring rounded-lg text-sm font-semibold tracking-wide md:text-base">
            {brand.brand}
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="focus-ring rounded-lg text-sm text-[color:var(--muted)] hover:text-[color:var(--text)]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <a href={brand.telegramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/60 backdrop-blur border border-black/10 transition-all duration-200 hover:bg-white/80 hover:shadow-sm focus-ring" aria-label="Telegram">
              <img src="https://cdn.builder.io/api/v1/image/assets%2F5940eccd50a845709f0c0fa0a222cdc1%2F7def010d40904925836513619b3c1e8c?format=webp&width=800&height=1200" alt="Telegram" className="h-20 w-20 block object-contain" />
            </a>
            <Button as="a" href="#lead-form" variant="primary" className="!px-5">Подобрать варианты</Button>
            <Button as="a" href={`tel:${brand.phoneHref}`} variant="secondary" className="!px-5">Позвонить</Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button as="a" href="#lead-form" variant="primary" className="!px-4 !py-2 text-xs">Подобрать варианты</Button>
            <button
              type="button"
              aria-label="Открыть меню"
              onClick={() => setOpen((prev) => !prev)}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)]"
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="border-t border-[color:var(--border)] bg-white/95 md:hidden">
          <Container className="py-4">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="focus-ring rounded-lg py-1 text-sm" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
              <a href={brand.telegramUrl} target="_blank" rel="noreferrer" className="focus-ring rounded-lg py-1 text-sm" onClick={() => setOpen(false)}>
                Telegram
              </a>
              <a href={`tel:${brand.phoneHref}`} className="focus-ring rounded-lg py-1 text-sm" onClick={() => setOpen(false)}>
                {brand.phoneDisplay}
              </a>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
