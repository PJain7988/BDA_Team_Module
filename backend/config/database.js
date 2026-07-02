// backend/config/database.js
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    // Fallback to memory server if no URI is provided AND we are not in a serverless environment
    if (!dbUri) {
      if (process.env.VERCEL) {
        throw new Error('MONGODB_URI environment variable is missing on Vercel.');
      }
      console.log('ℹ️ No MONGODB_URI found. Starting in-memory MongoDB server...');
      
      // Dynamic require to prevent Vercel static bundler (ncc) from analyzing this dependency
      const memServerPkg = 'mongodb-memory-server';
      const { MongoMemoryServer } = require(memServerPkg);
      
      mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri();
      console.log('✅ In-memory MongoDB server started at:', dbUri);
    }

    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Attempt memory server fallback on local/traditional environments if connection fails
    if (!mongoServer && !process.env.VERCEL) {
      try {
        console.log('ℹ️ Retrying with In-memory MongoDB server fallback...');
        
        // Dynamic require to prevent Vercel static bundler (ncc) from analyzing this dependency
        const memServerPkg = 'mongodb-memory-server';
        const { MongoMemoryServer } = require(memServerPkg);
        
        mongoServer = await MongoMemoryServer.create();
        const dbUri = mongoServer.getUri();
        const conn = await mongoose.connect(dbUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('✅ In-memory MongoDB connected successfully:', conn.connection.host);
        return conn;
      } catch (innerError) {
        console.error('❌ In-memory MongoDB connection failed:', innerError.message);
        process.exit(1);
      }
    } else {
      // Re-throw the error on serverless environments to prevent node crashes
      throw error;
    }
  }
};

module.exports = connectDB;
