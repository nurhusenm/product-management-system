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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
      const url = "/api/products";
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data || []);
        setFilteredProducts(data || []);
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

  const applyFilters = (newFilters: typeof filters) => {
    let filtered = [...products];

    if (newFilters.category !== "All") {
      filtered = filtered.filter((p) => p.category === newFilters.category);
    }

    if (newFilters.searchTerm) {
      const term = newFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
      );
    }

    if (newFilters.priceFilter !== "all") {
      filtered.sort((a, b) =>
        newFilters.priceFilter === "highest" ? b.price - a.price : a.price - b.price
      );
    }

    if (newFilters.dateFilter !== "all") {
      filtered.sort((a, b) =>
        newFilters.dateFilter === "recent"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
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

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {message && (
        <p className={message.includes("successfully") ? "text-green-500" : "text-red-500"}>
          {message}
        </p>
      )}

      <div className="flex items-center mb-6 gap-4">
        <div className="flex-1">
          <ProductFilters
            onFilterChange={handleFilterChange}
            existingCategories={categories}
          />
        </div>
        <AddProduct
          onProductAdded={() => fetchProducts(localStorage.getItem("token") || "")}
          existingCategories={categories}
        />
      </div>

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
      ) : filteredProducts.length > 0 ? (
        <ProductList
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
        />
      ) : (
        <p className="text-gray-500 text-center">No products matched</p>
      )}
    </div>
  );
}