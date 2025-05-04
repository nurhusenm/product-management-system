"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransactionForm from "../../components/transactions/TransactionForm";
import TransactionList from "../../components/transactions/TransactionList";

interface Product {
  _id: string;
  name: string;
  quantity: number;
  cost: number;
}

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  productId: { name: string } | null;
  quantity: number;
  price: number;
  date: string;
}

export default function TransactionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profit, setProfit] = useState<number>(0);
  const [inventoryValue, setInventoryValue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?message=Please login to view transactions");
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      setError(null);
      const [productsRes, transactionsRes] = await Promise.all([
        fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const productsData = await productsRes.json();
      const transactionsData = await transactionsRes.json();

      if (productsRes.ok) {
        const formattedProducts = productsData.map((p: any) => ({
          _id: p._id,
          name: p.name,
          quantity: p.quantity ?? 0,
          cost: p.cost ?? 0,
        }));
        setProducts(formattedProducts);
        const totalInventoryValue = formattedProducts.reduce(
          (acc, p) => acc + (p.quantity * p.cost),
          0
        );
        setInventoryValue(totalInventoryValue);
      } else {
        setError(productsData.error || "Failed to fetch products");
      }

      if (transactionsRes.ok) {
        setTransactions(transactionsData.transactions || []);
        setProfit(transactionsData.profit ?? 0);
      } else {
        setError(transactionsData.error || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("An error occurred while fetching data");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Transactions</h1>
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}
      <div className="flex justify-between items-center mb-6">
        <TransactionForm
          products={products}
          onTransactionAdded={() => fetchData(localStorage.getItem("token") || "")}
        />
        <div className="text-lg font-semibold text-gray-700">
          <p>
            Total Profit from Sales:{" "}
            <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
              ${profit.toFixed(2)}
            </span>
          </p>
          <p>
            Current Inventory Value: ${inventoryValue.toFixed(2)}
          </p>
        </div>
      </div>
      <TransactionList
        transactions={transactions}
        onTransactionUpdated={() => fetchData(localStorage.getItem("token") || "")}
      />
    </div>
  );
}