# @beep/schema Topology Implementation Plan

## Status

This plan executes [SPEC.md](./SPEC.md). The migration is complete; future work
is maintenance under the topology lint.

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

- [x] Move package-local tests, dtslint, and examples for migrated concepts
  toward namespace-first concept imports.
- [x] Keep root-facade imports available for simple scalar helpers and
  compatibility while treating concept subpaths as canonical.
- [x] Replace handwritten legacy topical paths with flat concept subpaths.
- [x] Replace wildcard export reliance with explicit canonical and compatibility
  subpaths.
- [x] Prove concept role files are private with dtslint.
- [x] Refresh generated path maps.
- [x] Continue opportunistic downstream root-facade cleanup for concept helpers
  when touching those packages.

## Phase 5 - Exact Export Closure

- [x] Add exact public subpaths for remaining single-file schema modules.
- [x] Preserve intentional `SchemaUtils` helper-leaf imports without reopening
  concept role files.
- [x] Remove legacy suite leaf compatibility subpaths after canonical leaf
  modules are available.
- [x] Remove the broad `./*` package export and generated
  `@beep/schema/*` path alias.
- [x] Refresh the repo export catalog.

## Phase 6 - Remaining Source Topology Cleanup

- [x] Split the largest remaining outliers where the topology win is
  meaningful: `http/HttpStatus.ts` and `color/Color.ts`.
- [x] Keep canonical public imports stable while physically moving old
  lower-case suite files into PascalCase concept and suite folders.
- [x] Prove new role files remain private with dtslint.
- [x] Evaluate `LiteralKit`, `Fn`, and `MappedLiteralKit`; keep them as concept
  folders and split further only if a future role topology materially improves
  navigation.
- [x] Remove lower-case suite directories and forbid restoring them.

## Phase 7 - Enforcement Automation

- [x] Add or extend repo checks for new concept role-file imports outside the
  package.
- [x] Add or extend repo checks for new lowercase legacy `@beep/schema`
  topical imports.
- [x] Keep dtslint coverage for exact subpaths and private role files.

## Verification

Use focused checks after each phase:

- `bun run --cwd packages/foundation/modeling/schema check`
- `bun run --cwd packages/foundation/modeling/schema test`
- package dtslint through Tstyche
- `bun run --cwd packages/foundation/modeling/schema docgen`
- `bun run docgen:local`
- `bun run repo-exports:catalog`
- `bun run repo-exports:catalog:check`
