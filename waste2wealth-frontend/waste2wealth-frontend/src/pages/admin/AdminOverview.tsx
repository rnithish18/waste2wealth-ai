import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Receipt, IndianRupee, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, Spinner } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/platform-stats').then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Overview"><div className="flex justify-center py-24"><Spinner /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Platform overview">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={formatNumber(stats?.totalUsers || 0)} icon={<Users className="h-5 w-5" />} tone="forest" />
        <StatCard label="Total listings" value={formatNumber(stats?.totalListings || 0)} icon={<Package className="h-5 w-5" />} tone="indigo" />
        <StatCard label="Completed orders" value={formatNumber(stats?.totalTransactions || 0)} icon={<Receipt className="h-5 w-5" />} tone="brass" />
        <StatCard label="Platform revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={<IndianRupee className="h-5 w-5" />} tone="forest" />
      </div>

      <Card className="mt-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-forest-600" />
          <h2 className="font-display text-lg font-semibold text-ink">Moderation</h2>
        </div>
        <p className="mt-2 text-sm text-ink-faint">
          Review pending waste listings, approve/reject compliance documents, and manage user accounts from the admin panel.
        </p>
        <Link to="/admin" className="mt-4 inline-block">
          <Button size="sm">Open admin panel</Button>
        </Link>
      </Card>
    </DashboardLayout>
  );
}
