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
              href={t.featured ? '/signup' : '/signup'}
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
