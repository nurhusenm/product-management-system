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
      const res = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data || []);
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

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Filter products based on selected filters
  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (filters.category !== "All" && product.category !== filters.category) {
        return false;
      }
      // Search filter
      if (
        filters.searchTerm &&
        !product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !product.sku.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Date filter
      if (filters.dateFilter === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filters.dateFilter === "old") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // Price filter
      if (filters.priceFilter === "highest") {
        return b.price - a.price;
      } else if (filters.priceFilter === "lowest") {
        return a.price - b.price;
      }
      return 0;
    });

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
      />
      <AddProduct onProductAdded={() => fetchProducts(localStorage.getItem("token") || "")} />

      {editingProduct ? (
        <EditProduct
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onProductUpdated={() => {
            setEditingProduct(null);
            fetchProducts(localStorage.getItem("token") || "");
          }}
        />
      ) : (
        <ProductList
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}