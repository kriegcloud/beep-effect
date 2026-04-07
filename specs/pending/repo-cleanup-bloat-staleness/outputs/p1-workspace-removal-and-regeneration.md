# P1: Targeted Workspace Removal And Regeneration

## Status

**COMPLETED**

P1 exit-gate work is complete: the target workspaces are removed, direct active references are gone, managed artifacts were regenerated, and the remaining verification failures are broader repo issues rather than live references to the removed workspaces.

## Objective

Remove the approved workspaces and clean active references while preserving historical evidence by default.

## Target Workspaces

- `apps/clawhole` as `@beep/clawhole`
- `apps/web` as `@beep/web`
- `apps/crypto-taxes` as `@beep/crypto-taxes`
- `packages/ai/sdk` as `@beep/ai-sdk`

## Affected-Surface Map

| Surface | Evidence | Action Taken | Notes |
|---|---|---|---|
| Root workspace wiring | `package.json` workspace globs and root scripts referenced removed workspaces | Removed the `packages/ai/*` workspace glob and the `packages/ai/sdk/tmp/**` lint exclusion | Workspace deletion now matches root package metadata |
| TS project graph and package discovery | `tsconfig.json`, `tsconfig.packages.json`, `tsconfig.quality.packages.json`, `tstyche.json`, `syncpack.config.ts`, `apps/editor-app/docgen.json`, `apps/editor-app/tsconfig.json`, `scratchpad/tsconfig.json` | Regenerated and cleaned references so deleted workspaces no longer appear in active project metadata | `config-sync` unexpectedly removed `.claude` and `.codex` references, so those were restored manually after regeneration |
| Identity registry | `packages/common/identity/src/packages.ts` exposed the removed packages as active composers | Removed the deleted package composers and their exported IDs | Keeps runtime package lookup aligned with the live repo graph |
| Tooling, lint, and test fixtures | `playwright.config.ts`, `tooling/configs/src/eslint/ESLintConfig.ts`, `tooling/configs/test/eslint-rules.test.ts`, `tooling/cli/src/commands/Lint/index.ts`, `tooling/cli/src/commands/Lint/SchemaFirst.ts`, `tooling/cli/src/commands/Shared/TypeScriptSourceExclusions.ts`, `tooling/cli/test/docgen.test.ts`, `tooling/repo-utils/test/TSMorph.service.test.ts` | Removed deleted-workspace paths and rewrote fixtures to use surviving packages | Prevents repo tooling from depending on removed paths |
| Managed standards and lockfile artifacts | `standards/schema-first.inventory.jsonc` and `bun.lock` still reflected the old workspace graph | Rebuilt the schema-first inventory and refreshed the lockfile from the remaining workspace set | `bun run purge --lock` plus a clean `bun install` produced the final lockfile state |
| Generated documentation | `docs/` contained generated pages from the removed workspaces before regeneration | Re-ran docgen and verified no generated docs remain rooted under the removed workspaces | Historical docs under `specs/` were intentionally preserved |
| Security-scan config | `osv-scanner.toml` still contains an `apps/crypto-taxes`-specific ignored advisory | Deferred | P3-owned surface; preserved for its owning phase |

## Safest Removal Order

1. Remove direct root and tooling references so managed commands do not keep reintroducing the deleted workspaces.
2. Delete the four workspace directories.
3. Regenerate config, inventory, and lockfile artifacts from the surviving workspace graph.
4. Rebuild generated docs and run repo-wide verification to confirm the deleted workspaces are no longer part of active surfaces.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `git status --short`; targeted `rg`; targeted `find docs ...` | Success | Used to map active surfaces before and after cleanup |
| `rm -rf apps/clawhole apps/web apps/crypto-taxes packages/ai/sdk` | Success | Removed the P1-owned workspaces |
| `bun run config-sync` | Success | Regenerated managed config files; `.claude` and `.codex` refs were restored manually afterward |
| `bun run beep lint schema-first --write` | Success | Refreshed `standards/schema-first.inventory.jsonc` after workspace deletion |
| `bun install --lockfile-only` | Success | Refreshed the lockfile after the first workspace-graph cleanup pass |
| `bun run version-sync --skip-network` | Success | Version catalog remained in sync |
| `bun run purge --lock` | Success | User-requested clean-state verification pass; removed docs, build outputs, `node_modules`, and the lockfile |
| `bun install` | Success with warnings | Reinstalled from the reduced workspace graph; repeated existing `@mui/material@9.0.0-beta.1` peer warnings |
| `bun run build` | Failure, out of P1 scope | Existing `apps/editor-app` build blocker: `vite.config.ts` imports `@pigment-css/vite-plugin`, but `apps/editor-app/package.json` does not declare it |
| `bun run docgen` | Success | Rebuilt generated docs for surviving workspaces only |
| `bun run lint` | Success | Full lint suite passed, including schema-first inventory validation with `stale_entries=0` |
| `bun run check` | Failure, out of P1 scope | Existing `@beep/editor-app#check` failure: missing `@pigment-css/vite-plugin` type/module resolution |
| `bun run test` | Success | Full test suite passed after the workspace removal |
| `bun run check:full` | Failure, out of P1 scope | Surfaced broader repo typecheck issues plus missing built declaration outputs after the purge/build interruption; no deleted-workspace refs remained in the failure set |

## Historical References Preserved

| Surface | Reason Preserved | Notes |
|---|---|---|
| `specs/pending/repo-cleanup-bloat-staleness/**` | Active cleanup spec and historical execution evidence | Needed for phase coordination and auditability |
| Completed writeups and research docs that mention removed code | Historical evidence | Preserved by default per P0 policy |
| Pending specs that mention removed workspaces as past or future context | Historical or ambiguous documentation | Left untouched unless they were active operator surfaces for P1 |

## Deferred Findings For Later Phases

| Finding | Carry To | Notes |
|---|---|---|
| `osv-scanner.toml` still carries the `apps/crypto-taxes` ignore entry | P3 | Platform or security-config cleanup is P3-owned |
| Existing `apps/editor-app` build and check failure caused by missing `@pigment-css/vite-plugin` | P5 | Verification-only finding; not introduced by P1 |
| Broader repo `check:full` baseline type errors and dist-output expectations | P5 | Recorded during verification, but outside P1 workspace-removal scope |

## Repo-Wide Verification Summary

- Direct reference sweep after regeneration is clean outside the already-deferred `osv-scanner.toml` entry.
- `bun run lint` passed completely after the workspace removal.
- `bun run test` passed completely after the workspace removal.
- `bun run check` and `bun run build` remain blocked by an existing editor-app dependency declaration gap.
- `bun run check:full` remains red for broader baseline issues that are not tied to the removed workspaces.

## Phase Commit

| Commit | Scope | Notes |
|---|---|---|
| `chore(repo): remove deprecated workspaces` | P1 targeted workspace removal and managed-artifact regeneration | Created at P1 closeout in this session; resolve the exact hash from Git history after the phase commit lands |

## Residual Risks

- `apps/editor-app` still needs `@pigment-css/vite-plugin` declared if build and `check` are expected to pass from a clean install.
- `check:full` is not a P1-specific gate today because the repo still has broader baseline typecheck failures unrelated to the removed workspaces.
- P3 still needs to prune the stale `osv-scanner.toml` exception.

## Handoff Notes For P2

- Start from the regenerated `docs/` tree rather than the pre-cleanup assumptions; P1 already removed generated docs rooted under the deleted workspaces.
- Treat any remaining docgen issues as ownership or stale-generated-artifact questions, not as live workspace-reference cleanup.
- Do not reopen the removed-workspace deletion scope unless P2 discovers a docgen-owned surface that was missed by the final ref sweep.

## Exit Gate

P1 is complete because the target workspaces, their active references, and the resulting managed-artifact drift were removed and verified, with unrelated repo-baseline failures logged explicitly instead of being misattributed to the phase.
