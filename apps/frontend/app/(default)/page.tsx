import Nav from '@/components/landing/Nav';
import Hero from '@/components/home/hero';
import Bento from '@/components/landing/Bento';
import Steps from '@/components/landing/Steps';
import Pricing from '@/components/landing/Pricing';
import { CTA, Footer } from '@/components/landing/CTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Bento />
        <Steps />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
