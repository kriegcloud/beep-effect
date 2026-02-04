# Research Report: OWL/RDF Handling, SHACL Validation, and Reasoning for Production Pipelines

**Date**: 2025-12-11
**Context**: Effect-TS based ontology extraction pipeline
**Focus**: JavaScript/TypeScript ecosystem, production-ready patterns

## Executive Summary

This research investigates state-of-the-art approaches for SHACL validation, OWL/RDF reasoning, and provenance tracking in production knowledge graph pipelines, with a focus on the JavaScript/TypeScript ecosystem. Key findings:

1. **SHACL Validation**: New high-performance JavaScript validators (shacl-engine) are 15-26x faster than previous implementations; incremental validation strategies (UpSHACL, Re-SHACL) provide 10x speedups over full graph validation
2. **Lightweight Reasoning**: Targeted reasoning before validation (Re-SHACL pattern) outperforms full closure computation; N3.js reasoner supports RDFS materialization in <0.1s for typical datasets
3. **Provenance**: RDF-star and named graphs are the most effective approaches; RDF-star is being standardized in RDF 1.2 with growing JavaScript support
4. **Quick Wins**: Domain/range validation, datatype normalization, and targeted RDFS reasoning can be implemented with existing JS libraries without major architectural changes

---

## 1. SHACL for Production (2023-2025)

### 1.1 JavaScript SHACL Validators

#### rdf-validate-shacl (Zazuko)
- **Status**: Mature, widely-used implementation on RDF/JS stack
- **Features**: Core SHACL validation, returns ValidationReport with conformance status
- **Performance**: Similar to pyshacl; handles standard use cases well
- **Integration**: Works with N3.js, requires separate data loading/parsing
- **TypeScript**: Type definitions via @types/rdf-validate-shacl (updated April 2024)
- **Limitation**: Performance bottleneck on large datasets due to repeated Dataset.match calls

**Usage Pattern**:
```typescript
import SHACLValidator from 'rdf-validate-shacl'
import { Store } from 'n3'

const validator = new SHACLValidator(shapesGraph)
const report = validator.validate(dataGraph)
console.log(report.conforms) // true/false
console.log(report.results)   // violation details
```

#### shacl-engine (rdf-ext)
- **Performance**: 15-26x faster than rdf-validate-shacl and pyshacl
- **Architecture**: Optimized for RDF/JS datasets, caches property/value lookups
- **Features**: SPARQL-based constraints, SPARQL-based targets, debug output, coverage tracking
- **Benchmark**: Validates shacl-shacl shapes against themselves 15x faster; 26x faster on real-world examples

**API Pattern**:
```typescript
import SHACLValidator from 'shacl-engine'
import rdf from 'rdf-ext'

const validator = new SHACLValidator(shapes, {
  factory: rdf,
  debug: true,     // show passed validations
  coverage: true   // track covered triples
})

const report = await validator.validate({ dataset })
```

**Recommendation**: Use shacl-engine for production pipelines requiring high throughput; keep rdf-validate-shacl for simpler use cases or if SPARQL features not needed.

#### Performance Comparison Summary
| Implementation | Relative Speed | Notes |
|---------------|---------------|-------|
| pyshacl | Baseline (1x) | Python, mature |
| rdf-validate-shacl | ~1x | JavaScript, RDF/JS compatible |
| shacl-engine | 15-26x | JavaScript, optimized caching |
| rdf4j | Very fast | Java, enterprise |
| rudof (Rust) | Very fast | Rust, emerging |

### 1.2 Incremental SHACL Validation

Modern SHACL engines support incremental validation to avoid full graph re-validation on updates.

#### UpSHACL (2024)
- **Approach**: Identifies subgraph affected by update, validates reduced subgraph
- **Implementation**: SPARQL-based algorithm over RDF triple stores
- **Performance**: Up to 10x speedup over static full validation; gains increase with KG size
- **Use Case**: Streaming ingestion, continuous validation

#### Re-SHACL (2024)
- **Approach**: Targeted reasoning + semantic-aware validation
- **Key Insight**: Extract relevant info from shapes graph to identify which data needs reasoning
- **Benefits**:
  - Avoids computing closure of entire data graph
  - Merges semantically equivalent entities during validation
  - Orders of magnitude faster than full-entailment SHACL
- **Workflow**: Enhance data graph with targeted reasoning → validate with standard engine

#### RDF4J ShaclSail (Production Pattern)
- **Strategy**: Analyze changes in transaction, create validation plans, execute on commit
- **Optimization**: Only validates minimal set of shapes for changed data
- **Features**: Parallel validation (enabled by default), rdfs:subClassOf reasoning
- **Requirement**: Enable SHACL at repository creation for data consistency

**Implementation Recommendation**: For Effect-TS pipeline:
1. Track changes per extraction batch (document/chunk level)
2. Use Re-SHACL pattern: targeted reasoning before validation
3. For streaming: validate only new triples + affected neighbors
4. Store validation reports per batch for debugging

### 1.3 Auto-Generating SHACL Shapes from OWL

Converting OWL ontologies to SHACL shapes enables automatic constraint generation from existing ontologies.

#### Astrea (OEG-UPM)
- **Approach**: Maintains Astrea-KG, a knowledge graph of mappings between OWL patterns and SHACL patterns
- **Method**: Executes SPARQL queries over ontology to generate shapes
- **Key Insight**: Maps patterns of constructs, not just individual constructs (context-dependent conversion)
- **Outputs**: SHACL shapes for classes, properties, cardinality restrictions, domain/range
- **Availability**: Open source, GitHub: oeg-upm/astrea

#### TopBraid Composer
- **Tool**: "Convert OWL/RDFS to SHACL" menu option
- **Method**: Uses SHACL rules (see owl2shacl.ttl)
- **Pattern**: rdfs:subClassOf restrictions → property shapes connected to classes
- **Options**: Keep/remove original OWL statements in output

#### SHACL Play (Sparna)
- **URL**: https://shacl-play.sparna.fr/play/convert
- **Format**: Web-based OWL to SHACL converter
- **Use Case**: Quick prototyping, small ontologies

#### Important Caveat
OWL and SHACL have different semantics:
- **OWL**: Logical inference (open-world assumption, reasoning)
- **SHACL**: Data validation (closed-world assumption, constraint checking)

**Example**: `owl:FunctionalProperty` (inferencing) vs. `sh:maxCount 1` (validation)

**Recommended Pattern**:
1. Generate base SHACL shapes from ontology using Astrea
2. Manually refine shapes for extraction quality needs
3. Add extraction-specific constraints (confidence thresholds, provenance requirements)
4. Version shapes alongside ontology

### 1.4 SHACL for Extraction Quality Feedback

#### SHACTOR (2023)
- **Problem**: Extracting reliable shapes from noisy knowledge graphs
- **Method**: Uses support and confidence metrics to ensure shape quality
- **Application**: Quality assurance for large-scale KG extraction

#### xpSHACL (2024)
- **Innovation**: Explainable SHACL validation using LLMs
- **Approach**: Combines rule-based justification trees with RAG and LLMs
- **Output**: Multi-language, human-readable explanations for constraint violations
- **Use Case**: LLM feedback loops for extraction improvement

**Key Finding**: Simple SHACL violation messages don't effectively guide LLMs to produce better KG output due to stateless nature of LLMs.

**Recommended Feedback Pattern**:
1. Run SHACL validation post-extraction
2. Use xpSHACL-style explanations (contextualized, human-readable)
3. Include violation context in re-prompting: violated triple + shape + nearby triples
4. Track violation patterns to refine prompts/constraints
5. For systematic violations, update extraction rules or ontology

---

## 2. Lightweight Reasoning

### 2.1 Reasoning Profiles for Linked Data

#### OWL Profiles for Scalability

| Profile | Rules | Use Case | Complexity |
|---------|-------|----------|------------|
| RDFS | ~13 rules | Subclass/subproperty, domain/range | Polynomial |
| RDFS-Plus | RDFS + inverse/transitive | Linked data enrichment | Polynomial |
| OWL-RL | ~80+ rules | Rule-based subset of OWL | Polynomial |
| OWL-DL | Full description logic | Complete reasoning | Exponential |

**Recommendation**: For extraction pipelines, use RDFS or RDFS-Plus for type propagation and hierarchy reasoning; reserve OWL-RL for offline analytics.

### 2.2 RDFS Materialization Strategies

#### N3.js Reasoner (2024)
- **Paper**: "N3.js Reasoner: Implementing reasoning in N3.js" (ISWC 2024)
- **Performance**: RDFS materialization on Tim Berners-Lee's FOAF profile in <0.1s
- **Benchmark**: 14 rules, 961 facts, 866 derivations
- **Algorithm**: Semi-naive evaluation optimized for small rule sets (<100 rules)
- **Limitation**: Basic Graph Patterns only; no built-ins or backward-chaining
- **Use Case**: Browser-based reasoning, client-side validation

**Architecture**:
- Optimizes for limited rules, large datasets
- Uses N3.js store's three-layer indexes (osp, spo, pos)
- Suitable for RDFS and OWL2RL inference

**Usage**:
```typescript
import { Store, Parser, Reasoner } from 'n3'

const store = new Store()
const reasoner = new Reasoner(store)
reasoner.reason()  // Applies RDFS rules
```

#### Alternative: HyLAR Reasoner
- **Profile**: Subset of OWL 2 RL + RDFS
- **Rules**: rdf1, rdfs2-13 (excludes rdf:Seq/Bag axioms)
- **Platform**: JavaScript (browser and Node.js)
- **Status**: Less actively maintained than N3.js

#### Alternative: EYE-JS
- **Implementation**: EYE reasoner compiled to WebAssembly
- **Capabilities**: Full Notation3 reasoning (rules, built-ins, backward-chaining)
- **API**: `n3reasoner(data, query) -> results`
- **Use Case**: Complex rule-based reasoning beyond RDFS/OWL-RL

**Recommendation**:
- **Simple pipelines**: N3.js reasoner for RDFS materialization
- **Complex rules**: EYE-JS for custom business logic
- **Performance-critical**: Consider external reasoner (RDFox, GraphDB) via API

### 2.3 Incremental Reasoning: DRed and RDFox Patterns

#### DRed Algorithm
- **Approach**: Delete and rederive for maintaining Datalog materialization
- **Workflow**: On update, delete affected inferences, rederive necessary facts
- **Optimization**: Minimize over-deletion using queries

#### RDFox Backward/Forward Algorithm (2024)
- **Innovation**: Improves on DRed by reducing over-deleted facts
- **Features**: Compatible with owl:sameAs rewriting
- **Performance**: 2-3 million inferences/second
- **Architecture**: Incremental reasoning executes rules dynamically as data changes
- **API**: Datalog engine with SPARQL interface (commercial, REST API available)

**Key Insight**: Incremental reasoning is critical for RAG scenarios where KG is highly dynamic.

**JavaScript Limitation**: No native incremental reasoning in JS ecosystem; options:
1. Use RDFox via HTTP API (commercial license)
2. Implement simple incremental RDFS (track changed triples, re-materialize affected rules)
3. Batch reasoning on extraction completion, not per-triple

**Recommended Pattern for Effect-TS Pipeline**:
```
Extract batch → Merge → Reason (full RDFS on batch) → Validate → Store
```
For streaming:
```
Per-chunk: Extract → Validate (no reasoning)
Post-batch: Merge all chunks → Reason → Re-validate → Store
```

### 2.4 When to Reason: Pre-Validation vs. Post-Validation

#### Pre-Validation Reasoning (Recommended)
**Pattern**: Data → Reasoning → Enhanced Data → SHACL Validation

**Pros**:
- SHACL validates inferred triples (e.g., type propagation from domain/range)
- Catches violations in implicit data
- Re-SHACL approach: targeted reasoning is fast and efficient

**Cons**:
- Graph size increases (can be mitigated by targeted reasoning)
- Duplicate violations if nUNA (non-unique name assumption)

**Use Case**: Production pipelines where validation must check semantic correctness

#### Post-Validation Reasoning
**Pattern**: Data → SHACL Validation → Reasoning → Enhanced Data

**Pros**:
- Validates only asserted data
- Smaller graph for validation
- Clearer violation reports (no inferred duplicates)

**Cons**:
- Misses violations in implicit data
- May materialize invalid inferences

**Use Case**: Pipelines where asserted data quality is paramount; reasoning is for query optimization

#### Hybrid Approach (Re-SHACL Pattern)
1. Analyze shapes graph to identify needed entailments
2. Apply targeted reasoning (only relevant rules/triples)
3. Merge semantically equivalent entities
4. Validate enhanced graph with standard SHACL engine

**Recommendation for Effect-TS Pipeline**:
- **Phase 1**: Validate asserted triples post-extraction (fast feedback)
- **Phase 2**: Apply targeted RDFS reasoning (domain/range → type inference)
- **Phase 3**: Re-validate with enhanced graph
- **Phase 4**: Store both asserted and inferred triples (optionally in separate named graphs)

---

## 3. Provenance in RDF

### 3.1 RDF-star for Statement-Level Annotations

#### RDF-star Overview
- **Purpose**: Annotate statements with metadata (provenance, confidence, temporal)
- **Syntax**: Embedded triples `<< :subject :predicate :object >> :annotation :value`
- **Status**: Final community group report (Dec 2021); being integrated into RDF 1.2
- **Advantages**: More efficient than reification, less verbose than named graphs for triple-level provenance

**Example**:
```turtle
<< :Alice :worksAt :Acme >> prov:confidence 0.87 ;
                             prov:extractedFrom :doc1#chunk5 ;
                             prov:generatedAtTime "2025-12-11T10:00:00Z"^^xsd:dateTime .
```

#### JavaScript Support (2024-2025)

| Library | RDF-star Support | Status |
|---------|------------------|--------|
| N3.js | Parsing/serialization | Mature (Turtle*, TriG*, N-Triples*, N-Quads*) |
| N3.js Store | Limited | Issue #256 tracking full support |
| Oxigraph | Full (as of 2024) | RDF 1.2 triple terms; subject position support dropped in RDF 1.2 |
| Comunica | Via RDF/JS | Query support in development |

**N3.js RDF-star Pattern**:
```typescript
import { Parser, Writer } from 'n3'

const parser = new Parser({ format: 'turtlestar' })
const writer = new Writer({ format: 'turtlestar' })

// Parse RDF-star
parser.parse(`<< :s :p :o >> :confidence 0.9 .`)

// Write RDF-star
writer.addQuad(/* embedded triple */)
```

**Oxigraph RDF 1.2**:
- RDF-star evolved into RDF 1.2 triple terms
- Syntax slightly different
- Subject position triple terms removed in RDF 1.2 spec
- Default in Oxigraph JS bindings

### 3.2 Named Graphs for Source Tracking

#### Named Graphs Pattern
- **Format**: Quad (subject, predicate, object, graph)
- **Serialization**: TriG, N-Quads, TriX
- **Standards**: Fully compliant with RDF and SPARQL
- **Granularity**: Collection-level (groups of triples)

**Use Cases**:
1. **Provenance**: Track source documents, extraction batches
2. **Versioning**: Capture creation/modification dates
3. **Access Control**: Per-graph permissions
4. **Replication**: Manage datasets (DBpedia, MusicBrainz modules)

**Example**:
```trig
:doc1#chunk5 {
  :Alice a :Person ;
         :name "Alice Johnson" .
}

:doc1#chunk5 prov:wasGeneratedBy :extractionRun42 ;
             prov:generatedAtTime "2025-12-11T10:00:00Z"^^xsd:dateTime ;
             :sourceDocument :doc1 ;
             :confidence 0.92 .
```

#### Comparison: Named Graphs vs. RDF-star

| Feature | Named Graphs | RDF-star |
|---------|-------------|----------|
| Granularity | Collection (multiple triples) | Statement (single triple) |
| Standard compliance | Full (RDF 1.1) | Evolving (RDF 1.2) |
| JavaScript support | Mature (N3.js, Oxigraph) | Growing |
| Verbosity | Lower for batch provenance | Lower for fine-grained metadata |
| SPARQL | Full support | SPARQL-star (partial support) |
| Storage overhead | Lower for coarse provenance | Lower for sparse annotations |

**Recommendation**:
- **Chunk-level provenance**: Named graphs (one graph per chunk)
- **Confidence scores, entity-level metadata**: RDF-star
- **Hybrid**: Named graphs for source, RDF-star for confidence/quality

### 3.3 PROV-O Patterns for Extraction Pipelines

#### PROV-O Core Concepts
- **Entity**: Physical, digital, conceptual thing (documents, KG triples, ontologies)
- **Activity**: Occurs over time, transforms entities (extraction, validation, reasoning)
- **Agent**: Responsible for activity (LLM, extraction service, human reviewer)

**Provenance Chain**:
```
prov:Entity --prov:wasDerivedFrom--> prov:Entity
prov:Entity --prov:wasGeneratedBy--> prov:Activity
prov:Activity --prov:used--> prov:Entity
prov:Activity --prov:wasAssociatedWith--> prov:Agent
```

#### Extraction Pipeline Pattern
```turtle
:extractedGraph a prov:Entity ;
                prov:wasGeneratedBy :extractionActivity ;
                prov:wasDerivedFrom :sourceDocument .

:extractionActivity a prov:Activity ;
                    prov:startedAtTime "2025-12-11T10:00:00Z"^^xsd:dateTime ;
                    prov:endedAtTime "2025-12-11T10:05:00Z"^^xsd:dateTime ;
                    prov:used :sourceDocument, :ontology ;
                    prov:wasAssociatedWith :llmAgent .

:llmAgent a prov:Agent ;
          :modelName "claude-sonnet-4.5" ;
          :modelVersion "20250929" .

:sourceDocument a prov:Entity ;
                :chunkId "chunk5" ;
                :chunkIndex 4 ;
                :textContent "..." .
```

#### Recent Research (2024-2025)
- **PROV-O to BFO mapping**: Enhances interoperability with upper ontologies (Nature, Jan 2025)
- **Survey on RDF provenance**: Named Graphs, RDF-star, PROV-O identified as most effective (2024)
- **Cultural heritage metadata**: Provenance tracking using PROV-O + named graphs

**Recommendation for Effect-TS Pipeline**:
1. Model extraction as `prov:Activity`
2. Source chunks as `prov:Entity` with chunk metadata
3. Extracted graph as `prov:Entity` with `prov:wasGeneratedBy`
4. LLM service as `prov:Agent` with model version
5. Embed in named graphs or RDF-star for storage

### 3.4 Confidence Scores as RDF Annotations

#### Uncertain Knowledge Graphs
- **Definition**: Each triple has confidence score st ∈ [0, 1]
- **Use Cases**: Extraction quality, KB completion, probabilistic reasoning
- **Standards**: No W3C standard; common patterns emerging

**Approaches**:

#### 1. RDF-star Pattern (Recommended)
```turtle
<< :Alice :worksAt :Acme >> :confidence 0.87 ;
                            :extractedBy :llmAgent ;
                            :groundedBy :humanReviewer .
```

#### 2. Probabilistic RDF Graphs
```turtle
:Alice :worksAt :Acme .
:triple1 a :UncertainTriple ;
         :subject :Alice ;
         :predicate :worksAt ;
         :object :Acme ;
         :probability 0.87 .
```

#### 3. Named Graphs with Graph-Level Confidence
```trig
:uncertainGraph {
  :Alice :worksAt :Acme .
}
:uncertainGraph :confidence 0.87 .
```

#### Knowledge Vault Pattern
- Combines extractions from web content with prior knowledge (Freebase)
- Uses probabilistic soft logic (PSL) to infer confidence scores
- Aggregates multiple extraction sources

**Recommended Confidence Model**:
```turtle
:extraction a prov:Entity ;
            :confidence [
              :extractionConfidence 0.85 ;  # LLM confidence
              :groundingConfidence 0.92 ;    # Verification pass
              :aggregatedConfidence 0.88 ;   # Combined score
              :method "geometric_mean"
            ] .
```

**Thresholding Strategy**:
1. Set minimum confidence threshold (e.g., 0.7) for inclusion
2. Store all extractions, flag low-confidence for review
3. Use confidence for ranking in query results
4. Track confidence degradation over time (staleness)

---

## 4. JavaScript/TypeScript RDF Ecosystem

### 4.1 N3.js: Capabilities and Patterns

#### Core Features
- **Parsing**: Turtle, TriG, N-Triples, N-Quads, RDF-star, Notation3
- **Serialization**: Turtle, TriG, N-Triples, N-Quads, RDF-star
- **Store**: In-memory triple/quad store with three-layer indexes (osp, spo, pos)
- **Streaming**: Handle large RDF files without loading entire graph
- **Performance**: "Lightning fast" - optimized for JavaScript

#### Usage Patterns

**Parsing**:
```typescript
import { Parser } from 'n3'

const parser = new Parser({ format: 'turtle' })
parser.parse(`
  @prefix ex: <http://example.org/> .
  ex:Alice a ex:Person ;
           ex:name "Alice" .
`, (error, quad, prefixes) => {
  if (quad) console.log(quad)
  else console.log('Parsing complete', prefixes)
})
```

**Store**:
```typescript
import { Store, DataFactory } from 'n3'
const { namedNode, literal, quad } = DataFactory

const store = new Store()
store.addQuad(
  namedNode('http://example.org/Alice'),
  namedNode('http://example.org/name'),
  literal('Alice')
)

// Query
const quads = store.getQuads(null, namedNode('http://example.org/name'), null)
```

**Streaming**:
```typescript
import { StreamParser, StreamWriter } from 'n3'
import { createReadStream, createWriteStream } from 'fs'

createReadStream('input.ttl')
  .pipe(new StreamParser())
  .pipe(transformStream)  // Process quads
  .pipe(new StreamWriter())
  .pipe(createWriteStream('output.ttl'))
```

#### N3.js Reasoner Integration
```typescript
import { Store, Reasoner } from 'n3'

const store = new Store()
// Load data and RDFS ontology
const reasoner = new Reasoner(store)
reasoner.reason()  // Materialize inferences

// Store now contains both asserted and inferred triples
```

#### Limitations
- Store doesn't fully support RDF-star (as of 2024, issue #256 open)
- No built-in SPARQL query (use Comunica for that)
- Reasoner limited to basic graph patterns (use EYE-JS for advanced reasoning)

### 4.2 rdf-validate-shacl: Usage and Performance

**Installation**:
```bash
npm install rdf-validate-shacl
```

**Basic Usage**:
```typescript
import SHACLValidator from 'rdf-validate-shacl'
import { Store } from 'n3'

// Load shapes and data into N3 stores
const shapesGraph = new Store()
const dataGraph = new Store()

const validator = new SHACLValidator(shapesGraph)
const report = validator.validate(dataGraph)

console.log('Conforms:', report.conforms)
report.results.forEach(result => {
  console.log('Violation:', result.message)
  console.log('  Focus node:', result.focusNode)
  console.log('  Path:', result.path)
  console.log('  Value:', result.value)
})
```

**Accessing Report as RDF**:
```typescript
const reportDataset = report.dataset
// reportDataset is RDF/JS Dataset with SHACL validation report
```

**Performance Characteristics**:
- Similar to pyshacl
- Bottleneck: Repeated Dataset.match calls for same shapes
- Best for: Standard SHACL validation, moderate dataset sizes (<100K triples)
- Consider shacl-engine for: Large datasets, high-throughput pipelines

### 4.3 Comunica for SPARQL Queries

#### Overview
- **Architecture**: Modular SPARQL query engine
- **Execution**: SPARQL 1.1 Query, SPARQL 1.1 Update, GraphQL-LD
- **Sources**: RDF files, SPARQL endpoints, TPF, Solid pods, in-memory stores
- **Platforms**: Node.js, browsers, CLI
- **Implementation**: TypeScript, RDF/JS specifications

#### Installation and Usage
```bash
npm install @comunica/query-sparql
```

**Query over files**:
```typescript
import { QueryEngine } from '@comunica/query-sparql'

const engine = new QueryEngine()
const bindingsStream = await engine.queryBindings(`
  SELECT ?person ?name WHERE {
    ?person a <http://example.org/Person> ;
            <http://example.org/name> ?name .
  }
`, {
  sources: ['file.ttl'],
})

bindingsStream.on('data', binding => {
  console.log(binding.get('person').value)
  console.log(binding.get('name').value)
})
```

**Query over N3 store**:
```typescript
import { QueryEngine } from '@comunica/query-sparql-rdfjs'
import { Store } from 'n3'

const store = new Store()
// ... populate store

const engine = new QueryEngine()
const result = await engine.queryBindings(`
  SELECT * WHERE { ?s ?p ?o }
`, {
  sources: [store],
})
```

**Federated Querying**:
```typescript
const bindingsStream = await engine.queryBindings(`
  SELECT ?person ?name WHERE {
    ?person a <http://example.org/Person> ;
            <http://example.org/name> ?name .
  }
`, {
  sources: [
    'https://dbpedia.org/sparql',
    'https://query.wikidata.org/sparql',
    new Store()  // Mix endpoints with local stores
  ],
})
```

#### Use Cases for Effect-TS Pipeline
1. **Ontology queries**: Extract class hierarchies, property constraints
2. **Validation queries**: Custom checks beyond SHACL
3. **Transformation**: CONSTRUCT queries for data reshaping
4. **Analytics**: Aggregation queries over extracted graphs
5. **Testing**: Query expected patterns in test fixtures

### 4.4 RDF-star Support Matrix

| Library | Parse | Serialize | Store | Query | Status (2024) |
|---------|-------|-----------|-------|-------|--------------|
| N3.js | ✓ | ✓ | Partial | - | Mature parsing/writing |
| Oxigraph | ✓ | ✓ | ✓ | ✓ (SPARQL-star) | RDF 1.2 triple terms |
| Comunica | - | - | - | In progress | Via RDF/JS support |
| shacl-engine | - | - | - | - | Not yet |
| rdf-validate-shacl | - | - | - | - | Not yet |

**Current Best Practice (2024)**:
1. Use N3.js for RDF-star parsing/serialization
2. Convert to standard quads for storage/validation
3. Use Oxigraph if SPARQL-star queries needed
4. Wait for N3.js issue #256 for full store support

**Migration to RDF 1.2**:
- RDF-star → RDF 1.2 triple terms
- Subject position triple terms removed
- Syntax changes (minor)
- Oxigraph already supports RDF 1.2

---

## 5. Datatype Handling

### 5.1 XSD Datatype Normalization

#### rdf-validate-datatype (Zazuko)
**Purpose**: Validate RDF literal values based on declared datatype

**Installation**:
```bash
npm install rdf-validate-datatype
```

**Usage**:
```typescript
import validate from 'rdf-validate-datatype'
import { DataFactory } from 'n3'
const { literal, namedNode } = DataFactory

// Validate term
const validDate = literal('2025-12-11', namedNode('http://www.w3.org/2001/XMLSchema#date'))
console.log(validate.validateTerm(validDate))  // true

const invalidDate = literal('invalid', namedNode('http://www.w3.org/2001/XMLSchema#date'))
console.log(validate.validateTerm(invalidDate))  // false

// Validate quad
const quad = /* ... */
console.log(validate.validateQuad(quad))  // Validates quad.object
```

**Custom Validators**:
```typescript
import validate from 'rdf-validate-datatype'

validate.validators.set('http://example.org/myDatatype', (value) => {
  return /^[A-Z]{3}-\d{4}$/.test(value)  // e.g., ABC-1234
})
```

#### rdf-literal (Type Conversion)
**Purpose**: Convert RDF literals to JavaScript values

```typescript
import { fromRdf } from 'rdf-literal'

const jsValue = fromRdf(literal('42', xsd.integer))
console.log(jsValue)  // 42 (number)

const jsDate = fromRdf(literal('2025-12-11', xsd.date))
console.log(jsDate)  // Date object

// With validation
const validated = fromRdf(literal('invalid', xsd.integer), true)
// Throws error
```

**Supported Datatypes**:
- `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:double`, `xsd:float`
- `xsd:boolean`
- `xsd:date`, `xsd:dateTime`, `xsd:time`
- Custom datatypes treated as strings

### 5.2 Range Enforcement Patterns

#### OWL Range Restrictions

**Defining Datatypes with Range Constraints**:
```turtle
:Age a rdfs:Datatype ;
     owl:onDatatype xsd:integer ;
     owl:withRestrictions (
       [ xsd:minInclusive 0 ]
       [ xsd:maxInclusive 150 ]
     ) .

:hasAge rdfs:range :Age .
```

**Regular Expression Constraints**:
```turtle
:EmailAddress a rdfs:Datatype ;
              owl:onDatatype xsd:string ;
              owl:withRestrictions (
                [ xsd:pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" ]
              ) .
```

#### SHACL Range Validation

**Datatype Constraints**:
```turtle
:PersonShape a sh:NodeShape ;
             sh:targetClass :Person ;
             sh:property [
               sh:path :age ;
               sh:datatype xsd:integer ;
               sh:minInclusive 0 ;
               sh:maxInclusive 150 ;
             ] ;
             sh:property [
               sh:path :email ;
               sh:datatype xsd:string ;
               sh:pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" ;
             ] .
```

#### Validation Pipeline Pattern

**1. Extract with Type Hints**:
```typescript
interface ExtractedAttribute {
  property: string
  value: string
  inferredType?: string  // 'date', 'integer', 'email', etc.
}
```

**2. Normalize and Coerce**:
```typescript
function normalizeLiteral(attr: ExtractedAttribute): Literal {
  const { value, inferredType } = attr

  switch (inferredType) {
    case 'integer':
      const int = parseInt(value, 10)
      if (isNaN(int)) throw new Error(`Invalid integer: ${value}`)
      return literal(int.toString(), xsd.integer)

    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`Invalid date: ${value}`)
      }
      return literal(value, xsd.date)

    case 'boolean':
      const bool = value.toLowerCase()
      if (!['true', 'false', '1', '0'].includes(bool)) {
        throw new Error(`Invalid boolean: ${value}`)
      }
      return literal(bool === 'true' || bool === '1' ? 'true' : 'false', xsd.boolean)

    default:
      return literal(value, xsd.string)
  }
}
```

**3. Validate with SHACL**:
```typescript
import SHACLValidator from 'shacl-engine'
import validate from 'rdf-validate-datatype'

// Pre-validation: Check datatype validity
for (const quad of dataGraph) {
  if (!validate.validateQuad(quad)) {
    console.warn(`Invalid literal: ${quad}`)
  }
}

// SHACL validation (includes range checks)
const validator = new SHACLValidator(shapes, { factory: rdf })
const report = await validator.validate({ dataset: dataGraph })
```

### 5.3 Literal Validation and Coercion Best Practices

#### Extract-Time Strategies
1. **Prompt for Types**: Include expected datatype in extraction prompts
   ```
   Extract age as an integer between 0-150.
   Extract dates in ISO 8601 format (YYYY-MM-DD).
   ```

2. **Regex Pre-filters**: Validate format before creating RDF literals
   ```typescript
   const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
   if (!DATE_PATTERN.test(extractedValue)) {
     // Attempt normalization or flag for review
   }
   ```

3. **Ontology-Driven Coercion**: Use property ranges from ontology
   ```typescript
   const range = ontology.getPropertyRange(':hasAge')
   if (range === 'xsd:integer') {
     // Coerce to integer
   }
   ```

#### Post-Extract Validation
1. **rdf-validate-datatype**: Fast, per-literal validation
2. **SHACL shapes**: Comprehensive validation with range constraints
3. **Reasoning**: Infer types from domain/range (RDFS)

#### Error Handling Patterns
```typescript
type ValidationResult =
  | { success: true; literal: Literal }
  | { success: false; error: string; originalValue: string }

function validateAndCoerce(value: string, datatype: NamedNode): ValidationResult {
  try {
    const lit = createLiteral(value, datatype)
    if (!validate.validateTerm(lit)) {
      return { success: false, error: 'Invalid format', originalValue: value }
    }
    return { success: true, literal: lit }
  } catch (e) {
    return { success: false, error: e.message, originalValue: value }
  }
}
```

**Recommendation**:
- Validate early (extraction time) and late (pre-storage)
- Use rdf-validate-datatype for quick checks
- Use SHACL for comprehensive validation
- Log validation failures for prompt refinement

---

## 6. Production Implementation Recommendations

### 6.1 Quick Wins (1-2 Weeks)

#### 1. Replace SHACL Stub with shacl-engine
**Effort**: Low
**Impact**: High

```typescript
// src/Service/Rdf.ts
import SHACLValidator from 'shacl-engine'
import rdf from 'rdf-ext'

export class RdfService {
  async validate(dataGraph: Store, shapesGraph: Store): Promise<ValidationReport> {
    const validator = new SHACLValidator(shapesGraph, {
      factory: rdf,
      debug: false,
      coverage: false
    })

    const report = await validator.validate({ dataset: dataGraph })
    return {
      conforms: report.conforms,
      results: report.results.map(r => ({
        message: r.message,
        focusNode: r.focusNode.value,
        path: r.path?.value,
        value: r.value?.value
      }))
    }
  }
}
```

#### 2. Add Datatype Normalization
**Effort**: Low
**Impact**: Medium

```typescript
// src/Service/Extraction.ts
import { fromRdf } from 'rdf-literal'
import validate from 'rdf-validate-datatype'

function normalizeLiteral(value: string, propertyRange: string): Literal {
  // Map ontology ranges to XSD types
  const xsdType = mapRangeToXSD(propertyRange)
  const lit = literal(value, xsdType)

  if (!validate.validateTerm(lit)) {
    throw new Error(`Invalid ${propertyRange}: ${value}`)
  }

  return lit
}
```

#### 3. Materialize Provenance Metadata
**Effort**: Low
**Impact**: Medium

```typescript
// Use named graphs for chunk-level provenance
function serializeChunk(chunk: ExtractedChunk): string {
  const graphIRI = `${baseIRI}/extraction/${chunk.docId}#chunk${chunk.chunkIndex}`

  const writer = new Writer({ format: 'trig' })

  // Add triples to named graph
  chunk.triples.forEach(triple => {
    writer.addQuad(triple.subject, triple.predicate, triple.object, namedNode(graphIRI))
  })

  // Add provenance metadata
  writer.addQuad(
    namedNode(graphIRI),
    namedNode('http://www.w3.org/ns/prov#wasGeneratedBy'),
    namedNode(`${baseIRI}/activity/${chunk.extractionId}`)
  )

  writer.addQuad(
    namedNode(graphIRI),
    namedNode('http://example.org/chunkId'),
    literal(chunk.chunkId)
  )

  return writer.end()
}
```

### 6.2 Medium-Term Enhancements (1-2 Months)

#### 1. Auto-Generate SHACL Shapes from Ontology
**Tool**: Astrea (https://github.com/oeg-upm/astrea)
**Process**:
1. Export ontology as Turtle/RDF-XML
2. Run Astrea to generate base shapes
3. Manually refine for extraction-specific constraints
4. Version shapes alongside ontology

#### 2. Implement Targeted RDFS Reasoning
**Pattern**: Re-SHACL approach

```typescript
import { Store, Reasoner } from 'n3'

async function validateWithReasoning(
  dataGraph: Store,
  shapesGraph: Store,
  ontologyGraph: Store
): Promise<ValidationReport> {
  // 1. Identify needed entailments from shapes
  const neededRules = analyzeShapes(shapesGraph)  // e.g., rdfs:domain, rdfs:range

  // 2. Apply targeted reasoning
  const enhancedGraph = new Store(dataGraph.getQuads())
  const reasoner = new Reasoner(enhancedGraph, { rules: neededRules })
  reasoner.reason()

  // 3. Validate enhanced graph
  return validate(enhancedGraph, shapesGraph)
}
```

#### 3. Confidence Tracking with RDF-star
**When N3.js store support is ready**:

```typescript
function addConfidenceAnnotations(triple: Quad, confidence: number): void {
  // RDF-star pattern
  const annotatedTriple = quad(
    quad(triple.subject, triple.predicate, triple.object),
    namedNode('http://example.org/confidence'),
    literal(confidence.toString(), xsd.decimal)
  )

  store.addQuad(annotatedTriple)
}
```

**Interim approach** (named graph per confidence band):
```typescript
const graphIRI = confidence > 0.9
  ? `${baseIRI}/highConfidence`
  : `${baseIRI}/mediumConfidence`

store.addQuad(triple.subject, triple.predicate, triple.object, namedNode(graphIRI))
```

### 6.3 Long-Term Architecture (3-6 Months)

#### 1. Incremental Validation Pipeline
```
Extract Batch
  ↓
Identify Changed Triples (delta)
  ↓
Materialize Affected RDFS Inferences (targeted)
  ↓
Validate Delta + Affected Neighbors (UpSHACL pattern)
  ↓
Merge to Master Graph
```

#### 2. Effect-TS Integration Patterns

**Wrap SHACL Validation**:
```typescript
import { Effect, Layer } from 'effect'

interface SHACLService {
  validate: (data: Store, shapes: Store) => Effect.Effect<ValidationReport, ValidationError>
}

const SHACLServiceLive = Layer.succeed(
  SHACLService,
  {
    validate: (data, shapes) => Effect.tryPromise({
      try: async () => {
        const validator = new SHACLValidator(shapes, { factory: rdf })
        return await validator.validate({ dataset: data })
      },
      catch: (error) => new ValidationError({ cause: error })
    })
  }
)
```

**Reasoning Service**:
```typescript
interface ReasoningService {
  materialize: (data: Store, rules: RDFSRules) => Effect.Effect<Store, ReasoningError>
}

const ReasoningServiceLive = Layer.effect(
  ReasoningService,
  Effect.sync(() => ({
    materialize: (data, rules) => Effect.sync(() => {
      const reasoner = new Reasoner(data, { rules })
      reasoner.reason()
      return data  // Mutated in-place
    })
  }))
)
```

#### 3. Comunica Query Layer
```typescript
interface SPARQLService {
  query: (sparql: string, sources: Source[]) => Effect.Effect<Bindings[], QueryError>
}

const SPARQLServiceLive = Layer.succeed(
  SPARQLService,
  {
    query: (sparql, sources) => Effect.tryPromise({
      try: async () => {
        const engine = new QueryEngine()
        const stream = await engine.queryBindings(sparql, { sources })
        return await stream.toArray()
      },
      catch: (error) => new QueryError({ cause: error })
    })
  }
)
```

---

## 7. Performance Considerations at Scale

### 7.1 SHACL Validation Performance

#### Optimization Strategies
1. **Use shacl-engine** (15-26x faster than alternatives)
2. **Incremental validation** (UpSHACL: 10x faster on updates)
3. **Targeted reasoning** (Re-SHACL: orders of magnitude faster than full entailment)
4. **Parallel validation** (RDF4J pattern: validate independent shapes concurrently)
5. **Shape simplification** (minimize SPARQL-based constraints, prefer core components)

#### Benchmark Data (Reference)
- **N3.js reasoner**: RDFS materialization on FOAF profile in <0.1s (961 facts, 14 rules)
- **shacl-engine**: Validates shacl-shacl shapes in ~0.067s (15x faster baseline)
- **UpSHACL**: 10x speedup on updates vs. full validation
- **Re-SHACL**: Orders of magnitude faster than full OWL entailment + SHACL

#### Scaling Recommendations
- **<10K triples**: Any validator works
- **10K-100K triples**: Use shacl-engine or rdf-validate-shacl
- **100K-1M triples**: Use shacl-engine + incremental validation + targeted reasoning
- **>1M triples**: Consider external validator (RDF4J, GraphDB) via API; partition by namespace

### 7.2 Reasoning Performance

#### RDFS Materialization
- **N3.js**: Suitable for <100K triples, RDFS/simple OWL-RL
- **EYE-JS (WebAssembly)**: More capable, good for <1M triples
- **External (RDFox, GraphDB)**: Required for >1M triples or complex rules

#### Incremental Reasoning
- **DRed algorithm**: Delete + rederive on updates
- **RDFox B/F**: 2-3M inferences/second (commercial)
- **JavaScript limitation**: No native incremental reasoner; batch reasoning on extraction completion

#### Strategy for Effect-TS Pipeline
1. **Per-chunk**: No reasoning, fast validation
2. **Per-batch**: Merge chunks → targeted RDFS → validate → store
3. **Master graph**: Incremental reasoning via external API (RDFox/GraphDB) if needed

### 7.3 Storage and Querying

#### In-Memory (N3.js Store)
- **Good for**: Development, testing, small datasets (<1M triples)
- **Limitations**: No persistence, no SPARQL, limited RDF-star

#### Oxigraph (WebAssembly)
- **Good for**: Embedded SPARQL, moderate datasets (<10M triples)
- **Features**: SPARQL 1.1, RDF 1.2 triple terms, browser + Node.js
- **Performance**: Fast for embedded use case

#### External Triple Stores
- **GraphDB**: SHACL validation, incremental reasoning, enterprise features
- **RDFox**: Incremental reasoning (DRed), high performance
- **Blazegraph**: Open source, SPARQL 1.1, moderate scale
- **Stardog**: Virtual graphs, reasoning, commercial

**Recommendation**:
- **Phase 1**: N3.js store for extraction/validation
- **Phase 2**: Oxigraph for SPARQL queries
- **Phase 3**: External store (GraphDB/RDFox) for production scale

### 7.4 Effect-TS Concurrency Patterns

#### Parallel Extraction with Backpressure
```typescript
import { Effect, Schedule, Queue } from 'effect'

const extractWithBackpressure = (chunks: Chunk[], maxConcurrency: number) =>
  Effect.gen(function* (_) {
    const queue = yield* _(Queue.bounded<Chunk>(maxConcurrency))

    const producer = Effect.forEach(chunks, chunk =>
      Queue.offer(queue, chunk)
    )

    const consumer = Queue.take(queue).pipe(
      Effect.flatMap(chunk => extractChunk(chunk)),
      Effect.repeat(Schedule.forever)
    )

    yield* _(Effect.all([producer, consumer], { concurrency: 'inherit' }))
  })
```

#### Cached Reasoning Layer
```typescript
interface ReasoningCache {
  get: (graphHash: string) => Effect.Effect<Option<Store>, never>
  set: (graphHash: string, reasoned: Store) => Effect.Effect<void, never>
}

const cachedReasoning = (data: Store) =>
  Effect.gen(function* (_) {
    const cache = yield* _(ReasoningCache)
    const hash = yield* _(hashGraph(data))

    const cached = yield* _(cache.get(hash))
    if (Option.isSome(cached)) return cached.value

    const reasoned = yield* _(materialize(data))
    yield* _(cache.set(hash, reasoned))
    return reasoned
  })
```

---

## 8. Summary: Top Takeaways and Next Steps

### 8.1 Key Techniques for Production RDF/OWL Handling

1. **Validation First**: Use shacl-engine for 15-26x performance improvement; implement immediately to replace stub
2. **Targeted Reasoning**: Apply Re-SHACL pattern (analyze shapes → reason on relevant data → validate) for orders of magnitude speedup
3. **Provenance Strategy**: Use named graphs for chunk-level provenance (standard, mature); prepare for RDF-star for confidence scores (RDF 1.2)
4. **Datatype Normalization**: Use rdf-validate-datatype + extraction-time coercion to ensure valid literals
5. **Incremental Patterns**: Validate deltas (UpSHACL), reason incrementally (DRed via RDFox API for scale)

### 8.2 Concrete Recommendations for Effect-TS/JS Pipeline

#### Immediate (1-2 Weeks)
1. **Replace SHACL stub**: Integrate shacl-engine with Effect wrapper
   - File: `src/Service/Rdf.ts`
   - Effort: 1-2 days
   - Impact: Catch validation errors, improve data quality

2. **Add datatype validation**: Use rdf-validate-datatype in extraction service
   - File: `src/Service/Extraction.ts`
   - Effort: 2-3 days
   - Impact: Prevent invalid literals, enable downstream reasoning

3. **Materialize provenance**: Emit named graphs with chunk metadata
   - File: `src/Workflow/DurableActivities.ts`
   - Effort: 1-2 days
   - Impact: Enable source tracking, debugging, confidence filtering

#### Short-Term (1-2 Months)
4. **Generate SHACL shapes**: Use Astrea to convert ontology → shapes
   - Process: Export ontology → run Astrea → refine shapes → version control
   - Effort: 3-5 days
   - Impact: Automated constraint generation, ontology-driven validation

5. **Implement RDFS reasoning**: Use N3.js reasoner for domain/range inference
   - Integration: Pre-validation step in `RdfService`
   - Effort: 1 week
   - Impact: Type propagation, implicit triple validation

6. **Domain/range enforcement**: Post-extraction filter using ontology metadata
   - File: `src/Service/Extraction.ts`
   - Effort: 3-5 days
   - Impact: Reduce hallucinated relations, improve precision

#### Medium-Term (3-6 Months)
7. **Incremental validation**: Implement UpSHACL pattern for batch updates
   - Architecture: Track changed triples, validate delta + affected neighbors
   - Effort: 2-3 weeks
   - Impact: 10x speedup on updates, enable continuous validation

8. **RDF-star confidence**: Adopt RDF 1.2 triple terms when N3.js store support lands
   - Migration: Named graph interim → RDF-star when ready
   - Effort: 1 week
   - Impact: Fine-grained confidence tracking, cleaner provenance model

9. **External reasoner**: Integrate RDFox or GraphDB API for incremental reasoning at scale
   - Architecture: Cloud Run job, REST API, Effect service wrapper
   - Effort: 2-3 weeks
   - Impact: 2-3M inferences/second, production-scale reasoning

### 8.3 Implementation Sequence

```
Phase 1: Validation Foundation (Weeks 1-2)
├─ Integrate shacl-engine
├─ Add datatype validation
└─ Materialize provenance (named graphs)

Phase 2: Ontology-Driven Quality (Weeks 3-8)
├─ Generate SHACL shapes from ontology
├─ Implement RDFS reasoning (N3.js)
├─ Add domain/range filters
└─ Create validation report storage

Phase 3: Scale and Optimization (Months 3-6)
├─ Incremental validation (UpSHACL)
├─ RDF-star migration (when ready)
├─ External reasoner integration
└─ Performance monitoring/tuning
```

### 8.4 Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│ Extraction Pipeline (Effect-TS)                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Extract → Normalize → Reason → Validate → Store             │
│    │         │          │         │           │              │
│    │         │          │         │           │              │
│    │         │          │         │           │              │
│  LLM     Datatype   N3.js    shacl-     Named Graphs        │
│          Coercion   Reasoner engine     + Provenance         │
│                                                               │
│  Services:                                                    │
│  - ExtractionService (normalize datatypes)                   │
│  - ReasoningService (N3.js wrapper)                          │
│  - SHACLService (shacl-engine wrapper)                       │
│  - RdfService (serialize with provenance)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 Tooling Stack

| Component | Library | Purpose |
|-----------|---------|---------|
| Parsing/Serialization | N3.js | Turtle, TriG, RDF-star |
| In-memory Store | N3.js Store | Development, testing |
| SHACL Validation | shacl-engine | High-performance validation |
| Datatype Validation | rdf-validate-datatype | Literal format checking |
| RDFS Reasoning | N3.js Reasoner | Lightweight materialization |
| SPARQL Queries | Comunica | Ontology analysis, testing |
| Advanced Reasoning | EYE-JS or RDFox API | Complex rules, scale |
| Provenance | Named Graphs (TriG) | Chunk-level metadata |
| Confidence | Named Graphs → RDF-star | Interim → future migration |

### 8.6 Metrics to Track

1. **Validation Rate**: % of extracted graphs passing SHACL validation
2. **Datatype Errors**: Count of invalid literals by type (date, integer, etc.)
3. **Reasoning Time**: RDFS materialization duration per batch
4. **Validation Time**: SHACL validation duration per batch
5. **Provenance Coverage**: % of triples with source metadata
6. **Confidence Distribution**: Histogram of extraction confidence scores

---

## 9. References and Sources

### SHACL Validation
- [rdf-validate-shacl GitHub](https://github.com/zazuko/rdf-validate-shacl) - JavaScript SHACL validator
- [shacl-engine GitHub](https://github.com/rdf-ext/shacl-engine) - 15-26x faster SHACL engine
- [shacl-engine Performance Blog](https://www.bergnet.org/2023/03/2023/shacl-engine/) - Implementation and benchmarks
- [UpSHACL: Targeted Constraint Validation for Updates](https://link.springer.com/chapter/10.1007/978-3-032-09527-5_7) - Incremental validation
- [Efficient Validation of SHACL Shapes with Reasoning (VLDB 2024)](https://dl.acm.org/doi/10.14778/3681954.3682023) - Re-SHACL approach
- [SHACL Validation under Well-founded Semantics (KR 2024)](https://proceedings.kr.org/2024/52/kr2024-0052-okulmus-et-al.pdf)
- [RDF4J SHACL Validation](https://rdf4j.org/documentation/programming/shacl/) - Incremental validation engine
- [SHACL-ing the Data Quality Dragon III (Ontotext)](https://www.ontotext.com/blog/shacl-ing-the-data-quality-dragon-iii-a-good-artisan-knows-their-tools/)

### OWL to SHACL Conversion
- [Astrea: Automatic Generation of SHACL Shapes from Ontologies](https://link.springer.com/chapter/10.1007/978-3-030-49461-2_29)
- [Astrea GitHub](https://github.com/oeg-upm/astrea) - Open source implementation
- [TopBraid: From OWL to SHACL](https://archive.topquadrant.com/from-owl-to-shacl-in-an-automated-way/)
- [owl2shacl (elevont)](https://github.com/elevont/owl2shacl) - CLI tool
- [owl2shacl (sparna)](https://github.com/sparna-git/owl2shacl) - Conversion rules

### SHACL and LLM Integration
- [xpSHACL: Explainable SHACL with RAG and LLMs](https://arxiv.org/html/2507.08432v1)
- [SHACTOR: Improving KG Quality with Validating Shapes](https://dl.acm.org/doi/abs/10.1145/3555041.3589723)
- [Learning SHACL Shapes from Knowledge Graphs](https://www.semantic-web-journal.net/content/learning-shacl-shapes-knowledge-graphs)

### Reasoning
- [N3.js Reasoner Paper (ISWC 2024)](https://ceur-ws.org/Vol-3828/paper23.pdf)
- [N3.js GitHub](https://github.com/rdfjs/N3.js) - RDF library with reasoner
- [HyLAR Reasoner GitHub](https://github.com/ucbl/HyLAR-Reasoner) - JavaScript RDFS/OWL-RL
- [EYE-JS GitHub](https://github.com/eyereasoner/eye-js) - WebAssembly reasoner
- [RDFS and OWL Reasoning for Linked Data](https://link.springer.com/chapter/10.1007/978-3-642-39784-4_2)
- [AllegroGraph Materialized Reasoner](https://franz.com/agraph/support/documentation/current/materializer.html)

### Incremental Reasoning
- [RDFox: The Knowledge Graph and Reasoning Engine](https://www.oxfordsemantic.tech/rdfox)
- [What is Incremental Reasoning?](https://www.oxfordsemantic.tech/faqs/what-is-incremental-reasoning)
- [RDFox: Incremental Materialisation](http://www.cs.ox.ac.uk/isg/tools/RDFox/2015/AAAI/Incremental/)
- [Managing Implicit Facts with RDFox](https://www.poolparty.biz/blogposts/managing-iimplicit-facts-poolparty-using-rdfox/)

### Provenance
- [PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/) - W3C Recommendation
- [What Is RDF-star](https://www.ontotext.com/knowledgehub/fundamentals/what-is-rdf-star/)
- [RDF-star Patterns for Provenance](https://www.w3.org/community/rdf-dev/2022/01/26/provenance-in-rdf-star/)
- [Named Graph Pattern](https://patterns.dataincubator.org/book/named-graphs.html)
- [Named Graphs, Provenance and Trust](https://www.researchgate.net/publication/234804495_Named_Graphs_Provenance_and_Trust)
- [Provenance in RDF: Survey of Approaches](https://academic.oup.com/dsh/advance-article/doi/10.1093/llc/fqaf076/8219704)
- [Using Named Graphs for Provenance](https://www.w3.org/2011/prov/wiki/Using_named_graphs_to_model_Accounts)
- [Citation Needed: Provenance with RDF-star](https://blog.metaphacts.com/citation-needed-provenance-with-rdf-star)
- [Mapping PROV-O to BFO (Nature 2025)](https://www.nature.com/articles/s41597-025-04580-1)

### Confidence and Uncertainty
- [Uncertainty Management in KG Construction: A Survey](https://arxiv.org/html/2405.16929v2)
- [Knowledge Graphs: Handling Ambiguity and Uncertainty](https://milvus.io/ai-quick-reference/how-do-knowledge-graphs-handle-ambiguity-and-uncertainty)
- [Rule Confidence Aggregation for KG Completion](https://link.springer.com/chapter/10.1007/978-3-031-72407-7_4)
- [Efficient KG Accuracy Estimation (VLDB)](https://dl.acm.org/doi/10.14778/3665844.3665865)

### JavaScript/TypeScript RDF Ecosystem
- [Comunica: A Modular SPARQL Query Engine](https://comunica.github.io/Article-ISWC2018-Resource/)
- [Comunica Documentation](https://comunica.dev/docs/query/)
- [Comunica GitHub](https://github.com/comunica/comunica)
- [RDF JavaScript Libraries](https://rdf.js.org/)
- [Comparison of RDFJS Libraries](https://www.w3.org/community/rdfjs/wiki/Comparison_of_RDFJS_libraries)
- [Oxigraph NPM Package](https://www.npmjs.com/package/oxigraph)
- [Oxigraph GitHub](https://github.com/oxigraph/oxigraph)
- [RDF-star Implementations](https://github.com/w3c/rdf-star/blob/main/implementations.html)

### Datatype Validation
- [rdf-validate-datatype NPM](https://www.npmjs.com/package/rdf-validate-datatype)
- [rdf-validate-datatype GitHub](https://github.com/zazuko/rdf-validate-datatype)
- [rdf-literal NPM](https://www.npmjs.com/package/rdf-literal)
- [XSD Datatypes - RDF Working Group](https://www.w3.org/2011/rdf-wg/wiki/XSD_Datatypes)
- [How to Define a Datatype in RDF](https://drobilla.net/2012/09/08/how-to-define-a-datatype-in-rdf.html)
- [Apache Jena: Typed Literals](https://jena.apache.org/documentation/notes/typed-literals.html)

### Domain/Range Validation
- [RDF2Graph: Recover and Validate Ontology](https://link.springer.com/article/10.1186/s13326-015-0038-9)
- [Fixing Domain and Range in Linked Data](https://ceur-ws.org/Vol-1409/paper-01.pdf)
- [Knowledge Graphs from Cultural Heritage (LLMs + Ontology)](https://arxiv.org/html/2511.10354)
- [OWL Web Ontology Language Reference](https://www.w3.org/TR/owl-ref/)
- [OWL Restrictions](https://www.cs.vu.nl/~guus/public/owl-restrictions/)

### General Resources
- [Validating RDF Data with SHACL (Book)](https://book.validatingrdf.com/bookHtml011.html)
- [Who Says Using RDF is Hard?](https://www.rubensworks.net/blog/2019/10/06/using-rdf-in-javascript/)
- [SHACL Playground](https://shacl-playground.zazuko.com/)
- [Zazuko Developers Guide](https://zazuko.com/get-started/developers/)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-11
**Research Conducted By**: Claude Opus 4.5
**Target System**: Effect-TS Ontology Extraction Pipeline
