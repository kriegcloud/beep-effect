# V2T - P2 Planning

## Status

BOOTSTRAP BASELINE

## Goal

Convert the research and design docs into an implementation sequence for the existing `apps/V2T` workspace and its supporting seams.

## Implementation Tracks

### Track 1 - Domain And Contracts

- add V2T domain schemas and typed errors for projects, sessions, recordings, transcripts, composition profiles, runs, and export artifacts
- define adapter interfaces for transcript, enrichment, memory, composition, and export providers
- keep contracts local-first and sidecar-friendly

### Track 2 - Local Persistence And Sidecar

- turn the existing sidecar seam into a concrete V2T service boundary
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
- document any provider gaps explicitly instead of hiding them in the UI

## Suggested File And Surface Order

1. `apps/V2T/src` domain and service contracts
2. `apps/V2T/src/server.ts` and `apps/V2T/src/Server/index.ts` sidecar wiring
3. `apps/V2T/src/router.tsx` and component surfaces for the user workflow
4. provider adapter implementations or stubs behind the service interfaces
5. app tests and route or state verification
6. package docs or docgen outputs if public workspace docs materially change

## Acceptance Criteria

- the app has a concrete project/session workflow instead of a placeholder page
- the first slice produces durable session and transcript artifacts
- memory retrieval is represented by a typed packet contract and adapter
- composition configuration produces a persisted run packet
- export artifacts have tracked records even when provider output is stubbed
- implementation notes capture deviations from this plan

## Verification Commands

The planning phase locks these commands as the default verification floor for the app workspace:

- `bunx turbo run check --filter=./apps/V2T`
- `bunx turbo run test --filter=./apps/V2T`
- `bunx turbo run lint --filter=./apps/V2T`
- `bunx turbo run build --filter=./apps/V2T`

If package-level docs or managed metadata change, also consider:

- `bun run docgen`
- `bun run lint:markdown`

## Risks

- provider APIs may not align cleanly with the shared speech input behavior
- local-first orchestration may need queueing or cancellation semantics not yet present in the app
- export and generation artifacts can create path-management and status-tracking complexity early

## Planning Exit Gate

P2 is complete when another agent can implement the first slice from this file and the two prior phase artifacts without needing product or architecture clarification.
