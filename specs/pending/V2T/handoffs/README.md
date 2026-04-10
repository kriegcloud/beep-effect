# V2T Handoffs

## Usage Guidance

- Start with [../README.md](../README.md) and [../outputs/manifest.json](../outputs/manifest.json).
- Trust `active_phase_assets` in the manifest as the fastest route to the
  current handoff, prompt, output, and trackers.
- Treat the active phase session as the orchestrator, not as a worker.
- Form a local phase plan before delegating any bounded work.
- Use the combined router assets first in a fresh session, then drop into the active phase handoff and prompt.
- Use the delegation kit under [../prompts/README.md](../prompts/README.md) when specialist sub-agents are helpful.
- Use [../prompts/GRAPHITI_MEMORY_PROTOCOL.md](../prompts/GRAPHITI_MEMORY_PROTOCOL.md) for Graphiti recall, fallback logging, and session-end writeback.
- Treat `apps/V2T` and `packages/VT2` as the current shell-plus-sidecar pair unless a phase artifact explicitly documents a migration.
- Apply the mandatory conformance inputs and gates from [../README.md](../README.md) before claiming a phase is complete.
- Workers may contribute bounded findings or patches, but the orchestrator owns integration, gate evidence, and phase closure.
- If a later phase discovers an unresolved earlier-phase question, stop and route that question back instead of hiding it inside the current phase.
- Run a read-only review wave before closing any mutating phase.

## Combined Overview

- [HANDOFF_P0-P4.md](./HANDOFF_P0-P4.md) - cross-phase overview handoff
- [P0-P4_ORCHESTRATOR_PROMPT.md](./P0-P4_ORCHESTRATOR_PROMPT.md) - combined orchestration prompt
- [../prompts/ORCHESTRATOR_OPERATING_MODEL.md](../prompts/ORCHESTRATOR_OPERATING_MODEL.md) - orchestration rules
- [../prompts/GRAPHITI_MEMORY_PROTOCOL.md](../prompts/GRAPHITI_MEMORY_PROTOCOL.md) - memory protocol
- [../prompts/PHASE_DELEGATION_PROMPTS.md](../prompts/PHASE_DELEGATION_PROMPTS.md) - phase-specific worker prompt kit

| Phase | Handoff | Prompt | Artifact |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md) | [../RESEARCH.md](../RESEARCH.md) |
| P1 | [HANDOFF_P1.md](./HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md) | [../DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) |
| P2 | [HANDOFF_P2.md](./HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) | [../PLANNING.md](../PLANNING.md) |
| P3 | [HANDOFF_P3.md](./HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./P3_ORCHESTRATOR_PROMPT.md) | [../EXECUTION.md](../EXECUTION.md) |
| P4 | [HANDOFF_P4.md](./HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./P4_ORCHESTRATOR_PROMPT.md) | [../VERIFICATION.md](../VERIFICATION.md) |

## Evidence Rule

- A handoff may name required gates and expected evidence, but only the active phase artifact may claim concrete pass, fail, blocked, or not-run status for the current session.
