'use client';

import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import SlotBox from '@/components/SlotBox';

function hashString(value) {
  return value.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);
}

export default function ComplexCarouselCard({ complex }) {
  const slidesCount = complex.photos.length;
  const seed = useMemo(() => hashString(complex.id), [complex.id]);
  const initialIndex = seed % slidesCount;
  const initialDelay = (seed % 2000) + 200;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (paused) return undefined;

    let timer;
    const startTimeout = setTimeout(() => {
      timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % slidesCount);
      }, 3000);
    }, initialDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [initialDelay, paused, slidesCount]);

  return (
    <Card
      className="reveal h-full p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-48 overflow-hidden rounded-2xl">
        {complex.photos.map((photoKey, index) => (
          <div
            key={photoKey}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ pointerEvents: index === activeIndex ? 'auto' : 'none' }}
          >
            {index === activeIndex && (
              <SlotBox
                className="h-full"
                backgroundImage={
                  Array.isArray(complex.backgroundImages)
                    ? complex.backgroundImages[index]
                    : complex.backgroundImage
                }
              />
            )}
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {complex.photos.map((photoKey, index) => (
            <button
              key={`${photoKey}-dot`}
              type="button"
              className={`h-1.5 w-1.5 rounded-full ${index === activeIndex ? 'bg-white' : 'bg-white/55'}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <h3 className="mt-4 text-xl font-bold tracking-tight">{complex.title}</h3>
      {complex.keyAdvantage && (
        <p className="mt-1 text-sm font-medium text-[color:var(--accent2)]">✓ {complex.keyAdvantage}</p>
      )}
      <p className="mt-1.5 text-sm text-[color:var(--muted)]">{complex.subtitle}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {complex.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--muted)]">
            {tag}
          </span>
        ))}
      </div>
      <a href="#lead-form" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--accent2)] px-4 py-2 text-sm font-medium text-[color:var(--accent2)] transition hover:bg-[color:var(--accent2)] hover:text-white">
        Узнать цены и планировки →
      </a>
    </Card>
  );
}
