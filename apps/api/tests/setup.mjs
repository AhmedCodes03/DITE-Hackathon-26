import mongoose from "mongoose";

beforeAll(async () => {
  const mongoUri = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/dr_xyz_test";
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    console.warn("MongoDB not available for tests, using mocks");
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
