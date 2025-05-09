"use client";

import { useState } from "react";

interface TransactionFilterProps {
  onApply: (filters: any) => void;
  onClose: () => void;
}

export default function TransactionFilter({ onApply, onClose }: TransactionFilterProps) {
  const [type, setType] = useState("");
  const [productName, setProductName] = useState("");
  const [dateRange, setDateRange] = useState("");

  const handleApply = () => {
    onApply({ type, productName, dateRange });
  };

  const handleClear = () => {
    setType("");
    setProductName("");
    setDateRange("");
    onApply({ type: "", productName: "", dateRange: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter Transactions</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}