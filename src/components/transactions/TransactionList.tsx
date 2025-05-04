"use client";

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  productId: { name: string } | null; // Allow null in case population fails
  quantity: number;
  price: number;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  // Log transactions to debug data structure
  console.log("Transactions received:", transactions);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-black">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500  text-black">No transactions found</p>
      ) : (
        <table className="min-w-full bg-white border text-black">
          <thead>
            <tr>
              <th className="py-2 px-4 border text-black">Date</th>
              <th className="py-2 px-4 border text-black">Type</th>
              <th className="py-2 px-4 border text-black">Product</th>
              <th className="py-2 px-4 border text-black">Quantity</th>
              <th className="py-2 px-4 border text-black">Price</th>
              <th className="py-2 px-4 border text-black">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              // Calculate total safely
              const total =
                typeof transaction.quantity === "number" &&
                typeof transaction.price === "number"
                  ? (transaction.quantity * transaction.price).toFixed(2)
                  : "N/A";

              return (
                <tr key={transaction._id}>
                  <td className="py-2 px-4 border">
                    {transaction.date
                      ? new Date(transaction.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 border">{transaction.type || "N/A"}</td>
                  <td className="py-2 px-4 border">
                    {transaction.productId?.name || "Unknown"}
                  </td>
                  <td className="py-2 px-4 border">
                    {typeof transaction.quantity === "number"
                      ? transaction.quantity
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    {typeof transaction.price === "number"
                      ? `$${transaction.price.toFixed(2)}`
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 border">${total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}