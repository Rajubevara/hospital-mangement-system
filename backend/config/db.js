import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://localhost:27017/hospital_management';

  if (!primaryUri) {
    try {
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Local MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }

  try {
    console.log(`Attempting to connect to primary MongoDB...`);
    const conn = await mongoose.connect(primaryUri);
    console.log(`MongoDB Connected (Primary): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary MongoDB Connection Error: ${error.message}`);
    console.log(`Attempting fallback to local MongoDB...`);
    try {
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Local Fallback MongoDB Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
