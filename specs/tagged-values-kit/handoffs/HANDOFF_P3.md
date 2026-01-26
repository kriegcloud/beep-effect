# Handoff: Phase 3 → Phase 4

## Phase 3 Completion Status

| Criterion | Status |
|-----------|--------|
| JSDoc documentation | ✅ Complete |
| Export verification | ✅ Complete |
| Tests pass (runtime) | ✅ 788 pass |
| Type check | ❌ 6 type errors in test file |

## Problem Identified

The test file requires `as unknown as` type assertions to pass invalid data for error testing:

```ts
// Current: Requires double assertion
S.encodeSync(AllowedAttrs)({
  _tag: "a",
  values: ["href", "target"], // missing "rel"
} as unknown as typeof AllowedAttrs.Configs.a)

// Expected: Single assertion should suffice
S.encodeSync(AllowedAttrs)({
  _tag: "a",
  values: ["href", "target"],
} as typeof AllowedAttrs.Configs.a)
```

**Root Cause Analysis**:

The `DecodedConfig` type uses exact tuple types for `values`:
```ts
type DecodedConfig<Tag extends string, Values extends A.NonEmptyReadonlyArray<AST.LiteralValue>> = {
  readonly _tag: Tag;
  readonly values: Values;  // Exact tuple: ["href", "target", "rel"]
};
```

This means `typeof AllowedAttrs.Configs.a` is:
```ts
{ readonly _tag: "a"; readonly values: readonly ["href", "target", "rel"] }
```

TypeScript correctly rejects `["href", "target"]` as incompatible with `["href", "target", "rel"]`.

## Phase 4 Goals

1. **Investigate**: Should `values` be an exact tuple or a more permissive array type?
2. **Decision**: If exact tuples are correct (for type safety), tests should use different approach
3. **If types need fixing**: Adjust `DecodedConfig` and related types
4. **If tests need fixing**: Use proper invalid data construction without assertions

## Type Signature Options

### Option A: Keep Exact Tuples (Current)
- Pro: Maximum type safety - encode rejects wrong values at compile time
- Con: Tests for runtime validation require `unknown` casts
- Test fix: Create invalid data differently (e.g., construct at runtime)

### Option B: Loosen to ReadonlyArray
- Pro: Tests can pass invalid data with single assertion
- Con: Loses compile-time validation of exact values

### Option C: Separate Encoded/Decoded Types
- Pro: `S.encodeSync` input type could be more permissive
- Con: More complex type definitions

## Affected Lines

| Line | Issue |
|------|-------|
| 217 | Wrong order values |
| 226 | Missing values |
| 235 | Extra values |
| 244 | Wrong tag's values |
| 260 | Missing numeric value |
| 471 | Empty values array |

## Working Memory (P4 Tasks)

1. [ ] Analyze Effect Schema patterns for encode input types
2. [ ] Decide: exact tuples vs permissive arrays
3. [ ] Implement chosen solution
4. [ ] Update tests to work without `as unknown as`
5. [ ] Verify `bun run check --filter @beep/schema` passes

## Semantic Memory

| Key | Value |
|-----|-------|
| Source | `packages/common/schema/src/derived/kits/tagged-values-kit.ts` |
| Test | `packages/common/schema/test/kits/taggedValuesKit.test.ts` |
| Key Type | `DecodedConfig` at line ~124 |
| Reference | `effect/Schema.ts` transform patterns |
