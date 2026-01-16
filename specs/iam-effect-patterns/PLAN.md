# Implementation Plan

## Overview

This plan details the Phase 6 implementation of canonical Effect patterns for the IAM client package. All patterns have been validated in Phase 4 and are ready for implementation.

**Goal**: Reduce handler boilerplate by 50%+ while fixing critical session signal bugs.

---

## Phase 6 Implementation Order

### Step 1: Foundation Files (Dependency Order)

Files must be created in this exact order due to dependencies:

| Order | File | Dependencies | Est. Lines | Patterns |
|-------|------|--------------|------------|----------|
| 1.1 | `errors.ts` (enhance) | None | +45 lines | Data.TaggedError variants |
| 1.2 | `schema.helpers.ts` | errors.ts | ~50 lines | BetterAuthSuccessFrom |
| 1.3 | `handler.factory.ts` | errors.ts, schema.helpers.ts | ~100 lines | createHandler |
| 1.4 | `atom.factory.ts` | None (independent) | ~80 lines | createMutationAtom |
| 1.5 | `state-machine.ts` | None (independent) | ~150 lines | createStateMachine |

**Total new code**: ~425 lines (excluding tests)

#### 1.1 Enhance `errors.ts`

**Current state**: 47 lines with 3 Schema-based error classes.

**Action**: ADD Data.TaggedError variants (no modifications to existing code).

**New exports to add**:
```typescript
// Add after existing exports (line 46)
export class BetterAuthResponseError extends Data.TaggedError("BetterAuthResponseError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}> {}

export class SessionExpiredError extends Data.TaggedError("SessionExpiredError")<{
  readonly message: string;
}> {}

export class InvalidCredentialsError extends Data.TaggedError("InvalidCredentialsError")<{
  readonly message: string;
}> {}

export class RateLimitedError extends Data.TaggedError("RateLimitedError")<{
  readonly message: string;
  readonly retryAfter?: number;
}> {}

export class EmailVerificationRequiredError extends Data.TaggedError("EmailVerificationRequiredError")<{
  readonly message: string;
  readonly email: string;
}> {}

export type HandlerError =
  | IamError
  | UnknownIamError
  | BetterAuthResponseError
  | SessionExpiredError
  | InvalidCredentialsError
  | RateLimitedError
  | EmailVerificationRequiredError;
```

**Required imports to add**:
```typescript
import * as Data from "effect/Data";
```

#### 1.2 Create `schema.helpers.ts`

**Location**: `packages/iam/client/src/_common/schema.helpers.ts`

**Contents**:
- `BetterAuthSuccessFrom` schema transform for `{ data, error }` responses
- Re-export `withFormAnnotations` from `common.annotations.ts`

**Estimated lines**: ~50

#### 1.3 Create `handler.factory.ts`

**Location**: `packages/iam/client/src/_common/handler.factory.ts`

**Contents**:
- `createHandler` function with TypeScript overloads
- Overload 1: With payload schema
- Overload 2: Without payload schema
- Automatic Effect.fn span naming: `"{domain}/{feature}/handler"`
- Automatic `response.error` checking
- Automatic `$sessionSignal` notification when `mutatesSession: true`

**Estimated lines**: ~100

#### 1.4 Create `atom.factory.ts`

**Location**: `packages/iam/client/src/_common/atom.factory.ts`

**Contents**:
- `createMutationAtom` function integrating `runtime.fn()`, `F.flow()`, `withToast`
- `createQueryAtom` for read-only data fetching (optional, lower priority)
- Returns `{ atom, useMutation }` tuple

**Estimated lines**: ~80

#### 1.5 Create `state-machine.ts`

**Location**: `packages/iam/client/src/_common/state-machine.ts`

**Contents**:
- `createStateMachine` using Effect Ref
- `InvalidTransitionError` tagged error
- Transition validation before execution
- React integration hook pattern examples

**Estimated lines**: ~150

---

### Step 2: Reference Implementations

#### Migration Order

| Order | Handler | Complexity | Key Characteristics |
|-------|---------|------------|---------------------|
| 2.1 | `core/sign-out` | Simple | No payload, session mutation, missing $sessionSignal |
| 2.2 | `sign-in/email` | Complex | Has payload, session mutation, has $sessionSignal (incorrect logic) |

#### 2.1 Migrate `core/sign-out`

**Current file**: `packages/iam/client/src/core/sign-out/sign-out.handler.ts`

**Current state** (24 lines):
```typescript
import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./sign-out.contract.ts";

export const Handler = Effect.fn("core/sign-out/handler")(function* (
  payload?: undefined | {
    readonly fetchOptions?: undefined | Common.ClientFetchOption;
  }
) {
  const response = yield* Effect.tryPromise({
    try: () => client.signOut({ fetchOptions: payload?.fetchOptions }),
    catch: Common.IamError.fromUnknown,
  });
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

**Issues**:
1. Missing `$sessionSignal` notification (CRITICAL BUG)
2. No `response.error` check

**Target state** (7 lines):
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-out.contract.ts";

export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

**Benefits**:
- Fixes missing `$sessionSignal` notification
- Adds `response.error` checking
- Reduces from 24 lines to 7 lines (71% reduction)

#### 2.2 Migrate `sign-in/email`

**Current file**: `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts`

**Current state** (31 lines):
```typescript
import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./sign-in-email.contract.ts";

export const Handler = Effect.fn("sign-in/email/handler")(function* ({
  payload,
  fetchOptions,
}: {
  payload: Contract.Payload;
  fetchOptions: Common.ClientFetchOption;
}) {
  const payloadEncoded = yield* S.encode(Contract.Payload)(payload);
  const response = yield* Effect.tryPromise({
    try: () => client.signIn.email({ ...payloadEncoded, fetchOptions }),
    catch: Common.IamError.fromUnknown,
  });
  if (P.isNullable(response.error)) {
    client.$store.notify("$sessionSignal");
  }
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

**Issues**:
1. `P.isNullable(response.error)` is INVERTED logic (notifies when error IS null, which is correct, but checks error for signal instead of failing)
2. Doesn't fail Effect when `response.error` is present
3. Verbose boilerplate

**Target state** (8 lines):
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-in-email.contract.ts";

export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

**Benefits**:
- Properly fails Effect when `response.error` present
- Consistent session signal notification
- Reduces from 31 lines to 8 lines (74% reduction)

#### Coexistence Strategy

During migration:

1. **Additive approach**: Create factory files without modifying existing handlers
2. **Parallel handlers**: Old and new handlers can coexist during validation
3. **Gradual replacement**: Replace one handler at a time, validate after each
4. **Deprecation timeline**: Mark old patterns deprecated after all handlers migrate

---

### Step 3: Testing Strategy

#### Test Files to Create

| Order | Test File | Test Focus | Est. Lines |
|-------|-----------|------------|------------|
| 3.1 | `handler.factory.test.ts` | Factory function, error handling, session signal | ~150 |
| 3.2 | `schema.helpers.test.ts` | BetterAuthSuccessFrom transform, error extraction | ~80 |
| 3.3 | `atom.factory.test.ts` | Atom creation, toast integration | ~100 |
| 3.4 | `state-machine.test.ts` | State transitions, guards, invalid transitions | ~120 |

**Total test code**: ~450 lines

#### Test Location

All test files go in: `packages/iam/client/src/_common/__tests__/`

#### 3.1 Handler Factory Tests

**File**: `packages/iam/client/src/_common/__tests__/handler.factory.test.ts`

**Test scenarios**:
```typescript
describe("createHandler", () => {
  describe("with payload", () => {
    it("encodes payload before executing");
    it("fails Effect when response.error is present");
    it("decodes success data on successful response");
    it("notifies $sessionSignal when mutatesSession is true");
    it("does not notify $sessionSignal when mutatesSession is false");
    it("generates correct span name");
  });

  describe("without payload", () => {
    it("executes without encoding");
    it("accepts optional fetchOptions");
    it("fails Effect when response.error is present");
  });

  describe("error handling", () => {
    it("wraps promise rejection in IamError");
    it("surfaces BetterAuthResponseError with message, code, status");
  });
});
```

#### 3.2 Schema Helpers Tests

**File**: `packages/iam/client/src/_common/__tests__/schema.helpers.test.ts`

**Test scenarios**:
```typescript
describe("BetterAuthSuccessFrom", () => {
  it("extracts data when error is null");
  it("fails with ParseError when error is present");
  it("extracts error message from error object");
  it("handles null data with error");
  it("handles unknown error shape");
});
```

#### 3.3 Atom Factory Tests

**File**: `packages/iam/client/src/_common/__tests__/atom.factory.test.ts`

**Test scenarios**:
```typescript
describe("createMutationAtom", () => {
  it("creates atom with toast wrapper");
  it("returns useMutation hook");
  it("formats success message from result");
  it("formats failure message from error");
});
```

#### 3.4 State Machine Tests

**File**: `packages/iam/client/src/_common/__tests__/state-machine.test.ts`

**Test scenarios**:
```typescript
describe("createStateMachine", () => {
  it("initializes with initial state");
  it("executes valid transition");
  it("fails InvalidTransitionError for wrong current state");
  it("fails InvalidTransitionError for unknown transition");
  it("updates state atomically via Ref");
  it("returns valid transitions for current state");
});
```

#### Mocking Strategy

**Better Auth Client Mock**:
```typescript
// Create mock factory for Better Auth client
export const createMockClient = (responses: Record<string, BetterAuthResponse>) => ({
  signIn: {
    email: vi.fn().mockImplementation((payload) =>
      Promise.resolve(responses.signInEmail ?? { data: null, error: null })
    ),
  },
  signOut: vi.fn().mockResolvedValue(responses.signOut ?? { data: {}, error: null }),
  $store: {
    notify: vi.fn(),
  },
});
```

**Runtime Mock** (for atom tests):
```typescript
// Mock runtime.fn for atom factory tests
const mockRuntime = {
  fn: vi.fn((handler) => {
    const atom = {};
    return atom;
  }),
};
```

---

### Step 4: Documentation Updates

#### AGENTS.md Files to Update

| File | Updates Required |
|------|------------------|
| `packages/iam/client/AGENTS.md` | Add factory pattern examples, update recipes |
| `packages/iam/ui/AGENTS.md` | Update atom creation examples |

#### 4.1 IAM Client AGENTS.md Updates

**Sections to add/modify**:

1. **Handler Factory Pattern** (new section):
```markdown
### Create a handler with the factory pattern

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "@beep/iam-client/_common";
import * as Contract from "./my-feature.contract.ts";

// With payload
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// Without payload
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```
```

2. **Gotchas** (add new entries):
```markdown
### Handler Factory Gotchas

- **`mutatesSession` flag**: MUST be `true` for sign-in, sign-out, sign-up, verify, passkey, social. This flag controls `$sessionSignal` notification.
- **`execute` function**: Receives encoded payload (not decoded). Do NOT call `S.encode` manually.
- **Error handling**: Factory automatically checks `response.error`. Do NOT add manual error checks.
```

3. **Quick Recipes** (update existing):
- Update "Wire a sign-out atom with toast feedback" to use new pattern
- Add "Create handler with factory" recipe

#### 4.2 IAM UI AGENTS.md Updates

**Sections to modify**:

1. **Atom creation** (update examples):
```markdown
### Create mutation atom with factory

```typescript
import { createMutationAtom } from "@beep/iam-client/_common";
import { signInRuntime, SignInService } from "@beep/iam-client/sign-in";

export const { atom: signInEmailAtom, useMutation: useSignInEmail } = createMutationAtom({
  runtime: signInRuntime,
  handler: SignInService.email,
  toast: {
    waiting: "Signing in...",
    success: "Signed in successfully",
    failure: (e) => e.message,
  },
});
```
```

---

## Rollback Plan

### File Classification

| File | Type | Rollback Method |
|------|------|-----------------|
| `errors.ts` | Modification (additive) | Git revert additions |
| `schema.helpers.ts` | New file | Delete file |
| `handler.factory.ts` | New file | Delete file |
| `atom.factory.ts` | New file | Delete file |
| `state-machine.ts` | New file | Delete file |
| `sign-out.handler.ts` | Modification | Git checkout original |
| `sign-in-email.handler.ts` | Modification | Git checkout original |

### Git Revert Strategy

**For new files** (safe to delete):
```bash
# Delete new factory files
rm packages/iam/client/src/_common/schema.helpers.ts
rm packages/iam/client/src/_common/handler.factory.ts
rm packages/iam/client/src/_common/atom.factory.ts
rm packages/iam/client/src/_common/state-machine.ts

# Delete test files
rm -rf packages/iam/client/src/_common/__tests__/
```

**For modified files** (revert to original):
```bash
# Revert errors.ts to original (keep existing, remove additions)
git checkout HEAD -- packages/iam/client/src/_common/errors.ts

# Revert handlers to original
git checkout HEAD -- packages/iam/client/src/core/sign-out/sign-out.handler.ts
git checkout HEAD -- packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
```

### Feature Flag Consideration

Not required for this implementation because:
1. New factory files are additive (don't break existing code)
2. Handler migrations are isolated to individual files
3. Rollback is straightforward file deletion/revert
4. No database changes or persistent state affected

If issues arise during migration, simply don't commit the problematic handler change and continue with others.

---

## Success Verification

### Verification Commands

Execute these commands in order after implementation:

```bash
# 1. Type checking for IAM client package
bun run check --filter @beep/iam-client

# 2. Linting for IAM client package
bun run lint --filter @beep/iam-client

# 3. Run tests for IAM client package
bun run test --filter @beep/iam-client

# 4. Build IAM client package
bun run build --filter @beep/iam-client

# 5. Type checking for IAM UI package (consumers)
bun run check --filter @beep/iam-ui

# 6. Full monorepo type check
bun run check

# 7. Full monorepo build
bun run build
```

### Success Criteria Checklist

| Metric | Target | Verification |
|--------|--------|--------------|
| Factory files created | 5/5 | `ls packages/iam/client/src/_common/*.ts` |
| Reference handlers migrated | 2/2 | Visual inspection |
| Type errors | 0 | `bun run check --filter @beep/iam-client` |
| Lint errors | 0 | `bun run lint --filter @beep/iam-client` |
| Test failures | 0 | `bun run test --filter @beep/iam-client` |
| Build success | Yes | `bun run build --filter @beep/iam-client` |
| Boilerplate reduction | ≥50% | Line count comparison |
| Session signal bugs fixed | 2/2 | Manual verification |

### Boilerplate Reduction Verification

| Handler | Before | After | Reduction |
|---------|--------|-------|-----------|
| `core/sign-out` | 24 lines | 7 lines | 71% |
| `sign-in/email` | 31 lines | 8 lines | 74% |
| **Average** | 27.5 lines | 7.5 lines | **72%** |

---

## Implementation Timeline

### Recommended Order

1. **Create errors.ts additions** (~10 min)
2. **Create schema.helpers.ts** (~15 min)
3. **Create handler.factory.ts** (~30 min)
4. **Verify with type check**: `bun run check --filter @beep/iam-client`
5. **Migrate sign-out handler** (~10 min)
6. **Migrate sign-in-email handler** (~10 min)
7. **Verify with type check and lint**
8. **Create test files** (~45 min)
9. **Run tests and fix issues**
10. **Create atom.factory.ts** (~20 min)
11. **Create state-machine.ts** (~30 min)
12. **Final verification**: Full check, lint, test, build

**Estimated total**: 60-90 minutes (excluding documentation)

---

## Notes for Implementer

### Critical Requirements

1. **Effect namespace imports**: `import * as Effect from "effect/Effect"`
2. **No native methods**: Use `A.map`, `R.keys`, `F.pipe` not `array.map`, `Object.keys`
3. **PascalCase Schema**: `S.Struct`, `S.String`, not `S.struct`, `S.string`
4. **Path aliases**: Use `@beep/*` not relative paths in examples

### Files to Reference During Implementation

| Reference | Location |
|-----------|----------|
| Approved patterns | `specs/iam-effect-patterns/outputs/pattern-proposals.md` |
| Validation results | `specs/iam-effect-patterns/outputs/pattern-review.md` |
| Effect patterns rules | `.claude/rules/effect-patterns.md` |
| Existing errors | `packages/iam/client/src/_common/errors.ts` |
| Example handler | `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` |

### Key Gotchas from Prior Phases

1. **Better Auth `{ data, error }`**: ALWAYS check `error` before decoding `data`
2. **Session signal timing**: Notify AFTER successful mutation, not before
3. **Form defaults match Encoded type**: `Redacted<string>` default is `string`, not `Redacted`
4. **Effect.fn name**: Use `"domain/feature/handler"` convention with slashes
