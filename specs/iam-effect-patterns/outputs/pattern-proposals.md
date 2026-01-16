# Pattern Proposals - IAM Effect Patterns

## Summary

This document proposes 5 canonical patterns for the IAM client package, designed to resolve all issues identified in Phase 1 and apply Effect best practices from Phase 2. Each pattern includes:
- Problem statement with Phase 1 references
- Complete TypeScript implementation
- Usage examples (before/after)
- Migration guide

**Estimated Impact:**
- Handler boilerplate reduced by **50-60%** (15-20 lines → 5-8 lines)
- Atom boilerplate reduced by **40%** (10 lines → 6 lines)
- 100% consistency in error handling, session signal notification, and naming conventions

---

## 1. Handler Factory

### Problem Statement

From Phase 1 analysis:
- **I1**: Effect.fn name format varies (`signUp.email.handler` uses dots vs `sign-in/email/handler` uses slashes)
- **I2/I3**: Session signal not notified after sign-out/sign-up (CRITICAL)
- **I4**: `response.error` not checked (3 of 4 handlers)
- **I7**: Parameter signature varies (optional vs required, payload vs params)
- **Boilerplate**: 70-80% of handler code is repeated structure

### API Design

```typescript
// Type definitions
import type * as S from "effect/Schema";

/**
 * Configuration for creating an IAM handler with standard patterns.
 */
export interface HandlerConfig<
  PayloadSchema extends S.Schema.All | undefined,
  SuccessSchema extends S.Schema.All,
> {
  /** Domain name for tracing (e.g., "sign-in", "core", "sign-up") */
  readonly domain: string;
  /** Feature name for tracing (e.g., "email", "sign-out", "passkey") */
  readonly feature: string;
  /** Function that executes the Better Auth client method */
  readonly execute: PayloadSchema extends S.Schema.All
    ? (encoded: S.Schema.Encoded<PayloadSchema>) => Promise<BetterAuthResponse>
    : () => Promise<BetterAuthResponse>;
  /** Schema for decoding successful response data */
  readonly successSchema: SuccessSchema;
  /** Optional schema for encoding payload before API call */
  readonly payloadSchema?: PayloadSchema;
  /** Whether this handler mutates session state (triggers $sessionSignal) */
  readonly mutatesSession?: boolean;
}

/**
 * Better Auth response shape with dual error channel
 */
export interface BetterAuthResponse {
  readonly data: unknown;
  readonly error: BetterAuthResponseError | null;
}

export interface BetterAuthResponseError {
  readonly message?: string;
  readonly code?: string;
  readonly status?: number;
}

/**
 * Handler input types based on whether payload schema is provided
 */
export type HandlerInput<PayloadSchema extends S.Schema.All | undefined> =
  PayloadSchema extends S.Schema.All
    ? {
        readonly payload: S.Schema.Type<PayloadSchema>;
        readonly fetchOptions?: ClientFetchOption;
      }
    : {
        readonly fetchOptions?: ClientFetchOption;
      } | undefined;
```

### Implementation

Location: `packages/iam/client/src/_common/handler.factory.ts`

```typescript
import { client } from "@beep/iam-client/adapters";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { ClientFetchOption } from "./common.schemas.ts";

// ============================================================================
// Error Types for Handler Factory
// ============================================================================

/**
 * Error thrown when Better Auth returns an error response.
 * Uses Data.TaggedError for yieldable errors in generators.
 */
export class BetterAuthResponseError extends Data.TaggedError("BetterAuthResponseError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}> {}

// ============================================================================
// Better Auth Response Type
// ============================================================================

interface BetterAuthResponse {
  readonly data: unknown;
  readonly error: {
    readonly message?: string;
    readonly code?: string;
    readonly status?: number;
  } | null;
}

// ============================================================================
// Handler Factory - Overloads
// ============================================================================

/**
 * Creates an Effect handler for Better Auth client methods.
 *
 * Features:
 * - Auto-generates Effect.fn span name: `"{domain}/{feature}/handler"`
 * - Checks `response.error` before decode (CRITICAL fix from Phase 1)
 * - Notifies `$sessionSignal` when `mutatesSession: true`
 * - Supports both payload and no-payload variants
 *
 * @example
 * ```ts
 * // With payload (sign-in, sign-up)
 * export const Handler = createHandler({
 *   domain: "sign-in",
 *   feature: "email",
 *   execute: (encoded) => client.signIn.email(encoded),
 *   successSchema: Contract.Success,
 *   payloadSchema: Contract.Payload,
 *   mutatesSession: true,
 * });
 *
 * // Without payload (sign-out)
 * export const Handler = createHandler({
 *   domain: "core",
 *   feature: "sign-out",
 *   execute: () => client.signOut(),
 *   successSchema: Contract.Success,
 *   mutatesSession: true,
 * });
 * ```
 */
// Overload 1: With payload schema
export function createHandler<
  PayloadSchema extends S.Schema.All,
  SuccessSchema extends S.Schema.All,
>(config: {
  readonly domain: string;
  readonly feature: string;
  readonly execute: (
    encoded: S.Schema.Encoded<PayloadSchema>
  ) => Promise<BetterAuthResponse>;
  readonly successSchema: SuccessSchema;
  readonly payloadSchema: PayloadSchema;
  readonly mutatesSession?: boolean;
}): Effect.Effect.Fn<
  (input: {
    readonly payload: S.Schema.Type<PayloadSchema>;
    readonly fetchOptions?: ClientFetchOption;
  }) => Effect.Effect<
    S.Schema.Type<SuccessSchema>,
    S.Schema.Context<PayloadSchema> | S.Schema.Context<SuccessSchema>,
    BetterAuthResponseError | IamError | UnknownIamError | S.ParseError
  >
>;

// Overload 2: Without payload schema
export function createHandler<SuccessSchema extends S.Schema.All>(config: {
  readonly domain: string;
  readonly feature: string;
  readonly execute: () => Promise<BetterAuthResponse>;
  readonly successSchema: SuccessSchema;
  readonly payloadSchema?: undefined;
  readonly mutatesSession?: boolean;
}): Effect.Effect.Fn<
  (input?: {
    readonly fetchOptions?: ClientFetchOption;
  }) => Effect.Effect<
    S.Schema.Type<SuccessSchema>,
    S.Schema.Context<SuccessSchema>,
    BetterAuthResponseError | IamError | UnknownIamError | S.ParseError
  >
>;

// ============================================================================
// Implementation
// ============================================================================

export function createHandler<
  PayloadSchema extends S.Schema.All | undefined,
  SuccessSchema extends S.Schema.All,
>(config: {
  readonly domain: string;
  readonly feature: string;
  readonly execute: PayloadSchema extends S.Schema.All
    ? (encoded: S.Schema.Encoded<PayloadSchema>) => Promise<BetterAuthResponse>
    : () => Promise<BetterAuthResponse>;
  readonly successSchema: SuccessSchema;
  readonly payloadSchema?: PayloadSchema;
  readonly mutatesSession?: boolean;
}) {
  // Generate consistent name: "domain/feature/handler"
  const spanName = `${config.domain}/${config.feature}/handler`;

  // Handler with payload
  if (config.payloadSchema !== undefined) {
    const payloadSchema = config.payloadSchema as S.Schema.All;
    const execute = config.execute as (encoded: unknown) => Promise<BetterAuthResponse>;

    return Effect.fn(spanName)(function* (input: {
      readonly payload: unknown;
      readonly fetchOptions?: ClientFetchOption;
    }) {
      // 1. Encode payload
      const encoded = yield* S.encode(payloadSchema)(input.payload);

      // 2. Execute Better Auth call
      const response = yield* Effect.tryPromise({
        try: () => execute({ ...encoded, fetchOptions: input.fetchOptions }),
        catch: IamError.fromUnknown,
      });

      // 3. Check Better Auth error (CRITICAL - missing in most handlers)
      if (response.error !== null) {
        yield* new BetterAuthResponseError({
          message: response.error.message ?? "Authentication failed",
          code: response.error.code,
          status: response.error.status,
        });
      }

      // 4. Notify session signal if mutation succeeded
      if (config.mutatesSession === true) {
        client.$store.notify("$sessionSignal");
      }

      // 5. Decode and return success
      return yield* S.decodeUnknown(config.successSchema)(response.data);
    });
  }

  // Handler without payload
  const execute = config.execute as () => Promise<BetterAuthResponse>;

  return Effect.fn(spanName)(function* (input?: {
    readonly fetchOptions?: ClientFetchOption;
  }) {
    // 1. Execute Better Auth call
    const response = yield* Effect.tryPromise({
      try: () => execute(),
      catch: IamError.fromUnknown,
    });

    // 2. Check Better Auth error
    if (response.error !== null) {
      yield* new BetterAuthResponseError({
        message: response.error.message ?? "Operation failed",
        code: response.error.code,
        status: response.error.status,
      });
    }

    // 3. Notify session signal if mutation succeeded
    if (config.mutatesSession === true) {
      client.$store.notify("$sessionSignal");
    }

    // 4. Decode and return success
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
}

// Re-export existing error types for consumers
import { IamError, UnknownIamError } from "./errors.ts";
export { IamError, UnknownIamError };
```

### Usage Examples

**Before (sign-in-email.handler.ts - 20 lines):**

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

**After (sign-in-email.handler.ts - 8 lines):**

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

**Before (sign-out.handler.ts - 15 lines):**

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

**After (sign-out.handler.ts - 7 lines):**

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-out.contract.ts";

export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true, // FIXES: Missing session signal notification
});
```

### Migration Guide

1. **Import the factory**: Replace individual Effect/Schema imports with factory import
2. **Convert config**: Map existing handler logic to factory config object
3. **Add `mutatesSession`**: Set `true` for sign-in, sign-out, sign-up, verify, passkey, social
4. **Remove manual error checking**: Factory handles `response.error` automatically
5. **Remove manual session signal**: Factory handles `$sessionSignal` automatically

**Migration checklist per handler:**
- [ ] Replace `Effect.fn("...")` with `createHandler({ domain, feature, ... })`
- [ ] Replace `Effect.tryPromise` with `execute` function
- [ ] Remove `S.encode` call (factory handles it when `payloadSchema` provided)
- [ ] Remove `if (response.error)` check (factory handles it)
- [ ] Remove `$store.notify("$sessionSignal")` (factory handles via `mutatesSession`)
- [ ] Remove `S.decodeUnknown` call (factory handles it)

---

## 2. Schema Helpers

### Problem Statement

From Phase 1 analysis:
- Better Auth returns `{ data, error }` dual-channel responses
- Most handlers decode `response.data` without checking `response.error`
- Error checking is inconsistent (only sign-in-email checks, and only for signal logic)
- Need consistent schema-level error handling

### API Design

```typescript
/**
 * Creates a schema that transforms Better Auth `{ data, error }` responses
 * into successful data or parse failure.
 *
 * This schema is used in contracts to handle Better Auth's dual-channel
 * response pattern at the schema level rather than handler level.
 */
export const BetterAuthSuccessFrom: <A, I, R>(
  dataSchema: S.Schema<A, I, R>
) => S.Schema<A, { data: I | null; error: unknown }, R>;
```

### Implementation

Location: `packages/iam/client/src/_common/schema.helpers.ts`

```typescript
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

// ============================================================================
// Better Auth Response Schema Helpers
// ============================================================================

/**
 * Schema for Better Auth error responses
 */
const BetterAuthErrorSchema = S.Struct({
  message: S.optional(S.String),
  code: S.optional(S.String),
  status: S.optional(S.Number),
});

/**
 * Creates a schema that transforms Better Auth `{ data, error }` responses.
 *
 * When `error` is present, the schema fails with a ParseError containing
 * the error message. When `error` is null and `data` is present, the data
 * is decoded using the provided schema.
 *
 * This enables error handling at the schema level, ensuring all handlers
 * consistently check for errors before processing data.
 *
 * @param dataSchema - Schema for decoding the successful data payload
 * @returns Schema that handles the dual-channel response pattern
 *
 * @example
 * ```ts
 * // In contract file
 * const RawUserSchema = S.Struct({ id: S.String, email: S.String });
 *
 * // Wrap with Better Auth response handling
 * export const SuccessFromResponse = BetterAuthSuccessFrom(RawUserSchema);
 *
 * // In handler
 * const user = yield* S.decodeUnknown(SuccessFromResponse)(response);
 * ```
 */
export const BetterAuthSuccessFrom = <A, I, R>(
  dataSchema: S.Schema<A, I, R>
): S.Schema<A, { readonly data: I | null; readonly error: unknown }, R> => {
  // Create the "from" schema representing Better Auth response shape
  const fromSchema = S.Struct({
    data: S.NullOr(dataSchema),
    error: S.Unknown,
  });

  return S.transformOrFail(fromSchema, dataSchema, {
    strict: true,
    decode: (response, options, ast) =>
      Effect.gen(function* () {
        // 1. Check for Better Auth error
        if (response.error !== null && response.error !== undefined) {
          const errorResult = S.decodeUnknownOption(BetterAuthErrorSchema)(response.error);
          const errorMessage = O.match(errorResult, {
            onNone: () => "Unknown API error",
            onSome: (err) => err.message ?? "API error",
          });
          return yield* ParseResult.fail(
            new ParseResult.Type(ast, response, errorMessage)
          );
        }

        // 2. Check for null data
        if (response.data === null) {
          return yield* ParseResult.fail(
            new ParseResult.Type(ast, response, "No data returned from API")
          );
        }

        // 3. Return the data (already decoded by fromSchema)
        return response.data;
      }),
    encode: (data) => ParseResult.succeed({ data, error: null }),
  });
};

// ============================================================================
// Re-export existing annotation helper
// ============================================================================

// The withFormAnnotations helper is already well-designed
// Re-export from common.annotations.ts for convenience
export { withFormAnnotations } from "./common.annotations.ts";
```

### Usage Examples

**In contract file (alternative approach to handler factory):**

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { BetterAuthSuccessFrom } from "../../_common/schema.helpers.ts";
import * as Common from "../../_common";

const $I = $IamClientId.create("sign-in/email");

// Raw success data schema (what Better Auth returns in `data` field)
const SuccessData = S.Struct({
  redirect: S.optionalWith(S.Boolean, { default: () => true }),
  token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
  url: Common.OptionFromNullishOptionalProperty(Common.URLString, null),
  user: Common.DomainUserFromBetterAuthUser,
});

// Export wrapped schema that handles Better Auth response pattern
export class Success extends S.Class<Success>($I`Success`)(
  SuccessData.fields,
  $I.annotations("Success", {
    description: "The success response for signing in with email.",
  })
) {}

// For handlers that want to decode full response (not just data)
export const SuccessFromResponse = BetterAuthSuccessFrom(Success);
```

**In handler (when not using handler factory):**

```typescript
// Before: Decoding without error check
return yield* S.decodeUnknown(Contract.Success)(response.data);

// After: Schema handles error checking
return yield* S.decodeUnknown(Contract.SuccessFromResponse)(response);
```

### Migration Guide

The `BetterAuthSuccessFrom` helper is optional when using the Handler Factory (Pattern 1), since the factory already handles error checking. Use this helper when:

1. Building contracts that need to expose full response decoding
2. Working with handlers that don't use the factory pattern
3. Testing schema transformations independently

---

## 3. Error Hierarchy

### Problem Statement

From Phase 1 analysis:
- Current `IamError.fromUnknown` loses error context
- No error discrimination for different failure modes
- Better Auth errors not properly surfaced to UI
- Errors cannot be yielded directly in generators without `Effect.fail` wrapper

### API Design

```typescript
/**
 * Base IAM error with cause preservation.
 * Extends Data.TaggedError for yieldable errors in generators.
 */
export class IamError extends Data.TaggedError("IamError")<{
  readonly message: string;
  readonly cause?: unknown;
}>;

/**
 * Error from Better Auth API response.
 * Represents the `error` field in Better Auth `{ data, error }` responses.
 */
export class BetterAuthResponseError extends Data.TaggedError("BetterAuthResponseError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}>;

/**
 * Session has expired or is invalid.
 */
export class SessionExpiredError extends Data.TaggedError("SessionExpiredError")<{
  readonly message: string;
}>;

/**
 * User credentials are invalid.
 */
export class InvalidCredentialsError extends Data.TaggedError("InvalidCredentialsError")<{
  readonly message: string;
}>;
```

### Implementation

Location: `packages/iam/client/src/_common/errors.ts`

```typescript
import { $IamClientId } from "@beep/identity/packages";
import { BetterAuthError as _BetterAuthError } from "@better-auth/core/error";
import * as Data from "effect/Data";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_common/errors");

// ============================================================================
// Schema-Based Errors (for validation and serialization)
// ============================================================================

/**
 * Schema wrapper for Better Auth's internal error class.
 * Used for schema-based validation of Better Auth errors.
 */
export class BetterAuthError extends S.instanceOf(_BetterAuthError).annotations(
  $I.annotations("BetterAuthError", {
    description: "An error from the BetterAuth library",
  })
) {}

export declare namespace BetterAuthError {
  export type Type = typeof BetterAuthError.Type;
}

/**
 * Schema-based unknown IAM error.
 * Used when the error source cannot be determined.
 */
export class UnknownIamError extends S.TaggedError<UnknownIamError>($I`UnknownIamError`)(
  "UnknownIamError",
  {
    cause: S.Defect,
  }
) {
  override get message() {
    return "An unknown error occurred";
  }
}

/**
 * Schema-based IAM error with Better Auth cause.
 * Preserves the original Better Auth error for debugging.
 */
export class IamError extends S.TaggedError<IamError>($I`IamError`)(
  "IamError",
  {
    cause: BetterAuthError,
    message: S.String,
  },
  $I.annotations("IamError", {
    description: "An error from the IAM client",
  })
) {
  /**
   * Converts an unknown error to a typed IAM error.
   * Preserves Better Auth errors for proper error reporting.
   */
  static readonly fromUnknown = (error: unknown): IamError | UnknownIamError => {
    if (S.is(BetterAuthError)(error)) {
      return new IamError({
        cause: error,
        message: error.message,
      });
    }
    return new UnknownIamError({
      cause: error,
    });
  };
}

// ============================================================================
// Data.TaggedError-Based Errors (for yieldable errors in generators)
// ============================================================================

/**
 * Error thrown when Better Auth returns an error in its response.
 *
 * This error type uses Data.TaggedError which allows it to be
 * yielded directly in Effect generators without Effect.fail().
 *
 * @example
 * ```ts
 * // Can be yielded directly in generators
 * if (response.error !== null) {
 *   yield* new BetterAuthResponseError({
 *     message: response.error.message ?? "API error",
 *     code: response.error.code,
 *   });
 * }
 *
 * // Selective recovery with catchTag
 * effect.pipe(
 *   Effect.catchTag("BetterAuthResponseError", (e) =>
 *     Effect.succeed(handleApiError(e))
 *   )
 * );
 * ```
 */
export class BetterAuthResponseError extends Data.TaggedError("BetterAuthResponseError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}> {}

/**
 * Error indicating the user's session has expired or is invalid.
 * Typically triggers a redirect to the sign-in page.
 */
export class SessionExpiredError extends Data.TaggedError("SessionExpiredError")<{
  readonly message: string;
}> {}

/**
 * Error indicating invalid user credentials.
 * Used for sign-in failures due to wrong email/password.
 */
export class InvalidCredentialsError extends Data.TaggedError("InvalidCredentialsError")<{
  readonly message: string;
}> {}

/**
 * Error indicating rate limiting from the auth server.
 * UI should display appropriate retry messaging.
 */
export class RateLimitedError extends Data.TaggedError("RateLimitedError")<{
  readonly message: string;
  readonly retryAfter?: number;
}> {}

/**
 * Error indicating email verification is required.
 */
export class EmailVerificationRequiredError extends Data.TaggedError("EmailVerificationRequiredError")<{
  readonly message: string;
  readonly email: string;
}> {}

// ============================================================================
// Error Type Union for Handler Signatures
// ============================================================================

/**
 * Union of all possible handler errors.
 * Use in Effect signatures for comprehensive error handling.
 */
export type HandlerError =
  | IamError
  | UnknownIamError
  | BetterAuthResponseError
  | SessionExpiredError
  | InvalidCredentialsError
  | RateLimitedError
  | EmailVerificationRequiredError;
```

### Usage Examples

**Yieldable errors in generators:**

```typescript
// Before: Required Effect.fail wrapper
if (response.error !== null) {
  return yield* Effect.fail(new IamError({
    cause: response.error,
    message: response.error.message,
  }));
}

// After: Direct yield with Data.TaggedError
if (response.error !== null) {
  yield* new BetterAuthResponseError({
    message: response.error.message ?? "API error",
    code: response.error.code,
    status: response.error.status,
  });
}
```

**Selective error recovery:**

```typescript
import * as Effect from "effect/Effect";
import { InvalidCredentialsError, RateLimitedError } from "@beep/iam-client/_common";

const signInWithRecovery = signInHandler.pipe(
  Effect.catchTag("InvalidCredentialsError", (e) =>
    Effect.succeed({ error: "Invalid email or password" })
  ),
  Effect.catchTag("RateLimitedError", (e) =>
    Effect.succeed({ error: `Too many attempts. Try again in ${e.retryAfter} seconds.` })
  )
);
```

### Migration Guide

1. **Keep existing IamError/UnknownIamError**: These remain for backward compatibility
2. **Add Data.TaggedError variants**: Use these for handler-level errors that need yielding
3. **Update handler signatures**: Include new error types in Effect error channel
4. **Use catchTag for recovery**: Replace generic error handling with tag-based recovery

---

## 4. Atom Factory

### Problem Statement

From Phase 1 analysis:
- Atom definitions follow repetitive pattern (~10 lines each)
- Toast integration is manually added to each atom
- Hook generation follows same pattern across atoms
- `runtime.fn()` with `F.flow()` boilerplate repeated

### API Design

```typescript
import type { WritableAtom } from "@effect-atom/atom-react";

/**
 * Configuration for creating a mutation atom with toast integration.
 */
export interface MutationAtomConfig<
  Input,
  Output,
  Error,
  Runtime extends AtomRuntime,
> {
  /** The atom runtime to use for Effect execution */
  readonly runtime: Runtime;
  /** The Effect or handler function to wrap */
  readonly handler: (input: Input) => Effect.Effect<Output, Error, RuntimeContext<Runtime>>;
  /** Toast configuration for user feedback */
  readonly toast: ToastConfig<Output, Error>;
  /** Name for the generated hook (e.g., "signIn" generates "useSignIn") */
  readonly hookName: string;
}

/**
 * Toast configuration with waiting, success, and failure messages.
 */
export interface ToastConfig<Output, Error> {
  /** Message shown while operation is in progress */
  readonly waiting: string;
  /** Message shown on success (can be string or function of result) */
  readonly success: string | ((result: Output) => string);
  /** Message shown on failure (function of error) */
  readonly failure: (error: Error) => string;
}

/**
 * Result of createMutationAtom containing the atom and typed hook.
 */
export interface MutationAtomResult<Input, Output, Error> {
  /** The underlying atom for direct access */
  readonly atom: WritableAtom<Input, Promise<Output>>;
  /** Pre-configured hook with promise mode */
  readonly useHook: () => { mutate: (input: Input) => Promise<Output> };
}
```

### Implementation

Location: `packages/iam/client/src/_common/atom.factory.ts`

```typescript
import type { Atom } from "@effect-atom/atom-react";
import { useAtomSet } from "@effect-atom/atom-react";
import { withToast } from "@beep/ui/common/index";
import * as F from "effect/Function";
import * as O from "effect/Option";

// ============================================================================
// Types
// ============================================================================

/**
 * Toast configuration for mutation atoms.
 */
export interface ToastConfig<Output, Error> {
  /** Message shown while operation is in progress */
  readonly waiting: string;
  /** Message shown on success */
  readonly success: string | ((result: Output) => string);
  /** Function to extract error message */
  readonly failure: (error: Error) => string;
}

/**
 * Configuration for creating a mutation atom.
 */
export interface CreateMutationAtomConfig<
  Input,
  Output,
  Error,
  Runtime extends { fn: typeof Atom.prototype.fn },
> {
  /** The atom runtime instance */
  readonly runtime: Runtime;
  /** The Effect handler function */
  readonly handler: Parameters<Runtime["fn"]>[0];
  /** Toast notification configuration */
  readonly toast: ToastConfig<Output, Error>;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a mutation atom with integrated toast notifications.
 *
 * Reduces the standard atom + hook pattern from ~10 lines to ~6 lines
 * while ensuring consistent toast integration.
 *
 * @param config - Configuration object with runtime, handler, and toast settings
 * @returns Object containing the atom and a pre-configured hook
 *
 * @example
 * ```ts
 * // Before (10 lines)
 * const signInEmailAtom = signInRuntime.fn(
 *   F.flow(
 *     SignInService.email,
 *     withToast({
 *       onWaiting: "Signing in...",
 *       onSuccess: "Signed in successfully",
 *       onFailure: (e) => e.message,
 *     })
 *   )
 * );
 *
 * export const useSignIn = () => {
 *   const email = useAtomSet(signInEmailAtom, { mode: "promise" as const });
 *   return { email };
 * };
 *
 * // After (6 lines)
 * export const { atom: signInEmailAtom, useMutation: useSignInEmail } = createMutationAtom({
 *   runtime: signInRuntime,
 *   handler: SignInService.email,
 *   toast: {
 *     waiting: "Signing in...",
 *     success: "Signed in successfully",
 *     failure: (e) => e.message,
 *   },
 * });
 * ```
 */
export const createMutationAtom = <
  Input,
  Output,
  Error extends { message: string },
  Runtime extends { fn: (handler: unknown) => unknown },
>(
  config: CreateMutationAtomConfig<Input, Output, Error, Runtime>
) => {
  // Create the atom with toast wrapper
  const atom = config.runtime.fn(
    F.flow(
      config.handler as (input: Input) => unknown,
      withToast({
        onWaiting: config.toast.waiting,
        onSuccess: typeof config.toast.success === "string"
          ? config.toast.success
          : (result: Output) => config.toast.success(result),
        onFailure: (error: unknown) => {
          // Handle Option<Error> pattern from withToast
          if (O.isOption(error)) {
            return O.match(error, {
              onNone: () => "An unknown error occurred",
              onSome: (e) => config.toast.failure(e as Error),
            });
          }
          return config.toast.failure(error as Error);
        },
      })
    )
  );

  // Create the hook
  const useMutation = () => {
    const mutate = useAtomSet(atom as Atom.WritableAtom<Input, Promise<Output>>, {
      mode: "promise" as const,
    });
    return { mutate };
  };

  return { atom, useMutation };
};

// ============================================================================
// Variant: Read-only atom factory
// ============================================================================

/**
 * Creates a read-only atom (no mutation, just data fetching).
 *
 * @param config - Configuration with runtime and effect
 * @returns Object containing the atom and a value hook
 *
 * @example
 * ```ts
 * export const { atom: sessionAtom, useValue: useSession } = createQueryAtom({
 *   runtime: coreRuntime,
 *   effect: CoreService.getSession(),
 * });
 * ```
 */
export const createQueryAtom = <
  Output,
  Error,
  Runtime extends { atom: (effect: unknown) => unknown },
>(config: {
  readonly runtime: Runtime;
  readonly effect: unknown;
}) => {
  const atom = config.runtime.atom(config.effect);

  // Note: useValue hook would use useAtomValue
  // Implementation depends on specific runtime type

  return { atom };
};
```

### Usage Examples

**Before (sign-in-email.atom.ts - 10 lines):**

```typescript
import { SignInService, signInRuntime } from "@beep/iam-client/sign-in";
import { withToast } from "@beep/ui/common/index";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";

export const signInEmailAtom = signInRuntime.fn(
  F.flow(
    SignInService.email,
    withToast({
      onWaiting: "Signing in...",
      onSuccess: "Signed in successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const useSignIn = () => {
  const email = useAtomSet(signInEmailAtom, { mode: "promise" as const });
  return { email };
};
```

**After (sign-in-email.atom.ts - 6 lines):**

```typescript
import { SignInService, signInRuntime } from "@beep/iam-client/sign-in";
import { createMutationAtom } from "@beep/iam-client/_common";

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

### Migration Guide

1. **Import factory**: Add `createMutationAtom` import from `@beep/iam-client/_common`
2. **Replace atom definition**: Use factory config object instead of `runtime.fn(F.flow(...))`
3. **Replace hook definition**: Destructure `useMutation` from factory result
4. **Update hook exports**: Rename hook if needed (factory uses `useMutation` pattern)

---

## 5. State Machine Utilities

### Problem Statement

From Phase 1 analysis:
- Multi-step flows (verification, MFA, password reset) lack coordinated state management
- No state machine pattern currently implemented in IAM
- Need type-safe state transitions with Effect integration

### API Design

```typescript
/**
 * State machine configuration with typed states and transitions.
 */
export interface StateMachineConfig<State extends { _tag: string }> {
  /** Initial state */
  readonly initial: State;
  /** Valid transitions map */
  readonly transitions: TransitionMap<State>;
}

/**
 * Map of transition names to their configurations.
 */
export type TransitionMap<State extends { _tag: string }> = Record<
  string,
  TransitionConfig<State, State["_tag"], State["_tag"]>
>;

/**
 * Single transition configuration.
 */
export interface TransitionConfig<
  State extends { _tag: string },
  From extends State["_tag"],
  To extends State["_tag"],
> {
  /** Required current state tag */
  readonly from: From;
  /** Target state tag after transition */
  readonly to: To;
  /** Effect to execute during transition */
  readonly effect: (current: Extract<State, { _tag: From }>) => Effect.Effect<
    Extract<State, { _tag: To }>,
    unknown,
    unknown
  >;
}
```

### Implementation

Location: `packages/iam/client/src/_common/state-machine.ts`

```typescript
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import * as Data from "effect/Data";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as F from "effect/Function";

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error thrown when attempting an invalid state transition.
 */
export class InvalidTransitionError extends Data.TaggedError("InvalidTransitionError")<{
  readonly message: string;
  readonly currentState: string;
  readonly attemptedTransition: string;
  readonly validTransitions: readonly string[];
}> {}

// ============================================================================
// State Machine Types
// ============================================================================

/**
 * Base constraint for state machine states.
 * All states must have a `_tag` discriminator.
 */
export interface StateMachineState {
  readonly _tag: string;
}

/**
 * Configuration for a single transition.
 */
export interface TransitionConfig<
  State extends StateMachineState,
  From extends State["_tag"],
  To extends State["_tag"],
  Input,
> {
  /** The state tag this transition is valid from */
  readonly from: From;
  /** The state tag this transition results in */
  readonly to: To;
  /** Effect that performs the transition and returns the new state */
  readonly effect: (
    input: Input,
    current: Extract<State, { _tag: From }>
  ) => Effect.Effect<Extract<State, { _tag: To }>, unknown, unknown>;
}

/**
 * State machine instance with transition methods.
 */
export interface StateMachine<State extends StateMachineState> {
  /** Current state reference */
  readonly stateRef: Ref.Ref<State>;
  /** Get current state */
  readonly getState: Effect.Effect<State, never, never>;
  /** Execute a named transition */
  readonly transition: <Input>(
    name: string,
    input: Input
  ) => Effect.Effect<State, InvalidTransitionError, never>;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a state machine with type-safe transitions.
 *
 * The state machine uses Effect Ref for atomic state management and
 * validates transitions before execution.
 *
 * @param config - State machine configuration
 * @returns Effect that creates the state machine instance
 *
 * @example
 * ```ts
 * // Define states
 * type VerificationState =
 *   | { _tag: "Initial" }
 *   | { _tag: "CodeSent"; email: string; expiresAt: Date }
 *   | { _tag: "Verified"; email: string }
 *   | { _tag: "Failed"; reason: string };
 *
 * // Define transitions
 * const transitions = {
 *   sendCode: {
 *     from: "Initial" as const,
 *     to: "CodeSent" as const,
 *     effect: (email: string) => Effect.gen(function* () {
 *       yield* sendVerificationEmail(email);
 *       return { _tag: "CodeSent", email, expiresAt: new Date(Date.now() + 900000) };
 *     }),
 *   },
 *   verify: {
 *     from: "CodeSent" as const,
 *     to: "Verified" as const,
 *     effect: (code: string, current) => Effect.gen(function* () {
 *       yield* verifyCode(current.email, code);
 *       return { _tag: "Verified", email: current.email };
 *     }),
 *   },
 * };
 *
 * // Create machine
 * const machine = yield* createStateMachine({
 *   initial: { _tag: "Initial" },
 *   transitions,
 * });
 *
 * // Use transitions
 * yield* machine.transition("sendCode", "user@example.com");
 * yield* machine.transition("verify", "123456");
 * ```
 */
export const createStateMachine = <
  State extends StateMachineState,
  Transitions extends Record<
    string,
    TransitionConfig<State, State["_tag"], State["_tag"], unknown>
  >,
>(config: {
  readonly initial: State;
  readonly transitions: Transitions;
}): Effect.Effect<StateMachine<State>, never, never> =>
  Effect.gen(function* () {
    const stateRef = yield* Ref.make(config.initial);

    const getState = Ref.get(stateRef);

    const transition = <Input>(
      name: string,
      input: Input
    ): Effect.Effect<State, InvalidTransitionError, never> =>
      Effect.gen(function* () {
        const current = yield* Ref.get(stateRef);
        const transitionConfig = config.transitions[name];

        // Validate transition exists
        if (transitionConfig === undefined) {
          yield* new InvalidTransitionError({
            message: `Unknown transition: ${name}`,
            currentState: current._tag,
            attemptedTransition: name,
            validTransitions: R.keys(config.transitions),
          });
        }

        // Validate current state matches transition's `from`
        if (current._tag !== transitionConfig.from) {
          yield* new InvalidTransitionError({
            message: `Invalid transition: cannot ${name} from state ${current._tag}`,
            currentState: current._tag,
            attemptedTransition: name,
            validTransitions: F.pipe(
              config.transitions,
              R.toEntries,
              A.filter(([_, t]) => t.from === current._tag),
              A.map(([transitionName, _]) => transitionName)
            ),
          });
        }

        // Execute transition effect
        const nextState = yield* transitionConfig.effect(
          input,
          current as Extract<State, { _tag: typeof transitionConfig.from }>
        );

        // Update state
        yield* Ref.set(stateRef, nextState as State);

        return nextState as State;
      });

    return {
      stateRef,
      getState,
      transition,
    };
  });

// ============================================================================
// React Integration Hook Pattern
// ============================================================================

/**
 * React hook result for state machine.
 */
export interface UseStateMachineResult<State extends StateMachineState> {
  /** Current state (reactive) */
  readonly state: State;
  /** Trigger a named transition */
  readonly send: <Input>(name: string, input: Input) => Promise<State>;
  /** Check if a transition is valid from current state */
  readonly canTransition: (name: string) => boolean;
}

/**
 * Example hook pattern for React integration.
 *
 * This is a pattern reference - actual implementation requires
 * effect-atom integration specific to the runtime.
 *
 * @example
 * ```tsx
 * // In atom file
 * const verificationMachineAtom = runtime.atom(
 *   createStateMachine({
 *     initial: { _tag: "Initial" },
 *     transitions: verificationTransitions,
 *   })
 * );
 *
 * export const useVerificationMachine = () => {
 *   const machine = useAtomValue(verificationMachineAtom);
 *   const [state, setState] = useState<VerificationState>({ _tag: "Initial" });
 *
 *   const send = async (name: string, input: unknown) => {
 *     const result = await runtime.runPromise(machine.transition(name, input));
 *     setState(result);
 *     return result;
 *   };
 *
 *   const canTransition = (name: string) => {
 *     const config = verificationTransitions[name];
 *     return config?.from === state._tag;
 *   };
 *
 *   return { state, send, canTransition };
 * };
 * ```
 */
```

### Usage Examples

**Email Verification Flow:**

```typescript
import * as Effect from "effect/Effect";
import { createStateMachine, InvalidTransitionError } from "@beep/iam-client/_common";

// State definition
type VerificationState =
  | { readonly _tag: "Initial" }
  | { readonly _tag: "CodeSent"; readonly email: string; readonly expiresAt: Date }
  | { readonly _tag: "Verified"; readonly email: string }
  | { readonly _tag: "Failed"; readonly reason: string };

// Transition configurations
const verificationTransitions = {
  sendCode: {
    from: "Initial" as const,
    to: "CodeSent" as const,
    effect: (email: string, _current: { _tag: "Initial" }) =>
      Effect.gen(function* () {
        // Call Better Auth to send verification email
        yield* Effect.tryPromise({
          try: () => client.emailVerification.sendVerificationEmail({ email }),
          catch: (e) => new Error("Failed to send code"),
        });
        return {
          _tag: "CodeSent" as const,
          email,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        };
      }),
  },
  verify: {
    from: "CodeSent" as const,
    to: "Verified" as const,
    effect: (code: string, current: { _tag: "CodeSent"; email: string }) =>
      Effect.gen(function* () {
        // Verify the code
        yield* Effect.tryPromise({
          try: () => client.emailVerification.verifyEmail({ code }),
          catch: (e) => new Error("Invalid code"),
        });
        return {
          _tag: "Verified" as const,
          email: current.email,
        };
      }),
  },
  fail: {
    from: "CodeSent" as const,
    to: "Failed" as const,
    effect: (reason: string, _current: { _tag: "CodeSent" }) =>
      Effect.succeed({
        _tag: "Failed" as const,
        reason,
      }),
  },
  retry: {
    from: "Failed" as const,
    to: "Initial" as const,
    effect: (_input: void, _current: { _tag: "Failed" }) =>
      Effect.succeed({ _tag: "Initial" as const }),
  },
};

// Usage in Effect
const verificationProgram = Effect.gen(function* () {
  const machine = yield* createStateMachine({
    initial: { _tag: "Initial" } as VerificationState,
    transitions: verificationTransitions,
  });

  // Send verification code
  yield* machine.transition("sendCode", "user@example.com");

  // User enters code
  const code = "123456";

  // Verify the code
  const result = yield* machine.transition("verify", code).pipe(
    Effect.catchTag("InvalidTransitionError", (e) =>
      Effect.succeed({ _tag: "Failed" as const, reason: e.message })
    )
  );

  return result;
});
```

**React Component Integration:**

```typescript
// verification.atoms.ts
import { createStateMachine } from "@beep/iam-client/_common";
import { coreRuntime } from "@beep/iam-client/core";
import { useAtomValue } from "@effect-atom/atom-react";
import * as React from "react";

// Create machine atom
const verificationMachineAtom = coreRuntime.atom(
  createStateMachine({
    initial: { _tag: "Initial" } as VerificationState,
    transitions: verificationTransitions,
  })
);

// Hook for component usage
export const useEmailVerification = () => {
  const machine = useAtomValue(verificationMachineAtom);
  const [state, setState] = React.useState<VerificationState>({ _tag: "Initial" });

  const sendCode = React.useCallback(async (email: string) => {
    const result = await coreRuntime.runPromise(machine.transition("sendCode", email));
    setState(result);
    return result;
  }, [machine]);

  const verify = React.useCallback(async (code: string) => {
    const result = await coreRuntime.runPromise(machine.transition("verify", code));
    setState(result);
    return result;
  }, [machine]);

  const retry = React.useCallback(async () => {
    const result = await coreRuntime.runPromise(machine.transition("retry", undefined));
    setState(result);
  }, [machine]);

  return { state, sendCode, verify, retry };
};
```

### Migration Guide

State machine utilities are a new addition (not a migration from existing patterns). Use when:

1. Implementing multi-step authentication flows (email verification, MFA)
2. Managing complex UI state with Effect-based transitions
3. Need type-safe state validation before transitions

---

## Breaking Changes

### Handler Factory

The handler factory introduces a new pattern but **does not break existing handlers**. Migration is optional but recommended.

**Potential breaking changes if fully migrated:**
- Handler return type now includes `BetterAuthResponseError` in error channel
- Session signal notification timing changes (now always after decode, not before)

### Error Hierarchy

**New exports (non-breaking):**
- `BetterAuthResponseError` (Data.TaggedError variant)
- `SessionExpiredError`
- `InvalidCredentialsError`
- `RateLimitedError`
- `EmailVerificationRequiredError`

**Existing exports unchanged:**
- `IamError` (S.TaggedError)
- `UnknownIamError` (S.TaggedError)
- `BetterAuthError` (S.instanceOf)

### Atom Factory

Non-breaking addition. Existing atom patterns continue to work.

### Schema Helpers

`withFormAnnotations` unchanged. `BetterAuthSuccessFrom` is a new addition.

### State Machine

New addition, no breaking changes.

---

## Migration Sequence

Recommended order for migrating existing code:

1. **Add new files (no changes to existing code)**
   - `handler.factory.ts`
   - `schema.helpers.ts` (add `BetterAuthSuccessFrom`)
   - `atom.factory.ts`
   - `state-machine.ts`
   - Update `errors.ts` (add Data.TaggedError variants)

2. **Migrate handlers one-by-one**
   - Start with `sign-out.handler.ts` (simplest, no payload)
   - Then `get-session.handler.ts` (read-only, no signal)
   - Then `sign-in-email.handler.ts` (has payload, has signal)
   - Then `sign-up-email.handler.ts` (complex, has transform)

3. **Migrate atoms one-by-one**
   - Start with `sign-in-email.atom.ts`
   - Then `sign-up-email.atoms.ts`
   - Then `core/atoms.ts`

4. **Add state machine for new flows**
   - Email verification
   - Two-factor authentication
   - Password reset

---

## Type Definitions

### Exported from `handler.factory.ts`

```typescript
export { createHandler, BetterAuthResponseError };
export type { HandlerConfig, BetterAuthResponse, HandlerInput };
```

### Exported from `schema.helpers.ts`

```typescript
export { BetterAuthSuccessFrom, withFormAnnotations };
```

### Exported from `errors.ts`

```typescript
// Schema-based (existing)
export { IamError, UnknownIamError, BetterAuthError };

// Data.TaggedError-based (new)
export {
  BetterAuthResponseError,
  SessionExpiredError,
  InvalidCredentialsError,
  RateLimitedError,
  EmailVerificationRequiredError,
};

// Type union
export type { HandlerError };
```

### Exported from `atom.factory.ts`

```typescript
export { createMutationAtom, createQueryAtom };
export type { ToastConfig, CreateMutationAtomConfig, MutationAtomResult };
```

### Exported from `state-machine.ts`

```typescript
export { createStateMachine, InvalidTransitionError };
export type {
  StateMachineState,
  TransitionConfig,
  StateMachine,
  UseStateMachineResult,
};
```

---

## Appendix: Complete File Structure

After implementation, the `_common/` directory will contain:

```
packages/iam/client/src/_common/
├── index.ts                    # Re-exports all public APIs
├── common.annotations.ts       # Existing - withFormAnnotations
├── common.schemas.ts           # Existing - shared schemas
├── errors.ts                   # Enhanced - add Data.TaggedError variants
├── handler.factory.ts          # NEW - createHandler
├── schema.helpers.ts           # NEW - BetterAuthSuccessFrom
├── atom.factory.ts             # NEW - createMutationAtom
└── state-machine.ts            # NEW - createStateMachine
```
