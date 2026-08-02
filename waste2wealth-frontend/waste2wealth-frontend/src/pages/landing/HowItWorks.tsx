import { motion } from 'framer-motion';
import { ClipboardList, Sparkles, Handshake, Truck } from 'lucide-react';

const steps = [
  { n: '01', title: 'List the material', desc: 'Describe or photograph your waste. Our AI classifies category, hazard level, and recyclability in seconds.', icon: ClipboardList },
  { n: '02', title: 'Get matched', desc: 'The recommendation engine ranks compatible buyers by distance, purchase history, and material fit.', icon: Sparkles },
  { n: '03', title: 'Negotiate & confirm', desc: 'Chat directly with the buyer, agree on price and pickup, and confirm the order on-platform.', icon: Handshake },
  { n: '04', title: 'Ship & track impact', desc: 'Coordinate pickup with route/fuel estimates, then see the CO₂ and landfill impact of every exchange.', icon: Truck },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-ink/[0.06] bg-white py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="eyebrow-tag">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Four steps from dumpster to deal.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative"
            >
              <p className="font-mono text-sm text-brass-500">{step.n}</p>
              <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-faint">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute right-[-1rem] top-4 hidden h-px w-8 bg-ink/10 lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
