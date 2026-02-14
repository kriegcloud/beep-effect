# DX/UX Critical Refactor Plan (2026-02-04)

Status: Draft  
Owner: SDK  
Scope: Critical DX/UX issues from GitHub (P0/P1 + bug)  

## Current Status (branch)
- Implemented locally, needs verification + issue closure:
  - #28 fail-fast credentials
  - #26 quick-start `run` / `streamText`
  - #34 ConflictPolicy wired into sync flow
  - #29 hook constructors + builder
  - #31 Tool.define / Tool.fn / Toolkit.fromHandlers
- In progress:
  - #23 one-liner remote sync DX (Sync.withRemoteSync helper + conflict policy wiring)
  - #24 targeted sync module refactors (EventLogRemoteServer, SyncService mailbox, compaction, conflict indexing, audit logging)

## Recent Progress (2026-02-04)
- Added `Sync.withRemoteSync(url, options)` and conflict policy plumbing.
- Sync module cleanup:
  - EventLogRemoteServer: effectful URL builder + port 0 test server (TOCTOU fix).
  - SyncService: mailbox wrapping uses `Mailbox.fromStream` to preserve semantics.
  - EventJournalKeyValueStore: indexed conflict lookup + single sort per batch.
  - Compaction: `compactEntries` uses last bracket; `bySize` strictly respects maxBytes.
  - SyncAuditEventStore: audit failures now logged instead of swallowed.

## Goals
- Ship a fail-fast, actionable error path for missing credentials (API key + session token).
- Provide zero-config entry points for fast onboarding (`run`, `streamText`).
- Wire ConflictPolicy into the sync flow (bug fix).
- Deliver high-impact DX improvements (hooks builder + Tool.define).
- Stabilize sync helpers and eliminate obvious duplication/edge cases.

## Non-Goals
- Full Cloudflare deployment automation.
- Browser replica storage or offline authoring.
- Large refactors like `Effect.Service` migration (P3).

## Issues in Scope (Priority)
P0 / Bug
- #28: Fail-fast on missing credentials with actionable errors.
- #34: ConflictPolicy exists but is never wired into sync flow.
- #26: Zero-config quick-start entry points (run, streamText).

P1
- #29: Event-specific hook constructors + fluent builder.
- #31: Tool.define() single-expression tool creation.
- #23: One-liner remote sync setup (partially addressed by `AgentRuntime.layerWithRemoteSync`).

P2/P3 (deferred unless needed)
- #24: Code quality fixes in sync modules (selective fixes after P0/P1).
- #32: Consolidate Storage.layers() single entry point.
- #41: Context.Reference for optional services.
- #40: Migrate to Effect.Service.

## Dependencies / Ordering
- #28 should land before #26 (quick-start should surface actionable errors).
- #34 must land before deeper sync refactors (#24).
- #23 depends on #26 (new entry points) or should be aligned with them.

## Source Inputs Reviewed (2026-02-04)
- #28: Must fail fast, list all fixes (env var, `claude login`, config), include docs link, cover API key + session token.
- #34: `ConflictPolicy` implemented but never used; wire into `EventJournalKeyValueStore.writeFromRemote`, include default layer, call `SyncAudit.conflict`.
- #26: `run()` returns result Promise; `streamText()` returns AsyncIterable<string>; no Effect knowledge required; errors surface as JS errors.
- #29: Event-specific hook constructors + `Hooks.tap` + `Hooks.builder` for fluent API.
- #31: `Tool.define()` / `Tool.fn()` + `Toolkit.fromHandlers()` to reduce boilerplate.

## Phase Plan

### Phase 0 — Verify + Close P0s
- Run typecheck + targeted tests for #26, #28, #34, #29.
- Close issues once verified; update docs/plan/README if needed.

### Phase 1 — P0 Criticals
- Implement #28 fail-fast credential validation.
  - Update `AgentSdkConfig` (and `SessionConfig` if needed) to fail with `ConfigError`.
  - Error message must enumerate fixes: env var, `claude login`, config override; include docs link.
  - Ensure API key + session token paths are covered.
  - Tests: missing creds fails immediately with actionable error text.
- Implement #26 quick-start entry points.
  - `run(prompt, options?)` returns a Promise of result (no Effect knowledge).
  - `streamText(prompt, options?)` yields assistant text chunks as AsyncIterable.
  - Errors surface as JS errors (no Effect types required).
  - README: include 2-line example for `run` and streaming snippet.

### Phase 2 — Bug Fix
- Implement #34 wiring ConflictPolicy into `EventJournalKeyValueStore.writeFromRemote`.
  - Ensure audit hooks still fire.
  - Add unit tests for conflict policies (last-write-wins, reject, merge).
  - Default layer includes `ConflictPolicy.layerLastWriteWins`.

### Phase 3 — P1 DX Improvements
- Implement #29 hooks builder + event-specific constructors.
  - Add `Hooks.onPreToolUse`, `Hooks.tap`, and `Hooks.builder()`.
- Implement #31 Tool.define / Tool.fn.
  - Preserve type inference and compatibility with Toolkit.
- Address #23 one-liner sync DX.
  - Decide: add `Sync.withRemoteSync` alias or update issue to point at `AgentRuntime.layerWithRemoteSync`.

### Phase 4 — Targeted Refactors
Selective fixes from #24 that reduce risk or remove obvious issues:
- Replace `Date.now()` with `Clock.currentTimeMillis`.
- Resolve `ConflictPolicy` reduce-on-empty edge cases.
- Fix `Compaction` asymmetries if they cause behavior bugs.
- Reduce duplication in StorageLayers where safe.

## Deliverables
- Updated runtime APIs with quick-start helpers.
- ConflictPolicy wired into sync flow with tests.
- Hook builders + Tool.define for DX.
- Updated docs (README + spec alignment).
 - Typecheck + targeted tests run per phase.

## Risks & Mitigations
- **Breaking changes:** Keep new APIs additive; avoid changing existing signatures.
- **Config behavior changes:** Guard defaults; provide explicit errors for missing creds.
- **Sync regressions:** Add unit tests for conflict resolution and remote writes.

## Acceptance Checklist
- [ ] Missing API credentials fail immediately with actionable error.
- [ ] `run()` and `streamText()` work without Effect knowledge.
- [ ] ConflictPolicy resolves conflicts in sync flow.
- [ ] Hooks builder and Tool.define are type-safe and backward compatible.
- [ ] Sync one-liner story is clear (alias or documented primary entry point).
 - [ ] `bun run typecheck` succeeds after each phase.
