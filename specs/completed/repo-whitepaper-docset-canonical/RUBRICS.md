# repo-whitepaper-docset-canonical — Rubrics

## Purpose

Pass/fail rubrics for each phase and cross-cutting lock integrity. A phase cannot exit until every dimension in its rubric passes.

---

## Cross-Cutting Lock Integrity (All Phases)

| Dimension | Pass | Fail |
|---|---|---|
| Locked source boundaries | Only approved source areas are used for normative claims | Unapproved source used without assumption labeling |
| Document count lock | Corpus remains exactly `X = 12` documents | Missing or extra documents in official corpus |
| Evidence linkage | Normative claims have evidence IDs and traceability links | Any normative claim lacks evidence link |
| Topic ownership | Each major topic has one primary document owner | Shared primary ownership causing overlap |
| Contradiction handling | Conflicts resolved or logged with owner and disposition | Silent contradiction remains |

---

## P0 Rubric — Spec Bootstrap and Governance Freeze

| Dimension | Pass | Fail |
|---|---|---|
| Canonical files | All required top-level files exist and are populated | Missing or placeholder-only canonical file |
| ADR locks | ADR-01 through ADR-05 defined and explicit | Missing or ambiguous locked decisions |
| Interface contracts | All four artifact contracts defined with fields and enums | Any contract incomplete |
| Handoff readiness | `handoffs/HANDOFF_P0.md` exists and points to P1 entry files | Missing or incomplete handoff |

## P1 Rubric — Corpus Inventory and Fact Harvest

| Dimension | Pass | Fail |
|---|---|---|
| Source indexing | All four source areas fully enumerated | Any source area partially indexed |
| Fact schema validity | `fact-ledger.json` entries conform to `CorpusFact` contract | Invalid fields or enum values |
| Evidence ID coverage | Every harvested claim has evidence reference | Missing evidence IDs |
| Baseline coverage metrics | Coverage baseline reports source-area totals and harvested counts | Missing metrics or ambiguous counts |

## P2 Rubric — Taxonomy and Concept Normalization

| Dimension | Pass | Fail |
|---|---|---|
| Term model completeness | Tier-1 terms defined with canonical meaning | Missing or duplicate term definitions |
| Taxonomy crosswalk quality | Crosswalk maps competing taxonomies with rationale | Mapping gaps or unjustified merges |
| Conflict register quality | Each conflict has owner, status, and resolution path | Conflict entries missing metadata |
| Tier-1 conflict closure | No unresolved blocker-level concept conflicts | Blocker conflicts unresolved |

## P3 Rubric — Document Blueprint and Allocation

| Dimension | Pass | Fail |
|---|---|---|
| Blueprint completeness | D01-D12 blueprints defined with purpose/scope/outline/checks | Any blueprint incomplete |
| Manifest validity | `outputs/manifest.json` parses and conforms to `DocDescriptor` | Parse errors or missing fields |
| Ownership exclusivity | Topic-to-primary-doc mapping is one-to-one | Topic overlap among primaries |
| Sequencing readiness | Drafting sequence and dependencies are explicit and feasible | Missing sequencing logic |

## P4 Rubric — Drafting Wave A (D01-D08)

| Dimension | Pass | Fail |
|---|---|---|
| Scope coverage | D01-D08 satisfy required scope and outline | Missing required sections |
| Evidence linkage | Normative claims in D01-D08 have evidence references | Unlinked claims |
| Internal consistency | Terminology and claims align with term model and crosswalk | Contradictions with P2 artifacts |
| Completion checks | Manifest completion checks for D01-D08 all pass | Any completion check failing |

## P5 Rubric — Drafting Wave B (D09-D12)

| Dimension | Pass | Fail |
|---|---|---|
| Scope coverage | D09-D12 satisfy required scope and outline | Missing required sections |
| Operations quality | D09 includes actionable runbook-level control guidance | High-level-only operational content |
| Metrics rigor | D10 includes explicit formulas and evidence routes | Metrics without formulas or evidence mapping |
| Governance quality | D11 assigns owners, deadlines, and triggers for open decisions | Open decisions missing ownership metadata |
| Traceability quality | D12 provides full matrix and claim ledger linkage | Incomplete or partial traceability annex |

## P6 Rubric — Consistency, Quality, and Completeness Gates

| Dimension | Pass | Fail |
|---|---|---|
| Consistency sweep | Pairwise contradiction scan completed with no blockers | Unresolved blocker contradictions |
| Completeness audit | All D01-D12 completion checks pass | One or more checks failing |
| Traceability audit | 100% normative claims have `TraceabilityLink` entries | Missing traceability entries |
| Quality gate ledger | `quality-gates.json` contains gate outcomes for P0-P6 | Missing or invalid gate outcomes |
| Readability compliance | Documents are human-readable and follow outline structure | Unstructured or non-readable outputs |

## P7 Rubric — Publication Handoff and Starter Kit

| Dimension | Pass | Fail |
|---|---|---|
| Starter kit completeness | `whitepaper-starter-kit.md` includes personas, reading paths, and section mapping | Missing starter kit sections |
| Handoff package | `HANDOFF_P7.md` includes final acceptance state and usage protocol | Missing handoff requirements |
| Draftability test | New writer can produce viable white-paper outline using corpus only | Outline requires additional corpus discovery |
| Final manifest integrity | Final `manifest.json` reflects delivered corpus state | Manifest out of sync with delivered docs |

---

## Required Test Scenarios

1. Coverage scenario: all source areas represented in traceability matrix.
2. Duplication scenario: no major topic has two primary documents.
3. Contradiction scenario: intentionally conflicting claim gets logged in conflict register.
4. Traceability scenario: random sample of 20 claims all resolve to evidence IDs.
5. Usability scenario: persona-based drafting pathway produces sectioned outline.

## Promotion Rule

A phase is promotable only when:

1. Phase-specific rubric dimensions all pass.
2. Cross-cutting lock integrity dimensions all pass.
3. Next-phase handoff exists and references exact entry artifacts.

## Blocking Conditions

1. Any blocker contradiction unresolved.
2. Any missing normative evidence linkage.
3. Any manifest or gate JSON contract invalid.
4. Any source area left unrepresented at phase completion.
