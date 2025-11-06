import mongoose from 'mongoose';
import logger from './logger.js';

mongoose.set('strictQuery', true)
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        logger('info', 'Connect to Database success!');
    } catch (error) {
        logger('error', 'Connect to Database failed, error:', error);
        process.exit(1);
    }
}