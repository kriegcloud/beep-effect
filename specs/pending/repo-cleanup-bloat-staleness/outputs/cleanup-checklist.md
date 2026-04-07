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
- [ ] P0 session executed
- [ ] Implementation started

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
| P0 | Plan, grill, and classify active versus historical documentation | `BOOTSTRAPPED` | 2026-04-06 | Canonical phase structure created; fresh P0 session still needs to run |
| P1 | Remove `apps/clawhole`, `apps/web`, `apps/crypto-taxes`, and `packages/ai/sdk`; regenerate managed config and docs | `NOT_STARTED` | 2026-04-06 | Awaiting P0 closeout and approved execution plan |
| P2 | Verify local `@beep/docgen` ownership and remove stale docgen references or generated artifacts | `NOT_STARTED` | 2026-04-06 | Awaiting approved execution plan |
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
| Historical/security/research docs referencing removed code | Preserve by default | Update only if navigation breaks or claims are misleading | Populated during P0 and revisited during execution |

## Verification Log

| Date | Scope | Commands | Result | Notes |
|---|---|---|---|---|
| 2026-04-06 | Spec bootstrap | Not run | N/A | Canonical phased structure created; no repo quality commands required yet |

## Phase Transition Log

| Date | Phase | Manifest Change | Checklist Change | Notes |
|---|---|---|---|---|
| 2026-04-06 | P0 | `active_phase=p0`, `p0=BOOTSTRAPPED` | P0 marked `BOOTSTRAPPED` | Initial canonical phased spec bootstrap |

## Commit Log

| Commit | Scope | Status | Notes |
|---|---|---|---|
| TBD | No cleanup commits yet | `NOT_STARTED` | Populated after approved cleanup steps |

## Deferred Findings

| Date | Discovered In Phase | Carry To | Finding | Notes |
|---|---|---|---|---|
| TBD | TBD | TBD | No deferred findings logged yet | Populated when a phase discovers out-of-scope cleanup work |
