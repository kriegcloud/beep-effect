# Knowledge Graphs -- Actionable Rules & Guidance

*Extracted from Hogan et al., "Knowledge Graphs" (Synthesis Lectures on Data, Semantics, and Knowledge), Chapters 2-4 and 7.*

---

## 1. Schema, SHACL, and Validation (for ontology-validator)

### OWA vs CWA -- The Fundamental Design Tension

The book establishes two fundamentally different types of schemata:

- **Semantic schemata** (OWL, RDFS): Operate under the **Open World Assumption (OWA)**. Absence of data is not negation. These define meaning -- they tell a reasoner what entailments to draw. They are "high-level" schemata.
- **Validating schemata** (SHACL, ShEx): Operate under a local **Closed World Assumption (CWA)**. They validate specific constraints against the data as-is. They are "ground-level" schemata.

**Actionable rule**: Use BOTH together. OWL for meaning/entailment; SHACL for data quality/validation. They are complementary, not alternatives.

### SHACL Key Concepts

- **Shapes graph** vs **data graph**: Shapes are defined separately from the data they validate.
- **Node shapes** target specific nodes (by class, by IRI pattern, by SPARQL).
- **Property shapes** constrain specific properties on targeted nodes.
- **Severity levels**: `sh:Violation`, `sh:Warning`, `sh:Info` -- use these to categorize issues by urgency.

**Actionable rule**: Define SHACL shapes for every core class in the ontology. At minimum: `sh:minCount 1` for `rdfs:label`, `sh:datatype` for every datatype property, `sh:class` for every object property range.

### Consistency vs. Validity

The book makes a critical distinction:
- **Consistency** = freedom from logical contradictions (ontological entailment). Detected by a reasoner. Measure: count of inconsistencies found, possibly sub-divided by semantic feature.
- **Validity** = freedom from constraint violations (shapes/SHACL). Detected by a shape validator. Measure: count of violations per constraint.

**Actionable rule**: Consistency and validity indicate **different types of issues**. An ontology-defined cardinality restriction that is violated under OWA would NOT cause an inconsistency (under NUNA it infers identity; under UNA it does). But a SHACL shape requiring at-most-one country would produce a validity violation. Run BOTH a reasoner (for consistency) and SHACL validation (for validity).

---

## 2. Ontology Features and Reasoning (for ontology-architect)

### OWL Feature Categories (Ch. 4.1.2, Tables 4.1--4.3)

**Individual features** (Table 4.1):
- **Assertion**: Basic edge/triple. Always use for ground facts.
- **Negation**: Use to explicitly state that a relation does NOT hold. Use sparingly -- only when the absence of a statement could be misinterpreted under OWA.
- **Same as / Different from**: Use `owl:sameAs` to link coreferent entities (identity links). Use `owl:differentFrom` to force distinct interpretation. **Caution**: `owl:sameAs` is transitive and symmetric -- one incorrect sameAs link can cascade and merge unintended entities.

**Property features** (Table 4.2):
- **Sub-property**: Use to create property hierarchies (e.g., `venue subp. of location`).
- **Domain / Range**: Use carefully -- they produce inferences, not constraints. `venue domain Event` means "anything with a venue is inferred to be an Event." Do NOT use as a validation mechanism.
- **Equivalence**: Use when two properties mean the same thing (e.g., `start equiv.p. begins`).
- **Inverse**: Use for bidirectional navigation (e.g., `venue inv.of hosts`).
- **Disjoint properties**: Use when two properties can never relate the same pair (e.g., `venue disj.p. hosts`).
- **Transitive**: Use for part-of, ancestor-of, located-in chains (e.g., `part of type Transitive`).
- **Symmetric**: Use for bidirectional relations like `nearby` (e.g., `nearby type Symmetric`).
- **Asymmetric**: Use for strictly one-directional relations (e.g., `capital type Asymmetric`).
- **Reflexive**: Use when every entity relates to itself (e.g., `part of type Reflexive`).
- **Irreflexive**: Use when no entity can relate to itself (e.g., `flight type Irreflexive`).
- **Functional**: Use for many-to-one relations (e.g., `population type Functional` -- each entity has at most one population value).
- **Inverse Functional**: Use for one-to-many relations where the value uniquely identifies the subject (e.g., `capital type Inv.Functional` -- each capital identifies exactly one country).
- **Key**: Use to define identifying property sets (e.g., `City key lat, long` -- a city is uniquely identified by its coordinates).
- **Chain**: Use for property composition (e.g., `location chain venue, city` -- an event's location is the city of its venue).

**Class features** (Table 4.3):
- **Sub-class**: The backbone of taxonomy (e.g., `City subc.of Place`).
- **Equivalence**: Use for class synonyms or to define a class precisely (e.g., `Human equiv.c. Person`).
- **Disjoint classes**: **Critical for consistency checking.** Declare classes that cannot overlap (e.g., `City disj.c. Region`). Without disjointness, a reasoner cannot detect classification errors.
- **Complement**: Use sparingly. `Dead comp. Alive` means everything is either Dead or Alive.
- **Union**: Use for covering axioms (e.g., `Flight union DomesticFlight, InternationalFlight`).
- **Intersection**: Use for definitions by combining conditions (e.g., `SelfDrivingTaxi inter. Taxi, SelfDriving`).
- **Enumeration** (one-of): Use for small fixed sets (e.g., `EUState one-of Austria, Sweden, ...`).
- **Some values (existential restriction)**: Use to require at least one value of a type (e.g., `EUCitizen prop nationality some EUState`). **Most common restriction type.**
- **All values (universal restriction)**: Use to constrain all values to be of a type (e.g., `Weightless prop has_part all Weightless`). **Caution**: vacuously true if no values exist.
- **Has value**: Pin a specific individual (e.g., `ChileanCitizen prop nationality value Chile`).
- **Has self**: Reflexive on specific property (e.g., `SelfDriving prop driver self true`).
- **Cardinality (min/max/exact)**: Use for numeric constraints (e.g., `Polyglot prop fluent >= 2`).
- **Qualified cardinality**: Cardinality restricted to a class (e.g., `BinaryStarSystem prop body class Star = 2`).

### If-Then vs. If-And-Only-If Semantics (Ch. 4.1.4)

**Critical design decision**:
- **If-then (sub-class)**: `C rdfs:subClassOf D` means "every C is a D" but NOT "every D is a C." One-directional.
- **If-and-only-if (equivalence)**: `C owl:equivalentClass D` means "C and D have exactly the same instances." Bidirectional.

**Actionable rule**: OWL generally applies if-and-only-if semantics for richer entailment. Use `rdfs:subClassOf` for taxonomy. Use `owl:equivalentClass` only when you truly mean definitional equality (necessary AND sufficient conditions).

### Reasoning Strategies (Ch. 4.2)

**The undecidability problem**: Full OWL entailment (all features of Tables 4.1--4.3) is undecidable. Three practical strategies:

1. **Incomplete but sound reasoning** (may miss entailments, never produces false ones). Uses rules. Useful when data is incomplete and having some entailments is better than none. Scalable.

2. **Complete and sound but restricted** (always correct, always halts, but limits which OWL features you can use). Uses Description Logic profiles. Use when correctness matters (medical, legal).

3. **Complete but may not halt** (correct when it answers, but might run forever). Uses FOL theorem provers. Rarely practical.

**Actionable rule**: For most ontology engineering, use strategy (1) for large-scale data with RDFS/OWL RL rules, and strategy (2) with OWL DL profiles for formal ontology validation.

### Description Logic Profiles (Ch. 4.2.2)

**Base DL: ALC** (Attributive Language with Complement): atomic classes, top/bottom, intersection, negation, existential/universal restrictions, relation/class assertions.

Extensions:
- **S** = ALC + transitive closure
- **H** = relation inclusion (sub-properties)
- **R** = complex relation inclusion, reflexivity, irreflexivity, disjointness
- **O** = nominals (enumerated classes)
- **I** = inverse relations
- **F** = functional properties
- **N** = number restrictions
- **Q** = qualified number restrictions

**OWL 2 DL corresponds roughly to SROIQ.**

**OWL 2 Profiles** (restricted for tractability):
- **OWL 2 EL**: Designed for large biomedical ontologies (e.g., SNOMED CT). Polynomial-time reasoning. Supports existentials but not universals or negation.
- **OWL 2 QL**: Designed for query rewriting over relational databases. Very fast queries but limited expressivity. Good for data-heavy, ontology-light scenarios.
- **OWL 2 RL**: Designed for rule-based reasoning. Can be implemented with forward-chaining rules. Good balance of expressivity and scalability.

**Actionable rules for profile selection**:
- Use **OWL 2 EL** when: large class hierarchies (1000s of classes), biomedical domain, need polynomial reasoning, can live without negation/universals.
- Use **OWL 2 QL** when: ontology is lightweight, data is in relational databases, primary use is SPARQL query answering.
- Use **OWL 2 RL** when: need rule-based materialization, moderate expressivity, scalable forward-chaining.
- Use **OWL 2 DL (SROIQ)** when: need full expressivity, ontology is moderate-sized, correctness is paramount (medical, legal).

---

## 3. Quality Dimensions (for quality-checklist and validator)

The book defines a comprehensive quality framework (Ch. 7) organized into four top-level clusters:

### 3.1 ACCURACY

Three sub-dimensions:

**Syntactic Accuracy**: Data conforms to the grammatical rules of the domain/data model.
- **What to check**: Datatype values match declared ranges (e.g., `start` property has valid `xsd:dateTime`, not a bare string like "March 22, 2019").
- **Metric**: Ratio of invalid values to total values per property.
- **Tool mapping**: `robot report` detects many syntactic issues. SHACL `sh:datatype` constraints catch type mismatches.
- **Actionable rule**: Define `sh:datatype` constraints for every datatype property in SHACL shapes. Run validation tools (Jena, `robot report`) to catch malformed literals.

**Semantic Accuracy**: Data values correctly represent real-life phenomena.
- **What to check**: Values are factually correct (e.g., start date is before end date, venues are real places). Harder to automate.
- **Metric**: Precision measured against external sources or gold standards.
- **Tool mapping**: Cross-reference with external KGs (Wikidata, DBpedia). Shape-based validation can catch some cases (e.g., start < end).
- **Actionable rule**: Write SHACL `sh:sparql` constraints for semantic validation rules (e.g., start date before end date). Cross-validate key facts against trusted external sources.

**Timeliness**: Data is kept up-to-date with the real-world state.
- **What to check**: Temporal values are current, not stale. Events from years ago should not dominate a "current events" graph.
- **Metric**: Frequency of updates, temporal annotations, comparison with source update frequency.
- **Actionable rule**: Include `dcterms:modified` on ontology and key resources. Define freshness thresholds per class. Flag entities not updated within threshold.

### 3.2 COVERAGE

Two sub-dimensions:

**Completeness**: All required information is present.
Four aspects:
- **(i) Schema completeness**: All expected classes and properties of the schema are represented in the data.
- **(ii) Property completeness**: Ratio of missing values for a specific property (e.g., what fraction of events lack a venue?).
- **(iii) Population completeness**: Percentage of real-world entities of a type that are represented (e.g., what fraction of Chilean cities are in the graph?).
- **(iv) Linkability completeness**: Degree to which instances are interlinked (connected rather than isolated).

**Metric**: Comparison against an ideal/gold-standard knowledge graph or completeness statements.
**Tool mapping**: SHACL `sh:minCount` catches property incompleteness. SPARQL queries can measure population completeness against known counts.
**Actionable rule**: For each class, define minimum required properties in SHACL shapes with `sh:minCount 1`. Write SPARQL competency questions that test for expected populations.

**Representativeness**: The data is not systematically biased.
- **What to check**: Geographic bias (over-representation of certain regions), linguistic bias (labels only in dominant languages), social bias (under-representation of demographics).
- **Metric**: Compare distributions in the KG against known real-world distributions (population densities, linguistic demographics).
- **Actionable rule**: Run distribution analysis queries (count by geographic region, by language, by type) and compare against expected distributions. Flag significant skew.

### 3.3 COHERENCY

Two sub-dimensions:

**Consistency**: Freedom from logical contradictions.
- **What to check**: No individual is an instance of two disjoint classes. No functional property has multiple values for the same subject. No `owl:differentFrom` pair is also linked by `owl:sameAs`.
- **Metric**: Count of inconsistencies found, sub-divided by ontological feature.
- **Tool mapping**: `robot reason --reasoner HermiT` for full DL consistency. `robot report` for common issues.
- **Actionable rule**: Always declare disjoint classes -- without them, reasoners cannot find classification errors. Run `robot reason` after every structural change.

**Validity**: Freedom from constraint violations (SHACL).
- **What to check**: All targeted nodes satisfy their shape constraints.
- **Metric**: Count of violations per constraint.
- **Tool mapping**: `pyshacl` or ROBOT SHACL validation.
- **Actionable rule**: A straightforward measure of validity is to count the number of violations per constraint. Run SHACL validation as a CI gate.

### 3.4 SUCCINCTNESS

Three sub-dimensions:

**Conciseness**: Avoiding irrelevant schema elements and data.
- **Intensional conciseness** (schema level): No redundant properties, classes, shapes.
- **Extensional conciseness** (data level): No redundant entities or relations.
- **Metric**: Ratio of relevant vs. total schema elements/entities.
- **Actionable rule**: Audit schema for unused classes/properties. Remove or deprecate schema elements that have zero instances. Ensure each property/class serves a distinct purpose.

**Representational Conciseness**: Content is compactly represented.
- **What to check**: No duplicate properties serving the same purpose (`category` vs. `type`), no duplicate nodes for the same entity, no unnecessary reification, no linked-lists when order is unimportant, no derived values that can be computed (e.g., `duration` when `start` and `end` exist).
- **Metric**: Number of redundant nodes.
- **Actionable rule**: Do not model derived/computable values as properties. Prefer direct attachment over reification unless provenance metadata is needed. Use `owl:sameAs` consolidation to merge duplicate nodes.

**Understandability**: Data can be interpreted without ambiguity.
- **What to check**: Every entity has an `rdfs:label`, entities have descriptions (`rdfs:comment` or `skos:definition`), labels are unique or disambiguated, multilingual labels exist where needed.
- **Metric**: Ratio of nodes with human-readable labels and descriptions. Uniqueness of labels.
- **Actionable rule**: Require `rdfs:label` and `skos:definition` on all classes and properties. Provide `skos:altLabel` for synonyms. Add `rdfs:comment` with disambiguating descriptions for entities with common names.

---

## 4. SPARQL Patterns (for sparql-expert)

### Basic Graph Patterns (Ch. 2.2.1)

- A basic graph pattern (BGP) uses the same data model as the data graph being queried, with variables prefixed by `?`.
- BGP evaluation produces mappings (variable bindings) from the pattern's variables to constants in the graph.
- **Semantics**: SPARQL uses **homomorphism-based semantics** (two variables can map to the same node). Cypher uses isomorphism-based on edges.
- **Actionable rule**: Be aware that SPARQL BGPs can return duplicate-like results where multiple variables map to the same constant. Use `FILTER(?x != ?y)` when you need distinct bindings.

### Complex Graph Patterns (Ch. 2.2.2)

Complex patterns are built from basic patterns using relational algebra operators:
- **Projection** (SELECT): Choose which variables appear in results.
- **Selection** (FILTER): Filter rows by condition.
- **Join** (natural join via shared variables): Combine results from two BGPs.
- **Union** (UNION): Results from either BGP.
- **Difference** (MINUS): Results from first BGP not in second.
- **Left-join** (OPTIONAL): Include results from first BGP even when second has no match.

**Actionable rules**:
1. Use **OPTIONAL** when a property may or may not exist (open-world data). Never assume all triples exist.
2. Use **MINUS** rather than NOT EXISTS when you want to exclude based on a full pattern match (not just existence).
3. Duplicates arise from bag semantics by default. Use **DISTINCT** to enforce set semantics when needed.

### Navigational Graph Patterns (Ch. 2.2.3)

- **Property paths**: Regular expressions over edge labels. Base is a constant (edge label), extended with:
  - `r*` (Kleene star: zero or more)
  - `r1 | r2` (disjunction: either path)
  - `r1 . r2` (concatenation: sequential)
  - `r-` (inverse: reverse direction) -- 2-way path expressions

**Actionable rules**:
1. Use property paths for **transitive traversal** of hierarchies: `?x rdfs:subClassOf* ?y` finds all ancestors.
2. Use `(bus|flight)` for disjunctive paths.
3. Use `(venue/city)` for chained property navigation.
4. Use `^` (inverse) for reverse traversal: `?child ^rdfs:subClassOf ?parent` = `?parent rdfs:subClassOf ?child`.
5. Be cautious with `*` (Kleene star) on cyclic graphs -- it always terminates in SPARQL but may produce large result sets.

### Other Query Features (Ch. 2.2.4)

- Aggregation: `GROUP BY`, `COUNT`, `SUM`, `AVG`, etc.
- Datatype operators: date extraction, string functions.
- Federation: `SERVICE` for querying remote endpoints.
- Entailment: Queries can operate over inferred triples (if supported).

---

## 5. Identity and Naming (for naming-conventions)

### Persistent Identifiers (Ch. 3.2.1)

- **Naming clashes**: Using ambiguous local identifiers (e.g., bare "Santiago") causes problems when merging graphs -- two different real-world entities get conflated.
- **Solution**: Use globally-unique persistent identifiers (PIDs). Examples: DOIs for papers, ORCID iDs for authors, ISBNs for books, Alpha-2 codes for countries.
- **IRIs over URLs**: RDF uses IRIs (Internationalized Resource Identifiers) rather than URLs. IRIs identify **non-information resources** (the city itself), while URLs identify **information resources** (the webpage about the city).

**Actionable rules**:
1. Always use IRIs based on a namespace you control (e.g., `http://turismo.cl/entity/`).
2. Use PURL services to make IRIs persistent even if server locations change.
3. Distinguish the entity IRI from the document URL.
4. In OBO-style ontologies, use CURIE patterns: `obo:BFO_0000001` rather than human-readable IRIs. This avoids linguistic bias and persistence issues.

### Lexicalization (Ch. 3.2.4)

The book makes a crucial distinction between **identifiers** and **labels**:
- Identifiers (IRIs) are for machines. They need not be human-readable.
- Labels (`rdfs:label`) are for humans. They provide the human-readable name.

**Actionable rules**:
1. Prefer **opaque identifiers** over human-readable IRIs for persistence and language neutrality.
2. Always provide `rdfs:label` for every entity.
3. Provide labels in multiple languages using language tags: `rdfs:label "City"@en`, `rdfs:label "Ciudad"@es`.
4. Use `skos:altLabel` for synonyms and aliases.
5. Use `rdfs:comment` or `skos:definition` with disambiguating descriptions.

### External Identity Links (Ch. 3.2.2)

- Use `owl:sameAs` to link coreferent entities across graphs.
- `owl:sameAs` is transitive: if local:Santiago sameAs wikidata:Q2887 and wikidata:Q2887 sameAs geo:SantiagoDeChile, then local:Santiago sameAs geo:SantiagoDeChile.

**Actionable rule**: Before using `owl:sameAs`, verify that the entities truly refer to the same thing. Incorrect sameAs links propagate through transitivity and corrupt entire graphs.

### Datatypes (Ch. 3.2.3)

- Use XSD datatypes: `xsd:dateTime`, `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:boolean`.
- Datatype nodes (literals) cannot have outgoing edges in RDF.
- If datatype is omitted, `xsd:string` is assumed.

**Actionable rule**: Always explicitly declare datatypes in ontology property definitions (ranges) and in SHACL shapes (`sh:datatype`). Never leave datatype implicit.

### Existential Nodes / Blank Nodes (Ch. 3.2.5)

- Blank nodes represent "something exists but we do not know its identity."
- They complicate graph isomorphism checking and can obscure data.
- Skolemization (replacing blank nodes with canonical URIs) is preferred.

**Actionable rule**: Minimize blank node usage. When they are needed (e.g., RDF lists, restrictions), consider skolemizing them for better interoperability.

---

## 6. Publication and FAIR (for ontology-curator)

### FAIR Principles (Ch. 9.1.1)

**Findability**:
- **F1**: (Meta)data are assigned a globally unique and persistent identifier.
- **F2**: Data are described with rich metadata (see R1).
- **F3**: Metadata explicitly include the identifier of the data they describe.
- **F4**: (Meta)data are registered or indexed in a searchable resource.

**Accessibility**:
- **A1**: (Meta)data are retrievable by their identifier via a standard protocol.
  - A1.1: The protocol is open, free, and universally implementable.
  - A1.2: The protocol uses authentication and authorization if suitable.
- **A2**: Metadata are accessible, even when the data are no longer available.

**Interoperability**:
- **I1**: (Meta)data use an accessible, agreed-upon, and general knowledge representation formalism.
- **I2**: (Meta)data use vocabularies that follow FAIR principles.
- **I3**: (Meta)data include qualified references to other (meta)data.

**Reusability**:
- **R1**: Meta(data) are richly described with accurate and relevant attributes.
  - R1.1: (Meta)data are released with a clear and accessible license.
  - R1.2: (Meta)data are associated with detailed provenance.
  - R1.3: (Meta)data meet domain-relevant community standards.

**Actionable FAIR checklist for ontology-curator**:

| Principle | Ontology Action | Tool/Vocabulary |
|-----------|----------------|-----------------|
| F1 | Assign a persistent IRI (PURL) to the ontology | PURL services, w3id.org |
| F2 | Include rich metadata (title, description, creators, version, license) | `dcterms:`, `owl:versionInfo` |
| F3 | Metadata includes ontology IRI | `owl:Ontology` declaration |
| F4 | Register in ontology repositories | OBO Foundry, BioPortal, OLS |
| A1 | Serve ontology via HTTP content negotiation | Apache/.htaccess, w3id.org redirects |
| A1.1 | Use HTTP/HTTPS | Standard web serving |
| A2 | Keep metadata accessible even if ontology is retired | Registry metadata persists |
| I1 | Use OWL 2 (W3C standard) | OWL, RDFS |
| I2 | Reuse standard vocabularies (BFO, RO, IAO, SKOS, DC) | Import statements |
| I3 | Include cross-references to other ontologies | `rdfs:seeAlso`, `skos:exactMatch` |
| R1 | Provide labels, definitions, examples for all terms | `rdfs:label`, `skos:definition`, `skos:example` |
| R1.1 | Declare license in ontology metadata | `dcterms:license` |
| R1.2 | Record provenance (creators, dates, sources) | `dcterms:creator`, `dcterms:created`, PROV-O |
| R1.3 | Follow OBO Foundry principles or domain conventions | OBO conventions, BFO alignment |

### Linked Data Principles (Ch. 9.1.2)

The four Linked Data Principles (Berners-Lee, 2006):

1. **Use IRIs as names for things.**
2. **Use HTTP IRIs** so those names can be looked up.
3. **When an HTTP IRI is looked up, provide useful content** about the entity using standard data formats (RDF, JSON-LD).
4. **Include links to the IRIs of related entities** in the content returned.

**Actionable rules**:
1. Every ontology term must have a dereferenceable HTTP IRI.
2. Ontology files must be served with proper content negotiation (Turtle for machines, HTML for humans).
3. Every class/property definition should link to related terms in external ontologies (via `rdfs:seeAlso`, `skos:closeMatch`, `skos:exactMatch`).
4. Publish "diffs" between versions to reduce bandwidth for consumers maintaining local copies.

---

## Summary of Key Cross-Cutting Insights

1. **OWA vs. CWA is the fundamental design tension.** Semantic schemata (OWL) operate under OWA (open world -- absence of data is not negation). Validating schemata (SHACL) operate under a local CWA (closed world for specific constraints). Use both together. This is not an either/or choice.

2. **Consistency is not validity.** A reasoner checks logical consistency (no contradictions in the ontology). A shape validator checks data validity (conformance to constraints). Both are needed, and they catch different problems.

3. **Domain and range are inference mechanisms, not constraints.** Never use `rdfs:domain`/`rdfs:range` to "validate" data. They produce inferences (classification of instances), not violations. Use SHACL for validation.

4. **Disjoint classes are essential for quality.** Without disjointness axioms, a reasoner has no basis to detect classification errors. Always declare disjointness where it exists.

5. **Profile selection determines what you can reason about and at what cost.** Choose OWL 2 EL for large biomedical hierarchies, OWL 2 QL for query-centric scenarios, OWL 2 RL for rule-based materialization, full OWL 2 DL for maximum expressivity at higher cost.

6. **Opaque identifiers + rich labels is the optimal naming strategy.** Use language-neutral, persistent, opaque IRIs for identification. Use `rdfs:label`, `skos:definition`, `skos:altLabel` for human consumption.

7. **Quality has four clusters (Accuracy, Coverage, Coherency, Succinctness), each with measurable sub-dimensions.** Every quality dimension maps to specific validation tools and SPARQL queries.
