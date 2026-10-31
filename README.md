# МатНМТ — підготовка до НМТ з математики

Next.js 15 · Prisma 6 (Rust-free клієнт + драйвер `pg`) · PostgreSQL · Vitest

## Швидкий старт

Потрібні Node.js 22 і PostgreSQL 14+.

```bash
npm install                      # також генерує Prisma Client
cp .env.example .env             # вкажіть свій DATABASE_URL
npx prisma migrate deploy        # створює 7 таблиць
npx prisma db seed               # 29 тем із теорією, 236 задач, демо-користувач
npm run dev                      # http://localhost:3000
```

Seed додає задачі з `public/tasks` з правильними відповідями (`prisma/data/answers.json`,
зчитані з картинок розв’язків скриптом `prisma/data/detect_answers.py`) і демо-користувача
`demo@matnmt.local` / `demo12345`, від імені якого працюють сторінки плану до появи входу в акаунт.

## Тести

```bash
npm test                         # модульні та інтеграційні тести (Vitest)
```

Тести з папки `tests/db` працюють зі справжньою PostgreSQL і запускаються, лише якщо задано `DATABASE_URL`.
Журнал останнього запуску — `docs/test-log.txt`. У GitHub Actions (`.github/workflows/ci.yml`) на кожен PR
виконуються міграції, seed, перевірка типів, тести і збірка.

## Документація

- `docs/openapi.yaml`, `docs/api-docs.html` — API (OpenAPI 3.0)
- `docs/uml/` — діаграми прецедентів, класів, послідовності, розгортання, ER-схема БД
- `docs/adr.md` — обґрунтування архітектури та інструментів розробки

---

# Інструкція як працювати з проектом

### 1. Клонуйте репозиторій

``` bash
git clone https://github.com/yana-utochkina/math-nmt.git
```

### 2. Перевірте чи знаходnитесь в master гілці, а в разі чого перейдіть в неї

``` bash
git checkout master
```

### 3. Створіть гілку від master де будете вносити зміни

``` bashecho "Test change" >> README.md
git branch feature1
```

### 4. Перейдіть в новостворену гілку

``` bash
git checkout feature1
```

# Далі буде інструкція як локально запускати веб-додаток, аби перевірити внесені зміни

### 1.1 Перевірте чи встановлений Node.js
``` bash
node -v
```

Має бути версія v22.12.0

### 1.2 У разі якщо не встановлено або версія не збігається

Переходимо на офіційний сайт [Node.js](https://nodejs.org/en/download) та встановлюємо версію v22.12.0 (LTS) for Windows using Docker with npm (Windows Installer .msi)
Після чого виконуємо пункт 1.1

### 2.1 Перевірте чи встановлено npm

``` bash
npm -v
```

Має бути версія 10.9.0

### 2.2 У разі якщо версія не збігається

``` bash
npm install -g npm@10.9.0
```

Перевірте пункт 2.1

### 3 Тепер npm за вас встановить усі необхідні залежності

``` bash
npm install
```

### 4. Після цього запускаємо локально веб-додаток

``` bash
npm run dev
```

Зазвичай він знаходиться за адресою [http://localhost:3000/](http://localhost:3000/). Відкриваємо, має працювати.

# Тепер спробуйте внести зміни та створити merge-request

Для створення комітів використовуємо офіційний додаток [GitHub Desktop](https://desktop.github.com/download/).

Наприклад знайдіть файл src/app/rage.tsx та внесіть зміни у 18 рядок (додайте текст "Feture1 is here.")

Тепер в додатку буде запропоновано зробити коміт. Обов'язково пишемо назву та бажано опис. Натискаємо Commit to feature1.

Зліва зверху буде кнопка Push origin
### Далі раджу використовувати [Sourcetree](https://www.sourcetreeapp.com/).

Встановлюємо та натискаємо Add (іконка папки), шукаємо папку в яку ви клонували репозиторій.

Після цього натискаємо зверху велику кнопку Merge (галочки не змінюємо) а потім Push (також без змін). Далі якщо зайти в GitHub Desktop, натиснути справа зверху кнопку Fetch origin. З'явиться кнопка Preview Pull Request, натискаємо,  натискаємоо Create pull request. Має відкритися браузер з репозиторієм, натискаємо Creare pull request. Все, далі інша відповідальна людина має переглянути та дозволити Merge.
