'use client';

interface MeshBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function MeshBackground({ children, className = '' }: MeshBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base mesh gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 15% 15%, oklch(0.60 0.20 255) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 20%, oklch(0.55 0.22 240) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 85%, oklch(0.48 0.24 275) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 75%, oklch(0.52 0.18 230) 0%, transparent 45%),
            oklch(0.38 0.16 265)
          `,
        }}
      />

      {/* Animated overlay blobs */}
      <div
        className="absolute inset-0 mesh-drift"
        style={{
          background: `
            radial-gradient(circle at 25% 40%, oklch(0.65 0.18 235 / 0.40), transparent 45%),
            radial-gradient(circle at 75% 25%, oklch(0.58 0.22 270 / 0.35), transparent 50%)
          `,
        }}
      />

      {/* Second animated blob layer */}
      <div
        className="absolute inset-0 mesh-drift-reverse"
        style={{
          background: `
            radial-gradient(circle at 60% 60%, oklch(0.50 0.20 260 / 0.30), transparent 40%),
            radial-gradient(circle at 30% 70%, oklch(0.62 0.16 245 / 0.25), transparent 45%)
          `,
        }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <filter id="mesh-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#mesh-noise)" fill="white" />
        </svg>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-[0.06]" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
