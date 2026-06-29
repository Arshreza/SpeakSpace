import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

let retryCount = 0;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speckspace';

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    bufferCommands: false,
  };

  try {
    const conn = await mongoose.connect(mongoURI, options);
    retryCount = 0;
    logger.info(`MongoDB Connected: ${conn.connection.host}`.cyan?.bold || `MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.warn(`Retrying MongoDB connection... Attempt ${retryCount}/${MAX_RETRIES}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB();
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected to MongoDB');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed due to app termination');
  process.exit(0);
});

export default connectDB;
