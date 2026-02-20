# Repo CLI tsconfig Sync: Orchestrator Prompt

Copy-paste this prompt into a new Codex session.

---

You are executing the spec at:
`specs/pending/repo-cli-tsconfig-sync/README.md`

Your mission is to complete the spec phases in order:
1. Research + parity map
2. Design
3. Implementation plan
4. Implementation
5. Testing + verification

## Hard Requirements
- Implement `beep tsconfig-sync` in `@beep/repo-cli` (`tooling/cli`) using Effect v4 + `effect/unstable/cli` patterns.
- Align behavior to current tsconfig standards (`tsconfig.base.json`, `tsconfig.packages.json`, root `tsconfig.json`, mixed package tsconfig layouts).
- Use current workspace discovery (root `package.json` workspaces), not legacy hardcoded globs.
- Support `--check` and `--dry-run` modes with deterministic output.
- Prevent destructive reference removal regressions (type-only import edge case).

## Required Deliverables
- `specs/pending/repo-cli-tsconfig-sync/outputs/research.md`
- `specs/pending/repo-cli-tsconfig-sync/outputs/design.md`
- `specs/pending/repo-cli-tsconfig-sync/outputs/implementation-plan.md`
- Implementation + tests in `tooling/cli`

## Key References
- `.repos/beep-effect/tooling/cli/src/commands/tsconfig-sync/`
- `.repos/beep-effect/specs/archived/tsconfig-sync-command/README.md`
- `.repos/beep-effect/specs/archived/tsconfig-sync-command/handoffs/FIX_TYPE_ONLY_IMPORTS.md`
- `tsconfig.base.json`
- `tsconfig.packages.json`
- `tsconfig.json`
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- `tooling/cli/src/commands/create-package/config-updater.ts`
- `tooling/repo-utils/src/Workspaces.ts`
- `tooling/repo-utils/src/DependencyIndex.ts`
- `tooling/repo-utils/src/TsConfig.ts`

## Verification Gate
Before handoff completion, run:

```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

And command checks:

```bash
bun run beep tsconfig-sync --help
bun run beep tsconfig-sync --dry-run
bun run beep tsconfig-sync --check
```
