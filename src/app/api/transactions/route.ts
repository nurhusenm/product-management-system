import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transaction from "../../../models/Transaction";
import connectToDatabase from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string;
      tenantId: string;
    };

    const url = new URL(request.url);
    const period = url.searchParams.get("period");
    const startDate = period ? calculateStartDate(period) : null;

    const query: any = { tenantId: decoded.tenantId };
    if (startDate) query.date = { $gte: startDate };

    const transactions = await Transaction.find(query).populate("productId", "name");
    const profit = calculateProfit(transactions);

    return NextResponse.json({ transactions, profit }, { status: 200 });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function calculateStartDate(period: string | null): Date | null {
  const now = new Date();
  if (period === "day") return new Date(now.setDate(now.getDate() - 1));
  if (period === "week") return new Date(now.setDate(now.getDate() - 7));
  if (period === "month") return new Date(now.setMonth(now.getMonth() - 1));
  return null;
}

function calculateProfit(transactions: any[]): number {
  return transactions.reduce((acc, t) => {
    return t.type === "sale" ? acc + t.quantity * t.price : acc - t.quantity * t.price;
  }, 0);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
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
    const { type, productId, quantity, price } = body;

    if (quantity <= 0 || price <= 0) {
      return NextResponse.json({ error: "Quantity and price must be positive" }, { status: 400 });
    }

    const product = await Product.findOne({ _id: productId, tenantId: decoded.tenantId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (type === "sale") {
      if (product.quantity < quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
      }
      product.quantity -= quantity;
    } else if (type === "purchase") {
      product.quantity += quantity;
    }
    await product.save();

    const transaction = new Transaction({
      tenantId: decoded.tenantId,
      type,
      productId,
      quantity,
      price,
    });
    await transaction.save();

    return NextResponse.json({ message: "Transaction recorded", transaction }, { status: 201 });
  } catch (error) {
    console.error("Transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}