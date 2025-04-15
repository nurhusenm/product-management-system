import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/models/product";
import Transaction from "@/models/transaction";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string;
      tenantId: string;
    };

    await connectToDatabase();
    const body = await request.json();
    const { productId, type, quantity } = body;

    if (!productId || !type || !quantity || !["sale", "purchase"].includes(type)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const product = await Product.findOne({ _id: productId, tenantId: decoded.tenantId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (type === "sale" && product.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const totalCost = type === "sale" ? quantity * product.price : quantity * product.cost;
    const transaction = new Transaction({
      tenantId: decoded.tenantId,
      productId,
      type,
      quantity,
      totalCost,
    });
    await transaction.save();

    product.quantity += type === "purchase" ? quantity : -quantity;
    await product.save();

    return NextResponse.json({ message: "Transaction recorded", transaction }, { status: 201 });
  } catch (error: any) {
    console.error("Transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}