# @beep/web

Next.js 15 App Router frontend for the beep-effect platform.

## Purpose

`@beep/web` is the customer-facing Next.js application that serves all Beep surfaces including marketing pages, authentication flows, dashboard, and file upload functionality. It bridges server and client Effect runtimes, running on Next.js 15 + React 19 with the React Compiler and Turbopack. The app maintains a consistent UI experience by wiring `@beep/ui-core` design tokens and `@beep/ui` components through a centralized provider stack that handles theming, i18n, settings, authentication, and global UI state.

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `getAppConfig` | `Effect<AppConfig>` | Server-side Effect that detects language, settings, and direction from cookies/headers |
| `GlobalProviders` | Component | Root provider stack (BeepProvider → Registry → Theme → i18n → Settings → IAM) |
| `AuthGuard` | Component | Protected route wrapper requiring authentication |
| `GuestGuard` | Component | Public route wrapper (redirects authenticated users) |
| `/api/auth/[...all]` | Route Handler | Better Auth integration endpoint |
| `/api/v1/iam/[...iam]` | Route Handler | IAM API routes |
| `/api/v1/files/*` | Route Handler | File upload/callback API routes |

## Usage Examples

### Server-Side Configuration

```typescript
import * as Effect from "effect/Effect";
import { runServerPromise } from "@beep/runtime-server";
import { getAppConfig } from "@/app-config";

// Root layout fetches app config (language, direction, settings)
export default async function RootLayout({ children }: RootLayoutProps) {
  const appConfig = await runServerPromise(
    Effect.gen(function* () {
      const config = yield* getAppConfig;
      return config;
    }),
    "RootLayout.getInitialProps"
  );

  return (
    <html lang={appConfig.lang} dir={appConfig.dir}>
      <body>
        <GlobalProviders appConfig={appConfig}>
          {children}
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
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";

// Custom hook using client runtime
export const useRefreshSession = () => {
  const runtime = useRuntime();
  const run = makeRunClientPromise(runtime, "iam.session.refresh");

  return () => run(Effect.unit);
};

// Processing data with Effect utilities
const processUserNames = (users: User[]) =>
  Effect.gen(function* () {
    const names = yield* Effect.succeed(
      pipe(
        users,
        A.map((user) => user.name),
        A.filter((name) => pipe(name, Str.isNonEmpty))
      )
    );
    return names;
  });
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
const formatDisplayName = (name: string) =>
  F.pipe(
    name,
    Str.trim,
    Str.split(" "),
    A.map((word) => F.pipe(word, Str.capitalize)),
    A.join(" ")
  );
```

## Architecture Overview

### Route Structure

```
apps/web/src/app/
├── layout.tsx                    # Root layout with GlobalProviders
├── page.tsx                      # Home page
├── (public)/                     # Marketing pages (about, pricing, etc.)
│   ├── landing/page.tsx
│   ├── pricing/page.tsx
│   └── about/page.tsx
├── auth/                         # Authentication flows
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── reset-password/page.tsx
├── dashboard/                    # Protected dashboard
│   ├── layout.tsx
│   └── _layout-client.tsx
├── upload/                       # File upload feature
│   └── page.tsx
└── api/                          # API routes
    ├── auth/[...all]/route.ts    # Better Auth handler
    └── v1/
        ├── iam/[...iam]/route.ts # IAM endpoints
        └── files/route.ts        # File endpoints
```

### Provider Stack

The `GlobalProviders` component establishes the following provider hierarchy:

1. `BeepProvider` — Client Effect runtime
2. `RegistryContext` — Atom registry for global state
3. `InitColorSchemeScript` — MUI color scheme hydration
4. `TanstackDevToolsProvider` — Development tools
5. `I18nProvider` — Internationalization
6. `SettingsProvider` — User preferences (theme, layout, etc.)
7. `LocalizationProvider` — Date/number formatting
8. `AppRouterCacheProvider` — MUI Emotion cache
9. `ThemeProvider` — MUI theming system
10. `BreakpointsProvider` — Responsive breakpoint utilities
11. `ConfirmProvider` — Confirmation dialogs
12. `IamProvider` — Authentication context
13. `MotionLazy` — Framer Motion lazy loading

Plus global UI components: `Snackbar`, `ProgressBar`, `SettingsDrawer`

## Dependencies

### Core Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Next.js 15 App Router framework |
| `react` | React 19 with compiler support |
| `effect` | Effect runtime and utilities |
| `@beep/runtime-client` | Client-side managed Effect runtime |
| `@beep/runtime-server` | Server-side managed Effect runtime |
| `@beep/ui` | Component library (MUI + shadcn + Radix) |
| `@beep/ui-core` | Design tokens, theme configuration |

### Feature Packages

| Package | Purpose |
|---------|---------|
| `@beep/iam-ui` | Authentication UI flows |
| `@beep/iam-sdk` | IAM client contracts |
| `@beep/documents-ui` | File upload components |
| `@beep/documents-sdk` | Documents client contracts |
| `@beep/shared-ui` | Shared UI components |
| `@beep/shared-sdk` | Shared SDK contracts |

### Infrastructure

| Package | Purpose |
|---------|---------|
| `@effect/platform-browser` | Browser platform layer |
| `@effect/opentelemetry` | Observability/tracing |
| `better-auth` | Authentication library |
| `drizzle-orm` | Database ORM |
| `jotai` / `jotai-x` | Atomic state management |
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

### Asset Management

After adding files to `public/`:

```bash
# Regenerate typed asset paths
bun run gen:beep-paths
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

**Important**: Never read `process.env` directly. Use `serverEnv`/`clientEnv` from `@beep/shared-infra`.

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

- **Turbopack**: Enabled for faster builds
- **React Compiler**: Automatic optimization
- **Transpilation**: TS-aware transpilation of `@beep/*` workspace packages
- **SVGR**: SVG imports as React components
- **Security Headers**: CSP, HSTS, frame options
- **Output Tracing**: Monorepo-aware file tracing

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
5. **Asset Types**: Regenerate after modifying `public/` directory
6. **Environment**: Add new vars to `@beep/shared-infra` config

### Before Committing

- [ ] `bun run check --filter @beep/web` passes
- [ ] `bun run lint --filter @beep/web` passes
- [ ] No native array/string/object methods introduced
- [ ] Assets regenerated if `public/` changed
- [ ] Environment variables documented if added

### App Router Best Practices

- Mark components `"use client"` only when necessary
- Server components: fetch data via `runServerPromise(effect, label)`
- Client components: use `useRuntime()` + `makeRunClientPromise(runtime, label)`
- Avoid `process.env` — use validated config from `@beep/shared-infra`

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
