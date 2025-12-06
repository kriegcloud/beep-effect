# @beep/build-utils — Next.js build utilities

Effect-based build configuration utilities for Next.js applications in the beep-effect monorepo. This package provides composable build plugins including PWA support, secure headers, bundle analysis, MDX integration, and smart transpilation detection.

## Purpose and fit

- **Next.js configuration factory**: Opinionated `beepNextConfig` that applies security, optimization, and PWA defaults automatically.
- **Composable plugins**: Individual higher-order functions (`withPWA`, `withBundleAnalyzer`, `withMDX`) that transform Next.js configurations.
- **Security-first**: Comprehensive secure header generation with CSP, CORS, frame protection, and XSS mitigation.
- **Smart transpilation**: Automatically detects workspace packages that need transpilation based on their exports pointing to TypeScript source.
- **PWA support**: Complete Progressive Web App setup with service worker generation, caching strategies, and offline fallbacks.

## Public surface map

### Core configuration
- **`beepNextConfig`** — Main factory function that creates a complete Next.js configuration with all defaults applied. Returns a Promise&lt;NextConfig&gt;.
- **`BeepNextConfig`** — TypeScript type for configuration options (extends NextConfig with custom fields).

### PWA module (`@beep/build-utils/pwa`)
- **`withPWA`** — Higher-order function that adds PWA capabilities to a Next.js config.
- **`defaultCache`** — Preconfigured Workbox caching strategies for fonts, images, scripts, styles, API routes, and more.
- **`buildCustomWorker`** — Build a custom service worker from TypeScript source.
- **`buildFallbackWorker`** — Generate a fallback worker for offline pages.
- **`registerWorkerSource`** — Client-side service worker registration script source.
- **`fallbackWorkerSource`** — Fallback worker script template.
- **Types**: `PWAConfig`, `RuntimeCaching`, `FallbackRoutes`, `WorkboxHandler`, and comprehensive Workbox type re-exports.

### Secure headers
- **`createSecureHeaders`** — Effect-based function that generates Next.js header configuration from security options.
- **`createHeadersObject`** — Generates a plain object of security headers (without Next.js wrapper).
- **Individual header creators** (via `secure-headers/index.ts`):
  - Content Security Policy (CSP)
  - Cross-Origin policies (COEP, COOP, CORP)
  - HTTPS enforcement (HSTS)
  - Frame protection (X-Frame-Options)
  - XSS protection
  - MIME sniffing prevention
  - Permissions Policy
  - Referrer Policy
  - Expect-CT

### Other utilities
- **`withBundleAnalyzer`** — Conditionally enable webpack bundle analysis (auto-enables in dev environment).
- **`withMDX`** — Add MDX support to Next.js via `@next/mdx`.
- **`computeTranspilePackages`** — Effect that analyzes workspace dependencies and returns packages needing transpilation.

## Architecture integration

- **Tooling layer**: Build-time utilities, not runtime code. Safe to use in `next.config.js` files.
- **Effect-first**: All major operations return Effects with proper error handling and observability spans.
- **Composable**: Each plugin is a pure function that transforms Next.js configurations immutably.
- **Workspace-aware**: Integrates with `@beep/tooling-utils` for repo introspection and dependency analysis.

## Usage examples

### Basic Next.js configuration

```typescript
// apps/web/next.config.js
import { beepNextConfig } from "@beep/build-utils";

export default beepNextConfig("@beep/web");
```

### Custom configuration with overrides

```typescript
import { beepNextConfig } from "@beep/build-utils";

export default beepNextConfig("@beep/web", {
  // Override secure headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        scriptSrc: ["'self'", "https://trusted-cdn.com"],
      },
    },
  },

  // Override PWA config
  pwaConfig: {
    disable: process.env.NODE_ENV === "development",
    dest: "public",
    runtimeCaching: defaultCache,
    fallbacks: {
      document: "/_offline",
    },
  },

  // Override bundle analyzer
  bundleAnalyzerOptions: {
    enabled: true,
    analyzerMode: "static",
  },
});
```

### Using PWA utilities standalone

```typescript
import { withPWA, defaultCache } from "@beep/build-utils/pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your config
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    ...defaultCache,
    // Add custom caching strategy
    {
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300, // 5 minutes
        },
      },
    },
  ],
  fallbacks: {
    document: "/_offline",
    image: "/static/fallback.png",
  },
})(nextConfig);
```

### Creating secure headers manually

```typescript
import { createSecureHeaders } from "@beep/build-utils";
import * as Effect from "effect/Effect";

const program = createSecureHeaders({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: "'self'",
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  forceHTTPSRedirect: [true, { maxAge: 63072000 }],
  frameGuard: "deny",
  xssProtection: "sanitize",
});

const headers = await Effect.runPromise(program);
// Use in Next.js config or middleware
```

### Computing transpile packages

```typescript
import { computeTranspilePackages } from "@beep/build-utils/transpile-packages";
import * as Effect from "effect/Effect";

const program = computeTranspilePackages({ target: "@beep/web" });
const packages = await Effect.runPromise(program);
// Returns: ["@beep/ui", "@beep/shared-domain", ...]
```

## Default configurations

### Secure headers defaults

The package applies secure defaults that can be overridden:

- **CSP**: Allows self, blob, and specific trusted CDNs (Google Fonts, jsdelivr)
- **HSTS**: 2-year max-age with includeSubDomains
- **Frame-Options**: DENY by default
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: sanitize mode
- **X-Permitted-Cross-Domain-Policies**: none

### Image optimization defaults

Automatically configures Next.js image domains:
- Static asset CDN (from `NEXT_PUBLIC_STATIC_URL`)
- Discord CDN
- Google user content
- GitHub avatars
- Unsplash
- TMDB
- Cloudinary

### Experimental features enabled

- `optimizePackageImports` for common UI libraries (@mui/material, @iconify/react, etc.)
- `mcpServer: true`
- `turbopackFileSystemCacheForDev: true`
- `browserDebugInfoInTerminal: true`
- `ppr: true` (Partial Prerendering)

### Package optimization

Default optimized imports:
- @iconify/react
- @mui/material, @mui/icons-material, @mui/lab, @mui/x-date-pickers
- @beep/ui, @beep/ui-core
- react-phone-number-input
- @effect/platform, @effect/opentelemetry

## PWA caching strategies

The `defaultCache` export provides production-ready Workbox strategies:

| Asset Type | Handler | Cache Name | Max Age |
|------------|---------|------------|---------|
| Google Fonts (webfonts) | CacheFirst | google-fonts-webfonts | 365 days |
| Google Fonts (stylesheets) | StaleWhileRevalidate | google-fonts-stylesheets | 7 days |
| Font files (.woff, .woff2, etc.) | StaleWhileRevalidate | static-font-assets | 7 days |
| Images (.jpg, .png, .svg, etc.) | StaleWhileRevalidate | static-image-assets | 24 hours |
| Next.js images | StaleWhileRevalidate | next-image | 24 hours |
| Audio (.mp3, .wav, .ogg) | CacheFirst | static-audio-assets | 24 hours |
| Video (.mp4) | CacheFirst | static-video-assets | 24 hours |
| JavaScript (.js) | StaleWhileRevalidate | static-js-assets | 24 hours |
| CSS (.css, .less) | StaleWhileRevalidate | static-style-assets | 24 hours |
| Next.js data routes | StaleWhileRevalidate | next-data | 24 hours |
| Data files (.json, .xml, .csv) | NetworkFirst | static-data-assets | 24 hours |
| API routes (same-origin) | NetworkFirst | apis | 24 hours |
| Other same-origin | NetworkFirst | others | 24 hours |
| Cross-origin | NetworkFirst | cross-origin | 1 hour |

## Type safety and schemas

All secure header options are validated using Effect Schema:
- `ContentSecurityPolicyOptionSchema`
- `CrossOriginEmbedderPolicyOptionSchema`
- `CrossOriginOpenerPolicyOptionSchema`
- `ForceHTTPSRedirectOptionSchema`
- `FrameGuardOptionSchema`
- And more (see `secure-headers/index.ts` schemas export)

## Testing and verification

```bash
# Type check
bun run --filter @beep/build-utils check

# Lint
bun run --filter @beep/build-utils lint

# Auto-fix linting issues
bun run --filter @beep/build-utils lint:fix

# Run tests
bun run --filter @beep/build-utils test

# Coverage
bun run --filter @beep/build-utils coverage

# Check for circular dependencies
bun run --filter @beep/build-utils lint:circular

# Build
bun run --filter @beep/build-utils build
```

## Dependencies and platform

- **Effect Platform**: Uses `@effect/platform-node` and `@effect/platform-bun` for file system operations.
- **Workspace integration**: Depends on `@beep/tooling-utils` for repo introspection.
- **Next.js**: Tightly coupled to Next.js build pipeline (Next.js 15+).
- **Workbox**: Uses `workbox-build` and `workbox-webpack-plugin` for PWA generation.
- **Webpack**: Direct webpack integration for custom worker compilation.

## Effect patterns used

- **Effect.gen**: All major functions use generator-based Effects.
- **Effect.withSpan**: Observability spans on key operations (`NextConfig.make`, `createSecureHeaders`, `computeTranspilePackages`).
- **Namespace imports**: `import * as Effect from "effect/Effect"`, `import * as S from "effect/Schema"`.
- **Collection utilities**: Uses `effect/Array`, `effect/String`, `effect/HashMap`, `effect/HashSet` instead of native methods.
- **Option handling**: Extensive use of `Option.fromNullable`, `Option.match`, `Option.getOrElse` for safe nullable handling.
- **Immutable transformations**: All config transformations are pure functions returning new objects.

## Contributor checklist

- **Effect-first**: Use `Effect.gen`, avoid `async/await` in application logic.
- **Namespace imports**: Always use full namespace imports (`import * as Effect`).
- **No native methods**: Use Effect collection utilities (`A.map`, `Str.startsWith`, etc.).
- **Immutability**: Never mutate inputs; always return new configurations.
- **Schemas**: Validate external data with Effect Schema.
- **Spans**: Add `Effect.withSpan` to new public functions for observability.
- **Pure functions**: Keep utilities pure; side effects only through Effects.
- **Documentation**: Update this README and add JSDoc to new exports.
- **Types**: Export all public types; use `readonly` modifiers extensively.

## Notes on architecture decisions

### Why Effect for build-time utilities?

While this is a build-time package, Effect provides:
1. **Consistent patterns** across the monorepo
2. **Better error handling** than try/catch chains
3. **Observability** through spans and structured logging
4. **Type-safe transformations** with Schema validation
5. **Testability** through dependency injection and Layers

### Why immutable config transformations?

Next.js plugins are higher-order functions that compose together. Immutability ensures:
- Plugins can be applied in any order without side effects
- Configuration sources are traceable
- Testing is deterministic
- No hidden mutations that break in production

### Transpilation detection strategy

The `computeTranspilePackages` function analyzes package.json `exports`, `module`, and `main` fields to detect TypeScript source references. This avoids:
- Manual maintenance of transpilePackages arrays
- Forgetting to transpile new workspace packages
- Breaking builds when adding dependencies

Any package with exports pointing to `.ts` files or `/src/` directories is automatically included.

## Related packages

- **`@beep/tooling-utils`** — Repo introspection, file system utilities, workspace schemas
- **`@beep/constants`** — Schema-backed enums and path builders (may use build-utils for config)
- **Next.js apps** — `apps/web` consumes `beepNextConfig` for production configuration
