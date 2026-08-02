import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Badge, EmptyState, Spinner } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { Transaction } from '@/types';

const statusTone: Record<string, 'forest' | 'indigo' | 'brass' | 'red' | 'neutral'> = {
  pending: 'neutral', confirmed: 'indigo', in_transit: 'indigo',
  delivered: 'brass', completed: 'forest', cancelled: 'red', disputed: 'red',
};

const nextStatusOptions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_transit', 'cancelled'],
  in_transit: ['delivered'],
  delivered: ['completed'],
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/transactions').then(({ data }) => setTransactions(data.data.transactions)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    setError('');
    try {
      await api.patch(`/transactions/${id}/status`, { status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout title="Orders">
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : transactions.length === 0 ? (
        <EmptyState title="No orders yet" description={user?.role === 'buyer' ? 'Orders you place will show up here.' : 'Orders placed against your listings will show up here.'} action={<Link to="/marketplace"><Button size="sm">Browse marketplace</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => {
            const wasteName = typeof t.waste === 'object' ? t.waste.wasteName : 'Listing';
            const counterparty = user?.role === 'buyer'
              ? (typeof t.seller === 'object' ? t.seller.companyName : 'Seller')
              : (typeof t.buyer === 'object' ? t.buyer.companyName : 'Buyer');

            return (
              <Card key={t._id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{wasteName}</p>
                  <p className="text-xs text-ink-faint">
                    {t.quantity} {t.unit} · with {counterparty} · {formatDate(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-base font-semibold text-forest-700">{formatCurrency(t.totalAmount)}</span>
                  <Badge tone={statusTone[t.status] || 'neutral'}>{t.status.replace('_', ' ')}</Badge>
                  {nextStatusOptions[t.status]?.map((next) => (
                    <Button key={next} size="sm" variant="outline" isLoading={updating === t._id} onClick={() => updateStatus(t._id, next)}>
                      Mark {next.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
