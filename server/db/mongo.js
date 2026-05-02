import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log('Connected to MongoDB:', process.env.DB_NAME);
  return db;
}

export async function getDB() {
  if (!db) await connectDB();
  return db;
}
