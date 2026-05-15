/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

loadEnv();

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'member' },
    department: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin@taskflow.com';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log('Admin already exists:', adminEmail);
    process.exit(0);
  }

  const hashed = await bcrypt.hash('Admin@123', 12);
  await User.create({
    name: 'System Admin',
    email: adminEmail,
    password: hashed,
    role: 'admin',
    department: 'Management',
    isActive: true,
  });

  console.log('Admin seeded successfully');
  console.log('Email: admin@taskflow.com');
  console.log('Password: Admin@123');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
