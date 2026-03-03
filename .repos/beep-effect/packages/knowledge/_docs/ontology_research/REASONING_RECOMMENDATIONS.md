# OWL Reasoning Recommendations: Quick Reference

**For**: Effect-TS News/Claims Extraction Pipeline
**Date**: 2025-12-18
**See Full Research**: [owl_reasoning_validation_production.md](./owl_reasoning_validation_production.md)

## TL;DR: Do You Need OWL Reasoning?

**Short Answer**: Not full OWL reasoning. Use lightweight RDFS + targeted reasoning + SHACL validation.

**Why**: News/claims extraction needs data quality enforcement (SHACL's strength), not complex logical inference (OWL DL's strength). Type inheritance and transitive property chains are sufficient.

---

## Quick Decision Matrix

| Task | Use This | NOT This |
|------|----------|----------|
| Enforce "Person must have name" | SHACL `sh:minCount 1` | OWL (open-world: absence = unknown) |
| Validate datatype (date is xsd:date) | SHACL `sh:datatype` | OWL (doesn't enforce) |
| Detect conflicting values | SHACL `sh:maxCount 1` | OWL (infers same value) |
| Infer entity type from property | RDFS reasoning (domain/range) | Manual queries |
| Expand subclass queries | RDFS reasoning (subClassOf) | Application logic |
| Compute supersedes chains | OWL transitive property rule | Recursive SPARQL |
| Entity resolution | Explicit canonical IDs | owl:sameAs (causes N² explosion) |

---

## Recommended Approach

### 1. Validation First (SHACL)

**What**: Use SHACL for all data quality constraints.

**Already Implemented**: `src/Service/Shacl.ts` has shape generation from ontology.

**Action Items**:
- ✅ SHACL service exists
- ✅ Shape generation from ontology exists
- ⚠️ Need to call `validateWithPolicy` in workflow
- ⚠️ Need to fail batch on violations (currently stub returns `conforms: true`)

**Next Steps** (1-2 days):
```typescript
// src/Workflow/DurableActivities.ts
const validateActivity = (batchId: string) =>
  Effect.gen(function*() {
    const shacl = yield* ShaclService
    const rdfBuilder = yield* RdfBuilder

    const dataStore = yield* loadBatchGraph(batchId)
    const ontology = yield* rdfBuilder.loadOntology()
    const shapes = yield* shacl.generateShapesFromOntology(ontology._store)

    // This will fail if violations found
    const report = yield* shacl.validateWithPolicy(
      dataStore._store,
      shapes,
      { failOnViolation: true, failOnWarning: false }
    )

    yield* Effect.logInfo(`Validation passed: ${report.violations.length} warnings`)
    return report
  })
```

### 2. Lightweight Reasoning (RDFS + Custom)

**What**: Apply minimal reasoning to support validation and queries.

**Already Implemented**: `src/Service/Reasoner.ts` supports RDFS profiles.

**Rules Needed** (8-10 total):
1. `rdfs:subClassOf` transitivity → Expand validation targets
2. `rdfs:domain` inference → Infer entity types
3. `rdfs:range` inference → Type check object properties
4. Custom: `supersedes` transitivity → Materialize claim chains

**Next Steps** (1 week):
```typescript
// src/Workflow/DurableActivities.ts
const reasoningActivity = (batchId: string) =>
  Effect.gen(function*() {
    const reasoner = yield* Reasoner
    const rdfBuilder = yield* RdfBuilder

    const dataStore = yield* loadBatchGraph(batchId)

    // Apply targeted reasoning before validation
    yield* reasoner.reasonForValidation(dataStore)

    // Custom transitive rule for supersedes
    const supersedesRule = `
      @prefix : <http://example.org/> .
      {
        ?a :supersedes ?b .
        ?b :supersedes ?c .
      } => {
        ?a :supersedes ?c .
      } .
    `

    const config = ReasoningConfig.custom([supersedesRule])
    yield* reasoner.reason(dataStore, config)

    return dataStore
  })
```

### 3. Workflow Integration

**Pattern**: Merge → Reason → Validate → Store

```typescript
// src/Workflow/BatchWorkflow.ts
const processExtractedBatch = (batchId: string) =>
  Effect.gen(function*() {
    // 1. Merge all chunks
    const mergedGraph = yield* mergeChunksActivity(batchId)

    // 2. Apply entity resolution (already implemented)
    const resolvedGraph = yield* entityResolutionActivity(batchId)

    // 3. Apply reasoning (NEW)
    const reasonedGraph = yield* reasoningActivity(batchId)

    // 4. Validate (ENHANCED - currently stub)
    const report = yield* validateActivity(batchId)

    // 5. Store canonical graph
    yield* storeFinalGraphActivity(batchId, reasonedGraph)

    return report
  })
```

---

## Performance Expectations

### For News Pipeline

**Assumptions**:
- 100 articles/batch
- 50 claims/article = 5,000 claims
- 10 triples/claim = 50,000 triples/batch

**Estimated Times**:
- Ontology materialization (once): **0.2s**
- Batch reasoning (RDFS + custom): **2-3s**
- SHACL validation: **0.5s**
- **Total validation overhead**: **~3.5s/batch**

**Scaling**:
- Up to 100K triples: N3.js reasoner adequate
- 100K-1M triples: Consider external reasoner (RDFox/GraphDB)
- Above 1M triples: Mandatory external reasoner

### Optimizations

1. **Cache ontology materialization** (do once, reuse across batches)
2. **Parallel reasoning** (split by document, reason concurrently, merge)
3. **Targeted reasoning** (Re-SHACL pattern: only reason over validated nodes)
4. **Incremental validation** (only validate new triples + neighbors)

---

## JavaScript/TypeScript Tooling

### Use These

| Task | Library | When |
|------|---------|------|
| RDFS reasoning | **N3.js Reasoner** | <100K triples, subclass/domain/range |
| Custom rules | **EYE-JS** | Complex logic, transitive chains |
| SHACL validation | **shacl-engine** | Production (15-26x faster than alternatives) |
| Datatype validation | **rdf-validate-datatype** | Pre-validation literal checks |

### Don't Use These

| Library | Why Not |
|---------|---------|
| HyLAR Reasoner | Dormant since 2019, less tested |
| rdf-validate-shacl | 15-26x slower than shacl-engine |
| Pure JS OWL DL reasoner | Doesn't exist; would be too slow |

### External Reasoners (for Scale)

**When**: Batch size >10K triples or reasoning >5s.

**Options**:
- **RDFox** (commercial): 2-3M inferences/sec, incremental, Datalog
- **GraphDB** (free/enterprise): Billions of triples, SHACL integration
- **Stardog** (commercial): Virtual graphs, federation

**Pattern**:
```typescript
// Wrap as Effect service
export class ExternalReasonerService extends Effect.Service<ExternalReasonerService>()(
  "ExternalReasonerService",
  {
    effect: Effect.gen(function*() {
      const httpClient = yield* HttpClient
      return {
        materialize: (data: Store) =>
          Effect.gen(function*() {
            const turtle = yield* serializeStore(data)
            const response = yield* httpClient.post('http://rdfox:8080/reason', {
              data: turtle,
              profile: 'RDFS'
            })
            return yield* parseStore(response.turtle)
          })
      }
    })
  }
)
```

---

## Critical: Don't Use owl:sameAs for Entity Resolution

### Problem

```turtle
# DON'T DO THIS
:Alice1 owl:sameAs :Alice2 .
:Alice2 owl:sameAs :Alice3 .

# OWL reasoner infers 6 sameAs triples for 3 entities!
# 13%+ of owl:sameAs links are erroneous (LinkLion study)
# N² explosion for N entities
```

### Solution

```turtle
# DO THIS: One-way sameAs to canonical ID
:Alice1 owl:sameAs :canonical/alice-uuid .
:Alice2 owl:sameAs :canonical/alice-uuid .
:Alice3 owl:sameAs :canonical/alice-uuid .

# Or use skos:exactMatch (no OWL inference)
:Alice1 skos:exactMatch :Alice2 .
```

### Integration

```typescript
// After entity resolution clustering
const emitCanonicalLinks = (cluster: EntityCluster) =>
  Effect.gen(function*() {
    const canonicalIri = cluster.canonicalId  // UUID-based

    for (const entityId of cluster.memberIds) {
      // One-way link to canonical
      yield* rdfBuilder.addTriple(entityId, 'owl:sameAs', canonicalIri)
    }
  })
```

---

## Implementation Checklist

### Phase 1: Enable Real Validation (1-2 days)

- [ ] Update `validateActivity` to call `validateWithPolicy`
- [ ] Set `failOnViolation: true` to fail batch on errors
- [ ] Store validation reports in GCS for debugging
- [ ] Test: Create intentionally invalid data, verify batch fails

### Phase 2: Integrate Reasoning (1 week)

- [ ] Add `reasoningActivity` before validation in workflow
- [ ] Use `Reasoner.reasonForValidation()` (already exists)
- [ ] Add custom transitive rule for `supersedes` property
- [ ] Test: Verify subclass instances validated against parent shapes
- [ ] Test: Verify supersedes chains materialized

### Phase 3: Optimize (1-2 weeks)

- [ ] Cache ontology materialization (load once per deployment)
- [ ] Measure reasoning time; optimize if >2s for typical batches
- [ ] Consider targeted reasoning (Re-SHACL pattern) if needed
- [ ] Add metrics: reasoning time, inferred triple count, validation time

### Phase 4: Scale (optional, 2-3 weeks)

- [ ] Deploy external reasoner (RDFox/GraphDB) as Cloud Run service
- [ ] Implement fallback: N3.js for small batches, external for large
- [ ] Add circuit breaker for external reasoner
- [ ] Benchmark: Compare N3.js vs external for 10K, 100K, 1M triples

---

## Common Pitfalls to Avoid

1. **Don't use OWL for validation**: It won't enforce constraints (open-world assumption).

2. **Don't materialize full OWL DL closure**: Exponential cost, rarely needed for news data.

3. **Don't apply reasoning to every chunk**: Batch it post-merge (per-chunk validation is fine without reasoning).

4. **Don't mix reasoning and validation logic**: Keep separate—reason first, then validate.

5. **Don't use symmetric owl:sameAs**: Use one-way links to canonical IDs.

6. **Don't skip validation after reasoning**: Reasoning can introduce new violations.

---

## Questions & Answers

### Q: Do I need a reasoner for my pipeline?

**A**: Yes, but lightweight. Use RDFS (subclass, domain, range) + custom transitive rules. Skip full OWL DL.

### Q: SHACL or OWL for data quality?

**A**: SHACL. OWL infers, doesn't enforce. Use OWL for semantics, SHACL for validation.

### Q: When should I use an external reasoner?

**A**: When batches exceed 10K triples or reasoning takes >5s. Otherwise, N3.js is fine.

### Q: How do I handle entity resolution?

**A**: Use synthetic canonical URIs from your ER clustering. Link with one-way `owl:sameAs`. Don't rely on OWL inference.

### Q: Can I skip reasoning entirely?

**A**: You'll miss type inferences (e.g., validating `Politician` against `Person` shape). Minimal RDFS reasoning is worth the 2-3s cost.

### Q: What's the ROI of targeted reasoning?

**A**: 10-100x speedup for validation-driven reasoning (Re-SHACL). High ROI if batches are large.

---

## Next Steps

1. **Read full research**: [owl_reasoning_validation_production.md](./owl_reasoning_validation_production.md)
2. **Review existing code**:
   - `src/Service/Reasoner.ts` - Already implements RDFS reasoning
   - `src/Service/Shacl.ts` - Already generates shapes from ontology
3. **Implement Phase 1**: Wire validation into workflow (1-2 days)
4. **Implement Phase 2**: Add reasoning step (1 week)
5. **Measure and optimize**: Track metrics, iterate

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Author**: Research conducted by Claude Sonnet 4.5
