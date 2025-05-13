import { Card } from '@/components/ui/card';
import { Plus, ShoppingCart, Package, BarChart } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Add Product',
    href: '/products/new',
    icon: <Plus className="h-5 w-5" />,
    description: 'Add a new product to inventory',
  },
  {
    label: 'New Sale',
    href: '/sales/new',
    icon: <ShoppingCart className="h-5 w-5" />,
    description: 'Record a new sale',
  },
  {
    label: 'New Purchase',
    href: '/purchases/new',
    icon: <Package className="h-5 w-5" />,
    description: 'Record a new purchase',
  },
  {
    label: 'View Reports',
    href: '/reports',
    icon: <BarChart className="h-5 w-5" />,
    description: 'View detailed reports',
  },
];

export function QuickActions() {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative flex flex-col items-center rounded-lg border p-4 text-center transition-colors hover:bg-muted/50"
          >
            <div className="mb-2 rounded-full bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
              {action.icon}
            </div>
            <h4 className="font-medium">{action.label}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
} 