import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    console.log("Attempting to connect to database...");
    await connectToDatabase();
    console.log("Database connection successful, processing login...");
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }

    // Normalize email for case-insensitive lookup
    const normalizedEmail = email.toLowerCase();
    console.log("Looking up user with email:", normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, tenantId: user.tenantId || "default" },
      process.env.JWT_SECRET || "your-secret-key", // Add to .env.local
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('buffering timed out')) {
        return NextResponse.json({ 
          error: "Database operation timed out. Please try again." 
        }, { status: 503 });
      }
      if (error.message.includes('Failed to connect to MongoDB')) {
        return NextResponse.json({ 
          error: "Database connection failed. Please try again later." 
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}