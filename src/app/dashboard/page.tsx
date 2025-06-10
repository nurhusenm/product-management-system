import { Suspense } from 'react';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { QuickActions } from '@/components/dashboard/QuickActions';

// This would typically come from an API
const mockData = {
  metrics: {
    salesToday: 1250.75,
    purchasesToday: 850.25,
    profitToday: 400.5,
    inventoryWorth: 15000,
    lowStockCount: 5,
  },
  trends: [
    { date: '2024-01-01', sales: 1200, purchases: 800 },
    { date: '2024-01-02', sales: 1300, purchases: 850 },
    { date: '2024-01-03', sales: 1100, purchases: 900 },
    { date: '2024-01-04', sales: 1400, purchases: 950 },
    { date: '2024-01-05', sales: 1250, purchases: 850 },
    { date: '2024-01-06', sales: 1350, purchases: 900 },
    { date: '2024-01-07', sales: 1500, purchases: 1000 },
  ],
  recentTransactions: [
    {
      id: '1',
      type: 'sale' as const,
      amount: 150.75,
      productName: 'Product A',
      createdAt: '2024-01-07T10:00:00Z',
    },
    {
      id: '2',
      type: 'purchase' as const,
      amount: 200.25,
      productName: 'Product B',
      createdAt: '2024-01-07T09:30:00Z',
    },
    {
      id: '3',
      type: 'sale' as const,
      amount: 75.50,
      productName: 'Product C',
      createdAt: '2024-01-07T09:00:00Z',
    },
    {
      id: '4',
      type: 'purchase' as const,
      amount: 300.00,
      productName: 'Product D',
      createdAt: '2024-01-07T08:30:00Z',
    },
    {
      id: '5',
      type: 'sale' as const,
      amount: 125.25,
      productName: 'Product E',
      createdAt: '2024-01-07T08:00:00Z',
    },
  ],
  topProducts: [
    {
      id: '1',
      name: 'Product A',
      quantitySold: 150,
      revenue: 22500,
      trend: 12.5,
    },
    {
      id: '2',
      name: 'Product B',
      quantitySold: 120,
      revenue: 18000,
      trend: 8.3,
    },
    {
      id: '3',
      name: 'Product C',
      quantitySold: 100,
      revenue: 15000,
      trend: -5.2,
    },
    {
      id: '4',
      name: 'Product D',
      quantitySold: 80,
      revenue: 12000,
      trend: 15.7,
    },
    {
      id: '5',
      name: 'Product E',
      quantitySold: 60,
      revenue: 9000,
      trend: 3.1,
    },
  ],
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
      </div>

      <Suspense fallback={<MetricCards data={mockData.metrics} loading />}>
        <MetricCards data={mockData.metrics} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<TrendChart data={[]} loading />}>
          <TrendChart data={mockData.trends} />
        </Suspense>

        <Suspense fallback={<RecentTransactions transactions={[]} loading />}>
          <RecentTransactions transactions={mockData.recentTransactions} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<TopProducts products={[]} loading />}>
          <TopProducts products={mockData.topProducts} />
        </Suspense>

        <QuickActions />
      </div>
    </div>
  );
} 