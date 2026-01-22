# Quick Start: vitest-testkit-parity

> 5-minute guide to implementing @effect/vitest parity in @beep/testkit

---

## TL;DR

Three gaps need closing:

1. **`prop()`** - Implement FastCheck property-based testing (critical)
2. **`assert.ok/isOk`** - Add Chai-style truthiness assertions
3. **`layer()` types** - Add `excludeTestServices` generic parameter

---

## Start Implementation

### Option A: Use effect-code-writer agent

```
Implement the `prop()` function in @beep/testkit following the @effect/vitest implementation.

Source: tmp/effect/packages/vitest/src/internal/internal.ts (lines 162-186)
Target: tooling/testkit/src/internal/internal.ts

Key requirements:
1. Support array of arbitraries (Schema or FastCheck)
2. Support object of arbitraries via fc.record()
3. Pass FastCheck options via timeout?.fastCheck
4. Use effect/FastCheck (fc), effect/Schema, effect/Arbitrary
```

### Option B: Manual implementation

1. Open `tooling/testkit/src/internal/internal.ts`
2. Find the stub `prop` function (around line 127)
3. Replace with the FastCheck-integrated version from `tmp/effect/packages/vitest/src/internal/internal.ts`

---

## Verification

```bash
# Run testkit tests
bun run test --filter=@beep/testkit

# Type check
bun run check --filter=@beep/testkit
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `tooling/testkit/src/internal/internal.ts` | Implement `prop()` |
| `tooling/testkit/src/assert.ts` | Add `ok`, `isOk` to Assert interface |
| `tooling/testkit/src/index.ts` | Update `layer()` type signature |
| `tooling/testkit/test/prop.test.ts` | New tests for property-based testing |

---

## Done When

- [ ] `bun run test --filter=@beep/testkit` passes
- [ ] `bun run check --filter=@beep/testkit` passes
- [ ] Property-based tests run with actual FastCheck arbitraries
