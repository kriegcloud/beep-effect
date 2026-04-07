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

## Phase Tracker

| Phase | Scope | Status | Last Updated | Notes |
|---|---|---|---|---|
| P0 | Plan, grill, and classify active versus historical documentation | `COMPLETED` | 2026-04-06 | Exit gate met; phase boundaries, preservation policy, verification contract, commit cadence, and deletion approval rules are now explicit |
| P1 | Remove `apps/clawhole`, `apps/web`, `apps/crypto-taxes`, and `packages/ai/sdk`; regenerate managed config and docs | `COMPLETED` | 2026-04-07 | Exit gate met: live workspace refs are removed, managed artifacts were regenerated, `lint` and `test` passed, and broader `build` or `check` failures were recorded as unrelated repo-baseline findings |
| P2 | Verify local `@beep/docgen` ownership and remove stale docgen references or generated artifacts | `COMPLETED` | 2026-04-07 | Exit gate met: repo-local docgen ownership is proven, `packages/editor/runtime` now has explicit docgen config, stale README guidance was removed, `docgen` plus `lint` and `test` passed, and the existing editor-app `check` blocker was recorded as unrelated |
| P3 | Prune unused root dependency catalog entries, security exceptions, and orphaned platform or test config | `NOT_STARTED` | 2026-04-06 | Awaiting approved execution plan |
| P4 | Ranked candidate inventory and incremental cleanup loop | `NOT_STARTED` | 2026-04-06 | Awaiting approved execution plan |
| P5 | Final quality and TrustGraph closeout | `NOT_STARTED` | 2026-04-06 | Awaiting approved execution plan |

## Candidate Review Ledger

| Candidate ID | Category | Description | Decision | Cleanup Status | Verification | Commit | Notes |
|---|---|---|---|---|---|---|---|
| TBD | TBD | No candidates reviewed yet | TBD | `NOT_STARTED` | TBD | TBD | Populated during P4 |

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

## Commit Log

| Commit | Scope | Status | Notes |
|---|---|---|---|
| `chore(repo): remove deprecated workspaces` | P1 targeted workspace removal and managed-artifact regeneration | `COMPLETED` | Phase commit is created in this session; resolve the exact hash from Git history after the commit lands |
| `chore(docgen): formalize repo-local ownership` | P2 docgen verification and stale-guidance cleanup | `COMPLETED` | Phase commit is created in this session after verification lands |

## Deferred Findings

| Date | Discovered In Phase | Carry To | Finding | Notes |
|---|---|---|---|---|
| 2026-04-07 | P1 | P3 | `osv-scanner.toml` still contains the `apps/crypto-taxes`-specific ignored vulnerability entry | Security-exception cleanup is a P3-owned surface unless the P1 verification commands force earlier removal |
| 2026-04-07 | P1 | P5 | `apps/editor-app` build and `check` remain blocked by a missing `@pigment-css/vite-plugin` dependency declaration | Verification-only finding; not introduced by the workspace removals |
| 2026-04-07 | P1 | P5 | `bun run check:full` remains red for broader repo-baseline type and built-output issues | Recorded during P1 verification so final validation has a concrete follow-up list |
