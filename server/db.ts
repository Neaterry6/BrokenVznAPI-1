import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;

export const connectDB = async () => {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not found. Using in-memory storage fallback.');
    return;
  }

  try {
    // Clean the URI and add connection options
    const cleanURI = MONGODB_URI.replace(/"/g, ''); // Remove any quotes
    await mongoose.connect(cleanURI, {
      retryWrites: true,
      w: 'majority',
      appName: 'BrokenVZN-API'
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Continuing with in-memory storage fallback for development');
  }
};

export default mongoose;
