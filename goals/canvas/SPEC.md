# @beep/canvas Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-16
- **Updated:** 2026-05-16

## Mission

Bootstrap a runnable `@beep/canvas` desktop application and slice packages with a
small, coherent, architecture-first feature surface that is compatible with the
full `goals/canvas/PRD_REFERENCE.md` later.

## Scope

### In Scope (Bootstrap Surface)

- Create a Tauri 2 + React app shell at `apps/canvas` (`@beep/canvas`) with:
  - startup health bridge
  - scene list/detail views
  - one-command scene mutation path (create/list/get/archive)
  - one-command scene-node mutation path (add/remove node metadata)
  - local JSON save/load command bridge
- Complete the `canvas` slice package shape:
  - `packages/canvas/domain`
  - `packages/canvas/use-cases`
  - `packages/canvas/server`
  - `packages/canvas/client`
  - `packages/canvas/ui` (minimal screen-ready exports)
- Wire package exports, public subpaths, and workspace path aliases so:
  - `@beep/canvas-domain`
  - `@beep/canvas-use-cases`
  - `@beep/canvas-server`
  - `@beep/canvas-client`
  - `@beep/canvas-ui`
  are import-safe for downstream browser and server consumers.
- Implement schema-first aggregate + contracts (`S.Class`, `TaggedErrorClass`,
  command/query DTOs) and boundary-safe error translation chain
  (domain → use-case → protocol/client).

### Out of Scope (P0/P1)

- Full feature parity with the PRD inventory (AI generation, full editing toolbar
  parity, advanced filters, exports, collaboration, recovery/sync, vector
  backends).
- Real-time collaborative scene editing.
- Platform-specific distribution, signing, and auto-update.
- Persisted Postgres-backed storage (in-memory/JSON-backed local persistence only
  for bootstrap).

## Non-Negotiable Architecture Contracts

1. **Slice ownership**: `canvas` behavior stays in the slice packages:
   `domain`, `use-cases`, `server`, `client`, `ui`.
2. **Driver rule**: external or system integration in `drivers` only; no driver
   logic in slice `domain`/`use-cases`.
3. **Boundary translation**: all failures translated per
   `standards/architecture/09-errors-across-boundaries.md`.
4. **Effect boundaries**: `domain` imports are schema/runtime language only,
   no side effects; `use-cases` are contracts and policies; `server` is adapter
   + infrastructure composition.
5. **Layer locality**: package-local layers only in slice package(s), app-level
   runtime composition in `apps/canvas` where needed.
6. **UI baseline**: `@beep/ui` for primitives/theme; product screens remain in
   app or slice `ui`.
7. **Tauri command policy**: app shell exposes explicit command surface (`health`,
   `scene` ops, persistence ops), not generic ad-hoc command strings.
8. **PRD alignment**: where this initiative omits PRD features, defer intentionally
   with explicit evidence in PLAN and per-phase Exit Criteria.

## Canonical Topology

- **App path:** `apps/canvas`
- **Package names:** `@beep/canvas*`
- **Primary aggregate (bootstrap):** `CanvasProject` (as scene container concept)
- **Bootstrap node concept:** `CanvasNode` metadata entries inside a scene payload
  (initially non-rendering metadata model).
- **Primary shell command contract:** scene and local scene-file persistence commands.

## Validation & Exit Standards

Each phase exits only when:

- contracts are documented in SPEC/PLAN updates,
- schema-first exports compile under repo path/alias checks,
- tests/quality checks for touched packages pass for the claimed scope,
- no unresolved architecture boundary violations remain unwaived.

### Exit Criteria by PRD Alignment

- **P0:** Initiative packet exists and defines bootstrap-surface reduction from PRD.
- **P1:** Tauri shell and slice package topology compiles and runs in dev build.
- **P2:** A verified minimal command surface exists end-to-end (app -> Tauri ->
  app command layer -> use-cases -> domain) with explicit error translation tests.
- **P3:** Proof checkpoint is captured in `history/` and initiative manifest points to
  the next phase with deferred PRD backlog.
