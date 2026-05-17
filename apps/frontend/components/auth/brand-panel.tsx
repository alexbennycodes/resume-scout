'use client';

import Link from 'next/link';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { MeshBackground } from '@/components/landing/mesh-background';

interface BrandPanelProps {
  headline: React.ReactNode;
  subheadline: string;
  benefits: string[];
}

export function BrandPanel({ headline, subheadline, benefits }: BrandPanelProps) {
  return (
    <MeshBackground className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
      {/* Content */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl">Resume Matcher</span>
        </Link>
      </div>

      <div className="relative z-10 space-y-8">
        <div>
          <h1 className="font-display text-4xl xl:text-5xl text-primary-foreground leading-tight">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">{subheadline}</p>
        </div>

        <ul className="space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-primary-foreground/80">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground/60 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 text-sm text-primary-foreground/50">
        Free to try. No credit card required.
      </div>
    </MeshBackground>
  );
}
