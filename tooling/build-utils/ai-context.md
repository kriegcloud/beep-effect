---
path: tooling/build-utils
summary: Next.js configuration utilities - security headers, PWA, MDX, bundle analysis
tags: [tooling, build, nextjs, pwa, security]
---

# @beep/build-utils

Effect-based Next.js configuration utilities that compose security headers, PWA integration, MDX support, and bundle analysis into a single factory function. Centralizes build-time tooling to maintain consistency across Next.js builds with schema-validated configuration.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|  beepNextConfig   | --> |  Security Headers | --> |    NextConfig     |
|-------------------|     |-------------------|     |-------------------|
        |                         |
        v                         v
|-------------------|     |-------------------|
|    PWA/Workbox    |     | Bundle Analyzer   |
|-------------------|     |-------------------|
        |
        v
|-------------------|
|   MDX Support     |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/NextConfig.ts` | Main config factory with Effect-based resolution |
| `src/create-secure-headers.ts` | CSP, HSTS, frame guards, XSS protection |
| `src/bundle-analyzer.ts` | Conditional webpack bundle analysis |
| `src/mdx.ts` | `@next/mdx` integration wrapper |
| `src/transpile-packages.ts` | Auto-detect workspace packages for transpilation |
| `src/pwa/with-pwa.ts` | PWA plugin using Workbox |
| `src/pwa/default-cache.ts` | Default caching strategies |
| `src/pwa/register.ts` | Client-side PWA registration helpers |

## Usage Patterns

### Basic Configuration

```typescript
import { beepNextConfig } from "@beep/build-utils";

export default beepNextConfig("@beep/todox");
```

### Advanced Configuration

```typescript
import { beepNextConfig } from "@beep/build-utils";

const nextConfig = await beepNextConfig("@beep/todox", {
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

### PWA-Only Integration

```typescript
import { withPWA } from "@beep/build-utils/pwa";
import type { NextConfig } from "next";

const configWithPWA = withPWA({
  dest: "public",
  disable: false,
  register: true,
  scope: "/",
})(baseConfig);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect-based config resolution | Async configuration with proper error handling |
| Conservative CSP defaults | Security-first approach; relaxations require justification |
| Conditional PWA | Disabled in development for faster builds |
| Centralized optimizeImports | Benchmark-verified common packages (`@mui/*`, `@beep/*`, `@effect/*`) |

## Dependencies

**Internal**: `@beep/tooling-utils`

**External**: `effect`, `@effect/platform`, `@effect/platform-node`, `next`, `workbox-webpack-plugin`, `workbox-build`, `@next/mdx`, `@next/bundle-analyzer`, `webpack`

## Related

- **AGENTS.md** - Detailed contributor guidance and security guardrails
- **apps/todox/next.config.mjs** - Production usage example
