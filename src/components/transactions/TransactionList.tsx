"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  productId: { _id: string; name: string; cost: number; quantity: number } | null;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    type: "sale" as "sale" | "purchase",
    quantity: "",
    price: "",
  });
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const editModalRef = useRef<HTMLDivElement | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
        setIsEditModalOpen(false);
        setEditingTransaction(null);
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        setIsDeleteModalOpen(false);
        setDeleteTransaction(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDelete = async (transaction: Transaction) => {
    setDeleteTransaction(transaction);
    setIsDeleteModalOpen(true);
    setMenuOpen(null);
  };

  const confirmDelete = async () => {
    if (!deleteTransaction) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${deleteTransaction._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccessMessage(`${deleteTransaction.productId?.name || "Transaction"} deleted successfully`);
        onTransactionUpdated();
        setIsDeleteModalOpen(false);
        setDeleteTransaction(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete transaction");
      }
    } catch (error) {
      alert("An error occurred while deleting the transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (transaction: Transaction) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${transaction.productId?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const productData = await res.json();
        setEditingTransaction({
          ...transaction,
          productId: {
            ...transaction.productId!,
            quantity: productData.quantity,
            cost: productData.cost
          }
        });
        setEditFormData({
          type: transaction.type,
          quantity: transaction.quantity.toString(),
          price: transaction.price.toString(),
        });
        setIsEditModalOpen(true);
        setMenuOpen(null);
      } else {
        alert("Failed to fetch product data");
      }
    } catch (error) {
      alert("Error fetching product data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    setEditErrorMessage("");
  };

  // Calculate total profit from all transactions
  const calculateTotalProfit = () => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === "sale" && transaction.productId) {
        const profit = (transaction.price - transaction.productId.cost) * transaction.quantity;
        return total + profit;
      }
      return total;
    }, 0);
  };

  const totalProfit = calculateTotalProfit();

  const calculateProfitLoss = () => {
    if (!editingTransaction?.productId || editFormData.type !== "sale") return null;
    const salePrice = parseFloat(editFormData.price);
    const cost = editingTransaction.productId.cost;
    const quantity = parseInt(editFormData.quantity);
    if (!isNaN(salePrice) && !isNaN(quantity) && cost) {
      return (salePrice - cost) * quantity;
    }
    return null;
  };

  const profitLoss = calculateProfitLoss();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editingTransaction) {
      setEditErrorMessage("Please login to edit transactions");
      router.push("/login");
      return;
    }

    const quantity = parseInt(editFormData.quantity);
    const price = parseFloat(editFormData.price);

    if (isNaN(quantity) || isNaN(price)) {
      setEditErrorMessage("All fields must be valid numbers");
      return;
    }

    if (quantity <= 0 || price <= 0) {
      setEditErrorMessage("Quantity and price must be positive");
      return;
    }

    if (editFormData.type === "sale" && editingTransaction.productId && quantity > editingTransaction.productId.quantity) {
      setEditErrorMessage(`Insufficient stock. Available: ${editingTransaction.productId.quantity}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: editFormData.type,
          productId: editingTransaction.productId?._id,
          quantity,
          price,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`${editingTransaction.productId?.name || "Transaction"} updated successfully`);
        setIsEditModalOpen(false);
        setEditingTransaction(null);
        onTransactionUpdated();
        setEditErrorMessage("");
      } else {
        setEditErrorMessage(data.error || "Failed to update transaction");
      }
    } catch (error) {
      setEditErrorMessage("An error occurred while updating the transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-black">Processing...</span>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      {isLoading && <LoadingSpinner />}
      
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center z-50">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-black">Total Profit Overview</h2>
            <span className={`text-lg font-semibold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${Math.abs(totalProfit).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-black">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-lg font-semibold">
                ${transactions
                  .filter(t => t.type === "sale")
                  .reduce((sum, t) => sum + (t.price * t.quantity), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-lg font-semibold">
                ${transactions
                  .filter(t => t.type === "purchase")
                  .reduce((sum, t) => sum + (t.price * t.quantity), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div> */}

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
                            disabled={isSubmitting}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            {isSubmitting ? "Loading..." : "Edit"}
                          </button>
                          <button
                            onClick={() => handleDelete(transaction)}
                            disabled={isLoading}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            {isLoading ? "Loading..." : "Delete"}
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

      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={editModalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingTransaction(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black">Edit Transaction</h2>
            {editErrorMessage && <p className="text-red-500 mb-4">{editErrorMessage}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">Product</label>
                <input
                  type="text"
                  value={editingTransaction.productId?.name || "Unknown"}
                  disabled
                  className="w-full p-2 border rounded-lg bg-gray-50 text-black"
                />
                {editingTransaction.productId && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-black">
                      Available Stock: <span className="font-semibold text-blue-600">{editingTransaction.productId.quantity}</span> units
                    </p>
                    <p className="text-sm text-black mt-1">
                      Cost Price: <span className="font-semibold">${editingTransaction.productId.cost.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Type</label>
                <select
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="sale">Sale</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={editFormData.quantity}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Price</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  step="0.01"
                  required
                />
                {editFormData.type === "sale" && editingTransaction.productId && profitLoss !== null && (
                  <p className={`text-sm mt-1 ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {profitLoss >= 0
                      ? `Total Profit: $${profitLoss.toFixed(2)}`
                      : `Total Loss: $${Math.abs(profitLoss).toFixed(2)}`}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  disabled={isLoading}
                  className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                >
                  {isLoading ? "Updating..." : "Update Transaction"}
                </button>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTransaction(null);
                  }}
                  disabled={isLoading}
                  className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 disabled:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deleteTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={deleteModalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4 text-black">Confirm Delete</h2>
            <p className="text-black mb-6">
              Are you sure you want to delete the transaction for{" "}
              <span className="font-semibold">{deleteTransaction.productId?.name || "Unknown"}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:bg-red-400"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTransaction(null);
                }}
                disabled={isLoading}
                className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 disabled:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}