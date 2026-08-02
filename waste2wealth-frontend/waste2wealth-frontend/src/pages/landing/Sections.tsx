import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const benefits = [
  { stat: '↓ 40%', label: 'Disposal cost reduction', desc: 'Sell what used to cost you to dump.' },
  { stat: '↑ 3.2×', label: 'Faster buyer discovery', desc: 'AI matching vs. manual broker outreach.' },
  { stat: '100%', label: 'Compliance tracking', desc: 'GST, PCB, and hazardous-waste docs in one place.' },
];

const testimonials = [
  { quote: 'We used to pay a contractor to haul away our cotton scrap. Now a recycler two towns over buys it every week.', name: 'Operations Head', company: 'Textile manufacturer, Tiruppur' },
  { quote: 'The AI price prediction stopped us from underselling our metal turnings for years.', name: 'Plant Manager', company: 'Metal fabrication unit, Coimbatore' },
];

export function Benefits() {
  return (
    <section className="border-b border-ink/[0.06] bg-white py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="eyebrow-tag">Why it works</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built for the economics MSMEs actually face.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.label} className="rounded-2xl border border-ink/[0.06] p-6">
              <p className="font-display text-3xl font-semibold text-forest-600">{b.stat}</p>
              <p className="mt-2 font-medium text-ink">{b.label}</p>
              <p className="mt-1 text-sm text-ink-faint">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="border-b border-ink/[0.06] bg-paper-dim py-24">
      <div className="container-page grid gap-8 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="card-surface p-8"
          >
            <Quote className="h-6 w-6 text-brass-400" />
            <blockquote className="mt-4 font-display text-lg leading-relaxed text-ink">"{t.quote}"</blockquote>
            <figcaption className="mt-5 text-sm text-ink-faint">
              <span className="font-medium text-ink">{t.name}</span> · {t.company}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="bg-forest-600 py-20 text-white">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Your next raw material is someone else's waste bin.
        </h2>
        <p className="max-w-md text-forest-50/85">Join the marketplace built for India's MSMEs. Free to list, AI-matched, compliance-ready.</p>
        <Link to="/signup">
          <Button size="lg" variant="secondary" className="bg-white text-forest-700 hover:bg-forest-50">
            Create your free account <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
