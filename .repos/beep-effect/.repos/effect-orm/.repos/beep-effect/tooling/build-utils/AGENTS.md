# @beep/build-utils Agent Guide

## Purpose & Fit
- Provides Next.js configuration utilities and build-time helpers for the web application
- Wraps security headers, PWA integration, MDX support, and bundle analysis into composable configuration builders
- Effect-based configuration resolution with schema validation
- Centralizes build-time tooling to maintain consistency across Next.js builds

## Surface Map
- **`src/NextConfig.ts`** — Main Next.js configuration builder
  - `beepNextConfig()` — Composable Next.js config factory with security, PWA, MDX, and transpilation (returns `Promise<NextConfig>`)
  - Effect-based configuration resolution from environment
  - Default optimizeImports for common packages (`@mui/*`, `@beep/*`, `@effect/*`)
  - Hardcoded secure CSP directives as baseline
- **`src/create-secure-headers.ts`** — Security headers factory
  - CSP, HSTS, frame guards, XSS protection
  - Type-safe header configuration
- **`src/bundle-analyzer.ts`** — Webpack bundle analysis integration
  - Conditional bundle analyzer based on environment flags
- **`src/mdx.ts`** — MDX support for Next.js
  - `@next/mdx` integration wrapper
- **`src/transpile-packages.ts`** — Package transpilation configuration
  - Auto-detects workspace packages requiring transpilation
- **`src/pwa/`** — Progressive Web App utilities
  - `src/pwa/with-pwa.ts` — PWA plugin for Next.js using Workbox
  - `src/pwa/default-cache.ts` — Default caching strategies
  - `src/pwa/build-custom-worker.ts` — Service worker builder
  - `src/pwa/build-fallback-worker.ts` — Fallback worker builder
  - `src/pwa/register.ts` — Client-side PWA registration helpers
  - `src/pwa/types.ts` — PWA configuration types
- **`src/secure-headers/`** — Security header type definitions

## Usage Snapshots
- `apps/web/next.config.ts` — Uses `createNextConfig` to build production configuration
- PWA enabled conditionally via environment variables
- Bundle analyzer activated with `ANALYZE=true` flag
- Security headers applied automatically in production builds

## Authoring Guardrails
- Configuration builders must use Effect for async resolution and error handling
- Maintain namespace imports: `import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`
- Use Effect collections (`HashSet`, `HashMap`) instead of native Set/Map
- Avoid native String/Array methods; use `Str.*`, `A.*` from Effect
- Security defaults should be conservative; document any relaxations
- PWA configuration changes should preserve offline-first capabilities
- CSP directives should only be relaxed with explicit justification
- New optimizeImports should be benchmarked before inclusion

## Quick Recipes

```typescript
import { beepNextConfig } from "@beep/build-utils";

// Basic Next.js config (minimal usage - all defaults applied)
export default beepNextConfig("@beep/web");
```

```typescript
import { beepNextConfig } from "@beep/build-utils";

// Advanced Next.js config with custom options
const nextConfig = await beepNextConfig("@beep/web", {
  reactCompiler: true,
  headers: {
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "https://trusted-cdn.com"],
      },
    },
  },
  pwaConfig: {
    disable: process.env.NODE_ENV === "development",
    dest: "public",
  },
  bundleAnalyzerOptions: {
    enabled: process.env.ANALYZE === "true",
  },
});

export default nextConfig;
```

```typescript
import { withPWA } from "@beep/build-utils/pwa";
import type { NextConfig } from "next";

// Apply PWA to existing config
const baseConfig: NextConfig = {
  // Your config
};

const configWithPWA = withPWA({
  dest: "public",
  disable: false,
  register: true,
  scope: "/",
})(baseConfig);
```

```typescript
// Note: createSecureHeaders is used internally by beepNextConfig
// To customize security headers, pass them via the headers option:
import { beepNextConfig } from "@beep/build-utils";

export default beepNextConfig("@beep/web", {
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    forceHTTPSRedirect: [true, { maxAge: 63072000 }],
  },
});
```

## Dependencies

- `@beep/tooling-utils` — Filesystem utilities for repo operations
- `@beep/identity` — Package identity
- `@beep/schema` — Schema validation
- `next` — Next.js framework
- `workbox-webpack-plugin` — Service worker generation
- `workbox-build` — PWA build tooling
- `@next/mdx` — MDX support
- `@next/bundle-analyzer` — Bundle analysis
- `webpack` — Build tooling

## Verifications
- `bun run lint --filter @beep/build-utils`
- `bun run check --filter @beep/build-utils`
- `bun run test --filter @beep/build-utils`
- `bun run build --filter @beep/build-utils`

## Contributor Checklist
- [ ] Effect-based configuration resolution (no async/await in public APIs)
- [ ] Namespace imports maintained (`import * as Effect from "effect/Effect"`)
- [ ] Security headers maintain strict defaults
- [ ] PWA configuration preserves offline functionality
- [ ] New optimizeImports packages are verified for bundle size impact
- [ ] CSP changes are documented with security justification
- [ ] Configuration options are type-safe and schema-validated
- [ ] Ran `bun run lint` and `bun run check` before committing
