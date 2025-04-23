const mongoose = require('mongoose');
require('dotenv').config(); // Ensure dotenv is loaded

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('MongoDB URI is not defined in environment variables!');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;