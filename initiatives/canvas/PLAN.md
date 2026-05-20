# @beep/canvas Implementation Plan

## Status

This plan executes [SPEC.md](./SPEC.md) for bootstrap only.

## A. Preflight Review (Architectural Convergence)

- [x] Read `initiatives/canvas/PRD_REFERENCE.md` and map bootstrap scope.
- [x] Read `standards/ARCHITECTURE.md`, `standards/architecture/01-..`, `04-..`, `05-..`, `06-..`, `09-..`, `13-..`.
- [x] Inspect current `packages/canvas/*` and `apps/canvas` state:
  - existing scaffold is synthetic and inconsistent with architecture conventions
    (missing concept files, stale exports, incomplete role coverage),
  - `apps/canvas` exists but has only placeholder `src/index.ts`.
- [x] Capture all architecture corrections in this plan before declaring P0 complete.

## B. Scope Gate: Bootstrap Surface Lock

Lock the first implementation surface to the following user stories:

1. As a user, I can create a scene/project in the app shell and see a list entry.
2. As a user, I can open a scene and add/update/remove lightweight node metadata.
3. As a user, I can save scene state and load it back through a Tauri command bridge.
4. As a developer, I can call a health check command in `apps/canvas` and get a
   typed, deterministic payload.

Everything else remains explicitly deferred with explicit `Defer:*` tags in issue backlog.

## C. Phase 0 — Slice Shape & Contract Repair

Goal: make the `canvas` packages internally coherent and schema-first before the Tauri shell lands.

### C.1 Domain layer recovery

- Validate and normalize existing aggregate/contracts:
  - keep `CanvasProject` aggregate with explicit scene metadata model in
    `packages/canvas/domain/src/aggregates/CanvasProject`.
  - add/confirm a minimal `CanvasNode` value-object model (or typed object shape)
    under the same aggregate package.
- Ensure `domain/src` exports only canonical concept files:
  - `/identity`
  - `/aggregates`
  - domain exports for slice-owned value objects.
- Add/repair tests for:
  - create/get/list state transitions,
  - invalid transitions and typed domain errors.

### C.2 Use-cases and protocol contracts

- Split command/query/port/service roles in
  `packages/canvas/use-cases/src/aggregates/CanvasProject`.
- Ensure public action shapes are client-safe in `/public`.
- Ensure server-only port + repository contracts are only under `/server`.
- Add translation tests for:
  - domain failure -> public failure
  - repository failure -> public failure

### C.3 Server layer repair

- Implement server-side repository contracts and handlers:
  - repository in-memory implementation for bootstrap,
  - protocol handlers (`.http.ts`, `.rpc.ts`, `.tools.ts`) with consistent error translation.
- Add slice-level `/layer` export for `@beep/canvas-server/layer`.
- Fix package exports and remove references to non-existent modules.

### C.4 Package boundary & workspace wiring

- Repair package-level exports and tsconfig alias gaps:
  - `@beep/canvas-domain`, `@beep/canvas-use-cases`, `@beep/canvas-server`,
    `@beep/canvas-client`, `@beep/canvas-ui`.
- Verify consumers for:
  - `apps/canvas` package alias,
  - test/dtslint consumers (no private import path leaks).
- Add/update `app` entry points for `@beep/canvas` to expose at least:
  - `VERSION`
  - root `index` module for shell import shape.

### C.5 Exit Criteria for P0

- [x] All `canvas` package exports are present and align with current files.
- [x] No imports reference non-existent canvas subpath modules.
- [x] All checked contract tests in touched packages pass.
- [x] Manifest shows phase status as “P0 complete”.

## D. Phase 1 — App Shell + Bridge

Goal: ship a runnable shell with typed Tauri command bridges.

### D.1 Tauri shell and frontend host

- Create Rust side in `apps/canvas/src-tauri`:
  - `Cargo.toml`
  - `src/main.rs`
  - `src/lib.rs`
  - `tauri.conf.json`
  - `build.rs` if needed for release asset flow.
- Add a minimal React entry:
  - `src/main.tsx`
  - `src/App.tsx` (bootstrap scene list/detail controls)
- Add static shell files:
  - `index.html`
  - `vite.config.ts`

### D.2 Command surface

- Add command handlers:
  - `canvas_health`
  - `scene_create`
  - `scene_list`
  - `scene_get`
  - `scene_archive`
  - `scene_node_add`
  - `scene_node_remove`
  - `scene_save`
  - `scene_load`
- Add typed request/response models in app-local command bridge module.

### D.3 Build/test path

- Ensure local shell command path is runnable via:
  - app check/build,
  - `bun run build` for packages in scope,
  - `turbo` package-limited checks for `@beep/canvas*`.
- Add browser-safe fallback if invocation is not available in test runtimes.

### D.4 Exit Criteria for P1

- [ ] `apps/canvas` starts successfully with `bun run dev` (or documented equivalent).
- [ ] Tauri command invocations return typed responses and map through command contracts.
- [ ] Health/status command proves app identity and returns deterministic fields.

## E. Phase 2 — Minimal End-to-End Contract Proof

Goal: confirm the app + command layer + use-cases + domain contract is coherent.

### E.1 End-to-end path

- App command triggers -> Rust command -> client contract -> server service -> domain
  behavior -> typed response.
- Exercise at least:
  - create scene,
  - add/remove node metadata,
  - persist + restore.

### E.2 Boundary failure proof

- Add focused tests for each boundary:
  - protocol translation (command layer),
  - use-case translation (port failures to public failures),
  - domain invariant enforcement.

### E.3 PRD-deferral register

- Publish deferred PRD features backlog in:
  - `history/outputs/p1-prd-deferrals.md` (new),
  - or equivalent handoff/historical artifact.

### E.4 Exit Criteria for P2

- [ ] At least one full create/modify/save/load roundtrip works end-to-end.
- [ ] Boundary translation tests pass.
- [ ] PRD-deferral list is explicit and reviewable.

## Gates and Checks

Run in this order before phase declaration:

1. `bun run check --filter @beep/canvas-domain @beep/canvas-use-cases @beep/canvas-server @beep/canvas-client @beep/canvas-ui`
2. `bun run test --filter @beep/canvas-domain @beep/canvas-use-cases @beep/canvas-server`
3. `bun run lint --filter @beep/canvas-domain @beep/canvas-use-cases @beep/canvas-server`
4. `cd apps/canvas && bun run build`
5. `cd apps/canvas && bun run build` (post shell changes)
6. `cd apps/canvas/src-tauri && cargo check`

No later-phase implementation before both P0 and P1 exit criteria are met.
