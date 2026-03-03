# P2 Term Model

## Objective

Define canonical Tier-1 terminology for D01-D12 so major claims use one stable meaning and collision handling is explicit.

## Tier-1 Canonical Terms (Normative)

| Term | Canonical Meaning | Synonyms to Avoid | Owner | Usage Rule |
|---|---|---|---|---|
| corpus | The fixed 12-document reference set defined by this spec cycle (`D01`-`D12`). | knowledge base, reference base, package, dump | Domain Model Lead | Use `corpus` as the default term in all normative statements. |
| source area | One of the four locked input surfaces listed in `README.md`. | repository slice, input surface | Evidence Editor | Use only when referring to one of the four approved top-level input domains. |
| source artifact | A concrete file within a source area used as evidence input. | source file (ambiguous), document blob | Evidence Editor | Pair with a path when used in traceability statements. |
| evidence ID | Stable identifier that anchors a claim to source-backed evidence (`E-*`). | citation token, proof handle | Evidence Editor | Required for all normative claims derived from corpus sources. |
| normative claim | A statement treated as technical truth for architecture, contracts, gates, or methods. | narrative statement, descriptive note | Quality Lead | Must be evidence-linked or explicitly labeled assumption. |
| traceability link | Mapping record from source artifact to claim surface (`docId` + section + coverage type). | citation edge, reference hop | Evidence Editor | Use when describing source-to-claim coverage guarantees. |
| quality gate | Pass/fail phase promotion criterion defined in rubric language. | checklist item, milestone check | Quality Lead | Use only for gate conditions with blocking semantics. |
| primary ownership | Single authoritative document owner for a major topic. | shared ownership, co-primary | Spec Orchestrator | Exactly one primary owner is allowed per major topic. |
| taxonomy axis | Canonical classification dimension used in P2 crosswalk normalization. | category family, class bucket | Domain Model Lead | Use only for the five canonical axes in `taxonomy-crosswalk.md`. |
| blocker conflict | Conflict that prevents phase exit until resolved or downgraded with rationale. | major issue, critical mismatch | Quality Lead | Any `high` conflict left `open` is blocker-level by definition. |
| deferred conflict | Non-blocker conflict intentionally carried with owner, disposition, and downstream handling. | postponed issue, parked risk | Strategy Lead | Must include explicit carry target (for this cycle: D11 and/or D12). |

## Collision Resolution Matrix

| Collision ID | Colliding Terms | Canonical Choice | Decision | Status | Closure Evidence |
|---|---|---|---|---|---|
| T-001 | corpus / knowledge base / reference base | corpus | Preserve `corpus` as canonical; legacy labels allowed only in parenthetical clarifications. | resolved | Tier-1 table row `corpus`; conflict register entry `C-003`. |
| T-002 | source area / repository slice / input surface | source area | Normalize all four locked-input references to `source area`. | resolved | Tier-1 table row `source area`. |
| T-003 | normative claim / narrative statement | normative claim | Reserve `normative claim` for truth-bearing statements requiring evidence or assumption labeling. | resolved | Tier-1 table row `normative claim`; D10/D12 alignment rule. |
| T-004 | taxonomy axis / taxonomy category family | taxonomy axis | Use `taxonomy axis` only for the five canonical P2 crosswalk dimensions. | resolved | Tier-1 table row `taxonomy axis`; `taxonomy-crosswalk.md`. |

## Usage Rules

1. Tier-1 terms are normative and must be used verbatim in D01-D12.
2. Synonyms from the collision matrix are allowed only in parentheses when preserving source wording.
3. New Tier-1 terms require updates here and must be mirrored in D03.
4. Any unresolved terminology collision must appear in `conflict-register.md` with owner and disposition.

## Downstream Synchronization Requirements

1. D03 glossary must reproduce Tier-1 definitions exactly.
2. D10 metrics language must use `normative claim`, `evidence ID`, and `quality gate` exactly.
3. D12 traceability annex must use `source area`, `source artifact`, and `traceability link` exactly.

## Validation Checklist

1. Every Tier-1 term has one canonical meaning and one owner.
2. Collision matrix has no `open` entries.
3. Conflict register has no terminology conflict left `open` at P2 exit.
4. D03 reproduction requirement is explicitly recorded.
