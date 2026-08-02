import { Link } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white">
            <Recycle className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">Waste2Wealth</span>
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-faint">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-forest-950 lg:block">
        <div className="absolute inset-0 bg-loop-gradient opacity-20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end p-12 text-forest-50">
          <p className="eyebrow-tag text-brass-400">Circular economy, ledger-simple</p>
          <p className="mt-3 max-w-sm font-display text-2xl leading-snug">
            "The AI price prediction stopped us from underselling our metal turnings for years."
          </p>
          <p className="mt-3 text-sm text-forest-300">Plant Manager, Metal fabrication unit</p>
        </div>
      </div>
    </div>
  );
}
