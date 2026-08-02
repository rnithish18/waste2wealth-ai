import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/[0.06]">
      <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="eyebrow-tag">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
            Material flow — live matching
          </span>

          <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            One factory's waste is <span className="text-forest-600">another's raw material.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            Waste2Wealth AI reads what your plant discards, finds the industries that need exactly that
            material, and prices, matches, and routes the exchange automatically — before it ever reaches a landfill.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/signup">
              <Button size="lg">
                List your waste <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline">
                Browse marketplace
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-8 font-mono text-xs text-ink-faint">
            <div>
              <p className="text-xl font-semibold text-ink">12,400+</p>
              <p>tonnes diverted</p>
            </div>
            <div className="h-8 w-px bg-ink/10" />
            <div>
              <p className="text-xl font-semibold text-ink">3,100+</p>
              <p>MSMEs matched</p>
            </div>
            <div className="h-8 w-px bg-ink/10" />
            <div>
              <p className="text-xl font-semibold text-ink">₹8.6Cr</p>
              <p>waste value recovered</p>
            </div>
          </div>
        </motion.div>

        {/* Signature element: a rotating material-loop dial showing waste -> match -> wealth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center"
        >
          <div className="absolute inset-0 animate-spin-slow rounded-full bg-loop-gradient opacity-15 blur-2xl" />
          <div className="absolute inset-6 rounded-full border border-dashed border-ink/15" />
          <div className="absolute inset-16 rounded-full border border-ink/10" />

          <div className="relative flex h-full w-full items-center justify-center">
            <div className="absolute left-2 top-1/3 flex flex-col items-center gap-2 rounded-2xl border border-ink/[0.06] bg-white px-4 py-3 shadow-soft">
              <Factory className="h-5 w-5 text-indigo-600" />
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">Generator</p>
              <p className="font-display text-sm font-semibold text-ink">Textile scrap</p>
            </div>

            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-forest-600 text-white shadow-soft">
              <Recycle className="h-10 w-10" />
            </div>

            <div className="absolute bottom-4 right-0 flex flex-col items-center gap-2 rounded-2xl border border-ink/[0.06] bg-white px-4 py-3 shadow-soft">
              <Factory className="h-5 w-5 text-brass-500" />
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">Buyer</p>
              <p className="font-display text-sm font-semibold text-ink">Recycled fiber mill</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
