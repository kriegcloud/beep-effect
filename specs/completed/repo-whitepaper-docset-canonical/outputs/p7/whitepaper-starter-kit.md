# P7 Whitepaper Starter Kit

## Objective

Enable independent authors to produce a viable greenfield white-paper outline using only D01-D12 corpus outputs, without additional source discovery.

## Inputs and Preconditions

1. Full corpus: `outputs/docset/D01.md` through `outputs/docset/D12.md`.
2. Certified quality artifacts from `outputs/p6/*` (consistency, completeness, traceability, gates, scorecard).
3. Locked source boundaries and non-goals from `README.md`.
4. Assumption policy: any claim without evidence must be marked as an assumption and tracked in risk language.

## Persona Profiles

1. Leadership author
- Primary goal: produce executive thesis, differentiators, and decision posture.
- Priority docs: D02, D05, D10, D11, D12.
2. Architecture author
- Primary goal: produce system, boundary, and dataflow narrative with contract-level fidelity.
- Priority docs: D05, D06, D08, D09, D12.
3. Methods/research author
- Primary goal: produce extraction, reasoning, and representation methodology narrative.
- Priority docs: D03, D04, D06, D07, D10, D12.
4. Compliance/editorial author
- Primary goal: verify evidence integrity, risk disclosure, and traceability fidelity.
- Priority docs: D10, D11, D12, with D01 for navigation.

## Reading Paths by Persona

| Persona | Reading Path | Intended Deliverable |
|---|---|---|
| Leadership author | D01 -> D02 -> D05 -> D10 -> D11 -> D12 | Executive-first outline with governance posture |
| Architecture author | D01 -> D03 -> D04 -> D05 -> D06 -> D08 -> D09 -> D12 | Architecture and implementation outline |
| Methods/research author | D01 -> D03 -> D04 -> D06 -> D07 -> D10 -> D12 | Methods and reasoning outline |
| Compliance/editorial author | D01 -> D10 -> D11 -> D12 -> targeted D0x deep dives | Evidence and risk validation pass |

## White-Paper Section Blueprint

| White-paper Section | Primary Docs | Supporting Docs | Required Claim IDs | Required Evidence IDs | Acceptance Check |
|---|---|---|---|---|---|
| Executive Summary | D02 | D01, D12 | D02-C01, D02-C06 | E-S02-002, E-S04-002 | States thesis and differentiators with evidence-backed claims. |
| Problem and Context | D02, D03 | D11 | D02-C02, D02-C03, D03-C01 | E-S02-003, E-S02-001, E-S03-001 | Defines problem and canonical language without term drift. |
| Conceptual Model and Terminology | D03 | D04, D12 | D03-C03, D03-C04, D03-C05 | E-S01-001, E-S03-005, E-S04-005 | Includes canonical glossary intent and collision handling posture. |
| Architecture and Dataflow | D05 | D06, D08, D09 | D05-C01, D05-C04, D05-C06 | E-S02-002, E-S03-002, E-S04-002 | Shows stage flow, boundaries, and certainty-layer framing. |
| Methods and Reasoning | D06, D07 | D04, D10 | D06-C06, D06-C07, D07-C04 | E-S03-002, E-S03-003, E-S04-003 | Describes reproducible method flow and reasoning limits. |
| Interfaces and Contracts | D08 | D04, D05, D12 | D08-C01, D08-C05, D08-C08 | E-S01-002, E-S02-003, E-S03-005 | Captures invariants, ownership, and contract expectations. |
| Operations and Reliability | D09 | D10, D11 | D09-C01, D09-C04, D09-C06 | E-S04-002, E-S03-005, E-S04-001 | Includes runbook-level posture and failure/recovery controls. |
| Validation and Metrics | D10 | D12, D11 | D10-C01, D10-C02, D10-C06 | E-S02-004, E-S04-004, E-S04-002 | Provides formulas, audit linkage, and measurable gates. |
| Risks and Roadmap | D11 | D10, D12 | D11-C01, D11-C02, D11-C05 | E-S04-004, E-S03-005, E-S04-002 | Discloses open decisions, triggers, owners, and mitigations. |
| Traceability Annex | D12 | D10 | D12-C01, D12-C03, D12-C06 | E-S03-001, E-S01-005, E-S03-005 | Maps major claims to evidence IDs with integrity caveats. |

## Outline Construction Protocol

1. Select one persona track from this starter kit and read its full path in order.
2. Establish a target outline containing at least seven top-level sections.
3. For each section, choose at least one required claim ID from the section blueprint.
4. For each chosen claim ID, record at least one linked evidence ID from D12.
5. Draft section intent in one to three sentences, then add claim/evidence anchors.
6. If a needed statement has no evidence ID, mark it as `Assumption` and do not present it as normative fact.
7. Add a dedicated `Risks and Open Decisions` section sourced from D11.
8. Add a dedicated `Traceability and Evidence` section sourced from D12.
9. Run a self-check: each section has at least one claim ID and one evidence ID.
10. Freeze outline version with date and persona tag.

## Citation and Evidence Protocol

1. Every normative statement must include at least one claim ID and one evidence ID.
2. Prefer primary evidence IDs over secondary evidence where both are available.
3. Preserve status labels (`implemented`, `specified`, `conceptual`) when translating claims.
4. Do not collapse certainty tiers across deterministic and inferred claims.
5. Assumptions must be explicitly labeled and mirrored in the risk section.
6. Keep traceability references auditable against D12 claim linkage rows.

## Independent Draftability Test

### Test Procedure

1. Assign an author who did not produce D01-D12.
2. Provide only this starter kit and D01-D12 files.
3. Require a white-paper outline draft in one pass, without source discovery outside corpus docs.

### Pass Criteria

1. Outline contains at least seven top-level sections.
2. Every top-level section includes at least one claim ID and one evidence ID.
3. Outline includes explicit `Assumptions` and `Risks and Open Decisions` sections.
4. Risks map to D11 and traceability anchors map to D12.

## Failure Triage

1. Missing section-level evidence links
- Action: revisit D12 linkage index and patch missing claim/evidence anchors.
2. Unclear architecture or method sections
- Action: re-run Architecture or Methods reading path and tighten section ownership boundaries.
3. Excessive assumptions
- Action: demote unsupported claims and expand evidence-backed alternatives from D10-D12.
4. Terminology collisions
- Action: normalize language against D03 canonical terms before redrafting.

## Ready-to-Use Outline Template

```markdown
# <White Paper Working Title>

## 1. Executive Summary
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 2. Problem and Context
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 3. Conceptual Model and Terminology
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 4. Architecture and Dataflow
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 5. Methods and Reasoning
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 6. Interfaces and Contracts
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 7. Operations and Reliability
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 8. Validation and Metrics
- Claim IDs: <...>
- Evidence IDs: <...>
- Draft notes: <...>

## 9. Risks and Open Decisions
- Claim IDs: <...>
- Evidence IDs: <...>
- Open risks from D11: <...>

## 10. Traceability and Evidence Annex
- Claim IDs: <...>
- Evidence IDs: <...>
- Integrity caveats: <...>

## Assumptions
- A-001: <statement> (reason: no evidence ID available in D12)
```
