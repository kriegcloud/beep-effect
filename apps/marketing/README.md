# @beep/marketing

Public-facing marketing website built with Next.js 15 and Tailwind CSS.

## Purpose

This application serves as the marketing landing page and public website for the beep platform. It is a standalone Next.js 15 App Router application that:
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
| Next.js 15 | App Router framework |
| React 19 | UI library |
| Tailwind CSS | Utility-first styling |
| TypeScript | Type safety |
| Geist Fonts | Typography |

## Development

### Running Locally

```bash
# From workspace root
bun run dev --filter @beep/marketing

# Or from this directory
bun run dev
```

The development server will start at [http://localhost:3000](http://localhost:3000).

### Building

```bash
# Type check
bun run --filter @beep/marketing check

# Production build
bun run --filter @beep/marketing build

# Start production server
bun run --filter @beep/marketing start
```

## Project Structure

```
apps/marketing/
├── app/
│   ├── layout.tsx       # Root layout with fonts and metadata
│   ├── page.tsx         # Homepage component
│   └── globals.css      # Global Tailwind styles
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
└── tsconfig.json        # TypeScript configuration
```

## Configuration

### Next.js Config

The application uses a minimal Next.js configuration in `next.config.ts`. Additional configuration options can be added as needed for:
- Image optimization
- Redirects and rewrites
- Environment variables
- Custom webpack settings

### Tailwind CSS

Tailwind is configured via PostCSS with `@tailwindcss/postcss`. The app supports dark mode out of the box using the `dark:` variant.

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
- Consider implementing:
  - SEO metadata and Open Graph tags
  - Analytics integration
  - Contact forms or lead capture
  - Blog or content management system integration
