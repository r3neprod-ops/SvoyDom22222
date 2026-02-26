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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border)] bg-white/60 backdrop-blur-xl">
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
            {/* Telegram Button - Minimal Style */}
            <a
              href={brand.telegramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="inline-flex items-center justify-center rounded-full transition-all duration-200 active:translate-y-0.5"
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(17,24,39,0.04)',
                border: '1px solid rgba(17,24,39,0.08)',
                boxShadow: 'none',
                color: 'rgba(17,24,39,0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(17,24,39,0.08)';
                e.currentTarget.style.borderColor = 'rgba(17,24,39,0.12)';
                e.currentTarget.style.color = 'rgba(17,24,39,0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(17,24,39,0.04)';
                e.currentTarget.style.borderColor = 'rgba(17,24,39,0.08)';
                e.currentTarget.style.color = 'rgba(17,24,39,0.6)';
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21.9 4.6c.3-1.2-.9-2.1-2-1.7L2.8 9.7c-1.2.5-1.2 2.2 0 2.7l4.6 1.8 1.7 5.3c.3 1 1.5 1.3 2.2.6l2.6-2.6 5 3.7c.9.7 2.2.2 2.4-1l2.7-15.6ZM8.1 13.7l10.8-7.2-8.5 8.6-.3 3.2-1.2-3.8-4.3-1.7 15.3-6.2-2.4 14.2-4.6-3.4-3.4 3.4.5-5.1-2-2Z" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <Button as="a" href="#lead-form" variant="primary" className="!px-5">Получить консультацию</Button>
            <Button as="a" href={`tel:${brand.phoneHref}`} variant="secondary" className="!px-5">Позвонить</Button>
            <span
              className="hidden lg:inline-block"
              style={{
                marginLeft: '18px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#111827',
                letterSpacing: '0.2px',
                opacity: 0.9,
                lineHeight: '1',
              }}
            >
              +7 959 026-00-36
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button as="a" href="#lead-form" variant="primary" className="!px-4 !py-2 text-xs">Получить консультацию</Button>
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
