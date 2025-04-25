"use client";

import { useState } from "react";

interface AddProductProps {
  onProductAdded: () => void;
  existingCategories: string[];
  onAddCategory: (newCategory: string) => void;
}

export default function AddProduct({ onProductAdded, existingCategories, onAddCategory }: AddProductProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    cost: "",
    price: "",
    quantity: "",
    category: "",
  });
  const [message, setMessage] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please login to add products");
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
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
          category: formData.category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Product added successfully");
        setFormData({
          name: "",
          sku: "",
          cost: "",
          price: "",
          quantity: "",
          category: "",
        });
        onProductAdded();
      } else {
        setMessage(data.error || "Failed to add product");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setFormData({ ...formData, category: newCategory.trim() });
      setShowAddCategory(false);
      setNewCategory("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-semibold mb-2">Add Product</h2>
      {message && (
        <p className={message.includes("successfully") ? "text-green-500" : "text-red-500"}>
          {message}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="SKU"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Cost"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <div className="flex gap-2">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="p-2 border rounded flex-grow"
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddCategory(true)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New
          </button>
        </div>
      </div>
      {showAddCategory && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddCategory(false);
              setNewCategory("");
            }}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
      <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add Product
      </button>
    </form>
  );
} 