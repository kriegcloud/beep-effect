# apps/web — Next.js App Router shell

## What this app does
- Next.js 15 + React 19 front-end for every Beep slice (IAM, Files, Tasks, Comms) running on the App Router with the React Compiler and Turbopack.
- Bridges server/client Effect runtimes: `runServerPromise(getAppConfig)` in `src/app/layout.tsx` hydrates locale + settings, while `GlobalProviders` + `KaServices` mount the managed runtime, atom registry, theming, and UI plumbing.
- UI stack is powered by `@beep/ui-core` and `@beep/ui` (MUI + Tailwind + shadcn + Radix) with global providers for i18n, settings, progress, snackbars, and reCAPTCHA.

## Layout cheat sheet
- `src/app/layout.tsx` — loads `AppConfig` (language, direction, cookie-backed settings) via `getAppConfig` and wraps the tree with `GlobalProviders` → `RegistryProvider` → `KaServices`.
- `src/GlobalProviders.tsx` — provider stack: `BeepProvider` → atom `RegistryContext` → `InitColorSchemeScript` → `I18nProvider` → `SettingsProvider` → `LocalizationProvider` → `AppRouterCacheProvider` → `ThemeProvider` → `BreakpointsProvider` → `ConfirmProvider` → reCAPTCHA → `MotionLazy` → `Snackbar`/`ProgressBar`/`SettingsDrawer`.
- Routes: marketing bundle under `src/app/(public)/*`, auth flows in `src/app/auth/*` (delegates to `@beep/iam-ui`), dashboard shell in `src/app/dashboard` (settings dialog + mocks live in `_layout-client.tsx`), uploads in `src/app/upload/page.tsx`, and API handlers under `src/app/api`.
- Assets: static files live under `public/`; typed accessors come from `assetPaths` (regenerate via `bun run gen:beep-paths` after adding assets).

## Development commands (run from repo root)
- `bun run dev --filter @beep/web` (or `bun run dev` to run the whole workspace) — starts the app with Turbopack + dotenvx.
- `bun run check --filter @beep/web` — typecheck.
- `bun run lint --filter @beep/web` — Biome lint (respects Effect import guardrails).
- `bun run test --filter @beep/web` — Bun/Vitest tests (currently placeholder).
- `bun run build --filter @beep/web` — Next.js build with React Compiler and output tracing.
- Fallback (not preferred): `cd apps/web && bun run dev|check|lint|test|build` if you need package-local scripts.

## Environment + config notes
- `.env` at repo root is loaded via `dotenvx`; `packages/core/env` validates and redacts both server and client surfaces.
- Public client keys: `NEXT_PUBLIC_CAPTCHA_SITE_KEY` feeds `clientEnv.captchaSiteKey` for `react-google-recaptcha-v3`; static assets respect `NEXT_PUBLIC_STATIC_URL` in `next.config.ts` image remote patterns.
- `next.config.ts` sets security headers, TS-aware transpilation for `@beep/*` packages whose exports point to source, SVGR handling for SVGs, and uses `outputFileTracingRoot` to keep monorepo tracing sane.

## Contributor tips
- Stay Effect-first: use `Effect.gen`/`pipe` and Effect collection/string utilities; avoid native array/string/object helpers per repo guardrails.
- Pull UI tokens/components from `@beep/ui-core` and `@beep/ui` instead of ad-hoc styling; keep the provider stack in `GlobalProviders` aligned with those packages.
- Auth and settings flows rely on `clientEnv`/`serverEnv`; do not read `process.env` directly and keep new config in sync with `packages/core/env`.
- Coordinate long-running commands with the user; prefer root scripts over ad-hoc Next.js invocations.
