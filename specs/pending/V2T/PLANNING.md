# V2T - P2 Planning

## Status

BOOTSTRAP BASELINE

## Goal

Convert the research and design docs into an implementation sequence for the existing `apps/V2T`, `packages/VT2`, and `@beep/infra` seams.

## Phase Agent Role

The session working P2 is the planning orchestrator.

The orchestrator owns:

- the local planning strategy and rollout order
- the validation of command truth against the live workspace
- the decision to delegate read-only audits
- the integration of audit results into one implementation plan
- the acceptance criteria and gate matrix that later phases must honor
- the P2 exit call

Workers may audit command reality, dependencies, and gate completeness, but they do not get to implement code, invent commands, or convert the planning phase into execution.

## Orchestration-First Workflow

1. Re-read `RESEARCH.md` and `DESIGN_RESEARCH.md` and identify the decisions that planning must operationalize.
2. Inspect the live task graph, workspace manifests, and concrete seams before locking any command or file-order claim.
3. Form a local rollout plan before delegating.
4. Delegate only bounded read-only audits for command truth, dependency order, or gate completeness.
5. Integrate audit results into a single orchestrator-owned plan.
6. Mark planned gates as planned, not passed; P2 may lock commands without implying they already succeeded.
7. Stop at the P2 exit gate instead of implementing the plan.

## Mandatory Conformance Inputs

P2 must plan against the actual repo-law and task surface, not a guessed one:

- `AGENTS.md`
- the `effect-first-development` and `schema-first-development` skills when available in-session
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `infra/package.json`
- root `package.json`, root `turbo.json`, `apps/V2T/package.json`, `apps/V2T/turbo.json`, `packages/VT2/package.json`, and `packages/VT2/turbo.json`
- `apps/V2T/package.json` and `packages/VT2/package.json` are authoritative for
  Turbo filter names: use `@beep/v2t` for the app and `@beep/VT2` for the
  sidecar unless the manifests change
- `infra/package.json` is authoritative for the workstation/deployment workspace name `@beep/infra` and its package-local Pulumi scripts

## Evidence Rules

- Every command listed in `PLANNING.md` must be confirmed to exist in the live workspace or be called out as a missing or non-applicable surface.
- P2 may describe required future verification, but it must not phrase those gates as already passing.
- Worker audits are supporting evidence; the orchestrator still owns the final command matrix and acceptance criteria.
- If the plan depends on hidden architecture choices not locked in P1, surface them explicitly rather than smuggling them into rollout order.
- If a command is broader than the first slice, say so and explain why the broader gate still matters.
- Record Graphiti recall attempted, exact query, exact error text when recall
  fails, whether `get_episodes` fallback was attempted and what it returned,
  fallback used, and any durable writeback or queued session-end summary using
  `prompts/GRAPHITI_MEMORY_PROTOCOL.md`.

## Implementation Tracks

### Track 0 - Workstation Installer

- keep `infra/Pulumi.yaml` and `infra/src/internal/entry.ts` as the live project and stack entrypoint for `V2TWorkstation`
- extend `infra/src/V2T.ts`, its schema-first workstation config, and its typed config errors instead of inventing a second installer entrypoint
- provision the installer through `@pulumi/command` `local.Command` resources with explicit `create`, `update`, `delete`, `dir`, `environment`, and scoped `triggers`
- keep the current local backend posture at `.pulumi-local/v2t-workstation` and the current stack namespace `v2t` unless an approved change explicitly updates both docs and code
- install workstation prerequisites for local native app builds, Qwen serving, Docker-backed Graphiti, and the existing Graphiti proxy workflow
- build `apps/V2T` and `packages/VT2` from the current checkout and install the generated Debian package locally
- keep destroy conservative by removing only V2T-managed services, caches, units, and package artifacts
- require a Graphiti LLM API key secret whenever Graphiti provisioning remains enabled
- keep `1Password` optional by supporting Pulumi secrets and optional `op run` injection instead of mandatory Connect or ESC integration

### Track 1 - Domain And Contracts

- add V2T domain schemas and typed errors for projects, sessions, recordings, transcripts, composition profiles, runs, and export artifacts
- plan schema-first models with `S.Class`, annotations, same-name runtime aliases where required, and no exported pure-data `interface` / type-literal drift
- define adapter services for transcript, enrichment, memory, composition, and export providers using explicit Effect service boundaries
- keep contracts local-first and sidecar-friendly

### Track 2 - Local Persistence And Sidecar

- extend the existing `packages/VT2` control plane into a concrete V2T service boundary
- add filesystem and SQLite persistence for session metadata and generated artifacts
- define packet formats for transcript persistence, memory context snapshots, and composition runs

### Track 3 - App Workflow

- replace the placeholder `TwoTvPage` with the real V2T workspace shell
- add project, session, capture or import, review, and composition configuration screens
- reuse the shared speech input component where it fits instead of building a second recorder control stack

### Track 4 - Composition And Export Orchestration

- create composition profile editing and composition run submission
- persist run history, status transitions, and export artifact records
- allow provider-backed execution or stubbed local development paths through the same contracts

### Track 5 - Verification

- add targeted tests for domain contracts and route-level behavior
- prove the app can boot, create session artifacts, and generate composition packets
- prove the affected surfaces conform to effect-first, schema-first, and JSDoc/docgen standards
- document any provider gaps explicitly instead of hiding them in the UI

## Suggested File And Surface Order

1. `infra/src/V2T.ts`, `infra/src/internal/entry.ts`, `infra/scripts/v2t-workstation.sh`, and `infra/test/V2T.test.ts` for installer and deployment surfaces when the slice changes them
2. `apps/V2T/src` domain and service contracts
3. `packages/VT2/src/protocol.ts` and `packages/VT2/src/Server/index.ts` sidecar contract and runtime wiring
4. `apps/V2T/src/router.tsx` and component surfaces for the user workflow
5. `apps/V2T/scripts/build-sidecar.ts` and `apps/V2T/scripts/dev-with-portless.ts` only if runtime packaging or env contracts change
6. provider adapter implementations or stubs behind the service interfaces
7. app, sidecar, and infra tests plus route, state, or installer verification
8. package docs or docgen outputs if public workspace docs materially change

## Acceptance Criteria

- the app has a concrete project/session workflow instead of a placeholder page
- the first slice produces durable session and transcript artifacts
- memory retrieval is represented by a typed packet contract and adapter
- composition configuration produces a persisted run packet
- export artifacts have tracked records even when provider output is stubbed
- the implementation uses the current `@beep/VT2` control plane or documents a deliberate migration away from it
- the implementation plan names the real conformance gates instead of assuming nonexistent workspace tasks
- the plan explicitly covers effect-first, schema-first, and docgen/JSDoc expectations for touched exported APIs
- implementation notes capture deviations from this plan

## Strict Conformance Gates

### Spec Package Gate

Use this gate whenever the canonical spec package changes:

- `git diff --check -- specs/pending/V2T`
- `node specs/pending/V2T/outputs/validate-spec.mjs`

Note:

- do not rely on `bun run lint:markdown` for this package because root markdownlint ignores `specs/**`

### Targeted Implementation Floor

The planning phase locks these as the minimum targeted code-validation floor for the app workspace and sidecar:

- `bunx turbo run check --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`
- `bun run --cwd infra lint`

Important note:

- `@beep/VT2` currently has no package-local `lint` or `docgen` task, so do not write plans that depend on those nonexistent commands
- `@beep/infra` already carries package-local `check`, `test`, and `lint` tasks plus the live Pulumi operator scripts in `infra/package.json`
- `@beep/v2t` is the live app package name even though the folder is
  `apps/V2T`, so verify filter casing from the manifest before locking the
  command matrix
- P2 may lock these commands as the required gate matrix, but it must not claim
  they passed until P3 or P4 records real evidence

### Repo Law Gate

Any implementation that changes TS surfaces under `apps/V2T` or `packages/VT2` must also plan for:

- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`

### Exported API Gate

If exported APIs or JSDoc examples change, also require:

- `bun run docgen`

### Readiness Gate

Before P4 can claim readiness for implementation work, plan for:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen` when exported APIs or JSDoc examples changed

### Required Review Loop

- run a read-only review wave before closing P2
- if the reviewer finds substantive issues, integrate them and rerun review
- do not close planning while the latest review wave still contains unresolved
  substantive findings

## Risks

- provider APIs may not align cleanly with the shared speech input behavior
- local-first orchestration may need queueing or cancellation semantics not yet present in the app
- export and generation artifacts can create path-management and status-tracking complexity early
- extending the current `@beep/VT2` document-oriented control plane into V2T-native workflows may require careful schema and route migration
- command drift can make a plan look stricter than the repo really is if the task graph is not verified against live package scripts
- Graphiti's upstream LLM requirement means the memory stack is not fully local-only today, so the installer must keep that secret boundary explicit instead of hiding it behind Docker
- Debian/Ubuntu remains the supported workstation target for the installer even when development happens on a different local OS

## Stop Conditions

- Stop if the plan would require product or design decisions that P1 has not locked.
- Stop if a named command, file path, or dependency sequence cannot be verified from the live workspace.
- Stop if work starts drifting into code implementation or speculative polish.
- Stop if delegation would let a worker own the planning narrative instead of supplying bounded audit evidence.
- Stop once another agent could implement the first slice without making hidden architecture or gate assumptions.

## Planning Exit Gate

P2 is complete only when another agent can implement the first slice from this file and the two prior phase artifacts without needing product or architecture clarification, when the named conformance gates match the live repo surface rather than planning-time guesswork, and when the latest read-only review wave finds no unresolved substantive planning defects.
