# V17: Array vs Chunk Audit

**Audit Date**: 2026-01-22
**Scope**: `packages/knowledge/server/src/**/*.ts`
**Rule**: Use Effect Chunk for performance-critical immutable sequences, especially for streaming and large collections.

## Summary

| Metric | Count |
|--------|-------|
| Files Analyzed | 16+ |
| Candidates Identified | 8 |
| Priority: High | 2 |
| Priority: Medium | 4 |
| Priority: Low | 2 |

## Assessment Criteria

**When Chunk is recommended:**
- Large collections (>100 items) processed repeatedly
- Streaming/pipeline patterns requiring efficient concatenation
- Concatenation-heavy operations (building arrays incrementally)

**When Array is acceptable:**
- Small, short-lived collections
- Single-pass processing
- API boundaries expecting Array

## Candidates for Chunk Migration

### HIGH PRIORITY

#### CANDIDATE-001: EntityClusterer Similarity Matrix

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`
**Lines**: 221-256, 417-423, 508-525

**Pattern**: Incremental array building for O(n^2) similarity pairs

```typescript
// Line 222
const similarities = A.empty<EntitySimilarity>();
// Lines 244-251: Push in nested loop
for (let i = 0; i < entities.length; i++) {
  for (let j = i + 1; j < entities.length; j++) {
    // ... similarity check
    if (similarity >= threshold) {
      similarities.push({
        entityA: entityA.id,
        entityB: entityB.id,
        similarity,
      });
    }
  }
}
```

**Rationale**:
- For N entities, produces up to N*(N-1)/2 similarity pairs
- With 100 entities, this is ~5,000 potential entries
- With 1,000 entities, this is ~500,000 potential entries
- Incremental `.push()` causes repeated reallocation

**Recommendation**: Use `Chunk.empty<EntitySimilarity>()` with `Chunk.append()` or collect via Stream.

---

#### CANDIDATE-002: GraphRAG BFS Traversal

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`
**Lines**: 443-480

**Pattern**: BFS frontier expansion with repeated array mutation

```typescript
// Line 443
let frontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [...seedIds];
// ...
for (let hop = 1; hop <= maxHops && frontier.length > 0; hop++) {
  const newFrontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [];
  for (const rel of relations) {
    // Line 467
    newFrontier.push(objectId);
  }
  for (const rel of incomingRelations) {
    // Line 476
    newFrontier.push(rel.subjectId);
  }
  frontier = newFrontier;
}
```

**Rationale**:
- Graph traversal can discover many entities per hop
- Dense knowledge graphs may have 100s-1000s of relations per hop
- Frontier arrays are rebuilt each iteration

**Recommendation**: Use `Chunk` for frontier management; convert to Array only at return boundary.

---

### MEDIUM PRIORITY

#### CANDIDATE-003: RelationExtractor Multi-Chunk Accumulation

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/RelationExtractor.ts`
**Lines**: 224-258

**Pattern**: Cross-chunk triple accumulation with spread operator

```typescript
const allTriples = A.empty<ExtractedTriple>();
const allInvalid = A.empty<ExtractedTriple>();
// ...
for (const chunk of chunks) {
  // Lines 255-258
  allTriples.push(...validation.valid);
  allInvalid.push(...validation.invalid);
}
```

**Rationale**:
- Document with many chunks accumulates triples across iterations
- Spread operator with push creates intermediate copies
- Large documents (10+ chunks, 50+ triples each) suffer O(n^2) copying

**Recommendation**: Use `Chunk.appendAll` or collect via `Effect.forEach` + `Chunk.flatten`.

---

#### CANDIDATE-004: EntityExtractor Batch Collection

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`
**Lines**: 162-181

**Pattern**: Multi-batch entity accumulation

```typescript
const allEntities = A.empty<ClassifiedEntity>();
for (const batch of batches) {
  // ...
  // Line 180
  allEntities.push(...confidenceFiltered);
}
```

**Rationale**:
- Documents with many mentions process in batches of 20
- Each batch pushes entities to accumulator
- Large documents (100+ mentions = 5+ batches) incur repeated reallocations

**Recommendation**: Consider `Chunk` for accumulation, convert at end.

---

#### CANDIDATE-005: RrfScorer Rank Fusion

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/GraphRAG/RrfScorer.ts`
**Lines**: 110-119, 134-142

**Pattern**: Building ranked items and grouped IDs

```typescript
// Line 111-114
const items: Array<RankedItem<T>> = [];
for (const [id, score] of scoreMap) {
  items.push({ id, score });
}

// Line 136-142
const hopGroups = new Map<number, Array<T>>();
for (const [id, hops] of entityHops) {
  const group = hopGroups.get(hops) ?? [];
  group.push(id);
  hopGroups.set(hops, group);
}
```

**Rationale**:
- Fusion typically handles 10-50 entities (topK parameter)
- Not a hot path, but pattern could scale with larger retrievals
- Map value mutation pattern is mutable-first

**Recommendation**: Lower priority; consider Chunk if topK limits are raised.

---

#### CANDIDATE-006: SameAsLinker Link Generation

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`
**Lines**: 102-127, 155-176, 285, 306-341

**Pattern**: Incremental link/issue accumulation

```typescript
const links = A.empty<SameAsLink>();
for (const cluster of clusters) {
  for (const memberId of cluster.memberIds) {
    // Line 122-127
    links.push({
      id: `knowledge_same_as_link__${crypto.randomUUID()}`,
      canonicalId: cluster.canonicalEntityId,
      memberId,
      confidence,
    });
  }
}
```

**Rationale**:
- Link count = sum of (cluster_size - 1) for all clusters
- Large resolution runs could generate 1000s of links
- Multiple methods repeat this pattern

**Recommendation**: Use Chunk for accumulation in large-scale resolution.

---

### LOW PRIORITY

#### CANDIDATE-007: NlpService Sentence/Chunk Building

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Nlp/NlpService.ts`
**Lines**: 28-44, 57-73, 96, 127-148

**Pattern**: Text splitting into sentences and chunks

```typescript
const parts = A.empty<string>();
// ... regex matching
parts.push(text.slice(lastEnd, match.index));

const chunks = A.empty<TextChunk>();
// ...
chunks.push(chunk);
```

**Rationale**:
- Sentence count typically 10-100 per document
- Chunk count typically 1-20 per document
- Streaming is already used for output (`Stream.fromIterable`)
- Input processing is single-pass

**Recommendation**: Current implementation is acceptable. Consider only if processing very large documents (>100KB).

---

#### CANDIDATE-008: ContextFormatter Section Building

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/GraphRAG/ContextFormatter.ts`
**Lines**: 123, 129, 166, 172

**Pattern**: Building output sections

```typescript
sections.push(`## Entities\n${A.join(entityLines, "\n")}`);
sections.push(`## Relations\n${A.join(relationLines, "\n")}`);
```

**Rationale**:
- Typically 2-4 sections only
- Small, bounded array
- Output formatting, not data processing

**Recommendation**: Current implementation is acceptable. Array is appropriate for small bounded collections.

---

## Patterns NOT Requiring Chunk

The following patterns were identified but determined NOT to be Chunk candidates:

### Stream Usage (Already Optimal)

**File**: `NlpService.ts:221`
```typescript
Stream.fromIterable(splitIntoChunks(text, config))
```
Already uses Effect Stream for chunked output - appropriate pattern.

### Small Bounded Collections

**File**: `ContextFormatter.ts:44`
```typescript
const types = A.map(entity.types, extractLocalName);
```
Entity types are typically 1-5 items - Array is appropriate.

### Single-Pass Processing

**File**: `ConfidenceFilter.ts:94`
```typescript
A.filter(entities, (entity) => entity.confidence >= threshold);
```
Single-pass filter operations don't benefit from Chunk.

### API Boundary Expectations

Most repository returns expect `Array` types, making conversion overhead negate Chunk benefits at boundaries.

---

## Recommended Migration Order

1. **EntityClusterer** (CANDIDATE-001) - Highest impact for large entity sets
2. **GraphRAGService traversal** (CANDIDATE-002) - Graph density can cause large frontiers
3. **RelationExtractor** (CANDIDATE-003) - Document processing accumulation
4. **EntityExtractor** (CANDIDATE-004) - Batch processing accumulation
5. **SameAsLinker** (CANDIDATE-006) - Link generation at scale
6. **RrfScorer** (CANDIDATE-005) - Optional, depends on usage patterns

---

## Migration Pattern

When migrating from Array to Chunk:

```typescript
// BEFORE: Array accumulation
const items = A.empty<Item>();
for (const x of source) {
  items.push(transform(x));
}
return items;

// AFTER: Chunk accumulation
import * as Chunk from "effect/Chunk";

let items = Chunk.empty<Item>();
for (const x of source) {
  items = Chunk.append(items, transform(x));
}
return Chunk.toReadonlyArray(items);

// ALTERNATIVE: Effect-based collection
const items = yield* Effect.forEach(source, (x) =>
  Effect.succeed(transform(x))
).pipe(Effect.map(Chunk.fromIterable));
```

---

## Notes

1. **Human Judgment Required**: These are CANDIDATES, not hard violations. Each migration should be profiled to confirm performance benefit.

2. **API Compatibility**: Most external APIs expect `Array`. Conversion at boundaries (`Chunk.toReadonlyArray`) is required.

3. **Benchmark First**: For medium priority candidates, benchmark with realistic data sizes before migrating.

4. **Stream Alternative**: Some patterns might benefit more from `Stream` than `Chunk` for lazy evaluation.
