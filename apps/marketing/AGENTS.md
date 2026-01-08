# AGENTS — apps/marketing

## Purpose & Fit
- Simple Next.js marketing site for public-facing content, landing pages, and product information
- Minimal dependencies focused on Next.js, React, and Tailwind CSS
- Separate from the main web app to keep marketing content isolated and independently deployable
- No Effect runtime or complex state management - pure Next.js App Router with Tailwind

## Surface Map
- `app/` — Next.js App Router pages and layouts
- `public/` — Static assets (images, fonts, etc.)
- `next.config.ts` — Next.js configuration
- `postcss.config.mjs` — PostCSS configuration for Tailwind
- `tsconfig.json` — TypeScript configuration

## Technology Stack
- **Framework**: Next.js 15 App Router
- **UI**: React 19, Tailwind CSS
- **Build**: TypeScript, PostCSS

## Usage Snapshots
- Marketing landing pages
- Product feature pages
- Pricing information
- Public documentation
- SEO-optimized content pages

## Authoring Guardrails
- NEVER add npm dependencies without approval
- ALWAYS use Next.js App Router conventions for pages and layouts
- ALWAYS leverage Tailwind CSS for styling - no component libraries needed
- ALWAYS optimize images before committing
- ALWAYS optimize for performance and SEO (static generation, image optimization)
- NEVER include backend logic - this is purely frontend/static content

## Development Workflow
- `bun run dev --filter @beep/marketing` — Start development server
- `bun run build --filter @beep/marketing` — Build for production
- `bun run start --filter @beep/marketing` — Start production server

## Verifications
- `bun run check --filter @beep/marketing` — TypeScript type checking
- `bun run lint --filter @beep/marketing` — Lint checks (if configured)
- `bun run build --filter @beep/marketing` — Ensure production build succeeds

## Testing

ALWAYS verify:
- Build succeeds: `bun run build --filter=@beep/marketing`
- Links work: Check internal links resolve
- Images load: Verify all images have valid paths
- Meta tags: Confirm SEO meta tags render

No unit tests required for static content pages.

## Contributor Checklist
- [ ] Keep marketing content separate from main app functionality
- [ ] Optimize images using Next.js Image component
- [ ] Use static generation where possible for better performance
- [ ] Maintain simple, clean code without complex dependencies
- [ ] Test responsive design across devices
- [ ] Ensure proper SEO metadata (titles, descriptions, Open Graph tags)
