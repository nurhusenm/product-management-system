import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  trend: number;
}

interface TopProductsProps {
  products: Product[];
  loading?: boolean;
}

export function TopProducts({ products, loading = false }: TopProductsProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted text-black" />
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
      <h3 className="mb-4 text-lg font-semibold text-black">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="pb-3 font-medium text-black">Product</th>
              <th className="pb-3 font-medium text-black">Quantity Sold</th>
              <th className="pb-3 font-medium text-black">Revenue</th>
              <th className="pb-3 font-medium text-black">Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b text-sm last:border-0"
              >
                <td className="py-3 font-medium text-black">{product.name}</td>
                <td className="py-3 text-black">{product.quantitySold}</td>
                <td className="py-3 text-black">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(product.revenue)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp
                      className={`h-4 w-4 ${
                        product.trend >= 0
                          ? 'text-green-600'
                          : 'rotate-180 text-red-600'
                      }`}
                    />
                    <span
                      className={
                        product.trend >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {Math.abs(product.trend)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 