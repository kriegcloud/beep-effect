# repo-whitepaper-docset-canonical — Master Orchestration

## State Machine

```text
P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6 -> P7
```

> Phase completion invariant: a phase is complete only when declared outputs exist, phase rubric dimensions pass, and the next handoff file exists.

---

## Non-Negotiable Locks

1. `X = 12` output documents is fixed for this cycle.
2. Only locked source areas are admissible inputs.
3. Normative claims require evidence IDs and traceability links.
4. Topic primary ownership must be single-assignment.
5. Contradictory source claims must be resolved or logged.

---

## P0: Spec Bootstrap and Governance Freeze

- Objective: establish package skeleton, ADR locks, and quality gate contracts.
- Owners: Spec Orchestrator.
- Inputs:
1. Canonical pending spec patterns in `specs/pending/*`.
2. Locked source area list from `README.md`.
- Tasks:
1. Populate canonical top-level files.
2. Define phase model and gate language.
3. Define artifact contracts (`DocDescriptor`, `CorpusFact`, `TraceabilityLink`, `QualityGateResult`).
- Required outputs:
1. `README.md`
2. `QUICK_START.md`
3. `MASTER_ORCHESTRATION.md`
4. `RUBRICS.md`
5. `REFLECTION_LOG.md`
6. `outputs/initial_plan.md`
7. `handoffs/HANDOFF_P0.md`
- Dependencies: none.
- Risks and mitigations:
1. Pattern drift from canonical format.
Mitigation: section parity with existing pending canonical specs.
- Exit gate:
1. All required files exist.
2. P0 rubric passes.
3. P1 handoff file exists.

## P1: Corpus Inventory and Fact Harvest

- Objective: build normalized source index and fact ledger.
- Owners: Evidence Editor.
- Inputs:
1. All four source areas.
2. P0 locked contracts.
- Tasks:
1. Enumerate source artifacts.
2. Extract high-value claims.
3. Assign confidence and implementation status.
4. Seed evidence IDs.
- Required outputs:
1. `outputs/p1/source-index.md`
2. `outputs/p1/fact-ledger.json`
3. `outputs/p1/coverage-baseline.md`
- Dependencies: P0 pass.
- Risks and mitigations:
1. Missed deep artifacts.
Mitigation: recursive indexing with completeness counters by source area.
- Exit gate:
1. 100% source-area inventory complete.
2. Fact ledger contains evidence IDs and status labels.
3. P2 handoff file exists.

## P2: Taxonomy and Concept Normalization

- Objective: resolve conceptual overlap and conflicting taxonomies.
- Owners: Domain Model Lead.
- Inputs:
1. `outputs/p1/fact-ledger.json`
2. JSDoc domain model details.
3. Canonical codegraph taxonomy references.
- Tasks:
1. Define canonical term model.
2. Build taxonomy crosswalk.
3. Record conflicts and disposition.
- Required outputs:
1. `outputs/p2/term-model.md`
2. `outputs/p2/taxonomy-crosswalk.md`
3. `outputs/p2/conflict-register.md`
- Dependencies: P1 pass.
- Risks and mitigations:
1. Unresolvable Tier-1 concept conflicts.
Mitigation: escalation path to ADR amendment with explicit impact notes.
- Exit gate:
1. No unresolved Tier-1 conflicts.
2. Crosswalk approved.
3. P3 handoff file exists.

## P3: Document Blueprint and Allocation

- Objective: freeze D01-D12 blueprint and ownership.
- Owners: Spec Orchestrator.
- Inputs:
1. P2 normalized model and conflict register.
- Tasks:
1. Define per-document outline and scope boundaries.
2. Assign single primary owner by topic.
3. Generate `manifest.json` using `DocDescriptor` schema.
- Required outputs:
1. `outputs/p3/doc-blueprints.md`
2. `outputs/p3/ownership-matrix.md`
3. `outputs/manifest.json`
- Dependencies: P2 pass.
- Risks and mitigations:
1. Scope overlap causing duplication.
Mitigation: topic exclusivity check.
- Exit gate:
1. Every major topic maps to exactly one primary doc.
2. Manifest schema validates.
3. P4 handoff file exists.

## P4: Drafting Wave A (D01-D08)

- Objective: deliver core technical corpus.
- Owners: Architecture Lead, AI/Reasoning Lead, Contract Lead.
- Inputs:
1. P3 blueprints and ownership matrix.
2. P1 fact ledger and evidence IDs.
- Tasks:
1. Author D01-D08.
2. Link all normative claims to evidence IDs.
3. Add cross-doc references where detail is delegated.
- Required outputs:
1. `outputs/docset/D01.md` ... `outputs/docset/D08.md`
- Dependencies: P3 pass.
- Risks and mitigations:
1. Duplicated architecture/method/interface content.
Mitigation: cross-reference-first policy and duplication rubric.
- Exit gate:
1. D01-D08 satisfy completion checks in manifest.
2. Internal consistency pass complete.
3. P5 handoff file exists.

## P5: Drafting Wave B (D09-D12)

- Objective: deliver operations, quality, governance, and traceability corpus.
- Owners: Ops/Reliability Lead, Quality Lead, Strategy Lead, Evidence Editor.
- Inputs:
1. P4 drafts.
2. Remaining source coverage gaps.
- Tasks:
1. Author D09-D12.
2. Finalize metrics formulas and risk ownership.
3. Assemble full source-to-claim traceability tables.
- Required outputs:
1. `outputs/docset/D09.md` ... `outputs/docset/D12.md`
- Dependencies: P4 pass.
- Risks and mitigations:
1. Evidence drift between documents.
Mitigation: single evidence ledger and late-phase reconciliation.
- Exit gate:
1. D09-D12 satisfy completion checks in manifest.
2. 100% major claims are evidence-linked.
3. P6 handoff file exists.

## P6: Consistency, Quality, and Completeness Gates

- Objective: certify corpus readiness.
- Owners: Quality Lead.
- Inputs:
1. D01-D12 complete drafts.
2. Manifest completion checks.
- Tasks:
1. Run consistency sweep.
2. Run completeness and traceability audits.
3. Produce quality scorecard and gate outcomes.
- Required outputs:
1. `outputs/p6/consistency-report.md`
2. `outputs/p6/completeness-report.md`
3. `outputs/p6/quality-scorecard.md`
4. `outputs/p6/traceability-links.json`
5. `outputs/p6/quality-gates.json`
- Dependencies: P5 pass.
- Risks and mitigations:
1. Hidden contradictions across long-form content.
Mitigation: pairwise contradiction scan anchored to term model.
- Exit gate:
1. All rubric dimensions pass.
2. No blocker contradictions.
3. P7 handoff file exists.

## P7: Publication Handoff and White-Paper Starter Kit

- Objective: package corpus as primary white-paper reference base.
- Owners: Spec Orchestrator.
- Inputs:
1. P6 certified corpus.
- Tasks:
1. Produce starter kit with drafting pathways.
2. Map D01-D12 sections to white-paper sections.
3. Finalize handoff guidance.
- Required outputs:
1. `outputs/p7/whitepaper-starter-kit.md`
2. `handoffs/HANDOFF_P7.md`
3. Finalized `outputs/manifest.json`
- Dependencies: P6 pass.
- Risks and mitigations:
1. Low usability for new authors.
Mitigation: guided reading routes by persona and deliverable target.
- Exit gate:
1. New writer can produce a viable white-paper outline without additional source discovery.
2. Publication handoff packet complete.

---

## Operational Rules

1. Promotion is gate-based, not time-based.
2. Rubric failures block phase completion.
3. Lock changes require explicit ADR update in `README.md`.
4. Hand-off files are required deliverables for every phase.

## Completion Rule

The orchestration completes only when P0-P7 exits all pass and the starter kit validates against usability criteria.
