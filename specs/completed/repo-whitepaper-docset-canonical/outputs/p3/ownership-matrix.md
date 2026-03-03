# P3 Ownership Matrix

## Objective

Assign accountable ownership for D01-D12 and prove one-to-one major-topic primary ownership.

## Role Index

| Role | Responsibility Focus |
|---|---|
| Spec Orchestrator | Phase promotion, scope arbitration, and final integration decisions. |
| Evidence Editor | Evidence ID integrity, source mapping, and traceability quality. |
| Domain Model Lead | Canonical terminology, taxonomy discipline, and semantic consistency. |
| Architecture Lead | System boundary/dataflow correctness and phase contract fidelity. |
| AI/Reasoning Lead | NLP/inference strategy and representation guardrails. |
| Contract Lead | Interface and schema contract clarity, invariants, and examples. |
| Ops/Reliability Lead | Operational controls, failure handling, and runbook quality. |
| Quality Lead | Metric rigor, rubric conformance, and gate-readiness verification. |
| Strategy Lead | Risk governance, open decisions, and roadmap coordination. |

## Document Ownership Table

| Doc ID | Primary Owner | Supporting Roles | Sign-off Owner |
|---|---|---|---|
| D01 | Evidence Editor | Spec Orchestrator | Spec Orchestrator |
| D02 | Spec Orchestrator | Architecture Lead, Strategy Lead | Strategy Lead |
| D03 | Domain Model Lead | Evidence Editor | Quality Lead |
| D04 | Domain Model Lead | Contract Lead | Quality Lead |
| D05 | Architecture Lead | Contract Lead | Spec Orchestrator |
| D06 | Architecture Lead | AI/Reasoning Lead | Quality Lead |
| D07 | AI/Reasoning Lead | Domain Model Lead | Strategy Lead |
| D08 | Contract Lead | Architecture Lead | Quality Lead |
| D09 | Ops/Reliability Lead | Architecture Lead | Quality Lead |
| D10 | Quality Lead | Evidence Editor | Spec Orchestrator |
| D11 | Strategy Lead | Quality Lead | Spec Orchestrator |
| D12 | Evidence Editor | Quality Lead | Spec Orchestrator |

## Major Topic Ownership (One-to-One Primary Mapping)

| Topic ID | Major Topic | Primary Doc | Accountable Primary Owner | Supporting Docs |
|---|---|---|---|---|
| T01 | Corpus navigation and reader onboarding | D01 | Evidence Editor | D02, D12 |
| T02 | Executive synthesis and thesis narrative | D02 | Spec Orchestrator | D05, D10, D11 |
| T03 | Canonical terminology and concept model | D03 | Domain Model Lead | D04, D12 |
| T04 | JSDoc semantics and taxonomy model | D04 | Domain Model Lead | D03, D06, D08 |
| T05 | End-to-end architecture and dataflow | D05 | Architecture Lead | D02, D06, D09 |
| T06 | Deterministic extraction and enrichment methods | D06 | Architecture Lead | D04, D07 |
| T07 | NLP, reasoning, and representation strategy | D07 | AI/Reasoning Lead | D06, D10 |
| T08 | Interface and schema contracts | D08 | Contract Lead | D04, D05, D10 |
| T09 | Operations, reliability, and control planes | D09 | Ops/Reliability Lead | D05, D10, D11 |
| T10 | Validation metrics and audit evidence | D10 | Quality Lead | D09, D12 |
| T11 | Risks, open decisions, and roadmap governance | D11 | Strategy Lead | D02, D09, D10 |
| T12 | Traceability and evidence index | D12 | Evidence Editor | D01, D03, D10 |

## Sequencing Ownership Plan

| Sequence | Draft Set | Primary Owners |
|---|---|---|
| S1 | D03, D04 | Domain Model Lead |
| S2 | D05, D06, D08 | Architecture Lead, Contract Lead |
| S3 | D07, D09 | AI/Reasoning Lead, Ops/Reliability Lead |
| S4 | D10, D12 | Quality Lead, Evidence Editor |
| S5 | D02, D11, D01 | Spec Orchestrator, Strategy Lead, Evidence Editor |

## Escalation and Change Control Rules

1. Only the primary owner can approve scope changes for that document.
2. Supporting roles can request changes, but unresolved disputes escalate to Spec Orchestrator.
3. Sign-off owner can block phase promotion when rubric criteria fail.
4. If a topic appears to require dual primaries, the split must be resolved by redefining scope boundaries in `outputs/p3/doc-blueprints.md` before drafting continues.
5. Deferred conflicts from P2 (including C-002) are owned by Strategy Lead in D11 with Evidence Editor support in D12.

## P3 Ownership Gate Checks

1. Every topic T01-T12 maps to exactly one primary document.
2. Every document D01-D12 has one named primary owner.
3. Draft sequencing has assigned owners for every step.
4. Ownership assignments match the document blueprint boundaries.
