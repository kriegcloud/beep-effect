# External API Integration Patterns

Patterns for creating typed Effect wrappers around external libraries and APIs.

## Table of Contents

- [Schema Verification Protocol](#schema-verification-protocol)
- [Response Shape Extraction](#response-shape-extraction)
- [Handler Pattern Selection](#handler-pattern-selection)
- [Common Type Mappings](#common-type-mappings)
- [Error Handling Patterns](#error-handling-patterns)

---

## Schema Verification Protocol

When wrapping external APIs with Effect schemas, ALWAYS verify response shapes against the source library. Never assume response structures.

### Step 1: Locate Source Code

Clone or access the external library's source code:

```bash
# Example: Clone Better Auth for verification
git clone https://github.com/better-auth/better-auth tmp/better-auth
```

Locate the relevant files:

| What You Need | Where to Look |
|---------------|---------------|
| Response shapes | Route/endpoint implementations |
| Usage examples | Test files |
| Method signatures | Client exports |
| Plugin methods | Plugin client files |

### Step 2: Extract Response Shapes

Find the return statements in route implementations:

```typescript
// Example: From routes/password.ts
export const passwordRoutes = {
  requestPasswordReset: async (ctx) => {
    // ... implementation
    return ctx.json({
      status: true,
      message: "Password reset email sent"  // <-- Extract ALL fields
    });
  }
};
```

### Step 3: Cross-Reference with Tests

Test files show expected response structures:

```typescript
// Example: From client/password.test.ts
expect(response.data).toEqual({
  status: true,
  message: expect.any(String)
});
```

### Step 4: Document Verification

Record source verification in your implementation:

```typescript
/**
 * Success schema for requestPasswordReset
 * @source tmp/better-auth/src/api/routes/password.ts:42
 * @verified 2026-01-15
 */
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  message: S.String,
}) {}
```

---

## Response Shape Extraction

### Reading Return Statements

Look for response construction patterns:

```typescript
// Pattern 1: ctx.json()
return ctx.json({ field: value });

// Pattern 2: Direct return
return { data: result, error: null };

// Pattern 3: Conditional returns (check all branches!)
if (success) {
  return ctx.json({ status: true, data: result });
} else {
  return ctx.json({ status: false, error: message });
}
```

### Handling Conditional Fields

When a field appears in some responses but not others:

```typescript
// Source has conditional field
return ctx.json({
  status: true,
  token: shouldIncludeToken ? token : null,  // <-- Nullable!
});

// Correct Effect Schema
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  token: S.NullOr(S.String),  // Use NullOr for nullable
}) {}
```

### Nested Object Extraction

For nested objects, trace through to get complete structure:

```typescript
// Source returns user object
return ctx.json({
  user: {
    id: user.id,
    email: user.email,
    name: user.name || null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,  // Date object
    updatedAt: user.updatedAt,
  }
});

// Complete Effect Schema (no S.Any!)
export class Success extends S.Class<Success>("Success")({
  user: S.Struct({
    id: S.String,
    email: S.String,
    name: S.NullOr(S.String),
    emailVerified: S.Boolean,
    createdAt: S.Date,  // Use S.Date for Date objects
    updatedAt: S.Date,
  }),
}) {}
```

---

## Handler Pattern Selection

### Factory Pattern

Use the handler factory when:
- Standard `{ data, error }` response shape
- No computed fields needed in payload
- Simple encode -> execute -> decode flow

```typescript
import { createHandler } from "../../_common/handler.factory.ts";

export const Handler = createHandler({
  domain: "auth",
  feature: "sign-in",
  execute: (encoded) => client.signIn(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

### Manual Handler

Use manual handlers when:
- Response shape differs from standard `{ data, error }`
- Payload requires computed fields
- Custom error transformation needed
- Multiple API calls in sequence

```typescript
export const Handler = Effect.fn("auth/sign-up/handler")(
  (payload: typeof Contract.Payload.Type) =>
    Effect.gen(function* () {
      // Manual encoding with computed fields
      const encoded = yield* S.encode(Contract.Payload)(payload);
      const apiPayload = {
        ...encoded,
        name: `${payload.firstName} ${payload.lastName}`,  // Computed!
      };

      const response = yield* Effect.tryPromise({
        try: () => client.signUp(apiPayload),
        catch: (error) => IamError.match(error, { domain: "auth" }),
      });

      if (response.error) {
        return yield* Effect.fail(
          IamError.new(response.error, "Sign-up failed", { domain: "auth" })
        );
      }

      client.$store.notify("$sessionSignal");
      return yield* S.decode(Contract.Success)(response.data);
    })
);
```

### Decision Matrix

| Condition | Pattern | Example |
|-----------|---------|---------|
| Standard `{ data, error }` response | Factory | sign-in/email |
| Computed payload fields | Manual | sign-up (name from firstName+lastName) |
| Non-standard response shape | Manual | get-session |
| No payload needed | Factory (no payloadSchema) | sign-out |
| Multiple API calls | Manual | sign-up -> verify -> sign-in |

---

## Common Type Mappings

### Date Handling

| Source Returns | Effect Schema | Example |
|----------------|---------------|---------|
| JavaScript `Date` object | `S.Date` | `createdAt: S.Date` |
| ISO 8601 string | `S.DateFromString` | `timestamp: S.DateFromString` |

**Most JS clients return Date objects**, not strings. Verify with the source!

### Nullable vs Optional

| Source Pattern | Effect Schema |
|----------------|---------------|
| `field: T \| null` | `S.NullOr(Schema)` |
| `field?: T` (may be omitted) | `S.optional(Schema)` |
| `field?: T \| null` | `S.optionalWith(Schema, { nullable: true })` |

### Common External API Patterns

```typescript
// Boolean status responses
{ status: boolean }
{ success: boolean }
{ ok: boolean }

// Data wrapper responses
{ data: T, error: null }
{ data: null, error: E }

// Paginated responses
{ items: T[], cursor: string | null, hasMore: boolean }

// Session responses
{ session: S | null, user: U | null }
```

---

## Error Handling Patterns

### Standard Error Wrapper

```typescript
import * as Effect from "effect/Effect";

export const callExternalAPI = <T>(
  apiCall: () => Promise<{ data: T | null; error: unknown }>,
  context: { domain: string; method: string }
) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: apiCall,
      catch: (error) => MyError.fromUnknown(error, context),
    });

    if (response.error) {
      return yield* Effect.fail(
        MyError.new(response.error, `${context.method} failed`, context)
      );
    }

    return response.data;
  });
```

### Rate Limit Handling

```typescript
// Check for rate limit response
if (response.status === 429) {
  return yield* Effect.fail(
    RateLimitError.new({
      retryAfter: response.headers.get("Retry-After"),
      domain: context.domain,
    })
  );
}
```

### Retry Patterns

```typescript
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

// Exponential backoff for transient failures
const retryPolicy = Schedule.exponential("100 millis").pipe(
  Schedule.compose(Schedule.recurs(3)),
  Schedule.jittered
);

export const callWithRetry = <T>(effect: Effect.Effect<T, TransientError>) =>
  effect.pipe(
    Effect.retry(retryPolicy),
    Effect.catchTag("TransientError", () => Effect.fail(new PermanentError()))
  );
```

---

## Verification Checklist

Before creating an Effect wrapper for an external API:

- [ ] **Source code cloned/accessible** for verification
- [ ] **All response shapes verified** from route implementations
- [ ] **Test files reviewed** for usage examples
- [ ] **Null vs undefined distinctions** documented
- [ ] **Date types verified** (Date object vs ISO string)
- [ ] **Error response shapes** documented
- [ ] **Rate limiting behavior** understood
- [ ] **Method naming conventions** documented

---

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Schema type selection guide
- [Handoff Standards](../../specs/HANDOFF_STANDARDS.md) - Multi-phase handoff requirements
- [IAM Client AGENTS.md](../../packages/iam/client/AGENTS.md) - Better Auth integration patterns
