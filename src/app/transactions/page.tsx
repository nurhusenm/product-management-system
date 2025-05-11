"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransactionForm from "../../components/transactions/TransactionForm";
import TransactionList from "../../components/transactions/TransactionList";
import TransactionFilter from "../../components/transactions/transactionFilter";
import jsPDF from "jspdf";
// import "jspdf-autotable";
import autoTable from "jspdf-autotable";


interface Product {
  _id: string;
  name: string;
  quantity: number;
  cost: number;
}

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  productId: { _id: string; name: string; cost: number; quantity: number } | null;
  quantity: number;
  price: number;
  date: string;
}

export default function TransactionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profit, setProfit] = useState<number>(0);
  const [showProfitDetails, setShowProfitDetails] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    productName: "",
    dateRange: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?message=Please login to view transactions");
      return;
    }
    fetchData(token, filters, page);
  }, [router, filters, page]);

  useEffect(() => {
    const calculateTotalProfit = () => {
      return transactions.reduce((total, transaction) => {
        if (transaction.type === "sale" && transaction.productId) {
          // Find the product to get its cost
          const product = products.find(p => p._id === transaction.productId?._id);
          if (product) {
            const profit = (transaction.price - product.cost) * transaction.quantity;
            return total + profit;
          }
        }
        return total;
      }, 0);
    };

    if (transactions.length > 0 && products.length > 0) {
      const totalProfit = calculateTotalProfit();
      setProfit(totalProfit);
    }
  }, [transactions, products]);

  const fetchData = async (token: string, filters: any, currentPage: number) => {
    try {
      setError(null);
      const [productsRes, transactionsRes] = await Promise.all([
        fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `/api/transactions?type=${filters.type}&productName=${filters.productName}&dateRange=${filters.dateRange}&page=${currentPage}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
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
      } else {
        setError(productsData.error || "Failed to fetch products");
      }
  
      if (transactionsRes.ok) {
        setTransactions(transactionsData.transactions || []);
        setTotalPages(transactionsData.totalPages || 1); // Set total pages
      } else {
        setError(transactionsData.error || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("An error occurred while fetching data");
    }
  };

  const removeFilter = (filterKey: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: "" }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
autoTable(doc, {
  head: [["Date", "Type", "Product", "Quantity", "Price", "Total"]],
  body: transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.productId?.name || "Unknown",
    t.quantity,
    `$${t.price.toFixed(2)}`,
    `$${(t.quantity * t.price).toFixed(2)}`,
  ]),
});
doc.save("transactions.pdf");

  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Transactions</h1>
        <button
          onClick={exportToPDF}
          className="px-2 text-xs py-1 font-bold bg-black text-white rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Export to PDF
        </button>
      </div>
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <TransactionForm
          products={products}
          onTransactionAdded={() => fetchData(localStorage.getItem("token") || "", filters, page)}
        />
        <button
          onClick={() => setIsFilterOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-600 transition duration-200 order-2 md:order-1"
        >
          Filter
        </button>
        <div 
          onClick={() => setShowProfitDetails(!showProfitDetails)}
          className="bg-white rounded-lg shadow-md px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 order-1 md:order-2"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Total Profit:</span>
            <span className={`text-lg font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {showProfitDetails ? (
                `${profit >= 0 ? "+ " : "-"}$${Math.abs(profit).toFixed(2)}`
              ) : (
                <div className="flex items-center">
                  <span className="mr-1">${Math.abs(profit).toFixed(2)}</span>
                  {/* <svg
                    className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${showProfitDetails ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg> */}
                </div>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.type && (
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm text-gray-800">
            {filters.type}
            <button
              onClick={() => removeFilter("type")}
              className="ml-1 text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        )}
        {filters.productName && (
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm text-gray-800">
            Product: {filters.productName}
            <button
              onClick={() => removeFilter("productName")}
              className="ml-1 text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        )}
        {filters.dateRange && (
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm text-gray-800">
            Date: {filters.dateRange}
            <button
              onClick={() => removeFilter("dateRange")}
              className="ml-1 text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <TransactionList
        transactions={transactions}
        onTransactionUpdated={() => fetchData(localStorage.getItem("token") || "", filters, page)}
      />
      {isFilterOpen && (
        <TransactionFilter
          onApply={(newFilters) => {
            setFilters(newFilters);
            setIsFilterOpen(false);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
      )}



<div className="flex justify-between mt-4">
  <button
    onClick={() => setPage((p) => Math.max(p - 1, 1))}
    disabled={page === 1}
    className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:bg-gray-400"
  >
    Previous
  </button>
  <span>Page {page} of {totalPages}</span>
  <button
    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
    disabled={page === totalPages}
    className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:bg-gray-400"
  >
    Next
  </button>
</div>
    </div>
  );
}