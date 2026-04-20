# Effect Governance Replacement - Handoffs

## Usage Guidance

- Start with [../outputs/manifest.json](../outputs/manifest.json) and [../README.md](../README.md).
- Treat `active_phase_assets` in the manifest as the fastest route to the active phase.
- Treat the active phase session as the orchestrator, not as a worker.
- Use the combined router assets first in a fresh session, then drop into the active phase handoff and prompt.
- Use the delegation kit under [../prompts/README.md](../prompts/README.md) when bounded workers are helpful.
- Keep the Effect lane separate from the JSDoc and TSDoc lane.
- Do not mutate repo behavior outside this spec package before P3.
- Use the fixed steering evaluation corpus once P1 locks it.

## Combined Overview

- [HANDOFF_P0-P4.md](./HANDOFF_P0-P4.md) - cross-phase overview handoff
- [P0-P4_ORCHESTRATOR_PROMPT.md](./P0-P4_ORCHESTRATOR_PROMPT.md) - combined router prompt

| Phase | Handoff | Prompt | Artifact |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md) | [../RESEARCH.md](../RESEARCH.md) |
| P1 | [HANDOFF_P1.md](./HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md) | [../VALIDATED_OPTIONS.md](../VALIDATED_OPTIONS.md) |
| P2 | [HANDOFF_P2.md](./HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) | [../PLANNING.md](../PLANNING.md) |
| P3 | [HANDOFF_P3.md](./HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./P3_ORCHESTRATOR_PROMPT.md) | [../EXECUTION.md](../EXECUTION.md) |
| P4 | [HANDOFF_P4.md](./HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./P4_ORCHESTRATOR_PROMPT.md) | [../VERIFICATION.md](../VERIFICATION.md) |

## Evidence Rule

- A handoff may name required gates and expected evidence, but only the active phase artifact may claim concrete pass or fail status for the current session.
