import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transaction from "../../../models/Transaction";
import Product from "../../../models/product";
import connectToDatabase from "../../../lib/db";
import mongoose from "mongoose";

// Add retry logic for database connection
async function connectWithRetry(retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await connectToDatabase();
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const type = url.searchParams.get("type") || "";
    const productName = url.searchParams.get("productName") || "";
    const dateRange = url.searchParams.get("dateRange") || "";

    // Build query based on filters
    const query: any = {};
    if (type) query.type = type;
    if (productName) query.productId = { $in: await findProductIdsByName(productName) }; // Adjust based on your schema
    if (dateRange) query.date = { $gte: new Date(dateRange) }; // Adjust date filtering as needed

    // Get total transactions for pagination
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);

    // Fetch paginated transactions, sorted by date descending
    const transactions = await Transaction.find(query)
      .populate("productId", "name cost") // Adjust based on your schema
      .sort({ date: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ transactions, totalPages }, { status: 200 });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper function (implement based on your Product model)
async function findProductIdsByName(name: string) {
  const products = await Product.find({ name: { $regex: name, $options: "i" } });
  return products.map((p) => p._id);
}

function calculateStartDate(period: string | null): Date | null {
  const now = new Date();
  if (period === "day") return new Date(now.setDate(now.getDate() - 1));
  if (period === "week") return new Date(now.setDate(now.getDate() - 7));
  if (period === "month") return new Date(now.setMonth(now.getMonth() - 1));
  if (period === "today") return new Date(now.setHours(0, 0, 0, 0));
  if (period === "thisWeek") return new Date(now.setDate(now.getDate() - now.getDay()));
  if (period === "thisMonth") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "thisYear") return new Date(now.getFullYear(), 0, 1);
  return null;
}

async function calculateProfit(transactions: any[]): Promise<number> {
  let totalProfit = 0;
  for (const t of transactions) {
    if (t.type === "sale" && t.productId?.cost) {
      totalProfit += (t.price - t.productId.cost) * t.quantity;
    }
  }
  return totalProfit;
}

export async function POST(request: NextRequest) {
  try {
    await connectWithRetry();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string;
      tenantId: string;
    };

    const body = await request.json();
    const { type, productId, quantity, price, salePrice } = body;

    if (!type || !productId || !quantity || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (quantity <= 0 || price <= 0 || (salePrice && salePrice <= 0)) {
      return NextResponse.json({ error: "Quantity, price, and sale price must be positive" }, { status: 400 });
    }

    // Use a session for transaction
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const product = await Product.findOne({ _id: productId, tenantId: decoded.tenantId }).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        if (type === "sale") {
          if (product.quantity < quantity) {
            throw new Error("Insufficient stock");
          }
          product.quantity -= quantity;
        } else if (type === "purchase") {
          product.quantity += quantity;
          product.cost = price;
          if (salePrice) product.price = salePrice;
        }
        await product.save({ session });

        const transaction = new Transaction({
          tenantId: decoded.tenantId,
          type,
          productId,
          quantity,
          price,
          date: new Date(),
        });
        await transaction.save({ session });
      });

      return NextResponse.json({ message: "Transaction recorded successfully" }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Transaction failed" }, { status: 400 });
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    console.error("Transaction error:", error);
    if (error.name === 'MongoServerSelectionError') {
      return NextResponse.json({ error: "Database connection error. Please try again." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}