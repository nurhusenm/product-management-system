"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  quantity: number;
  cost: number;
}

interface TransactionFormProps {
  products: Product[];
  onTransactionAdded: () => void;
}

export default function TransactionForm({ products, onTransactionAdded }: TransactionFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    type: "sale" as "sale" | "purchase",
    quantity: "",
    price: "",
    salePrice: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [profitLoss, setProfitLoss] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (formData.productId) {
      const product = products.find((p) => p._id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  useEffect(() => {
    if (selectedProduct && formData.type === "sale" && formData.price) {
      const salePrice = parseFloat(formData.price);
      const cost = selectedProduct.cost;
      if (!isNaN(salePrice) && cost) {
        setProfitLoss(salePrice - cost);
      } else {
        setProfitLoss(null);
      }
    } else {
      setProfitLoss(null);
    }
  }, [selectedProduct, formData.type, formData.price]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Please login to record transactions");
      router.push("/login");
      return;
    }

    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);
    const salePrice = formData.salePrice ? parseFloat(formData.salePrice) : undefined;

    if (!formData.productId || isNaN(quantity) || isNaN(price) || (formData.type === "purchase" && !salePrice)) {
      setErrorMessage("All required fields must be valid");
      return;
    }

    if (quantity <= 0 || price <= 0 || (salePrice && salePrice <= 0)) {
      setErrorMessage("Quantity, price, and sale price must be positive");
      return;
    }

    if (formData.type === "sale" && selectedProduct && quantity > selectedProduct.quantity) {
      setErrorMessage(`Insufficient stock. Available: ${selectedProduct.quantity}`);
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
          quantity,
          price,
          salePrice,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ productId: "", type: "sale", quantity: "", price: "", salePrice: "" });
        setIsModalOpen(false);
        onTransactionAdded();
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Failed to record transaction");
      }
    } catch (error) {
      setErrorMessage("An error occurred while recording the transaction");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-200"
      >
        Record Transaction
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Record Transaction</h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {selectedProduct && (
                <p className="text-sm text-gray-500">
                  Current Stock: {selectedProduct.quantity}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sale">Sale</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {formData.type === "sale" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Sale Price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    required
                  />
                  {formData.type === "sale" && profitLoss !== null && (
                    <p className={`text-sm ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {profitLoss >= 0
                        ? `Profit per unit: $${profitLoss.toFixed(2)}`
                        : `Loss per unit: $${Math.abs(profitLoss).toFixed(2)}`}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost (Purchase Price)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Cost"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sale Price (Selling Price)</label>
                    <input
                      type="number"
                      name="salePrice"
                      placeholder="Sale Price"
                      value={formData.salePrice}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Record Transaction
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}