import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LayoutDashboard, ArrowLeftRight, Tags } from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { TransactionList } from '@/components/TransactionList';
import { CategoryManager } from '@/components/CategoryManager';

/**
 * Root application component.
 *
 * Renders a header with the app title and tab-based navigation
 * between Dashboard, Transactions, and Categories views.
 * Wrapped in an ErrorBoundary for graceful error handling.
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* ── Header ────────────────────────────────────────── */}
        <header className="border-b bg-card">
          <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
            <h1 className="text-lg font-semibold tracking-tight">
              Budget Tracker
            </h1>
          </div>
        </header>

        {/* ── Main content with tabs ────────────────────────── */}
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard" className="gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-1.5">
                <ArrowLeftRight className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-1.5">
                <Tags className="h-4 w-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionList />
            </TabsContent>

            <TabsContent value="categories">
              <CategoryManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
