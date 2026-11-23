const express = require('express');
const db = require('../db');
const { isValidHttpUrl, isValidAlias, generateCode, formatLink } = require('../utils');

const router = express.Router();

router.route('/')
  .get(async (req, res) => {
    const rows = await db.any(
      'SELECT code, original_url, clicks, created_at FROM links ORDER BY created_at DESC'
    );
    res.status(200).json(rows.map(formatLink));
  })
  .post(async (req, res) => {
    const { url, alias } = req.body || {};

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({ error: 'Некоректна URL-адреса. Очікується http:// або https://' });
    }

    if (alias !== undefined && alias !== null && alias !== '') {
      if (!isValidAlias(alias)) {
        return res.status(400).json({
          error: 'Неприпустимий формат alias (дозволено 3-32 символи: латиниця, цифри, _ або -; заборонені службові слова)',
        });
      }

      try {
        const created = await db.one(
          'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING code, original_url, clicks, created_at',
          [alias, url]
        );
        return res
          .status(201)
          .location(`/api/links/${created.code}`)
          .json(formatLink(created));
      } catch (err) {
        if (err.code === '23505') {
          return res.status(409).json({ error: 'Запропонований alias уже зайнятий' });
        }
        throw err;
      }
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode(6);
      try {
        const created = await db.one(
          'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING code, original_url, clicks, created_at',
          [code, url]
        );
        return res
          .status(201)
          .location(`/api/links/${created.code}`)
          .json(formatLink(created));
      } catch (err) {
        if (err.code !== '23505') throw err;
      }
    }

    return res.status(500).json({ error: 'Не вдалося згенерувати унікальний короткий код' });
  });

router.route('/:code')
  .get(async (req, res) => {
    const row = await db.oneOrNone(
      'SELECT code, original_url, clicks, created_at FROM links WHERE code = $1',
      [req.params.code]
    );
    if (!row) {
      return res.status(404).json({ error: 'Посилання з таким кодом не знайдено' });
    }
    res.status(200).json(formatLink(row));
  })
  .patch(async (req, res) => {
    const { url } = req.body || {};
    if (!isValidHttpUrl(url)) {
      return res.status(400).json({ error: 'Некоректна нова URL-адреса. Очікується http:// або https://' });
    }

    const updated = await db.oneOrNone(
      'UPDATE links SET original_url = $1 WHERE code = $2 RETURNING code, original_url, clicks, created_at',
      [url, req.params.code]
    );
    if (!updated) {
      return res.status(404).json({ error: 'Посилання з таким кодом не знайдено' });
    }
    res.status(200).json(formatLink(updated));
  })
  .delete(async (req, res) => {
    const result = await db.result('DELETE FROM links WHERE code = $1', [req.params.code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Посилання з таким кодом не знайдено' });
    }
    res.sendStatus(204);
  });

module.exports = router;