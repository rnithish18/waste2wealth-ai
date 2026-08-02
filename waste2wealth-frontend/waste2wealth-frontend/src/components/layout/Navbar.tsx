import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#ai-features', label: 'AI features' },
  { to: '/marketplace', label: 'Marketplace' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white">
            <Recycle className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Waste<span className="text-brass-500">2</span>Wealth
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-ink-soft transition-colors hover:text-forest-700">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-forest-700">
                Log in
              </Link>
              <Link to="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/[0.06] bg-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a key={l.to} href={l.to} className="text-sm font-medium text-ink-soft" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <Link to="/dashboard"><Button className="w-full">Go to dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login"><Button variant="outline" className="w-full">Log in</Button></Link>
                  <Link to="/signup"><Button className="w-full">Get started</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
