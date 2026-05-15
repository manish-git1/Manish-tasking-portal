import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config({ path: '.env.local' });

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@taskflow.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword, // The pre-save hook handles hashing if we pass plain text, but bypassing validation here is safer for scripts sometimes, or we just pass plain text since it uses mongoose .create
      role: 'admin',
      department: 'Management',
      isActive: true,
    });

    console.log('Admin user seeded successfully!');
    console.log('Email: admin@taskflow.com');
    console.log('Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seed();
