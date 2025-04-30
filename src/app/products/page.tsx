"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductFilters from "../components/products/ProductFilters";
import AddProduct from "../components/products/AddProduct";
import EditProduct from "../components/products/EditProduct";
import ProductList from "../components/products/ProductList";

interface Product {
  _id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: "All",
    searchTerm: "",
    priceFilter: "all",
    dateFilter: "all",
  });
  const router = useRouter();

  // Fetch products on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?message=Please login to view products&showSignup=true");
      return;
    }
    fetchProducts(token);
  }, [router]);

  const fetchProducts = async (token: string) => {
    try {
      let url = "/api/products?";
      if (filters.category !== "All") {
        url += `category=${encodeURIComponent(filters.category)}&`;
      }
      if (filters.searchTerm) {
        url += `search=${encodeURIComponent(filters.searchTerm)}&`;
      }
      if (filters.priceFilter !== "all") {
        url += `sortBy=price&sortOrder=${filters.priceFilter === "highest" ? "desc" : "asc"}&`;
      }
      if (filters.dateFilter !== "all") {
        url += `sortBy=createdAt&sortOrder=${filters.dateFilter === "recent" ? "desc" : "asc"}&`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data || []);
        // Update categories whenever products change
        const uniqueCategories = Array.from(
          new Set(data.map((product: Product) => product.category))
        ) as string[];
        setCategories(uniqueCategories);
      } else {
        setMessage(data.error || "Failed to fetch products");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
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

  const handleAddCategory = async (newCategory: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (response.ok) {
        fetchProducts(token);
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/categories?name=${encodeURIComponent(category)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProducts(token);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {message && (
        <p className={message.includes("successfully") ? "text-green-500" : "text-red-500"}>
          {message}
        </p>
      )}

      <ProductFilters 
        onFilterChange={setFilters} 
        existingCategories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
      <AddProduct 
        onProductAdded={() => fetchProducts(localStorage.getItem("token") || "")}
        existingCategories={categories}
        onAddCategory={handleAddCategory}
      />

      {editingProduct ? (
        <EditProduct
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onProductUpdated={() => {
            setEditingProduct(null);
            fetchProducts(localStorage.getItem("token") || "");
          }}
          existingCategories={categories}
        />
      ) : (
        <ProductList
          products={products}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}