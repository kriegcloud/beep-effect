# P0 Research Plan

## Objective

Produce a decision-complete research program for selecting cloud providers and IaC patterns for a Palantir-light architecture with strong policy, provenance, runtime durability, and compliance posture.

## Pre-Edit Compliance Audit (2026-02-25)

| Checklist Item (`HANDOFF_P0`) | Pre-Hardening State | Delta Applied |
|---|---|---|
| Capability requirements have measurable acceptance targets | Partial: capabilities existed, measurable targets were implicit | Added measurable `Acceptance Target` and `Validation Link` fields across `CAP-*` and `NFR-*` |
| Provider rubric has weighted criteria and rejection gates | Partial: weighted criteria and basic gates existed | Added deterministic scoring algorithm, machine-checkable rejection gates, decision bands, and tie-break rules |
| Assumptions/constraints explicit and versioned | Partial: explicit but not versioned | Added metadata block, change log, and versioned change-control policy |
| Backlog prioritized using `ResearchQuestion` structure | Partial: single list with priorities | Re-batched into critical path vs secondary path while preserving `ResearchQuestion` schema and adding auditable answered definition |
| Source map links questions to concrete evidence channels | Partial: mapping existed without minimum evidence rules | Added per-question minimum primary evidence requirements, conflict workflow, and confidence policy |

## Decision Gates

| Gate ID | Decision | Required Evidence | Exit Condition |
|---|---|---|---|
| DG-01 | Confirm baseline constraints | `assumptions-and-constraints.md` + stakeholder assumptions | Constraints frozen for P1 |
| DG-02 | Freeze provider rubric | `provider-evaluation-rubric.md` weighted criteria + rejection rules | Rubric approved for scorecards |
| DG-03 | Prioritize research backlog | `research-backlog.md` `ResearchQuestion` batches with impact ratings | High-impact questions have owners and blocking dependencies |
| DG-04 | Source strategy lock | `source-map.md` + quality rules | Each high-impact question has source path and minimum evidence targets |

## Decision Gate Completion Checklist

- [ ] DG-01 complete when [assumptions-and-constraints.md](./assumptions-and-constraints.md) metadata, locked constraints, and validation triggers are signed off.
- [ ] DG-02 complete when [provider-evaluation-rubric.md](./provider-evaluation-rubric.md) weights sum to 100 and all rejection gates are machine-checkable.
- [ ] DG-03 complete when [research-backlog.md](./research-backlog.md) Batch 1 owners are assigned and `Definition of answered` criteria are accepted.
- [ ] DG-04 complete when [source-map.md](./source-map.md) contains non-orphan `RQ-*` mappings and source quality/conflict rules are accepted.

## Workstreams

1. Requirements and capability mapping
2. Provider evaluation framework
3. Policy/provenance/runtime validation preparation
4. Source strategy and citation indexing

## Deliverables and Acceptance

| Deliverable | Acceptance |
|---|---|
| Capability matrix | Covers core platform capabilities + measurable architecture implications + P2 validation links |
| Evaluation rubric | Includes weights, deterministic scoring math, and reject-on-fail criteria |
| Assumptions and constraints | Explicit baseline defaults, non-negotiables, and versioned change control |
| Research backlog | Prioritized, owner-assigned, impact-scoped questions with auditable completion rules |
| Source map | Question-to-source traceability with minimum evidence expectations |

## P0 Phase Exit Definition of Done

1. Capability requirements are documented with measurable acceptance targets.
2. Provider rubric includes weighted criteria and rejection gates.
3. Assumptions and constraints are explicit and versioned.
4. Research backlog is prioritized and uses `ResearchQuestion` structure.
5. Source map links questions to concrete evidence channels.

## P0 Planning Risks

| Risk ID | Risk | Impact | Mitigation |
|---|---|---|---|
| P0-RISK-001 | Measurable targets are too vague to validate in P2 | High | Require every `High` capability to map to explicit `VC-*` checks |
| P0-RISK-002 | Rubric scoring drift across evaluators | High | Use deterministic formulas, rejection gates, and tie-break sequence |
| P0-RISK-003 | Supplemental evidence overused for high-impact decisions | Medium | Enforce primary-source minimums and confidence annotations |
| P0-RISK-004 | Backlog completion marked without traceable evidence | High | Apply `Definition of answered` checks before status change |

## Operating Rules

- Use primary sources where available; mark inferences explicitly.
- Separate assumptions from validated findings.
- Keep all outputs in `outputs/p0-research-plan/`.
- Structure backlog entries as `ResearchQuestion`.

## Phase Handoff to P1

P1 starts only after DG-01 through DG-04 are marked complete.
