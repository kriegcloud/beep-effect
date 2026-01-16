# Phase 8 Handoff: Testing & Atom Factory

## Status Summary

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0 | Complete | Spec scaffolding |
| Phase 1 | Complete | `outputs/current-patterns.md` |
| Phase 2 | Complete | `outputs/effect-research.md` |
| Phase 3 | Complete | `outputs/pattern-proposals.md` |
| Phase 4 | Complete | `outputs/pattern-review.md` |
| Phase 5 | Complete | `PLAN.md` |
| Phase 6 | Complete | `errors.ts`, `schema.helpers.ts`, `handler.factory.ts`, handler migrations |
| Phase 7 | Complete | AGENTS.md updates, get-session/sign-up handlers |
| **Phase 8** | **Ready** | Test files, `atom.factory.ts` |

## Phase 7 Deliverables (Reference for Phase 8)

### Files Created/Modified

| File | Type | Description |
|------|------|-------------|
| `packages/iam/client/src/_common/handler.factory.ts` | Created | `createHandler` factory with TypeScript overloads |
| `packages/iam/client/src/_common/schema.helpers.ts` | Created | Error extraction, `withFormAnnotations` re-export |
| `packages/iam/client/src/_common/errors.ts` | Modified | Added Data.TaggedError variants |
| `packages/iam/client/src/_common/index.ts` | Modified | Added exports for new helpers |
| `packages/iam/client/src/core/sign-out/sign-out.handler.ts` | Modified | Migrated to factory pattern |
| `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` | Modified | Migrated to factory pattern |
| `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts` | Modified | Manual handler with bug fixes |
| `packages/iam/client/src/core/get-session/get-session.handler.ts` | Modified | Manual handler (different response shape) |
| `packages/iam/client/AGENTS.md` | Modified | Added factory pattern recipes and gotchas |

### Handler Factory Pattern

```typescript
// With payload (sign-in, sign-up)
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// Without payload (sign-out)
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

### Key Learnings from Phase 7

1. **Factory limitations discovered**: Some handlers can't use the factory:
   - `get-session`: Different response shape (`{ data: {...} | null }` vs `{ data, error }`)
   - `sign-up/email`: Payload transform loses computed `name` field

2. **Bug fixes applied to ALL session-mutating handlers**:
   - `response.error` checking before decode
   - `$sessionSignal` notification after success

## Phase 8 Objectives

1. **Create test files** for handler factory and schema helpers
2. **Implement atom.factory.ts** for mutation atom boilerplate reduction
3. **Optional: Create state-machine.ts** for multi-step auth flows

## Phase 8 Tasks

### Task 1: Create Handler Factory Tests

Location: `packages/iam/client/src/_common/__tests__/handler.factory.test.ts`

Test scenarios:
1. **With payload**: Encodes payload before executing
2. **Response error handling**: Fails Effect when `response.error` is present
3. **Success decoding**: Decodes success data on successful response
4. **Session mutation**: Notifies `$sessionSignal` when `mutatesSession: true`
5. **No session mutation**: Does NOT notify `$sessionSignal` when `mutatesSession: false`
6. **Span naming**: Generates correct span name: `"{domain}/{feature}/handler"`

Test structure:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { createHandler } from "../handler.factory.ts";

// Mock Better Auth client
const mockClient = {
  signOut: vi.fn(),
  $store: {
    notify: vi.fn(),
  },
};

vi.mock("@beep/iam-client/adapters", () => ({
  client: mockClient,
}));

describe("createHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("without payload", () => {
    it("notifies $sessionSignal when mutatesSession is true", async () => {
      // ...
    });

    it("does not notify $sessionSignal when mutatesSession is false", async () => {
      // ...
    });

    it("fails with BetterAuthResponseError when response.error is present", async () => {
      // ...
    });
  });

  describe("with payload", () => {
    it("encodes payload before executing", async () => {
      // ...
    });
  });
});
```

### Task 2: Create Schema Helpers Tests

Location: `packages/iam/client/src/_common/__tests__/schema.helpers.test.ts`

Test scenarios:
1. **extractBetterAuthErrorMessage**: Extracts message from error object
2. **extractBetterAuthErrorMessage**: Falls back to "Unknown error" when no message
3. **BetterAuthErrorSchema**: Decodes valid error shapes
4. **BetterAuthErrorSchema**: Handles missing optional fields

### Task 3: Implement Atom Factory

Location: `packages/iam/client/src/_common/atom.factory.ts`

Reference implementation from Phase 3 proposal:
```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { useAtomSet } from "@effect-atom/atom-react";
import { withToast } from "@beep/ui/common/with-toast";

export interface MutationAtomConfig<Input, Output, Error> {
  readonly runtime: { fn: <A, E>(effect: Effect.Effect<A, E>) => unknown };
  readonly handler: (input: Input) => Effect.Effect<Output, Error>;
  readonly toast: {
    readonly waiting: string;
    readonly success: string | ((result: Output) => string);
    readonly failure: (error: Option<Error>) => string;
  };
}

export const createMutationAtom = <Input, Output, Error>(
  config: MutationAtomConfig<Input, Output, Error>
) => {
  const atom = config.runtime.fn(
    F.flow(
      config.handler,
      withToast({
        onWaiting: config.toast.waiting,
        onSuccess: config.toast.success,
        onFailure: config.toast.failure,
      })
    )
  );

  const useMutation = () => {
    const mutate = useAtomSet(atom, { mode: "promise" as const });
    return { mutate };
  };

  return { atom, useMutation };
};
```

### Task 4: Optional State Machine Utilities

Location: `packages/iam/client/src/_common/state-machine.ts`

If time permits, implement Ref-based state machine for multi-step flows:
- Email verification flow (send → verify → complete)
- Password reset flow (request → verify → reset)
- Two-factor setup (generate → verify → enable)

## Files to Read Before Implementation

| File | Purpose |
|------|---------|
| `specs/iam-effect-patterns/PLAN.md` | Complete implementation plan |
| `specs/iam-effect-patterns/outputs/pattern-proposals.md` | Full code implementations |
| `specs/iam-effect-patterns/REFLECTION_LOG.md` | Phase 7 learnings |
| `packages/iam/client/src/_common/handler.factory.ts` | Reference implementation to test |
| `packages/iam/client/src/_common/schema.helpers.ts` | Reference implementation to test |
| `packages/iam/client/src/core/atoms.ts` | Existing atom patterns for reference |
| `.claude/rules/effect-patterns.md` | Import and naming rules |

## Constraints

1. **Effect namespace imports**: `import * as Effect from "effect/Effect"`
2. **No native methods**: Use `A.map`, `R.keys`, `F.pipe`
3. **PascalCase Schema**: `S.Struct`, `S.String`
4. **Path aliases**: Use `@beep/*` in production code, relative paths in tests
5. **Test framework**: Use Vitest (`describe`, `it`, `expect`, `vi`)

## Success Verification

After implementation, run:

```bash
# Type checking
bun run check --filter @beep/iam-client

# Linting
bun run lint --filter @beep/iam-client

# Tests
bun run test --filter @beep/iam-client

# Build
bunx turbo run build --filter @beep/iam-client
```

## Phase 8 Checkpoint

Before marking Phase 8 complete, verify:

- [ ] Handler factory tests created and passing
- [ ] Schema helpers tests created and passing
- [ ] `atom.factory.ts` implemented
- [ ] (Optional) `state-machine.ts` implemented
- [ ] Type checking passes
- [ ] Linting passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] REFLECTION_LOG.md updated

## Post-Phase 8 Actions

1. Update README.md to mark Phase 8 complete
2. Consider spec complete - all patterns established
3. Future handlers can use factory pattern directly
4. Future atoms can use atom factory directly

## Agent Recommendation

Use `test-writer` agent for test files and `effect-code-writer` for atom.factory.ts implementation.

## Ready to Execute

All prerequisites satisfied. Phase 8 can proceed immediately.
