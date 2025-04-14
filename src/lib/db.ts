import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Extend the NodeJS global interface to cache the Mongoose connection.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Use existing cached connection if available
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB"); // Add log here
      return mongooseInstance;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Returns the native MongoDB collection using mongoose's connection.
 */
export async function getCollection(collectionName: string) {
  const dbConnection = await connectToDatabase();
  return dbConnection.connection.db.collection(collectionName);
}

export default connectToDatabase;