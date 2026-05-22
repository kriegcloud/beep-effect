# P1/P2 Contract Proof

Date: 2026-05-21

## Scope

This proof covers the bounded bootstrap slice for `@beep/canvas`:

- `apps/canvas` Tauri 2 + React shell
- app-local typed command bridge
- Tauri app-data JSON save/load bridge
- focused command tests through public canvas contracts
- focused package gates for `@beep/canvas*`

## Implemented Shell Surface

- `apps/canvas/src-tauri` defines the native app, Tauri app-data JSON storage,
  typed protocol errors, and app-local OS/file commands:
  - `canvas_health`
  - `scene_save`
  - `scene_load`
- The full app command bridge exposes:
  - `canvas_health`
  - `scene_create`
  - `scene_list`
  - `scene_get`
  - `scene_archive`
  - `scene_node_add`
  - `scene_node_remove`
  - `scene_save`
  - `scene_load`
- `apps/canvas/src/commandBridge.ts` exposes a typed bridge for browser preview
  and desktop runtime. Scene mutations compose public `@beep/canvas-server` and
  `@beep/canvas-use-cases` contracts so app command tests exercise the
  domain-backed slice path without importing private implementation files.
  Tauri is used for app health and app-local JSON file IO.
- `apps/canvas/src/App.tsx` provides the bootstrap `@beep/ui` shell with health,
  scene list/detail, create/archive, add/remove node, and save/load controls.

## Contract Proof

`apps/canvas/test/commandBridge.test.ts` proves:

- health returns deterministic app identity fields,
- create/list/get roundtrip works,
- node add/remove works,
- save/load works through the app command bridge contract,
- missing scene failures translate to public command errors.
- desktop/native bridge mode keeps scene mutations in the public use-case
  service and calls Tauri only for `canvas_health`, `scene_save`, and
  `scene_load`.

`apps/canvas/src-tauri` Rust unit tests prove:

- local JSON paths are confined to relative `.json` file names under Tauri
  `app_data_dir()/scenes`,
- invalid scenes return typed command errors,
- save/load storage roundtrips through the app-data storage path helper used by
  the native commands.

Existing focused package tests also prove:

- domain aggregate invariants in `@beep/canvas-domain`,
- use-case translation from domain/repository failures to public failures,
- server protocol handler mapping in `@beep/canvas-server`.

## Verification

Commands run:

- `cd apps/canvas && bun run check`
- `cd apps/canvas && bun run test`
- `cd apps/canvas && bun run lint`
- `cd apps/canvas && bun run build`
- `cd apps/canvas/src-tauri && cargo check`
- `cd apps/canvas/src-tauri && cargo test`
- `bunx turbo run check --filter=@beep/canvas --filter=@beep/canvas-domain --filter=@beep/canvas-use-cases --filter=@beep/canvas-server --filter=@beep/canvas-client --filter=@beep/canvas-ui`
- `bunx turbo run test --filter=@beep/canvas-domain --filter=@beep/canvas-use-cases --filter=@beep/canvas-server --filter=@beep/canvas`
- `bunx turbo run build --filter=@beep/canvas --filter=@beep/canvas-domain --filter=@beep/canvas-use-cases --filter=@beep/canvas-server --filter=@beep/canvas-client --filter=@beep/canvas-ui`
- `bunx turbo run lint --filter=@beep/canvas --filter=@beep/canvas-domain --filter=@beep/canvas-use-cases --filter=@beep/canvas-server --filter=@beep/canvas-client --filter=@beep/canvas-ui`
- `cd apps/canvas && timeout 12s bun run dev -- --host 127.0.0.1`
- `curl -fsS http://127.0.0.1:1422/ | head -n 5`

Result:

- All focused package gates passed.
- `cargo check` passed for the Tauri app.
- `cargo test` passed for the Tauri app (`3 passed`).
- Vite dev server started on `http://127.0.0.1:1422/` and served the app shell.
- Vite build emitted existing Tailwind/lightningcss unknown at-rule warnings and
  a chunk-size warning, but exited successfully.
- `cargo fmt --check` could not run because `cargo-fmt` is not installed for the
  active Rust toolchain.

## Boundary Scans

Targeted scans were run for:

- stale canvas config/table symbols,
- stale architecture-lab worker symbols accidentally copied into canvas,
- private canvas `src` or `internal` imports from the app/slice/docs surface.

Result:

- No stale canvas config/table symbols were found.
- No private canvas implementation imports were found in the app or slice source.
- Remaining scan hits were existing architecture-lab path aliases and docgen
  source-map metadata, not canvas boundary violations.
