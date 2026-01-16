# Current IAM Effect Patterns Analysis

## Executive Summary

This Phase 1 analysis reveals significant inconsistencies across the IAM client implementation that directly impact reliability and maintainability. The most critical finding is that **only 1 of 3 session-mutating handlers correctly notifies the session signal**, meaning sign-out and sign-up operations leave the UI in stale states where auth guards don't react.

Handler implementations follow similar boilerplate patterns (~80% repeated code), but vary in critical details: Effect.fn name string conventions, parameter signatures, response decoding targets, and error handling. Only the sign-in-email handler checks `response.error` at all, and even that check is only used for conditional signal notification rather than failing the Effect.

The contract layer shows mixed annotation approaches—`withFormAnnotations()` helper versus direct `BS.DefaultFormValuesAnnotationId`—while the service and atom layers are remarkably consistent. This suggests the inconsistencies are primarily at the handler and contract level, making them good targets for factory-based standardization.

## Handler Analysis

### Matrix

| Handler | Effect.fn Name | Signature | Mutates Session | Notifies Signal | Checks Error | Decodes Target |
|---------|----------------|-----------|-----------------|-----------------|--------------|----------------|
| sign-out | `"core/sign-out/handler"` | Optional `{ fetchOptions? }` | Yes | **NO** | No | `response.data` |
| get-session | `"core/get-session"` | None (void) | No | No (correct) | No | `response` |
| sign-in-email | `"sign-in/email/handler"` | Required `{ payload, fetchOptions }` | Yes | Conditional | **YES** | `response.data` |
| sign-up-email | `"signUp.email.handler"` | Required `{ payload, fetchOptions }` | Yes | **NO** | No | `response` |

### Detailed Findings

#### sign-out.handler.ts

- **File**: `packages/iam/client/src/core/sign-out/sign-out.handler.ts`
- **Effect.fn name**: `"core/sign-out/handler"`
- **Signature**: Optional payload with optional `fetchOptions`
- **Session mutation**: Yes (signs user out)
- **Signal notification**: **MISSING** - UI won't refresh
- **Error handling**: Does not check `response.error`
- **Notable issues**:
  - Name uses slashes throughout: `core/sign-out/handler`
  - Decodes `response.data` directly without null check

```typescript
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

#### get-session.handler.ts

- **File**: `packages/iam/client/src/core/get-session/get-session.handler.ts`
- **Effect.fn name**: `"core/get-session"` (no `/handler` suffix)
- **Signature**: No parameters
- **Session mutation**: No (read-only)
- **Signal notification**: No (correct for read-only)
- **Error handling**: Does not check `response.error`
- **Notable issues**:
  - Inconsistent naming (no `/handler` suffix)
  - Decodes full `response` not `response.data`

```typescript
export const Handler = Effect.fn("core/get-session")(function* () {
  const response = yield* Effect.tryPromise({
    try: () => client.getSession(),
    catch: Common.IamError.fromUnknown,
  });
  return yield* S.decodeUnknown(Contract.Success)(response);
});
```

#### sign-in-email.handler.ts

- **File**: `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts`
- **Effect.fn name**: `"sign-in/email/handler"`
- **Signature**: Required `{ payload, fetchOptions }`
- **Session mutation**: Yes (signs user in)
- **Signal notification**: Conditional - only when `response.error` is null
- **Error handling**: **ONLY HANDLER** that checks `response.error`
- **Notable issues**:
  - Encodes payload before API call
  - Best error handling of all handlers, but still doesn't fail Effect on error

```typescript
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

#### sign-up-email.handler.ts

- **File**: `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts`
- **Effect.fn name**: `"signUp.email.handler"` (uses dots, not slashes)
- **Signature**: Required `{ payload, fetchOptions }`
- **Session mutation**: Yes (creates and signs in user)
- **Signal notification**: **MISSING** - New user appears not logged in
- **Error handling**: Does not check `response.error`
- **Notable issues**:
  - Name format differs (dots vs slashes)
  - Decodes full `response` not `response.data`
  - Spreads encoded payload but adds `name` from original

```typescript
export const Handler = Effect.fn("signUp.email.handler")(function* (params: {
  readonly payload: Contract.Payload;
  readonly fetchOptions: Common.ClientFetchOption;
}) {
  const encodedPayload = yield* S.encode(Contract.Payload)(params.payload);
  const response = yield* Effect.tryPromise({
    try: () => client.signUp.email({
      ...encodedPayload,
      name: params.payload.name,
      fetchOptions: params.fetchOptions,
    }),
    catch: Common.IamError.fromUnknown,
  });
  return yield* S.decodeUnknown(Contract.Success)(response);
});
```

## Session Signal Analysis

### Complete Mapping

| Location | Type | Context |
|----------|------|---------|
| `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts:26` | **Code** | Conditional notify after API call |
| `packages/iam/client/src/adapters/better-auth/client.ts:75` | **Listener** | `$store.listen("$sessionSignal", asyncNoOp)` |
| `packages/iam/client/AGENTS.md` (multiple) | **Documentation** | Usage guidelines |
| `packages/iam/client/README.md` (multiple) | **Documentation** | Pattern documentation |
| `packages/iam/ui/AGENTS.md` (multiple) | **Documentation** | UI integration guidelines |

### Critical Gap Analysis

Per documentation, ALL session-mutating operations MUST call `client.$store.notify("$sessionSignal")`:

| Operation | Should Notify | Actually Notifies | Gap |
|-----------|---------------|-------------------|-----|
| sign-in-email | Yes | Conditional | Partial |
| sign-out | Yes | No | **CRITICAL** |
| sign-up-email | Yes | No | **CRITICAL** |
| get-session | No (read-only) | No | None |

The `useCore()` hook in `core/atoms.ts` attempts to work around this for sign-out by manually calling `sessionRefresh()` after the atom completes, but this is fragile and doesn't match the documented pattern.

## Contract Analysis

### Matrix

| Contract | Classes Defined | Annotation Method | Has Transform | Default Values |
|----------|-----------------|-------------------|---------------|----------------|
| sign-out | `Success` | Direct `$I.annotations()` | No | N/A |
| get-session | `SessionData`, `Response`, `Success` | Direct `$I.annotations()` | No | N/A |
| sign-in-email | `Payload`, `Success` | `withFormAnnotations()` helper | No | Yes |
| sign-up-email | `PayloadFrom`, `Payload`, `Response`, `Success` | Direct `BS.DefaultFormValuesAnnotationId` | Yes (2x) | Yes |

### Detailed Findings

#### sign-out.contract.ts

- **File**: `packages/iam/client/src/core/sign-out/sign-out.contract.ts`
- **Schemas**: Just `Success` with `success: S.Boolean`
- **Annotation**: Direct `$I.annotations()`
- **Complexity**: Minimal

```typescript
export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}
```

#### get-session.contract.ts

- **File**: `packages/iam/client/src/core/get-session/get-session.contract.ts`
- **Schemas**: `SessionData`, `Response`, `Success`
- **Annotation**: Direct annotations
- **Notable**: Uses `S.OptionFromNullOr` for Option handling

```typescript
export class Response extends S.Class<Response>($I`Response`)({
  data: S.NullOr(SessionData),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  data: S.OptionFromNullOr(SessionData),
}) {}
```

#### sign-in-email.contract.ts

- **File**: `packages/iam/client/src/sign-in/email/sign-in-email.contract.ts`
- **Schemas**: `Payload`, `Success`
- **Annotation**: Uses `withFormAnnotations()` helper
- **Notable**: Clean pattern with form defaults on transformation annotations

```typescript
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,
    rememberMe: Common.RememberMe,
    callbackURL: Common.CallbackURL,
  },
  Common.withFormAnnotations(
    $I.annotations("Payload", { description: "..." }),
    { email: "", password: "", rememberMe: true, callbackURL: "/" }
  )
) {}
```

#### sign-up-email.contract.ts

- **File**: `packages/iam/client/src/sign-up/email/sign-up-email.contract.ts`
- **Schemas**: `PayloadFrom`, `Payload`, `Response`, `Success`
- **Annotation**: Direct `BS.DefaultFormValuesAnnotationId` (not using helper)
- **Transforms**:
  - `PayloadFrom.transformOrFailFrom` for password confirmation validation
  - `Response.transformOrFail` for null data extraction
- **Notable**: Most complex contract with validation logic in transforms

```typescript
export class Payload extends PayloadFrom.transformOrFailFrom<Payload>($I`Payload`)(
  { name: S.String },
  {
    decode: (i, _, ast) => Effect.gen(function* () {
      if (i.password !== i.passwordConfirm) {
        return yield* Effect.fail(new ParseResult.Type(...));
      }
      return yield* Effect.succeed({ name: `${i.firstName} ${i.lastName}`, ...i });
    }),
    // ...
  },
  [undefined, { [BS.DefaultFormValuesAnnotationId]: {...} }, undefined]
) {}
```

## Service Pattern Summary

All three services follow an identical, consistent pattern:

```typescript
import { $IamClientId } from "@beep/identity/packages";
import { makeAtomRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import * as FeatureModule from "./feature";

const $I = $IamClientId.create("domain/service");

export class DomainService extends Effect.Service<DomainService>()($I`DomainService`, {
  accessors: true,
  effect: Effect.succeed({
    methodName: FeatureModule.Handler,
  }),
}) {}

const layer = DomainService.Default;

export const domainRuntime = makeAtomRuntime(() => layer);
// or: makeAtomRuntime(() => Layer.mergeAll(layer));
```

**Observations**:
- `Effect.Service` with `accessors: true` pattern is consistent
- `makeAtomRuntime` wraps the layer for atom integration
- Minor variance: `core/service.ts` uses `() => layer` directly, others use `() => Layer.mergeAll(layer)`

## UI Atom Pattern Summary

All three atom patterns follow a consistent structure:

### Standard Mutation Atom Pattern

```typescript
import { XxxService, xxxRuntime } from "@beep/iam-client/xxx";
import { withToast } from "@beep/ui/common/index";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";

export const xxxAtom = xxxRuntime.fn(
  F.flow(
    XxxService.method,
    withToast({
      onWaiting: "Action in progress...",
      onSuccess: "Action completed",
      onFailure: (e) => e.message,
    })
  )
);

export const useXxx = () => {
  const method = useAtomSet(xxxAtom, { mode: "promise" as const });
  return { method };
};
```

### Read-Only Atom Pattern

Found in `core/atoms.ts`:

```typescript
const getSessionAtom = coreRuntime.atom(CoreService.getSession());
```

Uses `runtime.atom()` instead of `runtime.fn()` for data fetching without mutation.

### Enhanced Hook Pattern

`core/atoms.ts` shows enhanced pattern with additional state management:

```typescript
export const useCore = () => {
  const signOutSetter = useAtomSet(signOutAtom, { mode: "promise" as const });
  const sessionResult = useAtomValue(getSessionAtom);
  const sessionRefresh = useAtomRefresh(getSessionAtom);

  const signOut = async (payload?: SignOutPayload) => {
    await signOutSetter(payload);
    sessionRefresh(); // Manual refresh to work around missing signal
  };

  return { signOut, sessionResult, sessionRefresh };
};
```

## Inconsistency Catalog

| ID | Description | Files Affected | Severity | Recommended Standardization |
|----|-------------|----------------|----------|----------------------------|
| I1 | Effect.fn name format varies | All 4 handlers | Medium | Use `"domain/feature/handler"` convention |
| I2 | Session signal not notified after sign-out | sign-out.handler.ts | **Critical** | Add notification after success |
| I3 | Session signal not notified after sign-up | sign-up-email.handler.ts | **Critical** | Add notification after success |
| I4 | `response.error` not checked | 3 of 4 handlers | High | Always check and fail Effect on error |
| I5 | Response decode target varies | 4 handlers | Medium | Standardize to decode `response.data` or use transform |
| I6 | Payload encoding inconsistent | 4 handlers | Low | Standardize encode-before-call pattern |
| I7 | Parameter signature varies | 4 handlers | Medium | Use consistent `{ payload?, fetchOptions? }` pattern |
| I8 | Annotation method varies | sign-in vs sign-up contracts | Low | Standardize on `withFormAnnotations()` |

## Boilerplate Inventory

| Pattern | Occurrences | Lines/Instance | Total Lines | Factoring Opportunity |
|---------|-------------|----------------|-------------|----------------------|
| Handler body (Effect.fn + tryPromise + decode) | 4 | 12-18 | ~60 | **High** - Factory pattern |
| Service class definition | 3 | 10-12 | ~35 | Medium - Template |
| Atom definition with toast | 3+ | 10-15 | ~40 | **High** - Factory pattern |
| Error wrapper (IamError.fromUnknown) | 4 | 1 | 4 | Low - Already factored |
| Schema class + namespace pattern | 20+ | 5-8 | ~150 | Low - Necessary boilerplate |

### Handler Boilerplate Breakdown

Current handler structure (~15 lines):

```typescript
// 1. Imports (5 lines)
import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./xxx.contract.ts";

// 2. Handler definition (10-15 lines)
export const Handler = Effect.fn("domain/feature/handler")(function* (params) {
  // Optional: encode payload (~2 lines)
  const encoded = yield* S.encode(Contract.Payload)(params.payload);

  // Core: API call (~5 lines)
  const response = yield* Effect.tryPromise({
    try: () => client.method(encoded),
    catch: Common.IamError.fromUnknown,
  });

  // Optional: session signal (~2 lines)
  if (P.isNullable(response.error)) {
    client.$store.notify("$sessionSignal");
  }

  // Decode response (~1 line)
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

**Unique per handler**: ~3-5 lines (method call, optional encode, specific decode target)
**Boilerplate per handler**: ~10-12 lines (~70-80%)

### Proposed Factory Reduction

```typescript
// With factory (~5 lines per handler):
export const Handler = createHandler({
  name: "domain/feature/handler",
  execute: (payload) => client.method(payload),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload, // optional, enables encode
  mutatesSession: true, // triggers signal notification
});
```

**Estimated reduction**: 50-60% of handler code

## Recommendations

### Priority 1: Critical Fixes (Immediate)

1. **Add session signal notification to sign-out handler**
   - File: `packages/iam/client/src/core/sign-out/sign-out.handler.ts`
   - Add `client.$store.notify("$sessionSignal")` after successful response

2. **Add session signal notification to sign-up-email handler**
   - File: `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts`
   - Add `client.$store.notify("$sessionSignal")` after successful response

3. **Add proper error checking to all handlers**
   - Check `response.error` before decoding
   - Fail Effect when error is present

### Priority 2: Pattern Standardization (Near-term)

1. **Standardize Effect.fn name format**
   - Convention: `"domain/feature/handler"` (all slashes)
   - Update: `signUp.email.handler` → `sign-up/email/handler`

2. **Standardize handler signatures**
   - Session-mutating: Required `{ payload: Schema, fetchOptions: ClientFetchOption }`
   - Read-only: No params or optional params

3. **Standardize response decoding**
   - Always decode `response.data` or use contract transform to extract
   - get-session and sign-up decode full response; should be consistent

4. **Standardize annotation approach**
   - Use `withFormAnnotations()` for all payload schemas with form defaults
   - Update sign-up-email to use helper instead of direct annotation

### Priority 3: Boilerplate Reduction (Phase 3+)

1. **Create handler factory**
   - Location: `packages/iam/client/src/_common/handler.factory.ts`
   - Features:
     - Auto error checking and failure
     - Session signal notification option
     - Payload encoding option
     - Standardized name format validation

2. **Create atom factory**
   - Location: `packages/iam/client/src/_common/atom.factory.ts`
   - Features:
     - Built-in toast integration
     - Standardized hook exposure
     - Optional session refresh integration

3. **Create state machine utilities**
   - Location: `packages/iam/client/src/_common/state-machine.ts`
   - For multi-step flows (verification, password reset, MFA)

## Questions Definitively Answered

### 1. Are there any handlers that properly check `response.error`?

**Partial**. Only `sign-in-email.handler.ts` checks `response.error`, but it only uses the check for conditional session signal notification—it does NOT fail the Effect when an error is present. The decode of `response.data` may still succeed even when there's an error, leading to inconsistent behavior.

### 2. Is the session signal notification pattern intentionally inconsistent or accidental?

**Accidental**. The documentation in AGENTS.md, README.md, and multiple guides explicitly states that ALL session-mutating operations MUST call `client.$store.notify("$sessionSignal")`. The fact that only sign-in-email does this (and only conditionally) contradicts the documented requirement. The `useCore()` hook's manual `sessionRefresh()` workaround further suggests this is a known gap being patched rather than intentional design.

### 3. What percentage of handler code is boilerplate vs unique logic?

**~70-80% boilerplate**. Each handler has:
- 5 lines of imports (boilerplate)
- 5-8 lines of Effect.fn/tryPromise/decode structure (boilerplate)
- 2-5 lines of unique logic (API method, optional encode, specific decode)

The unique logic per handler is:
- sign-out: 1 line (the signOut call)
- get-session: 1 line (the getSession call)
- sign-in-email: 3 lines (encode + API call)
- sign-up-email: 4 lines (encode + API call with name extraction)

### 4. Are there any existing factory patterns in the codebase?

**Yes, but not for handlers**:
- `makeAtomRuntime()` in `@beep/runtime-client` - Factory for atom runtimes
- `withFormAnnotations()` in `_common/common.annotations.ts` - Helper for schema annotations
- `IamError.fromUnknown` - Static factory for error wrapping

No handler factory exists. This is a clear opportunity.

### 5. What is the canonical annotation approach already in use?

**Mixed, but `withFormAnnotations()` is cleaner**:
- sign-in-email uses `withFormAnnotations()` helper
- sign-up-email uses direct `BS.DefaultFormValuesAnnotationId` in tuple

The `withFormAnnotations()` helper:
- Provides better documentation
- Ensures correct tuple positioning
- Should be the standard approach

## Appendix: File Locations Summary

### Handlers
- `packages/iam/client/src/core/sign-out/sign-out.handler.ts`
- `packages/iam/client/src/core/get-session/get-session.handler.ts`
- `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts`
- `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts`

### Contracts
- `packages/iam/client/src/core/sign-out/sign-out.contract.ts`
- `packages/iam/client/src/core/get-session/get-session.contract.ts`
- `packages/iam/client/src/sign-in/email/sign-in-email.contract.ts`
- `packages/iam/client/src/sign-up/email/sign-up-email.contract.ts`

### Services
- `packages/iam/client/src/core/service.ts`
- `packages/iam/client/src/sign-in/service.ts`
- `packages/iam/client/src/sign-up/service.ts`

### Atoms
- `packages/iam/client/src/core/atoms.ts`
- `packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts`
- `packages/iam/ui/src/sign-up/email/sign-up-email.atoms.ts`

### Common
- `packages/iam/client/src/_common/errors.ts`
- `packages/iam/client/src/_common/common.annotations.ts`
- `packages/iam/client/src/_common/common.schemas.ts`
