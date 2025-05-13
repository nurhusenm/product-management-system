import { DollarSign, TrendingUp, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { KpiCard } from './KpiCard';

interface MetricCardsProps {
  data: {
    salesToday: number;
    purchasesToday: number;
    profitToday: number;
    inventoryWorth: number;
    lowStockCount: number;
  };
  loading?: boolean;
}

export function MetricCards({ data, loading = false }: MetricCardsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        title="Today's Sales"
        value={formatCurrency(data.salesToday)}
        icon={<DollarSign className="h-5 w-5" />}
        loading={loading}
      />
      <KpiCard
        title="Today's Purchases"
        value={formatCurrency(data.purchasesToday)}
        icon={<ShoppingCart className="h-5 w-5" />}
        loading={loading}
      />
      <KpiCard
        title="Net Profit (Today)"
        value={formatCurrency(data.profitToday)}
        icon={<TrendingUp className="h-5 w-5" />}
        trend={{
          value: ((data.profitToday - data.purchasesToday) / data.purchasesToday) * 100,
          isPositive: data.profitToday > data.purchasesToday,
        }}
        loading={loading}
      />
      <KpiCard
        title="Inventory Worth"
        value={formatCurrency(data.inventoryWorth)}
        icon={<Package className="h-5 w-5" />}
        loading={loading}
      />
      <KpiCard
        title="Low Stock Items"
        value={data.lowStockCount}
        icon={<AlertTriangle className="h-5 w-5" />}
        loading={loading}
      />
    </div>
  );
} 