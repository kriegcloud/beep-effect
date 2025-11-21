# AGENTS — apps/web

## Purpose & Fit
- App Router host for all Beep customer-facing surfaces (marketing, auth, dashboard, upload) running on Next.js 15 + React 19 with the React Compiler and Turbopack.
- Bridges Effect runtimes: server components call `runServerPromise` to execute Effects (e.g., `getAppConfig`) and client shells mount `BeepProvider` + `KaServices` so atoms, telemetry, and workers share a single managed runtime.
- Keeps UI consistent by wiring `@beep/ui-core` tokens + `@beep/ui` composites through a single provider stack (theme, i18n, settings, confirm/snackbar, progress, reCAPTCHA).

## Surface Map
- `apps/web/src/app/layout.tsx` — wraps the tree with `GlobalProviders`, `RegistryProvider`, and `KaServices` after resolving `AppConfig` via `runServerPromise(getAppConfig, "RootLayout.getInitialProps")`; sets viewport + metadata.
- `apps/web/src/GlobalProviders.tsx` — provider chain: `BeepProvider` → atom `RegistryContext` → `InitColorSchemeScript` → `I18nProvider` → `SettingsProvider` → `LocalizationProvider` → `AppRouterCacheProvider` → `ThemeProvider` → `BreakpointsProvider` → `ConfirmProvider` → `RecaptchaProvider` (uses `clientEnv.captchaSiteKey`) → `MotionLazy` → `Snackbar` + `ProgressBar` + `SettingsDrawer`.
- `apps/web/src/app/dashboard/_layout-client.tsx` — client shell applying `AuthGuard`, `DashboardLayout`, settings dialog atom via `urlSearchParamSSR`, and runtime-backed handlers via `makeRunClientPromise`/`useRuntime`.
- Route groups: marketing pages under `apps/web/src/app/(public)`, auth flows in `apps/web/src/app/auth/*` (delegates to `@beep/iam-ui`), file uploads in `apps/web/src/app/upload/page.tsx`, mocks/tests in `apps/web/test`.
- Config: `apps/web/next.config.ts` enforces security headers, SVGR for SVGs, TS-aware transpilation of `@beep/*` packages whose exports point to source, React Compiler, and output tracing rooted at the monorepo.
- Assets: `public/` holds static files; use `assetPaths` for typed references and regenerate via `bun run gen:beep-paths` after adding assets.

## Usage Snapshots
- Server-side config fetch:
  ```ts
  import * as Effect from "effect/Effect";
  import { runServerPromise } from "@beep/runtime-server";
  import { getAppConfig } from "@/app-config";

  export const loadShellConfig = () =>
    runServerPromise(
      Effect.gen(function* () {
        const appConfig = yield* getAppConfig;
        return { lang: appConfig.lang, dir: appConfig.dir };
      }),
      "layout.loadShellConfig"
    );
  ```
- Client-side runtime bridge:
  ```ts
  import * as Effect from "effect/Effect";
  import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";

  export const useRefreshSession = () => {
    const runtime = useRuntime();
    const run = makeRunClientPromise(runtime, "iam.session.refresh");
    return () => run(Effect.unit);
  };
  ```

## Tooling & Docs Shortcuts
- Root scripts (preferred) scoped to this app: `bun run dev|check|lint|test|build --filter @beep/web`.
- Asset typing: `bun run gen:beep-paths` after touching `public/`.
- MUI references: use `mui-mcp__useMuiDocs` with `@mui/material@7.3.5` (cataloged via root `catalog`).
- Search for runtime hooks quickly: `jetbrains__search_in_files_by_text` with `searchText:"useRuntime"` and `projectPath:"/home/elpresidank/YeeBois/projects/beep-effect"`.

## Authoring Guardrails
- Effect-first only: namespace imports (`import * as Effect from "effect/Effect";`, `import * as A from "effect/Array";`, `import * as Str from "effect/String";`) and no native array/string/object helpers—pipe through Effect collection utilities.
- Respect App Router boundaries: only mark components `\"use client\"` when necessary; server components should keep data fetching inside Effects executed via `runServerPromise`.
- Do not read `process.env` directly; rely on `serverEnv`/`clientEnv` (`NEXT_PUBLIC_CAPTCHA_SITE_KEY` powers reCAPTCHA, `NEXT_PUBLIC_STATIC_URL` feeds Next image patterns).
- Prefer `@beep/ui` and `@beep/ui-core` components/tokens over hand-rolled MUI styling; update provider ordering in `GlobalProviders` if you add/remove foundations.
- When adjusting `next.config.ts`, keep security headers, turbopack rules, and `transpilePackages` filtering behavior intact; add new `@beep/*` packages only when their exports point to TS.
- Maintain atom registry consistency: new atoms consumed globally should be registered in `GlobalProviders` or mounted under the existing `RegistryProvider`, not in isolated trees.

## Verifications
- `bun run check --filter @beep/web` — type safety across app + shared slices.
- `bun run lint --filter @beep/web` — Biome formatting/import rules (catches native collection helpers).
- `bun run test --filter @beep/web` — Bun/Vitest placeholder suite (extend when adding behaviour).
- `bun run build --filter @beep/web` — ensures React Compiler + turbopack output tracing still succeed.

## Contributor Checklist
- [ ] Updated `apps/web/README.md` and this guide if provider ordering, runtime wiring, or routes changed.
- [ ] Kept Effect import/collection guardrails intact; no native array/string/object helpers introduced.
- [ ] Added any new env needs to `packages/core/env` and documented required `NEXT_PUBLIC_*`/server vars.
- [ ] Regenerated `assetPaths` after adding/removing files under `public/`.
- [ ] Confirmed lint + check (and build if touching config/runtime) before handing work back.
