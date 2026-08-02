import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, IndianRupee, Leaf, Eye, PackagePlus, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/Button';
import { Card, EmptyState, Spinner, Badge } from '@/components/ui/Primitives';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { WasteListing } from '@/types';

export default function GeneratorDashboard() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/waste'),
      api.get('/analytics/dashboard'),
    ]).then(([wasteRes, analyticsRes]) => {
      setListings(wasteRes.data.data.waste);
      setAnalytics(analyticsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Overview"><div className="flex justify-center py-24"><Spinner /></div></DashboardLayout>;

  const activeListings = listings.filter((l) => l.status === 'active').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

  return (
    <DashboardLayout title="Overview">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active listings" value={String(activeListings)} icon={<Package className="h-5 w-5" />} tone="forest" />
        <StatCard label="Revenue (completed)" value={formatCurrency(analytics?.totalRevenue || 0)} icon={<IndianRupee className="h-5 w-5" />} tone="indigo" />
        <StatCard label="CO₂ saved" value={`${formatNumber(analytics?.totalCarbonSavedKg || 0)} kg`} icon={<Leaf className="h-5 w-5" />} tone="brass" />
        <StatCard label="Listing views" value={formatNumber(totalViews)} icon={<Eye className="h-5 w-5" />} tone="forest" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Recent listings</h2>
            <Link to="/waste/new"><Button size="sm" variant="outline"><PackagePlus className="h-4 w-4" /> New listing</Button></Link>
          </div>

          <div className="mt-4 divide-y divide-ink/[0.06]">
            {listings.length === 0 && (
              <EmptyState
                title="No listings yet"
                description="List your first waste material and let AI find buyers for it."
                action={<Link to="/waste/new"><Button size="sm">List waste</Button></Link>}
              />
            )}
            {listings.slice(0, 6).map((w) => (
              <Link to={`/waste/${w._id}`} key={w._id} className="flex items-center justify-between py-3.5 hover:bg-ink/[0.02]">
                <div>
                  <p className="text-sm font-medium text-ink">{w.wasteName}</p>
                  <p className="text-xs text-ink-faint">{formatNumber(w.quantity)} {w.unit} · {w.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-forest-700">{formatCurrency(w.price)}</span>
                  <Badge tone={w.status === 'active' ? 'forest' : w.status === 'sold' ? 'brass' : 'neutral'}>{w.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brass-500" />
            <h2 className="font-display text-lg font-semibold text-ink">AI suggestions</h2>
          </div>
          <p className="mt-3 text-sm text-ink-faint">
            Open a listing and check its "AI Recommended Buyers" tab to see AI-ranked matches with distance,
            history, and compatibility scoring.
          </p>
          {listings[0] && (
            <Link to={`/waste/${listings[0]._id}`} className="mt-4 block">
              <Button size="sm" variant="outline" className="w-full">View recommendations</Button>
            </Link>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
