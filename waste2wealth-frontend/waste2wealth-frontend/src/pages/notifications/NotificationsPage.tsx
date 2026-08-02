import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, EmptyState, Spinner } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { timeAgo, cn } from '@/lib/utils';
import type { Notification } from '@/types';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/notifications').then(({ data }) => setNotifications(data.data.notifications)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    load();
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="outline" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" description="You'll see order updates, messages, and AI alerts here." />
      ) : (
        <Card className="divide-y divide-ink/[0.06] p-0">
          {notifications.map((n) => (
            <div key={n._id} className={cn('px-5 py-4', !n.isRead && 'bg-forest-50/50')}>
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="mt-0.5 text-sm text-ink-faint">{n.message}</p>
              <p className="mt-1.5 font-mono text-[11px] text-ink-faint">{timeAgo(n.createdAt)}</p>
            </div>
          ))}
        </Card>
      )}
    </DashboardLayout>
  );
}
