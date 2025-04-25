import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Product from "../../../../models/product";
import connectToDatabase from "../../../../lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string;
      tenantId: string;
    };
    const body = await request.json();
    const { name, sku, cost, price, quantity, category } = body;
    
    // Make all fields optional for update
    const updateData: any = {};
    if (name) updateData.name = name;
    if (sku) updateData.sku = sku;
    if (cost) updateData.cost = cost;
    if (price) updateData.price = price;
    if (quantity) updateData.quantity = quantity;
    if (category) updateData.category = category;
    updateData.updatedAt = new Date();

    const product = await Product.findOneAndUpdate(
      { _id: params.id, tenantId: decoded.tenantId },
      updateData,
      { new: true }
    );
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Product updated", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string;
      tenantId: string;
    };

    const product = await Product.findOneAndDelete({
      _id: params.id,
      tenantId: decoded.tenantId,
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}