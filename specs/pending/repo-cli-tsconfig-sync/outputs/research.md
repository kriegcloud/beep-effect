# Phase 0: Research + Parity Map

## 1. Legacy Behavior Map (`.repos/beep-effect/tooling/cli/src/commands/tsconfig-sync/*`)

| Legacy area | Observed behavior | Keep / Adapt / Drop | Notes for beep-effect2 |
| --- | --- | --- | --- |
| `index.ts` CLI flags + modes | `--check`, `--dry-run`, `--filter`, `--verbose`, plus legacy `--no-hoist`, `--packages-only`, `--apps-only` | **Adapt** | Keep core CI-safe modes (`check`/`dry-run`) and scoped debug flags; drop legacy mode flags not required by current spec. |
| Workspace discovery (`discover.ts`) | Builds dep index, tsconfig path map, adjacency list, cycle checks | **Keep** | Same intent, but use current repo-utils APIs and current workspace discovery (`package.json.workspaces`). |
| Reference computation (`references.ts`) | Derives refs from workspace deps, topological ordering, merges existing refs | **Keep + Adapt** | Keep deterministic dependency-driven refs and existing-ref merge safety; adapt path/owner logic to current tsconfig layout. |
| Tsconfig file sync (`tsconfig-file-sync.ts`) | Synces `build/src/test` config families with check/dry-run/sync mode | **Adapt** | Current repo is mostly single-file `tsconfig.json` with mixed split layouts; owner matrix must be redesigned. |
| JSONC writer (`utils/tsconfig-writer.ts`) | `jsonc-parser` read/check/write preserving comments and formatting | **Keep** | Same update strategy should be used for root/package tsconfig edits. |
| package.json dependency sync (`package-sync.ts`) | Hoisting + sorting dependency fields | **Drop** | Out of scope for this spec; keep implementation strictly tsconfig-focused. |
| Next.js app sync (`app-sync.ts`) | App-specific path/references logic | **Drop** | Not part of current spec scope. |

## 2. Current Repo Tsconfig Contract Map

### Root

- `tsconfig.base.json`
  - Base compiler contract (`composite: true`, strict flags, plugin config).
- `tsconfig.packages.json`
  - Build entrypoint using `references` to workspace directories.
  - Expected by spec to be deduped and deterministically ordered.
- `tsconfig.json`
  - Root typecheck project + path aliases.
  - Alias contract from spec:
    - `@beep/<name>` -> `./<workspacePath>/src/index.ts`
    - `@beep/<name>/*` -> `./<workspacePath>/src/*.ts`
  - Non-command-owned aliases must be preserved.

### Workspace discovery baseline

- Root `package.json.workspaces` currently:
  - `scratchpad`
  - `groking-effect-v4`
  - `packages/*`
  - `tooling/*`
  - `apps/*`
- Required discovery behavior: derive from this source of truth (no hardcoded globs in command code).

### Package tsconfig layout reality (mixed)

- **Single-config layout (majority)**
  - `tooling/cli/tsconfig.json`
  - `tooling/repo-utils/tsconfig.json`
  - `tooling/codebase-search/tsconfig.json`
  - several `tooling/_test-*` workspaces
- **Split/mixed layout**
  - `groking-effect-v4`: `tsconfig.json` + `tsconfig.src.json` + `tsconfig.test.json` + `tsconfig.build.json`
  - `tooling/codebase-search`: `tsconfig.json` + `tsconfig.test.json`

Implication: reference ownership cannot assume one universal shape.

## 3. Behavior Keep / Adapt / Drop List

### Keep

- Deterministic sync outputs and idempotent writes.
- Cycle detection before mutation.
- Check mode (no write, non-zero on drift).
- Dry-run mode (no write, report planned changes).
- JSONC-safe modifications via `jsonc-parser`.

### Adapt

- Reference ownership strategy for mixed tsconfig families.
- Root reference target format to current standard (`tsconfig.packages.json` directory refs).
- Root alias sync to current canonical `@beep/*` pattern while preserving unrelated aliases.
- Filter semantics for current workspace names/paths.

### Drop

- Legacy dependency hoisting/sorting of `package.json`.
- Legacy app-specific tsconfig sync paths.
- Legacy layout assumptions (`tsconfig.base.jsonc`, strict build/src/test triplets everywhere).

## 4. Legacy Failure Modes and Required Mitigation

### Type-only import destructive removal regression

Source: `.repos/beep-effect/specs/archived/tsconfig-sync-command/handoffs/FIX_TYPE_ONLY_IMPORTS.md`

- Root cause: computed refs were based only on package.json dependency fields.
- Failure: existing references needed for type-only imports (not declared in package.json) were removed.
- Required mitigation in this implementation:
  - Compute expected refs from workspace dependencies.
  - Read existing refs.
  - Preserve valid existing refs by unioning them with computed refs.
  - Remove only stale refs pointing to non-existent targets.

This directly satisfies the hard requirement to prevent destructive reference removal regressions.

## 5. Key Parity Conclusions for Phase 1 Design

1. Command scope remains tsconfig-only.
2. Use repo-utils (`findRepoRoot`, `resolveWorkspaceDirs`, `buildRepoDependencyIndex`, `collectTsConfigPaths`, `detectCycles`, `topologicalSort`) as the discovery/graph foundation.
3. Manage three synchronization surfaces:
   - root `tsconfig.packages.json` references,
   - root `tsconfig.json` canonical aliases,
   - per-workspace owner tsconfig references.
4. Build package reference logic around mixed-layout ownership rules and non-destructive merge semantics.
