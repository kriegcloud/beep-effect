# Repo Cleanup: Bloat, Staleness, and Duplication

## Status

**PENDING**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-04-06
- **Updated:** 2026-04-06

## Quick Navigation

### Root

- [README.md](./README.md) — normative source of truth for this spec package
- [QUICK_START.md](./QUICK_START.md) — operator entrypoint for phased execution
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) — condensed per-phase orchestrator prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) — phase-by-phase corrections and learnings

### Handoffs

- [handoffs/README.md](./handoffs/README.md) — handoff and orchestration index
- [handoffs/HANDOFF_P0-P5.md](./handoffs/HANDOFF_P0-P5.md) — cross-phase overview handoff
- [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) — Planning And Document Classification
- [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) — Targeted Workspace Removal And Regeneration
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) — Docgen Verification And Cleanup
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) — Dependency, Security, And Platform Pruning
- [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) — Ranked Candidate Inventory And Approval Loop
- [handoffs/HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) — Final Validation And Knowledge Closeout
- [handoffs/P0-P5_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P5_ORCHESTRATOR_PROMPT.md) — combined phase router prompt
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- [handoffs/P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md)

### Outputs

- [outputs/manifest.json](./outputs/manifest.json) — machine-readable artifact and phase tracking
- [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) — pasteable Codex entry prompt for the phased workflow
- [outputs/cleanup-checklist.md](./outputs/cleanup-checklist.md) — durable execution tracker for phases, candidates, verification, and commits
- [outputs/grill-log.md](./outputs/grill-log.md) — append-only grilling transcript with questions, recommendations, answers, and resolutions
- [outputs/p0-planning-and-document-classification.md](./outputs/p0-planning-and-document-classification.md)
- [outputs/p1-workspace-removal-and-regeneration.md](./outputs/p1-workspace-removal-and-regeneration.md)
- [outputs/p2-docgen-verification-and-cleanup.md](./outputs/p2-docgen-verification-and-cleanup.md)
- [outputs/p3-dependency-security-and-platform-pruning.md](./outputs/p3-dependency-security-and-platform-pruning.md)
- [outputs/p4-ranked-candidate-inventory.md](./outputs/p4-ranked-candidate-inventory.md)
- [outputs/p5-final-closeout.md](./outputs/p5-final-closeout.md)

### Prompt Assets

- [prompts/README.md](./prompts/README.md) — reusable prompt asset index
- [prompts/CANDIDATE_EXECUTOR_PROMPT.md](./prompts/CANDIDATE_EXECUTOR_PROMPT.md) — one-candidate cleanup executor prompt
- [prompts/FINAL_VALIDATOR_PROMPT.md](./prompts/FINAL_VALIDATOR_PROMPT.md) — final validation and closeout prompt

---

## Purpose

### Problem

This repo cleanup now spans document-classification policy, targeted workspace deletion, managed artifact regeneration, docgen verification, dependency and security pruning, ranked stale-code review, and final repo-knowledge refresh. Running all of that inside one long Codex session would accumulate too much state and make approval boundaries easy to blur.

### Solution

This spec package uses the repo's thin canonical phased structure so each Codex session stays narrow:

1. planning and document classification
2. targeted workspace removal and managed artifact regeneration
3. docgen verification and cleanup
4. dependency, security, and platform pruning
5. ranked stale-code inventory and approval-driven cleanup
6. final validation and TrustGraph closeout

Each phase has:

- one handoff
- one orchestrator prompt
- one named phase output
- explicit exit gates

P4 is intentionally split into two session types:

- one inventory-orchestrator session that builds and ranks candidates
- one executor session per approved candidate using `prompts/CANDIDATE_EXECUTOR_PROMPT.md`

### Why It Matters

- Smaller session scope reduces accidental cross-phase scope creep.
- The grill log, checklist, and phase outputs make resumption and review deterministic.
- Historical/security documents can be preserved intentionally instead of being rewritten by accident.
- Managed repo commands are treated as first-class cleanup work instead of optional aftercare.

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. repo law and current repo reality
2. this README
3. `outputs/manifest.json`
4. the named phase outputs in `outputs/`
5. handoffs and prompt assets
6. transient session notes

The primary repo-law inputs for this package are:

- `AGENTS.md`
- root `package.json`
- repo config files touched by the active phase
- the current repo state as verified by command-line inspection

## Working Contract

- Use one Codex session per phase unless the user explicitly asks to combine phases.
- Start with the active phase from [outputs/manifest.json](./outputs/manifest.json).
- Use [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) as the pasteable entrypoint for a fresh Codex session.
- Use `grill-me` in P0 and record the transcript in [outputs/grill-log.md](./outputs/grill-log.md).
- Use [outputs/cleanup-checklist.md](./outputs/cleanup-checklist.md) as the durable execution tracker across all phases.
- Preserve historical, security, and research documents unless they create broken navigation or misleading current-state claims.
- Treat `config-sync`, `version-sync --skip-network`, `docgen`, and `trustgraph:sync-curated` as part of cleanup completeness when the active phase changes those surfaces.
- Treat repo-wide quality commands as explicit phase gates, not implied follow-up work.
- Update [outputs/manifest.json](./outputs/manifest.json) when a phase starts, blocks, completes, or advances the active phase.
- Log out-of-phase findings in the checklist or the next relevant phase output instead of widening scope opportunistically.
- Default commit cadence is:
  - one commit at the end of each completed implementation phase in P1, P2, and P3
  - one commit per approved candidate cleanup in P4
  - no push without explicit user confirmation
- If the user changes commit cadence in P0, the P0 output overrides the default cadence.
- Do not push or merge without explicit user confirmation.
- In P4, do not remove a candidate until the user answers `yes`.
- In P4, the orchestrator session builds the inventory and routes approved candidates into fresh executor sessions instead of widening its own scope.
- Stop at the phase exit gate and do not silently roll into the next phase.

## Verification Command Matrix

| Command | Run When | Notes |
|---|---|---|
| `bun run config-sync` | workspace graph, TS refs, aliases, or managed docgen config change | especially relevant in P1 and any later phase that touches root config |
| `bun run version-sync --skip-network` | workspace deletion, root dependency catalog drift, or package graph drift exists | use the `--skip-network` form for cleanup work |
| `bun run docgen` | workspace docs or docgen ownership/config changes | required after P1 and relevant in P2 |
| `bun run lint` | any implementation phase changes repo files | summarize result in the phase output |
| `bun run check` | any implementation phase changes repo files | summarize result in the phase output |
| `bun run test` | any implementation phase changes repo files | summarize result in the phase output |
| `bun run check:full` | workspace lists, project references, or root tsconfig wiring change | especially relevant in P1 and any later root-wiring edits |
| `bun run lint:repo` | root package/dependency graph or repo package metadata changes | especially relevant in P3 |
| `bun run audit:high` | dependency catalog, overrides, lockfile, or security-exception surfaces change | especially relevant in P3 |
| `bun run trustgraph:sync-curated` | final closeout after curated docs or durable repo knowledge changed | required in P5 before the repo is considered push-ready |

If a required command fails due to a pre-existing or unrelated issue, record it explicitly as a blocker with evidence instead of silently downgrading the phase gate.

## Phase Status Model

### Allowed Phase Statuses

- `BOOTSTRAPPED`
- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `COMPLETED`

### Transition Rules

- `active_phase` in [outputs/manifest.json](./outputs/manifest.json) is authoritative.
- A phase starts by moving its manifest status to `IN_PROGRESS`.
- A phase closes by moving its manifest status to `COMPLETED`, updating the package `updated` date if needed, and advancing `active_phase` to the next phase unless the user explicitly pauses.
- If a phase cannot meet its exit gate, set it to `BLOCKED` and record the blocker in the phase output and checklist.
- The checklist phase tracker is the human-readable mirror of the manifest and is required to be updated in the same session.

## Phase Output Contract

Every phase output in `outputs/` is required to capture:

- objective and phase scope
- decisions made
- commands run and their results
- files or surfaces changed
- preserved historical references or evidence-based non-changes
- residual risks or blockers
- handoff notes for the next phase

If a phase makes no code or config changes, the output is still required to record the evidence that justified a no-op outcome.

## Scope

### In Scope

- deleting `apps/clawhole`
- deleting `apps/web`
- deleting `apps/crypto-taxes`
- deleting `packages/ai/sdk`
- removing stale active references from workspaces, root configs, tsconfig refs, path aliases, identity composers, docs, tests, standards, ignores, generated docs, package metadata, and CI or e2e config
- verifying whether any `@effect/docgen` dependency or stale references still remain
- removing genuine stale docgen-related references if they still exist
- pruning root dependency catalog entries, overrides, security exceptions, and now-orphaned platform or test config after workspace removal
- syncing repo-managed config and curated repo knowledge after cleanup
- exploring for stale, duplicate, redundant, or low-value code and presenting ranked deletion candidates
- maintaining durable planning and execution artifacts for the cleanup

### Out Of Scope

- unrelated feature work
- speculative refactors with no cleanup value
- merging or pushing without explicit user approval
- deleting P4 candidates without an explicit `yes`
- rewriting completed specs, security reports, or historical research just because they reference removed code

## Structural Pattern Reused

This package intentionally reuses the repo's stronger phased-spec pattern:

- normative root README
- quick-start entrypoint
- per-phase prompt index
- reflection log
- per-phase handoffs and orchestrator prompts
- per-phase outputs
- reusable prompt assets
- machine-readable manifest

## Phase Breakdown

| Phase | Focus | Primary Artifact | Exit Requirement |
|---|---|---|---|
| P0 | Planning, grilling, and document classification | `outputs/p0-planning-and-document-classification.md` | phase boundaries, preservation policy, and verification contract are explicit enough to execute safely |
| P1 | Targeted workspace removal and managed artifact regeneration | `outputs/p1-workspace-removal-and-regeneration.md` | all four target workspaces, active references, and managed config drift are removed and verified |
| P2 | Docgen verification and stale docgen cleanup | `outputs/p2-docgen-verification-and-cleanup.md` | local `@beep/docgen` ownership is verified and stale docgen assumptions are removed if present |
| P3 | Dependency, security, and platform pruning | `outputs/p3-dependency-security-and-platform-pruning.md` | now-unused catalog entries, vuln exceptions, and platform or test config are pruned and verified |
| P4 | Ranked candidate inventory and approval loop | `outputs/p4-ranked-candidate-inventory.md` | ranked inventory exists and every approved candidate is processed with verification and checklist updates |
| P5 | Final validation and knowledge closeout | `outputs/p5-final-closeout.md` | final quality commands pass, curated TrustGraph knowledge is refreshed, and the repo is ready for a user-approved push |

## Architecture Decision Record Summary

| ADR | Decision Surface | Decision | Rationale |
|---|---|---|---|
| ADR-001 | Session model | Use one narrow Codex session per phase | Smaller sessions reduce accumulated state and scope drift |
| ADR-002 | Historical references | Preserve historical/security/research docs by default | Those references often serve as evidence and should not be erased casually |
| ADR-003 | Managed artifacts | Treat repo-managed commands as cleanup work, not optional verification | Workspace deletion is incomplete if managed config and generated docs are stale |
| ADR-004 | Platform drift | Separate dependency/security/platform pruning into its own phase | Those surfaces tend to be repo-wide and deserve explicit review |
| ADR-005 | Approval loop | Process P4 deletions one candidate at a time with user approval and a per-candidate commit | Candidate safety varies and destructive cleanup needs tight control |
| ADR-006 | Final closeout | Refresh curated TrustGraph knowledge after cleanup | Future sessions should not inherit stale repo context |

## Success Criteria

This spec package is complete only when all of these statements are true:

- a fresh Codex session can start from `QUICK_START.md` and the active phase handoff without extra local invention
- the grill log and checklist are sufficient to resume work after interruption
- the targeted workspace deletions and active-surface cleanup are explicit and verifiable
- docgen ownership is verified against repo reality rather than assumed
- dependency, security, and platform drift are reviewed as first-class repo-level cleanup
- the stale-code inventory is ranked, evidence-backed, and approval-driven
- final validation includes repo quality commands and curated TrustGraph sync
- historical evidence is preserved intentionally instead of being deleted by blanket search-and-replace

## Initial Operator Entry Point

The intended starting point for a fresh session is:

1. `AGENTS.md`
2. [QUICK_START.md](./QUICK_START.md)
3. [outputs/manifest.json](./outputs/manifest.json)
4. the active phase handoff in `handoffs/`
5. the matching orchestrator prompt in `handoffs/`
6. [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) if a single pasteable entry prompt is needed
