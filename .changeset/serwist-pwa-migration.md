---
"@beep/repo-configs": minor
"@beep/oip-web": patch
---

Migrate the shared Next.js PWA integration from `next-pwa` to `@serwist/next`.

`next-pwa@5.6.0` is unmaintained (last released 2022) and incompatible with Next 16 — it broke the oip-web webpack PWA build with an `lru-cache` ESM named-export error. It is replaced with the maintained `@serwist/next`:

- `BeepNextPwaConfig` now accepts serwist options (`swSrc`, `swDest`, `cacheOnNavigation`, `reloadOnOnline`) instead of next-pwa's `dest`/`register`/`skipWaiting`/`options`, and the shared config wraps with `withSerwistInit` (static ESM import) rather than a lazy `require("next-pwa")`.
- oip-web gains an authored service worker at `src/app/sw.ts` (excluded from the app tsgo project; serwist's webpack plugin compiles it with the WebWorker context).
- `next-pwa` (and its `next-pwa.d.ts` shim) is removed from the catalog and every package manifest; `serwist` + `@serwist/next` are added.

The `NEXT_DISABLE_PWA` env toggle is preserved (mapped to serwist's `disable`). Verified: `bun run --cwd apps/oip-web build:pwa` compiles the service worker and succeeds.
