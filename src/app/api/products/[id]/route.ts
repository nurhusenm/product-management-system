import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/models/product";
import jwt from "jsonwebtoken";

// Get a single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const product = await Product.findOne({ _id: params.id, tenantId: decoded.tenantId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update a product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { name, sku, description, cost, price, quantity } = body;

    const product = await Product.findOne({ _id: params.id, tenantId: decoded.tenantId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku, tenantId: decoded.tenantId });
      if (existingProduct) {
        return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 400 });
      }
    }

    product.set({
      name: name ?? product.name,
      sku: sku ?? product.sku,
      description: description ?? product.description,
      cost: cost ?? product.cost,
      price: price ?? product.price,
      quantity: quantity ?? product.quantity,
    });
    await product.save();

    return NextResponse.json({ message: "Product updated", product });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const result = await Product.deleteOne({ _id: params.id, tenantId: decoded.tenantId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}