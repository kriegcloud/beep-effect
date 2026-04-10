# V2T - P1 Design Research

## Status

BOOTSTRAP BASELINE

## Goal

Translate the research baseline into a decision-complete V2T system contract that another agent can plan and implement without reopening the core product shape.

## Phase Agent Role

The session working P1 is the design orchestrator.

The orchestrator owns:

- the local design plan and the questions that still need closure
- the decision to delegate schema, service, or boundary analysis
- integration of specialist findings into one coherent system contract
- the final design language that later phases must implement against
- the P1 exit call

Workers can refine bounded parts of the design, but they do not get to widen product scope, reopen locked P0 defaults without evidence, or declare the design complete.

## Orchestration-First Workflow

1. Re-read the P0 research baseline and identify only the design decisions that remain open.
2. Inspect the live app, sidecar, and shared-package seams for the decisions that directly constrain the design.
3. Form a local contract-first design plan before delegating.
4. Delegate only bounded schema, service, or protocol analysis that can run in parallel without changing the P1 objective.
5. Integrate the specialist output into a single orchestrator-owned design contract.
6. Record what is decided, what is deferred, and what must be carried as an explicit implementation constraint.
7. Stop at the P1 exit gate instead of sliding into P2 planning or P3 implementation.

## Mandatory Conformance Inputs

P1 must keep these constraints active while shaping the design:

- `AGENTS.md`
- the `effect-first-development` and `schema-first-development` skills when available in-session
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `infra/package.json`
- root `package.json`, root `turbo.json`, `apps/V2T/package.json`,
  `apps/V2T/turbo.json`, `packages/VT2/package.json`, and
  `packages/VT2/turbo.json`

## Evidence Rules

- Every design claim should be anchored either in `RESEARCH.md` or in a live repo seam that the design must fit.
- Design conclusions must distinguish required contracts from optional future extensions.
- Worker recommendations are advisory until the orchestrator accepts and integrates them into `DESIGN_RESEARCH.md`.
- If a design choice would reopen P0 product scope or contradict repo reality, stop and surface that conflict instead of normalizing it.
- Do not treat provider preferences as locked architecture unless the design explicitly names them as replaceable adapters.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, whether `get_episodes` fallback was attempted and what it returned,
  fallback used, and any durable writeback or queued session-end summary using
  `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## Canonical User Flow

1. The user creates or opens a V2T project.
2. The user records audio or imports an existing recording.
3. The app persists a session record and produces a transcript artifact with speaker and timing metadata when available.
4. The user reviews a session brief that combines transcript, notes, and memory or research context.
5. The user configures a composition profile:
   style, output target, raw-audio-only versus enhanced-dialogue mode, and clip strategy.
6. The app creates a composition run packet and routes it through local orchestration and provider adapters.
7. The app stores run results and export artifacts for later review, retry, or publishing.

## Domain Model

The canonical domain objects are:

- `V2tProject`: named container for recordings, notes, runs, and export history
- `ConversationSession`: one captured or imported conversation with user notes and timestamps
- `RecordingAsset`: audio file metadata, local path, duration, and capture source
- `TranscriptArtifact`: transcript body, chunk or speaker metadata, transcript provenance, and generation status
- `SessionBrief`: enriched review document combining transcript, extracted topics, entities, and linked context
- `MemoryContextPacket`: references returned from Graphiti or other retrieval providers
- `CompositionProfile`: user-selected style, duration target, dialogue mode, and export intent
- `CompositionRun`: one generation request with status, provider inputs, outputs, and retry state
- `ExportArtifact`: concrete long-form or clip deliverable metadata with local path and format

## Conformance Design Rules

- Pure data models should be planned as schema-first domain objects, with `S.Class` preferred for object models unless a boundary exception is explicitly justified.
- Reusable non-class schemas must plan for same-name runtime type aliases and meaningful `$I.annote(...)` metadata.
- Failure-capable provider and orchestration seams must plan for typed errors rather than ambient `throw` or `new Error(...)`.
- Provider adapters should be modeled as explicit Effect services and layers, not component-owned helpers or singleton modules.
- React routes and components must stay provider-agnostic and talk only to local app or sidecar service seams.
- Exported APIs introduced by the slice must plan for JSDoc and docgen-clean examples from the start.

## System Boundaries

### App Surface

`apps/V2T` owns the user workflow, page routing, local app state, and composition controls. It talks to the control plane through the existing `/api` proxy seam.

### Sidecar Surface

The first-slice sidecar surface is the existing `@beep/VT2` package:

- `packages/VT2/src/protocol.ts` is the current typed control-plane contract
- `packages/VT2/src/Server/index.ts` is the current runtime and SQLite seam
- `apps/V2T/scripts/build-sidecar.ts` and `apps/V2T/scripts/dev-with-portless.ts` are the app-side packaging and dev entrypoints

That sidecar owns filesystem access, SQLite persistence, provider adapters, orchestration jobs, and long-running generation or export work.

### Workstation Installer Surface

`@beep/infra` owns the workstation installation contract for this phase:

- `infra/Pulumi.yaml` is the live Pulumi project manifest and `infra/src/entry.ts` is the current stack entrypoint
- a reusable `V2TWorkstation` Pulumi component in `infra/src/V2T.ts` provisions the local machine from the current checkout
- the installer validates Debian/Ubuntu, sudo, `systemd --user`, and a working NVIDIA driver before mutating the workstation
- the installer provisions source-build prerequisites, a local Qwen user service, Graphiti/FalkorDB Docker services plus the existing Graphiti proxy user service, and the packaged V2T app install
- the installer reconciles the current checkout instead of cloning a second repo or requiring a clean worktree
- the operator surface lives in `infra/package.json`, including `pulumi:login:local`, `stack:init:local`, `preview`, `up`, `destroy`, and `refresh`
- the local backend default remains `file://<repoRoot>/.pulumi-local/v2t-workstation`, and the stack namespace remains `v2t`

### Runtime Topology

The canonical workstation topology for this slice is:

- `apps/V2T` built locally as the native Tauri desktop app and installed from the generated `.deb`
- `packages/VT2` compiled as the packaged sidecar binary and still owning local SQLite persistence
- local Qwen running as a user-owned Python service on `127.0.0.1:8011`
- FalkorDB plus Graphiti MCP running in Docker with the repo's expected container names
- the existing Graphiti proxy installed as a user `systemd` service on `127.0.0.1:8123`

### Shared Package Reuse

- reuse the shared speech input component for recording and transcript-preview interactions
- reuse repo identity and schema packages for domain ids and typed contracts
- reuse root Graphiti infrastructure instead of inventing separate memory plumbing

## Current Naming Constraint

- `apps/V2T` is the app shell and its current package name is `@beep/v2t`
- `packages/VT2` is the sidecar package and its current package name is `@beep/VT2`
- Turbo filters must follow the manifest package names, not the folder casing
- the first slice documents and works with that naming drift instead of renaming packages during spec bootstrap

## Storage Posture

- audio and generated media live on local disk
- durable session, run, and artifact metadata live in SQLite
- transcript and session brief artifacts are stored as filesystem documents with corresponding SQLite records
- memory retrieval references are cached as packet snapshots attached to sessions or composition runs

## Secret Posture

- the packaged app and local Qwen service do not require mandatory secrets for a baseline install
- `HUGGING_FACE_HUB_TOKEN` stays optional and is only needed for authenticated model download behavior
- Graphiti provisioning requires an external LLM API key according to the current upstream Graphiti MCP documentation, so the installer must model that secret explicitly when Graphiti stays enabled
- Pulumi secret config is the primary secret source, with optional `op run` injection for operators who already use 1Password locally
- `1Password` is not a required dependency for a successful V2T workstation install
- Graphiti-enabled installer configs must fail validation when `graphitiOpenAiApiKey` is absent, matching the current `infra/test/V2T.test.ts` contract

## Provider Adapter Contract

All external integrations must be expressed as adapters behind local service contracts:

- `TranscriptProvider`
- `SessionEnrichmentProvider`
- `MemoryProvider`
- `AudioEmbeddingProvider`
- `CompositionProvider`
- `ExportProvider`

React components and route modules are not allowed to call external providers directly.

## First Execution Slice

The first committed execution slice should deliver:

- project shell and session list in `apps/V2T`
- record or import flow using repo-native UI
- transcript artifact persistence and review surface
- memory context packet retrieval through a Graphiti-backed adapter seam
- composition profile editor and composition packet generation
- export artifact records and stub-or-real queue orchestration
- extension of the current `@beep/VT2` control plane for V2T-native artifacts instead of an app-local server fork

The first slice does not need to prove fully autonomous final video quality. It must prove the local-first workflow and the orchestration contracts.

## Deferred By Default

- automated social distribution
- sophisticated scene editing timelines
- mandatory local Qwen embedding generation on day one
- claiming Grok or any other generator as irreversible product lock-in

## Stop Conditions

- Stop if P1 would need to invent product scope that P0 did not ground.
- Stop if the design would require a repo migration or command/task surface not yet justified by evidence.
- Stop if unresolved ambiguity should be pushed back to P0 research rather than hidden inside design prose.
- Stop if delegation would overlap scopes or allow a worker to become the de facto design owner.
- Stop once the system contract is explicit enough for P2 to sequence implementation without reopening architecture.

## Design Exit Gate

P1 is complete only when the workflow, domain objects, storage posture, adapter seams, first execution slice, and repo-law constraints are explicit enough that P2 can produce a file-level plan without product-side guesswork or hidden architecture decisions.
