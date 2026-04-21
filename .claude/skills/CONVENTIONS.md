# Ontology Skill Conventions

Governing document for all 8 ontology skills. Every SKILL.md must conform
to the standards defined here.

## Methodology Backbone

The 8 skills map to the ontology engineering lifecycle as defined in
`_shared/methodology-backbone.md`:

| Lifecycle Phase | Skill | Primary Methodology |
|----------------|-------|-------------------|
| 1. Specification | `ontology-requirements` | CQ-Driven (Gruninger & Fox) |
| 2. Knowledge Acquisition | `ontology-scout` | NeOn Scenarios 1-4 |
| 3. Conceptualization | `ontology-conceptualizer` | METHONTOLOGY + BFO alignment |
| 4. Formalization | `ontology-architect` | POD (Programmatic Ontology Development) |
| 5. Integration | `ontology-mapper` | SSSOM + NeOn Scenario 5 |
| 6. Evaluation | `ontology-validator` | TDOD (Test-Driven Ontology Development) |
| X. Querying | `sparql-expert` | Cross-cutting |
| X. Maintenance | `ontology-curator` | NeOn Scenario 9 |

## Skill Authoring Standard

Every SKILL.md must contain these sections, in this order:

1. **YAML Front Matter** — `name`, `description`
2. **Role Statement** — What this skill is and what it is responsible for
3. **When to Activate** — Trigger conditions (user keywords, pipeline stage)
4. **Shared Reference Materials** — List of `_shared/` files this skill reads
5. **Core Workflow** — Numbered steps with concrete commands
6. **Tool Commands** — Exact CLI/Python examples for each operation
7. **Outputs** — Files produced, naming conventions, formats
8. **Handoff** — What the next skill in the pipeline expects to receive
9. **Anti-Patterns to Avoid** — Skill-specific mistakes
10. **Error Handling** — What to do when things fail

See `SKILL-TEMPLATE.md` for the skeleton.

## Shared Terminology

All skills must use these canonical terms consistently:

| Canonical Term | Do NOT Use | Definition |
|---------------|-----------|-----------|
| class | concept, type, category | An OWL class (set of individuals) |
| property | relation, attribute, predicate | OWL object or data property |
| individual | instance, entity, thing | A member of a class |
| axiom | rule, statement, assertion | A logical sentence in the ontology |
| restriction | constraint (in OWL context) | An OWL class expression (SomeValuesFrom, etc.) |
| competency question (CQ) | use case, requirement | A question the ontology must be able to answer |
| CURIE | short IRI, prefixed name | Compact URI (e.g., `BFO:0000001`) |
| IRI | URL, URI | Internationalized Resource Identifier |
| taxonomy | hierarchy, tree | The SubClassOf structure |
| ontology | knowledge graph (when referring to TBox) | The formal model (TBox + ABox) |
| deprecate | delete, remove, obsolete (as verb) | Mark term as `owl:deprecated true` |
| mapping | alignment, cross-reference | A correspondence between terms (SSSOM) |
| reasoner | classifier, inference engine | Software that computes entailments (ELK, HermiT) |

## Tool Selection Rules

### Primary tools (always try first)

1. **ROBOT CLI** — for build operations (merge, reason, report, template,
   verify, diff, convert, extract, annotate)
2. **oaklib (runoak)** — for navigation, search, KGCL change application,
   lexmatch
3. **KGCL** — for human-reviewable change proposals

### Secondary tools (escalate when primary cannot handle)

4. **OWLAPY** — complex DL axioms requiring OWL API (qualified cardinality,
   role chains, nested expressions)
5. **owlready2** — rapid prototyping, ORM-style interaction, SQLite quadstore
6. **LinkML** — schema-first modeling, multi-format artifact generation
7. **rdflib** — raw RDF triple manipulation, custom serialization
8. **pyshacl** — SHACL shape validation
9. **sssom-py** — SSSOM file management and validation

### Escalation criteria

Escalate to a secondary tool only when:
- The primary tool lacks the required expressivity
- The operation is not supported by any primary tool
- Performance requirements demand a specialized tool

See `_shared/tool-decision-tree.md` for the full decision flowchart.

## Cross-Skill Handoff Specification

### Pipeline A — New Ontology

```
requirements ──→ scout ──→ conceptualizer ──→ architect ──→ validator
```

| From | To | Artifacts Passed |
|------|----|-----------------|
| requirements | scout | `ontologies/{name}/docs/pre-glossary.csv`, `ontologies/{name}/docs/scope.md` |
| requirements | conceptualizer | `ontologies/{name}/docs/competency-questions.yaml`, `ontologies/{name}/docs/pre-glossary.csv` |
| scout | conceptualizer | reuse report, import term lists, ODP recommendations |
| conceptualizer | architect | `ontologies/{name}/docs/glossary.csv`, `ontologies/{name}/docs/conceptual-model.yaml`, `ontologies/{name}/docs/bfo-alignment.md`, `ontologies/{name}/docs/axiom-plan.yaml`, `ontologies/{name}/docs/property-design.yaml` |
| architect | validator | `ontologies/{name}/{name}.ttl`, `ontologies/{name}/shapes/{name}-shapes.ttl`, `ontologies/{name}/tests/*.sparql`, `ontologies/{name}/tests/cq-test-manifest.yaml` |

### Pipeline B — Mapping

| From | To | Artifacts Passed |
|------|----|-----------------|
| scout | mapper | Target ontology identifiers, reuse recommendations |
| mapper | validator | `ontologies/{name}/mappings/*.sssom.tsv` |

### Pipeline C — Evolution

| From | To | Artifacts Passed |
|------|----|-----------------|
| curator | validator | Modified `ontology.ttl`, KGCL change log |

### Cross-cutting handoffs

| Skill | Can Be Called By | Provides |
|-------|-----------------|----------|
| sparql-expert | Any skill | SPARQL queries, query results |
| validator | architect, curator, mapper | Validation reports |

## Safety Rules (Non-Negotiable)

These rules apply to every skill. Violations are never acceptable.

1. **Never hand-edit structural axioms** (SubClassOf, EquivalentClass,
   DisjointClasses, property assertions) in `.owl`, `.ttl`, or `.rdf`
   files — always use ROBOT, oaklib, or Python tools. Annotation-only
   edits (labels, definitions, synonyms) may be hand-edited if followed
   by `robot report` validation. Merge conflict resolution inherently
   requires hand-editing — always run `robot reason` afterward.
2. **Always run the reasoner** (`robot reason`) after any structural change
   to the ontology
3. **Always run quality report** (`robot report`) before committing
   ontology changes
4. **Never delete terms** — deprecate with `owl:deprecated true` and
   provide a replacement pointer (`obo:IAO_0100001`)
5. **Propose KGCL patches** for human review before applying changes
   to shared ontologies
6. **Validate SPARQL syntax** before execution
7. **Check for existing terms** (via `runoak search`) before creating
   new ones
8. **Never execute** SPARQL UPDATE/DELETE against production endpoints
9. **Read before modifying** — always read the existing ontology file
   before making changes
10. **Back up before bulk operations** — create a checkpoint before
    ROBOT template or batch KGCL application

## Output Artifact Standards

### File Naming

| Artifact Type | Naming Pattern | Example |
|--------------|---------------|---------|
| Main ontology | `{name}.ttl` | `music.ttl` |
| Working copy | `{name}-edit.ttl` | `music-edit.ttl` |
| SHACL shapes | `{name}-shapes.ttl` | `music-shapes.ttl` |
| SSSOM mappings | `{source}-to-{target}.sssom.tsv` | `music-to-wikidata.sssom.tsv` |
| CQ tests | `cq-{id}.sparql` | `cq-001.sparql` |
| ROBOT templates | `{name}-template.tsv` | `instruments-template.tsv` |
| KGCL patches | `{name}-changes.kgcl` | `music-v2-changes.kgcl` |
| Quality reports | `{name}-report.tsv` | `music-report.tsv` |

### Serialization

- **Default format**: Turtle (`.ttl`)
- **Manchester Syntax**: for human review and LLM interaction
- **OWL/XML**: only when required by tooling (ROBOT intermediate)
- **JSON-LD**: for web integration and APIs

### Metadata Requirements

Every ontology file must include in its header:
- `owl:versionIRI` — versioned IRI
- `owl:versionInfo` — version string (date or semver)
- `dcterms:title` — human-readable title
- `dcterms:description` — purpose and scope
- `dcterms:license` — license URI
- `dcterms:creator` — creator(s)
- `owl:imports` — all imported ontologies
