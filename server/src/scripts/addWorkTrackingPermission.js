import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/promos2';

async function addWorkTrackingPermission() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const result = await User.updateMany(
      { email: { $in: ['admin@sirket.com', 'emre@sirket.com'] } },
      { $addToSet: { permissions: 'work_tracking' } }
    );

    console.log(`Updated ${result.modifiedCount} users with work_tracking permission`);
    
    const users = await User.find({ email: { $in: ['admin@sirket.com', 'emre@sirket.com'] } });
    users.forEach(user => {
      console.log(`${user.email}: ${user.permissions.join(', ')}`);
    });

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addWorkTrackingPermission();
