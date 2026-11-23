require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await db.one('SELECT 1 AS ok');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});