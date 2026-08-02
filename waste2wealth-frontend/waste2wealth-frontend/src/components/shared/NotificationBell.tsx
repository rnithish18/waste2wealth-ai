import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/lib/socket';
import { timeAgo, cn } from '@/lib/utils';
import type { Notification } from '@/types';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(({ data }) => {
      setNotifications(data.data.notifications);
      setUnreadCount(data.unreadCount);
    }).catch(() => {});

    const socket = getSocket(user._id);
    const handler = (n: Notification) => {
      setNotifications((prev) => [n, ...prev].slice(0, 20));
      setUnreadCount((c) => c + 1);
    };
    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [user]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-ink-soft hover:bg-ink/[0.04]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brass-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-ink/[0.06] bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/[0.06] px-4 py-3">
            <p className="font-display text-sm font-semibold">Notifications</p>
            <button onClick={markAllRead} className="text-xs font-medium text-forest-700 hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-faint">You're all caught up.</p>
            )}
            {notifications.map((n) => (
              <div key={n._id} className={cn('border-b border-ink/[0.04] px-4 py-3 last:border-0', !n.isRead && 'bg-forest-50/50')}>
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{n.message}</p>
                <p className="mt-1 font-mono text-[10px] text-ink-faint">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>
          <Link to="/notifications" className="block border-t border-ink/[0.06] px-4 py-2.5 text-center text-xs font-medium text-forest-700 hover:bg-ink/[0.02]">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
