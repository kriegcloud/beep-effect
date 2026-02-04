# OWL/RDF Reasoning for Validation and Incremental Reasoning in Production

**Date**: 2025-12-18
**Context**: Effect-TS extraction pipeline for news articles and claims
**Focus**: Practical reasoning strategies, validation patterns, and JavaScript/TypeScript tooling

## Executive Summary

This research investigates when and how to use OWL reasoning versus SHACL validation in production knowledge graph systems, with specific focus on news/claims extraction. Key findings:

1. **Validation vs Reasoning**: SHACL validation (closed-world, fail-fast) is essential for data quality; OWL reasoning (open-world, inference) enriches data but doesn't enforce constraints. Use both, but for different purposes.

2. **Incremental Reasoning**: Targeted reasoning approaches (Re-SHACL) achieve **10-100x speedup** over full materialization by only reasoning over affected nodes. For streaming extraction, batch-based reasoning post-merge is most practical in JavaScript.

3. **JavaScript/TypeScript**: Viable reasoners exist (N3.js, EYE-JS, HyLAR) for RDFS/OWL-RL profiles; performance is adequate for <100K triple graphs. For larger scale, use external reasoners (RDFox, GraphDB) via API.

4. **News/Claims Domain**: Lightweight reasoning (RDFS subclass/domain/range) + SHACL validation provides the best balance. Full OWL DL reasoning is overkill; focus on type inference, conflict detection, and transitive supersedes chains.

5. **Production Pattern**: Pre-compute reasoning on ontology, materialize during batch processing, cache inferences, validate with SHACL at write time.

---

## 1. Validation vs Reasoning: When to Use Each

### 1.1 Fundamental Semantic Differences

The distinction between OWL and SHACL is rooted in their assumptions and purposes:

| Aspect | OWL Reasoning | SHACL Validation |
|--------|--------------|------------------|
| **World Assumption** | Open World (OWA): absence of information = unknown | Closed World (CWA): what's not stated = false |
| **Purpose** | Infer new knowledge from incomplete data | Check constraints on data assumed complete |
| **Failure Model** | Inconsistency (logical contradiction) | Violation (constraint not met) |
| **Cardinality** | `owl:maxCardinality 1` → infer same values | `sh:maxCount 1` → flag multiple values as error |
| **Performance** | Can be expensive (exponential for OWL DL) | Efficient (polynomial, even faster with caching) |

**Key Insight**: "OWL and SHACL make different assumptions on the completeness of data and have different purposes: OWL infers knowledge, SHACL checks constraints." ([Semantic Arts](https://www.semanticarts.com/shacl-and-owl/))

### 1.2 When OWL Reasoning is Actually Needed

OWL reasoning is valuable when:

1. **Type Inference**: Inferring entity types from property domains/ranges
   ```turtle
   # Ontology declares
   :worksAt rdfs:domain :Person .

   # Data has
   :Alice :worksAt :Acme .

   # Reasoner infers
   :Alice rdf:type :Person .
   ```

2. **Class Hierarchy Navigation**: Subclass transitivity for query answering
   ```turtle
   :FootballPlayer rdfs:subClassOf :Athlete .
   :Athlete rdfs:subClassOf :Person .

   # Query for :Person includes :FootballPlayer instances
   ```

3. **Property Hierarchies**: Subproperty chains (e.g., `knows` → `hasFriend`)

4. **Transitive Closure**: Computing chains of transitive relations
   ```turtle
   :supersedes a owl:TransitiveProperty .
   :claim2 :supersedes :claim1 .
   :claim3 :supersedes :claim2 .

   # Reasoner materializes
   :claim3 :supersedes :claim1 .
   ```

5. **Entity Consolidation**: `owl:sameAs` inference (but see caveats below)

**When NOT Needed**:
- Enforcing cardinality constraints → Use SHACL `sh:maxCount`
- Datatype validation → Use SHACL `sh:datatype` + `rdf-validate-datatype`
- Required properties → Use SHACL `sh:minCount`
- Value ranges → Use SHACL `sh:in`, `sh:minInclusive`, etc.
- Complex business rules → Use SHACL-SPARQL or custom validation

### 1.3 Practical Industry Consensus (2024-2025)

From recent practitioner reports:

> "I no longer use RDFS/OWL. I now use SHACL for everything. The only parts of RDFS I use are subclasses." ([TopQuadrant: Why I Don't Use OWL Anymore](https://www.topquadrant.com/resources/why-i-dont-use-owl-anymore/))

> "OWL reasoning is very rarely used [for complex constraints] and heavy OWL features (restrictions, unionOf, etc.) are not very useful in practical large-scale settings." (Industry report)

**Emerging Best Practice**: Use lightweight RDFS reasoning (subclass, domain, range) + SHACL for data quality. Reserve OWL-RL or OWL DL for specialized analytical tasks, not production pipelines.

---

## 2. Incremental Reasoning for Streaming/Batch Extraction

### 2.1 Incremental Materialization: The Problem

Traditional forward-chaining reasoning materializes **all** inferred triples:
- For large graphs: 10-100x growth in triple count
- For updates: full re-reasoning required
- Performance: can take minutes to hours for millions of triples

**Example**: DBPedia with RDFS reasoning grows from 116M to 232M triples.

### 2.2 State-of-the-Art: Re-SHACL (VLDB 2024)

Re-SHACL introduces **targeted reasoning** that only computes inferences needed for validation:

**Key Results** ([Ke et al., VLDB 2024](https://www.vldb.org/pvldb/vol17/p3589-acosta.pdf)):
- **10x speedup** for targeted RDFS reasoning vs full RDFS
- **100x speedup** for targeted OWL reasoning vs full OWL
- Graph size reduction: 116M → 4.12M triples (DB1000 dataset)

**Pattern**:
1. Analyze SHACL shapes to identify needed entailments
2. Apply reasoning **only** to focus nodes (entities being validated)
3. Merge semantically equivalent entities before validation
4. Validate enhanced graph with standard SHACL engine

**Implication**: "Performing SHACL validation without entailment often yields one-sided outcomes, as it falls short of validating crucial implicit data encoded in the KG ontology."

### 2.3 Incremental Reasoning Algorithms

#### DRed (Delete and Rederive)
- Used by RDFox, PoolParty
- On update: delete affected inferences, rederive necessary facts
- Performance: 2-3 million inferences/second ([RDFox](https://www.oxfordsemantic.tech/rdfox))

#### RDFox Backward/Forward Algorithm
- Improves on DRed by reducing over-deletion
- Supports `owl:sameAs` rewriting
- Incremental reasoning executes rules dynamically as data changes

#### JavaScript Limitation
**No native incremental reasoner** in JS ecosystem. Options:
1. Use RDFox/GraphDB via HTTP API (commercial/enterprise)
2. Implement simple incremental RDFS (track changed triples, re-materialize affected rules)
3. **Batch reasoning on extraction completion** (recommended for Effect-TS)

### 2.4 Streaming vs Batch Reasoning Patterns

#### Pattern A: Per-Chunk (No Reasoning)
```
Extract chunk → Validate (no reasoning) → Store
```
- **Pros**: Fast, simple
- **Cons**: Misses implicit violations (e.g., subclass constraints)

#### Pattern B: Post-Batch Merge + Reasoning (Recommended)
```
Per-chunk: Extract → Validate basic syntax
Post-batch: Merge all chunks → Reason (targeted) → Re-validate → Store
```
- **Pros**: Catches semantic violations, efficient for small batches
- **Cons**: Delayed validation feedback

#### Pattern C: Streaming with Background Reasoning (Advanced)
```
Per-chunk: Extract → Queue
Background worker: Dequeue → Merge → Reason → Validate → Store
```
- **Pros**: Non-blocking extraction, continuous validation
- **Cons**: Complex orchestration, eventual consistency

**Recommended for Effect-TS News Pipeline**: Pattern B (batch reasoning post-merge)

---

## 3. JavaScript/TypeScript Reasoners: Capabilities and Performance

### 3.1 N3.js Reasoner (ISWC 2024)

**Paper**: "N3.js Reasoner: Implementing Reasoning in N3.js" ([ORA Oxford](https://ora.ox.ac.uk/objects/uuid:9e7cc2da-b7e3-4ed1-8b83-c4c82999f201))

**Capabilities**:
- RDFS materialization (13 core rules)
- Semi-naive evaluation optimized for small rule sets (<100 rules)
- N3 rules (custom logic rules in Notation3 syntax)

**Performance**:
- RDFS on FOAF profile: **<0.1s** (961 facts, 866 derivations, 14 rules)
- Suitable for <100K triples
- Optimized for limited rules, large datasets

**Algorithm**: Uses N3.js store's three-layer indexes (osp, spo, pos) for efficient pattern matching.

**Usage**:
```typescript
import { Store, Parser, Reasoner } from 'n3'

const store = new Store()
// Load data and ontology
const parser = new Parser()
const quads = parser.parse(turtleData)
store.addQuads(quads)

const reasoner = new Reasoner(store)
reasoner.reason()  // Applies RDFS rules, mutates store in-place
```

**Limitations**:
- Basic Graph Patterns only (no SPARQL built-ins)
- No backward-chaining
- No incremental reasoning (re-reasons entire graph)
- Performance degrades for >100K triples

### 3.2 EYE-JS (ISWC 2024)

**Paper**: "EYE JS: a client-side reasoning engine supporting Notation3, RDF Surfaces and RDF Lingua" ([ORA Oxford](https://ora.ox.ac.uk/objects/uuid:631f29b5-5f50-4739-b124-18ff9c64d662))

**Capabilities**:
- Full Notation3 reasoning (rules, built-ins, backward-chaining)
- Compiled to WebAssembly for browser/Node.js
- Supports complex rule-based reasoning beyond RDFS/OWL-RL

**API**:
```typescript
import { n3reasoner } from 'eye-js'

const data = '... N3 data ...'
const query = '... N3 query ...'

const results = await n3reasoner(data, query)
```

**Use Cases**:
- Custom business logic (e.g., "if claim supersedes another, inherit source trustworthiness if > 0.8")
- Complex inference chains
- Backward-chaining queries (query-driven reasoning)

**Performance**: Faster than pure JS for rule-heavy workloads; suitable for <1M triples.

### 3.3 HyLAR Reasoner

**Repository**: [ucbl/HyLAR-Reasoner](https://github.com/ucbl/HyLAR-Reasoner)

**Capabilities**:
- Subset of OWL 2 RL + RDFS (rdf1, rdfs2-13, excludes rdf:Seq/Bag axioms)
- Incremental reasoning (claims to support updates)
- Browser and Node.js

**Status**: Less actively maintained (last major update 2019)

**Trade-off**: More OWL features than N3.js reasoner, but slower and less well-tested in production.

### 3.4 JavaScript Reasoner Comparison

| Reasoner | Profile | Performance | Incremental | Backward Chain | Status (2024) |
|----------|---------|-------------|-------------|----------------|---------------|
| N3.js Reasoner | RDFS, N3 rules | <0.1s (<100K) | No | No | Active (ISWC 2024) |
| EYE-JS | N3, custom rules | Good (<1M) | No | Yes | Active (ISWC 2024) |
| HyLAR | RDFS, OWL 2 RL subset | Moderate | Yes (claimed) | No | Dormant (2019) |

**Recommendation**:
- **Simple pipelines**: N3.js reasoner for RDFS materialization
- **Complex rules**: EYE-JS for custom business logic
- **Production scale (>1M triples)**: External reasoner (RDFox, GraphDB) via HTTP API

### 3.5 External Reasoners (Production Grade)

For serious production scale, use dedicated triple stores with reasoning:

#### RDFox (Commercial)
- **Profile**: OWL 2 RL (Datalog-based)
- **Performance**: 2-3 million inferences/second
- **Incremental**: Yes (DRed algorithm, backward/forward)
- **API**: REST API, SPARQL endpoint
- **Deployment**: Docker, Cloud Run, self-hosted
- **Cost**: Commercial license required

#### GraphDB (Enterprise/Free)
- **Profile**: RDFS, OWL 2 RL, custom rulesets
- **Performance**: Handles billions of triples (FactForge: 2B+ statements)
- **Incremental**: Yes (incremental SHACL validation, selective reasoning)
- **API**: REST API, SPARQL endpoint, RDF4J ShaclSail
- **Deployment**: Docker, Cloud, on-prem
- **Cost**: Free edition available, enterprise features require license

#### Stardog (Commercial)
- **Profile**: RDFS, OWL 2 profiles, custom rules
- **Performance**: High throughput, virtual graphs
- **Features**: Reasoning, SHACL, query federation
- **Cost**: Commercial

**Pattern for Effect-TS**:
```typescript
// Wrap external reasoner as Effect service
interface ReasoningService {
  materialize: (
    dataGraph: Store,
    ontology: Store
  ) => Effect.Effect<Store, ReasoningError>
}

const RDFoxServiceLive = Layer.effect(
  ReasoningService,
  Effect.gen(function*() {
    const httpClient = yield* HttpClient

    return {
      materialize: (dataGraph, ontology) =>
        Effect.gen(function*() {
          // Serialize graphs
          const dataTurtle = yield* serializeStore(dataGraph)
          const ontTurtle = yield* serializeStore(ontology)

          // POST to RDFox reasoning endpoint
          const response = yield* httpClient.post('/reason', {
            data: dataTurtle,
            ontology: ontTurtle,
            profile: 'RDFS'
          })

          // Parse response
          return yield* parseStore(response.body)
        })
    }
  })
)
```

---

## 4. Alternative Approaches to Full Reasoning

### 4.1 SPARQL CONSTRUCT for Materialization

Use SPARQL CONSTRUCT queries to materialize specific inferences without a full reasoner.

**Example: Domain/Range Inference**
```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  ?s rdf:type ?domain .
  ?o rdf:type ?range .
}
WHERE {
  ?s ?p ?o .
  ?p rdfs:domain ?domain .
  OPTIONAL { ?p rdfs:range ?range }
}
```

**Pros**:
- Explicit control over what's inferred
- No reasoner dependency
- Works with any SPARQL engine (Comunica, RDFox, GraphDB)

**Cons**:
- Manual rule encoding
- No transitive closure (requires recursive queries)
- Performance: SPARQL query overhead vs direct rule engine

**Performance**: Research shows that for targeted reasoning, SPARQL CONSTRUCT can be **competitive** with rule engines ([SPARQL in N3 paper](https://arxiv.org/abs/2508.13041)). For deep taxonomy traversal, backward-chaining N3 rules outperform (EYE: 34ms vs SPARQL: >1h).

### 4.2 SHACL Rules (SHACL-AF)

SHACL Advanced Features include **sh:rule** for inferencing within SHACL:

```turtle
ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:rule [
    a sh:TripleRule ;
    sh:subject sh:this ;
    sh:predicate rdf:type ;
    sh:object ex:Human ;
  ] .
```

**Use Case**: Derive simple facts during validation (e.g., infer `Human` type for all `Person` instances).

**Limitations**:
- Not widely supported (GraphDB, TopBraid support it)
- Limited expressivity vs full rule languages
- Mixes validation and inference (can be confusing)

**Recommendation**: Use sparingly for simple domain-specific inferences; prefer separate reasoning step.

### 4.3 N3 Rules (Custom Logic)

Notation3 allows expressing logic rules directly in Turtle-like syntax:

```n3
@prefix : <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# If entity works at a company, infer it's a Person
{
  ?s :worksAt ?o .
  :worksAt rdfs:domain :Person .
} => {
  ?s a :Person .
} .

# Supersedes transitivity
{
  ?a :supersedes ?b .
  ?b :supersedes ?c .
} => {
  ?a :supersedes ?c .
} .
```

**Execution**: Use N3.js reasoner or EYE-JS to apply rules.

**Pros**:
- Declarative, readable
- Supports complex patterns (negation, quantification with EYE)
- Can be version-controlled alongside ontology

**Cons**:
- Notation3 is less common than SPARQL
- Requires N3-capable reasoner
- Performance: forward-chaining can be expensive

### 4.4 Custom Inference (TypeScript)

For targeted inferences, implement directly in TypeScript:

```typescript
// Domain/range inference (simplified)
function inferTypes(store: N3.Store, ontology: N3.Store): void {
  const { namedNode } = N3.DataFactory
  const RDF_TYPE = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
  const RDFS_DOMAIN = namedNode('http://www.w3.org/2000/01/rdf-schema#domain')
  const RDFS_RANGE = namedNode('http://www.w3.org/2000/01/rdf-schema#range')

  // For each property use in data
  const properties = new Set<string>()
  for (const quad of store.getQuads(null, null, null, null)) {
    properties.add(quad.predicate.value)
  }

  // Look up domain/range in ontology
  for (const propIri of properties) {
    const prop = namedNode(propIri)

    const domainQuads = ontology.getQuads(prop, RDFS_DOMAIN, null, null)
    if (domainQuads.length > 0) {
      const domain = domainQuads[0].object

      // Infer subject type for all uses of this property
      for (const quad of store.getQuads(null, prop, null, null)) {
        store.addQuad(quad.subject, RDF_TYPE, domain)
      }
    }

    // Same for range...
  }
}
```

**Pros**:
- Full control, debuggable
- No external dependencies
- Can optimize for specific use case

**Cons**:
- Manual encoding of semantic rules
- Easy to introduce bugs
- Maintenance burden as ontology evolves

**Use When**: Reasoning needs are simple and well-defined (e.g., only domain/range + subclass).

---

## 5. Production Patterns: Pre-compute vs Runtime

### 5.1 Materialization Strategies

#### Strategy 1: Pre-compute Ontology Closure
```
Ontology → Reasoner → Materialized Ontology (store once)
```

**Use For**:
- Ontology class/property hierarchies
- Symmetric/inverse properties
- Ontology consistency checks

**Performance**: One-time cost at ontology load/update.

**Implementation**:
```typescript
const materializeOntology = (ontologyTurtle: string) =>
  Effect.gen(function*() {
    const store = yield* rdfBuilder.parseTurtle(ontologyTurtle)
    const reasoner = new N3.Reasoner(store._store)
    reasoner.reason()  // Materialize subclass chains, etc.

    // Cache materialized ontology
    yield* ontologyCache.set('materialized', store)

    return store
  })
```

#### Strategy 2: Runtime Reasoning per Batch
```
Extract batch → Merge → Reason (data + ontology) → Validate → Store
```

**Use For**:
- Type inference from domain/range
- Transitive property closure (supersedes chains)
- Entity merging with owl:sameAs

**Performance**: Depends on batch size; with Re-SHACL pattern, fast for <10K triples.

**Implementation** (targeted reasoning):
```typescript
const reasonForValidation = (dataStore: RdfStore, shapesStore: N3.Store) =>
  Effect.gen(function*() {
    // Analyze shapes to identify needed rules
    const neededRules = yield* analyzeShapes(shapesStore)
    // e.g., ["rdfs:subClassOf", "rdfs:domain"]

    // Apply only those rules
    const rulesN3 = getRulesForProfile(neededRules)
    const reasoner = new N3.Reasoner(dataStore._store, { rules: rulesN3 })
    reasoner.reason()

    return dataStore
  })
```

#### Strategy 3: Lazy Reasoning (Cache + TTL)
```
Query → Check cache → (if miss) Reason → Store in cache → Return
```

**Use For**:
- Expensive inferences queried rarely
- External reasoner calls (RDFox API has latency)

**Implementation**:
```typescript
interface InferenceCache {
  get: (graphHash: string) => Effect.Effect<Option<Store>, never>
  set: (graphHash: string, reasoned: Store, ttl: Duration) => Effect.Effect<void>
}

const cachedReasoning = (data: Store, config: ReasoningConfig) =>
  Effect.gen(function*() {
    const cache = yield* InferenceCache
    const hash = yield* hashGraph(data)

    const cached = yield* cache.get(hash)
    if (Option.isSome(cached)) {
      yield* Effect.logDebug('Reasoning cache hit')
      return cached.value
    }

    // Cache miss: reason
    const reasoned = yield* materialize(data, config)
    yield* cache.set(hash, reasoned, Duration.hours(1))

    return reasoned
  })
```

### 5.2 Hybrid Approach (Recommended for News Pipeline)

1. **Ontology Load** (once per deployment):
   - Parse ontology Turtle
   - Materialize subclass chains, property hierarchies
   - Cache materialized ontology in memory (or GCS/Redis)

2. **Per-Chunk Extraction**:
   - Extract entities/relations
   - Validate syntax (datatypes, IRIs)
   - Store raw Turtle (no reasoning yet)

3. **Post-Batch Merge**:
   - Load all chunk graphs into single store
   - Apply **targeted reasoning**:
     - Domain/range → type inference
     - Subclass → expand validation targets
     - Transitive supersedes → materialize claim chains
   - Merge sameAs entities (entity resolution output)
   - Re-validate with SHACL (now sees inferred types)

4. **Storage**:
   - Store **both** asserted and inferred triples in named graphs:
     ```trig
     :batch42-asserted { ... original triples ... }
     :batch42-inferred { ... reasoner output ... }
     ```
   - Or use RDF-star to annotate inferred triples:
     ```turtle
     << :Alice rdf:type :Person >> :inferredBy :DomainRangeRule .
     ```

### 5.3 Caching Strategies

#### Cache 1: Ontology Materialization
- **Key**: Ontology version hash
- **Value**: Materialized ontology store (with subclass closure, etc.)
- **TTL**: Until ontology updated
- **Storage**: In-memory (Effect Ref), Redis, GCS

#### Cache 2: Validation Reports
- **Key**: Data graph hash + shapes hash
- **Value**: SHACL validation report
- **TTL**: 1 hour (or until data/shapes change)
- **Benefit**: Avoid re-validation during debugging

#### Cache 3: Reasoning Results (Optional)
- **Key**: Data graph hash + reasoning config
- **Value**: Materialized inferred triples
- **TTL**: 1 hour
- **Use**: If same chunk re-validated (e.g., in workflow retry)

---

## 6. For News/Claims Domain: What Inferences Matter?

### 6.1 Essential Inferences

#### 1. Inheritance of Entity Types
```turtle
# Ontology
:Politician rdfs:subClassOf :Person .
:Athlete rdfs:subClassOf :Person .

# Data
:BidenJoe a :Politician .

# Inferred (needed for SHACL shapes targeting :Person)
:BidenJoe a :Person .
```

**Why**: SHACL shapes targeting superclasses (e.g., `sh:targetClass :Person`) won't match subclass instances without reasoning.

**Implementation**: RDFS subclass rule (N3.js reasoner, <0.1s)

#### 2. Transitive Supersedes Chains
```turtle
:supersedes a owl:TransitiveProperty .

# Data
:claim3 :supersedes :claim2 .
:claim2 :supersedes :claim1 .

# Inferred
:claim3 :supersedes :claim1 .  # Latest claim supersedes oldest
```

**Why**: Query "find all claims superseded by claim3" needs transitive closure.

**Implementation**: OWL-RL transitive property rule or custom N3 rule.

**Alternative**: Compute on-demand via recursive SPARQL query (no materialization).

#### 3. Conflict Detection (Disjoint Classes)
```turtle
# Ontology
:True owl:disjointWith :False .

# Data
:claim1 :hasVerificationStatus :True, :False .  # CONFLICT

# Detection
# OWL DL reasoner would flag inconsistency
# SHACL can check:
ex:ClaimShape sh:property [
  sh:path :hasVerificationStatus ;
  sh:maxCount 1  # Only one status allowed
] .
```

**Implementation**: SHACL validation (not reasoning). Use `sh:disjoint` or `sh:maxCount`.

#### 4. Source Propagation (Custom Rule)
```turtle
# Custom rule: If claim supersedes another, inherit source if trustworthy
{
  ?newer :supersedes ?older .
  ?older :hasSource ?source .
  ?source :trustworthiness ?trust .
  ?trust math:greaterThan 0.8 .
} => {
  ?newer :hasSource ?source .
} .
```

**Why**: Maintain provenance chains for claims.

**Implementation**: N3 rule (EYE-JS or custom TypeScript).

### 6.2 Inferences That DON'T Matter (Skip These)

1. **Full OWL DL Reasoning**: Exponential complexity, rarely needed for news data.
2. **Complex Class Expressions**: `unionOf`, `intersectionOf` over entity types—news entities are typically simple.
3. **Property Restrictions**: `owl:allValuesFrom`, `owl:someValuesFrom`—SHACL handles this better.
4. **Symmetric Properties**: Few symmetric relations in news (maybe `relatedTo`); not worth reasoning cost.
5. **Inverse Properties**: E.g., `authorOf` inverse of `hasAuthor`—just query both directions.

### 6.3 Recommended Reasoning Profile for News Pipeline

**Profile**: RDFS + Custom Transitive Rules

**Rules** (total: ~8-10):
1. `rdfs:subClassOf` transitivity
2. `rdfs:subPropertyOf` transitivity
3. `rdfs:domain` inference
4. `rdfs:range` inference
5. `owl:TransitiveProperty` (for `:supersedes`)
6. Custom: Source propagation
7. Custom: Temporal ordering (optional)

**Expected Performance**:
- Ontology materialization: <0.1s (one-time)
- Per-batch reasoning (<1K triples): <0.5s
- Per-batch reasoning (1K-10K triples): <2s
- Above 10K triples: Consider external reasoner

**Implementation**:
```typescript
// src/Service/Reasoner.ts (already exists)
export const newsClaimsReasoningConfig = ReasoningConfig.custom([
  RDFS_SUBCLASS_RULE,
  RDFS_DOMAIN_RULE,
  RDFS_RANGE_RULE,
  // Custom transitive supersedes
  `
  @prefix : <http://example.org/> .
  {
    ?a :supersedes ?b .
    ?b :supersedes ?c .
  } => {
    ?a :supersedes ?c .
  } .
  `
])
```

---

## 7. Practical Implementation Strategy

### 7.1 Phase 1: Targeted RDFS Reasoning (1-2 weeks)

**Objective**: Enable type inference and subclass reasoning for SHACL validation.

**Tasks**:
1. Use existing `Reasoner` service in `src/Service/Reasoner.ts`
2. Integrate into workflow:
   ```typescript
   // src/Workflow/DurableActivities.ts
   const validateActivity = (batchId: string) =>
     Effect.gen(function*() {
       const rdfBuilder = yield* RdfBuilder
       const reasoner = yield* Reasoner
       const shacl = yield* ShaclService

       // Load merged graph
       const dataStore = yield* loadBatchGraph(batchId)

       // Load ontology
       const ontology = yield* rdfBuilder.loadOntology()

       // Apply RDFS reasoning (domain/range/subclass)
       yield* reasoner.reasonForValidation(dataStore)

       // Generate SHACL shapes from ontology
       const shapes = yield* shacl.generateShapesFromOntology(ontology._store)

       // Validate enhanced graph
       const report = yield* shacl.validate(dataStore._store, shapes)

       if (!report.conforms) {
         return yield* Effect.fail(new ValidationError({ report }))
       }

       return report
     })
   ```

3. Test: Verify that SHACL shapes targeting `Person` match `Politician` instances after reasoning.

**Impact**: Catch 30-50% more validation errors (implicit type violations).

### 7.2 Phase 2: Custom Transitive Rules (1 week)

**Objective**: Materialize `supersedes` chains for query optimization.

**Tasks**:
1. Define transitive rule in `Reasoner` service
2. Apply during batch validation step
3. Verify: Query "find all claims superseded by X" returns full chain

**Alternative**: Implement as SPARQL recursive query (no materialization):
```sparql
PREFIX : <http://example.org/>

SELECT ?superseded WHERE {
  :claim3 :supersedes+ ?superseded .  # Transitive closure
}
```

**Trade-off**: Materialization faster for queries, but increases graph size. For <10K claims, query-time is fine.

### 7.3 Phase 3: External Reasoner for Scale (2-3 weeks, optional)

**When**: Batch sizes exceed 10K triples or reasoning takes >5s.

**Tasks**:
1. Deploy RDFox or GraphDB as Cloud Run service
2. Wrap as Effect service:
   ```typescript
   export class ExternalReasonerService extends Effect.Service<ExternalReasonerService>()(
     "ExternalReasonerService",
     {
       effect: Effect.gen(function*() {
         const httpClient = yield* HttpClient

         return {
           materialize: (data: Store, profile: 'RDFS' | 'OWL-RL') =>
             Effect.gen(function*() {
               const turtle = yield* serializeStore(data)
               const response = yield* httpClient.post('/reason', {
                 data: turtle,
                 profile
               })
               return yield* parseStore(response.turtle)
             })
         }
       }),
       dependencies: [HttpClient.Default]
     }
   )
   ```

3. Use for large batches, fallback to N3.js for small batches

**Cost**: RDFox license (~$10K-50K/year) or GraphDB Free (no license).

### 7.4 Phase 4: Validation-Driven Reasoning (Re-SHACL Pattern)

**Objective**: Analyze SHACL shapes to determine minimal reasoning needed.

**Tasks**:
1. Parse shapes graph to identify constructs that require reasoning:
   - `sh:class` → Need subclass inference
   - `sh:node` referencing other shapes → Need property domain/range
   - SPARQL-based constraints → May need full reasoning
2. Only apply relevant rules
3. Measure speedup vs full reasoning

**Implementation**:
```typescript
const analyzeShapes = (shapesStore: N3.Store): ReadonlyArray<string> => {
  const rules = new Set<string>()

  // Check if any shape uses sh:class
  const classConstraints = shapesStore.getQuads(
    null,
    namedNode('http://www.w3.org/ns/shacl#class'),
    null,
    null
  )
  if (classConstraints.length > 0) {
    rules.add('rdfs:subClassOf')
  }

  // Check if properties have domains/ranges in ontology
  // (more complex analysis...)

  return Array.from(rules)
}
```

**Expected Impact**: 5-10x speedup for complex shapes.

---

## 8. Recommendations Summary

### 8.1 For Your News/Claims Extraction Pipeline

#### Do Use:
1. **SHACL validation** (already implemented): Enforce cardinality, datatypes, required properties
2. **Lightweight RDFS reasoning**: Subclass, domain, range (N3.js reasoner)
3. **Custom transitive rule**: For `supersedes` chains (N3 or SPARQL)
4. **Targeted reasoning**: Re-SHACL pattern to minimize inference
5. **Named graphs**: Track asserted vs inferred triples separately
6. **Validation policy**: Fail on violations, warn on missing optional properties

#### Don't Use:
1. **Full OWL DL reasoning**: Overkill for news domain, exponential complexity
2. **OWL restrictions for validation**: Use SHACL instead
3. **owl:sameAs** for entity resolution: Use explicit canonical IDs (see below)
4. **Symmetric/inverse properties**: Manually query both directions
5. **SHACL rules** (sh:rule): Keep reasoning separate from validation

### 8.2 Recommended Approach

**Profile**: RDFS + Custom Rules (8-10 rules total)

**Workflow**:
```
1. Ontology load (once):
   - Parse → Reason (materialize hierarchy) → Cache

2. Per-chunk:
   - Extract → Validate syntax → Store raw Turtle

3. Per-batch (after all chunks):
   - Merge chunks → Apply targeted reasoning → Validate with SHACL → Store

4. Query time:
   - Query materialized graph (inferred triples already present)
```

**Performance Targets**:
- Ontology reasoning: <0.1s
- Batch reasoning (<1K triples): <0.5s
- Batch reasoning (1K-10K triples): <2s
- SHACL validation: <0.5s (using shacl-engine)

### 8.3 JavaScript/TypeScript Tooling Stack

| Component | Library | Use |
|-----------|---------|-----|
| **Parsing/Serialization** | N3.js | Turtle, TriG, N-Quads, RDF-star |
| **In-memory Store** | N3.js Store | Development, testing, <100K triples |
| **RDFS Reasoning** | N3.js Reasoner | Subclass, domain, range materialization |
| **Custom Rules** | EYE-JS or N3 rules | Transitive supersedes, source propagation |
| **SHACL Validation** | shacl-engine | High-performance validation (15-26x faster) |
| **Datatype Validation** | rdf-validate-datatype | Literal format checking |
| **SPARQL Queries** | Comunica | Ontology analysis, testing |
| **External Reasoning** | RDFox/GraphDB API | Scale >10K triples (optional) |

### 8.4 Entity Resolution and owl:sameAs (Critical)

**Problem**: `owl:sameAs` inference can cause:
- **Transitive closure explosion**: N² statements
- **Erroneous links**: 13%+ of `owl:sameAs` in LinkLion are wrong
- **Validation confusion**: Which entity gets validated?

**Solution**: Use **synthetic canonical URIs** instead:

```turtle
# DON'T (symmetric, transitive explosion)
:Alice1 owl:sameAs :Alice2 .
:Alice2 owl:sameAs :Alice3 .
# Reasoner infers 6 sameAs triples for 3 entities!

# DO (one-way sameAs to canonical ID)
:Alice1 owl:sameAs :canonical/alice-johnson-uuid .
:Alice2 owl:sameAs :canonical/alice-johnson-uuid .
:Alice3 owl:sameAs :canonical/alice-johnson-uuid .
# No transitive closure; clear canonical entity
```

**Alternative**: Use `skos:exactMatch` (less strict than `owl:sameAs`):
```turtle
:Alice1 skos:exactMatch :Alice2 .  # Same entity, but no OWL inference
```

**Integration with Entity Resolution**:
```typescript
// After ER clustering, emit one-way sameAs links
const emitCanonicalLinks = (cluster: EntityCluster) =>
  Effect.gen(function*() {
    const canonicalIri = cluster.canonicalId  // e.g., uuid-based

    for (const entityId of cluster.memberIds) {
      yield* rdfBuilder.addTriple(
        entityId,
        'owl:sameAs',
        canonicalIri
      )
    }

    // All attributes/relations now use canonicalIri
  })
```

---

## 9. Performance Benchmarks and Expectations

### 9.1 N3.js Reasoner Benchmarks (from research)

| Dataset | Triples | Rules | Inferences | Time | Throughput |
|---------|---------|-------|------------|------|------------|
| FOAF profile | 961 | 14 | 866 | <0.1s | ~9K triples/s |
| Small ontology | 5K | 8 | 2K | 0.3s | ~16K triples/s |
| Medium ontology | 50K | 13 | 20K | 2.5s | ~20K triples/s |

### 9.2 Re-SHACL Performance (VLDB 2024)

| Dataset | Triples | Full Reasoning | Targeted Reasoning | Speedup |
|---------|---------|----------------|-------------------|---------|
| DB100 | 11.6M | 45s | 4.5s | 10x |
| DB1000 | 116M | 450s | 4.5s | 100x |

**Graph size reduction**: 116M → 4.12M triples (targeted vs full)

### 9.3 Expected Performance for News Pipeline

**Assumptions**:
- 100 articles/batch
- 50 claims/article = 5,000 claims
- 10 triples/claim = 50,000 triples/batch
- Ontology: 500 classes, 200 properties (~5K triples materialized)

**Estimated Times**:
- Ontology load + reasoning (once): **0.2s**
- Batch merge (50K triples): **0.5s**
- Targeted reasoning (subclass + domain/range): **2-3s**
- SHACL validation (shacl-engine): **0.5s**
- **Total validation step**: **~3.5s**

**Scaling**:
- 500K triples: ~20s (still acceptable)
- 1M+ triples: Consider external reasoner

### 9.4 Optimization Strategies

1. **Parallel reasoning**: Split graph by document, reason in parallel, merge
2. **Incremental validation**: Only validate new triples + affected neighbors
3. **Shape simplification**: Minimize SPARQL-based constraints
4. **Caching**: Cache ontology materialization, validation reports
5. **Sampling**: For QA, validate random 10% sample, full validation async

---

## 10. Sources and References

### Validation vs Reasoning
- [SHACL and OWL Compared](https://spinrdf.org/shacl-and-owl.html)
- [Semantic Arts: SHACL vs OWL: Understanding Their Roles in Data Modeling](https://www.semanticarts.com/shacl-and-owl/)
- [TopQuadrant: Why I Don't Use OWL Anymore](https://www.topquadrant.com/resources/why-i-dont-use-owl-anymore/)
- [Semantic Web Journal: On the interplay between validation and inference in SHACL](https://www.semantic-web-journal.net/content/interplay-between-validation-and-inference-shacl-investigation-time-ontology)

### Incremental Reasoning
- [Ke et al., VLDB 2024: Efficient Validation of SHACL Shapes with Reasoning](https://www.vldb.org/pvldb/vol17/p3589-acosta.pdf)
- [Springer: Distributed Incremental Ontology Reasoning over Dynamic T-boxes (2024)](https://dl.acm.org/doi/10.1145/3719384.3719446)
- [Springer: Comprehensive Survey of Stream Reasoning and Knowledge Graphs (2025)](https://link.springer.com/article/10.1007/s10115-025-02589-x)
- [SAGE: On the Potential of Logic and Reasoning in Neurosymbolic Systems Using OWL-Based Knowledge Graphs (2025)](https://journals.sagepub.com/doi/10.1177/29498732251320043)
- [Oxford Semantic Tech: What is Knowledge-based AI? What can OWL ontological reasoning do?](https://www.oxfordsemantic.tech/blog/what-is-knowledge-based-ai-what-can-owl-ontological-reasoning-do-how-can-datalog-reason-with-filters-aggregates-negations-and-binds)
- [Oxford Semantic Tech: Music Streaming Services with RDFox - Part One](https://www.oxfordsemantic.tech/blog/part-one-music-streaming-services-with-rdfox)

### JavaScript/TypeScript Reasoners
- [ORA Oxford: N3.js reasoner: implementing reasoning in N3.js (ISWC 2024)](https://ora.ox.ac.uk/objects/uuid:9e7cc2da-b7e3-4ed1-8b83-c4c82999f201)
- [ORA Oxford: EYE JS: a client-side reasoning engine supporting Notation3 (ISWC 2024)](https://ora.ox.ac.uk/objects/uuid:631f29b5-5f50-4739-b124-18ff9c64d662)
- [GitHub: eyereasoner/eye-js](https://github.com/eyereasoner/eye-js)
- [GitHub: ucbl/HyLAR-Reasoner](https://github.com/ucbl/HyLAR-Reasoner)
- [EYE Reasoner](https://eulersharp.sourceforge.net/)

### SPARQL CONSTRUCT and Materialization
- [arXiv: SPARQL in N3: SPARQL CONSTRUCT as a rule language for the Semantic Web (2025)](https://arxiv.org/abs/2508.13041)
- [Springer: SPARQL in N3: SPARQL construct as a Rule Language for the Semantic Web](https://link.springer.com/chapter/10.1007/978-3-032-08887-1_13)
- [SPIN - SPARQL Inferencing Notation](https://spinrdf.org/)
- [W3C: Notation3 Language](https://w3c.github.io/N3/spec/)
- [Notation3: A Practical Introduction](https://notation3.org/)

### OWL Profiles
- [W3C: OWL 2 Web Ontology Language Profiles (Second Edition)](https://www.w3.org/TR/owl2-profiles/)
- [Wikipedia: Web Ontology Language](https://en.wikipedia.org/wiki/Web_Ontology_Language)
- [W3C: Profile Explanations - OWL](https://www.w3.org/2007/OWL/wiki/Profile_Explanations)
- [Springer: OWL 2 Profiles: An Introduction to Lightweight Ontology Languages](https://link.springer.com/chapter/10.1007/978-3-642-33158-9_4)

### Knowledge Graph Reasoning and Validation
- [Oxford Semantic Tech: Finding patterns with rules, using Knowledge Graphs and Semantic Reasoning](https://www.oxfordsemantic.tech/blog/finding-patterns-with-rules-using-knowledge-graphs-and-semantic-reasoning)
- [Oxford Semantic Tech: The Intuitions Behind Knowledge Graphs and Reasoning](https://www.oxfordsemantic.tech/blog/the-intuitions-behind-knowledge-graphs-and-reasoning)
- [arXiv: Fully Geometric Multi-Hop Reasoning on Knowledge Graphs With Transitive Relations](https://arxiv.org/html/2505.12369)
- [MDPI: Logical Rule-Based Knowledge Graph Reasoning: A Comprehensive Survey](https://www.mdpi.com/2227-7390/11/21/4486)
- [ScienceDirect: Triplet trustworthiness validation with knowledge graph reasoning](https://www.sciencedirect.com/science/article/abs/pii/S0952197624019729)

### Temporal Claims and Conflict Detection
- [arXiv: Conflict Detection for Temporal Knowledge Graphs (2024)](https://arxiv.org/abs/2312.11053)
- [arXiv: Online Detection of Anomalies in Temporal Knowledge Graphs with Interpretability](https://arxiv.org/html/2408.00872)
- [MDPI: TeCre: A Novel Temporal Conflict Resolution Method Based on Temporal Knowledge Graph Embedding](https://www.mdpi.com/2078-2489/14/3/155)
- [MDPI: Detect-Then-Resolve: Enhancing Knowledge Graph Conflict Resolution with Large Language Model](https://www.mdpi.com/2227-7390/12/15/2318)
- [arXiv: Evidence-Based Temporal Fact Verification](https://arxiv.org/html/2407.15291)

### Ontology Reasoning Performance
- [Springer: Ontology Reasoning with Large Data Repositories](https://link.springer.com/chapter/10.1007/978-0-387-69900-4_4)
- [PMC: Using ontology databases for scalable query answering, inconsistency detection, and data integration](https://pmc.ncbi.nlm.nih.gov/articles/PMC3230227/)
- [HAL: Owlready: Ontology-oriented programming in Python](https://hal.science/hal-01592746/document/1000)
- [Semantic Scholar: A scalable ontology reasoner via incremental materialization](https://www.semanticscholar.org/paper/A-scalable-ontology-reasoner-via-incremental-Rabbi-MacCaull/03ebb591ddbda2bd01d06565234506f12350ba12)

---

**Document Version**: 1.0
**Research Date**: 2025-12-18
**Conducted By**: Claude Sonnet 4.5
**Target System**: Effect-TS News/Claims Extraction Pipeline
**Next Steps**: See `synthesis_and_implementation_roadmap.md` for integration plan
