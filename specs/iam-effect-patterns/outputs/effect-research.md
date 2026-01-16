# Effect Best Practices Research

## Executive Summary

This Phase 2 research documents Effect ecosystem patterns directly applicable to resolving the inconsistencies identified in Phase 1. The research covers five key areas: Effect.fn/tracing conventions, Schema transformation patterns, Service composition patterns, error channel design, and state machine patterns.

**Key Findings:**
- Effect.fn provides automatic span creation with customizable naming - supports consistent `"domain/feature/handler"` convention
- Schema transforms support effectful validation via `transformOrFail` - enables proper error propagation for Business Auth error responses
- Effect.Service with `accessors: true` generates typed accessor methods - already used correctly in IAM services
- Data.TaggedError enables yieldable errors for clean generator flow - should replace current `IamError.fromUnknown` pattern
- Ref provides atomic state management suitable for multi-step auth flows; @effect/experimental Machine offers formal state machine abstraction

## Research Target 1: Effect.fn Best Practices

### Official Documentation Summary

From Effect documentation (documentId 6177):

> `Effect.fn` is like `Effect.gen` but with additional tracing and stack trace capabilities. It takes a name (for traces) and a generator function.

**Key characteristics:**
- Automatically creates a span with the provided name for tracing
- Generator function works identically to `Effect.gen`
- Name string appears in telemetry/OTLP traces
- Supports typed parameters via function signature

### Naming Convention Research

From tracing documentation (documentId 10911):

> When a function annotated with a span is called, it doesn't immediately run. Instead, it returns an Effect that, when executed, will generate a span representing that function's execution.

**Span naming principles:**
1. Names should be descriptive and hierarchical
2. Names appear in observability tools (Grafana, etc.)
3. Convention should be consistent across codebase
4. Avoid special characters that may conflict with trace aggregation

### Applicable to IAM

**Current state (Phase 1 findings):**
| Handler | Current Name | Issue |
|---------|--------------|-------|
| sign-out | `"core/sign-out/handler"` | Slashes - acceptable |
| get-session | `"core/get-session"` | Missing `/handler` suffix |
| sign-in-email | `"sign-in/email/handler"` | Consistent |
| sign-up-email | `"signUp.email.handler"` | Uses dots - inconsistent |

**Recommended convention:**
```typescript
// Pattern: "{domain}/{feature}/handler"
"core/sign-out/handler"
"core/get-session/handler"
"sign-in/email/handler"
"sign-up/email/handler"  // Note: kebab-case, not camelCase
```

**Rationale:**
- Slashes create natural hierarchy in trace visualization
- `/handler` suffix distinguishes from other Effect.fn usages
- Kebab-case is URL-friendly and consistent with directory names
- Matches file path structure for easy navigation

**Factory implementation opportunity:**
```typescript
type HandlerConfig = {
  domain: string;  // "core", "sign-in", "sign-up"
  feature: string; // "sign-out", "email", "phone-number"
};

const createHandlerName = (config: HandlerConfig): string =>
  `${config.domain}/${config.feature}/handler`;
```

## Research Target 2: Schema Transformation Patterns

### Official Documentation Summary

From Schema documentation (documentId 10950):

> `transform` creates a schema that converts from one type to another via synchronous transformation functions. `transformOrFail` enables effectful transformations that can fail.

**Two transform variants:**

1. **transform** - Pure synchronous transformation
```typescript
const schema = S.transform(
  S.String,
  S.Number,
  { decode: (s) => parseInt(s), encode: (n) => String(n) }
);
```

2. **transformOrFail** - Effectful transformation with failure channel
```typescript
const schema = S.transformOrFail(
  S.String,
  S.Number,
  {
    decode: (s, options, ast) => {
      const n = parseInt(s);
      return isNaN(n)
        ? ParseResult.fail(new ParseResult.Type(ast, s, "Not a number"))
        : ParseResult.succeed(n);
    },
    encode: (n) => ParseResult.succeed(String(n)),
  }
);
```

### Better Auth Response Handling

**Key insight:** Better Auth returns `{ data: T | null, error: BetterAuthError | null }`. This dual-channel response pattern requires careful handling.

**Current problem (Phase 1):**
- Most handlers decode `response.data` without checking `response.error`
- If `response.error` is present, `response.data` may be null causing decode failure
- The decode failure masks the actual Better Auth error

**Recommended pattern with transformOrFail:**
```typescript
// Contract definition with embedded error handling
export class BetterAuthResponse<T> extends S.Class<BetterAuthResponse<T>>(...)(
  { data: S.NullOr(DataSchema), error: S.NullOr(BetterAuthError) }
) {}

export const Success = BetterAuthResponse.transformOrFail(
  SuccessData,
  {
    decode: (response, _, ast) =>
      response.error !== null
        ? ParseResult.fail(new ParseResult.Type(ast, response, response.error.message))
        : response.data !== null
          ? ParseResult.succeed(response.data)
          : ParseResult.fail(new ParseResult.Type(ast, response, "No data")),
    encode: (data) => ParseResult.succeed({ data, error: null }),
  }
);
```

### Applicable to IAM

**Current sign-up-email contract pattern (correctly uses transformOrFail):**
```typescript
export class Payload extends PayloadFrom.transformOrFailFrom<Payload>($I`Payload`)(
  { name: S.String },
  {
    decode: (i, _, ast) => Effect.gen(function* () {
      if (i.password !== i.passwordConfirm) {
        return yield* Effect.fail(new ParseResult.Type(ast, i, "Passwords don't match"));
      }
      return yield* Effect.succeed({ name: `${i.firstName} ${i.lastName}`, ...i });
    }),
    // ...
  }
) {}
```

**Recommended: Create Better Auth response wrapper schema:**
```typescript
// Location: packages/iam/client/src/_common/response.schemas.ts

import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";

export const BetterAuthSuccessFrom = <A, I, R>(
  dataSchema: S.Schema<A, I, R>
) => S.transformOrFail(
  S.Struct({ data: S.NullOr(dataSchema), error: S.Unknown }),
  dataSchema,
  {
    decode: (response, _, ast) => {
      if (response.error !== null) {
        // Surface Better Auth error properly
        const errorMessage = typeof response.error === "object" && response.error !== null
          ? (response.error as { message?: string }).message ?? "Unknown error"
          : "API error";
        return ParseResult.fail(new ParseResult.Type(ast, response, errorMessage));
      }
      if (response.data === null) {
        return ParseResult.fail(new ParseResult.Type(ast, response, "No data returned"));
      }
      return ParseResult.succeed(response.data);
    },
    encode: (data) => ParseResult.succeed({ data, error: null }),
  }
);
```

**Benefits:**
- Error checking happens at schema level, not handler level
- Consistent error handling across all handlers
- Better Auth errors are properly surfaced
- Type safety preserved

## Research Target 3: Service Composition Patterns

### Official Documentation Summary

From Effect.Service documentation (documentId 6176):

> `Effect.Service` simplifies service definition by auto-generating a Context.Tag and default implementation. The `accessors: true` option generates typed accessor methods.

**Standard service pattern:**
```typescript
class MyService extends Effect.Service<MyService>()("MyService", {
  accessors: true,
  effect: Effect.gen(function* () {
    return {
      method1: (arg: string) => Effect.succeed(`Hello, ${arg}`),
      method2: Effect.succeed(42),
    };
  }),
}) {}

// Generated accessors:
MyService.method1("world"); // Effect<string, never, MyService>
MyService.method2;          // Effect<number, never, MyService>
```

### Layer Composition

From Managing Layers documentation (documentId 10923):

> Layers describe how to construct services. They can be composed using `Layer.merge`, `Layer.provide`, and `Layer.provideMerge`.

**Composition patterns:**
```typescript
// Merge independent layers
const AppLayer = Layer.mergeAll(
  ServiceA.Default,
  ServiceB.Default,
  ServiceC.Default,
);

// Provide dependency to another layer
const ComposedLayer = ServiceB.Default.pipe(
  Layer.provide(ServiceA.Default)  // ServiceB depends on ServiceA
);
```

### Applicable to IAM

**Current IAM service pattern (from Phase 1):**
```typescript
// packages/iam/client/src/core/service.ts
export class CoreService extends Effect.Service<CoreService>()($I`CoreService`, {
  accessors: true,
  effect: Effect.succeed({
    signOut: SignOut.Handler,
    getSession: GetSession.Handler,
  }),
}) {}
```

**Assessment:** This pattern is correct and follows Effect best practices.

**Enhancement opportunity - Service with dependencies:**
```typescript
// If handlers need shared dependencies (e.g., session signal notifier)
export class CoreService extends Effect.Service<CoreService>()($I`CoreService`, {
  accessors: true,
  dependencies: [SessionNotifier.Default],  // Explicit dependency
  effect: Effect.gen(function* () {
    const notifier = yield* SessionNotifier;
    return {
      signOut: SignOut.createHandler(notifier),
      getSession: GetSession.Handler,
    };
  }),
}) {}
```

**Runtime composition pattern (from @beep/runtime-client):**
```typescript
// Current pattern - correct
export const coreRuntime = makeAtomRuntime(() => CoreService.Default);

// With multiple layers
export const coreRuntime = makeAtomRuntime(() =>
  Layer.mergeAll(
    CoreService.Default,
    SessionNotifier.Default,  // Shared dependency
  )
);
```

## Research Target 4: Error Channel Design

### Official Documentation Summary

From Yieldable Errors documentation (documentId 10893):

> `Data.TaggedError` creates error classes that can be yielded directly in Effect.gen, enabling cleaner error handling flow.

**TaggedError pattern:**
```typescript
import { Data, Effect } from "effect";

class MyError extends Data.TaggedError("MyError")<{
  message: string;
  code: number;
}> {}

const program = Effect.gen(function* () {
  // Can yield error directly - clean syntax
  if (someCondition) {
    yield* new MyError({ message: "Failed", code: 500 });
  }
  return "success";
});
```

**Key benefits:**
- Errors appear in Effect's error channel (type `E`)
- Can be yielded in generators without `Effect.fail` wrapper
- Supports `_tag` discrimination for pattern matching
- Integrates with `Effect.catchTag` for selective recovery

### Error Hierarchies

```typescript
// Base error
class IamError extends Data.TaggedError("IamError")<{
  message: string;
  cause?: unknown;
}> {}

// Specific errors
class AuthenticationError extends Data.TaggedError("AuthenticationError")<{
  message: string;
  code: "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED" | "SESSION_EXPIRED";
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
  field: string;
}> {}

// Selective recovery
const program = myEffect.pipe(
  Effect.catchTag("ValidationError", (e) =>
    Effect.succeed(`Validation failed on field: ${e.field}`)
  )
);
```

### Applicable to IAM

**Current error handling (Phase 1):**
```typescript
// packages/iam/client/src/_common/errors.ts
export class IamError extends S.TaggedError<IamError>()($I`IamError`, {
  message: S.String,
}) {
  static fromUnknown = (cause: unknown) =>
    new IamError({ message: cause instanceof Error ? cause.message : "Unknown error" });
}
```

**Issues identified:**
1. `IamError.fromUnknown` loses error context (no cause preservation)
2. No error discrimination for different failure modes
3. Better Auth errors not properly surfaced

**Recommended enhancement:**
```typescript
// packages/iam/client/src/_common/errors.ts
import { Data } from "effect";

// Base error with cause preservation
export class IamError extends Data.TaggedError("IamError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {
  static fromUnknown = (cause: unknown): IamError =>
    new IamError({
      message: cause instanceof Error ? cause.message : "Unknown IAM error",
      cause,
    });
}

// Better Auth specific error
export class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}> {}

// Session-specific errors
export class SessionExpiredError extends Data.TaggedError("SessionExpiredError")<{
  readonly message: string;
}> {}

export class SessionNotFoundError extends Data.TaggedError("SessionNotFoundError")<{
  readonly message: string;
}> {}
```

**Handler usage:**
```typescript
export const Handler = Effect.fn("sign-in/email/handler")(function* (params) {
  const response = yield* Effect.tryPromise({
    try: () => client.signIn.email(params),
    catch: IamError.fromUnknown,
  });

  // Check Better Auth error - now yieldable
  if (response.error !== null) {
    yield* new BetterAuthError({
      message: response.error.message ?? "Authentication failed",
      code: response.error.code,
      status: response.error.status,
    });
  }

  // Notify session change
  client.$store.notify("$sessionSignal");

  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

## Research Target 5: State Machine Patterns

### Official Documentation Summary

Effect provides two approaches for state management:

#### 1. Ref - Atomic State References

From Ref documentation (documentId 10956):

> `Ref` represents a mutable reference for safe, controlled state updates. It supports concurrent access across fibers.

**Basic pattern:**
```typescript
import { Effect, Ref } from "effect";

const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0);
  yield* Ref.update(counter, (n) => n + 1);
  const value = yield* Ref.get(counter);
  return value;
});
```

**Ref as Service pattern:**
```typescript
class MyState extends Context.Tag("MyState")<MyState, Ref.Ref<number>>() {}

const withState = <A, E, R>(effect: Effect.Effect<A, E, R | MyState>) =>
  effect.pipe(Effect.provideServiceEffect(MyState, Ref.make(0)));
```

#### 2. Machine - Formal State Machines (@effect/experimental)

From Machine documentation (documentId 1693):

> `Machine.make` creates formal state machines with typed states, procedures, and transitions.

```typescript
import { Machine, Procedure } from "@effect/experimental";

const machine = Machine.make(
  Effect.gen(function* () {
    return Machine.procedures.make([
      Procedure.make("increment", Effect.gen(function* () {
        // State transition logic
      })),
    ]);
  })
);
```

### Applicable to IAM

**Multi-step flows requiring state management:**

1. **Email verification flow**
   - States: `Initial` → `CodeSent` → `Verified` | `Failed`
   - Side effects: Send email, validate code, update session

2. **Two-factor authentication**
   - States: `PasswordVerified` → `AwaitingCode` → `Authenticated` | `Failed`
   - Side effects: Generate code, verify code, establish session

3. **Password reset flow**
   - States: `Initial` → `EmailSent` → `TokenValidated` → `PasswordUpdated`
   - Side effects: Send email, validate token, update password, invalidate sessions

**Recommended pattern for IAM - Ref-based state machine:**
```typescript
// packages/iam/client/src/_common/state-machine.ts
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import * as Context from "effect/Context";

// State definition
type VerificationState =
  | { _tag: "Initial" }
  | { _tag: "CodeSent"; email: string; expiresAt: Date }
  | { _tag: "Verified"; email: string }
  | { _tag: "Failed"; reason: string };

// State service
class VerificationStateRef extends Context.Tag("VerificationStateRef")<
  VerificationStateRef,
  Ref.Ref<VerificationState>
>() {}

// Transition helpers
const transition = <A>(
  expectedTag: VerificationState["_tag"],
  handler: (state: VerificationState) => Effect.Effect<A, Error, VerificationStateRef>
) => Effect.gen(function* () {
  const ref = yield* VerificationStateRef;
  const current = yield* Ref.get(ref);
  if (current._tag !== expectedTag) {
    return yield* Effect.fail(new Error(`Invalid state: expected ${expectedTag}, got ${current._tag}`));
  }
  return yield* handler(current);
});

// Usage
const sendCode = (email: string) => transition("Initial", function* (state) {
  // Send verification email
  const response = yield* sendVerificationEmail(email);

  // Update state
  const ref = yield* VerificationStateRef;
  yield* Ref.set(ref, {
    _tag: "CodeSent",
    email,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  return response;
});
```

**Integration with effect-atom:**
```typescript
// packages/iam/ui/src/verification/verification.atoms.ts
import { Atom } from "@effect-atom/atom-react";
import * as Ref from "effect/Ref";
import * as Effect from "effect/Effect";

// State atom using Ref
const verificationStateAtom = Atom.effect(
  Effect.gen(function* () {
    return yield* Ref.make<VerificationState>({ _tag: "Initial" });
  })
);

// Derived atom for current state
const currentStateAtom = Atom.derived((get) => {
  const ref = get(verificationStateAtom);
  return Ref.get(ref);
});

// Action atoms for transitions
const sendCodeAtom = runtime.fn((email: string) =>
  Effect.gen(function* () {
    const ref = yield* verificationStateAtom;
    // ... transition logic
  })
);
```

## Pattern Synthesis: Handler Factory Design

Based on all research, here's the recommended handler factory design:

```typescript
// packages/iam/client/src/_common/handler.factory.ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { client } from "../adapters/better-auth/client.ts";
import { IamError, BetterAuthError } from "./errors.ts";

type HandlerConfig<Payload, Success, Encoded> = {
  /** Domain/feature name for tracing */
  domain: string;
  feature: string;

  /** Better Auth client method to call */
  execute: (payload: Encoded) => Promise<{ data: unknown; error: unknown }>;

  /** Schema for successful response */
  successSchema: S.Schema<Success, unknown>;

  /** Optional payload schema for encoding */
  payloadSchema?: S.Schema<Payload, Encoded>;

  /** Whether this handler mutates session state */
  mutatesSession?: boolean;
};

export const createHandler = <Payload, Success, Encoded>(
  config: HandlerConfig<Payload, Success, Encoded>
) => {
  const name = `${config.domain}/${config.feature}/handler`;

  return Effect.fn(name)(function* (
    params: config["payloadSchema"] extends undefined
      ? { fetchOptions?: unknown }
      : { payload: Payload; fetchOptions?: unknown }
  ) {
    // 1. Encode payload if schema provided
    const encoded = config.payloadSchema && "payload" in params
      ? yield* S.encode(config.payloadSchema)(params.payload)
      : undefined;

    // 2. Execute Better Auth call
    const response = yield* Effect.tryPromise({
      try: () => config.execute(encoded as Encoded),
      catch: IamError.fromUnknown,
    });

    // 3. Check Better Auth error (CRITICAL: missing in most handlers)
    if (response.error !== null) {
      const err = response.error as { message?: string; code?: string };
      yield* new BetterAuthError({
        message: err.message ?? "API error",
        code: err.code,
      });
    }

    // 4. Notify session signal if mutation
    if (config.mutatesSession) {
      client.$store.notify("$sessionSignal");
    }

    // 5. Decode and return success
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};
```

**Usage example:**
```typescript
// packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-in-email.contract.ts";
import { client } from "../../adapters/better-auth/client.ts";

export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (payload) => client.signIn.email(payload),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

**Reduction metrics:**
- Current handler: ~15-20 lines
- Factory-based handler: ~8 lines
- Reduction: **50-60%** boilerplate eliminated
- Consistency: 100% - all handlers follow same pattern

## Recommendations for Phase 3

### Priority 1: Core Infrastructure

1. **Handler factory** (`handler.factory.ts`)
   - Implement `createHandler` as designed above
   - Add name validation (enforce kebab-case, slash separators)
   - Add TypeScript overloads for with/without payload

2. **Error hierarchy** (`errors.ts`)
   - Migrate to `Data.TaggedError` base
   - Add `BetterAuthError`, `SessionExpiredError`
   - Preserve cause in `fromUnknown`

3. **Response schema** (`response.schemas.ts`)
   - Add `BetterAuthSuccessFrom` transform
   - Handle error/data dual-channel consistently

### Priority 2: State Management

1. **Session notifier service**
   - Extract `$sessionSignal` notification to service
   - Make injectable via Layer
   - Enable testing without side effects

2. **State machine utilities** (`state-machine.ts`)
   - Ref-based state management for multi-step flows
   - Transition helpers with state validation
   - Integration pattern with effect-atom

### Priority 3: Atom Integration

1. **Atom factory** (`atom.factory.ts`)
   - Standardized toast integration
   - Hook generation pattern
   - Optional session refresh binding

## Appendix: Documentation References

| Topic | Document ID | Title |
|-------|-------------|-------|
| Effect.fn | 6177 | Effect.fn |
| Tracing | 10911 | Tracing |
| Schema Transforms | 10950 | Transformations |
| Layer Management | 10923 | Managing Layers |
| Effect.Service | 6176 | Effect.Service |
| TaggedError | 10893 | Yieldable Errors |
| Ref | 10956 | state management - Ref |
| Machine | 1693 | Machine.make |
| Using Generators | 10904 | Using Generators |
