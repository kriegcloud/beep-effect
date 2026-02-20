# Repo CLI tsconfig Sync (`beep tsconfig-sync`)

## Status
ACTIVE

## Owner
@elpresidank

## Created
2026-02-20

## Purpose
Add a new `tsconfig-sync` command to `@beep/repo-cli` (`tooling/cli`) that restores the high-value behavior from legacy `beep-effect` while targeting this repo's current Effect v4 CLI architecture and current TypeScript config standards.

## Why This Spec Exists
A legacy `tsconfig-sync` command already exists in:

- `.repos/beep-effect/tooling/cli/src/commands/tsconfig-sync/`

That implementation was built around the previous tsconfig layout (`tsconfig.base.jsonc`, `tsconfig.build.json`, widespread `tsconfig.src/test/build.json` usage) and old command wiring.

This repo now uses a different baseline:

- root `tsconfig.base.json`
- root `tsconfig.packages.json` as package reference entrypoint
- root `tsconfig.json` for path aliases + test/config include scope
- mostly single-file package `tsconfig.json` layout (with some mixed split-config packages)
- Effect v4 + `effect/unstable/cli` command conventions

We need a fresh spec so implementation does not blindly port obsolete assumptions.

## Primary Goal
Create `beep tsconfig-sync` with stable check/fix behavior for this repo that:

1. Syncs root workspace project references in `tsconfig.packages.json`.
2. Syncs root path aliases in `tsconfig.json` for workspace packages.
3. Syncs package-level project references using current tsconfig layout rules.
4. Supports deterministic validation modes for CI (`--check`) and safe preview (`--dry-run`).

## Legacy Source of Truth (Behavioral Intent)
Use legacy command behavior and lessons as intent references, not direct implementation:

- `.repos/beep-effect/tooling/cli/src/commands/tsconfig-sync/`
- `.repos/beep-effect/specs/archived/tsconfig-sync-command/README.md`
- `.repos/beep-effect/specs/archived/tsconfig-sync-command/handoffs/FIX_TYPE_ONLY_IMPORTS.md`

Important retained intent:

- deterministic sync
- cycle detection
- check/dry-run modes
- preserving valid existing references to avoid destructive drift

## Current Tsconfig Standards Contract (Target)
### Root `tsconfig.packages.json`
- `references` entries point to workspace directories (for example `"tooling/cli"`), not legacy slice/build config paths.
- Entries are deduplicated and deterministically ordered.

### Root `tsconfig.json` paths
- Canonical aliases per workspace package:
  - `@beep/<name>` -> `./<workspacePath>/src/index.ts`
  - `@beep/<name>/*` -> `./<workspacePath>/src/*.ts`
- Preserve unrelated/manual path aliases not owned by this command.

### Workspace package configs
- Default package pattern is single `tsconfig.json`.
- Mixed packages with split configs (`tsconfig.src/test/build.json`) must be supported without regressions.
- Reference path format and owning config file must be explicitly defined in Phase 1 design.

## Scope
### In Scope
- New `tsconfig-sync` command implementation in `tooling/cli/src/commands/`
- Command registration in `tooling/cli/src/commands/root.ts`
- Export wiring in `tooling/cli/src/index.ts`
- Tests in `tooling/cli/test/`
- JSONC-safe edits preserving existing comments/formatting where feasible

### Out of Scope
- Migrating every package to one universal tsconfig shape in this spec
- Replacing `create-package` scaffolding behavior wholesale
- Broad dependency-hoisting redesign outside tsconfig synchronization needs

## Target Command Contract
Proposed default contract (finalize in Phase 1):

- `beep tsconfig-sync`
- `beep tsconfig-sync --check`
- `beep tsconfig-sync --dry-run`
- `beep tsconfig-sync --filter <workspace package name>`
- `beep tsconfig-sync --verbose`

Expected semantics:

- `--check`: no writes, non-zero exit on drift.
- `--dry-run`: no writes, reports planned mutations.
- default mode: apply sync changes.

## Behavioral Requirements
1. Discover repo root via `findRepoRoot` and workspaces from current root `package.json` workspaces.
2. Build workspace dependency graph from current package manifests.
3. Detect and report dependency cycles before writing.
4. Compute expected root references and path aliases from current workspace state.
5. Compute expected package-level references from workspace dependencies using chosen tsconfig-owner strategy.
6. Preserve valid existing references not derivable from package.json when needed to avoid type-only import regressions.
7. Remove stale references that point to non-existent workspace targets.
8. Keep operations idempotent (second run produces zero changes).
9. Provide concise summary logging plus optional verbose per-package detail.

## Effect v4 + CLI Pattern Requirements
- Use `effect/unstable/cli` (`Command`, `Flag`, `Argument` only if needed).
- Use Effect v4 service APIs (`FileSystem`, `Path`) and `Effect.fn`.
- Use repo-utils first for discovery/graph ops:
  - `findRepoRoot`
  - `resolveWorkspaceDirs`
  - `buildRepoDependencyIndex`
  - `detectCycles` / `topologicalSort` as appropriate
- Use domain/tagged errors (`DomainError` + command-local tagged errors) over raw thrown `Error`.
- Follow current JSDoc tagging standards (`@since`, `@module`, `@category`).

## Execution Plan For Another Codex Instance

### Phase 0: Research + Parity Map
Deliverable:

- `specs/pending/repo-cli-tsconfig-sync/outputs/research.md`

Must include:

- Legacy behavior map from `.repos/beep-effect/tooling/cli/src/commands/tsconfig-sync/*`
- Current repo tsconfig contract map (`tsconfig.base.json`, `tsconfig.packages.json`, `tsconfig.json`, package configs)
- Explicit list of behavior to keep, adapt, or drop
- Failure modes from legacy handoffs (especially type-only import/reference deletion)

### Phase 1: Design
Deliverable:

- `specs/pending/repo-cli-tsconfig-sync/outputs/design.md`

Must include:

- Final command UX and flags
- Reference ownership matrix by config shape (single vs split configs)
- Reference path format decision (directory reference vs explicit file reference)
- Alias ownership/preservation policy in root `tsconfig.json`
- Drift reporting format and exit code behavior

### Phase 2: Implementation Plan
Deliverable:

- `specs/pending/repo-cli-tsconfig-sync/outputs/implementation-plan.md`

Must include:

- Exact file-touch list
- Ordered implementation steps
- Risk controls for destructive edits
- Rollback strategy

### Phase 3: Implement
Expected code areas:

- `tooling/cli/src/commands/tsconfig-sync.ts` or `tooling/cli/src/commands/tsconfig-sync/`
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- optional helper modules under `tooling/cli/src/commands/tsconfig-sync/`

Implementation requirements:

- JSONC-safe update operations for tsconfig files
- Deterministic sort + dedupe behavior
- Idempotent writes only when content changes
- No hardcoded legacy workspace globs

### Phase 4: Test
Expected tests:

- `tooling/cli/test/tsconfig-sync.test.ts` (or equivalent split test files)

Minimum coverage:

1. Syncs `tsconfig.packages.json` references from workspace discovery.
2. Syncs root alias pairs in `tsconfig.json`.
3. Handles mixed package tsconfig layouts (single and split).
4. `--check` fails on drift and passes when synchronized.
5. `--dry-run` reports changes without writing.
6. Preserves required existing refs to avoid type-only import regressions.
7. Removes references to deleted/non-existent workspace targets.
8. Re-run after sync is idempotent.
9. Command is registered in root command tree.

## Verification Commands
```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

Command checks:

```bash
bun run beep tsconfig-sync --help
bun run beep tsconfig-sync --dry-run
bun run beep tsconfig-sync --check
```

## Success Criteria
- [ ] `beep tsconfig-sync` exists in `@beep/repo-cli`
- [ ] Root `tsconfig.packages.json` references are synchronized to workspace reality
- [ ] Root `tsconfig.json` alias pairs are synchronized without clobbering unrelated aliases
- [ ] Package-level references sync correctly across current tsconfig layout variants
- [ ] `--check` and `--dry-run` work with deterministic output and correct exit behavior
- [ ] Type-only/import edge-case regressions are prevented
- [ ] Tests pass and command is idempotent

## Open Questions (Resolve in Phase 0/1)
1. Should v1 also normalize `package.json` dependency specifiers/sorting (legacy behavior), or keep this spec strictly tsconfig-focused?
2. For mixed split-config packages, should dependency refs be owned by `tsconfig.build.json`, `tsconfig.src.json`, or package `tsconfig.json`?
3. Should alias syncing manage optional patterns like `@beep/<name>/test/*`, or preserve only existing custom entries?
4. Should `--filter` accept workspace path in addition to package name?

## Exit Condition
This spec is complete when another Codex instance can execute Phases 0-4 end-to-end and land a stable Effect v4 `beep tsconfig-sync` command aligned with this repo's current tsconfig standards, with passing tests and verification gates.
