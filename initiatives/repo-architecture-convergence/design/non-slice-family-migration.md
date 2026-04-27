# Non-Slice Family Migration

## Goal

Move every non-slice artifact into the canonical family grammar defined by the
architecture:

- `packages/foundation/<kind>/<name>`
- `packages/drivers/<name>`
- `packages/tooling/<kind>/<name>`
- `agents/<kind>/<name>`

This packet informs `P2` enablement and `P3` non-slice extraction. Live
compatibility and amendment governance remains in `../ops`, not in this design
folder.

## Why This Must Happen Before Slice Cutovers

The repo still bakes old roots into:

- root `workspaces`
- root `tsconfig.json` path aliases
- `syncpack`, package references, and `turbo` filters
- package `repository.directory` and `homepage` fields
- package-local `docgen.json` source mappings
- repo scripts such as `ui-add`
- `create-package` scaffolding
- the package identity registry used by `@beep/identity/packages`
- app-sidecar launch scripts and docs
- root agent descriptors, lint allowlists, and worktree guidance that still
  encode `.agents`, `.aiassistant`, `.claude`, or `.codex` as canonical homes

If those surfaces stay old while slices move, the repo will keep validating and
emitting the pre-standard topology.

## Pre-Slice Enablement Gate

Before `P4` `repo-memory` or `P5` `editor` moves, the program must land an
explicit enablement batch covering all of the following:

1. canonical family/kind map for every non-slice workspace
2. workspace-glob rewrite for new roots
3. `tsconfig`, `turbo`, `syncpack`, package-reference, and scratchpad rewrites
4. `docgen` path and schema rewrites
5. `create-package` template and target-root rewrites
6. identity-registry migration rules and scaffolder coupling fixes
7. repo-check rules, root allowlists, and runtime descriptors that stop
   treating `.agents`, `.aiassistant`, `.claude`, and `.codex` as canonical
   survivors and reject newly introduced legacy roots
8. exact baseline audit proof for canonical subpaths/exports, temporary
   compatibility surfaces, and non-slice metadata state so later phases can
   measure drift against a real `P0`/`P2` floor
9. app-sidecar path rewrites that currently point at
   `packages/runtime/server/src/main.ts` and
   `packages/editor/runtime/src/main.ts`

This is not optional cleanup. It is the gate that keeps later slice moves from
reintroducing the topology they are trying to remove.

## Required Deliverables

The non-slice migration packet must produce:

1. the canonical family/kind map for every non-slice workspace
2. the `package.json` metadata contract for `beep.family` and `beep.kind`
3. the `beep.json` contract for agent bundles
4. the workspace-glob migration plan
5. the path-alias and `docgen` rewrite plan
6. the scaffolder rules needed so `create-package` emits target-era roots
7. the identity-registry migration contract
8. the required legacy-root audit set covering `packages/common/*`, top-level
   `tooling/*`, `packages/shared/providers/*`, `packages/runtime/*`, `.agents`,
   `.aiassistant`, `.claude`, and `.codex`
9. the link from each temporary alias to `../ops/compatibility-ledger.md`
10. the link from each unresolved exception to
   `../ops/architecture-amendment-register.md`

## Identity Registry And Scaffolder Contract

Package moves in this repo also move package identity wiring. That work is
required, not incidental.

The migration contract is:

- every renamed or relocated package updates the composer registry exposed from
  `@beep/identity/packages` or its canonical successor location
- every renamed package updates any hard-coded scaffolder path that still points
  at `packages/common/identity/src/packages.ts`
- `create-package` stops generating legacy roots, legacy package names, or
  stale identity-composer examples
- tests and docs that assert old package names move in the same batch as the
  package rename

## Migration Rules

### Foundation

- `foundation/primitive` stays dependency-light and driver-neutral
- `foundation/modeling` owns schemas, codecs, brands, identity substrate, and
  driver-neutral modeling helpers
- `foundation/capability` owns reusable runtime-neutral services and layers
- `foundation/ui-system` owns shared UI primitives, themes, tokens, and hooks

### Drivers

- drivers stay flat under `packages/drivers/<name>`
- drivers own technical wrappers, SDK boundaries, technical config, technical
  errors, driver-local telemetry, and test layers
- drivers do not own product semantics, shared-kernel language, or product
  ports

### Tooling

- `tool` owns CLIs, orchestration, generators, migration executables, and
  operational runtime packages
- `library` owns reusable repo-analysis or support code
- `policy-pack` owns configuration presets and governance data
- `test-kit` owns reusable testing helpers

### Agents

- `skill-pack` owns portable task guidance and assets
- `policy-pack` owns declarative steering packets
- `runtime-adapter` owns declarative runtime-specific assembly only

Executable logic stays out of `agents/` entirely.

## Compatibility Policy

Temporary compatibility aliases are allowed only when all of the following are
true:

1. the alias is recorded in `../ops/compatibility-ledger.md`
2. the alias has a named consumer set and deletion gate
3. new code is forbidden from choosing the old path
4. the final cutover deletes the alias unless a matching entry in
   `../ops/architecture-amendment-register.md` is approved explicitly

## Exit Condition

This design area is complete when the repo can move non-slice packages without
inventing routing rules package by package and without leaving the identity
registry, scaffolder, or root wiring behind.
