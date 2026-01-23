# V08: Object.entries Audit Report

## Summary

| Metric | Value |
|--------|-------|
| **Violation ID** | V08 |
| **Pattern** | Object.entries/Object.keys/Object.values |
| **Files Affected** | 2 |
| **Total Occurrences** | 4 |
| **Severity** | Medium |
| **Auto-fixable** | Yes |

## Rule Reference

**Source**: `.claude/rules/effect-patterns.md` - Native Method Ban

> NEVER use native JavaScript array/string methods. Route ALL operations through Effect utilities.

## Violation Details

### File 1: GraphRAGService.ts

**Path**: `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

#### Occurrence 1 (Line 300)

**Context**: Converting scores record to Map for context formatting

**Current Code**:
```typescript
const scoreMap = new Map<string, number>(Object.entries(scores));
```

**Correct Code**:
```typescript
import * as R from "effect/Record";
// ...
const scoreMap = new Map<string, number>(R.toEntries(scores));
```

**Import Change Required**: Add `import * as R from "effect/Record";`

---

#### Occurrence 2 (Line 386)

**Context**: Same pattern in `queryFromSeeds` method

**Current Code**:
```typescript
const scoreMap = new Map<string, number>(Object.entries(scores));
```

**Correct Code**:
```typescript
const scoreMap = new Map<string, number>(R.toEntries(scores));
```

**Import Change Required**: Same as above (already added)

---

### File 2: CanonicalSelector.ts

**Path**: `packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`

#### Occurrence 3 (Line 59)

**Context**: Counting attributes in entity for hybrid scoring

**Current Code**:
```typescript
const countAttributes = (entity: AssembledEntity): number => {
  return Object.keys(entity.attributes).length;
};
```

**Correct Code**:
```typescript
import * as R from "effect/Record";
// ...
const countAttributes = (entity: AssembledEntity): number => {
  return R.keys(entity.attributes).length;
};
```

**Import Change Required**: Add `import * as R from "effect/Record";`

---

#### Occurrence 4 (Line 224)

**Context**: Iterating over member attributes during cluster merging

**Current Code**:
```typescript
for (const member of members) {
  for (const [key, value] of Object.entries(member.attributes)) {
    if (!(key in mergedAttributes)) {
      mergedAttributes[key] = value;
    }
  }
}
```

**Correct Code**:
```typescript
import * as R from "effect/Record";
import * as A from "effect/Array";  // Already imported
// ...
for (const member of members) {
  A.forEach(R.toEntries(member.attributes), ([key, value]) => {
    if (!(key in mergedAttributes)) {
      mergedAttributes[key] = value;
    }
  });
}
```

**Alternative (more idiomatic)**:
```typescript
for (const member of members) {
  for (const [key, value] of R.toEntries(member.attributes)) {
    if (!(key in mergedAttributes)) {
      mergedAttributes[key] = value;
    }
  }
}
```

**Import Change Required**: Add `import * as R from "effect/Record";`

---

## Remediation Summary

### Required Import Additions

| File | Import to Add |
|------|---------------|
| `GraphRAGService.ts` | `import * as R from "effect/Record";` |
| `CanonicalSelector.ts` | `import * as R from "effect/Record";` |

### Transformation Rules

| Native Method | Effect Replacement | Notes |
|---------------|-------------------|-------|
| `Object.entries(obj)` | `R.toEntries(obj)` | Returns `Array<[string, V]>` |
| `Object.keys(obj)` | `R.keys(obj)` | Returns `Array<string>` |
| `Object.values(obj)` | `R.values(obj)` | Returns `Array<V>` |

## Verification

After remediation, verify no violations remain:

```bash
grep -rn "Object\.entries\(" packages/knowledge/server/src/
grep -rn "Object\.keys\(" packages/knowledge/server/src/
grep -rn "Object\.values\(" packages/knowledge/server/src/
```

Expected: No matches

## Notes

1. **GraphRAGService.ts**: The `R` import alias does not currently exist. Import must be added to the import block (after line 21).

2. **CanonicalSelector.ts**: The `R` import alias does not currently exist. Import must be added to the import block (after line 12).

3. **Type Compatibility**: `R.toEntries` returns the same type as `Object.entries` (`Array<[string, V]>`), so the Map constructor call remains valid.

4. **No Object.values Found**: The search for `Object.values` returned no matches in the knowledge server package.
