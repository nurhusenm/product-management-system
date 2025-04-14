import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  tenantId: string;
  name: string;
  sku: string;
  description?: string;
  cost: number;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    cost: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);