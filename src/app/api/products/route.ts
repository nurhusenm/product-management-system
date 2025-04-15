import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/models/product";
import jwt from "jsonwebtoken";

// Create a product
export async function POST(request: Request) {
  try {
    // Verify JWT
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mohnur") as {
      userId: string;
      tenantId: string;
    };

    await connectToDatabase();
    const body = await request.json();
    const { name, sku, description, cost, price, quantity } = body;

    if (!name || !sku || cost == null || price == null || quantity == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ sku, tenantId: decoded.tenantId });
    if (existingProduct) {
      return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 400 });
    }

    const product = new Product({
      tenantId: decoded.tenantId,
      name,
      sku,
      description,
      cost,
      price,
      quantity,
    });
    await product.save();

    return NextResponse.json({ message: "Product created", product }, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get all products for a tenant
export async function GET(request: Request) {
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
    const products = await Product.find({ tenantId: decoded.tenantId });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}