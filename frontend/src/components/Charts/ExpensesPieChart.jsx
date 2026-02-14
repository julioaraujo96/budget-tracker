import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

/**
 * Color palette for pie chart slices.
 * Uses a curated set of accessible, distinguishable colors.
 */
const COLORS = [
  'oklch(0.646 0.222 41.116)',   // chart-1 (warm orange)
  'oklch(0.6 0.118 184.704)',    // chart-2 (teal)
  'oklch(0.398 0.07 227.392)',   // chart-3 (dark blue)
  'oklch(0.828 0.189 84.429)',   // chart-4 (gold)
  'oklch(0.769 0.188 70.08)',    // chart-5 (amber)
  'oklch(0.55 0.2 260)',         // blue-purple
  'oklch(0.65 0.18 150)',        // green
  'oklch(0.7 0.15 30)',          // salmon
  'oklch(0.5 0.15 300)',         // purple
  'oklch(0.75 0.12 90)',         // lime
];

/**
 * Custom tooltip for the pie chart.
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { name, amount } = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{name}</p>
      <p className="text-muted-foreground">{formatCurrency(amount)}</p>
    </div>
  );
}

/**
 * Pie chart showing expense distribution by category.
 *
 * @param {object} props
 * @param {Array<{name: string, amount: number}>} props.data - Category breakdown data
 */
export function ExpensesPieChart({ data = [] }) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
