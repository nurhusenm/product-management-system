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

      console.log("Fetched products:", productsData);
      console.log("Fetched transactions:", transactionsData);

      if (productsRes.ok) {
        // Ensure products have required fields
        const formattedProducts = productsData.map((p: any) => ({
          _id: p._id,
          name: p.name,
          quantity: p.quantity ?? 0,
          cost: p.cost ?? 0,
        }));
        setProducts(formattedProducts);
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
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Transactions</h1>
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}
      <TransactionForm
        products={products}
        onTransactionAdded={() => fetchData(localStorage.getItem("token") || "")}
      />
      <TransactionList transactions={transactions} />
      <div className="mt-6">
        <p className="text-lg font-semibold text-gray-700">
          Total Profit:{" "}
          <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
            ${profit.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}