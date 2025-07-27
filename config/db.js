const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    
    // Connection pool configuration
    pool: {
      max: 5,          // Maximum number of connections
      min: 0,          // Minimum number of connections
      acquire: 30000,  // Maximum time to get connection (30s)
      idle: 10000      // Maximum idle time before releasing connection (10s)
    },
    
    // MySQL dialect options for better connection handling
    dialectOptions: {
      connectTimeout: 60000,    // Connection timeout (60s)
      acquireTimeout: 60000,    // Acquire timeout (60s)
      timeout: 60000,           // Query timeout (60s)
      reconnect: true,          // Enable reconnection
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    
    // Retry configuration for connection failures
    retry: {
      match: [
        /PROTOCOL_CONNECTION_LOST/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3  // Maximum retry attempts
    }
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Test connection on startup
testConnection();

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connection...');
  await sequelize.close();
  process.exit(0);
});

module.exports = { sequelize, Sequelize };
