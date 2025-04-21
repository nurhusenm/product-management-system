"use client";
import './globals.css'; // Adjust path based on your structure
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RootLayout({ children }) {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  };

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Inventory MVP
            </Link>
            <div className="space-x-4">
              {token ? (
                <>
                  <Link href="/products" className="hover:underline">
                    Products
                  </Link>
                  <button onClick={handleLogout} className="hover:underline">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                  <Link href="/signup" className="hover:underline">
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}