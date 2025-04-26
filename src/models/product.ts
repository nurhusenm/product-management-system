import mongoose from "mongoose";

// Clear the cached model (optional, only needed if schema changed)
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const productSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  cost: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
 category: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

 
  


});

export default mongoose.models.Product || mongoose.model("Product", productSchema);