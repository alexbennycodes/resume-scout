'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60 reveal">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl">Resume Matcher</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[var(--shadow-glow)]">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
