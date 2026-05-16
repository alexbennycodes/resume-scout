'use client';

import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/70 backdrop-blur text-xs font-mono text-muted-foreground mb-8 reveal">
          <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          v2.0 — Now with ATS scoring
        </div>

        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] max-w-5xl reveal delay-1">
          The resume that <em className="text-primary">writes itself</em>,
          <br />
          tailored to every role.
        </h1>

        <p className="mt-8 text-lg text-muted-foreground max-w-xl reveal delay-2">
          Drop your experience, paste a job post, and watch AI craft a recruiter-ready
          resume in under 30 seconds — formatted, optimized, and ATS-proof.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4 reveal delay-3">
          <Link href="/signup" className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-medium shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition-transform">
            Generate my resume
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
            <Zap className="w-4 h-4 text-primary" />
            See a live demo
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-8 text-xs font-mono text-muted-foreground reveal delay-4">
          <div>
            <div className="text-2xl font-display text-foreground">2.4M+</div>
            resumes generated
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="text-2xl font-display text-foreground">94%</div>
            interview rate
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="text-2xl font-display text-foreground">28s</div>
            avg. generation
          </div>
        </div>
      </div>
    </section>
  );
}
