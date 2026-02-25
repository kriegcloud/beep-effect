# Quick Start

## What Is This?

A canonical research spec to define the production cloud and IaC architecture for a Palantir-light platform using a strict artifact flow:

1. Plan research
2. Execute research and capture evidence
3. Validate and publish recommendation

## Current Status

| Phase | Status | Description |
|---|---|---|
| P0 | Ready | Populate research planning artifacts (requirements/rubric/backlog) |
| P1 | Scaffolded | Execute source-backed research and architecture analysis |
| P2 | Scaffolded | Validate findings, assess gaps, issue recommendation |

## How to Continue

| Phase | Handoff | Orchestrator Prompt |
|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) |

## Key Defaults Locked

1. AWS-first hybrid cloud posture
2. SOC2 Type II path as compliance baseline
3. Split-stack IaC (SST + Terraform/OpenTofu)
4. US-only sensitive data residency for initial target
5. Completed Palantir ontology research treated as primary blueprint input

## Output Index

See [outputs/manifest.json](./outputs/manifest.json) for phase statuses and all artifact file paths.
