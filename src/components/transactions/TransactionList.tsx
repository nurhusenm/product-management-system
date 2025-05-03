"use client";

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  productId: { name: string };
  quantity: number;
  price: number;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Type</th>
              <th className="py-2 px-4 border">Product</th>
              <th className="py-2 px-4 border">Quantity</th>
              <th className="py-2 px-4 border">Price</th>
              <th className="py-2 px-4 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="py-2 px-4 border">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">{transaction.type}</td>
                <td className="py-2 px-4 border">{transaction.productId.name}</td>
                <td className="py-2 px-4 border">{transaction.quantity}</td>
                <td className="py-2 px-4 border">${transaction.price.toFixed(2)}</td>
                <td className="py-2 px-4 border">${(transaction.quantity * transaction.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}