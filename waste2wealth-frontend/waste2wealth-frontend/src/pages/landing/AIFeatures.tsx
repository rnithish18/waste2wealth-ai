import { motion } from 'framer-motion';
import { ScanEye, Target, TrendingUp, LineChart, Leaf, Route } from 'lucide-react';

const features = [
  { title: 'Smart classification', desc: 'Upload a photo or description — AI predicts category, recyclability, and hazard level instantly.', icon: ScanEye },
  { title: 'Buyer recommendation', desc: 'Ranks buyers by distance, order history, material compatibility, and budget fit.', icon: Target },
  { title: 'Price prediction', desc: 'Fair market pricing grounded in live comparable listings, not guesswork.', icon: TrendingUp },
  { title: 'Waste forecasting', desc: 'Projects your next months of waste generation from historical listing trends.', icon: LineChart },
  { title: 'Carbon calculator', desc: 'Every listing shows CO₂ saved, trees-equivalent, and landfill diverted.', icon: Leaf },
  { title: 'Transport optimization', desc: 'Estimates distance, fuel, and emissions for the pickup route before you commit.', icon: Route },
];

export function AIFeatures() {
  return (
    <section id="ai-features" className="border-b border-ink/[0.06] bg-forest-950 py-24 text-forest-50">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="eyebrow-tag text-brass-400">AI features</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The matching engine doing the heavy lifting.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brass-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-200/75">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
