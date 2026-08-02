import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Recycle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600 text-white">
        <Recycle className="h-7 w-7" />
      </span>
      <p className="font-mono text-sm text-ink-faint">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink">This page isn't in the exchange.</h1>
      <p className="max-w-sm text-sm text-ink-faint">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/"><Button className="mt-2">Back to home</Button></Link>
    </div>
  );
}
