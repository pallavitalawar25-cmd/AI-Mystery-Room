import mongoose from 'mongoose';

export async function connectToDatabase(connectionString) {
  await mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('Connected to MongoDB.');
}
