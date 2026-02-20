# Repo CLI Purge Command (`beep purge`)

## Status
ACTIVE

## Owner
@elpresidank

## Created
2026-02-20

## Purpose
Add a new `purge` command to `@beep/repo-cli` (`tooling/cli`) that removes workspace build artifacts and root cache artifacts with the same intent as the legacy Effect v3 script at:

- `.repos/beep-effect/tooling/repo-scripts/src/purge.ts`

Implementation must use Effect v4 patterns and current `tooling/cli` command conventions.

## Why This Spec Exists
`purge` currently exists only in legacy subtree tooling (`@beep/repo-scripts`) and uses Effect v3 + static workspace glob patterns. The active CLI package in this repo is `@beep/repo-cli` (`tooling/cli`) and should own this command with:

- Effect v4 APIs
- current command registration patterns (`effect/unstable/cli`)
- current workspace discovery approach (root `package.json` workspaces, not hardcoded legacy globs)

## Primary Goal
Add one command in `@beep/repo-cli`:

1. `beep purge`
2. `beep purge --lock` (alias `-l`)

The command should remove the same classes of artifacts as the legacy script, while adapting directory discovery to this repo layout.

## Legacy Source of Truth
Behavioral source:

- `.repos/beep-effect/tooling/repo-scripts/src/purge.ts`

Legacy artifact sets:

- Workspace artifacts: `.tsbuildinfo`, `build`, `dist`, `.next`, `coverage`, `.turbo`, `node_modules`
- Root artifacts (always): `node_modules`, `.turbo`
- Root artifact (optional via flag): `bun.lock`

## Scope
### In Scope
- New `purge` command implementation under `tooling/cli/src/commands/`
- Root command tree registration in `tooling/cli/src/commands/root.ts`
- Public export update in `tooling/cli/src/index.ts`
- Command tests in `tooling/cli/test/purge.test.ts`
- Optional package script wiring for convenience (`beep:purge`) if consistent with existing script style

### Out of Scope
- Replacing or deleting `scripts/clean.mjs`
- Expanding purge behavior beyond legacy artifact intent (for example deleting `docs/`)
- Adding broader repo maintenance workflows unrelated to purge

## Target Command Contract
- `beep purge`
  - Removes root artifacts (`node_modules`, `.turbo`) and workspace artifacts.
- `beep purge --lock` / `beep purge -l`
  - Same as above, plus remove root `bun.lock`.

## Behavioral Requirements
1. Discover repo root using existing repo-utils root discovery (`findRepoRoot`).
2. Discover workspace package directories from current workspaces, not legacy hardcoded patterns.
3. Build purge targets from:
   - root artifact list
   - per-workspace artifact list
4. Remove targets using filesystem remove with `recursive: true` + `force: true` semantics (idempotent).
5. Log summary output including how many paths are targeted/removed.
6. Preserve legacy intent: removing missing paths must not fail command execution.

## Effect v4 + CLI Pattern Requirements
- Use Effect v4 imports and command APIs used by current CLI package:
  - `effect/unstable/cli` (`Command`, `Flag`)
  - `effect` services (`FileSystem`, `Path`) and `Effect.fn`
- Prefer repo-utils helpers/services where available:
  - `findRepoRoot`
  - `resolveWorkspaceDirs` (or equivalent workspace resolution via `FsUtils` + root `workspaces`)
- Use tagged/domain errors (`DomainError`) for operational failures instead of bare `Error`.
- Add JSDoc tags consistent with package conventions (`@since`, `@module`, `@category`).

## Execution Plan For Another Codex Instance

### Phase 0: Parity Audit
Deliverable:

- `specs/pending/repo-cli-purge-command/outputs/research.md`

Must include:

- Legacy purge behavior map from `.repos/beep-effect/tooling/repo-scripts/src/purge.ts`
- Current CLI command architecture notes (`root.ts`, `index.ts`, test harness patterns)
- Workspace discovery strategy decision for this repo

### Phase 1: Design
Deliverable:

- `specs/pending/repo-cli-purge-command/outputs/design.md`

Must include:

- Final command UX and flags
- Internal function boundaries (target discovery vs deletion vs logging)
- Error model and expected console output format
- Test strategy that avoids mutating real repo artifacts

### Phase 2: Implementation
Expected code areas:

- `tooling/cli/src/commands/purge.ts` (or `tooling/cli/src/commands/purge/` if split)
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- `tooling/cli/package.json` and/or root `package.json` scripts (only if adding a convenience script)

Implementation rules:

- No legacy static workspace glob list copied as-is.
- Use current monorepo workspace config as source of truth.
- Keep operations idempotent and safe for already-clean trees.

### Phase 3: Tests
Expected tests:

- `tooling/cli/test/purge.test.ts`

Minimum test coverage:

1. Removes workspace artifact directories/files from a temporary test repo fixture.
2. Removes root `node_modules` and `.turbo` by default.
3. Removes root `bun.lock` only when `--lock` is provided.
4. Succeeds when targets are already absent.
5. Command is registered under root command tree (discoverable from CLI).

### Phase 4: Verification
Run:

```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

Also verify command contract:

```bash
bun run beep purge --help
```

## Success Criteria
- [ ] `beep purge` command exists in `@beep/repo-cli`
- [ ] `--lock` / `-l` is implemented and documented in help output
- [ ] Purge behavior matches legacy intent for artifact categories
- [ ] Workspace discovery uses current repo patterns (no legacy hardcoded workspace list)
- [ ] Tests cover root + workspace deletion and lock-flag behavior
- [ ] Full repo verification commands pass

## Open Questions (resolve in Phase 0/1)
1. Should `purge` include a `--dry-run` mode now, or stay parity-only for v1?
2. Should a convenience script `beep:purge` be added in root `package.json`?
3. Should `tsconfig.tsbuildinfo` be included, or remain strict to legacy `FILES_TO_PURGE`?

## Exit Condition
This spec is complete when another Codex instance can execute Phases 0-4 and land a stable Effect v4 `beep purge` command in `tooling/cli` with passing tests and quality checks.
