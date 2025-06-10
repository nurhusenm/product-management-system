"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface TrendData {
  date: string;
  sales: number;
  purchases: number;
}

interface TrendChartProps {
  data: TrendData[];
  loading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry, index: number) => {
            const value = entry.value;
            if (typeof value !== 'number') return null;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function TrendChart({ data, loading = false }: TrendChartProps) {
  if (loading) {
    return (
      <Card className="h-[400px] w-full animate-pulse bg-muted p-6" />
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-black">Sales vs Purchases Trend</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-sm text-muted-foreground"
              tickLine={false}
            />
            <YAxis
              className="text-sm text-muted-foreground"
              tickLine={false}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="Sales"
            />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              name="Purchases"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 