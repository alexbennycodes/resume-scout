# Landing Page Update Plan: Match Sleek-AI-Resume Design

## Overview
Transform the current Swiss/Brutalist landing page into the modern, sleek design from sleek-resume-ai with full-featured sections including Nav, Hero, Bento grid, Steps, Pricing, CTA, and Footer.

---

## File Changes Required

### 1. `apps/frontend/app/(default)/css/globals.css`

**Replace entire file with:**

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@source "../../../{app,components,hooks,lib,messages}/**/*.{js,ts,jsx,tsx,mdx}";

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-canvas: #f0f0e8;
  --color-ink: #000000;
  --color-success: #15803d;
  --color-warning: #f97316;

  --color-paper-tint: oklch(96% 0.005 264);
  --color-steel-grey: oklch(64% 0.012 264);
  --color-ink-soft: oklch(38% 0.018 264);

  --shadow-sw-xs: 1px 1px 0px 0px #000000;
  --shadow-sw-sm: 2px 2px 0px 0px #000000;
  --shadow-sw-default: 4px 4px 0px 0px #000000;
  --shadow-sw-card: 6px 6px 0px 0px #000000;
  --shadow-sw-lg: 8px 8px 0px 0px #000000;
  --shadow-sw-xl: 12px 12px 0px 0px #000000;

  --font-sans: 'Geist Sans', sans-serif;
  --font-mono: 'Space Grotesk', monospace;

  --animate-gradient: gradient 8s linear infinite;

  @keyframes gradient {
    to {
      background-position: 200% center;
    }
  }
}

:root {
  --radius: 0.875rem;
  --font-mono: 'Geist Mono', monospace;
  --font-sans: 'Geist', sans-serif;

  --background: oklch(0.99 0.003 250);
  --foreground: oklch(0.18 0.03 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.03 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.03 260);
  --primary: oklch(0.58 0.21 260);
  --primary-foreground: oklch(0.99 0.003 250);
  --secondary: oklch(0.96 0.01 250);
  --secondary-foreground: oklch(0.18 0.03 260);
  --muted: oklch(0.96 0.008 250);
  --muted-foreground: oklch(0.48 0.02 260);
  --accent: oklch(0.94 0.04 255);
  --accent-foreground: oklch(0.30 0.12 260);
  --destructive: oklch(0.63 0.24 27);
  --destructive-foreground: oklch(0.99 0.003 250);
  --border: oklch(0.92 0.008 250);
  --input: oklch(0.94 0.008 250);
  --ring: oklch(0.58 0.21 260);

  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  --sidebar: oklch(1 0 0);
  --sidebar-foreground: oklch(0.18 0.03 260);
  --sidebar-primary: oklch(0.58 0.21 260);
  --sidebar-primary-foreground: oklch(0.99 0.003 250);
  --sidebar-accent: oklch(0.96 0.01 250);
  --sidebar-accent-foreground: oklch(0.18 0.03 260);
  --sidebar-border: oklch(0.92 0.008 250);
  --sidebar-ring: oklch(0.58 0.21 260);

  --surface-elevated: oklch(1 0 0);
  --grid-line: oklch(0.93 0.008 250);
  --glow: oklch(0.58 0.21 260 / 0.30);
  --gradient-hero: radial-gradient(ellipse at top, oklch(0.58 0.21 260 / 0.10), transparent 60%);
  --gradient-card: linear-gradient(135deg, oklch(1 0 0) 0%, oklch(0.98 0.008 250) 100%);
  --shadow-glow: 0 10px 40px -10px var(--glow);
  --shadow-elevated: 0 20px 50px -24px oklch(0.30 0.12 260 / 0.22);
  --font-display: "Instrument Serif", ui-serif, Georgia, serif;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    background-image:
      radial-gradient(circle at 20% -10%, oklch(0.58 0.21 260 / 0.10), transparent 45%),
      radial-gradient(circle at 85% 5%, oklch(0.70 0.16 235 / 0.08), transparent 50%);
  }

  .font-display { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.02em; }
  .font-mono { font-family: var(--font-mono); }

  .grid-bg {
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, transparent, oklch(0.58 0.21 260 / 0.10), transparent);
    background-size: 200% 100%;
    animation: shimmer 2.2s linear infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 0.4; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  .pulse-dot { animation: pulse-dot 1.6s ease-in-out infinite; }

  @keyframes float-y {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .float-y { animation: float-y 4s ease-in-out infinite; }

  @keyframes type-caret {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  .type-caret::after {
    content: "▍";
    margin-left: 2px;
    color: var(--color-primary);
    animation: type-caret 1s steps(1) infinite;
  }
}

@layer utilities {
  @keyframes rise-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pop-in {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  .reveal { animation: rise-in 0.6s cubic-bezier(.2,.7,.2,1) both; }
  .pop { animation: pop-in 0.4s cubic-bezier(.2,.7,.2,1) both; }
  .delay-1 { animation-delay: 80ms; }
  .delay-2 { animation-delay: 160ms; }
  .delay-3 { animation-delay: 240ms; }
  .delay-4 { animation-delay: 320ms; }
  .delay-5 { animation-delay: 400ms; }
  .delay-6 { animation-delay: 480ms; }
}

@media print {
  html, body { background: #ffffff !important; color: #000000 !important; }
  body * { visibility: hidden !important; }
  .no-print { display: none !important; }
  .resume-print, .cover-letter-print, .resume-print *, .cover-letter-print * { visibility: visible !important; }
  .resume-print, .cover-letter-print { width: 100% !important; max-width: 210mm !important; min-height: 0 !important; position: static !important; margin: 0 auto !important; border: none !important; box-shadow: none !important; background: #ffffff !important; }
  .resume-body { box-shadow: none !important; background: #ffffff !important; }
  .resume-scale { transform: none !important; scale: 1 !important; }
  a { color: #000000 !important; text-decoration: none !important; }
}

.resume-body .resume-item { break-inside: avoid; page-break-inside: avoid; }
.resume-body .resume-section-title, .resume-body .resume-section-title-sm { break-after: avoid; page-break-after: avoid; orphans: 3; widows: 3; }
.resume-body .resume-section { break-inside: auto; }
.resume-body .resume-section-title + .resume-items > *:first-child, .resume-body .resume-section-title-sm + .resume-items > *:first-child, .resume-body .resume-section-title + p, .resume-body .resume-section-title-sm + p, .resume-body .resume-section-title + ul, .resume-body .resume-section-title-sm + ul, .resume-body .resume-section-title + .resume-item, .resume-body .resume-section-title-sm + .resume-item { break-before: avoid; page-break-before: avoid; }
.resume-body [data-no-break] { break-inside: avoid; page-break-inside: avoid; }

@media print {
  .resume-body { padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left) !important; }
  .resume-body .resume-section-title, .resume-body .resume-section-title-sm { border-bottom-color: #9ca3af !important; break-after: avoid !important; page-break-after: avoid !important; }
  .resume-body .resume-item { break-inside: avoid !important; page-break-inside: avoid !important; }
  .resume-body .resume-section-title + .resume-items > *:first-child, .resume-body .resume-section-title-sm + .resume-items > *:first-child, .resume-body .resume-section-title + p, .resume-body .resume-section-title-sm + p, .resume-body .resume-section-title + ul, .resume-body .resume-section-title-sm + ul, .resume-body .resume-section-title + .resume-item, .resume-body .resume-section-title-sm + .resume-item { break-before: avoid !important; page-break-before: avoid !important; }
}
```

---

### 2. `apps/frontend/app/layout.tsx`

**Replace with:**

```tsx
import type { Metadata } from 'next';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import './(default)/css/globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Resume Matcher',
  description: 'Build your resume with Resume Matcher',
  applicationName: 'Resume Matcher',
  keywords: ['resume', 'matcher', 'job', 'application'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className="h-full" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
```

---

### 3. Create `apps/frontend/components/landing/Nav.tsx`

```tsx
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
```

---

### 4. Update `apps/frontend/components/home/hero.tsx`

**Replace with:**

```tsx
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
```

---

### 5. Create `apps/frontend/components/landing/Bento.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Target, Wand2, Languages, FileDown, Clock, ShieldCheck } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`}>
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

const card = 'group relative border border-border bg-card p-6 overflow-hidden transition-colors duration-300 hover:bg-accent/30 hover:z-10';

function LivePreview() {
  const [tab, setTab] = useState<'draft' | 'ai'>('ai');
  return (
    <div className={`${card} lg:col-span-2 lg:row-span-2 min-h-[420px] flex flex-col reveal`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live AI rewrite</span>
        </div>
        <div className="flex p-0.5 rounded-lg bg-muted text-xs font-mono">
          {(['draft', 'ai'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md transition-all ${
                tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'draft' ? 'Your draft' : 'AI polished'}
            </button>
          ))}
        </div>
      </div>

      <h3 className="font-display text-3xl mb-1">From rough notes to recruiter-ready.</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Toggle between your raw input and AI-polished bullets. No re-prompting needed.
      </p>

      <div className="flex-1 rounded-xl border border-border bg-background p-5 font-mono text-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="text-muted-foreground">Senior Product Engineer · Stripe</span>
        </div>

        <div key={tab} className="space-y-2 pop">
          {tab === 'draft' ? (
            <>
              <p className="text-muted-foreground">• worked on checkout flow</p>
              <p className="text-muted-foreground">• fixed bugs and made it faster</p>
              <p className="text-muted-foreground">• helped onboard new devs</p>
            </>
          ) : (
            <>
              <p className="text-foreground">• Rebuilt checkout flow, lifting conversion 14% across 3M+ monthly sessions.</p>
              <p className="text-foreground">• Reduced P95 latency 220ms → 90ms by parallelising tokenisation calls.</p>
              <p className="text-foreground">• Mentored 5 engineers; authored onboarding handbook used company-wide.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ATSCard() {
  const score = 94;
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setV(score), 250);
    return () => clearTimeout(id);
  }, []);
  const c = 2 * Math.PI * 36;
  return (
    <div className={`${card} min-h-[200px] reveal delay-1`}>
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">ATS score</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="var(--color-muted)" strokeWidth="6" fill="none" />
            <circle
              cx="40" cy="40" r="36" stroke="var(--color-primary)" strokeWidth="6" fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (v / 100) * c}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-3xl">{v}</div>
        </div>
        <div className="text-sm text-muted-foreground">
          Optimised for Workday, Greenhouse & Lever parsers.
        </div>
      </div>
    </div>
  );
}

function SpeedCard() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1400, 1);
      setT(Math.round(p * 28));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={`${card} min-h-[200px] reveal delay-2`}>
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Avg. generation</span>
      </div>
      <div className="font-display text-6xl text-primary leading-none mb-2">
        {t}<span className="text-muted-foreground text-2xl">s</span>
      </div>
      <p className="text-sm text-muted-foreground">From paste to polished PDF — faster than your coffee.</p>
    </div>
  );
}

function LangCard() {
  const langs = ['EN', 'ES', 'FR', 'DE', 'JP', 'PT', 'IT', 'NL', 'ZH', 'AR'];
  return (
    <div className={`${card} min-h-[200px] reveal delay-3`}>
      <div className="flex items-center gap-2 mb-5">
        <Languages className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">28 languages</span>
      </div>
      <h3 className="font-display text-2xl mb-4">Apply in any market.</h3>
      <div className="flex flex-wrap gap-1.5">
        {langs.map((l) => (
          <span
            key={l}
            className="text-[11px] font-mono px-2 py-1 rounded-md bg-muted text-muted-foreground cursor-default transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExportCard() {
  const files = [
    { name: 'resume.pdf', size: '84 KB' },
    { name: 'resume.docx', size: '42 KB' },
    { name: 'you.dev', size: 'Live' },
  ];
  return (
    <div className={`${card} min-h-[200px] reveal delay-4`}>
      <div className="flex items-center gap-2 mb-5">
        <FileDown className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Export anywhere</span>
      </div>
      <div className="space-y-2">
        {files.map((f) => (
          <div
            key={f.name}
            className="group/file flex items-center justify-between text-xs font-mono px-3 py-2.5 rounded-lg bg-muted hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <span className="text-foreground">{f.name}</span>
            <span className="text-muted-foreground group-hover/file:text-primary transition-colors">{f.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyCard() {
  return (
    <div className={`${card} min-h-[200px] reveal delay-5`}>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Private by default</span>
        </div>
        <h3 className="font-display text-2xl mb-2">Never trained on.</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drafts are encrypted at rest and auto-deleted after 30 days. SOC 2 Type II compliant.
        </p>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-5/6" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
    </div>
  );
}

export default function Bento() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-12 reveal">
        <div className="text-xs font-mono text-primary uppercase tracking-wider mb-3">/ Features</div>
        <h2 className="font-display text-5xl md:text-6xl leading-[1]">
          Everything you need to <em>land the interview.</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 border border-border [&>*]:-mt-px [&>*]:-ml-px">
        <LivePreview />
        <ATSCard />
        <SpeedCard />
        <LangCard />
        <ExportCard />
        <PrivacyCard />
      </div>
    </section>
  );
}
```

---

### 6. Create `apps/frontend/components/landing/Steps.tsx`

```tsx
const steps = [
  { n: '01', title: 'Paste your story', body: 'Drop in past roles, LinkedIn, or a rough brain-dump. No formatting required.' },
  { n: '02', title: 'Add the job post', body: 'AI extracts keywords, tone, and seniority signals from the listing.' },
  { n: '03', title: 'Download & apply', body: 'Get a polished, ATS-optimized PDF ready to submit — or share a live link.' },
];

export default function Steps() {
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-24 border-t border-border">
      <div className="grid md:grid-cols-3 gap-12">
        <div className="reveal">
          <div className="text-xs font-mono text-primary uppercase tracking-wider mb-3">/ How it works</div>
          <h2 className="font-display text-5xl leading-[1]">Three steps. Zero formatting.</h2>
        </div>
        <div className="md:col-span-2 space-y-2">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`group flex gap-6 items-start py-6 border-b border-border hover:bg-accent/50 transition-colors px-4 -mx-4 rounded-lg reveal delay-${i + 1}`}
            >
              <div className="font-mono text-xs text-primary mt-1">{s.n}</div>
              <div className="flex-1">
                <h3 className="font-display text-2xl mb-1 group-hover:translate-x-1 transition-transform">{s.title}</h3>
                <p className="text-muted-foreground text-sm max-w-md">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 7. Create `apps/frontend/components/landing/Pricing.tsx`

```tsx
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: '0',
    cadence: 'forever',
    blurb: 'Try the AI rewrite — no card needed.',
    features: ['1 resume', '3 AI rewrites / month', 'PDF export', 'Basic ATS score'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '12',
    cadence: 'per month',
    blurb: 'For active job seekers running multiple applications.',
    features: [
      'Unlimited resumes',
      'Unlimited AI rewrites',
      'PDF · DOCX · web export',
      'Advanced ATS scoring',
      'Job-post tailoring',
      'AI-written cover letters',
    ],
    cta: 'Go Pro',
    featured: true,
  },
  {
    name: 'Team',
    price: '29',
    cadence: 'per seat / mo',
    blurb: 'For career coaches and recruiting agencies.',
    features: [
      'Everything in Pro',
      'Shared template library',
      'Brand kit & co-branding',
      'Client workspaces',
      'Priority support',
    ],
    cta: 'Contact sales',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative max-w-7xl mx-auto px-6 py-28 border-t border-border">
      <div className="text-center mb-16 reveal">
        <div className="text-xs font-mono text-primary uppercase tracking-wider mb-3">/ Pricing</div>
        <h2 className="font-display text-5xl md:text-6xl leading-[1]">
          Simple pricing. <em>Hire-worthy results.</em>
        </h2>
        <p className="mt-5 text-muted-foreground max-w-md mx-auto">
          Start free. Upgrade only when you&apos;re ready to apply everywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {tiers.map((t, i) => (
          <div
            key={t.name}
            className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 reveal delay-${i + 1} ${
              t.featured
                ? 'bg-foreground text-background border border-foreground shadow-[var(--shadow-elevated)] lg:-translate-y-3'
                : 'bg-card border border-border hover:-translate-y-1 hover:border-primary/40'
            }`}
          >
            {t.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-primary-foreground bg-primary px-3 py-1 rounded-full shadow-[var(--shadow-glow)]">
                <Sparkles className="w-3 h-3" />
                Most popular
              </div>
            )}

            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-display text-3xl ${t.featured ? 'text-background' : ''}`}>{t.name}</h3>
            </div>
            <p className={`text-sm mb-7 ${t.featured ? 'text-background/60' : 'text-muted-foreground'}`}>
              {t.blurb}
            </p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className={`text-2xl font-display ${t.featured ? 'text-background/60' : 'text-muted-foreground'}`}>$</span>
              <span className={`font-display text-6xl leading-none ${t.featured ? 'text-primary' : 'text-foreground'}`}>{t.price}</span>
              <span className={`text-sm ml-2 ${t.featured ? 'text-background/60' : 'text-muted-foreground'}`}>{t.cadence}</span>
            </div>

            <div className={`h-px w-full mb-7 ${t.featured ? 'bg-background/15' : 'bg-border'}`} />

            <ul className="space-y-3.5 mb-10 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      t.featured ? 'bg-primary/20' : 'bg-primary/10'
                    }`}
                  >
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                  <span className={t.featured ? 'text-background/90' : 'text-foreground'}>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={t.featured ? '/signup' : '#'}
              className={`w-full py-3.5 rounded-xl font-medium transition-all text-center ${
                t.featured
                  ? 'bg-primary text-primary-foreground hover:-translate-y-0.5 shadow-[var(--shadow-glow)]'
                  : 'border border-border bg-background hover:bg-accent text-foreground hover:-translate-y-0.5'
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs font-mono text-muted-foreground mt-10">
        Cancel anytime · 14-day money-back guarantee · No hidden fees
      </p>
    </section>
  );
}
```

---

### 8. Create `apps/frontend/components/landing/CTA.tsx`

```tsx
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
```

---

### 9. Update `apps/frontend/app/(default)/page.tsx`

**Replace with:**

```tsx
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
```

---

## Summary of Changes

**Design System Transformation:**
- **Colors**: From warm canvas (#f0f0e8) to near-white oklch with blue gradients
- **Typography**: Added Instrument Serif (display), Inter (sans), JetBrains Mono
- **Shadows**: From hard offset shadows to soft glow shadows
- **Corners**: From sharp (rounded-none) to rounded (0.875rem base)
- **Animations**: Added reveal, pop, shimmer, pulse-dot, float-y animations

**New Sections Added:**
1. Sticky navigation bar with logo and links
2. Enhanced hero with version badge, stats, and dual CTAs
3. 6-card bento feature grid with interactive elements
4. 3-step "How it works" section
5. 3-tier pricing cards (Free, Pro, Team)
6. Final CTA with glow effect
7. Footer with copyright and links

All components use existing `lucide-react` icons already in package.json dependencies.
