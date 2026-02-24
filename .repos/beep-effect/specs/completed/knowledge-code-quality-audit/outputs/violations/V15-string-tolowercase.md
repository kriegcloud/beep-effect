# V15: String.toLowerCase Audit Report

**Audit Date**: 2026-01-22
**Scope**: `packages/knowledge/server/src/**/*.ts`
**Rule Reference**: `.claude/rules/effect-patterns.md` - Native Method Ban

## Summary

| Metric | Count |
|--------|-------|
| **Total Violations** | 14 |
| **Files Affected** | 6 |
| **toUpperCase Violations** | 0 |

## Violations Found

### 1. ConfidenceFilter.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Grounding/ConfidenceFilter.ts`
**Line**: 183

**Current Code**:
```typescript
const key = (entity.canonicalName ?? entity.mention).toLowerCase();
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
```

---

### 2. OntologyService.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Ontology/OntologyService.ts`
**Line**: 367

**Current Code**:
```typescript
const lowerQuery = query.toLowerCase();
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

const lowerQuery = Str.toLowerCase(query);
```

**Note**: This file already uses `Str.toLowerCase` on lines 344, 349, 350, 351, 372, 373, 374 - so the import exists. Only line 367 needs fixing.

---

### 3. ExtractionPipeline.ts (First Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
**Line**: 290

**Current Code**:
```typescript
entityByMention.set(entity.mention.toLowerCase(), entity);
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

entityByMention.set(Str.toLowerCase(entity.mention), entity);
```

---

### 4. ExtractionPipeline.ts (Second Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
**Line**: 301

**Current Code**:
```typescript
const entity = entityByMention.get(mention.text.toLowerCase());
```

**Correct Pattern**:
```typescript
const entity = entityByMention.get(Str.toLowerCase(mention.text));
```

---

### 5. ExtractionPipeline.ts (Third Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
**Line**: 308

**Current Code**:
```typescript
if (!existing.some((e) => e.mention.toLowerCase() === entity.mention.toLowerCase())) {
```

**Correct Pattern**:
```typescript
if (!existing.some((e) => Str.toLowerCase(e.mention) === Str.toLowerCase(entity.mention))) {
```

**Note**: The `existing.some(...)` call is also a V10 (native array method) violation, but this report focuses only on string methods.

---

### 6. RelationExtractor.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/RelationExtractor.ts`
**Line**: 293

**Current Code**:
```typescript
const key = `${triple.subjectMention}|${triple.predicateIri}|${objectPart}`.toLowerCase();
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

const key = Str.toLowerCase(`${triple.subjectMention}|${triple.predicateIri}|${objectPart}`);
```

---

### 7. GraphAssembler.ts (First Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/GraphAssembler.ts`
**Line**: 223

**Current Code**:
```typescript
const key = (entity.canonicalName ?? entity.mention).toLowerCase();
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
```

**Note**: This file already uses `Str.toLowerCase` on lines 260 and 276 - so the import exists.

---

### 8. GraphAssembler.ts (Second Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/GraphAssembler.ts`
**Line**: 235

**Current Code**:
```typescript
const mentionKey = entity.mention.toLowerCase();
```

**Correct Pattern**:
```typescript
const mentionKey = Str.toLowerCase(entity.mention);
```

---

### 9. GraphAssembler.ts (Third Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/GraphAssembler.ts`
**Line**: 376

**Current Code**:
```typescript
const key = (entity.canonicalName ?? entity.mention).toLowerCase();
```

**Correct Pattern**:
```typescript
const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
```

---

### 10. EntityExtractor.ts (First Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`
**Line**: 188

**Current Code**:
```typescript
const classifiedMentions = new Set(allEntities.map((e) => e.mention.toLowerCase()));
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

const classifiedMentions = new Set(A.map(allEntities, (e) => Str.toLowerCase(e.mention)));
```

**Note**: This line also has a V10 (native array method) violation with `allEntities.map(...)`.

---

### 11. EntityExtractor.ts (Second Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`
**Line**: 189

**Current Code**:
```typescript
const unclassified = A.filter([...mentions], (m) => !classifiedMentions.has(m.text.toLowerCase()));
```

**Correct Pattern**:
```typescript
const unclassified = A.filter([...mentions], (m) => !classifiedMentions.has(Str.toLowerCase(m.text)));
```

---

### 12. EntityExtractor.ts (Third Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`
**Line**: 249

**Current Code**:
```typescript
const key = (entity.canonicalName ?? entity.mention).toLowerCase();
```

**Correct Pattern**:
```typescript
const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
```

---

### 13. EntityResolutionService.ts (First Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
**Line**: 143

**Current Code**:
```typescript
const key = (entity.canonicalName ?? entity.mention).toLowerCase();
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
```

---

### 14. EntityResolutionService.ts (Second Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
**Line**: 147

**Current Code**:
```typescript
const mentionKey = entity.mention.toLowerCase();
```

**Correct Pattern**:
```typescript
const mentionKey = Str.toLowerCase(entity.mention);
```

---

## Correct Usage Found (Not Violations)

The following patterns were correctly identified as **correct Effect String usage** and confirm the proper pattern:

### OntologyService.ts (Correct Usage)
- Line 344: `const lowerQuery = Str.toLowerCase(query);`
- Line 349: `F.pipe(cls.label, Str.toLowerCase, Str.includes(lowerQuery))`
- Line 350: `F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery))`
- Line 351: `F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery))`
- Line 372: `F.pipe(prop.label, Str.toLowerCase, Str.includes(lowerQuery))`
- Line 373: `F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery))`
- Line 374: `F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery))`

### GraphAssembler.ts (Correct Usage)
- Line 260: `const subjectKey = Str.toLowerCase(triple.subjectMention);`
- Line 276: `const objectKey = Str.toLowerCase(triple.objectMention);`

### GroundingService.ts (Correct Usage)
- Line 102: `F.pipe(predicateLabel, Str.replace(/([A-Z])/g, " $1"), Str.toLowerCase, Str.trim)`

---

## Recommendations

1. **Priority**: All 14 violations should be fixed to maintain codebase consistency
2. **Complexity**: All fixes are straightforward replacements
3. **Import Check**: Some files already have `import * as Str from "effect/String"` - verify before adding duplicate imports
4. **Testing**: Run `bun run test --filter @beep/knowledge-server` after fixes
5. **Verification**: Run `bun run check --filter @beep/knowledge-server` to ensure type safety

## Pattern Reference

From `.claude/rules/effect-patterns.md`:

```typescript
// FORBIDDEN
string.toLowerCase()
string.toUpperCase()

// REQUIRED
import * as Str from "effect/String";

Str.toLowerCase(string)
Str.toUpperCase(string)
```

## Files Requiring Import Addition

The following files need `import * as Str from "effect/String"` added:

1. `ConfidenceFilter.ts`
2. `ExtractionPipeline.ts`
3. `RelationExtractor.ts`
4. `EntityExtractor.ts`
5. `EntityResolutionService.ts`

The following files already have the import:
1. `OntologyService.ts` (has correct usage alongside violations)
2. `GraphAssembler.ts` (has correct usage alongside violations)
