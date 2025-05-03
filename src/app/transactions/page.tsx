"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransactionForm from "../../components/transactions/TransactionForm";
import TransactionList from "../../components/transactions/TransactionList";

export default function TransactionsPage() {
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [profit, setProfit] = useState(0);
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
      const [productsRes, transactionsRes] = await Promise.all([
        fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const productsData = await productsRes.json();
      const transactionsData = await transactionsRes.json();
      if (productsRes.ok) setProducts(productsData);
      if (transactionsRes.ok) {
        setTransactions(transactionsData.transactions);
        setProfit(transactionsData.profit);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <TransactionForm
        products={products}
        onTransactionAdded={() => fetchData(localStorage.getItem("token") || "")}
      />
      <TransactionList transactions={transactions} />
      <div className="mt-6">
        <p className="text-lg font-semibold">
          Total Profit: <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>${profit.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}