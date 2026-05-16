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
