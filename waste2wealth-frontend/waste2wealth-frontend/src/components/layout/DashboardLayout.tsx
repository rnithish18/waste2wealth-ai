import { ReactNode, useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Avatar } from '@/components/ui/Primitives';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <DashboardSidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 bg-white">
            <DashboardSidebar />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink/[0.06] bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="p-1.5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden h-6 w-px bg-ink/10 sm:block" />
            <NavLink to="/profile" className="hidden items-center gap-2 sm:flex">
              <Avatar name={user?.companyName || ''} src={user?.avatar} size={32} />
              <span className={cn('text-sm font-medium text-ink')}>{user?.companyName}</span>
            </NavLink>
            <button onClick={handleLogout} className="rounded-lg p-2 text-ink-soft hover:bg-ink/[0.04]" aria-label="Log out">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
