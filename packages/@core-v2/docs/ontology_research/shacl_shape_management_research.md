# Research Report: SHACL Shape Management Best Practices for Production Knowledge Graphs

**Date**: 2025-12-18
**Context**: Effect-TS based ontology extraction pipeline for news articles
**Focus**: SHACL shape repositories, standard shapes, design patterns, production tooling

## Executive Summary

This research investigates SHACL shape management best practices for production knowledge graph systems extracting claims from news articles. Key findings:

1. **Shape Repositories**: No centralized SHACL registry exists comparable to LOV for ontologies; shapes are distributed across domain-specific GitHub repositories and community projects
2. **Standard Shapes**: W3C provides limited official shapes; most production shapes are domain-specific (DCAT-AP, Schema.org via TopQuadrant)
3. **JavaScript Tooling**: Two production-ready validators available - `rdf-validate-shacl` (mature, compatible) and `shacl-engine` (15-26x faster, recommended)
4. **Shape Generation**: Astrea enables automatic generation from OWL ontologies with 60% construct coverage
5. **Design Patterns**: Modularity via `owl:imports`, severity levels for gradual validation, closed vs. open world assumptions for different validation phases

**Recommended Approach for News Article Claims**:
- Bundle custom shapes for claims/provenance in version control
- Generate base shapes from ontology using Astrea
- Use PROV-O shapes from BlueBrain/nexus-prov as starting point
- Implement `shacl-engine` for validation with Effect-TS integration
- Apply three-tier severity model (Info/Warning/Violation) for gradual quality improvement

---

## 1. SHACL Shape Repositories and Sources

### 1.1 Available Shape Repositories

Unlike ontologies (which have LOV - Linked Open Vocabularies), SHACL shapes lack a centralized registry. Shapes are distributed across:

#### GitHub Community Repositories

**AKSW/shacl-shapes**
- URL: https://github.com/AKSW/shacl-shapes
- Purpose: Collaborative repository for SHACL shapes and shape groups
- Status: Community-maintained, accepts contributions
- Content: General-purpose shapes, organized by domain

**MaastrichtU-IDS/shacl-shapes**
- URL: https://github.com/MaastrichtU-IDS/shacl-shapes
- Purpose: Institute of Data Science shape collection
- Integration: Exposed via shapes-of-you registry
- Focus: Academic/research domains

**SkoHub SHACL Shapes**
- URL: https://github.com/skohub-io/shapes
- Purpose: Validation for SKOS vocabularies
- Features: Basic constraints (requiring `skos:prefLabel`, etc.)
- Use Case: Vocabulary quality assurance

#### Domain-Specific Repositories

**DCAT-AP SHACL Validation**
- SEMIC: https://github.com/SEMICeu/dcat-ap_shacl
- German DCAT-AP.de: https://github.com/GovDataOfficial/DCAT-AP.de-SHACL-Validation
- Purpose: Data catalog validation for European data portals
- Coverage: `dcterms:Frequency`, `dcterms:LicenseDocument`, `skos:Concept`, `skos:ConceptScheme`
- Validator: https://www.itb.ec.europa.eu/shacl/dcat-ap/upload

**BlueBrain/nexus-prov** (PROV-O SHACL)
- URL: https://github.com/BlueBrain/nexus-prov
- Purpose: W3C PROV-O validation shapes
- License: Apache 2.0 (code), CC-BY-4.0 (schemas)
- Format: Nexus KG schema envelope
- Coverage: Provenance entities, activities, agents

**Neuroshapes**
- URL: https://incf.github.io/neuroshapes/
- Purpose: Neuroscience data validation
- Reuses: Schema.org, W3C PROV-O
- Integration: Inherited PROV shapes from nexus-prov, now maintained separately

#### Vendor-Provided Shapes

**TopQuadrant Schema.org SHACL**
- URL: https://datashapes.org/schema
- Source: RDFa data model converted to SHACL
- Status: Canonical Schema.org SHACL representation
- Includes: Hand-written example file demonstrating SHACL vocabulary elements

### 1.2 Shapes for Common Vocabularies

| Vocabulary | SHACL Availability | Source | Notes |
|------------|-------------------|--------|-------|
| **PROV-O** | Available | BlueBrain/nexus-prov | Provenance tracking |
| **Schema.org** | Available | TopQuadrant datashapes.org | Full coverage |
| **DCAT** | Available | SEMICeu, GovDataOfficial | Data catalogs |
| **SKOS** | Available | SkoHub | Vocabulary validation |
| **Dublin Core** | Limited | DCAT-AP extensions | Via DCAT-AP profiles |
| **FOAF** | No official shapes | Community | Generate via Astrea |
| **GeoSPARQL** | Mentioned | Not located | Referenced in literature |

### 1.3 Academic Research on Shape Extraction

**Astrea: Automatic Generation of SHACL Shapes from Ontologies**
- Paper: ESWC 2020 (Cimmino, Fernández-Izquierdo, García-Castro)
- URL: https://github.com/oeg-upm/Astrea
- Web App: https://astrea.linkeddata.es/
- Method: SPARQL queries mapping OWL constructs to SHACL patterns
- Coverage: 158 mappings, 60% of SHACL restrictions
- Validation: Time ontology (65%), SAREF (77%), SSN (56%), DBpedia (38%)

**SCOOP-UI: SHACL Shape Extraction**
- Paper: ESWC 2025 (Duan, Chaves-Fraga, Dimou)
- Method: "SHACL Shape Extraction in Just a Click"
- Related: "SCOOP All the Constraints' Flavours" (ESWC 2024)

### 1.4 Recommendation: Shape Sourcing Strategy

**For News Article Claims Pipeline:**

1. **Generate Base Shapes from Ontology**
   - Use Astrea to convert custom ontology → SHACL
   - Manual refinement for extraction-specific constraints
   - Version control shapes alongside ontology

2. **Reuse Standard Shapes**
   - PROV-O: Clone BlueBrain/nexus-prov for provenance
   - Schema.org: Import from datashapes.org if using `NewsArticle`/`ClaimReview`
   - Custom constraints: Confidence thresholds, source tracking

3. **Bundle, Don't Fetch**
   - Store shapes in `/ontologies/shacl/` directory
   - Use `owl:imports` for modular composition
   - Version shapes with semantic versioning (align with ontology versions)

4. **No Central Registry Needed**
   - Shapes are application-specific (extraction quality != general validation)
   - Bundle shapes as part of deployment artifact
   - External shapes fetched at build time, not runtime

---

## 2. SHACL Shape Design Patterns

### 2.1 Pattern 1: Separate Class and Shape

**Structure**: Class and shape are distinct entities linked via `sh:targetClass`

```turtle
ex:Person a rdfs:Class .

ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:path ex:name ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
  ] .
```

**When to Use**:
- Validating third-party ontologies (you don't "own" the class definitions)
- Multiple validation profiles for same class (strict vs. lenient)
- Keeping SHACL separate from OWL semantics

### 2.2 Pattern 2: Implicit Class Target (Combined Class/Shape)

**Structure**: Same IRI for class and shape

```turtle
ex:Person a rdfs:Class, sh:NodeShape ;
  sh:property [
    sh:path ex:name ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
  ] .
```

**Pros**:
- Low maintenance (DRY principle)
- Convenient for ontology "owners"
- Less verbose

**Cons**:
- Conflates class and shape concepts
- Dangerous in open semantic web (different roles)
- Less flexible for reuse

**Recommendation**: Use Pattern 1 (separate) for extraction pipeline to enable multiple validation profiles (extraction-time vs. storage-time).

### 2.3 Modularity with `owl:imports`

**Pattern**: Reference external shapes graphs

```turtle
@prefix owl: <http://www.w3.org/2002/07/owl#> .

# Main shapes graph
<http://example.org/shapes/claims> a owl:Ontology ;
  owl:imports <http://example.org/shapes/provenance> ,
              <http://example.org/shapes/entities> .

# SHACL processor follows imports transitively
```

**Use Cases**:
1. **Shared constraints**: Reuse `email` / `date` / `URI` validations
2. **Domain separation**: Claims shapes / Entity shapes / Provenance shapes
3. **Versioning**: Import specific versions of external shapes

**Best Practice**:
- Use IRIs (not blank nodes) for property shapes to enable reuse
- Example: `ex:PersonShape-name` (not `[ sh:path ex:name ]`)

### 2.4 Deactivation for Flexibility

**Pattern**: Disable imported shapes without forking

```turtle
# Imported shape (from external source)
ex:StrictEmailShape a sh:PropertyShape ;
  sh:path ex:email ;
  sh:pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" .

# Your shapes graph
ex:StrictEmailShape sh:deactivated true .
```

**Use Case**: Reusing shapes from others while disagreeing with specific constraints

### 2.5 Named Property Shapes for Reuse

**Pattern**: URI-based property shapes

```turtle
ex:GivenNamePropertyShape a sh:PropertyShape ;
  sh:path ex:givenName ;
  sh:datatype xsd:string ;
  sh:minCount 1 .

ex:FamilyNamePropertyShape a sh:PropertyShape ;
  sh:path ex:familyName ;
  sh:datatype xsd:string ;
  sh:minCount 1 .

# Reuse in multiple node shapes
ex:PersonShape sh:property ex:GivenNamePropertyShape ,
                            ex:FamilyNamePropertyShape .
ex:AuthorShape sh:property ex:GivenNamePropertyShape ,
                           ex:FamilyNamePropertyShape .
```

**Benefits**: Quickly assemble properties into different configurations

---

## 3. Severity Levels and Validation Strategies

### 3.1 SHACL Severity Levels

**Built-in Severities** (default: `sh:Violation`):
- `sh:Violation`: Data is invalid, fails conformance
- `sh:Warning`: Data passes conformance but may have issues
- `sh:Info`: Informational only, does not affect conformance

**Custom Severities**: Users can define additional levels

### 3.2 Setting Severity

```turtle
ex:MandatoryNameShape a sh:PropertyShape ;
  sh:path ex:name ;
  sh:minCount 1 ;
  sh:severity sh:Violation .  # Explicit (default if omitted)

ex:RecommendedEmailShape a sh:PropertyShape ;
  sh:path ex:email ;
  sh:minCount 1 ;
  sh:severity sh:Warning .  # Data conforms even if missing

ex:OptionalDescriptionShape a sh:PropertyShape ;
  sh:path ex:description ;
  sh:minCount 1 ;
  sh:severity sh:Info .  # Informational hint
```

### 3.3 Validation Report Handling

**ValidationReport Structure**:
```turtle
[ a sh:ValidationReport ;
  sh:conforms false ;  # false if ANY sh:Violation
  sh:result [
    a sh:ValidationResult ;
    sh:resultSeverity sh:Warning ;
    sh:focusNode ex:Alice ;
    sh:sourceConstraintComponent sh:MinCountConstraintComponent ;
    sh:resultMessage "Recommended property 'email' missing"
  ]
] .
```

**Conformance Rules**:
- `sh:conforms true`: No `sh:Violation` results
- `sh:Warning` and `sh:Info` do not prevent conformance
- Validators may support `--allow-warnings` flag to filter severities

### 3.4 Practical Severity Strategy for Extraction

**Three-Tier Model**:

| Severity | Use For | Example |
|----------|---------|---------|
| **Violation** | Critical data quality (breaks downstream processing) | Missing entity IRI, invalid datatype, broken provenance |
| **Warning** | Recommended but not required (quality hints) | Missing confidence score, no entity description, sparse properties |
| **Info** | Enhancement suggestions (nice-to-have) | Additional metadata, optional annotations |

**Phased Validation Approach**:

1. **Phase 1 - Extraction Time** (lenient):
   - Violations: Only structural issues (malformed IRIs, type mismatches)
   - Warnings: Missing recommended properties
   - Info: All optional enhancements

2. **Phase 2 - Pre-Storage** (strict):
   - Violations: All critical + recommended constraints
   - Warnings: Optional but valuable properties
   - Info: Metadata completeness

**Effect-TS Integration**:
```typescript
interface ValidationConfig {
  allowWarnings: boolean
  allowInfo: boolean
  failOnViolation: boolean
}

// Extraction-time: lenient
const extractionConfig: ValidationConfig = {
  allowWarnings: true,
  allowInfo: true,
  failOnViolation: true  // Only violations fail
}

// Storage-time: strict
const storageConfig: ValidationConfig = {
  allowWarnings: false,  // Warnings also fail
  allowInfo: true,
  failOnViolation: true
}
```

---

## 4. Closed vs. Open World Validation

### 4.1 Philosophical Divide

**OWL (Open World Assumption - OWA)**:
- Absence of information = unknown (not false)
- Reasoning infers new facts from incomplete data
- Example: If `ex:age` has domain `ex:Person`, and `ex:Alice ex:age 30`, infer `ex:Alice a ex:Person`

**SHACL (Closed World Assumption - CWA)**:
- Absence of information = false/invalid
- Validates data as-is, no inference
- Example: If shape requires `ex:name`, absence of `ex:name` = violation

### 4.2 Closed Shapes in SHACL

**Pattern**: Restrict properties to explicitly allowed set

```turtle
ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:closed true ;
  sh:ignoredProperties ( rdf:type ) ;
  sh:property [
    sh:path ex:name ;
  ] ;
  sh:property [
    sh:path ex:email ;
  ] .
```

**Behavior**:
- Only `rdf:type`, `ex:name`, `ex:email` allowed
- Any other property (e.g., `ex:birthDate`) → violation

**Use Cases**:
- Data quality enforcement (prevent unexpected properties)
- Schema evolution control (catch typos, deprecated properties)
- API contract validation (ensure clients send expected fields)

### 4.3 Open Shapes (Default)

**Pattern**: No `sh:closed` constraint

```turtle
ex:FlexiblePersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:path ex:name ;
    sh:minCount 1 ;
  ] .
# Any additional properties allowed
```

**When to Use**:
- Extraction pipeline (LLMs may discover new properties)
- Evolving ontologies (properties added over time)
- Integration with third-party data

### 4.4 Combining SHACL and OWL

**Challenge**: Semantic gap between OWA (OWL) and CWA (SHACL)

**Solutions**:

**1. Pre-Validation Reasoning (Re-SHACL Pattern)**
```
Data Graph → Targeted RDFS Reasoning → Enhanced Graph → SHACL Validation
```
- Materialize only needed inferences (domain/range)
- Validate enhanced graph under CWA
- Avoids full OWL closure computation

**2. SHACL Validation with Reasoning Awareness**
```turtle
# Shape aware of RDFS reasoning
ex:PersonShape a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:path rdf:type ;
    sh:hasValue ex:Person ;
    sh:minCount 1 ;
  ] .
# Passes if type inferred from domain/range
```

**3. Separate Validation Profiles**
- **Asserted Data Validation**: SHACL over raw extraction (catch LLM errors)
- **Inferred Data Validation**: SHACL over reasoned graph (check semantic correctness)

### 4.5 Recommendation for Extraction Pipeline

**Use Open Shapes with Targeted Constraints**:

```turtle
# Open to new properties (LLM discovery)
ex:ClaimShape a sh:NodeShape ;
  sh:targetClass ex:Claim ;
  sh:closed false ;  # Explicit (default behavior)

  # Validate only known critical properties
  sh:property [
    sh:path ex:claimText ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;
  sh:property [
    sh:path prov:wasAttributedTo ;
    sh:nodeKind sh:IRI ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;
  sh:property [
    sh:path ex:confidence ;
    sh:datatype xsd:decimal ;
    sh:minInclusive 0.0 ;
    sh:maxInclusive 1.0 ;
    sh:severity sh:Warning ;  # Recommended but not required
  ] .
```

**Rationale**:
- Closed shapes prevent ontology evolution
- Extraction should discover new properties (open world)
- Validation ensures critical properties present (closed world for specific paths)

---

## 5. Custom Constraint Components

### 5.1 SPARQL-Based Constraints

**Pattern**: Define custom validation logic with SPARQL

```turtle
ex:UniqueEmailConstraint a sh:SPARQLConstraint ;
  sh:message "Email must be unique across all persons" ;
  sh:prefixes [
    sh:declare [
      sh:prefix "ex" ;
      sh:namespace "http://example.org/"^^xsd:anyURI ;
    ]
  ] ;
  sh:select """
    SELECT $this ?email
    WHERE {
      $this ex:email ?email .
      FILTER EXISTS {
        ?other ex:email ?email .
        FILTER (?other != $this)
      }
    }
  """ .

ex:PersonShape sh:sparql ex:UniqueEmailConstraint .
```

**Use Cases**:
- Cross-entity constraints (uniqueness, referential integrity)
- Complex business rules (conditional validation)
- Aggregate constraints (count, sum, average)

### 5.2 SPARQL ASK vs. SELECT

**ASK Query** (Boolean result):
```turtle
ex:ValidDateRangeConstraint a sh:SPARQLConstraint ;
  sh:ask """
    ASK {
      $this ex:startDate ?start ;
            ex:endDate ?end .
      FILTER (?start <= ?end)
    }
  """ .
```
- Returns true → valid
- Returns false → violation

**SELECT Query** (Extract failing values):
```turtle
ex:InvalidDateRangeConstraint a sh:SPARQLConstraint ;
  sh:select """
    SELECT $this ?start ?end
    WHERE {
      $this ex:startDate ?start ;
            ex:endDate ?end .
      FILTER (?start > ?end)
    }
  """ .
```
- Returns bindings → violations reported with `?start`, `?end` values
- Returns empty → valid

### 5.3 Performance Considerations

**SPARQL Constraints Are Expensive**:
- Each constraint = SPARQL query execution
- `shacl-engine` supports SPARQL but has overhead
- `rdf-validate-shacl` supports SPARQL constraints

**Optimization Strategies**:
1. **Prefer Core Constraints**: Use `sh:minCount`, `sh:datatype`, `sh:pattern` over SPARQL
2. **Limit SPARQL to Complex Logic**: Only use SPARQL for constraints not expressible in Core
3. **Cache SPARQL Results**: Reuse queries across multiple focus nodes
4. **Index Your Store**: Ensure triple store has proper indexes for SPARQL patterns

### 5.4 Custom Constraint Components (Advanced)

**Pattern**: Define reusable constraint types

```turtle
# Define constraint component
ex:EmailDomainConstraintComponent a sh:ConstraintComponent ;
  sh:parameter [
    sh:path ex:allowedDomain ;
    sh:datatype xsd:string ;
  ] ;
  sh:validator [
    a sh:SPARQLSelectValidator ;
    sh:select """
      SELECT $this ?value
      WHERE {
        $this $PATH ?value .
        FILTER (!CONTAINS(STR(?value), $allowedDomain))
      }
    """ ;
  ] .

# Use constraint
ex:PersonEmailShape sh:property [
  sh:path ex:email ;
  ex:allowedDomain "example.org" ;
] .
```

**Recommendation**: Stick with Core + SPARQL constraints for extraction pipeline; custom components add complexity without clear benefit for typical use cases.

---

## 6. JavaScript/TypeScript SHACL Validators

### 6.1 rdf-validate-shacl (Zazuko)

**Status**: Mature, widely-used, RDF/JS compatible

**Installation**:
```bash
npm install rdf-validate-shacl
```

**Basic Usage**:
```typescript
import SHACLValidator from 'rdf-validate-shacl'
import { Store } from 'n3'

const shapesGraph = new Store()
const dataGraph = new Store()
// ... load shapes and data

const validator = new SHACLValidator(shapesGraph)
const report = validator.validate(dataGraph)

console.log('Conforms:', report.conforms)
report.results.forEach(result => {
  console.log('Severity:', result.severity?.value)
  console.log('Message:', result.message)
  console.log('Focus:', result.focusNode?.value)
  console.log('Path:', result.path?.value)
})
```

**Features**:
- Core SHACL validation
- SPARQL-based constraints (via `sh:sparql`)
- Returns RDF/JS Dataset with validation report
- TypeScript definitions: `@types/rdf-validate-shacl`

**Performance**: Similar to pySHACL; bottleneck on large datasets due to repeated `Dataset.match` calls

**Recommendation**: Solid choice for moderate datasets (<100K triples)

### 6.2 shacl-engine (rdf-ext)

**Status**: High-performance, optimized for RDF/JS

**Installation**:
```bash
npm install shacl-engine rdf-ext
```

**Usage**:
```typescript
import SHACLValidator from 'shacl-engine'
import rdf from 'rdf-ext'

const validator = new SHACLValidator(shapes, {
  factory: rdf,
  debug: false,    // Show passed validations
  coverage: true   // Track covered triples
})

const report = await validator.validate({ dataset })

console.log('Conforms:', report.conforms)
report.results.forEach(result => {
  console.log('Message:', result.message)
  console.log('Path:', result.path?.value)
  console.log('Details:', result.detail)  // Coverage info
})
```

**Performance**: 15-26x faster than rdf-validate-shacl and pySHACL

**Why Faster**:
- Caches property/value lookups (avoids repeated `Dataset.match`)
- Optimized for RDF/JS datasets
- Profiler-driven optimization

**Features**:
- Core SHACL validation
- SPARQL-based constraints
- SPARQL-based targets
- Debug output (show passed validations)
- Coverage tracking (which triples matched which shapes)

**Recommendation**: **Production choice** for high-throughput pipelines

### 6.3 Performance Comparison

| Implementation | Relative Speed | Platform | Notes |
|---------------|---------------|----------|-------|
| pySHACL | 1x (baseline) | Python | Mature, widely used |
| rdf-validate-shacl | ~1x | JavaScript | RDF/JS compatible |
| **shacl-engine** | **15-26x** | JavaScript | **Recommended** |
| RDF4J | Very fast | Java | Enterprise, transactional |
| rudof | Very fast | Rust | Emerging |

**Benchmark Data** (shacl-engine):
- Validates shacl-shacl shapes against themselves: 15x faster
- Real-world examples: 26x faster
- Profiler analysis: Eliminated repeated `Dataset.match` calls

### 6.4 Effect-TS Integration Pattern

**Wrap SHACL Validator as Effect Service**:

```typescript
import { Effect, Layer, Context } from 'effect'
import SHACLValidator from 'shacl-engine'
import rdf from 'rdf-ext'
import type { Store } from 'n3'

// Define error
class ShaclValidationError extends Schema.TaggedError<ShaclValidationError>()(
  'ShaclValidationError',
  {
    message: Schema.String,
    violations: Schema.Array(Schema.Unknown)
  }
) {}

// Define service
export class ShaclService extends Effect.Service<ShaclService>()('ShaclService', {
  effect: Effect.gen(function* () {
    const config = yield* ConfigService

    // Load shapes graph (cached)
    const shapes = yield* Effect.promise(() => loadShapes(config.shapesPath))

    return {
      validate: (dataGraph: Store) =>
        Effect.gen(function* () {
          const validator = new SHACLValidator(shapes, {
            factory: rdf,
            debug: false,
            coverage: true
          })

          const report = yield* Effect.tryPromise({
            try: () => validator.validate({ dataset: dataGraph }),
            catch: (error) => new ShaclValidationError({
              message: `Validation failed: ${error}`,
              violations: []
            })
          })

          if (!report.conforms) {
            return yield* Effect.fail(new ShaclValidationError({
              message: `Data does not conform to shapes`,
              violations: report.results
            }))
          }

          return report
        })
    }
  }),
  dependencies: [ConfigService.Default],
  accessors: true
}) {}
```

**Usage in Extraction Pipeline**:

```typescript
const extractAndValidate = Effect.gen(function* () {
  const rdfBuilder = yield* RdfBuilder
  const shaclService = yield* ShaclService

  // Extract to RDF graph
  const graph = yield* rdfBuilder.buildGraph(extractedData)

  // Validate
  const report = yield* shaclService.validate(graph)

  // Proceed with validated graph
  return graph
}).pipe(
  Effect.catchTag('ShaclValidationError', (error) =>
    Effect.gen(function* () {
      // Log violations for debugging
      yield* Effect.logError('SHACL Validation Failed', error.violations)

      // Optionally: Store invalid graph for manual review
      yield* storeInvalidGraph(graph, error.violations)

      return yield* Effect.fail(error)
    })
  )
)
```

### 6.5 Tooling for Shape Development

**SHACL Playground**
- URL: https://shacl.org/playground/
- Platform: Browser-based, JavaScript
- Features: Validate shapes against sample data (Turtle, JSON-LD)
- Use Case: Quick experimentation, shape prototyping

**SHACL Shape Generator (Selqio)**
- URL: https://selqio.com/tools/shacl-shape-generator
- Purpose: Generate shapes from RDF data
- Use Case: Bootstrap shapes from example extractions

**Astrea Web Application**
- URL: https://astrea.linkeddata.es/
- Purpose: Generate SHACL shapes from OWL ontologies
- Method: SPARQL-based mapping (158 patterns)
- Use Case: Automated shape generation from ontology

**SEMIC SHACL Validator**
- URL: https://www.itb.ec.europa.eu/shacl/dcat-ap/upload
- Purpose: Validate against DCAT-AP shapes
- Use Case: Test DCAT/Dublin Core shapes

---

## 7. Production Considerations

### 7.1 Bundling vs. Fetching Shapes

**Bundling (Recommended)**:

**Pros**:
- Deterministic validation (no network dependency)
- Versioned with application code
- Faster startup (no HTTP fetches)
- Offline development/testing

**Cons**:
- Shapes embedded in deployment artifact
- Manual update when external shapes change

**Implementation**:
```typescript
// Bundle shapes at build time
const shapesGraph = await loadShapesFromFile('./ontologies/shacl/claims.ttl')

// Or embed in code
const shapesGraph = await parseInline(`
  @prefix sh: <http://www.w3.org/ns/shacl#> .
  @prefix ex: <http://example.org/> .

  ex:ClaimShape a sh:NodeShape ;
    sh:targetClass ex:Claim ;
    sh:property [ ... ] .
`)
```

**Fetching (Not Recommended for Production)**:

**Pros**:
- Always latest shapes
- Centralized shape management

**Cons**:
- Network dependency (fetches at runtime)
- Version skew (shapes change, app doesn't)
- Latency on startup

**When to Fetch**:
- Development/testing only
- Non-critical validation (optional quality checks)

### 7.2 Shape Versioning

**Strategy**: Semantic Versioning Aligned with Ontology

```
ontologies/
  ontology.ttl  (v2.3.0)
  shacl/
    shapes-v2.3.0.ttl  (matching ontology version)
    shapes-v2.2.0.ttl  (previous version)
```

**Version Metadata in Shapes**:
```turtle
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

<http://example.org/shapes/claims> a owl:Ontology ;
  dcterms:title "Claim Extraction SHACL Shapes" ;
  owl:versionInfo "2.3.0" ;
  dcterms:created "2025-12-18"^^xsd:date ;
  dcterms:modified "2025-12-18"^^xsd:date ;
  owl:imports <http://example.org/ontology/2.3.0> .
```

**Changelog**:
```markdown
# shapes-changelog.md

## v2.3.0 (2025-12-18)
- Added confidence score constraint (0.0-1.0 range)
- Relaxed email constraint from Violation to Warning
- Added PROV-O activity tracking shapes

## v2.2.0 (2025-12-01)
- Initial SHACL shapes from Astrea
```

### 7.3 Testing Shapes

**Test Strategy**: Positive and Negative Test Cases

**1. Valid Data Test Cases** (should pass):
```turtle
# test/shacl/valid-claim.ttl
@prefix ex: <http://example.org/> .
@prefix prov: <http://www.w3.org/ns/prov#> .

ex:claim1 a ex:Claim ;
  ex:claimText "The economy grew 3% in Q4" ;
  ex:confidence 0.92 ;
  prov:wasAttributedTo ex:article1 .
```

**2. Invalid Data Test Cases** (should fail):
```turtle
# test/shacl/invalid-claim-missing-text.ttl
ex:claim2 a ex:Claim ;
  ex:confidence 0.85 ;
  prov:wasAttributedTo ex:article2 .
  # Missing required ex:claimText
```

**Test Implementation**:
```typescript
import { describe, it, expect } from 'vitest'
import { parseFile } from './utils'

describe('SHACL Shapes', () => {
  it('validates well-formed claim', async () => {
    const shapes = await parseFile('ontologies/shacl/claims.ttl')
    const data = await parseFile('test/shacl/valid-claim.ttl')

    const validator = new SHACLValidator(shapes, { factory: rdf })
    const report = await validator.validate({ dataset: data })

    expect(report.conforms).toBe(true)
  })

  it('rejects claim without claimText', async () => {
    const shapes = await parseFile('ontologies/shacl/claims.ttl')
    const data = await parseFile('test/shacl/invalid-claim-missing-text.ttl')

    const validator = new SHACLValidator(shapes, { factory: rdf })
    const report = await validator.validate({ dataset: data })

    expect(report.conforms).toBe(false)
    expect(report.results).toHaveLength(1)
    expect(report.results[0].path?.value).toBe('http://example.org/claimText')
  })
})
```

**3. Test Coverage**:
- All shape constraints (minCount, datatype, pattern, etc.)
- Severity levels (Violation, Warning, Info)
- SPARQL constraints
- Closed shape behavior
- Modular shapes (`owl:imports`)

### 7.4 Shape Documentation

**Best Practices**:

1. **Use `sh:name` and `sh:description`**:
```turtle
ex:ClaimShape a sh:NodeShape ;
  sh:name "Claim Validation Shape" ;
  sh:description "Validates extracted claims from news articles" ;
  sh:targetClass ex:Claim ;
  sh:property [
    sh:path ex:claimText ;
    sh:name "Claim Text" ;
    sh:description "The textual content of the claim" ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
  ] .
```

2. **Custom Messages**:
```turtle
ex:ClaimShape sh:property [
  sh:path ex:confidence ;
  sh:datatype xsd:decimal ;
  sh:minInclusive 0.0 ;
  sh:maxInclusive 1.0 ;
  sh:message "Confidence score must be between 0.0 and 1.0" ;
] .
```

3. **Generate Documentation**:
   - **TopBraid SHACL API**: Includes HTML documentation generator
   - **Manual**: Markdown table from shapes

**Example Documentation**:
```markdown
# Claim Extraction SHACL Shapes v2.3.0

## ex:ClaimShape

**Target**: `ex:Claim`
**Description**: Validates extracted claims from news articles

### Properties

| Property | Type | Cardinality | Severity | Description |
|----------|------|-------------|----------|-------------|
| `ex:claimText` | `xsd:string` | 1..* | Violation | The textual content of the claim |
| `ex:confidence` | `xsd:decimal` (0.0-1.0) | 0..1 | Warning | Extraction confidence score |
| `prov:wasAttributedTo` | IRI | 1..* | Violation | Source article/document |
```

### 7.5 Performance Implications

**Validation Overhead**:

| Graph Size | shacl-engine | rdf-validate-shacl | Notes |
|------------|--------------|-------------------|-------|
| <1K triples | <10ms | <50ms | Negligible |
| 1K-10K | <100ms | <1s | Acceptable |
| 10K-100K | <1s | <10s | Use shacl-engine |
| 100K-1M | <10s | Minutes | Consider incremental validation |

**Optimization Strategies**:

1. **Use shacl-engine** (15-26x faster)
2. **Incremental Validation** (UpSHACL pattern):
   - Validate only changed triples + affected neighbors
   - 10x speedup over full validation
3. **Targeted Reasoning** (Re-SHACL pattern):
   - Apply only needed RDFS rules before validation
   - Avoids full closure computation
4. **Parallel Validation**:
   - Validate independent shapes concurrently
   - RDF4J pattern (not in JS validators yet)
5. **Shape Simplification**:
   - Prefer Core constraints over SPARQL
   - Minimize SPARQL-based constraints

**Effect-TS Concurrency**:
```typescript
// Validate multiple graphs in parallel
const validateBatch = (graphs: Store[]) =>
  Effect.forEach(graphs, graph => shaclService.validate(graph), {
    concurrency: 4  // Validate 4 graphs concurrently
  })
```

---

## 8. Recommended Shapes for Claims/Articles/Provenance

### 8.1 Claim Validation Shapes

```turtle
@prefix ex: <http://example.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix prov: <http://www.w3.org/ns/prov#> .

ex:ClaimShape a sh:NodeShape ;
  sh:name "Claim Shape" ;
  sh:description "Validates claims extracted from news articles" ;
  sh:targetClass ex:Claim ;

  # Required: Claim text
  sh:property [
    sh:path ex:claimText ;
    sh:name "Claim Text" ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:minLength 10 ;
    sh:severity sh:Violation ;
    sh:message "Claim must have text content (min 10 characters)" ;
  ] ;

  # Required: Source attribution
  sh:property [
    sh:path prov:wasAttributedTo ;
    sh:name "Source Attribution" ;
    sh:nodeKind sh:IRI ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "Claim must be attributed to a source" ;
  ] ;

  # Recommended: Confidence score
  sh:property [
    sh:path ex:confidence ;
    sh:name "Confidence Score" ;
    sh:datatype xsd:decimal ;
    sh:minInclusive 0.0 ;
    sh:maxInclusive 1.0 ;
    sh:maxCount 1 ;
    sh:severity sh:Warning ;
    sh:message "Confidence score should be provided (0.0-1.0)" ;
  ] ;

  # Optional: Claim date
  sh:property [
    sh:path ex:claimDate ;
    sh:name "Claim Date" ;
    sh:datatype xsd:date ;
    sh:maxCount 1 ;
    sh:severity sh:Info ;
  ] ;

  # Recommended: Entity mentions
  sh:property [
    sh:path ex:mentions ;
    sh:name "Entity Mentions" ;
    sh:nodeKind sh:IRI ;
    sh:severity sh:Info ;
    sh:message "Claims should reference entities when applicable" ;
  ] .
```

### 8.2 NewsArticle Shapes (Schema.org)

**Option 1**: Use TopQuadrant Schema.org shapes
- URL: https://datashapes.org/schema
- Import: `owl:imports <https://datashapes.org/schema.ttl>`

**Option 2**: Custom NewsArticle shapes

```turtle
ex:NewsArticleShape a sh:NodeShape ;
  sh:targetClass schema:NewsArticle ;

  # Required: Headline
  sh:property [
    sh:path schema:headline ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Required: Publication date
  sh:property [
    sh:path schema:datePublished ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Required: Author
  sh:property [
    sh:path schema:author ;
    sh:or (
      [ sh:class schema:Person ]
      [ sh:class schema:Organization ]
    ) ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Recommended: Article body
  sh:property [
    sh:path schema:articleBody ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
  ] ;

  # Optional: Publisher
  sh:property [
    sh:path schema:publisher ;
    sh:class schema:Organization ;
    sh:severity sh:Info ;
  ] .
```

### 8.3 ClaimReview Shapes (Schema.org)

**For Fact-Checking Integration**:

```turtle
ex:ClaimReviewShape a sh:NodeShape ;
  sh:targetClass schema:ClaimReview ;

  # Required: Claim reviewed
  sh:property [
    sh:path schema:claimReviewed ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Required: Review author
  sh:property [
    sh:path schema:author ;
    sh:or (
      [ sh:class schema:Person ]
      [ sh:class schema:Organization ]
    ) ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Recommended: Review rating
  sh:property [
    sh:path schema:reviewRating ;
    sh:class schema:Rating ;
    sh:severity sh:Warning ;
  ] ;

  # Required: Item reviewed (NewsArticle)
  sh:property [
    sh:path schema:itemReviewed ;
    sh:class schema:CreativeWork ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] .
```

### 8.4 Provenance Shapes (PROV-O)

**Source**: BlueBrain/nexus-prov (Apache 2.0 + CC-BY-4.0)

**Activity Shape**:
```turtle
ex:ExtractionActivityShape a sh:NodeShape ;
  sh:targetClass prov:Activity ;

  # Required: Start time
  sh:property [
    sh:path prov:startedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Required: End time
  sh:property [
    sh:path prov:endedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:maxCount 1 ;
    sh:severity sh:Warning ;
  ] ;

  # Required: Used entity
  sh:property [
    sh:path prov:used ;
    sh:class prov:Entity ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Required: Associated agent
  sh:property [
    sh:path prov:wasAssociatedWith ;
    sh:class prov:Agent ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] .
```

**Entity Shape**:
```turtle
ex:ExtractedGraphShape a sh:NodeShape ;
  sh:targetClass prov:Entity ;

  # Required: Was generated by
  sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:class prov:Activity ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Required: Was derived from
  sh:property [
    sh:path prov:wasDerivedFrom ;
    sh:class prov:Entity ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Optional: Generation time
  sh:property [
    sh:path prov:generatedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:maxCount 1 ;
    sh:severity sh:Info ;
  ] .
```

**Agent Shape**:
```turtle
ex:LlmAgentShape a sh:NodeShape ;
  sh:targetClass prov:Agent ;

  # Required: Agent name
  sh:property [
    sh:path rdfs:label ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
  ] ;

  # Recommended: Model version
  sh:property [
    sh:path ex:modelVersion ;
    sh:datatype xsd:string ;
    sh:severity sh:Warning ;
  ] .
```

### 8.5 Shape Composition for Complete Validation

**Main Shapes Graph**:
```turtle
<http://example.org/shapes/extraction> a owl:Ontology ;
  owl:versionInfo "2.3.0" ;
  owl:imports <http://example.org/shapes/claims> ,
              <http://example.org/shapes/articles> ,
              <http://example.org/shapes/provenance> .
```

**Directory Structure**:
```
ontologies/
  shacl/
    extraction-v2.3.0.ttl      # Main (imports others)
    claims-v2.3.0.ttl          # Claim shapes
    articles-v2.3.0.ttl        # NewsArticle/ClaimReview shapes
    provenance-v2.3.0.ttl      # PROV-O shapes
    entities-v2.3.0.ttl        # Entity shapes (Person, Org, etc.)
```

---

## 9. Implementation Recommendations

### 9.1 Immediate Actions (Week 1-2)

**1. Integrate shacl-engine**

**File**: `packages/@core-v2/src/Service/ShaclService.ts`

```typescript
import SHACLValidator from 'shacl-engine'
import rdf from 'rdf-ext'
import { Effect, Layer } from 'effect'

export class ShaclService extends Effect.Service<ShaclService>()('ShaclService', {
  effect: Effect.gen(function* () {
    const config = yield* ConfigService
    const rdfBuilder = yield* RdfBuilder

    // Load shapes at service initialization
    const shapes = yield* Effect.promise(() =>
      rdfBuilder.parseFile(config.shapesPath)
    )

    return {
      validate: (dataGraph: Store, options?: { allowWarnings?: boolean }) =>
        Effect.gen(function* () {
          const validator = new SHACLValidator(shapes, {
            factory: rdf,
            debug: false,
            coverage: true
          })

          const report = yield* Effect.tryPromise({
            try: () => validator.validate({ dataset: dataGraph }),
            catch: (error) => new ShaclValidationError({
              message: `SHACL validation engine error: ${error}`,
              violations: []
            })
          })

          // Filter by severity if allowWarnings=true
          const violations = report.results.filter(r =>
            options?.allowWarnings
              ? r.severity?.value === 'http://www.w3.org/ns/shacl#Violation'
              : true
          )

          if (violations.length > 0) {
            return yield* Effect.fail(new ShaclValidationError({
              message: `SHACL validation failed with ${violations.length} violations`,
              violations
            }))
          }

          return report
        })
    }
  }),
  dependencies: [ConfigService.Default, RdfBuilder.Default],
  accessors: true
}) {}
```

**Effort**: 1-2 days
**Impact**: Production-ready SHACL validation (15-26x faster)

**2. Generate Base Shapes from Ontology**

**Process**:
1. Export ontology: `packages/@core-v2/ontologies/ontology.ttl`
2. Visit Astrea: https://astrea.linkeddata.es/
3. Upload ontology, generate shapes
4. Download shapes: `packages/@core-v2/ontologies/shacl/generated-shapes-v1.0.0.ttl`
5. Manual refinement:
   - Add confidence constraints
   - Set severity levels
   - Add custom messages
   - Add provenance shapes

**Effort**: 3-5 days
**Impact**: Ontology-driven validation, catch type errors, domain/range violations

**3. Bundle PROV-O Shapes**

**Process**:
1. Clone: `git clone https://github.com/BlueBrain/nexus-prov.git`
2. Extract shapes: `nexus-prov/modules/prov-shacl/src/main/resources/prov-shacl.ttl`
3. Copy to: `packages/@core-v2/ontologies/shacl/prov-shapes-v1.0.0.ttl`
4. Import in main shapes graph

**Effort**: 1 day
**Impact**: Provenance validation (activities, entities, agents)

### 9.2 Short-Term Enhancements (Month 1)

**4. Implement Severity-Based Validation**

**Pattern**: Lenient extraction-time, strict storage-time

```typescript
// Extraction-time validation (allow warnings)
const extractionReport = yield* shaclService.validate(extractedGraph, {
  allowWarnings: true
})

// Storage-time validation (strict)
const storageReport = yield* shaclService.validate(mergedGraph, {
  allowWarnings: false
})
```

**Effort**: 2-3 days
**Impact**: Gradual quality improvement without blocking extraction

**5. Add SHACL Test Suite**

**Structure**:
```
packages/@core-v2/test/shacl/
  fixtures/
    valid-claim.ttl
    invalid-claim-missing-text.ttl
    invalid-confidence-out-of-range.ttl
  shapes.test.ts
```

**Test Implementation**:
```typescript
describe('SHACL Shapes', () => {
  it.effect('validates valid claim', () =>
    Effect.gen(function* () {
      const shapes = yield* loadShapes()
      const data = yield* loadFixture('valid-claim.ttl')
      const report = yield* shaclService.validate(data)
      expect(report.conforms).toBe(true)
    })
  )

  it.effect('rejects claim without text', () =>
    Effect.gen(function* () {
      const shapes = yield* loadShapes()
      const data = yield* loadFixture('invalid-claim-missing-text.ttl')

      const result = yield* shaclService.validate(data).pipe(
        Effect.either
      )

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left.violations).toHaveLength(1)
        expect(result.left.violations[0].path?.value).toContain('claimText')
      }
    })
  )
})
```

**Effort**: 1 week
**Impact**: Regression prevention, documentation via tests

### 9.3 Medium-Term Architecture (Month 2-3)

**6. Incremental Validation (UpSHACL Pattern)**

**Concept**: Validate only changed triples + affected neighbors

```typescript
interface ValidationDelta {
  addedTriples: Store
  removedTriples: Store
  affectedNodes: Set<NamedNode>
}

const incrementalValidate = (delta: ValidationDelta) =>
  Effect.gen(function* () {
    // 1. Identify affected subgraph
    const subgraph = yield* extractAffectedSubgraph(delta.affectedNodes)

    // 2. Validate subgraph (not full graph)
    const report = yield* shaclService.validate(subgraph)

    return report
  })
```

**Effort**: 2-3 weeks
**Impact**: 10x speedup on updates (per UpSHACL paper)

**7. Targeted RDFS Reasoning (Re-SHACL Pattern)**

**Concept**: Apply only needed reasoning before validation

```typescript
const validateWithReasoning = (dataGraph: Store) =>
  Effect.gen(function* () {
    const reasoningService = yield* ReasoningService

    // 1. Analyze shapes to identify needed rules
    const neededRules = analyzeShapes(shapes)  // e.g., domain/range

    // 2. Apply targeted reasoning
    const enhancedGraph = yield* reasoningService.materialize(
      dataGraph,
      neededRules
    )

    // 3. Validate enhanced graph
    const report = yield* shaclService.validate(enhancedGraph)

    return report
  })
```

**Effort**: 1-2 weeks
**Impact**: Validate inferred triples (type propagation), avoid full closure

### 9.4 Shape Management Workflow

**Version Control**:
```bash
git add ontologies/shacl/
git commit -m "feat: add claim confidence constraint to SHACL shapes v2.4.0"
git tag shacl-v2.4.0
```

**CI/CD Validation**:
```yaml
# .github/workflows/shacl-validation.yml
name: SHACL Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:shacl
```

**Documentation Generation**:
```bash
# Generate shape documentation
node scripts/generate-shape-docs.js \
  --input ontologies/shacl/extraction-v2.4.0.ttl \
  --output docs/shacl-shapes-v2.4.0.md
```

---

## 10. Summary and Quick Reference

### 10.1 Key Takeaways

1. **No Central SHACL Registry**: Bundle shapes in version control, don't fetch at runtime
2. **Astrea for Base Shapes**: Auto-generate from OWL ontology (60% coverage), manual refinement
3. **Use shacl-engine**: 15-26x faster than alternatives, production-ready
4. **Severity Levels**: Violation (critical) / Warning (recommended) / Info (optional)
5. **Open Shapes for Extraction**: Allow LLM to discover new properties, validate critical paths only
6. **PROV-O for Provenance**: Reuse BlueBrain/nexus-prov shapes
7. **Modular Composition**: `owl:imports` for reusable shape libraries
8. **Test Shapes**: Positive and negative test cases, version control fixtures

### 10.2 Recommended Tooling Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Validator | `shacl-engine` | Production validation (15-26x faster) |
| Prototyping | SHACL Playground | Browser-based testing |
| Generation | Astrea | OWL → SHACL (60% automation) |
| Provenance Shapes | BlueBrain/nexus-prov | PROV-O validation |
| Schema.org Shapes | TopQuadrant datashapes | NewsArticle/ClaimReview |
| Testing | Vitest + fixtures | Regression prevention |

### 10.3 Shape Design Checklist

- [ ] Separate class and shape (Pattern 1) for flexibility
- [ ] Use IRIs for property shapes (enable reuse)
- [ ] Set appropriate severity levels (Violation/Warning/Info)
- [ ] Add `sh:name` and `sh:description` for documentation
- [ ] Add custom `sh:message` for clear violation reports
- [ ] Use Core constraints over SPARQL (performance)
- [ ] Use open shapes (extraction discovery) with targeted constraints
- [ ] Modularize with `owl:imports` (claims/provenance/entities)
- [ ] Version shapes with semantic versioning
- [ ] Test shapes with positive/negative fixtures

### 10.4 Production Implementation Sequence

**Phase 1: Foundation (Week 1-2)**
1. Integrate `shacl-engine` (Effect service wrapper)
2. Generate base shapes from ontology (Astrea)
3. Bundle PROV-O shapes (BlueBrain/nexus-prov)
4. Add severity levels (Violation/Warning/Info)

**Phase 2: Quality (Month 1)**
5. Implement lenient/strict validation (extraction vs. storage)
6. Add SHACL test suite (fixtures + Vitest)
7. Document shapes (generate Markdown tables)

**Phase 3: Optimization (Month 2-3)**
8. Incremental validation (UpSHACL pattern)
9. Targeted reasoning (Re-SHACL pattern)
10. Performance monitoring (validation time metrics)

### 10.5 Example Shape for Claims Pipeline

**Minimal Production-Ready Shape**:

```turtle
@prefix ex: <http://example.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix prov: <http://www.w3.org/ns/prov#> .

ex:ClaimShape a sh:NodeShape ;
  sh:targetClass ex:Claim ;
  sh:closed false ;  # Open to LLM discovery

  # Critical: Claim text (Violation)
  sh:property [
    sh:path ex:claimText ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:minLength 10 ;
    sh:severity sh:Violation ;
    sh:message "Claim must have text content (min 10 characters)" ;
  ] ;

  # Critical: Source attribution (Violation)
  sh:property [
    sh:path prov:wasAttributedTo ;
    sh:nodeKind sh:IRI ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "Claim must be attributed to source" ;
  ] ;

  # Recommended: Confidence (Warning)
  sh:property [
    sh:path ex:confidence ;
    sh:datatype xsd:decimal ;
    sh:minInclusive 0.0 ;
    sh:maxInclusive 1.0 ;
    sh:maxCount 1 ;
    sh:severity sh:Warning ;
    sh:message "Confidence score recommended (0.0-1.0)" ;
  ] ;

  # Optional: Entity mentions (Info)
  sh:property [
    sh:path ex:mentions ;
    sh:nodeKind sh:IRI ;
    sh:severity sh:Info ;
  ] .
```

---

## 11. References and Sources

### SHACL Shape Repositories
- [TopQuadrant Schema.org SHACL](https://datashapes.org/schema) - Canonical Schema.org shapes
- [AKSW/shacl-shapes GitHub](https://github.com/AKSW/shacl-shapes) - Community shape repository
- [MaastrichtU-IDS/shacl-shapes](https://github.com/MaastrichtU-IDS/shacl-shapes) - Academic shape collection
- [BlueBrain/nexus-prov](https://github.com/BlueBrain/nexus-prov) - PROV-O SHACL shapes
- [SEMICeu/dcat-ap_shacl](https://github.com/SEMICeu/dcat-ap_shacl) - DCAT-AP validation shapes
- [GovDataOfficial/DCAT-AP.de-SHACL-Validation](https://github.com/GovDataOfficial/DCAT-AP.de-SHACL-Validation) - German DCAT-AP
- [SkoHub SHACL Shapes](https://github.com/skohub-io/shapes) - SKOS vocabulary validation

### SHACL Design Patterns
- [Best practices for designing effective SHACL rules](https://shacl.dev/article/Best_practices_for_designing_effective_SHACL_rules_for_your_data.html)
- [Using Ontology Design Patterns To Define SHACL Shapes](https://ceur-ws.org/Vol-2195/research_paper_3.pdf)
- [SHACL Design Patterns (Validating RDF Book)](https://book.validatingrdf.com/bookHtml011.html)
- [Form Generation using SHACL and DASH](https://www.datashapes.org/forms.html)
- [Design reusable SHACL shapes and implement validation pipeline](https://journal.code4lib.org/articles/14711)

### JavaScript SHACL Validators
- [rdf-validate-shacl GitHub](https://github.com/zazuko/rdf-validate-shacl) - Mature RDF/JS validator
- [shacl-engine GitHub](https://github.com/rdf-ext/shacl-engine) - High-performance validator
- [Implementing a 15x faster JavaScript SHACL Engine](https://www.bergnet.org/2023/03/2023/shacl-engine/) - Performance analysis
- [SHACL Playground](https://shacl.org/playground/) - Browser-based testing

### SHACL Specification and Standards
- [SHACL W3C Recommendation](https://www.w3.org/TR/shacl/) - Official specification
- [SHACL 1.2 Core (First Public Working Draft 2025)](https://www.w3.org/news/2025/first-public-working-drafts-shacl-1-2-core-and-shacl-1-2-sparql-extensions/)
- [SHACL 1.2 Rules](https://www.w3.org/news/2025/first-public-working-draft-shacl-1-2-rules/)
- [SHACL Test Suite and Implementation Report](https://w3c.github.io/data-shapes/data-shapes-test-suite/)

### Shape Generation from Ontologies
- [Astrea: Automatic Generation of SHACL Shapes from Ontologies](https://link.springer.com/chapter/10.1007/978-3-030-49461-2_29)
- [Astrea GitHub](https://github.com/oeg-upm/astrea)
- [Astrea Web Application](https://astrea.linkeddata.es/)
- [SCOOP-UI: SHACL Shape Extraction in Just a Click](https://link.springer.com/chapter/10.1007/978-3-031-78952-6_26)

### Performance and Optimization
- [Trav-SHACL: Efficiently Validating Networks of SHACL Constraints](https://arxiv.org/pdf/2101.07136)
- [UpSHACL: Targeted Constraint Validation for Updates](https://link.springer.com/chapter/10.1007/978-3-032-09527-5_7)
- [Efficient Validation of SHACL Shapes with Reasoning](https://dl.acm.org/doi/10.14778/3681954.3682023)
- [Magic shapes for SHACL validation](https://dl.acm.org/doi/10.14778/3547305.3547329)

### SHACL and Provenance
- [Data Provenance for SHACL](https://openproceedings.org/2023/conf/edbt/paper-3.pdf)
- [Exploring GDPR Compliance Over Provenance Graphs Using SHACL](https://ceur-ws.org/Vol-2198/paper_120.pdf)
- [Neuroshapes (PROV-O integration)](https://incf.github.io/neuroshapes/docs/)

### SHACL vs ShEx
- [Comparing ShEx and SHACL](https://book.validatingrdf.com/bookHtml013.html)
- [SHACL-ShEx-Comparison (W3C Wiki)](https://www.w3.org/2014/data-shapes/wiki/SHACL-ShEx-Comparison)
- [SHACL and ShEx in the Wild: A Community Survey](https://dl.acm.org/doi/10.1145/3487553.3524253)

### Schema.org and Fact-Checking
- [ClaimReview Schema.org Type](https://schema.org/ClaimReview)
- [Fact Check (ClaimReview) Markup for Search](https://developers.google.com/search/docs/appearance/structured-data/factcheck)
- [Schema.org 3.3: News, fact checking](http://blog.schema.org/2017/08/schemaorg-33-news-fact-checking.html)

### Closed vs Open World
- [Open World vs Closed World: Modeling OWL and SHACL Semantics](https://volodymyrpavlyshyn.medium.com/open-world-vs-closed-world-modeling-owl-and-shacl-semantics-in-agda-f4601229630b)
- [SHACL Validation in the Presence of Ontologies](https://arxiv.org/pdf/2507.12286)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Research Conducted By**: Claude Sonnet 4.5
**Target System**: Effect-TS Ontology Extraction Pipeline (News Articles → Claims)
