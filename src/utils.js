const crypto = require('crypto');

const RESERVED_CODES = new Set(['api', 'docs', 'health', 'openapi.json']);
const ALIAS_REGEX = /^[a-zA-Z0-9_-]{3,32}$/;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidAlias(alias) {
  if (typeof alias !== 'string') return false;
  if (RESERVED_CODES.has(alias.toLowerCase())) return false;
  return ALIAS_REGEX.test(alias);
}

function generateCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return RESERVED_CODES.has(result.toLowerCase()) ? generateCode(length) : result;
}

function formatLink(row) {
  const baseUrl = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
  return {
    code: row.code,
    shortUrl: `${baseUrl}/${row.code}`,
    originalUrl: row.original_url,
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

module.exports = {
  isValidHttpUrl,
  isValidAlias,
  generateCode,
  formatLink,
};