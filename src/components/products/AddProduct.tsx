"use client";

import { useState, useEffect } from "react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Auto-close modal after success
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setIsModalOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Validate form fields
  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.sku.trim() ||
      !formData.cost.trim() ||
      !formData.price.trim() ||
      !formData.quantity.trim()
    ) {
      setErrorMessage("To add a product, it’s mandatory to fill all required fields.");
      return false;
    }
    if (
      isNaN(parseFloat(formData.cost)) ||
      isNaN(parseFloat(formData.price)) ||
      isNaN(parseInt(formData.quantity))
    ) {
      setErrorMessage("Cost, price, and quantity must be valid numbers.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Please login to add products");
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
          category: formData.category || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowSuccessMessage(true);
        setFormData({ name: "", sku: "", cost: "", price: "", quantity: "", category: "" });
        onProductAdded();
      } else {
        setErrorMessage(data.error || "Failed to add product");
      }
    } catch (error) {
      setErrorMessage("An error occurred while adding the product");
    }
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      setCategoryError("Category name cannot be empty.");
      return;
    }
    if (existingCategories.includes(trimmedCategory)) {
      setCategoryError("This category already exists.");
      return;
    }
    onAddCategory(trimmedCategory);
    setFormData({ ...formData, category: trimmedCategory });
    setShowAddCategory(false);
    setNewCategory("");
    setCategoryError("");
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
      >
        Add New Product
      </button>

      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-[100]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <p>Product added successfully!</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setErrorMessage("");
                setCategoryError("");
                setShowAddCategory(false);
                setNewCategory("");
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black">Add Product</h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
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
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  New
                </button>
              </div>
              {showAddCategory && (
                <div className="space-x-2 flex">
                  <input
                    type="text"
                    placeholder="Enter new category"
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      setCategoryError("");
                    }}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  {categoryError && <p className="text-red-500 text-sm">{categoryError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategory("");
                        setCategoryError("");
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMessage("");
                    setCategoryError("");
                    setShowAddCategory(false);
                    setNewCategory("");
                  }}
                  className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}