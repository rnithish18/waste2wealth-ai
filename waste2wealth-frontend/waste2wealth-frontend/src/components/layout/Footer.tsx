import { Recycle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-ink/[0.06] bg-forest-950 text-forest-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white">
              <Recycle className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold text-white">Waste2Wealth</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-forest-200/80">
            AI-matched industrial waste exchange. One factory's output is another's raw material.
          </p>
        </div>

        <div>
          <p className="eyebrow-tag text-forest-300">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200/80">
            <li><a href="/marketplace" className="hover:text-white">Marketplace</a></li>
            <li><a href="/#how-it-works" className="hover:text-white">How it works</a></li>
            <li><a href="/#ai-features" className="hover:text-white">AI features</a></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow-tag text-forest-300">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200/80">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">MSME Hackathon</a></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow-tag text-forest-300">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200/80">
            <li><a href="#" className="hover:text-white">Privacy policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center font-mono text-xs text-forest-300/70">
        © {new Date().getFullYear()} Waste2Wealth AI — Built for the circular economy.
      </div>
    </footer>
  );
}
