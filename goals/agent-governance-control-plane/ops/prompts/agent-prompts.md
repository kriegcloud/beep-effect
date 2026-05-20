# Agent Governance Control Plane — Agent Prompts

## Phase Start Rule

A phase is required to begin with repo grounding. Read the initiative `README.md`, `SPEC.md`, the relevant design docs, the prior phase outputs, and the active handoff before refining the target phase output.

## Prompt: P0 Orchestrator (Foundation And Law Canon)

You are formalizing the repo-wide governance foundation for agent-driven implementation work. Read `SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `standards/effect-first-development.md`, `standards/effect-laws-v1.md`, `standards/schema-first.inventory.jsonc`, `.patterns/jsdoc-documentation.md`, `package.json`, and the downstream bootstrap assets under `ops/prompt-assets/`. Produce or refine `history/outputs/p0-foundation-and-law-canon.md`.

You must verify:

- the source-of-truth order is explicit
- the repo-law families are explicit
- every law is written as a requirement rather than a suggestion
- a law coverage matrix exists
- exception handling rules are explicit

## Prompt: P1 Orchestrator (Agent Topology And Role Contracts)

You are defining the canonical agent catalog and role boundaries for the governance control plane. Read `history/outputs/p0-foundation-and-law-canon.md`, the validator and implementation prompt assets in `ops/prompt-assets/`, and the design docs that already exist in this initiative. Produce or refine `history/outputs/p1-agent-topology-and-role-contracts.md`.

You must verify:

- orchestrator responsibilities are explicit
- worker responsibilities are explicit
- every auditor family has a named contract
- blocker format and acceptance-condition format are explicit
- role overlap is removed

## Prompt: P2 Orchestrator (Workflow Lifecycle And Phase Gates)

You are defining the universal category workflow for this control plane. Read `history/outputs/p0-foundation-and-law-canon.md`, `history/outputs/p1-agent-topology-and-role-contracts.md`, the handoff structure in this initiative, and nearby phased initiative examples in the repo. Produce or refine `history/outputs/p2-workflow-lifecycle-and-phase-gates.md`.

You must verify:

- `Research -> Plan -> Implement -> Refine -> Validate` is explicit
- phase entry criteria are explicit
- phase exit criteria are explicit
- stop conditions and escalation rules are explicit
- no phase advancement path exists without blocker resolution or a logged exception

## Prompt: P3 Orchestrator (Artifact Contracts And Prompt Assets)

You are defining the reusable packet contracts and prompt assets for this governance packet. Read `history/outputs/p1-agent-topology-and-role-contracts.md`, `history/outputs/p2-workflow-lifecycle-and-phase-gates.md`, the prompt assets in `ops/prompt-assets/`, and the consumer bootstrap template. Produce or refine `history/outputs/p3-artifact-contracts-and-prompt-assets.md`.

You must verify:

- the `Execution Packet` is decision complete
- the `Exception Ledger` fields are explicit
- the `Reuse Inventory` fields are explicit
- the reusable prompt assets align with the packet contracts
- downstream initiatives can inherit these assets with domain-specific overlays only

## Prompt: P4 Orchestrator (Enforcement And Verification Contract)

You are defining how repo laws are enforced and verified under this control plane. Read `history/outputs/p0-foundation-and-law-canon.md`, `history/outputs/p1-agent-topology-and-role-contracts.md`, `history/outputs/p2-workflow-lifecycle-and-phase-gates.md`, `history/outputs/p3-artifact-contracts-and-prompt-assets.md`, `package.json`, and any repo quality scripts required for enforcement. Produce or refine `history/outputs/p4-enforcement-and-verification-contract.md`.

You must verify:

- every law family maps to at least one command or explicit manual auditor review
- command ownership is explicit
- failure classification expectations are explicit
- command matrices separate universal gates from initiative-specific gates
- no uncovered law families remain

## Prompt: P5 Orchestrator (Adoption And Consumer Integration)

You are defining how future initiatives inherit this governance packet. Read all prior phase outputs, the prompt assets in `ops/prompt-assets/`, and the consumer bootstrap template. Produce or refine `history/outputs/p5-adoption-and-consumer-integration.md`.

You must verify:

- inherited governance versus consumer-owned design is explicit
- consumer bootstrap steps are explicit
- the first downstream-initiative mapping is explicit
- local duplication of generic governance text is prohibited
- the adoption model is general enough for future initiatives
