"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  quantity: number;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    sku: "",
    cost: "",
    price: "",
    quantity: "",
    category: "",
  });
  const [addFormData, setAddFormData] = useState({
    name: "",
    sku: "",
    cost: "",
    price: "",
    quantity: "",
    category: "",
  });
  const [message, setMessage] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const router = useRouter();

  // Predefined categories
  const categories = ["Electronics", "Clothing", "Books", "Other"];

  // Fetch products on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProducts(token);
  }, [router]);

  const fetchProducts = async (token: string) => {
    try {
      const res = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data || []); // Fixed: data is already the products array
      } else {
        setMessage(data.error || "Failed to fetch products");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  // Handle Add Product submission
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
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
          name: addFormData.name,
          sku: addFormData.sku,
          cost: parseFloat(addFormData.cost),
          price: parseFloat(addFormData.price),
          quantity: parseInt(addFormData.quantity),
          category: addFormData.category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Product added successfully");
        setAddFormData({
          name: "",
          sku: "",
          cost: "",
          price: "",
          quantity: "",
          category: "",
        });
        fetchProducts(token);
      } else {
        setMessage(data.error || "Failed to add product");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  // Handle Edit button click
  const handleEdit = (product: Product) => {
    setEditingProduct(product._id);
    setEditFormData({
      name: product.name,
      sku: product.sku,
      cost: product.cost.toString(),
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
    });
  };

  // Handle Update submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/products/${editingProduct}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          sku: editFormData.sku,
          cost: parseFloat(editFormData.cost),
          price: parseFloat(editFormData.price),
          quantity: parseInt(editFormData.quantity),
          category: editFormData.category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Product updated successfully");
        setEditingProduct(null);
        setEditFormData({
          name: "",
          sku: "",
          cost: "",
          price: "",
          quantity: "",
          category: "",
        });
        fetchProducts(token);
      } else {
        setMessage(data.error || "Failed to update product");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  // Handle Delete button click
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("Product deleted successfully");
        fetchProducts(token);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to delete product");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  // Filter products based on selected category, search term, and price
  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (filterCategory !== "All" && product.category !== filterCategory) {
        return false;
      }
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !product.sku.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Price filter
      if (priceFilter === "high") {
        return product.price > 100;
      } else if (priceFilter === "low") {
        return product.price <= 100;
      }
      return true;
    })
    .sort((a, b) => {
      if (priceFilter === "high") {
        return b.price - a.price;
      } else if (priceFilter === "low") {
        return a.price - b.price;
      }
      return 0;
    });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {message && (
        <p
          className={
            message.includes("successfully") ? "text-green-500" : "text-red-500"
          }
        >
          {message}
        </p>
      )}

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded flex-grow"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Prices</option>
          <option value="high">High Price (>$100)</option>
          <option value="low">Low Price (≤$100)</option>
        </select>
      </div>

      {/* Add Product Form */}
      <form onSubmit={handleAdd} className="mb-8 space-y-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Add Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={addFormData.name}
            onChange={(e) =>
              setAddFormData({ ...addFormData, name: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="SKU"
            value={addFormData.sku}
            onChange={(e) =>
              setAddFormData({ ...addFormData, sku: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Cost"
            value={addFormData.cost}
            onChange={(e) =>
              setAddFormData({ ...addFormData, cost: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={addFormData.price}
            onChange={(e) =>
              setAddFormData({ ...addFormData, price: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={addFormData.quantity}
            onChange={(e) =>
              setAddFormData({ ...addFormData, quantity: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <select
            value={addFormData.category}
            onChange={(e) =>
              setAddFormData({ ...addFormData, category: e.target.value })
            }
            className="p-2 border rounded"
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </form>

      {/* Edit Form */}
      {editingProduct && (
        <form
          onSubmit={handleUpdate}
          className="mb-8 space-y-4 p-4 bg-gray-100 rounded"
        >
          <h2 className="text-xl font-semibold mb-2">Edit Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={editFormData.sku}
              onChange={(e) =>
                setEditFormData({ ...editFormData, sku: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Cost"
              value={editFormData.cost}
              onChange={(e) =>
                setEditFormData({ ...editFormData, cost: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={editFormData.price}
              onChange={(e) =>
                setEditFormData({ ...editFormData, price: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={editFormData.quantity}
              onChange={(e) =>
                setEditFormData({ ...editFormData, quantity: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <select
              value={editFormData.category}
              onChange={(e) =>
                setEditFormData({ ...editFormData, category: e.target.value })
              }
              className="p-2 border rounded"
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Update Product
            </button>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500">No products found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="border p-4 rounded shadow">
                <h3 className="font-semibold">{product.name}</h3>
                <p>SKU: {product.sku}</p>
                <p>Category: {product.category}</p>
                <p>Price: ${product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}