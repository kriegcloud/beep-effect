# Handoffs

This directory contains the executable phase packets for the repo architecture
convergence initiative.

## Required Usage Order

1. Read [../manifest.json](../manifest.json) for active phase, dependency
   graph, authoritative artifact paths, gate stack, and blocker state.
2. Read [../prompts/agent-prompts.md](../prompts/agent-prompts.md).
3. Read [../prompt-assets/README.md](../prompt-assets/README.md).
4. Read the active handoff and the matching orchestrator prompt.
5. Land the repo changes owned by the phase and update every required artifact
   in `../../history/` and `../`.
6. Update the manifest before handing the phase off.

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
audits, Graphiti note, and review loop all agree.
