import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-uri";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

let isConnected: boolean = false; // Track connection status

export default async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return; // Already connected and ready
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      // Connection options to prevent timeouts
      serverSelectionTimeoutMS: 30000, // Timeout after 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: true, // Enable buffering to prevent connection issues
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      connectTimeoutMS: 30000, // Give up initial connection after 30s
      retryWrites: true,
      w: 'majority'
    });
    
    isConnected = true;
    console.log("Connected to MongoDB");
    console.log('mongodb url', MONGODB_URI);

  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}