# P0-P5 Cross-Phase Handoff

## Package Objective

Create a reusable repo-wide governance control plane that future specs inherit instead of re-creating generic laws, auditors, and packet contracts locally.

## Locked Defaults

1. The package path is `specs/pending/agent-governance-control-plane`.
2. The package structure mirrors the repo's strong phased-spec pattern.
3. The category loop is `Research -> Plan -> Implement -> Refine -> Validate`.
4. OpenClaw is the first intended consumer after this package exists.
5. Generic governance text belongs here rather than in consumer prompts.

## Phase Order

1. P0 closes the law canon.
2. P1 closes the agent catalog.
3. P2 closes the workflow lifecycle.
4. P3 closes the artifact and prompt contracts.
5. P4 closes the enforcement and verification model.
6. P5 closes the consumer-inheritance model.

## Cross-Phase Rule

Every phase is required to preserve prior locked defaults and convert open design questions into explicit contracts for the next phase.
