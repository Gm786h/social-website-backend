require('dotenv').config({ quiet: true });

const required = ['JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

const hasDbUrl = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;
if (!hasDbUrl && !process.env.DB_NAME) {
  throw new Error('Database is not configured. Set DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD.');
}

const DEFAULT_ORIGINS = 'https://social-website-ty79.vercel.app,http://localhost:5173';

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  dbSync: process.env.DB_SYNC === 'true',
  corsOrigins: (process.env.CORS_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
