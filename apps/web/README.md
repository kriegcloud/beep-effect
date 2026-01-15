# @beep/web

Next.js 16 App Router frontend application for the beep-effect platform.

## Purpose

`@beep/web` is the customer-facing Next.js application that serves all Beep surfaces including marketing pages, authentication flows, dashboard, and file upload functionality. It bridges server and client Effect runtimes, running on Next.js 16 + React 19 with the React Compiler and Turbopack. The app maintains a consistent UI experience by wiring `@beep/ui-core` design tokens and `@beep/ui` components through a centralized provider stack that handles theming, i18n, settings, authentication, and global UI state.

## Key Exports

| Export | Location | Description |
|--------|----------|-------------|
| `getAppConfig` | `/src/app-config.ts` | Server-side Effect program that detects language, settings, and direction from cookies/headers |
| `GlobalProviders` | `/src/GlobalProviders.tsx` | Root provider stack wrapping BeepProvider, theme, i18n, settings, and IAM |
| `KaServices` | `@beep/runtime-client` | Client-side Effect runtime services component (mounted in root layout) |
| `AuthGuard` | `/src/providers/AuthGuard.tsx` | Protected route wrapper requiring authentication |
| `GuestGuard` | `/src/providers/GuestGuard.tsx` | Public route wrapper that redirects authenticated users |
| `/api/v1/auth/[...all]` | `/src/app/api/v1/auth/[...all]/route.ts` | Better Auth integration route handler |

## Usage Examples

### Server-Side Configuration

```typescript
import * as Effect from "effect/Effect";
import { KaServices } from "@beep/runtime-client";
import { runServerPromise } from "@beep/runtime-server";
import { RegistryProvider } from "@effect-atom/atom-react";
import { getAppConfig } from "@/app-config";
import { GlobalProviders } from "@/GlobalProviders";

// Root layout fetches app config (language, direction, settings)
export default async function RootLayout({ children }: RootLayoutProps) {
  const appConfig = await runServerPromise(
    getAppConfig.pipe(Effect.withSpan("getInitialProps")),
    "RootLayout.getInitialProps"
  );

  return (
    <html lang={appConfig.lang ?? "en"} dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <GlobalProviders appConfig={appConfig}>
          <RegistryProvider>
            <KaServices />
            {children}
          </RegistryProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}
```

### Client-Side Runtime Bridge

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";

// Custom hook using client runtime
export const useRefreshSession = () => {
  const runtime = useRuntime();
  const run = makeRunClientPromise(runtime, "iam.session.refresh");

  return () => run(Effect.unit);
};

// Processing data with Effect utilities
const processUserNames = (users: User[]) =>
  Effect.succeed(
    F.pipe(
      users,
      A.map((user) => user.name),
      A.filter((name) => F.pipe(name, Str.isNonEmpty))
    )
  );
```

### Effect-First Data Handling

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as F from "effect/Function";

// Use Effect Array utilities instead of native methods
const getActiveUserEmails = (users: User[]) =>
  F.pipe(
    users,
    A.filter((user) => user.active),
    A.map((user) => user.email),
    A.map((email) => F.pipe(email, Str.toLowerCase))
  );

// Use Effect String utilities instead of native methods
const formatDisplayName = (name: string): ReadonlyArray<string> =>
  F.pipe(
    name,
    Str.trim,
    Str.split(" "),
    A.map((word) => F.pipe(word, Str.capitalize))
  );

// Note: Effect does not provide Array.join. If you need to join back to string,
// handle it outside the Effect pipeline or use reduce.
```

## Architecture Overview

### Route Structure

```
apps/web/src/app/
├── layout.tsx                          # Root layout with GlobalProviders
├── page.tsx                            # Home page
├── (public)/                           # Marketing pages (about, pricing, etc.)
│   ├── landing/page.tsx
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   ├── contact-us/page.tsx
│   ├── faqs/page.tsx
│   ├── portfolio/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── auth/                               # Authentication flows
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── reset-password/page.tsx
│   └── request-reset-password/page.tsx
├── dashboard/                          # Protected dashboard
│   ├── layout.tsx
│   └── _layout-client.tsx
├── upload/                             # File upload feature
│   └── page.tsx
├── files/                              # File management
└── api/                                # API routes
    └── v1/
        └── auth/[...all]/route.ts      # Better Auth handler
```

### Provider Stack

The root layout establishes the following provider hierarchy (from outer to inner):

1. **Root Layout** (`layout.tsx`)
   - `GlobalProviders` — Wraps all providers below
   - `RegistryProvider` — Effect-atom registry (from `@effect-atom/atom-react`)
   - `KaServices` — Client Effect runtime services mount point

2. **GlobalProviders** (`GlobalProviders.tsx`)
   - `BeepProvider` — Client ManagedRuntime from `@beep/runtime-client`
   - `RegistryContext.Provider` — Atom registry with initial values (e.g., settingsDialogAtom)
   - `InitColorSchemeScript` — MUI color scheme hydration
   - `I18nProvider` — Internationalization context
   - `DevToolsProvider` — TanStack development tools (React Query, Form devtools)
   - `SettingsProvider` — User preferences (theme, layout, direction, etc.)
   - `LocalizationProvider` — Date/number formatting (MUI date pickers)
   - `AppRouterCacheProvider` — MUI Emotion cache for Next.js App Router
   - `ThemeProvider` — MUI theming system with color mode persistence
   - `BreakpointsProvider` — Responsive breakpoint utilities
   - `ConfirmProvider` — Confirmation dialog provider
   - `IamProvider` — Authentication context from `@beep/iam-ui`
   - `MotionLazy` — Framer Motion lazy loading wrapper
   - Global UI components: `Snackbar`, `ProgressBar`, `SettingsDrawer`

## Dependencies

### Core Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Next.js 16 App Router framework |
| `react` | React 19 with compiler support |
| `effect` | Effect runtime and utilities |
| `@beep/runtime-client` | Client-side managed Effect runtime |
| `@beep/runtime-server` | Server-side managed Effect runtime |
| `@beep/ui` | Component library (MUI + shadcn + Radix) |
| `@beep/ui-core` | Design tokens, theme configuration |

### Common Layer Packages

| Package | Purpose |
|---------|---------|
| `@beep/errors` | Standardized error types and handling |
| `@beep/constants` | Application-wide constants |
| `@beep/schema` | Effect Schema definitions and validation |
| `@beep/utils` | Shared utility functions |
| `@beep/invariant` | Runtime invariant checks |
| `@beep/identity` | Identity and authentication primitives |
| `@beep/types` | TypeScript type utilities |

### Feature Packages

| Package | Purpose |
|---------|---------|
| `@beep/iam-ui` | Authentication UI flows |
| `@beep/iam-client` | IAM client contracts |
| `@beep/iam-domain` | IAM domain types and business logic |
| `@beep/documents-server` | Documents server-side handlers |
| `@beep/shared-ui` | Shared UI components |
| `@beep/shared-domain` | Shared domain types and business logic |

### Infrastructure

| Package | Purpose |
|---------|---------|
| `@beep/shared-env` | Environment variable validation and typing |
| `@effect/platform-browser` | Browser platform layer |
| `@effect/opentelemetry` | Observability/tracing |
| `better-auth` | Authentication library |
| `drizzle-orm` | Database ORM |
| `@effect-atom/atom-react` | Effect-based atomic state management |
| `@tanstack/react-form` | Form state management |

## Development Commands

Run these commands from the repository root:

```bash
# Start development server with Turbopack
bun run dev --filter @beep/web

# Type checking
bun run check --filter @beep/web

# Linting (Biome)
bun run lint --filter @beep/web

# Auto-fix lint issues
bun run lint:fix --filter @beep/web

# Run tests
bun run test --filter @beep/web

# Production build
bun run build --filter @beep/web
```

### Package-Local Scripts

If you need to run scripts from within the package directory:

```bash
cd apps/web

# Development with HTTPS (for testing PWA features)
bun run dev:https

# Start production server
bun run start

# Check for circular dependencies
bun run lint:circular
```

## Environment Configuration

Environment variables are managed via `dotenvx` from the repository root `.env` file.

### Required Variables

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_CAPTCHA_SITE_KEY` | Public | reCAPTCHA v3 site key for IAM flows |
| `NEXT_PUBLIC_STATIC_URL` | Public | Base URL for static assets |
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `REDIS_URL` | Server | Redis connection for Better Auth sessions |
| `AUTH_SECRET` | Server | Better Auth secret key |

**Important**: Never read `process.env` directly. Use `serverEnv` from `@beep/shared-env/ServerEnv` or validated config from `@beep/shared-server`.

## Effect Pattern Compliance

### Required Import Style

```typescript
// ✅ Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// ✅ Single-letter aliases for collections
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
```

### Forbidden Native Methods

```typescript
// ❌ NEVER use native array methods
items.map(fn)
items.filter(fn)
Array.from(iterable)

// ✅ Use Effect Array utilities
F.pipe(items, A.map(fn))
F.pipe(items, A.filter(fn))
F.pipe(iterable, A.fromIterable)

// ❌ NEVER use native string methods
str.toUpperCase()
str.split(" ")
str.trim()

// ✅ Use Effect String utilities
F.pipe(str, Str.toUpperCase)
F.pipe(str, Str.split(" "))
F.pipe(str, Str.trim)
```

## Testing Strategy

- **Unit tests**: Colocated in `test/` directory
- **Test runner**: Bun test with Vitest compatibility
- **Effect testing**: Use utilities from `@beep/testkit`
- **Component testing**: React Testing Library patterns

## Build Configuration

### Next.js Config (`next.config.mjs`)

The configuration delegates to `@beep/build-utils/beepNextConfig`, which provides:

- **Turbopack**: Enabled for faster builds
- **React Compiler**: Automatic optimization via `babel-plugin-react-compiler`
- **Transpilation**: TS-aware transpilation of `@beep/*` workspace packages
- **SVGR**: SVG imports as React components via `@svgr/webpack`
- **Security Headers**: CSP, HSTS, frame options
- **Output Tracing**: Monorepo-aware file tracing

See `packages/tooling/build-utils` for the complete configuration implementation.

### TypeScript Config

- **Path Aliases**: `@/*` maps to `src/*`, `@beep/*` for workspace packages
- **Strict Mode**: Full type safety enforcement
- **React 19**: JSX runtime configuration

## Contributor Guidelines

### Development Workflow

1. **Effect-First**: Use `Effect.gen`, `pipe`, and Effect utilities exclusively
2. **Type Safety**: No `any`, `@ts-ignore`, or unchecked casts
3. **Import Guardrails**: Follow namespace import conventions
4. **Provider Consistency**: Update `GlobalProviders` when adding global dependencies
5. **Environment**: Add new vars to `@beep/shared-server` config

### Before Committing

- [ ] `bun run check --filter @beep/web` passes
- [ ] `bun run lint --filter @beep/web` passes
- [ ] No native array/string/object methods introduced
- [ ] Environment variables documented if added

### App Router Best Practices

- Mark components `"use client"` only when necessary
- Server components: fetch data via `runServerPromise(effect, label)`
- Client components: use `useRuntime()` + `makeRunClientPromise(runtime, label)`
- Avoid `process.env` — use `serverEnv` from `@beep/shared-env/ServerEnv` or validated config

## Observability

### Telemetry

- **Provider**: `@effect/opentelemetry` with OTLP exports
- **Spans**: Automatic tracing via `Effect.withSpan`
- **Logs**: Structured JSON logging with `Effect.log*`
- **Metrics**: Custom metrics via Effect observability layer

### Performance Monitoring

- React Compiler optimizations
- Turbopack build acceleration
- NProgress for route transitions
- Bundle analysis via `@next/bundle-analyzer`

## Related Documentation

- [Root AGENTS.md](/AGENTS.md) — Monorepo guardrails
- [apps/web/AGENTS.md](/apps/web/AGENTS.md) — App-specific patterns
- [@beep/ui README](/packages/ui/ui/README.md) — UI component library
- [@beep/ui-core README](/packages/ui/core/README.md) — Design system
- [@beep/runtime-client README](/packages/runtime/client/README.md) — Client runtime
- [@beep/runtime-server README](/packages/runtime/server/README.md) — Server runtime

## License

See [LICENSE](./LICENSE) file in this directory.
