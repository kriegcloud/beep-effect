# Phase 8 Orchestrator Prompt: Testing & Atom Factory

## Instructions

Copy the prompt below and use it to start Phase 8. This phase creates test files and the atom factory utility.

---

## Prompt

```
Execute Phase 8 of the IAM Effect Patterns specification: Testing & Atom Factory.

## Context

Read these files in order:
1. specs/iam-effect-patterns/PLAN.md - Detailed implementation plan
2. specs/iam-effect-patterns/handoffs/HANDOFF_P8.md - Phase 8 requirements
3. specs/iam-effect-patterns/REFLECTION_LOG.md - Phase 7 learnings
4. packages/iam/client/src/_common/handler.factory.ts - Implementation to test
5. packages/iam/client/src/_common/schema.helpers.ts - Implementation to test

## Implementation Steps

Execute in this exact order:

### Step 1: Create handler.factory.test.ts

File: `packages/iam/client/src/_common/__tests__/handler.factory.test.ts`

Create test file with these test cases:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as S from "effect/Schema";

// Test schemas
const TestSuccess = S.Struct({ id: S.String, name: S.String });
const TestPayload = S.Struct({ email: S.String });

describe("createHandler", () => {
  // 1. Mock Better Auth client
  // 2. Test without payload - success case
  // 3. Test without payload - error case
  // 4. Test with payload - encodes before execute
  // 5. Test mutatesSession: true - notifies $sessionSignal
  // 6. Test mutatesSession: false - does NOT notify $sessionSignal
  // 7. Test span naming matches "{domain}/{feature}/handler"
});
```

Note: The handler.factory.ts imports `client` from `@beep/iam-client/adapters`. You'll need to mock this module to test the factory.

Run: `bun run test --filter @beep/iam-client`

### Step 2: Create schema.helpers.test.ts

File: `packages/iam/client/src/_common/__tests__/schema.helpers.test.ts`

Create test file with these test cases:

```typescript
import { describe, it, expect } from "vitest";
import * as S from "effect/Schema";
import {
  BetterAuthErrorSchema,
  extractBetterAuthErrorMessage
} from "../schema.helpers.ts";

describe("BetterAuthErrorSchema", () => {
  it("decodes valid error object", () => {
    const input = {
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
      status: 401,
    };
    // ...
  });

  it("handles missing optional fields", () => {
    const input = { message: "Error" };
    // ...
  });
});

describe("extractBetterAuthErrorMessage", () => {
  it("extracts message from error object", () => {
    // ...
  });

  it("returns 'Unknown error' when message missing", () => {
    // ...
  });

  it("returns 'Unknown error' for null", () => {
    // ...
  });
});
```

Run: `bun run test --filter @beep/iam-client`

### Step 3: Implement atom.factory.ts

File: `packages/iam/client/src/_common/atom.factory.ts`

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { Atom } from "@effect-atom/atom-react";
import { useAtomSet } from "@effect-atom/atom-react";
import { withToast, type ToastConfig } from "@beep/ui/common/with-toast";

/**
 * Configuration for creating a mutation atom.
 */
export interface MutationAtomConfig<
  Input,
  Output,
  Error,
  Runtime extends { fn: <A, E>(effect: (input: Input) => Effect.Effect<A, E>) => Atom.Atom<Input, A, E> },
> {
  /** Runtime instance from makeAtomRuntime() */
  readonly runtime: Runtime;
  /** Handler function that returns an Effect */
  readonly handler: (input: Input) => Effect.Effect<Output, Error>;
  /** Toast configuration for user feedback */
  readonly toast: {
    readonly waiting: string;
    readonly success: string | ((result: Output) => string);
    readonly failure: (error: O.Option<Error>) => string;
  };
}

/**
 * Creates a mutation atom with integrated toast feedback.
 *
 * @example
 * ```typescript
 * const { atom, useMutation } = createMutationAtom({
 *   runtime,
 *   handler: SignOut.Handler,
 *   toast: {
 *     waiting: "Signing out...",
 *     success: "Signed out successfully",
 *     failure: (err) => O.match(err, {
 *       onNone: () => "Sign out failed",
 *       onSome: (e) => e.message,
 *     }),
 *   },
 * });
 *
 * // In component:
 * const { mutate } = useMutation();
 * await mutate({});
 * ```
 */
export const createMutationAtom = <
  Input,
  Output,
  Error,
  Runtime extends { fn: <A, E>(effect: (input: Input) => Effect.Effect<A, E>) => Atom.Atom<Input, A, E> },
>(
  config: MutationAtomConfig<Input, Output, Error, Runtime>
) => {
  const atom = config.runtime.fn(
    F.flow(
      config.handler,
      withToast({
        onWaiting: config.toast.waiting,
        onSuccess: config.toast.success,
        onFailure: config.toast.failure,
      } as ToastConfig<Output, Error>)
    )
  );

  /**
   * Hook for using the mutation atom in React components.
   * Returns { mutate } where mutate is a promise-returning function.
   */
  const useMutation = () => {
    const mutate = useAtomSet(atom, { mode: "promise" as const });
    return { mutate };
  };

  return { atom, useMutation };
};
```

Note: The runtime type is complex. You may need to adjust the generic constraints based on actual `@effect-atom/atom-react` types. Check `packages/iam/client/src/core/atoms.ts` for reference patterns.

Run: `bun run check --filter @beep/iam-client`

### Step 4: Export atom.factory.ts

File: `packages/iam/client/src/_common/index.ts`

Add export:
```typescript
export * from "./atom.factory.ts";
```

### Step 5: Final verification

Run all checks:
```bash
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
bun run test --filter @beep/iam-client
bunx turbo run build --filter @beep/iam-client
```

## Constraints

- All imports use namespace style: `import * as Effect from "effect/Effect"`
- No native array/string methods - use Effect utilities
- PascalCase Schema constructors: `S.Struct`, `S.String`
- Test framework: Vitest (`describe`, `it`, `expect`, `vi`)
- Relative imports in tests: `../handler.factory.ts`

## Post-Completion

After implementation:
1. Run full verification commands
2. Update REFLECTION_LOG.md with Phase 8 learnings
3. Update README.md to mark Phase 8 complete
4. Spec is COMPLETE after Phase 8

## Testing Notes

### Mocking Better Auth Client

The handler factory imports `client` from `@beep/iam-client/adapters`. To test, you need to mock this:

```typescript
const mockNotify = vi.fn();
const mockExecute = vi.fn();

vi.mock("@beep/iam-client/adapters", () => ({
  client: {
    signOut: mockExecute,
    signIn: { email: mockExecute },
    $store: { notify: mockNotify },
  },
}));
```

### Running Effects in Tests

Use `Effect.runPromise` or `Effect.runSync` to execute Effects in tests:

```typescript
const result = await Effect.runPromise(handler({ payload, fetchOptions }));
expect(result).toEqual({ id: "123", name: "Test" });
```

For error cases:
```typescript
const exit = await Effect.runPromiseExit(handler({ payload }));
expect(Exit.isFailure(exit)).toBe(true);
```

## Success Criteria

| Metric | Target |
|--------|--------|
| handler.factory.test.ts created | Yes |
| schema.helpers.test.ts created | Yes |
| atom.factory.ts implemented | Yes |
| All tests pass | Yes |
| Type errors | 0 |
| Lint errors | 0 |
| Build success | Yes |
```

---

## Expected Duration

60-90 minutes

## Phase 8 Success Criteria

| Metric | Target |
|--------|--------|
| handler.factory.test.ts created and passing | Yes |
| schema.helpers.test.ts created and passing | Yes |
| atom.factory.ts implemented | Yes |
| _common/index.ts exports updated | Yes |
| Type errors | 0 |
| Lint errors | 0 |
| All tests pass | Yes |
| Build success | Yes |
