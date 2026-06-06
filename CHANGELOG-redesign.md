# VS FORNI — редизайн: список изменений и чек-лист перед деплоем

Презентационный слой переписан полностью; архитектура (данные, формы, SEO,
роутинг, content collections) сохранена. Добавлена мультиязычность RU + EN.

## Что изменено (визуальный слой)

**Токены и стили**
- `src/styles/tokens.css` — модернизированы: корень 16px + `clamp()` вместо
  легаси 10px-масштабирования; палитра «Жар» (графит #1B1714 + янтарь #E07B1A,
  текстовый акцент #A8560C). Имена легаси-переменных сохранены как алиасы.
- `src/styles/fonts.css` — self-hosted Onest (400–800) + IBM Plex Mono (400/500),
  кириллица+латиница через `unicode-range`, `font-display: swap`.
- `src/styles/global.css` — заголовки на Onest, размеры через токены.
- `public/fonts/` — 14 woff2 (Onest + IBM Plex Mono). Старых шрифтов нет.

**Компоненты и шаблоны**
- Новый `src/components/layout/Logo.astro` — инлайн монохромный SVG (`currentColor`).
- `Header.astro` (топбар + липкий бар, переключатель языка, бургер),
  `Footer.astro` (тёмный, JSON-LD Organization сохранён), `BaseLayout.astro`.
- 7 секций главной (Hero с видео, Catalog, Geography, Services, Design, Leasing, Callback).
- Шаблоны каталога: хаб, категория, группа, товар + `ProductCard`,
  `ProductSpecsTable`, `RelatedProducts`, `Breadcrumbs`.
- Статические: история, галерея, 404.
- `Button.astro` и `Modal.astro` — только разметка/стили; бэкенд форм, honeypot,
  SmartCaptcha, endpoints, JS-логика отправки — без изменений.

**Мультиязычность RU + EN (только UI-строки)**
- `src/i18n/ru.ts` (расширен), `src/i18n/en.ts` (новый, 109 ключей),
  `src/i18n/index.ts` (`useTranslations`/`getLang`/`localizeUrl`/`plural`).
- `astro.config.mjs` — i18n: `defaultLocale: 'ru'`, `prefixDefaultLocale: false`
  (RU в корне, EN под `/en/`).
- Компоненты/страницы locale-aware через `Astro.currentLocale`; внутренние ссылки
  локализуются; переключатель языка в хедере; `<html lang>` + hreflang ru/en/x-default
  + canonical на локаль.
- Зеркала маршрутов под `src/pages/en/` (включая весь каталог).

## Что НЕ менялось
- Структура URL и `data/redirects-301.json` (71 редирект 301).
- Content collections и данные (`src/content/*`, `data/*.json`).
- API-роуты форм и бэкенд (Zod, honeypot, SmartCaptcha, nodemailer, Telegram, логи).
- SEO-мета, canonical, JSON-LD, sitemap, Яндекс.Метрика, `middleware.ts`, перф.

## Контент товаров (167 шт.) — RU
UI на `/en/` переведён, но названия/описания/характеристики товаров остаются
русскими. Перевод контента — отдельным шагом (тексты от заказчика или черновик
по согласованию).

## Заметки по сопровождению
- **Дублирование `/en/`**: страницы под `src/pages/en/` — копии корневых с
  поправкой глубины импортов (+1 уровень). При будущих правках страниц менять
  обе версии (RU в корне и EN в `/en/`).
- **Крошки каталога**: средние сегменты (категория/группа) показывают slug, а не
  заголовок — исходное поведение, завязанное на BreadcrumbList JSON-LD. Можно
  улучшить отдельной правкой (подмена и label, и JSON-LD name).
- **Поиск/фильтр/PDF-спека**: заложены визуально как заглушки «этап B»; клиентскую
  логику включить отдельным под-этапом.

## Статус QA
- `pnpm typecheck` (astro check): 0 ошибок, 0 предупреждений (42 безвредных hint).
- `pnpm build`: зелёный; sitemap 508 URL (RU + EN); 167 товаров × 2 локали.

## Чек-лист перед деплоем
1. Установить зависимости: `pnpm install`.
2. Переменные окружения (формы/captcha/почта/Telegram) — задать на Vercel:
   `SMARTCAPTCHA_CLIENT_KEY`, серверный ключ captcha, SMTP-доступы, токен/чат Telegram
   (см. `.env.example`).
3. `public/uploads/` (медиа) — в облегчённый архив не входит; на деплое/в основном
   репозитории каталог уже присутствует. Убедиться, что он на месте.
4. `pnpm build` локально — убедиться, что зелёный.
5. После деплоя — живой тест форм (заявка/звонок/прайс/проектирование), приходят ли
   письма и сообщения в Telegram.
6. Проверить редиректы 301 на проде (несколько из `redirects-301.json`).
7. Lighthouse (perf/SEO/доступность) на главной, странице товара и `/en/`.
8. Проверить переключатель RU↔EN на нескольких типах страниц.
