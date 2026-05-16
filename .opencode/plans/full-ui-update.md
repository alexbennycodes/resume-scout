# Complete UI Update to Sleek-AI-Resume Design System

## Overview
Transform the entire Resume Matcher frontend from Swiss/Brutalist design to the modern, sleek AI design system across all pages, components, and resume templates.

## Execution Plan

### Phase 1: Core UI Components (13 files)
**Order of execution:**
1. Button → Input → Textarea → Label (form primitives)
2. Card → Dialog → Dropdown (containers)
3. Toggle Switch → Retro Tabs → Confirm Dialog (interactive)
4. Rich Text Editor → Rich Text Toolbar → Link Dialog (specialized)

### Phase 2: App Pages (9 files)
**Order:**
1. Login → Signup (simple forms)
2. Dashboard (main app view)
3. Settings (complex forms)
4. Pricing (cards)
5. Builder (complex - 29 sub-components)
6. Tailor (two-column layout)
7. Resume Viewer (display)

### Phase 3: Feature Components (40+ files)
**Grouped by feature:**
1. Dashboard components (2 files)
2. Builder components (29 files)
3. Settings components (2 files)
4. Tailor components (1 file)
5. Enrichment components (4 files)

### Phase 4: Global CSS
- Clean up Swiss tokens
- Add sleek utilities
- Ensure backward compatibility

### Phase 5: Layouts & Resume Templates
1. Default layout
2. Swiss grid component
3. Resume templates (4 files)
4. Print styles (keep functional)

## Design System Reference

### Colors (oklch)
- Background: `oklch(0.99 0.003 250)` - near-white
- Foreground: `oklch(0.18 0.03 260)` - dark blue-gray
- Primary: `oklch(0.58 0.21 260)` - vivid blue
- Card: `oklch(1 0 0)` - pure white
- Muted: `oklch(0.96 0.008 250)` - light gray-blue
- Border: `oklch(0.92 0.008 250)` - subtle border

### Shadows
- Glow: `0 10px 40px -10px var(--glow)`
- Elevated: `0 20px 50px -24px oklch(0.30 0.12 260 / 0.22)`

### Radius
- sm: `calc(var(--radius) - 4px)` ≈ 10px
- md: `calc(var(--radius) - 2px)` ≈ 12px
- lg: `var(--radius)` ≈ 14px
- xl: `calc(var(--radius) + 4px)` ≈ 18px
- 2xl: `calc(var(--radius) + 8px)` ≈ 22px
- 3xl: `calc(var(--radius) + 12px)` ≈ 26px

### Typography
- Display: Instrument Serif (headings)
- Sans: Inter (body)
- Mono: JetBrains Mono (code/labels)

### Animations
- reveal: rise-in 0.6s cubic-bezier(.2,.7,.2,1)
- pop: pop-in 0.4s cubic-bezier(.2,.7,.2,1)
- shimmer: linear infinite 2.2s
- pulse-dot: 1.6s ease-in-out infinite
