# Handoffs

This directory contains the executable phase packets for the repo architecture
convergence initiative.

## Required Usage Order

This directory does not create a lower or alternate startup contract. Follow
the exact worker-read order and source-of-truth order from the root packet and
`ops/manifest.json`; the list below mirrors that contract for handoff use.

1. Read [../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md),
   [../../PLAN.md](../../PLAN.md), and [../README.md](../README.md).
2. Read [../manifest.json](../manifest.json) for active phase, dependency
   graph, authoritative artifact paths, gate stack, blocker state, and path
   base.
3. Read this [README.md](./README.md), the active handoff, and the matching
   orchestrator prompt.
4. Read [../../history/quick-start.md](../../history/quick-start.md) and
   [../prompts/agent-prompts.md](../prompts/agent-prompts.md).
5. Read [../prompt-assets/README.md](../prompt-assets/README.md),
   [../prompt-assets/required-outputs.md](../prompt-assets/required-outputs.md),
   [../prompt-assets/verification-checks.md](../prompt-assets/verification-checks.md),
   [../prompt-assets/blocker-protocol.md](../prompt-assets/blocker-protocol.md),
   [../prompt-assets/review-loop.md](../prompt-assets/review-loop.md), and
   [../prompt-assets/manifest-and-evidence.md](../prompt-assets/manifest-and-evidence.md).
6. Read the phase-specific design docs, prior evidence packs, live ledgers,
   and review artifacts named in the active handoff and manifest.
7. For any `P0` batch that records baseline architecture or repo-law status,
   reread `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
   `standards/effect-first-development.md` before that baseline is recorded.
   For `P2` through `P7` code-moving or code-review work, also read those
   three standards before edits or gate interpretation begin. For `P7` final
   verification, immediately before scoring or closure, reread those three
   standards plus `ops/compatibility-ledger.md` and
   `ops/architecture-amendment-register.md`.
8. Land the repo changes owned by the phase and update every required artifact
   in `../../history/` and `../`.
9. Update the manifest before handing the phase off.

Only `ops/compatibility-ledger.md` and
`ops/architecture-amendment-register.md` are live governance ledgers. Treat
history or design ledger mentions as historical context only.

## Cross-Phase Packet

- [HANDOFF_P0-P7.md](./HANDOFF_P0-P7.md) - shared phase order, dependency, and
  closure rules
- [P0-P7_ORCHESTRATOR_PROMPT.md](./P0-P7_ORCHESTRATOR_PROMPT.md) - shared
  orchestration prompt for the active phase

## Phase Handoffs

- [HANDOFF_P0.md](./HANDOFF_P0.md) - Baseline Census, Routing Canon, and
  Compliance Baseline
- [HANDOFF_P1.md](./HANDOFF_P1.md) - Program Controls, Ledgers, and Gate
  Templates
- [HANDOFF_P2.md](./HANDOFF_P2.md) - Enablement and Wiring Cutover
- [HANDOFF_P3.md](./HANDOFF_P3.md) - Shared-Kernel and Non-Slice Extraction
- [HANDOFF_P4.md](./HANDOFF_P4.md) - `repo-memory` Migration and Validation
- [HANDOFF_P5.md](./HANDOFF_P5.md) - `editor` Migration and Validation
- [HANDOFF_P6.md](./HANDOFF_P6.md) - Remaining Operational, App, and Agent
  Cutovers Plus Compatibility Deletion
- [HANDOFF_P7.md](./HANDOFF_P7.md) - Final Architecture and Repo-Law
  Verification

## Orchestrator Prompts

- [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md)
- [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md)
- [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md)
- [P3_ORCHESTRATOR_PROMPT.md](./P3_ORCHESTRATOR_PROMPT.md)
- [P4_ORCHESTRATOR_PROMPT.md](./P4_ORCHESTRATOR_PROMPT.md)
- [P5_ORCHESTRATOR_PROMPT.md](./P5_ORCHESTRATOR_PROMPT.md)
- [P6_ORCHESTRATOR_PROMPT.md](./P6_ORCHESTRATOR_PROMPT.md)
- [P7_ORCHESTRATOR_PROMPT.md](./P7_ORCHESTRATOR_PROMPT.md)

## Artifact Bundle Rules

Every phase owns all of the following:

- one evidence pack under `../../history/outputs/`
- any phase-owned durable artifacts listed in the manifest
- one critique artifact under `../../history/reviews/`
- one remediation artifact under `../../history/reviews/`
- one re-review artifact under `../../history/reviews/`
- manifest updates for status, evidence, blockers, and next action

No phase is complete until the artifact bundle, required commands, search
audits, Graphiti note, and review loop all agree. The blocking search-audit
set is the active phase's `requiredSearchAuditIds` record in
`ops/manifest.json`. At the current manifest version, every phase record lists
all seven catalog families.
