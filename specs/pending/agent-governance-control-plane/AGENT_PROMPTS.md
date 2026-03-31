# Agent Governance Control Plane — Agent Prompts

## Phase Start Rule

A phase is required to begin with repo grounding. Read the README, the relevant design docs, the prior phase outputs, and the active handoff before refining the target phase output.

## Prompt: P0 Orchestrator (Foundation And Law Canon)

You are formalizing the repo-wide governance foundation for agent-driven implementation work. Read `README.md`, `AGENTS.md`, `CLAUDE.md`, `standards/effect-first-development.md`, `standards/effect-laws-v1.md`, `standards/schema-first.inventory.jsonc`, `.patterns/jsdoc-documentation.md`, `package.json`, and the OpenClaw prompt split under `specs/pending/openclaw-port`. Produce or refine `outputs/p0-foundation-and-law-canon.md`.

You must verify:

- the source-of-truth order is explicit
- the repo-law families are explicit
- every law is written as a requirement rather than a suggestion
- a law coverage matrix exists
- exception handling rules are explicit

## Prompt: P1 Orchestrator (Agent Topology And Role Contracts)

You are defining the canonical agent catalog and role boundaries for the governance control plane. Read `outputs/p0-foundation-and-law-canon.md`, the OpenClaw validator and implementation prompts, and the design docs that already exist in this package. Produce or refine `outputs/p1-agent-topology-and-role-contracts.md`.

You must verify:

- orchestrator responsibilities are explicit
- worker responsibilities are explicit
- every auditor family has a named contract
- blocker format and acceptance-condition format are explicit
- role overlap is removed

## Prompt: P2 Orchestrator (Workflow Lifecycle And Phase Gates)

You are defining the universal category workflow for this control plane. Read `outputs/p0-foundation-and-law-canon.md`, `outputs/p1-agent-topology-and-role-contracts.md`, the handoff structure in this package, and nearby phased-spec examples in the repo. Produce or refine `outputs/p2-workflow-lifecycle-and-phase-gates.md`.

You must verify:

- `Research -> Plan -> Implement -> Refine -> Validate` is explicit
- phase entry criteria are explicit
- phase exit criteria are explicit
- stop conditions and escalation rules are explicit
- no phase advancement path exists without blocker resolution or a logged exception

## Prompt: P3 Orchestrator (Artifact Contracts And Prompt Assets)

You are defining the reusable packet contracts and prompt assets for this governance package. Read `outputs/p1-agent-topology-and-role-contracts.md`, `outputs/p2-workflow-lifecycle-and-phase-gates.md`, the prompt assets in `prompts/`, and the OpenClaw prompt pair. Produce or refine `outputs/p3-artifact-contracts-and-prompt-assets.md`.

You must verify:

- the `Execution Packet` is decision complete
- the `Exception Ledger` fields are explicit
- the `Reuse Inventory` fields are explicit
- the reusable prompt assets align with the packet contracts
- consumer specs can inherit these assets with domain-specific overlays only

## Prompt: P4 Orchestrator (Enforcement And Verification Contract)

You are defining how repo laws are enforced and verified under this control plane. Read `outputs/p0-foundation-and-law-canon.md`, `outputs/p1-agent-topology-and-role-contracts.md`, `outputs/p2-workflow-lifecycle-and-phase-gates.md`, `outputs/p3-artifact-contracts-and-prompt-assets.md`, `package.json`, and any repo quality scripts required for enforcement. Produce or refine `outputs/p4-enforcement-and-verification-contract.md`.

You must verify:

- every law family maps to at least one command or explicit manual auditor review
- command ownership is explicit
- failure classification expectations are explicit
- command matrices separate universal gates from consumer-specific gates
- no uncovered law families remain

## Prompt: P5 Orchestrator (Adoption And Consumer Integration)

You are defining how future specs inherit this governance package. Read all prior phase outputs, the prompt assets in `prompts/`, and `specs/pending/openclaw-port`. Produce or refine `outputs/p5-adoption-and-consumer-integration.md`.

You must verify:

- inherited governance versus consumer-owned design is explicit
- consumer bootstrap steps are explicit
- OpenClaw is mapped as the first consumer
- local duplication of generic governance text is prohibited
- the adoption model is general enough for future consumer specs
