# repo-whitepaper-final — Master Orchestration

## State Machine

```text
P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6
```

Phase promotion invariant: a phase is complete only when required outputs exist, rubric checks pass, and the next handoff is present.

## Non-Negotiable Locks

1. Normative claims must map to D01-D12 evidence.
2. Section model is fixed to S01-S10 (P7 aligned).
3. Main body length target is 7,000-10,000 words.
4. Canonical artifact is Markdown plus explicit export plan.
5. Final PASS requires technical and editorial_compliance pass.
6. `C-002` / `E-S03-005` and D11 governance caveats remain explicit unless resolved in corpus.

## P0: Bootstrap and Review Baseline

- Objective: establish baseline, detect spec defects, and lock remediation plan.
- Required outputs:
1. `outputs/p0/initial-plan.md`
2. `outputs/p0/spec-review-findings.md`
3. `outputs/p0/spec-review-issue-register.json`
4. `handoffs/HANDOFF_P0.md`
- Exit gate:
1. Defect inventory exists with severity and owner.
2. All blockers have explicit remediation path.

## P1: Narrative Architecture and Section Contracts

- Objective: lock publication narrative, audience posture, and section contracts.
- Required outputs:
1. `outputs/p1/whitepaper-brief.md`
2. `outputs/p1/section-contracts.md`
3. `outputs/p1/style-guide.md`
4. `handoffs/HANDOFF_P1.md`
- Exit gate:
1. S01-S10 section contract is fixed.
2. Claim/evidence requirements are decision-complete.

## P2: Evidence Packet and Assumption Controls

- Objective: freeze claim/evidence mapping and citation integrity controls.
- Required outputs:
1. `outputs/p2/claim-evidence-matrix.json`
2. `outputs/p2/citation-ledger.md`
3. `outputs/p2/assumption-register.md`
4. `handoffs/HANDOFF_P2.md`
- Exit gate:
1. All required claim IDs and evidence IDs validate against D01-D12/D12 ledger.
2. Matrix and citation ledger are consistent.

## P3: Draft v1

- Objective: produce full manuscript draft with section anchors and caveat carry.
- Required outputs:
1. `outputs/p3/whitepaper-v1.md`
2. `outputs/p3/draft-qc-report.md`
3. `handoffs/HANDOFF_P3.md`
- Exit gate:
1. Section structure complete (S01-S10 + assumptions).
2. Word count is in 7,000-10,000 range.
3. Draft QC has no blocker failures.

## P4: Dual Review and Resolution

- Objective: resolve technical and editorial_compliance must-fix findings.
- Required outputs:
1. `outputs/p4/technical-review.md`
2. `outputs/p4/editorial-review.md`
3. `outputs/p4/revision-resolution-log.md`
4. `handoffs/HANDOFF_P4.md`
- Exit gate:
1. Both reviews contain explicit pass/fail decisions.
2. All must-fix findings are closed.

## P5: Final Publication Packet

- Objective: produce final manuscript and publication controls.
- Required outputs:
1. `outputs/p5/whitepaper-final.md`
2. `outputs/p5/evidence-annex.md`
3. `outputs/p5/publication-export-plan.md`
4. `outputs/p5/publication-gates.json`
5. `handoffs/HANDOFF_P5.md`
- Exit gate:
1. Final manuscript is complete and compliant.
2. Publication gate ledger has no blocker failures.

## P6: Final Signoff and Decision

- Objective: lock final PASS/BLOCKED release decision.
- Required outputs:
1. `outputs/p6/final-signoff-summary.md`
2. `handoffs/HANDOFF_P6.md`
- Exit gate:
1. Dual signoff is explicit.
2. Final decision and caveat carry are explicit.

## Operational Rules

1. Promotion is gate-based.
2. Any blocker failure halts promotion.
3. Review findings are resolved in the same execution cycle.
4. No placeholder content is allowed in completed phase outputs.

## Completion Rule

Execution is complete when P0-P6 outputs exist, all gates pass, dual signoff is recorded, and the final white paper is publication-ready.
