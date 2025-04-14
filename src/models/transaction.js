import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["sale", "purchase"], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
