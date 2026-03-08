# Ontology Engineering Workspace & Skills Proposal

## Executive Summary

This proposal defines a comprehensive **Ontology Engineering Workspace** -- a set of Claude Code skills, CLAUDE.md configurations, MCP servers, and supporting infrastructure that transforms agentic coding tools (Claude Code, Codex) into capable ontology engineering assistants.

The workspace covers the **full ontology development lifecycle**: requirements elicitation, knowledge acquisition, conceptualization, formalization, integration/mapping, validation, documentation, and evolution. Each lifecycle stage gets a dedicated skill with specialized workflows, reference materials, and scripts.

### Key Design Principles

1. **Lifecycle Coverage**: One skill per major ontology development stage, composable into end-to-end pipelines
2. **Tool-Layer Strategy**: ROBOT + oaklib + KGCL as the core triad; OWLAPY/owlready2/LinkML for specialized tasks
3. **SSSOM-Native Mapping**: All cross-ontology work uses SSSOM as the interchange format
4. **CQ-Driven Development**: Competency questions drive design, formalized as SPARQL tests
5. **Cross-Platform**: Skills designed for Claude Code with parallel AGENTS.md for Codex compatibility
6. **Progressive Disclosure**: Skills lazy-load; reference material externalized from SKILL.md files
7. **Safety by Default**: Agents propose KGCL patches for review; never directly edit OWL/XML; always validate after changes

---

## 1. Workspace Directory Structure

```
ontology-workspace/
├── CLAUDE.md                                # Project-level agent configuration
├── AGENTS.md                                # Codex CLI compatibility
├── .claude/
│   └── settings.json                        # MCP server configuration
│
├── skills/                                  # Claude Code skills
│   ├── ontology-requirements/               # Stage 1: Requirements & CQs
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── cq-patterns.md
│   │   │   └── orsd-template.md
│   │   ├── templates/
│   │   │   ├── competency-questions.yaml
│   │   │   └── cq-test-manifest.yaml
│   │   └── scripts/
│   │       └── cq_to_sparql.py
│   │
│   ├── ontology-scout/                      # Stage 2: Reuse & Discovery
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── obo-foundry-index.yaml
│   │   │   ├── odp-catalog.md
│   │   │   └── reuse-decision-tree.md
│   │   └── scripts/
│   │       ├── search_ols.py
│   │       ├── search_bioportal.py
│   │       └── extract_module.sh
│   │
│   ├── ontology-conceptualizer/             # Stage 3: Conceptualization
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── bfo-decision-procedure.md
│   │   │   ├── axiom-patterns.md
│   │   │   └── anti-patterns.md
│   │   └── templates/
│   │       ├── glossary.csv
│   │       └── concept-dictionary.yaml
│   │
│   ├── ontology-architect/                  # Stage 4: Formalization (POD)
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── owl2-profiles.md
│   │   │   ├── naming-conventions.md
│   │   │   └── robot-template-guide.md
│   │   ├── templates/
│   │   │   ├── ontology-header.ttl
│   │   │   ├── robot-template.tsv
│   │   │   └── linkml-schema.yaml
│   │   └── scripts/
│   │       ├── add_class.py
│   │       ├── check_consistency.py
│   │       └── serialize.py
│   │
│   ├── ontology-mapper/                     # Stage 5: Mapping & Alignment
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── sssom-schema.md
│   │   │   ├── semapv-vocabulary.yaml
│   │   │   ├── mapping-predicates.md
│   │   │   └── quality-rules.yaml
│   │   ├── templates/
│   │   │   ├── sssom-template.tsv
│   │   │   └── lexmatch-rules.yaml
│   │   └── scripts/
│   │       ├── lexmatch_runner.py
│   │       ├── sssom_validate.py
│   │       ├── mapping_qa.py
│   │       └── kgcl_from_mappings.py
│   │
│   ├── ontology-validator/                  # Stage 6: Validation & QA
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── quality-metrics.md
│   │   │   └── oops-pitfalls.md
│   │   └── scripts/
│   │       ├── run_reasoner.sh
│   │       ├── run_shacl.py
│   │       ├── run_cq_tests.py
│   │       └── robot_report.sh
│   │
│   ├── sparql-expert/                       # Cross-Cutting: SPARQL
│   │   ├── SKILL.md
│   │   ├── reference/
│   │   │   ├── namespaces.json
│   │   │   ├── sparql-patterns.md
│   │   │   └── store-quirks.md
│   │   └── scripts/
│   │       ├── validate_query.py
│   │       └── execute_query.py
│   │
│   └── ontology-curator/                    # Cross-Cutting: Maintenance
│       ├── SKILL.md
│       ├── reference/
│       │   ├── deprecation-protocol.md
│       │   ├── kgcl-grammar.md
│       │   └── versioning-guide.md
│       └── scripts/
│           ├── apply_kgcl.sh
│           ├── generate_diff.sh
│           └── generate_docs.sh
│
├── mcp-servers/                             # Custom MCP servers
│   └── ontology-tools/
│       ├── package.json
│       └── src/
│           └── index.ts
│
├── ontologies/                              # Ontology projects live here
│   ├── CLAUDE.md                            # Ontology directory conventions
│   └── .gitkeep
│
├── mappings/                                # SSSOM mapping files
│   ├── CLAUDE.md                            # Mapping conventions
│   └── .gitkeep
│
├── sparql/                                  # Stored queries
│   ├── CLAUDE.md                            # Query conventions
│   └── .gitkeep
│
├── tests/                                   # CQ tests and validation
│   ├── CLAUDE.md                            # Testing conventions
│   └── .gitkeep
│
├── scripts/                                 # Shared utility scripts
│   ├── setup_env.sh
│   └── requirements.txt
│
└── docs/
    ├── ontology_research.md                 # Existing research document
    └── proposal.md                          # This document
```

---

## 2. CLAUDE.md Configuration

### 2.1 Root CLAUDE.md

```markdown
# Ontology Engineering Workspace

## Project Overview
This is a Programmatic Ontology Development (POD) workspace for building,
maintaining, and integrating OWL 2 ontologies using Python tooling and
CLI tools. All ontology modifications are performed through code, never
by hand-editing serialized files.

## Technology Stack
- Python 3.11+ with owlapy, owlready2, rdflib, pyshacl, linkml, oaklib, sssom-py
- ROBOT CLI (OBO ontology tool)
- ODK (Ontology Development Kit) for CI/CD
- Triple Store: GraphDB or Jena Fuseki (configurable)
- Reasoners: HermiT, ELK (via OWLAPY JVM bridge or ROBOT)

## Core Tool Strategy
Primary tools (use first):
- ROBOT CLI: build operations (merge, reason, report, convert, template, verify, diff)
- oaklib (runoak): navigation, search, KGCL changes, lexmatch
- KGCL: human-reviewable change proposals

Secondary tools (specialized use):
- OWLAPY: complex Description Logic axioms requiring OWL API
- owlready2: rapid prototyping, ORM-style ontology interaction
- LinkML: schema-first modeling, polyglot artifact generation
- rdflib: RDF graph manipulation, serialization
- pyshacl: SHACL shape validation
- sssom-py: ontology mapping management

## Coding Standards
- All ontology modifications MUST go through Python scripts, ROBOT commands,
  or KGCL patches -- never hand-edit .owl or .ttl files
- Every modification script MUST include a verification step (reasoner or SHACL)
- Turtle (.ttl) is the default serialization format
- Manchester Syntax for human review and LLM interaction
- Use CamelCase for class names, camelCase for properties
- All new classes require: rdfs:label, skos:definition, rdfs:subClassOf
- Follow genus-differentia pattern for definitions: "A [parent] that [differentia]"

## Namespace Prefixes
Standard prefixes -- always use these:
- rdf, rdfs, owl, skos, sh, xsd, dcterms
- obo: http://purl.obolibrary.org/obo/
- IAO: http://purl.obolibrary.org/obo/IAO_
- BFO: http://purl.obolibrary.org/obo/BFO_
- RO: http://purl.obolibrary.org/obo/RO_

## Git Conventions
- Commits: <type>(<scope>): <description>
- Types: feat, fix, refactor, docs, test, chore
- Scope: ontology name or component
- Include reasoner output in commits that change ontology structure

## Agent Safety Rules
- Before modifying any ontology, ALWAYS read the existing file first
- NEVER delete ontology terms without explicit user confirmation
- When generating SPARQL, ALWAYS validate syntax before execution
- When adding classes, ALWAYS check for existing similar terms first (via oaklib search)
- Propose KGCL patches for human review rather than silently modifying ontologies
- NEVER execute SPARQL UPDATE/DELETE against production endpoints
- ALWAYS run `robot report` after structural changes
- Use `robot diff` for PR descriptions
```

### 2.2 Ontologies Directory CLAUDE.md

```markdown
# Ontology Directory Conventions

## File Organization
Each ontology lives in its own subdirectory:
  {name}/
  ├── {name}.ttl              # Main ontology (Turtle)
  ├── {name}-edit.ttl         # Working copy (if using ODK pattern)
  ├── imports/                 # Imported modules
  │   ├── {source}_import.owl
  │   └── {source}_terms.txt
  ├── components/              # Modular components
  ├── shapes/                  # SHACL shape files
  │   └── {name}-shapes.ttl
  ├── docs/
  │   └── competency-questions.yaml
  ├── tests/
  │   ├── cq-test-manifest.yaml
  │   └── *.sparql
  └── CHANGELOG.md

## Design Rules
- Follow the genus-differentia pattern for all definitions
- Use ObjectSomeValuesFrom for existential restrictions
- Use ObjectAllValuesFrom only when closure axioms are needed
- Sibling classes under the same parent SHOULD be declared disjoint
- Every class must have at least one named parent (no orphans)

## Quality Checks (run before every commit)
1. `robot reason --reasoner ELK --input {name}.ttl`
2. `robot report --input {name}.ttl --fail-on ERROR`
3. `pyshacl -s shapes/{name}-shapes.ttl {name}.ttl`
4. `robot verify --input {name}.ttl --queries tests/`
```

### 2.3 Mappings Directory CLAUDE.md

```markdown
# Mapping Conventions

## Format
- All mappings in SSSOM TSV format (.sssom.tsv)
- File naming: {source}-to-{target}.sssom.tsv
- Include full YAML metadata headers with curie_map

## Mapping Predicates (preference order)
- skos:exactMatch -- interchangeable concepts
- skos:closeMatch -- similar, not identical
- skos:broadMatch / skos:narrowMatch -- hierarchical
- skos:relatedMatch -- associative only
- owl:equivalentClass -- only for formal logical equivalence

## Quality Requirements
- All mappings MUST have mapping_justification (SEMAPV term)
- Confidence scores required for automated mappings
- Manual curations marked with semapv:ManualMappingCuration
- Run `sssom validate` before committing

## Tools
- oaklib lexmatch for candidate generation
- sssom-py for file management and validation
- KGCL for mapping changes
```

---

## 3. Skill Definitions

### 3.1 Skill: ontology-requirements

**Purpose**: Manage the requirements specification process -- elicit, refine, prioritize, and formalize competency questions (CQs) that drive ontology design.

```markdown
---
name: ontology-requirements
description: >
  Manages ontology requirements specification. Elicits, refines, and
  formalizes competency questions (CQs). Generates ORSD documents and
  CQ test suites. Use when starting a new ontology, defining scope, or
  creating acceptance tests.
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit
---

# Ontology Requirements Engineer

## When to Activate
- User wants to start a new ontology project
- User wants to define scope or requirements
- User mentions "competency questions" or "CQs"
- User wants to create tests for an ontology

## Core Workflow

### 1. Domain Scoping
- Gather domain description and intended use cases from user
- Identify key stakeholders and their information needs
- Define what is IN scope and OUT of scope

### 2. CQ Elicitation
For each stakeholder perspective, generate candidate CQs:
- Enumerative: "What are all the X?"
- Boolean: "Is X a Y?"
- Relational: "What Y is related to X via R?"
- Quantitative: "How many X have property P?"
- Constraint: "Can X and Y be true simultaneously?"
- Temporal: "When did X occur relative to Y?"

### 3. CQ Refinement
- Decompose compound questions into atomic CQs
- Remove duplicates and subsumptions
- Classify each CQ by type

### 4. Prioritization (MoSCoW)
- Must Have: core CQs without which the ontology is useless
- Should Have: significantly enhance utility
- Could Have: nice-to-have for future iterations
- Won't Have: explicitly out of scope

### 5. Formalization
For each Must/Should CQ, produce:
```yaml
- id: CQ-001
  natural_language: "What instruments exist in the ontology?"
  type: enumerative
  priority: must_have
  sparql: |
    SELECT ?instrument ?label WHERE {
      ?instrument rdf:type :Instrument ;
                  rdfs:label ?label .
    }
  required_classes: [Instrument]
  required_properties: []
  required_axioms: []
```

### 6. Pre-Glossary Extraction
From all CQs, extract:
- Candidate classes (nouns)
- Candidate properties (verbs, relationships)
- Candidate individuals (proper nouns, specific instances)
Output as `pre-glossary.csv`

### 7. Test Suite Generation
- Generate SPARQL files for each CQ in `tests/{name}/` directory
- Generate `tests/{name}/cq-test-manifest.yaml`
- Constraint CQs become violation queries (expect 0 results)

## Outputs
- `docs/{name}/orsd.md` -- Ontology Requirements Specification Document
- `docs/{name}/competency-questions.yaml` -- structured CQ list
- `tests/{name}/*.sparql` -- SPARQL test queries
- `tests/{name}/cq-test-manifest.yaml` -- test manifest
- `docs/{name}/pre-glossary.csv` -- extracted candidate terms
- `docs/{name}/scope.md` -- scope definition (in/out)

## Anti-Patterns to Avoid
- CQs that are too vague ("What is the meaning of X?")
- CQs that require reasoning beyond OWL expressivity
- CQs that conflate requirements with implementation
```

### 3.2 Skill: ontology-scout

**Purpose**: Discover, evaluate, and recommend reusable ontological resources (existing ontologies, modules, design patterns) before building from scratch.

```markdown
---
name: ontology-scout
description: >
  Searches for and evaluates reusable ontological resources. Queries
  OLS, BioPortal, OBO Foundry, and LOV. Extracts ontology modules via
  ROBOT. Finds applicable Ontology Design Patterns. Use when looking
  for existing ontologies to reuse or align with.
disable-model-invocation: false
allowed-tools: Bash, Read, Write
---

# Ontology Scout (Reuse Advisor)

## When to Activate
- User wants to find existing ontologies covering their domain
- User mentions "reuse", "import", "alignment", or "existing ontology"
- Starting conceptualization (always check what exists first)

## Reuse Decision Tree
Read `reference/reuse-decision-tree.md` for the full NeOn methodology scenarios.

Quick decision:
1. Existing ontology covers >80% of needs -> Direct Import
2. Covers 40-80% -> Module Extraction (ROBOT extract)
3. Covers <40% but has useful terms -> MIREOT (term borrowing)
4. Good structure but wrong domain -> Ontology Design Pattern reuse
5. Related ontology exists -> SSSOM Mapping / Bridge Ontology

## Search Workflow

### Step 1: Search Registries
For each candidate term from the pre-glossary:

```bash
# Search OLS (Ontology Lookup Service)
curl "https://www.ebi.ac.uk/ols4/api/search?q=TERM&rows=10"

# Search via oaklib
runoak -i ols: search "TERM"

# Search BioPortal (if API key configured)
runoak -i bioportal: search "TERM"
```

### Step 2: Evaluate Candidates
Score each candidate ontology:
- Coverage: % of pre-glossary terms found
- Quality: OBO Dashboard score, label/definition coverage
- License: Must be open (CC-BY or CC0 preferred)
- Community: Active maintenance, GitHub stars, publications
- Alignment: Already aligned to BFO? Uses standard relations?

### Step 3: Recommend Reuse Strategy
For each recommended ontology, specify:
- Which terms to import
- Extraction method (MIREOT, STAR, BOT)
- ROBOT commands to execute

### Step 4: Module Extraction
```bash
# List terms to import in a file
echo "http://purl.obolibrary.org/obo/GO_0008150" > imports/go_terms.txt

# Extract module
robot extract --method STAR \
  --input-iri http://purl.obolibrary.org/obo/go.owl \
  --term-file imports/go_terms.txt \
  --output imports/go_import.owl
```

### Step 5: ODP Search
Search the Ontology Design Pattern catalog for applicable patterns:
- Part-Whole patterns
- N-ary Relation patterns
- Value Partition patterns
- Defined Class patterns
- Participation patterns

## Outputs
- Reuse evaluation report with scored candidates
- ROBOT extraction commands
- Import term lists
- ODP instantiation recommendations
```

### 3.3 Skill: ontology-conceptualizer

**Purpose**: Transform knowledge acquisition outputs into a semi-formal conceptual model, with BFO/DOLCE alignment.

```markdown
---
name: ontology-conceptualizer
description: >
  Builds conceptual models from requirements. Creates glossaries,
  taxonomies, and relation designs. Aligns to upper ontologies (BFO,
  DOLCE). Detects modeling anti-patterns. Use when designing the
  structure of an ontology before formalization.
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit
---

# Ontology Conceptualizer

## When to Activate
- After requirements are gathered (CQs defined)
- User wants to design class hierarchy or relations
- User mentions "model", "conceptualize", "taxonomy", or "hierarchy"
- User asks about BFO alignment

## Workflow

### 1. Glossary of Terms
From the pre-glossary, for each term determine:
- Term name (preferred label)
- Synonyms
- Natural language definition (genus-differentia)
- Category: Class / ObjectProperty / DataProperty / Individual
- Source: CQ that requires it

### 2. Taxonomy Design (Middle-Out Strategy)
a. Start with the most salient domain concepts (middle level)
b. Generalize upward to find parent classes
c. Specialize downward for important distinctions
d. Ensure single inheritance for asserted hierarchy (use defined classes for multiple)

### 3. Upper Ontology Alignment
Read `reference/bfo-decision-procedure.md` and apply:

For each top-level domain class, determine BFO category:

```
Is it an entity that persists through time, or unfolds in time?

Persists (Continuant):
  Can it exist independently?
    Material? -> Material Entity (Object / Aggregate / Fiat Part)
    Not material? -> Site / Spatial Region
  Depends on a bearer?
    Measurable quality? -> Quality
    Social/contextual? -> Role
    Intrinsic tendency? -> Disposition
    Physical function? -> Function
  Information content? -> Generically Dependent Continuant

Unfolds in time (Occurrent):
  Has temporal extent? -> Process
  Instantaneous? -> Process Boundary
  Region of time? -> Temporal Region
```

### 4. Relation Design
For each relation, specify:
- Domain and range classes
- Cardinality constraints (min/max)
- Characteristics: functional, inverse-functional, transitive, symmetric
- Inverse relation (if any)
- BFO relation it specializes (if applicable)

### 5. Axiom Pattern Selection
Read `reference/axiom-patterns.md`. For each CQ, determine needed axiom type:

| CQ Type | Axiom Pattern |
|---------|--------------|
| "Every X has a Y" | X SubClassOf hasY some Y |
| "Only Y can be Z" | Z SubClassOf hasY only Y (closure) |
| "X are exactly A, B, C" | X EquivalentTo A or B or C (covering) |
| "X with property P is a Q" | Q EquivalentTo X and hasP some P (defined) |

### 6. Anti-Pattern Detection
Read `reference/anti-patterns.md`. Check for:
- Single-child classes (only one subclass)
- Role-type confusion ("Student" as subclass of Person)
- Process-object confusion ("Surgery" as Object)
- Missing disjointness (siblings without disjoint axioms)
- Circular definitions
- Quality-as-class ("Red" as subclass of "Color")
- Information-physical conflation

## Outputs
- `docs/{name}/glossary.csv` -- complete term glossary
- `docs/{name}/conceptual-model.yaml` -- structured model
- `docs/{name}/bfo-alignment.md` -- alignment rationale for each class
- `docs/{name}/property-design.yaml` -- property specifications
- `docs/{name}/axiom-plan.yaml` -- planned axiom patterns per CQ
```

### 3.4 Skill: ontology-architect

**Purpose**: Formalize the conceptual model as OWL 2 using Programmatic Ontology Development.

```markdown
---
name: ontology-architect
description: >
  Specializes in Programmatic Ontology Development (POD). Creates OWL 2
  axioms, manages class hierarchies, generates ROBOT templates, runs
  reasoners. Uses OWLAPY, Owlready2, LinkML, and ROBOT. Use when
  creating or modifying ontology axioms.
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit
---

# Ontology Architect (POD)

## When to Activate
- User wants to create or modify ontology classes, properties, or axioms
- User mentions "add class", "define property", "create axiom"
- User wants to formalize a conceptual model

## Tool Selection
- **ROBOT template**: Bulk term creation (>5 terms), standard patterns
- **KGCL via oaklib**: Individual changes, renames, reparenting
- **OWLAPY**: Complex DL axioms (qualified cardinality, role chains)
- **Owlready2**: Rapid prototyping, ORM-style interaction
- **LinkML**: Schema-first modeling, multi-format generation

## OWL 2 Profile Selection
Read `reference/owl2-profiles.md`:
- >100K classes, primarily taxonomic: **OWL 2 EL**
- OBDA over relational data: **OWL 2 QL**
- Full expressivity needed: **OWL 2 DL**
- Rule-engine integration: **OWL 2 RL**

## Workflows

### Adding Classes via ROBOT Template
For batch creation, generate a ROBOT template TSV:

```tsv
ID	LABEL	SC %	DEFINITION	DEFINITION SOURCE
ID	A rdfs:label	SC %	A obo:IAO_0000115	A obo:IAO_0000119
EX:0001	Piano	EX:0000	A keyboard instrument that produces sound by striking strings	ISBN:123456
EX:0002	Violin	EX:0000	A string instrument played with a bow	ISBN:123456
```

Then execute:
```bash
robot template --template template.tsv \
  --input base-ontology.ttl \
  --output updated-ontology.ttl
```

### Adding Classes via KGCL
For individual additions:
```bash
runoak -i ontology.ttl apply "create class EX:0001 'Piano'"
runoak -i ontology.ttl apply "create edge EX:0001 rdfs:subClassOf EX:0000"
runoak -i ontology.ttl apply "create definition 'A keyboard instrument...' for EX:0001"
```

### Complex Axioms via OWLAPY
When ROBOT templates are insufficient:

```python
from owlapy.model import (OWLClass, OWLObjectProperty,
    OWLSubClassOfAxiom, OWLObjectSomeValuesFrom,
    OWLObjectAllValuesFrom, OWLObjectIntersectionOf)
from owlapy.model import IRI
from owlapy.owlready2 import OWLOntologyManager_Owlready2

manager = OWLOntologyManager_Owlready2()
onto = manager.load_ontology(IRI.create("file:///path/to/onto.owl"))

# Example: VegetarianPizza EquivalentTo Pizza and hasTopping only VegetableTopping
pizza = OWLClass(IRI.create("http://ex.org/#Pizza"))
veg_top = OWLClass(IRI.create("http://ex.org/#VegetableTopping"))
has_top = OWLObjectProperty(IRI.create("http://ex.org/#hasTopping"))

restriction = OWLObjectAllValuesFrom(has_top, veg_top)
intersection = OWLObjectIntersectionOf([pizza, restriction])
# ... add as equivalent class axiom

manager.save_ontology(onto, IRI.create("file:///path/to/onto.owl"))
```

### Schema-First via LinkML
For new ontologies, start with LinkML YAML:

```yaml
id: https://example.org/music-ontology
name: music-ontology
prefixes:
  linkml: https://w3id.org/linkml/
  music: https://example.org/music-ontology/

classes:
  Instrument:
    description: A device used to produce music
    attributes:
      name:
        range: string
        required: true
      instrument_family:
        range: InstrumentFamily
```

Then generate:
```bash
gen-owl schema.yaml > ontology.owl
gen-shacl schema.yaml > shapes.ttl
gen-python schema.yaml > models.py
```

## Verification (ALWAYS run after changes)
```bash
robot reason --reasoner ELK --input ontology.ttl --output classified.ttl
robot report --input ontology.ttl --fail-on ERROR --output report.tsv
```

## Error Handling
- If reasoner reports INCONSISTENT: analyze explanation, identify conflicting axioms
- If unsatisfiable classes found: list them, trace disjointness axioms
- If ROBOT template fails: check column headers match expected format
```

### 3.5 Skill: ontology-mapper

**Purpose**: Create, validate, and maintain cross-ontology mappings using SSSOM.

```markdown
---
name: ontology-mapper
description: >
  Manages cross-ontology mapping and alignment. Generates, validates, and
  maintains SSSOM mapping sets. Runs lexical matching via oaklib, semantic
  matching via embeddings, and LLM-assisted verification. Use when working
  with ontology mappings, alignment, or cross-references.
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit
---

# Ontology Mapper

## When to Activate
- User mentions "mapping", "alignment", "cross-reference", or "SSSOM"
- User wants to connect two ontologies
- User wants to validate or update existing mappings

## Core Workflows

### Workflow 1: Create New Mapping Set

#### Step 1: Candidate Generation (Lexical Matching)
```bash
# Using oaklib lexmatch
runoak -i sqlite:obo:{source} lexmatch \
  -R sqlite:obo:{target} \
  --rules lexmatch-rules.yaml \
  -o mappings/{source}-to-{target}.sssom.tsv
```

Default lexmatch rules (reference/lexmatch-rules.yaml):
```yaml
rules:
  - match_fields: [rdfs:label, oio:hasExactSynonym]
    predicate: skos:exactMatch
    weight: 0.9
  - match_fields: [rdfs:label, oio:hasRelatedSynonym]
    predicate: skos:closeMatch
    weight: 0.7
```

#### Step 2: Confidence Triage
- Auto-accept: confidence >= 0.95 AND exact label match
- LLM-verify: confidence 0.7 - 0.95 (present pairs with context for review)
- Human queue: confidence < 0.7 (flag for manual review)

#### Step 3: LLM Verification (for uncertain mappings)
For each uncertain pair, present to the agent:
```
Evaluate this mapping:
  Subject: {id} "{label}" -- {definition} [parents: {parents}]
  Object:  {id} "{label}" -- {definition} [parents: {parents}]

Determine: predicate (exactMatch/closeMatch/broadMatch/narrowMatch/
           relatedMatch/no_match), confidence, justification
```

#### Step 4: Validate
```bash
sssom validate mappings/{source}-to-{target}.sssom.tsv
```

Check: schema conformance, CURIE resolution, entity existence,
predicate consistency, no self-mappings, no duplicate mappings.

#### Step 5: Quality Report
```python
# Using scripts/mapping_qa.py
python scripts/mapping_qa.py --input mappings/file.sssom.tsv
```

Reports: predicate distribution, confidence distribution,
source/target coverage, potential conflicts, clique analysis.

### Workflow 2: Update Mappings for New Ontology Version

#### Step 1: Check for Obsoleted Targets
```bash
# Find obsoleted terms in target ontology
runoak -i sqlite:obo:{target} query \
  "SELECT ?term WHERE { ?term owl:deprecated true }"
```

#### Step 2: Generate KGCL Changes
For each obsoleted target with a replacement:
```
delete mapping {subject} {predicate} {obsolete_target}
create mapping {subject} {predicate} {replacement_target}
```

#### Step 3: Generate New Candidates
Run lexmatch for any unmapped source terms against the updated target.

### Workflow 3: Merge Mapping Sets
```bash
sssom merge \
  -i set1.sssom.tsv set2.sssom.tsv \
  -o merged.sssom.tsv

sssom dedupe -i merged.sssom.tsv -o final.sssom.tsv
```

## Mapping Predicate Decision Guide
Read `reference/mapping-predicates.md`:

```
Logically equivalent with formal proof? -> owl:equivalentClass
High-confidence equivalence? -> skos:exactMatch
Subject more general than object? -> skos:broadMatch
Subject more specific than object? -> skos:narrowMatch
Similar but not fully interchangeable? -> skos:closeMatch
Merely associated? -> skos:relatedMatch
```

Critical: skos:exactMatch is TRANSITIVE. Avoid mapping chains that
create unintended equivalences.

## SSSOM File Requirements
Every SSSOM file must include:
- curie_map with all used prefixes
- mapping_set_id (globally unique URI)
- license (CC-BY 4.0 recommended)
- subject_source and object_source
- mapping_justification for every mapping (SEMAPV term)

## Outputs
- SSSOM TSV files in mappings/ directory
- Quality assessment reports
- KGCL change files for mapping updates
- Optional: bridge ontology (OWL axioms from mappings)
```

### 3.6 Skill: ontology-validator

**Purpose**: Comprehensive validation and quality assurance across logical, structural, and documentation dimensions.

```markdown
---
name: ontology-validator
description: >
  Comprehensive ontology validation and quality assurance. Runs OWL
  reasoners, SHACL validation, CQ test suites, and ROBOT quality reports.
  Computes quality metrics and generates diff reports. Use when checking
  ontology quality or before committing changes.
disable-model-invocation: false
allowed-tools: Bash, Read
---

# Ontology Validator

## When to Activate
- User mentions "validate", "verify", "check", "quality", or "test"
- After any ontology modification (should be invoked automatically)
- Before commits or releases

## Validation Pipeline

### Level 1: Logical Validation
```bash
# Consistency check
robot reason --reasoner HermiT --input ontology.ttl

# If using ELK (faster for large ontologies):
robot reason --reasoner ELK --input ontology.ttl

# Check for unsatisfiable classes
robot reason --reasoner HermiT --input ontology.ttl \
  --dump-unsatisfiable unsatisfiable.txt
```

If inconsistent:
- Parse reasoner explanation
- Identify conflicting axioms
- Report root cause to user
- Suggest minimal fix

### Level 2: Structural Validation (SHACL)
```bash
pyshacl -s shapes/ontology-shapes.ttl -i rdfs ontology.ttl -f human
```

Standard shapes to check:
- Every class has rdfs:label (minCount 1)
- Every class has skos:definition (minCount 1, severity Warning)
- No orphan classes (every class has a parent)
- Domain/range constraints satisfied

### Level 3: Quality Report (ROBOT)
```bash
robot report --input ontology.ttl \
  --fail-on ERROR \
  --output report.tsv
```

Checks: missing labels, missing definitions, multiple labels,
deprecated term references, annotation whitespace issues.

### Level 4: CQ Tests
```bash
# Run all CQ test queries
robot verify --input ontology.ttl \
  --queries tests/{name}/ \
  --output-dir test-results/

# Or using Python test runner:
python scripts/run_cq_tests.py \
  --ontology ontology.ttl \
  --manifest tests/{name}/cq-test-manifest.yaml \
  --test-data tests/test-abox.ttl
```

### Level 5: Diff Report (for PRs/releases)
```bash
robot diff --left old-version.ttl --right new-version.ttl \
  --format markdown --output diff.md
```

## Quality Metrics Dashboard

| Metric | Target | Command |
|--------|--------|---------|
| Consistency | PASS | `robot reason` |
| Label coverage | 100% | `robot report` |
| Definition coverage | >= 80% | `robot report` |
| CQ test pass rate | 100% (MUST) | `robot verify` |
| SHACL conformance | PASS | `pyshacl` |
| No unsatisfiable classes | 0 | `robot reason` |
| No orphan classes | 0 | SPARQL check |

## Outputs
- Validation report (pass/fail per check)
- Quality metrics summary
- Unsatisfiable class explanations (if any)
- SHACL violation details (if any)
- CQ test results
- Diff report (if comparing versions)
```

### 3.7 Skill: sparql-expert

**Purpose**: Generate, validate, and execute SPARQL queries across different triple store backends.

```markdown
---
name: sparql-expert
description: >
  Expert system for SPARQL 1.1 and SPARQL-star query generation,
  validation, and execution. Handles differences between GraphDB,
  Stardog, Fuseki, and local rdflib graphs. Use when querying
  knowledge graphs or debugging SPARQL.
disable-model-invocation: false
allowed-tools: Bash, Read, Write
---

# SPARQL Expert

## When to Activate
- User mentions "SPARQL", "query", "knowledge graph"
- User wants to extract data from a triple store
- User wants to debug or optimize a query

## Workflow

### 1. Analyze Intent
Determine query type: SELECT, CONSTRUCT, ASK, DESCRIBE
Determine target: local file (rdflib), SPARQL endpoint, or ROBOT query

### 2. Schema Lookup
Read `reference/namespaces.json` for correct prefixes.
If targeting an endpoint, check available named graphs and VoID metadata.

### 3. Draft Query
- Always include PREFIX declarations
- Use LIMIT for exploratory queries (default: 100)
- Add comments for complex patterns
- For RDF-star on GraphDB: embedded triples are NOT asserted by default

### 4. Validate
```bash
python scripts/validate_query.py "QUERY_STRING"
```

### 5. Execute
```bash
# Via ROBOT (local ontology files)
robot query --input ontology.ttl --query query.sparql output.csv

# Via oaklib
runoak -i sqlite:obo:hp query "SELECT ?x ?label WHERE { ?x rdfs:label ?label } LIMIT 10"

# Via SPARQLWrapper (endpoints)
python scripts/execute_query.py --endpoint URL --query query.sparql
```

## RDF-star Guidelines
Read `reference/store-quirks.md` for store-specific syntax.
- GraphDB: `<< :s :p :o >> :metaProp :value .`
- Stardog: Edge Properties syntax (if enabled)
- Remember: match both the asserted triple and the meta-triple

## Performance Tips
- LIMIT for exploration
- Avoid leading wildcards in FILTER regex
- Use property paths sparingly on large graphs
- Check OPTIONAL patterns for Cartesian products
```

### 3.8 Skill: ontology-curator

**Purpose**: Ongoing maintenance, evolution, versioning, and documentation of ontologies.

```markdown
---
name: ontology-curator
description: >
  Manages ontology maintenance, evolution, and versioning. Handles term
  deprecation, KGCL change management, diff generation, documentation
  via WIDOCO, and release workflows. Use when maintaining, updating,
  versioning, or documenting an existing ontology.
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit
---

# Ontology Curator

## When to Activate
- User mentions "deprecate", "obsolete", "version", "release", "maintain"
- User wants to rename, reparent, or restructure terms
- User wants to generate documentation or changelogs

## Workflows

### Term Deprecation (NEVER delete, always deprecate)
```bash
# Via KGCL
runoak -i ontology.ttl apply "obsolete EX:0042"
runoak -i ontology.ttl apply "create synonym 'OBSOLETE old term name' for EX:0042"

# Add replacement pointer
runoak -i ontology.ttl apply "create edge EX:0042 obo:IAO_0100001 EX:0099"
```

Required deprecation metadata:
- `owl:deprecated true`
- `obo:IAO_0000231` (has obsolescence reason)
- `obo:IAO_0100001` (term replaced by)

### Structural Changes via KGCL
```bash
# Rename
runoak -i onto.ttl apply "rename EX:0001 from 'Old Name' to 'New Name'"

# Reparent
runoak -i onto.ttl apply "move EX:0010 from EX:0001 to EX:0002"

# Add synonym
runoak -i onto.ttl apply "create synonym 'Alternative Name' for EX:0001"

# Apply batch changes
runoak -i onto.ttl apply --changes-file changes.kgcl
```

### Version Management
Ontology header must include:
```turtle
<http://example.org/onto> a owl:Ontology ;
    owl:versionIRI <http://example.org/onto/2024-06-01> ;
    owl:versionInfo "2024-06-01" ;
    owl:priorVersion <http://example.org/onto/2024-03-01> .
```

Semantic versioning for ontologies:
- MAJOR: backward-incompatible (removing classes, changing semantics)
- MINOR: backward-compatible additions (new classes/properties)
- PATCH: backward-compatible fixes (label corrections, definition improvements)

### Diff Generation
```bash
robot diff --left old.ttl --right new.ttl --format markdown --output CHANGELOG.md
```

### Release Pipeline
```bash
robot merge --input edit-ontology.ttl \
  --input imports/*.owl \
  --output merged.ttl && \
robot reason --reasoner ELK --input merged.ttl --output reasoned.ttl && \
robot report --input reasoned.ttl --fail-on ERROR && \
robot annotate --input reasoned.ttl \
  --annotation owl:versionInfo "$(date +%Y-%m-%d)" \
  --output release/ontology.ttl && \
robot convert --input release/ontology.ttl --output release/ontology.owl
```

## Outputs
- KGCL change files
- Diff reports (markdown)
- Release artifacts (TTL, OWL, JSON-LD)
- CHANGELOG.md updates
```

---

## 4. MCP Server Configuration

### 4.1 .claude/settings.json

```json
{
  "mcpServers": {
    "sparql-endpoint": {
      "command": "npx",
      "args": ["-y", "mcp-server-sparql",
               "--endpoint", "http://localhost:7200/repositories/ontology-dev"],
      "env": {}
    },
    "ontology-tools": {
      "command": "python",
      "args": ["-m", "mcp_servers.ontology_tools"],
      "cwd": ".",
      "env": {
        "PYTHONPATH": "."
      }
    }
  }
}
```

### 4.2 Custom MCP Server: ontology-tools

A Python MCP server wrapping common ontology operations:

**Exposed Tools:**
| Tool | Description |
|------|-------------|
| `check_consistency` | Run HermiT/ELK reasoner on an ontology file |
| `validate_shacl` | Validate RDF data against SHACL shapes |
| `search_term` | Search for a term across loaded ontologies via oaklib |
| `get_hierarchy` | Get ancestors/descendants of a term |
| `run_robot_report` | Execute ROBOT quality report |
| `validate_sssom` | Validate an SSSOM mapping file |
| `sparql_query` | Execute a SPARQL query against an endpoint or local file |

**Exposed Resources:**
| Resource | Description |
|----------|-------------|
| `ontology://catalog` | List of all ontologies in the workspace |
| `ontology://{name}/classes` | Class hierarchy summary |
| `ontology://{name}/properties` | Property listing |
| `mapping://catalog` | List of all SSSOM mapping files |

---

## 5. Multi-Agent Workflow Patterns

### 5.1 New Ontology Creation Pipeline

```
User: "Create an ontology for musical instruments"

Parent Agent (Orchestrator):
│
├── [SEQUENTIAL] Skill: ontology-requirements
│   Output: CQs, ORSD, pre-glossary, test suite
│
├── [PARALLEL] Two exploration agents:
│   ├── Skill: ontology-scout (search for existing music ontologies)
│   └── Agent: Research BFO alignment for music domain concepts
│   Output: reuse recommendations, alignment plan
│
├── [SEQUENTIAL] Skill: ontology-conceptualizer
│   Input: CQs + scout findings + alignment plan
│   Output: conceptual model, glossary, axiom plan
│
├── [CHECKPOINT: Show user the conceptual model for review]
│
├── [SEQUENTIAL] Skill: ontology-architect
│   Input: approved conceptual model
│   Output: ontology.ttl, shapes.ttl
│
├── [SEQUENTIAL] Skill: ontology-validator
│   Output: validation report (all checks pass)
│
└── Report results to user
```

### 5.2 Ontology Mapping Pipeline

```
User: "Map our disease ontology to MONDO"

Parent Agent (Orchestrator):
│
├── [PARALLEL] Two exploration agents:
│   ├── Agent: Read source ontology, extract all classes with labels/definitions
│   └── Agent: Check MONDO for relevant branches, existing mappings
│
├── [SEQUENTIAL] Skill: ontology-mapper (Workflow 1: Create)
│   Step 1: lexmatch candidate generation
│   Step 2: confidence triage
│   Step 3: LLM verification of uncertain pairs
│   Step 4: validate SSSOM output
│   Step 5: quality report
│
├── [CHECKPOINT: Show mapping summary and uncertain pairs for review]
│
├── [SEQUENTIAL] Apply user corrections, regenerate SSSOM
│
└── Report final mapping statistics
```

### 5.3 Bulk Quality Improvement

```
User: "Improve quality of all ontologies in the workspace"

Parent Agent (Orchestrator):
│
├── [PARALLEL] Per-ontology validation agents:
│   ├── Agent: Validate ontology A (reason, SHACL, report, CQ tests)
│   ├── Agent: Validate ontology B
│   └── Agent: Validate ontology C
│
├── [REDUCE] Collect all validation reports, prioritize issues
│
├── [CHECKPOINT: Show prioritized issue list for approval]
│
├── [SEQUENTIAL] Fix issues in priority order:
│   For each issue:
│   ├── Generate KGCL patch
│   ├── Apply patch
│   ├── Re-validate
│   └── Report fix
│
└── Final quality summary
```

---

## 6. Cross-Platform Compatibility (Codex)

### 6.1 AGENTS.md (Codex CLI)

```markdown
# Ontology Engineering Workspace -- Codex Configuration

## Instructions
This is a Programmatic Ontology Development workspace. All ontology
modifications must go through Python scripts, ROBOT commands, or KGCL
patches. Never hand-edit .owl or .ttl files.

## Tool Strategy
1. ROBOT CLI for build operations
2. oaklib (runoak) for navigation and search
3. KGCL for change proposals
4. Python (owlapy, owlready2, linkml) for complex axioms

## Safety Rules
- Always run `robot reason` after structural changes
- Always run `robot report` before committing
- Never delete terms -- deprecate with owl:deprecated true
- Validate SPARQL syntax before execution
- Check for existing terms before creating new ones

## Workflow
For any ontology modification:
1. Read existing ontology
2. Generate modification script or KGCL patch
3. Execute
4. Validate (reason + report + SHACL)
5. Show diff to user
```

### 6.2 Shared Scripts

Core repository automation scripts are:

```bash
# scripts/build_energy_news.py -- generate ontology artifacts from docs/energy-news/*
python scripts/build_energy_news.py

# scripts/validate_turtle.py -- syntax validation for generated Turtle modules
python scripts/validate_turtle.py \
  ontologies/energy-news/energy-news.ttl \
  ontologies/energy-news/energy-news-reference-individuals.ttl \
  ontologies/energy-news/energy-news-data.ttl \
  ontologies/energy-news/shapes/energy-news-shapes.ttl

# scripts/validate_sssom.py -- SSSOM structural validation
python scripts/validate_sssom.py mappings/example.sssom.tsv
```

---

## 7. Python Environment Setup

### requirements.txt

```
# Core ontology tools
owlapy>=0.1.0
owlready2>=0.46
rdflib>=7.0.0
pyshacl>=0.25.0
linkml>=1.7.0
linkml-runtime>=1.7.0

# Ontology Access Kit
oaklib>=0.6.0

# Mapping tools
sssom>=0.4.0
curies>=0.7.0
prefixmaps>=0.2.0

# SPARQL
SPARQLWrapper>=2.0.0

# Data handling
pandas>=2.0
pyyaml>=6.0

# NER / text processing (optional)
gilda>=1.0.0

# MCP server (if building custom)
mcp>=1.0.0
```

### setup_env.sh

```bash
#!/bin/bash
set -e

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r scripts/requirements.txt

# Install ROBOT CLI
curl -L https://github.com/ontodev/robot/releases/latest/download/robot.jar \
  -o /usr/local/share/robot/robot.jar
curl -L https://raw.githubusercontent.com/ontodev/robot/master/bin/robot \
  -o /usr/local/bin/robot
chmod +x /usr/local/bin/robot

# Verify installations
robot --version
runoak --help
echo "Environment setup complete."
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up workspace directory structure
- [ ] Write CLAUDE.md and AGENTS.md
- [ ] Create Python environment (requirements.txt, setup_env.sh)
- [ ] Implement `ontology-architect` skill (core POD workflow)
- [ ] Implement `ontology-validator` skill (reasoner + SHACL + report)
- [ ] Implement `sparql-expert` skill

### Phase 2: Lifecycle Skills (Week 3-4)
- [ ] Implement `ontology-requirements` skill (CQ methodology)
- [ ] Implement `ontology-conceptualizer` skill (BFO alignment)
- [ ] Implement `ontology-scout` skill (reuse advisor)
- [ ] Implement `ontology-curator` skill (KGCL + versioning)

### Phase 3: Mapping (Week 5-6)
- [ ] Implement `ontology-mapper` skill (SSSOM + lexmatch)
- [ ] Add LLM verification layer for uncertain mappings
- [ ] Add embedding-based matching (SBERT) as optional enhancer
- [ ] Build mapping QA pipeline

### Phase 4: Infrastructure (Week 7-8)
- [ ] Build custom MCP server (ontology-tools)
- [ ] Configure .claude/settings.json
- [ ] Create shared utility scripts
- [ ] Write reference materials for each skill

### Phase 5: Testing & Refinement (Week 9-10)
- [ ] End-to-end test: create a small ontology from scratch
- [ ] End-to-end test: map two existing ontologies
- [ ] Refine SKILL.md instructions based on agent behavior
- [ ] Document lessons learned

---

## 9. Key References

### Methodologies
- Fernandez-Lopez et al. (1997). METHONTOLOGY. AAAI Spring Symposium.
- Suarez-Figueroa et al. (2012). NeOn Methodology. Springer.
- Noy & McGuinness (2001). Ontology Development 101. Stanford KSL.

### Upper Ontologies
- Arp, Smith, Spear (2015). Building Ontologies with BFO. MIT Press.
- ISO/IEC 21838-2:2021 -- Basic Formal Ontology.

### Tools
- Jackson et al. (2019). ROBOT: A Tool for Automating Ontology Workflows. BMC Bioinformatics.
- Matentzoglu et al. (2022). Ontology Development Kit. Database.
- Allemang, Hendler, Gandon (2020). Semantic Web for the Working Ontologist (3rd ed).

### Mapping
- Matentzoglu et al. (2022). SSSOM. Database.
- Jimenez-Ruiz & Grau (2011). LogMap. ISWC.
- He et al. (2022). BERTMap. AAAI.

### Competency Questions
- Gruninger & Fox (1995). CQ Methodology. IJCAI Workshop.
- Wisniewski et al. (2019). CQ Formalization in SPARQL-OWL. J. Web Semantics.

### AI + Ontology
- OBO Academy. Biocuration with Claude Code tutorials.
- Monarch Initiative. Aurelian agents for biocuration.
- sib-swiss/sparql-llm. LLM-enhanced SPARQL generation.
