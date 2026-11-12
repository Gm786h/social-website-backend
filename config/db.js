const { Sequelize } = require('sequelize');
require('./env');

const logging = process.env.DB_LOGGING === 'true' ? console.log : false;

const options = {
  dialect: 'mysql',
  logging,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: { connectTimeout: 30000 },
  retry: {
    match: [
      /PROTOCOL_CONNECTION_LOST/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 3,
  },
};

// Prefer a connection URL (Railway provides DATABASE_PRIVATE_URL / DATABASE_URL),
// otherwise fall back to individual DB_* variables.
const connectionUrl = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;

let sequelize;
if (connectionUrl) {
  if (connectionUrl.startsWith('sqlite:')) {
    // Used by the test suite: sqlite::memory: or sqlite:path/to/file.db
    const storage = connectionUrl.replace(/^sqlite:/, '') || ':memory:';
    sequelize = new Sequelize({ dialect: 'sqlite', storage, logging });
  } else {
    sequelize = new Sequelize(connectionUrl, options);
  }
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    ...options,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
  });
}

module.exports = { sequelize, Sequelize };
