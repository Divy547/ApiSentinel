import mongoose from 'mongoose';

export async function connectMongo(uri: string) {
  await mongoose.connect(uri);
  console.log('Mongo Atlas connected');
}
