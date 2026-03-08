# Validation Report: Energy News Ontology

Date: 2026-02-12
Ontology: `ontologies/energy-news/energy-news.ttl`
Version: 0.2.0-dev (URL-Publication Linking + Multi-Platform Extension)
Validator: ontology-validator skill (Phase 6)
Prior report: 2026-02-11 (v0.1.0)

## Summary

- **Overall: PASS**
- Blocking issues: 0 (B-001 resolved)
- Warnings: 1 (W-002 accepted by design)
- Observations: 4

## Level 1: Logical Consistency

- **Status: PASS**
- Reasoner: HermiT (OWL 2 DL, complete)
- TBox only: **CONSISTENT** (0 unsatisfiable classes)
- TBox + reference individuals: **CONSISTENT**
- TBox + ABox data: **CONSISTENT**
- Command: `.local/bin/robot reason --reasoner HermiT`

### Resolved: B-001 (datatype range mismatch)

Previously, `description` declared `rdfs:range xsd:string` but the build
script created `Literal(desc, lang="en")` producing `rdf:langString`. In
OWL 2, these are disjoint datatypes — HermiT correctly flagged
inconsistency. **Fixed** by removing `lang="en"` from description literals
in the build script (Option B), keeping them as plain `xsd:string`.

## Level 2: ROBOT Report

- **Status: PASS**
- Profile: default + custom (`ontologies/energy-news/robot-report-profile.txt`)
- Full merge (default profile): **0 ERRORs**, 29 WARNs, 3 INFOs
- TBox + ref individuals (custom profile): **0 violations**

### Default Profile Violations (full merge)

| Level | Rule | Count | Notes |
|-------|------|-------|-------|
| ERROR | — | 0 | All resolved |
| WARN | equivalent_pair | 3 | Intentional schema.org/SIOC alignments |
| WARN | missing_definition (IAO) | 23 | Project uses `skos:definition`, not `IAO:0000115` |
| WARN | missing_definition (BFO stubs) | 3 | BFO MIREOT stubs (expected) |
| INFO | missing_superclass | 3 | BFO MIREOT stubs (expected) |

### Resolved: W-001 (missing labels on ABox individuals)

Previously, 10 sample individuals lacked `rdfs:label`. **Fixed** by adding
labels in the build script: articles use their title, authors use their
handle, posts use "Post by {author} sharing {article}".

### Custom Profile (TBox + ref individuals)

0 violations. The custom profile uses `skos:definition` instead of
`IAO:0000115` and excludes external term stubs from checks.

## Level 3: SHACL Validation

- **Status: PASS**
- Shapes file: `ontologies/energy-news/shapes/energy-news-shapes.ttl`
- Conforms: true
- Violations: 0
- Warnings: 0

Shapes validated:
- `EnergyTopicInstanceShape`: rdfs:label min 1, skos:definition min 1, skos:inScheme min 1
- `ArticleShape`: coversTopic min 1, url exactly 1, publishedBy max 1, title max 1,
  publishedDate max 1, description max 1, **SPARQL constraint (URL domain matches siteDomain)**
- `PostShape`: postedBy exactly 1, sharesArticle max 1
- `AuthorAccountShape`: handle exactly 1
- `PublicationShape`: siteDomain exactly 1

### New: SPARQL Constraint (v0.2.0-dev)

The ArticleShape now includes a `sh:SPARQLConstraint` validating that if an
Article has both `url` and `publishedBy`, the URL domain must match the
Publication's `siteDomain`. This is the first SPARQL-based SHACL constraint
in the shapes graph.

Negative test (`test_shacl_catches_url_domain_mismatch`) confirms the
constraint correctly rejects mismatched articles.

## Level 4: CQ Tests

- **Status: PASS**
- Test runner: pytest (`tests/unit/test_energy_news_ontology.py`)
- Total tests: 99
- Passed: 99
- Failed: 0

### CQ Test Breakdown

| Category | Count | Passed | Notes |
|----------|-------|--------|-------|
| CQ tests (TBox-only: cq-001, cq-002, cq-010) | 3 | 3 | Enumerative + ASK queries |
| CQ tests (ABox-dependent: cq-003 through cq-019) | 16 | 16 | Require sample data |
| TBox structure (tbox-001, tbox-002, tbox-003) | 3 | 3 | Class declaration checks |
| Non-entailment (neg-001, neg-002) | 2 | 2 | Solar not broader Fossil; Nuclear not under Renewable |
| Structural tests (classes, properties, axioms) | 40+ | 40+ | owl:Class, functional, HasKey, alignment, etc. |
| SHACL conformance (positive) | 1 | 1 | pyshacl validate |
| SHACL constraint (negative) | 1 | 1 | URL domain mismatch detection |
| SPARQL CQ tests (rdflib) | 22 | 22 | All manifest queries |

### New in v0.2.0-dev

- **CQ-019**: "Which publication published an article based on its URL domain?"
  — SPARQL derives publication via URL domain extraction and siteDomain join.
  Returns 3 rows (all sample articles match their publications).
- **Negative SHACL test**: Validates that the SPARQL constraint catches
  mismatched URL domains.

## Level 5: Metrics

### Coverage Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Class label coverage | 9/9 = 100% | 100% | PASS |
| Class definition coverage | 9/9 = 100% | >= 80% | PASS |
| Orphan classes | 0 | 0 | PASS |
| Disjointness coverage | 9/9 = 100% | 100% | PASS |
| Singleton hierarchies (domain) | 0 | 0 | PASS |
| Domain/range completeness | 13/14 | 100% | NOTE |
| Naming conventions (classes) | 9/9 CamelCase | 100% | PASS |
| Naming conventions (properties) | 14/14 camelCase | 100% | PASS |
| Class/individual mixing | 0 | 0 | PASS |
| Individuals in TBox | 0 | 0 | PASS |
| CQ test pass rate | 99/99 = 100% | 100% | PASS |
| SHACL conformance | true | true | PASS |

### Domain/Range Note

`onPlatform` intentionally omits `rdfs:domain` to avoid incorrect type
inference on Feed instances (both AuthorAccount and Feed use `onPlatform`,
and they are declared disjoint via AllDisjointClasses). Range is set to
`SocialMediaPlatform`. This is documented in the KGCL change log.

### Ontology Size

| Metric | Value | Change from v0.1.0 |
|--------|-------|--------------------|
| Domain classes | 9 | +1 (SocialMediaPlatform) |
| Object properties | 8 | +1 (onPlatform) |
| Data properties | 6 | — |
| EnergyTopic individuals | 66 | — |
| AllDisjointClasses axioms | 1 (9 classes) | updated |
| AllDifferent axioms | 21 | +1 (platform individuals) |
| HasKey axioms | 3 | updated (AuthorAccount composite) |
| Functional properties | 10 | +1 (onPlatform) |
| TBox triples | 191 | +21 |
| Reference individuals triples | 756 | +16 |
| ABox data triples | 98 | +10 (labels) |
| Total triples (merged) | 1045 | +47 |

## Level 6: Evaluation Dimensions

### Semantic

- **Expressivity**: OWL 2 DL (full). Uses existential restrictions,
  functional properties, HasKey, AllDisjointClasses, equivalentClass,
  equivalentProperty, subPropertyOf. No qualified cardinality, role chains,
  or class complements. ELK-compatible for development; HermiT for release.
- **Complexity**: Low-moderate. 9 classes with clear separation of concerns.
  Multi-platform extension adds one class and one property cleanly.
- **Granularity**: Appropriate for scope. 66 energy topics provide
  fine-grained coverage. 9 core classes capture the article-topic-author
  domain with platform support.
- **Epistemological adequacy**: BFO-aligned categories (GDC for information
  entities, Object for institutional entities, Site for geographic).

### Functional

- **CQ relevance**: All 19 competency questions are answerable. 3 are
  TBox-only, 16 require ABox population. CQ-019 adds URL-based publication
  derivation capability.
- **Rigor**: Every CQ has a formalized SPARQL test. Non-entailment tests
  verify classification boundaries. SHACL SPARQL constraint validates
  cross-property consistency.
- **Automation**: pytest runs 99 tests in < 0.4 seconds. ROBOT pipeline
  (merge + reason + report) runs in ~15 seconds.

### Model-centric

- **Authoritativeness**: Aligned to schema.org (7 classes, 10 properties)
  and SIOC (1 class). Uses SKOS for topic vocabulary.
- **Structural coherence**: Single inheritance in asserted hierarchy. Clean
  TBox/ABox separation. AllDisjointClasses for all 9 domain classes.
  AllDifferent for topic sibling groups and platform individuals.
- **Formality level**: Semi-formal to formal. OWL 2 DL with SHACL structural
  constraints (including SPARQL-based). SKOS vocabulary for controlled terms.

## Level 7: Diff Review

- **Status: APPLICABLE** (changes since v0.1.0)

### Key Changes (v0.1.0 → v0.2.0-dev)

| Area | Change |
|------|--------|
| Classes | +1 (SocialMediaPlatform) |
| Properties | +1 (onPlatform) |
| Individuals | +2 (Bluesky, Twitter) |
| CQs | +3 (CQ-017, CQ-018, CQ-019) |
| SHACL | +1 SPARQL constraint (URL domain validation) |
| Build script | publishedBy now derived from URL domain (was hardcoded) |
| Tests | +14 (85 → 99) |

## Anti-Pattern Detection

All 16 anti-patterns from `_shared/anti-patterns.md` checked:

| # | Anti-Pattern | Status | Notes |
|---|-------------|--------|-------|
| 1 | Singleton hierarchy | PASS | 0 in domain (4 in external stubs — expected) |
| 2 | Role-type confusion | PASS | No role patterns in domain |
| 3 | Process-object confusion | PASS | All classes correctly categorized per BFO |
| 4 | Missing disjointness | PASS | AllDisjointClasses covers all 9 |
| 5 | Circular definition | PASS | No EquivalentTo chains |
| 6 | Quality-as-class | N/A | No quality values in domain |
| 7 | Info-physical conflation | PASS | Article/Post are GDC; Organization/Publication are Objects |
| 8 | Orphan class | PASS | 0 (all have BFO parent) |
| 9 | Polysemy | PASS | No overloaded terms |
| 10 | Domain/range overcommitment | PASS | Appropriate; onPlatform domain omitted by design |
| 11 | Individuals in TBox | PASS | 0 in TBox |
| 12 | Negative universals | PASS | No complement classes |
| 13 | False is-a (OO) | PASS | Domain-grounded hierarchy |
| 14 | System blueprint | PASS | Domain model, not system artifacts |
| 15 | Technical perspective | PASS | CQ-driven design |
| 16 | Class/individual mixing | PASS | 0 found |

## Resolved Issues

### B-001: `description` range vs lang-tagged literals (RESOLVED)

- **Was**: BLOCKING — HermiT inconsistency on merged TBox + ABox
- **Root cause**: `rdfs:range xsd:string` vs `Literal(text, lang="en")` →
  disjoint `rdf:langString` in OWL 2
- **Fix applied**: Removed `lang="en"` from description literals in build
  script (`scripts/build_energy_news.py`)
- **Verified**: HermiT EXIT: 0 on full merged graph

### W-001: ABox sample individuals missing `rdfs:label` (RESOLVED)

- **Was**: WARNING — 10 ROBOT report `missing_label` ERRORs
- **Fix applied**: Added `rdfs:label` to articles (title), authors (handle),
  and posts ("Post by {author} sharing {article}") in build script
- **Verified**: ROBOT report 0 ERRORs on merged graph

## Accepted Warnings

### W-002: `onPlatform` missing `rdfs:domain`

- **Severity**: WARNING (by design)
- **Rationale**: Omitted to avoid incorrect Feed → AuthorAccount inference
  given AllDisjointClasses. Documented in KGCL change log.
- **Status**: Accepted (no action needed)

## Handoff Checklist

- [x] All Level 1-7 checks have been executed
- [x] Validation report generated and accessible
- [x] ROBOT reason (HermiT) run on TBox, TBox+ref, TBox+ABox — all CONSISTENT
- [x] ROBOT report: 0 ERRORs (default profile), 0 violations (custom profile)
- [x] SHACL validation passed (including SPARQL constraint)
- [x] 99 pytest tests pass
- [x] Anti-pattern detection complete (16/16 checked)
- [x] Coverage metrics computed
- [x] Naming convention compliance verified
- [x] All blocking issues resolved
- [x] 1 accepted warning documented
