import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card-surface p-5', className)} {...props} />;
}

type BadgeTone = 'forest' | 'indigo' | 'brass' | 'red' | 'neutral';

const badgeTones: Record<BadgeTone, string> = {
  forest: 'bg-forest-50 text-forest-700 border-forest-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  brass: 'bg-brass-50 text-brass-700 border-brass-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-ink/[0.04] text-ink-soft border-ink/10',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-forest-600', className)} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />;
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-forest-100 font-display text-sm font-semibold text-forest-700"
    >
      {initials(name || '?')}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-ink/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-ink-faint">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-faint">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
