# Agent Governance Control Plane — Quick Start

> A reusable governance spec package for adversarial agents, validation workflows, and decision-complete execution packets in this repository.

## What This Delivers

- a canonical repo-law control plane for agent-driven work
- a reusable adversarial auditor catalog
- a universal `Research -> Plan -> Implement -> Refine -> Validate` workflow
- reusable packet contracts for validator and implementer sessions
- a consumer-spec template that keeps future specs thin

## Current Status

| Phase | Focus | Status |
|---|---|---|
| P0 | Foundation And Law Canon | PENDING |
| P1 | Agent Topology And Role Contracts | PENDING |
| P2 | Workflow Lifecycle And Phase Gates | PENDING |
| P3 | Artifact Contracts And Prompt Assets | PENDING |
| P4 | Enforcement And Verification Contract | PENDING |
| P5 | Adoption And Consumer Integration | PENDING |

## Start Here

1. Read [README.md](./README.md) for the normative contract and ADR summary.
2. Open the handoff for the active pending phase.
3. Run the matching orchestrator prompt.
4. Write or refine the named phase output.
5. Update [outputs/manifest.json](./outputs/manifest.json) after the phase closes.

## Phase Entry Files

| Phase | Handoff | Orchestrator | Output |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-foundation-and-law-canon.md](./outputs/p0-foundation-and-law-canon.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-agent-topology-and-role-contracts.md](./outputs/p1-agent-topology-and-role-contracts.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-workflow-lifecycle-and-phase-gates.md](./outputs/p2-workflow-lifecycle-and-phase-gates.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-artifact-contracts-and-prompt-assets.md](./outputs/p3-artifact-contracts-and-prompt-assets.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-enforcement-and-verification-contract.md](./outputs/p4-enforcement-and-verification-contract.md) |
| P5 | [HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) | [P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md) | [p5-adoption-and-consumer-integration.md](./outputs/p5-adoption-and-consumer-integration.md) |

## Operating Rule

Every phase is required to complete the same category loop:

1. Research the current repo reality and existing artifacts.
2. Plan the category with explicit acceptance criteria.
3. Implement or formalize the category artifacts.
4. Refine them with adversarial review.
5. Validate them with explicit coverage evidence.

## First Consumer

`specs/pending/openclaw-port` is the first intended consumer. The OpenClaw package is required to inherit governance from this control plane rather than continuing to own generic validation policy locally.
