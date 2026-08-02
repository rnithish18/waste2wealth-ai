import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Badge, EmptyState, Spinner } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import type { User, WasteListing } from '@/types';

type Tab = 'users' | 'listings' | 'compliance';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('listings');

  return (
    <DashboardLayout title="Admin panel">
      <div className="mb-6 flex gap-1 rounded-xl bg-ink/[0.04] p-1">
        {(['listings', 'users', 'compliance'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-white text-forest-700 shadow-sm' : 'text-ink-faint hover:text-ink'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'listings' && <ListingsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'compliance' && <ComplianceTab />}
    </DashboardLayout>
  );
}

function ListingsTab() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/waste?status=pending_review').then(({ data }) => setListings(data.data.waste)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const decide = async (id: string, status: 'active' | 'rejected') => {
    setError('');
    try {
      await api.patch(`/admin/waste/${id}/approve`, { status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;

  return listings.length === 0 ? (
    <EmptyState title="No listings pending review" description="New submissions awaiting approval will show up here." />
  ) : (
    <div className="space-y-3">
      {listings.map((w) => (
        <Card key={w._id} className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">{w.wasteName}</p>
            <p className="text-xs text-ink-faint">{w.category} · {w.quantity} {w.unit} · {typeof w.user === 'object' ? w.user.companyName : ''}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => decide(w._id, 'rejected')}>Reject</Button>
            <Button size="sm" onClick={() => decide(w._id, 'active')}>Approve</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(({ data }) => setUsers(data.data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/users/${id}/status`, { isActive: !isActive });
    load();
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="border-b border-ink/[0.06] text-left text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-5 py-3">Company</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Joined</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.06]">
          {users.map((u) => (
            <tr key={u._id}>
              <td className="px-5 py-3 font-medium text-ink">{u.companyName}<p className="text-xs font-normal text-ink-faint">{u.email}</p></td>
              <td className="px-5 py-3 capitalize"><Badge tone="indigo">{u.role}</Badge></td>
              <td className="px-5 py-3 text-ink-faint">{formatDate(u.createdAt)}</td>
              <td className="px-5 py-3">
                <Badge tone={(u as any).isActive === false ? 'red' : 'forest'}>{(u as any).isActive === false ? 'Deactivated' : 'Active'}</Badge>
              </td>
              <td className="px-5 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => toggleActive(u._id, (u as any).isActive !== false)}>
                  {(u as any).isActive === false ? 'Reactivate' : 'Deactivate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ComplianceTab() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/compliance-documents?status=pending').then(({ data }) => setDocs(data.data.documents)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    await api.patch(`/admin/compliance-documents/${id}`, { status });
    load();
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return docs.length === 0 ? (
    <EmptyState title="No documents pending review" description="Compliance uploads (GST, PCB licenses, hazardous waste authorizations) will appear here." />
  ) : (
    <div className="space-y-3">
      {docs.map((d) => (
        <Card key={d._id} className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">{d.documentType.replace(/_/g, ' ')}</p>
            <p className="text-xs text-ink-faint">{d.user?.companyName} · {d.documentNumber || 'No number provided'}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => review(d._id, 'rejected')}>Reject</Button>
            <Button size="sm" onClick={() => review(d._id, 'approved')}>Approve</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
