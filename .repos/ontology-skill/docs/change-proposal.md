# Change Proposal: PDF-Sourced Enhancements to Ontology Skills

**Date**: 2026-02-09
**Status**: Pending Review
**Sources**: Three academic texts mined for guidance:
- **[BFO]** — *Building Ontologies with Basic Formal Ontology* (Arp, Smith, Spear)
- **[K&M]** — *Ontology Engineering* (Kendall & McGuinness)
- **[KG]** — *Knowledge Graphs* (Hogan et al.)

**Extraction files**:
- `docs/bfo_extraction.md`
- `docs/kendall_mcguinness_extraction.md`
- `docs/knowledge_graphs_extraction.md`

---

## Overview

Cross-referencing the three PDF extractions against all 15 existing skill and
shared reference files identified **34 specific enhancements**: 6 HIGH, 17
MEDIUM, 11 LOW priority. This document specifies each change with enough
precision for implementation and review.

### Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| HIGH | 6 | Critical gaps — missing content that could cause downstream failures |
| MEDIUM | 17 | Significant enrichments — missing dimensions, categories, or guidance |
| LOW | 11 | Nice-to-have — additional detail, warnings, or reference material |

### Files Impacted

| File | H | M | L | Total |
|------|---|---|---|-------|
| `skills/ontology-requirements/SKILL.md` | 3 | 0 | 0 | 3 |
| `skills/_shared/naming-conventions.md` | 0 | 4 | 1 | 5 |
| `skills/_shared/bfo-categories.md` | 0 | 2 | 2 | 4 |
| `skills/ontology-architect/SKILL.md` | 0 | 3 | 0 | 3 |
| `skills/ontology-conceptualizer/SKILL.md` | 0 | 2 | 1 | 3 |
| `skills/ontology-scout/SKILL.md` | 1 | 1 | 1 | 3 |
| `skills/sparql-expert/SKILL.md` | 0 | 0 | 3 | 3 |
| `skills/_shared/quality-checklist.md` | 1 | 0 | 0 | 1 |
| `skills/ontology-validator/SKILL.md` | 1 | 1 | 0 | 2 |
| `skills/_shared/axiom-patterns.md` | 0 | 1 | 1 | 2 |
| `skills/_shared/anti-patterns.md` | 0 | 1 | 0 | 1 |
| `skills/_shared/methodology-backbone.md` | 0 | 1 | 0 | 1 |
| `skills/ontology-curator/SKILL.md` | 0 | 1 | 0 | 1 |
| `skills/ontology-mapper/SKILL.md` | 0 | 0 | 1 | 1 |
| `skills/_shared/tool-decision-tree.md` | 0 | 0 | 1 | 1 |

---

## HIGH Priority Changes

### H1. requirements SKILL.md — Add Use Case Template

**File**: `skills/ontology-requirements/SKILL.md`
**Location**: New section between Step 1 (Domain Scoping) and Step 2 (CQ Elicitation)
**Source**: [K&M] section 7.3 phases 5-6, Rules R-REQ-1 through R-REQ-5

**Current state**: The skill jumps from domain scoping directly to CQ
elicitation with no structured use case capture.

**Change**: Add a new **Step 1.5: Use Case Development** section containing:
- A use case template with fields: Name, Actor, Goal, Preconditions,
  Main Flow, Postconditions, Related CQs, Priority
- Guidance that use cases drive CQ discovery (each use case should
  generate 3-10 CQs)
- Example use case with derived CQs
- Note that use cases are living documents refined through stakeholder
  iteration

**Rationale**: K&M identifies use case development as a distinct phase that
bridges business requirements and formal CQ specification. Without use cases,
CQs risk being ad hoc rather than systematically derived from real scenarios.

---

### H2. requirements SKILL.md — Strengthen CQ Specification

**File**: `skills/ontology-requirements/SKILL.md`
**Location**: Step 3 (CQ Refinement) — expand the existing refinement criteria
**Source**: [K&M] Rules R-CQ-1 through R-CQ-5

**Current state**: CQ refinement checks for atomicity, answerability, and
non-redundancy. The CQ template has: ID, text, expected answer type, source,
priority, SPARQL sketch.

**Change**: Enhance CQ specification to include:
- **Sample answer**: Every CQ must have at least one concrete sample answer
  demonstrating what a correct response looks like (K&M R-CQ-3)
- **Derivation method**: Whether the answer comes from (a) direct lookup,
  (b) inference/reasoning, (c) aggregation, or (d) external data join
  (K&M R-CQ-4)
- **Scope boundary**: Each CQ should state what is explicitly OUT of scope
  to prevent scope creep (K&M R-CQ-5)

Update the CQ YAML template to add `sample_answer`, `derivation_method`,
and `out_of_scope` fields.

**Rationale**: Without sample answers, it is impossible to verify whether a
SPARQL formalization actually answers the intended question. Without derivation
methods, the architect cannot determine what reasoning capabilities are needed.

---

### H3. requirements SKILL.md — Add Traceability Matrix

**File**: `skills/ontology-requirements/SKILL.md`
**Location**: New section after Step 7 (Test Suite Generation)
**Source**: [K&M] section 7.3, ORSD pattern

**Current state**: CQs are prioritized and formalized as SPARQL, but there is
no explicit traceability from stakeholder needs → use cases → CQs → axioms →
tests.

**Change**: Add a new **Step 8: Traceability Matrix** section containing:
- A traceability matrix template mapping: Stakeholder Need → Use Case →
  CQ ID → Ontology Term(s) → SPARQL Test
- Guidance that every stakeholder need must trace to at least one CQ, and
  every CQ must trace to at least one test
- The matrix should be maintained as `docs/{name}/traceability-matrix.csv` and
  updated as work proceeds through later skills
- Add the traceability matrix to the Outputs table and Handoff checklist

**Rationale**: Traceability is a core quality assurance mechanism. Without it,
requirements can be silently dropped during conceptualization or formalization.

---

### H4. ontology-validator SKILL.md — Add Consistency vs. Validity Distinction

**File**: `skills/ontology-validator/SKILL.md`
**Location**: New explanatory section before Step 1, or as an expanded
introduction to the workflow
**Source**: [KG] sections on OWA vs CWA, consistency vs validity

**Current state**: The validator runs reasoner checks (Level 1) and SHACL
checks (Level 4) but does not explain WHY both are needed or what each catches
that the other cannot.

**Change**: Add a **"Consistency vs. Validity"** explanatory section covering:
- **OWL reasoning** operates under the Open World Assumption (OWA):
  missing data is unknown, not false. It checks *consistency* (no
  contradiction) but cannot detect *incompleteness*.
- **SHACL validation** operates under the Closed World Assumption (CWA):
  missing data is a violation. It checks *validity* (structural
  conformance) but not logical entailment.
- Both are needed: a consistent ontology can have incomplete data; a
  valid-per-SHACL ontology can still be logically inconsistent.
- Table showing what each catches:

  | Check Type | Catches | Misses |
  |-----------|---------|--------|
  | OWL Reasoner | Unsatisfiable classes, logical contradictions | Missing labels, incomplete data |
  | SHACL | Missing required properties, cardinality violations, datatype errors | Logical inconsistencies between axioms |

**Rationale**: This is the single most important conceptual distinction in
ontology validation. Without it, users may rely solely on reasoning (missing
data quality issues) or solely on SHACL (missing logical errors).

---

### H5. quality-checklist.md — Expand to Four-Cluster Quality Framework

**File**: `skills/_shared/quality-checklist.md`
**Location**: Add three new sections after the existing checks
**Source**: [KG] quality framework, [K&M] evaluation dimensions

**Current state**: 10 checks covering mostly the Coherency cluster (reasoner,
SHACL, CQ tests, ROBOT report). Approximately 40% of quality dimensions are
covered.

**Change**: Add three new sections to the checklist:

1. **Accuracy Checks** (new section):
   - Syntactic accuracy: SHACL `sh:datatype` constraints on all data
     properties
   - Semantic accuracy: Cross-reference definitions against authoritative
     domain sources
   - Timeliness: Verify `dcterms:modified` on ontology header; flag if
     older than release cycle

2. **Coverage Checks** (new section):
   - Schema completeness: SPARQL query for classes without definitions
   - Property completeness: SPARQL query for properties without
     domain/range
   - Population completeness: For populated ontologies, check
     representative coverage
   - Representativeness: Distribution analysis for bias detection

3. **Succinctness Checks** (new section):
   - Intensional conciseness: Detect redundant SubClassOf axioms
     (entailed by other axioms)
   - Extensional conciseness: Detect duplicate individuals
   - Representational conciseness: Audit for unused classes/properties

4. **Evaluation Dimensions** (new section, from [K&M]):
   - Expressivity: Is the OWL profile sufficient for domain requirements?
   - Complexity: Is the ontology understandable by target users?
   - Granularity: Is the level of detail appropriate?
   - Epistemological adequacy: Does the ontology reflect domain consensus?

Each new check should include either a SPARQL query, a tool command, or a
qualitative assessment description.

**Rationale**: The current checklist detects only coherency issues. Entire
categories of defects (inaccurate definitions, missing coverage, redundant
modeling) go undetected.

---

### H6. ontology-scout SKILL.md — Complete Reuse Evaluation Criteria

**File**: `skills/ontology-scout/SKILL.md`
**Location**: Step 2 evaluation table (currently 5 criteria)
**Source**: [K&M] 9-point reuse evaluation, [BFO] Principle 5

**Current state**: 5-criterion table: Coverage, Quality, License, Community,
BFO Alignment.

**Change**: Expand to 9 criteria by adding:
- **Syntactic correctness**: Run `robot validate` on the candidate
- **Logical consistency**: Run `robot reason` on the candidate
- **Modularization**: Assess whether modules can be imported independently
- **Metadata completeness**: Run `robot report` to check annotation
  coverage

Also add:
- A sub-step for running representative CQs against the candidate
  (can it answer at least some of our questions?)
- A note from [BFO] Principle 5: even non-reusable ontologies should be
  used as benchmarks for comparison

Add tool commands for the new checks.

**Rationale**: Importing an ontology that is syntactically broken, logically
inconsistent, or poorly documented creates downstream failures that are hard
to trace back to the import decision.

---

## MEDIUM Priority Changes

### M1. naming-conventions.md — Add IRI Governance Section

**File**: `skills/_shared/naming-conventions.md`
**Location**: New section after "ID Minting" (currently line ~30)
**Source**: [K&M] IRI best practices, [KG] PID guidance

**Change**: Add an **"IRI Governance"** section covering:
- K&M IRI structure for entity IRIs: `https://<authority>/<domain>/<module>/<name>`
- Five best practices: availability, understandability, simplicity,
  persistence, manageability
- Published entity IRIs never change (R-NAME-1)
- Entity IRI vs. document IRI distinction
- Versioning rule: keep entity IRIs stable and version ontology documents
  using `owl:versionIRI`
- PURL services for persistence
- Blank node minimization / skolemization guidance

---

### M2. naming-conventions.md — Add Full Vocabulary Entry Template

**File**: `skills/_shared/naming-conventions.md`
**Location**: New section after "Definitions" (currently line ~85)
**Source**: [K&M] section 4.3, 19-field vocabulary entry

**Change**: Add a **"Full Vocabulary Entry (Extended)"** section:
- Mark existing 3-property set (`rdfs:label`, `skos:definition`,
  `dcterms:source`) as "Minimum Required"
- Add extended set as "Recommended for Production Ontologies" including:
  `abbreviation`, `explanatoryNote`, `usageNote`, `dependsOn`,
  `termOrigin`, `definitionOrigin`, `adaptedFrom`, `conceptStatus`,
  `conceptStatusDate`, `steward`
- Include annotation property IRIs for each field

---

### M3. naming-conventions.md — Add Property Naming Anti-Pattern

**File**: `skills/_shared/naming-conventions.md`
**Location**: Under "Property Names" section
**Source**: [K&M] Rule R-NAME-3, Pitfall P-8

**Change**: Add a **"Property Naming Anti-Patterns"** sub-section:
- Anti-pattern: Encoding domain/range in property name
  (`plantHasBloomColor` → `hasColor`)
- Why it's wrong: Limits reusability across contexts
- Before/after example

---

### M4. naming-conventions.md — Add Mass Noun Handling

**File**: `skills/_shared/naming-conventions.md`
**Location**: Under "Class Names" section
**Source**: [BFO] Terminology Principle 11

**Change**: Add a **"Mass Nouns"** sub-section:
- Rule: Transform mass nouns to count nouns using "portion of" prefix
- Examples: "portion of blood", "portion of tissue", "portion of water"
- Why: OWL classes represent universals; mass nouns don't denote
  countable instances

---

### M5. bfo-categories.md — Add Temporal Indexing Rules

**File**: `skills/_shared/bfo-categories.md`
**Location**: New section after "Key BFO Relations" (currently line ~115)
**Source**: [BFO] sections 4.3–4.4

**Change**: Add a **"Temporal Indexing Rules"** section:
- Continuant-continuant relations MUST be temporally indexed (they can
  change: a cell that is part_of an organ at t1 may not be at t2)
- Occurrent-occurrent relations need NOT be temporally indexed (they are
  fixed once the process occurs)
- Add `located_in` vs `part_of` clarification to Common Mistakes table
- Add verbal form of universal-level relation quantification patterns

---

### M6. bfo-categories.md — Add Perspectivalism and OBO Alignment

**File**: `skills/_shared/bfo-categories.md`
**Location**: New sections before "Quick Reference"
**Source**: [BFO] sections 3.4–3.5

**Change**: Add two sections:
1. **"Perspectives"**: Continuant perspective = anatomy/structure;
   Occurrent perspective = physiology/process. Same entity can be
   studied from both perspectives.
2. **"BFO-OBO Alignment Matrix"**: Table mapping granularity levels ×
   BFO categories → specific OBO Foundry ontologies (e.g., Cell
   Ontology for material entities at cellular granularity)

---

### M7. anti-patterns.md — Add 6 Missing Anti-Patterns

**File**: `skills/_shared/anti-patterns.md`
**Location**: After anti-pattern #10
**Source**: [BFO] terminology/structural anti-patterns, [K&M] Pitfalls P-3
through P-9

**Change**: Add anti-patterns #11–#16 using the existing template format
(Description, Example, Why Wrong, Fix, Detection):

| # | Name | Source |
|---|------|--------|
| 11 | Individuals in the T-box | [BFO] |
| 12 | Negative Universals / Class Complements | [BFO] |
| 13 | False is-a from OO Inheritance | [K&M] P-5 |
| 14 | System Blueprint Instead of Domain Model | [K&M] P-3 |
| 15 | Technical Perspective Over Domain | [K&M] P-4 |
| 16 | Mixing Individuals with Classes | [K&M] P-9 |

---

### M8. axiom-patterns.md — Add 4 Missing Patterns + Design Decision

**File**: `skills/_shared/axiom-patterns.md`
**Location**: After pattern #12
**Source**: [KG] OWL feature catalog

**Change**:
1. Add patterns #13–#16:
   - **#13 Negation** (`owl:NegativePropertyAssertion`): Use sparingly,
     only when OWA absence could be misinterpreted
   - **#14 Identity Links** (`owl:sameAs`/`owl:differentFrom`): Include
     critical transitivity cascade warning
   - **#15 Enumeration** (`owl:oneOf`): For closed sets of named
     individuals
   - **#16 Complement** (`owl:complementOf`): Use sparingly, usually
     indicates modeling issue

2. Add a **"SubClassOf vs. EquivalentClass"** design decision callout to
   pattern #4, explaining when to use necessary conditions (SubClassOf)
   vs. necessary-and-sufficient conditions (EquivalentClass)

---

### M9. ontology-architect SKILL.md — Expand OWL Profile Guidance

**File**: `skills/ontology-architect/SKILL.md`
**Location**: Step 1 (currently a brief 4-row profile table)
**Source**: [KG] DL profiles and reasoning strategies

**Change**: Expand Step 1 to include:
- Brief explanation of the undecidability problem (full OWL 2 is
  undecidable; profiles guarantee decidability)
- Three reasoning strategies: (a) incomplete-but-sound, (b) complete-but-
  restricted (profiles), (c) complete-but-may-not-halt
- Concrete feature support/exclusion per profile:
  - EL: lacks negation, universals, cardinality
  - QL: lacks most class constructors
  - RL: lacks existentials on right side of SubClassOf
- Reasoner mapping: ELK → EL; HermiT/Pellet → full DL

---

### M10. ontology-architect SKILL.md — Expand Metadata Requirements

**File**: `skills/ontology-architect/SKILL.md`
**Location**: Step 2 (ontology header template)
**Source**: [K&M] section 5.9, Rule R-MOD-15

**Change**:
- Expand header template to include Dublin Core Terms metadata:
  `dcterms:creator`, `dcterms:created`, `dcterms:rights`,
  `dcterms:license`
- Optionally include PROV-O provenance properties (`prov:wasAttributedTo`,
  `prov:generatedAtTime`) when provenance capture is required
- Add a **"Metadata Consistency"** rule: all elements must use the same
  annotation property set (R-MOD-15)
- Cross-reference the full vocabulary entry template in
  `naming-conventions.md`

---

### M11. ontology-architect SKILL.md — Add Individual Management

**File**: `skills/ontology-architect/SKILL.md`
**Location**: New step between Step 5 and Step 6 (or renumber)
**Source**: [K&M] Rules R-MOD-12 through R-MOD-14

**Change**: Add a new **"Step 5.5: Individual Management"** section:
- Reference individuals (enumerated codes, country codes) are A-box content
  and should live in a dedicated reference-individual module
- Test individuals go in a separate test ontology file
- Production individuals belong in a knowledge graph, not the ontology
- Rule: if more than ~50 individuals, split to a separate file

---

### M12. ontology-conceptualizer SKILL.md — Add Modularization Strategy

**File**: `skills/ontology-conceptualizer/SKILL.md`
**Location**: New sub-section in Step 2 (Taxonomy Design)
**Source**: [K&M] Rules R-MOD-1 through R-MOD-6

**Change**: Add a **"Modularization Rules"** sub-section:
- Start with 20–30 terms from highest-priority CQs
- Limit each module to 100–150 concepts
- Seed ontology pattern: import Dublin Core, SKOS, PROV-O
- Separation criteria: behavioral/functional/structural,
  as-designed/as-built/as-configured/as-maintained
- Update Outputs table: conceptual model should include module boundaries

---

### M13. ontology-conceptualizer SKILL.md — Add Architecture Layers

**File**: `skills/ontology-conceptualizer/SKILL.md`
**Location**: New section between Steps 2 and 3
**Source**: [K&M] section 2.6

**Change**: Add an **"Architecture Layering"** section:
1. Foundational (metadata, provenance ontologies)
2. Domain-independent (dates, geo, units)
3. Domain-dependent (domain standards)
4. Problem-specific (project ontology)

Require the conceptual model to assign each module to a layer.

---

### M14. ontology-curator SKILL.md — Add FAIR Assessment

**File**: `skills/ontology-curator/SKILL.md`
**Location**: New step between Step 5 (Version Update) and Step 6 (Generate Diff)
**Source**: [KG] FAIR principles checklist

**Change**: Add a **"Step 5.5: FAIR Assessment"** section:
- Table of 15 FAIR sub-principles with specific ontology actions and
  tool/vocabulary mappings
- Add a **"Release Publishing"** sub-section covering: content
  negotiation, registration in ontology repositories (OBO Foundry,
  BioPortal, OLS), diff publishing between versions

---

### M15. ontology-scout SKILL.md — Add Always-Reuse Baseline

**File**: `skills/ontology-scout/SKILL.md`
**Location**: New section at the start of the workflow (before Step 1)
**Source**: [K&M] section 2.4

**Change**: Add an **"Always-Reuse Baseline"** section listing ontologies that
should be imported in virtually every project:
- Dublin Core Terms (dcterms)
- SKOS
- W3C PROV-O
- FOAF or schema.org (for people/organizations)

Brief rationale for each. This baseline is checked before any domain-specific
search begins.

---

### M16. methodology-backbone.md — Add K&M 9-Phase Lifecycle

**File**: `skills/_shared/methodology-backbone.md`
**Location**: Add K&M as fourth methodology source in "Methodology Foundations"
**Source**: [K&M] section 7.3

**Change**:
- Add K&M as a fourth methodology source alongside METHONTOLOGY, NeOn,
  and CQ-Driven
- Add a mapping table showing how K&M's 9 phases correspond to the
  existing 7 phases:

  | K&M Phase | Maps To |
  |-----------|---------|
  | 1. Preparatory | Phase 1: Specification |
  | 2. Initial term excerption | Phase 2: Knowledge Acquisition |
  | 3. Business architecture | Phase 3: Conceptualization |
  | 4. Subsequent term excerption | Phase 2 (continued) |
  | 5. Use case development | Phase 1 (continued) |
  | 6. Term curation | Phase 3: Conceptualization |
  | 7. Ontology development | Phase 4: Formalization |
  | 8. Review | Phase 5: Evaluation |
  | 9. Deployment | Phase 7: Maintenance |

---

### M17. ontology-validator SKILL.md — Add Evaluation Dimensions

**File**: `skills/ontology-validator/SKILL.md`
**Location**: New Level 6 step in the workflow
**Source**: [K&M] sections 6.2–6.5

**Change**: Add a **"Level 6: Evaluation Dimensions"** step covering
qualitative assessments:
- Semantic: expressivity, complexity, granularity, epistemological adequacy
- Functional: relevance, rigor, automation support
- Model-centric: authoritativeness, structure, formality

These are documented in the validation report as qualitative notes, not
automated checks.

---

## LOW Priority Changes

### L1. bfo-categories.md — Add History Entity

**File**: `skills/_shared/bfo-categories.md`
**Source**: [BFO] section 3.3

**Change**: Add "History" as a leaf in the Occurrent Decision Tree. Definition:
the sum of all processes within/involving a material entity over its entire
existence, with a one-to-one correspondence to its bearer.

---

### L2. bfo-categories.md — Add GDC Concretization Pattern

**File**: `skills/_shared/bfo-categories.md`
**Source**: [BFO] GDC concretization

**Change**: Add a brief **"GDC Concretization Pattern"** note under the GDC
entry explaining that a GDC is concretized in a specifically dependent
continuant which inheres in a material entity, and the `isConcretizationOf`
relation.

---

### L3. axiom-patterns.md — Add Closure Axiom Worked Example

**File**: `skills/_shared/axiom-patterns.md`
**Source**: [KG] vacuous truth of universal restrictions

**Change**: Add a complete closure axiom example to pattern #3 (Universal
Restriction) showing the existential + universal combination:
```
VegetarianPizza SubClassOf hasTopping some VegetableTopping
VegetarianPizza SubClassOf hasTopping only VegetableTopping
```

---

### L4. sparql-expert SKILL.md — Add Property Path Reference

**File**: `skills/sparql-expert/SKILL.md`
**Source**: [KG] SPARQL property paths

**Change**: Add a **"Property Path Reference"** section with syntax table
(Kleene star `*`, one-or-more `+`, disjunction `|`, inverse `^`,
concatenation `/`), common patterns, and cycle/performance warning.

---

### L5. sparql-expert SKILL.md — Add Homomorphism Awareness

**File**: `skills/sparql-expert/SKILL.md`
**Source**: [KG] SPARQL semantics

**Change**: Add a note under anti-patterns about SPARQL's homomorphism-based
semantics (two variables can bind to the same node). Recommend
`FILTER(?x != ?y)` when distinct bindings are needed.

---

### L6. sparql-expert SKILL.md — Add Entailment Regime Awareness

**File**: `skills/sparql-expert/SKILL.md`
**Source**: [KG] entailment regimes

**Change**: Add a note explaining that queries against raw files see only
asserted triples unless reasoning is applied first, while endpoints may have
materialized inferred triples. This matters for CQ test interpretation.

---

### L7. ontology-mapper SKILL.md — Add owl:sameAs Warning

**File**: `skills/ontology-mapper/SKILL.md`
**Source**: [KG] identity links

**Change**: Add a warning about `owl:sameAs` transitivity cascading in Step 4
(predicate selection) and in bridge ontology generation. One incorrect link
can merge unintended entities across graphs.

---

### L8. tool-decision-tree.md — Add Reasoner Selection

**File**: `skills/_shared/tool-decision-tree.md`
**Source**: [KG] reasoner guidance

**Change**: Add a **"Reasoner Selection"** sub-section under ROBOT CLI:
- ELK: Fast, EL profile only
- HermiT: Complete, full DL, slower
- Pellet/Openllet: Full DL, good explanations

Guidance on when to use each.

---

### L9. ontology-conceptualizer SKILL.md — Add Property Categorization

**File**: `skills/ontology-conceptualizer/SKILL.md`
**Source**: [K&M] section 5.6

**Change**: Add a **"Property Categories"** reference table to Step 4:
intrinsic, extrinsic, meronymic, spatio-temporal, object properties, data
properties. With examples and OWL construct guidance for each.

---

### L10. naming-conventions.md — Add Label Community Context

**File**: `skills/_shared/naming-conventions.md`
**Source**: [K&M] Rules R-LABEL-3, R-LABEL-5

**Change**: Add a note under "Synonyms" recommending community context
annotations (`prefLabelContext`/`altLabelContext`) for alternate labels in
production ontologies.

---

### L11. ontology-scout SKILL.md — Add Extended Repository List

**File**: `skills/ontology-scout/SKILL.md`
**Source**: [K&M] section 2.3

**Change**: Add additional repositories to the search registries: OMG
specifications, COLORE, Schema.org, IBC Agroportal, Google Dataset Search.

---

## Recommended Implementation Order

1. **ontology-requirements SKILL.md** (H1, H2, H3) — Requirements flow
   downstream to all other skills; fix these first.
2. **quality-checklist.md** (H5) — Expand quality framework, including the
   timeliness check in the Accuracy section.
3. **ontology-validator SKILL.md** (H4, M17) — Add consistency/validity
   distinction and evaluation dimensions together.
4. **ontology-scout SKILL.md** (H6, M15, L11) — Complete evaluation
   criteria, add baseline and repositories together.
5. **naming-conventions.md** (M1–M4, L10) — Batch all naming convention
   updates.
6. **bfo-categories.md** (M5, M6, L1, L2) — Batch all BFO reference
   updates.
7. **anti-patterns.md** (M7) — Add 6 new anti-patterns.
8. **axiom-patterns.md** (M8, L3) — Add 4 new patterns + closure example.
9. **ontology-architect SKILL.md** (M9, M10, M11) — Profile guidance,
   metadata, individual management.
10. **ontology-conceptualizer SKILL.md** (M12, M13, L9) — Modularization,
    layers, property categories.
11. **ontology-curator SKILL.md** (M14) — FAIR assessment.
12. **methodology-backbone.md** (M16) — Add K&M lifecycle mapping.
13. **sparql-expert SKILL.md** (L4, L5, L6) — Batch all SPARQL
    enhancements.
14. **ontology-mapper SKILL.md** (L7) — sameAs warning.
15. **tool-decision-tree.md** (L8) — Reasoner selection.

---

## Review Checklist

After implementation, verify:
- [ ] Every change references its source book(s) appropriately
- [ ] No content is duplicated between `_shared/` files and SKILL.md files
- [ ] New sections follow existing formatting conventions in each file
- [ ] Handoff artifacts remain consistent (outputs of skill N match inputs
      of skill N+1)
- [ ] Cross-references between files resolve correctly
- [ ] Anti-patterns use the standard template (Description, Example, Why
      Wrong, Fix, Detection)
- [ ] New SPARQL queries in quality-checklist.md are syntactically valid
- [ ] File line counts remain reasonable (no single file exceeds ~400 lines)
- [ ] `namespaces.json` is updated if any new prefixes are introduced
- [ ] Quality gates still pass: `uv run ruff check .` and `uv run ruff format --check .`
