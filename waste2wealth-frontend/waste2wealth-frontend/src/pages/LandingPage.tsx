import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from './landing/Hero';
import { HowItWorks } from './landing/HowItWorks';
import { AIFeatures } from './landing/AIFeatures';
import { Benefits, Testimonials, CTA } from './landing/Sections';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Hero />
      <HowItWorks />
      <AIFeatures />
      <Benefits />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
