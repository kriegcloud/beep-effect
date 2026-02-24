# Contract V2: Error Management Redesign

## Overview

The `@beep/contract` package wraps third-party APIs (Better Auth, WebAuthn, Stripe, etc.) with spec-driven, schema-validated contracts. V2 introduces a redesigned error handling system that addresses the limitations of V1.

## What's New in V2

### Problem Solved

**V1 Issue**: Errors from `continuation.run()` always became `ContractError.UnknownError`, making it impossible for consumers to map third-party errors to the contract's `failureSchema`.

**V2 Solution**: Composable error mappers at both the continuation and lift levels, allowing third-party errors to be transformed into typed failures.

---

## V2 API: Error Mapping

### 1. Continuation `mapError` Option

The `contract.continuation()` method now accepts a `mapError` option that transforms raw errors into typed failures:

```ts
import { Contract } from "@beep/contract/v2/Contract";
import * as S from "effect/Schema";

// Define your contract with typed failures
const PasskeyCreateContract = Contract.make("PasskeyCreate", {
  payload: { options: S.Unknown },
  success: S.Struct({ credentialId: S.String }),
  failure: S.Union(
    NotAllowedError,
    InvalidStateError,
    SecurityError
  ),
});

// Create continuation with error mapping
const continuation = PasskeyCreateContract.continuation({
  mapError: (error, ctx) => {
    if (error instanceof DOMException) {
      switch (error.name) {
        case "NotAllowedError":
          return new NotAllowedError({
            message: error.message,
            domain: ctx.metadata.domain, // Access metadata from context
          });
        case "InvalidStateError":
          return new InvalidStateError({ message: error.message });
        case "SecurityError":
          return new SecurityError({ message: error.message });
      }
    }
    return undefined; // Fall through to default UnknownError
  },
});
```

### 2. Multiple Mappers (Tried in Order)

You can provide an array of mappers that are tried in sequence:

```ts
const domExceptionMapper = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return new NotAllowedError({ message: error.message });
      case "InvalidStateError":
        return new InvalidStateError({ message: error.message });
    }
  }
  return undefined; // Not handled, try next mapper
};

const httpErrorMapper = (error: unknown) => {
  if (error instanceof HttpError) {
    return new ServiceError({ statusCode: error.status });
  }
  return undefined;
};

const continuation = contract.continuation({
  mapError: [domExceptionMapper, httpErrorMapper], // Tried in order
});
```

### 3. Lift `mapDefect` Option

The `Contract.lift()` function now supports `mapDefect` for converting defects (die/interrupt) into typed failures:

```ts
import { Contract } from "@beep/contract/v2/Contract";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

const lifted = Contract.lift(PasskeyContract, {
  method: PasskeyImplementation,
  mapDefect: (cause, ctx) => {
    const error = Cause.squash(cause);
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return new NotAllowedError({
        message: error.message,
        domain: ctx.contract.name,
      });
    }
    return undefined; // Fall through to UnknownError
  },
  // Optional: instrumentation hook (still called even with mapDefect)
  onDefect: (cause) =>
    Effect.sync(() => console.log("Defect occurred:", cause)),
});

// lifted.result() - returns HandleOutcome
// lifted.success() - returns just the success value
```

### 4. Error Mapping Pipeline

Errors flow through this pipeline (first match wins):

1. **Schema Decoding** (`decodeFailure`): Attempts to decode the error against the contract's `failureSchema`. Useful when the third-party API returns errors that already match your schema structure.

2. **Custom Mappers** (`mapError`): User-provided mapper function(s) that transform third-party errors into typed failures. Mappers return the mapped error or `undefined` to fall through.

3. **Legacy Normalizer** (`normalizeError`): Fallback function for errors not handled by mappers. Deprecated in favor of `mapError`.

4. **Default Normalization**: Creates a `ContractError.UnknownError` with error message and cause preserved.

```ts
const continuation = contract.continuation({
  // Step 1: Try schema decoding first
  decodeFailure: {
    select: (error) => (error as any).payload, // Extract from response
    parseOptions: { onExcessProperty: "ignore" },
  },

  // Step 2: Custom mappers
  mapError: (error, ctx) => {
    if (error instanceof DOMException) {
      return new PasskeyError({ message: error.message });
    }
    return undefined; // Fall through
  },

  // Step 3 (deprecated): Legacy normalizer
  // normalizeError: (error, ctx) => new CustomError({ ... }),
});
```

### 5. Context Available in Mappers

Both `mapError` and `mapDefect` receive context with metadata:

```ts
interface FailureContinuationContext<C, Extra> {
  readonly contract: C;
  readonly metadata: Metadata<Extra>;
}

interface DefectMapperContext<C> {
  readonly contract: C;
  readonly payload: Payload<C>;
}
```

Metadata includes:
- `id`: Contract ID
- `name`: Contract name
- `domain`: From `Contract.Domain` annotation
- `method`: From `Contract.Method` annotation
- `title`: From `Contract.Title` annotation
- `description`: Contract description
- `supportsAbort`: Whether abort is supported

---

## V2 Type Exports

### ErrorMapper Type

```ts
import type { ErrorMapper, ErrorMapperResult } from "@beep/contract/v2/internal";

// ErrorMapperResult can be:
// - A failure value (the transformed error)
// - undefined (fall through to next mapper)
// - An Effect for async mapping

type ErrorMapper<C, Failure, Extra> = (
  error: unknown,
  context: FailureContinuationContext<C, Extra>
) => ErrorMapperResult<Failure>;
```

### DefectMapper Type

```ts
import type { DefectMapper, DefectMapperResult, DefectMapperContext } from "@beep/contract/v2/internal";

type DefectMapper<C, MappedFailure> = (
  cause: Cause.Cause<unknown>,
  context: DefectMapperContext<C>
) => DefectMapperResult<MappedFailure>;
```

---

## Usage Examples

### Example 1: WebAuthn/Passkey Error Mapping

```ts
import { Contract } from "@beep/contract/v2/Contract";
import * as S from "effect/Schema";

class NotAllowedError extends S.TaggedError<NotAllowedError>()("NotAllowedError", {
  message: S.String,
  domain: S.optional(S.String),
}) {}

class InvalidStateError extends S.TaggedError<InvalidStateError>()("InvalidStateError", {
  message: S.String,
}) {}

const PasskeyCreateContract = Contract.make("PasskeyCreate", {
  payload: { publicKeyOptions: S.Unknown },
  success: S.Struct({ credentialId: S.String }),
  failure: S.Union(NotAllowedError, InvalidStateError),
})
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "create")
  .annotate(Contract.SupportsAbort, true);

const handler = PasskeyCreateContract.implement(
  (payload, { continuation }) => {
    const cont = continuation.continuation({
      mapError: (error, ctx) => {
        if (error instanceof DOMException) {
          switch (error.name) {
            case "NotAllowedError":
              return new NotAllowedError({
                message: error.message,
                domain: ctx.metadata.domain,
              });
            case "InvalidStateError":
              return new InvalidStateError({ message: error.message });
          }
        }
        return undefined;
      },
    });

    return cont.run(async ({ signal }) => {
      const credential = await navigator.credentials.create({
        publicKey: payload.publicKeyOptions,
        signal,
      });
      return { credentialId: credential.id };
    });
  }
);
```

### Example 2: surfaceDefect with Error Mapping

When using `surfaceDefect: true`, mapped errors appear in the Either:

```ts
const continuation = contract.continuation({
  mapError: (error) => {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return new NotAllowedError({ message: error.message });
    }
    return undefined;
  },
});

// With surfaceDefect: true, get Either instead of throwing
const result = await Effect.runPromise(
  continuation.run(
    () => Promise.reject(new DOMException("User cancelled", "NotAllowedError")),
    { surfaceDefect: true }
  )
);

if (Either.isLeft(result)) {
  // result.left is NotAllowedError (or UnknownError if unmapped)
  console.log("Error:", result.left);
}
```

### Example 3: Lift with Defect Mapping

```ts
import { Contract } from "@beep/contract/v2/Contract";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

const lifted = Contract.lift(MyContract, {
  method: (payload) =>
    Effect.tryPromise(() =>
      navigator.credentials.create({ publicKey: payload })
    ),
  mapDefect: (cause, ctx) => {
    const error = Cause.squash(cause);
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return new NotAllowedError({
        message: error.message,
        domain: ctx.contract.name,
      });
    }
    return undefined; // Creates UnknownError
  },
  onDefect: (cause) =>
    Effect.sync(() => {
      // Instrumentation: always called, even when mapDefect handles it
      console.log("Defect logged:", Cause.squash(cause));
    }),
});

// Use the lifted contract
const result = await Effect.runPromise(
  Effect.either(lifted.success({ publicKey: options }))
);
```

---

## Migration from V1

### Before (V1)

```ts
// V1: Errors always became UnknownError
const handler = Contract.implement(
  (payload, { continuation }) =>
    continuation.run(() => thirdPartyApi.call(payload))
);

// Caller had to handle UnknownError even for known error types
```

### After (V2)

```ts
import { Contract } from "@beep/contract/v2/Contract";

// V2: Map errors to typed failures
const handler = Contract.implement(
  (payload, { continuation }) => {
    const cont = continuation.continuation({
      mapError: (error, ctx) => {
        if (error instanceof ThirdPartyError) {
          return new MyTypedError({ message: error.message });
        }
        return undefined;
      },
    });
    return cont.run(() => thirdPartyApi.call(payload));
  }
);

// Caller gets typed errors matching failureSchema
```

---

## Architecture

### File Structure

```
packages/common/contract/src/v2/
├── Contract.ts           # V2 Contract namespace export
├── ContractError.ts      # V2 ContractError namespace export
├── ContractKit.ts        # V2 ContractKit namespace export
└── internal/
    ├── contract/
    │   ├── contract.ts       # Contract.make() with V2 features
    │   ├── types.ts          # ErrorMapper, DefectMapper, etc.
    │   ├── continuation.ts   # failureContinuation() with mapError
    │   ├── lift.ts           # lift() with mapDefect
    │   └── annotations.ts    # Metadata tags
    ├── contract-error/
    │   └── index.ts          # Re-exports from V1 for class identity
    └── contract-kit/
        └── contract-kit.ts   # ContractKit with global defect mapping
```

### Key Types

```ts
// Error mapper function
type ErrorMapper<C, Failure, Extra> = (
  error: unknown,
  context: FailureContinuationContext<C, Extra>
) => ErrorMapperResult<Failure>;

// Defect mapper function (for lift)
type DefectMapper<C, MappedFailure> = (
  cause: Cause.Cause<unknown>,
  context: DefectMapperContext<C>
) => DefectMapperResult<MappedFailure>;

// Continuation options with mapError
interface FailureContinuationOptions<C, F, Extra> {
  readonly mapError?:
    | ErrorMapper<C, ContractFailure<C> | ContractError.UnknownError, Extra>
    | ReadonlyArray<ErrorMapper<C, ContractFailure<C> | ContractError.UnknownError, Extra>>;
  readonly decodeFailure?: { ... };
  readonly normalizeError?: (error: unknown, ctx) => F; // deprecated
  readonly metadata?: MetadataOptions<Extra>;
}

// Lift options with mapDefect
interface LiftOptions<C> {
  readonly method: (payload: Payload<C>) => Effect<ImplementationResult<C>, Failure<C>, Requirements<C>>;
  readonly mapDefect?: DefectMapper<C, Failure<C> | ContractError.UnknownError>;
  readonly onDefect?: (cause: Cause.Cause<unknown>) => Effect<void, never, never>;
  readonly onSuccess?: (success: Success<C>) => Effect<void, never, never>;
  readonly onFailure?: (failure: Failure<C>) => Effect<void, never, never>;
}
```

---

## Technical Notes

### TaggedError and Effect.isEffect

`S.TaggedError` extends `Effect`, which means `Effect.isEffect(taggedError)` returns `true`. The V2 implementation uses `isRunnableEffect` to distinguish actual Effects from TaggedError instances:

```ts
const isRunnableEffect = (value: unknown): value is Effect.Effect<...> =>
  Effect.isEffect(value) && !(value instanceof Error);
```

This ensures that when a mapper returns a TaggedError, it's treated as a return value, not as an Effect to execute.

### Class Identity

V2 re-exports `ContractError` from V1 to ensure class identity is preserved when using `instanceof` checks:

```ts
// v2/internal/contract-error/index.ts
export * as ContractError from "../../../internal/contract-error/contract-error";
```