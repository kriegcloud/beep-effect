# Agent Governance Control Plane

## Status

**PENDING**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-03-31
- **Updated:** 2026-03-31

## Quick Navigation

### Root

- [README.md](./README.md) — normative source of truth for this spec package
- [QUICK_START.md](./QUICK_START.md) — operator entrypoint for phased execution
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) — condensed per-phase orchestrator prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) — phase-by-phase corrections and learnings

### Design

- [design/README.md](./design/README.md) — durable design index
- [design/foundation-and-law-canon.md](./design/foundation-and-law-canon.md) — source-of-truth order, law taxonomy, and global operating rules
- [design/agent-topology-and-role-contracts.md](./design/agent-topology-and-role-contracts.md) — canonical agent catalog and role boundaries
- [design/workflow-lifecycle-and-phase-gates.md](./design/workflow-lifecycle-and-phase-gates.md) — universal category loop, entry rules, and exit rules
- [design/artifact-contracts-and-prompt-assets.md](./design/artifact-contracts-and-prompt-assets.md) — packet contracts and reusable prompt surfaces
- [design/enforcement-and-verification-contract.md](./design/enforcement-and-verification-contract.md) — command policy and law-to-gate coverage
- [design/adoption-and-consumer-integration.md](./design/adoption-and-consumer-integration.md) — consumer-spec inheritance and rollout model

### Handoffs

- [handoffs/README.md](./handoffs/README.md) — handoff and orchestration index
- [handoffs/HANDOFF_P0-P5.md](./handoffs/HANDOFF_P0-P5.md) — cross-phase overview handoff
- [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) — Foundation And Law Canon
- [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) — Agent Topology And Role Contracts
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) — Workflow Lifecycle And Phase Gates
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) — Artifact Contracts And Prompt Assets
- [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) — Enforcement And Verification Contract
- [handoffs/HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) — Adoption And Consumer Integration
- [handoffs/P0-P5_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P5_ORCHESTRATOR_PROMPT.md) — combined orchestration prompt
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- [handoffs/P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md)

### Outputs

- [outputs/manifest.json](./outputs/manifest.json) — machine-readable phase and artifact tracking
- [outputs/p0-foundation-and-law-canon.md](./outputs/p0-foundation-and-law-canon.md)
- [outputs/p1-agent-topology-and-role-contracts.md](./outputs/p1-agent-topology-and-role-contracts.md)
- [outputs/p2-workflow-lifecycle-and-phase-gates.md](./outputs/p2-workflow-lifecycle-and-phase-gates.md)
- [outputs/p3-artifact-contracts-and-prompt-assets.md](./outputs/p3-artifact-contracts-and-prompt-assets.md)
- [outputs/p4-enforcement-and-verification-contract.md](./outputs/p4-enforcement-and-verification-contract.md)
- [outputs/p5-adoption-and-consumer-integration.md](./outputs/p5-adoption-and-consumer-integration.md)

### Prompt Assets

- [prompts/README.md](./prompts/README.md) — reusable prompt asset index
- [prompts/VALIDATION_ORCHESTRATOR_PROMPT.md](./prompts/VALIDATION_ORCHESTRATOR_PROMPT.md) — generic validation/orchestration prompt
- [prompts/IMPLEMENTATION_EXECUTOR_PROMPT.md](./prompts/IMPLEMENTATION_EXECUTOR_PROMPT.md) — generic implementation executor prompt
- [prompts/AUDITOR_CATALOG_PROMPT.md](./prompts/AUDITOR_CATALOG_PROMPT.md) — adversarial auditor creation prompt
- [prompts/CATEGORY_WORKFLOW_TEMPLATE.md](./prompts/CATEGORY_WORKFLOW_TEMPLATE.md) — reusable category-loop template
- [prompts/CONSUMER_SPEC_BOOTSTRAP_TEMPLATE.md](./prompts/CONSUMER_SPEC_BOOTSTRAP_TEMPLATE.md) — template for future consumer specs

---

## Purpose

### Problem

Repo-law enforcement, adversarial agent setup, implementation packet design, and validation workflow design are currently being reinvented inside consumer specs. That duplication creates prompt drift, inconsistent phase gates, and remediation work after implementation already started.

### Solution

This spec package defines a reusable agent governance control plane for the repository. It establishes:

1. the canonical repo-law canon for agent-driven work
2. the canonical agent topology for orchestrators, workers, and adversarial auditors
3. the universal category workflow of `Research -> Plan -> Implement -> Refine -> Validate`
4. the reusable packet contracts and prompt assets future specs must inherit
5. the enforcement and verification contract that maps laws to commands and reviewers
6. the consumer integration model that keeps domain-specific specs thin

### Why It Matters

- Future specs need one governance source instead of copying prompt law text.
- Adversarial validation needs a stable operating model that outlives any single project.
- Consumer specs such as OpenClaw porting need decision-complete packets instead of local policy invention.
- Repo-law enforcement needs explicit ownership, explicit phase gates, and explicit evidence.

## Scope

### In Scope

- repo-wide law canon for agent-driven work
- canonical adversarial agent catalog and role contracts
- reusable phase lifecycle and handoff model
- reusable packet contracts and prompt assets
- law-to-command and law-to-auditor verification mapping
- consumer-spec onboarding model for future specs

### Out Of Scope

- project-specific implementation design for any one consumer spec
- code changes in product packages
- repo-law changes that belong in `AGENTS.md`, `CLAUDE.md`, or standards docs
- replacing domain-specific acceptance criteria in consumer specs

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. repo law and enforcement sources
2. current repo reality
3. this README
4. phase output artifacts in `outputs/`
5. prompt assets and handoff artifacts
6. consumer specs that inherit this package

The authoritative repo-law sources for this package are:

- `AGENTS.md`
- `CLAUDE.md`
- `standards/effect-first-development.md`
- `standards/effect-laws-v1.md`
- `standards/schema-first.inventory.jsonc`
- `.patterns/jsdoc-documentation.md`
- root `package.json`

## Core Governance Laws

Every consumer spec and every agent session inheriting this package is required to preserve these laws:

1. Pure data models are required to be modeled as schemas.
2. Domain identifiers and reusable constrained values are required to be modeled as branded schemas.
3. Failing logic is required to expose typed failures through `Effect`, `Result`, or `Exit`.
4. `try/catch` is not allowed where `Result.try`, `Effect.try`, or `Effect.tryPromise` is required.
5. Native helpers are not allowed where Effect modules or schema codecs exist.
6. Unknown input is required to be decoded with Schema at the boundary.
7. `Context.Service` contracts are required to expose domain-facing capabilities without leaking dependencies.
8. Service wiring is required to be composed with layers close to the application boundary.
9. Network requests are required to use `effect/unstable/http`, and application HTTP boundaries are required to use `effect/unstable/httpapi`.
10. Stateful workflows are required to use the correct `Ref`-family primitive instead of ad-hoc mutable state.
11. Existing repo utilities, schemas, branded types, services, and helpers are required to be reused when they satisfy the need.
12. Exported APIs are required to have repo-standard JSDoc and docgen-clean examples.
13. Approved work is required to ship without knowingly unlawful code or a remediation backlog.

## Structural Pattern Reused

This package intentionally reuses the strong phased-spec structure already proven in nearby specs:

- normative root README
- quick-start entrypoint
- per-phase prompts
- reflection log
- durable design docs
- per-phase handoffs and orchestrator prompts
- output artifacts per phase
- machine-readable manifest

## Phase Breakdown

| Phase | Focus | Output | Exit Requirement |
|---|---|---|---|
| P0 | Foundation And Law Canon | `outputs/p0-foundation-and-law-canon.md` | law canon, source-of-truth order, and law coverage matrix are explicit |
| P1 | Agent Topology And Role Contracts | `outputs/p1-agent-topology-and-role-contracts.md` | every law family has a named enforcing agent with explicit responsibilities |
| P2 | Workflow Lifecycle And Phase Gates | `outputs/p2-workflow-lifecycle-and-phase-gates.md` | universal category loop, entry criteria, exit criteria, and stop conditions are explicit |
| P3 | Artifact Contracts And Prompt Assets | `outputs/p3-artifact-contracts-and-prompt-assets.md` | execution packet, exception ledger, reuse inventory, and prompt assets are decision complete |
| P4 | Enforcement And Verification Contract | `outputs/p4-enforcement-and-verification-contract.md` | law-to-command and law-to-auditor coverage is explicit |
| P5 | Adoption And Consumer Integration | `outputs/p5-adoption-and-consumer-integration.md` | consumer inheritance model is explicit and reusable |

## Architecture Decision Record Summary

| ADR | Decision Surface | Decision | Rationale |
|---|---|---|---|
| ADR-001 | Spec ownership | This package is the canonical repo-wide governance source for agent-driven implementation work | Governance rules duplicated inside consumer specs drift too quickly |
| ADR-002 | Phase model | Every category uses `Research -> Plan -> Implement -> Refine -> Validate` | Repeating one control loop keeps future specs uniform and auditable |
| ADR-003 | Enforcement model | Repo laws require both commands and adversarial reviewers | Command-only enforcement misses structural and semantic drift |
| ADR-004 | Packet model | Worker sessions consume an `Execution Packet` and do not invent scope locally | Decision-complete handoffs reduce remediation and scope drift |
| ADR-005 | Consumer model | Consumer specs inherit generic governance from this package and define only domain-specific overlays | Thin consumer specs stay easier to maintain and easier to audit |

## Success Criteria

This spec package is complete only when all of these statements are true:

- a future spec can inherit governance from this package without copying generic law text
- the agent catalog covers orchestration, implementation, and adversarial validation responsibilities completely
- the workflow lifecycle leaves no ambiguity about phase entry, exit, blockers, and escalation
- the artifact contracts are detailed enough to drive a fresh implementation session without design invention
- the verification contract maps every law family to at least one command or explicit auditor review
- the consumer integration model proves how OpenClaw and later specs inherit this package

## Initial Consumer Targets

The first intended consumer is `specs/pending/openclaw-port`. Later consumers may include refactor specs, migration specs, package-bootstrap specs, and service-integration specs that require the same governance and validation posture.
