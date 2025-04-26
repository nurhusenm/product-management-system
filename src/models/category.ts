import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a compound index to ensure unique category names per tenant
categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model("Category", categorySchema); 