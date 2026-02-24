# V18: Empty Array Initialization

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/**/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 11 |
| **Files Affected** | 6 |
| **Severity** | Medium |
| **Priority Score** | 2 |

---

## Rule Reference

**Pattern Violated**:
> NEVER use native JavaScript array/string methods. Route ALL operations through Effect utilities.

**Violation Pattern**:
```typescript
// VIOLATIONS
const sections: Array<string> = [];
const items: string[] = [];
let results = [];
const data: T[] = [];
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

// CORRECT
const sections = A.empty<string>();
const items = A.empty<string>();
let results = A.empty<ResultType>();
const data = A.empty<T>();
```

---

## Violations

### GraphRAG/RrfScorer.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 111 | Empty typed array literal | `const items: Array<RankedItem<T>> = [];` | `const items = A.empty<RankedItem<T>>();` |

<details>
<summary>Full Context (Lines 105-120)</summary>

```typescript
      const currentScore = scoreMap.get(id) ?? 0;
      scoreMap.set(id, currentScore + component);
    }
  }

  // Convert to array and sort by descending score
  const items: Array<RankedItem<T>> = [];
  for (const [id, score] of scoreMap) {
    items.push({ id, score });
  }

  return A.sort(
    items,
    Order.mapInput(Num.Order, (item: RankedItem<T>) => -item.score)
  );
};
```

</details>

---

### GraphRAG/GraphRAGService.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 280 | Empty typed array literal | `const graphRankList: Array<string> = [];` | `const graphRankList = A.empty<string>();` |
| 458 | Empty typed array literal | `const newFrontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [];` | `const newFrontier = A.empty<KnowledgeEntityIds.KnowledgeEntityId.Type>();` |

<details>
<summary>Full Context (Lines 278-285)</summary>

```typescript
        // 6. RRF scoring
        const graphRanks = assignGraphRanks(entityHops);
        const graphRankList: Array<string> = [];
        for (const [id] of graphRanks) {
          graphRankList.push(id);
        }

        const fusedRanking = fuseRankings([embeddingRanks, graphRankList]);
```

</details>

<details>
<summary>Full Context (Lines 455-470)</summary>

```typescript
      // Also get incoming relations (bidirectional traversal)
      const incomingRelations = yield* relationRepo.findByTargetIds(frontier, organizationId);

      // Collect new entity IDs
      const newFrontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [];

      for (const rel of relations) {
        const objectIdOpt = rel.objectId;
        if (objectIdOpt !== undefined) {
          const objectId = objectIdOpt as KnowledgeEntityIds.KnowledgeEntityId.Type;
          if (!visited.has(objectId)) {
            visited.add(objectId);
            entityHops.set(objectId, hop);
            newFrontier.push(objectId);
          }
        }
      }
```

</details>

---

### GraphRAG/ContextFormatter.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 118 | Empty typed array literal | `const sections: Array<string> = [];` | `const sections = A.empty<string>();` |
| 157 | Empty typed array literal | `const sections: Array<string> = [];` | `const sections = A.empty<string>();` |

<details>
<summary>Full Context (Lines 115-133)</summary>

```typescript
  for (const entity of entities) {
    entityLookup.set(entity.id, entity);
  }

  const sections: Array<string> = [];

  // Entities section
  if (entities.length > 0) {
    const entityLines = A.map(entities, formatEntity);
    sections.push(`## Entities\n${A.join(entityLines, "\n")}`);
  }

  // Relations section
  if (relations.length > 0) {
    const relationLines = A.map(relations, (r) => formatRelation(r, entityLookup));
    sections.push(`## Relations\n${A.join(relationLines, "\n")}`);
  }

  return A.join(sections, "\n\n");
```

</details>

<details>
<summary>Full Context (Lines 152-170)</summary>

```typescript
  const entityLookup = new Map<string, Entities.Entity.Model>();
  for (const entity of entities) {
    entityLookup.set(entity.id, entity);
  }

  const sections: Array<string> = [];

  // Entities section with scores
  if (entities.length > 0) {
    const entityLines = A.map(entities, (e) => {
      const score = scores.get(e.id);
      const scoreStr = score !== undefined ? ` [score: ${score.toFixed(4)}]` : "";
      return `${formatEntity(e)}${scoreStr}`;
    });
    sections.push(`## Entities\n${A.join(entityLines, "\n")}`);
  }

  // Relations section
```

</details>

---

### Grounding/GroundingService.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 232 | Empty typed array literal | `const grounded: AssembledRelation[] = [];` | `const grounded = A.empty<AssembledRelation>();` |
| 233 | Empty typed array literal | `const ungrounded: AssembledRelation[] = [];` | `const ungrounded = A.empty<AssembledRelation>();` |

<details>
<summary>Full Context (Lines 228-248)</summary>

```typescript
        const entityById = new Map<string, AssembledEntity>();
        for (const entity of graph.entities) {
          entityById.set(entity.id, entity);
        }

        const grounded: AssembledRelation[] = [];
        const ungrounded: AssembledRelation[] = [];
        let totalConfidence = 0;

        for (const relation of graph.relations) {
          const subject = entityById.get(relation.subjectId);

          if (!subject) {
            yield* Effect.logDebug("GroundingService: missing subject entity", {
              relationId: relation.id,
              subjectId: relation.subjectId,
            });
            if (config.keepUngrounded) {
              ungrounded.push(relation);
            }
            continue;
          }
```

</details>

---

### EntityResolution/EntityClusterer.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 352 | Empty typed array literal | `const clusters: EntityCluster[] = [];` | `const clusters = A.empty<EntityCluster>();` |
| 418 | Empty typed array literal | `const allEntities: AssembledEntity[] = [];` | `const allEntities = A.empty<AssembledEntity>();` |

<details>
<summary>Full Context (Lines 348-360)</summary>

```typescript
      for (const entity of entities) {
        entityById.set(entity.id, entity);
      }

      // Convert to EntityCluster format
      const clusters: EntityCluster[] = [];

      for (const [_root, memberIds] of clusterMap) {
        const members = memberIds.map((id) => entityById.get(id)).filter((e): e is AssembledEntity => e !== undefined);

        if (members.length === 0) continue;

        // Compute cohesion (average pairwise similarity within cluster)
```

</details>

<details>
<summary>Full Context (Lines 414-430)</summary>

```typescript
          const threshold = config.similarityThreshold ?? 0.85;
          const maxClusterSize = config.maxClusterSize ?? 50;
          const requireTypeCompatibility = config.requireTypeCompatibility ?? true;

          // Collect all entities
          const allEntities: AssembledEntity[] = [];
          for (const graph of graphs) {
            for (const entity of graph.entities) {
              allEntities.push(entity);
            }
          }

          if (allEntities.length === 0) {
            yield* Effect.logDebug("EntityClusterer.cluster: no entities to cluster");
            return [];
          }
```

</details>

---

### Nlp/NlpService.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 84 | Empty array reassignment | `currentChunkSentences = [];` | `currentChunkSentences = A.empty<string>();` |

<details>
<summary>Full Context (Lines 76-98)</summary>

```typescript
    // Handle overlap: keep last N sentences for next chunk
    if (config.overlapSentences > 0 && currentChunkSentences.length > config.overlapSentences) {
      const overlapSentences = A.takeRight(currentChunkSentences, config.overlapSentences);
      const overlapText = A.join("")(overlapSentences);
      currentChunkStart = currentChunkStart + text.length - overlapText.length;
      currentChunkSentences = [...overlapSentences];
    } else {
      currentChunkStart = currentChunkStart + text.length;
      currentChunkSentences = [];
    }
  };

  for (const sentence of sentences) {
    const currentLength = A.join("")(currentChunkSentences).length;

    // If adding this sentence would exceed max size, flush current chunk
    if (currentLength + sentence.length > config.maxChunkSize && currentChunkSentences.length > 0) {
      flushChunk();
    }

    currentChunkSentences.push(sentence);
    currentCharPos += sentence.length;
  }
```

</details>

---

### Extraction/RelationExtractor.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 193 | Empty array reassignment | `invalid = [];` | `invalid = A.empty<ExtractedTriple>();` |

<details>
<summary>Full Context (Lines 185-206)</summary>

```typescript
        let invalid = A.empty<ExtractedTriple>();

        if (shouldValidate) {
          const validation = validatePredicates(offsetAdjusted, ontologyContext);
          valid = validation.valid;
          invalid = validation.invalid;
        } else {
          valid = [...offsetAdjusted];
          invalid = [];
        }

        yield* Effect.logDebug("Relation extraction complete", {
          validTriples: valid.length,
          invalidTriples: invalid.length,
          tokensUsed,
        });

        return {
          triples: valid,
          invalidTriples: invalid,
          tokensUsed,
        };
```

</details>

**Note**: Line 185 shows the correct pattern (`let invalid = A.empty<ExtractedTriple>()`), but line 193 reverts to the violation pattern within the same function.

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| GraphRAGService.ts | 2 | GraphRAG |
| ContextFormatter.ts | 2 | GraphRAG |
| RrfScorer.ts | 1 | GraphRAG |
| GroundingService.ts | 2 | Grounding |
| EntityClusterer.ts | 2 | EntityResolution |
| NlpService.ts | 1 | Nlp |
| RelationExtractor.ts | 1 | Extraction |

**Impact Score**: 2 (Moderate - affects multiple modules but changes are mechanical)

---

## Dependency Analysis

### Depends On (Fix These First)
- None

### Depended By (Fix These After)
- None

### Can Fix Independently
- [x] No dependencies - all violations are straightforward replacements

---

## Remediation Notes

### Special Considerations

1. **Mutability Concern**: All violations involve arrays that are subsequently mutated via `.push()`. Effect's `A.empty<T>()` returns a readonly array, but TypeScript allows `.push()` on the result due to array covariance. However, the idiomatic Effect approach would be to use functional patterns (e.g., `A.append`, `A.appendAll`) rather than mutation.

2. **Full Refactor Option**: For a more thorough alignment with Effect patterns, consider refactoring the imperative `for` loops with `.push()` to use functional alternatives:
   ```typescript
   // Current imperative pattern
   const items: Array<RankedItem<T>> = [];
   for (const [id, score] of scoreMap) {
     items.push({ id, score });
   }

   // Idiomatic Effect pattern
   const items = A.fromIterable(scoreMap).pipe(
     A.map(([id, score]) => ({ id, score }))
   );
   ```

3. **Consistency**: Line 185 of `RelationExtractor.ts` correctly uses `A.empty<ExtractedTriple>()` but line 193 in the same function reverts to `= []`. This inconsistency should be addressed.

### Recommended Approach

1. Search for existing `import * as A from "effect/Array"` in each file (most should already have it)
2. Replace each `Type[] = []` or `Array<Type> = []` with `A.empty<Type>()`
3. Run type check to ensure no regressions

### Imports to Add

```typescript
// Most files already have this import, but verify:
import * as A from "effect/Array";
```

### New Types to Create

None required - this is a pure refactor of initialization patterns.

---

## Verification Commands

```bash
# Verify no violations remain (typed array literal with empty array)
grep -rn ": Array<.*>\s*=\s*\[\]" packages/knowledge/server/src/
grep -rn ":\s*\w\+\[\]\s*=\s*\[\]" packages/knowledge/server/src/

# Verify no bare empty array assignments remain (may have false positives)
grep -rn "=\s*\[\];" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V18 Effect Pattern Enforcer |
| **Duration** | 3 minutes |
| **Files Scanned** | 6 |
| **False Positives Excluded** | 0 |
