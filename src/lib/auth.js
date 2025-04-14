// /lib/auth.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "mohnur"; // In production, store this securely

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Generate JWT
export function generateToken(user) {
  // Create a payload with user id and role (add more fields if needed)
  const payload = { id: user._id, email: user.email, role: user.role };
  // Token expiration can be added (e.g. expiresIn: '7d')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
