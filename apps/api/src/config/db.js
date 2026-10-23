import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is missing");
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    heartbeatFrequencyMS: 10000
  });
  console.log("Connected to MongoDB");
}
