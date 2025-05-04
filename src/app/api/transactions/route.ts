import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transaction from "../../../models/Transaction";
import Product from "../../../models/product";
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

    const transactions = await Transaction.find(query).populate("productId", "name cost");
    const profit = await calculateProfit(transactions);

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

async function calculateProfit(transactions: any[]): Promise<number> {
  let totalProfit = 0;
  for (const t of transactions) {
    if (t.type === "sale" && t.productId?.cost) {
      totalProfit += (t.price - t.productId.cost) * t.quantity;
    } else if (t.type === "purchase") {
      totalProfit -= t.price * t.quantity; // Price is the cost for purchases
    }
  }
  return totalProfit;
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
    const { type, productId, quantity, price, salePrice } = body;

    if (!type || !productId || !quantity || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (quantity <= 0 || price <= 0 || (salePrice && salePrice <= 0)) {
      return NextResponse.json({ error: "Quantity, price, and sale price must be positive" }, { status: 400 });
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
      product.cost = price; // Update cost for purchases
      if (salePrice) product.price = salePrice; // Update sale price if provided
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