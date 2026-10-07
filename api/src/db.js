const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('PASTE_YOUR')) {
    throw new Error('MONGODB_URI missing — .env.example dekho, key paste karo.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: 'bandmuft' });
  console.log('MongoDB connected (db: bandmuft)');
}

module.exports = { connectDB };
