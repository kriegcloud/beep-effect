# Handoff: Review Graph Schema Module & Tests

> Context document for reviewing the newly created Graph schema module for alignment with repository best practices.

**Created**: 2026-01-18
**Priority**: MEDIUM - Quality assurance
**Estimated Effort**: Small-Medium (code review + potential fixes)

---

## Task Summary

Review the newly created Graph schema module and its unit tests for alignment with `beep-effect` repository best practices, coding standards, and Effect patterns.

**Files to Review**:
- `packages/common/schema/src/primitives/graph.ts` — Main implementation (~1135 lines)
- `packages/common/schema/test/primitives/graph.test.ts` — Unit tests (~1500 lines, 126 tests)
- `packages/common/schema/src/primitives/index.ts` — Export barrel (verify graph export)

---

## What Was Implemented

Schema classes for Effect's `Graph` module types, following patterns from `Schema.HashMap` and `Schema.HashSet`:

### Branded Types
- `NodeIndex` / `NodeIndexSchema` / `NodeIndexFromString`
- `EdgeIndex` / `EdgeIndexSchema` / `EdgeIndexFromString`

### Edge Schemas
- `Edge` — Schema.Class for edge with source/target/data
- `EdgeFromSelf` — Declare-based schema for existing Graph.Edge instances
- `EdgeEncoded` — Struct schema for JSON representation
- `EdgeTransform` — Transform from JSON to Graph.Edge

### Graph FromSelf Schemas (declare-based)
- `GraphFromSelf` — Validates any Graph instance
- `DirectedGraphFromSelf` — Validates directed graphs only
- `UndirectedGraphFromSelf` — Validates undirected graphs only
- `MutableGraphFromSelf` — Validates mutable graphs
- `MutableDirectedGraphFromSelf` / `MutableUndirectedGraphFromSelf`

### Graph Transform Schemas (JSON ↔ Graph)
- `DirectedGraph` — Transform from GraphEncoded to DirectedGraph
- `UndirectedGraph` — Transform from GraphEncoded to UndirectedGraph
- `MutableDirectedGraph` / `MutableUndirectedGraph` — Mutable variants

### Type Guards
- `isGraph` — Checks for Graph.TypeId
- `isEdge` — Checks for source/target/data properties

---

## Standards to Verify

### 1. Effect Patterns (`.claude/rules/effect-patterns.md`)

| Requirement | Check |
|-------------|-------|
| Namespace imports (`import * as X from "effect/X"`) | ✓ Verify all imports |
| Single-letter aliases (`A`, `F`, `S`, `O`, etc.) | ✓ Verify consistency |
| PascalCase constructors (`S.Struct`, not `S.struct`) | ✓ Verify usage |
| No native array/string methods | ✓ Check for `.map()`, `.filter()`, etc. |
| Effect FileSystem service (if applicable) | N/A - pure schemas |

### 2. @beep/schema Package Guidelines (`packages/common/schema/CLAUDE.md`)

| Requirement | Check |
|-------------|-------|
| Keep schemas pure (no I/O, DB, network) | ✓ Verify no side effects |
| Export through `src/schema.ts` barrel | ✓ Check export chain |
| Rich annotations (identifier, title, description) | ⚠️ Review annotation coverage |
| Use `F.pipe` with Effect utilities, not native methods | ✓ Verify |
| No cross-slice imports (`@beep/iam-*`, `@beep/documents-*`) | ✓ Verify |

### 3. Testing Patterns (`@beep/testkit`)

| Requirement | Check |
|-------------|-------|
| Use `effect()` helper for Effect tests | ✓ Verify all async tests |
| Use `it()` for synchronous tests | ✓ Verify sync tests |
| Import from `@beep/testkit` (not raw `bun:test`) | ✓ Verify imports |
| Use testkit assertions (`assertTrue`, `assertFalse`, `strictEqual`, `deepStrictEqual`) | ✓ Verify |
| No manual `Effect.runPromise` | ✓ Verify |

### 4. Code Quality

| Requirement | Check |
|-------------|-------|
| No `any` types | ⚠️ Check for `as any` casts |
| No `@ts-ignore` | ✓ Verify |
| Proper JSDoc annotations | ⚠️ Review documentation |
| Consistent formatting (Biome) | Run `bun run lint:fix` |

---

## Known Issues to Investigate

1. **`as any` casts in implementation**: The graph.ts file uses some `as any` casts due to complex type inference issues with Schema transforms. Evaluate if these can be replaced with safer alternatives.

2. **Type guard narrowing conflicts**: The `isGraph` type guard narrows to a base type that conflicts with specific mutable types. Tests work around this by not using `isGraph` before accessing `.mutable`. Consider if the type guard definition could be improved.

3. **Annotation coverage**: Verify all schemas have appropriate annotations for:
   - `identifier`
   - `description`
   - `pretty` (for FromSelf schemas)
   - `equivalence` (for FromSelf schemas)
   - `arbitrary` (for property-based testing)

---

## Reference Files for Patterns

| Purpose | Reference File |
|---------|---------------|
| MutableHashMap schema pattern | `src/primitives/mutable-hash-map.ts` |
| MutableHashSet schema pattern | `src/primitives/mutable-hash-set.ts` |
| MutableHashMap tests | `test/primitives/mutable-hash-map.test.ts` |
| MutableHashSet tests | `test/primitives/mutable-hash-set.test.ts` |
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Schema package guidelines | `packages/common/schema/CLAUDE.md` |

---

## Verification Commands

After resolving any issues, ALL of the following must pass:

```bash
# Type check the schema package (includes all dependencies)
bun run check --filter @beep/schema

# Run all tests for the schema package
bun run test --filter @beep/schema

# Run only graph tests (faster iteration)
bun run test --filter @beep/schema -- test/primitives/graph.test.ts

# Lint and auto-fix
bun run lint:fix --filter @beep/schema

# Build the package
bun run build --filter @beep/schema
```

### Expected Results

| Command | Expected |
|---------|----------|
| `check` | 0 errors |
| `test` | All 126+ graph tests pass |
| `lint:fix` | No unfixable errors |
| `build` | Successful build |

---

## Deliverables

1. **Code Review Notes**: Document any issues found with specific line references
2. **Fixes Applied**: List of changes made to align with standards
3. **Verification Results**: Output showing all checks pass
4. **Recommendations**: Any suggestions for future improvements

---

## Context Files to Read First

Before starting the review, read these files to understand the standards:

1. `.claude/rules/effect-patterns.md` — Effect coding patterns
2. `packages/common/schema/CLAUDE.md` — Schema package guidelines
3. `packages/common/schema/src/primitives/mutable-hash-map.ts` — Reference implementation
4. `packages/common/schema/test/primitives/mutable-hash-map.test.ts` — Reference tests

Then review:
1. `packages/common/schema/src/primitives/graph.ts`
2. `packages/common/schema/test/primitives/graph.test.ts`

---

## Success Criteria

- [ ] All Effect import patterns follow conventions
- [ ] No native array/string/object methods used
- [ ] All tests use `@beep/testkit` patterns
- [ ] No unnecessary `as any` casts (or documented justification)
- [ ] Annotations are complete and consistent
- [ ] `bun run check --filter @beep/schema` passes
- [ ] `bun run test --filter @beep/schema` passes
- [ ] `bun run lint:fix --filter @beep/schema` passes
- [ ] `bun run build --filter @beep/schema` passes
