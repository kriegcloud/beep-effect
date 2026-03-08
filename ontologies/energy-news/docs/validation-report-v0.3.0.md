# Validation Report: Energy News Ontology v0.3.0

Date: 2026-02-26

## Summary

- **Overall: PASS** (with noted findings for follow-up)
- Blocking issues: 0
- Warnings: 60 (pre-existing, non-blocking)
- Findings requiring follow-up: 5

## Level 1: Logical Consistency

- **Status: PASS**
- Reasoner (ELK): PASS — 0 unsatisfiable classes
- Reasoner (HermiT): PASS — full DL classification, 0 unsatisfiable classes, 0 inconsistencies
- Merged modules: TBox + reference-individuals + BFO declarations + schema declarations

## Level 2: ROBOT Quality Report

- **Status: PASS** (0 errors)
- Errors: 0
- Warnings: 60
  - 57 `missing_definition` — all flag `IAO:0000115` absence; we use `skos:definition` (by design)
  - 3 `equivalent_pair` — schema.org alignments (AuthorAccount, Organization, Post) are intentional
- Info: 4 `missing_superclass` — external vocabulary classes (schema.org, sioc) without declared parents

## Level 3: SHACL Validation

- **Status: PASS** (Conforms: True)
- Shapes validated: ArticleShape, AuthorAccountShape, EnergyTopicInstanceShape, FeedShape, PostShape, PublicationShape, SocialMediaPlatformShape
- **Finding S1**: Shapes file not updated for v0.3.0 — no shapes exist for 14 new classes (EnergyProject, EnergyTechnology, PolicyInstrument, etc.)

## Level 4: CQ Test Suite

- **Status: SKIPPED** — no test files in `ontologies/energy-news/tests/`
- **Finding T1**: CQ-driven testing cannot be performed without SPARQL test queries

## Level 5: Coverage Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Label coverage (enews classes) | 23/23 (100%) | 100% | PASS |
| Definition coverage (enews classes) | 23/23 (100%) | >= 80% | PASS |
| Orphan classes (enews) | 0 | 0 | PASS |
| Duplicate labels | 0 | 0 | PASS |
| Unsatisfiable classes | 0 | 0 | PASS |
| SHACL conformance | True | True | PASS |

## Level 6: Anti-Pattern Detection

### AP1: Singleton Hierarchies (2 found)

| Parent | Child | Assessment |
|--------|-------|------------|
| Organization | RegulatoryBody | Acceptable — future subclasses expected (EnergyCompany, GridOperator, Developer) |
| GeographicEntity | GridZone | Acceptable — GridZone is a specialized geographic entity with grid-specific properties |

**Recommendation**: Add sibling subclasses in a future iteration or document these as intentionally lean hierarchies.

### AP3: Process-Object Tension

PowerPlant and RenewableInstallation are modeled as `rdfs:subClassOf enews:EnergyProject`, which is aligned to `BFO:0000015` (Process). In strict BFO terms, physical facilities are Objects (`BFO_0000030`), not Processes.

The current model treats "project" as encompassing both the development activity and the resulting facility, which is common in the energy industry (e.g., "the 500MW solar project" refers to both). This is a **deliberate domain-pragmatic compromise** but should be reviewed in a conceptualizer pass to determine whether separating EnergyProject (Process) from EnergyFacility (Object) would improve modeling precision.

**Recommendation**: Flag for conceptualizer review. Consider splitting into `EnergyProject` (Process) for the development activity and `EnergyFacility` (Object) for the physical asset, linked by a `produces`/`producedBy` property.

### AP10: Domain/Range Overcommitment (2 noted)

| Property | Position | Leaf Class | Risk |
|----------|----------|-----------|------|
| `hasTechnology` | domain | RenewableInstallation | PowerPlant may also need technology type |
| `operatedBy` | domain | GridZone | Other entities (PowerPlant, Pipeline) may be operated |

**Recommendation**: Consider broadening `hasTechnology` domain to `EnergyProject` and `operatedBy` to a union or omitting domain. Low urgency — current domains are correct for the gap analysis scope.

### AP4: Missing Disjointness

- **PASS**: AllDisjointClasses covers 19 top-level classes. Subclasses (RegulatoryBody, GridZone, PowerPlant, RenewableInstallation) inherit parent disjointness.
- AllDifferent declarations cover all SKOS concept sibling groups, organization individuals, geographic individuals, and publication individuals.

### Other Anti-Patterns

- AP2 (Role-Type Confusion): Not detected
- AP5 (Circular Definition): Not detected
- AP9 (Polysemy): Not detected
- AP11 (Individuals in TBox): PASS — individuals correctly separated in reference-individuals module
- AP16 (Class/Individual Mixing): Not detected

## Level 7: Diff Review (v0.2.0 -> v0.3.0)

### Changes Summary

| Component | Added | Modified | Removed |
|-----------|-------|----------|---------|
| OWL classes | +14 | 0 | 0 |
| Object properties | +10 | 0 | 0 |
| Datatype properties | +6 | 0 | 0 |
| SKOS top-level concepts | +5 | 1 (DataCenterDemand reparented) | 0 |
| SKOS leaf concepts | +21 | 0 | 0 |
| Organization individuals | +15 | 0 | 0 |
| Geographic individuals | +10 | 0 | 0 |
| Publication individuals | +10 | 0 | 0 |
| BFO stubs | +1 (Process) | 0 | 0 |
| AllDisjointClasses | 0 | 1 (expanded to 19 members) | 0 |
| AllDifferent declarations | +3 (orgs, geos, pubs) | 4 (expanded siblings) | 0 |

### Versioning

- TBox: 0.2.0 -> 0.3.0
- Reference individuals: 0.2.0 -> 0.3.0
- `dcterms:modified`: 2026-02-26
- `owl:priorVersion`: correctly set to 0.2.0 IRIs

## Findings Summary (for upstream skills)

| ID | Severity | Finding | Responsible Skill |
|----|----------|---------|-------------------|
| S1 | Medium | SHACL shapes not updated for 14 new classes | ontology-architect |
| T1 | Medium | No CQ test suite exists | ontology-requirements |
| AP1 | Low | 2 singleton hierarchies (Organization, GeographicEntity) | ontology-conceptualizer |
| AP3 | Medium | Process-Object tension in EnergyProject hierarchy | ontology-conceptualizer |
| AP10 | Low | 2 leaf-class domain overcommitments | ontology-architect |
