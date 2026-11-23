require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

const db = require('./db');
const linksRouter = require('./routes/links');

const app = express();
const PORT = process.env.PORT || 8080;

const specPath = path.join(__dirname, '..', 'openapi.yaml');
const openApiSpec = YAML.parse(fs.readFileSync(specPath, 'utf8'));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/openapi.json', (req, res) => res.json(openApiSpec));

app.get('/health', async (req, res) => {
  try {
    await db.one('SELECT 1 AS ok');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/links', linksRouter);

app.get('/:code', async (req, res) => {
  const row = await db.oneOrNone(
    'UPDATE links SET clicks = clicks + 1 WHERE code = $1 RETURNING original_url',
    [req.params.code]
  );

  if (!row) {
    return res.status(404).json({ error: 'Коротке посилання не знайдено' });
  }

  return res.redirect(302, row.original_url);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некоректний формат JSON у тілі запиту' });
  }
  console.error(err);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});