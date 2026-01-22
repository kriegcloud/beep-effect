# vitest-testkit-parity

> Port `@effect/vitest` exports to `@beep/testkit` for complete `bun:test` parity.

---

## Purpose

Create a 1:1 mapping of all `@effect/vitest` exports in `@beep/testkit`, enabling Effect-based tests to run identically on `bun:test` as they would on vitest.

**Source**: `tmp/effect/packages/vitest`
**Target**: `tooling/testkit`

---

## Complexity Assessment

| Factor | Weight | Value | Score |
|--------|--------|-------|-------|
| Phase Count | 2 | 2 | 4 |
| Agent Diversity | 3 | 2 | 6 |
| Cross-Package | 4 | 2 | 8 |
| External Deps | 3 | 1 | 3 |
| Uncertainty | 5 | 2 | 10 |
| Research Required | 2 | 1 | 2 |
| **Total** | | | **33 (Medium)** |

---

## Gap Analysis

### Current State

| Feature | @effect/vitest | @beep/testkit | Status |
|---------|----------------|---------------|--------|
| `effect` | Full implementation | Full implementation | Parity |
| `scoped` | Full implementation | Full implementation | Parity |
| `live` | Full implementation | Full implementation | Parity |
| `scopedLive` | Full implementation | Full implementation | Parity |
| `layer()` | With `excludeTestServices` generic | Basic implementation | Partial |
| `flakyTest()` | Full implementation | Full implementation | Parity |
| `prop()` | FastCheck + Schema integration | **Stub only** | **CRITICAL GAP** |
| `makeMethods()` | Full implementation | Full implementation | Parity |
| `describeWrapped()` | Full implementation | Full implementation | Parity |
| `addEqualityTesters()` | Registers vitest testers | No-op (bun limitation) | Expected |

### Assertions Gap

| Assertion | @effect/vitest/utils | @beep/testkit/assert | Status |
|-----------|---------------------|----------------------|--------|
| `fail` | Yes | Yes | Parity |
| `deepStrictEqual` | Yes | Yes | Parity |
| `notDeepStrictEqual` | Yes | Yes | Parity |
| `strictEqual` | Yes | Yes | Parity |
| `assertEquals` | Yes | Yes | Parity |
| `doesNotThrow` | Yes | Yes | Parity |
| `assertInstanceOf` | Yes | Yes | Parity |
| `assertTrue` | Yes | Yes | Parity |
| `assertFalse` | Yes | Yes | Parity |
| `assertInclude` | Yes | Yes | Parity |
| `assertMatch` | Yes | Yes | Parity |
| `throws` | Yes | Yes | Parity |
| `throwsAsync` | Yes | Yes | Parity |
| `assertNone` | Yes | Yes | Parity |
| `assertSome` | Yes | Yes | Parity |
| `assertLeft` | Yes | Yes | Parity |
| `assertRight` | Yes | Yes | Parity |
| `assertFailure` | Yes | Yes | Parity |
| `assertSuccess` | Yes | Yes | Parity |
| `assert.ok` | N/A (Chai) | **Missing** | **GAP** |
| `assert.isOk` | N/A (Chai) | **Missing** | **GAP** |

### Critical Gaps Summary

1. **`prop()` Property-Based Testing** - Current implementation is a stub that ignores arbitraries
2. **`assert.ok` / `assert.isOk`** - Chai-style truthiness assertions missing from assert namespace
3. **`layer()` excludeTestServices generic** - Type parameter not exposed

---

## Work Items

### P1: Implement `prop()` with FastCheck Integration

**Priority**: Critical
**Effort**: Medium

The current `prop()` implementation in `@beep/testkit` is:

```typescript
// Current (stub)
export const prop = (name, _arbitraries, self, timeout) => {
  return it(name, () => self({}, {}), testOptions(timeout));
};
```

Required implementation (from `@effect/vitest`):

```typescript
export const prop = (name, arbitraries, self, timeout) => {
  if (Array.isArray(arbitraries)) {
    const arbs = arbitraries.map((arbitrary) =>
      Schema.isSchema(arbitrary) ? Arbitrary.make(arbitrary) : arbitrary
    );
    return it(
      name,
      testOptions(timeout),
      (ctx) => fc.assert(
        fc.property(...arbs, (...as) => self(as, ctx)),
        isObject(timeout) ? timeout?.fastCheck : {}
      )
    );
  }

  const arbs = fc.record(
    Object.keys(arbitraries).reduce((result, key) => {
      result[key] = Schema.isSchema(arbitraries[key])
        ? Arbitrary.make(arbitraries[key])
        : arbitraries[key];
      return result;
    }, {} as Record<string, fc.Arbitrary<any>>)
  );

  return it(
    name,
    testOptions(timeout),
    (ctx) => fc.assert(
      fc.property(arbs, (as) => self(as, ctx)),
      isObject(timeout) ? timeout?.fastCheck : {}
    )
  );
};
```

**Key differences**:
- Array of arbitraries → spread into `fc.property(...arbs, ...)`
- Object of arbitraries → `fc.record()` + single argument
- Schema detection via `Schema.isSchema()`
- FastCheck options via `timeout?.fastCheck`

### P2: Add `assert.ok` and `assert.isOk`

**Priority**: High
**Effort**: Low

Add to the `Assert` interface and implementation:

```typescript
// In Assert interface
ok: (value: unknown, message?: string) => asserts value;
isOk: (value: unknown, message?: string) => asserts value;

// Implementation
function ok(value: unknown, message?: string): asserts value {
  if (!value) {
    fail(message ?? "Expected value to be truthy");
  }
}

// isOk is an alias for ok
const isOk = ok;
```

### P3: Add `excludeTestServices` Generic to `layer()`

**Priority**: Low
**Effort**: Low

Update the `layer()` type signature to match `@effect/vitest`:

```typescript
export const layer = <R, E, const ExcludeTestServices extends boolean = false>(
  layer_: Layer.Layer<R, E>,
  options?: {
    readonly memoMap?: Layer.MemoMap;
    readonly timeout?: Duration.DurationInput;
    readonly excludeTestServices?: ExcludeTestServices;
  }
): {
  (f: (it: BunTest.MethodsNonLive<R, ExcludeTestServices>) => void): void;
  (name: string, f: (it: BunTest.MethodsNonLive<R, ExcludeTestServices>) => void): void;
}
```

---

## Success Criteria

- [ ] `prop()` supports array of arbitraries (Schema or FastCheck)
- [ ] `prop()` supports object of arbitraries with `fc.record()`
- [ ] `prop()` passes FastCheck options via `timeout?.fastCheck`
- [ ] `assert.ok` exists and asserts truthy values
- [ ] `assert.isOk` exists as alias for `assert.ok`
- [ ] `layer()` has `excludeTestServices` generic parameter
- [ ] All existing tests continue to pass
- [ ] New tests validate FastCheck property-based testing works

---

## Phase Plan

### Phase 1: Implementation

| Task | Agent | Deliverable |
|------|-------|-------------|
| Implement `prop()` | `effect-code-writer` | `src/internal/internal.ts` |
| Add `assert.ok/isOk` | `effect-code-writer` | `src/assert.ts` |
| Update `layer()` types | `effect-code-writer` | `src/index.ts` |

### Phase 2: Verification

| Task | Agent | Deliverable |
|------|-------|-------------|
| Create prop tests | `test-writer` | `test/prop.test.ts` |
| Create assert tests | `test-writer` | `test/assert.test.ts` |
| Run full test suite | Manual | Passing CI |

---

## Reference Files

| File | Purpose |
|------|---------|
| `tmp/effect/packages/vitest/src/index.ts` | Source exports |
| `tmp/effect/packages/vitest/src/internal/internal.ts` | Source implementation |
| `tmp/effect/packages/vitest/src/utils.ts` | Source assertions |
| `tooling/testkit/src/index.ts` | Target exports |
| `tooling/testkit/src/internal/internal.ts` | Target implementation |
| `tooling/testkit/src/assert.ts` | Target assertions |

---

## Related

- [testkit README](../../tooling/testkit/README.md)
- [testkit AGENTS.md](../../tooling/testkit/AGENTS.md)
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md)
