# V2T - P0 Research

## Status

COMPLETED

## Objective

Ground the V2T PRD against current repo reality and classify which product claims are already supported by existing surfaces, which require new implementation, and which must remain explicit provider seams.

## Phase Agent Role

The session working P0 is the research orchestrator.

The orchestrator owns:

- the read order and local research plan
- the first-pass repo inspection for blocking questions
- any decision to delegate and the exact worker scopes
- integration of worker findings into the canonical research narrative
- the locked-decision record for newly settled P0 assumptions
- the P0 exit call

Sub-agents may help with bounded scouting or auditing, but they do not own phase closure, scope expansion, or decision locking by implication.

## Orchestration-First Workflow

1. Read the mandatory conformance inputs, preserved product inputs, and current repo seams before drawing conclusions.
2. Form a local list of open questions, contradictions, and repo facts to verify directly.
3. Inspect the immediate blocking repo surfaces yourself before delegating.
4. Delegate only bounded read-only scouting or audit work that can run in parallel without changing the P0 objective.
5. Integrate worker findings into one orchestrator-owned research synthesis.
6. Record which claims are confirmed repo facts, which are product ambitions, and which remain deferred or unresolved.
7. Stop at the P0 exit gate instead of drifting into P1 design work.

## Mandatory Conformance Inputs

P0 must read and cite the live repo-law inputs that constrain later phases:

- `AGENTS.md`
- the `effect-first-development` skill when available in-session
- the `schema-first-development` skill when available in-session
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `infra/package.json`
- root `package.json`, root `turbo.json`, `apps/V2T/package.json`,
  `apps/V2T/turbo.json`, `packages/VT2/package.json`, and
  `packages/VT2/turbo.json`

## Source Inputs

- `outputs/v2t_app_notes.html`
- `outputs/V2_animination_V2T.md`
- `apps/V2T`
- `packages/VT2`
- `infra/Pulumi.yaml`
- `infra/package.json`
- `infra/src/internal/entry.ts`
- `infra/src/V2T.ts`
- `infra/scripts/v2t-workstation.sh`
- `infra/test/V2T.test.ts`
- `apps/V2T/scripts/build-sidecar.ts`
- `packages/common/ui/src/components/speech-input.tsx`
- root `package.json`
- Graphiti operational scripts and commands

## Evidence Rules

- Every repo-grounded claim should be traceable to a live file, script, package manifest, or command surface.
- Command or task claims belong in P0 only when they are verified against the live workspace, not inherited from assumption or naming symmetry.
- Worker findings are inputs to the orchestrator, not authoritative phase closure evidence on their own.
- Separate confirmed repo facts from PRD ambition and from deferred provider behavior.
- If ambiguity remains meaningful after repo inspection, record it explicitly or route it through `grill-me`; do not silently resolve it.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, whether `get_episodes` fallback was attempted and what it returned,
  fallback used, and any durable writeback or queued session-end summary using
  `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## PRD Synthesis

The preserved PRD describes V2T as a local-first conversation-to-content workflow:

1. record a conversation
2. transcribe and enrich it
3. review a structured document
4. configure animation style and dialogue mode
5. generate long-form or short-form outputs

The product promise is not just transcription. It is transcript plus context, memory, composition control, and export-ready media packaging.

## Repo-Grounded Findings

### Existing Surfaces

- `apps/V2T` already exists as a dedicated workspace with Vite, Vitest, and Tauri wiring.
- The current route tree renders a placeholder `TwoTvPage`, so the app shell exists but the product workflow does not.
- `apps/V2T/src-tauri/src/lib.rs` already manages native sidecar launch, health polling, stderr capture, and packaged-versus-dev mode detection, so the repo already has a meaningful native app-shell seam instead of only a browser-like shell.
- `apps/V2T/vite.config.ts` already proxies `/api` to `https://v2t-sidecar.localhost:1355`, which is the natural sidecar seam for local-first services.
- `packages/VT2` already exists as a SQLite-backed Effect sidecar package with a typed control-plane protocol in `packages/VT2/src/protocol.ts` and runtime wiring in `packages/VT2/src/Server/index.ts`.
- `apps/V2T/scripts/build-sidecar.ts` and `apps/V2T/scripts/dev-with-portless.ts` already compile and run the `packages/VT2` sidecar for the app shell.
- `packages/common/ui/src/components/speech-input.tsx` already provides a reusable recording and transcript-preview UI primitive backed by the repo's speech hooks.
- Root Graphiti commands and recovery/proxy scripts already exist, so memory infrastructure is a repo-native capability rather than an external afterthought.
- `infra` already exists as the live `@beep/infra` workspace, with `infra/Pulumi.yaml` as the Pulumi project, `infra/src/internal/entry.ts` as the stack entrypoint, `infra/src/V2T.ts` as the `V2TWorkstation` component boundary, and `infra/scripts/v2t-workstation.sh` as the concrete workstation reconciler.

### Cap Comparison Findings

- A comparative pass over the cloned Cap desktop app found a strong typed native-bridge pattern: Cap generates a TypeScript command and event client in `apps/desktop/src/utils/tauri.ts` from its Rust Tauri command surface in `apps/desktop/src-tauri/src/lib.rs`, which keeps desktop-only capabilities explicit and typed.
- Cap treats direct capture as a failure-prone workflow rather than a best-effort file save. Its `apps/web/app/(org)/dashboard/caps/components/web-recorder-dialog/recording-spool.ts` persists chunks, models backpressure, and supports recovery of already-persisted plus in-memory data when writes fail.
- Cap exposes crash recovery as first-class UX. `apps/desktop/src/components/RecoveryToast.tsx` and `apps/desktop/src-tauri/src/recovery.rs` surface incomplete recordings, recover/discard actions, and follow-up editor opening instead of burying interrupted capture behind generic errors.
- Cap persists user-level desktop defaults and recent UI state separately from project data through `apps/desktop/src/store.ts`, `apps/desktop/src/utils/general-settings.ts`, and multiple `makePersisted(...)` UI states, which makes its desktop workflow reopen predictably without conflating preferences with project artifacts.
- Cap converges recording and import into the same downstream project flow. Its typed native bridge includes both capture controls and import readiness checks, which is a useful model for V2T's first slice because it avoids splitting recorded and imported conversations into separate product pipelines.
- Cap also verifies failure paths directly. Its spool tests cover chunk ordering, backpressure, recovery, and cleanup, while its desktop scripts include a memory-soak harness for stability work. V2T does not need Cap's full test suite immediately, but it should copy the posture that desktop failure modes are spec-visible and testable.

### Installer Findings

- The installer target is one local Debian/Ubuntu workstation with an existing `beep-effect` checkout and one sudo-capable desktop user.
- The native install path should stay on `apps/V2T` and `packages/VT2`, building the Tauri Debian package locally from the existing checkout instead of cloning or inventing a second runtime path.
- The live Pulumi project name is `beep-effect-v2t-workstation`, its entrypoint is `infra/src/internal/entry.ts`, and the stack namespace is `v2t` via `loadV2TWorkstationStackArgs()`.
- The local Pulumi backend default is `file://<repoRoot>/.pulumi-local/v2t-workstation`, exposed through the package-local `pulumi:login:local`, `stack:init:local`, `preview`, `up`, `destroy`, and `refresh` scripts in `infra/package.json`.
- SQLite remains embedded in the existing `packages/VT2` sidecar runtime, so the workstation automation should not add a separate SQLite service.
- The local Qwen service can stay secret-light because `Qwen/Qwen2-Audio-7B-Instruct` is publicly downloadable; a Hugging Face token is optional for authenticated pulls and rate limits, not a baseline requirement.
- The repo already uses `op run` as local operator convenience, and `infra/src/OnePassword/Config.ts` only models partial OnePassword Connect config, so V2T should treat `1Password` as optional secret injection instead of a required platform dependency.
- Upstream Graphiti MCP documentation currently requires an external LLM API key at the server boundary, so Graphiti provisioning is not actually secret-free even when FalkorDB and the MCP server run locally in Docker.
- `infra/test/V2T.test.ts` already proves two key installer truths: config normalization applies the workstation defaults and Graphiti-enabled installs reject missing LLM secrets.

### Conformance Findings

- The eventual implementation must follow effect-first and schema-first repo law rather than ad-hoc TS or React-only patterns.
- The spec must explicitly reference `.patterns/jsdoc-documentation.md` because exported APIs and examples are expected to stay docgen-clean.
- `infra/package.json` is a live command-truth source for workstation and deployment surfaces, and it already defines package-local `check`, `test`, `lint`, and Pulumi operator scripts.
- `apps/V2T/package.json` is currently `@beep/v2t`, while
  `packages/VT2/package.json` is `@beep/VT2`, so command filters must use live
  manifest names instead of folder casing.
- `@beep/VT2` does not currently define a package-local `lint` or `docgen` task, so VT2 conformance cannot be validated by pretending those tasks exist.
- `@beep/infra` has no workspace-local `turbo.json`, so infra command truth comes from `infra/package.json` plus the root `turbo.json`, not from a missing workspace-local task manifest.
- Root `bun run lint:markdown` currently ignores `specs/**`, so spec-package validation must use package-local checks such as `git diff --check -- specs/pending/V2T` plus `node specs/pending/V2T/outputs/validate-spec.mjs`.
- Any phase that names commands must verify those commands against the live workspace task graph instead of assuming every workspace exposes the same scripts.
- Graphiti preflight must use `group_ids` as `["beep_dev"]` or the JSON string
  `"[\"beep_dev\"]"` when the MCP wrapper only accepts strings, and current
  RediSearch search failures should trigger a documented fallback rather than a
  blocked phase.
- Graphiti recall was attempted with the queries `V2T spec architecture planning sidecar app workflow memory composition export patterns` and `V2T spec Cap resilient capture typed native bridge recovery settings verification`; both failed with the exact error `Error searching facts: RediSearch: Syntax error at offset 16 near beep`, `get_episodes` returned `No episodes found`, and the fallback used for this pass was repo-local docs plus direct inspection of the cloned Cap repository.

### Gaps

- There is no canonical V2T domain model yet.
- The current `@beep/VT2` sidecar only exposes a simple document-oriented control plane, not V2T-native projects, sessions, transcripts, composition runs, export artifacts, or user-level desktop preference records.
- There is no typed native desktop bridge yet for V2T-side concerns such as sidecar lifecycle, file dialogs, recovery actions, or limited auxiliary window orchestration.
- There is no implemented capture durability flow yet for chunk or segment persistence, backpressure, or recover/discard handling after interrupted direct capture.
- There is no implemented local persistence flow for V2T sessions, transcripts, composition runs, export artifacts, or recoverable capture candidates beyond the existing sidecar bootstrap and document storage seam.
- The current app does not expose the record -> review -> configure -> generate workflow from the PRD.
- Provider contracts for transcript enrichment, audio embedding, video generation, and export orchestration are not formalized.

## Research Conclusions

### Product Posture

- V2T should be treated as a local-first workspace first and an automated media-production pipeline second.
- The canonical spec should preserve the PRD ambition while sequencing delivery through explicit provider seams and local artifacts.
- The first implementation slice should make resilient capture and recovery part of the core desktop workflow, not a later hardening-only concern.
- The first implementation slice should stop at composition packets and tracked export artifacts unless a later phase proves end-to-end generator reliability.
- The first implementation slice should extend or explicitly supersede the current `@beep/VT2` control plane instead of inventing a second app-local server path.
- The first implementation slice should keep record and import as equal session-entry paths that converge into one session and artifact model.
- The first implementation slice should treat Tauri-only concerns as one authoritative typed desktop bridge derived from the Rust command and event surface instead of ad-hoc app-shell calls.
- Direct capture durability should live below the React UI so the app observes typed capture status instead of owning raw capture buffers.
- The native shell should own raw direct-capture control, chunk or segment durability, interruption discovery, and recover or discard actions, while the sidecar owns canonical session metadata and downstream artifact indexing after intake.

### Provider Classification

- realtime or hosted transcription is a provider seam, not a UI concern
- memory retrieval is a provider seam with Graphiti as the initial repo-native default
- audio embeddings are a provider seam and should remain optional in the first slice
- video generation is a provider seam and should not be hard-coded into the app shell
- export formatting is a local orchestration seam even if later delegated to external providers

### Repo Constraints

- use the existing `apps/V2T` workspace instead of inventing a new app package
- use the existing `packages/VT2` sidecar package and scripts as the starting control-plane seam unless a later phase documents a migration
- use `@beep/infra` as the canonical home for workstation automation instead of adding an app-local installer outside the infra workspace
- treat `apps/V2T`, `packages/VT2`, and `@beep/infra` as the live app, sidecar, and workstation-automation seams for the first slice
- keep direct capture and import as equal first-slice session sources that converge into the same downstream workflow
- keep Tauri-only concerns behind one authoritative typed desktop bridge derived from the Rust command and event surface rather than scattered manual calls
- keep direct-capture chunk or segment persistence and recovery below the React UI, with the native shell owning raw direct-capture control, chunk or segment durability, interruption discovery, and recover or discard actions while the sidecar owns canonical session metadata and downstream artifact indexing after intake
- keep the first-slice desktop UX explicit: one main workspace window, native file dialogs, and at most one focused capture or recovery surface; settings and review stay in the main workspace for the first slice
- keep durable desktop preferences and last-used workflow defaults as a separate settings seam rather than mixing them into project or run records
- use `@beep/v2t` and `@beep/VT2` as the live Turbo filter identities unless
  later repo changes update the manifests
- keep the spec compatible with effect-first and schema-first repo rules
- keep exported API examples docgen-clean and aligned with `.patterns/jsdoc-documentation.md`
- prefer shared UI and runtime primitives before introducing V2T-specific duplicates
- treat the current naming drift between `apps/V2T` and `packages/VT2` as a documented repo fact rather than a bootstrap-time rename project
- keep `1Password` optional for V2T secrets, preferring Pulumi secret config and optional `op run` injection over mandatory Connect or ESC setup
- treat the Graphiti LLM credential as a required installer input whenever Graphiti provisioning remains enabled
- borrow Cap's contract, recovery, and verification posture where it strengthens the existing seams, but do not clone Cap's full package or window surface into this repo

## Research Deliverables For This Package

P0 is complete when all of these are explicit:

- the product workflow is grounded in repo seams rather than PRD-only language
- the initial execution slice is named and scoped
- the desktop resilience posture, typed native bridge ownership, and unified record/import pipeline are explicit
- provider seams are classified as local, optional, or deferred
- the mandatory repo-law inputs and command-matrix constraints are written down for later phases
- preserved source artifacts remain linked and unmodified

## Remaining Details To Carry Into P1 And P2

- How should the first slice extend the existing `Vt2Document` control plane into V2T-native project, session, and run endpoints without hiding migration or compatibility costs?
- Which concrete transport or storage shapes best express the already-locked hybrid capture contract, where the native shell owns raw direct-capture durability and the sidecar owns canonical session metadata after intake?
- Should the single focused capture or recovery surface be implemented as an overlay or as one auxiliary native window in the first slice?
- How should the shared speech input component compose with the already-locked native-shell capture lifecycle without becoming the authoritative owner of raw capture state?

## Stop Conditions

- Stop if live repo evidence conflicts with a locked package assumption and the conflict cannot be resolved inside research alone.
- Stop if a question would require design commitment, implementation work, or invented provider behavior to answer.
- Stop if command or task claims cannot be confirmed from the live workspace.
- Stop if delegation would overlap write scopes, widen the objective, or turn workers into de facto phase owners.
- Stop once P0 is concrete enough that P1 can design without rediscovering repo-law or product-shape constraints.

## Exit Gate

P0 is complete only when `RESEARCH.md` gives P1 a trustworthy baseline:

- the canonical workflow is grounded in current repo seams
- the initial execution slice is named and bounded
- provider seams are classified as local, optional, or deferred
- repo-law and command-truth constraints are explicit
- only implementation-detail questions remain, and they are visible instead of buried in assumptions
