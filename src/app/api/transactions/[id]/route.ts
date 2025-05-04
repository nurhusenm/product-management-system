import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Transaction from "../../../../models/Transaction";
import Product from "../../../../models/product";
import connectToDatabase from "../../../../lib/db";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const transaction = await Transaction.findOne({ _id: params.id, tenantId: decoded.tenantId });
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

    await Transaction.deleteOne({ _id: params.id });

    return NextResponse.json({ message: "Transaction deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}