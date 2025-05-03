"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react"; // Install `lucide-react` for icons

interface Product {
  _id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
    setDropdownOpenId(null);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">Product List</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Added</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-50 text-black">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.sku}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">${product.price}</td>
                <td className="p-3">{product.quantity}</td>
                <td className="p-3">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 relative">
                  <button
                    onClick={() =>
                      setDropdownOpenId(dropdownOpenId === product._id ? null : product._id)
                    }
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown */}
                  {dropdownOpenId === product._id && (
                    <div className="absolute right-0 mt-2 w-28 bg-white shadow-md rounded border z-10">
                      <button
                        onClick={() => onEdit(product)}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-black">Confirm Delete</h3>
            <p className="mb-6 text-black">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 text-black border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
