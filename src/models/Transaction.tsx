import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  type: { type: String, enum: ["sale", "purchase"], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);