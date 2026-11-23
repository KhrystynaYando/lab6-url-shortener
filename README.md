Веб-сервіс скорочення довгих URL-адрес на **Node.js** та **Express.js 5** із постійним збереженням даних у **PostgreSQL** у контейнерах **Docker**.
Проєкт розроблено за підходом **design-first**: спершу описано контракт у специфікації **OpenAPI 3.1** (`openapi.yaml`),
а потім реалізовано сервіс із генерацією інтерактивної документації **Swagger UI** безпосередньо з цього файлу.

Використані технології та підходи
- Runtime та фреймворк: Node.js, Express.js.
- База даних та драйвер: PostgreSQL у Docker, запити через `pg-promise`, конфігурація через `dotenv`.
- Контракт і документація API: OpenAPI 3.1 (`openapi.yaml`), `yaml`, `swagger-ui-express`, валідація через `@redocly/cli`.
- Контейнеризація: Docker, Docker Compose (`compose.yaml`, `Dockerfile`, ініціалізація через `initdb.sql`, іменований том `db-data`).

!!Запуск проєкту з нуля!!
Попередні вимоги
Встановлений і запущений Docker Desktop (або Docker Engine з docker compose).   
Встановлений Git.   

--Покроковий запуск--

1. Клонуйте репозиторій та перейдіть у директорію проєкту
   
git clone <URL_ВАШОГО_РЕПОЗИТОРІЮ>
cd lab6-url-shortener

3. Створіть файл .env на основі .env.sample:
Файл .env містить локальні налаштування та пароль до бази даних і доданий до .gitignore (у репозиторії зберігається лише .env.sample).   
cp .env.sample .env
Відкрийте .env та заповніть значення змінних (приклад):
PORT=8080
BASE_URL=http://localhost:8080

DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=change_me_please
DB_NAME=shortener_db
Примітка: при запуску сервера всередині Docker Compose значення DB_HOST має бути db (назва сервісу бази даних у compose.yaml).
3. Запустіть сервіс і базу даних однією командою:
docker compose up --build -d
4. Перевірте стан сервера та підключення до бази даних:
curl -i http://localhost:8080/health
Очікувана відповідь при справному з'єднанні з базою: HTTP 200 та {"status":"ok","database":"connected"}.
5. Відкрийте Swagger UI у браузері:
Інтерактивна документація: http://localhost:8080/docs   
Специфікація у форматі JSON: http://localhost:8080/openapi.json
