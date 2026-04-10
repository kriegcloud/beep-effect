# V2T Delegation Kit

This directory contains the orchestration and sub-agent delegation assets for the V2T canonical spec.

The core rule is simple:

- the agent working the active phase is always the phase orchestrator
- sub-agents are bounded workers or auditors
- the orchestrator owns scope, integration, quality gates, and artifact updates

## Files

- [ORCHESTRATOR_OPERATING_MODEL.md](./ORCHESTRATOR_OPERATING_MODEL.md) - normative rules for the phase orchestrator
- [SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md) - required report format for delegated work
- [PHASE_DELEGATION_PROMPTS.md](./PHASE_DELEGATION_PROMPTS.md) - ready-to-paste sub-agent prompt templates and phase dispatch guidance

## Delegation Sequence

1. Read `outputs/manifest.json` and resolve the active phase from `active_phase` plus `active_phase_assets`.
2. Form the local phase plan before spawning any worker.
3. Pick the smallest worker set that advances non-overlapping work.
4. Copy the relevant prompt frame from [PHASE_DELEGATION_PROMPTS.md](./PHASE_DELEGATION_PROMPTS.md).
5. Require the report format from [SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md).
6. Review and integrate every worker result in the orchestrator session.

## When Not To Delegate

- do not delegate immediate blocking work that should stay local
- do not delegate when write scopes would overlap
- do not delegate when the phase boundary or repo-law input is still unclear
- do not let a worker replace the phase orchestrator or claim phase closure

## Repo-Local Codex Runtime Assets

- [../../../../.codex/config.toml](../../../../.codex/config.toml) - project-scoped custom agent registry and `v2t_orchestrator` profile
- [../../../../.codex/agents/README.md](../../../../.codex/agents/README.md) - specialist agent catalog

Use these files together with the active phase handoff and active phase orchestrator prompt.
