# Phase 3f Orchestrator Prompt - Array Emptiness Checks

Copy-paste this prompt to start Phase 3f implementation.

---

## Prompt

You are implementing Phase 3f (Array Emptiness Checks) of the `knowledge-code-quality-audit` spec.

### Context

**Completed**: Phases 3a-3e - 102 fixes done (Foundation, Type Safety, Native Set, Native Map Parts 1 & 2).

**This Phase**: Replace `array.length === 0` / `.length > 0` / `.length !== 0` with Effect Array utilities (35 fixes across 13 files)

### Lessons Learned from Phase 3e (CRITICAL)

**1. Test files may need updates too:**
- After changing function signatures, grep for usage in `test/` directory
- In Phase 3e, both `ContextFormatter.test.ts` and `RrfScorer.test.ts` needed updates

**2. MutableHashMap forEach callback order:**
```typescript
// Callback is (value, key) NOT (key, value)!
MutableHashMap.forEach(map, (value, key) => { ... });
```

**3. Option handling patterns:**
```typescript
// Check and extract
if (O.isNone(opt)) continue;
const value = opt.value;

// With default
const value = O.getOrElse(opt, () => defaultValue);
```

**4. fromIterable for constructing from entries:**
```typescript
MutableHashMap.fromIterable(Object.entries(obj));
```

### Replacement Patterns

```typescript
// BEFORE - Native JavaScript
if (array.length === 0) { ... }
if (array.length > 0) { ... }
if (array.length !== 0) { ... }

// AFTER - Effect Array utilities
import * as A from "effect/Array";

if (A.isEmptyReadonlyArray(array)) { ... }
if (A.isNonEmptyReadonlyArray(array)) { ... }
if (A.isNonEmptyReadonlyArray(array)) { ... }
```

**Special case for strings:**
```typescript
// Use String module for string emptiness
import * as Str from "effect/String";
if (Str.isEmpty(text)) { ... }
```

### Files to Fix

| File | Violations | Lines |
|------|------------|-------|
| `ContextFormatter.ts` | 7 | 27, 31, 103, 109, 142, 152, 211 |
| `EntityClusterer.ts` | 5 | 114, 324, 392, 413, 485 |
| `NlpService.ts` | 5 | 44, 64, 92, 101, 157* |
| `GraphRAGService.ts` | 3 | 231, 351, 452 |
| `PromptTemplates.ts` | 3 | 70, 136, 137 |
| `EntityResolutionService.ts` | 2 | 284, 316 |
| `CanonicalSelector.ts` | 2 | 121, 223 |
| `GroundingService.ts` | 2 | 171, 253 |
| `EntityExtractor.ts` | 2 | 115, 146 |
| `GraphAssembler.ts` | 1 | 355 |
| `SameAsLinker.ts` | 1 | 352 |
| `ConfidenceFilter.ts` | 1 | 287 |
| `vector.ts` | 1 | 24 |

*Line 157 in NlpService.ts is a string check - use `Str.isEmpty()`

### Required Imports

Most files already have `import * as A from "effect/Array"`. Verify before adding.

For string checks, add:
```typescript
import * as Str from "effect/String";
```

### Verification

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Tests (55 should pass)
bun run test --filter @beep/knowledge-server

# Verify no length checks remain
grep -rn "\.length === 0\|\.length > 0\|\.length !== 0" \
  packages/knowledge/server/src/GraphRAG/ContextFormatter.ts \
  packages/knowledge/server/src/EntityResolution/EntityClusterer.ts \
  packages/knowledge/server/src/Nlp/NlpService.ts \
  packages/knowledge/server/src/GraphRAG/GraphRAGService.ts \
  packages/knowledge/server/src/Ai/PromptTemplates.ts \
  packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts \
  packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts \
  packages/knowledge/server/src/Grounding/GroundingService.ts \
  packages/knowledge/server/src/Extraction/EntityExtractor.ts \
  packages/knowledge/server/src/Extraction/GraphAssembler.ts \
  packages/knowledge/server/src/EntityResolution/SameAsLinker.ts \
  packages/knowledge/server/src/Grounding/ConfidenceFilter.ts \
  packages/knowledge/server/src/utils/vector.ts
# Should return empty
```

### Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep ".length === 0\|.length > 0" (13 files)` | 0 matches |

### Common Pitfalls

1. **String vs Array**: Use `Str.isEmpty()` for strings, `A.isEmptyReadonlyArray()` for arrays
2. **For/While loops**: The condition `frontier.length > 0` becomes `A.isNonEmptyReadonlyArray(frontier)`
3. **Ternary conditions**: Replace in-place without changing logic
4. **Combined conditions**: `a.length !== b.length || a.length === 0` - only replace the emptiness part

### After Completion

Update `MASTER_VIOLATIONS.md` to mark Phase 3f complete, then proceed to Phase 3g (Native Array Methods Part 1 - ~40 fixes).

### Reference

- Full handoff: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3f.md`
- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
