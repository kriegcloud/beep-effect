# Repo Cleanup: Bloat, Staleness, and Duplication

## Status

**COMPLETED**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-04-06
- **Updated:** 2026-04-07

## Quick Navigation

### Root

- [README.md](./README.md) — normative source of truth for this spec package
- [QUICK_START.md](./QUICK_START.md) — operator entrypoint for phased execution
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) — condensed per-phase orchestrator prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) — phase-by-phase corrections and learnings

### Handoffs

- [handoffs/README.md](./handoffs/README.md) — handoff and orchestration index
- [handoffs/HANDOFF_P0-P7.md](./handoffs/HANDOFF_P0-P7.md) — cross-phase overview handoff
- [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md)
- [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md)
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md)
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md)
- [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md)
- [handoffs/HANDOFF_P5.md](./handoffs/HANDOFF_P5.md)
- [handoffs/HANDOFF_P6.md](./handoffs/HANDOFF_P6.md)
- [handoffs/HANDOFF_P7.md](./handoffs/HANDOFF_P7.md)
- [handoffs/P0-P7_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P7_ORCHESTRATOR_PROMPT.md) — combined phase router prompt
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- [handoffs/P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md)
- [handoffs/P6_ORCHESTRATOR_PROMPT.md](./handoffs/P6_ORCHESTRATOR_PROMPT.md)
- [handoffs/P7_ORCHESTRATOR_PROMPT.md](./handoffs/P7_ORCHESTRATOR_PROMPT.md)

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
- [outputs/p6-reuse-discovery-design-and-contract.md](./outputs/p6-reuse-discovery-design-and-contract.md)
- [outputs/p7-reuse-tool-implementation-and-pilot.md](./outputs/p7-reuse-tool-implementation-and-pilot.md)

### Prompt Assets

- [prompts/README.md](./prompts/README.md) — reusable prompt asset index
- [prompts/CANDIDATE_EXECUTOR_PROMPT.md](./prompts/CANDIDATE_EXECUTOR_PROMPT.md) — one-candidate cleanup executor prompt
- [prompts/FINAL_VALIDATOR_PROMPT.md](./prompts/FINAL_VALIDATOR_PROMPT.md) — final validation and closeout prompt

## Purpose

### Problem

The original repo cleanup needed tight phase boundaries for destructive work, managed artifact regeneration, and final validation. After the cleanup finished, the repo still needed a durable way to discover duplicate logic and reuse opportunities without relying on one-off human memory or ad hoc long-context agent sessions.

### Solution

This spec package keeps the original cleanup phases and adds two extension phases:

1. planning and document classification
2. targeted workspace removal and managed artifact regeneration
3. docgen verification and cleanup
4. dependency, security, and platform pruning
5. ranked stale-code review and approval-driven cleanup
6. final validation and TrustGraph closeout
7. reuse-discovery design and contract
8. reuse tool implementation and tooling-stack pilot

P6 and P7 intentionally ship tooling first:

- typed JSON contracts for reuse discovery
- scout and specialist partition planning for future subagents
- a live reuse catalog and ranked inventory flow
- a narrow Codex SDK smoke seam
- a proven tooling pilot without autonomous repo-wide edits

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. repo law and current repo reality
2. this README
3. `outputs/manifest.json`
4. the named phase outputs in `outputs/`
5. handoffs and prompt assets
6. transient session notes

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
  - one commit at the end of each completed implementation phase in P1, P2, P3, and P7 when changes were made
  - one commit per approved candidate cleanup in P4
  - no push without explicit user confirmation
- P6 is a design-and-contract phase and does not require a phase commit unless the user explicitly wants one.
- In P4, do not remove a candidate until the user answers `yes`.
- In P6 and P7, do not treat the new reuse tooling as permission for autonomous repo-wide edits.
- Stop at the phase exit gate and do not silently roll into the next phase.

## Verification Command Matrix

| Command | Run When | Notes |
|---|---|---|
| `bun run config-sync` | workspace graph, TS refs, aliases, or managed docgen config change | especially relevant in P1 and later root-config edits |
| `bun run version-sync --skip-network` | workspace deletion, root dependency catalog drift, or package graph drift exists | use the `--skip-network` form for cleanup work |
| `bun run docgen` | workspace docs or docgen ownership/config changes | required after P1 and relevant in P2 or later managed-doc updates |
| `bun run lint` | any implementation phase changes repo files | summarize result in the phase output |
| `bun run check` | any implementation phase changes repo files | summarize result in the phase output |
| `bun run test` | any implementation phase changes repo files | summarize result in the phase output |
| `bun run check:full` | workspace lists, project references, or root tsconfig wiring change | especially relevant in P1 and P5 |
| `bun run lint:repo` | root package or dependency graph metadata changes | especially relevant in P3 |
| `bun run audit:high` | dependency catalog, overrides, lockfile, or security-exception surfaces change | especially relevant in P3 |
| `bun run trustgraph:sync-curated` | final closeout after curated docs or durable repo knowledge changed | required in P5 before the repo is considered push-ready |
| `bunx turbo run check --filter=@beep/repo-utils --filter=@beep/repo-cli` | P7 implementation changes the reuse tool | targeted typecheck gate for the tooling pilot |
| `bunx turbo run test --filter=@beep/repo-utils --filter=@beep/repo-cli` | P7 implementation changes the reuse tool | targeted test gate for the tooling pilot |
| `bun run beep reuse partitions --scope tooling/cli --json` | P7 pilot verification | proves scout and specialist partition output on the tooling pilot |
| `bun run beep reuse inventory --scope tooling/cli --json` | P7 pilot verification | proves ranked candidate inventory output on the tooling pilot |
| `bun run beep reuse find --file tooling/cli/src/commands/Docgen/index.ts --query json --json` | P7 pilot verification | proves local reuse matching against a known hotspot |
| `bun run beep reuse packet --candidate-id reuse-pattern:schema-json-encode-sync --scope tooling/cli --json` | P7 pilot verification | proves cross-object packet output on the tooling pilot |
| `bun run beep reuse codex-smoke --json` | P7 pilot verification | validates the Codex SDK seam without running an agent loop |

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

- the original workspace, docgen, dependency, and stale-surface cleanup from P0-P5
- the `beep reuse` command surface and supporting schemas and services
- machine-readable partition, inventory, packet, and find-result contracts
- a narrow Codex SDK smoke adapter for future orchestration
- a tooling-stack pilot on `tooling/cli` and `tooling/repo-utils`

### Out Of Scope

- unrelated feature work
- speculative refactors with no cleanup or reuse-tooling value
- merging or pushing without explicit user approval
- deleting P4 candidates without an explicit `yes`
- full autonomous reuse-edit loops
- embeddings or persistent RAG infrastructure as a hard requirement for P7

## Phase Breakdown

| Phase | Focus | Primary Artifact | Exit Requirement |
|---|---|---|---|
| P0 | Planning, grilling, and document classification | `outputs/p0-planning-and-document-classification.md` | phase boundaries, preservation policy, and verification contract are explicit enough to execute safely |
| P1 | Targeted workspace removal and managed artifact regeneration | `outputs/p1-workspace-removal-and-regeneration.md` | all four target workspaces, active references, and managed config drift are removed and verified |
| P2 | Docgen verification and stale docgen cleanup | `outputs/p2-docgen-verification-and-cleanup.md` | local `@beep/docgen` ownership is verified and stale docgen assumptions are removed if present |
| P3 | Dependency, security, and platform pruning | `outputs/p3-dependency-security-and-platform-pruning.md` | now-unused catalog entries, vuln exceptions, and platform or test config are pruned and verified |
| P4 | Ranked candidate inventory and approval loop | `outputs/p4-ranked-candidate-inventory.md` | ranked inventory exists and every approved candidate is processed with verification and checklist updates |
| P5 | Final validation and knowledge closeout | `outputs/p5-final-closeout.md` | final quality commands pass, curated TrustGraph knowledge is refreshed, and the repo is ready for a user-approved push |
| P6 | Reuse-discovery design and contract | `outputs/p6-reuse-discovery-design-and-contract.md` | the command surface, partition model, catalog strategy, and implementation boundaries are explicit |
| P7 | Reuse tool implementation and tooling-stack pilot | `outputs/p7-reuse-tool-implementation-and-pilot.md` | the reuse commands exist, targeted checks and tests pass, and the tooling pilot is evidenced |

## Architecture Decision Record Summary

| ADR | Decision Surface | Decision | Rationale |
|---|---|---|---|
| ADR-001 | Session model | Use one narrow Codex session per phase | Smaller sessions reduce accumulated state and scope drift |
| ADR-002 | Historical references | Preserve historical, security, and research docs by default | Those references often serve as evidence and should not be erased casually |
| ADR-003 | Managed artifacts | Treat repo-managed commands as cleanup work, not optional verification | Workspace deletion is incomplete if managed config and generated docs are stale |
| ADR-004 | Platform drift | Separate dependency, security, and platform pruning into its own phase | Those surfaces tend to be repo-wide and deserve explicit review |
| ADR-005 | Approval loop | Process P4 deletions one candidate at a time with user approval and a per-candidate commit | Candidate safety varies and destructive cleanup needs tight control |
| ADR-006 | Final closeout | Refresh curated TrustGraph knowledge after cleanup | Future sessions should not inherit stale repo context |
| ADR-007 | Reuse tooling shape | Ship typed discovery tooling before autonomous reuse execution | A strong contract is more reusable than a one-off agent loop |
| ADR-008 | Retrieval strategy | Start with structural analysis plus curated Effect entries; keep RAG as a seam | Deterministic live analysis is enough for v1 and avoids overbuilding |

## Success Criteria

This spec package is complete only when all of these statements are true:

- a fresh Codex session can start from `QUICK_START.md` and the active phase handoff without extra local invention
- the grill log and checklist are sufficient to resume work after interruption
- the targeted workspace deletions and active-surface cleanup are explicit and verifiable
- docgen ownership is verified against repo reality rather than assumed
- dependency, security, and platform drift are reviewed as first-class repo-level cleanup
- the stale-code inventory is ranked, evidence-backed, and approval-driven
- final validation includes repo quality commands and curated TrustGraph sync
- the reuse-discovery command surface is documented, implemented, and pilot-verified
- future agent sessions can consume the reuse partitions, inventories, and packets without inventing new contracts
