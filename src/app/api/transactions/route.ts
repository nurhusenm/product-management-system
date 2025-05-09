import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transaction from "../../../models/Transaction";
import Product from "../../../models/product";
import connectToDatabase from "../../../lib/db";
import mongoose from "mongoose";

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
    const type = url.searchParams.get("type") || "";
    const productName = url.searchParams.get("productName") || "";
    const dateRange = url.searchParams.get("dateRange") || "";
    const period = url.searchParams.get("period");

    // Use tenantId as a string (no ObjectId conversion)
    const tenantId = decoded.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    // Build the aggregation pipeline
    const pipeline: any[] = [
      { $match: { tenantId } }, // Match transactions for this tenant
      {
        $lookup: {
          from: "products", // Must match your Product collection name in MongoDB
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" }, // Flatten the product array
    ];

    // Add filters to the pipeline
    if (type) {
      pipeline.push({ $match: { type } });
    }
    if (productName) {
      pipeline.push({
        $match: { "product.name": { $regex: productName, $options: "i" } },
      });
    }
    if (dateRange || period) {
      const startDate = calculateStartDate(dateRange || period);
      if (startDate) {
        pipeline.push({ $match: { date: { $gte: startDate } } });
      }
    }

    // Project the desired fields to match frontend expectations
    pipeline.push({
      $project: {
        _id: 1,
        type: 1,
        productId: {
          _id: "$product._id",
          name: "$product.name",
          cost: "$product.cost",
        },
        quantity: 1,
        price: 1,
        date: 1,
      },
    });

    const transactions = await Transaction.aggregate(pipeline);
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
      product.cost = price;
      if (salePrice) product.price = salePrice;
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