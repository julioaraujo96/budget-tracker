import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Wallet,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import { formatCurrency, formatDate, capitalize, today } from '@/utils/formatters';
import { ExpensesPieChart } from '@/components/Charts/ExpensesPieChart';
import { MonthlyBarChart } from '@/components/Charts/MonthlyBarChart';

/**
 * Maps transaction types to visual configuration (icon, color).
 */
const TYPE_CONFIG = {
  income: {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  expense: {
    icon: TrendingDown,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  investment: {
    icon: Landmark,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
};

/**
 * Summary card displaying a financial metric.
 *
 * @param {object} props
 * @param {string} props.title - Card title
 * @param {number} props.amount - Amount to display
 * @param {import('lucide-react').LucideIcon} props.icon - Icon component
 * @param {string} props.iconColor - Tailwind text color class for the icon
 * @param {string} props.iconBg - Tailwind bg color class for the icon container
 */
function SummaryCard({ title, amount, icon: Icon, iconColor, iconBg }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-semibold tracking-tight">
            {formatCurrency(amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Type badge variant mapping for recent transactions.
 */
const TYPE_BADGE_CLASSES = {
  income: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expense: 'bg-red-100 text-red-700 border-red-200',
  investment: 'bg-blue-100 text-blue-700 border-blue-200',
};

/**
 * Dashboard component showing financial summary, charts, and recent transactions.
 * Fetches aggregated data from the /api/dashboard endpoint.
 */
export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getDashboard({ endDate: today() });
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            Failed to load dashboard: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { totals, balance, categoryBreakdown, monthlyEvolution, recentTransactions } = data;

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Income"
          amount={totals.income}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          title="Expenses"
          amount={totals.expense}
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <SummaryCard
          title="Investments"
          amount={totals.investment}
          icon={Landmark}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <SummaryCard
          title="Balance"
          amount={balance}
          icon={Wallet}
          iconColor="text-foreground"
          iconBg="bg-muted"
        />
      </div>

      {/* ── Charts ────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExpensesPieChart data={categoryBreakdown} />
        <MonthlyBarChart data={monthlyEvolution} />
      </div>

      {/* ── Recent Transactions ───────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions?.length ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          TYPE_CONFIG[tx.type]?.bg || 'bg-muted'
                        }`}
                      >
                        {(() => {
                          const Icon = TYPE_CONFIG[tx.type]?.icon || Wallet;
                          return (
                            <Icon
                              className={`h-4 w-4 ${
                                TYPE_CONFIG[tx.type]?.color || 'text-foreground'
                              }`}
                            />
                          );
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {tx.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(tx.date)}</span>
                          {tx.categoryName && (
                            <>
                              <span>·</span>
                              <span>{tx.categoryName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={TYPE_BADGE_CLASSES[tx.type]}
                      >
                        {capitalize(tx.type)}
                      </Badge>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          tx.type === 'income'
                            ? 'text-emerald-600'
                            : tx.type === 'expense'
                              ? 'text-red-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
