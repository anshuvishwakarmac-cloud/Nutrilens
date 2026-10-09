const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrilens';

  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of buffering indefinitely
    });
    console.log(`[MongoDB] Successfully connected to database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] Could not connect to "${connStr}": ${error.message}`);
    console.log('\n======================================================================');
    console.log('⚠️  DATABASE CONNECTION WARNING:');
    console.log('MongoDB service is not running locally on port 27017.');
    console.log('To resolve this:');
    console.log('1. Start your local MongoDB service, OR');
    console.log('2. Provide a free MongoDB Atlas URI in backend/.env:');
    console.log('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nutrilens');
    console.log('======================================================================\n');
  }
};

module.exports = connectDB;
