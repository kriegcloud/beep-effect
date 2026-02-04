# Architectural Decisions for MVP: Analysis and Recommendations

**Date**: 2025-12-18
**Context**: Effect Ontology MVP for Seattle Mayor Timeline
**Scope**: Critical architectural decisions for production deployment
**Status**: Decision Document

---

## Executive Summary

This document analyzes four critical architectural questions raised during MVP code review and provides concrete recommendations with implementation paths. Key decisions:

1. **Provenance Pattern**: Use Claim nodes (current) over RDF-star - better for news/conflicts
2. **Membership Property**: Migrate from `org:role → org:Post` to standard `org:post` property
3. **Document Metadata**: Hybrid Postgres + RDF approach - metadata in Postgres, graphs in N3.js/GCS
4. **Triple Store Target**: In-memory N3.js for MVP, with planned external reasoner scaling path

---

## Question 1: Claim Nodes vs RDF-star for Statement Provenance

### Current State

The MVP uses a **Claim/Assertion pattern** (reified nodes) as defined in `/ontologies/claims/claims.ttl`:

```turtle
:Claim rdf:type owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Claim" .

:claimSubject, :claimPredicate, :claimObject
:rank → :ClaimRank (:Preferred, :Normal, :Deprecated)
:statedIn → Article
:confidence → xsd:double
```

**Alternative**: RDF-star quoted triples for provenance:
```turtle
<< :Alice :hasRole :Mayor >> extr:confidence 0.95 .
```

### Analysis

#### Claim Nodes (Current Approach)

**Advantages:**
- **Conflict-friendly**: Multiple sources can make conflicting claims without overwriting each other
- **Wikidata-style ranking**: Supports preferred/normal/deprecated distinction essential for news corrections
- **Temporal validity**: Native support for `validFrom`/`validUntil` on claims
- **Audit trail**: Explicit `supersedes`/`supersededBy` chains for corrections
- **PostgreSQL integration**: Claims table in `/packages/@core-v2/src/Repository/schema.ts` supports timeline queries
- **Production-proven**: Pattern used by Wikidata, DBpedia reification

**Disadvantages:**
- Triple bloat: 5+ triples per claim (subject, predicate, object, rank, source, confidence)
- More complex SPARQL queries
- Requires custom indexing for performance

#### RDF-star (Alternative)

**Advantages:**
- **Compact**: Single quoted triple with annotations reduces storage by 60-80%
- **SPARQL 1.2 support**: Native query syntax (coming Q3 2025)
- **Performance**: Dedicated indexes in modern triplestores (15-26x faster than classic reification)
- **W3C standardization**: RDF 1.2 CR expected Q2 2025

**Disadvantages:**
- **No inference support**: Cannot materialize quoted triples as "plain relationships" without negating benefits
- **Conflict handling**: Harder to represent multiple contradictory statements about same triple
- **N3.js limitations**: Known issues with RDF-star in store operations (see [Issue #256](https://github.com/rdfjs/N3.js/issues/256))
  - Parser counts nested triples incorrectly
  - Lists with RDF-star triples throw errors
  - Store API doesn't handle quoted quads (only quoted triples)
- **Immature tooling**: JavaScript ecosystem support limited compared to Java/Python

### Research Evidence

From [Ontotext GraphDB analysis](https://www.ontotext.com/blog/graphdb-users-ask-is-rdf-star-best-choice-for-reification/):
> "RDF-star is the better choice when performance is a major factor and inference isn't... Named graphs are good for inference... Standard reification is the fallback option that neither performs well, nor works well with inference."

From [metaphacts blog](https://blog.metaphacts.com/citation-needed-provenance-with-rdf-star):
> "A major advantage of the RDF-star approach is that it is fit for purpose. It takes away the modeling complexity burden for ontology developers... Many triplestore implementations already support dedicated indexes to RDF-star triples, making the approach much more scalable."

### Recommendation: **Keep Claim Nodes**

**Decision**: Retain the current Claim node pattern for MVP and production.

**Rationale:**
1. **Domain fit**: News extraction inherently involves conflicting claims, corrections, and editorial curation - precisely what the Claim pattern handles well
2. **Current implementation complete**: PostgreSQL schema (`claims` table), RDF ontology, and SHACL shapes all support Claim pattern
3. **N3.js compatibility**: Avoids known RDF-star store issues that would require workarounds or migration to external triplestore
4. **Timeline UX**: Postgres queries for article timeline already leverage claim metadata (publishedAt, ingestedAt, deprecatedAt)
5. **Inference needs**: Our RDFS reasoning (subclass, domain/range) works cleanly with Claim nodes; RDF-star would complicate this

**Implementation Path:**
- ✅ No changes needed - current implementation correct
- Optimize: Add GIN indexes on `claims.subject_iri`, `claims.predicate_iri` for fast SPARQL-like queries
- Document: Add rationale to ontology design docs

**Future consideration**: If scaling to external triplestore (GraphDB, Stardog) that supports both patterns well, RDF-star could be added as an *optional output format* for performance-critical read paths while maintaining Claim nodes as source of truth.

---

## Question 2: Membership Pattern - `org:role` vs `org:post`

### Current State

The Seattle ontology uses **`org:role` pointing to `org:Post`** instances:

```turtle
# From seattle.ttl (lines 323-327)
seattle:MayorPost a org:Post ;
    org:postIn seattle:CityOfSeattle ;
    org:role seattle:MayorRole .

# In Membership:
:membership org:role seattle:MayorPost .
```

**Issue**: The W3C ORG spec defines `org:post` as the canonical property for linking Membership → Post, not `org:role`.

### Analysis

#### W3C ORG Specification Pattern

From [W3C ORG ontology](https://www.w3.org/TR/vocab-org/):

**Correct pattern:**
```turtle
# Post definition
:MayorPost a org:Post ;
    org:postIn :CityOfSeattle ;
    org:role :MayorRole .    # Role is a classification/type

# Membership links to Post via org:post
:membership123 a org:Membership ;
    org:member :JaneDoe ;
    org:organization :CityOfSeattle ;
    org:post :MayorPost .    # Link to Post instance
```

**Our current (non-standard) pattern:**
```turtle
:membership123 a org:Membership ;
    org:member :JaneDoe ;
    org:organization :CityOfSeattle ;
    org:role :MayorPost .    # Using role to link to Post
```

#### Semantic Difference

- **`org:post`**: Links Membership to a specific Post (position) within an organization
- **`org:role`**: Links Post or Membership to an abstract Role (classification/function)

From the [ORG ontology documentation](https://epimorphics.com/public/vocabulary/org.html):
> "The modelling of org:Post is closely based on the work of Jeni Tennison on modelling UK Government."

The pattern is:
- **Post** = structural position in org chart (e.g., "Deputy Mayor position in City of Seattle")
- **Role** = functional classification (e.g., "Executive Leadership", "Deputy Mayor function")
- **Membership** = person filling Post during time interval

#### Current SHACL Constraint

Our `shapes.ttl` (lines 67-76) accepts both:
```turtle
sh:property [
    sh:path org:role ;
    sh:minCount 1 ;
    sh:or (
        [ sh:class org:Post ]
        [ sh:class org:Role ]
        [ sh:class skos:Concept ]
    ) ;
    sh:message "Membership must have at least one org:role (Post or Role)"
] ;
```

This is **overly permissive** and contradicts the ORG spec.

### Recommendation: **Migrate to `org:post`**

**Decision**: Adopt the standard W3C ORG pattern using `org:post` property.

**Rationale:**
1. **Standards compliance**: Aligns with W3C ORG specification and established patterns
2. **Interoperability**: Enables data reuse with UK Government Linked Data, Popolo, and other civic data initiatives
3. **Semantic clarity**: Distinguishes structural positions (Post) from functional roles (Role classification)
4. **SPARQL query compatibility**: Standard property names improve query portability

**Migration Plan:**

### Phase 1: Update Ontology (1 day)

```turtle
# seattle.ttl - Change Post definitions to include org:post link
seattle:MayorPost a org:Post ;
    org:postIn seattle:CityOfSeattle ;
    org:role seattle:MayorRole .  # Keep this - it's correct!

# Membership pattern (UPDATE THIS):
seattle:Membership_Example a org:Membership ;
    org:member :Person ;
    org:organization :CityOfSeattle ;
    org:post seattle:MayorPost ;      # NEW: standard property
    # org:role :MayorRole ;            # OPTIONAL: Can still use for classification
    org:memberDuring :Interval .
```

### Phase 2: Update SHACL Shapes (1 day)

```turtle
# shapes.ttl - Replace org:role constraint with org:post
:MembershipShape a sh:NodeShape ;
    sh:targetClass org:Membership ;

    # NEW: Require org:post
    sh:property [
        sh:path org:post ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:class org:Post ;
        sh:message "Membership must have exactly one org:post"
    ] ;

    # OPTIONAL: Allow org:role for Role classification
    sh:property [
        sh:path org:role ;
        sh:maxCount 1 ;
        sh:class org:Role ;
        sh:message "Membership may have one org:role for classification"
    ] .
```

### Phase 3: Update Extraction Code (2 days)

```typescript
// src/Workflow/StreamingExtraction.ts or similar
// Update prompts to extract Post references, not Role references

const membershipPattern = `
When extracting appointments:
- Subject: Person IRI
- Predicate: org:post (not org:role!)
- Object: Post IRI (e.g., seattle:DeputyMayorPost)
- Temporal: org:memberDuring with time:Interval
`
```

### Phase 4: Data Migration (if existing data) (1 day)

If MVP already has extracted data using `org:role`:

```sparql
# SPARQL UPDATE to migrate existing data
PREFIX org: <http://www.w3.org/ns/org#>

DELETE { ?m org:role ?post }
INSERT { ?m org:post ?post }
WHERE {
    ?m a org:Membership ;
       org:role ?post .
    ?post a org:Post .
}
```

**Total effort**: 5 days (or 2-3 days if no existing data to migrate)

**Compatibility note**: Both properties can coexist during transition. The `org:role` can point to abstract Role classifications while `org:post` links to concrete Post instances.

---

## Question 3: Document Metadata Storage - RDF Graph vs Postgres

### Current State

The MVP has a **hybrid architecture**:

1. **PostgreSQL** (`articles` table in `schema.ts`):
   - Article metadata: `uri`, `sourceName`, `publishedAt`, `ingestedAt`, `graphUri`
   - Fast timeline queries by date range
   - Full-text search on `headline`

2. **RDF Graphs** (N3.js stores in GCS):
   - Named graphs per article (e.g., `http://seattle/article/123`)
   - Provenance metadata via `RdfBuilder.addExtractionMetadata()`
   - PROV-O triples: `prov:wasGeneratedBy`, `dcterms:source`, etc.

**Question**: Should we consolidate to single storage backend or keep hybrid?

### Analysis

#### Timeline Query Requirements

From the MVP case study (`mvp_discussion_research_case_study.md`):
> "Each document card has timestamps: publishedAt, ingestedAt, eventTime. In the UI you can sort the timeline by publishedAt or ingestedAt or eventTime (this becomes a big deal later; more on that under 'bitemporal')."

**Critical queries:**
1. List articles by date range: `publishedAt BETWEEN ? AND ?`
2. Find articles by source: `sourceName = 'Seattle Times'`
3. Full-text search: `headline LIKE '%budget%'`
4. Graph lookup: `graphUri = 'http://...'` → load RDF from GCS
5. Bitemporal: `publishedAt` (world time) vs `ingestedAt` (knowledge time)

#### Storage Pattern Comparison

| Feature | Postgres Only | RDF Only | Hybrid (Current) |
|---------|---------------|----------|------------------|
| Timeline queries | **Excellent** (indexed) | Poor (SPARQL filter) | **Excellent** |
| Full-text search | **Excellent** (GIN) | Poor (requires Lucene) | **Excellent** |
| Graph queries | Needs RDF serialization | **Excellent** | **Good** (load from GCS) |
| Provenance | JSON/JSONB | **Native** (PROV-O) | **Best of both** |
| Scalability | **Excellent** (10M+ rows) | Depends on triplestore | **Excellent** |
| Complexity | Low | Low | Medium |

#### Research: Hybrid Postgres + RDF Patterns

From [PostgreSQL RDF storage research](https://www.puppygraph.com/blog/postgresql-graph-database):
> "Modern solutions allow you to execute hybrid queries that combine openCypher and SQL, enabling simultaneous querying of relational and graph data."

From [RDFLib-PostgreSQL](https://github.com/RDFLib/rdflib-postgresql):
> "The motivation for its partitioned storage approach is primarily query speed and scalability as most graphs will always have more rdf:type statements than others."

**Best practice**: Use relational DB for metadata/indexes, RDF store for graph semantics.

### Recommendation: **Keep Hybrid Postgres + RDF**

**Decision**: Maintain current hybrid architecture with optimizations.

**Rationale:**
1. **Query performance**: Timeline UI needs sub-100ms response for article lists - Postgres delivers this, SPARQL cannot at scale
2. **Bitemporal support**: Postgres temporal types (`publishedAt`, `ingestedAt`) enable complex timeline filters
3. **Full-text search**: PostgreSQL's `ts_vector` and GIN indexes far exceed SPARQL text search capabilities
4. **RDF semantics**: Keep graph storage for provenance, reasoning, and SPARQL competency queries
5. **Current implementation**: Already complete and working well - no migration risk

**Architecture Pattern:**

```
┌─────────────────────────────────────────────────┐
│          PostgreSQL (Fast Queries)              │
│  - articles: uri, publishedAt, ingestedAt       │
│  - claims: subject, predicate, object, rank     │
│  - Timeline queries, full-text search           │
│                                                  │
│  graphUri → Points to RDF graph in GCS          │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│     GCS Storage (RDF Graphs - N3.js)            │
│  - Named graphs: article/batch-123/article.trig │
│  - Provenance: PROV-O metadata                  │
│  - Entities/Relations: Domain triples           │
│  - Loaded on-demand for graph queries           │
└─────────────────────────────────────────────────┘
```

**Implementation Optimizations:**

### 1. Add Postgres Indexes for Timeline (Already mostly done)

```sql
-- In migration 001_claims_schema.sql (verify these exist):
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_articles_source ON articles(source_name);
CREATE INDEX idx_articles_ingested ON articles(ingested_at);

-- Add full-text search (NEW):
ALTER TABLE articles ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('english',
        coalesce(headline, '') || ' ' || coalesce(source_name, '')
    )) STORED;
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
```

### 2. Denormalize Key RDF Metadata to Postgres (NEW)

Track graph statistics in Postgres for fast UI rendering:

```typescript
// schema.ts - Add columns to articles table
export const articles = pgTable("articles", {
  // ... existing columns ...

  // Denormalized graph stats (populated after extraction)
  entityCount: integer("entity_count").default(0),
  claimCount: integer("claim_count").default(0),
  inferredTripleCount: integer("inferred_triple_count").default(0),
  validationStatus: text("validation_status"), // 'valid', 'warnings', 'errors'

  // Bitemporal metadata
  eventTimeMin: timestamp("event_time_min", { withTimezone: true }),
  eventTimeMax: timestamp("event_time_max", { withTimezone: true })
})
```

### 3. Lazy-Load RDF Graphs for Detail View

Timeline list view: Query Postgres only.
Article detail view: Load RDF graph from GCS on-demand.

```typescript
// API pattern
GET /api/timeline?from=2025-12-01&to=2025-12-31
→ Query Postgres articles table only (fast!)
→ Returns: [ { uri, publishedAt, headline, entityCount, ... } ]

GET /api/article/:uri/graph
→ Load graphUri from Postgres
→ Fetch RDF from GCS
→ Parse with N3.js
→ Return: Turtle/JSON-LD
```

**Benefits:**
- Timeline queries: <100ms (Postgres index scan)
- Graph queries: <500ms (GCS fetch + N3.js parse)
- No dual-write consistency issues (graphUri is single source of truth)
- RDF graphs remain canonical source for all semantic queries

**Alternative Rejected**: Full migration to triplestore (Fuseki, GraphDB)
- **Why not**: Adds operational complexity, dual-write consistency issues, and timeline query performance would degrade
- **When to reconsider**: If SPARQL query volume exceeds 1000 QPS or graph size exceeds 100M triples

---

## Question 4: Triple Store / Reasoner Target for Production

### Current State

**In-memory N3.js** is the current RDF backend:
- `RdfService` wraps N3.Store (lines 1-1050 in `/packages/@core-v2/src/Service/Rdf.ts`)
- `Reasoner` uses N3.js reasoner (lines 1-474 in `/packages/@core-v2/src/Service/Reasoner.ts`)
- Stores serialized to GCS as Turtle/TriG files
- No external triplestore deployed

**Deployment**: GCP Cloud Run (see `/infra/modules/cloud-run/main.tf`)
- 1 CPU, 1Gi memory
- Scales 0-10 instances
- 300s timeout

**Question**: What's the production target for reasoning/querying at scale?

### Analysis

#### N3.js Performance Characteristics

From `REASONING_RECOMMENDATIONS.md`:
> "RDFS materialization on Tim Berners-Lee's FOAF profile in <0.1s. Benchmark: 14 rules, 961 facts, 866 derivations."

**Scaling limits:**
- **<100K triples**: N3.js adequate (2-3s reasoning)
- **100K-1M triples**: Performance degrades, consider external reasoner
- **>1M triples**: External reasoner mandatory

**MVP dataset estimate** (from Seattle case study):
- 100 articles/batch × 50 claims/article = 5,000 claims
- 10 triples/claim = 50,000 triples/batch
- **Verdict**: N3.js sufficient for MVP

#### External Reasoner Options

From research (`owl_reasoning_validation_production.md`, `rdf_shacl_reasoning_research.md`):

| Reasoner | Type | Performance | Features | Deployment |
|----------|------|-------------|----------|------------|
| **RDFox** | Commercial | 2-3M inf/sec | Datalog, incremental | Docker/GCP |
| **GraphDB** | Free/Enterprise | Billions of triples | SHACL, GeoSPARQL | Cloud/VM |
| **Apache Jena Fuseki** | Open Source | Moderate | SPARQL 1.1, TDB2 | Cloud Run |
| **Stardog** | Commercial | Very fast | Virtual graphs, federation | Enterprise |
| **N3.js (current)** | In-memory | <100K triples | RDFS, N3 rules | Cloud Run |

#### Infrastructure Constraints

Current infra (`/infra/main.tf`):
- **Cloud Run**: Stateless containers, 1Gi memory limit
- **Postgres**: Free-tier Compute Engine (f1-micro)
- **GCS**: Object storage (documents, graphs)

**Deployment options for external reasoner:**
1. Cloud Run service (Fuseki container)
2. Compute Engine VM (GraphDB)
3. Managed service (Google Cloud Graph, if available)

### Recommendation: **N3.js for MVP, Planned Migration Path**

**Decision**: Keep N3.js as primary triplestore for MVP launch, with clear scaling criteria and migration path to external reasoner.

**Rationale:**
1. **Current capacity sufficient**: 50K triples/batch well within N3.js limits
2. **No operational complexity**: In-memory store scales with Cloud Run, no persistent triplestore to manage
3. **Cost**: Free tier usage, no additional infrastructure
4. **Flexibility**: Can swap backends via Effect service layer without UX changes

**Implementation Strategy:**

### Phase 1: MVP Launch (Current - N3.js Only)

```typescript
// Service/Rdf.ts - Current implementation
export class RdfBuilder extends Effect.Service<RdfBuilder>() {
  // Uses N3.Store in-memory
  // Serializes to GCS for persistence
  // Reasoning via Reasoner.ts (N3.js reasoner)
}
```

**Scaling trigger**: Monitor batch reasoning time via telemetry.

### Phase 2: Add Monitoring (1 day)

```typescript
// Telemetry/Metrics.ts
export const ReasoningMetrics = {
  batchSize: Counter.counter("reasoning_batch_triples"),
  reasoningDuration: Histogram.histogram("reasoning_duration_ms"),
  inferredTripleCount: Counter.counter("reasoning_inferred_triples")
}

// Workflow/BatchWorkflow.ts
const reasoningActivity = (batchId: string) =>
  Effect.gen(function*() {
    const start = Date.now()
    const result = yield* reasoner.reason(store, config)

    yield* ReasoningMetrics.reasoningDuration.update(Date.now() - start)
    yield* ReasoningMetrics.inferredTripleCount.update(result.inferredTripleCount)

    // ALERT if reasoning >5s
    if (Date.now() - start > 5000) {
      yield* Effect.logWarning("Reasoning slow - consider external reasoner")
    }
  })
```

### Phase 3: External Reasoner Integration (When Needed)

**Trigger criteria:**
- Reasoning time >5s for typical batch
- Batch size exceeds 100K triples
- Memory pressure (OOM errors)
- Query volume >100 SPARQL queries/minute

**Implementation:**

```typescript
// Service/ExternalReasoner.ts (NEW)
export class FusekiReasonerService extends Effect.Service<FusekiReasonerService>()("FusekiReasonerService", {
  effect: Effect.gen(function*() {
    const httpClient = yield* HttpClient.HttpClient
    const config = yield* ConfigService

    return {
      materialize: (data: RdfStore) =>
        Effect.gen(function*() {
          const turtle = yield* RdfBuilder.toTurtle(data)

          // POST to Fuseki for reasoning
          const response = yield* httpClient.post(
            `${config.fuseki.endpoint}/reason`,
            { data: turtle, profile: 'RDFS' }
          )

          return yield* RdfBuilder.parseTurtle(response.turtle)
        })
    }
  })
})

// Workflow/BatchWorkflow.ts - Use fallback pattern
const reasoningActivity = (batchId: string) =>
  Effect.gen(function*() {
    const store = yield* loadBatchGraph(batchId)

    // Try external reasoner, fallback to N3.js
    const reasonedStore = yield* Effect.orElse(
      FusekiReasonerService.materialize(store),
      () => Reasoner.reason(store, ReasoningConfig.rdfs())
    )

    return reasonedStore
  })
```

**Deployment (Fuseki on Cloud Run):**

```terraform
# infra/modules/fuseki/main.tf (NEW)
resource "google_cloud_run_v2_service" "fuseki" {
  name     = "fuseki-reasoner-${var.environment}"
  location = var.region

  template {
    containers {
      image = "stain/jena-fuseki:latest"

      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"  # More memory for reasoning
        }
      }
    }

    scaling {
      min_instance_count = 0  # Scale to zero when idle
      max_instance_count = 3
    }
  }
}
```

### Alternative: GraphDB for Advanced Features

**If** we need SHACL validation + reasoning + GeoSPARQL:

```yaml
# docker-compose.yml (for Compute Engine VM)
services:
  graphdb:
    image: ontotext/graphdb:10.7.3
    ports:
      - "7200:7200"
    volumes:
      - graphdb-data:/opt/graphdb/home
    environment:
      GDB_HEAP_SIZE: 4g
```

**Cost estimate:**
- Fuseki on Cloud Run: ~$20/month (2 CPU, 4Gi, 10% utilization)
- GraphDB on e2-medium VM: ~$30/month (2 vCPU, 4GB RAM)
- RDFox commercial: $500+/month (enterprise)

### Decision Matrix for External Reasoner

| Scenario | Recommendation |
|----------|----------------|
| Batch <50K triples, reasoning <2s | **N3.js (current)** |
| Batch 50K-200K triples, reasoning 2-5s | **Monitor, plan Fuseki** |
| Batch >200K triples, reasoning >5s | **Deploy Fuseki immediately** |
| Need SHACL + reasoning + SPARQL federation | **Deploy GraphDB** |
| Enterprise features (virtual graphs, security) | **Evaluate Stardog/RDFox** |

**Current MVP status**: Firmly in "N3.js sufficient" category. External reasoner is a **planned optimization**, not a launch blocker.

---

## Summary of Recommendations

| Question | Decision | Rationale | Effort | Priority |
|----------|----------|-----------|--------|----------|
| **1. Provenance Pattern** | **Keep Claim nodes** | Better for news/conflicts; N3.js RDF-star limitations | 0 days (no change) | ✅ Resolved |
| **2. Membership Property** | **Migrate to org:post** | W3C ORG compliance; better interoperability | 5 days | 🔴 High (correctness) |
| **3. Document Metadata** | **Keep Hybrid Postgres + RDF** | Timeline performance; already working | 1 day (optimizations) | 🟡 Medium (performance) |
| **4. Triple Store Target** | **N3.js MVP, plan Fuseki** | Current scale adequate; clear migration path | 1 day (monitoring) | 🟢 Low (scaling) |

---

## Implementation Roadmap

### Week 1: Critical Fixes (High Priority)

**Days 1-3**: Migrate to `org:post` property
- Update `seattle.ttl` ontology
- Update `shapes.ttl` SHACL constraints
- Update extraction prompts
- Test with sample documents

**Days 4-5**: Validate and document
- Run full test suite
- Update competency questions
- Document decision rationale

### Week 2: Performance Optimizations (Medium Priority)

**Days 1-2**: Postgres timeline optimizations
- Add full-text search index
- Denormalize graph stats to articles table
- Benchmark timeline query performance

**Day 3**: Add reasoning telemetry
- Instrument batch reasoning duration
- Track triple counts
- Set up alerts for slow reasoning

**Days 4-5**: Documentation and testing
- Update architecture docs
- Performance benchmarks
- Capacity planning document

### Future: Scaling Path (Low Priority - When Needed)

**Trigger**: Reasoning >5s or batch >100K triples
- Deploy Fuseki on Cloud Run
- Implement fallback pattern in workflow
- Migrate high-volume batches to external reasoner

---

## References

### Research Documents
- `/packages/@core-v2/docs/ontology_research/rdf_shacl_reasoning_research.md` - RDF-star analysis
- `/packages/@core-v2/docs/ontology_research/REASONING_RECOMMENDATIONS.md` - Reasoner recommendations
- `/packages/@core-v2/docs/mvp/mvp_discussion_research_case_study.md` - Timeline UX requirements
- `/packages/@core-v2/docs/mvp/popolo_alignment_notes.md` - ORG ontology patterns

### External Sources
- [W3C Organization Ontology](https://www.w3.org/TR/vocab-org/) - org:post specification
- [N3.js RDF-star Issue #256](https://github.com/rdfjs/N3.js/issues/256) - Known limitations
- [Ontotext: RDF-star vs Reification](https://www.ontotext.com/blog/graphdb-users-ask-is-rdf-star-best-choice-for-reification/)
- [metaphacts: Provenance with RDF-star](https://blog.metaphacts.com/citation-needed-provenance-with-rdf-star)
- [PuppyGraph: PostgreSQL Graph Database](https://www.puppygraph.com/blog/postgresql-graph-database)
- [W3C RDF-star Charter](https://www.w3.org/2025/04/rdf-star-wg-charter.html) - Standards timeline

### Codebase Files
- `/packages/@core-v2/src/Service/Rdf.ts` - RDF service implementation
- `/packages/@core-v2/src/Service/Reasoner.ts` - Reasoning service
- `/packages/@core-v2/src/Repository/schema.ts` - PostgreSQL schema
- `/ontologies/claims/claims.ttl` - Claim ontology
- `/ontologies/seattle/seattle.ttl` - Seattle domain ontology
- `/ontologies/seattle/shapes.ttl` - SHACL shapes
- `/infra/main.tf` - Infrastructure deployment

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Authors**: Claude Sonnet 4.5 (Analysis)
**Status**: Ready for Review
