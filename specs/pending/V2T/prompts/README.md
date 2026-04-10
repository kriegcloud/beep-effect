# V2T Delegation Kit

This directory contains the orchestration and sub-agent delegation assets for
the V2T canonical spec.

The core rule is simple:

- the agent working the active phase is always the phase orchestrator
- sub-agents are bounded workers or auditors
- the orchestrator owns scope, integration, quality gates, and artifact updates

## Files

- [ORCHESTRATOR_OPERATING_MODEL.md](./ORCHESTRATOR_OPERATING_MODEL.md) -
  normative rules for the phase orchestrator
- [SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md) - required
  report format for delegated work
- [PHASE_DELEGATION_PROMPTS.md](./PHASE_DELEGATION_PROMPTS.md) - ready-to-paste
  sub-agent prompt templates and phase dispatch guidance

## Repo-Local Codex Runtime Assets

- [../../../../.codex/config.toml](../../../../.codex/config.toml) - project-scoped
  custom agent registry and `v2t_orchestrator` profile
- [../../../../.codex/agents/README.md](../../../../.codex/agents/README.md) -
  specialist agent catalog

Use these files together with the active phase handoff and active phase
orchestrator prompt.
