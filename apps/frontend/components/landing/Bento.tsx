'use client';

import { useEffect, useState } from 'react';
import { Target, Wand2, Languages, FileDown, Clock, ShieldCheck } from 'lucide-react';
import { MeshBackground } from './mesh-background';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`}>
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

const card = 'group relative border border-border/50 bg-card p-6 overflow-hidden';

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
    <MeshBackground className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12 reveal">
          <div className="text-xs font-mono text-primary-foreground/60 uppercase tracking-wider mb-3">/ Features</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1] text-primary-foreground">
            Everything you need to <em className="text-white/90">land the interview.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 border border-border/30 [&>*]:-mt-px [&>*]:-ml-px">
          <LivePreview />
          <ATSCard />
          <SpeedCard />
          <LangCard />
          <ExportCard />
          <PrivacyCard />
        </div>
      </div>
    </MeshBackground>
  );
}
