# Phase 1: Design

## 1. Final Command UX

Command:

- `beep tsconfig-sync`
- `beep tsconfig-sync --check`
- `beep tsconfig-sync --dry-run`
- `beep tsconfig-sync --filter <workspace package name or workspace path>`
- `beep tsconfig-sync --verbose`

Flag semantics:

- `--check`
  - Read-only.
  - Computes drift and exits non-zero when any file would change.
- `--dry-run`
  - Read-only.
  - Prints deterministic planned changes.
  - Exits zero.
- default (no mode flag)
  - Applies updates (write only when content differs).
- `--filter`
  - Narrows package-level sync to matching workspace package(s).
  - Accepts either package name (for example `@beep/repo-cli`) or workspace-relative path (for example `tooling/cli`).
  - Root config sync remains global (root files represent workspace-wide state).
- `--verbose`
  - Adds per-package details (owner config, computed refs, preserved refs, skipped files).

Mode precedence:

- `--check` takes precedence if both `--check` and `--dry-run` are passed.

## 2. Reference Ownership Matrix

| Workspace shape | Detection rule | Managed owner file | Rationale |
| --- | --- | --- | --- |
| Single-config package | `tsconfig.build.json` absent, `tsconfig.json` present | `tsconfig.json` | Most current workspaces use this shape. |
| Split-config package | `tsconfig.build.json` present | `tsconfig.build.json` | Build-facing references belong on build config; avoids clobbering aggregator `tsconfig.json` local refs. |
| Unsupported/missing | No recognized owner file | none (skip with verbose note) | Avoid destructive guesses. |

Per-package owner file references are the only package-level references managed by this command.

## 3. Reference Path Format Decision

Decision:

- Use explicit file references for package-level sync.
- Format: normalized relative path from owner tsconfig directory to dependency owner tsconfig file.

Examples:

- `../repo-utils/tsconfig.json`
- `../../groking-effect-v4/tsconfig.build.json`

Why:

- Works across single and split layouts.
- Removes ambiguity of directory resolution when split build configs are used.
- Deterministic and easy to diff.

## 4. Root Alias Ownership Policy (`tsconfig.json`)

Command-owned aliases:

- Only canonical keys matching the two-shape contract for workspace packages named `@beep/<name>`:
  - `@beep/<name>`
  - `@beep/<name>/*`

Owned values are enforced to:

- `@beep/<name>` -> `./<workspacePath>/src/index.ts`
- `@beep/<name>/*` -> `./<workspacePath>/src/*.ts`

Preservation policy:

- Preserve all non-canonical/manual aliases (for example `@beep/<name>/test/*`, `@/*`, `*`).
- Remove stale canonical aliases for packages no longer present in workspace discovery.

## 5. Root References Policy (`tsconfig.packages.json`)

- Command owns the `references` array.
- Expected entries are workspace-relative directories discovered from root workspaces for packages with a project tsconfig.
- Entries are deduped and sorted deterministically.

## 6. Non-Destructive Merge Strategy (Type-only Safety)

For each managed package owner tsconfig:

1. Compute expected refs from workspace dependencies.
2. Read existing refs.
3. Resolve existing refs to real paths.
4. Keep existing refs only when target still exists.
5. Remove existing refs whose target path does not exist (stale/deleted).
6. Final refs = `computed refs (topological order)` + `valid existing extras`.

This preserves refs required for type-only imports while still pruning clearly stale targets.

## 7. Dependency Graph and Ordering

- Build dependency graph from `buildRepoDependencyIndex` (workspace deps across dependency sections).
- Run cycle detection before writes.
- For each package’s selected dependency subset, topologically order dependencies for deterministic refs.

## 8. Drift Reporting Format + Exit Behavior

Deterministic change model:

- Each planned/applied change emits a stable record:
  - file path
  - section (`root-references`, `root-aliases`, `package-references`)
  - summary (`added/removed/reordered` counts)
- Output sorted by file path then section.

Exit behavior:

- `sync` mode: exit 0 (unless operational error/cycle error).
- `dry-run` mode: exit 0.
- `check` mode:
  - exit 0 when no drift,
  - fail with tagged drift error when drift exists.

Error model:

- Operational read/write/parse failures map to `DomainError`.
- Command-local tagged errors for cycle detection and drift reporting.
