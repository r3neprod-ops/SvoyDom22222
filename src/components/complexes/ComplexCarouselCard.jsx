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
      <div className="relative h-44 overflow-hidden rounded-2xl">
        {complex.photos.map((photoKey, index) => (
          <div
            key={photoKey}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <SlotBox
              kind="image"
              slotKey={`complex-${complex.id}-photo-${index + 1}`}
              fileHint={`complex-${complex.id}-photo-${index + 1}.jpg`}
              className="h-full"
              backgroundImage={complex.backgroundImage}
            >
              {index === activeIndex && complex.extraImage && (
                <img
                  loading="lazy"
                  srcSet={complex.extraImage.srcSet}
                  style={{
                    aspectRatio: '1.42',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    marginTop: '20px',
                    minHeight: '20px',
                    minWidth: '20px',
                    overflow: 'hidden',
                  }}
                />
              )}
            </SlotBox>
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

      <h3 className="mt-4 text-lg tracking-tight">{complex.title}</h3>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{complex.subtitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {complex.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--muted)]">
            {tag}
          </span>
        ))}
      </div>
      <a href="#contacts" className="mt-4 inline-flex text-sm text-[color:var(--accent2)] hover:underline">
        Подробнее
      </a>
    </Card>
  );
}
