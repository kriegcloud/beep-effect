# Phase 2: Implementation Plan

## 1. File Touch List

Planned files:

- `tooling/cli/src/commands/tsconfig-sync.ts`
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- `tooling/cli/test/tsconfig-sync.test.ts`

Spec outputs:

- `specs/pending/repo-cli-tsconfig-sync/outputs/research.md`
- `specs/pending/repo-cli-tsconfig-sync/outputs/design.md`
- `specs/pending/repo-cli-tsconfig-sync/outputs/implementation-plan.md`

## 2. Ordered Implementation Steps

1. Create `tsconfig-sync` command module
- Define CLI flags (`check`, `dry-run`, `filter`, `verbose`) with `effect/unstable/cli`.
- Define command-local tagged errors for cycle and drift.
- Define mode resolution and deterministic reporting helpers.

2. Build workspace discovery and sync planning
- Use `findRepoRoot`, `resolveWorkspaceDirs`, `buildRepoDependencyIndex`, `collectTsConfigPaths`.
- Build workspace metadata (name, rel path, owner tsconfig file).
- Build adjacency list and run cycle detection.

3. Implement root sync planners
- Root references (`tsconfig.packages.json`) expected list generation.
- Root aliases (`tsconfig.json`) canonical ownership + manual alias preservation.
- JSONC-safe read/modify/write with write-if-changed semantics.

4. Implement package reference sync planner
- Owner file matrix (build vs single).
- Compute expected dependency refs with topological ordering.
- Merge with valid existing refs to protect type-only use cases.
- Remove stale non-existent refs.

5. Implement mode execution
- `sync`: write changed files and print summary.
- `dry-run`: no write, print deterministic planned changes.
- `check`: no write, fail with drift tagged error when changes planned.

6. Wire command
- Add command registration in `root.ts`.
- Export from `index.ts`.

7. Add fixture-driven tests
- Cover root references, root aliases, mixed layouts, check/dry-run, stale removal, type-only preservation, idempotency, registration.

8. Run verification gate
- Build, typecheck, tests, lint checks, and command invocations.

## 3. Risk Controls for Destructive Edits

- Never rewrite entire tsconfig documents from `JSON.stringify`; use `jsonc-parser` edits.
- Restrict alias ownership to canonical keys only.
- For package refs, preserve existing refs that still resolve to existing targets.
- Remove only references resolving to non-existent paths.
- Use write-if-changed guards to avoid noise and preserve idempotency.
- Keep deterministic sorted output so check/dry-run are stable in CI.

## 4. Rollback Strategy

If a regression appears:

1. Re-run command in `--dry-run` and inspect planned changes.
2. Narrow issue with `--filter` on impacted package.
3. Revert command-introduced file edits in working tree (targeted git checkout of touched files only if needed).
4. Disable package-reference writes temporarily by short-circuiting package sync block while root sync remains available.
5. Re-run full verification gate before final handoff.
