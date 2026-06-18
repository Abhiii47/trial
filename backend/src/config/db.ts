import mongoose from 'mongoose';
import { jsonDb } from './jsonDb';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not defined");
    
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    (global as any).useMockDb = false;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};
