# Ontology Modeling Foundation Implementation Plan

## Status

This plan executes [SPEC.md](./SPEC.md). The current round is a POC
implementation that can later be hardened into a full package initiative.

## Phase 0 - Packet And Boundary

- [x] Create `goals/ontology-modeling-foundation`.
- [x] Record the `@beep/rdf`, `@beep/ontology`, and `@beep/semantic-web`
  package boundary.
- [x] Align the packet with foundation/modeling architecture expectations.

## Phase 1 - RDF Modeling Package

- [x] Create `packages/foundation/modeling/rdf`.
- [x] Move pure RDF, IRI, URI, JSON-LD, metadata, and vocabulary modules into
  `@beep/rdf`.
- [x] Add package config, tsconfig, vitest config, README, and dtslint/test
  placeholders.
- [x] Keep semantic-web compatibility re-exports.

## Phase 2 - Ontology Modeling Package

- [x] Create `packages/foundation/modeling/ontology`.
- [x] Add ontology metadata schema models and typed assembly errors.
- [x] Add identity wrapper helpers for root and key annotations.
- [x] Add relationship reference normalization for schemas, terms, IRIs, RDF
  named nodes, and assembled references.
- [x] Add assembly from annotated Effect schemas.
- [x] Add JSON-LD and Turtle projections.

## Phase 3 - Package POC And Scratchpad Wiring

- [x] Remove scratchpad implementation and example code from the committed POC.
- [x] Keep scratchpad TypeScript and Vitest wiring available for local
  experiments.
- [x] Add package tests proving annotation storage, relationship resolution,
  JSON-LD round-trip, and Turtle projection.
- [x] Run scratchpad `tsgo`, `tsc`, and empty Vitest wiring checks.

## Phase 4 - Repo Wiring And Quality

- [ ] Update root path references and package references.
- [ ] Update lockfile/workspace metadata as needed.
- [ ] Run focused package checks and tests.
- [ ] Refresh generated repo exports catalog when package checks are green.

## Verification

- `bunx tsgo -p packages/foundation/modeling/rdf/tsconfig.json`
- `bunx tsgo -p packages/foundation/modeling/ontology/tsconfig.json`
- `bunx tsgo -p scratchpad/tsconfig.json`
- `bunx tsc -p scratchpad/tsconfig.json --noEmit --pretty false`
- `bun run --filter=@beep/rdf test`
- `bun run --filter=@beep/ontology test`
- `bunx vitest run --config scratchpad/vitest.config.ts`
