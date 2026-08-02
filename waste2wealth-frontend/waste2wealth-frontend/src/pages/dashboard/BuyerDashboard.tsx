import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Receipt, Leaf, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { WasteCard } from '@/components/shared/WasteCard';
import { Button } from '@/components/ui/Button';
import { Card, EmptyState, Spinner } from '@/components/ui/Primitives';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { WasteListing, Transaction } from '@/types';

export default function BuyerDashboard() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/waste/marketplace?limit=6&sortBy=-createdAt'),
      api.get('/transactions'),
      api.get('/analytics/dashboard'),
    ]).then(([marketRes, txnRes, analyticsRes]) => {
      setListings(marketRes.data.data.waste);
      setTransactions(txnRes.data.data.transactions);
      setAnalytics(analyticsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Overview"><div className="flex justify-center py-24"><Spinner /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Overview">
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Open orders" value={String(transactions.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length)} icon={<Receipt className="h-5 w-5" />} tone="indigo" />
        <StatCard label="Completed orders" value={String(transactions.filter(t => t.status === 'completed').length)} icon={<ShoppingBag className="h-5 w-5" />} tone="forest" />
        <StatCard label="CO₂ impact enabled" value={`${formatNumber(analytics?.totalCarbonSavedKg || 0)} kg`} icon={<Leaf className="h-5 w-5" />} tone="brass" />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Fresh on the marketplace</h2>
          <Link to="/marketplace"><Button size="sm" variant="outline"><Search className="h-4 w-4" /> Browse all</Button></Link>
        </div>

        {listings.length === 0 ? (
          <EmptyState title="No listings yet" description="Check back soon, or post a buyer request to signal demand." />
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((w) => <WasteCard key={w._id} waste={w} />)}
          </div>
        )}
      </div>

      <Card className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Recent orders</h2>
        <div className="mt-4 divide-y divide-ink/[0.06]">
          {transactions.length === 0 && <p className="py-6 text-center text-sm text-ink-faint">No orders yet.</p>}
          {transactions.slice(0, 5).map((t) => (
            <div key={t._id} className="flex items-center justify-between py-3.5">
              <p className="text-sm text-ink">{typeof t.waste === 'object' ? t.waste.wasteName : 'Order'}</p>
              <span className="text-xs font-medium capitalize text-ink-faint">{t.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
