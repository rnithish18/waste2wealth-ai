import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PackagePlus, ShoppingBag, Receipt, MessageSquare,
  BarChart3, User as UserIcon, ShieldCheck, Recycle, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const generatorNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/waste/new', label: 'List waste', icon: PackagePlus },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/transactions', label: 'Orders', icon: Receipt },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const buyerNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/transactions', label: 'Orders', icon: Receipt },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin', label: 'Admin panel', icon: ShieldCheck },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/analytics', label: 'Platform analytics', icon: BarChart3 },
];

export function DashboardSidebar() {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? adminNav : user?.role === 'buyer' ? buyerNav : generatorNav;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink/[0.06] bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-ink/[0.06] px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white">
          <Recycle className="h-4.5 w-4.5" />
        </span>
        <span className="font-display text-lg font-semibold text-ink">Waste2Wealth</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/admin'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-forest-50 text-forest-700' : 'text-ink-soft hover:bg-ink/[0.04]'
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink/[0.06] p-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-forest-50 text-forest-700' : 'text-ink-soft hover:bg-ink/[0.04]'
            )
          }
        >
          <UserIcon className="h-4.5 w-4.5" />
          Profile & settings
        </NavLink>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-brass-50 px-3 py-2.5 text-xs text-brass-700">
          <Sparkles className="h-4 w-4 shrink-0" />
          AI recommendations refresh daily based on your listings.
        </div>
      </div>
    </aside>
  );
}
