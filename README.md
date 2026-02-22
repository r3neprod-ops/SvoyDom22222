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

## Builder: Редактирование фото жилых комплексов (Complex Cards)

### Нормальный режим (по умолчанию)
- Карточки ЖК показывают 3 фото в виде автоматического слайдера
- Фото меняются каждые 3 секунды (стагированно по ID комплекса)
- Слайдер паузится при наведении мыши

### Режим редактирования для Builder
Чтобы отредактировать все 3 фото **отдельно** в Builder:

1. **Включи edit mode:**
   ```bash
   # В .env.local добавь:
   NEXT_PUBLIC_BUILDER_EDIT=true
   ```
   или обнови переменную окружения в UI платформы.

2. **Эффект:**
   - Слайдер отключится ✓
   - Все 3 фото появятся в виде отдельных блоков под заголовком карточки ✓
   - Каждый блок можно кликнуть и отредактировать в Builder ✓
   - Меню "Photo Slots" подскажет какой слот какой ✓

3. **Обратно в нормальный режим:**
   ```bash
   # Удали NEXT_PUBLIC_BUILDER_EDIT из .env.local
   # или установи значение:
   NEXT_PUBLIC_BUILDER_EDIT=false
   ```
   - Слайдер автоматически включится ✓
   - Все 3 фото будут скрыты (видно только активное) ✓
   - Поведение вернётся к нормальному ✓

### Структура слотов
Каждая карточка имеет 3 слота для редактирования:
- `complex-{id}-photo-1`
- `complex-{id}-photo-2`
- `complex-{id}-photo-3`

Например, для комплекса "renovaciya":
- `complex-renovaciya-photo-1.jpg`
- `complex-renovaciya-photo-2.jpg`
- `complex-renovaciya-photo-3.jpg`
