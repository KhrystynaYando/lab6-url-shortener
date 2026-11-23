Веб-сервіс скорочення довгих URL-адрес на **Node.js** та **Express.js 5** із постійним збереженням даних у **PostgreSQL** у контейнерах **Docker**.
Проєкт розроблено за підходом **design-first**: спершу описано контракт у специфікації **OpenAPI 3.1** (`openapi.yaml`),
а потім реалізовано сервіс із генерацією інтерактивної документації **Swagger UI** безпосередньо з цього файлу.

Використані технології та підходи
- Runtime та фреймворк: Node.js, Express.js.
- База даних та драйвер: PostgreSQL у Docker, запити через `pg-promise`, конфігурація через `dotenv`.
- Контракт і документація API: OpenAPI 3.1 (`openapi.yaml`), `yaml`, `swagger-ui-express`, валідація через `@redocly/cli`.
- Контейнеризація: Docker, Docker Compose (`compose.yaml`, `Dockerfile`, ініціалізація через `initdb.sql`, іменований том `db-data`).
