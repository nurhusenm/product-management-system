import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  tenantId: string;
  productId: mongoose.Types.ObjectId;
  type: "sale" | "purchase";
  quantity: number;
  totalCost: number;
  createdAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  tenantId: { type: String, required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  type: { type: String, enum: ["sale", "purchase"], required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalCost: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);