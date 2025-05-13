import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  icon,
  trend,
  className,
  loading = false,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </div>
      {trend && !loading && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              'flex items-center font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
} 