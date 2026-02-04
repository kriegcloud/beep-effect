---
path: apps/marketing
summary: Static Next.js marketing site - landing pages, SEO content, Tailwind styling
tags: [app, nextjs, static, marketing, tailwind, seo]
---

# @beep/marketing

Minimal Next.js marketing site for public-facing content. No Effect runtime - pure static site with Tailwind CSS.

## Architecture

```
|----------------|     |----------------|
|   Next.js 16   | --> |  Static Pages  |
|  App Router    |     |  (SSG/ISR)     |
|----------------|     |----------------|
        |
        v
|----------------|
|  Tailwind CSS  |
|   Styling      |
|----------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `app/layout.tsx` | Root layout with Geist fonts |
| `app/page.tsx` | Landing page |
| `next.config.ts` | Next.js configuration |
| `postcss.config.mjs` | Tailwind PostCSS setup |

## Usage Patterns

### Static Page Creation

```tsx
// app/features/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - Beep",
  description: "Explore Beep platform features",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <h1 className="text-3xl font-semibold">Features</h1>
    </main>
  );
}
```

### Image Optimization

```tsx
import Image from "next/image";

<Image
  src="/logo.svg"
  alt="Logo"
  width={100}
  height={20}
  priority  // Use for above-fold images
/>
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| No Effect runtime | Simplicity for static marketing content |
| Tailwind-only styling | No component library overhead |
| Separate from @beep/web | Independent deployment, isolated concerns |
| Static generation | Performance, SEO, CDN caching |

## Dependencies

**Internal**: None (intentionally isolated)

**External**: `next`, `react`, `react-dom`, `tailwindcss`

## Related

- **AGENTS.md** - Detailed contributor guidance
- **apps/web** - Main application (separate deployment)
