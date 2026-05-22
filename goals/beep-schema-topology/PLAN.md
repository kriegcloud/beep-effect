# @beep/schema Topology Implementation Plan

## Status

This plan executes [SPEC.md](./SPEC.md) in staged compatibility-first slices.

## Phase 0 - Doctrine And Goal Packet

- [x] Create `goals/beep-schema-topology`.
- [x] Record the canonical import, naming, public subpath, role-file, and
  compatibility decisions.
- [x] Update `standards/ARCHITECTURE.md`.
- [x] Update `standards/architecture/07-non-slice-families.md`.
- [x] Update `standards/architecture/GLOSSARY.md`.
- [x] Append the architecture-wide decision to
  `standards/architecture/DECISIONS.md`.
- [x] Update `packages/foundation/modeling/schema/README.md`.

## Phase 1 - Pilot Concept Modules

- [x] Add canonical exact exports for `@beep/schema/Duration` and
  `@beep/schema/Glob`.
- [x] Add concept indexes and role files for `Duration` and `Glob`.
- [x] Keep root flat exports and legacy same-name exports compiling.
- [x] Add runtime and type tests for canonical namespace imports.

## Phase 2 - Targeted Topical Family Migration

- [x] Add canonical exact exports for blockchain, color, CSV, DOM, HTTP,
  location, and person concepts.
- [x] Add leaf concept folders for source concepts that do not collide with
  existing lower-case suite directories.
- [x] Map suite public subpaths such as `@beep/schema/Color`,
  `@beep/schema/Csv`, and `@beep/schema/Http` to their existing lower-case
  suite indexes instead of creating case-only source siblings.
- [x] Keep `Sql` and `sqlite` deleted; do not restore or migrate them.
- [x] Move package-local tests and the direct CLI CSV consumer to canonical
  imports.
- [x] Refresh the repo export catalog.
- [x] Run focused verification.

## Phase 3 - Remaining High-Context Concept Migration

- [x] Add explicit canonical exports for high-context public modules that were
  previously reachable only through `./*`.
- [x] Split `FilePath` into guard, segment, root, Windows-path, and primary
  schema role files.
- [x] Split `Graph` into primitive, guard, encoded, edge, rebuild,
  from-self, and transform role files.
- [x] Split `VariantSchema`, `Model`, and `EntitySchema` into concept folders
  with role files while keeping same-name compatibility shims.
- [x] Keep `Fn`, `LiteralKit`, `MappedLiteralKit`, and `Record` on explicit
  concept indexes for Phase 4 hardening.

## Phase 4 - Consumer And Export Hardening

- [ ] Move repo consumers and examples toward namespace-first concept imports.
- [ ] Replace legacy topical paths with flat concept subpaths.
- [ ] Replace wildcard export reliance with explicit canonical and compatibility
  subpaths.
- [ ] Refresh the repo export catalog.

## Verification

Use focused checks after each phase:

- `bun run --cwd packages/foundation/modeling/schema check`
- `bun run --cwd packages/foundation/modeling/schema test`
- package dtslint through Tstyche
- `bun run --cwd packages/foundation/modeling/schema docgen`
- `bun run docgen:local`
- `bun run repo-exports:catalog`
- `bun run repo-exports:catalog:check`
