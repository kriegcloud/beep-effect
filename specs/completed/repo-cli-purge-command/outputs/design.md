# Phase 1: Design (`beep purge`)

## Command UX

## Commands
- `beep purge`
  - Purges root artifacts (`node_modules`, `.turbo`) and workspace artifacts.
- `beep purge --lock`
- `beep purge -l`
  - Same as above, plus removes root `bun.lock`.

## Help text
- Command description: remove root/workspace build artifacts across repo workspaces.
- Flag description for `--lock`/`-l`: include root `bun.lock` in purge targets.

## Internal Architecture
Implement `tooling/cli/src/commands/purge.ts` with three internal responsibilities.

1. **Target discovery**
- Find repo root using `findRepoRoot()`.
- Resolve workspace dirs from current workspace config using `resolveWorkspaceDirs(rootDir)`.
- Build deduplicated absolute targets:
  - Root artifacts always.
  - Root lock artifact conditionally (`--lock`).
  - Workspace artifact names for each resolved workspace directory.

2. **Deletion execution**
- Remove each target via `FileSystem.remove(target, { recursive: true, force: true })`.
- Preserve idempotency for missing paths.
- Compute summary metrics:
  - `targetedCount`: number of candidate paths.
  - `removedCount`: number of paths that existed before deletion (`fs.exists` pre-check).

3. **Console summary output**
- Start line: targeted paths and workspace count.
- Completion line: targeted vs actually-existing removed count.
- Keep output concise and deterministic.

## Constants
In `purge.ts` define command-local constants mirroring legacy artifact classes:
- `WORKSPACE_ARTIFACTS = [".tsbuildinfo", "build", "dist", ".next", "coverage", ".turbo", "node_modules"]`
- `ROOT_ARTIFACTS = ["node_modules", ".turbo"]`
- `ROOT_LOCK_ARTIFACT = "bun.lock"`

## Error Model
- Operational failures should surface as tagged domain errors (`DomainError`) for purge-specific failures.
- Root/workspace resolution errors from repo-utils propagate as tagged errors (`NoSuchFileError | DomainError`).
- Any filesystem remove failure is mapped to `DomainError` with target path context.

## Registration / Exports
- Register `purgeCommand` in `tooling/cli/src/commands/root.ts` via `Command.withSubcommands([...])`.
- Export `purgeCommand` from `tooling/cli/src/index.ts` alongside other command exports.

## Test Strategy (`tooling/cli/test/purge.test.ts`)
Use temp fixture repos so tests do not mutate real workspace artifacts.

### Layer setup
- Same harness style as existing CLI tests:
  - `NodeFileSystem.layer`
  - `NodePath.layer`
  - `NodeTerminal.layer`
  - `TestConsole.layer`
  - mocked `ChildProcessSpawner`
  - `FsUtilsLive`

### Cases
1. Purges workspace artifact file/dirs for workspaces derived from root `package.json` workspaces.
2. Purges root `node_modules` and `.turbo` by default.
3. Leaves root `bun.lock` by default, removes it only when lock option is enabled.
4. Succeeds when target paths are already absent (idempotent run).
5. Confirms registration under root command tree (`rootCommand.subcommands`).

### Fixture shape
- Minimal fake repo root with:
  - `.git` marker
  - root `package.json` containing custom `workspaces` glob(s)
  - workspace dirs each with `package.json` names
  - seeded purge artifacts (file + directories)

## Non-Goals (v1)
- No dry-run mode.
- No expansion beyond legacy artifact classes.
- No replacement of existing repo-level cleanup scripts.
