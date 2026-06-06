# Чек-лист запуска vsforni.ru

Дата подготовки: 2026-06-02

---

## За день до запуска

- [ ] Сделать полный бэкап старого сайта (файлы + БД MODX)
- [ ] Убедиться что TTL DNS снижен до 300s (5 минут) для быстрого переключения
- [ ] Проверить все формы на staging: callback, price-request, reviews-request, design-request
- [ ] Убедиться что `.env` содержит все необходимые переменные (SMTP, SmartCaptcha, Metrika)
- [ ] Прогнать `pnpm lint && pnpm typecheck && pnpm build` — должно быть 0 ошибок
- [ ] Проверить что `pnpm build` стабилен на двух последовательных запусках

## День запуска

### 1. Развёртывание на сервере

```bash
# На сервере (Selectel/Timeweb):
git pull origin main
pnpm install --frozen-lockfile
pnpm build
# или скопировать dist/ со своей машины

# Запустить Node.js server
node dist/server/entry.mjs
# или через pm2:
pm2 start dist/server/entry.mjs --name vsforni
```

### 2. Caddy / Nginx

- [ ] Скопировать `Caddyfile` на сервер
- [ ] Проверить синтаксис: `caddy validate`
- [ ] Применить конфиг: `caddy reload`
- [ ] Убедиться что 301-редиректы работают:
  ```
  curl -I https://vsforni.ru/katalog-oborudovaniya-vs-forni/testomesyi,-mikseryi/
  # ожидаем: HTTP/2 301
  # Location: /katalog-oborudovaniya-vs-forni/testopodgotovka/
  ```

### 3. Переключение DNS

- [ ] Изменить A-запись domain → IP нового сервера
- [ ] Дождаться распространения (~5 минут при TTL=300)
- [ ] Проверить через `curl -H "Host: vsforni.ru" http://new-server-ip/`

### 4. Проверки после переключения

- [ ] Главная страница открывается, видео загружается
- [ ] Тест форм на проде: отправить тестовый callback → проверить что письмо пришло на vsfornirus@yandex.ru
- [ ] Проверить SSL-сертификат (Caddy получает автоматически от Let's Encrypt)
- [ ] Открыть 5 случайных страниц каталога — проверить корректность
- [ ] Проверить 301: `/katalog-oborudovaniya-vs-forni/testomesyi,-mikseryi/testodelitel/vsvd-4000` → должен редиректить на `/testopodgotovka/...`
- [ ] Убедиться что `/robots.txt` отдаётся корректно
- [ ] Убедиться что `/sitemap-index.xml` доступен

### 5. Поисковые системы

- [ ] **Яндекс.Вебмастер** — добавить новый сайт / подтвердить права
  - Запросить переобход: Инструменты → Переобход страниц
  - Отправить sitemap: `https://vsforni.ru/sitemap-index.xml`
- [ ] **Google Search Console** — добавить/подтвердить сайт
  - Запросить индексацию: URL-инспектор → Запросить индексацию
  - Отправить sitemap
- [ ] Проверить что счётчик Яндекс.Метрики отображается в реальном времени

### 6. Через 48 часов

- [ ] Проверить Search Console на наличие ошибок 404 / проблем с robots.txt
- [ ] Убедиться что позиции по основным запросам не упали критически
- [ ] Проверить логи форм: `cat logs/forms-*.jsonl`

---

## Решение непредвиденных проблем

| Проблема | Действие |
|----------|----------|
| Формы не отправляются | Проверить `.env`: SMTP_USER / SMTP_PASS; проверить логи сервера |
| Страницы отдают 500 | Проверить `node dist/server/entry.mjs` — ошибки в консоли |
| Старый сайт нужно вернуть | Переключить DNS обратно — MODX-сервер остаётся живым до 30 дней |
| Капча не работает | Временно отключить: убрать SMARTCAPTCHA_SERVER_KEY из .env |

---

## Открытые вопросы (см. questions.md)

- Q6: 10 страниц unpublished в дампе — нужен обновлённый дамп или решение
- Q7: текст страницы «История компании» — нужен реальный текст
- Q8: коды верификации Yandex.Webmaster + Google Search Console
- Q9: реальные URL соцсетей для Organization JSON-LD
- Q10: ID счётчика Яндекс.Метрики
