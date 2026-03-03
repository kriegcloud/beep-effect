# repo-whitepaper-final — Rubrics

## Rubric Model

Each phase status is one of:

- `pass`: all required checks satisfied.
- `fail`: one or more checks failed.
- `blocked`: dependencies unresolved or must-fix findings open.

A phase cannot be promoted with `fail` or `blocked`.

## Global Blocker Rules

1. Any normative claim missing D01-D12 claim/evidence anchors.
2. Any required section missing from manuscript.
3. Any placeholder token in completed outputs.
4. Missing technical or editorial_compliance review decision.
5. Any unresolved must-fix finding.
6. Missing caveat carry for `C-002` / `E-S03-005` or open D11 governance risks.

## P0 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Baseline audit | Findings and issue register exist with severity and ownership | Missing defect inventory or unclassified blockers |
| Remediation plan | Every blocker has a fix path and target artifact | Blockers without remediation path |
| Contract freeze | Confidence model and section model are explicit | Ambiguous confidence or section policy |

## P1 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Audience and thesis contract | Audience, thesis, and narrative arc are explicit | Ambiguous narrative posture |
| Section contract completeness | S01-S10 contract is complete with word ranges and anchors | Missing sections or anchors |
| Style enforceability | Style guide is concrete and testable | Generic guidance without checks |

## P2 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Claim-evidence coverage | All required claim IDs mapped by section | Missing required claim mapping |
| Citation integrity | Citation ledger covers all matrix evidence IDs | Missing evidence rows or invalid source mappings |
| Assumption separation | Assumptions are explicit and non-normative | Assumptions mixed into normative claims |

## P3 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Structural completeness | S01-S10 present plus assumptions section | Missing required section |
| Anchor compliance | Every section has claim IDs and evidence IDs lines | Missing anchors |
| Length target | Main body 7,000-10,000 words | Out of range |
| Caveat carry | C-002 and D11 caveat language explicit | Caveats omitted or softened |
| Draft QC | QC report includes all checks and no blockers | Missing checks or unresolved blockers |

## P4 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Technical review completeness | Review includes reviewer, date, decision, findings | Missing required fields |
| Editorial/compliance completeness | Review includes reviewer, date, decision, findings | Missing required fields |
| Must-fix closure | All must-fix findings are closed in revision log | Any must-fix open |
| Traceability preservation | Revisions preserve claim/evidence links | Broken links after revision |

## P5 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Final manuscript quality | Complete, coherent, and compliant with section contracts | Structural or narrative integrity failures |
| Evidence annex integrity | Major claims mapped to valid evidence/source IDs | Missing mappings or invalid IDs |
| Export readiness | Export plan includes owners, checklist, acceptance criteria | Incomplete or ambiguous export process |
| Publication gate ledger | All gates recorded with checker, date, evidence path | Missing gate records or blocker fails |

## P6 Rubric

| Dimension | Pass Condition | Fail Condition |
|---|---|---|
| Dual signoff | Technical and editorial_compliance signoff recorded | Missing signoff |
| Decision clarity | PASS/BLOCKED explicit with basis | Ambiguous decision |
| Caveat carry | Residual caveats explicitly carried | Caveats silently removed |
| Handoff completeness | Final handoff captures evidence and outcome | Incomplete handoff packet |

## Publication Gate Set (P5/P6)

1. `G-STRUCTURE-COMPLETE`
2. `G-WORD-COUNT-RANGE`
3. `G-EVIDENCE-ANCHOR-INTEGRITY`
4. `G-CITATION-LEDGER-CONSISTENCY`
5. `G-CAVEAT-PRESERVATION`
6. `G-TECHNICAL-REVIEW-PASS`
7. `G-EDITORIAL-REVIEW-PASS`
8. `G-MUST-FIX-CLOSED`
9. `G-NO-PLACEHOLDERS`
10. `G-CLAIM-ID-VALIDITY`
11. `G-EVIDENCE-ID-VALIDITY`
12. `G-MATRIX-LEDGER-CONSISTENCY`
13. `G-SECTION-MODEL-ALIGNMENT`
14. `G-ASSUMPTION-SEPARATION`

A P6 PASS requires all gates to be `pass`.

## Verification Command Contract

```bash
find specs/pending/repo-whitepaper-final -maxdepth 4 -type f | sort
rg -n "TODO|TBD|PLACEHOLDER|FIXME" specs/pending/repo-whitepaper-final
node specs/pending/repo-whitepaper-final/tools/validate-spec-integrity.mjs
node specs/pending/repo-whitepaper-final/tools/validate-matrix-ledger-consistency.mjs
node specs/pending/repo-whitepaper-final/tools/validate-whitepaper-draft.mjs --file specs/pending/repo-whitepaper-final/outputs/p3/whitepaper-v1.md
node specs/pending/repo-whitepaper-final/tools/validate-whitepaper-draft.mjs --file specs/pending/repo-whitepaper-final/outputs/p5/whitepaper-final.md
node specs/pending/repo-whitepaper-final/tools/validate-publication-gates.mjs
```

## Failure Reporting Rules

1. Record failing dimension and evidence path.
2. Mark phase `fail` or `blocked`.
3. Record remediation in handoff and reflection log.
4. Re-run validators after fix before phase promotion.
