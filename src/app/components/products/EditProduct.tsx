"use client";

import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  quantity: number;
  category: string;
}

interface EditProductProps {
  product: Product;
  onCancel: () => void;
  onProductUpdated: () => void;
  existingCategories: string[];
}

export default function EditProduct({ product, onCancel, onProductUpdated, existingCategories }: EditProductProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    cost: product.cost.toString(),
    price: product.price.toString(),
    quantity: product.quantity.toString(),
    category: product.category || "",
  });
  const [message, setMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (showSuccessMessage) {
      console.log("Success message triggered:", { name: formData.name });
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        onCancel();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage, onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please login to edit products");
      return;
    }
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          cost: parseFloat(formData.cost),
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          category: formData.category || undefined,
        }),
      });
      const data = await res.json();
      console.log("PUT response:", { status: res.status, data }); // Debug log
      if (res.ok) {
        setMessage("Product updated successfully");
        setShowSuccessMessage(true);
        onProductUpdated();
      } else {
        setMessage(data.error || "Failed to update product");
        console.error("PUT error:", data);
      }
    } catch (error) {
      setMessage("An error occurred");
      console.error("PUT catch error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-black">Edit Product</h2>
        {/* Success Message Inside Modal */}
        {showSuccessMessage && (
          <div className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p>{formData.name} updated successfully!</p>
          </div>
        )}
        {message && !showSuccessMessage && (
          <p className={message.includes("successfully") ? "text-green-500" : "text-red-500"}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
          <input
            type="text"
            placeholder="SKU (e.g., ABC-123)"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
          <input
            type="number"
            placeholder="Cost"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
          <div className="flex gap-2">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select Category (optional)</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
            >
              Update Product
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}