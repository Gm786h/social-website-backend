// Runs the app against an in-memory SQLite database so tests need no MySQL server.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'sqlite::memory:';
delete process.env.DATABASE_PRIVATE_URL;

const request = require('supertest');
const app = require('../app');
const db = require('../models');

async function resetDb() {
  await db.sequelize.sync({ force: true });
}

async function registerUser(username) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@example.com`, password: 'password123' });
  return { token: res.body.token, id: res.body.user.id };
}

module.exports = { app, db, request, resetDb, registerUser };
