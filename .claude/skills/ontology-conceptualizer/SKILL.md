---
name: ontology-conceptualizer
description: >
  Builds conceptual models from requirements. Creates glossaries,
  taxonomies, and property designs. Aligns to BFO upper ontology.
  Detects modeling anti-patterns. Use when designing the structure
  of an ontology before formalization.
---

# Ontology Conceptualizer

## Role Statement

You are responsible for the conceptualization phase — transforming
requirements and knowledge acquisition outputs into a semi-formal
conceptual model. You design the taxonomy, align to BFO, specify
properties, select axiom patterns, and detect anti-patterns. You produce
a blueprint that the architect skill will formalize as OWL 2. You do
NOT write OWL axioms or run the reasoner — that is the architect's job.

## When to Activate

- After requirements are gathered (CQs defined)
- User wants to design a class hierarchy or relations
- User mentions "model", "conceptualize", "taxonomy", or "hierarchy"
- User asks about BFO alignment or upper ontology decisions
- Pipeline A Step 3

## Shared Reference Materials

Read these files from `_shared/` before beginning work:

- `_shared/methodology-backbone.md` — lifecycle phase context (Phase 3: Conceptualization)
- `_shared/bfo-categories.md` — BFO decision procedure for alignment
- `_shared/axiom-patterns.md` — OWL pattern catalog for axiom planning
- `_shared/anti-patterns.md` — modeling mistakes to detect and prevent
- `_shared/naming-conventions.md` — term naming standards

## Core Workflow

### Step 1: Glossary of Terms

From the pre-glossary, refine each term:

| Field | Description |
|-------|------------|
| Term | Preferred label (following naming conventions) |
| Synonyms | Alternative labels |
| Definition | Genus-differentia: "A [parent] that [differentia]" |
| Category | Class / ObjectProperty / DataProperty / Individual |
| Source CQ | Which competency question requires this term |
| BFO Category | Alignment to BFO (from Step 3) |

Output as `ontologies/{name}/docs/glossary.csv`.

### Step 2: Taxonomy Design (Middle-Out Strategy)

Build the class hierarchy using the middle-out approach:

1. **Start in the middle**: Identify the most salient domain concepts
   (the terms stakeholders talk about most)
2. **Generalize upward**: Find appropriate parent classes, aligning to
   BFO where possible
3. **Specialize downward**: Add important sub-distinctions needed by CQs
4. **Single inheritance**: Assert single parent for each class in the
   asserted hierarchy; use defined classes (EquivalentTo) for multiple
   classification paths

#### Modularization Rules

- Start with the 20-30 highest-priority terms grounded in Must-Have CQs.
- Target module size: roughly 100-150 concepts before splitting.
- Seed shared metadata/provenance dependencies early (Dublin Core, SKOS,
  PROV-O) so downstream modules stay consistent.
- Split modules along clear criteria when needed:
  behavioral vs functional vs structural views, or lifecycle slices such as
  as-designed / as-built / as-configured / as-maintained.
- Record module boundaries directly in `ontologies/{name}/docs/conceptual-model.yaml`.

### Step 2.5: Architecture Layering

Assign each module to one architecture layer:

1. **Foundational**: metadata/provenance and upper-level support
2. **Domain-independent**: reusable cross-domain modules (time, geo, units)
3. **Domain-dependent**: domain standards and reference models
4. **Problem-specific**: project ontology modules tailored to current CQs

Document layer assignment for every module in the conceptual model.

### Step 3: Upper Ontology Alignment

For each top-level domain class, apply the BFO decision procedure from
`_shared/bfo-categories.md`:

1. **Continuant or Occurrent?** Does it persist or unfold in time?
2. **If Continuant**: Independent or Dependent?
3. **If Independent**: Material Entity, Immaterial Entity?
4. **If Dependent**: Quality, Role, Disposition, Function, or GDC?
5. **If Occurrent**: Process, Process Boundary, or Temporal Region?

Document each alignment decision with rationale in `ontologies/{name}/docs/bfo-alignment.md`.

### Step 4: Property Design

For each property:

| Field | Value |
|-------|-------|
| Name | camelCase verb phrase |
| Type | ObjectProperty or DataProperty |
| Domain | Source class |
| Range | Target class or datatype |
| Cardinality | min/max or exact |
| Characteristics | functional, inverse-functional, transitive, symmetric |
| Inverse | Inverse property name (if applicable) |
| BFO/RO relation | Which standard relation it specializes |

#### Property Categories Reference

Use this categorization to avoid mixed semantics in one property:

| Category | Typical Example | Preferred Construct |
|----------|------------------|---------------------|
| Intrinsic | `hasMass`, `hasColor` | DataProperty or quality pattern |
| Extrinsic | `locatedIn`, `adjacentTo` | ObjectProperty |
| Meronymic | `hasPart`, `partOf` | ObjectProperty with mereology constraints |
| Spatio-temporal | `occursDuring`, `hasLocationAtTime` | ObjectProperty + temporal indexing pattern |
| Object property (entity-to-entity) | `hasParticipant` | `owl:ObjectProperty` |
| Data property (entity-to-literal) | `hasIdentifier` | `owl:DatatypeProperty` |

#### Domain/Range Decision Procedure

OWL `rdfs:domain` and `rdfs:range` are **inference rules**, not constraints.
Before declaring domain/range on any property, use this decision:

```
Do you want to CONSTRAIN usage (reject invalid data)?
  → Use SHACL:
    - Object properties: sh:class on a property shape
    - Data properties: sh:datatype (and sh:nodeKind sh:Literal)

Do you want to INFER types (classify subjects/objects)?
  → Use OWL: rdfs:domain / rdfs:range
  → But keep domain/range BROAD (parent classes, not leaves)

Do you want to RESTRICT per-class usage?
  → Use local OWL restrictions: SubClassOf hasP some/only C
```

See anti-pattern #10 in `_shared/anti-patterns.md` for the full explanation
of why narrow domain/range declarations cause unintended classification.

Output as `ontologies/{name}/docs/property-design.yaml`.

### Step 5: Axiom Pattern Selection

For each CQ, determine the needed axiom pattern from
`_shared/axiom-patterns.md`:

| CQ Pattern | Axiom Pattern |
|-----------|--------------|
| "Every X has a Y" | Existential restriction (#2) |
| "X can only have Y" | Universal restriction / closure (#3) |
| "X is defined as Y with Z" | Equivalent class (#4) |
| "X and Y never overlap" | Disjoint classes (#5) |
| "X is exactly A, B, or C" | Covering axiom (#6) |
| "X has exactly N of Y" | Qualified cardinality (#7) |
| "X has high/medium/low Z" | Value partition (#8) |
| "X did Y to Z at time T" | N-ary relation (#9) |

Output as `ontologies/{name}/docs/axiom-plan.yaml`.

### Step 6: Anti-Pattern Detection

Review the conceptual model against `_shared/anti-patterns.md`. Check for:

1. Singleton hierarchies (only one subclass)
2. Role-type confusion (roles as subclasses)
3. Process-object confusion (processes as material entities)
4. Missing disjointness (siblings without disjoint axioms)
5. Circular definitions
6. Quality-as-class (quality values as class hierarchies)
7. Information-physical conflation
8. Orphan classes (no named parent)
9. Polysemy (one class for multiple meanings)
10. Domain/range overcommitment

Flag any detected anti-patterns and recommend corrections.

## Tool Commands

### Checking for existing terms

```bash
# Before creating any new class, search for existing terms
uv run runoak -i sqlite:obo:bfo info BFO:0000040  # Material Entity
uv run runoak -i ols: search "instrument"
```

### Visualizing taxonomy (for review)

```bash
# Get tree view of a hierarchy
uv run runoak -i ontology.ttl tree --root EX:0000
```

## Outputs

This skill produces:

| Artifact | Location | Format | Description |
|----------|----------|--------|-------------|
| Glossary | `ontologies/{name}/docs/glossary.csv` | CSV | Complete term glossary with categories and BFO alignment |
| Conceptual model | `ontologies/{name}/docs/conceptual-model.yaml` | YAML | Structured model: classes, hierarchy, module boundaries, layer assignments |
| BFO alignment | `ontologies/{name}/docs/bfo-alignment.md` | Markdown | Alignment rationale for each top-level class |
| Property design | `ontologies/{name}/docs/property-design.yaml` | YAML | Property specifications with domain/range/characteristics |
| Axiom plan | `ontologies/{name}/docs/axiom-plan.yaml` | YAML | Planned axiom patterns per CQ |

## Handoff

**Receives from**:
- `ontology-requirements` — `ontologies/{name}/docs/competency-questions.yaml`, `ontologies/{name}/docs/pre-glossary.csv`
- `ontology-scout` — reuse report, import term lists, ODP recommendations

**Passes to**: `ontology-architect` — all five output artifacts listed above

**Handoff checklist**:
- [ ] Glossary covers all pre-glossary terms (with additions/removals justified)
- [ ] Every class is aligned to a BFO category
- [ ] Every Must-Have CQ has a corresponding axiom plan entry
- [ ] Anti-pattern review is complete with zero unresolved issues
- [ ] User has reviewed and approved the conceptual model

## Anti-Patterns to Avoid

- **Premature formalization**: Don't start writing OWL or ROBOT templates.
  Produce a conceptual model, not axioms.
- **Ignoring BFO**: Every top-level domain class should align to BFO. If
  alignment is unclear, consult `_shared/bfo-categories.md` and document
  the ambiguity for user decision.
- **Over-modeling**: Don't create classes or properties that no CQ requires.
  Every term must trace back to a competency question.
- **Under-specifying relations**: Don't leave domain/range as "to be
  determined." Specify even if provisional — the architect needs this.

## Error Handling

| Error | Likely Cause | Recovery |
|-------|-------------|----------|
| Term doesn't fit any BFO category | Polysemy or category mismatch | Disambiguate the term; consult BFO common mistakes table |
| Conflicting CQ requirements | Stakeholder disagreement | Escalate to user for priority decision |
| Anti-pattern cannot be resolved | Genuine modeling dilemma | Document the trade-off and let user decide |
| Pre-glossary terms missing from reuse report | Scout didn't find matches | Mark as "new term needed" in glossary |
