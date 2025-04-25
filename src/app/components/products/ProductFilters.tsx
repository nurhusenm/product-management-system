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
  onAddCategory: (newCategory: string) => void;
}

export default function ProductFilters({ onFilterChange, existingCategories, onAddCategory }: ProductFiltersProps) {
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      category: filterCategory,
      searchTerm,
      priceFilter,
      dateFilter,
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setShowAddCategory(false);
      setNewCategory("");
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleFilterChange();
          }}
          className="p-2 border rounded flex-grow"
        />
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              handleFilterChange();
            }}
            className="p-2 border rounded"
          >
            <option value="All">All Categories</option>
            {existingCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        {/* <button
            onClick={() => setShowAddCategory(true)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Category
          </button>   */}
        </div>
        <select
          value={priceFilter}
          onChange={(e) => {
            setPriceFilter(e.target.value);
            handleFilterChange();
          }}
          className="p-2 border rounded"
        >
          <option value="all">All Prices</option>
          <option value="highest">Highest to Lowest</option>
          <option value="lowest">Lowest to Highest</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            handleFilterChange();
          }}
          className="p-2 border rounded"
        >
          <option value="all">All Dates</option>
          <option value="recent">Recently Added</option>
          <option value="old">Oldest First</option>
        </select>
      </div>

      {showAddCategory && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={handleAddCategory}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddCategory(false);
              setNewCategory("");
            }}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
} 