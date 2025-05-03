"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TransactionFormProps {
  products: { _id: string; name: string }[];
  onTransactionAdded: () => void;
}

export default function TransactionForm({ products, onTransactionAdded }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    productId: "",
    type: "sale" as "sale" | "purchase",
    quantity: "",
    price: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Please login to record transactions");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ productId: "", type: "sale", quantity: "", price: "" });
        onTransactionAdded();
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Failed to record transaction");
      }
    } catch (error) {
      setErrorMessage("An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add Transaction</h2>
      <div>
        <label className="block text-sm font-medium">Product</label>
        <select
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="sale">Sale</option>
          <option value="purchase">Purchase</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Quantity</label>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Price</label>
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          step="0.01"
          required
        />
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <button
        onClick={handleSubmit}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Record Transaction
      </button>
    </div>
  );
}