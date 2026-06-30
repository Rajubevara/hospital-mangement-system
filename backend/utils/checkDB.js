import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function check() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    console.log('URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    const count = await User.countDocuments();
    console.log('Number of Users:', count);
    
    if (count > 0) {
      const users = await User.find({}, 'name email role');
      console.log('Users list:', JSON.stringify(users, null, 2));
    } else {
      console.log('No users found in database. You may need to run the seeding script!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to DB:', error.message);
    process.exit(1);
  }
}

check();
