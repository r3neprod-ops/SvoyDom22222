# Svoy Dom Landing (Next.js + Tailwind)

Премиальный одностраничный лендинг на **Next.js (App Router)** и **TailwindCSS**.

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Скрипты

- `npm run dev` — локальная разработка.
- `npm run build` — production-сборка.
- `npm run start` — запуск production-сборки.
- `npm run lint` — lint проверка (Next.js ESLint).

## Деплой на Vercel

1. Запушить репозиторий в GitHub.
2. Импортировать проект в Vercel.
3. Build command: `npm run build`.
4. Output: стандартный для Next.js (без ручной настройки).

## Где менять тему

Палитра и градиенты находятся в:

- `src/app/globals.css` в блоке `:root`.

Там же настроены базовые токены теней, рамок, анимации reveal, focus-ring и smooth-scroll.
