# P3: Dependency, Security, And Platform Pruning

## Status

**COMPLETED**

P3 exit-gate work is complete: cleanup-caused security exceptions, former workspace-only root catalog entries, and the orphaned Playwright lane were pruned, the lockfile was refreshed, `audit:high` is clean without ignores, and the remaining `check` plus `build` failure is still the pre-existing `apps/editor-app` Pigment plugin declaration gap rather than a regression from this phase.

## Objective

Prune repo-level dependency, security, and platform drift exposed by the cleanup.

## Required Evidence

- root catalog and override changes
- lockfile impact
- security-exception changes
- Playwright, e2e, CI, or test config changes
- verification and audit summary
- phase commit reference

## Required Command Set

- `bun run version-sync --skip-network` when package graph drift exists
- `bun run lint:repo`
- `bun run audit:high`
- `bun run lint`
- `bun run check`
- `bun run test`

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `bun run trustgraph:context -- --prompt "P3 repo cleanup phase: retrieve any prior context about pnpm lockfile residues, root package-manager/docs cleanup, package-manager standardization, and verification blockers relevant to repo-cleanup-bloat-staleness."` | Limited signal | The helper did not yield concrete cleanup guidance in time, so P3 relied on direct repo inspection |
| `git log --oneline -5`; targeted `sed`; targeted `rg`; targeted `find`; targeted `node <<'EOF' ... EOF`; `git status --short`; `git diff --stat` | Success | Mapped cleanup-owned root catalog drift, confirmed the removed workspaces were the last live manifest consumers of the pruned entries, and proved the Playwright lane no longer had an `e2e/` suite behind it |
| `bun run version-sync --skip-network` | Success | Confirmed no version drift after the root package cleanup |
| `bun install --lockfile-only` | Success | Refreshed `bun.lock` after removing stale root catalog entries and the orphaned Playwright dependency |
| `bun run lint:repo` | Success | Repo metadata remained valid after the root package and workflow cleanup |
| `bun run audit:high` | Success | Reported `No vulnerabilities found` after removing the stale OSV ignore entries and refreshing the lockfile |
| `bun run lint` | Success | Full lint suite passed, including repo lint, schema-first inventory validation, and oxlint |
| `bun run check` | Failure, out of P3 scope | Reproduced the existing `apps/editor-app` missing `@pigment-css/vite-plugin` dependency declaration at `vite.config.ts:3` |
| `bun run test` | Success | Full test suite and `tstyche` passed after the P3 cleanup |
| `bun run build` | Failure, out of P3 scope | Reproduced the same `apps/editor-app` `@pigment-css/vite-plugin` module-resolution failure seen in `check` |

## Phase Commit

| Commit | Scope | Notes |
|---|---|---|
| `chore(repo): prune stale dependency and platform drift` | P3 dependency, security, and platform-config pruning | Created at P3 closeout in this session; report the exact hash from Git history after the phase commit lands |

## Findings

| Surface | Finding | Action | Notes |
|---|---|---|---|
| `osv-scanner.toml` | Both ignored advisories were stale after the P1 workspace removals | Removed both `IgnoredVulns` entries | The `apps/crypto-taxes` Next.js advisory no longer has a live app surface, and the `@anthropic-ai/claude-agent-sdk` transitive ignore disappeared with the former `@beep/ai-sdk` dependency graph |
| Root dependency catalog and lockfile | `@anthropic-ai/claude-agent-sdk`, `@cloudflare/sandbox`, `@openai/codex-sdk`, `zod`, `hoist-non-react-statics`, and `react-is` no longer had a live manifest consumer after `apps/web`, `apps/crypto-taxes`, and `packages/ai/sdk` were removed | Removed the stale root catalog entries and refreshed `bun.lock` | The refreshed lockfile no longer contains direct entries for the removed AI-only and Playwright-only packages |
| Root Playwright and e2e wiring | `playwright.config.ts`, `scripts/run-e2e.sh`, the root `test:e2e` script, the `@playwright/test` root dependency, and the GitHub `e2e` job remained even though the repo has no `e2e/` directory and the old Playwright config previously targeted `@beep/web` | Removed the orphaned Playwright lane | `scripts/run-github-checks.sh` now stops advertising an `e2e` mode, and `.github/workflows/check.yml` no longer provisions Playwright browsers or uploads a `playwright-report` artifact |
| Root overrides | The remaining override entries could not be tied with evidence to the removed workspaces | Preserved | P3 stayed narrow instead of pruning broader override hygiene opportunistically |
| `@pigment-css/vite-plugin` root catalog entry | It looked like a former `@beep/web` entry in manifest usage, but `apps/editor-app/vite.config.ts` still imports it | Preserved | This is a live-but-underdeclared package surface, not removable cleanup drift |
| `next` root catalog entry | It looked removable from manifest usage alone, but `packages/common/ui/src/components/tour.tsx` imports `next/link` and `sonner.tsx` imports `next-themes` | Preserved | This is broader dependency hygiene and was deferred instead of being deleted incorrectly |

## Deferred Findings For P4

| Finding | Notes |
|---|---|
| `packages/common/ui` imports `next/link` and `next-themes` without declaring `next` or `next-themes` in `packages/common/ui/package.json` | P3 preserved the root `next` catalog entry because those imports are live, but the package-manifest cleanup is broader than the workspace-removal pruning scope |

## Residual Risks

- `apps/editor-app` still needs `@pigment-css/vite-plugin` declared in `apps/editor-app/package.json` before repo-wide `check` and `build` can pass from a clean install.
- `packages/common/ui` appears to rely on undeclared Next-related dependencies; P3 preserved the root catalog entry rather than guessing at the right package-manifest fix.
- The repo no longer has a Playwright lane, so any future browser e2e coverage will need a fresh owner and a new test surface instead of reanimating the removed web-app pipeline accidentally.

## Handoff Notes For P4

- Start from the tighter P3 baseline: the stale OSV ignores are gone, the lockfile no longer carries the former `@beep/ai-sdk` direct packages, and the orphaned Playwright lane is removed from root scripts and CI.
- Treat the `packages/common/ui` Next and `next-themes` import mismatch as broader dependency hygiene, not as a deletion candidate to apply blindly.
- Keep the existing `apps/editor-app` Pigment plugin declaration gap in the blocker ledger unless a later phase intentionally chooses to fix package-manifest hygiene.

## Exit Gate

P3 is complete because the cleanup-caused dependency, security, and platform drift has been removed, `version-sync`, `lint:repo`, `audit:high`, `lint`, and `test` all passed, and the only remaining verification failures are the pre-existing `apps/editor-app` Pigment plugin declaration gap already tracked outside this phase.
