# Phase 3c Orchestrator Prompt - Native Set

Copy-paste this prompt to start Phase 3c implementation.

---

## Prompt

You are implementing Phase 3c (Native Set) of the `knowledge-code-quality-audit` spec.

### Context

**Completed**: Phases 3a (Foundation) and 3b (Type Safety) - 41 fixes done.

**This Phase**: Replace `new Set<T>()` with Effect's `MutableHashSet` (22 fixes across 8 files)

### Replacement Pattern

```typescript
// BEFORE - Native JavaScript
const visited = new Set<string>();
visited.add(item);
visited.has(item);
visited.delete(item);
for (const item of visited) { ... }

// AFTER - Effect MutableHashSet
import * as MutableHashSet from "effect/MutableHashSet";
const visited = MutableHashSet.make<string>();
MutableHashSet.add(visited, item);
MutableHashSet.has(visited, item);
MutableHashSet.remove(visited, item);
MutableHashSet.forEach(visited, (item) => { ... });
```

### Files to Fix

| File | Location | Count |
|------|----------|-------|
| `EntityResolution/EntityClusterer.ts` | ~124, 125, 138, 144, 145, 147 | 6 |
| `EntityResolution/SameAsLinker.ts` | ~202, 204, 205, others | 3 |
| `EntityResolution/CanonicalSelector.ts` | ~232, 235, 244 | 3 |
| `Ontology/OntologyService.ts` | ~93, 98, 99, 102, 103, 107, 110 | 7 |
| `Ontology/OntologyParser.ts` | Multiple locations | 3 (est) |
| `GraphRAG/GraphRAGService.ts` | ~439, 445, 464, 465, 473, 474 | 6 |
| `Grounding/ConfidenceFilter.ts` | ~126, 128, 130, 135, 159, 166, 169 | 7 |
| `Extraction/GraphAssembler.ts` | ~390, 403, 404 | 3 |

### Verification

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Tests (55 should pass)
bun run test --filter @beep/knowledge-server

# Verify no native Set remains
grep -rn "new Set<" packages/knowledge/server/src/
# Should return empty
```

### Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep -rn "new Set<" packages/knowledge/server/src/ \| wc -l` | 0 |

### Common Pitfalls

1. **for...of loops don't work** - Use `MutableHashSet.forEach(set, fn)`
2. **Set spread** - `[...set]` → `Array.from(MutableHashSet.values(set))`
3. **set.has in callbacks** - `A.some(arr, set.has)` → `A.some(arr, (x) => MutableHashSet.has(set, x))`

### After Completion

Update `MASTER_VIOLATIONS.md` to mark Phase 3c complete, then proceed to Phase 3d (Native Map Part 1).

### Reference

- Full handoff: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3c.md`
- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
