// src/models/Product.ts
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  cost: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: {
    type: String,
    required: true, // Mandatory
    enum: ["Electronics", "Clothing", "Books", "Other"], // Predefined categories
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);