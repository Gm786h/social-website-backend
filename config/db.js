const { Sequelize } = require('sequelize');

// Option 1: Try with DATABASE_PUBLIC_URL (if available)
// Check if Railway provides a DATABASE_PUBLIC_URL or DATABASE_URL
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  // Using connection URL (preferred for Railway)
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'mysql',
    logging: console.log, // Enable logging temporarily for debugging
    
    pool: {
      max: 3,          // Reduced from 5 to avoid connection limits
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    dialectOptions: {
      connectTimeout: 30000,    // Reduced timeout
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    
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
      max: 2  // Reduced retry attempts
    }
  });
} else {
  // Fallback to individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: console.log, // Enable logging temporarily
      
      pool: {
        max: 3,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      
      dialectOptions: {
        connectTimeout: 30000,
        supportBigNumbers: true,
        bigNumberStrings: true
      },
      
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
        max: 2
      }
    }
  );
}

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test a simple query
    const result = await sequelize.query('SELECT 1 as test');
    console.log('✅ Test query successful:', result);
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('Error code:', error.original?.code);
    console.error('Error details:', error.original);
    
    // If connection fails, try to get more info about the database service
    console.log('\n🔍 Troubleshooting info:');
    console.log('- Check if your Railway MySQL service is running');
    console.log('- Verify environment variables are correct');
    console.log('- Check if you have hit connection/resource limits');
    console.log('- Try restarting the database service in Railway');
  }
}

// Test connection on startup
testConnection();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connection...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
  process.exit(0);
});

module.exports = { sequelize, Sequelize };
