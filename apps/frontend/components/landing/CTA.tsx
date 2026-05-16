import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 md:p-20 text-center reveal">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-5xl md:text-7xl leading-[1] max-w-3xl mx-auto">
            Your next role is <em className="text-primary">one resume away.</em>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-lg mx-auto">
            Free to try. No credit card. Export-ready in under a minute.
          </p>
          <Link href="/signup" className="group mt-10 inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-xl font-medium shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition-transform">
            Generate my resume
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
        <div>&copy; 2026 Resume Matcher. Built for job hunters.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
