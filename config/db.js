const { Sequelize } = require('sequelize');

// Railway provides these connection URLs
const DATABASE_PRIVATE_URL = 'mysql://root:XwFhXDTopDYthdwTtglUAtrzGWOtRKfz@mysql-pld_.railway.internal:3306/railway';
const DATABASE_PUBLIC_URL = 'mysql://root:XwFhXDTopDYthdwTtglUAtrzGWOtRKfz@shortline.proxy.rlwy.net:33534/railway';

// Prefer internal URL for better performance and reliability
const connectionUrl = process.env.DATABASE_PRIVATE_URL || 
                     process.env.DATABASE_URL || 
                     DATABASE_PRIVATE_URL; // Use internal URL as fallback

console.log('🔌 Using database connection URL:', connectionUrl.replace(/:[^:]*@/, ':****@')); // Hide password in logs

const sequelize = new Sequelize(connectionUrl, {
  dialect: 'mysql',
  logging: false, // Set to console.log if you want to see SQL queries
  
  pool: {
    max: 5,          // Maximum number of connections
    min: 0,          // Minimum number of connections
    acquire: 30000,  // Maximum time to get connection (30s)
    idle: 10000      // Maximum idle time before releasing connection (10s)
  },
  
  dialectOptions: {
    connectTimeout: 30000,    // Connection timeout (30s)
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
    max: 3
  }
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');
    
    // Test a simple query to ensure everything works
    const [results] = await sequelize.query('SELECT VERSION() as version');
    console.log('📊 Database info:', results[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // If internal URL fails, try public URL as fallback
    if (connectionUrl.includes('railway.internal')) {
      console.log('🔄 Internal connection failed, trying public URL...');
      try {
        const publicSequelize = new Sequelize(DATABASE_PUBLIC_URL, {
          dialect: 'mysql',
          logging: false,
          pool: { max: 3, min: 0, acquire: 30000, idle: 10000 },
          dialectOptions: { connectTimeout: 30000, supportBigNumbers: true, bigNumberStrings: true }
        });
        
        await publicSequelize.authenticate();
        console.log('✅ Public URL connection successful! Consider updating your environment variables.');
        await publicSequelize.close();
        return false; // Still return false so you know to update config
      } catch (publicError) {
        console.error('❌ Public URL also failed:', publicError.message);
      }
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if MySQL service is running in Railway dashboard');
    console.log('2. Verify the connection URLs are correct');
    console.log('3. Try restarting the MySQL service');
    console.log('4. Check for resource limits or billing issues');
    
    return false;
  }
}

// Note: syncDatabase function kept for reference but not used
// Uncomment and call only if you need to sync new models in the future
async function syncDatabase() {
  try {
    console.log('🔄 Synchronizing database models...');
    
    // Import your models here
    // Example: require('./models');
    
    // Use { alter: true } to modify existing tables without dropping data
    // Use { force: false } to preserve existing data
    await sequelize.sync({ 
      alter: false,  // Don't alter existing tables to avoid constraint conflicts
      force: false   // Don't drop existing tables
    });
    console.log('✅ Database models synchronized successfully!');
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    
    if (error.message.includes('Duplicate foreign key constraint')) {
      console.log('⚠️ Database already has existing schema. Skipping sync to preserve data.');
      console.log('💡 If you need to update schema, consider using migrations instead of sync.');
      return; // Don't throw error, just skip sync
    }
    
    throw error;
  }
}

// Initialize database connection
testConnection().then(async (success) => {
  if (success) {
    console.log('🚀 Database is ready! (Using existing schema)');
    console.log('💡 Skipping sync to preserve existing data');
  } else {
    console.log('⚠️ Starting server without database connection');
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`🔄 Received ${signal}, closing database connection...`);
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = { sequelize, Sequelize };
