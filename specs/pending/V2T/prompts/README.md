# V2T Delegation Kit

This directory contains the orchestration and sub-agent delegation assets for the V2T canonical spec.

The core rule is simple:

- the agent working the active phase is always the phase orchestrator
- sub-agents are bounded workers or auditors
- the orchestrator owns scope, integration, quality gates, and artifact updates

## Fast Route

1. Read `../outputs/manifest.json`.
2. Trust `active_phase` plus `active_phase_assets`.
3. Open only the active phase handoff and active phase orchestrator prompt.
4. Use this delegation kit only after the local phase plan exists.

## Files

- [ORCHESTRATOR_OPERATING_MODEL.md](./ORCHESTRATOR_OPERATING_MODEL.md) - normative rules for the phase orchestrator
- [GRAPHITI_MEMORY_PROTOCOL.md](./GRAPHITI_MEMORY_PROTOCOL.md) - canonical Graphiti recall and writeback contract
- [SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md) - required report format for delegated work
- [PHASE_DELEGATION_PROMPTS.md](./PHASE_DELEGATION_PROMPTS.md) - ready-to-paste sub-agent prompt templates and phase dispatch guidance

## Delegation Sequence

1. Read `../outputs/manifest.json` and resolve the active phase from `active_phase` plus `active_phase_assets`.
2. Form the local phase plan before spawning any worker.
3. Read [GRAPHITI_MEMORY_PROTOCOL.md](./GRAPHITI_MEMORY_PROTOCOL.md) if recall or session-end writeback is in scope.
4. Pick the smallest worker set that advances non-overlapping work.
5. Copy the relevant prompt frame from [PHASE_DELEGATION_PROMPTS.md](./PHASE_DELEGATION_PROMPTS.md).
6. Require the report format from [SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md).
7. Review and integrate every worker result in the orchestrator session.
8. Run a read-only review wave before phase closeout.

## When Not To Delegate

- do not delegate immediate blocking work that should stay local
- do not delegate when write scopes would overlap
- do not delegate when the phase boundary or repo-law input is still unclear
- do not let a worker replace the phase orchestrator or claim phase closure
- do not delegate if the worker packet would be vague enough that the result
  cannot be integrated without follow-up clarification

## Repo-Local Codex Runtime Assets

- [../../../../.codex/config.toml](../../../../.codex/config.toml) - project-scoped custom agent registry and `v2t_orchestrator` profile
- [../../../../.codex/agents/README.md](../../../../.codex/agents/README.md) - specialist agent catalog

Use these files together with the active phase handoff and active phase orchestrator prompt.
