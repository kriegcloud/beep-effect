# @beep/build-utils

Next.js configuration utilities with Effect-based security, PWA, and build optimization for the beep-effect monorepo.

## Purpose

This package provides a zero-config Next.js configuration factory (`beepNextConfig`) that automatically applies production-ready defaults:

- **Security headers**: CSP, HSTS, frame guards, XSS protection with secure defaults
- **PWA support**: Service worker generation, offline caching, and fallback routes
- **Smart transpilation**: Auto-detects workspace packages requiring TypeScript transpilation
- **Bundle optimization**: Conditional bundle analysis and package import optimization
- **MDX integration**: Built-in MDX support for documentation pages

All configuration is Effect-based with proper error handling, observability spans, and immutable transformations. This is a **tooling package** for build-time use in `next.config.js` files.

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
| `beepNextConfig` | Main factory function that returns a complete Next.js configuration with security, PWA, MDX, and transpilation configured |

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

## Integration

`@beep/build-utils` integrates with the beep-effect monorepo tooling layer:

- **Consumed by**: `apps/web`, `apps/notes` (any Next.js application)
- **Depends on**: `@beep/tooling-utils` for repo introspection and workspace analysis
- **Layer**: Tooling (build-time only, not included in runtime bundles)
- **Pattern**: Effect-based configuration with immutable transformations

## Usage

### Basic Configuration

The simplest setup provides all defaults (security headers, PWA, MDX, transpilation):

```typescript
// apps/web/next.config.ts
import { beepNextConfig } from "@beep/build-utils";

export default beepNextConfig("@beep/web");
```

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
import { beepNextConfig } from "@beep/build-utils";

export default beepNextConfig("@beep/web", {
  // Standard Next.js options
  reactCompiler: true,
  trailingSlash: false,

  // Custom security headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        scriptSrc: ["'self'", "https://trusted-cdn.com"],
      },
    },
    forceHTTPSRedirect: [true, { maxAge: 31536000 }],
  },

  // PWA configuration
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

The following Next.js experimental features are enabled by default:

- `optimizePackageImports` — Tree-shaking for listed packages
- `mcpServer: true` — MCP server support
- `turbopackFileSystemCacheForDev: true` — Faster dev builds
- `browserDebugInfoInTerminal: true` — Enhanced debugging output
- `ppr: true` — Partial Prerendering

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

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/tooling-utils` | Repo introspection, workspace analysis, file system utilities |
| `@beep/identity` | Package identity helpers |
| `@beep/schema` | Effect Schema utilities |
| `next` | Next.js framework types and utilities |
| `@next/mdx` | MDX support for Next.js |
| `@next/bundle-analyzer` | Webpack bundle analysis |
| `workbox-build` | Service worker generation |
| `workbox-webpack-plugin` | PWA integration with webpack |
| `webpack` | Build tooling for custom workers |

## Development

```bash
# Type check
bun run --filter @beep/build-utils check

# Lint
bun run --filter @beep/build-utils lint

# Fix linting issues
bun run --filter @beep/build-utils lint:fix

# Run tests
bun run --filter @beep/build-utils test

# Build
bun run --filter @beep/build-utils build
```

## Notes

### Effect Patterns

This package follows Effect-first development patterns:

- **Effect.gen** — All configuration builders use generator-based Effects
- **Effect.withSpan** — Observability spans on `NextConfig.make` and internal operations
- **Namespace imports** — `import * as Effect`, `import * as A from "effect/Array"`
- **Immutable transformations** — All config modifications return new objects
- **Option handling** — Safe nullable handling with `Option.fromNullable`, `Option.match`
- **Collection utilities** — Uses Effect's `Array`, `String`, `HashMap`, `HashSet` instead of native methods

### Transpilation Detection

The internal `computeTranspilePackages` function analyzes workspace dependencies to automatically detect which packages need TypeScript transpilation. It examines `package.json` `exports`, `module`, and `main` fields to identify packages pointing to `.ts` files or `/src/` directories. This eliminates manual `transpilePackages` maintenance.

### Security Defaults

Security headers follow defense-in-depth principles with strict defaults that can be selectively relaxed. CSP directives are designed to support common development patterns (Vercel Live, Google services) while blocking untrusted origins. Always audit CSP modifications for security implications.

### PWA Configuration

PWA is enabled by default in production and disabled in development. The service worker is generated at build time and uses Workbox caching strategies. For offline-first applications, customize `runtimeCaching` and `fallbacks` to match your application's needs.
