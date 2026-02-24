# Phase 0: Pattern Analysis

> Infrastructure analysis for better-auth-client-wrappers implementation

---

## Executive Summary

This document captures patterns identified from existing handlers in `@beep/iam-client` that will be used to accelerate implementation of the remaining 90 methods.

**Key Findings:**
- **Boilerplate files** (mod.ts, index.ts) are 100% identical across handlers
- **4 distinct handler patterns** identified: Standard, No-payload, Query-wrapped, Transform
- **3 reusable response schemas** identified: Status, User, Array
- **Captcha middleware** applies to public auth endpoints only (sign-in, sign-up, password-reset)

---

## File Structure Patterns

### Directory Structure (Per Handler)

```
packages/iam/client/src/
└── [category]/
    └── [operation]/
        ├── contract.ts   # Payload, Success, Wrapper
        ├── handler.ts    # Handler implementation
        ├── mod.ts        # Re-exports (boilerplate)
        └── index.ts      # Namespace export (boilerplate)
```

### Boilerplate Files (100% Copy-Paste)

**mod.ts** (identical for all handlers):
```typescript
/**
 * @fileoverview
 * [Operation] module exports.
 *
 * Re-exports all [operation] functionality including contracts, handlers, and schemas.
 *
 * @module @beep/iam-client/[category]/[operation]/mod
 * @category [Category]/[Operation]
 * @since 0.1.0
 */

/**
 * Re-exports [operation] contract schemas and wrapper.
 *
 * @example
 * ```typescript
 * import { Success, Wrapper } from "@beep/iam-client/[category]/[operation]"
 *
 * const response = { ... }
 * const decoded = Success.make(response)
 * ```
 *
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
export * from "./contract.ts";

/**
 * Re-exports [operation] handler implementation.
 *
 * @example
 * ```typescript
 * import { Handler } from "@beep/iam-client/[category]/[operation]"
 * import * as Effect from "effect/Effect"
 *
 * const program = Handler.pipe(
 *   Effect.map(result => result.field)
 * )
 * ```
 *
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
export * from "./handler.ts";
```

**index.ts** (only namespace name varies):
```typescript
/**
 * @fileoverview
 * [Operation] namespace export.
 *
 * Provides a namespaced export for all [operation] functionality.
 *
 * @module @beep/iam-client/[category]/[operation]
 * @category [Category]/[Operation]
 * @since 0.1.0
 */

/**
 * [Operation] namespace containing contracts, handlers, and schemas.
 *
 * Provides all functionality needed to implement [operation] flows in the IAM client.
 *
 * @example
 * ```typescript
 * import { [OperationPascalCase] } from "@beep/iam-client/[category]"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* [OperationPascalCase].Handler(payload)
 *   console.log("[Logged]:", result.field)
 * })
 * ```
 *
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
export * as [OperationPascalCase] from "./mod.ts";
```

---

## Handler Patterns

### Pattern 1: Standard Handler (With Payload)

**Characteristics:**
- Has `Payload` class with input fields
- Has `Success` class for response
- Direct client call with encoded payload

**Example:** `sign-in/email`

**contract.ts:**
```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("[category]/[operation]");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    field1: S.String,
    field2: S.optional(S.String),
  },
  formValuesAnnotation({
    field1: "",
    field2: undefined,
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    resultField: S.String,
  },
  $I.annotations("Success", {
    description: "Success response for [operation].",
  })
) {}

export const Wrapper = W.Wrapper.make("[OperationPascalCase]", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

**handler.ts:**
```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })((encoded) => client.[method](encoded))
);
```

---

### Pattern 2: No-Payload Handler

**Characteristics:**
- No `Payload` class in contract
- Wrapper omits `payload` field
- Handler callback takes no arguments

**Example:** `core/sign-out`, `deleteUser`, `revokeOtherSessions`

**contract.ts:**
```typescript
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("[category]/[operation]");

export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,  // or other response fields
  },
  $I.annotations("Success", {
    description: "Success response for [operation].",
  })
) {}

export const Wrapper = W.Wrapper.make("[OperationPascalCase]", {
  success: Success,
  error: Common.IamError,
  // Note: NO payload field
});
```

**handler.ts:**
```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })(() => client.[method]())  // No parameter
);
```

---

### Pattern 3: Query-Wrapped Handler

**Characteristics:**
- Better Auth expects `{ query: payload }` instead of direct payload
- Common for `list*` operations

**Example:** `organization/members/list`

**handler.ts:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.[method]({ query: encoded }))  // Wrapped!
);
```

---

### Pattern 4: Array Response

**Characteristics:**
- Success schema is `S.Array(ElementSchema)` instead of `S.Class`
- Common for list operations

**contract.ts:**
```typescript
// Success is an array schema, not a class
export const Success = S.Array(ElementSchema).annotations(
  $I.annotations("Success", {
    description: "List of [items].",
  })
);
```

---

### Pattern 5: With Captcha Middleware

**Characteristics:**
- Wrapper uses `.middleware(Common.CaptchaMiddleware)`
- Handler uses `before: Common.withCaptchaResponse`
- Handler callback receives `(encoded, captchaResponse)`

**Applies to:** `signIn.email`, `signIn.username`, `signUp.email`, password reset

**contract.ts:**
```typescript
export const Wrapper = W.Wrapper.make("[Operation]", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);  // Added middleware
```

**handler.ts:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    before: Common.withCaptchaResponse,  // Added before hook
  })((encodedPayload, captchaResponse) =>
    client.[method]({
      ...encodedPayload,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaResponse,
        },
      },
    })
  )
);
```

---

### Pattern 6: Transform Handler (Complex Payload)

**Characteristics:**
- Has `PayloadFrom` class for form input
- Has `Payload` transform schema for API format
- Complex encode/decode logic (e.g., password matching, name combining)

**Example:** `sign-up/email` (firstName/lastName → name, password confirm)

**Note:** This pattern is rare and only needed for:
- Sign-up (password confirmation, name combining)
- Complex forms with computed fields

---

## Response Schema Categories

### Category 1: Status Response

**Shape:** `{ success: boolean }` or `{ status: boolean }`

**Methods:**
- `signOut`
- `deleteUser`
- `revokeSession`, `revokeOtherSessions`, `revokeSessions`
- `banUser`, `unbanUser`
- Various `delete*` operations

**Schema:**
```typescript
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Status response indicating operation success.",
  })
) {}
```

---

### Category 2: User Response

**Shape:** `{ user: DomainUser }`

**Methods:**
- `updateUser`
- `admin.createUser`
- `admin.updateUser`

**Schema:**
```typescript
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Response containing the updated/created user.",
  })
) {}
```

---

### Category 3: Session + User Response

**Shape:** `{ session: Session, user: User }`

**Methods:**
- `signIn.*`
- `signUp.*`
- Session mutation operations

**Note:** Varies by operation - some include token, redirect, etc.

---

### Category 4: Array Response

**Shape:** `Array<Item>`

**Methods:**
- `listAccounts`
- `listSessions`
- `admin.listUsers`
- `admin.listUserSessions`
- `passkey.listUserPasskeys`
- `organization.listMembers`
- `organization.listRoles`
- `apiKey.list`

**Schema:**
```typescript
export const Success = S.Array(ItemSchema).annotations(
  $I.annotations("Success", {
    description: "List of [items].",
  })
);
```

---

## Method Categories by Pattern

### Standard Handlers (~50 methods)

Methods with payload that return object:
- `updateUser`, `revokeSession`, `linkSocial`, `unlinkAccount`
- All `admin.*` mutations
- All `passkey.*` operations
- All `phoneNumber.*` operations
- Most `organization.*` operations
- All `apiKey.*` operations

### No-Payload Handlers (~15 methods)

- `deleteUser`
- `revokeOtherSessions`, `revokeSessions`
- `listAccounts`
- `signOut`
- `admin.stopImpersonating`
- `organization.leave`

### Query-Wrapped Handlers (~10 methods)

- `admin.listUsers`
- `admin.listUserSessions`
- `organization.listMembers`
- `organization.listInvitations`
- `organization.listRoles`
- `organization.listTeams`

### Transform Handlers (~3 methods)

- `signUp.email` (password confirm, name combining)
- Complex forms only - avoid unless necessary

### Captcha Middleware (~6 methods)

- `signIn.email`
- `signIn.username`
- `signUp.email`
- `password.requestReset`
- Possibly `signIn.phoneNumber`

---

## Existing Internal Utilities

### Available in `@beep/iam-client/_internal`

| Export | Purpose |
|--------|---------|
| `wrapIamMethod` | Core factory for wrapping Better Auth calls |
| `IamError` | Error type for all IAM operations |
| `CaptchaMiddleware` | Middleware for captcha validation |
| `withCaptchaResponse` | Before hook for captcha |
| `formValuesAnnotation` | Annotation for form default values |
| `DomainUserFromBetterAuthUser` | User transform schema |
| `DomainSessionFromBetterAuthSession` | Session transform schema |
| `UserEmail`, `UserPassword`, `RememberMe` | Common field schemas |

---

## Layer.ts Patterns

### Single-Level Layer (Flat Category)

```typescript
import { Wrap } from "@beep/wrap";
import { MethodA } from "./method-a";
import { MethodB } from "./method-b";

export const Group = Wrap.WrapperGroup.make(
  MethodA.Wrapper,
  MethodB.Wrapper
);

export const layer = Group.toLayer({
  MethodA: MethodA.Handler,
  MethodB: MethodB.Handler,
});
```

### Nested Layer (Subcategories)

```typescript
import { Wrap } from "@beep/wrap";
import * as SubCategoryA from "./sub-category-a/layer";
import * as SubCategoryB from "./sub-category-b/layer";

// Merge subcategory groups
export const Group = SubCategoryA.Group.merge(SubCategoryB.Group);

export const layer = Group.toLayer({
  ...SubCategoryA.handlers,
  ...SubCategoryB.handlers,
});
```

---

## JSDoc Template Requirements

### contract.ts Header

```typescript
/**
 * @fileoverview
 * [Operation] contract schemas and wrapper for Better Auth integration.
 *
 * @module @beep/iam-client/[category]/[operation]/contract
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
```

### handler.ts Header

```typescript
/**
 * @fileoverview
 * [Operation] handler implementation using wrapIamMethod factory.
 *
 * @module @beep/iam-client/[category]/[operation]/handler
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
```

### Schema/Export JSDoc

```typescript
/**
 * [Description of the schema/export].
 *
 * @example
 * ```typescript
 * // Usage example
 * ```
 *
 * @category [Category]/[Operation]/[Schemas|Contracts|Handlers]
 * @since 0.1.0
 */
```

---

## Scope Reduction Estimates

| Optimization | Savings Per Method |
|--------------|-------------------|
| mod.ts boilerplate | 100% (copy) |
| index.ts boilerplate | 95% (only namespace varies) |
| Handler pattern templates | 80% (fill in method name) |
| JSDoc templates | 70% (fill in placeholders) |
| **Total estimated** | **~35% effort reduction** |

---

## Anti-Patterns to Avoid

1. **Don't create shared response schemas prematurely** - Only extract if 5+ methods share identical shape
2. **Don't over-abstract handler patterns** - The existing `wrapIamMethod` is sufficient
3. **Don't add captcha to non-public endpoints** - Only user-facing auth flows need captcha
4. **Don't use transforms unless necessary** - Simple payload → API mapping is preferred

---

## Next Steps

1. Create `method-implementation-guide.md` with per-method specifications
2. Update `HANDOFF_P1.md` with pattern references
3. Create boilerplate file generators (optional automation)
