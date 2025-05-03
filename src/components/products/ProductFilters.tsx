"use client";

import { useState, useEffect } from "react";

interface ProductFiltersProps {
  onFilterChange: (filters: {
    category: string;
    searchTerm: string;
    priceFilter: string;
    dateFilter: string;
  }) => void;
  existingCategories: string[];
}

export default function ProductFilters({ onFilterChange, existingCategories }: ProductFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: "All",
    searchTerm: "",
    priceFilter: "all",
    dateFilter: "all",
  });

  useEffect(() => {
    if (isFiltersOpen) {
      onFilterChange(localFilters);
    }
  }, [localFilters, isFiltersOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, searchTerm: e.target.value };
    setLocalFilters(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: "All",
      searchTerm: "",
      priceFilter: "all",
      dateFilter: "all",
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h14m-7 4h7m-14 4h14"
          />
        </svg>
        {isFiltersOpen ? "Hide Filters" : "Show Filters"}
      </button>

      {isFiltersOpen && (
        <div className="absolute top-12 left-0 right-0 p-4 bg-white rounded-lg shadow-lg space-y-4 z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={localFilters.searchTerm}
              onChange={handleSearchChange}
              className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={localFilters.category}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, category: e.target.value })
              }
              className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="All">All Categories</option>
              {existingCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <select
              value={localFilters.priceFilter}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, priceFilter: e.target.value })
              }
              className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Prices</option>
              <option value="highest">Highest to Lowest</option>
              <option value="lowest">Lowest to Highest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Added</label>
            <select
              value={localFilters.dateFilter}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, dateFilter: e.target.value })
              }
              className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Dates</option>
              <option value="recent">Recently Added</option>
              <option value="old">Oldest First</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}