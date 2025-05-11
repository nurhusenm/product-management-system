import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transaction from "../../../../models/Transaction";
import Product from "../../../../models/product";
import connectToDatabase from "../../../../lib/db";
import mongoose from "mongoose";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
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

    // Validate tenantId and transaction
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
    }

    const transaction = await Transaction.findOne({ _id: id, tenantId: decoded.tenantId });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const product = await Product.findOne({ _id: productId, tenantId: decoded.tenantId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Adjust product quantity based on old and new transaction data
    if (transaction.type === "sale" && type === "sale") {
      // Revert old quantity and apply new
      product.quantity += transaction.quantity;
      if (product.quantity < quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
      }
      product.quantity -= quantity;
    } else if (transaction.type === "purchase" && type === "purchase") {
      // Revert old purchase and apply new
      product.quantity -= transaction.quantity;
      product.quantity += quantity;
      product.cost = price;
      if (salePrice) product.price = salePrice;
    } else if (transaction.type === "sale" && type === "purchase") {
      // Revert sale and apply purchase
      product.quantity += transaction.quantity;
      product.quantity += quantity;
      product.cost = price;
      if (salePrice) product.price = salePrice;
    } else if (transaction.type === "purchase" && type === "sale") {
      // Revert purchase and apply sale
      product.quantity -= transaction.quantity;
      if (product.quantity < quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
      }
      product.quantity -= quantity;
    }

    await product.save();

    // Update transaction
    transaction.type = type;
    transaction.productId = productId;
    transaction.quantity = quantity;
    transaction.price = price;
    await transaction.save();

    return NextResponse.json({ message: "Transaction updated", transaction }, { status: 200 });
  } catch (error) {
    console.error("Update transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
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

    const transaction = await Transaction.findOne({ _id: id, tenantId: decoded.tenantId });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const product = await Product.findById(transaction.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (transaction.type === "sale") {
      product.quantity += transaction.quantity; // Restore stock
    } else if (transaction.type === "purchase") {
      if (product.quantity < transaction.quantity) {
        return NextResponse.json({ error: "Cannot delete: insufficient stock" }, { status: 400 });
      }
      product.quantity -= transaction.quantity; // Remove purchased stock
    }
    await product.save();

    await Transaction.deleteOne({ _id: id });

    return NextResponse.json({ message: "Transaction deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

