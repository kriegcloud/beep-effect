# @beep/build-utils

Next.js configuration utilities with Effect-based security, PWA, and build optimization.

## Purpose

This package provides a zero-config Next.js configuration factory that automatically applies production-ready defaults for beep-effect applications. It centralizes build-time tooling to maintain consistency across all Next.js applications in the monorepo.

**Key capabilities:**
- **Security headers**: CSP, HSTS, frame guards, XSS protection with secure defaults
- **PWA support**: Service worker generation, offline caching, and fallback routes using Workbox
- **Smart transpilation**: Auto-detects workspace packages requiring TypeScript transpilation
- **Bundle optimization**: Conditional bundle analysis and package import optimization
- **MDX integration**: Built-in MDX support for documentation pages

All configuration is Effect-based with proper error handling, observability spans, and immutable transformations. This is a **tooling package** for build-time use only—it's not included in runtime bundles.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/build-utils": "workspace:*"
```

## Key Exports

### Main Entry (`@beep/build-utils`)

| Export | Description |
|--------|-------------|
| `beepNextConfig` | Main factory function that returns a complete Next.js configuration with security, PWA, MDX, and transpilation configured (returns `Promise<NextConfig>`) |

### PWA Module (`@beep/build-utils/pwa`)

| Export | Description |
|--------|-------------|
| `withPWA` | Higher-order function that adds PWA capabilities to Next.js config |
| `defaultCache` | Preconfigured Workbox caching strategies for common asset types |
| `buildCustomWorker` | Build a custom service worker from TypeScript source |
| `buildFallbackWorker` | Generate a fallback worker for offline pages |
| `registerWorkerSource` | Client-side service worker registration script source |
| `fallbackWorkerSource` | Fallback worker script template |
| Types | `PWAConfig`, `RuntimeCaching`, `FallbackRoutes`, `WorkboxHandler`, and Workbox re-exports |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/tooling-utils` | Repo introspection, workspace analysis, file system utilities |
| `@beep/identity` | Package identity helpers |
| `@beep/schema` | Effect Schema utilities |
| `@beep/constants` | Schema-backed enums and constants |
| `@beep/invariant` | Assertion contracts |
| `@beep/utils` | Pure runtime helpers |
| `next` | Next.js framework types and utilities |
| `@next/mdx` | MDX support for Next.js |
| `@next/bundle-analyzer` | Webpack bundle analysis |
| `workbox-build` | Service worker generation |
| `workbox-webpack-plugin` | PWA integration with webpack |
| `workbox-core`, `workbox-window` | Workbox runtime libraries |
| `webpack` | Build tooling for custom workers |
| `effect` | Effect runtime and utilities |
| `@effect/platform`, `@effect/platform-node` | Platform-specific Effect utilities |

## Integration

This package integrates with the beep-effect monorepo tooling layer:

- **Consumed by**: `apps/web`, `apps/marketing` (any Next.js application)
- **Layer**: Tooling (build-time only, not included in runtime bundles)
- **Pattern**: Effect-based configuration with immutable transformations and observability

## Usage

### Basic Configuration

The simplest setup provides all defaults (security headers, PWA, MDX, transpilation):

```typescript
// apps/web/next.config.mjs
import { beepNextConfig } from "@beep/build-utils";

// beepNextConfig returns a Promise<NextConfig>, so we await it
const config = await beepNextConfig("@beep/web");

export default config;
```

Note: `beepNextConfig` is async because it performs Effect-based configuration resolution (repo root detection, transpilation package detection, environment config loading). Use `.mjs` extension or `"type": "module"` in package.json for top-level await support.

This automatically:
- Applies secure CSP headers with safe defaults
- Configures PWA with offline support (disabled in development)
- Enables MDX support for `.mdx` and `.md` pages
- Auto-detects workspace packages requiring transpilation
- Optimizes imports for common UI libraries
- Configures image domains for external assets

### Custom Configuration

Override defaults by passing a configuration object:

```typescript
// apps/web/next.config.mjs
import { beepNextConfig } from "@beep/build-utils";

const config = await beepNextConfig("@beep/web", {
  // Standard Next.js options
  reactCompiler: true,
  trailingSlash: false,

  // Custom security headers (merged with defaults)
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        scriptSrc: ["'self'", "https://trusted-cdn.com"],
      },
    },
    forceHTTPSRedirect: [true, { maxAge: 31536000 }],
  },

  // PWA configuration (merged with defaults)
  pwaConfig: {
    disable: process.env.NODE_ENV === "development",
    dest: "public",
    register: true,
    skipWaiting: true,
    fallbacks: {
      document: "/_offline",
    },
  },

  // Bundle analyzer
  bundleAnalyzerOptions: {
    enabled: process.env.ANALYZE === "true",
    analyzerMode: "static",
  },
});

export default config;
```

### Advanced PWA Configuration

For advanced PWA use cases, import from `@beep/build-utils/pwa`:

```typescript
import { withPWA, defaultCache } from "@beep/build-utils/pwa";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  // Standard Next.js config
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    ...defaultCache, // Include default caching strategies
    {
      // Custom API caching
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300,
        },
      },
    },
  ],
  fallbacks: {
    document: "/_offline",
    image: "/static/fallback.png",
  },
})(baseConfig);
```

## Automatic Configurations

### Security Headers

`beepNextConfig` applies these security defaults (all customizable):

| Header | Default Value |
|--------|---------------|
| Content-Security-Policy | `default-src 'self'`, restricted script/style sources, blob/data URIs for media |
| Strict-Transport-Security | `max-age=63072000` (2 years) |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| X-XSS-Protection | `1; mode=block` (sanitize) |
| X-Permitted-Cross-Domain-Policies | `none` |

CSP directives include safe defaults for:
- Google Tag Manager, reCAPTCHA, Fonts
- jsdelivr CDN
- Vercel Live preview
- Local development servers (localhost, 127.0.0.1)

### Image Domains

Automatically configured remote image patterns:

- Static asset CDN (from `NEXT_PUBLIC_STATIC_URL` env var)
- `cdn.discordapp.com`
- `lh3.googleusercontent.com`
- `avatars.githubusercontent.com`
- `images.unsplash.com`
- `image.tmdb.org`
- `res.cloudinary.com`

### Optimized Package Imports

These packages are automatically optimized for faster builds:

- `@iconify/react`
- `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-date-pickers`
- `@beep/ui`, `@beep/ui-core`
- `react-phone-number-input`
- `@effect/platform`, `@effect/opentelemetry`

### Experimental Features

The following Next.js experimental features are configured:

- `optimizePackageImports` — Tree-shaking for listed packages (always merged with defaults)
- `browserDebugInfoInTerminal: true` — Enhanced debugging output (always enabled)
- `ppr: true` — Partial Prerendering (enabled when experimental options are provided)
- `mcpServer: true` — MCP server support (enabled when no experimental options are provided)
- `turbopackFileSystemCacheForDev: true` — Faster dev builds (enabled when no experimental options are provided)
- `turbotrace` — Context directory and loaders configuration (enabled when experimental options are provided)

### PWA Default Cache Strategies

The `defaultCache` export from `@beep/build-utils/pwa` provides Workbox caching strategies:

| Asset Type | Strategy | Cache Name | Max Age |
|------------|----------|------------|---------|
| Google Fonts webfonts | CacheFirst | google-fonts-webfonts | 365 days |
| Google Fonts stylesheets | StaleWhileRevalidate | google-fonts-stylesheets | 7 days |
| Font files (.woff, .woff2) | StaleWhileRevalidate | static-font-assets | 7 days |
| Images (.jpg, .png, .svg) | StaleWhileRevalidate | static-image-assets | 24 hours |
| Next.js optimized images | StaleWhileRevalidate | next-image | 24 hours |
| Audio (.mp3, .wav, .ogg) | CacheFirst | static-audio-assets | 24 hours |
| Video (.mp4) | CacheFirst | static-video-assets | 24 hours |
| JavaScript (.js) | StaleWhileRevalidate | static-js-assets | 24 hours |
| CSS (.css, .less) | StaleWhileRevalidate | static-style-assets | 24 hours |
| Next.js data routes | StaleWhileRevalidate | next-data | 24 hours |
| Data files (.json, .xml) | NetworkFirst | static-data-assets | 24 hours |
| API routes (same-origin) | NetworkFirst | apis | 24 hours |
| Other same-origin resources | NetworkFirst | others | 24 hours |
| Cross-origin resources | NetworkFirst | cross-origin | 1 hour |

## Development

```bash
# Type check
bun run --filter @beep/build-utils check

# Lint
bun run --filter @beep/build-utils lint

# Auto-fix lint issues
bun run --filter @beep/build-utils lint:fix

# Build
bun run --filter @beep/build-utils build

# Test
bun run --filter @beep/build-utils test

# Test with coverage
bun run --filter @beep/build-utils coverage
```

## Notes

### Effect-First Patterns

This package follows Effect-first development patterns throughout:

- **Effect.gen** — All configuration builders use generator-based Effects for composability
- **Effect.withSpan** — Observability spans on configuration operations for tracing
- **Namespace imports** — `import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`
- **Immutable transformations** — All config modifications return new objects; no mutation
- **Option handling** — Safe nullable handling with `Option.fromNullable`, `Option.match`, `Option.lift2`
- **Collection utilities** — Uses Effect's `Array`, `String`, `HashMap`, `HashSet` instead of native methods
- **Schema validation** — Configuration validated with `@beep/schema` schemas

### Automatic Transpilation Detection

The `computeTranspilePackages` function automatically detects which workspace packages require TypeScript transpilation by analyzing `package.json` exports. It identifies packages with:
- `.ts` file extensions in `exports` field
- Paths pointing to `/src/` directories
- `module` or `main` fields pointing to TypeScript sources

This eliminates the need for manual `transpilePackages` maintenance when adding new workspace packages.

### Security Best Practices

Security headers follow defense-in-depth principles:
- **Strict defaults**: CSP, HSTS, frame guards, XSS protection are all enabled by default
- **Development-friendly**: Includes safe defaults for localhost, Vercel Live, Google services
- **Customizable**: All headers can be overridden or disabled via the `headers` config option
- **Merge strategy**: User-provided headers are merged with defaults, not replaced

**Important**: Always audit CSP modifications for security implications. Relaxing CSP directives can introduce XSS vulnerabilities.

### PWA Architecture

- **Environment-aware**: PWA is enabled in production, disabled in development by default
- **Build-time generation**: Service worker is generated during Next.js build using Workbox
- **Offline-first**: Default caching strategies prioritize offline functionality
- **Customizable**: Override `runtimeCaching` and `fallbacks` to match application needs
- **Type-safe**: All PWA configuration is validated with TypeScript types

### Configuration Resolution

`beepNextConfig` is async (returns `Promise<NextConfig>`) because it performs Effect-based resolution:
1. Detects repository root via `@beep/tooling-utils`
2. Analyzes workspace packages for transpilation requirements
3. Loads environment configuration (e.g., `NEXT_PUBLIC_STATIC_URL`)
4. Merges user config with defaults using immutable transformations

Use `.mjs` extension or `"type": "module"` in `package.json` to support top-level await in `next.config.js`.
