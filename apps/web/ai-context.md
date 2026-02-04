---
path: apps/web
summary: Main Next.js frontend - App Router, Effect runtimes, MUI theming, IAM integration
tags: [app, nextjs, effect, mui, frontend, production]
---

# @beep/web

Primary Next.js 16 App Router frontend for customer-facing surfaces. Bridges server and client Effect runtimes with comprehensive provider architecture.

## Architecture

```
|----------------------|     |----------------------|
|   Server Components  | --> |  runServerPromise    |
|   (layout.tsx)       |     |  (Effect execution)  |
|----------------------|     |----------------------|
          |
          v
|----------------------|
|   GlobalProviders    |
| BeepProvider         |
| > I18n > Settings    |
| > Theme > Confirm    |
| > RegistryProvider   |
|----------------------|
          |
          v
|----------------------|     |----------------------|
|  Client Components   | --> |  useRuntime          |
|  (dashboard, auth)   |     |  makeRunClientPromise|
|----------------------|     |----------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/app/layout.tsx` | Root layout, server-side config fetch |
| `src/GlobalProviders.tsx` | Client provider composition (13 providers) |
| `src/app/dashboard/` | Protected dashboard routes |
| `src/app/auth/` | Authentication flows (delegates to @beep/iam-ui) |
| `src/app/(public)/` | Public marketing pages |
| `src/app/files/` | File management routes |
| `next.config.mjs` | Security headers, transpilation, React Compiler |

## Usage Patterns

### Server-Side Effect Execution

```typescript
// In server components
import { runServerPromise } from "@beep/runtime-server";
import * as Effect from "effect/Effect";

const config = await runServerPromise(
  getAppConfig.pipe(Effect.withSpan("getInitialProps")),
  "RootLayout.getInitialProps"
);
```

### Client-Side Runtime Bridge

```typescript
// In client components
import { useRuntime, makeRunClientPromise } from "@beep/runtime-client";

const runtime = useRuntime();
const run = makeRunClientPromise(runtime, "iam.session.refresh");
const result = await run(refreshSessionEffect);
```

### Provider Composition

```tsx
<BeepProvider>
  <I18nProvider lang={appConfig.i18nLang}>
    <SettingsProvider>
      <ThemeProvider>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </ThemeProvider>
    </SettingsProvider>
  </I18nProvider>
</BeepProvider>
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Server/client runtime bridge | Effects in server components, managed runtime for client |
| 13-provider stack | Consistent theming, i18n, settings, IAM across app |
| @beep/ui-core tokens | Design system consistency |
| React Compiler enabled | Performance optimization |
| RegistryProvider atoms | Global state via @effect-atom |

## Dependencies

**Internal**: `@beep/runtime-client`, `@beep/runtime-server`, `@beep/ui`, `@beep/ui-core`, `@beep/iam-ui`, `@beep/shared-env`, plus vertical slice clients/ui packages

**External**: `next`, `react`, `@mui/material`, `effect`, `@effect/platform-browser`, `better-auth`, Lexical, i18next

## Related

- **AGENTS.md** - Detailed contributor guidance
- **src/GlobalProviders.tsx** - Provider composition details
- **@beep/runtime-client** - Client-side Effect runtime
- **@beep/runtime-server** - Server-side Effect execution
