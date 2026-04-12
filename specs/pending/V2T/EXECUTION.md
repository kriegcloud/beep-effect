# V2T - P3 Execution

## Status

COMPLETED

## Execution Objective

Implement the first committed V2T slice in `apps/V2T`, `packages/VT2`, `@beep/infra`, and their supporting seams without widening scope beyond the contracts locked in `RESEARCH.md`, `DESIGN_RESEARCH.md`, and `PLANNING.md`.

## Phase Agent Role

The session working P3 is the execution orchestrator.

The orchestrator owns:

- the local implementation plan for the approved slice
- the decision to keep urgent work local or partition bounded worker scopes
- integration of every worker patch before it becomes accepted phase output
- the execution record, gate evidence, and deviation log
- the P3 exit call

Workers may implement bounded parts of the approved slice, but they do not own scope changes, final integration, gate closure, or the right to silently advance into verification.

## Orchestration-First Workflow

1. Re-read the prior phase artifacts and restate the approved implementation slice.
2. Decide which immediate blocking work the orchestrator should keep local.
3. Partition only the remaining parallelizable implementation work into disjoint write scopes.
4. Require every worker to return results with explicit commands, findings, and residual risks.
5. Review and integrate each worker result before treating it as accepted.
6. Run the required targeted and repo-law gates, or record why a required gate is blocked.
7. Update `EXECUTION.md` with concrete evidence and stop at the P3 exit gate.

## Mandatory Conformance Inputs

P3 execution must actively apply:

- `AGENTS.md`
- the `effect-first-development` and `schema-first-development` skills when available in-session
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `infra/package.json`
- root `package.json`, root `turbo.json`, `apps/V2T/package.json`,
  `apps/V2T/turbo.json`, `packages/VT2/package.json`, and
  `packages/VT2/turbo.json` for live workspace package names, task
  availability, and command-truth checks

## Evidence Recording Rules

- Do not claim a gate passed unless the exact command result is recorded in this document.
- Distinguish `passed`, `failed`, `blocked`, `not run`, and `not applicable`; do not collapse them into generic prose.
- Worker-reported command results are provisional until the orchestrator reviews and accepts them.
- Record deviations from `PLANNING.md` as soon as they occur, not only at the end of the phase.
- If a broader repo-law command is skipped, explain why it was not applicable or why the phase remains blocked.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, whether `get_episodes` fallback was attempted and what it returned,
  fallback used, and any durable writeback or queued session-end summary using
  `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## Required Outcomes

- replace the placeholder app shell with the agreed workflow
- persist projects, sessions, transcripts, composition packets, and export artifact records
- implement the typed native desktop bridge or record the exact blocker that prevents it from being part of the slice
- keep that bridge as one authoritative contract derived from the Rust command and event surface
- implement resilient direct capture with recover or discard behavior and explicit interruption or backpressure state, or record the exact blocker that pushes it back
- unify record and import into the same session and artifact pipeline
- persist user-level capture, composition, and recovery defaults separately from project and run records
- extend the existing `@beep/VT2` control plane unless a deliberate migration is explicitly documented
- keep `@beep/infra` as the canonical workstation/deployment seam when the approved slice touches installer or deployment behavior
- keep all external providers behind explicit adapters
- reuse shared repo primitives where they already fit
- document every meaningful deviation from `PLANNING.md`

## Execution Rules

- use effect-first and schema-first patterns
- model pure data schema-first and keep failure/absence typed
- keep exported APIs and examples docgen-clean
- prefer typed errors and explicit service boundaries
- do not let React components own provider-specific logic
- do not let React components own authoritative direct-capture buffers or recovery state
- keep the native shell authoritative for raw direct-capture control, chunk or segment durability, interruption discovery, and recover or discard actions while the sidecar owns canonical session metadata and downstream artifact indexing after intake
- do not invent an app-local server path if the current `packages/VT2` sidecar seam can carry the slice
- do not invent a second installer or deployment path if the current `@beep/infra` seam can carry the slice
- keep the first-slice desktop UX to one main workspace window, native file dialogs, and at most one focused capture or recovery surface; settings and review stay in the main workspace
- stop at the first-slice boundary instead of slipping into speculative polish
- capture command results and touched surfaces in this document as work progresses
- do not claim a gate passed unless the concrete command result is recorded here

## Required Conformance Gates During P3

### Targeted Implementation Floor

- `bunx turbo run check --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`
- `bun run --cwd infra lint`

### Repo Law Gate

- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`

### Exported API Gate

- `bun run docgen` when exported APIs or JSDoc examples changed

Important note:

- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be evidenced through the repo-law commands above
- `@beep/infra` is a live package with package-local `check`, `test`, and `lint` scripts, so installer-surface work must keep those commands truthful in both code and docs
- `@beep/v2t` is the live app package name even though the folder is
  `apps/V2T`, so re-check filter casing from the manifest before editing the
  command matrix

## Required Review Loop During P3

- after each meaningful merge wave, run a read-only review pass
- if the reviewer finds substantive issues, fix them and rerun review
- do not close P3 while the latest review wave still contains unresolved
  substantive findings

## Execution Record Template

### Implemented Surfaces

- `packages/VT2/src/domain.ts`, `protocol.ts`, `client.ts`, and `services.ts`
  - added schema-first memory-context, composition-run, and export-request contracts, kept provider seams explicit, and moved the default transcript seam to the local provider path
- `packages/VT2/src/Server/index.ts`
  - added sqlite-backed session mutations for native capture start, capture completion, interruption-driven recovery candidates, recover or discard resolution, memory-context packet persistence, composition-run persistence, local export artifact materialization, and a local Whisper transcript adapter that promotes sessions into `transcribing`, `review-ready`, or `failed`
- `apps/V2T/src-tauri/src/lib.rs`
  - added managed native capture state, Linux microphone capture via `ffmpeg`, durable draft artifact writes under the app data directory, native commands for start or stop or interrupt capture plus recover or discard, and the typed `v2t://capture-state-changed` event
- `apps/V2T/src/native.ts` and `apps/V2T/src/components/workspace-shell.tsx`
  - added typed capture-state schemas, native bridge helpers, event subscription, direct-capture controls, recovery actions, composition-run triggers, and workspace views for memory packets, run history, and export artifacts
- `apps/V2T/src/native.test.ts` and `packages/VT2/test/VT2Contracts.test.ts`
  - added coverage for the native capture payload contract plus the new VT2 composition, memory-context, export-oriented control-plane inputs, and the local transcript-provider default

### Commands Run

- `passed` `bunx turbo run check --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `passed` `bunx turbo run test --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `passed` `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `passed` `bun run --cwd apps/V2T lint`
- `passed` `bun run --cwd infra lint`
- `passed` `bun run lint:jsdoc`
- `passed` `bun run check:effect-laws-allowlist`
- `passed` `bun run lint:schema-first`
- `passed with warnings` `bun run lint:effect-laws`
  - command exited successfully with repository-wide warning-only findings outside the touched V2T slice
- `passed` `bun run docgen`
- `passed` `bun run check`
- `passed` `bun run lint`
  - the final readiness pass required a verification-driven cleanup: add `cspell` hints for the embedded Whisper script and provider error reason, then remove generated `apps/V2T/src-tauri/target` outputs before rerunning `typos`
- `passed` `bun run test`
- `passed` `git diff --check -- apps/V2T packages/VT2 standards/schema-first.inventory.jsonc`
- `passed (prior local execution wave)` `cargo check --manifest-path apps/V2T/src-tauri/Cargo.toml`
- `passed (prior local execution wave)` `bun run --cwd apps/V2T build:sidecar`
- `passed (prior local execution wave)` `bun run --cwd apps/V2T build:native`

### Delegation Register

- no sub-agent delegation used for this capture and recovery slice

### Graphiti And Repo-Truth Notes

- Graphiti recall attempted with query `V2T VT2 native tauri capture recovery sidecar next phase`
- Graphiti recall failed with `Error searching facts: RediSearch: Syntax error at offset 16 near beep`
- fallback used: repo-local skill guidance, live code inspection, and the current VT2 and V2T package seams
- durable writeback should summarize the native capture lifecycle slice, the local Whisper transcript integration, the verification-driven lint cleanup, and the remaining provider/runtime caveats

### Conformance Evidence

- The native shell remains the owner of raw direct-capture control, draft artifact durability, interruption discovery, and recover or discard actions.
- The VT2 sidecar remains the owner of canonical session metadata and downstream artifact indexing after intake.
- Record and import still share the same session and artifact pipeline; capture-specific controls are only exposed for record sessions.
- The first-slice desktop topology remains one main workspace window with native dialogs and no extra always-on review window.
- The transcript seam now defaults to the local provider path and is implemented behind the VT2 transcript adapter boundary rather than synthesized from capture metadata.
- Memory-context packets, composition runs, and export artifact records are now persisted by the VT2 sidecar instead of remaining UI-only placeholders.
- Local export files are materialized under the selected session workspace or the VT2 app-data export directory while staying behind explicit memory, composition, and export service seams.
- Exported VT2 contracts remain schema-first and docgen-clean, and the existing service-boundary interfaces in `packages/VT2` remain tracked as schema-first inventory exceptions instead of unregistered findings.

### Deviations From Plan

- Verification surfaced two non-behavioral readiness blockers after the implementation landed: `cspell` misses from the embedded Whisper script and provider-reason literal, and `typos` noise from generated Rust `target/` artifacts after a native-build wave. Both were addressed before the final readiness rerun.
- Repo-wide `lint:effect-laws` and `lint:jsdoc` both passed with existing warning-only findings outside the touched VT2/V2T slice; those warnings were not introduced by this work.

### Residual Risks

- The local transcript provider depends on a Python runtime that can import `openai-whisper`, either through `BEEP_VT2_TRANSCRIPT_PYTHON_BIN`, the app-data provider venv, or a compatible `python3` on `PATH`.
- The first slice still stores transcript excerpt metadata on the session resource rather than persisting a richer speaker/timing transcript artifact body.
- Memory retrieval now uses a local-first seam packet rather than a live Graphiti-backed retrieval adapter, so the provider boundary is exercised but upstream Graphiti integration is still deferred.
- Repo-wide lint remains sensitive to generated `apps/V2T/src-tauri/target` outputs because `typos` scans those filenames unless the build artifacts are cleaned before the broader lint gate.

## Stop Conditions

- Stop if implementation would widen scope beyond the approved first slice.
- Stop if worker write scopes begin to overlap or integration reveals conflicting assumptions.
- Stop if a required gate fails and the failure is not resolved inside P3.
- Stop if execution uncovers a product or architecture contradiction that belongs back in P1 or P2.
- Stop once the approved slice is implemented and evidenced; do not silently start P4.

## Exit Gate

P3 is complete only when the committed slice exists in code, the required targeted and repo-law evidence is recorded here with concrete results, deviations are explicit, and this document clearly separates shipped behavior from deferred work without making a readiness claim on P4's behalf.
