require('dotenv').config();

const cleanString = (val, fallback = '') => {
  if (!val || typeof val !== 'string') return fallback;
  const cleaned = val.trim().replace(/,$/, '').trim();
  return cleaned || fallback;
};

const env = {
  NODE_ENV: cleanString(process.env.NODE_ENV),
  PORT: parseInt(cleanString(process.env.PORT), 10),
  MONGO_URI: cleanString(process.env.MONGO_URI),
  JWT_SECRET: cleanString(process.env.JWT_SECRET),
  JWT_EXPIRES_IN: cleanString(process.env.JWT_EXPIRES_IN),
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  LIVE_URL: cleanString(process.env.LIVE_URL),
};

module.exports = env;
