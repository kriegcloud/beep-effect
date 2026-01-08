# @beep/marketing

Public-facing marketing website built with Next.js 16 and Tailwind CSS.

## Purpose

This application serves as the marketing landing page and public website for the beep platform. It is a standalone Next.js 16 App Router application that:
- Provides product information and marketing content
- Handles public landing pages and promotional materials
- Operates independently from the main authenticated application
- Uses Tailwind CSS for styling with dark mode support

This app is currently a minimal Next.js template and does not integrate with Effect or other `@beep/*` packages. It serves as a traditional React application separate from the Effect-based backend.

## Installation

```bash
# This package is internal to the monorepo
# Dependencies are managed at the workspace root
bun install
```

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | App Router framework |
| React 19 | UI library |
| Tailwind CSS | Utility-first styling |
| TypeScript | Type safety |
| Geist Fonts | Typography |

## Development

```bash
# Run development server
bun run dev --filter @beep/marketing

# Production build
bun run --filter @beep/marketing build

# Start production server
bun run --filter @beep/marketing start

# Type check (from workspace root)
bun run check

# Lint (from workspace root)
bun run lint
```

The development server will start at [http://localhost:3000](http://localhost:3000).

**Note**: The marketing app's `package.json` defines only `dev`, `build`, and `start` scripts. Type checking and linting should be run from the workspace root.

## Project Structure

```
apps/marketing/
├── app/
│   ├── layout.tsx       # Root layout with Geist fonts and metadata
│   ├── page.tsx         # Homepage component
│   ├── globals.css      # Tailwind v4 styles with @theme inline config
│   └── favicon.ico      # App icon
├── public/              # Static assets (Next.js SVG placeholders)
├── next.config.ts       # Next.js configuration (minimal)
├── postcss.config.mjs   # PostCSS with @tailwindcss/postcss
├── tsconfig.json        # TypeScript configuration (extends workspace)
└── tsconfig.build.json  # Build-specific TypeScript config
```

## Configuration

### Next.js Config

The application uses a minimal Next.js configuration in `next.config.ts`. Additional configuration options can be added as needed for:
- Image optimization
- Redirects and rewrites
- Environment variables
- Custom webpack settings

### TypeScript

The app extends the workspace's `tsconfig.base.jsonc` and defines a path alias:
```typescript
"@beep/marketing/*": ["./src/*"]
```

However, note that the current source files are in the `app/` directory, not `src/`. This path alias is configured but currently unused.

### Tailwind CSS

Tailwind is configured via PostCSS with `@tailwindcss/postcss` (v4.x). The configuration uses the modern inline `@theme` directive in `app/globals.css` rather than a separate `tailwind.config.ts` file.

Dark mode is implemented using system preferences via `@media (prefers-color-scheme: dark)`, automatically adapting to the user's OS settings.

## Dependencies

This application currently has no dependencies on other `@beep/*` packages. It operates as a standalone marketing site.

Future integration points may include:
- `@beep/ui` for shared component library
- `@beep/constants` for shared brand assets and constants
- `@beep/runtime-client` if interactive features require Effect

## Deployment

The marketing site can be deployed as a standard Next.js application. Deployment options include:
- Vercel (optimized for Next.js)
- Docker containers
- Static export (if applicable)

Deployment configuration should be coordinated with the overall beep platform infrastructure.

## Notes

- This app is intentionally separate from the Effect-based architecture to keep the marketing site simple and performant
- No authentication or backend integration is currently implemented
- The homepage contains placeholder content from the Next.js template and should be replaced with actual marketing content
- The metadata in `app/layout.tsx` still uses Next.js defaults (`"Create Next App"` title and description) and should be updated with beep branding
- Consider implementing:
  - Custom SEO metadata and Open Graph tags
  - Analytics integration (Google Analytics, Plausible, etc.)
  - Contact forms or lead capture
  - Blog or content management system integration
  - Proper branding (logo, color scheme, typography)
  - Performance optimizations (image optimization, lazy loading)
