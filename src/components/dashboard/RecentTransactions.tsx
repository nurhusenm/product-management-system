import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  amount: number;
  productName: string;
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function RecentTransactions({
  transactions,
  loading = false,
}: RecentTransactionsProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b text-sm last:border-0"
              >
                <td className="py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      transaction.type === 'sale'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                  </span>
                </td>
                <td className="py-3 font-medium">{transaction.productName}</td>
                <td className="py-3">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(transaction.amount)}
                </td>
                <td className="py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(transaction.createdAt), {
                    addSuffix: true,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 