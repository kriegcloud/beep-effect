# V09: Native Set Audit

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/server/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 22 |
| **Files Affected** | 8 |
| **Severity** | Medium |
| **Priority Score** | 2 |

---

## Rule Reference

**Pattern Violated**:
> NEVER use native JavaScript array/string methods. Route ALL operations through Effect utilities.

**Violation Pattern**:
```typescript
// VIOLATIONS
const allTypes = new Set(canonical.types);
const seen = new Set<string>();
mySet.add(value);
mySet.has(value);
mySet.delete(value);
```

**Correct Pattern**:
```typescript
import * as MutableHashSet from "effect/MutableHashSet";

// CORRECT
const allTypes = MutableHashSet.fromIterable(canonical.types);
const seen = MutableHashSet.empty<string>();
MutableHashSet.add(seen, value);
MutableHashSet.has(seen, value);
MutableHashSet.remove(seen, value);
```

---

## Violations

### GraphRAGService.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 439 | Native Set instantiation | `const visited = new Set<string>();` | `const visited = MutableHashSet.empty<string>();` |
| 445 | Native Set add | `visited.add(id);` | `MutableHashSet.add(visited, id);` |
| 464 | Native Set has | `if (!visited.has(objectId))` | `if (!MutableHashSet.has(visited, objectId))` |
| 465 | Native Set add | `visited.add(objectId);` | `MutableHashSet.add(visited, objectId);` |
| 473 | Native Set has | `if (!visited.has(rel.subjectId))` | `if (!MutableHashSet.has(visited, rel.subjectId))` |
| 474 | Native Set add | `visited.add(rel.subjectId);` | `MutableHashSet.add(visited, rel.subjectId);` |

<details>
<summary>Full Context (Lines 438-476)</summary>

```typescript
Effect.gen(function* () {
    const visited = new Set<string>();
    const entityHops = new Map<KnowledgeEntityIds.KnowledgeEntityId.Type, number>();

    // Initialize with seeds at hop 0
    let frontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [...seedIds];
    for (const id of seedIds) {
      visited.add(id);
      entityHops.set(id, 0);
    }

    // BFS traversal
    for (let hop = 1; hop <= maxHops && frontier.length > 0; hop++) {
      // ...
      const newFrontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [];

      // Collect new entity IDs from outgoing relations
      for (const rel of relations) {
        const objectIdOpt = rel.objectId;
        if (objectIdOpt) {
          const objectId = objectIdOpt as KnowledgeEntityIds.KnowledgeEntityId.Type;
          if (!visited.has(objectId)) {
            visited.add(objectId);
            entityHops.set(objectId, hop);
            newFrontier.push(objectId);
          }
        }
      }

      for (const rel of incomingRelations) {
        if (!visited.has(rel.subjectId)) {
          visited.add(rel.subjectId);
          entityHops.set(rel.subjectId, hop);
          newFrontier.push(rel.subjectId);
        }
      }
```

</details>

---

### ConfidenceFilter.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Grounding/ConfidenceFilter.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 126 | Native Set instantiation | `const referencedIds = new Set<string>();` | `const referencedIds = MutableHashSet.empty<string>();` |
| 128 | Native Set add | `referencedIds.add(relation.subjectId);` | `MutableHashSet.add(referencedIds, relation.subjectId);` |
| 130 | Native Set add | `referencedIds.add(relation.objectId);` | `MutableHashSet.add(referencedIds, relation.objectId);` |
| 135 | Native Set has | `referencedIds.has(entity.id)` | `MutableHashSet.has(referencedIds, entity.id)` |
| 159 | Native Set from iterable | `const validEntityIds = new Set(A.map(filteredEntities, (e) => e.id));` | `const validEntityIds = MutableHashSet.fromIterable(A.map(filteredEntities, (e) => e.id));` |
| 166 | Native Set has | `if (!validEntityIds.has(relation.subjectId))` | `if (!MutableHashSet.has(validEntityIds, relation.subjectId))` |
| 169 | Native Set has | `!validEntityIds.has(relation.objectId)` | `!MutableHashSet.has(validEntityIds, relation.objectId)` |

<details>
<summary>Full Context (Lines 125-136, 158-170)</summary>

```typescript
// removeOrphanEntities function
const referencedIds = new Set<string>();
for (const relation of relations) {
  referencedIds.add(relation.subjectId);
  if (relation.objectId) {
    referencedIds.add(relation.objectId);
  }
}

// Filter to only referenced entities
return A.filter(entities, (entity) => referencedIds.has(entity.id));

// filterGraph function
const validEntityIds = new Set(A.map(filteredEntities, (e) => e.id));

// Filter relations by confidence AND ensure both ends exist
const filteredRelations = A.filter(graph.relations, (relation) => {
  if (relation.confidence < relationThreshold) {
    return false;
  }
  if (!validEntityIds.has(relation.subjectId)) {
    return false;
  }
  return !(relation.objectId && !validEntityIds.has(relation.objectId));
});
```

</details>

---

### EntityExtractor.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 188 | Native Set from iterable | `const classifiedMentions = new Set(allEntities.map((e) => e.mention.toLowerCase()));` | `const classifiedMentions = MutableHashSet.fromIterable(A.map(allEntities, (e) => e.mention.toLowerCase()));` |
| 189 | Native Set has | `!classifiedMentions.has(m.text.toLowerCase())` | `!MutableHashSet.has(classifiedMentions, m.text.toLowerCase())` |

<details>
<summary>Full Context (Lines 187-190)</summary>

```typescript
// Find mentions that weren't classified
const classifiedMentions = new Set(allEntities.map((e) => e.mention.toLowerCase()));
const unclassified = A.filter([...mentions], (m) => !classifiedMentions.has(m.text.toLowerCase()));
```

</details>

---

### GraphAssembler.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/GraphAssembler.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 390 | Native Set instantiation | `const relationSet = new Set<string>();` | `const relationSet = MutableHashSet.empty<string>();` |
| 403 | Native Set has | `if (!relationSet.has(key))` | `if (!MutableHashSet.has(relationSet, key))` |
| 404 | Native Set add | `relationSet.add(key);` | `MutableHashSet.add(relationSet, key);` |

<details>
<summary>Full Context (Lines 389-405)</summary>

```typescript
// Collect relations, updating IDs
const relationSet = new Set<string>();
const relations = A.empty<AssembledRelation>();

for (const graph of graphs) {
  for (const relation of graph.relations) {
    const mappedSubjectId = idMapping.get(relation.subjectId) ?? relation.subjectId;
    const mappedObjectId = relation.objectId
      ? (idMapping.get(relation.objectId) ?? relation.objectId)
      : undefined;

    // Create dedup key
    const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

    if (!relationSet.has(key)) {
      relationSet.add(key);
      const mappedRelation: AssembledRelation = {
        ...relation,
        // ...
```

</details>

---

### EntityClusterer.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 124 | Native Set from iterable | `const typesA = new Set(entityA.types);` | `const typesA = MutableHashSet.fromIterable(entityA.types);` |
| 125 | Native Set has | `return A.some(entityB.types, typesA.has);` | `return A.some(entityB.types, (t) => MutableHashSet.has(typesA, t));` |
| 138 | Native Set from iterable | `const sharedSet = new Set(firstEntity.types);` | `const sharedSet = MutableHashSet.fromIterable(firstEntity.types);` |
| 144 | Native Set from iterable | `const entityTypes = new Set(entity.types);` | `const entityTypes = MutableHashSet.fromIterable(entity.types);` |
| 145 | Native Set has | `if (!entityTypes.has(type))` | `if (!MutableHashSet.has(entityTypes, type))` |
| 147 | Native Set delete | `sharedSet.delete(type);` | `MutableHashSet.remove(sharedSet, type);` |

<details>
<summary>Full Context (Lines 123-152)</summary>

```typescript
const hasTypeOverlap = (entityA: AssembledEntity, entityB: AssembledEntity): boolean => {
  const typesA = new Set(entityA.types);
  return A.some(entityB.types, typesA.has);
};

const findSharedTypes = (entities: readonly AssembledEntity[]): readonly string[] => {
  if (entities.length === 0) return [];
  if (entities.length === 1) return entities[0]?.types ?? [];

  const firstEntity = entities[0];
  if (!firstEntity) return [];

  const sharedSet = new Set(firstEntity.types);

  for (let i = 1; i < entities.length; i++) {
    const entity = entities[i];
    if (!entity) continue;

    const entityTypes = new Set(entity.types);
    for (const type of sharedSet) {
      if (!entityTypes.has(type)) {
        sharedSet.delete(type);
      }
    }
  }

  return Array.from(sharedSet);
};
```

</details>

---

### SameAsLinker.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 202 | Native Set instantiation | `const visited = new Set<string>();` | `const visited = MutableHashSet.empty<string>();` |
| 204 | Native Set has | `!visited.has(current)` | `!MutableHashSet.has(visited, current)` |
| 205 | Native Set add | `visited.add(current);` | `MutableHashSet.add(visited, current);` |
| 232 | Native Set instantiation | `const visited = new Set<string>();` | `const visited = MutableHashSet.empty<string>();` |
| 234 | Native Set has | `!visited.has(current)` | `!MutableHashSet.has(visited, current)` |
| 235 | Native Set add | `visited.add(current);` | `MutableHashSet.add(visited, current);` |
| 261 | Native Set instantiation | `const visited = new Set<string>();` | `const visited = MutableHashSet.empty<string>();` |
| 263 | Native Set has | `!visited.has(current)` | `!MutableHashSet.has(visited, current)` |
| 264 | Native Set add | `visited.add(current);` | `MutableHashSet.add(visited, current);` |
| 275 | Native Set instantiation | `const allEntities = new Set<string>();` | `const allEntities = MutableHashSet.empty<string>();` |
| 277 | Native Set add | `allEntities.add(link.canonicalId);` | `MutableHashSet.add(allEntities, link.canonicalId);` |
| 278 | Native Set add | `allEntities.add(link.memberId);` | `MutableHashSet.add(allEntities, link.memberId);` |
| 322 | Native Set instantiation | `const visited = new Set<string>();` | `const visited = MutableHashSet.empty<string>();` |
| 326 | Native Set has | `if (visited.has(current))` | `if (MutableHashSet.has(visited, current))` |
| 330 | Native Set add | `visited.add(current);` | `MutableHashSet.add(visited, current);` |
| 336 | Native Set instantiation | `const linkKeys = new Set<string>();` | `const linkKeys = MutableHashSet.empty<string>();` |
| 339 | Native Set has | `if (linkKeys.has(key))` | `if (MutableHashSet.has(linkKeys, key))` |
| 342 | Native Set add | `linkKeys.add(key);` | `MutableHashSet.add(linkKeys, key);` |

<details>
<summary>Full Context - Multiple Functions</summary>

```typescript
// areSameEntity function (lines 200-212)
const getCanonical = (id: string): string => {
  let current = id;
  const visited = new Set<string>();

  while (canonicalMap.has(current) && !visited.has(current)) {
    visited.add(current);
    current = canonicalMap.get(current)!;
  }

  return current;
};

// getCanonical function (lines 231-239)
let current = entityId;
const visited = new Set<string>();

while (canonicalMap.has(current) && !visited.has(current)) {
  visited.add(current);
  current = canonicalMap.get(current)!;
}

// computeTransitiveClosure function (lines 259-293)
const getCanonical = (id: string): string => {
  let current = id;
  const visited = new Set<string>();

  while (canonicalMap.has(current) && !visited.has(current)) {
    visited.add(current);
    current = canonicalMap.get(current)!;
  }

  return current;
};

const allEntities = new Set<string>();
for (const link of links) {
  allEntities.add(link.canonicalId);
  allEntities.add(link.memberId);
}

// validateLinks function (lines 321-343)
for (const link of links) {
  const visited = new Set<string>();
  let current = link.canonicalId;

  while (canonicalMap.has(current)) {
    if (visited.has(current)) {
      issues.push(`Cycle detected involving: ${current}`);
      break;
    }
    visited.add(current);
    current = canonicalMap.get(current)!;
  }
}

const linkKeys = new Set<string>();
for (const link of links) {
  const key = `${link.canonicalId}:${link.memberId}`;
  if (linkKeys.has(key)) {
    issues.push(`Duplicate link: ${link.canonicalId} -> ${link.memberId}`);
  }
  linkKeys.add(key);
}
```

</details>

---

### CanonicalSelector.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 232 | Native Set from iterable | `const allTypes = new Set(canonical.types);` | `const allTypes = MutableHashSet.fromIterable(canonical.types);` |
| 235 | Native Set add | `allTypes.add(type);` | `MutableHashSet.add(allTypes, type);` |
| 244 | Array.from on Set | `types: Array.from(allTypes),` | `types: MutableHashSet.toValues(allTypes),` |

<details>
<summary>Full Context (Lines 231-247)</summary>

```typescript
// Merge all types (union)
const allTypes = new Set(canonical.types);
for (const member of members) {
  for (const type of member.types) {
    allTypes.add(type);
  }
}

// Update confidence to max across cluster
const maxConfidence = Math.max(canonical.confidence, ...members.map((m) => m.confidence));

const merged: AssembledEntity = {
  ...canonical,
  types: Array.from(allTypes),
  attributes: mergedAttributes,
  confidence: maxConfidence,
};
```

</details>

---

### EntityResolutionService.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 113 | Native Set instantiation | `const relationSet = new Set<string>();` | `const relationSet = MutableHashSet.empty<string>();` |
| 129 | Native Set has | `if (!relationSet.has(key))` | `if (!MutableHashSet.has(relationSet, key))` |
| 130 | Native Set add | `relationSet.add(key);` | `MutableHashSet.add(relationSet, key);` |

<details>
<summary>Full Context (Lines 112-134)</summary>

```typescript
// Collect and remap relations
const relationSet = new Set<string>();
const resolvedRelations = A.empty<AssembledRelation>();

for (const graph of graphs) {
  for (const relation of graph.relations) {
    // Remap subject and object IDs to canonical entities
    const mappedSubjectId = idMapping.get(relation.subjectId) ?? relation.subjectId;
    const mappedObjectId = relation.objectId ? (idMapping.get(relation.objectId) ?? relation.objectId) : undefined;

    // Skip relations where subject or object doesn't exist
    if (!canonicalById.has(mappedSubjectId)) continue;
    if (mappedObjectId && !canonicalById.has(mappedObjectId)) continue;

    // Deduplicate relations by key
    const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

    if (!relationSet.has(key)) {
      relationSet.add(key);
      resolvedRelations.push({
        ...relation,
        subjectId: mappedSubjectId,
        ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
```

</details>

---

### OntologyParser.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Ontology/OntologyParser.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 187 | Native Set instantiation | `const classIris = new Set<string>();` | `const classIris = MutableHashSet.empty<string>();` |
| 190 | Native Set add | `classIris.add(quad.subject.value);` | `MutableHashSet.add(classIris, quad.subject.value);` |
| 196 | Native Set add | `classIris.add(quad.subject.value);` | `MutableHashSet.add(classIris, quad.subject.value);` |
| 201 | Native Set instantiation | `const objectPropertyIris = new Set<string>();` | `const objectPropertyIris = MutableHashSet.empty<string>();` |
| 202 | Native Set instantiation | `const datatypePropertyIris = new Set<string>();` | `const datatypePropertyIris = MutableHashSet.empty<string>();` |
| 203 | Native Set instantiation | `const functionalPropertyIris = new Set<string>();` | `const functionalPropertyIris = MutableHashSet.empty<string>();` |
| 211 | Native Set add | `objectPropertyIris.add(quad.subject.value);` | `MutableHashSet.add(objectPropertyIris, quad.subject.value);` |
| 221 | Native Set add | `datatypePropertyIris.add(quad.subject.value);` | `MutableHashSet.add(datatypePropertyIris, quad.subject.value);` |
| 231 | Native Set add | `functionalPropertyIris.add(quad.subject.value);` | `MutableHashSet.add(functionalPropertyIris, quad.subject.value);` |

<details>
<summary>Full Context (Lines 186-232)</summary>

```typescript
// Find all OWL classes
const classIris = new Set<string>();
for (const quad of store.match(null, N3.DataFactory.namedNode(RDF.type), N3.DataFactory.namedNode(OWL.Class))) {
  if (!Str.startsWith("_:")(quad.subject.value)) {
    classIris.add(quad.subject.value);
  }
}
// Also check rdfs:Class
for (const quad of store.match(null, N3.DataFactory.namedNode(RDF.type), N3.DataFactory.namedNode(RDFS.Class))) {
  if (!Str.startsWith("_:")(quad.subject.value)) {
    classIris.add(quad.subject.value);
  }
}

// Find all OWL properties
const objectPropertyIris = new Set<string>();
const datatypePropertyIris = new Set<string>();
const functionalPropertyIris = new Set<string>();

for (const quad of store.match(
  null,
  N3.DataFactory.namedNode(RDF.type),
  N3.DataFactory.namedNode(OWL.ObjectProperty)
)) {
  if (!Str.startsWith("_:")(quad.subject.value)) {
    objectPropertyIris.add(quad.subject.value);
  }
}

for (const quad of store.match(
  null,
  N3.DataFactory.namedNode(RDF.type),
  N3.DataFactory.namedNode(OWL.DatatypeProperty)
)) {
  if (!Str.startsWith("_:")(quad.subject.value)) {
    datatypePropertyIris.add(quad.subject.value);
  }
}

for (const quad of store.match(
  null,
  N3.DataFactory.namedNode(RDF.type),
  N3.DataFactory.namedNode(OWL.FunctionalProperty)
)) {
  if (!Str.startsWith("_:")(quad.subject.value)) {
    functionalPropertyIris.add(quad.subject.value);
  }
}
```

</details>

---

### OntologyService.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Ontology/OntologyService.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 93 | Native Set in function signature | `visited: Set<string> = new Set()` | `visited: MutableHashSet.MutableHashSet<string> = MutableHashSet.empty()` |
| 98 | Native Set has | `if (visited.has(classIri))` | `if (MutableHashSet.has(visited, classIri))` |
| 99 | Native Set constructor | `return new Set();` | `return MutableHashSet.empty<string>();` |
| 102 | Native Set add | `visited.add(classIri);` | `MutableHashSet.add(visited, classIri);` |
| 103 | Native Set instantiation | `const ancestors = new Set<string>();` | `const ancestors = MutableHashSet.empty<string>();` |
| 107 | Native Set add | `ancestors.add(parentIri);` | `MutableHashSet.add(ancestors, parentIri);` |
| 110 | Native Set add | `ancestors.add(ancestor);` | `MutableHashSet.add(ancestors, ancestor);` |

<details>
<summary>Full Context (Lines 91-116)</summary>

```typescript
// Memoized ancestor computation
const ancestorCache = new Map<string, Set<string>>();

const getAncestorsSet = (classIri: string, visited: Set<string> = new Set()): Set<string> => {
  if (ancestorCache.has(classIri)) {
    return ancestorCache.get(classIri)!;
  }

  if (visited.has(classIri)) {
    return new Set(); // Cycle detection
  }

  visited.add(classIri);
  const ancestors = new Set<string>();
  const parents = parsed.classHierarchy[classIri] ?? [];

  for (const parentIri of parents) {
    ancestors.add(parentIri);
    const parentAncestors = getAncestorsSet(parentIri, visited);
    for (const ancestor of parentAncestors) {
      ancestors.add(ancestor);
    }
  }

  ancestorCache.set(classIri, ancestors);
  return ancestors;
};
```

</details>

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| SameAsLinker.ts | 18 | EntityResolution |
| OntologyParser.ts | 9 | Ontology |
| OntologyService.ts | 7 | Ontology |
| ConfidenceFilter.ts | 7 | Grounding |
| GraphRAGService.ts | 6 | GraphRAG |
| EntityClusterer.ts | 6 | EntityResolution |
| EntityResolutionService.ts | 3 | EntityResolution |
| CanonicalSelector.ts | 3 | EntityResolution |
| GraphAssembler.ts | 3 | Extraction |
| EntityExtractor.ts | 2 | Extraction |

**Impact Score**: 2 (Multiple files in multiple modules, but localized transformations)

---

## Dependency Analysis

### Depends On (Fix These First)
- [ ] V10 - Native Map violations should be fixed in parallel (same files often contain both violations)

### Depended By (Fix These After)
- [ ] None - Set operations are internal implementation details

### Can Fix Independently
- [x] Yes - Each file's Set usage is self-contained

---

## Remediation Notes

### Special Considerations

1. **Type Signature Changes**: `OntologyService.ts` line 93 uses `Set<string>` in a function signature. The function return type and the cache type (`Map<string, Set<string>>`) will need to be updated to `MutableHashSet.MutableHashSet<string>`.

2. **Array.from Conversion**: When converting Set to Array at line 244 in `CanonicalSelector.ts`, use `MutableHashSet.toValues()` which returns an `Iterable`. May need to wrap with `Array.from()` or `A.fromIterable()` if an array is required.

3. **Method Binding Issue**: Line 125 in `EntityClusterer.ts` passes `typesA.has` as a callback. This loses the `this` binding. The MutableHashSet version correctly passes a function that captures the set.

4. **Iterator Compatibility**: Code using `for (const x of set)` will work with MutableHashSet since it's iterable.

### Recommended Approach

1. Add the MutableHashSet import to each affected file
2. Replace `new Set<T>()` with `MutableHashSet.empty<T>()`
3. Replace `new Set(iterable)` with `MutableHashSet.fromIterable(iterable)`
4. Replace `set.add(x)` with `MutableHashSet.add(set, x)`
5. Replace `set.has(x)` with `MutableHashSet.has(set, x)`
6. Replace `set.delete(x)` with `MutableHashSet.remove(set, x)`
7. Replace `Array.from(set)` with `A.fromIterable(MutableHashSet.toValues(set))`
8. Update type annotations from `Set<T>` to `MutableHashSet.MutableHashSet<T>`

### Imports to Add

```typescript
// Add this import to all affected files
import * as MutableHashSet from "effect/MutableHashSet";
```

### New Types to Create

No new types needed. MutableHashSet is a direct replacement for native Set with the same conceptual API.

---

## Verification Commands

```bash
# Verify no violations remain
grep -rn "new Set\(" packages/knowledge/server/src/
grep -rn "new Set<" packages/knowledge/server/src/
grep -rn "= new Set" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V09 Effect Pattern Enforcer |
| **Duration** | ~5 minutes |
| **Files Scanned** | 42 |
| **False Positives Excluded** | 0 |
