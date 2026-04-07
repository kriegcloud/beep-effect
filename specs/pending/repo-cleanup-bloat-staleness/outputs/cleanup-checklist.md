# Repo Cleanup Checklist

## Phase Status Legend

- `BOOTSTRAPPED`
- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`
- `BLOCKED`

## Candidate Status Legend

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`
- `REJECTED`

## Spec Bootstrap

- [x] Spec package created at `specs/pending/repo-cleanup-bloat-staleness/`
- [x] Root canonical files created
- [x] Handoffs and orchestrator prompts created
- [x] Prompt assets created
- [x] Phase output scaffolding created
- [x] Prompt artifact created
- [x] Grill log created
- [x] Execution checklist created
- [x] P0 session executed
- [x] Implementation started

## Phase Entrypoints

| Phase | Handoff | Orchestrator | Output |
|---|---|---|---|
| P0 | `handoffs/HANDOFF_P0.md` | `handoffs/P0_ORCHESTRATOR_PROMPT.md` | `outputs/p0-planning-and-document-classification.md` |
| P1 | `handoffs/HANDOFF_P1.md` | `handoffs/P1_ORCHESTRATOR_PROMPT.md` | `outputs/p1-workspace-removal-and-regeneration.md` |
| P2 | `handoffs/HANDOFF_P2.md` | `handoffs/P2_ORCHESTRATOR_PROMPT.md` | `outputs/p2-docgen-verification-and-cleanup.md` |
| P3 | `handoffs/HANDOFF_P3.md` | `handoffs/P3_ORCHESTRATOR_PROMPT.md` | `outputs/p3-dependency-security-and-platform-pruning.md` |
| P4 | `handoffs/HANDOFF_P4.md` | `handoffs/P4_ORCHESTRATOR_PROMPT.md` | `outputs/p4-ranked-candidate-inventory.md` |
| P5 | `handoffs/HANDOFF_P5.md` | `handoffs/P5_ORCHESTRATOR_PROMPT.md` | `outputs/p5-final-closeout.md` |
| P6 | `handoffs/HANDOFF_P6.md` | `handoffs/P6_ORCHESTRATOR_PROMPT.md` | `outputs/p6-reuse-discovery-design-and-contract.md` |
| P7 | `handoffs/HANDOFF_P7.md` | `handoffs/P7_ORCHESTRATOR_PROMPT.md` | `outputs/p7-reuse-tool-implementation-and-pilot.md` |

## Phase Tracker

| Phase | Scope | Status | Last Updated | Notes |
|---|---|---|---|---|
| P0 | Plan, grill, and classify active versus historical documentation | `COMPLETED` | 2026-04-06 | Exit gate met; phase boundaries, preservation policy, verification contract, commit cadence, and deletion approval rules are now explicit |
| P1 | Remove `apps/clawhole`, `apps/web`, `apps/crypto-taxes`, and `packages/ai/sdk`; regenerate managed config and docs | `COMPLETED` | 2026-04-07 | Exit gate met: live workspace refs are removed, managed artifacts were regenerated, `lint` and `test` passed, and broader `build` or `check` failures were recorded as unrelated repo-baseline findings |
| P2 | Verify local `@beep/docgen` ownership and remove stale docgen references or generated artifacts | `COMPLETED` | 2026-04-07 | Exit gate met: repo-local docgen ownership is proven, `packages/editor/runtime` now has explicit docgen config, stale README guidance was removed, `docgen` plus `lint` and `test` passed, and the existing editor-app `check` blocker was recorded as unrelated |
| P3 | Prune unused root dependency catalog entries, security exceptions, and orphaned platform or test config | `COMPLETED` | 2026-04-07 | Exit gate met: stale OSV ignores, former workspace-only catalog entries, and the orphaned Playwright lane are removed; broader dependency hygiene findings were logged instead of widened into this phase |
| P4 | Ranked candidate inventory and incremental cleanup loop | `COMPLETED` | 2026-04-07 | Inventory exhausted: two candidates were intentionally preserved and two approved cleanups landed with verification and per-candidate commits |
| P5 | Final quality and TrustGraph closeout | `COMPLETED` | 2026-04-07 | Exit gate met: final `lint`, `check`, `test`, `check:full`, and the follow-up `test:storybook` lane are green, curated TrustGraph sync is recorded, and the repo is ready for review plus optional push confirmation |
| P6 | Reuse-discovery methodology, contracts, and orchestration design | `COMPLETED` | 2026-04-07 | Exit gate met: the `beep reuse` command surface, partition model, catalog strategy, Codex SDK seam, and RAG deferral are documented clearly enough for implementation |
| P7 | Reuse tool implementation and tooling-stack pilot | `COMPLETED` | 2026-04-07 | Exit gate met: the reuse services, CLI commands, tests, and tooling pilot are implemented and verified without widening into autonomous repo-wide edits |

## Candidate Review Ledger

| Candidate ID | Category | Description | Decision | Cleanup Status | Verification | Commit | Notes |
|---|---|---|---|---|---|---|---|
| `P4-C01` | Empty excluded workspace | Remove the tracked but effectively empty `scratchpad/` workspace and its root exclusions if approved | Rejected by user | `REJECTED` | Not run | None | Kept intentionally because the user uses `scratchpad/` to sandbox ideas |
| `P4-C02` | Orphaned disabled tooling surface | Remove the half-disabled Lost Pixel visual-regression residue if approved | Approved by user | `COMPLETED` | `rg -n "test:visual|lost-pixel|lostpixel" . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'` is clean; `bun run version-sync --skip-network`, `bun install --lockfile-only`, `bun run lint:repo`, and `bun run lint` passed; the original `test:storybook` environment failure was later resolved by making `@beep/ui` self-provision its Playwright Chromium headless shell before running Vitest browser tests | `chore(repo): remove stale visual-regression residue` | Candidate cleanup stayed scoped to Lost Pixel; a same-day follow-up removed the leftover Storybook provisioning caveat without reopening the candidate |
| `P4-C03` | Unused internal package | Review removal of `packages/_internal/db-admin` if the repo no longer intends to grow it | Rejected by user | `REJECTED` | Not run | None | Kept intentionally for future shared migrations between vertical slices |
| `P4-C04` | Unused provider package | Review removal of `packages/shared/providers` if the 1Password provider surface is abandoned | Approved by user | `COMPLETED` | `rg -n "@beep/shared-providers|shared/providers|shared-providers|@1password/sdk" . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'` is clean; `find docs -maxdepth 3 -type f | sort | rg 'shared/providers|shared-providers|providers'` is clean; `bun run config-sync`, `bun run docgen`, `bun run version-sync --skip-network`, `bun install --lockfile-only`, `bun run lint`, `bun run check`, and `bun run test` all passed | `chore(repo): remove stale shared providers package` | Completed without widening into future provider work; active refs, managed docs, tsconfig wiring, and the root `@1password/sdk` residue are removed |

## Documentation Classification Ledger

| Item | Classification | Action | Notes |
|---|---|---|---|
| Root config and quality wiring referencing target workspaces | Active surface | Remove or regenerate during the owning implementation phase | Includes `package.json`, `tsconfig*.json`, `tsconfig.json` path aliases, `playwright.config.ts`, `tstyche.json`, `osv-scanner.toml`, lint config, and `bun.lock` |
| Standards inventories and managed repo metadata referencing target workspaces | Active surface | Update or regenerate when the owning phase touches them | Includes `standards/schema-first.inventory.jsonc` and managed docgen or repo-tooling outputs |
| Completed security writeups and historical research referencing removed code | Historical evidence | Preserve by default | Rewrite only if the document stops making sense or breaks navigation after cleanup |
| Pending specs that mention removed code as future or past context | Historical or ambiguous | Preserve unless the document is still an active operator entrypoint for the cleanup | Escalate only when the document is both current navigation and historical evidence |

## Verification Log

| Date | Scope | Commands | Result | Notes |
|---|---|---|---|---|
| 2026-04-06 | Spec bootstrap | Not run | N/A | Canonical phased structure created; no repo quality commands required yet |
| 2026-04-06 | P0 evidence gathering | `bun run codex:hook:session-start`; `bun run trustgraph:status`; targeted `rg`; `sed`; `find`; `git status --short` | Success | TrustGraph status was informative, targeted TrustGraph context summary was not; repo evidence confirmed live workspace refs and preserved historical docs to keep |
| 2026-04-07 | P1 affected-surface mapping | `git status --short`; `sed`; targeted `rg`; `find docs -maxdepth 3 -type f` | Success | Confirmed direct P1 surfaces in root workspace wiring, identity composers, lint and docgen tooling, Playwright config, standards inventory, generated docs, and lockfile; deferred the `apps/crypto-taxes` OSV exception to P3 |
| 2026-04-07 | P1 regeneration and verification | `bun run config-sync`; `bun run beep lint schema-first --write`; `bun install --lockfile-only`; `bun run version-sync --skip-network`; `bun run purge --lock`; `bun install`; `bun run build`; `bun run docgen`; `bun run lint`; `bun run check`; `bun run test`; `bun run check:full` | Mixed | `lint` and `test` passed after cleanup, `build` and `check` remained blocked by the existing `apps/editor-app` missing `@pigment-css/vite-plugin` dependency, and `check:full` exposed broader repo-baseline typecheck issues plus missing built outputs after the purge/build interruption |
| 2026-04-07 | P2 docgen verification and cleanup | targeted `sed`; targeted `rg`; targeted `find docs ...`; `bun run beep docgen status --verbose`; `bun run beep docgen init -p packages/editor/runtime --dry-run`; `bun run docgen`; `bun run lint`; `bun run check`; `bun run test` | Mixed | `docgen`, `lint`, and `test` passed; `check` reproduced the pre-existing `apps/editor-app` missing `@pigment-css/vite-plugin` dependency blocker while docgen ownership and generated-doc state were otherwise clean |
| 2026-04-07 | P3 dependency, security, and platform pruning | targeted `sed`; targeted `rg`; targeted `find`; targeted `node <<'EOF' ... EOF`; `bun run version-sync --skip-network`; `bun install --lockfile-only`; `bun run lint:repo`; `bun run audit:high`; `bun run lint`; `bun run check`; `bun run test`; `bun run build` | Mixed | `version-sync`, `lint:repo`, `audit:high`, `lint`, and `test` passed; `check` and `build` still fail on the pre-existing `apps/editor-app` missing `@pigment-css/vite-plugin` declaration while stale OSV, lockfile, and Playwright drift are otherwise gone |
| 2026-04-07 | Post-P3 editor-app dependency fix baseline | `bun install`; `bun run check --filter=@beep/editor-app`; `bun run build --filter=@beep/editor-app`; `bun run check`; `bun run build` | Success | Resolved the earlier Pigment dependency gap in commit `83166a377d`; P4 starts from a green `check` and `build` baseline |
| 2026-04-07 | P4 candidate `P4-C02` visual-regression residue cleanup | `rg -n "test:visual|lost-pixel|lostpixel" . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'`; `bun run version-sync --skip-network`; `bun install --lockfile-only`; `bun run lint:repo`; `bun run lint`; `bun run test:storybook` | Mixed | Active Lost Pixel refs are gone and repo metadata checks passed; `test:storybook` still fails because Playwright browser binaries are missing from the local environment |
| 2026-04-07 | P4 candidate `P4-C04` shared-providers cleanup | `rg -n "@beep/shared-providers|shared/providers|shared-providers|@1password/sdk" . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'`; `find docs -maxdepth 3 -type f | sort | rg 'shared/providers|shared-providers|providers'`; `bun run config-sync`; `bun run docgen`; `bun run version-sync --skip-network`; `bun install --lockfile-only`; `bun run lint`; `bun run check`; `bun run test` | Success | The shared-providers workspace, its identity and tsconfig wiring, its generated docs, and the root `@1password/sdk` residue are all gone from active repo surfaces |
| 2026-04-07 | P5 final validation and baseline closeout | `bun run lint`; `bun run check`; `bun run test`; `bun run check:full`; `bun run trustgraph:sync-curated` | Success | Final verification is green on the same tree; P5 also closed the lingering strict-root typecheck issues by tightening the editor-app test boundary, several tests, and the Bun glob shim without leaning on broad type assertions, and curated TrustGraph sync found 34 docs already current with 0 uploads needed |
| 2026-04-07 | Post-closeout Storybook follow-up | `bun install`; `bun run test:storybook`; `bun run lint`; `bun run check`; `bun run test`; `bun run build` | Success | The remaining optional Storybook browser-provisioning caveat is resolved: `@beep/ui` now installs the required Playwright Chromium headless shell on demand, the obsolete setup-file warning is gone, and the same tree is green for Storybook plus the standard repo-wide validation set |
| 2026-04-07 | P6 design and contract work | `bun run codex:hook:session-start`; targeted `sed`; targeted `rg`; targeted `find`; targeted `ps` | Mixed | TrustGraph MCP initialization returned a non-2xx response in this session, so repo-context startup was treated as skipped; the phase still produced the approved reuse-discovery methodology, contracts, and orchestration boundary from local repo evidence |
| 2026-04-07 | P7 targeted reuse-tool verification | `bunx turbo run check --filter=@beep/repo-utils --filter=@beep/repo-cli`; `bunx --bun vitest run tooling/repo-utils/test/Reuse.service.test.ts`; `bunx --bun vitest run tooling/cli/test/reuse-command.test.ts`; `bun run beep reuse partitions --scope tooling/cli --json`; `bun run beep reuse inventory --scope tooling/cli --json` | Success | The new reuse services and CLI contract are green on the tooling pilot, the heavier CLI integration file exits cleanly, and `tooling/cli` alone is sufficient to prove real scout, specialist, inventory, and packet output |

## Phase Transition Log

| Date | Phase | Manifest Change | Checklist Change | Notes |
|---|---|---|---|---|
| 2026-04-06 | P0 | `active_phase=p0`, `p0=BOOTSTRAPPED` | P0 marked `BOOTSTRAPPED` | Initial canonical phased spec bootstrap |
| 2026-04-06 | P0 | `p0=IN_PROGRESS` | P0 tracker moved to `IN_PROGRESS` and classification ledger seeded | Live P0 session started; awaiting final policy resolutions before closeout |
| 2026-04-06 | P0 | `p0=COMPLETED`, `active_phase=p1` | P0 tracker moved to `COMPLETED`; P1 noted as the next active phase | User accepted the P1-P3 approval rule and default commit cadence |
| 2026-04-07 | P1 | `p1=IN_PROGRESS` | P1 tracker moved to `IN_PROGRESS`; implementation started checked | Active P1 execution began using the approved in-scope destructive-work rule |
| 2026-04-07 | P1 | `p1=COMPLETED`, `active_phase=p2` | P1 tracker moved to `COMPLETED`; P2 is now the next active phase | Live workspace refs and managed-artifact drift are removed; unrelated repo-baseline verification failures were documented instead of treated as P1 regressions |
| 2026-04-07 | P2 | `p2=IN_PROGRESS` | P2 tracker moved to `IN_PROGRESS` | Active P2 execution began to prove repo-local docgen ownership and clean stale docgen-specific assumptions without widening into P3 |
| 2026-04-07 | P2 | `p2=COMPLETED`, `active_phase=p3` | P2 tracker moved to `COMPLETED`; P3 is now the next active phase | Repo-local docgen ownership is proven, implicit `editor/runtime` participation is formalized, and stale README guidance is removed |
| 2026-04-07 | P3 | `p3=IN_PROGRESS` | P3 tracker moved to `IN_PROGRESS` | Active P3 execution began to prune only cleanup-caused dependency, security, and orphaned Playwright drift |
| 2026-04-07 | P3 | `p3=COMPLETED`, `active_phase=p4` | P3 tracker moved to `COMPLETED`; P4 is now the next active phase | Stale OSV ignores, former workspace-only catalog entries, and the orphaned Playwright lane are removed; broader dependency hygiene findings were deferred instead of widened |
| 2026-04-07 | P4 | `p4=IN_PROGRESS` | P4 tracker moved to `IN_PROGRESS`; candidate ledger seeded and ranked inventory written | The orchestrator session is active, but no destructive cleanup has started because P4 still requires per-candidate `yes` approval |
| 2026-04-07 | P4 | `p4=COMPLETED`, `active_phase=p5`, `p5=IN_PROGRESS` | P4 tracker moved to `COMPLETED`; P5 is now the active phase | The ranked inventory is exhausted after two rejections and two approved per-candidate cleanups |
| 2026-04-07 | P5 | `p5=COMPLETED`, `active_phase=null`, `status=COMPLETED` | P5 tracker moved to `COMPLETED`; final closeout recorded | Repo-wide validation is green, curated TrustGraph sync is recorded, and the cleanup spec is ready for review plus optional push confirmation |
| 2026-04-07 | P6 | `status=IN_PROGRESS`, `active_phase=p6`, `p6=IN_PROGRESS` | P6 tracker moved to `IN_PROGRESS` and the spec was reopened for the reuse-discovery extension | The extension stays inside this spec package rather than forking into a separate reuse-discovery spec |
| 2026-04-07 | P6 | `p6=COMPLETED`, `active_phase=p7`, `p7=IN_PROGRESS` | P6 tracker moved to `COMPLETED`; P7 is now the active phase | The methodology, contracts, and pilot boundary are explicit enough for implementation |
| 2026-04-07 | P7 | `p7=COMPLETED`, `active_phase=null`, `status=COMPLETED` | P7 tracker moved to `COMPLETED`; the extension closes with the overall spec still `COMPLETED` | The reuse tooling is implemented and pilot-verified without changing the original push-confirmation rule |

## Commit Log

| Commit | Scope | Status | Notes |
|---|---|---|---|
| `chore(repo): remove deprecated workspaces` | P1 targeted workspace removal and managed-artifact regeneration | `COMPLETED` | Phase commit is created in this session; resolve the exact hash from Git history after the commit lands |
| `chore(docgen): formalize repo-local ownership` | P2 docgen verification and stale-guidance cleanup | `COMPLETED` | Phase commit is created in this session after verification lands |
| `chore(repo): prune stale dependency and platform drift` | P3 dependency, security, and platform-config pruning | `COMPLETED` | Phase commit is created in this session after the stale OSV, lockfile, and Playwright surfaces were removed |
| `fix(editor-app): declare pigment build deps` | Post-P3 repo-baseline dependency fix | `COMPLETED` | Follow-up commit `83166a377d` removed the pre-existing `apps/editor-app` Pigment blocker before P4 inventory work began |
| `chore(repo): remove stale visual-regression residue` | P4 candidate `P4-C02` approved cleanup | `COMPLETED` | Candidate-scoped cleanup commit for removing the dead Lost Pixel lane and its stale active references |
| `chore(repo): remove stale shared providers package` | P4 candidate `P4-C04` approved cleanup | `COMPLETED` | Candidate-scoped cleanup commit for removing the unconsumed shared-providers workspace and its stale active references |
| `chore(repo): close out cleanup validation` | P5 final validation, strict-root baseline fixes, and knowledge closeout | `COMPLETED` | Final closeout commit lands after the verified P5 tree and spec outputs are written |
| `fix(ui): self-provision storybook browser tests` | Post-closeout Storybook caveat cleanup | `COMPLETED` | Follow-up commit lands after `@beep/ui` automatically provisions the required Playwright browser and the full verification set passes |

## Deferred Findings

| Date | Discovered In Phase | Carry To | Finding | Notes |
|---|---|---|---|---|
| 2026-04-07 | P1 | P3 | `osv-scanner.toml` still contains the `apps/crypto-taxes`-specific ignored vulnerability entry | Security-exception cleanup is a P3-owned surface unless the P1 verification commands force earlier removal |
| 2026-04-07 | P1 | P5 | `apps/editor-app` build and `check` remain blocked by a missing `@pigment-css/vite-plugin` dependency declaration | Verification-only finding; not introduced by the workspace removals |
| 2026-04-07 | P1 | P5 | `bun run check:full` remains red for broader repo-baseline type and built-output issues | Recorded during P1 verification so final validation has a concrete follow-up list |
| 2026-04-07 | P3 | P4 | `packages/common/ui` imports `next/link` and `next-themes` without matching `package.json` declarations | Broader dependency hygiene finding discovered while evaluating whether the root `next` catalog entry was removable |
