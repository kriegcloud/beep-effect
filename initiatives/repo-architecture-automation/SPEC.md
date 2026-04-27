# Repo Architecture Automation Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-04-27
- **Updated:** 2026-04-27

## Mission

Create the smallest trustworthy path from repo architecture doctrine to
repeatable repo generation:

1. preserve the pre-automation checkout on an archive branch;
2. remove active legacy surfaces from the feature branch;
3. prove the target topology with a checked golden fixture;
4. derive a registry-driven `beep` topology factory from that fixture.

## Non-Negotiable Contract

- The archive branch is created from the clean committed `main` HEAD, not from
  uncommitted WIP.
- Destructive deletion happens only on
  `chore/repo-architecture-automation`.
- The active repo must not keep the deleted apps, packages, initiatives, or
  root config references as live guidance.
- The old convergence packet is not moved wholesale. Only a compact digest is
  retained.
- `tooling/cli` owns the generator core. `@turbo/gen` is out of scope until a
  future wrapper delegates to `bun run beep ...`.
- The golden fixture must be synthetic and must use `fixture-lab/Specimen`.
- `standards/ARCHITECTURE.md` is binding for golden fixture topology, role
  suffixes, concept path, and export boundaries.

## Deleted Active Surfaces

The feature branch removes these active surfaces:

- `apps/editor-app`
- `apps/desktop`
- `packages/editor`
- `packages/runtime`
- `packages/repo-memory`
- `packages/shared`
- `initiatives/repo-expert-memory-local-first-v0`
- `initiatives/expert-memory-big-picture`
- `initiatives/repo-architecture-convergence`

## Retained Active Surfaces

The lean slate keeps these families unless a later packet changes the target:

- `apps/codedank-web`
- `packages/common/*`
- `packages/fixture-lab/specimen/*` as temporary private golden fixture
  workspaces
- `packages/_internal/*`
- `infra`
- `tooling/*`
- `.claude`
- `.codex`
- repo standards, policies, and agent guidance after stale references are
  reconciled

## Generator Direction

The future `beep` topology factory uses these layers:

1. schema-backed architecture registry input;
2. normalized generation plan;
3. writer selection by target file kind;
4. Handlebars for reviewable leaf-file templates;
5. structured writers for JSON, JSONC, package metadata, docgen, and manifests;
6. `ts-morph` only for semantic TypeScript mutations.

The golden fixture is the source for the first template extraction pass. The
generator does not start by inventing abstractions independent of checked
expected output.

## Golden Slice Contract

The fixture must cover the topology with one small concept, `Specimen`:

- concept path `entities/Specimen`;
- domain model and lifecycle rule;
- command/query use-cases and service port;
- typed config;
- server implementation;
- table/read-model shape;
- client facade;
- simple UI surface;
- exports;
- package metadata;
- docs;
- tests;
- identity composer wiring;
- config-sync participation.

Fixture graduation requires:

1. generate the same structure into a temp directory;
2. compare the output to the live golden fixture workspaces;
3. run dedicated fixture checks;
4. run the generator twice;
5. prove the second run is a no-op.

## Required Verification

- `bun run config-sync:check`
- targeted fixture checks for the golden slice contract;
- search audits for deleted path and package references outside archived,
  generated, or fixture-approved contexts;
- package graph checks after deletion;
- final full gates once the branch is coherent:
  `bun run check`, `bun run lint`, `bun run test`, `bun run docgen`, and
  `bun run audit:full`.

## Out Of Scope

- porting product behavior from the deleted apps and packages;
- building the generator before the golden fixture is accepted;
- retaining compatibility shims for deleted package names;
- making `@turbo/gen` the generator core;
- storing the old convergence packet as an active packet under another name.

## Source-Of-Truth Order

When sources disagree, use this order:

1. this `SPEC.md`;
2. `standards/ARCHITECTURE.md`;
3. `ops/manifest.json`;
4. `PLAN.md`;
5. checked golden fixture workspaces;
6. design notes in `design/`;
7. archived convergence digest;
8. historical git content on the archive branch.
