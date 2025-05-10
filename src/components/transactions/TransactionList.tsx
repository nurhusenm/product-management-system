"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  productId: { name: string } | null;
  quantity: number;
  price: number;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
}

export default function TransactionList({ transactions, onTransactionUpdated }: TransactionListProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (transactionId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onTransactionUpdated();
        setMenuOpen(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete transaction");
      }
    } catch (error) {
      alert("An error occurred while deleting the transaction");
    }
  };

  const handleEdit = (transaction: Transaction) => {
    alert("Edit functionality to be implemented");
    setMenuOpen(null);
    // Implement edit logic later
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border text-gray-800 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Date</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Type</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Product</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Quantity</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Price</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Total</th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const total =
                  typeof transaction.quantity === "number" &&
                  typeof transaction.price === "number"
                    ? (transaction.quantity * transaction.price).toFixed(2)
                    : "N/A";
                const isSale = transaction.type === "sale";

                return (
                  <tr
                    key={transaction._id}
                    className={`hover:bg-gray-50 ${isSale ? "bg-green-50" : "bg-blue-50"} text-black`}
                  >
                    <td className="py-2 px-4 border-b">
                      {transaction.date
                        ? new Date(transaction.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b font-medium">
                      {transaction.type || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {transaction.productId?.name || "Unknown"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {typeof transaction.quantity === "number"
                        ? transaction.quantity
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {typeof transaction.price === "number"
                        ? `$${transaction.price.toFixed(2)}`
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">${total}</td>
                    <td className="py-2 px-4 border-b relative">
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === transaction._id ? null : transaction._id)
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v.01M12 12v.01M12 18v.01"
                          />
                        </svg>
                      </button>
                      {menuOpen === transaction._id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10"
                        >
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}




      
    </div>
  );
}