# Handoff: Fix RLS Integration Test Examples

> Context document for fixing test patterns in the RLS Implementation spec.

**Created**: 2026-01-18
**Priority**: HIGH - Blocking spec accuracy
**Estimated Effort**: Small (single file fix)

---

## Problem Statement

The RLS Integration test example in `MASTER_ORCHESTRATION.md` (lines 520-557) uses incorrect testing patterns that are incompatible with this repository's canonical effectful testing approach.

### Current (INCORRECT) Pattern

```typescript
// WRONG - Uses raw bun:test and manual Effect.runPromise
import { describe, test, expect } from "bun:test";
import * as Effect from "effect/Effect";

describe("RLS Integration", () => {
  test("member table enforces tenant isolation", async () => {
    await Effect.gen(function* () {
      const memberRepo = yield* IamRepos.MemberRepo;
      // ...
      expect(members).toHaveLength(0);
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise  // WRONG - manual runPromise
    );
  });
});
```

### Why This Is Wrong

1. **Uses raw `bun:test`** instead of `@beep/testkit`
2. **Manually calls `Effect.runPromise`** instead of using the testkit's Effect-aware runner
3. **Doesn't integrate with Effect's TestServices** (TestContext, TestClock, etc.)
4. **Error handling is suboptimal** - testkit provides better error reporting via `Cause.prettyErrors`

---

## Canonical Testing Pattern

This repository uses `@beep/testkit` which wraps `bun:test` with Effect-first helpers.

### Key Exports from `@beep/testkit`

| Export | Purpose |
|--------|---------|
| `effect` | Run Effect tests with TestServices |
| `scoped` | Run Effect tests with Scope + TestServices |
| `layer` | Share a Layer between multiple tests |
| `live` | Run Effect tests without TestServices |
| `scopedLive` | Run Effect tests with Scope, no TestServices |
| `flakyTest` | Retry intermittently failing tests |

### Correct Pattern: Simple Effect Test

```typescript
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect(
  "test description",
  Effect.fn(function* () {
    const result = yield* someEffect;
    expect(result).toBe(expected);
  })
);
```

### Correct Pattern: Layer-Based Integration Test

```typescript
import { expect } from "bun:test";
import { layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Create test layer
const TestLayer = Layer.mergeAll(
  TenantContext.layer,
  IamDb.layer,
  IamRepos.layer
);

layer(TestLayer)("RLS Integration", (it) => {
  it.effect("member table enforces tenant isolation", () =>
    Effect.gen(function* () {
      const memberRepo = yield* IamRepos.MemberRepo;
      const ctx = yield* TenantContext.TenantContext;

      // Create member in org A
      yield* ctx.setOrganizationId("org-a-uuid");
      yield* memberRepo.insert({
        userId: "user-1",
        organizationId: "org-a-uuid",
        role: "member",
      });

      // Switch to org B - should not see org A's member
      yield* ctx.setOrganizationId("org-b-uuid");
      const members = yield* memberRepo.findAll();

      expect(members).toHaveLength(0);
    })
  );

  it.effect("cannot insert member for different org than context", () =>
    Effect.gen(function* () {
      const memberRepo = yield* IamRepos.MemberRepo;
      const ctx = yield* TenantContext.TenantContext;

      yield* ctx.setOrganizationId("org-a-uuid");

      // Attempt to insert with mismatched org - should fail
      const result = yield* memberRepo.insert({
        userId: "user-2",
        organizationId: "org-b-uuid",  // Different from context!
        role: "member",
      }).pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
    })
  );
});
```

---

## Files to Modify

| File | Change Required |
|------|-----------------|
| `specs/rls-implementation/MASTER_ORCHESTRATION.md` | Replace lines 520-557 with correct pattern |

---

## Reference Files

Study these files to understand the canonical patterns:

| File | Why |
|------|-----|
| `tooling/testkit/src/index.ts` | Main exports |
| `tooling/testkit/src/internal/internal.ts` | Implementation details |
| `tooling/testkit/CLAUDE.md` | Full documentation |
| `packages/common/schema/test/custom/Number.schemas.test.ts` | Real usage example |

---

## Verification

After making changes:

1. Ensure the test example compiles (check imports are valid)
2. Ensure the pattern matches `@beep/testkit` conventions:
   - Uses `effect()` or `layer()()` instead of raw `describe`/`test`
   - Uses `Effect.fn(function* () { ... })` or `Effect.gen(function* () { ... })`
   - Uses `expect` from `bun:test` (re-exported via `@beep/testkit`)
   - Does NOT manually call `Effect.runPromise`

---

## Context: Why This Was Missed

The original spec creation did not consult:
1. `tooling/testkit/CLAUDE.md` - the canonical testing documentation
2. Existing test files using `@beep/testkit`
3. The testkit package structure

This handoff exists to ensure future spec implementations are aligned with this repository's idioms.
