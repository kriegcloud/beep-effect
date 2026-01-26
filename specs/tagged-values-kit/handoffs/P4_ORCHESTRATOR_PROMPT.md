# Phase 4 Orchestrator Prompt

> Copy-paste this prompt to begin Phase 4 in a new session.

---

## Prompt

```
I'm continuing work on the tagged-values-kit spec.

## Context
The spec is at: specs/tagged-values-kit/
Phase 3 revealed type signature issues. Starting Phase 4 (Type Refinement).

## Problem
Test file requires `as unknown as` assertions to pass invalid data for error testing.
This suggests the type signatures may not be optimal.

## Key Files to Read First
1. specs/tagged-values-kit/handoffs/HANDOFF_P3.md - Problem analysis
2. packages/common/schema/src/derived/kits/tagged-values-kit.ts - Implementation
3. packages/common/schema/test/kits/taggedValuesKit.test.ts - Failing tests
4. effect/Schema.ts (via mcp-researcher) - Transform input type patterns

## Investigation Questions
1. How does Effect Schema handle transform encode input types?
2. Should `S.encodeSync(Kit)(value)` accept broader input than exact decoded type?
3. Is the issue in DecodedConfig, DecodedUnion, or the transform schema?

## Tasks
1. Research Effect Schema transform patterns for encode flexibility
2. Decide: fix types OR fix test approach
3. Implement solution
4. All 6 type errors resolved without `as unknown as`
5. `bun run check --filter @beep/schema` passes

## Success Criteria
- No `as unknown as` assertions in test file
- Type check passes
- Tests still validate runtime error behavior
- Type safety preserved for valid usage

## Output
- Updated implementation OR test approach
- Documented rationale in REFLECTION_LOG.md
```

---

## Delegation Strategy

| Task | Agent | Notes |
|------|-------|-------|
| Research Effect Schema patterns | mcp-researcher | Query effect docs for transform encode types |
| Analyze type flow | orchestrator | Trace DecodedConfig → DecodedUnion → transform |
| Implement fix | effect-code-writer | If types need changing |
| Fix tests | orchestrator | If test approach needs changing |

### Key Investigation Points

1. **Transform Schema Encode Type**: Does `S.transform(From, To, ...)` make `encodeSync` accept exactly `To.Type` or something broader?

2. **TaggedConfigKit Comparison**: Does TaggedConfigKit have the same issue? Check its test file.

3. **Schema.make Pattern**: The factory uses `S.make<DecodedUnion<E>, ExtractTags<E>>` - is this constraining encode input?

### Potential Solutions

**If types are wrong**:
```ts
// Option: Use Schema.Type inference instead of manual DecodedConfig
type DecodedUnion<E> = S.Schema.Type<typeof transformSchema>;
```

**If tests are wrong**:
```ts
// Option: Construct invalid data at runtime to bypass type checking
const invalidData = JSON.parse('{"_tag":"a","values":["href","target"]}');
expect(() => S.encodeSync(AllowedAttrs)(invalidData)).toThrow();
```

**If design is wrong**:
```ts
// Option: encodeSync should accept partial data and validate at runtime
// This may require custom encode function, not transform
```

---

## Verification

```bash
bun run check --filter @beep/schema
bun run test --filter @beep/schema
```
